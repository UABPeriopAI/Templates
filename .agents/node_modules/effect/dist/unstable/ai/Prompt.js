/**
 * The `Prompt` module provides several data structures to simplify creating and
 * combining prompts.
 *
 * This module defines the complete structure of a conversation with a large
 * language model, including messages, content parts, and provider-specific
 * options. It supports rich content types like text, files, tool calls, and
 * reasoning.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * // Create a structured conversation
 * const conversation = Prompt.make([
 *   {
 *     role: "system",
 *     content: "You are a helpful assistant specialized in mathematics."
 *   },
 *   {
 *     role: "user",
 *     content: [{
 *       type: "text",
 *       text: "What is the derivative of x²?"
 *     }]
 *   },
 *   {
 *     role: "assistant",
 *     content: [{
 *       type: "text",
 *       text: "The derivative of x² is 2x."
 *     }]
 *   }
 * ])
 * ```
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * // Concatenate multiple prompts together sequentially
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are a coding assistant."
 * }])
 *
 * const userPrompt = Prompt.make("Help me write a function")
 *
 * const combined = Prompt.concat(systemPrompt, userPrompt)
 * ```
 *
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as SchemaIssue from "../../SchemaIssue.js";
import * as Parser from "../../SchemaParser.js";
import * as SchemaTransformation from "../../SchemaTransformation.js";
// =============================================================================
// Options
// =============================================================================
/**
 * Schema for provider-specific options which can be attached to both content
 * parts and messages, enabling provider-specific behavior.
 *
 * Provider-specific options are namespaced by provider and have the structure:
 *
 * ```
 * {
 *   "<provider-specific-key>": {
 *     // Provider-specific options
 *   }
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export const ProviderOptions = /*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.NullOr(Schema.Json));
// =============================================================================
// Base Part
// =============================================================================
const PartTypeId = "~effect/ai/Prompt/Part";
/**
 * Type guard to check if a value is a Part.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isPart = u => Predicate.hasProperty(u, PartTypeId);
const BasePart = /*#__PURE__*/Schema.Struct({
  [PartTypeId]: /*#__PURE__*/Schema.Literal(PartTypeId).pipe(/*#__PURE__*/Schema.withDecodingDefaultKey(/*#__PURE__*/Effect.succeed(PartTypeId), {
    encodingStrategy: "omit"
  })),
  options: /*#__PURE__*/ProviderOptions.pipe(/*#__PURE__*/Schema.withDecodingDefault(/*#__PURE__*/Effect.succeed({})))
});
/**
 * Creates a new content part of the specified type.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textPart = Prompt.makePart("text", {
 *   text: "Hello, world!"
 * })
 *
 * const filePart = Prompt.makePart("file", {
 *   mediaType: "image/png",
 *   fileName: "screenshot.png",
 *   data: new Uint8Array([1, 2, 3])
 * })
 * ```
 *
 * @since 4.0.0
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
  options: params.options ?? {}
});
/**
 * Schema for validation and encoding of text parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const TextPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("text"),
  text: Schema.String
}).annotate({
  identifier: "TextPart"
});
/**
 * Constructs a new text part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const textPart = params => makePart("text", params);
/**
 * Schema for validation and encoding of reasoning parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ReasoningPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("reasoning"),
  text: Schema.String
}).annotate({
  identifier: "ReasoningPart"
});
/**
 * Constructs a new reasoning part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const reasoningPart = params => makePart("reasoning", params);
/**
 * Schema for validation and encoding of file parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const FilePart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("file"),
  mediaType: Schema.String,
  fileName: Schema.optional(Schema.String),
  data: Schema.Union([Schema.String, Schema.Uint8Array, Schema.URL])
}).annotate({
  identifier: "FilePart"
});
/**
 * Constructs a new file part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const filePart = params => makePart("file", params);
/**
 * Schema for validation and encoding of tool call parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ToolCallPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("tool-call"),
  id: Schema.String,
  name: Schema.String,
  params: Schema.Unknown,
  providerExecuted: Schema.Boolean.pipe(Schema.withDecodingDefault(Effect.succeed(false)))
}).annotate({
  identifier: "ToolCallPart"
});
/**
 * Constructs a new tool call part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const toolCallPart = params => makePart("tool-call", params);
/**
 * Schema for validation and encoding of tool result parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ToolResultPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("tool-result"),
  id: Schema.String,
  name: Schema.String,
  isFailure: Schema.Boolean,
  result: Schema.Unknown
}).annotate({
  identifier: "ToolResultPart"
});
/**
 * Constructs a new tool result part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const toolResultPart = params => makePart("tool-result", params);
/**
 * Schema for validation and encoding of tool approval response parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ToolApprovalResponsePart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("tool-approval-response"),
  approvalId: Schema.String,
  approved: Schema.Boolean,
  reason: Schema.optional(Schema.String)
}).annotate({
  identifier: "ToolApprovalResponsePart"
});
/**
 * Constructs a new tool approval response part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const toolApprovalResponsePart = params => makePart("tool-approval-response", params);
/**
 * Schema for validation and encoding of tool approval request parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ToolApprovalRequestPart = /*#__PURE__*/Schema.Struct({
  ...BasePart.fields,
  type: Schema.Literal("tool-approval-request"),
  approvalId: Schema.String,
  toolCallId: Schema.String
}).annotate({
  identifier: "ToolApprovalRequestPart"
});
/**
 * Constructs a new tool approval request part.
 *
 * @since 4.0.0
 * @category constructors
 */
