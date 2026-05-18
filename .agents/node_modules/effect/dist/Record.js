/**
 * This module provides utility functions for working with records in TypeScript.
 *
 * @since 2.0.0
 */
import * as Equal from "./Equal.js";
import { dual, identity } from "./Function.js";
import * as Option from "./Option.js";
import * as Reducer from "./Reducer.js";
import * as R from "./Result.js";
/**
 * Creates a new, empty record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 *
 * // Create an empty record
 * const emptyRecord = Record.empty<string, number>()
 * console.log(emptyRecord) // {}
 *
 * // The type ensures type safety for future operations
 * const withValue = Record.set(emptyRecord, "count", 42)
 * console.log(withValue) // { count: 42 }
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const empty = () => ({});
/**
 * Determine if a record is empty.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.isEmptyRecord({}), true)
 * assert.deepStrictEqual(Record.isEmptyRecord({ a: 3 }), false)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const isEmptyRecord = self => Object.keys(self).length === 0;
/**
 * Determine if a record is empty.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.isEmptyReadonlyRecord({}), true)
 * assert.deepStrictEqual(Record.isEmptyReadonlyRecord({ a: 3 }), false)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const isEmptyReadonlyRecord = isEmptyRecord;
/**
 * Takes an iterable and a projection function and returns a record.
 * The projection function maps each value of the iterable to a tuple of a key and a value, which is then added to the resulting record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const input = [1, 2, 3, 4]
 *
 * assert.deepStrictEqual(
 *   Record.fromIterableWith(input, (a) => [String(a), a * 2]),
 *   { "1": 2, "2": 4, "3": 6, "4": 8 }
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromIterableWith = /*#__PURE__*/dual(2, (self, f) => {
  const out = empty();
  for (const a of self) {
    const [k, b] = f(a);
    out[k] = b;
  }
  return out;
});
/**
 * Creates a new record from an iterable, utilizing the provided function to determine the key for each element.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const users = [
 *   { id: "2", name: "name2" },
 *   { id: "1", name: "name1" }
 * ]
 *
 * assert.deepStrictEqual(
 *   Record.fromIterableBy(users, (user) => user.id),
 *   {
 *     "2": { id: "2", name: "name2" },
 *     "1": { id: "1", name: "name1" }
 *   }
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromIterableBy = (items, f) => fromIterableWith(items, a => [f(a), a]);
/**
 * Builds a record from an iterable of key-value pairs.
 *
 * If there are conflicting keys when using `fromEntries`, the last occurrence of the key/value pair will overwrite the
 * previous ones. So the resulting record will only have the value of the last occurrence of each key.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const input: Array<[string, number]> = [["a", 1], ["b", 2]]
 *
 * assert.deepStrictEqual(Record.fromEntries(input), { a: 1, b: 2 })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromEntries = Object.fromEntries;
/**
 * Transforms the values of a record into an `Array` with a custom mapping function.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3 }
 * assert.deepStrictEqual(Record.collect(x, (key, n) => [key, n]), [["a", 1], [
 *   "b",
 *   2
 * ], ["c", 3]])
 * ```
 *
 * @category conversions
 * @since 2.0.0
 */
export const collect = /*#__PURE__*/dual(2, (self, f) => {
  const out = [];
  for (const key of keys(self)) {
    out.push(f(key, self[key]));
  }
  return out;
});
/**
 * Takes a record and returns an array of tuples containing its keys and values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3 }
 * assert.deepStrictEqual(Record.toEntries(x), [["a", 1], ["b", 2], ["c", 3]])
 * ```
 *
 * @category conversions
 * @since 2.0.0
 */
export const toEntries = /*#__PURE__*/collect((key, value) => [key, value]);
/**
 * Returns the number of key/value pairs in a record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.size({ a: "a", b: 1, c: true }), 3)
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
export const size = self => keys(self).length;
/**
 * Check if a given `key` exists in a record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.has({ a: 1, b: 2 }, "a"), true)
 * assert.deepStrictEqual(Record.has(Record.empty<string>(), "c"), false)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const has = /*#__PURE__*/dual(2, (self, key) => Object.hasOwn(self, key));
