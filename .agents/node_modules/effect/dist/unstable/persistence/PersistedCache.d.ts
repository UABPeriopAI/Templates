/**
 * @since 4.0.0
 */
import * as Cache from "../../Cache.ts";
import * as Effect from "../../Effect.ts";
import type * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import type * as Persistable from "./Persistable.ts";
import * as Persistence from "./Persistence.ts";
declare const TypeId: "~effect/persistence/PersistedCache";
/**
 * @since 4.0.0
 * @category Models
 */
export interface PersistedCache<K extends Persistable.Any, out R = never> {
    readonly [TypeId]: typeof TypeId;
    readonly inMemory: Cache.Cache<K, Persistable.Success<K>, Persistable.Error<K> | Persistence.PersistenceError | Schema.SchemaError, Persistable.Services<K> | R>;
    readonly get: (key: K) => Effect.Effect<Persistable.Success<K>, Persistable.Error<K> | Persistence.PersistenceError | Schema.SchemaError, Persistable.Services<K> | R>;
    readonly invalidate: (key: K) => Effect.Effect<void, Persistence.PersistenceError>;
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: <K extends Persistable.Any, R = never, ServiceMode extends "lookup" | "construction" = never>(lookup: (key: K) => Effect.Effect<Persistable.Success<K>, Persistable.Error<K>, R>, options: {
    readonly storeId: string;
    readonly timeToLive: Persistable.TimeToLiveFn<K>;
    readonly inMemoryCapacity?: number | undefined;
    readonly inMemoryTTL?: Persistable.TimeToLiveFn<K> | undefined;
    readonly requireServicesAt?: ServiceMode | undefined;
}) => Effect.Effect<PersistedCache<K, "lookup" extends ServiceMode ? R : never>, never, ("lookup" extends ServiceMode ? never : R) | Persistence.Persistence | Scope.Scope>;
export {};
//# sourceMappingURL=PersistedCache.d.ts.map