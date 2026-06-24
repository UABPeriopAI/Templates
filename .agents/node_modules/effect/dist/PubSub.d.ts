/**
 * This module provides utilities for working with publish-subscribe (PubSub) systems.
 *
 * A PubSub is an asynchronous message hub where publishers can publish messages and subscribers
 * can subscribe to receive those messages. PubSub supports various backpressure strategies,
 * message replay, and concurrent access from multiple producers and consumers.
 *
 * @example
 * ```ts
 * import { Effect, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publisher
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *
 *   // Subscriber
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const message1 = yield* PubSub.take(subscription)
 *     const message2 = yield* PubSub.take(subscription)
 *     console.log(message1, message2) // "Hello", "World"
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 */
import * as Arr from "./Array.ts";
import * as Deferred from "./Deferred.ts";
import * as Effect from "./Effect.ts";
import type { LazyArg } from "./Function.ts";
import * as Latch from "./Latch.ts";
import * as MutableList from "./MutableList.ts";
import * as MutableRef from "./MutableRef.ts";
import * as Option from "./Option.ts";
import { type Pipeable } from "./Pipeable.ts";
import * as Scope from "./Scope.ts";
import type { Covariant, Invariant } from "./Types.ts";
declare const TypeId = "~effect/PubSub";
/**
 * A `PubSub<A>` is an asynchronous message hub into which publishers can publish
 * messages of type `A` and subscribers can subscribe to take messages of type
 * `A`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create a bounded PubSub with capacity 10
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *
 *   // Subscribe and consume messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const message1 = yield* PubSub.take(subscription)
 *     const message2 = yield* PubSub.take(subscription)
 *     console.log(message1, message2) // "Hello", "World"
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface PubSub<in out A> extends Pipeable {
    readonly [TypeId]: {
        readonly _A: Invariant<A>;
    };
    readonly pubsub: PubSub.Atomic<A>;
    readonly subscribers: PubSub.Subscribers<A>;
    readonly scope: Scope.Closeable;
    readonly shutdownHook: Latch.Latch;
    readonly shutdownFlag: MutableRef.MutableRef<boolean>;
    readonly strategy: PubSub.Strategy<A>;
}
/**
 * @since 2.0.0
 * @category models
 */
