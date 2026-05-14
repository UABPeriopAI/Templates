import { dual } from "../../Function.js";
import * as Param from "./Param.js";
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Creates a positional string argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const filename = Argument.string("filename")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const string = name => Param.string(Param.argumentKind, name);
/**
 * Creates a positional integer argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const count = Argument.integer("count")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const integer = name => Param.integer(Param.argumentKind, name);
/**
 * Creates a positional file path argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const inputFile = Argument.file("input", { mustExist: true }) // Must exist
 * const outputFile = Argument.file("output", { mustExist: false }) // Must not exist
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const file = (name, options) => Param.file(Param.argumentKind, name, options);
/**
 * Creates a positional directory path argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const workspace = Argument.directory("workspace", { mustExist: true }) // Must exist
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const directory = (name, options) => Param.directory(Param.argumentKind, name, options);
/**
 * Creates a positional float argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const ratio = Argument.float("ratio")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const float = name => Param.float(Param.argumentKind, name);
/**
 * Creates a positional date argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const startDate = Argument.date("start-date")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const date = name => Param.date(Param.argumentKind, name);
/**
 * Creates a positional choice argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const environment = Argument.choice("environment", ["dev", "staging", "prod"])
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const choice = (name, choices) => Param.choice(Param.argumentKind, name, choices);
/**
 * Creates a positional path argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const configPath = Argument.path("config")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const path = (name, options) => Param.path(Param.argumentKind, name, options);
/**
 * Creates a positional redacted argument that obscures its value.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const secret = Argument.redacted("secret")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const redacted = name => Param.redacted(Param.argumentKind, name);
/**
 * Creates a positional argument that reads file content as a string.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const config = Argument.fileText("config-file")
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileText = name => Param.fileText(Param.argumentKind, name);
/**
 * Creates a positional argument that reads and validates file content using a schema.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const config = Argument.fileParse("config", { format: "json" })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileParse = (name, options) => Param.fileParse(Param.argumentKind, name, options);
/**
 * Creates a positional argument that reads and validates file content using a schema.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const ConfigSchema = Schema.Struct({
 *   port: Schema.Number,
 *   host: Schema.String
 * })
 *
 * const config = Argument.fileSchema("config", ConfigSchema)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fileSchema = (name, schema, options) => Param.fileSchema(Param.argumentKind, name, schema, options);
/**
 * Creates an empty sentinel argument that always fails to parse.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * // Used as a placeholder or default in combinators
 * const noArg = Argument.none
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const none = /*#__PURE__*/Param.none(Param.argumentKind);
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Makes a positional argument optional.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const optionalVersion = Argument.string("version").pipe(Argument.optional)
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const optional = arg => Param.optional(arg);
/**
 * Adds a description to a positional argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const filename = Argument.string("filename").pipe(
 *   Argument.withDescription("The input file to process")
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withDescription = /*#__PURE__*/dual(2, (self, description) => Param.withDescription(self, description));
/**
 * Provides a default value for a positional argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const port = Argument.integer("port").pipe(Argument.withDefault(8080))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withDefault = Param.withDefault;
/**
 * Adds a fallback config that is loaded when a required argument is missing.
 *
 * @example
 * ```ts
 * import { Config } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const repository = Argument.string("repository").pipe(
 *   Argument.withFallbackConfig(Config.string("REPOSITORY"))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withFallbackConfig = /*#__PURE__*/dual(2, (self, config) => Param.withFallbackConfig(self, config));
/**
 * Adds a fallback prompt that is shown when a required argument is missing.
 *
 * @example
 * ```ts
 * import { Argument, Prompt } from "effect/unstable/cli"
 *
 * const filename = Argument.string("filename").pipe(
 *   Argument.withFallbackPrompt(Prompt.text({ message: "Filename" }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withFallbackPrompt = /*#__PURE__*/dual(2, (self, prompt) => Param.withFallbackPrompt(self, prompt));
/**
 * Creates a variadic positional argument that accepts multiple values.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * // Accept any number of files
 * const anyFiles = Argument.string("files").pipe(Argument.variadic)
 *
 * // Accept at least 1 file
 * const atLeastOneFile = Argument.string("files").pipe(
 *   Argument.variadic({ min: 1 })
 * )
 *
 * // Accept between 1 and 5 files
 * const limitedFiles = Argument.string("files").pipe(
 *   Argument.variadic({ min: 1, max: 5 })
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const variadic = /*#__PURE__*/dual(2, (self, options) => Param.variadic(self, options));
/**
 * Transforms the parsed value of a positional argument.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const port = Argument.integer("port").pipe(
 *   Argument.map((p) => ({ port: p, url: `http://localhost:${p}` }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const map = /*#__PURE__*/dual(2, (self, f) => Param.map(self, f));
