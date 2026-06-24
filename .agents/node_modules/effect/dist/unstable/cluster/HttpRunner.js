/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as HttpClient from "../http/HttpClient.js";
import * as HttpClientRequest from "../http/HttpClientRequest.js";
import * as HttpRouter from "../http/HttpRouter.js";
import * as RpcClient from "../rpc/RpcClient.js";
import * as RpcSerialization from "../rpc/RpcSerialization.js";
import * as RpcServer from "../rpc/RpcServer.js";
import * as Socket from "../socket/Socket.js";
import * as Runners from "./Runners.js";
import { RpcClientProtocol } from "./Runners.js";
import * as RunnerServer from "./RunnerServer.js";
import * as Sharding from "./Sharding.js";
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClientProtocolHttp = options => Layer.effect(RpcClientProtocol)(Effect.gen(function* () {
  const serialization = yield* RpcSerialization.RpcSerialization;
  const client = yield* HttpClient.HttpClient;
  const https = options.https ?? false;
  return address => {
    const clientWithUrl = HttpClient.mapRequest(client, HttpClientRequest.prependUrl(`http${https ? "s" : ""}://${address.host}:${address.port}/${options.path}`));
    return RpcClient.makeProtocolHttp(clientWithUrl).pipe(Effect.provideService(RpcSerialization.RpcSerialization, serialization));
  };
}));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClientProtocolHttpDefault = /*#__PURE__*/layerClientProtocolHttp({
  path: "/"
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClientProtocolWebsocket = options => Layer.effect(RpcClientProtocol)(Effect.gen(function* () {
  const serialization = yield* RpcSerialization.RpcSerialization;
  const https = options.https ?? false;
  const constructor = yield* Socket.WebSocketConstructor;
  return Effect.fnUntraced(function* (address) {
    const socket = yield* Socket.makeWebSocket(`ws${https ? "s" : ""}://${address.host}:${address.port}/${options.path}`).pipe(Effect.provideService(Socket.WebSocketConstructor, constructor));
    return yield* RpcClient.makeProtocolSocket().pipe(Effect.provideService(Socket.Socket, socket), Effect.provideService(RpcSerialization.RpcSerialization, serialization));
  });
}));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClientProtocolWebsocketDefault = /*#__PURE__*/layerClientProtocolWebsocket({
  path: "/"
});
/**
 * @since 4.0.0
 * @category Http App
 */
export const toHttpEffect = /*#__PURE__*/Effect.gen(function* () {
  const handlers = yield* Layer.build(RunnerServer.layerHandlers);
  return yield* RpcServer.toHttpEffect(Runners.Rpcs, {
    spanPrefix: "RunnerServer",
    disableTracing: true
  }).pipe(Effect.provideContext(handlers));
});
/**
 * @since 4.0.0
 * @category Http App
 */
export const toHttpEffectWebsocket = /*#__PURE__*/Effect.gen(function* () {
  const handlers = yield* Layer.build(RunnerServer.layerHandlers);
  return yield* RpcServer.toHttpEffectWebsocket(Runners.Rpcs, {
    spanPrefix: "RunnerServer",
    disableTracing: true
  }).pipe(Effect.provideContext(handlers));
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClient = /*#__PURE__*/Sharding.layer.pipe(/*#__PURE__*/Layer.provideMerge(Runners.layerRpc));
/**
 * A HTTP layer for the `Runners` services, that adds a route to the provided
 * `HttpRouter`.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layerHttpOptions = options => RunnerServer.layerWithClients.pipe(Layer.provide(RpcServer.layerProtocolHttp(options)));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerWebsocketOptions = options => RunnerServer.layerWithClients.pipe(Layer.provide(RpcServer.layerProtocolWebsocket(options)));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerHttp = /*#__PURE__*/HttpRouter.serve(layerHttpOptions({
  path: "/"
})).pipe(/*#__PURE__*/Layer.provide(layerClientProtocolHttpDefault));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerHttpClientOnly = /*#__PURE__*/RunnerServer.layerClientOnly.pipe(/*#__PURE__*/Layer.provide(layerClientProtocolHttpDefault));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerWebsocket = /*#__PURE__*/HttpRouter.serve(layerWebsocketOptions({
  path: "/"
})).pipe(/*#__PURE__*/Layer.provide(layerClientProtocolWebsocketDefault));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerWebsocketClientOnly = /*#__PURE__*/RunnerServer.layerClientOnly.pipe(/*#__PURE__*/Layer.provide(layerClientProtocolWebsocketDefault));
//# sourceMappingURL=HttpRunner.js.map