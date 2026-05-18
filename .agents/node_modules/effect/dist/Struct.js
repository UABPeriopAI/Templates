/**
 * Utilities for creating, transforming, and comparing plain TypeScript objects
 * (structs). Every function produces a new object — inputs are never mutated.
 *
 * ## Mental model
 *
 * - **Struct**: A plain JS object with a fixed set of known keys (e.g.,
 *   `{ name: string; age: number }`). Not a generic key-value record.
 * - **Dual API**: Most functions accept arguments in both data-first
 *   (`Struct.pick(obj, keys)`) and data-last (`pipe(obj, Struct.pick(keys))`)
 *   style.
 * - **Immutability**: All operations return a new object; the original is
 *   never modified.
 * - **Lambda**: A type-level function interface (`~lambda.in` / `~lambda.out`)
 *   used by {@link map}, {@link mapPick}, and {@link mapOmit} so the compiler
 *   can track how value types change.
 * - **Evolver pattern**: {@link evolve}, {@link evolveKeys}, and
 *   {@link evolveEntries} let you selectively transform values, keys, or both
 *   while leaving untouched properties unchanged.
 *
 * ## Common tasks
 *
 * - Access a property in a pipeline → {@link get}
 * - List string keys with proper types → {@link keys}
 * - Subset / remove properties → {@link pick}, {@link omit}
 * - Merge two structs (second wins) → {@link assign}
 * - Rename keys → {@link renameKeys}
 * - Transform selected values → {@link evolve}
 * - Transform selected keys → {@link evolveKeys}
 * - Transform both keys and values → {@link evolveEntries}
 * - Map all values with a typed lambda → {@link map}, {@link mapPick},
 *   {@link mapOmit}
 * - Compare structs → {@link makeEquivalence}, {@link makeOrder}
 * - Combine / reduce structs → {@link makeCombiner}, {@link makeReducer}
 * - Flatten intersection types → {@link Simplify}
 * - Strip `readonly` modifiers → {@link Mutable}
 *
 * ## Gotchas
 *
 * - {@link keys} only returns `string` keys; symbol keys are excluded.
 * - {@link pick} and {@link omit} iterate with `for...in`, which includes
 *   inherited enumerable properties but excludes non-enumerable ones.
 * - {@link assign} spreads with `...`; property order follows standard
 *   JS spread rules.
 * - {@link map}, {@link mapPick}, {@link mapOmit} require a {@link Lambda}
 *   value created with {@link lambda}; a plain function won't type-check.
 *
 * ## Quickstart
 *
 * **Example** (Picking, renaming, and evolving struct properties)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const user = { firstName: "Alice", lastName: "Smith", age: 30, admin: false }
 *
 * const result = pipe(
 *   user,
 *   Struct.pick(["firstName", "age"]),
 *   Struct.evolve({ age: (n) => n + 1 }),
 *   Struct.renameKeys({ firstName: "name" })
 * )
 *
 * console.log(result) // { name: "Alice", age: 31 }
 * ```
 *
 * ## See also
 *
 * - {@link Equivalence} – building equivalence relations for structs
 * - {@link Order} – ordering structs by their fields
 * - {@link Combiner} – combining two values of the same type
 * - {@link Reducer} – combining with an initial value
 *
 * @since 2.0.0
 */
import * as Combiner from "./Combiner.js";
import * as Equivalence from "./Equivalence.js";
import { dual } from "./Function.js";
import * as order from "./Order.js";
import * as Reducer from "./Reducer.js";
/**
 * Retrieves the value at `key` from a struct.
 *
 * - Use in a pipeline when you need to extract a single property.
 * - Does not mutate the input.
 * - The return type is narrowed to `S[K]`.
 *
 * **Example** (Extracting a property in a pipeline)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const name = pipe({ name: "Alice", age: 30 }, Struct.get("name"))
 * console.log(name) // "Alice"
 * ```
 *
 * @see {@link keys} – list all string keys of a struct
 * @see {@link pick} – extract multiple properties into a new struct
 *
 * @category Getters
 * @since 2.0.0
 */
