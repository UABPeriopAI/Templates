import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import type * as Layer from "../../Layer.ts";
import * as Logger from "../../Logger.ts";
import type * as Scope from "../../Scope.ts";
import type * as Headers from "../http/Headers.ts";
import type * as HttpClient from "../http/HttpClient.ts";
import type { AnyValue, Fixed64, KeyValue, Resource } from "./OtlpResource.ts";
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
    readonly shutdownTimeout?: Duration.Input | undefined;
    readonly excludeLogSpans?: boolean | undefined;
}) => Effect.Effect<Logger.Logger<unknown, void>, never, OtlpSerialization | HttpClient.HttpClient | Scope.Scope>;
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
    readonly shutdownTimeout?: Duration.Input | undefined;
    readonly excludeLogSpans?: boolean | undefined;
    readonly mergeWithExisting?: boolean | undefined;
}) => Layer.Layer<never, never, HttpClient.HttpClient | OtlpSerialization>;
/**
 * @since 4.0.0
 */
export interface LogsData {
    resourceLogs: ReadonlyArray<IResourceLogs>;
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
/** Properties of a ResourceLogs. */
interface IResourceLogs {
    /** ResourceLogs resource */
    resource?: Resource;
    /** ResourceLogs scopeLogs */
    scopeLogs: Array<IScopeLogs>;
    /** ResourceLogs schemaUrl */
    schemaUrl?: string;
}
/** Properties of an ScopeLogs. */
interface IScopeLogs {
    /** IScopeLogs scope */
    scope?: IInstrumentationScope;
    /** IScopeLogs logRecords */
    logRecords?: Array<ILogRecord>;
    /** IScopeLogs schemaUrl */
    schemaUrl?: string | null;
}
/** Properties of a LogRecord. */
interface ILogRecord {
    /** LogRecord timeUnixNano */
    timeUnixNano: Fixed64;
    /** LogRecord observedTimeUnixNano */
    observedTimeUnixNano: Fixed64;
    /** LogRecord severityNumber */
    severityNumber?: ESeverityNumber;
    /** LogRecord severityText */
    severityText?: string;
    /** LogRecord body */
    body?: AnyValue;
    /** LogRecord attributes */
    attributes: Array<KeyValue>;
    /** LogRecord droppedAttributesCount */
    droppedAttributesCount: number;
    /** LogRecord flags */
    flags?: number;
    /** LogRecord traceId */
    traceId?: string | Uint8Array;
    /** LogRecord spanId */
    spanId?: string | Uint8Array;
}
/**
 * Numerical value of the severity, normalized to values described in Log Data Model.
 */
declare const ESeverityNumber: {
    /** Unspecified. Do NOT use as default */
    readonly SEVERITY_NUMBER_UNSPECIFIED: 0;
    readonly SEVERITY_NUMBER_TRACE: 1;
    readonly SEVERITY_NUMBER_TRACE2: 2;
    readonly SEVERITY_NUMBER_TRACE3: 3;
    readonly SEVERITY_NUMBER_TRACE4: 4;
    readonly SEVERITY_NUMBER_DEBUG: 5;
    readonly SEVERITY_NUMBER_DEBUG2: 6;
    readonly SEVERITY_NUMBER_DEBUG3: 7;
    readonly SEVERITY_NUMBER_DEBUG4: 8;
    readonly SEVERITY_NUMBER_INFO: 9;
    readonly SEVERITY_NUMBER_INFO2: 10;
    readonly SEVERITY_NUMBER_INFO3: 11;
    readonly SEVERITY_NUMBER_INFO4: 12;
    readonly SEVERITY_NUMBER_WARN: 13;
    readonly SEVERITY_NUMBER_WARN2: 14;
    readonly SEVERITY_NUMBER_WARN3: 15;
    readonly SEVERITY_NUMBER_WARN4: 16;
    readonly SEVERITY_NUMBER_ERROR: 17;
    readonly SEVERITY_NUMBER_ERROR2: 18;
    readonly SEVERITY_NUMBER_ERROR3: 19;
    readonly SEVERITY_NUMBER_ERROR4: 20;
    readonly SEVERITY_NUMBER_FATAL: 21;
    readonly SEVERITY_NUMBER_FATAL2: 22;
    readonly SEVERITY_NUMBER_FATAL3: 23;
    readonly SEVERITY_NUMBER_FATAL4: 24;
};
type ESeverityNumber = typeof ESeverityNumber[keyof typeof ESeverityNumber];
export {};
//# sourceMappingURL=OtlpLogger.d.ts.map