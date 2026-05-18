import * as Deferred from "./Deferred.ts";
import * as Effect from "./Effect.ts";
import * as Fiber from "./Fiber.ts";
import type * as Inspectable from "./Inspectable.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Scope from "./Scope.ts";
declare const TypeId = "~effect/FiberSet";
/**
 * A FiberSet is a collection of fibers that can be managed together.
 * When the associated Scope is closed, all fibers in the set will be interrupted.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make<string, string>()
 *
 *   // Add fibers to the set
 *   yield* FiberSet.run(set, Effect.succeed("hello"))
 *   yield* FiberSet.run(set, Effect.succeed("world"))
 *
 *   // Wait for all fibers to complete
 *   yield* FiberSet.awaitEmpty(set)
 * })
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface FiberSet<out A = unknown, out E = unknown> extends Pipeable, Inspectable.Inspectable, Iterable<Fiber.Fiber<A, E>> {
    readonly [TypeId]: typeof TypeId;
    readonly deferred: Deferred.Deferred<void, unknown>;
    state: {
        readonly _tag: "Open";
        readonly backing: Set<Fiber.Fiber<A, E>>;
    } | {
        readonly _tag: "Closed";
    };
}
/**
 * Checks if a value is a FiberSet.
 *
 * @since 2.0.0
 * @category refinements
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   console.log(FiberSet.isFiberSet(set)) // true
 *   console.log(FiberSet.isFiberSet({})) // false
 * })
 * ```
 */
export declare const isFiberSet: (u: unknown) => u is FiberSet<unknown, unknown>;
/**
 * A FiberSet can be used to store a collection of fibers.
 * When the associated Scope is closed, all fibers in the set will be interrupted.
 *
 * You can add fibers to the set using `FiberSet.add` or `FiberSet.run`, and the fibers will
 * be automatically removed from the FiberSet when they complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // run some effects and add the fibers to the set
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   yield* Effect.sleep(1000)
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A = unknown, E = unknown>() => Effect.Effect<FiberSet<A, E>, never, Scope.Scope>;
/**
 * Create an Effect run function that is backed by a FiberSet.
 *
 * @since 2.0.0
 * @category constructors
 * @example
 * ```ts
 * import { Effect, Fiber, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const runFork = yield* FiberSet.makeRuntime()
 *
 *   // Fork effects using the runtime
 *   const fiber1 = runFork(Effect.succeed("hello"))
 *   const fiber2 = runFork(Effect.succeed("world"))
 *
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 */
export declare const makeRuntime: <R = never, A = unknown, E = unknown>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: (Effect.RunOptions & {
    readonly propagateInterruption?: boolean | undefined;
}) | undefined) => Fiber.Fiber<XA, XE>), never, Scope.Scope | R>;
/**
 * Create an Effect run function that is backed by a FiberSet.
 * The returned run function will return Promise's.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const runPromise = yield* FiberSet.makeRuntimePromise()
 *
 *   // Run effects as promises
 *   const promise1 = runPromise(Effect.succeed("hello"))
 *   const promise2 = runPromise(Effect.succeed("world"))
 *
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 *
 * @since 3.13.0
 * @category constructors
 */