/**
 * Retrieve a value at a particular key from a record, returning it wrapped in an `Option`.
 *
 * @example
 * ```ts
 * import { Option, Record as R } from "effect"
 * import * as assert from "node:assert"
 *
 * const person: Record<string, unknown> = { name: "John Doe", age: 35 }
 *
 * assert.deepStrictEqual(R.get(person, "name"), Option.some("John Doe"))
 * assert.deepStrictEqual(R.get(person, "email"), Option.none())
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
export const get = /*#__PURE__*/dual(2, (self, key) => has(self, key) ? Option.some(self[key]) : Option.none());
/**
 * Apply a function to the element at the specified key, creating a new record,
 * or return `Option.none()` if the key doesn't exist.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 *
 * const f = (x: number) => x * 2
 *
 * const input: Record<string, number> = { a: 3 }
 *
 * Record.modify(input, "a", f) // Option.some({ a: 6 })
 * Record.modify(input, "b", f) // Option.none()
 * ```
 *
 * @category utils
 * @since 2.0.0
 */
export const modify = /*#__PURE__*/dual(3, (self, key, f) => {
  if (!has(self, key)) return Option.none();
  return Option.some({
    ...self,
    [key]: f(self[key])
  });
});
/**
 * Replaces a value in the record with the new value passed as parameter.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 *
 * Record.replace({ a: 1, b: 2, c: 3 }, "a", 10) // Option.some({ a: 10, b: 2, c: 3 })
 * Record.replace(Record.empty<string>(), "a", 10) // Option.none()
 * ```
 *
 * @category utils
 * @since 2.0.0
 */
export const replace = /*#__PURE__*/dual(3, (self, key, b) => modify(self, key, () => b));
/**
 * If the given key exists in the record, returns a new record with the key removed.
 * If the key does not exist, returns a shallow copy of the original record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.remove({ a: 1, b: 2 }, "a"), { b: 2 })
 * ```
 *
 * @category utils
 * @since 2.0.0
 */
export const remove = /*#__PURE__*/dual(2, (self, key) => {
  if (!has(self, key)) {
    return {
      ...self
    };
  }
  const out = {
    ...self
  };
  delete out[key];
  return out;
});
/**
 * Retrieves the value of the property with the given `key` from a record and returns an `Option`
 * of a tuple with the value and the record with the removed property.
 * If the key is not present, returns `Option.none()`.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 *
 * const input: Record<string, number> = { a: 1, b: 2 }
 *
 * Record.pop(input, "a") // Option.some([1, { b: 2 }])
 * Record.pop(input, "c") // Option.none()
 * ```
 *
 * @category utils
 * @since 2.0.0
 */
export const pop = /*#__PURE__*/dual(2, (self, key) => has(self, key) ? Option.some([self[key], remove(self, key)]) : Option.none());
/**
 * Maps a record into another record by applying a transformation function to each of its values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const f = (n: number) => `-${n}`
 *
 * assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, f), { a: "-3", b: "-5" })
 *
 * const g = (n: number, key: string) => `${key.toUpperCase()}-${n}`
 *
 * assert.deepStrictEqual(Record.map({ a: 3, b: 5 }, g), { a: "A-3", b: "B-5" })
 * ```
 *
 * @category mapping
 * @since 2.0.0
 */
export const map = /*#__PURE__*/dual(2, (self, f) => {
  const out = {
    ...self
  };
  for (const key of keys(self)) {
    out[key] = f(self[key], key);
  }
  return out;
});
/**
 * Maps the keys of a `ReadonlyRecord` while preserving the corresponding values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.mapKeys({ a: 3, b: 5 }, (key) => key.toUpperCase()),
 *   { A: 3, B: 5 }
 * )
 * ```
 *
 * @category mapping
 * @since 2.0.0
 */
export const mapKeys = /*#__PURE__*/dual(2, (self, f) => {
  const out = {};
  for (const key of keys(self)) {
    const a = self[key];
    out[f(key, a)] = a;
  }
  return out;
});
/**
 * Maps entries of a `ReadonlyRecord` using the provided function, allowing modification of both keys and corresponding values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.mapEntries({ a: 3, b: 5 }, (a, key) => [key.toUpperCase(), a + 1]),
 *   { A: 4, B: 6 }
 * )
 * ```
 *
 * @category mapping
 * @since 2.0.0
 */
