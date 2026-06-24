/**
 * The `AiError` module provides comprehensive, provider-agnostic error handling
 * for AI operations.
 *
 * This module uses the `reason` pattern where `AiError` is a top-level
 * wrapper error containing `module`, `method`, and a `reason` field that holds
 * the semantic error. This design enables ergonomic error handling while
 * preserving rich context about failures.
 *
 * ## Semantic Error Categories
 *
 * - **RateLimitError** - Request throttled (429s, provider-specific limits)
 * - **QuotaExhaustedError** - Account/billing limits reached
 * - **AuthenticationError** - Invalid/expired credentials
 * - **ContentPolicyError** - Input/output violated content policy
 * - **InvalidRequestError** - Malformed request parameters
 * - **InvalidUserInputError** - Prompt contains unsupported content
 * - **InternalProviderError** - Provider-side failures (5xx)
 * - **NetworkError** - Transport-level failures
 * - **InvalidOutputError** - LLM output parsing/validation failures
 * - **StructuredOutputError** - LLM generated text that doesn't conform to structured output schema
 * - **UnsupportedSchemaError** - Codec transformer rejected a schema with unsupported constructs
 * - **UnknownError** - Catch-all for unknown errors
 *
 * ## Tool Call Errors
 *
 * - **ToolNotFoundError** - Model requested non-existent tool
 * - **ToolParameterValidationError** - Tool call params failed validation
 * - **InvalidToolResultError** - Tool handler returned invalid result
 * - **ToolResultEncodingError** - Tool result encoding failed
 * - **ToolConfigurationError** - Provider tool misconfigured
 *
 * ## Retryability
 *
 * Each reason type has an `isRetryable` getter indicating whether the error is
 * transient. Some errors also provide a `retryAfter` duration hint.
 *
 * @example
 * ```ts
 * import { Effect, Match } from "effect"
 * import type { AiError } from "effect/unstable/ai"
 *
 * // Handle errors using Match on the reason
 * const handleAiError = Match.type<AiError.AiError>().pipe(
 *   Match.when(
 *     { reason: { _tag: "RateLimitError" } },
 *     (err) => Effect.logWarning(`Rate limited, retry after ${err.retryAfter}`)
 *   ),
 *   Match.when(
 *     { reason: { _tag: "AuthenticationError" } },
 *     (err) => Effect.logError(`Auth failed: ${err.reason.kind}`)
 *   ),
 *   Match.when(
 *     { reason: { isRetryable: true } },
 *     (err) => Effect.logWarning(`Transient error, retrying: ${err.message}`)
 *   ),
 *   Match.orElse((err) => Effect.logError(`Permanent error: ${err.message}`))
 * )
 * ```
 *
 * @example
 * ```ts
 * import { Duration, Effect } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * // Create an AiError with a reason
 * const error = AiError.make({
 *   module: "OpenAI",
 *   method: "completion",
 *   reason: new AiError.RateLimitError({
 *     retryAfter: Duration.seconds(60)
 *   })
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message) // "OpenAI.completion: Rate limit exceeded. Retry after 1 minute"
 * ```
 *
 * @since 1.0.0
 */
