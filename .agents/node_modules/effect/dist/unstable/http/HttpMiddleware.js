/**
 * @since 4.0.0
 */
import { Clock } from "../../Clock.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { constant, constFalse } from "../../Function.js";
import * as internalEffect from "../../internal/effect.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import { TracerEnabled } from "../../References.js";
import { ParentSpan } from "../../Tracer.js";
import * as Headers from "./Headers.js";
import { causeResponseStripped, exitResponse } from "./HttpServerError.js";
import { HttpServerRequest } from "./HttpServerRequest.js";
import * as Request from "./HttpServerRequest.js";
import * as Response from "./HttpServerResponse.js";
import * as TraceContext from "./HttpTraceContext.js";
import { appendPreResponseHandlerUnsafe } from "./internal/preResponseHandler.js";
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = middleware => middleware;
const loggerDisabledRequests = /*#__PURE__*/new WeakSet();
const stripSearchAndHash = url => {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  if (queryIndex === -1) {
    return hashIndex === -1 ? url : url.slice(0, hashIndex);
  }
  if (hashIndex === -1) {
    return url.slice(0, queryIndex);
  }
  return url.slice(0, Math.min(queryIndex, hashIndex));
};
/**
 * @since 4.0.0
 * @category Logger
 */
export const withLoggerDisabled = self => Effect.withFiber(fiber => {
  const request = Context.getUnsafe(fiber.context, HttpServerRequest);
  loggerDisabledRequests.add(request.source);
  return self;
});
/**
 * @since 4.0.0
 * @category Tracer
 */
export const TracerDisabledWhen = /*#__PURE__*/Context.Reference("effect/http/HttpMiddleware/TracerDisabledWhen", {
  defaultValue: () => constFalse
});
/**
 * @since 4.0.0
 * @category Tracer
 */
export const layerTracerDisabledForUrls = urls => Layer.succeed(TracerDisabledWhen)(req => urls.includes(req.url));
/**
 * @since 4.0.0
 * @category Tracer
 */
export const SpanNameGenerator = /*#__PURE__*/Context.Reference("@effect/platform/HttpMiddleware/SpanNameGenerator", {
  defaultValue: () => request => `http.server ${request.method}`
});
/**
 * @since 4.0.0
 * @category Logger
 */
export const logger = /*#__PURE__*/make(httpApp => {
  let counter = 0;
  return Effect.withFiber(fiber => {
    const request = Context.getUnsafe(fiber.context, HttpServerRequest);
    const path = stripSearchAndHash(request.url);
    return Effect.withLogSpan(Effect.flatMap(Effect.exit(httpApp), exit => {
      if (loggerDisabledRequests.has(request.source)) {
        return exit;
      } else if (exit._tag === "Failure") {
        const [response, cause] = causeResponseStripped(exit.cause);
        return Effect.andThen(Effect.annotateLogs(Effect.log(Option.getOrElse(cause, () => "Sent HTTP Response")), {
          "http.method": request.method,
          "http.url": path,
          "http.status": response.status
        }), exit);
      }
      return Effect.andThen(Effect.annotateLogs(Effect.log("Sent HTTP response"), {
        "http.method": request.method,
        "http.url": path,
        "http.status": exit.value.status
      }), exit);
    }), `http.span.${++counter}`);
  });
});
/**
 * @since 4.0.0
 * @category Tracer
 */
export const tracer = /*#__PURE__*/make(httpApp => Effect.withFiber(fiber => {
  const request = Context.getUnsafe(fiber.context, HttpServerRequest);
  const disabled = !fiber.getRef(TracerEnabled) || fiber.getRef(TracerDisabledWhen)(request);
  if (disabled) {
    return httpApp;
  }
  const nameGenerator = fiber.getRef(SpanNameGenerator);
  const span = internalEffect.makeSpanUnsafe(fiber, nameGenerator(request), {
    parent: Option.getOrUndefined(TraceContext.fromHeaders(request.headers)),
    kind: "server"
  });
  const prevServices = fiber.context;
  fiber.setContext(Context.add(fiber.context, ParentSpan, span));
  return Effect.onExitPrimitive(httpApp, exit => {
    fiber.setContext(prevServices);
    const endTime = fiber.getRef(Clock).currentTimeNanosUnsafe();
    fiber.currentDispatcher.scheduleTask(() => {
      const url = Request.toURL(request);
      if (Option.isSome(url) && (url.value.username !== "" || url.value.password !== "")) {
        url.value.username = "REDACTED";
        url.value.password = "REDACTED";
      }
      const redactedHeaderNames = fiber.getRef(Headers.CurrentRedactedNames);
      const requestHeaders = Headers.redact(request.headers, redactedHeaderNames);
      span.attribute("http.request.method", request.method);
      if (Option.isSome(url)) {
        span.attribute("url.full", url.value.toString());
        span.attribute("url.path", url.value.pathname);
        const query = url.value.search.slice(1);
        if (query !== "") {
          span.attribute("url.query", url.value.search.slice(1));
        }
        span.attribute("url.scheme", url.value.protocol.slice(0, -1));
      }
      if (request.headers["user-agent"] !== undefined) {
        span.attribute("user_agent.original", request.headers["user-agent"]);
      }
      for (const name in requestHeaders) {
        span.attribute(`http.request.header.${name}`, String(requestHeaders[name]));
      }
      if (Option.isSome(request.remoteAddress)) {
        span.attribute("client.address", request.remoteAddress.value);
      }
      const response = exitResponse(exit);
      span.attribute("http.response.status_code", response.status);
      const responseHeaders = Headers.redact(response.headers, redactedHeaderNames);
      for (const name in responseHeaders) {
        span.attribute(`http.response.header.${name}`, String(responseHeaders[name]));
      }
      span.end(endTime, exit);
    }, 0);
    return undefined;
  }, true);
}));
/**
 * @since 4.0.0
 * @category Proxying
 */
