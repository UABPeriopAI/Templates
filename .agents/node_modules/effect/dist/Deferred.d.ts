/**
 * This module provides utilities for working with `Deferred`, a powerful concurrency
 * primitive that represents an asynchronous variable that can be set exactly once.
 * Multiple fibers can await the same `Deferred` and will all be notified when it
 * completes.
 *
 * A `Deferred<A, E>` can be:
 * - **Completed successfully** with a value of type `A`
 * - **Failed** with an error of type `E`
 * - **Interrupted** if the fiber setting it is interrupted
 *
 * Key characteristics:
 * - **Single assignment**: Can only be completed once
 * - **Multiple waiters**: Many fibers can await the same `Deferred`
 * - **Fiber-safe**: Thread-safe operations across concurrent fibers
 * - **Composable**: Works seamlessly with other Effect operations
 *
 * @example
 * ```ts
 * import { Deferred, Effect, Fiber } from "effect"
 *
 * // Basic usage: coordinate between fibers
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<string, never>()
 *
 *   // Fiber 1: waits for the value
 *   const waiter = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       const value = yield* Deferred.await(deferred)
 *       console.log("Received:", value)
 *       return value
 *     })
 *   )
 *
 *   // Fiber 2: sets the value after a delay
 *   const setter = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("1 second")
 *       yield* Deferred.succeed(deferred, "Hello from setter!")
 *     })
 *   )
 *
 *   // Wait for both fibers
 *   yield* Fiber.join(waiter)
 *   yield* Fiber.join(setter)
 * })
 *
 * // Producer-consumer pattern
 * const producerConsumer = Effect.gen(function*() {
 *   const buffer = yield* Deferred.make<Array<number>, never>()
 *
 *   const producer = Effect.gen(function*() {
 *     const data = [1, 2, 3, 4, 5]
 *     yield* Deferred.succeed(buffer, data)
 *   })
 *
 *   const consumer = Effect.gen(function*() {
 *     const data = yield* Deferred.await(buffer)
 *     return data.reduce((sum, n) => sum + n, 0)
 *   })
 *
 *   const [, result] = yield* Effect.all([producer, consumer])
 *   return result // 15
 * })
 * ```
 *
 * @since 2.0.0
 */
import type * as Cause from "./Cause.ts";
import type { Effect } from "./Effect.ts";
import type * as Exit from "./Exit.ts";
import { type LazyArg } from "./Function.ts";
import * as Option from "./Option.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Types from "./Types.ts";
declare const TypeId = "~effect/Deferred";
/**
 * A `Deferred` represents an asynchronous variable that can be set exactly
 * once, with the ability for an arbitrary number of fibers to suspend (by
 * calling `Deferred.await`) and automatically resume when the variable is set.
 *
 * `Deferred` can be used for building primitive actions whose completions
 * require the coordinated action of multiple fibers, and for building
 * higher-level concurrent or asynchronous structures.
 *
 * @example
 * ```ts
 * import { Deferred, Effect, Fiber } from "effect"
 *
 * // Create and use a Deferred for inter-fiber communication
 * const program = Effect.gen(function*() {
 *   // Create a Deferred that will hold a string value
 *   const deferred: Deferred.Deferred<string> = yield* Deferred.make<string>()
 *
 *   // Fork a fiber that will set the deferred value
 *   const producer = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("100 millis")
 *       yield* Deferred.succeed(deferred, "Hello, World!")
 *     })
 *   )
 *
 *   // Fork a fiber that will await the deferred value
 *   const consumer = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       const value = yield* Deferred.await(deferred)
 *       console.log("Received:", value)
 *       return value
 *     })
 *   )
 *
 *   // Wait for both fibers to complete
 *   yield* Fiber.join(producer)
 *   const result = yield* Fiber.join(consumer)
 *   return result
 * })
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface Deferred<in out A, in out E = never> extends Deferred.Variance<A, E>, Pipeable {
    effect?: Effect<A, E>;
    resumes?: Array<(effect: Effect<A, E>) => void> | undefined;
}
/**
 * @since 2.0.0
 * @category Guards
 */
export declare const isDeferred: <A, E>(u: unknown) => u is Deferred<A, E>;
/**
 * @since 2.0.0
 * @category models
 */
