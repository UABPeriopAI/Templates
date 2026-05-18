import { type Inspectable } from "./Inspectable.ts";
import * as MutableHashMap from "./MutableHashMap.ts";
import type { Pipeable } from "./Pipeable.ts";
declare const TypeId = "~effect/collections/MutableHashSet";
/**
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * // Create a mutable hash set
 * const set: MutableHashSet.MutableHashSet<string> = MutableHashSet.make(
 *   "apple",
 *   "banana"
 * )
 *
 * // Add elements
 * MutableHashSet.add(set, "cherry")
 *
 * // Check if elements exist
 * console.log(MutableHashSet.has(set, "apple")) // true
 * console.log(MutableHashSet.has(set, "grape")) // false
 *
 * // Iterate over elements
 * for (const value of set) {
 *   console.log(value) // "apple", "banana", "cherry"
 * }
 *
 * // Get size
 * console.log(MutableHashSet.size(set)) // 3
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface MutableHashSet<out V> extends Iterable<V>, Pipeable, Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly keyMap: MutableHashMap.MutableHashMap<V, boolean>;
}
/**
 * Checks if the specified value is a `MutableHashSet`, `false` otherwise.
 *
 * @category refinements
 * @since 4.0.0
 */
export declare const isMutableHashSet: <V>(value: unknown) => value is MutableHashSet<V>;
/**
 * Creates an empty MutableHashSet.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.empty<string>()
 *
 * // Add some values
 * MutableHashSet.add(set, "apple")
 * MutableHashSet.add(set, "banana")
 * MutableHashSet.add(set, "apple") // Duplicate, no effect
 *
 * console.log(MutableHashSet.size(set)) // 2
 * console.log(Array.from(set)) // ["apple", "banana"]
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const empty: <K = never>() => MutableHashSet<K>;
/**
 * Creates a MutableHashSet from an iterable collection of values.
 * Duplicates are automatically removed.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const values = ["apple", "banana", "apple", "cherry", "banana"]
 * const set = MutableHashSet.fromIterable(values)
 *
 * console.log(MutableHashSet.size(set)) // 3
 * console.log(Array.from(set)) // ["apple", "banana", "cherry"]
 *
 * // Works with any iterable
 * const fromSet = MutableHashSet.fromIterable(new Set([1, 2, 3]))
 * console.log(MutableHashSet.size(fromSet)) // 3
 *
 * // From string characters
 * const fromString = MutableHashSet.fromIterable("hello")
 * console.log(Array.from(fromString)) // ["h", "e", "l", "o"]
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromIterable: <K = never>(keys: Iterable<K>) => MutableHashSet<K>;
/**
 * Creates a MutableHashSet from a variable number of values.
 * Duplicates are automatically removed.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.make("apple", "banana", "apple", "cherry")
 *
 * console.log(MutableHashSet.size(set)) // 3
 * console.log(Array.from(set)) // ["apple", "banana", "cherry"]
 *
 * // With numbers
 * const numbers = MutableHashSet.make(1, 2, 3, 2, 1)
 * console.log(MutableHashSet.size(numbers)) // 3
 * console.log(Array.from(numbers)) // [1, 2, 3]
 *
 * // Mixed types
 * const mixed = MutableHashSet.make("hello", 42, true, "hello")
 * console.log(MutableHashSet.size(mixed)) // 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <Keys extends ReadonlyArray<unknown>>(...keys: Keys) => MutableHashSet<Keys[number]>;
/**
 * Adds a value to the MutableHashSet, mutating the set in place.
 * If the value already exists, the set remains unchanged.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.empty<string>()
 *
 * // Add new values
 * MutableHashSet.add(set, "apple")
 * MutableHashSet.add(set, "banana")
 *
 * console.log(MutableHashSet.size(set)) // 2
 * console.log(MutableHashSet.has(set, "apple")) // true
 *
 * // Add duplicate (no effect)
 * MutableHashSet.add(set, "apple")
 * console.log(MutableHashSet.size(set)) // 2
 *
 * // Pipe-able version
 * const addFruit = MutableHashSet.add("cherry")
 * addFruit(set)
 * console.log(MutableHashSet.size(set)) // 3
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export declare const add: {
    /**
     * Adds a value to the MutableHashSet, mutating the set in place.
     * If the value already exists, the set remains unchanged.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.empty<string>()
     *
     * // Add new values
     * MutableHashSet.add(set, "apple")
     * MutableHashSet.add(set, "banana")
     *
     * console.log(MutableHashSet.size(set)) // 2
     * console.log(MutableHashSet.has(set, "apple")) // true
     *
     * // Add duplicate (no effect)
     * MutableHashSet.add(set, "apple")
     * console.log(MutableHashSet.size(set)) // 2
     *
     * // Pipe-able version
     * const addFruit = MutableHashSet.add("cherry")
     * addFruit(set)
     * console.log(MutableHashSet.size(set)) // 3
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(key: V): (self: MutableHashSet<V>) => MutableHashSet<V>;
    /**
     * Adds a value to the MutableHashSet, mutating the set in place.
     * If the value already exists, the set remains unchanged.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.empty<string>()
     *
     * // Add new values
     * MutableHashSet.add(set, "apple")
     * MutableHashSet.add(set, "banana")
     *
     * console.log(MutableHashSet.size(set)) // 2
     * console.log(MutableHashSet.has(set, "apple")) // true
     *
     * // Add duplicate (no effect)
     * MutableHashSet.add(set, "apple")
     * console.log(MutableHashSet.size(set)) // 2
     *
     * // Pipe-able version
     * const addFruit = MutableHashSet.add("cherry")
     * addFruit(set)
     * console.log(MutableHashSet.size(set)) // 3
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(self: MutableHashSet<V>, key: V): MutableHashSet<V>;
};
/**
 * Checks if the MutableHashSet contains the specified value.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.make("apple", "banana", "cherry")
 *
 * console.log(MutableHashSet.has(set, "apple")) // true
 * console.log(MutableHashSet.has(set, "grape")) // false
 *
 * // Pipe-able version
 * const hasApple = MutableHashSet.has("apple")
 * console.log(hasApple(set)) // true
 *
 * // Check after adding
 * MutableHashSet.add(set, "grape")
 * console.log(MutableHashSet.has(set, "grape")) // true
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const has: {
    /**
     * Checks if the MutableHashSet contains the specified value.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.make("apple", "banana", "cherry")
     *
     * console.log(MutableHashSet.has(set, "apple")) // true
     * console.log(MutableHashSet.has(set, "grape")) // false
     *
     * // Pipe-able version
     * const hasApple = MutableHashSet.has("apple")
     * console.log(hasApple(set)) // true
     *
     * // Check after adding
     * MutableHashSet.add(set, "grape")
     * console.log(MutableHashSet.has(set, "grape")) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(key: V): (self: MutableHashSet<V>) => boolean;
    /**
     * Checks if the MutableHashSet contains the specified value.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.make("apple", "banana", "cherry")
     *
     * console.log(MutableHashSet.has(set, "apple")) // true
     * console.log(MutableHashSet.has(set, "grape")) // false
     *
     * // Pipe-able version
     * const hasApple = MutableHashSet.has("apple")
     * console.log(hasApple(set)) // true
     *
     * // Check after adding
     * MutableHashSet.add(set, "grape")
     * console.log(MutableHashSet.has(set, "grape")) // true
     * ```
     *
     * @since 2.0.0
     * @category elements
     */
    <V>(self: MutableHashSet<V>, key: V): boolean;
};
/**
 * Removes the specified value from the MutableHashSet, mutating the set in place.
 * If the value doesn't exist, the set remains unchanged.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.make("apple", "banana", "cherry")
 *
 * console.log(MutableHashSet.size(set)) // 3
 *
 * // Remove existing value
 * MutableHashSet.remove(set, "banana")
 * console.log(MutableHashSet.size(set)) // 2
 * console.log(MutableHashSet.has(set, "banana")) // false
 *
 * // Remove non-existent value (no effect)
 * MutableHashSet.remove(set, "grape")
 * console.log(MutableHashSet.size(set)) // 2
 *
 * // Pipe-able version
 * const removeFruit = MutableHashSet.remove("apple")
 * removeFruit(set)
 * console.log(MutableHashSet.size(set)) // 1
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export declare const remove: {
    /**
     * Removes the specified value from the MutableHashSet, mutating the set in place.
     * If the value doesn't exist, the set remains unchanged.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.make("apple", "banana", "cherry")
     *
     * console.log(MutableHashSet.size(set)) // 3
     *
     * // Remove existing value
     * MutableHashSet.remove(set, "banana")
     * console.log(MutableHashSet.size(set)) // 2
     * console.log(MutableHashSet.has(set, "banana")) // false
     *
     * // Remove non-existent value (no effect)
     * MutableHashSet.remove(set, "grape")
     * console.log(MutableHashSet.size(set)) // 2
     *
     * // Pipe-able version
     * const removeFruit = MutableHashSet.remove("apple")
     * removeFruit(set)
     * console.log(MutableHashSet.size(set)) // 1
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(key: V): (self: MutableHashSet<V>) => MutableHashSet<V>;
    /**
     * Removes the specified value from the MutableHashSet, mutating the set in place.
     * If the value doesn't exist, the set remains unchanged.
     *
     * @example
     * ```ts
     * import { MutableHashSet } from "effect"
     *
     * const set = MutableHashSet.make("apple", "banana", "cherry")
     *
     * console.log(MutableHashSet.size(set)) // 3
     *
     * // Remove existing value
     * MutableHashSet.remove(set, "banana")
     * console.log(MutableHashSet.size(set)) // 2
     * console.log(MutableHashSet.has(set, "banana")) // false
     *
     * // Remove non-existent value (no effect)
     * MutableHashSet.remove(set, "grape")
     * console.log(MutableHashSet.size(set)) // 2
     *
     * // Pipe-able version
     * const removeFruit = MutableHashSet.remove("apple")
     * removeFruit(set)
     * console.log(MutableHashSet.size(set)) // 1
     * ```
     *
     * @since 2.0.0
     * @category mutations
     */
    <V>(self: MutableHashSet<V>, key: V): MutableHashSet<V>;
};
/**
 * Returns the number of unique values in the MutableHashSet.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.empty<string>()
 * console.log(MutableHashSet.size(set)) // 0
 *
 * MutableHashSet.add(set, "apple")
 * MutableHashSet.add(set, "banana")
 * MutableHashSet.add(set, "apple") // Duplicate
 * console.log(MutableHashSet.size(set)) // 2
 *
 * MutableHashSet.remove(set, "apple")
 * console.log(MutableHashSet.size(set)) // 1
 *
 * MutableHashSet.clear(set)
 * console.log(MutableHashSet.size(set)) // 0
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export declare const size: <V>(self: MutableHashSet<V>) => number;
/**
 * Removes all values from the MutableHashSet, mutating the set in place.
 * The set becomes empty after this operation.
 *
 * @example
 * ```ts
 * import { MutableHashSet } from "effect"
 *
 * const set = MutableHashSet.make("apple", "banana", "cherry")
 *
 * console.log(MutableHashSet.size(set)) // 3
 *
 * // Clear all values
 * MutableHashSet.clear(set)
 *
 * console.log(MutableHashSet.size(set)) // 0
 * console.log(MutableHashSet.has(set, "apple")) // false
 * console.log(Array.from(set)) // []
 *
 * // Can still add new values after clearing
 * MutableHashSet.add(set, "new")
 * console.log(MutableHashSet.size(set)) // 1
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export declare const clear: <V>(self: MutableHashSet<V>) => MutableHashSet<V>;
export {};
//# sourceMappingURL=MutableHashSet.d.ts.map