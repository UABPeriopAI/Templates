/**
 * @since 2.0.0
 */
import * as internal from "./internal/hashMap.js";
const TypeId = internal.HashMapTypeId;
/**
 * Checks if a value is a HashMap.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 * const notMap = { a: 1 }
 *
 * console.log(HashMap.isHashMap(map)) // true
 * console.log(HashMap.isHashMap(notMap)) // false
 * console.log(HashMap.isHashMap(null)) // false
 * ```
 *
 * @since 2.0.0
 * @category refinements
 */
export const isHashMap = internal.isHashMap;
/**
 * Creates a new empty `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.empty<string, number>()
 * console.log(HashMap.isEmpty(map)) // true
 * console.log(HashMap.size(map)) // 0
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = internal.empty;
/**
 * Constructs a new `HashMap` from an array of key/value pairs.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * console.log(HashMap.size(map)) // 3
 * console.log(HashMap.get(map, "b")) // Option.some(2)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = internal.make;
/**
 * Creates a new `HashMap` from an iterable collection of key/value pairs.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const entries = [["a", 1], ["b", 2], ["c", 3]] as const
 * const map = HashMap.fromIterable(entries)
 * console.log(HashMap.size(map)) // 3
 * console.log(HashMap.get(map, "a")) // Option.some(1)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromIterable = internal.fromIterable;
/**
 * Checks if the `HashMap` contains any entries.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const emptyMap = HashMap.empty<string, number>()
 * const nonEmptyMap = HashMap.make(["a", 1])
 *
 * console.log(HashMap.isEmpty(emptyMap)) // true
 * console.log(HashMap.isEmpty(nonEmptyMap)) // false
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const isEmpty = internal.isEmpty;
/**
 * Safely lookup the value for the specified key in the `HashMap` using the
 * internal hashing function.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 *
 * console.log(HashMap.get(map, "a")) // Option.some(1)
 * console.log(HashMap.get(map, "c")) // Option.none()
 *
 * // Using pipe syntax
 * const value = HashMap.get("b")(map)
 * console.log(value) // Option.some(2)
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const get = internal.get;
/**
 * Lookup the value for the specified key in the `HashMap` using a custom hash.
 *
 * @example
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 *
 * // Useful when implementing custom equality for complex keys
 * const userMap = HashMap.make(
 *   ["user123", { name: "Alice", role: "admin" }],
 *   ["user456", { name: "Bob", role: "user" }]
 * )
 *
 * // Use precomputed hash for performance in hot paths
 * const userId = "user123"
 * const precomputedHash = Hash.string(userId)
 *
 * // Lookup with custom hash (e.g., cached hash value)
 * const user = HashMap.getHash(userMap, userId, precomputedHash)
 * console.log(user) // Option.some({ name: "Alice", role: "admin" })
 *
 * // This avoids recomputing the hash when you already have it
 * const notFound = HashMap.getHash(userMap, "user999", Hash.string("user999"))
 * console.log(notFound) // Option.none()
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const getHash = internal.getHash;
/**
 * Unsafely lookup the value for the specified key in the `HashMap` using the
 * internal hashing function.
 *
 * ⚠️ **Warning**: This function throws an error if the key is not found.
 * Use `HashMap.get` for safe access that returns `Option`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * const config = HashMap.make(
 *   ["api_url", "https://api.example.com"],
 *   ["timeout", "5000"],
 *   ["retries", "3"]
 * )
 *
 * // Safe: use when you're certain the key exists
 * const apiUrl = HashMap.getUnsafe(config, "api_url") // "https://api.example.com"
 * console.log(`Connecting to: ${apiUrl}`)
 *
 * // Preferred: use get() for uncertain keys
 * const dbUrl = HashMap.get(config, "db_url") // Option.none()
 * if (Option.isSome(dbUrl)) {
 *   console.log(`Database: ${dbUrl.value}`)
 * }
 *
 * // This would throw: HashMap.getUnsafe(config, "db_url")
 * // Error: "HashMap.getUnsafe: key not found"
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export const getUnsafe = internal.getUnsafe;
/**
 * Checks if the specified key has an entry in the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 *
 * console.log(HashMap.has(map, "a")) // true
 * console.log(HashMap.has(map, "c")) // false
 *
 * // Using pipe syntax
 * const hasB = HashMap.has("b")(map)
 * console.log(hasB) // true
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const has = internal.has;
/**
 * Checks if the specified key has an entry in the `HashMap` using a custom
 * hash.
 *
 * @example
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 *
 * // Create a map with case-sensitive keys
 * const userMap = HashMap.make(
 *   ["Admin", { role: "administrator" }],
 *   ["User", { role: "standard" }]
 * )
 *
 * // Check with exact hash
 * const exactHash = Hash.string("Admin")
 * console.log(HashMap.hasHash(userMap, "Admin", exactHash)) // true
 *
 * // Check case-insensitive by using custom hash
 * const caseInsensitiveHash = Hash.string("admin".toLowerCase())
 * console.log(HashMap.hasHash(userMap, "admin", caseInsensitiveHash)) // false (different hash)
 * ```
 *
 * @since 2.0.0
 * @category elements
 */