export const get = /*#__PURE__*/dual(2, (self, key) => self[key]);
/**
 * Returns the string keys of a struct as a properly typed `Array<keyof S & string>`.
 *
 * - Use instead of `Object.keys` when you want the return type narrowed to the
 *   known keys of the struct.
 * - Symbol keys are excluded; only string keys are returned.
 * - Does not mutate the input.
 *
 * **Example** (Typed keys)
 *
 * ```ts
 * import { Struct } from "effect"
 *
 * const user = { name: "Alice", age: 30, [Symbol.for("id")]: 1 }
 *
 * const k: Array<"name" | "age"> = Struct.keys(user)
 * console.log(k) // ["name", "age"]
 * ```
 *
 * @see {@link get} – access a single key's value
 * @see {@link pick} – select a subset of keys into a new struct
 *
 * @category Key utilities
 * @since 3.6.0
 */
export const keys = self => Object.keys(self);
/**
 * Creates a new struct containing only the specified keys.
 *
 * - Use to narrow a struct down to a subset of its properties.
 * - Does not mutate the input; returns a fresh object.
 * - Keys not present in the struct are silently ignored.
 *
 * **Example** (Selecting specific properties)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const user = { name: "Alice", age: 30, admin: true }
 * const nameAndAge = pipe(user, Struct.pick(["name", "age"]))
 * console.log(nameAndAge) // { name: "Alice", age: 30 }
 * ```
 *
 * @see {@link omit} – the inverse (exclude keys instead)
 * @see {@link get} – extract a single value
 *
 * @category filtering
 * @since 2.0.0
 */
export const pick = /*#__PURE__*/dual(2, (self, keys) => {
  return buildStruct(self, (k, v) => keys.includes(k) ? [k, v] : undefined);
});
/**
 * Creates a new struct with the specified keys removed.
 *
 * - Use to exclude sensitive or irrelevant fields from a struct.
 * - Does not mutate the input; returns a fresh object.
 * - Keys not present in the struct are silently ignored.
 *
 * **Example** (Removing a property)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const user = { name: "Alice", age: 30, password: "secret" }
 * const safe = pipe(user, Struct.omit(["password"]))
 * console.log(safe) // { name: "Alice", age: 30 }
 * ```
 *
 * @see {@link pick} – the inverse (keep only specified keys)
 *
 * @category filtering
 * @since 2.0.0
 */
export const omit = /*#__PURE__*/dual(2, (self, keys) => {
  return buildStruct(self, (k, v) => !keys.includes(k) ? [k, v] : undefined);
});
/**
 * Merges two structs into a new struct. When both structs share a key, the
 * value from `that` (the second struct) wins.
 *
 * - Use when you want `{ ...self, ...that }` with proper types.
 * - Does not mutate either input; returns a fresh object.
 * - The result type is `Simplify<Assign<S, O>>`.
 *
 * **Example** (Merging structs with overlapping keys)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const defaults = { theme: "light", lang: "en" }
 * const overrides = { theme: "dark", fontSize: 14 }
 * const config = pipe(defaults, Struct.assign(overrides))
 * console.log(config) // { theme: "dark", lang: "en", fontSize: 14 }
 * ```
 *
 * @see {@link Assign} – the type-level equivalent
 * @see {@link evolve} – transform individual values instead of replacing them
 *
 * @category combining
 * @since 4.0.0
 */
export const assign = /*#__PURE__*/dual(2, (self, that) => {
  return {
    ...self,
    ...that
  };
});
/**
 * Selectively transforms values of a struct using per-key functions. Keys
 * without a corresponding function are copied unchanged.
 *
 * - Use when you want to update specific fields while keeping the rest intact.
 * - Does not mutate the input; returns a fresh object.
 * - Each transform function receives the current value and returns the new
 *   value; the return type can differ from the input type.
 *
 * **Example** (Transforming selected values)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { name: "alice", age: 30, active: true },
 *   Struct.evolve({
 *     name: (s) => s.toUpperCase(),
 *     age: (n) => n + 1
 *   })
 * )
 * console.log(result) // { name: "ALICE", age: 31, active: true }
 * ```
 *
 * @see {@link evolveKeys} – transform keys instead of values
 * @see {@link evolveEntries} – transform both keys and values
 * @see {@link map} – apply the same transformation to all values
 *
 * @category transforming
 * @since 2.0.0
 */
