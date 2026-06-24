/**
 * Serializable intermediate representation (IR) of Effect Schema types.
 *
 * `SchemaRepresentation` sits between the internal `SchemaAST` and external
 * formats (JSON Schema, generated TypeScript code, serialized JSON). A
 * {@link Representation} is a discriminated union describing the *shape* of a
 * schema — its types, checks, annotations, and references — in a form that
 * can be round-tripped through JSON and used for code generation.
 *
 * ## Mental model
 *
 * - **Representation**: A tagged union (`_tag`) of all supported schema shapes:
 *   primitives, literals, objects, arrays, unions, declarations, references,
 *   and suspensions.
 * - **Document**: A single {@link Representation} paired with a map of named
 *   {@link References} (analogous to JSON Schema `$defs`).
 * - **MultiDocument**: Like `Document` but holds one or more representations
 *   sharing the same references.
 * - **Check / Filter / FilterGroup**: Validation constraints (min length,
 *   pattern, integer, etc.) attached to types that support them.
 * - **Meta types**: Typed metadata for checks on each category — e.g.
 *   {@link StringMeta}, {@link NumberMeta}, {@link ArraysMeta}.
 * - **Reviver**: A callback used by {@link toSchema} and {@link toCodeDocument}
 *   to handle `Declaration` nodes (custom types like `Option`, `Date`, etc.).
 * - **Code / CodeDocument**: Output of {@link toCodeDocument} — TypeScript
 *   source strings for runtime schemas and their type-level counterparts.
 *
 * ## Common tasks
 *
 * - Convert a Schema AST to a Document → {@link fromAST}
 * - Convert multiple ASTs to a MultiDocument → {@link fromASTs}
 * - Reconstruct a runtime Schema from a Document → {@link toSchema}
 * - Convert a Document to JSON Schema → {@link toJsonSchemaDocument}
 * - Convert a MultiDocument to JSON Schema → {@link toJsonSchemaMultiDocument}
 * - Parse a JSON Schema document into a Document → {@link fromJsonSchemaDocument}
 * - Parse a JSON Schema multi-document → {@link fromJsonSchemaMultiDocument}
 * - Generate TypeScript code from a MultiDocument → {@link toCodeDocument}
 * - Serialize/deserialize a Document as JSON → {@link DocumentFromJson}
 * - Serialize/deserialize a MultiDocument as JSON → {@link MultiDocumentFromJson}
 * - Wrap a Document as a MultiDocument → {@link toMultiDocument}
 *
 * ## Gotchas
 *
 * - `Declaration` nodes require a {@link Reviver} to reconstruct complex types
 *   (e.g. `Option`, `Date`). Without one, `toSchema` falls back to the
 *   declaration's `encodedSchema`. Use {@link toSchemaDefaultReviver} for
 *   built-in Effect types.
 * - `Reference` nodes are resolved against the `references` map in the
 *   `Document`. An unresolvable `$ref` throws at runtime.
 * - `Suspend` wraps a single `thunk` representation; it is used for recursive
 *   schemas. Circular references are handled by lazy resolution in
 *   {@link toSchema}.
 * - The `$`-prefixed exports (e.g. {@link $Representation}, {@link $Document})
 *   are Schema codecs for the representation types themselves — use them to
 *   validate or encode/decode representation data, not application data.
 *
 * ## Quickstart
 *
 * **Example** (Round-trip through JSON)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const Person = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Int
 * })
 *
 * // Schema AST → Document
 * const doc = SchemaRepresentation.fromAST(Person.ast)
 *
 * // Document → JSON Schema
 * const jsonSchema = SchemaRepresentation.toJsonSchemaDocument(doc)
 *
 * // Document → runtime Schema
 * const reconstructed = SchemaRepresentation.toSchema(doc)
 * ```
 *
 * ## See also
 *
 * - {@link Representation} — the core tagged union
 * - {@link Document} — single-schema container
 * - {@link fromAST} — entry point from Schema AST
 * - {@link toSchema} — reconstruct a runtime Schema
 * - {@link toCodeDocument} — generate TypeScript code
 *
 * @since 4.0.0
 */
import * as Arr from "./Array.js";
import { format, formatPropertyKey } from "./Formatter.js";
import { collectBrands } from "./internal/schema/annotations.js";
import * as InternalRepresentation from "./internal/schema/representation.js";
import { unescapeToken } from "./JsonPointer.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
import * as Rec from "./Record.js";
import * as Schema from "./Schema.js";
import * as Getter from "./SchemaGetter.js";
// -----------------------------------------------------------------------------
// schemas
// -----------------------------------------------------------------------------
const Representation$ref = /*#__PURE__*/Schema.suspend(() => $Representation);
const toJsonAnnotationsBlacklist = /*#__PURE__*/new Set([...InternalRepresentation.fromASTBlacklist, "expected", "contentMediaType", "contentSchema"]);
/**
 * Schema codec for {@link PrimitiveTree}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $PrimitiveTree = /*#__PURE__*/Schema.Tree(/*#__PURE__*/Schema.Union([Schema.Null, Schema.Number,
// allows NaN, Infinity, -Infinity
Schema.Boolean, Schema.BigInt, Schema.Symbol, Schema.String]));
const isPrimitiveTree = /*#__PURE__*/Schema.is($PrimitiveTree);
/**
 * Schema codec for `Schema.Annotations.Annotations`. Filters out internal
 * annotation keys and non-primitive values during encoding.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Annotations = /*#__PURE__*/Schema.Record(Schema.String, Schema.Unknown).pipe(Schema.encodeTo(Schema.Record(Schema.String, $PrimitiveTree), {
  decode: Getter.passthrough(),
  encode: Getter.transformOptional(Option.flatMap(r => {
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      if (!toJsonAnnotationsBlacklist.has(k) && isPrimitiveTree(v)) {
        out[k] = v;
      }
    }
    return Rec.isEmptyRecord(out) ? Option.none() : Option.some(out);
  }))
})).annotate({
  identifier: "Annotations"
});
/**
 * Schema codec for the {@link Null} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Null = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Null"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Null"
});
/**
 * Schema codec for the {@link Undefined} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Undefined = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Undefined"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Undefined"
});
/**
 * Schema codec for the {@link Void} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Void = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Void"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Void"
});
/**
 * Schema codec for the {@link Never} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Never = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Never"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Never"
});
/**
 * Schema codec for the {@link Unknown} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Unknown = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Unknown"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Unknown"
});
/**
 * Schema codec for the {@link Any} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Any = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Any"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Any"
});
const $IsStringFinite = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isStringFinite"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsStringFinite"
});
const $IsStringBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isStringBigInt"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsStringBigInt"
});
const $IsStringSymbol = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isStringSymbol"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsStringSymbol"
});
const $IsTrimmed = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isTrimmed"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsTrimmed"
});
const $IsUUID = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isUUID"),
  regExp: Schema.RegExp,
  version: Schema.UndefinedOr(Schema.Literals([1, 2, 3, 4, 5, 6, 7, 8]))
}).annotate({
  identifier: "IsUUID"
});
const $IsULID = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isULID"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsULID"
});
const $IsBase64 = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isBase64"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsBase64"
});
const $IsBase64Url = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isBase64Url"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsBase64Url"
});
const $IsStartsWith = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isStartsWith"),
  startsWith: Schema.String,
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsStartsWith"
});
const $IsEndsWith = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isEndsWith"),
  endsWith: Schema.String,
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsEndsWith"
});
const $IsIncludes = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isIncludes"),
  includes: Schema.String,
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsIncludes"
});
const $IsUppercased = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isUppercased"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsUppercased"
});
const $IsLowercased = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLowercased"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsLowercased"
});
const $IsCapitalized = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isCapitalized"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsCapitalized"
});
const $IsUncapitalized = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isUncapitalized"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsUncapitalized"
});
const NonNegativeInt = /*#__PURE__*/Schema.Int.check(/*#__PURE__*/Schema.isGreaterThanOrEqualTo(0));
const $IsMinLength = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMinLength"),
  minLength: NonNegativeInt
}).annotate({
  identifier: "IsMinLength"
});
const $IsMaxLength = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMaxLength"),
  maxLength: NonNegativeInt
}).annotate({
  identifier: "IsMaxLength"
});
const $IsLengthBetween = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLengthBetween"),
  minimum: NonNegativeInt,
  maximum: NonNegativeInt
}).annotate({
  identifier: "IsLengthBetween"
});
const $IsPattern = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isPattern"),
  regExp: Schema.RegExp
}).annotate({
  identifier: "IsPattern"
});
/**
 * Schema codec for {@link StringMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $StringMeta = /*#__PURE__*/Schema.Union([$IsStringFinite, $IsStringBigInt, $IsStringSymbol, $IsTrimmed, $IsUUID, $IsULID, $IsBase64, $IsBase64Url, $IsStartsWith, $IsEndsWith, $IsIncludes, $IsUppercased, $IsLowercased, $IsCapitalized, $IsUncapitalized, $IsMinLength, $IsMaxLength, $IsPattern, $IsLengthBetween]).annotate({
  identifier: "StringMeta"
});
function makeCheck(meta, identifier) {
  const Check$ref = Schema.suspend(() => Check);
  const Check = Schema.Union([Schema.Struct({
    _tag: Schema.tag("Filter"),
    annotations: Schema.optional($Annotations),
    meta
  }).annotate({
    identifier: `${identifier}Filter`
  }), Schema.Struct({
    _tag: Schema.tag("FilterGroup"),
    annotations: Schema.optional($Annotations),
    checks: Schema.NonEmptyArray(Check$ref)
  }).annotate({
    identifier: `${identifier}FilterGroup`
  })]).annotate({
    identifier: `${identifier}Check`
  });
  return Check;
}
/**
 * Schema codec for the {@link String} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $String = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("String"),
  annotations: Schema.optional($Annotations),
  checks: Schema.Array(makeCheck($StringMeta, "String")),
  contentMediaType: Schema.optional(Schema.String),
  contentSchema: Schema.optional(Representation$ref)
}).annotate({
  identifier: "String"
});
const $IsInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isInt")
}).annotate({
  identifier: "IsInt"
});
const $IsMultipleOf = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMultipleOf"),
  divisor: Schema.Finite
}).annotate({
  identifier: "IsMultipleOf"
});
const $IsFinite = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isFinite")
}).annotate({
  identifier: "IsFinite"
});
const $IsGreaterThan = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThan"),
  exclusiveMinimum: Schema.Finite
}).annotate({
  identifier: "IsGreaterThan"
});
const $IsGreaterThanOrEqualTo = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThanOrEqualTo"),
  minimum: Schema.Finite
}).annotate({
  identifier: "IsGreaterThanOrEqualTo"
});
const $IsLessThan = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThan"),
  exclusiveMaximum: Schema.Finite
}).annotate({
  identifier: "IsLessThan"
});
const $IsLessThanOrEqualTo = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThanOrEqualTo"),
  maximum: Schema.Finite
}).annotate({
  identifier: "IsLessThanOrEqualTo"
});
const $IsBetween = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isBetween"),
  minimum: Schema.Finite,
  maximum: Schema.Finite,
  exclusiveMinimum: Schema.optional(Schema.Boolean),
  exclusiveMaximum: Schema.optional(Schema.Boolean)
}).annotate({
  identifier: "IsBetween"
});
/**
 * Schema codec for {@link NumberMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $NumberMeta = /*#__PURE__*/Schema.Union([$IsInt, $IsMultipleOf, $IsFinite, $IsGreaterThan, $IsGreaterThanOrEqualTo, $IsLessThan, $IsLessThanOrEqualTo, $IsBetween]).annotate({
  identifier: "NumberMeta"
});
/**
 * Schema codec for the {@link Number} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Number = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Number"),
  annotations: Schema.optional($Annotations),
  checks: Schema.Array(makeCheck($NumberMeta, "Number"))
}).annotate({
  identifier: "Number"
});
/**
 * Schema codec for the {@link Boolean} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Boolean = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Boolean"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Boolean"
});
const $IsGreaterThanBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThanBigInt"),
  exclusiveMinimum: Schema.BigInt
}).annotate({
  identifier: "IsGreaterThanBigInt"
});
const $IsGreaterThanOrEqualToBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThanOrEqualToBigInt"),
  minimum: Schema.BigInt
}).annotate({
  identifier: "IsGreaterThanOrEqualToBigInt"
});
const $IsLessThanBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThanBigInt"),
  exclusiveMaximum: Schema.BigInt
}).annotate({
  identifier: "IsLessThanBigInt"
});
const $IsLessThanOrEqualToBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThanOrEqualToBigInt"),
  maximum: Schema.BigInt
}).annotate({
  identifier: "IsLessThanOrEqualToBigInt"
});
const $IsBetweenBigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isBetweenBigInt"),
  minimum: Schema.BigInt,
  maximum: Schema.BigInt,
  exclusiveMinimum: Schema.optional(Schema.Boolean),
  exclusiveMaximum: Schema.optional(Schema.Boolean)
}).annotate({
  identifier: "IsBetweenBigInt"
});
const $BigIntMeta = /*#__PURE__*/Schema.Union([$IsGreaterThanBigInt, $IsGreaterThanOrEqualToBigInt, $IsLessThanBigInt, $IsLessThanOrEqualToBigInt, $IsBetweenBigInt]).annotate({
  identifier: "BigIntMeta"
});
/**
 * Schema codec for the {@link BigInt} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $BigInt = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("BigInt"),
  annotations: Schema.optional($Annotations),
  checks: Schema.Array(makeCheck($BigIntMeta, "BigInt"))
}).annotate({
  identifier: "BigInt"
});
/**
 * Schema codec for the {@link Symbol} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Symbol = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Symbol"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Symbol"
});
/**
 * Schema codec for the literal value types allowed in a {@link Literal} node
 * (string, finite number, boolean, or bigint).
 *
 * @category Schema
 * @since 4.0.0
 */
