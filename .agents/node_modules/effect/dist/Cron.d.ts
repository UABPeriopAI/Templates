import type * as DateTime from "./DateTime.ts";
import * as Equal from "./Equal.ts";
import * as Equ from "./Equivalence.ts";
import { type Inspectable } from "./Inspectable.ts";
import * as Option from "./Option.ts";
import { type Pipeable } from "./Pipeable.ts";
import * as Result from "./Result.ts";
declare const TypeId = "~effect/time/Cron";
/**
 * Represents a cron schedule with time constraints and timezone information.
 *
 * A Cron instance defines when a scheduled task should run, supporting
 * seconds, minutes, hours, days, months, and weekdays constraints.
 * It also supports timezone-aware scheduling.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * // Create a cron that runs at 9 AM on weekdays
 * const weekdayMorning = Cron.make({
 *   minutes: [0],
 *   hours: [9],
 *   days: [
 *     1,
 *     2,
 *     3,
 *     4,
 *     5,
 *     6,
 *     7,
 *     8,
 *     9,
 *     10,
 *     11,
 *     12,
 *     13,
 *     14,
 *     15,
 *     16,
 *     17,
 *     18,
 *     19,
 *     20,
 *     21,
 *     22,
 *     23,
 *     24,
 *     25,
 *     26,
 *     27,
 *     28,
 *     29,
 *     30,
 *     31
 *   ],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5] // Monday to Friday
 * })
 *
 * // Check if a date matches the schedule
 * const matches = Cron.match(weekdayMorning, new Date("2023-06-05T09:00:00"))
 * console.log(matches) // true if it's 9 AM on a weekday
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface Cron extends Pipeable, Equal.Equal, Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly tz: Option.Option<DateTime.TimeZone>;
    readonly seconds: ReadonlySet<number>;
    readonly minutes: ReadonlySet<number>;
    readonly hours: ReadonlySet<number>;
    readonly days: ReadonlySet<number>;
    readonly months: ReadonlySet<number>;
    readonly weekdays: ReadonlySet<number>;
}
/**
 * Checks if a given value is a Cron instance.
 *
 * This function is a type guard that determines whether the provided
 * value is a valid Cron instance by checking for the presence of the
 * Cron type identifier.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * const cron = Cron.make({
 *   minutes: [0],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * console.log(Cron.isCron(cron)) // true
 * console.log(Cron.isCron({})) // false
 * console.log(Cron.isCron("not a cron")) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isCron: (u: unknown) => u is Cron;
/**
 * Creates a Cron instance from time constraints.
 *
 * Constructs a cron schedule by specifying which seconds, minutes, hours,
 * days, months, and weekdays the schedule should match. Empty arrays mean
 * "match all" for that time unit.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * // Every day at midnight
 * const midnight = Cron.make({
 *   minutes: [0],
 *   hours: [0],
 *   days: [
 *     1,
 *     2,
 *     3,
 *     4,
 *     5,
 *     6,
 *     7,
 *     8,
 *     9,
 *     10,
 *     11,
 *     12,
 *     13,
 *     14,
 *     15,
 *     16,
 *     17,
 *     18,
 *     19,
 *     20,
 *     21,
 *     22,
 *     23,
 *     24,
 *     25,
 *     26,
 *     27,
 *     28,
 *     29,
 *     30,
 *     31
 *   ],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [0, 1, 2, 3, 4, 5, 6]
 * })
 *
 * // Every 15 minutes during business hours on weekdays
 * const businessHours = Cron.make({
 *   minutes: [0, 15, 30, 45],
 *   hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
 *   days: [
 *     1,
 *     2,
 *     3,
 *     4,
 *     5,
 *     6,
 *     7,
 *     8,
 *     9,
 *     10,
 *     11,
 *     12,
 *     13,
 *     14,
 *     15,
 *     16,
 *     17,
 *     18,
 *     19,
 *     20,
 *     21,
 *     22,
 *     23,
 *     24,
 *     25,
 *     26,
 *     27,
 *     28,
 *     29,
 *     30,
 *     31
 *   ],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5] // Monday to Friday
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: (values: {
    readonly seconds?: Iterable<number> | undefined;
    readonly minutes: Iterable<number>;
    readonly hours: Iterable<number>;
    readonly days: Iterable<number>;
    readonly months: Iterable<number>;
    readonly weekdays: Iterable<number>;
    readonly tz?: DateTime.TimeZone | undefined;
}) => Cron;
declare const CronParseErrorTypeId = "~effect/time/Cron/CronParseError";
declare const CronParseError_base: new <A extends Record<string, any> = {}>(args: import("./Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("./Cause.ts").YieldableError & {
    readonly _tag: "CronParseError";
} & Readonly<A>;
/**
 * Represents an error that occurs when parsing a cron expression fails.
 *
 * This error provides detailed information about what went wrong during
 * the parsing process, including the error message and optionally the
 * input that caused the error.
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const result = Cron.parse("invalid expression")
 * if (Result.isFailure(result)) {
 *   const error: Cron.CronParseError = result.failure
 *   console.log(error.message) // "Invalid number of segments in cron expression"
 *   console.log(error.input) // "invalid expression"
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class CronParseError extends CronParseError_base<{
    readonly message: string;
    readonly input?: string;
}> {
    readonly [CronParseErrorTypeId]: typeof CronParseErrorTypeId;
}
/**
 * Checks if a given value is a CronParseError instance.
 *
 * This function is a type guard that determines whether the provided
 * value is a CronParseError by checking for the presence of the
 * CronParseError type identifier.
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const result = Cron.parse("invalid cron expression")
 * if (Result.isFailure(result)) {
 *   const error = result.failure
 *   console.log(Cron.isCronParseError(error)) // true
 * }
 *
 * console.log(Cron.isCronParseError(new Error("regular error"))) // false
 * console.log(Cron.isCronParseError("not an error")) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isCronParseError: (u: unknown) => u is CronParseError;
/**
 * Parses a cron expression into a `Cron` instance.
 *
 * @param cron - The cron expression to parse.
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * // At 04:00 on every day-of-month from 8 through 14.
 * assert.deepStrictEqual(
 *   Cron.parse("0 0 4 8-14 * *"),
 *   Result.succeed(Cron.make({
 *     seconds: [0],
 *     minutes: [0],
 *     hours: [4],
 *     days: [8, 9, 10, 11, 12, 13, 14],
 *     months: [],
 *     weekdays: []
 *   }))
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const parse: (cron: string, tz?: DateTime.TimeZone | string) => Result.Result<Cron, CronParseError>;
/**
 * Parses a cron expression into a Cron instance, throwing on failure.
 *
 * This function provides a convenience method for parsing cron expressions
 * when you're confident the input is valid and want to avoid handling
 * the Result type.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * // At 04:00 on every day-of-month from 8 through 14
 * const cron = Cron.parseUnsafe("0 0 4 8-14 * *")
 *
 * // With timezone
 * const cronWithTz = Cron.parseUnsafe("0 0 9 * * *", "America/New_York")
 *
 * // This would throw an error
 * // const invalid = Cron.parseUnsafe("invalid expression")
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const parseUnsafe: (cron: string, tz?: DateTime.TimeZone | string) => Cron;
/**
 * Checks if a given date/time falls within an active Cron time window.
 *
 * This function determines whether a specific date and time matches
 * the cron schedule, taking into account all time constraints and
 * the optional timezone.
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))
 *
 * // Check if specific dates match
 * const matches1 = Cron.match(cron, new Date("2021-01-08T04:00:00Z"))
 * console.log(matches1) // true - 4 AM on the 8th
 *
 * const matches2 = Cron.match(cron, new Date("2021-01-08T05:00:00Z"))
 * console.log(matches2) // false - wrong hour
 *
 * const matches3 = Cron.match(cron, new Date("2021-01-07T04:00:00Z"))
 * console.log(matches3) // false - wrong day
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const match: (cron: Cron, date: DateTime.DateTime.Input) => boolean;
/**
 * Returns the next scheduled date/time for the given Cron instance.
 *
 * This function calculates the next date and time when the cron schedule
 * should trigger, starting from the specified date (or current time if
 * not provided).
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))
 *
 * // Get next run after a specific date
 * const after = new Date("2021-01-01T00:00:00Z")
 * const nextRun = Cron.next(cron, after)
 * console.log(nextRun) // 2021-01-08T04:00:00.000Z
 *
 * // Get next run from current time
 * const nextFromNow = Cron.next(cron)
 * console.log(nextFromNow) // Next occurrence from now
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const next: (cron: Cron, now?: DateTime.DateTime.Input) => Date;
/**
 * Returns the previous scheduled date/time for the given Cron instance.
 *
 * @since 4.0.0
 * @category utils
 */
