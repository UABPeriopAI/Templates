/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import * as Inspectable from "../../Inspectable.ts";
import * as Option from "../../Option.ts";
import { type Pipeable } from "../../Pipeable.ts";
import type * as PlatformError from "../../PlatformError.ts";
import type * as Redacted from "../../Redacted.ts";
import * as Result from "../../Result.ts";
import type * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import * as Stream from "../../Stream.ts";
import * as Headers from "./Headers.ts";
import * as HttpBody from "./HttpBody.ts";
import { type HttpMethod } from "./HttpMethod.ts";
import * as UrlParams from "./UrlParams.ts";
declare const TypeId = "~effect/http/HttpClientRequest";
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isHttpClientRequest: (u: unknown) => u is HttpClientRequest;
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpClientRequest extends Inspectable.Inspectable, Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly method: HttpMethod;
    readonly url: string;
    readonly urlParams: UrlParams.UrlParams;
    readonly hash: Option.Option<string>;
    readonly headers: Headers.Headers;
    readonly body: HttpBody.HttpBody;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Options {
    readonly method?: HttpMethod | undefined;
    readonly url?: string | URL | undefined;
    readonly urlParams?: UrlParams.Input | undefined;
    readonly hash?: string | undefined;
    readonly headers?: Headers.Input | undefined;
    readonly body?: HttpBody.HttpBody | undefined;
    readonly accept?: string | undefined;
    readonly acceptJson?: boolean | undefined;
}
/**
 * @since 4.0.0
 */
export declare namespace Options {
    /**
     * @since 4.0.0
     * @category models
     */
    interface NoUrl extends Omit<Options, "method" | "url"> {
    }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare function makeWith(method: HttpMethod, url: string, urlParams: UrlParams.UrlParams, hash: Option.Option<string>, headers: Headers.Headers, body: HttpBody.HttpBody): HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <M extends HttpMethod>(method: M) => (url: string | URL, options?: Options.NoUrl | undefined) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const get: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const post: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const patch: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const put: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
declare const del: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
export { 
/**
 * @since 4.0.0
 * @category constructors
 */
del as delete };
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const head: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const options: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const trace: (url: string | URL, options?: Options.NoUrl) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const modify: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (options: Options): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, options: Options): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setMethod: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (method: HttpMethod): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, method: HttpMethod): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setHeader: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, key: string, value: string): HttpClientRequest;
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
    (input: Headers.Input): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, input: Headers.Input): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const basicAuth: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (username: string | Redacted.Redacted, password: string | Redacted.Redacted): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, username: string | Redacted.Redacted, password: string | Redacted.Redacted): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bearerToken: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (token: string | Redacted.Redacted): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, token: string | Redacted.Redacted): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const accept: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (mediaType: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, mediaType: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const acceptJson: (self: HttpClientRequest) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setUrl: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (url: string | URL): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, url: string | URL): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const prependUrl: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (path: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, path: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const appendUrl: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (path: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, path: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const updateUrl: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (f: (url: string) => string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, f: (url: string) => string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setUrlParam: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, key: string, value: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setUrlParams: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: UrlParams.Input): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, input: UrlParams.Input): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const appendUrlParam: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, key: string, value: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const appendUrlParams: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: UrlParams.Input): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, input: UrlParams.Input): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setHash: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (hash: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, hash: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const removeHash: (self: HttpClientRequest) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setBody: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: HttpBody.HttpBody): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: HttpBody.HttpBody): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyUint8Array: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: Uint8Array, contentType?: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: Uint8Array, contentType?: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyText: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: string, contentType?: string): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: string, contentType?: string): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyJson: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: unknown): (self: HttpClientRequest) => Effect.Effect<HttpClientRequest, HttpBody.HttpBodyError>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: unknown): Effect.Effect<HttpClientRequest, HttpBody.HttpBodyError>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyJsonUnsafe: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: unknown): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: unknown): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const schemaBodyJson: <S extends Schema.Top>(schema: S, options?: ParseOptions | undefined) => {
    (body: S["Type"]): (self: HttpClientRequest) => Effect.Effect<HttpClientRequest, HttpBody.HttpBodyError, S["EncodingServices"]>;
    (self: HttpClientRequest, body: S["Type"]): Effect.Effect<HttpClientRequest, HttpBody.HttpBodyError, S["EncodingServices"]>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyUrlParams: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (input: UrlParams.Input): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, input: UrlParams.Input): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyFormData: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: FormData): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: FormData): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyFormDataRecord: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (entries: HttpBody.FormDataInput): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, entries: HttpBody.FormDataInput): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyStream: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (body: Stream.Stream<Uint8Array, unknown>, options?: {
        readonly contentType?: string | undefined;
        readonly contentLength?: number | undefined;
    } | undefined): (self: HttpClientRequest) => HttpClientRequest;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, body: Stream.Stream<Uint8Array, unknown>, options?: {
        readonly contentType?: string | undefined;
        readonly contentLength?: number | undefined;
    } | undefined): HttpClientRequest;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const bodyFile: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (path: string, options?: {
        readonly bytesToRead?: FileSystem.SizeInput | undefined;
        readonly chunkSize?: FileSystem.SizeInput | undefined;
        readonly offset?: FileSystem.SizeInput | undefined;
        readonly contentType?: string;
    }): (self: HttpClientRequest) => Effect.Effect<HttpClientRequest, PlatformError.PlatformError, FileSystem.FileSystem>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: HttpClientRequest, path: string, options?: {
        readonly bytesToRead?: FileSystem.SizeInput | undefined;
        readonly chunkSize?: FileSystem.SizeInput | undefined;
        readonly offset?: FileSystem.SizeInput | undefined;
        readonly contentType?: string;
    }): Effect.Effect<HttpClientRequest, PlatformError.PlatformError, FileSystem.FileSystem>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare function toUrl(self: HttpClientRequest): Option.Option<URL>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromWeb: (request: globalThis.Request) => HttpClientRequest;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebResult: (self: HttpClientRequest, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly context?: Context.Context<never> | undefined;
}) => Result.Result<Request, UrlParams.UrlParamsError>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWeb: (self: HttpClientRequest, options?: {
    readonly signal?: AbortSignal | undefined;
}) => Effect.Effect<Request, UrlParams.UrlParamsError>;
//# sourceMappingURL=HttpClientRequest.d.ts.map