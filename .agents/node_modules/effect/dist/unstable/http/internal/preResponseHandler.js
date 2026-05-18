import * as Effect from "../../../Effect.js";
/** @internal */
export const requestPreResponseHandlers = /*#__PURE__*/new WeakMap();
/** @internal */
export const appendPreResponseHandlerUnsafe = (request, handler) => {
  const prev = requestPreResponseHandlers.get(request.source);
  const next = prev ? (request, response) => Effect.flatMap(prev(request, response), response => handler(request, response)) : handler;
  requestPreResponseHandlers.set(request.source, next);
};
//# sourceMappingURL=preResponseHandler.js.map