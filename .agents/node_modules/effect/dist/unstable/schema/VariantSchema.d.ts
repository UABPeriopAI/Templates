/**
 * @since 4.0.0
 */
import type { Brand } from "../../Brand.ts";
import * as Effect from "../../Effect.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Schema from "../../Schema.ts";
import type * as AST from "../../SchemaAST.ts";
import * as Struct_ from "../../Struct.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId = "~effect/schema/VariantSchema";
/**
 * @since 4.0.0
 * @category models
 */
export interface Struct<in out A extends Field.Fields> extends Pipeable {
    readonly [TypeId]: A;
}
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isStruct: (u: unknown) => u is Struct<any>;
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace Struct {
    /**
     * @since 4.0.0
     * @category models
     */
    type Any = {
        readonly [TypeId]: any;
    };
    /**
     * @since 4.0.0
     * @category models
     */
    type Fields = {
        readonly [key: string]: Schema.Top | Field<any> | Struct<any> | undefined;
    };
    /**
     * @since 4.0.0
     * @category models
     */
    type Validate<A, Variant extends string> = {
        readonly [K in keyof A]: A[K] extends {
            readonly [TypeId]: infer _;
        } ? Validate<A[K], Variant> : A[K] extends Field<infer Config> ? [keyof Config] extends [Variant] ? {} : "field must have valid variants" : {};
    };
}
declare const FieldTypeId = "~effect/schema/VariantSchema/Field";
/**
 * @since 4.0.0
 * @category models
 */
export interface Field<in out A extends Field.Config> extends Pipeable {
    readonly [FieldTypeId]: typeof FieldTypeId;
    readonly schemas: A;
}
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isField: (u: unknown) => u is Field<any>;
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace Field {
    /**
     * @since 4.0.0
     * @category models
     */
    type Any = {
        readonly [FieldTypeId]: typeof FieldTypeId;
    };
    /**
     * @since 4.0.0
     * @category models
     */
    type Config = {
        readonly [key: string]: Schema.Top | undefined;
    };
    /**
     * @since 4.0.0
     * @category models
     */
    type ConfigWithKeys<K extends string> = {
        readonly [P in K]?: Schema.Top;
    };
    /**
     * @since 4.0.0
     * @category models
     */
    type Fields = {
        readonly [key: string]: Schema.Top | Field<any> | Struct<any> | undefined;
    };
}
/**
 * @since 4.0.0
 * @category extractors
 */
export type ExtractFields<V extends string, Fields extends Struct.Fields, IsDefault = false> = {
    readonly [K in keyof Fields as [Fields[K]] extends [Field<infer Config>] ? V extends keyof Config ? K : never : K]: [Fields[K]] extends [Struct<infer _>] ? Extract<V, Fields[K], IsDefault> : [Fields[K]] extends [Field<infer Config>] ? [Config[V]] extends [Schema.Top] ? Config[V] : never : [Fields[K]] extends [Schema.Top] ? Fields[K] : never;
};
/**
 * @since 4.0.0
 * @category extractors
 */
export type Extract<V extends string, A extends Struct<any>, IsDefault = false> = [A] extends [
    Struct<infer Fields>
] ? IsDefault extends true ? [A] extends [Schema.Top] ? A : Schema.Struct<Struct_.Simplify<ExtractFields<V, Fields>>> : Schema.Struct<Struct_.Simplify<ExtractFields<V, Fields>>> : never;
/**
 * @category accessors
 * @since 4.0.0
 */
export declare const fields: <A extends Struct<any>>(self: A) => A[typeof TypeId];
/**
 * @since 4.0.0
 * @category models
 */
export interface Class<Self, Fields extends Struct.Fields, S extends Schema.Top & {
    readonly fields: Schema.Struct.Fields;
}> extends Schema.Bottom<Self, S["Encoded"], S["DecodingServices"], S["EncodingServices"], AST.Declaration, Schema.decodeTo<Schema.declareConstructor<Self, S["Encoded"], readonly [S], S["Iso"]>, S>, S["~type.make.in"], S["Iso"], readonly [S], Self, S["~type.mutability"], S["~type.optionality"], S["~type.constructor.default"], S["~encoded.mutability"], S["~encoded.optionality"]>, Struct<Struct_.Simplify<Fields>> {
    new (props: S["~type.make.in"], options?: {
        readonly disableChecks?: boolean;
    } | undefined): S["Type"];
    make<Args extends Array<any>, X>(this: {
        new (...args: Args): X;
    }, ...args: Args): X;
    readonly fields: S["fields"];
}
type MissingSelfGeneric<Params extends string = ""> = `Missing \`Self\` generic - use \`class Self extends Class<Self>()(${Params}{ ... })\``;
/**
 * @since 4.0.0
 * @category models
 */