export const hasHash = internal.hasHash;
/**
 * Checks if an element matching the given predicate exists in the given `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const hm = HashMap.make([1, "a"])
 * HashMap.hasBy(hm, (value, key) => value === "a" && key === 1) // -> true
 * HashMap.hasBy(hm, (value) => value === "b") // -> false
 * ```
 *
 * @since 3.16.0
 * @category elements
 */
export const hasBy = internal.hasBy;
/**
 * Sets the specified key to the specified value using the internal hashing
 * function.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1])
 * const map2 = HashMap.set(map1, "b", 2)
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.get(map2, "b")) // Option.some(2)
 *
 * // Original map is unchanged
 * console.log(HashMap.size(map1)) // 1
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const set = internal.set;
/**
 * Returns an `IterableIterator` of the keys within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const keys = Array.from(HashMap.keys(map))
 * console.log(keys.sort()) // ["a", "b", "c"]
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const keys = internal.keys;
/**
 * Returns an `IterableIterator` of the values within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const values = Array.from(HashMap.values(map))
 * console.log(values.sort()) // [1, 2, 3]
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const values = internal.values;
/**
 * Returns an `Array` of the values within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const employees = HashMap.make(
 *   ["alice", { department: "engineering", salary: 90000 }],
 *   ["bob", { department: "marketing", salary: 75000 }],
 *   ["charlie", { department: "engineering", salary: 95000 }]
 * )
 *
 * // Extract all employee records
 * const allEmployees = HashMap.toValues(employees)
 * console.log(allEmployees.length) // 3
 *
 * // Calculate total salary
 * const totalSalary = allEmployees.reduce((sum, emp) => sum + emp.salary, 0)
 * console.log(totalSalary) // 260000
 *
 * // Filter by department
 * const engineers = allEmployees.filter((emp) => emp.department === "engineering")
 * console.log(engineers.length) // 2
 * ```
 *
 * @since 3.13.0
 * @category getters
 */
export const toValues = self => Array.from(values(self));
/**
 * Returns an `IterableIterator` of the entries within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * // Create a configuration map
 * const config = HashMap.make(
 *   ["database.host", "localhost"],
 *   ["database.port", "5432"],
 *   ["cache.enabled", "true"]
 * )
 *
 * // Get entries iterator for processing
 * const entries = HashMap.entries(config)
 *
 * // Process each configuration entry
 * for (const [key, value] of entries) {
 *   console.log(`Setting ${key} = ${value}`)
 * }
 * // Setting database.host = localhost
 * // Setting database.port = 5432
 * // Setting cache.enabled = true
 *
 * // Convert to array when you need all entries at once
 * const allEntries = Array.from(HashMap.entries(config))
 * console.log(allEntries.length) // 3
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const entries = internal.entries;
/**
 * Returns an `Array<[K, V]>` of the entries within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const gameScores = HashMap.make(
 *   ["alice", 1250],
 *   ["bob", 980],
 *   ["charlie", 1100]
 * )
 *
 * // Convert to entries for processing
 * const scoreEntries = HashMap.toEntries(gameScores)
 *
 * // Sort by score (descending)
 * const leaderboard = scoreEntries
 *   .sort(([, a], [, b]) => b - a)
 *   .map(([player, score], rank) => `${rank + 1}. ${player}: ${score}`)
 *
 * console.log(leaderboard)
 * // ["1. alice: 1250", "2. charlie: 1100", "3. bob: 980"]
 *
 * // Convert back to HashMap if needed
 * const sortedMap = HashMap.fromIterable(scoreEntries)
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const toEntries = self => Array.from(entries(self));
/**
 * Returns the number of entries within the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const emptyMap = HashMap.empty<string, number>()
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 *
 * console.log(HashMap.size(emptyMap)) // 0
 * console.log(HashMap.size(map)) // 3
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const size = internal.size;
/**
 * Marks the `HashMap` as mutable for performance optimization during batch operations.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1])
 *
 * // Begin mutation for efficient batch operations
 * const mutable = HashMap.beginMutation(map)
 *
 * // Multiple operations are now more efficient
 * HashMap.set(mutable, "b", 2)
 * HashMap.set(mutable, "c", 3)
 * HashMap.remove(mutable, "a")
 *
 * // End mutation to get final immutable result
 * const result = HashMap.endMutation(mutable)
 * console.log(HashMap.size(result)) // 2
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const beginMutation = internal.beginMutation;
/**
 * Marks the `HashMap` as immutable, completing the mutation cycle.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * // Start with an existing map
 * const original = HashMap.make(["x", 10], ["y", 20])
 *
 * // Begin mutation for batch operations
 * const mutable = HashMap.beginMutation(original)
 *
 * // Perform multiple efficient operations
 * HashMap.set(mutable, "z", 30)
 * HashMap.remove(mutable, "x")
 * HashMap.set(mutable, "w", 40)
 *
 * // End mutation to get final immutable result
 * const final = HashMap.endMutation(mutable)
 *
 * console.log(HashMap.size(final)) // 3
 * console.log(HashMap.has(final, "x")) // false
 * console.log(HashMap.get(final, "z")) // Option.some(30)
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const endMutation = internal.endMutation;
/**
 * Mutates the `HashMap` within the context of the provided function.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1])
 * const map2 = HashMap.mutate(map1, (mutable) => {
 *   HashMap.set(mutable, "b", 2)
 *   HashMap.set(mutable, "c", 3)
 * })
 * // Returns a new HashMap with mutations applied
 * ```
 *
 * @since 2.0.0
 * @category mutations
 */