export const $LiteralValue = /*#__PURE__*/Schema.Union([Schema.String, Schema.Finite, Schema.Boolean, Schema.BigInt]).annotate({
  identifier: "LiteralValue"
});
/**
 * Schema codec for the {@link Literal} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Literal = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Literal"),
  annotations: Schema.optional($Annotations),
  literal: $LiteralValue
}).annotate({
  identifier: "Literal"
});
/**
 * Schema codec for the {@link UniqueSymbol} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $UniqueSymbol = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("UniqueSymbol"),
  annotations: Schema.optional($Annotations),
  symbol: Schema.Symbol
}).annotate({
  identifier: "UniqueSymbol"
});
/**
 * Schema codec for the {@link ObjectKeyword} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $ObjectKeyword = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("ObjectKeyword"),
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "ObjectKeyword"
});
/**
 * Schema codec for the {@link Enum} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Enum = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Enum"),
  annotations: Schema.optional($Annotations),
  enums: Schema.Array(Schema.Tuple([Schema.String, Schema.Union([Schema.String, Schema.Number // NaN, Infinity, -Infinity are allowed enum values
  ])]))
}).annotate({
  identifier: "Enum"
});
/**
 * Schema codec for the {@link TemplateLiteral} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $TemplateLiteral = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("TemplateLiteral"),
  annotations: Schema.optional($Annotations),
  parts: Schema.Array(Representation$ref)
}).annotate({
  identifier: "TemplateLiteral"
});
/**
 * Schema codec for the {@link Element} type (positional tuple element).
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Element = /*#__PURE__*/Schema.Struct({
  isOptional: Schema.Boolean,
  type: Representation$ref,
  annotations: Schema.optional($Annotations)
}).annotate({
  identifier: "Element"
});
const $IsUnique = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isUnique")
}).annotate({
  identifier: "IsUnique"
});
const $ArraysMeta = /*#__PURE__*/Schema.Union([$IsMinLength, $IsMaxLength, $IsLengthBetween, $IsUnique]).annotate({
  identifier: "ArraysMeta"
});
/**
 * Schema codec for the {@link Arrays} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Arrays = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Arrays"),
  annotations: Schema.optional($Annotations),
  elements: Schema.Array($Element),
  rest: Schema.Array(Representation$ref),
  checks: Schema.Array(makeCheck($ArraysMeta, "Arrays"))
}).annotate({
  identifier: "Arrays"
});
/**
 * Schema codec for the {@link PropertySignature} type.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $PropertySignature = /*#__PURE__*/Schema.Struct({
  annotations: Schema.optional($Annotations),
  name: Schema.PropertyKey,
  type: Representation$ref,
  isOptional: Schema.Boolean,
  isMutable: Schema.Boolean
}).annotate({
  identifier: "PropertySignature"
});
/**
 * Schema codec for the {@link IndexSignature} type.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $IndexSignature = /*#__PURE__*/Schema.Struct({
  parameter: Representation$ref,
  type: Representation$ref
}).annotate({
  identifier: "IndexSignature"
});
const $IsMinProperties = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMinProperties"),
  minProperties: NonNegativeInt
}).annotate({
  identifier: "IsMinProperties"
});
const $IsMaxProperties = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMaxProperties"),
  maxProperties: NonNegativeInt
}).annotate({
  identifier: "IsMaxProperties"
});
const $IsPropertiesLengthBetween = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isPropertiesLengthBetween"),
  minimum: NonNegativeInt,
  maximum: NonNegativeInt
}).annotate({
  identifier: "IsPropertiesLengthBetween"
});
const $IsPropertyNames = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isPropertyNames"),
  propertyNames: Representation$ref
}).annotate({
  identifier: "IsPropertyNames"
});
/**
 * Schema codec for {@link ObjectsMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $ObjectsMeta = /*#__PURE__*/Schema.Union([$IsMinProperties, $IsMaxProperties, $IsPropertiesLengthBetween, $IsPropertyNames]).annotate({
  identifier: "ObjectsMeta"
});
/**
 * Schema codec for the {@link Objects} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Objects = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Objects"),
  annotations: Schema.optional($Annotations),
  propertySignatures: Schema.Array($PropertySignature),
  indexSignatures: Schema.Array($IndexSignature),
  checks: Schema.Array(makeCheck($ObjectsMeta, "Objects"))
}).annotate({
  identifier: "Objects"
});
/**
 * Schema codec for the {@link Union} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Union = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Union"),
  annotations: Schema.optional($Annotations),
  types: Schema.Array(Representation$ref),
  mode: Schema.Literals(["anyOf", "oneOf"])
}).annotate({
  identifier: "Union"
});
/**
 * Schema codec for the {@link Reference} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Reference = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Reference"),
  $ref: Schema.String
}).annotate({
  identifier: "Reference"
});
const $IsDateValid = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isDateValid")
}).annotate({
  identifier: "IsDateValid"
});
const $IsGreaterThanDate = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThanDate"),
  exclusiveMinimum: Schema.Date
}).annotate({
  identifier: "IsGreaterThanDate"
});
const $IsGreaterThanOrEqualToDate = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isGreaterThanOrEqualToDate"),
  minimum: Schema.Date
}).annotate({
  identifier: "IsGreaterThanOrEqualToDate"
});
const $IsLessThanDate = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThanDate"),
  exclusiveMaximum: Schema.Date
}).annotate({
  identifier: "IsLessThanDate"
});
const $IsLessThanOrEqualToDate = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isLessThanOrEqualToDate"),
  maximum: Schema.Date
}).annotate({
  identifier: "IsLessThanOrEqualToDate"
});
const $IsBetweenDate = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isBetweenDate"),
  minimum: Schema.Date,
  maximum: Schema.Date,
  exclusiveMinimum: Schema.optional(Schema.Boolean),
  exclusiveMaximum: Schema.optional(Schema.Boolean)
}).annotate({
  identifier: "IsBetweenDate"
});
/**
 * Schema codec for {@link DateMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $DateMeta = /*#__PURE__*/Schema.Union([$IsDateValid, $IsGreaterThanDate, $IsGreaterThanOrEqualToDate, $IsLessThanDate, $IsLessThanOrEqualToDate, $IsBetweenDate]).annotate({
  identifier: "DateMeta"
});
const $IsMinSize = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMinSize"),
  minSize: NonNegativeInt
}).annotate({
  identifier: "IsMinSize"
});
const $IsMaxSize = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isMaxSize"),
  maxSize: NonNegativeInt
}).annotate({
  identifier: "IsMaxSize"
});
const $IsSizeBetween = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("isSizeBetween"),
  minimum: NonNegativeInt,
  maximum: NonNegativeInt
}).annotate({
  identifier: "IsSizeBetween"
});
/**
 * Schema codec for {@link SizeMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $SizeMeta = /*#__PURE__*/Schema.Union([$IsMinSize, $IsMaxSize, $IsSizeBetween]).annotate({
  identifier: "SizeMeta"
});
/**
 * Schema codec for {@link DeclarationMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $DeclarationMeta = /*#__PURE__*/Schema.Union([$DateMeta, $SizeMeta]).annotate({
  identifier: "DeclarationMeta"
});
/**
 * Schema codec for the {@link Declaration} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Declaration = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Declaration"),
  annotations: Schema.optional($Annotations),
  typeParameters: Schema.Array(Representation$ref),
  checks: Schema.Array(makeCheck($DeclarationMeta, "Declaration")),
  encodedSchema: Representation$ref
}).annotate({
  identifier: "Declaration"
});
/**
 * Schema codec for the {@link Suspend} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Suspend = /*#__PURE__*/Schema.Struct({
  _tag: Schema.tag("Suspend"),
  annotations: Schema.optional($Annotations),
  checks: Schema.Tuple([]),
  thunk: Representation$ref
}).annotate({
  identifier: "Suspend"
});
/**
 * Schema codec for the full {@link Representation} union. This is the
 * recursive codec that can validate/encode any representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Representation = /*#__PURE__*/Schema.Union([$Null, $Undefined, $Void, $Never, $Unknown, $Any, $String, $Number, $Boolean, $BigInt, $Symbol, $Literal, $UniqueSymbol, $ObjectKeyword, $Enum, $TemplateLiteral, $Arrays, $Objects, $Union, $Reference, $Declaration, $Suspend]).annotate({
  identifier: "Schema"
});
/**
 * Schema codec for {@link Document}. Use with `Schema.decodeUnknownSync` or
 * `Schema.encodeSync` to validate or serialize document data.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $Document = /*#__PURE__*/Schema.Struct({
  representation: $Representation,
  references: Schema.Record(Schema.String, $Representation)
}).annotate({
  identifier: "Document"
});
/**
 * Schema codec for {@link MultiDocument}.
 *
 * @category Schema
 * @since 4.0.0
 */
