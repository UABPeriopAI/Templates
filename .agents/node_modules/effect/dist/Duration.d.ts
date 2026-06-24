/**
 * This module provides utilities for working with durations of time. A `Duration`
 * is an immutable data type that represents a span of time with high precision,
 * supporting operations from nanoseconds to weeks.
 *
 * Durations support:
 * - **High precision**: Nanosecond-level accuracy using BigInt
 * - **Multiple formats**: Numbers (millis), BigInt (nanos), tuples, strings
 * - **Arithmetic operations**: Add, subtract, multiply, divide
 * - **Comparisons**: Equal, less than, greater than
 * - **Conversions**: Between different time units
 * - **Human-readable formatting**: Pretty printing and parsing
 *
 * @since 2.0.0
 */
import * as Combiner from "./Combiner.ts";
import * as Equal from "./Equal.ts";
import type * as Equ from "./Equivalence.ts";
import type * as Inspectable from "./Inspectable.ts";
import * as Option from "./Option.ts";
import * as order from "./Order.ts";
import type { Pipeable } from "./Pipeable.ts";
import * as Reducer from "./Reducer.ts";
declare const TypeId = "~effect/time/Duration";
/**
 * Represents a span of time with high precision, supporting operations from
 * nanoseconds to weeks.
 *
 * @since 2.0.0
 * @category models
 */
export interface Duration extends Equal.Equal, Pipeable, Inspectable.Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly value: DurationValue;
}
/**
 * The internal representation of a `Duration` value.
 *
 * @since 2.0.0
 * @category models
 */
export type DurationValue = {
    _tag: "Millis";
    millis: number;
} | {
    _tag: "Nanos";
    nanos: bigint;
} | {
    _tag: "Infinity";
} | {
    _tag: "NegativeInfinity";
};
/**
 * Valid time units that can be used in duration string representations.
 *
 * @since 2.0.0
 * @category models
 */
export type Unit = "nano" | "nanos" | "micro" | "micros" | "milli" | "millis" | "second" | "seconds" | "minute" | "minutes" | "hour" | "hours" | "day" | "days" | "week" | "weeks";
/**
 * Valid input types that can be converted to a Duration.
 *
 * @since 2.0.0
 * @category models
 */
export type Input = Duration | number | bigint | readonly [seconds: number, nanos: number] | `${number} ${Unit}` | DurationObject;
/**
 * An object with optional duration components that can be combined to create
 * a Duration. All fields are optional and additive.
 *
 * Compatible with Temporal.Duration-like objects.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * Duration.fromInputUnsafe({ seconds: 30 })
 * Duration.fromInputUnsafe({ days: 1 })
 * Duration.fromInputUnsafe({ seconds: 1, nanoseconds: 500 })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface DurationObject {
    readonly weeks?: number | undefined;
    readonly days?: number | undefined;
    readonly hours?: number | undefined;
    readonly minutes?: number | undefined;
    readonly seconds?: number | undefined;
    readonly milliseconds?: number | undefined;
    readonly microseconds?: number | undefined;
    readonly nanoseconds?: number | undefined;
}
/**
 * Decodes a `Duration.Input` into a `Duration`.
 *
 * If the input is not a valid `Duration.Input`, it throws an error.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration1 = Duration.fromInputUnsafe(1000) // 1000 milliseconds
 * const duration2 = Duration.fromInputUnsafe("5 seconds")
 * const duration3 = Duration.fromInputUnsafe([2, 500_000_000]) // 2 seconds and 500ms
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromInputUnsafe: (input: Input) => Duration;
/**
 * Safely decodes a `Input` value into a `Duration`, returning
 * `Option.none()` if decoding fails.
 *
 * **Example**
 *
 * ```ts
 * import { Duration, Option } from "effect"
 *
 * Duration.fromInput(1000).pipe(Option.map(Duration.toSeconds)) // Some(1)
 *
 * Duration.fromInput("invalid" as any) // None
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export declare const fromInput: (u: Input) => Option.Option<Duration>;
/**
 * Checks if a value is a Duration.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.isDuration(Duration.seconds(1))) // true
 * console.log(Duration.isDuration(1000)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isDuration: (u: unknown) => u is Duration;
/**
 * Checks if a Duration is finite (not infinite).
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.isFinite(Duration.seconds(5))) // true
 * console.log(Duration.isFinite(Duration.infinity)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isFinite: (self: Duration) => boolean;
/**
 * Checks if a Duration is zero.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.isZero(Duration.zero)) // true
 * console.log(Duration.isZero(Duration.seconds(1))) // false
 * ```
 *
 * @since 3.5.0
 * @category guards
 */
