import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import type { ReadonlyRecord } from "../../Record.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import * as Scope from "../../Scope.ts";
import type * as Types from "../../Types.ts";
import * as FindMyWay from "./FindMyWay.ts";
import type * as HttpMethod from "./HttpMethod.ts";
import * as HttpServer from "./HttpServer.ts";
import * as HttpServerError from "./HttpServerError.ts";
import * as HttpServerRequest from "./HttpServerRequest.ts";
import * as HttpServerResponse from "./HttpServerResponse.ts";
declare const TypeId = "~effect/http/HttpRouter";
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export interface HttpRouter {
    readonly [TypeId]: typeof TypeId;
    readonly prefixed: (prefix: string) => HttpRouter;
    readonly add: <E = never, R = never>(method: "*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS", path: PathInput, handler: HttpServerResponse.HttpServerResponse | Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> | ((request: HttpServerRequest.HttpServerRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>), options?: {
        readonly uninterruptible?: boolean | undefined;
    } | undefined) => Effect.Effect<void, never, Request.From<"Requires", Exclude<R, Provided>> | Request.From<"Error", E>>;
    readonly addAll: <const Routes extends ReadonlyArray<Route<any, any>>>(routes: Routes) => Effect.Effect<void, never, Request.From<"Requires", Exclude<Route.Context<Routes[number]>, Provided>> | Request.From<"Error", Route.Error<Routes[number]>>>;
    readonly addGlobalMiddleware: <E, R>(middleware: ((effect: Effect.Effect<HttpServerResponse.HttpServerResponse, Types.unhandled>) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>) & (Types.unhandled extends E ? unknown : "You cannot handle any errors")) => Effect.Effect<void, never, Request.From<"GlobalRequires", Exclude<R, GlobalProvided>> | Request.From<"GlobalError", Exclude<E, Types.unhandled>>>;
    readonly asHttpEffect: () => Effect.Effect<HttpServerResponse.HttpServerResponse, unknown, HttpServerRequest.HttpServerRequest | Scope.Scope>;
}
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export declare const HttpRouter: Context.Service<HttpRouter, HttpRouter>;
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export declare const make: Effect.Effect<HttpRouter, never, never>;
/**
 * @since 4.0.0
 * @category Configuration
 */
export declare const RouterConfig: Context.Reference<Partial<FindMyWay.RouterConfig>>;
declare const RouteContext_base: Context.ServiceClass<RouteContext, "effect/http/HttpRouter/RouteContext", {
    readonly params: Readonly<Record<string, string | undefined>>;
    readonly route: Route<unknown, unknown>;
}>;
/**
 * @since 4.0.0
 * @category RouteContext
 */
export declare class RouteContext extends RouteContext_base {
}
/**
 * @since 4.0.0
 * @category RouteContext
 */
export declare const params: Effect.Effect<ReadonlyRecord<string, string | undefined>, never, RouteContext>;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare const schemaJson: <A, I extends Partial<{
    readonly method: HttpMethod.HttpMethod;
    readonly url: string;
    readonly cookies: Readonly<Record<string, string | undefined>>;
    readonly headers: Readonly<Record<string, string | undefined>>;
    readonly pathParams: Readonly<Record<string, string | undefined>>;
    readonly searchParams: Readonly<Record<string, string | ReadonlyArray<string> | undefined>>;
    readonly body: any;
}>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, HttpServerError.HttpServerError | Schema.SchemaError, HttpServerRequest.HttpServerRequest | HttpServerRequest.ParsedSearchParams | RouteContext | RD>;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare const schemaNoBody: <A, I extends Partial<{
    readonly method: HttpMethod.HttpMethod;
    readonly url: string;
    readonly cookies: Readonly<Record<string, string | undefined>>;
    readonly headers: Readonly<Record<string, string | undefined>>;
    readonly pathParams: Readonly<Record<string, string | undefined>>;
    readonly searchParams: Readonly<Record<string, string | ReadonlyArray<string> | undefined>>;
}>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, HttpServerRequest.HttpServerRequest | HttpServerRequest.ParsedSearchParams | RouteContext | RD>;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare const schemaParams: <A, I extends Readonly<Record<string, string | ReadonlyArray<string> | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, HttpServerRequest.ParsedSearchParams | RouteContext | RD>;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare const schemaPathParams: <A, I extends Readonly<Record<string, string | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, RouteContext | RD>;
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
export declare const use: <A, E, R>(f: (router: HttpRouter) => Effect.Effect<A, E, R>) => Layer.Layer<never, E, HttpRouter | Exclude<R, Scope.Scope>>;
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
export declare const add: <E = never, R = never>(method: "*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS", path: PathInput, handler: HttpServerResponse.HttpServerResponse | Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> | ((request: HttpServerRequest.HttpServerRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>), options?: {
    readonly uninterruptible?: boolean | undefined;
}) => Layer.Layer<never, never, HttpRouter | Request.From<"Requires", Exclude<R, Provided>> | Request.From<"Error", E>>;
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
export declare const addAll: <Routes extends ReadonlyArray<Route<any, any>>, EX = never, RX = never>(routes: Routes | Effect.Effect<Routes, EX, RX>, options?: {
    readonly prefix?: string | undefined;
}) => Layer.Layer<never, EX, HttpRouter | Exclude<RX, Scope.Scope> | Request.From<"Requires", Exclude<Route.Context<Routes[number]>, Provided>> | Request.From<"Error", Route.Error<Routes[number]>>>;
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export declare const layer: Layer.Layer<HttpRouter>;
/**
 * @since 4.0.0
 * @category HttpRouter
 */
export declare const toHttpEffect: <A, E, R>(appLayer: Layer.Layer<A, E, R>) => Effect.Effect<Effect.Effect<HttpServerResponse.HttpServerResponse, Request.Only<"Error", R> | Request.Only<"GlobalRequires", R> | HttpServerError.HttpServerError, Scope.Scope | HttpServerRequest.HttpServerRequest | Request.Only<"Requires", R> | Request.Only<"GlobalRequires", R>>, Request.Without<E>, Exclude<Request.Without<R>, HttpRouter> | Scope.Scope>;
declare const RouteTypeId = "~effect/http/HttpRouter/Route";
/**
 * @since 4.0.0
 * @category Route
 */
export interface Route<E = never, R = never> {
    readonly [RouteTypeId]: typeof RouteTypeId;
    readonly method: HttpMethod.HttpMethod | "*";
    readonly path: PathInput;
    readonly handler: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>;
    readonly uninterruptible: boolean;
    readonly prefix: Option.Option<string>;
}
/**
 * @since 4.0.0
 * @category Route
 */
export declare namespace Route {
    /**
     * @since 4.0.0
     * @category Route
     */
    type Error<R extends Route<any, any>> = R extends Route<infer E, infer _R> ? E : never;
    /**
     * @since 4.0.0
     * @category Route
     */
    type Context<T extends Route<any, any>> = T extends Route<infer _E, infer R> ? R : never;
}
/**
 * @since 4.0.0
 * @category Route
 */
export declare const route: <E = never, R = never>(method: "*" | HttpMethod.HttpMethod, path: PathInput, handler: HttpServerResponse.HttpServerResponse | Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> | ((request: HttpServerRequest.HttpServerRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>), options?: {
    readonly uninterruptible?: boolean | undefined;
}) => Route<E, Exclude<R, Provided>>;
/**
 * @since 4.0.0
 * @category PathInput
 */
export type PathInput = `/${string}` | "*";
/**
 * @since 4.0.0
 * @category PathInput
 */
export declare const prefixPath: {
    /**
     * @since 4.0.0
     * @category PathInput
     */
    (prefix: string): (self: string) => string;
    /**
     * @since 4.0.0
     * @category PathInput
     */
    (self: string, prefix: string): string;
};
/**
 * @since 4.0.0
 * @category Route
 */
export declare const prefixRoute: {
    /**
     * @since 4.0.0
     * @category Route
     */
    (prefix: string): <E, R>(self: Route<E, R>) => Route<E, R>;
    /**
     * @since 4.0.0
     * @category Route
     */
    <E, R>(self: Route<E, R>, prefix: string): Route<E, R>;
};
/**
 * Represents a request-level dependency, that needs to be provided by
 * middleware.
 *
 * @since 4.0.0
 * @category Request types
 */
export interface Request<Kind extends string, T> {
    readonly _: unique symbol;
    readonly kind: Kind;
    readonly type: T;
}
/**
 * @since 4.0.0
 * @category Request types
 */
export declare namespace Request {
    /**
     * @since 4.0.0
     * @category Request types
     */
    type From<Kind extends string, R> = R extends infer T ? Request<Kind, T> : never;
    /**
     * @since 4.0.0
     * @category Request types
     */
    type Only<Kind extends string, A> = A extends Request<Kind, infer T> ? T : never;
    /**
     * @since 4.0.0
     * @category Request types
     */
    type Without<A> = A extends Request<infer _Kind, infer _> ? never : A;
}
/**
 * Services provided by the HTTP router, which are available in the
 * request context.
 *
 * @since 4.0.0
 * @category Request types
 */
export type Provided = HttpServerRequest.HttpServerRequest | Scope.Scope | HttpServerRequest.ParsedSearchParams | RouteContext;
/**
 * Services provided to global middleware.
 *
 * @since 4.0.0
 * @category Request types
 */
export type GlobalProvided = HttpServerRequest.HttpServerRequest | Scope.Scope;
declare const MiddlewareTypeId = "~effect/http/HttpRouter/Middleware";
/**
 * @since 4.0.0
 * @category Middleware
 */
export interface Middleware<Config extends {
    provides: any;
    handles: any;
    error: any;
    requires: any;
    layerError: any;
    layerRequires: any;
}> {
    readonly [MiddlewareTypeId]: Config;
    readonly layer: [Config["requires"]] extends [never] ? Layer.Layer<Request.From<"Requires", Config["provides"]>, Config["layerError"], Config["layerRequires"] | Request.From<"Requires", Config["requires"]> | Request.From<"Error", Config["error"]>> : "Need to .combine(middleware) that satisfy the missing request dependencies";
    readonly combine: <Config2 extends {
        provides: any;
        handles: any;
        error: any;
        requires: any;
        layerError: any;
        layerRequires: any;
    }>(other: Middleware<Config2>) => Middleware<{
        provides: Config2["provides"] | Config["provides"];
        handles: Config2["handles"] | Config["handles"];
        error: Config2["error"] | Exclude<Config["error"], Config2["handles"]>;
        requires: Exclude<Config["requires"], Config2["provides"]> | Config2["requires"];
        layerError: Config["layerError"] | Config2["layerError"];
        layerRequires: Config["layerRequires"] | Config2["layerRequires"];
    }>;
}
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
export declare const middleware: middleware.Make<never, never> & (<Config extends {
    provides?: any;
    handles?: any;
} = {}>() => middleware.Make<Config extends {
    provides: infer R;
} ? R : never, Config extends {
    handles: infer E;
} ? E : never>);
/**
 * @since 4.0.0
 * @category Middleware
 */
export declare namespace middleware {
    /**
     * @since 4.0.0
     * @category Middleware
     */
    type Make<Provides = never, Handles = never> = {
        <E, R, EX, RX, const Global extends boolean = false>(middleware: Effect.Effect<(effect: Effect.Effect<HttpServerResponse.HttpServerResponse, Types.NoInfer<Handles | Types.unhandled>, Types.NoInfer<Provides>>) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> & (Types.unhandled extends E ? unknown : "You must only handle the configured errors"), EX, RX>, options?: {
            readonly global?: Global | undefined;
        }): Global extends true ? Layer.Layer<Request.From<"Requires", Provides> | Request.From<"Error", Handles> | Request.From<"GlobalRequires", Provides> | Request.From<"GlobalError", Handles>, EX, HttpRouter | Exclude<RX, Scope.Scope> | Request.From<"GlobalRequires", Exclude<R, GlobalProvided>> | Request.From<"GlobalError", Exclude<E, Types.unhandled>>> : Middleware<{
            provides: Provides;
            handles: Handles;
            error: Exclude<E, Types.unhandled>;
            requires: Exclude<R, Provided>;
            layerError: EX;
            layerRequires: Exclude<RX, Scope.Scope>;
        }>;
        <E, R, const Global extends boolean = false>(middleware: ((effect: Effect.Effect<HttpServerResponse.HttpServerResponse, Types.NoInfer<Handles | Types.unhandled>, Types.NoInfer<Provides>>) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>) & (Types.unhandled extends E ? unknown : "You must only handle the configured errors"), options?: {
            readonly global?: Global | undefined;
        }): Global extends true ? Layer.Layer<Request.From<"Requires", Provides> | Request.From<"Error", Handles> | Request.From<"GlobalRequires", Provides> | Request.From<"GlobalError", Handles>, never, HttpRouter | Request.From<"GlobalRequires", Exclude<R, GlobalProvided>> | Request.From<"GlobalError", Exclude<E, Types.unhandled>>> : Middleware<{
            provides: Provides;
            handles: Handles;
            error: Exclude<E, Types.unhandled>;
            requires: Exclude<R, Provided>;
            layerError: never;
            layerRequires: never;
        }>;
    };
    /**
     * @since 4.0.0
     * @category Middleware
     */
    type Fn = (effect: Effect.Effect<HttpServerResponse.HttpServerResponse>) => Effect.Effect<HttpServerResponse.HttpServerResponse>;
}
/**
 * A middleware that applies CORS headers to the HTTP response.
 *
 * @since 4.0.0
 * @category Middleware
 */
export declare const cors: (options?: {
    readonly allowedOrigins?: ReadonlyArray<string> | undefined;
    readonly allowedMethods?: ReadonlyArray<string> | undefined;
    readonly allowedHeaders?: ReadonlyArray<string> | undefined;
    readonly exposedHeaders?: ReadonlyArray<string> | undefined;
    readonly maxAge?: number | undefined;
    readonly credentials?: boolean | undefined;
} | undefined) => Layer.Layer<never, never, HttpRouter>;
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
export declare const disableLogger: Layer.Layer<never>;
/**
 * Provides request-level dependencies to some routes.
 *
 * @since 4.0.0
 * @category Middleware
 */
export declare const provideRequest: <A2, E2, R2>(layer: Layer.Layer<A2, E2, R2>) => <A, E, R>(self: Layer.Layer<A, E, R>) => Layer.Layer<A, E | E2, R2 | Exclude<R, Request.From<"Requires", A2>>>;
/**
 * Serves the provided application layer as an HTTP server.
 *
 * @since 4.0.0
 * @category Server
 */
export declare const serve: <A, E, R, HE, HR = Request.Only<"Requires", R> | Request.Only<"GlobalRequires", R>>(appLayer: Layer.Layer<A, E, R>, options?: {
    readonly routerConfig?: Partial<FindMyWay.RouterConfig> | undefined;
    readonly disableLogger?: boolean | undefined;
    readonly disableListenLog?: boolean;
    /**
     * Middleware to apply to the HTTP server.
     *
     * NOTE: This middleware is applied to the entire HTTP server chain,
     * including the sending of the response. This means that modifications
     * to the response **WILL NOT** be reflected in the final response sent to the
     * client.
     *
     * Use HttpRouter.middleware to create middleware that can modify the
     * response.
     */
    readonly middleware?: (effect: Effect.Effect<HttpServerResponse.HttpServerResponse, Request.Only<"Error", R> | Request.Only<"GlobalError", R> | HttpServerError.HttpServerError, Scope.Scope | HttpServerRequest.HttpServerRequest | Request.Only<"Requires", R> | Request.Only<"GlobalRequires", R>>) => Effect.Effect<HttpServerResponse.HttpServerResponse, HE, HR>;
}) => Layer.Layer<A, Request.Without<E>, HttpServer.HttpServer | Exclude<Request.Without<R> | Exclude<HR, GlobalProvided>, HttpRouter>>;
/**
 * @since 4.0.0
 * @category Server
 */
export declare const toWebHandler: <A, E, R extends HttpRouter | Request<"Requires", any> | Request<"GlobalRequires", any> | Request<"Error", any> | Request<"GlobalError", any>, HE, HR = Exclude<Request.Only<"Requires", R> | Request.Only<"GlobalRequires", R>, A>>(appLayer: Layer.Layer<A, E, R>, options?: {
    readonly memoMap?: Layer.MemoMap | undefined;
    readonly routerConfig?: Partial<FindMyWay.RouterConfig> | undefined;
    readonly disableLogger?: boolean | undefined;
    /**
     * Middleware to apply to the HTTP server.
     *
     * NOTE: This middleware is applied to the entire HTTP server chain,
     * including the sending of the response. This means that modifications
     * to the response **WILL NOT** be reflected in the final response sent to the
     * client.
     *
     * Use HttpRouter.middleware to create middleware that can modify the
     * response.
     */
    readonly middleware?: (effect: Effect.Effect<HttpServerResponse.HttpServerResponse, Request.Only<"Error", R> | Request.Only<"GlobalError", R> | HttpServerError.HttpServerError, Scope.Scope | HttpServerRequest.HttpServerRequest | Request.Only<"Requires", R> | Request.Only<"GlobalRequires", R>>) => Effect.Effect<HttpServerResponse.HttpServerResponse, HE, HR>;
}) => {
    readonly handler: [HR] extends [never] ? ((request: globalThis.Request, context?: Context.Context<never> | undefined) => Promise<Response>) : ((request: globalThis.Request, context: Context.Context<HR>) => Promise<Response>);
    readonly dispose: () => Promise<void>;
};
export {};
//# sourceMappingURL=HttpRouter.d.ts.map