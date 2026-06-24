/**
 * @since 2.0.0
 *
 * The `Metric` module provides a comprehensive system for collecting, aggregating, and observing
 * application metrics in Effect applications. It offers type-safe, concurrent metrics that can
 * be used to monitor performance, track business metrics, and gain insights into application behavior.
 *
 * ## Key Features
 *
 * - **Five Metric Types**: Counters, Gauges, Frequencies, Histograms, and Summaries
 * - **Type Safety**: Fully typed metrics with compile-time guarantees
 * - **Concurrency Safe**: Thread-safe metrics that work with Effect's concurrency model
 * - **Attributes**: Tag metrics with key-value attributes for filtering and grouping
 * - **Snapshots**: Take point-in-time snapshots of all metrics for reporting
 * - **Runtime Integration**: Automatic fiber runtime metrics collection
 *
 * ## Metric Types
 *
 * ### Counter
 * Tracks cumulative values that only increase or can be reset to zero.
 * Perfect for counting events, requests, errors, etc.
 *
 * ### Gauge
 * Represents a single numerical value that can go up or down.
 * Ideal for current resource usage, temperature, queue sizes, etc.
 *
 * ### Frequency
 * Counts occurrences of discrete string values.
 * Useful for tracking categorical data like HTTP status codes, user actions, etc.
 *
 * ### Histogram
 * Records observations in configurable buckets to analyze distribution.
 * Great for response times, request sizes, and other measured values.
 *
 * ### Summary
 * Calculates quantiles over a sliding time window.
 * Provides statistical insights into value distributions over time.
 *
 * ## Basic Usage
 *
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * // Create metrics
 * const requestCount = Metric.counter("http_requests_total", {
 *   description: "Total number of HTTP requests"
 * })
 *
 * const responseTime = Metric.histogram("http_response_time", {
 *   description: "HTTP response time in milliseconds",
 *   boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 20 })
 * })
 *
 * // Use metrics in your application
 * const handleRequest = Effect.gen(function*() {
 *   yield* Metric.update(requestCount, 1)
 *
 *   const startTime = yield* Effect.clockWith((clock) => clock.currentTimeMillis)
 *
 *   // Process request...
 *   yield* Effect.sleep("100 millis")
 *
 *   const endTime = yield* Effect.clockWith((clock) => clock.currentTimeMillis)
 *   yield* Metric.update(responseTime, endTime - startTime)
 * })
 * ```
 *
 * ## Attributes and Tagging
 *
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const requestCount = Metric.counter("requests", {
 *   description: "Number of requests by endpoint and method"
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Add attributes to metrics
 *   yield* Metric.update(
 *     Metric.withAttributes(requestCount, {
 *       endpoint: "/api/users",
 *       method: "GET"
 *     }),
 *     1
 *   )
 *
 *   // Or use withAttributes for compile-time attributes
 *   const taggedCounter = Metric.withAttributes(requestCount, {
 *     endpoint: "/api/posts",
 *     method: "POST"
 *   })
 *   yield* Metric.update(taggedCounter, 1)
 * })
 * ```
 *
 * ## Advanced Examples
 *
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * // Business metrics
 * const userSignups = Metric.counter("user_signups_total")
 * const activeUsers = Metric.gauge("active_users_current")
 * const featureUsage = Metric.frequency("feature_usage")
 *
 * // Performance metrics
 * const dbQueryTime = Metric.summary("db_query_duration", {
 *   maxAge: "5 minutes",
 *   maxSize: 1000,
 *   quantiles: [0.5, 0.9, 0.95, 0.99]
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Track user signup
 *   yield* Metric.update(userSignups, 1)
 *
 *   // Update active user count
 *   yield* Metric.update(activeUsers, 1250)
 *
 *   // Record feature usage
 *   yield* Metric.update(featureUsage, "dashboard_view")
 *
 *   // Measure database query time
 *   yield* Effect.timed(performDatabaseQuery).pipe(
 *     Effect.tap(([duration]) => Metric.update(dbQueryTime, duration))
 *   )
 * })
 *
 * // Get metric snapshots
 * const getMetrics = Effect.gen(function*() {
 *   const snapshots = yield* Metric.snapshot
 *
 *   for (const metric of snapshots) {
 *     console.log(`${metric.id}: ${JSON.stringify(metric.state)}`)
 *   }
 * })
 * ```
 */
import * as Arr from "./Array.js";
import * as Context from "./Context.js";
import * as Duration from "./Duration.js";
import { constUndefined, dual } from "./Function.js";
import * as InternalEffect from "./internal/effect.js";
import * as InternalMetric from "./internal/metric.js";
import * as Layer from "./Layer.js";
import * as Order from "./Order.js";
import { pipeArguments } from "./Pipeable.js";
import * as Predicate from "./Predicate.js";
import * as _String from "./String.js";
/**
 * Service key for the current metric attributes context.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class AttributesKeyError extends Data.TaggedError("AttributesKeyError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // The key is used internally by the Effect runtime to manage metric attributes
 *   const key = Metric.CurrentMetricAttributesKey
 *
 *   // Create metrics with base attributes
 *   const requestCounter = Metric.counter("requests_total", {
 *     description: "Total HTTP requests"
 *   })
 *
 *   // The CurrentMetricAttributes service provides default attributes
 *   // that get applied to all metrics in the current context
 *   const baseAttributes = { service: "api", version: "1.0" }
 *
 *   // Use withAttributes to apply attributes to metrics
 *   const taggedCounter1 = Metric.withAttributes(requestCounter, baseAttributes)
 *   const program1 = Metric.update(taggedCounter1, 1)
 *
 *   const taggedCounter2 = Metric.withAttributes(requestCounter, {
 *     ...baseAttributes,
 *     endpoint: "/users"
 *   })
 *   const program2 = Metric.update(taggedCounter2, 5)
 *
 *   yield* program1
 *   yield* program2
 *
 *   return {
 *     keyValue: key, // "effect/Metric/CurrentMetricAttributes"
 *     keyType: typeof key, // "string"
 *     isConstant: key === "effect/Metric/CurrentMetricAttributes" // true
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category References
 */
export const CurrentMetricAttributesKey = "effect/Metric/CurrentMetricAttributes";
/**
 * Service class for managing the current metric attributes context.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class AttributesError extends Data.TaggedError("AttributesError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Access current metric attributes
 *   const attributes = yield* Metric.CurrentMetricAttributes
 *   console.log("Current attributes:", attributes)
 *
 *   // Set new attributes context
 *   const newAttributes = { service: "api", version: "1.0" }
 *   const result = yield* Effect.provideService(
 *     Effect.gen(function*() {
 *       const updatedAttributes = yield* Metric.CurrentMetricAttributes
 *       return updatedAttributes
 *     }),
 *     Metric.CurrentMetricAttributes,
 *     newAttributes
 *   )
 *
 *   return result
 * })
 * ```
 *
 * @since 4.0.0
 * @category References
 */
export const CurrentMetricAttributes = /*#__PURE__*/Context.Reference(CurrentMetricAttributesKey, {
  defaultValue: () => ({})
});
const MetricRegistryKey = "~effect/observability/Metric/MetricRegistryKey";
/**
 * Service class for accessing the current metric registry.
 *
 * @since 4.0.0
 * @category References
 */
