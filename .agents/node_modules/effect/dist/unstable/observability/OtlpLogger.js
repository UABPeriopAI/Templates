/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import { Clock } from "../../Clock.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Logger from "../../Logger.js";
import { CurrentLogAnnotations, CurrentLogSpans } from "../../References.js";
import * as Exporter from "./OtlpExporter.js";
import * as OtlpResource from "./OtlpResource.js";
import { OtlpSerialization } from "./OtlpSerialization.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const serialization = yield* OtlpSerialization;
  const otelResource = yield* OtlpResource.fromConfig(options.resource);
  const scope = {
    name: OtlpResource.serviceNameUnsafe(otelResource)
  };
  const exporter = yield* Exporter.make({
    label: "OtlpLogger",
    url: options.url,
    headers: options.headers,
    maxBatchSize: options.maxBatchSize ?? 1000,
    exportInterval: options.exportInterval ?? Duration.seconds(1),
    body: data => serialization.logs({
      resourceLogs: [{
        resource: otelResource,
        scopeLogs: [{
          scope,
          logRecords: data
        }]
      }]
    }),
    shutdownTimeout: options.shutdownTimeout ?? Duration.seconds(3)
  });
  const opts = {
    excludeLogSpans: options.excludeLogSpans ?? false,
    clock: yield* Clock
  };
  return Logger.make(options => {
    exporter.push(makeLogRecord(options, opts));
  });
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = options => Logger.layer([make(options)], {
  mergeWithExisting: options.mergeWithExisting ?? true
});
// internal
const makeLogRecord = (options, opts) => {
  const now = opts.clock.currentTimeNanosUnsafe();
  const nanosString = now.toString();
  const nowMillis = options.date.getTime();
  const attributes = OtlpResource.entriesToAttributes(Object.entries(options.fiber.getRef(CurrentLogAnnotations)));
  attributes.push({
    key: "fiberId",
    value: {
      intValue: options.fiber.id
    }
  });
  if (!opts.excludeLogSpans) {
    for (const [label, startTime] of options.fiber.getRef(CurrentLogSpans)) {
      attributes.push({
        key: `logSpan.${label}`,
        value: {
          stringValue: `${nowMillis - startTime}ms`
        }
      });
    }
  }
  if (options.cause.reasons.length > 0) {
    attributes.push({
      key: "log.error",
      value: {
        stringValue: Cause.pretty(options.cause)
      }
    });
  }
  const message = Arr.ensure(options.message);
  const logRecord = {
    severityNumber: logLevelToSeverityNumber(options.logLevel),
    severityText: options.logLevel,
    timeUnixNano: nanosString,
    observedTimeUnixNano: nanosString,
    attributes,
    body: OtlpResource.unknownToAttributeValue(message.length === 1 ? message[0] : message),
    droppedAttributesCount: 0
  };
  if (options.fiber.currentSpan) {
    logRecord.traceId = options.fiber.currentSpan.traceId;
    logRecord.spanId = options.fiber.currentSpan.spanId;
  }
  return logRecord;
};
const logLevelToSeverityNumber = logLevel => {
  switch (logLevel) {
    case "Trace":
      return ESeverityNumber.SEVERITY_NUMBER_TRACE;
    case "Debug":
      return ESeverityNumber.SEVERITY_NUMBER_DEBUG;
    case "Info":
      return ESeverityNumber.SEVERITY_NUMBER_INFO;
    case "Warn":
      return ESeverityNumber.SEVERITY_NUMBER_WARN;
    case "Error":
      return ESeverityNumber.SEVERITY_NUMBER_ERROR;
    case "Fatal":
      return ESeverityNumber.SEVERITY_NUMBER_FATAL;
    default:
      return ESeverityNumber.SEVERITY_NUMBER_UNSPECIFIED;
  }
};
/**
 * Numerical value of the severity, normalized to values described in Log Data Model.
 */
const ESeverityNumber = {
  /** Unspecified. Do NOT use as default */
  SEVERITY_NUMBER_UNSPECIFIED: 0,
  SEVERITY_NUMBER_TRACE: 1,
  SEVERITY_NUMBER_TRACE2: 2,
  SEVERITY_NUMBER_TRACE3: 3,
  SEVERITY_NUMBER_TRACE4: 4,
  SEVERITY_NUMBER_DEBUG: 5,
  SEVERITY_NUMBER_DEBUG2: 6,
  SEVERITY_NUMBER_DEBUG3: 7,
  SEVERITY_NUMBER_DEBUG4: 8,
  SEVERITY_NUMBER_INFO: 9,
  SEVERITY_NUMBER_INFO2: 10,
  SEVERITY_NUMBER_INFO3: 11,
  SEVERITY_NUMBER_INFO4: 12,
  SEVERITY_NUMBER_WARN: 13,
  SEVERITY_NUMBER_WARN2: 14,
  SEVERITY_NUMBER_WARN3: 15,
  SEVERITY_NUMBER_WARN4: 16,
  SEVERITY_NUMBER_ERROR: 17,
  SEVERITY_NUMBER_ERROR2: 18,
  SEVERITY_NUMBER_ERROR3: 19,
  SEVERITY_NUMBER_ERROR4: 20,
  SEVERITY_NUMBER_FATAL: 21,
  SEVERITY_NUMBER_FATAL2: 22,
  SEVERITY_NUMBER_FATAL3: 23,
  SEVERITY_NUMBER_FATAL4: 24
};
//# sourceMappingURL=OtlpLogger.js.map