export declare const makeRuntimePromise: <R = never, A = unknown, E = unknown>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: (Effect.RunOptions & {
    readonly propagateInterruption?: boolean | undefined;
}) | undefined) => Promise<XA>), never, R | Scope.Scope>;
/**
 * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
 * This is the unsafe version that doesn't return an Effect.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
 *
 *   // Unsafe add - doesn't return an Effect
 *   FiberSet.addUnsafe(set, fiber)
 *
 *   // The fiber is now managed by the set
 *   console.log(yield* FiberSet.size(set)) // 1
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const addUnsafe: {
    /**
     * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
     * This is the unsafe version that doesn't return an Effect.
     *
     * @example
     * ```ts
     * import { Effect, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
     *
     *   // Unsafe add - doesn't return an Effect
     *   FiberSet.addUnsafe(set, fiber)
     *
     *   // The fiber is now managed by the set
     *   console.log(yield* FiberSet.size(set)) // 1
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly propagateInterruption?: boolean | undefined;
    } | undefined): (self: FiberSet<A, E>) => void;
    /**
     * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
     * This is the unsafe version that doesn't return an Effect.
     *
     * @example
     * ```ts
     * import { Effect, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
     *
     *   // Unsafe add - doesn't return an Effect
     *   FiberSet.addUnsafe(set, fiber)
     *
     *   // The fiber is now managed by the set
     *   console.log(yield* FiberSet.size(set)) // 1
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(self: FiberSet<A, E>, fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly propagateInterruption?: boolean | undefined;
    } | undefined): void;
};
/**
 * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
 *
 *   // Add the fiber to the set
 *   yield* FiberSet.add(set, fiber)
 *
 *   // The fiber is now managed by the set
 *   console.log(yield* FiberSet.size(set)) // 1
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const add: {
    /**
     * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
     *
     * @example
     * ```ts
     * import { Effect, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
     *
     *   // Add the fiber to the set
     *   yield* FiberSet.add(set, fiber)
     *
     *   // The fiber is now managed by the set
     *   console.log(yield* FiberSet.size(set)) // 1
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly propagateInterruption?: boolean | undefined;
    } | undefined): (self: FiberSet<A, E>) => Effect.Effect<void>;
    /**
     * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
     *
     * @example
     * ```ts
     * import { Effect, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
     *
     *   // Add the fiber to the set
     *   yield* FiberSet.add(set, fiber)
     *
     *   // The fiber is now managed by the set
     *   console.log(yield* FiberSet.size(set)) // 1
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(self: FiberSet<A, E>, fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly propagateInterruption?: boolean | undefined;
    } | undefined): Effect.Effect<void>;
};
/**
 * Interrupt all fibers in the FiberSet and clear the set.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Add some fibers
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   console.log(yield* FiberSet.size(set)) // 2
 *
 *   // Clear all fibers
 *   yield* FiberSet.clear(set)
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const clear: <A, E>(self: FiberSet<A, E>) => Effect.Effect<void>;
/**
 * Fork an Effect and add the forked fiber to the FiberSet.
 * When the fiber completes, it will be removed from the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Fork and add to set
 *   const fiber1 = yield* FiberSet.run(set, Effect.succeed("hello"))
 *   const fiber2 = yield* FiberSet.run(set, Effect.succeed("world"))
 *
 *   // Get results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const run: {
    /**
     * Fork an Effect and add the forked fiber to the FiberSet.
     * When the fiber completes, it will be removed from the FiberSet.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *
     *   // Fork and add to set
     *   const fiber1 = yield* FiberSet.run(set, Effect.succeed("hello"))
     *   const fiber2 = yield* FiberSet.run(set, Effect.succeed("world"))
     *
     *   // Get results
     *   const result1 = yield* Fiber.await(fiber1)
     *   const result2 = yield* Fiber.await(fiber2)
     *
     *   console.log(result1, result2) // "hello" "world"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E>(self: FiberSet<A, E>, options?: {
        readonly propagateInterruption?: boolean | undefined;
        readonly startImmediately?: boolean | undefined;
    } | undefined): <R, XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>) => Effect.Effect<Fiber.Fiber<XA, XE>, never, R>;
    /**
     * Fork an Effect and add the forked fiber to the FiberSet.
     * When the fiber completes, it will be removed from the FiberSet.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberSet } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const set = yield* FiberSet.make()
     *
     *   // Fork and add to set
     *   const fiber1 = yield* FiberSet.run(set, Effect.succeed("hello"))
     *   const fiber2 = yield* FiberSet.run(set, Effect.succeed("world"))
     *
     *   // Get results
     *   const result1 = yield* Fiber.await(fiber1)
     *   const result2 = yield* Fiber.await(fiber2)
     *
     *   console.log(result1, result2) // "hello" "world"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, R, XE extends E, XA extends A>(self: FiberSet<A, E>, effect: Effect.Effect<XA, XE, R>, options?: {
        readonly propagateInterruption?: boolean | undefined;
        readonly startImmediately?: boolean | undefined;
    } | undefined): Effect.Effect<Fiber.Fiber<XA, XE>, never, R>;
};
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet, Context } from "effect"
 *
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = Context.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const run = yield* FiberSet.runtime(set)<Users>()
 *
 *   // run some effects and add the fibers to the set
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const runtime: <A, E>(self: FiberSet<A, E>) => <R = never>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: Effect.RunOptions & {
    readonly propagateInterruption?: boolean | undefined;
} | undefined) => Fiber.Fiber<XA, XE>), never, R>;
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.
 *
 * The returned run function will return Promise's.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const runPromise = yield* FiberSet.runtimePromise(set)()
 *
 *   // Run effects as promises
 *   const promise1 = runPromise(Effect.succeed("hello"))
 *   const promise2 = runPromise(Effect.succeed("world"))
 *
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export declare const runtimePromise: <A, E>(self: FiberSet<A, E>) => <R = never>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: (Effect.RunOptions & {
    readonly propagateInterruption?: boolean | undefined;
}) | undefined) => Promise<XA>), never, R>;
/**
 * Get the number of fibers currently in the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 *
 *   // Add some fibers
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   console.log(yield* FiberSet.size(set)) // 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const size: <A, E>(self: FiberSet<A, E>) => Effect.Effect<number>;
/**
 * Join all fibers in the FiberSet. If any of the Fiber's in the set terminate with a failure,
 * the returned Effect will terminate with the first failure that occurred.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   yield* FiberSet.add(set, Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberSet.join(set)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const join: <A, E>(self: FiberSet<A, E>) => Effect.Effect<void, E>;
/**
 * Wait until the fiber set is empty.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Add some fibers that will complete
 *   yield* FiberSet.run(set, Effect.sleep(100))
 *   yield* FiberSet.run(set, Effect.sleep(200))
 *
 *   // Wait for all fibers to complete
 *   yield* FiberSet.awaitEmpty(set)
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export declare const awaitEmpty: <A, E>(self: FiberSet<A, E>) => Effect.Effect<void>;
export {};
//# sourceMappingURL=FiberSet.d.ts.map