/**
 * This module provides utility functions and type class instances for working with the `BigDecimal` type in TypeScript.
 * It includes functions for basic arithmetic operations.
 *
 * A `BigDecimal` allows storing any real number to arbitrary precision; which avoids common floating point errors
 * (such as 0.1 + 0.2 ≠ 0.3) at the cost of complexity.
 *
 * Internally, `BigDecimal` uses a `BigInt` object, paired with a 64-bit integer which determines the position of the
 * decimal point. Therefore, the precision *is not* actually arbitrary, but limited to 2<sup>63</sup> decimal places.
 *
 * It is not recommended to convert a floating point number to a decimal directly, as the floating point representation
 * may be unexpected.
 *
 * @since 2.0.0
 */
import * as Equal from "./Equal.ts";
import * as Equ from "./Equivalence.ts";
import { type Inspectable } from "./Inspectable.ts";
import * as Option from "./Option.ts";
import * as order from "./Order.ts";
import type { Ordering } from "./Ordering.ts";
import { type Pipeable } from "./Pipeable.ts";
declare const TypeId = "~effect/BigDecimal";
/**
 * Represents an arbitrary precision decimal number.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const d = BigDecimal.fromNumberUnsafe(123.45)
 *
 * d.value // 12345n
 * d.scale // 2
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export interface BigDecimal extends Equal.Equal, Pipeable, Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly value: bigint;
    readonly scale: number;
}
/**
 * Checks if a given value is a `BigDecimal`.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const decimal = BigDecimal.fromNumber(123.45)
 * console.log(BigDecimal.isBigDecimal(decimal)) // true
 * console.log(BigDecimal.isBigDecimal(123.45)) // false
 * console.log(BigDecimal.isBigDecimal("123.45")) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isBigDecimal: (u: unknown) => u is BigDecimal;
/**
 * Creates a `BigDecimal` from a `bigint` value and a scale.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * // Create 123.45 (12345 with scale 2)
 * const decimal = BigDecimal.make(12345n, 2)
 * console.log(BigDecimal.format(decimal)) // "123.45"
 *
 * // Create 42 (42 with scale 0)
 * const integer = BigDecimal.make(42n, 0)
 * console.log(BigDecimal.format(integer)) // "42"
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: (value: bigint, scale: number) => BigDecimal;
/**
 * Normalizes a given `BigDecimal` by removing trailing zeros.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, make, normalize } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   normalize(fromStringUnsafe("123.00000")),
 *   normalize(make(123n, 0))
 * )
 * assert.deepStrictEqual(
 *   normalize(fromStringUnsafe("12300000")),
 *   normalize(make(123n, -5))
 * )
 * ```
 *
 * @since 2.0.0
 * @category scaling
 */
export declare const normalize: (self: BigDecimal) => BigDecimal;
/**
 * Scales a given `BigDecimal` to the specified scale.
 *
 * If the given scale is smaller than the current scale, the value will be rounded down to
 * the nearest integer.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const decimal = BigDecimal.fromNumberUnsafe(123.45)
 *
 * // Increase scale (add more precision)
 * const scaled = BigDecimal.scale(decimal, 4)
 * console.log(BigDecimal.format(scaled)) // "123.4500"
 *
 * // Decrease scale (reduce precision, rounds down)
 * const reduced = BigDecimal.scale(decimal, 1)
 * console.log(BigDecimal.format(reduced)) // "123.4"
 * ```
 *
 * @since 2.0.0
 * @category scaling
 */
