/**
 * A callable interface representing a function that converts a `Value` into a
 * `Format` (defaults to `string`).
 *
 * When to use:
 * - You want to type a formatting / rendering function generically.
 * - You are building a pipeline that accepts pluggable formatters.
 *
 * Behavior:
 * - Pure callable type; carries no runtime implementation.
 * - Contravariant in `Value`, covariant in `Format`.
 *
 * **Example** (Define a custom formatter)
 *
 * ```ts
 * import type { Formatter } from "effect"
 *
 * const upper: Formatter.Formatter<string> = (s) => s.toUpperCase()
 *
 * console.log(upper("hello"))
 * // HELLO
 * ```
 *
 * See also: {@link format}, {@link formatJson}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Formatter<in Value, out Format = string> {
    (value: Value): Format;
}
/**
 * Converts any JavaScript value into a human-readable string.
 *
 * When to use:
 * - Pretty-printing values for debugging, logging, or error messages.
 * - You need to handle `BigInt`, `Symbol`, `Set`, `Map`, `Date`, `RegExp`,
 *   or class instances that `JSON.stringify` cannot represent.
 * - You want circular references shown as `"[Circular]"` instead of
 *   throwing.
 *
 * Behavior:
 * - Does not mutate input.
 * - Output is **not** valid JSON; use {@link formatJson} when you need
 *   parseable JSON.
 * - Primitives: stringified naturally (`null`, `undefined`, `123`, `true`).
 *   Strings are JSON-quoted.
 * - Objects with a custom `toString` (not `Object.prototype.toString`):
 *   `toString()` is called unless `ignoreToString` is `true`.
 * - Errors with a `cause`: formatted as `"<message> (cause: <cause>)"`.
 * - Iterables (`Set`, `Map`, etc.): formatted as
 *   `ClassName([...elements])`.
 * - Class instances: wrapped as `ClassName({...})`.
 * - `Redactable` values are automatically redacted.
 * - Arrays/objects with 0–1 entries are inline; larger ones are
 *   pretty-printed when `space` is set.
 * - Circular references are replaced with `"[Circular]"`.
 *
 * Options:
 * - `space` — indentation unit (number of spaces, or a string like
 *   `"\t"`). Defaults to `0` (compact).
 * - `ignoreToString` — skip calling `toString()`. Defaults to `false`.
 *
 * **Example** (Compact output)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * console.log(Formatter.format({ a: 1, b: [2, 3] }))
 * // {"a":1,"b":[2,3]}
 * ```
 *
 * **Example** (Pretty-printed output)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * console.log(Formatter.format({ a: 1, b: [2, 3] }, { space: 2 }))
 * // {
 * //   "a": 1,
 * //   "b": [
 * //     2,
 * //     3
 * //   ]
 * // }
 * ```
 *
 * **Example** (Circular reference handling)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * const obj: any = { name: "loop" }
 * obj.self = obj
 * console.log(Formatter.format(obj))
 * // {"name":"loop","self":[Circular]}
 * ```
 *
 * See also: {@link formatJson}, {@link Formatter}
 *
 * @since 4.0.0
 */
export declare function format(input: unknown, options?: {
    readonly space?: number | string | undefined;
    readonly ignoreToString?: boolean | undefined;
}): string;
/**
 * Safely stringifies a value to JSON, silently dropping circular references.
 *
 * When to use:
 * - You need valid JSON output (unlike {@link format}).
 * - The input may contain circular references and you want them silently
 *   omitted rather than throwing a `TypeError`.
 *
 * Behavior:
 * - Does not mutate input.
 * - Uses `JSON.stringify` internally with a replacer that tracks seen
 *   objects.
 * - Circular references are replaced with `undefined` (omitted from
 *   output).
 * - `Redactable` values are automatically redacted before serialization.
 * - Types not supported by JSON (`BigInt`, `Symbol`, `undefined`,
 *   functions) follow standard `JSON.stringify` behavior (omitted or
 *   `null` in arrays).
 *
 * Options:
 * - `space` — indentation unit (number of spaces, or a string like
 *   `"\t"`). Defaults to `0` (compact).
 *
 * **Example** (Compact JSON)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * console.log(Formatter.formatJson({ name: "Alice", age: 30 }))
 * // {"name":"Alice","age":30}
 * ```
 *
 * **Example** (Circular reference handling)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * const obj: any = { name: "test" }
 * obj.self = obj
 * console.log(Formatter.formatJson(obj))
 * // {"name":"test"}
 * ```
 *
 * **Example** (Pretty-printed JSON)
 *
 * ```ts
 * import { Formatter } from "effect"
 *
 * console.log(Formatter.formatJson({ name: "Alice", age: 30 }, { space: 2 }))
 * // {
 * //   "name": "Alice",
 * //   "age": 30
 * // }
 * ```
 *
 * See also: {@link format}, {@link Formatter}
 *
 * @since 4.0.0
 */
export declare function formatJson(input: unknown, options?: {
    readonly space?: number | string | undefined;
}): string;
//# sourceMappingURL=Formatter.d.ts.map