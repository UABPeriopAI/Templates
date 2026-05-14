import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Metric from "../../Metric.js";
import * as HttpRouter from "../http/HttpRouter.js";
import * as HttpServerResponse from "../http/HttpServerResponse.js";
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
export const format = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const services = yield* Effect.context();
  return formatUnsafe(services, options);
});
/**
 * Synchronously format all metrics in the registry to Prometheus exposition format.
 *
 * This is a low-level function that requires access to the context.
 * Most users should use `format` instead.
 *
 * @since 4.0.0
 * @category Formatting
 */
export const formatUnsafe = (context, options) => {
  const snapshot = Metric.snapshotUnsafe(context);
  const prefix = options?.prefix ? sanitizeMetricName(options.prefix) + "_" : "";
  const mapper = options?.metricNameMapper ?? (name => name);
  const lines = [];
  // Group metrics by base name for proper TYPE/HELP declarations
  const metricsByName = new Map();
  for (let i = 0; i < snapshot.length; i++) {
    const metric = snapshot[i];
    const name = prefix + sanitizeMetricName(mapper(metric.id));
    const existing = metricsByName.get(name);
    if (existing) {
      existing.push(metric);
    } else {
      metricsByName.set(name, [metric]);
    }
  }
  for (const [name, metrics] of metricsByName) {
    formatMetricFamily(name, metrics, lines);
  }
  // Prometheus expects a trailing newline if there's content
  return lines.length > 0 ? lines.join("\n") + "\n" : "";
};
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
export const layerHttp = options => Layer.effectDiscard(Effect.gen(function* () {
  const router = yield* HttpRouter.HttpRouter;
  const {
    path,
    ...formatOptions
  } = options ?? {};
  const handler = Effect.gen(function* () {
    const body = yield* format(formatOptions);
    return HttpServerResponse.text(body, {
      contentType: "text/plain; version=0.0.4; charset=utf-8"
    });
  });
  yield* router.add("GET", path ?? "/metrics", handler);
}));
// -----------------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------------
/**
 * Sanitize a metric name to conform to Prometheus naming rules.
 * Valid characters: [a-zA-Z_:][a-zA-Z0-9_:]*
 */
const sanitizeMetricName = name => {
  // Replace invalid characters with underscores
  let sanitized = name.replace(/[^a-zA-Z0-9_:]/g, "_");
  // Ensure it starts with a letter or underscore (not a digit or colon)
  if (/^[0-9:]/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }
  // Remove consecutive underscores
  sanitized = sanitized.replace(/_+/g, "_");
  // Remove trailing underscores
  sanitized = sanitized.replace(/_$/, "");
  return sanitized;
};
/**
 * Sanitize a label name to conform to Prometheus naming rules.
 * Valid characters: [a-zA-Z_][a-zA-Z0-9_]*
 */
const sanitizeLabelName = name => {
  // Replace invalid characters with underscores
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, "_");
  // Ensure it starts with a letter or underscore
  if (/^[0-9]/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }
  // Remove consecutive underscores
  sanitized = sanitized.replace(/_+/g, "_");
  return sanitized;
};
/**
 * Escape special characters in label values.
 * Backslash, double-quote, and newline must be escaped.
 */
const escapeLabelValue = value => {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n");
};
/**
 * Escape special characters in HELP text.
 * Backslash and newline must be escaped.
 */
const escapeHelp = text => {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
};
/**
 * Format a numeric value for Prometheus output.
 * Handles special values like NaN and Infinity.
 */
const formatValue = value => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Number.isNaN(value)) {
    return "NaN";
  }
  if (value === Infinity) {
    return "+Inf";
  }
  if (value === -Infinity) {
    return "-Inf";
  }
  return value.toString();
};
/**
 * Format labels as a Prometheus label string.
 * Returns empty string if no labels, otherwise returns {label1="value1",label2="value2"}
 */
const formatLabels = (attributes, extraLabels) => {
  const labels = [];
  // Add metric attributes as labels
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      // Skip internal attributes like "unit" and "time_unit"
      if (key === "unit" || key === "time_unit") continue;
      labels.push(`${sanitizeLabelName(key)}="${escapeLabelValue(value)}"`);
    }
  }
  // Add extra labels (e.g., for histogram buckets, summary quantiles)
  if (extraLabels) {
    for (const [key, value] of extraLabels) {
      labels.push(`${sanitizeLabelName(key)}="${escapeLabelValue(value)}"`);
    }
  }
  return labels.length > 0 ? `{${labels.join(",")}}` : "";
};
/**
 * Map Effect metric type to Prometheus metric type string.
 */
