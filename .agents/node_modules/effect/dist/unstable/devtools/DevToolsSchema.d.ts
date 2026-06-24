import type * as Option from "../../Option.ts";
import * as Schema from "../../Schema.ts";
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const SpanStatusStarted: Schema.Struct<{
    readonly _tag: Schema.tag<"Started">;
    readonly startTime: Schema.BigInt;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type SpanStatusStarted = Schema.Schema.Type<typeof SpanStatusStarted>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const SpanStatusEnded: Schema.Struct<{
    readonly _tag: Schema.tag<"Ended">;
    readonly startTime: Schema.BigInt;
    readonly endTime: Schema.BigInt;
    readonly exit: Schema.decodeTo<Schema.Exit<Schema.Unknown, Schema.Unknown, Schema.Unknown>, Schema.Exit<Schema.Void, Schema.Defect, Schema.Defect>, never, never>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type SpanStatusEnded = Schema.Schema.Type<typeof SpanStatusEnded>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const SpanStatus: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"Started">;
    readonly startTime: Schema.BigInt;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"Ended">;
    readonly startTime: Schema.BigInt;
    readonly endTime: Schema.BigInt;
    readonly exit: Schema.decodeTo<Schema.Exit<Schema.Unknown, Schema.Unknown, Schema.Unknown>, Schema.Exit<Schema.Void, Schema.Defect, Schema.Defect>, never, never>;
}>]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type SpanStatus = Schema.Schema.Type<typeof SpanStatus>;
/**
 * @since 4.0.0
 * @category schemas
 */