export declare const scale: {
    /**
     * Scales a given `BigDecimal` to the specified scale.
     *
     * If the given scale is smaller than the current scale, the value will be rounded down to
     * the nearest integer.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     *
     * const decimal = BigDecimal.fromNumberUnsafe(123.45)
     *
     * // Increase scale (add more precision)
     * const scaled = BigDecimal.scale(decimal, 4)
     * console.log(BigDecimal.format(scaled)) // "123.4500"
     *
     * // Decrease scale (reduce precision, rounds down)
     * const reduced = BigDecimal.scale(decimal, 1)
     * console.log(BigDecimal.format(reduced)) // "123.4"
     * ```
     *
     * @since 2.0.0
     * @category scaling
     */
    (scale: number): (self: BigDecimal) => BigDecimal;
    /**
     * Scales a given `BigDecimal` to the specified scale.
     *
     * If the given scale is smaller than the current scale, the value will be rounded down to
     * the nearest integer.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     *
     * const decimal = BigDecimal.fromNumberUnsafe(123.45)
     *
     * // Increase scale (add more precision)
     * const scaled = BigDecimal.scale(decimal, 4)
     * console.log(BigDecimal.format(scaled)) // "123.4500"
     *
     * // Decrease scale (reduce precision, rounds down)
     * const reduced = BigDecimal.scale(decimal, 1)
     * console.log(BigDecimal.format(reduced)) // "123.4"
     * ```
     *
     * @since 2.0.0
     * @category scaling
     */
    (self: BigDecimal, scale: number): BigDecimal;
};
/**
 * Provides an addition operation on `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, sum } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   sum(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("5")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const sum: {
    /**
     * Provides an addition operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, sum } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   sum(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Provides an addition operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, sum } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   sum(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Takes an `Iterable` of `BigDecimal`s and returns their sum as a single `BigDecimal`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, sumAll } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   sumAll([fromStringUnsafe("2"), fromStringUnsafe("3"), fromStringUnsafe("4")]),
 *   fromStringUnsafe("9")
 * )
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const sumAll: (collection: Iterable<BigDecimal>) => BigDecimal;
/**
 * Provides a multiplication operation on `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, multiply } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   multiply(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("6")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const multiply: {
    /**
     * Provides a multiplication operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, multiply } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   multiply(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("6")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Provides a multiplication operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, multiply } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   multiply(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("6")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Takes an `Iterable` of `BigDecimal`s and returns their multiplication as a single `BigDecimal`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, multiplyAll } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   multiplyAll([fromStringUnsafe("2"), fromStringUnsafe("3"), fromStringUnsafe("4")]),
 *   fromStringUnsafe("24")
 * )
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const multiplyAll: (collection: Iterable<BigDecimal>) => BigDecimal;
/**
 * Provides a subtraction operation on `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, subtract } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   subtract(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("-1")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const subtract: {
    /**
     * Provides a subtraction operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, subtract } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   subtract(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("-1")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Provides a subtraction operation on `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, subtract } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   subtract(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("-1")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Provides a division operation on `BigDecimal`s.
 *
 * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
 * which represents the integer division rounded down to the nearest integer.
 *
 * If the divisor is `0`, the result will be `Option.none()`.
 *
 * @example
 * ```ts
 * import { BigDecimal, Option } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   BigDecimal.divide(
 *     BigDecimal.fromStringUnsafe("6"),
 *     BigDecimal.fromStringUnsafe("3")
 *   ),
 *   Option.some(BigDecimal.fromStringUnsafe("2"))
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.divide(
 *     BigDecimal.fromStringUnsafe("6"),
 *     BigDecimal.fromStringUnsafe("4")
 *   ),
 *   Option.some(BigDecimal.fromStringUnsafe("1.5"))
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.divide(
 *     BigDecimal.fromStringUnsafe("6"),
 *     BigDecimal.fromStringUnsafe("0")
 *   ),
 *   Option.none()
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const divide: {
    /**
     * Provides a division operation on `BigDecimal`s.
     *
     * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
     * which represents the integer division rounded down to the nearest integer.
     *
     * If the divisor is `0`, the result will be `Option.none()`.
     *
     * @example
     * ```ts
     * import { BigDecimal, Option } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("3")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("2"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("4")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("1.5"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("0")
     *   ),
     *   Option.none()
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => Option.Option<BigDecimal>;
    /**
     * Provides a division operation on `BigDecimal`s.
     *
     * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
     * which represents the integer division rounded down to the nearest integer.
     *
     * If the divisor is `0`, the result will be `Option.none()`.
     *
     * @example
     * ```ts
     * import { BigDecimal, Option } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("3")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("2"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("4")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("1.5"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.divide(
     *     BigDecimal.fromStringUnsafe("6"),
     *     BigDecimal.fromStringUnsafe("0")
     *   ),
     *   Option.none()
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): Option.Option<BigDecimal>;
};
/**
 * Provides an unsafe division operation on `BigDecimal`s.
 *
 * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
 * which represents the integer division rounded down to the nearest integer.
 *
 * Throws a `RangeError` if the divisor is `0`.
 *
 * @example
 * ```ts
 * import { divideUnsafe, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("3")),
 *   fromStringUnsafe("2")
 * )
 * assert.deepStrictEqual(
 *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("4")),
 *   fromStringUnsafe("1.5")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const divideUnsafe: {
    /**
     * Provides an unsafe division operation on `BigDecimal`s.
     *
     * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
     * which represents the integer division rounded down to the nearest integer.
     *
     * Throws a `RangeError` if the divisor is `0`.
     *
     * @example
     * ```ts
     * import { divideUnsafe, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("3")),
     *   fromStringUnsafe("2")
     * )
     * assert.deepStrictEqual(
     *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("4")),
     *   fromStringUnsafe("1.5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Provides an unsafe division operation on `BigDecimal`s.
     *
     * If the dividend is not a multiple of the divisor the result will be a `BigDecimal` value
     * which represents the integer division rounded down to the nearest integer.
     *
     * Throws a `RangeError` if the divisor is `0`.
     *
     * @example
     * ```ts
     * import { divideUnsafe, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("3")),
     *   fromStringUnsafe("2")
     * )
     * assert.deepStrictEqual(
     *   divideUnsafe(fromStringUnsafe("6"), fromStringUnsafe("4")),
     *   fromStringUnsafe("1.5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Provides an `Order` instance for `BigDecimal` that allows comparing and sorting BigDecimal values.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const a = BigDecimal.fromNumberUnsafe(1.5)
 * const b = BigDecimal.fromNumberUnsafe(2.3)
 * const c = BigDecimal.fromNumberUnsafe(1.5)
 *
 * console.log(BigDecimal.Order(a, b)) // -1 (a < b)
 * console.log(BigDecimal.Order(b, a)) // 1 (b > a)
 * console.log(BigDecimal.Order(a, c)) // 0 (a === c)
 * ```
 *
 * @since 2.0.0
 * @category instances
 */