import * as Duration from "../../Duration.ts";
import * as Schema from "../../Schema.ts";
import type * as HttpClientError from "../http/HttpClientError.ts";
declare const ReasonTypeId: "~effect/unstable/ai/AiError/Reason";
declare const NetworkError_base: Schema.Class<NetworkError, Schema.Struct<{
    readonly _tag: Schema.tag<"NetworkError">;
    readonly reason: Schema.Literals<readonly ["TransportError", "EncodeError", "InvalidUrlError"]>;
    readonly request: Schema.Struct<{
        readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
        readonly url: Schema.String;
        readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
        readonly hash: Schema.UndefinedOr<Schema.String>;
        readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
    }>;
    readonly description: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating a network-level failure before receiving a response.
 *
 * This error is raised when issues arise before receiving an HTTP response,
 * such as network connectivity problems, request encoding issues, or invalid
 * URLs.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.NetworkError({
 *   reason: "TransportError",
 *   request: {
 *     method: "POST",
 *     url: "https://api.openai.com/v1/completions",
 *     urlParams: [],
 *     hash: undefined,
 *     headers: { "Content-Type": "application/json" }
 *   },
 *   description: "Connection timeout after 30 seconds"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Transport: Connection timeout after 30 seconds (POST https://api.openai.com/v1/completions)"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class NetworkError extends NetworkError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Transport errors are retryable; encoding and URL errors are not.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    /**
     * Creates a NetworkError from a platform HttpClientError.RequestError.
     *
     * @example
     * ```ts
     * import { AiError } from "effect/unstable/ai"
     * import type { HttpClientError } from "effect/unstable/http"
     *
     * declare const platformError: HttpClientError.RequestError
     *
     * const aiError = AiError.NetworkError.fromRequestError(platformError)
     * ```
     *
     * @since 1.0.0
     * @category constructors
     */
    static fromRequestError(error: HttpClientError.RequestError): NetworkError;
    get message(): string;
}
/**
 * Schema for provider-specific metadata which can be attached to error reasons.
 *
 * Provider-specific metadata is namespaced by provider and has the structure:
 *
 * ```
 * {
 *   "<provider-name>": {
 *     // Provider-specific metadata (e.g. errorCode, requestId, etc.)
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export declare const ProviderMetadata: Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson>>>;
/**
 * @since 1.0.0
 * @category models
 */
export type ProviderMetadata = typeof ProviderMetadata.Type;
/**
 * Provider-specific metadata attached to `RateLimitError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface RateLimitErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `QuotaExhaustedError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface QuotaExhaustedErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `AuthenticationError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface AuthenticationErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `ContentPolicyError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface ContentPolicyErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `InvalidRequestError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface InvalidRequestErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `InternalProviderError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface InternalProviderErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `InvalidOutputError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface InvalidOutputErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `StructuredOutputError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface StructuredOutputErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `UnsupportedSchemaError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface UnsupportedSchemaErrorMetadata extends ProviderMetadata {
}
/**
 * Provider-specific metadata attached to `UnknownError`.
 *
 * @since 1.0.0
 * @category provider options
 */
export interface UnknownErrorMetadata extends ProviderMetadata {
}
/**
 * Token usage information from AI operations.
 *
 * @since 1.0.0
 * @category schemas
 */
export declare const UsageInfo: Schema.Struct<{
    readonly promptTokens: Schema.optional<Schema.Number>;
    readonly completionTokens: Schema.optional<Schema.Number>;
    readonly totalTokens: Schema.optional<Schema.Number>;
}>;
/**
 * Combined HTTP context for error reporting.
 *
 * @since 1.0.0
 * @category schemas
 */
export declare const HttpContext: Schema.Struct<{
    readonly request: Schema.Struct<{
        readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
        readonly url: Schema.String;
        readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
        readonly hash: Schema.UndefinedOr<Schema.String>;
        readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
    }>;
    readonly response: Schema.optional<Schema.Struct<{
        readonly status: Schema.Number;
        readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
    }>>;
    readonly body: Schema.optional<Schema.String>;
}>;
declare const RateLimitError_base: Schema.Class<RateLimitError, Schema.Struct<{
    readonly _tag: Schema.tag<"RateLimitError">;
    readonly retryAfter: Schema.optional<Schema.Duration>;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<RateLimitErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the request was rate limited.
 *
 * Rate limit errors are always retryable. When `retryAfter` is provided,
 * callers should wait that duration before retrying.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * const rateLimitError = new AiError.RateLimitError({
 *   retryAfter: Duration.seconds(60)
 * })
 *
 * console.log(rateLimitError.isRetryable) // true
 * console.log(rateLimitError.message) // "Rate limit exceeded. Retry after 1 minute"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class RateLimitError extends RateLimitError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Rate limit errors are always retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const QuotaExhaustedError_base: Schema.Class<QuotaExhaustedError, Schema.Struct<{
    readonly _tag: Schema.tag<"QuotaExhaustedError">;
    readonly resetAt: Schema.optional<Schema.DateTimeUtc>;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<QuotaExhaustedErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating account or billing limits have been reached.
 *
 * Quota exhausted errors are not retryable without user action.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const quotaError = new AiError.QuotaExhaustedError({})
 *
 * console.log(quotaError.isRetryable) // false
 * console.log(quotaError.message)
 * // "Quota exhausted. Check your account billing and usage limits."
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class QuotaExhaustedError extends QuotaExhaustedError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Quota exhausted errors require user action and are not retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const AuthenticationError_base: Schema.Class<AuthenticationError, Schema.Struct<{
    readonly _tag: Schema.tag<"AuthenticationError">;
    readonly kind: Schema.Literals<readonly ["InvalidKey", "ExpiredKey", "MissingKey", "InsufficientPermissions", "Unknown"]>;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<AuthenticationErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating authentication or authorization failure.
 *
 * Authentication errors are never retryable without credential changes.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const authError = new AiError.AuthenticationError({
 *   kind: "InvalidKey"
 * })
 *
 * console.log(authError.isRetryable) // false
 * console.log(authError.message)
 * // "InvalidKey: Verify your API key is correct"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class AuthenticationError extends AuthenticationError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Authentication errors require credential changes and are not retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ContentPolicyError_base: Schema.Class<ContentPolicyError, Schema.Struct<{
    readonly _tag: Schema.tag<"ContentPolicyError">;
    readonly description: Schema.String;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<ContentPolicyErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating content policy violation.
 *
 * Content policy errors are never retryable without content changes.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const policyError = new AiError.ContentPolicyError({
 *   description: "Input contains prohibited content"
 * })
 *
 * console.log(policyError.isRetryable) // false
 * console.log(policyError.message)
 * // "Content policy violation: Input contains prohibited content"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ContentPolicyError extends ContentPolicyError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Content policy errors require content changes and are not retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const InvalidRequestError_base: Schema.Class<InvalidRequestError, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidRequestError">;
    readonly parameter: Schema.optional<Schema.String>;
    readonly constraint: Schema.optional<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<InvalidRequestErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the request had invalid or malformed parameters.
 *
 * Invalid request errors require fixing the request and are not retryable.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const invalidRequestError = new AiError.InvalidRequestError({
 *   parameter: "temperature",
 *   constraint: "must be between 0 and 2",
 *   description: "Temperature value 5 is out of range"
 * })
 *
 * console.log(invalidRequestError.isRetryable) // false
 * console.log(invalidRequestError.message)
 * // "Invalid request: parameter 'temperature' must be between 0 and 2. Temperature value 5 is out of range"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class InvalidRequestError extends InvalidRequestError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Invalid request errors require fixing the request and are not retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const InternalProviderError_base: Schema.Class<InternalProviderError, Schema.Struct<{
    readonly _tag: Schema.tag<"InternalProviderError">;
    readonly description: Schema.String;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<InternalProviderErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the AI provider experienced an internal error.
 *
 * Internal provider errors are typically transient and are retryable.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const providerError = new AiError.InternalProviderError({
 *   description: "Server encountered an unexpected error"
 * })
 *
 * console.log(providerError.isRetryable) // true
 * console.log(providerError.message)
 * // "Internal provider error: Server encountered an unexpected error"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class InternalProviderError extends InternalProviderError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Internal provider errors are typically transient and are retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const InvalidOutputError_base: Schema.Class<InvalidOutputError, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidOutputError">;
    readonly description: Schema.String;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<InvalidOutputErrorMetadata>>>;
    readonly usage: Schema.optional<Schema.Struct<{
        readonly promptTokens: Schema.optional<Schema.Number>;
        readonly completionTokens: Schema.optional<Schema.Number>;
        readonly totalTokens: Schema.optional<Schema.Number>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating failure to parse or validate LLM output.
 *
 * Invalid output errors are retryable since LLM outputs are non-deterministic.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const parseError = new AiError.InvalidOutputError({
 *   description: "Expected a string but received a number"
 * })
 *
 * console.log(parseError.isRetryable) // true
 * console.log(parseError.message)
 * // "Invalid output: Expected a string but received a number"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class InvalidOutputError extends InvalidOutputError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Invalid output errors are retryable since LLM outputs are non-deterministic.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    /**
     * Creates an InvalidOutputError from a Schema error.
     *
     * @example
     * ```ts
     * import { Schema } from "effect"
     * import { AiError } from "effect/unstable/ai"
     *
     * declare const schemaError: Schema.SchemaError
     *
     * const parseError = AiError.InvalidOutputError.fromSchemaError(schemaError)
     * ```
     *
     * @since 1.0.0
     * @category constructors
     */
    static fromSchemaError(error: Schema.SchemaError): InvalidOutputError;
    get message(): string;
}
declare const StructuredOutputError_base: Schema.Class<StructuredOutputError, Schema.Struct<{
    readonly _tag: Schema.tag<"StructuredOutputError">;
    readonly description: Schema.String;
    readonly responseText: Schema.String;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<StructuredOutputErrorMetadata>>>;
    readonly usage: Schema.optional<Schema.Struct<{
        readonly promptTokens: Schema.optional<Schema.Number>;
        readonly completionTokens: Schema.optional<Schema.Number>;
        readonly totalTokens: Schema.optional<Schema.Number>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the LLM generated text that does not conform to the
 * requested structured output schema.
 *
 * Structured output errors are retryable since LLM outputs are non-deterministic.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.StructuredOutputError({
 *   description: "Expected a valid JSON object",
 *   responseText: "{\"foo\":}"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Structured output validation failed: Expected a valid JSON object"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class StructuredOutputError extends StructuredOutputError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Structured output errors are retryable since LLM outputs are non-deterministic.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    /**
     * Creates a StructuredOutputError from a Schema error.
     *
     * @example
     * ```ts
     * import { Schema } from "effect"
     * import { AiError } from "effect/unstable/ai"
     *
     * declare const schemaError: Schema.SchemaError
     * declare const rawText: string
     *
     * const parseError = AiError.StructuredOutputError.fromSchemaError(schemaError, rawText)
     * ```
     *
     * @since 1.0.0
     * @category constructors
     */
    static fromSchemaError(error: Schema.SchemaError, responseText: string): StructuredOutputError;
    get message(): string;
}
declare const UnsupportedSchemaError_base: Schema.Class<UnsupportedSchemaError, Schema.Struct<{
    readonly _tag: Schema.tag<"UnsupportedSchemaError">;
    readonly description: Schema.String;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<UnsupportedSchemaErrorMetadata>>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating a codec transformer rejected a schema because it contains
 * unsupported constructs.
 *
 * Unsupported schema errors are not retryable because they indicate a
 * programmer error where the schema is incompatible with the provider.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.UnsupportedSchemaError({
 *   description: "Unions are not supported in Anthropic structured output"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Unsupported schema: Unions are not supported in Anthropic structured output"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class UnsupportedSchemaError extends UnsupportedSchemaError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Unsupported schema errors are not retryable because they indicate a programmer error.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const UnknownError_base: Schema.Class<UnknownError, Schema.Struct<{
    readonly _tag: Schema.tag<"UnknownError">;
    readonly description: Schema.optional<Schema.String>;
    readonly metadata: Schema.withDecodingDefault<Schema.withConstructorDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.MutableJson, Schema.MutableJson, never, never>>> & Schema.Schema<UnknownErrorMetadata>>>;
    readonly http: Schema.optional<Schema.Struct<{
        readonly request: Schema.Struct<{
            readonly method: Schema.Literals<readonly ["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]>;
            readonly url: Schema.String;
            readonly urlParams: Schema.$Array<Schema.Tuple<readonly [Schema.String, Schema.String]>>;
            readonly hash: Schema.UndefinedOr<Schema.String>;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>;
        readonly response: Schema.optional<Schema.Struct<{
            readonly status: Schema.Number;
            readonly headers: Schema.$Record<Schema.String, Schema.Union<readonly [Schema.String, Schema.Redacted<Schema.String>]>>;
        }>>;
        readonly body: Schema.optional<Schema.String>;
    }>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Catch-all error for unknown or unexpected errors.
 *
 * Unknown errors are not retryable by default since the cause is unknown.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const unknownError = new AiError.UnknownError({
 *   description: "An unexpected error occurred"
 * })
 *
 * console.log(unknownError.isRetryable) // false
 * console.log(unknownError.message)
 * // "An unexpected error occurred"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class UnknownError extends UnknownError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Unknown errors are not retryable by default.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ToolNotFoundError_base: Schema.Class<ToolNotFoundError, Schema.Struct<{
    readonly _tag: Schema.tag<"ToolNotFoundError">;
    readonly toolName: Schema.String;
    readonly availableTools: Schema.$Array<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the model requested a tool that doesn't exist in the toolkit.
 *
 * This error is retryable because the model may self-correct when provided
 * with the list of available tools.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolNotFoundError({
 *   toolName: "unknownTool",
 *   availableTools: ["GetWeather", "GetTime"]
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Tool 'unknownTool' not found. Available tools: GetWeather, GetTime"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ToolNotFoundError extends ToolNotFoundError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Tool not found errors are retryable because the model may self-correct.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ToolParameterValidationError_base: Schema.Class<ToolParameterValidationError, Schema.Struct<{
    readonly _tag: Schema.tag<"ToolParameterValidationError">;
    readonly toolName: Schema.String;
    readonly toolParams: Schema.Codec<Schema.Json, Schema.Json, never, never>;
    readonly description: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the model's tool call parameters failed schema validation.
 *
 * This error is retryable because the model may correct its parameters
 * on subsequent attempts.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolParameterValidationError({
 *   toolName: "GetWeather",
 *   toolParams: { location: 123 },
 *   description: "Expected string, got number"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Invalid parameters for tool 'GetWeather': Expected string, got number"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ToolParameterValidationError extends ToolParameterValidationError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Parameter validation errors are retryable because the model may correct parameters.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const InvalidToolResultError_base: Schema.Class<InvalidToolResultError, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidToolResultError">;
    readonly toolName: Schema.String;
    readonly description: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the tool handler returned an invalid result that does not
 * match the tool's schema.
 *
 * This error is not retryable because invalid results indicate a bug in the
 * tool handler implementation.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.InvalidToolResultError({
 *   toolName: "GetWeather",
 *   description: "Tool handler returned invalid result: missing 'temperature' field"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Tool 'GetWeather' returned invalid result: missing 'temperature' field"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class InvalidToolResultError extends InvalidToolResultError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Invalid tool result errors are not retryable because they indicate a bug in the handler.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ToolResultEncodingError_base: Schema.Class<ToolResultEncodingError, Schema.Struct<{
    readonly _tag: Schema.tag<"ToolResultEncodingError">;
    readonly toolName: Schema.String;
    readonly toolResult: Schema.Unknown;
    readonly description: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the tool result cannot be encoded for sending back to the model.
 *
 * This error is not retryable because encoding failures indicate a bug in the
 * tool schema definitions.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolResultEncodingError({
 *   toolName: "GetWeather",
 *   toolResult: { circular: "ref" },
 *   description: "Cannot encode circular reference"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Failed to encode result for tool 'GetWeather': Cannot encode circular reference"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ToolResultEncodingError extends ToolResultEncodingError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Encoding errors are not retryable because they indicate a code bug.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ToolConfigurationError_base: Schema.Class<ToolConfigurationError, Schema.Struct<{
    readonly _tag: Schema.tag<"ToolConfigurationError">;
    readonly toolName: Schema.String;
    readonly description: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating a provider-defined tool was configured with invalid arguments.
 *
 * This error is not retryable because it indicates a programming error in the
 * tool configuration that must be fixed in code.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolConfigurationError({
 *   toolName: "OpenAiCodeInterpreter",
 *   description: "Invalid container ID format"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Invalid configuration for tool 'OpenAiCodeInterpreter': Invalid container ID format"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ToolConfigurationError extends ToolConfigurationError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Configuration errors are not retryable because they indicate a code bug.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const ToolkitRequiredError_base: Schema.Class<ToolkitRequiredError, Schema.Struct<{
    readonly _tag: Schema.tag<"ToolkitRequiredError">;
    readonly pendingApprovals: Schema.$Array<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating an operation requires a toolkit but none was provided.
 *
 * This error occurs when tool approval responses are present in the prompt
 * but no toolkit was provided to resolve them.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolkitRequiredError({
 *   pendingApprovals: ["GetWeather", "SendEmail"]
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Toolkit required to resolve pending tool approvals: GetWeather, SendEmail"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class ToolkitRequiredError extends ToolkitRequiredError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Toolkit required errors are not retryable without providing a toolkit.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
declare const InvalidUserInputError_base: Schema.Class<InvalidUserInputError, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidUserInputError">;
    readonly description: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error indicating the user provided invalid input in their prompt.
 *
 * This error is raised when the prompt contains content that is structurally
 * valid but not supported by the provider (e.g., unsupported media types,
 * unsupported file formats, etc.).
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.InvalidUserInputError({
 *   description: "Unsupported media type 'video/mp4'. Supported types: image/*, application/pdf, text/plain"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Invalid user input: Unsupported media type 'video/mp4'. Supported types: image/*, application/pdf, text/plain"
 * ```
 *
 * @since 1.0.0
 * @category reason
 */
export declare class InvalidUserInputError extends InvalidUserInputError_base {
    /**
     * @since 1.0.0
     */
    readonly [ReasonTypeId]: "~effect/unstable/ai/AiError/Reason";
    /**
     * Invalid user input errors require fixing the input and are not retryable.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    get message(): string;
}
/**
 * Union type of all semantic error reasons that can occur during AI operations.
 *
 * Each reason type provides:
 * - Semantic categorization of the failure mode
 * - `isRetryable` getter indicating if the error is transient
 * - Optional `retryAfter` duration for rate limit/throttling errors
 * - Rich context including provider metadata and HTTP details
 *
 * @since 1.0.0
 * @category models
 */
export type AiErrorReason = RateLimitError | QuotaExhaustedError | AuthenticationError | ContentPolicyError | InvalidRequestError | InternalProviderError | NetworkError | InvalidOutputError | StructuredOutputError | UnsupportedSchemaError | UnknownError | ToolNotFoundError | ToolParameterValidationError | InvalidToolResultError | ToolResultEncodingError | ToolConfigurationError | ToolkitRequiredError | InvalidUserInputError;
/**
 * Schema for validating and parsing AI error reasons.
 *
 * @since 1.0.0
 * @category schemas
 */
export declare const AiErrorReason: Schema.Union<[
    typeof RateLimitError,
    typeof QuotaExhaustedError,
    typeof AuthenticationError,
    typeof ContentPolicyError,
    typeof InvalidRequestError,
    typeof InternalProviderError,
    typeof NetworkError,
    typeof InvalidOutputError,
    typeof StructuredOutputError,
    typeof UnsupportedSchemaError,
    typeof UnknownError,
    typeof ToolNotFoundError,
    typeof ToolParameterValidationError,
    typeof InvalidToolResultError,
    typeof ToolResultEncodingError,
    typeof ToolConfigurationError,
    typeof ToolkitRequiredError,
    typeof InvalidUserInputError
]>;
declare const TypeId: "~effect/unstable/ai/AiError/AiError";
declare const AiError_base: Schema.Class<AiError, Schema.Struct<{
    readonly _tag: Schema.tag<"AiError">;
    readonly module: Schema.String;
    readonly method: Schema.String;
    readonly reason: Schema.Union<[typeof RateLimitError, typeof QuotaExhaustedError, typeof AuthenticationError, typeof ContentPolicyError, typeof InvalidRequestError, typeof InternalProviderError, typeof NetworkError, typeof InvalidOutputError, typeof StructuredOutputError, typeof UnsupportedSchemaError, typeof UnknownError, typeof ToolNotFoundError, typeof ToolParameterValidationError, typeof InvalidToolResultError, typeof ToolResultEncodingError, typeof ToolConfigurationError, typeof ToolkitRequiredError, typeof InvalidUserInputError]>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Top-level AI error wrapper using the `reason` pattern.
 *
 * This error wraps semantic error reasons and provides:
 * - `module` and `method` context for where the error occurred
 * - `reason` field containing the semantic error type
 * - Delegated `isRetryable` and `retryAfter` to the underlying reason
 *
 * Use with `Effect.catchReason` for ergonomic error handling:
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * declare const aiOperation: Effect.Effect<string, AiError.AiError>
 *
 * // Handle specific reason types
 * const handled = aiOperation.pipe(
 *   Effect.catchTag("AiError", (error) => {
 *     if (error.reason._tag === "RateLimitError") {
 *       return Effect.succeed(`Retry after ${error.retryAfter}`)
 *     }
 *     return Effect.fail(error)
 *   })
 * )
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export declare class AiError extends AiError_base {
    readonly [TypeId]: "~effect/unstable/ai/AiError/AiError";
    readonly cause: RateLimitError | QuotaExhaustedError | AuthenticationError | ContentPolicyError | InvalidRequestError | InternalProviderError | NetworkError | InvalidOutputError | StructuredOutputError | UnsupportedSchemaError | UnknownError | ToolNotFoundError | ToolParameterValidationError | InvalidToolResultError | ToolResultEncodingError | ToolConfigurationError | ToolkitRequiredError | InvalidUserInputError;
    /**
     * Delegates to the underlying reason's `isRetryable` getter.
     *
     * @since 1.0.0
     */
    get isRetryable(): boolean;
    /**
     * Delegates to the underlying reason's `retryAfter` if present.
     *
     * @since 1.0.0
     */
    get retryAfter(): Duration.Duration | undefined;
    get message(): string;
}
/**
 * The encoded (serialized) form of an `AiError`.
 *
 * @since 1.0.0
 * @category schemas
 */
export type AiErrorEncoded = typeof AiError["Encoded"];
/**
 * Type guard to check if a value is an `AiError`.
 *
 * @param u - The value to check
 * @returns `true` if the value is an `AiError`, `false` otherwise
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const someError = new Error("generic error")
 * const aiError = AiError.make({
 *   module: "Test",
 *   method: "example",
 *   reason: new AiError.RateLimitError({})
 * })
 *
 * console.log(AiError.isAiError(someError)) // false
 * console.log(AiError.isAiError(aiError)) // true
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export declare const isAiError: (u: unknown) => u is AiError;
/**
 * Type guard to check if a value is an `AiErrorReason`.
 *
 * @param u - The value to check
 * @returns `true` if the value is an `AiErrorReason`, `false` otherwise
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const rateLimitError = new AiError.RateLimitError({})
 * const genericError = new Error("generic error")
 *
 * console.log(AiError.isAiErrorReason(rateLimitError)) // true
 * console.log(AiError.isAiErrorReason(genericError)) // false
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export declare const isAiErrorReason: (u: unknown) => u is AiErrorReason;
/**
 * Creates an `AiError` with the given reason.
 *
 * @example
 * ```ts
 * import { Duration } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = AiError.make({
 *   module: "OpenAI",
 *   method: "completion",
 *   reason: new AiError.RateLimitError({
 *     retryAfter: Duration.seconds(60)
 *   })
 * })
 *
 * console.log(error.message)
 * // "OpenAI.completion: Rate limit exceeded. Retry after 1 minute"
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const make: (params: {
    readonly module: string;
    readonly method: string;
    readonly reason: AiErrorReason;
}) => AiError;
/**
 * Maps HTTP status codes to semantic error reasons.
 *
 * Provider packages can use this as a base for provider-specific mapping.
 *
 * @example
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const reason = AiError.reasonFromHttpStatus({
 *   status: 429,
 *   body: { error: "Rate limit exceeded" }
 * })
 *
 * console.log(reason._tag) // "RateLimitError"
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const reasonFromHttpStatus: (params: {
    readonly status: number;
    readonly body?: unknown;
    readonly http?: typeof HttpContext.Type;
    readonly metadata?: typeof ProviderMetadata.Type;
    readonly description?: string | undefined;
}) => AiErrorReason;
export {};
//# sourceMappingURL=AiError.d.ts.map