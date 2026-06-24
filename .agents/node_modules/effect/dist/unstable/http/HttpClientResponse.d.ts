/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import * as Stream from "../../Stream.ts";
import type { Unify } from "../../Unify.ts";
import * as Cookies from "./Cookies.ts";
import * as Error from "./HttpClientError.ts";
import type * as HttpClientRequest from "./HttpClientRequest.ts";
import * as HttpIncomingMessage from "./HttpIncomingMessage.ts";
export { 
/**
 * @since 4.0.0
 * @category schema
 */
schemaBodyJson, 
/**
 * @since 4.0.0
 * @category schema
 */
schemaBodyUrlParams, 
/**
 * @since 4.0.0
 * @category schema
 */
schemaHeaders } from "./HttpIncomingMessage.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId = "~effect/http/HttpClientResponse";
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpClientResponse extends HttpIncomingMessage.HttpIncomingMessage<Error.HttpClientError>, Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly request: HttpClientRequest.HttpClientRequest;
    readonly status: number;
    readonly cookies: Cookies.Cookies;
    readonly formData: Effect.Effect<FormData, Error.HttpClientError>;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromWeb: (request: HttpClientRequest.HttpClientRequest, source: Response) => HttpClientResponse;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaJson: <A, I extends {
    readonly status?: number | undefined;
    readonly headers?: Readonly<Record<string, string | undefined>> | undefined;
    readonly body?: unknown;
}, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => (self: HttpClientResponse) => Effect.Effect<A, Schema.SchemaError | Error.HttpClientError, RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaNoBody: <A, I extends {
    readonly status?: number | undefined;
    readonly headers?: Readonly<Record<string, string>> | undefined;
}, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => (self: HttpClientResponse) => Effect.Effect<A, Schema.SchemaError, RD>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const stream: <E, R>(effect: Effect.Effect<HttpClientResponse, E, R>) => Stream.Stream<Uint8Array, Error.HttpClientError | E, R>;
/**
 * @since 4.0.0
 * @category pattern matching
 */
export declare const matchStatus: {
    /**
     * @since 4.0.0
     * @category pattern matching
     */
    <const Cases extends {
        readonly [status: number]: (_: HttpClientResponse) => any;
        readonly "2xx"?: (_: HttpClientResponse) => any;
        readonly "3xx"?: (_: HttpClientResponse) => any;
        readonly "4xx"?: (_: HttpClientResponse) => any;
        readonly "5xx"?: (_: HttpClientResponse) => any;
        readonly orElse: (_: HttpClientResponse) => any;
    }>(cases: Cases): (self: HttpClientResponse) => Cases[keyof Cases] extends (_: any) => infer R ? Unify<R> : never;
    /**
     * @since 4.0.0
     * @category pattern matching
     */
    <const Cases extends {
        readonly [status: number]: (_: HttpClientResponse) => any;
        readonly "2xx"?: (_: HttpClientResponse) => any;
        readonly "3xx"?: (_: HttpClientResponse) => any;
        readonly "4xx"?: (_: HttpClientResponse) => any;
        readonly "5xx"?: (_: HttpClientResponse) => any;
        readonly orElse: (_: HttpClientResponse) => any;
    }>(self: HttpClientResponse, cases: Cases): Cases[keyof Cases] extends (_: any) => infer R ? Unify<R> : never;
};
/**
 * @since 4.0.0
 * @category filters
 */
export declare const filterStatus: {
    /**
     * @since 4.0.0
     * @category filters
     */
    (f: (status: number) => boolean): (self: HttpClientResponse) => Effect.Effect<HttpClientResponse, Error.HttpClientError>;
    /**
     * @since 4.0.0
     * @category filters
     */
    (self: HttpClientResponse, f: (status: number) => boolean): Effect.Effect<HttpClientResponse, Error.HttpClientError>;
};
/**
 * @since 4.0.0
 * @category filters
 */
export declare const filterStatusOk: (self: HttpClientResponse) => Effect.Effect<HttpClientResponse, Error.HttpClientError>;
//# sourceMappingURL=HttpClientResponse.d.ts.map