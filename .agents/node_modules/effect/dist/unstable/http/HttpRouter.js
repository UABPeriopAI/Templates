/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { compose, dual, identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as Tracer from "../../Tracer.js";
import * as FindMyWay from "./FindMyWay.js";
import * as HttpEffect from "./HttpEffect.js";
import * as HttpMiddleware from "./HttpMiddleware.js";
import * as HttpServer from "./HttpServer.js";
import * as HttpServerError from "./HttpServerError.js";
import * as HttpServerRequest from "./HttpServerRequest.js";
import * as HttpServerResponse from "./HttpServerResponse.js";
const TypeId = "~effect/http/HttpRouter";
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export const HttpRouter = /*#__PURE__*/Context.Service("effect/http/HttpRouter");
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export const make = /*#__PURE__*/Effect.gen(function* () {
  const router = FindMyWay.make(yield* RouterConfig);
  const middleware = new Set();
  const addAll = routes => Effect.contextWith(context => {
    const middleware = getMiddleware(context);
    const applyMiddleware = effect => {
      for (let i = 0; i < middleware.length; i++) {
        effect = middleware[i](effect);
      }
      return effect;
    };
    for (let i = 0; i < routes.length; i++) {
      const route = middleware.length === 0 ? routes[i] : makeRoute({
        ...routes[i],
        handler: applyMiddleware(routes[i].handler)
      });
      if (route.method === "*") {
        if (route.path.endsWith("/*")) {
          router.all(route.path, route);
          router.all(route.path.slice(0, -2), route);
        } else {
          router.all(route.path, route);
        }
      } else {
        if (route.path.endsWith("/*")) {
          router.on(route.method, route.path, route);
          router.on(route.method, route.path.slice(0, -2), route);
        } else {
          router.on(route.method, route.path, route);
        }
      }
    }
    return Effect.void;
  });
  return HttpRouter.of({
    [TypeId]: TypeId,
    prefixed(prefix) {
      return HttpRouter.of({
        ...this,
        prefixed: newPrefix => this.prefixed(prefixPath(prefix, newPrefix)),
        addAll: routes => addAll(routes.map(prefixRoute(prefix))),
        add: (method, path, handler, options) => addAll([makeRoute({
          method,
          path: prefixPath(path, prefix),
          handler: HttpServerResponse.isHttpServerResponse(handler) ? Effect.succeed(handler) : Effect.isEffect(handler) ? handler : Effect.flatMap(HttpServerRequest.HttpServerRequest.asEffect(), handler),
          uninterruptible: options?.uninterruptible ?? false,
          prefix
        })])
      });
    },
    addAll,
    add: (method, path, handler, options) => addAll([route(method, path, handler, options)]),
    addGlobalMiddleware: middleware_ => Effect.sync(() => {
      middleware.add(middleware_);
    }),
    asHttpEffect() {
      let handler = Effect.withFiber(fiber => {
        const contextMap = new Map(fiber.context.mapUnsafe);
        const request = contextMap.get(HttpServerRequest.HttpServerRequest.key);
        let result = router.find(request.method, request.url);
        if (result === undefined && request.method === "HEAD") {
          result = router.find("GET", request.url);
        }
        if (result === undefined) {
          return Effect.fail(new HttpServerError.HttpServerError({
            reason: new HttpServerError.RouteNotFound({
              request
            })
          }));
        }
        const route = result.handler;
        if (Option.isSome(route.prefix)) {
          contextMap.set(HttpServerRequest.HttpServerRequest.key, sliceRequestUrl(request, route.prefix.value));
        }
        contextMap.set(HttpServerRequest.ParsedSearchParams.key, result.searchParams);
        contextMap.set(RouteContext.key, {
          route,
          params: result.params
        });
        const span = contextMap.get(Tracer.ParentSpan.key);
        if (span && span._tag === "Span") {
          span.attribute("http.route", route.path);
        }
        return Effect.provideContext(route.uninterruptible ? route.handler : Effect.interruptible(route.handler), Context.makeUnsafe(contextMap));
      });
      if (middleware.size === 0) return handler;
      for (const fn of Arr.reverse(middleware)) {
        handler = fn(handler);
      }
      return handler;
    }
  });
});
function sliceRequestUrl(request, prefix) {
  const prefexLen = prefix.length;
  return request.modify({
    url: request.url.length <= prefexLen ? "/" : request.url.slice(prefexLen)
  });
}
/**
 * @since 4.0.0
 * @category Configuration
 */
export const RouterConfig = /*#__PURE__*/Context.Reference("effect/http/HttpRouter/RouterConfig", {
  defaultValue: () => ({})
});
/**
 * @since 4.0.0
 * @category RouteContext
 */
export class RouteContext extends /*#__PURE__*/Context.Service()("effect/http/HttpRouter/RouteContext") {}
/**
 * @since 4.0.0
 * @category RouteContext
 */
export const params = /*#__PURE__*/Effect.map(/*#__PURE__*/RouteContext.asEffect(), _ => _.params);
/**
 * @since 4.0.0
 * @category Schema
 */
export const schemaJson = (schema, options) => {
  const parse = Schema.decodeUnknownEffect(schema);
  return Effect.contextWith(context => {
    const request = Context.get(context, HttpServerRequest.HttpServerRequest);
    const searchParams = Context.get(context, HttpServerRequest.ParsedSearchParams);
    const routeContext = Context.get(context, RouteContext);
    return Effect.flatMap(request.json, body => parse({
      method: request.method,
      url: request.url,
      headers: request.headers,
      cookies: request.cookies,
      pathParams: routeContext.params,
      searchParams,
      body
    }, options));
  });
};
/**
 * @since 4.0.0
 * @category Schema
 */
export const schemaNoBody = (schema, options) => {
  const parse = Schema.decodeUnknownEffect(schema);
  return Effect.contextWith(context => {
    const request = Context.get(context, HttpServerRequest.HttpServerRequest);
    const searchParams = Context.get(context, HttpServerRequest.ParsedSearchParams);
    const routeContext = Context.get(context, RouteContext);
    return parse({
      method: request.method,
      url: request.url,
      headers: request.headers,
      cookies: request.cookies,
      pathParams: routeContext.params,
      searchParams
    }, options);
  });
};
/**
 * @since 4.0.0
 * @category Schema
 */
export const schemaParams = (schema, options) => {
  const parse = Schema.decodeUnknownEffect(schema);
  return Effect.contextWith(context => {
    const searchParams = Context.get(context, HttpServerRequest.ParsedSearchParams);
    const routeContext = Context.get(context, RouteContext);
    return parse({
      ...searchParams,
      ...routeContext.params
    }, options);
  });
};
/**
 * @since 4.0.0
 * @category Schema
 */
export const schemaPathParams = (schema, options) => {
  const parse = Schema.decodeUnknownEffect(schema);
  return Effect.flatMap(params, _ => parse(_, options));
};
/**
 * A helper function that is the equivalent of:
 *
 * ```ts
 * import { Effect } from "effect"
 * import * as Layer from "effect/Layer"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 *
 * const MyRoute = Layer.effectDiscard(Effect.gen(function*() {
 *   const router = yield* HttpRouter.HttpRouter
 *
 *   // then use `yield* router.add(...)` to add a route
 * }))
 * ```
 *
 * @since 4.0.0
 * @category HttpRouter
 */
export const use = f => Layer.effectDiscard(Effect.flatMap(HttpRouter.asEffect(), f));
/**
 * Create a layer that adds a single route to the HTTP router.
 *
 * ```ts
 * import { Effect } from "effect"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * const Route = HttpRouter.add(
 *   "GET",
 *   "/hello",
 *   Effect.succeed(HttpServerResponse.text("Hello, World!"))
 * )
 * ```
 *
 * @since 4.0.0
 * @category HttpRouter
 */
export const add = (method, path, handler, options) => use(router => router.add(method, path, handler, options));
/**
 * Create a layer that adds multiple routes to the HTTP router.
 *
 * ```ts
 * import { Effect } from "effect"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * const Routes = HttpRouter.addAll([
 *   HttpRouter.route(
 *     "GET",
 *     "/hello",
 *     Effect.succeed(HttpServerResponse.text("Hello, World!"))
 *   )
 * ])
 * ```
 *
 * @since 4.0.0
 * @category HttpRouter
 */
export const addAll = (routes, options) => Layer.effectDiscard(Effect.gen(function* () {
  const toAdd = Effect.isEffect(routes) ? yield* routes : routes;
  let router = yield* HttpRouter;
  if (options?.prefix) {
    router = router.prefixed(options.prefix);
  }
  yield* router.addAll(toAdd);
}));
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export const layer = /*#__PURE__*/Layer.effect(HttpRouter)(make);
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export const toHttpEffect = appLayer => Effect.gen(function* () {
  const context = yield* Layer.build(Layer.provideMerge(appLayer, layer));
  const router = Context.get(context, HttpRouter);
  // @effect-diagnostics effect/returnEffectInGen:off
  return router.asHttpEffect();
});
const RouteTypeId = "~effect/http/HttpRouter/Route";
const makeRoute = options => ({
  ...options,
  uninterruptible: options.uninterruptible ?? false,
  prefix: typeof options.prefix === "string" ? Option.some(options.prefix) : options.prefix ?? Option.none(),
  [RouteTypeId]: RouteTypeId
});
/**
 * @since 4.0.0
 * @category Route
 */
export const route = (method, path, handler, options) => makeRoute({
  ...options,
  method,
  path,
  handler: HttpServerResponse.isHttpServerResponse(handler) ? Effect.succeed(handler) : Effect.isEffect(handler) ? handler : Effect.flatMap(HttpServerRequest.HttpServerRequest.asEffect(), handler),
  uninterruptible: options?.uninterruptible ?? false
});
const removeTrailingSlash = path => path.endsWith("/") ? path.slice(0, -1) : path;
/**
 * @since 4.0.0
 * @category PathInput
 */
export const prefixPath = /*#__PURE__*/dual(2, (self, prefix) => {
  prefix = removeTrailingSlash(prefix);
  if (self === "*") return `${prefix}/*`;else if (self === "/") return prefix;
  return prefix + self;
});
/**
 * @since 4.0.0
 * @category Route
 */
export const prefixRoute = /*#__PURE__*/dual(2, (self, prefix) => makeRoute({
  ...self,
  path: prefixPath(self.path, prefix),
  prefix: Option.match(self.prefix, {
    onNone: () => prefix,
    onSome: existingPrefix => prefixPath(existingPrefix, prefix)
  })
}));
const MiddlewareTypeId = "~effect/http/HttpRouter/Middleware";
/**
 * Create a middleware layer that can be used to modify requests and responses.
 *
 * By default, the middleware only affects the routes that it is provided to.
 *
 * If you want to create a middleware that applies globally to all routes, pass
 * the `global` option as `true`.
 *
 * ```ts
 * import { Effect } from "effect"
 * import * as Layer from "effect/Layer"
 * import * as Context from "effect/Context"
 * import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * // Here we are defining a CORS middleware
 * const CorsMiddleware = HttpRouter.middleware(HttpMiddleware.cors()).layer
 * // You can also use HttpRouter.cors() to create a CORS middleware
 *
 * class CurrentSession extends Context.Service<CurrentSession, {
 *   readonly token: string
 * }>()("CurrentSession") {}
 *
 * // You can create middleware that provides a service to the HTTP requests.
 * const SessionMiddleware = HttpRouter.middleware<{
 *   provides: CurrentSession
 * }>()(
 *   Effect.gen(function*() {
 *     yield* Effect.log("SessionMiddleware initialized")
 *
 *     return (httpEffect) =>
 *       Effect.provideService(httpEffect, CurrentSession, {
 *         token: "dummy-token"
 *       })
 *   })
 * ).layer
 *
 * Effect.gen(function*() {
 *   const router = yield* HttpRouter.HttpRouter
 *   yield* router.add(
 *     "GET",
 *     "/hello",
 *     Effect.gen(function*() {
 *       // Requests can now access the current session
 *       const session = yield* CurrentSession
 *       return HttpServerResponse.text(
 *         `Hello, World! Your token is ${session.token}`
 *       )
 *     })
 *   )
 * }).pipe(
 *   Layer.effectDiscard,
 *   // Provide the SessionMiddleware & CorsMiddleware to some routes
 *   Layer.provide([SessionMiddleware, CorsMiddleware])
 * )
 * ```
 *
 * @since 4.0.0
 * @category Middleware
 */
export const middleware = function () {
  if (arguments.length === 0) {
    return makeMiddleware;
  }
  return makeMiddleware(arguments[0], arguments[1]);
};
const makeMiddleware = (middleware, options) => options?.global ? Layer.effectDiscard(Effect.gen(function* () {
  const router = yield* HttpRouter;
  const fn = Effect.isEffect(middleware) ? yield* middleware : middleware;
  yield* router.addGlobalMiddleware(fn);
})) : new MiddlewareImpl(Effect.isEffect(middleware) ? Layer.effectContext(Effect.map(middleware, fn => Context.makeUnsafe(new Map([[fnContextKey, fn]])))) : Layer.succeedContext(Context.makeUnsafe(new Map([[fnContextKey, middleware]]))));
let middlewareId = 0;
const fnContextKey = "effect/http/HttpRouter/MiddlewareFn";
class MiddlewareImpl {
  [MiddlewareTypeId] = {};
  layerFn;
  dependencies;
  constructor(layerFn, dependencies) {
    this.layerFn = layerFn;
    this.dependencies = dependencies;
    const contextKey = `effect/http/HttpRouter/Middleware-${++middlewareId}`;
    this.layer = Layer.effectContext(Effect.gen({
      self: this
    }, function* () {
      const context = yield* Effect.context();
      const stack = [context.mapUnsafe.get(fnContextKey)];
      if (this.dependencies) {
        const memoMap = yield* Layer.CurrentMemoMap;
        const scope = Context.get(context, Scope.Scope);
        const depsContext = yield* Layer.buildWithMemoMap(this.dependencies, memoMap, scope);
        stack.push(...getMiddleware(depsContext));
      }
      return Context.makeUnsafe(new Map([[contextKey, stack]]));
    })).pipe(Layer.provide(this.layerFn));
  }
  layer;
  combine(other) {
    return new MiddlewareImpl(this.layerFn, this.dependencies ? Layer.provideMerge(this.dependencies, other.layer) : other.layer);
  }
}
const middlewareCache = /*#__PURE__*/new WeakMap();
const getMiddleware = context => {
  let arr = middlewareCache.get(context);
  if (arr) return arr;
  const topLevel = Arr.empty();
  let maxLength = 0;
  for (const [key, value] of context.mapUnsafe) {
    if (key.startsWith("effect/http/HttpRouter/Middleware-")) {
      topLevel.push(value);
      if (value.length > maxLength) {
        maxLength = value.length;
      }
    }
  }
  if (topLevel.length === 0) {
    arr = [];
  } else {
    const middleware = new Set();
    for (let i = maxLength - 1; i >= 0; i--) {
      for (const arr of topLevel) {
        if (i < arr.length) {
          middleware.add(arr[i]);
        }
      }
    }
    arr = Arr.fromIterable(middleware).reverse();
  }
  middlewareCache.set(context, arr);
  return arr;
};
/**
 * A middleware that applies CORS headers to the HTTP response.
 *
 * @since 4.0.0
 * @category Middleware
 */
export const cors = options => middleware(HttpMiddleware.cors(options), {
  global: true
});
/**
 * A middleware that disables the logger for some routes.
 *
 * ```ts
 * import { Effect } from "effect"
 * import * as Layer from "effect/Layer"
 * import * as HttpRouter from "effect/unstable/http/HttpRouter"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * const Route = HttpRouter.add(
 *   "GET",
 *   "/hello",
 *   Effect.succeed(HttpServerResponse.text("Hello, World!"))
 * ).pipe(
 *   // disable the logger for this route
 *   Layer.provide(HttpRouter.disableLogger)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Middleware
 */
export const disableLogger = /*#__PURE__*/middleware(HttpMiddleware.withLoggerDisabled).layer;
/**
 * Provides request-level dependencies to some routes.
 *
 * @since 4.0.0
 * @category Middleware
 */
export const provideRequest = layer => self => Layer.provide(self, middleware()(Effect.gen(function* () {
  const services = yield* Layer.build(layer);
  return effect => Effect.provideContext(effect, services);
})).layer);
/**
 * Serves the provided application layer as an HTTP server.
 *
 * @since 4.0.0
 * @category Server
 */
export const serve = (appLayer, options) => {
  let middleware = options?.middleware;
  if (options?.disableLogger !== true) {
    middleware = middleware ? compose(middleware, HttpMiddleware.logger) : HttpMiddleware.logger;
  }
  const RouterLayer = options?.routerConfig ? Layer.provide(layer, Layer.succeed(RouterConfig)(options.routerConfig)) : layer;
  return Effect.gen(function* () {
    const router = yield* HttpRouter;
    const handler = router.asHttpEffect();
    return middleware ? HttpServer.serve(handler, middleware) : HttpServer.serve(handler);
  }).pipe(Layer.unwrap, Layer.provideMerge(appLayer), Layer.provide(RouterLayer), options?.disableListenLog ? identity : HttpServer.withLogAddress);
};
/**
 * @since 4.0.0
 * @category Server
 */
export const toWebHandler = (appLayer, options) => {
  let middleware = options?.middleware;
  if (options?.disableLogger !== true) {
    middleware = middleware ? compose(middleware, HttpMiddleware.logger) : HttpMiddleware.logger;
  }
  const RouterLayer = options?.routerConfig ? Layer.provide(layer, Layer.succeed(RouterConfig)(options.routerConfig)) : layer;
  return HttpEffect.toWebHandlerLayerWith(Layer.provideMerge(appLayer, RouterLayer), {
    toHandler: s => Effect.succeed(Context.get(s, HttpRouter).asHttpEffect()),
    middleware,
    memoMap: options?.memoMap
  });
};
//# sourceMappingURL=HttpRouter.js.map