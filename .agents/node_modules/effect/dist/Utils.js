/**
 * An `IterableIterator` that yields its wrapped value exactly once.
 *
 * When to use:
 *
 * - Implement `[Symbol.iterator]()` on Effect-like types so they can be
 *   `yield*`-ed inside generator functions (e.g. `Effect.gen`, `Option.gen`).
 * - You almost never construct this directly — it is created internally by
 *   yieldable types.
 *
 * Behavior:
 *
 * - The first call to `next()` returns `{ value: self, done: false }`.
 * - Every subsequent call returns `{ value: a, done: true }` where `a` is
 *   the argument passed to `next()`.
 * - `[Symbol.iterator]()` returns a **new** `SingleShotGen` wrapping the same
 *   value, so the outer type can be iterated multiple times.
 * - Does not mutate the wrapped value.
 *
 * **Example** (Yielding a wrapped value in a generator)
 *
 * ```ts
 * import { Utils } from "effect"
 *
 * const gen = new Utils.SingleShotGen<string, number>("hello")
 *
 * // First call yields the wrapped value
 * console.log(gen.next(0))
 * // { value: "hello", done: false }
 *
 * // Second call signals completion with the provided value
 * console.log(gen.next(42))
 * // { value: 42, done: true }
 * ```
 *
 * @see {@link Gen} — the type-level signature that relies on `SingleShotGen`
 *
 * @category constructors
 * @since 2.0.0
 */
export class SingleShotGen {
  called = false;
  self;
  constructor(self) {
    this.self = self;
  }
  /**
   * @since 2.0.0
   */
  next(a) {
    return this.called ? {
      value: a,
      done: true
    } : (this.called = true, {
      value: this.self,
      done: false
    });
  }
  /**
   * @since 2.0.0
   */
  [Symbol.iterator]() {
    return new SingleShotGen(this.self);
  }
}
const InternalTypeId = "~effect/Utils/internal";
const standard = {
  [InternalTypeId]: body => {
    return body();
  }
};
const forced = {
  [InternalTypeId]: body => {
    try {
      return body();
    } finally {
      //
    }
  }
};
const isNotOptimizedAway = /*#__PURE__*/standard[InternalTypeId](() => new Error().stack)?.includes(InternalTypeId) === true;
/** @internal */
export const internalCall = isNotOptimizedAway ? standard[InternalTypeId] : forced[InternalTypeId];
//# sourceMappingURL=Utils.js.map