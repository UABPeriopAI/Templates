/**
 * @since 2.0.0
 */
import * as Effect from "./Effect.ts";
import * as Option from "./Option.ts";
import type { Pipeable } from "./Pipeable.ts";
import * as PubSub from "./PubSub.ts";
import * as Semaphore from "./Semaphore.ts";
import * as Stream from "./Stream.ts";
import type { Invariant } from "./Types.ts";
declare const TypeId = "~effect/SubscriptionRef";
/**
 * @since 2.0.0
 * @category models
 */
export interface SubscriptionRef<in out A> extends SubscriptionRef.Variance<A>, Pipeable {
    value: A;
    readonly semaphore: Semaphore.Semaphore;
    readonly pubsub: PubSub.PubSub<A>;
}
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isSubscriptionRef: (u: unknown) => u is SubscriptionRef<unknown>;
/**
 * The `SynchronizedRef` namespace containing type definitions and utilities.
 *
 * @since 2.0.0
 */
export declare namespace SubscriptionRef {
    /**
     * @since 2.0.0
     * @category models
     */
    interface Variance<in out A> {
        readonly [TypeId]: {
            readonly _A: Invariant<A>;
        };
    }
}
/**
 * Constructs a new `SubscriptionRef` from an initial value.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A>(value: A) => Effect.Effect<SubscriptionRef<A>>;
/**
 * Creates a stream that emits the current value and all subsequent changes to
 * the `SubscriptionRef`.
 *
 * The stream will first emit the current value, then emit all future changes
 * as they occur.
 *
 * @example
 * ```ts
 * import { Effect, Stream, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(0)
 *
 *   const stream = SubscriptionRef.changes(ref)
 *
 *   const fiber = yield* Stream.runForEach(
 *     stream,
 *     (value) => Effect.sync(() => console.log("Value:", value))
 *   ).pipe(Effect.forkScoped)
 *
 *   yield* SubscriptionRef.set(ref, 1)
 *   yield* SubscriptionRef.set(ref, 2)
 * })
 * ```
 *
 * @category changes
 * @since 2.0.0
 */
export declare const changes: <A>(self: SubscriptionRef<A>) => Stream.Stream<A>;
/**
 * Unsafely retrieves the current value of the `SubscriptionRef`.
 *
 * This function directly accesses the underlying reference without any
 * synchronization. It should only be used when you're certain there are no
 * concurrent modifications.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(42)
 *
 *   const value = SubscriptionRef.getUnsafe(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getUnsafe: <A>(self: SubscriptionRef<A>) => A;
/**
 * Retrieves the current value of the `SubscriptionRef`.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(42)
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const get: <A>(self: SubscriptionRef<A>) => Effect.Effect<A>;
/**
 * Atomically retrieves the current value and sets a new value, notifying
 * subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndSet(ref, 20)
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getAndSet: {
    /**
     * Atomically retrieves the current value and sets a new value, notifying
     * subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndSet(ref, 20)
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(value: A): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Atomically retrieves the current value and sets a new value, notifying
     * subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndSet(ref, 20)
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(self: SubscriptionRef<A>, value: A): Effect.Effect<A>;
};
/**
 * Atomically retrieves the current value and updates it with the result of
 * applying a function, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndUpdate(ref, (n) => n * 2)
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getAndUpdate: {
    /**
     * Atomically retrieves the current value and updates it with the result of
     * applying a function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdate(ref, (n) => n * 2)
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(update: (a: A) => A): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Atomically retrieves the current value and updates it with the result of
     * applying a function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdate(ref, (n) => n * 2)
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => A): Effect.Effect<A>;
};
/**
 * Atomically retrieves the current value and updates it with the result of
 * applying an effectful function, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndUpdateEffect(
 *     ref,
 *     (n) => Effect.succeed(n + 5)
 *   )
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getAndUpdateEffect: {
    /**
     * Atomically retrieves the current value and updates it with the result of
     * applying an effectful function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateEffect(
     *     ref,
     *     (n) => Effect.succeed(n + 5)
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A, E, R>(update: (a: A) => Effect.Effect<A, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<A, E, R>;
    /**
     * Atomically retrieves the current value and updates it with the result of
     * applying an effectful function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateEffect(
     *     ref,
     *     (n) => Effect.succeed(n + 5)
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A, E, R>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Atomically retrieves the current value and optionally updates it with the
 * result of applying a function that returns an `Option`, notifying
 * subscribers only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndUpdateSome(
 *     ref,
 *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
 *   )
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getAndUpdateSome: {
    /**
     * Atomically retrieves the current value and optionally updates it with the
     * result of applying a function that returns an `Option`, notifying
     * subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateSome(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(update: (a: A) => Option.Option<A>): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Atomically retrieves the current value and optionally updates it with the
     * result of applying a function that returns an `Option`, notifying
     * subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateSome(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => Option.Option<A>): Effect.Effect<A>;
};
/**
 * Atomically retrieves the current value and optionally updates it with the
 * result of applying an effectful function that returns an `Option`,
 * notifying subscribers only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const oldValue = yield* SubscriptionRef.getAndUpdateSomeEffect(
 *     ref,
 *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
 *   )
 *   console.log("Old value:", oldValue)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const getAndUpdateSomeEffect: {
    /**
     * Atomically retrieves the current value and optionally updates it with the
     * result of applying an effectful function that returns an `Option`,
     * notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateSomeEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A, R, E>(update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<A, E, R>;
    /**
     * Atomically retrieves the current value and optionally updates it with the
     * result of applying an effectful function that returns an `Option`,
     * notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const oldValue = yield* SubscriptionRef.getAndUpdateSomeEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *   console.log("Old value:", oldValue)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category getters
     */
    <A, R, E>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Atomically modifies the `SubscriptionRef` with a function that computes a
 * return value and a new value, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const result = yield* SubscriptionRef.modify(ref, (n) => [
 *     `Old value was ${n}`,
 *     n * 2
 *   ])
 *   console.log(result)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category modifications
 */
