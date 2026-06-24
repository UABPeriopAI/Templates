import { type Pipeable } from "../../Pipeable.ts";
import * as Schema from "../../Schema.ts";
import type * as Response from "./Response.ts";
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
export declare const ProviderOptions: Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>;
/**
 * @since 4.0.0
 * @category models
 */
export type ProviderOptions = typeof ProviderOptions.Type;
declare const PartTypeId: "~effect/ai/Prompt/Part";
/**
 * Type guard to check if a value is a Part.
 *
 * @since 4.0.0
 * @category Guards
 */
export declare const isPart: (u: unknown) => u is Part;
/**
 * Union type representing all possible content parts within messages.
 *
 * Parts are the building blocks of message content, supporting text, files,
 * reasoning, tool calls, and tool results.
 *
 * @since 4.0.0
 * @category models
 */
export type Part = TextPart | ReasoningPart | FilePart | ToolCallPart | ToolResultPart | ToolApprovalResponsePart | ToolApprovalRequestPart;
/**
 * Encoded representation of a Part.
 *
 * @since 4.0.0
 * @category models
 */
export type PartEncoded = TextPartEncoded | ReasoningPartEncoded | FilePartEncoded | ToolCallPartEncoded | ToolResultPartEncoded | ToolApprovalResponsePartEncoded | ToolApprovalRequestPartEncoded;
/**
 * Base interface for all content parts.
 *
 * Provides common structure including type and provider options.
 *
 * @since 4.0.0
 * @category models
 */
export interface BasePart<Type extends string, Options extends ProviderOptions> {
    readonly [PartTypeId]: typeof PartTypeId;
    /**
     * The type of this content part.
     */
    readonly type: Type;
    /**
     * Provider-specific options for this part.
     */
    readonly options: Options;
}
/**
 * Base interface for encoded content parts.
 *
 * @since 4.0.0
 * @category models
 */
export interface BasePartEncoded<Type extends string, Options extends ProviderOptions> {
    /**
     * The type of this content part.
     */
    readonly type: Type;
    /**
     * Provider-specific options for this part.
     */
    readonly options?: Options | undefined;
}
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
export declare const makePart: <const Type extends Part["type"]>(
/**
 * The type of part to create.
 */
type: Type, 
/**
 * Parameters specific to the part type being created.
 */
params: Omit<Extract<Part, {
    type: Type;
}>, typeof PartTypeId | "type" | "options"> & {
    /**
     * Optional provider-specific options for this part.
     */
    readonly options?: Extract<Part, {
        type: Type;
    }>["options"] | undefined;
}) => Extract<Part, {
    type: Type;
}>;
/**
 * A utility type for specifying the parameters required to construct a
 * specific part of a prompt.
 *
 * @since 4.0.0
 * @category Utility Types
 */