export declare const Order: order.Order<BigDecimal>;
/**
 * Returns `true` if the first argument is less than the second, otherwise `false`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isLessThan } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   isLessThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   true
 * )
 * assert.deepStrictEqual(
 *   isLessThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
 *   false
 * )
 * assert.deepStrictEqual(
 *   isLessThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
 *   false
 * )
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isLessThan: {
    /**
     * Returns `true` if the first argument is less than the second, otherwise `false`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isLessThan } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   false
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: BigDecimal): (self: BigDecimal) => boolean;
    /**
     * Returns `true` if the first argument is less than the second, otherwise `false`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isLessThan } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isLessThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   false
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, that: BigDecimal): boolean;
};
/**
 * Checks if a given `BigDecimal` is less than or equal to the provided one.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isLessThanOrEqualTo } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   isLessThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   true
 * )
 * assert.deepStrictEqual(
 *   isLessThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
 *   true
 * )
 * assert.deepStrictEqual(
 *   isLessThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
 *   false
 * )
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isLessThanOrEqualTo: {
    /**
     * Checks if a given `BigDecimal` is less than or equal to the provided one.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isLessThanOrEqualTo } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   false
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: BigDecimal): (self: BigDecimal) => boolean;
    /**
     * Checks if a given `BigDecimal` is less than or equal to the provided one.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isLessThanOrEqualTo } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isLessThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   false
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, that: BigDecimal): boolean;
};
/**
 * Returns `true` if the first argument is greater than the second, otherwise `false`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isGreaterThan } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   isGreaterThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   false
 * )
 * assert.deepStrictEqual(
 *   isGreaterThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
 *   false
 * )
 * assert.deepStrictEqual(
 *   isGreaterThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
 *   true
 * )
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isGreaterThan: {
    /**
     * Returns `true` if the first argument is greater than the second, otherwise `false`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isGreaterThan } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   true
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: BigDecimal): (self: BigDecimal) => boolean;
    /**
     * Returns `true` if the first argument is greater than the second, otherwise `false`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isGreaterThan } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThan(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   true
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, that: BigDecimal): boolean;
};
/**
 * Checks if a given `BigDecimal` is greater than or equal to the provided one.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isGreaterThanOrEqualTo } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   isGreaterThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   false
 * )
 * assert.deepStrictEqual(
 *   isGreaterThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
 *   true
 * )
 * assert.deepStrictEqual(
 *   isGreaterThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
 *   true
 * )
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isGreaterThanOrEqualTo: {
    /**
     * Checks if a given `BigDecimal` is greater than or equal to the provided one.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isGreaterThanOrEqualTo } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   true
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: BigDecimal): (self: BigDecimal) => boolean;
    /**
     * Checks if a given `BigDecimal` is greater than or equal to the provided one.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, isGreaterThanOrEqualTo } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   false
     * )
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("3"), fromStringUnsafe("3")),
     *   true
     * )
     * assert.deepStrictEqual(
     *   isGreaterThanOrEqualTo(fromStringUnsafe("4"), fromStringUnsafe("3")),
     *   true
     * )
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, that: BigDecimal): boolean;
};
/**
 * Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as assert from "node:assert"
 *
 * const between = BigDecimal.between({
 *   minimum: BigDecimal.fromStringUnsafe("1"),
 *   maximum: BigDecimal.fromStringUnsafe("5")
 * })
 *
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("3")), true)
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("0")), false)
 * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("6")), false)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const between: {
    /**
     * Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     * import * as assert from "node:assert"
     *
     * const between = BigDecimal.between({
     *   minimum: BigDecimal.fromStringUnsafe("1"),
     *   maximum: BigDecimal.fromStringUnsafe("5")
     * })
     *
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("3")), true)
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("0")), false)
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("6")), false)
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (options: {
        minimum: BigDecimal;
        maximum: BigDecimal;
    }): (self: BigDecimal) => boolean;
    /**
     * Checks if a `BigDecimal` is between a `minimum` and `maximum` value (inclusive).
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     * import * as assert from "node:assert"
     *
     * const between = BigDecimal.between({
     *   minimum: BigDecimal.fromStringUnsafe("1"),
     *   maximum: BigDecimal.fromStringUnsafe("5")
     * })
     *
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("3")), true)
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("0")), false)
     * assert.deepStrictEqual(between(BigDecimal.fromStringUnsafe("6")), false)
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, options: {
        minimum: BigDecimal;
        maximum: BigDecimal;
    }): boolean;
};
/**
 * Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values.
 *
 * - If the `BigDecimal` is less than the `minimum` value, the function returns the `minimum` value.
 * - If the `BigDecimal` is greater than the `maximum` value, the function returns the `maximum` value.
 * - Otherwise, it returns the original `BigDecimal`.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 * import * as assert from "node:assert"
 *
 * const clamp = BigDecimal.clamp({
 *   minimum: BigDecimal.fromStringUnsafe("1"),
 *   maximum: BigDecimal.fromStringUnsafe("5")
 * })
 *
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("3")),
 *   BigDecimal.fromStringUnsafe("3")
 * )
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("0")),
 *   BigDecimal.fromStringUnsafe("1")
 * )
 * assert.deepStrictEqual(
 *   clamp(BigDecimal.fromStringUnsafe("6")),
 *   BigDecimal.fromStringUnsafe("5")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const clamp: {
    /**
     * Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values.
     *
     * - If the `BigDecimal` is less than the `minimum` value, the function returns the `minimum` value.
     * - If the `BigDecimal` is greater than the `maximum` value, the function returns the `maximum` value.
     * - Otherwise, it returns the original `BigDecimal`.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     * import * as assert from "node:assert"
     *
     * const clamp = BigDecimal.clamp({
     *   minimum: BigDecimal.fromStringUnsafe("1"),
     *   maximum: BigDecimal.fromStringUnsafe("5")
     * })
     *
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("3")),
     *   BigDecimal.fromStringUnsafe("3")
     * )
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("0")),
     *   BigDecimal.fromStringUnsafe("1")
     * )
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("6")),
     *   BigDecimal.fromStringUnsafe("5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (options: {
        minimum: BigDecimal;
        maximum: BigDecimal;
    }): (self: BigDecimal) => BigDecimal;
    /**
     * Restricts the given `BigDecimal` to be within the range specified by the `minimum` and `maximum` values.
     *
     * - If the `BigDecimal` is less than the `minimum` value, the function returns the `minimum` value.
     * - If the `BigDecimal` is greater than the `maximum` value, the function returns the `maximum` value.
     * - Otherwise, it returns the original `BigDecimal`.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     * import * as assert from "node:assert"
     *
     * const clamp = BigDecimal.clamp({
     *   minimum: BigDecimal.fromStringUnsafe("1"),
     *   maximum: BigDecimal.fromStringUnsafe("5")
     * })
     *
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("3")),
     *   BigDecimal.fromStringUnsafe("3")
     * )
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("0")),
     *   BigDecimal.fromStringUnsafe("1")
     * )
     * assert.deepStrictEqual(
     *   clamp(BigDecimal.fromStringUnsafe("6")),
     *   BigDecimal.fromStringUnsafe("5")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, options: {
        minimum: BigDecimal;
        maximum: BigDecimal;
    }): BigDecimal;
};
/**
 * Returns the minimum between two `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, min } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   min(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("2")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const min: {
    /**
     * Returns the minimum between two `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, min } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   min(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("2")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Returns the minimum between two `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, min } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   min(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("2")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Returns the maximum between two `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, max } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   max(fromStringUnsafe("2"), fromStringUnsafe("3")),
 *   fromStringUnsafe("3")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const max: {
    /**
     * Returns the maximum between two `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, max } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   max(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("3")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Returns the maximum between two `BigDecimal`s.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, max } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   max(fromStringUnsafe("2"), fromStringUnsafe("3")),
     *   fromStringUnsafe("3")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, that: BigDecimal): BigDecimal;
};
/**
 * Determines the sign of a given `BigDecimal`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, sign } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(sign(fromStringUnsafe("-5")), -1)
 * assert.deepStrictEqual(sign(fromStringUnsafe("0")), 0)
 * assert.deepStrictEqual(sign(fromStringUnsafe("5")), 1)
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const sign: (n: BigDecimal) => Ordering;
/**
 * Determines the absolute value of a given `BigDecimal`.
 *
 * @example
 * ```ts
 * import { abs, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(abs(fromStringUnsafe("-5")), fromStringUnsafe("5"))
 * assert.deepStrictEqual(abs(fromStringUnsafe("0")), fromStringUnsafe("0"))
 * assert.deepStrictEqual(abs(fromStringUnsafe("5")), fromStringUnsafe("5"))
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const abs: (n: BigDecimal) => BigDecimal;
/**
 * Provides a negate operation on `BigDecimal`s.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, negate } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(negate(fromStringUnsafe("3")), fromStringUnsafe("-3"))
 * assert.deepStrictEqual(negate(fromStringUnsafe("-6")), fromStringUnsafe("6"))
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const negate: (n: BigDecimal) => BigDecimal;
/**
 * Returns the remainder left over when one operand is divided by a second operand.
 *
 * If the divisor is `0`, the result will be `Option.none()`.
 *
 * @example
 * ```ts
 * import { BigDecimal, Option } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("2"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   Option.some(BigDecimal.fromStringUnsafe("0"))
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("3"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   Option.some(BigDecimal.fromStringUnsafe("1"))
 * )
 * assert.deepStrictEqual(
 *   BigDecimal.remainder(
 *     BigDecimal.fromStringUnsafe("-4"),
 *     BigDecimal.fromStringUnsafe("2")
 *   ),
 *   Option.some(BigDecimal.fromStringUnsafe("0"))
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const remainder: {
    /**
     * Returns the remainder left over when one operand is divided by a second operand.
     *
     * If the divisor is `0`, the result will be `Option.none()`.
     *
     * @example
     * ```ts
     * import { BigDecimal, Option } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("2"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("0"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("3"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("1"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("-4"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("0"))
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (divisor: BigDecimal): (self: BigDecimal) => Option.Option<BigDecimal>;
    /**
     * Returns the remainder left over when one operand is divided by a second operand.
     *
     * If the divisor is `0`, the result will be `Option.none()`.
     *
     * @example
     * ```ts
     * import { BigDecimal, Option } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("2"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("0"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("3"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("1"))
     * )
     * assert.deepStrictEqual(
     *   BigDecimal.remainder(
     *     BigDecimal.fromStringUnsafe("-4"),
     *     BigDecimal.fromStringUnsafe("2")
     *   ),
     *   Option.some(BigDecimal.fromStringUnsafe("0"))
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, divisor: BigDecimal): Option.Option<BigDecimal>;
};
/**
 * Returns the remainder left over when one operand is divided by a second operand.
 *
 * Throws a `RangeError` if the divisor is `0`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, remainderUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   remainderUnsafe(fromStringUnsafe("2"), fromStringUnsafe("2")),
 *   fromStringUnsafe("0")
 * )
 * assert.deepStrictEqual(
 *   remainderUnsafe(fromStringUnsafe("3"), fromStringUnsafe("2")),
 *   fromStringUnsafe("1")
 * )
 * assert.deepStrictEqual(
 *   remainderUnsafe(fromStringUnsafe("-4"), fromStringUnsafe("2")),
 *   fromStringUnsafe("0")
 * )
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const remainderUnsafe: {
    /**
     * Returns the remainder left over when one operand is divided by a second operand.
     *
     * Throws a `RangeError` if the divisor is `0`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, remainderUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("2"), fromStringUnsafe("2")),
     *   fromStringUnsafe("0")
     * )
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("3"), fromStringUnsafe("2")),
     *   fromStringUnsafe("1")
     * )
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("-4"), fromStringUnsafe("2")),
     *   fromStringUnsafe("0")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (divisor: BigDecimal): (self: BigDecimal) => BigDecimal;
    /**
     * Returns the remainder left over when one operand is divided by a second operand.
     *
     * Throws a `RangeError` if the divisor is `0`.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, remainderUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("2"), fromStringUnsafe("2")),
     *   fromStringUnsafe("0")
     * )
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("3"), fromStringUnsafe("2")),
     *   fromStringUnsafe("1")
     * )
     * assert.deepStrictEqual(
     *   remainderUnsafe(fromStringUnsafe("-4"), fromStringUnsafe("2")),
     *   fromStringUnsafe("0")
     * )
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: BigDecimal, divisor: BigDecimal): BigDecimal;
};
/**
 * Provides an `Equivalence` instance for `BigDecimal` that determines equality between BigDecimal values.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const a = BigDecimal.fromNumberUnsafe(1.50)
 * const b = BigDecimal.fromNumberUnsafe(1.5)
 * const c = BigDecimal.fromNumberUnsafe(2.0)
 *
 * console.log(BigDecimal.Equivalence(a, b)) // true (1.50 === 1.5)
 * console.log(BigDecimal.Equivalence(a, c)) // false (1.50 !== 2.0)
 * ```
 *
 * @category instances
 * @since 2.0.0
 */
