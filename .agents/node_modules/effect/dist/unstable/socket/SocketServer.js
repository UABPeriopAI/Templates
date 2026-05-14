/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
/**
 * @since 4.0.0
 * @category tags
 */
export class SocketServer extends /*#__PURE__*/Context.Service()("@effect/platform/SocketServer") {}
/**
 * @since 4.0.0
 * @category errors
 */
export const ErrorTypeId = "@effect/platform/SocketServer/SocketServerError";
/**
 * @since 4.0.0
 * @category errors
 */
export class SocketServerOpenError extends /*#__PURE__*/Data.TaggedError("SocketServerOpenError") {
  get message() {
    return "Open";
  }
}
/**
 * @since 4.0.0
 * @category errors
 */
export class SocketServerUnknownError extends /*#__PURE__*/Data.TaggedError("SocketServerUnknownError") {
  get message() {
    return "Unknown";
  }
}
/**
 * @since 4.0.0
 * @category errors
 */
export class SocketServerError extends /*#__PURE__*/Data.TaggedError("SocketServerError") {
  constructor(props) {
    super({
      ...props,
      cause: props.reason.cause
    });
  }
  /**
   * @since 4.0.0
   */
  [ErrorTypeId] = ErrorTypeId;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.reason.message;
  }
}
//# sourceMappingURL=SocketServer.js.map