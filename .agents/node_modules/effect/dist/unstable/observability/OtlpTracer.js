/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import { flow } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Tracer from "../../Tracer.js";
import * as Exporter from "./OtlpExporter.js";
import { entriesToAttributes } from "./OtlpResource.js";
import * as OtlpResource from "./OtlpResource.js";
import { OtlpSerialization } from "./OtlpSerialization.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const otelResource = yield* OtlpResource.fromConfig(options.resource);
  const serialization = yield* OtlpSerialization;
  const scope = {
    name: OtlpResource.serviceNameUnsafe(otelResource)
  };
  const exporter = yield* Exporter.make({
    label: "OtlpTracer",
    url: options.url,
    headers: options.headers,
    exportInterval: options.exportInterval ?? Duration.seconds(5),
    maxBatchSize: options.maxBatchSize ?? 1000,
    body(spans) {
      const data = {
        resourceSpans: [{
          resource: otelResource,
          scopeSpans: [{
            scope,
            spans
          }]
        }]
      };
      return serialization.traces(data);
    },
    shutdownTimeout: options.shutdownTimeout ?? Duration.seconds(3)
  });
  function exportFn(span) {
    if (!span.sampled) return;
    exporter.push(makeOtlpSpan(span));
  }
  return Tracer.make({
    span(options) {
      return makeSpan({
        ...options,
        status: {
          _tag: "Started",
          startTime: options.startTime
        },
        attributes: new Map(),
        export: exportFn
      });
    },
    context: options.context ? function (primitive, fiber) {
      if (fiber.currentSpan === undefined) {
        return primitive["~effect/Effect/evaluate"](fiber);
      }
      return options.context(primitive, fiber.currentSpan);
    } : undefined
  });
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/flow(make, /*#__PURE__*/Layer.effect(Tracer.Tracer));
const SpanProto = {
  _tag: "Span",
  end(endTime, exit) {
    this.status = {
      _tag: "Ended",
      startTime: this.status.startTime,
      endTime,
      exit
    };
    this.export(this);
  },
  attribute(key, value) {
    this.attributes.set(key, value);
  },
  event(name, startTime, attributes) {
    this.events.push([name, startTime, attributes]);
  },
  addLinks(links) {
    this.links.push(...links);
  }
};
const makeSpan = options => {
  const self = Object.assign(Object.create(SpanProto), options);
  if (Option.isSome(self.parent)) {
    self.traceId = self.parent.value.traceId;
  } else {
    self.traceId = generateId(32);
  }
  self.spanId = generateId(16);
  self.events = [];
  return self;
};
const generateId = len => {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
const makeOtlpSpan = self => {
  const status = self.status;
  const attributes = entriesToAttributes(self.attributes.entries());
  const events = self.events.map(([name, startTime, attributes]) => ({
    name,
    timeUnixNano: String(startTime),
    attributes: attributes ? entriesToAttributes(Object.entries(attributes)) : [],
    droppedAttributesCount: 0
  }));
  let otelStatus;
  if (status.exit._tag === "Success") {
    otelStatus = constOtelStatusSuccess;
  } else if (Cause.hasInterruptsOnly(status.exit.cause)) {
    otelStatus = {
      code: StatusCode.Ok,
      message: "Interrupted"
    };
    attributes.push({
      key: "span.label",
      value: {
        stringValue: "⚠︎ Interrupted"
      }
    }, {
      key: "status.interrupted",
      value: {
        boolValue: true
      }
    });
  } else {
    const errors = Cause.prettyErrors(status.exit.cause);
    otelStatus = {
      code: StatusCode.Error
    };
    if (errors.length > 0) {
      otelStatus.message = errors[0].message;
      for (const error of errors) {
        events.push({
          name: "exception",
          timeUnixNano: String(status.endTime),
          droppedAttributesCount: 0,
          attributes: [{
            "key": "exception.type",
            "value": {
              "stringValue": error.name
            }
          }, {
            "key": "exception.message",
            "value": {
              "stringValue": error.message
            }
          }, {
            "key": "exception.stacktrace",
            "value": {
              "stringValue": error.stack ?? "No stack trace available"
            }
          }]
        });
      }
    }
  }
  return {
    traceId: self.traceId,
    spanId: self.spanId,
    parentSpanId: Option.match(self.parent, {
      onNone: () => undefined,
      onSome: parent => parent.spanId
    }),
    name: self.name,
    kind: SpanKind[self.kind],
    startTimeUnixNano: String(status.startTime),
    endTimeUnixNano: String(status.endTime),
    attributes,
    droppedAttributesCount: 0,
    events,
    droppedEventsCount: 0,
    status: otelStatus,
    links: self.links.map(link => ({
      traceId: link.span.traceId,
      spanId: link.span.spanId,
      attributes: entriesToAttributes(Object.entries(link.attributes)),
      droppedAttributesCount: 0
    })),
    droppedLinksCount: 0
  };
};
const StatusCode = {
  Unset: 0,
  Ok: 1,
  Error: 2
};
const SpanKind = {
  unspecified: 0,
  internal: 1,
  server: 2,
  client: 3,
  producer: 4,
  consumer: 5
};
const constOtelStatusSuccess = {
  code: StatusCode.Ok
};
//# sourceMappingURL=OtlpTracer.js.map