export type PartConstructorParams<P extends Part> = Omit<P, typeof PartTypeId | "type" | "options"> & {
    /**
     * Optional provider-specific options for this part.
     */
    readonly options?: Part["options"] | undefined;
};
/**
 * Content part representing plain text.
 *
 * The most basic content type used for textual information in messages.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textPart: Prompt.TextPart = Prompt.makePart("text", {
 *   text: "Hello, how can I help you today?"
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface TextPart extends BasePart<"text", TextPartOptions> {
    /**
     * The text content.
     */
    readonly text: string;
}
/**
 * Encoded representation of text parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface TextPartEncoded extends BasePartEncoded<"text", TextPartOptions> {
    /**
     * The text content.
     */
    readonly text: string;
}
/**
 * Represents provider-specific options that can be associated with a
 * `TextPart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface TextPartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of text parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const TextPart: Schema.Struct<{
    readonly type: Schema.Literal<"text">;
    readonly text: Schema.String;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new text part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const textPart: (params: PartConstructorParams<TextPart>) => TextPart;
/**
 * Content part representing reasoning or chain-of-thought.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const reasoningPart: Prompt.ReasoningPart = Prompt.makePart("reasoning", {
 *   text:
 *     "Let me think step by step: First I need to understand the user's question..."
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ReasoningPart extends BasePart<"reasoning", ReasoningPartOptions> {
    /**
     * The reasoning or thought process text.
     */
    readonly text: string;
}
/**
 * Encoded representation of reasoning parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ReasoningPartEncoded extends BasePartEncoded<"reasoning", ReasoningPartOptions> {
    /**
     * The reasoning or thought process text.
     */
    readonly text: string;
}
/**
 * Represents provider-specific options that can be associated with a
 * `ReasoningPart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ReasoningPartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of reasoning parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ReasoningPart: Schema.Struct<{
    readonly type: Schema.Literal<"reasoning">;
    readonly text: Schema.String;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new reasoning part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const reasoningPart: (params: PartConstructorParams<ReasoningPart>) => ReasoningPart;
/**
 * Content part representing a file attachment. Files can be provided as base64
 * strings of data, byte arrays, or URLs.
 *
 * Supports various file types including images, documents, and binary data.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const imagePart: Prompt.FilePart = Prompt.makePart("file", {
 *   mediaType: "image/jpeg",
 *   fileName: "photo.jpg",
 *   data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
 * })
 *
 * const documentPart: Prompt.FilePart = Prompt.makePart("file", {
 *   mediaType: "application/pdf",
 *   fileName: "report.pdf",
 *   data: new Uint8Array([1, 2, 3])
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface FilePart extends BasePart<"file", FilePartOptions> {
    /**
     * MIME type of the file (e.g., "image/jpeg", "application/pdf").
     */
    readonly mediaType: string;
    /**
     * Optional filename for the file.
     */
    readonly fileName?: string | undefined;
    /**
     * File data as base64 string of data, a byte array, or a URL.
     */
    readonly data: string | Uint8Array | URL;
}
/**
 * Encoded representation of file parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface FilePartEncoded extends BasePartEncoded<"file", FilePartOptions> {
    /**
     * MIME type of the file (e.g., "image/jpeg", "application/pdf").
     */
    readonly mediaType: string;
    /**
     * Optional filename for the file.
     */
    readonly fileName?: string | undefined;
    /**
     * File data as base64 string of data, a byte array, or a URL.
     */
    readonly data: string | Uint8Array | URL;
}
/**
 * Represents provider-specific options that can be associated with a
 * `FilePart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface FilePartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of file parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const FilePart: Schema.Struct<{
    readonly type: Schema.Literal<"file">;
    readonly mediaType: Schema.String;
    readonly fileName: Schema.optional<Schema.String>;
    readonly data: Schema.Union<readonly [Schema.String, Schema.Uint8Array, Schema.URL]>;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new file part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const filePart: (params: PartConstructorParams<FilePart>) => FilePart;
/**
 * Content part representing a tool call request.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const toolCallPart: Prompt.ToolCallPart = Prompt.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco", units: "celsius" },
 *   providerExecuted: false
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolCallPart extends BasePart<"tool-call", ToolCallPartOptions> {
    /**
     * Unique identifier for this tool call.
     */
    readonly id: string;
    /**
     * Name of the tool to invoke.
     */
    readonly name: string;
    /**
     * Parameters to pass to the tool.
     */
    readonly params: unknown;
    /**
     * Whether the tool was executed by the provider (true) or framework (false).
     */
    readonly providerExecuted: boolean;
}
/**
 * Encoded representation of tool call parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolCallPartEncoded extends BasePartEncoded<"tool-call", ToolCallPartOptions> {
    /**
     * Unique identifier for this tool call.
     */
    readonly id: string;
    /**
     * Name of the tool to invoke.
     */
    readonly name: string;
    /**
     * Parameters to pass to the tool.
     */
    readonly params: unknown;
    /**
     * Whether the tool was executed by the provider (true) or framework (false).
     */
    readonly providerExecuted?: boolean | undefined;
}
/**
 * Represents provider-specific options that can be associated with a
 * `ToolCallPart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ToolCallPartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of tool call parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ToolCallPart: Schema.Struct<{
    readonly type: Schema.Literal<"tool-call">;
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly params: Schema.Unknown;
    readonly providerExecuted: Schema.withDecodingDefault<Schema.Boolean>;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new tool call part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const toolCallPart: (params: PartConstructorParams<ToolCallPart>) => ToolCallPart;
/**
 * Content part representing the result of a tool call.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const toolResultPart: Prompt.ToolResultPart = Prompt.makePart("tool-result", {
 *   id: "call_123",
 *   name: "get_weather",
 *   isFailure: false,
 *   result: {
 *     temperature: 22,
 *     condition: "sunny",
 *     humidity: 65
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolResultPart extends BasePart<"tool-result", ToolResultPartOptions> {
    /**
     * Unique identifier matching the original tool call.
     */
    readonly id: string;
    /**
     * Name of the tool that was executed.
     */
    readonly name: string;
    /**
     * Whether or not the result of executing the tool call handler was an error.
     */
    readonly isFailure: boolean;
    /**
     * The result returned by the tool execution.
     */
    readonly result: unknown;
}
/**
 * Encoded representation of tool result parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolResultPartEncoded extends BasePartEncoded<"tool-result", ToolResultPartOptions> {
    /**
     * Unique identifier matching the original tool call.
     */
    readonly id: string;
    /**
     * Name of the tool that was executed.
     */
    readonly name: string;
    /**
     * Whether or not the result of executing the tool call handler was an error.
     */
    readonly isFailure: boolean;
    /**
     * The result returned by the tool execution.
     */
    readonly result: unknown;
}
/**
 * Represents provider-specific options that can be associated with a
 * `ToolResultPart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ToolResultPartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of tool result parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ToolResultPart: Schema.Struct<{
    readonly type: Schema.Literal<"tool-result">;
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly isFailure: Schema.Boolean;
    readonly result: Schema.Unknown;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new tool result part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const toolResultPart: (params: PartConstructorParams<ToolResultPart>) => ToolResultPart;
/**
 * Content part representing a user's response to a tool approval request.
 *
 * Used in tool messages to approve or deny tool execution when tools have
 * the `needsApproval` property set.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const approvalResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(
 *   "tool-approval-response",
 *   {
 *     approvalId: "approval_123",
 *     approved: true
 *   }
 * )
 *
 * const denialResponse: Prompt.ToolApprovalResponsePart = Prompt.makePart(
 *   "tool-approval-response",
 *   {
 *     approvalId: "approval_456",
 *     approved: false,
 *     reason: "Operation not allowed"
 *   }
 * )
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolApprovalResponsePart extends BasePart<"tool-approval-response", ToolApprovalResponsePartOptions> {
    /**
     * References the original approval request.
     */
    readonly approvalId: string;
    /**
     * User's decision to approve or deny the tool execution.
     */
    readonly approved: boolean;
    /**
     * Optional justification for the decision.
     */
    readonly reason?: string | undefined;
}
/**
 * Encoded representation of tool approval response parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolApprovalResponsePartEncoded extends BasePartEncoded<"tool-approval-response", ToolApprovalResponsePartOptions> {
    /**
     * References the original approval request.
     */
    readonly approvalId: string;
    /**
     * User's decision to approve or deny the tool execution.
     */
    readonly approved: boolean;
    /**
     * Optional justification for the decision.
     */
    readonly reason?: string | undefined;
}
/**
 * Represents provider-specific options that can be associated with a
 * `ToolApprovalResponsePart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ToolApprovalResponsePartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of tool approval response parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ToolApprovalResponsePart: Schema.Struct<{
    readonly type: Schema.Literal<"tool-approval-response">;
    readonly approvalId: Schema.String;
    readonly approved: Schema.Boolean;
    readonly reason: Schema.optional<Schema.String>;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new tool approval response part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const toolApprovalResponsePart: (params: PartConstructorParams<ToolApprovalResponsePart>) => ToolApprovalResponsePart;
/**
 * Content part representing a tool approval request from the framework.
 *
 * Stored in assistant messages when a tool requires user approval before
 * execution. The user responds with a `ToolApprovalResponsePart` in a tool
 * message.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const approvalRequest: Prompt.ToolApprovalRequestPart = Prompt.makePart(
 *   "tool-approval-request",
 *   {
 *     approvalId: "approval_123",
 *     toolCallId: "call_456"
 *   }
 * )
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolApprovalRequestPart extends BasePart<"tool-approval-request", ToolApprovalRequestPartOptions> {
    /**
     * Unique identifier for this approval flow.
     */
    readonly approvalId: string;
    /**
     * The tool call ID requiring approval.
     */
    readonly toolCallId: string;
}
/**
 * Encoded representation of tool approval request parts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolApprovalRequestPartEncoded extends BasePartEncoded<"tool-approval-request", ToolApprovalRequestPartOptions> {
    /**
     * Unique identifier for this approval flow.
     */
    readonly approvalId: string;
    /**
     * The tool call ID requiring approval.
     */
    readonly toolCallId: string;
}
/**
 * Represents provider-specific options that can be associated with a
 * `ToolApprovalRequestPart` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ToolApprovalRequestPartOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of tool approval request parts.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ToolApprovalRequestPart: Schema.Struct<{
    readonly type: Schema.Literal<"tool-approval-request">;
    readonly approvalId: Schema.String;
    readonly toolCallId: Schema.String;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new tool approval request part.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const toolApprovalRequestPart: (params: PartConstructorParams<ToolApprovalRequestPart>) => ToolApprovalRequestPart;
declare const MessageTypeId: "~effect/ai/Prompt/Message";
/**
 * Type guard to check if a value is a Message.
 *
 * @since 4.0.0
 * @category Guards
 */