export declare const prev: (cron: Cron, now?: DateTime.DateTime.Input) => Date;
/**
 * Returns an infinite iterator that yields dates matching the Cron schedule.
 *
 * This function creates an iterator that generates an infinite sequence
 * of dates when the cron schedule should trigger, starting from the
 * specified date.
 *
 * @example
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 9 * * 1-5")) // 9 AM weekdays
 *
 * // Get first 5 occurrences
 * const iterator = Cron.sequence(cron, new Date("2023-01-01"))
 * const next5 = Array.from({ length: 5 }, () => iterator.next().value)
 *
 * console.log(next5)
 * // [Mon Jan 02 2023 09:00:00, Tue Jan 03 2023 09:00:00, ...]
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export declare const sequence: (cron: Cron, now?: DateTime.DateTime.Input) => IterableIterator<Date>;
/**
 * An Equivalence instance for comparing Cron schedules.
 *
 * This equivalence compares two Cron instances by checking if their
 * time constraints (seconds, minutes, hours, days, months, weekdays)
 * are equivalent, regardless of the internal order.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * const cron1 = Cron.make({
 *   minutes: [0, 30],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * const cron2 = Cron.make({
 *   minutes: [30, 0], // Different order
 *   hours: [9],
 *   days: [15, 1], // Different order
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * console.log(Cron.Equivalence(cron1, cron2)) // true
 * ```
 *
 * @since 2.0.0
 * @category instances
 */
