import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as FiberSet from "../../FiberSet.js";
import { constFalse, identity, pipe } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Queue from "../../Queue.js";
import { CurrentConcurrency } from "../../References.js";
import * as Schema from "../../Schema.js";
import * as AST from "../../SchemaAST.js";
import * as Sink from "../../Sink.js";
import * as Stream from "../../Stream.js";
import * as AiError from "./AiError.js";
import { defaultIdGenerator, IdGenerator } from "./IdGenerator.js";
import * as InternalCodecTransformer from "./internal/codec-transformer.js";
import * as Prompt from "./Prompt.js";
import * as Response from "./Response.js";
import * as ResponseIdTracker from "./ResponseIdTracker.js";
import { CurrentSpanTransformer } from "./Telemetry.js";
import * as Toolkit from "./Toolkit.js";
// =============================================================================
// Service Definition
// =============================================================================
/**
 * The `LanguageModel` service key for dependency injection.
 *
 * This provides access to language model functionality throughout your
 * application, enabling text generation, streaming, and structured output
 * capabilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const model = yield* LanguageModel.LanguageModel
 *   const response = yield* model.generateText({
 *     prompt: "What is machine learning?"
 *   })
 *   return response.text
 * })
 * ```
 *
 * @since 4.0.0
 * @category services
 */
export class LanguageModel extends /*#__PURE__*/Context.Service()("effect/unstable/ai/LanguageModel") {}
/**
 * The default codec transformer that passes schemas through without
 * provider-specific rewrites.
 *
 * @since 4.0.0
 * @category services
 */
