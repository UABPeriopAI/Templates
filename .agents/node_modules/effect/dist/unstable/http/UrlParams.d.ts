/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Equ from "../../Equivalence.ts";
import type { Inspectable } from "../../Inspectable.ts";
import * as Option from "../../Option.ts";
import type { Pipeable } from "../../Pipeable.ts";
import type { ReadonlyRecord } from "../../Record.ts";
import * as Result from "../../Result.ts";
import * as Schema from "../../Schema.ts";
declare const TypeId = "~effect/http/UrlParams";
/**
 * @since 4.0.0
 * @category models
 */
export interface UrlParams extends Pipeable, Inspectable, Iterable<readonly [string, string]> {
    readonly [TypeId]: typeof TypeId;
    readonly params: ReadonlyArray<readonly [string, string]>;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isUrlParams: (u: unknown) => u is UrlParams;
/**
 * @since 4.0.0
 * @category models
 */
export type Input = CoercibleRecordInput | Iterable<readonly [string, Coercible]> | URLSearchParams;
type CoercibleRecordInput = CoercibleRecord & {
    readonly [Symbol.iterator]?: never;
};
/**
 * @since 4.0.0
 * @category models
 */
export type Coercible = string | number | bigint | boolean | null | undefined;
/**
 * @since 4.0.0
 * @category models
 */
type CoercibleRecordField<A> = A extends Coercible ? A : A extends ReadonlyArray<infer Item> ? ReadonlyArray<Item extends Coercible ? Item : never> : A extends object ? CoercibleRecord<A> : never;
/**
 * @since 4.0.0
 * @category models
 */
export type CoercibleRecord<A extends object = any> = {
    readonly [K in keyof A]: CoercibleRecordField<A[K]>;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (params: ReadonlyArray<readonly [string, string]>) => UrlParams;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromInput: (input: Input) => UrlParams;
/**
 * @since 4.0.0
 * @category Equivalence
 */
export declare const Equivalence: Equ.Equivalence<UrlParams>;
/**
 * @since 4.0.0
 * @category schemas
 */
export interface UrlParamsSchema extends Schema.declare<UrlParams, ReadonlyArray<readonly [string, string]>> {
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const UrlParamsSchema: UrlParamsSchema;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: UrlParams;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const getAll: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => ReadonlyArray<string>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): ReadonlyArray<string>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const getFirst: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => Option.Option<string>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): Option.Option<string>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const getLast: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => Option.Option<string>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): Option.Option<string>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const set: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: Coercible): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string, value: Coercible): UrlParams;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const transform: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (f: (params: UrlParams["params"]) => UrlParams["params"]): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, f: (params: UrlParams["params"]) => UrlParams["params"]): UrlParams;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setAll: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: Input): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, input: Input): UrlParams;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const append: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: Coercible): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string, value: Coercible): UrlParams;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const appendAll: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: Input): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, input: Input): UrlParams;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const remove: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: UrlParams) => UrlParams;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: UrlParams, key: string): UrlParams;
};
declare const UrlParamsError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "UrlParamsError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class UrlParamsError extends UrlParamsError_base<{
    cause: unknown;
}> {
}
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const makeUrl: (url: string, params: UrlParams, hash: string | undefined) => Result.Result<URL, UrlParamsError>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toString: (self: UrlParams) => string;
/**
 * Builds a `Record` containing all the key-value pairs in the given `UrlParams`
 * as `string` (if only one value for a key) or a `NonEmptyArray<string>`
 * (when more than one value for a key)
 *
 * **Example**
 *
 * ```ts
 * import { UrlParams } from "effect/unstable/http"
 * import * as assert from "node:assert"
 *
 * const urlParams = UrlParams.fromInput({
 *   a: 1,
 *   b: true,
 *   c: "string",
 *   e: [1, 2, 3]
 * })
 * const result = UrlParams.toRecord(urlParams)
 *
 * assert.deepStrictEqual(
 *   result,
 *   { "a": "1", "b": "true", "c": "string", "e": ["1", "2", "3"] }
 * )
 * ```
 *
 * @since 4.0.0
 * @category conversions
 */
export declare const toRecord: (self: UrlParams) => Record<string, string | Arr.NonEmptyArray<string>>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toReadonlyRecord: (self: UrlParams) => ReadonlyRecord<string, string | Arr.NonEmptyReadonlyArray<string>>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface schemaJsonField extends Schema.decodeTo<Schema.UnknownFromJsonString, UrlParamsSchema> {
}
/**
 * Extract a JSON value from the first occurrence of the given `field` in the
 * `UrlParams`.
 *
 * ```ts
 * import { Schema } from "effect"
 * import { UrlParams } from "effect/unstable/http"
 *
 * const extractFoo = UrlParams.schemaJsonField("foo").pipe(
 *   Schema.decodeTo(Schema.Struct({
 *     some: Schema.String,
 *     number: Schema.Number
 *   }))
 * )
 *
 * console.log(
 *   Schema.decodeSync(extractFoo)(UrlParams.fromInput({
 *     foo: JSON.stringify({ some: "bar", number: 42 }),
 *     baz: "qux"
 *   }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category Schemas
 */
export declare const schemaJsonField: (field: string) => schemaJsonField;
/**
 * Extract a record of key-value pairs from the `UrlParams`.
 *
 * @since 4.0.0
 * @category Schemas
 */
export interface schemaRecord extends Schema.decodeTo<Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.NonEmptyArray<Schema.String>]>>, UrlParamsSchema, never, never> {
}
/**
 * Extract schema from all key-value pairs in the given `UrlParams`.
 *
 * **Example**
 *
 * ```ts
 * import { Schema } from "effect"
 * import { UrlParams } from "effect/unstable/http"
 *
 * const toStruct = UrlParams.schemaRecord.pipe(
 *   Schema.decodeTo(Schema.Struct({
 *     some: Schema.String,
 *     number: Schema.FiniteFromString
 *   }))
 * )
 *
 * console.log(
 *   Schema.decodeSync(toStruct)(UrlParams.fromInput({
 *     some: "value",
 *     number: 42
 *   }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category schema
 */
export declare const schemaRecord: schemaRecord;
export {};
//# sourceMappingURL=UrlParams.d.ts.map