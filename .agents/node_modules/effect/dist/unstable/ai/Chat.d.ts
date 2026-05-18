import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Ref from "../../Ref.ts";
import * as Schema from "../../Schema.ts";
import * as Stream from "../../Stream.ts";
import type { NoExcessProperties } from "../../Types.ts";
import type { PersistenceError } from "../persistence/Persistence.ts";
import { BackingPersistence } from "../persistence/Persistence.ts";
import * as AiError from "./AiError.ts";
import * as LanguageModel from "./LanguageModel.ts";
import * as Prompt from "./Prompt.ts";
import type * as Response from "./Response.ts";
import type * as Tool from "./Tool.ts";
declare const Chat_base: Context.ServiceClass<Chat, "effect/ai/Chat", Service>;
/**
 * The `Chat` service tag for dependency injection.
 *
 * This tag provides access to chat functionality throughout your application,
 * enabling persistent conversational AI interactions with full context
 * management.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *   const response = yield* chat.generateText({
 *     prompt: "Explain quantum computing in simple terms"
 *   })
 *   return response.content
 * })
 * ```
 *
 * @since 4.0.0
 * @category services
 */
export declare class Chat extends Chat_base {
}
/**
 * Represents the interface that the `Chat` service provides.
 *
 * @since 4.0.0
 * @category models
 */
