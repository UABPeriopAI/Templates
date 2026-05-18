/**
 * @since 2.0.0
 */
import type { Equal } from "./Equal.ts";
import type { Inspectable } from "./Inspectable.ts";
import type { Pipeable } from "./Pipeable.ts";
import type { Predicate, Refinement } from "./Predicate.ts";
import type { NoInfer } from "./Types.ts";
declare const TypeId = "~effect/collections/HashSet";
/**
 * A HashSet is an immutable set data structure that provides efficient storage
 * and retrieval of unique values. It uses a HashMap internally for optimal performance.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * // Create a HashSet
 * const set = HashSet.make("apple", "banana", "cherry")
 *
 * // Check membership
 * console.log(HashSet.has(set, "apple")) // true
 * console.log(HashSet.has(set, "grape")) // false
 *
 * // Add values (returns new HashSet)
 * const updated = HashSet.add(set, "grape")
 * console.log(HashSet.size(updated)) // 4
 *
 * // Remove values (returns new HashSet)
 * const smaller = HashSet.remove(set, "banana")
 * console.log(HashSet.size(smaller)) // 2
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface HashSet<out Value> extends Iterable<Value>, Equal, Pipeable, Inspectable {
    readonly [TypeId]: typeof TypeId;
}
/**
 * The HashSet namespace contains type-level utilities and helper types
 * for working with HashSet instances.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * // Create a concrete HashSet for type extraction
 * const fruits = HashSet.make("apple", "banana", "cherry")
 *
 * // Extract the value type for reuse
 * type Fruit = HashSet.HashSet.Value<typeof fruits> // string
 *
 * // Use extracted type in functions
 * const processFruit = (fruit: Fruit) => {
 *   return `Processing ${fruit}`
 * }
 * ```
 *
 * @since 2.0.0
 * @category namespace
 */
