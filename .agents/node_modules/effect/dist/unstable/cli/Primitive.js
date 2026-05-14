/**
 * Primitive types for CLI parameter parsing.
 *
 * Primitives handle the low-level parsing of string input into typed values.
 * Most users should use the higher-level `Argument` and `Flag` modules instead.
 *
 * This module is primarily useful for:
 * - Creating custom primitive types
 * - Understanding how CLI parsing works internally
 * - Advanced customization of parsing behavior
 *
 * @since 4.0.0
 */
import * as Ini from "ini";
import * as Toml from "toml";
import * as Yaml from "yaml";
import * as Config from "../../Config.js";
import * as Effect from "../../Effect.js";
import * as FileSystem from "../../FileSystem.js";
import { format } from "../../Formatter.js";
import { identity } from "../../Function.js";
import * as Path from "../../Path.js";
import * as Redacted from "../../Redacted.js";
import * as Schema from "../../Schema.js";
const TypeId = "~effect/cli/Primitive";
const Proto = {
  [TypeId]: {
    _A: identity
  }
};
/** @internal */
export const isTrueValue = /*#__PURE__*/Schema.is(Config.TrueValues);
/** @internal */
export const isFalseValue = /*#__PURE__*/Schema.is(Config.FalseValues);
/** @internal */
export const isBoolean = p => p._tag === "Boolean";
const makePrimitive = (tag, parse) => Object.assign(Object.create(Proto), {
  _tag: tag,
  parse
});
const makeSchemaPrimitive = (tag, schema) => {
  const toCodecStringTree = Schema.toCodecStringTree(schema);
  const decode = Schema.decodeUnknownEffect(toCodecStringTree);
  return makePrimitive(tag, value => Effect.mapError(decode(value), error => error.message));
};
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
export const boolean = /*#__PURE__*/makeSchemaPrimitive("Boolean", Config.Boolean);
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
export const float = /*#__PURE__*/makeSchemaPrimitive("Float", Schema.Finite);
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
export const integer = /*#__PURE__*/makeSchemaPrimitive("Integer", Schema.Int);
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
export const date = /*#__PURE__*/makeSchemaPrimitive("Date", Schema.DateValid);
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
export const string = /*#__PURE__*/makePrimitive("String", value => Effect.succeed(value));
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
export const choice = choices => {
  const choiceMap = new Map(choices);
  const validChoices = choices.map(([key]) => format(key)).join(" | ");
  const primitive = makePrimitive("Choice", value => {
    if (choiceMap.has(value)) {
      return Effect.succeed(choiceMap.get(value));
    }
    return Effect.fail(`Expected ${validChoices}, got ${format(value)}`);
  });
  return Object.assign(primitive, {
    choiceKeys: choices.map(([key]) => key)
  });
};
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
export const path = (pathType, mustExist) => makePrimitive("Path", Effect.fnUntraced(function* (value) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  // Resolve the path to absolute
  const absolutePath = path.isAbsolute(value) ? value : path.resolve(value);
  // Check if path exists
  const exists = yield* Effect.mapError(fs.exists(absolutePath), error => `Failed to check path existence: ${error.message}`);
  // Validate existence requirements
  if (mustExist === true && !exists) {
    return yield* Effect.fail(`Path does not exist: ${absolutePath}`);
  }
  // Validate path type if it exists
  if (exists && pathType !== "either") {
    const stat = yield* Effect.mapError(fs.stat(absolutePath), error => `Failed to stat path: ${error.message}`);
    if (pathType === "file" && stat.type !== "File") {
      return yield* Effect.fail(`Path is not a file: ${absolutePath}`);
    }
    if (pathType === "directory" && stat.type !== "Directory") {
      return yield* Effect.fail(`Path is not a directory: ${absolutePath}`);
    }
  }
  return absolutePath;
}));
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
export const redacted = /*#__PURE__*/makePrimitive("Redacted", value => Effect.succeed(Redacted.make(value)));
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
export const fileText = /*#__PURE__*/makePrimitive("FileText", /*#__PURE__*/Effect.fnUntraced(function* (filePath) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  // Resolve to absolute path
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  // Check if file exists
  const exists = yield* Effect.mapError(fs.exists(absolutePath), error => `Failed to check file existence: ${error.message}`);
  if (!exists) {
    return yield* Effect.fail(`File does not exist: ${absolutePath}`);
  }
  // Check if it's actually a file
  const stat = yield* Effect.mapError(fs.stat(absolutePath), error => `Failed to stat file: ${error.message}`);
  if (stat.type !== "File") {
    return yield* Effect.fail(`Path is not a file: ${absolutePath}`);
  }
  // Read file content
  const content = yield* Effect.mapError(fs.readFileString(absolutePath), error => `Failed to read file: ${error.message}`);
  return content;
}));
const fileParsers = {
  ini: content => Ini.parse(content),
  json: content => JSON.parse(content),
  toml: content => Toml.parse(content),
  yml: content => Yaml.parse(content),
  yaml: content => Yaml.parse(content)
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
export const fileParse = options => {
  return makePrimitive("FileParse", Effect.fnUntraced(function* (filePath) {
    const fileFormat = options?.format ?? filePath.split(".").pop();
    const parser = fileParsers[fileFormat];
    if (parser === undefined) {
      return yield* Effect.fail(`Unsupported file format: ${fileFormat}`);
    }
    const content = yield* fileText.parse(filePath);
    return yield* Effect.try({
      try: () => parser(content),
      catch: error => `Failed to parse '.${fileFormat}' file content: ${error}`
    });
  }));
};
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
export const fileSchema = (schema, options) => {
  const decode = Schema.decodeUnknownEffect(schema);
  return makePrimitive("FileSchema", Effect.fnUntraced(function* (filePath) {
    const content = yield* fileParse(options).parse(filePath);
    return yield* Effect.mapError(decode(content), error => options?.errorFormatter?.(error.issue) ?? error.toString());
  }));
};
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
export const keyValuePair = /*#__PURE__*/makePrimitive("KeyValuePair", /*#__PURE__*/Effect.fnUntraced(function* (value) {
  const parts = value.split("=");
  if (parts.length !== 2) {
    return yield* Effect.fail(`Invalid key=value format. Expected format: key=value, got: ${value}`);
  }
  const [key, val] = parts;
  if (!key || !val) {
    return yield* Effect.fail(`Invalid key=value format. Both key and value must be non-empty. Got: ${value}`);
  }
  return {
    [key]: val
  };
}));
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
export const none = /*#__PURE__*/makePrimitive("None", () => Effect.fail("This option does not accept values"));
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
export const getTypeName = primitive => {
  switch (primitive._tag) {
    case "Boolean":
      return "boolean";
    case "String":
      return "string";
    case "Integer":
      return "integer";
    case "Float":
      return "number";
    case "Date":
      return "date";
    case "Path":
      return "path";
    case "Choice":
      return "choice";
    case "Redacted":
      return "string";
    case "FileText":
      return "file";
    case "FileParse":
      return "file";
    case "FileSchema":
      return "file";
    case "KeyValuePair":
      return "key=value";
    case "None":
      return "none";
    default:
      return "value";
  }
};
/** @internal */
export const getChoiceKeys = primitive => primitive._tag === "Choice" ? primitive.choiceKeys : undefined;
//# sourceMappingURL=Primitive.js.map