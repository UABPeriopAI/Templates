/**
 * @since 2.0.0
 */
import * as Dual from "./Function.js";
import * as internal from "./internal/hashSet.js";
const TypeId = internal.HashSetTypeId;
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
export const empty = internal.empty;
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
export const make = internal.make;
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
export const fromIterable = internal.fromIterable;
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
export const isHashSet = internal.isHashSet;
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
export const add = /*#__PURE__*/Dual.dual(2, internal.add);
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
export const has = /*#__PURE__*/Dual.dual(2, internal.has);
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
export const remove = /*#__PURE__*/Dual.dual(2, internal.remove);
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
export const size = internal.size;
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
export const isEmpty = internal.isEmpty;
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
export const union = /*#__PURE__*/Dual.dual(2, internal.union);
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
export const intersection = /*#__PURE__*/Dual.dual(2, internal.intersection);
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
export const difference = /*#__PURE__*/Dual.dual(2, internal.difference);
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
export const isSubset = /*#__PURE__*/Dual.dual(2, internal.isSubset);
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
export const map = /*#__PURE__*/Dual.dual(2, internal.map);
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
export const filter = /*#__PURE__*/Dual.dual(2, internal.filter);
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
export const some = /*#__PURE__*/Dual.dual(2, internal.some);
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
export const every = /*#__PURE__*/Dual.dual(2, internal.every);
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
export const reduce = /*#__PURE__*/Dual.dual(3, internal.reduce);
//# sourceMappingURL=HashSet.js.map