export const toolApprovalRequestPart = params => makePart("tool-approval-request", params);
// =============================================================================
// Base Message
// =============================================================================
const MessageTypeId = "~effect/ai/Prompt/Message";
/**
 * Type guard to check if a value is a Message.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isMessage = u => Predicate.hasProperty(u, MessageTypeId);
const BaseMessage = /*#__PURE__*/Schema.Struct({
  [MessageTypeId]: /*#__PURE__*/Schema.Literal(MessageTypeId).pipe(/*#__PURE__*/Schema.withDecodingDefaultKey(/*#__PURE__*/Effect.succeed(MessageTypeId), {
    encodingStrategy: "omit"
  })),
  options: /*#__PURE__*/ProviderOptions.pipe(/*#__PURE__*/Schema.withDecodingDefault(/*#__PURE__*/Effect.succeed({})))
});
/**
 * Creates a new message with the specified role.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textPart = Prompt.makePart("text", {
 *   text: "Hello, world!"
 * })
 *
 * const filePart = Prompt.makeMessage("user", {
 *   content: [textPart]
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeMessage = (role, params) => ({
  ...params,
  [MessageTypeId]: MessageTypeId,
  role,
  options: params.options ?? {}
});
/**
 * Schema for decoding message content (i.e. an array containing a single
 * `TextPart`) from a string.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ContentFromString = /*#__PURE__*/Schema.String.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.NonEmptyArray(/*#__PURE__*/Schema.toType(TextPart)), /*#__PURE__*/SchemaTransformation.transform({
  decode: text => Arr.of(makePart("text", {
    text
  })),
  encode: content => content[0].text
})));
/**
 * Schema for validation and encoding of system messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export const SystemMessage = /*#__PURE__*/Schema.Struct({
  ...BaseMessage.fields,
  role: Schema.Literal("system"),
  content: Schema.String
}).annotate({
  identifier: "SystemMessage"
});
/**
 * Constructs a new system message.
 *
 * @since 4.0.0
 * @category constructors
 */
export const systemMessage = params => makeMessage("system", params);
/**
 * Schema for validation and encoding of user messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export const UserMessage = /*#__PURE__*/Schema.Struct({
  ...BaseMessage.fields,
  role: Schema.Literal("user"),
  content: Schema.Union([ContentFromString, Schema.Array(Schema.Union([TextPart, FilePart]))])
}).annotate({
  identifier: "UserMessage"
});
/**
 * Constructs a new user message.
 *
 * @since 4.0.0
 * @category constructors
 */