export declare namespace Deferred {
    /**
     * @since 2.0.0
     * @category models
     */
    interface Variance<in out A, in out E> {
        readonly [TypeId]: {
            readonly _A: Types.Invariant<A>;
            readonly _E: Types.Invariant<E>;
        };
    }
}
/**
 * Unsafely creates a new `Deferred`
 *
 * @example
 * ```ts
 * import { Deferred } from "effect"
 *
 * const deferred = Deferred.makeUnsafe<number>()
 * console.log(deferred)
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const makeUnsafe: <A, E = never>() => Deferred<A, E>;
/**
 * Creates a new `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A, E = never>() => Effect<Deferred<A, E>>;
declare const _await: <A, E>(self: Deferred<A, E>) => Effect<A, E>;
export { 
/**
 * Retrieves the value of the `Deferred`, suspending the fiber running the
 * workflow until the result is available.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
_await as await };
/**
 * Completes the deferred with the result of the specified effect. If the
 * deferred has already been completed, the method will produce false.
 *
 * Note that `Deferred.completeWith` will be much faster, so consider using
 * that if you do not need to memoize the result of the specified effect.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const completed = yield* Deferred.complete(deferred, Effect.succeed(42))
 *   console.log(completed) // true
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const complete: {
    /**
     * Completes the deferred with the result of the specified effect. If the
     * deferred has already been completed, the method will produce false.
     *
     * Note that `Deferred.completeWith` will be much faster, so consider using
     * that if you do not need to memoize the result of the specified effect.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const completed = yield* Deferred.complete(deferred, Effect.succeed(42))
     *   console.log(completed) // true
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E, R>(effect: Effect<A, E, R>): (self: Deferred<A, E>) => Effect<boolean, never, R>;
    /**
     * Completes the deferred with the result of the specified effect. If the
     * deferred has already been completed, the method will produce false.
     *
     * Note that `Deferred.completeWith` will be much faster, so consider using
     * that if you do not need to memoize the result of the specified effect.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const completed = yield* Deferred.complete(deferred, Effect.succeed(42))
     *   console.log(completed) // true
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E, R>(self: Deferred<A, E>, effect: Effect<A, E, R>): Effect<boolean, never, R>;
};
/**
 * Completes the deferred with the result of the specified effect. If the
 * deferred has already been completed, the method will produce false.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const completed = yield* Deferred.completeWith(deferred, Effect.succeed(42))
 *   console.log(completed) // true
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const completeWith: {
    /**
     * Completes the deferred with the result of the specified effect. If the
     * deferred has already been completed, the method will produce false.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const completed = yield* Deferred.completeWith(deferred, Effect.succeed(42))
     *   console.log(completed) // true
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(effect: Effect<A, E>): (self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Completes the deferred with the result of the specified effect. If the
     * deferred has already been completed, the method will produce false.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const completed = yield* Deferred.completeWith(deferred, Effect.succeed(42))
     *   console.log(completed) // true
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, effect: Effect<A, E>): Effect<boolean>;
};
/**
 * Exits the `Deferred` with the specified `Exit` value, which will be
 * propagated to all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect, Exit } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.done(deferred, Exit.succeed(42))
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const done: {
    /**
     * Exits the `Deferred` with the specified `Exit` value, which will be
     * propagated to all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect, Exit } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.done(deferred, Exit.succeed(42))
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(exit: Exit.Exit<A, E>): (self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Exits the `Deferred` with the specified `Exit` value, which will be
     * propagated to all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect, Exit } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.done(deferred, Exit.succeed(42))
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, exit: Exit.Exit<A, E>): Effect<boolean>;
};
/**
 * Fails the `Deferred` with the specified error, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.fail(deferred, "Operation failed")
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const fail: {
    /**
     * Fails the `Deferred` with the specified error, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.fail(deferred, "Operation failed")
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <E>(error: E): <A>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Fails the `Deferred` with the specified error, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.fail(deferred, "Operation failed")
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, error: E): Effect<boolean>;
};
/**
 * Fails the `Deferred` with the specified error, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failSync(deferred, () => "Lazy error")
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const failSync: {
    /**
     * Fails the `Deferred` with the specified error, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failSync(deferred, () => "Lazy error")
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <E>(evaluate: LazyArg<E>): <A>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Fails the `Deferred` with the specified error, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failSync(deferred, () => "Lazy error")
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, evaluate: LazyArg<E>): Effect<boolean>;
};
/**
 * Fails the `Deferred` with the specified `Cause`, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Cause, Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failCause(
 *     deferred,
 *     Cause.fail("Operation failed")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const failCause: {
    /**
     * Fails the `Deferred` with the specified `Cause`, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Cause, Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failCause(
     *     deferred,
     *     Cause.fail("Operation failed")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <E>(cause: Cause.Cause<E>): <A>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Fails the `Deferred` with the specified `Cause`, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Cause, Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failCause(
     *     deferred,
     *     Cause.fail("Operation failed")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, cause: Cause.Cause<E>): Effect<boolean>;
};
/**
 * Fails the `Deferred` with the specified `Cause`, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Cause, Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failCauseSync(
 *     deferred,
 *     () => Cause.fail("Lazy error")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const failCauseSync: {
    /**
     * Fails the `Deferred` with the specified `Cause`, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Cause, Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failCauseSync(
     *     deferred,
     *     () => Cause.fail("Lazy error")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <E>(evaluate: LazyArg<Cause.Cause<E>>): <A>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Fails the `Deferred` with the specified `Cause`, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Cause, Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number, string>()
     *   const success = yield* Deferred.failCauseSync(
     *     deferred,
     *     () => Cause.fail("Lazy error")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, evaluate: LazyArg<Cause.Cause<E>>): Effect<boolean>;
};
/**
 * Kills the `Deferred` with the specified defect, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.die(
 *     deferred,
 *     new Error("Something went wrong")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const die: {
    /**
     * Kills the `Deferred` with the specified defect, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.die(
     *     deferred,
     *     new Error("Something went wrong")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    (defect: unknown): <A, E>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Kills the `Deferred` with the specified defect, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.die(
     *     deferred,
     *     new Error("Something went wrong")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, defect: unknown): Effect<boolean>;
};
/**
 * Kills the `Deferred` with the specified defect, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.dieSync(
 *     deferred,
 *     () => new Error("Lazy error")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const dieSync: {
    /**
     * Kills the `Deferred` with the specified defect, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.dieSync(
     *     deferred,
     *     () => new Error("Lazy error")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    (evaluate: LazyArg<unknown>): <A, E>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Kills the `Deferred` with the specified defect, which will be propagated to
     * all fibers waiting on the value of the `Deferred`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.dieSync(
     *     deferred,
     *     () => new Error("Lazy error")
     *   )
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, evaluate: LazyArg<unknown>): Effect<boolean>;
};
/**
 * Completes the `Deferred` with interruption. This will interrupt all fibers
 * waiting on the value of the `Deferred` with the `FiberId` of the fiber
 * calling this method.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.interrupt(deferred)
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const interrupt: <A, E>(self: Deferred<A, E>) => Effect<boolean>;
/**
 * Completes the `Deferred` with interruption. This will interrupt all fibers
 * waiting on the value of the `Deferred` with the specified `FiberId`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.interruptWith(deferred, 42)
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const interruptWith: {
    /**
     * Completes the `Deferred` with interruption. This will interrupt all fibers
     * waiting on the value of the `Deferred` with the specified `FiberId`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.interruptWith(deferred, 42)
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    (fiberId: number): <A, E>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Completes the `Deferred` with interruption. This will interrupt all fibers
     * waiting on the value of the `Deferred` with the specified `FiberId`.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   const success = yield* Deferred.interruptWith(deferred, 42)
     *   console.log(success) // true
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, fiberId: number): Effect<boolean>;
};
/**
 * Returns `true` if this `Deferred` has already been completed with a value or
 * an error, `false` otherwise.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const beforeCompletion = yield* Deferred.isDone(deferred)
 *   console.log(beforeCompletion) // false
 *
 *   yield* Deferred.succeed(deferred, 42)
 *   const afterCompletion = yield* Deferred.isDone(deferred)
 *   console.log(afterCompletion) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const isDone: <A, E>(self: Deferred<A, E>) => Effect<boolean>;
/**
 * Returns `true` if this `Deferred` has already been completed with a value or
 * an error, `false` otherwise.
 *
 * @since 2.0.0
 * @category getters
 */
