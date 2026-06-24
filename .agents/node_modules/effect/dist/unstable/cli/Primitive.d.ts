import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Path from "../../Path.ts";
import * as Redacted from "../../Redacted.ts";
import * as Schema from "../../Schema.ts";
import type { Formatter } from "../../SchemaIssue.ts";
import type * as Struct from "../../Struct.ts";
import type { Covariant } from "../../Types.ts";
declare const TypeId = "~effect/cli/Primitive";
/**
 * Represents a primitive type that can parse string input into a typed value.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * // Using built-in primitives
 * const parseString = Effect.gen(function*() {
 *   const stringResult = yield* Primitive.string.parse("hello")
 *   const numberResult = yield* Primitive.integer.parse("42")
 *   const boolResult = yield* Primitive.boolean.parse("true")
 *
 *   return { stringResult, numberResult, boolResult }
 * })
 *
 * // All primitives provide parsing functionality
 * const parseDate = Effect.gen(function*() {
 *   const dateResult = yield* Primitive.date.parse("2023-12-25")
 *   const pathResult = yield* Primitive.path("file", true).parse("./package.json")
 *   return { dateResult, pathResult }
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface Primitive<out A> extends Primitive.Variance<A> {
    readonly _tag: string;
    readonly parse: (value: string) => Effect.Effect<A, string, FileSystem.FileSystem | Path.Path>;
}
/**
 * @since 4.0.0
 */
export declare namespace Primitive {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Variance<out A> {
        readonly [TypeId]: {
            readonly _A: Covariant<A>;
        };
    }
}
/**
 * Creates a primitive that parses boolean values from string input.
 *
 * Recognizes various forms of true/false values:
 * - True values: "true", "1", "y", "yes", "on"
 * - False values: "false", "0", "n", "no", "off"
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseBoolean = Effect.gen(function*() {
 *   const result1 = yield* Primitive.boolean.parse("true")
 *   console.log(result1) // true
 *
 *   const result2 = yield* Primitive.boolean.parse("yes")
 *   console.log(result2) // true
 *
 *   const result3 = yield* Primitive.boolean.parse("false")
 *   console.log(result3) // false
 *
 *   const result4 = yield* Primitive.boolean.parse("0")
 *   console.log(result4) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const boolean: Primitive<boolean>;
/**
 * Creates a primitive that parses floating-point numbers from string input.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseFloat = Effect.gen(function*() {
 *   const result1 = yield* Primitive.float.parse("3.14")
 *   console.log(result1) // 3.14
 *
 *   const result2 = yield* Primitive.float.parse("-42.5")
 *   console.log(result2) // -42.5
 *
 *   const result3 = yield* Primitive.float.parse("0")
 *   console.log(result3) // 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const float: Primitive<number>;
/**
 * Creates a primitive that parses integer numbers from string input.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseInteger = Effect.gen(function*() {
 *   const result1 = yield* Primitive.integer.parse("42")
 *   console.log(result1) // 42
 *
 *   const result2 = yield* Primitive.integer.parse("-123")
 *   console.log(result2) // -123
 *
 *   const result3 = yield* Primitive.integer.parse("0")
 *   console.log(result3) // 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const integer: Primitive<number>;
/**
 * Creates a primitive that parses Date objects from string input.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseDate = Effect.gen(function*() {
 *   const result1 = yield* Primitive.date.parse("2023-12-25")
 *   console.log(result1) // Date object for December 25, 2023
 *
 *   const result2 = yield* Primitive.date.parse("2023-12-25T10:30:00Z")
 *   console.log(result2) // Date object with time
 *
 *   const result3 = yield* Primitive.date.parse("Dec 25, 2023")
 *   console.log(result3) // Date object parsed from natural format
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const date: Primitive<Date>;
/**
 * Creates a primitive that accepts any string value without validation.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseString = Effect.gen(function*() {
 *   const result1 = yield* Primitive.string.parse("hello world")
 *   console.log(result1) // "hello world"
 *
 *   const result2 = yield* Primitive.string.parse("")
 *   console.log(result2) // ""
 *
 *   const result3 = yield* Primitive.string.parse("123")
 *   console.log(result3) // "123"
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const string: Primitive<string>;
/**
 * Creates a primitive that accepts only specific choice values mapped to custom types.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * type LogLevel = "debug" | "info" | "warn" | "error"
 *
 * const logLevelPrimitive = Primitive.choice<LogLevel>([
 *   ["debug", "debug"],
 *   ["info", "info"],
 *   ["warn", "warn"],
 *   ["error", "error"]
 * ])
 *
 * const parseLogLevel = Effect.gen(function*() {
 *   const result1 = yield* logLevelPrimitive.parse("info")
 *   console.log(result1) // "info"
 *
 *   const result2 = yield* logLevelPrimitive.parse("debug")
 *   console.log(result2) // "debug"
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const choice: <A>(choices: ReadonlyArray<readonly [string, A]>) => Primitive<A>;
/**
 * Specifies the type of path validation to perform.
 *
 * @example
 * ```ts
 * import { Primitive } from "effect/unstable/cli"
 *
 * // Only accept files
 * const filePath = Primitive.path("file", true)
 *
 * // Only accept directories
 * const dirPath = Primitive.path("directory", true)
 *
 * // Accept either files or directories
 * const anyPath = Primitive.path("either", false)
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type PathType = "file" | "directory" | "either";
/**
 * Creates a primitive that validates and resolves file system paths.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const program = Effect.gen(function*() {
 *   // Parse a file path that must exist
 *   const filePrimitive = Primitive.path("file", true)
 *   const filePath = yield* filePrimitive.parse("./package.json")
 *   console.log(filePath) // Absolute path to package.json
 *
 *   // Parse a directory path
 *   const dirPrimitive = Primitive.path("directory", false)
 *   const dirPath = yield* dirPrimitive.parse("./src")
 *   console.log(dirPath) // Absolute path to src directory
 *
 *   // Parse any path type
 *   const anyPrimitive = Primitive.path("either", false)
 *   const anyPath = yield* anyPrimitive.parse("./some/path")
 *   console.log(anyPath) // Absolute path
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const path: (pathType: PathType, mustExist?: boolean) => Primitive<string>;
/**
 * Creates a primitive that wraps string input in a redacted type for secure handling.
 *
 * @example
 * ```ts
 * import { Effect, Redacted } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseRedacted = Effect.gen(function*() {
 *   const result = yield* Primitive.redacted.parse("secret-password")
 *   console.log(Redacted.value(result)) // "secret-password"
 *   console.log(String(result)) // "<redacted>"
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const redacted: Primitive<Redacted.Redacted<string>>;
/**
 * Creates a primitive that reads and returns the contents of a file as a string.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const readConfigFile = Effect.gen(function*() {
 *   const content = yield* Primitive.fileText.parse("./config.json")
 *   console.log(content) // File contents as string
 *
 *   const parsed = JSON.parse(content)
 *   return parsed
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fileText: Primitive<string>;
/**
 * Represents options which can be provided to methods that deal with parsing
 * file content.
 *
 * @since 4.0.0
 * @category models
 */
