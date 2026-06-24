/**
 * @since 4.0.0
 */
import * as Effect from "./Effect.ts";
import type { Inspectable } from "./Inspectable.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Scope from "./Scope.ts";
import * as TxRef from "./TxRef.ts";
declare const TypeId = "~effect/transactions/TxSemaphore";
/**
 * A transactional semaphore that manages permits using Software Transactional Memory (STM) semantics.
 *
 * TxSemaphore provides atomic permit acquisition and release operations within Effect transactions,
 * ensuring thread-safe concurrency control for limited resources.
 *
 * @example
 * ```ts
 * import { Effect, TxSemaphore } from "effect"
 *
 * // Create a semaphore with 3 permits for managing concurrent database connections
 * const program = Effect.gen(function*() {
 *   const dbSemaphore = yield* TxSemaphore.make(3)
 *
 *   // Acquire a permit before accessing the database
 *   yield* TxSemaphore.acquire(dbSemaphore)
 *   console.log("Database connection acquired")
 *
 *   // Perform database operations...
 *
 *   // Release the permit when done
 *   yield* TxSemaphore.release(dbSemaphore)
 *   console.log("Database connection released")
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface TxSemaphore extends Inspectable, Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly permitsRef: TxRef.TxRef<number>;
    readonly capacity: number;
}
/**
 * Creates a new TxSemaphore with the specified number of permits.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * // Create a semaphore for managing concurrent access to a resource pool
 * const program = Effect.gen(function*() {
 *   // Create a semaphore with 3 permits for a connection pool
 *   const connectionSemaphore = yield* TxSemaphore.make(3)
 *
 *   // Check initial state
 *   const available = yield* TxSemaphore.available(connectionSemaphore)
 *   const capacity = yield* TxSemaphore.capacity(connectionSemaphore)
 *
 *   yield* Console.log(
 *     `Created semaphore with ${capacity} permits, ${available} available`
 *   )
 *   // Output: "Created semaphore with 3 permits, 3 available"
 * })
 * ```
 *
 * @param permits - The initial number of permits (must be non-negative)
 * @returns Effect that succeeds with a new TxSemaphore
 * @throws Defect if permits is negative
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (permits: number) => Effect.Effect<TxSemaphore>;
/**
 * Gets the current number of available permits in the semaphore.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   // Check available permits before acquiring
 *   const before = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${before}`) // 5
 *
 *   // Acquire some permits
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* TxSemaphore.acquire(semaphore)
 *
 *   // Check available permits after acquiring
 *   const after = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${after}`) // 3
 * })
 * ```
 *
 * @param self - The TxSemaphore to inspect
 * @returns Effect that succeeds with the current number of available permits
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const available: (self: TxSemaphore) => Effect.Effect<number>;
/**
 * Gets the maximum capacity (total permits) of the semaphore.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(10)
 *
 *   const capacity = yield* TxSemaphore.capacity(semaphore)
 *   yield* Console.log(`Semaphore capacity: ${capacity}`) // 10
 *
 *   // Capacity remains constant regardless of current permits
 *   yield* TxSemaphore.acquire(semaphore)
 *   const stillSame = yield* TxSemaphore.capacity(semaphore)
 *   yield* Console.log(`Capacity after acquire: ${stillSame}`) // 10
 * })
 * ```
 *
 * @param self - The TxSemaphore to inspect
 * @returns Effect that succeeds with the semaphore's maximum capacity
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const capacity: (self: TxSemaphore) => Effect.Effect<number>;
/**
 * Acquires a single permit from the semaphore. If no permits are available,
 * the effect will block until one becomes available.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 *
 *   yield* Console.log("Acquiring first permit...")
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* Console.log("First permit acquired")
 *
 *   yield* Console.log("Acquiring second permit...")
 *   yield* TxSemaphore.acquire(semaphore)
 *   yield* Console.log("Second permit acquired")
 *
 *   const available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${available}`) // 0
 * })
 * ```
 *
 * @param self - The TxSemaphore from which to acquire a permit
 * @returns Effect that succeeds when a permit is acquired
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const acquire: (self: TxSemaphore) => Effect.Effect<void>;
/**
 * Acquires the specified number of permits from the semaphore. If not enough
 * permits are available, the effect will block until they become available.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   yield* Console.log("Acquiring 3 permits...")
 *   yield* TxSemaphore.acquireN(semaphore, 3)
 *   yield* Console.log("3 permits acquired")
 *
 *   const available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`Available permits: ${available}`) // 2
 * })
 * ```
 *
 * @param self - The TxSemaphore from which to acquire permits
 * @param n - The number of permits to acquire (must be positive)
 * @returns Effect that succeeds when the permits are acquired
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const acquireN: (self: TxSemaphore, n: number) => Effect.Effect<void>;
/**
 * Tries to acquire a single permit from the semaphore without blocking.
 * Returns true if successful, false if no permits are available.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(1)
 *
 *   // First try should succeed
 *   const first = yield* TxSemaphore.tryAcquire(semaphore)
 *   yield* Console.log(`First try: ${first}`) // true
 *
 *   // Second try should fail (no permits left)
 *   const second = yield* TxSemaphore.tryAcquire(semaphore)
 *   yield* Console.log(`Second try: ${second}`) // false
 * })
 * ```
 *
 * @param self - The TxSemaphore from which to try acquiring a permit
 * @returns Effect that succeeds with true if permit acquired, false otherwise
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const tryAcquire: (self: TxSemaphore) => Effect.Effect<boolean>;
/**
 * Tries to acquire the specified number of permits from the semaphore without blocking.
 * Returns true if successful, false if not enough permits are available.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(3)
 *
 *   // Try to acquire 2 permits (should succeed)
 *   const first = yield* TxSemaphore.tryAcquireN(semaphore, 2)
 *   yield* Console.log(`First try (2 permits): ${first}`) // true
 *
 *   // Try to acquire 2 more permits (should fail, only 1 left)
 *   const second = yield* TxSemaphore.tryAcquireN(semaphore, 2)
 *   yield* Console.log(`Second try (2 permits): ${second}`) // false
 * })
 * ```
 *
 * @param self - The TxSemaphore from which to try acquiring permits
 * @param n - The number of permits to try acquiring (must be positive)
 * @returns Effect that succeeds with true if permits acquired, false otherwise
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const tryAcquireN: (self: TxSemaphore, n: number) => Effect.Effect<boolean>;
/**
 * Releases a single permit back to the semaphore, making it available for acquisition.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 *
 *   // Acquire a permit
 *   yield* TxSemaphore.acquire(semaphore)
 *   let available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After acquire: ${available}`) // 1
 *
 *   // Release the permit
 *   yield* TxSemaphore.release(semaphore)
 *   available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After release: ${available}`) // 2
 * })
 * ```
 *
 * @param self - The TxSemaphore to which to release a permit
 * @returns Effect that succeeds when the permit is released
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const release: (self: TxSemaphore) => Effect.Effect<void>;
/**
 * Releases the specified number of permits back to the semaphore.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   // Acquire 3 permits
 *   yield* TxSemaphore.acquireN(semaphore, 3)
 *   let available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After acquire: ${available}`) // 2
 *
 *   // Release 2 permits
 *   yield* TxSemaphore.releaseN(semaphore, 2)
 *   available = yield* TxSemaphore.available(semaphore)
 *   yield* Console.log(`After release: ${available}`) // 4
 * })
 * ```
 *
 * @param self - The TxSemaphore to which to release permits
 * @param n - The number of permits to release (must be positive)
 * @returns Effect that succeeds when the permits are released
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const releaseN: (self: TxSemaphore, n: number) => Effect.Effect<void>;
/**
 * Executes an effect with a single permit from the semaphore. The permit is
 * automatically acquired before execution and released afterwards, even if the
 * effect fails or is interrupted.
 *
 * **Note**: The permit acquisition and release operations use atomic semantics
 * to ensure proper resource management with Effect's scoped operations.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(2)
 *
 *   // Execute database operation with automatic permit management
 *   const result = yield* TxSemaphore.withPermit(
 *     semaphore,
 *     Effect.gen(function*() {
 *       yield* Console.log("Permit acquired, accessing database...")
 *       yield* Effect.sleep("100 millis") // Simulate database work
 *       yield* Console.log("Database operation complete")
 *       return "query result"
 *     })
 *   )
 *
 *   yield* Console.log(`Result: ${result}`)
 *   // Permit is automatically released here
 * })
 * ```
 *
 * @param self - The TxSemaphore to acquire a permit from
 * @param effect - The effect to execute with the permit
 * @returns Effect that succeeds with the result of the provided effect
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermit: {
    /**
     * Executes an effect with a single permit from the semaphore. The permit is
     * automatically acquired before execution and released afterwards, even if the
     * effect fails or is interrupted.
     *
     * **Note**: The permit acquisition and release operations use atomic semantics
     * to ensure proper resource management with Effect's scoped operations.
     *
     * @example
     * ```ts
     * import { Console, Effect, TxSemaphore } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const semaphore = yield* TxSemaphore.make(2)
     *
     *   // Execute database operation with automatic permit management
     *   const result = yield* TxSemaphore.withPermit(
     *     semaphore,
     *     Effect.gen(function*() {
     *       yield* Console.log("Permit acquired, accessing database...")
     *       yield* Effect.sleep("100 millis") // Simulate database work
     *       yield* Console.log("Database operation complete")
     *       return "query result"
     *     })
     *   )
     *
     *   yield* Console.log(`Result: ${result}`)
     *   // Permit is automatically released here
     * })
     * ```
     *
     * @param self - The TxSemaphore to acquire a permit from
     * @param effect - The effect to execute with the permit
     * @returns Effect that succeeds with the result of the provided effect
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: TxSemaphore): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Executes an effect with a single permit from the semaphore. The permit is
     * automatically acquired before execution and released afterwards, even if the
     * effect fails or is interrupted.
     *
     * **Note**: The permit acquisition and release operations use atomic semantics
     * to ensure proper resource management with Effect's scoped operations.
     *
     * @example
     * ```ts
     * import { Console, Effect, TxSemaphore } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const semaphore = yield* TxSemaphore.make(2)
     *
     *   // Execute database operation with automatic permit management
     *   const result = yield* TxSemaphore.withPermit(
     *     semaphore,
     *     Effect.gen(function*() {
     *       yield* Console.log("Permit acquired, accessing database...")
     *       yield* Effect.sleep("100 millis") // Simulate database work
     *       yield* Console.log("Database operation complete")
     *       return "query result"
     *     })
     *   )
     *
     *   yield* Console.log(`Result: ${result}`)
     *   // Permit is automatically released here
     * })
     * ```
     *
     * @param self - The TxSemaphore to acquire a permit from
     * @param effect - The effect to execute with the permit
     * @returns Effect that succeeds with the result of the provided effect
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, E, R>(self: TxSemaphore, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Executes an effect with the specified number of permits from the semaphore.
 * The permits are automatically acquired before execution and released afterwards,
 * even if the effect fails or is interrupted.
 *
 * **Note**: The permit acquisition and release operations use atomic semantics
 * to ensure proper resource management with Effect's scoped operations.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *
 *   // Execute batch operation with 3 permits
 *   const results = yield* TxSemaphore.withPermits(
 *     semaphore,
 *     3,
 *     Effect.gen(function*() {
 *       yield* Console.log("3 permits acquired, processing batch...")
 *       yield* Effect.sleep("200 millis") // Simulate batch processing
 *       return ["result1", "result2", "result3"]
 *     })
 *   )
 *
 *   yield* Console.log(`Batch results: ${results.join(", ")}`)
 *   // All 3 permits are automatically released here
 * })
 * ```
 *
 * @param self - The TxSemaphore to acquire permits from
 * @param n - The number of permits to acquire (must be positive)
 * @param effect - The effect to execute with the permits
 * @returns Effect that succeeds with the result of the provided effect
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermits: {
    /**
     * Executes an effect with the specified number of permits from the semaphore.
     * The permits are automatically acquired before execution and released afterwards,
     * even if the effect fails or is interrupted.
     *
     * **Note**: The permit acquisition and release operations use atomic semantics
     * to ensure proper resource management with Effect's scoped operations.
     *
     * @example
     * ```ts
     * import { Console, Effect, TxSemaphore } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const semaphore = yield* TxSemaphore.make(5)
     *
     *   // Execute batch operation with 3 permits
     *   const results = yield* TxSemaphore.withPermits(
     *     semaphore,
     *     3,
     *     Effect.gen(function*() {
     *       yield* Console.log("3 permits acquired, processing batch...")
     *       yield* Effect.sleep("200 millis") // Simulate batch processing
     *       return ["result1", "result2", "result3"]
     *     })
     *   )
     *
     *   yield* Console.log(`Batch results: ${results.join(", ")}`)
     *   // All 3 permits are automatically released here
     * })
     * ```
     *
     * @param self - The TxSemaphore to acquire permits from
     * @param n - The number of permits to acquire (must be positive)
     * @param effect - The effect to execute with the permits
     * @returns Effect that succeeds with the result of the provided effect
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: TxSemaphore, n: number): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Executes an effect with the specified number of permits from the semaphore.
     * The permits are automatically acquired before execution and released afterwards,
     * even if the effect fails or is interrupted.
     *
     * **Note**: The permit acquisition and release operations use atomic semantics
     * to ensure proper resource management with Effect's scoped operations.
     *
     * @example
     * ```ts
     * import { Console, Effect, TxSemaphore } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const semaphore = yield* TxSemaphore.make(5)
     *
     *   // Execute batch operation with 3 permits
     *   const results = yield* TxSemaphore.withPermits(
     *     semaphore,
     *     3,
     *     Effect.gen(function*() {
     *       yield* Console.log("3 permits acquired, processing batch...")
     *       yield* Effect.sleep("200 millis") // Simulate batch processing
     *       return ["result1", "result2", "result3"]
     *     })
     *   )
     *
     *   yield* Console.log(`Batch results: ${results.join(", ")}`)
     *   // All 3 permits are automatically released here
     * })
     * ```
     *
     * @param self - The TxSemaphore to acquire permits from
     * @param n - The number of permits to acquire (must be positive)
     * @param effect - The effect to execute with the permits
     * @returns Effect that succeeds with the result of the provided effect
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, E, R>(self: TxSemaphore, n: number, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Acquires a single permit from the semaphore in a scoped manner. The permit
 * will be automatically released when the scope is closed, even if effects
 * within the scope fail or are interrupted.
 *
 * **Note**: The permit acquisition and release operations use atomic semantics
 * to ensure proper resource management with Effect's scoped operations.
 *
 * @example
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(3)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       // Acquire permit for the duration of this scope
 *       yield* TxSemaphore.withPermitScoped(semaphore)
 *       yield* Console.log("Permit acquired for scope")
 *
 *       // Do work within the scope
 *       yield* Effect.sleep("500 millis")
 *       yield* Console.log("Work completed")
 *
 *       // Permit will be automatically released when scope closes
 *     })
 *   )
 *
 *   yield* Console.log("Scope closed, permit released")
 * })
 * ```
 *
 * @param self - The TxSemaphore to acquire a permit from
 * @returns Effect that succeeds when the permit is acquired (within scope)
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withPermitScoped: (self: TxSemaphore) => Effect.Effect<void, never, Scope.Scope>;
/**
 * Determines if the provided value is a TxSemaphore.
 *
 * @example
 * ```ts
 * import { Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(5)
 *   const notSemaphore = { some: "object" }
 *
 *   console.log(TxSemaphore.isTxSemaphore(semaphore)) // true
 *   console.log(TxSemaphore.isTxSemaphore(notSemaphore)) // false
 *
 *   // Useful for runtime type checking in generic functions
 *   if (TxSemaphore.isTxSemaphore(semaphore)) {
 *     const available = yield* TxSemaphore.available(semaphore)
 *     console.log(`Available permits: ${available}`)
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isTxSemaphore: (u: unknown) => u is TxSemaphore;
export {};
//# sourceMappingURL=TxSemaphore.d.ts.map