export declare const isZero: (self: Duration) => boolean;
/**
 * Returns `true` if the duration is negative (strictly less than zero).
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.isNegative(Duration.seconds(-5))) // true
 * console.log(Duration.isNegative(Duration.zero)) // false
 * console.log(Duration.isNegative(Duration.negativeInfinity)) // true
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isNegative: (self: Duration) => boolean;
/**
 * Returns `true` if the duration is positive (strictly greater than zero).
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.isPositive(Duration.seconds(5))) // true
 * console.log(Duration.isPositive(Duration.zero)) // false
 * console.log(Duration.isPositive(Duration.infinity)) // true
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isPositive: (self: Duration) => boolean;
/**
 * Returns the absolute value of the duration.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * Duration.toMillis(Duration.abs(Duration.seconds(-5))) // 5000
 * Duration.abs(Duration.negativeInfinity) === Duration.infinity // true
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const abs: (self: Duration) => Duration;
/**
 * Negates the duration.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * Duration.toMillis(Duration.negate(Duration.seconds(5))) // -5000
 * Duration.negate(Duration.infinity) === Duration.negativeInfinity // true
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const negate: (self: Duration) => Duration;
/**
 * A Duration representing zero time.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toMillis(Duration.zero)) // 0
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const zero: Duration;
/**
 * A Duration representing infinite time.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toMillis(Duration.infinity)) // Infinity
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const infinity: Duration;
/**
 * A Duration representing negative infinite time.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toMillis(Duration.negativeInfinity)) // -Infinity
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const negativeInfinity: Duration;
/**
 * Creates a Duration from nanoseconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.nanos(BigInt(500_000_000))
 * console.log(Duration.toMillis(duration)) // 500
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const nanos: (nanos: bigint) => Duration;
/**
 * Creates a Duration from microseconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.micros(BigInt(500_000))
 * console.log(Duration.toMillis(duration)) // 500
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const micros: (micros: bigint) => Duration;
/**
 * Creates a Duration from milliseconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.millis(1000)
 * console.log(Duration.toMillis(duration)) // 1000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const millis: (millis: number) => Duration;
/**
 * Creates a Duration from seconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.seconds(30)
 * console.log(Duration.toMillis(duration)) // 30000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const seconds: (seconds: number) => Duration;
/**
 * Creates a Duration from minutes.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.minutes(5)
 * console.log(Duration.toMillis(duration)) // 300000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const minutes: (minutes: number) => Duration;
/**
 * Creates a Duration from hours.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.hours(2)
 * console.log(Duration.toMillis(duration)) // 7200000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const hours: (hours: number) => Duration;
/**
 * Creates a Duration from days.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.days(1)
 * console.log(Duration.toMillis(duration)) // 86400000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const days: (days: number) => Duration;
/**
 * Creates a Duration from weeks.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.weeks(1)
 * console.log(Duration.toMillis(duration)) // 604800000
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const weeks: (weeks: number) => Duration;
/**
 * Converts a Duration to milliseconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toMillis(Duration.seconds(5))) // 5000
 * console.log(Duration.toMillis(Duration.minutes(2))) // 120000
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const toMillis: (self: Duration) => number;
/**
 * Converts a Duration to seconds.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toSeconds(Duration.millis(5000))) // 5
 * console.log(Duration.toSeconds(Duration.minutes(2))) // 120
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const toSeconds: (self: Duration) => number;
/**
 * Converts a Duration to minutes.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toMinutes(Duration.seconds(120))) // 2
 * console.log(Duration.toMinutes(Duration.hours(1))) // 60
 * ```
 *
 * @since 3.8.0
 * @category getters
 */
