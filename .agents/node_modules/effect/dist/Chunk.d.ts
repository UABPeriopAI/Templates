/**
 * The `Chunk` module provides an immutable, high-performance sequence data structure
 * optimized for functional programming patterns. A `Chunk` is a persistent data structure
 * that supports efficient append, prepend, and concatenation operations.
 *
 * ## What is a Chunk?
 *
 * A `Chunk<A>` is an immutable sequence of elements of type `A` that provides:
 * - **O(1) append and prepend operations**
 * - **Efficient concatenation** through tree-like structure
 * - **Memory efficiency** with structural sharing
 * - **Rich API** with functional programming operations
 * - **Type safety** with full TypeScript integration
 *
 * ## Key Features
 *
 * - **Immutable**: All operations return new chunks without modifying the original
 * - **Efficient**: Optimized data structure with logarithmic complexity for most operations
 * - **Functional**: Rich set of transformation and combination operators
 * - **Lazy evaluation**: Many operations are deferred until needed
 * - **Interoperable**: Easy conversion to/from arrays and other collections
 *
 * ## Performance Characteristics
 *
 * - **Append/Prepend**: O(1) amortized
 * - **Random Access**: O(log n)
 * - **Concatenation**: O(log min(m, n))
 * - **Iteration**: O(n)
 * - **Memory**: Structural sharing minimizes allocation
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * // Creating chunks
 * const chunk1 = Chunk.fromIterable([1, 2, 3])
 * const chunk2 = Chunk.fromIterable([4, 5, 6])
 * const empty = Chunk.empty<number>()
 *
 * // Combining chunks
 * const combined = Chunk.appendAll(chunk1, chunk2)
 * console.log(Chunk.toReadonlyArray(combined)) // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * // Functional transformations
 * const numbers = Chunk.range(1, 5) // [1, 2, 3, 4, 5]
 * const doubled = Chunk.map(numbers, (n) => n * 2) // [2, 4, 6, 8, 10]
 * const evens = Chunk.filter(doubled, (n) => n % 4 === 0) // [4, 8]
 * const sum = Chunk.reduce(evens, 0, (acc, n) => acc + n) // 12
 * ```
 *
 * @example
 * ```ts
 * import { Chunk, Effect } from "effect"
 *
 * // Working with Effects
 * const processChunk = (chunk: Chunk.Chunk<number>) =>
 *   Effect.gen(function*() {
 *     const mapped = Chunk.map(chunk, (n) => n * 2)
 *     const filtered = Chunk.filter(mapped, (n) => n > 5)
 *     return Chunk.toReadonlyArray(filtered)
 *   })
 * ```
 *
 * @since 2.0.0
 */
import * as RA from "./Array.ts";
import type { NonEmptyReadonlyArray } from "./Array.ts";
import * as Equal from "./Equal.ts";
import * as Equivalence from "./Equivalence.ts";
import type * as Filter from "./Filter.ts";
import type { TypeLambda } from "./HKT.ts";
import { type Inspectable } from "./Inspectable.ts";
import type { NonEmptyIterable } from "./NonEmptyIterable.ts";
import type { Option } from "./Option.ts";
import * as O from "./Option.ts";
import * as Order from "./Order.ts";
import type { Pipeable } from "./Pipeable.ts";
import { type Predicate, type Refinement } from "./Predicate.ts";
import type { Result } from "./Result.ts";
import type { Covariant, NoInfer } from "./Types.ts";
declare const TypeId = "~effect/collections/Chunk";
/**
 * A Chunk is an immutable, ordered collection optimized for efficient concatenation and access patterns.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk: Chunk.Chunk<number> = Chunk.make(1, 2, 3)
 * console.log(chunk.length) // 3
 * console.log(Chunk.toArray(chunk)) // [1, 2, 3]
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export interface Chunk<out A> extends Iterable<A>, Equal.Equal, Pipeable, Inspectable {
    readonly [TypeId]: {
        readonly _A: Covariant<A>;
    };
    readonly length: number;
    right: Chunk<A>;
    left: Chunk<A>;
    backing: Backing<A>;
    depth: number;
}
/**
 * A non-empty Chunk guaranteed to contain at least one element.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk: Chunk.NonEmptyChunk<number> = Chunk.make(1, 2, 3)
 * console.log(Chunk.headNonEmpty(nonEmptyChunk)) // 1
 * console.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 3
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export interface NonEmptyChunk<out A> extends Chunk<A>, NonEmptyIterable<A> {
}
/**
 * Type lambda for Chunk, used for higher-kinded type operations.
 *
 * @example
 * ```ts
 * import type { ChunkTypeLambda } from "effect/Chunk"
 * import type { Kind } from "effect/HKT"
 *
 * // Create a Chunk type using the type lambda
 * type NumberChunk = Kind<ChunkTypeLambda, never, never, never, number>
 * // Equivalent to: Chunk<number>
 * ```
 *
 * @category type lambdas
 * @since 2.0.0
 */
export interface ChunkTypeLambda extends TypeLambda {
    readonly type: Chunk<this["Target"]>;
}
type Backing<A> = IArray<A> | IConcat<A> | ISingleton<A> | IEmpty | ISlice<A>;
interface IArray<A> {
    readonly _tag: "IArray";
    readonly array: ReadonlyArray<A>;
}
interface IConcat<A> {
    readonly _tag: "IConcat";
    readonly left: Chunk<A>;
    readonly right: Chunk<A>;
}
interface ISingleton<A> {
    readonly _tag: "ISingleton";
    readonly a: A;
}
interface IEmpty {
    readonly _tag: "IEmpty";
}
interface ISlice<A> {
    readonly _tag: "ISlice";
    readonly chunk: Chunk<A>;
    readonly offset: number;
    readonly length: number;
}
/**
 * Compares the two chunks of equal length using the specified function
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Equivalence from "effect/Equivalence"
 *
 * const chunk1 = Chunk.make(1, 2, 3)
 * const chunk2 = Chunk.make(1, 2, 3)
 * const chunk3 = Chunk.make(1, 2, 4)
 *
 * const eq = Chunk.makeEquivalence(Equivalence.strictEqual<number>())
 * console.log(eq(chunk1, chunk2)) // true
 * console.log(eq(chunk1, chunk3)) // false
 * ```
 *
 * @category equivalence
 * @since 2.0.0
 */
export declare const makeEquivalence: <A>(isEquivalent: Equivalence.Equivalence<A>) => Equivalence.Equivalence<Chunk<A>>;
/**
 * Checks if `u` is a `Chunk<unknown>`
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const array = [1, 2, 3]
 *
 * console.log(Chunk.isChunk(chunk)) // true
 * console.log(Chunk.isChunk(array)) // false
 * console.log(Chunk.isChunk("string")) // false
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const isChunk: {
    /**
     * Checks if `u` is a `Chunk<unknown>`
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const array = [1, 2, 3]
     *
     * console.log(Chunk.isChunk(chunk)) // true
     * console.log(Chunk.isChunk(array)) // false
     * console.log(Chunk.isChunk("string")) // false
     * ```
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(u: Iterable<A>): u is Chunk<A>;
    /**
     * Checks if `u` is a `Chunk<unknown>`
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const array = [1, 2, 3]
     *
     * console.log(Chunk.isChunk(chunk)) // true
     * console.log(Chunk.isChunk(array)) // false
     * console.log(Chunk.isChunk("string")) // false
     * ```
     *
     * @category constructors
     * @since 2.0.0
     */
    (u: unknown): u is Chunk<unknown>;
};
/**
 * Creates an empty `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const emptyChunk = Chunk.empty()
 * console.log(Chunk.size(emptyChunk)) // 0
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const empty: <A = never>() => Chunk<A>;
/**
 * Builds a `NonEmptyChunk` from an non-empty collection of elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * console.log(chunk)
 * // { _id: 'Chunk', values: [ 1, 2, 3, 4 ] }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const make: <As extends readonly [any, ...Array<any>]>(...as: As) => NonEmptyChunk<As[number]>;
/**
 * Builds a `NonEmptyChunk` from a single element.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.of("hello")
 * console.log(chunk)
 * // { _id: 'Chunk', values: [ "hello" ] }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const of: <A>(a: A) => NonEmptyChunk<A>;
/**
 * Creates a new `Chunk` from an iterable collection of values.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.fromIterable([1, 2, 3])
 * console.log(chunk)
 * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const fromIterable: <A>(self: Iterable<A>) => Chunk<A>;
/**
 * Converts a `Chunk` into an `Array`. If the provided `Chunk` is non-empty
 * (`NonEmptyChunk`), the function will return a `NonEmptyArray`, ensuring the
 * non-empty property is preserved.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const array = Chunk.toArray(chunk)
 * console.log(array) // [1, 2, 3]
 * console.log(Array.isArray(array)) // true
 *
 * // With empty chunk
 * const emptyChunk = Chunk.empty<number>()
 * console.log(Chunk.toArray(emptyChunk)) // []
 * ```
 *
 * @category conversions
 * @since 2.0.0
 */
export declare const toArray: <S extends Chunk<any>>(self: S) => S extends NonEmptyChunk<any> ? RA.NonEmptyArray<Chunk.Infer<S>> : Array<Chunk.Infer<S>>;
/**
 * Converts a `Chunk` into a `ReadonlyArray`. If the provided `Chunk` is
 * non-empty (`NonEmptyChunk`), the function will return a
 * `NonEmptyReadonlyArray`, ensuring the non-empty property is preserved.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const readonlyArray = Chunk.toReadonlyArray(chunk)
 * console.log(readonlyArray) // [1, 2, 3]
 *
 * // The result is read-only, modifications would cause TypeScript errors
 * // readonlyArray[0] = 10 // TypeScript error
 *
 * // With empty chunk
 * const emptyChunk = Chunk.empty<number>()
 * console.log(Chunk.toReadonlyArray(emptyChunk)) // []
 * ```
 *
 * @category conversions
 * @since 2.0.0
 */