export const evolve = /*#__PURE__*/dual(2, (self, e) => {
  return buildStruct(self, (k, v) => [k, Object.hasOwn(e, k) ? e[k](v) : v]);
});
/**
 * Selectively transforms keys of a struct using per-key functions. Keys without
 * a corresponding function are copied unchanged.
 *
 * - Use when you need computed key names (e.g., uppercasing, prefixing).
 * - Each transform function receives the key name and must return a new
 *   `PropertyKey`.
 * - Does not mutate the input; returns a fresh object.
 *
 * **Example** (Renaming keys with functions)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { name: "Alice", age: 30 },
 *   Struct.evolveKeys({
 *     name: (k) => k.toUpperCase()
 *   })
 * )
 * console.log(result) // { NAME: "Alice", age: 30 }
 * ```
 *
 * @see {@link renameKeys} – rename keys with a static mapping
 * @see {@link evolve} – transform values instead of keys
 * @see {@link evolveEntries} – transform both keys and values
 *
 * @category Key utilities
 * @since 4.0.0
 */
export const evolveKeys = /*#__PURE__*/dual(2, (self, e) => {
  return buildStruct(self, (k, v) => [Object.hasOwn(e, k) ? e[k](k) : k, v]);
});
/**
 * Selectively transforms both keys and values of a struct. Each per-key
 * function receives `(key, value)` and must return a `[newKey, newValue]`
 * tuple. Keys without a corresponding function are copied unchanged.
 *
 * - Use when you need to rename a key and change its value in one step.
 * - Does not mutate the input; returns a fresh object.
 * - The return type is fully tracked at the type level.
 *
 * **Example** (Transforming keys and values together)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { amount: 100, label: "total" },
 *   Struct.evolveEntries({
 *     amount: (k, v) => [`${k}Cents`, v * 100],
 *     label: (k, v) => [k, v.toUpperCase()]
 *   })
 * )
 * console.log(result) // { amountCents: 10000, label: "TOTAL" }
 * ```
 *
 * @see {@link evolve} – transform values only
 * @see {@link evolveKeys} – transform keys only
 *
 * @category Utilities
 * @since 4.0.0
 */
export const evolveEntries = /*#__PURE__*/dual(2, (self, e) => {
  return buildStruct(self, (k, v) => Object.hasOwn(e, k) ? e[k](k, v) : [k, v]);
});
/**
 * Renames keys in a struct using a static `{ oldKey: newKey }` mapping. Keys
 * not mentioned in the mapping are copied unchanged.
 *
 * - Use for simple, declarative key renaming without custom logic.
 * - Does not mutate the input; returns a fresh object.
 * - For computed key names, use {@link evolveKeys} instead.
 *
 * **Example** (Renaming keys)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { firstName: "Alice", lastName: "Smith", age: 30 },
 *   Struct.renameKeys({ firstName: "first", lastName: "last" })
 * )
 * console.log(result) // { first: "Alice", last: "Smith", age: 30 }
 * ```
 *
 * @see {@link evolveKeys} – rename keys using functions
 * @see {@link evolveEntries} – rename keys and transform values
 *
 * @category Key utilities
 * @since 4.0.0
 */
export const renameKeys = /*#__PURE__*/dual(2, (self, mapping) => {
  return buildStruct(self, (k, v) => [Object.hasOwn(mapping, k) ? mapping[k] : k, v]);
});
/**
 * Creates an `Equivalence` for a struct by providing an `Equivalence` for each
 * property. Two structs are equivalent when all their corresponding properties
 * are equivalent.
 *
 * Alias of `Equivalence.Struct`.
 *
 * - Use when you need to compare structs property-by-property.
 * - Each property's equivalence is checked independently; all must return
 *   `true` for the overall result to be `true`.
 *
 * **Example** (Comparing structs for equivalence)
 *
 * ```ts
 * import { Equivalence, Struct } from "effect"
 *
 * const PersonEquivalence = Struct.makeEquivalence({
 *   name: Equivalence.strictEqual<string>(),
 *   age: Equivalence.strictEqual<number>()
 * })
 *
 * console.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Alice", age: 30 }))
 * // true
 * console.log(PersonEquivalence({ name: "Alice", age: 30 }, { name: "Bob", age: 30 }))
 * // false
 * ```
 *
 * @see {@link makeOrder} – create an `Order` for structs
 *
 * @category Equivalence
 * @since 2.0.0
 */
