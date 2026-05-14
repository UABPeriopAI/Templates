/**
 * @since 4.0.0
 */
import * as Schema from "../../Schema.js";
import { HttpClientErrorSchema } from "../http/HttpClientError.js";
import { SocketErrorReason } from "../socket/Socket.js";
import { WorkerErrorReason } from "../workers/WorkerError.js";
const TypeId = "~effect/rpc/RpcClientError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class RpcClientDefect extends /*#__PURE__*/Schema.ErrorClass("effect/rpc/RpcClientError/RpcClientDefect")({
  _tag: /*#__PURE__*/Schema.tag("RpcClientDefect"),
  message: Schema.String,
  cause: Schema.Defect
}) {}
/**
 * @since 4.0.0
 * @category Errors
 */
export class RpcClientError extends /*#__PURE__*/Schema.ErrorClass(TypeId)({
  _tag: /*#__PURE__*/Schema.tag("RpcClientError"),
  reason: /*#__PURE__*/Schema.Union([WorkerErrorReason, SocketErrorReason, HttpClientErrorSchema, RpcClientDefect])
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  get message() {
    return `${this.reason._tag}: ${this.reason.message}`;
  }
}
//# sourceMappingURL=RpcClientError.js.map