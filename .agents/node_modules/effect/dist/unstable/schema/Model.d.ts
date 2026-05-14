import type { Brand } from "../../Brand.ts";
import * as DateTime from "../../DateTime.ts";
import * as Schema from "../../Schema.ts";
import * as VariantSchema from "./VariantSchema.ts";
declare const Class: <Self = never>(identifier: string) => <const Fields extends VariantSchema.Struct.Fields>(fields: Fields & VariantSchema.Struct.Validate<Fields, "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">, annotations?: Schema.Annotations.Declaration<Self, readonly [Schema.Struct<VariantSchema.ExtractFields<"select", Fields, true>>]> | undefined) => [Self] extends [never] ? "Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`" : VariantSchema.Class<Self, Fields, Schema.Struct<VariantSchema.ExtractFields<"select", Fields, true>>> & {
    readonly json: Schema.Struct<VariantSchema.ExtractFields<"json", Fields, false> extends infer T ? { [K in keyof T]: T[K]; } : never>;
    readonly insert: Schema.Struct<VariantSchema.ExtractFields<"insert", Fields, false> extends infer T_1 ? { [K_1 in keyof T_1]: T_1[K_1]; } : never>;
    readonly update: Schema.Struct<VariantSchema.ExtractFields<"update", Fields, false> extends infer T_2 ? { [K_2 in keyof T_2]: T_2[K_2]; } : never>;
    readonly select: Schema.Struct<VariantSchema.ExtractFields<"select", Fields, false> extends infer T_3 ? { [K_3 in keyof T_3]: T_3[K_3]; } : never>;
    readonly jsonCreate: Schema.Struct<VariantSchema.ExtractFields<"jsonCreate", Fields, false> extends infer T_4 ? { [K_4 in keyof T_4]: T_4[K_4]; } : never>;
    readonly jsonUpdate: Schema.Struct<VariantSchema.ExtractFields<"jsonUpdate", Fields, false> extends infer T_5 ? { [K_5 in keyof T_5]: T_5[K_5]; } : never>;
}, Field: <const A extends VariantSchema.Field.ConfigWithKeys<"json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">>(config: A & { readonly [K in Exclude<keyof A, "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">]: never; }) => VariantSchema.Field<A>, FieldExcept: <const Keys extends readonly ("json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate")[]>(keys: Keys) => <S extends Schema.Top>(schema: S) => VariantSchema.Field<{ readonly [K in Exclude<"json", Keys[number]> | Exclude<"insert", Keys[number]> | Exclude<"update", Keys[number]> | Exclude<"select", Keys[number]> | Exclude<"jsonCreate", Keys[number]> | Exclude<"jsonUpdate", Keys[number]>]: S; }>, FieldOnly: <const Keys extends readonly ("json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate")[]>(keys: Keys) => <S extends Schema.Top>(schema: S) => VariantSchema.Field<{ readonly [K in Keys[number]]: S; }>, Struct: <const A extends VariantSchema.Struct.Fields>(fields: A & VariantSchema.Struct.Validate<A, "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">) => VariantSchema.Struct<A>, Union: <const Members extends ReadonlyArray<VariantSchema.Struct<any>>>(members: Members) => VariantSchema.Union<Members> & VariantSchema.Union.Variants<Members, "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">, extract: {
    <V extends "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate">(variant: V): <A extends VariantSchema.Struct<any>>(self: A) => VariantSchema.Extract<V, A, V extends "select" ? true : false>;
    <V extends "json" | "insert" | "update" | "select" | "jsonCreate" | "jsonUpdate", A extends VariantSchema.Struct<any>>(self: A, variant: V): VariantSchema.Extract<V, A, V extends "select" ? true : false>;
}, fieldEvolve: {
    <Self extends VariantSchema.Field<any> | Schema.Top, const Mapping extends Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]?: (variant: S[K]) => Schema.Top; } : {
        readonly json?: (variant: Self) => Schema.Top;
        readonly insert?: (variant: Self) => Schema.Top;
        readonly update?: (variant: Self) => Schema.Top;
        readonly select?: (variant: Self) => Schema.Top;
        readonly jsonCreate?: (variant: Self) => Schema.Top;
        readonly jsonUpdate?: (variant: Self) => Schema.Top;
    }>(f: Mapping): (self: Self) => VariantSchema.Field<Self extends VariantSchema.Field<infer S_1 extends VariantSchema.Field.Config> ? { readonly [K_1 in keyof S_1]: K_1 extends keyof Mapping ? Mapping[K_1] extends (arg: any) => any ? ReturnType<Mapping[K_1]> : S_1[K_1] : S_1[K_1]; } : {
        readonly json: "json" extends infer T ? T extends "json" ? T extends keyof Mapping ? Mapping[T] extends (arg: any) => any ? ReturnType<Mapping[T]> : Self : Self : never : never;
        readonly insert: "insert" extends infer T_1 ? T_1 extends "insert" ? T_1 extends keyof Mapping ? Mapping[T_1] extends (arg: any) => any ? ReturnType<Mapping[T_1]> : Self : Self : never : never;
        readonly update: "update" extends infer T_2 ? T_2 extends "update" ? T_2 extends keyof Mapping ? Mapping[T_2] extends (arg: any) => any ? ReturnType<Mapping[T_2]> : Self : Self : never : never;
        readonly select: "select" extends infer T_3 ? T_3 extends "select" ? T_3 extends keyof Mapping ? Mapping[T_3] extends (arg: any) => any ? ReturnType<Mapping[T_3]> : Self : Self : never : never;
        readonly jsonCreate: "jsonCreate" extends infer T_4 ? T_4 extends "jsonCreate" ? T_4 extends keyof Mapping ? Mapping[T_4] extends (arg: any) => any ? ReturnType<Mapping[T_4]> : Self : Self : never : never;
        readonly jsonUpdate: "jsonUpdate" extends infer T_5 ? T_5 extends "jsonUpdate" ? T_5 extends keyof Mapping ? Mapping[T_5] extends (arg: any) => any ? ReturnType<Mapping[T_5]> : Self : Self : never : never;
    }>;
    <Self extends VariantSchema.Field<any> | Schema.Top, const Mapping extends Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]?: (variant: S[K]) => Schema.Top; } : {
        readonly json?: (variant: Self) => Schema.Top;
        readonly insert?: (variant: Self) => Schema.Top;
        readonly update?: (variant: Self) => Schema.Top;
        readonly select?: (variant: Self) => Schema.Top;
        readonly jsonCreate?: (variant: Self) => Schema.Top;
        readonly jsonUpdate?: (variant: Self) => Schema.Top;
    }>(self: Self, f: Mapping): VariantSchema.Field<Self extends VariantSchema.Field<infer S_1 extends VariantSchema.Field.Config> ? { readonly [K_1 in keyof S_1]: K_1 extends keyof Mapping ? Mapping[K_1] extends (arg: any) => any ? ReturnType<Mapping[K_1]> : S_1[K_1] : S_1[K_1]; } : {
        readonly json: "json" extends infer T ? T extends "json" ? T extends keyof Mapping ? Mapping[T] extends (arg: any) => any ? ReturnType<Mapping[T]> : Self : Self : never : never;
        readonly insert: "insert" extends infer T_1 ? T_1 extends "insert" ? T_1 extends keyof Mapping ? Mapping[T_1] extends (arg: any) => any ? ReturnType<Mapping[T_1]> : Self : Self : never : never;
        readonly update: "update" extends infer T_2 ? T_2 extends "update" ? T_2 extends keyof Mapping ? Mapping[T_2] extends (arg: any) => any ? ReturnType<Mapping[T_2]> : Self : Self : never : never;
        readonly select: "select" extends infer T_3 ? T_3 extends "select" ? T_3 extends keyof Mapping ? Mapping[T_3] extends (arg: any) => any ? ReturnType<Mapping[T_3]> : Self : Self : never : never;
        readonly jsonCreate: "jsonCreate" extends infer T_4 ? T_4 extends "jsonCreate" ? T_4 extends keyof Mapping ? Mapping[T_4] extends (arg: any) => any ? ReturnType<Mapping[T_4]> : Self : Self : never : never;
        readonly jsonUpdate: "jsonUpdate" extends infer T_5 ? T_5 extends "jsonUpdate" ? T_5 extends keyof Mapping ? Mapping[T_5] extends (arg: any) => any ? ReturnType<Mapping[T_5]> : Self : Self : never : never;
    }>;
};
/**
 * @since 4.0.0
 * @category models
 */
