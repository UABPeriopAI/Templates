/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Clock from "../../Clock.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Exit from "../../Exit.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import * as KeyValueStore from "./KeyValueStore.ts";
import * as Persistable from "./Persistable.ts";
import * as Redis from "./Redis.ts";
declare const ErrorTypeId: "~effect/persistence/Persistence/PersistenceError";
declare const PersistenceError_base: Schema.Class<PersistenceError, Schema.Struct<{
    readonly _tag: Schema.tag<"PersistenceError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class PersistenceError extends PersistenceError_base {
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: typeof ErrorTypeId;
}
declare const Persistence_base: Context.ServiceClass<Persistence, "effect/persistence/Persistence", {
    readonly make: (options: {
        readonly storeId: string;
        readonly timeToLive?: (exit: Exit.Exit<unknown, unknown>, key: Persistable.Any) => Duration.Input;
    }) => Effect.Effect<PersistenceStore, never, Scope.Scope>;
}>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class Persistence extends Persistence_base {
}
/**
 * @since 4.0.0
 * @category models
 */
export interface PersistenceStore {
    readonly get: <A extends Schema.Top, E extends Schema.Top>(key: Persistable.Persistable<A, E>) => Effect.Effect<Exit.Exit<A["Type"], E["Type"]> | undefined, PersistenceError | Schema.SchemaError, A["DecodingServices"] | E["DecodingServices"]>;
    readonly getMany: <A extends Schema.Top, E extends Schema.Top>(keys: Iterable<Persistable.Persistable<A, E>>) => Effect.Effect<Array<Exit.Exit<A["Type"], E["Type"]> | undefined>, PersistenceError | Schema.SchemaError, A["DecodingServices"] | E["DecodingServices"]>;
    readonly set: <A extends Schema.Top, E extends Schema.Top>(key: Persistable.Persistable<A, E>, value: Exit.Exit<A["Type"], E["Type"]>) => Effect.Effect<void, PersistenceError | Schema.SchemaError, A["EncodingServices"] | E["EncodingServices"]>;
    readonly setMany: <A extends Schema.Top, E extends Schema.Top>(entries: Iterable<readonly [Persistable.Persistable<A, E>, Exit.Exit<A["Type"], E["Type"]>]>) => Effect.Effect<void, PersistenceError | Schema.SchemaError, A["EncodingServices"] | E["EncodingServices"]>;
    readonly remove: <A extends Schema.Top, E extends Schema.Top>(key: Persistable.Persistable<A, E>) => Effect.Effect<void, PersistenceError>;
    readonly clear: Effect.Effect<void, PersistenceError>;
}
declare const BackingPersistence_base: Context.ServiceClass<BackingPersistence, "effect/persistence/BackingPersistence", {
    readonly make: (storeId: string) => Effect.Effect<BackingPersistenceStore, never, Scope.Scope>;
}>;
/**
 * @since 4.0.0
 * @category BackingPersistence
 */
export declare class BackingPersistence extends BackingPersistence_base {
}
/**
 * @since 4.0.0
 * @category BackingPersistence
 */
export interface BackingPersistenceStore {
    readonly get: (key: string) => Effect.Effect<object | undefined, PersistenceError>;
    readonly getMany: (keys: Arr.NonEmptyArray<string>) => Effect.Effect<Arr.NonEmptyArray<object | undefined>, PersistenceError>;
    readonly set: (key: string, value: object, ttl: Duration.Duration | undefined) => Effect.Effect<void, PersistenceError>;
    readonly setMany: (entries: Arr.NonEmptyArray<readonly [key: string, value: object, ttl: Duration.Duration | undefined]>) => Effect.Effect<void, PersistenceError>;
    readonly remove: (key: string) => Effect.Effect<void, PersistenceError>;
    readonly clear: Effect.Effect<void, PersistenceError>;
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<Persistence, never, BackingPersistence>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerBackingMemory: Layer.Layer<BackingPersistence>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerBackingSqlMultiTable: Layer.Layer<BackingPersistence, never, SqlClient.SqlClient>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerBackingSql: Layer.Layer<BackingPersistence, never, SqlClient.SqlClient>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerBackingRedis: Layer.Layer<BackingPersistence, never, Redis.Redis>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerBackingKvs: Layer.Layer<BackingPersistence, never, KeyValueStore.KeyValueStore>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerKvs: Layer.Layer<Persistence, never, KeyValueStore.KeyValueStore>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerMemory: Layer.Layer<Persistence>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerRedis: Layer.Layer<Persistence, never, Redis.Redis>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerSqlMultiTable: Layer.Layer<Persistence, never, SqlClient.SqlClient>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerSql: Layer.Layer<Persistence, never, SqlClient.SqlClient>;
/**
 * @since 4.0.0
 */
export declare const unsafeTtlToExpires: (clock: Clock.Clock, ttl: Duration.Duration | undefined) => number | null;
export {};
//# sourceMappingURL=Persistence.d.ts.map