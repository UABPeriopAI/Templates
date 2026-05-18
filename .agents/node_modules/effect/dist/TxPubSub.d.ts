/**
 * TxPubSub is a transactional publish/subscribe hub that provides Software Transactional Memory
 * (STM) semantics for message broadcasting. Publishers broadcast messages to all current
 * subscribers, with each subscriber receiving its own copy of every published message.
 *
 * Supports multiple queue strategies: bounded, unbounded, dropping, and sliding.
 *
 * @since 4.0.0
 */
import * as Effect from "./Effect.ts";
import type { Inspectable } from "./Inspectable.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Scope from "./Scope.ts";
import * as TxQueue from "./TxQueue.ts";
declare const TypeId = "~effect/transactions/TxPubSub";
/**
 * A TxPubSub represents a transactional publish/subscribe hub that broadcasts messages
 * to all current subscribers using Software Transactional Memory (STM) semantics.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<string>()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, "hello")
 *       const msg = yield* TxQueue.take(sub)
 *       console.log(msg) // "hello"
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface TxPubSub<in out A> extends Inspectable, Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly strategy: "bounded" | "unbounded" | "dropping" | "sliding";
    readonly capacity: number;
}
/**
 * Creates a bounded TxPubSub with the specified capacity. When a subscriber's
 * queue is full, the publisher will retry the transaction until space is available.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.bounded<number>(16)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, 42)
 *       const value = yield* TxQueue.take(sub)
 *       console.log(value) // 42
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const bounded: <A = never>(capacity: number) => Effect.Effect<TxPubSub<A>>;
/**
 * Creates a dropping TxPubSub with the specified capacity. When a subscriber's
 * queue is full, the message is dropped for that subscriber.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.dropping<number>(2)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, 1)
 *       yield* TxPubSub.publish(hub, 2)
 *       yield* TxPubSub.publish(hub, 3) // dropped
 *       const v1 = yield* TxQueue.take(sub)
 *       const v2 = yield* TxQueue.take(sub)
 *       console.log(v1, v2) // 1 2
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const dropping: <A = never>(capacity: number) => Effect.Effect<TxPubSub<A>>;
/**
 * Creates a sliding TxPubSub with the specified capacity. When a subscriber's
 * queue is full, the oldest message in that subscriber's queue is dropped.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.sliding<number>(2)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, 1)
 *       yield* TxPubSub.publish(hub, 2)
 *       yield* TxPubSub.publish(hub, 3) // evicts 1
 *       const v1 = yield* TxQueue.take(sub)
 *       console.log(v1) // 2
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const sliding: <A = never>(capacity: number) => Effect.Effect<TxPubSub<A>>;
/**
 * Creates an unbounded TxPubSub with unlimited capacity. Messages are always accepted.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<string>()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, "msg")
 *       const msg = yield* TxQueue.take(sub)
 *       console.log(msg) // "msg"
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const unbounded: <A = never>() => Effect.Effect<TxPubSub<A>>;
/**
 * Returns the capacity of the TxPubSub.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.bounded<number>(16)
 *   console.log(TxPubSub.capacity(hub)) // 16
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const capacity: <A>(self: TxPubSub<A>) => number;
/**
 * Returns the current number of messages across all subscriber queues (the max).
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, 1)
 *       yield* TxPubSub.publish(hub, 2)
 *       const s = yield* TxPubSub.size(hub)
 *       console.log(s) // 2
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const size: <A>(self: TxPubSub<A>) => Effect.Effect<number>;
/**
 * Checks if the TxPubSub has no pending messages (all subscriber queues are empty).
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *   const empty = yield* TxPubSub.isEmpty(hub)
 *   console.log(empty) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const isEmpty: <A>(self: TxPubSub<A>) => Effect.Effect<boolean>;
/**
 * Checks if any subscriber queue is at capacity.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.bounded<number>(2)
 *   const full = yield* TxPubSub.isFull(hub)
 *   console.log(full) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const isFull: <A>(self: TxPubSub<A>) => Effect.Effect<boolean>;
/**
 * Checks if the TxPubSub has been shut down.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *   console.log(yield* TxPubSub.isShutdown(hub)) // false
 *   yield* TxPubSub.shutdown(hub)
 *   console.log(yield* TxPubSub.isShutdown(hub)) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const isShutdown: <A>(self: TxPubSub<A>) => Effect.Effect<boolean>;
/**
 * Publishes a message to all current subscribers.
 *
 * Returns `true` if the message was delivered to all subscribers, or `false` if
 * the hub is shut down or the message was dropped for any subscriber (dropping strategy).
 *
 * For bounded strategy, retries the transaction if any subscriber queue is full.
 * For sliding strategy, drops oldest messages in full subscriber queues.
 * For dropping strategy, drops the message for full subscriber queues and returns `false`.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<string>()
 *
 *   // No subscribers - publish is a no-op
 *   const r1 = yield* TxPubSub.publish(hub, "no one listening")
 *   console.log(r1) // true
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publish(hub, "hello")
 *       const msg = yield* TxQueue.take(sub)
 *       console.log(msg) // "hello"
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const publish: {
    /**
     * Publishes a message to all current subscribers.
     *
     * Returns `true` if the message was delivered to all subscribers, or `false` if
     * the hub is shut down or the message was dropped for any subscriber (dropping strategy).
     *
     * For bounded strategy, retries the transaction if any subscriber queue is full.
     * For sliding strategy, drops oldest messages in full subscriber queues.
     * For dropping strategy, drops the message for full subscriber queues and returns `false`.
     *
     * @example
     * ```ts
     * import { Effect, TxPubSub, TxQueue } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const hub = yield* TxPubSub.unbounded<string>()
     *
     *   // No subscribers - publish is a no-op
     *   const r1 = yield* TxPubSub.publish(hub, "no one listening")
     *   console.log(r1) // true
     *
     *   yield* Effect.scoped(
     *     Effect.gen(function*() {
     *       const sub = yield* TxPubSub.subscribe(hub)
     *       yield* TxPubSub.publish(hub, "hello")
     *       const msg = yield* TxQueue.take(sub)
     *       console.log(msg) // "hello"
     *     })
     *   )
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(value: A): (self: TxPubSub<A>) => Effect.Effect<boolean>;
    /**
     * Publishes a message to all current subscribers.
     *
     * Returns `true` if the message was delivered to all subscribers, or `false` if
     * the hub is shut down or the message was dropped for any subscriber (dropping strategy).
     *
     * For bounded strategy, retries the transaction if any subscriber queue is full.
     * For sliding strategy, drops oldest messages in full subscriber queues.
     * For dropping strategy, drops the message for full subscriber queues and returns `false`.
     *
     * @example
     * ```ts
     * import { Effect, TxPubSub, TxQueue } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const hub = yield* TxPubSub.unbounded<string>()
     *
     *   // No subscribers - publish is a no-op
     *   const r1 = yield* TxPubSub.publish(hub, "no one listening")
     *   console.log(r1) // true
     *
     *   yield* Effect.scoped(
     *     Effect.gen(function*() {
     *       const sub = yield* TxPubSub.subscribe(hub)
     *       yield* TxPubSub.publish(hub, "hello")
     *       const msg = yield* TxQueue.take(sub)
     *       console.log(msg) // "hello"
     *     })
     *   )
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(self: TxPubSub<A>, value: A): Effect.Effect<boolean>;
};
/**
 * Publishes all messages from an iterable to all current subscribers.
 *
 * Returns `true` if all messages were delivered to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxPubSub.subscribe(hub)
 *       yield* TxPubSub.publishAll(hub, [1, 2, 3])
 *       const v1 = yield* TxQueue.take(sub)
 *       const v2 = yield* TxQueue.take(sub)
 *       const v3 = yield* TxQueue.take(sub)
 *       console.log(v1, v2, v3) // 1 2 3
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const publishAll: {
    /**
     * Publishes all messages from an iterable to all current subscribers.
     *
     * Returns `true` if all messages were delivered to all subscribers.
     *
     * @example
     * ```ts
     * import { Effect, TxPubSub, TxQueue } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const hub = yield* TxPubSub.unbounded<number>()
     *
     *   yield* Effect.scoped(
     *     Effect.gen(function*() {
     *       const sub = yield* TxPubSub.subscribe(hub)
     *       yield* TxPubSub.publishAll(hub, [1, 2, 3])
     *       const v1 = yield* TxQueue.take(sub)
     *       const v2 = yield* TxQueue.take(sub)
     *       const v3 = yield* TxQueue.take(sub)
     *       console.log(v1, v2, v3) // 1 2 3
     *     })
     *   )
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(values: Iterable<A>): (self: TxPubSub<A>) => Effect.Effect<boolean>;
    /**
     * Publishes all messages from an iterable to all current subscribers.
     *
     * Returns `true` if all messages were delivered to all subscribers.
     *
     * @example
     * ```ts
     * import { Effect, TxPubSub, TxQueue } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const hub = yield* TxPubSub.unbounded<number>()
     *
     *   yield* Effect.scoped(
     *     Effect.gen(function*() {
     *       const sub = yield* TxPubSub.subscribe(hub)
     *       yield* TxPubSub.publishAll(hub, [1, 2, 3])
     *       const v1 = yield* TxQueue.take(sub)
     *       const v2 = yield* TxQueue.take(sub)
     *       const v3 = yield* TxQueue.take(sub)
     *       console.log(v1, v2, v3) // 1 2 3
     *     })
     *   )
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(self: TxPubSub<A>, values: Iterable<A>): Effect.Effect<boolean>;
};
/**
 * Subscribes to the TxPubSub, returning a TxQueue that receives all messages
 * published after subscription. The subscription is automatically removed when
 * the scope is closed.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<string>()
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub1 = yield* TxPubSub.subscribe(hub)
 *       const sub2 = yield* TxPubSub.subscribe(hub)
 *
 *       yield* TxPubSub.publish(hub, "broadcast")
 *
 *       const msg1 = yield* TxQueue.take(sub1)
 *       const msg2 = yield* TxQueue.take(sub2)
 *       console.log(msg1, msg2) // "broadcast" "broadcast"
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const subscribe: <A>(self: TxPubSub<A>) => Effect.Effect<TxQueue.TxQueue<A>, never, Scope.Scope>;
/**
 * Creates a subscriber queue and registers it with the pub/sub.
 *
 * This is the transactional acquire step of `subscribe`, exposed so that
 * callers can compose it with other Tx operations in a single transaction
 * (e.g. `TxSubscriptionRef.changes`).
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const acquireSubscriber: <A>(self: TxPubSub<A>) => Effect.Effect<TxQueue.TxQueue<A>, never, Effect.Transaction>;
/**
 * Removes a subscriber queue from the pub/sub and shuts it down.
 *
 * This is the transactional release step of `subscribe`, exposed so that
 * callers can compose it with other Tx operations in a single transaction.
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const releaseSubscriber: {
    /**
     * Removes a subscriber queue from the pub/sub and shuts it down.
     *
     * This is the transactional release step of `subscribe`, exposed so that
     * callers can compose it with other Tx operations in a single transaction.
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(queue: TxQueue.TxQueue<A>): (self: TxPubSub<A>) => Effect.Effect<void, never, Effect.Transaction>;
    /**
     * Removes a subscriber queue from the pub/sub and shuts it down.
     *
     * This is the transactional release step of `subscribe`, exposed so that
     * callers can compose it with other Tx operations in a single transaction.
     *
     * @since 4.0.0
     * @category mutations
     */
    <A>(self: TxPubSub<A>, queue: TxQueue.TxQueue<A>): Effect.Effect<void, never, Effect.Transaction>;
};
/**
 * Shuts down the TxPubSub and all subscriber queues. Subsequent publish operations
 * will return `false`. Subsequent subscribe operations will receive an already-shutdown queue.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *   yield* TxPubSub.shutdown(hub)
 *
 *   const shut = yield* TxPubSub.isShutdown(hub)
 *   console.log(shut) // true
 *
 *   const accepted = yield* TxPubSub.publish(hub, 1)
 *   console.log(accepted) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const shutdown: <A>(self: TxPubSub<A>) => Effect.Effect<void>;
/**
 * Waits for the TxPubSub to be shut down.
 *
 * @example
 * ```ts
 * import { Effect, TxPubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const hub = yield* TxPubSub.unbounded<number>()
 *
 *   const fiber = yield* Effect.forkChild(TxPubSub.awaitShutdown(hub))
 *   yield* TxPubSub.shutdown(hub)
 *   yield* fiber.await
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const awaitShutdown: <A>(self: TxPubSub<A>) => Effect.Effect<void>;
/**
 * Checks if the given value is a TxPubSub.
 *
 * @example
 * ```ts
 * import { TxPubSub } from "effect"
 *
 * declare const someValue: unknown
 *
 * if (TxPubSub.isTxPubSub(someValue)) {
 *   console.log("This is a TxPubSub")
 * }
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isTxPubSub: (u: unknown) => u is TxPubSub<unknown>;
export {};
//# sourceMappingURL=TxPubSub.d.ts.map