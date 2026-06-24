import * as Equ from "./Equivalence.js";
import * as core from "./internal/core.js";
import * as effect from "./internal/effect.js";
import * as Ord from "./Order.js";
import * as References from "./References.js";
/**
 * @since 4.0.0
 * @category models
 */
export const values = ["All", "Fatal", "Error", "Warn", "Info", "Debug", "Trace", "None"];
/**
 * An `Order` instance for `LogLevel` that defines the severity ordering.
 *
 * This order treats "All" as the least restrictive level and "None" as the most restrictive,
 * with Fatal being the most severe actual log level.
 *
 * @example
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Compare log levels using Order
 * console.log(LogLevel.Order("Error", "Info")) // 1 (Error > Info)
 * console.log(LogLevel.Order("Debug", "Error")) // -1 (Debug < Error)
 * console.log(LogLevel.Order("Info", "Info")) // 0 (Info == Info)
 * ```
 *
 * @since 2.0.0
 * @category ordering
 */
export const Order = effect.LogLevelOrder;
/**
 * An `Equivalence` instance for log levels using strict equality (`===`).
 *
 * @example
 * ```ts
 * import { LogLevel } from "effect"
 *
 * console.log(LogLevel.Equivalence("Error", "Error")) // true
 * console.log(LogLevel.Equivalence("Error", "Info")) // false
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export const Equivalence = /*#__PURE__*/Equ.strictEqual();
/**
 * Returns the ordinal value of the log level.
 *
 * @since 4.0.0
 * @category ordering
 */
export const getOrdinal = self => effect.logLevelToOrder(self);
/**
 * Determines if the first log level is more severe than the second.
 *
 * Returns `true` if `self` represents a more severe level than `that`.
 * This is useful for filtering logs based on minimum severity requirements.
 *
 * @example
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Check if Error is more severe than Info
 * console.log(LogLevel.isGreaterThan("Error", "Info")) // true
 * console.log(LogLevel.isGreaterThan("Debug", "Error")) // false
 *
 * // Use with filtering
 * const isFatal = LogLevel.isGreaterThan("Fatal", "Warn")
 * const isError = LogLevel.isGreaterThan("Error", "Warn")
 * const isDebug = LogLevel.isGreaterThan("Debug", "Warn")
 * console.log(isFatal) // true
 * console.log(isError) // true
 * console.log(isDebug) // false
 *
 * // Curried usage
 * const isMoreSevereThanInfo = LogLevel.isGreaterThan("Info")
 * console.log(isMoreSevereThanInfo("Error")) // true
 * console.log(isMoreSevereThanInfo("Debug")) // false
 * ```
 *
 * @since 2.0.0
 * @category ordering
 */
export const isGreaterThan = effect.isLogLevelGreaterThan;
/**
 * Determines if the first log level is more severe than or equal to the second.
 *
 * Returns `true` if `self` represents a level that is more severe than or equal to `that`.
 * This is the most common function for implementing minimum log level filtering.
 *
 * @example
 * ```ts
 * import { Logger, LogLevel } from "effect"
 *
 * // Check if level meets minimum threshold
 * console.log(LogLevel.isGreaterThanOrEqualTo("Error", "Error")) // true
 * console.log(LogLevel.isGreaterThanOrEqualTo("Error", "Info")) // true
 * console.log(LogLevel.isGreaterThanOrEqualTo("Debug", "Info")) // false
 *
 * // Create a logger that only logs Info and above
 * const infoLogger = Logger.make((options) => {
 *   if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Info")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 *
 * // Production logger - only Error and Fatal
 * const productionLogger = Logger.make((options) => {
 *   if (LogLevel.isGreaterThanOrEqualTo(options.logLevel, "Error")) {
 *     console.error(
 *       `${options.date.toISOString()} [${options.logLevel}] ${options.message}`
 *     )
 *   }
 * })
 *
 * // Curried usage for filtering
 * const isInfoOrAbove = LogLevel.isGreaterThanOrEqualTo("Info")
 * const shouldLog = isInfoOrAbove("Error") // true
 * ```
 *
 * @since 2.0.0
 * @category ordering
 */