export const makeEquivalence = Equivalence.Struct;
/**
 * Creates an `Order` for a struct by providing an `Order` for each property.
 * Properties are compared in the order they appear in the fields object; the
 * first non-zero comparison determines the result.
 *
 * Alias of `Order.Struct`.
 *
 * - Use to sort or compare structs by multiple fields with lexicographic
 *   priority.
 * - The order of keys in the `fields` object determines comparison priority.
 *
 * **Example** (Ordering structs by name then age)
 *
 * ```ts
 * import { Number, String, Struct } from "effect"
 *
 * const PersonOrder = Struct.makeOrder({
 *   name: String.Order,
 *   age: Number.Order
 * })
 *
 * console.log(PersonOrder({ name: "Alice", age: 30 }, { name: "Bob", age: 25 }))
 * // -1 (Alice comes before Bob)
 * ```
 *
 * @see {@link makeEquivalence} – create an `Equivalence` for structs
 *
 * @category Ordering
 * @since 2.0.0
 */
export const makeOrder = order.Struct;
/**
 * Wraps a plain function as a {@link Lambda} value so it can be used with
 * {@link map}, {@link mapPick}, and {@link mapOmit}.
 *
 * - The type parameter `L` encodes both the input and output types at the type
 *   level, allowing the compiler to track how struct value types change.
 * - At runtime, the returned value is the same function — `lambda` only
 *   adjusts the type.
 *
 * **Example** (Wrapping values in arrays)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))
 * console.log(result) // { x: [1], y: ["hello"] }
 * ```
 *
 * @see {@link Lambda} – the type-level interface
 * @see {@link map} – apply a lambda to all struct values
 *
 * @category Lambda
 * @since 4.0.0
 */
export const lambda = f => f;
/**
 * Applies a {@link Lambda} transformation to every value in a struct.
 *
 * - Use when you want to apply the same function to every value in a struct.
 * - The lambda must be created with {@link lambda} so the compiler can track
 *   the output types.
 * - Does not mutate the input; returns a fresh object.
 *
 * **Example** (Wrapping every value in an array)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe({ width: 10, height: 20 }, Struct.map(asArray))
 * console.log(result) // { width: [10], height: [20] }
 * ```
 *
 * @see {@link mapPick} – apply a lambda only to selected keys
 * @see {@link mapOmit} – apply a lambda to all keys except selected ones
 * @see {@link evolve} – apply different functions to different keys
 *
 * @category Mapping
 * @since 4.0.0
 */
export const map = /*#__PURE__*/dual(2, (self, lambda) => {
  return buildStruct(self, (k, v) => [k, lambda(v)]);
});
/**
 * Applies a {@link Lambda} transformation only to the specified keys; all
 * other keys are copied unchanged.
 *
 * - Use when you want to apply the same transformation to a subset of
 *   properties.
 * - Does not mutate the input; returns a fresh object.
 *
 * **Example** (Wrapping only selected values in arrays)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe(
 *   { x: 1, y: 2, z: 3 },
 *   Struct.mapPick(["x", "z"], asArray)
 * )
 * console.log(result) // { x: [1], y: 2, z: [3] }
 * ```
 *
 * @see {@link map} – apply a lambda to all keys
 * @see {@link mapOmit} – apply a lambda to all keys except selected ones
 *
 * @category Mapping
 * @since 4.0.0
 */
export const mapPick = /*#__PURE__*/dual(3, (self, keys, lambda) => {
  return buildStruct(self, (k, v) => [k, keys.includes(k) ? lambda(v) : v]);
});
/**
 * Applies a {@link Lambda} transformation to all keys except the specified
 * ones; the excluded keys are copied unchanged.
 *
 * - Use when most keys should be transformed but a few should be preserved.
 * - Does not mutate the input; returns a fresh object.
 *
 * **Example** (Wrapping all values except one in arrays)
 *
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * interface AsArray extends Struct.Lambda {
 *   <A>(self: A): Array<A>
 *   readonly "~lambda.out": Array<this["~lambda.in"]>
 * }
 *
 * const asArray = Struct.lambda<AsArray>((a) => [a])
 * const result = pipe(
 *   { x: 1, y: 2, z: 3 },
 *   Struct.mapOmit(["y"], asArray)
 * )
 * console.log(result) // { x: [1], y: 2, z: [3] }
 * ```
 *
 * @see {@link map} – apply a lambda to all keys
 * @see {@link mapPick} – apply a lambda only to selected keys
 *
 * @category Mapping
 * @since 4.0.0
 */
