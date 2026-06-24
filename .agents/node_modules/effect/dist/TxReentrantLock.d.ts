/**
 * TxReentrantLock is a transactional read/write lock with reentrant semantics using Software
 * Transactional Memory (STM). Multiple readers can hold the lock concurrently, OR a single
 * writer can hold exclusive access. A fiber holding a write lock may acquire additional
 * read or write locks (reentrancy).
 *
 * @since 4.0.0
 */
import * as Effect from "./Effect.ts";
import type { Inspectable } from "./Inspectable.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Scope from "./Scope.ts";
declare const TypeId = "~effect/transactions/TxReentrantLock";
/**
 * A TxReentrantLock provides a transactional read/write lock with reentrant semantics.
 * Multiple readers can hold the lock concurrently, or a single writer can hold exclusive
 * access. A fiber holding the write lock may acquire additional read/write locks (reentrancy).
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *
 *   // Multiple readers can proceed concurrently
 *   yield* TxReentrantLock.withReadLock(lock, Effect.succeed("reading"))
 *
 *   // Writer gets exclusive access
 *   yield* TxReentrantLock.withWriteLock(lock, Effect.succeed("writing"))
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface TxReentrantLock extends Inspectable, Pipeable {
    readonly [TypeId]: typeof TypeId;
}
/**
 * Creates a new TxReentrantLock.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const isLocked = yield* TxReentrantLock.locked(lock)
 *   console.log(isLocked) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: () => Effect.Effect<TxReentrantLock>;
/**
 * Acquires a read lock. Blocks if another fiber holds the write lock.
 * If the current fiber already holds the write lock, the read lock is granted (reentrancy).
 * Returns the current number of read locks held by this fiber.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const count = yield* TxReentrantLock.acquireRead(lock)
 *   console.log(count) // 1
 *   yield* TxReentrantLock.releaseRead(lock)
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const acquireRead: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Acquires a write lock. Blocks if any other fiber holds any lock.
 * If the current fiber already holds the write lock, the count is incremented (reentrancy).
 * If the current fiber holds a read lock, the write lock is granted (upgrade).
 * Returns the current number of write locks held by this fiber.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const count = yield* TxReentrantLock.acquireWrite(lock)
 *   console.log(count) // 1
 *   yield* TxReentrantLock.releaseWrite(lock)
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const acquireWrite: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Releases a read lock held by the current fiber.
 * Returns the remaining number of read locks held by this fiber.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   yield* TxReentrantLock.acquireRead(lock)
 *   const remaining = yield* TxReentrantLock.releaseRead(lock)
 *   console.log(remaining) // 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const releaseRead: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Releases a write lock held by the current fiber.
 * Returns the remaining number of write locks held by this fiber.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   yield* TxReentrantLock.acquireWrite(lock)
 *   const remaining = yield* TxReentrantLock.releaseWrite(lock)
 *   console.log(remaining) // 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const releaseWrite: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Acquires a read lock for the duration of the scope.
 * The lock is automatically released when the scope closes.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       yield* TxReentrantLock.readLock(lock)
 *       // read lock is held for the duration of the scope
 *     })
 *   )
 *   // read lock is released
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const readLock: (self: TxReentrantLock) => Effect.Effect<number, never, Scope.Scope>;
/**
 * Acquires a write lock for the duration of the scope.
 * The lock is automatically released when the scope closes.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       yield* TxReentrantLock.writeLock(lock)
 *       // write lock is held for the duration of the scope
 *     })
 *   )
 *   // write lock is released
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const writeLock: (self: TxReentrantLock) => Effect.Effect<number, never, Scope.Scope>;
/**
 * Runs the provided effect while holding a read lock. The lock is automatically
 * released after the effect completes, fails, or is interrupted.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const result = yield* TxReentrantLock.withReadLock(
 *     lock,
 *     Effect.succeed("read data")
 *   )
 *   console.log(result) // "read data"
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const withReadLock: {
    /**
     * Runs the provided effect while holding a read lock. The lock is automatically
     * released after the effect completes, fails, or is interrupted.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withReadLock(
     *     lock,
     *     Effect.succeed("read data")
     *   )
     *   console.log(result) // "read data"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>): (self: TxReentrantLock) => Effect.Effect<A, E, R>;
    /**
     * Runs the provided effect while holding a read lock. The lock is automatically
     * released after the effect completes, fails, or is interrupted.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withReadLock(
     *     lock,
     *     Effect.succeed("read data")
     *   )
     *   console.log(result) // "read data"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(self: TxReentrantLock, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Runs the provided effect while holding a write lock. The lock is automatically
 * released after the effect completes, fails, or is interrupted.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const result = yield* TxReentrantLock.withWriteLock(
 *     lock,
 *     Effect.succeed("wrote data")
 *   )
 *   console.log(result) // "wrote data"
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const withWriteLock: {
    /**
     * Runs the provided effect while holding a write lock. The lock is automatically
     * released after the effect completes, fails, or is interrupted.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withWriteLock(
     *     lock,
     *     Effect.succeed("wrote data")
     *   )
     *   console.log(result) // "wrote data"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>): (self: TxReentrantLock) => Effect.Effect<A, E, R>;
    /**
     * Runs the provided effect while holding a write lock. The lock is automatically
     * released after the effect completes, fails, or is interrupted.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withWriteLock(
     *     lock,
     *     Effect.succeed("wrote data")
     *   )
     *   console.log(result) // "wrote data"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(self: TxReentrantLock, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Alias for `withWriteLock`. Runs the provided effect while holding a write lock.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const result = yield* TxReentrantLock.withLock(
 *     lock,
 *     Effect.succeed("exclusive operation")
 *   )
 *   console.log(result) // "exclusive operation"
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const withLock: {
    /**
     * Alias for `withWriteLock`. Runs the provided effect while holding a write lock.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withLock(
     *     lock,
     *     Effect.succeed("exclusive operation")
     *   )
     *   console.log(result) // "exclusive operation"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>): (self: TxReentrantLock) => Effect.Effect<A, E, R>;
    /**
     * Alias for `withWriteLock`. Runs the provided effect while holding a write lock.
     *
     * @example
     * ```ts
     * import { Effect, TxReentrantLock } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const lock = yield* TxReentrantLock.make()
     *   const result = yield* TxReentrantLock.withLock(
     *     lock,
     *     Effect.succeed("exclusive operation")
     *   )
     *   console.log(result) // "exclusive operation"
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A, E, R>(self: TxReentrantLock, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Returns the total number of read locks held across all fibers.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   yield* TxReentrantLock.acquireRead(lock)
 *   const count = yield* TxReentrantLock.readLocks(lock)
 *   console.log(count) // 1
 *   yield* TxReentrantLock.releaseRead(lock)
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const readLocks: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Returns the number of write locks held (0 or the reentrant count).
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const count = yield* TxReentrantLock.writeLocks(lock)
 *   console.log(count) // 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const writeLocks: (self: TxReentrantLock) => Effect.Effect<number>;
/**
 * Checks if the lock is held by any fiber (read or write).
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const isLocked = yield* TxReentrantLock.locked(lock)
 *   console.log(isLocked) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const locked: (self: TxReentrantLock) => Effect.Effect<boolean>;
/**
 * Checks if any fiber holds a read lock.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const isReadLocked = yield* TxReentrantLock.readLocked(lock)
 *   console.log(isReadLocked) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const readLocked: (self: TxReentrantLock) => Effect.Effect<boolean>;
/**
 * Checks if any fiber holds a write lock.
 *
 * @example
 * ```ts
 * import { Effect, TxReentrantLock } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const lock = yield* TxReentrantLock.make()
 *   const isWriteLocked = yield* TxReentrantLock.writeLocked(lock)
 *   console.log(isWriteLocked) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const writeLocked: (self: TxReentrantLock) => Effect.Effect<boolean>;
/**
 * Checks if the given value is a TxReentrantLock.
 *
 * @example
 * ```ts
 * import { TxReentrantLock } from "effect"
 *
 * declare const someValue: unknown
 *
 * if (TxReentrantLock.isTxReentrantLock(someValue)) {
 *   console.log("This is a TxReentrantLock")
 * }
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isTxReentrantLock: (u: unknown) => u is TxReentrantLock;
export {};
//# sourceMappingURL=TxReentrantLock.d.ts.map