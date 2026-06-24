import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Scope from "../../Scope.ts";
import { type HttpMiddleware } from "./HttpMiddleware.ts";
import { HttpServerError } from "./HttpServerError.ts";
import { HttpServerRequest } from "./HttpServerRequest.ts";
import type { HttpServerResponse } from "./HttpServerResponse.ts";
import { appendPreResponseHandlerUnsafe } from "./internal/preResponseHandler.ts";
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const toHandled: <E, R, EH, RH>(self: Effect.Effect<HttpServerResponse, E, R>, handleResponse: (request: HttpServerRequest, response: HttpServerResponse) => Effect.Effect<unknown, EH, RH>, middleware?: HttpMiddleware | undefined) => Effect.Effect<void, never, Exclude<R | RH | HttpServerRequest, Scope.Scope>>;
/**
 * If you want to finalize the http request scope elsewhere, you can use this
 * function to eject from the default scope closure.
 *
 * @since 4.0.0
 * @category Scope
 */
export declare const scopeDisableClose: (scope: Scope.Scope) => void;
/**
 * @since 4.0.0
 * @category Scope
 */
export declare const scopeTransferToStream: (response: HttpServerResponse) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category Pre-response handlers
 */
export type PreResponseHandler = (request: HttpServerRequest, response: HttpServerResponse) => Effect.Effect<HttpServerResponse, HttpServerError>;
/**
 * @since 4.0.0
 * @category fiber refs
 */
export declare const appendPreResponseHandler: (handler: PreResponseHandler) => Effect.Effect<void, never, HttpServerRequest>;
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
export declare const withPreResponseHandler: {
    /**
     * @since 4.0.0
     * @category fiber refs
     */
    (handler: PreResponseHandler): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | HttpServerRequest>;
    /**
     * @since 4.0.0
     * @category fiber refs
     */
    <A, E, R>(self: Effect.Effect<A, E, R>, handler: PreResponseHandler): Effect.Effect<A, E, R | HttpServerRequest>;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebHandlerWith: <Provided, R = never, ReqR = Exclude<R, Provided | Scope.Scope | HttpServerRequest>>(context: Context.Context<Provided>) => <E>(self: Effect.Effect<HttpServerResponse, E, R>, middleware?: HttpMiddleware | undefined) => [ReqR] extends [never] ? (request: Request, context?: Context.Context<never> | undefined) => Promise<globalThis.Response> : (request: Request, context: Context.Context<ReqR>) => Promise<globalThis.Response>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebHandler: <E>(self: Effect.Effect<HttpServerResponse, E, HttpServerRequest | Scope.Scope>, middleware?: HttpMiddleware | undefined) => (request: Request, context?: Context.Context<never> | undefined) => Promise<globalThis.Response>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebHandlerLayerWith: <E, Provided, LE, R, ReqR = Exclude<R, Provided | Scope.Scope | HttpServerRequest>>(layer: Layer.Layer<Provided, LE>, options: {
    readonly toHandler: (context: Context.Context<Provided>) => Effect.Effect<Effect.Effect<HttpServerResponse, E, R>, LE>;
    readonly middleware?: HttpMiddleware | undefined;
    readonly memoMap?: Layer.MemoMap | undefined;
}) => {
    readonly dispose: () => Promise<void>;
    readonly handler: [ReqR] extends [never] ? (request: Request, context?: Context.Context<never> | undefined) => Promise<globalThis.Response> : (request: Request, context: Context.Context<ReqR>) => Promise<globalThis.Response>;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebHandlerLayer: <E, R, Provided, LE, ReqR = Exclude<R, Provided | Scope.Scope | HttpServerRequest>>(self: Effect.Effect<HttpServerResponse, E, R>, layer: Layer.Layer<Provided, LE>, options?: {
    readonly middleware?: HttpMiddleware | undefined;
    readonly memoMap?: Layer.MemoMap | undefined;
} | undefined) => {
    readonly dispose: () => Promise<void>;
    readonly handler: [ReqR] extends [never] ? (request: Request, context?: Context.Context<never> | undefined) => Promise<globalThis.Response> : (request: Request, context: Context.Context<ReqR>) => Promise<globalThis.Response>;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromWebHandler: (handler: (request: Request) => Promise<Response>) => Effect.Effect<HttpServerResponse, HttpServerError, HttpServerRequest>;
//# sourceMappingURL=HttpEffect.d.ts.map