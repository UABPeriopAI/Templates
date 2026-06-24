/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Layer from "../../Layer.js";
import * as HttpBody from "../http/HttpBody.js";
import * as otlpProtobuf from "./internal/otlpProtobuf.js";
/**
 * @since 4.0.0
 * @category Services
 */
export class OtlpSerialization extends /*#__PURE__*/Context.Service()("effect/observability/OtlpSerialization") {}
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerJson = /*#__PURE__*/Layer.succeed(OtlpSerialization, {
  traces: spans => HttpBody.jsonUnsafe(spans),
  metrics: metrics => HttpBody.jsonUnsafe(metrics),
  logs: logs => HttpBody.jsonUnsafe(logs)
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerProtobuf = /*#__PURE__*/Layer.succeed(OtlpSerialization, {
  traces: spans => HttpBody.uint8Array(otlpProtobuf.encodeTracesData(spans), "application/x-protobuf"),
  metrics: metrics => HttpBody.uint8Array(otlpProtobuf.encodeMetricsData(metrics), "application/x-protobuf"),
  logs: logs => HttpBody.uint8Array(otlpProtobuf.encodeLogsData(logs), "application/x-protobuf")
});
//# sourceMappingURL=OtlpSerialization.js.map