export type Any = Schema.Top & {
    readonly fields: Schema.Struct.Fields;
    readonly insert: Schema.Top;
    readonly update: Schema.Top;
    readonly json: Schema.Top;
    readonly jsonCreate: Schema.Top;
    readonly jsonUpdate: Schema.Top;
};
/**
 * @since 4.0.0
 * @category models
 */
export type VariantsDatabase = "select" | "insert" | "update";
/**
 * @since 4.0.0
 * @category models
 */
export type VariantsJson = "json" | "jsonCreate" | "jsonUpdate";
export { 
/**
 * A base class used for creating domain model schemas.
 *
 * It supports common variants for database and JSON apis.
 *
 * @since 4.0.0
 * @category constructors
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Model } from "effect/unstable/schema"
 *
 * export const GroupId = Schema.Number.pipe(Schema.brand("GroupId"))
 *
 * export class Group extends Model.Class<Group>("Group")({
 *   id: Model.Generated(GroupId),
 *   name: Schema.String,
 *   createdAt: Model.DateTimeInsertFromDate,
 *   updatedAt: Model.DateTimeUpdateFromDate
 * }) {}
 *
 * // schema used for selects
 * Group
 *
 * // schema used for inserts
 * Group.insert
 *
 * // schema used for updates
 * Group.update
 *
 * // schema used for json api
 * Group.json
 * Group.jsonCreate
 * Group.jsonUpdate
 *
 * // you can also turn them into classes
 * class GroupJson extends Schema.Class<GroupJson>("GroupJson")(Group.json) {
 *   get upperName() {
 *     return this.name.toUpperCase()
 *   }
 * }
 * ```
 */
Class, 
/**
 * @since 4.0.0
 * @category extraction
 */
extract, 
/**
 * @since 4.0.0
 * @category fields
 */
Field, 
/**
 * @since 4.0.0
 * @category fields
 */
fieldEvolve, 
/**
 * @since 4.0.0
 * @category fields
 */
FieldExcept, 
/**
 * @since 4.0.0
 * @category fields
 */
FieldOnly, 
/**
 * @since 4.0.0
 * @category constructors
 */
Struct, 
/**
 * @since 4.0.0
 * @category constructors
 */
Union };
/**
 * @since 4.0.0
 * @category fields
 */