export declare namespace PubSub {
    /**
     * Low-level atomic PubSub interface that handles the core message storage and retrieval.
     *
     * @since 4.0.0
     * @category models
     */
    interface Atomic<in out A> {
        readonly capacity: number;
        isEmpty(): boolean;
        isFull(): boolean;
        size(): number;
        publish(value: A): boolean;
        publishAll(elements: Iterable<A>): Array<A>;
        slide(): void;
        subscribe(): BackingSubscription<A>;
        replayWindow(): ReplayWindow<A>;
    }
    /**
     * Low-level subscription interface that handles message polling for individual subscribers.
     *
     * @since 4.0.0
     * @category models
     */
    interface BackingSubscription<out A> {
        isEmpty(): boolean;
        size(): number;
        poll(): A | MutableList.Empty;
        pollUpTo(n: number): Array<A>;
        unsubscribe(): void;
    }
    /**
     * Internal type representing the mapping from subscriptions to their pollers.
     *
     * @since 4.0.0
     * @category models
     */
    type Subscribers<A> = Map<BackingSubscription<A>, Set<MutableList.MutableList<Deferred.Deferred<A>>>>;
    /**
     * Interface for accessing replay buffer contents for late subscribers.
     *
     * @since 4.0.0
     * @category models
     */
    interface ReplayWindow<A> {
        take(): A | undefined;
        takeN(n: number): Array<A>;
        takeAll(): Array<A>;
        readonly remaining: number;
    }
    /**
     * Strategy interface defining how PubSub handles backpressure and message distribution.
     *
     * @since 4.0.0
     * @category models
     */
    interface Strategy<in out A> {
        /**
         * Describes any finalization logic associated with this strategy.
         */
        readonly shutdown: Effect.Effect<void>;
        /**
         * Describes how publishers should signal to subscribers that they are
         * waiting for space to become available in the `PubSub`.
         */
        handleSurplus(pubsub: Atomic<A>, subscribers: Subscribers<A>, elements: Iterable<A>, isShutdown: MutableRef.MutableRef<boolean>): Effect.Effect<boolean>;
        /**
         * Describes how subscribers should signal to publishers waiting for space
         * to become available in the `PubSub` that space may be available.
         */
        onPubSubEmptySpaceUnsafe(pubsub: Atomic<A>, subscribers: Subscribers<A>): void;
        /**
         * Describes how subscribers waiting for additional values from the `PubSub`
         * should take those values and signal to publishers that they are no
         * longer waiting for additional values.
         */
        completePollersUnsafe(pubsub: Atomic<A>, subscribers: Subscribers<A>, subscription: BackingSubscription<A>, pollers: MutableList.MutableList<Deferred.Deferred<A>>): void;
        /**
         * Describes how publishers should signal to subscribers waiting for
         * additional values from the `PubSub` that new values are available.
         */
        completeSubscribersUnsafe(pubsub: Atomic<A>, subscribers: Subscribers<A>): void;
    }
}
declare const SubscriptionTypeId = "~effect/PubSub/Subscription";
/**
 * A subscription represents a consumer's connection to a PubSub, allowing them to take messages.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Subscribe within a scope for automatic cleanup
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription: PubSub.Subscription<string> = yield* PubSub.subscribe(
 *       pubsub
 *     )
 *
 *     // Take individual messages
 *     const message = yield* PubSub.take(subscription)
 *
 *     // Take multiple messages
 *     const messages = yield* PubSub.takeUpTo(subscription, 5)
 *     const allMessages = yield* PubSub.takeAll(subscription)
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface Subscription<out A> extends Pipeable {
    readonly [SubscriptionTypeId]: {
        readonly _A: Covariant<A>;
    };
    readonly pubsub: PubSub.Atomic<any>;
    readonly subscribers: PubSub.Subscribers<any>;
    readonly subscription: PubSub.BackingSubscription<A>;
    readonly pollers: MutableList.MutableList<Deferred.Deferred<any>>;
    readonly shutdownHook: Latch.Latch;
    readonly shutdownFlag: MutableRef.MutableRef<boolean>;
    readonly strategy: PubSub.Strategy<any>;
    readonly replayWindow: PubSub.ReplayWindow<A>;
}
/**
 * Creates a PubSub with a custom atomic implementation and strategy.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create custom PubSub with specific atomic implementation and strategy
 *   const pubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(100),
 *     strategy: () => new PubSub.BackPressureStrategy()
 *   })
 *
 *   // Use the created PubSub
 *   yield* PubSub.publish(pubsub, "Hello")
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <A>(options: {
    readonly atomicPubSub: LazyArg<PubSub.Atomic<A>>;
    readonly strategy: LazyArg<PubSub.Strategy<A>>;
}) => Effect.Effect<PubSub<A>>;
/**
 * Creates a bounded PubSub with backpressure strategy.
 *
 * The PubSub will retain messages until they have been taken by all subscribers.
 * When the PubSub reaches capacity, publishers will be suspended until space becomes available.
 * This ensures message delivery guarantees but may slow down fast publishers.
 *
 * @param capacity - The maximum number of messages the PubSub can hold, or an options object
 *                   with capacity and optional replay buffer size
 * @returns An Effect that creates a bounded PubSub
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create bounded PubSub with capacity 100
 *   const pubsub = yield* PubSub.bounded<string>(100)
 *
 *   // Create with replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.bounded<string>({
 *     capacity: 100,
 *     replay: 10 // Last 10 messages replayed to new subscribers
 *   })
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const bounded: <A>(capacity: number | {
    readonly capacity: number;
    readonly replay?: number | undefined;
}) => Effect.Effect<PubSub<A>>;
/**
 * Creates a bounded `PubSub` with the dropping strategy. The `PubSub` will drop new
 * messages if the `PubSub` is at capacity.
 *
 * For best performance use capacities that are powers of two.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create dropping PubSub that drops new messages when full
 *   const pubsub = yield* PubSub.dropping<string>(3)
 *
 *   // With replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.dropping<string>({
 *     capacity: 3,
 *     replay: 5
 *   })
 *
 *   // Fill the PubSub and see dropping behavior
 *   yield* PubSub.publish(pubsub, "msg1") // succeeds
 *   yield* PubSub.publish(pubsub, "msg2") // succeeds
 *   yield* PubSub.publish(pubsub, "msg3") // succeeds
 *   const dropped = yield* PubSub.publish(pubsub, "msg4") // returns false (dropped)
 *   console.log("Message dropped:", !dropped)
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const dropping: <A>(capacity: number | {
    readonly capacity: number;
    readonly replay?: number | undefined;
}) => Effect.Effect<PubSub<A>>;
/**
 * Creates a bounded `PubSub` with the sliding strategy. The `PubSub` will add new
 * messages and drop old messages if the `PubSub` is at capacity.
 *
 * For best performance use capacities that are powers of two.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create sliding PubSub that evicts old messages when full
 *   const pubsub = yield* PubSub.sliding<string>(3)
 *
 *   // With replay buffer
 *   const pubsubWithReplay = yield* PubSub.sliding<string>({
 *     capacity: 3,
 *     replay: 2
 *   })
 *
 *   // Fill and overflow the PubSub
 *   yield* PubSub.publish(pubsub, "msg1")
 *   yield* PubSub.publish(pubsub, "msg2")
 *   yield* PubSub.publish(pubsub, "msg3")
 *   yield* PubSub.publish(pubsub, "msg4") // "msg1" is evicted
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log(messages) // ["msg2", "msg3", "msg4"]
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const sliding: <A>(capacity: number | {
    readonly capacity: number;
    readonly replay?: number | undefined;
}) => Effect.Effect<PubSub<A>>;
/**
 * Creates an unbounded `PubSub`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create unbounded PubSub
 *   const pubsub = yield* PubSub.unbounded<string>()
 *
 *   // With replay buffer for late subscribers
 *   const pubsubWithReplay = yield* PubSub.unbounded<string>({
 *     replay: 10
 *   })
 *
 *   // Can publish unlimited messages
 *   for (let i = 0; i < 1000; i++) {
 *     yield* PubSub.publish(pubsub, `message-${i}`)
 *   }
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const message = yield* PubSub.take(subscription)
 *     console.log("First message:", message)
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const unbounded: <A>(options?: {
    readonly replay?: number | undefined;
}) => Effect.Effect<PubSub<A>>;
/**
 * Creates a bounded atomic PubSub implementation with optional replay buffer.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeAtomicBounded: <A>(capacity: number | {
    readonly capacity: number;
    readonly replay?: number | undefined;
}) => PubSub.Atomic<A>;
/**
 * Creates an unbounded atomic PubSub implementation with optional replay buffer.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeAtomicUnbounded: <A>(options?: {
    readonly replay?: number | undefined;
}) => PubSub.Atomic<A>;
/**
 *  Returns the number of elements the queue can hold.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(100)
 *   const cap = PubSub.capacity(pubsub)
 *   console.log("PubSub capacity:", cap) // 100
 *
 *   const unboundedPubsub = yield* PubSub.unbounded<string>()
 *   const unboundedCap = PubSub.capacity(unboundedPubsub)
 *   console.log("Unbounded capacity:", unboundedCap) // Number.MAX_SAFE_INTEGER
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const capacity: <A>(self: PubSub<A>) => number;
/**
 * Retrieves the size of the queue, which is equal to the number of elements
 * in the queue. This may be negative if fibers are suspended waiting for
 * elements to be added to the queue.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Initially empty
 *   const initialSize = yield* PubSub.size(pubsub)
 *   console.log("Initial size:", initialSize) // 0
 *
 *   // Publish some messages
 *   yield* PubSub.publish(pubsub, "msg1")
 *   yield* PubSub.publish(pubsub, "msg2")
 *
 *   const afterPublish = yield* PubSub.size(pubsub)
 *   console.log("After publishing:", afterPublish) // 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const size: <A>(self: PubSub<A>) => Effect.Effect<number>;
/**
 * Retrieves the size of the queue, which is equal to the number of elements
 * in the queue. This may be negative if fibers are suspended waiting for
 * elements to be added to the queue.
 *
 * @example
 * ```ts
 * import { PubSub } from "effect"
 *
 * // Unsafe synchronous size check
 * declare const pubsub: PubSub.PubSub<string>
 *
 * const size = PubSub.sizeUnsafe(pubsub)
 * console.log("Current size:", size)
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const sizeUnsafe: <A>(self: PubSub<A>) => number;
/**
 * Returns `true` if the `PubSub` contains at least one element, `false`
 * otherwise.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(2)
 *
 *   // Initially not full
 *   const initiallyFull = yield* PubSub.isFull(pubsub)
 *   console.log("Initially full:", initiallyFull) // false
 *
 *   // Fill the PubSub
 *   yield* PubSub.publish(pubsub, "msg1")
 *   yield* PubSub.publish(pubsub, "msg2")
 *
 *   const nowFull = yield* PubSub.isFull(pubsub)
 *   console.log("Now full:", nowFull) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isFull: <A>(self: PubSub<A>) => Effect.Effect<boolean>;
/**
 * Returns `true` if the `Pubsub` contains zero elements, `false` otherwise.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Initially empty
 *   const initiallyEmpty = yield* PubSub.isEmpty(pubsub)
 *   console.log("Initially empty:", initiallyEmpty) // true
 *
 *   // Publish a message
 *   yield* PubSub.publish(pubsub, "Hello")
 *
 *   const nowEmpty = yield* PubSub.isEmpty(pubsub)
 *   console.log("Now empty:", nowEmpty) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isEmpty: <A>(self: PubSub<A>) => Effect.Effect<boolean>;
/**
 * Interrupts any fibers that are suspended on `offer` or `take`. Future calls
 * to `offer*` and `take*` will be interrupted immediately.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(1)
 *
 *   // Start a fiber that will be suspended waiting to publish
 *   const publisherFiber = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* PubSub.publish(pubsub, "msg1") // fills the buffer
 *       yield* PubSub.publish(pubsub, "msg2") // will suspend here
 *     })
 *   )
 *
 *   // Shutdown the PubSub
 *   yield* PubSub.shutdown(pubsub)
 *
 *   // The suspended publisher will be interrupted
 *   const result = yield* Fiber.await(publisherFiber)
 *   console.log("Publisher interrupted:", result._tag === "Failure")
 * })
 * ```
 *
 * @since 2.0.0
 * @category lifecycle
 */
