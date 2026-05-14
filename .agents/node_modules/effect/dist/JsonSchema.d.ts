/**
 * A plain object representing a single JSON Schema node.
 *
 * This is an open record type (`[x: string]: unknown`) so it can hold any
 * JSON Schema keyword. Most functions in this module accept or return this
 * type.
 *
 * @since 4.0.0
 */
export interface JsonSchema {
    [x: string]: unknown;
}
/**
 * The set of JSON Schema dialects supported by this module.
 *
 * - `"draft-07"` — JSON Schema Draft-07
 * - `"draft-2020-12"` — JSON Schema Draft 2020-12 (canonical internal form)
 * - `"openapi-3.1"` — OpenAPI 3.1 (uses Draft 2020-12 as its schema dialect)
 * - `"openapi-3.0"` — OpenAPI 3.0 (uses a Draft-04/07 subset with extensions)
 *
 * @since 4.0.0
 */
export type Dialect = "draft-07" | "draft-2020-12" | "openapi-3.1" | "openapi-3.0";
/**
 * The JSON Schema primitive type names.
 *
 * @since 4.0.0
 */
export type Type = "string" | "number" | "boolean" | "array" | "object" | "null" | "integer";
/**
 * A record of named JSON Schema definitions, keyed by definition name.
 *
 * @since 4.0.0
 */
export interface Definitions extends Record<string, JsonSchema> {
}
/**
 * A structured container for a single JSON Schema and its associated
 * definitions.
 *
 * - Use when you need to carry a root schema together with its
 *   shared definitions.
 * - Use when converting between dialects via the `from*` / `to*` functions.
 *
 * The `schema` field holds the root schema *without* the definitions
 * collection. Root definitions are stored separately in `definitions` and
 * referenced via:
 * - `#/$defs/<name>` for Draft-2020-12
 * - `#/definitions/<name>` for Draft-07
 * - `#/components/schemas/<name>` for OpenAPI 3.1 and OpenAPI 3.0
 *
 * **Example** (Inspecting a parsed document)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "string",
 *   $defs: { Trimmed: { type: "string", minLength: 1 } }
 * }
 *
 * const doc = JsonSchema.fromSchemaDraft2020_12(raw)
 *
 * console.log(doc.dialect)     // "draft-2020-12"
 * console.log(doc.schema)      // { type: "string" }
 * console.log(doc.definitions) // { Trimmed: { type: "string", minLength: 1 } }
 * ```
 *
 * @see {@link MultiDocument}
 * @see {@link fromSchemaDraft2020_12}
 *
 * @since 4.0.0
 */
export interface Document<D extends Dialect> {
    readonly dialect: D;
    readonly schema: JsonSchema;
    readonly definitions: Definitions;
}
/**
 * Like {@link Document}, but carries multiple root schemas that share a
 * single definitions pool. The `schemas` tuple is non-empty (at least one
 * element).
 *
 * - Use when generating several schemas (e.g. request body + response body)
 *   that reference the same set of definitions.
 *
 * @see {@link Document}
 * @see {@link toMultiDocumentOpenApi3_1}
 *
 * @since 4.0.0
 */
export interface MultiDocument<D extends Dialect> {
    readonly dialect: D;
    readonly schemas: readonly [JsonSchema, ...Array<JsonSchema>];
    readonly definitions: Definitions;
}
/**
 * The `$schema` meta-schema URI for JSON Schema Draft-07.
 *
 * @since 4.0.0
 */
export declare const META_SCHEMA_URI_DRAFT_07 = "http://json-schema.org/draft-07/schema";
/**
 * The `$schema` meta-schema URI for JSON Schema Draft 2020-12.
 *
 * @since 4.0.0
 */
export declare const META_SCHEMA_URI_DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema";
/**
 * Parses a raw Draft-07 JSON Schema into a `Document<"draft-2020-12">`.
 *
 * - Use when you have a JSON Schema that follows Draft-07 conventions.
 * - Converts Draft-07 tuple syntax (`items` as array + `additionalItems`)
 *   to Draft-2020-12 form (`prefixItems` + `items`).
 * - Rewrites `#/definitions/...` refs to `#/$defs/...`.
 * - Extracts root-level `definitions` into the `definitions` field.
 * - Does not mutate the input. Allocates a new `Document`.
 * - Unsupported keywords (e.g. `if`/`then`/`else`, `$id`) are dropped.
 *
 * **Example** (Parsing a Draft-07 schema)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "object",
 *   properties: {
 *     tags: {
 *       type: "array",
 *       items: { type: "string" }
 *     }
 *   }
 * }
 *
 * const doc = JsonSchema.fromSchemaDraft07(raw)
 * console.log(doc.dialect) // "draft-2020-12"
 * console.log(doc.schema.properties) // { tags: { type: "array", items: { type: "string" } } }
 * ```
 *
 * @see {@link fromSchemaDraft2020_12}
 * @see {@link fromSchemaOpenApi3_0}
 * @see {@link toDocumentDraft07}
 *
 * @since 4.0.0
 */
