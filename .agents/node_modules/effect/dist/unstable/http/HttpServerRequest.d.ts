/**
 * @since 4.0.0
 */
import type * as Arr from "../../Array.ts";
import * as Channel from "../../Channel.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import * as Option from "../../Option.ts";
import type * as Path from "../../Path.ts";
import type { ReadonlyRecord } from "../../Record.ts";
import * as Result from "../../Result.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as Socket from "../socket/Socket.ts";
import * as Headers from "./Headers.ts";
import * as HttpClientRequest from "./HttpClientRequest.ts";
import * as HttpIncomingMessage from "./HttpIncomingMessage.ts";
import { type HttpMethod } from "./HttpMethod.ts";
import { HttpServerError, type RequestError } from "./HttpServerError.ts";
import * as Multipart from "./Multipart.ts";
export { 
/**
 * @since 4.0.0
 * @category fiber refs
 */
MaxBodySize } from "./HttpIncomingMessage.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId = "~effect/http/HttpServerRequest";
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpServerRequest extends HttpIncomingMessage.HttpIncomingMessage<HttpServerError> {
    readonly [TypeId]: typeof TypeId;
    readonly source: object;
    readonly url: string;
    readonly originalUrl: string;
    readonly method: HttpMethod;
    readonly cookies: ReadonlyRecord<string, string>;
    readonly multipart: Effect.Effect<Multipart.Persisted, Multipart.MultipartError, Scope.Scope | FileSystem.FileSystem | Path.Path>;
    readonly multipartStream: Stream.Stream<Multipart.Part, Multipart.MultipartError>;
    readonly upgrade: Effect.Effect<Socket.Socket, HttpServerError>;
    readonly modify: (options: {
        readonly url?: string;
        readonly headers?: Headers.Headers;
        readonly remoteAddress?: Option.Option<string>;
    }) => HttpServerRequest;
}
/**
 * @since 4.0.0
 * @category context
 */
export declare const HttpServerRequest: Context.Service<HttpServerRequest, HttpServerRequest>;
declare const ParsedSearchParams_base: Context.ServiceClass<ParsedSearchParams, "effect/http/ParsedSearchParams", ReadonlyRecord<string, string | string[]>>;
/**
 * @since 4.0.0
 * @category search params
 */
export declare class ParsedSearchParams extends ParsedSearchParams_base {
}
/**
 * @since 4.0.0
 * @category search params
 */
export declare const searchParamsFromURL: (url: URL) => ReadonlyRecord<string, string | Array<string>>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const upgradeChannel: <IE = never>() => Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, HttpServerError | IE | Socket.SocketError, void, Arr.NonEmptyReadonlyArray<string | Uint8Array | Socket.CloseEvent>, IE, unknown, HttpServerRequest>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaCookies: <A, I extends Readonly<Record<string, string | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, RD | HttpServerRequest>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaHeaders: <A, I extends Readonly<Record<string, string | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, HttpServerRequest | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaSearchParams: <A, I extends Readonly<Record<string, string | ReadonlyArray<string> | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError, ParsedSearchParams | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyJson: <A, I, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, HttpServerError | Schema.SchemaError, HttpServerRequest | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyForm: <A, I extends Partial<Multipart.Persisted>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Schema.SchemaError | Multipart.MultipartError | HttpServerError, Scope.Scope | FileSystem.FileSystem | Path.Path | HttpServerRequest | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyUrlParams: <A, I extends Readonly<Record<string, string | ReadonlyArray<string> | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, HttpServerError | Schema.SchemaError, HttpServerRequest | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyMultipart: <A, I extends Partial<Multipart.Persisted>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => Effect.Effect<A, Multipart.MultipartError | Schema.SchemaError, HttpServerRequest | Scope.Scope | FileSystem.FileSystem | Path.Path | RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyFormJson: <A, I, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => (field: string) => Effect.Effect<A, Schema.SchemaError | HttpServerError, Scope.Scope | FileSystem.FileSystem | Path.Path | HttpServerRequest | RD>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromClientRequest: (request: HttpClientRequest.HttpClientRequest) => HttpServerRequest;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const fromWeb: (request: globalThis.Request) => HttpServerRequest;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toClientRequest: (request: HttpServerRequest) => HttpClientRequest.HttpClientRequest;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toURL: (self: HttpServerRequest) => Option.Option<URL>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWebResult: (self: HttpServerRequest, options?: {
    readonly signal?: AbortSignal | undefined;
    readonly context?: Context.Context<never> | undefined;
}) => Result.Result<Request, RequestError>;
/**
 * @since 4.0.0
 * @category conversions
 */
export declare const toWeb: (self: HttpServerRequest, options?: {
    readonly signal?: AbortSignal | undefined;
}) => Effect.Effect<Request, RequestError>;
//# sourceMappingURL=HttpServerRequest.d.ts.map