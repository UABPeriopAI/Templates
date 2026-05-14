import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import type * as Headers from "../http/Headers.ts";
import type * as HttpClient from "../http/HttpClient.ts";
import type { Fixed64, KeyValue } from "./OtlpResource.ts";
import * as OtlpResource from "./OtlpResource.ts";
import { OtlpSerialization } from "./OtlpSerialization.ts";
/**
 * Determines how metric values relate to the time interval over which they
 * are aggregated.
 *
 * - `"cumulative"`: Reports total since a fixed start time. Each data point
 *   depends on all previous measurements. This is the default behavior.
 *
 * - `"delta"`: Reports changes since the last export. Each interval is
 *   independent with no dependency on previous measurements.
 *
 * @example
 * ```ts
 * import * as OtlpMetrics from "effect/unstable/observability/OtlpMetrics"
 *
 * // Use delta temporality for backends that prefer it (e.g., Datadog, Dynatrace)
 * const metricsLayer = OtlpMetrics.layer({
 *   url: "http://localhost:4318/v1/metrics",
 *   temporality: "delta"
 * })
 *
 * // Use cumulative temporality for backends like Prometheus
 * const cumulativeLayer = OtlpMetrics.layer({
 *   url: "http://localhost:4318/v1/metrics",
 *   temporality: "cumulative" // This is the default
 * })
 * ```
 *
 * @since 4.0.0
 * @category Models
 */
export type AggregationTemporality = "cumulative" | "delta";
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly url: string;
    readonly resource?: {
        readonly serviceName?: string | undefined;
        readonly serviceVersion?: string | undefined;
        readonly attributes?: Record<string, unknown>;
    } | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly exportInterval?: Duration.Input | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
    readonly temporality?: AggregationTemporality | undefined;
}) => Effect.Effect<void, never, HttpClient.HttpClient | OtlpSerialization | Scope.Scope>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: (options: {
    readonly url: string;
    readonly resource?: {
        readonly serviceName?: string | undefined;
        readonly serviceVersion?: string | undefined;
        readonly attributes?: Record<string, unknown>;
    } | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly exportInterval?: Duration.Input | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
    readonly temporality?: AggregationTemporality | undefined;
}) => Layer.Layer<never, never, HttpClient.HttpClient | OtlpSerialization>;
/**
 * @since 4.0.0
 */
