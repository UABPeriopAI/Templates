import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as JsonSchema from "../../JsonSchema.ts";
import * as Schema from "../../Schema.ts";
import * as Stream from "../../Stream.ts";
import type { Span } from "../../Tracer.ts";
import type { Concurrency, NoExcessProperties } from "../../Types.ts";
import * as AiError from "./AiError.ts";
import { IdGenerator } from "./IdGenerator.ts";
import * as Prompt from "./Prompt.ts";
import * as Response from "./Response.ts";
import type * as Tool from "./Tool.ts";
import * as Toolkit from "./Toolkit.ts";
declare const LanguageModel_base: Context.ServiceClass<LanguageModel, "effect/unstable/ai/LanguageModel", Service>;
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
export declare class LanguageModel extends LanguageModel_base {
}
/**
 * The service interface for language model operations.
 *
 * Defines the contract that all language model implementations must fulfill,
 * providing text generation, structured output, and streaming capabilities.
 *
 * @since 4.0.0
 * @category models
 */
export interface Service {
    /**
     * Generate text using the language model.
     */
    readonly generateText: {
        <Options extends NoExcessProperties<GenerateTextOptionsWithoutToolkit, Options>>(options: Options & GenerateTextOptionsWithoutToolkit): Effect.Effect<GenerateTextResponse<{}>, ExtractError<Options>, ExtractServices<Options>>;
        <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<GenerateTextOptions<Tools> & {
            readonly toolkit: ToolkitInput<Tools>;
        }, Options>>(options: Options & GenerateTextOptions<Tools> & {
            readonly toolkit: ToolkitInput<Tools>;
        }): Effect.Effect<GenerateTextResponse<Tools>, ExtractError<Options>, ExtractServices<Options>>;
        <Options extends {
            readonly toolkit: ToolkitOption<any>;
        } & NoExcessProperties<GenerateTextOptions<any>, Options>>(options: Options & GenerateTextOptions<ExtractTools<Options>> & {
            readonly toolkit: Options["toolkit"];
        }): Effect.Effect<GenerateTextResponse<ExtractTools<Options>>, ExtractError<Options>, ExtractServices<Options>>;
    };
    /**
     * Generate a structured object from a schema using the language model.
     */
    readonly generateObject: <ObjectEncoded extends Record<string, any>, StructuredOutputSchema extends Schema.Encoder<ObjectEncoded, unknown>, Options extends NoExcessProperties<GenerateObjectOptions<any, StructuredOutputSchema>, Options>, Tools extends Record<string, Tool.Any> = {}>(options: Options & GenerateObjectOptions<Tools, StructuredOutputSchema>) => Effect.Effect<GenerateObjectResponse<Tools, StructuredOutputSchema["Type"]>, ExtractError<Options>, ExtractServices<Options> | StructuredOutputSchema["DecodingServices"]>;
    /**
     * Generate text using the language model with streaming output.
     */
    readonly streamText: {
        <Options extends NoExcessProperties<GenerateTextOptionsWithoutToolkit, Options>>(options: Options & GenerateTextOptionsWithoutToolkit): Stream.Stream<Response.StreamPart<{}>, ExtractError<Options>, ExtractServices<Options>>;
        <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<GenerateTextOptions<Tools> & {
            readonly toolkit: ToolkitInput<Tools>;
        }, Options>>(options: Options & GenerateTextOptions<Tools> & {
            readonly toolkit: ToolkitInput<Tools>;
        }): Stream.Stream<Response.StreamPart<Tools>, ExtractError<Options>, ExtractServices<Options>>;
        <Options extends {
            readonly toolkit: ToolkitOption<any>;
        } & NoExcessProperties<GenerateTextOptions<any>, Options>>(options: Options & GenerateTextOptions<ExtractTools<Options>> & {
            readonly toolkit: Options["toolkit"];
        }): Stream.Stream<Response.StreamPart<ExtractTools<Options>>, ExtractError<Options>, ExtractServices<Options>>;
    };
}
/**
 * A function that transforms a `Schema.Codec` into a provider-compatible form
 * for structured output generation.
 *
 * Different language model providers have varying constraints on the JSON
 * schemas they accept. A `CodecTransformer` rewrites a codec's encoded side to
 * satisfy those constraints while preserving the decoded type.
 *
 * @since 4.0.0
 * @category models
 */
