/**
 * A transactional priority queue. Elements are dequeued in order determined by the
 * provided `Order` instance. All operations participate in the STM transaction system.
 *
 * @since 4.0.0
 */
import * as C from "./Chunk.js";
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import { NodeInspectSymbol, toJson } from "./Inspectable.js";
import * as O from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as TxRef from "./TxRef.js";
const TypeId = "~effect/transactions/TxPriorityQueue";
const TxPriorityQueueProto = {
  [NodeInspectSymbol]() {
    return toJson(this);
  },
  toJSON() {
    return {
      _id: "TxPriorityQueue"
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makeTxPriorityQueue = (ref, ord) => {
  const self = Object.create(TxPriorityQueueProto);
  self[TypeId] = TypeId;
  self.ref = ref;
  self.ord = ord;
  return self;
};
const insertSorted = (chunk, value, ord) => {
  const arr = C.toArray(chunk);
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (ord(arr[mid], value) <= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  const out = Array(arr.length + 1);
  for (let i = 0; i < lo; i++) out[i] = arr[i];
  out[lo] = value;
  for (let i = lo; i < arr.length; i++) out[i + 1] = arr[i];
  return C.fromIterable(out);
};
/**
 * Creates an empty `TxPriorityQueue` with the given ordering.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   const empty = yield* TxPriorityQueue.isEmpty(pq)
 *   console.log(empty) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const empty = order => Effect.map(TxRef.make(C.empty()), ref => makeTxPriorityQueue(ref, order));
/**
 * Creates a `TxPriorityQueue` from an iterable of elements.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [3, 1, 2])
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromIterable = /*#__PURE__*/dual(2, (order, iterable) => {
  const arr = Array.from(iterable).sort((a, b) => order(a, b));
  return Effect.map(TxRef.make(C.fromIterable(arr)), ref => makeTxPriorityQueue(ref, order));
});
/**
 * Creates a `TxPriorityQueue` from variadic elements.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.make(Order.Number)(3, 1, 2)
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = order => (...elements) => fromIterable(order, elements);
/**
 * Returns the number of elements in the queue.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [1, 2, 3])
 *   const s = yield* TxPriorityQueue.size(pq)
 *   console.log(s) // 3
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const size = self => Effect.map(TxRef.get(self.ref), C.size);
/**
 * Returns `true` if the queue is empty.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   const empty = yield* TxPriorityQueue.isEmpty(pq)
 *   console.log(empty) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const isEmpty = self => Effect.map(size(self), n => n === 0);
/**
 * Returns `true` if the queue has at least one element.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [1])
 *   const nonEmpty = yield* TxPriorityQueue.isNonEmpty(pq)
 *   console.log(nonEmpty) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const isNonEmpty = self => Effect.map(size(self), n => n > 0);
/**
 * Observes the smallest element without removing it. Retries if the queue is
 * empty.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [3, 1, 2])
 *   const top = yield* TxPriorityQueue.peek(pq)
 *   console.log(top) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const peek = self => Effect.gen(function* () {
  const chunk = yield* TxRef.get(self.ref);
  const head = C.head(chunk);
  if (O.isNone(head)) {
    return yield* Effect.txRetry;
  }
  return head.value;
}).pipe(Effect.tx);
/**
 * Observes the smallest element without removing it. Returns `None` if the
 * queue is empty.
 *
 * @example
 * ```ts
 * import { Effect, Option, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   const result = yield* TxPriorityQueue.peekOption(pq)
 *   console.log(Option.isNone(result)) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export const peekOption = self => Effect.map(TxRef.get(self.ref), C.head);
/**
 * Inserts an element into the queue in sorted position.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   yield* TxPriorityQueue.offer(pq, 2)
 *   yield* TxPriorityQueue.offer(pq, 1)
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const offer = /*#__PURE__*/dual(2, (self, value) => TxRef.update(self.ref, chunk => insertSorted(chunk, value, self.ord)));
/**
 * Inserts all elements from an iterable into the queue.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   yield* TxPriorityQueue.offerAll(pq, [3, 1, 2])
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const offerAll = /*#__PURE__*/dual(2, (self, values) => TxRef.update(self.ref, chunk => {
  const arr = [...C.toArray(chunk), ...values].sort((a, b) => self.ord(a, b));
  return C.fromIterable(arr);
}));
/**
 * Takes the smallest element from the queue. Retries if the queue is empty.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [3, 1, 2])
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const take = self => Effect.gen(function* () {
  const chunk = yield* TxRef.get(self.ref);
  const head = C.head(chunk);
  if (O.isNone(head)) {
    return yield* Effect.txRetry;
  }
  yield* TxRef.set(self.ref, C.drop(chunk, 1));
  return head.value;
}).pipe(Effect.tx);
/**
 * Takes all elements from the queue, returning them in priority order.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [3, 1, 2])
 *   const all = yield* TxPriorityQueue.takeAll(pq)
 *   console.log(all) // [1, 2, 3]
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const takeAll = self => Effect.map(TxRef.modify(self.ref, chunk => [chunk, C.empty()]), C.toArray);
/**
 * Tries to take the smallest element. Returns `None` if the queue is empty.
 *
 * @example
 * ```ts
 * import { Effect, Option, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   const result = yield* TxPriorityQueue.takeOption(pq)
 *   console.log(Option.isNone(result)) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const takeOption = self => TxRef.modify(self.ref, chunk => {
  const head = C.head(chunk);
  if (O.isNone(head)) {
    return [O.none(), chunk];
  }
  return [O.some(head.value), C.drop(chunk, 1)];
});
/**
 * Takes up to `n` elements from the queue in priority order.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [5, 3, 1, 4, 2])
 *   const top2 = yield* TxPriorityQueue.takeUpTo(pq, 2)
 *   console.log(top2) // [1, 2]
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export const takeUpTo = /*#__PURE__*/dual(2, (self, n) => Effect.map(TxRef.modify(self.ref, chunk => {
  const taken = C.take(chunk, n);
  const rest = C.drop(chunk, n);
  return [taken, rest];
}), C.toArray));
/**
 * Removes elements matching the predicate.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [1, 2, 3, 4, 5])
 *   yield* TxPriorityQueue.removeIf(pq, (n) => n % 2 === 0)
 *   const all = yield* TxPriorityQueue.takeAll(pq)
 *   console.log(all) // [1, 3, 5]
 * })
 * ```
 *
 * @since 4.0.0
 * @category filtering
 */
export const removeIf = /*#__PURE__*/dual(2, (self, predicate) => TxRef.update(self.ref, chunk => C.filter(chunk, a => !predicate(a))));
/**
 * Retains only elements matching the predicate.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [1, 2, 3, 4, 5])
 *   yield* TxPriorityQueue.retainIf(pq, (n) => n % 2 === 0)
 *   const all = yield* TxPriorityQueue.takeAll(pq)
 *   console.log(all) // [2, 4]
 * })
 * ```
 *
 * @since 4.0.0
 * @category filtering
 */
export const retainIf = /*#__PURE__*/dual(2, (self, predicate) => TxRef.update(self.ref, chunk => C.filter(chunk, predicate)));
/**
 * Returns all elements in priority order without removing them.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.fromIterable(Order.Number, [3, 1, 2])
 *   const all = yield* TxPriorityQueue.toArray(pq)
 *   console.log(all) // [1, 2, 3]
 * })
 * ```
 *
 * @since 4.0.0
 * @category conversions
 */
export const toArray = self => Effect.map(TxRef.get(self.ref), C.toArray);
/**
 * Determines if the provided value is a `TxPriorityQueue`.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   console.log(TxPriorityQueue.isTxPriorityQueue(pq)) // true
 *   console.log(TxPriorityQueue.isTxPriorityQueue("nope")) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export const isTxPriorityQueue = u => hasProperty(u, TypeId);
//# sourceMappingURL=TxPriorityQueue.js.map