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
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import { redact } from "../../Redactable.js";
import * as Redacted from "../../Redacted.js";
import * as Schema from "../../Schema.js";
import { HttpRequestDetails, HttpResponseDetails } from "./Response.js";
const ReasonTypeId = "~effect/unstable/ai/AiError/Reason";
const providerMetadataWithDefaults = () => ProviderMetadata.pipe(Schema.withConstructorDefault(Effect.succeed({})), Schema.withDecodingDefault(Effect.succeed({})));
const redactHeaders = headers => {
  const redacted = redact(headers);
  const result = {};
  for (const key in redacted) {
    const value = redacted[key];
    result[key] = Redacted.isRedacted(value) ? value.toString() : value;
  }
  return result;
};
// =============================================================================
// Http Request Error
// =============================================================================
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
export class NetworkError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/NetworkError")({
  _tag: /*#__PURE__*/Schema.tag("NetworkError"),
  reason: /*#__PURE__*/Schema.Literals(["TransportError", "EncodeError", "InvalidUrlError"]),
  request: HttpRequestDetails,
  description: /*#__PURE__*/Schema.optional(Schema.String)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Transport errors are retryable; encoding and URL errors are not.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return this.reason === "TransportError";
  }
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
  static fromRequestError(error) {
    return new NetworkError({
      description: error.description,
      reason: error._tag,
      request: {
        hash: Option.getOrUndefined(error.request.hash),
        headers: redactHeaders(error.request.headers),
        method: error.request.method,
        url: error.request.url,
        urlParams: Array.from(error.request.urlParams)
      }
    });
  }
  get message() {
    const methodAndUrl = `${this.request.method} ${this.request.url}`;
    let baseMessage = this.description ? `${this.reason}: ${this.description}` : `${this.reason}: A network error occurred.`;
    baseMessage += ` (${methodAndUrl})`;
    let suggestion = "";
    switch (this.reason) {
      case "EncodeError":
        {
          suggestion += "Check that the request body data is properly formatted and matches the expected content type.";
          break;
        }
      case "InvalidUrlError":
        {
          suggestion += "Verify that the URL format is correct and that all required parameters have been provided.";
          suggestion += " Check for any special characters that may need encoding.";
          break;
        }
      case "TransportError":
        {
          suggestion += "Check your network connection and verify that the requested URL is accessible.";
          break;
        }
    }
    baseMessage += `\n\n${suggestion}`;
    return baseMessage;
  }
}
// =============================================================================
// Http Response Error
// =============================================================================
// =============================================================================
// Supporting Schemas
// =============================================================================
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
export const ProviderMetadata = /*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.NullOr(Schema.MutableJson));
/**
 * Token usage information from AI operations.
 *
 * @since 1.0.0
 * @category schemas
 */
export const UsageInfo = /*#__PURE__*/Schema.Struct({
  promptTokens: Schema.optional(Schema.Number),
  completionTokens: Schema.optional(Schema.Number),
  totalTokens: Schema.optional(Schema.Number)
}).annotate({
  identifier: "UsageInfo"
});
/**
 * Combined HTTP context for error reporting.
 *
 * @since 1.0.0
 * @category schemas
 */
