/**
 * Convert JSON Schema documents between dialects (Draft-07, Draft-2020-12,
 * OpenAPI 3.0, OpenAPI 3.1). All dialects are normalized to an internal
 * `Document<"draft-2020-12">` representation before optional conversion to
 * an output dialect.
 *
 * ## Mental model
 *
 * - **JsonSchema** — a plain object with string keys; represents any single
 *   JSON Schema node.
 * - **Dialect** — one of `"draft-07"`, `"draft-2020-12"`, `"openapi-3.1"`,
 *   or `"openapi-3.0"`.
 * - **Document** — a structured container holding a root `schema`, its
 *   companion `definitions`, and the target `dialect`. Definitions are
 *   stored separately from the root schema so they can be relocated when
 *   converting between dialects.
 * - **MultiDocument** — same as `Document` but carries multiple root
 *   schemas (at least one). Useful when generating several schemas that
 *   share a single definitions pool.
 * - **Definitions** — a `Record<string, JsonSchema>` keyed by definition
 *   name. The ref pointer prefix depends on the dialect.
 * - **`from*` functions** — parse a raw JSON Schema object into the
 *   canonical `Document<"draft-2020-12">`.
 * - **`to*` functions** — convert from the canonical representation to a
 *   specific output dialect.
 *
 * ## Common tasks
 *
 * - Parse a Draft-07 schema → {@link fromSchemaDraft07}
 * - Parse a Draft-2020-12 schema → {@link fromSchemaDraft2020_12}
 * - Parse an OpenAPI 3.1 schema → {@link fromSchemaOpenApi3_1}
 * - Parse an OpenAPI 3.0 schema → {@link fromSchemaOpenApi3_0}
 * - Convert to Draft-07 output → {@link toDocumentDraft07}
 * - Convert to OpenAPI 3.1 output → {@link toMultiDocumentOpenApi3_1}
 * - Resolve a `$ref` against definitions → {@link resolve$ref}
 * - Inline the root `$ref` of a document → {@link resolveTopLevel$ref}
 *
 * ## Gotchas
 *
 * - All `from*` functions normalize to `Document<"draft-2020-12">`
 *   regardless of the input dialect.
 * - Unsupported or unrecognized JSON Schema keywords are silently dropped
 *   during conversion.
 * - Draft-07 tuple syntax (`items` as array + `additionalItems`) is
 *   converted to 2020-12 form (`prefixItems` + `items`), and vice-versa.
 * - OpenAPI 3.0 `nullable: true` is expanded into `type` arrays or
 *   `anyOf` unions. The `nullable` keyword is removed.
 * - OpenAPI 3.0 singular `example` is converted to `examples` (array).
 * - {@link resolve$ref} only looks up the last segment of the ref path in
 *   the definitions map; it does not follow arbitrary JSON Pointer paths.
 *
 * ## Quickstart
 *
 * **Example** (Parse a Draft-07 schema and convert to Draft-07 output)
 *
 * ```ts
 * import { JsonSchema } from "effect"
 *
 * const raw: JsonSchema.JsonSchema = {
 *   type: "object",
 *   properties: {
 *     name: { type: "string" }
 *   },
 *   required: ["name"]
 * }
 *
 * // Parse into canonical form
 * const doc = JsonSchema.fromSchemaDraft07(raw)
 *
 * // Convert back to Draft-07
 * const draft07 = JsonSchema.toDocumentDraft07(doc)
 *
 * console.log(draft07.dialect) // "draft-07"
 * console.log(draft07.schema) // { type: "object", properties: { name: { type: "string" } }, required: ["name"] }
 * ```
 *
 * ## See also
 *
 * - {@link Document}
 * - {@link MultiDocument}
 * - {@link fromSchemaDraft07}
 * - {@link toDocumentDraft07}
 * - {@link resolve$ref}
 *
 * @since 4.0.0
 */
import * as Arr from "./Array.js";
import { unescapeToken } from "./JsonPointer.js";
import * as Predicate from "./Predicate.js";
import * as Rec from "./Record.js";
/**
 * The `$schema` meta-schema URI for JSON Schema Draft-07.
 *
 * @since 4.0.0
 */
