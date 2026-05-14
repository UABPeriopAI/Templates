import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import { dual } from "../../Function.js";
import { reportCauseUnsafe } from "../../internal/effect.js";
import * as Layer from "../../Layer.js";
import * as Scope from "../../Scope.js";
import * as Stream from "../../Stream.js";
import * as HttpBody from "./HttpBody.js";
import { tracer } from "./HttpMiddleware.js";
import { causeResponse, ClientAbort, HttpServerError, InternalError } from "./HttpServerError.js";
import { HttpServerRequest } from "./HttpServerRequest.js";
import * as Request from "./HttpServerRequest.js";
import * as Response from "./HttpServerResponse.js";
import { appendPreResponseHandlerUnsafe, requestPreResponseHandlers } from "./internal/preResponseHandler.js";
/**
 * @since 4.0.0
 * @category combinators
 */
export const toHandled = (self, handleResponse, middleware) => {
  const handleCause = cause => Effect.flatMapEager(causeResponse(cause), ([response, cause]) => {
    const fiber = Fiber.getCurrent();
    reportCauseUnsafe(fiber, cause);
    const request = Context.getUnsafe(fiber.context, HttpServerRequest);
    const handler = requestPreResponseHandlers.get(request.source);
    const cont = cause.reasons.length === 0 ? Effect.succeed(response) : Effect.failCause(cause);
    if (handler === undefined) {
      ;
      request[handledSymbol] = true;
      return Effect.flatMapEager(handleResponse(request, response), () => cont);
    }
    return Effect.flatMapEager(Effect.flatMapEager(handler(request, response), response => {
      ;
      request[handledSymbol] = true;
      return handleResponse(request, response);
    }), () => cont);
  });
  const responded = Effect.matchCauseEffect(self, {
    onSuccess: response => {
      const fiber = Fiber.getCurrent();
      const request = Context.getUnsafe(fiber.context, HttpServerRequest);
      const handler = requestPreResponseHandlers.get(request.source);
      if (handler === undefined) {
        ;
        request[handledSymbol] = true;
        return Effect.mapEager(handleResponse(request, response), () => response);
      }
      return Effect.flatMapEager(handler(request, response), sentResponse => {
        ;
        request[handledSymbol] = true;
        return Effect.mapEager(handleResponse(request, sentResponse), () => response);
      });
    },
    onFailure: handleCause
  });
  const withMiddleware = middleware === undefined ? tracer(responded) : Effect.matchCauseEffect(tracer(middleware(responded)), {
    onFailure(cause) {
      const fiber = Fiber.getCurrent();
      reportCauseUnsafe(fiber, cause);
      const request = Context.getUnsafe(fiber.context, HttpServerRequest);
      if (handledSymbol in request) return Effect.void;
      return Effect.matchCauseEffectEager(causeResponse(cause), {
        onFailure(_) {
          return handleResponse(request, Response.empty({
            status: 500
          }));
        },
        onSuccess([response]) {
          return handleResponse(request, response);
        }
      });
    },
    onSuccess(response) {
      const fiber = Fiber.getCurrent();
      const request = Context.getUnsafe(fiber.context, Request.HttpServerRequest);
      return handledSymbol in request ? Effect.void : handleResponse(request, response);
    }
  });
  return Effect.uninterruptible(scoped(withMiddleware));
};
const handledSymbol = /*#__PURE__*/Symbol.for("effect/http/HttpEffect/handled");
/**
 * If you want to finalize the http request scope elsewhere, you can use this
 * function to eject from the default scope closure.
 *
 * @since 4.0.0
 * @category Scope
 */
export const scopeDisableClose = scope => {
  ;
  scope[scopeEjected] = true;
};
/**
 * @since 4.0.0
 * @category Scope
 */
