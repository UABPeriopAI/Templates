/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as RpcServer from "../rpc/RpcServer.js";
import { SocketServer } from "../socket/SocketServer.js";
import * as RunnerServer from "./RunnerServer.js";
const withLogAddress = layer => Layer.effectDiscard(Effect.gen(function* () {
  const server = yield* SocketServer;
  const address = server.address._tag === "UnixAddress" ? server.address.path : `${server.address.hostname}:${server.address.port}`;
  yield* Effect.annotateLogs(Effect.logInfo(`Listening on: ${address}`), {
    package: "@effect/cluster",
    service: "Runner"
  });
})).pipe(Layer.provideMerge(layer));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/RunnerServer.layerWithClients.pipe(withLogAddress, /*#__PURE__*/Layer.provide(RpcServer.layerProtocolSocketServer));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerClientOnly = RunnerServer.layerClientOnly;
//# sourceMappingURL=SocketRunner.js.map