export const mapOmit = /*#__PURE__*/dual(3, (self, keys, lambda) => {
  return buildStruct(self, (k, v) => [k, !keys.includes(k) ? lambda(v) : v]);
});
/**
 * Walk `source`; for each key decide what to emit via the small callback.
 *
 * The callback returns either
 *   • `undefined`  → nothing is copied, or
 *   • `[newKey, newVal]`
 *
 * so every public API just supplies a different callback.
 */
function buildStruct(source, f) {
  const out = {};
  for (const k in source) {
    const res = f(k, source[k]);
    if (res) {
      const [nk, nv] = res;
      out[nk] = nv;
    }
  }
  return out;
}
/**
 * Creates a `Combiner` for a struct shape by providing a `Combiner` for each
 * property. When two structs are combined, each property is merged using its
 * corresponding combiner.
 *
 * - Use when you need to merge two structs of the same shape (e.g., summing
 *   counters, concatenating strings).
 * - Pass `omitKeyWhen` to drop properties whose merged value matches a
 *   predicate (e.g., omit zero counters).
 * - Does not mutate the inputs; returns a fresh object.
 *
 * **Example** (Combining struct properties)
 *
 * ```ts
 * import { Number, String, Struct } from "effect"
 *
 * const C = Struct.makeCombiner<{ readonly n: number; readonly s: string }>({
 *   n: Number.ReducerSum,
 *   s: String.ReducerConcat
 * })
 *
 * const result = C.combine({ n: 1, s: "hello" }, { n: 2, s: " world" })
 * console.log(result) // { n: 3, s: "hello world" }
 * ```
 *
 * @see {@link makeReducer} – like `makeCombiner` but with an initial value
 *
 * @since 4.0.0
 */
export function makeCombiner(combiners, options) {
  const omitKeyWhen = options?.omitKeyWhen ?? (() => false);
  return Combiner.make((self, that) => {
    const keys = Reflect.ownKeys(combiners);
    const out = {};
    for (const key of keys) {
      const merge = combiners[key].combine(self[key], that[key]);
      if (omitKeyWhen(merge)) continue;
      out[key] = merge;
    }
    return out;
  });
}
/**
 * Creates a `Reducer` for a struct shape by providing a `Reducer` for each
 * property. The initial value is derived from each property's
 * `Reducer.initialValue`. When reducing a collection of structs, each property
 * is combined independently.
 *
 * - Use to fold a collection of structs into a single summary struct.
 * - Pass `omitKeyWhen` to drop properties whose reduced value matches a
 *   predicate.
 * - Does not mutate the inputs; returns a fresh object.
 *
 * **Example** (Reducing a collection of structs)
 *
 * ```ts
 * import { Number, String, Struct } from "effect"
 *
 * const R = Struct.makeReducer<{ readonly n: number; readonly s: string }>({
 *   n: Number.ReducerSum,
 *   s: String.ReducerConcat
 * })
 *
 * const result = R.combineAll([
 *   { n: 1, s: "a" },
 *   { n: 2, s: "b" },
 *   { n: 3, s: "c" }
 * ])
 * console.log(result) // { n: 6, s: "abc" }
 * ```
 *
 * @see {@link makeCombiner} – like `makeReducer` but without an initial value
 *
 * @since 4.0.0
 */
export function makeReducer(reducers, options) {
  const combine = makeCombiner(reducers, options).combine;
  const initialValue = {};
  for (const key of Reflect.ownKeys(reducers)) {
    const iv = reducers[key].initialValue;
    if (options?.omitKeyWhen?.(iv)) continue;
    initialValue[key] = iv;
  }
  return Reducer.make(combine, initialValue);
}
/**
 * Creates a record with the given keys and value.
 *
 * **Example** (Creating a record)
 *
 * ```ts
 * import { Struct } from "effect"
 *
 * const record = Struct.Record(["a", "b"], "value")
 * console.log(record) // { a: "value", b: "value" }
 * ```
 *
 * @category Constructors
 * @since 4.0.0
 */
export function Record(keys, value) {
  const out = {};
  for (const key of keys) {
    out[key] = value;
  }
  return out;
}
//# sourceMappingURL=Struct.js.map