export const mapEntries = /*#__PURE__*/dual(2, (self, f) => {
  const out = {};
  for (const key of keys(self)) {
    const [k, b] = f(self[key], key);
    out[k] = b;
  }
  return out;
});
/**
 * Transforms a record by applying the function `f` to each key and value in the original record.
 * If the function succeeds, the key-value pair is included in the output record.
 *
 * @example
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3 }
 * const f = (a: number, key: string) => a > 2 ? Result.succeed(a * 2) : Result.failVoid
 * assert.deepStrictEqual(Record.filterMap(x, f), { c: 6 })
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const filterMap = /*#__PURE__*/dual(2, (self, f) => {
  const out = empty();
  for (const key of keys(self)) {
    const result = f(self[key], key);
    if (R.isSuccess(result)) {
      out[key] = result.success;
    }
  }
  return out;
});
/**
 * Selects properties from a record whose values match the given predicate.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3, d: 4 }
 * assert.deepStrictEqual(Record.filter(x, (n) => n > 2), { c: 3, d: 4 })
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const filter = /*#__PURE__*/dual(2, (self, predicate) => {
  const out = empty();
  for (const key of keys(self)) {
    if (predicate(self[key], key)) {
      out[key] = self[key];
    }
  }
  return out;
});
/**
 * Given a record with `Option` values, returns a new record containing only the `Some` values, preserving the original keys.
 *
 * @example
 * ```ts
 * import { Option, Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.getSomes({ a: Option.some(1), b: Option.none(), c: Option.some(2) }),
 *   { a: 1, c: 2 }
 * )
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const getSomes = self => {
  const out = empty();
  for (const key of keys(self)) {
    const option = self[key];
    if (Option.isSome(option)) {
      out[key] = option.value;
    }
  }
  return out;
};
/**
 * Given a record with `Result` values, returns a new record containing only the `Err` values, preserving the original keys.
 *
 * @example
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.getFailures({
 *     a: Result.succeed(1),
 *     b: Result.fail("err"),
 *     c: Result.succeed(2)
 *   }),
 *   { b: "err" }
 * )
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const getFailures = self => {
  const out = empty();
  for (const key of keys(self)) {
    const value = self[key];
    if (R.isFailure(value)) {
      out[key] = value.failure;
    }
  }
  return out;
};
/**
 * Given a record with `Result` values, returns a new record containing only the `Ok` values, preserving the original keys.
 *
 * @example
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.getSuccesses({
 *     a: Result.succeed(1),
 *     b: Result.fail("err"),
 *     c: Result.succeed(2)
 *   }),
 *   { a: 1, c: 2 }
 * )
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const getSuccesses = self => {
  const out = empty();
  for (const key of keys(self)) {
    const value = self[key];
    if (R.isSuccess(value)) {
      out[key] = value.success;
    }
  }
  return out;
};
/**
 * Partitions the elements of a record into two groups: those that match a filter, and those that don't.
 *
 * @example
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * const x = { a: 1, b: 2, c: 3 }
 * const f = (n: number) => (n % 2 === 0 ? Result.succeed(n) : Result.fail(n))
 * assert.deepStrictEqual(Record.partition(x, f), [{ a: 1, c: 3 }, { b: 2 }])
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const partition = /*#__PURE__*/dual(2, (self, f) => {
  const left = empty();
  const right = empty();
  for (const key of keys(self)) {
    const e = f(self[key], key);
    if (R.isFailure(e)) {
      left[key] = e.failure;
    } else {
      right[key] = e.success;
    }
  }
  return [left, right];
});
/**
 * Partitions a record of `Result` values into two separate records,
 * one with the `Err` values and one with the `Ok` values.
 *
 * @example
 * ```ts
 * import { Record, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.separate({ a: Result.fail("e"), b: Result.succeed(1) }),
 *   [{ a: "e" }, { b: 1 }]
 * )
 * ```
 *
 * @category filtering
 * @since 2.0.0
 */
