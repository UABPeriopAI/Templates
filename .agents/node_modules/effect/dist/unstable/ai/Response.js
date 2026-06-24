import * as Effect from "../../Effect.js";
import { identity } from "../../Function.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as SchemaTransformation from "../../SchemaTransformation.js";
const PartTypeId = "~effect/ai/Content/Part";
// =============================================================================
// All Parts
// =============================================================================
/**
 * Type guard to check if a value is a Response Part.
 *
 * @since 1.0.0
 * @category guards
 */
export const isPart = u => Predicate.hasProperty(u, PartTypeId);
/**
 * Creates a Schema for all response parts based on a toolkit.
 *
 * Generates a schema that includes all possible response parts, with tool call
 * and tool result parts dynamically created based on the provided toolkit.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Response, Tool, Toolkit } from "effect/unstable/ai"
 *
 * const myToolkit = Toolkit.make(
 *   Tool.make("GetWeather", {
 *     parameters: Schema.Struct({ city: Schema.String }),
 *     success: Schema.Struct({ temperature: Schema.Number })
 *   })
 * )
 *
 * const allPartsSchema = Response.AllParts(myToolkit)
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export const AllParts = toolkit => {
  const toolCalls = [];
  const toolResults = [];
  for (const tool of Object.values(toolkit.tools)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return Schema.Union([TextPart, TextStartPart, TextDeltaPart, TextEndPart, ReasoningPart, ReasoningStartPart, ReasoningDeltaPart, ReasoningEndPart, ToolParamsStartPart, ToolParamsDeltaPart, ToolParamsEndPart, ToolApprovalRequestPart, FilePart, DocumentSourcePart, UrlSourcePart, ResponseMetadataPart, FinishPart, ErrorPart, ...toolCalls, ...toolResults]);
};
/**
 * Creates a Schema for non-streaming response parts based on a toolkit.
 *
 * @since 1.0.0
 * @category schemas
 */
