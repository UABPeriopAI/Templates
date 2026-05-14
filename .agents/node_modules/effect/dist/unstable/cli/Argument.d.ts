/**
 * @since 4.0.0
 */
import type * as Config from "../../Config.ts";
import type * as Effect from "../../Effect.ts";
import { type LazyArg } from "../../Function.ts";
import type * as Option from "../../Option.ts";
import type * as Redacted from "../../Redacted.ts";
import type * as Result from "../../Result.ts";
import type * as Schema from "../../Schema.ts";
import type * as CliError from "./CliError.ts";
import * as Param from "./Param.ts";
import type * as Primitive from "./Primitive.ts";
/**
 * Represents a positional command-line argument.
 *
 * Note: `boolean` is intentionally omitted from Argument constructors.
 * Positional boolean arguments are ambiguous in CLI design since there's
 * no flag name to negate (e.g., `--no-verbose`). Use Flag.boolean instead,
 * or use Argument.choice with explicit "true"/"false" strings if needed.
 *
 * @since 4.0.0
 * @category models
 */
export interface Argument<A> extends Param.Param<typeof Param.argumentKind, A> {
}
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
export declare const string: (name: string) => Argument<string>;
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
export declare const integer: (name: string) => Argument<number>;
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
export declare const file: (name: string, options?: {
    readonly mustExist?: boolean | undefined;
}) => Argument<string>;
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
export declare const directory: (name: string, options?: {
    readonly mustExist?: boolean | undefined;
}) => Argument<string>;
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
export declare const float: (name: string) => Argument<number>;
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
export declare const date: (name: string) => Argument<Date>;
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
export declare const choice: <const Choices extends ReadonlyArray<string>>(name: string, choices: Choices) => Argument<Choices[number]>;
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
export declare const path: (name: string, options?: {
    pathType?: "file" | "directory" | "either";
    mustExist?: boolean;
}) => Argument<string>;
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
export declare const redacted: (name: string) => Argument<Redacted.Redacted<string>>;
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
export declare const fileText: (name: string) => Argument<string>;
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
export declare const fileParse: (name: string, options?: Primitive.FileParseOptions | undefined) => Argument<unknown>;
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
export declare const fileSchema: <A>(name: string, schema: Schema.Decoder<A>, options?: Primitive.FileSchemaOptions | undefined) => Argument<A>;
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
export declare const none: Argument<never>;
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
export declare const optional: <A>(arg: Argument<A>) => Argument<Option.Option<A>>;
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
export declare const withDescription: {
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
    <A>(description: string): (self: Argument<A>) => Argument<A>;
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
    <A>(self: Argument<A>, description: string): Argument<A>;
};
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
export declare const withDefault: {
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
    <const B>(defaultValue: B | Effect.Effect<B, CliError.CliError, Param.Environment>): <A>(self: Argument<A>) => Argument<A | B>;
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
    <A, const B>(self: Argument<A>, defaultValue: B | Effect.Effect<B, CliError.CliError, Param.Environment>): Argument<A | B>;
};
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
export declare const withFallbackConfig: {
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
    <B>(config: Config.Config<B>): <A>(self: Argument<A>) => Argument<A | B>;
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
    <A, B>(self: Argument<A>, config: Config.Config<B>): Argument<A | B>;
};
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
export declare const withFallbackPrompt: {
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
    <B>(prompt: Param.FallbackPrompt<B>): <A>(self: Argument<A>) => Argument<A | B>;
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
    <A, B>(self: Argument<A>, prompt: Param.FallbackPrompt<B>): Argument<A | B>;
};
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
export declare const variadic: {
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
    (options?: Param.VariadicParamOptions | undefined): <A>(self: Argument<A>) => Argument<ReadonlyArray<A>>;
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
    <A>(self: Argument<A>, options?: Param.VariadicParamOptions | undefined): Argument<ReadonlyArray<A>>;
};
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
export declare const map: {
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
    <A, B>(f: (a: A) => B): (self: Argument<A>) => Argument<B>;
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
    <A, B>(self: Argument<A>, f: (a: A) => B): Argument<B>;
};
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
export declare const mapEffect: {
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
    <A, B>(f: (a: A) => Effect.Effect<B, CliError.CliError, Param.Environment>): (self: Argument<A>) => Argument<B>;
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
    <A, B>(self: Argument<A>, f: (a: A) => Effect.Effect<B, CliError.CliError, Param.Environment>): Argument<B>;
};
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
export declare const mapTryCatch: {
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
    <A, B>(f: (a: A) => B, onError: (error: unknown) => string): (self: Argument<A>) => Argument<B>;
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
    <A, B>(self: Argument<A>, f: (a: A) => B, onError: (error: unknown) => string): Argument<B>;
};
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
export declare const atLeast: {
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
    <A>(min: number): (self: Argument<A>) => Argument<ReadonlyArray<A>>;
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
    <A>(self: Argument<A>, min: number): Argument<ReadonlyArray<A>>;
};
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
export declare const atMost: {
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
    <A>(max: number): (self: Argument<A>) => Argument<ReadonlyArray<A>>;
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
    <A>(self: Argument<A>, max: number): Argument<ReadonlyArray<A>>;
};
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
export declare const between: {
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
    <A>(min: number, max: number): (self: Argument<A>) => Argument<ReadonlyArray<A>>;
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
    <A>(self: Argument<A>, min: number, max: number): Argument<ReadonlyArray<A>>;
};
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
export declare const withSchema: {
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
    <A, B>(schema: Schema.Codec<B, A>): (self: Argument<A>) => Argument<B>;
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
    <A, B>(self: Argument<A>, schema: Schema.Codec<B, A>): Argument<B>;
};
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
export declare const choiceWithValue: <const Choices extends ReadonlyArray<readonly [string, any]>>(name: string, choices: Choices) => Argument<Choices[number][1]>;
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
export declare const withMetavar: {
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
    <A>(metavar: string): (self: Argument<A>) => Argument<A>;
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
    <A>(self: Argument<A>, metavar: string): Argument<A>;
};
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
export declare const filter: {
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
    <A>(predicate: (a: A) => boolean, onFalse: (a: A) => string): (self: Argument<A>) => Argument<A>;
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
    <A>(self: Argument<A>, predicate: (a: A) => boolean, onFalse: (a: A) => string): Argument<A>;
};
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
export declare const filterMap: {
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
    <A, B>(f: (a: A) => Option.Option<B>, onNone: (a: A) => string): (self: Argument<A>) => Argument<B>;
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
    <A, B>(self: Argument<A>, f: (a: A) => Option.Option<B>, onNone: (a: A) => string): Argument<B>;
};
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
export declare const orElse: {
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
    <B>(that: LazyArg<Argument<B>>): <A>(self: Argument<A>) => Argument<A | B>;
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
    <A, B>(self: Argument<A>, that: LazyArg<Argument<B>>): Argument<A | B>;
};
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
export declare const orElseResult: {
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
    <B>(that: LazyArg<Argument<B>>): <A>(self: Argument<A>) => Argument<Result.Result<A, B>>;
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
    <A, B>(self: Argument<A>, that: LazyArg<Argument<B>>): Argument<Result.Result<A, B>>;
};
//# sourceMappingURL=Argument.d.ts.map