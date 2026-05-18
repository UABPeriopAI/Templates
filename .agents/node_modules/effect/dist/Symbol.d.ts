/**
 * @since 2.0.0
 */
/**
 * Tests if a value is a `symbol`.
 *
 * @example
 * ```ts
 * import * as Predicate from "effect/Predicate"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(Predicate.isSymbol(Symbol.for("a")), true)
 * assert.deepStrictEqual(Predicate.isSymbol("a"), false)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isSymbol: (u: unknown) => u is symbol;
//# sourceMappingURL=Symbol.d.ts.map