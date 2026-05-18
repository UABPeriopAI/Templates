import { IllegalArgumentError } from "../Cause.js";
import * as Clock from "../Clock.js";
import * as Duration from "../Duration.js";
import * as Equal from "../Equal.js";
import * as Equ from "../Equivalence.js";
import { dual } from "../Function.js";
import * as Hash from "../Hash.js";
import * as Inspectable from "../Inspectable.js";
import * as Option from "../Option.js";
import * as order from "../Order.js";
import { pipeArguments } from "../Pipeable.js";
import * as Predicate from "../Predicate.js";
import * as effect from "./effect.js";
/** @internal */
export const TypeId = "~effect/time/DateTime";
/** @internal */
export const TimeZoneTypeId = "~effect/time/DateTime/TimeZone";
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  [Inspectable.NodeInspectSymbol]() {
    return this.toString();
  },
  toJSON() {
    return toDateUtc(this).toJSON();
  }
};
const ProtoUtc = {
  ...Proto,
  _tag: "Utc",
  [Hash.symbol]() {
    return Hash.number(this.epochMilliseconds);
  },
  [Equal.symbol](that) {
    return isDateTime(that) && that._tag === "Utc" && this.epochMilliseconds === that.epochMilliseconds;
  },
  toString() {
    return `DateTime.Utc(${toDateUtc(this).toJSON()})`;
  }
};
const ProtoZoned = {
  ...Proto,
  _tag: "Zoned",
  [Hash.symbol]() {
    return Hash.combine(Hash.number(this.epochMilliseconds))(Hash.hash(this.zone));
  },
  [Equal.symbol](that) {
    return isDateTime(that) && that._tag === "Zoned" && this.epochMilliseconds === that.epochMilliseconds && Equal.equals(this.zone, that.zone);
  },
  toString() {
    return `DateTime.Zoned(${formatIsoZoned(this)})`;
  }
};
const ProtoTimeZone = {
  [TimeZoneTypeId]: TimeZoneTypeId,
  [Inspectable.NodeInspectSymbol]() {
    return this.toString();
  }
};
const ProtoTimeZoneNamed = {
  ...ProtoTimeZone,
  _tag: "Named",
  [Hash.symbol]() {
    return Hash.string(`Named:${this.id}`);
  },
  [Equal.symbol](that) {
    return isTimeZone(that) && that._tag === "Named" && this.id === that.id;
  },
  toString() {
    return `TimeZone.Named(${this.id})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Named",
      id: this.id
    };
  }
};
const ProtoTimeZoneOffset = {
  ...ProtoTimeZone,
  _tag: "Offset",
  [Hash.symbol]() {
    return Hash.string(`Offset:${this.offset}`);
  },
  [Equal.symbol](that) {
    return isTimeZone(that) && that._tag === "Offset" && this.offset === that.offset;
  },
  toString() {
    return `TimeZone.Offset(${offsetToString(this.offset)})`;
  },
  toJSON() {
    return {
      _id: "TimeZone",
      _tag: "Offset",
      offset: this.offset
    };
  }
};
/** @internal */
export const makeZonedProto = (epochMillis, zone, partsUtc) => {
  const self = Object.create(ProtoZoned);
  self.epochMilliseconds = epochMillis;
  self.zone = zone;
  Object.defineProperty(self, "partsUtc", {
    value: partsUtc,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "adjustedEpochMillis", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(self, "partsAdjusted", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  return self;
};
// =============================================================================
// guards
// =============================================================================
/** @internal */
export const isDateTime = u => Predicate.hasProperty(u, TypeId);
const isDateTimeArgs = args => isDateTime(args[0]);
/** @internal */
export const isTimeZone = u => Predicate.hasProperty(u, TimeZoneTypeId);
/** @internal */
export const isTimeZoneOffset = u => isTimeZone(u) && u._tag === "Offset";
/** @internal */
export const isTimeZoneNamed = u => isTimeZone(u) && u._tag === "Named";
/** @internal */
export const isUtc = self => self._tag === "Utc";
/** @internal */
export const isZoned = self => self._tag === "Zoned";
// =============================================================================
// instances
// =============================================================================
/** @internal */
export const Equivalence = /*#__PURE__*/Equ.make((a, b) => a.epochMilliseconds === b.epochMilliseconds);
/** @internal */
export const Order = /*#__PURE__*/order.make((self, that) => self.epochMilliseconds < that.epochMilliseconds ? -1 : self.epochMilliseconds > that.epochMilliseconds ? 1 : 0);
/** @internal */
export const clamp = /*#__PURE__*/order.clamp(Order);
// =============================================================================
// constructors
// =============================================================================
const makeUtc = epochMillis => {
  const self = Object.create(ProtoUtc);
  self.epochMilliseconds = epochMillis;
  Object.defineProperty(self, "partsUtc", {
    value: undefined,
    enumerable: false,
    writable: true
  });
  return self;
};
/** @internal */
export const fromDateUnsafe = date => {
  const epochMillis = date.getTime();
  if (Number.isNaN(epochMillis)) {
    throw new IllegalArgumentError("Invalid date");
  }
  return makeUtc(epochMillis);
};
/** @internal */
export const makeUnsafe = input => {
  if (isDateTime(input)) {
    return input;
  } else if (input instanceof Date) {
    return fromDateUnsafe(input);
  } else if (typeof input === "object") {
    if ("epochMilliseconds" in input) {
      return makeUtc(input.epochMilliseconds);
    }
    const date = new Date(0);
    setPartsDate(date, input);
    return fromDateUnsafe(date);
  } else if (typeof input === "string" && !hasZone(input)) {
    return fromDateUnsafe(new Date(input + "Z"));
  }
  return fromDateUnsafe(new Date(input));
};
/**
 * Detects whether a date string already contains timezone info.
 * Without a zone, `new Date("2024-01-01T12:00:00")` is parsed as local time,
 * so `makeUnsafe` appends "Z" to force UTC interpretation.
 * This check prevents appending "Z" to strings that already have a zone
 * (e.g. "2024-01-01T12:00:00Z", "...+05:30", "...GMT"), which would produce invalid dates.
 */
const hasZone = input => /Z|GMT|[+-]\d{2}$|[+-]\d{2}:?\d{2}$|\]$/.test(input);
const minEpochMillis = -8640000000000000 + 12 * 60 * 60 * 1000;
const maxEpochMillis = 8640000000000000 - 14 * 60 * 60 * 1000;
/** @internal */
export const makeZonedUnsafe = (input, options) => {
  let timeZoneOption = options?.timeZone;
  if (timeZoneOption === undefined && isDateTime(input) && isZoned(input)) {
    return input;
  }
  const self = makeUnsafe(input);
  if (self.epochMilliseconds < minEpochMillis || self.epochMilliseconds > maxEpochMillis) {
    throw new RangeError(`Epoch millis out of range: ${self.epochMilliseconds}`);
  }
  if (timeZoneOption === undefined && typeof input === "object" && "timeZoneId" in input) {
    timeZoneOption = input.timeZoneId;
  }
  let zone;
  if (timeZoneOption === undefined) {
    const offset = new Date(self.epochMilliseconds).getTimezoneOffset() * -60 * 1000;
    zone = zoneMakeOffset(offset);
  } else if (isTimeZone(timeZoneOption)) {
    zone = timeZoneOption;
  } else if (typeof timeZoneOption === "number") {
    zone = zoneMakeOffset(timeZoneOption);
  } else {
    const parsedZone = zoneFromString(timeZoneOption);
    if (Option.isNone(parsedZone)) {
      throw new IllegalArgumentError(`Invalid time zone: ${timeZoneOption}`);
    }
    zone = parsedZone.value;
  }
  if (options?.adjustForTimeZone !== true) {
    return makeZonedProto(self.epochMilliseconds, zone, self.partsUtc);
  }
  return makeZonedFromAdjusted(self.epochMilliseconds, zone, options?.disambiguation ?? "compatible");
};
/** @internal */
export const makeZoned = /*#__PURE__*/Option.liftThrowable(makeZonedUnsafe);
/** @internal */
export const make = /*#__PURE__*/Option.liftThrowable(makeUnsafe);
const zonedStringRegExp = /^(.{17,35})\[(.+)\]$/;
/** @internal */
export const makeZonedFromString = input => {
  const match = zonedStringRegExp.exec(input);
  if (match === null) {
    const offset = parseOffset(input);
    return offset !== null ? makeZoned(input, {
      timeZone: offset
    }) : Option.none();
  }
  const [, isoString, timeZone] = match;
  return makeZoned(isoString, {
    timeZone
  });
};
/** @internal */
export const now = /*#__PURE__*/effect.map(Clock.currentTimeMillis, makeUtc);
/** @internal */
export const nowAsDate = /*#__PURE__*/effect.map(Clock.currentTimeMillis, millis => new Date(millis));
/** @internal */
export const nowUnsafe = () => makeUtc(Date.now());
// =============================================================================
// time zones
// =============================================================================
/** @internal */
export const toUtc = self => makeUtc(self.epochMilliseconds);
/** @internal */
export const setZone = /*#__PURE__*/dual(isDateTimeArgs, (self, zone, options) => options?.adjustForTimeZone === true ? makeZonedFromAdjusted(self.epochMilliseconds, zone, options?.disambiguation ?? "compatible") : makeZonedProto(self.epochMilliseconds, zone, self.partsUtc));
/** @internal */
export const setZoneOffset = /*#__PURE__*/dual(isDateTimeArgs, (self, offset, options) => setZone(self, zoneMakeOffset(offset), options));
const validZoneCache = /*#__PURE__*/new Map();
const formatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZoneName: "longOffset",
  fractionalSecondDigits: 3,
  hourCycle: "h23"
};
const zoneMakeIntl = format => {
  const zoneId = format.resolvedOptions().timeZone;
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  const zone = Object.create(ProtoTimeZoneNamed);
  zone.id = zoneId;
  zone.format = format;
  validZoneCache.set(zoneId, zone);
  return zone;
};
/** @internal */
export const zoneMakeNamedUnsafe = zoneId => {
  if (validZoneCache.has(zoneId)) {
    return validZoneCache.get(zoneId);
  }
  try {
    return zoneMakeIntl(new Intl.DateTimeFormat("en-US", {
      ...formatOptions,
      timeZone: zoneId
    }));
  } catch {
    throw new IllegalArgumentError(`Invalid time zone: ${zoneId}`);
  }
};
/** @internal */
export const zoneMakeOffset = offset => {
  const zone = Object.create(ProtoTimeZoneOffset);
  zone.offset = offset;
  return zone;
};
/** @internal */
export const zoneMakeNamed = /*#__PURE__*/Option.liftThrowable(zoneMakeNamedUnsafe);
/** @internal */
export const zoneMakeNamedEffect = zoneId => effect.try({
  try: () => zoneMakeNamedUnsafe(zoneId),
  catch: e => e
});
/** @internal */
export const zoneMakeLocal = () => zoneMakeIntl(new Intl.DateTimeFormat("en-US", formatOptions));
const offsetZoneRegExp = /^(?:GMT|[+-])/;
/** @internal */
export const zoneFromString = zone => {
  if (offsetZoneRegExp.test(zone)) {
    const offset = parseOffset(zone);
    return offset === null ? Option.none() : Option.some(zoneMakeOffset(offset));
  }
  return zoneMakeNamed(zone);
};
/** @internal */
export const zoneToString = self => {
  if (self._tag === "Offset") {
    return offsetToString(self.offset);
  }
  return self.id;
};
/** @internal */
export const setZoneNamed = /*#__PURE__*/dual(isDateTimeArgs, (self, zoneId, options) => Option.map(zoneMakeNamed(zoneId), zone => setZone(self, zone, options)));
/** @internal */
export const setZoneNamedUnsafe = /*#__PURE__*/dual(isDateTimeArgs, (self, zoneId, options) => setZone(self, zoneMakeNamedUnsafe(zoneId), options));
// =============================================================================
// comparisons
// =============================================================================
/** @internal */
export const distance = /*#__PURE__*/dual(2, (self, other) => Duration.millis(toEpochMillis(other) - toEpochMillis(self)));
/** @internal */
export const min = /*#__PURE__*/order.min(Order);
/** @internal */
export const max = /*#__PURE__*/order.max(Order);
/** @internal */
export const isGreaterThan = /*#__PURE__*/order.isGreaterThan(Order);
/** @internal */
export const isGreaterThanOrEqualTo = /*#__PURE__*/order.isGreaterThanOrEqualTo(Order);
/** @internal */
export const isLessThan = /*#__PURE__*/order.isLessThan(Order);
/** @internal */
export const isLessThanOrEqualTo = /*#__PURE__*/order.isLessThanOrEqualTo(Order);
/** @internal */
export const between = /*#__PURE__*/order.isBetween(Order);
/** @internal */
export const isFuture = self => effect.map(now, isLessThan(self));
/** @internal */
export const isFutureUnsafe = self => isLessThan(nowUnsafe(), self);
/** @internal */
export const isPast = self => effect.map(now, isGreaterThan(self));
/** @internal */
export const isPastUnsafe = self => isGreaterThan(nowUnsafe(), self);
// =============================================================================
// conversions
// =============================================================================
/** @internal */
export const toDateUtc = self => new Date(self.epochMilliseconds);
/** @internal */
export const toDate = self => {
  if (self._tag === "Utc") {
    return new Date(self.epochMilliseconds);
  } else if (self.zone._tag === "Offset") {
    return new Date(self.epochMilliseconds + self.zone.offset);
  } else if (self.adjustedEpochMilliseconds !== undefined) {
    return new Date(self.adjustedEpochMilliseconds);
  }
  const parts = self.zone.format.formatToParts(self.epochMilliseconds).filter(_ => _.type !== "literal");
  const date = new Date(0);
  date.setUTCFullYear(Number(parts[2].value), Number(parts[0].value) - 1, Number(parts[1].value));
  date.setUTCHours(Number(parts[3].value), Number(parts[4].value), Number(parts[5].value), Number(parts[6].value));
  self.adjustedEpochMilliseconds = date.getTime();
  return date;
};
/** @internal */
export const zonedOffset = self => {
  const date = toDate(self);
  return date.getTime() - toEpochMillis(self);
};
const offsetToString = offset => {
  const abs = Math.abs(offset);
  let hours = Math.floor(abs / (60 * 60 * 1000));
  let minutes = Math.round(abs % (60 * 60 * 1000) / (60 * 1000));
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }
  return `${offset < 0 ? "-" : "+"}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
/** @internal */
export const zonedOffsetIso = self => offsetToString(zonedOffset(self));
/** @internal */
export const toEpochMillis = self => self.epochMilliseconds;
/** @internal */
export const removeTime = self => withDate(self, date => {
  date.setUTCHours(0, 0, 0, 0);
  return makeUtc(date.getTime());
});
// =============================================================================
// parts
// =============================================================================
const dateToParts = date => ({
  millisecond: date.getUTCMilliseconds(),
  second: date.getUTCSeconds(),
  minute: date.getUTCMinutes(),
  hour: date.getUTCHours(),
  day: date.getUTCDate(),
  weekDay: date.getUTCDay(),
  month: date.getUTCMonth() + 1,
  year: date.getUTCFullYear()
});
/** @internal */
export const toParts = self => {
  if (self._tag === "Utc") {
    return toPartsUtc(self);
  } else if (self.partsAdjusted !== undefined) {
    return self.partsAdjusted;
  }
  self.partsAdjusted = withDate(self, dateToParts);
  return self.partsAdjusted;
};
/** @internal */
export const toPartsUtc = self => {
  if (self.partsUtc !== undefined) {
    return self.partsUtc;
  }
  self.partsUtc = withDateUtc(self, dateToParts);
  return self.partsUtc;
};
/** @internal */
export const getPartUtc = /*#__PURE__*/dual(2, (self, part) => toPartsUtc(self)[part]);
/** @internal */
export const getPart = /*#__PURE__*/dual(2, (self, part) => toParts(self)[part]);
const setPartsDate = (date, parts) => {
  if (parts.year !== undefined) {
    date.setUTCFullYear(parts.year);
  }
  if (parts.month !== undefined) {
    date.setUTCMonth(parts.month - 1);
  }
  if (parts.day !== undefined) {
    date.setUTCDate(parts.day);
  }
  if (parts.weekDay !== undefined) {
    const diff = parts.weekDay - date.getUTCDay();
    date.setUTCDate(date.getUTCDate() + diff);
  }
  if (parts.hour !== undefined) {
    date.setUTCHours(parts.hour);
  }
  if (parts.minute !== undefined) {
    date.setUTCMinutes(parts.minute);
  }
  if (parts.second !== undefined) {
    date.setUTCSeconds(parts.second);
  }
  if (parts.millisecond !== undefined) {
    date.setUTCMilliseconds(parts.millisecond);
  }
};
/** @internal */
export const setParts = /*#__PURE__*/dual(2, (self, parts) => mutate(self, date => setPartsDate(date, parts)));
/** @internal */
export const setPartsUtc = /*#__PURE__*/dual(2, (self, parts) => mutateUtc(self, date => setPartsDate(date, parts)));
// =============================================================================
// mapping
// =============================================================================
const constDayMillis = 24 * 60 * 60 * 1000;
const makeZonedFromAdjusted = (adjustedMillis, zone, disambiguation) => {
  if (zone._tag === "Offset") {
    return makeZonedProto(adjustedMillis - zone.offset, zone);
  }
  const beforeOffset = calculateNamedOffset(adjustedMillis - constDayMillis, adjustedMillis, zone);
  const afterOffset = calculateNamedOffset(adjustedMillis + constDayMillis, adjustedMillis, zone);
  // If there is no transition, we can return early
  if (beforeOffset === afterOffset) {
    return makeZonedProto(adjustedMillis - beforeOffset, zone);
  }
  const isForwards = beforeOffset < afterOffset;
  const transitionMillis = beforeOffset - afterOffset;
  // If the transition is forwards, we only need to check if we should move the
  // local wall clock time forward if it is inside the gap
  if (isForwards) {
    const currentAfterOffset = calculateNamedOffset(adjustedMillis - afterOffset, adjustedMillis, zone);
    if (currentAfterOffset === afterOffset) {
      return makeZonedProto(adjustedMillis - afterOffset, zone);
    }
    const before = makeZonedProto(adjustedMillis - beforeOffset, zone);
    const beforeAdjustedMillis = toDate(before).getTime();
    // If the wall clock time has changed, we are inside the gap
    if (adjustedMillis !== beforeAdjustedMillis) {
      switch (disambiguation) {
        case "reject":
          {
            const formatted = new Date(adjustedMillis).toISOString();
            throw new RangeError(`Gap time: ${formatted} does not exist in time zone ${zone.id}`);
          }
        case "earlier":
          return makeZonedProto(adjustedMillis - afterOffset, zone);
        case "compatible":
        case "later":
          return before;
      }
    }
    // The wall clock time is in the earlier offset, so we use that
    return before;
  }
  const currentBeforeOffset = calculateNamedOffset(adjustedMillis - beforeOffset, adjustedMillis, zone);
  // The wall clock time is in the earlier offset, so we use that
  if (currentBeforeOffset === beforeOffset) {
    if (disambiguation === "earlier" || disambiguation === "compatible") {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    const laterOffset = calculateNamedOffset(adjustedMillis - beforeOffset + transitionMillis, adjustedMillis + transitionMillis, zone);
    if (laterOffset === beforeOffset) {
      return makeZonedProto(adjustedMillis - beforeOffset, zone);
    }
    // If the offset changed in this period, then we are inside the period where
    // the wall clock time occurs twice, once in the earlier offset and once in
    // the later offset.
    if (disambiguation === "reject") {
      const formatted = new Date(adjustedMillis).toISOString();
      throw new RangeError(`Ambiguous time: ${formatted} occurs twice in time zone ${zone.id}`);
    }
    // If the disambiguation is "later", we return the later offset below
  }
  return makeZonedProto(adjustedMillis - afterOffset, zone);
};
const offsetRegExp = /([+-])(\d{2}):(\d{2})$/;
const parseOffset = offset => {
  const match = offsetRegExp.exec(offset);
  if (match === null) {
    return null;
  }
  const [, sign, hours, minutes] = match;
  return (sign === "+" ? 1 : -1) * (Number(hours) * 60 + Number(minutes)) * 60 * 1000;
};
const calculateNamedOffset = (utcMillis, adjustedMillis, zone) => {
  const offset = zone.format.formatToParts(utcMillis).find(_ => _.type === "timeZoneName")?.value ?? "";
  if (offset === "GMT") {
    return 0;
  }
  const result = parseOffset(offset);
  if (result === null) {
    // fallback to using the adjusted date
    return zonedOffset(makeZonedProto(adjustedMillis, zone));
  }
  return result;
};
/** @internal */
export const mutate = /*#__PURE__*/dual(isDateTimeArgs, (self, f, options) => {
  if (self._tag === "Utc") {
    const date = toDateUtc(self);
    f(date);
    return makeUtc(date.getTime());
  }
  const adjustedDate = toDate(self);
  const newAdjustedDate = new Date(adjustedDate.getTime());
  f(newAdjustedDate);
  return makeZonedFromAdjusted(newAdjustedDate.getTime(), self.zone, options?.disambiguation ?? "compatible");
});
/** @internal */
export const mutateUtc = /*#__PURE__*/dual(2, (self, f) => mapEpochMillis(self, millis => {
  const date = new Date(millis);
  f(date);
  return date.getTime();
}));
/** @internal */
export const mapEpochMillis = /*#__PURE__*/dual(2, (self, f) => {
  const millis = f(toEpochMillis(self));
  return self._tag === "Utc" ? makeUtc(millis) : makeZonedProto(millis, self.zone);
});
/** @internal */
export const withDate = /*#__PURE__*/dual(2, (self, f) => f(toDate(self)));
/** @internal */
export const withDateUtc = /*#__PURE__*/dual(2, (self, f) => f(toDateUtc(self)));
/** @internal */
export const match = /*#__PURE__*/dual(2, (self, options) => self._tag === "Utc" ? options.onUtc(self) : options.onZoned(self));
// =============================================================================
// math
// =============================================================================
/** @internal */
export const addDuration = /*#__PURE__*/dual(2, (self, duration) => mapEpochMillis(self, millis => millis + Duration.toMillis(Duration.fromInputUnsafe(duration))));
/** @internal */
export const subtractDuration = /*#__PURE__*/dual(2, (self, duration) => mapEpochMillis(self, millis => millis - Duration.toMillis(Duration.fromInputUnsafe(duration))));
const addMillis = (date, amount) => {
  date.setTime(date.getTime() + amount);
};
/** @internal */
export const add = /*#__PURE__*/dual(2, (self, parts) => mutate(self, date => {
  if (parts.milliseconds) {
    addMillis(date, parts.milliseconds);
  }
  if (parts.seconds) {
    addMillis(date, parts.seconds * 1000);
  }
  if (parts.minutes) {
    addMillis(date, parts.minutes * 60 * 1000);
  }
  if (parts.hours) {
    addMillis(date, parts.hours * 60 * 60 * 1000);
  }
  if (parts.days) {
    date.setUTCDate(date.getUTCDate() + parts.days);
  }
  if (parts.weeks) {
    date.setUTCDate(date.getUTCDate() + parts.weeks * 7);
  }
  if (parts.months) {
    const day = date.getUTCDate();
    date.setUTCMonth(date.getUTCMonth() + parts.months + 1, 0);
    if (day < date.getUTCDate()) {
      date.setUTCDate(day);
    }
  }
  if (parts.years) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    date.setUTCFullYear(date.getUTCFullYear() + parts.years, month + 1, 0);
    if (day < date.getUTCDate()) {
      date.setUTCDate(day);
    }
  }
}));
/** @internal */
export const subtract = /*#__PURE__*/dual(2, (self, parts) => {
  const newParts = {};
  for (const key in parts) {
    newParts[key] = -1 * parts[key];
  }
  return add(self, newParts);
});
const startOfDate = (date, part, options) => {
  switch (part) {
    case "second":
      {
        date.setUTCMilliseconds(0);
        break;
      }
    case "minute":
      {
        date.setUTCSeconds(0, 0);
        break;
      }
    case "hour":
      {
        date.setUTCMinutes(0, 0, 0);
        break;
      }
    case "day":
      {
        date.setUTCHours(0, 0, 0, 0);
        break;
      }
    case "week":
      {
        const weekStartsOn = options?.weekStartsOn ?? 0;
        const day = date.getUTCDay();
        const diff = (day - weekStartsOn + 7) % 7;
        date.setUTCDate(date.getUTCDate() - diff);
        date.setUTCHours(0, 0, 0, 0);
        break;
      }
    case "month":
      {
        date.setUTCDate(1);
        date.setUTCHours(0, 0, 0, 0);
        break;
      }
    case "year":
      {
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
        break;
      }
  }
};
/** @internal */
export const startOf = /*#__PURE__*/dual(isDateTimeArgs, (self, part, options) => mutate(self, date => startOfDate(date, part, options)));
const endOfDate = (date, part, options) => {
  switch (part) {
    case "second":
      {
        date.setUTCMilliseconds(999);
        break;
      }
    case "minute":
      {
        date.setUTCSeconds(59, 999);
        break;
      }
    case "hour":
      {
        date.setUTCMinutes(59, 59, 999);
        break;
      }
    case "day":
      {
        date.setUTCHours(23, 59, 59, 999);
        break;
      }
    case "week":
      {
        const weekStartsOn = options?.weekStartsOn ?? 0;
        const day = date.getUTCDay();
        const diff = (day - weekStartsOn + 7) % 7;
        date.setUTCDate(date.getUTCDate() - diff + 6);
        date.setUTCHours(23, 59, 59, 999);
        break;
      }
    case "month":
      {
        date.setUTCMonth(date.getUTCMonth() + 1, 0);
        date.setUTCHours(23, 59, 59, 999);
        break;
      }
    case "year":
      {
        date.setUTCMonth(11, 31);
        date.setUTCHours(23, 59, 59, 999);
        break;
      }
  }
};
/** @internal */
export const endOf = /*#__PURE__*/dual(isDateTimeArgs, (self, part, options) => mutate(self, date => endOfDate(date, part, options)));
/** @internal */
export const nearest = /*#__PURE__*/dual(isDateTimeArgs, (self, part, options) => mutate(self, date => {
  if (part === "millisecond") return;
  const millis = date.getTime();
  const start = new Date(millis);
  startOfDate(start, part, options);
  const startMillis = start.getTime();
  const end = new Date(millis);
  endOfDate(end, part, options);
  const endMillis = end.getTime() + 1;
  const diffStart = millis - startMillis;
  const diffEnd = endMillis - millis;
  if (diffStart < diffEnd) {
    date.setTime(startMillis);
  } else {
    date.setTime(endMillis);
  }
}));
// =============================================================================
// formatting
// =============================================================================
const intlTimeZone = self => {
  if (self._tag === "Named") {
    return self.id;
  }
  return offsetToString(self.offset);
};
/** @internal */
export const format = /*#__PURE__*/dual(isDateTimeArgs, (self, options) => {
  try {
    return new Intl.DateTimeFormat(options?.locale, {
      timeZone: self._tag === "Utc" ? "UTC" : intlTimeZone(self.zone),
      ...options
    }).format(self.epochMilliseconds);
  } catch {
    return new Intl.DateTimeFormat(options?.locale, {
      timeZone: "UTC",
      ...options
    }).format(toDate(self));
  }
});
/** @internal */
export const formatLocal = /*#__PURE__*/dual(isDateTimeArgs, (self, options) => new Intl.DateTimeFormat(options?.locale, options).format(self.epochMilliseconds));
/** @internal */
export const formatUtc = /*#__PURE__*/dual(isDateTimeArgs, (self, options) => new Intl.DateTimeFormat(options?.locale, {
  ...options,
  timeZone: "UTC"
}).format(self.epochMilliseconds));
/** @internal */
export const formatIntl = /*#__PURE__*/dual(2, (self, format) => format.format(self.epochMilliseconds));
/** @internal */
export const formatIso = self => toDateUtc(self).toISOString();
/** @internal */
export const formatIsoDate = self => toDate(self).toISOString().slice(0, 10);
/** @internal */
export const formatIsoDateUtc = self => toDateUtc(self).toISOString().slice(0, 10);
/** @internal */
export const formatIsoOffset = self => {
  const date = toDate(self);
  return self._tag === "Utc" ? date.toISOString() : `${date.toISOString().slice(0, -1)}${zonedOffsetIso(self)}`;
};
/** @internal */
export const formatIsoZoned = self => self.zone._tag === "Offset" ? formatIsoOffset(self) : `${formatIsoOffset(self)}[${self.zone.id}]`;
//# sourceMappingURL=dateTime.js.map