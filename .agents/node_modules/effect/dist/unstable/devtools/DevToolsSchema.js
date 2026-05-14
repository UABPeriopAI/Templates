/**
 * @since 4.0.0
 */
import * as Exit from "../../Exit.js";
import { identity } from "../../Function.js";
import * as Schema from "../../Schema.js";
import * as SchemaTransformation from "../../SchemaTransformation.js";
/**
 * @since 4.0.0
 * @category schemas
 */
export const SpanStatusStarted = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Started"),
  startTime: Schema.BigInt
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const SpanStatusEnded = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Ended"),
  startTime: Schema.BigInt,
  endTime: Schema.BigInt,
  exit: /*#__PURE__*/Schema.Exit(Schema.Void, Schema.DefectWithStack, Schema.DefectWithStack).pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.Exit(Schema.Unknown, Schema.Unknown, Schema.Unknown), /*#__PURE__*/SchemaTransformation.transform({
    decode: identity,
    encode: Exit.asVoid
  })))
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const SpanStatus = /*#__PURE__*/Schema.Union([SpanStatusStarted, SpanStatusEnded]);
/**
 * @since 4.0.0
 * @category schemas
 */
export const ExternalSpan = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("ExternalSpan"),
  spanId: Schema.String,
  traceId: Schema.String,
  sampled: Schema.Boolean
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const Span = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Span"),
  spanId: Schema.String,
  traceId: Schema.String,
  name: Schema.String,
  sampled: Schema.Boolean,
  attributes: /*#__PURE__*/Schema.ReadonlyMap(Schema.String, Schema.Any),
  status: SpanStatus,
  parent: /*#__PURE__*/Schema.Option(/*#__PURE__*/Schema.suspend(() => ParentSpan))
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const SpanEvent = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("SpanEvent"),
  traceId: Schema.String,
  spanId: Schema.String,
  name: Schema.String,
  startTime: Schema.BigInt,
  attributes: /*#__PURE__*/Schema.UndefinedOr(/*#__PURE__*/Schema.Record(Schema.String, Schema.Any))
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const ParentSpan = /*#__PURE__*/Schema.Union([Span, ExternalSpan]);
/**
 * @since 4.0.0
 * @category schemas
 */
export const Ping = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Ping")
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const Pong = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Pong")
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const MetricsRequest = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("MetricsRequest")
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const MetricLabel = /*#__PURE__*/Schema.Struct({
  key: Schema.String,
  value: Schema.String
});
const metric = (type, state) => Schema.Struct({
  id: Schema.String,
  type: Schema.tag(type),
  description: Schema.UndefinedOr(Schema.String),
  attributes: Schema.UndefinedOr(Schema.Record(Schema.String, Schema.String)),
  state
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const Counter = /*#__PURE__*/metric("Counter", /*#__PURE__*/Schema.Struct({
  count: /*#__PURE__*/Schema.Union([Schema.Number, Schema.BigInt]),
  incremental: Schema.Boolean
}));
/**
 * @since 4.0.0
 * @category schemas
 */
export const Frequency = /*#__PURE__*/metric("Frequency", /*#__PURE__*/Schema.Struct({
  occurrences: /*#__PURE__*/Schema.ReadonlyMap(Schema.String, Schema.Number)
}));
/**
 * @since 4.0.0
 * @category schemas
 */
export const Gauge = /*#__PURE__*/metric("Gauge", /*#__PURE__*/Schema.Struct({
  value: /*#__PURE__*/Schema.Union([Schema.Number, Schema.BigInt])
}));
/**
 * @since 4.0.0
 * @category schemas
 */
export const Histogram = /*#__PURE__*/metric("Histogram", /*#__PURE__*/Schema.Struct({
  buckets: /*#__PURE__*/Schema.Array(/*#__PURE__*/Schema.Tuple([Schema.Number, Schema.Number])),
  count: Schema.Number,
  min: Schema.Number,
  max: Schema.Number,
  sum: Schema.Number
}));
/**
 * @since 4.0.0
 * @category schemas
 */
export const Summary = /*#__PURE__*/metric("Summary", /*#__PURE__*/Schema.Struct({
  quantiles: /*#__PURE__*/Schema.Array(/*#__PURE__*/Schema.Tuple([Schema.Number, /*#__PURE__*/Schema.UndefinedOr(Schema.Number)])),
  count: Schema.Number,
  min: Schema.Number,
  max: Schema.Number,
  sum: Schema.Number
}));
/**
 * @since 4.0.0
 * @category schemas
 */
export const Metric = /*#__PURE__*/Schema.Union([Counter, Frequency, Gauge, Histogram, Summary]);
/**
 * @since 4.0.0
 * @category schemas
 */
export const MetricsSnapshot = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("MetricsSnapshot"),
  metrics: /*#__PURE__*/Schema.Array(Metric)
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const Request = /*#__PURE__*/Schema.Union([Ping, Span, SpanEvent, MetricsSnapshot]);
/**
 * @since 4.0.0
 * @category schemas
 */
export const Response = /*#__PURE__*/Schema.Union([Pong, MetricsRequest]);
//# sourceMappingURL=DevToolsSchema.js.map