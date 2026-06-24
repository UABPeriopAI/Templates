/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as FileSystem from "../../FileSystem.js";
import { dual } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Path from "../../Path.js";
import * as Etag from "./Etag.js";
import * as HttpClient from "./HttpClient.js";
import * as ClientRequest from "./HttpClientRequest.js";
import * as HttpPlatform from "./HttpPlatform.js";
/**
 * @since 4.0.0
 * @category models
 */
export class HttpServer extends /*#__PURE__*/Context.Service()("effect/http/HttpServer") {}
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => options;
/**
 * @since 4.0.0
 * @category accessors
 */
export const serve = /*#__PURE__*/dual(args => Effect.isEffect(args[0]), (effect, middleware) => Layer.effectDiscard(HttpServer.use(server => server.serve(effect, middleware))));
/**
 * @since 4.0.0
 * @category accessors
 */
export const serveEffect = /*#__PURE__*/dual(args => Effect.isEffect(args[0]), (effect, middleware) => HttpServer.use(server => server.serve(effect, middleware)));
/**
 * @since 4.0.0
 * @category address
 */
export const formatAddress = address => {
  switch (address._tag) {
    case "UnixAddress":
      return `unix://${address.path}`;
    case "TcpAddress":
      return `http://${address.hostname}:${address.port}`;
  }
};
/**
 * @since 4.0.0
 * @category address
 */
export const addressFormattedWith = f => Effect.flatMap(HttpServer.asEffect(), server => f(formatAddress(server.address)));
/**
 * @since 4.0.0
 * @category address
 */
export const logAddress = /*#__PURE__*/addressFormattedWith(_ => Effect.log(`Listening on ${_}`));
/**
 * @since 4.0.0
 * @category address
 */
export const withLogAddress = layer => Layer.effectDiscard(logAddress).pipe(Layer.provideMerge(layer));
/**
 * @since 4.0.0
 * @category Testing
 */
export const makeTestClient = /*#__PURE__*/Effect.gen(function* () {
  const server = yield* HttpServer;
  const client = yield* HttpClient.HttpClient;
  const address = server.address;
  if (address._tag === "UnixAddress") {
    return yield* Effect.die(new Error("HttpServer.layerTestClient: UnixAddress not supported"));
  }
  const host = address.hostname === "0.0.0.0" ? "127.0.0.1" : address.hostname;
  const url = `http://${host}:${address.port}`;
  return HttpClient.mapRequest(client, ClientRequest.prependUrl(url));
});
/**
 * @since 4.0.0
 * @category Testing
 */
export const layerTestClient = /*#__PURE__*/Layer.effect(HttpClient.HttpClient)(makeTestClient);
/**
 * @since 4.0.0
 * @category Testing
 */
export const layerServices = /*#__PURE__*/Layer.mergeAll(HttpPlatform.layer, Path.layer, Etag.layerWeak).pipe(/*#__PURE__*/Layer.provideMerge(/*#__PURE__*/FileSystem.layerNoop({})));
//# sourceMappingURL=HttpServer.js.map