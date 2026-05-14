import { flow } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as HttpClientRequest from "../http/HttpClientRequest.js";
import * as OtlpLogger from "./OtlpLogger.js";
import * as OtlpMetrics from "./OtlpMetrics.js";
import * as OtlpSerialization from "./OtlpSerialization.js";
import * as OtlpTracer from "./OtlpTracer.js";
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = options => {
  const base = HttpClientRequest.get(options.baseUrl);
  const url = path => HttpClientRequest.appendUrl(base, path).url;
  return Layer.mergeAll(OtlpLogger.layer({
    url: url("/v1/logs"),
    resource: options.resource,
    headers: options.headers,
    exportInterval: options.loggerExportInterval,
    maxBatchSize: options.maxBatchSize,
    shutdownTimeout: options.shutdownTimeout,
    excludeLogSpans: options.loggerExcludeLogSpans,
    mergeWithExisting: options.loggerMergeWithExisting
  }), OtlpMetrics.layer({
    url: url("/v1/metrics"),
    resource: options.resource,
    headers: options.headers,
    exportInterval: options.metricsExportInterval,
    shutdownTimeout: options.shutdownTimeout,
    temporality: options.metricsTemporality
  }), OtlpTracer.layer({
    url: url("/v1/traces"),
    resource: options.resource,
    headers: options.headers,
    exportInterval: options.tracerExportInterval,
    maxBatchSize: options.maxBatchSize,
    context: options.tracerContext,
    shutdownTimeout: options.shutdownTimeout
  }));
};
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerJson = /*#__PURE__*/flow(layer, /*#__PURE__*/Layer.provide(OtlpSerialization.layerJson));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerProtobuf = /*#__PURE__*/flow(layer, /*#__PURE__*/Layer.provide(OtlpSerialization.layerProtobuf));
//# sourceMappingURL=Otlp.js.map