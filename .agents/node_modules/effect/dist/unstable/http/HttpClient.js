import * as Cause from "../../Cause.js";
import { Clock } from "../../Clock.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Fiber from "../../Fiber.js";
import { constant, constFalse, constTrue, dual, flow, identity } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Ref from "../../Ref.js";
import * as Result from "../../Result.js";
import * as Schedule from "../../Schedule.js";
import * as Stream from "../../Stream.js";
import * as Tracer from "../../Tracer.js";
import * as Cookies from "./Cookies.js";
import * as Headers from "./Headers.js";
import * as Error from "./HttpClientError.js";
import * as HttpClientRequest from "./HttpClientRequest.js";
import * as HttpClientResponse from "./HttpClientResponse.js";
import * as HttpIncomingMessage from "./HttpIncomingMessage.js";
import * as HttpMethod from "./HttpMethod.js";
import * as TraceContext from "./HttpTraceContext.js";
import * as UrlParams from "./UrlParams.js";
const TypeId = "~effect/http/HttpClient";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isHttpClient = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category tags
 */
export const HttpClient = /*#__PURE__*/Context.Service("effect/HttpClient");
const accessor = method => (...args) => Effect.flatMap(HttpClient.asEffect(), client => client[method](...args));
/**
 * @since 4.0.0
 * @category accessors
 */
export const execute = /*#__PURE__*/accessor("execute");
/**
 * @since 4.0.0
 * @category accessors
 */
export const get = /*#__PURE__*/accessor("get");
/**
 * @since 4.0.0
 * @category accessors
 */
export const head = /*#__PURE__*/accessor("head");
/**
 * @since 4.0.0
 * @category accessors
 */
export const post = /*#__PURE__*/accessor("post");
/**
 * @since 4.0.0
 * @category accessors
 */
export const patch = /*#__PURE__*/accessor("patch");
/**
 * @since 4.0.0
 * @category accessors
 */
export const put = /*#__PURE__*/accessor("put");
/**
 * @since 4.0.0
 * @category accessors
 */
export const del = /*#__PURE__*/accessor("del");
/**
 * @since 4.0.0
 * @category accessors
 */
export const options = /*#__PURE__*/accessor("options");
/**
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const transform = /*#__PURE__*/dual(2, (self, f) => makeWith(Effect.flatMap(request => f(self.postprocess(Effect.succeed(request)), request)), self.preprocess));
/**
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const transformResponse = /*#__PURE__*/dual(2, (self, f) => makeWith(request => f(self.postprocess(request)), self.preprocess));
const catch_ = /*#__PURE__*/dual(2, (self, f) => transformResponse(self, Effect.catch(f)));
export {
/**
 * @since 4.0.0
 * @category error handling
 */
catch_ as catch };
/**
 * @since 4.0.0
 * @category error handling
 */
export const catchTag = /*#__PURE__*/dual(3, (self, tag, f) => transformResponse(self, Effect.catchTag(tag, f)));
/**
 * @since 4.0.0
 * @category error handling
 */
export const catchTags = /*#__PURE__*/dual(2, (self, cases) => transformResponse(self, Effect.catchTags(cases)));
/**
 * Filters the result of a response, or runs an alternative effect if the predicate fails.
 *
 * @since 4.0.0
 * @category filters
 */
export const filterOrElse = /*#__PURE__*/dual(3, (self, f, orElse) => transformResponse(self, Effect.filterOrElse(f, orElse)));
/**
 * Filters the result of a response, or throws an error if the predicate fails.
 *
 * @since 4.0.0
 * @category filters
 */
export const filterOrFail = /*#__PURE__*/dual(3, (self, f, orFailWith) => transformResponse(self, Effect.filterOrFail(f, orFailWith)));
/**
 * Filters responses by HTTP status code.
 *
 * @since 4.0.0
 * @category filters
 */
export const filterStatus = /*#__PURE__*/dual(2, (self, f) => transformResponse(self, Effect.flatMap(HttpClientResponse.filterStatus(f))));
/**
 * Filters responses that return a 2xx status code.
 *
 * @since 4.0.0
 * @category filters
 */
