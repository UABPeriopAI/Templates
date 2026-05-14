/**
 * Prometheus metrics exporter for Effect's Metric system.
 *
 * This module provides functionality to export Effect metrics in the Prometheus
 * exposition format, making them scrapeable by Prometheus servers.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 * import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * const program = Effect.gen(function*() {
 *   // Create and update metrics
 *   const counter = Metric.counter("http_requests_total", {
 *     description: "Total HTTP requests"
 *   })
 *   yield* Metric.update(counter, 42)
 *
 *   // Format metrics for Prometheus
 *   const output = yield* PrometheusMetrics.format()
 *   console.log(output)
 *   // # HELP http_requests_total Total HTTP requests
 *   // # TYPE http_requests_total counter
 *   // http_requests_total 42
 * })
 * ```
 *
 * @since 4.0.0
 */
import type * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
/**
 * A function that transforms metric names before formatting.
 *
 * @example
 * ```ts
 * import type * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * // Convert camelCase to snake_case
 * const mapper: PrometheusMetrics.MetricNameMapper = (name) =>
 *   name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()
 * ```
 *
 * @since 4.0.0
 * @category Models
 */
export type MetricNameMapper = (name: string) => string;
/**
 * Options for formatting metrics.
 *
 * @since 4.0.0
 * @category Models
 */
export interface FormatOptions {
    /**
     * Optional prefix to prepend to all metric names.
     * The prefix will be sanitized and joined with an underscore.
     */
    readonly prefix?: string | undefined;
    /**
     * Optional function to transform metric names before sanitization.
     */
    readonly metricNameMapper?: MetricNameMapper | undefined;
}
/**
 * Options for exporting Prometheus metrics over HTTP.
 *
 * @since 4.0.0
 * @category Models
 */
export interface HttpOptions extends FormatOptions {
    /**
     * The path to the HTTP route on which Prometheus metrics should be served.
     */
    readonly path?: HttpRouter.PathInput | undefined;
}
/**
 * Format all metrics in the registry to Prometheus exposition format.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 * import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * const program = Effect.gen(function*() {
 *   const counter = Metric.counter("api_requests_total", {
 *     description: "Total API requests"
 *   })
 *   const gauge = Metric.gauge("active_connections", {
 *     description: "Number of active connections"
 *   })
 *
 *   yield* Metric.update(counter, 100)
 *   yield* Metric.update(gauge, 25)
 *
 *   // Format without prefix
 *   const output1 = yield* PrometheusMetrics.format()
 *
 *   // Format with prefix
 *   const output2 = yield* PrometheusMetrics.format({ prefix: "myapp" })
 * })
 * ```
 *
 * @since 4.0.0
 * @category Formatting
 */
export declare const format: (options?: FormatOptions | undefined) => Effect.Effect<string>;
/**
 * Synchronously format all metrics in the registry to Prometheus exposition format.
 *
 * This is a low-level function that requires access to the context.
 * Most users should use `format` instead.
 *
 * @since 4.0.0
 * @category Formatting
 */
export declare const formatUnsafe: (context: Context.Context<never>, options?: FormatOptions | undefined) => string;
/**
 * Creates a Layer that registers a `/metrics` HTTP endpoint for Prometheus
 * scraping.
 *
 * This layer automatically adds a GET route to your HTTP router that serves
 * metrics in Prometheus exposition format. By default, the endpoint is
 * registered at `/metrics`, but this can be customized via the `path` option.
 *
 * @example
 * ```ts
 * import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics"
 *
 * // Create a layer that adds /metrics endpoint to the router
 * const PrometheusLayer = PrometheusMetrics.layerHttp()
 *
 * // Or customize the path and add a prefix to all metric names
 * const CustomPrometheusLayer = PrometheusMetrics.layerHttp({
 *   path: "/prometheus/metrics",
 *   prefix: "myapp"
 * })
 * ```
 *
 * @since 4.0.0
 * @category Http
 */
export declare const layerHttp: (options?: HttpOptions | undefined) => Layer.Layer<never, never, HttpRouter.HttpRouter>;
//# sourceMappingURL=PrometheusMetrics.d.ts.map