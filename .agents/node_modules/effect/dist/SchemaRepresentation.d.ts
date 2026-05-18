import type * as JsonSchema from "./JsonSchema.ts";
import * as Schema from "./Schema.ts";
import type * as AST from "./SchemaAST.ts";
/**
 * A custom type declaration (e.g. `Date`, `Option`, `ReadonlySet`).
 *
 * - Use when inspecting or transforming non-primitive schema types.
 * - `typeParameters` holds the inner type arguments (e.g. the `A` in `Option<A>`).
 * - `encodedSchema` is the fallback representation when no {@link Reviver}
 *   recognizes this declaration.
 * - `annotations.typeConstructor` identifies the declaration kind (e.g.
 *   `{ _tag: "effect/Option" }`).
 *
 * @see {@link Reviver}
 * @see {@link toSchemaDefaultReviver}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Declaration {
    readonly _tag: "Declaration";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly typeParameters: ReadonlyArray<Representation>;
    readonly checks: ReadonlyArray<Check<DeclarationMeta>>;
    readonly encodedSchema: Representation;
}
/**
 * A lazily-resolved representation, used for recursive schemas.
 *
 * - `thunk` points to the actual representation (possibly via a {@link Reference}).
 * - `checks` is always empty on `Suspend` nodes.
 *
 * @see {@link Reference}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Suspend {
    readonly _tag: "Suspend";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly checks: readonly [];
    readonly thunk: Representation;
}
/**
 * A named reference to a definition in the {@link References} map.
 *
 * - `$ref` is the key into `Document.references` or `MultiDocument.references`.
 * - Resolved lazily by {@link toSchema} and {@link toCodeDocument}.
 * - Throws at runtime if the key is not found in the references map.
 *
 * @see {@link References}
 * @see {@link Document}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Reference {
    readonly _tag: "Reference";
    readonly $ref: string;
}
/**
 * The `null` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Null {
    readonly _tag: "Null";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `undefined` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Undefined {
    readonly _tag: "Undefined";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `void` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Void {
    readonly _tag: "Void";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `never` type (no valid values).
 *
 * @category Model
 * @since 4.0.0
 */