export const META_SCHEMA_URI_DRAFT_07 = "http://json-schema.org/draft-07/schema";
/**
 * The `$schema` meta-schema URI for JSON Schema Draft 2020-12.
 *
 * @since 4.0.0
 */
export const META_SCHEMA_URI_DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema";
const RE_DEFINITIONS = /^#\/definitions(?=\/|$)/;
const RE_DEFS = /^#\/\$defs(?=\/|$)/;
const RE_COMPONENTS_SCHEMAS = /^#\/components\/schemas(?=\/|$)/;
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
export function fromSchemaDraft07(js) {
  let definitions;
  const schema = walk(js, true);
  return {
    dialect: "draft-2020-12",
    schema,
    definitions: definitions ?? {}
  };
  function walk(node, isRoot) {
    if (Array.isArray(node)) return node.map(v => walk(v, false));
    if (!Predicate.isObject(node)) return node;
    const out = {};
    let prefixItems = undefined;
    let additionalItems = undefined;
    for (const k of Object.keys(node)) {
      const v = node[k];
      switch (k) {
        case "$ref":
          out.$ref = typeof v === "string" ? v.replace(RE_DEFINITIONS, "#/$defs") : v;
          break;
        case "definitions":
          {
            const mapped = walk_object(v, walk);
            if (isRoot) {
              definitions = mapped;
            } else {
              out.definitions = mapped ?? v;
            }
            break;
          }
        case "items":
          prefixItems = v;
          break;
        case "additionalItems":
          additionalItems = v;
          break;
        case "properties":
        case "patternProperties":
          {
            const mapped = walk_object(v, walk);
            out[k] = mapped ?? v;
            break;
          }
        case "additionalProperties":
        case "propertyNames":
          out[k] = walk(v, false);
          break;
        case "allOf":
        case "anyOf":
        case "oneOf":
          out[k] = Array.isArray(v) ? v.map(x => walk(x, false)) : v;
          break;
        case "type":
        case "required":
        case "enum":
        case "const":
        case "title":
        case "description":
        case "default":
        case "examples":
        case "format":
        case "readOnly":
        case "writeOnly":
        case "pattern":
        case "minimum":
        case "maximum":
        case "exclusiveMinimum":
        case "exclusiveMaximum":
        case "minLength":
        case "maxLength":
        case "minItems":
        case "maxItems":
        case "minProperties":
        case "maxProperties":
        case "multipleOf":
        case "uniqueItems":
          out[k] = v;
          break;
        default:
          break;
      }
    }
    // Draft-07 tuples -> 2020-12 tuples
    if (prefixItems !== undefined) {
      if (Array.isArray(prefixItems)) {
        out.prefixItems = prefixItems.map(x => walk(x, false));
        if (additionalItems !== undefined) out.items = walk(additionalItems, false);
      } else {
        out.items = walk(prefixItems, false);
      }
    }
    return out;
  }
}
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
export function fromSchemaDraft2020_12(js) {
  const {
    $defs,
    ...schema
  } = js;
  return {
    dialect: "draft-2020-12",
    schema,
    definitions: Predicate.isObject($defs) ? $defs : {}
  };
}
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
export function fromSchemaOpenApi3_1(js) {
  const schema = rewrite_refs(js, ref => ref.replace(RE_COMPONENTS_SCHEMAS, "#/$defs"));
  return fromSchemaDraft2020_12(schema);
}
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
export function fromSchemaOpenApi3_0(schema) {
  const normalized = normalize_OpenApi3_0_to_Draft07(schema);
  return fromSchemaDraft07(normalized);
}
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
export function toDocumentDraft07(document) {
  return {
    dialect: "draft-07",
    schema: toSchemaDraft07(document.schema),
    definitions: Rec.map(document.definitions, toSchemaDraft07)
  };
}
function toSchemaDraft07(schema) {
  return rewrite(schema);
  function rewrite(node) {
    return walk(rewrite_refs(node, ref => ref.replace(RE_DEFS, "#/definitions")), true);
  }
  function walk(node, _isRoot) {
    if (Array.isArray(node)) return node.map(v => walk(v, false));
    if (!Predicate.isObject(node)) return node;
    const src = node;
    const out = {};
    let prefixItems = undefined;
    let items = undefined;
    for (const k of Object.keys(src)) {
      const v = src[k];
      switch (k) {
        // We already rewrote $ref via rewrite_refs, so just copy it through.
        case "$ref":
        case "type":
        case "required":
        case "enum":
        case "const":
        case "title":
        case "description":
        case "default":
        case "examples":
        case "format":
        case "pattern":
        case "minimum":
        case "maximum":
        case "exclusiveMinimum":
        case "exclusiveMaximum":
        case "minLength":
        case "maxLength":
        case "minItems":
        case "maxItems":
        case "minProperties":
        case "maxProperties":
        case "multipleOf":
        case "uniqueItems":
          out[k] = v;
          break;
        // Schema maps
        case "properties":
        case "patternProperties":
          {
            const mapped = walk_object(v, walk);
            out[k] = mapped ?? v;
            break;
          }
        // Single subschemas
        case "additionalProperties":
        case "propertyNames":
          out[k] = walk(v, false);
          break;
        // Schema arrays
        case "allOf":
        case "anyOf":
        case "oneOf":
          out[k] = Array.isArray(v) ? v.map(x => walk(x, false)) : v;
          break;
        // Tuple handling (2020-12 form)
        case "prefixItems":
          prefixItems = v;
          break;
        case "items":
          items = v;
          break;
        default:
          // drop everything else (subset)
          break;
      }
    }
    // 2020-12 tuples -> Draft-07 tuples
    if (prefixItems !== undefined) {
      if (Array.isArray(prefixItems)) {
        out.items = prefixItems.map(x => walk(x, false));
        if (items !== undefined) out.additionalItems = walk(items, false);
      } else {
        // Non-standard, but keep a reasonable behavior
        out.items = walk(prefixItems, false);
      }
    } else if (items !== undefined) {
      // Regular items schema stays as items
      out.items = walk(items, false);
    }
    return out;
  }
}
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
export function toMultiDocumentOpenApi3_1(multiDocument) {
  const keyMap = new Map();
  for (const key of Object.keys(multiDocument.definitions)) {
    const sanitized = sanitizeOpenApiComponentsSchemasKey(key);
    if (sanitized !== key) {
      keyMap.set(key, sanitized);
    }
  }
  function rewrite(schema) {
    return rewrite_refs(schema, $ref => {
      const tokens = $ref.split("/");
      if (tokens.length > 0) {
        const identifier = unescapeToken(tokens[tokens.length - 1]);
        const sanitized = keyMap.get(identifier);
        if (sanitized !== undefined) {
          $ref = tokens.slice(0, -1).join("/") + "/" + sanitized;
        }
      }
      return $ref.replace(RE_DEFS, "#/components/schemas");
    });
  }
  return {
    dialect: "openapi-3.1",
    schemas: Arr.map(multiDocument.schemas, rewrite),
    definitions: Rec.mapEntries(multiDocument.definitions, (definition, key) => [keyMap.get(key) ?? key, rewrite(definition)])
  };
}
/** @internal */
export const VALID_OPEN_API_COMPONENTS_SCHEMAS_KEY_REGEXP = /^[a-zA-Z0-9.\-_]+$/;
/**
 * Returns a sanitized key for an OpenAPI component schema.
 * Should match the `^[a-zA-Z0-9.\-_]+$` regular expression.
 *
 * @internal
 */
