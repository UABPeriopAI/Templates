/**
 * Parsing Pipeline for CLI Commands
 * ==================================
 *
 * The parser transforms raw argv tokens into structured command input through
 * three main phases:
 *
 * 1. **Lexer** (external): Converts argv strings into typed tokens
 *    - LongOption: --name or --name=value
 *    - ShortOption: -n or -n=value (also handles -abc as three flags)
 *    - Value: positional arguments
 *
 * 2. **Built-in Extraction**: Peels off built-in flags (help/version/completions)
 *    before command-specific parsing begins.
 *
 * 3. **Command Parsing**: Recursively processes command levels:
 *    - Collects flags defined at this level
 *    - Detects subcommand from first value token
 *    - Forwards remaining tokens to child command
 *
 * Key Behaviors
 * -------------
 * - Inherited parent flags may appear before OR after the subcommand name (npm-style)
 * - Only the first Value token can open a subcommand
 * - Errors accumulate rather than throwing exceptions
 */
import * as Effect from "../../../Effect.js";
import * as Option from "../../../Option.js";
import * as CliError from "../CliError.js";
import * as Param from "../Param.js";
import * as Primitive from "../Primitive.js";
import { suggest } from "./auto-suggest.js";
import { toImpl } from "./command.js";
/* ========================================================================== */
/* Public API                                                                 */
/* ========================================================================== */
/** @internal */
export const getCommandPath = parsedInput => Option.match(parsedInput.subcommand, {
  onNone: () => [],
  onSome: subcommand => [subcommand.name, ...getCommandPath(subcommand.parsedInput)]
});
/** @internal */
export const parseArgs = (lexResult, command, commandPath = []) => Effect.gen(function* () {
  const {
    tokens,
    trailingOperands: afterEndOfOptions
  } = lexResult;
  const newCommandPath = [...commandPath, command.name];
  const commandImpl = toImpl(command);
  const singles = commandImpl.config.flags.flatMap(Param.extractSingleParams);
  const flagParams = singles.filter(Param.isFlagParam);
  const flagRegistry = createFlagRegistry(flagParams);
  const inheritedSingles = commandImpl.contextConfig.flags.flatMap(Param.extractSingleParams);
  const inheritedFlagParams = inheritedSingles.filter(Param.isFlagParam);
  const inheritedFlagRegistry = createFlagRegistry(inheritedFlagParams);
  const inheritedNames = new Set(inheritedFlagParams.map(param => param.name));
  const context = {
    command,
    commandPath: newCommandPath,
    flagRegistry,
    inheritedFlagRegistry,
    localFlagNames: flagParams.filter(param => !inheritedNames.has(param.name)).map(param => param.name)
  };
  const result = scanCommandLevel(tokens, context);
  if (result._tag === "Leaf") {
    return {
      flags: result.flags,
      arguments: [...result.arguments, ...afterEndOfOptions],
      subcommand: Option.none(),
      ...(result.errors.length > 0 && {
        errors: result.errors
      })
    };
  }
  const subLex = {
    tokens: result.childTokens,
    trailingOperands: []
  };
  const subParsed = yield* parseArgs(subLex, result.sub, newCommandPath);
  const allErrors = [...result.errors, ...(subParsed.errors ?? [])];
  return {
    flags: result.flags,
    arguments: afterEndOfOptions,
    subcommand: Option.some({
      name: result.sub.name,
      parsedInput: subParsed
    }),
    ...(allErrors.length > 0 && {
      errors: allErrors
    })
  };
});
const makeCursor = tokens => {
  let i = 0;
  return {
    peek: () => tokens[i],
    take: () => tokens[i++],
    rest: () => tokens.slice(i)
  };
};
/* ========================================================================== */
/* Flag Registry                                                              */
/* ========================================================================== */
/**
 * Creates a registry for O(1) flag lookup by name or alias.
 * @throws Error if duplicate names or aliases are detected (developer error)
 * @internal
 */
