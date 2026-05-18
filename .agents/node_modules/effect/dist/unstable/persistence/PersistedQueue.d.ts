import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import * as Scope from "../../Scope.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import type { SqlError } from "../sql/SqlError.ts";
import * as Redis from "./Redis.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category Type IDs
 */
export type TypeId = "~effect/persistence/PersistedQueue";
/**
 * @since 4.0.0
 * @category Models
 */
export interface PersistedQueue<in out A, out R = never> {
    readonly [TypeId]: TypeId;
    /**
     * Adds an element to the queue. Returns the id of the enqueued element.
     *
     * If an element with the same id already exists in the queue, it will not be
     * added again.
     */
    readonly offer: (value: A, options?: {
        readonly id: string | undefined;
    }) => Effect.Effect<string, PersistedQueueError | Schema.SchemaError, R>;
    /**
     * Takes an element from the queue.
     * If the queue is empty, it will wait until an element is available.
     *
     * If the returned effect succeeds, the element is marked as processed,
     * otherwise it will be retried according to the provided options.
     *
     * By default, max attempts is set to 10.
     */
    readonly take: <XA, XE, XR>(f: (value: A, metadata: {
        readonly id: string;
        readonly attempts: number;
    }) => Effect.Effect<XA, XE, XR>, options?: {
        readonly maxAttempts?: number | undefined;
    }) => Effect.Effect<XA, XE | PersistedQueueError | Schema.SchemaError, R | XR>;
}
declare const PersistedQueueFactory_base: Context.ServiceClass<PersistedQueueFactory, "effect/persistence/PersistedQueue/PersistedQueueFactory", {
    readonly make: <S extends Schema.Top>(options: {
        readonly name: string;
        readonly schema: S;
    }) => Effect.Effect<PersistedQueue<S["Type"], S["EncodingServices"] | S["DecodingServices"]>>;
}>;
/**
 * @since 4.0.0
 * @category Factory
 */
export declare class PersistedQueueFactory extends PersistedQueueFactory_base {
}
/**
 * @since 4.0.0
 * @category Accessors
 */
export declare const make: <S extends Schema.Top>(options: {
    readonly name: string;
    readonly schema: S;
}) => Effect.Effect<PersistedQueue<S["Type"], S["EncodingServices"] | S["DecodingServices"]>, never, PersistedQueueFactory>;
/**
 * @since 4.0.0
 * @category Factory
 */
export declare const makeFactory: Effect.Effect<{
    readonly make: <S extends Schema.Top>(options: {
        readonly name: string;
        readonly schema: S;
    }) => Effect.Effect<PersistedQueue<S["Type"], S["EncodingServices"] | S["DecodingServices"]>>;
}, never, PersistedQueueStore>;
/**
 * @since 4.0.0
 * @category Factory
 */
export declare const layer: Layer.Layer<PersistedQueueFactory, never, PersistedQueueStore>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare const ErrorTypeId: ErrorTypeId;
/**
 * @since 4.0.0
 * @category Errors
 */
export type ErrorTypeId = "~@effect/experimental/PersistedQueue/PersistedQueueError";
declare const PersistedQueueError_base: Schema.Class<PersistedQueueError, Schema.Struct<{
    readonly _tag: Schema.tag<"PersistedQueueError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, Cause.YieldableError>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class PersistedQueueError extends PersistedQueueError_base {
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: ErrorTypeId;
}
declare const PersistedQueueStore_base: Context.ServiceClass<PersistedQueueStore, "effect/persistence/PersistedQueue/PersistedQueueStore", {
    readonly offer: (options: {
        readonly name: string;
        readonly id: string;
        readonly element: unknown;
        readonly isCustomId: boolean;
    }) => Effect.Effect<void, PersistedQueueError>;
    readonly take: (options: {
        readonly name: string;
        readonly maxAttempts: number;
    }) => Effect.Effect<{
        readonly id: string;
        readonly attempts: number;
        readonly element: unknown;
    }, PersistedQueueError, Scope.Scope>;
}>;
/**
 * @since 4.0.0
 * @category Store
 */
export declare class PersistedQueueStore extends PersistedQueueStore_base {
}
/**
 * @since 4.0.0
 * @category Store
 */
export declare const layerStoreMemory: Layer.Layer<PersistedQueueStore>;
/**
 * @since 4.0.0
 * @category Store
 */
export declare const makeStoreRedis: (options?: {
    readonly prefix?: string | undefined;
    readonly pollInterval?: Duration.Input | undefined;
    readonly lockRefreshInterval?: Duration.Input | undefined;
    readonly lockExpiration?: Duration.Input | undefined;
} | undefined) => Effect.Effect<{
    readonly offer: (options: {
        readonly name: string;
        readonly id: string;
        readonly element: unknown;
        readonly isCustomId: boolean;
    }) => Effect.Effect<void, PersistedQueueError>;
    readonly take: (options: {
        readonly name: string;
        readonly maxAttempts: number;
    }) => Effect.Effect<{
        readonly id: string;
        readonly attempts: number;
        readonly element: unknown;
    }, PersistedQueueError, Scope.Scope>;
}, never, Scope.Scope | Redis.Redis>;
/**
 * @since 4.0.0
 * @category Store
 */
export declare const layerStoreRedis: (options?: {
    readonly prefix?: string | undefined;
    readonly pollInterval?: Duration.Input | undefined;
    readonly lockRefreshInterval?: Duration.Input | undefined;
    readonly lockExpiration?: Duration.Input | undefined;
} | undefined) => Layer.Layer<PersistedQueueStore, never, Redis.Redis>;
/**
 * @since 4.0.0
 * @category Store
 */
export declare const makeStoreSql: (options?: {
    readonly tableName?: string | undefined;
    readonly pollInterval?: Duration.Input | undefined;
    readonly lockRefreshInterval?: Duration.Input | undefined;
    readonly lockExpiration?: Duration.Input | undefined;
} | undefined) => Effect.Effect<PersistedQueueStore["Service"], SqlError, SqlClient.SqlClient | Scope.Scope>;
/**
 * @since 4.0.0
 * @category Store
 */
export declare const layerStoreSql: (options?: {
    readonly tableName?: string | undefined;
    readonly pollInterval?: Duration.Input | undefined;
    readonly lockRefreshInterval?: Duration.Input | undefined;
    readonly lockExpiration?: Duration.Input | undefined;
} | undefined) => Layer.Layer<PersistedQueueStore, SqlError, SqlClient.SqlClient>;
export {};
//# sourceMappingURL=PersistedQueue.d.ts.map