export interface ExternalSpan {
    readonly _tag: "ExternalSpan";
    readonly spanId: string;
    readonly traceId: string;
    readonly sampled: boolean;
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const ExternalSpan: Schema.Codec<ExternalSpan>;
/**
 * @since 4.0.0
 * @category schemas
 */
export interface Span {
    readonly _tag: "Span";
    readonly spanId: string;
    readonly traceId: string;
    readonly name: string;
    readonly sampled: boolean;
    readonly attributes: ReadonlyMap<string, unknown>;
    readonly status: SpanStatus;
    readonly parent: Option.Option<ParentSpan>;
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Span: Schema.Codec<Span>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const SpanEvent: Schema.Struct<{
    readonly _tag: Schema.tag<"SpanEvent">;
    readonly traceId: Schema.String;
    readonly spanId: Schema.String;
    readonly name: Schema.String;
    readonly startTime: Schema.BigInt;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.Any>>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type SpanEvent = Schema.Schema.Type<typeof SpanEvent>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type ParentSpan = Span | ExternalSpan;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const ParentSpan: Schema.Union<readonly [Schema.Codec<Span, Span, never, never>, Schema.Codec<ExternalSpan, ExternalSpan, never, never>]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Ping: Schema.Struct<{
    readonly _tag: Schema.tag<"Ping">;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Ping = Schema.Schema.Type<typeof Ping>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Pong: Schema.Struct<{
    readonly _tag: Schema.tag<"Pong">;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Pong = Schema.Schema.Type<typeof Pong>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const MetricsRequest: Schema.Struct<{
    readonly _tag: Schema.tag<"MetricsRequest">;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type MetricsRequest = Schema.Schema.Type<typeof MetricsRequest>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const MetricLabel: Schema.Struct<{
    readonly key: Schema.String;
    readonly value: Schema.String;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type MetricLabel = Schema.Schema.Type<typeof MetricLabel>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Counter: Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Counter">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly count: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
        readonly incremental: Schema.Boolean;
    }>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Counter = Schema.Schema.Type<typeof Counter>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Frequency: Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Frequency">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly occurrences: Schema.$ReadonlyMap<Schema.String, Schema.Number>;
    }>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Frequency = Schema.Schema.Type<typeof Frequency>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Gauge: Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Gauge">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly value: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
    }>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Gauge = Schema.Schema.Type<typeof Gauge>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Histogram: Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Histogram">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly buckets: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.Number]>>;
        readonly count: Schema.Number;
        readonly min: Schema.Number;
        readonly max: Schema.Number;
        readonly sum: Schema.Number;
    }>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Histogram = Schema.Schema.Type<typeof Histogram>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Summary: Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Summary">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly quantiles: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.UndefinedOr<Schema.Number>]>>;
        readonly count: Schema.Number;
        readonly min: Schema.Number;
        readonly max: Schema.Number;
        readonly sum: Schema.Number;
    }>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Summary = Schema.Schema.Type<typeof Summary>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Metric: Schema.Union<readonly [Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Counter">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly count: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
        readonly incremental: Schema.Boolean;
    }>;
}>, Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Frequency">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly occurrences: Schema.$ReadonlyMap<Schema.String, Schema.Number>;
    }>;
}>, Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Gauge">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly value: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
    }>;
}>, Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Histogram">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly buckets: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.Number]>>;
        readonly count: Schema.Number;
        readonly min: Schema.Number;
        readonly max: Schema.Number;
        readonly sum: Schema.Number;
    }>;
}>, Schema.Struct<{
    readonly id: Schema.String;
    readonly type: Schema.tag<"Summary">;
    readonly description: Schema.UndefinedOr<Schema.String>;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
    readonly state: Schema.Struct<{
        readonly quantiles: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.UndefinedOr<Schema.Number>]>>;
        readonly count: Schema.Number;
        readonly min: Schema.Number;
        readonly max: Schema.Number;
        readonly sum: Schema.Number;
    }>;
}>]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Metric = Schema.Schema.Type<typeof Metric>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const MetricsSnapshot: Schema.Struct<{
    readonly _tag: Schema.tag<"MetricsSnapshot">;
    readonly metrics: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Counter">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly count: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
            readonly incremental: Schema.Boolean;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Frequency">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly occurrences: Schema.$ReadonlyMap<Schema.String, Schema.Number>;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Gauge">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly value: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Histogram">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly buckets: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.Number]>>;
            readonly count: Schema.Number;
            readonly min: Schema.Number;
            readonly max: Schema.Number;
            readonly sum: Schema.Number;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Summary">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly quantiles: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.UndefinedOr<Schema.Number>]>>;
            readonly count: Schema.Number;
            readonly min: Schema.Number;
            readonly max: Schema.Number;
            readonly sum: Schema.Number;
        }>;
    }>]>>;
}>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type MetricsSnapshot = Schema.Schema.Type<typeof MetricsSnapshot>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Request: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"Ping">;
}>, Schema.Codec<Span, Span, never, never>, Schema.Struct<{
    readonly _tag: Schema.tag<"SpanEvent">;
    readonly traceId: Schema.String;
    readonly spanId: Schema.String;
    readonly name: Schema.String;
    readonly startTime: Schema.BigInt;
    readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.Any>>;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"MetricsSnapshot">;
    readonly metrics: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Counter">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly count: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
            readonly incremental: Schema.Boolean;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Frequency">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly occurrences: Schema.$ReadonlyMap<Schema.String, Schema.Number>;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Gauge">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly value: Schema.Union<readonly [Schema.Number, Schema.BigInt]>;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Histogram">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly buckets: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.Number]>>;
            readonly count: Schema.Number;
            readonly min: Schema.Number;
            readonly max: Schema.Number;
            readonly sum: Schema.Number;
        }>;
    }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly type: Schema.tag<"Summary">;
        readonly description: Schema.UndefinedOr<Schema.String>;
        readonly attributes: Schema.UndefinedOr<Schema.$Record<Schema.String, Schema.String>>;
        readonly state: Schema.Struct<{
            readonly quantiles: Schema.$Array<Schema.Tuple<readonly [Schema.Number, Schema.UndefinedOr<Schema.Number>]>>;
            readonly count: Schema.Number;
            readonly min: Schema.Number;
            readonly max: Schema.Number;
            readonly sum: Schema.Number;
        }>;
    }>]>>;
}>]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Request = Schema.Schema.Type<typeof Request>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare namespace Request {
    /**
     * @since 4.0.0
     * @category schemas
     */
    type WithoutPing = Exclude<Request, {
        readonly _tag: "Ping";
    }>;
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Response: Schema.Union<readonly [Schema.Struct<{
    readonly _tag: Schema.tag<"Pong">;
}>, Schema.Struct<{
    readonly _tag: Schema.tag<"MetricsRequest">;
}>]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Response = Schema.Schema.Type<typeof Response>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare namespace Response {
    /**
     * @since 4.0.0
     * @category schemas
     */
    type WithoutPong = Exclude<Response, {
        readonly _tag: "Pong";
    }>;
}
//# sourceMappingURL=DevToolsSchema.d.ts.map