export type FileParseOptions = {
    readonly format?: "ini" | "json" | "toml" | "yaml";
};
/**
 * Reads and parses file content using the specified schema.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const tomlFilePrimitive = Primitive.fileParse({ format: "toml" })
 *
 * const loadConfig = Effect.gen(function*() {
 *   const config = yield* tomlFilePrimitive.parse("./config.toml")
 *   console.log(config) // { name: "my-app", version: "1.0.0", port: 3000 }
 *   return config
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fileParse: (options?: FileParseOptions) => Primitive<unknown>;
/**
 * Represents options which can be provided to methods that deal with parsing
 * file content and decoding the file content with a `Schema`.
 *
 * @since 4.0.0
 * @category models
 */
export type FileSchemaOptions = Struct.Simplify<FileParseOptions & {
    readonly errorFormatter?: Formatter<string> | undefined;
}>;
/**
 * Reads and parses file content using the specified schema.
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const ConfigSchema = Schema.Struct({
 *   name: Schema.String,
 *   version: Schema.String,
 *   port: Schema.Number
 * }).pipe(Schema.fromJsonString)
 *
 * const jsonConfigPrimitive = Primitive.fileSchema(ConfigSchema, {
 *   format: "json"
 * })
 *
 * const loadConfig = Effect.gen(function*() {
 *   const config = yield* jsonConfigPrimitive.parse("./config.json")
 *   console.log(config) // { name: "my-app", version: "1.0.0", port: 3000 }
 *   return config
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fileSchema: <A>(schema: Schema.Decoder<A>, options?: FileSchemaOptions | undefined) => Primitive<A>;
/**
 * Parses a single `key=value` pair into a record object.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const parseKeyValue = Effect.gen(function*() {
 *   const result1 = yield* Primitive.keyValuePair.parse("name=john")
 *   console.log(result1) // { name: "john" }
 *
 *   const result2 = yield* Primitive.keyValuePair.parse("port=3000")
 *   console.log(result2) // { port: "3000" }
 *
 *   const result3 = yield* Primitive.keyValuePair.parse("debug=true")
 *   console.log(result3) // { debug: "true" }
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const keyValuePair: Primitive<Record<string, string>>;
/**
 * A sentinel primitive that always fails to parse a value.
 *
 * Used for flags that don't accept values.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Primitive } from "effect/unstable/cli"
 *
 * const program = Effect.gen(function*() {
 *   // This will always fail - useful for boolean flags
 *   return yield* Primitive.none.parse("any-value")
 * })
 *
 * // The above effect will fail with "This option does not accept values"
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const none: Primitive<never>;
/**
 * Gets a human-readable type name for a primitive.
 *
 * Used for generating help documentation.
 *
 * @example
 * ```ts
 * import { Primitive } from "effect/unstable/cli"
 *
 * console.log(Primitive.getTypeName(Primitive.string)) // "string"
 * console.log(Primitive.getTypeName(Primitive.integer)) // "integer"
 * console.log(Primitive.getTypeName(Primitive.boolean)) // "boolean"
 * console.log(Primitive.getTypeName(Primitive.date)) // "date"
 * console.log(Primitive.getTypeName(Primitive.keyValuePair)) // "key=value"
 *
 * const logLevelChoice = Primitive.choice([
 *   ["debug", "debug"],
 *   ["info", "info"]
 * ])
 * console.log(Primitive.getTypeName(logLevelChoice)) // "choice"
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export declare const getTypeName: <A>(primitive: Primitive<A>) => string;
export {};
//# sourceMappingURL=Primitive.d.ts.map