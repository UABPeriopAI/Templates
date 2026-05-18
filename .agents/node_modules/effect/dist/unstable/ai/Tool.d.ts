/**
 * The `Tool` module provides functionality for defining and managing tools
 * that language models can call to augment their capabilities.
 *
 * This module enables creation of both user-defined and provider-defined tools,
 * with full schema validation, type safety, and handler support. Tools allow
 * AI models to perform actions like searching databases, calling APIs, or
 * executing code within your application context.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Define a simple calculator tool
 * const Calculator = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 * ```
 *
 * @since 1.0.0
 */
import * as Context from "../../Context.ts";
import type * as Effect from "../../Effect.ts";
import type * as JsonSchema from "../../JsonSchema.ts";
import * as Schema from "../../Schema.ts";
import type * as Struct from "../../Struct.ts";
import type * as Types from "../../Types.ts";
import type * as AiError from "./AiError.ts";
import type { CodecTransformer } from "./LanguageModel.ts";
import type * as Prompt from "./Prompt.ts";
/**
 * @since 1.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 1.0.0
 * @category type ids
 */
export type TypeId = "~effect/ai/Tool";
/**
 * @since 1.0.0
 * @category type ids
 */
export declare const ProviderDefinedTypeId: ProviderDefinedTypeId;
/**
 * @since 1.0.0
 * @category type ids
 */
export type ProviderDefinedTypeId = "~effect/ai/Tool/ProviderDefined";
/**
 * @since 1.0.0
 * @category type ids
 */
export declare const DynamicTypeId: DynamicTypeId;
/**
 * @since 1.0.0
 * @category type ids
 */
export type DynamicTypeId = "~effect/ai/Tool/Dynamic";
/**
 * The strategy used for handling errors returned from tool call handler
 * execution.
 *
 * If set to `"error"` (the default), errors that occur during tool call handler
 * execution will be returned in the error channel of the calling effect.
 *
 * If set to `"return"`, errors that occur during tool call handler execution
 * will be captured and returned as part of the tool call result.
 *
 * @since 1.0.0
 * @category models
 */
export type FailureMode = "error" | "return";
/**
 * Context provided to the `needsApproval` function when dynamically
 * determining if a tool requires user approval.
 *
 * @since 1.0.0
 * @category models
 */
export interface NeedsApprovalContext {
    /**
     * The unique identifier of the tool call.
     */
    readonly toolCallId: string;
    /**
     * The conversation messages leading up to this tool call.
     */
    readonly messages: ReadonlyArray<Prompt.Message>;
}
/**
 * Function type for dynamically determining if a tool requires approval.
 *
 * @since 1.0.0
 * @category models
 */
export type NeedsApprovalFunction<Params extends Schema.Top> = (params: Params["Type"], context: NeedsApprovalContext) => boolean | Effect.Effect<boolean>;
/**
 * Specifies whether user approval is required before executing a tool.
 *
 * Can be:
 * - `boolean`: Static approval requirement
 * - `NeedsApprovalFunction`: Dynamic approval based on parameters/context
 *
 * @since 1.0.0
 * @category models
 */
export type NeedsApproval<Params extends Schema.Top> = boolean | NeedsApprovalFunction<Params>;
/**
 * A user-defined tool that language models can call to perform actions.
 *
 * Tools represent actionable capabilities that large language models can invoke
 * to extend their functionality beyond text generation. Each tool has a defined
 * schema for parameters, results, and failures.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Create a weather lookup tool
 * const GetWeather = Tool.make("GetWeather", {
 *   description: "Get current weather for a location",
 *   parameters: Schema.Struct({
 *     location: Schema.String,
 *     units: Schema.Literals(["celsius", "fahrenheit"])
 *   }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String,
 *     humidity: Schema.Number
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category models
 */
