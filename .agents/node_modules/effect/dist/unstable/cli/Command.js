import * as Console from "../../Console.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as References from "../../References.js";
import * as Result from "../../Result.js";
import * as Stdio from "../../Stdio.js";
import * as Terminal from "../../Terminal.js";
import * as CliError from "./CliError.js";
import * as CliOutput from "./CliOutput.js";
import * as GlobalFlag from "./GlobalFlag.js";
import { checkForDuplicateFlags, makeCommand, makeParser, toImpl, TypeId } from "./internal/command.js";
import { mergeConfig, parseConfig } from "./internal/config.js";
import { getGlobalFlagsForCommandPath, getGlobalFlagsForCommandTree, getHelpForCommandPath } from "./internal/help.js";
import * as Lexer from "./internal/lexer.js";
import * as Parser from "./internal/parser.js";
import * as Param from "./Param.js";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isCommand = u => Predicate.hasProperty(u, TypeId);
/* ========================================================================== */
/* Constructors                                                               */
/* ========================================================================== */
/**
 * Creates a Command from a name, optional config, optional handler function, and optional description.
 *
 * The make function is the primary constructor for CLI commands. It provides multiple overloads
 * to support different patterns of command creation, from simple commands with no configuration
 * to complex commands with nested configurations and error handling.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Argument, Command, Flag } from "effect/unstable/cli"
 *
 * // Simple command with no configuration
 * const version = Command.make("version")
 *
 * // Command with simple flags
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * })
 *
 * // Command with nested configuration
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env").pipe(
 *     Flag.withDescription("Target environment")
 *   ),
 *   server: {
 *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
 *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
 *   },
 *   files: Argument.string("files").pipe(Argument.variadic),
 *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
 * })
 *
 * // Command with handler
 * const deployWithHandler = Command.make("deploy", {
 *   environment: Flag.string("env"),
 *   force: Flag.boolean("force")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Starting deployment to ${config.environment}`)
 *
 *     if (!config.force && config.environment === "production") {
 *       return yield* Effect.fail("Production deployments require --force flag")
 *     }
 *
 *     yield* Console.log("Deployment completed successfully")
 *   }))
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = (name, config, handler) => {
  const parsedConfig = parseConfig(config ?? {});
  return makeCommand({
    name,
    config: parsedConfig,
    ...(Predicate.isNotUndefined(handler) ? {
      handle: handler
    } : {})
  });
};
/* ========================================================================== */
/* Combinators                                                                */
/* ========================================================================== */
/**
 * Adds or replaces the handler for a command.
 *
 * @example
 * ```ts
 * import { Console } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Command without initial handler
 * const greet = Command.make("greet", {
 *   name: Flag.string("name")
 * })
 *
 * // Add handler later
 * const greetWithHandler = greet.pipe(
 *   Command.withHandler((config: { readonly name: string }) =>
 *     Console.log(`Hello, ${config.name}!`)
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withHandler = /*#__PURE__*/dual(2, (self, handler) => makeCommand({
  ...toImpl(self),
  handle: handler
}));
const normalizeSubcommandEntries = entries => {
  const flat = [];
  const grouped = new Map();
  const addToGroup = (group, command) => {
    flat.push(command);
    const existing = grouped.get(group);
    if (existing) {
      existing.push(command);
    } else {
      grouped.set(group, [command]);
    }
  };
  for (const entry of entries) {
    if (isCommand(entry)) {
      addToGroup(undefined, entry);
      continue;
    }
    for (const command of entry.commands) {
      addToGroup(entry.group, command);
    }
  }
  const groups = [];
  const ungroupedCommands = grouped.get(undefined);
  if (ungroupedCommands && ungroupedCommands.length > 0) {
    groups.push({
      group: undefined,
      commands: ungroupedCommands
    });
  }
  for (const [group, commands] of grouped) {
    if (group === undefined) {
      continue;
    }
    groups.push({
      group,
      commands
    });
  }
  return {
    flat,
    groups
  };
};
/**
 * Adds subcommands to a command, creating a hierarchical command structure.
 *
 * Subcommands can access their parent's parsed configuration by yielding the parent
 * command within their handler. This enables shared parent flags that affect
 * all subcommands.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Parent command with shared flags
 * const git = Command.make("git").pipe(
 *   Command.withSharedFlags({
 *     verbose: Flag.boolean("verbose")
 *   })
 * )
 *
 * // Subcommand that accesses parent config
 * const clone = Command.make("clone", {
 *   repository: Flag.string("repo")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const parent = yield* git // Access parent's parsed config
 *     if (parent.verbose) {
 *       yield* Console.log("Verbose mode enabled")
 *     }
 *     yield* Console.log(`Cloning ${config.repository}`)
 *   }))
 *
 * const app = git.pipe(Command.withSubcommands([clone]))
 * // Usage: git --verbose clone --repo github.com/foo/bar
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withSubcommands = /*#__PURE__*/dual(2, (self, subcommands) => {
  const normalized = normalizeSubcommandEntries(subcommands);
  checkForDuplicateFlags(self, normalized.flat);
  const impl = toImpl(self);
  const byName = new Map(normalized.flat.map(s => [s.name, toImpl(s)]));
  const SubcommandStateSymbol = Symbol("effect/cli/SubcommandState");
  const parse = Effect.fnUntraced(function* (raw) {
    if (Option.isNone(raw.subcommand)) {
      return yield* impl.parse(raw);
    }
    const sub = byName.get(raw.subcommand.value.name);
    if (!sub) {
      return yield* impl.parse(raw);
    }
    const context = yield* impl.parseContext(raw);
    const result = yield* sub.parse(raw.subcommand.value.parsedInput);
    return Object.assign({}, context, {
      [SubcommandStateSymbol]: {
        name: sub.name,
        result
      }
    });
  });
  const handle = Effect.fnUntraced(function* (input, path) {
    const internal = input;
    const selectedSubcommand = internal[SubcommandStateSymbol];
    if (selectedSubcommand) {
      const child = byName.get(selectedSubcommand.name);
      if (!child) {
        return yield* new CliError.ShowHelp({
          commandPath: path,
          errors: []
        });
      }
      return yield* child.handle(selectedSubcommand.result, [...path, child.name]).pipe(Effect.provideService(impl.service, input));
    }
    return yield* impl.handle(input, path);
  });
  return makeCommand({
    name: impl.name,
    config: impl.config,
    contextConfig: impl.contextConfig,
    description: impl.description,
    shortDescription: impl.shortDescription,
    alias: impl.alias,
    annotations: impl.annotations,
    globalFlags: impl.globalFlags,
    examples: impl.examples,
    service: impl.service,
    subcommands: normalized.groups,
    parse,
    parseContext: impl.parseContext,
    handle
  });
});
/**
 * Adds flags that are inherited by subcommands.
 *
 * Shared flags are available to this command's handler and to descendant
 * handlers via `yield* parentCommand`. Shared flags are accepted both before
 * and after a selected subcommand name (npm-style).
 *
 * @since 4.0.0
 * @category combinators
 */