export const filterStatusOk = /*#__PURE__*/transformResponse(/*#__PURE__*/Effect.flatMap(HttpClientResponse.filterStatusOk));
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeWith = (postprocess, preprocess) => {
  const self = Object.create(Proto);
  self.preprocess = preprocess;
  self.postprocess = postprocess;
  self.execute = function (request) {
    return postprocess(preprocess(request));
  };
  return self;
};
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: "effect/HttpClient"
    };
  },
  ... /*#__PURE__*/Object.fromEntries(/*#__PURE__*/HttpMethod.allShort.map(([fullMethod, method]) => [method, function (url, options) {
    return this.execute(HttpClientRequest.make(fullMethod)(url, options));
  }]))
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = f => makeWith(effect => Effect.flatMap(effect, request => Effect.withFiber(fiber => {
  const scopedController = scopedRequests.get(request);
  const controller = scopedController ?? new AbortController();
  const urlResult = UrlParams.makeUrl(request.url, request.urlParams, Option.getOrUndefined(request.hash));
  if (Result.isFailure(urlResult)) {
    return Effect.fail(new Error.HttpClientError({
      reason: new Error.InvalidUrlError({
        request,
        cause: urlResult.failure
      })
    }));
  }
  const url = urlResult.success;
  const tracerDisabled = fiber.getRef(Tracer.DisablePropagation) || fiber.getRef(TracerDisabledWhen)(request);
  if (tracerDisabled) {
    const effect = f(request, url, controller.signal, fiber);
    if (scopedController) return effect;
    return Effect.uninterruptibleMask(restore => Effect.matchCauseEffect(restore(effect), {
      onSuccess(response) {
        responseRegistry.register(response, controller);
        return Effect.succeed(new InterruptibleResponse(response, controller));
      },
      onFailure(cause) {
        if (Cause.hasInterrupts(cause)) {
          controller.abort();
        }
        return Effect.failCause(cause);
      }
    }));
  }
  return Effect.useSpan(fiber.getRef(SpanNameGenerator)(request), {
    kind: "client"
  }, span => {
    span.attribute("http.request.method", request.method);
    span.attribute("server.address", url.origin);
    if (url.port !== "") {
      span.attribute("server.port", +url.port);
    }
    span.attribute("url.full", url.toString());
    span.attribute("url.path", url.pathname);
    span.attribute("url.scheme", url.protocol.slice(0, -1));
    const query = url.search.slice(1);
    if (query !== "") {
      span.attribute("url.query", query);
    }
    const redactedHeaderNames = fiber.getRef(Headers.CurrentRedactedNames);
    const redactedHeaders = Headers.redact(request.headers, redactedHeaderNames);
    for (const name in redactedHeaders) {
      span.attribute(`http.request.header.${name}`, String(redactedHeaders[name]));
    }
    request = fiber.getRef(TracerPropagationEnabled) ? HttpClientRequest.setHeaders(request, TraceContext.toHeaders(span)) : request;
    return Effect.uninterruptibleMask(restore => restore(f(request, url, controller.signal, fiber)).pipe(Effect.withParentSpan(span, {
      captureStackTrace: false
    }), Effect.matchCauseEffect({
      onSuccess: response => {
        span.attribute("http.response.status_code", response.status);
        const redactedHeaders = Headers.redact(response.headers, redactedHeaderNames);
        for (const name in redactedHeaders) {
          span.attribute(`http.response.header.${name}`, String(redactedHeaders[name]));
        }
        if (scopedController) return Effect.succeed(response);
        responseRegistry.register(response, controller);
        return Effect.succeed(new InterruptibleResponse(response, controller));
      },
      onFailure(cause) {
        if (!scopedController && Cause.hasInterrupts(cause)) {
          controller.abort();
        }
        return Effect.failCause(cause);
      }
    })));
  });
})), Effect.succeed);
/**
 * Appends a transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const mapRequest = /*#__PURE__*/dual(2, (self, f) => makeWith(self.postprocess, request => Effect.map(self.preprocess(request), f)));
/**
 * Appends an effectful transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const mapRequestEffect = /*#__PURE__*/dual(2, (self, f) => makeWith(self.postprocess, request => Effect.flatMap(self.preprocess(request), f)));
/**
 * Prepends a transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const mapRequestInput = /*#__PURE__*/dual(2, (self, f) => makeWith(self.postprocess, request => self.preprocess(f(request))));
/**
 * Prepends an effectful transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const mapRequestInputEffect = /*#__PURE__*/dual(2, (self, f) => makeWith(self.postprocess, request => Effect.flatMap(f(request), self.preprocess)));
/**
 * Retries the request based on a provided schedule or policy.
 *
 * @since 4.0.0
 * @category error handling
 */
