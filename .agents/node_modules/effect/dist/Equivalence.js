/**
 * Utilities for defining equivalence relations - binary relations that determine when two values
 * should be considered equivalent. Equivalence relations are used for comparing, deduplicating,
 * and organizing data in collections and data structures.
 *
 * ## Mental model
 *
 * - **Equivalence relation**: A function `(a: A, b: A) => boolean` that returns `true` when values are equivalent
 * - **Reflexive property**: Every value is equivalent to itself (`eq(a, a) === true`)
 * - **Symmetric property**: If `a` is equivalent to `b`, then `b` is equivalent to `a` (`eq(a, b) === eq(b, a)`)
 * - **Transitive property**: If `a` is equivalent to `b` and `b` is equivalent to `c`, then `a` is equivalent to `c`
 * - **Reference equality optimization**: {@link make} checks `===` first for performance before calling the custom function
 * - **Composition**: Equivalences can be combined using {@link combine} and {@link combineAll} to create more complex relations
 *
 * ## Common tasks
 *
 * - Creating custom equivalences → {@link make}
 * - Using strict equality (`===`) → {@link strictEqual}
 * - Combining multiple equivalences (AND logic) → {@link combine}, {@link combineAll}
 * - Transforming input before comparison → {@link mapInput}
 * - Creating equivalences for structured types → {@link Struct}, {@link Tuple}, {@link Array_}, {@link Record}
 *
 * ## Gotchas
 *
 * - `strictEqual` uses `===`, so `NaN !== NaN` and objects are compared by reference, not structure
 * - `make` optimizes with a reference equality check, so identical references return `true` without calling the function
 * - `combineAll` with an empty collection returns an equivalence that always returns `true`
 * - `Tuple` and `Array` require matching lengths; different lengths are never equivalent
 *
 * ## Quickstart
 *
 * **Example** (Case-insensitive string equivalence)
 *
 * ```ts
 * import { Array, Equivalence } from "effect"
 *
 * const caseInsensitive = Equivalence.make<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 *
 * const strings = ["Hello", "world", "HELLO", "World"]
 * const deduplicated = Array.dedupeWith(strings, caseInsensitive)
 * console.log(deduplicated) // ["Hello", "world"]
 * ```
 *
 * ## See also
 *
 * - {@link Equal} - For structural equality (can convert to Equivalence)
 * - {@link Array_.dedupeWith} - Remove duplicates using an equivalence
 * - {@link Chunk} - Collections that use equivalences for operations
 *
 * @since 2.0.0
 */
import { dual } from "./Function.js";
import * as Reducer from "./Reducer.js";
/**
 * Creates a custom equivalence relation with an optimized reference equality check.
 *
 * When to use this:
 * - When you need a custom equivalence that isn't just strict equality
 * - When creating equivalences for complex types with custom comparison logic
 * - When you want the performance benefit of reference equality optimization
 *
 * Behavior:
 * - Does not mutate inputs
 * - First checks reference equality (`===`) for performance; if values are identical, returns `true` without calling the function
 * - Falls back to the provided equivalence function if values are not the same reference
 * - The provided function must satisfy reflexive, symmetric, and transitive properties
 *
 * **Example** (Case-insensitive string equivalence)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const caseInsensitive = Equivalence.make<string>((a, b) =>
 *   a.toLowerCase() === b.toLowerCase()
 * )
 *
 * console.log(caseInsensitive("Hello", "HELLO")) // true
 * console.log(caseInsensitive("foo", "bar")) // false
 *
 * // Same reference optimization
 * const str = "test"
 * console.log(caseInsensitive(str, str)) // true (fast path)
 * ```
 *
 * **Example** (Numeric tolerance equivalence)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const tolerance = Equivalence.make<number>((a, b) => Math.abs(a - b) < 0.0001)
 *
 * console.log(tolerance(1.0, 1.0001)) // false
 * console.log(tolerance(1.0, 1.00001)) // true
 * ```
 *
 * See also: {@link strictEqual}, {@link mapInput}
 *
 * @category constructors
 * @since 2.0.0
 */
