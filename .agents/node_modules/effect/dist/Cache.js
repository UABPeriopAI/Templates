/**
 * @since 4.0.0
 */
import * as Context from "./Context.js";
import * as Deferred from "./Deferred.js";
import * as Duration from "./Duration.js";
import { dual } from "./Function.js";
import * as core from "./internal/core.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as effect from "./internal/effect.js";
import * as Iterable from "./Iterable.js";
import * as MutableHashMap from "./MutableHashMap.js";
import * as Option from "./Option.js";
import * as Result from "./Result.js";
const TypeId = "~effect/Cache";
/**
 * Creates a cache with dynamic time-to-live based on the result and key.
 *
 * The timeToLive function receives both the exit result and the key, allowing
 * for flexible TTL policies based on success/failure state and key characteristics.
 *
 * @example
 * ```ts
 * import { Cache, Effect, Exit } from "effect"
 *
 * // Cache with TTL based on computed value
 * const userCache = Effect.gen(function*() {
 *   const cache = yield* Cache.makeWith(
 *     (id: number) => Effect.succeed({ id, active: id % 2 === 0 }),
 *     {
 *       capacity: 1000,
 *       timeToLive(exit) {
 *         if (Exit.isSuccess(exit)) {
 *           const user = exit.value
 *           return user.active ? "1 hour" : "5 minutes"
 *         }
 *         return "30 seconds"
 *       }
 *     }
 *   )
 *
 *   return cache
 * })
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const makeWith = (lookup, options) => effect.contextWith(context => {
  const self = Object.create(Proto);
  self.lookup = key => effect.updateContext(lookup(key), input => Context.merge(context, input));
  self.map = MutableHashMap.make();
  self.capacity = options.capacity;
  self.timeToLive = options.timeToLive ? (exit, key) => Duration.fromInputUnsafe(options.timeToLive(exit, key)) : defaultTimeToLive;
  return effect.succeed(self);
});
/**
 * Creates a cache with a fixed time-to-live for all entries.
 *
 * This is the basic cache constructor where all entries share the same TTL.
 * The lookup function will be called when a key is not found or has expired.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Basic cache with string keys
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make<string, number>({
 *     capacity: 100,
 *     lookup: (key) => Effect.succeed(key.length)
 *   })
 *
 *   const result1 = yield* Cache.get(cache, "hello")
 *   const result2 = yield* Cache.get(cache, "world")
 *   console.log({ result1, result2 }) // { result1: 5, result2: 5 }
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Cache with TTL and async lookup
 * const fetchUserCache = Effect.gen(function*() {
 *   const cache = yield* Cache.make<
 *     number,
 *     { name: string; email: string },
 *     string
 *   >({
 *     capacity: 500,
 *     lookup: (userId) =>
 *       Effect.tryPromise({
 *         try: () => fetch(`/api/users/${userId}`).then((r) => r.json()),
 *         catch: () => "Failed to fetch user"
 *       }),
 *     timeToLive: "15 minutes"
 *   })
 *
 *   // First call fetches from API, second call returns cached result
 *   const user1 = yield* Cache.get(cache, 123)
 *   const user2 = yield* Cache.get(cache, 123) // From cache
 *   return { user1, user2 }
 * })
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => makeWith(options.lookup, {
  ...options,
  timeToLive: options.timeToLive ? () => options.timeToLive : defaultTimeToLive
});
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  toJSON() {
    return {
      _id: "Cache",
      capacity: this.capacity,
      map: this.map
    };
  }
};
const defaultTimeToLive = (_, _key) => Duration.infinity;
/**
 * Retrieves the value associated with the specified key from the cache.
 *
 * If the key is not present or has expired, it will invoke the lookup function
 * to construct the value, store it in the cache, and return it.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Cache miss - triggers lookup function
 *   const result1 = yield* Cache.get(cache, "hello")
 *   console.log(result1) // 5
 *
 *   // Cache hit - returns cached value without lookup
 *   const result2 = yield* Cache.get(cache, "hello")
 *   console.log(result2) // 5 (from cache)
 *
 *   return { result1, result2 }
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Error handling when lookup fails
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make<string, number, string>({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       key === "error"
 *         ? Effect.fail("Lookup failed")
 *         : Effect.succeed(key.length)
 *   })
 *
 *   // Successful lookup
 *   const success = yield* Cache.get(cache, "hello")
 *   console.log(success) // 5
 *
 *   // Failed lookup - returns error
 *   const failure = yield* Effect.exit(Cache.get(cache, "error"))
 *   console.log(failure) // Exit.fail("Lookup failed")
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Concurrent access - multiple gets of same key only invoke lookup once
 * const program = Effect.gen(function*() {
 *   let lookupCount = 0
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       Effect.sync(() => {
 *         lookupCount++
 *         return key.length
 *       })
 *   })
 *
 *   // Multiple concurrent gets
 *   const results = yield* Effect.all([
 *     Cache.get(cache, "hello"),
 *     Cache.get(cache, "hello"),
 *     Cache.get(cache, "hello")
 *   ], { concurrency: "unbounded" })
 *
 *   console.log(results) // [5, 5, 5]
 *   console.log(lookupCount) // 1 (lookup called only once)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const get = /*#__PURE__*/dual(2, (self, key) => core.withFiber(fiber => {
  const oentry = MutableHashMap.get(self.map, key);
  if (Option.isSome(oentry) && !hasExpired(oentry.value, fiber)) {
    // Move the entry to the end of the map to keep it fresh
    MutableHashMap.remove(self.map, key);
    MutableHashMap.set(self.map, key, oentry.value);
    return Deferred.await(oentry.value.deferred);
  }
  const deferred = Deferred.makeUnsafe();
  const entry = {
    expiresAt: undefined,
    deferred
  };
  MutableHashMap.set(self.map, key, entry);
  if (Number.isFinite(self.capacity)) {
    checkCapacity(self);
  }
  return effect.onExit(self.lookup(key), exit => {
    Deferred.doneUnsafe(deferred, exit);
    const ttl = self.timeToLive(exit, key);
    if (Duration.isFinite(ttl)) {
      entry.expiresAt = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl);
    } else if (Duration.isZero(ttl)) {
      MutableHashMap.remove(self.map, key);
    }
    return effect.void;
  });
}));
const hasExpired = (entry, fiber) => {
  if (entry.expiresAt === undefined) {
    return false;
  }
  return fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() >= entry.expiresAt;
};
const checkCapacity = self => {
  let diff = MutableHashMap.size(self.map) - self.capacity;
  if (diff <= 0) return;
  // MutableHashMap has insertion order, so we can remove the oldest entries
  for (const [key] of self.map) {
    MutableHashMap.remove(self.map, key);
    diff--;
    if (diff === 0) return;
  }
};
/**
 * Retrieves the value associated with the specified key from the cache,
 * returning an `Option` that is `Some` if the key exists and has not expired,
 * or `None` if the key does not exist or has expired.
 *
 * Unlike `get`, this function will not invoke the lookup function if the key
 * is missing or expired.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // No value in cache yet - returns None without lookup
 *   const empty = yield* Cache.getOption(cache, "hello")
 *   console.log(empty) // Option.none()
 *
 *   // Populate cache using get
 *   yield* Cache.get(cache, "hello")
 *
 *   // Now getOption returns the cached value
 *   const cached = yield* Cache.getOption(cache, "hello")
 *   console.log(cached) // Option.some(5)
 *
 *   return { empty, cached }
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * // Expired entries return None
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length),
 *     timeToLive: "1 hour"
 *   })
 *
 *   // Add value to cache
 *   yield* Cache.get(cache, "hello")
 *
 *   // Value exists before expiration
 *   const beforeExpiry = yield* Cache.getOption(cache, "hello")
 *   console.log(beforeExpiry) // Option.some(5)
 *
 *   // Simulate time passing
 *   yield* TestClock.adjust("2 hours")
 *
 *   // Value expired - returns None
 *   const afterExpiry = yield* Cache.getOption(cache, "hello")
 *   console.log(afterExpiry) // Option.none()
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Deferred, Effect, Fiber } from "effect"
 *
 * // Waits for ongoing computation to complete
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<void>()
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (_key: string) => Deferred.await(deferred).pipe(Effect.as(42))
 *   })
 *
 *   // Start lookup in background
 *   const getFiber = yield* Effect.forkChild(Cache.get(cache, "key"))
 *
 *   // getOption waits for ongoing computation
 *   const optionFiber = yield* Effect.forkChild(Cache.getOption(cache, "key"))
 *
 *   // Complete the computation
 *   yield* Deferred.succeed(deferred, void 0)
 *
 *   const result = yield* Fiber.join(optionFiber)
 *   console.log(result) // Option.some(42)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const getOption = /*#__PURE__*/dual(2, (self, key) => core.withFiber(fiber => {
  const entry = getImpl(self, key, fiber);
  return entry ? effect.asSome(Deferred.await(entry.deferred)) : effect.succeedNone;
}));
const getImpl = (self, key, fiber, isRead = true) => {
  const oentry = MutableHashMap.get(self.map, key);
  if (Option.isNone(oentry)) {
    return undefined;
  } else if (hasExpired(oentry.value, fiber)) {
    MutableHashMap.remove(self.map, key);
    return undefined;
  } else if (isRead) {
    MutableHashMap.remove(self.map, key);
    MutableHashMap.set(self.map, key, oentry.value);
  }
  return oentry.value;
};
/**
 * Retrieves the value associated with the specified key from the cache, only if
 * it contains a resolved successful value.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const getSuccess = /*#__PURE__*/dual(2, (self, key) => core.withFiber(fiber => {
  const exit = getImpl(self, key, fiber)?.deferred.effect;
  if (exit && effect.exitIsSuccess(exit)) {
    return effect.succeedSome(exit.value);
  }
  return effect.succeedNone;
}));
/**
 * Sets the value associated with the specified key in the cache. This will
 * overwrite any existing value for that key, skipping the lookup function.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Set a value directly without invoking lookup
 *   yield* Cache.set(cache, "hello", 42)
 *   const result = yield* Cache.get(cache, "hello")
 *   console.log(result) // 42 (not 5 from lookup)
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Overwriting existing cached values
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // First get populates via lookup
 *   const original = yield* Cache.get(cache, "test") // 4
 *
 *   // Set overwrites the cached value
 *   yield* Cache.set(cache, "test", 999)
 *   const updated = yield* Cache.get(cache, "test") // 999
 *
 *   console.log({ original, updated })
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * // TTL behavior with set operations
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length),
 *     timeToLive: "1 hour"
 *   })
 *
 *   // Set value with TTL applied
 *   yield* Cache.set(cache, "temporary", 123)
 *   console.log(yield* Cache.has(cache, "temporary")) // true
 *
 *   // Advance time past TTL
 *   yield* TestClock.adjust("2 hours")
 *   console.log(yield* Cache.has(cache, "temporary")) // false
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Capacity enforcement with set operations
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 2,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Fill cache to capacity
 *   yield* Cache.set(cache, "a", 1)
 *   yield* Cache.set(cache, "b", 2)
 *   console.log(yield* Cache.size(cache)) // 2
 *
 *   // Adding another entry evicts oldest
 *   yield* Cache.set(cache, "c", 3)
 *   console.log(yield* Cache.size(cache)) // 2
 *   console.log(yield* Cache.has(cache, "a")) // false (evicted)
 *   console.log(yield* Cache.has(cache, "c")) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => core.withFiber(fiber => {
  const exit = core.exitSucceed(value);
  const deferred = Deferred.makeUnsafe();
  Deferred.doneUnsafe(deferred, exit);
  const ttl = self.timeToLive(exit, key);
  if (Duration.isZero(ttl)) {
    MutableHashMap.remove(self.map, key);
    return effect.void;
  }
  MutableHashMap.set(self.map, key, {
    deferred,
    expiresAt: Duration.isFinite(ttl) ? fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl) : undefined
  });
  checkCapacity(self);
  return effect.void;
}));
/**
 * Checks if the cache contains an entry for the specified key.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Check non-existent key
 *   console.log(yield* Cache.has(cache, "missing")) // false
 *
 *   // Add entry and check existence
 *   yield* Cache.get(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // true
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * // TTL expiration behavior
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length),
 *     timeToLive: "1 hour"
 *   })
 *
 *   // Add entry with TTL
 *   yield* Cache.get(cache, "expires")
 *   console.log(yield* Cache.has(cache, "expires")) // true
 *
 *   // Still valid before expiration
 *   yield* TestClock.adjust("30 minutes")
 *   console.log(yield* Cache.has(cache, "expires")) // true
 *
 *   // Expired after TTL
 *   yield* TestClock.adjust("31 minutes")
 *   console.log(yield* Cache.has(cache, "expires")) // false
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Checking multiple keys efficiently
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 100,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Populate some entries
 *   yield* Cache.set(cache, "apple", 5)
 *   yield* Cache.set(cache, "banana", 6)
 *
 *   // Check multiple keys
 *   const keys = ["apple", "banana", "cherry", "date"]
 *   for (const key of keys) {
 *     const exists = yield* Cache.has(cache, key)
 *     console.log(`${key}: ${exists}`)
 *   }
 *   // Output:
 *   // apple: true
 *   // banana: true
 *   // cherry: false
 *   // date: false
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const has = /*#__PURE__*/dual(2, (self, key) => core.withFiber(fiber => {
  const oentry = getImpl(self, key, fiber, false);
  return effect.succeed(oentry !== undefined);
}));
/**
 * Invalidates the entry associated with the specified key in the cache.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add a value to the cache
 *   yield* Cache.get(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // true
 *
 *   // Invalidate the entry
 *   yield* Cache.invalidate(cache, "hello")
 *   console.log(yield* Cache.has(cache, "hello")) // false
 *
 *   // Invalidating non-existent keys doesn't error
 *   yield* Cache.invalidate(cache, "nonexistent")
 *
 *   // Get after invalidation will invoke lookup again
 *   let lookupCount = 0
 *   const cache2 = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       Effect.sync(() => {
 *         lookupCount++
 *         return key.length
 *       })
 *   })
 *
 *   yield* Cache.get(cache2, "test") // lookupCount = 1
 *   yield* Cache.invalidate(cache2, "test")
 *   yield* Cache.get(cache2, "test") // lookupCount = 2 (lookup called again)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidate = /*#__PURE__*/dual(2, (self, key) => effect.sync(() => {
  MutableHashMap.remove(self.map, key);
}));
/**
 * Conditionally invalidates the entry associated with the specified key in the cache
 * if the predicate returns true for the cached value.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add values to the cache
 *   yield* Cache.get(cache, "hello") // value = 5
 *   yield* Cache.get(cache, "hi") // value = 2
 *
 *   // Invalidate when value equals 5
 *   const invalidated1 = yield* Cache.invalidateWhen(
 *     cache,
 *     "hello",
 *     (value) => value === 5
 *   )
 *   console.log(invalidated1) // true
 *   console.log(yield* Cache.has(cache, "hello")) // false
 *
 *   // Don't invalidate when predicate doesn't match
 *   const invalidated2 = yield* Cache.invalidateWhen(
 *     cache,
 *     "hi",
 *     (value) => value === 5
 *   )
 *   console.log(invalidated2) // false
 *   console.log(yield* Cache.has(cache, "hi")) // true (still present)
 *
 *   // Returns false for non-existent keys
 *   const invalidated3 = yield* Cache.invalidateWhen(
 *     cache,
 *     "nonexistent",
 *     () => true
 *   )
 *   console.log(invalidated3) // false
 *
 *   // Returns false for failed cached values
 *   const cacheWithErrors = yield* Cache.make<string, number, string>({
 *     capacity: 10,
 *     lookup: (key: string) =>
 *       key === "fail" ? Effect.fail("error") : Effect.succeed(key.length)
 *   })
 *
 *   yield* Effect.exit(Cache.get(cacheWithErrors, "fail"))
 *   const invalidated4 = yield* Cache.invalidateWhen(
 *     cacheWithErrors,
 *     "fail",
 *     () => true
 *   )
 *   console.log(invalidated4) // false (can't invalidate failed values)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidateWhen = /*#__PURE__*/dual(3, (self, key, f) => core.withFiber(fiber => {
  const oentry = getImpl(self, key, fiber, false);
  if (oentry === undefined) {
    return effect.succeed(false);
  }
  return Deferred.await(oentry.deferred).pipe(effect.map(value => {
    if (f(value)) {
      MutableHashMap.remove(self.map, key);
      return true;
    }
    return false;
  }), effect.catchCause(() => effect.succeed(false)));
}));
/**
 * Forces a refresh of the value associated with the specified key in the cache.
 *
 * It will always invoke the lookup function to construct a new value,
 * overwriting any existing value for that key.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Force refresh of existing cached values
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.sync(() => `${key}-${++counter}`)
 *   })
 *
 *   // Initial cache population
 *   const value1 = yield* Cache.get(cache, "user")
 *   console.log(value1) // "user-1"
 *
 *   // Get from cache (no lookup)
 *   const value2 = yield* Cache.get(cache, "user")
 *   console.log(value2) // "user-1" (same value)
 *
 *   // Force refresh - always calls lookup
 *   const refreshed = yield* Cache.refresh(cache, "user")
 *   console.log(refreshed) // "user-2" (new value)
 *
 *   // Subsequent gets return refreshed value
 *   const value3 = yield* Cache.get(cache, "user")
 *   console.log(value3) // "user-2"
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * // Refresh resets TTL (Time To Live)
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length),
 *     timeToLive: "1 hour"
 *   })
 *
 *   yield* Cache.get(cache, "test")
 *   yield* TestClock.adjust("45 minutes")
 *
 *   // Entry would normally expire in 15 minutes
 *   console.log(yield* Cache.has(cache, "test")) // true
 *
 *   // Refresh resets the TTL to full 1 hour
 *   yield* Cache.refresh(cache, "test")
 *   yield* TestClock.adjust("30 minutes")
 *
 *   // Still valid because TTL was reset
 *   console.log(yield* Cache.has(cache, "test")) // true
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Refresh non-existent keys
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(`value-for-${key}`)
 *   })
 *
 *   // Refresh non-existent key creates new entry
 *   const result = yield* Cache.refresh(cache, "newKey")
 *   console.log(result) // "value-for-newKey"
 *
 *   // Verify it's now cached
 *   console.log(yield* Cache.has(cache, "newKey")) // true
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const refresh = /*#__PURE__*/dual(2, (self, key) => core.withFiber(fiber => {
  const deferred = Deferred.makeUnsafe();
  const entry = {
    expiresAt: undefined,
    deferred
  };
  const existing = getImpl(self, key, fiber, false) !== undefined;
  if (!existing) {
    MutableHashMap.set(self.map, key, entry);
    checkCapacity(self);
  }
  return effect.onExit(self.lookup(key), exit => {
    Deferred.doneUnsafe(deferred, exit);
    const ttl = self.timeToLive(exit, key);
    if (Duration.isZero(ttl)) {
      MutableHashMap.remove(self.map, key);
      return effect.void;
    }
    entry.expiresAt = Duration.isFinite(ttl) ? fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl) : undefined;
    if (existing) {
      MutableHashMap.set(self.map, key, entry);
    }
    return effect.void;
  });
}));
/**
 * Invalidates all entries in the cache.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Clear all cached entries at once
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Populate cache with multiple entries
 *   yield* Cache.get(cache, "apple")
 *   yield* Cache.get(cache, "banana")
 *   yield* Cache.get(cache, "cherry")
 *
 *   console.log(yield* Cache.size(cache)) // 3
 *   console.log(yield* Cache.has(cache, "apple")) // true
 *
 *   // Clear all entries
 *   yield* Cache.invalidateAll(cache)
 *
 *   // Verify cache is empty
 *   console.log(yield* Cache.size(cache)) // 0
 *   console.log(yield* Cache.has(cache, "apple")) // false
 *   console.log(yield* Cache.has(cache, "banana")) // false
 *   console.log(yield* Cache.has(cache, "cherry")) // false
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidateAll = self => effect.sync(() => {
  MutableHashMap.clear(self.map);
});
/**
 * Retrieves the approximate number of entries in the cache.
 *
 * Note that expired entries are counted until they are accessed and removed.
 * The size reflects the current number of entries stored, not the number
 * of valid entries.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Empty cache has size 0
 *   const emptySize = yield* Cache.size(cache)
 *   console.log(emptySize) // 0
 *
 *   // Add entries and check size
 *   yield* Cache.get(cache, "hello")
 *   yield* Cache.get(cache, "world")
 *   const sizeAfterAdding = yield* Cache.size(cache)
 *   console.log(sizeAfterAdding) // 2
 *
 *   // Size decreases after invalidation
 *   yield* Cache.invalidate(cache, "hello")
 *   const sizeAfterInvalidation = yield* Cache.size(cache)
 *   console.log(sizeAfterInvalidation) // 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const size = self => effect.sync(() => MutableHashMap.size(self.map));
/**
 * Retrieves all active keys from the cache, automatically filtering out expired entries.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * // Basic key enumeration
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add some entries to the cache
 *   yield* Cache.get(cache, "hello")
 *   yield* Cache.get(cache, "world")
 *   yield* Cache.get(cache, "cache")
 *
 *   // Retrieve all active keys
 *   const keys = yield* Cache.keys(cache)
 *
 *   console.log(Array.from(keys)) // ["hello", "world", "cache"]
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const keys = self => core.withFiber(fiber => {
  const now = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe();
  return effect.succeed(Iterable.filterMap(self.map, ([key, entry]) => {
    if (entry.expiresAt === undefined || entry.expiresAt > now) {
      return Result.succeed(key);
    }
    MutableHashMap.remove(self.map, key);
    return Result.failVoid;
  }));
});
/**
 * Retrieves all successfully cached values from the cache, excluding failed
 * lookups and expired entries.
 *
 * @example
 * ```ts
 * import { Cache, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cache = yield* Cache.make({
 *     capacity: 10,
 *     lookup: (key: string) => Effect.succeed(key.length)
 *   })
 *
 *   // Add some values to the cache
 *   yield* Cache.get(cache, "a")
 *   yield* Cache.get(cache, "ab")
 *   yield* Cache.get(cache, "abc")
 *
 *   // Retrieve all cached values
 *   const values = yield* Cache.values(cache)
 *   const valuesArray = Array.from(values).sort()
 *
 *   console.log(valuesArray) // [1, 2, 3]
 * })
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const values = self => effect.map(entries(self), Iterable.map(([, value]) => value));
/**
 * Retrieves all key-value pairs from the cache as an iterable. This function
 * only returns entries with successfully resolved values, filtering out any
 * failed lookups or expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const entries = self => core.withFiber(fiber => {
  const now = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe();
  return effect.succeed(Iterable.filterMap(self.map, ([key, entry]) => {
    if (entry.expiresAt === undefined || entry.expiresAt > now) {
      const exit = entry.deferred.effect;
      return !core.isExit(exit) || effect.exitIsFailure(exit) ? Result.failVoid : Result.succeed([key, exit.value]);
    }
    MutableHashMap.remove(self.map, key);
    return Result.failVoid;
  }));
});
//# sourceMappingURL=Cache.js.map