const mapMetricType = type => {
  switch (type) {
    case "Counter":
      return "counter";
    case "Gauge":
      return "gauge";
    case "Histogram":
      return "histogram";
    case "Summary":
      return "summary";
    case "Frequency":
      return "counter";
  }
};
/**
 * Format a metric family (all metrics with the same name).
 */
const formatMetricFamily = (name, metrics, lines) => {
  const first = metrics[0];
  const prometheusType = mapMetricType(first.type);
  // HELP line (only if description exists)
  if (first.description) {
    lines.push(`# HELP ${name} ${escapeHelp(first.description)}`);
  }
  // TYPE line
  lines.push(`# TYPE ${name} ${prometheusType}`);
  // Data lines for each metric instance
  for (let i = 0; i < metrics.length; i++) {
    formatMetricData(name, metrics[i], lines);
  }
};
/**
 * Format data lines for a single metric snapshot.
 */
const formatMetricData = (name, metric, lines) => {
  switch (metric.type) {
    case "Counter":
      formatCounter(name, metric, lines);
      break;
    case "Gauge":
      formatGauge(name, metric, lines);
      break;
    case "Histogram":
      formatHistogram(name, metric, lines);
      break;
    case "Summary":
      formatSummary(name, metric, lines);
      break;
    case "Frequency":
      formatFrequency(name, metric, lines);
      break;
  }
};
/**
 * Format a Counter metric.
 */
const formatCounter = (name, metric, lines) => {
  const labels = formatLabels(metric.attributes);
  const value = formatValue(metric.state.count);
  lines.push(`${name}${labels} ${value}`);
};
/**
 * Format a Gauge metric.
 */
const formatGauge = (name, metric, lines) => {
  const labels = formatLabels(metric.attributes);
  const value = formatValue(metric.state.value);
  lines.push(`${name}${labels} ${value}`);
};
/**
 * Format a Histogram metric.
 * Produces _bucket, _sum, and _count lines.
 */
const formatHistogram = (name, metric, lines) => {
  const state = metric.state;
  // Format bucket lines
  // Effect buckets are [boundary, cumulativeCount] pairs
  for (let i = 0; i < state.buckets.length; i++) {
    const [boundary, cumulativeCount] = state.buckets[i];
    const bucketLabels = formatLabels(metric.attributes, [["le", boundary.toString()]]);
    lines.push(`${name}_bucket${bucketLabels} ${cumulativeCount}`);
  }
  // Add +Inf bucket (total count)
  const infLabels = formatLabels(metric.attributes, [["le", "+Inf"]]);
  lines.push(`${name}_bucket${infLabels} ${state.count}`);
  // Sum and count
  const baseLabels = formatLabels(metric.attributes);
  lines.push(`${name}_sum${baseLabels} ${formatValue(state.sum)}`);
  lines.push(`${name}_count${baseLabels} ${state.count}`);
};
/**
 * Format a Summary metric.
 * Produces quantile lines, _sum, and _count lines.
 */
const formatSummary = (name, metric, lines) => {
  const state = metric.state;
  // Format quantile lines
  for (let i = 0; i < state.quantiles.length; i++) {
    const [quantile, value] = state.quantiles[i];
    // Only output quantiles with defined values
    if (value !== undefined) {
      const quantileLabels = formatLabels(metric.attributes, [["quantile", quantile.toString()]]);
      lines.push(`${name}${quantileLabels} ${formatValue(value)}`);
    }
  }
  // Sum and count
  const baseLabels = formatLabels(metric.attributes);
  lines.push(`${name}_sum${baseLabels} ${formatValue(state.sum)}`);
  lines.push(`${name}_count${baseLabels} ${state.count}`);
};
/**
 * Format a Frequency metric as a counter with key labels.
 */
const formatFrequency = (name, metric, lines) => {
  const state = metric.state;
  // Each occurrence becomes a separate line with a "key" label
  for (const [key, count] of state.occurrences) {
    const labels = formatLabels(metric.attributes, [["key", key]]);
    lines.push(`${name}${labels} ${count}`);
  }
};
//# sourceMappingURL=PrometheusMetrics.js.map