/**
 * @since 4.0.0
 */
import type * as Duration from "../../Duration.ts";
import * as Layer from "../../Layer.ts";
import type * as Tracer from "../../Tracer.ts";
import type * as Headers from "../http/Headers.ts";
import type * as HttpClient from "../http/HttpClient.ts";
import type { AggregationTemporality } from "./OtlpMetrics.ts";
import * as OtlpSerialization from "./OtlpSerialization.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: (options: {
    readonly baseUrl: string;
    readonly resource?: {
        readonly serviceName?: string | undefined;
        readonly serviceVersion?: string | undefined;
        readonly attributes?: Record<string, unknown>;
    } | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly maxBatchSize?: number | undefined;
    readonly tracerContext?: (<X>(primitive: Tracer.EffectPrimitive<X>, span: Tracer.AnySpan) => X) | undefined;
    readonly loggerExportInterval?: Duration.Input | undefined;
    readonly loggerExcludeLogSpans?: boolean | undefined;
    readonly loggerMergeWithExisting?: boolean | undefined;
    readonly metricsExportInterval?: Duration.Input | undefined;
    readonly metricsTemporality?: AggregationTemporality | undefined;
    readonly tracerExportInterval?: Duration.Input | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
}) => Layer.Layer<never, never, HttpClient.HttpClient | OtlpSerialization.OtlpSerialization>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerJson: (options: {
    readonly baseUrl: string;
    readonly resource?: {
        readonly serviceName?: string | undefined;
        readonly serviceVersion?: string | undefined;
        readonly attributes?: Record<string, unknown>;
    } | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly maxBatchSize?: number | undefined;
    readonly tracerContext?: (<X>(primitive: Tracer.EffectPrimitive<X>, span: Tracer.AnySpan) => X) | undefined;
    readonly loggerExportInterval?: Duration.Input | undefined;
    readonly loggerExcludeLogSpans?: boolean | undefined;
    readonly loggerMergeWithExisting?: boolean | undefined;
    readonly metricsExportInterval?: Duration.Input | undefined;
    readonly metricsTemporality?: AggregationTemporality | undefined;
    readonly tracerExportInterval?: Duration.Input | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
}) => Layer.Layer<never, never, HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerProtobuf: (options: {
    readonly baseUrl: string;
    readonly resource?: {
        readonly serviceName?: string | undefined;
        readonly serviceVersion?: string | undefined;
        readonly attributes?: Record<string, unknown>;
    } | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly maxBatchSize?: number | undefined;
    readonly tracerContext?: (<X>(primitive: Tracer.EffectPrimitive<X>, span: Tracer.AnySpan) => X) | undefined;
    readonly loggerExportInterval?: Duration.Input | undefined;
    readonly loggerExcludeLogSpans?: boolean | undefined;
    readonly loggerMergeWithExisting?: boolean | undefined;
    readonly metricsExportInterval?: Duration.Input | undefined;
    readonly metricsTemporality?: AggregationTemporality | undefined;
    readonly tracerExportInterval?: Duration.Input | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
}) => Layer.Layer<never, never, HttpClient.HttpClient>;
//# sourceMappingURL=Otlp.d.ts.map