export const make = isEquivalent => (self, that) => self === that || isEquivalent(self, that);
const isStrictEquivalent = (x, y) => x === y;
/**
 * Creates an equivalence relation that uses strict equality (`===`) to compare values.
 *
 * When to use this:
 * - For primitive types (numbers, strings, booleans) where `===` is appropriate
 * - When you need reference equality for objects (same object instance)
 * - As a building block for more complex equivalences via {@link mapInput} or {@link combine}
 * - When performance is critical and you don't need structural equality
 *
 * Behavior:
 * - Does not mutate inputs
 * - Uses JavaScript's strict equality operator (`===`)
 * - For primitives: compares values directly
 * - For objects: compares by reference (same object instance)
 * - Note: `NaN !== NaN`, so `NaN` values are never considered equivalent
 *
 * **Example** (Primitive types)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const strictEq = Equivalence.strictEqual<number>()
 *
 * console.log(strictEq(1, 1)) // true
 * console.log(strictEq(1, 2)) // false
 * console.log(strictEq(NaN, NaN)) // false (NaN !== NaN)
 * ```
 *
 * **Example** (Reference equality for objects)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const obj = { value: 42 }
 * const strictObjEq = Equivalence.strictEqual<typeof obj>()
 *
 * console.log(strictObjEq(obj, obj)) // true
 * console.log(strictObjEq(obj, { value: 42 })) // false (different references)
 * ```
 *
 * See also: {@link make}, {@link Equal} (for structural equality)
 *
 * @category constructors
 * @since 4.0.0
 */
export const strictEqual = () => isStrictEquivalent;
/**
 * An `Equivalence` instance for strings using strict equality (`===`).
 *
 * @example
 * ```ts
 * import { Equivalence } from "effect"
 *
 * console.log(Equivalence.String("hello", "hello")) // true
 * console.log(Equivalence.String("hello", "world")) // false
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export const String = isStrictEquivalent;
/**
 * An `Equivalence` instance for numbers.
 *
 * `NaN` is considered equal to `NaN`.
 *
 * @example
 * ```ts
 * import { Equivalence } from "effect"
 *
 * console.log(Equivalence.Number(1, 1)) // true
 * console.log(Equivalence.Number(1, 2)) // false
 * console.log(Equivalence.Number(NaN, NaN)) // true
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export const Number = /*#__PURE__*/make((self, that) => globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that));
/**
 * An `Equivalence` instance for booleans using strict equality (`===`).
 *
 * @example
 * ```ts
 * import { Equivalence } from "effect"
 *
 * console.log(Equivalence.Boolean(true, true)) // true
 * console.log(Equivalence.Boolean(true, false)) // false
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export const Boolean = isStrictEquivalent;
/**
 * An `Equivalence` instance for bigints using strict equality (`===`).
 *
 * @example
 * ```ts
 * import { Equivalence } from "effect"
 *
 * console.log(Equivalence.BigInt(1n, 1n)) // true
 * console.log(Equivalence.BigInt(1n, 2n)) // false
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export const BigInt = isStrictEquivalent;
/**
 * Combines two equivalence relations using logical AND.
 *
 * When to use this:
 * - When you need to combine exactly two equivalences
 * - When building complex equivalences from simpler ones
 * - When you want both conditions to be satisfied (AND logic)
 *
 * Behavior:
 * - Does not mutate inputs
 * - Returns `true` only if both equivalences return `true`
 * - Short-circuits: if the first equivalence returns `false`, the second is not called
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Combining name and age equivalences)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const nameEquivalence = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (p: Person) => p.name
 * )
 *
 * const ageEquivalence = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Person) => p.age
 * )
 *
 * const personEquivalence = Equivalence.combine(nameEquivalence, ageEquivalence)
 *
 * const person1 = { name: "Alice", age: 30 }
 * const person2 = { name: "Alice", age: 30 }
 * const person3 = { name: "Alice", age: 31 }
 *
 * console.log(personEquivalence(person1, person2)) // true
 * console.log(personEquivalence(person1, person3)) // false (different age)
 * ```
 *
 * See also: {@link combineAll}, {@link mapInput}
 *
 * @category combining
 * @since 2.0.0
 */
