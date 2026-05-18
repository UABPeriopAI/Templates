/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Layer from "../../Layer.ts";
import * as HttpBody from "../http/HttpBody.ts";
import type { LogsData } from "./OtlpLogger.ts";
import type { MetricsData } from "./OtlpMetrics.ts";
import type { TraceData } from "./OtlpTracer.ts";
declare const OtlpSerialization_base: Context.ServiceClass<OtlpSerialization, "effect/observability/OtlpSerialization", {
    readonly traces: (data: TraceData) => HttpBody.HttpBody;
    readonly metrics: (data: MetricsData) => HttpBody.HttpBody;
    readonly logs: (data: LogsData) => HttpBody.HttpBody;
}>;
/**
 * @since 4.0.0
 * @category Services
 */
export declare class OtlpSerialization extends OtlpSerialization_base {
}
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerJson: Layer.Layer<OtlpSerialization, never, never>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerProtobuf: Layer.Layer<OtlpSerialization, never, never>;
export {};
//# sourceMappingURL=OtlpSerialization.d.ts.map