export const createFlagRegistry = params => {
  const index = new Map();
  for (const param of params) {
    if (index.has(param.name)) {
      throw new Error(`Duplicate flag name "${param.name}" in command definition`);
    }
    index.set(param.name, param);
    for (const alias of param.aliases) {
      if (index.has(alias)) {
        throw new Error(`Duplicate flag/alias "${alias}" in command definition (conflicts with "${index.get(alias).name}")`);
      }
      index.set(alias, param);
    }
  }
  return {
    params,
    index
  };
};
const buildSubcommandIndex = subcommands => {
  const index = new Map();
  const setKey = (key, command) => {
    const existing = index.get(key);
    if (existing && existing !== command) {
      throw new Error(`Duplicate subcommand name/alias "${key}" in command definition (conflicts with "${existing.name}")`);
    }
    index.set(key, command);
  };
  for (const group of subcommands) {
    for (const subcommand of group.commands) {
      setKey(subcommand.name, subcommand);
      if (subcommand.alias && subcommand.alias !== subcommand.name) {
        setKey(subcommand.alias, subcommand);
      }
    }
  }
  return index;
};
/* ========================================================================== */
/* Flag Accumulator                                                           */
/* ========================================================================== */
/** Creates an empty flag map with all known flag names initialized to [].
 * @internal
 */
export const createEmptyFlagMap = params => Object.fromEntries(params.map(p => [p.name, []]));
/**
 * Creates a mutable accumulator for collecting flag values.
 * Pre-initializes empty arrays for all known flags.
 */
const createFlagAccumulator = params => {
  const map = createEmptyFlagMap(params);
  return {
    add: (name, raw) => {
      if (raw !== undefined) map[name].push(raw);
    },
    merge: from => {
      for (const key in from) {
        const values = from[key];
        if (values?.length) {
          for (let i = 0; i < values.length; i++) {
            map[key].push(values[i]);
          }
        }
      }
    },
    snapshot: () => map
  };
};
const isFlagToken = t => t._tag === "LongOption" || t._tag === "ShortOption";
const getFlagName = t => t._tag === "LongOption" ? t.name : t.flag;
const resolveFlag = (token, registry) => {
  const tokenName = getFlagName(token);
  const direct = registry.index.get(tokenName);
  if (direct && direct.name === tokenName) {
    return {
      param: direct,
      negated: false
    };
  }
  if (token._tag === "LongOption" && token.name.startsWith("no-")) {
    const canonicalName = token.name.slice(3);
    const param = registry.index.get(canonicalName);
    if (param && param.name === canonicalName && Primitive.isBoolean(param.primitiveType)) {
      return {
        param,
        negated: true
      };
    }
  }
  if (direct) {
    return {
      param: direct,
      negated: false
    };
  }
  return undefined;
};
const invalidNegatedFlagValue = (token, spec, value) => new CliError.InvalidValue({
  option: spec.name,
  value,
  expected: `omit the value and use ${token.raw} by itself to set --${spec.name} to false`,
  kind: "flag"
});
/**
 * Checks if a token is a boolean literal value.
 * Recognizes: true/false, yes/no, on/off, 1/0
 */
const asBooleanLiteral = token => token?._tag === "Value" && (Primitive.isTrueValue(token.value) || Primitive.isFalseValue(token.value)) ? token.value : undefined;
/* ========================================================================== */
/* Flag Value Consumption                                                     */
/* ========================================================================== */
/**
 * Reads a flag's value from the token stream.
 *
 * Value resolution order:
 * 1. Inline value: --flag=value or -f=value
 * 2. Boolean special case: implicit "true" or explicit boolean literal
 * 3. Next token: consume following Value token if present
 */
