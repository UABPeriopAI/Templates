import * as Equal from "./Equal.js";
import { format } from "./Formatter.js";
import { dual } from "./Function.js";
import * as Hash from "./Hash.js";
import { NodeInspectSymbol, toJson } from "./Inspectable.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
const TypeId = "~effect/collections/MutableHashMap";
/**
 * Checks if the specified value is a `MutableHashMap`, `false` otherwise.
 *
 * @category refinements
 * @since 4.0.0
 */
export const isMutableHashMap = value => hasProperty(value, TypeId);
const MutableHashMapProto = {
  [TypeId]: TypeId,
  [Symbol.iterator]() {
    return this.backing[Symbol.iterator]();
  },
  toString() {
    return `MutableHashMap(${format(Array.from(this))})`;
  },
  toJSON() {
    return {
      _id: "MutableHashMap",
      values: toJson(Array.from(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Creates an empty MutableHashMap.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.empty<string, number>()
 *
 * // Add some entries
 * MutableHashMap.set(map, "key1", 42)
 * MutableHashMap.set(map, "key2", 100)
 *
 * console.log(MutableHashMap.size(map)) // 2
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = () => {
  const self = Object.create(MutableHashMapProto);
  self.backing = new Map();
  self.buckets = new Map();
  return self;
};
/**
 * Creates a MutableHashMap from a variable number of key-value pairs.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["key1", 42],
 *   ["key2", 100],
 *   ["key3", 200]
 * )
 *
 * console.log(MutableHashMap.get(map, "key1")) // Some(42)
 * console.log(MutableHashMap.size(map)) // 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = (...entries) => fromIterable(entries);
/**
 * Creates a MutableHashMap from an iterable collection of key-value pairs.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const entries = [
 *   ["apple", 1],
 *   ["banana", 2],
 *   ["cherry", 3]
 * ] as const
 *
 * const map = MutableHashMap.fromIterable(entries)
 *
 * console.log(MutableHashMap.get(map, "banana")) // Some(2)
 * console.log(MutableHashMap.size(map)) // 3
 *
 * // Works with any iterable
 * const fromMap = MutableHashMap.fromIterable(new Map([["x", 10], ["y", 20]]))
 * console.log(MutableHashMap.get(fromMap, "x")) // Some(10)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromIterable = entries => {
  const self = empty();
  for (const [key, value] of entries) {
    set(self, key, value);
  }
  return self;
};
/**
 * Retrieves the value associated with the specified key from the MutableHashMap.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(["key1", 42], ["key2", 100])
 *
 * console.log(MutableHashMap.get(map, "key1")) // Some(42)
 * console.log(MutableHashMap.get(map, "key3")) // None
 *
 * // Pipe-able version
 * const getValue = MutableHashMap.get("key1")
 * console.log(getValue(map)) // Some(42)
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const get = /*#__PURE__*/dual(2, (self, key) => {
  if (self.backing.has(key)) {
    return Option.some(self.backing.get(key));
  } else if (isSimpleKey(key)) {
    return Option.none();
  }
  const refKey = referentialKeysCache.get(self);
  if (refKey !== undefined) {
    return self.backing.has(refKey) ? Option.some(self.backing.get(refKey)) : Option.none();
  }
  const hash = Hash.hash(key);
  const bucket = self.buckets.get(hash);
  if (bucket === undefined) {
    return Option.none();
  }
  return getFromBucket(self, bucket, key);
});
const referentialKeysCache = /*#__PURE__*/new WeakMap();
const isSimpleKey = u => typeof u !== "object" && typeof u !== "function";
/**
 * Extracts all keys from the MutableHashMap into an array.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["apple", 1],
 *   ["banana", 2],
 *   ["cherry", 3]
 * )
 *
 * const allKeys = Array.from(MutableHashMap.keys(map))
 * console.log(allKeys) // ["apple", "banana", "cherry"]
 *
 * // Useful for iteration or validation
 * const hasRequiredKeys = allKeys.includes("apple") && allKeys.includes("banana")
 * ```
 *
 * @since 3.8.0
 * @category elements
 */
export const keys = self => self.backing.keys();
/**
 * Extracts all values from the MutableHashMap into an array.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["apple", 1],
 *   ["banana", 2],
 *   ["cherry", 3]
 * )
 *
 * const allValues = Array.from(MutableHashMap.values(map))
 * console.log(allValues) // [1, 2, 3]
 *
 * // Useful for calculations
 * const total = allValues.reduce((sum, value) => sum + value, 0)
 * console.log(total) // 6
 *
 * // Filter values
 * const largeValues = allValues.filter((value) => value > 1)
 * console.log(largeValues) // [2, 3]
 * ```
 *
 * @since 3.8.0
 * @category elements
 */
export const values = self => self.backing.values();
const getFromBucket = (self, bucket, key) => {
  for (let i = 0, len = bucket.length; i < len; i++) {
    if (Equal.equals(key, bucket[i])) {
      const refKey = bucket[i];
      referentialKeysCache.set(key, refKey);
      return Option.some(self.backing.get(refKey));
    }
  }
  return Option.none();
};
/**
 * Checks if the MutableHashMap contains the specified key.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(["key1", 42], ["key2", 100])
 *
 * console.log(MutableHashMap.has(map, "key1")) // true
 * console.log(MutableHashMap.has(map, "key3")) // false
 *
 * // Pipe-able version
 * const hasKey = MutableHashMap.has("key1")
 * console.log(hasKey(map)) // true
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const has = /*#__PURE__*/dual(2, (self, key) => Option.isSome(get(self, key)));
/**
 * Sets a key-value pair in the MutableHashMap, mutating the map in place.
 * If the key already exists, its value is updated.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.empty<string, number>()
 *
 * // Add new entries
 * MutableHashMap.set(map, "key1", 42)
 * MutableHashMap.set(map, "key2", 100)
 *
 * console.log(MutableHashMap.get(map, "key1")) // Some(42)
 * console.log(MutableHashMap.size(map)) // 2
 *
 * // Update existing entry
 * MutableHashMap.set(map, "key1", 999)
 * console.log(MutableHashMap.get(map, "key1")) // Some(999)
 *
 * // Pipe-able version
 * const setKey = MutableHashMap.set("key3", 300)
 * setKey(map)
 * console.log(MutableHashMap.size(map)) // 3
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => {
  if (self.backing.has(key) || isSimpleKey(key)) {
    self.backing.set(key, value);
    return self;
  }
  let refKey = referentialKeysCache.get(self);
  if (refKey !== undefined && self.backing.has(refKey)) {
    self.backing.set(refKey, value);
    return self;
  }
  const hash = Hash.hash(key);
  const bucket = self.buckets.get(hash);
  if (bucket === undefined) {
    self.buckets.set(hash, [key]);
    self.backing.set(key, value);
    return self;
  }
  refKey = getRefKey(bucket, key);
  if (refKey === undefined) {
    bucket.push(key);
    refKey = key;
  }
  self.backing.set(refKey, value);
  return self;
});
const getRefKey = (bucket, key) => {
  for (let i = 0, len = bucket.length; i < len; i++) {
    if (Equal.equals(key, bucket[i])) {
      referentialKeysCache.set(key, bucket[i]);
      return bucket[i];
    }
  }
};
/**
 * Updates the value of the specified key within the MutableHashMap if it exists.
 * If the key doesn't exist, the map remains unchanged.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(["count", 5], ["total", 100])
 *
 * // Increment existing value
 * MutableHashMap.modify(map, "count", (n) => n + 1)
 * console.log(MutableHashMap.get(map, "count")) // Some(6)
 *
 * // Double existing value
 * MutableHashMap.modify(map, "total", (n) => n * 2)
 * console.log(MutableHashMap.get(map, "total")) // Some(200)
 *
 * // Try to modify non-existent key (no effect)
 * MutableHashMap.modify(map, "missing", (n) => n + 1)
 * console.log(MutableHashMap.has(map, "missing")) // false
 *
 * // Pipe-able version
 * const increment = MutableHashMap.modify("count", (n: number) => n + 1)
 * increment(map)
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const modify = /*#__PURE__*/dual(3, (self, key, f) => {
  const hasKey = self.backing.has(key);
  if (hasKey || isSimpleKey(key)) {
    if (hasKey) {
      self.backing.set(key, f(self.backing.get(key)));
    }
    return self;
  }
  let refKey = referentialKeysCache.get(self);
  if (refKey !== undefined && self.backing.has(refKey)) {
    self.backing.set(refKey, f(self.backing.get(refKey)));
    return self;
  }
  const hash = Hash.hash(key);
  const bucket = self.buckets.get(hash);
  if (bucket === undefined) {
    return self;
  }
  refKey = getRefKey(bucket, key);
  if (refKey === undefined) {
    return self;
  }
  self.backing.set(refKey, f(self.backing.get(refKey)));
  return self;
});
/**
 * Sets or removes the specified key in the MutableHashMap using an update function.
 * The function receives the current value as an Option and returns an Option.
 * If the function returns Some, the key is set to that value.
 * If the function returns None, the key is removed.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 * import * as Option from "effect/Option"
 *
 * const map = MutableHashMap.make(["count", 5])
 *
 * // Update existing key
 * MutableHashMap.modifyAt(
 *   map,
 *   "count",
 *   (option) => Option.map(option, (n) => n * 2)
 * )
 * console.log(MutableHashMap.get(map, "count")) // Some(10)
 *
 * // Add new key
 * MutableHashMap.modifyAt(
 *   map,
 *   "new",
 *   (option) => Option.isNone(option) ? Option.some(42) : option
 * )
 * console.log(MutableHashMap.get(map, "new")) // Some(42)
 *
 * // Remove key by returning None
 * MutableHashMap.modifyAt(map, "count", () => Option.none())
 * console.log(MutableHashMap.has(map, "count")) // false
 *
 * // Conditional update
 * MutableHashMap.modifyAt(
 *   map,
 *   "new",
 *   (option) => Option.filter(option, (n) => n > 50) // Remove if <= 50
 * )
 * console.log(MutableHashMap.has(map, "new")) // false (42 <= 50)
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const modifyAt = /*#__PURE__*/dual(3, (self, key, f) => {
  const current = get(self, key);
  const result = f(current);
  if (Option.isNone(result)) {
    if (Option.isSome(current)) {
      remove(self, key);
    }
    return self;
  }
  set(self, key, result.value);
  return self;
});
/**
 * Removes the specified key from the MutableHashMap, mutating the map in place.
 * If the key doesn't exist, the map remains unchanged.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["key1", 42],
 *   ["key2", 100],
 *   ["key3", 200]
 * )
 *
 * console.log(MutableHashMap.size(map)) // 3
 *
 * // Remove existing key
 * MutableHashMap.remove(map, "key2")
 * console.log(MutableHashMap.size(map)) // 2
 * console.log(MutableHashMap.has(map, "key2")) // false
 *
 * // Remove non-existent key (no effect)
 * MutableHashMap.remove(map, "nonexistent")
 * console.log(MutableHashMap.size(map)) // 2
 *
 * // Pipe-able version
 * const removeKey = MutableHashMap.remove("key1")
 * removeKey(map)
 * console.log(MutableHashMap.size(map)) // 1
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const remove = /*#__PURE__*/dual(2, (self, key_) => {
  if (isSimpleKey(key_)) {
    self.backing.delete(key_);
    return self;
  }
  const key = referentialKeysCache.get(self) ?? key_;
  const hash = Hash.hash(key);
  const bucket = self.buckets.get(hash);
  if (bucket === undefined) {
    return self;
  }
  for (let i = 0, len = bucket.length; i < len; i++) {
    const bkey = bucket[i];
    if (bkey === key || Equal.equals(key, bkey)) {
      self.backing.delete(bkey);
      bucket.splice(i, 1);
      break;
    }
  }
  if (bucket.length === 0) {
    self.buckets.delete(hash);
  }
  return self;
});
/**
 * Removes all key-value pairs from the MutableHashMap, mutating the map in place.
 * The map becomes empty after this operation.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.make(
 *   ["key1", 42],
 *   ["key2", 100],
 *   ["key3", 200]
 * )
 *
 * console.log(MutableHashMap.size(map)) // 3
 *
 * // Clear all entries
 * MutableHashMap.clear(map)
 *
 * console.log(MutableHashMap.size(map)) // 0
 * console.log(MutableHashMap.has(map, "key1")) // false
 *
 * // Can still add new entries after clearing
 * MutableHashMap.set(map, "new", 999)
 * console.log(MutableHashMap.size(map)) // 1
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const clear = self => {
  self.backing.clear();
  self.buckets.clear();
  return self;
};
/**
 * Returns the number of key-value pairs in the MutableHashMap.
 *
 * @example
 * ```ts
 * import * as MutableHashMap from "effect/MutableHashMap"
 *
 * const map = MutableHashMap.empty<string, number>()
 * console.log(MutableHashMap.size(map)) // 0
 *
 * MutableHashMap.set(map, "key1", 42)
 * MutableHashMap.set(map, "key2", 100)
 * console.log(MutableHashMap.size(map)) // 2
 *
 * MutableHashMap.remove(map, "key1")
 * console.log(MutableHashMap.size(map)) // 1
 *
 * MutableHashMap.clear(map)
 * console.log(MutableHashMap.size(map)) // 0
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const size = self => self.backing.size;
/**
 * @since 2.0.0
 */
export const isEmpty = self => self.backing.size === 0;
/**
 * @since 2.0.0
 */
export const forEach = /*#__PURE__*/dual(2, (self, f) => {
  self.backing.forEach(f);
});
//# sourceMappingURL=MutableHashMap.js.map