export const defaultCodecTransformer = InternalCodecTransformer.defaultCodecTransformer;
/**
 * Response class for text generation operations.
 *
 * Contains the generated content and provides convenient accessors for
 * extracting different types of response parts like text, tool calls, and usage
 * information.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Explain photosynthesis"
 *   })
 *
 *   console.log(response.text) // Generated text content
 *   console.log(response.finishReason) // "stop", "length", etc.
 *   console.log(response.usage) // Usage information
 *
 *   return response
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export class GenerateTextResponse {
  content;
  constructor(content) {
    this.content = content;
  }
  /**
   * Extracts and concatenates all text parts from the response.
   */
  get text() {
    const text = [];
    for (const part of this.content) {
      if (part.type === "text") {
        text.push(part.text);
      }
    }
    return text.join("");
  }
  /**
   * Returns all reasoning parts from the response.
   */
  get reasoning() {
    return this.content.filter(part => part.type === "reasoning");
  }
  /**
   * Extracts and concatenates all reasoning text, or undefined if none exists.
   */
  get reasoningText() {
    const text = [];
    for (const part of this.content) {
      if (part.type === "reasoning") {
        text.push(part.text);
      }
    }
    return text.length === 0 ? undefined : text.join("");
  }
  /**
   * Returns all tool call parts from the response.
   */
  get toolCalls() {
    return this.content.filter(part => part.type === "tool-call");
  }
  /**
   * Returns all tool result parts from the response.
   */
  get toolResults() {
    return this.content.filter(part => part.type === "tool-result");
  }
  /**
   * The reason why text generation finished.
   */
  get finishReason() {
    const finishPart = this.content.find(part => part.type === "finish");
    return Predicate.isUndefined(finishPart) ? "unknown" : finishPart.reason;
  }
  /**
   * Token usage statistics for the generation request.
   */
  get usage() {
    const finishPart = this.content.find(part => part.type === "finish");
    if (Predicate.isUndefined(finishPart)) {
      return new Response.Usage({
        inputTokens: {
          uncached: undefined,
          total: undefined,
          cacheRead: undefined,
          cacheWrite: undefined
        },
        outputTokens: {
          total: undefined,
          text: undefined,
          reasoning: undefined
        }
      });
    }
    return finishPart.usage;
  }
}
/**
 * Response class for structured object generation operations.
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const UserSchema = Schema.Struct({
 *   name: Schema.String,
 *   email: Schema.String
 * })
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateObject({
 *     prompt: "Create user: John Doe, john@example.com",
 *     schema: UserSchema
 *   })
 *
 *   console.log(response.value) // { name: "John Doe", email: "john@example.com" }
 *   console.log(response.text) // Raw generated text
 *
 *   return response.value
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export class GenerateObjectResponse extends GenerateTextResponse {
  /**
   * The parsed structured object that conforms to the provided schema.
   */
  value;
  constructor(value, content) {
    super(content);
    this.value = value;
  }
}
/**
 * Creates a LanguageModel service from provider-specific implementations.
 *
 * This constructor takes provider-specific implementations for text generation
 * and streaming text generation and returns a LanguageModel service.
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (params) {
  const codecTransformer = params.codecTransformer ?? defaultCodecTransformer;
  const parentSpanTransformer = yield* Effect.serviceOption(CurrentSpanTransformer);
  const getSpanTransformer = Effect.serviceOption(CurrentSpanTransformer).pipe(Effect.map(Option.orElse(() => parentSpanTransformer)));
  const idGenerator = yield* Effect.serviceOption(IdGenerator).pipe(Effect.map(Option.getOrElse(() => defaultIdGenerator)));
  const generateText = options => Effect.useSpan("LanguageModel.generateText", {
    attributes: {
      concurrency: options.concurrency,
      toolChoice: options.toolChoice
    }
  }, Effect.fnUntraced(function* (span) {
    const spanTransformer = yield* getSpanTransformer;
    const providerOptions = {
      prompt: Prompt.make(options.prompt),
      tools: [],
      toolChoice: "none",
      responseFormat: {
        type: "text"
      },
      span,
      previousResponseId: undefined,
      incrementalPrompt: undefined
    };
    const content = yield* generateContent(options, providerOptions);
    applySpanTransformer(spanTransformer, content, providerOptions);
    return new GenerateTextResponse(content);
  }, Effect.catchTag("SchemaError", error => Effect.fail(AiError.make({
    module: "LanguageModel",
    method: "generateText",
    reason: AiError.InvalidOutputError.fromSchemaError(error)
  }))), (effect, span) => Effect.withParentSpan(effect, span, {
    captureStackTrace: false
  }), Effect.provideService(IdGenerator, idGenerator)));
  const generateObject = options => {
    const objectName = getObjectName(options.objectName, options.schema);
    return Effect.useSpan("LanguageModel.generateObject", {
      attributes: {
        objectName,
        concurrency: options.concurrency,
        toolChoice: options.toolChoice
      }
    }, Effect.fnUntraced(function* (span) {
      const spanTransformer = yield* getSpanTransformer;
      const providerOptions = {
        prompt: Prompt.make(options.prompt),
        tools: [],
        toolChoice: "none",
        responseFormat: {
          type: "json",
          objectName,
          schema: options.schema
        },
        span,
        previousResponseId: undefined,
        incrementalPrompt: undefined
      };
      const content = yield* generateContent(options, providerOptions);
      applySpanTransformer(spanTransformer, content, providerOptions);
      const {
        codec
      } = yield* Effect.try({
        try: () => codecTransformer(options.schema),
        catch: error => AiError.make({
          module: "LanguageModel",
          method: "generateObject",
          reason: new AiError.UnsupportedSchemaError({
            description: error instanceof Error ? error.message : String(error)
          })
        })
      });
      const value = yield* resolveStructuredOutput(content, codec);
      return new GenerateObjectResponse(value, content);
    }, Effect.catchTag("SchemaError", error => Effect.fail(AiError.make({
      module: "LanguageModel",
      method: "generateObject",
      reason: AiError.InvalidOutputError.fromSchemaError(error)
    }))), (effect, span) => Effect.withParentSpan(effect, span, {
      captureStackTrace: false
    }), Effect.provideService(IdGenerator, idGenerator)));
  };
  const streamText = Effect.fnUntraced(function* (options) {
    const span = yield* Effect.makeSpanScoped("LanguageModel.streamText", {
      attributes: {
        concurrency: options.concurrency,
        toolChoice: options.toolChoice
      }
    });
    const providerOptions = {
      prompt: Prompt.make(options.prompt),
      tools: [],
      toolChoice: "none",
      responseFormat: {
        type: "text"
      },
      span,
      previousResponseId: undefined,
      incrementalPrompt: undefined
    };
    // Resolve the content stream for the request
    const stream = yield* streamContent(options, providerOptions);
    // Return the stream immediately if there is no span transformer
    const spanTransformer = yield* getSpanTransformer;
    if (Option.isNone(spanTransformer)) {
      return stream;
    }
    // Otherwise aggregate generated content and apply the span transformer
    // when the stream is finished
    const content = [];
    return stream.pipe(Stream.mapArray(parts => {
      content.push(...parts);
      return parts;
    }), Stream.ensuring(Effect.sync(() => {
      spanTransformer.value({
        ...providerOptions,
        response: content
      });
    })));
  }, Stream.unwrap, Stream.mapError(error => Schema.isSchemaError(error) ? AiError.make({
    module: "LanguageModel",
    method: "streamText",
    reason: AiError.InvalidOutputError.fromSchemaError(error)
  }) : error), Stream.provideService(IdGenerator, idGenerator));
  const generateContent = Effect.fnUntraced(function* (options, providerOptions) {
    const tracker = Option.getOrUndefined(yield* Effect.serviceOption(ResponseIdTracker.ResponseIdTracker));
    const toolChoice = options.toolChoice ?? "auto";
    const generateWithNonIncrementalFallback = () => {
      const requestOptions = {
        ...providerOptions
      };
      const fallbackPrompt = requestOptions.prompt;
      const fallbackOptions = {
        ...requestOptions,
        prompt: fallbackPrompt,
        incrementalPrompt: undefined,
        previousResponseId: undefined
      };
      return requestOptions.incrementalPrompt ? params.generateText(requestOptions).pipe(Effect.catchReason("AiError", "InvalidRequestError", _ => params.generateText(fallbackOptions))) : params.generateText(requestOptions);
    };
    // Check for pending approvals that need resolution
    const {
      approved,
      denied
    } = collectToolApprovals(providerOptions.prompt.content, {
      excludeResolved: true
    });
    const hasPendingApprovals = approved.length > 0 || denied.length > 0;
    // If there is no toolkit, the generated content can be returned immediately
    if (Predicate.isUndefined(options.toolkit)) {
      // But first check if we have pending approvals that require a toolkit
      if (hasPendingApprovals) {
        return yield* AiError.make({
          module: "LanguageModel",
          method: "generateText",
          reason: new AiError.ToolkitRequiredError({
            pendingApprovals: [...approved, ...denied].map(result => result.toolCall?.name).filter(Predicate.isNotUndefined)
          })
        });
      }
      if (tracker) {
        const prepared = tracker.prepareUnsafe(providerOptions.prompt);
        if (Option.isSome(prepared)) {
          providerOptions.previousResponseId = prepared.value.previousResponseId;
          providerOptions.incrementalPrompt = prepared.value.prompt;
        }
      }
      const ResponseSchema = Schema.mutable(Schema.Array(Response.Part(Toolkit.empty)));
      const rawContent = yield* generateWithNonIncrementalFallback();
      const content = yield* Schema.decodeEffect(ResponseSchema)(rawContent);
      if (tracker) {
        const responseMetadata = content.find(part => part.type === "response-metadata");
        if (Predicate.isNotUndefined(responseMetadata) && Predicate.isNotUndefined(responseMetadata.id)) {
          tracker.markParts(providerOptions.prompt.content, responseMetadata.id);
        }
      }
      return content;
    }
    // If there is a toolkit resolve and apply it to the provider options
    const toolkit = yield* resolveToolkit(options.toolkit);
    // If the resolved toolkit is empty, return the generated content immediately
    if (Object.values(toolkit.tools).length === 0) {
      // But first check if we have pending approvals that require a toolkit
      if (hasPendingApprovals) {
        return yield* AiError.make({
          module: "LanguageModel",
          method: "generateText",
          reason: new AiError.ToolkitRequiredError({
            pendingApprovals: [...approved, ...denied].map(result => result.toolCall?.name).filter(Predicate.isNotUndefined)
          })
        });
      }
      if (tracker) {
        const prepared = tracker.prepareUnsafe(providerOptions.prompt);
        if (Option.isSome(prepared)) {
          providerOptions.previousResponseId = prepared.value.previousResponseId;
          providerOptions.incrementalPrompt = prepared.value.prompt;
        }
      }
      const ResponseSchema = Schema.mutable(Schema.Array(Response.Part(Toolkit.empty)));
      const rawContent = yield* generateWithNonIncrementalFallback();
      const content = yield* Schema.decodeEffect(ResponseSchema)(rawContent);
      if (tracker) {
        const responseMetadata = content.find(part => part.type === "response-metadata");
        if (Predicate.isNotUndefined(responseMetadata) && Predicate.isNotUndefined(responseMetadata.id)) {
          tracker.markParts(providerOptions.prompt.content, responseMetadata.id);
        }
      }
      return content;
    }
    // Pre-resolve pending tool approvals before calling the LLM
    if (hasPendingApprovals) {
      for (const approval of approved) {
        if (approval.toolCall && !toolkit.tools[approval.toolCall.name]) {
          return yield* AiError.make({
            module: "LanguageModel",
            method: "generateText",
            reason: new AiError.ToolNotFoundError({
              toolName: approval.toolCall.name,
              availableTools: Object.keys(toolkit.tools)
            })
          });
        }
      }
      const approvedResults = yield* executeApprovedToolCalls(approved, toolkit, options.concurrency);
      const deniedResults = createDenialResults(denied);
      const preResolvedResults = [...approvedResults, ...deniedResults];
      if (preResolvedResults.length > 0) {
        providerOptions.prompt = Prompt.fromMessages([...providerOptions.prompt.content, Prompt.makeMessage("tool", {
          content: preResolvedResults
        })]);
      }
    }
    // Strip all resolved approval artifacts (both current and from previous
    // rounds) in a single pass before sending to the provider.
    {
      const {
        approved: allResolved,
        denied: allDenied
      } = collectToolApprovals(providerOptions.prompt.content);
      if (allResolved.length > 0 || allDenied.length > 0) {
        providerOptions.prompt = stripResolvedApprovals(providerOptions.prompt, allResolved, allDenied);
      }
    }
    const tools = typeof toolChoice === "object" && "oneOf" in toolChoice ? Object.values(toolkit.tools).filter(tool => toolChoice.oneOf.includes(tool.name)) : Object.values(toolkit.tools);
    providerOptions.tools = tools;
    providerOptions.toolChoice = toolChoice;
    if (tracker) {
      const prepared = tracker.prepareUnsafe(providerOptions.prompt);
      if (Option.isSome(prepared)) {
        providerOptions.previousResponseId = prepared.value.previousResponseId;
        providerOptions.incrementalPrompt = prepared.value.prompt;
      }
    }
    // Construct the response schema with the tools from the toolkit
    const ResponseSchema = Schema.mutable(Schema.Array(Response.Part(toolkit)));
    // If tool call resolution is disabled, return the response without
    // resolving the tool calls that were generated
    if (options.disableToolCallResolution === true) {
      const rawContent = yield* generateWithNonIncrementalFallback();
      const content = yield* Schema.decodeEffect(ResponseSchema)(rawContent);
      if (tracker) {
        const responseMetadata = content.find(part => part.type === "response-metadata");
        if (Predicate.isNotUndefined(responseMetadata) && Predicate.isNotUndefined(responseMetadata.id)) {
          tracker.markParts(providerOptions.prompt.content, responseMetadata.id);
        }
      }
      return content;
    }
    const rawContent = yield* generateWithNonIncrementalFallback();
    // Resolve the generated tool calls
    const toolResults = yield* resolveToolCalls(rawContent, toolkit, providerOptions.prompt.content, options.concurrency).pipe(Stream.filter(result => result.type === "tool-approval-request" || result.preliminary === false), Stream.runCollect);
    const content = yield* Schema.decodeEffect(ResponseSchema)(rawContent);
    if (tracker) {
      const responseMetadata = content.find(part => part.type === "response-metadata");
      if (Predicate.isNotUndefined(responseMetadata) && Predicate.isNotUndefined(responseMetadata.id)) {
        tracker.markParts(providerOptions.prompt.content, responseMetadata.id);
      }
    }
    // Return the content merged with the tool call results
    return [...content, ...toolResults];
  });
  const streamContent = Effect.fnUntraced(function* (options, providerOptions) {
    const tracker = Option.getOrUndefined(yield* Effect.serviceOption(ResponseIdTracker.ResponseIdTracker));
    const toolChoice = options.toolChoice ?? "auto";
    const streamWithNonIncrementalFallback = () => {
      const requestOptions = {
        ...providerOptions
      };
      const fallbackPrompt = requestOptions.prompt;
      const fallbackOptions = {
        ...requestOptions,
        prompt: fallbackPrompt,
        incrementalPrompt: undefined,
        previousResponseId: undefined
      };
      return requestOptions.incrementalPrompt ? params.streamText(requestOptions).pipe(Stream.catchReason("AiError", "InvalidRequestError", _ => params.streamText(fallbackOptions))) : params.streamText(requestOptions);
    };
    // Check for pending approvals that need resolution
    const {
      approved: pendingApproved,
      denied: pendingDenied
    } = collectToolApprovals(providerOptions.prompt.content, {
      excludeResolved: true
    });
    const hasPendingApprovals = pendingApproved.length > 0 || pendingDenied.length > 0;
    // If there is no toolkit, return immediately
    if (Predicate.isUndefined(options.toolkit)) {
      // But first check if we have pending approvals that require a toolkit
      if (hasPendingApprovals) {
        return yield* AiError.make({
          module: "LanguageModel",
          method: "streamText",
          reason: new AiError.ToolkitRequiredError({
            pendingApprovals: [...pendingApproved, ...pendingDenied].map(a => a.toolCall?.name).filter(Predicate.isNotUndefined)
          })
        });
      }
      if (tracker) {
        const prepared = tracker.prepareUnsafe(providerOptions.prompt);
        if (Option.isSome(prepared)) {
          providerOptions.previousResponseId = prepared.value.previousResponseId;
          providerOptions.incrementalPrompt = prepared.value.prompt;
        }
      }
      const schema = Schema.NonEmptyArray(Response.StreamPart(Toolkit.empty));
      const decodeParts = Schema.decodeEffect(schema);
      return pipe(streamWithNonIncrementalFallback(), Stream.mapArrayEffect(parts => decodeParts(parts).pipe(tracker ? Effect.tap(decodedParts => {
        for (const part of decodedParts) {
          if (part.type === "response-metadata" && Predicate.isNotUndefined(part.id)) {
            tracker.markParts(providerOptions.prompt.content, part.id);
          }
        }
        return Effect.void;
      }) : identity)));
    }
    // If there is a toolkit resolve and apply it to the provider options
    const toolkit = yield* resolveToolkit(options.toolkit);
    // If the toolkit is empty, return immediately
    if (Object.values(toolkit.tools).length === 0) {
      // But first check if we have pending approvals that require a toolkit
      if (hasPendingApprovals) {
        return yield* AiError.make({
          module: "LanguageModel",
          method: "streamText",
          reason: new AiError.ToolkitRequiredError({
            pendingApprovals: [...pendingApproved, ...pendingDenied].map(a => a.toolCall?.name).filter(Predicate.isNotUndefined)
          })
        });
      }
      if (tracker) {
        const prepared = tracker.prepareUnsafe(providerOptions.prompt);
        if (Option.isSome(prepared)) {
          providerOptions.previousResponseId = prepared.value.previousResponseId;
          providerOptions.incrementalPrompt = prepared.value.prompt;
        }
      }
      const schema = Schema.NonEmptyArray(Response.StreamPart(Toolkit.empty));
      const decodeParts = Schema.decodeEffect(schema);
      return pipe(streamWithNonIncrementalFallback(), Stream.mapArrayEffect(parts => decodeParts(parts).pipe(tracker ? Effect.tap(decodedParts => {
        for (const part of decodedParts) {
          if (part.type === "response-metadata" && part.id) {
            tracker.markParts(providerOptions.prompt.content, part.id);
          }
        }
        return Effect.void;
      }) : identity)));
    }
    // Pre-resolve pending tool approvals before calling the LLM
    let preResolvedStreamParts = [];
    if (hasPendingApprovals) {
      for (const approval of pendingApproved) {
        if (approval.toolCall && !toolkit.tools[approval.toolCall.name]) {
          return yield* AiError.make({
            module: "LanguageModel",
            method: "streamText",
            reason: new AiError.ToolNotFoundError({
              toolName: approval.toolCall.name,
              availableTools: Object.keys(toolkit.tools)
            })
          });
        }
      }
      const approvedResults = yield* executeApprovedToolCalls(pendingApproved, toolkit, options.concurrency);
      const deniedResults = createDenialResults(pendingDenied);
      const preResolvedResults = [...approvedResults, ...deniedResults];
      if (preResolvedResults.length > 0) {
        providerOptions.prompt = Prompt.fromMessages([...providerOptions.prompt.content, Prompt.makeMessage("tool", {
          content: preResolvedResults
        })]);
      }
      // Emit pre-resolved tool-results as stream parts so Chat.streamText
      // persists them to history. This lets collectToolApprovals find them
      // on subsequent rounds and skip the now-resolved approvals.
      // Note: r.result is already encoded (from executeApprovedToolCalls /
      // createDenialResults), so it goes into both result and encodedResult.
      for (const r of preResolvedResults) {
        preResolvedStreamParts.push(Response.makePart("tool-result", {
          id: r.id,
          name: r.name,
          providerExecuted: false,
          preliminary: false,
          result: r.result,
          encodedResult: r.result,
          isFailure: r.isFailure
        }));
      }
    }
    // Strip all resolved approval artifacts (both current and from previous
    // rounds) in a single pass before sending to the provider.
    const {
      approved: allResolved,
      denied: allDenied
    } = collectToolApprovals(providerOptions.prompt.content);
    if (allResolved.length > 0 || allDenied.length > 0) {
      providerOptions.prompt = stripResolvedApprovals(providerOptions.prompt, allResolved, allDenied);
    }
    const tools = typeof toolChoice === "object" && "oneOf" in toolChoice ? Object.values(toolkit.tools).filter(tool => toolChoice.oneOf.includes(tool.name)) : Object.values(toolkit.tools);
    providerOptions.tools = tools;
    providerOptions.toolChoice = toolChoice;
    if (tracker) {
      const prepared = tracker.prepareUnsafe(providerOptions.prompt);
      if (Option.isSome(prepared)) {
        providerOptions.previousResponseId = prepared.value.previousResponseId;
        providerOptions.incrementalPrompt = prepared.value.prompt;
      }
    }
    // If tool call resolution is disabled, return the response without
    // resolving the tool calls that were generated
    if (options.disableToolCallResolution === true) {
      const schema = Schema.NonEmptyArray(Response.StreamPart(toolkit));
      const decodeParts = Schema.decodeEffect(schema);
      return streamWithNonIncrementalFallback().pipe(Stream.mapArrayEffect(parts => decodeParts(parts).pipe(tracker ? Effect.tap(decodedParts => {
        for (const part of decodedParts) {
          if (part.type === "response-metadata" && Predicate.isNotUndefined(part.id)) {
            tracker.markParts(providerOptions.prompt.content, part.id);
          }
        }
        return Effect.void;
      }) : identity)));
    }
    const ResponseSchema = Schema.NonEmptyArray(Response.StreamPart(toolkit));
    const decodeParts = Schema.decodeEffect(ResponseSchema);
    // Queue for decoded parts and tool results
    const queue = yield* Queue.make();
    const deferredFinishParts = [];
    // Emit pre-resolved tool results so Chat.streamText persists them to
    // history. This ensures collectToolApprovals({ excludeResolved }) can
    // find the corresponding tool-results on future rounds.
    if (preResolvedStreamParts.length > 0) {
      yield* Queue.offerAll(queue, preResolvedStreamParts);
    }
    // FiberSet to track concurrent tool call handlers
    const toolCallFibers = yield* FiberSet.make();
    // Helper function to handle tool calls with approval logic
    const handleToolCall = Effect.fnUntraced(function* (part) {
      const tool = toolkit.tools[part.name];
      if (!tool) return;
      const needsApproval = yield* isApprovalNeeded(tool, part, providerOptions.prompt.content);
      if (needsApproval) {
        const idGen = yield* IdGenerator;
        const approvalId = yield* idGen.generateId();
        const approvalPart = Response.makePart("tool-approval-request", {
          approvalId,
          toolCallId: part.id
        });
        yield* Queue.offer(queue, approvalPart);
        return;
      }
      yield* toolkit.handle(part.name, part.params).pipe(Stream.unwrap, Stream.runForEach(result => {
        const toolResultPart = Response.makePart("tool-result", {
          id: part.id,
          name: part.name,
          providerExecuted: false,
          ...result
        });
        return Queue.offer(queue, toolResultPart);
      }));
    });
    yield* streamWithNonIncrementalFallback().pipe(Stream.runForEachArray(Effect.fnUntraced(function* (chunk) {
      const parts = yield* decodeParts(chunk);
      if (tracker) {
        for (const part of parts) {
          if (part.type === "response-metadata" && part.id) {
            tracker.markParts(providerOptions.prompt.content, part.id);
          }
        }
      }
      // Defer finish parts until all tool handlers complete. This guarantees
      // tool results are emitted before finish in streaming mode.
      const immediateParts = [];
      for (const part of parts) {
        if (part.type === "finish") {
          deferredFinishParts.push(part);
        } else {
          immediateParts.push(part);
        }
      }
      if (immediateParts.length > 0) {
        yield* Queue.offerAll(queue, immediateParts);
      }
      // Fork tool call handlers - use the raw chunk for encoded params
      for (const part of chunk) {
        if (part.type === "tool-call" && part.providerExecuted !== true) {
          yield* FiberSet.run(toolCallFibers, handleToolCall(part));
        }
      }
    })),
    // Wait for all tool calls to either:
    // - complete (FiberSet.awaitEmpty)
    // - fail (FiberSet.join)
    Effect.andThen(Effect.raceFirst(FiberSet.join(toolCallFibers), FiberSet.awaitEmpty(toolCallFibers))), Effect.andThen(Queue.offerAll(queue, deferredFinishParts)),
    // And then end the queue
    Effect.andThen(Queue.end(queue)), Effect.tapCause(cause => Queue.failCause(queue, cause)), Effect.forkScoped);
    return Stream.fromQueue(queue);
  });
  return {
    generateText: generateText,
    generateObject,
    streamText: streamText
  };
});
// =============================================================================
// Accessors
// =============================================================================
/**
 * Generate text using a language model.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Write a haiku about programming",
 *     toolChoice: "none"
 *   })
 *
 *   console.log(response.text)
 *   console.log(response.usage.inputTokens.total)
 *
 *   return response
 * })
 * ```
 *
 * @since 4.0.0
 * @category text generation
 */
