import type * as Schema from "./Schema.ts";
/**
 * A single JSON Patch operation.
 *
 * Represents one transformation step in a JSON Patch document. This is a subset of RFC 6902, restricted to operations that can be applied deterministically without additional context.
 *
 * ## When to use this
 *
 * - Defining patch operation types in your code
 * - Manually constructing patch operations
 * - Type-checking patch operation structures
 *
 * ## Behavior
 *
 * - All fields are readonly; operations are immutable value objects
 * - Paths use JSON Pointer syntax; empty string `""` refers to the root document
 * - The `description` field is optional and can be used for documentation
 * - Operations are discriminated unions based on the `op` field
 *
 * **Example** (All operation types)
 *
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const addOp: JsonPatch.JsonPatchOperation = {
 *   op: "add",
 *   path: "/users/-",
 *   value: { id: 1, name: "Alice" }
 * }
 *
 * const removeOp: JsonPatch.JsonPatchOperation = {
 *   op: "remove",
 *   path: "/users/0"
 * }
 *
 * const replaceOp: JsonPatch.JsonPatchOperation = {
 *   op: "replace",
 *   path: "/users/0/name",
 *   value: "Bob"
 * }
 * ```
 *
 * ## See also
 *
 * - {@link JsonPatch} - Array of operations forming a complete patch
 * - {@link get} - Computes operations automatically from value differences
 * - {@link apply} - Applies operations to transform documents
 *
 * @category Model
 * @since 4.0.0
 */
export type JsonPatchOperation = {
    readonly op: "add";
    /**
     * JSON Pointer to the target location.
     *
     * For arrays, the last token may be `-` to append.
     */
    readonly path: string;
    readonly value: Schema.Json;
    readonly description?: string;
} | {
    readonly op: "remove";
    /** JSON Pointer to the target location. */
    readonly path: string;
    readonly description?: string;
} | {
    readonly op: "replace";
    /** JSON Pointer to the target location. Use `""` to replace the root document. */
    readonly path: string;
    readonly value: Schema.Json;
    readonly description?: string;
};
/**
 * A JSON Patch document (an ordered list of operations).
 *
 * Represents a complete transformation as a sequence of operations. Operations are applied in order, and later operations observe the changes made by earlier ones.
 *
 * ## When to use this
 *
 * - Storing or serializing patch documents
 * - Passing patches between functions or systems
 * - Type-checking patch arrays
 * - Validating patch structure
 *
 * ## Behavior
 *
 * - Operations are applied sequentially from first to last
 * - Empty arrays represent no-op patches (return original document)
 * - Later operations see the document state after earlier operations
 * - The array is readonly; individual operations are immutable
 *
 * **Example** (Multi-operation patch)
 *
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const patch: JsonPatch.JsonPatch = [
 *   { op: "add", path: "/items/-", value: "apple" },
 *   { op: "replace", path: "/count", value: 5 },
 *   { op: "remove", path: "/oldField" }
 * ]
 *
 * const result = JsonPatch.apply(patch, { count: 3, oldField: "value" })
 * // { count: 5, items: ["apple"] }
 * ```
 *
 * ## See also
 *
 * - {@link JsonPatchOperation} - Individual operation types
 * - {@link get} - Generates patches from value differences
 * - {@link apply} - Executes patches to transform documents
 *
 * @category Model
 * @since 4.0.0
 */
export type JsonPatch = ReadonlyArray<JsonPatchOperation>;
/**
 * Compute a patch that transforms `oldValue` into `newValue`.
 *
 * Generates a structural diff between two JSON values, producing a patch that when applied to `oldValue` yields `newValue`.
 *
 * ## When to use this
 *
 * - Computing differences between JSON documents
 * - Detecting changes in data structures
 * - Generating patches for synchronization or version control
 * - Creating minimal update operations from before/after states
 *
 * ## Behavior
 *
 * - Returns an empty array if values are identical (same reference or deep equal)
 * - Does not mutate inputs; returns a new patch array
 * - Primitives (numbers, strings, booleans, null) result in a root `replace` operation
 * - Arrays are compared by index position; no move or copy detection
 * - Objects are compared by key; keys processed in sorted order for stable output
 * - Array removals emitted from highest to lowest index to prevent index shifting
 * - Output is deterministic but not guaranteed to be minimal
 * - Nested structures are recursively diffed
 *
 * **Example** (Computing object diff)
 *
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const oldValue = { users: [{ id: 1, name: "Alice" }], count: 1 }
 * const newValue = { users: [{ id: 1, name: "Bob" }, { id: 2, name: "Charlie" }], count: 2 }
 *
 * const patch = JsonPatch.get(oldValue, newValue)
 * // [
 * //   { op: "replace", path: "/users/0/name", value: "Bob" },
 * //   { op: "add", path: "/users/1", value: { id: 2, name: "Charlie" } },
 * //   { op: "replace", path: "/count", value: 2 }
 * // ]
 * ```
 *
 * ## See also
 *
 * - {@link apply} - Applies the generated patch to a document
 * - {@link JsonPatchOperation} - The operation types in the patch
 *
 * @since 4.0.0
 */
export declare function get(oldValue: Schema.Json, newValue: Schema.Json): JsonPatch;
/**
 * Apply a JSON Patch to a document.
 *
 * Executes a sequence of patch operations on a JSON document, returning a new document with all transformations applied.
 *
 * ## When to use this
 *
 * - Applying patches generated by {@link get}
 * - Transforming documents with manually constructed patches
 * - Implementing patch-based update mechanisms
 * - Processing patch operations from external sources
 *
 * ## Behavior
 *
 * - Never mutates the input document; returns a new value
 * - Returns the original reference if patch is empty (no allocation)
 * - Operations applied sequentially; later operations see earlier changes
 * - Root replace (`path: ""`) returns the provided value directly
 * - Throws errors for invalid paths, missing properties, or out-of-bounds array indices
 * - Array operations preserve immutability by copying affected arrays
 * - Object operations preserve immutability by copying affected objects
 *
 * **Example** (Applying a patch)
 *
 * ```ts
 * import * as JsonPatch from "effect/JsonPatch"
 *
 * const document = { items: [1, 2, 3], total: 6 }
 * const patch: JsonPatch.JsonPatch = [
 *   { op: "add", path: "/items/-", value: 4 },
 *   { op: "replace", path: "/total", value: 10 }
 * ]
 *
 * const result = JsonPatch.apply(patch, document)
 * // { items: [1, 2, 3, 4], total: 10 }
 * ```
 *
 * ## See also
 *
 * - {@link get} - Generates patches from value differences
 * - {@link JsonPatchOperation} - The operation types being applied
 *
 * @since 4.0.0
 */
export declare function apply(patch: JsonPatch, oldValue: Schema.Json): Schema.Json;
//# sourceMappingURL=JsonPatch.d.ts.map