export declare const toMinutes: (self: Duration) => number;
/**
 * Converts a Duration to hours.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toHours(Duration.minutes(120))) // 2
 * console.log(Duration.toHours(Duration.days(1))) // 24
 * ```
 *
 * @since 3.8.0
 * @category getters
 */
export declare const toHours: (self: Duration) => number;
/**
 * Converts a Duration to days.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toDays(Duration.hours(48))) // 2
 * console.log(Duration.toDays(Duration.weeks(1))) // 7
 * ```
 *
 * @since 3.8.0
 * @category getters
 */
export declare const toDays: (self: Duration) => number;
/**
 * Converts a Duration to weeks.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * console.log(Duration.toWeeks(Duration.days(14))) // 2
 * console.log(Duration.toWeeks(Duration.days(7))) // 1
 * ```
 *
 * @since 3.8.0
 * @category getters
 */
export declare const toWeeks: (self: Duration) => number;
/**
 * Get the duration in nanoseconds as a bigint.
 *
 * If the duration is infinite, it throws an error.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.seconds(2)
 * const nanos = Duration.toNanosUnsafe(duration)
 * console.log(nanos) // 2000000000n
 *
 * // This will throw an error
 * try {
 *   Duration.toNanosUnsafe(Duration.infinity)
 * } catch (error) {
 *   console.log((error as Error).message) // "Cannot convert infinite duration to nanos"
 * }
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const toNanosUnsafe: (self: Duration) => bigint;
/**
 * Get the duration in nanoseconds as a bigint.
 *
 * If the duration is infinite, returns `Option.none()`.
 *
 * **Example**
 *
 * ```ts
 * import { Duration, Option } from "effect"
 *
 * Duration.toNanos(Duration.seconds(1)) // Some(1000000000n)
 *
 * Duration.toNanos(Duration.infinity) // None
 * Option.getOrUndefined(Duration.toNanos(Duration.infinity)) // undefined
 * ```
 *
 * @category getters
 * @since 4.0.0
 */
export declare const toNanos: (self: Duration) => Option.Option<bigint>;
/**
 * Converts a Duration to high-resolution time format [seconds, nanoseconds].
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const duration = Duration.millis(1500)
 * const hrtime = Duration.toHrTime(duration)
 * console.log(hrtime) // [1, 500000000]
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export declare const toHrTime: (self: Duration) => [seconds: number, nanos: number];
/**
 * Pattern matches on a Duration, providing different handlers for millis and nanos.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const result = Duration.match(Duration.seconds(5), {
 *   onMillis: (millis) => `${millis} milliseconds`,
 *   onNanos: (nanos) => `${nanos} nanoseconds`,
 *   onInfinity: () => "infinite"
 * })
 * console.log(result) // "5000 milliseconds"
 * ```
 *
 * @since 2.0.0
 * @category pattern matching
 */
