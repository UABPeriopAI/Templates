/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as ErrorReporter from "../../ErrorReporter.ts";
import type * as FileSystem from "../../FileSystem.ts";
import * as Inspectable from "../../Inspectable.ts";
import { type Pipeable } from "../../Pipeable.ts";
import type { PlatformError } from "../../PlatformError.ts";
import type * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import * as Stream from "../../Stream.ts";
import * as Cookies from "./Cookies.ts";
import * as Headers from "./Headers.ts";
import * as Body from "./HttpBody.ts";
import * as HttpClientRequest from "./HttpClientRequest.ts";
import * as HttpClientResponse from "./HttpClientResponse.ts";
import type { HttpPlatform } from "./HttpPlatform.ts";
import * as Template from "./Template.ts";
import * as UrlParams from "./UrlParams.ts";
declare const TypeId = "~effect/http/HttpServerResponse";
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpServerResponse extends Inspectable.Inspectable, Pipeable, ErrorReporter.Reportable {
    readonly [TypeId]: typeof TypeId;
    readonly status: number;
    readonly statusText?: string | undefined;
    readonly headers: Headers.Headers;
    readonly cookies: Cookies.Cookies;
    readonly body: Body.HttpBody;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Options {
    readonly status?: number | undefined;
    readonly statusText?: string | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly cookies?: Cookies.Cookies | undefined;
    readonly contentType?: string | undefined;
    readonly contentLength?: number | undefined;
}
/**
 * @since 4.0.0
 */
export declare namespace Options {
    /**
     * @since 4.0.0
     * @category models
     */
    interface WithContent extends Omit<Options, "contentType" | "contentLength"> {
    }
    /**
     * @since 4.0.0
     * @category models
     */
    interface WithContentType extends Omit<Options, "contentLength"> {
    }
}
/**
 * @since 4.0.0
 */
export declare const isHttpServerResponse: (u: unknown) => u is HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: (options?: Options.WithContent | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const redirect: (location: string | URL, options?: Options.WithContent | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const uint8Array: (body: Uint8Array, options?: Options.WithContentType) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const text: (body: string, options?: Options.WithContentType) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const html: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A extends ReadonlyArray<Template.Interpolated>>(strings: TemplateStringsArray, ...args: A): Effect.Effect<HttpServerResponse, Template.Interpolated.Error<A[number]>, Template.Interpolated.Context<A[number]>>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    (html: string): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const htmlStream: <A extends ReadonlyArray<Template.InterpolatedWithStream>>(strings: TemplateStringsArray, ...args: A) => Effect.Effect<HttpServerResponse, never, Template.Interpolated.Context<A[number]>>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const json: (body: unknown, options?: Options.WithContentType | undefined) => Effect.Effect<HttpServerResponse, Body.HttpBodyError>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const schemaJson: <A, I, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => (body: A, options?: Options.WithContentType | undefined) => Effect.Effect<HttpServerResponse, Body.HttpBodyError, RE>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const jsonUnsafe: (body: unknown, options?: Options.WithContentType | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const urlParams: (body: UrlParams.Input, options?: Options.WithContentType | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const raw: (body: unknown, options?: Options | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const formData: (body: FormData, options?: Options.WithContent | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const stream: <E>(body: Stream.Stream<Uint8Array, E>, options?: Options | undefined) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const file: (path: string, options?: (Options & {
    readonly bytesToRead?: FileSystem.SizeInput | undefined;
    readonly chunkSize?: FileSystem.SizeInput | undefined;
    readonly offset?: FileSystem.SizeInput | undefined;
}) | undefined) => Effect.Effect<HttpServerResponse, PlatformError, HttpPlatform>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fileWeb: (file: Body.HttpBody.FileLike, options?: (Options.WithContent & {
    readonly bytesToRead?: FileSystem.SizeInput | undefined;
    readonly chunkSize?: FileSystem.SizeInput | undefined;
    readonly offset?: FileSystem.SizeInput | undefined;
}) | undefined) => Effect.Effect<HttpServerResponse, never, HttpPlatform>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setHeader: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: string): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, key: string, value: string): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setHeaders: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: Headers.Input): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, input: Headers.Input): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const removeCookie: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, name: string): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const replaceCookies: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Cookies.Cookies): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, cookies: Cookies.Cookies): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setCookie: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string, value: string, options?: Cookies.Cookie["options"]): (self: HttpServerResponse) => Effect.Effect<HttpServerResponse, Cookies.CookiesError>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, name: string, value: string, options?: Cookies.Cookie["options"]): Effect.Effect<HttpServerResponse, Cookies.CookiesError>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const expireCookie: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string, options?: Omit<NonNullable<Cookies.Cookie["options"]>, "expires" | "maxAge">): (self: HttpServerResponse) => Effect.Effect<HttpServerResponse, Cookies.CookiesError>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, name: string, options?: Omit<NonNullable<Cookies.Cookie["options"]>, "expires" | "maxAge">): Effect.Effect<HttpServerResponse, Cookies.CookiesError>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setCookieUnsafe: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string, value: string, options?: Cookies.Cookie["options"]): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, name: string, value: string, options?: Cookies.Cookie["options"]): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const expireCookieUnsafe: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string, options?: Omit<NonNullable<Cookies.Cookie["options"]>, "expires" | "maxAge">): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, name: string, options?: Omit<NonNullable<Cookies.Cookie["options"]>, "expires" | "maxAge">): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const updateCookies: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (f: (cookies: Cookies.Cookies) => Cookies.Cookies): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, f: (cookies: Cookies.Cookies) => Cookies.Cookies): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const mergeCookies: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Cookies.Cookies): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, cookies: Cookies.Cookies): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setCookies: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Iterable<readonly [
        name: string,
        value: string,
        options?: Cookies.Cookie["options"]
    ]>): (self: HttpServerResponse) => Effect.Effect<HttpServerResponse, Cookies.CookiesError, never>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, cookies: Iterable<readonly [
        name: string,
        value: string,
        options?: Cookies.Cookie["options"]
    ]>): Effect.Effect<HttpServerResponse, Cookies.CookiesError, never>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setCookiesUnsafe: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Iterable<readonly [
        name: string,
        value: string,
        options?: Cookies.Cookie["options"]
    ]>): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, cookies: Iterable<readonly [
        name: string,
        value: string,
        options?: Cookies.Cookie["options"]
    ]>): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setBody: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: Body.HttpBody): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, body: Body.HttpBody): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setStatus: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (status: number, statusText?: string | undefined): (self: HttpServerResponse) => HttpServerResponse;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpServerResponse, status: number, statusText?: string | undefined): HttpServerResponse;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWeb: (response: HttpServerResponse, options?: {
    readonly withoutBody?: boolean | undefined;
    readonly context?: Context.Context<never> | undefined;
}) => Response;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toClientResponse: (response: HttpServerResponse, options?: {
    readonly request?: HttpClientRequest.HttpClientRequest | undefined;
}) => HttpClientResponse.HttpClientResponse;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromClientResponse: (response: HttpClientResponse.HttpClientResponse) => HttpServerResponse;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromWeb: (response: Response) => HttpServerResponse;
export {};
//# sourceMappingURL=HttpServerResponse.d.ts.map