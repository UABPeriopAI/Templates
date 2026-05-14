import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Queue from "../../Queue.ts";
import * as Scope from "../../Scope.ts";
import { Stdio } from "../../Stdio.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
import * as HttpServerRequest from "../http/HttpServerRequest.ts";
import * as HttpServerResponse from "../http/HttpServerResponse.ts";
import * as SocketServer from "../socket/SocketServer.ts";
import type { WorkerError } from "../workers/WorkerError.ts";
import * as WorkerRunner from "../workers/WorkerRunner.ts";
import * as Rpc from "./Rpc.ts";
import type * as RpcGroup from "./RpcGroup.ts";
import type { FromClient, FromClientEncoded, FromServer, FromServerEncoded } from "./RpcMessage.ts";
import * as RpcSerialization from "./RpcSerialization.ts";
/**
 * @since 4.0.0
 * @category server
 */
export interface RpcServer<A extends Rpc.Any> {
    readonly write: (clientId: number, message: FromClient<A>) => Effect.Effect<void>;
    readonly disconnect: (clientId: number) => Effect.Effect<void>;
}
/**
 * @since 4.0.0
 * @category server
 */
export declare const makeNoSerialization: <Rpcs extends Rpc.Any>(group: RpcGroup.RpcGroup<Rpcs>, options: {
    readonly onFromServer: (response: FromServer<Rpcs>) => Effect.Effect<void>;
    readonly disableTracing?: boolean | undefined;
    readonly disableSpanPropagation?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly disableClientAcks?: boolean | undefined;
    readonly concurrency?: number | "unbounded" | undefined;
    readonly disableFatalDefects?: boolean | undefined;
}) => Effect.Effect<RpcServer<Rpcs>, never, Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Scope.Scope>;
/**
 * @since 4.0.0
 * @category server
 */
export declare const make: <Rpcs extends Rpc.Any>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly disableTracing?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly concurrency?: number | "unbounded" | undefined;
    readonly disableFatalDefects?: boolean | undefined;
} | undefined) => Effect.Effect<never, never, Protocol | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.ServicesServer<Rpcs>>;
/**
 * @since 4.0.0
 * @category server
 */