export const $MultiDocument = /*#__PURE__*/Schema.Struct({
  representations: Schema.NonEmptyArray($Representation),
  references: Schema.Record(Schema.String, $Representation)
}).annotate({
  identifier: "MultiDocument"
});
// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------
/**
 * Converts a Schema AST into a {@link Document}.
 *
 * - Use when you have a single schema and need its representation.
 * - Pure function; does not mutate the input AST.
 * - Shared/recursive sub-schemas are extracted into the `references` map.
 *
 * **Example** (Converting a Schema to a Document)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const Person = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Number
 * })
 *
 * const doc = SchemaRepresentation.fromAST(Person.ast)
 * console.log(doc.representation._tag)
 * // "Objects"
 * ```
 *
 * @see {@link Document}
 * @see {@link fromASTs}
 *
 * @since 4.0.0
 */
export const fromAST = InternalRepresentation.fromAST;
/**
 * Converts one or more Schema ASTs into a {@link MultiDocument}.
 *
 * - Use when you have multiple schemas that may share references.
 * - Pure function; does not mutate the input ASTs.
 * - All schemas share a single `references` map.
 *
 * @see {@link MultiDocument}
 * @see {@link fromAST}
 *
 * @since 4.0.0
 */
export const fromASTs = InternalRepresentation.fromASTs;
/**
 * Schema codec that decodes a {@link Document} from JSON and encodes it back.
 *
 * - Use with `Schema.decodeUnknownSync` / `Schema.encodeSync` to
 *   serialize/deserialize documents.
 *
 * **Example** (Round-tripping a Document through JSON)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const doc = SchemaRepresentation.fromAST(Schema.String.ast)
 * const json = Schema.encodeSync(SchemaRepresentation.DocumentFromJson)(doc)
 * const back = Schema.decodeUnknownSync(SchemaRepresentation.DocumentFromJson)(json)
 * ```
 *
 * @see {@link $Document}
 * @see {@link MultiDocumentFromJson}
 *
 * @since 4.0.0
 */
export const DocumentFromJson = /*#__PURE__*/Schema.toCodecJson($Document);
/**
 * Schema codec that decodes a {@link MultiDocument} from JSON and encodes it
 * back.
 *
 * @see {@link $MultiDocument}
 * @see {@link DocumentFromJson}
 *
 * @since 4.0.0
 */
export const MultiDocumentFromJson = /*#__PURE__*/Schema.toCodecJson($MultiDocument);
/**
 * Wraps a single {@link Document} as a {@link MultiDocument} with one
 * representation.
 *
 * - Use when an API expects a `MultiDocument` but you only have a single
 *   `Document`.
 * - Pure function; does not mutate the input.
 *
 * @see {@link Document}
 * @see {@link MultiDocument}
 *
 * @since 4.0.0
 */
export function toMultiDocument(document) {
  return {
    representations: [document.representation],
    references: document.references
  };
}
/**
 * Default {@link Reviver} for {@link toSchema} that handles built-in Effect
 * types (Option, Result, Redacted, Cause, Exit, ReadonlyMap, HashMap,
 * ReadonlySet,
 * Date, Duration, URL, RegExp, etc.).
 *
 * - Pass as `options.reviver` to {@link toSchema} to reconstruct schemas that
 *   use these types.
 * - Returns `undefined` for unrecognized declarations, causing fallback to
 *   `encodedSchema`.
 *
 * @see {@link toSchema}
 * @see {@link Reviver}
 *
 * @since 4.0.0
 */
export const toSchemaDefaultReviver = (s, recur) => {
  const typeConstructor = s.annotations?.typeConstructor;
  if (Predicate.isObject(typeConstructor) && typeof typeConstructor._tag === "string") {
    const typeParameters = s.typeParameters.map(recur);
    switch (typeConstructor._tag) {
      // built-in types
      case "Date":
        return Schema.Date;
      case "Error":
        return Schema.Error;
      case "ErrorWithStack":
        return Schema.ErrorWithStack;
      case "File":
        return Schema.File;
      case "FormData":
        return Schema.FormData;
      case "ReadonlyMap":
        return Schema.ReadonlyMap(typeParameters[0], typeParameters[1]);
      case "ReadonlySet":
        return Schema.ReadonlySet(typeParameters[0]);
      case "RegExp":
        return Schema.RegExp;
      case "Uint8Array":
        return Schema.Uint8Array;
      case "URL":
        return Schema.URL;
      case "URLSearchParams":
        return Schema.URLSearchParams;
      // effect types
      case "effect/Option":
        return Schema.Option(typeParameters[0]);
      case "effect/Result":
        return Schema.Result(typeParameters[0], typeParameters[1]);
      case "effect/Redacted":
        return Schema.Redacted(typeParameters[0]);
      case "effect/DateTime.TimeZone":
        return Schema.TimeZone;
      case "effect/DateTime.TimeZone.Named":
        return Schema.TimeZoneNamed;
      case "effect/DateTime.TimeZone.Offset":
        return Schema.TimeZoneOffset;
      case "effect/DateTime.Utc":
        return Schema.DateTimeUtc;
      case "effect/DateTime.Zoned":
        return Schema.DateTimeZoned;
      case "effect/BigDecimal":
        return Schema.BigDecimal;
      case "effect/Chunk":
        return Schema.Chunk(typeParameters[0]);
      case "effect/Cause":
        return Schema.Cause(typeParameters[0], typeParameters[1]);
      case "effect/Cause/Failure":
        return Schema.CauseReason(typeParameters[0], typeParameters[1]);
      case "effect/Duration":
        return Schema.Duration;
      case "effect/Exit":
        return Schema.Exit(typeParameters[0], typeParameters[1], typeParameters[2]);
      case "effect/Json":
        return Schema.Json;
      case "effect/MutableJson":
        return Schema.MutableJson;
      case "effect/HashMap":
        return Schema.HashMap(typeParameters[0], typeParameters[1]);
      case "effect/HashSet":
        return Schema.HashSet(typeParameters[0]);
    }
  }
};
/**
 * Reconstructs a runtime Schema from a {@link Document}.
 *
 * - Use when you have a serialized or computed representation and need a
 *   working Schema for decoding/encoding.
 * - Pass `options.reviver` (e.g. {@link toSchemaDefaultReviver}) to handle
 *   {@link Declaration} nodes for types like `Date`, `Option`, etc.
 * - Without a reviver, declarations fall back to their `encodedSchema`.
 * - Handles circular references via lazy `Schema.suspend`.
 * - Throws if a `$ref` is not found in `document.references`.
 *
 * **Example** (Reconstructing a Schema)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const doc = SchemaRepresentation.fromAST(
 *   Schema.Struct({ name: Schema.String }).ast
 * )
 *
 * const schema = SchemaRepresentation.toSchema(doc)
 * console.log(JSON.stringify(Schema.toJsonSchemaDocument(schema), null, 2))
 * ```
 *
 * @see {@link Document}
 * @see {@link Reviver}
 * @see {@link toSchemaDefaultReviver}
 *
 * @category Runtime Generation
 * @since 4.0.0
 */
