import * as Deferred from "./Deferred.ts";
import * as Effect from "./Effect.ts";
import * as Fiber from "./Fiber.ts";
import type * as Inspectable from "./Inspectable.ts";
import * as Option from "./Option.ts";
import type { Pipeable } from "./Pipeable.ts";
import type { Scheduler } from "./Scheduler.ts";
import type * as Scope from "./Scope.ts";
declare const TypeId = "~effect/FiberHandle";
/**
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   // Create a FiberHandle that can hold fibers producing strings
 *   const handle = yield* FiberHandle.make<string, never>()
 *
 *   // The handle can store and manage a single fiber
 *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface FiberHandle<out A = unknown, out E = unknown> extends Pipeable, Inspectable.Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly deferred: Deferred.Deferred<void, unknown>;
    state: {
        readonly _tag: "Open";
        fiber: Fiber.Fiber<A, E> | undefined;
    } | {
        readonly _tag: "Closed";
    };
}
/**
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   console.log(FiberHandle.isFiberHandle(handle)) // true
 *   console.log(FiberHandle.isFiberHandle("not a handle")) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category refinements
 */
export declare const isFiberHandle: (u: unknown) => u is FiberHandle;
/**
 * A FiberHandle can be used to store a single fiber.
 * When the associated Scope is closed, the contained fiber will be interrupted.
 *
 * You can add a fiber to the handle using `FiberHandle.run`, and the fiber will
 * be automatically removed from the FiberHandle when it completes.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // run some effects
 *   yield* FiberHandle.run(handle, Effect.never)
 *   // this will interrupt the previous fiber
 *   yield* FiberHandle.run(handle, Effect.never)
 *
 *   yield* Effect.sleep(1000)
 * }).pipe(
 *   Effect.scoped // The fiber will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A = unknown, E = unknown>() => Effect.Effect<FiberHandle<A, E>, never, Scope.Scope>;
/**
 * Create an Effect run function that is backed by a FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const run = yield* FiberHandle.makeRuntime<never>()
 *
 *   // Run effects and get fibers back
 *   const fiberA = run(Effect.succeed("first"))
 *   const fiberB = run(Effect.succeed("second"))
 *
 *   // The second fiber will interrupt the first
 *   const resultA = yield* Fiber.await(fiberA)
 *   const resultB = yield* Fiber.await(fiberB)
 * }).pipe(Effect.scoped)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const makeRuntime: <R, E = unknown, A = unknown>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly scheduler?: Scheduler | undefined;
    readonly onlyIfMissing?: boolean | undefined;
    readonly propagateInterruption?: boolean | undefined;
} | undefined) => Fiber.Fiber<XA, XE>), never, Scope.Scope | R>;
/**
 * Create an Effect run function that is backed by a FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const run = yield* FiberHandle.makeRuntimePromise()
 *
 *   // Run effects and get promises back
 *   const promise = run(Effect.succeed("hello"))
 *   const result = yield* Effect.promise(() => promise)
 *   console.log(result) // "hello"
 * }).pipe(Effect.scoped)
 * ```
 *
 * @since 3.13.0
 * @category constructors
 */