export const isGreaterThanOrEqualTo = /*#__PURE__*/Ord.isGreaterThanOrEqualTo(Order);
/**
 * Determines if the first log level is less severe than the second.
 *
 * Returns `true` if `self` represents a less severe level than `that`.
 * This is useful for filtering out logs that are too verbose.
 *
 * @example
 * ```ts
 * import { LogLevel } from "effect"
 *
 * // Check if Debug is less severe than Info
 * console.log(LogLevel.isLessThan("Debug", "Info")) // true
 * console.log(LogLevel.isLessThan("Error", "Info")) // false
 *
 * // Filter out verbose logs
 * const isFatalVerbose = LogLevel.isLessThan("Fatal", "Info")
 * const isErrorVerbose = LogLevel.isLessThan("Error", "Info")
 * const isTraceVerbose = LogLevel.isLessThan("Trace", "Info")
 * console.log(isFatalVerbose) // false (Fatal is not verbose)
 * console.log(isErrorVerbose) // false (Error is not verbose)
 * console.log(isTraceVerbose) // true (Trace is verbose)
 *
 * // Curried usage
 * const isLessSevereThanError = LogLevel.isLessThan("Error")
 * console.log(isLessSevereThanError("Info")) // true
 * console.log(isLessSevereThanError("Fatal")) // false
 * ```
 *
 * @since 2.0.0
 * @category ordering
 */
export const isLessThan = /*#__PURE__*/Ord.isLessThan(Order);
/**
 * Determines if the first log level is less severe than or equal to the second.
 *
 * Returns `true` if `self` represents a level that is less severe than or equal to `that`.
 * This is useful for implementing maximum log level filtering.
 *
 * @example
 * ```ts
 * import { Logger, LogLevel } from "effect"
 *
 * // Check if level is at or below threshold
 * console.log(LogLevel.isLessThanOrEqualTo("Info", "Info")) // true
 * console.log(LogLevel.isLessThanOrEqualTo("Debug", "Info")) // true
 * console.log(LogLevel.isLessThanOrEqualTo("Error", "Info")) // false
 *
 * // Create a logger that suppresses verbose logs
 * const quietLogger = Logger.make((options) => {
 *   if (LogLevel.isLessThanOrEqualTo(options.logLevel, "Info")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 *
 * // Development logger - suppress trace logs
 * const devLogger = Logger.make((options) => {
 *   if (LogLevel.isLessThanOrEqualTo(options.logLevel, "Debug")) {
 *     console.log(`[${options.logLevel}] ${options.message}`)
 *   }
 * })
 *
 * // Curried usage for filtering
 * const isInfoOrBelow = LogLevel.isLessThanOrEqualTo("Info")
 * const shouldLog = isInfoOrBelow("Debug") // true
 * ```
 *
 * @since 2.0.0
 * @category ordering
 */
export const isLessThanOrEqualTo = /*#__PURE__*/Ord.isLessThanOrEqualTo(Order);
/**
 * Checks whether a given log level is enabled for the current fiber.
 *
 * A log level is enabled when it is greater than or equal to
 * `References.MinimumLogLevel`.
 *
 * @example
 * ```ts
 * import { Effect, LogLevel, References } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const debugEnabled = yield* LogLevel.isEnabled("Debug")
 *   const errorEnabled = yield* LogLevel.isEnabled("Error")
 *
 *   console.log({ debugEnabled, errorEnabled })
 * })
 *
 * const warnOnly = program.pipe(
 *   Effect.provideService(References.MinimumLogLevel, "Warn")
 * )
 * ```
 *
 * @since 4.0.0
 * @category filtering
 */
export const isEnabled = self => core.withFiber(fiber => effect.succeed(!isGreaterThan(fiber.getRef(References.MinimumLogLevel), self)));
//# sourceMappingURL=LogLevel.js.map