import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as Tracer from "../../Tracer.ts";
import type * as Headers from "../http/Headers.ts";
import type * as HttpClient from "../http/HttpClient.ts";
import type { KeyValue, Resource } from "./OtlpResource.ts";
import { OtlpSerialization } from "./OtlpSerialization.ts";
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
    readonly maxBatchSize?: number | undefined;
    readonly context?: (<X>(primitive: Tracer.EffectPrimitive<X>, span: Tracer.AnySpan) => X) | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
}) => Effect.Effect<Tracer.Tracer, never, OtlpSerialization | HttpClient.HttpClient | Scope.Scope>;
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
    readonly maxBatchSize?: number | undefined;
    readonly context?: (<X>(primitive: Tracer.EffectPrimitive<X>, span: Tracer.AnySpan) => X) | undefined;
    readonly shutdownTimeout?: Duration.Input | undefined;
}) => Layer.Layer<never, never, OtlpSerialization | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 */
export interface TraceData {
    readonly resourceSpans: Array<ResourceSpan>;
}
/**
 * @since 4.0.0
 */
export interface ResourceSpan {
    readonly resource: Resource;
    readonly scopeSpans: Array<ScopeSpan>;
    readonly schemaUrl?: string | undefined;
}
/**
 * @since 4.0.0
 */
export interface ScopeSpan {
    readonly scope: Scope;
    readonly spans: Array<OtlpSpan>;
    readonly schemaUrl?: string | undefined;
}
interface Scope {
    readonly name: string;
}
interface OtlpSpan {
    readonly traceId: string;
    readonly spanId: string;
    readonly parentSpanId: string | undefined;
    readonly name: string;
    readonly kind: number;
    readonly startTimeUnixNano: string;
    readonly endTimeUnixNano: string;
    readonly attributes: Array<KeyValue>;
    readonly droppedAttributesCount: number;
    readonly events: Array<Event>;
    readonly droppedEventsCount: number;
    readonly status: Status;
    readonly links: Array<Link>;
    readonly droppedLinksCount: number;
}
interface Event {
    readonly attributes: Array<KeyValue>;
    readonly name: string;
    readonly timeUnixNano: string;
    readonly droppedAttributesCount: number;
}
interface Link {
    readonly attributes: Array<KeyValue>;
    readonly spanId: string;
    readonly traceId: string;
    readonly droppedAttributesCount: number;
}
interface Status {
    readonly code: StatusCode;
    message?: string;
}
declare const StatusCode: {
    readonly Unset: 0;
    readonly Ok: 1;
    readonly Error: 2;
};
type StatusCode = typeof StatusCode[keyof typeof StatusCode];
export {};
//# sourceMappingURL=OtlpTracer.d.ts.map