/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as ErrorReporter from "../../ErrorReporter.ts";
import type * as Exit from "../../Exit.ts";
import * as Option from "../../Option.ts";
import type * as Request from "./HttpServerRequest.ts";
import * as Respondable from "./HttpServerRespondable.ts";
import * as Response from "./HttpServerResponse.ts";
declare const TypeId = "~effect/http/HttpServerError";
declare const HttpServerError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "HttpServerError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class HttpServerError extends HttpServerError_base<{
    readonly reason: HttpServerErrorReason;
}> implements Respondable.Respondable {
    constructor(props: {
        readonly reason: HttpServerErrorReason;
    });
    readonly [TypeId] = "~effect/http/HttpServerError";
    stack: string;
    get request(): Request.HttpServerRequest;
    get response(): Response.HttpServerResponse | undefined;
    [Respondable.symbol](): Effect.Effect<Response.HttpServerResponse, never, never>;
    get [ErrorReporter.ignore](): boolean;
    get message(): string;
}
declare const RequestParseError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "RequestParseError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class RequestParseError extends RequestParseError_base<{
    readonly request: Request.HttpServerRequest;
    readonly description?: string;
    readonly cause?: unknown;
}> implements Respondable.Respondable {
    /**
     * @since 4.0.0
     */
    [Respondable.symbol](): Effect.Effect<Response.HttpServerResponse, never, never>;
    get methodAndUrl(): string;
    get message(): string;
}
declare const RouteNotFound_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "RouteNotFound";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class RouteNotFound extends RouteNotFound_base<{
    readonly request: Request.HttpServerRequest;
    readonly description?: string;
    readonly cause?: unknown;
}> implements Respondable.Respondable {
    [Respondable.symbol](): Effect.Effect<Response.HttpServerResponse, never, never>;
    readonly [ErrorReporter.ignore] = true;
    get methodAndUrl(): string;
    get message(): string;
}
declare const InternalError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "InternalError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class InternalError extends InternalError_base<{
    readonly request: Request.HttpServerRequest;
    readonly description?: string;
    readonly cause?: unknown;
}> implements Respondable.Respondable {
    /**
     * @since 4.0.0
     */
    [Respondable.symbol](): Effect.Effect<Response.HttpServerResponse, never, never>;
    get methodAndUrl(): string;
    get message(): string;
}
/**
 * @since 4.0.0
 * @category predicates
 */
export declare const isHttpServerError: (u: unknown) => u is HttpServerError;
declare const ResponseError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "ResponseError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class ResponseError extends ResponseError_base<{
    readonly request: Request.HttpServerRequest;
    readonly response: Response.HttpServerResponse;
    readonly description?: string;
    readonly cause?: unknown;
}> implements Respondable.Respondable {
    [Respondable.symbol](): Effect.Effect<Response.HttpServerResponse, never, never>;
    get methodAndUrl(): string;
    get message(): string;
}
/**
 * @since 4.0.0
 * @category error
 */
export type RequestError = RequestParseError | RouteNotFound | InternalError;
/**
 * @since 4.0.0
 * @category error
 */
export type HttpServerErrorReason = RequestError | ResponseError;
declare const ServeError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "ServeError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class ServeError extends ServeError_base<{
    readonly cause: unknown;
}> {
}
declare const ClientAbort_base: Context.ServiceClass<ClientAbort, "effect/http/HttpServerError/ClientAbort", true>;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare class ClientAbort extends ClientAbort_base {
    static annotation: Context.Context<Cause.StackTrace | ClientAbort>;
}
/**
 * @since 4.0.0
 */
export declare const causeResponse: <E>(cause: Cause.Cause<E>) => Effect.Effect<readonly [Response.HttpServerResponse, Cause.Cause<E>]>;
/**
 * @since 4.0.0
 */
export declare const causeResponseStripped: <E>(cause: Cause.Cause<E>) => readonly [response: Response.HttpServerResponse, cause: Option.Option<Cause.Cause<E>>];
/**
 * @since 4.0.0
 */
export declare const exitResponse: <E>(exit: Exit.Exit<Response.HttpServerResponse, E>) => Response.HttpServerResponse;
export {};
//# sourceMappingURL=HttpServerError.d.ts.map