export const retry = /*#__PURE__*/dual(2, (self, policy) => transformResponse(self, Effect.retry(policy)));
/**
 * Retries common transient errors, such as rate limiting, timeouts or network issues.
 *
 * Use `retryOn` to focus on retrying errors, transient responses, or both.
 *
 * Specifying a `while` predicate allows you to consider other errors as
 * transient, and is ignored in "response-only" mode.
 *
 * @since 4.0.0
 * @category error handling
 */
export const retryTransient = /*#__PURE__*/dual(2, (self, options) => {
  const isOnlySchedule = Schedule.isSchedule(options);
  const retryOn = isOnlySchedule ? "errors-and-responses" : options.retryOn ?? "errors-and-responses";
  const schedule = isOnlySchedule ? options : options.schedule;
  const passthroughSchedule = schedule && Schedule.passthrough(schedule);
  const times = isOnlySchedule ? undefined : options.times;
  return transformResponse(self, flow(retryOn === "errors-only" ? identity : Effect.repeat({
    schedule: passthroughSchedule,
    times,
    while: isTransientResponse
  }), retryOn === "response-only" ? identity : Effect.retry({
    while: isOnlySchedule || options.while === undefined ? isTransientError : Predicate.or(isTransientError, options.while),
    schedule,
    times
  })));
});
/**
 * Applies request rate limiting using the `RateLimiter` service.
 *
 * It can update limits by inspecting common rate limit response headers and
 * automatically retries HTTP `429` responses (or `HttpClientError` values
 * wrapping a `429` response) by forcing the retry back through the limiter.
 *
 * @since 4.0.0
 * @category rate limiting
 */