export const generateText = options => Effect.flatMap(Effect.service(LanguageModel), model => model.generateText(options));
/**
 * Generate a structured object from a schema using a language model.
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const EventSchema = Schema.Struct({
 *   title: Schema.String,
 *   date: Schema.String,
 *   location: Schema.String
 * })
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateObject({
 *     prompt:
 *       "Extract event info: Tech Conference on March 15th in San Francisco",
 *     schema: EventSchema,
 *     objectName: "event"
 *   })
 *
 *   console.log(response.value)
 *   // { title: "Tech Conference", date: "March 15th", location: "San Francisco" }
 *
 *   return response.value
 * })
 * ```
 *
 * @since 4.0.0
 * @category object generation
 */
export const generateObject = options => Effect.flatMap(Effect.service(LanguageModel), model => model.generateObject(options));
/**
 * Generate text using a language model with streaming output.
 *
 * Returns a stream of response parts that are emitted as soon as they are
 * available from the model, enabling real-time text generation experiences.
 *
 * @example
 * ```ts
 * import { Console, Effect, Stream } from "effect"
 * import { LanguageModel } from "effect/unstable/ai"
 *
 * const program = LanguageModel.streamText({
 *   prompt: "Write a story about a space explorer"
 * }).pipe(Stream.runForEach((part) => {
 *   if (part.type === "text-delta") {
 *     return Console.log(part.delta)
 *   }
 *   return Effect.void
 * }))
 * ```
 *
 * @since 4.0.0
 * @category text generation
 */