export declare const Equivalence: Equ.Equivalence<Cron>;
/**
 * Checks if two Cron instances are equal.
 *
 * This function compares two Cron instances to determine if they represent
 * the same schedule by checking all their time constraints for equality.
 *
 * @example
 * ```ts
 * import { Cron } from "effect"
 *
 * const cron1 = Cron.make({
 *   minutes: [0],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * const cron2 = Cron.make({
 *   minutes: [0],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * console.log(Cron.equals(cron1, cron2)) // true
 * console.log(Cron.equals(cron1)(cron2)) // true (curried form)
 * ```
 *
 * @since 2.0.0
 * @category predicates
 */
export declare const equals: {
    /**
     * Checks if two Cron instances are equal.
     *
     * This function compares two Cron instances to determine if they represent
     * the same schedule by checking all their time constraints for equality.
     *
     * @example
     * ```ts
     * import { Cron } from "effect"
     *
     * const cron1 = Cron.make({
     *   minutes: [0],
     *   hours: [9],
     *   days: [1, 15],
     *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
     *   weekdays: [1, 2, 3, 4, 5]
     * })
     *
     * const cron2 = Cron.make({
     *   minutes: [0],
     *   hours: [9],
     *   days: [1, 15],
     *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
     *   weekdays: [1, 2, 3, 4, 5]
     * })
     *
     * console.log(Cron.equals(cron1, cron2)) // true
     * console.log(Cron.equals(cron1)(cron2)) // true (curried form)
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (that: Cron): (self: Cron) => boolean;
    /**
     * Checks if two Cron instances are equal.
     *
     * This function compares two Cron instances to determine if they represent
     * the same schedule by checking all their time constraints for equality.
     *
     * @example
     * ```ts
     * import { Cron } from "effect"
     *
     * const cron1 = Cron.make({
     *   minutes: [0],
     *   hours: [9],
     *   days: [1, 15],
     *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
     *   weekdays: [1, 2, 3, 4, 5]
     * })
     *
     * const cron2 = Cron.make({
     *   minutes: [0],
     *   hours: [9],
     *   days: [1, 15],
     *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
     *   weekdays: [1, 2, 3, 4, 5]
     * })
     *
     * console.log(Cron.equals(cron1, cron2)) // true
     * console.log(Cron.equals(cron1)(cron2)) // true (curried form)
     * ```
     *
     * @since 2.0.0
     * @category predicates
     */
    (self: Cron, that: Cron): boolean;
};
export {};
//# sourceMappingURL=Cron.d.ts.map