export declare const shutdown: <A>(self: PubSub<A>) => Effect.Effect<void>;
/**
 * Returns `true` if `shutdown` has been called, otherwise returns `false`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Initially not shutdown
 *   const initiallyShutdown = yield* PubSub.isShutdown(pubsub)
 *   console.log("Initially shutdown:", initiallyShutdown) // false
 *
 *   // Shutdown the PubSub
 *   yield* PubSub.shutdown(pubsub)
 *
 *   const nowShutdown = yield* PubSub.isShutdown(pubsub)
 *   console.log("Now shutdown:", nowShutdown) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isShutdown: <A>(self: PubSub<A>) => Effect.Effect<boolean>;
/**
 * Returns `true` if `shutdown` has been called, otherwise returns `false`.
 *
 * @example
 * ```ts
 * import { PubSub } from "effect"
 *
 * declare const pubsub: PubSub.PubSub<string>
 *
 * // Unsafe synchronous shutdown check
 * const isDown = PubSub.isShutdownUnsafe(pubsub)
 * if (isDown) {
 *   console.log("PubSub is shutdown, cannot publish")
 * } else {
 *   console.log("PubSub is active")
 * }
 * ```
 *
 * @since 4.0.0
 * @category predicates
 */
export declare const isShutdownUnsafe: <A>(self: PubSub<A>) => boolean;
/**
 * Waits until the queue is shutdown. The `Effect` returned by this method will
 * not resume until the queue has been shutdown. If the queue is already
 * shutdown, the `Effect` will resume right away.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Start a fiber that waits for shutdown
 *   const waiterFiber = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* PubSub.awaitShutdown(pubsub)
 *       console.log("PubSub has been shutdown!")
 *     })
 *   )
 *
 *   // Do some work...
 *   yield* Effect.sleep("100 millis")
 *
 *   // Shutdown the PubSub
 *   yield* PubSub.shutdown(pubsub)
 *
 *   // The waiter will now complete
 *   yield* Fiber.join(waiterFiber)
 * })
 * ```
 *
 * @since 2.0.0
 * @category lifecycle
 */
