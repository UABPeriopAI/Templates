/**
 * @since 2.0.0
 */
import type * as Effect from "./Effect.ts";
import type * as Option from "./Option.ts";
/**
 * @category models
 * @since 2.0.0
 * @example
 * ```ts
 * import { Effect, Semaphore } from "effect"
 *
 * // Create and use a semaphore for controlling concurrent access
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* Semaphore.make(2)
 *
 *   return yield* semaphore.withPermits(1)(
 *     Effect.succeed("Resource accessed")
 *   )
 * })
 * ```
 */
export interface Semaphore {
    /**
     * Adjusts the number of permits available in the semaphore.
     */
    resize(this: Semaphore, permits: number): Effect.Effect<void>;
    /**
     * Runs an effect with the given number of permits and releases the permits
     * when the effect completes.
     *
     * **Details**
     *
     * This function acquires the specified number of permits before executing
     * the provided effect. Once the effect finishes, the permits are released.
     * If insufficient permits are available, the function will wait until they
     * are released by other tasks.
     */
    withPermits(this: Semaphore, permits: number): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Runs an effect with the given number of permits and releases the permits
     * when the effect completes.
     *
     * **Details**
     *
     * This function acquires the specified number of permits before executing
     * the provided effect. Once the effect finishes, the permits are released.
     * If insufficient permits are available, the function will wait until they
     * are released by other tasks.
     */
    withPermit<A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
    /**
     * Runs an effect only if the specified number of permits are immediately
     * available.
     *
     * **Details**
     *
     * This function attempts to acquire the specified number of permits. If they
     * are available, it runs the effect and releases the permits after the effect
     * completes. If permits are not available, the effect does not execute, and
     * the result is `Option.none`.
     */
    withPermitsIfAvailable(this: Semaphore, permits: number): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<Option.Option<A>, E, R>;
    /**
     * Acquires the specified number of permits and returns the resulting
     * available permits, suspending the task if they are not yet available.
     * Concurrent pending `take` calls are processed in a first-in, first-out manner.
     */
    take(this: Semaphore, permits: number): Effect.Effect<number>;
    /**
     * Releases the specified number of permits and returns the resulting
     * available permits.
     */
    release(this: Semaphore, permits: number): Effect.Effect<number>;
    /**
     * Releases all permits held by this semaphore and returns the resulting available permits.
     */
    readonly releaseAll: Effect.Effect<number>;
}
/**
 * Unsafely creates a new Semaphore.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeSemaphoreUnsafe`
 *
 * @example
 * ```ts
 * import { Effect, Semaphore } from "effect"
 *
 * const semaphore = Semaphore.makeUnsafe(3)
 *
 * const task = (id: number) =>
 *   semaphore.withPermits(1)(
 *     Effect.gen(function*() {
 *       yield* Effect.log(`Task ${id} started`)
 *       yield* Effect.sleep("1 second")
 *       yield* Effect.log(`Task ${id} completed`)
 *     })
 *   )
 *
 * // Only 3 tasks can run concurrently
 * const program = Effect.all([
 *   task(1),
 *   task(2),
 *   task(3),
 *   task(4),
 *   task(5)
 * ], { concurrency: "unbounded" })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const makeUnsafe: (permits: number) => Semaphore;
/**
 * Creates a new Semaphore.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeSemaphore`
 *
 * @example
 * ```ts
 * import { Effect, Semaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* Semaphore.make(2)
 *
 *   const task = (id: number) =>
 *     semaphore.withPermits(1)(
 *       Effect.gen(function*() {
 *         yield* Effect.log(`Task ${id} acquired permit`)
 *         yield* Effect.sleep("1 second")
 *         yield* Effect.log(`Task ${id} releasing permit`)
 *       })
 *     )
 *
 *   // Run 4 tasks, but only 2 can run concurrently
 *   yield* Effect.all([task(1), task(2), task(3), task(4)])
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: (permits: number) => Effect.Effect<Semaphore>;
/**
 * Adjusts the number of permits available in the semaphore.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const resize: {
    /**
     * Adjusts the number of permits available in the semaphore.
     *
     * @since 4.0.0
     * @category combinators
     */
    (permits: number): (self: Semaphore) => Effect.Effect<void>;
    /**
     * Adjusts the number of permits available in the semaphore.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore, permits: number): Effect.Effect<void>;
};
/**
 * Runs an effect with the given number of permits and releases the permits when
 * the effect completes.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermits: {
    /**
     * Runs an effect with the given number of permits and releases the permits when
     * the effect completes.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore, permits: number): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Runs an effect with the given number of permits and releases the permits when
     * the effect completes.
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, E, R>(self: Semaphore, permits: number, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Runs an effect with a single permit and releases the permit when the effect
 * completes.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermit: {
    /**
     * Runs an effect with a single permit and releases the permit when the effect
     * completes.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Runs an effect with a single permit and releases the permit when the effect
     * completes.
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, E, R>(self: Semaphore, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Runs an effect only if the specified number of permits are immediately
 * available.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermitsIfAvailable: {
    /**
     * Runs an effect only if the specified number of permits are immediately
     * available.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore, permits: number): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Option.Option<A>, E, R>;
    /**
     * Runs an effect only if the specified number of permits are immediately
     * available.
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, E, R>(self: Semaphore, permits: number, effect: Effect.Effect<A, E, R>): Effect.Effect<Option.Option<A>, E, R>;
};
/**
 * Acquires the specified number of permits and returns the resulting available
 * permits, suspending the task if they are not yet available.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const take: {
    /**
     * Acquires the specified number of permits and returns the resulting available
     * permits, suspending the task if they are not yet available.
     *
     * @since 4.0.0
     * @category combinators
     */
    (permits: number): (self: Semaphore) => Effect.Effect<number>;
    /**
     * Acquires the specified number of permits and returns the resulting available
     * permits, suspending the task if they are not yet available.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore, permits: number): Effect.Effect<number>;
};
/**
 * Releases the specified number of permits and returns the resulting available
 * permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const release: {
    /**
     * Releases the specified number of permits and returns the resulting available
     * permits.
     *
     * @since 4.0.0
     * @category combinators
     */
    (permits: number): (self: Semaphore) => Effect.Effect<number>;
    /**
     * Releases the specified number of permits and returns the resulting available
     * permits.
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Semaphore, permits: number): Effect.Effect<number>;
};
/**
 * Releases all permits held by this semaphore and returns the resulting
 * available permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const releaseAll: (self: Semaphore) => Effect.Effect<number>;
//# sourceMappingURL=Semaphore.d.ts.map