export declare const modify: {
    /**
     * Atomically modifies the `SubscriptionRef` with a function that computes a
     * return value and a new value, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modify(ref, (n) => [
     *     `Old value was ${n}`,
     *     n * 2
     *   ])
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B>(modify: (a: A) => readonly [B, A]): (self: SubscriptionRef<A>) => Effect.Effect<B>;
    /**
     * Atomically modifies the `SubscriptionRef` with a function that computes a
     * return value and a new value, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modify(ref, (n) => [
     *     `Old value was ${n}`,
     *     n * 2
     *   ])
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B>(self: SubscriptionRef<A>, f: (a: A) => readonly [B, A]): Effect.Effect<B>;
};
/**
 * Atomically modifies the `SubscriptionRef` with an effectful function that
 * computes a return value and a new value, notifying subscribers of the
 * change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const result = yield* SubscriptionRef.modifyEffect(
 *     ref,
 *     (n) => Effect.succeed([`Doubled from ${n}`, n * 2] as const)
 *   )
 *   console.log(result)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category modifications
 */
export declare const modifyEffect: {
    /**
     * Atomically modifies the `SubscriptionRef` with an effectful function that
     * computes a return value and a new value, notifying subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifyEffect(
     *     ref,
     *     (n) => Effect.succeed([`Doubled from ${n}`, n * 2] as const)
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <B, A, E, R>(modify: (a: A) => Effect.Effect<readonly [B, A], E, R>): (self: SubscriptionRef<A>) => Effect.Effect<B, E, R>;
    /**
     * Atomically modifies the `SubscriptionRef` with an effectful function that
     * computes a return value and a new value, notifying subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifyEffect(
     *     ref,
     *     (n) => Effect.succeed([`Doubled from ${n}`, n * 2] as const)
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B, E, R>(self: SubscriptionRef<A>, modify: (a: A) => Effect.Effect<readonly [B, A], E, R>): Effect.Effect<B, E, R>;
};
/**
 * Atomically modifies the `SubscriptionRef` with a function that computes a
 * return value and optionally a new value, notifying subscribers only if the
 * value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const result = yield* SubscriptionRef.modifySome(
 *     ref,
 *     (n) =>
 *       n > 5 ? ["Updated", Option.some(n * 2)] : ["Not updated", Option.none()]
 *   )
 *   console.log(result)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category modifications
 */
export declare const modifySome: {
    /**
     * Atomically modifies the `SubscriptionRef` with a function that computes a
     * return value and optionally a new value, notifying subscribers only if the
     * value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifySome(
     *     ref,
     *     (n) =>
     *       n > 5 ? ["Updated", Option.some(n * 2)] : ["Not updated", Option.none()]
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <B, A>(modify: (a: A) => readonly [B, Option.Option<A>]): (self: SubscriptionRef<A>) => Effect.Effect<B>;
    /**
     * Atomically modifies the `SubscriptionRef` with a function that computes a
     * return value and optionally a new value, notifying subscribers only if the
     * value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifySome(
     *     ref,
     *     (n) =>
     *       n > 5 ? ["Updated", Option.some(n * 2)] : ["Not updated", Option.none()]
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B>(self: SubscriptionRef<A>, modify: (a: A) => readonly [B, Option.Option<A>]): Effect.Effect<B>;
};
/**
 * Atomically modifies the `SubscriptionRef` with an effectful function that
 * computes a return value and optionally a new value, notifying subscribers
 * only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const result = yield* SubscriptionRef.modifySomeEffect(
 *     ref,
 *     (n) =>
 *       Effect.succeed(
 *         n > 5
 *           ? (["Updated", Option.some(n + 5)] as const)
 *           : (["Not updated", Option.none()] as const)
 *       )
 *   )
 *   console.log(result)
 *
 *   const newValue = yield* SubscriptionRef.get(ref)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category modifications
 */
export declare const modifySomeEffect: {
    /**
     * Atomically modifies the `SubscriptionRef` with an effectful function that
     * computes a return value and optionally a new value, notifying subscribers
     * only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifySomeEffect(
     *     ref,
     *     (n) =>
     *       Effect.succeed(
     *         n > 5
     *           ? (["Updated", Option.some(n + 5)] as const)
     *           : (["Not updated", Option.none()] as const)
     *       )
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B, R, E>(modify: (a: A) => Effect.Effect<readonly [B, Option.Option<A>], E, R>): (self: SubscriptionRef<A>) => Effect.Effect<B, E, R>;
    /**
     * Atomically modifies the `SubscriptionRef` with an effectful function that
     * computes a return value and optionally a new value, notifying subscribers
     * only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const result = yield* SubscriptionRef.modifySomeEffect(
     *     ref,
     *     (n) =>
     *       Effect.succeed(
     *         n > 5
     *           ? (["Updated", Option.some(n + 5)] as const)
     *           : (["Not updated", Option.none()] as const)
     *       )
     *   )
     *   console.log(result)
     *
     *   const newValue = yield* SubscriptionRef.get(ref)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category modifications
     */
    <A, B, R, E>(self: SubscriptionRef<A>, modify: (a: A) => Effect.Effect<readonly [B, Option.Option<A>], E, R>): Effect.Effect<B, E, R>;
};
/**
 * Sets the value of the `SubscriptionRef`, notifying all subscribers of the
 * change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(0)
 *
 *   yield* SubscriptionRef.set(ref, 42)
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category setters
 */
export declare const set: {
    /**
     * Sets the value of the `SubscriptionRef`, notifying all subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(0)
     *
     *   yield* SubscriptionRef.set(ref, 42)
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category setters
     */
    <A>(value: A): (self: SubscriptionRef<A>) => Effect.Effect<void>;
    /**
     * Sets the value of the `SubscriptionRef`, notifying all subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(0)
     *
     *   yield* SubscriptionRef.set(ref, 42)
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category setters
     */
    <A>(self: SubscriptionRef<A>, value: A): Effect.Effect<void>;
};
/**
 * Sets the value of the `SubscriptionRef` and returns the new value,
 * notifying all subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(0)
 *
 *   const newValue = yield* SubscriptionRef.setAndGet(ref, 42)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category setters
 */
export declare const setAndGet: {
    /**
     * Sets the value of the `SubscriptionRef` and returns the new value,
     * notifying all subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(0)
     *
     *   const newValue = yield* SubscriptionRef.setAndGet(ref, 42)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category setters
     */
    <A>(value: A): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Sets the value of the `SubscriptionRef` and returns the new value,
     * notifying all subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(0)
     *
     *   const newValue = yield* SubscriptionRef.setAndGet(ref, 42)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category setters
     */
    <A>(self: SubscriptionRef<A>, value: A): Effect.Effect<A>;
};
/**
 * Updates the value of the `SubscriptionRef` with the result of applying a
 * function, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   yield* SubscriptionRef.update(ref, (n) => n * 2)
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const update: {
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying a
     * function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.update(ref, (n) => n * 2)
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(update: (a: A) => A): (self: SubscriptionRef<A>) => Effect.Effect<void>;
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying a
     * function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.update(ref, (n) => n * 2)
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => A): Effect.Effect<void>;
};
/**
 * Updates the value of the `SubscriptionRef` with the result of applying an
 * effectful function, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   yield* SubscriptionRef.updateEffect(ref, (n) => Effect.succeed(n + 5))
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateEffect: {
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying an
     * effectful function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateEffect(ref, (n) => Effect.succeed(n + 5))
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(update: (a: A) => Effect.Effect<A, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<void, E, R>;
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying an
     * effectful function, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateEffect(ref, (n) => Effect.succeed(n + 5))
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<void, E, R>;
};
/**
 * Updates the value of the `SubscriptionRef` with the result of applying a
 * function and returns the new value, notifying subscribers of the change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const newValue = yield* SubscriptionRef.updateAndGet(ref, (n) => n * 2)
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateAndGet: {
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying a
     * function and returns the new value, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateAndGet(ref, (n) => n * 2)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(update: (a: A) => A): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying a
     * function and returns the new value, notifying subscribers of the change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateAndGet(ref, (n) => n * 2)
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => A): Effect.Effect<A>;
};
/**
 * Updates the value of the `SubscriptionRef` with the result of applying an
 * effectful function and returns the new value, notifying subscribers of the
 * change.
 *
 * @example
 * ```ts
 * import { Effect, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const newValue = yield* SubscriptionRef.updateAndGetEffect(
 *     ref,
 *     (n) => Effect.succeed(n + 5)
 *   )
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateAndGetEffect: {
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying an
     * effectful function and returns the new value, notifying subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateAndGetEffect(
     *     ref,
     *     (n) => Effect.succeed(n + 5)
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(update: (a: A) => Effect.Effect<A, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<A, E, R>;
    /**
     * Updates the value of the `SubscriptionRef` with the result of applying an
     * effectful function and returns the new value, notifying subscribers of the
     * change.
     *
     * @example
     * ```ts
     * import { Effect, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateAndGetEffect(
     *     ref,
     *     (n) => Effect.succeed(n + 5)
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * Optionally updates the value of the `SubscriptionRef` with the result of
 * applying a function that returns an `Option`, notifying subscribers only if
 * the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   yield* SubscriptionRef.updateSome(
 *     ref,
 *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
 *   )
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateSome: {
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying a function that returns an `Option`, notifying subscribers only if
     * the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateSome(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(update: (a: A) => Option.Option<A>): (self: SubscriptionRef<A>) => Effect.Effect<void>;
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying a function that returns an `Option`, notifying subscribers only if
     * the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateSome(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => Option.Option<A>): Effect.Effect<void>;
};
/**
 * Optionally updates the value of the `SubscriptionRef` with the result of
 * applying an effectful function that returns an `Option`, notifying
 * subscribers only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   yield* SubscriptionRef.updateSomeEffect(
 *     ref,
 *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
 *   )
 *
 *   const value = yield* SubscriptionRef.get(ref)
 *   console.log(value)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateSomeEffect: {
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying an effectful function that returns an `Option`, notifying
     * subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateSomeEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<void, E, R>;
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying an effectful function that returns an `Option`, notifying
     * subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   yield* SubscriptionRef.updateSomeEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *
     *   const value = yield* SubscriptionRef.get(ref)
     *   console.log(value)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<void, E, R>;
};
/**
 * Optionally updates the value of the `SubscriptionRef` with the result of
 * applying a function that returns an `Option` and returns the new value,
 * notifying subscribers only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const newValue = yield* SubscriptionRef.updateSomeAndGet(
 *     ref,
 *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
 *   )
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateSomeAndGet: {
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying a function that returns an `Option` and returns the new value,
     * notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateSomeAndGet(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(update: (a: A) => Option.Option<A>): (self: SubscriptionRef<A>) => Effect.Effect<A>;
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying a function that returns an `Option` and returns the new value,
     * notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateSomeAndGet(
     *     ref,
     *     (n) => n > 5 ? Option.some(n * 2) : Option.none()
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A>(self: SubscriptionRef<A>, update: (a: A) => Option.Option<A>): Effect.Effect<A>;
};
/**
 * Optionally updates the value of the `SubscriptionRef` with the result of
 * applying an effectful function that returns an `Option` and returns the new
 * value, notifying subscribers only if the value changes.
 *
 * @example
 * ```ts
 * import { Effect, Option, SubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* SubscriptionRef.make(10)
 *
 *   const newValue = yield* SubscriptionRef.updateSomeAndGetEffect(
 *     ref,
 *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
 *   )
 *   console.log("New value:", newValue)
 * })
 * ```
 *
 * @since 2.0.0
 * @category updating
 */
export declare const updateSomeAndGetEffect: {
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying an effectful function that returns an `Option` and returns the new
     * value, notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateSomeAndGetEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SubscriptionRef<A>) => Effect.Effect<A, E, R>;
    /**
     * Optionally updates the value of the `SubscriptionRef` with the result of
     * applying an effectful function that returns an `Option` and returns the new
     * value, notifying subscribers only if the value changes.
     *
     * @example
     * ```ts
     * import { Effect, Option, SubscriptionRef } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const ref = yield* SubscriptionRef.make(10)
     *
     *   const newValue = yield* SubscriptionRef.updateSomeAndGetEffect(
     *     ref,
     *     (n) => Effect.succeed(n > 5 ? Option.some(n + 3) : Option.none())
     *   )
     *   console.log("New value:", newValue)
     * })
     * ```
     *
     * @since 2.0.0
     * @category updating
     */
    <A, E, R>(self: SubscriptionRef<A>, update: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<A, E, R>;
};
export {};
//# sourceMappingURL=SubscriptionRef.d.ts.map