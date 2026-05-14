import { dual } from "../../Function.js";
import { PipeInspectableProto, YieldableProto } from "../../internal/core.js";
import * as Predicate from "../../Predicate.js";
import { ChildProcessSpawner } from "./ChildProcessSpawner.js";
const TypeId = "~effect/unstable/process/ChildProcess";
// =============================================================================
// Constructors
// =============================================================================
const Proto = {
  ...PipeInspectableProto,
  ...YieldableProto,
  [TypeId]: TypeId,
  asEffect() {
    return ChildProcessSpawner.use(_ => _.spawn(this));
  }
};
/**
 * Check if a value is a `Command`.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isCommand = u => Predicate.hasProperty(u, TypeId);
/**
 * Check if a command is a `StandardCommand`.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isStandardCommand = command => command._tag === "StandardCommand";
/**
 * Check if a command is a `PipedCommand`.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isPipedCommand = command => command._tag === "PipedCommand";
const makeStandardCommand = (command, args, options) => Object.assign(Object.create(Proto), {
  _tag: "StandardCommand",
  command,
  args,
  options
});
const makePipedCommand = (left, right, options = {}) => Object.assign(Object.create(Proto), {
  _tag: "PipedCommand",
  left,
  right,
  options
});
/**
 * Create a command from a template literal, options + template, or array form.
 *
 * This function supports three calling conventions:
 * 1. Template literal: `make\`npm run build\``
 * 2. Options + template literal: `make({ cwd: "/app" })\`npm run build\``
 * 3. Array form: `make("npm", ["run", "build"], options?)`
 *
 * Template literals are not parsed until execution time, allowing parsing
 * errors to flow through Effect's error channel.
 *
 * @example
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 *
 * // Template literal form
 * const cmd1 = ChildProcess.make`echo "hello"`
 *
 * // With options
 * const cmd2 = ChildProcess.make({ cwd: "/tmp" })`ls -la`
 *
 * // Array form
 * const cmd3 = ChildProcess.make("git", ["status"])
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = function make(...args) {
  // Template literal form: make`command`
  if (isTemplateString(args[0])) {
    const [templates, ...expressions] = args;
    const tokens = parseTemplates(templates, expressions);
    return makeStandardCommand(tokens[0] ?? "", tokens.slice(1), {});
  }
  // Options form: make({ cwd: "/tmp" })`command`
  if (typeof args[0] === "object" && !Array.isArray(args[0]) && !isTemplateString(args[0])) {
    const options = args[0];
    return function (templates, ...expressions) {
      const tokens = parseTemplates(templates, expressions);
      return makeStandardCommand(tokens[0] ?? "", tokens.slice(1), options);
    };
  }
  // Standard form without arguments: make("command", options?)
  if (typeof args[0] === "string" && !Array.isArray(args[1])) {
    const [command, options = {}] = args;
    return makeStandardCommand(command, [], options);
  }
  // Standard form with arguments: make("command", ["arg1", "arg2"], options?)
  const [command, cmdArgs = [], options = {}] = args;
  return makeStandardCommand(command, cmdArgs, options);
};
/**
 * Pipe the output of one command to the input of another.
 *
 * By default, pipes `stdout` from the source to `stdin` of the destination.
 * Use the `options` parameter to customize which streams are connected.
 *
 * @example
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 *
 * // Pipe stdout (default)
 * const pipeline1 = ChildProcess.make`cat file.txt`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`grep pattern`)
 * )
 *
 * // Pipe stderr instead of stdout
 * const pipeline2 = ChildProcess.make`my-program`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`grep error`, { from: "stderr" })
 * )
 *
 * // Pipe combined stdout and stderr
 * const pipeline3 = ChildProcess.make`my-program`.pipe(
 *   ChildProcess.pipeTo(ChildProcess.make`tee output.log`, { from: "all" })
 * )
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const pipeTo = /*#__PURE__*/dual(args => isCommand(args[0]) && isCommand(args[1]), (self, that, options) => makePipedCommand(self, that, options ?? {}));
/**
 * Prefix a command with another command.
 *
 * For pipelines, only the leftmost command is prefixed.
 *
 * @example
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 *
 * const command = ChildProcess.make`echo "foo"`
 *
 * const prefixed = command.pipe(
 *   ChildProcess.prefix`time`
 * )
 *
 * // now prefixed will execute `time echo "foo"`
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const prefix = function prefix(...args) {
  if (isCommand(args[0]) && args.length > 1) {
    const [self, ...rest] = args;
    const prefixSpec = parsePrefixArgs(rest);
    return applyPrefix(self, prefixSpec);
  }
  const prefixSpec = parsePrefixArgs(args);
  return self => applyPrefix(self, prefixSpec);
};
const parsePrefixArgs = args => {
  if (isTemplateString(args[0])) {
    const [templates, ...expressions] = args;
    const tokens = parseTemplates(templates, expressions);
    return {
      command: tokens[0] ?? "",
      args: tokens.slice(1)
    };
  }
  const [command, cmdArgs = []] = args;
  return {
    command,
    args: cmdArgs
  };
};
const applyPrefix = (self, prefixSpec) => {
  switch (self._tag) {
    case "StandardCommand":
      {
        return makeStandardCommand(prefixSpec.command, [...prefixSpec.args, self.command, ...self.args], self.options);
      }
    case "PipedCommand":
      {
        return makePipedCommand(applyPrefix(self.left, prefixSpec), self.right, self.options);
      }
  }
};
/**
 * Set the current working directory for a command.
 *
 * For pipelines, applies to each command in the pipeline.
 *
 * @example
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 *
 * const cmd = ChildProcess.make`ls -la`.pipe(
 *   ChildProcess.setCwd("/tmp")
 * )
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const setCwd = /*#__PURE__*/dual(2, (self, cwd) => {
  switch (self._tag) {
    case "StandardCommand":
      {
        return makeStandardCommand(self.command, self.args, {
          ...self.options,
          cwd
        });
      }
    case "PipedCommand":
      {
        return makePipedCommand(setCwd(self.left, cwd), setCwd(self.right, cwd), self.options);
      }
  }
});
/**
 * Set environment variables for a command.
 *
 * For pipelines, applies to each command in the pipeline.
 *
 * @example
 * ```ts
 * import { ChildProcess } from "effect/unstable/process"
 *
 * const cmd = ChildProcess.make`node script.js`.pipe(
 *   ChildProcess.setEnv({ NODE_ENV: "test" })
 * )
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const setEnv = /*#__PURE__*/dual(2, (self, env) => {
  switch (self._tag) {
    case "StandardCommand":
      {
        const nextEnv = self.options.env === undefined ? env : {
          ...self.options.env,
          ...env
        };
        return makeStandardCommand(self.command, self.args, {
          ...self.options,
          env: nextEnv
        });
      }
    case "PipedCommand":
      {
        return makePipedCommand(setEnv(self.left, env), setEnv(self.right, env), self.options);
      }
  }
});
const isTemplateString = u => Array.isArray(u) && "raw" in u && Array.isArray(u.raw);
// =============================================================================
// Utilities
// =============================================================================
/**
 * Parse an fd name like "fd3" to its numeric index.
 * Returns undefined if the name is invalid.
 *
 * @since 4.0.0
 * @category Utilities
 */
