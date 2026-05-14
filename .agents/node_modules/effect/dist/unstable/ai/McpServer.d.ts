import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Queue from "../../Queue.ts";
import * as Schema from "../../Schema.ts";
import type { Stdio } from "../../Stdio.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
import * as RpcClient from "../rpc/RpcClient.ts";
import type * as RpcGroup from "../rpc/RpcGroup.ts";
import * as RpcMessage from "../rpc/RpcMessage.ts";
import * as RpcServer from "../rpc/RpcServer.ts";
import { CallToolResult, CompleteResult, ElicitationDeclined, GetPromptResult, InternalError, InvalidParams, McpServerClient, Prompt, Resource, ResourceTemplate, ServerNotificationRpcs, Tool as McpTool } from "./McpSchema.ts";
import type { CallTool, ClientCapabilities, Complete, GetPrompt, Param, PromptMessage, ReadResourceResult } from "./McpSchema.ts";
import * as Tool from "./Tool.ts";
import type * as Toolkit from "./Toolkit.ts";
declare const McpServer_base: Context.ServiceClass<McpServer, "effect/ai/McpServer", {
    readonly notifications: RpcClient.RpcClient<RpcGroup.Rpcs<typeof ServerNotificationRpcs>>;
    readonly notificationsQueue: Queue.Dequeue<RpcMessage.Request<any>>;
    readonly initializedClients: Set<number>;
    readonly tools: ReadonlyArray<{
        readonly tool: McpTool;
        readonly annotations: Context.Context<never>;
    }>;
    readonly addTool: (options: {
        readonly tool: McpTool;
        readonly annotations: Context.Context<never>;
        readonly handle: (payload: any) => Effect.Effect<CallToolResult, never, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly callTool: (requests: typeof CallTool.payloadSchema.Type) => Effect.Effect<CallToolResult, InternalError | InvalidParams, McpServerClient>;
    readonly resources: ReadonlyArray<{
        readonly resource: Resource;
        readonly annotations: Context.Context<never>;
    }>;
    readonly addResource: (options: {
        readonly resource: Resource;
        readonly annotations: Context.Context<never>;
        readonly handle: Effect.Effect<typeof ReadResourceResult.Type, InternalError, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly resourceTemplates: ReadonlyArray<{
        readonly template: ResourceTemplate;
        readonly annotations: Context.Context<never>;
    }>;
    readonly addResourceTemplate: (options: {
        readonly template: ResourceTemplate;
        readonly annotations: Context.Context<never>;
        readonly routerPath: string;
        readonly completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError>>;
        readonly handle: (uri: string, params: Array<string>) => Effect.Effect<typeof ReadResourceResult.Type, InvalidParams | InternalError, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly findResource: (uri: string) => Effect.Effect<typeof ReadResourceResult.Type, InvalidParams | InternalError, McpServerClient>;
    readonly prompts: ReadonlyArray<{
        readonly prompt: Prompt;
        readonly annotations: Context.Context<never>;
    }>;
    readonly addPrompt: (options: {
        readonly prompt: Prompt;
        readonly annotations: Context.Context<never>;
        readonly completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError, McpServerClient>>;
        readonly handle: (params: Record<string, string>) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly getPromptResult: (request: typeof GetPrompt.payloadSchema.Type) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;
    readonly completion: (complete: typeof Complete.payloadSchema.Type) => Effect.Effect<CompleteResult, InternalError, McpServerClient>;
}>;
/**
 * @since 4.0.0
 * @category server
 */
export declare class McpServer extends McpServer_base {
    /**
     * @since 4.0.0
     */
    static readonly make: Effect.Effect<{
        readonly notifications: RpcClient.RpcClient<RpcGroup.Rpcs<typeof ServerNotificationRpcs>>;
        readonly notificationsQueue: Queue.Dequeue<RpcMessage.Request<any>>;
        readonly initializedClients: Set<number>;
        readonly tools: ReadonlyArray<{
            readonly tool: McpTool;
            readonly annotations: Context.Context<never>;
        }>;
        readonly addTool: (options: {
            readonly tool: McpTool;
            readonly annotations: Context.Context<never>;
            readonly handle: (payload: any) => Effect.Effect<CallToolResult, never, McpServerClient>;
        }) => Effect.Effect<void>;
        readonly callTool: (requests: typeof CallTool.payloadSchema.Type) => Effect.Effect<CallToolResult, InternalError | InvalidParams, McpServerClient>;
        readonly resources: ReadonlyArray<{
            readonly resource: Resource;
            readonly annotations: Context.Context<never>;
        }>;
        readonly addResource: (options: {
            readonly resource: Resource;
            readonly annotations: Context.Context<never>;
            readonly handle: Effect.Effect<typeof ReadResourceResult.Type, InternalError, McpServerClient>;
        }) => Effect.Effect<void>;
        readonly resourceTemplates: ReadonlyArray<{
            readonly template: ResourceTemplate;
            readonly annotations: Context.Context<never>;
        }>;
        readonly addResourceTemplate: (options: {
            readonly template: ResourceTemplate;
            readonly annotations: Context.Context<never>;
            readonly routerPath: string;
            readonly completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError>>;
            readonly handle: (uri: string, params: Array<string>) => Effect.Effect<typeof ReadResourceResult.Type, InvalidParams | InternalError, McpServerClient>;
        }) => Effect.Effect<void>;
        readonly findResource: (uri: string) => Effect.Effect<typeof ReadResourceResult.Type, InvalidParams | InternalError, McpServerClient>;
        readonly prompts: ReadonlyArray<{
            readonly prompt: Prompt;
            readonly annotations: Context.Context<never>;
        }>;
        readonly addPrompt: (options: {
            readonly prompt: Prompt;
            readonly annotations: Context.Context<never>;
            readonly completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError, McpServerClient>>;
            readonly handle: (params: Record<string, string>) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;
        }) => Effect.Effect<void>;
        readonly getPromptResult: (request: typeof GetPrompt.payloadSchema.Type) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;
        readonly completion: (complete: typeof Complete.payloadSchema.Type) => Effect.Effect<CompleteResult, InternalError, McpServerClient>;
    }, never, import("../../Scope.ts").Scope>;
    /**
     * @since 4.0.0
     */
    static readonly layer: Layer.Layer<McpServer | McpServerClient>;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const run: (options: {
    readonly name: string;
    readonly version: string;
    readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}) => Effect.Effect<never, never, McpServer | RpcServer.Protocol>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: (options: {
    readonly name: string;
    readonly version: string;
    readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}) => Layer.Layer<McpServer | McpServerClient, never, RpcServer.Protocol>;
/**
 * Run the McpServer, using stdio for input and output.
 *
 * @example
 * ```ts
 * import { NodeRuntime, NodeStdio } from "@effect/platform-node"
 * import { Effect, Layer, Logger, Schema } from "effect"
 * import { McpSchema, McpServer } from "effect/unstable/ai"
 *
 * const idParam = McpSchema.param("id", Schema.Number)
 *
 * // Define a resource template for a README file
 * const ReadmeTemplate = McpServer.resource`file://readme/${idParam}`({
 *   name: "README Template",
 *   // You can add auto-completion for the ID parameter
 *   completion: {
 *     id: (_) => Effect.succeed([1, 2, 3, 4, 5])
 *   },
 *   content: Effect.fn(function*(_uri, id) {
 *     return `# MCP Server Demo - ID: ${id}`
 *   })
 * })
 *
 * // Define a test prompt with parameters
 * const TestPrompt = McpServer.prompt({
 *   name: "Test Prompt",
 *   description: "A test prompt to demonstrate MCP server capabilities",
 *   parameters: {
 *     flightNumber: Schema.String
 *   },
 *   completion: {
 *     flightNumber: () => Effect.succeed(["FL123", "FL456", "FL789"])
 *   },
 *   content: ({ flightNumber }) =>
 *     Effect.succeed(`Get the booking details for flight number: ${flightNumber}`)
 * })
 *
 * // Merge all the resources and prompts into a single server layer
 * const ServerLayer = Layer.mergeAll(
 *   ReadmeTemplate,
 *   TestPrompt
 * ).pipe(
 *   // Provide the MCP server implementation
 *   Layer.provide(McpServer.layerStdio({
 *     name: "Demo Server",
 *     version: "1.0.0",
 *   })),
 *   Layer.provide(NodeStdio.layer),
 *   Layer.provide(Layer.succeed(Logger.LogToStderr)(true))
 * )
 *
 * Layer.launch(ServerLayer).pipe(NodeRuntime.runMain)
 * ```
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerStdio: (options: {
    readonly name: string;
    readonly version: string;
    readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}) => Layer.Layer<McpServer | McpServerClient, never, Stdio>;
/**
 * Run the `McpServer`, registering a router with a `HttpRouter`
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerHttp: (options: {
    readonly name: string;
    readonly version: string;
    readonly path: HttpRouter.PathInput;
    readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}) => Layer.Layer<McpServer | McpServerClient, never, HttpRouter.HttpRouter>;
/**
 * Register a `Toolkit` with the `McpServer`.
 *
 * @since 4.0.0
 * @category tools
 */
export declare const registerToolkit: <Tools extends Record<string, Tool.Any>>(toolkit: Toolkit.Toolkit<Tools>) => Effect.Effect<void, never, McpServer | Tool.HandlersFor<Tools> | Exclude<Tool.HandlerServices<Tools>, McpServerClient>>;
/**
 * Register an AiToolkit with the McpServer.
 *
 * @since 4.0.0
 * @category tools
 */
export declare const toolkit: <Tools extends Record<string, Tool.Any>>(toolkit: Toolkit.Toolkit<Tools>) => Layer.Layer<never, never, Tool.HandlersFor<Tools> | Exclude<Tool.HandlerServices<Tools>, McpServerClient>>;
/**
 * @since 4.0.0
 */
export type ValidateCompletions<Completions, Keys extends string> = Completions & {
    readonly [K in keyof Completions]: K extends Keys ? (input: string) => any : never;
};
/**
 * @since 4.0.0
 */
export type ResourceCompletions<Schemas extends ReadonlyArray<Schema.Top>> = {
    readonly [K in Extract<keyof Schemas, `${number}`> as Schemas[K] extends Param<infer Id, infer _S> ? Id : `param${K}`]: (input: string) => Effect.Effect<Array<Schemas[K]["Type"]>, any, any>;
};
/**
 * Register a resource with the McpServer.
 *
 * @since 4.0.0
 * @category resources
 */
export declare const registerResource: {
    /**
     * Register a resource with the McpServer.
     *
     * @since 4.0.0
     * @category resources
     */
    <E, R>(options: {
        readonly uri: string;
        readonly name: string;
        readonly description?: string | undefined;
        readonly mimeType?: string | undefined;
        readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
        readonly priority?: number | undefined;
        readonly content: Effect.Effect<typeof ReadResourceResult.Type | string | Uint8Array, E, R>;
        readonly annotations?: Context.Context<never> | undefined;
    }): Effect.Effect<void, never, Exclude<R, McpServerClient> | McpServer>;
    /**
     * Register a resource with the McpServer.
     *
     * @since 4.0.0
     * @category resources
     */
    <const Schemas extends ReadonlyArray<Schema.Top>>(segments: TemplateStringsArray, ...schemas: Schemas): <E, R, const Completions extends Partial<ResourceCompletions<Schemas>> = {}>(options: {
        readonly name: string;
        readonly description?: string | undefined;
        readonly mimeType?: string | undefined;
        readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
        readonly priority?: number | undefined;
        readonly completion?: ValidateCompletions<Completions, keyof ResourceCompletions<Schemas>> | undefined;
        readonly content: (uri: string, ...params: {
            readonly [K in keyof Schemas]: Schemas[K]["Type"];
        }) => Effect.Effect<typeof ReadResourceResult.Type | string | Uint8Array, E, R>;
        readonly annotations?: Context.Context<never> | undefined;
    }) => Effect.Effect<void, never, Exclude<Schemas[number]["DecodingServices"] | Schemas[number]["EncodingServices"] | R | (Completions[keyof Completions] extends (input: string) => infer Ret ? Ret extends Effect.Effect<infer _A, infer _E, infer _R> ? _R : never : never), McpServerClient> | McpServer>;
};
/**
 * Register a resource with the McpServer.
 *
 * @since 4.0.0
 * @category resources
 */
export declare const resource: {
    /**
     * Register a resource with the McpServer.
     *
     * @since 4.0.0
     * @category resources
     */
    <E, R>(options: {
        readonly uri: string;
        readonly name: string;
        readonly description?: string | undefined;
        readonly mimeType?: string | undefined;
        readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
        readonly priority?: number | undefined;
        readonly content: Effect.Effect<typeof ReadResourceResult.Type | string | Uint8Array, E, R>;
    }): Layer.Layer<never, never, Exclude<R, McpServerClient>>;
    /**
     * Register a resource with the McpServer.
     *
     * @since 4.0.0
     * @category resources
     */
    <const Schemas extends ReadonlyArray<Schema.Top>>(segments: TemplateStringsArray, ...schemas: Schemas): <E, R, const Completions extends Partial<ResourceCompletions<Schemas>> = {}>(options: {
        readonly name: string;
        readonly description?: string | undefined;
        readonly mimeType?: string | undefined;
        readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
        readonly priority?: number | undefined;
        readonly completion?: ValidateCompletions<Completions, keyof ResourceCompletions<Schemas>> | undefined;
        readonly content: (uri: string, ...params: {
            readonly [K in keyof Schemas]: Schemas[K]["Type"];
        }) => Effect.Effect<typeof ReadResourceResult.Type | string | Uint8Array, E, R>;
    }) => Layer.Layer<never, never, Exclude<R | (Completions[keyof Completions] extends (input: string) => infer Ret ? Ret extends Effect.Effect<infer _A, infer _E, infer _R> ? _R : never : never), McpServerClient>>;
};
/**
 * Register a prompt with the McpServer.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare const registerPrompt: <E, R, Params extends Schema.Struct.Fields = {}, const Completions extends { readonly [K in keyof Params]?: (input: string) => Effect.Effect<Array<Params[K]>, any, any>; } = {}>(options: {
    readonly name: string;
    readonly description?: string | undefined;
    readonly parameters?: Params | undefined;
    readonly completion?: ValidateCompletions<Completions, Extract<keyof Params, string>> | undefined;
    readonly content: (params: Params) => Effect.Effect<Array<typeof PromptMessage.Type> | string, E, R>;
    readonly annotations?: Context.Context<never> | undefined;
}) => Effect.Effect<void, never, Exclude<Schema.Struct.DecodingServices<Params> | R, McpServerClient> | McpServer>;
/**
 * Register a prompt with the McpServer.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare const prompt: <E, R, Params extends Schema.Struct.Fields = {}, const Completions extends { readonly [K in keyof Params]?: (input: string) => Effect.Effect<Array<Params[K]["Type"]>, any, any>; } = {}>(options: {
    readonly name: string;
    readonly description?: string | undefined;
    readonly parameters?: Params | undefined;
    readonly completion?: ValidateCompletions<Completions, Extract<keyof Params, string>> | undefined;
    readonly content: (params: Schema.Struct.Type<Params>) => Effect.Effect<Array<typeof PromptMessage.Type> | string, E, R>;
    readonly annotations?: Context.Context<never> | undefined;
}) => Layer.Layer<never, never, Exclude<Schema.Struct.DecodingServices<Params> | R, McpServerClient>>;
/**
 * Create an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export declare const elicit: <S extends Schema.Encoder<Record<string, unknown>, unknown>>(options: {
    readonly message: string;
    readonly schema: S;
}) => Effect.Effect<S["Type"], ElicitationDeclined, McpServerClient | S["DecodingServices"]>;
/**
 * Access the current client's capabilities.
 *
 * @since 4.0.0
 * @category capabilities
 */
export declare const clientCapabilities: Effect.Effect<ClientCapabilities, never, McpServerClient>;
export {};
//# sourceMappingURL=McpServer.d.ts.map