export declare const toReadonlyArray: <S extends Chunk<any>>(self: S) => S extends NonEmptyChunk<any> ? RA.NonEmptyReadonlyArray<Chunk.Infer<S>> : ReadonlyArray<Chunk.Infer<S>>;
/**
 * Reverses the order of elements in a `Chunk`.
 * Importantly, if the input chunk is a `NonEmptyChunk`, the reversed chunk will also be a `NonEmptyChunk`.
 *
 * @example
 *
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const result = Chunk.reverse(chunk)
 *
 * console.log(result)
 * // { _id: 'Chunk', values: [ 3, 2, 1 ] }
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const reverse: <S extends Chunk<any>>(self: S) => Chunk.With<S, Chunk.Infer<S>>;
/**
 * This function provides a safe way to read a value at a particular index from a `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 *
 * console.log(Chunk.get(chunk, 1)) // Option.some("b")
 * console.log(Chunk.get(chunk, 10)) // Option.none()
 * console.log(Chunk.get(chunk, -1)) // Option.none()
 *
 * // Using pipe syntax
 * const result = chunk.pipe(Chunk.get(2))
 * console.log(result) // Option.some("c")
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const get: {
    /**
     * This function provides a safe way to read a value at a particular index from a `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     *
     * console.log(Chunk.get(chunk, 1)) // Option.some("b")
     * console.log(Chunk.get(chunk, 10)) // Option.none()
     * console.log(Chunk.get(chunk, -1)) // Option.none()
     *
     * // Using pipe syntax
     * const result = chunk.pipe(Chunk.get(2))
     * console.log(result) // Option.some("c")
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (index: number): <A>(self: Chunk<A>) => Option<A>;
    /**
     * This function provides a safe way to read a value at a particular index from a `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     *
     * console.log(Chunk.get(chunk, 1)) // Option.some("b")
     * console.log(Chunk.get(chunk, 10)) // Option.none()
     * console.log(Chunk.get(chunk, -1)) // Option.none()
     *
     * // Using pipe syntax
     * const result = chunk.pipe(Chunk.get(2))
     * console.log(result) // Option.some("c")
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, index: number): Option<A>;
};
/**
 * Wraps an array into a chunk without copying, unsafe on mutable arrays
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const array = [1, 2, 3, 4, 5]
 * const chunk = Chunk.fromArrayUnsafe(array)
 * console.log(Chunk.toArray(chunk)) // [1, 2, 3, 4, 5]
 *
 * // Warning: Since this doesn't copy the array, mutations affect the chunk
 * array[0] = 999
 * console.log(Chunk.toArray(chunk)) // [999, 2, 3, 4, 5]
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const fromArrayUnsafe: <A>(self: ReadonlyArray<A>) => Chunk<A>;
/**
 * Wraps an array into a chunk without copying, unsafe on mutable arrays
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Array from "effect/Array"
 *
 * const nonEmptyArray = Array.make(1, 2, 3, 4, 5)
 * const chunk = Chunk.fromNonEmptyArrayUnsafe(nonEmptyArray)
 * console.log(Chunk.toArray(chunk)) // [1, 2, 3, 4, 5]
 *
 * // The result is guaranteed to be non-empty
 * console.log(Chunk.isNonEmpty(chunk)) // true
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const fromNonEmptyArrayUnsafe: <A>(self: NonEmptyReadonlyArray<A>) => NonEmptyChunk<A>;
/**
 * Gets an element unsafely, will throw on out of bounds
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 *
 * console.log(Chunk.getUnsafe(chunk, 1)) // "b"
 * console.log(Chunk.getUnsafe(chunk, 3)) // "d"
 *
 * // Warning: This will throw an error for invalid indices
 * try {
 *   Chunk.getUnsafe(chunk, 10) // throws "Index out of bounds"
 * } catch (error) {
 *   console.log((error as Error).message) // "Index out of bounds"
 * }
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const getUnsafe: {
    /**
     * Gets an element unsafely, will throw on out of bounds
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     *
     * console.log(Chunk.getUnsafe(chunk, 1)) // "b"
     * console.log(Chunk.getUnsafe(chunk, 3)) // "d"
     *
     * // Warning: This will throw an error for invalid indices
     * try {
     *   Chunk.getUnsafe(chunk, 10) // throws "Index out of bounds"
     * } catch (error) {
     *   console.log((error as Error).message) // "Index out of bounds"
     * }
     * ```
     *
     * @since 2.0.0
     * @category unsafe
     */
    (index: number): <A>(self: Chunk<A>) => A;
    /**
     * Gets an element unsafely, will throw on out of bounds
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     *
     * console.log(Chunk.getUnsafe(chunk, 1)) // "b"
     * console.log(Chunk.getUnsafe(chunk, 3)) // "d"
     *
     * // Warning: This will throw an error for invalid indices
     * try {
     *   Chunk.getUnsafe(chunk, 10) // throws "Index out of bounds"
     * } catch (error) {
     *   console.log((error as Error).message) // "Index out of bounds"
     * }
     * ```
     *
     * @since 2.0.0
     * @category unsafe
     */
    <A>(self: Chunk<A>, index: number): A;
};
/**
 * Appends the specified element to the end of the `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const newChunk = Chunk.append(chunk, 4)
 * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
 *
 * // Appending to empty chunk
 * const emptyChunk = Chunk.empty<number>()
 * const singleElement = Chunk.append(emptyChunk, 42)
 * console.log(Chunk.toArray(singleElement)) // [42]
 * ```
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const append: {
    /**
     * Appends the specified element to the end of the `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const newChunk = Chunk.append(chunk, 4)
     * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
     *
     * // Appending to empty chunk
     * const emptyChunk = Chunk.empty<number>()
     * const singleElement = Chunk.append(emptyChunk, 42)
     * console.log(Chunk.toArray(singleElement)) // [42]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A2>(a: A2): <A>(self: Chunk<A>) => NonEmptyChunk<A2 | A>;
    /**
     * Appends the specified element to the end of the `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const newChunk = Chunk.append(chunk, 4)
     * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
     *
     * // Appending to empty chunk
     * const emptyChunk = Chunk.empty<number>()
     * const singleElement = Chunk.append(emptyChunk, 42)
     * console.log(Chunk.toArray(singleElement)) // [42]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, A2>(self: Chunk<A>, a: A2): NonEmptyChunk<A | A2>;
};
/**
 * Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(2, 3, 4)
 * const newChunk = Chunk.prepend(chunk, 1)
 * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
 *
 * // Prepending to empty chunk
 * const emptyChunk = Chunk.empty<string>()
 * const singleElement = Chunk.prepend(emptyChunk, "first")
 * console.log(Chunk.toArray(singleElement)) // ["first"]
 * ```
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const prepend: {
    /**
     * Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(2, 3, 4)
     * const newChunk = Chunk.prepend(chunk, 1)
     * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
     *
     * // Prepending to empty chunk
     * const emptyChunk = Chunk.empty<string>()
     * const singleElement = Chunk.prepend(emptyChunk, "first")
     * console.log(Chunk.toArray(singleElement)) // ["first"]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <B>(elem: B): <A>(self: Chunk<A>) => NonEmptyChunk<B | A>;
    /**
     * Prepend an element to the front of a `Chunk`, creating a new `NonEmptyChunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(2, 3, 4)
     * const newChunk = Chunk.prepend(chunk, 1)
     * console.log(Chunk.toArray(newChunk)) // [1, 2, 3, 4]
     *
     * // Prepending to empty chunk
     * const emptyChunk = Chunk.empty<string>()
     * const singleElement = Chunk.prepend(emptyChunk, "first")
     * console.log(Chunk.toArray(singleElement)) // ["first"]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, elem: B): NonEmptyChunk<A | B>;
};
/**
 * Takes the first up to `n` elements from the chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.take(chunk, 3)
 * console.log(result)
 * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const take: {
    /**
     * Takes the first up to `n` elements from the chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.take(chunk, 3)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<A>;
    /**
     * Takes the first up to `n` elements from the chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.take(chunk, 3)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, n: number): Chunk<A>;
};
/**
 * Drops the first up to `n` elements from the chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.drop(chunk, 2)
 * console.log(result)
 * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const drop: {
    /**
     * Drops the first up to `n` elements from the chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.drop(chunk, 2)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<A>;
    /**
     * Drops the first up to `n` elements from the chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.drop(chunk, 2)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, n: number): Chunk<A>;
};
/**
 * Drops the last `n` elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.dropRight(chunk, 2)
 * console.log(result)
 * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dropRight: {
    /**
     * Drops the last `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.dropRight(chunk, 2)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<A>;
    /**
     * Drops the last `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.dropRight(chunk, 2)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 1, 2, 3 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, n: number): Chunk<A>;
};
/**
 * Drops all elements so long as the predicate returns true.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.dropWhile(chunk, (n) => n < 3)
 * console.log(result)
 * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const dropWhile: {
    /**
     * Drops all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.dropWhile(chunk, (n) => n < 3)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => Chunk<A>;
    /**
     * Drops all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.dropWhile(chunk, (n) => n < 3)
     * console.log(result)
     * // { _id: 'Chunk', values: [ 3, 4, 5 ] }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): Chunk<A>;
};
/**
 * Prepends the specified prefix chunk to the beginning of the specified chunk.
 * If either chunk is non-empty, the result is also a non-empty chunk.
 *
 * @example
 *
 * ```ts
 * import { Chunk } from "effect"
 *
 * const result = Chunk.make(1, 2).pipe(
 *   Chunk.prependAll(Chunk.make("a", "b")),
 *   Chunk.toArray
 * )
 *
 * console.log(result)
 * // [ "a", "b", 1, 2 ]
 * ```
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const prependAll: {
    /**
     * Prepends the specified prefix chunk to the beginning of the specified chunk.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.prependAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ "a", "b", 1, 2 ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <S extends Chunk<any>, T extends Chunk<any>>(that: T): (self: S) => Chunk.OrNonEmpty<S, T, Chunk.Infer<S> | Chunk.Infer<T>>;
    /**
     * Prepends the specified prefix chunk to the beginning of the specified chunk.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.prependAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ "a", "b", 1, 2 ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, that: NonEmptyChunk<B>): NonEmptyChunk<A | B>;
    /**
     * Prepends the specified prefix chunk to the beginning of the specified chunk.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.prependAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ "a", "b", 1, 2 ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyChunk<A>, that: Chunk<B>): NonEmptyChunk<A | B>;
    /**
     * Prepends the specified prefix chunk to the beginning of the specified chunk.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.prependAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ "a", "b", 1, 2 ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, that: Chunk<B>): Chunk<A | B>;
};
/**
 * Concatenates two chunks, combining their elements.
 * If either chunk is non-empty, the result is also a non-empty chunk.
 *
 * @example
 *
 * ```ts
 * import { Chunk } from "effect"
 *
 * const result = Chunk.make(1, 2).pipe(
 *   Chunk.appendAll(Chunk.make("a", "b")),
 *   Chunk.toArray
 * )
 *
 * console.log(result)
 * // [ 1, 2, "a", "b" ]
 * ```
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const appendAll: {
    /**
     * Concatenates two chunks, combining their elements.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.appendAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ 1, 2, "a", "b" ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <S extends Chunk<any>, T extends Chunk<any>>(that: T): (self: S) => Chunk.OrNonEmpty<S, T, Chunk.Infer<S> | Chunk.Infer<T>>;
    /**
     * Concatenates two chunks, combining their elements.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.appendAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ 1, 2, "a", "b" ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, that: NonEmptyChunk<B>): NonEmptyChunk<A | B>;
    /**
     * Concatenates two chunks, combining their elements.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.appendAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ 1, 2, "a", "b" ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: NonEmptyChunk<A>, that: Chunk<B>): NonEmptyChunk<A | B>;
    /**
     * Concatenates two chunks, combining their elements.
     * If either chunk is non-empty, the result is also a non-empty chunk.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.make(1, 2).pipe(
     *   Chunk.appendAll(Chunk.make("a", "b")),
     *   Chunk.toArray
     * )
     *
     * console.log(result)
     * // [ 1, 2, "a", "b" ]
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, that: Chunk<B>): Chunk<A | B>;
};
/**
 * Returns a filtered and mapped subset of the elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Result from "effect/Result"
 *
 * const chunk = Chunk.make("1", "2", "hello", "3", "world")
 * const numbers = Chunk.filterMap(chunk, (str) => {
 *   const num = parseInt(str)
 *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
 * })
 * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
 *
 * // With index parameter
 * const evenIndexNumbers = Chunk.filterMap(chunk, (str, i) => {
 *   const num = parseInt(str)
 *   return isNaN(num) || i % 2 !== 0 ? Result.failVoid : Result.succeed(num)
 * })
 * console.log(Chunk.toArray(evenIndexNumbers)) // [1]
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export declare const filterMap: {
    /**
     * Returns a filtered and mapped subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Result from "effect/Result"
     *
     * const chunk = Chunk.make("1", "2", "hello", "3", "world")
     * const numbers = Chunk.filterMap(chunk, (str) => {
     *   const num = parseInt(str)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
     *
     * // With index parameter
     * const evenIndexNumbers = Chunk.filterMap(chunk, (str, i) => {
     *   const num = parseInt(str)
     *   return isNaN(num) || i % 2 !== 0 ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(evenIndexNumbers)) // [1]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B, X>(f: (input: A, i: number) => Result<B, X>): (self: Chunk<A>) => Chunk<B>;
    /**
     * Returns a filtered and mapped subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Result from "effect/Result"
     *
     * const chunk = Chunk.make("1", "2", "hello", "3", "world")
     * const numbers = Chunk.filterMap(chunk, (str) => {
     *   const num = parseInt(str)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
     *
     * // With index parameter
     * const evenIndexNumbers = Chunk.filterMap(chunk, (str, i) => {
     *   const num = parseInt(str)
     *   return isNaN(num) || i % 2 !== 0 ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(evenIndexNumbers)) // [1]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B, X>(self: Chunk<A>, f: (input: A, i: number) => Result<B, X>): Chunk<B>;
};
/**
 * Returns a filtered subset of the elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
 * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
 *
 * // With refinement
 * const mixed = Chunk.make("hello", 42, "world", 100)
 * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
 * console.log(Chunk.toArray(numbers)) // [42, 100]
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export declare const filter: {
    /**
     * Returns a filtered subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
     * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
     *
     * // With refinement
     * const mixed = Chunk.make("hello", 42, "world", 100)
     * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
     * console.log(Chunk.toArray(numbers)) // [42, 100]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Chunk<A>) => Chunk<B>;
    /**
     * Returns a filtered subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
     * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
     *
     * // With refinement
     * const mixed = Chunk.make("hello", 42, "world", 100)
     * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
     * console.log(Chunk.toArray(numbers)) // [42, 100]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => Chunk<A>;
    /**
     * Returns a filtered subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
     * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
     *
     * // With refinement
     * const mixed = Chunk.make("hello", 42, "world", 100)
     * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
     * console.log(Chunk.toArray(numbers)) // [42, 100]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B extends A>(self: Chunk<A>, refinement: Refinement<A, B>): Chunk<B>;
    /**
     * Returns a filtered subset of the elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const evenNumbers = Chunk.filter(chunk, (n) => n % 2 === 0)
     * console.log(Chunk.toArray(evenNumbers)) // [2, 4, 6]
     *
     * // With refinement
     * const mixed = Chunk.make("hello", 42, "world", 100)
     * const numbers = Chunk.filter(mixed, (x): x is number => typeof x === "number")
     * console.log(Chunk.toArray(numbers)) // [42, 100]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): Chunk<A>;
};
/**
 * Transforms all elements of the chunk for as long as the specified function succeeds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Result from "effect/Result"
 *
 * const chunk = Chunk.make("1", "2", "hello", "3", "4")
 * const result = Chunk.filterMapWhile(chunk, (s) => {
 *   const num = parseInt(s)
 *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
 * })
 * console.log(Chunk.toArray(result)) // [1, 2]
 * // Stops at "hello" and doesn't process "3", "4"
 *
 * // Compare with regular filterMap
 * const allNumbers = Chunk.filterMap(chunk, (s) => {
 *   const num = parseInt(s)
 *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
 * })
 * console.log(Chunk.toArray(allNumbers)) // [1, 2, 3, 4]
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export declare const filterMapWhile: {
    /**
     * Transforms all elements of the chunk for as long as the specified function succeeds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Result from "effect/Result"
     *
     * const chunk = Chunk.make("1", "2", "hello", "3", "4")
     * const result = Chunk.filterMapWhile(chunk, (s) => {
     *   const num = parseInt(s)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(result)) // [1, 2]
     * // Stops at "hello" and doesn't process "3", "4"
     *
     * // Compare with regular filterMap
     * const allNumbers = Chunk.filterMap(chunk, (s) => {
     *   const num = parseInt(s)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(allNumbers)) // [1, 2, 3, 4]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B, X>(f: Filter.Filter<A, B, X>): (self: Chunk<A>) => Chunk<B>;
    /**
     * Transforms all elements of the chunk for as long as the specified function succeeds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Result from "effect/Result"
     *
     * const chunk = Chunk.make("1", "2", "hello", "3", "4")
     * const result = Chunk.filterMapWhile(chunk, (s) => {
     *   const num = parseInt(s)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(result)) // [1, 2]
     * // Stops at "hello" and doesn't process "3", "4"
     *
     * // Compare with regular filterMap
     * const allNumbers = Chunk.filterMap(chunk, (s) => {
     *   const num = parseInt(s)
     *   return isNaN(num) ? Result.failVoid : Result.succeed(num)
     * })
     * console.log(Chunk.toArray(allNumbers)) // [1, 2, 3, 4]
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <A, B, X>(self: Chunk<A>, f: Filter.Filter<A, B, X>): Chunk<B>;
};
/**
 * Filter out optional values
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Option from "effect/Option"
 *
 * const chunk = Chunk.make(Option.some(1), Option.none(), Option.some(3))
 * const result = Chunk.compact(chunk)
 * console.log(result)
 * // { _id: 'Chunk', values: [ 1, 3 ] }
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const compact: <A>(self: Chunk<Option<A>>) => Chunk<A>;
/**
 * Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))
 * console.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]
 *
 * // Flattening nested arrays
 * const words = Chunk.make("hello", "world")
 * const letters = Chunk.flatMap(
 *   words,
 *   (word) => Chunk.fromIterable(word.split(""))
 * )
 * console.log(Chunk.toArray(letters)) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
 *
 * // With index parameter
 * const indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))
 * console.log(Chunk.toArray(indexed)) // [1, 3, 5]
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export declare const flatMap: {
    /**
     * Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))
     * console.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]
     *
     * // Flattening nested arrays
     * const words = Chunk.make("hello", "world")
     * const letters = Chunk.flatMap(
     *   words,
     *   (word) => Chunk.fromIterable(word.split(""))
     * )
     * console.log(Chunk.toArray(letters)) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
     *
     * // With index parameter
     * const indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))
     * console.log(Chunk.toArray(indexed)) // [1, 3, 5]
     * ```
     *
     * @since 2.0.0
     * @category sequencing
     */
    <S extends Chunk<any>, T extends Chunk<any>>(f: (a: Chunk.Infer<S>, i: number) => T): (self: S) => Chunk.AndNonEmpty<S, T, Chunk.Infer<T>>;
    /**
     * Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))
     * console.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]
     *
     * // Flattening nested arrays
     * const words = Chunk.make("hello", "world")
     * const letters = Chunk.flatMap(
     *   words,
     *   (word) => Chunk.fromIterable(word.split(""))
     * )
     * console.log(Chunk.toArray(letters)) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
     *
     * // With index parameter
     * const indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))
     * console.log(Chunk.toArray(indexed)) // [1, 3, 5]
     * ```
     *
     * @since 2.0.0
     * @category sequencing
     */
    <A, B>(self: NonEmptyChunk<A>, f: (a: A, i: number) => NonEmptyChunk<B>): NonEmptyChunk<B>;
    /**
     * Applies a function to each element in a chunk and returns a new chunk containing the concatenated mapped elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3)
     * const duplicated = Chunk.flatMap(chunk, (n) => Chunk.make(n, n))
     * console.log(Chunk.toArray(duplicated)) // [1, 1, 2, 2, 3, 3]
     *
     * // Flattening nested arrays
     * const words = Chunk.make("hello", "world")
     * const letters = Chunk.flatMap(
     *   words,
     *   (word) => Chunk.fromIterable(word.split(""))
     * )
     * console.log(Chunk.toArray(letters)) // ["h", "e", "l", "l", "o", "w", "o", "r", "l", "d"]
     *
     * // With index parameter
     * const indexed = Chunk.flatMap(chunk, (n, i) => Chunk.make(n + i))
     * console.log(Chunk.toArray(indexed)) // [1, 3, 5]
     * ```
     *
     * @since 2.0.0
     * @category sequencing
     */
    <A, B>(self: Chunk<A>, f: (a: A, i: number) => Chunk<B>): Chunk<B>;
};
/**
 * Iterates over each element of a `Chunk` and applies a function to it.
 *
 * **Details**
 *
 * This function processes every element of the given `Chunk`, calling the
 * provided function `f` on each element. It does not return a new value;
 * instead, it is primarily used for side effects, such as logging or
 * accumulating data in an external variable.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 *
 * // Log each element
 * Chunk.forEach(chunk, (n) => console.log(`Value: ${n}`))
 * // Output:
 * // Value: 1
 * // Value: 2
 * // Value: 3
 * // Value: 4
 *
 * // With index parameter
 * Chunk.forEach(chunk, (n, i) => console.log(`Index ${i}: ${n}`))
 * // Output:
 * // Index 0: 1
 * // Index 1: 2
 * // Index 2: 3
 * // Index 3: 4
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const forEach: {
    /**
     * Iterates over each element of a `Chunk` and applies a function to it.
     *
     * **Details**
     *
     * This function processes every element of the given `Chunk`, calling the
     * provided function `f` on each element. It does not return a new value;
     * instead, it is primarily used for side effects, such as logging or
     * accumulating data in an external variable.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     *
     * // Log each element
     * Chunk.forEach(chunk, (n) => console.log(`Value: ${n}`))
     * // Output:
     * // Value: 1
     * // Value: 2
     * // Value: 3
     * // Value: 4
     *
     * // With index parameter
     * Chunk.forEach(chunk, (n, i) => console.log(`Index ${i}: ${n}`))
     * // Output:
     * // Index 0: 1
     * // Index 1: 2
     * // Index 2: 3
     * // Index 3: 4
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, B>(f: (a: A, index: number) => B): (self: Chunk<A>) => void;
    /**
     * Iterates over each element of a `Chunk` and applies a function to it.
     *
     * **Details**
     *
     * This function processes every element of the given `Chunk`, calling the
     * provided function `f` on each element. It does not return a new value;
     * instead, it is primarily used for side effects, such as logging or
     * accumulating data in an external variable.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     *
     * // Log each element
     * Chunk.forEach(chunk, (n) => console.log(`Value: ${n}`))
     * // Output:
     * // Value: 1
     * // Value: 2
     * // Value: 3
     * // Value: 4
     *
     * // With index parameter
     * Chunk.forEach(chunk, (n, i) => console.log(`Index ${i}: ${n}`))
     * // Output:
     * // Index 0: 1
     * // Index 1: 2
     * // Index 2: 3
     * // Index 3: 4
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A, B>(self: Chunk<A>, f: (a: A, index: number) => B): void;
};
/**
 * Flattens a chunk of chunks into a single chunk by concatenating all chunks.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nested = Chunk.make(
 *   Chunk.make(1, 2),
 *   Chunk.make(3, 4, 5),
 *   Chunk.make(6)
 * )
 * const flattened = Chunk.flatten(nested)
 * console.log(Chunk.toArray(flattened)) // [1, 2, 3, 4, 5, 6]
 *
 * // With empty chunks
 * const withEmpty = Chunk.make(
 *   Chunk.make(1, 2),
 *   Chunk.empty<number>(),
 *   Chunk.make(3, 4)
 * )
 * console.log(Chunk.toArray(Chunk.flatten(withEmpty))) // [1, 2, 3, 4]
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export declare const flatten: <S extends Chunk<Chunk<any>>>(self: S) => Chunk.Flatten<S>;
/**
 * Groups elements in chunks of up to `n` elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
 * const chunked = Chunk.chunksOf(chunk, 3)
 *
 * console.log(Chunk.toArray(chunked).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * // When length is not evenly divisible
 * const chunk2 = Chunk.make(1, 2, 3, 4, 5)
 * const chunked2 = Chunk.chunksOf(chunk2, 2)
 * console.log(Chunk.toArray(chunked2).map(Chunk.toArray))
 * // [[1, 2], [3, 4], [5]]
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const chunksOf: {
    /**
     * Groups elements in chunks of up to `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
     * const chunked = Chunk.chunksOf(chunk, 3)
     *
     * console.log(Chunk.toArray(chunked).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     *
     * // When length is not evenly divisible
     * const chunk2 = Chunk.make(1, 2, 3, 4, 5)
     * const chunked2 = Chunk.chunksOf(chunk2, 2)
     * console.log(Chunk.toArray(chunked2).map(Chunk.toArray))
     * // [[1, 2], [3, 4], [5]]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<Chunk<A>>;
    /**
     * Groups elements in chunks of up to `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
     * const chunked = Chunk.chunksOf(chunk, 3)
     *
     * console.log(Chunk.toArray(chunked).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     *
     * // When length is not evenly divisible
     * const chunk2 = Chunk.make(1, 2, 3, 4, 5)
     * const chunked2 = Chunk.chunksOf(chunk2, 2)
     * console.log(Chunk.toArray(chunked2).map(Chunk.toArray))
     * // [[1, 2], [3, 4], [5]]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(self: Chunk<A>, n: number): Chunk<Chunk<A>>;
};
/**
 * Creates a Chunk of unique values that are included in all given Chunks.
 *
 * The order and references of result values are determined by the Chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make(1, 2, 3, 4)
 * const chunk2 = Chunk.make(3, 4, 5, 6)
 * const result = Chunk.intersection(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [3, 4]
 *
 * // With strings
 * const words1 = Chunk.make("hello", "world", "foo")
 * const words2 = Chunk.make("world", "bar", "foo")
 * console.log(Chunk.toArray(Chunk.intersection(words1, words2))) // ["world", "foo"]
 *
 * // No intersection
 * const chunk3 = Chunk.make(1, 2)
 * const chunk4 = Chunk.make(3, 4)
 * console.log(Chunk.toArray(Chunk.intersection(chunk3, chunk4))) // []
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const intersection: {
    /**
     * Creates a Chunk of unique values that are included in all given Chunks.
     *
     * The order and references of result values are determined by the Chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3, 4)
     * const chunk2 = Chunk.make(3, 4, 5, 6)
     * const result = Chunk.intersection(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [3, 4]
     *
     * // With strings
     * const words1 = Chunk.make("hello", "world", "foo")
     * const words2 = Chunk.make("world", "bar", "foo")
     * console.log(Chunk.toArray(Chunk.intersection(words1, words2))) // ["world", "foo"]
     *
     * // No intersection
     * const chunk3 = Chunk.make(1, 2)
     * const chunk4 = Chunk.make(3, 4)
     * console.log(Chunk.toArray(Chunk.intersection(chunk3, chunk4))) // []
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(that: Chunk<A>): <B>(self: Chunk<B>) => Chunk<A & B>;
    /**
     * Creates a Chunk of unique values that are included in all given Chunks.
     *
     * The order and references of result values are determined by the Chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3, 4)
     * const chunk2 = Chunk.make(3, 4, 5, 6)
     * const result = Chunk.intersection(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [3, 4]
     *
     * // With strings
     * const words1 = Chunk.make("hello", "world", "foo")
     * const words2 = Chunk.make("world", "bar", "foo")
     * console.log(Chunk.toArray(Chunk.intersection(words1, words2))) // ["world", "foo"]
     *
     * // No intersection
     * const chunk3 = Chunk.make(1, 2)
     * const chunk4 = Chunk.make(3, 4)
     * console.log(Chunk.toArray(Chunk.intersection(chunk3, chunk4))) // []
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B>(self: Chunk<A>, that: Chunk<B>): Chunk<A & B>;
};
/**
 * Determines if the chunk is empty.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * console.log(Chunk.isEmpty(Chunk.empty())) // true
 * console.log(Chunk.isEmpty(Chunk.make(1, 2, 3))) // false
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const isEmpty: <A>(self: Chunk<A>) => boolean;
/**
 * Determines if the chunk is not empty.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * console.log(Chunk.isNonEmpty(Chunk.empty())) // false
 * console.log(Chunk.isNonEmpty(Chunk.make(1, 2, 3))) // true
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const isNonEmpty: <A>(self: Chunk<A>) => self is NonEmptyChunk<A>;
/**
 * Returns the first element of this chunk if it exists.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * console.log(Chunk.head(Chunk.empty())) // { _tag: "None" }
 * console.log(Chunk.head(Chunk.make(1, 2, 3))) // { _tag: "Some", value: 1 }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const head: <A>(self: Chunk<A>) => Option<A>;
/**
 * Returns the first element of this chunk.
 *
 * It will throw an error if the chunk is empty.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.headUnsafe(chunk)) // 1
 *
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.headUnsafe(singleElement)) // "hello"
 *
 * // Warning: This will throw for empty chunks
 * try {
 *   Chunk.headUnsafe(Chunk.empty())
 * } catch (error) {
 *   console.log((error as Error).message) // "Index out of bounds"
 * }
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const headUnsafe: <A>(self: Chunk<A>) => A;
/**
 * Returns the first element of this non empty chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.headNonEmpty(nonEmptyChunk)) // 1
 *
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.headNonEmpty(singleElement)) // "hello"
 *
 * // Type safety: this function only accepts NonEmptyChunk
 * // Chunk.headNonEmpty(Chunk.empty()) // TypeScript error
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const headNonEmpty: <A>(self: NonEmptyChunk<A>) => A;
/**
 * Returns the last element of this chunk if it exists.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * console.log(Chunk.last(Chunk.empty())) // { _tag: "None" }
 * console.log(Chunk.last(Chunk.make(1, 2, 3))) // { _tag: "Some", value: 3 }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const last: <A>(self: Chunk<A>) => Option<A>;
/**
 * Returns the last element of this chunk.
 *
 * It will throw an error if the chunk is empty.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.lastUnsafe(chunk)) // 4
 *
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.lastUnsafe(singleElement)) // "hello"
 *
 * // Warning: This will throw for empty chunks
 * try {
 *   Chunk.lastUnsafe(Chunk.empty())
 * } catch (error) {
 *   console.log((error as Error).message) // "Index out of bounds"
 * }
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export declare const lastUnsafe: <A>(self: Chunk<A>) => A;
/**
 * Returns the last element of this non empty chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.lastNonEmpty(nonEmptyChunk)) // 4
 *
 * const singleElement = Chunk.make("hello")
 * console.log(Chunk.lastNonEmpty(singleElement)) // "hello"
 *
 * // Type safety: this function only accepts NonEmptyChunk
 * // Chunk.lastNonEmpty(Chunk.empty()) // TypeScript error
 * ```
 *
 * @since 3.4.0
 * @category elements
 */
