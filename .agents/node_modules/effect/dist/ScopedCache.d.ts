import * as Deferred from "./Deferred.ts";
import * as Duration from "./Duration.ts";
import type * as Effect from "./Effect.ts";
import type * as Exit from "./Exit.ts";
import * as MutableHashMap from "./MutableHashMap.ts";
import * as Option from "./Option.ts";
import type { Pipeable } from "./Pipeable.ts";
import * as Predicate from "./Predicate.ts";
import * as Scope from "./Scope.ts";
declare const TypeId = "~effect/ScopedCache";
/**
 * @since 4.0.0
 * @category Models
 */
export interface ScopedCache<in out Key, in out A, in out E = never, out R = never> extends Pipeable {
    readonly [TypeId]: typeof TypeId;
    state: State<Key, A, E>;
    readonly capacity: number;
    readonly lookup: (key: Key) => Effect.Effect<A, E, R | Scope.Scope>;
    readonly timeToLive: (exit: Exit.Exit<A, E>, key: Key) => Duration.Duration;
}
/**
 * @since 4.0.0
 * @category Models
 */
export type State<K, A, E> = {
    readonly _tag: "Open";
    readonly map: MutableHashMap.MutableHashMap<K, Entry<A, E>>;
} | {
    readonly _tag: "Closed";
};
/**
 * Represents a cache entry containing a deferred value and optional expiration time.
 * This is used internally by the cache implementation to track cached values and their lifetimes.
 *
 * @since 4.0.0
 * @category Models
 */
export interface Entry<A, E> {
    expiresAt: number | undefined;
    readonly deferred: Deferred.Deferred<A, E>;
    readonly scope: Scope.Closeable;
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makeWith: <Key, A, E = never, R = never, ServiceMode extends "lookup" | "construction" = never>(options: {
    readonly lookup: (key: Key) => Effect.Effect<A, E, R | Scope.Scope>;
    readonly capacity: number;
    readonly timeToLive?: ((exit: Exit.Exit<A, E>, key: Key) => Duration.Input) | undefined;
    readonly requireServicesAt?: ServiceMode | undefined;
}) => Effect.Effect<ScopedCache<Key, A, E, "lookup" extends ServiceMode ? Exclude<R, Scope.Scope> : never>, never, ("lookup" extends ServiceMode ? never : R) | Scope.Scope>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: <Key, A, E = never, R = never, ServiceMode extends "lookup" | "construction" = never>(options: {
    readonly lookup: (key: Key) => Effect.Effect<A, E, R | Scope.Scope>;
    readonly capacity: number;
    readonly timeToLive?: Duration.Input | undefined;
    readonly requireServicesAt?: ServiceMode | undefined;
}) => Effect.Effect<ScopedCache<Key, A, E, "lookup" extends ServiceMode ? Exclude<R, Scope.Scope> : never>, never, ("lookup" extends ServiceMode ? never : R) | Scope.Scope>;
/**
 * @since 4.0.0
 * @category Combinators
 */
export declare const get: {
    /**
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<A, E, R>;
};
/**
 * @since 4.0.0
 * @category Combinators
 */
export declare const getOption: {
    /**
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<Option.Option<A>, E>;
    /**
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<Option.Option<A>, E>;
};
/**
 * Retrieves the value associated with the specified key from the cache, only if
 * it contains a resolved successful value.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const getSuccess: {
    /**
     * Retrieves the value associated with the specified key from the cache, only if
     * it contains a resolved successful value.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, R>(key: Key): <E>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<Option.Option<A>>;
    /**
     * Retrieves the value associated with the specified key from the cache, only if
     * it contains a resolved successful value.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<Option.Option<A>>;
};
/**
 * Sets the value associated with the specified key in the cache. This will
 * overwrite any existing value for that key, skipping the lookup function.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const set: {
    /**
     * Sets the value associated with the specified key in the cache. This will
     * overwrite any existing value for that key, skipping the lookup function.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key, value: A): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<void>;
    /**
     * Sets the value associated with the specified key in the cache. This will
     * overwrite any existing value for that key, skipping the lookup function.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key, value: A): Effect.Effect<void>;
};
/**
 * Checks if the cache contains an entry for the specified key.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const has: {
    /**
     * Checks if the cache contains an entry for the specified key.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<boolean>;
    /**
     * Checks if the cache contains an entry for the specified key.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<boolean>;
};
/**
 * Invalidates the entry associated with the specified key in the cache.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const invalidate: {
    /**
     * Invalidates the entry associated with the specified key in the cache.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<void>;
    /**
     * Invalidates the entry associated with the specified key in the cache.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<void>;
};
/**
 * Conditionally invalidates the entry associated with the specified key in the cache
 * if the predicate returns true for the cached value.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const invalidateWhen: {
    /**
     * Conditionally invalidates the entry associated with the specified key in the cache
     * if the predicate returns true for the cached value.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key, f: Predicate.Predicate<A>): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<boolean>;
    /**
     * Conditionally invalidates the entry associated with the specified key in the cache
     * if the predicate returns true for the cached value.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key, f: Predicate.Predicate<A>): Effect.Effect<boolean>;
};
/**
 * Forces a refresh of the value associated with the specified key in the cache.
 *
 * It will always invoke the lookup function to construct a new value,
 * overwriting any existing value for that key.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const refresh: {
    /**
     * Forces a refresh of the value associated with the specified key in the cache.
     *
     * It will always invoke the lookup function to construct a new value,
     * overwriting any existing value for that key.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A>(key: Key): <E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Forces a refresh of the value associated with the specified key in the cache.
     *
     * It will always invoke the lookup function to construct a new value,
     * overwriting any existing value for that key.
     *
     * @since 4.0.0
     * @category Combinators
     */
    <Key, A, E, R>(self: ScopedCache<Key, A, E, R>, key: Key): Effect.Effect<A, E, R>;
};
/**
 * Invalidates all entries in the cache.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const invalidateAll: <Key, A, E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<void>;
/**
 * Retrieves the approximate number of entries in the cache.
 *
 * Note that expired entries are counted until they are accessed and removed.
 * The size reflects the current number of entries stored, not the number
 * of valid entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const size: <Key, A, E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<number>;
/**
 * Retrieves all active keys from the cache, automatically filtering out expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const keys: <Key, A, E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<Array<Key>>;
/**
 * Retrieves all successfully cached values from the cache, excluding failed
 * lookups and expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const values: <Key, A, E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<Array<A>>;
/**
 * Retrieves all key-value pairs from the cache as an iterable. This function
 * only returns entries with successfully resolved values, filtering out any
 * failed lookups or expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export declare const entries: <Key, A, E, R>(self: ScopedCache<Key, A, E, R>) => Effect.Effect<Array<[Key, A]>>;
export {};
//# sourceMappingURL=ScopedCache.d.ts.map