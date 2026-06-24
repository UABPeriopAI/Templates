import { dual } from "./Function.js";
import * as Reducer_ from "./Reducer.js";
/**
 * Inverts the ordering of the input Ordering.
 * This is useful for creating descending sort orders from ascending ones.
 *
 * @example
 * ```ts
 * import { Ordering } from "effect"
 *
 * // Basic reversal
 * console.log(Ordering.reverse(1)) // -1 (greater becomes less)
 * console.log(Ordering.reverse(-1)) // 1 (less becomes greater)
 * console.log(Ordering.reverse(0)) // 0 (equal stays equal)
 *
 * // Creating descending sort from ascending comparison
 * const compareNumbers = (a: number, b: number): Ordering.Ordering =>
 *   a < b ? -1 : a > b ? 1 : 0
 *
 * const compareDescending = (a: number, b: number): Ordering.Ordering =>
 *   Ordering.reverse(compareNumbers(a, b))
 *
 * const numbers = [3, 1, 4, 1, 5]
 * numbers.sort(compareNumbers) // [1, 1, 3, 4, 5] (ascending)
 * numbers.sort(compareDescending) // [5, 4, 3, 1, 1] (descending)
 *
 * // Useful for toggling sort direction
 * const createSorter = (ascending: boolean) => (a: number, b: number) => {
 *   const ordering = compareNumbers(a, b)
 *   return ascending ? ordering : Ordering.reverse(ordering)
 * }
 * ```
 *
 * @category transformations
 * @since 2.0.0
 */
export const reverse = o => o === -1 ? 1 : o === 1 ? -1 : 0;
/**
 * Depending on the `Ordering` parameter given to it, returns a value produced by one of the 3 functions provided as parameters.
 *
 * @example
 * ```ts
 * import { Ordering } from "effect"
 * import { constant } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const toMessage = Ordering.match({
 *   onLessThan: constant("less than"),
 *   onEqual: constant("equal"),
 *   onGreaterThan: constant("greater than")
 * })
 *
 * assert.deepStrictEqual(toMessage(-1), "less than")
 * assert.deepStrictEqual(toMessage(0), "equal")
 * assert.deepStrictEqual(toMessage(1), "greater than")
 * ```
 *
 * @category pattern matching
 * @since 2.0.0
 */
export const match = /*#__PURE__*/dual(2, (self, {
  onEqual,
  onGreaterThan,
  onLessThan
}) => self === -1 ? onLessThan() : self === 0 ? onEqual() : onGreaterThan());
/**
 * A `Reducer` for combining `Ordering`s.
 *
 * If any of the `Ordering`s is non-zero, the result is the first non-zero `Ordering`.
 * If all the `Ordering`s are zero, the result is zero.
 *
 * @since 4.0.0
 */
export const Reducer = /*#__PURE__*/Reducer_.make((self, that) => self !== 0 ? self : that, 0, collection => {
  let ordering = 0;
  for (ordering of collection) {
    if (ordering !== 0) {
      return ordering;
    }
  }
  return ordering;
});
//# sourceMappingURL=Ordering.js.map