export const userMessage = params => makeMessage("user", params);
/**
 * Schema for validation and encoding of assistant messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export const AssistantMessage = /*#__PURE__*/Schema.Struct({
  ...BaseMessage.fields,
  role: Schema.Literal("assistant"),
  content: Schema.Union([ContentFromString, Schema.Array(Schema.Union([TextPart, FilePart, ReasoningPart, ToolCallPart, ToolResultPart, ToolApprovalRequestPart]))])
}).annotate({
  identifier: "AssistantMessage"
});
/**
 * Constructs a new assistant message.
 *
 * @since 4.0.0
 * @category constructors
 */
export const assistantMessage = params => makeMessage("assistant", params);
/**
 * Schema for validation and encoding of tool messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export const ToolMessage = /*#__PURE__*/Schema.Struct({
  ...BaseMessage.fields,
  role: Schema.Literal("tool"),
  content: Schema.Array(Schema.Union([ToolResultPart, ToolApprovalResponsePart]))
}).annotate({
  identifier: "ToolMessage"
});
/**
 * Constructs a new tool message.
 *
 * @since 4.0.0
 * @category constructors
 */
export const toolMessage = params => makeMessage("tool", params);
/**
 * Schema for validation and encoding of messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export const Message = /*#__PURE__*/Schema.Union([SystemMessage, UserMessage, AssistantMessage, ToolMessage]);
// =============================================================================
// Prompt
// =============================================================================
const TypeId = "~effect/unstable/ai/Prompt";
/**
 * Type guard to check if a value is a Prompt.
 *
 * @since 4.0.0
 * @category guards
 */
export const isPrompt = u => Predicate.hasProperty(u, TypeId);
const $Prompt = /*#__PURE__*/Schema.declare(u => isPrompt(u), {
  identifier: "Prompt"
});
// TODO: is the type annotation necessary?
// TODO: shoudn't the name be `PromptFrom...`?
// TODO: is the explicit encoding necessary? maybe use the default JSON serializer?
/**
 * Describes a schema that represents a `Prompt` instance.
 *
 * @since 4.0.0
 * @category schemas
 */