export const withSharedFlags = /*#__PURE__*/dual(2, (self, sharedFlags) => {
  const impl = toImpl(self);
  const sharedConfig = parseConfig(sharedFlags);
  const mergedConfig = mergeConfig(impl.config, sharedConfig);
  const mergedContextConfig = mergeConfig(impl.contextConfig, sharedConfig);
  if (impl.subcommands.length > 0) {
    const flatSubcommands = impl.subcommands.flatMap(group => group.commands);
    checkForDuplicateFlags(self, flatSubcommands, {
      contextConfig: mergedContextConfig
    });
  }
  const parseShared = makeParser(sharedConfig);
  const parse = Effect.fnUntraced(function* (raw) {
    const base = yield* impl.parse(raw);
    const shared = yield* parseShared(raw);
    return Object.assign({}, base, shared);
  });
  const parseContext = Effect.fnUntraced(function* (raw) {
    const base = yield* impl.parseContext(raw);
    const shared = yield* parseShared(raw);
    return Object.assign({}, base, shared);
  });
  const handle = (input, commandPath) => impl.handle(input, commandPath);
  return makeCommand({
    name: impl.name,
    config: mergedConfig,
    contextConfig: mergedContextConfig,
    description: impl.description,
    shortDescription: impl.shortDescription,
    alias: impl.alias,
    annotations: impl.annotations,
    globalFlags: impl.globalFlags,
    examples: impl.examples,
    service: impl.service,
    subcommands: impl.subcommands,
    parse,
    parseContext,
    handle
  });
});
/**
 * Declares global flags for a command scope.
 *
 * Declared global flags apply to the command and all of its descendants.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withGlobalFlags = /*#__PURE__*/dual(2, (self, globalFlags) => {
  const impl = toImpl(self);
  const next = Array.from(new Set([...impl.globalFlags, ...globalFlags]));
  return makeCommand({
    ...impl,
    globalFlags: next
  });
});
/**
 * Sets the description for a command.
 *
 * Descriptions provide users with information about what the command does
 * when they view help documentation.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Deploying to ${config.environment}`)
 *   })).pipe(
 *     Command.withDescription("Deploy the application to a specified environment")
 *   )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withDescription = /*#__PURE__*/dual(2, (self, description) => makeCommand({
  ...toImpl(self),
  description
}));
/**
 * Sets a short description for a command.
 *
 * Short descriptions are used when listing subcommands in help output and
 * shell completions. If no short description is provided, the full
 * `description` is used as a fallback.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withShortDescription = /*#__PURE__*/dual(2, (self, shortDescription) => makeCommand({
  ...toImpl(self),
  shortDescription
}));
/**
 * Sets an alias for a command.
 *
 * Aliases are accepted as alternate subcommand names during parsing and are
 * shown in help output as `name, alias`.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withAlias = /*#__PURE__*/dual(2, (self, alias) => makeCommand({
  ...toImpl(self),
  alias
}));
/**
 * Adds a custom annotation to a command.
 *
 * @since 4.0.0
 * @category combinators
 */
