/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Layer from "../../Layer.ts";
import * as Path from "../../Path.ts";
import type * as Scope from "../../Scope.ts";
import * as Etag from "./Etag.ts";
import * as HttpClient from "./HttpClient.ts";
import type * as Middleware from "./HttpMiddleware.ts";
import * as HttpPlatform from "./HttpPlatform.ts";
import type { HttpServerRequest } from "./HttpServerRequest.ts";
import type { HttpServerResponse } from "./HttpServerResponse.ts";
declare const HttpServer_base: Context.ServiceClass<HttpServer, "effect/http/HttpServer", {
    readonly serve: {
        <E, R>(effect: Effect.Effect<HttpServerResponse, E, R>): Effect.Effect<void, never, Exclude<R, HttpServerRequest> | Scope.Scope>;
        <E, R, App extends Effect.Effect<HttpServerResponse, any, any>>(effect: Effect.Effect<HttpServerResponse, E, R>, middleware: Middleware.HttpMiddleware.Applied<App, E, R>): Effect.Effect<void, never, Exclude<R, HttpServerRequest> | Scope.Scope>;
    };
    readonly address: Address;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class HttpServer extends HttpServer_base {
}
/**
 * @since 4.0.0
 * @category address
 */
export type Address = UnixAddress | TcpAddress;
/**
 * @since 4.0.0
 * @category address
 */
export interface TcpAddress {
    readonly _tag: "TcpAddress";
    readonly hostname: string;
    readonly port: number;
}
/**
 * @since 4.0.0
 * @category address
 */
export interface UnixAddress {
    readonly _tag: "UnixAddress";
    readonly path: string;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options: {
    readonly serve: (httpEffect: Effect.Effect<HttpServerResponse, unknown, HttpServerRequest | Scope.Scope>, middleware?: Middleware.HttpMiddleware) => Effect.Effect<void, never, Scope.Scope>;
    readonly address: Address;
}) => HttpServer["Service"];
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const serve: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    (): <E, R>(effect: Effect.Effect<HttpServerResponse, E, R>) => Layer.Layer<never, never, HttpServer | Exclude<R, HttpServerRequest | Scope.Scope>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R, App extends Effect.Effect<HttpServerResponse, any, any>>(middleware: Middleware.HttpMiddleware.Applied<App, E, R>): (effect: Effect.Effect<HttpServerResponse, E, R>) => Layer.Layer<never, never, HttpServer | Exclude<Effect.Services<App>, HttpServerRequest | Scope.Scope>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R>(effect: Effect.Effect<HttpServerResponse, E, R>): Layer.Layer<never, never, HttpServer | Exclude<R, HttpServerRequest | Scope.Scope>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R, App extends Effect.Effect<HttpServerResponse, any, any>>(effect: Effect.Effect<HttpServerResponse, E, R>, middleware: Middleware.HttpMiddleware.Applied<App, E, R>): Layer.Layer<never, never, HttpServer | Exclude<Effect.Services<App>, HttpServerRequest | Scope.Scope>>;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const serveEffect: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    (): <E, R>(effect: Effect.Effect<HttpServerResponse, E, R>) => Effect.Effect<void, never, Scope.Scope | HttpServer | Exclude<R, HttpServerRequest>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R, App extends Effect.Effect<HttpServerResponse, any, any>>(middleware: Middleware.HttpMiddleware.Applied<App, E, R>): (effect: Effect.Effect<HttpServerResponse, E, R>) => Effect.Effect<void, never, Scope.Scope | HttpServer | Exclude<Effect.Services<App>, HttpServerRequest>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R>(effect: Effect.Effect<HttpServerResponse, E, R>): Effect.Effect<void, never, Scope.Scope | HttpServer | Exclude<R, HttpServerRequest>>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <E, R, App extends Effect.Effect<HttpServerResponse, any, any>>(effect: Effect.Effect<HttpServerResponse, E, R>, middleware: Middleware.HttpMiddleware.Applied<App, E, R>): Effect.Effect<void, never, Scope.Scope | HttpServer | Exclude<Effect.Services<App>, HttpServerRequest>>;
};
/**
 * @since 4.0.0
 * @category address
 */
export declare const formatAddress: (address: Address) => string;
/**
 * @since 4.0.0
 * @category address
 */
export declare const addressFormattedWith: <A, E, R>(f: (address: string) => Effect.Effect<A, E, R>) => Effect.Effect<A, E, HttpServer | R>;
/**
 * @since 4.0.0
 * @category address
 */
export declare const logAddress: Effect.Effect<void, never, HttpServer>;
/**
 * @since 4.0.0
 * @category address
 */
export declare const withLogAddress: <A, E, R>(layer: Layer.Layer<A, E, R>) => Layer.Layer<A, E, R | Exclude<HttpServer, A>>;
/**
 * @since 4.0.0
 * @category Testing
 */
export declare const makeTestClient: Effect.Effect<HttpClient.HttpClient, never, HttpServer | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Testing
 */
export declare const layerTestClient: Layer.Layer<HttpClient.HttpClient, never, HttpServer | HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Testing
 */
export declare const layerServices: Layer.Layer<Path.Path | HttpPlatform.HttpPlatform | FileSystem.FileSystem | Etag.Generator>;
export {};
//# sourceMappingURL=HttpServer.d.ts.map