export function toSchema(document, options) {
  const slots = new Map();
  return recur(document.representation);
  function recur(r) {
    let out = on(r);
    if ("annotations" in r && r.annotations) out = out.annotate(r.annotations);
    out = toSchemaChecks(out, r);
    return out;
  }
  function getSlot(identifier) {
    const existing = slots.get(identifier);
    if (existing) return existing;
    // Create the slot *before* resolving, so self-references can see it.
    const slot = {
      state: 0,
      value: undefined,
      ref: Schema.suspend(() => {
        if (slot.value === undefined) {
          return Schema.Unknown;
        }
        return slot.value;
      })
    };
    slots.set(identifier, slot);
    return slot;
  }
  function resolveReference($ref) {
    const definition = document.references[$ref];
    if (definition === undefined) {
      throw new Error(`Reference ${$ref} not found`);
    }
    const slot = getSlot($ref);
    if (slot.state === 2) {
      // Already built: return the built schema directly
      return slot.value;
    }
    if (slot.state === 1) {
      // Circular: we're currently building this identifier.
      return slot.ref;
    }
    // First time: build it.
    slot.state = 1;
    try {
      slot.value = recur(definition);
      slot.state = 2;
      return slot.value;
    } catch (e) {
      // Leave the slot in a safe state so future thunks don't silently succeed.
      slot.state = 0;
      slot.value = undefined;
      throw e;
    }
  }
  function on(r) {
    switch (r._tag) {
      case "Declaration":
        return options?.reviver?.(r, recur) ?? recur(r.encodedSchema);
      case "Reference":
        return resolveReference(r.$ref);
      case "Suspend":
        return recur(r.thunk);
      case "Null":
        return Schema.Null;
      case "Undefined":
        return Schema.Undefined;
      case "Void":
        return Schema.Void;
      case "Never":
        return Schema.Never;
      case "Unknown":
        return Schema.Unknown;
      case "Any":
        return Schema.Any;
      case "String":
        {
          const contentMediaType = r.contentMediaType;
          const contentSchema = r.contentSchema;
          if (contentMediaType === "application/json" && contentSchema !== undefined) {
            return Schema.fromJsonString(recur(contentSchema));
          }
          return Schema.String;
        }
      case "Number":
        return Schema.Number;
      case "Boolean":
        return Schema.Boolean;
      case "BigInt":
        return Schema.BigInt;
      case "Symbol":
        return Schema.Symbol;
      case "Literal":
        return Schema.Literal(r.literal);
      case "UniqueSymbol":
        return Schema.UniqueSymbol(r.symbol);
      case "ObjectKeyword":
        return Schema.ObjectKeyword;
      case "Enum":
        return Schema.Enum(Object.fromEntries(r.enums));
      case "TemplateLiteral":
        {
          const parts = r.parts.map(recur);
          return Schema.TemplateLiteral(parts);
        }
      case "Arrays":
        {
          const elements = r.elements.map(e => {
            const s = recur(e.type);
            return e.isOptional ? Schema.optionalKey(s) : s;
          });
          const rest = r.rest.map(recur);
          if (Arr.isArrayNonEmpty(rest)) {
            if (r.elements.length === 0 && r.rest.length === 1) {
              return Schema.Array(rest[0]);
            }
            return Schema.TupleWithRest(Schema.Tuple(elements), rest);
          }
          return Schema.Tuple(elements);
        }
      case "Objects":
        {
          const fields = {};
          for (const ps of r.propertySignatures) {
            const s = recur(ps.type);
            const withOptional = ps.isOptional ? Schema.optionalKey(s) : s;
            fields[ps.name] = ps.isMutable ? Schema.mutableKey(withOptional) : withOptional;
          }
          const indexSignatures = r.indexSignatures.map(is => Schema.Record(recur(is.parameter), recur(is.type)));
          if (Arr.isArrayNonEmpty(indexSignatures)) {
            if (r.propertySignatures.length === 0 && indexSignatures.length === 1) {
              return indexSignatures[0];
            }
            return Schema.StructWithRest(Schema.Struct(fields), indexSignatures);
          }
          return Schema.Struct(fields);
        }
      case "Union":
        {
          if (r.types.length === 0) return Schema.Never;
          if (r.types.every(t => t._tag === "Literal")) {
            if (r.types.length === 1) {
              return Schema.Literal(r.types[0].literal);
            }
            return Schema.Literals(r.types.map(t => t.literal));
          }
          return Schema.Union(r.types.map(recur), {
            mode: r.mode
          });
        }
    }
  }
  function toSchemaChecks(top, schema) {
    switch (schema._tag) {
      default:
        return top;
      case "String":
      case "Number":
      case "BigInt":
      case "Arrays":
      case "Objects":
      case "Declaration":
        {
          const checks = schema.checks.map(toSchemaCheck);
          return Arr.isArrayNonEmpty(checks) ? top.check(...checks) : top;
        }
    }
  }
  function toSchemaCheck(check) {
    switch (check._tag) {
      case "Filter":
        return toSchemaFilter(check);
      case "FilterGroup":
        {
          return Schema.makeFilterGroup(Arr.map(check.checks, toSchemaCheck), check.annotations);
        }
    }
  }
  function toSchemaFilter(filter) {
    const a = filter.annotations;
    switch (filter.meta._tag) {
      // String Meta
      case "isStringFinite":
        return Schema.isStringFinite(a);
      case "isStringBigInt":
        return Schema.isStringBigInt(a);
      case "isStringSymbol":
        return Schema.isStringSymbol(a);
      case "isMinLength":
        return Schema.isMinLength(filter.meta.minLength, a);
      case "isMaxLength":
        return Schema.isMaxLength(filter.meta.maxLength, a);
      case "isLengthBetween":
        return Schema.isLengthBetween(filter.meta.minimum, filter.meta.maximum, a);
      case "isPattern":
        return Schema.isPattern(filter.meta.regExp, a);
      case "isTrimmed":
        return Schema.isTrimmed(a);
      case "isUUID":
        return Schema.isUUID(filter.meta.version, a);
      case "isULID":
        return Schema.isULID(a);
      case "isBase64":
        return Schema.isBase64(a);
      case "isBase64Url":
        return Schema.isBase64Url(a);
      case "isStartsWith":
        return Schema.isStartsWith(filter.meta.startsWith, a);
      case "isEndsWith":
        return Schema.isEndsWith(filter.meta.endsWith, a);
      case "isIncludes":
        return Schema.isIncludes(filter.meta.includes, a);
      case "isUppercased":
        return Schema.isUppercased(a);
      case "isLowercased":
        return Schema.isLowercased(a);
      case "isCapitalized":
        return Schema.isCapitalized(a);
      case "isUncapitalized":
        return Schema.isUncapitalized(a);
      // Number Meta
      case "isFinite":
        return Schema.isFinite(a);
      case "isInt":
        return Schema.isInt(a);
      case "isMultipleOf":
        return Schema.isMultipleOf(filter.meta.divisor, a);
      case "isGreaterThan":
        return Schema.isGreaterThan(filter.meta.exclusiveMinimum, a);
      case "isGreaterThanOrEqualTo":
        return Schema.isGreaterThanOrEqualTo(filter.meta.minimum, a);
      case "isLessThan":
        return Schema.isLessThan(filter.meta.exclusiveMaximum, a);
      case "isLessThanOrEqualTo":
        return Schema.isLessThanOrEqualTo(filter.meta.maximum, a);
      case "isBetween":
        return Schema.isBetween(filter.meta, a);
      // BigInt Meta
      case "isGreaterThanBigInt":
        return Schema.isGreaterThanBigInt(filter.meta.exclusiveMinimum, a);
      case "isGreaterThanOrEqualToBigInt":
        return Schema.isGreaterThanOrEqualToBigInt(filter.meta.minimum, a);
      case "isLessThanBigInt":
        return Schema.isLessThanBigInt(filter.meta.exclusiveMaximum, a);
      case "isLessThanOrEqualToBigInt":
        return Schema.isLessThanOrEqualToBigInt(filter.meta.maximum, a);
      case "isBetweenBigInt":
        return Schema.isBetweenBigInt(filter.meta, a);
      // Object Meta
      case "isMinProperties":
        return Schema.isMinProperties(filter.meta.minProperties, a);
      case "isMaxProperties":
        return Schema.isMaxProperties(filter.meta.maxProperties, a);
      case "isPropertiesLengthBetween":
        return Schema.isPropertiesLengthBetween(filter.meta.minimum, filter.meta.maximum, a);
      case "isPropertyNames":
        return Schema.isPropertyNames(recur(filter.meta.propertyNames), a);
      // Arrays Meta
      case "isUnique":
        return Schema.isUnique(a);
      // Date Meta
      case "isDateValid":
        return Schema.isDateValid(a);
      case "isGreaterThanDate":
        return Schema.isGreaterThanDate(filter.meta.exclusiveMinimum, a);
      case "isGreaterThanOrEqualToDate":
        return Schema.isGreaterThanOrEqualToDate(filter.meta.minimum, a);
      case "isLessThanDate":
        return Schema.isLessThanDate(filter.meta.exclusiveMaximum, a);
      case "isLessThanOrEqualToDate":
        return Schema.isLessThanOrEqualToDate(filter.meta.maximum, a);
      case "isBetweenDate":
        return Schema.isBetweenDate(filter.meta, a);
      // Size Meta
      case "isMinSize":
        return Schema.isMinSize(filter.meta.minSize, a);
      case "isMaxSize":
        return Schema.isMaxSize(filter.meta.maxSize, a);
      case "isSizeBetween":
        return Schema.isSizeBetween(filter.meta.minimum, filter.meta.maximum, a);
    }
  }
}
/**
 * Converts a {@link Document} to a Draft 2020-12 JSON Schema document.
 *
 * - Use to produce a standard JSON Schema from an Effect Schema representation.
 * - Pure function; does not mutate the input.
 *
 * **Example** (Generating JSON Schema)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const doc = SchemaRepresentation.fromAST(Schema.String.ast)
 * const jsonSchema = SchemaRepresentation.toJsonSchemaDocument(doc)
 * console.log(jsonSchema.schema.type)
 * // "string"
 * ```
 *
 * @see {@link Document}
 * @see {@link toJsonSchemaMultiDocument}
 * @see {@link fromJsonSchemaDocument}
 *
 * @since 4.0.0
 */
export const toJsonSchemaDocument = InternalRepresentation.toJsonSchemaDocument;
/**
 * Converts a {@link MultiDocument} to a Draft 2020-12 JSON Schema
 * multi-document.
 *
 * - Use when you have multiple schemas sharing references.
 * - Pure function; does not mutate the input.
 *
 * @see {@link MultiDocument}
 * @see {@link toJsonSchemaDocument}
 * @see {@link fromJsonSchemaMultiDocument}
 *
 * @since 4.0.0
 */