export const annotate = /*#__PURE__*/dual(3, (self, service, value) => {
  const impl = toImpl(self);
  return makeCommand({
    ...impl,
    annotations: Context.add(impl.annotations, service, value)
  });
});
/**
 * Merges a Context of annotations into a command.
 *
 * @since 4.0.0
 * @category combinators
 */
export const annotateMerge = /*#__PURE__*/dual(2, (self, annotations) => {
  const impl = toImpl(self);
  return makeCommand({
    ...impl,
    annotations: Context.merge(impl.annotations, annotations)
  });
});
/**
 * Sets usage examples for a command.
 *
 * Examples are exposed in structured `HelpDoc` data and rendered by the
 * default formatter in an `EXAMPLES` section.
 *
 * @example
 * ```ts
 * import { Command } from "effect/unstable/cli"
 *
 * const login = Command.make("login").pipe(
 *   Command.withExamples([
 *     { command: "myapp login", description: "Log in with browser OAuth" },
 *     { command: "myapp login --token sbp_abc123", description: "Log in with a token" }
 *   ])
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withExamples = /*#__PURE__*/dual(2, (self, examples) => makeCommand({
  ...toImpl(self),
  examples
}));
/* ========================================================================== */
/* Providing Services                                                         */
/* ========================================================================== */
// Internal helper: transforms a command's handler while preserving other properties
const mapHandler = (self, f) => {
  const impl = toImpl(self);
  return makeCommand({
    ...impl,
    handle: (input, path) => f(impl.handle(input, path), input)
  });
};
/**
 * Provides the handler of a command with the services produced by a layer
 * that optionally depends on the command-line input to be created.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem, PlatformError } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const deploy = Command.make("deploy", {
 *   env: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const fs = yield* FileSystem.FileSystem
 *     // Use fs...
 *   })).pipe(
 *     // Provide FileSystem based on the --env flag
 *     Command.provide((config) =>
 *       config.env === "local"
 *         ? FileSystem.layerNoop({})
 *         : FileSystem.layerNoop({
 *           access: () =>
 *             Effect.fail(
 *               PlatformError.badArgument({
 *                 module: "FileSystem",
 *                 method: "access"
 *               })
 *             )
 *         })
 *     )
 *   )
 * ```
 *
 * @since 4.0.0
 * @category providing services
 */
