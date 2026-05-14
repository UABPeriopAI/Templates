/**
 * A transactional priority queue. Elements are dequeued in order determined by the
 * provided `Order` instance. All operations participate in the STM transaction system.
 *
 * @since 4.0.0
 */
import type { Chunk } from "./Chunk.ts";
import * as Effect from "./Effect.ts";
import type { Inspectable } from "./Inspectable.ts";
import type { Option } from "./Option.ts";
import type { Order } from "./Order.ts";
import type { Pipeable } from "./Pipeable.ts";
import { type Predicate } from "./Predicate.ts";
import * as TxRef from "./TxRef.ts";
declare const TypeId = "~effect/transactions/TxPriorityQueue";
/**
 * A transactional priority queue backed by a sorted `Chunk`.
 *
 * Elements are stored in ascending order according to the `Order` provided at
 * construction time. `take` returns the smallest element, `peek` observes it
 * without removing.
 *
 * @example
 * ```ts
 * import { Effect, Order, TxPriorityQueue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const pq = yield* TxPriorityQueue.empty<number>(Order.Number)
 *   yield* TxPriorityQueue.offer(pq, 3)
 *   yield* TxPriorityQueue.offer(pq, 1)
 *   yield* TxPriorityQueue.offer(pq, 2)
 *   const first = yield* TxPriorityQueue.take(pq)
 *   console.log(first) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface TxPriorityQueue<in out A> extends Inspectable, Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly ref: TxRef.TxRef<Chunk<A>>;
    readonly ord: Order<A>;
}
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
export declare const empty: <A>(order: Order<A>) => Effect.Effect<TxPriorityQueue<A>>;
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
export declare const fromIterable: {
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
    <A>(order: Order<A>): (iterable: Iterable<A>) => Effect.Effect<TxPriorityQueue<A>>;
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
    <A>(order: Order<A>, iterable: Iterable<A>): Effect.Effect<TxPriorityQueue<A>>;
};
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
export declare const make: <A>(order: Order<A>) => (...elements: Array<A>) => Effect.Effect<TxPriorityQueue<A>>;
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
export declare const size: <A>(self: TxPriorityQueue<A>) => Effect.Effect<number>;
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
export declare const isEmpty: <A>(self: TxPriorityQueue<A>) => Effect.Effect<boolean>;
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
export declare const isNonEmpty: <A>(self: TxPriorityQueue<A>) => Effect.Effect<boolean>;
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
export declare const peek: <A>(self: TxPriorityQueue<A>) => Effect.Effect<A>;
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
export declare const peekOption: <A>(self: TxPriorityQueue<A>) => Effect.Effect<Option<A>>;
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
export declare const offer: {
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
    <A>(value: A): (self: TxPriorityQueue<A>) => Effect.Effect<void>;
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
    <A>(self: TxPriorityQueue<A>, value: A): Effect.Effect<void>;
};
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
export declare const offerAll: {
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
    <A>(values: Iterable<A>): (self: TxPriorityQueue<A>) => Effect.Effect<void>;
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
    <A>(self: TxPriorityQueue<A>, values: Iterable<A>): Effect.Effect<void>;
};
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
export declare const take: <A>(self: TxPriorityQueue<A>) => Effect.Effect<A>;
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
export declare const takeAll: <A>(self: TxPriorityQueue<A>) => Effect.Effect<Array<A>>;
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
export declare const takeOption: <A>(self: TxPriorityQueue<A>) => Effect.Effect<Option<A>>;
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
export declare const takeUpTo: {
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
    (n: number): <A>(self: TxPriorityQueue<A>) => Effect.Effect<Array<A>>;
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
    <A>(self: TxPriorityQueue<A>, n: number): Effect.Effect<Array<A>>;
};
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
export declare const removeIf: {
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
    <A>(predicate: Predicate<A>): (self: TxPriorityQueue<A>) => Effect.Effect<void>;
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
    <A>(self: TxPriorityQueue<A>, predicate: Predicate<A>): Effect.Effect<void>;
};
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
export declare const retainIf: {
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
    <A>(predicate: Predicate<A>): (self: TxPriorityQueue<A>) => Effect.Effect<void>;
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
    <A>(self: TxPriorityQueue<A>, predicate: Predicate<A>): Effect.Effect<void>;
};
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
export declare const toArray: <A>(self: TxPriorityQueue<A>) => Effect.Effect<Array<A>>;
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
export declare const isTxPriorityQueue: (u: unknown) => u is TxPriorityQueue<unknown>;
export {};
//# sourceMappingURL=TxPriorityQueue.d.ts.map