export interface MetricsData {
    readonly resourceMetrics: ReadonlyArray<IResourceMetrics>;
}
/** Properties of an InstrumentationScope. */
interface IInstrumentationScope {
    /** InstrumentationScope name */
    name: string;
    /** InstrumentationScope version */
    version?: string;
    /** InstrumentationScope attributes */
    attributes?: Array<KeyValue>;
    /** InstrumentationScope droppedAttributesCount */
    droppedAttributesCount?: number;
}
/** Properties of a ResourceMetrics. */
interface IResourceMetrics {
    /** ResourceMetrics resource */
    resource: OtlpResource.Resource;
    /** ResourceMetrics scopeMetrics */
    scopeMetrics: Array<IScopeMetrics>;
    /** ResourceMetrics schemaUrl */
    schemaUrl?: string | undefined;
}
/** Properties of an IScopeMetrics. */
interface IScopeMetrics {
    /** ScopeMetrics scope */
    scope: IInstrumentationScope;
    /** ScopeMetrics metrics */
    metrics: Array<IMetric>;
    /** ScopeMetrics schemaUrl */
    schemaUrl?: string | undefined;
}
/** Properties of a Metric. */
interface IMetric {
    /** Metric name */
    name: string;
    /** Metric description */
    description?: string;
    /** Metric unit */
    unit?: string;
    /** Metric gauge */
    gauge?: IGauge;
    /** Metric sum */
    sum?: ISum;
    /** Metric histogram */
    histogram?: IHistogram;
    /** Metric exponentialHistogram */
    exponentialHistogram?: IExponentialHistogram;
    /** Metric summary */
    summary?: ISummary;
}
/** Properties of a Gauge. */
interface IGauge {
    /** Gauge dataPoints */
    dataPoints: Array<INumberDataPoint>;
}
/** Properties of a Sum. */
interface ISum {
    /** Sum dataPoints */
    dataPoints: Array<INumberDataPoint>;
    /** Sum aggregationTemporality */
    aggregationTemporality: EAggregationTemporality;
    /** Sum isMonotonic */
    isMonotonic: boolean;
}
/** Properties of a Histogram. */
interface IHistogram {
    /** Histogram dataPoints */
    dataPoints: Array<IHistogramDataPoint>;
    /** Histogram aggregationTemporality */
    aggregationTemporality?: EAggregationTemporality;
}
/** Properties of an ExponentialHistogram. */
interface IExponentialHistogram {
    /** ExponentialHistogram dataPoints */
    dataPoints: Array<IExponentialHistogramDataPoint>;
    /** ExponentialHistogram aggregationTemporality */
    aggregationTemporality?: EAggregationTemporality;
}
/** Properties of a Summary. */
interface ISummary {
    /** Summary dataPoints */
    dataPoints: Array<ISummaryDataPoint>;
}
/** Properties of a NumberDataPoint. */
interface INumberDataPoint {
    /** NumberDataPoint attributes */
    attributes: Array<KeyValue>;
    /** NumberDataPoint startTimeUnixNano */
    startTimeUnixNano?: Fixed64;
    /** NumberDataPoint timeUnixNano */
    timeUnixNano?: Fixed64;
    /** NumberDataPoint asDouble */
    asDouble?: number | null;
    /** NumberDataPoint asInt */
    asInt?: number;
    /** NumberDataPoint exemplars */
    exemplars?: Array<IExemplar>;
    /** NumberDataPoint flags */
    flags?: number;
}
/** Properties of a HistogramDataPoint. */
interface IHistogramDataPoint {
    /** HistogramDataPoint attributes */
    attributes?: Array<KeyValue>;
    /** HistogramDataPoint startTimeUnixNano */
    startTimeUnixNano?: Fixed64;
    /** HistogramDataPoint timeUnixNano */
    timeUnixNano?: Fixed64;
    /** HistogramDataPoint count */
    count?: number;
    /** HistogramDataPoint sum */
    sum?: number;
    /** HistogramDataPoint bucketCounts */
    bucketCounts?: Array<number>;
    /** HistogramDataPoint explicitBounds */
    explicitBounds?: Array<number>;
    /** HistogramDataPoint exemplars */
    exemplars?: Array<IExemplar>;
    /** HistogramDataPoint flags */
    flags?: number;
    /** HistogramDataPoint min */
    min?: number;
    /** HistogramDataPoint max */
    max?: number;
}
/** Properties of an ExponentialHistogramDataPoint. */
interface IExponentialHistogramDataPoint {
    /** ExponentialHistogramDataPoint attributes */
    attributes?: Array<KeyValue>;
    /** ExponentialHistogramDataPoint startTimeUnixNano */
    startTimeUnixNano?: Fixed64;
    /** ExponentialHistogramDataPoint timeUnixNano */
    timeUnixNano?: Fixed64;
    /** ExponentialHistogramDataPoint count */
    count?: number;
    /** ExponentialHistogramDataPoint sum */
    sum?: number;
    /** ExponentialHistogramDataPoint scale */
    scale?: number;
    /** ExponentialHistogramDataPoint zeroCount */
    zeroCount?: number;
    /** ExponentialHistogramDataPoint positive */
    positive?: IBuckets;
    /** ExponentialHistogramDataPoint negative */
    negative?: IBuckets;
    /** ExponentialHistogramDataPoint flags */
    flags?: number;
    /** ExponentialHistogramDataPoint exemplars */
    exemplars?: Array<IExemplar>;
    /** ExponentialHistogramDataPoint min */
    min?: number;
    /** ExponentialHistogramDataPoint max */
    max?: number;
}
/** Properties of a SummaryDataPoint. */
interface ISummaryDataPoint {
    /** SummaryDataPoint attributes */
    attributes?: Array<KeyValue>;
    /** SummaryDataPoint startTimeUnixNano */
    startTimeUnixNano?: number;
    /** SummaryDataPoint timeUnixNano */
    timeUnixNano?: string;
    /** SummaryDataPoint count */
    count?: number;
    /** SummaryDataPoint sum */
    sum?: number;
    /** SummaryDataPoint quantileValues */
    quantileValues?: Array<IValueAtQuantile>;
    /** SummaryDataPoint flags */
    flags?: number;
}
/** Properties of a ValueAtQuantile. */
interface IValueAtQuantile {
    /** ValueAtQuantile quantile */
    quantile?: number;
    /** ValueAtQuantile value */
    value?: number;
}
/** Properties of a Buckets. */
interface IBuckets {
    /** Buckets offset */
    offset?: number;
    /** Buckets bucketCounts */
    bucketCounts?: Array<number>;
}
/** Properties of an Exemplar. */
interface IExemplar {
    /** Exemplar filteredAttributes */
    filteredAttributes?: Array<KeyValue>;
    /** Exemplar timeUnixNano */
    timeUnixNano?: string;
    /** Exemplar asDouble */
    asDouble?: number;
    /** Exemplar asInt */
    asInt?: number;
    /** Exemplar spanId */
    spanId?: string | Uint8Array;
    /** Exemplar traceId */
    traceId?: string | Uint8Array;
}
/**
 * AggregationTemporality defines how a metric aggregator reports aggregated
 * values. It describes how those values relate to the time interval over
 * which they are aggregated.
 */