export declare const isDoneUnsafe: <A, E>(self: Deferred<A, E>) => boolean;
/**
 * Returns the current completion effect as an `Option`. This returns
 * `Option.some(effect)` when the `Deferred` is completed, `Option.none()`
 * otherwise.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const beforeCompletion = yield* Deferred.poll(deferred)
 *   console.log(beforeCompletion._tag === "None") // true
 *
 *   yield* Deferred.succeed(deferred, 42)
 *   const afterCompletion = yield* Deferred.poll(deferred)
 *   console.log(afterCompletion._tag === "Some") // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare function poll<A, E>(self: Deferred<A, E>): Effect<Option.Option<Effect<A, E>>>;
/**
 * Completes the `Deferred` with the specified value.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const succeed: {
    /**
     * Completes the `Deferred` with the specified value.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.succeed(deferred, 42)
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A>(value: A): <E>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Completes the `Deferred` with the specified value.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.succeed(deferred, 42)
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, value: A): Effect<boolean>;
};
/**
 * Completes the `Deferred` with the specified lazily evaluated value.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.sync(deferred, () => 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const sync: {
    /**
     * Completes the `Deferred` with the specified lazily evaluated value.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.sync(deferred, () => 42)
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A>(evaluate: LazyArg<A>): <E>(self: Deferred<A, E>) => Effect<boolean>;
    /**
     * Completes the `Deferred` with the specified lazily evaluated value.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const deferred = yield* Deferred.make<number>()
     *   yield* Deferred.sync(deferred, () => 42)
     *
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value) // 42
     * })
     * ```
     *
     * @since 2.0.0
     * @category utils
     */
    <A, E>(self: Deferred<A, E>, evaluate: LazyArg<A>): Effect<boolean>;
};
/**
 * Unsafely exits the `Deferred` with the specified `Exit` value, which will be
 * propagated to all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const deferred = Deferred.makeUnsafe<number>()
 * const success = Deferred.doneUnsafe(deferred, Effect.succeed(42))
 * console.log(success) // true
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const doneUnsafe: <A, E>(self: Deferred<A, E>, effect: Effect<A, E>) => boolean;
/**
 * Converts an `Effect` into an operation that completes a `Deferred` with its result.
 *
 * **Details**
 *
 * The `into` function takes an effect and a `Deferred` and ensures that the `Deferred`
 * is completed based on the outcome of the effect. If the effect succeeds, the `Deferred` is
 * completed with the success value. If the effect fails, the `Deferred` is completed with the
 * failure. Additionally, if the effect is interrupted, the `Deferred` will also be interrupted.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * // Define an effect that succeeds
 * const successEffect = Effect.succeed(42)
 *
 * const program = Effect.gen(function*() {
 *   // Create a deferred
 *   const deferred = yield* Deferred.make<number, string>()
 *
 *   // Complete the deferred using the successEffect
 *   const isCompleted = yield* Deferred.into(successEffect, deferred)
 *
 *   // Access the value of the deferred
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value)
 *
 *   return isCompleted
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // 42
 * // true
 * ```
 *
 * @since 2.0.0
 * @category Synchronization Utilities
 */
