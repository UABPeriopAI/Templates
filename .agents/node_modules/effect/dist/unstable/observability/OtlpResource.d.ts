import * as Effect from "../../Effect.ts";
/**
 * @since 4.0.0
 * @category Models
 */
export interface Resource {
    /** Resource attributes */
    attributes: Array<KeyValue>;
    /** Resource droppedAttributesCount */
    droppedAttributesCount: number;
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly serviceName: string;
    readonly serviceVersion?: string | undefined;
    readonly attributes?: Record<string, unknown> | undefined;
}) => Resource;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const fromConfig: (options?: {
    readonly serviceName?: string | undefined;
    readonly serviceVersion?: string | undefined;
    readonly attributes?: Record<string, unknown> | undefined;
} | undefined) => Effect.Effect<Resource>;
/**
 * @since 4.0.0
 * @category Attributes
 */
export declare const serviceNameUnsafe: (resource: Resource) => string;
/**
 * @since 4.0.0
 * @category Attributes
 */
export declare const entriesToAttributes: (entries: Iterable<[string, unknown]>) => Array<KeyValue>;
/**
 * @since 4.0.0
 * @category Attributes
 */
export declare const unknownToAttributeValue: (value: unknown) => AnyValue;
/**
 * @since 4.0.0
 * @category Models
 */
export interface KeyValue {
    /** KeyValue key */
    key: string;
    /** KeyValue value */
    value: AnyValue;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface AnyValue {
    /** AnyValue stringValue */
    stringValue?: string | null;
    /** AnyValue boolValue */
    boolValue?: boolean | null;
    /** AnyValue intValue */
    intValue?: number | null;
    /** AnyValue doubleValue */
    doubleValue?: number | null;
    /** AnyValue arrayValue */
    arrayValue?: ArrayValue;
    /** AnyValue kvlistValue */
    kvlistValue?: KeyValueList;
    /** AnyValue bytesValue */
    bytesValue?: Uint8Array;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface ArrayValue {
    /** ArrayValue values */
    values: Array<AnyValue>;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface KeyValueList {
    /** KeyValueList values */
    values: Array<KeyValue>;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface LongBits {
    low: number;
    high: number;
}
/**
 * @since 4.0.0
 * @category Models
 */
export type Fixed64 = LongBits | string | number;
//# sourceMappingURL=OtlpResource.d.ts.map