export const streamText = options => Stream.unwrap(Effect.map(Effect.service(LanguageModel), model => model.streamText(options)));
const collectToolApprovals = (messages, options) => {
  const requests = new Map();
  const responses = [];
  const toolCallsById = new Map();
  const toolResultIds = new Set();
  // Collect all tool approval requests, responses, tool calls, and tool results
  for (const message of messages) {
    if (message.role === "assistant") {
      for (const part of message.content) {
        if (part.type === "tool-approval-request") {
          requests.set(part.approvalId, {
            approvalId: part.approvalId,
            toolCallId: part.toolCallId
          });
        }
        if (part.type === "tool-call") {
          toolCallsById.set(part.id, part);
        }
      }
    }
    if (message.role === "tool") {
      for (const part of message.content) {
        if (part.type === "tool-approval-response") {
          responses.push({
            approvalId: part.approvalId,
            approved: part.approved,
            reason: part.reason
          });
        }
        if (part.type === "tool-result") {
          toolResultIds.add(part.id);
        }
      }
    }
  }
  const approved = [];
  const denied = [];
  for (const response of responses) {
    const request = requests.get(response.approvalId);
    if (Predicate.isNotUndefined(request)) {
      // Skip if already resolved
      if (options?.excludeResolved && toolResultIds.has(request.toolCallId)) {
        continue;
      }
      const result = {
        ...response,
        toolCallId: request.toolCallId,
        toolCall: toolCallsById.get(request.toolCallId)
      };
      if (response.approved) {
        approved.push(result);
      } else {
        denied.push(result);
      }
    }
  }
  return {
    approved,
    denied
  };
};
/**
 * Strip resolved approval artifacts from the prompt before sending to the
 * provider. After pre-resolving approvals (executing approved tools and
 * creating denial results), the original `tool-approval-request` parts in
 * assistant messages and `tool-approval-response` parts in tool messages are
 * no longer needed. Leaving them in causes provider-specific errors (e.g.
 * OpenAI rejects `mcp_approval_response` items that reference approval
 * requests it never issued).
 */
