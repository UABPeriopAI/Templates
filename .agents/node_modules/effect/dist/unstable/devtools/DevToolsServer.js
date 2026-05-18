/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as Queue from "../../Queue.js";
import * as Schema from "../../Schema.js";
import * as Stream from "../../Stream.js";
import * as Ndjson from "../encoding/Ndjson.js";
import * as Socket from "../socket/Socket.js";
import * as SocketServer from "../socket/SocketServer.js";
import * as DevToolsSchema from "./DevToolsSchema.js";
const RequestSchema = /*#__PURE__*/Schema.toCodecJson(DevToolsSchema.Request);
const ResponseSchema = /*#__PURE__*/Schema.toCodecJson(DevToolsSchema.Response);
/**
 * @since 4.0.0
 * @category constructors
 */
export const run = /*#__PURE__*/Effect.fnUntraced(function* (handle) {
  const server = yield* SocketServer.SocketServer;
  return yield* server.run(Effect.fnUntraced(function* (socket) {
    const responses = yield* Queue.unbounded();
    const requests = yield* Queue.unbounded();
    const client = {
      queue: requests,
      send: response => Queue.offer(responses, response).pipe(Effect.asVoid)
    };
    yield* Stream.fromQueue(responses).pipe(Stream.pipeThroughChannel(Ndjson.duplexSchemaString(Socket.toChannelString(socket), {
      inputSchema: ResponseSchema,
      outputSchema: RequestSchema
    })), Stream.runForEach(request => request._tag === "Ping" ? Queue.offer(responses, {
      _tag: "Pong"
    }) : Queue.offer(requests, request)), Effect.ensuring(Queue.shutdown(responses).pipe(Effect.andThen(Queue.shutdown(requests)))), Effect.forkChild);
    return yield* handle(client);
  }));
});
//# sourceMappingURL=DevToolsServer.js.map