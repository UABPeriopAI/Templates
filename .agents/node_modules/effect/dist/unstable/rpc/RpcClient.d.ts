import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import type * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Queue from "../../Queue.ts";
import * as Schedule from "../../Schedule.ts";
import * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import type * as Struct from "../../Struct.ts";
import * as Headers from "../http/Headers.ts";
import * as HttpClient from "../http/HttpClient.ts";
import * as Socket from "../socket/Socket.ts";
import * as Worker from "../workers/Worker.ts";
import type { WorkerError } from "../workers/WorkerError.ts";
import * as Rpc from "./Rpc.ts";
import { RpcClientError } from "./RpcClientError.ts";
import type * as RpcGroup from "./RpcGroup.ts";
import type { FromClient, FromClientEncoded, FromServer, FromServerEncoded } from "./RpcMessage.ts";
import { RequestId } from "./RpcMessage.ts";
import * as RpcSchema from "./RpcSchema.ts";
import * as RpcSerialization from "./RpcSerialization.ts";
/**
 * @since 4.0.0
 * @category client
 */
export type RpcClient<Rpcs extends Rpc.Any, E = never> = Struct.Simplify<RpcClient.From<Rpcs, E>>;
/**
 * @since 4.0.0
 * @category client
 */
export declare namespace RpcClient {
    /**
     * @since 4.0.0
     * @category client
     */
    type From<Rpcs extends Rpc.Any, E = never> = {
        readonly [Current in Rpcs as Current["_tag"]]: <const AsQueue extends boolean = false, const Discard = false>(input: Rpc.PayloadConstructor<Current>, options?: Rpc.Success<Current> extends Stream.Stream<infer _A, infer _E, infer _R> ? {
            readonly asQueue?: AsQueue | undefined;
            readonly streamBufferSize?: number | undefined;
            readonly headers?: Headers.Input | undefined;
            readonly context?: Context.Context<never> | undefined;
        } : {
            readonly headers?: Headers.Input | undefined;
            readonly context?: Context.Context<never> | undefined;
            readonly discard?: Discard | undefined;
        }) => Current extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware, infer _Requires> ? [_Success] extends [RpcSchema.Stream<infer _A, infer _E>] ? AsQueue extends true ? Effect.Effect<Queue.Dequeue<_A["Type"], _E["Type"] | _Error["Type"] | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"] | Cause.Done>, never, Scope.Scope | _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : Stream.Stream<_A["Type"], _E["Type"] | _Error["Type"] | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"], _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : Effect.Effect<Discard extends true ? void : _Success["Type"], (Discard extends true ? never : _Error["Type"]) | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"], _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : never;
    };
    /**
     * @since 4.0.0
     * @category client
     */
    type Flat<Rpcs extends Rpc.Any, E = never> = <const Tag extends Rpcs["_tag"], const AsQueue extends boolean = false, const Discard = false>(tag: Tag, payload: Rpc.PayloadConstructor<Rpc.ExtractTag<Rpcs, Tag>>, options?: Rpc.Success<Rpc.ExtractTag<Rpcs, Tag>> extends Stream.Stream<infer _A, infer _E, infer _R> ? {
        readonly asQueue?: AsQueue | undefined;
        readonly streamBufferSize?: number | undefined;
        readonly headers?: Headers.Input | undefined;
        readonly context?: Context.Context<never> | undefined;
    } : {
        readonly headers?: Headers.Input | undefined;
        readonly context?: Context.Context<never> | undefined;
        readonly discard?: Discard | undefined;
    }) => Rpc.ExtractTag<Rpcs, Tag> extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware, infer _Requires> ? [_Success] extends [RpcSchema.Stream<infer _A, infer _E>] ? AsQueue extends true ? Effect.Effect<Queue.Dequeue<_A["Type"], _E["Type"] | _Error["Type"] | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"]>, never, Scope.Scope | _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : Stream.Stream<_A["Type"], _E["Type"] | _Error["Type"] | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"], _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : Effect.Effect<Discard extends true ? void : _Success["Type"], (Discard extends true ? never : _Error["Type"]) | E | _Middleware["error"]["Type"] | _Middleware["~ClientError"], _Payload["EncodingServices"] | _Success["DecodingServices"] | _Error["DecodingServices"] | _Middleware["error"]["DecodingServices"]> : never;
}
/**
 * @since 4.0.0
 * @category client
 */
export type FromGroup<Group, E = never> = RpcClient<RpcGroup.Rpcs<Group>, E>;
/**
 * @since 4.0.0
 * @category client
 */
