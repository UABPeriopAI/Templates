/**
 * @since 2.0.0
 */
import { identity } from "./Function.js";
/**
 * Unifies the return type of a function or value.
 *
 * This function applies type unification to the result of a function or to a value directly.
 * It's useful when you need to ensure that complex type unions are properly unified according
 * to the Effect type system's unification protocol.
 *
 * @example
 * ```ts
 * import { Unify } from "effect"
 *
 * // Unify a simple value
 * const unifiedValue = Unify.unify("hello")
 * // Type: string
 *
 * // Unify a function result
 * const createUnifiableValue = () => ({
 *   value: "test",
 *   [Unify.typeSymbol]: "string" as const,
 *   [Unify.unifySymbol]: { String: () => "test" as const }
 * })
 *
 * const unifiedFunction = Unify.unify(createUnifiableValue)
 * // The result will be properly unified
 *
 * // Unify with curried functions
 * const curriedFunction = (a: string) => (b: number) => ({ result: a + b })
 * const unifiedCurried = Unify.unify(curriedFunction)
 * // Type: (a: string) => (b: number) => Unify<{ result: string }>
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const unify = identity;
//# sourceMappingURL=Unify.js.map