export declare const isMessage: (u: unknown) => u is Message;
/**
 * Base interface for all message types.
 *
 * Provides common structure including role and provider options.
 *
 * @since 4.0.0
 * @category models
 */
export interface BaseMessage<Role extends string, Options extends ProviderOptions> {
    readonly [MessageTypeId]: typeof MessageTypeId;
    /**
     * The role of the message participant.
     */
    readonly role: Role;
    /**
     * Provider-specific options for this message.
     */
    readonly options: Options;
}
/**
 * Base interface for encoded message types.
 *
 * @template Role - String literal type for the message role
 *
 * @since 4.0.0
 * @category models
 */
export interface BaseMessageEncoded<Role extends string, Options extends ProviderOptions> {
    /**
     * The role of the message participant.
     */
    readonly role: Role;
    /**
     * Provider-specific options for this message.
     */
    readonly options?: Options | undefined;
}
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
export declare const makeMessage: <const Role extends Message["role"]>(role: Role, params: Omit<Extract<Message, {
    role: Role;
}>, typeof MessageTypeId | "role" | "options"> & {
    readonly options?: Extract<Message, {
        role: Role;
    }>["options"] | undefined;
}) => Extract<Message, {
    role: Role;
}>;
/**
 * A utility type for specifying the parameters required to construct a
 * specific message for a prompt.
 *
 * @since 4.0.0
 * @category Utility Types
 */
