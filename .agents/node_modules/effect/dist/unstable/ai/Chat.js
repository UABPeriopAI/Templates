/**
 * The `Chat` module provides a stateful conversation interface for AI language
 * models.
 *
 * This module enables persistent chat sessions that maintain conversation
 * history, support tool calling, and offer both streaming and non-streaming
 * text generation. It integrates seamlessly with the Effect AI ecosystem,
 * providing type-safe conversational AI capabilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * // Create a new chat session
 * const program = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *
 *   // Send a message and get response
 *   const response = yield* chat.generateText({
 *     prompt: "Hello! What can you help me with?"
 *   })
 *
 *   console.log(response.content)
 *
 *   return response
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import { Chat } from "effect/unstable/ai"
 *
 * // Streaming chat with tool support
 * const streamingChat = Effect.gen(function*() {
 *   const chat = yield* Chat.empty
 *
 *   yield* chat.streamText({
 *     prompt: "Generate a creative story"
 *   }).pipe(Stream.runForEach((part) => Effect.sync(() => console.log(part))))
 * })
 * ```
 *
 * @since 4.0.0
 */
import * as Channel from "../../Channel.js";
import * as Chunk from "../../Chunk.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Ref from "../../Ref.js";
import * as Schema from "../../Schema.js";
import * as Semaphore from "../../Semaphore.js";
import * as Stream from "../../Stream.js";
import { BackingPersistence } from "../persistence/Persistence.js";
import * as AiError from "./AiError.js";
import * as IdGenerator from "./IdGenerator.js";
import * as LanguageModel from "./LanguageModel.js";
import * as Prompt from "./Prompt.js";
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
export class Chat extends /*#__PURE__*/Context.Service()("effect/ai/Chat") {}
const decodeHistory = /*#__PURE__*/Schema.decodeUnknownEffect(Prompt.Prompt);
const encodeHistory = /*#__PURE__*/Schema.encodeUnknownEffect(Prompt.Prompt);
const decodeHistoryJson = /*#__PURE__*/Schema.decodeUnknownEffect(/*#__PURE__*/Schema.fromJsonString(Prompt.Prompt));
const encodeHistoryJson = /*#__PURE__*/Schema.encodeUnknownEffect(/*#__PURE__*/Schema.fromJsonString(Prompt.Prompt));
// =============================================================================
// Constructors
// =============================================================================
const makeUnsafe = history => {
  const semaphore = Semaphore.makeUnsafe(1);
  return Chat.of({
    history,
    export: Ref.get(history).pipe(Effect.flatMap(encodeHistory), Effect.catchTag("SchemaError", error => Effect.fail(AiError.make({
      module: "Chat",
      method: "export",
      reason: AiError.InvalidOutputError.fromSchemaError(error)
    }))), Effect.withSpan("Chat.export")),
    exportJson: Ref.get(history).pipe(Effect.flatMap(encodeHistoryJson), Effect.catchTag("SchemaError", error => Effect.fail(AiError.make({
      module: "Chat",
      method: "exportJson",
      reason: AiError.InvalidOutputError.fromSchemaError(error)
    }))), Effect.withSpan("Chat.exportJson")),
    generateText: Effect.fnUntraced(function* (options) {
      const newPrompt = Prompt.make(options.prompt);
      const oldPrompt = yield* Ref.get(history);
      const prompt = Prompt.concat(oldPrompt, newPrompt);
      const response = yield* LanguageModel.generateText({
        ...options,
        prompt
      });
      const newHistory = Prompt.concat(prompt, Prompt.fromResponseParts(response.content));
      yield* Ref.set(history, newHistory);
      return response;
    }, semaphore.withPermits(1), effect => Effect.withSpan(effect, "Chat.generateText", {
      captureStackTrace: false
    })),
    streamText: Effect.fnUntraced(function* (options) {
      let parts = Chunk.empty();
      return Stream.fromChannel(Channel.acquireUseRelease(semaphore.take(1).pipe(Effect.flatMap(() => Ref.get(history)), Effect.map(history => Prompt.concat(history, Prompt.make(options.prompt)))), prompt => LanguageModel.streamText({
        ...options,
        prompt
      }).pipe(Stream.mapArray(chunk => {
        parts = Chunk.appendAll(parts, Chunk.fromArrayUnsafe(chunk));
        return chunk;
      }), Stream.toChannel), prompt => Effect.andThen(Ref.set(history, Prompt.concat(prompt, Prompt.fromResponseParts(Array.from(parts)))), semaphore.release(1)))).pipe(Stream.withSpan("Chat.streamText", {
        captureStackTrace: false
      }));
    }, Stream.unwrap),
    generateObject: Effect.fnUntraced(function* (options) {
      const newPrompt = Prompt.make(options.prompt);
      const oldPrompt = yield* Ref.get(history);
      const prompt = Prompt.concat(oldPrompt, newPrompt);
      const response = yield* LanguageModel.generateObject({
        ...options,
        prompt
      });
      const newHistory = Prompt.concat(prompt, Prompt.fromResponseParts(response.content));
      yield* Ref.set(history, newHistory);
      return response;
    }, semaphore.withPermits(1), (effect, options) => Effect.withSpan(effect, "Chat.generateObject", {
      attributes: {
        objectName: LanguageModel.getObjectName(options.objectName, options.schema)
      },
      captureStackTrace: false
    }))
  });
};
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
export const empty = /*#__PURE__*/Effect.sync(() => makeUnsafe(Ref.makeUnsafe(Prompt.empty)));
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
export const fromPrompt = prompt => Effect.sync(() => makeUnsafe(Ref.makeUnsafe(Prompt.make(prompt))));
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
export const fromExport = data => Effect.flatMap(decodeHistory(data), fromPrompt);
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
export const fromJson = data => Effect.flatMap(decodeHistoryJson(data), fromPrompt);
// =============================================================================
// Chat Persistence
// =============================================================================
/**
 * An error that occurs when attempting to retrieve a persisted `Chat` that
 * does not exist in the backing persistence store.
 *
 * @since 4.0.0
 * @category errors
 */