export const xForwardedHeaders = /*#__PURE__*/make(httpApp => Effect.updateService(httpApp, HttpServerRequest, request => request.headers["x-forwarded-host"] ? request.modify({
  headers: Headers.set(request.headers, "host", request.headers["x-forwarded-host"]),
  remoteAddress: Option.fromNullishOr(request.headers["x-forwarded-for"]?.split(",")[0].trim())
}) : request));
/**
 * @since 4.0.0
 * @category Search params
 */
export const searchParamsParser = httpApp => Effect.withFiber(fiber => {
  const services = fiber.context;
  const request = Context.getUnsafe(services, HttpServerRequest);
  const params = Request.searchParamsFromURL(new URL(request.originalUrl));
  return Effect.provideService(httpApp, Request.ParsedSearchParams, params);
});
/**
 * @since 4.0.0
 * @category CORS
 */
export const cors = options => {
  const opts = {
    allowedOrigins: options?.allowedOrigins ?? [],
    allowedMethods: options?.allowedMethods ?? ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: options?.allowedHeaders ?? [],
    exposedHeaders: options?.exposedHeaders ?? [],
    credentials: options?.credentials ?? false,
    maxAge: options?.maxAge
  };
  const isAllowedOrigin = typeof opts.allowedOrigins === "function" ? opts.allowedOrigins : origin => opts.allowedOrigins.includes(origin);
  const allowOrigin = typeof opts.allowedOrigins === "function" || opts.allowedOrigins.length > 1 ? originHeader => {
    if (!isAllowedOrigin(originHeader)) return undefined;
    return {
      "access-control-allow-origin": originHeader,
      vary: "Origin"
    };
  } : opts.allowedOrigins.length === 0 ? constant({
    "access-control-allow-origin": "*"
  }) : constant({
    "access-control-allow-origin": opts.allowedOrigins[0],
    vary: "Origin"
  });
  const allowMethods = opts.allowedMethods.length > 0 ? {
    "access-control-allow-methods": opts.allowedMethods.join(", ")
  } : undefined;
  const allowCredentials = opts.credentials ? {
    "access-control-allow-credentials": "true"
  } : undefined;
  const allowHeaders = accessControlRequestHeaders => {
    if (opts.allowedHeaders.length === 0 && accessControlRequestHeaders) {
      return {
        vary: "Access-Control-Request-Headers",
        "access-control-allow-headers": accessControlRequestHeaders
      };
    }
    if (opts.allowedHeaders) {
      return {
        "access-control-allow-headers": opts.allowedHeaders.join(",")
      };
    }
    return undefined;
  };
  const exposeHeaders = opts.exposedHeaders.length > 0 ? {
    "access-control-expose-headers": opts.exposedHeaders.join(",")
  } : undefined;
  const maxAge = opts.maxAge ? {
    "access-control-max-age": opts.maxAge.toString()
  } : undefined;
  const headersFromRequest = request => {
    const origin = request.headers["origin"];
    return Headers.fromRecordUnsafe({
      ...allowOrigin(origin),
      ...allowCredentials,
      ...exposeHeaders
    });
  };
  const headersFromRequestOptions = request => {
    const origin = request.headers["origin"];
    const accessControlRequestHeaders = request.headers["access-control-request-headers"];
    return Headers.fromRecordUnsafe({
      ...allowOrigin(origin),
      ...allowCredentials,
      ...exposeHeaders,
      ...allowMethods,
      ...allowHeaders(accessControlRequestHeaders),
      ...maxAge
    });
  };
  const preResponseHandler = (request, response) => Effect.succeed(Response.setHeaders(response, headersFromRequest(request)));
  return httpApp => Effect.withFiber(fiber => {
    const request = Context.getUnsafe(fiber.context, HttpServerRequest);
    if (request.method === "OPTIONS") {
      return Effect.succeed(Response.empty({
        status: 204,
        headers: headersFromRequestOptions(request)
      }));
    }
    appendPreResponseHandlerUnsafe(request, preResponseHandler);
    return httpApp;
  });
};
//# sourceMappingURL=HttpMiddleware.js.map