declare const EAggregationTemporality: {
    readonly AGGREGATION_TEMPORALITY_UNSPECIFIED: 0;
    /** DELTA is an AggregationTemporality for a metric aggregator which reports
      changes since last report time. Successive metrics contain aggregation of
      values from continuous and non-overlapping intervals.
  
      The values for a DELTA metric are based only on the time interval
      associated with one measurement cycle. There is no dependency on
      previous measurements like is the case for CUMULATIVE metrics.
  
      For example, consider a system measuring the number of requests that
      it receives and reports the sum of these requests every second as a
      DELTA metric:
  
      1. The system starts receiving at time=t_0.
      2. A request is received, the system measures 1 request.
      3. A request is received, the system measures 1 request.
      4. A request is received, the system measures 1 request.
      5. The 1 second collection cycle ends. A metric is exported for the
          number of requests received over the interval of time t_0 to
          t_0+1 with a value of 3.
      6. A request is received, the system measures 1 request.
      7. A request is received, the system measures 1 request.
      8. The 1 second collection cycle ends. A metric is exported for the
          number of requests received over the interval of time t_0+1 to
          t_0+2 with a value of 2. */
    readonly AGGREGATION_TEMPORALITY_DELTA: 1;
    /** CUMULATIVE is an AggregationTemporality for a metric aggregator which
      reports changes since a fixed start time. This means that current values
      of a CUMULATIVE metric depend on all previous measurements since the
      start time. Because of this, the sender is required to retain this state
      in some form. If this state is lost or invalidated, the CUMULATIVE metric
      values MUST be reset and a new fixed start time following the last
      reported measurement time sent MUST be used.
  
      For example, consider a system measuring the number of requests that
      it receives and reports the sum of these requests every second as a
      CUMULATIVE metric:
  
      1. The system starts receiving at time=t_0.
      2. A request is received, the system measures 1 request.
      3. A request is received, the system measures 1 request.
      4. A request is received, the system measures 1 request.
      5. The 1 second collection cycle ends. A metric is exported for the
          number of requests received over the interval of time t_0 to
          t_0+1 with a value of 3.
      6. A request is received, the system measures 1 request.
      7. A request is received, the system measures 1 request.
      8. The 1 second collection cycle ends. A metric is exported for the
          number of requests received over the interval of time t_0 to
          t_0+2 with a value of 5.
      9. The system experiences a fault and loses state.
      10. The system recovers and resumes receiving at time=t_1.
      11. A request is received, the system measures 1 request.
      12. The 1 second collection cycle ends. A metric is exported for the
          number of requests received over the interval of time t_1 to
          t_0+1 with a value of 1.
  
      Note: Even though, when reporting changes since last report time, using
      CUMULATIVE is valid, it is not recommended. This may cause problems for
      systems that do not use start_time to determine when the aggregation
      value was reset (e.g. Prometheus). */
    readonly AGGREGATION_TEMPORALITY_CUMULATIVE: 2;
};
type EAggregationTemporality = typeof EAggregationTemporality[keyof typeof EAggregationTemporality];
export {};
//# sourceMappingURL=OtlpMetrics.d.ts.map