export class ChatNotFoundError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/Chat/ChatNotFoundError")({
  _tag: /*#__PURE__*/Schema.tag("ChatNotFoundError"),
  chatId: Schema.String
}) {}
/**
 * The context tag for chat persistence.
 *
 * @since 4.0.0
 * @category services
 */
// @effect-diagnostics effect/leakingRequirements:off
export class Persistence extends /*#__PURE__*/Context.Service()("effect/ai/Chat/Persisted") {}
/**
 * Creates a new chat persistence service.
 *
 * The provided store identifier will be used to indicate which "store" the
 * backing persistence should load chats from.
 *
 * @since 4.0.0
 * @category constructors
 */
export const makePersisted = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const persistence = yield* BackingPersistence;
  const store = yield* persistence.make(options.storeId);
  const toPersisted = Effect.fnUntraced(function* (chatId, chat, ttl) {
    const idGenerator = yield* Effect.serviceOption(IdGenerator.IdGenerator).pipe(Effect.map(Option.getOrElse(() => IdGenerator.defaultIdGenerator)));
    const saveChat = Effect.fnUntraced(function* (prevHistory) {
      // Get the current chat history
      const history = yield* Ref.get(chat.history);
      // Get the most recent message stored in the previous chat history
      const lastMessage = prevHistory.content[prevHistory.content.length - 1];
      // Determine the correct message identifier to use:
      let messageId = undefined;
      // If the most recent message in the chat history is an assistant message,
      // use the message identifer stored in that message
      if (Predicate.isNotUndefined(lastMessage) && lastMessage.role === "assistant") {
        messageId = lastMessage.options[Persistence.key]?.messageId;
      }
      // If the chat history is empty or a message identifier did not exist on
      // the most recent message in the chat history, generate a new identifier
      if (Predicate.isUndefined(messageId)) {
        messageId = yield* idGenerator.generateId();
      }
      // Mutate the new messages to add the generated message identifier
      for (let i = prevHistory.content.length; i < history.content.length; i++) {
        const message = history.content[i];
        message.options[Persistence.key] = {
          messageId
        };
      }
      // Save the mutated history back to the ref
      yield* Ref.set(chat.history, history);
      // Export the chat history
      const exported = yield* Effect.orDie(chat.export);
      const timeToLive = Predicate.isNotUndefined(ttl) ? Option.getOrUndefined(Duration.fromInput(ttl)) : undefined;
      // Save the chat to the backing store
      yield* store.set(chatId, exported, timeToLive);
    });
    const persisted = {
      ...chat,
      id: chatId,
      save: Effect.flatMap(Ref.get(chat.history), saveChat),
      generateText: Effect.fnUntraced(function* (options) {
        const history = yield* Ref.get(chat.history);
        return yield* chat.generateText(options).pipe(Effect.ensuring(Effect.orDie(saveChat(history))));
      }),
      generateObject: Effect.fnUntraced(function* (options) {
        const history = yield* Ref.get(chat.history);
        return yield* chat.generateObject(options).pipe(Effect.ensuring(Effect.orDie(saveChat(history))));
      }),
      streamText: Effect.fnUntraced(function* (options) {
        const history = yield* Ref.get(chat.history);
        const stream = chat.streamText(options).pipe(Stream.ensuring(Effect.orDie(saveChat(history))));
        return stream;
      }, Stream.unwrap)
    };
    return persisted;
  });
  const createChat = Effect.fnUntraced(function* (chatId, ttl) {
    // Create an empty chat
    const chat = yield* empty;
    // Export the chat history
    const history = yield* Effect.orDie(chat.export);
    // Save the history for the newly created chat
    const timeToLive = Predicate.isNotUndefined(ttl) ? Option.getOrUndefined(Duration.fromInput(ttl)) : undefined;
    yield* store.set(chatId, history, timeToLive);
    // Convert the chat to a persisted chat
    return yield* toPersisted(chatId, chat, ttl);
  });
  const getChat = Effect.fnUntraced(function* (chatId, ttl) {
    // Create an empty chat
    const chat = yield* empty;
    // Attempt to retrieve the previous history from the store
    const previousHistory = yield* store.get(chatId);
    // If the previous history was not found, raise an error
    if (Predicate.isUndefined(previousHistory)) {
      return yield* new ChatNotFoundError({
        chatId
      });
    }
    // Decode the encoded previous history
    const history = yield* decodeHistory(previousHistory);
    // Hydrate the chat history
    yield* Ref.set(chat.history, history);
    // Convert the chat to a persisted chat
    return yield* toPersisted(chatId, chat, ttl);
  }, Effect.catchTag("SchemaError", Effect.die));
  const get = Effect.fnUntraced(function* (chatId, options) {
    return yield* getChat(chatId, options?.timeToLive);
  }, effect => Effect.withSpan(effect, "PersistedChat.get", {
    captureStackTrace: false
  }));
  const getOrCreate = Effect.fnUntraced(function* (chatId, options) {
    return yield* getChat(chatId, options?.timeToLive).pipe(Effect.catchTag("ChatNotFoundError", () => createChat(chatId, options?.timeToLive)));
  }, effect => Effect.withSpan(effect, "PersistedChat.getOrCreate", {
    captureStackTrace: false
  }));
  return Persistence.of({
    get,
    getOrCreate
  });
});
/**
 * Creates a `Layer` new chat persistence service.
 *
 * The provided store identifier will be used to indicate which "store" the
 * backing persistence should load chats from.
 *
 * @since 4.0.0
 * @category constructors
 */
export const layerPersisted = options => Layer.effect(Persistence)(makePersisted(options));
//# sourceMappingURL=Chat.js.map