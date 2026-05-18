/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as RpcClient from "./RpcClient.js";
import * as RpcServer from "./RpcServer.js";
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeClient = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  // oxlint-disable-next-line prefer-const
  let client;
  const server = yield* RpcServer.makeNoSerialization(group, {
    onFromServer(response) {
      return client.write(response);
    }
  });
  client = yield* RpcClient.makeNoSerialization(group, {
    supportsAck: true,
    flatten: options?.flatten,
    onFromClient({
      message
    }) {
      return server.write(0, message);
    }
  });
  return client.client;
});
//# sourceMappingURL=RpcTest.js.map