const consumeFlagValue = (cursor, token, spec, negated = false) => {
  // Inline value has highest priority
  if (negated) {
    if (token.value !== undefined) {
      return {
        _tag: "Error",
        error: invalidNegatedFlagValue(token, spec, token.value)
      };
    }
    const literal = asBooleanLiteral(cursor.peek());
    if (literal !== undefined) {
      cursor.take();
      return {
        _tag: "Error",
        error: invalidNegatedFlagValue(token, spec, literal)
      };
    }
    return {
      _tag: "Value",
      value: "false"
    };
  }
  if (token.value !== undefined) {
    return {
      _tag: "Value",
      value: token.value
    };
  }
  // Boolean flags: check for explicit literal or default to "true"
  if (Primitive.isBoolean(spec.primitiveType)) {
    const literal = asBooleanLiteral(cursor.peek());
    if (literal !== undefined) cursor.take();
    return {
      _tag: "Value",
      value: literal ?? "true"
    };
  }
  // Non-boolean: try to consume next Value token
  const next = cursor.peek();
  if (next?._tag === "Value") {
    cursor.take();
    return {
      _tag: "Value",
      value: next.value
    };
  }
  return {
    _tag: "Value",
    value: undefined
  };
};
/**
 * Consumes known flags from a token stream.
 * Unrecognized tokens are passed through to remainder.
 * Used for both global flag extraction and npm-style parent flag collection.
 * @internal
 */
export const consumeKnownFlags = (tokens, registry) => {
  const flagMap = createEmptyFlagMap(registry.params);
  const remainder = [];
  const errors = [];
  const cursor = makeCursor(tokens);
  for (let t = cursor.take(); t; t = cursor.take()) {
    if (!isFlagToken(t)) {
      remainder.push(t);
      continue;
    }
    const resolved = resolveFlag(t, registry);
    if (!resolved) {
      remainder.push(t);
      continue;
    }
    const consumed = consumeFlagValue(cursor, t, resolved.param, resolved.negated);
    if (consumed._tag === "Error") {
      errors.push(consumed.error);
      continue;
    }
    if (consumed.value !== undefined) {
      flagMap[resolved.param.name].push(consumed.value);
    }
  }
  return {
    flagMap,
    remainder,
    errors
  };
};
/* ========================================================================== */
/* Error Creation                                                             */
/* ========================================================================== */
const createUnrecognizedFlagError = (token, params, commandPath) => {
  const printable = token._tag === "LongOption" ? `--${token.name}` : `-${token.flag}`;
  const validNames = [];
  for (const p of params) {
    validNames.push(p.name);
    if (Primitive.isBoolean(p.primitiveType)) {
      validNames.push(`no-${p.name}`);
    }
    for (const alias of p.aliases) {
      validNames.push(alias);
    }
  }
  const suggestions = suggest(getFlagName(token), validNames).map(n => n.length === 1 ? `-${n}` : `--${n}`);
  return new CliError.UnrecognizedOption({
    option: printable,
    suggestions,
    command: commandPath
  });
};
/* ========================================================================== */
/* Parse State                                                                */
/* ========================================================================== */
const createParseState = registry => ({
  flags: createFlagAccumulator(registry.params),
  arguments: [],
  errors: [],
  mode: {
    _tag: "AwaitingFirstValue"
  }
});
const toLeafResult = state => ({
  _tag: "Leaf",
  flags: state.flags.snapshot(),
  arguments: state.arguments,
  errors: state.errors
});
/* ========================================================================== */
/* First Value Resolution                                                     */
/* ========================================================================== */
/**
 * Determines how to handle the first value token.
 *
 * If it matches a known subcommand:
 * - Collect inherited parent flags from remaining tokens (npm-style)
 * - Return SubcommandResult with child tokens
 *
 * Otherwise:
 * - Return Argument to treat it as a positional argument
 * - Report error if command expects subcommand but got unknown value
 */