export declare const lastNonEmpty: <A>(self: NonEmptyChunk<A>) => A;
/**
 * A namespace containing utility types for Chunk operations.
 *
 * @example
 * ```ts
 * import type { Chunk } from "effect"
 *
 * // Extract the element type from a Chunk
 * declare const chunk: Chunk.Chunk<string>
 * type ElementType = Chunk.Chunk.Infer<typeof chunk> // string
 *
 * // Create a preserving non-emptiness
 * declare const nonEmptyChunk: Chunk.NonEmptyChunk<number>
 * type WithString = Chunk.Chunk.With<typeof nonEmptyChunk, string> // Chunk.NonEmptyChunk<string>
 * ```
 *
 * @category types
 * @since 2.0.0
 */
export declare namespace Chunk {
    /**
     * Infers the element type of a Chunk.
     *
     * @example
     * ```ts
     * import type { Chunk } from "effect"
     *
     * declare const numberChunk: Chunk.Chunk<number>
     * declare const stringChunk: Chunk.Chunk<string>
     *
     * type NumberType = Chunk.Chunk.Infer<typeof numberChunk> // number
     * type StringType = Chunk.Chunk.Infer<typeof stringChunk> // string
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type Infer<S extends Chunk<any>> = S extends Chunk<infer A> ? A : never;
    /**
     * Constructs a Chunk type preserving non-emptiness.
     *
     * @example
     * ```ts
     * import type { Chunk } from "effect"
     *
     * declare const regularChunk: Chunk.Chunk<number>
     * declare const nonEmptyChunk: Chunk.NonEmptyChunk<number>
     *
     * type WithString1 = Chunk.Chunk.With<typeof regularChunk, string> // Chunk.Chunk<string>
     * type WithString2 = Chunk.Chunk.With<typeof nonEmptyChunk, string> // Chunk.NonEmptyChunk<string>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type With<S extends Chunk<any>, A> = S extends NonEmptyChunk<any> ? NonEmptyChunk<A> : Chunk<A>;
    /**
     * Creates a non-empty Chunk if either input is non-empty.
     *
     * @example
     * ```ts
     * import type { Chunk } from "effect"
     *
     * declare const emptyChunk: Chunk.Chunk<number>
     * declare const nonEmptyChunk: Chunk.NonEmptyChunk<number>
     *
     * type Result1 = Chunk.Chunk.OrNonEmpty<
     *   typeof emptyChunk,
     *   typeof emptyChunk,
     *   string
     * > // Chunk.Chunk<string>
     * type Result2 = Chunk.Chunk.OrNonEmpty<
     *   typeof emptyChunk,
     *   typeof nonEmptyChunk,
     *   string
     * > // Chunk.NonEmptyChunk<string>
     * type Result3 = Chunk.Chunk.OrNonEmpty<
     *   typeof nonEmptyChunk,
     *   typeof emptyChunk,
     *   string
     * > // Chunk.NonEmptyChunk<string>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type OrNonEmpty<S extends Chunk<any>, T extends Chunk<any>, A> = S extends NonEmptyChunk<any> ? NonEmptyChunk<A> : T extends NonEmptyChunk<any> ? NonEmptyChunk<A> : Chunk<A>;
    /**
     * Creates a non-empty Chunk only if both inputs are non-empty.
     *
     * @example
     * ```ts
     * import type { Chunk } from "effect"
     *
     * declare const emptyChunk: Chunk.Chunk<number>
     * declare const nonEmptyChunk: Chunk.NonEmptyChunk<number>
     *
     * type Result1 = Chunk.Chunk.AndNonEmpty<
     *   typeof emptyChunk,
     *   typeof emptyChunk,
     *   string
     * > // Chunk.Chunk<string>
     * type Result2 = Chunk.Chunk.AndNonEmpty<
     *   typeof emptyChunk,
     *   typeof nonEmptyChunk,
     *   string
     * > // Chunk.Chunk<string>
     * type Result3 = Chunk.Chunk.AndNonEmpty<
     *   typeof nonEmptyChunk,
     *   typeof nonEmptyChunk,
     *   string
     * > // Chunk.NonEmptyChunk<string>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type AndNonEmpty<S extends Chunk<any>, T extends Chunk<any>, A> = S extends NonEmptyChunk<any> ? T extends NonEmptyChunk<any> ? NonEmptyChunk<A> : Chunk<A> : Chunk<A>;
    /**
     * Flattens a nested Chunk type.
     *
     * @example
     * ```ts
     * import type { Chunk } from "effect"
     *
     * declare const nestedChunk: Chunk.Chunk<Chunk.Chunk<number>>
     * declare const nestedNonEmpty: Chunk.NonEmptyChunk<Chunk.NonEmptyChunk<string>>
     *
     * type Flattened1 = Chunk.Chunk.Flatten<typeof nestedChunk> // Chunk.Chunk<number>
     * type Flattened2 = Chunk.Chunk.Flatten<typeof nestedNonEmpty> // Chunk.NonEmptyChunk<string>
     * ```
     *
     * @category types
     * @since 2.0.0
     */
    type Flatten<T extends Chunk<Chunk<any>>> = T extends NonEmptyChunk<NonEmptyChunk<infer A>> ? NonEmptyChunk<A> : T extends Chunk<Chunk<infer A>> ? Chunk<A> : never;
}
/**
 * Transforms the elements of a chunk using the specified mapping function.
 * If the input chunk is non-empty, the resulting chunk will also be non-empty.
 *
 * @example
 *
 * ```ts
 * import { Chunk } from "effect"
 *
 * const result = Chunk.map(Chunk.make(1, 2), (n) => n + 1)
 *
 * console.log(result)
 * // { _id: 'Chunk', values: [ 2, 3 ] }
 * ```
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const map: {
    /**
     * Transforms the elements of a chunk using the specified mapping function.
     * If the input chunk is non-empty, the resulting chunk will also be non-empty.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.map(Chunk.make(1, 2), (n) => n + 1)
     *
     * console.log(result)
     * // { _id: 'Chunk', values: [ 2, 3 ] }
     * ```
     *
     * @since 2.0.0
     * @category mapping
     */
    <S extends Chunk<any>, B>(f: (a: Chunk.Infer<S>, i: number) => B): (self: S) => Chunk.With<S, B>;
    /**
     * Transforms the elements of a chunk using the specified mapping function.
     * If the input chunk is non-empty, the resulting chunk will also be non-empty.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.map(Chunk.make(1, 2), (n) => n + 1)
     *
     * console.log(result)
     * // { _id: 'Chunk', values: [ 2, 3 ] }
     * ```
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, B>(self: NonEmptyChunk<A>, f: (a: A, i: number) => B): NonEmptyChunk<B>;
    /**
     * Transforms the elements of a chunk using the specified mapping function.
     * If the input chunk is non-empty, the resulting chunk will also be non-empty.
     *
     * @example
     *
     * ```ts
     * import { Chunk } from "effect"
     *
     * const result = Chunk.map(Chunk.make(1, 2), (n) => n + 1)
     *
     * console.log(result)
     * // { _id: 'Chunk', values: [ 2, 3 ] }
     * ```
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, B>(self: Chunk<A>, f: (a: A, i: number) => B): Chunk<B>;
};
/**
 * Statefully maps over the chunk, producing new elements of type `B`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const [finalState, mapped] = Chunk.mapAccum(chunk, 0, (state, current) => [
 *   state + current, // accumulate sum
 *   state + current // output running sum
 * ])
 *
 * console.log(finalState) // 15 (final accumulated sum)
 * console.log(Chunk.toArray(mapped)) // [1, 3, 6, 10, 15] (running sums)
 *
 * // Building a string with indices
 * const words = Chunk.make("hello", "world", "effect")
 * const [count, indexed] = Chunk.mapAccum(words, 0, (index, word) => [
 *   index + 1,
 *   `${index}: ${word}`
 * ])
 * console.log(count) // 3
 * console.log(Chunk.toArray(indexed)) // ["0: hello", "1: world", "2: effect"]
 * ```
 *
 * @since 2.0.0
 * @category folding
 */