const stripResolvedApprovals = (prompt, approved, denied) => {
  const resolvedApprovalIds = new Set();
  for (const a of approved) resolvedApprovalIds.add(a.approvalId);
  for (const d of denied) resolvedApprovalIds.add(d.approvalId);
  const cleanedMessages = [];
  for (const message of prompt.content) {
    if (message.role === "assistant") {
      const filteredContent = message.content.filter(part => part.type !== "tool-approval-request" || !resolvedApprovalIds.has(part.approvalId));
      if (filteredContent.length > 0) {
        cleanedMessages.push(Prompt.makeMessage("assistant", {
          content: filteredContent,
          options: message.options
        }));
      }
    } else if (message.role === "tool") {
      const filteredContent = message.content.filter(part => part.type !== "tool-approval-response" || !resolvedApprovalIds.has(part.approvalId));
      if (filteredContent.length > 0) {
        cleanedMessages.push(Prompt.makeMessage("tool", {
          content: filteredContent,
          options: message.options
        }));
      }
    } else {
      cleanedMessages.push(message);
    }
  }
  return Prompt.fromMessages(cleanedMessages);
};
const isApprovalNeeded = /*#__PURE__*/Effect.fnUntraced(function* (tool, toolCall, messages) {
  if (Predicate.isUndefined(tool.needsApproval)) {
    return false;
  }
  if (typeof tool.needsApproval === "function") {
    const params = yield* Schema.decodeUnknownEffect(tool.parametersSchema)(toolCall.params);
    const result = tool.needsApproval(params, {
      toolCallId: toolCall.id,
      messages
    });
    return Effect.isEffect(result) ? yield* result : result;
  }
  return tool.needsApproval;
}, /*#__PURE__*/Effect.orElseSucceed(constFalse));
const executeApprovedToolCalls = (approvals, toolkit, concurrency) => {
  const executeTool = Effect.fnUntraced(function* (approval) {
    const toolCall = approval.toolCall;
    if (Predicate.isUndefined(toolCall)) {
      return yield* Effect.die("Approval missing tool call reference");
    }
    const tool = toolkit.tools[toolCall.name];
    if (Predicate.isUndefined(tool)) {
      return yield* AiError.make({
        module: "LanguageModel",
        method: "generateText",
        reason: new AiError.ToolNotFoundError({
          toolName: toolCall.name,
          availableTools: Object.keys(toolkit.tools)
        })
      });
    }
    const resultStream = yield* toolkit.handle(toolCall.name, toolCall.params);
    const terminalResult = yield* resultStream.pipe(Stream.filter(result => result.preliminary === false), Stream.run(Sink.last()), Effect.flatMap(Option.match({
      onNone: () => Effect.die("Tool handler did not produce a final result"),
      onSome: Effect.succeed
    })));
    return Prompt.makePart("tool-result", {
      id: approval.toolCallId,
      name: toolCall.name,
      isFailure: terminalResult.isFailure,
      result: terminalResult.encodedResult
    });
  });
  return Effect.gen(function* () {
    const resolveConcurrency = concurrency === "inherit" ? yield* Effect.service(CurrentConcurrency) : concurrency ?? "unbounded";
    return yield* Effect.forEach(approvals, executeTool, {
      concurrency: resolveConcurrency
    });
  });
};
const createDenialResults = denials => {
  const results = [];
  for (const denial of denials) {
    if (Predicate.isNotUndefined(denial.toolCall)) {
      results.push(Prompt.makePart("tool-result", {
        id: denial.toolCallId,
        name: denial.toolCall.name,
        isFailure: true,
        result: {
          type: "execution-denied",
          reason: denial.reason
        }
      }));
    }
  }
  return results;
};
const resolveToolCalls = (content, toolkit, messages, concurrency) => {
  const toolCalls = [];
  for (const part of content) {
    if (part.type === "tool-call") {
      if (part.providerExecuted === true) {
        continue;
      }
      toolCalls.push(part);
    }
  }
  const {
    approved,
    denied
  } = collectToolApprovals(messages);
  const approvedToolCallIds = new Set(approved.map(approval => approval.toolCallId));
  const deniedByToolCallId = new Map(denied.map(denial => [denial.toolCallId, denial]));
  const streams = toolCalls.map(toolCall => Effect.gen(function* () {
    const tool = toolkit.tools[toolCall.name];
    if (!tool) {
      return Stream.empty;
    }
    if (deniedByToolCallId.has(toolCall.id)) {
      const denial = deniedByToolCallId.get(toolCall.id);
      return Stream.succeed(Response.makePart("tool-result", {
        id: toolCall.id,
        name: toolCall.name,
        providerExecuted: false,
        isFailure: true,
        result: {
          type: "execution-denied",
          reason: denial.reason
        },
        encodedResult: {
          type: "execution-denied",
          reason: denial.reason
        },
        preliminary: false
      }));
    }
    if (approvedToolCallIds.has(toolCall.id)) {
      return toolkit.handle(toolCall.name, toolCall.params).pipe(Stream.unwrap, Stream.map(result => Response.makePart("tool-result", {
        id: toolCall.id,
        name: toolCall.name,
        providerExecuted: false,
        ...result
      })));
    }
    const needsApproval = yield* isApprovalNeeded(tool, toolCall, messages);
    if (needsApproval) {
      const generator = yield* IdGenerator;
      const approvalId = yield* generator.generateId();
      return Stream.succeed(Response.makePart("tool-approval-request", {
        approvalId,
        toolCallId: toolCall.id
      }));
    }
    return toolkit.handle(toolCall.name, toolCall.params).pipe(Stream.unwrap, Stream.map(result => Response.makePart("tool-result", {
      id: toolCall.id,
      name: toolCall.name,
      providerExecuted: false,
      ...result
    })));
  }).pipe(Stream.unwrap));
  const resolveConcurrency = concurrency === "inherit" ? Effect.service(CurrentConcurrency) : Effect.succeed(concurrency ?? "unbounded");
  return resolveConcurrency.pipe(Effect.map(concurrency => Stream.mergeAll(streams, {
    concurrency
  })), Stream.unwrap);
};
// =============================================================================
// Utilities
// =============================================================================
const resolveToolkit = toolkit => "asEffect" in toolkit ? toolkit.asEffect() : Effect.succeed(toolkit);
/** @internal */
export const getObjectName = (objectName, schema) => {
  if (Predicate.isNotUndefined(objectName)) {
    return objectName;
  }
  if ("identifier" in schema && typeof schema.identifier === "string") {
    return schema.identifier;
  }
  const identifier = AST.resolveIdentifier(schema.ast);
  if (typeof identifier === "string") {
    return identifier;
  }
  return "generateObject";
};
const resolveStructuredOutput = /*#__PURE__*/Effect.fnUntraced(function* (response, schema) {
  const texts = [];
  for (const part of response) {
    if (part.type === "text") {
      texts.push(part.text);
    }
  }
  const text = texts.join("");
  if (text.length === 0) {
    return yield* AiError.make({
      module: "LanguageModel",
      method: "generateObject",
      reason: new AiError.StructuredOutputError({
        description: "No text content in response",
        responseText: text
      })
    });
  }
  const decode = Schema.decodeEffect(Schema.fromJsonString(schema));
  return yield* Effect.mapError(decode(text), error => AiError.make({
    module: "LanguageModel",
    method: "generateObject",
    reason: AiError.StructuredOutputError.fromSchemaError(error, text)
  }));
});
const applySpanTransformer = (transformer, response, options) => {
  if (Option.isSome(transformer)) {
    transformer.value({
      ...options,
      response: response
    });
  }
};
//# sourceMappingURL=LanguageModel.js.map