export const scopeTransferToStream = response => {
  if (response.body._tag !== "Stream") {
    return response;
  }
  const fiber = Fiber.getCurrent();
  const scope = Context.getUnsafe(fiber.context, Scope.Scope);
  scopeDisableClose(scope);
  return Response.setBody(response, HttpBody.stream(Stream.onExit(response.body.stream, exit => Scope.close(scope, exit)), response.body.contentType, response.body.contentLength));
};
const scopeEjected = /*#__PURE__*/Symbol.for("effect/http/HttpEffect/scopeEjected");
const scoped = effect => Effect.withFiber(fiber => {
  const scope = Scope.makeUnsafe();
  const prevServices = fiber.context;
  fiber.setContext(Context.add(fiber.context, Scope.Scope, scope));
  return Effect.onExitPrimitive(effect, exit => {
    fiber.setContext(prevServices);
    if (scopeEjected in scope) return undefined;
    return Scope.closeUnsafe(scope, exit);
  }, true);
});
/**
 * @since 4.0.0
 * @category fiber refs
 */
export const appendPreResponseHandler = handler => HttpServerRequest.use(request => {
  appendPreResponseHandlerUnsafe(request, handler);
  return Effect.void;
});
export {
/**
 * @since 4.0.0
 * @category fiber refs
 */
appendPreResponseHandlerUnsafe };
/**
 * @since 4.0.0
 * @category fiber refs
 */
export const withPreResponseHandler = /*#__PURE__*/dual(2, (self, handler) => HttpServerRequest.use(request => {
  appendPreResponseHandlerUnsafe(request, handler);
  return self;
}));
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWebHandlerWith = context => (self, middleware) => {
  const resolveSymbol = Symbol.for("@effect/platform/HttpApp/resolve");
  const httpApp = toHandled(self, (request, response) => {
    response = scopeTransferToStream(response);
    request[resolveSymbol](Response.toWeb(response, {
      withoutBody: request.method === "HEAD",
      context
    }));
    return Effect.void;
  }, middleware);
  return (request, reqContext) => new Promise(resolve => {
    const contextMap = new Map(context.mapUnsafe);
    if (Context.isContext(reqContext)) {
      for (const [key, value] of reqContext.mapUnsafe) {
        contextMap.set(key, value);
      }
    }
    const httpServerRequest = Request.fromWeb(request);
    contextMap.set(HttpServerRequest.key, httpServerRequest);
    httpServerRequest[resolveSymbol] = resolve;
    const fiber = Effect.runForkWith(Context.makeUnsafe(contextMap))(httpApp);
    request.signal?.addEventListener("abort", () => {
      fiber.interruptUnsafe(undefined, ClientAbort.annotation);
    }, {
      once: true
    });
  });
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWebHandler = /*#__PURE__*/toWebHandlerWith(/*#__PURE__*/Context.empty());
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWebHandlerLayerWith = (layer, options) => {
  const scope = Scope.makeUnsafe();
  const dispose = () => Effect.runPromise(Scope.close(scope, Exit.void));
  let handlerCache;
  let handlerPromise;
  function handler(request, context) {
    if (handlerCache) {
      return handlerCache(request, context);
    }
    handlerPromise ??= Effect.runPromise(Effect.gen(function* () {
      const context = yield* options.memoMap ? Layer.buildWithMemoMap(layer, options.memoMap, scope) : Layer.buildWithScope(layer, scope);
      return handlerCache = toWebHandlerWith(context)(yield* options.toHandler(context), options.middleware);
    }));
    return handlerPromise.then(f => f(request, context));
  }
  return {
    dispose,
    handler: handler
  };
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWebHandlerLayer = (self, layer, options) => toWebHandlerLayerWith(layer, {
  ...options,
  toHandler: () => Effect.succeed(self)
});
/**
 * @since 4.0.0
 * @category conversions
 */
export const fromWebHandler = handler => Effect.callback((resume, signal) => {
  const fiber = Fiber.getCurrent();
  const request = Context.getUnsafe(fiber.context, HttpServerRequest);
  const requestResult = Request.toWebResult(request, {
    signal,
    context: fiber.context
  });
  if (requestResult._tag === "Failure") {
    return resume(Effect.fail(new HttpServerError({
      reason: requestResult.failure
    })));
  }
  handler(requestResult.success).then(response => resume(Effect.succeed(Response.fromWeb(response))), cause => resume(Effect.fail(new HttpServerError({
    reason: new InternalError({
      cause,
      request,
      description: "HttpApp.fromWebHandler: Error in handler"
    })
  }))));
});
//# sourceMappingURL=HttpEffect.js.map