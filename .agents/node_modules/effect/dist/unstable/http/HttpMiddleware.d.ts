import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type { Predicate } from "../../Predicate.ts";
import { HttpServerRequest } from "./HttpServerRequest.ts";
import * as Request from "./HttpServerRequest.ts";
import * as Response from "./HttpServerResponse.ts";
import type { HttpServerResponse } from "./HttpServerResponse.ts";
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpMiddleware {
    <E, R>(self: Effect.Effect<HttpServerResponse, E, R | HttpServerRequest>): Effect.Effect<HttpServerResponse, any, any>;
}
/**
 * @since 4.0.0
 */
export declare namespace HttpMiddleware {
    /**
     * @since 4.0.0
     */
    interface Applied<A extends Effect.Effect<HttpServerResponse, any, any>, E, R> {
        (self: Effect.Effect<HttpServerResponse, E, R>): A;
    }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <M extends HttpMiddleware>(middleware: M) => M;
/**
 * @since 4.0.0
 * @category Logger
 */
export declare const withLoggerDisabled: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | HttpServerRequest>;
/**
 * @since 4.0.0
 * @category Tracer
 */
export declare const TracerDisabledWhen: Context.Reference<Predicate<HttpServerRequest>>;
/**
 * @since 4.0.0
 * @category Tracer
 */
export declare const layerTracerDisabledForUrls: (urls: ReadonlyArray<string>) => Layer.Layer<never>;
/**
 * @since 4.0.0
 * @category Tracer
 */
export declare const SpanNameGenerator: Context.Reference<(request: HttpServerRequest) => string>;
/**
 * @since 4.0.0
 * @category Logger
 */
export declare const logger: <E, R>(httpApp: Effect.Effect<HttpServerResponse, E, HttpServerRequest | R>) => Effect.Effect<HttpServerResponse, E, HttpServerRequest | R>;
/**
 * @since 4.0.0
 * @category Tracer
 */
export declare const tracer: <E, R>(httpApp: Effect.Effect<HttpServerResponse, E, HttpServerRequest | R>) => Effect.Effect<HttpServerResponse, E, HttpServerRequest | R>;
/**
 * @since 4.0.0
 * @category Proxying
 */
export declare const xForwardedHeaders: <E, R>(httpApp: Effect.Effect<Response.HttpServerResponse, E, HttpServerRequest | R>) => Effect.Effect<Response.HttpServerResponse, E, HttpServerRequest | R>;
/**
 * @since 4.0.0
 * @category Search params
 */
export declare const searchParamsParser: <E, R>(httpApp: Effect.Effect<HttpServerResponse, E, R>) => Effect.Effect<Response.HttpServerResponse, E, HttpServerRequest | Exclude<R, Request.ParsedSearchParams>>;
/**
 * @since 4.0.0
 * @category CORS
 */
export declare const cors: (options?: {
    readonly allowedOrigins?: ReadonlyArray<string> | Predicate<string> | undefined;
    readonly allowedMethods?: ReadonlyArray<string> | undefined;
    readonly allowedHeaders?: ReadonlyArray<string> | undefined;
    readonly exposedHeaders?: ReadonlyArray<string> | undefined;
    readonly maxAge?: number | undefined;
    readonly credentials?: boolean | undefined;
}) => <E, R>(httpApp: Effect.Effect<HttpServerResponse, E, R>) => Effect.Effect<HttpServerResponse, E, R | HttpServerRequest>;
//# sourceMappingURL=HttpMiddleware.d.ts.map