export declare const match: {
    /**
     * Pattern matches on a Duration, providing different handlers for millis and nanos.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const result = Duration.match(Duration.seconds(5), {
     *   onMillis: (millis) => `${millis} milliseconds`,
     *   onNanos: (nanos) => `${nanos} nanoseconds`,
     *   onInfinity: () => "infinite"
     * })
     * console.log(result) // "5000 milliseconds"
     * ```
     *
     * @since 2.0.0
     * @category pattern matching
     */
    <A, B, C, D = C>(options: {
        readonly onMillis: (millis: number) => A;
        readonly onNanos: (nanos: bigint) => B;
        readonly onInfinity: () => C;
        readonly onNegativeInfinity?: () => D;
    }): (self: Duration) => A | B | C | D;
    /**
     * Pattern matches on a Duration, providing different handlers for millis and nanos.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const result = Duration.match(Duration.seconds(5), {
     *   onMillis: (millis) => `${millis} milliseconds`,
     *   onNanos: (nanos) => `${nanos} nanoseconds`,
     *   onInfinity: () => "infinite"
     * })
     * console.log(result) // "5000 milliseconds"
     * ```
     *
     * @since 2.0.0
     * @category pattern matching
     */
    <A, B, C, D = C>(self: Duration, options: {
        readonly onMillis: (millis: number) => A;
        readonly onNanos: (nanos: bigint) => B;
        readonly onInfinity: () => C;
        readonly onNegativeInfinity?: () => D;
    }): A | B | C | D;
};
/**
 * Pattern matches on two `Duration`s, providing handlers that receive both values.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
 *   onMillis: (a, b) => a + b,
 *   onNanos: (a, b) => Number(a + b),
 *   onInfinity: () => Infinity
 * })
 * console.log(sum) // 5000
 * ```
 *
 * @since 2.0.0
 * @category pattern matching
 */
export declare const matchPair: {
    /**
     * Pattern matches on two `Duration`s, providing handlers that receive both values.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
     *   onMillis: (a, b) => a + b,
     *   onNanos: (a, b) => Number(a + b),
     *   onInfinity: () => Infinity
     * })
     * console.log(sum) // 5000
     * ```
     *
     * @since 2.0.0
     * @category pattern matching
     */
    <A, B, C>(that: Duration, options: {
        readonly onMillis: (self: number, that: number) => A;
        readonly onNanos: (self: bigint, that: bigint) => B;
        readonly onInfinity: (self: Duration, that: Duration) => C;
    }): (self: Duration) => A | B | C;
    /**
     * Pattern matches on two `Duration`s, providing handlers that receive both values.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const sum = Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
     *   onMillis: (a, b) => a + b,
     *   onNanos: (a, b) => Number(a + b),
     *   onInfinity: () => Infinity
     * })
     * console.log(sum) // 5000
     * ```
     *
     * @since 2.0.0
     * @category pattern matching
     */
    <A, B, C>(self: Duration, that: Duration, options: {
        readonly onMillis: (self: number, that: number) => A;
        readonly onNanos: (self: bigint, that: bigint) => B;
        readonly onInfinity: (self: Duration, that: Duration) => C;
    }): A | B | C;
};
/**
 * Order instance for `Duration`, allowing comparison operations.
 *
 * `NegativeInfinity` < any finite value < `Infinity`.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const durations = [
 *   Duration.seconds(3),
 *   Duration.seconds(1),
 *   Duration.seconds(2)
 * ]
 * const sorted = durations.sort((a, b) => Duration.Order(a, b))
 * console.log(sorted.map(Duration.toSeconds)) // [1, 2, 3]
 * ```
 *
 * @category instances
 * @since 2.0.0
 */
export declare const Order: order.Order<Duration>;
/**
 * Checks if a `Duration` is between a `minimum` and `maximum` value.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isInRange = Duration.between(Duration.seconds(3), {
 *   minimum: Duration.seconds(2),
 *   maximum: Duration.seconds(5)
 * })
 * console.log(isInRange) // true
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export declare const between: {
    /**
     * Checks if a `Duration` is between a `minimum` and `maximum` value.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isInRange = Duration.between(Duration.seconds(3), {
     *   minimum: Duration.seconds(2),
     *   maximum: Duration.seconds(5)
     * })
     * console.log(isInRange) // true
     * ```
     *
     * @category predicates
     * @since 2.0.0
     */
    (options: {
        minimum: Duration;
        maximum: Duration;
    }): (self: Duration) => boolean;
    /**
     * Checks if a `Duration` is between a `minimum` and `maximum` value.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isInRange = Duration.between(Duration.seconds(3), {
     *   minimum: Duration.seconds(2),
     *   maximum: Duration.seconds(5)
     * })
     * console.log(isInRange) // true
     * ```
     *
     * @category predicates
     * @since 2.0.0
     */
    (self: Duration, options: {
        minimum: Duration;
        maximum: Duration;
    }): boolean;
};
/**
 * Equivalence instance for `Duration`, allowing equality comparisons.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isEqual = Duration.Equivalence(Duration.seconds(5), Duration.millis(5000))
 * console.log(isEqual) // true
 * ```
 *
 * @category instances
 * @since 2.0.0
 */