export const provide = /*#__PURE__*/dual(args => isCommand(args[0]), (self, layer, options) => mapHandler(self, (handler, input) => Effect.provide(handler, typeof layer === "function" ? layer(input) : layer, options)));
/**
 * Provides the handler of a command with the implementation of a service that
 * optionally depends on the command-line input to be constructed.
 *
 * @since 4.0.0
 * @category providing services
 */
export const provideSync = /*#__PURE__*/dual(3, (self, service, implementation) => mapHandler(self, (handler, input) => Effect.provideService(handler, service, typeof implementation === "function" ? implementation(input) : implementation)));
/**
 * Provides the handler of a command with the service produced by an effect
 * that optionally depends on the command-line input to be created.
 *
 * @since 4.0.0
 * @category providing services
 */
export const provideEffect = /*#__PURE__*/dual(3, (self, service, effect) => mapHandler(self, (handler, input) => Effect.provideServiceEffect(handler, service, typeof effect === "function" ? effect(input) : effect)));
/**
 * Allows for execution of an effect, which optionally depends on command-line
 * input to be created, prior to executing the handler of a command.
 *
 * @since 4.0.0
 * @category providing services
 */
export const provideEffectDiscard = /*#__PURE__*/dual(2, (self, effect) => mapHandler(self, (handler, input) => Effect.andThen(typeof effect === "function" ? effect(input) : effect, handler)));
/* ========================================================================== */
/* Execution                                                                  */
/* ========================================================================== */
const getOutOfScopeGlobalFlagErrors = (allFlags, activeFlags, flagMap, commandPath) => {
  const activeSet = new Set(activeFlags);
  const errors = [];
  const seen = new Set();
  for (const flag of allFlags) {
    if (activeSet.has(flag)) {
      continue;
    }
    const singles = Param.extractSingleParams(flag.flag);
    for (const single of singles) {
      const entries = flagMap[single.name];
      if (!entries || entries.length === 0) {
        continue;
      }
      const option = `--${single.name}`;
      if (seen.has(option)) {
        continue;
      }
      seen.add(option);
      errors.push(new CliError.UnrecognizedOption({
        option,
        suggestions: [],
        command: commandPath
      }));
    }
  }
  return errors;
};
const showHelp = (command, error) => Effect.gen(function* () {
  const formatter = yield* CliOutput.Formatter;
  const helpDoc = yield* getHelpForCommandPath(command, error.commandPath, GlobalFlag.BuiltIns);
  yield* Console.log(formatter.formatHelpDoc(helpDoc));
  if (error.errors.length > 0) {
    yield* Console.error(formatter.formatErrors(error.errors));
  }
});
/**
 * Runs a command with the provided input arguments.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greetCommand = Command.make("greet", {
 *   name: Flag.string("name")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Hello, ${config.name}!`)
 *   }))
 *
 * // Automatically gets args from the Stdio service
 * const program = Command.run(greetCommand, {
 *   version: "1.0.0"
 * })
 * ```
 *
 * @since 4.0.0
 * @category command execution
 */
export const run = /*#__PURE__*/dual(2, (command, config) => Stdio.Stdio.use(({
  args
}) => Effect.flatMap(args, args => runWith(command, config)(args))));
/**
 * Runs a command with explicitly provided arguments instead of using process.argv.
 *
 * This function is useful for testing CLI applications or when you want to
 * programmatically execute commands with specific arguments.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * }, (config) =>
 *   Effect.gen(function*() {
 *     for (let i = 0; i < config.count; i++) {
 *       yield* Console.log(`Hello, ${config.name}!`)
 *     }
 *   }))
 *
 * // Test with specific arguments
 * const testProgram = Effect.gen(function*() {
 *   const runCommand = Command.runWith(greet, { version: "1.0.0" })
 *
 *   // Test normal execution
 *   yield* runCommand(["--name", "Alice", "--count", "2"])
 *
 *   // Test help display
 *   yield* runCommand(["--help"])
 *
 *   // Test version display
 *   yield* runCommand(["--version"])
 * })
 * ```
 *
 * @since 4.0.0
 * @category command execution
 */