export declare const awaitShutdown: <A>(self: PubSub<A>) => Effect.Effect<void>;
/**
 * Publishes a message to the `PubSub`, returning whether the message was published
 * to the `PubSub`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish a message
 *   const published = yield* PubSub.publish(pubsub, "Hello World")
 *   console.log("Message published:", published) // true
 *
 *   // With a full bounded PubSub using backpressure strategy
 *   const smallPubsub = yield* PubSub.bounded<string>(1)
 *   yield* PubSub.publish(smallPubsub, "msg1") // succeeds
 *
 *   // This will suspend until space becomes available
 *   const publishEffect = PubSub.publish(smallPubsub, "msg2")
 *
 *   // Create a subscriber to free up space
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(smallPubsub)
 *     yield* PubSub.take(subscription) // frees space
 *     const result = yield* publishEffect
 *     console.log("Second message published:", result) // true
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category publishing
 */
export declare const publish: {
    /**
     * Publishes a message to the `PubSub`, returning whether the message was published
     * to the `PubSub`.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish a message
     *   const published = yield* PubSub.publish(pubsub, "Hello World")
     *   console.log("Message published:", published) // true
     *
     *   // With a full bounded PubSub using backpressure strategy
     *   const smallPubsub = yield* PubSub.bounded<string>(1)
     *   yield* PubSub.publish(smallPubsub, "msg1") // succeeds
     *
     *   // This will suspend until space becomes available
     *   const publishEffect = PubSub.publish(smallPubsub, "msg2")
     *
     *   // Create a subscriber to free up space
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(smallPubsub)
     *     yield* PubSub.take(subscription) // frees space
     *     const result = yield* publishEffect
     *     console.log("Second message published:", result) // true
     *   }))
     * })
     * ```
     *
     * @since 2.0.0
     * @category publishing
     */
    <A>(value: A): (self: PubSub<A>) => Effect.Effect<boolean>;
    /**
     * Publishes a message to the `PubSub`, returning whether the message was published
     * to the `PubSub`.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish a message
     *   const published = yield* PubSub.publish(pubsub, "Hello World")
     *   console.log("Message published:", published) // true
     *
     *   // With a full bounded PubSub using backpressure strategy
     *   const smallPubsub = yield* PubSub.bounded<string>(1)
     *   yield* PubSub.publish(smallPubsub, "msg1") // succeeds
     *
     *   // This will suspend until space becomes available
     *   const publishEffect = PubSub.publish(smallPubsub, "msg2")
     *
     *   // Create a subscriber to free up space
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(smallPubsub)
     *     yield* PubSub.take(subscription) // frees space
     *     const result = yield* publishEffect
     *     console.log("Second message published:", result) // true
     *   }))
     * })
     * ```
     *
     * @since 2.0.0
     * @category publishing
     */
    <A>(self: PubSub<A>, value: A): Effect.Effect<boolean>;
};
/**
 * Publishes a message to the `PubSub`, returning whether the message was published
 * to the `PubSub`.
 *
 * @example
 * ```ts
 * import { PubSub } from "effect"
 *
 * declare const pubsub: PubSub.PubSub<string>
 *
 * // Unsafe synchronous publish (non-blocking)
 * const published = PubSub.publishUnsafe(pubsub, "Hello")
 * if (published) {
 *   console.log("Message published successfully")
 * } else {
 *   console.log("Message dropped (PubSub full or shutdown)")
 * }
 *
 * // Useful for scenarios where you don't want to suspend
 * const messages = ["msg1", "msg2", "msg3"]
 * const publishedCount =
 *   messages.filter((msg) => PubSub.publishUnsafe(pubsub, msg)).length
 * console.log(`Published ${publishedCount} out of ${messages.length} messages`)
 * ```
 *
 * @since 4.0.0
 * @category publishing
 */
