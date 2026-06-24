import * as Schema from "../../Schema.ts";
import type * as HttpClientRequest from "./HttpClientRequest.ts";
import type * as ClientResponse from "./HttpClientResponse.ts";
declare const TypeId = "~effect/http/HttpClientError";
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isHttpClientError: (u: unknown) => u is HttpClientError;
declare const HttpClientError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "HttpClientError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class HttpClientError extends HttpClientError_base<{
    readonly reason: HttpClientErrorReason;
}> {
    constructor(props: {
        readonly reason: HttpClientErrorReason;
    });
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/http/HttpClientError";
    /**
     * @since 4.0.0
     */
    get request(): HttpClientRequest.HttpClientRequest;
    /**
     * @since 4.0.0
     */
    get response(): ClientResponse.HttpClientResponse | undefined;
    get message(): string;
}
declare const TransportError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "TransportError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class TransportError extends TransportError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly cause?: unknown;
    readonly description?: string;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const EncodeError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EncodeError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class EncodeError extends EncodeError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly cause?: unknown;
    readonly description?: string;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const InvalidUrlError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "InvalidUrlError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class InvalidUrlError extends InvalidUrlError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly cause?: unknown;
    readonly description?: string;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const StatusCodeError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "StatusCodeError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class StatusCodeError extends StatusCodeError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly response: ClientResponse.HttpClientResponse;
    readonly cause?: unknown;
    readonly description?: string | undefined;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const DecodeError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "DecodeError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class DecodeError extends DecodeError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly response: ClientResponse.HttpClientResponse;
    readonly cause?: unknown;
    readonly description?: string | undefined;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const EmptyBodyError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EmptyBodyError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category error
 */
export declare class EmptyBodyError extends EmptyBodyError_base<{
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly response: ClientResponse.HttpClientResponse;
    readonly cause?: unknown;
    readonly description?: string | undefined;
}> {
    /**
     * @since 4.0.0
     */
    get methodAndUrl(): string;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
/**
 * @since 4.0.0
 * @category error
 */
export type RequestError = TransportError | EncodeError | InvalidUrlError;
/**
 * @since 4.0.0
 * @category error
 */
export type ResponseError = StatusCodeError | DecodeError | EmptyBodyError;
/**
 * @since 4.0.0
 * @category error
 */
export type HttpClientErrorReason = RequestError | ResponseError;
declare const HttpClientErrorSchema_base: Schema.Class<HttpClientErrorSchema, Schema.Struct<{
    readonly _tag: Schema.tag<"HttpError">;
    readonly kind: Schema.Literals<("StatusCodeError" | "DecodeError" | "EmptyBodyError" | "TransportError" | "EncodeError" | "InvalidUrlError")[]>;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare class HttpClientErrorSchema extends HttpClientErrorSchema_base {
    /**
     * @since 4.0.0
     */
    static fromHttpClientError(error: HttpClientError): HttpClientErrorSchema;
}
export {};
//# sourceMappingURL=HttpClientError.d.ts.map