export const Prompt = /*#__PURE__*/Schema.Struct({
  content: Schema.Array(Schema.toEncoded(Message))
}).pipe(/*#__PURE__*/Schema.decodeTo($Prompt, /*#__PURE__*/SchemaTransformation.transformOrFail({
  decode: input => Effect.mapBothEager(Parser.decodeEffect(Schema.Array(Message))(input.content), {
    onSuccess: makePrompt,
    onFailure: () => new SchemaIssue.InvalidValue(Option.some(input.content), {
      message: "Invalid Prompt messages"
    })
  }),
  encode: prompt => Effect.mapBothEager(Parser.encodeEffect(Schema.Array(Message))(prompt.content), {
    onSuccess: messages => ({
      content: messages
    }),
    onFailure: () => new SchemaIssue.InvalidValue(Option.some(prompt.content), {
      message: "Invalid Prompt messages"
    })
  })
})));
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makePrompt = content => Object.assign(Object.create(Proto), {
  content
});
const decodeMessagesSync = /*#__PURE__*/Schema.decodeSync(/*#__PURE__*/Schema.Array(Message));
/**
 * An empty prompt with no messages.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const emptyPrompt = Prompt.empty
 * console.log(emptyPrompt.content) // []
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/makePrompt([]);
/**
 * Creates a Prompt from an input.
 *
 * This is the primary constructor for creating prompts, supporting multiple
 * input formats for convenience and flexibility.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * // From string - creates a user message
 * const textPrompt = Prompt.make("Hello, how are you?")
 *
 * // From messages array
 * const structuredPrompt = Prompt.make([
 *   { role: "system", content: "You are a helpful assistant." },
 *   { role: "user", content: [{ type: "text", text: "Hi!" }] }
 * ])
 *
 * // From existing prompt
 * declare const existingPrompt: Prompt.Prompt
 * const copiedPrompt = Prompt.make(existingPrompt)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = input => {
  if (typeof input === "string") {
    const part = makePart("text", {
      text: input
    });
    const message = makeMessage("user", {
      content: [part]
    });
    return makePrompt([message]);
  }
  if (Predicate.isIterable(input)) {
    return makePrompt(decodeMessagesSync(Arr.fromIterable(input), {
      errors: "all"
    }));
  }
  return input;
};
/**
 * Creates a Prompt from an array of messages.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const messages: ReadonlyArray<Prompt.Message> = [
 *   Prompt.makeMessage("system", {
 *     content: "You are a coding assistant."
 *   }),
 *   Prompt.makeMessage("user", {
 *     content: [Prompt.makePart("text", { text: "Help me with TypeScript" })]
 *   })
 * ]
 *
 * const prompt = Prompt.fromMessages(messages)
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromMessages = messages => makePrompt(messages);
/**
 * Creates a Prompt from the response parts of a previous interaction with a
 * large language model.
 *
 * Converts streaming or non-streaming AI response parts into a structured
 * prompt, typically for use in conversation history or further processing.
 *
 * @example
 * ```ts
 * import { Prompt, Response } from "effect/unstable/ai"
 *
 * const responseParts: ReadonlyArray<Response.AnyPart> = [
 *   Response.makePart("text", {
 *     text: "Hello there!"
 *   }),
 *   Response.makePart("tool-call", {
 *     id: "call_1",
 *     name: "get_time",
 *     params: {},
 *     providerExecuted: false
 *   }),
 *   Response.makePart("tool-result", {
 *     id: "call_1",
 *     name: "get_time",
 *     isFailure: false,
 *     result: "10:30 AM",
 *     encodedResult: "10:30 AM",
 *     providerExecuted: false,
 *     preliminary: false
 *   })
 * ]
 *
 * const prompt = Prompt.fromResponseParts(responseParts)
 * // Creates an assistant message with the response content
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromResponseParts = parts => {
  if (parts.length === 0) {
    return empty;
  }
  const assistantParts = [];
  const toolParts = [];
  const activeTextDeltas = new Map();
  const activeReasoningDeltas = new Map();
  for (const part of parts) {
    switch (part.type) {
      // Text Parts
      case "text":
        {
          assistantParts.push(makePart("text", {
            text: part.text
          }));
          break;
        }
      // Text Parts (streaming)
      case "text-start":
        {
          activeTextDeltas.set(part.id, {
            text: ""
          });
          break;
        }
      case "text-delta":
        {
          if (activeTextDeltas.has(part.id)) {
            activeTextDeltas.get(part.id).text += part.delta;
          }
          break;
        }
      case "text-end":
        {
          if (activeTextDeltas.has(part.id)) {
            assistantParts.push(makePart("text", activeTextDeltas.get(part.id)));
          }
          break;
        }
      // Reasoning Parts
      case "reasoning":
        {
          assistantParts.push(makePart("reasoning", {
            text: part.text
          }));
          break;
        }
      // Reasoning Parts (streaming)
      case "reasoning-start":
        {
          activeReasoningDeltas.set(part.id, {
            text: ""
          });
          break;
        }
      case "reasoning-delta":
        {
          if (activeReasoningDeltas.has(part.id)) {
            activeReasoningDeltas.get(part.id).text += part.delta;
          }
          break;
        }
      case "reasoning-end":
        {
          if (activeReasoningDeltas.has(part.id)) {
            assistantParts.push(makePart("reasoning", activeReasoningDeltas.get(part.id)));
          }
          break;
        }
      // Tool Call Parts
      case "tool-call":
        {
          assistantParts.push(makePart("tool-call", {
            id: part.id,
            name: part.name,
            params: part.params,
            providerExecuted: part.providerExecuted ?? false
          }));
          break;
        }
      // Tool Result Parts (skip preliminary results)
      case "tool-result":
        {
          if (part.preliminary !== true) {
            toolParts.push(makePart("tool-result", {
              id: part.id,
              name: part.name,
              isFailure: part.isFailure,
              result: part.encodedResult
            }));
          }
          break;
        }
      // Tool Approval Request Parts
      case "tool-approval-request":
        {
          assistantParts.push(makePart("tool-approval-request", {
            approvalId: part.approvalId,
            toolCallId: part.toolCallId
          }));
          break;
        }
    }
  }
  if (assistantParts.length === 0 && toolParts.length === 0) {
    return empty;
  }
  const messages = [];
  if (assistantParts.length > 0) {
    messages.push(makeMessage("assistant", {
      content: assistantParts
    }));
  }
  if (toolParts.length > 0) {
    messages.push(makeMessage("tool", {
      content: toolParts
    }));
  }
  return makePrompt(messages);
};
// =============================================================================
// Merging Prompts
// =============================================================================
/**
 * Concatenates a prompt with additional raw input by concatenating messages.
 *
 * Creates a new prompt containing all messages from both the original prompt,
 * and the provided raw input, maintaining the order of messages.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are a helpful assistant."
 * }])
 *
 * const merged = Prompt.concat(systemPrompt, "Hello, world!")
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const concat = /*#__PURE__*/dual(2, (self, input) => {
  const other = make(input);
  if (self.content.length === 0) {
    return other;
  }
  if (other.content.length === 0) {
    return self;
  }
  return fromMessages([...self.content, ...other.content]);
});
// =============================================================================
// Manipulating Prompts
// =============================================================================
/**
 * Creates a new prompt from the specified prompt with the system message set
 * to the specified text content.
 *
 * **NOTE**: This method will remove and replace any previous system message
 * from the prompt.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are a helpful assistant."
 * }])
 *
 * const userPrompt = Prompt.make("Hello, world!")
 *
 * const prompt = Prompt.concat(systemPrompt, userPrompt)
 *
 * const replaced = Prompt.setSystem(
 *   prompt,
 *   "You are an expert in programming"
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const setSystem = /*#__PURE__*/dual(2, (self, content) => {
  const messages = [makeMessage("system", {
    content
  })];
  for (const message of self.content) {
    if (message.role !== "system") {
      messages.push(message);
    }
  }
  return makePrompt(messages);
});
/**
 * Creates a new prompt from the specified prompt with the provided text content
 * prepended to the start of existing system message content.
 *
 * If no system message exists in the specified prompt, the provided content
 * will be used to create a system message.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are an expert in programming."
 * }])
 *
 * const userPrompt = Prompt.make("Hello, world!")
 *
 * const prompt = Prompt.concat(systemPrompt, userPrompt)
 *
 * const replaced = Prompt.prependSystem(
 *   prompt,
 *   "You are a helpful assistant. "
 * )
 * // result content: "You are a helpful assistant. You are an expert in programming."
 * ```
 *
 * @since 1.0.0
 * @category Combinators
 */