export interface Tool<out Name extends string, out Config extends {
    readonly parameters: Schema.Top;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, out Requirements = never> {
    readonly [TypeId]: {
        readonly _Requirements: Types.Covariant<Requirements>;
    };
    /**
     * The tool identifier which is used to uniquely identify the tool.
     */
    readonly id: string;
    /**
     * The name of the tool.
     */
    readonly name: Name;
    /**
     * The optional description of the tool.
     */
    readonly description?: string | undefined;
    /**
     * The strategy used for handling errors returned from tool call handler
     * execution.
     *
     * If set to `"error"` (the default), errors that occur during tool call
     * handler execution will be returned in the error channel of the calling
     * effect.
     *
     * If set to `"return"`, errors that occur during tool call handler execution
     * will be captured and returned as part of the tool call result.
     */
    readonly failureMode: FailureMode;
    /**
     * A `Schema` representing the parameters that a tool must be called with.
     */
    readonly parametersSchema: Config["parameters"];
    /**
     * A `Schema` representing the value that a tool must return when called if
     * the tool call is successful.
     */
    readonly successSchema: Config["success"];
    /**
     * A `Schema` representing the value that a tool must return when called if
     * it fails.
     */
    readonly failureSchema: Config["failure"];
    /**
     * A `Context` containing tool annotations which can store metadata about
     * the tool.
     */
    readonly annotations: Context.Context<never>;
    /**
     * Specifies whether user approval is required before executing this tool.
     *
     * - If `undefined` or `false`, the tool executes immediately.
     * - If `true`, the tool always requires approval.
     * - If a function, it is called with the tool parameters and context to
     *   dynamically determine if approval is needed. The function can return
     *   a boolean or an Effect that resolves to a boolean.
     */
    readonly needsApproval?: boolean | NeedsApprovalFunction<any> | undefined;
    /**
     * Adds a _request-level_ dependency which must be provided before the tool
     * call handler can be executed.
     *
     * This can be useful when you want to enforce that a particular dependency
     * **MUST** be provided to each request to the large language model provider
     * instead of being provided when creating the tool call handler layer.
     */
    addDependency<Identifier, Service>(tag: Context.Key<Identifier, Service>): Tool<Name, Config, Identifier | Requirements>;
    /**
     * Set the schema to use to validate the result of a tool call when successful.
     */
    setSuccess<SuccessSchema extends Schema.Top>(schema: SuccessSchema): Tool<Name, {
        readonly parameters: Config["parameters"];
        readonly success: SuccessSchema;
        readonly failure: Config["failure"];
        readonly failureMode: Config["failureMode"];
    }, Requirements>;
    /**
     * Set the schema to use to validate the result of a tool call when it fails.
     */
    setFailure<FailureSchema extends Schema.Top>(schema: FailureSchema): Tool<Name, {
        readonly parameters: Config["parameters"];
        readonly success: Config["success"];
        readonly failure: FailureSchema;
        readonly failureMode: Config["failureMode"];
    }, Requirements>;
    /**
     * Set the schema to use to validate the parameters of a tool call.
     */
    setParameters<ParametersSchema extends Schema.Top>(schema: ParametersSchema): Tool<Name, {
        readonly parameters: ParametersSchema;
        readonly success: Config["success"];
        readonly failure: Config["failure"];
        readonly failureMode: Config["failureMode"];
    }, Requirements>;
    /**
     * Add an annotation to the tool.
     */
    annotate<I, S>(tag: Context.Key<I, S>, value: S): Tool<Name, Config, Requirements>;
    /**
     * Add many annotations to the tool.
     */
    annotateMerge<I>(context: Context.Context<I>): Tool<Name, Config, Requirements>;
}
/**
 * A provider-defined tool is a tool which is built into a large language model
 * provider (e.g. web search, code execution).
 *
 * These tools are executed by the large language model provider rather than
 * by your application. However, they can optionally require custom handlers
 * implemented in your application to process provider generated results.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Define a web search tool provided by OpenAI
 * const WebSearch = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category models
 */
export interface ProviderDefined<out Identifier extends `${string}.${string}`, out Name extends string, out Config extends {
    readonly args: Schema.Top;
    readonly parameters: Schema.Top;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, out RequiresHandler extends boolean = false> extends Tool<Name, {
    readonly parameters: Config["parameters"];
    readonly success: Config["success"];
    readonly failure: Config["failure"];
    readonly failureMode: Config["failureMode"];
}> {
    readonly [ProviderDefinedTypeId]: typeof ProviderDefinedTypeId;
    /**
     * the identifier which is used to uniquely identify the provider-defined tool.
     */
    readonly id: Identifier;
    /**
     * The arguments passed to the provider-defined tool.
     */
    readonly args: Config["args"]["Encoded"];
    /**
     * A `Schema` representing the arguments provided by the end-user which will
     * be used to configure the behavior of the provider-defined tool.
     */
    readonly argsSchema: Config["args"];
    /**
     * Name of the tool as recognized by the large language model provider.
     */
    readonly providerName: string;
    /**
     * If set to `true`, this provider-defined tool will require a user-defined
     * tool call handler to be provided when converting the `Toolkit` containing
     * this tool into a `Layer`.
     */
    readonly requiresHandler: RequiresHandler;
}
/**
 * A dynamic tool is a tool where the schema may not be known at compile time.
 *
 * Dynamic tools support two modes:
 * - **Effect Schema mode**: Full type safety with validation (like `Tool.make`)
 * - **JSON Schema mode**: Raw JSON Schema for the model, handler receives `unknown`
 *
 * This enables scenarios such as MCP tools discovered at runtime, user-defined
 * functions loaded from external sources, or plugin systems.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Dynamic tool with Effect Schema (typed)
 * const Calculator = Tool.dynamic("Calculator", {
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * // Dynamic tool with JSON Schema (untyped parameters)
 * const McpTool = Tool.dynamic("McpTool", {
 *   description: "Tool from MCP server",
 *   parameters: {
 *     type: "object",
 *     properties: { query: { type: "string" } },
 *     required: ["query"]
 *   }
 * })
 * ```
 *
 * @since 1.0.0
 * @category models
 */
export interface Dynamic<out Name extends string, out Config extends {
    readonly parameters: Schema.Top | JsonSchema.JsonSchema;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, out Requirements = never> extends Tool<Name, {
    readonly parameters: Config["parameters"] extends Schema.Top ? Config["parameters"] : typeof Schema.Unknown;
    readonly success: Config["success"];
    readonly failure: Config["failure"];
    readonly failureMode: Config["failureMode"];
}, Requirements> {
    readonly [DynamicTypeId]: typeof DynamicTypeId;
    /**
     * The raw JSON Schema for parameters. Present when `parameters` was provided
     * as a JSON Schema, `undefined` when an Effect Schema was used.
     */
    readonly jsonSchema: Config["parameters"] extends Schema.Top ? undefined : JsonSchema.JsonSchema;
}
/**
 * Type guard to check if a value is a user-defined tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * const ProviderDefinedTool = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 *
 * console.log(Tool.isUserDefined(UserDefinedTool)) // true
 * console.log(Tool.isUserDefined(ProviderDefinedTool)) // false
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export declare const isUserDefined: (u: unknown) => u is Tool<string, any, any>;
/**
 * Type guard to check if a value is a provider-defined tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * const ProviderDefinedTool = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 *
 * console.log(Tool.isUserDefined(UserDefinedTool)) // false
 * console.log(Tool.isUserDefined(ProviderDefinedTool)) // true
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export declare const isProviderDefined: (u: unknown) => u is ProviderDefined<`${string}.${string}`, string, any>;
/**
 * Type guard to check if a value is a dynamic tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const DynamicTool = Tool.dynamic("DynamicTool", {
 *   parameters: { type: "object", properties: {} }
 * })
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   parameters: Schema.Struct({ a: Schema.Number, b: Schema.Number }),
 *   success: Schema.Number
 * })
 *
 * console.log(Tool.isDynamic(DynamicTool)) // true
 * console.log(Tool.isDynamic(UserDefinedTool)) // false
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export declare const isDynamic: (u: unknown) => u is Dynamic<string, any>;
/**
 * A type which represents any `Tool`.
 *
 * @since 1.0.0
 * @category utility types
 */
export interface Any extends Tool<any, {
    readonly parameters: Schema.Top;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, any> {
}
/**
 * A type which represents any provider-defined `Tool`.
 *
 * @since 1.0.0
 * @category utility types
 */
export interface AnyProviderDefined extends ProviderDefined<any, any, {
    readonly args: Schema.Top;
    readonly parameters: Schema.Top;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, any> {
}
/**
 * A type which represents any dynamic `Tool`.
 *
 * @since 1.0.0
 * @category utility types
 */
export interface AnyDynamic extends Dynamic<any, {
    readonly parameters: Schema.Top | JsonSchema.JsonSchema;
    readonly success: Schema.Top;
    readonly failure: Schema.Top;
    readonly failureMode: FailureMode;
}, any> {
}
/**
 * A utility type to extract the `Name` type from an `Tool`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Name<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Name : never;
/**
 * A utility type to extract the type of the tool call parameters.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Parameters<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["parameters"]["Type"] : never;
/**
 * A utility type to extract the encoded type of the tool call parameters.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ParametersEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["parameters"]["Encoded"] : never;
/**
 * A utility type to extract the schema for the parameters which an `Tool`
 * must be called with.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ParametersSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["parameters"] : never;
/**
 * A utility type to extract the type of the tool call result when it succeeds.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Success<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"]["Type"] : never;
/**
 * A utility type to extract the encoded type of the tool call result when
 * it succeeds.
 *
 * @since 1.0.0
 * @category utility types
 */
export type SuccessEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"]["Encoded"] : never;
/**
 * A utility type to extract the schema for the return type of a tool call when
 * the tool call succeeds.
 *
 * @since 1.0.0
 * @category utility types
 */
export type SuccessSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"] : never;
/**
 * A utility type to extract the type of the tool call result when it fails.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Failure<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failure"]["Type"] : never;
/**
 * A utility type to extract the encoded type of the tool call result when
 * it fails.
 *
 * @since 1.0.0
 * @category utility types
 */
export type FailureEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failure"]["Encoded"] : never;
/**
 * A utility type for the actual failure value that can appear in tool results.
 * When `failureMode` is `"return"`, this includes both user-defined failures
 * and `AiError`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type FailureResult<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] extends "return" ? _Config["failure"]["Type"] | AiError.AiError : _Config["failure"]["Type"] : never;
/**
 * The encoded version of `FailureResult`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type FailureResultEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] extends "return" ? _Config["failure"]["Encoded"] | AiError.AiErrorEncoded : _Config["failure"]["Encoded"] : never;
/**
 * A utility type to extract the type of the tool call result whether it
 * succeeds or fails.
 *
 * When `failureMode` is `"return"`, the result may also be an `AiError`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Result<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] extends "return" ? Success<T> | Failure<T> | AiError.AiError : Success<T> | Failure<T> : never;
/**
 * A utility type to extract the encoded type of the tool call result whether
 * it succeeds or fails.
 *
 * When `failureMode` is `"return"`, the result may also be an encoded `AiError`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ResultEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] extends "return" ? SuccessEncoded<T> | FailureEncoded<T> | AiError.AiErrorEncoded : SuccessEncoded<T> | FailureEncoded<T> : never;
/**
 * A utility type to extract the requirements of a `Tool` call handler.
 *
 * @since 1.0.0
 * @category utility types
 */
export type HandlerServices<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["parameters"]["DecodingServices"] | ResultEncodingServices<T> | _Requirements : never;
/**
 * A utility type to extract the requirements needed to encode the result of
 * a `Tool` call.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ResultEncodingServices<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"]["EncodingServices"] | _Config["failure"]["EncodingServices"] : never;
/**
 * A utility type to extract the requirements needed to decode the result of
 * a `Tool` call.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ResultDecodingServices<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"]["DecodingServices"] | _Config["failure"]["DecodingServices"] : never;
/**
 * Represents an `Tool` that has been implemented within the application.
 *
 * @since 1.0.0
 * @category models
 */
export interface Handler<Name extends string> {
    readonly _: unique symbol;
    readonly name: Name;
    readonly context: Context.Context<never>;
    readonly handler: (params: any, ctx: any) => Effect.Effect<any, any>;
}
/**
 * Represents the result of calling the handler for a particular `Tool`.
 *
 * @since 1.0.0
 * @category models
 */
export interface HandlerResult<Tool extends Any> {
    /**
     * The result of executing the handler for a particular tool.
     */
    readonly result: Result<Tool>;
    /**
     * The pre-encoded tool call result of executing the handler for a particular
     * tool as a JSON-serializable value. The encoded result can be incorporated
     * into subsequent requests to the large language model.
     */
    readonly encodedResult: unknown;
    /**
     * Whether the result of executing the tool call handler was an error or not.
     */
    readonly isFailure: boolean;
    /**
     * Whether this is a preliminary (intermediate) result or the final result.
     * Preliminary results represent progress updates; only the final result
     * should be used as the authoritative output.
     */
    readonly preliminary: boolean;
}
/**
 * Tagged union for incremental handler output.
 *
 * When a tool handler returns a `Stream`, each emitted value is tagged as
 * either:
 * - `Preliminary`: An intermediate result representing progress
 * - `Final`: The last result, which is the authoritative output
 *
 * @since 1.0.0
 * @category models
 */
export type HandlerOutput<Success> = {
    readonly _tag: "Preliminary";
    readonly value: Success;
} | {
    readonly _tag: "Final";
    readonly value: Success;
};
/**
 * A utility type which represents the possible errors that can be raised by
 * a tool call's handler.
 *
 * @since 1.0.0
 * @category utility types
 */
export type HandlerError<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] extends "error" ? _Config["failure"]["Type"] | AiError.AiError : never : never;
/**
 * A utility type to create a union of `Handler` types for all tools in a
 * record.
 *
 * @since 1.0.0
 * @category utility types
 */
export type HandlersFor<Tools extends Record<string, Any>> = {
    [Name in keyof Tools]: RequiresHandler<Tools[Name]> extends true ? Handler<Tools[Name]["name"]> : never;
}[keyof Tools];
/**
 * A utility type to determine if the specified tool requires a user-defined
 * handler to be implemented.
 *
 * @since 1.0.0
 * @category utility types
 */
export type RequiresHandler<Tool extends Any> = Tool extends ProviderDefined<infer _Name, infer _Config, infer _RequiresHandler> ? _RequiresHandler : true;
/**
 * Creates a user-defined tool with the specified name and configuration.
 *
 * This is the primary constructor for creating custom tools that AI models
 * can call. The tool definition includes parameter validation, success/failure
 * schemas, and optional service dependencies.
 *
 * If a tool accepts no parameters but still needs an explicit empty object
 * schema, use {@link EmptyParams}.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Simple tool with no parameters
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Returns the current timestamp",
 *   success: Schema.Number
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const make: <const Name extends string, Parameters extends Schema.Top = typeof EmptyParams, Success extends Schema.Top = typeof Schema.Void, Failure extends Schema.Top = typeof Schema.Never, Mode extends FailureMode | undefined = undefined, Dependencies extends Array<Context.Key<any, any> | Context.Key<never, any>> = []>(name: Name, options?: {
    /**
     * An optional description explaining what the tool does.
     */
    readonly description?: string | undefined;
    /**
     * Schema defining the parameters this tool accepts.
     */
    readonly parameters?: Parameters | undefined;
    /**
     * Schema for successful tool execution results.
     */
    readonly success?: Success | undefined;
    /**
     * Schema for tool execution failures.
     */
    readonly failure?: Failure | undefined;
    /**
     * The strategy used for handling errors returned from tool call handler
     * execution.
     *
     * If set to `"error"` (the default), errors that occur during tool call handler
     * execution will be returned in the error channel of the calling effect.
     *
     * If set to `"return"`, errors that occur during tool call handler execution
     * will be captured and returned as part of the tool call result.
     */
    readonly failureMode?: Mode;
    /**
     * Service dependencies required by the tool handler.
     */
    readonly dependencies?: Dependencies | undefined;
    /**
     * Specifies whether user approval is required before executing this tool.
     *
     * - If `undefined` or `false`, the tool executes immediately.
     * - If `true`, the tool always requires approval.
     * - If a function, it is called with the tool parameters and context to
     *   dynamically determine if approval is needed.
     */
    readonly needsApproval?: NeedsApproval<Parameters> | undefined;
}) => Tool<Name, {
    readonly parameters: Parameters;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
}, Context.Service.Identifier<Dependencies[number]>>;
/**
 * Creates a dynamic tool that can accept either an Effect Schema or a raw
 * JSON Schema for its parameters.
 *
 * This is useful for tools where the schema isn't known at compile time,
 * such as MCP tools discovered at runtime or tools from external configurations.
 *
 * - When `parameters` is an Effect Schema: full type safety with validation
 * - When `parameters` is a JSON Schema: handler receives `unknown`, no validation
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // With Effect Schema (typed parameters)
 * const Calculator = Tool.dynamic("Calculator", {
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * // With JSON Schema (untyped parameters)
 * const McpTool = Tool.dynamic("McpTool", {
 *   description: "Tool from MCP server",
 *   parameters: {
 *     type: "object",
 *     properties: { query: { type: "string" } },
 *     required: ["query"]
 *   }
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const dynamic: {
    /**
     * Creates a dynamic tool that can accept either an Effect Schema or a raw
     * JSON Schema for its parameters.
     *
     * This is useful for tools where the schema isn't known at compile time,
     * such as MCP tools discovered at runtime or tools from external configurations.
     *
     * - When `parameters` is an Effect Schema: full type safety with validation
     * - When `parameters` is a JSON Schema: handler receives `unknown`, no validation
     *
     * @example
     * ```ts
     * import { Schema } from "effect"
     * import { Tool } from "effect/unstable/ai"
     *
     * // With Effect Schema (typed parameters)
     * const Calculator = Tool.dynamic("Calculator", {
     *   parameters: Schema.Struct({
     *     operation: Schema.Literals(["add", "subtract"]),
     *     a: Schema.Number,
     *     b: Schema.Number
     *   }),
     *   success: Schema.Number
     * })
     *
     * // With JSON Schema (untyped parameters)
     * const McpTool = Tool.dynamic("McpTool", {
     *   description: "Tool from MCP server",
     *   parameters: {
     *     type: "object",
     *     properties: { query: { type: "string" } },
     *     required: ["query"]
     *   }
     * })
     * ```
     *
     * @since 1.0.0
     * @category constructors
     */
    <const Name extends string, const Options extends {
        readonly description?: string | undefined;
        readonly parameters?: Schema.Top | JsonSchema.JsonSchema | undefined;
        readonly success?: Schema.Top | undefined;
        readonly failure?: Schema.Top | undefined;
        readonly failureMode?: FailureMode | undefined;
        readonly needsApproval?: NeedsApproval<any> | undefined;
    }>(name: Name, options?: Options): Dynamic<Name, {
        readonly parameters: Options extends {
            readonly parameters: infer P;
        } ? P extends Schema.Top ? P : P extends JsonSchema.JsonSchema ? P : typeof Schema.Unknown : typeof Schema.Unknown;
        readonly success: Options extends {
            readonly success: infer S extends Schema.Top;
        } ? S : typeof Schema.Unknown;
        readonly failure: Options extends {
            readonly failure: infer F extends Schema.Top;
        } ? F : typeof Schema.Never;
        readonly failureMode: Options extends {
            readonly failureMode: infer M extends FailureMode;
        } ? M : "error";
    }>;
};
/**
 * Creates a provider-defined tool which leverages functionality built into a
 * large language model provider (e.g. web search, code execution).
 *
 * These tools are executed by the large language model provider rather than
 * by your application. However, they can optionally require custom handlers
 * implemented in your application to process provider generated results.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Web search tool provided by OpenAI
 * const WebSearch = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       content: Schema.String
 *     }))
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const providerDefined: <const Identifier extends `${string}.${string}`, const Name extends string, Args extends Schema.Top = typeof Schema.Void, Parameters extends Schema.Top = typeof Schema.Void, Success extends Schema.Top = typeof Schema.Void, Failure extends Schema.Top = typeof Schema.Never, RequiresHandler extends boolean = false>(options: {
    /**
     * the identifier which is used to uniquely identify the provider-defined tool.
     */
    readonly id: Identifier;
    /**
     * Custom name used by the Toolkit to identify this tool.
     */
    readonly customName: Name;
    /**
     * Provider-specific name given to the tool by the large language model provider.
     */
    readonly providerName: string;
    /**
     * Schema for user-provided configuration arguments.
     */
    readonly args?: Args | undefined;
    /**
     * Whether this tool requires a custom handler implementation.
     */
    readonly requiresHandler?: RequiresHandler | undefined;
    /**
     * Schema for parameters the provider sends when calling the tool.
     */
    readonly parameters?: Parameters | undefined;
    /**
     * Schema for successful tool execution results.
     */
    readonly success?: Success | undefined;
    /**
     * Schema for failed tool execution results.
     */
    readonly failure?: Failure | undefined;
}) => <Mode extends FailureMode | undefined = undefined>(args: RequiresHandler extends true ? Struct.Simplify<Args["Encoded"] & {
    /**
     * The strategy used for handling errors returned from tool call handler
     * execution.
     *
     * If set to `"error"` (the default), errors that occur during tool call handler
     * execution will be returned in the error channel of the calling effect.
     *
     * If set to `"return"`, errors that occur during tool call handler execution
     * will be captured and returned as part of the tool call result.
     */
    readonly failureMode?: Mode | undefined;
}> : Struct.Simplify<Args["Encoded"]>) => ProviderDefined<Identifier, Name, {
    readonly args: Args;
    readonly parameters: Parameters;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
}, RequiresHandler>;
/**
 * A utility which allows mapping between a provider-defined name for a tool
 * and the name given to the tool by the Effect AI SDK.
 *
 * The custom names used by the Effect AI SDK are to allow for toolkits which
 * contain tools from multiple different providers that would otherwise have
 * naming conflicts (i.e. `"web_search"`) to instead use custom names (i.e.
 * `"OpenAiWebSearch"`).
 *
 * @since 1.0.0
 * @category utilities
 */
