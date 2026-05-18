import * as Schema from "../../Schema.js";
/**
 * @since 4.0.0
 * @category request
 */
export const RequestId = id => typeof id === "bigint" ? id : BigInt(id);
/**
 * @since 4.0.0
 * @category request
 */
export const constEof = {
  _tag: "Eof"
};
/**
 * @since 4.0.0
 * @category request
 */
export const constPing = {
  _tag: "Ping"
};
/**
 * @since 4.0.0
 * @category response
 */
export const ResponseIdTypeId = "~effect//rpc/RpcServer/ResponseId";
const encodeDefect = /*#__PURE__*/Schema.encodeSync(Schema.Defect);
/**
 * @since 4.0.0
 * @category response
 */
export const ResponseExitDieEncoded = options => ({
  _tag: "Exit",
  requestId: options.requestId.toString(),
  exit: {
    _tag: "Failure",
    cause: [{
      _tag: "Die",
      defect: encodeDefect(options.defect)
    }]
  }
});
/**
 * @since 4.0.0
 * @category response
 */
export const ResponseDefectEncoded = input => ({
  _tag: "Defect",
  defect: encodeDefect(input)
});
/**
 * @since 4.0.0
 * @category response
 */
export const constPong = {
  _tag: "Pong"
};
//# sourceMappingURL=RpcMessage.js.map