export type CodecTransformer = <T, E, RD, RE>(schema: Schema.Codec<T, E, RD, RE>) => {
    readonly codec: Schema.Codec<T, unknown, RD, RE>;
    readonly jsonSchema: JsonSchema.JsonSchema;
};
/**
 * The default codec transformer that passes schemas through without
 * provider-specific rewrites.
 *
 * @since 4.0.0
 * @category services
 */
export declare const defaultCodecTransformer: CodecTransformer;
/**
 * Configuration options for text generation.
 *
 * @since 4.0.0
 * @category models
 */
export interface GenerateTextOptions<Tools extends Record<string, Tool.Any>> {
    /**
     * The prompt input to use to generate text.
     */
    readonly prompt: Prompt.RawInput;
    /**
     * A toolkit containing both the tools and the tool call handler to use to
     * augment text generation.
     */
    readonly toolkit?: ToolkitInput<Tools> | undefined;
    /**
     * The tool choice mode for the language model.
     * - `auto` (default): The model can decide whether or not to call tools, as
     *   well as which tools to call.
     * - `required`: The model **must** call a tool but can decide which tool will
     *   be called.
     * - `none`: The model **must not** call a tool.
     * - `{ tool: <tool_name> }`: The model must call the specified tool.
     * - `{ mode?: "auto" (default) | "required", "oneOf": [<tool-names>] }`: The
     *   model is restricted to the subset of tools specified by `oneOf`. When
     *   `mode` is `"auto"` or omitted, the model can decide whether or not a tool
     *   from the allowed subset of tools can be called. When `mode` is
     *   `"required"`, the model **must** call one tool from the allowed subset of
     *   tools.
     */
    readonly toolChoice?: ToolChoice<{
        [Name in keyof Tools]: Tools[Name]["name"];
    }[keyof Tools]> | undefined;
    /**
     * The concurrency level for resolving tool calls.
     */
    readonly concurrency?: Concurrency | undefined;
    /**
     * When set to `true`, tool calls requested by the large language model
     * will not be auto-resolved by the framework.
     *
     * This option is useful when:
     *   1. The user wants to include tool call definitions from an `AiToolkit`
     *      in requests to the large language model so that the model has the
     *      capability to call tools
     *   2. The user wants to control the execution of tool call resolvers
     *      instead of having the framework handle tool call resolution
     */
    readonly disableToolCallResolution?: boolean | undefined;
}
type GenerateTextOptionsWithoutToolkit = Omit<GenerateTextOptions<{}>, "toolkit"> & {
    readonly toolkit?: undefined;
};
/**
 * Configuration options for structured object generation.
 *
 * @since 4.0.0
 * @category models
 */
export interface GenerateObjectOptions<Tools extends Record<string, Tool.Any>, StructuredOutputSchema extends Schema.Top> extends GenerateTextOptions<Tools> {
    /**
     * The name of the structured output that should be generated. Used by some
     * large language model providers to provide additional guidance to the model.
     */
    readonly objectName?: string | undefined;
    /**
     * The schema to be used to specify the structure of the object to generate.
     */
    readonly schema: StructuredOutputSchema;
}
/**
 * The tool choice mode for the language model.
 * - `auto` (default): The model can decide whether or not to call tools, as
 *   well as which tools to call.
 * - `required`: The model **must** call a tool but can decide which tool will
 *   be called.
 * - `none`: The model **must not** call a tool.
 * - `{ tool: <tool_name> }`: The model must call the specified tool.
 * - `{ mode?: "auto" (default) | "required", "oneOf": [<tool-names>] }`: The
 *   model is restricted to the subset of tools specified by `oneOf`. When
 *   `mode` is `"auto"` or omitted, the model can decide whether or not a tool
 *   from the allowed subset of tools can be called. When `mode` is
 *   `"required"`, the model **must** call one tool from the allowed subset of
 *   tools.
 *
 * @since 4.0.0
 * @category models
 */