export const parseFdName = name => {
  const match = /^fd(\d+)$/.exec(name);
  if (match === null) return undefined;
  const fd = parseInt(match[1], 10);
  return fd >= 3 ? fd : undefined;
};
/**
 * Create an fd name from its numeric index.
 *
 * @since 4.0.0
 * @category Utilities
 */
export const fdName = fd => `fd${fd}`;
// =============================================================================
// Template Parsing
// =============================================================================
const parseTemplates = (templates, expressions) => {
  let tokens = [];
  for (const [index, template] of templates.entries()) {
    tokens = parseTemplate(templates, expressions, tokens, template, index);
  }
  return tokens;
};
const parseTemplate = (templates, expressions, prevTokens, template, index) => {
  const rawTemplate = templates.raw[index];
  if (rawTemplate === undefined) {
    throw new Error(`Invalid backslash sequence: ${templates.raw[index]}`);
  }
  const {
    hasLeadingWhitespace,
    hasTrailingWhitespace,
    tokens
  } = splitByWhitespaces(template, rawTemplate);
  const nextTokens = concatTokens(prevTokens, tokens, hasLeadingWhitespace);
  if (index === expressions.length) {
    return nextTokens;
  }
  const expression = expressions[index];
  const expressionTokens = Array.isArray(expression) ? expression.map(expression => parseExpression(expression)) : [parseExpression(expression)];
  return concatTokens(nextTokens, expressionTokens, hasTrailingWhitespace);
};
/**
 * Convert valid expressions defined in a template string command (i.e. using
 * `${expression}` into strings.
 */
const parseExpression = expression => {
  const type = typeof expression;
  if (type === "string") {
    return expression; // Return strings directly
  }
  return String(expression); // Convert numbers to strings
};
const DELIMITERS = /*#__PURE__*/new Set([" ", "\t", "\r", "\n"]);
/**
 * Number of characters in backslash escape sequences: \0 \xXX or \uXXXX
 * \cX is allowed in RegExps but not in strings
 * Octal sequences are not allowed in strict mode
 */