export declare const mapAccum: {
    /**
     * Statefully maps over the chunk, producing new elements of type `B`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const [finalState, mapped] = Chunk.mapAccum(chunk, 0, (state, current) => [
     *   state + current, // accumulate sum
     *   state + current // output running sum
     * ])
     *
     * console.log(finalState) // 15 (final accumulated sum)
     * console.log(Chunk.toArray(mapped)) // [1, 3, 6, 10, 15] (running sums)
     *
     * // Building a string with indices
     * const words = Chunk.make("hello", "world", "effect")
     * const [count, indexed] = Chunk.mapAccum(words, 0, (index, word) => [
     *   index + 1,
     *   `${index}: ${word}`
     * ])
     * console.log(count) // 3
     * console.log(Chunk.toArray(indexed)) // ["0: hello", "1: world", "2: effect"]
     * ```
     *
     * @since 2.0.0
     * @category folding
     */
    <S, A, B>(s: S, f: (s: S, a: A) => readonly [S, B]): (self: Chunk<A>) => [S, Chunk<B>];
    /**
     * Statefully maps over the chunk, producing new elements of type `B`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const [finalState, mapped] = Chunk.mapAccum(chunk, 0, (state, current) => [
     *   state + current, // accumulate sum
     *   state + current // output running sum
     * ])
     *
     * console.log(finalState) // 15 (final accumulated sum)
     * console.log(Chunk.toArray(mapped)) // [1, 3, 6, 10, 15] (running sums)
     *
     * // Building a string with indices
     * const words = Chunk.make("hello", "world", "effect")
     * const [count, indexed] = Chunk.mapAccum(words, 0, (index, word) => [
     *   index + 1,
     *   `${index}: ${word}`
     * ])
     * console.log(count) // 3
     * console.log(Chunk.toArray(indexed)) // ["0: hello", "1: world", "2: effect"]
     * ```
     *
     * @since 2.0.0
     * @category folding
     */
    <S, A, B>(self: Chunk<A>, s: S, f: (s: S, a: A) => readonly [S, B]): [S, Chunk<B>];
};
/**
 * Splits a chunk using a `Filter` into failures and successes.
 *
 * - Returns `[excluded, satisfying]`.
 * - The filter receives `(element, index)`.
 *
 * @example
 * ```ts
 * import { Chunk, Result } from "effect"
 *
 * const [excluded, satisfying] = Chunk.partition(Chunk.make(1, -2, 3), (n, i) =>
 *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
 * )
 *
 * console.log(Chunk.toArray(excluded)) // ["negative:-2"]
 * console.log(Chunk.toArray(satisfying)) // [1, 5]
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const partition: {
    /**
     * Splits a chunk using a `Filter` into failures and successes.
     *
     * - Returns `[excluded, satisfying]`.
     * - The filter receives `(element, index)`.
     *
     * @example
     * ```ts
     * import { Chunk, Result } from "effect"
     *
     * const [excluded, satisfying] = Chunk.partition(Chunk.make(1, -2, 3), (n, i) =>
     *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
     * )
     *
     * console.log(Chunk.toArray(excluded)) // ["negative:-2"]
     * console.log(Chunk.toArray(satisfying)) // [1, 5]
     * ```
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, Pass, Fail>(f: (input: NoInfer<A>, i: number) => Result<Pass, Fail>): (self: Chunk<A>) => [excluded: Chunk<Fail>, satisfying: Chunk<Pass>];
    /**
     * Splits a chunk using a `Filter` into failures and successes.
     *
     * - Returns `[excluded, satisfying]`.
     * - The filter receives `(element, index)`.
     *
     * @example
     * ```ts
     * import { Chunk, Result } from "effect"
     *
     * const [excluded, satisfying] = Chunk.partition(Chunk.make(1, -2, 3), (n, i) =>
     *   n > 0 ? Result.succeed(n + i) : Result.fail(`negative:${n}`)
     * )
     *
     * console.log(Chunk.toArray(excluded)) // ["negative:-2"]
     * console.log(Chunk.toArray(satisfying)) // [1, 5]
     * ```
     *
     * @category filtering
     * @since 2.0.0
     */
    <A, Pass, Fail>(self: Chunk<A>, f: (input: A, i: number) => Result<Pass, Fail>): [excluded: Chunk<Fail>, satisfying: Chunk<Pass>];
};
/**
 * Partitions the elements of this chunk into two chunks.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Result from "effect/Result"
 *
 * const chunk = Chunk.make(
 *   Result.succeed(1),
 *   Result.fail("error1"),
 *   Result.succeed(2),
 *   Result.fail("error2"),
 *   Result.succeed(3)
 * )
 *
 * const [errors, values] = Chunk.separate(chunk)
 * console.log(Chunk.toArray(errors)) // ["error1", "error2"]
 * console.log(Chunk.toArray(values)) // [1, 2, 3]
 *
 * // All successes
 * const allSuccesses = Chunk.make(Result.succeed(1), Result.succeed(2))
 * const [noErrors, allValues] = Chunk.separate(allSuccesses)
 * console.log(Chunk.toArray(noErrors)) // []
 * console.log(Chunk.toArray(allValues)) // [1, 2]
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export declare const separate: <A, B>(self: Chunk<Result<B, A>>) => [Chunk<A>, Chunk<B>];
/**
 * Retrieves the size of the chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * console.log(Chunk.size(chunk)) // 3
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const size: <A>(self: Chunk<A>) => number;
/**
 * Sort the elements of a Chunk in increasing order, creating a new Chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Order from "effect/Order"
 *
 * const numbers = Chunk.make(3, 1, 4, 1, 5, 9, 2, 6)
 * const sorted = Chunk.sort(numbers, Order.Number)
 * console.log(Chunk.toArray(sorted)) // [1, 1, 2, 3, 4, 5, 6, 9]
 *
 * // Reverse order
 * const reverseSorted = Chunk.sort(numbers, Order.flip(Order.Number))
 * console.log(Chunk.toArray(reverseSorted)) // [9, 6, 5, 4, 3, 2, 1, 1]
 *
 * // String sorting
 * const words = Chunk.make("banana", "apple", "cherry")
 * const sortedWords = Chunk.sort(words, Order.String)
 * console.log(Chunk.toArray(sortedWords)) // ["apple", "banana", "cherry"]
 * ```
 *
 * @since 2.0.0
 * @category sorting
 */
export declare const sort: {
    /**
     * Sort the elements of a Chunk in increasing order, creating a new Chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Order from "effect/Order"
     *
     * const numbers = Chunk.make(3, 1, 4, 1, 5, 9, 2, 6)
     * const sorted = Chunk.sort(numbers, Order.Number)
     * console.log(Chunk.toArray(sorted)) // [1, 1, 2, 3, 4, 5, 6, 9]
     *
     * // Reverse order
     * const reverseSorted = Chunk.sort(numbers, Order.flip(Order.Number))
     * console.log(Chunk.toArray(reverseSorted)) // [9, 6, 5, 4, 3, 2, 1, 1]
     *
     * // String sorting
     * const words = Chunk.make("banana", "apple", "cherry")
     * const sortedWords = Chunk.sort(words, Order.String)
     * console.log(Chunk.toArray(sortedWords)) // ["apple", "banana", "cherry"]
     * ```
     *
     * @since 2.0.0
     * @category sorting
     */
    <B>(O: Order.Order<B>): <A extends B>(self: Chunk<A>) => Chunk<A>;
    /**
     * Sort the elements of a Chunk in increasing order, creating a new Chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Order from "effect/Order"
     *
     * const numbers = Chunk.make(3, 1, 4, 1, 5, 9, 2, 6)
     * const sorted = Chunk.sort(numbers, Order.Number)
     * console.log(Chunk.toArray(sorted)) // [1, 1, 2, 3, 4, 5, 6, 9]
     *
     * // Reverse order
     * const reverseSorted = Chunk.sort(numbers, Order.flip(Order.Number))
     * console.log(Chunk.toArray(reverseSorted)) // [9, 6, 5, 4, 3, 2, 1, 1]
     *
     * // String sorting
     * const words = Chunk.make("banana", "apple", "cherry")
     * const sortedWords = Chunk.sort(words, Order.String)
     * console.log(Chunk.toArray(sortedWords)) // ["apple", "banana", "cherry"]
     * ```
     *
     * @since 2.0.0
     * @category sorting
     */
    <A extends B, B>(self: Chunk<A>, O: Order.Order<B>): Chunk<A>;
};
/**
 * Sorts the elements of a Chunk based on a projection function.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Order from "effect/Order"
 *
 * const people = Chunk.make(
 *   { name: "Alice", age: 30 },
 *   { name: "Bob", age: 25 },
 *   { name: "Charlie", age: 35 }
 * )
 *
 * // Sort by age
 * const byAge = Chunk.sortWith(people, (person) => person.age, Order.Number)
 * console.log(Chunk.toArray(byAge))
 * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 35 }]
 *
 * // Sort by name
 * const byName = Chunk.sortWith(people, (person) => person.name, Order.String)
 * console.log(Chunk.toArray(byName))
 * // [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Charlie", age: 35 }]
 *
 * // Sort by string length
 * const words = Chunk.make("a", "abc", "ab")
 * const byLength = Chunk.sortWith(words, (word) => word.length, Order.Number)
 * console.log(Chunk.toArray(byLength)) // ["a", "ab", "abc"]
 * ```
 *
 * @since 2.0.0
 * @category sorting
 */
