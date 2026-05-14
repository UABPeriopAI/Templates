import * as Effect from "./Effect.js";
import * as effect from "./internal/effect.js";
import * as references from "./internal/references.js";
import * as Layer from "./Layer.js";
import * as LogLevel from "./LogLevel.js";
/**
 * @since 4.0.0
 * @category Type Identifiers
 */
export const TypeId = "~effect/ErrorReporter";
/**
 * Creates an `ErrorReporter` from a callback.
 *
 * The returned reporter automatically deduplicates causes and individual
 * errors (the same object is never reported twice), skips interruptions,
 * and resolves the `ignore`, `severity`, and `attributes` annotations on
 * each error before invoking your callback.
 *
 * @example
 * ```ts
 * import { ErrorReporter } from "effect"
 *
 * // Forward every failure to the console
 * const consoleReporter = ErrorReporter.make(
 *   ({ error, severity, attributes }) => {
 *     console.error(`[${severity}]`, error.message, attributes)
 *   }
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = report => {
  const reported = new WeakSet();
  return {
    [TypeId]: TypeId,
    report(options) {
      if (reported.has(options.cause)) return;
      reported.add(options.cause);
      for (let i = 0; i < options.cause.reasons.length; i++) {
        const reason = options.cause.reasons[i];
        if (reason._tag === "Interrupt") continue;
        const original = reason._tag === "Fail" ? reason.error : reason.defect;
        const isObject = typeof original === "object" && original !== null;
        if (isObject) {
          if (reported.has(original)) continue;
          reported.add(original);
        }
        if (isIgnored(original)) continue;
        const pretty = effect.causePrettyError(original, reason.annotations);
        report({
          ...options,
          error: pretty,
          severity: isObject ? getSeverity(original) : "Info",
          attributes: isObject ? getAttributes(original) : emptyAttributes
        });
      }
    }
  };
};
/**
 * A `Context.Reference` holding the set of active `ErrorReporter`s for the
 * current fiber. Defaults to an empty set (no reporting).
 *
 * Prefer {@link layer} to configure reporters via the `Layer` API. Use this
 * reference directly only when you need low-level control (e.g. reading the
 * current reporters or swapping them inside a `FiberRef`).
 *
 * @since 4.0.0
 * @category References
 */
export const CurrentErrorReporters = references.CurrentErrorReporters;
/**
 * Creates a `Layer` that registers one or more `ErrorReporter`s.
 *
 * Reporters can be plain `ErrorReporter` values or effectful
 * `Effect<ErrorReporter>` values that are resolved when the layer is built.
 *
 * By default the provided reporters **replace** any previously registered
 * reporters. Set `mergeWithExisting: true` to add them alongside existing
 * ones.
 *
 * @example
 * ```ts
 * import { Effect, ErrorReporter } from "effect"
 *
 * const consoleReporter = ErrorReporter.make(({ error, severity }) => {
 *   console.error(`[${severity}]`, error.message)
 * })
 *
 * const metricsReporter = ErrorReporter.make(({ severity }) => {
 *   // increment an error counter by severity
 * })
 *
 * // Replace all existing reporters
 * const ReporterLive = ErrorReporter.layer([
 *   consoleReporter,
 *   metricsReporter
 * ])
 *
 * // Add to existing reporters instead of replacing
 * const ReporterMerged = ErrorReporter.layer(
 *   [metricsReporter],
 *   { mergeWithExisting: true }
 * )
 *
 * const program = Effect.fail("boom").pipe(
 *   Effect.withErrorReporting,
 *   Effect.provide(ReporterLive)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Layers
 */
export const layer = (reporters, options) => Layer.effect(CurrentErrorReporters, Effect.withFiber(Effect.fnUntraced(function* (fiber) {
  const currentReporters = new Set(options?.mergeWithExisting === true ? fiber.getRef(references.CurrentErrorReporters) : []);
  for (const reporter of reporters) {
    currentReporters.add(Effect.isEffect(reporter) ? yield* reporter : reporter);
  }
  return currentReporters;
})));
/**
 * Manually report a `Cause` to all registered `ErrorReporter`s on the
 * current fiber.
 *
 * This is useful when you want to report an error for observability without
 * actually failing the fiber.
 *
 * @example
 * ```ts
 * import { Cause, Effect, ErrorReporter } from "effect"
 *
 * // Log the cause for monitoring, then continue with a fallback
 * const program = Effect.gen(function*() {
 *   const cause = Cause.fail("something went wrong")
 *   yield* ErrorReporter.report(cause)
 *   return "fallback value"
 * })
 * ```
 *
 * @since 4.0.0
 * @category Reporting
 */
export const report = cause => Effect.withFiber(fiber => {
  effect.reportCauseUnsafe(fiber, cause);
  return Effect.void;
});
/**
 * Symbol key used to mark an error as unreportable.
 *
 * Set this property to `true` on any error class to prevent it from being
 * forwarded to reporters. Useful for expected errors such as HTTP 404s.
 *
 * @example
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {
 *   readonly [ErrorReporter.ignore] = true
 * }
 * ```
 *
 * @since 4.0.0
 * @category Annotations
 */
export const ignore = "~effect/ErrorReporter/ignore";
/**
 * Returns `true` if the given value has the `ErrorReporter.ignore` annotation
 * set to `true`.
 *
 * @since 4.0.0
 * @category Annotations
 */
export const isIgnored = u => typeof u === "object" && u !== null && ignore in u && u[ignore] === true;
/**
 * Symbol key used to override the severity level of an error.
 *
 * When set, the reporter callback receives this value as `severity` instead
 * of the default `"Error"`. Accepted values are the `LogLevel.Severity`
 * literals: `"Trace"`, `"Debug"`, `"Info"`, `"Warn"`, `"Error"`, `"Fatal"`.
 *
 * @example
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class DeprecationWarning extends Data.TaggedError("DeprecationWarning")<{}> {
 *   readonly [ErrorReporter.severity] = "Warn" as const
 * }
 * ```
 *
 * @since 4.0.0
 * @category Annotations
 */
export const severity = "~effect/ErrorReporter/severity";
/**
 * Reads the `ErrorReporter.severity` annotation from an error object,
 * falling back to `"Error"` when unset or invalid.
 *
 * @since 4.0.0
 * @category Annotations
 */
export const getSeverity = error => {
  if (severity in error && LogLevel.values.includes(error[severity])) {
    return error[severity];
  }
  return "Info";
};
/**
 * Symbol key used to attach extra key/value metadata to an error report.
 *
 * Reporters receive these attributes alongside the error, making it easy to
 * include contextual information such as user IDs, request IDs, or any
 * domain-specific data useful for debugging.
 *
 * @example
 * ```ts
 * import { Data, ErrorReporter } from "effect"
 *
 * class PaymentError extends Data.TaggedError("PaymentError")<{
 *   readonly orderId: string
 * }> {
 *   readonly [ErrorReporter.attributes] = {
 *     orderId: this.orderId
 *   }
 * }
 * ```
 *
 * @since 4.0.0
 * @category Annotations
 */
export const attributes = "~effect/ErrorReporter/attributes";
/**
 * Reads the `ErrorReporter.attributes` annotation from an error object,
 * returning an empty record when unset.
 *
 * @since 4.0.0
 * @category Annotations
 */
export const getAttributes = error => {
  return attributes in error ? error[attributes] : emptyAttributes;
};
const emptyAttributes = {};
//# sourceMappingURL=ErrorReporter.js.map