export declare const Equivalence: Equ.Equivalence<BigDecimal>;
/**
 * Checks if two `BigDecimal`s are equal.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const a = BigDecimal.fromNumberUnsafe(1.5)
 * const b = BigDecimal.fromNumberUnsafe(1.50)
 * const c = BigDecimal.fromNumberUnsafe(2.0)
 *
 * console.log(BigDecimal.equals(a, b)) // true
 * console.log(BigDecimal.equals(a, c)) // false
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const equals: {
    /**
     * Checks if two `BigDecimal`s are equal.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     *
     * const a = BigDecimal.fromNumberUnsafe(1.5)
     * const b = BigDecimal.fromNumberUnsafe(1.50)
     * const c = BigDecimal.fromNumberUnsafe(2.0)
     *
     * console.log(BigDecimal.equals(a, b)) // true
     * console.log(BigDecimal.equals(a, c)) // false
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: BigDecimal): (self: BigDecimal) => boolean;
    /**
     * Checks if two `BigDecimal`s are equal.
     *
     * @example
     * ```ts
     * import { BigDecimal } from "effect"
     *
     * const a = BigDecimal.fromNumberUnsafe(1.5)
     * const b = BigDecimal.fromNumberUnsafe(1.50)
     * const c = BigDecimal.fromNumberUnsafe(2.0)
     *
     * console.log(BigDecimal.equals(a, b)) // true
     * console.log(BigDecimal.equals(a, c)) // false
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: BigDecimal, that: BigDecimal): boolean;
};
/**
 * Creates a `BigDecimal` from a `bigint` value.
 *
 * @example
 * ```ts
 * import { BigDecimal } from "effect"
 *
 * const decimal = BigDecimal.fromBigInt(123n)
 * console.log(BigDecimal.format(decimal)) // "123"
 *
 * const largeBigInt = BigDecimal.fromBigInt(9007199254740991n)
 * console.log(BigDecimal.format(largeBigInt)) // "9007199254740991"
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromBigInt: (n: bigint) => BigDecimal;
/**
 * Creates a `BigDecimal` from a `number` value.
 *
 * It is not recommended to convert a floating point number to a decimal directly,
 * as the floating point representation may be unexpected.
 *
 * Throws a `RangeError` if the number is not finite (`NaN`, `+Infinity` or `-Infinity`).
 *
 * @example
 * ```ts
 * import { fromNumberUnsafe, make } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(fromNumberUnsafe(123), make(123n, 0))
 * assert.deepStrictEqual(fromNumberUnsafe(123.456), make(123456n, 3))
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromNumberUnsafe: (n: number) => BigDecimal;
/**
 * Creates a `BigDecimal` from a `number` value.
 *
 * It is not recommended to convert a floating point number to a decimal directly,
 * as the floating point representation may be unexpected.
 *
 * Returns `Option.none()` for `NaN`, `+Infinity` or `-Infinity`.
 *
 * @example
 * ```ts
 * import { BigDecimal, Option } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(BigDecimal.fromNumber(123), Option.some(BigDecimal.make(123n, 0)))
 * assert.deepStrictEqual(
 *   BigDecimal.fromNumber(123.456),
 *   Option.some(BigDecimal.make(123456n, 3))
 * )
 * assert.deepStrictEqual(BigDecimal.fromNumber(Infinity), Option.none())
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromNumber: (n: number) => Option.Option<BigDecimal>;
/**
 * Parses a numerical `string` into a `BigDecimal`.
 *
 * @example
 * ```ts
 * import { BigDecimal, Option } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(BigDecimal.fromString("123"), Option.some(BigDecimal.make(123n, 0)))
 * assert.deepStrictEqual(
 *   BigDecimal.fromString("123.456"),
 *   Option.some(BigDecimal.make(123456n, 3))
 * )
 * assert.deepStrictEqual(BigDecimal.fromString("123.abc"), Option.none())
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromString: (s: string) => Option.Option<BigDecimal>;
/**
 * Parses a numerical `string` into a `BigDecimal`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, make } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(fromStringUnsafe("123"), make(123n, 0))
 * assert.deepStrictEqual(fromStringUnsafe("123.456"), make(123456n, 3))
 * assert.throws(() => fromStringUnsafe("123.abc"))
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromStringUnsafe: (s: string) => BigDecimal;
/**
 * Formats a given `BigDecimal` as a `string`.
 *
 * If the scale of the `BigDecimal` is greater than or equal to 16, the `BigDecimal` will
 * be formatted in scientific notation.
 *
 * @example
 * ```ts
 * import { format, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(format(fromStringUnsafe("-5")), "-5")
 * assert.deepStrictEqual(format(fromStringUnsafe("123.456")), "123.456")
 * assert.deepStrictEqual(format(fromStringUnsafe("-0.00000123")), "-0.00000123")
 * ```
 *
 * @since 2.0.0
 * @category conversions
 */