export declare const publishUnsafe: {
    /**
     * Publishes a message to the `PubSub`, returning whether the message was published
     * to the `PubSub`.
     *
     * @example
     * ```ts
     * import { PubSub } from "effect"
     *
     * declare const pubsub: PubSub.PubSub<string>
     *
     * // Unsafe synchronous publish (non-blocking)
     * const published = PubSub.publishUnsafe(pubsub, "Hello")
     * if (published) {
     *   console.log("Message published successfully")
     * } else {
     *   console.log("Message dropped (PubSub full or shutdown)")
     * }
     *
     * // Useful for scenarios where you don't want to suspend
     * const messages = ["msg1", "msg2", "msg3"]
     * const publishedCount =
     *   messages.filter((msg) => PubSub.publishUnsafe(pubsub, msg)).length
     * console.log(`Published ${publishedCount} out of ${messages.length} messages`)
     * ```
     *
     * @since 4.0.0
     * @category publishing
     */
    <A>(value: A): (self: PubSub<A>) => boolean;
    /**
     * Publishes a message to the `PubSub`, returning whether the message was published
     * to the `PubSub`.
     *
     * @example
     * ```ts
     * import { PubSub } from "effect"
     *
     * declare const pubsub: PubSub.PubSub<string>
     *
     * // Unsafe synchronous publish (non-blocking)
     * const published = PubSub.publishUnsafe(pubsub, "Hello")
     * if (published) {
     *   console.log("Message published successfully")
     * } else {
     *   console.log("Message dropped (PubSub full or shutdown)")
     * }
     *
     * // Useful for scenarios where you don't want to suspend
     * const messages = ["msg1", "msg2", "msg3"]
     * const publishedCount =
     *   messages.filter((msg) => PubSub.publishUnsafe(pubsub, msg)).length
     * console.log(`Published ${publishedCount} out of ${messages.length} messages`)
     * ```
     *
     * @since 4.0.0
     * @category publishing
     */
    <A>(self: PubSub<A>, value: A): boolean;
};
/**
 * Publishes all of the specified messages to the `PubSub`, returning whether they
 * were published to the `PubSub`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish multiple messages at once
 *   const messages = ["Hello", "World", "from", "Effect"]
 *   const allPublished = yield* PubSub.publishAll(pubsub, messages)
 *   console.log("All messages published:", allPublished) // true
 *
 *   // With a smaller capacity
 *   const smallPubsub = yield* PubSub.bounded<string>(2)
 *   const manyMessages = ["msg1", "msg2", "msg3", "msg4"]
 *
 *   // Will suspend until space becomes available for all messages
 *   const publishAllEffect = PubSub.publishAll(smallPubsub, manyMessages)
 *
 *   // Subscribe to consume messages and free space
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(smallPubsub)
 *     yield* PubSub.takeAll(subscription) // consume all messages
 *     const result = yield* publishAllEffect
 *     console.log("All messages eventually published:", result)
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category publishing
 */