export interface Never {
    readonly _tag: "Never";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `unknown` type (any value accepted).
 *
 * @category Model
 * @since 4.0.0
 */
export interface Unknown {
    readonly _tag: "Unknown";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `any` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Any {
    readonly _tag: "Any";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `string` type with optional validation checks.
 *
 * - `checks` holds string-specific constraints (min/max length, pattern, UUID, etc.).
 * - `contentMediaType` + `contentSchema` indicate the string contains
 *   encoded data (e.g. `"application/json"` with a nested schema).
 *
 * @see {@link StringMeta}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export interface String {
    readonly _tag: "String";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly checks: ReadonlyArray<Check<StringMeta>>;
    readonly contentMediaType?: string | undefined;
    readonly contentSchema?: Representation | undefined;
}
/**
 * The `number` type with optional validation checks.
 *
 * - `checks` holds number-specific constraints (int, finite, min, max, multipleOf, etc.).
 *
 * @see {@link NumberMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Number {
    readonly _tag: "Number";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly checks: ReadonlyArray<Check<NumberMeta>>;
}
/**
 * The `boolean` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Boolean {
    readonly _tag: "Boolean";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * The `bigint` type with optional validation checks.
 *
 * @see {@link BigIntMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export interface BigInt {
    readonly _tag: "BigInt";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly checks: ReadonlyArray<Check<BigIntMeta>>;
}
/**
 * The `symbol` type.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Symbol {
    readonly _tag: "Symbol";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * A specific literal value (`string`, `number`, `boolean`, or `bigint`).
 *
 * @category Model
 * @since 4.0.0
 */
export interface Literal {
    readonly _tag: "Literal";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly literal: string | number | boolean | bigint;
}
/**
 * A specific unique `symbol` value.
 *
 * @category Model
 * @since 4.0.0
 */
export interface UniqueSymbol {
    readonly _tag: "UniqueSymbol";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly symbol: symbol;
}
/**
 * The `object` keyword type (matches any non-primitive).
 *
 * @category Model
 * @since 4.0.0
 */
export interface ObjectKeyword {
    readonly _tag: "ObjectKeyword";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * A TypeScript-style enum. Each entry is a `[name, value]` pair.
 *
 * @category Model
 * @since 4.0.0
 */
export interface Enum {
    readonly _tag: "Enum";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly enums: ReadonlyArray<readonly [string, string | number]>;
}
/**
 * A template literal type composed of a sequence of parts (literals, strings,
 * numbers, etc.).
 *
 * @category Model
 * @since 4.0.0
 */
export interface TemplateLiteral {
    readonly _tag: "TemplateLiteral";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly parts: ReadonlyArray<Representation>;
}
/**
 * An array or tuple type.
 *
 * - `elements` are the fixed positional elements (tuple prefix). Each may be
 *   optional.
 * - `rest` are the variadic tail types. A single-element `rest` with no
 *   `elements` produces a plain `Array<T>`.
 * - `checks` holds array-specific constraints (minLength, maxLength, unique, etc.).
 *
 * @see {@link Element}
 * @see {@link ArraysMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Arrays {
    readonly _tag: "Arrays";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly elements: ReadonlyArray<Element>;
    readonly rest: ReadonlyArray<Representation>;
    readonly checks: ReadonlyArray<Check<ArraysMeta>>;
}
/**
 * A positional element within an {@link Arrays} tuple.
 *
 * - `isOptional` indicates whether this element can be absent.
 * - `type` is the schema representation for this element's value.
 *
 * @see {@link Arrays}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Element {
    readonly isOptional: boolean;
    readonly type: Representation;
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * An object/struct type with named properties and optional index signatures.
 *
 * - `propertySignatures` are the explicitly named fields.
 * - `indexSignatures` define catch-all key/value types (like `Record<string, T>`).
 * - `checks` holds object-specific constraints (minProperties, maxProperties, etc.).
 *
 * @see {@link PropertySignature}
 * @see {@link IndexSignature}
 * @see {@link ObjectsMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Objects {
    readonly _tag: "Objects";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly propertySignatures: ReadonlyArray<PropertySignature>;
    readonly indexSignatures: ReadonlyArray<IndexSignature>;
    readonly checks: ReadonlyArray<Check<ObjectsMeta>>;
}
/**
 * A named property within an {@link Objects} representation.
 *
 * - `name` is the property key (string, number, or symbol).
 * - `isOptional` indicates whether the key can be absent.
 * - `isMutable` indicates whether the property is mutable (vs. readonly).
 *
 * @see {@link Objects}
 *
 * @category Model
 * @since 4.0.0
 */
export interface PropertySignature {
    readonly name: PropertyKey;
    readonly type: Representation;
    readonly isOptional: boolean;
    readonly isMutable: boolean;
    readonly annotations?: Schema.Annotations.Annotations | undefined;
}
/**
 * An index signature (e.g. `[key: string]: number`) within an {@link Objects}.
 *
 * - `parameter` is the key type representation.
 * - `type` is the value type representation.
 *
 * @see {@link Objects}
 *
 * @category Model
 * @since 4.0.0
 */
export interface IndexSignature {
    readonly parameter: Representation;
    readonly type: Representation;
}
/**
 * A union of multiple representations.
 *
 * - `types` are the union members.
 * - `mode` controls JSON Schema output: `"anyOf"` (default) or `"oneOf"`
 *   (mutually exclusive).
 *
 * @category Model
 * @since 4.0.0
 */
export interface Union {
    readonly _tag: "Union";
    readonly annotations?: Schema.Annotations.Annotations | undefined;
    readonly types: ReadonlyArray<Representation>;
    readonly mode: "anyOf" | "oneOf";
}
/**
 * The core tagged union of all supported schema shapes.
 *
 * Each variant has a `_tag` discriminator. Switch on `_tag` to handle each
 * shape. Most variants carry optional `annotations` and some carry `checks`
 * for validation constraints.
 *
 * @see {@link Document}
 * @see {@link fromAST}
 *
 * @category Model
 * @since 4.0.0
 */
export type Representation = Declaration | Reference | Suspend | Null | Undefined | Void | Never | Unknown | Any | String | Number | Boolean | BigInt | Symbol | Literal | UniqueSymbol | ObjectKeyword | Enum | TemplateLiteral | Arrays | Objects | Union;
/**
 * A validation constraint attached to a type. Either a single {@link Filter}
 * or a {@link FilterGroup} combining multiple checks.
 *
 * @see {@link Filter}
 * @see {@link FilterGroup}
 *
 * @category Model
 * @since 4.0.0
 */
export type Check<M> = Filter<M> | FilterGroup<M>;
/**
 * A single validation constraint with typed metadata describing the check
 * (e.g. `{ _tag: "isMinLength", minLength: 3 }`).
 *
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export interface Filter<M> {
    readonly _tag: "Filter";
    readonly annotations?: Schema.Annotations.Filter | undefined;
    readonly meta: M;
}
/**
 * A group of validation constraints that are logically combined. Contains
 * at least one {@link Check}.
 *
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export interface FilterGroup<M> {
    readonly _tag: "FilterGroup";
    readonly annotations?: Schema.Annotations.Filter | undefined;
    readonly checks: readonly [Check<M>, ...Array<Check<M>>];
}
/**
 * Metadata union for string-specific validation checks (minLength, maxLength,
 * pattern, UUID, trimmed, etc.).
 *
 * @see {@link String}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export type StringMeta = Schema.Annotations.BuiltInMetaDefinitions["isStringFinite" | "isStringBigInt" | "isStringSymbol" | "isMinLength" | "isMaxLength" | "isPattern" | "isLengthBetween" | "isTrimmed" | "isUUID" | "isULID" | "isBase64" | "isBase64Url" | "isStartsWith" | "isEndsWith" | "isIncludes" | "isUppercased" | "isLowercased" | "isCapitalized" | "isUncapitalized"];
/**
 * Metadata union for number-specific validation checks (int, finite,
 * min, max, multipleOf, between).
 *
 * @see {@link Number}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export type NumberMeta = Schema.Annotations.BuiltInMetaDefinitions["isInt" | "isFinite" | "isMultipleOf" | "isGreaterThanOrEqualTo" | "isLessThanOrEqualTo" | "isGreaterThan" | "isLessThan" | "isBetween"];
/**
 * Metadata union for bigint-specific validation checks (min, max, between).
 *
 * @see {@link BigInt}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export type BigIntMeta = Schema.Annotations.BuiltInMetaDefinitions["isGreaterThanOrEqualToBigInt" | "isLessThanOrEqualToBigInt" | "isGreaterThanBigInt" | "isLessThanBigInt" | "isBetweenBigInt"];
/**
 * Metadata union for array-specific validation checks (minLength, maxLength,
 * length, unique).
 *
 * @see {@link Arrays}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export type ArraysMeta = Schema.Annotations.BuiltInMetaDefinitions["isMinLength" | "isMaxLength" | "isLengthBetween" | "isUnique"];
/**
 * Metadata union for object-specific validation checks (minProperties,
 * maxProperties, propertiesLength, propertyNames).
 *
 * @see {@link Objects}
 * @see {@link Check}
 *
 * @category Model
 * @since 4.0.0
 */
export type ObjectsMeta = Schema.Annotations.BuiltInMetaDefinitions["isMinProperties" | "isMaxProperties" | "isPropertiesLengthBetween"] | {
    readonly _tag: "isPropertyNames";
    readonly propertyNames: Representation;
};
/**
 * Metadata union for Date-specific validation checks (valid, min, max, between).
 *
 * @see {@link Declaration}
 * @see {@link DeclarationMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export type DateMeta = Schema.Annotations.BuiltInMetaDefinitions["isDateValid" | "isGreaterThanDate" | "isGreaterThanOrEqualToDate" | "isLessThanDate" | "isLessThanOrEqualToDate" | "isBetweenDate"];
/**
 * Metadata union for size-based validation checks (minSize, maxSize, size).
 * Used for collection types like `Set`, `Map`.
 *
 * @see {@link Declaration}
 * @see {@link DeclarationMeta}
 *
 * @category Model
 * @since 4.0.0
 */
export type SizeMeta = Schema.Annotations.BuiltInMetaDefinitions["isMinSize" | "isMaxSize" | "isSizeBetween"];
/**
 * Metadata union for {@link Declaration} checks — either {@link DateMeta}
 * or {@link SizeMeta}.
 *
 * @category Model
 * @since 4.0.0
 */
export type DeclarationMeta = DateMeta | SizeMeta;
/**
 * A string-keyed map of named {@link Representation} definitions. Used by
 * {@link Document} and {@link MultiDocument} for `$ref` resolution (analogous
 * to JSON Schema `$defs`).
 *
 * @see {@link Reference}
 * @see {@link Document}
 *
 * @category Model
 * @since 4.0.0
 */
export interface References {
    readonly [$ref: string]: Representation;
}
/**
 * A single {@link Representation} together with its named {@link References}.
 *
 * - Use {@link fromAST} to create a `Document` from a Schema AST.
 * - Use {@link toSchema} to reconstruct a runtime Schema.
 * - Use {@link toJsonSchemaDocument} to convert to JSON Schema.
 * - Use {@link toMultiDocument} to wrap as a {@link MultiDocument}.
 *
 * @see {@link MultiDocument}
 * @see {@link fromAST}
 *
 * @category Model
 * @since 4.0.0
 */
export type Document = {
    readonly representation: Representation;
    readonly references: References;
};
/**
 * One or more {@link Representation}s sharing a common {@link References} map.
 *
 * - Use {@link fromASTs} to create from multiple Schema ASTs.
 * - Use {@link toCodeDocument} to generate TypeScript code.
 * - Use {@link toJsonSchemaMultiDocument} to convert to JSON Schema.
 *
 * @see {@link Document}
 * @see {@link fromASTs}
 *
 * @category Model
 * @since 4.0.0
 */
export type MultiDocument = {
    readonly representations: readonly [Representation, ...Array<Representation>];
    readonly references: References;
};
/**
 * A tree of primitive values used to serialize annotations to JSON.
 *
 * @category Tree
 * @since 4.0.0
 */
export type PrimitiveTree = Schema.Tree<null | number | boolean | bigint | symbol | string>;
/**
 * Schema codec for {@link PrimitiveTree}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $PrimitiveTree: Schema.Codec<PrimitiveTree>;
/**
 * Schema codec for `Schema.Annotations.Annotations`. Filters out internal
 * annotation keys and non-primitive values during encoding.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Annotations: Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>;
/**
 * Schema codec for the {@link Null} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Null: Schema.Struct<{
    readonly _tag: Schema.tag<"Null">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Undefined} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Undefined: Schema.Struct<{
    readonly _tag: Schema.tag<"Undefined">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Void} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Void: Schema.Struct<{
    readonly _tag: Schema.tag<"Void">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Never} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Never: Schema.Struct<{
    readonly _tag: Schema.tag<"Never">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Unknown} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Unknown: Schema.Struct<{
    readonly _tag: Schema.tag<"Unknown">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Any} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Any: Schema.Struct<{
    readonly _tag: Schema.tag<"Any">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for {@link StringMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $StringMeta: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isStringFinite">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isStringBigInt">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isStringSymbol">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isTrimmed">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isUUID">;
    readonly regExp: Schema.RegExp;
    readonly version: Schema.UndefinedOr<Schema.Literals<readonly [1, 2, 3, 4, 5, 6, 7, 8]>>;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isULID">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isBase64">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isBase64Url">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isStartsWith">;
    readonly startsWith: Schema.String;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isEndsWith">;
    readonly endsWith: Schema.String;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isIncludes">;
    readonly includes: Schema.String;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isUppercased">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLowercased">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isCapitalized">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isUncapitalized">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMinLength">;
    readonly minLength: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMaxLength">;
    readonly maxLength: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isPattern">;
    readonly regExp: Schema.RegExp;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLengthBetween">;
    readonly minimum: Schema.Int;
    readonly maximum: Schema.Int;
}>]>;
/**
 * Schema codec for the {@link String} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $String: Schema.Struct<{
    readonly _tag: Schema.tag<"String">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isStringFinite";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStringBigInt";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStringSymbol";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isTrimmed";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUUID";
        readonly regExp: RegExp;
        readonly version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
    } | {
        readonly _tag: "isULID";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isBase64";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isBase64Url";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStartsWith";
        readonly startsWith: string;
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isEndsWith";
        readonly endsWith: string;
        readonly regExp: RegExp;
    } | {
        readonly includes: string;
        readonly _tag: "isIncludes";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUppercased";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isLowercased";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isCapitalized";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUncapitalized";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isMinLength";
        readonly minLength: number;
    } | {
        readonly _tag: "isMaxLength";
        readonly maxLength: number;
    } | {
        readonly _tag: "isLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isPattern";
        readonly regExp: RegExp;
    }>, Check<{
        readonly _tag: "isStringFinite";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStringBigInt";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStringSymbol";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isTrimmed";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUUID";
        readonly regExp: RegExp;
        readonly version: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | undefined;
    } | {
        readonly _tag: "isULID";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isBase64";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isBase64Url";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isStartsWith";
        readonly startsWith: string;
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isEndsWith";
        readonly endsWith: string;
        readonly regExp: RegExp;
    } | {
        readonly includes: string;
        readonly _tag: "isIncludes";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUppercased";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isLowercased";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isCapitalized";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isUncapitalized";
        readonly regExp: RegExp;
    } | {
        readonly _tag: "isMinLength";
        readonly minLength: number;
    } | {
        readonly _tag: "isMaxLength";
        readonly maxLength: number;
    } | {
        readonly _tag: "isLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isPattern";
        readonly regExp: RegExp;
    }>, never, never>>;
    readonly contentMediaType: Schema.optional<Schema.String>;
    readonly contentSchema: Schema.optional<Schema.suspend<$Representation>>;
}>;
/**
 * Schema codec for {@link NumberMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $NumberMeta: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isInt">;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMultipleOf">;
    readonly divisor: Schema.Finite;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isFinite">;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThan">;
    readonly exclusiveMinimum: Schema.Finite;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThanOrEqualTo">;
    readonly minimum: Schema.Finite;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThan">;
    readonly exclusiveMaximum: Schema.Finite;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThanOrEqualTo">;
    readonly maximum: Schema.Finite;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isBetween">;
    readonly minimum: Schema.Finite;
    readonly maximum: Schema.Finite;
    readonly exclusiveMinimum: Schema.optional<Schema.Boolean>;
    readonly exclusiveMaximum: Schema.optional<Schema.Boolean>;
}>]>;
/**
 * Schema codec for the {@link Number} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Number: Schema.Struct<{
    readonly _tag: Schema.tag<"Number">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isInt";
    } | {
        readonly _tag: "isMultipleOf";
        readonly divisor: number;
    } | {
        readonly _tag: "isFinite";
    } | {
        readonly _tag: "isGreaterThan";
        readonly exclusiveMinimum: number;
    } | {
        readonly _tag: "isGreaterThanOrEqualTo";
        readonly minimum: number;
    } | {
        readonly _tag: "isLessThan";
        readonly exclusiveMaximum: number;
    } | {
        readonly _tag: "isLessThanOrEqualTo";
        readonly maximum: number;
    } | {
        readonly _tag: "isBetween";
        readonly minimum: number;
        readonly maximum: number;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    }>, Check<{
        readonly _tag: "isInt";
    } | {
        readonly _tag: "isMultipleOf";
        readonly divisor: number;
    } | {
        readonly _tag: "isFinite";
    } | {
        readonly _tag: "isGreaterThan";
        readonly exclusiveMinimum: number;
    } | {
        readonly _tag: "isGreaterThanOrEqualTo";
        readonly minimum: number;
    } | {
        readonly _tag: "isLessThan";
        readonly exclusiveMaximum: number;
    } | {
        readonly _tag: "isLessThanOrEqualTo";
        readonly maximum: number;
    } | {
        readonly _tag: "isBetween";
        readonly minimum: number;
        readonly maximum: number;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    }>, never, never>>;
}>;
/**
 * Schema codec for the {@link Boolean} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Boolean: Schema.Struct<{
    readonly _tag: Schema.tag<"Boolean">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link BigInt} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $BigInt: Schema.Struct<{
    readonly _tag: Schema.tag<"BigInt">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isGreaterThanBigInt";
        readonly exclusiveMinimum: bigint;
    } | {
        readonly _tag: "isGreaterThanOrEqualToBigInt";
        readonly minimum: bigint;
    } | {
        readonly _tag: "isLessThanBigInt";
        readonly exclusiveMaximum: bigint;
    } | {
        readonly _tag: "isLessThanOrEqualToBigInt";
        readonly maximum: bigint;
    } | {
        readonly _tag: "isBetweenBigInt";
        readonly minimum: bigint;
        readonly maximum: bigint;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    }>, Check<{
        readonly _tag: "isGreaterThanBigInt";
        readonly exclusiveMinimum: bigint;
    } | {
        readonly _tag: "isGreaterThanOrEqualToBigInt";
        readonly minimum: bigint;
    } | {
        readonly _tag: "isLessThanBigInt";
        readonly exclusiveMaximum: bigint;
    } | {
        readonly _tag: "isLessThanOrEqualToBigInt";
        readonly maximum: bigint;
    } | {
        readonly _tag: "isBetweenBigInt";
        readonly minimum: bigint;
        readonly maximum: bigint;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    }>, never, never>>;
}>;
/**
 * Schema codec for the {@link Symbol} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Symbol: Schema.Struct<{
    readonly _tag: Schema.tag<"Symbol">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the literal value types allowed in a {@link Literal} node
 * (string, finite number, boolean, or bigint).
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $LiteralValue: Schema.Union<readonly [Schema.String, Schema.Finite, Schema.Boolean, Schema.BigInt]>;
/**
 * Schema codec for the {@link Literal} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Literal: Schema.Struct<{
    readonly _tag: Schema.tag<"Literal">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly literal: Schema.Union<readonly [Schema.String, Schema.Finite, Schema.Boolean, Schema.BigInt]>;
}>;
/**
 * Schema codec for the {@link UniqueSymbol} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $UniqueSymbol: Schema.Struct<{
    readonly _tag: Schema.tag<"UniqueSymbol">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly symbol: Schema.Symbol;
}>;
/**
 * Schema codec for the {@link ObjectKeyword} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $ObjectKeyword: Schema.Struct<{
    readonly _tag: Schema.tag<"ObjectKeyword">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Enum} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Enum: Schema.Struct<{
    readonly _tag: Schema.tag<"Enum">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly enums: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.Union<readonly [Schema.String, Schema.Number]>]>>;
}>;
/**
 * Schema codec for the {@link TemplateLiteral} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $TemplateLiteral: Schema.Struct<{
    readonly _tag: Schema.tag<"TemplateLiteral">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly parts: Schema.$Array<Schema.suspend<$Representation>>;
}>;
/**
 * Schema codec for the {@link Element} type (positional tuple element).
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Element: Schema.Struct<{
    readonly isOptional: Schema.Boolean;
    readonly type: Schema.suspend<$Representation>;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
}>;
/**
 * Schema codec for the {@link Arrays} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Arrays: Schema.Struct<{
    readonly _tag: Schema.tag<"Arrays">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly elements: Schema.$Array<Schema.Struct<{
        readonly isOptional: Schema.Boolean;
        readonly type: Schema.suspend<$Representation>;
        readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    }>>;
    readonly rest: Schema.$Array<Schema.suspend<$Representation>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isMinLength";
        readonly minLength: number;
    } | {
        readonly _tag: "isMaxLength";
        readonly maxLength: number;
    } | {
        readonly _tag: "isLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isUnique";
    }>, Check<{
        readonly _tag: "isMinLength";
        readonly minLength: number;
    } | {
        readonly _tag: "isMaxLength";
        readonly maxLength: number;
    } | {
        readonly _tag: "isLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isUnique";
    }>, never, never>>;
}>;
/**
 * Schema codec for the {@link PropertySignature} type.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $PropertySignature: Schema.Struct<{
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly name: Schema.Union<readonly [Schema.Finite, Schema.Symbol, Schema.String]>;
    readonly type: Schema.suspend<$Representation>;
    readonly isOptional: Schema.Boolean;
    readonly isMutable: Schema.Boolean;
}>;
/**
 * Schema codec for the {@link IndexSignature} type.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $IndexSignature: Schema.Struct<{
    readonly parameter: Schema.suspend<$Representation>;
    readonly type: Schema.suspend<$Representation>;
}>;
/**
 * Schema codec for {@link ObjectsMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $ObjectsMeta: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isMinProperties">;
    readonly minProperties: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMaxProperties">;
    readonly maxProperties: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isPropertiesLengthBetween">;
    readonly minimum: Schema.Int;
    readonly maximum: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isPropertyNames">;
    readonly propertyNames: Schema.suspend<$Representation>;
}>]>;
/**
 * Schema codec for the {@link Objects} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Objects: Schema.Struct<{
    readonly _tag: Schema.tag<"Objects">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly propertySignatures: Schema.$Array<Schema.Struct<{
        readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
        readonly name: Schema.Union<readonly [Schema.Finite, Schema.Symbol, Schema.String]>;
        readonly type: Schema.suspend<$Representation>;
        readonly isOptional: Schema.Boolean;
        readonly isMutable: Schema.Boolean;
    }>>;
    readonly indexSignatures: Schema.$Array<Schema.Struct<{
        readonly parameter: Schema.suspend<$Representation>;
        readonly type: Schema.suspend<$Representation>;
    }>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isMinProperties";
        readonly minProperties: number;
    } | {
        readonly _tag: "isMaxProperties";
        readonly maxProperties: number;
    } | {
        readonly _tag: "isPropertiesLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isPropertyNames";
        readonly propertyNames: Representation;
    }>, Check<{
        readonly _tag: "isMinProperties";
        readonly minProperties: number;
    } | {
        readonly _tag: "isMaxProperties";
        readonly maxProperties: number;
    } | {
        readonly _tag: "isPropertiesLengthBetween";
        readonly minimum: number;
        readonly maximum: number;
    } | {
        readonly _tag: "isPropertyNames";
        readonly propertyNames: Representation;
    }>, never, never>>;
}>;
/**
 * Schema codec for the {@link Union} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Union: Schema.Struct<{
    readonly _tag: Schema.tag<"Union">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly types: Schema.$Array<Schema.suspend<$Representation>>;
    readonly mode: Schema.Literals<readonly ["anyOf", "oneOf"]>;
}>;
/**
 * Schema codec for the {@link Reference} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Reference: Schema.Struct<{
    readonly _tag: Schema.tag<"Reference">;
    readonly $ref: Schema.String;
}>;
/**
 * Schema codec for {@link DateMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $DateMeta: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isDateValid">;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThanDate">;
    readonly exclusiveMinimum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThanOrEqualToDate">;
    readonly minimum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThanDate">;
    readonly exclusiveMaximum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThanOrEqualToDate">;
    readonly maximum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isBetweenDate">;
    readonly minimum: Schema.Date;
    readonly maximum: Schema.Date;
    readonly exclusiveMinimum: Schema.optional<Schema.Boolean>;
    readonly exclusiveMaximum: Schema.optional<Schema.Boolean>;
}>]>;
/**
 * Schema codec for {@link SizeMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $SizeMeta: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isMinSize">;
    readonly minSize: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMaxSize">;
    readonly maxSize: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isSizeBetween">;
    readonly minimum: Schema.Int;
    readonly maximum: Schema.Int;
}>]>;
/**
 * Schema codec for {@link DeclarationMeta}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $DeclarationMeta: Schema.Union<readonly [Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isDateValid">;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThanDate">;
    readonly exclusiveMinimum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isGreaterThanOrEqualToDate">;
    readonly minimum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThanDate">;
    readonly exclusiveMaximum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isLessThanOrEqualToDate">;
    readonly maximum: Schema.Date;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isBetweenDate">;
    readonly minimum: Schema.Date;
    readonly maximum: Schema.Date;
    readonly exclusiveMinimum: Schema.optional<Schema.Boolean>;
    readonly exclusiveMaximum: Schema.optional<Schema.Boolean>;
}>]>, Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"isMinSize">;
    readonly minSize: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isMaxSize">;
    readonly maxSize: Schema.Int;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"isSizeBetween">;
    readonly minimum: Schema.Int;
    readonly maximum: Schema.Int;
}>]>]>;
/**
 * Schema codec for the {@link Declaration} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Declaration: Schema.Struct<{
    readonly _tag: Schema.tag<"Declaration">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly typeParameters: Schema.$Array<Schema.suspend<$Representation>>;
    readonly checks: Schema.$Array<Schema.Codec<Check<{
        readonly _tag: "isDateValid";
    } | {
        readonly _tag: "isGreaterThanDate";
        readonly exclusiveMinimum: Date;
    } | {
        readonly _tag: "isGreaterThanOrEqualToDate";
        readonly minimum: Date;
    } | {
        readonly _tag: "isLessThanDate";
        readonly exclusiveMaximum: Date;
    } | {
        readonly _tag: "isLessThanOrEqualToDate";
        readonly maximum: Date;
    } | {
        readonly _tag: "isBetweenDate";
        readonly minimum: Date;
        readonly maximum: Date;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    } | {
        readonly _tag: "isMinSize";
        readonly minSize: number;
    } | {
        readonly _tag: "isMaxSize";
        readonly maxSize: number;
    } | {
        readonly _tag: "isSizeBetween";
        readonly minimum: number;
        readonly maximum: number;
    }>, Check<{
        readonly _tag: "isDateValid";
    } | {
        readonly _tag: "isGreaterThanDate";
        readonly exclusiveMinimum: Date;
    } | {
        readonly _tag: "isGreaterThanOrEqualToDate";
        readonly minimum: Date;
    } | {
        readonly _tag: "isLessThanDate";
        readonly exclusiveMaximum: Date;
    } | {
        readonly _tag: "isLessThanOrEqualToDate";
        readonly maximum: Date;
    } | {
        readonly _tag: "isBetweenDate";
        readonly minimum: Date;
        readonly maximum: Date;
        readonly exclusiveMinimum?: boolean | undefined;
        readonly exclusiveMaximum?: boolean | undefined;
    } | {
        readonly _tag: "isMinSize";
        readonly minSize: number;
    } | {
        readonly _tag: "isMaxSize";
        readonly maxSize: number;
    } | {
        readonly _tag: "isSizeBetween";
        readonly minimum: number;
        readonly maximum: number;
    }>, never, never>>;
    readonly encodedSchema: Schema.suspend<$Representation>;
}>;
/**
 * Schema codec for the {@link Suspend} representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Suspend: Schema.Struct<{
    readonly _tag: Schema.tag<"Suspend">;
    readonly annotations: Schema.optional<Schema.decodeTo<Schema.$Record<Schema.String, Schema.Unknown>, Schema.$Record<Schema.String, Schema.Codec<PrimitiveTree, PrimitiveTree, never, never>>, never, never>>;
    readonly checks: Schema.Tuple<readonly []>;
    readonly thunk: Schema.suspend<$Representation>;
}>;
/**
 * Type-level helper for the recursive {@link $Representation} codec.
 *
 * @since 4.0.0
 */
export interface $Representation extends Schema.Codec<Representation> {
}
/**
 * Schema codec for the full {@link Representation} union. This is the
 * recursive codec that can validate/encode any representation node.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Representation: $Representation;
/**
 * Schema codec for {@link Document}. Use with `Schema.decodeUnknownSync` or
 * `Schema.encodeSync` to validate or serialize document data.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $Document: Schema.Struct<{
    readonly representation: $Representation;
    readonly references: Schema.$Record<Schema.String, $Representation>;
}>;
/**
 * Schema codec for {@link MultiDocument}.
 *
 * @category Schema
 * @since 4.0.0
 */
export declare const $MultiDocument: Schema.Struct<{
    readonly representations: Schema.NonEmptyArray<$Representation>;
    readonly references: Schema.$Record<Schema.String, $Representation>;
}>;
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
export declare const fromAST: (ast: AST.AST) => Document;
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
export declare const fromASTs: (asts: readonly [AST.AST, ...Array<AST.AST>]) => MultiDocument;
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
export declare const DocumentFromJson: Schema.Codec<Document, Schema.Json>;
/**
 * Schema codec that decodes a {@link MultiDocument} from JSON and encodes it
 * back.
 *
 * @see {@link $MultiDocument}
 * @see {@link DocumentFromJson}
 *
 * @since 4.0.0
 */
export declare const MultiDocumentFromJson: Schema.Codec<MultiDocument, Schema.Json>;
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
export declare function toMultiDocument(document: Document): MultiDocument;
/**
 * A callback that handles {@link Declaration} nodes during reconstruction
 * ({@link toSchema}) or code generation ({@link toCodeDocument}).
 *
 * - Return a value to handle the declaration.
 * - Return `undefined` to fall back to default behavior (use `encodedSchema`
 *   for `toSchema`, or `generation` annotation for `toCodeDocument`).
 * - `recur` processes child representations recursively.
 *
 * @see {@link toSchema}
 * @see {@link toSchemaDefaultReviver}
 * @see {@link toCodeDocument}
 *
 * @since 4.0.0
 */
export type Reviver<T> = (declaration: Declaration, recur: (representation: Representation) => T) => T | undefined;
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
export declare const toSchemaDefaultReviver: Reviver<Schema.Top>;
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
export declare function toSchema<S extends Schema.Top = Schema.Top>(document: Document, options?: {
    readonly reviver?: Reviver<Schema.Top> | undefined;
}): S;
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
export declare const toJsonSchemaDocument: (document: Document, options?: Schema.ToJsonSchemaOptions) => JsonSchema.Document<"draft-2020-12">;
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
export declare const toJsonSchemaMultiDocument: (document: MultiDocument, options?: Schema.ToJsonSchemaOptions) => JsonSchema.MultiDocument<"draft-2020-12">;
/**
 * A pair of TypeScript source strings for a schema: `runtime` is the
 * executable Schema expression, `Type` is the corresponding TypeScript type.
 *
 * @see {@link makeCode}
 * @see {@link CodeDocument}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export type Code = {
    readonly runtime: string;
    readonly Type: string;
};
/**
 * Constructs a {@link Code} value from a runtime expression string and a
 * TypeScript type string.
 *
 * @see {@link Code}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export declare function makeCode(runtime: string, Type: string): Code;
/**
 * An auxiliary code artifact produced during code generation — a symbol
 * declaration, an enum declaration, or an import statement.
 *
 * @see {@link CodeDocument}
 * @see {@link toCodeDocument}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export type Artifact = {
    readonly _tag: "Symbol";
    readonly identifier: string;
    readonly generation: Code;
} | {
    readonly _tag: "Enum";
    readonly identifier: string;
    readonly generation: Code;
} | {
    readonly _tag: "Import";
    readonly importDeclaration: string;
};
/**
 * The output of {@link toCodeDocument}: generated TypeScript code for one or
 * more schemas plus their shared references and auxiliary artifacts.
 *
 * - `codes` — one {@link Code} per input representation.
 * - `references.nonRecursives` — topologically sorted non-recursive definitions.
 * - `references.recursives` — definitions involved in cycles.
 * - `artifacts` — symbols, enums, and import statements needed by the code.
 *
 * @see {@link toCodeDocument}
 * @see {@link Code}
 * @see {@link Artifact}
 *
 * @category Code Generation
 * @since 4.0.0
 */
export type CodeDocument = {
    readonly codes: ReadonlyArray<Code>;
    readonly references: {
        readonly nonRecursives: ReadonlyArray<{
            readonly $ref: string;
            readonly code: Code;
        }>;
        readonly recursives: {
            readonly [$ref: string]: Code;
        };
    };
    readonly artifacts: ReadonlyArray<Artifact>;
};
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
export declare function toCodeDocument(multiDocument: MultiDocument, options?: {
    /**
     * The reviver can return `undefined` to indicate that the generation should be generated by the default logic
     */
    readonly reviver?: Reviver<Code> | undefined;
}): CodeDocument;
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
export declare function fromJsonSchemaDocument(document: JsonSchema.Document<"draft-2020-12">, options?: {
    readonly onEnter?: ((js: JsonSchema.JsonSchema) => JsonSchema.JsonSchema) | undefined;
}): Document;
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
export declare function fromJsonSchemaMultiDocument(document: JsonSchema.MultiDocument<"draft-2020-12">, options?: {
    readonly onEnter?: ((js: JsonSchema.JsonSchema) => JsonSchema.JsonSchema) | undefined;
}): MultiDocument;
//# sourceMappingURL=SchemaRepresentation.d.ts.map