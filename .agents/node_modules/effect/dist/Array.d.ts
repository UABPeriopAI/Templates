import * as Equivalence from "./Equivalence.ts";
import type { LazyArg } from "./Function.ts";
import type { TypeLambda } from "./HKT.ts";
import * as Option from "./Option.ts";
import * as Order from "./Order.ts";
import type * as Predicate from "./Predicate.ts";
import * as Record from "./Record.ts";
import * as Reducer from "./Reducer.ts";
import * as Result from "./Result.ts";
import type { NoInfer, TupleOf } from "./Types.ts";
/**
 * Reference to the global `Array` constructor.
 *
 * Use this when you need the native `Array` constructor while the `Array`
 * namespace is in scope (e.g. `Array.Array.isArray`, `Array.Array.from`).
 *
 * **Example** (Using the Array constructor)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const arr = new Array.Array(3)
 * console.log(arr) // [undefined, undefined, undefined]
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export declare const Array: ArrayConstructor;
/**
 * Type lambda for `ReadonlyArray`, used for higher-kinded type operations.
 *
 * @category type lambdas
 * @since 2.0.0
 */
export interface ReadonlyArrayTypeLambda extends TypeLambda {
    readonly type: ReadonlyArray<this["Target"]>;
}
/**
 * A readonly array guaranteed to have at least one element.
 *
 * Use this type when you need to ensure non-emptiness at the type level while
 * preventing mutation. Many Array module functions accept or return this type.
 *
 * **Example** (Typing a non-empty array)
 *
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3]
 * const head: number = nonEmpty[0] // guaranteed to exist
 * ```
 *
 * @see {@link NonEmptyArray} — mutable counterpart
 * @see {@link isReadonlyArrayNonEmpty} — narrow a `ReadonlyArray` to this type
 *
 * @category models
 * @since 2.0.0
 */
export type NonEmptyReadonlyArray<A> = readonly [A, ...Array<A>];
/**
 * A mutable array guaranteed to have at least one element.
 *
 * This is the mutable counterpart of {@link NonEmptyReadonlyArray}. Most Array
 * module functions return `NonEmptyArray` when the result is guaranteed
 * non-empty.
 *
 * **Example** (Typing a mutable non-empty array)
 *
 * ```ts
 * import type { Array } from "effect"
 *
 * const nonEmpty: Array.NonEmptyArray<number> = [1, 2, 3]
 * nonEmpty.push(4)
 * ```
 *
 * @see {@link NonEmptyReadonlyArray} — readonly counterpart
 * @see {@link isArrayNonEmpty} — narrow an `Array` to this type
 *
 * @category models
 * @since 2.0.0
 */
export type NonEmptyArray<A> = [A, ...Array<A>];
/**
 * Creates a `NonEmptyArray` from one or more elements.
 *
 * - Use when you have literal values and want a typed non-empty array.
 * - The element type is inferred as the union of all arguments.
 * - Always returns a `NonEmptyArray` since at least one argument is required.
 *
 * **Example** (Creating an array from values)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.make(1, 2, 3)
 * console.log(result) // [1, 2, 3]
 * ```
 *
 * @see {@link of} — create a single-element array
 * @see {@link fromIterable} — create from any iterable
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const make: <Elements extends NonEmptyArray<unknown>>(...elements: Elements) => NonEmptyArray<Elements[number]>;
/**
 * Creates a new `Array` of the specified length with all slots uninitialized.
 *
 * - Use when you need a pre-sized array and will fill it imperatively.
 * - Elements are typed as `A | undefined` since slots are empty.
 * - Prefer {@link makeBy} when you can compute each element from its index.
 *
 * **Example** (Allocating a fixed-size array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.allocate<number>(3)
 * console.log(result.length) // 3
 * ```
 *
 * @see {@link makeBy} — create an array by computing each element
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const allocate: <A = never>(n: number) => Array<A | undefined>;
/**
 * Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`.
 *
 * - Use when you need an array whose values depend on the index.
 * - `n` is normalized to an integer >= 1 — always returns at least one element.
 * - Dual: `Array.makeBy(5, f)` or `pipe(5, Array.makeBy(f))`.
 *
 * **Example** (Generating values from indices)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.makeBy(5, (n) => n * 2)
 * console.log(result) // [0, 2, 4, 6, 8]
 * ```
 *
 * @see {@link range} — create a range of integers
 * @see {@link replicate} — repeat a single value
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const makeBy: {
    /**
     * Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`.
     *
     * - Use when you need an array whose values depend on the index.
     * - `n` is normalized to an integer >= 1 — always returns at least one element.
     * - Dual: `Array.makeBy(5, f)` or `pipe(5, Array.makeBy(f))`.
     *
     * **Example** (Generating values from indices)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.makeBy(5, (n) => n * 2)
     * console.log(result) // [0, 2, 4, 6, 8]
     * ```
     *
     * @see {@link range} — create a range of integers
     * @see {@link replicate} — repeat a single value
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(f: (i: number) => A): (n: number) => NonEmptyArray<A>;
    /**
     * Creates a `NonEmptyArray` of length `n` where element `i` is computed by `f(i)`.
     *
     * - Use when you need an array whose values depend on the index.
     * - `n` is normalized to an integer >= 1 — always returns at least one element.
     * - Dual: `Array.makeBy(5, f)` or `pipe(5, Array.makeBy(f))`.
     *
     * **Example** (Generating values from indices)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.makeBy(5, (n) => n * 2)
     * console.log(result) // [0, 2, 4, 6, 8]
     * ```
     *
     * @see {@link range} — create a range of integers
     * @see {@link replicate} — repeat a single value
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(n: number, f: (i: number) => A): NonEmptyArray<A>;
};
/**
 * Creates a `NonEmptyArray` containing a range of integers, inclusive on both
 * ends.
 *
 * - Use when you need a sequence of consecutive integers.
 * - If `start > end`, returns `[start]`.
 * - Always returns a `NonEmptyArray`.
 *
 * **Example** (Creating a range)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.range(1, 3)
 * console.log(result) // [1, 2, 3]
 * ```
 *
 * @see {@link makeBy} — generate values from a function
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const range: (start: number, end: number) => NonEmptyArray<number>;
/**
 * Creates a `NonEmptyArray` containing a value repeated `n` times.
 *
 * - Use when you need multiple copies of the same value.
 * - `n` is normalized to an integer >= 1 — always returns at least one element.
 * - Dual: `Array.replicate("a", 3)` or `pipe("a", Array.replicate(3))`.
 *
 * **Example** (Repeating a value)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.replicate("a", 3)
 * console.log(result) // ["a", "a", "a"]
 * ```
 *
 * @see {@link makeBy} — vary values based on index
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const replicate: {
    /**
     * Creates a `NonEmptyArray` containing a value repeated `n` times.
     *
     * - Use when you need multiple copies of the same value.
     * - `n` is normalized to an integer >= 1 — always returns at least one element.
     * - Dual: `Array.replicate("a", 3)` or `pipe("a", Array.replicate(3))`.
     *
     * **Example** (Repeating a value)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.replicate("a", 3)
     * console.log(result) // ["a", "a", "a"]
     * ```
     *
     * @see {@link makeBy} — vary values based on index
     *
     * @category constructors
     * @since 2.0.0
     */
    (n: number): <A>(a: A) => NonEmptyArray<A>;
    /**
     * Creates a `NonEmptyArray` containing a value repeated `n` times.
     *
     * - Use when you need multiple copies of the same value.
     * - `n` is normalized to an integer >= 1 — always returns at least one element.
     * - Dual: `Array.replicate("a", 3)` or `pipe("a", Array.replicate(3))`.
     *
     * **Example** (Repeating a value)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.replicate("a", 3)
     * console.log(result) // ["a", "a", "a"]
     * ```
     *
     * @see {@link makeBy} — vary values based on index
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(a: A, n: number): NonEmptyArray<A>;
};
/**
 * Converts an `Iterable` to an `Array`.
 *
 * - If the input is already an array, returns it **by reference** (no copy).
 * - Otherwise, creates a new array from the iterable.
 * - Use {@link copy} if you need a fresh array even when the input is already
 *   an array.
 *
 * **Example** (Converting a Set to an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.fromIterable(new Set([1, 2, 3]))
 * console.log(result) // [1, 2, 3]
 * ```
 *
 * @see {@link ensure} — wrap a single value or return an existing array
 * @see {@link copy} — create a shallow copy of an array
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const fromIterable: <A>(collection: Iterable<A>) => Array<A>;
/**
 * Normalizes a value that is either a single element or an array into an array.
 *
 * - If the input is already an array, returns it by reference.
 * - If the input is a single value, wraps it in a one-element array.
 * - Useful for APIs that accept `A | Array<A>`.
 *
 * **Example** (Normalizing input)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.ensure("a")) // ["a"]
 * console.log(Array.ensure(["a", "b", "c"])) // ["a", "b", "c"]
 * ```
 *
 * @see {@link of} — always wrap in a single-element array
 * @see {@link fromIterable} — convert any iterable
 *
 * @category constructors
 * @since 3.3.0
 */
export declare const ensure: <A>(self: ReadonlyArray<A> | A) => Array<A>;
/**
 * Converts a record into an array of `[key, value]` tuples.
 *
 * - Key order follows `Object.entries` semantics.
 * - Returns an empty array for an empty record.
 *
 * **Example** (Record to entries)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.fromRecord({ a: 1, b: 2, c: 3 })
 * console.log(result) // [["a", 1], ["b", 2], ["c", 3]]
 * ```
 *
 * @category conversions
 * @since 2.0.0
 */
export declare const fromRecord: <K extends string, A>(self: Readonly<Record<K, A>>) => Array<[K, A]>;
/**
 * Converts an `Option` to an array: `Some(a)` becomes `[a]`, `None` becomes `[]`.
 *
 * **Example** (Option to array)
 *
 * ```ts
 * import { Array, Option } from "effect"
 *
 * console.log(Array.fromOption(Option.some(1))) // [1]
 * console.log(Array.fromOption(Option.none())) // []
 * ```
 *
 * @see {@link getSomes} — extract `Some` values from an array of Options
 *
 * @category conversions
 * @since 2.0.0
 */
export declare const fromOption: <A>(self: Option.Option<A>) => Array<A>;
/**
 * Pattern-matches on an array, handling empty and non-empty cases separately.
 *
 * - Use when you need to branch on whether an array has elements.
 * - `onNonEmpty` receives a `NonEmptyReadonlyArray`.
 * - Dual: data-first or data-last.
 *
 * **Example** (Branching on emptiness)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const describe = Array.match({
 *   onEmpty: () => "empty",
 *   onNonEmpty: ([head, ...tail]) => `head: ${head}, tail: ${tail.length}`
 * })
 * console.log(describe([])) // "empty"
 * console.log(describe([1, 2, 3])) // "head: 1, tail: 2"
 * ```
 *
 * @see {@link matchLeft} — destructures into head + tail
 * @see {@link matchRight} — destructures into init + last
 *
 * @category pattern matching
 * @since 2.0.0
 */