export const toJsonSchemaMultiDocument = InternalRepresentation.toJsonSchemaMultiDocument;
/**
 * Constructs a {@link Code} value from a runtime expression string and a
 * TypeScript type string.
 *
 * @see {@link Code}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export function makeCode(runtime, Type) {
  return {
    runtime,
    Type
  };
}
/**
 * Generates TypeScript code strings from a {@link MultiDocument}.
 *
 * - Use to produce source code for Schema definitions (e.g. for codegen tools).
 * - `options.reviver` can customize code generation for {@link Declaration}
 *   nodes. Return `undefined` to fall back to the default logic (which uses
 *   `generation` annotations or the encoded schema).
 * - Performs topological sorting of references to emit non-recursive
 *   definitions before their dependents.
 * - Produces sanitized JavaScript identifiers for `$ref` keys.
 *
 * **Example** (Generating TypeScript code)
 *
 * ```ts
 * import { Schema, SchemaRepresentation } from "effect"
 *
 * const Person = Schema.Struct({
 *   name: Schema.String,
 *   age: Schema.Int
 * })
 *
 * const multi = SchemaRepresentation.toMultiDocument(
 *   SchemaRepresentation.fromAST(Person.ast)
 * )
 * const codeDoc = SchemaRepresentation.toCodeDocument(multi)
 * console.log(codeDoc.codes[0].runtime)
 * // Schema.Struct({ ... })
 * ```
 *
 * @see {@link CodeDocument}
 * @see {@link MultiDocument}
 * @see {@link Reviver}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export function toCodeDocument(multiDocument, options) {
  const artifacts = [];
  const ts = topologicalSort(multiDocument.references);
  // Phase 1: Build sanitization map with collision handling
  const sanitizedReferenceMap = new Map();
  const uniqueSanitizedReferences = new Set();
  const referenceCount = new Map();
  // Process all references first to build the map
  const allRefs = [...ts.nonRecursives.map(({
    $ref
  }) => $ref), ...Object.keys(ts.recursives)];
  for (const ref of allRefs) {
    ensureUniqueSanitized(ref);
  }
  // Phase 2: Use the map when processing references
  const nonRecursives = ts.nonRecursives.map(({
    $ref,
    representation
  }) => ({
    $ref: sanitizedReferenceMap.get($ref),
    code: recur(representation)
  }));
  const recursives = Rec.mapEntries(ts.recursives, (representation, $ref) => [sanitizedReferenceMap.get($ref), recur(representation)]);
  const codes = multiDocument.representations.map(recur);
  return {
    codes,
    references: {
      nonRecursives: nonRecursives.filter(({
        $ref
      }) => (referenceCount.get($ref) ?? 0) > 0),
      recursives: Rec.filter(recursives, (_, $ref) => (referenceCount.get($ref) ?? 0) > 0)
    },
    artifacts
  };
  function ensureUniqueSanitized(originalRef) {
    // Check if already mapped (consistency)
    const sanitized = sanitizedReferenceMap.get(originalRef);
    if (sanitized !== undefined) {
      return sanitized;
    }
    // Find unique sanitized name
    const seed = sanitizeJavaScriptIdentifier(originalRef);
    let candidate = seed;
    let suffix = 0;
    while (uniqueSanitizedReferences.has(candidate)) {
      candidate = `${seed}${++suffix}`;
    }
    uniqueSanitizedReferences.add(candidate);
    sanitizedReferenceMap.set(originalRef, candidate);
    return candidate;
  }
  function addSymbol(s) {
    const identifier = ensureUniqueSanitized("_symbol");
    const key = globalThis.Symbol.keyFor(s);
    const description = s.description;
    const generation = key === undefined ? makeCode(`Symbol(${description === undefined ? "" : format(description)})`, `typeof ${identifier}`) : makeCode(`Symbol.for(${format(key)})`, `typeof ${identifier}`);
    artifacts.push({
      _tag: "Symbol",
      identifier,
      generation
    });
    return identifier;
  }
  function addEnum(s) {
    const identifier = ensureUniqueSanitized("_Enum");
    artifacts.push({
      _tag: "Enum",
      identifier,
      generation: makeCode(`enum ${identifier} { ${s.enums.map(([name, value]) => `${format(name)}: ${format(value)}`).join(", ")} }`, `typeof ${identifier}`)
    });
    return identifier;
  }
  function addImport(importDeclaration) {
    if (!artifacts.some(a => a._tag === "Import" && a.importDeclaration === importDeclaration)) {
      artifacts.push({
        _tag: "Import",
        importDeclaration
      });
    }
  }
  function recur(s) {
    const g = on(s);
    switch (s._tag) {
      default:
        return makeCode(g.runtime + toRuntimeAnnotate(s.annotations) + toRuntimeBrand(s.annotations), g.Type + toTypeBrand(s.annotations));
      case "Reference":
        return g;
      case "Declaration":
      case "String":
      case "Number":
      case "BigInt":
      case "Arrays":
      case "Objects":
      case "Suspend":
        return makeCode(g.runtime + toRuntimeAnnotate(s.annotations) + toRuntimeBrand(s.annotations) + toRuntimeChecks(s.checks), g.Type + toTypeBrand(s.annotations) + toTypeChecks(s.checks));
    }
  }
  function on(s) {
    switch (s._tag) {
      case "Declaration":
        {
          // if there is a reviver, use it to generate the generation
          if (options?.reviver !== undefined) {
            // the reviver can return `undefined` to indicate that the generation should be generated by the default logic
            const out = options.reviver(s, recur);
            if (out !== undefined) {
              return out;
            }
          }
          // otherwise, use the generation from the annotations
          const generation = s.annotations?.generation;
          if (Predicate.isObject(generation) && typeof generation.runtime === "string" && typeof generation.Type === "string") {
            const typeParameters = s.typeParameters.map(recur);
            if (typeof generation.importDeclaration === "string") {
              addImport(generation.importDeclaration);
            }
            return makeCode(replacePlaceholders(generation.runtime, typeParameters.map(p => p.runtime)), replacePlaceholders(generation.Type, typeParameters.map(p => p.Type)));
          }
          // otherwise, use the generation from the encoded schema
          return recur(s.encodedSchema);
        }
      case "Reference":
        {
          const sanitized = ensureUniqueSanitized(s.$ref);
          referenceCount.set(sanitized, (referenceCount.get(sanitized) ?? 0) + 1);
          return makeCode(sanitized, sanitized);
        }
      case "Suspend":
        {
          const thunk = recur(s.thunk);
          return makeCode(`Schema.suspend((): Schema.Codec<${thunk.Type}> => ${thunk.runtime})`, thunk.Type);
        }
      case "Null":
        return makeCode(`Schema.Null`, "null");
      case "Undefined":
        return makeCode(`Schema.Undefined`, "undefined");
      case "Void":
        return makeCode(`Schema.Void`, "void");
      case "Never":
        return makeCode(`Schema.Never`, "never");
      case "Unknown":
        return makeCode(`Schema.Unknown`, "unknown");
      case "Any":
        return makeCode(`Schema.Any`, "any");
      case "Number":
        return makeCode(`Schema.Number`, "number");
      case "Boolean":
        return makeCode(`Schema.Boolean`, "boolean");
      case "BigInt":
        return makeCode(`Schema.BigInt`, "bigint");
      case "Symbol":
        return makeCode(`Schema.Symbol`, "symbol");
      case "String":
        {
          const contentMediaType = s.contentMediaType;
          const contentSchema = s.contentSchema;
          if (contentMediaType === "application/json" && contentSchema !== undefined) {
            return makeCode(`Schema.fromJsonString(${recur(contentSchema)})`, "string");
          } else {
            return makeCode(`Schema.String`, "string");
          }
        }
      case "Literal":
        {
          const literal = format(s.literal);
          return makeCode(`Schema.Literal(${literal})`, literal);
        }
      case "UniqueSymbol":
        {
          const identifier = addSymbol(s.symbol);
          return makeCode(`Schema.UniqueSymbol(${identifier})`, `typeof ${identifier}`);
        }
      case "ObjectKeyword":
        return makeCode(`Schema.ObjectKeyword`, "object");
      case "Enum":
        {
          const identifier = addEnum(s);
          return makeCode(`Schema.Enum(${identifier})`, `typeof ${identifier}`);
        }
      case "TemplateLiteral":
        {
          const parts = s.parts.map(recur);
          const type = toTypeParts(s.parts).map(p => "`" + p + "`").join(" | ");
          return makeCode(`Schema.TemplateLiteral([${parts.map(p => p.runtime).join(", ")}])`, type);
        }
      case "Arrays":
        {
          const elements = s.elements.map(e => {
            return {
              isOptional: e.isOptional,
              type: recur(e.type),
              annotations: e.annotations
            };
          });
          const rest = s.rest.map(recur);
          if (Arr.isArrayNonEmpty(rest)) {
            const item = rest[0];
            if (elements.length === 0 && rest.length === 1) {
              return makeCode(`Schema.Array(${item.runtime})`, `ReadonlyArray<${item.Type}>`);
            }
            const post = rest.slice(1);
            return makeCode(`Schema.TupleWithRest(Schema.Tuple([${elements.map(e => toRuntimeIsOptional(e.isOptional, e.type.runtime) + toRuntimeAnnotateKey(e.annotations)).join(", ")}]), [${rest.map(r => r.runtime).join(", ")}])`, `readonly [${elements.map(e => toTypeIsOptional(e.isOptional, e.type.Type)).join(", ")}, ...Array<${item.Type}>${post.length > 0 ? `, ${post.map(p => p.Type).join(", ")}` : ""}]`);
          }
          return makeCode(`Schema.Tuple([${elements.map(e => toRuntimeIsOptional(e.isOptional, e.type.runtime) + toRuntimeAnnotateKey(e.annotations)).join(", ")}])`, `readonly [${elements.map(e => toTypeIsOptional(e.isOptional, e.type.Type)).join(", ")}]`);
        }
      case "Objects":
        {
          const pss = s.propertySignatures.map(p => {
            const isSymbol = typeof p.name === "symbol";
            const name = isSymbol ? addSymbol(p.name) : formatPropertyKey(p.name);
            const nameType = toTypeIsOptional(p.isOptional, toTypeIsMutable(p.isMutable, isSymbol ? `[typeof ${name}]` : name));
            const type = recur(p.type);
            return makeCode(`${isSymbol ? `[${name}]` : name}: ${toRuntimeIsOptional(p.isOptional, toRuntimeIsMutable(p.isMutable, type.runtime))}` + toRuntimeAnnotateKey(p.annotations), `${nameType}: ${type.Type}`);
          });
          const iss = s.indexSignatures.map(is => {
            return {
              parameter: recur(is.parameter),
              type: recur(is.type)
            };
          });
          if (iss.length === 0) {
            // 1) Only properties -> Struct
            return makeCode(`Schema.Struct({ ${pss.map(p => p.runtime).join(", ")} })`, `{ ${pss.map(p => p.Type).join(", ")} }`);
          } else if (pss.length === 0 && iss.length === 1) {
            // 2) Only one index signature and no properties -> Record
            return makeCode(`Schema.Record(${iss[0].parameter.runtime}, ${iss[0].type.runtime})`, `{ readonly [x: ${iss[0].parameter.Type}]: ${iss[0].type.Type} }`);
          } else {
            // 3) Properties + index signatures -> StructWithRest
            return makeCode(`Schema.StructWithRest(Schema.Struct({ ${pss.map(p => p.runtime).join(", ")} }), [${iss.map(is => `Schema.Record(${is.parameter.runtime}, ${is.type.runtime})`).join(", ")}])`, `{ ${pss.map(p => p.Type).join(", ")}, ${iss.map(is => `readonly [x: ${is.parameter.Type}]: ${is.type.Type}`).join(", ")} }`);
          }
        }
      case "Union":
        {
          if (s.types.length === 0) {
            return makeCode("Schema.Never", "never");
          }
          if (s.types.every(t => t._tag === "Literal")) {
            const literals = s.types.map(l => format(l.literal));
            if (literals.length === 1) {
              return makeCode(`Schema.Literal(${literals[0]})`, literals[0]);
            }
            return makeCode(`Schema.Literals([${literals.join(", ")}])`, literals.join(" | "));
          }
          const mode = s.mode === "anyOf" ? "" : `, { mode: "oneOf" }`;
          const types = s.types.map(t => recur(t));
          return makeCode(`Schema.Union([${types.map(t => t.runtime).join(", ")}]${mode})`, types.map(t => t.Type).join(" | "));
        }
    }
  }
  function toTypeBrand(annotations) {
    const brands = collectBrands(annotations);
    if (brands.length === 0) return "";
    addImport(`import type * as Brand from "effect/Brand"`);
    return brands.map(b => ` & Brand.Brand<${format(b)}>`).join("");
  }
  function toTypeChecks(checks) {
    return checks.map(c => toTypeCheck(c)).join("");
  }
  function toTypeCheck(check) {
    switch (check._tag) {
      case "Filter":
        return toTypeBrand(check.annotations);
      case "FilterGroup":
        {
          return toTypeChecks(check.checks);
        }
    }
  }
  function toRuntimeChecks(checks) {
    return checks.map(c => `.check(${toRuntimeCheck(c)})` + toRuntimeBrand(c.annotations)).join("");
  }
  function toRuntimeCheck(check) {
    switch (check._tag) {
      case "Filter":
        return toRuntimeFilter(check);
      case "FilterGroup":
        {
          const a = toRuntimeAnnotations(check.annotations);
          const ca = a === "" ? "" : `, ${a}`;
          return `Schema.makeFilterGroup([${check.checks.map(c => toRuntimeCheck(c)).join(", ")}]${ca})`;
        }
    }
  }
  function toRuntimeFilter(filter) {
    const a = toRuntimeAnnotations(filter.annotations);
    const ca = a === "" ? "" : `, ${a}`;
    switch (filter.meta._tag) {
      case "isTrimmed":
      case "isULID":
      case "isBase64":
      case "isBase64Url":
      case "isUppercased":
      case "isLowercased":
      case "isCapitalized":
      case "isUncapitalized":
      case "isFinite":
      case "isInt":
      case "isUnique":
      case "isDateValid":
        return `Schema.${filter.meta._tag}(${ca})`;
      case "isStringFinite":
      case "isStringBigInt":
      case "isStringSymbol":
      case "isPattern":
        return `Schema.${filter.meta._tag}(${toRuntimeRegExp(filter.meta.regExp)}${ca})`;
      case "isMinLength":
        return `Schema.isMinLength(${filter.meta.minLength}${ca})`;
      case "isMaxLength":
        return `Schema.isMaxLength(${filter.meta.maxLength}${ca})`;
      case "isLengthBetween":
        return `Schema.isLengthBetween(${filter.meta.minimum}, ${filter.meta.maximum}${ca})`;
      case "isUUID":
        return `Schema.isUUID(${filter.meta.version}${ca})`;
      case "isStartsWith":
        return `Schema.isStartsWith(${format(filter.meta.startsWith)}${ca})`;
      case "isEndsWith":
        return `Schema.isEndsWith(${format(filter.meta.endsWith)}${ca})`;
      case "isIncludes":
        return `Schema.isIncludes(${format(filter.meta.includes)}${ca})`;
      case "isGreaterThan":
      case "isGreaterThanBigInt":
      case "isGreaterThanDate":
        return `Schema.${filter.meta._tag}(${toRuntimeValue(filter.meta.exclusiveMinimum)}${ca})`;
      case "isGreaterThanOrEqualTo":
      case "isGreaterThanOrEqualToBigInt":
      case "isGreaterThanOrEqualToDate":
        return `Schema.${filter.meta._tag}(${toRuntimeValue(filter.meta.minimum)}${ca})`;
      case "isLessThan":
      case "isLessThanBigInt":
      case "isLessThanDate":
        return `Schema.${filter.meta._tag}(${toRuntimeValue(filter.meta.exclusiveMaximum)}${ca})`;
      case "isLessThanOrEqualTo":
      case "isLessThanOrEqualToBigInt":
      case "isLessThanOrEqualToDate":
        return `Schema.${filter.meta._tag}(${toRuntimeValue(filter.meta.maximum)}${ca})`;
      case "isBetween":
      case "isBetweenBigInt":
      case "isBetweenDate":
        return `Schema.${filter.meta._tag}({ minimum: ${toRuntimeValue(filter.meta.minimum)}, maximum: ${toRuntimeValue(filter.meta.maximum)}, exclusiveMinimum: ${toRuntimeValue(filter.meta.exclusiveMinimum)}, exclusiveMaximum: ${toRuntimeValue(filter.meta.exclusiveMaximum)}${ca})`;
      case "isMultipleOf":
        return `Schema.isMultipleOf(${filter.meta.divisor}${ca})`;
      case "isMinProperties":
        return `Schema.isMinProperties(${filter.meta.minProperties}${ca})`;
      case "isMaxProperties":
        return `Schema.isMaxProperties(${filter.meta.maxProperties}${ca})`;
      case "isPropertiesLengthBetween":
        return `Schema.isPropertiesLengthBetween(${filter.meta.minimum}, ${filter.meta.maximum}${ca})`;
      case "isPropertyNames":
        return `Schema.isPropertyNames(${recur(filter.meta.propertyNames).runtime}${ca})`;
      case "isMinSize":
        return `Schema.isMinSize(${filter.meta.minSize}${ca})`;
      case "isMaxSize":
        return `Schema.isMaxSize(${filter.meta.maxSize}${ca})`;
      case "isSizeBetween":
        return `Schema.isSizeBetween(${filter.meta.minimum}, ${filter.meta.maximum}${ca})`;
    }
  }
}
const VALID_ASCII_UPPER_JAVASCRIPT_IDENTIFIER_REGEXP = /^[A-Z_$][A-Za-z0-9_$]*$/;
/**
 * Converts an arbitrary string into a valid (ASCII) JavaScript identifier
 * starting with an uppercase letter, `$`, or `_`.
 *
 * - Replaces invalid identifier characters with `_`
 * - Uppercases a leading ASCII letter
 * - If the first character is a digit, prefixes `_`
 * - Empty input becomes `_`
 *
 * @internal
 */