export declare const format: (n: BigDecimal) => string;
/**
 * Formats a given `BigDecimal` as a `string` in scientific notation.
 *
 * @example
 * ```ts
 * import { make, toExponential } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(toExponential(make(123456n, -5)), "1.23456e+10")
 * ```
 *
 * @since 4.0.0
 * @category conversions
 */
export declare const toExponential: (n: BigDecimal) => string;
/**
 * Converts a `BigDecimal` to a `number`.
 *
 * This function will produce incorrect results if the `BigDecimal` exceeds the 64-bit range of a `number`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, toNumberUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(toNumberUnsafe(fromStringUnsafe("123.456")), 123.456)
 * ```
 *
 * @since 2.0.0
 * @category conversions
 */
export declare const toNumberUnsafe: (n: BigDecimal) => number;
/**
 * Checks if a given `BigDecimal` is an integer.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isInteger } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isInteger(fromStringUnsafe("0")), true)
 * assert.deepStrictEqual(isInteger(fromStringUnsafe("1")), true)
 * assert.deepStrictEqual(isInteger(fromStringUnsafe("1.1")), false)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isInteger: (n: BigDecimal) => boolean;
/**
 * Checks if a given `BigDecimal` is `0`.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isZero } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isZero(fromStringUnsafe("0")), true)
 * assert.deepStrictEqual(isZero(fromStringUnsafe("1")), false)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isZero: (n: BigDecimal) => boolean;
/**
 * Checks if a given `BigDecimal` is negative.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isNegative } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("-1")), true)
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("0")), false)
 * assert.deepStrictEqual(isNegative(fromStringUnsafe("1")), false)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isNegative: (n: BigDecimal) => boolean;
/**
 * Checks if a given `BigDecimal` is positive.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, isPositive } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(isPositive(fromStringUnsafe("-1")), false)
 * assert.deepStrictEqual(isPositive(fromStringUnsafe("0")), false)
 * assert.deepStrictEqual(isPositive(fromStringUnsafe("1")), true)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isPositive: (n: BigDecimal) => boolean;
/**
 * Rounding modes for `BigDecimal`.
 *
 * `ceil`: round towards positive infinity
 * `floor`: round towards negative infinity
 * `to-zero`: round towards zero
 * `from-zero`: round away from zero
 * `half-ceil`: round to the nearest neighbor; if equidistant round towards positive infinity
 * `half-floor`: round to the nearest neighbor; if equidistant round towards negative infinity
 * `half-to-zero`: round to the nearest neighbor; if equidistant round towards zero
 * `half-from-zero`: round to the nearest neighbor; if equidistant round away from zero
 * `half-even`: round to the nearest neighbor; if equidistant round to the neighbor with an even digit
 * `half-odd`: round to the nearest neighbor; if equidistant round to the neighbor with an odd digit
 *
 * @since 4.0.0
 * @category math
 */