export declare const sortWith: {
    /**
     * Sorts the elements of a Chunk based on a projection function.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Order from "effect/Order"
     *
     * const people = Chunk.make(
     *   { name: "Alice", age: 30 },
     *   { name: "Bob", age: 25 },
     *   { name: "Charlie", age: 35 }
     * )
     *
     * // Sort by age
     * const byAge = Chunk.sortWith(people, (person) => person.age, Order.Number)
     * console.log(Chunk.toArray(byAge))
     * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 35 }]
     *
     * // Sort by name
     * const byName = Chunk.sortWith(people, (person) => person.name, Order.String)
     * console.log(Chunk.toArray(byName))
     * // [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Charlie", age: 35 }]
     *
     * // Sort by string length
     * const words = Chunk.make("a", "abc", "ab")
     * const byLength = Chunk.sortWith(words, (word) => word.length, Order.Number)
     * console.log(Chunk.toArray(byLength)) // ["a", "ab", "abc"]
     * ```
     *
     * @since 2.0.0
     * @category sorting
     */
    <A, B>(f: (a: A) => B, order: Order.Order<B>): (self: Chunk<A>) => Chunk<A>;
    /**
     * Sorts the elements of a Chunk based on a projection function.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Order from "effect/Order"
     *
     * const people = Chunk.make(
     *   { name: "Alice", age: 30 },
     *   { name: "Bob", age: 25 },
     *   { name: "Charlie", age: 35 }
     * )
     *
     * // Sort by age
     * const byAge = Chunk.sortWith(people, (person) => person.age, Order.Number)
     * console.log(Chunk.toArray(byAge))
     * // [{ name: "Bob", age: 25 }, { name: "Alice", age: 30 }, { name: "Charlie", age: 35 }]
     *
     * // Sort by name
     * const byName = Chunk.sortWith(people, (person) => person.name, Order.String)
     * console.log(Chunk.toArray(byName))
     * // [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Charlie", age: 35 }]
     *
     * // Sort by string length
     * const words = Chunk.make("a", "abc", "ab")
     * const byLength = Chunk.sortWith(words, (word) => word.length, Order.Number)
     * console.log(Chunk.toArray(byLength)) // ["a", "ab", "abc"]
     * ```
     *
     * @since 2.0.0
     * @category sorting
     */
    <A, B>(self: Chunk<A>, f: (a: A) => B, order: Order.Order<B>): Chunk<A>;
};
/**
 *  Returns two splits of this chunk at the specified index.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, after] = Chunk.splitAt(chunk, 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(after)) // [4, 5, 6]
 *
 * // Split at index 0
 * const [empty, all] = Chunk.splitAt(chunk, 0)
 * console.log(Chunk.toArray(empty)) // []
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 *
 * // Split beyond length
 * const [allElements, empty2] = Chunk.splitAt(chunk, 10)
 * console.log(Chunk.toArray(allElements)) // [1, 2, 3, 4, 5, 6]
 * console.log(Chunk.toArray(empty2)) // []
 * ```
 *
 * @since 2.0.0
 * @category splitting
 */
export declare const splitAt: {
    /**
     *  Returns two splits of this chunk at the specified index.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, after] = Chunk.splitAt(chunk, 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(after)) // [4, 5, 6]
     *
     * // Split at index 0
     * const [empty, all] = Chunk.splitAt(chunk, 0)
     * console.log(Chunk.toArray(empty)) // []
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     *
     * // Split beyond length
     * const [allElements, empty2] = Chunk.splitAt(chunk, 10)
     * console.log(Chunk.toArray(allElements)) // [1, 2, 3, 4, 5, 6]
     * console.log(Chunk.toArray(empty2)) // []
     * ```
     *
     * @since 2.0.0
     * @category splitting
     */
    (n: number): <A>(self: Chunk<A>) => [beforeIndex: Chunk<A>, fromIndex: Chunk<A>];
    /**
     *  Returns two splits of this chunk at the specified index.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, after] = Chunk.splitAt(chunk, 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(after)) // [4, 5, 6]
     *
     * // Split at index 0
     * const [empty, all] = Chunk.splitAt(chunk, 0)
     * console.log(Chunk.toArray(empty)) // []
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     *
     * // Split beyond length
     * const [allElements, empty2] = Chunk.splitAt(chunk, 10)
     * console.log(Chunk.toArray(allElements)) // [1, 2, 3, 4, 5, 6]
     * console.log(Chunk.toArray(empty2)) // []
     * ```
     *
     * @since 2.0.0
     * @category splitting
     */
    <A>(self: Chunk<A>, n: number): [beforeIndex: Chunk<A>, fromIndex: Chunk<A>];
};
/**
 * Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements.
 * The value of `n` must be `>= 1`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, after] = Chunk.splitNonEmptyAt(nonEmptyChunk, 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(after)) // [4, 5, 6]
 *
 * // Split at 1 (minimum)
 * const [first, rest] = Chunk.splitNonEmptyAt(nonEmptyChunk, 1)
 * console.log(Chunk.toArray(first)) // [1]
 * console.log(Chunk.toArray(rest)) // [2, 3, 4, 5, 6]
 *
 * // The first part is guaranteed to be NonEmptyChunk
 * // while the second part may be empty
 * ```
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const splitNonEmptyAt: {
    /**
     * Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements.
     * The value of `n` must be `>= 1`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const nonEmptyChunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, after] = Chunk.splitNonEmptyAt(nonEmptyChunk, 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(after)) // [4, 5, 6]
     *
     * // Split at 1 (minimum)
     * const [first, rest] = Chunk.splitNonEmptyAt(nonEmptyChunk, 1)
     * console.log(Chunk.toArray(first)) // [1]
     * console.log(Chunk.toArray(rest)) // [2, 3, 4, 5, 6]
     *
     * // The first part is guaranteed to be NonEmptyChunk
     * // while the second part may be empty
     * ```
     *
     * @category splitting
     * @since 2.0.0
     */
    (n: number): <A>(self: NonEmptyChunk<A>) => [beforeIndex: NonEmptyChunk<A>, fromIndex: Chunk<A>];
    /**
     * Splits a `NonEmptyChunk` into two segments, with the first segment containing a maximum of `n` elements.
     * The value of `n` must be `>= 1`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const nonEmptyChunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, after] = Chunk.splitNonEmptyAt(nonEmptyChunk, 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(after)) // [4, 5, 6]
     *
     * // Split at 1 (minimum)
     * const [first, rest] = Chunk.splitNonEmptyAt(nonEmptyChunk, 1)
     * console.log(Chunk.toArray(first)) // [1]
     * console.log(Chunk.toArray(rest)) // [2, 3, 4, 5, 6]
     *
     * // The first part is guaranteed to be NonEmptyChunk
     * // while the second part may be empty
     * ```
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: NonEmptyChunk<A>, n: number): [beforeIndex: NonEmptyChunk<A>, fromIndex: Chunk<A>];
};
/**
 * Splits this chunk into `n` equally sized chunks.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
 * const chunks = Chunk.split(chunk, 3)
 * console.log(Chunk.toArray(chunks).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 *
 * // Uneven split
 * const chunk2 = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8)
 * const chunks2 = Chunk.split(chunk2, 3)
 * console.log(Chunk.toArray(chunks2).map(Chunk.toArray))
 * // [[1, 2, 3], [4, 5, 6], [7, 8]]
 *
 * // Split into 1 chunk
 * const chunks3 = Chunk.split(chunk, 1)
 * console.log(Chunk.toArray(chunks3).map(Chunk.toArray))
 * // [[1, 2, 3, 4, 5, 6, 7, 8, 9]]
 * ```
 *
 * @since 2.0.0
 * @category splitting
 */