export const HttpContext = /*#__PURE__*/Schema.Struct({
  request: HttpRequestDetails,
  response: Schema.optional(HttpResponseDetails),
  body: Schema.optional(Schema.String)
}).annotate({
  identifier: "HttpContext"
});
// =============================================================================
// Reason Classes
// =============================================================================
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
export class RateLimitError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/RateLimitError")({
  _tag: /*#__PURE__*/Schema.tag("RateLimitError"),
  retryAfter: /*#__PURE__*/Schema.optional(Schema.Duration),
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Rate limit errors are always retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
  get message() {
    let msg = "Rate limit exceeded";
    if (this.retryAfter) msg += `. Retry after ${Duration.format(this.retryAfter)}`;
    return msg;
  }
}
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
export class QuotaExhaustedError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/QuotaExhaustedError")({
  _tag: /*#__PURE__*/Schema.tag("QuotaExhaustedError"),
  resetAt: /*#__PURE__*/Schema.optional(Schema.DateTimeUtc),
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Quota exhausted errors require user action and are not retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    let msg = "Quota exhausted";
    if (this.resetAt) msg += `. Resets at ${this.resetAt}`;
    return `${msg}. Check your account billing and usage limits.`;
  }
}
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
export class AuthenticationError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/AuthenticationError")({
  _tag: /*#__PURE__*/Schema.tag("AuthenticationError"),
  kind: /*#__PURE__*/Schema.Literals(["InvalidKey", "ExpiredKey", "MissingKey", "InsufficientPermissions", "Unknown"]),
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Authentication errors require credential changes and are not retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    const suggestions = {
      InvalidKey: "Verify your API key is correct",
      ExpiredKey: "Your API key has expired. Generate a new one",
      MissingKey: "No API key provided. Set the appropriate environment variable",
      InsufficientPermissions: "Your API key lacks required permissions",
      Unknown: "Authentication failed. Check your credentials"
    };
    return `${this.kind}: ${suggestions[this.kind]}`;
  }
}
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
export class ContentPolicyError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ContentPolicyError")({
  _tag: /*#__PURE__*/Schema.tag("ContentPolicyError"),
  description: Schema.String,
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Content policy errors require content changes and are not retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Content policy violation: ${this.description}`;
  }
}
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
export class InvalidRequestError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/InvalidRequestError")({
  _tag: /*#__PURE__*/Schema.tag("InvalidRequestError"),
  parameter: /*#__PURE__*/Schema.optional(Schema.String),
  constraint: /*#__PURE__*/Schema.optional(Schema.String),
  description: /*#__PURE__*/Schema.optional(Schema.String),
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Invalid request errors require fixing the request and are not retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    let msg = "Invalid request";
    if (this.parameter) msg += `: parameter '${this.parameter}'`;
    if (this.constraint) msg += ` ${this.constraint}`;
    if (this.description) msg += `. ${this.description}`;
    return msg;
  }
}
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
export class InternalProviderError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/InternalProviderError")({
  _tag: /*#__PURE__*/Schema.tag("InternalProviderError"),
  description: Schema.String,
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Internal provider errors are typically transient and are retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
  get message() {
    return `Internal provider error: ${this.description}`;
  }
}
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
export class InvalidOutputError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/InvalidOutputError")({
  _tag: /*#__PURE__*/Schema.tag("InvalidOutputError"),
  description: Schema.String,
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  usage: /*#__PURE__*/Schema.optional(UsageInfo)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Invalid output errors are retryable since LLM outputs are non-deterministic.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
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
  static fromSchemaError(error) {
    return new InvalidOutputError({
      description: error.message
    });
  }
  get message() {
    return `Invalid output: ${this.description}`;
  }
}
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
export class StructuredOutputError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/StructuredOutputError")({
  _tag: /*#__PURE__*/Schema.tag("StructuredOutputError"),
  description: Schema.String,
  responseText: Schema.String,
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  usage: /*#__PURE__*/Schema.optional(UsageInfo)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Structured output errors are retryable since LLM outputs are non-deterministic.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
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
  static fromSchemaError(error, responseText) {
    return new StructuredOutputError({
      description: error.message,
      responseText
    });
  }
  get message() {
    return `Structured output validation failed: ${this.description}`;
  }
}
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
export class UnsupportedSchemaError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/UnsupportedSchemaError")({
  _tag: /*#__PURE__*/Schema.tag("UnsupportedSchemaError"),
  description: Schema.String,
  metadata: /*#__PURE__*/providerMetadataWithDefaults()
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Unsupported schema errors are not retryable because they indicate a programmer error.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Unsupported schema: ${this.description}`;
  }
}
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
export class UnknownError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/UnknownError")({
  _tag: /*#__PURE__*/Schema.tag("UnknownError"),
  description: /*#__PURE__*/Schema.optional(Schema.String),
  metadata: /*#__PURE__*/providerMetadataWithDefaults(),
  http: /*#__PURE__*/Schema.optional(HttpContext)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Unknown errors are not retryable by default.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return this.description ?? "Unknown error";
  }
}
// =============================================================================
// Tool Call Error Types
// =============================================================================
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
export class ToolNotFoundError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ToolNotFoundError")({
  _tag: /*#__PURE__*/Schema.tag("ToolNotFoundError"),
  toolName: Schema.String,
  availableTools: /*#__PURE__*/Schema.Array(Schema.String)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Tool not found errors are retryable because the model may self-correct.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
  get message() {
    const availableTools = this.availableTools.length > 0 ? this.availableTools.join(", ") : "none";
    return `Tool '${this.toolName}' not found. Available tools: ${availableTools}`;
  }
}
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
export class ToolParameterValidationError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ToolParameterValidationError")({
  _tag: /*#__PURE__*/Schema.tag("ToolParameterValidationError"),
  toolName: Schema.String,
  toolParams: Schema.Json,
  description: Schema.String
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Parameter validation errors are retryable because the model may correct parameters.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return true;
  }
  get message() {
    return `Invalid parameters for tool '${this.toolName}': ${this.description}`;
  }
}
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
export class InvalidToolResultError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/InvalidToolResultError")({
  _tag: /*#__PURE__*/Schema.tag("InvalidToolResultError"),
  toolName: Schema.String,
  description: Schema.String
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Invalid tool result errors are not retryable because they indicate a bug in the handler.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Tool '${this.toolName}' returned invalid result: ${this.description}`;
  }
}
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
export class ToolResultEncodingError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ToolResultEncodingError")({
  _tag: /*#__PURE__*/Schema.tag("ToolResultEncodingError"),
  toolName: Schema.String,
  toolResult: Schema.Unknown,
  description: Schema.String
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Encoding errors are not retryable because they indicate a code bug.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Failed to encode result for tool '${this.toolName}': ${this.description}`;
  }
}
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
export class ToolConfigurationError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ToolConfigurationError")({
  _tag: /*#__PURE__*/Schema.tag("ToolConfigurationError"),
  toolName: Schema.String,
  description: Schema.String
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Configuration errors are not retryable because they indicate a code bug.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Invalid configuration for tool '${this.toolName}': ${this.description}`;
  }
}
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
export class ToolkitRequiredError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/ToolkitRequiredError")({
  _tag: /*#__PURE__*/Schema.tag("ToolkitRequiredError"),
  pendingApprovals: /*#__PURE__*/Schema.Array(Schema.String),
  description: /*#__PURE__*/Schema.optional(Schema.String)
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Toolkit required errors are not retryable without providing a toolkit.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    const tools = this.pendingApprovals.join(", ");
    return `Toolkit required to resolve pending tool approvals: ${tools}`;
  }
}
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
export class InvalidUserInputError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/InvalidUserInputError")({
  _tag: /*#__PURE__*/Schema.tag("InvalidUserInputError"),
  description: Schema.String
}) {
  /**
   * @since 1.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * Invalid user input errors require fixing the input and are not retryable.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return false;
  }
  get message() {
    return `Invalid user input: ${this.description}`;
  }
}
/**
 * Schema for validating and parsing AI error reasons.
 *
 * @since 1.0.0
 * @category schemas
 */
export const AiErrorReason = /*#__PURE__*/Schema.Union([RateLimitError, QuotaExhaustedError, AuthenticationError, ContentPolicyError, InvalidRequestError, InternalProviderError, NetworkError, InvalidOutputError, StructuredOutputError, UnsupportedSchemaError, UnknownError, ToolNotFoundError, ToolParameterValidationError, InvalidToolResultError, ToolResultEncodingError, ToolConfigurationError, ToolkitRequiredError, InvalidUserInputError]);
// =============================================================================
// Top-Level AiError
// =============================================================================
const TypeId = "~effect/unstable/ai/AiError/AiError";
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
export class AiError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/AiError/AiError")({
  _tag: /*#__PURE__*/Schema.tag("AiError"),
  module: Schema.String,
  method: Schema.String,
  reason: AiErrorReason
}) {
  [TypeId] = TypeId;
  cause = this.reason;
  /**
   * Delegates to the underlying reason's `isRetryable` getter.
   *
   * @since 1.0.0
   */
  get isRetryable() {
    return this.reason.isRetryable;
  }
  /**
   * Delegates to the underlying reason's `retryAfter` if present.
   *
   * @since 1.0.0
   */
  get retryAfter() {
    return "retryAfter" in this.reason ? this.reason.retryAfter : undefined;
  }
  get message() {
    return `${this.module}.${this.method}: ${this.reason.message}`;
  }
}
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
export const isAiError = u => Predicate.hasProperty(u, TypeId);
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
export const isAiErrorReason = u => Predicate.hasProperty(u, ReasonTypeId);
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
export const make = params => new AiError(params);
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
export const reasonFromHttpStatus = params => {
  const {
    status,
    http,
    metadata,
    description
  } = params;
  const common = {
    http,
    ...(metadata ? {
      metadata
    } : undefined),
    ...(description ? {
      description
    } : undefined)
  };
  switch (status) {
    case 400:
      return new InvalidRequestError(common);
    case 401:
      return new AuthenticationError({
        kind: "InvalidKey",
        ...common
      });
    case 403:
      return new AuthenticationError({
        kind: "InsufficientPermissions",
        ...common
      });
    case 429:
      return new RateLimitError(common);
    default:
      if (status >= 500) {
        return new InternalProviderError({
          description: "Server error",
          ...common
        });
      }
      return new UnknownError(common);
  }
};
//# sourceMappingURL=AiError.js.map