export const withRateLimiter = /*#__PURE__*/dual(2, (self, options) => {
  const initialState = {
    initial: true,
    limit: options.limit,
    window: Duration.max(Duration.fromInputUnsafe(options.window), Duration.millis(1))
  };
  const states = new Map();
  const keyOption = options.key;
  const resolveKey = typeof keyOption === "function" ? keyOption : constant(keyOption);
  const tokensOption = options.tokens;
  const resolveTokens = typeof tokensOption === "function" ? tokensOption : constant(tokensOption ?? 1);
  const getState = key => {
    const current = states.get(key);
    if (current !== undefined) {
      return current;
    }
    states.set(key, initialState);
    return initialState;
  };
  const onResponse = options.disableResponseInspection ? undefined : (clock, key, headers, tokens) => {
    const current = getState(key);
    const next = parseRateLimiterState(current, clock, headers, tokens);
    if (next.limit !== current.limit || !Duration.equals(next.window, current.window)) {
      states.set(key, next);
    }
  };
  return transform(self, function loop(effect, request) {
    const fiber = Fiber.getCurrent();
    const clock = fiber.getRef(Clock);
    const key = resolveKey(request);
    const tokens = Math.max(resolveTokens(request), 1);
    const current = getState(key);
    function retry(response) {
      if (options.disableResponseInspection) return loop(effect, request);
      const retryAfter = parseRetryAfter(clock, getHeader(response.headers, "retry-after"));
      return retryAfter ? Effect.flatMap(Effect.sleep(retryAfter), () => loop(effect, request)) : loop(effect, request);
    }
    return Effect.flatMap(options.limiter.consume({
      algorithm: options.algorithm,
      onExceeded: "delay",
      key,
      limit: current.limit,
      window: current.window,
      tokens
    }), ({
      delay
    }) => {
      const run = Effect.matchEffect(effect, {
        onSuccess(response) {
          onResponse?.(clock, key, response.headers, tokens);
          if (response.status !== 429) return Effect.succeed(response);
          return retry(response);
        },
        onFailure(error) {
          if (isTooManyRequestsHttpClientError(error)) {
            onResponse?.(clock, key, error.reason.response.headers, tokens);
            return retry(error.reason.response);
          }
          return Effect.fail(error);
        }
      });
      return Duration.isZero(delay) ? run : Effect.delay(run, delay);
    });
  });
});
const parseRateLimiterState = (state, clock, headers, tokens) => {
  const limit = parseRateLimitLimit(state, headers, tokens) ?? state.limit;
  const window = parseRateLimitWindow(clock, headers) ?? state.window;
  if (limit === state.limit && Duration.equals(window, state.window)) {
    return state;
  }
  return {
    limit,
    window,
    initial: false
  };
};
const parseRateLimitLimit = (state, headers, tokens) => {
  const raw = getHeader(headers, "ratelimit-limit", "x-ratelimit-limit");
  const value = parseNumberHeader(raw);
  if (value !== undefined && value > 0) {
    return value;
  }
  const remaining = parseRateLimitRemaining(headers);
  if (remaining === undefined) {
    return undefined;
  }
  return state.initial ? remaining + tokens : Math.max(remaining + tokens, state.limit);
};
const parseRateLimitRemaining = headers => {
  const raw = getHeader(headers, "ratelimit-remaining", "x-ratelimit-remaining");
  const value = parseNumberHeader(raw);
  return value !== undefined && value >= 0 ? value : undefined;
};
const parseRateLimitWindow = (clock, headers) => {
  const retryAfter = parseRetryAfter(clock, getHeader(headers, "retry-after"));
  if (retryAfter !== undefined) {
    return retryAfter;
  }
  const resetAfter = parseResetAfter(getHeader(headers, "ratelimit-reset-after", "x-ratelimit-reset-after"));
  if (resetAfter !== undefined) {
    return resetAfter;
  }
  return parseResetHeader(clock, getHeader(headers, "ratelimit-reset", "x-ratelimit-reset"));
};
const parseRetryAfter = (clock, value) => {
  if (value === undefined) {
    return undefined;
  }
  const numeric = parseNumberHeader(value);
  if (numeric !== undefined) {
    return Duration.max(Duration.seconds(numeric), Duration.millis(1));
  }
  const parsedDate = Date.parse(value);
  if (Number.isNaN(parsedDate)) {
    return undefined;
  }
  const millis = parsedDate - clock.currentTimeMillisUnsafe();
  if (millis <= 0) {
    return Duration.millis(1);
  }
  return Duration.millis(millis);
};
const parseResetAfter = value => {
  const numeric = parseNumberHeader(value);
  if (numeric === undefined || numeric <= 0) {
    return undefined;
  }
  return Duration.max(Duration.seconds(numeric), Duration.millis(1));
};
const parseResetHeader = (clock, value) => {
  const numeric = parseNumberHeader(value);
  if (numeric === undefined || numeric <= 0) {
    return undefined;
  }
  const nowMillis = clock.currentTimeMillisUnsafe();
  if (numeric > 1_000_000_000_000) {
    return Duration.millis(Math.max(numeric - nowMillis, 1));
  }
  if (numeric > 1_000_000_000) {
    return Duration.millis(Math.max(numeric * 1_000 - nowMillis, 1));
  }
  return Duration.max(Duration.seconds(numeric), Duration.millis(1));
};
const parseNumberHeader = value => {
  if (value === undefined) {
    return undefined;
  }
  const match = /-?\d+(?:\.\d+)?/.exec(value);
  if (match === null) {
    return undefined;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const getHeader = (headers, ...keys) => {
  for (let i = 0; i < keys.length; i++) {
    const value = headers[keys[i]];
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};
/**
 * Performs an additional effect after a successful request.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const tap = /*#__PURE__*/dual(2, (self, f) => transformResponse(self, Effect.tap(f)));
/**
 * Performs an additional effect after an unsuccessful request.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const tapError = /*#__PURE__*/dual(2, (self, f) => transformResponse(self, Effect.tapError(f)));
/**
 * Performs an additional effect on the request before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export const tapRequest = /*#__PURE__*/dual(2, (self, f) => makeWith(self.postprocess, request => Effect.tap(self.preprocess(request), f)));
/**
 * Associates a `Ref` of cookies with the client for handling cookies across requests.
 *
 * @since 4.0.0
 * @category cookies
 */
export const withCookiesRef = /*#__PURE__*/dual(2, (self, ref) => makeWith(request => Effect.tap(self.postprocess(request), response => Ref.update(ref, cookies => Cookies.merge(cookies, response.cookies))), request => Effect.flatMap(self.preprocess(request), request => Effect.map(Ref.get(ref), cookies => Cookies.isEmpty(cookies) ? request : HttpClientRequest.setHeader(request, "cookie", Cookies.toCookieHeader(cookies))))));
/**
 * Ties the lifetime of the `HttpClientRequest` to a `Scope`.
 *
 * @since 4.0.0
 * @category Scope
 */
export const withScope = self => transform(self, (effect, request) => {
  const controller = new AbortController();
  scopedRequests.set(request, controller);
  return Effect.andThen(Effect.addFinalizer(() => Effect.sync(() => controller.abort())), effect);
});
/**
 * Follows HTTP redirects up to a specified number of times.
 *
 * @since 4.0.0
 * @category redirects
 */
export const followRedirects = /*#__PURE__*/dual(args => isHttpClient(args[0]), (self, maxRedirects) => makeWith(request => {
  const loop = (request, redirects) => Effect.flatMap(self.postprocess(Effect.succeed(request)), response => response.status >= 300 && response.status < 400 && response.headers.location && redirects < (maxRedirects ?? 10) ? loop(HttpClientRequest.setUrl(request, new URL(response.headers.location, response.request.url)), redirects + 1) : Effect.succeed(response));
  return Effect.flatMap(request, request => loop(request, 0));
}, self.preprocess));
/**
 * @since 4.0.0
 * @category References
 */
export const TracerDisabledWhen = /*#__PURE__*/Context.Reference("effect/http/HttpClient/TracerDisabledWhen", {
  defaultValue: () => constFalse
});
/**
 * @since 4.0.0
 * @category References
 */
export const TracerPropagationEnabled = /*#__PURE__*/Context.Reference("effect/HttpClient/TracerPropagationEnabled", {
  defaultValue: constTrue
});
/**
 * @since 4.0.0
 * @category References
 */
export const SpanNameGenerator = /*#__PURE__*/Context.Reference("effect/http/HttpClient/SpanNameGenerator", {
  defaultValue: () => request => `http.client ${request.method}`
});
/**
 * @since 4.0.0
 */
export const layerMergedContext = effect => Layer.effect(HttpClient)(Effect.contextWith(context => Effect.map(effect, client => transformResponse(client, Effect.updateContext(input => Context.merge(context, input))))));
// -----------------------------------------------------------------------------
// internal
// -----------------------------------------------------------------------------
const responseRegistry = /*#__PURE__*/(() => {
  if ("FinalizationRegistry" in globalThis && globalThis.FinalizationRegistry) {
    const registry = /*#__PURE__*/new FinalizationRegistry(controller => {
      controller.abort();
    });
    return {
      register(response, controller) {
        registry.register(response, controller, response);
      },
      unregister(response) {
        registry.unregister(response);
      }
    };
  }
  const timers = /*#__PURE__*/new Map();
  return {
    register(response, controller) {
      timers.set(response, setTimeout(() => controller.abort(), 5000));
    },
    unregister(response) {
      const timer = timers.get(response);
      if (timer === undefined) return;
      clearTimeout(timer);
      timers.delete(response);
    }
  };
})();
const scopedRequests = /*#__PURE__*/new WeakMap();
class InterruptibleResponse {
  original;
  controller;
  constructor(original, controller) {
    this.original = original;
    this.controller = controller;
  }
  [HttpClientResponse.TypeId] = HttpClientResponse.TypeId;
  [HttpIncomingMessage.TypeId] = HttpIncomingMessage.TypeId;
  applyInterrupt(effect) {
    return Effect.suspend(() => {
      responseRegistry.unregister(this.original);
      return Effect.onInterrupt(effect, () => Effect.sync(() => {
        this.controller.abort();
      }));
    });
  }
  get request() {
    return this.original.request;
  }
  get status() {
    return this.original.status;
  }
  get headers() {
    return this.original.headers;
  }
  get cookies() {
    return this.original.cookies;
  }
  get remoteAddress() {
    return this.original.remoteAddress;
  }
  get formData() {
    return this.applyInterrupt(this.original.formData);
  }
  get text() {
    return this.applyInterrupt(this.original.text);
  }
  get json() {
    return this.applyInterrupt(this.original.json);
  }
  get urlParamsBody() {
    return this.applyInterrupt(this.original.urlParamsBody);
  }
  get arrayBuffer() {
    return this.applyInterrupt(this.original.arrayBuffer);
  }
  get stream() {
    return Stream.suspend(() => {
      responseRegistry.unregister(this.original);
      return Stream.ensuring(this.original.stream, Effect.sync(() => {
        this.controller.abort();
      }));
    });
  }
  toJSON() {
    return this.original.toJSON();
  }
  [Inspectable.NodeInspectSymbol]() {
    return this.original[Inspectable.NodeInspectSymbol]();
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
const isTransientError = error => Cause.isTimeoutError(error) || isTransientHttpError(error);
const isTransientHttpError = error => Error.isHttpClientError(error) && (error.reason._tag === "TransportError" || error.reason._tag === "StatusCodeError" && isTransientResponse(error.reason.response));
const isTooManyRequestsHttpClientError = error => Error.isHttpClientError(error) && error.reason._tag === "StatusCodeError" && error.reason.response.status === 429;
const isTransientResponse = response => response.status === 408 || response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504;
//# sourceMappingURL=HttpClient.js.map