const resolveFirstValue = (value, cursor, context, state) => {
  const {
    command,
    commandPath,
    inheritedFlagRegistry,
    localFlagNames
  } = context;
  const subIndex = buildSubcommandIndex(command.subcommands);
  const sub = subIndex.get(value);
  if (sub) {
    const selectedPath = [...commandPath, sub.name];
    // Local flags are not inherited by subcommands.
    const parentFlags = state.flags.snapshot();
    for (const localFlagName of localFlagNames) {
      const values = parentFlags[localFlagName];
      if (values !== undefined && values.length > 0) {
        state.errors.push(new CliError.UnrecognizedOption({
          option: `--${localFlagName}`,
          suggestions: [],
          command: selectedPath
        }));
      }
    }
    // npm-style: inherited parent flags can appear after subcommand name
    const tail = consumeKnownFlags(cursor.rest(), inheritedFlagRegistry);
    state.flags.merge(tail.flagMap);
    state.errors.push(...tail.errors);
    return {
      _tag: "Subcommand",
      result: {
        _tag: "Sub",
        flags: state.flags.snapshot(),
        sub,
        childTokens: tail.remainder,
        errors: state.errors
      }
    };
  }
  // Not a subcommand. Check if this looks like a typo.
  const expectsArgs = toImpl(command).config.arguments.length > 0;
  if (!expectsArgs && subIndex.size > 0) {
    const suggestions = suggest(value, Array.from(subIndex.keys()));
    state.errors.push(new CliError.UnknownSubcommand({
      subcommand: value,
      parent: commandPath,
      suggestions
    }));
  }
  return {
    _tag: "Argument"
  };
};
/* ========================================================================== */
/* Token Processing                                                           */
/* ========================================================================== */
/**
 * Processes a flag token: looks up in registry, consumes value, records it.
 * Reports unrecognized flags as errors.
 */
const processFlag = (token, cursor, context, state) => {
  const {
    commandPath,
    flagRegistry
  } = context;
  const resolved = resolveFlag(token, flagRegistry);
  if (!resolved) {
    state.errors.push(createUnrecognizedFlagError(token, flagRegistry.params, commandPath));
    return;
  }
  const consumed = consumeFlagValue(cursor, token, resolved.param, resolved.negated);
  if (consumed._tag === "Error") {
    state.errors.push(consumed.error);
    return;
  }
  state.flags.add(resolved.param.name, consumed.value);
};
/**
 * Processes a value token based on current parsing mode.
 *
 * In AwaitingFirstValue mode:
 * - Check if value is a subcommand
 * - If so, return SubcommandResult to exit scanning
 * - If not, switch to CollectingArguments mode
 *
 * In CollectingArguments mode:
 * - Simply add value to arguments list
 */
const processValue = (value, cursor, context, state) => {
  if (state.mode._tag === "AwaitingFirstValue") {
    const result = resolveFirstValue(value, cursor, context, state);
    if (result._tag === "Subcommand") {
      return result.result;
    }
    state.mode = {
      _tag: "CollectingArguments"
    };
  }
  state.arguments.push(value);
  return undefined;
};
/* ========================================================================== */
/* Command Level Scanning                                                     */
/* ========================================================================== */
/**
 * Scans a single command level, processing all tokens.
 *
 * For each token:
 * - Flags: Look up, consume value, record in accumulator
 * - Values: Check for subcommand (first value only), then collect as arguments
 *
 * Returns LeafResult if no subcommand detected, SubcommandResult otherwise.
 */
const scanCommandLevel = (tokens, context) => {
  const cursor = makeCursor(tokens);
  const state = createParseState(context.flagRegistry);
  for (let token = cursor.take(); token; token = cursor.take()) {
    if (isFlagToken(token)) {
      processFlag(token, cursor, context, state);
      continue;
    }
    if (token._tag === "Value") {
      const subResult = processValue(token.value, cursor, context, state);
      if (subResult) return subResult;
    }
  }
  return toLeafResult(state);
};
//# sourceMappingURL=parser.js.map