export const mutate = internal.mutate;
/**
 * Set or remove the specified key in the `HashMap` using the specified
 * update function. The value of the specified key will be computed using the
 * provided hash.
 *
 * The update function will be invoked with the current value of the key if it
 * exists, or `None` if no such value exists.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 *
 * // Increment existing value or set to 1 if not present
 * const updateFn = (option: Option.Option<number>) =>
 *   Option.isSome(option) ? Option.some(option.value + 1) : Option.some(1)
 *
 * const updated = HashMap.modifyAt(map, "a", updateFn)
 * console.log(HashMap.get(updated, "a")) // Option.some(2)
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const modifyAt = internal.modifyAt;
/**
 * Alter the value of the specified key in the `HashMap` using the specified
 * update function. The value of the specified key will be computed using the
 * provided hash.
 *
 * The update function will be invoked with the current value of the key if it
 * exists, or `None` if no such value exists.
 *
 * This function will always either update or insert a value into the `HashMap`.
 *
 * @example
 * ```ts
 * import { Hash } from "effect"
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * // Useful when working with precomputed hashes for performance
 * const counters = HashMap.make(["downloads", 100], ["views", 250])
 *
 * // Cache hash computation for frequently accessed keys
 * const metricKey = "downloads"
 * const cachedHash = Hash.string(metricKey)
 *
 * // Update function that increments counter or initializes to 1
 * const incrementCounter = (current: Option.Option<number>) =>
 *   Option.isSome(current) ? Option.some(current.value + 1) : Option.some(1)
 *
 * // Use cached hash for efficient updates in loops
 * const updated = HashMap.modifyHash(
 *   counters,
 *   metricKey,
 *   cachedHash,
 *   incrementCounter
 * )
 * console.log(HashMap.get(updated, "downloads")) // Option.some(101)
 *
 * // Add new metric with precomputed hash
 * const newMetric = "clicks"
 * const clicksHash = Hash.string(newMetric)
 * const withClicks = HashMap.modifyHash(
 *   updated,
 *   newMetric,
 *   clicksHash,
 *   incrementCounter
 * )
 * console.log(HashMap.get(withClicks, "clicks")) // Option.some(1)
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const modifyHash = internal.modifyHash;
/**
 * Updates the value of the specified key within the `HashMap` if it exists.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const map2 = HashMap.modify(map1, "a", (value) => value * 3)
 *
 * console.log(HashMap.get(map2, "a")) // Option.some(3)
 * console.log(HashMap.get(map2, "b")) // Option.some(2)
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const modify = internal.modify;
/**
 * Performs a union of this `HashMap` and that `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const map2 = HashMap.make(["b", 20], ["c", 3])
 * const union = HashMap.union(map1, map2)
 *
 * console.log(HashMap.size(union)) // 3
 * console.log(HashMap.get(union, "b")) // Option.some(20) - map2 wins
 * ```
 *
 * @since 2.0.0
 * @category combining
 */
export const union = internal.union;
/**
 * Remove the entry for the specified key in the `HashMap` using the internal
 * hashing function.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const map2 = HashMap.remove(map1, "b")
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.has(map2, "b")) // false
 * console.log(HashMap.has(map2, "a")) // true
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const remove = internal.remove;
/**
 * Removes all entries in the `HashMap` which have the specified keys.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
 * const map2 = HashMap.removeMany(map1, ["b", "d"])
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.has(map2, "a")) // true
 * console.log(HashMap.has(map2, "c")) // true
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const removeMany = internal.removeMany;
/**
 * Sets multiple key-value pairs in the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const newEntries = [["c", 3], ["d", 4], ["a", 10]] as const // "a" will be overwritten
 * const map2 = HashMap.setMany(map1, newEntries)
 *
 * console.log(HashMap.size(map2)) // 4
 * console.log(HashMap.get(map2, "a")) // Option.some(10)
 * console.log(HashMap.get(map2, "c")) // Option.some(3)
 * ```
 *
 * @since 2.0.0
 * @category transformations
 */
