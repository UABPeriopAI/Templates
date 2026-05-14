/**
 * HttpApiSchema provides helpers to annotate Effect Schema values with HTTP API metadata
 * (status codes and payload/response encodings) used by the HttpApi builder, client,
 * and OpenAPI generation.
 *
 * Mental model:
 * - A "Schema" is the base validation/encoding description from `Schema`.
 * - An "Encoding" tells HttpApi how to serialize/parse a payload or response body.
 * - A "Status" is metadata that chooses the HTTP response status code.
 * - "Empty" schemas represent responses with no body (204/201/202 or custom).
 * - "NoContent" schemas can still decode into a value via {@link asNoContent}.
 * - Multipart is a payload-only encoding for file-like form data.
 *
 * Common tasks:
 * - Set a response status on a schema -> {@link status}
 * - Declare an empty response -> {@link Empty}, {@link NoContent}, {@link Created}, {@link Accepted}
 * - Decode an empty response into a value -> {@link asNoContent}
 * - Force a specific encoding -> {@link asJson}, {@link asFormUrlEncoded}, {@link asText}, {@link asUint8Array}
 * - Mark multipart payloads -> {@link asMultipart}, {@link asMultipartStream}
 *
 * Gotchas:
 * - If you don't set an encoding, HttpApi assumes JSON by default.
 * - {@link asFormUrlEncoded} expects the schema's encoded type to be a record of strings.
 * - {@link asText} expects the encoded type to be `string`, and {@link asUint8Array} expects `Uint8Array`.
 * - Multipart encodings are intended for request payloads; response multipart is not supported.
 * - These helpers annotate schemas; they don't perform validation or IO by themselves.
 *
 * @since 4.0.0
 */
import { type LazyArg } from "../../Function.ts";
import * as Schema from "../../Schema.ts";
import * as AST from "../../SchemaAST.ts";
import type * as Multipart_ from "../http/Multipart.ts";
declare module "../../Schema.ts" {
    namespace Annotations {
        interface Augment {
            readonly httpApiStatus?: number | undefined;
        }
    }
}
declare const statusCodeByLiteral: {
    readonly Continue: 100;
    readonly SwitchingProtocols: 101;
    readonly Processing: 102;
    readonly EarlyHints: 103;
    readonly OK: 200;
    readonly Ok: 200;
    readonly Created: 201;
    readonly Accepted: 202;
    readonly NonAuthoritativeInformation: 203;
    readonly NoContent: 204;
    readonly ResetContent: 205;
    readonly PartialContent: 206;
    readonly MultiStatus: 207;
    readonly AlreadyReported: 208;
    readonly ImUsed: 226;
    readonly MultipleChoices: 300;
    readonly MovedPermanently: 301;
    readonly Found: 302;
    readonly SeeOther: 303;
    readonly NotModified: 304;
    readonly TemporaryRedirect: 307;
    readonly PermanentRedirect: 308;
    readonly BadRequest: 400;
    readonly Unauthorized: 401;
    readonly PaymentRequired: 402;
    readonly Forbidden: 403;
    readonly NotFound: 404;
    readonly MethodNotAllowed: 405;
    readonly NotAcceptable: 406;
    readonly ProxyAuthenticationRequired: 407;
    readonly RequestTimeout: 408;
    readonly Conflict: 409;
    readonly Gone: 410;
    readonly LengthRequired: 411;
    readonly PreconditionFailed: 412;
    readonly PayloadTooLarge: 413;
    readonly UriTooLong: 414;
    readonly UnsupportedMediaType: 415;
    readonly RangeNotSatisfiable: 416;
    readonly ExpectationFailed: 417;
    readonly ImATeapot: 418;
    readonly MisdirectedRequest: 421;
    readonly UnprocessableEntity: 422;
    readonly Locked: 423;
    readonly FailedDependency: 424;
    readonly TooEarly: 425;
    readonly UpgradeRequired: 426;
    readonly PreconditionRequired: 428;
    readonly TooManyRequests: 429;
    readonly RequestHeaderFieldsTooLarge: 431;
    readonly UnavailableForLegalReasons: 451;
    readonly InternalServerError: 500;
    readonly NotImplemented: 501;
    readonly BadGateway: 502;
    readonly ServiceUnavailable: 503;
    readonly GatewayTimeout: 504;
    readonly HttpVersionNotSupported: 505;
    readonly VariantAlsoNegotiates: 506;
    readonly InsufficientStorage: 507;
    readonly LoopDetected: 508;
    readonly NotExtended: 510;
    readonly NetworkAuthenticationRequired: 511;
};
/**
 * Common HTTP status code literals accepted by {@link status}.
 *
 * @category status
 * @since 4.0.0
 */