export declare namespace HashSet {
    /**
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5)
     *
     * // Extract the value type
     * type NumberType = HashSet.HashSet.Value<typeof numbers> // number
     *
     * const processNumber = (n: NumberType) => n * 2
     * ```
     *
     * @since 2.0.0
     * @category type-level
     */
    type Value<T> = T extends HashSet<infer V> ? V : never;
}
/**
 * Creates an empty HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.empty<string>()
 *
 * console.log(HashSet.size(set)) // 0
 * console.log(HashSet.isEmpty(set)) // true
 *
 * // Add some values
 * const withValues = HashSet.add(HashSet.add(set, "hello"), "world")
 * console.log(HashSet.size(withValues)) // 2
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const empty: <V = never>() => HashSet<V>;
/**
 * Creates a HashSet from a variable number of values.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const fruits = HashSet.make("apple", "banana", "cherry")
 * console.log(HashSet.size(fruits)) // 3
 *
 * const numbers = HashSet.make(1, 2, 3, 2, 1) // Duplicates ignored
 * console.log(HashSet.size(numbers)) // 3
 *
 * const mixed = HashSet.make("hello", 42, true)
 * console.log(HashSet.size(mixed)) // 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <Values extends ReadonlyArray<any>>(...values: Values) => HashSet<Values[number]>;
/**
 * Creates a HashSet from an iterable collection of values.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const fromArray = HashSet.fromIterable(["a", "b", "c", "b", "a"])
 * console.log(HashSet.size(fromArray)) // 3
 *
 * const fromSet = HashSet.fromIterable(new Set([1, 2, 3]))
 * console.log(HashSet.size(fromSet)) // 3
 *
 * const fromString = HashSet.fromIterable("hello")
 * console.log(Array.from(fromString)) // ["h", "e", "l", "o"]
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromIterable: <V>(values: Iterable<V>) => HashSet<V>;
/**
 * Checks if a value is a HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.make(1, 2, 3)
 * const array = [1, 2, 3]
 *
 * console.log(HashSet.isHashSet(set)) // true
 * console.log(HashSet.isHashSet(array)) // false
 * console.log(HashSet.isHashSet(null)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isHashSet: {
    /**
     * Checks if a value is a HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make(1, 2, 3)
     * const array = [1, 2, 3]
     *
     * console.log(HashSet.isHashSet(set)) // true
     * console.log(HashSet.isHashSet(array)) // false
     * console.log(HashSet.isHashSet(null)) // false
     * ```
     *
     * @since 2.0.0
     * @category guards
     */
    <V>(u: Iterable<V>): u is HashSet<V>;
    /**
     * Checks if a value is a HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make(1, 2, 3)
     * const array = [1, 2, 3]
     *
     * console.log(HashSet.isHashSet(set)) // true
     * console.log(HashSet.isHashSet(array)) // false
     * console.log(HashSet.isHashSet(null)) // false
     * ```
     *
     * @since 2.0.0
     * @category guards
     */
    (u: unknown): u is HashSet<unknown>;
};
/**
 * Adds a value to the HashSet, returning a new HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.make("a", "b")
 * const withC = HashSet.add(set, "c")
 *
 * console.log(HashSet.size(set)) // 2 (original unchanged)
 * console.log(HashSet.size(withC)) // 3
 * console.log(HashSet.has(withC, "c")) // true
 *
 * // Adding existing value has no effect
 * const same = HashSet.add(set, "a")
 * console.log(HashSet.size(same)) // 2
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export declare const add: {
    /**
     * Adds a value to the HashSet, returning a new HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make("a", "b")
     * const withC = HashSet.add(set, "c")
     *
     * console.log(HashSet.size(set)) // 2 (original unchanged)
     * console.log(HashSet.size(withC)) // 3
     * console.log(HashSet.has(withC, "c")) // true
     *
     * // Adding existing value has no effect
     * const same = HashSet.add(set, "a")
     * console.log(HashSet.size(same)) // 2
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(value: V): (self: HashSet<V>) => HashSet<V>;
    /**
     * Adds a value to the HashSet, returning a new HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make("a", "b")
     * const withC = HashSet.add(set, "c")
     *
     * console.log(HashSet.size(set)) // 2 (original unchanged)
     * console.log(HashSet.size(withC)) // 3
     * console.log(HashSet.has(withC, "c")) // true
     *
     * // Adding existing value has no effect
     * const same = HashSet.add(set, "a")
     * console.log(HashSet.size(same)) // 2
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(self: HashSet<V>, value: V): HashSet<V>;
};
/**
 * Checks if the HashSet contains the specified value.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet" // false
 *
 * // Works with any type that implements Equal
 * import { Equal, Hash } from "effect"
 *
 * const set = HashSet.make("apple", "banana", "cherry")
 *
 * console.log(HashSet.has(set, "apple")) // true
 * console.log(HashSet.has(set, "grape"))
 *
 * class Person implements Equal.Equal {
 *   constructor(readonly name: string) {}
 *
 *   [Equal.symbol](other: unknown) {
 *     return other instanceof Person && this.name === other.name
 *   }
 *
 *   [Hash.symbol](): number {
 *     return Hash.string(this.name)
 *   }
 * }
 *
 * const people = HashSet.make(new Person("Alice"), new Person("Bob"))
 * console.log(HashSet.has(people, new Person("Alice"))) // true
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const has: {
    /**
     * Checks if the HashSet contains the specified value.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet" // false
     *
     * // Works with any type that implements Equal
     * import { Equal, Hash } from "effect"
     *
     * const set = HashSet.make("apple", "banana", "cherry")
     *
     * console.log(HashSet.has(set, "apple")) // true
     * console.log(HashSet.has(set, "grape"))
     *
     * class Person implements Equal.Equal {
     *   constructor(readonly name: string) {}
     *
     *   [Equal.symbol](other: unknown) {
     *     return other instanceof Person && this.name === other.name
     *   }
     *
     *   [Hash.symbol](): number {
     *     return Hash.string(this.name)
     *   }
     * }
     *
     * const people = HashSet.make(new Person("Alice"), new Person("Bob"))
     * console.log(HashSet.has(people, new Person("Alice"))) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(value: V): (self: HashSet<V>) => boolean;
    /**
     * Checks if the HashSet contains the specified value.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet" // false
     *
     * // Works with any type that implements Equal
     * import { Equal, Hash } from "effect"
     *
     * const set = HashSet.make("apple", "banana", "cherry")
     *
     * console.log(HashSet.has(set, "apple")) // true
     * console.log(HashSet.has(set, "grape"))
     *
     * class Person implements Equal.Equal {
     *   constructor(readonly name: string) {}
     *
     *   [Equal.symbol](other: unknown) {
     *     return other instanceof Person && this.name === other.name
     *   }
     *
     *   [Hash.symbol](): number {
     *     return Hash.string(this.name)
     *   }
     * }
     *
     * const people = HashSet.make(new Person("Alice"), new Person("Bob"))
     * console.log(HashSet.has(people, new Person("Alice"))) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(self: HashSet<V>, value: V): boolean;
};
/**
 * Removes a value from the HashSet, returning a new HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set = HashSet.make("a", "b", "c")
 * const withoutB = HashSet.remove(set, "b")
 *
 * console.log(HashSet.size(set)) // 3 (original unchanged)
 * console.log(HashSet.size(withoutB)) // 2
 * console.log(HashSet.has(withoutB, "b")) // false
 *
 * // Removing non-existent value has no effect
 * const same = HashSet.remove(set, "d")
 * console.log(HashSet.size(same)) // 3
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export declare const remove: {
    /**
     * Removes a value from the HashSet, returning a new HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make("a", "b", "c")
     * const withoutB = HashSet.remove(set, "b")
     *
     * console.log(HashSet.size(set)) // 3 (original unchanged)
     * console.log(HashSet.size(withoutB)) // 2
     * console.log(HashSet.has(withoutB, "b")) // false
     *
     * // Removing non-existent value has no effect
     * const same = HashSet.remove(set, "d")
     * console.log(HashSet.size(same)) // 3
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(value: V): (self: HashSet<V>) => HashSet<V>;
    /**
     * Removes a value from the HashSet, returning a new HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set = HashSet.make("a", "b", "c")
     * const withoutB = HashSet.remove(set, "b")
     *
     * console.log(HashSet.size(set)) // 3 (original unchanged)
     * console.log(HashSet.size(withoutB)) // 2
     * console.log(HashSet.has(withoutB, "b")) // false
     *
     * // Removing non-existent value has no effect
     * const same = HashSet.remove(set, "d")
     * console.log(HashSet.size(same)) // 3
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(self: HashSet<V>, value: V): HashSet<V>;
};
/**
 * Returns the number of values in the HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const empty = HashSet.empty<string>()
 * console.log(HashSet.size(empty)) // 0
 *
 * const small = HashSet.make("a", "b")
 * console.log(HashSet.size(small)) // 2
 *
 * const withDuplicates = HashSet.fromIterable(["x", "y", "z", "x", "y"])
 * console.log(HashSet.size(withDuplicates)) // 3
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const size: <V>(self: HashSet<V>) => number;
/**
 * Checks if the HashSet is empty.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const empty = HashSet.empty<string>()
 * console.log(HashSet.isEmpty(empty)) // true
 *
 * const nonEmpty = HashSet.make("a")
 * console.log(HashSet.isEmpty(nonEmpty)) // false
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const isEmpty: <V>(self: HashSet<V>) => boolean;
/**
 * Creates the union of two HashSets.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set1 = HashSet.make("a", "b")
 * const set2 = HashSet.make("b", "c")
 * const combined = HashSet.union(set1, set2)
 *
 * console.log(Array.from(combined).sort()) // ["a", "b", "c"]
 * console.log(HashSet.size(combined)) // 3
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const union: {
    /**
     * Creates the union of two HashSets.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b")
     * const set2 = HashSet.make("b", "c")
     * const combined = HashSet.union(set1, set2)
     *
     * console.log(Array.from(combined).sort()) // ["a", "b", "c"]
     * console.log(HashSet.size(combined)) // 3
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V1>(that: HashSet<V1>): <V0>(self: HashSet<V0>) => HashSet<V1 | V0>;
    /**
     * Creates the union of two HashSets.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b")
     * const set2 = HashSet.make("b", "c")
     * const combined = HashSet.union(set1, set2)
     *
     * console.log(Array.from(combined).sort()) // ["a", "b", "c"]
     * console.log(HashSet.size(combined)) // 3
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V0, V1>(self: HashSet<V0>, that: HashSet<V1>): HashSet<V0 | V1>;
};
/**
 * Creates the intersection of two HashSets.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set1 = HashSet.make("a", "b", "c")
 * const set2 = HashSet.make("b", "c", "d")
 * const common = HashSet.intersection(set1, set2)
 *
 * console.log(Array.from(common).sort()) // ["b", "c"]
 * console.log(HashSet.size(common)) // 2
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const intersection: {
    /**
     * Creates the intersection of two HashSets.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b", "c")
     * const set2 = HashSet.make("b", "c", "d")
     * const common = HashSet.intersection(set1, set2)
     *
     * console.log(Array.from(common).sort()) // ["b", "c"]
     * console.log(HashSet.size(common)) // 2
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V1>(that: HashSet<V1>): <V0>(self: HashSet<V0>) => HashSet<V1 & V0>;
    /**
     * Creates the intersection of two HashSets.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b", "c")
     * const set2 = HashSet.make("b", "c", "d")
     * const common = HashSet.intersection(set1, set2)
     *
     * console.log(Array.from(common).sort()) // ["b", "c"]
     * console.log(HashSet.size(common)) // 2
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V0, V1>(self: HashSet<V0>, that: HashSet<V1>): HashSet<V0 & V1>;
};
/**
 * Creates the difference of two HashSets (elements in the first set that are not in the second).
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const set1 = HashSet.make("a", "b", "c")
 * const set2 = HashSet.make("b", "d")
 * const diff = HashSet.difference(set1, set2)
 *
 * console.log(Array.from(diff).sort()) // ["a", "c"]
 * console.log(HashSet.size(diff)) // 2
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const difference: {
    /**
     * Creates the difference of two HashSets (elements in the first set that are not in the second).
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b", "c")
     * const set2 = HashSet.make("b", "d")
     * const diff = HashSet.difference(set1, set2)
     *
     * console.log(Array.from(diff).sort()) // ["a", "c"]
     * console.log(HashSet.size(diff)) // 2
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V1>(that: HashSet<V1>): <V0>(self: HashSet<V0>) => HashSet<V0>;
    /**
     * Creates the difference of two HashSets (elements in the first set that are not in the second).
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const set1 = HashSet.make("a", "b", "c")
     * const set2 = HashSet.make("b", "d")
     * const diff = HashSet.difference(set1, set2)
     *
     * console.log(Array.from(diff).sort()) // ["a", "c"]
     * console.log(HashSet.size(diff)) // 2
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <V0, V1>(self: HashSet<V0>, that: HashSet<V1>): HashSet<V0>;
};
/**
 * Checks if a HashSet is a subset of another HashSet.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const small = HashSet.make("a", "b")
 * const large = HashSet.make("a", "b", "c", "d")
 * const other = HashSet.make("x", "y")
 *
 * console.log(HashSet.isSubset(small, large)) // true
 * console.log(HashSet.isSubset(large, small)) // false
 * console.log(HashSet.isSubset(small, other)) // false
 * console.log(HashSet.isSubset(small, small)) // true
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const isSubset: {
    /**
     * Checks if a HashSet is a subset of another HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const small = HashSet.make("a", "b")
     * const large = HashSet.make("a", "b", "c", "d")
     * const other = HashSet.make("x", "y")
     *
     * console.log(HashSet.isSubset(small, large)) // true
     * console.log(HashSet.isSubset(large, small)) // false
     * console.log(HashSet.isSubset(small, other)) // false
     * console.log(HashSet.isSubset(small, small)) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V1>(that: HashSet<V1>): <V0>(self: HashSet<V0>) => boolean;
    /**
     * Checks if a HashSet is a subset of another HashSet.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const small = HashSet.make("a", "b")
     * const large = HashSet.make("a", "b", "c", "d")
     * const other = HashSet.make("x", "y")
     *
     * console.log(HashSet.isSubset(small, large)) // true
     * console.log(HashSet.isSubset(large, small)) // false
     * console.log(HashSet.isSubset(small, other)) // false
     * console.log(HashSet.isSubset(small, small)) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V0, V1>(self: HashSet<V0>, that: HashSet<V1>): boolean;
};
/**
 * Maps each value in the HashSet using the provided function.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3)
 * const doubled = HashSet.map(numbers, (n) => n * 2)
 *
 * console.log(Array.from(doubled).sort()) // [2, 4, 6]
 * console.log(HashSet.size(doubled)) // 3
 *
 * // Mapping can reduce size if function produces duplicates
 * const strings = HashSet.make("apple", "banana", "cherry")
 * const lengths = HashSet.map(strings, (s) => s.length)
 * console.log(Array.from(lengths).sort()) // [5, 6] (apple=5, banana=6, cherry=6)
 * ```
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const map: {
    /**
     * Maps each value in the HashSet using the provided function.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3)
     * const doubled = HashSet.map(numbers, (n) => n * 2)
     *
     * console.log(Array.from(doubled).sort()) // [2, 4, 6]
     * console.log(HashSet.size(doubled)) // 3
     *
     * // Mapping can reduce size if function produces duplicates
     * const strings = HashSet.make("apple", "banana", "cherry")
     * const lengths = HashSet.map(strings, (s) => s.length)
     * console.log(Array.from(lengths).sort()) // [5, 6] (apple=5, banana=6, cherry=6)
     * ```
     *
     * @since 2.0.0
     * @category mapping
     */
    <V, U>(f: (value: V) => U): (self: HashSet<V>) => HashSet<U>;
    /**
     * Maps each value in the HashSet using the provided function.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3)
     * const doubled = HashSet.map(numbers, (n) => n * 2)
     *
     * console.log(Array.from(doubled).sort()) // [2, 4, 6]
     * console.log(HashSet.size(doubled)) // 3
     *
     * // Mapping can reduce size if function produces duplicates
     * const strings = HashSet.make("apple", "banana", "cherry")
     * const lengths = HashSet.map(strings, (s) => s.length)
     * console.log(Array.from(lengths).sort()) // [5, 6] (apple=5, banana=6, cherry=6)
     * ```
     *
     * @since 2.0.0
     * @category mapping
     */
    <V, U>(self: HashSet<V>, f: (value: V) => U): HashSet<U>;
};
/**
 * Filters the HashSet keeping only values that satisfy the predicate.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3, 4, 5, 6)
 * const evens = HashSet.filter(numbers, (n) => n % 2 === 0)
 *
 * console.log(Array.from(evens).sort()) // [2, 4, 6]
 * console.log(HashSet.size(evens)) // 3
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export declare const filter: {
    /**
     * Filters the HashSet keeping only values that satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5, 6)
     * const evens = HashSet.filter(numbers, (n) => n % 2 === 0)
     *
     * console.log(Array.from(evens).sort()) // [2, 4, 6]
     * console.log(HashSet.size(evens)) // 3
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <V, U extends V>(refinement: Refinement<NoInfer<V>, U>): (self: HashSet<V>) => HashSet<U>;
    /**
     * Filters the HashSet keeping only values that satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5, 6)
     * const evens = HashSet.filter(numbers, (n) => n % 2 === 0)
     *
     * console.log(Array.from(evens).sort()) // [2, 4, 6]
     * console.log(HashSet.size(evens)) // 3
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <V>(predicate: Predicate<NoInfer<V>>): (self: HashSet<V>) => HashSet<V>;
    /**
     * Filters the HashSet keeping only values that satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5, 6)
     * const evens = HashSet.filter(numbers, (n) => n % 2 === 0)
     *
     * console.log(Array.from(evens).sort()) // [2, 4, 6]
     * console.log(HashSet.size(evens)) // 3
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <V, U extends V>(self: HashSet<V>, refinement: Refinement<V, U>): HashSet<U>;
    /**
     * Filters the HashSet keeping only values that satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5, 6)
     * const evens = HashSet.filter(numbers, (n) => n % 2 === 0)
     *
     * console.log(Array.from(evens).sort()) // [2, 4, 6]
     * console.log(HashSet.size(evens)) // 3
     * ```
     *
     * @since 2.0.0
     * @category filtering
     */
    <V>(self: HashSet<V>, predicate: Predicate<V>): HashSet<V>;
};
/**
 * Tests whether at least one value in the HashSet satisfies the predicate.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3, 4, 5)
 *
 * console.log(HashSet.some(numbers, (n) => n > 3)) // true
 * console.log(HashSet.some(numbers, (n) => n > 10)) // false
 *
 * const empty = HashSet.empty<number>()
 * console.log(HashSet.some(empty, (n) => n > 0)) // false
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const some: {
    /**
     * Tests whether at least one value in the HashSet satisfies the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5)
     *
     * console.log(HashSet.some(numbers, (n) => n > 3)) // true
     * console.log(HashSet.some(numbers, (n) => n > 10)) // false
     *
     * const empty = HashSet.empty<number>()
     * console.log(HashSet.some(empty, (n) => n > 0)) // false
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(predicate: Predicate<V>): (self: HashSet<V>) => boolean;
    /**
     * Tests whether at least one value in the HashSet satisfies the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5)
     *
     * console.log(HashSet.some(numbers, (n) => n > 3)) // true
     * console.log(HashSet.some(numbers, (n) => n > 10)) // false
     *
     * const empty = HashSet.empty<number>()
     * console.log(HashSet.some(empty, (n) => n > 0)) // false
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(self: HashSet<V>, predicate: Predicate<V>): boolean;
};
/**
 * Tests whether all values in the HashSet satisfy the predicate.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(2, 4, 6, 8)
 *
 * console.log(HashSet.every(numbers, (n) => n % 2 === 0)) // true
 * console.log(HashSet.every(numbers, (n) => n > 5)) // false
 *
 * const empty = HashSet.empty<number>()
 * console.log(HashSet.every(empty, (n) => n > 0)) // true (vacuously true)
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const every: {
    /**
     * Tests whether all values in the HashSet satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(2, 4, 6, 8)
     *
     * console.log(HashSet.every(numbers, (n) => n % 2 === 0)) // true
     * console.log(HashSet.every(numbers, (n) => n > 5)) // false
     *
     * const empty = HashSet.empty<number>()
     * console.log(HashSet.every(empty, (n) => n > 0)) // true (vacuously true)
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(predicate: Predicate<V>): (self: HashSet<V>) => boolean;
    /**
     * Tests whether all values in the HashSet satisfy the predicate.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(2, 4, 6, 8)
     *
     * console.log(HashSet.every(numbers, (n) => n % 2 === 0)) // true
     * console.log(HashSet.every(numbers, (n) => n > 5)) // false
     *
     * const empty = HashSet.empty<number>()
     * console.log(HashSet.every(empty, (n) => n > 0)) // true (vacuously true)
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(self: HashSet<V>, predicate: Predicate<V>): boolean;
};
/**
 * Reduces the HashSet to a single value by iterating through the values and applying an accumulator function.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 *
 * const numbers = HashSet.make(1, 2, 3, 4, 5)
 * const sum = HashSet.reduce(numbers, 0, (acc, n) => acc + n)
 *
 * console.log(sum) // 15
 *
 * const strings = HashSet.make("a", "b", "c")
 * const concatenated = HashSet.reduce(strings, "", (acc, s) => acc + s)
 * console.log(concatenated) // Order may vary: "abc", "bac", etc.
 * ```
 *
 * @since 2.0.0
 * @category folding
 */