export const separate = /*#__PURE__*/partition(identity);
/**
 * Retrieve the keys of a given record as an array.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.keys({ a: 1, b: 2, c: 3 }), ["a", "b", "c"])
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
export const keys = self => Object.keys(self);
/**
 * Retrieve the values of a given record as an array.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.values({ a: 1, b: 2, c: 3 }), [1, 2, 3])
 * ```
 *
 * @category getters
 * @since 2.0.0
 */
export const values = self => collect(self, (_, a) => a);
/**
 * Add a new key-value pair or update an existing key's value in a record.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.set("a", 5)({ a: 1, b: 2 }), { a: 5, b: 2 })
 * assert.deepStrictEqual(Record.set("c", 5)({ a: 1, b: 2 }), { a: 1, b: 2, c: 5 })
 * ```
 *
 * @category utils
 * @since 2.0.0
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => {
  return {
    ...self,
    [key]: value
  };
});
/**
 * Check if all the keys and values in one record are also found in another record.
 * Uses the provided equivalence function to compare values.
 *
 * @example
 * ```ts
 * import { Equal, Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const isSubrecord = Record.isSubrecordBy(Equal.asEquivalence<number>())
 *
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1 } as Record<string, number>, { a: 1, b: 2 }),
 *   true
 * )
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1, b: 2 }, { a: 1 } as Record<string, number>),
 *   false
 * )
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export const isSubrecordBy = equivalence => dual(2, (self, that) => {
  for (const key of keys(self)) {
    if (!has(that, key) || !equivalence(self[key], that[key])) {
      return false;
    }
  }
  return true;
});
/**
 * Check if one record is a subrecord of another, meaning it contains all the keys and values found in the second record.
 * This comparison uses default equality checks (`Equal.equivalence()`).
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1 } as Record<string, number>, { a: 1, b: 2 }),
 *   true
 * )
 * assert.deepStrictEqual(
 *   Record.isSubrecord({ a: 1, b: 2 }, { a: 1 } as Record<string, number>),
 *   false
 * )
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export const isSubrecord = /*#__PURE__*/isSubrecordBy(/*#__PURE__*/Equal.asEquivalence());
/**
 * Reduce a record to a single value by combining its entries with a specified function.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.reduce({ a: 1, b: 2, c: 3 }, 0, (acc, value, key) => acc + value),
 *   6
 * )
 * ```
 *
 * @category folding
 * @since 2.0.0
 */
export const reduce = /*#__PURE__*/dual(3, (self, zero, f) => {
  let out = zero;
  for (const key of keys(self)) {
    out = f(out, self[key], key);
  }
  return out;
});
/**
 * Check if all entries in a record meet a specific condition.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.every({ a: 1, b: 2 }, (n) => n > 0), true)
 * assert.deepStrictEqual(Record.every({ a: 1, b: -1 }, (n) => n > 0), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export const every = /*#__PURE__*/dual(2, (self, refinement) => {
  for (const key of keys(self)) {
    if (!refinement(self[key], key)) {
      return false;
    }
  }
  return true;
});
/**
 * Check if any entry in a record meets a specific condition.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 1), true)
 * assert.deepStrictEqual(Record.some({ a: 1, b: 2 }, (n) => n > 2), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export const some = /*#__PURE__*/dual(2, (self, predicate) => {
  for (const key of keys(self)) {
    if (predicate(self[key], key)) {
      return true;
    }
  }
  return false;
});
/**
 * Merge two records, preserving entries that exist in either of the records.
 * For keys that exist in both records, the provided combine function is used to merge the values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.union({ a: 1, b: 2 }, { b: 3, c: 4 }, (a, b) => a + b),
 *   { a: 1, b: 5, c: 4 }
 * )
 * ```
 *
 * @category combining
 * @since 2.0.0
 */
