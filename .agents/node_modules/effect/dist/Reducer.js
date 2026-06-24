/**
 * A module for reducing collections of values into a single result.
 *
 * A `Reducer<A>` extends {@link Combiner.Combiner} by adding an
 * `initialValue` (identity element) and a `combineAll` method that folds an
 * entire collection. Think `Array.prototype.reduce`, but packaged as a
 * reusable, composable value.
 *
 * ## Mental model
 *
 * - **Reducer** – a {@link Combiner.Combiner} plus an `initialValue` and a
 *   `combineAll` method.
 * - **initialValue** – the neutral/identity element. Combining any value with
 *   `initialValue` should return the original value unchanged (e.g. `0` for
 *   addition, `""` for string concatenation).
 * - **combineAll** – folds an `Iterable<A>` starting from `initialValue`.
 *   When omitted from {@link make}, a default left-to-right fold is used.
 * - **Purity** – all reducers produced by this module are pure; they never
 *   mutate their arguments.
 * - **Composability** – reducers can be lifted into `Option`, `Struct`,
 *   `Tuple`, `Record`, and other container types via helpers in those modules.
 * - **Subtype of Combiner** – every `Reducer` is also a valid
 *   `Combiner`, so you can pass a `Reducer` anywhere a `Combiner` is
 *   expected.
 *
 * ## Common tasks
 *
 * - Create a reducer from a combine function and initial value → {@link make}
 * - Swap argument order → {@link flip}
 * - Combine two values without an initial value → use {@link Combiner.Combiner}
 *   instead
 *
 * ## Gotchas
 *
 * - `combineAll` on an empty iterable returns `initialValue`, not an error.
 * - The default `combineAll` folds left-to-right. If your `combine` is not
 *   associative, order matters. Pass a custom `combineAll` to {@link make} if
 *   you need different traversal or short-circuiting.
 * - A `Reducer` is also a valid `Combiner` — but a `Combiner` is *not* a
 *   `Reducer` (it lacks `initialValue`).
 *
 * ## Quickstart
 *
 * **Example** (summing a list of numbers)
 *
 * ```ts
 * import { Reducer } from "effect"
 *
 * const Sum = Reducer.make<number>((a, b) => a + b, 0)
 *
 * console.log(Sum.combine(3, 4))
 * // Output: 7
 *
 * console.log(Sum.combineAll([1, 2, 3, 4]))
 * // Output: 10
 *
 * console.log(Sum.combineAll([]))
 * // Output: 0
 * ```
 *
 * ## See also
 *
 * - {@link make} – the primary constructor
 * - {@link Reducer} – the core interface
 * - {@link Combiner.Combiner} – the parent interface (no `initialValue`)
 *
 * @since 4.0.0
 */
/**
 * Creates a `Reducer` from a `combine` function and an `initialValue`.
 *
 * When to use:
 * - You have a custom reducing operation not covered by a pre-built reducer.
 * - You want to provide an optimized `combineAll` (e.g. short-circuiting on
 *   a known absorbing element like `0` for multiplication).
 *
 * Behavior:
 * - If `combineAll` is omitted, a default left-to-right fold starting from
 *   `initialValue` is used.
 * - If `combineAll` is provided, it completely replaces the default fold.
 * - Pure – the returned reducer does not mutate its arguments.
 *
 * **Example** (multiplication with short-circuit)
 *
 * ```ts
 * import { Reducer } from "effect"
 *
 * const Product = Reducer.make<number>(
 *   (a, b) => a * b,
 *   1,
 *   (collection) => {
 *     let acc = 1
 *     for (const n of collection) {
 *       if (n === 0) return 0
 *       acc *= n
 *     }
 *     return acc
 *   }
 * )
 *
 * console.log(Product.combineAll([2, 3, 4]))
 * // Output: 24
 *
 * console.log(Product.combineAll([2, 0, 4]))
 * // Output: 0
 * ```
 *
 * @see {@link Reducer} – the interface this creates
 * @see {@link flip} – reverse the argument order
 *
 * @since 4.0.0
 */
export function make(combine, initialValue, combineAll) {
  return {
    combine,
    initialValue,
    combineAll: combineAll ?? (collection => {
      let out = initialValue;
      for (const value of collection) {
        out = combine(out, value);
      }
      return out;
    })
  };
}
/**
 * Reverses the argument order of a reducer's `combine` method.
 *
 * When to use:
 * - You need the "right" value to act as the accumulator side.
 * - You want to reverse the natural direction of a non-commutative reducer
 *   (e.g. string concatenation becomes prepend).
 *
 * Behavior:
 * - Returns a new `Reducer` where `combine(self, that)` calls the original
 *   reducer as `combine(that, self)`.
 * - The `initialValue` is preserved from the original reducer.
 * - The `combineAll` is re-derived from the flipped `combine` (using the
 *   default left-to-right fold), not carried over from the original.
 * - Does not mutate the input reducer.
 *
 * **Example** (reversing string concatenation)
 *
 * ```ts
 * import { Reducer, String } from "effect"
 *
 * const Prepend = Reducer.flip(String.ReducerConcat)
 *
 * console.log(Prepend.combine("a", "b"))
 * // Output: "ba"
 *
 * console.log(Prepend.combineAll(["a", "b", "c"]))
 * // Output: "cba"
 * ```
 *
 * @see {@link make}
 * @see {@link Combiner.flip} – the same operation on a plain `Combiner`
 *
 * @since 4.0.0
 */
export function flip(reducer) {
  return make((self, that) => reducer.combine(that, self), reducer.initialValue);
}
//# sourceMappingURL=Reducer.js.map