export type RoundingMode = "ceil" | "floor" | "to-zero" | "from-zero" | "half-ceil" | "half-floor" | "half-to-zero" | "half-from-zero" | "half-even" | "half-odd";
/**
 * Rounds a `BigDecimal` at the given scale with the specified rounding mode.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, round } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   round(fromStringUnsafe("145"), { mode: "from-zero", scale: -1 }),
 *   fromStringUnsafe("150")
 * )
 * assert.deepStrictEqual(
 *   round(fromStringUnsafe("-14.5")),
 *   fromStringUnsafe("-15")
 * )
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const round: {
    /**
     * Rounds a `BigDecimal` at the given scale with the specified rounding mode.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, round } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   round(fromStringUnsafe("145"), { mode: "from-zero", scale: -1 }),
     *   fromStringUnsafe("150")
     * )
     * assert.deepStrictEqual(
     *   round(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-15")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (options: {
        scale?: number;
        mode?: RoundingMode;
    }): (self: BigDecimal) => BigDecimal;
    /**
     * Rounds a `BigDecimal` at the given scale with the specified rounding mode.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, round } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   round(fromStringUnsafe("145"), { mode: "from-zero", scale: -1 }),
     *   fromStringUnsafe("150")
     * )
     * assert.deepStrictEqual(
     *   round(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-15")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (n: BigDecimal, options?: {
        scale?: number;
        mode?: RoundingMode;
    }): BigDecimal;
};
/**
 * Truncate a `BigDecimal` at the given scale. This is the same operation as rounding away from zero.
 *
 * @example
 * ```ts
 * import { fromStringUnsafe, truncate } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   truncate(fromStringUnsafe("145"), -1),
 *   fromStringUnsafe("140")
 * )
 * assert.deepStrictEqual(
 *   truncate(fromStringUnsafe("-14.5")),
 *   fromStringUnsafe("-14")
 * )
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const truncate: {
    /**
     * Truncate a `BigDecimal` at the given scale. This is the same operation as rounding away from zero.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, truncate } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   truncate(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("140")
     * )
     * assert.deepStrictEqual(
     *   truncate(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-14")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (scale: number): (self: BigDecimal) => BigDecimal;
    /**
     * Truncate a `BigDecimal` at the given scale. This is the same operation as rounding away from zero.
     *
     * @example
     * ```ts
     * import { fromStringUnsafe, truncate } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   truncate(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("140")
     * )
     * assert.deepStrictEqual(
     *   truncate(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-14")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (self: BigDecimal, scale?: number): BigDecimal;
};
/**
 * Calculate the ceiling of a `BigDecimal` at the given scale.
 *
 * @example
 * ```ts
 * import { ceil, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   ceil(fromStringUnsafe("145"), -1),
 *   fromStringUnsafe("150")
 * )
 * assert.deepStrictEqual(ceil(fromStringUnsafe("-14.5")), fromStringUnsafe("-14"))
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const ceil: {
    /**
     * Calculate the ceiling of a `BigDecimal` at the given scale.
     *
     * @example
     * ```ts
     * import { ceil, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   ceil(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("150")
     * )
     * assert.deepStrictEqual(ceil(fromStringUnsafe("-14.5")), fromStringUnsafe("-14"))
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (scale: number): (self: BigDecimal) => BigDecimal;
    /**
     * Calculate the ceiling of a `BigDecimal` at the given scale.
     *
     * @example
     * ```ts
     * import { ceil, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   ceil(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("150")
     * )
     * assert.deepStrictEqual(ceil(fromStringUnsafe("-14.5")), fromStringUnsafe("-14"))
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (self: BigDecimal, scale?: number): BigDecimal;
};
/**
 * Calculate the floor of a `BigDecimal` at the given scale.
 *
 * @example
 * ```ts
 * import { floor, fromStringUnsafe } from "effect/BigDecimal"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   floor(fromStringUnsafe("145"), -1),
 *   fromStringUnsafe("140")
 * )
 * assert.deepStrictEqual(
 *   floor(fromStringUnsafe("-14.5")),
 *   fromStringUnsafe("-15")
 * )
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const floor: {
    /**
     * Calculate the floor of a `BigDecimal` at the given scale.
     *
     * @example
     * ```ts
     * import { floor, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   floor(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("140")
     * )
     * assert.deepStrictEqual(
     *   floor(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-15")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (scale: number): (self: BigDecimal) => BigDecimal;
    /**
     * Calculate the floor of a `BigDecimal` at the given scale.
     *
     * @example
     * ```ts
     * import { floor, fromStringUnsafe } from "effect/BigDecimal"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(
     *   floor(fromStringUnsafe("145"), -1),
     *   fromStringUnsafe("140")
     * )
     * assert.deepStrictEqual(
     *   floor(fromStringUnsafe("-14.5")),
     *   fromStringUnsafe("-15")
     * )
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (self: BigDecimal, scale?: number): BigDecimal;
};
export {};
//# sourceMappingURL=BigDecimal.d.ts.map