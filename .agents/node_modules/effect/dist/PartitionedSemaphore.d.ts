/**
 * @since 4.0.0
 */
import * as Effect from "./Effect.ts";
import * as Option from "./Option.ts";
/**
 * @since 4.0.0
 * @category models
 */
export declare const PartitionedTypeId: PartitionedTypeId;
/**
 * @since 4.0.0
 * @category models
 */
export type PartitionedTypeId = "~effect/PartitionedSemaphore";
/**
 * A `PartitionedSemaphore` controls access to a shared permit pool while
 * tracking waiters by partition key.
 *
 * Waiting permits are distributed across partitions in round-robin order.
 *
 * @since 4.0.0
 * @category models
 */
export interface PartitionedSemaphore<in K> {
    readonly [PartitionedTypeId]: PartitionedTypeId;
    readonly capacity: number;
    readonly available: Effect.Effect<number>;
    readonly take: (key: K, permits: number) => Effect.Effect<void>;
    readonly release: (permits: number) => Effect.Effect<number>;
    readonly withPermits: (key: K, permits: number) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    readonly withPermit: (key: K) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    readonly withPermitsIfAvailable: (permits: number) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Option.Option<A>, E, R>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Partitioned<in K> extends PartitionedSemaphore<K> {
}
/**
 * Creates a `PartitionedSemaphore` unsafely.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeUnsafe: <K = unknown>(options: {
    readonly permits: number;
}) => PartitionedSemaphore<K>;
/**
 * Creates a `PartitionedSemaphore`.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <K = unknown>(options: {
    readonly permits: number;
}) => Effect.Effect<PartitionedSemaphore<K>>;
/**
 * Gets the current number of available permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const available: <K>(self: PartitionedSemaphore<K>) => Effect.Effect<number>;
/**
 * Gets the total capacity.
 *
 * @since 4.0.0
 * @category getters
 */
export declare const capacity: <K>(self: PartitionedSemaphore<K>) => number;
/**
 * Acquires permits for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const take: {
    /**
     * Acquires permits for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(key: K, permits: number): (self: PartitionedSemaphore<K>) => Effect.Effect<void>;
    /**
     * Acquires permits for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(self: PartitionedSemaphore<K>, key: K, permits: number): Effect.Effect<void>;
};
/**
 * Releases permits back to the shared pool.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const release: {
    /**
     * Releases permits back to the shared pool.
     *
     * @since 4.0.0
     * @category combinators
     */
    (permits: number): <K>(self: PartitionedSemaphore<K>) => Effect.Effect<number>;
    /**
     * Releases permits back to the shared pool.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(self: PartitionedSemaphore<K>, permits: number): Effect.Effect<number>;
};
/**
 * Runs an effect with permits for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermits: {
    /**
     * Runs an effect with permits for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(self: PartitionedSemaphore<K>, key: K, permits: number): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Runs an effect with permits for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K, A, E, R>(self: PartitionedSemaphore<K>, key: K, permits: number, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Runs an effect with a single permit for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermit: {
    /**
     * Runs an effect with a single permit for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(self: PartitionedSemaphore<K>, key: K): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Runs an effect with a single permit for a partition.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K, A, E, R>(self: PartitionedSemaphore<K>, key: K, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Runs an effect only if the permits are immediately available.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermitsIfAvailable: {
    /**
     * Runs an effect only if the permits are immediately available.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K>(self: PartitionedSemaphore<K>, permits: number): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Option.Option<A>, E, R>;
    /**
     * Runs an effect only if the permits are immediately available.
     *
     * @since 4.0.0
     * @category combinators
     */
    <K, A, E, R>(self: PartitionedSemaphore<K>, permits: number, effect: Effect.Effect<A, E, R>): Effect.Effect<Option.Option<A>, E, R>;
};
//# sourceMappingURL=PartitionedSemaphore.d.ts.map