export declare const Equivalence: Equ.Equivalence<Duration>;
/**
 * Returns the smaller of two Durations.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const shorter = Duration.min(Duration.seconds(5), Duration.seconds(3))
 * console.log(Duration.toSeconds(shorter)) // 3
 * ```
 *
 * @since 2.0.0
 * @category order
 */
export declare const min: {
    /**
     * Returns the smaller of two Durations.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const shorter = Duration.min(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(shorter)) // 3
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (that: Duration): (self: Duration) => Duration;
    /**
     * Returns the smaller of two Durations.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const shorter = Duration.min(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(shorter)) // 3
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (self: Duration, that: Duration): Duration;
};
/**
 * Returns the larger of two Durations.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const longer = Duration.max(Duration.seconds(5), Duration.seconds(3))
 * console.log(Duration.toSeconds(longer)) // 5
 * ```
 *
 * @since 2.0.0
 * @category order
 */
export declare const max: {
    /**
     * Returns the larger of two Durations.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const longer = Duration.max(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(longer)) // 5
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (that: Duration): (self: Duration) => Duration;
    /**
     * Returns the larger of two Durations.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const longer = Duration.max(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(longer)) // 5
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (self: Duration, that: Duration): Duration;
};
/**
 * Clamps a Duration between a minimum and maximum value.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const clamped = Duration.clamp(Duration.seconds(10), {
 *   minimum: Duration.seconds(2),
 *   maximum: Duration.seconds(5)
 * })
 * console.log(Duration.toSeconds(clamped)) // 5
 * ```
 *
 * @since 2.0.0
 * @category order
 */
export declare const clamp: {
    /**
     * Clamps a Duration between a minimum and maximum value.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const clamped = Duration.clamp(Duration.seconds(10), {
     *   minimum: Duration.seconds(2),
     *   maximum: Duration.seconds(5)
     * })
     * console.log(Duration.toSeconds(clamped)) // 5
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (options: {
        minimum: Duration;
        maximum: Duration;
    }): (self: Duration) => Duration;
    /**
     * Clamps a Duration between a minimum and maximum value.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const clamped = Duration.clamp(Duration.seconds(10), {
     *   minimum: Duration.seconds(2),
     *   maximum: Duration.seconds(5)
     * })
     * console.log(Duration.toSeconds(clamped)) // 5
     * ```
     *
     * @since 2.0.0
     * @category order
     */
    (self: Duration, options: {
        minimum: Duration;
        maximum: Duration;
    }): Duration;
};
/**
 * Divides a Duration by a number, returning `Option.none()` if division is invalid.
 *
 * **Example**
 *
 * ```ts
 * import { Duration, Option } from "effect"
 *
 * const d = Duration.divide(Duration.seconds(10), 2)
 * console.log(Option.map(d, Duration.toSeconds)) // Some(5)
 *
 * Duration.divide(Duration.seconds(10), 0) // None
 * ```
 *
 * @since 4.0.0
 * @category math
 */
export declare const divide: {
    /**
     * Divides a Duration by a number, returning `Option.none()` if division is invalid.
     *
     * **Example**
     *
     * ```ts
     * import { Duration, Option } from "effect"
     *
     * const d = Duration.divide(Duration.seconds(10), 2)
     * console.log(Option.map(d, Duration.toSeconds)) // Some(5)
     *
     * Duration.divide(Duration.seconds(10), 0) // None
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (by: number): (self: Duration) => Option.Option<Duration>;
    /**
     * Divides a Duration by a number, returning `Option.none()` if division is invalid.
     *
     * **Example**
     *
     * ```ts
     * import { Duration, Option } from "effect"
     *
     * const d = Duration.divide(Duration.seconds(10), 2)
     * console.log(Option.map(d, Duration.toSeconds)) // Some(5)
     *
     * Duration.divide(Duration.seconds(10), 0) // None
     * ```
     *
     * @since 4.0.0
     * @category math
     */
    (self: Duration, by: number): Option.Option<Duration>;
};
/**
 * Divides a Duration by a number, potentially returning infinity or zero.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const half = Duration.divideUnsafe(Duration.seconds(10), 2)
 * console.log(Duration.toSeconds(half)) // 5
 *
 * const infinite = Duration.divideUnsafe(Duration.seconds(10), 0)
 * console.log(Duration.toMillis(infinite)) // Infinity
 * ```
 *
 * @since 2.4.19
 * @category math
 */
export declare const divideUnsafe: {
    /**
     * Divides a Duration by a number, potentially returning infinity or zero.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const half = Duration.divideUnsafe(Duration.seconds(10), 2)
     * console.log(Duration.toSeconds(half)) // 5
     *
     * const infinite = Duration.divideUnsafe(Duration.seconds(10), 0)
     * console.log(Duration.toMillis(infinite)) // Infinity
     * ```
     *
     * @since 2.4.19
     * @category math
     */
    (by: number): (self: Duration) => Duration;
    /**
     * Divides a Duration by a number, potentially returning infinity or zero.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const half = Duration.divideUnsafe(Duration.seconds(10), 2)
     * console.log(Duration.toSeconds(half)) // 5
     *
     * const infinite = Duration.divideUnsafe(Duration.seconds(10), 0)
     * console.log(Duration.toMillis(infinite)) // Infinity
     * ```
     *
     * @since 2.4.19
     * @category math
     */
    (self: Duration, by: number): Duration;
};
/**
 * Multiplies a Duration by a number.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const doubled = Duration.times(Duration.seconds(5), 2)
 * console.log(Duration.toSeconds(doubled)) // 10
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const times: {
    /**
     * Multiplies a Duration by a number.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const doubled = Duration.times(Duration.seconds(5), 2)
     * console.log(Duration.toSeconds(doubled)) // 10
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (times: number): (self: Duration) => Duration;
    /**
     * Multiplies a Duration by a number.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const doubled = Duration.times(Duration.seconds(5), 2)
     * console.log(Duration.toSeconds(doubled)) // 10
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: Duration, times: number): Duration;
};
/**
 * Subtracts one Duration from another. The result can be negative.
 *
 * **Infinity Subtraction Rules**
 * - infinity - infinity = 0
 * - infinity - negativeInfinity = infinity
 * - infinity - finite = infinity
 * - negativeInfinity - negativeInfinity = 0
 * - negativeInfinity - infinity = negativeInfinity
 * - negativeInfinity - finite = negativeInfinity
 * - finite - infinity = negativeInfinity
 * - finite - negativeInfinity = infinity
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const result = Duration.subtract(Duration.seconds(10), Duration.seconds(3))
 * console.log(Duration.toSeconds(result)) // 7
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const subtract: {
    /**
     * Subtracts one Duration from another. The result can be negative.
     *
     * **Infinity Subtraction Rules**
     * - infinity - infinity = 0
     * - infinity - negativeInfinity = infinity
     * - infinity - finite = infinity
     * - negativeInfinity - negativeInfinity = 0
     * - negativeInfinity - infinity = negativeInfinity
     * - negativeInfinity - finite = negativeInfinity
     * - finite - infinity = negativeInfinity
     * - finite - negativeInfinity = infinity
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const result = Duration.subtract(Duration.seconds(10), Duration.seconds(3))
     * console.log(Duration.toSeconds(result)) // 7
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: Duration): (self: Duration) => Duration;
    /**
     * Subtracts one Duration from another. The result can be negative.
     *
     * **Infinity Subtraction Rules**
     * - infinity - infinity = 0
     * - infinity - negativeInfinity = infinity
     * - infinity - finite = infinity
     * - negativeInfinity - negativeInfinity = 0
     * - negativeInfinity - infinity = negativeInfinity
     * - negativeInfinity - finite = negativeInfinity
     * - finite - infinity = negativeInfinity
     * - finite - negativeInfinity = infinity
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const result = Duration.subtract(Duration.seconds(10), Duration.seconds(3))
     * console.log(Duration.toSeconds(result)) // 7
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: Duration, that: Duration): Duration;
};
/**
 * Adds two Durations together.
 *
 * **Infinity Addition Rules**
 * - infinity + infinity = infinity
 * - infinity + negativeInfinity = zero
 * - infinity + finite = infinity
 * - negativeInfinity + negativeInfinity = negativeInfinity
 * - negativeInfinity + finite = negativeInfinity
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const total = Duration.sum(Duration.seconds(5), Duration.seconds(3))
 * console.log(Duration.toSeconds(total)) // 8
 * ```
 *
 * @since 2.0.0
 * @category math
 */
export declare const sum: {
    /**
     * Adds two Durations together.
     *
     * **Infinity Addition Rules**
     * - infinity + infinity = infinity
     * - infinity + negativeInfinity = zero
     * - infinity + finite = infinity
     * - negativeInfinity + negativeInfinity = negativeInfinity
     * - negativeInfinity + finite = negativeInfinity
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const total = Duration.sum(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(total)) // 8
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (that: Duration): (self: Duration) => Duration;
    /**
     * Adds two Durations together.
     *
     * **Infinity Addition Rules**
     * - infinity + infinity = infinity
     * - infinity + negativeInfinity = zero
     * - infinity + finite = infinity
     * - negativeInfinity + negativeInfinity = negativeInfinity
     * - negativeInfinity + finite = negativeInfinity
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const total = Duration.sum(Duration.seconds(5), Duration.seconds(3))
     * console.log(Duration.toSeconds(total)) // 8
     * ```
     *
     * @since 2.0.0
     * @category math
     */
    (self: Duration, that: Duration): Duration;
};
/**
 * Checks if the first Duration is less than the second.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isLess = Duration.isLessThan(Duration.seconds(3), Duration.seconds(5))
 * console.log(isLess) // true
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isLessThan: {
    /**
     * Checks if the first Duration is less than the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isLess = Duration.isLessThan(Duration.seconds(3), Duration.seconds(5))
     * console.log(isLess) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Duration): (self: Duration) => boolean;
    /**
     * Checks if the first Duration is less than the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isLess = Duration.isLessThan(Duration.seconds(3), Duration.seconds(5))
     * console.log(isLess) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Duration, that: Duration): boolean;
};
/**
 * Checks if the first Duration is less than or equal to the second.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isLessOrEqual = Duration.isLessThanOrEqualTo(
 *   Duration.seconds(5),
 *   Duration.seconds(5)
 * )
 * console.log(isLessOrEqual) // true
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isLessThanOrEqualTo: {
    /**
     * Checks if the first Duration is less than or equal to the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isLessOrEqual = Duration.isLessThanOrEqualTo(
     *   Duration.seconds(5),
     *   Duration.seconds(5)
     * )
     * console.log(isLessOrEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Duration): (self: Duration) => boolean;
    /**
     * Checks if the first Duration is less than or equal to the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isLessOrEqual = Duration.isLessThanOrEqualTo(
     *   Duration.seconds(5),
     *   Duration.seconds(5)
     * )
     * console.log(isLessOrEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Duration, that: Duration): boolean;
};
/**
 * Checks if the first Duration is greater than the second.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isGreater = Duration.isGreaterThan(Duration.seconds(5), Duration.seconds(3))
 * console.log(isGreater) // true
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isGreaterThan: {
    /**
     * Checks if the first Duration is greater than the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isGreater = Duration.isGreaterThan(Duration.seconds(5), Duration.seconds(3))
     * console.log(isGreater) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Duration): (self: Duration) => boolean;
    /**
     * Checks if the first Duration is greater than the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isGreater = Duration.isGreaterThan(Duration.seconds(5), Duration.seconds(3))
     * console.log(isGreater) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Duration, that: Duration): boolean;
};
/**
 * Checks if the first Duration is greater than or equal to the second.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isGreaterOrEqual = Duration.isGreaterThanOrEqualTo(
 *   Duration.seconds(5),
 *   Duration.seconds(5)
 * )
 * console.log(isGreaterOrEqual) // true
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const isGreaterThanOrEqualTo: {
    /**
     * Checks if the first Duration is greater than or equal to the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isGreaterOrEqual = Duration.isGreaterThanOrEqualTo(
     *   Duration.seconds(5),
     *   Duration.seconds(5)
     * )
     * console.log(isGreaterOrEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Duration): (self: Duration) => boolean;
    /**
     * Checks if the first Duration is greater than or equal to the second.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isGreaterOrEqual = Duration.isGreaterThanOrEqualTo(
     *   Duration.seconds(5),
     *   Duration.seconds(5)
     * )
     * console.log(isGreaterOrEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Duration, that: Duration): boolean;
};
/**
 * Checks if two Durations are equal.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * const isEqual = Duration.equals(Duration.seconds(5), Duration.millis(5000))
 * console.log(isEqual) // true
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const equals: {
    /**
     * Checks if two Durations are equal.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isEqual = Duration.equals(Duration.seconds(5), Duration.millis(5000))
     * console.log(isEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Duration): (self: Duration) => boolean;
    /**
     * Checks if two Durations are equal.
     *
     * @example
     * ```ts
     * import { Duration } from "effect"
     *
     * const isEqual = Duration.equals(Duration.seconds(5), Duration.millis(5000))
     * console.log(isEqual) // true
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Duration, that: Duration): boolean;
};
/**
 * Converts a `Duration` to its parts.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * // Create a complex duration by adding multiple parts
 * const duration = Duration.sum(
 *   Duration.sum(
 *     Duration.sum(Duration.days(1), Duration.hours(2)),
 *     Duration.sum(Duration.minutes(30), Duration.seconds(45))
 *   ),
 *   Duration.millis(123)
 * )
 * const components = Duration.parts(duration)
 * console.log(components)
 * // {
 * //   days: 1,
 * //   hours: 2,
 * //   minutes: 30,
 * //   seconds: 45,
 * //   millis: 123,
 * //   nanos: 0
 * // }
 *
 * const complex = Duration.sum(Duration.hours(25), Duration.minutes(90))
 * const complexParts = Duration.parts(complex)
 * console.log(complexParts)
 * // {
 * //   days: 1,
 * //   hours: 2,
 * //   minutes: 30,
 * //   seconds: 0,
 * //   millis: 0,
 * //   nanos: 0
 * // }
 * ```
 *
 * @since 3.8.0
 * @category conversions
 */
export declare const parts: (self: Duration) => {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    millis: number;
    nanos: number;
};
/**
 * Converts a `Duration` to a human readable string.
 *
 * @since 2.0.0
 * @category conversions
 * @example
 * ```ts
 * import { Duration } from "effect"
 *
 * Duration.format(Duration.millis(1000)) // "1s"
 * Duration.format(Duration.millis(1001)) // "1s 1ms"
 * ```
 */
export declare const format: (self: Duration) => string;
/**
 * A `Reducer` for summing `Duration`s.
 *
 * @since 4.0.0
 */
export declare const ReducerSum: Reducer.Reducer<Duration>;
/**
 * A `Combiner` that returns the maximum `Duration`.
 *
 * @since 4.0.0
 */
export declare const CombinerMax: Combiner.Combiner<Duration>;
/**
 * A `Combiner` that returns the minimum `Duration`.
 *
 * @since 4.0.0
 */
export declare const CombinerMin: Combiner.Combiner<Duration>;
export {};
//# sourceMappingURL=Duration.d.ts.map