export declare function fromSchemaDraft07(js: JsonSchema): Document<"draft-2020-12">;
/**
 * Parses a raw Draft-2020-12 JSON Schema into a `Document<"draft-2020-12">`.
 *
 * - Use when you already have a schema in Draft-2020-12 format.
 * - Separates `$defs` from the root schema into the `definitions` field.
 * - Does not mutate the input. Allocates a new `Document`.
 * - Unlike {@link fromSchemaDraft07}, this performs no keyword rewriting.
 *
 * **Example** (Parsing a Draft-2020-12 schema)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "number",
 *   minimum: 0,
 *   $defs: { PositiveInt: { type: "integer", minimum: 1 } }
 * }
 *
 * const doc = JsonSchema.fromSchemaDraft2020_12(raw)
 * console.log(doc.schema)      // { type: "number", minimum: 0 }
 * console.log(doc.definitions) // { PositiveInt: { type: "integer", minimum: 1 } }
 * ```
 *
 * @see {@link fromSchemaDraft07}
 * @see {@link fromSchemaOpenApi3_1}
 *
 * @since 4.0.0
 */
export declare function fromSchemaDraft2020_12(js: JsonSchema): Document<"draft-2020-12">;
/**
 * Parses a raw OpenAPI 3.1 JSON Schema into a `Document<"draft-2020-12">`.
 *
 * - Use when consuming schemas from an OpenAPI 3.1 specification.
 * - Rewrites `#/components/schemas/...` refs to `#/$defs/...`.
 * - Delegates to {@link fromSchemaDraft2020_12} after rewriting refs.
 * - Does not mutate the input. Allocates a new `Document`.
 *
 * **Example** (Parsing an OpenAPI 3.1 schema)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "object",
 *   properties: {
 *     user: { $ref: "#/components/schemas/User" }
 *   }
 * }
 *
 * const doc = JsonSchema.fromSchemaOpenApi3_1(raw)
 * // $ref is rewritten to Draft-2020-12 form
 * console.log(doc.schema.properties) // { user: { $ref: "#/$defs/User" } }
 * ```
 *
 * @see {@link fromSchemaOpenApi3_0}
 * @see {@link toMultiDocumentOpenApi3_1}
 *
 * @since 4.0.0
 */
export declare function fromSchemaOpenApi3_1(js: JsonSchema): Document<"draft-2020-12">;
/**
 * Parses a raw OpenAPI 3.0 JSON Schema into a `Document<"draft-2020-12">`.
 *
 * - Use when consuming schemas from an OpenAPI 3.0 specification.
 * - Handles OpenAPI 3.0 extensions: `nullable`, singular `example`,
 *   boolean `exclusiveMinimum`/`exclusiveMaximum`.
 * - Normalizes the schema to Draft-07 first, then converts to
 *   Draft-2020-12 via {@link fromSchemaDraft07}.
 * - Does not mutate the input. Allocates a new `Document`.
 *
 * **Example** (Parsing an OpenAPI 3.0 nullable schema)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "string",
 *   nullable: true
 * }
 *
 * const doc = JsonSchema.fromSchemaOpenApi3_0(raw)
 * // nullable is expanded into a type array
 * console.log(doc.schema.type) // ["string", "null"]
 * ```
 *
 * @see {@link fromSchemaOpenApi3_1}
 * @see {@link fromSchemaDraft07}
 *
 * @since 4.0.0
 */
export declare function fromSchemaOpenApi3_0(schema: JsonSchema): Document<"draft-2020-12">;
/**
 * Converts a `Document<"draft-2020-12">` to a `Document<"draft-07">`.
 *
 * - Use when you need to output a schema in Draft-07 format.
 * - Rewrites `#/$defs/...` refs to `#/definitions/...`.
 * - Converts Draft-2020-12 tuple syntax (`prefixItems` + `items`) to
 *   Draft-07 form (`items` as array + `additionalItems`).
 * - Converts both the root schema and all definitions.
 * - Does not mutate the input. Allocates a new `Document`.
 * - Unsupported Draft-2020-12 keywords are dropped.
 *
 * **Example** (Converting to Draft-07)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const doc = JsonSchema.fromSchemaDraft2020_12({
 *   type: "array",
 *   prefixItems: [{ type: "string" }, { type: "number" }],
 *   items: { type: "boolean" }
 * })
 *
 * const draft07 = JsonSchema.toDocumentDraft07(doc)
 * console.log(draft07.dialect)                // "draft-07"
 * console.log(draft07.schema.items)           // [{ type: "string" }, { type: "number" }]
 * console.log(draft07.schema.additionalItems) // { type: "boolean" }
 * ```
 *
 * @see {@link fromSchemaDraft07}
 * @see {@link toMultiDocumentOpenApi3_1}
 *
 * @since 4.0.0
 */
