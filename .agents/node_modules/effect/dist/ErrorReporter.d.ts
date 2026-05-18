/**
 * Pluggable error reporting for Effect programs.
 *
 * Reporting is triggered by `Effect.withErrorReporting`,
 * `ErrorReporter.report`, or built-in reporting boundaries in the HTTP and
 * RPC server modules.
 *
 * Each reporter receives a structured callback with the failing `Cause`, a
 * pretty-printed `Error`, severity, and any extra attributes attached to the
 * original error — making it straightforward to forward failures to Sentry,
 * Datadog, or a custom logging backend.
 *
 * Use the annotation symbols (`ignore`, `severity`, `attributes`) on your
 * error classes to control reporting behavior per-error.
 *
 * @example
 * ```ts
 * import { Data, Effect, ErrorReporter } from "effect"
 *
 * // A reporter that logs to the console
 * const consoleReporter = ErrorReporter.make(({ error, severity }) => {
 *   console.error(`[${severity}]`, error.message)
 * })
 *
 * // An error that should be ignored by reporters
 * class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {
 *   readonly [ErrorReporter.ignore] = true
 * }
 *
 * // An error with custom severity and attributes
 * class RateLimitError extends Data.TaggedError("RateLimitError")<{
 *   readonly retryAfter: number
 * }> {
 *   readonly [ErrorReporter.severity] = "Warn" as const
 *   readonly [ErrorReporter.attributes] = {
 *     retryAfter: this.retryAfter
 *   }
 * }
 *
 * // Opt in to error reporting with Effect.withErrorReporting
 * const program = Effect.gen(function*() {
 *   return yield* new RateLimitError({ retryAfter: 60 })
 * }).pipe(
 *   Effect.withErrorReporting,
 *   Effect.provide(ErrorReporter.layer([consoleReporter]))
 * )
 * ```
 *
 * @since 4.0.0
 */
import type * as Cause from "./Cause.ts";
import type * as Context from "./Context.ts";
import * as Effect from "./Effect.ts";
import type * as Fiber from "./Fiber.ts";
import * as Layer from "./Layer.ts";
import type { Severity } from "./LogLevel.ts";
import type { ReadonlyRecord } from "./Record.ts";
import type * as Scope from "./Scope.ts";
/**
 * @since 4.0.0
 * @category Type Identifiers
 */
export type TypeId = "~effect/ErrorReporter";
/**
 * @since 4.0.0
 * @category Type Identifiers
 */
export declare const TypeId: TypeId;
/**
 * An `ErrorReporter` receives reported failures and forwards them to an
 * external system (logging service, error tracker, etc.).
 *
 * Reporting is triggered by `Effect.withErrorReporting`,
 * `ErrorReporter.report`, or built-in boundaries in the HTTP and RPC server
 * modules. Use {@link make} to create a reporter — it handles deduplication
 * and per-error annotation extraction automatically.
 *
 * @since 4.0.0
 * @category Models
 */
export interface ErrorReporter {
    readonly [TypeId]: TypeId;
    report(options: {
        readonly cause: Cause.Cause<unknown>;
        readonly fiber: Fiber.Fiber<unknown, unknown>;
        readonly timestamp: bigint;
    }): void;
}
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
export declare const make: (report: (options: {
    readonly cause: Cause.Cause<unknown>;
    readonly error: Error;
    readonly attributes: ReadonlyRecord<string, unknown>;
    readonly severity: Severity;
    readonly fiber: Fiber.Fiber<unknown, unknown>;
    readonly timestamp: bigint;
}) => void) => ErrorReporter;
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
export declare const CurrentErrorReporters: Context.Reference<ReadonlySet<ErrorReporter>>;
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
export declare const layer: <const Reporters extends ReadonlyArray<ErrorReporter | Effect.Effect<ErrorReporter, any, any>>>(reporters: Reporters, options?: {
    readonly mergeWithExisting?: boolean | undefined;
} | undefined) => Layer.Layer<never, Reporters extends readonly [] ? never : Effect.Error<Reporters[number]>, Exclude<Reporters extends readonly [] ? never : Effect.Services<Reporters[number]>, Scope.Scope>>;
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
export declare const report: <E>(cause: Cause.Cause<E>) => Effect.Effect<void>;
/**
 * Interface that errors can implement to control reporting behavior.
 *
 * All three annotation properties are optional:
 * - `[ErrorReporter.ignore]` — when `true`, the error is never reported
 * - `[ErrorReporter.severity]` — overrides the default `"Error"` severity
 * - `[ErrorReporter.attributes]` — extra key/value pairs forwarded to reporters
 *
 * The global `Error` interface is augmented with `Reportable`, so these
 * properties are available on all `Error` instances.
 *
 * @since 4.0.0
 * @category Annotations
 */
export interface Reportable {
    readonly [ignore]?: boolean;
    readonly [severity]?: Severity;
    readonly [attributes]?: ReadonlyRecord<string, unknown>;
}
declare global {
    interface Error extends Reportable {
    }
}
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
export type ignore = "~effect/ErrorReporter/ignore";
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
export declare const ignore: ignore;
/**
 * Returns `true` if the given value has the `ErrorReporter.ignore` annotation
 * set to `true`.
 *
 * @since 4.0.0
 * @category Annotations
 */
export declare const isIgnored: (u: unknown) => boolean;
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
export type severity = "~effect/ErrorReporter/severity";
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
export declare const severity: severity;
/**
 * Reads the `ErrorReporter.severity` annotation from an error object,
 * falling back to `"Error"` when unset or invalid.
 *
 * @since 4.0.0
 * @category Annotations
 */
export declare const getSeverity: (error: object) => Severity;
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
export type attributes = "~effect/ErrorReporter/attributes";
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
export declare const attributes: attributes;
/**
 * Reads the `ErrorReporter.attributes` annotation from an error object,
 * returning an empty record when unset.
 *
 * @since 4.0.0
 * @category Annotations
 */
export declare const getAttributes: (error: object) => ReadonlyRecord<string, unknown>;
//# sourceMappingURL=ErrorReporter.d.ts.map