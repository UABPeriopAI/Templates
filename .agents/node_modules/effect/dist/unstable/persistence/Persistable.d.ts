/**
 * @since 4.0.0
 */
import type * as Duration from "../../Duration.ts";
import type * as Effect from "../../Effect.ts";
import type * as Exit from "../../Exit.ts";
import * as PrimaryKey from "../../PrimaryKey.ts";
import * as Request from "../../Request.ts";
import * as Schema from "../../Schema.ts";
import type * as Types from "../../Types.ts";
import type { PersistenceError } from "./Persistence.ts";
/**
 * @since 4.0.0
 * @category Symbols
 */
export declare const symbol: "~effect/persistence/Persistable";
/**
 * @since 4.0.0
 * @category Models
 */
export interface Persistable<A extends Schema.Top, E extends Schema.Top> extends PrimaryKey.PrimaryKey {
    readonly [symbol]: {
        readonly success: A;
        readonly error: E;
    };
}
/**
 * @since 4.0.0
 * @category Models
 */
export type Any = Persistable<Schema.Top, Schema.Top>;
/**
 * @since 4.0.0
 * @category Models
 */
export type SuccessSchema<A extends Any> = A["~effect/persistence/Persistable"]["success"];
/**
 * @since 4.0.0
 * @category Models
 */
export type Success<A extends Any> = A["~effect/persistence/Persistable"]["success"]["Type"];
/**
 * @since 4.0.0
 * @category Models
 */
export type ErrorSchema<A extends Any> = A["~effect/persistence/Persistable"]["error"];
/**
 * @since 4.0.0
 * @category Models
 */
export type Error<A extends Any> = A["~effect/persistence/Persistable"]["error"]["Type"];
/**
 * @since 4.0.0
 * @category Models
 */
export type DecodingServices<A extends Any> = A["~effect/persistence/Persistable"]["success"]["DecodingServices"] | A["~effect/persistence/Persistable"]["error"]["DecodingServices"];
/**
 * @since 4.0.0
 * @category Models
 */
export type EncodingServices<A extends Any> = A["~effect/persistence/Persistable"]["success"]["EncodingServices"] | A["~effect/persistence/Persistable"]["error"]["EncodingServices"];
/**
 * @since 4.0.0
 * @category Models
 */
export type Services<A extends Any> = A["~effect/persistence/Persistable"]["success"]["DecodingServices"] | A["~effect/persistence/Persistable"]["success"]["EncodingServices"] | A["~effect/persistence/Persistable"]["error"]["DecodingServices"] | A["~effect/persistence/Persistable"]["error"]["EncodingServices"];
/**
 * @since 4.0.0
 * @category Models
 */
export type TimeToLiveFn<K extends Any> = (exit: Exit.Exit<Success<K>, Error<K>>, request: K) => Duration.Input;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const Class: <Config extends {
    payload: Record<string, unknown>;
    requires?: any;
    requestError?: any;
} = {
    payload: {};
}>() => <const Tag extends string, A extends Schema.Top = Schema.Void, E extends Schema.Top = Schema.Never>(tag: Tag, options: {
    readonly primaryKey: (payload: Config["payload"]) => string;
    readonly success?: A | undefined;
    readonly error?: E | undefined;
}) => new (args: Types.EqualsWith<Config["payload"], {}, void, { readonly [P in keyof Config["payload"] as P extends "_tag" ? never : P]: Config["payload"][P]; }>) => {
    readonly _tag: Tag;
} & { readonly [K in keyof Config["payload"]]: Config["payload"][K]; } & Persistable<A, E> & Request.Request<A["Type"], E["Type"] | ("requestError" extends keyof Config ? Config["requestError"] : (PersistenceError | Schema.SchemaError)), A["DecodingServices"] | A["EncodingServices"] | E["DecodingServices"] | E["EncodingServices"] | ("requires" extends keyof Config ? Config["requires"] : never)>;
/**
 * @since 4.0.0
 * @category Accessors
 */
export declare const exitSchema: <A extends Schema.Top, E extends Schema.Top>(self: Persistable<A, E>) => Schema.Exit<A, E, Schema.Defect>;
/**
 * @since 4.0.0
 * @category Serialization
 */
export declare const serializeExit: <A extends Schema.Top, E extends Schema.Top>(self: Persistable<A, E>, exit: Exit.Exit<A["Type"], E["Type"]>) => Effect.Effect<unknown, Schema.SchemaError, A["EncodingServices"] | E["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category Serialization
 */
export declare const deserializeExit: <A extends Schema.Top, E extends Schema.Top>(self: Persistable<A, E>, encoded: unknown) => Effect.Effect<Exit.Exit<A["Type"], E["Type"]>, Schema.SchemaError, A["DecodingServices"] | E["DecodingServices"]>;
//# sourceMappingURL=Persistable.d.ts.map