export const combine = /*#__PURE__*/dual(2, (self, that) => make((x, y) => self(x, y) && that(x, y)));
/**
 * Combines multiple equivalence relations into a single equivalence using logical AND.
 *
 * When to use this:
 * - When you need to combine three or more equivalences
 * - When you have a dynamic collection of equivalences to combine
 * - When building equivalences from arrays or iterables
 * - Prefer over multiple `combine` calls when you have many equivalences
 *
 * Behavior:
 * - Does not mutate inputs
 * - Returns `true` only if all equivalences in the collection return `true`
 * - Short-circuits: stops at the first equivalence that returns `false`
 * - Empty collection edge case: returns an equivalence that always returns `true`
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Combining multiple field equivalences)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface Point3D {
 *   x: number
 *   y: number
 *   z: number
 * }
 *
 * const xEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.x
 * )
 * const yEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.y
 * )
 * const zEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (p: Point3D) => p.z
 * )
 *
 * const point3DEq = Equivalence.combineAll([xEq, yEq, zEq])
 *
 * const point1 = { x: 1, y: 2, z: 3 }
 * const point2 = { x: 1, y: 2, z: 3 }
 * const point3 = { x: 1, y: 2, z: 4 }
 *
 * console.log(point3DEq(point1, point2)) // true
 * console.log(point3DEq(point1, point3)) // false (different z)
 * ```
 *
 * **Example** (Empty collection edge case)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * // Empty collection always returns true
 * const alwaysEq = Equivalence.combineAll([])
 * console.log(alwaysEq("anything", "else")) // true
 * ```
 *
 * See also: {@link combine}, {@link mapInput}
 *
 * @category combining
 * @since 2.0.0
 */
export const combineAll = collection => make((x, y) => {
  for (const equivalence of collection) {
    if (!equivalence(x, y)) {
      return false;
    }
  }
  return true;
});
/**
 * Transforms an equivalence relation by mapping the input values before comparison.
 *
 * When to use this:
 * - When you need an equivalence for a complex type based on a single property
 * - When you want to normalize values before comparison (e.g., case-insensitive strings)
 * - When creating equivalences that focus on specific fields of objects
 * - As a building block for creating equivalences via {@link combine} or {@link combineAll}
 *
 * Behavior:
 * - Does not mutate inputs
 * - Applies the transformation function to both values before comparing
 * - The transformation function should be pure (no side effects)
 * - The resulting equivalence compares the transformed values using the provided equivalence
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Equivalence based on object property)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 *
 * // Create equivalence based on user ID only
 * const userByIdEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<number>(),
 *   (user: User) => user.id
 * )
 *
 * const user1 = { id: 1, name: "Alice", email: "alice@example.com" }
 * const user2 = { id: 1, name: "Alice Smith", email: "alice.smith@example.com" }
 * const user3 = { id: 2, name: "Bob", email: "bob@example.com" }
 *
 * console.log(userByIdEq(user1, user2)) // true (same ID)
 * console.log(userByIdEq(user1, user3)) // false (different ID)
 * ```
 *
 * **Example** (Case-insensitive string equivalence)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const caseInsensitiveEq = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (s: string) => s.toLowerCase()
 * )
 *
 * console.log(caseInsensitiveEq("Hello", "HELLO")) // true
 * console.log(caseInsensitiveEq("Hello", "World")) // false
 * ```
 *
 * See also: {@link combine}, {@link Struct}
 *
 * @category mapping
 * @since 2.0.0
 */