export interface Union<Members extends ReadonlyArray<Struct<any>>> extends Schema.Union<{
    readonly [K in keyof Members]: [Members[K]] extends [Schema.Top] ? Members[K] : never;
}> {
}
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace Union {
    /**
     * @since 4.0.0
     * @category models
     */
    type Variants<Members extends ReadonlyArray<Struct<any>>, Variants extends string> = {
        readonly [Variant in Variants]: Schema.Union<{
            [K in keyof Members]: Extract<Variant, Members[K]>;
        }>;
    };
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <const Variants extends ReadonlyArray<string>, const Default extends Variants[number]>(options: {
    readonly variants: Variants;
    readonly defaultVariant: Default;
}) => {
    readonly Struct: <const A extends Struct.Fields>(fields: A & Struct.Validate<A, Variants[number]>) => Struct<A>;
    readonly Field: <const A extends Field.ConfigWithKeys<Variants[number]>>(config: A & { readonly [K in Exclude<keyof A, Variants[number]>]: never; }) => Field<A>;
    readonly FieldOnly: <const Keys extends ReadonlyArray<Variants[number]>>(keys: Keys) => <S extends Schema.Top>(schema: S) => Field<{ readonly [K in Keys[number]]: S; }>;
    readonly FieldExcept: <const Keys extends ReadonlyArray<Variants[number]>>(keys: Keys) => <S extends Schema.Top>(schema: S) => Field<{ readonly [K in Exclude<Variants[number], Keys[number]>]: S; }>;
    readonly fieldEvolve: {
        <Self extends Field<any> | Schema.Top, const Mapping extends (Self extends Field<infer S> ? { readonly [K in keyof S]?: (variant: S[K]) => Schema.Top; } : { readonly [K in Variants[number]]?: (variant: Self) => Schema.Top; })>(f: Mapping): (self: Self) => Field<Self extends Field<infer S> ? { readonly [K in keyof S]: K extends keyof Mapping ? Mapping[K] extends (arg: any) => any ? ReturnType<Mapping[K]> : S[K] : S[K]; } : { readonly [K in Variants[number]]: K extends keyof Mapping ? Mapping[K] extends (arg: any) => any ? ReturnType<Mapping[K]> : Self : Self; }>;
        <Self extends Field<any> | Schema.Top, const Mapping_1 extends (Self extends Field<infer S> ? { readonly [K in keyof S]?: (variant: S[K]) => Schema.Top; } : { readonly [K in Variants[number]]?: (variant: Self) => Schema.Top; })>(self: Self, f: Mapping_1): Field<Self extends Field<infer S> ? { readonly [K in keyof S]: K extends keyof Mapping_1 ? Mapping_1[K] extends (arg: any) => any ? ReturnType<Mapping_1[K]> : S[K] : S[K]; } : { readonly [K in Variants[number]]: K extends keyof Mapping_1 ? Mapping_1[K] extends (arg: any) => any ? ReturnType<Mapping_1[K]> : Self : Self; }>;
    };
    readonly Class: <Self = never>(identifier: string) => <const Fields extends Struct.Fields>(fields: Fields & Struct.Validate<Fields, Variants[number]>, annotations?: Schema.Annotations.Declaration<Self, readonly [Schema.Struct<ExtractFields<Default, Fields, true>>]> | undefined) => [Self] extends [never] ? MissingSelfGeneric : Class<Self, Fields, Schema.Struct<ExtractFields<Default, Fields, true>>> & { readonly [V in Variants[number]]: Extract<V, Struct<Fields>>; };
    readonly Union: <const Members extends ReadonlyArray<Struct<any>>>(members: Members) => Union<Members> & Union.Variants<Members, Variants[number]>;
    readonly extract: {
        <V extends Variants[number]>(variant: V): <A extends Struct<any>>(self: A) => Extract<V, A, V extends Default ? true : false>;
        <V extends Variants[number], A extends Struct<any>>(self: A, variant: V): Extract<V, A, V extends Default ? true : false>;
    };
};
/**
 * @since 4.0.0
 * @category overrideable
 */
export declare const Override: <A>(value: A) => A & Brand<"Override">;
/**
 * @since 4.0.0
 * @category overrideable
 */
export interface Overrideable<S extends Schema.Top & Schema.WithoutConstructorDefault> extends Schema.Bottom<S["Type"] & Brand<"Override">, S["Encoded"], S["DecodingServices"], S["EncodingServices"], S["ast"], Overrideable<S>, S["~type.make.in"], (S["Type"] & Brand<"Override">) | undefined, S["~type.parameters"], (S["Type"] & Brand<"Override">) | undefined, S["~type.mutability"], "required", "with-default", S["~encoded.mutability"], S["~encoded.optionality"]> {
}
/**
 * @since 4.0.0
 * @category overrideable
 */
export declare const Overrideable: <S extends Schema.Top & Schema.WithoutConstructorDefault>(schema: S, options: {
    readonly defaultValue: Effect.Effect<S["~type.make.in"]>;
}) => Overrideable<S>;
export {};
//# sourceMappingURL=VariantSchema.d.ts.map