export declare class NameMapper<Tools extends ReadonlyArray<Any>> {
    #private;
    constructor(tools: Tools);
    /**
     * Returns a list of the user-specified tool names in the name mapper.
     */
    get customNames(): ReadonlyArray<string>;
    /**
     * Returns a list of the provider-specified tool names in the name mapper.
     */
    get providerNames(): ReadonlyArray<string>;
    /**
     * Returns the user-specified tool name that corresponds with the provided
     * provider-specified tool name.
     *
     * If the provider-specified tool name was not registered with the name mapper,
     * then the provider-specified tool name is returned.
     */
    getCustomName(providerName: string): string;
    /**
     * Returns the provider-specified tool name that corresponds with the provided
     * user-specified tool name.
     *
     * If the user-specified tool name was not registered with the name mapper,
     * then the user-specified tool name is returned.
     */
    getProviderName(customName: string): string;
}
/**
 * Extracts the description from a tool's metadata.
 *
 * Returns the tool's description if explicitly set, otherwise attempts to
 * extract it from the parameter schema's AST annotations.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myTool = Tool.make("example", {
 *   description: "This is an example tool"
 * })
 *
 * const description = Tool.getDescription(myTool)
 * console.log(description) // "This is an example tool"
 * ```
 *
 * @since 1.0.0
 * @category utilities
 */