export declare const makeNoSerialization: <Rpcs extends Rpc.Any, E, const Flatten extends boolean = false>(group: RpcGroup.RpcGroup<Rpcs>, options: {
    readonly onFromClient: (options: {
        readonly message: FromClient<Rpcs>;
        readonly context: Context.Context<never>;
        readonly discard: boolean;
    }) => Effect.Effect<void, E>;
    readonly supportsAck?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly generateRequestId?: (() => RequestId) | undefined;
    readonly disableTracing?: boolean | undefined;
    readonly flatten?: Flatten | undefined;
}) => Effect.Effect<{
    readonly client: Flatten extends true ? RpcClient.Flat<Rpcs, E> : RpcClient<Rpcs, E>;
    readonly write: (message: FromServer<Rpcs>) => Effect.Effect<void>;
}, never, Scope.Scope | Rpc.MiddlewareClient<Rpcs>>;
/**
 * @since 4.0.0
 * @category client
 */
export declare const make: <Rpcs extends Rpc.Any, const Flatten extends boolean = false>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly generateRequestId?: (() => RequestId) | undefined;
    readonly disableTracing?: boolean | undefined;
    readonly flatten?: Flatten | undefined;
} | undefined) => Effect.Effect<Flatten extends true ? RpcClient.Flat<Rpcs, RpcClientError> : RpcClient<Rpcs, RpcClientError>, never, Protocol | Rpc.MiddlewareClient<Rpcs> | Scope.Scope>;
/**
 * @since 4.0.0
 * @category headers
 */
export declare const CurrentHeaders: Context.Reference<Headers.Headers>;
/**
 * @since 4.0.0
 * @category headers
 */
export declare const withHeaders: {
    /**
     * @since 4.0.0
     * @category headers
     */
    (headers: Headers.Input): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * @since 4.0.0
     * @category headers
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>, headers: Headers.Input): Effect.Effect<A, E, R>;
};
declare const Protocol_base: Context.ServiceClass<Protocol, "effect/rpc/RpcClient/Protocol", {
    readonly run: (clientId: number, f: (data: FromServerEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
    readonly send: (clientId: number, request: FromClientEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void, RpcClientError>;
    readonly supportsAck: boolean;
    readonly supportsTransferables: boolean;
}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class Protocol extends Protocol_base {
    /**
     * @since 4.0.0
     */
    static make: <EX, RX>(f: (write: (clientId: number, response: FromServerEncoded) => Effect.Effect<void>, clientIds: ReadonlySet<number>) => Effect.Effect<Omit<Protocol["Service"], "run">, EX, RX>) => Effect.Effect<Protocol["Service"], EX, RX>;
}
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolHttp: (client: HttpClient.HttpClient) => Effect.Effect<Protocol["Service"], never, RpcSerialization.RpcSerialization>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolHttp: (options: {
    readonly url: string;
    readonly transformClient?: <E, R>(client: HttpClient.HttpClient.With<E, R>) => HttpClient.HttpClient.With<E, R>;
}) => Layer.Layer<Protocol, never, RpcSerialization.RpcSerialization | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolSocket: (options?: {
    readonly retryTransientErrors?: boolean | undefined;
    readonly retryPolicy?: Schedule.Schedule<any, Socket.SocketError> | undefined;
}) => Effect.Effect<Protocol["Service"], never, Scope.Scope | RpcSerialization.RpcSerialization | Socket.Socket>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolSocket: (options?: {
    readonly retryTransientErrors?: boolean | undefined;
}) => Layer.Layer<Protocol, never, Socket.Socket | RpcSerialization.RpcSerialization>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolWorker: (options: {
    readonly size: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
} | {
    readonly minSize: number;
    readonly maxSize: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
    readonly timeToLive: Duration.Input;
}) => Effect.Effect<Protocol["Service"], WorkerError, Scope.Scope | Worker.WorkerPlatform | Worker.Spawner>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolWorker: (options: {
    readonly size: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
} | {
    readonly minSize: number;
    readonly maxSize: number;
    readonly concurrency?: number | undefined;
    readonly targetUtilization?: number | undefined;
    readonly timeToLive: Duration.Input;
}) => Layer.Layer<Protocol, WorkerError, Worker.WorkerPlatform | Worker.Spawner>;
declare const ConnectionHooks_base: Context.ServiceClass<ConnectionHooks, "effect/rpc/RpcClient/ConnectionHooks", {
    readonly onConnect: Effect.Effect<void>;
    readonly onDisconnect: Effect.Effect<void>;
}>;
/**
 * @since 4.0.0
 * @category ConnectionHooks
 */
export declare class ConnectionHooks extends ConnectionHooks_base {
}
export {};
//# sourceMappingURL=RpcClient.d.ts.map