export type StatusLiteral = keyof typeof statusCodeByLiteral;
/**
 * A convenience function to set the HTTP status code of a schema.
 *
 * This is equivalent to calling `.annotate({ httpApiStatus: code })` on the schema.
 *
 * You can pass either a numeric status code (for example, `201`) or a common
 * literal name (for example, `"Created"`).
 *
 * @category status
 * @since 4.0.0
 */
export declare function status(code: number): <S extends Schema.Top>(self: S) => S["Rebuild"];
export declare function status(code: StatusLiteral): <S extends Schema.Top>(self: S) => S["Rebuild"];
/**
 * Creates a void schema with the given HTTP status code.
 * This is used to represent empty responses with a specific status code.
 *
 * @see {@link asEmpty} for creating a no content response that can be decoded into a meaningful value on the client side.
 *
 * @category Empty
 * @since 4.0.0
 */
export declare const Empty: (code: number) => Schema.Void;
/**
 * @since 4.0.0
 */
export interface NoContent extends Schema.Void {
}
/**
 * A void schema with the HTTP status code 204.
 * This is used to represent empty responses with the status code 204.
 *
 * @since 4.0.0
 * @category Empty
 */
export declare const NoContent: NoContent;
/**
 * @since 4.0.0
 */
export interface Created extends Schema.Void {
}
/**
 * A void schema with the HTTP status code 201.
 * This is used to represent empty responses with the status code 201.
 *
 * @category Empty
 * @since 4.0.0
 */
export declare const Created: Created;
/**
 * @since 4.0.0
 */
export interface Accepted extends Schema.Void {
}
/**
 * A void schema with the HTTP status code 202.
 * This is used to represent empty responses with the status code 202.
 *
 * @category Empty
 * @since 4.0.0
 */
export declare const Accepted: Accepted;
/**
 * @since 4.0.0
 */
export interface asNoContent<S extends Schema.Top> extends Schema.decodeTo<Schema.toType<S>, Schema.Void> {
}
/**
 * Marks a schema as a no content response.
 *
 * The `decode` function is used to decode the response body on the client side into a meaningful value.
 *
 * @see {@link NoContent} for a void schema with the status code 204.
 * @see {@link Empty} for creating a void schema with a specific status code.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asNoContent<S extends Schema.Top>(options: {
    readonly decode: LazyArg<S["Type"]>;
}): (self: S) => asNoContent<S>;
/**
 * @since 4.0.0
 */
export declare const MultipartTypeId = "~effect/httpapi/HttpApiSchema/Multipart";
/**
 * @since 4.0.0
 */
export type MultipartTypeId = typeof MultipartTypeId;
/**
 * @since 4.0.0
 */
export interface asMultipart<S extends Schema.Top> extends Schema.brand<S["Rebuild"], MultipartTypeId> {
}
/**
 * Marks a schema as a multipart payload.
 *
 * @see {@link asMultipartStream} for a multipart stream payload.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asMultipart(options?: Multipart_.withLimits.Options): <S extends Schema.Top>(self: S) => asMultipart<S>;
/**
 * @since 4.0.0
 */
export declare const MultipartStreamTypeId = "~effect/httpapi/HttpApiSchema/MultipartStream";
/**
 * @since 4.0.0
 */
export type MultipartStreamTypeId = typeof MultipartStreamTypeId;
/**
 * @since 4.0.0
 */
export interface asMultipartStream<S extends Schema.Top> extends Schema.brand<S["Rebuild"], MultipartStreamTypeId> {
}
/**
 * Marks a schema as a multipart stream payload.
 *
 * @see {@link asMultipart} for a buffered multipart payload.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asMultipartStream(options?: Multipart_.withLimits.Options): <S extends Schema.Top>(self: S) => asMultipartStream<S>;
/**
 * Marks a schema as a JSON payload / response.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asJson(options?: {
    readonly contentType?: string;
}): <S extends Schema.Top>(self: S) => S["Rebuild"];
/**
 * Marks a schema as a URL params payload / response.
 *
 * The schema encoded side must be a record of strings.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asFormUrlEncoded(options?: {
    readonly contentType?: string;
}): <S extends Schema.Top>(self: S) => S["Rebuild"];
/**
 * Marks a schema as a text payload / response.
 *
 * The schema encoded side must be a string.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asText(options?: {
    readonly contentType?: string;
}): <S extends Schema.Top & {
    readonly Encoded: string;
}>(self: S) => S["Rebuild"];
/**
 * Marks a schema as a binary payload / response.
 *
 * The schema encoded side must be a `Uint8Array`.
 *
 * @category Encoding
 * @since 4.0.0
 */
export declare function asUint8Array(options?: {
    readonly contentType?: string;
}): <S extends Schema.Top & {
    readonly Encoded: Uint8Array;
}>(self: S) => S["Rebuild"];
/**
 * @since 4.0.0
 */
export declare const isNoContent: (ast: AST.AST) => boolean;
export {};
//# sourceMappingURL=HttpApiSchema.d.ts.map