export declare const match: {
    /**
     * Pattern-matches on an array, handling empty and non-empty cases separately.
     *
     * - Use when you need to branch on whether an array has elements.
     * - `onNonEmpty` receives a `NonEmptyReadonlyArray`.
     * - Dual: data-first or data-last.
     *
     * **Example** (Branching on emptiness)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const describe = Array.match({
     *   onEmpty: () => "empty",
     *   onNonEmpty: ([head, ...tail]) => `head: ${head}, tail: ${tail.length}`
     * })
     * console.log(describe([])) // "empty"
     * console.log(describe([1, 2, 3])) // "head: 1, tail: 2"
     * ```
     *
     * @see {@link matchLeft} — destructures into head + tail
     * @see {@link matchRight} — destructures into init + last
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <B, A, C = B>(options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (self: NonEmptyReadonlyArray<A>) => C;
    }): (self: ReadonlyArray<A>) => B | C;
    /**
     * Pattern-matches on an array, handling empty and non-empty cases separately.
     *
     * - Use when you need to branch on whether an array has elements.
     * - `onNonEmpty` receives a `NonEmptyReadonlyArray`.
     * - Dual: data-first or data-last.
     *
     * **Example** (Branching on emptiness)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const describe = Array.match({
     *   onEmpty: () => "empty",
     *   onNonEmpty: ([head, ...tail]) => `head: ${head}, tail: ${tail.length}`
     * })
     * console.log(describe([])) // "empty"
     * console.log(describe([1, 2, 3])) // "head: 1, tail: 2"
     * ```
     *
     * @see {@link matchLeft} — destructures into head + tail
     * @see {@link matchRight} — destructures into init + last
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <A, B, C = B>(self: ReadonlyArray<A>, options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (self: NonEmptyReadonlyArray<A>) => C;
    }): B | C;
};
/**
 * Pattern-matches on an array from the left, providing the first element and
 * the remaining elements separately.
 *
 * - `onNonEmpty` receives `(head, tail)` where `tail` is the rest of the array.
 * - Use when you want to process the first element differently from the rest.
 *
 * **Example** (Head and tail destructuring)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const matchLeft = Array.matchLeft({
 *   onEmpty: () => "empty",
 *   onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`
 * })
 * console.log(matchLeft([])) // "empty"
 * console.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"
 * ```
 *
 * @see {@link match} — receives the full non-empty array
 * @see {@link matchRight} — destructures into init + last
 *
 * @category pattern matching
 * @since 2.0.0
 */
export declare const matchLeft: {
    /**
     * Pattern-matches on an array from the left, providing the first element and
     * the remaining elements separately.
     *
     * - `onNonEmpty` receives `(head, tail)` where `tail` is the rest of the array.
     * - Use when you want to process the first element differently from the rest.
     *
     * **Example** (Head and tail destructuring)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const matchLeft = Array.matchLeft({
     *   onEmpty: () => "empty",
     *   onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`
     * })
     * console.log(matchLeft([])) // "empty"
     * console.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"
     * ```
     *
     * @see {@link match} — receives the full non-empty array
     * @see {@link matchRight} — destructures into init + last
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <B, A, C = B>(options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (head: A, tail: Array<A>) => C;
    }): (self: ReadonlyArray<A>) => B | C;
    /**
     * Pattern-matches on an array from the left, providing the first element and
     * the remaining elements separately.
     *
     * - `onNonEmpty` receives `(head, tail)` where `tail` is the rest of the array.
     * - Use when you want to process the first element differently from the rest.
     *
     * **Example** (Head and tail destructuring)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const matchLeft = Array.matchLeft({
     *   onEmpty: () => "empty",
     *   onNonEmpty: (head, tail) => `head: ${head}, tail: ${tail.length}`
     * })
     * console.log(matchLeft([])) // "empty"
     * console.log(matchLeft([1, 2, 3])) // "head: 1, tail: 2"
     * ```
     *
     * @see {@link match} — receives the full non-empty array
     * @see {@link matchRight} — destructures into init + last
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <A, B, C = B>(self: ReadonlyArray<A>, options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (head: A, tail: Array<A>) => C;
    }): B | C;
};
/**
 * Pattern-matches on an array from the right, providing all elements except the
 * last and the last element separately.
 *
 * - `onNonEmpty` receives `(init, last)` where `init` is everything but the last element.
 * - Use when you want to process the last element differently from the rest.
 *
 * **Example** (Init and last destructuring)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const matchRight = Array.matchRight({
 *   onEmpty: () => "empty",
 *   onNonEmpty: (init, last) => `init: ${init.length}, last: ${last}`
 * })
 * console.log(matchRight([])) // "empty"
 * console.log(matchRight([1, 2, 3])) // "init: 2, last: 3"
 * ```
 *
 * @see {@link match} — receives the full non-empty array
 * @see {@link matchLeft} — destructures into head + tail
 *
 * @category pattern matching
 * @since 2.0.0
 */
export declare const matchRight: {
    /**
     * Pattern-matches on an array from the right, providing all elements except the
     * last and the last element separately.
     *
     * - `onNonEmpty` receives `(init, last)` where `init` is everything but the last element.
     * - Use when you want to process the last element differently from the rest.
     *
     * **Example** (Init and last destructuring)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const matchRight = Array.matchRight({
     *   onEmpty: () => "empty",
     *   onNonEmpty: (init, last) => `init: ${init.length}, last: ${last}`
     * })
     * console.log(matchRight([])) // "empty"
     * console.log(matchRight([1, 2, 3])) // "init: 2, last: 3"
     * ```
     *
     * @see {@link match} — receives the full non-empty array
     * @see {@link matchLeft} — destructures into head + tail
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <B, A, C = B>(options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (init: Array<A>, last: A) => C;
    }): (self: ReadonlyArray<A>) => B | C;
    /**
     * Pattern-matches on an array from the right, providing all elements except the
     * last and the last element separately.
     *
     * - `onNonEmpty` receives `(init, last)` where `init` is everything but the last element.
     * - Use when you want to process the last element differently from the rest.
     *
     * **Example** (Init and last destructuring)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const matchRight = Array.matchRight({
     *   onEmpty: () => "empty",
     *   onNonEmpty: (init, last) => `init: ${init.length}, last: ${last}`
     * })
     * console.log(matchRight([])) // "empty"
     * console.log(matchRight([1, 2, 3])) // "init: 2, last: 3"
     * ```
     *
     * @see {@link match} — receives the full non-empty array
     * @see {@link matchLeft} — destructures into head + tail
     *
     * @category pattern matching
     * @since 2.0.0
     */
    <A, B, C = B>(self: ReadonlyArray<A>, options: {
        readonly onEmpty: LazyArg<B>;
        readonly onNonEmpty: (init: Array<A>, last: A) => C;
    }): B | C;
};
/**
 * Adds a single element to the front of an iterable, returning a `NonEmptyArray`.
 *
 * - Always returns a non-empty array.
 * - Does not mutate the input.
 *
 * **Example** (Prepending an element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.prepend([2, 3, 4], 1)
 * console.log(result) // [1, 2, 3, 4]
 * ```
 *
 * @see {@link append} — add to the end
 * @see {@link prependAll} — prepend multiple elements
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const prepend: {
    /**
     * Adds a single element to the front of an iterable, returning a `NonEmptyArray`.
     *
     * - Always returns a non-empty array.
     * - Does not mutate the input.
     *
     * **Example** (Prepending an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prepend([2, 3, 4], 1)
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add to the end
     * @see {@link prependAll} — prepend multiple elements
     *
     * @category concatenating
     * @since 2.0.0
     */
    <B>(head: B): <A>(self: Iterable<A>) => NonEmptyArray<A | B>;
    /**
     * Adds a single element to the front of an iterable, returning a `NonEmptyArray`.
     *
     * - Always returns a non-empty array.
     * - Does not mutate the input.
     *
     * **Example** (Prepending an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prepend([2, 3, 4], 1)
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add to the end
     * @see {@link prependAll} — prepend multiple elements
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, head: B): NonEmptyArray<A | B>;
};
/**
 * Prepends all elements from a prefix iterable to the front of an array.
 *
 * - If either input is non-empty, the result is a `NonEmptyArray`.
 * - Does not mutate the input.
 *
 * **Example** (Prepending multiple elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.prependAll([2, 3], [0, 1])
 * console.log(result) // [0, 1, 2, 3]
 * ```
 *
 * @see {@link prepend} — add a single element to the front
 * @see {@link appendAll} — add elements to the end
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const prependAll: {
    /**
     * Prepends all elements from a prefix iterable to the front of an array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the input.
     *
     * **Example** (Prepending multiple elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prependAll([2, 3], [0, 1])
     * console.log(result) // [0, 1, 2, 3]
     * ```
     *
     * @see {@link prepend} — add a single element to the front
     * @see {@link appendAll} — add elements to the end
     *
     * @category concatenating
     * @since 2.0.0
     */
    <S extends Iterable<any>, T extends Iterable<any>>(that: T): (self: S) => ReadonlyArray.OrNonEmpty<S, T, ReadonlyArray.Infer<S> | ReadonlyArray.Infer<T>>;
    /**
     * Prepends all elements from a prefix iterable to the front of an array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the input.
     *
     * **Example** (Prepending multiple elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prependAll([2, 3], [0, 1])
     * console.log(result) // [0, 1, 2, 3]
     * ```
     *
     * @see {@link prepend} — add a single element to the front
     * @see {@link appendAll} — add elements to the end
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: NonEmptyReadonlyArray<B>): NonEmptyArray<A | B>;
    /**
     * Prepends all elements from a prefix iterable to the front of an array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the input.
     *
     * **Example** (Prepending multiple elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prependAll([2, 3], [0, 1])
     * console.log(result) // [0, 1, 2, 3]
     * ```
     *
     * @see {@link prepend} — add a single element to the front
     * @see {@link appendAll} — add elements to the end
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, that: Iterable<B>): NonEmptyArray<A | B>;
    /**
     * Prepends all elements from a prefix iterable to the front of an array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the input.
     *
     * **Example** (Prepending multiple elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.prependAll([2, 3], [0, 1])
     * console.log(result) // [0, 1, 2, 3]
     * ```
     *
     * @see {@link prepend} — add a single element to the front
     * @see {@link appendAll} — add elements to the end
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>): Array<A | B>;
};
/**
 * Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
 *
 * - Always returns a non-empty array.
 * - Does not mutate the input.
 *
 * **Example** (Appending an element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.append([1, 2, 3], 4)
 * console.log(result) // [1, 2, 3, 4]
 * ```
 *
 * @see {@link prepend} — add to the front
 * @see {@link appendAll} — append multiple elements
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const append: {
    /**
     * Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
     *
     * - Always returns a non-empty array.
     * - Does not mutate the input.
     *
     * **Example** (Appending an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.append([1, 2, 3], 4)
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link prepend} — add to the front
     * @see {@link appendAll} — append multiple elements
     *
     * @category concatenating
     * @since 2.0.0
     */
    <B>(last: B): <A>(self: Iterable<A>) => NonEmptyArray<A | B>;
    /**
     * Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
     *
     * - Always returns a non-empty array.
     * - Does not mutate the input.
     *
     * **Example** (Appending an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.append([1, 2, 3], 4)
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link prepend} — add to the front
     * @see {@link appendAll} — append multiple elements
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, last: B): NonEmptyArray<A | B>;
};
/**
 * Concatenates two iterables into a single array.
 *
 * - If either input is non-empty, the result is a `NonEmptyArray`.
 * - Does not mutate the inputs.
 *
 * **Example** (Concatenating arrays)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.appendAll([1, 2], [3, 4])
 * console.log(result) // [1, 2, 3, 4]
 * ```
 *
 * @see {@link append} — add a single element to the end
 * @see {@link prependAll} — add elements to the front
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const appendAll: {
    /**
     * Concatenates two iterables into a single array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the inputs.
     *
     * **Example** (Concatenating arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.appendAll([1, 2], [3, 4])
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add a single element to the end
     * @see {@link prependAll} — add elements to the front
     *
     * @category concatenating
     * @since 2.0.0
     */
    <S extends Iterable<any>, T extends Iterable<any>>(that: T): (self: S) => ReadonlyArray.OrNonEmpty<S, T, ReadonlyArray.Infer<S> | ReadonlyArray.Infer<T>>;
    /**
     * Concatenates two iterables into a single array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the inputs.
     *
     * **Example** (Concatenating arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.appendAll([1, 2], [3, 4])
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add a single element to the end
     * @see {@link prependAll} — add elements to the front
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: NonEmptyReadonlyArray<B>): NonEmptyArray<A | B>;
    /**
     * Concatenates two iterables into a single array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the inputs.
     *
     * **Example** (Concatenating arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.appendAll([1, 2], [3, 4])
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add a single element to the end
     * @see {@link prependAll} — add elements to the front
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, that: Iterable<B>): NonEmptyArray<A | B>;
    /**
     * Concatenates two iterables into a single array.
     *
     * - If either input is non-empty, the result is a `NonEmptyArray`.
     * - Does not mutate the inputs.
     *
     * **Example** (Concatenating arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.appendAll([1, 2], [3, 4])
     * console.log(result) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link append} — add a single element to the end
     * @see {@link prependAll} — add elements to the front
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>): Array<A | B>;
};
/**
 * Left-to-right fold that keeps every intermediate accumulator value.
 *
 * - The output length is `input.length + 1` (starts with the initial value).
 * - Always returns a `NonEmptyArray` because the initial value is included.
 * - Use {@link reduce} if you only need the final accumulated value.
 *
 * **Example** (Running totals)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.scan([1, 2, 3, 4], 0, (acc, value) => acc + value)
 * console.log(result) // [0, 1, 3, 6, 10]
 * ```
 *
 * @see {@link scanRight} — right-to-left scan
 * @see {@link reduce} — fold without intermediate values
 *
 * @category folding
 * @since 2.0.0
 */
export declare const scan: {
    /**
     * Left-to-right fold that keeps every intermediate accumulator value.
     *
     * - The output length is `input.length + 1` (starts with the initial value).
     * - Always returns a `NonEmptyArray` because the initial value is included.
     * - Use {@link reduce} if you only need the final accumulated value.
     *
     * **Example** (Running totals)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.scan([1, 2, 3, 4], 0, (acc, value) => acc + value)
     * console.log(result) // [0, 1, 3, 6, 10]
     * ```
     *
     * @see {@link scanRight} — right-to-left scan
     * @see {@link reduce} — fold without intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A) => B): (self: Iterable<A>) => NonEmptyArray<B>;
    /**
     * Left-to-right fold that keeps every intermediate accumulator value.
     *
     * - The output length is `input.length + 1` (starts with the initial value).
     * - Always returns a `NonEmptyArray` because the initial value is included.
     * - Use {@link reduce} if you only need the final accumulated value.
     *
     * **Example** (Running totals)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.scan([1, 2, 3, 4], 0, (acc, value) => acc + value)
     * console.log(result) // [0, 1, 3, 6, 10]
     * ```
     *
     * @see {@link scanRight} — right-to-left scan
     * @see {@link reduce} — fold without intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, b: B, f: (b: B, a: A) => B): NonEmptyArray<B>;
};
/**
 * Right-to-left fold that keeps every intermediate accumulator value.
 *
 * - The output length is `input.length + 1` (ends with the initial value).
 * - Always returns a `NonEmptyArray`.
 *
 * **Example** (Reverse running totals)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.scanRight([1, 2, 3, 4], 0, (acc, value) => acc + value)
 * console.log(result) // [10, 9, 7, 4, 0]
 * ```
 *
 * @see {@link scan} — left-to-right scan
 * @see {@link reduceRight} — fold without intermediate values
 *
 * @category folding
 * @since 2.0.0
 */
export declare const scanRight: {
    /**
     * Right-to-left fold that keeps every intermediate accumulator value.
     *
     * - The output length is `input.length + 1` (ends with the initial value).
     * - Always returns a `NonEmptyArray`.
     *
     * **Example** (Reverse running totals)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.scanRight([1, 2, 3, 4], 0, (acc, value) => acc + value)
     * console.log(result) // [10, 9, 7, 4, 0]
     * ```
     *
     * @see {@link scan} — left-to-right scan
     * @see {@link reduceRight} — fold without intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A) => B): (self: Iterable<A>) => NonEmptyArray<B>;
    /**
     * Right-to-left fold that keeps every intermediate accumulator value.
     *
     * - The output length is `input.length + 1` (ends with the initial value).
     * - Always returns a `NonEmptyArray`.
     *
     * **Example** (Reverse running totals)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.scanRight([1, 2, 3, 4], 0, (acc, value) => acc + value)
     * console.log(result) // [10, 9, 7, 4, 0]
     * ```
     *
     * @see {@link scan} — left-to-right scan
     * @see {@link reduceRight} — fold without intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, b: B, f: (b: B, a: A) => B): NonEmptyArray<B>;
};
/**
 * Tests whether a value is an `Array`.
 *
 * - Acts as a type guard narrowing the input to `Array<unknown>`.
 * - Delegates to `globalThis.Array.isArray`.
 *
 * **Example** (Type-guarding an unknown value)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isArray(null)) // false
 * console.log(Array.isArray([1, 2, 3])) // true
 * ```
 *
 * @see {@link isArrayEmpty} — check for an empty array
 * @see {@link isArrayNonEmpty} — check for a non-empty array
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isArray: {
    /**
     * Tests whether a value is an `Array`.
     *
     * - Acts as a type guard narrowing the input to `Array<unknown>`.
     * - Delegates to `globalThis.Array.isArray`.
     *
     * **Example** (Type-guarding an unknown value)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.isArray(null)) // false
     * console.log(Array.isArray([1, 2, 3])) // true
     * ```
     *
     * @see {@link isArrayEmpty} — check for an empty array
     * @see {@link isArrayNonEmpty} — check for a non-empty array
     *
     * @category guards
     * @since 2.0.0
     */
    (self: unknown): self is Array<unknown>;
    /**
     * Tests whether a value is an `Array`.
     *
     * - Acts as a type guard narrowing the input to `Array<unknown>`.
     * - Delegates to `globalThis.Array.isArray`.
     *
     * **Example** (Type-guarding an unknown value)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.isArray(null)) // false
     * console.log(Array.isArray([1, 2, 3])) // true
     * ```
     *
     * @see {@link isArrayEmpty} — check for an empty array
     * @see {@link isArrayNonEmpty} — check for a non-empty array
     *
     * @category guards
     * @since 2.0.0
     */
    <T>(self: T): self is Extract<T, ReadonlyArray<any>>;
};
/**
 * Tests whether a mutable `Array` is empty, narrowing the type to `[]`.
 *
 * **Example** (Checking for an empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isArrayEmpty([])) // true
 * console.log(Array.isArrayEmpty([1, 2, 3])) // false
 * ```
 *
 * @see {@link isReadonlyArrayEmpty} — readonly variant
 * @see {@link isArrayNonEmpty} — opposite check
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isArrayEmpty: <A>(self: Array<A>) => self is [];
/**
 * Tests whether a `ReadonlyArray` is empty, narrowing the type to `readonly []`.
 *
 * **Example** (Checking for an empty readonly array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isReadonlyArrayEmpty([])) // true
 * console.log(Array.isReadonlyArrayEmpty([1, 2, 3])) // false
 * ```
 *
 * @see {@link isArrayEmpty} — mutable variant
 * @see {@link isReadonlyArrayNonEmpty} — opposite check
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isReadonlyArrayEmpty: <A>(self: ReadonlyArray<A>) => self is readonly [];
/**
 * Tests whether a mutable `Array` is non-empty, narrowing the type to
 * `NonEmptyArray`.
 *
 * **Example** (Checking for a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isArrayNonEmpty([])) // false
 * console.log(Array.isArrayNonEmpty([1, 2, 3])) // true
 * ```
 *
 * @see {@link isReadonlyArrayNonEmpty} — readonly variant
 * @see {@link isArrayEmpty} — opposite check
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isArrayNonEmpty: <A>(self: Array<A>) => self is NonEmptyArray<A>;
/**
 * Tests whether a `ReadonlyArray` is non-empty, narrowing the type to
 * `NonEmptyReadonlyArray`.
 *
 * **Example** (Checking for a non-empty readonly array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.isReadonlyArrayNonEmpty([])) // false
 * console.log(Array.isReadonlyArrayNonEmpty([1, 2, 3])) // true
 * ```
 *
 * @see {@link isArrayNonEmpty} — mutable variant
 * @see {@link isReadonlyArrayEmpty} — opposite check
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isReadonlyArrayNonEmpty: <A>(self: ReadonlyArray<A>) => self is NonEmptyReadonlyArray<A>;
/**
 * Returns the number of elements in a `ReadonlyArray`.
 *
 * **Example** (Getting the length)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.length([1, 2, 3])) // 3
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
export declare const length: <A>(self: ReadonlyArray<A>) => number;
/**
 * Safely reads an element at the given index, returning `Option.some` or
 * `Option.none` if the index is out of bounds.
 *
 * - The index is floored to an integer.
 * - Never throws.
 *
 * **Example** (Safe index access)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.get([1, 2, 3], 1)) // Some(2)
 * console.log(Array.get([1, 2, 3], 10)) // None
 * ```
 *
 * @see {@link getUnsafe} — throws on out of bounds
 * @see {@link head} — get the first element
 * @see {@link last} — get the last element
 *
 * @category getters
 * @since 2.0.0
 */
export declare const get: {
    /**
     * Safely reads an element at the given index, returning `Option.some` or
     * `Option.none` if the index is out of bounds.
     *
     * - The index is floored to an integer.
     * - Never throws.
     *
     * **Example** (Safe index access)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.get([1, 2, 3], 1)) // Some(2)
     * console.log(Array.get([1, 2, 3], 10)) // None
     * ```
     *
     * @see {@link getUnsafe} — throws on out of bounds
     * @see {@link head} — get the first element
     * @see {@link last} — get the last element
     *
     * @category getters
     * @since 2.0.0
     */
    (index: number): <A>(self: ReadonlyArray<A>) => Option.Option<A>;
    /**
     * Safely reads an element at the given index, returning `Option.some` or
     * `Option.none` if the index is out of bounds.
     *
     * - The index is floored to an integer.
     * - Never throws.
     *
     * **Example** (Safe index access)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.get([1, 2, 3], 1)) // Some(2)
     * console.log(Array.get([1, 2, 3], 10)) // None
     * ```
     *
     * @see {@link getUnsafe} — throws on out of bounds
     * @see {@link head} — get the first element
     * @see {@link last} — get the last element
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: ReadonlyArray<A>, index: number): Option.Option<A>;
};
/**
 * Reads an element at the given index, throwing if the index is out of bounds.
 *
 * - Throws an `Error` with the message `"Index out of bounds: <i>"`.
 * - Prefer {@link get} for safe access.
 *
 * **Example** (Unsafe index access)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.getUnsafe([1, 2, 3], 1)) // 2
 * // Array.getUnsafe([1, 2, 3], 10) // throws Error
 * ```
 *
 * @see {@link get} — safe version returning `Option`
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const getUnsafe: {
    /**
     * Reads an element at the given index, throwing if the index is out of bounds.
     *
     * - Throws an `Error` with the message `"Index out of bounds: <i>"`.
     * - Prefer {@link get} for safe access.
     *
     * **Example** (Unsafe index access)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.getUnsafe([1, 2, 3], 1)) // 2
     * // Array.getUnsafe([1, 2, 3], 10) // throws Error
     * ```
     *
     * @see {@link get} — safe version returning `Option`
     *
     * @since 2.0.0
     * @category unsafe
     */
    (index: number): <A>(self: ReadonlyArray<A>) => A;
    /**
     * Reads an element at the given index, throwing if the index is out of bounds.
     *
     * - Throws an `Error` with the message `"Index out of bounds: <i>"`.
     * - Prefer {@link get} for safe access.
     *
     * **Example** (Unsafe index access)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.getUnsafe([1, 2, 3], 1)) // 2
     * // Array.getUnsafe([1, 2, 3], 10) // throws Error
     * ```
     *
     * @see {@link get} — safe version returning `Option`
     *
     * @since 2.0.0
     * @category unsafe
     */
    <A>(self: ReadonlyArray<A>, index: number): A;
};
/**
 * Splits a non-empty array into its first element and the remaining elements.
 *
 * - Returns a tuple `[head, tail]`.
 * - Requires a `NonEmptyReadonlyArray`.
 *
 * **Example** (Destructuring head and tail)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.unprepend([1, 2, 3, 4])
 * console.log(result) // [1, [2, 3, 4]]
 * ```
 *
 * @see {@link unappend} — split into init + last
 * @see {@link headNonEmpty} — get only the head
 * @see {@link tailNonEmpty} — get only the tail
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const unprepend: <A>(self: NonEmptyReadonlyArray<A>) => [firstElement: A, remainingElements: Array<A>];
/**
 * Splits a non-empty array into all elements except the last, and the last
 * element.
 *
 * - Returns a tuple `[init, last]`.
 * - Requires a `NonEmptyReadonlyArray`.
 *
 * **Example** (Destructuring init and last)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.unappend([1, 2, 3, 4])
 * console.log(result) // [[1, 2, 3], 4]
 * ```
 *
 * @see {@link unprepend} — split into head + tail
 * @see {@link initNonEmpty} — get only the init
 * @see {@link lastNonEmpty} — get only the last
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const unappend: <A>(self: NonEmptyReadonlyArray<A>) => [arrayWithoutLastElement: Array<A>, lastElement: A];
/**
 * Returns the first element of an array wrapped in `Option.some`, or
 * `Option.none` if the array is empty.
 *
 * **Example** (Getting the first element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.head([1, 2, 3])) // Some(1)
 * console.log(Array.head([])) // None
 * ```
 *
 * @see {@link headNonEmpty} — direct access when array is known non-empty
 * @see {@link last} — get the last element
 *
 * @category getters
 * @since 2.0.0
 */
export declare const head: <A>(self: ReadonlyArray<A>) => Option.Option<A>;
/**
 * Returns the first element of a `NonEmptyReadonlyArray` directly (no `Option`
 * wrapper).
 *
 * **Example** (Getting the head of a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.headNonEmpty([1, 2, 3, 4])) // 1
 * ```
 *
 * @see {@link head} — safe version for possibly-empty arrays
 *
 * @category getters
 * @since 2.0.0
 */
export declare const headNonEmpty: <A>(self: NonEmptyReadonlyArray<A>) => A;
/**
 * Returns the last element of an array wrapped in `Option.some`, or
 * `Option.none` if the array is empty.
 *
 * **Example** (Getting the last element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.last([1, 2, 3])) // Some(3)
 * console.log(Array.last([])) // None
 * ```
 *
 * @see {@link lastNonEmpty} — direct access when array is known non-empty
 * @see {@link head} — get the first element
 *
 * @category getters
 * @since 2.0.0
 */
export declare const last: <A>(self: ReadonlyArray<A>) => Option.Option<A>;
/**
 * Returns the last element of a `NonEmptyReadonlyArray` directly (no `Option`
 * wrapper).
 *
 * **Example** (Getting the last of a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.lastNonEmpty([1, 2, 3, 4])) // 4
 * ```
 *
 * @see {@link last} — safe version for possibly-empty arrays
 *
 * @category getters
 * @since 2.0.0
 */
export declare const lastNonEmpty: <A>(self: NonEmptyReadonlyArray<A>) => A;
/**
 * Returns all elements except the first, wrapped in an `Option`.
 *
 * - Allocates a new array via `slice(1)`.
 * - Returns `Option.none()` for empty inputs.
 *
 * **Example** (Getting the tail)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.tail([1, 2, 3, 4])) // Option.some([2, 3, 4])
 * console.log(Array.tail([])) // Option.none()
 * ```
 *
 * @see {@link tailNonEmpty} — when the array is known non-empty
 * @see {@link init} — all elements except the last
 *
 * @category getters
 * @since 2.0.0
 */
export declare function tail<A>(self: Iterable<A>): Option.Option<Array<A>>;
/**
 * Returns all elements except the first of a `NonEmptyReadonlyArray`.
 *
 * **Example** (Getting the tail of a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.tailNonEmpty([1, 2, 3, 4])) // [2, 3, 4]
 * ```
 *
 * @see {@link tail} — safe version for possibly-empty arrays
 * @see {@link initNonEmpty} — all elements except the last
 *
 * @category getters
 * @since 2.0.0
 */
export declare const tailNonEmpty: <A>(self: NonEmptyReadonlyArray<A>) => Array<A>;
/**
 * Returns all elements except the last, wrapped in an `Option`.
 *
 * - Allocates a new array via `slice(0, -1)`.
 * - Returns `Option.none()` for empty inputs.
 *
 * **Example** (Getting init)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.init([1, 2, 3, 4])) // Option.some([1, 2, 3])
 * console.log(Array.init([])) // Option.none()
 * ```
 *
 * @see {@link initNonEmpty} — when the array is known non-empty
 * @see {@link tail} — all elements except the first
 *
 * @category getters
 * @since 2.0.0
 */
export declare function init<A>(self: Iterable<A>): Option.Option<Array<A>>;
/**
 * Returns all elements except the last of a `NonEmptyReadonlyArray`.
 *
 * **Example** (Getting init of a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.initNonEmpty([1, 2, 3, 4])) // [1, 2, 3]
 * ```
 *
 * @see {@link init} — safe version for possibly-empty arrays
 * @see {@link tailNonEmpty} — all elements except the first
 *
 * @category getters
 * @since 2.0.0
 */
export declare const initNonEmpty: <A>(self: NonEmptyReadonlyArray<A>) => Array<A>;
/**
 * Keeps the first `n` elements, creating a new array.
 *
 * - `n` is clamped to `[0, length]`.
 * - Returns an empty array when `n <= 0`.
 *
 * **Example** (Taking from the start)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.take([1, 2, 3, 4, 5], 3)) // [1, 2, 3]
 * ```
 *
 * @see {@link takeRight} — keep from the end
 * @see {@link takeWhile} — keep while predicate holds
 * @see {@link drop} — remove from the start
 *
 * @category getters
 * @since 2.0.0
 */
export declare const take: {
    /**
     * Keeps the first `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Taking from the start)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.take([1, 2, 3, 4, 5], 3)) // [1, 2, 3]
     * ```
     *
     * @see {@link takeRight} — keep from the end
     * @see {@link takeWhile} — keep while predicate holds
     * @see {@link drop} — remove from the start
     *
     * @category getters
     * @since 2.0.0
     */
    (n: number): <A>(self: Iterable<A>) => Array<A>;
    /**
     * Keeps the first `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Taking from the start)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.take([1, 2, 3, 4, 5], 3)) // [1, 2, 3]
     * ```
     *
     * @see {@link takeRight} — keep from the end
     * @see {@link takeWhile} — keep while predicate holds
     * @see {@link drop} — remove from the start
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<A>;
};
/**
 * Keeps the last `n` elements, creating a new array.
 *
 * - `n` is clamped to `[0, length]`.
 * - Returns an empty array when `n <= 0`.
 *
 * **Example** (Taking from the end)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.takeRight([1, 2, 3, 4, 5], 3)) // [3, 4, 5]
 * ```
 *
 * @see {@link take} — keep from the start
 * @see {@link dropRight} — remove from the end
 *
 * @category getters
 * @since 2.0.0
 */
export declare const takeRight: {
    /**
     * Keeps the last `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Taking from the end)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeRight([1, 2, 3, 4, 5], 3)) // [3, 4, 5]
     * ```
     *
     * @see {@link take} — keep from the start
     * @see {@link dropRight} — remove from the end
     *
     * @category getters
     * @since 2.0.0
     */
    (n: number): <A>(self: Iterable<A>) => Array<A>;
    /**
     * Keeps the last `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Taking from the end)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeRight([1, 2, 3, 4, 5], 3)) // [3, 4, 5]
     * ```
     *
     * @see {@link take} — keep from the start
     * @see {@link dropRight} — remove from the end
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<A>;
};
/**
 * Takes elements from the start while the predicate holds, stopping at the
 * first element that fails.
 *
 * - Supports refinements for type narrowing.
 * - The predicate receives `(element, index)`.
 *
 * **Example** (Taking while condition holds)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
 * ```
 *
 * @see {@link take} — take a fixed count
 * @see {@link dropWhile} — drop while predicate holds
 * @see {@link span} — split into matching prefix + rest
 *
 * @category getters
 * @since 2.0.0
 */
export declare const takeWhile: {
    /**
     * Takes elements from the start while the predicate holds, stopping at the
     * first element that fails.
     *
     * - Supports refinements for type narrowing.
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Taking while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
     * ```
     *
     * @see {@link take} — take a fixed count
     * @see {@link dropWhile} — drop while predicate holds
     * @see {@link span} — split into matching prefix + rest
     *
     * @category getters
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Array<B>;
    /**
     * Takes elements from the start while the predicate holds, stopping at the
     * first element that fails.
     *
     * - Supports refinements for type narrowing.
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Taking while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
     * ```
     *
     * @see {@link take} — take a fixed count
     * @see {@link dropWhile} — drop while predicate holds
     * @see {@link span} — split into matching prefix + rest
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>;
    /**
     * Takes elements from the start while the predicate holds, stopping at the
     * first element that fails.
     *
     * - Supports refinements for type narrowing.
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Taking while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
     * ```
     *
     * @see {@link take} — take a fixed count
     * @see {@link dropWhile} — drop while predicate holds
     * @see {@link span} — split into matching prefix + rest
     *
     * @category getters
     * @since 2.0.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Array<B>;
    /**
     * Takes elements from the start while the predicate holds, stopping at the
     * first element that fails.
     *
     * - Supports refinements for type narrowing.
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Taking while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.takeWhile([1, 3, 2, 4, 1, 2], (x) => x < 4)) // [1, 3, 2]
     * ```
     *
     * @see {@link take} — take a fixed count
     * @see {@link dropWhile} — drop while predicate holds
     * @see {@link span} — split into matching prefix + rest
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>;
};
/**
 * Takes elements from the start while a `Filter` succeeds, collecting transformed values.
 *
 * - The filter receives `(element, index)`.
 * - Stops at the first filter failure.
 *
 * @category getters
 * @since 4.0.0
 */
export declare const takeWhileFilter: {
    /**
     * Takes elements from the start while a `Filter` succeeds, collecting transformed values.
     *
     * - The filter receives `(element, index)`.
     * - Stops at the first filter failure.
     *
     * @category getters
     * @since 4.0.0
     */
    <A, B, X>(f: (input: NoInfer<A>, i: number) => Result.Result<B, X>): (self: Iterable<A>) => Array<B>;
    /**
     * Takes elements from the start while a `Filter` succeeds, collecting transformed values.
     *
     * - The filter receives `(element, index)`.
     * - Stops at the first filter failure.
     *
     * @category getters
     * @since 4.0.0
     */
    <A, B, X>(self: Iterable<A>, f: (input: NoInfer<A>, i: number) => Result.Result<B, X>): Array<B>;
};
/**
 * Splits an iterable into two arrays: the longest prefix where the predicate
 * holds, and the remaining elements.
 *
 * - Equivalent to `[takeWhile(pred), dropWhile(pred)]` but more efficient
 *   (single pass).
 * - Supports refinements for type narrowing of the prefix.
 *
 * **Example** (Splitting at predicate boundary)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
 * ```
 *
 * @see {@link takeWhile} — keep only the matching prefix
 * @see {@link dropWhile} — keep only the rest
 * @see {@link splitWhere} — split at the first element matching a predicate
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const span: {
    /**
     * Splits an iterable into two arrays: the longest prefix where the predicate
     * holds, and the remaining elements.
     *
     * - Equivalent to `[takeWhile(pred), dropWhile(pred)]` but more efficient
     *   (single pass).
     * - Supports refinements for type narrowing of the prefix.
     *
     * **Example** (Splitting at predicate boundary)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
     * ```
     *
     * @see {@link takeWhile} — keep only the matching prefix
     * @see {@link dropWhile} — keep only the rest
     * @see {@link splitWhere} — split at the first element matching a predicate
     *
     * @category splitting
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => [init: Array<B>, rest: Array<Exclude<A, B>>];
    /**
     * Splits an iterable into two arrays: the longest prefix where the predicate
     * holds, and the remaining elements.
     *
     * - Equivalent to `[takeWhile(pred), dropWhile(pred)]` but more efficient
     *   (single pass).
     * - Supports refinements for type narrowing of the prefix.
     *
     * **Example** (Splitting at predicate boundary)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
     * ```
     *
     * @see {@link takeWhile} — keep only the matching prefix
     * @see {@link dropWhile} — keep only the rest
     * @see {@link splitWhere} — split at the first element matching a predicate
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => [init: Array<A>, rest: Array<A>];
    /**
     * Splits an iterable into two arrays: the longest prefix where the predicate
     * holds, and the remaining elements.
     *
     * - Equivalent to `[takeWhile(pred), dropWhile(pred)]` but more efficient
     *   (single pass).
     * - Supports refinements for type narrowing of the prefix.
     *
     * **Example** (Splitting at predicate boundary)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
     * ```
     *
     * @see {@link takeWhile} — keep only the matching prefix
     * @see {@link dropWhile} — keep only the rest
     * @see {@link splitWhere} — split at the first element matching a predicate
     *
     * @category splitting
     * @since 2.0.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): [init: Array<B>, rest: Array<Exclude<A, B>>];
    /**
     * Splits an iterable into two arrays: the longest prefix where the predicate
     * holds, and the remaining elements.
     *
     * - Equivalent to `[takeWhile(pred), dropWhile(pred)]` but more efficient
     *   (single pass).
     * - Supports refinements for type narrowing of the prefix.
     *
     * **Example** (Splitting at predicate boundary)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.span([1, 3, 2, 4, 5], (x) => x % 2 === 1)) // [[1, 3], [2, 4, 5]]
     * ```
     *
     * @see {@link takeWhile} — keep only the matching prefix
     * @see {@link dropWhile} — keep only the rest
     * @see {@link splitWhere} — split at the first element matching a predicate
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): [init: Array<A>, rest: Array<A>];
};
/**
 * Removes the first `n` elements, creating a new array.
 *
 * - `n` is clamped to `[0, length]`.
 * - Returns a copy of the full array when `n <= 0`.
 *
 * **Example** (Dropping from the start)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.drop([1, 2, 3, 4, 5], 2)) // [3, 4, 5]
 * ```
 *
 * @see {@link dropRight} — remove from the end
 * @see {@link dropWhile} — remove while predicate holds
 * @see {@link take} — keep from the start
 *
 * @category getters
 * @since 2.0.0
 */
export declare const drop: {
    /**
     * Removes the first `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns a copy of the full array when `n <= 0`.
     *
     * **Example** (Dropping from the start)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.drop([1, 2, 3, 4, 5], 2)) // [3, 4, 5]
     * ```
     *
     * @see {@link dropRight} — remove from the end
     * @see {@link dropWhile} — remove while predicate holds
     * @see {@link take} — keep from the start
     *
     * @category getters
     * @since 2.0.0
     */
    (n: number): <A>(self: Iterable<A>) => Array<A>;
    /**
     * Removes the first `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     * - Returns a copy of the full array when `n <= 0`.
     *
     * **Example** (Dropping from the start)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.drop([1, 2, 3, 4, 5], 2)) // [3, 4, 5]
     * ```
     *
     * @see {@link dropRight} — remove from the end
     * @see {@link dropWhile} — remove while predicate holds
     * @see {@link take} — keep from the start
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<A>;
};
/**
 * Removes the last `n` elements, creating a new array.
 *
 * - `n` is clamped to `[0, length]`.
 *
 * **Example** (Dropping from the end)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dropRight([1, 2, 3, 4, 5], 2)) // [1, 2, 3]
 * ```
 *
 * @see {@link drop} — remove from the start
 * @see {@link takeRight} — keep from the end
 *
 * @category getters
 * @since 2.0.0
 */
export declare const dropRight: {
    /**
     * Removes the last `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     *
     * **Example** (Dropping from the end)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dropRight([1, 2, 3, 4, 5], 2)) // [1, 2, 3]
     * ```
     *
     * @see {@link drop} — remove from the start
     * @see {@link takeRight} — keep from the end
     *
     * @category getters
     * @since 2.0.0
     */
    (n: number): <A>(self: Iterable<A>) => Array<A>;
    /**
     * Removes the last `n` elements, creating a new array.
     *
     * - `n` is clamped to `[0, length]`.
     *
     * **Example** (Dropping from the end)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dropRight([1, 2, 3, 4, 5], 2)) // [1, 2, 3]
     * ```
     *
     * @see {@link drop} — remove from the start
     * @see {@link takeRight} — keep from the end
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<A>;
};
/**
 * Drops elements from the start while the predicate holds, returning the rest.
 *
 * - The predicate receives `(element, index)`.
 *
 * **Example** (Dropping while condition holds)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dropWhile([1, 2, 3, 4, 5], (x) => x < 4)) // [4, 5]
 * ```
 *
 * @see {@link takeWhile} — keep the matching prefix instead
 * @see {@link drop} — drop a fixed count
 *
 * @category getters
 * @since 2.0.0
 */
export declare const dropWhile: {
    /**
     * Drops elements from the start while the predicate holds, returning the rest.
     *
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Dropping while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dropWhile([1, 2, 3, 4, 5], (x) => x < 4)) // [4, 5]
     * ```
     *
     * @see {@link takeWhile} — keep the matching prefix instead
     * @see {@link drop} — drop a fixed count
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>;
    /**
     * Drops elements from the start while the predicate holds, returning the rest.
     *
     * - The predicate receives `(element, index)`.
     *
     * **Example** (Dropping while condition holds)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dropWhile([1, 2, 3, 4, 5], (x) => x < 4)) // [4, 5]
     * ```
     *
     * @see {@link takeWhile} — keep the matching prefix instead
     * @see {@link drop} — drop a fixed count
     *
     * @category getters
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>;
};
/**
 * Drops elements from the start while a `Filter` succeeds.
 *
 * - The filter receives `(element, index)`.
 * - Returns the remaining original elements after the first filter failure.
 *
 * @category getters
 * @since 4.0.0
 */
export declare const dropWhileFilter: {
    /**
     * Drops elements from the start while a `Filter` succeeds.
     *
     * - The filter receives `(element, index)`.
     * - Returns the remaining original elements after the first filter failure.
     *
     * @category getters
     * @since 4.0.0
     */
    <A, B, X>(f: (input: NoInfer<A>, i: number) => Result.Result<B, X>): (self: Iterable<A>) => Array<A>;
    /**
     * Drops elements from the start while a `Filter` succeeds.
     *
     * - The filter receives `(element, index)`.
     * - Returns the remaining original elements after the first filter failure.
     *
     * @category getters
     * @since 4.0.0
     */
    <A, B, X>(self: Iterable<A>, f: (input: A, i: number) => Result.Result<B, X>): Array<A>;
};
/**
 * Returns the index of the first element matching the predicate, wrapped in an
 * `Option`.
 *
 * **Example** (Finding an index)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirstIndex([5, 3, 8, 9], (x) => x > 5)) // Option.some(2)
 * ```
 *
 * @see {@link findLastIndex} — search from the end
 * @see {@link findFirst} — get the element itself
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findFirstIndex: {
    /**
     * Returns the index of the first element matching the predicate, wrapped in an
     * `Option`.
     *
     * **Example** (Finding an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstIndex([5, 3, 8, 9], (x) => x > 5)) // Option.some(2)
     * ```
     *
     * @see {@link findLastIndex} — search from the end
     * @see {@link findFirst} — get the element itself
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<number>;
    /**
     * Returns the index of the first element matching the predicate, wrapped in an
     * `Option`.
     *
     * **Example** (Finding an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstIndex([5, 3, 8, 9], (x) => x > 5)) // Option.some(2)
     * ```
     *
     * @see {@link findLastIndex} — search from the end
     * @see {@link findFirst} — get the element itself
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<number>;
};
/**
 * Returns the index of the last element matching the predicate, wrapped in an
 * `Option`.
 *
 * **Example** (Finding the last matching index)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findLastIndex([1, 3, 8, 9], (x) => x < 5)) // Option.some(1)
 * ```
 *
 * @see {@link findFirstIndex} — search from the start
 * @see {@link findLast} — get the element itself
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findLastIndex: {
    /**
     * Returns the index of the last element matching the predicate, wrapped in an
     * `Option`.
     *
     * **Example** (Finding the last matching index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLastIndex([1, 3, 8, 9], (x) => x < 5)) // Option.some(1)
     * ```
     *
     * @see {@link findFirstIndex} — search from the start
     * @see {@link findLast} — get the element itself
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<number>;
    /**
     * Returns the index of the last element matching the predicate, wrapped in an
     * `Option`.
     *
     * **Example** (Finding the last matching index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLastIndex([1, 3, 8, 9], (x) => x < 5)) // Option.some(1)
     * ```
     *
     * @see {@link findFirstIndex} — search from the start
     * @see {@link findLast} — get the element itself
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<number>;
};
/**
 * Returns the first element matching a predicate, refinement, or mapping
 * function, wrapped in `Option`.
 *
 * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
 *   `(a, i) => Option<B>` for simultaneous find-and-transform.
 * - Returns `Option.none()` if no element matches.
 *
 * **Example** (Finding the first match)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
 * ```
 *
 * @see {@link findLast} — search from the end
 * @see {@link findFirstIndex} — get the index instead
 * @see {@link findFirstWithIndex} — get both element and index
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findFirst: {
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<B>;
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<B>;
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<A>;
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>;
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>;
    /**
     * Returns the first element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Accepts a predicate `(a, i) => boolean`, a refinement, or a function
     *   `(a, i) => Option<B>` for simultaneous find-and-transform.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the first match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirst([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some(4)
     * ```
     *
     * @see {@link findLast} — search from the end
     * @see {@link findFirstIndex} — get the index instead
     * @see {@link findFirstWithIndex} — get both element and index
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>;
};
/**
 * Returns a tuple `[element, index]` of the first element matching a
 * predicate, wrapped in an `Option`.
 *
 * **Example** (Finding element with its index)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
 * ```
 *
 * @see {@link findFirst} — get only the element
 * @see {@link findFirstIndex} — get only the index
 *
 * @category elements
 * @since 3.17.0
 */
export declare const findFirstWithIndex: {
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<[B, number]>;
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<[B, number]>;
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<[A, number]>;
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<[B, number]>;
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<[B, number]>;
    /**
     * Returns a tuple `[element, index]` of the first element matching a
     * predicate, wrapped in an `Option`.
     *
     * **Example** (Finding element with its index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findFirstWithIndex([1, 2, 3, 4, 5], (x) => x > 3)) // Option.some([4, 3])
     * ```
     *
     * @see {@link findFirst} — get only the element
     * @see {@link findFirstIndex} — get only the index
     *
     * @category elements
     * @since 3.17.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<[A, number]>;
};
/**
 * Returns the last element matching a predicate, refinement, or mapping
 * function, wrapped in `Option`.
 *
 * - Searches from the end of the array.
 * - Returns `Option.none()` if no element matches.
 *
 * **Example** (Finding the last match)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
 * ```
 *
 * @see {@link findFirst} — search from the start
 * @see {@link findLastIndex} — get the index instead
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findLast: {
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(f: (a: NoInfer<A>, i: number) => Option.Option<B>): (self: Iterable<A>) => Option.Option<B>;
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Option.Option<B>;
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Option.Option<A>;
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, f: (a: A, i: number) => Option.Option<B>): Option.Option<B>;
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Option.Option<B>;
    /**
     * Returns the last element matching a predicate, refinement, or mapping
     * function, wrapped in `Option`.
     *
     * - Searches from the end of the array.
     * - Returns `Option.none()` if no element matches.
     *
     * **Example** (Finding the last match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.findLast([1, 2, 3, 4, 5], (n) => n % 2 === 0)) // Option.some(4)
     * ```
     *
     * @see {@link findFirst} — search from the start
     * @see {@link findLastIndex} — get the index instead
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Option.Option<A>;
};
/**
 * Inserts an element at the specified index, returning a new `NonEmptyArray`
 * wrapped in an `Option`.
 *
 * - Valid indices: `0` to `length` (inclusive — inserting at `length` appends).
 * - Does not mutate the input.
 *
 * **Example** (Inserting at an index)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.insertAt(["a", "b", "c", "e"], 3, "d")) // Option.some(["a", "b", "c", "d", "e"])
 * ```
 *
 * @see {@link replace} — replace an existing element
 * @see {@link modify} — transform an element at an index
 *
 * @category elements
 * @since 2.0.0
 */
export declare const insertAt: {
    /**
     * Inserts an element at the specified index, returning a new `NonEmptyArray`
     * wrapped in an `Option`.
     *
     * - Valid indices: `0` to `length` (inclusive — inserting at `length` appends).
     * - Does not mutate the input.
     *
     * **Example** (Inserting at an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.insertAt(["a", "b", "c", "e"], 3, "d")) // Option.some(["a", "b", "c", "d", "e"])
     * ```
     *
     * @see {@link replace} — replace an existing element
     * @see {@link modify} — transform an element at an index
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(i: number, b: B): <A>(self: Iterable<A>) => Option.Option<NonEmptyArray<A | B>>;
    /**
     * Inserts an element at the specified index, returning a new `NonEmptyArray`
     * wrapped in an `Option`.
     *
     * - Valid indices: `0` to `length` (inclusive — inserting at `length` appends).
     * - Does not mutate the input.
     *
     * **Example** (Inserting at an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.insertAt(["a", "b", "c", "e"], 3, "d")) // Option.some(["a", "b", "c", "d", "e"])
     * ```
     *
     * @see {@link replace} — replace an existing element
     * @see {@link modify} — transform an element at an index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, i: number, b: B): Option.Option<NonEmptyArray<A | B>>;
};
/**
 * Replaces the element at the specified index with a new value, returning a new
 * array, wrapped in an `Option`.
 *
 * - Does not mutate the input.
 *
 * **Example** (Replacing an element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.replace([1, 2, 3], 1, 4)) // Option.some([1, 4, 3])
 * ```
 *
 * @see {@link modify} — transform an element with a function
 * @see {@link insertAt} — insert without removing
 *
 * @category elements
 * @since 2.0.0
 */
export declare const replace: {
    /**
     * Replaces the element at the specified index with a new value, returning a new
     * array, wrapped in an `Option`.
     *
     * - Does not mutate the input.
     *
     * **Example** (Replacing an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.replace([1, 2, 3], 1, 4)) // Option.some([1, 4, 3])
     * ```
     *
     * @see {@link modify} — transform an element with a function
     * @see {@link insertAt} — insert without removing
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(i: number, b: B): <A, S extends Iterable<A> = Iterable<A>>(self: S) => Option.Option<ReadonlyArray.With<S, ReadonlyArray.Infer<S> | B>>;
    /**
     * Replaces the element at the specified index with a new value, returning a new
     * array, wrapped in an `Option`.
     *
     * - Does not mutate the input.
     *
     * **Example** (Replacing an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.replace([1, 2, 3], 1, 4)) // Option.some([1, 4, 3])
     * ```
     *
     * @see {@link modify} — transform an element with a function
     * @see {@link insertAt} — insert without removing
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B, S extends Iterable<A> = Iterable<A>>(self: S, i: number, b: B): Option.Option<ReadonlyArray.With<S, ReadonlyArray.Infer<S> | B>>;
};
/**
 * Applies a function to the element at the specified index, returning a new
 * array, wrapped in an `Option`.
 *
 * - Does not mutate the input.
 *
 * **Example** (Modifying an element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modify([1, 2, 3, 4], 2, (n) => n * 2)) // Option.some([1, 2, 6, 4])
 * console.log(Array.modify([1, 2, 3, 4], 5, (n) => n * 2)) // Option.none()
 * ```
 *
 * @see {@link replace} — set a fixed value at an index
 * @see {@link modifyHeadNonEmpty} — modify the first element
 * @see {@link modifyLastNonEmpty} — modify the last element
 *
 * @category elements
 * @since 2.0.0
 */
export declare const modify: {
    /**
     * Applies a function to the element at the specified index, returning a new
     * array, wrapped in an `Option`.
     *
     * - Does not mutate the input.
     *
     * **Example** (Modifying an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modify([1, 2, 3, 4], 2, (n) => n * 2)) // Option.some([1, 2, 6, 4])
     * console.log(Array.modify([1, 2, 3, 4], 5, (n) => n * 2)) // Option.none()
     * ```
     *
     * @see {@link replace} — set a fixed value at an index
     * @see {@link modifyHeadNonEmpty} — modify the first element
     * @see {@link modifyLastNonEmpty} — modify the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B, S extends Iterable<A> = Iterable<A>>(i: number, f: (a: ReadonlyArray.Infer<S>) => B): (self: S) => Option.Option<ReadonlyArray.With<S, ReadonlyArray.Infer<S> | B>>;
    /**
     * Applies a function to the element at the specified index, returning a new
     * array, wrapped in an `Option`.
     *
     * - Does not mutate the input.
     *
     * **Example** (Modifying an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modify([1, 2, 3, 4], 2, (n) => n * 2)) // Option.some([1, 2, 6, 4])
     * console.log(Array.modify([1, 2, 3, 4], 5, (n) => n * 2)) // Option.none()
     * ```
     *
     * @see {@link replace} — set a fixed value at an index
     * @see {@link modifyHeadNonEmpty} — modify the first element
     * @see {@link modifyLastNonEmpty} — modify the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B, S extends Iterable<A> = Iterable<A>>(self: S, i: number, f: (a: ReadonlyArray.Infer<S>) => B): Option.Option<ReadonlyArray.With<S, ReadonlyArray.Infer<S> | B>>;
};
/**
 * Removes the element at the specified index, returning a new array. If the
 * index is out of bounds, returns a copy of the original.
 *
 * - Does not mutate the input.
 *
 * **Example** (Removing an element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.remove([1, 2, 3, 4], 2)) // [1, 2, 4]
 * console.log(Array.remove([1, 2, 3, 4], 5)) // [1, 2, 3, 4]
 * ```
 *
 * @see {@link insertAt} — insert an element
 * @see {@link filter} — remove elements by predicate
 *
 * @category elements
 * @since 2.0.0
 */
export declare const remove: {
    /**
     * Removes the element at the specified index, returning a new array. If the
     * index is out of bounds, returns a copy of the original.
     *
     * - Does not mutate the input.
     *
     * **Example** (Removing an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.remove([1, 2, 3, 4], 2)) // [1, 2, 4]
     * console.log(Array.remove([1, 2, 3, 4], 5)) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link insertAt} — insert an element
     * @see {@link filter} — remove elements by predicate
     *
     * @category elements
     * @since 2.0.0
     */
    (i: number): <A>(self: Iterable<A>) => Array<A>;
    /**
     * Removes the element at the specified index, returning a new array. If the
     * index is out of bounds, returns a copy of the original.
     *
     * - Does not mutate the input.
     *
     * **Example** (Removing an element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.remove([1, 2, 3, 4], 2)) // [1, 2, 4]
     * console.log(Array.remove([1, 2, 3, 4], 5)) // [1, 2, 3, 4]
     * ```
     *
     * @see {@link insertAt} — insert an element
     * @see {@link filter} — remove elements by predicate
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, i: number): Array<A>;
};
/**
 * Reverses an iterable into a new array.
 *
 * - Does not mutate the input.
 * - Preserves `NonEmptyArray` in the return type.
 *
 * **Example** (Reversing an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reverse([1, 2, 3, 4])) // [4, 3, 2, 1]
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const reverse: <S extends Iterable<any>>(self: S) => S extends NonEmptyReadonlyArray<infer A> ? NonEmptyArray<A> : S extends Iterable<infer A> ? Array<A> : never;
/**
 * Sorts an array by the given `Order`, returning a new array.
 *
 * - Does not mutate the input.
 * - Preserves `NonEmptyArray` in the return type.
 * - Use {@link sortWith} to sort by a derived key, or {@link sortBy} for
 *   multi-key sorting.
 *
 * **Example** (Sorting numbers)
 *
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]
 * ```
 *
 * @see {@link sortWith} — sort by a mapping function
 * @see {@link sortBy} — sort by multiple orders
 *
 * @category sorting
 * @since 2.0.0
 */
export declare const sort: {
    /**
     * Sorts an array by the given `Order`, returning a new array.
     *
     * - Does not mutate the input.
     * - Preserves `NonEmptyArray` in the return type.
     * - Use {@link sortWith} to sort by a derived key, or {@link sortBy} for
     *   multi-key sorting.
     *
     * **Example** (Sorting numbers)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]
     * ```
     *
     * @see {@link sortWith} — sort by a mapping function
     * @see {@link sortBy} — sort by multiple orders
     *
     * @category sorting
     * @since 2.0.0
     */
    <B>(O: Order.Order<B>): <A extends B, S extends Iterable<A>>(self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>;
    /**
     * Sorts an array by the given `Order`, returning a new array.
     *
     * - Does not mutate the input.
     * - Preserves `NonEmptyArray` in the return type.
     * - Use {@link sortWith} to sort by a derived key, or {@link sortBy} for
     *   multi-key sorting.
     *
     * **Example** (Sorting numbers)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]
     * ```
     *
     * @see {@link sortWith} — sort by a mapping function
     * @see {@link sortBy} — sort by multiple orders
     *
     * @category sorting
     * @since 2.0.0
     */
    <A extends B, B>(self: NonEmptyReadonlyArray<A>, O: Order.Order<B>): NonEmptyArray<A>;
    /**
     * Sorts an array by the given `Order`, returning a new array.
     *
     * - Does not mutate the input.
     * - Preserves `NonEmptyArray` in the return type.
     * - Use {@link sortWith} to sort by a derived key, or {@link sortBy} for
     *   multi-key sorting.
     *
     * **Example** (Sorting numbers)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sort([3, 1, 4, 1, 5], Order.Number)) // [1, 1, 3, 4, 5]
     * ```
     *
     * @see {@link sortWith} — sort by a mapping function
     * @see {@link sortBy} — sort by multiple orders
     *
     * @category sorting
     * @since 2.0.0
     */
    <A extends B, B>(self: Iterable<A>, O: Order.Order<B>): Array<A>;
};
/**
 * Sorts an array by a derived key using a mapping function and an `Order` for
 * that key.
 *
 * - Equivalent to `sort(Order.mapInput(order, f))` but more convenient.
 * - Does not mutate the input.
 *
 * **Example** (Sorting strings by length)
 *
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))
 * // ["b", "cc", "aaa"]
 * ```
 *
 * @see {@link sort} — sort by a direct `Order`
 * @see {@link sortBy} — sort by multiple orders
 *
 * @since 2.0.0
 * @category elements
 */
export declare const sortWith: {
    /**
     * Sorts an array by a derived key using a mapping function and an `Order` for
     * that key.
     *
     * - Equivalent to `sort(Order.mapInput(order, f))` but more convenient.
     * - Does not mutate the input.
     *
     * **Example** (Sorting strings by length)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))
     * // ["b", "cc", "aaa"]
     * ```
     *
     * @see {@link sort} — sort by a direct `Order`
     * @see {@link sortBy} — sort by multiple orders
     *
     * @since 2.0.0
     * @category elements
     */
    <S extends Iterable<any>, B>(f: (a: ReadonlyArray.Infer<S>) => B, order: Order.Order<B>): (self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>;
    /**
     * Sorts an array by a derived key using a mapping function and an `Order` for
     * that key.
     *
     * - Equivalent to `sort(Order.mapInput(order, f))` but more convenient.
     * - Does not mutate the input.
     *
     * **Example** (Sorting strings by length)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))
     * // ["b", "cc", "aaa"]
     * ```
     *
     * @see {@link sort} — sort by a direct `Order`
     * @see {@link sortBy} — sort by multiple orders
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, f: (a: A) => B, O: Order.Order<B>): NonEmptyArray<A>;
    /**
     * Sorts an array by a derived key using a mapping function and an `Order` for
     * that key.
     *
     * - Equivalent to `sort(Order.mapInput(order, f))` but more convenient.
     * - Does not mutate the input.
     *
     * **Example** (Sorting strings by length)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.sortWith(["aaa", "b", "cc"], (s) => s.length, Order.Number))
     * // ["b", "cc", "aaa"]
     * ```
     *
     * @see {@link sort} — sort by a direct `Order`
     * @see {@link sortBy} — sort by multiple orders
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B>(self: Iterable<A>, f: (a: A) => B, order: Order.Order<B>): Array<A>;
};
/**
 * Sorts an array by multiple `Order`s applied in sequence: the first order is
 * used first; ties are broken by the second order, and so on.
 *
 * - Data-last only (returns a function).
 * - Preserves `NonEmptyArray` in the return type.
 *
 * **Example** (Multi-key sorting)
 *
 * ```ts
 * import { Array, Order, pipe } from "effect"
 *
 * const users = [
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 30 }
 * ]
 *
 * const result = pipe(
 *   users,
 *   Array.sortBy(
 *     Order.mapInput(Order.Number, (user: (typeof users)[number]) => user.age),
 *     Order.mapInput(Order.String, (user: (typeof users)[number]) => user.name)
 *   )
 * )
 * console.log(result)
 * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 30 }]
 * ```
 *
 * @see {@link sort} — sort by a single `Order`
 * @see {@link sortWith} — sort by a derived key
 *
 * @category sorting
 * @since 2.0.0
 */
export declare const sortBy: <S extends Iterable<any>>(...orders: ReadonlyArray<Order.Order<ReadonlyArray.Infer<S>>>) => (self: S) => S extends NonEmptyReadonlyArray<infer A> ? NonEmptyArray<A> : S extends Iterable<infer A> ? Array<A> : never;
/**
 * Pairs elements from two iterables by position. If the iterables differ in
 * length, the extra elements from the longer one are discarded.
 *
 * - Returns `NonEmptyArray` when both inputs are non-empty.
 *
 * **Example** (Zipping two arrays)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
 * ```
 *
 * @see {@link zipWith} — zip with a combiner function
 * @see {@link unzip} — inverse operation
 *
 * @category zipping
 * @since 2.0.0
 */
export declare const zip: {
    /**
     * Pairs elements from two iterables by position. If the iterables differ in
     * length, the extra elements from the longer one are discarded.
     *
     * - Returns `NonEmptyArray` when both inputs are non-empty.
     *
     * **Example** (Zipping two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @see {@link zipWith} — zip with a combiner function
     * @see {@link unzip} — inverse operation
     *
     * @category zipping
     * @since 2.0.0
     */
    <B>(that: NonEmptyReadonlyArray<B>): <A>(self: NonEmptyReadonlyArray<A>) => NonEmptyArray<[A, B]>;
    /**
     * Pairs elements from two iterables by position. If the iterables differ in
     * length, the extra elements from the longer one are discarded.
     *
     * - Returns `NonEmptyArray` when both inputs are non-empty.
     *
     * **Example** (Zipping two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @see {@link zipWith} — zip with a combiner function
     * @see {@link unzip} — inverse operation
     *
     * @category zipping
     * @since 2.0.0
     */
    <B>(that: Iterable<B>): <A>(self: Iterable<A>) => Array<[A, B]>;
    /**
     * Pairs elements from two iterables by position. If the iterables differ in
     * length, the extra elements from the longer one are discarded.
     *
     * - Returns `NonEmptyArray` when both inputs are non-empty.
     *
     * **Example** (Zipping two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @see {@link zipWith} — zip with a combiner function
     * @see {@link unzip} — inverse operation
     *
     * @category zipping
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, that: NonEmptyReadonlyArray<B>): NonEmptyArray<[A, B]>;
    /**
     * Pairs elements from two iterables by position. If the iterables differ in
     * length, the extra elements from the longer one are discarded.
     *
     * - Returns `NonEmptyArray` when both inputs are non-empty.
     *
     * **Example** (Zipping two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zip([1, 2, 3], ["a", "b"])) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @see {@link zipWith} — zip with a combiner function
     * @see {@link unzip} — inverse operation
     *
     * @category zipping
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>): Array<[A, B]>;
};
/**
 * Combines elements from two iterables pairwise using a function. If the
 * iterables differ in length, extra elements are discarded.
 *
 * **Example** (Zipping with addition)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
 * ```
 *
 * @see {@link zip} — zip into tuples
 *
 * @category zipping
 * @since 2.0.0
 */
export declare const zipWith: {
    /**
     * Combines elements from two iterables pairwise using a function. If the
     * iterables differ in length, extra elements are discarded.
     *
     * **Example** (Zipping with addition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
     * ```
     *
     * @see {@link zip} — zip into tuples
     *
     * @category zipping
     * @since 2.0.0
     */
    <B, A, C>(that: NonEmptyReadonlyArray<B>, f: (a: A, b: B) => C): (self: NonEmptyReadonlyArray<A>) => NonEmptyArray<C>;
    /**
     * Combines elements from two iterables pairwise using a function. If the
     * iterables differ in length, extra elements are discarded.
     *
     * **Example** (Zipping with addition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
     * ```
     *
     * @see {@link zip} — zip into tuples
     *
     * @category zipping
     * @since 2.0.0
     */
    <B, A, C>(that: Iterable<B>, f: (a: A, b: B) => C): (self: Iterable<A>) => Array<C>;
    /**
     * Combines elements from two iterables pairwise using a function. If the
     * iterables differ in length, extra elements are discarded.
     *
     * **Example** (Zipping with addition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
     * ```
     *
     * @see {@link zip} — zip into tuples
     *
     * @category zipping
     * @since 2.0.0
     */
    <A, B, C>(self: NonEmptyReadonlyArray<A>, that: NonEmptyReadonlyArray<B>, f: (a: A, b: B) => C): NonEmptyArray<C>;
    /**
     * Combines elements from two iterables pairwise using a function. If the
     * iterables differ in length, extra elements are discarded.
     *
     * **Example** (Zipping with addition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b)) // [5, 7, 9]
     * ```
     *
     * @see {@link zip} — zip into tuples
     *
     * @category zipping
     * @since 2.0.0
     */
    <B, A, C>(self: Iterable<A>, that: Iterable<B>, f: (a: A, b: B) => C): Array<C>;
};
/**
 * Splits an array of pairs into two arrays. Inverse of {@link zip}.
 *
 * **Example** (Unzipping pairs)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.unzip([[1, "a"], [2, "b"], [3, "c"]])) // [[1, 2, 3], ["a", "b", "c"]]
 * ```
 *
 * @see {@link zip} — combine two arrays into pairs
 *
 * @category zipping
 * @since 2.0.0
 */
export declare const unzip: <S extends Iterable<readonly [any, any]>>(self: S) => S extends NonEmptyReadonlyArray<readonly [infer A, infer B]> ? [NonEmptyArray<A>, NonEmptyArray<B>] : S extends Iterable<readonly [infer A, infer B]> ? [Array<A>, Array<B>] : never;
/**
 * Places a separator element between every pair of elements.
 *
 * - Preserves `NonEmptyArray` in the return type.
 * - An empty input produces an empty result.
 *
 * **Example** (Interspersing a separator)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
 * ```
 *
 * @see {@link join} — intersperse and join into a string
 *
 * @category elements
 * @since 2.0.0
 */
export declare const intersperse: {
    /**
     * Places a separator element between every pair of elements.
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - An empty input produces an empty result.
     *
     * **Example** (Interspersing a separator)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
     * ```
     *
     * @see {@link join} — intersperse and join into a string
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(middle: B): <S extends Iterable<any>>(self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S> | B>;
    /**
     * Places a separator element between every pair of elements.
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - An empty input produces an empty result.
     *
     * **Example** (Interspersing a separator)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
     * ```
     *
     * @see {@link join} — intersperse and join into a string
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, middle: B): NonEmptyArray<A | B>;
    /**
     * Places a separator element between every pair of elements.
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - An empty input produces an empty result.
     *
     * **Example** (Interspersing a separator)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.intersperse([1, 2, 3], 0)) // [1, 0, 2, 0, 3]
     * ```
     *
     * @see {@link join} — intersperse and join into a string
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, middle: B): Array<A | B>;
};
/**
 * Applies a function to the first element of a non-empty array, returning a
 * new array.
 *
 * **Example** (Modifying the head)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modifyHeadNonEmpty([1, 2, 3], (n) => n * 10)) // [10, 2, 3]
 * ```
 *
 * @see {@link setHeadNonEmpty} — replace with a fixed value
 * @see {@link modifyLastNonEmpty} — modify the last element
 *
 * @category elements
 * @since 2.0.0
 */
export declare const modifyHeadNonEmpty: {
    /**
     * Applies a function to the first element of a non-empty array, returning a
     * new array.
     *
     * **Example** (Modifying the head)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modifyHeadNonEmpty([1, 2, 3], (n) => n * 10)) // [10, 2, 3]
     * ```
     *
     * @see {@link setHeadNonEmpty} — replace with a fixed value
     * @see {@link modifyLastNonEmpty} — modify the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(f: (a: A) => B): (self: NonEmptyReadonlyArray<A>) => NonEmptyArray<A | B>;
    /**
     * Applies a function to the first element of a non-empty array, returning a
     * new array.
     *
     * **Example** (Modifying the head)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modifyHeadNonEmpty([1, 2, 3], (n) => n * 10)) // [10, 2, 3]
     * ```
     *
     * @see {@link setHeadNonEmpty} — replace with a fixed value
     * @see {@link modifyLastNonEmpty} — modify the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, f: (a: A) => B): NonEmptyArray<A | B>;
};
/**
 * Replaces the first element of a non-empty array with a new value.
 *
 * **Example** (Setting the head)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.setHeadNonEmpty([1, 2, 3], 10)) // [10, 2, 3]
 * ```
 *
 * @see {@link modifyHeadNonEmpty} — transform the head with a function
 * @see {@link setLastNonEmpty} — replace the last element
 *
 * @category elements
 * @since 2.0.0
 */
export declare const setHeadNonEmpty: {
    /**
     * Replaces the first element of a non-empty array with a new value.
     *
     * **Example** (Setting the head)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.setHeadNonEmpty([1, 2, 3], 10)) // [10, 2, 3]
     * ```
     *
     * @see {@link modifyHeadNonEmpty} — transform the head with a function
     * @see {@link setLastNonEmpty} — replace the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(b: B): <A>(self: NonEmptyReadonlyArray<A>) => NonEmptyArray<A | B>;
    /**
     * Replaces the first element of a non-empty array with a new value.
     *
     * **Example** (Setting the head)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.setHeadNonEmpty([1, 2, 3], 10)) // [10, 2, 3]
     * ```
     *
     * @see {@link modifyHeadNonEmpty} — transform the head with a function
     * @see {@link setLastNonEmpty} — replace the last element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, b: B): NonEmptyArray<A | B>;
};
/**
 * Applies a function to the last element of a non-empty array, returning a
 * new array.
 *
 * **Example** (Modifying the last element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.modifyLastNonEmpty([1, 2, 3], (n) => n * 2)) // [1, 2, 6]
 * ```
 *
 * @see {@link setLastNonEmpty} — replace with a fixed value
 * @see {@link modifyHeadNonEmpty} — modify the first element
 *
 * @category elements
 * @since 2.0.0
 */
export declare const modifyLastNonEmpty: {
    /**
     * Applies a function to the last element of a non-empty array, returning a
     * new array.
     *
     * **Example** (Modifying the last element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modifyLastNonEmpty([1, 2, 3], (n) => n * 2)) // [1, 2, 6]
     * ```
     *
     * @see {@link setLastNonEmpty} — replace with a fixed value
     * @see {@link modifyHeadNonEmpty} — modify the first element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(f: (a: A) => B): (self: NonEmptyReadonlyArray<A>) => NonEmptyArray<A | B>;
    /**
     * Applies a function to the last element of a non-empty array, returning a
     * new array.
     *
     * **Example** (Modifying the last element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.modifyLastNonEmpty([1, 2, 3], (n) => n * 2)) // [1, 2, 6]
     * ```
     *
     * @see {@link setLastNonEmpty} — replace with a fixed value
     * @see {@link modifyHeadNonEmpty} — modify the first element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, f: (a: A) => B): NonEmptyArray<A | B>;
};
/**
 * Replaces the last element of a non-empty array with a new value.
 *
 * **Example** (Setting the last element)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.setLastNonEmpty([1, 2, 3], 4)) // [1, 2, 4]
 * ```
 *
 * @see {@link modifyLastNonEmpty} — transform the last element with a function
 * @see {@link setHeadNonEmpty} — replace the first element
 *
 * @category elements
 * @since 2.0.0
 */
export declare const setLastNonEmpty: {
    /**
     * Replaces the last element of a non-empty array with a new value.
     *
     * **Example** (Setting the last element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.setLastNonEmpty([1, 2, 3], 4)) // [1, 2, 4]
     * ```
     *
     * @see {@link modifyLastNonEmpty} — transform the last element with a function
     * @see {@link setHeadNonEmpty} — replace the first element
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(b: B): <A>(self: NonEmptyReadonlyArray<A>) => NonEmptyArray<A | B>;
    /**
     * Replaces the last element of a non-empty array with a new value.
     *
     * **Example** (Setting the last element)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.setLastNonEmpty([1, 2, 3], 4)) // [1, 2, 4]
     * ```
     *
     * @see {@link modifyLastNonEmpty} — transform the last element with a function
     * @see {@link setHeadNonEmpty} — replace the first element
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, b: B): NonEmptyArray<A | B>;
};
/**
 * Rotates an array by `n` steps. Positive `n` rotates left (front elements
 * move to the back).
 *
 * - Preserves `NonEmptyArray` in the return type.
 * - Returns a copy for empty arrays or `n === 0`.
 *
 * **Example** (Rotating elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const rotate: {
    /**
     * Rotates an array by `n` steps. Positive `n` rotates left (front elements
     * move to the back).
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - Returns a copy for empty arrays or `n === 0`.
     *
     * **Example** (Rotating elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (n: number): <S extends Iterable<any>>(self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>;
    /**
     * Rotates an array by `n` steps. Positive `n` rotates left (front elements
     * move to the back).
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - Returns a copy for empty arrays or `n === 0`.
     *
     * **Example** (Rotating elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, n: number): NonEmptyArray<A>;
    /**
     * Rotates an array by `n` steps. Positive `n` rotates left (front elements
     * move to the back).
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - Returns a copy for empty arrays or `n === 0`.
     *
     * **Example** (Rotating elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.rotate(["a", "b", "c", "d"], 2)) // ["c", "d", "a", "b"]
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<A>;
};
/**
 * Returns a membership-test function using a custom equivalence.
 *
 * **Example** (Custom equality check)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const containsNumber = Array.containsWith((a: number, b: number) => a === b)
 * console.log(pipe([1, 2, 3, 4], containsNumber(3))) // true
 * ```
 *
 * @see {@link contains} — uses default `Equal.equivalence()`
 *
 * @category elements
 * @since 2.0.0
 */
export declare const containsWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
    (a: A): (self: Iterable<A>) => boolean;
    (self: Iterable<A>, a: A): boolean;
};
/**
 * Tests whether an array contains a value, using `Equal.equivalence()` for
 * comparison.
 *
 * **Example** (Checking membership)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * console.log(pipe(["a", "b", "c", "d"], Array.contains("c"))) // true
 * ```
 *
 * @see {@link containsWith} — use custom equality
 *
 * @category elements
 * @since 2.0.0
 */
export declare const contains: {
    /**
     * Tests whether an array contains a value, using `Equal.equivalence()` for
     * comparison.
     *
     * **Example** (Checking membership)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * console.log(pipe(["a", "b", "c", "d"], Array.contains("c"))) // true
     * ```
     *
     * @see {@link containsWith} — use custom equality
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(a: A): (self: Iterable<A>) => boolean;
    /**
     * Tests whether an array contains a value, using `Equal.equivalence()` for
     * comparison.
     *
     * **Example** (Checking membership)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * console.log(pipe(["a", "b", "c", "d"], Array.contains("c"))) // true
     * ```
     *
     * @see {@link containsWith} — use custom equality
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, a: A): boolean;
};
/**
 * Repeatedly applies a function that consumes a prefix of the array and
 * produces a value plus the remaining elements, collecting the values.
 *
 * - The function receives a `NonEmptyReadonlyArray` and returns
 *   `[value, rest]`.
 * - Continues until the remaining array is empty.
 * - Useful for custom splitting/grouping logic.
 *
 * **Example** (Chopping an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.chop(
 *   [1, 2, 3, 4, 5],
 *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
 * )
 * console.log(result) // [2, 4, 6, 8, 10]
 * ```
 *
 * @see {@link chunksOf} — split into fixed-size chunks
 * @see {@link splitAt} — split at an index
 *
 * @category elements
 * @since 2.0.0
 */
export declare const chop: {
    /**
     * Repeatedly applies a function that consumes a prefix of the array and
     * produces a value plus the remaining elements, collecting the values.
     *
     * - The function receives a `NonEmptyReadonlyArray` and returns
     *   `[value, rest]`.
     * - Continues until the remaining array is empty.
     * - Useful for custom splitting/grouping logic.
     *
     * **Example** (Chopping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.chop(
     *   [1, 2, 3, 4, 5],
     *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
     * )
     * console.log(result) // [2, 4, 6, 8, 10]
     * ```
     *
     * @see {@link chunksOf} — split into fixed-size chunks
     * @see {@link splitAt} — split at an index
     *
     * @category elements
     * @since 2.0.0
     */
    <S extends Iterable<any>, B>(f: (as: NonEmptyReadonlyArray<ReadonlyArray.Infer<S>>) => readonly [B, ReadonlyArray<ReadonlyArray.Infer<S>>]): (self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>;
    /**
     * Repeatedly applies a function that consumes a prefix of the array and
     * produces a value plus the remaining elements, collecting the values.
     *
     * - The function receives a `NonEmptyReadonlyArray` and returns
     *   `[value, rest]`.
     * - Continues until the remaining array is empty.
     * - Useful for custom splitting/grouping logic.
     *
     * **Example** (Chopping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.chop(
     *   [1, 2, 3, 4, 5],
     *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
     * )
     * console.log(result) // [2, 4, 6, 8, 10]
     * ```
     *
     * @see {@link chunksOf} — split into fixed-size chunks
     * @see {@link splitAt} — split at an index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, f: (as: NonEmptyReadonlyArray<A>) => readonly [B, ReadonlyArray<A>]): NonEmptyArray<B>;
    /**
     * Repeatedly applies a function that consumes a prefix of the array and
     * produces a value plus the remaining elements, collecting the values.
     *
     * - The function receives a `NonEmptyReadonlyArray` and returns
     *   `[value, rest]`.
     * - Continues until the remaining array is empty.
     * - Useful for custom splitting/grouping logic.
     *
     * **Example** (Chopping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.chop(
     *   [1, 2, 3, 4, 5],
     *   (as): [number, Array<number>] => [as[0] * 2, as.slice(1)]
     * )
     * console.log(result) // [2, 4, 6, 8, 10]
     * ```
     *
     * @see {@link chunksOf} — split into fixed-size chunks
     * @see {@link splitAt} — split at an index
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, f: (as: NonEmptyReadonlyArray<A>) => readonly [B, ReadonlyArray<A>]): Array<B>;
};
/**
 * Splits an iterable into two arrays at the given index.
 *
 * - `n` can be `0` (all elements in the second array).
 * - `n` is floored to an integer.
 *
 * **Example** (Splitting at an index)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitAt([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [4, 5]]
 * ```
 *
 * @see {@link splitAtNonEmpty} — for non-empty arrays
 * @see {@link splitWhere} — split at a predicate boundary
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const splitAt: {
    /**
     * Splits an iterable into two arrays at the given index.
     *
     * - `n` can be `0` (all elements in the second array).
     * - `n` is floored to an integer.
     *
     * **Example** (Splitting at an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitAt([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [4, 5]]
     * ```
     *
     * @see {@link splitAtNonEmpty} — for non-empty arrays
     * @see {@link splitWhere} — split at a predicate boundary
     *
     * @category splitting
     * @since 2.0.0
     */
    (n: number): <A>(self: Iterable<A>) => [beforeIndex: Array<A>, fromIndex: Array<A>];
    /**
     * Splits an iterable into two arrays at the given index.
     *
     * - `n` can be `0` (all elements in the second array).
     * - `n` is floored to an integer.
     *
     * **Example** (Splitting at an index)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitAt([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [4, 5]]
     * ```
     *
     * @see {@link splitAtNonEmpty} — for non-empty arrays
     * @see {@link splitWhere} — split at a predicate boundary
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): [beforeIndex: Array<A>, fromIndex: Array<A>];
};
/**
 * Splits a non-empty array into two parts at the given index. The first part
 * is guaranteed to be non-empty (`n` is clamped to >= 1).
 *
 * **Example** (Splitting a non-empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))
 * // [["a", "b", "c"], ["d", "e"]]
 * ```
 *
 * @see {@link splitAt} — for possibly-empty arrays
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const splitAtNonEmpty: {
    /**
     * Splits a non-empty array into two parts at the given index. The first part
     * is guaranteed to be non-empty (`n` is clamped to >= 1).
     *
     * **Example** (Splitting a non-empty array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))
     * // [["a", "b", "c"], ["d", "e"]]
     * ```
     *
     * @see {@link splitAt} — for possibly-empty arrays
     *
     * @category splitting
     * @since 2.0.0
     */
    (n: number): <A>(self: NonEmptyReadonlyArray<A>) => [beforeIndex: NonEmptyArray<A>, fromIndex: Array<A>];
    /**
     * Splits a non-empty array into two parts at the given index. The first part
     * is guaranteed to be non-empty (`n` is clamped to >= 1).
     *
     * **Example** (Splitting a non-empty array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitAtNonEmpty(["a", "b", "c", "d", "e"], 3))
     * // [["a", "b", "c"], ["d", "e"]]
     * ```
     *
     * @see {@link splitAt} — for possibly-empty arrays
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, n: number): [beforeIndex: NonEmptyArray<A>, fromIndex: Array<A>];
};
/**
 * Splits an iterable into `n` roughly equal-sized chunks.
 *
 * - Uses `chunksOf(ceil(length / n))` internally.
 * - The last chunk may be shorter.
 *
 * **Example** (Splitting into groups)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.split([1, 2, 3, 4, 5, 6, 7, 8], 3)) // [[1, 2, 3], [4, 5, 6], [7, 8]]
 * ```
 *
 * @see {@link chunksOf} — split into fixed-size chunks
 *
 * @since 2.0.0
 * @category splitting
 */
export declare const split: {
    /**
     * Splits an iterable into `n` roughly equal-sized chunks.
     *
     * - Uses `chunksOf(ceil(length / n))` internally.
     * - The last chunk may be shorter.
     *
     * **Example** (Splitting into groups)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.split([1, 2, 3, 4, 5, 6, 7, 8], 3)) // [[1, 2, 3], [4, 5, 6], [7, 8]]
     * ```
     *
     * @see {@link chunksOf} — split into fixed-size chunks
     *
     * @since 2.0.0
     * @category splitting
     */
    (n: number): <A>(self: Iterable<A>) => Array<Array<A>>;
    /**
     * Splits an iterable into `n` roughly equal-sized chunks.
     *
     * - Uses `chunksOf(ceil(length / n))` internally.
     * - The last chunk may be shorter.
     *
     * **Example** (Splitting into groups)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.split([1, 2, 3, 4, 5, 6, 7, 8], 3)) // [[1, 2, 3], [4, 5, 6], [7, 8]]
     * ```
     *
     * @see {@link chunksOf} — split into fixed-size chunks
     *
     * @since 2.0.0
     * @category splitting
     */
    <A>(self: Iterable<A>, n: number): Array<Array<A>>;
};
/**
 * Splits an iterable at the first element matching the predicate. The matching
 * element is included in the second array.
 *
 * **Example** (Splitting at a condition)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.splitWhere([1, 2, 3, 4, 5], (n) => n > 3)) // [[1, 2, 3], [4, 5]]
 * ```
 *
 * @see {@link span} — splits at the first element that fails the predicate
 * @see {@link splitAt} — split at a fixed index
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const splitWhere: {
    /**
     * Splits an iterable at the first element matching the predicate. The matching
     * element is included in the second array.
     *
     * **Example** (Splitting at a condition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitWhere([1, 2, 3, 4, 5], (n) => n > 3)) // [[1, 2, 3], [4, 5]]
     * ```
     *
     * @see {@link span} — splits at the first element that fails the predicate
     * @see {@link splitAt} — split at a fixed index
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => [beforeMatch: Array<A>, fromMatch: Array<A>];
    /**
     * Splits an iterable at the first element matching the predicate. The matching
     * element is included in the second array.
     *
     * **Example** (Splitting at a condition)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.splitWhere([1, 2, 3, 4, 5], (n) => n > 3)) // [[1, 2, 3], [4, 5]]
     * ```
     *
     * @see {@link span} — splits at the first element that fails the predicate
     * @see {@link splitAt} — split at a fixed index
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): [beforeMatch: Array<A>, fromMatch: Array<A>];
};
/**
 * Creates a shallow copy of an array.
 *
 * - Preserves `NonEmptyArray` in the return type.
 * - Useful when you need a distinct reference (e.g. before mutating).
 *
 * **Example** (Copying an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const original = [1, 2, 3]
 * const copied = Array.copy(original)
 * console.log(copied) // [1, 2, 3]
 * console.log(original === copied) // false
 * ```
 *
 * @see {@link fromIterable} — returns the same reference for arrays
 *
 * @category elements
 * @since 2.0.0
 */
export declare const copy: {
    /**
     * Creates a shallow copy of an array.
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - Useful when you need a distinct reference (e.g. before mutating).
     *
     * **Example** (Copying an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const original = [1, 2, 3]
     * const copied = Array.copy(original)
     * console.log(copied) // [1, 2, 3]
     * console.log(original === copied) // false
     * ```
     *
     * @see {@link fromIterable} — returns the same reference for arrays
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>): NonEmptyArray<A>;
    /**
     * Creates a shallow copy of an array.
     *
     * - Preserves `NonEmptyArray` in the return type.
     * - Useful when you need a distinct reference (e.g. before mutating).
     *
     * **Example** (Copying an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const original = [1, 2, 3]
     * const copied = Array.copy(original)
     * console.log(copied) // [1, 2, 3]
     * console.log(original === copied) // false
     * ```
     *
     * @see {@link fromIterable} — returns the same reference for arrays
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: ReadonlyArray<A>): Array<A>;
};
/**
 * Pads or truncates an array to exactly `n` elements, filling with `fill`
 * if the array is shorter, or slicing if longer.
 *
 * - Returns an empty array when `n <= 0`.
 *
 * **Example** (Padding an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.pad([1, 2, 3], 6, 0)) // [1, 2, 3, 0, 0, 0]
 * ```
 *
 * @see {@link take} — truncate without padding
 * @see {@link replicate} — create an array of a single repeated value
 *
 * @category elements
 * @since 3.8.4
 */
export declare const pad: {
    /**
     * Pads or truncates an array to exactly `n` elements, filling with `fill`
     * if the array is shorter, or slicing if longer.
     *
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Padding an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.pad([1, 2, 3], 6, 0)) // [1, 2, 3, 0, 0, 0]
     * ```
     *
     * @see {@link take} — truncate without padding
     * @see {@link replicate} — create an array of a single repeated value
     *
     * @category elements
     * @since 3.8.4
     */
    <A, T>(n: number, fill: T): (self: Array<A>) => Array<A | T>;
    /**
     * Pads or truncates an array to exactly `n` elements, filling with `fill`
     * if the array is shorter, or slicing if longer.
     *
     * - Returns an empty array when `n <= 0`.
     *
     * **Example** (Padding an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.pad([1, 2, 3], 6, 0)) // [1, 2, 3, 0, 0, 0]
     * ```
     *
     * @see {@link take} — truncate without padding
     * @see {@link replicate} — create an array of a single repeated value
     *
     * @category elements
     * @since 3.8.4
     */
    <A, T>(self: Array<A>, n: number, fill: T): Array<A | T>;
};
/**
 * Splits an iterable into chunks of length `n`. The last chunk may be shorter
 * if `n` does not evenly divide the length.
 *
 * - `chunksOf(n)([])` is `[]`, not `[[]]`.
 * - Each chunk is a `NonEmptyArray`.
 * - Preserves `NonEmptyArray` in the outer return type.
 *
 * **Example** (Chunking an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
 * ```
 *
 * @see {@link split} — split into a given number of groups
 * @see {@link window} — sliding windows
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const chunksOf: {
    /**
     * Splits an iterable into chunks of length `n`. The last chunk may be shorter
     * if `n` does not evenly divide the length.
     *
     * - `chunksOf(n)([])` is `[]`, not `[[]]`.
     * - Each chunk is a `NonEmptyArray`.
     * - Preserves `NonEmptyArray` in the outer return type.
     *
     * **Example** (Chunking an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
     * ```
     *
     * @see {@link split} — split into a given number of groups
     * @see {@link window} — sliding windows
     *
     * @category splitting
     * @since 2.0.0
     */
    (n: number): <S extends Iterable<any>>(self: S) => ReadonlyArray.With<S, NonEmptyArray<ReadonlyArray.Infer<S>>>;
    /**
     * Splits an iterable into chunks of length `n`. The last chunk may be shorter
     * if `n` does not evenly divide the length.
     *
     * - `chunksOf(n)([])` is `[]`, not `[[]]`.
     * - Each chunk is a `NonEmptyArray`.
     * - Preserves `NonEmptyArray` in the outer return type.
     *
     * **Example** (Chunking an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
     * ```
     *
     * @see {@link split} — split into a given number of groups
     * @see {@link window} — sliding windows
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, n: number): NonEmptyArray<NonEmptyArray<A>>;
    /**
     * Splits an iterable into chunks of length `n`. The last chunk may be shorter
     * if `n` does not evenly divide the length.
     *
     * - `chunksOf(n)([])` is `[]`, not `[[]]`.
     * - Each chunk is a `NonEmptyArray`.
     * - Preserves `NonEmptyArray` in the outer return type.
     *
     * **Example** (Chunking an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.chunksOf([1, 2, 3, 4, 5], 2)) // [[1, 2], [3, 4], [5]]
     * ```
     *
     * @see {@link split} — split into a given number of groups
     * @see {@link window} — sliding windows
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, n: number): Array<NonEmptyArray<A>>;
};
/**
 * Creates overlapping sliding windows of size `n`.
 *
 * - Returns an empty array if `n <= 0` or the array has fewer than `n` elements.
 * - Each window is a tuple of exactly `n` elements.
 *
 * **Example** (Sliding windows)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.window([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 * console.log(Array.window([1, 2, 3, 4, 5], 6)) // []
 * ```
 *
 * @see {@link chunksOf} — non-overlapping chunks
 *
 * @category splitting
 * @since 3.13.2
 */
export declare const window: {
    /**
     * Creates overlapping sliding windows of size `n`.
     *
     * - Returns an empty array if `n <= 0` or the array has fewer than `n` elements.
     * - Each window is a tuple of exactly `n` elements.
     *
     * **Example** (Sliding windows)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.window([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
     * console.log(Array.window([1, 2, 3, 4, 5], 6)) // []
     * ```
     *
     * @see {@link chunksOf} — non-overlapping chunks
     *
     * @category splitting
     * @since 3.13.2
     */
    <N extends number>(n: N): <A>(self: Iterable<A>) => Array<TupleOf<N, A>>;
    /**
     * Creates overlapping sliding windows of size `n`.
     *
     * - Returns an empty array if `n <= 0` or the array has fewer than `n` elements.
     * - Each window is a tuple of exactly `n` elements.
     *
     * **Example** (Sliding windows)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.window([1, 2, 3, 4, 5], 3)) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
     * console.log(Array.window([1, 2, 3, 4, 5], 6)) // []
     * ```
     *
     * @see {@link chunksOf} — non-overlapping chunks
     *
     * @category splitting
     * @since 3.13.2
     */
    <A, N extends number>(self: Iterable<A>, n: N): Array<TupleOf<N, A>>;
};
/**
 * Groups consecutive equal elements using a custom equivalence function.
 *
 * - Only groups **adjacent** elements — non-adjacent duplicates stay separate.
 * - Requires a `NonEmptyReadonlyArray`.
 *
 * **Example** (Grouping consecutive equal elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.groupWith(["a", "a", "b", "b", "b", "c", "a"], (x, y) => x === y))
 * // [["a", "a"], ["b", "b", "b"], ["c"], ["a"]]
 * ```
 *
 * @see {@link group} — uses default equality
 * @see {@link groupBy} — group by a key function into a record
 *
 * @category grouping
 * @since 2.0.0
 */
export declare const groupWith: {
    /**
     * Groups consecutive equal elements using a custom equivalence function.
     *
     * - Only groups **adjacent** elements — non-adjacent duplicates stay separate.
     * - Requires a `NonEmptyReadonlyArray`.
     *
     * **Example** (Grouping consecutive equal elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.groupWith(["a", "a", "b", "b", "b", "c", "a"], (x, y) => x === y))
     * // [["a", "a"], ["b", "b", "b"], ["c"], ["a"]]
     * ```
     *
     * @see {@link group} — uses default equality
     * @see {@link groupBy} — group by a key function into a record
     *
     * @category grouping
     * @since 2.0.0
     */
    <A>(isEquivalent: (self: A, that: A) => boolean): (self: NonEmptyReadonlyArray<A>) => NonEmptyArray<NonEmptyArray<A>>;
    /**
     * Groups consecutive equal elements using a custom equivalence function.
     *
     * - Only groups **adjacent** elements — non-adjacent duplicates stay separate.
     * - Requires a `NonEmptyReadonlyArray`.
     *
     * **Example** (Grouping consecutive equal elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.groupWith(["a", "a", "b", "b", "b", "c", "a"], (x, y) => x === y))
     * // [["a", "a"], ["b", "b", "b"], ["c"], ["a"]]
     * ```
     *
     * @see {@link group} — uses default equality
     * @see {@link groupBy} — group by a key function into a record
     *
     * @category grouping
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, isEquivalent: (self: A, that: A) => boolean): NonEmptyArray<NonEmptyArray<A>>;
};
/**
 * Groups consecutive equal elements using `Equal.equivalence()`.
 *
 * - Only groups **adjacent** elements.
 *
 * **Example** (Grouping adjacent equal elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.group([1, 1, 2, 2, 2, 3, 1])) // [[1, 1], [2, 2, 2], [3], [1]]
 * ```
 *
 * @see {@link groupWith} — use custom equality
 * @see {@link groupBy} — group by a key function into a record
 *
 * @category grouping
 * @since 2.0.0
 */
export declare const group: <A>(self: NonEmptyReadonlyArray<A>) => NonEmptyArray<NonEmptyArray<A>>;
/**
 * Groups elements into a record by a key-returning function. Each key maps
 * to a `NonEmptyArray` of elements that produced that key.
 *
 * - Unlike {@link group}/{@link groupWith}, elements do not need to be
 *   adjacent to be grouped together.
 * - Key function must return a `string` or `symbol`.
 *
 * **Example** (Grouping by a property)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const people = [
 *   { name: "Alice", group: "A" },
 *   { name: "Bob", group: "B" },
 *   { name: "Charlie", group: "A" }
 * ]
 *
 * const result = Array.groupBy(people, (person) => person.group)
 * console.log(result)
 * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
 * ```
 *
 * @see {@link group} — group adjacent equal elements
 * @see {@link groupWith} — group adjacent elements by custom equality
 *
 * @category grouping
 * @since 2.0.0
 */
export declare const groupBy: {
    /**
     * Groups elements into a record by a key-returning function. Each key maps
     * to a `NonEmptyArray` of elements that produced that key.
     *
     * - Unlike {@link group}/{@link groupWith}, elements do not need to be
     *   adjacent to be grouped together.
     * - Key function must return a `string` or `symbol`.
     *
     * **Example** (Grouping by a property)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const people = [
     *   { name: "Alice", group: "A" },
     *   { name: "Bob", group: "B" },
     *   { name: "Charlie", group: "A" }
     * ]
     *
     * const result = Array.groupBy(people, (person) => person.group)
     * console.log(result)
     * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
     * ```
     *
     * @see {@link group} — group adjacent equal elements
     * @see {@link groupWith} — group adjacent elements by custom equality
     *
     * @category grouping
     * @since 2.0.0
     */
    <A, K extends string | symbol>(f: (a: A) => K): (self: Iterable<A>) => Record<Record.ReadonlyRecord.NonLiteralKey<K>, NonEmptyArray<A>>;
    /**
     * Groups elements into a record by a key-returning function. Each key maps
     * to a `NonEmptyArray` of elements that produced that key.
     *
     * - Unlike {@link group}/{@link groupWith}, elements do not need to be
     *   adjacent to be grouped together.
     * - Key function must return a `string` or `symbol`.
     *
     * **Example** (Grouping by a property)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const people = [
     *   { name: "Alice", group: "A" },
     *   { name: "Bob", group: "B" },
     *   { name: "Charlie", group: "A" }
     * ]
     *
     * const result = Array.groupBy(people, (person) => person.group)
     * console.log(result)
     * // { A: [{ name: "Alice", group: "A" }, { name: "Charlie", group: "A" }], B: [{ name: "Bob", group: "B" }] }
     * ```
     *
     * @see {@link group} — group adjacent equal elements
     * @see {@link groupWith} — group adjacent elements by custom equality
     *
     * @category grouping
     * @since 2.0.0
     */
    <A, K extends string | symbol>(self: Iterable<A>, f: (a: A) => K): Record<Record.ReadonlyRecord.NonLiteralKey<K>, NonEmptyArray<A>>;
};
/**
 * Computes the union of two arrays using a custom equivalence, removing
 * duplicates.
 *
 * **Example** (Union with custom equality)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
 * ```
 *
 * @see {@link union} — uses default equality
 * @see {@link intersection} — elements in both arrays
 * @see {@link difference} — elements only in the first array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const unionWith: {
    /**
     * Computes the union of two arrays using a custom equivalence, removing
     * duplicates.
     *
     * **Example** (Union with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link union} — uses default equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <S extends Iterable<any>, T extends Iterable<any>>(that: T, isEquivalent: (self: ReadonlyArray.Infer<S>, that: ReadonlyArray.Infer<T>) => boolean): (self: S) => ReadonlyArray.OrNonEmpty<S, T, ReadonlyArray.Infer<S> | ReadonlyArray.Infer<T>>;
    /**
     * Computes the union of two arrays using a custom equivalence, removing
     * duplicates.
     *
     * **Example** (Union with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link union} — uses default equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, that: Iterable<B>, isEquivalent: (self: A, that: B) => boolean): NonEmptyArray<A | B>;
    /**
     * Computes the union of two arrays using a custom equivalence, removing
     * duplicates.
     *
     * **Example** (Union with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link union} — uses default equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: NonEmptyReadonlyArray<B>, isEquivalent: (self: A, that: B) => boolean): NonEmptyArray<A | B>;
    /**
     * Computes the union of two arrays using a custom equivalence, removing
     * duplicates.
     *
     * **Example** (Union with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.unionWith([1, 2], [2, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link union} — uses default equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>, isEquivalent: (self: A, that: B) => boolean): Array<A | B>;
};
/**
 * Computes the union of two arrays, removing duplicates using
 * `Equal.equivalence()`.
 *
 * **Example** (Array union)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
 * ```
 *
 * @see {@link unionWith} — use custom equality
 * @see {@link intersection} — elements in both arrays
 * @see {@link difference} — elements only in the first array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const union: {
    /**
     * Computes the union of two arrays, removing duplicates using
     * `Equal.equivalence()`.
     *
     * **Example** (Array union)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
     * ```
     *
     * @see {@link unionWith} — use custom equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <T extends Iterable<any>>(that: T): <S extends Iterable<any>>(self: S) => ReadonlyArray.OrNonEmpty<S, T, ReadonlyArray.Infer<S> | ReadonlyArray.Infer<T>>;
    /**
     * Computes the union of two arrays, removing duplicates using
     * `Equal.equivalence()`.
     *
     * **Example** (Array union)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
     * ```
     *
     * @see {@link unionWith} — use custom equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, that: ReadonlyArray<B>): NonEmptyArray<A | B>;
    /**
     * Computes the union of two arrays, removing duplicates using
     * `Equal.equivalence()`.
     *
     * **Example** (Array union)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
     * ```
     *
     * @see {@link unionWith} — use custom equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: ReadonlyArray<A>, that: NonEmptyReadonlyArray<B>): NonEmptyArray<A | B>;
    /**
     * Computes the union of two arrays, removing duplicates using
     * `Equal.equivalence()`.
     *
     * **Example** (Array union)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.union([1, 2], [2, 3])) // [1, 2, 3]
     * ```
     *
     * @see {@link unionWith} — use custom equality
     * @see {@link intersection} — elements in both arrays
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>): Array<A | B>;
};
/**
 * Computes the intersection of two arrays using a custom equivalence. Order is
 * determined by the first array.
 *
 * **Example** (Intersection with custom equality)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const array1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
 * const array2 = [{ id: 3 }, { id: 4 }, { id: 1 }]
 * const isEquivalent = (a: { id: number }, b: { id: number }) => a.id === b.id
 * console.log(Array.intersectionWith(isEquivalent)(array2)(array1)) // [{ id: 1 }, { id: 3 }]
 * ```
 *
 * @see {@link intersection} — uses default equality
 * @see {@link union} — elements in either array
 * @see {@link difference} — elements only in the first array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const intersectionWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
    (that: Iterable<A>): (self: Iterable<A>) => Array<A>;
    (self: Iterable<A>, that: Iterable<A>): Array<A>;
};
/**
 * Computes the intersection of two arrays using `Equal.equivalence()`. Order is
 * determined by the first array.
 *
 * **Example** (Array intersection)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.intersection([1, 2, 3], [3, 4, 1])) // [1, 3]
 * ```
 *
 * @see {@link intersectionWith} — use custom equality
 * @see {@link union} — elements in either array
 * @see {@link difference} — elements only in the first array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const intersection: {
    /**
     * Computes the intersection of two arrays using `Equal.equivalence()`. Order is
     * determined by the first array.
     *
     * **Example** (Array intersection)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.intersection([1, 2, 3], [3, 4, 1])) // [1, 3]
     * ```
     *
     * @see {@link intersectionWith} — use custom equality
     * @see {@link union} — elements in either array
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(that: Iterable<B>): <A>(self: Iterable<A>) => Array<A & B>;
    /**
     * Computes the intersection of two arrays using `Equal.equivalence()`. Order is
     * determined by the first array.
     *
     * **Example** (Array intersection)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.intersection([1, 2, 3], [3, 4, 1])) // [1, 3]
     * ```
     *
     * @see {@link intersectionWith} — use custom equality
     * @see {@link union} — elements in either array
     * @see {@link difference} — elements only in the first array
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, that: Iterable<B>): Array<A & B>;
};
/**
 * Computes elements in the first array that are not in the second, using a
 * custom equivalence.
 *
 * **Example** (Difference with custom equality)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const diff = Array.differenceWith<number>((a, b) => a === b)([1, 2, 3], [2, 3, 4])
 * console.log(diff) // [1]
 * ```
 *
 * @see {@link difference} — uses default equality
 * @see {@link union} — elements in either array
 * @see {@link intersection} — elements in both arrays
 *
 * @category elements
 * @since 2.0.0
 */
export declare const differenceWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
    (that: Iterable<A>): (self: Iterable<A>) => Array<A>;
    (self: Iterable<A>, that: Iterable<A>): Array<A>;
};
/**
 * Computes elements in the first array that are not in the second, using
 * `Equal.equivalence()`.
 *
 * **Example** (Array difference)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.difference([1, 2, 3], [2, 3, 4])) // [1]
 * ```
 *
 * @see {@link differenceWith} — use custom equality
 * @see {@link union} — elements in either array
 * @see {@link intersection} — elements in both arrays
 *
 * @category elements
 * @since 2.0.0
 */
export declare const difference: {
    /**
     * Computes elements in the first array that are not in the second, using
     * `Equal.equivalence()`.
     *
     * **Example** (Array difference)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.difference([1, 2, 3], [2, 3, 4])) // [1]
     * ```
     *
     * @see {@link differenceWith} — use custom equality
     * @see {@link union} — elements in either array
     * @see {@link intersection} — elements in both arrays
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(that: Iterable<A>): (self: Iterable<A>) => Array<A>;
    /**
     * Computes elements in the first array that are not in the second, using
     * `Equal.equivalence()`.
     *
     * **Example** (Array difference)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.difference([1, 2, 3], [2, 3, 4])) // [1]
     * ```
     *
     * @see {@link differenceWith} — use custom equality
     * @see {@link union} — elements in either array
     * @see {@link intersection} — elements in both arrays
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, that: Iterable<A>): Array<A>;
};
/**
 * Creates an empty array.
 *
 * **Example** (Creating an empty array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.empty<number>()
 * console.log(result) // []
 * ```
 *
 * @see {@link of} — create a single-element array
 * @see {@link make} — create from multiple values
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const empty: <A = never>() => Array<A>;
/**
 * Wraps a single value in a `NonEmptyArray`.
 *
 * **Example** (Creating a single-element array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.of(1)) // [1]
 * ```
 *
 * @see {@link make} — create from multiple values
 * @see {@link empty} — create an empty array
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const of: <A>(a: A) => NonEmptyArray<A>;
/**
 * Utility types for working with `ReadonlyArray` at the type level. Use these
 * to infer element types, preserve non-emptiness, and flatten nested arrays.
 *
 * @category types
 * @since 2.0.0
 */
export declare namespace ReadonlyArray {
    /**
     * Infers the element type of an iterable.
     *
     * @example
     * ```ts
     * import type { Array } from "effect"
     *
     * type StringArrayType = Array.ReadonlyArray.Infer<ReadonlyArray<string>>
     * // StringArrayType is string
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type Infer<S extends Iterable<any>> = S extends ReadonlyArray<infer A> ? A : S extends Iterable<infer A> ? A : never;
    /**
     * Constructs an array type preserving non-emptiness.
     *
     * @example
     * ```ts
     * import type { Array } from "effect"
     *
     * type Result = Array.ReadonlyArray.With<readonly [number], string>
     * // Result is NonEmptyArray<string>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type With<S extends Iterable<any>, A> = S extends NonEmptyReadonlyArray<any> ? NonEmptyArray<A> : Array<A>;
    /**
     * Creates a non-empty array if either input is non-empty.
     *
     * @example
     * ```ts
     * import type { Array } from "effect"
     *
     * type Result = Array.ReadonlyArray.OrNonEmpty<
     *   readonly [number],
     *   ReadonlyArray<string>,
     *   number
     * >
     * // Result is NonEmptyArray<number>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type OrNonEmpty<S extends Iterable<any>, T extends Iterable<any>, A> = S extends NonEmptyReadonlyArray<any> ? NonEmptyArray<A> : T extends NonEmptyReadonlyArray<any> ? NonEmptyArray<A> : Array<A>;
    /**
     * Creates a non-empty array only if both inputs are non-empty.
     *
     * @example
     * ```ts
     * import type { Array } from "effect"
     *
     * type Result = Array.ReadonlyArray.AndNonEmpty<
     *   readonly [number],
     *   readonly [string],
     *   boolean
     * >
     * // Result is NonEmptyArray<boolean>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type AndNonEmpty<S extends Iterable<any>, T extends Iterable<any>, A> = S extends NonEmptyReadonlyArray<any> ? T extends NonEmptyReadonlyArray<any> ? NonEmptyArray<A> : Array<A> : Array<A>;
    /**
     * Flattens a nested array type.
     *
     * @example
     * ```ts
     * import type { Array } from "effect"
     *
     * type Nested = ReadonlyArray<ReadonlyArray<number>>
     * type Flattened = Array.ReadonlyArray.Flatten<Nested>
     * // Flattened is Array<number>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type Flatten<T extends ReadonlyArray<ReadonlyArray<any>>> = T extends NonEmptyReadonlyArray<NonEmptyReadonlyArray<any>> ? NonEmptyArray<T[number][number]> : Array<T[number][number]>;
}
/**
 * Transforms each element using a function, returning a new array.
 *
 * - The function receives `(element, index)`.
 * - Preserves `NonEmptyArray` in the return type.
 *
 * **Example** (Doubling values)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]
 * ```
 *
 * @see {@link flatMap} — map and flatten
 *
 * @category mapping
 * @since 2.0.0
 */
export declare const map: {
    /**
     * Transforms each element using a function, returning a new array.
     *
     * - The function receives `(element, index)`.
     * - Preserves `NonEmptyArray` in the return type.
     *
     * **Example** (Doubling values)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]
     * ```
     *
     * @see {@link flatMap} — map and flatten
     *
     * @category mapping
     * @since 2.0.0
     */
    <S extends ReadonlyArray<any>, B>(f: (a: ReadonlyArray.Infer<S>, i: number) => B): (self: S) => ReadonlyArray.With<S, B>;
    /**
     * Transforms each element using a function, returning a new array.
     *
     * - The function receives `(element, index)`.
     * - Preserves `NonEmptyArray` in the return type.
     *
     * **Example** (Doubling values)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.map([1, 2, 3], (x) => x * 2)) // [2, 4, 6]
     * ```
     *
     * @see {@link flatMap} — map and flatten
     *
     * @category mapping
     * @since 2.0.0
     */
    <S extends ReadonlyArray<any>, B>(self: S, f: (a: ReadonlyArray.Infer<S>, i: number) => B): ReadonlyArray.With<S, B>;
};
/**
 * Maps each element to an array and flattens the results into a single array.
 *
 * - The function receives `(element, index)`.
 * - Returns `NonEmptyArray` when both input and mapped arrays are non-empty.
 *
 * **Example** (FlatMapping an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]
 * ```
 *
 * @see {@link map} — transform without flattening
 * @see {@link flatten} — flatten without mapping
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const flatMap: {
    /**
     * Maps each element to an array and flattens the results into a single array.
     *
     * - The function receives `(element, index)`.
     * - Returns `NonEmptyArray` when both input and mapped arrays are non-empty.
     *
     * **Example** (FlatMapping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]
     * ```
     *
     * @see {@link map} — transform without flattening
     * @see {@link flatten} — flatten without mapping
     *
     * @category sequencing
     * @since 2.0.0
     */
    <S extends ReadonlyArray<any>, T extends ReadonlyArray<any>>(f: (a: ReadonlyArray.Infer<S>, i: number) => T): (self: S) => ReadonlyArray.AndNonEmpty<S, T, ReadonlyArray.Infer<T>>;
    /**
     * Maps each element to an array and flattens the results into a single array.
     *
     * - The function receives `(element, index)`.
     * - Returns `NonEmptyArray` when both input and mapped arrays are non-empty.
     *
     * **Example** (FlatMapping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]
     * ```
     *
     * @see {@link map} — transform without flattening
     * @see {@link flatten} — flatten without mapping
     *
     * @category sequencing
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyReadonlyArray<A>, f: (a: A, i: number) => NonEmptyReadonlyArray<B>): NonEmptyArray<B>;
    /**
     * Maps each element to an array and flattens the results into a single array.
     *
     * - The function receives `(element, index)`.
     * - Returns `NonEmptyArray` when both input and mapped arrays are non-empty.
     *
     * **Example** (FlatMapping an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.flatMap([1, 2, 3], (x) => [x, x * 2])) // [1, 2, 2, 4, 3, 6]
     * ```
     *
     * @see {@link map} — transform without flattening
     * @see {@link flatten} — flatten without mapping
     *
     * @category sequencing
     * @since 2.0.0
     */
    <A, B>(self: ReadonlyArray<A>, f: (a: A, i: number) => ReadonlyArray<B>): Array<B>;
};
/**
 * Flattens a nested array of arrays into a single array.
 *
 * **Example** (Flattening nested arrays)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.flatten([[1, 2], [], [3, 4], [], [5, 6]])) // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @see {@link flatMap} — map then flatten in one step
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const flatten: <const S extends ReadonlyArray<ReadonlyArray<any>>>(self: S) => ReadonlyArray.Flatten<S>;
/**
 * Extracts all `Some` values from an iterable of `Option`s, discarding `None`s.
 *
 * **Example** (Extracting Some values)
 *
 * ```ts
 * import { Array, Option } from "effect"
 *
 * console.log(Array.getSomes([Option.some(1), Option.none(), Option.some(2)])) // [1, 2]
 * ```
 *
 * @see {@link fromOption} — convert a single Option
 * @see {@link getSuccesses} — extract successes from Results
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const getSomes: <T extends Iterable<Option.Option<X>>, X = any>(self: T) => Array<Option.Option.Value<ReadonlyArray.Infer<T>>>;
/**
 * Extracts all failure values from an iterable of `Result`s, discarding
 * successes.
 *
 * **Example** (Extracting failures)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * console.log(Array.getFailures([Result.succeed(1), Result.fail("err"), Result.succeed(2)]))
 * // ["err"]
 * ```
 *
 * @see {@link getSuccesses} — extract success values
 * @see {@link separate} — split into failures and successes
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const getFailures: <T extends Iterable<Result.Result<any, any>>>(self: T) => Array<Result.Result.Failure<ReadonlyArray.Infer<T>>>;
/**
 * Extracts all success values from an iterable of `Result`s, discarding
 * failures.
 *
 * **Example** (Extracting successes)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * console.log(Array.getSuccesses([Result.succeed(1), Result.fail("err"), Result.succeed(2)]))
 * // [1, 2]
 * ```
 *
 * @see {@link getFailures} — extract failure values
 * @see {@link separate} — split into failures and successes
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const getSuccesses: <T extends Iterable<Result.Result<any, any>>>(self: T) => Array<Result.Result.Success<ReadonlyArray.Infer<T>>>;
/**
 * Keeps transformed values for elements where a `Filter` succeeds.
 *
 * - The filter receives `(element, index)`.
 * - Failures are discarded.
 *
 * **Example** (Filter and transform)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * console.log(Array.filterMap([1, 2, 3, 4], (n) => n % 2 === 0 ? Result.succeed(n * 10) : Result.failVoid))
 * // [20, 40]
 * ```
 *
 * @see {@link filter} — keep original elements matching a predicate
 *
 * @category filtering
 * @since 4.0.0
 */
export declare const filterMap: {
    /**
     * Keeps transformed values for elements where a `Filter` succeeds.
     *
     * - The filter receives `(element, index)`.
     * - Failures are discarded.
     *
     * **Example** (Filter and transform)
     *
     * ```ts
     * import { Array, Result } from "effect"
     *
     * console.log(Array.filterMap([1, 2, 3, 4], (n) => n % 2 === 0 ? Result.succeed(n * 10) : Result.failVoid))
     * // [20, 40]
     * ```
     *
     * @see {@link filter} — keep original elements matching a predicate
     *
     * @category filtering
     * @since 4.0.0
     */
    <A, B, X>(f: (input: NoInfer<A>, i: number) => Result.Result<B, X>): (self: Iterable<A>) => Array<B>;
    /**
     * Keeps transformed values for elements where a `Filter` succeeds.
     *
     * - The filter receives `(element, index)`.
     * - Failures are discarded.
     *
     * **Example** (Filter and transform)
     *
     * ```ts
     * import { Array, Result } from "effect"
     *
     * console.log(Array.filterMap([1, 2, 3, 4], (n) => n % 2 === 0 ? Result.succeed(n * 10) : Result.failVoid))
     * // [20, 40]
     * ```
     *
     * @see {@link filter} — keep original elements matching a predicate
     *
     * @category filtering
     * @since 4.0.0
     */
    <A, B, X>(self: Iterable<A>, f: (input: A, i: number) => Result.Result<B, X>): Array<B>;
};
/**
 * Keeps only elements satisfying a predicate (or refinement).
 *
 * - The predicate receives `(element, index)`.
 * - Supports refinements for type narrowing.
 *
 * **Example** (Filtering even numbers)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
 * ```
 *
 * @see {@link partition} — split into matching and non-matching
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const filter: {
    /**
     * Keeps only elements satisfying a predicate (or refinement).
     *
     * - The predicate receives `(element, index)`.
     * - Supports refinements for type narrowing.
     *
     * **Example** (Filtering even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
     * ```
     *
     * @see {@link partition} — split into matching and non-matching
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: Iterable<A>) => Array<B>;
    /**
     * Keeps only elements satisfying a predicate (or refinement).
     *
     * - The predicate receives `(element, index)`.
     * - Supports refinements for type narrowing.
     *
     * **Example** (Filtering even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
     * ```
     *
     * @see {@link partition} — split into matching and non-matching
     *
     * @category filtering
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => Array<A>;
    /**
     * Keeps only elements satisfying a predicate (or refinement).
     *
     * - The predicate receives `(element, index)`.
     * - Supports refinements for type narrowing.
     *
     * **Example** (Filtering even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
     * ```
     *
     * @see {@link partition} — split into matching and non-matching
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, B extends A>(self: Iterable<A>, refinement: (a: A, i: number) => a is B): Array<B>;
    /**
     * Keeps only elements satisfying a predicate (or refinement).
     *
     * - The predicate receives `(element, index)`.
     * - Supports refinements for type narrowing.
     *
     * **Example** (Filtering even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.filter([1, 2, 3, 4], (x) => x % 2 === 0)) // [2, 4]
     * ```
     *
     * @see {@link partition} — split into matching and non-matching
     *
     * @category filtering
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): Array<A>;
};
/**
 * Splits an iterable using a `Filter` into failures and successes.
 *
 * - Returns `[excluded, satisfying]`.
 * - The filter receives `(element, index)`.
 *
 * **Example** (Partitioning with a filter)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * console.log(Array.partition([1, -2, 3], (n, i) =>
 *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
 * ))
 * // [["negative:-2"], [1, 5]]
 * ```
 *
 * @see {@link filter} — keep only matching elements
 * @see {@link partitionMap} — partition using a Result-returning function
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const partition: {
    /**
     * Splits an iterable using a `Filter` into failures and successes.
     *
     * - Returns `[excluded, satisfying]`.
     * - The filter receives `(element, index)`.
     *
     * **Example** (Partitioning with a filter)
     *
     * ```ts
     * import { Array, Result } from "effect"
     *
     * console.log(Array.partition([1, -2, 3], (n, i) =>
     *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
     * ))
     * // [["negative:-2"], [1, 5]]
     * ```
     *
     * @see {@link filter} — keep only matching elements
     * @see {@link partitionMap} — partition using a Result-returning function
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, Pass, Fail>(f: (input: NoInfer<A>, i: number) => Result.Result<Pass, Fail>): (self: Iterable<A>) => [excluded: Array<Fail>, satisfying: Array<Pass>];
    /**
     * Splits an iterable using a `Filter` into failures and successes.
     *
     * - Returns `[excluded, satisfying]`.
     * - The filter receives `(element, index)`.
     *
     * **Example** (Partitioning with a filter)
     *
     * ```ts
     * import { Array, Result } from "effect"
     *
     * console.log(Array.partition([1, -2, 3], (n, i) =>
     *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
     * ))
     * // [["negative:-2"], [1, 5]]
     * ```
     *
     * @see {@link filter} — keep only matching elements
     * @see {@link partitionMap} — partition using a Result-returning function
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, Pass, Fail>(self: Iterable<A>, f: (input: A, i: number) => Result.Result<Pass, Fail>): [excluded: Array<Fail>, satisfying: Array<Pass>];
};
/**
 * Separates an iterable of `Result`s into two arrays: failures and successes.
 *
 * - Equivalent to `partitionMap(identity)`.
 *
 * **Example** (Separating Results)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const [failures, successes] = Array.separate([
 *   Result.succeed(1), Result.fail("error"), Result.succeed(2)
 * ])
 * console.log(failures) // ["error"]
 * console.log(successes) // [1, 2]
 * ```
 *
 * @see {@link getFailures} — extract only failures
 * @see {@link getSuccesses} — extract only successes
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const separate: <T extends Iterable<Result.Result<any, any>>>(self: T) => [
    failures: Array<Result.Result.Failure<ReadonlyArray.Infer<T>>>,
    successes: Array<Result.Result.Success<ReadonlyArray.Infer<T>>>
];
/**
 * Folds an iterable from left to right into a single value.
 *
 * - The function receives `(accumulator, element, index)`.
 *
 * **Example** (Summing an array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reduce([1, 2, 3], 0, (acc, n) => acc + n)) // 6
 * ```
 *
 * @see {@link reduceRight} — fold from right to left
 * @see {@link scan} — fold keeping intermediate values
 *
 * @category folding
 * @since 2.0.0
 */
export declare const reduce: {
    /**
     * Folds an iterable from left to right into a single value.
     *
     * - The function receives `(accumulator, element, index)`.
     *
     * **Example** (Summing an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.reduce([1, 2, 3], 0, (acc, n) => acc + n)) // 6
     * ```
     *
     * @see {@link reduceRight} — fold from right to left
     * @see {@link scan} — fold keeping intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A, i: number) => B): (self: Iterable<A>) => B;
    /**
     * Folds an iterable from left to right into a single value.
     *
     * - The function receives `(accumulator, element, index)`.
     *
     * **Example** (Summing an array)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.reduce([1, 2, 3], 0, (acc, n) => acc + n)) // 6
     * ```
     *
     * @see {@link reduceRight} — fold from right to left
     * @see {@link scan} — fold keeping intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, b: B, f: (b: B, a: A, i: number) => B): B;
};
/**
 * Folds an iterable from right to left into a single value.
 *
 * - The function receives `(accumulator, element, index)`.
 *
 * **Example** (Right-to-left fold)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)) // 6
 * ```
 *
 * @see {@link reduce} — fold from left to right
 * @see {@link scanRight} — fold keeping intermediate values
 *
 * @category folding
 * @since 2.0.0
 */
export declare const reduceRight: {
    /**
     * Folds an iterable from right to left into a single value.
     *
     * - The function receives `(accumulator, element, index)`.
     *
     * **Example** (Right-to-left fold)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)) // 6
     * ```
     *
     * @see {@link reduce} — fold from left to right
     * @see {@link scanRight} — fold keeping intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A, i: number) => B): (self: Iterable<A>) => B;
    /**
     * Folds an iterable from right to left into a single value.
     *
     * - The function receives `(accumulator, element, index)`.
     *
     * **Example** (Right-to-left fold)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.reduceRight([1, 2, 3], 0, (acc, n) => acc + n)) // 6
     * ```
     *
     * @see {@link reduce} — fold from left to right
     * @see {@link scanRight} — fold keeping intermediate values
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Iterable<A>, b: B, f: (b: B, a: A, i: number) => B): B;
};
/**
 * Lifts a predicate into an array: returns `[value]` if the predicate holds,
 * `[]` otherwise.
 *
 * **Example** (Conditional wrapping)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const isEven = (n: number) => n % 2 === 0
 * const to = Array.liftPredicate(isEven)
 * console.log(to(1)) // []
 * console.log(to(2)) // [2]
 * ```
 *
 * @see {@link liftOption} — lift an Option-returning function
 *
 * @category lifting
 * @since 2.0.0
 */
export declare const liftPredicate: {
    <A, B extends A>(refinement: Predicate.Refinement<A, B>): (a: A) => Array<B>;
    /**
     * Lifts a predicate into an array: returns `[value]` if the predicate holds,
     * `[]` otherwise.
     *
     * **Example** (Conditional wrapping)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const isEven = (n: number) => n % 2 === 0
     * const to = Array.liftPredicate(isEven)
     * console.log(to(1)) // []
     * console.log(to(2)) // [2]
     * ```
     *
     * @see {@link liftOption} — lift an Option-returning function
     *
     * @category lifting
     * @since 2.0.0
     */
    <A>(predicate: Predicate.Predicate<A>): <B extends A>(b: B) => Array<B>;
};
/**
 * Lifts an `Option`-returning function into one that returns an array:
 * `Some(a)` becomes `[a]`, `None` becomes `[]`.
 *
 * **Example** (Lifting an Option function)
 *
 * ```ts
 * import { Array, Option } from "effect"
 *
 * const parseNumber = Array.liftOption((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? Option.none() : Option.some(n)
 * })
 * console.log(parseNumber("123")) // [123]
 * console.log(parseNumber("abc")) // []
 * ```
 *
 * @see {@link liftPredicate} — lift a boolean predicate
 * @see {@link liftResult} — lift a Result-returning function
 *
 * @category lifting
 * @since 2.0.0
 */
export declare const liftOption: <A extends Array<unknown>, B>(f: (...a: A) => Option.Option<B>) => (...a: A) => Array<B>;
/**
 * Converts a nullable value to an array: `null`/`undefined` becomes `[]`,
 * anything else becomes `[value]`.
 *
 * **Example** (Nullable to array)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.fromNullishOr(1)) // [1]
 * console.log(Array.fromNullishOr(null)) // []
 * console.log(Array.fromNullishOr(undefined)) // []
 * ```
 *
 * @see {@link liftNullishOr} — lift a nullable-returning function
 * @see {@link fromOption} — convert from Option
 *
 * @category conversions
 * @since 2.0.0
 */
export declare const fromNullishOr: <A>(a: A) => Array<NonNullable<A>>;
/**
 * Lifts a nullable-returning function into one that returns an array:
 * `null`/`undefined` becomes `[]`, anything else becomes `[value]`.
 *
 * **Example** (Lifting a nullable function)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const parseNumber = Array.liftNullishOr((s: string) => {
 *   const n = Number(s)
 *   return isNaN(n) ? null : n
 * })
 * console.log(parseNumber("123")) // [123]
 * console.log(parseNumber("abc")) // []
 * ```
 *
 * @see {@link fromNullishOr} — convert a single nullable value
 * @see {@link liftOption} — lift an Option-returning function
 *
 * @category lifting
 * @since 2.0.0
 */
export declare const liftNullishOr: <A extends Array<unknown>, B>(f: (...a: A) => B) => (...a: A) => Array<NonNullable<B>>;
/**
 * Maps each element with a nullable-returning function, keeping only non-null /
 * non-undefined results.
 *
 * **Example** (FlatMapping with nullable)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n)))
 * // [1, 3]
 * ```
 *
 * @category sequencing
 * @since 2.0.0
 */
export declare const flatMapNullishOr: {
    /**
     * Maps each element with a nullable-returning function, keeping only non-null /
     * non-undefined results.
     *
     * **Example** (FlatMapping with nullable)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n)))
     * // [1, 3]
     * ```
     *
     * @category sequencing
     * @since 2.0.0
     */
    <A, B>(f: (a: A) => B): (self: ReadonlyArray<A>) => Array<NonNullable<B>>;
    /**
     * Maps each element with a nullable-returning function, keeping only non-null /
     * non-undefined results.
     *
     * **Example** (FlatMapping with nullable)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.flatMapNullishOr([1, 2, 3], (n) => (n % 2 === 0 ? null : n)))
     * // [1, 3]
     * ```
     *
     * @category sequencing
     * @since 2.0.0
     */
    <A, B>(self: ReadonlyArray<A>, f: (a: A) => B): Array<NonNullable<B>>;
};
/**
 * Lifts a `Result`-returning function into one that returns an array: failures
 * produce `[]`, successes produce `[value]`.
 *
 * **Example** (Lifting a Result function)
 *
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const parseNumber = (s: string): Result.Result<number, Error> =>
 *   isNaN(Number(s))
 *     ? Result.fail(new Error("Not a number"))
 *     : Result.succeed(Number(s))
 *
 * const liftedParseNumber = Array.liftResult(parseNumber)
 * console.log(liftedParseNumber("42")) // [42]
 * console.log(liftedParseNumber("not a number")) // []
 * ```
 *
 * @see {@link liftOption} — lift an Option-returning function
 * @see {@link liftPredicate} — lift a boolean predicate
 *
 * @category lifting
 * @since 2.0.0
 */
export declare const liftResult: <A extends Array<unknown>, E, B>(f: (...a: A) => Result.Result<B, E>) => (...a: A) => Array<B>;
/**
 * Tests whether all elements satisfy the predicate. Supports refinements for
 * type narrowing.
 *
 * **Example** (Testing all elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
 * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
 * ```
 *
 * @see {@link some} — test if any element matches
 *
 * @category elements
 * @since 2.0.0
 */
export declare const every: {
    /**
     * Tests whether all elements satisfy the predicate. Supports refinements for
     * type narrowing.
     *
     * **Example** (Testing all elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
     * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link some} — test if any element matches
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: (a: NoInfer<A>, i: number) => a is B): (self: ReadonlyArray<A>) => self is ReadonlyArray<B>;
    /**
     * Tests whether all elements satisfy the predicate. Supports refinements for
     * type narrowing.
     *
     * **Example** (Testing all elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
     * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link some} — test if any element matches
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: ReadonlyArray<A>) => boolean;
    /**
     * Tests whether all elements satisfy the predicate. Supports refinements for
     * type narrowing.
     *
     * **Example** (Testing all elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
     * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link some} — test if any element matches
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: ReadonlyArray<A>, refinement: (a: A, i: number) => a is B): self is ReadonlyArray<B>;
    /**
     * Tests whether all elements satisfy the predicate. Supports refinements for
     * type narrowing.
     *
     * **Example** (Testing all elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.every([2, 4, 6], (x) => x % 2 === 0)) // true
     * console.log(Array.every([2, 3, 6], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link some} — test if any element matches
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: ReadonlyArray<A>, predicate: (a: A, i: number) => boolean): boolean;
};
/**
 * Tests whether at least one element satisfies the predicate. Narrows the type
 * to `NonEmptyReadonlyArray` on success.
 *
 * **Example** (Testing for any match)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.some([1, 3, 4], (x) => x % 2 === 0)) // true
 * console.log(Array.some([1, 3, 5], (x) => x % 2 === 0)) // false
 * ```
 *
 * @see {@link every} — test if all elements match
 * @see {@link contains} — test for a specific value
 *
 * @category elements
 * @since 2.0.0
 */
export declare const some: {
    /**
     * Tests whether at least one element satisfies the predicate. Narrows the type
     * to `NonEmptyReadonlyArray` on success.
     *
     * **Example** (Testing for any match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.some([1, 3, 4], (x) => x % 2 === 0)) // true
     * console.log(Array.some([1, 3, 5], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link every} — test if all elements match
     * @see {@link contains} — test for a specific value
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: ReadonlyArray<A>) => self is NonEmptyReadonlyArray<A>;
    /**
     * Tests whether at least one element satisfies the predicate. Narrows the type
     * to `NonEmptyReadonlyArray` on success.
     *
     * **Example** (Testing for any match)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.some([1, 3, 4], (x) => x % 2 === 0)) // true
     * console.log(Array.some([1, 3, 5], (x) => x % 2 === 0)) // false
     * ```
     *
     * @see {@link every} — test if all elements match
     * @see {@link contains} — test for a specific value
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: ReadonlyArray<A>, predicate: (a: A, i: number) => boolean): self is NonEmptyReadonlyArray<A>;
};
/**
 * Applies a function to each suffix of the array (starting from each index),
 * collecting the results.
 *
 * - For index `i`, the function receives `self.slice(i)`.
 *
 * **Example** (Suffix lengths)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.extend([1, 2, 3], (as) => as.length)) // [3, 2, 1]
 * ```
 *
 * @category mapping
 * @since 2.0.0
 */
export declare const extend: {
    /**
     * Applies a function to each suffix of the array (starting from each index),
     * collecting the results.
     *
     * - For index `i`, the function receives `self.slice(i)`.
     *
     * **Example** (Suffix lengths)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.extend([1, 2, 3], (as) => as.length)) // [3, 2, 1]
     * ```
     *
     * @category mapping
     * @since 2.0.0
     */
    <A, B>(f: (as: ReadonlyArray<A>) => B): (self: ReadonlyArray<A>) => Array<B>;
    /**
     * Applies a function to each suffix of the array (starting from each index),
     * collecting the results.
     *
     * - For index `i`, the function receives `self.slice(i)`.
     *
     * **Example** (Suffix lengths)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.extend([1, 2, 3], (as) => as.length)) // [3, 2, 1]
     * ```
     *
     * @category mapping
     * @since 2.0.0
     */
    <A, B>(self: ReadonlyArray<A>, f: (as: ReadonlyArray<A>) => B): Array<B>;
};
/**
 * Returns the minimum element of a non-empty array according to the given
 * `Order`.
 *
 * **Example** (Finding the minimum)
 *
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.min([3, 1, 2], Order.Number)) // 1
 * ```
 *
 * @see {@link max} — find the maximum
 * @see {@link sort} — sort the entire array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const min: {
    /**
     * Returns the minimum element of a non-empty array according to the given
     * `Order`.
     *
     * **Example** (Finding the minimum)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.min([3, 1, 2], Order.Number)) // 1
     * ```
     *
     * @see {@link max} — find the maximum
     * @see {@link sort} — sort the entire array
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(O: Order.Order<A>): (self: NonEmptyReadonlyArray<A>) => A;
    /**
     * Returns the minimum element of a non-empty array according to the given
     * `Order`.
     *
     * **Example** (Finding the minimum)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.min([3, 1, 2], Order.Number)) // 1
     * ```
     *
     * @see {@link max} — find the maximum
     * @see {@link sort} — sort the entire array
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, O: Order.Order<A>): A;
};
/**
 * Returns the maximum element of a non-empty array according to the given
 * `Order`.
 *
 * **Example** (Finding the maximum)
 *
 * ```ts
 * import { Array, Order } from "effect"
 *
 * console.log(Array.max([3, 1, 2], Order.Number)) // 3
 * ```
 *
 * @see {@link min} — find the minimum
 * @see {@link sort} — sort the entire array
 *
 * @category elements
 * @since 2.0.0
 */
export declare const max: {
    /**
     * Returns the maximum element of a non-empty array according to the given
     * `Order`.
     *
     * **Example** (Finding the maximum)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.max([3, 1, 2], Order.Number)) // 3
     * ```
     *
     * @see {@link min} — find the minimum
     * @see {@link sort} — sort the entire array
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(O: Order.Order<A>): (self: NonEmptyReadonlyArray<A>) => A;
    /**
     * Returns the maximum element of a non-empty array according to the given
     * `Order`.
     *
     * **Example** (Finding the maximum)
     *
     * ```ts
     * import { Array, Order } from "effect"
     *
     * console.log(Array.max([3, 1, 2], Order.Number)) // 3
     * ```
     *
     * @see {@link min} — find the minimum
     * @see {@link sort} — sort the entire array
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, O: Order.Order<A>): A;
};
/**
 * Builds an array by repeatedly applying a function to a seed value. The
 * function returns `Option.some([element, nextSeed])` to continue, or
 * `Option.none()` to stop.
 *
 * **Example** (Generating a sequence)
 *
 * ```ts
 * import { Array, Option } from "effect"
 *
 * console.log(Array.unfold(1, (n) => n <= 5 ? Option.some([n, n + 1]) : Option.none()))
 * // [1, 2, 3, 4, 5]
 * ```
 *
 * @see {@link makeBy} — generate from index
 * @see {@link range} — generate a numeric range
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const unfold: <B, A>(b: B, f: (b: B) => Option.Option<readonly [A, B]>) => Array<A>;
/**
 * Creates an `Order` for arrays based on an element `Order`. Arrays are
 * compared element-wise; if all compared elements are equal, shorter arrays
 * come first.
 *
 * **Example** (Comparing arrays)
 *
 * ```ts
 * import { Array, Order } from "effect"
 *
 * const arrayOrder = Array.makeOrder(Order.Number)
 * console.log(arrayOrder([1, 2], [1, 3])) // -1
 * ```
 *
 * @see {@link makeEquivalence} — create an equivalence for arrays
 *
 * @category instances
 * @since 2.0.0
 */
export declare const makeOrder: <A>(O: Order.Order<A>) => Order.Order<ReadonlyArray<A>>;
/**
 * Creates an `Equivalence` for arrays based on an element `Equivalence`. Two
 * arrays are equivalent when they have the same length and all elements are
 * pairwise equivalent.
 *
 * **Example** (Comparing arrays for equality)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const eq = Array.makeEquivalence<number>((a, b) => a === b)
 * console.log(eq([1, 2, 3], [1, 2, 3])) // true
 * ```
 *
 * @see {@link makeOrder} — create an ordering for arrays
 *
 * @category instances
 * @since 2.0.0
 */
export declare const makeEquivalence: <A>(isEquivalent: Equivalence.Equivalence<A>) => Equivalence.Equivalence<ReadonlyArray<A>>;
/**
 * Runs a side-effect for each element. The callback receives `(element, index)`.
 *
 * **Example** (Iterating with side-effects)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * Array.forEach([1, 2, 3], (n) => console.log(n)) // 1, 2, 3
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const forEach: {
    /**
     * Runs a side-effect for each element. The callback receives `(element, index)`.
     *
     * **Example** (Iterating with side-effects)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * Array.forEach([1, 2, 3], (n) => console.log(n)) // 1, 2, 3
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(f: (a: A, i: number) => void): (self: Iterable<A>) => void;
    /**
     * Runs a side-effect for each element. The callback receives `(element, index)`.
     *
     * **Example** (Iterating with side-effects)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * Array.forEach([1, 2, 3], (n) => console.log(n)) // 1, 2, 3
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, f: (a: A, i: number) => void): void;
};
/**
 * Removes duplicates using a custom equivalence, preserving the order of the
 * first occurrence.
 *
 * **Example** (Deduplicating with custom equality)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
 * ```
 *
 * @see {@link dedupe} — uses default equality
 * @see {@link dedupeAdjacentWith} — only dedupes consecutive elements
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dedupeWith: {
    /**
     * Removes duplicates using a custom equivalence, preserving the order of the
     * first occurrence.
     *
     * **Example** (Deduplicating with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link dedupe} — uses default equality
     * @see {@link dedupeAdjacentWith} — only dedupes consecutive elements
     *
     * @category elements
     * @since 2.0.0
     */
    <S extends Iterable<any>>(isEquivalent: (self: ReadonlyArray.Infer<S>, that: ReadonlyArray.Infer<S>) => boolean): (self: S) => ReadonlyArray.With<S, ReadonlyArray.Infer<S>>;
    /**
     * Removes duplicates using a custom equivalence, preserving the order of the
     * first occurrence.
     *
     * **Example** (Deduplicating with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link dedupe} — uses default equality
     * @see {@link dedupeAdjacentWith} — only dedupes consecutive elements
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: NonEmptyReadonlyArray<A>, isEquivalent: (self: A, that: A) => boolean): NonEmptyArray<A>;
    /**
     * Removes duplicates using a custom equivalence, preserving the order of the
     * first occurrence.
     *
     * **Example** (Deduplicating with custom equality)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dedupeWith([1, 2, 2, 3, 3, 3], (a, b) => a === b)) // [1, 2, 3]
     * ```
     *
     * @see {@link dedupe} — uses default equality
     * @see {@link dedupeAdjacentWith} — only dedupes consecutive elements
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, isEquivalent: (self: A, that: A) => boolean): Array<A>;
};
/**
 * Removes duplicates using `Equal.equivalence()`, preserving the order of the
 * first occurrence.
 *
 * **Example** (Removing duplicates)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupe([1, 2, 1, 3, 2, 4])) // [1, 2, 3, 4]
 * ```
 *
 * @see {@link dedupeWith} — use custom equality
 * @see {@link dedupeAdjacent} — only dedupes consecutive elements
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dedupe: <S extends Iterable<any>>(self: S) => S extends NonEmptyReadonlyArray<infer A> ? NonEmptyArray<A> : S extends Iterable<infer A> ? Array<A> : never;
/**
 * Removes consecutive duplicate elements using a custom equivalence.
 *
 * - Non-adjacent duplicates are preserved.
 *
 * **Example** (Deduplicating adjacent elements)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupeAdjacentWith([1, 1, 2, 2, 3, 3], (a, b) => a === b))
 * // [1, 2, 3]
 * ```
 *
 * @see {@link dedupeAdjacent} — uses default equality
 * @see {@link dedupeWith} — dedupes all duplicates, not just adjacent
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dedupeAdjacentWith: {
    /**
     * Removes consecutive duplicate elements using a custom equivalence.
     *
     * - Non-adjacent duplicates are preserved.
     *
     * **Example** (Deduplicating adjacent elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dedupeAdjacentWith([1, 1, 2, 2, 3, 3], (a, b) => a === b))
     * // [1, 2, 3]
     * ```
     *
     * @see {@link dedupeAdjacent} — uses default equality
     * @see {@link dedupeWith} — dedupes all duplicates, not just adjacent
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(isEquivalent: (self: A, that: A) => boolean): (self: Iterable<A>) => Array<A>;
    /**
     * Removes consecutive duplicate elements using a custom equivalence.
     *
     * - Non-adjacent duplicates are preserved.
     *
     * **Example** (Deduplicating adjacent elements)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.dedupeAdjacentWith([1, 1, 2, 2, 3, 3], (a, b) => a === b))
     * // [1, 2, 3]
     * ```
     *
     * @see {@link dedupeAdjacent} — uses default equality
     * @see {@link dedupeWith} — dedupes all duplicates, not just adjacent
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Iterable<A>, isEquivalent: (self: A, that: A) => boolean): Array<A>;
};
/**
 * Removes consecutive duplicate elements using `Equal.equivalence()`.
 *
 * **Example** (Removing adjacent duplicates)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.dedupeAdjacent([1, 1, 2, 2, 3, 3])) // [1, 2, 3]
 * ```
 *
 * @see {@link dedupeAdjacentWith} — use custom equality
 * @see {@link dedupe} — remove all duplicates
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dedupeAdjacent: <A>(self: Iterable<A>) => Array<A>;
/**
 * Joins string elements with a separator.
 *
 * **Example** (Joining strings)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * console.log(Array.join(["a", "b", "c"], "-")) // "a-b-c"
 * ```
 *
 * @see {@link intersperse} — insert separator elements without joining
 *
 * @since 2.0.0
 * @category folding
 */
export declare const join: {
    /**
     * Joins string elements with a separator.
     *
     * **Example** (Joining strings)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.join(["a", "b", "c"], "-")) // "a-b-c"
     * ```
     *
     * @see {@link intersperse} — insert separator elements without joining
     *
     * @since 2.0.0
     * @category folding
     */
    (sep: string): (self: Iterable<string>) => string;
    /**
     * Joins string elements with a separator.
     *
     * **Example** (Joining strings)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * console.log(Array.join(["a", "b", "c"], "-")) // "a-b-c"
     * ```
     *
     * @see {@link intersperse} — insert separator elements without joining
     *
     * @since 2.0.0
     * @category folding
     */
    (self: Iterable<string>, sep: string): string;
};
/**
 * Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.
 *
 * - Combines `map` and `reduce` in a single pass.
 * - The callback receives the current state, element, and index, and returns `[nextState, mappedValue]`.
 * - Returns `[finalState, mappedArray]`.
 * - Dual: can be used in both data-first and data-last style.
 *
 * **Example** (Running sum alongside mapped values)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])
 * console.log(result) // [6, [1, 3, 6]]
 * ```
 *
 * @see {@link scan} — when you only need the accumulated results (not the final state)
 * @see {@link reduce} — when you only need the final accumulated value
 *
 * @since 2.0.0
 * @category folding
 */
export declare const mapAccum: {
    /**
     * Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.
     *
     * - Combines `map` and `reduce` in a single pass.
     * - The callback receives the current state, element, and index, and returns `[nextState, mappedValue]`.
     * - Returns `[finalState, mappedArray]`.
     * - Dual: can be used in both data-first and data-last style.
     *
     * **Example** (Running sum alongside mapped values)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])
     * console.log(result) // [6, [1, 3, 6]]
     * ```
     *
     * @see {@link scan} — when you only need the accumulated results (not the final state)
     * @see {@link reduce} — when you only need the final accumulated value
     *
     * @since 2.0.0
     * @category folding
     */
    <S, A, B, I extends Iterable<A> = Iterable<A>>(s: S, f: (s: S, a: ReadonlyArray.Infer<I>, i: number) => readonly [S, B]): (self: I) => [state: S, mappedArray: ReadonlyArray.With<I, B>];
    /**
     * Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.
     *
     * - Combines `map` and `reduce` in a single pass.
     * - The callback receives the current state, element, and index, and returns `[nextState, mappedValue]`.
     * - Returns `[finalState, mappedArray]`.
     * - Dual: can be used in both data-first and data-last style.
     *
     * **Example** (Running sum alongside mapped values)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])
     * console.log(result) // [6, [1, 3, 6]]
     * ```
     *
     * @see {@link scan} — when you only need the accumulated results (not the final state)
     * @see {@link reduce} — when you only need the final accumulated value
     *
     * @since 2.0.0
     * @category folding
     */
    <S, A, B, I extends Iterable<A> = Iterable<A>>(self: I, s: S, f: (s: S, a: ReadonlyArray.Infer<I>, i: number) => readonly [S, B]): [state: S, mappedArray: ReadonlyArray.With<I, B>];
};
/**
 * Computes the cartesian product of two arrays, applying a combiner to each pair.
 *
 * - Produces every combination of an element from `self` with an element from `that`.
 * - Result length is `self.length * that.length`.
 * - Order: iterates `that` for each element of `self`.
 *
 * **Example** (Combining numbers and letters)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.cartesianWith([1, 2], ["a", "b"], (a, b) => `${a}-${b}`)
 * console.log(result) // ["1-a", "1-b", "2-a", "2-b"]
 * ```
 *
 * @see {@link cartesian} — returns tuples instead of applying a combiner
 *
 * @since 2.0.0
 * @category elements
 */
export declare const cartesianWith: {
    /**
     * Computes the cartesian product of two arrays, applying a combiner to each pair.
     *
     * - Produces every combination of an element from `self` with an element from `that`.
     * - Result length is `self.length * that.length`.
     * - Order: iterates `that` for each element of `self`.
     *
     * **Example** (Combining numbers and letters)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.cartesianWith([1, 2], ["a", "b"], (a, b) => `${a}-${b}`)
     * console.log(result) // ["1-a", "1-b", "2-a", "2-b"]
     * ```
     *
     * @see {@link cartesian} — returns tuples instead of applying a combiner
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B, C>(that: ReadonlyArray<B>, f: (a: A, b: B) => C): (self: ReadonlyArray<A>) => Array<C>;
    /**
     * Computes the cartesian product of two arrays, applying a combiner to each pair.
     *
     * - Produces every combination of an element from `self` with an element from `that`.
     * - Result length is `self.length * that.length`.
     * - Order: iterates `that` for each element of `self`.
     *
     * **Example** (Combining numbers and letters)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.cartesianWith([1, 2], ["a", "b"], (a, b) => `${a}-${b}`)
     * console.log(result) // ["1-a", "1-b", "2-a", "2-b"]
     * ```
     *
     * @see {@link cartesian} — returns tuples instead of applying a combiner
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B, C>(self: ReadonlyArray<A>, that: ReadonlyArray<B>, f: (a: A, b: B) => C): Array<C>;
};
/**
 * Computes the cartesian product of two arrays, returning all pairs as tuples.
 *
 * - Produces every `[a, b]` combination of an element from `self` with an element from `that`.
 * - Result length is `self.length * that.length`.
 *
 * **Example** (All pairs of two arrays)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.cartesian([1, 2], ["a", "b"])
 * console.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]
 * ```
 *
 * @see {@link cartesianWith} — apply a combiner to each pair
 *
 * @since 2.0.0
 * @category elements
 */
export declare const cartesian: {
    /**
     * Computes the cartesian product of two arrays, returning all pairs as tuples.
     *
     * - Produces every `[a, b]` combination of an element from `self` with an element from `that`.
     * - Result length is `self.length * that.length`.
     *
     * **Example** (All pairs of two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.cartesian([1, 2], ["a", "b"])
     * console.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]
     * ```
     *
     * @see {@link cartesianWith} — apply a combiner to each pair
     *
     * @since 2.0.0
     * @category elements
     */
    <B>(that: ReadonlyArray<B>): <A>(self: ReadonlyArray<A>) => Array<[A, B]>;
    /**
     * Computes the cartesian product of two arrays, returning all pairs as tuples.
     *
     * - Produces every `[a, b]` combination of an element from `self` with an element from `that`.
     * - Result length is `self.length * that.length`.
     *
     * **Example** (All pairs of two arrays)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.cartesian([1, 2], ["a", "b"])
     * console.log(result) // [[1, "a"], [1, "b"], [2, "a"], [2, "b"]]
     * ```
     *
     * @see {@link cartesianWith} — apply a combiner to each pair
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B>(self: ReadonlyArray<A>, that: ReadonlyArray<B>): Array<[A, B]>;
};
/**
 * Starting point for the "do simulation" — an array comprehension pattern.
 *
 * - Begin a pipeline with `Do`, then use {@link bind} to introduce array variables and {@link let_ let} for plain values.
 * - Each `bind` produces the cartesian product of all bound variables (like nested loops).
 * - Use `filter` and `map` in the pipeline to add conditions and transformations.
 *
 * **Example** (Array comprehension with do notation)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 3, 5]),
 *   Array.bind("y", () => [2, 4, 6]),
 *   Array.filter(({ x, y }) => x < y),
 *   Array.map(({ x, y }) => [x, y] as const)
 * )
 * console.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]
 * ```
 *
 * @see {@link bind} — introduce an array variable into the scope
 * @see {@link bindTo} — start a pipeline by naming the first array
 * @see {@link let_ let} — introduce a plain computed value
 *
 * @category do notation
 * @since 3.2.0
 */
export declare const Do: ReadonlyArray<{}>;
/**
 * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
 *
 * - Each `bind` call adds a named property to the accumulated object.
 * - The callback receives the current scope and must return an array.
 * - Equivalent to `flatMap` + merging the new value into the scope object.
 *
 * **Example** (Binding two arrays)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2]),
 *   Array.bind("y", () => ["a", "b"])
 * )
 * console.log(result)
 * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
 * ```
 *
 * @see {@link Do} — start a do-notation pipeline
 * @see {@link bindTo} — name the first array in a pipeline
 * @see {@link let_ let} — add a plain computed value
 *
 * @category do notation
 * @since 3.2.0
 */
export declare const bind: {
    /**
     * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
     *
     * - Each `bind` call adds a named property to the accumulated object.
     * - The callback receives the current scope and must return an array.
     * - Equivalent to `flatMap` + merging the new value into the scope object.
     *
     * **Example** (Binding two arrays)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * const result = pipe(
     *   Array.Do,
     *   Array.bind("x", () => [1, 2]),
     *   Array.bind("y", () => ["a", "b"])
     * )
     * console.log(result)
     * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
     * ```
     *
     * @see {@link Do} — start a do-notation pipeline
     * @see {@link bindTo} — name the first array in a pipeline
     * @see {@link let_ let} — add a plain computed value
     *
     * @category do notation
     * @since 3.2.0
     */
    <A extends object, N extends string, B>(tag: Exclude<N, keyof A>, f: (a: NoInfer<A>) => ReadonlyArray<B>): (self: ReadonlyArray<A>) => Array<{
        [K in N | keyof A]: K extends keyof A ? A[K] : B;
    }>;
    /**
     * Introduces a new array variable into a do-notation scope, producing the cartesian product with all previous bindings.
     *
     * - Each `bind` call adds a named property to the accumulated object.
     * - The callback receives the current scope and must return an array.
     * - Equivalent to `flatMap` + merging the new value into the scope object.
     *
     * **Example** (Binding two arrays)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * const result = pipe(
     *   Array.Do,
     *   Array.bind("x", () => [1, 2]),
     *   Array.bind("y", () => ["a", "b"])
     * )
     * console.log(result)
     * // [{ x: 1, y: "a" }, { x: 1, y: "b" }, { x: 2, y: "a" }, { x: 2, y: "b" }]
     * ```
     *
     * @see {@link Do} — start a do-notation pipeline
     * @see {@link bindTo} — name the first array in a pipeline
     * @see {@link let_ let} — add a plain computed value
     *
     * @category do notation
     * @since 3.2.0
     */
    <A extends object, N extends string, B>(self: ReadonlyArray<A>, tag: Exclude<N, keyof A>, f: (a: NoInfer<A>) => ReadonlyArray<B>): Array<{
        [K in N | keyof A]: K extends keyof A ? A[K] : B;
    }>;
};
/**
 * Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope.
 *
 * - Equivalent to `Array.map(self, (a) => ({ [tag]: a }))`.
 * - Alternative to starting with `Do` + `bind`; useful when you already have an array.
 *
 * **Example** (Naming an existing array)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   [1, 2, 3],
 *   Array.bindTo("x")
 * )
 * console.log(result) // [{ x: 1 }, { x: 2 }, { x: 3 }]
 * ```
 *
 * @see {@link Do} — start with an empty scope
 * @see {@link bind} — add another array variable to the scope
 *
 * @category do notation
 * @since 3.2.0
 */
export declare const bindTo: {
    /**
     * Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope.
     *
     * - Equivalent to `Array.map(self, (a) => ({ [tag]: a }))`.
     * - Alternative to starting with `Do` + `bind`; useful when you already have an array.
     *
     * **Example** (Naming an existing array)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * const result = pipe(
     *   [1, 2, 3],
     *   Array.bindTo("x")
     * )
     * console.log(result) // [{ x: 1 }, { x: 2 }, { x: 3 }]
     * ```
     *
     * @see {@link Do} — start with an empty scope
     * @see {@link bind} — add another array variable to the scope
     *
     * @category do notation
     * @since 3.2.0
     */
    <N extends string>(tag: N): <A>(self: ReadonlyArray<A>) => Array<{
        [K in N]: A;
    }>;
    /**
     * Names the elements of an array by wrapping each in an object with the given key, starting a do-notation scope.
     *
     * - Equivalent to `Array.map(self, (a) => ({ [tag]: a }))`.
     * - Alternative to starting with `Do` + `bind`; useful when you already have an array.
     *
     * **Example** (Naming an existing array)
     *
     * ```ts
     * import { Array, pipe } from "effect"
     *
     * const result = pipe(
     *   [1, 2, 3],
     *   Array.bindTo("x")
     * )
     * console.log(result) // [{ x: 1 }, { x: 2 }, { x: 3 }]
     * ```
     *
     * @see {@link Do} — start with an empty scope
     * @see {@link bind} — add another array variable to the scope
     *
     * @category do notation
     * @since 3.2.0
     */
    <A, N extends string>(self: ReadonlyArray<A>, tag: N): Array<{
        [K in N]: A;
    }>;
};
declare const let_: {
    <N extends string, B, A extends object>(tag: Exclude<N, keyof A>, f: (a: NoInfer<A>) => B): (self: ReadonlyArray<A>) => Array<{
        [K in N | keyof A]: K extends keyof A ? A[K] : B;
    }>;
    <N extends string, A extends object, B>(self: ReadonlyArray<A>, tag: Exclude<N, keyof A>, f: (a: NoInfer<A>) => B): Array<{
        [K in N | keyof A]: K extends keyof A ? A[K] : B;
    }>;
};
export { 
/**
 * Adds a computed plain value to the do-notation scope without introducing a new array dimension.
 *
 * - Unlike {@link bind}, the callback returns a single value (not an array), so no cartesian product occurs.
 * - Useful for derived or intermediate values that depend on previously bound variables.
 *
 * **Example** (Adding a computed value)
 *
 * ```ts
 * import { Array, pipe } from "effect"
 *
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 2, 3]),
 *   Array.let("doubled", ({ x }) => x * 2)
 * )
 * console.log(result)
 * // [{ x: 1, doubled: 2 }, { x: 2, doubled: 4 }, { x: 3, doubled: 6 }]
 * ```
 *
 * @see {@link Do} — start a do-notation pipeline
 * @see {@link bind} — introduce an array variable (produces cartesian product)
 *
 * @category do notation
 * @since 3.2.0
 */
let_ as let };
/**
 * Returns a `Reducer` that combines `ReadonlyArray` values by concatenation.
 *
 * @see {@link makeReducerConcat} — mutable `Array` variant
 *
 * @since 4.0.0
 */
export declare function getReadonlyReducerConcat<A>(): Reducer.Reducer<ReadonlyArray<A>>;
/**
 * Returns a `Reducer` that combines `Array` values by concatenation.
 *
 * @see {@link getReadonlyReducerConcat} — readonly variant
 *
 * @since 4.0.0
 */
export declare function makeReducerConcat<A>(): Reducer.Reducer<Array<A>>;
/**
 * Counts the elements in an iterable that satisfy a predicate.
 *
 * - The predicate receives both the element and its index.
 * - Returns `0` for an empty iterable.
 *
 * **Example** (Counting even numbers)
 *
 * ```ts
 * import { Array } from "effect"
 *
 * const result = Array.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0)
 * console.log(result) // 2
 * ```
 *
 * @see {@link filter} — when you need the matching elements, not just the count
 *
 * @category folding
 * @since 3.16.0
 */
export declare const countBy: {
    /**
     * Counts the elements in an iterable that satisfy a predicate.
     *
     * - The predicate receives both the element and its index.
     * - Returns `0` for an empty iterable.
     *
     * **Example** (Counting even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0)
     * console.log(result) // 2
     * ```
     *
     * @see {@link filter} — when you need the matching elements, not just the count
     *
     * @category folding
     * @since 3.16.0
     */
    <A>(predicate: (a: NoInfer<A>, i: number) => boolean): (self: Iterable<A>) => number;
    /**
     * Counts the elements in an iterable that satisfy a predicate.
     *
     * - The predicate receives both the element and its index.
     * - Returns `0` for an empty iterable.
     *
     * **Example** (Counting even numbers)
     *
     * ```ts
     * import { Array } from "effect"
     *
     * const result = Array.countBy([1, 2, 3, 4, 5], (n) => n % 2 === 0)
     * console.log(result) // 2
     * ```
     *
     * @see {@link filter} — when you need the matching elements, not just the count
     *
     * @category folding
     * @since 3.16.0
     */
    <A>(self: Iterable<A>, predicate: (a: A, i: number) => boolean): number;
};
//# sourceMappingURL=Array.d.ts.map