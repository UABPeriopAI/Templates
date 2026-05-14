/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import { type LazyArg } from "../../Function.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Path from "../../Path.ts";
import type { PlatformError } from "../../PlatformError.ts";
import * as Schema from "../../Schema.ts";
import * as SqlClient from "../sql/SqlClient.ts";
declare const TypeId: "~effect/persistence/KeyValueStore";
/**
 * @since 4.0.0
 * @category Models
 */
export interface KeyValueStore {
    readonly [TypeId]: typeof TypeId;
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly get: (key: string) => Effect.Effect<string | undefined, KeyValueStoreError>;
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly getUint8Array: (key: string) => Effect.Effect<Uint8Array | undefined, KeyValueStoreError>;
    /**
     * Sets the value of the specified key.
     */
    readonly set: (key: string, value: string | Uint8Array) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes the specified key.
     */
    readonly remove: (key: string) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes all entries.
     */
    readonly clear: Effect.Effect<void, KeyValueStoreError>;
    /**
     * Returns the number of entries.
     */
    readonly size: Effect.Effect<number, KeyValueStoreError>;
    /**
     * Updates the value of the specified key if it exists.
     */
    readonly modify: (key: string, f: (value: string) => string) => Effect.Effect<string | undefined, KeyValueStoreError>;
    /**
     * Updates the value of the specified key if it exists.
     */
    readonly modifyUint8Array: (key: string, f: (value: Uint8Array) => Uint8Array) => Effect.Effect<Uint8Array | undefined, KeyValueStoreError>;
    /**
     * Returns true if the KeyValueStore contains the specified key.
     */
    readonly has: (key: string) => Effect.Effect<boolean, KeyValueStoreError>;
    /**
     * Checks if the KeyValueStore contains any entries.
     */
    readonly isEmpty: Effect.Effect<boolean, KeyValueStoreError>;
}
/**
 * @since 4.0.0
 * @category Models
 */
export type MakeOptions = Partial<KeyValueStore> & {
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly get: (key: string) => Effect.Effect<string | undefined, KeyValueStoreError>;
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly getUint8Array: (key: string) => Effect.Effect<Uint8Array | undefined, KeyValueStoreError>;
    /**
     * Sets the value of the specified key.
     */
    readonly set: (key: string, value: string | Uint8Array) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes the specified key.
     */
    readonly remove: (key: string) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes all entries.
     */
    readonly clear: Effect.Effect<void, KeyValueStoreError>;
    /**
     * Returns the number of entries.
     */
    readonly size: Effect.Effect<number, KeyValueStoreError>;
};
/**
 * @since 4.0.0
 * @category Models
 */
export type MakeStringOptions = Partial<Omit<KeyValueStore, "set">> & {
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly get: (key: string) => Effect.Effect<string | undefined, KeyValueStoreError>;
    /**
     * Sets the value of the specified key.
     */
    readonly set: (key: string, value: string) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes the specified key.
     */
    readonly remove: (key: string) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes all entries.
     */
    readonly clear: Effect.Effect<void, KeyValueStoreError>;
    /**
     * Returns the number of entries.
     */
    readonly size: Effect.Effect<number, KeyValueStoreError>;
};
declare const ErrorTypeId: "~effect/persistence/KeyValueStore/KeyValueStoreError";
declare const KeyValueStoreError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "KeyValueStoreError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class KeyValueStoreError extends KeyValueStoreError_base<{
    message: string;
    method: string;
    key?: string;
    cause?: unknown;
}> {
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: typeof ErrorTypeId;
}
/**
 * @since 4.0.0
 * @category tags
 */
export declare const KeyValueStore: Context.Service<KeyValueStore, KeyValueStore>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options: MakeOptions) => KeyValueStore;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeStringOnly: (options: MakeStringOptions) => KeyValueStore;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const prefix: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (prefix: string): (self: KeyValueStore) => KeyValueStore;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: KeyValueStore, prefix: string): KeyValueStore;
};
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerMemory: Layer.Layer<KeyValueStore>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerFileSystem: (directory: string) => Layer.Layer<KeyValueStore, PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * @since 4.0.0
 * @category layers
 */
export interface LayerSqlOptions {
    /**
     * The SQL table name used to store values.
     *
     * @default "effect_key_value_store"
     */
    readonly table?: string;
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerSql: (options?: LayerSqlOptions) => Layer.Layer<KeyValueStore, never, SqlClient.SqlClient>;
declare const SchemaStoreTypeId: "~effect/persistence/KeyValueStore/SchemaStore";
/**
 * @since 4.0.0
 * @category SchemaStore
 */
export interface SchemaStore<S extends Schema.Top> {
    readonly [SchemaStoreTypeId]: typeof SchemaStoreTypeId;
    /**
     * Returns the value of the specified key if it exists.
     */
    readonly get: (key: string) => Effect.Effect<Option.Option<S["Type"]>, KeyValueStoreError | Schema.SchemaError, S["DecodingServices"]>;
    /**
     * Sets the value of the specified key.
     */
    readonly set: (key: string, value: S["Type"]) => Effect.Effect<void, KeyValueStoreError | Schema.SchemaError, S["EncodingServices"]>;
    /**
     * Removes the specified key.
     */
    readonly remove: (key: string) => Effect.Effect<void, KeyValueStoreError>;
    /**
     * Removes all entries.
     */
    readonly clear: Effect.Effect<void, KeyValueStoreError>;
    /**
     * Returns the number of entries.
     */
    readonly size: Effect.Effect<number, KeyValueStoreError>;
    /**
     * Updates the value of the specified key if it exists.
     */
    readonly modify: (key: string, f: (value: S["Type"]) => S["Type"]) => Effect.Effect<Option.Option<S["Type"]>, KeyValueStoreError | Schema.SchemaError, S["DecodingServices"] | S["EncodingServices"]>;
    /**
     * Returns true if the KeyValueStore contains the specified key.
     */
    readonly has: (key: string) => Effect.Effect<boolean, KeyValueStoreError>;
    /**
     * Checks if the KeyValueStore contains any entries.
     */
    readonly isEmpty: Effect.Effect<boolean, KeyValueStoreError>;
}
/**
 * @since 4.0.0
 * @category SchemaStore
 */
export declare const toSchemaStore: <S extends Schema.Top>(self: KeyValueStore, schema: S) => SchemaStore<S>;
/**
 * Creates an KeyValueStorage from an instance of the `Storage` api.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerStorage: (evaluate: LazyArg<Storage>) => Layer.Layer<KeyValueStore>;
export {};
//# sourceMappingURL=KeyValueStore.d.ts.map