export const mapInput = /*#__PURE__*/dual(2, (self, f) => make((x, y) => self(f(x), f(y))));
/**
 * Creates an equivalence for tuples with heterogeneous element types.
 *
 * When to use this:
 * - When comparing tuples with different types at each position
 * - When you need different equivalence logic for each tuple element
 * - When working with fixed-length tuples (not arrays)
 * - Prefer over `Array` when you have a known tuple structure with different types
 *
 * Behavior:
 * - Does not mutate inputs
 * - Requires tuples to have the same length; different lengths are never equivalent
 * - Applies each equivalence to the corresponding element position
 * - Returns `true` only if all elements are equivalent according to their respective equivalences
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Homogeneous tuple equivalence)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const stringTupleEq = Equivalence.Tuple([
 *   Equivalence.strictEqual<string>(),
 *   Equivalence.strictEqual<string>(),
 *   Equivalence.strictEqual<string>()
 * ])
 *
 * const tuple1 = ["hello", "world", "test"] as const
 * const tuple2 = ["hello", "world", "test"] as const
 * const tuple3 = ["hello", "world", "different"] as const
 *
 * console.log(stringTupleEq(tuple1, tuple2)) // true
 * console.log(stringTupleEq(tuple1, tuple3)) // false (different third element)
 * ```
 *
 * **Example** (Heterogeneous tuple with custom equivalences)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const caseInsensitive = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (s: string) => s.toLowerCase()
 * )
 *
 * const customTupleEq = Equivalence.Tuple([
 *   caseInsensitive,
 *   caseInsensitive,
 *   caseInsensitive
 * ])
 *
 * console.log(
 *   customTupleEq(["Hello", "World", "Test"], ["HELLO", "WORLD", "TEST"])
 * ) // true
 * ```
 *
 * See also: {@link Array_}, {@link Struct}
 *
 * @category combinators
 * @since 4.0.0
 */
export function Tuple(elements) {
  return make((self, that) => {
    if (self.length !== that.length) {
      return false;
    }
    for (let i = 0; i < self.length; i++) {
      if (!elements[i](self[i], that[i])) {
        return false;
      }
    }
    return true;
  });
}
/**
 * @since 4.0.0
 */