export declare const split: {
    /**
     * Splits this chunk into `n` equally sized chunks.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
     * const chunks = Chunk.split(chunk, 3)
     * console.log(Chunk.toArray(chunks).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     *
     * // Uneven split
     * const chunk2 = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8)
     * const chunks2 = Chunk.split(chunk2, 3)
     * console.log(Chunk.toArray(chunks2).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8]]
     *
     * // Split into 1 chunk
     * const chunks3 = Chunk.split(chunk, 1)
     * console.log(Chunk.toArray(chunks3).map(Chunk.toArray))
     * // [[1, 2, 3, 4, 5, 6, 7, 8, 9]]
     * ```
     *
     * @since 2.0.0
     * @category splitting
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<Chunk<A>>;
    /**
     * Splits this chunk into `n` equally sized chunks.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8, 9)
     * const chunks = Chunk.split(chunk, 3)
     * console.log(Chunk.toArray(chunks).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
     *
     * // Uneven split
     * const chunk2 = Chunk.make(1, 2, 3, 4, 5, 6, 7, 8)
     * const chunks2 = Chunk.split(chunk2, 3)
     * console.log(Chunk.toArray(chunks2).map(Chunk.toArray))
     * // [[1, 2, 3], [4, 5, 6], [7, 8]]
     *
     * // Split into 1 chunk
     * const chunks3 = Chunk.split(chunk, 1)
     * console.log(Chunk.toArray(chunks3).map(Chunk.toArray))
     * // [[1, 2, 3, 4, 5, 6, 7, 8, 9]]
     * ```
     *
     * @since 2.0.0
     * @category splitting
     */
    <A>(self: Chunk<A>, n: number): Chunk<Chunk<A>>;
};
/**
 * Splits this chunk on the first element that matches this predicate.
 * Returns a tuple containing two chunks: the first one is before the match, and the second one is from the match onward.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const [before, fromMatch] = Chunk.splitWhere(chunk, (n) => n > 3)
 * console.log(Chunk.toArray(before)) // [1, 2, 3]
 * console.log(Chunk.toArray(fromMatch)) // [4, 5, 6]
 *
 * // No match found
 * const [all, empty] = Chunk.splitWhere(chunk, (n) => n > 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 * console.log(Chunk.toArray(empty)) // []
 *
 * // Match on first element
 * const [emptyBefore, allFromFirst] = Chunk.splitWhere(chunk, (n) => n === 1)
 * console.log(Chunk.toArray(emptyBefore)) // []
 * console.log(Chunk.toArray(allFromFirst)) // [1, 2, 3, 4, 5, 6]
 * ```
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const splitWhere: {
    /**
     * Splits this chunk on the first element that matches this predicate.
     * Returns a tuple containing two chunks: the first one is before the match, and the second one is from the match onward.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, fromMatch] = Chunk.splitWhere(chunk, (n) => n > 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(fromMatch)) // [4, 5, 6]
     *
     * // No match found
     * const [all, empty] = Chunk.splitWhere(chunk, (n) => n > 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     * console.log(Chunk.toArray(empty)) // []
     *
     * // Match on first element
     * const [emptyBefore, allFromFirst] = Chunk.splitWhere(chunk, (n) => n === 1)
     * console.log(Chunk.toArray(emptyBefore)) // []
     * console.log(Chunk.toArray(allFromFirst)) // [1, 2, 3, 4, 5, 6]
     * ```
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => [beforeMatch: Chunk<A>, fromMatch: Chunk<A>];
    /**
     * Splits this chunk on the first element that matches this predicate.
     * Returns a tuple containing two chunks: the first one is before the match, and the second one is from the match onward.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const [before, fromMatch] = Chunk.splitWhere(chunk, (n) => n > 3)
     * console.log(Chunk.toArray(before)) // [1, 2, 3]
     * console.log(Chunk.toArray(fromMatch)) // [4, 5, 6]
     *
     * // No match found
     * const [all, empty] = Chunk.splitWhere(chunk, (n) => n > 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     * console.log(Chunk.toArray(empty)) // []
     *
     * // Match on first element
     * const [emptyBefore, allFromFirst] = Chunk.splitWhere(chunk, (n) => n === 1)
     * console.log(Chunk.toArray(emptyBefore)) // []
     * console.log(Chunk.toArray(allFromFirst)) // [1, 2, 3, 4, 5, 6]
     * ```
     *
     * @category splitting
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): [beforeMatch: Chunk<A>, fromMatch: Chunk<A>];
};
/**
 * Returns every elements after the first.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * console.log(Chunk.tail(chunk)) // Option.some(Chunk.make(2, 3, 4))
 *
 * const singleElement = Chunk.make(1)
 * console.log(Chunk.tail(singleElement)) // Option.some(Chunk.empty())
 *
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.tail(empty)) // Option.none()
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const tail: <A>(self: Chunk<A>) => O.Option<Chunk<A>>;
/**
 * Returns every elements after the first.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const nonEmptyChunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.tailNonEmpty(nonEmptyChunk)
 * console.log(Chunk.toArray(result)) // [2, 3, 4]
 *
 * const singleElement = Chunk.make(1)
 * const resultSingle = Chunk.tailNonEmpty(singleElement)
 * console.log(Chunk.toArray(resultSingle)) // []
 *
 * // Type safety: this function only accepts NonEmptyChunk
 * // Chunk.tailNonEmpty(Chunk.empty()) // TypeScript error
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const tailNonEmpty: <A>(self: NonEmptyChunk<A>) => Chunk<A>;
/**
 * Takes the last `n` elements.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
 * const lastThree = Chunk.takeRight(chunk, 3)
 * console.log(Chunk.toArray(lastThree)) // [4, 5, 6]
 *
 * // Take more than available
 * const all = Chunk.takeRight(chunk, 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
 *
 * // Take zero
 * const none = Chunk.takeRight(chunk, 0)
 * console.log(Chunk.toArray(none)) // []
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const takeRight: {
    /**
     * Takes the last `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const lastThree = Chunk.takeRight(chunk, 3)
     * console.log(Chunk.toArray(lastThree)) // [4, 5, 6]
     *
     * // Take more than available
     * const all = Chunk.takeRight(chunk, 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     *
     * // Take zero
     * const none = Chunk.takeRight(chunk, 0)
     * console.log(Chunk.toArray(none)) // []
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    (n: number): <A>(self: Chunk<A>) => Chunk<A>;
    /**
     * Takes the last `n` elements.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5, 6)
     * const lastThree = Chunk.takeRight(chunk, 3)
     * console.log(Chunk.toArray(lastThree)) // [4, 5, 6]
     *
     * // Take more than available
     * const all = Chunk.takeRight(chunk, 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3, 4, 5, 6]
     *
     * // Take zero
     * const none = Chunk.takeRight(chunk, 0)
     * console.log(Chunk.toArray(none)) // []
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(self: Chunk<A>, n: number): Chunk<A>;
};
/**
 * Takes all elements so long as the predicate returns true.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
 * const result = Chunk.takeWhile(chunk, (n) => n < 4)
 * console.log(Chunk.toArray(result)) // [1, 2, 3]
 *
 * // Empty if first element doesn't match
 * const none = Chunk.takeWhile(chunk, (n) => n > 5)
 * console.log(Chunk.toArray(none)) // []
 *
 * // Takes all if all match
 * const small = Chunk.make(1, 2, 3)
 * const all = Chunk.takeWhile(small, (n) => n < 10)
 * console.log(Chunk.toArray(all)) // [1, 2, 3]
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const takeWhile: {
    /**
     * Takes all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
     * const result = Chunk.takeWhile(chunk, (n) => n < 4)
     * console.log(Chunk.toArray(result)) // [1, 2, 3]
     *
     * // Empty if first element doesn't match
     * const none = Chunk.takeWhile(chunk, (n) => n > 5)
     * console.log(Chunk.toArray(none)) // []
     *
     * // Takes all if all match
     * const small = Chunk.make(1, 2, 3)
     * const all = Chunk.takeWhile(small, (n) => n < 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Chunk<A>) => Chunk<B>;
    /**
     * Takes all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
     * const result = Chunk.takeWhile(chunk, (n) => n < 4)
     * console.log(Chunk.toArray(result)) // [1, 2, 3]
     *
     * // Empty if first element doesn't match
     * const none = Chunk.takeWhile(chunk, (n) => n > 5)
     * console.log(Chunk.toArray(none)) // []
     *
     * // Takes all if all match
     * const small = Chunk.make(1, 2, 3)
     * const all = Chunk.takeWhile(small, (n) => n < 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => Chunk<A>;
    /**
     * Takes all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
     * const result = Chunk.takeWhile(chunk, (n) => n < 4)
     * console.log(Chunk.toArray(result)) // [1, 2, 3]
     *
     * // Empty if first element doesn't match
     * const none = Chunk.takeWhile(chunk, (n) => n > 5)
     * console.log(Chunk.toArray(none)) // []
     *
     * // Takes all if all match
     * const small = Chunk.make(1, 2, 3)
     * const all = Chunk.takeWhile(small, (n) => n < 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B extends A>(self: Chunk<A>, refinement: Refinement<A, B>): Chunk<B>;
    /**
     * Takes all elements so long as the predicate returns true.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 3, 2, 1)
     * const result = Chunk.takeWhile(chunk, (n) => n < 4)
     * console.log(Chunk.toArray(result)) // [1, 2, 3]
     *
     * // Empty if first element doesn't match
     * const none = Chunk.takeWhile(chunk, (n) => n > 5)
     * console.log(Chunk.toArray(none)) // []
     *
     * // Takes all if all match
     * const small = Chunk.make(1, 2, 3)
     * const all = Chunk.takeWhile(small, (n) => n < 10)
     * console.log(Chunk.toArray(all)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): Chunk<A>;
};
/**
 * Creates a Chunks of unique values, in order, from all given Chunks.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make(1, 2, 3)
 * const chunk2 = Chunk.make(3, 4, 5)
 * const result = Chunk.union(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [1, 2, 3, 4, 5]
 *
 * // Handles duplicates within the same chunk
 * const withDupes1 = Chunk.make(1, 1, 2)
 * const withDupes2 = Chunk.make(2, 3, 3)
 * const unified = Chunk.union(withDupes1, withDupes2)
 * console.log(Chunk.toArray(unified)) // [1, 2, 3]
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const union: {
    /**
     * Creates a Chunks of unique values, in order, from all given Chunks.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3)
     * const chunk2 = Chunk.make(3, 4, 5)
     * const result = Chunk.union(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [1, 2, 3, 4, 5]
     *
     * // Handles duplicates within the same chunk
     * const withDupes1 = Chunk.make(1, 1, 2)
     * const withDupes2 = Chunk.make(2, 3, 3)
     * const unified = Chunk.union(withDupes1, withDupes2)
     * console.log(Chunk.toArray(unified)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A>(that: Chunk<A>): <B>(self: Chunk<B>) => Chunk<A | B>;
    /**
     * Creates a Chunks of unique values, in order, from all given Chunks.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3)
     * const chunk2 = Chunk.make(3, 4, 5)
     * const result = Chunk.union(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [1, 2, 3, 4, 5]
     *
     * // Handles duplicates within the same chunk
     * const withDupes1 = Chunk.make(1, 1, 2)
     * const withDupes2 = Chunk.make(2, 3, 3)
     * const unified = Chunk.union(withDupes1, withDupes2)
     * console.log(Chunk.toArray(unified)) // [1, 2, 3]
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <A, B>(self: Chunk<A>, that: Chunk<B>): Chunk<A | B>;
};
/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 2, 3, 1, 4, 3)
 * const result = Chunk.dedupe(chunk)
 * console.log(Chunk.toArray(result)) // [1, 2, 3, 4]
 *
 * // Empty chunk
 * const empty = Chunk.empty<number>()
 * const emptyDeduped = Chunk.dedupe(empty)
 * console.log(Chunk.toArray(emptyDeduped)) // []
 *
 * // No duplicates
 * const unique = Chunk.make(1, 2, 3)
 * const uniqueDeduped = Chunk.dedupe(unique)
 * console.log(Chunk.toArray(uniqueDeduped)) // [1, 2, 3]
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const dedupe: <A>(self: Chunk<A>) => Chunk<A>;
/**
 * Deduplicates adjacent elements that are identical.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 1, 2, 2, 2, 3, 1, 1)
 * const result = Chunk.dedupeAdjacent(chunk)
 * console.log(Chunk.toArray(result)) // [1, 2, 3, 1]
 *
 * // Only removes adjacent duplicates, not all duplicates
 * const mixed = Chunk.make("a", "a", "b", "a", "a")
 * const mixedResult = Chunk.dedupeAdjacent(mixed)
 * console.log(Chunk.toArray(mixedResult)) // ["a", "b", "a"]
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export declare const dedupeAdjacent: <A>(self: Chunk<A>) => Chunk<A>;
/**
 * Takes a `Chunk` of pairs and return two corresponding `Chunk`s.
 *
 * Note: The function is reverse of `zip`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const pairs = Chunk.make(
 *   [1, "a"] as const,
 *   [2, "b"] as const,
 *   [3, "c"] as const
 * )
 * const [numbers, letters] = Chunk.unzip(pairs)
 * console.log(Chunk.toArray(numbers)) // [1, 2, 3]
 * console.log(Chunk.toArray(letters)) // ["a", "b", "c"]
 *
 * // Empty chunk
 * const empty = Chunk.empty<[number, string]>()
 * const [emptyNums, emptyStrs] = Chunk.unzip(empty)
 * console.log(Chunk.toArray(emptyNums)) // []
 * console.log(Chunk.toArray(emptyStrs)) // []
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const unzip: <A, B>(self: Chunk<readonly [A, B]>) => [Chunk<A>, Chunk<B>];
/**
 * Zips this chunk pointwise with the specified chunk using the specified combiner.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const numbers = Chunk.make(1, 2, 3)
 * const letters = Chunk.make("a", "b", "c")
 * const result = Chunk.zipWith(numbers, letters, (n, l) => `${n}-${l}`)
 * console.log(Chunk.toArray(result)) // ["1-a", "2-b", "3-c"]
 *
 * // Different lengths - takes minimum
 * const short = Chunk.make(1, 2)
 * const long = Chunk.make("a", "b", "c", "d")
 * const mixed = Chunk.zipWith(short, long, (n, l) => [n, l])
 * console.log(Chunk.toArray(mixed)) // [[1, "a"], [2, "b"]]
 * ```
 *
 * @since 2.0.0
 * @category zipping
 */
export declare const zipWith: {
    /**
     * Zips this chunk pointwise with the specified chunk using the specified combiner.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const numbers = Chunk.make(1, 2, 3)
     * const letters = Chunk.make("a", "b", "c")
     * const result = Chunk.zipWith(numbers, letters, (n, l) => `${n}-${l}`)
     * console.log(Chunk.toArray(result)) // ["1-a", "2-b", "3-c"]
     *
     * // Different lengths - takes minimum
     * const short = Chunk.make(1, 2)
     * const long = Chunk.make("a", "b", "c", "d")
     * const mixed = Chunk.zipWith(short, long, (n, l) => [n, l])
     * console.log(Chunk.toArray(mixed)) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @since 2.0.0
     * @category zipping
     */
    <A, B, C>(that: Chunk<B>, f: (a: A, b: B) => C): (self: Chunk<A>) => Chunk<C>;
    /**
     * Zips this chunk pointwise with the specified chunk using the specified combiner.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const numbers = Chunk.make(1, 2, 3)
     * const letters = Chunk.make("a", "b", "c")
     * const result = Chunk.zipWith(numbers, letters, (n, l) => `${n}-${l}`)
     * console.log(Chunk.toArray(result)) // ["1-a", "2-b", "3-c"]
     *
     * // Different lengths - takes minimum
     * const short = Chunk.make(1, 2)
     * const long = Chunk.make("a", "b", "c", "d")
     * const mixed = Chunk.zipWith(short, long, (n, l) => [n, l])
     * console.log(Chunk.toArray(mixed)) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @since 2.0.0
     * @category zipping
     */
    <A, B, C>(self: Chunk<A>, that: Chunk<B>, f: (a: A, b: B) => C): Chunk<C>;
};
/**
 * Zips this chunk pointwise with the specified chunk.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const numbers = Chunk.make(1, 2, 3)
 * const letters = Chunk.make("a", "b", "c")
 * const result = Chunk.zip(numbers, letters)
 * console.log(Chunk.toArray(result)) // [[1, "a"], [2, "b"], [3, "c"]]
 *
 * // Different lengths - takes minimum length
 * const short = Chunk.make(1, 2)
 * const long = Chunk.make("a", "b", "c", "d")
 * const zipped = Chunk.zip(short, long)
 * console.log(Chunk.toArray(zipped)) // [[1, "a"], [2, "b"]]
 * ```
 *
 * @since 2.0.0
 * @category zipping
 */