export declare const into: {
    /**
     * Converts an `Effect` into an operation that completes a `Deferred` with its result.
     *
     * **Details**
     *
     * The `into` function takes an effect and a `Deferred` and ensures that the `Deferred`
     * is completed based on the outcome of the effect. If the effect succeeds, the `Deferred` is
     * completed with the success value. If the effect fails, the `Deferred` is completed with the
     * failure. Additionally, if the effect is interrupted, the `Deferred` will also be interrupted.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * // Define an effect that succeeds
     * const successEffect = Effect.succeed(42)
     *
     * const program = Effect.gen(function*() {
     *   // Create a deferred
     *   const deferred = yield* Deferred.make<number, string>()
     *
     *   // Complete the deferred using the successEffect
     *   const isCompleted = yield* Deferred.into(successEffect, deferred)
     *
     *   // Access the value of the deferred
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value)
     *
     *   return isCompleted
     * })
     *
     * Effect.runPromise(program).then(console.log)
     * // Output:
     * // 42
     * // true
     * ```
     *
     * @since 2.0.0
     * @category Synchronization Utilities
     */
    <A, E>(deferred: Deferred<A, E>): <R>(self: Effect<A, E, R>) => Effect<boolean, never, R>;
    /**
     * Converts an `Effect` into an operation that completes a `Deferred` with its result.
     *
     * **Details**
     *
     * The `into` function takes an effect and a `Deferred` and ensures that the `Deferred`
     * is completed based on the outcome of the effect. If the effect succeeds, the `Deferred` is
     * completed with the success value. If the effect fails, the `Deferred` is completed with the
     * failure. Additionally, if the effect is interrupted, the `Deferred` will also be interrupted.
     *
     * @example
     * ```ts
     * import { Deferred, Effect } from "effect"
     *
     * // Define an effect that succeeds
     * const successEffect = Effect.succeed(42)
     *
     * const program = Effect.gen(function*() {
     *   // Create a deferred
     *   const deferred = yield* Deferred.make<number, string>()
     *
     *   // Complete the deferred using the successEffect
     *   const isCompleted = yield* Deferred.into(successEffect, deferred)
     *
     *   // Access the value of the deferred
     *   const value = yield* Deferred.await(deferred)
     *   console.log(value)
     *
     *   return isCompleted
     * })
     *
     * Effect.runPromise(program).then(console.log)
     * // Output:
     * // 42
     * // true
     * ```
     *
     * @since 2.0.0
     * @category Synchronization Utilities
     */
    <A, E, R>(self: Effect<A, E, R>, deferred: Deferred<A, E>): Effect<boolean, never, R>;
};
//# sourceMappingURL=Deferred.d.ts.map