export function sanitizeJavaScriptIdentifier(s) {
  if (s.length === 0) return "_";
  if (VALID_ASCII_UPPER_JAVASCRIPT_IDENTIFIER_REGEXP.test(s)) return s;
  const out = [];
  let needsPrefix = false;
  let i = 0;
  for (const ch of s) {
    if (i === 0) {
      if (ch === "_" || ch === "$" || ch >= "A" && ch <= "Z") {
        out.push(ch);
      } else if (ch >= "a" && ch <= "z") {
        out.push(ch.toUpperCase());
      } else if (ch >= "0" && ch <= "9") {
        out.push(ch);
        needsPrefix = true;
      } else {
        out.push("_");
      }
    } else {
      out.push(isAsciiIdPart(ch) ? ch : "_");
    }
    i++;
  }
  return needsPrefix ? "_" + out.join("") : out.join("");
}
function isAsciiIdStart(ch) {
  return ch === "_" || ch === "$" || ch >= "A" && ch <= "Z" || ch >= "a" && ch <= "z";
}
function isAsciiIdPart(ch) {
  return isAsciiIdStart(ch) || ch >= "0" && ch <= "9";
}
function replacePlaceholders(template, items) {
  let i = 0;
  return template.replace(/\?/g, () => items[i++]);
}
function toTypeParts(parts) {
  if (parts.length === 0) {
    return [""];
  }
  const [first, ...rest] = parts;
  const restPatterns = toTypeParts(rest);
  return toTypePart(first).flatMap(f => restPatterns.map(r => f + r));
}
function toTypePart(r) {
  switch (r._tag) {
    case "Literal":
      return [globalThis.String(r.literal)];
    case "String":
      return ["${string}"];
    case "Number":
      return ["${number}"];
    case "BigInt":
      return ["${bigint}"];
    case "TemplateLiteral":
      return toTypeParts(r.parts);
    case "Union":
      return r.types.flatMap(toTypePart);
    default:
      return [];
  }
}
const toCodeAnnotationsBlacklist = /*#__PURE__*/new Set([...toJsonAnnotationsBlacklist, "typeConstructor", "generation", "brands"]);
function toRuntimeAnnotations(annotations) {
  if (!annotations) return "";
  const entries = [];
  for (const [key, value] of Object.entries(annotations)) {
    if (toCodeAnnotationsBlacklist.has(key)) continue;
    entries.push(`${formatPropertyKey(key)}: ${format(value)}`);
  }
  if (entries.length === 0) return "";
  return `{ ${entries.join(", ")} }`;
}
function toRuntimeBrand(annotations) {
  const brands = collectBrands(annotations);
  return brands.length > 0 ? `.pipe(${brands.map(b => `Schema.brand(${format(b)})`).join(", ")})` : "";
}
function toRuntimeAnnotate(annotations) {
  const s = toRuntimeAnnotations(annotations);
  return s === "" ? "" : `.annotate(${s})`;
}
function toRuntimeAnnotateKey(annotations) {
  const s = toRuntimeAnnotations(annotations);
  return s === "" ? "" : `.annotateKey(${s})`;
}
function toRuntimeIsOptional(isOptional, runtime) {
  return isOptional ? `Schema.optionalKey(${runtime})` : runtime;
}
function toTypeIsOptional(isOptional, type) {
  return isOptional ? `${type}?` : type;
}
function toRuntimeIsMutable(isMutable, runtime) {
  return isMutable ? `Schema.mutableKey(${runtime})` : runtime;
}
function toTypeIsMutable(isMutable, type) {
  return isMutable ? type : `readonly ${type}`;
}
function toRuntimeValue(value) {
  if (value instanceof Date) {
    return `new Date(${value.getTime()})`;
  }
  return format(value);
}
function toRuntimeRegExp(regExp) {
  const args = [format(regExp.source)];
  const flags = regExp.flags.trim();
  if (flags !== "") {
    args.push(format(flags));
  }
  return `new RegExp(${args.join(", ")})`;
}
/**
 * Parses a Draft 2020-12 JSON Schema document into a {@link Document}.
 *
 * - Use to import external JSON Schemas into the Effect representation system.
 * - `options.onEnter` is an optional hook called on each JSON Schema node
 *   before processing, allowing pre-transformation.
 * - Throws if a `$ref` cannot be resolved within the document's definitions.
 * - Circular `$ref`s are detected and cause an error.
 *
 * @see {@link Document}
 * @see {@link toJsonSchemaDocument}
 * @see {@link fromJsonSchemaMultiDocument}
 *
 * @since 4.0.0
 */
export function fromJsonSchemaDocument(document, options) {
  const {
    references,
    representations: schemas
  } = fromJsonSchemaMultiDocument({
    dialect: document.dialect,
    schemas: [document.schema],
    definitions: document.definitions
  }, options);
  return {
    representation: schemas[0],
    references
  };
}
/**
 * Parses a Draft 2020-12 JSON Schema multi-document into a
 * {@link MultiDocument}.
 *
 * - Use to import multiple JSON Schemas sharing definitions.
 * - `options.onEnter` is an optional hook called on each JSON Schema node
 *   before processing.
 * - Throws if a `$ref` cannot be resolved.
 *
 * @see {@link MultiDocument}
 * @see {@link toJsonSchemaMultiDocument}
 * @see {@link fromJsonSchemaDocument}
 *
 * @since 4.0.0
 */
