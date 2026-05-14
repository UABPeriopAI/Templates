/**
 * This module provides small, allocation-free utilities for working with values of type
 * `A | undefined`, where `undefined` means "no value".
 *
 * Why not `Option<A>`?
 * In TypeScript, `Option<A>` is often unnecessary. If `undefined` already models absence
 * in your domain, using `A | undefined` keeps types simple, avoids extra wrappers, and
 * reduces overhead. The key is that `A` itself must not include `undefined`; in this
 * module `undefined` is reserved to mean "no value".
 *
 * When to use `A | undefined`:
 * - Absence can be represented by `undefined` in your domain model.
 * - You do not need to distinguish between "no value" and "value is undefined".
 * - You want straightforward ergonomics and zero extra allocations.
 *
 * When to prefer `Option<A>`:
 * - You must distinguish `None` from `Some(undefined)` (that is, `undefined` is a valid
 *   payload and carries meaning on its own).
 * - You need a tagged representation for serialization or pattern matching across
 *   boundaries where `undefined` would be ambiguous.
 * - You want the richer `Option` API and are comfortable with the extra wrapper.
 *
 * Lawfulness note:
 * All helpers treat `undefined` as absence. Do not use these utilities with payloads
 * where `A` can itself be `undefined`, or you will lose information. If you need to
 * carry `undefined` as a valid payload, use `Option<A>` instead.
 *
 * @since 4.0.0
 */
import * as Combiner from "./Combiner.js";
import { dual } from "./Function.js";
import * as Reducer from "./Reducer.js";
/**
 * @since 4.0.0
 */
export const map = /*#__PURE__*/dual(2, (self, f) => self === undefined ? undefined : f(self));
/**
 * @since 4.0.0
 */
export const match = /*#__PURE__*/dual(2, (self, {
  onDefined,
  onUndefined
}) => self === undefined ? onUndefined() : onDefined(self));
/**
 * @since 4.0.0
 */
export const getOrThrowWith = /*#__PURE__*/dual(2, (self, onUndefined) => {
  if (self !== undefined) {
    return self;
  }
  throw onUndefined();
});
/**
 * @since 4.0.0
 */
export const getOrThrow = /*#__PURE__*/getOrThrowWith(() => new Error("getOrThrow called on a undefined"));
/**
 * @since 4.0.0
 */
export const liftThrowable = f => (...a) => {
  try {
    return f(...a);
  } catch {
    return undefined;
  }
};
/**
 * Creates a `Reducer` for `UndefinedOr<A>` that prioritizes the first non-`undefined`
 * value and combines values when both operands are present.
 *
 * This `Reducer` is useful for scenarios where you want to:
 * - Take the first available value (like a fallback chain)
 * - Combine values when both are present
 * - Maintain a `undefined` state only when all values are `undefined`
 *
 * The `initialValue` of the `Reducer` is `undefined`.
 *
 * **Behavior:**
 * - `undefined` + `undefined` = `undefined`
 * - `a` + `undefined` = `a` (first value wins)
 * - `undefined` + `b` = `b` (second value wins)
 * - `a` + `b` = `a + b` (values combined)
 *
 * @since 4.0.0
 */
export function makeReducer(combiner) {
  return Reducer.make((self, that) => {
    if (self === undefined) return that;
    if (that === undefined) return self;
    return combiner.combine(self, that);
  }, undefined);
}
/**
 * Creates a `Combiner` for `UndefinedOr<A>` that only combines values when both
 * operands are not `undefined`, failing fast if either is `undefined`.
 *
 * This `Combiner` is useful for scenarios where you need both values to be
 * present to perform an operation, such as:
 * - Mathematical operations that require two operands
 * - Data validation that needs both fields
 * - Operations that can't proceed with partial data
 *
 * **Behavior:**
 * - `undefined` + `undefined` = `undefined`
 * - `a` + `undefined` = `undefined` (fails fast)
 * - `undefined` + `b` = `undefined` (fails fast)
 * - `a` + `b` = `a + b` (values combined)
 *
 * @see {@link makeReducerFailFast} if you have a `Reducer` and want to lift it
 * to `UndefinedOr` values.
 *
 * @since 4.0.0
 */
export function makeCombinerFailFast(combiner) {
  return Combiner.make((self, that) => {
    if (self === undefined || that === undefined) return undefined;
    return combiner.combine(self, that);
  });
}
/**
 * Creates a `Reducer` for `UndefinedOr<A>` by wrapping an existing `Reducer` with
 * fail-fast semantics for `UndefinedOr` values.
 *
 * This function lifts a regular `Reducer` into the `UndefinedOr` context, allowing
 * you to use existing `Reducer`s with `UndefinedOr` values while maintaining the
 * fail-fast behavior where any `undefined` value causes the entire reduction to fail.
 *
 * The initial value is `some(reducer.initialValue)`, ensuring the `Reducer`
 * starts with a valid `UndefinedOr` value.
 *
 * **Behavior:**
 * - Fails fast (returns `undefined`) if any operand is `undefined`
 * - Uses the underlying reducer's combine logic when both values are present
 *
 * @see {@link makeCombinerFailFast} if you only have a `Combiner` and want to
 * lift it to `UndefinedOr` values.
 *
 * @since 4.0.0
 */
export function makeReducerFailFast(reducer) {
  const combine = makeCombinerFailFast(reducer).combine;
  const initialValue = reducer.initialValue;
  return Reducer.make(combine, initialValue, collection => {
    let out = initialValue;
    for (const value of collection) {
      out = combine(out, value);
      if (out === undefined) return out;
    }
    return out;
  });
}
//# sourceMappingURL=UndefinedOr.js.map