export declare const fields: <A extends VariantSchema.Struct<any>>(self: A) => A[typeof VariantSchema.TypeId];
/**
 * @since 4.0.0
 * @category overrideable
 */
export declare const Override: <A>(value: A) => A & Brand<"Override">;
/**
 * @since 4.0.0
 * @category generated
 */
export interface Generated<S extends Schema.Top> extends VariantSchema.Field<{
    readonly select: S;
    readonly update: S;
    readonly json: S;
}> {
}
/**
 * A field that represents a column that is generated by the database.
 *
 * It is available for selection and update, but not for insertion.
 *
 * @since 4.0.0
 * @category generated
 */
export declare const Generated: <S extends Schema.Top>(schema: S) => Generated<S>;
/**
 * @since 4.0.0
 * @category generated
 */
export interface GeneratedByApp<S extends Schema.Top> extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: S;
    readonly json: S;
}> {
}
/**
 * A field that represents a column that is generated by the application.
 *
 * It is required by the database, but not by the JSON variants.
 *
 * @since 4.0.0
 * @category generated
 */
export declare const GeneratedByApp: <S extends Schema.Top>(schema: S) => GeneratedByApp<S>;
/**
 * @since 4.0.0
 * @category sensitive
 */
export interface Sensitive<S extends Schema.Top> extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: S;
}> {
}
/**
 * A field that represents a sensitive value that should not be exposed in the
 * JSON variants.
 *
 * @since 4.0.0
 * @category sensitive
 */
export declare const Sensitive: <S extends Schema.Top>(schema: S) => Sensitive<S>;
/**
 * @since 4.0.0
 * @category optional
 */
export interface optionalOption<S extends Schema.Top> extends Schema.decodeTo<Schema.Option<Schema.toType<S>>, Schema.optionalKey<Schema.NullOr<S>>> {
}
/**
 * @since 4.0.0
 * @category optional
 */
export declare const optionalOption: <S extends Schema.Top>(schema: S) => optionalOption<S>;
/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @since 4.0.0
 * @category optional
 */
export interface FieldOption<S extends Schema.Top> extends VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>;
    readonly insert: Schema.OptionFromNullOr<S>;
    readonly update: Schema.OptionFromNullOr<S>;
    readonly json: optionalOption<S>;
    readonly jsonCreate: optionalOption<S>;
    readonly jsonUpdate: optionalOption<S>;
}> {
}
/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @since 4.0.0
 * @category optional
 */
export declare const FieldOption: <Field extends VariantSchema.Field<any> | Schema.Top>(self: Field) => Field extends Schema.Top ? FieldOption<Field> : Field extends VariantSchema.Field<infer S> ? VariantSchema.Field<{
    readonly [K in keyof S]: S[K] extends Schema.Top ? K extends VariantsDatabase ? Schema.OptionFromNullOr<S[K]> : optionalOption<S[K]> : never;
}> : never;
/**
 * @since 4.0.0
 * @category booleans
 */