export declare const publishAll: {
    /**
     * Publishes all of the specified messages to the `PubSub`, returning whether they
     * were published to the `PubSub`.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish multiple messages at once
     *   const messages = ["Hello", "World", "from", "Effect"]
     *   const allPublished = yield* PubSub.publishAll(pubsub, messages)
     *   console.log("All messages published:", allPublished) // true
     *
     *   // With a smaller capacity
     *   const smallPubsub = yield* PubSub.bounded<string>(2)
     *   const manyMessages = ["msg1", "msg2", "msg3", "msg4"]
     *
     *   // Will suspend until space becomes available for all messages
     *   const publishAllEffect = PubSub.publishAll(smallPubsub, manyMessages)
     *
     *   // Subscribe to consume messages and free space
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(smallPubsub)
     *     yield* PubSub.takeAll(subscription) // consume all messages
     *     const result = yield* publishAllEffect
     *     console.log("All messages eventually published:", result)
     *   }))
     * })
     * ```
     *
     * @since 2.0.0
     * @category publishing
     */
    <A>(elements: Iterable<A>): (self: PubSub<A>) => Effect.Effect<boolean>;
    /**
     * Publishes all of the specified messages to the `PubSub`, returning whether they
     * were published to the `PubSub`.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish multiple messages at once
     *   const messages = ["Hello", "World", "from", "Effect"]
     *   const allPublished = yield* PubSub.publishAll(pubsub, messages)
     *   console.log("All messages published:", allPublished) // true
     *
     *   // With a smaller capacity
     *   const smallPubsub = yield* PubSub.bounded<string>(2)
     *   const manyMessages = ["msg1", "msg2", "msg3", "msg4"]
     *
     *   // Will suspend until space becomes available for all messages
     *   const publishAllEffect = PubSub.publishAll(smallPubsub, manyMessages)
     *
     *   // Subscribe to consume messages and free space
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(smallPubsub)
     *     yield* PubSub.takeAll(subscription) // consume all messages
     *     const result = yield* publishAllEffect
     *     console.log("All messages eventually published:", result)
     *   }))
     * })
     * ```
     *
     * @since 2.0.0
     * @category publishing
     */
    <A>(self: PubSub<A>, elements: Iterable<A>): Effect.Effect<boolean>;
};
/**
 * Subscribes to receive messages from the `PubSub`. The resulting subscription can
 * be evaluated multiple times within the scope to take a message from the `PubSub`
 * each time.
 *
 * @example
 * ```ts
 * import { Effect, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish some messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *
 *   // Subscribe within a scope for automatic cleanup
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take messages one by one
 *     const msg1 = yield* PubSub.take(subscription)
 *     const msg2 = yield* PubSub.take(subscription)
 *     console.log(msg1, msg2) // "Hello", "World"
 *
 *     // Subscription is automatically cleaned up when scope exits
 *   }))
 *
 *   // Multiple subscribers can receive the same messages
 *   yield* PubSub.publish(pubsub, "Broadcast")
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const sub1 = yield* PubSub.subscribe(pubsub)
 *     const sub2 = yield* PubSub.subscribe(pubsub)
 *
 *     const [msg1, msg2] = yield* Effect.all([
 *       PubSub.take(sub1),
 *       PubSub.take(sub2)
 *     ])
 *     console.log("Both received:", msg1, msg2) // "Broadcast", "Broadcast"
 *   }))
 * })
 * ```
 *
 * @since 2.0.0
 * @category subscription
 */
export declare const subscribe: <A>(self: PubSub<A>) => Effect.Effect<Subscription<A>, never, Scope.Scope>;
/**
 * Takes a single message from the subscription. If no messages are available,
 * this will suspend until a message becomes available.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Start a fiber to take a message (will suspend)
 *     const takeFiber = yield* Effect.forkChild(
 *       PubSub.take(subscription)
 *     )
 *
 *     // Publish a message
 *     yield* PubSub.publish(pubsub, "Hello")
 *
 *     // The take will now complete
 *     const message = yield* Fiber.join(takeFiber)
 *     console.log("Received:", message) // "Hello"
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscription
 */
export declare const take: <A>(self: Subscription<A>) => Effect.Effect<A>;
/**
 * Takes all available messages from the subscription, suspending if no items
 * are available.
 *
 * @example
 * ```ts
 * import { Effect, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish multiple messages
 *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take all available messages at once
 *     const allMessages = yield* PubSub.takeAll(subscription)
 *     console.log("All messages:", allMessages) // ["msg1", "msg2", "msg3"]
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscription
 */
export declare const takeAll: <A>(self: Subscription<A>) => Effect.Effect<Arr.NonEmptyArray<A>>;
/**
 * Takes up to the specified number of messages from the subscription without suspending.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish multiple messages
 *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3", "msg4", "msg5"])
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Take up to 3 messages
 *     const upTo3 = yield* PubSub.takeUpTo(subscription, 3)
 *     console.log("Up to 3:", upTo3) // ["msg1", "msg2", "msg3"]
 *
 *     // Take up to 5 more (only 2 remaining)
 *     const upTo5 = yield* PubSub.takeUpTo(subscription, 5)
 *     console.log("Up to 5:", upTo5) // ["msg4", "msg5"]
 *
 *     // No more messages available
 *     const noMore = yield* PubSub.takeUpTo(subscription, 10)
 *     console.log("No more:", noMore) // []
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscription
 */