export declare const zip: {
    /**
     * Zips this chunk pointwise with the specified chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const numbers = Chunk.make(1, 2, 3)
     * const letters = Chunk.make("a", "b", "c")
     * const result = Chunk.zip(numbers, letters)
     * console.log(Chunk.toArray(result)) // [[1, "a"], [2, "b"], [3, "c"]]
     *
     * // Different lengths - takes minimum length
     * const short = Chunk.make(1, 2)
     * const long = Chunk.make("a", "b", "c", "d")
     * const zipped = Chunk.zip(short, long)
     * console.log(Chunk.toArray(zipped)) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @since 2.0.0
     * @category zipping
     */
    <B>(that: Chunk<B>): <A>(self: Chunk<A>) => Chunk<[A, B]>;
    /**
     * Zips this chunk pointwise with the specified chunk.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const numbers = Chunk.make(1, 2, 3)
     * const letters = Chunk.make("a", "b", "c")
     * const result = Chunk.zip(numbers, letters)
     * console.log(Chunk.toArray(result)) // [[1, "a"], [2, "b"], [3, "c"]]
     *
     * // Different lengths - takes minimum length
     * const short = Chunk.make(1, 2)
     * const long = Chunk.make("a", "b", "c", "d")
     * const zipped = Chunk.zip(short, long)
     * console.log(Chunk.toArray(zipped)) // [[1, "a"], [2, "b"]]
     * ```
     *
     * @since 2.0.0
     * @category zipping
     */
    <A, B>(self: Chunk<A>, that: Chunk<B>): Chunk<[A, B]>;
};
/**
 * Delete the element at the specified index, creating a new `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 * const result = Chunk.remove(chunk, 1)
 * console.log(Chunk.toArray(result)) // ["a", "c", "d"]
 *
 * // Remove first element
 * const removeFirst = Chunk.remove(chunk, 0)
 * console.log(Chunk.toArray(removeFirst)) // ["b", "c", "d"]
 *
 * // Index out of bounds returns same chunk
 * const outOfBounds = Chunk.remove(chunk, 10)
 * console.log(Chunk.toArray(outOfBounds)) // ["a", "b", "c", "d"]
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const remove: {
    /**
     * Delete the element at the specified index, creating a new `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     * const result = Chunk.remove(chunk, 1)
     * console.log(Chunk.toArray(result)) // ["a", "c", "d"]
     *
     * // Remove first element
     * const removeFirst = Chunk.remove(chunk, 0)
     * console.log(Chunk.toArray(removeFirst)) // ["b", "c", "d"]
     *
     * // Index out of bounds returns same chunk
     * const outOfBounds = Chunk.remove(chunk, 10)
     * console.log(Chunk.toArray(outOfBounds)) // ["a", "b", "c", "d"]
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (i: number): <A>(self: Chunk<A>) => Chunk<A>;
    /**
     * Delete the element at the specified index, creating a new `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     * const result = Chunk.remove(chunk, 1)
     * console.log(Chunk.toArray(result)) // ["a", "c", "d"]
     *
     * // Remove first element
     * const removeFirst = Chunk.remove(chunk, 0)
     * console.log(Chunk.toArray(removeFirst)) // ["b", "c", "d"]
     *
     * // Index out of bounds returns same chunk
     * const outOfBounds = Chunk.remove(chunk, 10)
     * console.log(Chunk.toArray(outOfBounds)) // ["a", "b", "c", "d"]
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, i: number): Chunk<A>;
};
/**
 * Applies a function to the element at the specified index, creating a new `Chunk`,
 * or returns `None` if the index is out of bounds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.modify(chunk, 1, (n) => n * 10)
 * console.log(result) // Option.some(Chunk.make(1, 20, 3, 4))
 *
 * // Index out of bounds returns None
 * const outOfBounds = chunk.pipe(Chunk.modify(10, (n) => n * 10))
 * console.log(outOfBounds) // Option.none()
 *
 * // Negative index returns None
 * const negative = chunk.pipe(Chunk.modify(-1, (n) => n * 10))
 * console.log(negative) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const modify: {
    /**
     * Applies a function to the element at the specified index, creating a new `Chunk`,
     * or returns `None` if the index is out of bounds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     * const result = Chunk.modify(chunk, 1, (n) => n * 10)
     * console.log(result) // Option.some(Chunk.make(1, 20, 3, 4))
     *
     * // Index out of bounds returns None
     * const outOfBounds = chunk.pipe(Chunk.modify(10, (n) => n * 10))
     * console.log(outOfBounds) // Option.none()
     *
     * // Negative index returns None
     * const negative = chunk.pipe(Chunk.modify(-1, (n) => n * 10))
     * console.log(negative) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(i: number, f: (a: A) => B): (self: Chunk<A>) => O.Option<Chunk<A | B>>;
    /**
     * Applies a function to the element at the specified index, creating a new `Chunk`,
     * or returns `None` if the index is out of bounds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     * const result = Chunk.modify(chunk, 1, (n) => n * 10)
     * console.log(result) // Option.some(Chunk.make(1, 20, 3, 4))
     *
     * // Index out of bounds returns None
     * const outOfBounds = chunk.pipe(Chunk.modify(10, (n) => n * 10))
     * console.log(outOfBounds) // Option.none()
     *
     * // Negative index returns None
     * const negative = chunk.pipe(Chunk.modify(-1, (n) => n * 10))
     * console.log(negative) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, i: number, f: (a: A) => B): O.Option<Chunk<A | B>>;
};
/**
 * Change the element at the specified index, creating a new `Chunk`,
 * or returns `None` if the index is out of bounds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("a", "b", "c", "d")
 * const result = Chunk.replace(chunk, 1, "X")
 * console.log(result) // Option.some(Chunk.make("a", "X", "c", "d"))
 *
 * // Index out of bounds returns None
 * const outOfBounds = chunk.pipe(Chunk.replace(10, "Y"))
 * console.log(outOfBounds) // Option.none()
 *
 * // Negative index returns None
 * const negative = chunk.pipe(Chunk.replace(-1, "Z"))
 * console.log(negative) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const replace: {
    /**
     * Change the element at the specified index, creating a new `Chunk`,
     * or returns `None` if the index is out of bounds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     * const result = Chunk.replace(chunk, 1, "X")
     * console.log(result) // Option.some(Chunk.make("a", "X", "c", "d"))
     *
     * // Index out of bounds returns None
     * const outOfBounds = chunk.pipe(Chunk.replace(10, "Y"))
     * console.log(outOfBounds) // Option.none()
     *
     * // Negative index returns None
     * const negative = chunk.pipe(Chunk.replace(-1, "Z"))
     * console.log(negative) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <B>(i: number, b: B): <A>(self: Chunk<A>) => O.Option<Chunk<B | A>>;
    /**
     * Change the element at the specified index, creating a new `Chunk`,
     * or returns `None` if the index is out of bounds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("a", "b", "c", "d")
     * const result = Chunk.replace(chunk, 1, "X")
     * console.log(result) // Option.some(Chunk.make("a", "X", "c", "d"))
     *
     * // Index out of bounds returns None
     * const outOfBounds = chunk.pipe(Chunk.replace(10, "Y"))
     * console.log(outOfBounds) // Option.none()
     *
     * // Negative index returns None
     * const negative = chunk.pipe(Chunk.replace(-1, "Z"))
     * console.log(negative) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, i: number, b: B): O.Option<Chunk<B | A>>;
};
/**
 * Return a Chunk of length n with element i initialized with f(i).
 *
 * **Note**. `n` is normalized to an integer >= 1.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.makeBy(5, (i) => i * 2)
 * console.log(chunk)
 * // { _id: 'Chunk', values: [ 0, 2, 4, 6, 8 ] }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const makeBy: {
    /**
     * Return a Chunk of length n with element i initialized with f(i).
     *
     * **Note**. `n` is normalized to an integer >= 1.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.makeBy(5, (i) => i * 2)
     * console.log(chunk)
     * // { _id: 'Chunk', values: [ 0, 2, 4, 6, 8 ] }
     * ```
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(f: (i: number) => A): (n: number) => NonEmptyChunk<A>;
    /**
     * Return a Chunk of length n with element i initialized with f(i).
     *
     * **Note**. `n` is normalized to an integer >= 1.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.makeBy(5, (i) => i * 2)
     * console.log(chunk)
     * // { _id: 'Chunk', values: [ 0, 2, 4, 6, 8 ] }
     * ```
     *
     * @category constructors
     * @since 2.0.0
     */
    <A>(n: number, f: (i: number) => A): NonEmptyChunk<A>;
};
/**
 * Create a non empty `Chunk` containing a range of integers, including both endpoints.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.range(1, 5)
 * console.log(chunk)
 * // { _id: 'Chunk', values: [ 1, 2, 3, 4, 5 ] }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const range: (start: number, end: number) => NonEmptyChunk<number>;
/**
 * Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.contains(chunk, 3)) // true
 * console.log(Chunk.contains(chunk, 6)) // false
 *
 * // Works with strings
 * const words = Chunk.make("apple", "banana", "cherry")
 * console.log(Chunk.contains(words, "banana")) // true
 * console.log(Chunk.contains(words, "grape")) // false
 *
 * // Empty chunk
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.contains(empty, 1)) // false
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const contains: {
    /**
     * Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.contains(chunk, 3)) // true
     * console.log(Chunk.contains(chunk, 6)) // false
     *
     * // Works with strings
     * const words = Chunk.make("apple", "banana", "cherry")
     * console.log(Chunk.contains(words, "banana")) // true
     * console.log(Chunk.contains(words, "grape")) // false
     *
     * // Empty chunk
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.contains(empty, 1)) // false
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(a: A): (self: Chunk<A>) => boolean;
    /**
     * Returns a function that checks if a `Chunk` contains a given value using the default `Equivalence`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.contains(chunk, 3)) // true
     * console.log(Chunk.contains(chunk, 6)) // false
     *
     * // Works with strings
     * const words = Chunk.make("apple", "banana", "cherry")
     * console.log(Chunk.contains(words, "banana")) // true
     * console.log(Chunk.contains(words, "grape")) // false
     *
     * // Empty chunk
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.contains(empty, 1)) // false
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, a: A): boolean;
};
/**
 * Returns a function that checks if a `Chunk` contains a given value using a provided `isEquivalent` function.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })
 *
 * // Custom equivalence by id
 * const containsById = Chunk.containsWith<{ id: number; name: string }>((a, b) =>
 *   a.id === b.id
 * )
 * console.log(containsById(chunk, { id: 1, name: "Different" })) // true
 * console.log(containsById(chunk, { id: 3, name: "Charlie" })) // false
 *
 * // Case-insensitive string comparison
 * const words = Chunk.make("Apple", "Banana", "Cherry")
 * const containsCaseInsensitive = Chunk.containsWith<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 * console.log(containsCaseInsensitive(words, "apple")) // true
 * console.log(containsCaseInsensitive(words, "grape")) // false
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const containsWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
    (a: A): (self: Chunk<A>) => boolean;
    (self: Chunk<A>, a: A): boolean;
};
/**
 * Returns the first element that satisfies the specified
 * predicate, or `None` if no such element exists.
 *
 * @example
 * ```ts
 * import { Chunk, Option } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findFirst(chunk, (n) => n > 3)
 * console.log(Option.isSome(result)) // true
 * console.log(Option.getOrElse(result, () => 0)) // 4
 *
 * // No match found
 * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
 * console.log(Option.isNone(notFound)) // true
 *
 * // With type refinement
 * const mixed = Chunk.make(1, "hello", 2, "world", 3)
 * const firstString = Chunk.findFirst(
 *   mixed,
 *   (x): x is string => typeof x === "string"
 * )
 * console.log(Option.getOrElse(firstString, () => "")) // "hello"
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findFirst: {
    /**
     * Returns the first element that satisfies the specified
     * predicate, or `None` if no such element exists.
     *
     * @example
     * ```ts
     * import { Chunk, Option } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirst(chunk, (n) => n > 3)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 4
     *
     * // No match found
     * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // With type refinement
     * const mixed = Chunk.make(1, "hello", 2, "world", 3)
     * const firstString = Chunk.findFirst(
     *   mixed,
     *   (x): x is string => typeof x === "string"
     * )
     * console.log(Option.getOrElse(firstString, () => "")) // "hello"
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Chunk<A>) => Option<B>;
    /**
     * Returns the first element that satisfies the specified
     * predicate, or `None` if no such element exists.
     *
     * @example
     * ```ts
     * import { Chunk, Option } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirst(chunk, (n) => n > 3)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 4
     *
     * // No match found
     * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // With type refinement
     * const mixed = Chunk.make(1, "hello", 2, "world", 3)
     * const firstString = Chunk.findFirst(
     *   mixed,
     *   (x): x is string => typeof x === "string"
     * )
     * console.log(Option.getOrElse(firstString, () => "")) // "hello"
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => Option<A>;
    /**
     * Returns the first element that satisfies the specified
     * predicate, or `None` if no such element exists.
     *
     * @example
     * ```ts
     * import { Chunk, Option } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirst(chunk, (n) => n > 3)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 4
     *
     * // No match found
     * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // With type refinement
     * const mixed = Chunk.make(1, "hello", 2, "world", 3)
     * const firstString = Chunk.findFirst(
     *   mixed,
     *   (x): x is string => typeof x === "string"
     * )
     * console.log(Option.getOrElse(firstString, () => "")) // "hello"
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: Chunk<A>, refinement: Refinement<A, B>): Option<B>;
    /**
     * Returns the first element that satisfies the specified
     * predicate, or `None` if no such element exists.
     *
     * @example
     * ```ts
     * import { Chunk, Option } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirst(chunk, (n) => n > 3)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 4
     *
     * // No match found
     * const notFound = Chunk.findFirst(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // With type refinement
     * const mixed = Chunk.make(1, "hello", 2, "world", 3)
     * const firstString = Chunk.findFirst(
     *   mixed,
     *   (x): x is string => typeof x === "string"
     * )
     * console.log(Option.getOrElse(firstString, () => "")) // "hello"
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): Option<A>;
};
/**
 * Return the first index for which a predicate holds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findFirstIndex(chunk, (n) => n > 3)
 * console.log(result) // Option.some(3)
 *
 * // No match found
 * const notFound = Chunk.findFirstIndex(chunk, (n) => n > 10)
 * console.log(notFound) // Option.none()
 *
 * // Find first even number
 * const firstEven = Chunk.findFirstIndex(chunk, (n) => n % 2 === 0)
 * console.log(firstEven) // Option.some(1)
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findFirstIndex: {
    /**
     * Return the first index for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirstIndex(chunk, (n) => n > 3)
     * console.log(result) // Option.some(3)
     *
     * // No match found
     * const notFound = Chunk.findFirstIndex(chunk, (n) => n > 10)
     * console.log(notFound) // Option.none()
     *
     * // Find first even number
     * const firstEven = Chunk.findFirstIndex(chunk, (n) => n % 2 === 0)
     * console.log(firstEven) // Option.some(1)
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<A>): (self: Chunk<A>) => O.Option<number>;
    /**
     * Return the first index for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findFirstIndex(chunk, (n) => n > 3)
     * console.log(result) // Option.some(3)
     *
     * // No match found
     * const notFound = Chunk.findFirstIndex(chunk, (n) => n > 10)
     * console.log(notFound) // Option.none()
     *
     * // Find first even number
     * const firstEven = Chunk.findFirstIndex(chunk, (n) => n % 2 === 0)
     * console.log(firstEven) // Option.some(1)
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): O.Option<number>;
};
/**
 * Find the last element for which a predicate holds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 * import * as Option from "effect/Option"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findLast(chunk, (n) => n < 4)
 * console.log(Option.isSome(result)) // true
 * console.log(Option.getOrElse(result, () => 0)) // 3
 *
 * // No match found
 * const notFound = Chunk.findLast(chunk, (n) => n > 10)
 * console.log(Option.isNone(notFound)) // true
 *
 * // Find last even number
 * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
 * console.log(Option.getOrElse(lastEven, () => 0)) // 4
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findLast: {
    /**
     * Find the last element for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Option from "effect/Option"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLast(chunk, (n) => n < 4)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 3
     *
     * // No match found
     * const notFound = Chunk.findLast(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // Find last even number
     * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
     * console.log(Option.getOrElse(lastEven, () => 0)) // 4
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Chunk<A>) => Option<B>;
    /**
     * Find the last element for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Option from "effect/Option"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLast(chunk, (n) => n < 4)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 3
     *
     * // No match found
     * const notFound = Chunk.findLast(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // Find last even number
     * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
     * console.log(Option.getOrElse(lastEven, () => 0)) // 4
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => Option<A>;
    /**
     * Find the last element for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Option from "effect/Option"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLast(chunk, (n) => n < 4)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 3
     *
     * // No match found
     * const notFound = Chunk.findLast(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // Find last even number
     * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
     * console.log(Option.getOrElse(lastEven, () => 0)) // 4
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: Chunk<A>, refinement: Refinement<A, B>): Option<B>;
    /**
     * Find the last element for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     * import * as Option from "effect/Option"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLast(chunk, (n) => n < 4)
     * console.log(Option.isSome(result)) // true
     * console.log(Option.getOrElse(result, () => 0)) // 3
     *
     * // No match found
     * const notFound = Chunk.findLast(chunk, (n) => n > 10)
     * console.log(Option.isNone(notFound)) // true
     *
     * // Find last even number
     * const lastEven = Chunk.findLast(chunk, (n) => n % 2 === 0)
     * console.log(Option.getOrElse(lastEven, () => 0)) // 4
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): Option<A>;
};
/**
 * Return the last index for which a predicate holds.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const result = Chunk.findLastIndex(chunk, (n) => n < 4)
 * console.log(result) // Option.some(2)
 *
 * // No match found
 * const notFound = Chunk.findLastIndex(chunk, (n) => n > 10)
 * console.log(notFound) // Option.none()
 *
 * // Find last even number index
 * const lastEven = Chunk.findLastIndex(chunk, (n) => n % 2 === 0)
 * console.log(lastEven) // Option.some(3)
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const findLastIndex: {
    /**
     * Return the last index for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLastIndex(chunk, (n) => n < 4)
     * console.log(result) // Option.some(2)
     *
     * // No match found
     * const notFound = Chunk.findLastIndex(chunk, (n) => n > 10)
     * console.log(notFound) // Option.none()
     *
     * // Find last even number index
     * const lastEven = Chunk.findLastIndex(chunk, (n) => n % 2 === 0)
     * console.log(lastEven) // Option.some(3)
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<A>): (self: Chunk<A>) => O.Option<number>;
    /**
     * Return the last index for which a predicate holds.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const result = Chunk.findLastIndex(chunk, (n) => n < 4)
     * console.log(result) // Option.some(2)
     *
     * // No match found
     * const notFound = Chunk.findLastIndex(chunk, (n) => n > 10)
     * console.log(notFound) // Option.none()
     *
     * // Find last even number index
     * const lastEven = Chunk.findLastIndex(chunk, (n) => n % 2 === 0)
     * console.log(lastEven) // Option.some(3)
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): O.Option<number>;
};
/**
 * Check if a predicate holds true for every `Chunk` element.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const allPositive = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
 * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
 *
 * // Empty chunk returns true
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.every(empty, (n) => n > 0)) // true
 *
 * // Type refinement
 * const mixed = Chunk.make(1, 2, 3)
 * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
 *   // mixed is now typed as Chunk<number>
 *   console.log("All elements are numbers")
 * }
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const every: {
    /**
     * Check if a predicate holds true for every `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const allPositive = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
     * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
     *
     * // Empty chunk returns true
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.every(empty, (n) => n > 0)) // true
     *
     * // Type refinement
     * const mixed = Chunk.make(1, 2, 3)
     * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
     *   // mixed is now typed as Chunk<number>
     *   console.log("All elements are numbers")
     * }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(refinement: Refinement<NoInfer<A>, B>): (self: Chunk<A>) => self is Chunk<B>;
    /**
     * Check if a predicate holds true for every `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const allPositive = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
     * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
     *
     * // Empty chunk returns true
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.every(empty, (n) => n > 0)) // true
     *
     * // Type refinement
     * const mixed = Chunk.make(1, 2, 3)
     * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
     *   // mixed is now typed as Chunk<number>
     *   console.log("All elements are numbers")
     * }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<A>): (self: Chunk<A>) => boolean;
    /**
     * Check if a predicate holds true for every `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const allPositive = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
     * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
     *
     * // Empty chunk returns true
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.every(empty, (n) => n > 0)) // true
     *
     * // Type refinement
     * const mixed = Chunk.make(1, 2, 3)
     * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
     *   // mixed is now typed as Chunk<number>
     *   console.log("All elements are numbers")
     * }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A, B extends A>(self: Chunk<A>, refinement: Refinement<A, B>): self is Chunk<B>;
    /**
     * Check if a predicate holds true for every `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const allPositive = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.every(allPositive, (n) => n > 0)) // true
     * console.log(Chunk.every(allPositive, (n) => n > 3)) // false
     *
     * // Empty chunk returns true
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.every(empty, (n) => n > 0)) // true
     *
     * // Type refinement
     * const mixed = Chunk.make(1, 2, 3)
     * if (Chunk.every(mixed, (x): x is number => typeof x === "number")) {
     *   // mixed is now typed as Chunk<number>
     *   console.log("All elements are numbers")
     * }
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): boolean;
};
/**
 * Check if a predicate holds true for some `Chunk` element.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * console.log(Chunk.some(chunk, (n) => n > 4)) // true
 * console.log(Chunk.some(chunk, (n) => n > 10)) // false
 *
 * // Empty chunk returns false
 * const empty = Chunk.empty<number>()
 * console.log(Chunk.some(empty, (n) => n > 0)) // false
 *
 * // Check for specific value
 * const words = Chunk.make("apple", "banana", "cherry")
 * console.log(Chunk.some(words, (word) => word.includes("ban"))) // true
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const some: {
    /**
     * Check if a predicate holds true for some `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.some(chunk, (n) => n > 4)) // true
     * console.log(Chunk.some(chunk, (n) => n > 10)) // false
     *
     * // Empty chunk returns false
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.some(empty, (n) => n > 0)) // false
     *
     * // Check for specific value
     * const words = Chunk.make("apple", "banana", "cherry")
     * console.log(Chunk.some(words, (word) => word.includes("ban"))) // true
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(predicate: Predicate<NoInfer<A>>): (self: Chunk<A>) => self is NonEmptyChunk<A>;
    /**
     * Check if a predicate holds true for some `Chunk` element.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * console.log(Chunk.some(chunk, (n) => n > 4)) // true
     * console.log(Chunk.some(chunk, (n) => n > 10)) // false
     *
     * // Empty chunk returns false
     * const empty = Chunk.empty<number>()
     * console.log(Chunk.some(empty, (n) => n > 0)) // false
     *
     * // Check for specific value
     * const words = Chunk.make("apple", "banana", "cherry")
     * console.log(Chunk.some(words, (word) => word.includes("ban"))) // true
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    <A>(self: Chunk<A>, predicate: Predicate<A>): self is NonEmptyChunk<A>;
};
/**
 * Joins the elements together with "sep" in the middle.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make("apple", "banana", "cherry")
 * const result = Chunk.join(chunk, ", ")
 * console.log(result) // "apple, banana, cherry"
 *
 * // With different separator
 * const withPipe = Chunk.join(chunk, " | ")
 * console.log(withPipe) // "apple | banana | cherry"
 *
 * // Empty chunk
 * const empty = Chunk.empty<string>()
 * console.log(Chunk.join(empty, ", ")) // ""
 *
 * // Single element
 * const single = Chunk.make("hello")
 * console.log(Chunk.join(single, ", ")) // "hello"
 * ```
 *
 * @category folding
 * @since 2.0.0
 */
