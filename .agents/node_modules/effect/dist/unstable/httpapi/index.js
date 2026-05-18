/**
 * @since 4.0.0
 */
// @barrel: Auto-generated exports. Do not edit manually.
/**
 * @since 4.0.0
 */
export * as HttpApi from "./HttpApi.js";
/**
 * @since 4.0.0
 */
export * as HttpApiBuilder from "./HttpApiBuilder.js";
/**
 * @since 4.0.0
 */
export * as HttpApiClient from "./HttpApiClient.js";
/**
 * @since 4.0.0
 */
export * as HttpApiEndpoint from "./HttpApiEndpoint.js";
/**
 * @since 4.0.0
 */
export * as HttpApiError from "./HttpApiError.js";
/**
 * @since 4.0.0
 */
export * as HttpApiGroup from "./HttpApiGroup.js";
/**
 * @since 4.0.0
 */
export * as HttpApiMiddleware from "./HttpApiMiddleware.js";
/**
 * @since 4.0.0
 */
export * as HttpApiScalar from "./HttpApiScalar.js";
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
export * as HttpApiSchema from "./HttpApiSchema.js";
/**
 * @since 4.0.0
 */
export * as HttpApiSecurity from "./HttpApiSecurity.js";
/**
 * @since 4.0.0
 */
export * as HttpApiSwagger from "./HttpApiSwagger.js";
/**
 * @since 4.0.0
 */
export * as OpenApi from "./OpenApi.js";
//# sourceMappingURL=index.js.map