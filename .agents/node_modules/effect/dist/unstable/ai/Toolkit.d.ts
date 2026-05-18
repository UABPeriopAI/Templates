import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type { Inspectable } from "../../Inspectable.ts";
import * as Layer from "../../Layer.ts";
import type { Pipeable } from "../../Pipeable.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as AiError from "./AiError.ts";
import type * as Tool from "./Tool.ts";
declare const TypeId: "~effect/ai/Toolkit";
/**
 * Represents a collection of tools which can be used to enhance the
 * capabilities of a large language model.
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * // Create individual tools
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: Schema.Number
 * })
 *
 * const GetWeather = Tool.make("GetWeather", {
 *   description: "Get weather for a location",
 *   parameters: Schema.Struct({ location: Schema.String }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String
 *   })
 * })
 *
 * // Create a toolkit with multiple tools
 * const MyToolkit = Toolkit.make(GetCurrentTime, GetWeather)
 *
 * const MyToolkitLayer = MyToolkit.toLayer({
 *   GetCurrentTime: () => Effect.succeed(Date.now()),
 *   GetWeather: ({ location }) =>
 *     Effect.succeed({
 *       temperature: 72,
 *       condition: "sunny"
 *     })
 * })
 * ```
 *
 * @since 1.0.0
 * @category models
 */
export interface Toolkit<in out Tools extends Record<string, Tool.Any>> extends Effect.Yieldable<Toolkit<Tools>, WithHandler<Tools>, never, Tool.HandlersFor<Tools>>, Inspectable, Pipeable {
    new (_: never): {};
    readonly [TypeId]: typeof TypeId;
    /**
     * A record containing all tools in this toolkit.
     */
    readonly tools: Tools;
    /**
     * A helper method which can be used for type-safe handler declarations.
     */
    of<Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers;
    /**
     * Converts a toolkit into a `Context` containing handlers for each tool
     * in the toolkit.
     */
    toHandlers<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(build: Handlers | Effect.Effect<Handlers, EX, RX>): Effect.Effect<Context.Context<Tool.HandlersFor<Tools>>, EX, RX>;
    /**
     * Converts a toolkit into a `Layer` containing handlers for each tool in the
     * toolkit.
     */
    toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    /**
     * Handler functions or Effect that produces handlers.
     */
    build: Handlers | Effect.Effect<Handlers, EX, RX>): Layer.Layer<Tool.HandlersFor<Tools>, EX, Exclude<RX, Scope.Scope>>;
}
/**
 * Context provided to tool handlers during execution.
 *
 * @since 1.0.0
 * @category models
 */
export interface HandlerContext<Tool extends Tool.Any> {
    /**
     * Emit a preliminary result during long-running tool calls.
     *
     * Preliminary results are streamed to the caller before the handler completes,
     * enabling real-time progress updates for lengthy operations.
     */
    readonly preliminary: (result: Tool.Success<Tool>) => Effect.Effect<void>;
}
/**
 * Represents any `Toolkit` instance, used for generic constraints.
 *
 * @since 1.0.0
 * @category utility types
 */
export interface Any {
    readonly [TypeId]: typeof TypeId;
    readonly tools: Record<string, Tool.Any>;
}
/**
 * A utility type which can be used to extract the tool definitions from a
 * toolkit.
 *
 * @since 1.0.0
 * @category utility types
 */
export type Tools<T> = T extends Toolkit<infer Tools> ? Tools : never;
/**
 * A utility type which transforms either a record or an array of tools into
 * a record where keys are tool names and values are the tool instances.
 *
 * @since 1.0.0
 * @category utility types
 */
export type ToolsByName<Tools> = Tools extends Record<string, Tool.Any> ? {
    readonly [Name in keyof Tools]: Tools[Name];
} : Tools extends ReadonlyArray<Tool.Any> ? {
    readonly [Tool in Tools[number] as Tool["name"]]: Tool;
} : never;
/**
 * A utility type that maps tool names to their required handler functions.
 *
 * Handlers can return either the tool's custom failure type, an `AiErrorReason`
 * (which will be wrapped in `AiError`), or a full `AiError`.
 *
 * @since 1.0.0
 * @category utility types
 */