export declare const takeUpTo: {
    /**
     * Takes up to the specified number of messages from the subscription without suspending.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish multiple messages
     *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3", "msg4", "msg5"])
     *
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(pubsub)
     *
     *     // Take up to 3 messages
     *     const upTo3 = yield* PubSub.takeUpTo(subscription, 3)
     *     console.log("Up to 3:", upTo3) // ["msg1", "msg2", "msg3"]
     *
     *     // Take up to 5 more (only 2 remaining)
     *     const upTo5 = yield* PubSub.takeUpTo(subscription, 5)
     *     console.log("Up to 5:", upTo5) // ["msg4", "msg5"]
     *
     *     // No more messages available
     *     const noMore = yield* PubSub.takeUpTo(subscription, 10)
     *     console.log("No more:", noMore) // []
     *   }))
     * })
     * ```
     *
     * @since 4.0.0
     * @category subscription
     */
    (max: number): <A>(self: Subscription<A>) => Effect.Effect<Array<A>>;
    /**
     * Takes up to the specified number of messages from the subscription without suspending.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import * as PubSub from "effect/PubSub"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   // Publish multiple messages
     *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3", "msg4", "msg5"])
     *
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(pubsub)
     *
     *     // Take up to 3 messages
     *     const upTo3 = yield* PubSub.takeUpTo(subscription, 3)
     *     console.log("Up to 3:", upTo3) // ["msg1", "msg2", "msg3"]
     *
     *     // Take up to 5 more (only 2 remaining)
     *     const upTo5 = yield* PubSub.takeUpTo(subscription, 5)
     *     console.log("Up to 5:", upTo5) // ["msg4", "msg5"]
     *
     *     // No more messages available
     *     const noMore = yield* PubSub.takeUpTo(subscription, 10)
     *     console.log("No more:", noMore) // []
     *   }))
     * })
     * ```
     *
     * @since 4.0.0
     * @category subscription
     */
    <A>(self: Subscription<A>, max: number): Effect.Effect<Array<A>>;
};
/**
 * Takes between the specified minimum and maximum number of messages from the subscription.
 * Will suspend if the minimum number is not immediately available.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, PubSub } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Start taking between 2 and 5 messages (will suspend)
 *     const takeFiber = yield* Effect.forkChild(
 *       PubSub.takeBetween(subscription, 2, 5)
 *     )
 *
 *     // Publish 3 messages
 *     yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
 *
 *     // Now the take will complete with 3 messages
 *     const messages = yield* Fiber.join(takeFiber)
 *     console.log("Between 2-5:", messages) // ["msg1", "msg2", "msg3"]
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscription
 */
export declare const takeBetween: {
    /**
     * Takes between the specified minimum and maximum number of messages from the subscription.
     * Will suspend if the minimum number is not immediately available.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, PubSub } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(pubsub)
     *
     *     // Start taking between 2 and 5 messages (will suspend)
     *     const takeFiber = yield* Effect.forkChild(
     *       PubSub.takeBetween(subscription, 2, 5)
     *     )
     *
     *     // Publish 3 messages
     *     yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
     *
     *     // Now the take will complete with 3 messages
     *     const messages = yield* Fiber.join(takeFiber)
     *     console.log("Between 2-5:", messages) // ["msg1", "msg2", "msg3"]
     *   }))
     * })
     * ```
     *
     * @since 4.0.0
     * @category subscription
     */
    (min: number, max: number): <A>(self: Subscription<A>) => Effect.Effect<Array<A>>;
    /**
     * Takes between the specified minimum and maximum number of messages from the subscription.
     * Will suspend if the minimum number is not immediately available.
     *
     * @example
     * ```ts
     * import { Effect, Fiber, PubSub } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const pubsub = yield* PubSub.bounded<string>(10)
     *
     *   yield* Effect.scoped(Effect.gen(function*() {
     *     const subscription = yield* PubSub.subscribe(pubsub)
     *
     *     // Start taking between 2 and 5 messages (will suspend)
     *     const takeFiber = yield* Effect.forkChild(
     *       PubSub.takeBetween(subscription, 2, 5)
     *     )
     *
     *     // Publish 3 messages
     *     yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
     *
     *     // Now the take will complete with 3 messages
     *     const messages = yield* Fiber.join(takeFiber)
     *     console.log("Between 2-5:", messages) // ["msg1", "msg2", "msg3"]
     *   }))
     * })
     * ```
     *
     * @since 4.0.0
     * @category subscription
     */
    <A>(self: Subscription<A>, min: number, max: number): Effect.Effect<Array<A>>;
};
/**
 * Returns the number of messages currently available in the subscription.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(10)
 *
 *   // Publish some messages
 *   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
 *
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *
 *     // Check how many messages are available
 *     const count = yield* PubSub.remaining(subscription)
 *     console.log("Messages available:", count) // 3
 *
 *     // Take one message
 *     yield* PubSub.take(subscription)
 *
 *     const remaining = yield* PubSub.remaining(subscription)
 *     console.log("Messages remaining:", remaining) // 2
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const remaining: <A>(self: Subscription<A>) => Effect.Effect<number>;
/**
 * Returns the number of messages currently available in the subscription.
 *
 * @example
 * ```ts
 * import { PubSub } from "effect"
 *
 * declare const subscription: PubSub.Subscription<string>
 *
 * // Unsafe synchronous check for remaining messages
 * const remainingOption = PubSub.remainingUnsafe(subscription)
 * if (remainingOption._tag === "Some") {
 *   console.log("Messages available:", remainingOption.value)
 * } else {
 *   console.log("Subscription is shutdown")
 * }
 *
 * // Useful for polling or batching scenarios
 * if (remainingOption._tag === "Some" && remainingOption.value > 10) {
 *   // Process messages in batch
 * }
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const remainingUnsafe: <A>(self: Subscription<A>) => Option.Option<number>;
/**
 * A strategy that applies back pressure to publishers when the `PubSub` is at
 * capacity. This guarantees that all subscribers will receive all messages
 * published to the `PubSub` while they are subscribed. However, it creates the
 * risk that a slow subscriber will slow down the rate at which messages
 * are published and received by other subscribers.
 *
 * @since 4.0.0
 * @category models
 */
