/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type { Scope } from "../../Scope.ts";
import * as HttpClient from "../http/HttpClient.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
import type * as HttpServer from "../http/HttpServer.ts";
import type { HttpServerRequest } from "../http/HttpServerRequest.ts";
import type { HttpServerResponse } from "../http/HttpServerResponse.ts";
import * as RpcSerialization from "../rpc/RpcSerialization.ts";
import * as Socket from "../socket/Socket.ts";
import type { MessageStorage } from "./MessageStorage.ts";
import type { RunnerHealth } from "./RunnerHealth.ts";
import * as Runners from "./Runners.ts";
import { RpcClientProtocol } from "./Runners.ts";
import type { RunnerStorage } from "./RunnerStorage.ts";
import * as Sharding from "./Sharding.ts";
import type * as ShardingConfig from "./ShardingConfig.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientProtocolHttp: (options: {
    readonly path: string;
    readonly https?: boolean | undefined;
}) => Layer.Layer<RpcClientProtocol, never, RpcSerialization.RpcSerialization | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientProtocolHttpDefault: Layer.Layer<Runners.RpcClientProtocol, never, RpcSerialization.RpcSerialization | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientProtocolWebsocket: (options: {
    readonly path: string;
    readonly https?: boolean | undefined;
}) => Layer.Layer<RpcClientProtocol, never, RpcSerialization.RpcSerialization | Socket.WebSocketConstructor>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientProtocolWebsocketDefault: Layer.Layer<Runners.RpcClientProtocol, never, RpcSerialization.RpcSerialization | Socket.WebSocketConstructor>;
/**
 * @since 4.0.0
 * @category Http App
 */
export declare const toHttpEffect: Effect.Effect<Effect.Effect<HttpServerResponse, never, Scope | HttpServerRequest>, never, Scope | RpcSerialization.RpcSerialization | Sharding.Sharding | MessageStorage>;
/**
 * @since 4.0.0
 * @category Http App
 */
export declare const toHttpEffectWebsocket: Effect.Effect<Effect.Effect<HttpServerResponse, never, Scope | HttpServerRequest>, never, Scope | RpcSerialization.RpcSerialization | Sharding.Sharding | MessageStorage>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClient: Layer.Layer<Sharding.Sharding | Runners.Runners, never, ShardingConfig.ShardingConfig | Runners.RpcClientProtocol | MessageStorage | RunnerStorage | RunnerHealth>;
/**
 * A HTTP layer for the `Runners` services, that adds a route to the provided
 * `HttpRouter`.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHttpOptions: (options: {
    readonly path: HttpRouter.PathInput;
}) => Layer.Layer<Sharding.Sharding | Runners.Runners, never, RunnerStorage | RunnerHealth | RpcSerialization.RpcSerialization | MessageStorage | ShardingConfig.ShardingConfig | Runners.RpcClientProtocol | HttpRouter.HttpRouter>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWebsocketOptions: (options: {
    readonly path: HttpRouter.PathInput;
}) => Layer.Layer<Sharding.Sharding | Runners.Runners, never, ShardingConfig.ShardingConfig | Runners.RpcClientProtocol | MessageStorage | RunnerStorage | RunnerHealth | RpcSerialization.RpcSerialization | HttpRouter.HttpRouter>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHttp: Layer.Layer<Sharding.Sharding | Runners.Runners, never, RpcSerialization.RpcSerialization | ShardingConfig.ShardingConfig | HttpClient.HttpClient | HttpServer.HttpServer | MessageStorage | RunnerStorage | RunnerHealth>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHttpClientOnly: Layer.Layer<Sharding.Sharding | Runners.Runners, never, RpcSerialization.RpcSerialization | ShardingConfig.ShardingConfig | HttpClient.HttpClient | MessageStorage | RunnerStorage>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWebsocket: Layer.Layer<Sharding.Sharding | Runners.Runners, never, RpcSerialization.RpcSerialization | ShardingConfig.ShardingConfig | Socket.WebSocketConstructor | HttpServer.HttpServer | MessageStorage | RunnerStorage | RunnerHealth>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWebsocketClientOnly: Layer.Layer<Sharding.Sharding | Runners.Runners, never, ShardingConfig.ShardingConfig | MessageStorage | RunnerStorage | RpcSerialization.RpcSerialization | Socket.WebSocketConstructor>;
//# sourceMappingURL=HttpRunner.d.ts.map