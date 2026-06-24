/**
 * TxSubscriptionRef is a TxRef that allows subscribing to all committed changes. Subscribers
 * receive the current value followed by every subsequent update via a transactional queue.
 *
 * @since 4.0.0
 */
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import { NodeInspectSymbol, toJson } from "./Inspectable.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as Stream from "./Stream.js";
import * as TxPubSub from "./TxPubSub.js";
import * as TxQueue from "./TxQueue.js";
import * as TxRef from "./TxRef.js";
const TypeId = "~effect/transactions/TxSubscriptionRef";
const TxSubscriptionRefProto = {
  [NodeInspectSymbol]() {
    return toJson(this);
  },
  toJSON() {
    return {
      _id: "TxSubscriptionRef"
    };
  },
  toString() {
    return "TxSubscriptionRef";
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
// =============================================================================
// Constructors
// =============================================================================
/**
 * Creates a new TxSubscriptionRef with the specified initial value.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(42)
 *   const value = yield* TxSubscriptionRef.get(ref)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = value => Effect.gen(function* () {
  const ref = yield* TxRef.make(value);
  const pubsub = yield* TxPubSub.unbounded();
  const self = Object.create(TxSubscriptionRefProto);
  self[TypeId] = TypeId;
  self.ref = ref;
  self.pubsub = pubsub;
  return self;
}).pipe(Effect.tx);
// =============================================================================
// Getters
// =============================================================================
/**
 * Reads the current value of the TxSubscriptionRef.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make("hello")
 *   const value = yield* TxSubscriptionRef.get(ref)
 *   console.log(value) // "hello"
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const get = self => TxRef.get(self.ref);
// =============================================================================
// Mutations
// =============================================================================
/**
 * Modifies the value of the TxSubscriptionRef using a function that returns both a
 * result and the new value. The new value is published to all subscribers atomically.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(10)
 *   const result = yield* TxSubscriptionRef.modify(ref, (n) => [`was ${n}`, n + 1])
 *   console.log(result) // "was 10"
 *   console.log(yield* TxSubscriptionRef.get(ref)) // 11
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const modify = /*#__PURE__*/dual(2, (self, f) => Effect.gen(function* () {
  const current = yield* TxRef.get(self.ref);
  const [returnValue, newValue] = f(current);
  yield* TxRef.set(self.ref, newValue);
  yield* TxPubSub.publish(self.pubsub, newValue);
  return returnValue;
}).pipe(Effect.tx));
/**
 * Sets the value of the TxSubscriptionRef and publishes the new value to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(0)
 *   yield* TxSubscriptionRef.set(ref, 42)
 *   console.log(yield* TxSubscriptionRef.get(ref)) // 42
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const set = /*#__PURE__*/dual(2, (self, value) => modify(self, () => [void 0, value]));
/**
 * Updates the value of the TxSubscriptionRef using a function and publishes the new
 * value to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(5)
 *   yield* TxSubscriptionRef.update(ref, (n) => n * 2)
 *   console.log(yield* TxSubscriptionRef.get(ref)) // 10
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const update = /*#__PURE__*/dual(2, (self, f) => modify(self, current => [void 0, f(current)]));
/**
 * Gets the current value and sets a new value atomically. Publishes the new value
 * to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make("a")
 *   const old = yield* TxSubscriptionRef.getAndSet(ref, "b")
 *   console.log(old) // "a"
 *   console.log(yield* TxSubscriptionRef.get(ref)) // "b"
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const getAndSet = /*#__PURE__*/dual(2, (self, value) => modify(self, current => [current, value]));
/**
 * Gets the current value and updates it using a function atomically. Publishes
 * the new value to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(1)
 *   const old = yield* TxSubscriptionRef.getAndUpdate(ref, (n) => n + 10)
 *   console.log(old) // 1
 *   console.log(yield* TxSubscriptionRef.get(ref)) // 11
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const getAndUpdate = /*#__PURE__*/dual(2, (self, f) => modify(self, current => [current, f(current)]));
/**
 * Updates the value using a function and returns the new value. Publishes the
 * new value to all subscribers.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(3)
 *   const result = yield* TxSubscriptionRef.updateAndGet(ref, (n) => n * 3)
 *   console.log(result) // 9
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const updateAndGet = /*#__PURE__*/dual(2, (self, f) => modify(self, current => {
  const newValue = f(current);
  return [newValue, newValue];
}));
// =============================================================================
// Subscriptions
// =============================================================================
/**
 * Subscribes to all changes of the TxSubscriptionRef. Returns a scoped TxDequeue
 * that first yields the current value, then every subsequent update.
 *
 * @example
 * ```ts
 * import { Effect, TxSubscriptionRef, TxQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(0)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       const sub = yield* TxSubscriptionRef.changes(ref)
 *       const initial = yield* TxQueue.take(sub)
 *       console.log(initial) // 0
 *
 *       yield* TxSubscriptionRef.set(ref, 1)
 *       const next = yield* TxQueue.take(sub)
 *       console.log(next) // 1
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscriptions
 */
export const changes = self => Effect.acquireRelease(Effect.tx(Effect.gen(function* () {
  const sub = yield* TxPubSub.acquireSubscriber(self.pubsub);
  const current = yield* TxRef.get(self.ref);
  yield* TxQueue.offer(sub, current);
  return sub;
})), queue => Effect.tx(TxPubSub.releaseSubscriber(self.pubsub, queue)));
/**
 * Returns a Stream of all changes to the TxSubscriptionRef, starting with the
 * current value followed by every subsequent update.
 *
 * @example
 * ```ts
 * import { Effect, Stream, TxSubscriptionRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const ref = yield* TxSubscriptionRef.make(0)
 *   yield* TxSubscriptionRef.set(ref, 1)
 *   yield* TxSubscriptionRef.set(ref, 2)
 *
 *   const values = yield* Stream.runCollect(
 *     TxSubscriptionRef.changesStream(ref).pipe(Stream.take(1))
 *   )
 *   console.log(values) // [2]
 * })
 * ```
 *
 * @since 4.0.0
 * @category subscriptions
 */
export const changesStream = self => Stream.unwrap(Effect.map(changes(self), sub => Stream.fromEffectRepeat(Effect.tx(TxQueue.take(sub)))));
// =============================================================================
// Guards
// =============================================================================
/**
 * Checks if the given value is a TxSubscriptionRef.
 *
 * @example
 * ```ts
 * import { TxSubscriptionRef } from "effect"
 *
 * declare const someValue: unknown
 *
 * if (TxSubscriptionRef.isTxSubscriptionRef(someValue)) {
 *   console.log("This is a TxSubscriptionRef")
 * }
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export const isTxSubscriptionRef = u => hasProperty(u, TypeId);
//# sourceMappingURL=TxSubscriptionRef.js.map