export interface Service {
    /**
     * Reference to the chat history.
     *
     * Provides direct access to the conversation history for advanced use cases
     * like custom history manipulation or inspection.
     *
     * @example
     * ```ts
     * import { Effect, Ref } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const inspectHistory = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *   const currentHistory = yield* Ref.get(chat.history)
     *   console.log("Current conversation:", currentHistory)
     *   return currentHistory
     * })
     * ```
     */
    readonly history: Ref.Ref<Prompt.Prompt>;
    /**
     * Exports the chat history into a structured format.
     *
     * Returns the complete conversation history as a structured object
     * that can be stored, transmitted, or processed by other systems.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const saveChat = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *   yield* chat.generateText({ prompt: "Hello!" })
     *
     *   const exportedData = yield* chat.export
     *
     *   // Save to database or file system
     *   return exportedData
     * })
     * ```
     */
    readonly export: Effect.Effect<unknown, AiError.AiError>;
    /**
     * Exports the chat history as a JSON string.
     *
     * Provides a convenient way to serialize the entire conversation
     * for storage or transmission in JSON format.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const backupChat = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *
     *   yield* chat.generateText({ prompt: "Explain photosynthesis" })
     *
     *   const jsonBackup = yield* chat.exportJson
     *
     *   yield* Effect.sync(() => localStorage.setItem("chat-backup", jsonBackup))
     *
     *   return jsonBackup
     * })
     * ```
     */
    readonly exportJson: Effect.Effect<string, AiError.AiError>;
    /**
     * Generate text using a language model for the specified prompt.
     *
     * If a toolkit is specified, the language model will have access to tools
     * for function calling and enhanced capabilities. Both input and output
     * messages are automatically added to the chat history.
     *
     * @example
     * ```ts
     * import { Effect } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const chatWithAI = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *
     *   const response1 = yield* chat.generateText({
     *     prompt: "What is the capital of France?"
     *   })
     *
     *   const response2 = yield* chat.generateText({
     *     prompt: "What's the population of that city?"
     *   })
     *
     *   return [response1.content, response2.content]
     * })
     * ```
     */
    readonly generateText: {
        <Options extends NoExcessProperties<LanguageModel.GenerateTextOptions<{}>, Options>>(options: Options & {
            readonly toolkit?: undefined;
        } & LanguageModel.GenerateTextOptions<{}>): Effect.Effect<LanguageModel.GenerateTextResponse<{}>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
        <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<LanguageModel.GenerateTextOptions<Tools> & {
            readonly toolkit: LanguageModel.ToolkitInput<Tools>;
        }, Options>>(options: Options & LanguageModel.GenerateTextOptions<Tools> & {
            readonly toolkit: LanguageModel.ToolkitInput<Tools>;
        }): Effect.Effect<LanguageModel.GenerateTextResponse<Tools>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
        <Options extends {
            readonly toolkit: LanguageModel.ToolkitOption<any>;
        } & NoExcessProperties<LanguageModel.GenerateTextOptions<any>, Options>>(options: Options & LanguageModel.GenerateTextOptions<LanguageModel.ExtractTools<Options>> & {
            readonly toolkit: Options["toolkit"];
        }): Effect.Effect<LanguageModel.GenerateTextResponse<LanguageModel.ExtractTools<Options>>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
    };
    /**
     * Generate text using a language model with streaming output.
     *
     * Returns a stream of response parts that are emitted as soon as they're
     * available from the model. Supports tool calling and maintains chat history.
     *
     * @example
     * ```ts
     * import { Effect, Stream } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const streamingChat = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *
     *   const stream = yield* chat.streamText({
     *     prompt: "Write a short story about space exploration"
     *   })
     *
     *   yield* Stream.runForEach(stream, (part) =>
     *     part.type === "text-delta"
     *       ? Effect.sync(() => process.stdout.write(part.delta))
     *       : Effect.void)
     * })
     * ```
     */
    readonly streamText: {
        <Options extends NoExcessProperties<LanguageModel.GenerateTextOptions<{}>, Options>>(options: Options & {
            readonly toolkit?: undefined;
        } & LanguageModel.GenerateTextOptions<{}>): Stream.Stream<Response.StreamPart<{}>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
        <Tools extends Record<string, Tool.Any>, Options extends NoExcessProperties<LanguageModel.GenerateTextOptions<Tools> & {
            readonly toolkit: LanguageModel.ToolkitInput<Tools>;
        }, Options>>(options: Options & LanguageModel.GenerateTextOptions<Tools> & {
            readonly toolkit: LanguageModel.ToolkitInput<Tools>;
        }): Stream.Stream<Response.StreamPart<Tools>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
        <Options extends {
            readonly toolkit: LanguageModel.ToolkitOption<any>;
        } & NoExcessProperties<LanguageModel.GenerateTextOptions<any>, Options>>(options: Options & LanguageModel.GenerateTextOptions<LanguageModel.ExtractTools<Options>> & {
            readonly toolkit: Options["toolkit"];
        }): Stream.Stream<Response.StreamPart<LanguageModel.ExtractTools<Options>>, LanguageModel.ExtractError<Options>, LanguageModel.LanguageModel | LanguageModel.ExtractServices<Options>>;
    };
    /**
     * Generate a structured object using a language model and schema.
     *
     * Forces the model to return data that conforms to the specified schema,
     * enabling structured data extraction and type-safe responses. The
     * conversation history is maintained across calls.
     *
     * @example
     * ```ts
     * import { Effect, Schema } from "effect"
     * import { Chat } from "effect/unstable/ai"
     *
     * const ContactSchema = Schema.Struct({
     *   name: Schema.String,
     *   email: Schema.String,
     *   phone: Schema.optional(Schema.String)
     * })
     *
     * const extractContact = Effect.gen(function*() {
     *   const chat = yield* Chat.empty
     *
     *   const contact = yield* chat.generateObject({
     *     prompt: "Extract contact info: John Doe, john@example.com, 555-1234",
     *     schema: ContactSchema
     *   })
     *
     *   console.log(contact.object)
     *   // { name: "John Doe", email: "john@example.com", phone: "555-1234" }
     *
     *   return contact.object
     * })
     * ```
     */
    readonly generateObject: <ObjectEncoded extends Record<string, any>, ObjectSchema extends Schema.Encoder<ObjectEncoded, unknown>, Options extends NoExcessProperties<LanguageModel.GenerateObjectOptions<any, ObjectSchema>, Options>>(options: Options & LanguageModel.GenerateObjectOptions<LanguageModel.ExtractTools<Options>, ObjectSchema>) => Effect.Effect<LanguageModel.GenerateObjectResponse<LanguageModel.ExtractTools<Options>, ObjectSchema["Type"]>, LanguageModel.ExtractError<Options>, LanguageModel.ExtractServices<Options> | ObjectSchema["DecodingServices"] | LanguageModel.LanguageModel>;
}
/**
 * Creates a new Chat service with empty conversation history.
 *
 * This is the most common way to start a fresh chat session without
 * any initial context or system prompts.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const freshChat = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *
 *   const response = yield* chat.generateText({
 *     prompt: "Hello! Can you introduce yourself?"
 *   })
 *
 *   console.log(response.content)
 *
 *   return chat
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: Effect.Effect<Service>;
/**
 * Creates a new Chat service from an initial prompt.
 *
 * This is the primary constructor for creating chat instances. It initializes
 * a new conversation with the provided prompt as the starting context.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const chatWithSystemPrompt = Effect.gen(function*() {
 *   const chat = yield* Chat.fromPrompt([{
 *     role: "system",
 *     content: "You are a helpful assistant specialized in mathematics."
 *   }])
 *
 *   const response = yield* chat.generateText({
 *     prompt: "What is 2+2?"
 *   })
 *
 *   return response.content
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * // Initialize with conversation history
 * const existingChat = Effect.gen(function*() {
 *   const chat = yield* Chat.fromPrompt([
 *     {
 *       role: "user",
 *       content: [{ type: "text", text: "What's the weather like?" }]
 *     },
 *     {
 *       role: "assistant",
 *       content: [{ type: "text", text: "I don't have access to weather data." }]
 *     },
 *     {
 *       role: "user",
 *       content: [{ type: "text", text: "Can you help me with coding?" }]
 *     }
 *   ])
 *
 *   const response = yield* chat.generateText({
 *     prompt: "I need help with TypeScript"
 *   })
 *
 *   return response
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromPrompt: (prompt: Prompt.RawInput) => Effect.Effect<Service, never, never>;
/**
 * Creates a Chat service from previously exported chat data.
 *
 * Restores a chat session from structured data that was previously exported
 * using the `export` method. Useful for persisting and restoring conversation
 * state.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * declare const loadFromDatabase: (sessionId: string) => Effect.Effect<unknown>
 *
 * const restoreChat = Effect.gen(function*() {
 *   // Assume we have previously exported data
 *   const savedData = yield* loadFromDatabase("chat-session-123")
 *
 *   const restoredChat = yield* Chat.fromExport(savedData)
 *
 *   // Continue the conversation from where it left off
 *   const response = yield* restoredChat.generateText({
 *     prompt: "Let's continue our discussion"
 *   })
 * }).pipe(
 *   Effect.catchTag("SchemaError", (error) => {
 *     console.log("Failed to restore chat:", error.message)
 *     return Effect.void
 *   })
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromExport: (data: unknown) => Effect.Effect<Service, Schema.SchemaError>;
/**
 * Creates a Chat service from previously exported JSON chat data.
 *
 * Restores a chat session from JSON string that was previously exported
 * using the `exportJson` method. This is the most convenient way to
 * persist and restore chat sessions to/from storage systems.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * const restoreFromJson = Effect.gen(function*() {
 *   // Load JSON from localStorage or file system
 *   const jsonData = localStorage.getItem("my-chat-backup")
 *   if (!jsonData) return yield* Chat.empty
 *
 *   const restoredChat = yield* Chat.fromJson(jsonData)
 *
 *   // Chat history is now restored
 *   const response = yield* restoredChat.generateText({
 *     prompt: "What were we talking about?"
 *   })
 *
 *   return response
 * }).pipe(
 *   Effect.catchTag("SchemaError", (error) => {
 *     console.log("Invalid JSON format:", error.message)
 *     return Chat.empty // Fallback to empty chat
 *   })
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromJson: (data: string) => Effect.Effect<Service, Schema.SchemaError>;
declare const ChatNotFoundError_base: Schema.Class<ChatNotFoundError, Schema.Struct<{
    readonly _tag: Schema.tag<"ChatNotFoundError">;
    readonly chatId: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * An error that occurs when attempting to retrieve a persisted `Chat` that
 * does not exist in the backing persistence store.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class ChatNotFoundError extends ChatNotFoundError_base {
}
declare const Persistence_base: Context.ServiceClass<Persistence, "effect/ai/Chat/Persisted", Persistence.Service>;
/**
 * The context tag for chat persistence.
 *
 * @since 4.0.0
 * @category services
 */