export declare const layer: <Rpcs extends Rpc.Any>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly disableTracing?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly concurrency?: number | "unbounded" | undefined;
    readonly disableFatalDefects?: boolean | undefined;
}) => Layer.Layer<never, never, Protocol | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.ServicesServer<Rpcs>>;
/**
 * Create a RPC server that registers a HTTP route with a `HttpRouter`.
 *
 * It defaults to using websockets for communication, but can be configured to
 * use HTTP.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const layerHttp: <Rpcs extends Rpc.Any>(options: {
    readonly group: RpcGroup.RpcGroup<Rpcs>;
    readonly path: HttpRouter.PathInput;
    readonly protocol?: "http" | "websocket" | undefined;
    readonly disableTracing?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly concurrency?: number | "unbounded" | undefined;
    readonly disableFatalDefects?: boolean | undefined;
}) => Layer.Layer<never, never, RpcSerialization.RpcSerialization | HttpRouter.HttpRouter | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.ServicesServer<Rpcs>>;
declare const Protocol_base: Context.ServiceClass<Protocol, "effect/rpc/RpcServer/Protocol", {
    readonly run: (f: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
    readonly disconnects: Queue.Dequeue<number>;
    readonly send: (clientId: number, response: FromServerEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void>;
    readonly end: (clientId: number) => Effect.Effect<void>;
    readonly clientIds: Effect.Effect<ReadonlySet<number>>;
    readonly initialMessage: Effect.Effect<Option.Option<unknown>>;
    readonly supportsAck: boolean;
    readonly supportsTransferables: boolean;
    readonly supportsSpanPropagation: boolean;
}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class Protocol extends Protocol_base {
    /**
     * @since 4.0.0
     */
    static make: <EX, RX>(f: (write: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<Omit<{
        readonly run: (f: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
        readonly disconnects: Queue.Dequeue<number>;
        readonly send: (clientId: number, response: FromServerEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void>;
        readonly end: (clientId: number) => Effect.Effect<void>;
        readonly clientIds: Effect.Effect<ReadonlySet<number>>;
        readonly initialMessage: Effect.Effect<Option.Option<unknown>>;
        readonly supportsAck: boolean;
        readonly supportsTransferables: boolean;
        readonly supportsSpanPropagation: boolean;
    }, "run">, EX, RX>) => Effect.Effect<{
        readonly run: (f: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
        readonly disconnects: Queue.Dequeue<number>;
        readonly send: (clientId: number, response: FromServerEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void>;
        readonly end: (clientId: number) => Effect.Effect<void>;
        readonly clientIds: Effect.Effect<ReadonlySet<number>>;
        readonly initialMessage: Effect.Effect<Option.Option<unknown>>;
        readonly supportsAck: boolean;
        readonly supportsTransferables: boolean;
        readonly supportsSpanPropagation: boolean;
    }, EX, RX>;
}
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolSocketServer: Effect.Effect<{
    readonly run: (f: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
    readonly disconnects: Queue.Dequeue<number>;
    readonly send: (clientId: number, response: FromServerEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void>;
    readonly end: (clientId: number) => Effect.Effect<void>;
    readonly clientIds: Effect.Effect<ReadonlySet<number>>;
    readonly initialMessage: Effect.Effect<Option.Option<unknown>>;
    readonly supportsAck: boolean;
    readonly supportsTransferables: boolean;
    readonly supportsSpanPropagation: boolean;
}, never, Scope.Scope | RpcSerialization.RpcSerialization | SocketServer.SocketServer>;
/**
 * A rpc protocol that uses `SocketServer` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolSocketServer: Layer.Layer<Protocol, never, RpcSerialization.RpcSerialization | SocketServer.SocketServer>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolWithHttpEffectWebsocket: Effect.Effect<{
    readonly protocol: Protocol["Service"];
    readonly httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, never, Scope.Scope | HttpServerRequest.HttpServerRequest>;
}, never, RpcSerialization.RpcSerialization>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolWebsocket: (options: {
    readonly path: HttpRouter.PathInput;
}) => Effect.Effect<Protocol["Service"], never, RpcSerialization.RpcSerialization | HttpRouter.HttpRouter>;
/**
 * A rpc protocol that uses websockets for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolWebsocket: (options: {
    readonly path: HttpRouter.PathInput;
}) => Layer.Layer<Protocol, never, RpcSerialization.RpcSerialization | HttpRouter.HttpRouter>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolWithHttpEffect: Effect.Effect<{
    readonly protocol: Protocol["Service"];
    readonly httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, never, Scope.Scope | HttpServerRequest.HttpServerRequest>;
}, never, RpcSerialization.RpcSerialization>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolHttp: (options: {
    readonly path: HttpRouter.PathInput;
}) => Effect.Effect<Protocol["Service"], never, RpcSerialization.RpcSerialization | HttpRouter.HttpRouter>;
/**
 * A rpc protocol that uses websockets for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolHttp: (options: {
    readonly path: HttpRouter.PathInput;
}) => Layer.Layer<Protocol, never, RpcSerialization.RpcSerialization | HttpRouter.HttpRouter>;
/**
 * @since 4.0.0
 * @category http app
 */
export declare const toHttpEffect: <Rpcs extends Rpc.Any>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly disableTracing?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly disableFatalDefects?: boolean | undefined;
} | undefined) => Effect.Effect<Effect.Effect<HttpServerResponse.HttpServerResponse, never, Scope.Scope | HttpServerRequest.HttpServerRequest>, never, Scope.Scope | RpcSerialization.RpcSerialization | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.ServicesServer<Rpcs>>;
/**
 * @since 4.0.0
 * @category http app
 */
export declare const toHttpEffectWebsocket: <Rpcs extends Rpc.Any>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly disableTracing?: boolean | undefined;
    readonly spanPrefix?: string | undefined;
    readonly spanAttributes?: Record<string, unknown> | undefined;
    readonly disableFatalDefects?: boolean | undefined;
} | undefined) => Effect.Effect<Effect.Effect<HttpServerResponse.HttpServerResponse, never, Scope.Scope | HttpServerRequest.HttpServerRequest>, never, Scope.Scope | RpcSerialization.RpcSerialization | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.ServicesServer<Rpcs>>;
/**
 * Create a protocol that uses the provided `Stream` and `Sink` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolStdio: Effect.Effect<{
    readonly run: (f: (clientId: number, data: FromClientEncoded) => Effect.Effect<void>) => Effect.Effect<never>;
    readonly disconnects: Queue.Dequeue<number>;
    readonly send: (clientId: number, response: FromServerEncoded, transferables?: ReadonlyArray<globalThis.Transferable>) => Effect.Effect<void>;
    readonly end: (clientId: number) => Effect.Effect<void>;
    readonly clientIds: Effect.Effect<ReadonlySet<number>>;
    readonly initialMessage: Effect.Effect<Option.Option<unknown>>;
    readonly supportsAck: boolean;
    readonly supportsTransferables: boolean;
    readonly supportsSpanPropagation: boolean;
}, never, Scope.Scope | Stdio | RpcSerialization.RpcSerialization>;
/**
 * Create a protocol that uses the provided `Stream` and `Sink` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolStdio: Layer.Layer<Protocol, never, RpcSerialization.RpcSerialization | Stdio>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const makeProtocolWorkerRunner: Effect.Effect<Protocol["Service"], WorkerError, WorkerRunner.WorkerRunnerPlatform | Scope.Scope>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare const layerProtocolWorkerRunner: Layer.Layer<Protocol, WorkerError, WorkerRunner.WorkerRunnerPlatform>;
export {};
//# sourceMappingURL=RpcServer.d.ts.map