export type MessageConstructorParams<M extends Message> = Omit<M, typeof MessageTypeId | "role" | "options"> & {
    /**
     * Optional provider-specific options for this message.
     */
    readonly options?: Part["options"] | undefined;
};
/**
 * Schema for decoding message content (i.e. an array containing a single
 * `TextPart`) from a string.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ContentFromString: Schema.decodeTo<Schema.NonEmptyArray<Schema.toType<Schema.Struct<{
    readonly type: Schema.Literal<"text">;
    readonly text: Schema.String;
    readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>>>, Schema.String>;
/**
 * Message representing system instructions or context.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const systemMessage: Prompt.SystemMessage = Prompt.makeMessage("system", {
 *   content: "You are a helpful assistant specialized in mathematics. " +
 *     "Always show your work step by step."
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface SystemMessage extends BaseMessage<"system", SystemMessageOptions> {
    /**
     * The system instruction or context as plain text.
     */
    readonly content: string;
}
/**
 * Encoded representation of system messages for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface SystemMessageEncoded extends BaseMessageEncoded<"system", SystemMessageOptions> {
    /**
     * The system instruction or context as plain text.
     */
    readonly content: string;
}
/**
 * Represents provider-specific options that can be associated with a
 * `SystemMessage` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface SystemMessageOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of system messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const SystemMessage: Schema.Struct<{
    readonly role: Schema.Literal<"system">;
    readonly content: Schema.String;
    readonly "~effect/ai/Prompt/Message": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Message">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new system message.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const systemMessage: (params: MessageConstructorParams<SystemMessage>) => SystemMessage;
/**
 * Message representing user input or questions.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const textUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {
 *   content: [
 *     Prompt.makePart("text", {
 *       text: "Can you analyze this image for me?"
 *     })
 *   ]
 * })
 *
 * const multimodalUserMessage: Prompt.UserMessage = Prompt.makeMessage("user", {
 *   content: [
 *     Prompt.makePart("text", {
 *       text: "What do you see in this image?"
 *     }),
 *     Prompt.makePart("file", {
 *       mediaType: "image/jpeg",
 *       fileName: "vacation.jpg",
 *       data: "data:image/jpeg;base64,..."
 *     })
 *   ]
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface UserMessage extends BaseMessage<"user", UserMessageOptions> {
    /**
     * Array of content parts that make up the user's message.
     */
    readonly content: ReadonlyArray<UserMessagePart>;
}
/**
 * Union type of content parts allowed in user messages.
 *
 * @since 4.0.0
 * @category models
 */
