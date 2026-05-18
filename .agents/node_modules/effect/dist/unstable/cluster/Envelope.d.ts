import type { ReadonlyRecord } from "../../Record.ts";
import * as Schema from "../../Schema.ts";
import * as Transformation from "../../SchemaTransformation.ts";
import * as Headers from "../http/Headers.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import { EntityAddress } from "./EntityAddress.ts";
import { type Snowflake, SnowflakeFromBigInt } from "./Snowflake.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId = "~effect/cluster/Envelope";
/**
 * @since 4.0.0
 * @category models
 */
export type Envelope<R extends Rpc.Any> = Request<R> | AckChunk | Interrupt;
/**
 * @since 4.0.0
 * @category models
 */
export type Encoded = PartialRequestEncoded | AckChunkEncoded | InterruptEncoded;
/**
 * @since 4.0.0
 */
export declare namespace Envelope {
    /**
     * @since 4.0.0
     * @category models
     */
    type Any = Envelope<any>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Request<in out Rpc extends Rpc.Any> {
    readonly [TypeId]: typeof TypeId;
    readonly _tag: "Request";
    readonly requestId: Snowflake;
    readonly address: EntityAddress;
    readonly tag: Rpc.Tag<Rpc>;
    readonly payload: Rpc.Payload<Rpc>;
    readonly headers: Headers.Headers;
    readonly traceId?: string;
    readonly spanId?: string;
    readonly sampled?: boolean;
}
declare const PartialRequest_base: Schema.Opaque<PartialRequest, Schema.Struct<{
    readonly _tag: Schema.tag<"Request">;
    readonly requestId: SnowflakeFromBigInt;
    readonly address: typeof EntityAddress;
    readonly tag: Schema.String;
    readonly payload: Schema.Any;
    readonly headers: Headers.HeadersSchema;
    readonly traceId: Schema.optional<Schema.String>;
    readonly spanId: Schema.optional<Schema.String>;
    readonly sampled: Schema.optional<Schema.Boolean>;
}>, {}> & Omit<Schema.Struct<{
    readonly _tag: Schema.tag<"Request">;
    readonly requestId: SnowflakeFromBigInt;
    readonly address: typeof EntityAddress;
    readonly tag: Schema.String;
    readonly payload: Schema.Any;
    readonly headers: Headers.HeadersSchema;
    readonly traceId: Schema.optional<Schema.String>;
    readonly spanId: Schema.optional<Schema.String>;
    readonly sampled: Schema.optional<Schema.Boolean>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class PartialRequest extends PartialRequest_base {
}
/**
 * @since 4.0.0
 * @category models
 */
export interface PartialRequestEncoded {
    readonly _tag: "Request";
    readonly requestId: string;
    readonly address: {
        readonly shardId: {
            readonly group: string;
            readonly id: number;
        };
        readonly entityType: string;
        readonly entityId: string;
    };
    readonly tag: string;
    readonly payload: unknown;
    readonly headers: ReadonlyRecord<string, string>;
    readonly traceId?: string;
    readonly spanId?: string;
    readonly sampled?: boolean;
}
declare const AckChunk_base: Schema.Class<AckChunk, Schema.Struct<{
    readonly _tag: Schema.tag<"AckChunk">;
    readonly id: SnowflakeFromBigInt;
    readonly address: typeof EntityAddress;
    readonly requestId: SnowflakeFromBigInt;
    readonly replyId: SnowflakeFromBigInt;
}>, {}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class AckChunk extends AckChunk_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/Envelope";
    /**
     * @since 4.0.0
     */
    withRequestId(requestId: Snowflake): AckChunk;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface AckChunkEncoded {
    readonly _tag: "AckChunk";
    readonly id: string;
    readonly address: {
        readonly shardId: {
            readonly group: string;
            readonly id: number;
        };
        readonly entityType: string;
        readonly entityId: string;
    };
    readonly requestId: string;
    readonly replyId: string;
}
declare const Interrupt_base: Schema.Class<Interrupt, Schema.Struct<{
    readonly _tag: Schema.tag<"Interrupt">;
    readonly id: SnowflakeFromBigInt;
    readonly address: typeof EntityAddress;
    readonly requestId: SnowflakeFromBigInt;
}>, {}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Interrupt extends Interrupt_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/Envelope";
    /**
     * @since 4.0.0
     */
    withRequestId(requestId: Snowflake): Interrupt;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface InterruptEncoded {
    readonly _tag: "Interrupt";
    readonly id: string;
    readonly address: {
        readonly shardId: {
            readonly group: string;
            readonly id: number;
        };
        readonly entityType: string;
        readonly entityId: string;
    };
    readonly requestId: string;
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Partial: Schema.Union<readonly [
    typeof PartialRequest,
    typeof AckChunk,
    typeof Interrupt
]>;
/**
 * @since 4.0.0
 * @category schemas
 */
export type Partial = typeof Partial.Type;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const PartialJson: Schema.Codec<AckChunk | Interrupt | PartialRequest, Encoded>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const PartialArray: Schema.mutable<Schema.$Array<Schema.Codec<AckChunk | Interrupt | PartialRequest, Encoded>>>;
/**
 * @since 4.0.0
 */
export declare namespace Request {
    /**
     * @since 4.0.0
     * @category models
     */
    type Any = Request<any>;
}
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isEnvelope: (u: unknown) => u is Envelope<any>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeRequest: <Rpc extends Rpc.Any>(options: {
    readonly requestId: Snowflake;
    readonly address: EntityAddress;
    readonly tag: Rpc.Tag<Rpc>;
    readonly payload: Rpc.Payload<Rpc>;
    readonly headers: Headers.Headers;
    readonly traceId?: string | undefined;
    readonly spanId?: string | undefined;
    readonly sampled?: boolean | undefined;
}) => Request<Rpc>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const Envelope: Schema.declare<Envelope<any>, Envelope<any>>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const Request: Schema.declare<Request.Any, Request.Any>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const RequestTransform: Transformation.Transformation<Request.Any, any>;
/**
 * @since 4.0.0
 * @category primary key
 */
export declare const primaryKey: <R extends Rpc.Any>(envelope: Envelope<R>) => string | null;
/**
 * @since 4.0.0
 * @category primary key
 */
export declare const primaryKeyByAddress: (options: {
    readonly address: EntityAddress;
    readonly tag: string;
    readonly id: string;
}) => string;
export {};
//# sourceMappingURL=Envelope.d.ts.map