export declare const makeRuntimePromise: <R = never, A = unknown, E = unknown>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly scheduler?: Scheduler | undefined;
    readonly onlyIfMissing?: boolean | undefined;
    readonly propagateInterruption?: boolean | undefined;
} | undefined) => Promise<XA>), never, Scope.Scope | R>;
/**
 * Set the fiber in a FiberHandle. When the fiber completes, it will be removed from the FiberHandle.
 * If a fiber is already running, it will be interrupted unless `options.onlyIfMissing` is set.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const fiber = Effect.runFork(Effect.succeed("hello"))
 *
 *   // Set the fiber directly (unsafe)
 *   FiberHandle.setUnsafe(handle, fiber)
 *
 *   // The fiber is now managed by the handle
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const setUnsafe: {
    /**
     * Set the fiber in a FiberHandle. When the fiber completes, it will be removed from the FiberHandle.
     * If a fiber is already running, it will be interrupted unless `options.onlyIfMissing` is set.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *   const fiber = Effect.runFork(Effect.succeed("hello"))
     *
     *   // Set the fiber directly (unsafe)
     *   FiberHandle.setUnsafe(handle, fiber)
     *
     *   // The fiber is now managed by the handle
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly onlyIfMissing?: boolean | undefined;
        readonly propagateInterruption?: boolean | undefined;
    }): (self: FiberHandle<A, E>) => void;
    /**
     * Set the fiber in a FiberHandle. When the fiber completes, it will be removed from the FiberHandle.
     * If a fiber is already running, it will be interrupted unless `options.onlyIfMissing` is set.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *   const fiber = Effect.runFork(Effect.succeed("hello"))
     *
     *   // Set the fiber directly (unsafe)
     *   FiberHandle.setUnsafe(handle, fiber)
     *
     *   // The fiber is now managed by the handle
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(self: FiberHandle<A, E>, fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly onlyIfMissing?: boolean | undefined;
        readonly propagateInterruption?: boolean | undefined;
    }): void;
};
/**
 * Set the fiber in the `FiberHandle`. When the fiber completes, it will be
 * removed from the `FiberHandle`.
 *
 * If a fiber already exists in the `FiberHandle`, it will be interrupted
 * unless `options.onlyIfMissing` is set.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const fiber = Effect.runFork(Effect.succeed("hello"))
 *
 *   // Set the fiber safely
 *   yield* FiberHandle.set(handle, fiber)
 *
 *   // The fiber is now managed by the handle
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const set: {
    /**
     * Set the fiber in the `FiberHandle`. When the fiber completes, it will be
     * removed from the `FiberHandle`.
     *
     * If a fiber already exists in the `FiberHandle`, it will be interrupted
     * unless `options.onlyIfMissing` is set.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *   const fiber = Effect.runFork(Effect.succeed("hello"))
     *
     *   // Set the fiber safely
     *   yield* FiberHandle.set(handle, fiber)
     *
     *   // The fiber is now managed by the handle
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly onlyIfMissing?: boolean;
        readonly propagateInterruption?: boolean | undefined;
    }): (self: FiberHandle<A, E>) => Effect.Effect<void>;
    /**
     * Set the fiber in the `FiberHandle`. When the fiber completes, it will be
     * removed from the `FiberHandle`.
     *
     * If a fiber already exists in the `FiberHandle`, it will be interrupted
     * unless `options.onlyIfMissing` is set.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *   const fiber = Effect.runFork(Effect.succeed("hello"))
     *
     *   // Set the fiber safely
     *   yield* FiberHandle.set(handle, fiber)
     *
     *   // The fiber is now managed by the handle
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, XE extends E, XA extends A>(self: FiberHandle<A, E>, fiber: Fiber.Fiber<XA, XE>, options?: {
        readonly onlyIfMissing?: boolean;
        readonly propagateInterruption?: boolean | undefined;
    }): Effect.Effect<void>;
};
/**
 * Retrieve the fiber from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // No fiber initially
 *   const emptyFiber = FiberHandle.getUnsafe(handle)
 *   console.log(emptyFiber._tag === "None") // true
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber._tag === "Some") // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare function getUnsafe<A, E>(self: FiberHandle<A, E>): Option.Option<Fiber.Fiber<A, E>>;
/**
 * Retrieve the fiber from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *
 *   // Get the current fiber if present
 *   const fiber = yield* FiberHandle.get(handle)
 *   if (fiber._tag === "Some") {
 *     const result = yield* Fiber.await(fiber.value)
 *     console.log(result) // "hello"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare function get<A, E>(self: FiberHandle<A, E>): Effect.Effect<Option.Option<Fiber.Fiber<A, E>>>;
/**
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.never)
 *
 *   // Clear the handle, interrupting the fiber
 *   yield* FiberHandle.clear(handle)
 *
 *   // The handle is now empty
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber) // Option.none()
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const clear: <A, E>(self: FiberHandle<A, E>) => Effect.Effect<void>;
/**
 * Run an Effect and add the forked fiber to the FiberHandle.
 * When the fiber completes, it will be removed from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Run an effect and get the fiber
 *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 *
 *   // Running another effect will interrupt the previous one
 *   const fiber2 = yield* FiberHandle.run(handle, Effect.succeed("world"))
 *   const result2 = yield* Fiber.await(fiber2)
 *   console.log(result2) // "world"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const run: {
    /**
     * Run an Effect and add the forked fiber to the FiberHandle.
     * When the fiber completes, it will be removed from the FiberHandle.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *
     *   // Run an effect and get the fiber
     *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     *
     *   // Running another effect will interrupt the previous one
     *   const fiber2 = yield* FiberHandle.run(handle, Effect.succeed("world"))
     *   const result2 = yield* Fiber.await(fiber2)
     *   console.log(result2) // "world"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E>(self: FiberHandle<A, E>, options?: {
        readonly onlyIfMissing?: boolean;
        readonly propagateInterruption?: boolean | undefined;
        readonly startImmediately?: boolean | undefined;
    }): <R, XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>) => Effect.Effect<Fiber.Fiber<XA, XE>, never, R>;
    /**
     * Run an Effect and add the forked fiber to the FiberHandle.
     * When the fiber completes, it will be removed from the FiberHandle.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, FiberHandle } from "effect"
     *
     * Effect.gen(function*() {
     *   const handle = yield* FiberHandle.make()
     *
     *   // Run an effect and get the fiber
     *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
     *   const result = yield* Fiber.await(fiber)
     *   console.log(result) // "hello"
     *
     *   // Running another effect will interrupt the previous one
     *   const fiber2 = yield* FiberHandle.run(handle, Effect.succeed("world"))
     *   const result2 = yield* Fiber.await(fiber2)
     *   console.log(result2) // "world"
     * })
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, E, R, XE extends E, XA extends A>(self: FiberHandle<A, E>, effect: Effect.Effect<XA, XE, R>, options?: {
        readonly onlyIfMissing?: boolean;
        readonly propagateInterruption?: boolean | undefined;
        readonly startImmediately?: boolean | undefined;
    }): Effect.Effect<Fiber.Fiber<XA, XE>, never, R>;
};
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle, Context } from "effect"
 *
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = Context.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const run = yield* FiberHandle.runtime(handle)<Users>()
 *
 *   // run an effect and set the fiber in the handle
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 *
 *   // this will interrupt the previous fiber
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fiber will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const runtime: <A, E>(self: FiberHandle<A, E>) => <R = never>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly scheduler?: Scheduler | undefined;
    readonly onlyIfMissing?: boolean | undefined;
    readonly propagateInterruption?: boolean | undefined;
} | undefined) => Fiber.Fiber<XA, XE>), never, R>;
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.
 *
 * The returned run function will return Promise's that will resolve when the
 * fiber completes.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const runPromise = yield* FiberHandle.runtimePromise(handle)<never>()
 *
 *   // Run an effect and get a promise
 *   const promise = runPromise(Effect.succeed("hello"))
 *   const result = yield* Effect.promise(() => promise)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export declare const runtimePromise: <A, E>(self: FiberHandle<A, E>) => <R = never>() => Effect.Effect<(<XE extends E, XA extends A>(effect: Effect.Effect<XA, XE, R>, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly scheduler?: Scheduler | undefined;
    readonly onlyIfMissing?: boolean | undefined;
    readonly propagateInterruption?: boolean | undefined;
} | undefined) => Promise<XA>), never, R>;
/**
 * If any of the Fiber's in the handle terminate with a failure,
 * the returned Effect will terminate with the first failure that occurred.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   yield* FiberHandle.set(handle, Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberHandle.join(handle)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const join: <A, E>(self: FiberHandle<A, E>) => Effect.Effect<void, E>;
/**
 * Wait for the fiber in the FiberHandle to complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Start a long-running effect
 *   yield* FiberHandle.run(handle, Effect.sleep(1000))
 *
 *   // Wait for the fiber to complete
 *   yield* FiberHandle.awaitEmpty(handle)
 *
 *   console.log("Fiber completed")
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export declare const awaitEmpty: <A, E>(self: FiberHandle<A, E>) => Effect.Effect<void, E>;
export {};
//# sourceMappingURL=FiberHandle.d.ts.map