import * as Duration from "./Duration.ts";
import * as Effect from "./Effect.ts";
import type * as Exit from "./Exit.ts";
import * as Latch from "./Latch.ts";
import { type Pipeable } from "./Pipeable.ts";
import * as Scope from "./Scope.ts";
import * as Semaphore from "./Semaphore.ts";
declare const TypeId = "~effect/Pool";
/**
 * A `Pool<A, E>` is a pool of items of type `A`, each of which may be
 * associated with the acquisition and release of resources. An attempt to get
 * an item `A` from a pool may fail with an error of type `E`.
 *
 * @since 2.0.0
 * @category models
 */
export interface Pool<in out A, in out E = never> extends Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly config: Config<A, E>;
    readonly state: State<A, E>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Config<A, E> {
    readonly acquire: Effect.Effect<A, E, Scope.Scope>;
    readonly concurrency: number;
    readonly minSize: number;
    readonly maxSize: number;
    readonly strategy: Strategy<A, E>;
    readonly targetUtilization: number;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface State<A, E> {
    readonly scope: Scope.Scope;
    isShuttingDown: boolean;
    readonly semaphore: Semaphore.Semaphore;
    readonly resizeSemaphore: Semaphore.Semaphore;
    readonly items: Set<PoolItem<A, E>>;
    readonly available: Set<PoolItem<A, E>>;
    readonly availableLatch: Latch.Latch;
    readonly invalidated: Set<PoolItem<A, E>>;
    waiters: number;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface PoolItem<A, E> {
    readonly exit: Exit.Exit<A, E>;
    finalizer: Effect.Effect<void>;
    refCount: number;
    disableReclaim: boolean;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Strategy<A, E> {
    readonly run: (pool: Pool<A, E>) => Effect.Effect<void>;
    readonly onAcquire: (item: PoolItem<A, E>) => Effect.Effect<void>;
    readonly reclaim: (pool: Pool<A, E>) => Effect.Effect<PoolItem<A, E> | undefined>;
}
/**
 * Returns `true` if the specified value is a `Pool`, `false` otherwise.
 *
 * @since 2.0.0
 * @category refinements
 */
export declare const isPool: (u: unknown) => u is Pool<unknown, unknown>;
/**
 * Makes a new pool of the specified fixed size. The pool is returned in a
 * `Scope`, which governs the lifetime of the pool. When the pool is shutdown
 * because the `Scope` is closed, the individual items allocated by the pool
 * will be released in some unspecified order.
 *
 * By setting the `concurrency` parameter, you can control the level of concurrent
 * access per pool item. By default, the number of permits is set to `1`.
 *
 * `targetUtilization` determines when to create new pool items. It is a value
 * between 0 and 1, where 1 means only create new pool items when all the existing
 * items are fully utilized.
 *
 * A `targetUtilization` of 0.5 will create new pool items when the existing items are
 * 50% utilized.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A, E, R>(options: {
    readonly acquire: Effect.Effect<A, E, R>;
    readonly size: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
}) => Effect.Effect<Pool<A, E>, never, R | Scope.Scope>;
/**
 * Makes a new pool with the specified minimum and maximum sizes and time to
 * live before a pool whose excess items are not being used will be shrunk
 * down to the minimum size. The pool is returned in a `Scope`, which governs
 * the lifetime of the pool. When the pool is shutdown because the `Scope` is
 * used, the individual items allocated by the pool will be released in some
 * unspecified order.
 *
 * By setting the `concurrency` parameter, you can control the level of concurrent
 * access per pool item. By default, the number of permits is set to `1`.
 *
 * `targetUtilization` determines when to create new pool items. It is a value
 * between 0 and 1, where 1 means only create new pool items when all the existing
 * items are fully utilized.
 *
 * A `targetUtilization` of 0.5 will create new pool items when the existing items are
 * 50% utilized.
 *
 * The `timeToLiveStrategy` determines how items are invalidated. If set to
 * "creation", then items are invalidated based on their creation time. If set
 * to "usage", then items are invalidated based on pool usage.
 *
 * By default, the `timeToLiveStrategy` is set to "usage".
 *
 * ```ts skip-type-checking
 * import { Duration, Effect, Pool } from "effect"
 * import { createConnection } from "mysql2"
 *
 * const acquireDBConnection = Effect.acquireRelease(
 *   Effect.sync(() => createConnection("mysql://...")),
 *   (connection) => Effect.sync(() => connection.end(() => {}))
 * )
 *
 * const connectionPool = Effect.flatMap(
 *   Pool.makeWithTTL({
 *     acquire: acquireDBConnection,
 *     min: 10,
 *     max: 20,
 *     timeToLive: Duration.seconds(60)
 *   }),
 *   (pool) => pool.get
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const makeWithTTL: <A, E, R>(options: {
    readonly acquire: Effect.Effect<A, E, R>;
    readonly min: number;
    readonly max: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
    readonly timeToLive: Duration.Input;
    readonly timeToLiveStrategy?: "creation" | "usage" | undefined;
}) => Effect.Effect<Pool<A, E>, never, R | Scope.Scope>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeWithStrategy: <A, E, R>(options: {
    readonly acquire: Effect.Effect<A, E, R>;
    readonly min: number;
    readonly max: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
    readonly strategy: Strategy<A, E>;
}) => Effect.Effect<Pool<A, E>, never, Scope.Scope | R>;
/**
 * Retrieves an item from the pool in a scoped effect. Note that if
 * acquisition fails, then the returned effect will fail for that same reason.
 * Retrying a failed acquisition attempt will repeat the acquisition attempt.
 *
 * @since 2.0.0
 * @category getters
 */
export declare const get: <A, E>(self: Pool<A, E>) => Effect.Effect<A, E, Scope.Scope>;
/**
 * Invalidates the specified item. This will cause the pool to eventually
 * reallocate the item, although this reallocation may occur lazily rather
 * than eagerly.
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const invalidate: {
    /**
     * Invalidates the specified item. This will cause the pool to eventually
     * reallocate the item, although this reallocation may occur lazily rather
     * than eagerly.
     *
     * @since 2.0.0
     * @category combinators
     */
    <A>(item: A): <E>(self: Pool<A, E>) => Effect.Effect<void, never, Scope.Scope>;
    /**
     * Invalidates the specified item. This will cause the pool to eventually
     * reallocate the item, although this reallocation may occur lazily rather
     * than eagerly.
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E>(self: Pool<A, E>, item: A): Effect.Effect<void, never, Scope.Scope>;
};
export {};
//# sourceMappingURL=Pool.d.ts.map