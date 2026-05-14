/**
 * TxPubSub is a transactional publish/subscribe hub that provides Software Transactional Memory
 * (STM) semantics for message broadcasting. Publishers broadcast messages to all current
 * subscribers, with each subscriber receiving its own copy of every published message.
 *
 * Supports multiple queue strategies: bounded, unbounded, dropping, and sliding.
 *
 * @since 4.0.0
 */
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import { NodeInspectSymbol, toJson } from "./Inspectable.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as TxQueue from "./TxQueue.js";
import * as TxRef from "./TxRef.js";
const TypeId = "~effect/transactions/TxPubSub";
const TxPubSubProto = {
  [NodeInspectSymbol]() {
    return toJson(this);
  },
  toJSON() {
    return {
      _id: "TxPubSub",
      strategy: this.strategy,
      capacity: this.capacity
    };
  },
  toString() {
    return `TxPubSub(${this.strategy}, ${this.capacity})`;
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makeTxPubSub = (subscribersRef, shutdownRef, strategy, cap) => {
  const self = Object.create(TxPubSubProto);
  self[TypeId] = TypeId;
  self.subscribersRef = subscribersRef;
  self.shutdownRef = shutdownRef;
  self.strategy = strategy;
  self.capacity = cap;
  return self;
};
// =============================================================================
// Constructors
// =============================================================================
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
export const bounded = capacity => Effect.gen(function* () {
  const subscribersRef = yield* TxRef.make([]);
  const shutdownRef = yield* TxRef.make(false);
  return makeTxPubSub(subscribersRef, shutdownRef, "bounded", capacity);
}).pipe(Effect.tx);
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
export const dropping = capacity => Effect.gen(function* () {
  const subscribersRef = yield* TxRef.make([]);
  const shutdownRef = yield* TxRef.make(false);
  return makeTxPubSub(subscribersRef, shutdownRef, "dropping", capacity);
}).pipe(Effect.tx);
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
export const sliding = capacity => Effect.gen(function* () {
  const subscribersRef = yield* TxRef.make([]);
  const shutdownRef = yield* TxRef.make(false);
  return makeTxPubSub(subscribersRef, shutdownRef, "sliding", capacity);
}).pipe(Effect.tx);
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
export const unbounded = () => Effect.gen(function* () {
  const subscribersRef = yield* TxRef.make([]);
  const shutdownRef = yield* TxRef.make(false);
  return makeTxPubSub(subscribersRef, shutdownRef, "unbounded", Number.POSITIVE_INFINITY);
}).pipe(Effect.tx);
// =============================================================================
// Getters
// =============================================================================
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
export const capacity = self => self.capacity;
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
export const size = self => Effect.gen(function* () {
  const subscribers = yield* TxRef.get(self.subscribersRef);
  let maxSize = 0;
  for (const queue of subscribers) {
    const s = yield* TxQueue.size(queue);
    if (s > maxSize) maxSize = s;
  }
  return maxSize;
}).pipe(Effect.tx);
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
export const isEmpty = self => Effect.map(size(self), s => s === 0);
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
export const isFull = self => Effect.gen(function* () {
  if (self.capacity === Number.POSITIVE_INFINITY) return false;
  const subscribers = yield* TxRef.get(self.subscribersRef);
  for (const queue of subscribers) {
    if (yield* TxQueue.isFull(queue)) return true;
  }
  return false;
}).pipe(Effect.tx);
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
export const isShutdown = self => TxRef.get(self.shutdownRef);
// =============================================================================
// Mutations
// =============================================================================
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
export const publish = /*#__PURE__*/dual(2, (self, value) => Effect.gen(function* () {
  if (yield* TxRef.get(self.shutdownRef)) return false;
  const subscribers = yield* TxRef.get(self.subscribersRef);
  let allAccepted = true;
  for (const queue of subscribers) {
    const accepted = yield* TxQueue.offer(queue, value);
    if (!accepted) allAccepted = false;
  }
  return allAccepted;
}).pipe(Effect.tx));
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
export const publishAll = /*#__PURE__*/dual(2, (self, values) => Effect.gen(function* () {
  if (yield* TxRef.get(self.shutdownRef)) return false;
  let allAccepted = true;
  for (const value of values) {
    const accepted = yield* publish(self, value);
    if (!accepted) allAccepted = false;
  }
  return allAccepted;
}).pipe(Effect.tx));
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
export const subscribe = self => Effect.acquireRelease(Effect.tx(acquireSubscriber(self)), queue => Effect.tx(releaseSubscriber(self, queue)));
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
export const acquireSubscriber = self => Effect.gen(function* () {
  const queue = yield* makeSubscriberQueue(self.strategy, self.capacity);
  yield* TxRef.update(self.subscribersRef, subs => [...subs, queue]);
  return queue;
});
/**
 * Removes a subscriber queue from the pub/sub and shuts it down.
 *
 * This is the transactional release step of `subscribe`, exposed so that
 * callers can compose it with other Tx operations in a single transaction.
 *
 * @since 4.0.0
 * @category mutations
 */
export const releaseSubscriber = /*#__PURE__*/dual(2, (self, queue) => Effect.gen(function* () {
  yield* TxRef.update(self.subscribersRef, subs => subs.filter(q => q !== queue));
  yield* TxQueue.shutdown(queue);
}));
const makeSubscriberQueue = (strategy, cap) => {
  switch (strategy) {
    case "bounded":
      return TxQueue.bounded(cap);
    case "dropping":
      return TxQueue.dropping(cap);
    case "sliding":
      return TxQueue.sliding(cap);
    case "unbounded":
      return TxQueue.unbounded();
  }
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
export const shutdown = self => Effect.gen(function* () {
  const alreadyShutdown = yield* TxRef.get(self.shutdownRef);
  if (alreadyShutdown) return;
  yield* TxRef.set(self.shutdownRef, true);
  const subscribers = yield* TxRef.get(self.subscribersRef);
  for (const queue of subscribers) {
    yield* TxQueue.shutdown(queue);
  }
}).pipe(Effect.tx);
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
export const awaitShutdown = self => Effect.gen(function* () {
  const shut = yield* TxRef.get(self.shutdownRef);
  if (shut) return;
  return yield* Effect.txRetry;
}).pipe(Effect.tx);
// =============================================================================
// Guards
// =============================================================================
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
export const isTxPubSub = u => hasProperty(u, TypeId);
//# sourceMappingURL=TxPubSub.js.map