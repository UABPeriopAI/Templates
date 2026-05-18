/**
 * This module provides functionality for working with primary keys.
 * A `PrimaryKey` is a simple interface that represents a unique identifier
 * that can be converted to a string representation.
 *
 * Primary keys are useful for creating unique identifiers for objects,
 * database records, cache keys, or any scenario where you need a
 * string-based unique identifier.
 *
 * @since 2.0.0
 */
import { hasProperty } from "./Predicate.js";
/**
 * The unique identifier used to identify objects that implement the `PrimaryKey` interface.
 *
 * @since 2.0.0
 */
export const symbol = "~effect/interfaces/PrimaryKey";
/**
 * @category models
 * @since 2.0.0
 */
export const isPrimaryKey = u => hasProperty(u, symbol);
/**
 * Extracts the string value from a `PrimaryKey`.
 *
 * @example
 * ```ts
 * import { PrimaryKey } from "effect"
 *
 * class OrderId implements PrimaryKey.PrimaryKey {
 *   constructor(private timestamp: number, private sequence: number) {}
 *
 *   [PrimaryKey.symbol](): string {
 *     return `order_${this.timestamp}_${this.sequence}`
 *   }
 * }
 *
 * const orderId = new OrderId(1640995200000, 1)
 * console.log(PrimaryKey.value(orderId)) // "order_1640995200000_1"
 *
 * // Can also be used with simple string-based implementations
 * const simpleKey = {
 *   [PrimaryKey.symbol]: () => "simple-key-123"
 * }
 * console.log(PrimaryKey.value(simpleKey)) // "simple-key-123"
 * ```
 *
 * @category accessors
 * @since 2.0.0
 */
export const value = self => self[symbol]();
//# sourceMappingURL=PrimaryKey.js.map