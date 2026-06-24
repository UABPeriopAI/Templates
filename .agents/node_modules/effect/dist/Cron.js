/**
 * @since 2.0.0
 */
import * as Arr from "./Array.js";
import * as Data from "./Data.js";
import * as Equal from "./Equal.js";
import * as Equ from "./Equivalence.js";
import { format } from "./Formatter.js";
import { constVoid, dual, pipe } from "./Function.js";
import * as Hash from "./Hash.js";
import { NodeInspectSymbol } from "./Inspectable.js";
import * as dateTime from "./internal/dateTime.js";
import * as N from "./Number.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as Result from "./Result.js";
import * as String from "./String.js";
const TypeId = "~effect/time/Cron";
function toPojo(cron) {
  return {
    tz: cron.tz,
    seconds: Arr.fromIterable(cron.seconds),
    minutes: Arr.fromIterable(cron.minutes),
    hours: Arr.fromIterable(cron.hours),
    days: Arr.fromIterable(cron.days),
    months: Arr.fromIterable(cron.months),
    weekdays: Arr.fromIterable(cron.weekdays)
  };
}
const CronProto = {
  [TypeId]: TypeId,
  [Equal.symbol](that) {
    return isCron(that) && equals(this, that);
  },
  [Hash.symbol]() {
    return pipe(Hash.hash(this.tz), Hash.combine(Hash.array(Arr.fromIterable(this.seconds))), Hash.combine(Hash.array(Arr.fromIterable(this.minutes))), Hash.combine(Hash.array(Arr.fromIterable(this.hours))), Hash.combine(Hash.array(Arr.fromIterable(this.days))), Hash.combine(Hash.array(Arr.fromIterable(this.months))), Hash.combine(Hash.array(Arr.fromIterable(this.weekdays))));
  },
  toObject() {
    return {
      tz: this.tz,
      seconds: Arr.fromIterable(this.seconds),
      minutes: Arr.fromIterable(this.minutes),
      hours: Arr.fromIterable(this.hours),
      days: Arr.fromIterable(this.days),
      months: Arr.fromIterable(this.months),
      weekdays: Arr.fromIterable(this.weekdays)
    };
  },
  toString() {
    return `Cron(${format(toPojo(this))})`;
  },
  toJSON() {
    const out = toPojo(this);
    out["_id"] = "Cron";
    return out;
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
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
export const isCron = u => hasProperty(u, TypeId);
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
export const make = values => {
  const o = Object.create(CronProto);
  o.seconds = new Set(Arr.sort(values.seconds ?? [0], N.Order));
  o.minutes = new Set(Arr.sort(values.minutes, N.Order));
  o.hours = new Set(Arr.sort(values.hours, N.Order));
  o.days = new Set(Arr.sort(values.days, N.Order));
  o.months = new Set(Arr.sort(values.months, N.Order));
  o.weekdays = new Set(Arr.sort(values.weekdays, N.Order));
  o.tz = Option.fromUndefinedOr(values.tz);
  const seconds = Array.from(o.seconds);
  const minutes = Array.from(o.minutes);
  const hours = Array.from(o.hours);
  const days = Array.from(o.days);
  const months = Array.from(o.months);
  const weekdays = Array.from(o.weekdays);
  o.first = {
    second: seconds[0] ?? 0,
    minute: minutes[0] ?? 0,
    hour: hours[0] ?? 0,
    day: days[0] ?? 1,
    month: (months[0] ?? 1) - 1,
    weekday: weekdays[0] ?? 0
  };
  o.last = {
    second: seconds[seconds.length - 1] ?? 59,
    minute: minutes[minutes.length - 1] ?? 59,
    hour: hours[hours.length - 1] ?? 23,
    day: days[days.length - 1] ?? 31,
    month: (months[months.length - 1] ?? 12) - 1,
    weekday: weekdays[weekdays.length - 1] ?? 6
  };
  o.next = {
    second: lookupTable(seconds, 60, "next"),
    minute: lookupTable(minutes, 60, "next"),
    hour: lookupTable(hours, 24, "next"),
    day: lookupTable(days, 32, "next"),
    month: lookupTable(months, 13, "next"),
    weekday: lookupTable(weekdays, 7, "next")
  };
  o.prev = {
    second: lookupTable(seconds, 60, "prev"),
    minute: lookupTable(minutes, 60, "prev"),
    hour: lookupTable(hours, 24, "prev"),
    day: lookupTable(days, 32, "prev"),
    month: lookupTable(months, 13, "prev"),
    weekday: lookupTable(weekdays, 7, "prev")
  };
  return o;
};
const lookupTable = (values, size, dir) => {
  const result = new Array(size).fill(undefined);
  if (values.length === 0) {
    return result;
  }
  let current = undefined;
  if (dir === "next") {
    let index = values.length - 1;
    for (let i = size - 1; i >= 0; i--) {
      while (index >= 0 && values[index] >= i) {
        current = values[index--];
      }
      result[i] = current;
    }
  } else {
    let index = 0;
    for (let i = 0; i < size; i++) {
      while (index < values.length && values[index] <= i) {
        current = values[index++];
      }
      result[i] = current;
    }
  }
  return result;
};
const CronParseErrorTypeId = "~effect/time/Cron/CronParseError";
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
export class CronParseError extends /*#__PURE__*/Data.TaggedError("CronParseError") {
  [CronParseErrorTypeId] = CronParseErrorTypeId;
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
export const isCronParseError = u => hasProperty(u, CronParseErrorTypeId);
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
export const parse = (cron, tz) => {
  const segments = cron.split(" ").filter(String.isNonEmpty);
  if (segments.length !== 5 && segments.length !== 6) {
    return Result.fail(new CronParseError({
      message: `Invalid number of segments in cron expression`,
      input: cron
    }));
  }
  if (segments.length === 5) {
    segments.unshift("0");
  }
  const [seconds, minutes, hours, days, months, weekdays] = segments;
  const zone = tz === undefined || dateTime.isTimeZone(tz) ? Result.succeed(tz) : Result.fromOption(dateTime.zoneFromString(tz), () => new CronParseError({
    message: `Invalid time zone in cron expression`,
    input: tz
  }));
  return Result.all({
    tz: zone,
    seconds: parseSegment(seconds, secondOptions),
    minutes: parseSegment(minutes, minuteOptions),
    hours: parseSegment(hours, hourOptions),
    days: parseSegment(days, dayOptions),
    months: parseSegment(months, monthOptions),
    weekdays: parseSegment(weekdays, weekdayOptions)
  }).pipe(Result.map(make));
};
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
export const parseUnsafe = (cron, tz) => Result.getOrThrow(parse(cron, tz));
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
export const match = (cron, date) => {
  const parts = dateTime.makeZonedUnsafe(date, {
    timeZone: Option.getOrUndefined(cron.tz)
  }).pipe(dateTime.toParts);
  if (cron.seconds.size !== 0 && !cron.seconds.has(parts.second)) {
    return false;
  }
  if (cron.minutes.size !== 0 && !cron.minutes.has(parts.minute)) {
    return false;
  }
  if (cron.hours.size !== 0 && !cron.hours.has(parts.hour)) {
    return false;
  }
  if (cron.months.size !== 0 && !cron.months.has(parts.month)) {
    return false;
  }
  if (cron.days.size === 0 && cron.weekdays.size === 0) {
    return true;
  }
  if (cron.weekdays.size === 0) {
    return cron.days.has(parts.day);
  }
  if (cron.days.size === 0) {
    return cron.weekdays.has(parts.weekDay);
  }
  return cron.days.has(parts.day) || cron.weekdays.has(parts.weekDay);
};
const daysInMonth = date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
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
export const next = (cron, now) => {
  return stepCron(cron, now, "next");
};
/**
 * Returns the previous scheduled date/time for the given Cron instance.
 *
 * @since 4.0.0
 * @category utils
 */
export const prev = (cron, now) => {
  return stepCron(cron, now, "prev");
};
const stepCron = (cron, now, direction) => {
  const tz = Option.getOrUndefined(cron.tz);
  const zoned = dateTime.makeZonedUnsafe(now ?? new Date(), {
    timeZone: tz
  });
  const reverse = direction === "prev";
  const tick = reverse ? -1 : 1;
  const table = cron[direction];
  const boundary = reverse ? cron.last : cron.first;
  const needsStep = reverse ? (next, current) => next < current : (next, current) => next > current;
  const utc = tz !== undefined && dateTime.isTimeZoneNamed(tz) && tz.id === "UTC";
  const adjustDst = utc ? constVoid : current => {
    const adjusted = dateTime.makeZonedUnsafe(current, {
      timeZone: zoned.zone,
      adjustForTimeZone: true,
      disambiguation: reverse ? "later" : undefined
    }).pipe(dateTime.toDate);
    const drift = current.getTime() - adjusted.getTime();
    if (reverse ? drift !== 0 : drift > 0) {
      current.setTime(reverse ? adjusted.getTime() : current.getTime() + drift);
    }
  };
  const result = dateTime.mutate(zoned, current => {
    current.setUTCSeconds(current.getUTCSeconds() + tick, 0);
    for (let i = 0; i < 10_000; i++) {
      if (cron.seconds.size !== 0) {
        const currentSecond = current.getUTCSeconds();
        const nextSecond = table.second[currentSecond];
        if (nextSecond === undefined) {
          current.setUTCMinutes(current.getUTCMinutes() + tick, boundary.second);
          adjustDst(current);
          continue;
        }
        if (needsStep(nextSecond, currentSecond)) {
          current.setUTCSeconds(nextSecond);
          adjustDst(current);
          continue;
        }
      }
      if (cron.minutes.size !== 0) {
        const currentMinute = current.getUTCMinutes();
        const nextMinute = table.minute[currentMinute];
        if (nextMinute === undefined) {
          current.setUTCHours(current.getUTCHours() + tick, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
        if (needsStep(nextMinute, currentMinute)) {
          current.setUTCMinutes(nextMinute, boundary.second);
          adjustDst(current);
          continue;
        }
      }
      if (cron.hours.size !== 0) {
        const currentHour = current.getUTCHours();
        const nextHour = table.hour[currentHour];
        if (nextHour === undefined) {
          current.setUTCDate(current.getUTCDate() + tick);
          current.setUTCHours(boundary.hour, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
        if (needsStep(nextHour, currentHour)) {
          current.setUTCHours(nextHour, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
      }
      if (cron.weekdays.size !== 0 || cron.days.size !== 0) {
        let a = reverse ? -Infinity : Infinity;
        let b = reverse ? -Infinity : Infinity;
        if (cron.weekdays.size !== 0) {
          const currentWeekday = current.getUTCDay();
          const nextWeekday = table.weekday[currentWeekday];
          if (nextWeekday === undefined) {
            a = reverse ? currentWeekday - 7 + boundary.weekday : 7 - currentWeekday + boundary.weekday;
          } else {
            a = nextWeekday - currentWeekday;
          }
        }
        if (cron.days.size !== 0 && a !== 0) {
          const currentDay = current.getUTCDate();
          const nextDay = table.day[currentDay];
          if (nextDay === undefined) {
            if (reverse) {
              const prevMonthDays = daysInMonth(new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 0)));
              b = -(currentDay + (prevMonthDays - boundary.day));
            } else {
              b = daysInMonth(current) - currentDay + boundary.day;
            }
          } else {
            b = nextDay - currentDay;
          }
        }
        const addDays = reverse ? Math.max(a, b) : Math.min(a, b);
        if (addDays !== 0) {
          current.setUTCDate(current.getUTCDate() + addDays);
          current.setUTCHours(boundary.hour, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
      }
      if (cron.months.size !== 0) {
        const currentMonth = current.getUTCMonth() + 1;
        const nextMonth = table.month[currentMonth];
        const clampBoundaryDay = targetMonthIndex => {
          if (cron.days.size !== 0) {
            return boundary.day;
          }
          const maxDayInMonth = daysInMonth(new Date(Date.UTC(current.getUTCFullYear(), targetMonthIndex + 1, 0)));
          return Math.min(boundary.day, maxDayInMonth);
        };
        if (nextMonth === undefined) {
          current.setUTCFullYear(current.getUTCFullYear() + tick);
          current.setUTCMonth(boundary.month, clampBoundaryDay(boundary.month));
          current.setUTCHours(boundary.hour, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
        if (needsStep(nextMonth, currentMonth)) {
          const targetMonthIndex = nextMonth - 1;
          current.setUTCMonth(targetMonthIndex, clampBoundaryDay(targetMonthIndex));
          current.setUTCHours(boundary.hour, boundary.minute, boundary.second);
          adjustDst(current);
          continue;
        }
      }
      return;
    }
    throw new Error("Unable to find " + direction + " cron date");
  });
  return dateTime.toDateUtc(result);
};
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
export const sequence = function* (cron, now) {
  while (true) {
    yield now = next(cron, now);
  }
};
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
export const Equivalence = /*#__PURE__*/Equ.make((self, that) => restrictionsEquals(self.seconds, that.seconds) && restrictionsEquals(self.minutes, that.minutes) && restrictionsEquals(self.hours, that.hours) && restrictionsEquals(self.days, that.days) && restrictionsEquals(self.months, that.months) && restrictionsEquals(self.weekdays, that.weekdays));
const restrictionsArrayEquals = /*#__PURE__*/Equ.Array(/*#__PURE__*/Equ.strictEqual());
const restrictionsEquals = (self, that) => restrictionsArrayEquals(Arr.fromIterable(self), Arr.fromIterable(that));
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
export const equals = /*#__PURE__*/dual(2, (self, that) => Equivalence(self, that));
const secondOptions = {
  min: 0,
  max: 59
};
const minuteOptions = {
  min: 0,
  max: 59
};
const hourOptions = {
  min: 0,
  max: 23
};
const dayOptions = {
  min: 1,
  max: 31
};
const monthOptions = {
  min: 1,
  max: 12,
  aliases: {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12
  }
};
const weekdayOptions = {
  min: 0,
  max: 6,
  aliases: {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  }
};
const parseSegment = (input, options) => {
  const capacity = options.max - options.min + 1;
  const values = new Set();
  const fields = input.split(",");
  for (const field of fields) {
    const [raw, step] = splitStep(field);
    if (raw === "*" && step === undefined) {
      return Result.succeed(new Set());
    }
    if (step !== undefined) {
      if (!Number.isInteger(step)) {
        return Result.fail(new CronParseError({
          message: `Expected step value to be a positive integer`,
          input
        }));
      }
      if (step < 1) {
        return Result.fail(new CronParseError({
          message: `Expected step value to be greater than 0`,
          input
        }));
      }
      if (step > options.max) {
        return Result.fail(new CronParseError({
          message: `Expected step value to be less than ${options.max}`,
          input
        }));
      }
    }
    if (raw === "*") {
      for (let i = options.min; i <= options.max; i += step ?? 1) {
        values.add(i);
      }
    } else {
      const [left, right] = splitRange(raw, options.aliases);
      if (!Number.isInteger(left)) {
        return Result.fail(new CronParseError({
          message: `Expected a positive integer`,
          input
        }));
      }
      if (left < options.min || left > options.max) {
        return Result.fail(new CronParseError({
          message: `Expected a value between ${options.min} and ${options.max}`,
          input
        }));
      }
      if (right === undefined) {
        values.add(left);
      } else {
        if (!Number.isInteger(right)) {
          return Result.fail(new CronParseError({
            message: `Expected a positive integer`,
            input
          }));
        }
        if (right < options.min || right > options.max) {
          return Result.fail(new CronParseError({
            message: `Expected a value between ${options.min} and ${options.max}`,
            input
          }));
        }
        if (left > right) {
          return Result.fail(new CronParseError({
            message: `Invalid value range`,
            input
          }));
        }
        for (let i = left; i <= right; i += step ?? 1) {
          values.add(i);
        }
      }
    }
    if (values.size >= capacity) {
      return Result.succeed(new Set());
    }
  }
  return Result.succeed(values);
};
const splitStep = input => {
  const separator = input.indexOf("/");
  if (separator !== -1) {
    return [input.slice(0, separator), Number(input.slice(separator + 1))];
  }
  return [input, undefined];
};
const splitRange = (input, aliases) => {
  const separator = input.indexOf("-");
  if (separator !== -1) {
    return [aliasOrValue(input.slice(0, separator), aliases), aliasOrValue(input.slice(separator + 1), aliases)];
  }
  return [aliasOrValue(input, aliases), undefined];
};
function aliasOrValue(field, aliases) {
  return aliases?.[field.toLocaleLowerCase()] ?? Number(field);
}
//# sourceMappingURL=Cron.js.map