export declare class BackPressureStrategy<in out A> implements PubSub.Strategy<A> {
    publishers: MutableList.MutableList<readonly [A, Deferred.Deferred<boolean>, boolean]>;
    get shutdown(): Effect.Effect<void>;
    handleSurplus(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>, elements: Iterable<A>, isShutdown: MutableRef.MutableRef<boolean>): Effect.Effect<boolean>;
    onPubSubEmptySpaceUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>): void;
    completePollersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>, subscription: PubSub.BackingSubscription<A>, pollers: MutableList.MutableList<Deferred.Deferred<A>>): void;
    completeSubscribersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>): void;
    private offerUnsafe;
    removeUnsafe(deferred: Deferred.Deferred<boolean>): void;
}
/**
 * A strategy that drops new messages when the `PubSub` is at capacity. This
 * guarantees that a slow subscriber will not slow down the rate at which
 * messages are published. However, it creates the risk that a slow
 * subscriber will slow down the rate at which messages are received by
 * other subscribers and that subscribers may not receive all messages
 * published to the `PubSub` while they are subscribed.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create PubSub with dropping strategy
 *   const pubsub = yield* PubSub.dropping<string>(2)
 *
 *   // Or explicitly create with dropping strategy
 *   const customPubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(2),
 *     strategy: () => new PubSub.DroppingStrategy()
 *   })
 *
 *   // Fill the PubSub
 *   const pub1 = yield* PubSub.publish(pubsub, "msg1") // true
 *   const pub2 = yield* PubSub.publish(pubsub, "msg2") // true
 *   const pub3 = yield* PubSub.publish(pubsub, "msg3") // false (dropped)
 *
 *   console.log("Publication results:", [pub1, pub2, pub3]) // [true, true, false]
 *
 *   // Subscribers will only see the first two messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log("Received messages:", messages) // ["msg1", "msg2"]
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class DroppingStrategy<in out A> implements PubSub.Strategy<A> {
    get shutdown(): Effect.Effect<void>;
    handleSurplus(_pubsub: PubSub.Atomic<A>, _subscribers: PubSub.Subscribers<A>, _elements: Iterable<A>, _isShutdown: MutableRef.MutableRef<boolean>): Effect.Effect<boolean>;
    onPubSubEmptySpaceUnsafe(_pubsub: PubSub.Atomic<A>, _subscribers: PubSub.Subscribers<A>): void;
    completePollersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>, subscription: PubSub.BackingSubscription<A>, pollers: MutableList.MutableList<Deferred.Deferred<A>>): void;
    completeSubscribersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>): void;
}
/**
 * A strategy that adds new messages and drops old messages when the `PubSub` is
 * at capacity. This guarantees that a slow subscriber will not slow down
 * the rate at which messages are published and received by other
 * subscribers. However, it creates the risk that a slow subscriber will
 * not receive some messages published to the `PubSub` while it is subscribed.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as PubSub from "effect/PubSub"
 *
 * const program = Effect.gen(function*() {
 *   // Create PubSub with sliding strategy
 *   const pubsub = yield* PubSub.sliding<string>(2)
 *
 *   // Or explicitly create with sliding strategy
 *   const customPubsub = yield* PubSub.make<string>({
 *     atomicPubSub: () => PubSub.makeAtomicBounded(2),
 *     strategy: () => new PubSub.SlidingStrategy()
 *   })
 *
 *   // Publish messages that exceed capacity
 *   yield* PubSub.publish(pubsub, "msg1") // stored
 *   yield* PubSub.publish(pubsub, "msg2") // stored
 *   yield* PubSub.publish(pubsub, "msg3") // "msg1" evicted, "msg3" stored
 *   yield* PubSub.publish(pubsub, "msg4") // "msg2" evicted, "msg4" stored
 *
 *   // Subscribers will see the most recent messages
 *   yield* Effect.scoped(Effect.gen(function*() {
 *     const subscription = yield* PubSub.subscribe(pubsub)
 *     const messages = yield* PubSub.takeAll(subscription)
 *     console.log("Recent messages:", messages) // ["msg3", "msg4"]
 *   }))
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class SlidingStrategy<in out A> implements PubSub.Strategy<A> {
    get shutdown(): Effect.Effect<void>;
    handleSurplus(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>, elements: Iterable<A>, _isShutdown: MutableRef.MutableRef<boolean>): Effect.Effect<boolean>;
    onPubSubEmptySpaceUnsafe(_pubsub: PubSub.Atomic<A>, _subscribers: PubSub.Subscribers<A>): void;
    completePollersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>, subscription: PubSub.BackingSubscription<A>, pollers: MutableList.MutableList<Deferred.Deferred<A>>): void;
    completeSubscribersUnsafe(pubsub: PubSub.Atomic<A>, subscribers: PubSub.Subscribers<A>): void;
    slidingPublishUnsafe(pubsub: PubSub.Atomic<A>, elements: Iterable<A>): void;
}
export {};
//# sourceMappingURL=PubSub.d.ts.map