export type UserMessagePart = TextPart | FilePart;
/**
 * Encoded representation of user messages for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface UserMessageEncoded extends BaseMessageEncoded<"user", UserMessageOptions> {
    /**
     * Array of content parts that make up the user's message.
     */
    readonly content: string | ReadonlyArray<UserMessagePartEncoded>;
}
/**
 * Union type of encoded content parts for user messages.
 *
 * @since 4.0.0
 * @category models
 */
export type UserMessagePartEncoded = TextPartEncoded | FilePartEncoded;
/**
 * Represents provider-specific options that can be associated with a
 * `UserMessage` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface UserMessageOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of user messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const UserMessage: Schema.Struct<{
    readonly role: Schema.Literal<"user">;
    readonly content: Schema.Union<readonly [
        Schema.decodeTo<Schema.NonEmptyArray<Schema.toType<Schema.Struct<{
            readonly type: Schema.Literal<"text">;
            readonly text: Schema.String;
            readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
            readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
        }>>>, Schema.String, never, never>,
        Schema.$Array<Schema.Union<readonly [
            Schema.Struct<{
                readonly type: Schema.Literal<"text">;
                readonly text: Schema.String;
                readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
                readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
            }>,
            Schema.Struct<{
                readonly type: Schema.Literal<"file">;
                readonly mediaType: Schema.String;
                readonly fileName: Schema.optional<Schema.String>;
                readonly data: Schema.Union<readonly [Schema.String, Schema.Uint8Array, Schema.URL]>;
                readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
                readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
            }>
        ]>>
    ]>;
    readonly "~effect/ai/Prompt/Message": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Message">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new user message.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const userMessage: (params: MessageConstructorParams<UserMessage>) => UserMessage;
/**
 * Message representing large language model assistant responses.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const assistantMessage: Prompt.AssistantMessage = Prompt.makeMessage(
 *   "assistant",
 *   {
 *     content: [
 *       Prompt.makePart("text", {
 *         text:
 *           "The user is asking about the weather. I should use the weather tool."
 *       }),
 *       Prompt.makePart("tool-call", {
 *         id: "call_123",
 *         name: "get_weather",
 *         params: { city: "San Francisco" },
 *         providerExecuted: false
 *       }),
 *       Prompt.makePart("tool-result", {
 *         id: "call_123",
 *         name: "get_weather",
 *         isFailure: false,
 *         result: {
 *           temperature: 72,
 *           condition: "sunny"
 *         }
 *       }),
 *       Prompt.makePart("text", {
 *         text: "The weather in San Francisco is currently 72°F and sunny."
 *       })
 *     ]
 *   }
 * )
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface AssistantMessage extends BaseMessage<"assistant", AssistantMessageOptions> {
    /**
     * Array of content parts that make up the assistant's response.
     */
    readonly content: ReadonlyArray<AssistantMessagePart>;
}
/**
 * Union type of content parts allowed in assistant messages.
 *
 * @since 4.0.0
 * @category models
 */