export function sanitizeOpenApiComponentsSchemasKey(s) {
  if (s.length === 0) return "_";
  if (VALID_OPEN_API_COMPONENTS_SCHEMAS_KEY_REGEXP.test(s)) return s;
  const out = [];
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code !== undefined && (code >= 48 && code <= 57 ||
    // 0-9
    code >= 65 && code <= 90 ||
    // A-Z
    code >= 97 && code <= 122 ||
    // a-z
    code === 46 ||
    // .
    code === 45 ||
    // -
    code === 95) // _
    ) {
      out.push(ch);
    } else {
      out.push("_");
    }
  }
  return out.join("");
}
function rewrite_refs(node, f) {
  if (Array.isArray(node)) return node.map(v => rewrite_refs(v, f));
  if (!Predicate.isObject(node)) return node;
  const out = {};
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (k === "$ref") {
      out[k] = typeof v === "string" ? f(v) : v;
    } else if (Array.isArray(v) || Predicate.isObject(v)) {
      out[k] = rewrite_refs(v, f);
    } else {
      out[k] = v;
    }
  }
  return out;
}
function walk_object(value, walk) {
  if (!Predicate.isObject(value)) return undefined;
  const out = {};
  for (const k of Object.keys(value)) out[k] = walk(value[k], false);
  return out;
}
function normalize_OpenApi3_0_to_Draft07(node) {
  if (Array.isArray(node)) return node.map(normalize_OpenApi3_0_to_Draft07);
  if (!Predicate.isObject(node)) return node;
  const src = node;
  let out = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (k === "$ref" && typeof v === "string") {
      out[k] = v.replace(RE_COMPONENTS_SCHEMAS, "#/definitions");
    } else if (k === "example") {
      if (src.examples === undefined) {
        out.examples = [v];
      }
    } else if (Array.isArray(v) || Predicate.isObject(v)) {
      out[k] = normalize_OpenApi3_0_to_Draft07(v);
    } else {
      out[k] = v;
    }
  }
  // Draft-04-style numeric exclusivity booleans
  out = adjust_exclusivity(out);
  // OpenAPI 3.0 nullable
  if (out.nullable === true) {
    out = apply_nullable(out);
  }
  delete out.nullable;
  return out;
}
function adjust_exclusivity(node) {
  let out = node;
  if (typeof out.exclusiveMinimum === "boolean") {
    if (out.exclusiveMinimum === true && typeof out.minimum === "number") {
      out = {
        ...out,
        exclusiveMinimum: out.minimum
      };
      delete out.minimum;
    } else {
      out = {
        ...out
      };
      delete out.exclusiveMinimum;
    }
  }
  if (typeof out.exclusiveMaximum === "boolean") {
    if (out.exclusiveMaximum === true && typeof out.maximum === "number") {
      out = {
        ...out,
        exclusiveMaximum: out.maximum
      };
      delete out.maximum;
    } else {
      out = {
        ...out
      };
      delete out.exclusiveMaximum;
    }
  }
  return out;
}
function apply_nullable(node) {
  // enum widening
  if (Array.isArray(node.enum)) {
    return widen_type({
      ...node,
      enum: node.enum.includes(null) ? node.enum : [...node.enum, null]
    });
  }
  // type widening
  if (node.type !== undefined) return widen_type(node);
  // const === null
  if (node.const === null) return node;
  // fallback
  return {
    anyOf: [node, {
      type: "null"
    }]
  };
}
function widen_type(node) {
  const t = node.type;
  if (typeof t === "string") return t === "null" ? node : {
    ...node,
    type: [t, "null"]
  };
  if (Array.isArray(t)) return t.includes("null") ? node : {
    ...node,
    type: [...t, "null"]
  };
  return node;
}
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
export function resolve$ref($ref, definitions) {
  const tokens = $ref.split("/");
  if (tokens.length > 0) {
    const identifier = unescapeToken(tokens[tokens.length - 1]);
    const definition = definitions[identifier];
    if (definition !== undefined) {
      return definition;
    }
  }
}
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
export function resolveTopLevel$ref(document) {
  if (typeof document.schema.$ref === "string") {
    const schema = resolve$ref(document.schema.$ref, document.definitions);
    if (schema !== undefined) {
      return {
        ...document,
        schema
      };
    }
  }
  return document;
}
//# sourceMappingURL=JsonSchema.js.map