export const setMany = internal.setMany;
/**
 * Maps over the entries of the `HashMap` using the specified function.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const map2 = HashMap.map(map1, (value, key) => `${key}:${value * 2}`)
 *
 * console.log(HashMap.get(map2, "a")) // Option.some("a:2")
 * console.log(HashMap.get(map2, "b")) // Option.some("b:4")
 * ```
 *
 * @since 2.0.0
 * @category mapping
 */
export const map = internal.map;
/**
 * Chains over the entries of the `HashMap` using the specified function.
 *
 * **NOTE**: the hash and equal of both maps have to be the same.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2])
 * const map2 = HashMap.flatMap(
 *   map1,
 *   (value, key) => HashMap.make([key + "1", value], [key + "2", value * 2])
 * )
 *
 * console.log(HashMap.size(map2)) // 4
 * console.log(HashMap.get(map2, "a1")) // Option.some(1)
 * console.log(HashMap.get(map2, "b2")) // Option.some(4)
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const flatMap = internal.flatMap;
/**
 * Applies the specified function to the entries of the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2])
 * const collected: Array<[string, number]> = []
 *
 * HashMap.forEach(map, (value, key) => {
 *   collected.push([key, value])
 * })
 *
 * console.log(collected.sort()) // [["a", 1], ["b", 2]]
 * ```
 *
 * @since 2.0.0
 * @category traversing
 */
export const forEach = internal.forEach;
/**
 * Reduces the specified state over the entries of the `HashMap`.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const sum = HashMap.reduce(map, 0, (acc, value) => acc + value)
 *
 * console.log(sum) // 6
 * ```
 *
 * @since 2.0.0
 * @category folding
 */
export const reduce = internal.reduce;
/**
 * Filters entries out of a `HashMap` using the specified predicate.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
 * const map2 = HashMap.filter(map1, (value) => value % 2 === 0)
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.has(map2, "b")) // true
 * console.log(HashMap.has(map2, "d")) // true
 * console.log(HashMap.has(map2, "a")) // false
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export const filter = internal.filter;
/**
 * Filters out `None` values from a `HashMap` of `Options`s.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * const map1 = HashMap.make(
 *   ["a", Option.some(1)],
 *   ["b", Option.none()],
 *   ["c", Option.some(3)]
 * )
 * const map2 = HashMap.compact(map1)
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.get(map2, "a")) // Option.some(1)
 * console.log(HashMap.has(map2, "b")) // false
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export const compact = internal.compact;
/**
 * Maps over the entries of the `HashMap` using the specified filter and keeps
 * only successful results.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Result from "effect/Result"
 *
 * const map1 = HashMap.make(["a", 1], ["b", 2], ["c", 3], ["d", 4])
 * const map2 = HashMap.filterMap(
 *   map1,
 *   (value) => value % 2 === 0 ? Result.succeed(value * 2) : Result.failVoid
 * )
 *
 * console.log(HashMap.size(map2)) // 2
 * console.log(HashMap.get(map2, "b")) // Option.some(4)
 * console.log(HashMap.get(map2, "d")) // Option.some(8)
 * ```
 *
 * @since 2.0.0
 * @category filtering
 */
export const filterMap = internal.filterMap;
/**
 * Returns the first element that satisfies the specified
 * predicate, or `None` if no such element exists.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import * as Option from "effect/Option"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 * const result = HashMap.findFirst(map, (value) => value > 1)
 * console.log(result) // Option.some(["c", 3])
 * console.log(Option.getOrElse(result, () => ["", 0])) // ["c", 3]
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export const findFirst = internal.findFirst;
/**
 * Checks if any entry in a hashmap meets a specific condition.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 *
 * console.log(HashMap.some(map, (value) => value > 2)) // true
 * console.log(HashMap.some(map, (value) => value > 5)) // false
 * ```
 *
 * @since 3.13.0
 * @category elements
 */
export const some = internal.some;
/**
 * Checks if all entries in a hashmap meets a specific condition.
 *
 * @example
 * ```ts
 * import * as HashMap from "effect/HashMap"
 *
 * const map = HashMap.make(["a", 1], ["b", 2], ["c", 3])
 *
 * console.log(HashMap.every(map, (value) => value > 0)) // true
 * console.log(HashMap.every(map, (value) => value > 1)) // false
 * ```
 *
 * @param self - The hashmap to check.
 * @param predicate - The condition to test entries (value, key).
 *
 * @since 3.14.0
 * @category elements
 */
export const every = internal.every;
//# sourceMappingURL=HashMap.js.map