export const Part = toolkit => {
  const toolCalls = [];
  const toolResults = [];
  for (const tool of Object.values(toolkit.tools)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return Schema.Union([TextPart, ReasoningPart, ToolApprovalRequestPart, FilePart, DocumentSourcePart, UrlSourcePart, ResponseMetadataPart, FinishPart, ...toolCalls, ...toolResults]);
};
/**
 * Creates a Schema for streaming response parts based on a toolkit.
 *
 * @since 1.0.0
 * @category schemas
 */
export const StreamPart = toolkit => {
  const toolCalls = [];
  const toolResults = [];
  for (const tool of Object.values(toolkit.tools)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return Schema.Union([TextStartPart, TextDeltaPart, TextEndPart, ReasoningStartPart, ReasoningDeltaPart, ReasoningEndPart, ToolParamsStartPart, ToolParamsDeltaPart, ToolParamsEndPart, ToolApprovalRequestPart, FilePart, DocumentSourcePart, UrlSourcePart, ResponseMetadataPart, FinishPart, ErrorPart, ...toolCalls, ...toolResults]);
};
// =============================================================================
// Base Part
// =============================================================================
/**
 * Schema for provider-specific metadata which can be attached to response parts.
 *
 * Provider-specific metadata is namespaced by provider and has the structure:
 *
 * ```
 * {
 *   "<provider-specific-key>": {
 *     // Provider-specific metadata
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export const ProviderMetadata = /*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.NullOr(Schema.Json));
const BasePart = /*#__PURE__*/Schema.Struct({
  [PartTypeId]: /*#__PURE__*/Schema.tag(PartTypeId).pipe(/*#__PURE__*/Schema.withDecodingDefaultKey(/*#__PURE__*/Effect.succeed(PartTypeId), {
    encodingStrategy: "omit"
  })),
  metadata: /*#__PURE__*/ProviderMetadata.pipe(/*#__PURE__*/Schema.withDecodingDefault(/*#__PURE__*/Effect.succeed({})))
});
/**
 * Creates a new response content part of the specified type.
 *
 * @example
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const textPart = Response.makePart("text", {
 *   text: "Hello, world!"
 * })
 *
 * const toolCallPart = Response.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco" },
 *   providerExecuted: false
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const makePart = (
/**
 * The type of part to create.
 */
type,
/**
 * Parameters specific to the part type being created.
 */
params) => ({
  ...params,
  [PartTypeId]: PartTypeId,
  type,
  metadata: params.metadata ?? {}
});
/**
 * Schema for validation and encoding of text parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const TextPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("text"),
  text: Schema.String
}).annotate({
  identifier: "TextPart"
});
/**
 * Schema for validation and encoding of text start parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const TextStartPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("text-start"),
  id: Schema.String
}).annotate({
  identifier: "TextStartPart"
});
/**
 * Schema for validation and encoding of text delta parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const TextDeltaPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("text-delta"),
  id: Schema.String,
  delta: Schema.String
}).annotate({
  identifier: "TextDeltaPart"
});
/**
 * Schema for validation and encoding of text end parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const TextEndPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("text-end"),
  id: Schema.String
}).annotate({
  identifier: "TextEndPart"
});
/**
 * Schema for validation and encoding of reasoning parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ReasoningPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("reasoning"),
  text: Schema.String
}).annotate({
  identifier: "ReasoningPart"
});
/**
 * Schema for validation and encoding of reasoning start parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ReasoningStartPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("reasoning-start"),
  id: Schema.String
}).annotate({
  identifier: "ReasoningStartPart"
});
/**
 * Schema for validation and encoding of reasoning delta parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ReasoningDeltaPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("reasoning-delta"),
  id: Schema.String,
  delta: Schema.String
}).annotate({
  identifier: "ReasoningDeltaPart"
});
/**
 * Schema for validation and encoding of reasoning end parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ReasoningEndPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("reasoning-end"),
  id: Schema.String
}).annotate({
  identifier: "ReasoningEndPart"
});
/**
 * Schema for validation and encoding of tool params start parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolParamsStartPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("tool-params-start"),
  id: Schema.String,
  name: Schema.String,
  providerExecuted: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false)))
}).annotate({
  identifier: "ToolParamsStartPart"
});
/**
 * Schema for validation and encoding of tool params delta parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolParamsDeltaPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("tool-params-delta"),
  id: Schema.String,
  delta: Schema.String
}).annotate({
  identifier: "ToolParamsDeltaPart"
});
/**
 * Schema for validation and encoding of tool params end parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolParamsEndPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("tool-params-end"),
  id: Schema.String
}).annotate({
  identifier: "ToolParamsEndPart"
});
/**
 * Creates a Schema for tool call parts with specific tool name and parameters.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolCallPart = (name, params) => Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("tool-call"),
  id: Schema.String,
  name: Schema.Literal(name),
  params,
  providerExecuted: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false)))
}).annotate({
  identifier: "ToolCallPart"
});
/**
 * Constructs a new tool call part.
 *
 * @since 1.0.0
 * @category constructors
 */
export const toolCallPart = params => makePart("tool-call", params);
/**
 * Creates a Schema for tool result parts with specific tool name and result type.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolResultPart = (name, success, failure) => {
  const ResultSchema = Schema.Union([success, failure]);
  const Common = {
    id: Schema.String,
    type: Schema.Literal("tool-result"),
    isFailure: Schema.Boolean,
    name: Schema.Literal(name)
  };
  const Decoded = Schema.Struct({
    ...Common,
    [PartTypeId]: Schema.Literal(PartTypeId),
    result: ResultSchema,
    providerExecuted: Schema.Boolean,
    metadata: ProviderMetadata,
    encodedResult: Schema.toEncoded(ResultSchema),
    preliminary: Schema.Boolean
  });
  const Encoded = Schema.Struct({
    ...Common,
    result: Schema.toEncoded(ResultSchema),
    providerExecuted: Schema.optional(Schema.Boolean),
    metadata: Schema.optional(ProviderMetadata),
    preliminary: Schema.optional(Schema.Boolean)
  });
  return Decoded.pipe(Schema.encodeTo(Encoded, SchemaTransformation.transform({
    decode: encoded => ({
      ...encoded,
      [PartTypeId]: PartTypeId,
      providerExecuted: encoded.providerExecuted ?? false,
      metadata: encoded.metadata ?? {},
      encodedResult: encoded.result,
      preliminary: encoded.preliminary ?? false
    }),
    encode: identity
  }))).annotate({
    identifier: `ToolResultPart(${name})`
  });
};
/**
 * Constructs a new tool result part.
 *
 * @since 1.0.0
 * @category constructors
 */
export const toolResultPart = params => makePart("tool-result", params);
/**
 * Schema for validation and encoding of tool approval request parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ToolApprovalRequestPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("tool-approval-request"),
  approvalId: Schema.String,
  toolCallId: Schema.String
}).annotate({
  identifier: "ToolApprovalRequestPart"
});
/**
 * Constructs a new tool approval request part.
 *
 * @since 1.0.0
 * @category constructors
 */
export const toolApprovalRequestPart = params => makePart("tool-approval-request", params);
/**
 * Schema for validation and encoding of file parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const FilePart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("file"),
  mediaType: Schema.String,
  data: Schema.Uint8ArrayFromBase64
}).annotate({
  identifier: "FilePart"
});
/**
 * Schema for validation and encoding of document source parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const DocumentSourcePart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("source"),
  sourceType: Schema.tag("document"),
  id: Schema.String,
  mediaType: Schema.String,
  title: Schema.String,
  fileName: Schema.optionalKey(Schema.String)
}).annotate({
  identifier: "DocumentSourcePart"
});
/**
 * Schema for validation and encoding of url source parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const UrlSourcePart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("source"),
  sourceType: Schema.tag("url"),
  id: Schema.String,
  url: Schema.URLFromString,
  title: Schema.String
}).annotate({
  identifier: "UrlSourcePart"
});
// =============================================================================
// HTTP Details
// =============================================================================
/**
 * Schema for HTTP request details associated with an AI response.
 *
 * Captures comprehensive information about the HTTP request made to the
 * AI provider, enabling inspection of request metadata for debugging and
 * observability purposes.
 *
 * @example
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 *
 * const requestDetails: typeof Response.HttpRequestDetails.Type = {
 *   method: "POST",
 *   url: "https://api.openai.com/v1/responses",
 *   urlParams: [],
 *   hash: undefined,
 *   headers: { "Content-Type": "application/json" }
 * }
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export const HttpRequestDetails = /*#__PURE__*/Schema.Struct({
  method: Schema.Literals(["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]),
  url: Schema.String,
  urlParams: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  hash: Schema.UndefinedOr(Schema.String),
  headers: Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Redacted(Schema.String)]))
}).annotate({
  identifier: "HttpRequestDetails"
});
/**
 * Schema for HTTP response details associated with an AI response.
 *
 * Captures essential information about the HTTP response received from
 * the AI provider, including status codes and headers for debugging and
 * observability purposes.
 *
 * @example
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 *
 * const responseDetails: typeof Response.HttpResponseDetails.Type = {
 *   status: 200,
 *   headers: {
 *     "Content-Type": "application/json",
 *     "X-Request-Id": "req_abc123"
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @category schemas
 */