/**
 * Transforms the parsed value of a positional argument using an effectful function.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Argument, CliError } from "effect/unstable/cli"
 *
 * const files = Argument.string("files").pipe(
 *   Argument.mapEffect((file) =>
 *     file.endsWith(".txt")
 *       ? Effect.succeed(file)
 *       : Effect.fail(
 *         new CliError.UserError({
 *           cause: new Error("Only .txt files allowed")
 *         })
 *       )
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const mapEffect = /*#__PURE__*/dual(2, (self, f) => Param.mapEffect(self, f));
/**
 * Transforms the parsed value of a positional argument using a function that may throw.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const json = Argument.string("data").pipe(
 *   Argument.mapTryCatch(
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
export const mapTryCatch = /*#__PURE__*/dual(3, (self, f, onError) => Param.mapTryCatch(self, f, onError));
/**
 * Creates a variadic argument that requires at least n values.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const files = Argument.string("files").pipe(Argument.atLeast(1))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const atLeast = /*#__PURE__*/dual(2, (self, min) => Param.atLeast(self, min));
/**
 * Creates a variadic argument that accepts at most n values.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const files = Argument.string("files").pipe(Argument.atMost(5))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const atMost = /*#__PURE__*/dual(2, (self, max) => Param.atMost(self, max));
/**
 * Creates a variadic argument that accepts between min and max values.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const files = Argument.string("files").pipe(Argument.between(1, 5))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const between = /*#__PURE__*/dual(3, (self, min, max) => Param.between(self, min, max));
/**
 * Validates parsed values against a Schema.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const input = Argument.string("input").pipe(
 *   Argument.withSchema(Schema.NonEmptyString)
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const withSchema = /*#__PURE__*/dual(2, (self, schema) => Param.withSchema(self, schema));
/**
 * Creates a positional choice argument with custom value mapping.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const logLevel = Argument.choiceWithValue("level", [
 *   ["debug", 0],
 *   ["info", 1],
 *   ["warn", 2],
 *   ["error", 3]
 * ])
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const choiceWithValue = (name, choices) => Param.choiceWithValue(Param.argumentKind, name, choices);
// -------------------------------------------------------------------------------------
// metadata
// -------------------------------------------------------------------------------------
/**
 * Sets a custom metavar (placeholder name) for the argument in help documentation.
 *
 * The metavar is displayed in usage text to indicate what value the user should provide.
 * For example, `<FILE>` shows `FILE` as the metavar.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const port = Argument.integer("port").pipe(
 *   Argument.withMetavar("PORT")
 * )
 * ```
 *
 * @since 4.0.0
 * @category metadata
 */
export const withMetavar = /*#__PURE__*/dual(2, (self, metavar) => Param.withMetavar(self, metavar));
/**
 * Filters parsed values, failing with a custom error message if the predicate returns false.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const positiveInt = Argument.integer("count").pipe(
 *   Argument.filter(
 *     (n) => n > 0,
 *     (n) => `Expected positive integer, got ${n}`
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const filter = /*#__PURE__*/dual(3, (self, predicate, onFalse) => Param.filter(self, predicate, onFalse));
/**
 * Filters and transforms parsed values, failing with a custom error message
 * if the filter function returns None.
 *
 * @example
 * ```ts
 * import { Option } from "effect"
 * import { Argument } from "effect/unstable/cli"
 *
 * const positiveInt = Argument.integer("count").pipe(
 *   Argument.filterMap(
 *     (n) => n > 0 ? Option.some(n) : Option.none(),
 *     (n) => `Expected positive integer, got ${n}`
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const filterMap = /*#__PURE__*/dual(3, (self, f, onNone) => Param.filterMap(self, f, onNone));
/**
 * Provides a fallback argument to use if this argument fails to parse.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const value = Argument.integer("value").pipe(
 *   Argument.orElse(() => Argument.string("value"))
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const orElse = /*#__PURE__*/dual(2, (self, that) => Param.orElse(self, that));
/**
 * Provides a fallback argument, wrapping results in Result to distinguish which succeeded.
 *
 * @example
 * ```ts
 * import { Argument } from "effect/unstable/cli"
 *
 * const source = Argument.file("source").pipe(
 *   Argument.orElseResult(() => Argument.string("url"))
 * )
 * // Returns Result<string, string>
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const orElseResult = /*#__PURE__*/dual(2, (self, that) => Param.orElseResult(self, that));
//# sourceMappingURL=Argument.js.map