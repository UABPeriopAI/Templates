/**
 * @internal
 *
 * Param is the polymorphic implementation shared by Argument.ts and Flag.ts.
 * The `Kind` type parameter ("argument" | "flag") enables type-safe separation
 * while sharing parsing logic and combinators.
 *
 * Users should import from `Argument` and `Flag` modules, not this module directly.
 * This module is not exported from the public API.
 *
 * @since 4.0.0
 */
import * as Config from "../../Config.js";
import * as Effect from "../../Effect.js";
import { dual, identity } from "../../Function.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Result from "../../Result.js";
import * as Schema from "../../Schema.js";
import * as CliError from "./CliError.js";
import * as Primitive from "./Primitive.js";
import * as Prompt from "./Prompt.js";
const TypeId = "~effect/cli/Param";
/**
 * Kind discriminator for positional argument parameters.
 *
 * @since 4.0.0
 * @category constants
 */
export const argumentKind = "argument";
/**
 * Kind discriminator for flag parameters.
 *
 * @since 4.0.0
 * @category constants
 */
export const flagKind = "flag";
const Proto = {
  [TypeId]: {
    _A: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Type guard to check if a value is a Param.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const maybeParam = Param.string(Param.flagKind, "name")
 *
 * if (Param.isParam(maybeParam)) {
 *   console.log("This is a Param")
 * }
 * ```
 *
 * @since 4.0.0
 * @category refinements
 */
export const isParam = u => Predicate.hasProperty(u, TypeId);
/**
 * Type guard to check if a param is a Single param (not composed).
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const nameParam = Param.string(Param.flagKind, "name")
 * const optionalParam = Param.optional(nameParam)
 *
 * console.log(Param.isSingle(nameParam)) // true
 * console.log(Param.isSingle(optionalParam)) // false
 * ```
 *
 * @since 4.0.0
 * @category refinements
 */
export const isSingle = param => Predicate.isTagged(param, "Single");
/**
 * Type guard to check if a Single param is a flag (not an argument).
 *
 * @internal
 */
export const isFlagParam = single => single.kind === "flag";
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeSingle = params => {
  const parse = args => params.kind === argumentKind ? parsePositional(params.name, params.primitiveType, args) : parseFlag(params.name, params.primitiveType, args);
  return Object.assign(Object.create(Proto), {
    _tag: "Single",
    ...params,
    description: params.description ?? Option.none(),
    aliases: params.aliases ?? [],
    parse
  });
};
/**
 * Creates a string parameter.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a string flag
 * const nameFlag = Param.string(Param.flagKind, "name")
 *
 * // Create a string argument
 * const fileArg = Param.string(Param.argumentKind, "file")
 *
 * // Usage in CLI: --name "John Doe" or as positional argument
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const string = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.string,
  kind
});
/**
 * Creates a boolean parameter.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a boolean flag
 * const verboseFlag = Param.boolean(Param.flagKind, "verbose")
 *
 * // Create a boolean argument
 * const enableArg = Param.boolean(Param.argumentKind, "enable")
 *
 * // Usage in CLI: --verbose (defaults to true when present, false when absent)
 * // or as positional: true/false
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const boolean = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.boolean,
  kind
});
/**
 * Creates an integer parameter.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create an integer flag
 * const portFlag = Param.integer(Param.flagKind, "port")
 *
 * // Create an integer argument
 * const countArg = Param.integer(Param.argumentKind, "count")
 *
 * // Usage in CLI: --port 8080 or as positional argument: 42
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const integer = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.integer,
  kind
});
/**
 * Creates a floating-point number parameter.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a float flag
 * const rateFlag = Param.float(Param.flagKind, "rate")
 *
 * // Create a float argument
 * const thresholdArg = Param.float(Param.argumentKind, "threshold")
 *
 * // Usage in CLI: --rate 0.95 or as positional argument: 3.14159
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const float = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.float,
  kind
});
/**
 * Creates a date parameter that parses ISO date strings.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a date flag
 * const startFlag = Param.date(Param.flagKind, "start-date")
 *
 * // Create a date argument
 * const dueDateArg = Param.date(Param.argumentKind, "due-date")
 *
 * // Usage in CLI: --start-date "2023-12-25" or as positional: "2023-01-01"
 * // Parses to JavaScript Date object
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const date = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.date,
  kind
});
/**
 * Constructs command-line params that represent a choice between several
 * inputs. The input will be mapped to it's associated value during parsing.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * type Animal = Dog | Cat
 *
 * interface Dog {
 *   readonly _tag: "Dog"
 * }
 *
 * interface Cat {
 *   readonly _tag: "Cat"
 * }
 *
 * const animal = Param.choiceWithValue(Param.flagKind, "animal", [
 *   ["dog", { _tag: "Dog" }],
 *   ["cat", { _tag: "Cat" }]
 * ])
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const choiceWithValue = (kind, name, choices) => makeSingle({
  name,
  primitiveType: Primitive.choice(choices),
  kind
});
/**
 * Constructs command-line params that represent a choice between several
 * string inputs.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const logLevel = Param.choice(Param.flagKind, "log-level", [
 *   "debug",
 *   "info",
 *   "warn",
 *   "error"
 * ])
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const choice = (kind, name, choices) => {
  const mappedChoices = choices.map(value => [value, value]);
  return choiceWithValue(kind, name, mappedChoices);
};
/**
 * Creates a path parameter that accepts file or directory paths.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Basic path parameter
 * const outputPath = Param.path(Param.flagKind, "output")
 *
 * // Path that must exist
 * const inputPath = Param.path(Param.flagKind, "input", { mustExist: true })
 *
 * // File-only path
 * const configFile = Param.path(Param.flagKind, "config", {
 *   pathType: "file",
 *   mustExist: true,
 *   typeName: "config-file"
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const path = (kind, name, options) => makeSingle({
  name,
  kind,
  primitiveType: Primitive.path(options?.pathType ?? "either", options?.mustExist),
  typeName: options?.typeName
});
/**
 * Creates a directory path parameter.
 *
 * This is a convenience function that creates a path parameter with the
 * `pathType` set to `"directory"` and a default type name of `"directory"`.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Basic directory parameter
 * const outputDir = Param.directory(Param.flagKind, "output-dir")
 *
 * // Directory that must exist
 * const sourceDir = Param.directory(Param.flagKind, "source", { mustExist: true })
 *
 * // Usage: --output-dir /path/to/dir --source /existing/dir
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const directory = (kind, name, options) => path(kind, name, {
  pathType: "directory",
  typeName: "directory",
  mustExist: options?.mustExist
});
/**
 * Creates a file path parameter.
 *
 * This is a convenience function that creates a path parameter with a
 * `pathType` set to `"file"` and a default type name of `"file"`.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Basic file parameter
 * const outputFile = Param.file(Param.flagKind, "output")
 *
 * // File that must exist
 * const inputFile = Param.file(Param.flagKind, "input", { mustExist: true })
 *
 * // Usage: --output result.txt --input existing-file.txt
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const file = (kind, name, options) => path(kind, name, {
  pathType: "file",
  typeName: "file",
  mustExist: options?.mustExist
});
/**
 * Creates a redacted parameter for sensitive data like passwords.
 * The value is masked in help output and logging.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a password parameter
 * const password = Param.redacted(Param.flagKind, "password")
 *
 * // Create an API key argument
 * const apiKey = Param.redacted(Param.argumentKind, "api-key")
 *
 * // Usage: --password (value will be hidden in help/logs)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const redacted = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.redacted,
  kind
});
/**
 * Creates a parameter that reads and returns file content as a string.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Read a config file as string
 * const configContent = Param.fileText(Param.flagKind, "config")
 *
 * // Read a template file as argument
 * const templateContent = Param.fileText(Param.argumentKind, "template")
 *
 * // Usage: --config config.txt (reads file content into string)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileText = (kind, name) => makeSingle({
  name,
  primitiveType: Primitive.fileText,
  kind
});
/**
 * Creates a param that reads and parses the content of the specified file.
 *
 * The parser that is utilized will depend on the specified `format`, or the
 * extension of the file passed on the command-line if no `format` is specified.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Will use the extension of the file passed on the command line to determine
 * // the parser to use
 * const config = Param.fileParse(Param.flagKind, "config")
 *
 * // Will use the JSON parser
 * const jsonConfig = Param.fileParse(Param.flagKind, "json-config", {
 *   format: "json"
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileParse = (kind, name, options) => makeSingle({
  name,
  primitiveType: Primitive.fileParse(options),
  kind
});
/**
 * Creates a parameter that reads and validates file content using a schema.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import * as Param from "effect/unstable/cli/Param"
 * // @internal - this module is not exported publicly
 *
 * // Parse JSON config file
 * const configSchema = Schema.Struct({
 *   port: Schema.Number,
 *   host: Schema.String
 * })
 *
 * const config = Param.fileSchema(Param.flagKind, "config", configSchema, {
 *   format: "json"
 * })
 *
 * // Parse YAML file
 * const yamlConfig = Param.fileSchema(Param.flagKind, "config", configSchema, {
 *   format: "yaml"
 * })
 *
 * // Usage: --config config.json (reads and validates file content)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileSchema = (kind, name, schema, options) => makeSingle({
  name,
  primitiveType: Primitive.fileSchema(schema, options),
  kind
});
/**
 * Creates a param that parses key=value pairs.
 * Useful for options that accept configuration values.
 *
 * Note: Requires at least one key=value pair. The parsed pairs are merged
 * into a single record object.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const env = Param.keyValuePair(Param.flagKind, "env")
 * // --env FOO=bar --env BAZ=qux will parse to { FOO: "bar", BAZ: "qux" }
 *
 * const props = Param.keyValuePair(Param.flagKind, "property")
 * // --property name=value --property debug=true
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const keyValuePair = (kind, name) => map(variadic(makeSingle({
  name,
  primitiveType: Primitive.keyValuePair,
  kind
}), {
  min: 1
}), objects => Object.assign({}, ...objects));
/**
 * Creates an empty sentinel parameter that always fails to parse.
 *
 * This is useful for creating placeholder parameters or for combinators.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Create a none parameter for composition
 * const noneParam = Param.none(Param.flagKind)
 *
 * // Often used in conditional parameter creation
 * const conditionalParam = process.env.NODE_ENV === "production"
 *   ? Param.string(Param.flagKind, "my-dev-flag")
 *   : Param.none(Param.flagKind)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const none = kind => makeSingle({
  name: "__none__",
  primitiveType: Primitive.none,
  kind
});
const FLAG_DASH_REGEXP = /^-+/;
/**
 * Adds an alias to an option.
 *
 * Aliases allow params to be specified with alternative names,
 * typically single-character shortcuts like "-f" for "--force".
 *
 * This works on any param structure by recursively finding the underlying
 * `Single` node and applying the alias there.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const force = Param.boolean(Param.flagKind, "force").pipe(
 *   Param.withAlias("-f"),
 *   Param.withAlias("-F")
 * )
 *
 * // Also works on composed params:
 * const count = Param.integer(Param.flagKind, "count").pipe(
 *   Param.optional,
 *   Param.withAlias("-c") // finds the underlying Single and adds alias
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withAlias = /*#__PURE__*/dual(2, (self, alias) => {
  return transformSingle(self, single => makeSingle({
    ...single,
    aliases: [...single.aliases, alias.replace(FLAG_DASH_REGEXP, "")]
  }));
});
/**
 * Adds a description to an option for help text.
 *
 * Descriptions provide users with information about what the option does
 * when they view help documentation.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const verbose = Param.boolean(Param.flagKind, "verbose").pipe(
 *   Param.withAlias("-v"),
 *   Param.withDescription("Enable verbose output")
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withDescription = /*#__PURE__*/dual(2, (self, description) => {
  return transformSingle(self, single => makeSingle({
    ...single,
    description: Option.some(description)
  }));
});
/**
 * Transforms the parsed value of an option using a mapping function.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const port = Param.integer(Param.flagKind, "port").pipe(
 *   Param.map((n) => ({ port: n, url: `http://localhost:${n}` }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const map = /*#__PURE__*/dual(2, (self, f) => {
  const parse = args => Effect.map(self.parse(args), ([operands, value]) => [operands, f(value)]);
  return Object.assign(Object.create(Proto), {
    _tag: "Map",
    kind: self.kind,
    param: self,
    f,
    parse
  });
});
const transform = (self, f) => Object.assign(Object.create(Proto), {
  _tag: "Transform",
  kind: self.kind,
  param: self,
  f,
  parse: f(self.parse)
});
/**
 * Transforms the parsed value of an option using an effectful mapping function.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const validatedEmail = Param.string(Param.flagKind, "email").pipe(
 *   Param.mapEffect((email) =>
 *     email.includes("@")
 *       ? Effect.succeed(email)
 *       : Effect.fail(
 *         new CliError.InvalidValue({
 *           option: "email",
 *           value: email,
 *           expected: "valid email format",
 *           kind: "flag"
 *         })
 *       )
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const mapEffect = /*#__PURE__*/dual(2, (self, f) => transform(self, parse => args => Effect.flatMap(parse(args), ([leftover, a]) => f(a).pipe(Effect.map(b => [leftover, b])))));
/**
 * Transforms the parsed value of an option using a function that may throw,
 * converting any thrown errors into failure messages.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const parsedJson = Param.string(Param.flagKind, "config").pipe(
 *   Param.mapTryCatch(
 *     (str) => JSON.parse(str),
 *     (error) =>
 *       `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const mapTryCatch = /*#__PURE__*/dual(3, (self, f, onError) => {
  const single = getUnderlyingSingleOrThrow(self);
  return transform(self, parse => args => Effect.flatMap(parse(args), ([leftover, a]) => Effect.try({
    try: () => f(a),
    catch: error => onError(error)
  }).pipe(Effect.mapError(error => new CliError.InvalidValue({
    option: single.name,
    value: String(a),
    expected: error,
    kind: single.kind
  })), Effect.map(b => [leftover, b]))));
});
/**
 * Creates an optional option that returns None when not provided.
 *
 * Optional options never fail with MissingOption errors. If the option is not
 * provided on the command line, Option.none() is returned instead.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // Create an optional port option
 * // - When not provided: returns Option.none()
 * // - When provided: returns Option.some(parsedValue)
 * const port = Param.optional(Param.integer(Param.flagKind, "port"))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const optional = param => {
  const parse = Effect.fnUntraced(function* (args) {
    const single = getUnderlyingSingleOrThrow(param);
    // Handle boolean params that are explicitly marked as optional (i.e. the
    // end user wants to return `Option.none()` instead of `false` when the
    // flag (or its negated variant) are not present on the command line
    if (isFlagParam(single) && Primitive.isBoolean(single.primitiveType) && ![single.name, ...single.aliases].some(name => (args.flags[name] ?? []).length > 0)) {
      return [args.arguments, Option.none()];
    }
    return yield* param.parse(args).pipe(Effect.map(([leftover, value]) => [leftover, Option.some(value)]),
    // Catch both MissingOption (for flags) and MissingArgument (for positional arguments)
    Effect.catchTags({
      MissingOption: () => Effect.succeed([args.arguments, Option.none()]),
      MissingArgument: () => Effect.succeed([args.arguments, Option.none()])
    }));
  });
  return Object.assign(Object.create(Proto), {
    _tag: "Optional",
    kind: param.kind,
    param,
    parse
  });
};
/**
 * Makes an option optional by providing a default value.
 *
 * This combinator is useful when you want to make an existing option optional
 * by providing a fallback value that will be used when the option is not
 * provided on the command line.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Using the pipe operator to make an option optional
 * const port = Param.integer(Param.flagKind, "port").pipe(
 *   Param.withDefault(8080)
 * )
 *
 * // Can also be used with other combinators
 * const verbose = Param.boolean(Param.flagKind, "verbose").pipe(
 *   Param.withAlias("-v"),
 *   Param.withDescription("Enable verbose output"),
 *   Param.withDefault(false)
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withDefault = /*#__PURE__*/dual(2, (self, defaultValue) => {
  if (!Effect.isEffect(defaultValue)) {
    return map(optional(self), Option.getOrElse(() => defaultValue));
  }
  return mapEffect(optional(self), Option.match({
    onNone: () => defaultValue,
    onSome: Effect.succeed
  }));
});
/**
 * Adds a fallback config that is loaded when a required parameter is missing.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withFallbackConfig = /*#__PURE__*/dual(2, (self, config) => {
  const toInvalidValue = (error, configError) => new CliError.InvalidValue({
    option: error._tag === "MissingOption" ? error.option : error.argument,
    value: "config",
    expected: configError.message,
    kind: error._tag === "MissingOption" ? "flag" : "argument"
  });
  const runConfig = (error, args) => Config.option(config).asEffect().pipe(Effect.mapError(configError => toInvalidValue(error, configError)), Effect.flatMap(Option.match({
    onNone: () => Effect.fail(error),
    onSome: value => Effect.succeed([args.arguments, value])
  })));
  return transform(self, parse => args => parse(args).pipe(Effect.catchTag(["MissingOption", "MissingArgument"], error => runConfig(error, args))));
});
/**
 * Adds a fallback prompt that is shown when a required parameter is missing.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withFallbackPrompt = /*#__PURE__*/dual(2, (self, prompt) => {
  const runPrompt = (error, args) => Effect.flatMap(Prompt.isPrompt(prompt) ? Effect.succeed(prompt) : prompt, Prompt.run).pipe(Effect.map(value => [args.arguments, value]), Effect.catchTag("QuitError", () => Effect.fail(error)));
  return transform(self, parse => args => parse(args).pipe(Effect.catchTag(["MissingOption", "MissingArgument"], error => runPrompt(error, args))));
});
/**
 * Creates a variadic parameter that can be specified multiple times.
 *
 * This is the base combinator for creating parameters that accept multiple values.
 * The min and max parameters are optional - if not provided, the parameter can be
 * specified any number of times (0 to infinity).
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Basic variadic parameter (0 to infinity)
 * const tags = Param.variadic(Param.string(Param.flagKind, "tag"))
 *
 * // Variadic with minimum count
 * const inputs = Param.variadic(
 *   Param.string(Param.flagKind, "input"),
 *   { min: 1 } // at least 1 required
 * )
 *
 * // Variadic with both min and max
 * const limited = Param.variadic(Param.string(Param.flagKind, "item"), {
 *   min: 2, // at least 2 times
 *   max: 2 // at most 5 times
 * })
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const variadic = (self, options) => {
  const single = getUnderlyingSingleOrThrow(self);
  const parse = args => {
    if (single.kind === "argument") {
      return parsePositionalVariadic(self, single, args, options);
    } else {
      return parseOptionVariadic(self, single, args, options);
    }
  };
  return Object.assign(Object.create(Proto), {
    _tag: "Variadic",
    kind: self.kind,
    param: self,
    min: Option.fromUndefinedOr(options?.min),
    max: Option.fromUndefinedOr(options?.max),
    parse
  });
};
/**
 * Wraps an option to allow it to be specified multiple times within a range.
 *
 * This combinator transforms an option to accept between `min` and `max`
 * occurrences on the command line, returning an array of all provided values.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Allow 1-3 file inputs
 * const files = Param.string(Param.flagKind, "file").pipe(
 *   Param.between(1, 3),
 *   Param.withAlias("-f")
 * )
 *
 * // Parse: --file a.txt --file b.txt
 * // Result: ["a.txt", "b.txt"]
 *
 * // Allow 0 or more tags
 * const tags = Param.string(Param.flagKind, "tag").pipe(
 *   Param.between(0, Number.MAX_SAFE_INTEGER)
 * )
 *
 * // Parse: --tag dev --tag staging --tag v1.0
 * // Result: ["dev", "staging", "v1.0"]
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const between = /*#__PURE__*/dual(3, (self, min, max) => {
  if (min < 0) {
    throw new Error("between: min must be non-negative");
  }
  if (max < min) {
    throw new Error("between: max must be greater than or equal to min");
  }
  return variadic(self, {
    min,
    max
  });
});
/**
 * Wraps an option to allow it to be specified at most `max` times.
 *
 * This combinator transforms an option to accept between 0 and `max`
 * occurrences on the command line, returning an array of all provided values.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Allow at most 3 warning suppressions
 * const suppressions = Param.string(Param.flagKind, "suppress").pipe(
 *   Param.atMost(3)
 * )
 *
 * // Parse: --suppress warning1 --suppress warning2
 * // Result: ["warning1", "warning2"]
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const atMost = /*#__PURE__*/dual(2, (self, max) => {
  if (max < 0) {
    throw new Error("atMost: max must be non-negative");
  }
  return variadic(self, {
    max
  });
});
/**
 * Wraps an option to require it to be specified at least `min` times.
 *
 * This combinator transforms an option to accept at least `min`
 * occurrences on the command line, returning an array of all provided values.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Require at least 2 input files
 * const inputs = Param.string(Param.flagKind, "input").pipe(
 *   Param.atLeast(2),
 *   Param.withAlias("-i")
 * )
 *
 * // Parse: --input file1.txt --input file2.txt --input file3.txt
 * // Result: ["file1.txt", "file2.txt", "file3.txt"]
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const atLeast = /*#__PURE__*/dual(2, (self, min) => {
  if (min < 0) {
    throw new Error("atLeast: min must be non-negative");
  }
  return variadic(self, {
    min
  });
});
/**
 * Filters and transforms parsed values, failing with a custom error message
 * if the filter function returns None.
 *
 * This combinator is useful for validation and transformation in a single step.
 *
 * @example
 * ```ts
 * import { Option } from "effect"
 * import * as Param from "effect/unstable/cli/Param"
 * // @internal - this module is not exported publicly
 *
 * const positiveInt = Param.integer(Param.flagKind, "count").pipe(
 *   Param.filterMap(
 *     (n) => n > 0 ? Option.some(n) : Option.none(),
 *     (n) => `Expected positive integer, got ${n}`
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const filterMap = /*#__PURE__*/dual(3, (self, filter, onNone) => mapEffect(self, Effect.fnUntraced(function* (a) {
  const result = filter(a);
  if (Option.isSome(result)) {
    return result.value;
  }
  const single = getUnderlyingSingleOrThrow(self);
  return yield* new CliError.InvalidValue({
    option: single.name,
    value: String(a),
    expected: onNone(a),
    kind: single.kind
  });
})));
/**
 * Filters parsed values, failing with a custom error message if the predicate returns false.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const evenNumber = Param.integer(Param.flagKind, "num").pipe(
 *   Param.filter(
 *     (n) => n % 2 === 0,
 *     (n) => `Expected even number, got ${n}`
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const filter = /*#__PURE__*/dual(3, (self, predicate, onFalse) => filterMap(self, Option.liftPredicate(predicate), onFalse));
/**
 * Sets a custom metavar (placeholder name) for the param in help documentation.
 *
 * The metavar is displayed in usage text to indicate what value the user should provide.
 * For example, `--output FILE` shows `FILE` as the metavar.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const port = Param.integer(Param.flagKind, "port").pipe(
 *   Param.withMetavar("PORT"),
 *   Param.filter(
 *     (p) => p >= 1 && p <= 65535,
 *     () => "Port must be between 1 and 65535"
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category metadata
 */
export const withMetavar = /*#__PURE__*/dual(2, (self, metavar) => transformSingle(self, single => makeSingle({
  ...single,
  typeName: metavar
})));
/**
 * Validates parsed values against a Schema, providing detailed error messages.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import * as Param from "effect/unstable/cli/Param"
 * // @internal - this module is not exported publicly
 *
 * const isEmail = Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *
 * const Email = Schema.String.pipe(
 *   Schema.check(isEmail)
 * )
 *
 * const email = Param.string(Param.flagKind, "email").pipe(
 *   Param.withSchema(Email)
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withSchema = /*#__PURE__*/dual(2, (self, schema) => {
  const decodeParam = Schema.decodeUnknownEffect(schema);
  return mapEffect(self, value => Effect.mapError(decodeParam(value), error => {
    const single = getUnderlyingSingleOrThrow(self);
    return new CliError.InvalidValue({
      option: single.name,
      value: String(value),
      expected: `Schema validation failed: ${error.message}`,
      kind: single.kind
    });
  }));
});
/**
 * Provides a fallback param to use if this param fails to parse.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const config = Param.file(Param.flagKind, "config").pipe(
 *   Param.orElse(() => Param.string(Param.flagKind, "config-url"))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const orElse = /*#__PURE__*/dual(2, (self, orElse) => transform(self, parse => args => Effect.catch(parse(args), err => orElse(err).parse(args))));
/**
 * Provides a fallback param, wrapping results in Either to distinguish which param succeeded.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * const configSource = Param.file(Param.flagKind, "config").pipe(
 *   Param.orElseResult(() => Param.string(Param.flagKind, "config-url"))
 * )
 * // Returns Result<string, string>
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const orElseResult = /*#__PURE__*/dual(2, (self, orElse) => {
  return transform(self, parse => args => Effect.catch(Effect.map(parse(args), ([leftover, value]) => [leftover, Result.succeed(value)]), err => Effect.map(orElse(err).parse(args), ([leftover, value]) => [leftover, Result.fail(value)])));
});
// =============================================================================
// Parsing Utilities
// =============================================================================
const parsePositional = /*#__PURE__*/Effect.fnUntraced(function* (name, primitiveType, args) {
  if (args.arguments.length === 0) {
    return yield* new CliError.MissingArgument({
      argument: name
    });
  }
  const arg = args.arguments[0];
  const value = yield* Effect.mapError(primitiveType.parse(arg), error => new CliError.InvalidValue({
    option: name,
    value: arg,
    expected: error,
    kind: "argument"
  }));
  return [args.arguments.slice(1), value];
});
const parseFlag = /*#__PURE__*/Effect.fnUntraced(function* (name, primitiveType, args) {
  const providedValues = args.flags[name];
  if (providedValues === undefined || providedValues.length === 0) {
    // Option not provided (empty array due to initialization)
    if (Primitive.isBoolean(primitiveType)) {
      // Boolean params default to false when not present
      return [args.arguments, false];
    } else {
      return yield* new CliError.MissingOption({
        option: name
      });
    }
  }
  // Parse the first value (later we can handle multiple)
  const arg = providedValues[0];
  const value = yield* Effect.mapError(primitiveType.parse(arg), error => new CliError.InvalidValue({
    option: name,
    value: arg,
    expected: error,
    kind: "flag"
  }));
  return [args.arguments, value];
});
const parsePositionalVariadic = /*#__PURE__*/Effect.fnUntraced(function* (self, single, args, options) {
  const results = [];
  const minValue = options?.min ?? 0;
  const maxValue = options?.max ?? Number.POSITIVE_INFINITY;
  let count = 0;
  let currentArgs = args.arguments;
  while (currentArgs.length > 0 && count < maxValue) {
    const [remainingArgs, value] = yield* self.parse({
      flags: args.flags,
      arguments: currentArgs
    });
    results.push(value);
    currentArgs = remainingArgs;
    count++;
  }
  if (count < minValue) {
    return yield* new CliError.InvalidValue({
      option: single.name,
      value: `${count} values`,
      expected: `at least ${minValue} value${minValue === 1 ? "" : "s"}`,
      kind: single.kind
    });
  }
  return [currentArgs, results];
});
const parseOptionVariadic = /*#__PURE__*/Effect.fnUntraced(function* (self, single, args, options) {
  const results = [];
  const names = [single.name, ...single.aliases];
  const values = names.flatMap(name => args.flags[name] ?? []);
  const count = values.length;
  // Validate count constraints
  if (Predicate.isNotUndefined(options?.min) && count < options.min) {
    return yield* count === 0 ? new CliError.MissingOption({
      option: single.name
    }) : new CliError.InvalidValue({
      option: single.name,
      value: `${count} occurrences`,
      expected: `at least ${options.min} value${options.min === 1 ? "" : "s"}`,
      kind: single.kind
    });
  }
  if (Predicate.isNotUndefined(options?.max) && count > options.max) {
    return yield* new CliError.InvalidValue({
      option: single.name,
      value: `${count} occurrences`,
      expected: `at most ${options.max} value${options.max === 1 ? "" : "s"}`,
      kind: single.kind
    });
  }
  // Parse each value individually
  for (const value of values) {
    const [, parsedValue] = yield* self.parse({
      flags: {
        [single.name]: [value]
      },
      arguments: []
    });
    results.push(parsedValue);
  }
  return [args.arguments, results];
});
/**
 * Type-safe param matcher that handles the unsafe casting internally.
 * This provides a clean API for pattern matching on param types while
 * maintaining type safety at the call site.
 */
const matchParam = (param, patterns) => {
  const p = param;
  switch (p._tag) {
    case "Single":
      return patterns.Single(p);
    case "Map":
      return patterns.Map(p);
    case "Transform":
      return patterns.Transform(p);
    case "Optional":
      return patterns.Optional(p);
    case "Variadic":
      return patterns.Variadic(p);
  }
};
/**
 * Recursively transforms a param by applying a function to any `Single` nodes.
 * This is used internally by combinators like `withAlias` to traverse the param tree.
 */
const transformSingle = (param, f) => {
  return matchParam(param, {
    Single: single => f(single),
    Map: mapped => map(transformSingle(mapped.param, f), mapped.f),
    Transform: mapped => transform(transformSingle(mapped.param, f), mapped.f),
    Optional: p => optional(transformSingle(p.param, f)),
    Variadic: p => variadic(transformSingle(p.param, f), {
      min: Option.getOrUndefined(p.min),
      max: Option.getOrUndefined(p.max)
    })
  });
};
/**
 * Extracts all Single params from a potentially nested param structure.
 * This handles all param combinators including Map, Transform, Optional, and Variadic.
 *
 * @internal
 */
export const extractSingleParams = param => {
  return matchParam(param, {
    Single: single => [single],
    Map: mapped => extractSingleParams(mapped.param),
    Transform: mapped => extractSingleParams(mapped.param),
    Optional: optional => extractSingleParams(optional.param),
    Variadic: variadic => extractSingleParams(variadic.param)
  });
};
/**
 * Gets the underlying Single param from a potentially nested param structure.
 * Throws an error if there are no singles or multiple singles found.
 *
 * @internal
 */
export const getUnderlyingSingleOrThrow = param => {
  const singles = extractSingleParams(param);
  if (singles.length === 0) {
    throw new Error("No Single param found in param structure");
  }
  if (singles.length > 1) {
    throw new Error(`Multiple Single params found: ${singles.map(s => s.name).join(", ")}`);
  }
  return singles[0];
};
/**
 * Gets param metadata by traversing the structure.
 *
 * @internal
 */
export const getParamMetadata = param => {
  return matchParam(param, {
    Single: () => ({
      isOptional: false,
      isVariadic: false
    }),
    Map: mapped => getParamMetadata(mapped.param),
    Transform: mapped => getParamMetadata(mapped.param),
    Optional: optional => ({
      ...getParamMetadata(optional.param),
      isOptional: true
    }),
    Variadic: variadic => ({
      ...getParamMetadata(variadic.param),
      isVariadic: true
    })
  });
};
//# sourceMappingURL=Param.js.map