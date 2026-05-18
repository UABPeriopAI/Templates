import * as Hash from "./Hash.js";
import { byReferenceInstances, getAllObjectKeys } from "./internal/equal.js";
import { hasProperty } from "./Predicate.js";
/**
 * The unique string identifier for the {@link Equal} interface.
 *
 * Use this as a computed property key when implementing custom equality on a
 * class or object literal.
 *
 * When to use:
 * - As the method name when implementing the {@link Equal} interface.
 * - To check manually whether an object carries an equality method (prefer
 *   {@link isEqual} instead).
 *
 * Behavior:
 * - Pure constant — no allocation or side effects.
 *
 * **Example** (implementing Equal on a class)
 *
 * ```ts
 * import { Equal, Hash } from "effect"
 *
 * class UserId implements Equal.Equal {
 *   constructor(readonly id: string) {}
 *
 *   [Equal.symbol](that: Equal.Equal): boolean {
 *     return that instanceof UserId && this.id === that.id
 *   }
 *
 *   [Hash.symbol](): number {
 *     return Hash.string(this.id)
 *   }
 * }
 * ```
 *
 * @see {@link Equal} — the interface that uses this symbol
 * @see {@link isEqual} — type guard for `Equal` implementors
 *
 * @since 2.0.0
 */
export const symbol = "~effect/interfaces/Equal";
export function equals() {
  if (arguments.length === 1) {
    return self => compareBoth(self, arguments[0]);
  }
  return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
  if (self === that) return true;
  if (self == null || that == null) return false;
  const selfType = typeof self;
  if (selfType !== typeof that) {
    return false;
  }
  // Special case for NaN: NaN should be considered equal to NaN
  if (selfType === "number" && self !== self && that !== that) {
    return true;
  }
  if (selfType !== "object" && selfType !== "function") {
    return false;
  }
  if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) {
    return false;
  }
  // For objects and functions, use cached comparison
  return withCache(self, that, compareObjects);
}
/** Helper to run comparison with proper visited tracking */
function withVisitedTracking(self, that, fn) {
  const hasLeft = visitedLeft.has(self);
  const hasRight = visitedRight.has(that);
  // Check for circular references before adding
  if (hasLeft && hasRight) {
    return true; // Both are circular at the same level
  }
  if (hasLeft || hasRight) {
    return false; // Only one is circular
  }
  visitedLeft.add(self);
  visitedRight.add(that);
  const result = fn();
  visitedLeft.delete(self);
  visitedRight.delete(that);
  return result;
}
const visitedLeft = /*#__PURE__*/new WeakSet();
const visitedRight = /*#__PURE__*/new WeakSet();
/** Helper to perform cached object comparison */
function compareObjects(self, that) {
  if (Hash.hash(self) !== Hash.hash(that)) {
    return false;
  } else if (self instanceof Date) {
    if (!(that instanceof Date)) return false;
    return self.toISOString() === that.toISOString();
  } else if (self instanceof RegExp) {
    if (!(that instanceof RegExp)) return false;
    return self.toString() === that.toString();
  }
  const selfIsEqual = isEqual(self);
  const thatIsEqual = isEqual(that);
  if (selfIsEqual !== thatIsEqual) return false;
  const bothEquals = selfIsEqual && thatIsEqual;
  if (typeof self === "function" && !bothEquals) {
    return false;
  }
  return withVisitedTracking(self, that, () => {
    if (bothEquals) {
      return self[symbol](that);
    } else if (Array.isArray(self)) {
      if (!Array.isArray(that) || self.length !== that.length) {
        return false;
      }
      return compareArrays(self, that);
    } else if (ArrayBuffer.isView(self)) {
      if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength) {
        return false;
      }
      return compareTypedArrays(self, that);
    } else if (self instanceof Map) {
      if (!(that instanceof Map) || self.size !== that.size) {
        return false;
      }
      return compareMaps(self, that);
    } else if (self instanceof Set) {
      if (!(that instanceof Set) || self.size !== that.size) {
        return false;
      }
      return compareSets(self, that);
    }
    return compareRecords(self, that);
  });
}
function withCache(self, that, f) {
  // Check cache first
  let selfMap = equalityCache.get(self);
  if (!selfMap) {
    selfMap = new WeakMap();
    equalityCache.set(self, selfMap);
  } else if (selfMap.has(that)) {
    return selfMap.get(that);
  }
  // Perform the comparison
  const result = f(self, that);
  // Cache the result bidirectionally
  selfMap.set(that, result);
  let thatMap = equalityCache.get(that);
  if (!thatMap) {
    thatMap = new WeakMap();
    equalityCache.set(that, thatMap);
  }
  thatMap.set(self, result);
  return result;
}
const equalityCache = /*#__PURE__*/new WeakMap();
function compareArrays(self, that) {
  for (let i = 0; i < self.length; i++) {
    if (!compareBoth(self[i], that[i])) {
      return false;
    }
  }
  return true;
}
function compareTypedArrays(self, that) {
  if (self.length !== that.length) {
    return false;
  }
  for (let i = 0; i < self.length; i++) {
    if (self[i] !== that[i]) {
      return false;
    }
  }
  return true;
}
function compareRecords(self, that) {
  const selfKeys = getAllObjectKeys(self);
  const thatKeys = getAllObjectKeys(that);
  if (selfKeys.size !== thatKeys.size) {
    return false;
  }
  for (const key of selfKeys) {
    if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) {
      return false;
    }
  }
  return true;
}
/** @internal */
export function makeCompareMap(keyEquivalence, valueEquivalence) {
  return function compareMaps(self, that) {
    for (const [selfKey, selfValue] of self) {
      let found = false;
      for (const [thatKey, thatValue] of that) {
        if (keyEquivalence(selfKey, thatKey) && valueEquivalence(selfValue, thatValue)) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
const compareMaps = /*#__PURE__*/makeCompareMap(compareBoth, compareBoth);
/** @internal */
export function makeCompareSet(equivalence) {
  return function compareSets(self, that) {
    for (const selfValue of self) {
      let found = false;
      for (const thatValue of that) {
        if (equivalence(selfValue, thatValue)) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  };
}
const compareSets = /*#__PURE__*/makeCompareSet(compareBoth);
/**
 * Checks whether a value implements the {@link Equal} interface.
 *
 * When to use:
 * - To branch on whether a value supports custom equality before calling
 *   its `[Equal.symbol]` method directly.
 * - In generic utility code that needs to distinguish `Equal` implementors
 *   from plain values.
 *
 * Behavior:
 * - Pure function, no side effects.
 * - Returns `true` if and only if `u` has a property keyed by
 *   {@link symbol}.
 * - Acts as a TypeScript type guard, narrowing the input to {@link Equal}.
 *
 * **Example** (type guard)
 *
 * ```ts
 * import { Equal, Hash } from "effect"
 *
 * class Token implements Equal.Equal {
 *   constructor(readonly value: string) {}
 *   [Equal.symbol](that: Equal.Equal): boolean {
 *     return that instanceof Token && this.value === that.value
 *   }
 *   [Hash.symbol](): number {
 *     return Hash.string(this.value)
 *   }
 * }
 *
 * console.log(Equal.isEqual(new Token("abc"))) // true
 * console.log(Equal.isEqual({ x: 1 }))         // false
 * console.log(Equal.isEqual(42))                // false
 * ```
 *
 * @see {@link Equal} — the interface being checked
 * @see {@link symbol} — the property key that signals `Equal` support
 *
 * @category guards
 * @since 2.0.0
 */
export const isEqual = u => hasProperty(u, symbol);
/**
 * Wraps {@link equals} as an `Equivalence<A>`.
 *
 * When to use:
 * - When an API (e.g. `Array.dedupeWith`, `Equivalence.mapInput`) requires an
 *   `Equivalence` and you want to reuse `Equal.equals`.
 *
 * Behavior:
 * - Returns a function `(a: A, b: A) => boolean` that delegates to
 *   {@link equals}.
 * - Pure; allocates a thin wrapper on each call.
 *
 * **Example** (deduplicating with Equal semantics)
 *
 * ```ts
 * import { Array, Equal } from "effect"
 *
 * const eq = Equal.asEquivalence<number>()
 * const result = Array.dedupeWith([1, 2, 2, 3, 1], eq)
 * console.log(result) // [1, 2, 3]
 * ```
 *
 * @see {@link equals} — the underlying comparison function
 *
 * @category instances
 * @since 2.0.0
 */
export const asEquivalence = () => equals;
/**
 * Creates a proxy that uses reference equality instead of structural equality.
 *
 * When to use:
 * - When you have a plain object or array that should be compared by identity
 *   (reference), not by contents.
 * - When you want to preserve the original object unchanged and get a new
 *   reference-equal handle.
 *
 * Behavior:
 * - Returns a `Proxy` wrapping `obj`. The proxy reads through to the
 *   original, so property access is unchanged.
 * - The proxy is registered in an internal WeakSet; {@link equals} returns
 *   `false` for any pair where at least one operand is in that set (unless
 *   they are the same reference).
 * - Each call creates a **new** proxy, so `byReference(x) !== byReference(x)`.
 * - Does **not** mutate the original object (unlike {@link byReferenceUnsafe}).
 *
 * **Example** (opting out of structural equality)
 *
 * ```ts
 * import { Equal } from "effect"
 *
 * const a = { x: 1 }
 * const b = { x: 1 }
 *
 * console.log(Equal.equals(a, b)) // true  (structural)
 *
 * const aRef = Equal.byReference(a)
 * console.log(Equal.equals(aRef, b))    // false (reference)
 * console.log(Equal.equals(aRef, aRef)) // true  (same reference)
 * console.log(aRef.x)                   // 1     (proxy reads through)
 * ```
 *
 * @see {@link byReferenceUnsafe} — same effect without a proxy (mutates the
 *   original)
 * @see {@link equals} — the comparison function affected by this opt-out
 *
 * @category utility
 * @since 2.0.0
 */
export const byReference = obj => byReferenceUnsafe(new Proxy(obj, {}));
/**
 * Permanently marks an object to use reference equality, without creating a
 * proxy.
 *
 * When to use:
 * - When you want reference equality semantics and can accept that the
 *   original object is **permanently** modified.
 * - When proxy overhead is unacceptable (hot paths, large collections).
 *
 * Behavior:
 * - Adds `obj` to an internal WeakSet. From that point on, {@link equals}
 *   treats it as reference-only.
 * - Returns the **same** object (not a copy or proxy), so
 *   `byReferenceUnsafe(x) === x`.
 * - The marking is irreversible for the lifetime of the object.
 * - Does **not** affect the object's prototype, properties, or behavior
 *   beyond equality checks.
 *
 * **Example** (marking an object for reference equality)
 *
 * ```ts
 * import { Equal } from "effect"
 *
 * const obj1 = { a: 1, b: 2 }
 * const obj2 = { a: 1, b: 2 }
 *
 * Equal.byReferenceUnsafe(obj1)
 *
 * console.log(Equal.equals(obj1, obj2))   // false (reference)
 * console.log(Equal.equals(obj1, obj1))   // true  (same reference)
 * console.log(obj1 === Equal.byReferenceUnsafe(obj1)) // true (same object)
 * ```
 *
 * @see {@link byReference} — safer alternative that creates a proxy
 * @see {@link equals} — the comparison function affected by this opt-out
 *
 * @category utility
 * @since 2.0.0
 */
export const byReferenceUnsafe = obj => {
  byReferenceInstances.add(obj);
  return obj;
};
//# sourceMappingURL=Equal.js.map