export interface BooleanSqlite extends VariantSchema.Field<{
    readonly select: Schema.BooleanFromBit;
    readonly insert: Schema.BooleanFromBit;
    readonly update: Schema.BooleanFromBit;
    readonly json: Schema.Boolean;
    readonly jsonCreate: Schema.Boolean;
    readonly jsonUpdate: Schema.Boolean;
}> {
}
/**
 * A schema for sqlite booleans that are represented as `0 | 1` in database
 * variants and `boolean` in JSON variants.
 *
 * @since 4.0.0
 * @category booleans
 */
export declare const BooleanSqlite: BooleanSqlite;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface Date extends Schema.decodeTo<Schema.instanceOf<DateTime.Utc>, Schema.String> {
}
/**
 * A schema for a `DateTime.Utc` that is serialized as a date string in the
 * format `YYYY-MM-DD`.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const Date: Date;
/**
 * @since 4.0.0
 * @category date & time
 */
export declare const DateWithNow: VariantSchema.Overrideable<Date>;
/**
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeWithNow: VariantSchema.Overrideable<Schema.DateTimeUtcFromString>;
/**
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeFromDateWithNow: VariantSchema.Overrideable<Schema.DateTimeUtcFromDate>;
/**
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeFromNumberWithNow: VariantSchema.Overrideable<Schema.DateTimeUtcFromMillis>;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeInsert extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromString;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromString>;
    readonly json: Schema.DateTimeUtcFromString;
}> {
}
/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a string for the database.
 *
 * It is omitted from updates and is available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeInsert: DateTimeInsert;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeInsertFromDate extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromDate;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromDate>;
    readonly json: Schema.DateTimeUtcFromString;
}> {
}
/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a `Date` for the database.
 *
 * It is omitted from updates and is available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeInsertFromDate: DateTimeInsertFromDate;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeInsertFromNumber extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromMillis;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromMillis>;
    readonly json: Schema.DateTimeUtcFromMillis;
}> {
}
/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a `number`.
 *
 * It is omitted from updates and is available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeInsertFromNumber: DateTimeInsertFromNumber;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeUpdate extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromString;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromString>;
    readonly update: VariantSchema.Overrideable<Schema.DateTimeUtcFromString>;
    readonly json: Schema.DateTimeUtcFromString;
}> {
}
/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a string for the database.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeUpdate: DateTimeUpdate;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeUpdateFromDate extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromDate;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromDate>;
    readonly update: VariantSchema.Overrideable<Schema.DateTimeUtcFromDate>;
    readonly json: Schema.DateTimeUtcFromString;
}> {
}
/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a `Date` for the database.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeUpdateFromDate: DateTimeUpdateFromDate;
/**
 * @since 4.0.0
 * @category date & time
 */
export interface DateTimeUpdateFromNumber extends VariantSchema.Field<{
    readonly select: Schema.DateTimeUtcFromMillis;
    readonly insert: VariantSchema.Overrideable<Schema.DateTimeUtcFromMillis>;
    readonly update: VariantSchema.Overrideable<Schema.DateTimeUtcFromMillis>;
    readonly json: Schema.DateTimeUtcFromMillis;
}> {
}
/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a `number`.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @since 4.0.0
 * @category date & time
 */
export declare const DateTimeUpdateFromNumber: DateTimeUpdateFromNumber;
/**
 * @since 4.0.0
 * @category json
 */
export interface JsonFromString<S extends Schema.Top> extends VariantSchema.Field<{
    readonly select: Schema.fromJsonString<S>;
    readonly insert: Schema.fromJsonString<S>;
    readonly update: Schema.fromJsonString<S>;
    readonly json: S;
    readonly jsonCreate: S;
    readonly jsonUpdate: S;
}> {
}
/**
 * A field that represents a JSON value stored as text in the database.
 *
 * The "json" variants will use the object schema directly.
 *
 * @since 4.0.0
 * @category json
 */
export declare const JsonFromString: <S extends Schema.Top>(schema: S) => JsonFromString<S>;
/**
 * @since 4.0.0
 * @category uuid
 */
export interface UuidV4Insert<B extends string> extends VariantSchema.Field<{
    readonly select: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly insert: Schema.withConstructorDefault<Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>>;
    readonly update: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly json: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>;
}> {
}
/**
 * @since 4.0.0
 * @category Uint8Array
 */
export declare const Uint8Array: Schema.instanceOf<Uint8Array<ArrayBuffer>>;
/**
 * @since 4.0.0
 * @category uuid
 */
export declare const UuidV4WithGenerate: <B extends string>(schema: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>) => Schema.withConstructorDefault<Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>>;
/**
 * A field that represents a binary UUID v4 that is generated on inserts.
 *
 * @since 4.0.0
 * @category uuid
 */
export declare const UuidV4Insert: <const B extends string>(schema: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>>, B>) => UuidV4Insert<B>;
//# sourceMappingURL=Model.d.ts.map