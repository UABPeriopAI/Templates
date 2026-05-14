import { cast } from "./Function.js";
import * as Optic from "./Optic.js";
const TypeId = "~effect/Newtype";
/**
 * Unwraps a newtype value, returning the underlying carrier value.
 *
 * - Use when you only need to read the inner value and do not need to wrap new
 *   values.
 * - For both wrapping and unwrapping, prefer {@link makeIso}.
 * - Zero runtime cost: this is an identity cast.
 *
 * **Example** (unwrapping a newtype)
 *
 * ```ts
 * import { Newtype } from "effect"
 *
 * interface Label extends Newtype.Newtype<"Label", string> {}
 *
 * const iso = Newtype.makeIso<Label>()
 * const label = iso.set("hello")
 *
 * const raw: string = Newtype.value(label) // "hello"
 * ```
 *
 * @see {@link makeIso} — two-way conversion (wrap and unwrap)
 *
 * @since 4.0.0
 */
export const value = cast;
/**
 * Creates an `Optic.Iso` for a newtype, providing both wrapping (`set`) and
 * unwrapping (`get`).
 *
 * - Use this as the primary way to construct and deconstruct newtype values.
 * - The returned iso composes with other optics via the standard `Optic` API.
 * - Zero runtime cost: both directions are identity casts.
 *
 * **Example** (wrapping and unwrapping with an iso)
 *
 * ```ts
 * import { Newtype } from "effect"
 *
 * interface Label extends Newtype.Newtype<"Label", string> {}
 *
 * const labelIso = Newtype.makeIso<Label>()
 *
 * const label: Label = labelIso.set("world")
 * const str: string = labelIso.get(label) // "world"
 * ```
 *
 * @see {@link value} — unwrap only
 *
 * @since 4.0.0
 */
export function makeIso() {
  return Optic.makeIso(value, cast);
}
/**
 * Lifts an `Equivalence` for the carrier type into an `Equivalence` for the
 * newtype.
 *
 * - Use when you need to compare two newtype values for equality.
 * - The returned equivalence delegates to the provided carrier equivalence.
 * - Zero runtime cost beyond the underlying equivalence check.
 *
 * **Example** (comparing newtypes)
 *
 * ```ts
 * import { Newtype, Equivalence } from "effect"
 *
 * interface Label extends Newtype.Newtype<"Label", string> {}
 *
 * const eq = Newtype.makeEquivalence<Label>(Equivalence.String)
 * const iso = Newtype.makeIso<Label>()
 *
 * eq(iso.set("a"), iso.set("a")) // true
 * eq(iso.set("a"), iso.set("b")) // false
 * ```
 *
 * @see {@link makeOrder} — lift an `Order` for the carrier
 *
 * @since 4.0.0
 */
export const makeEquivalence = cast;
/**
 * Lifts an `Order` for the carrier type into an `Order` for the newtype.
 *
 * - Use when you need to sort or compare newtype values.
 * - The returned order delegates to the provided carrier order.
 *
 * **Example** (ordering newtypes)
 *
 * ```ts
 * import { Newtype, Order } from "effect"
 *
 * interface Score extends Newtype.Newtype<"Score", number> {}
 *
 * const ord = Newtype.makeOrder<Score>(Order.Number)
 * const iso = Newtype.makeIso<Score>()
 *
 * ord(iso.set(1), iso.set(2)) // -1
 * ```
 *
 * @see {@link makeEquivalence} — lift an `Equivalence` for the carrier
 *
 * @since 4.0.0
 */
export const makeOrder = cast;
/**
 * Lifts a `Combiner` for the carrier type into a `Combiner` for the newtype.
 *
 * - Use when you need to combine (e.g. concatenate, add) newtype values.
 * - The returned combiner delegates to the provided carrier combiner.
 *
 * **Example** (combining newtypes)
 *
 * ```ts
 * import { Newtype, Combiner } from "effect"
 *
 * interface Amount extends Newtype.Newtype<"Amount", number> {}
 *
 * const sum = Combiner.make<number>((a, b) => a + b)
 * const combiner = Newtype.makeCombiner<Amount>(sum)
 * const iso = Newtype.makeIso<Amount>()
 *
 * const total = combiner.combine(iso.set(10), iso.set(20))
 * Newtype.value(total) // 30
 * ```
 *
 * @see {@link makeReducer} — lift a `Reducer` for the carrier
 *
 * @since 4.0.0
 */
export const makeCombiner = cast;
/**
 * Lifts a `Reducer` for the carrier type into a `Reducer` for the newtype.
 *
 * - Use when you need to fold/reduce over a collection of newtype values.
 * - The returned reducer delegates to the provided carrier reducer.
 *
 * **Example** (reducing newtypes)
 *
 * ```ts
 * import { Newtype, Reducer } from "effect"
 *
 * interface Score extends Newtype.Newtype<"Score", number> {}
 *
 * const sum = Reducer.make<number>((a, b) => a + b, 0)
 * const reducer = Newtype.makeReducer<Score>(sum)
 * const iso = Newtype.makeIso<Score>()
 *
 * const total = reducer.combineAll([iso.set(1), iso.set(2), iso.set(3)])
 * Newtype.value(total) // 6
 * ```
 *
 * @see {@link makeCombiner} — lift a `Combiner` for the carrier
 *
 * @since 4.0.0
 */
export const makeReducer = cast;
//# sourceMappingURL=Newtype.js.map