export type ToolChoice<ToolName extends string> = "auto" | "none" | "required" | {
    readonly tool: ToolName;
} | {
    readonly mode?: "auto" | "required";
    readonly oneOf: ReadonlyArray<ToolName>;
};
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
export declare class GenerateTextResponse<Tools extends Record<string, Tool.Any>> {
    readonly content: Array<Response.Part<Tools>>;
    constructor(content: Array<Response.Part<Tools>>);
    /**
     * Extracts and concatenates all text parts from the response.
     */
    get text(): string;
    /**
     * Returns all reasoning parts from the response.
     */
    get reasoning(): Array<Response.ReasoningPart>;
    /**
     * Extracts and concatenates all reasoning text, or undefined if none exists.
     */
    get reasoningText(): string | undefined;
    /**
     * Returns all tool call parts from the response.
     */
    get toolCalls(): Array<Response.ToolCallParts<Tools>>;
    /**
     * Returns all tool result parts from the response.
     */
    get toolResults(): Array<Response.ToolResultParts<Tools>>;
    /**
     * The reason why text generation finished.
     */
    get finishReason(): Response.FinishReason;
    /**
     * Token usage statistics for the generation request.
     */
    get usage(): Response.Usage;
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
export declare class GenerateObjectResponse<Tools extends Record<string, Tool.Any>, A> extends GenerateTextResponse<Tools> {
    /**
     * The parsed structured object that conforms to the provided schema.
     */
    readonly value: A;
    constructor(value: A, content: Array<Response.Part<Tools>>);
}
/**
 * The supported toolkit option shapes for language model operations.
 *
 * @since 4.0.0
 * @category utility types
 */
export type ToolkitOption<Tools extends Record<string, Tool.Any>, E = never, R = any> = Tools extends any ? (Toolkit.WithHandler<Tools> | Effect.Yieldable<Toolkit.Toolkit<Tools>, Toolkit.WithHandler<Tools>, E, R>) : never;
/**
 * The supported toolkit input shapes for language model operation options.
 *
 * Unlike `ToolkitOption`, this type does not distribute over unions. It is
 * intended for call-site assignability, while `ToolkitOption` remains the
 * distributive helper used for extraction and inference.
 *
 * @since 4.0.0
 * @category utility types
 */
export type ToolkitInput<Tools extends Record<string, Tool.Any>, E = never, R = any> = ToolkitOption<Tools, E, R> | Toolkit.WithHandler<Tools> | Effect.Yieldable<Toolkit.Toolkit<Tools>, Toolkit.WithHandler<Tools>, E, R>;
type ExtractToolsFromToolkitOption<ToolkitValue> = ToolkitValue extends Toolkit.WithHandler<infer Tools> ? Tools : ToolkitValue extends Effect.Yieldable<Toolkit.Toolkit<infer Tools>, Toolkit.WithHandler<infer _Tools>, infer _E, infer _R> ? Tools : never;
/**
 * Utility type that extracts the toolset from LanguageModel options.
 *
 * @since 4.0.0
 * @category utility types
 */
export type ExtractTools<Options> = Options extends {
    readonly toolkit: infer ToolkitValue;
} ? ExtractToolsFromToolkitOption<Exclude<ToolkitValue, undefined>> : {};
type ExtractErrorFromToolkitOption<ToolkitValue, DisableToolCallResolution extends boolean> = ToolkitValue extends Toolkit.WithHandler<infer Tools> ? AiError.AiError | (DisableToolCallResolution extends true ? never : Tool.HandlerError<Tools[keyof Tools]>) : ToolkitValue extends Effect.Yieldable<Toolkit.Toolkit<infer Tools>, Toolkit.WithHandler<infer _Tools>, infer E, infer _R> ? AiError.AiError | E | (DisableToolCallResolution extends true ? never : Tool.HandlerError<Tools[keyof Tools]>) : AiError.AiError;
type ExtractServicesFromToolkitOption<ToolkitValue> = ToolkitValue extends Toolkit.WithHandler<infer Tools> ? Tool.HandlerServices<Tools[keyof Tools]> | Tool.ResultDecodingServices<Tools[keyof Tools]> : ToolkitValue extends Effect.Yieldable<Toolkit.Toolkit<infer Tools>, Toolkit.WithHandler<infer _Tools>, infer _E, infer R> ? Tool.HandlerServices<Tools[keyof Tools]> | Tool.ResultDecodingServices<Tools[keyof Tools]> | R : never;
/**
 * Utility type that extracts the error type from LanguageModel options.
 *
 * Automatically infers the possible error types based on toolkit configuration
 * and tool call resolution settings.
 *
 * @since 4.0.0
 * @category utility types
 */
export type ExtractError<Options> = Options extends {
    readonly disableToolCallResolution: true;
    readonly toolkit: infer ToolkitValue;
} ? ExtractErrorFromToolkitOption<Exclude<ToolkitValue, undefined>, true> : Options extends {
    readonly toolkit: infer ToolkitValue;
} ? ExtractErrorFromToolkitOption<Exclude<ToolkitValue, undefined>, false> : Options extends {
    readonly disableToolCallResolution: true;
} ? AiError.AiError : AiError.AiError;
/**
 * Utility type that extracts the context requirements from LanguageModel options.
 *
 * Automatically infers the required services based on the toolkit configuration.
 *
 * @since 4.0.0
 * @category utility types
 */
export type ExtractServices<Options> = Options extends {
    readonly disableToolCallResolution: true;
} ? never : Options extends {
    readonly toolkit: infer Toolkit;
} ? ExtractServicesFromToolkitOption<Exclude<Toolkit, undefined>> : never;
/**
 * Configuration options passed along to language model provider
 * implementations.
 *
 * This interface defines the normalized options that are passed to the
 * underlying provider implementation, regardless of the specific provider being
 * used.
 *
 * @since 4.0.0
 * @category models
 */
export interface ProviderOptions {
    /**
     * The prompt messages to use to generate text.
     */
    readonly prompt: Prompt.Prompt;
    /**
     * The tools that the large language model will have available to provide
     * additional information which can be incorporated into its text generation.
     */
    readonly tools: ReadonlyArray<Tool.Any>;
    /**
     * The format which the response should be provided in.
     *
     * If `"text"` is specified, the large language model response will be
     * returned as text.
     *
     * If `"json"` is specified, the large language model respose will be provided
     * as an JSON object that conforms to the shape of the specified schema.
     *
     * Defaults to `{ type: "text" }`.
     */
    readonly responseFormat: {
        readonly type: "text";
    } | {
        readonly type: "json";
        readonly objectName: string;
        readonly schema: Schema.Top;
    };
    /**
     * The tool choice mode for the language model.
     * - `auto` (default): The model can decide whether or not to call tools, as
     *   well as which tools to call.
     * - `required`: The model **must** call a tool but can decide which tool will
     *   be called.
     * - `none`: The model **must not** call a tool.
     * - `{ tool: <tool_name> }`: The model must call the specified tool.
     * - `{ mode?: "auto" (default) | "required", "oneOf": [<tool-names>] }`: The
     *   model is restricted to the subset of tools specified by `oneOf`. When
     *   `mode` is `"auto"` or omitted, the model can decide whether or not a tool
     *   from the allowed subset of tools can be called. When `mode` is
     *   `"required"`, the model **must** call one tool from the allowed subset of
     *   tools.
     */
    readonly toolChoice: ToolChoice<any>;
    /**
     * The span to use to trace interactions with the large language model.
     */
    readonly span: Span;
    /**
     * The previous response identifier for incremental provider calls.
     */
    readonly previousResponseId: string | undefined;
    /**
     * The prompt reduced to messages not yet seen by the provider.
     */
    readonly incrementalPrompt: Prompt.Prompt | undefined;
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
export declare const make: (params: {
    /**
     * A method which requests text generation from the large language model
     * provider.
     *
     * The final result is returned when the large language model provider
     * finishes text generation.
     */
    readonly generateText: (options: ProviderOptions) => Effect.Effect<Array<Response.PartEncoded>, AiError.AiError, IdGenerator>;
    /**
     * A method which requests text generation from the large language model
     * provider.
     *
     * Intermediate results are streamed from the large language model provider.
     */
    readonly streamText: (options: ProviderOptions) => Stream.Stream<Response.StreamPartEncoded, AiError.AiError, IdGenerator>;
    /**
     * A function that transforms a `Schema.Codec` into a provider-compatible form
     * for structured output generation.
     */
    readonly codecTransformer?: CodecTransformer | undefined;
}) => Effect.Effect<Service>;
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
export declare const generateText: {
    <Options extends NoExcessProperties<GenerateTextOptionsWithoutToolkit, Options>>(options: Options & GenerateTextOptionsWithoutToolkit): Effect.Effect<GenerateTextResponse<{}>, ExtractError<Options>, LanguageModel | ExtractServices<Options>>;
    <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<GenerateTextOptions<Tools> & {
        readonly toolkit: ToolkitInput<Tools>;
    }, Options>>(options: Options & GenerateTextOptions<Tools> & {
        readonly toolkit: ToolkitInput<Tools>;
    }): Effect.Effect<GenerateTextResponse<Tools>, ExtractError<Options>, LanguageModel | ExtractServices<Options>>;
    <Options extends {
        readonly toolkit: ToolkitOption<any>;
    } & NoExcessProperties<GenerateTextOptions<any>, Options>>(options: Options & GenerateTextOptions<ExtractTools<Options>> & {
        readonly toolkit: Options["toolkit"];
    }): Effect.Effect<GenerateTextResponse<ExtractTools<Options>>, ExtractError<Options>, ExtractServices<Options> | LanguageModel>;
};
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
export declare const generateObject: <ObjectEncoded extends Record<string, any>, StructuredOutputSchema extends Schema.Encoder<ObjectEncoded, unknown>, Options extends NoExcessProperties<GenerateObjectOptions<any, StructuredOutputSchema>, Options>>(options: Options & GenerateObjectOptions<ExtractTools<Options>, StructuredOutputSchema>) => Effect.Effect<GenerateObjectResponse<ExtractTools<Options>, StructuredOutputSchema["Type"]>, ExtractError<Options>, ExtractServices<Options> | StructuredOutputSchema["DecodingServices"] | LanguageModel>;
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
export declare const streamText: {
    <Options extends NoExcessProperties<GenerateTextOptionsWithoutToolkit, Options>>(options: Options & GenerateTextOptionsWithoutToolkit): Stream.Stream<Response.StreamPart<{}>, ExtractError<Options>, ExtractServices<Options> | LanguageModel>;
    <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<GenerateTextOptions<Tools> & {
        readonly toolkit: ToolkitInput<Tools>;
    }, Options>>(options: Options & GenerateTextOptions<Tools> & {
        readonly toolkit: ToolkitInput<Tools>;
    }): Stream.Stream<Response.StreamPart<Tools>, ExtractError<Options>, ExtractServices<Options> | LanguageModel>;
    <Options extends {
        readonly toolkit: ToolkitOption<any>;
    } & NoExcessProperties<GenerateTextOptions<any>, Options>>(options: Options & GenerateTextOptions<ExtractTools<Options>> & {
        readonly toolkit: Options["toolkit"];
    }): Stream.Stream<Response.StreamPart<ExtractTools<Options>>, ExtractError<Options>, ExtractServices<Options> | LanguageModel>;
};
export {};
//# sourceMappingURL=LanguageModel.d.ts.map