export const runWith = (command, config) => {
  const commandImpl = toImpl(command);
  return Effect.fnUntraced(function* (args) {
    const {
      tokens,
      trailingOperands
    } = Lexer.lex(args);
    // 1. Collect known global flags from the command tree
    const allFlags = getGlobalFlagsForCommandTree(command, GlobalFlag.BuiltIns);
    // 2. Extract global flag tokens
    const allFlagParams = allFlags.flatMap(f => Param.extractSingleParams(f.flag));
    const globalRegistry = Parser.createFlagRegistry(allFlagParams.filter(Param.isFlagParam));
    const {
      flagMap,
      remainder,
      errors: globalFlagErrors
    } = Parser.consumeKnownFlags(tokens, globalRegistry);
    const emptyArgs = {
      flags: flagMap,
      arguments: []
    };
    // 3. Parse command arguments from remaining tokens
    const parsedArgs = yield* Parser.parseArgs({
      tokens: remainder,
      trailingOperands
    }, command);
    const commandPath = [command.name, ...Parser.getCommandPath(parsedArgs)];
    const handlerCtx = {
      command,
      commandPath,
      version: config.version
    };
    const activeFlags = getGlobalFlagsForCommandPath(command, commandPath, GlobalFlag.BuiltIns);
    // 4. Reject globals that were passed outside the active command scope
    const outOfScopeErrors = getOutOfScopeGlobalFlagErrors(allFlags, activeFlags, flagMap, commandPath);
    if (outOfScopeErrors.length > 0 || globalFlagErrors.length > 0) {
      const parseErrors = parsedArgs.errors ?? [];
      return yield* new CliError.ShowHelp({
        commandPath,
        errors: [...globalFlagErrors, ...outOfScopeErrors, ...parseErrors]
      });
    }
    // 5. Process action flags — first present action wins, then exit
    for (const flag of activeFlags) {
      if (flag._tag !== "Action") continue;
      const singles = Param.extractSingleParams(flag.flag);
      const hasEntry = singles.some(s => {
        const entries = flagMap[s.name];
        return entries !== undefined && entries.length > 0;
      });
      if (!hasEntry) continue;
      const [, value] = yield* flag.flag.parse(emptyArgs);
      yield* flag.run(value, handlerCtx);
      return;
    }
    // 6. Handle parsing errors
    if (parsedArgs.errors && parsedArgs.errors.length > 0) {
      return yield* new CliError.ShowHelp({
        commandPath,
        errors: parsedArgs.errors
      });
    }
    const parseResult = yield* Effect.result(commandImpl.parse(parsedArgs));
    if (parseResult._tag === "Failure") {
      return yield* new CliError.ShowHelp({
        commandPath,
        errors: [parseResult.failure]
      });
    }
    // 7. Provide setting values
    let program = commandImpl.handle(parseResult.success, [command.name]);
    for (const flag of activeFlags) {
      if (flag._tag !== "Setting") continue;
      const [, value] = yield* flag.flag.parse(emptyArgs);
      program = Effect.provideService(program, flag, value);
    }
    const [, logLevel] = yield* GlobalFlag.LogLevel.flag.parse(emptyArgs);
    program = Effect.provideService(program, GlobalFlag.LogLevel, logLevel);
    // 8. Apply built-in setting behavior
    const services = Option.match(logLevel, {
      onNone: () => Context.empty(),
      onSome: level => Context.make(References.MinimumLogLevel, level)
    });
    // 9. Run command handler with composed context
    yield* Effect.provideContext(program, services);
  }, Effect.catchFilter(error => CliError.isCliError(error) && error._tag === "ShowHelp" ? Result.succeed(error) : Result.fail(error), error => Effect.andThen(showHelp(command, error), Effect.fail(error))), Effect.catchFilter(e => Terminal.isQuitError(e) ? Result.succeed(e) : Result.fail(e), _ => Effect.interrupt));
};
//# sourceMappingURL=Command.js.map