export declare class Persistence extends Persistence_base {
}
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace Persistence {
    /**
     * Represents the backing persistence for a persisted `Chat`. Allows for
     * creating and retrieving chats that have been saved to a persistence store.
     *
     * @since 4.0.0
     * @category models
     */
    interface Service {
        /**
         * Attempts to retrieve the persisted chat from the backing persistence
         * store with the specified chat identifer. If the chat does not exist in
         * the persistence store, a `ChatNotFoundError` will be returned.
         */
        readonly get: (chatId: string, options?: {
            readonly timeToLive?: Duration.Input | undefined;
        }) => Effect.Effect<Persisted, ChatNotFoundError | PersistenceError>;
        /**
         * Attempts to retrieve the persisted chat from the backing persistence
         * store with the specified chat identifer. If the chat does not exist in
         * the persistence store, an empty chat will be created, saved, and
         * returned.
         */
        readonly getOrCreate: (chatId: string, options?: {
            readonly timeToLive?: Duration.Input | undefined;
        }) => Effect.Effect<Persisted, AiError.AiError | PersistenceError>;
    }
}
/**
 * Represents a `Chat` that is backed by persistence.
 *
 * When calling a text generation method (e.g. `generateText`), the previous
 * chat history as well as the relevent response parts will be saved to the
 * backing persistence store.
 *
 * @since 4.0.0
 * @category models
 */
export interface Persisted extends Service {
    /**
     * The identifier for the chat in the backing persistence store.
     */
    readonly id: string;
    /**
     * Saves the current chat history into the backing persistence store.
     */
    readonly save: Effect.Effect<void, AiError.AiError | PersistenceError>;
}
/**
 * Creates a new chat persistence service.
 *
 * The provided store identifier will be used to indicate which "store" the
 * backing persistence should load chats from.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makePersisted: (options: {
    readonly storeId: string;
}) => Effect.Effect<Persistence.Service, never, import("../../Scope.ts").Scope | BackingPersistence>;
/**
 * Creates a `Layer` new chat persistence service.
 *
 * The provided store identifier will be used to indicate which "store" the
 * backing persistence should load chats from.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const layerPersisted: (options: {
    readonly storeId: string;
}) => Layer.Layer<Persistence, never, BackingPersistence>;
export {};
//# sourceMappingURL=Chat.d.ts.map