export const MetricRegistry = /*#__PURE__*/Context.Reference(MetricRegistryKey, {
  defaultValue: () => new Map()
});
const TypeId = "~effect/observability/Metric";
class Metric$ {
  [TypeId] = TypeId;
  #metadataCache = /*#__PURE__*/new WeakMap();
  #metadata;
  id;
  description;
  attributes;
  constructor(id, description, attributes) {
    this.id = id;
    this.description = description;
    this.attributes = attributes;
  }
  valueUnsafe(context) {
    return this.hook(context).get(context);
  }
  modifyUnsafe(input, context) {
    return this.hook(context).modify(input, context);
  }
  updateUnsafe(input, context) {
    return this.hook(context).update(input, context);
  }
  hook(context) {
    const extraAttributes = Context.get(context, CurrentMetricAttributes);
    if (Object.keys(extraAttributes).length === 0) {
      if (Predicate.isNotUndefined(this.#metadata)) {
        return this.#metadata.hooks;
      }
      this.#metadata = this.getOrCreate(context, this.attributes);
      return this.#metadata.hooks;
    }
    const mergedAttributes = mergeAttributes(this.attributes, extraAttributes);
    let metadata = this.#metadataCache.get(mergedAttributes);
    if (Predicate.isNotUndefined(metadata)) {
      return metadata.hooks;
    }
    metadata = this.getOrCreate(context, mergedAttributes);
    this.#metadataCache.set(mergedAttributes, metadata);
    return metadata.hooks;
  }
  getOrCreate(context, attributes) {
    const key = makeKey(this, attributes);
    const registry = Context.get(context, MetricRegistry);
    if (registry.has(key)) {
      return registry.get(key);
    }
    const hooks = this.createHooks();
    const meta = {
      id: this.id,
      type: this.type,
      description: this.description,
      attributes: attributesToRecord(attributes),
      hooks
    };
    registry.set(key, meta);
    return meta;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
const bigint0 = /*#__PURE__*/BigInt(0);
class CounterMetric extends Metric$ {
  type = "Counter";
  #bigint;
  #incremental;
  constructor(id, options) {
    super(id, options?.description, attributesToRecord(options?.attributes));
    this.#bigint = options?.bigint ?? false;
    this.#incremental = options?.incremental ?? false;
  }
  createHooks() {
    let count = this.#bigint ? bigint0 : 0;
    const canUpdate = this.#incremental ? this.#bigint ? value => value >= bigint0 : value => value >= 0 : _value => true;
    const update = value => {
      if (canUpdate(value)) {
        count = count + value;
      }
    };
    return makeHooks(() => ({
      count,
      incremental: this.#incremental
    }), update);
  }
}
class GaugeMetric extends Metric$ {
  type = "Gauge";
  #bigint;
  constructor(id, options) {
    super(id, options?.description, attributesToRecord(options?.attributes));
    this.#bigint = options?.bigint ?? false;
  }
  createHooks() {
    let value = this.#bigint ? BigInt(0) : 0;
    const update = input => {
      value = input;
    };
    const modify = input => {
      value = value + input;
    };
    return makeHooks(() => ({
      value
    }), update, modify);
  }
}
class FrequencyMetric extends Metric$ {
  type = "Frequency";
  #preregisteredWords;
  constructor(id, options) {
    super(id, options?.description, attributesToRecord(options?.attributes));
    this.#preregisteredWords = options?.preregisteredWords;
  }
  createHooks() {
    const occurrences = new Map();
    if (Predicate.isNotUndefined(this.#preregisteredWords)) {
      for (const word of this.#preregisteredWords) {
        occurrences.set(word, 0);
      }
    }
    const update = word => {
      const count = occurrences.get(word) ?? 0;
      occurrences.set(word, count + 1);
    };
    return makeHooks(() => ({
      occurrences
    }), update);
  }
}
class HistogramMetric extends Metric$ {
  type = "Histogram";
  #boundaries;
  constructor(id, options) {
    super(id, options?.description, attributesToRecord(options?.attributes));
    this.#boundaries = options.boundaries;
  }
  createHooks() {
    const bounds = this.#boundaries;
    const size = bounds.length;
    const values = new Uint32Array(size + 1);
    const boundaries = new Float64Array(size);
    let count = 0;
    let sum = 0;
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    Arr.map(Arr.sort(bounds, Order.Number), (n, i) => {
      boundaries[i] = n;
    });
    // Insert the value into the right bucket with a binary search
    const update = value => {
      let from = 0;
      let to = size;
      while (from !== to) {
        const mid = Math.floor(from + (to - from) / 2);
        const boundary = boundaries[mid];
        if (value <= boundary) {
          to = mid;
        } else {
          from = mid;
        }
        // The special case when to / from have a distance of one
        if (to === from + 1) {
          if (value <= boundaries[from]) {
            to = from;
          } else {
            from = to;
          }
        }
      }
      values[from] = values[from] + 1;
      count = count + 1;
      sum = sum + value;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    };
    const getBuckets = () => {
      const builder = Arr.allocate(size);
      let cumulated = 0;
      for (let i = 0; i < size; i++) {
        const boundary = boundaries[i];
        const value = values[i];
        cumulated = cumulated + value;
        builder[i] = [boundary, cumulated];
      }
      return builder;
    };
    return makeHooks(() => ({
      buckets: getBuckets(),
      count,
      min,
      max,
      sum
    }), update);
  }
}
class SummaryMetric extends Metric$ {
  type = "Summary";
  #maxAge;
  #maxSize;
  #quantiles;
  constructor(id, options) {
    super(id, options?.description, attributesToRecord(options?.attributes));
    this.#maxAge = Math.max(Duration.toMillis(Duration.fromInputUnsafe(options.maxAge)), 0);
    this.#maxSize = options.maxSize;
    this.#quantiles = options.quantiles;
  }
  createHooks() {
    const sortedQuantiles = Arr.sort(this.#quantiles, Order.Number);
    const observations = Arr.allocate(this.#maxSize);
    for (const quantile of this.#quantiles) {
      if (quantile < 0 || quantile > 1) {
        throw new Error(`Quantile must be between 0 and 1, found: ${quantile}`);
      }
    }
    let head = 0;
    let count = 0;
    let sum = 0;
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    const snapshot = now => {
      const builder = [];
      let i = 0;
      while (i < this.#maxSize) {
        const observation = observations[i];
        if (Predicate.isNotUndefined(observation)) {
          const [timestamp, value] = observation;
          const age = now - timestamp;
          if (age >= 0 && age <= this.#maxAge) {
            builder.push(value);
          }
        }
        i = i + 1;
      }
      const samples = Arr.sort(builder, Order.Number);
      const sampleSize = samples.length;
      if (sampleSize === 0) {
        return sortedQuantiles.map(q => [q, undefined]);
      }
      // Compute the value of the quantile in terms of rank:
      // > For a given quantile `q`, return the maximum value `v` such that at
      // > most `q * n` values are less than or equal to `v`.
      return sortedQuantiles.map(q => {
        if (q <= 0) return [q, samples[0]];
        if (q >= 1) return [q, samples[sampleSize - 1]];
        const index = Math.ceil(q * sampleSize) - 1;
        return [q, samples[index]];
      });
    };
    const observe = (value, timestamp) => {
      if (this.#maxSize > 0) {
        const target = head % this.#maxSize;
        observations[target] = [timestamp, value];
        head = head + 1;
      }
      count = count + 1;
      sum = sum + value;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    };
    const get = context => {
      const clock = Context.get(context, InternalEffect.ClockRef);
      const quantiles = snapshot(clock.currentTimeMillisUnsafe());
      return {
        quantiles,
        count,
        min,
        max,
        sum
      };
    };
    const update = ([value, timestamp]) => observe(value, timestamp);
    return makeHooks(get, update);
  }
}
class MetricTransform extends Metric$ {
  type;
  metric;
  valueUnsafe;
  updateUnsafe;
  modifyUnsafe;
  constructor(metric, valueUnsafe, updateUnsafe, modifyUnsafe) {
    super(metric.id, metric.description, metric.attributes);
    this.metric = metric;
    this.valueUnsafe = valueUnsafe;
    this.updateUnsafe = updateUnsafe;
    this.modifyUnsafe = modifyUnsafe;
    this.type = metric.type;
  }
  createHooks() {
    return this.metric.createHooks();
  }
}
/**
 * Returns `true` if the specified value is a `Metric`, otherwise returns `false`.
 *
 * This function is useful for runtime type checking and ensuring that a value
 * conforms to the Metric interface before performing metric operations.
 *
 * @example
 * ```ts
 * import { Metric } from "effect"
 *
 * const counter = Metric.counter("requests")
 * const gauge = Metric.gauge("temperature")
 * const notAMetric = { name: "fake-metric" }
 *
 * console.log(Metric.isMetric(counter)) // true
 * console.log(Metric.isMetric(gauge)) // true
 * console.log(Metric.isMetric(notAMetric)) // false
 * console.log(Metric.isMetric(null)) // false
 * ```
 *
 * @since 4.0.0
 * @category Guards
 */
export const isMetric = u => Predicate.hasProperty(u, "~effect/Metric") && u["~effect/Metric"] === "~effect/Metric";
/**
 * Represents a Counter metric that tracks cumulative numerical values over
 * time. Counters can be incremented and decremented and provide a running total
 * of changes.
 *
 * **Options**
 *
 * - `description` - A description of the `Counter`.
 * - `attributes`  - The attributes to associate with the `Counter`.
 * - `bigint`      - Indicates if the `Counter` should use the `bigint` type.
 * - `incremental` - Set to `true` to create a `Counter` that can only ever be
 *                   incremented.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class CounterError extends Data.TaggedError("CounterError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a basic counter for tracking requests
 *   const requestCounter = Metric.counter("http_requests_total", {
 *     description: "Total number of HTTP requests processed"
 *   })
 *
 *   // Create an incremental-only counter for events
 *   const eventCounter = Metric.counter("events_processed", {
 *     description: "Events processed (increment only)",
 *     incremental: true
 *   })
 *
 *   // Create a bigint counter for large values
 *   const bytesCounter = Metric.counter("bytes_transferred", {
 *     description: "Total bytes transferred",
 *     bigint: true,
 *     attributes: { service: "file-transfer" }
 *   })
 *
 *   // Update counters with values
 *   yield* Metric.update(requestCounter, 1) // Increment by 1
 *   yield* Metric.update(requestCounter, 5) // Increment by 5 (total: 6)
 *   yield* Metric.update(eventCounter, 1) // Increment by 1
 *   yield* Metric.update(bytesCounter, 1024n) // Add 1024 bytes
 *
 *   // Get current counter values
 *   const requestValue = yield* Metric.value(requestCounter)
 *   const eventValue = yield* Metric.value(eventCounter)
 *   const bytesValue = yield* Metric.value(bytesCounter)
 *
 *   return { requestValue, eventValue, bytesValue }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const counter = (name, options) => new CounterMetric(name, options);
/**
 * Represents a `Gauge` metric that tracks and reports a single numerical value
 * at a specific moment.
 *
 * Gauges are most suitable for metrics that represent instantaneous values,
 * such as memory usage or CPU load.
 *
 * **Options**
 *
 * - `description` - A description of the `Gauge`.
 * - `attributes`  - The attributes to associate with the `Gauge`.
 * - `bigint`      - Indicates if the `Gauge` should use the `bigint` type.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class GaugeError extends Data.TaggedError("GaugeError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a gauge for tracking memory usage
 *   const memoryGauge = Metric.gauge("memory_usage_mb", {
 *     description: "Current memory usage in megabytes"
 *   })
 *
 *   // Create a gauge for CPU utilization
 *   const cpuGauge = Metric.gauge("cpu_utilization", {
 *     description: "Current CPU utilization percentage",
 *     attributes: { host: "server-01" }
 *   })
 *
 *   // Create a bigint gauge for large values
 *   const diskSpaceGauge = Metric.gauge("disk_free_bytes", {
 *     description: "Free disk space in bytes",
 *     bigint: true
 *   })
 *
 *   // Set gauge values (replaces current value)
 *   yield* Metric.update(memoryGauge, 512) // Set to 512 MB
 *   yield* Metric.update(cpuGauge, 85.5) // Set to 85.5%
 *   yield* Metric.update(diskSpaceGauge, 1024000000n) // Set to ~1GB
 *
 *   // Modify gauge values (adds to current value)
 *   yield* Metric.modify(memoryGauge, 128) // Increase by 128 MB (total: 640)
 *   yield* Metric.modify(cpuGauge, -10.5) // Decrease by 10.5% (total: 75%)
 *
 *   // Update with new absolute values
 *   yield* Metric.update(memoryGauge, 800) // Set to 800 MB (replaces 640)
 *
 *   // Get current gauge values
 *   const memoryValue = yield* Metric.value(memoryGauge)
 *   const cpuValue = yield* Metric.value(cpuGauge)
 *   const diskValue = yield* Metric.value(diskSpaceGauge)
 *
 *   return { memoryValue, cpuValue, diskValue }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const gauge = (name, options) => new GaugeMetric(name, options);
/**
 * Creates a `Frequency` metric which can be used to count the number of
 * occurrences of a string.
 *
 * Frequency metrics are most suitable for counting the number of times a
 * specific event or incident occurs.
 *
 * **Options**
 *
 * - `description` - A description of the `Frequency`.
 * - `attributes`  - The attributes to associate with the `Frequency`.
 * - `preregisteredWords` - Occurrences which are pre-registered with the
 *                          `Frequency` metric occurrences.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class FrequencyError extends Data.TaggedError("FrequencyError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a frequency metric for HTTP status codes
 *   const statusFrequency = Metric.frequency("http_status_codes", {
 *     description: "Frequency of HTTP response status codes",
 *     preregisteredWords: ["200", "404", "500"] // Pre-register common codes
 *   })
 *
 *   // Create a frequency metric for user actions
 *   const userActionFrequency = Metric.frequency("user_actions", {
 *     description: "Frequency of user actions performed",
 *     attributes: { application: "web-app" }
 *   })
 *
 *   // Create a frequency metric for error types
 *   const errorTypeFrequency = Metric.frequency("error_types", {
 *     description: "Frequency of different error types"
 *   })
 *
 *   // Record different occurrences
 *   yield* Metric.update(statusFrequency, "200") // Success response
 *   yield* Metric.update(statusFrequency, "200") // Another success
 *   yield* Metric.update(statusFrequency, "404") // Not found error
 *   yield* Metric.update(statusFrequency, "500") // Server error
 *   yield* Metric.update(statusFrequency, "200") // Another success
 *
 *   yield* Metric.update(userActionFrequency, "login")
 *   yield* Metric.update(userActionFrequency, "view_dashboard")
 *   yield* Metric.update(userActionFrequency, "login")
 *   yield* Metric.update(userActionFrequency, "logout")
 *
 *   yield* Metric.update(errorTypeFrequency, "ValidationError")
 *   yield* Metric.update(errorTypeFrequency, "NetworkError")
 *   yield* Metric.update(errorTypeFrequency, "ValidationError")
 *
 *   // Get frequency counts
 *   const statusCounts = yield* Metric.value(statusFrequency)
 *   const actionCounts = yield* Metric.value(userActionFrequency)
 *   const errorCounts = yield* Metric.value(errorTypeFrequency)
 *
 *   // statusCounts.occurrences will be:
 *   // Map { "200" => 3, "404" => 1, "500" => 1 }
 *   // actionCounts.occurrences will be:
 *   // Map { "login" => 2, "view_dashboard" => 1, "logout" => 1 }
 *   // errorCounts.occurrences will be:
 *   // Map { "ValidationError" => 2, "NetworkError" => 1 }
 *
 *   return { statusCounts, actionCounts, errorCounts }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const frequency = (name, options) => new FrequencyMetric(name, options);
/**
 * Represents a `Histogram` metric that records observations into buckets.
 *
 * Histogram metrics are most suitable for measuring the distribution of values
 * within a range.
 *
 * **Options**
 *
 * - `description` - A description of the `Histogram`.
 * - `attributes`  - The attributes to associate with the `Histogram`.
 * - `boundaries`  - The bucket boundaries of the `Histogram`
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class HistogramError extends Data.TaggedError("HistogramError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a histogram for API response times
 *   const responseTimeHistogram = Metric.histogram("api_response_time", {
 *     description: "Distribution of API response times in milliseconds",
 *     boundaries: Metric.linearBoundaries({ start: 0, width: 50, count: 10 })
 *     // Creates buckets: 0-50ms, 50-100ms, 100-150ms, ..., 400-450ms, 450ms+
 *   })
 *
 *   // Create a histogram for request payload sizes
 *   const payloadSizeHistogram = Metric.histogram("payload_size", {
 *     description: "Distribution of request payload sizes in KB",
 *     boundaries: Metric.exponentialBoundaries({ start: 1, factor: 2, count: 8 }),
 *     // Creates exponential buckets: 1KB, 2KB, 4KB, 8KB, 16KB, 32KB, 64KB, 128KB+
 *     attributes: { service: "api-gateway" }
 *   })
 *
 *   // Create a histogram with custom boundaries
 *   const customHistogram = Metric.histogram("custom_metric", {
 *     description: "Custom distribution metric",
 *     boundaries: [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100]
 *   })
 *
 *   // Record various response times
 *   yield* Metric.update(responseTimeHistogram, 25) // Goes in 0-50ms bucket
 *   yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 125) // Goes in 100-150ms bucket
 *   yield* Metric.update(responseTimeHistogram, 200) // Goes in 150-200ms bucket
 *   yield* Metric.update(responseTimeHistogram, 75) // Another 50-100ms
 *
 *   // Record payload sizes
 *   yield* Metric.update(payloadSizeHistogram, 3) // Goes in 2-4KB bucket
 *   yield* Metric.update(payloadSizeHistogram, 15) // Goes in 8-16KB bucket
 *   yield* Metric.update(payloadSizeHistogram, 0.5) // Goes in 0-1KB bucket
 *
 *   // Get histogram state with distribution data
 *   const responseTimeState = yield* Metric.value(responseTimeHistogram)
 *   const payloadSizeState = yield* Metric.value(payloadSizeHistogram)
 *
 *   // responseTimeState will contain:
 *   // - buckets: [[50, 1], [100, 3], [150, 4], [200, 5], ...]
 *   // - count: 5, min: 25, max: 200, sum: 500
 *   // - Useful for calculating percentiles, averages, etc.
 *
 *   return { responseTimeState, payloadSizeState }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const histogram = (name, options) => new HistogramMetric(name, options);
/**
 * Creates a `Summary` metric that records observations and calculates quantiles
 * which takes a value as input and uses the current time.
 *
 * Summary metrics are most suitable for providing statistical information about
 * a set of values, including quantiles.
 *
 * **Options**
 *
 * - `description` - An description of the `Summary`.
 * - `attributes`  - The attributes to associate with the `Summary`.
 * - `maxAge`      - The maximum age of observations to retain.
 * - `maxSize`     - The maximum number of observations to keep.
 * - `quantiles`   - An array of quantiles to calculate (e.g., [0.5, 0.9]).
 *
 * @example
 * ```ts
 * import { Data, Duration, Effect, Metric } from "effect"
 *
 * class SummaryError extends Data.TaggedError("SummaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a summary for API response times
 *   const responseTimeSummary = Metric.summary("api_response_time", {
 *     description: "API response time quantiles over 5-minute windows",
 *     maxAge: Duration.minutes(5), // Keep observations for 5 minutes
 *     maxSize: 1000, // Maximum 1000 observations in memory
 *     quantiles: [0.5, 0.9, 0.95, 0.99] // 50th, 90th, 95th, 99th percentiles
 *   })
 *
 *   // Create a summary for request payload sizes
 *   const payloadSizeSummary = Metric.summary("request_payload_size", {
 *     description: "Request payload size distribution over 2-minute windows",
 *     maxAge: Duration.minutes(2), // Shorter window for recent trends
 *     maxSize: 500, // Smaller buffer for memory efficiency
 *     quantiles: [0.5, 0.75, 0.9], // Median, 75th, 90th percentiles
 *     attributes: { service: "upload-service" }
 *   })
 *
 *   // Simulate recording various response times over time
 *   for (let i = 0; i < 20; i++) {
 *     const responseTime = 50 + Math.random() * 200 // 50-250ms
 *     yield* Metric.update(responseTimeSummary, responseTime)
 *
 *     // Wait a bit to simulate different timestamps
 *     yield* Effect.sleep(Duration.millis(100))
 *   }
 *
 *   // Record some payload sizes
 *   yield* Metric.update(payloadSizeSummary, 1.2) // 1.2KB
 *   yield* Metric.update(payloadSizeSummary, 5.8) // 5.8KB
 *   yield* Metric.update(payloadSizeSummary, 15.6) // 15.6KB
 *   yield* Metric.update(payloadSizeSummary, 3.4) // 3.4KB
 *
 *   // Get summary statistics with quantiles
 *   const responseStats = yield* Metric.value(responseTimeSummary)
 *   const payloadStats = yield* Metric.value(payloadSizeSummary)
 *
 *   // responseStats will contain:
 *   // - quantiles: [[0.5, Some(125)], [0.9, Some(220)], [0.95, Some(235)], [0.99, Some(245)]]
 *   // - count: 20, min: ~50, max: ~250, sum: ~2500
 *   // - Only observations from the last 5 minutes are included
 *
 *   // payloadStats will contain quantile information for recent payload sizes
 *   // Older observations automatically age out based on maxAge setting
 *
 *   return { responseStats, payloadStats }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const summary = (name, options) => mapInput(summaryWithTimestamp(name, options), (input, context) => [input, Context.get(context, InternalEffect.ClockRef).currentTimeMillisUnsafe()]);
/**
 * Creates a `Summary` metric that records observations and calculates quantiles
 * which takes a value and the current timestamp as input.
 *
 * Summary metrics are most suitable for providing statistical information about
 * a set of values, including quantiles.
 *
 * **Options**
 *
 * - `description` - An description of the `Summary`.
 * - `attributes`  - The attributes to associate with the `Summary`.
 * - `maxAge`      - The maximum age of observations to retain.
 * - `maxSize`     - The maximum number of observations to keep.
 * - `quantiles`   - An array of quantiles to calculate (e.g., [0.5, 0.9]).
 *
 * @example
 * ```ts
 * import { Metric } from "effect"
 *
 * const responseTimesSummary = Metric.summaryWithTimestamp(
 *   "response_times_summary",
 *   {
 *     description: "Measures the distribution of response times",
 *     maxAge: "60 seconds", // Retain observations for 60 seconds.
 *     maxSize: 1000, // Keep a maximum of 1000 observations.
 *     quantiles: [0.5, 0.9, 0.99] // Calculate 50th, 90th, and 99th quantiles.
 *   }
 * )
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const summaryWithTimestamp = (name, options) => new SummaryMetric(name, options);
/**
 * Creates a timer metric, based on a `Histogram`, which keeps track of
 * durations in milliseconds.
 *
 * The unit of time will automatically be added to the metric as a tag (i.e.
 * `"time_unit: milliseconds"`).
 *
 * If `options.boundaries` is not provided, the boundaries will be computed
 * using `Metric.exponentialBoundaries({ start: 0.5, factor: 2, count: 35 })`.
 *
 * @example
 * ```ts
 * import { Data, Duration, Effect, Metric } from "effect"
 *
 * class TimerError extends Data.TaggedError("TimerError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a timer metric to track API request durations
 * const apiRequestTimer = Metric.timer("api_request_duration", {
 *   description: "Duration of API requests",
 *   attributes: { service: "user-api" }
 * })
 *
 * // Simulate an API operation and measure its duration
 * const apiOperation = Effect.gen(function*() {
 *   const start = Date.now()
 *   yield* Effect.sleep(Duration.millis(100)) // Simulate work
 *   const duration = Duration.millis(Date.now() - start)
 *
 *   // Update the timer with the measured duration
 *   yield* Metric.update(apiRequestTimer, duration)
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const timer = (name, options) => {
  const boundaries = Predicate.isNotUndefined(options?.boundaries) ? options.boundaries : exponentialBoundaries({
    start: 0.5,
    factor: 2,
    count: 35
  });
  const attributes = mergeAttributes(options?.attributes, {
    time_unit: "milliseconds"
  });
  const metric = new HistogramMetric(name, {
    ...options,
    boundaries,
    attributes
  });
  return mapInput(metric, Duration.toMillis);
};
/**
 * Retrieves the current state of the specified `Metric`.
 *
 * This function returns an Effect that, when executed, will provide the current
 * aggregated state of the metric. The state type depends on the metric type:
 * - Counter: `{ count: number | bigint }`
 * - Gauge: `{ value: number | bigint }`
 * - Frequency: `{ occurrences: Map<string, number> }`
 * - Histogram: `{ buckets: Array<[number, number]>, count: number, min: number, max: number, sum: number }`
 * - Summary: `{ quantiles: Array<[number, number | undefined]>, count: number, min: number, max: number, sum: number }`
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const requestCounter = Metric.counter("requests")
 * const responseTime = Metric.histogram("response_time", {
 *   boundaries: [100, 500, 1000, 2000]
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Update metrics
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 750)
 *
 *   // Get current values
 *   const counterState = yield* Metric.value(requestCounter)
 *   console.log(`Request count: ${counterState.count}`)
 *
 *   const histogramState = yield* Metric.value(responseTime)
 *   console.log(`Response time stats:`, {
 *     count: histogramState.count,
 *     min: histogramState.min,
 *     max: histogramState.max,
 *     average: histogramState.sum / histogramState.count
 *   })
 * })
 * ```
 *
 * @since 2.0.0
 * @category Utilities
 */
export const value = self => InternalEffect.flatMap(InternalEffect.context(), context => InternalEffect.sync(() => self.valueUnsafe(context)));
/**
 * Modifies the metric with the specified input.
 *
 * The behavior of `modify` depends on the metric type:
 * - **Counter**: Adds the input value to the current count
 * - **Gauge**: Adds the input value to the current gauge value
 * - **Frequency**: Same as `update` - increments the occurrence count for the input string
 * - **Histogram**: Same as `update` - records the input value in the appropriate bucket
 * - **Summary**: Same as `update` - records the input observation
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const temperatureGauge = Metric.gauge("temperature")
 * const requestCounter = Metric.counter("requests")
 *
 * const program = Effect.gen(function*() {
 *   // Set initial temperature
 *   yield* Metric.update(temperatureGauge, 20)
 *
 *   // Modify by adding/subtracting values
 *   yield* Metric.modify(temperatureGauge, 5) // Now 25
 *   yield* Metric.modify(temperatureGauge, -3) // Now 22
 *
 *   // For counters, modify increments by the specified amount
 *   yield* Metric.modify(requestCounter, 10) // Add 10 to counter
 *   yield* Metric.modify(requestCounter, 5) // Add 5 more (total: 15)
 *
 *   const temp = yield* Metric.value(temperatureGauge)
 *   const requests = yield* Metric.value(requestCounter)
 *
 *   console.log(`Temperature: ${temp.value}°C`) // 22°C
 *   console.log(`Requests: ${requests.count}`) // 15
 * })
 * ```
 *
 * @since 2.0.0
 * @category Utilities
 */
export const modify = /*#__PURE__*/dual(2, (self, input) => InternalEffect.flatMap(InternalEffect.context(), context => InternalEffect.sync(() => self.modifyUnsafe(input, context))));
/**
 * Updates the metric with the specified input.
 *
 * The behavior of `update` depends on the metric type:
 * - **Counter**: Adds the input value to the current count (same as `modify`)
 * - **Gauge**: Sets the gauge to the specified value (replaces current value)
 * - **Frequency**: Increments the occurrence count for the input string by 1
 * - **Histogram**: Records the input value in the appropriate bucket
 * - **Summary**: Records the input value as a new observation
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const cpuUsage = Metric.gauge("cpu_usage_percent")
 * const httpStatus = Metric.frequency("http_status_codes")
 * const responseTime = Metric.histogram("response_time_ms", {
 *   boundaries: [100, 500, 1000, 2000]
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Update gauge to specific values
 *   yield* Metric.update(cpuUsage, 45.2)
 *   yield* Metric.update(cpuUsage, 67.8) // Replaces previous value
 *
 *   // Track HTTP status code occurrences
 *   yield* Metric.update(httpStatus, "200")
 *   yield* Metric.update(httpStatus, "404")
 *   yield* Metric.update(httpStatus, "200") // Increments 200 count
 *
 *   // Record response times
 *   yield* Metric.update(responseTime, 250)
 *   yield* Metric.update(responseTime, 750)
 *   yield* Metric.update(responseTime, 1500)
 *
 *   // Check current states
 *   const cpu = yield* Metric.value(cpuUsage)
 *   const statuses = yield* Metric.value(httpStatus)
 *   const times = yield* Metric.value(responseTime)
 *
 *   console.log(`CPU Usage: ${cpu.value}%`)
 *   console.log(`Status 200 count: ${statuses.occurrences.get("200")}`) // 2
 *   console.log(`Response time samples: ${times.count}`) // 3
 * })
 * ```
 *
 * @since 2.0.0
 * @category Utilities
 */
export const update = /*#__PURE__*/dual(2, (self, input) => InternalEffect.contextWith(services => InternalEffect.sync(() => self.updateUnsafe(input, services))));
/**
 * Returns a new metric that is powered by this one, but which accepts updates
 * of the specified new type, which must be transformable to the input type of
 * this metric.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricError extends Data.TaggedError("MetricError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a histogram that expects Duration values
 * const durationHistogram = Metric.histogram("request_duration_ms", {
 *   description: "Request duration in milliseconds",
 *   boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 10 })
 * })
 *
 * // Transform to accept number values representing milliseconds
 * const numberHistogram = Metric.mapInput(
 *   durationHistogram,
 *   (ms: number) => ms // Direct mapping from number to expected input
 * )
 *
 * const program = Effect.gen(function*() {
 *   // Now we can update with a plain number
 *   yield* Metric.update(numberHistogram, 250)
 *
 *   // Get metric value to see the recorded state
 *   const value = yield* Metric.value(numberHistogram)
 *   return value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Mapping
 */
export const mapInput = /*#__PURE__*/dual(2, (self, f) => new MetricTransform(self, context => self.valueUnsafe(context), (input, context) => self.updateUnsafe(f(input, context), context), (input, context) => self.modifyUnsafe(f(input, context), context)));
/**
 * Returns a new metric that is powered by this one, but which accepts updates
 * of any type, and translates them to updates with the specified constant
 * update value.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricError extends Data.TaggedError("MetricError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a counter that normally expects a number increment
 * const requestCounter = Metric.counter("total_requests", {
 *   description: "Total number of requests processed"
 * })
 *
 * // Create a version that always increments by 1, regardless of input
 * const simpleRequestCounter = Metric.withConstantInput(requestCounter, 1)
 *
 * const program = Effect.gen(function*() {
 *   // These all increment the counter by 1, ignoring the input value
 *   yield* Metric.update(simpleRequestCounter, "any string")
 *   yield* Metric.update(simpleRequestCounter, { complex: "object" })
 *   yield* Metric.update(simpleRequestCounter, 999) // Still increments by 1
 *
 *   const value = yield* Metric.value(simpleRequestCounter)
 *   return value // Counter state will show count: 3
 * })
 * ```
 *
 * @since 2.0.0
 * @category Input
 */
export const withConstantInput = /*#__PURE__*/dual(2, (self, input) => mapInput(self, () => input));
/**
 * Returns a new metric that applies the specified attributes to all operations.
 *
 * Attributes are key-value pairs that provide additional context for metrics,
 * enabling filtering, grouping, and more detailed analysis. Each combination
 * of attribute values creates a separate metric series.
 *
 * @example
 * ```ts
 * import { Effect, Metric } from "effect"
 *
 * const requestCounter = Metric.counter("http_requests_total", {
 *   description: "Total HTTP requests"
 * })
 *
 * // Create tagged versions of the metric
 * const getRequests = Metric.withAttributes(requestCounter, {
 *   method: "GET",
 *   endpoint: "/api/users"
 * })
 *
 * const postRequests = Metric.withAttributes(requestCounter, {
 *   method: "POST",
 *   endpoint: "/api/users"
 * })
 *
 * const program = Effect.gen(function*() {
 *   // These will be tracked as separate metric series
 *   yield* Metric.update(getRequests, 1) // http_requests_total{method="GET", endpoint="/api/users"}
 *   yield* Metric.update(postRequests, 1) // http_requests_total{method="POST", endpoint="/api/users"}
 *   yield* Metric.update(getRequests, 1) // Increments the GET counter
 *
 *   // You can also chain attributes
 *   const taggedMetric = requestCounter.pipe(
 *     Metric.withAttributes({ service: "user-api" }),
 *     Metric.withAttributes({ version: "v1" })
 *   )
 *
 *   yield* Metric.update(taggedMetric, 1) // http_requests_total{service="user-api", version="v1"}
 * })
 *
 * // When taking snapshots, each attribute combination appears as a separate metric
 * const viewMetrics = Effect.gen(function*() {
 *   const snapshots = yield* Metric.snapshot
 *   for (const metric of snapshots) {
 *     if (metric.id === "http_requests_total") {
 *       console.log(`${metric.id}`, metric.attributes, metric.state)
 *     }
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category Attributes
 */
export const withAttributes = /*#__PURE__*/dual(2, (self, attributes) => new MetricTransform(self, context => self.valueUnsafe(addAttributesToContext(context, attributes)), (input, context) => self.updateUnsafe(input, addAttributesToContext(context, attributes)), (input, context) => self.modifyUnsafe(input, addAttributesToContext(context, attributes))));
// Metric Snapshots
/**
 * Captures a snapshot of all registered metrics in the current context.
 *
 * Returns an array of metric snapshots, each containing the metric's metadata
 * (name, description, type) and current state (values, counts, etc.).
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Metric } from "effect"
 *
 * class SnapshotError extends Data.TaggedError("SnapshotError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create and update some metrics
 *   const requestCounter = Metric.counter("http_requests", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.histogram("response_time_ms", {
 *     description: "Response time in milliseconds",
 *     boundaries: Metric.linearBoundaries({ start: 0, width: 100, count: 5 })
 *   })
 *
 *   // Update the metrics with some values
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 150)
 *   yield* Metric.update(responseTime, 75)
 *
 *   // Take a snapshot of all metrics
 *   const snapshots = yield* Metric.snapshot
 *
 *   // Examine the snapshots
 *   for (const snapshot of snapshots) {
 *     yield* Console.log(`Metric: ${snapshot.id}`)
 *     yield* Console.log(`Description: ${snapshot.description}`)
 *     yield* Console.log(`Type: ${snapshot.type}`)
 *     yield* Console.log(`State:`, snapshot.state)
 *   }
 *
 *   return snapshots
 * })
 * ```
 *
 * @since 2.0.0
 * @category Snapshotting
 */
export const snapshot = /*#__PURE__*/InternalEffect.map(/*#__PURE__*/InternalEffect.context(), context => snapshotUnsafe(context));
/**
 * Returns a human-readable string representation of all currently registered
 * metrics in a tabular format.
 *
 * This debugging utility captures a snapshot of all metrics and formats them
 * in an easy-to-read table showing names, descriptions, types, attributes,
 * and current state values.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Metric } from "effect"
 *
 * class DumpError extends Data.TaggedError("DumpError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create and update some metrics for demonstration
 *   const requestCounter = Metric.counter("http_requests_total", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.gauge("response_time_ms", {
 *     description: "Current response time in milliseconds"
 *   })
 *   const statusFreq = Metric.frequency("http_status_codes", {
 *     description: "Frequency of HTTP status codes"
 *   })
 *
 *   // Update metrics with some values
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 125)
 *   yield* Metric.update(statusFreq, "200")
 *   yield* Metric.update(statusFreq, "404")
 *   yield* Metric.update(statusFreq, "200")
 *
 *   // Get formatted dump of all metrics
 *   const metricsReport = yield* Metric.dump
 *   yield* Console.log("Current Metrics:")
 *   yield* Console.log(metricsReport)
 *
 *   // Output will look like a formatted table:
 *   // Name                  Description                           Type       State
 *   // http_requests_total   Total HTTP requests                   Counter    [count: 2]
 *   // response_time_ms      Current response time in milliseconds Gauge      [value: 125]
 *   // http_status_codes     Frequency of HTTP status codes       Frequency  [occurrences: 200 -> 2, 404 -> 1]
 *
 *   return metricsReport
 * })
 * ```
 *
 * @since 2.0.0
 * @category Debugging
 */
export const dump = /*#__PURE__*/InternalEffect.flatMap(/*#__PURE__*/InternalEffect.context(), context => {
  const metrics = snapshotUnsafe(context);
  if (metrics.length > 0) {
    const maxNameLength = metrics.reduce((max, metric) => {
      const length = metric.id.length;
      return length > max ? length : max;
    }, 0) + 2;
    const maxDescriptionLength = metrics.reduce((max, metric) => {
      const length = Predicate.isNotUndefined(metric.description) ? metric.description.length : 0;
      return length > max ? length : max;
    }, 0) + 2;
    const maxTypeLength = metrics.reduce((max, metric) => {
      const length = metric.type.length;
      return length > max ? length : max;
    }, 0) + 2;
    const maxAttributesLength = metrics.reduce((max, metric) => {
      const length = Predicate.isNotUndefined(metric.attributes) ? attributesToString(metric.attributes).length : 0;
      return length > max ? length : max;
    }, 0) + 2;
    const grouped = Object.entries(Arr.groupBy(metrics, metric => metric.id));
    const sorted = Arr.sortWith(grouped, entry => entry[0], _String.Order);
    const rendered = sorted.map(([, group]) => group.map(metric => renderName(metric, maxNameLength) + renderDescription(metric, maxDescriptionLength) + renderType(metric, maxTypeLength) + renderAttributes(metric, maxAttributesLength) + renderState(metric)).join("\n")).join("\n");
    return InternalEffect.succeed(rendered);
  }
  return InternalEffect.succeed("");
});
/**
 * Synchronously captures a snapshot of all registered metrics using the provided
 * service context.
 *
 * This is the "unsafe" version that bypasses Effect's safety guarantees and requires
 * manual handling of the services context. Use the safe `snapshot` function for normal
 * application code.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class UnsafeSnapshotError extends Data.TaggedError("UnsafeSnapshotError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Use unsafeSnapshot in performance-critical scenarios or internal implementations
 * const performanceMetricsExporter = Effect.gen(function*() {
 *   // Create some metrics first
 *   const requestCounter = Metric.counter("http_requests", {
 *     description: "Total HTTP requests"
 *   })
 *   const responseTime = Metric.gauge("response_time_ms", {
 *     description: "Current response time"
 *   })
 *
 *   // Update metrics
 *   yield* Metric.update(requestCounter, 1)
 *   yield* Metric.update(responseTime, 150)
 *
 *   // Get services context for unsafe operations
 *   const services = yield* Effect.context()
 *
 *   // Use snapshotUnsafe for direct, synchronous access
 *   const snapshots = Metric.snapshotUnsafe(services)
 *
 *   // Process snapshots immediately (useful for exporters, debugging tools)
 *   const exportData = snapshots.map((snapshot) => ({
 *     name: snapshot.id,
 *     type: snapshot.type,
 *     value: snapshot.state,
 *     timestamp: Date.now()
 *   }))
 *
 *   // This is synchronous and doesn't involve Effect overhead
 *   // Useful for performance-critical metric export operations
 *   return exportData
 * })
 *
 * // For normal application use, prefer the safe snapshot function:
 * const safeSnapshotExample = Effect.gen(function*() {
 *   // This automatically handles the services context
 *   const snapshots = yield* Metric.snapshot
 *   return snapshots
 * })
 * ```
 *
 * @since 2.0.0
 * @category Snapshotting
 */
export const snapshotUnsafe = context => {
  const registry = Context.get(context, MetricRegistry);
  return Array.from(registry.values()).map(({
    hooks,
    ...meta
  }) => ({
    ...meta,
    state: hooks.get(context)
  }));
};
const renderName = (metric, padTo) => `name=${metric.id.padEnd(padTo, " ")}`;
const renderDescription = (metric, padTo) => `description=${(metric.description ?? "").padEnd(padTo, " ")}`;
const renderType = (metric, padTo) => `type=${metric.type.padEnd(padTo, " ")}`;
const renderAttributes = (metric, padTo) => {
  const attrs = attributesToString(metric.attributes ?? {});
  const padding = " ".repeat(Math.max(0, padTo - attrs.length));
  return `${attrs}${padding}`;
};
const renderState = metric => {
  const prefix = "state=";
  switch (metric.type) {
    case "Counter":
      {
        const state = metric.state;
        return `${prefix}[count: [${state.count}]]`;
      }
    case "Frequency":
      {
        const state = metric.state;
        return `${prefix}[occurrences: ${renderKeyValues(state.occurrences)}]`;
      }
    case "Gauge":
      {
        const state = metric.state;
        return `${prefix}[value: [${state.value}]]`;
      }
    case "Histogram":
      {
        const state = metric.state;
        const buckets = `buckets: [${renderKeyValues(state.buckets)}]`;
        const count = `count: [${state.count}]`;
        const min = `min: [${state.min}]`;
        const max = `max: [${state.max}]`;
        const sum = `sum: [${state.sum}]`;
        return `${prefix}[${buckets}, ${count}, ${min}, ${max}, ${sum}]`;
      }
    case "Summary":
      {
        const state = metric.state;
        const printableQuantiles = state.quantiles.map(([key, value]) => [key, value ?? 0]);
        const quantiles = `quantiles: [${renderKeyValues(printableQuantiles)}]`;
        const count = `count: [${state.count}]`;
        const min = `min: [${state.min}]`;
        const max = `max: [${state.max}]`;
        const sum = `sum: [${state.sum}]`;
        return `${prefix}[${quantiles}, ${count}, ${min}, ${max}, ${sum}]`;
      }
  }
};
const renderKeyValues = keyValues => Array.from(keyValues).map(([key, value]) => `(${key} -> ${value})`).join(", ");
const attributesToString = attributes => {
  const attrs = Object.entries(attributes);
  const sorted = Arr.sortWith(attrs, attr => attr[0], _String.Order);
  return `attributes=[${sorted.map(([key, value]) => `${key}: ${value}`).join(", ")}]`;
};
// Metric Boundaries
/**
 * A helper method to create histogram bucket boundaries from an iterable set
 * of values.
 *
 * Processes any iterable of numbers by removing duplicates, filtering out
 * non-positive values, and automatically appending positive infinity as the
 * final boundary.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create boundaries from an array of custom values
 * const customBoundaries = Metric.boundariesFromIterable([
 *   10,
 *   25,
 *   50,
 *   100,
 *   250,
 *   500,
 *   1000
 * ])
 * console.log(customBoundaries) // [10, 25, 50, 100, 250, 500, 1000, Infinity]
 *
 * // Automatically removes duplicates and negative values
 * const messyBoundaries = Metric.boundariesFromIterable([
 *   -5,
 *   0,
 *   10,
 *   10,
 *   25,
 *   25,
 *   50,
 *   -1
 * ])
 * console.log(messyBoundaries) // [10, 25, 50, Infinity]
 *
 * // Works with any iterable (Set, generator functions, etc.)
 * const setBoundaries = Metric.boundariesFromIterable(
 *   new Set([100, 200, 300, 200, 100])
 * )
 * console.log(setBoundaries) // [100, 200, 300, Infinity]
 *
 * // Use with histogram metric
 * const responseTimeHistogram = Metric.histogram("response_times", {
 *   description: "API response time distribution",
 *   boundaries: customBoundaries
 * })
 *
 * const program = Effect.gen(function*() {
 *   yield* Metric.update(responseTimeHistogram, 75) // Goes in 50-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 150) // Goes in 100-250ms bucket
 *
 *   const value = yield* Metric.value(responseTimeHistogram)
 *   return value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Boundaries
 */
export const boundariesFromIterable = iterable => Arr.append(Arr.filter(new Set(iterable), n => n > 0), Number.POSITIVE_INFINITY);
/**
 * A helper method to create histogram bucket boundaries with linearly
 * increasing values.
 *
 * Creates evenly-spaced boundaries starting from a base value and incrementing
 * by a fixed width. Automatically adds positive infinity as the final boundary.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create boundaries for response time histogram
 * // Buckets: 0-100ms, 100-200ms, 200-300ms, 300-400ms, 400ms+
 * const responseBoundaries = Metric.linearBoundaries({
 *   start: 0, // Starting point
 *   width: 100, // 100ms intervals
 *   count: 5 // Creates 4 boundaries + infinity
 * })
 * console.log(responseBoundaries) // [100, 200, 300, 400, Infinity]
 *
 * // Create a histogram using these boundaries
 * const responseTimeHistogram = Metric.histogram("api_response_time", {
 *   description: "API response time distribution",
 *   boundaries: responseBoundaries
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Record some response times
 *   yield* Metric.update(responseTimeHistogram, 85) // Goes in 0-100ms bucket
 *   yield* Metric.update(responseTimeHistogram, 250) // Goes in 200-300ms bucket
 *   yield* Metric.update(responseTimeHistogram, 450) // Goes in 400ms+ bucket
 *
 *   const value = yield* Metric.value(responseTimeHistogram)
 *   return value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Boundaries
 */
export const linearBoundaries = options => boundariesFromIterable(Arr.makeBy(options.count - 1, n => options.start + n + options.width));
/**
 * A helper method to create histogram bucket boundaries with exponentially
 * increasing values.
 *
 * Creates boundaries that grow exponentially, useful for metrics that span
 * multiple orders of magnitude. Each boundary is calculated as start * factor^i.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class BoundaryError extends Data.TaggedError("BoundaryError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create exponential boundaries for request size histogram
 * // Buckets: 0-1KB, 1-2KB, 2-4KB, 4-8KB, 8KB+
 * const sizeBoundaries = Metric.exponentialBoundaries({
 *   start: 1, // Starting at 1KB
 *   factor: 2, // Each boundary doubles the previous
 *   count: 5 // Creates 4 boundaries + infinity
 * })
 * console.log(sizeBoundaries) // [1, 2, 4, 8, Infinity]
 *
 * // Create a histogram for tracking request payload sizes
 * const requestSizeHistogram = Metric.histogram("request_size_kb", {
 *   description: "Request payload size distribution in KB",
 *   boundaries: sizeBoundaries
 * })
 *
 * // For very wide ranges, use larger factors
 * const latencyBoundaries = Metric.exponentialBoundaries({
 *   start: 0.1, // Start at 0.1ms
 *   factor: 10, // Each boundary is 10x larger
 *   count: 6 // Creates ranges: 0.1ms, 1ms, 10ms, 100ms, 1000ms+
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Record different request sizes
 *   yield* Metric.update(requestSizeHistogram, 1.5) // Goes in 1-2KB bucket
 *   yield* Metric.update(requestSizeHistogram, 3.2) // Goes in 2-4KB bucket
 *   yield* Metric.update(requestSizeHistogram, 12) // Goes in 8KB+ bucket
 *
 *   const value = yield* Metric.value(requestSizeHistogram)
 *   return value
 * })
 * ```
 *
 * @since 2.0.0
 * @category Boundaries
 */
export const exponentialBoundaries = options => boundariesFromIterable(Arr.makeBy(options.count - 1, i => options.start * Math.pow(options.factor, i)));
// Fiber Runtime Metrics
const fibersActive = /*#__PURE__*/gauge("child_fibers_active", {
  description: "The current count of active child fibers"
});
const fibersStarted = /*#__PURE__*/counter("child_fibers_started", {
  description: "The total number of child fibers that have been started",
  incremental: true
});
const fiberSuccesses = /*#__PURE__*/counter("child_fiber_successes", {
  description: "The total number of child fibers that have succeeded",
  incremental: true
});
const fiberFailures = /*#__PURE__*/counter("child_fiber_failures", {
  description: "The total number of child fibers that have failed",
  incremental: true
});
/**
 * Service key for the fiber runtime metrics service.
 *
 * @example
 * ```ts
 * import { Data, Effect, Layer, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // The key is used internally by the Effect runtime to manage fiber metrics
 *   const key = Metric.FiberRuntimeMetricsKey
 *   console.log("Fiber metrics key:", key)
 *
 *   // Enable runtime metrics using the key
 *   const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(
 *     Metric.FiberRuntimeMetricsImpl
 *   )
 *
 *   return yield* Effect.gen(function*() {
 *     // This Effect will have fiber metrics automatically collected
 *     yield* Effect.sleep("100 millis")
 *
 *     // Create a test counter to demonstrate the key usage
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 1)
 *     return yield* Metric.value(testCounter)
 *   }).pipe(Effect.provide(layer))
 * })
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const FiberRuntimeMetricsKey = InternalMetric.FiberRuntimeMetricsKey;
/**
 * Service class for managing fiber runtime metrics collection.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Access the fiber runtime metrics service
 *   const metricsService = yield* Metric.FiberRuntimeMetrics
 *
 *   if (metricsService) {
 *     console.log("Runtime metrics are enabled")
 *   } else {
 *     console.log("Runtime metrics are disabled")
 *   }
 *
 *   // Enable runtime metrics for the application
 *   const enabledLayer = Metric.enableRuntimeMetricsLayer
 *
 *   return yield* Effect.gen(function*() {
 *     // Create some concurrent fibers to see metrics in action
 *     yield* Effect.all([
 *       Effect.sleep("100 millis"),
 *       Effect.sleep("200 millis"),
 *       Effect.sleep("300 millis")
 *     ], { concurrency: "unbounded" })
 *
 *     // Create test metrics to demonstrate the service
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 5)
 *     const counterValue = yield* Metric.value(testCounter)
 *
 *     return { counterValue, metricsEnabled: true }
 *   }).pipe(Effect.provide(enabledLayer))
 * })
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const FiberRuntimeMetrics = /*#__PURE__*/Context.Reference(InternalMetric.FiberRuntimeMetricsKey, {
  defaultValue: constUndefined
});
/**
 * Default implementation of the fiber runtime metrics service.
 *
 * @example
 * ```ts
 * import { Data, Effect, Layer, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Use the default metrics implementation
 *   const metrics = Metric.FiberRuntimeMetricsImpl
 *   console.log("Metrics implementation:", metrics)
 *
 *   // Enable runtime metrics using the default implementation
 *   const layer = Layer.succeed(Metric.FiberRuntimeMetrics)(metrics)
 *
 *   return yield* Effect.gen(function*() {
 *     // Run some Effects to trigger metric collection
 *     yield* Effect.forkChild(Effect.sleep("50 millis"))
 *     yield* Effect.forkChild(Effect.sleep("100 millis"))
 *
 *     // Wait a bit and check the metrics
 *     yield* Effect.sleep("200 millis")
 *
 *     // Create test metrics to demonstrate the implementation
 *     const testCounter = Metric.counter("test_counter")
 *     const testGauge = Metric.gauge("test_gauge")
 *     yield* Metric.update(testCounter, 3)
 *     yield* Metric.update(testGauge, 42)
 *
 *     const counterValue = yield* Metric.value(testCounter)
 *     const gaugeValue = yield* Metric.value(testGauge)
 *
 *     return { counter: counterValue, gauge: gaugeValue }
 *   }).pipe(Effect.provide(layer))
 * })
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const FiberRuntimeMetricsImpl = {
  recordFiberStart(context) {
    fibersStarted.updateUnsafe(1, context);
    fibersActive.modifyUnsafe(1, context);
  },
  recordFiberEnd(context, exit) {
    fibersActive.modifyUnsafe(-1, context);
    if (InternalEffect.exitIsSuccess(exit)) {
      fiberSuccesses.updateUnsafe(1, context);
    } else {
      fiberFailures.updateUnsafe(1, context);
    }
  }
};
/**
 * A Layer that enables automatic collection of fiber runtime metrics across
 * an entire Effect application.
 *
 * Unlike the function version which wraps individual Effects, this layer provides
 * runtime metrics collection to all Effects in the application context. This is
 * the recommended approach for production applications that need comprehensive
 * fiber monitoring.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 *
 * class AppError extends Data.TaggedError("AppError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Define your application logic
 * const userService = Effect.gen(function*() {
 *   // Simulate user operations with concurrent processing
 *   const fetchUser = (id: number) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep(`${50 + id * 10} millis`)
 *       if (id % 7 === 0) {
 *         return yield* new AppError({ operation: `fetch-user-${id}` })
 *       }
 *       return { id, name: `User ${id}`, email: `user${id}@example.com` }
 *     })
 *
 *   // Process multiple users concurrently (ignoring failures for demo)
 *   const userIds = Array.from({ length: 10 }, (_, i) => i + 1)
 *   const userTasks = userIds.map((id) =>
 *     fetchUser(id).pipe(Effect.catchTag("AppError", () => Effect.succeed(null)))
 *   )
 *   const allUsers = yield* Effect.all(userTasks, { concurrency: 4 })
 *   const successfulUsers = allUsers.filter((user) => user !== null)
 *   return successfulUsers
 * })
 *
 * const analyticsService = Effect.gen(function*() {
 *   // Simulate analytics processing
 *   const tasks = Array.from({ length: 8 }, (_, i) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep(`${100 + i * 25} millis`)
 *       return `Analytics task ${i} completed`
 *     }))
 *   return yield* Effect.all(tasks, { concurrency: 3 })
 * })
 *
 * // Main application that uses multiple services
 * const application = Effect.gen(function*() {
 *   yield* Console.log("Starting application with runtime metrics...")
 *
 *   // Run services concurrently
 *   const [users, analytics] = yield* Effect.all([
 *     userService,
 *     analyticsService
 *   ], { concurrency: 2 })
 *
 *   yield* Console.log(
 *     `Processed ${users.length} users and ${analytics.length} analytics tasks`
 *   )
 *
 *   // Inspect the automatically collected runtime metrics
 *   const metrics = yield* Metric.snapshot
 *   const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))
 *
 *   yield* Console.log("Runtime Metrics Collected:")
 *   for (const metric of runtimeMetrics) {
 *     yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)
 *   }
 *
 *   return { users, analytics, metricsCount: runtimeMetrics.length }
 * })
 *
 * // Create the base application layer
 * const AppLayer = Layer.empty // Add your application layers here (database, HTTP, etc.)
 *
 * // Add runtime metrics layer at the end
 * const AppLayerWithMetrics = AppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 *
 * // Run the application with runtime metrics enabled
 * const program = application.pipe(
 *   Effect.provide(AppLayerWithMetrics)
 * )
 *
 * // Alternative: Provide runtime metrics directly to the application
 * const programWithDirectMetrics = application.pipe(
 *   Effect.provide(Metric.enableRuntimeMetricsLayer)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const enableRuntimeMetricsLayer = /*#__PURE__*/Layer.succeed(FiberRuntimeMetrics)(FiberRuntimeMetricsImpl);
/**
 * A Layer that disables automatic collection of fiber runtime metrics.
 *
 * @example
 * ```ts
 * import { Data, Effect, Metric } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Disable runtime metrics collection
 *   const disabledLayer = Metric.disableRuntimeMetricsLayer
 *
 *   return yield* Effect.gen(function*() {
 *     // Check that metrics service is disabled
 *     const metricsService = yield* Metric.FiberRuntimeMetrics
 *     console.log("Metrics enabled:", metricsService !== undefined) // false
 *
 *     // Run some Effects - no metrics will be collected
 *     yield* Effect.forkChild(Effect.sleep("50 millis"))
 *     yield* Effect.forkChild(Effect.sleep("100 millis"))
 *     yield* Effect.sleep("200 millis")
 *
 *     // Create test metrics to show they still work
 *     const testCounter = Metric.counter("test_counter")
 *     yield* Metric.update(testCounter, 1)
 *     const counterValue = yield* Metric.value(testCounter)
 *
 *     return { counterValue, metricsEnabled: metricsService !== undefined }
 *   }).pipe(Effect.provide(disabledLayer))
 * })
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const disableRuntimeMetricsLayer = /*#__PURE__*/Layer.succeed(FiberRuntimeMetrics)(undefined);
/**
 * Enables automatic collection of fiber runtime metrics for the provided Effect.
 *
 * When enabled, automatically tracks fiber lifecycle metrics including active fibers,
 * started fibers, successful completions, and failures. These metrics provide valuable
 * insights into the concurrency patterns and health of your Effect application.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 *
 * class RuntimeMetricsError extends Data.TaggedError("RuntimeMetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a concurrent workload to demonstrate fiber metrics
 *   const heavyWorkload = Effect.gen(function*() {
 *     // Simulate concurrent operations
 *     const tasks = Array.from({ length: 10 }, (_, i) =>
 *       Effect.gen(function*() {
 *         yield* Effect.sleep(`${100 + i * 50} millis`)
 *         if (i % 4 === 0) {
 *           // Simulate some failures
 *           return yield* new RuntimeMetricsError({ operation: `task-${i}` })
 *         }
 *         return `Task ${i} completed`
 *       }).pipe(
 *         Effect.catchTag("RuntimeMetricsError", () =>
 *           Effect.succeed(`Task ${i} failed`))
 *       ))
 *
 *     // Run tasks concurrently
 *     const results = yield* Effect.all(tasks, { concurrency: 5 })
 *     return results
 *   })
 *
 *   // Enable runtime metrics collection for our workload
 *   const workloadWithMetrics = Metric.enableRuntimeMetrics(heavyWorkload)
 *
 *   // Execute the workload
 *   const results = yield* workloadWithMetrics
 *
 *   // After execution, we can inspect the runtime metrics
 *   // The following metrics are automatically collected:
 *   // - child_fibers_active: Current number of active child fibers (Gauge)
 *   // - child_fibers_started: Total child fibers started (Counter, incremental)
 *   // - child_fiber_successes: Total successful child fibers (Counter, incremental)
 *   // - child_fiber_failures: Total failed child fibers (Counter, incremental)
 *
 *   yield* Console.log(`Workload completed with ${results.length} results`)
 *
 *   // Get all metrics including the runtime metrics
 *   const allMetrics = yield* Metric.snapshot
 *   const runtimeMetrics = allMetrics.filter((m) =>
 *     m.id.startsWith("child_fiber") || m.id.includes("fiber")
 *   )
 *
 *   yield* Console.log("Runtime Metrics:")
 *   for (const metric of runtimeMetrics) {
 *     yield* Console.log(`  ${metric.id}: ${JSON.stringify(metric.state)}`)
 *   }
 *
 *   return results
 * })
 *
 * // Alternative: Use the layer version for broader application coverage
 * const BaseAppLayer = Layer.empty // Your base application layers
 * const AppLayerWithMetrics = BaseAppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 * const programWithLayer = program.pipe(
 *   Effect.provide(AppLayerWithMetrics)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const enableRuntimeMetrics = /*#__PURE__*/InternalEffect.provideService(FiberRuntimeMetrics, FiberRuntimeMetricsImpl);
/**
 * Disables automatic collection of fiber runtime metrics for the provided Effect.
 *
 * This is useful when you want to selectively disable runtime metrics for specific
 * parts of your application while keeping them enabled elsewhere, or when you need
 * to avoid the overhead of metrics collection in performance-critical sections.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Layer, Metric } from "effect"
 *
 * class DisableMetricsError extends Data.TaggedError("DisableMetricsError")<{
 *   readonly operation: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // This section will have runtime metrics enabled
 *   const normalOperation = Effect.gen(function*() {
 *     const tasks = Array.from({ length: 5 }, (_, i) =>
 *       Effect.gen(function*() {
 *         yield* Effect.sleep(`${100 + i * 20} millis`)
 *         return `Normal task ${i} completed`
 *       }))
 *     return yield* Effect.all(tasks, { concurrency: 3 })
 *   })
 *
 *   // This section will have runtime metrics disabled for performance
 *   const highPerformanceOperation = Metric.disableRuntimeMetrics(
 *     Effect.gen(function*() {
 *       // Performance-critical code where metrics overhead should be avoided
 *       const hotPath = Array.from(
 *         { length: 1000 },
 *         (_, i) =>
 *           Effect.gen(function*() {
 *             // Simulate intensive computation
 *             const result = i * i + Math.random()
 *             return result
 *           })
 *       )
 *       return yield* Effect.all(hotPath, { concurrency: 100 })
 *     })
 *   )
 *
 *   yield* Console.log("Running operations with selective metrics...")
 *
 *   // Run both operations
 *   const [normalResults, performanceResults] = yield* Effect.all([
 *     normalOperation, // Will generate fiber metrics
 *     highPerformanceOperation // Will NOT generate fiber metrics
 *   ])
 *
 *   // Check collected metrics - should only see metrics from normalOperation
 *   const metrics = yield* Metric.snapshot
 *   const runtimeMetrics = metrics.filter((m) => m.id.startsWith("child_fiber"))
 *
 *   yield* Console.log(`Normal operation results: ${normalResults.length}`)
 *   yield* Console.log(
 *     `Performance operation results: ${performanceResults.length}`
 *   )
 *   yield* Console.log(`Runtime metrics collected: ${runtimeMetrics.length}`)
 *
 *   // The runtime metrics will only reflect the fibers from normalOperation
 *   // The highPerformanceOperation fibers were not tracked due to disableRuntimeMetrics
 *
 *   return { normalResults, performanceResults, runtimeMetrics }
 * })
 *
 * // Enable runtime metrics globally, then selectively disable where needed
 * const BaseAppLayer = Layer.empty // Your base application layers
 * const AppLayerWithMetrics = BaseAppLayer.pipe(
 *   Layer.provide(Metric.enableRuntimeMetricsLayer)
 * )
 * const finalProgram = program.pipe(
 *   Effect.provide(AppLayerWithMetrics)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Runtime Metrics
 */
export const disableRuntimeMetrics = /*#__PURE__*/InternalEffect.provideService(FiberRuntimeMetrics, undefined);
// Utilities
function makeKey(metric, attributes) {
  let key = `${metric.type}:${metric.id}`;
  if (Predicate.isNotUndefined(metric.description)) {
    key += `:${metric.description}`;
  }
  if (Predicate.isNotUndefined(attributes)) {
    key += `:${serializeAttributes(attributes)}`;
  }
  return key;
}
function makeHooks(get, update, modify) {
  return {
    get,
    update,
    modify: modify ?? update
  };
}
function serializeAttributes(attributes) {
  return serializeEntries(Array.isArray(attributes) ? attributes : Object.entries(attributes));
}
function serializeEntries(entries) {
  return entries.map(([key, value]) => `${key}=${value}`).join(",");
}
function mergeAttributes(self, other) {
  return {
    ...attributesToRecord(self),
    ...attributesToRecord(other)
  };
}
function attributesToRecord(attributes) {
  if (Predicate.isNotUndefined(attributes) && Array.isArray(attributes)) {
    return attributes.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
  return attributes;
}
function addAttributesToContext(context, attributes) {
  const current = Context.get(context, CurrentMetricAttributes);
  const updated = mergeAttributes(current, attributes);
  return Context.add(context, CurrentMetricAttributes, updated);
}
//# sourceMappingURL=Metric.js.map