export declare const reduce: {
    /**
     * Reduces the HashSet to a single value by iterating through the values and applying an accumulator function.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5)
     * const sum = HashSet.reduce(numbers, 0, (acc, n) => acc + n)
     *
     * console.log(sum) // 15
     *
     * const strings = HashSet.make("a", "b", "c")
     * const concatenated = HashSet.reduce(strings, "", (acc, s) => acc + s)
     * console.log(concatenated) // Order may vary: "abc", "bac", etc.
     * ```
     *
     * @since 2.0.0
     * @category folding
     */
    <V, U>(zero: U, f: (accumulator: U, value: V) => U): (self: HashSet<V>) => U;
    /**
     * Reduces the HashSet to a single value by iterating through the values and applying an accumulator function.
     *
     * @example
     * ```ts
     * import * as HashSet from "effect/HashSet"
     *
     * const numbers = HashSet.make(1, 2, 3, 4, 5)
     * const sum = HashSet.reduce(numbers, 0, (acc, n) => acc + n)
     *
     * console.log(sum) // 15
     *
     * const strings = HashSet.make("a", "b", "c")
     * const concatenated = HashSet.reduce(strings, "", (acc, s) => acc + s)
     * console.log(concatenated) // Order may vary: "abc", "bac", etc.
     * ```
     *
     * @since 2.0.0
     * @category folding
     */
    <V, U>(self: HashSet<V>, zero: U, f: (accumulator: U, value: V) => U): U;
};
export {};
//# sourceMappingURL=HashSet.d.ts.map