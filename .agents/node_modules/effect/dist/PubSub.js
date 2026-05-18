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
import * as Arr from "./Array.js";
import * as Context from "./Context.js";
import * as Deferred from "./Deferred.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import { dual, identity } from "./Function.js";
import * as Latch from "./Latch.js";
import * as MutableList from "./MutableList.js";
import * as MutableRef from "./MutableRef.js";
import { nextPow2 } from "./Number.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/PubSub";
const SubscriptionTypeId = "~effect/PubSub/Subscription";
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
export const make = options => Effect.sync(() => makePubSubUnsafe(options.atomicPubSub(), new Map(), Scope.makeUnsafe(), Latch.makeUnsafe(false), MutableRef.make(false), options.strategy()));
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
export const bounded = capacity => make({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new BackPressureStrategy()
});
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
export const dropping = capacity => make({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new DroppingStrategy()
});
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
export const sliding = capacity => make({
  atomicPubSub: () => makeAtomicBounded(capacity),
  strategy: () => new SlidingStrategy()
});
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
export const unbounded = options => make({
  atomicPubSub: () => makeAtomicUnbounded(options),
  strategy: () => new DroppingStrategy()
});
/**
 * Creates a bounded atomic PubSub implementation with optional replay buffer.
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeAtomicBounded = capacity => {
  const options = typeof capacity === "number" ? {
    capacity
  } : capacity;
  ensureCapacity(options.capacity);
  const replayBuffer = options.replay && options.replay > 0 ? new ReplayBuffer(Math.ceil(options.replay)) : undefined;
  if (options.capacity === 1) {
    return new BoundedPubSubSingle(replayBuffer);
  } else if (nextPow2(options.capacity) === options.capacity) {
    return new BoundedPubSubPow2(options.capacity, replayBuffer);
  } else {
    return new BoundedPubSubArb(options.capacity, replayBuffer);
  }
};
/**
 * Creates an unbounded atomic PubSub implementation with optional replay buffer.
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeAtomicUnbounded = options => new UnboundedPubSub(options?.replay ? new ReplayBuffer(options.replay) : undefined);
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
export const capacity = self => self.pubsub.capacity;
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
export const size = self => Effect.sync(() => sizeUnsafe(self));
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
export const sizeUnsafe = self => {
  if (MutableRef.get(self.shutdownFlag)) {
    return 0;
  }
  return self.pubsub.size();
};
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
export const isFull = self => Effect.map(size(self), size => size === self.pubsub.capacity);
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
export const isEmpty = self => Effect.map(size(self), size => size === 0);
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
export const shutdown = self => Effect.uninterruptible(Effect.withFiber(fiber => {
  MutableRef.set(self.shutdownFlag, true);
  return Scope.close(self.scope, Exit.interrupt(fiber.id)).pipe(Effect.andThen(self.strategy.shutdown), Effect.when(self.shutdownHook.open), Effect.asVoid);
}));
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
export const isShutdown = self => Effect.sync(() => isShutdownUnsafe(self));
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
export const isShutdownUnsafe = self => self.shutdownFlag.current;
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
export const awaitShutdown = self => self.shutdownHook.await;
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
export const publish = /*#__PURE__*/dual(2, (self, value) => Effect.suspend(() => {
  if (self.shutdownFlag.current) {
    return Effect.succeed(false);
  }
  if (self.pubsub.publish(value)) {
    self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
    return Effect.succeed(true);
  }
  return self.strategy.handleSurplus(self.pubsub, self.subscribers, [value], self.shutdownFlag);
}));
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
export const publishUnsafe = /*#__PURE__*/dual(2, (self, value) => {
  if (self.shutdownFlag.current) return false;
  if (self.pubsub.publish(value)) {
    self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
    return true;
  }
  return false;
});
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
export const publishAll = /*#__PURE__*/dual(2, (self, elements) => Effect.suspend(() => {
  if (self.shutdownFlag.current) {
    return Effect.succeed(false);
  }
  const surplus = self.pubsub.publishAll(elements);
  self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
  if (surplus.length === 0) {
    return Effect.succeed(true);
  }
  return self.strategy.handleSurplus(self.pubsub, self.subscribers, surplus, self.shutdownFlag);
}));
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
export const subscribe = self => Effect.uninterruptible(Effect.contextWith(services => {
  const localScope = Context.get(services, Scope.Scope);
  const scope = Scope.forkUnsafe(self.scope);
  const subscription = makeSubscriptionUnsafe(self.pubsub, self.subscribers, self.strategy);
  return Scope.addFinalizer(scope, unsubscribe(subscription)).pipe(Effect.andThen(Scope.addFinalizerExit(localScope, exit => Scope.close(scope, exit))), Effect.as(subscription));
}));
const unsubscribe = self => Effect.uninterruptible(Effect.withFiber(state => {
  MutableRef.set(self.shutdownFlag, true);
  return Effect.forEach(MutableList.takeAll(self.pollers), d => Deferred.interruptWith(d, state.id), {
    discard: true,
    concurrency: "unbounded"
  }).pipe(Effect.tap(() => Effect.sync(() => {
    self.subscribers.delete(self.subscription);
    self.subscription.unsubscribe();
    self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
  })), Effect.when(self.shutdownHook.open), Effect.asVoid);
}));
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
export const take = self => Effect.suspend(() => {
  if (self.shutdownFlag.current) {
    return Effect.interrupt;
  }
  if (self.replayWindow.remaining > 0) {
    const message = self.replayWindow.take();
    return Effect.succeed(message);
  }
  const message = self.pollers.length === 0 ? self.subscription.poll() : MutableList.Empty;
  if (message === MutableList.Empty) {
    return pollForItem(self);
  } else {
    self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
    return Effect.succeed(message);
  }
});
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
export const takeAll = self => Effect.suspend(function loop(value) {
  if (self.shutdownFlag.current) {
    return Effect.interrupt;
  }
  let as = self.pollers.length === 0 ? self.subscription.pollUpTo(Number.POSITIVE_INFINITY) : [];
  if (value) {
    as = value.concat(as);
  }
  self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
  if (self.replayWindow.remaining > 0) {
    return Effect.succeed(self.replayWindow.takeAll().concat(as));
  } else if (!Arr.isArrayNonEmpty(as)) {
    return Effect.flatMap(pollForItem(self), item => loop([item]));
  }
  return Effect.succeed(as);
});
const pollForItem = self => {
  const deferred = Deferred.makeUnsafe();
  let set = self.subscribers.get(self.subscription);
  if (!set) {
    set = new Set();
    self.subscribers.set(self.subscription, set);
  }
  set.add(self.pollers);
  MutableList.append(self.pollers, deferred);
  self.strategy.completePollersUnsafe(self.pubsub, self.subscribers, self.subscription, self.pollers);
  return Effect.onInterrupt(Deferred.await(deferred), () => {
    MutableList.remove(self.pollers, deferred);
    return Effect.void;
  });
};
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
export const takeUpTo = /*#__PURE__*/dual(2, (self, max) => Effect.suspend(() => {
  if (self.shutdownFlag.current) return Effect.interrupt;
  let replay = undefined;
  if (self.replayWindow.remaining >= max) {
    return Effect.succeed(self.replayWindow.takeN(max));
  } else if (self.replayWindow.remaining > 0) {
    replay = self.replayWindow.takeAll();
    max = max - replay.length;
  }
  const as = self.pollers.length === 0 ? self.subscription.pollUpTo(max) : [];
  self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
  return replay ? Effect.succeed(replay.concat(as)) : Effect.succeed(as);
}));
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
export const takeBetween = /*#__PURE__*/dual(3, (self, min, max) => Effect.suspend(() => takeRemainderLoop(self, min, max, [])));
const takeRemainderLoop = (self, min, max, acc) => {
  if (max < min) {
    return Effect.succeed(acc);
  }
  return Effect.flatMap(takeUpTo(self, max), bs => {
    acc.push(...bs);
    const remaining = min - bs.length;
    if (remaining === 1) {
      return Effect.map(take(self), b => {
        acc.push(b);
        return acc;
      });
    }
    if (remaining > 1) {
      return Effect.flatMap(take(self), b => {
        acc.push(b);
        return takeRemainderLoop(self, remaining - 1, max - bs.length - 1, acc);
      });
    }
    return Effect.succeed(acc);
  });
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
export const remaining = self => Effect.suspend(() => self.shutdownFlag.current ? Effect.interrupt : Effect.succeed(self.subscription.size() + self.replayWindow.remaining));
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
export const remainingUnsafe = self => {
  if (self.shutdownFlag.current) {
    return Option.none();
  }
  return Option.some(self.subscription.size() + self.replayWindow.remaining);
};
// -----------------------------------------------------------------------------
// internal
// -----------------------------------------------------------------------------
const AbsentValue = /*#__PURE__*/Symbol.for("effect/PubSub/AbsentValue");
const addSubscribers = (subscribers, subscription, pollers) => {
  if (!subscribers.has(subscription)) {
    subscribers.set(subscription, new Set());
  }
  const set = subscribers.get(subscription);
  set.add(pollers);
};
const removeSubscribers = (subscribers, subscription, pollers) => {
  if (!subscribers.has(subscription)) {
    return;
  }
  const set = subscribers.get(subscription);
  set.delete(pollers);
  if (set.size === 0) {
    subscribers.delete(subscription);
  }
};
const makeSubscriptionUnsafe = (pubsub, subscribers, strategy) => new SubscriptionImpl(pubsub, subscribers, pubsub.subscribe(), MutableList.make(), Latch.makeUnsafe(false), MutableRef.make(false), strategy, pubsub.replayWindow());
class BoundedPubSubArb {
  array;
  publisherIndex = 0;
  subscribers;
  subscriberCount = 0;
  subscribersIndex = 0;
  capacity;
  replayBuffer;
  constructor(capacity, replayBuffer) {
    this.capacity = capacity;
    this.replayBuffer = replayBuffer;
    this.array = Array.from({
      length: capacity
    });
    this.subscribers = Array.from({
      length: capacity
    });
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherIndex === this.subscribersIndex;
  }
  isFull() {
    return this.publisherIndex === this.subscribersIndex + this.capacity;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    if (this.subscriberCount !== 0) {
      const index = this.publisherIndex % this.capacity;
      this.array[index] = value;
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.offer(value);
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = Arr.fromIterable(elements);
    const n = chunk.length;
    const size = this.publisherIndex - this.subscribersIndex;
    const available = this.capacity - size;
    const forPubSub = Math.min(n, available);
    if (forPubSub === 0) {
      return chunk;
    }
    let iteratorIndex = 0;
    const publishAllIndex = this.publisherIndex + forPubSub;
    while (this.publisherIndex !== publishAllIndex) {
      const a = chunk[iteratorIndex++];
      const index = this.publisherIndex % this.capacity;
      this.array[index] = a;
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
      if (this.replayBuffer) {
        this.replayBuffer.offer(a);
      }
    }
    return chunk.slice(iteratorIndex);
  }
  slide() {
    if (this.subscribersIndex !== this.publisherIndex) {
      const index = this.subscribersIndex % this.capacity;
      this.array[index] = AbsentValue;
      this.subscribers[index] = 0;
      this.subscribersIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.slide();
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubArbSubscription(this, this.publisherIndex, false);
  }
}
class BoundedPubSubArbSubscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.publisherIndex === this.subscriberIndex || this.self.publisherIndex === this.self.subscribersIndex;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return MutableList.Empty;
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    if (this.subscriberIndex !== this.self.publisherIndex) {
      const index = this.subscriberIndex % this.self.capacity;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      this.subscriberIndex += 1;
      return elem;
    }
    return MutableList.Empty;
  }
  pollUpTo(n) {
    if (this.unsubscribed) {
      return [];
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    const size = this.self.publisherIndex - this.subscriberIndex;
    const toPoll = Math.min(n, size);
    if (toPoll <= 0) {
      return [];
    }
    const builder = [];
    const pollUpToIndex = this.subscriberIndex + toPoll;
    while (this.subscriberIndex !== pollUpToIndex) {
      const index = this.subscriberIndex % this.self.capacity;
      const a = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      builder.push(a);
      this.subscriberIndex += 1;
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
      while (this.subscriberIndex !== this.self.publisherIndex) {
        const index = this.subscriberIndex % this.self.capacity;
        this.self.subscribers[index] -= 1;
        if (this.self.subscribers[index] === 0) {
          this.self.array[index] = AbsentValue;
          this.self.subscribersIndex += 1;
        }
        this.subscriberIndex += 1;
      }
    }
  }
}
class BoundedPubSubPow2 {
  array;
  mask;
  publisherIndex = 0;
  subscribers;
  subscriberCount = 0;
  subscribersIndex = 0;
  capacity;
  replayBuffer;
  constructor(capacity, replayBuffer) {
    this.capacity = capacity;
    this.replayBuffer = replayBuffer;
    this.array = Array.from({
      length: capacity
    });
    this.mask = capacity - 1;
    this.subscribers = Array.from({
      length: capacity
    });
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherIndex === this.subscribersIndex;
  }
  isFull() {
    return this.publisherIndex === this.subscribersIndex + this.capacity;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    if (this.subscriberCount !== 0) {
      const index = this.publisherIndex & this.mask;
      this.array[index] = value;
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.offer(value);
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = Arr.fromIterable(elements);
    const n = chunk.length;
    const size = this.publisherIndex - this.subscribersIndex;
    const available = this.capacity - size;
    const forPubSub = Math.min(n, available);
    if (forPubSub === 0) {
      return chunk;
    }
    let iteratorIndex = 0;
    const publishAllIndex = this.publisherIndex + forPubSub;
    while (this.publisherIndex !== publishAllIndex) {
      const elem = chunk[iteratorIndex++];
      const index = this.publisherIndex & this.mask;
      this.array[index] = elem;
      this.subscribers[index] = this.subscriberCount;
      this.publisherIndex += 1;
      if (this.replayBuffer) {
        this.replayBuffer.offer(elem);
      }
    }
    return chunk.slice(iteratorIndex);
  }
  slide() {
    if (this.subscribersIndex !== this.publisherIndex) {
      const index = this.subscribersIndex & this.mask;
      this.array[index] = AbsentValue;
      this.subscribers[index] = 0;
      this.subscribersIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.slide();
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubPow2Subscription(this, this.publisherIndex, false);
  }
}
class BoundedPubSubPow2Subscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.publisherIndex === this.subscriberIndex || this.self.publisherIndex === this.self.subscribersIndex;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return MutableList.Empty;
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    if (this.subscriberIndex !== this.self.publisherIndex) {
      const index = this.subscriberIndex & this.self.mask;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      this.subscriberIndex += 1;
      return elem;
    }
    return MutableList.Empty;
  }
  pollUpTo(n) {
    if (this.unsubscribed) {
      return [];
    }
    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
    const size = this.self.publisherIndex - this.subscriberIndex;
    const toPoll = Math.min(n, size);
    if (toPoll <= 0) {
      return [];
    }
    const builder = [];
    const pollUpToIndex = this.subscriberIndex + toPoll;
    while (this.subscriberIndex !== pollUpToIndex) {
      const index = this.subscriberIndex & this.self.mask;
      const elem = this.self.array[index];
      this.self.subscribers[index] -= 1;
      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = AbsentValue;
        this.self.subscribersIndex += 1;
      }
      builder.push(elem);
      this.subscriberIndex += 1;
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex);
      while (this.subscriberIndex !== this.self.publisherIndex) {
        const index = this.subscriberIndex & this.self.mask;
        this.self.subscribers[index] -= 1;
        if (this.self.subscribers[index] === 0) {
          this.self.array[index] = AbsentValue;
          this.self.subscribersIndex += 1;
        }
        this.subscriberIndex += 1;
      }
    }
  }
}
class BoundedPubSubSingle {
  publisherIndex = 0;
  subscriberCount = 0;
  subscribers = 0;
  value = AbsentValue;
  capacity = 1;
  replayBuffer;
  constructor(replayBuffer) {
    this.replayBuffer = replayBuffer;
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  isEmpty() {
    return this.subscribers === 0;
  }
  isFull() {
    return !this.isEmpty();
  }
  size() {
    return this.isEmpty() ? 0 : 1;
  }
  publish(value) {
    if (this.isFull()) {
      return false;
    }
    if (this.subscriberCount !== 0) {
      this.value = value;
      this.subscribers = this.subscriberCount;
      this.publisherIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.offer(value);
    }
    return true;
  }
  publishAll(elements) {
    if (this.subscriberCount === 0) {
      if (this.replayBuffer) {
        this.replayBuffer.offerAll(elements);
      }
      return [];
    }
    const chunk = Arr.fromIterable(elements);
    if (chunk.length === 0) {
      return chunk;
    }
    if (this.publish(chunk[0])) {
      return chunk.slice(1);
    } else {
      return chunk;
    }
  }
  slide() {
    if (this.isFull()) {
      this.subscribers = 0;
      this.value = AbsentValue;
    }
    if (this.replayBuffer) {
      this.replayBuffer.slide();
    }
  }
  subscribe() {
    this.subscriberCount += 1;
    return new BoundedPubSubSingleSubscription(this, this.publisherIndex, false);
  }
}
class BoundedPubSubSingleSubscription {
  self;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    return this.unsubscribed || this.self.subscribers === 0 || this.subscriberIndex === this.self.publisherIndex;
  }
  size() {
    return this.isEmpty() ? 0 : 1;
  }
  poll() {
    if (this.isEmpty()) {
      return MutableList.Empty;
    }
    const elem = this.self.value;
    this.self.subscribers -= 1;
    if (this.self.subscribers === 0) {
      this.self.value = AbsentValue;
    }
    this.subscriberIndex += 1;
    return elem;
  }
  pollUpTo(n) {
    if (this.isEmpty() || n < 1) {
      return [];
    }
    const a = this.self.value;
    this.self.subscribers -= 1;
    if (this.self.subscribers === 0) {
      this.self.value = AbsentValue;
    }
    this.subscriberIndex += 1;
    return [a];
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.subscriberCount -= 1;
      if (this.subscriberIndex !== this.self.publisherIndex) {
        this.self.subscribers -= 1;
        if (this.self.subscribers === 0) {
          this.self.value = AbsentValue;
        }
      }
    }
  }
}
class UnboundedPubSub {
  publisherHead = {
    value: AbsentValue,
    subscribers: 0,
    next: null
  };
  publisherTail = this.publisherHead;
  publisherIndex = 0;
  subscribersIndex = 0;
  capacity = Number.MAX_SAFE_INTEGER;
  replayBuffer;
  constructor(replayBuffer) {
    this.replayBuffer = replayBuffer;
  }
  replayWindow() {
    return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
  }
  isEmpty() {
    return this.publisherHead === this.publisherTail;
  }
  isFull() {
    return false;
  }
  size() {
    return this.publisherIndex - this.subscribersIndex;
  }
  publish(value) {
    const subscribers = this.publisherTail.subscribers;
    if (subscribers !== 0) {
      this.publisherTail.next = {
        value,
        subscribers,
        next: null
      };
      this.publisherTail = this.publisherTail.next;
      this.publisherIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.offer(value);
    }
    return true;
  }
  publishAll(elements) {
    if (this.publisherTail.subscribers !== 0) {
      for (const a of elements) {
        this.publish(a);
      }
    } else if (this.replayBuffer) {
      this.replayBuffer.offerAll(elements);
    }
    return [];
  }
  slide() {
    if (this.publisherHead !== this.publisherTail) {
      this.publisherHead = this.publisherHead.next;
      this.publisherHead.value = AbsentValue;
      this.subscribersIndex += 1;
    }
    if (this.replayBuffer) {
      this.replayBuffer.slide();
    }
  }
  subscribe() {
    this.publisherTail.subscribers += 1;
    return new UnboundedPubSubSubscription(this, this.publisherTail, this.publisherIndex, false);
  }
}
class UnboundedPubSubSubscription {
  self;
  subscriberHead;
  subscriberIndex;
  unsubscribed;
  constructor(self, subscriberHead, subscriberIndex, unsubscribed) {
    this.self = self;
    this.subscriberHead = subscriberHead;
    this.subscriberIndex = subscriberIndex;
    this.unsubscribed = unsubscribed;
  }
  isEmpty() {
    if (this.unsubscribed) {
      return true;
    }
    let empty = true;
    let loop = true;
    while (loop) {
      if (this.subscriberHead === this.self.publisherTail) {
        loop = false;
      } else {
        if (this.subscriberHead.next.value !== AbsentValue) {
          empty = false;
          loop = false;
        } else {
          this.subscriberHead = this.subscriberHead.next;
          this.subscriberIndex += 1;
        }
      }
    }
    return empty;
  }
  size() {
    if (this.unsubscribed) {
      return 0;
    }
    return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
  }
  poll() {
    if (this.unsubscribed) {
      return MutableList.Empty;
    }
    let loop = true;
    let polled = MutableList.Empty;
    while (loop) {
      if (this.subscriberHead === this.self.publisherTail) {
        loop = false;
      } else {
        const elem = this.subscriberHead.next.value;
        if (elem !== AbsentValue) {
          polled = elem;
          this.subscriberHead.subscribers -= 1;
          if (this.subscriberHead.subscribers === 0) {
            this.self.publisherHead = this.self.publisherHead.next;
            this.self.publisherHead.value = AbsentValue;
            this.self.subscribersIndex += 1;
          }
          loop = false;
        }
        this.subscriberHead = this.subscriberHead.next;
        this.subscriberIndex += 1;
      }
    }
    return polled;
  }
  pollUpTo(n) {
    const builder = [];
    let i = 0;
    while (i !== n) {
      const a = this.poll();
      if (a === MutableList.Empty) {
        i = n;
      } else {
        builder.push(a);
        i += 1;
      }
    }
    return builder;
  }
  unsubscribe() {
    if (!this.unsubscribed) {
      this.unsubscribed = true;
      this.self.publisherTail.subscribers -= 1;
      while (this.subscriberHead !== this.self.publisherTail) {
        if (this.subscriberHead.next.value !== AbsentValue) {
          this.subscriberHead.subscribers -= 1;
          if (this.subscriberHead.subscribers === 0) {
            this.self.publisherHead = this.self.publisherHead.next;
            this.self.publisherHead.value = AbsentValue;
            this.self.subscribersIndex += 1;
          }
        }
        this.subscriberHead = this.subscriberHead.next;
      }
    }
  }
}
class SubscriptionImpl {
  [SubscriptionTypeId] = {
    _A: identity
  };
  pubsub;
  subscribers;
  subscription;
  pollers;
  shutdownHook;
  shutdownFlag;
  strategy;
  replayWindow;
  constructor(pubsub, subscribers, subscription, pollers, shutdownHook, shutdownFlag, strategy, replayWindow) {
    this.pubsub = pubsub;
    this.subscribers = subscribers;
    this.subscription = subscription;
    this.pollers = pollers;
    this.shutdownHook = shutdownHook;
    this.shutdownFlag = shutdownFlag;
    this.strategy = strategy;
    this.replayWindow = replayWindow;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
class PubSubImpl {
  [TypeId] = {
    _A: identity
  };
  pubsub;
  subscribers;
  scope;
  shutdownHook;
  shutdownFlag;
  strategy;
  constructor(pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy) {
    this.pubsub = pubsub;
    this.subscribers = subscribers;
    this.scope = scope;
    this.shutdownHook = shutdownHook;
    this.shutdownFlag = shutdownFlag;
    this.strategy = strategy;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
const makePubSubUnsafe = (pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy) => new PubSubImpl(pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy);
const ensureCapacity = capacity => {
  if (capacity <= 0) {
    throw new Error(`Cannot construct PubSub with capacity of ${capacity}`);
  }
};
// -----------------------------------------------------------------------------
// PubSub.Strategy
// -----------------------------------------------------------------------------
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
export class BackPressureStrategy {
  publishers = /*#__PURE__*/MutableList.make();
  get shutdown() {
    return Effect.withFiber(fiber => Effect.forEach(MutableList.takeAll(this.publishers), ([_, deferred, last]) => last ? Deferred.interruptWith(deferred, fiber.id) : Effect.void, {
      concurrency: "unbounded",
      discard: true
    }));
  }
  handleSurplus(pubsub, subscribers, elements, isShutdown) {
    return Effect.suspend(() => {
      const deferred = Deferred.makeUnsafe();
      this.offerUnsafe(elements, deferred);
      this.onPubSubEmptySpaceUnsafe(pubsub, subscribers);
      this.completeSubscribersUnsafe(pubsub, subscribers);
      return (MutableRef.get(isShutdown) ? Effect.interrupt : Deferred.await(deferred)).pipe(Effect.onInterrupt(() => {
        this.removeUnsafe(deferred);
        return Effect.void;
      }));
    });
  }
  onPubSubEmptySpaceUnsafe(pubsub, subscribers) {
    let keepPolling = true;
    while (keepPolling && !pubsub.isFull()) {
      const publisher = MutableList.take(this.publishers);
      if (publisher === MutableList.Empty) {
        keepPolling = false;
      } else {
        const [value, deferred] = publisher;
        const published = pubsub.publish(value);
        if (published && publisher[2]) {
          Deferred.doneUnsafe(deferred, Exit.succeed(true));
        } else if (!published) {
          MutableList.prepend(this.publishers, publisher);
        }
        this.completeSubscribersUnsafe(pubsub, subscribers);
      }
    }
  }
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
  offerUnsafe(elements, deferred) {
    const iterator = elements[Symbol.iterator]();
    let next = iterator.next();
    if (!next.done) {
      // oxlint-disable-next-line no-constant-condition
      while (1) {
        const value = next.value;
        next = iterator.next();
        if (next.done) {
          MutableList.append(this.publishers, [value, deferred, true]);
          break;
        }
        MutableList.append(this.publishers, [value, deferred, false]);
      }
    }
  }
  removeUnsafe(deferred) {
    MutableList.filter(this.publishers, ([_, d]) => d !== deferred);
  }
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
export class DroppingStrategy {
  get shutdown() {
    return Effect.void;
  }
  handleSurplus(_pubsub, _subscribers, _elements, _isShutdown) {
    return Effect.succeed(false);
  }
  onPubSubEmptySpaceUnsafe(_pubsub, _subscribers) {
    //
  }
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
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
export class SlidingStrategy {
  get shutdown() {
    return Effect.void;
  }
  handleSurplus(pubsub, subscribers, elements, _isShutdown) {
    return Effect.sync(() => {
      this.slidingPublishUnsafe(pubsub, elements);
      this.completeSubscribersUnsafe(pubsub, subscribers);
      return true;
    });
  }
  onPubSubEmptySpaceUnsafe(_pubsub, _subscribers) {
    //
  }
  completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
    return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
  }
  completeSubscribersUnsafe(pubsub, subscribers) {
    return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
  }
  slidingPublishUnsafe(pubsub, elements) {
    const it = elements[Symbol.iterator]();
    let next = it.next();
    if (!next.done && pubsub.capacity > 0) {
      let a = next.value;
      let loop = true;
      while (loop) {
        pubsub.slide();
        const pub = pubsub.publish(a);
        if (pub && (next = it.next()) && !next.done) {
          a = next.value;
        } else if (pub) {
          loop = false;
        }
      }
    }
  }
}
const strategyCompletePollersUnsafe = (strategy, pubsub, subscribers, subscription, pollers) => {
  let keepPolling = true;
  while (keepPolling && !subscription.isEmpty()) {
    const poller = MutableList.take(pollers);
    if (poller === MutableList.Empty) {
      removeSubscribers(subscribers, subscription, pollers);
      if (pollers.length === 0) {
        keepPolling = false;
      } else {
        addSubscribers(subscribers, subscription, pollers);
      }
    } else {
      const pollResult = subscription.poll();
      if (pollResult === MutableList.Empty) {
        MutableList.prepend(pollers, poller);
      } else {
        Deferred.doneUnsafe(poller, Exit.succeed(pollResult));
        strategy.onPubSubEmptySpaceUnsafe(pubsub, subscribers);
      }
    }
  }
};
const strategyCompleteSubscribersUnsafe = (strategy, pubsub, subscribers) => {
  for (const [subscription, pollersSet] of subscribers) {
    for (const pollers of pollersSet) {
      strategy.completePollersUnsafe(pubsub, subscribers, subscription, pollers);
    }
  }
};
class ReplayBuffer {
  capacity;
  head = {
    value: AbsentValue,
    next: null
  };
  tail = this.head;
  size = 0;
  index = 0;
  constructor(capacity) {
    this.capacity = capacity;
  }
  slide() {
    this.index++;
  }
  offer(a) {
    this.tail.value = a;
    this.tail.next = {
      value: AbsentValue,
      next: null
    };
    this.tail = this.tail.next;
    if (this.size === this.capacity) {
      this.head = this.head.next;
    } else {
      this.size += 1;
    }
  }
  offerAll(as) {
    for (const a of as) {
      this.offer(a);
    }
  }
}
class ReplayWindowImpl {
  head;
  index;
  remaining;
  buffer;
  constructor(buffer) {
    this.buffer = buffer;
    this.index = buffer.index;
    this.remaining = buffer.size;
    this.head = buffer.head;
  }
  fastForward() {
    while (this.index < this.buffer.index) {
      this.head = this.head.next;
      this.index++;
    }
  }
  take() {
    if (this.remaining === 0) {
      return undefined;
    } else if (this.index < this.buffer.index) {
      this.fastForward();
    }
    this.remaining--;
    const value = this.head.value;
    this.head = this.head.next;
    return value;
  }
  takeN(n) {
    if (this.remaining === 0) {
      return [];
    } else if (this.index < this.buffer.index) {
      this.fastForward();
    }
    const len = Math.min(n, this.remaining);
    const items = new Array(len);
    for (let i = 0; i < len; i++) {
      const value = this.head.value;
      this.head = this.head.next;
      items[i] = value;
    }
    this.remaining -= len;
    return items;
  }
  takeAll() {
    return this.takeN(this.remaining);
  }
}
const emptyReplayWindow = {
  remaining: 0,
  take: () => undefined,
  takeN: () => [],
  takeAll: () => []
};
//# sourceMappingURL=PubSub.js.map