export type AssistantMessagePart = TextPart | FilePart | ReasoningPart | ToolCallPart | ToolResultPart | ToolApprovalRequestPart;
/**
 * Encoded representation of assistant messages for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface AssistantMessageEncoded extends BaseMessageEncoded<"assistant", AssistantMessageOptions> {
    readonly content: string | ReadonlyArray<AssistantMessagePartEncoded>;
}
/**
 * Union type of encoded content parts for assistant messages.
 *
 * @since 4.0.0
 * @category models
 */
export type AssistantMessagePartEncoded = TextPartEncoded | FilePartEncoded | ReasoningPartEncoded | ToolCallPartEncoded | ToolResultPartEncoded | ToolApprovalRequestPartEncoded;
/**
 * Represents provider-specific options that can be associated with a
 * `AssistantMessage` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface AssistantMessageOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of assistant messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const AssistantMessage: Schema.Struct<{
    readonly role: Schema.Literal<"assistant">;
    readonly content: Schema.Union<readonly [
        Schema.decodeTo<Schema.NonEmptyArray<Schema.toType<Schema.Struct<{
            readonly type: Schema.Literal<"text">;
            readonly text: Schema.String;
            readonly "~effect/ai/Prompt/Part": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Part">>;
            readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
        }>>>, Schema.String, never, never>,
        Schema.$Array<Schema.Union<readonly [
            typeof TextPart,
            typeof FilePart,
            typeof ReasoningPart,
            typeof ToolCallPart,
            typeof ToolResultPart,
            typeof ToolApprovalRequestPart
        ]>>
    ]>;
    readonly "~effect/ai/Prompt/Message": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Message">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new assistant message.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const assistantMessage: (params: MessageConstructorParams<AssistantMessage>) => AssistantMessage;
/**
 * Message representing tool execution results.
 *
 * @example
 * ```ts
 * import { Prompt } from "effect/unstable/ai"
 *
 * const toolMessage: Prompt.ToolMessage = Prompt.makeMessage("tool", {
 *   content: [
 *     Prompt.makePart("tool-result", {
 *       id: "call_123",
 *       name: "search_web",
 *       isFailure: false,
 *       result: {
 *         query: "TypeScript best practices",
 *         results: [
 *           { title: "TypeScript Handbook", url: "https://..." },
 *           { title: "Effective TypeScript", url: "https://..." }
 *         ]
 *       }
 *     })
 *   ]
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolMessage extends BaseMessage<"tool", ToolMessageOptions> {
    /**
     * Array of tool result parts.
     */
    readonly content: ReadonlyArray<ToolMessagePart>;
}
/**
 * Union type of content parts allowed in tool messages.
 *
 * @since 4.0.0
 * @category models
 */
export type ToolMessagePart = ToolResultPart | ToolApprovalResponsePart;
/**
 * Encoded representation of tool messages for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface ToolMessageEncoded extends BaseMessageEncoded<"tool", ToolMessageOptions> {
    /**
     * Array of tool result parts.
     */
    readonly content: ReadonlyArray<ToolMessagePartEncoded>;
}
/**
 * Union type of encoded content parts for tool messages.
 *
 * @since 4.0.0
 * @category models
 */
export type ToolMessagePartEncoded = ToolResultPartEncoded | ToolApprovalResponsePartEncoded;
/**
 * Represents provider-specific options that can be associated with a
 * `ToolMessage` through module augmentation.
 *
 * @since 4.0.0
 * @category ProviderOptions
 */