export const prependSystem = /*#__PURE__*/dual(2, (self, content) => {
  let system = undefined;
  for (const message of self.content) {
    if (message.role === "system") {
      system = makeMessage("system", {
        content: content + message.content
      });
      break;
    }
  }
  if (Predicate.isUndefined(system)) {
    system = makeMessage("system", {
      content
    });
  }
  return makePrompt([system, ...self.content]);
});
/**
 * Creates a new prompt from the specified prompt with the provided text content
 * appended to the end of existing system message content.
 *
 * If no system message exists in the specified prompt, the provided content
 * will be used to create a system message.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemPrompt = Prompt.make([{
 *   role: "system",
 *   content: "You are an expert in programming."
 * }])
 *
 * const userPrompt = Prompt.make("Hello, world!")
 *
 * const prompt = Prompt.concat(systemPrompt, userPrompt)
 *
 * const replaced = Prompt.appendSystem(
 *   prompt,
 *   " You are a helpful assistant."
 * )
 * // result content: "You are an expert in programming. You are a helpful assistant."
 * ```
 *
 * @since 1.0.0
 * @category Combinators
 */
export const appendSystem = /*#__PURE__*/dual(2, (self, content) => {
  let system = undefined;
  for (const message of self.content) {
    if (message.role === "system") {
      system = makeMessage("system", {
        content: message.content + content
      });
      break;
    }
  }
  if (Predicate.isUndefined(system)) {
    system = makeMessage("system", {
      content
    });
  }
  return makePrompt([system, ...self.content]);
});
//# sourceMappingURL=Prompt.js.map