export const union = /*#__PURE__*/dual(3, (self, that, combine) => {
  if (isEmptyRecord(self)) {
    return {
      ...that
    };
  }
  if (isEmptyRecord(that)) {
    return {
      ...self
    };
  }
  const out = empty();
  for (const key of keys(self)) {
    if (has(that, key)) {
      out[key] = combine(self[key], that[key]);
    } else {
      out[key] = self[key];
    }
  }
  for (const key of keys(that)) {
    if (!has(out, key)) {
      out[key] = that[key];
    }
  }
  return out;
});
/**
 * Merge two records, retaining only the entries that exist in both records.
 * For intersecting keys, the provided combine function is used to merge the values.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.intersection({ a: 1, b: 2 }, { b: 3, c: 4 }, (a, b) => a + b),
 *   { b: 5 }
 * )
 * ```
 *
 * @category combining
 * @since 2.0.0
 */
export const intersection = /*#__PURE__*/dual(3, (self, that, combine) => {
  const out = empty();
  if (isEmptyRecord(self) || isEmptyRecord(that)) {
    return out;
  }
  for (const key of keys(self)) {
    if (has(that, key)) {
      out[key] = combine(self[key], that[key]);
    }
  }
  return out;
});
/**
 * Merge two records, preserving only the entries that are unique to each record.
 * Keys that exist in both records are excluded from the result.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Record.difference({ a: 1, b: 2 }, { b: 3, c: 4 }),
 *   { a: 1, c: 4 }
 * )
 * ```
 *
 * @category combining
 * @since 2.0.0
 */
export const difference = /*#__PURE__*/dual(2, (self, that) => {
  if (isEmptyRecord(self)) {
    return {
      ...that
    };
  }
  if (isEmptyRecord(that)) {
    return {
      ...self
    };
  }
  const out = {};
  for (const key of keys(self)) {
    if (!has(that, key)) {
      out[key] = self[key];
    }
  }
  for (const key of keys(that)) {
    if (!has(self, key)) {
      out[key] = that[key];
    }
  }
  return out;
});
/**
 * Create an `Equivalence` for records using the provided `Equivalence` for values.
 * Two records are considered equivalent if they have the same keys and their corresponding values are equivalent.
 *
 * @example
 * ```ts
 * import { Equal, Record } from "effect"
 * import * as assert from "node:assert"
 *
 * const recordEquivalence = Record.makeEquivalence(Equal.asEquivalence<number>())
 *
 * assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
 * assert.deepStrictEqual(recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
 * ```
 *
 * @category instances
 * @since 2.0.0
 */
export const makeEquivalence = equivalence => {
  const is = isSubrecordBy(equivalence);
  return (self, that) => is(self, that) && is(that, self);
};
/**
 * Create a non-empty record from a single element.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Record.singleton("a", 1), { a: 1 })
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const singleton = (key, value) => ({
  [key]: value
});
/**
 * A `Reducer` for combining `Record`s using union.
 *
 * Values for keys that exist in both records are combined using the provided `Combiner`.
 *
 * @since 4.0.0
 */
export function makeReducerUnion(combiner) {
  return Reducer.make((self, that) => union(self, that, combiner.combine), {});
}
/**
 * A `Reducer` for combining `Record`s using intersection.
 *
 * Values are combined using the provided `Combiner`.
 *
 * @since 4.0.0
 */
export function makeReducerIntersection(combiner) {
  return Reducer.make((self, that) => intersection(self, that, combiner.combine), {});
}
/**
 * Returns the first entry that satisfies the specified
 * predicate, or `None` if no such entry exists.
 *
 * @example
 * ```ts
 * import { Record } from "effect"
 *
 * const record = { a: 1, b: 2, c: 3 }
 * const result = Record.findFirst(
 *   record,
 *   (value, key) => value > 1 && key !== "b"
 * )
 * console.log(result) // Option.Some(["c", 3])
 * ```
 *
 * @category elements
 * @since 3.14.0
 */
export const findFirst = /*#__PURE__*/dual(2, (self, f) => {
  const k = keys(self);
  for (let i = 0; i < k.length; i++) {
    const key = k[i];
    if (f(self[key], key)) {
      return Option.some([key, self[key]]);
    }
  }
  return Option.none();
});
//# sourceMappingURL=Record.js.map