export interface ToolMessageOptions extends ProviderOptions {
}
/**
 * Schema for validation and encoding of tool messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const ToolMessage: Schema.Struct<{
    readonly role: Schema.Literal<"tool">;
    readonly content: Schema.$Array<Schema.Union<readonly [typeof ToolResultPart, typeof ToolApprovalResponsePart]>>;
    readonly "~effect/ai/Prompt/Message": Schema.withDecodingDefaultKey<Schema.Literal<"~effect/ai/Prompt/Message">>;
    readonly options: Schema.withDecodingDefault<Schema.$Record<Schema.String, Schema.NullOr<Schema.Codec<Schema.Json>>>>;
}>;
/**
 * Constructs a new tool message.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const toolMessage: (params: MessageConstructorParams<ToolMessage>) => ToolMessage;
/**
 * A type representing all possible message types in a conversation.
 *
 * @since 4.0.0
 * @category models
 */
export type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage;
/**
 * A type representing all possible encoded message types for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export type MessageEncoded = SystemMessageEncoded | UserMessageEncoded | AssistantMessageEncoded | ToolMessageEncoded;
/**
 * Schema for validation and encoding of messages.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const Message: Schema.Codec<Message, MessageEncoded>;
declare const TypeId: "~effect/unstable/ai/Prompt";
/**
 * Type guard to check if a value is a Prompt.
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isPrompt: (u: unknown) => u is Prompt;
/**
 * A Prompt contains a sequence of messages that form the context of a
 * conversation with a large language model.
 *
 * @since 4.0.0
 * @category models
 */
export interface Prompt extends Pipeable {
    readonly [TypeId]: typeof TypeId;
    /**
     * Array of messages that make up the conversation.
     */
    readonly content: ReadonlyArray<Message>;
}
/**
 * Encoded representation of prompts for serialization.
 *
 * @since 4.0.0
 * @category models
 */
export interface PromptEncoded {
    /**
     * Array of messages that make up the conversation.
     */
    readonly content: ReadonlyArray<MessageEncoded>;
}
/**
 * Describes a schema that represents a `Prompt` instance.
 *
 * @since 4.0.0
 * @category schemas
 */
export declare const Prompt: Schema.Codec<Prompt, PromptEncoded>;
/**
 * Raw input types that can be converted into a Prompt.
 *
 * Supports various input formats for convenience, including simple strings,
 * message arrays, response parts, and existing prompts.
 *
 * @example
 * ```ts
 * import type { Prompt } from "effect/unstable/ai"
 *
 * // String input - creates a user message
 * const stringInput: Prompt.RawInput = "Hello, world!"
 *
 * // Message array input
 * const messagesInput: Prompt.RawInput = [
 *   { role: "system", content: "You are helpful." },
 *   { role: "user", content: [{ type: "text", text: "Hi!" }] }
 * ]
 *
 * // Existing prompt
 * declare const existingPrompt: Prompt.Prompt
 * const promptInput: Prompt.RawInput = existingPrompt
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type RawInput = string | Iterable<MessageEncoded> | Prompt;
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
export declare const empty: Prompt;
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
export declare const make: (input: RawInput) => Prompt;
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
export declare const fromMessages: (messages: ReadonlyArray<Message>) => Prompt;
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
export declare const fromResponseParts: (parts: ReadonlyArray<Response.AnyPart>) => Prompt;
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
export declare const concat: {
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
    (input: RawInput): (self: Prompt) => Prompt;
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
    (self: Prompt, input: RawInput): Prompt;
};
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
export declare const setSystem: {
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
    (content: string): (self: Prompt) => Prompt;
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
    (self: Prompt, content: string): Prompt;
};
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
export declare const prependSystem: {
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
    (content: string): (self: Prompt) => Prompt;
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
    (self: Prompt, content: string): Prompt;
};
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
export declare const appendSystem: {
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
    (content: string): (self: Prompt) => Prompt;
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
    (self: Prompt, content: string): Prompt;
};
export {};
//# sourceMappingURL=Prompt.d.ts.map