export type HandlersFrom<Tools extends Record<string, Tool.Any>> = {
    readonly [Name in keyof Tools as Tool.RequiresHandler<Tools[Name]> extends true ? Name : never]: (params: Tool.Parameters<Tools[Name]>, context: HandlerContext<Tools[Name]>) => Effect.Effect<Tool.Success<Tools[Name]>, Tool.Failure<Tools[Name]> | AiError.AiError | AiError.AiErrorReason, Tool.HandlerServices<Tools[Name]>>;
};
/**
 * A toolkit instance with registered handlers ready for tool execution.
 *
 * @since 1.0.0
 * @category models
 */
export interface WithHandler<in out Tools extends Record<string, Tool.Any>> {
    /**
     * The tools available in this toolkit instance.
     */
    readonly tools: Tools;
    /**
     * Executes a tool call by name.
     *
     * Validates the input parameters, executes the corresponding handler, and
     * streams back both the typed result and encoded result. Streaming allows
     * handlers to emit preliminary results before completion.
     */
    readonly handle: <Name extends keyof Tools>(
    /**
     * The name of the tool to execute.
     */
    name: Name, 
    /**
     * Parameters to pass to the tool handler.
     */
    params: Tool.Parameters<Tools[Name]>) => Effect.Effect<Stream.Stream<Tool.HandlerResult<Tools[Name]>, Tool.HandlerError<Tools[Name]>, Tool.HandlerServices<Tools[Name]>>, AiError.AiError>;
}
/**
 * A utility type which can be used to extract the tools from a toolkit with
 * handlers.
 *
 * @since 1.0.0
 * @category utility types
 */
export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never;
/**
 * An empty toolkit with no tools.
 *
 * Useful as a starting point for building toolkits or as a default value. Can
 * be extended using the merge function to add tools.
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const empty: Toolkit<{}>;
/**
 * Creates a new toolkit from the specified tools.
 *
 * This is the primary constructor for creating toolkits. It accepts multiple
 * tools and organizes them into a toolkit that can be provided to AI language
 * models.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: Schema.Number
 * })
 *
 * const GetWeather = Tool.make("get_weather", {
 *   description: "Get weather information",
 *   parameters: Schema.Struct({ location: Schema.String }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String
 *   })
 * })
 *
 * const toolkit = Toolkit.make(GetCurrentTime, GetWeather)
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const make: <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools) => Toolkit<ToolsByName<Tools>>;
/**
 * A utility type which flattens a record type for improved IDE display.
 *
 * @since 1.0.0
 * @category utility types
 */
export type SimplifyRecord<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * A utility type which merges a union of tool records into a single record.
 *
 * @since 1.0.0
 * @category utility types
 */
export type MergeRecords<U> = {
    readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<U extends Record<K, infer V> ? V : never, Tool.Any>;
};
/**
 * A utility type which merges the tools from multiple toolkits into a single
 * record.
 *
 * @since 1.0.0
 * @category utility types
 */
export type MergedTools<Toolkits extends ReadonlyArray<Any>> = SimplifyRecord<MergeRecords<Tools<Toolkits[number]>>>;
/**
 * Merges multiple toolkits into a single toolkit.
 *
 * Combines all tools from the provided toolkits into one unified toolkit.
 * If there are naming conflicts, tools from later toolkits will override
 * tools from earlier ones.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const mathToolkit = Toolkit.make(
 *   Tool.make("add", { success: Schema.Number }),
 *   Tool.make("subtract", { success: Schema.Number })
 * )
 *
 * const utilityToolkit = Toolkit.make(
 *   Tool.make("get_time", { success: Schema.Number }),
 *   Tool.make("get_weather", { success: Schema.String })
 * )
 *
 * const combined = Toolkit.merge(mathToolkit, utilityToolkit)
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const merge: <const Toolkits extends ReadonlyArray<Any>>(
/**
 * The toolkits to merge together.
 */
...toolkits: Toolkits) => Toolkit<MergedTools<Toolkits>>;
export {};
//# sourceMappingURL=Toolkit.d.ts.map