export declare const getDescription: <Tool extends Any>(tool: Tool) => string | undefined;
/**
 * Generates a JSON Schema for a tool.
 *
 * This function creates a JSON Schema representation that can be used by
 * large language models to indicate the structure and type of the parameters
 * that a given tool call should receive.
 *
 * May accept an optional `CodecTransformer` which can be used to transform the
 * tool parameter schema so that the resultant JSON schema for the tool call
 * parameters are in a format that conforms to any provider-specific constraints.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const weatherTool = Tool.make("get_weather", {
 *   parameters: Schema.Struct({
 *     location: Schema.String,
 *     units: Schema.Literals(["celsius", "fahrenheit"])
 *   })
 * })
 *
 * const jsonSchema = Tool.getJsonSchema(weatherTool)
 * console.log(jsonSchema)
 * // {
 * //   type: "object",
 * //   properties: {
 * //     location: { type: "string" },
 * //     units: { type: "string", enum: ["celsius", "fahrenheit"] }
 * //   },
 * //   required: ["location", "units"]
 * // }
 * ```
 *
 * @since 1.0.0
 * @category utilities
 */
export declare const getJsonSchema: <Tool extends Any>(tool: Tool, options?: {
    readonly transformer?: CodecTransformer;
}) => JsonSchema.JsonSchema;
/**
 * @since 1.0.0
 * @category utilities
 */