export const HttpResponseDetails = /*#__PURE__*/Schema.Struct({
  status: Schema.Number,
  headers: Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Redacted(Schema.String)]))
}).annotate({
  identifier: "HttpResponseDetails"
});
/**
 * Schema for validation and encoding of response metadata parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ResponseMetadataPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("response-metadata"),
  id: Schema.UndefinedOr(Schema.String),
  modelId: Schema.UndefinedOr(Schema.String),
  timestamp: Schema.UndefinedOr(Schema.DateTimeUtcFromString),
  request: Schema.UndefinedOr(HttpRequestDetails)
}).annotate({
  identifier: "ResponseMetadataPart"
});
// =============================================================================
// Finish Part
// =============================================================================
/**
 * Represents the reason why a model finished generation of a response.
 *
 * Possible finish reasons:
 * - `"stop"`: The model generated a stop sequence.
 * - `"length"`: The model exceeded its token budget.
 * - `"content-filter"`: The model generated content which violated a content filter.
 * - `"tool-calls"`: The model triggered a tool call.
 * - `"error"`: The model encountered an error.
 * - `"pause"`: The model requested to pause execution.
 * - `"other"`: The model stopped for a reason not supported by this protocol.
 * - `"unknown"`: The model did not specify a finish reason.
 *
 * @since 1.0.0
 * @category models
 */
export const FinishReason = /*#__PURE__*/Schema.Literals(["stop", "length", "content-filter", "tool-calls", "error", "pause", "other", "unknown"]);
/**
 * Represents usage information for a request to a large language model provider.
 *
 * If the model provider returns additional usage information than what is
 * specified here, you can generally find that information under the provider
 * metadata of the finish part of the response.
 *
 * @since 1.0.0
 * @category models
 */
export class Usage extends /*#__PURE__*/Schema.Class("effect/ai/AiResponse/Usage")({
  /**
   * Information about input (i.e. prompt) token utilization.
   */
  inputTokens: /*#__PURE__*/Schema.Struct({
    /**
     * The number of non-cached input (i.e. prompt) tokens used.
     */
    uncached: /*#__PURE__*/Schema.UndefinedOr(Schema.Number),
    /**
     * The total of number of input (i.e. prompt) tokens used.
     */
    total: /*#__PURE__*/Schema.UndefinedOr(Schema.Number),
    /**
     * The number of cached input (i.e. prompt) tokens read.
     */
    cacheRead: /*#__PURE__*/Schema.UndefinedOr(Schema.Number),
    /**
     * The number of cached input (i.e. prompt) tokens written.
     */
    cacheWrite: /*#__PURE__*/Schema.UndefinedOr(Schema.Number)
  }),
  /**
   * Information about the output (i.e. response) tokens used.
   */
  outputTokens: /*#__PURE__*/Schema.Struct({
    /**
     * The total of number of output (i.e. response) tokens used.
     */
    total: /*#__PURE__*/Schema.UndefinedOr(Schema.Number),
    /**
     * The number of text tokens used.
     */
    text: /*#__PURE__*/Schema.UndefinedOr(Schema.Number),
    /**
     * The number of reasoning tokens used.
     */
    reasoning: /*#__PURE__*/Schema.UndefinedOr(Schema.Number)
  })
}) {}
/**
 * Schema for validation and encoding of finish parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const FinishPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("finish"),
  reason: FinishReason,
  usage: Usage,
  response: Schema.UndefinedOr(HttpResponseDetails)
}).annotate({
  identifier: "FinishPart"
});
/**
 * Schema for validation and encoding of error parts.
 *
 * @since 1.0.0
 * @category schemas
 */
export const ErrorPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.tag("error"),
  error: Schema.Unknown
}).annotate({
  identifier: "ErrorPart"
});
//# sourceMappingURL=Response.js.map