function Array_(item) {
  return make((self, that) => {
    if (self.length !== that.length) return false;
    for (let i = 0; i < self.length; i++) {
      if (!item(self[i], that[i])) return false;
    }
    return true;
  });
}
export {
/**
 * Creates an equivalence for arrays where all elements are compared using the same equivalence.
 *
 * When to use this:
 * - When comparing arrays with homogeneous element types
 * - When all elements should use the same equivalence logic
 * - When working with variable-length arrays (not fixed tuples)
 * - Prefer over `Tuple` when you have arrays of the same type
 *
 * Behavior:
 * - Does not mutate inputs
 * - Requires arrays to have the same length; different lengths are never equivalent
 * - Compares elements positionally (index 0 with index 0, etc.)
 * - Returns `true` only if all corresponding elements are equivalent
 * - Empty arrays are considered equivalent
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Number array equivalence)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const numberArrayEq = Equivalence.Array(Equivalence.strictEqual<number>())
 *
 * console.log(numberArrayEq([1, 2, 3], [1, 2, 3])) // true
 * console.log(numberArrayEq([1, 2, 3], [1, 2, 4])) // false
 * console.log(numberArrayEq([1, 2], [1, 2, 3])) // false (different length)
 * ```
 *
 * **Example** (Case-insensitive string array)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const caseInsensitive = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (s: string) => s.toLowerCase()
 * )
 * const stringArrayEq = Equivalence.Array(caseInsensitive)
 *
 * console.log(stringArrayEq(["Hello", "World"], ["HELLO", "WORLD"])) // true
 * console.log(stringArrayEq(["Hello"], ["Hi"])) // false
 * console.log(stringArrayEq([], [])) // true (empty arrays)
 * ```
 *
 * See also: {@link Tuple}, {@link Record}
 *
 * @category combinators
 * @since 4.0.0
 */
Array_ as Array };
/**
 * Creates an equivalence for objects by comparing their properties using provided equivalences.
 *
 * When to use this:
 * - When comparing objects with known, fixed property names
 * - When you need different equivalence logic for different properties
 * - When working with struct/interface types with specific fields
 * - Prefer over `Record` when you have a fixed set of known properties
 *
 * Behavior:
 * - Does not mutate inputs
 * - Compares only the properties specified in the struct definition
 * - Properties not in the struct are ignored
 * - Returns `true` only if all specified properties are equivalent according to their equivalences
 * - Supports both string and symbol keys (via `Reflect.ownKeys`)
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Struct with different equivalences per field)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * interface Person {
 *   name: string
 *   age: number
 *   email: string
 * }
 *
 * const caseInsensitive = Equivalence.mapInput(
 *   Equivalence.strictEqual<string>(),
 *   (s: string) => s.toLowerCase()
 * )
 *
 * const personEq = Equivalence.Struct({
 *   name: caseInsensitive,
 *   age: Equivalence.strictEqual<number>(),
 *   email: caseInsensitive
 * })
 *
 * const person1 = { name: "Alice", age: 30, email: "alice@example.com" }
 * const person2 = { name: "ALICE", age: 30, email: "ALICE@EXAMPLE.COM" }
 * const person3 = { name: "Alice", age: 31, email: "alice@example.com" }
 *
 * console.log(personEq(person1, person2)) // true (case-insensitive match)
 * console.log(personEq(person1, person3)) // false (different age)
 * ```
 *
 * **Example** (Partial equivalence for specific fields)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const nameAgeEq = Equivalence.Struct({
 *   name: Equivalence.strictEqual<string>(),
 *   age: Equivalence.strictEqual<number>()
 * })
 *
 * // Only compares name and age, ignores other properties
 * const obj1 = { name: "Alice", age: 30, extra: "ignored" }
 * const obj2 = { name: "Alice", age: 30, extra: "different" }
 * console.log(nameAgeEq(obj1, obj2)) // true
 * ```
 *
 * See also: {@link Record}, {@link mapInput}, {@link combine}
 *
 * @category combinators
 * @since 4.0.0
 */
export function Struct(fields) {
  const keys = Reflect.ownKeys(fields);
  return make((self, that) => {
    for (const key of keys) {
      if (!fields[key](self[key], that[key])) return false;
    }
    return true;
  });
}
/**
 * Creates an equivalence for objects by comparing all properties using the same equivalence.
 *
 * When to use this:
 * - When comparing objects with dynamic or unknown property names
 * - When all property values should use the same equivalence logic
 * - When working with record/dictionary types (key-value maps)
 * - Prefer over `Struct` when you have variable properties or need to compare all properties uniformly
 *
 * Behavior:
 * - Does not mutate inputs
 * - Compares all properties present in both objects
 * - Requires both objects to have the same set of keys; different keys result in `false`
 * - All property values must be equivalent according to the provided equivalence
 * - Supports both string and symbol keys (via `Reflect.ownKeys`)
 * - Empty objects are considered equivalent
 * - The result is also an equivalence (satisfies reflexive, symmetric, transitive properties)
 *
 * **Example** (Record with string values)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const stringRecordEq = Equivalence.Record(Equivalence.strictEqual<string>())
 *
 * const record1 = { a: "hello", b: "world" }
 * const record2 = { a: "hello", b: "world" }
 * const record3 = { a: "hello", b: "different" }
 * const record4 = { a: "hello" } // missing key 'b'
 *
 * console.log(stringRecordEq(record1, record2)) // true
 * console.log(stringRecordEq(record1, record3)) // false
 * console.log(stringRecordEq(record1, record4)) // false (different keys)
 * ```
 *
 * **Example** (Record with number values)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const numberRecordEq = Equivalence.Record(Equivalence.strictEqual<number>())
 *
 * const scores1 = { alice: 100, bob: 85 }
 * const scores2 = { alice: 100, bob: 85 }
 * const scores3 = { alice: 100, bob: 90 }
 *
 * console.log(numberRecordEq(scores1, scores2)) // true
 * console.log(numberRecordEq(scores1, scores3)) // false
 * ```
 *
 * See also: {@link Struct}, {@link Array_}
 *
 * @category combinators
 * @since 4.0.0
 */