const ESCAPE_LENGTH = {
  x: 3,
  u: 5
};
/**
 * Splits a template string by whitespace while also properly handling escape
 * sequences.
 *
 * As an example, let's review the following valid commands:
 *
 * ```ts
 * ChildProcess.exec`echo foo\n bar`
 * // We should run `["echo", "foo\n", "bar"]`
 *
 * ChildProcess.exec`echo foo
 *  bar`
 * // We should run `["echo", "foo", "bar]`
 * ```
 *
 * The problem is that when we evaluate the template string for both of the above
 * commands, we will end up with the same string "echo foo\n bar".
 *
 * What we really want is to include the escaped character in the arguments for
 * the first command, since it was written explicitly by the user.
 *
 * This is why also having access to the raw template string is useful - in a
 * template string, there are two representations of the same string:
 * 1. `template`     - The processed string (escape sequences are evaluated).
 * 2. `template.raw` - The raw string (escape sequences are literal).
 */
const splitByWhitespaces = (template, rawTemplate) => {
  if (rawTemplate.length === 0) {
    return {
      tokens: [],
      hasLeadingWhitespace: false,
      hasTrailingWhitespace: false
    };
  }
  const hasLeadingWhitespace = DELIMITERS.has(rawTemplate[0]);
  const tokens = [];
  // Given that escape sequences will have different lengths in the template
  // versus the raw template, we must maintain two indices:
  // - One for the index into the template string
  // - One for the index into the raw template string
  // We also maintain the current cursor position for where we are in the template
  let templateCursor = 0;
  for (let templateIndex = 0, rawIndex = 0; templateIndex < template.length; templateIndex += 1, rawIndex += 1) {
    // Use the raw template character to check for actual whitespace
    const rawCharacter = rawTemplate[rawIndex];
    if (DELIMITERS.has(rawCharacter)) {
      // Whitespace found, extract token from template if necessary
      if (templateCursor !== templateIndex) {
        tokens.push(template.slice(templateCursor, templateIndex));
      }
      // Advance the template start index to the current position
      templateCursor = templateIndex + 1;
    } else if (rawCharacter === "\\") {
      // Escape sequence detected, check the next raw character
      const nextRawCharacter = rawTemplate[rawIndex + 1];
      if (nextRawCharacter === "\n") {
        // Handle `\` character followed by a newline (i.e. a line continuation) by:
        // - Reversing the template index (backslash-newline is erased in template)
        // - Advancing the raw template index past the line continuation
        templateIndex -= 1;
        rawIndex += 1;
      } else if (nextRawCharacter === "u" && rawTemplate[rawIndex + 2] === "{") {
        // Handle variable-length unicode escape sequences (i.e. `\u{1F600}`) by:
        // - Advancing the raw template index past the unicode escape sequence
        rawIndex = rawTemplate.indexOf("}", rawIndex + 3);
      } else {
        // Advance raw template index past fixed-length escape sequences:
        // - \n    → 2 chars (backslash + n)
        // - \t    → 2 chars (backslash + t)
        // - \xHH  → 4 chars (backslash + x + H + H)
        // - \uHHHH → 6 chars (backslash + u + H + H + H + H)
        rawIndex += ESCAPE_LENGTH[nextRawCharacter] ?? 1;
      }
    }
  }
  // Trailing whitespace only exists if the template cursor is equivalent to the
  // length of the template
  const hasTrailingWhitespace = templateCursor === template.length;
  // If we did not end with trailing whitespace, ensure the final token is added
  if (!hasTrailingWhitespace) {
    tokens.push(template.slice(templateCursor));
  }
  return {
    tokens,
    hasLeadingWhitespace,
    hasTrailingWhitespace
  };
};
/**
 * Concatenates two separate sets of string tokens together.
 *
 * If either set is empty or `isSeparated=false`, the last element of `prevTokens`
 * and the first element of `nextTokens` will be joined into a single token.
 */
const concatTokens = (prevTokens, nextTokens, isSeparated) => isSeparated || prevTokens.length === 0 || nextTokens.length === 0
// Keep the previous and next tokens separate from one another
? [...prevTokens, ...nextTokens]
// Join the last token from the previous set and the first token from the next set
: [...prevTokens.slice(0, -1), `${prevTokens.at(-1)}${nextTokens.at(0)}`, ...nextTokens.slice(1)];
//# sourceMappingURL=ChildProcess.js.map