export function fromJsonSchemaMultiDocument(document, options) {
  let visited;
  const references = {};
  const slots = new Map();
  function getSlot(identifier) {
    const existing = slots.get(identifier);
    if (existing) return existing;
    // Create the slot *before* resolving, so self-references can see it.
    const slot = {
      state: 0,
      value: undefined
    };
    slots.set(identifier, slot);
    return slot;
  }
  function resolveReference($ref) {
    const definition = document.definitions[$ref];
    if (definition === undefined) {
      throw new Error(`Reference ${$ref} not found`);
    }
    const slot = getSlot($ref);
    if (slot.state === 2) {
      // Already built: return the built schema directly
      return slot.value;
    }
    if (slot.state === 1) {
      // Circular: we're currently building this identifier.
      throw new Error(`Circular reference detected: ${$ref}`);
    }
    // First time: build it.
    slot.state = 1;
    const value = recur(definition);
    slot.value = value._tag === "Reference" ? resolveReference(value.$ref) : value;
    slot.state = 2;
    return slot.value;
  }
  Object.entries(document.definitions).forEach(([identifier, definition]) => {
    visited = new Set([identifier]);
    references[identifier] = recur(definition);
  });
  visited = new Set();
  const representations = Arr.map(document.schemas, recur);
  return {
    representations,
    references
  };
  function recur(u) {
    if (u === false) return never;
    if (!Predicate.isObject(u)) return unknown;
    let js = options?.onEnter?.(u) ?? u;
    if (Array.isArray(js.type)) {
      if (js.type.every(isType)) {
        const {
          type,
          ...rest
        } = js;
        js = {
          anyOf: type.map(type => ({
            type
          })),
          ...rest
        };
      } else {
        js = {};
      }
    }
    let out = on(js);
    const annotations = collectAnnotations(js);
    if (annotations !== undefined) {
      out = combine(out, {
        _tag: "Unknown",
        annotations
      });
    }
    if (Array.isArray(js.allOf)) {
      out = js.allOf.reduce((acc, curr) => combine(acc, recur(curr)), out);
    }
    if (Array.isArray(js.anyOf)) {
      out = combine({
        _tag: "Union",
        types: js.anyOf.map(type => recur(type)),
        mode: "anyOf"
      }, out);
    }
    if (Array.isArray(js.oneOf)) {
      out = combine({
        _tag: "Union",
        types: js.oneOf.map(type => recur(type)),
        mode: "oneOf"
      }, out);
    }
    return out;
  }
  function on(js) {
    if (typeof js.$ref === "string") {
      const $ref = js.$ref.slice(2).split("/").at(-1);
      if ($ref !== undefined) {
        const reference = {
          _tag: "Reference",
          $ref: unescapeToken($ref)
        };
        if (visited.has($ref)) {
          return {
            _tag: "Suspend",
            thunk: reference,
            checks: []
          };
        } else {
          return reference;
        }
      }
    } else if ("const" in js) {
      if (isLiteralValue(js.const)) {
        return {
          _tag: "Literal",
          literal: js.const
        };
      } else if (js.const === null) {
        return null_;
      }
    } else if (Array.isArray(js.enum)) {
      const types = [];
      for (const e of js.enum) {
        if (isLiteralValue(e)) {
          types.push({
            _tag: "Literal",
            literal: e
          });
        } else if (e === null) {
          types.push(null_);
        } else {
          types.push(recur(e));
        }
      }
      if (types.length === 1) {
        return types[0];
      } else {
        return {
          _tag: "Union",
          types,
          mode: "anyOf"
        };
      }
    }
    const type = isType(js.type) ? js.type : getType(js);
    if (type !== undefined) {
      switch (type) {
        case "null":
          return null_;
        case "string":
          {
            const checks = collectStringChecks(js);
            if (checks.length > 0) {
              return {
                ...string,
                checks
              };
            }
            return string;
          }
        case "number":
          return {
            _tag: "Number",
            checks: [{
              _tag: "Filter",
              meta: {
                _tag: "isFinite"
              }
            }, ...collectNumberChecks(js)]
          };
        case "integer":
          return {
            _tag: "Number",
            checks: [{
              _tag: "Filter",
              meta: {
                _tag: "isInt"
              }
            }, ...collectNumberChecks(js)]
          };
        case "boolean":
          return boolean;
        case "array":
          {
            const minItems = typeof js.minItems === "number" ? js.minItems : 0;
            const elements = (Array.isArray(js.prefixItems) ? js.prefixItems : []).map((e, i) => ({
              isOptional: i + 1 > minItems,
              type: recur(e)
            }));
            const rest = js.items !== undefined ? [recur(js.items)] : js.prefixItems !== undefined && typeof js.maxItems === "number" ? [] : [unknown];
            return {
              _tag: "Arrays",
              elements,
              rest,
              checks: collectArraysChecks(js)
            };
          }
        case "object":
          {
            return {
              _tag: "Objects",
              propertySignatures: collectProperties(js),
              indexSignatures: collectIndexSignatures(js),
              checks: collectObjectsChecks(js)
            };
          }
      }
    }
    return {
      _tag: "Unknown"
    };
  }
  function collectObjectsChecks(js) {
    const checks = [];
    if (typeof js.minProperties === "number") {
      checks.push({
        _tag: "Filter",
        meta: {
          _tag: "isMinProperties",
          minProperties: js.minProperties
        }
      });
    }
    if (typeof js.maxProperties === "number") {
      checks.push({
        _tag: "Filter",
        meta: {
          _tag: "isMaxProperties",
          maxProperties: js.maxProperties
        }
      });
    }
    if (js.propertyNames !== undefined) {
      const propertyNames = recur(js.propertyNames);
      checks.push({
        _tag: "Filter",
        meta: {
          _tag: "isPropertyNames",
          propertyNames
        }
      });
    }
    return checks;
  }
  function combine(a, b) {
    switch (a._tag) {
      default:
        return never;
      case "Reference":
        return combine(resolveReference(a.$ref), b);
      case "Never":
        return a;
      case "Unknown":
        switch (b._tag) {
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return {
              ...b,
              ...combineAnnotations(a.annotations, b.annotations)
            };
        }
      case "Null":
        switch (b._tag) {
          case "Unknown":
          case "Null":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "String":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "String":
            {
              const checks = combineChecks(a.checks, b.checks, b.annotations);
              return {
                _tag: "String",
                checks: checks ?? a.checks,
                ...combineAnnotations(a.annotations, checks ? undefined : b.annotations)
              };
            }
          case "Literal":
            return typeof b.literal === "string" ? {
              ...b,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Number":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Number":
            {
              const checks = combineNumberChecks(a.checks, b.checks, b.annotations);
              return {
                _tag: "Number",
                checks: checks ?? a.checks,
                ...combineAnnotations(a.annotations, checks ? undefined : b.annotations)
              };
            }
          case "Literal":
            return typeof b.literal === "number" ? {
              ...b,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Boolean":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Boolean":
            return {
              _tag: "Boolean",
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Literal":
            return typeof b.literal === "boolean" ? {
              ...b,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Literal":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Literal":
            return a.literal === b.literal ? {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "String":
            return typeof a.literal === "string" ? {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Number":
            return typeof a.literal === "number" ? {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Boolean":
            return typeof a.literal === "boolean" ? {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            } : never;
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Arrays":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Arrays":
            {
              const checks = combineArraysChecks(a.checks, b.checks, b.annotations);
              return {
                _tag: "Arrays",
                elements: combineElements(a.elements, b.elements),
                rest: combineRest(a.rest, b.rest),
                checks: checks ?? a.checks,
                ...combineAnnotations(a.annotations, checks ? undefined : b.annotations)
              };
            }
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Objects":
        switch (b._tag) {
          case "Unknown":
            return {
              ...a,
              ...combineAnnotations(a.annotations, b.annotations)
            };
          case "Objects":
            {
              const checks = combineChecks(a.checks, b.checks, b.annotations);
              return {
                _tag: "Objects",
                propertySignatures: combinePropertySignatures(a.propertySignatures, b.propertySignatures),
                indexSignatures: combineIndexSignatures(a.indexSignatures, b.indexSignatures),
                checks: checks ?? a.checks,
                ...combineAnnotations(a.annotations, checks ? undefined : b.annotations)
              };
            }
          case "Union":
            return combine(b, a);
          case "Reference":
            return combine(a, resolveReference(b.$ref));
          default:
            return never;
        }
      case "Union":
        {
          switch (b._tag) {
            case "Unknown":
              return {
                ...a,
                ...combineAnnotations(a.annotations, b.annotations)
              };
            default:
              {
                const types = a.types.map(s => combine(s, b)).filter(s => s !== never);
                if (types.length === 0) return never;
                return {
                  _tag: "Union",
                  types,
                  mode: a.mode,
                  ...makeAnnotations(a.annotations)
                };
              }
          }
        }
    }
  }
  function collectProperties(js) {
    const properties = Predicate.isObject(js.properties) ? js.properties : {};
    const required = Array.isArray(js.required) ? js.required : [];
    required.forEach(key => {
      if (!Object.hasOwn(properties, key)) {
        properties[key] = {};
      }
    });
    return Object.entries(properties).map(([key, v]) => ({
      name: key,
      type: recur(v),
      isOptional: !required.includes(key),
      isMutable: false
    }));
  }
  function collectIndexSignatures(js) {
    const out = [];
    if (Predicate.isObject(js.patternProperties)) {
      for (const [pattern, value] of Object.entries(js.patternProperties)) {
        out.push({
          parameter: recur({
            pattern
          }),
          type: recur(value)
        });
      }
    }
    if (js.additionalProperties === undefined || js.additionalProperties === true) {
      out.push({
        parameter: string,
        type: unknown
      });
    } else if (Predicate.isObject(js.additionalProperties)) {
      out.push({
        parameter: string,
        type: recur(js.additionalProperties)
      });
    }
    return out;
  }
  function combineElements(a, b) {
    const len = Math.max(a.length, b.length);
    let out = [];
    for (let i = 0; i < len; i++) {
      out.push({
        isOptional: a[i].isOptional && b[i].isOptional,
        type: combine(a[i].type, b[i].type)
      });
    }
    if (a.length > len) {
      out = [...out, ...a.slice(len)];
    } else if (b.length > len) {
      out = [...out, ...b.slice(len)];
    }
    return out;
  }
  function combineRest(a, b) {
    const len = Math.max(a.length, b.length);
    let out = [];
    for (let i = 0; i < len; i++) {
      out.push(combine(a[i], b[i]));
    }
    if (a.length > len) {
      out = [...out, ...a.slice(len)];
    } else if (b.length > len) {
      out = [...out, ...b.slice(len)];
    }
    return out;
  }
  function combinePropertySignatures(a, b) {
    const propertySignatures = [];
    const thatPropertiesMap = {};
    for (const p of b) {
      thatPropertiesMap[p.name] = p;
    }
    const keys = new Set();
    for (const p of a) {
      keys.add(p.name);
      const thatp = thatPropertiesMap[p.name];
      if (thatp) {
        propertySignatures.push({
          name: p.name,
          type: combine(p.type, thatp.type),
          isOptional: p.isOptional && thatp.isOptional,
          isMutable: p.isMutable
        });
      } else {
        propertySignatures.push(p);
      }
    }
    for (const p of b) {
      if (!keys.has(p.name)) propertySignatures.push(p);
    }
    return propertySignatures;
  }
  function combineIndexSignatures(a, b) {
    if (a.length === 0 || b.length === 0) return [];
    const out = [...a];
    for (const is of b) {
      if (is.parameter === string) {
        const i = a.findIndex(is => is.parameter === string);
        if (i !== -1) {
          out[i] = {
            parameter: string,
            type: combine(a[i].type, is.type)
          };
        } else {
          out.push(is);
        }
      } else {
        out.push(is);
      }
    }
    return out;
  }
}
function asChecks(checks, annotations) {
  if (Arr.isReadonlyArrayNonEmpty(checks)) {
    if (annotations !== undefined) {
      if (checks.length === 1) {
        const check = checks[0];
        if (check.annotations === undefined) {
          return [{
            ...check,
            annotations
          }];
        } else {
          return [{
            _tag: "FilterGroup",
            checks,
            annotations
          }];
        }
      } else {
        return [{
          _tag: "FilterGroup",
          checks,
          annotations
        }];
      }
    }
    return checks;
  }
}
function combineChecks(a, b, annotations) {
  const checks = asChecks(b, annotations);
  if (checks) {
    return [...a, ...checks];
  }
}
function combineNumberChecks(a, b, annotations) {
  if (a.some(c => c._tag === "Filter" && c.meta._tag === "isFinite")) {
    b = b.filter(c => c._tag !== "Filter" || c.meta._tag !== "isFinite");
  }
  if (a.some(c => c._tag === "Filter" && c.meta._tag === "isInt")) {
    b = b.filter(c => c._tag !== "Filter" || c.meta._tag !== "isInt");
  }
  return combineChecks(a, b, annotations);
}
function combineArraysChecks(a, b, annotations) {
  if (a.some(c => c._tag === "Filter" && c.meta._tag === "isUnique")) {
    b = b.filter(c => c._tag !== "Filter" || c.meta._tag !== "isUnique");
  }
  return combineChecks(a, b, annotations);
}
function makeAnnotations(annotations) {
  return annotations ? {
    annotations
  } : undefined;
}
function combineAnnotations(a, b) {
  if (a === undefined) return makeAnnotations(b);
  if (b === undefined) return makeAnnotations(a);
  return {
    annotations: {
      ...a,
      ...b
    }
  }; // TODO: better merge
}
function collectStringChecks(js) {
  const checks = [];
  if (typeof js.minLength === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isMinLength",
        minLength: js.minLength
      }
    });
  }
  if (typeof js.maxLength === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isMaxLength",
        maxLength: js.maxLength
      }
    });
  }
  if (typeof js.pattern === "string") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isPattern",
        regExp: new RegExp(js.pattern)
      }
    });
  }
  return checks;
}
function collectNumberChecks(js) {
  const checks = [];
  if (typeof js.minimum === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isGreaterThanOrEqualTo",
        minimum: js.minimum
      }
    });
  }
  if (typeof js.maximum === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isLessThanOrEqualTo",
        maximum: js.maximum
      }
    });
  }
  if (typeof js.exclusiveMinimum === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isGreaterThan",
        exclusiveMinimum: js.exclusiveMinimum
      }
    });
  }
  if (typeof js.exclusiveMaximum === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isLessThan",
        exclusiveMaximum: js.exclusiveMaximum
      }
    });
  }
  if (typeof js.multipleOf === "number") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isMultipleOf",
        divisor: js.multipleOf
      }
    });
  }
  return checks;
}
function collectArraysChecks(js) {
  const checks = [];
  if (js.prefixItems === undefined) {
    if (typeof js.minItems === "number") {
      checks.push({
        _tag: "Filter",
        meta: {
          _tag: "isMinLength",
          minLength: js.minItems
        }
      });
    }
    if (typeof js.maxItems === "number") {
      checks.push({
        _tag: "Filter",
        meta: {
          _tag: "isMaxLength",
          maxLength: js.maxItems
        }
      });
    }
  }
  if (typeof js.uniqueItems === "boolean") {
    checks.push({
      _tag: "Filter",
      meta: {
        _tag: "isUnique"
      }
    });
  }
  return checks;
}
const unknown = {
  _tag: "Unknown"
};
const never = {
  _tag: "Never"
};
const null_ = {
  _tag: "Null"
};
const string = {
  _tag: "String",
  checks: []
};
const boolean = {
  _tag: "Boolean"
};
function collectAnnotations(schema) {
  const as = {};
  if (typeof schema.title === "string") as.title = schema.title;
  if (typeof schema.description === "string") as.description = schema.description;
  if (schema.default !== undefined) as.default = schema.default;
  if (Array.isArray(schema.examples)) as.examples = schema.examples;
  if (typeof schema.readOnly === "boolean") as.readOnly = schema.readOnly;
  if (typeof schema.writeOnly === "boolean") as.writeOnly = schema.writeOnly;
  if (typeof schema.format === "string") as.format = schema.format;
  if (typeof schema.contentEncoding === "string") as.contentEncoding = schema.contentEncoding;
  if (typeof schema.contentMediaType === "string") as.contentMediaType = schema.contentMediaType;
  return Rec.isEmptyRecord(as) ? undefined : as;
}
function isLiteralValue(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
const stringKeys = ["minLength", "maxLength", "pattern", "format", "contentMediaType", "contentSchema"];
const numberKeys = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"];
const objectKeys = ["properties", "required", "additionalProperties", "patternProperties", "propertyNames", "minProperties", "maxProperties"];
const arrayKeys = ["items", "prefixItems", "additionalItems", "minItems", "maxItems", "uniqueItems"];
function getType(js) {
  if (stringKeys.some(key => js[key] !== undefined)) {
    return "string";
  }
  if (numberKeys.some(key => js[key] !== undefined)) {
    return "number";
  }
  if (objectKeys.some(key => js[key] !== undefined)) {
    return "object";
  }
  if (arrayKeys.some(key => js[key] !== undefined)) {
    return "array";
  }
}
const types = ["null", "string", "number", "integer", "boolean", "object", "array"];
function isType(type) {
  return typeof type === "string" && types.includes(type);
}
/** @internal */
export function topologicalSort(references) {
  const identifiers = Object.keys(references);
  const identifierSet = new Set(identifiers);
  const collectRefs = root => {
    const refs = new Set();
    const visited = new WeakSet();
    const stack = [root];
    while (stack.length > 0) {
      const r = stack.pop();
      if (visited.has(r)) continue;
      visited.add(r);
      if (r._tag === "Reference") {
        if (identifierSet.has(r.$ref)) {
          refs.add(r.$ref);
        }
      }
      // Push nested Representation schemas onto the stack
      switch (r._tag) {
        case "Declaration":
          for (const typeParam of r.typeParameters) stack.push(typeParam);
          stack.push(r.encodedSchema);
          break;
        case "Suspend":
          stack.push(r.thunk);
          break;
        case "String":
          if (r.contentSchema !== undefined) stack.push(r.contentSchema);
          break;
        case "TemplateLiteral":
          for (const part of r.parts) stack.push(part);
          break;
        case "Arrays":
          for (const element of r.elements) stack.push(element.type);
          for (const rest of r.rest) stack.push(rest);
          break;
        case "Objects":
          for (const propertySignature of r.propertySignatures) stack.push(propertySignature.type);
          for (const indexSignature of r.indexSignatures) {
            stack.push(indexSignature.parameter);
            stack.push(indexSignature.type);
          }
          break;
        case "Union":
          for (const type of r.types) stack.push(type);
          break;
      }
    }
    return refs;
  };
  // identifier -> internal identifiers it depends on
  const dependencies = new Map(identifiers.map(id => [id, collectRefs(references[id])]));
  // Mark only nodes that are part of cycles
  const recursive = new Set();
  const state = new Map(); // 0 = new, 1 = visiting, 2 = done
  const stack = [];
  const indexInStack = new Map();
  const dfs = id => {
    const s = state.get(id) ?? 0;
    if (s === 1) {
      const start = indexInStack.get(id);
      if (start !== undefined) {
        for (let i = start; i < stack.length; i++) {
          recursive.add(stack[i]);
        }
      }
      return;
    }
    if (s === 2) return;
    state.set(id, 1);
    indexInStack.set(id, stack.length);
    stack.push(id);
    for (const dep of dependencies.get(id) ?? []) {
      dfs(dep);
    }
    stack.pop();
    indexInStack.delete(id);
    state.set(id, 2);
  };
  for (const id of identifiers) dfs(id);
  // Topologically sort the non-recursive nodes (ignoring edges to recursive nodes)
  const inDegree = new Map();
  const dependents = new Map(); // dep -> nodes that depend on it
  for (const id of identifiers) {
    if (!recursive.has(id)) {
      inDegree.set(id, 0);
      dependents.set(id, new Set());
    }
  }
  for (const [id, deps] of dependencies) {
    if (recursive.has(id)) continue;
    for (const dep of deps) {
      if (recursive.has(dep)) continue;
      inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
      dependents.get(dep)?.add(id);
    }
  }
  const queue = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const nonRecursives = [];
  for (let i = 0; i < queue.length; i++) {
    const $ref = queue[i];
    nonRecursives.push({
      $ref,
      representation: references[$ref]
    });
    for (const next of dependents.get($ref) ?? []) {
      const deg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }
  const recursives = {};
  for (const $ref of recursive) {
    recursives[$ref] = references[$ref];
  }
  return {
    nonRecursives,
    recursives
  };
}
//# sourceMappingURL=SchemaRepresentation.js.map