export function Record(value) {
  return make((self, that) => {
    const selfKeys = Reflect.ownKeys(self);
    const thatKeys = Reflect.ownKeys(that);
    if (selfKeys.length !== thatKeys.length) return false;
    for (const key of selfKeys) {
      if (!Object.hasOwn(that, key) || !value(self[key], that[key])) {
        return false;
      }
    }
    return true;
  });
}
/**
 * Creates a `Reducer` for combining `Equivalence` instances, useful for aggregating equivalences in collections.
 *
 * When to use this:
 * - When you need to combine multiple equivalences from a collection using reducer patterns
 * - When implementing fold operations over collections of equivalences
 * - When working with reducers that operate on equivalences
 *
 * Behavior:
 * - Returns a reducer that combines equivalences using {@link combine}
 * - Uses an equivalence that always returns `true` as the identity element (for empty collections)
 * - Uses {@link combineAll} for combining collections of equivalences
 * - The reducer can be used with fold operations on collections
 *
 * **Example** (Creating a Reducer)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const reducer = Equivalence.makeReducer<number>()
 * const equivalences = [
 *   Equivalence.strictEqual<number>(),
 *   Equivalence.make<number>((a, b) => Math.abs(a - b) < 1)
 * ]
 *
 * const combined = reducer.combineAll(equivalences)
 * // Combined equivalence requires both conditions to be true
 * console.log(combined(1, 1)) // true (strict equal)
 * console.log(combined(1, 1.5)) // false (strict equal fails)
 * ```
 *
 * See also:
 * - {@link combine} - Combine two equivalences
 * - {@link combineAll} - Combine multiple equivalences
 * - {@link Reducer} - Reducer type for collection operations
 *
 * @category utilities
 * @since 4.0.0
 */
export function makeReducer() {
  return Reducer.make(combine, () => true, combineAll);
}
/**
 * An `Equivalence` instance for `Date` objects.
 *
 * Dates are compared by their time value (milliseconds since the Unix epoch),
 * using {@link Date.prototype.getTime}.
 *
 * When to use this:
 * - When comparing `Date` objects by their exact point in time
 * - When you need value-based equality instead of reference equality
 * - When working with collections that contain `Date` values
 *
 * Behavior:
 * - Does not mutate inputs
 * - Two dates are equivalent if `self.getTime() === that.getTime()`
 * - Internally uses {@link Number} equivalence
 * - Different `Date` instances representing the same time are considered equivalent
 *
 * **Example**
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const d1 = new Date("2020-01-01T00:00:00.000Z")
 * const d2 = new Date("2020-01-01T00:00:00.000Z")
 * const d3 = new Date("2021-01-01T00:00:00.000Z")
 * const invalidDate1 = new Date("foo")
 * const invalidDate2 = new Date("bar")
 *
 * console.log(Equivalence.Date(d1, d2)) // true
 * console.log(Equivalence.Date(d1, d3)) // false
 * console.log(Equivalence.Date(invalidDate1, invalidDate2)) // true
 * console.log(Equivalence.Date(invalidDate1, d1)) // false
 * ```
 *
 * **Example** (Reference vs value equality)
 *
 * ```ts
 * import { Equivalence } from "effect"
 *
 * const d1 = new Date(0)
 * const d2 = new Date(0)
 *
 * console.log(d1 === d2) // false (different references)
 * console.log(Equivalence.Date(d1, d2)) // true (same time value)
 * ```
 *
 * See also: {@link Number}, {@link mapInput}, {@link strictEqual}
 *
 * @category instances
 * @since 4.0.0
 */
export const Date = /*#__PURE__*/mapInput(Number, d => d.getTime());
//# sourceMappingURL=Equivalence.js.map