export declare const join: {
    /**
     * Joins the elements together with "sep" in the middle.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("apple", "banana", "cherry")
     * const result = Chunk.join(chunk, ", ")
     * console.log(result) // "apple, banana, cherry"
     *
     * // With different separator
     * const withPipe = Chunk.join(chunk, " | ")
     * console.log(withPipe) // "apple | banana | cherry"
     *
     * // Empty chunk
     * const empty = Chunk.empty<string>()
     * console.log(Chunk.join(empty, ", ")) // ""
     *
     * // Single element
     * const single = Chunk.make("hello")
     * console.log(Chunk.join(single, ", ")) // "hello"
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    (sep: string): (self: Chunk<string>) => string;
    /**
     * Joins the elements together with "sep" in the middle.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make("apple", "banana", "cherry")
     * const result = Chunk.join(chunk, ", ")
     * console.log(result) // "apple, banana, cherry"
     *
     * // With different separator
     * const withPipe = Chunk.join(chunk, " | ")
     * console.log(withPipe) // "apple | banana | cherry"
     *
     * // Empty chunk
     * const empty = Chunk.empty<string>()
     * console.log(Chunk.join(empty, ", ")) // ""
     *
     * // Single element
     * const single = Chunk.make("hello")
     * console.log(Chunk.join(single, ", ")) // "hello"
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    (self: Chunk<string>, sep: string): string;
};
/**
 * Reduces the elements of a chunk from left to right.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4, 5)
 * const sum = Chunk.reduce(chunk, 0, (acc, n) => acc + n)
 * console.log(sum) // 15
 *
 * // String concatenation with index
 * const words = Chunk.make("a", "b", "c")
 * const result = Chunk.reduce(words, "", (acc, word, i) => acc + `${i}:${word} `)
 * console.log(result) // "0:a 1:b 2:c "
 *
 * // Find maximum
 * const max = Chunk.reduce(chunk, -Infinity, (acc, n) => Math.max(acc, n))
 * console.log(max) // 5
 * ```
 *
 * @category folding
 * @since 2.0.0
 */
export declare const reduce: {
    /**
     * Reduces the elements of a chunk from left to right.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const sum = Chunk.reduce(chunk, 0, (acc, n) => acc + n)
     * console.log(sum) // 15
     *
     * // String concatenation with index
     * const words = Chunk.make("a", "b", "c")
     * const result = Chunk.reduce(words, "", (acc, word, i) => acc + `${i}:${word} `)
     * console.log(result) // "0:a 1:b 2:c "
     *
     * // Find maximum
     * const max = Chunk.reduce(chunk, -Infinity, (acc, n) => Math.max(acc, n))
     * console.log(max) // 5
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A, i: number) => B): (self: Chunk<A>) => B;
    /**
     * Reduces the elements of a chunk from left to right.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4, 5)
     * const sum = Chunk.reduce(chunk, 0, (acc, n) => acc + n)
     * console.log(sum) // 15
     *
     * // String concatenation with index
     * const words = Chunk.make("a", "b", "c")
     * const result = Chunk.reduce(words, "", (acc, word, i) => acc + `${i}:${word} `)
     * console.log(result) // "0:a 1:b 2:c "
     *
     * // Find maximum
     * const max = Chunk.reduce(chunk, -Infinity, (acc, n) => Math.max(acc, n))
     * console.log(max) // 5
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, b: B, f: (b: B, a: A, i: number) => B): B;
};
/**
 * Reduces the elements of a chunk from right to left.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3, 4)
 * const result = Chunk.reduceRight(chunk, 0, (acc, n) => acc + n)
 * console.log(result) // 10
 *
 * // String building (right to left)
 * const words = Chunk.make("a", "b", "c")
 * const reversed = Chunk.reduceRight(
 *   words,
 *   "",
 *   (acc, word, i) => acc + `${i}:${word} `
 * )
 * console.log(reversed) // "2:c 1:b 0:a "
 *
 * // Subtract from right to left
 * const subtraction = Chunk.reduceRight(chunk, 0, (acc, n) => n - acc)
 * console.log(subtraction) // -2 (4 - (3 - (2 - (1 - 0))))
 * ```
 *
 * @category folding
 * @since 2.0.0
 */
export declare const reduceRight: {
    /**
     * Reduces the elements of a chunk from right to left.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     * const result = Chunk.reduceRight(chunk, 0, (acc, n) => acc + n)
     * console.log(result) // 10
     *
     * // String building (right to left)
     * const words = Chunk.make("a", "b", "c")
     * const reversed = Chunk.reduceRight(
     *   words,
     *   "",
     *   (acc, word, i) => acc + `${i}:${word} `
     * )
     * console.log(reversed) // "2:c 1:b 0:a "
     *
     * // Subtract from right to left
     * const subtraction = Chunk.reduceRight(chunk, 0, (acc, n) => n - acc)
     * console.log(subtraction) // -2 (4 - (3 - (2 - (1 - 0))))
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    <B, A>(b: B, f: (b: B, a: A, i: number) => B): (self: Chunk<A>) => B;
    /**
     * Reduces the elements of a chunk from right to left.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk = Chunk.make(1, 2, 3, 4)
     * const result = Chunk.reduceRight(chunk, 0, (acc, n) => acc + n)
     * console.log(result) // 10
     *
     * // String building (right to left)
     * const words = Chunk.make("a", "b", "c")
     * const reversed = Chunk.reduceRight(
     *   words,
     *   "",
     *   (acc, word, i) => acc + `${i}:${word} `
     * )
     * console.log(reversed) // "2:c 1:b 0:a "
     *
     * // Subtract from right to left
     * const subtraction = Chunk.reduceRight(chunk, 0, (acc, n) => n - acc)
     * console.log(subtraction) // -2 (4 - (3 - (2 - (1 - 0))))
     * ```
     *
     * @category folding
     * @since 2.0.0
     */
    <A, B>(self: Chunk<A>, b: B, f: (b: B, a: A, i: number) => B): B;
};
/**
 * Creates a `Chunk` of values not included in the other given `Chunk` using the provided `isEquivalent` function.
 * The order and references of result values are determined by the first `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make({ id: 1, name: "Alice" }, { id: 2, name: "Bob" })
 * const chunk2 = Chunk.make({ id: 1, name: "Alice" }, { id: 3, name: "Charlie" })
 *
 * // Custom equivalence by id
 * const byId = Chunk.differenceWith<{ id: number; name: string }>((a, b) =>
 *   a.id === b.id
 * )
 * const result = byId(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [{ id: 2, name: "Bob" }]
 *
 * // String comparison case-insensitive
 * const words1 = Chunk.make("Apple", "Banana", "Cherry")
 * const words2 = Chunk.make("apple", "grape")
 * const caseInsensitive = Chunk.differenceWith<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 * const wordDiff = caseInsensitive(words1, words2)
 * console.log(Chunk.toArray(wordDiff)) // ["Banana", "Cherry"]
 * ```
 *
 * @category filtering
 * @since 3.2.0
 */
export declare const differenceWith: <A>(isEquivalent: (self: A, that: A) => boolean) => {
    (that: Chunk<A>): (self: Chunk<A>) => Chunk<A>;
    (self: Chunk<A>, that: Chunk<A>): Chunk<A>;
};
/**
 * Creates a `Chunk` of values not included in the other given `Chunk`.
 * The order and references of result values are determined by the first `Chunk`.
 *
 * @example
 * ```ts
 * import { Chunk } from "effect"
 *
 * const chunk1 = Chunk.make(1, 2, 3, 4, 5)
 * const chunk2 = Chunk.make(3, 4, 6, 7)
 * const result = Chunk.difference(chunk1, chunk2)
 * console.log(Chunk.toArray(result)) // [1, 2, 5]
 *
 * // String difference
 * const words1 = Chunk.make("apple", "banana", "cherry")
 * const words2 = Chunk.make("banana", "grape")
 * const wordDiff = Chunk.difference(words1, words2)
 * console.log(Chunk.toArray(wordDiff)) // ["apple", "cherry"]
 *
 * // Empty second chunk returns original
 * const empty = Chunk.empty<number>()
 * const unchanged = Chunk.difference(chunk1, empty)
 * console.log(Chunk.toArray(unchanged)) // [1, 2, 3, 4, 5]
 * ```
 *
 * @category filtering
 * @since 3.2.0
 */
export declare const difference: {
    /**
     * Creates a `Chunk` of values not included in the other given `Chunk`.
     * The order and references of result values are determined by the first `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3, 4, 5)
     * const chunk2 = Chunk.make(3, 4, 6, 7)
     * const result = Chunk.difference(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [1, 2, 5]
     *
     * // String difference
     * const words1 = Chunk.make("apple", "banana", "cherry")
     * const words2 = Chunk.make("banana", "grape")
     * const wordDiff = Chunk.difference(words1, words2)
     * console.log(Chunk.toArray(wordDiff)) // ["apple", "cherry"]
     *
     * // Empty second chunk returns original
     * const empty = Chunk.empty<number>()
     * const unchanged = Chunk.difference(chunk1, empty)
     * console.log(Chunk.toArray(unchanged)) // [1, 2, 3, 4, 5]
     * ```
     *
     * @category filtering
     * @since 3.2.0
     */
    <A>(that: Chunk<A>): (self: Chunk<A>) => Chunk<A>;
    /**
     * Creates a `Chunk` of values not included in the other given `Chunk`.
     * The order and references of result values are determined by the first `Chunk`.
     *
     * @example
     * ```ts
     * import { Chunk } from "effect"
     *
     * const chunk1 = Chunk.make(1, 2, 3, 4, 5)
     * const chunk2 = Chunk.make(3, 4, 6, 7)
     * const result = Chunk.difference(chunk1, chunk2)
     * console.log(Chunk.toArray(result)) // [1, 2, 5]
     *
     * // String difference
     * const words1 = Chunk.make("apple", "banana", "cherry")
     * const words2 = Chunk.make("banana", "grape")
     * const wordDiff = Chunk.difference(words1, words2)
     * console.log(Chunk.toArray(wordDiff)) // ["apple", "cherry"]
     *
     * // Empty second chunk returns original
     * const empty = Chunk.empty<number>()
     * const unchanged = Chunk.difference(chunk1, empty)
     * console.log(Chunk.toArray(unchanged)) // [1, 2, 3, 4, 5]
     * ```
     *
     * @category filtering
     * @since 3.2.0
     */
    <A>(self: Chunk<A>, that: Chunk<A>): Chunk<A>;
};
export {};
//# sourceMappingURL=Chunk.d.ts.map