export declare const getJsonSchemaFromSchema: <S extends Schema.Top>(schema: S, options?: {
    readonly transformer?: CodecTransformer;
}) => JsonSchema.JsonSchema;
declare const Title_base: Context.ServiceClass<Title, "effect/ai/Tool/Title", string>;
/**
 * Annotation for providing a human-readable title for tools.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myTool = Tool.make("calculate_tip")
 *   .annotate(Tool.Title, "Tip Calculator")
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare class Title extends Title_base {
}
declare const Meta_base: Context.ServiceClass<Meta, "effect/ai/Tool/Meta", Record<string, unknown>>;
/**
 * Annotation for providing tool metadata for MCP.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myCalculatorUi = Tool.make("calculator_ui", {})
 *   .annotate(Tool.Meta, { ui: { resourceUri: "ui://example/calculator-ui" } })
 * ```
 * @since 1.0.0
 * @category annotations
 */
export declare class Meta extends Meta_base {
}
/**
 * Annotation indicating whether a tool only reads data without making changes.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const readOnlyTool = Tool.make("get_user_info")
 *   .annotate(Tool.Readonly, true)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare const Readonly: Context.Reference<boolean>;
/**
 * Annotation indicating whether a tool performs destructive operations.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const safeTool = Tool.make("search_database")
 *   .annotate(Tool.Destructive, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare const Destructive: Context.Reference<boolean>;
/**
 * Annotation indicating whether a tool can be called multiple times safely.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const idempotentTool = Tool.make("get_current_time")
 *   .annotate(Tool.Idempotent, true)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare const Idempotent: Context.Reference<boolean>;
/**
 * Annotation indicating whether a tool can handle arbitrary external data.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const restrictedTool = Tool.make("internal_operation")
 *   .annotate(Tool.OpenWorld, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare const OpenWorld: Context.Reference<boolean>;
/**
 * Annotation controlling whether strict JSON schema mode is enabled for a tool.
 *
 * When `true`, providers that support strict mode will send `strict: true` to
 * the model API (e.g. OpenAI's Structured Outputs).
 *
 * When `false`, strict mode is disabled and `strict: false` is sent.
 *
 * When `undefined` (default), the provider's global configuration determines
 * the behavior (e.g. `Config.strictJsonSchema` for OpenAI).
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const flexibleTool = Tool.make("search")
 *   .annotate(Tool.Strict, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export declare const Strict: Context.Reference<boolean | undefined>;
/**
 * Returns the strict mode setting for a tool, or `undefined` if not set.
 *
 * @since 1.0.0
 * @category utilities
 */
export declare const getStrictMode: <T extends Any>(tool: T) => boolean | undefined;
/**
 * **Unsafe**: This function will throw an error if an insecure property is
 * found in the parsed JSON or if the provided JSON text is not parseable.
 *
 * @since 1.0.0
 * @category utilities
 */
export declare const unsafeSecureJsonParse: (text: string) => unknown;
/**
 * @since 4.0.0
 */
export interface EmptyParams extends Schema.$Record<Schema.String, Schema.Never> {
}
/**
 * A schema for tools that accept no parameters.
 *
 * @since 4.0.0
 */
export declare const EmptyParams: EmptyParams;
export {};
//# sourceMappingURL=Tool.d.ts.map