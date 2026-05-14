/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import { hasProperty } from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Response from "./HttpServerResponse.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const symbol = "~effect/http/HttpServerRespondable";
/**
 * @since 4.0.0
 * @category guards
 */
export const isRespondable = u => hasProperty(u, symbol);
const badRequest = /*#__PURE__*/Response.empty({
  status: 400
});
const notFound = /*#__PURE__*/Response.empty({
  status: 404
});
/**
 * @since 4.0.0
 * @category accessors
 */
export const toResponse = self => {
  if (Response.isHttpServerResponse(self)) {
    return Effect.succeed(self);
  }
  return Effect.orDie(self[symbol]());
};
/**
 * @since 4.0.0
 * @category accessors
 */
export const toResponseOrElse = (u, orElse) => {
  if (Response.isHttpServerResponse(u)) {
    return Effect.succeed(u);
  } else if (isRespondable(u)) {
    return Effect.catchCause(u[symbol](), () => Effect.succeed(orElse));
    // add support for some commmon types
  } else if (Schema.isSchemaError(u)) {
    return Effect.succeed(badRequest);
  } else if (Cause.isNoSuchElementError(u)) {
    return Effect.succeed(notFound);
  }
  return Effect.succeed(orElse);
};
/**
 * @since 4.0.0
 * @category accessors
 */
export const toResponseOrElseDefect = (u, orElse) => {
  if (Response.isHttpServerResponse(u)) {
    return Effect.succeed(u);
  } else if (isRespondable(u)) {
    return Effect.catchCause(u[symbol](), () => Effect.succeed(orElse));
  }
  return Effect.succeed(orElse);
};
//# sourceMappingURL=HttpServerRespondable.js.map