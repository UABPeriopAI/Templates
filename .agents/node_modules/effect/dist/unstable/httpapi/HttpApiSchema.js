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
import { constVoid } from "../../Function.js";
import * as Schema from "../../Schema.js";
import * as AST from "../../SchemaAST.js";
import * as Transformation from "../../SchemaTransformation.js";
import { hasBody } from "../http/HttpMethod.js";
const statusCodeByLiteral = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  OK: 200,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
export function status(code) {
  const statusCode = typeof code === "string" ? statusCodeByLiteral[code] : code;
  return self => {
    return self.annotate({
      httpApiStatus: statusCode
    });
  };
}
/**
 * Creates a void schema with the given HTTP status code.
 * This is used to represent empty responses with a specific status code.
 *
 * @see {@link asEmpty} for creating a no content response that can be decoded into a meaningful value on the client side.
 *
 * @category Empty
 * @since 4.0.0
 */
export const Empty = code => Schema.Void.pipe(status(code));
/**
 * A void schema with the HTTP status code 204.
 * This is used to represent empty responses with the status code 204.
 *
 * @since 4.0.0
 * @category Empty
 */
export const NoContent = /*#__PURE__*/Empty(204);
/**
 * A void schema with the HTTP status code 201.
 * This is used to represent empty responses with the status code 201.
 *
 * @category Empty
 * @since 4.0.0
 */
export const Created = /*#__PURE__*/Empty(201);
/**
 * A void schema with the HTTP status code 202.
 * This is used to represent empty responses with the status code 202.
 *
 * @category Empty
 * @since 4.0.0
 */
export const Accepted = /*#__PURE__*/Empty(202);
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
export function asNoContent(options) {
  return self => {
    return Schema.Void.pipe(Schema.decodeTo(Schema.toType(self), Transformation.transform({
      decode: options.decode,
      encode: constVoid
    })));
  };
}
/**
 * @since 4.0.0
 */
export const MultipartTypeId = "~effect/httpapi/HttpApiSchema/Multipart";
/**
 * Marks a schema as a multipart payload.
 *
 * @see {@link asMultipartStream} for a multipart stream payload.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asMultipart(options) {
  return self => self.pipe(Schema.brand(MultipartTypeId)).annotate({
    "~httpApiEncoding": {
      _tag: "Multipart",
      mode: "buffered",
      contentType: defaultContentType("Multipart"),
      limits: options
    }
  });
}
/**
 * @since 4.0.0
 */
export const MultipartStreamTypeId = "~effect/httpapi/HttpApiSchema/MultipartStream";
/**
 * Marks a schema as a multipart stream payload.
 *
 * @see {@link asMultipart} for a buffered multipart payload.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asMultipartStream(options) {
  return self => self.pipe(Schema.brand(MultipartStreamTypeId)).annotate({
    "~httpApiEncoding": {
      _tag: "Multipart",
      mode: "stream",
      contentType: defaultContentType("Multipart"),
      limits: options
    }
  });
}
function asNonMultipartEncoding(self, options) {
  return self.annotate({
    "~httpApiEncoding": {
      _tag: options._tag,
      contentType: options.contentType ?? defaultContentType(options._tag)
    }
  });
}
function defaultContentType(_tag) {
  switch (_tag) {
    case "Multipart":
      return "multipart/form-data";
    case "Json":
      return "application/json";
    case "FormUrlEncoded":
      return "application/x-www-form-urlencoded";
    case "Uint8Array":
      return "application/octet-stream";
    case "Text":
      return "text/plain";
  }
}
/**
 * Marks a schema as a JSON payload / response.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asJson(options) {
  return self => asNonMultipartEncoding(self, {
    _tag: "Json",
    ...options
  });
}
/**
 * Marks a schema as a URL params payload / response.
 *
 * The schema encoded side must be a record of strings.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asFormUrlEncoded(options) {
  return self => asNonMultipartEncoding(self, {
    _tag: "FormUrlEncoded",
    ...options
  });
}
/**
 * Marks a schema as a text payload / response.
 *
 * The schema encoded side must be a string.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asText(options) {
  return self => asNonMultipartEncoding(self, {
    _tag: "Text",
    ...options
  });
}
/**
 * Marks a schema as a binary payload / response.
 *
 * The schema encoded side must be a `Uint8Array`.
 *
 * @category Encoding
 * @since 4.0.0
 */
export function asUint8Array(options) {
  return self => asNonMultipartEncoding(self, {
    _tag: "Uint8Array",
    ...options
  });
}
/**
 * @since 4.0.0
 */
export const isNoContent = ast => {
  if (AST.isVoid(ast)) return true;
  const encoded = AST.toEncoded(ast);
  if (AST.isVoid(encoded)) return true;
  const target = ast.encoding?.[0].to;
  if (target === undefined) return false;
  return AST.isVoid(target);
};
const resolveHttpApiEncoding = /*#__PURE__*/AST.resolveAt("~httpApiEncoding");
const resolveHttpApiStatus = /*#__PURE__*/AST.resolveAt("httpApiStatus");
const defaultJsonEncoding = {
  _tag: "Json",
  contentType: "application/json"
};
const defaultUrlEncodedEncoding = {
  _tag: "FormUrlEncoded",
  contentType: "application/x-www-form-urlencoded"
};
function getEncoding(ast) {
  return resolveHttpApiEncoding(ast) ?? defaultJsonEncoding;
}
/** @internal */
export function getPayloadEncoding(ast, method) {
  const encoding = resolveHttpApiEncoding(ast);
  if (encoding) return encoding;
  return hasBody(method) ? defaultJsonEncoding : defaultUrlEncodedEncoding;
}
/** @internal */
export function getResponseEncoding(ast) {
  const out = getEncoding(ast);
  if (out._tag === "Multipart") {
    throw new Error("Multipart is not supported in response");
  }
  return out;
}
/** @internal */
export function getStatusSuccess(self) {
  return resolveHttpApiStatus(self) ?? 200;
}
/** @internal */
export function getStatusError(self) {
  return resolveHttpApiStatus(self) ?? 500;
}
//# sourceMappingURL=HttpApiSchema.js.map