export declare function toDocumentDraft07(document: Document<"draft-2020-12">): Document<"draft-07">;
/**
 * Converts a `MultiDocument<"draft-2020-12">` to a
 * `MultiDocument<"openapi-3.1">`.
 *
 * - Use when generating an OpenAPI 3.1 specification from internal schemas.
 * - Rewrites `#/$defs/...` refs to `#/components/schemas/...`.
 * - Sanitizes definition keys to match the OpenAPI component key pattern
 *   (`^[a-zA-Z0-9.\-_]+$`), replacing invalid characters with `_`.
 * - Updates all `$ref` pointers to use the sanitized keys.
 * - Converts all schemas and definitions in the multi-document.
 * - Does not mutate the input. Allocates a new `MultiDocument`.
 *
 * **Example** (Converting to OpenAPI 3.1)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const multi: JsonSchema.MultiDocument<"draft-2020-12"> = {
 *   dialect: "draft-2020-12",
 *   schemas: [{ $ref: "#/$defs/User" }],
 *   definitions: {
 *     User: { type: "object", properties: { name: { type: "string" } } }
 *   }
 * }
 *
 * const openapi = JsonSchema.toMultiDocumentOpenApi3_1(multi)
 * console.log(openapi.dialect) // "openapi-3.1"
 * console.log(openapi.schemas[0]) // { $ref: "#/components/schemas/User" }
 * ```
 *
 * @see {@link toDocumentDraft07}
 * @see {@link MultiDocument}
 *
 * @since 4.0.0
 */
export declare function toMultiDocumentOpenApi3_1(multiDocument: MultiDocument<"draft-2020-12">): MultiDocument<"openapi-3.1">;
/**
 * Resolves a `$ref` string by looking up the last path segment in a
 * definitions map.
 *
 * - Use when you need to dereference a `$ref` pointer to get the
 *   actual schema it points to.
 * - Only resolves the final segment of the ref path (e.g. `"User"` from
 *   `"#/$defs/User"`); does not follow arbitrary JSON Pointer paths.
 * - Returns `undefined` if the definition is not found.
 * - Does not mutate anything. Pure function.
 *
 * **Example** (Resolving a $ref)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const definitions: JsonSchema.Definitions = {
 *   User: { type: "object", properties: { name: { type: "string" } } }
 * }
 *
 * const result = JsonSchema.resolve$ref("#/$defs/User", definitions)
 * console.log(result) // { type: "object", properties: { name: { type: "string" } } }
 *
 * const missing = JsonSchema.resolve$ref("#/$defs/Unknown", definitions)
 * console.log(missing) // undefined
 * ```
 *
 * @see {@link resolveTopLevel$ref}
 * @see {@link Definitions}
 *
 * @since 4.0.0
 */
export declare function resolve$ref($ref: string, definitions: Definitions): JsonSchema | undefined;
/**
 * If the root schema of a document is a `$ref`, resolves it against the
 * document's definitions and returns a new document with the inlined
 * schema. Returns the original document unchanged if the root schema is
 * not a `$ref` or if the referenced definition is not found.
 *
 * - Use to dereference a top-level `$ref` before inspecting the root
 *   schema's properties directly.
 * - Does not mutate the input. Returns the same object if no change is
 *   needed, or a shallow copy with the resolved schema.
 *
 * **Example** (Resolving a top-level $ref)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const doc: JsonSchema.Document<"draft-2020-12"> = {
 *   dialect: "draft-2020-12",
 *   schema: { $ref: "#/$defs/User" },
 *   definitions: {
 *     User: { type: "object", properties: { name: { type: "string" } } }
 *   }
 * }
 *
 * const resolved = JsonSchema.resolveTopLevel$ref(doc)
 * console.log(resolved.schema) // { type: "object", properties: { name: { type: "string" } } }
 * ```
 *
 * @see {@link resolve$ref}
 * @see {@link Document}
 *
 * @since 4.0.0
 */
export declare function resolveTopLevel$ref(document: Document<"draft-2020-12">): Document<"draft-2020-12">;
//# sourceMappingURL=JsonSchema.d.ts.map