/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { constFalse, constTrue } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Getter from "../../SchemaGetter.js";
import * as Rpc from "../rpc/Rpc.js";
import * as RpcGroup from "../rpc/RpcGroup.js";
import * as RpcMiddleware from "../rpc/RpcMiddleware.js";
/**
 * @since 4.0.0
 */
export const optionalWithDefault = (schema, defaultValue) => {
  const effect = Effect.sync(defaultValue);
  return Schema.optionalKey(schema).pipe(Schema.decode({
    decode: Getter.withDefault(effect),
    encode: Getter.passthrough()
  }), Schema.withConstructorDefault(effect));
};
/**
 * @since 4.0.0
 */
export const optional = schema => Schema.optionalKey(schema).pipe(Schema.decodeTo(Schema.optional(schema), {
  decode: Getter.passthrough(),
  encode: Getter.transformOptional(Option.flatMap(Option.fromUndefinedOr))
}));
// =============================================================================
// Common
// =============================================================================
/**
 * A uniquely identifying ID for a request in JSON-RPC.
 *
 * @since 4.0.0
 * @category common
 */
export const RequestId = /*#__PURE__*/Schema.Union([Schema.String, Schema.Number]);
/**
 * A progress token, used to associate progress notifications with the original
 * request.
 *
 * @since 4.0.0
 * @category common
 */
export const ProgressToken = /*#__PURE__*/Schema.Union([Schema.String, Schema.Number]);
/**
 * @since 4.0.0
 * @category common
 */
export class RequestMeta extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({
    /**
     * If specified, the caller is requesting out-of-band progress notifications
     * for this request (as represented by notifications/progress). The value of
     * this parameter is an opaque token that will be attached to any subsequent
     * notifications. The receiver is not obligated to provide these
     * notifications.
     */
    progressToken: /*#__PURE__*/optional(ProgressToken)
  }))
})) {}
/**
 * @since 4.0.0
 * @category common
 */
export class ResultMeta extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * This result property is reserved by the protocol to allow clients and
   * servers to attach additional metadata to their responses.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
})) {}
/**
 * @since 4.0.0
 * @category common
 */
export class NotificationMeta extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * This parameter name is reserved by MCP to allow clients and servers to
   * attach additional metadata to their notifications.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
})) {}
/**
 * An opaque token used to represent a cursor for pagination.
 *
 * @since 4.0.0
 * @category common
 */
export const Cursor = Schema.String;
/**
 * @since 4.0.0
 * @category common
 */
export class PaginatedRequestMeta extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...RequestMeta.fields,
  /**
   * An opaque token representing the current pagination position.
   * If provided, the server should return results starting after this cursor.
   */
  cursor: /*#__PURE__*/optional(Cursor)
})) {}
/**
 * @since 4.0.0
 * @category common
 */
export class PaginatedResultMeta extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...ResultMeta.fields,
  /**
   * An opaque token representing the pagination position after the last returned result.
   * If present, there may be more results available.
   */
  nextCursor: /*#__PURE__*/optional(Cursor)
})) {}
/**
 * The sender or recipient of messages and data in a conversation.
 * @since 4.0.0
 * @category common
 */
export const Role = /*#__PURE__*/Schema.Literals(["user", "assistant"]);
/**
 * Optional annotations for the client. The client can use annotations to
 * inform how objects are used or displayed
 *
 * @since 4.0.0
 * @category common
 */
export class Annotations extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * Describes who the intended customer of this object or data is.
   *
   * It can include multiple entries to indicate content useful for multiple
   * audiences (e.g., `["user", "assistant"]`).
   */
  audience: /*#__PURE__*/optional(/*#__PURE__*/Schema.Array(Role)),
  /**
   * Describes how important this data is for operating the server.
   *
   * A value of 1 means "most important," and indicates that the data is
   * effectively required, while 0 means "least important," and indicates that
   * the data is entirely optional.
   */
  priority: /*#__PURE__*/optional(/*#__PURE__*/Schema.Number.check(/*#__PURE__*/Schema.isBetween({
    minimum: 0,
    maximum: 1
  })))
})) {}
/**
 * Describes the name and version of an MCP implementation.
 *
 * @since 4.0.0
 * @category common
 */
export class Implementation extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  version: Schema.String
})) {}
/**
 * Capabilities a client may support. Known capabilities are defined here, in
 * this schema, but this is not a closed set: any client can define its own,
 * additional capabilities.
 *
 * @since 4.0.0
 * @category common
 */
export class ClientCapabilities extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ClientCapabilities")({
  /**
   * Experimental, non-standard capabilities that the client supports.
   */
  experimental: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.Struct({}))),
  /**
   * Optional extensions capabilities advertised by the client.
   * Keys are extension identifiers following <vendor-prefix>/<extension-name> (e.g. "io.modelcontextprotocol/ui").
   */
  extensions: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(/*#__PURE__*/Schema.TemplateLiteral([Schema.String, "/", Schema.String]), Schema.Json)),
  /**
   * Present if the client supports listing roots.
   */
  roots: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({
    /**
     * Whether the client supports notifications for changes to the roots list.
     */
    listChanged: /*#__PURE__*/optional(Schema.Boolean)
  })),
  /**
   * Present if the client supports sampling from an LLM.
   */
  sampling: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({})),
  /**
   * Present if the client supports elicitation from the server.
   */
  elicitation: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({}))
}) {}
/**
 * Capabilities that a server may support. Known capabilities are defined
 * here, in this schema, but this is not a closed set: any server can define
 * its own, additional capabilities.
 *
 * @since 4.0.0
 * @category common
 */
export class ServerCapabilities extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * Experimental, non-standard capabilities that the server supports.
   */
  experimental: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.Struct({}))),
  /**
   * Optional extensions capabilities advertised by the server.
   * Keys are extension identifiers following <vendor-prefix>/<extension-name> (e.g. "io.modelcontextprotocol/ui").
   */
  extensions: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(/*#__PURE__*/Schema.TemplateLiteral([Schema.String, "/", Schema.String]), Schema.Json)),
  /**
   * Present if the server supports sending log messages to the client.
   */
  logging: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({})),
  /**
   * Present if the server supports argument autocompletion suggestions.
   */
  completions: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({})),
  /**
   * Present if the server offers any prompt templates.
   */
  prompts: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({
    /**
     * Whether this server supports notifications for changes to the prompt list.
     */
    listChanged: /*#__PURE__*/optional(Schema.Boolean)
  })),
  /**
   * Present if the server offers any resources to read.
   */
  resources: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({
    /**
     * Whether this server supports subscribing to resource updates.
     */
    subscribe: /*#__PURE__*/optional(Schema.Boolean),
    /**
     * Whether this server supports notifications for changes to the resource list.
     */
    listChanged: /*#__PURE__*/optional(Schema.Boolean)
  })),
  /**
   * Present if the server offers any tools to call.
   */
  tools: /*#__PURE__*/optional(/*#__PURE__*/Schema.Struct({
    /**
     * Whether this server supports notifications for changes to the tool list.
     */
    listChanged: /*#__PURE__*/optional(Schema.Boolean)
  }))
})) {}
// =============================================================================
// Errors
// =============================================================================
/**
 * @since 4.0.0
 * @category errors
 */
export class McpErrorBase extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/McpErrorBase")({
  /**
   * The error type that occurred.
   */
  code: Schema.Number,
  /**
   * A short description of the error. The message SHOULD be limited to a
   * concise single sentence.
   */
  message: Schema.String,
  /**
   * Additional information about the error. The value of this member is
   * defined by the sender (e.g. detailed error information, nested errors etc.).
   */
  data: /*#__PURE__*/optional(Schema.Any)
}) {}
/**
 * @since 4.0.0
 * @category errors
 */
export const INVALID_REQUEST_ERROR_CODE = -32600;
/**
 * @since 4.0.0
 * @category errors
 */
export const METHOD_NOT_FOUND_ERROR_CODE = -32601;
/**
 * @since 4.0.0
 * @category errors
 */
export const INVALID_PARAMS_ERROR_CODE = -32602;
/**
 * @since 4.0.0
 * @category errors
 */
export const INTERNAL_ERROR_CODE = -32603;
/**
 * @since 4.0.0
 * @category errors
 */
export const PARSE_ERROR_CODE = -32700;
/**
 * @since 4.0.0
 * @category errors
 */
export class ParseError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/McpSchema/ParseError")({
  ...McpErrorBase.fields,
  _tag: /*#__PURE__*/Schema.tag("ParseError"),
  code: /*#__PURE__*/Schema.tag(PARSE_ERROR_CODE)
}) {}
/**
 * @since 4.0.0
 * @category errors
 */
export class InvalidRequest extends /*#__PURE__*/Schema.ErrorClass("effect/ai/McpSchema/InvalidRequest")({
  ...McpErrorBase.fields,
  _tag: /*#__PURE__*/Schema.tag("InvalidRequest"),
  code: /*#__PURE__*/Schema.tag(INVALID_REQUEST_ERROR_CODE)
}) {}
/**
 * @since 4.0.0
 * @category errors
 */
export class MethodNotFound extends /*#__PURE__*/Schema.ErrorClass("effect/ai/McpSchema/MethodNotFound")({
  ...McpErrorBase.fields,
  _tag: /*#__PURE__*/Schema.tag("MethodNotFound"),
  code: /*#__PURE__*/Schema.tag(METHOD_NOT_FOUND_ERROR_CODE)
}) {}
/**
 * @since 4.0.0
 * @category errors
 */
export class InvalidParams extends /*#__PURE__*/Schema.ErrorClass("effect/ai/McpSchema/InvalidParams")({
  ...McpErrorBase.fields,
  _tag: /*#__PURE__*/Schema.tag("InvalidParams"),
  code: /*#__PURE__*/Schema.tag(INVALID_PARAMS_ERROR_CODE)
}) {}
/**
 * @since 4.0.0
 * @category errors
 */
export class InternalError extends /*#__PURE__*/Schema.ErrorClass("effect/ai/McpSchema/InternalError")({
  ...McpErrorBase.fields,
  _tag: /*#__PURE__*/Schema.tag("InternalError"),
  code: /*#__PURE__*/Schema.tag(INTERNAL_ERROR_CODE)
}) {
  static notImplemented = /*#__PURE__*/new InternalError({
    message: "Not implemented"
  });
}
/**
 * @since 4.0.0
 * @category errors
 */
export const McpError = /*#__PURE__*/Schema.Union([ParseError, InvalidRequest, MethodNotFound, InvalidParams, InternalError, McpErrorBase]);
// =============================================================================
// Ping
// =============================================================================
/**
 * A ping, issued by either the server or the client, to check that the other
 * party is still alive. The receiver must promptly respond, or else may be
 * disconnected.
 *
 * @since 4.0.0
 * @category ping
 */
export class Ping extends /*#__PURE__*/Rpc.make("ping", {
  success: /*#__PURE__*/Schema.Struct({}),
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(RequestMeta)
}) {}
// =============================================================================
// Initialization
// =============================================================================
/**
 * After receiving an initialize request from the client, the server sends this
 * response.
 *
 * @since 4.0.0
 * @category initialization
 */
export class InitializeResult extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...ResultMeta.fields,
  /**
   * The version of the Model Context Protocol that the server wants to use.
   * This may not match the version that the client requested. If the client
   * cannot support this version, it MUST disconnect.
   */
  protocolVersion: Schema.String,
  capabilities: ServerCapabilities,
  serverInfo: Implementation,
  /**
   * Instructions describing how to use the server and its features.
   *
   * This can be used by clients to improve the LLM's understanding of available
   * tools, resources, etc. It can be thought of like a "hint" to the model.
   * For example, this information MAY be added to the system prompt.
   */
  instructions: /*#__PURE__*/optional(Schema.String)
})) {}
/**
 * This request is sent from the client to the server when it first connects,
 * asking it to begin initialization.
 *
 * @since 4.0.0
 * @category initialization
 */
export class Initialize extends /*#__PURE__*/Rpc.make("initialize", {
  success: InitializeResult,
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    /**
     * The latest version of the Model Context Protocol that the client
     * supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: Schema.String,
    /**
     * Capabilities a client may support. Known capabilities are defined here,
     * in this schema, but this is not a closed set: any client can define its
     * own, additional capabilities.
     */
    capabilities: ClientCapabilities,
    /**
     * Describes the name and version of an MCP implementation.
     */
    clientInfo: Implementation
  }
}) {}
/**
 * This notification is sent from the client to the server after initialization
 * has finished.
 *
 * @since 4.0.0
 * @category initialization
 */
export class InitializedNotification extends /*#__PURE__*/Rpc.make("notifications/initialized", {
  payload: /*#__PURE__*/Schema.UndefinedOr(NotificationMeta)
}) {}
// =============================================================================
// Cancellation
// =============================================================================
/**
 * @since 4.0.0
 * @category cancellation
 */
export class CancelledNotification extends /*#__PURE__*/Rpc.make("notifications/cancelled", {
  payload: {
    ...NotificationMeta.fields,
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the
     * same direction.
     */
    requestId: RequestId,
    /**
     * An optional string describing the reason for the cancellation. This MAY
     * be logged or presented to the user.
     */
    reason: /*#__PURE__*/optional(Schema.String)
  }
}) {}
// =============================================================================
// Progress
// =============================================================================
/**
 * An out-of-band notification used to inform the receiver of a progress update
 * for a long-running request.
 *
 * @since 4.0.0
 * @category progress
 */
export class ProgressNotification extends /*#__PURE__*/Rpc.make("notifications/progress", {
  payload: {
    ...NotificationMeta.fields,
    /**
     * The progress token which was given in the initial request, used to
     * associate this notification with the request that is proceeding.
     */
    progressToken: ProgressToken,
    /**
     * The progress thus far. This should increase every time progress is made,
     * even if the total is unknown.
     */
    progress: /*#__PURE__*/optional(Schema.Number),
    /**
     * Total number of items to process (or total progress required), if known.
     */
    total: /*#__PURE__*/optional(Schema.Number),
    /**
     * An optional message describing the current progress.
     */
    message: /*#__PURE__*/optional(Schema.String)
  }
}) {}
// =============================================================================
// Resources
// =============================================================================
/**
 * A known resource that the server is capable of reading.
 *
 * @since 4.0.0
 * @category resources
 */
export class Resource extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/Resource")({
  /**
   * The URI of this resource.
   */
  uri: Schema.String,
  /**
   * A human-readable name for this resource.
   *
   * This can be used by clients to populate UI elements.
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * A description of what this resource represents.
   *
   * This can be used by clients to improve the LLM's understanding of available
   * resources. It can be thought of like a "hint" to the model.
   */
  description: /*#__PURE__*/optional(Schema.String),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: /*#__PURE__*/optional(Schema.String),
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations),
  /**
   * The size of the raw resource content, in bytes (i.e., before base64
   * encoding or any tokenization), if known.
   *
   * This can be used by Hosts to display file sizes and estimate context
   * window usage.
   */
  size: /*#__PURE__*/optional(Schema.Number),
  /**
   * Optional additional metadata for the client.
   *
   * This parameter name is reserved by MCP to allow clients and servers to
   * attach additional metadata to resources.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
}) {}
/**
 * A template description for resources available on the server.
 *
 * @since 4.0.0
 * @category resources
 */
export class ResourceTemplate extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ResourceTemplate")({
  /**
   * A URI template (according to RFC 6570) that can be used to construct
   * resource URIs.
   */
  uriTemplate: Schema.String,
  /**
   * A human-readable name for the type of resource this template refers to.
   *
   * This can be used by clients to populate UI elements.
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * A description of what this template is for.
   *
   * This can be used by clients to improve the LLM's understanding of available
   * resources. It can be thought of like a "hint" to the model.
   */
  description: /*#__PURE__*/optional(Schema.String),
  /**
   * The MIME type for all resources that match this template. This should only
   * be included if all resources matching this template have the same type.
   */
  mimeType: /*#__PURE__*/optional(Schema.String),
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations),
  /**
   * Optional additional metadata for the client.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
}) {}
/**
 * The contents of a specific resource or sub-resource.
 *
 * @since 4.0.0
 * @category resources
 */
export class ResourceContents extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * The URI of this resource.
   */
  uri: Schema.String,
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: /*#__PURE__*/optional(Schema.String),
  /**
   * Optional additional metadata for the client.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
})) {}
/**
 * The contents of a text resource, which can be represented as a string.
 *
 * @since 4.0.0
 * @category resources
 */
export class TextResourceContents extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...ResourceContents.fields,
  /**
   * The text of the item. This must only be set if the item can actually be
   * represented as text (not binary data).
   */
  text: Schema.String
})) {}
/**
 * The contents of a binary resource, which can be represented as an Uint8Array
 *
 * @since 4.0.0
 * @category resources
 */
export class BlobResourceContents extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...ResourceContents.fields,
  /**
   * The binary data of the item decoded from a base64-encoded string.
   */
  blob: Schema.Uint8Array
})) {}
/**
 * The server's response to a resources/list request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export class ListResourcesResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ListResourcesResult")({
  ...PaginatedResultMeta.fields,
  resources: /*#__PURE__*/Schema.Array(Resource)
}) {}
/**
 * Sent from the client to request a list of resources the server has.
 *
 * @since 4.0.0
 * @category resources
 */
export class ListResources extends /*#__PURE__*/Rpc.make("resources/list", {
  success: ListResourcesResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(PaginatedRequestMeta)
}) {}
/**
 * The server's response to a resources/templates/list request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export class ListResourceTemplatesResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ListResourceTemplatesResult")({
  ...PaginatedResultMeta.fields,
  resourceTemplates: /*#__PURE__*/Schema.Array(ResourceTemplate)
}) {}
/**
 * Sent from the client to request a list of resource templates the server has.
 *
 * @since 4.0.0
 * @category resources
 */
export class ListResourceTemplates extends /*#__PURE__*/Rpc.make("resources/templates/list", {
  success: ListResourceTemplatesResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(PaginatedRequestMeta)
}) {}
/**
 * The server's response to a resources/read request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export class ReadResourceResult extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...ResultMeta.fields,
  contents: /*#__PURE__*/Schema.Array(/*#__PURE__*/Schema.Union([TextResourceContents, BlobResourceContents]))
})) {}
/**
 * Sent from the client to the server, to read a specific resource URI.
 *
 * @since 4.0.0
 * @category resources
 */
export class ReadResource extends /*#__PURE__*/Rpc.make("resources/read", {
  success: ReadResourceResult,
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up
     * to the server how to interpret it.
     */
    uri: Schema.String
  }
}) {}
/**
 * An optional notification from the server to the client, informing it that the
 * list of resources it can read from has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export class ResourceListChangedNotification extends /*#__PURE__*/Rpc.make("notifications/resources/list_changed", {
  payload: /*#__PURE__*/Schema.UndefinedOr(NotificationMeta)
}) {}
/**
 * Sent from the client to request resources/updated notifications from the
 * server whenever a particular resource changes.
 *
 * @since 4.0.0
 * @category resources
 */
export class Subscribe extends /*#__PURE__*/Rpc.make("resources/subscribe", {
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String
  }
}) {}
/**
 * Sent from the client to request cancellation of resources/updated
 * notifications from the server. This should follow a previous
 * resources/subscribe request.
 *
 * @since 4.0.0
 * @category resources
 */
export class Unsubscribe extends /*#__PURE__*/Rpc.make("resources/unsubscribe", {
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String
  }
}) {}
/**
 * @since 4.0.0
 * @category resources
 */
export class ResourceUpdatedNotification extends /*#__PURE__*/Rpc.make("notifications/resources/updated", {
  payload: {
    ...NotificationMeta.fields,
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */
    uri: Schema.String
  }
}) {}
// =============================================================================
// Prompts
// =============================================================================
/**
 * Describes an argument that a prompt can accept.
 *
 * @since 4.0.0
 * @category prompts
 */
export class PromptArgument extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * The name of the argument.
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * A human-readable description of the argument.
   */
  description: /*#__PURE__*/optional(Schema.String),
  /**
   * Whether this argument must be provided.
   */
  required: /*#__PURE__*/optional(Schema.Boolean)
})) {}
/**
 * A prompt or prompt template that the server offers.
 *
 * @since 4.0.0
 * @category prompts
 */
export class Prompt extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/Prompt")({
  /**
   * The name of the prompt or prompt template.
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * An optional description of what this prompt provides
   */
  description: /*#__PURE__*/optional(Schema.String),
  /**
   * A list of arguments to use for templating the prompt.
   */
  arguments: /*#__PURE__*/optional(/*#__PURE__*/Schema.Array(PromptArgument))
}) {}
/**
 * Text provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export class TextContent extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("text"),
  /**
   * The text content of the message.
   */
  text: Schema.String,
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations)
})) {}
/**
 * An image provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export class ImageContent extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("image"),
  /**
   * The image data.
   */
  data: Schema.Uint8Array,
  /**
   * The MIME type of the image. Different providers may support different
   * image types.
   */
  mimeType: Schema.String,
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations)
})) {}
/**
 * Audio provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export class AudioContent extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("audio"),
  /**
   * The audio data.
   */
  data: Schema.Uint8Array,
  /**
   * The MIME type of the audio. Different providers may support different
   * audio types.
   */
  mimeType: Schema.String,
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations)
})) {}
/**
 * The contents of a resource, embedded into a prompt or tool call result.
 *
 * It is up to the client how best to render embedded resources for the benefit
 * of the LLM and/or the user.
 *
 * @since 4.0.0
 * @category prompts
 */
export class EmbeddedResource extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("resource"),
  resource: /*#__PURE__*/Schema.Union([TextResourceContents, BlobResourceContents]),
  /**
   * Optional annotations for the client.
   */
  annotations: /*#__PURE__*/optional(Annotations)
})) {}
/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 *
 * Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
 *
 * @since 4.0.0
 * @category prompts
 */
export class ResourceLink extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  ...Resource.fields,
  type: /*#__PURE__*/Schema.tag("resource_link")
})) {}
/**
 * @since 4.0.0
 * @category prompts
 */
export const ContentBlock = /*#__PURE__*/Schema.Union([TextContent, ImageContent, AudioContent, EmbeddedResource, ResourceLink]);
/**
 * Describes a message returned as part of a prompt.
 *
 * This is similar to `SamplingMessage`, but also supports the embedding of
 * resources from the MCP server.
 *
 * @since 4.0.0
 * @category prompts
 */
export class PromptMessage extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  role: Role,
  content: ContentBlock
})) {}
/**
 * The server's response to a prompts/list request from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export class ListPromptsResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ListPromptsResult")({
  ...PaginatedResultMeta.fields,
  prompts: /*#__PURE__*/Schema.Array(Prompt)
}) {}
/**
 * Sent from the client to request a list of prompts and prompt templates the
 * server has.
 *
 * @since 4.0.0
 * @category prompts
 */
export class ListPrompts extends /*#__PURE__*/Rpc.make("prompts/list", {
  success: ListPromptsResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(PaginatedRequestMeta)
}) {}
/**
 * The server's response to a prompts/get request from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export class GetPromptResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/GetPromptResult")({
  ...ResultMeta.fields,
  messages: /*#__PURE__*/Schema.Array(PromptMessage),
  /**
   * An optional description for the prompt.
   */
  description: /*#__PURE__*/optional(Schema.String)
}) {}
/**
 * Used by the client to get a prompt provided by the server.
 *
 * @since 4.0.0
 * @category prompts
 */
export class GetPrompt extends /*#__PURE__*/Rpc.make("prompts/get", {
  success: GetPromptResult,
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    /**
     * The name of the prompt or prompt template.
     */
    name: Schema.String,
    title: /*#__PURE__*/optional(Schema.String),
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.String))
  }
}) {}
/**
 * An optional notification from the server to the client, informing it that
 * the list of prompts it offers has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export class PromptListChangedNotification extends /*#__PURE__*/Rpc.make("notifications/prompts/list_changed", {
  payload: /*#__PURE__*/Schema.UndefinedOr(NotificationMeta)
}) {}
// =============================================================================
// Tools
// =============================================================================
/**
 * Additional properties describing a Tool to clients.
 *
 * NOTE: all properties in ToolAnnotations are **hints**. They are not
 * guaranteed to provide a faithful description of tool behavior (including
 * descriptive properties like `title`).
 *
 * Clients should never make tool use decisions based on ToolAnnotations
 * received from untrusted servers.
 *
 * @since 4.0.0
 * @category tools
 */
export class ToolAnnotations extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * A human-readable title for the tool.
   */
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * If true, the tool does not modify its environment.
   *
   * Default: `false`
   */
  readOnlyHint: /*#__PURE__*/optionalWithDefault(Schema.Boolean, constFalse),
  /**
   * If true, the tool may perform destructive updates to its environment.
   * If false, the tool performs only additive updates.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: `true`
   */
  destructiveHint: /*#__PURE__*/optionalWithDefault(Schema.Boolean, constTrue),
  /**
   * If true, calling the tool repeatedly with the same arguments
   * will have no additional effect on the its environment.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: `false`
   */
  idempotentHint: /*#__PURE__*/optionalWithDefault(Schema.Boolean, constFalse),
  /**
   * If true, this tool may interact with an "open world" of external
   * entities. If false, the tool's domain of interaction is closed.
   * For example, the world of a web search tool is open, whereas that
   * of a memory tool is not.
   *
   * Default: `true`
   */
  openWorldHint: /*#__PURE__*/optionalWithDefault(Schema.Boolean, constTrue)
})) {}
/**
 * Definition for a tool the client can call.
 *
 * @since 4.0.0
 * @category tools
 */
export class Tool extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/Tool")({
  /**
   * The name of the tool.
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String),
  /**
   * A human-readable description of the tool.
   *
   * This can be used by clients to improve the LLM's understanding of available tools. It can be thought of like a "hint" to the model.
   */
  description: /*#__PURE__*/optional(Schema.String),
  /**
   * A JSON Schema object defining the expected parameters for the tool.
   */
  inputSchema: Schema.Any,
  /**
   * Optional additional tool information.
   */
  annotations: /*#__PURE__*/optional(ToolAnnotations),
  /**
   * Optional additional metadata for the client.
   *
   * This parameter name is reserved by MCP to allow clients and servers to
   * attach additional metadata to resources.
   */
  _meta: /*#__PURE__*/optional(/*#__PURE__*/Schema.Record(Schema.String, Schema.Json))
}) {}
/**
 * The server's response to a tools/list request from the client.
 *
 * @since 4.0.0
 * @category tools
 */
export class ListToolsResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ListToolsResult")({
  ...PaginatedResultMeta.fields,
  tools: /*#__PURE__*/Schema.Array(Tool)
}) {}
/**
 * Sent from the client to request a list of tools the server has.
 *
 * @since 4.0.0
 * @category tools
 */
export class ListTools extends /*#__PURE__*/Rpc.make("tools/list", {
  success: ListToolsResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(PaginatedRequestMeta)
}) {}
/**
 * The server's response to a tool call.
 *
 * Any errors that originate from the tool SHOULD be reported inside the result
 * object, with `isError` set to true, _not_ as an MCP protocol-level error
 * response. Otherwise, the LLM would not be able to see that an error occurred
 * and self-correct.
 *
 * However, any errors in _finding_ the tool, an error indicating that the
 * server does not support tool calls, or any other exceptional conditions,
 * should be reported as an MCP error response.
 *
 * @since 4.0.0
 * @category tools
 */
export class CallToolResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/CallToolResult")({
  ...ResultMeta.fields,
  content: /*#__PURE__*/Schema.Array(ContentBlock),
  structuredContent: /*#__PURE__*/optional(Schema.Any),
  /**
   * Whether the tool call ended in an error.
   *
   * If not set, this is assumed to be false (the call was successful).
   */
  isError: /*#__PURE__*/optional(Schema.Boolean)
}) {}
/**
 * Used by the client to invoke a tool provided by the server.
 *
 * @since 4.0.0
 * @category tools
 */
export class CallTool extends /*#__PURE__*/Rpc.make("tools/call", {
  success: CallToolResult,
  error: McpError,
  payload: {
    ...RequestMeta.fields,
    name: Schema.String,
    arguments: /*#__PURE__*/Schema.Record(Schema.String, Schema.Any)
  }
}) {}
/**
 * An optional notification from the server to the client, informing it that
 * the list of tools it offers has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category tools
 */
export class ToolListChangedNotification extends /*#__PURE__*/Rpc.make("notifications/tools/list_changed", {
  payload: /*#__PURE__*/Schema.UndefinedOr(NotificationMeta)
}) {}
// =============================================================================
// Logging
// =============================================================================
/**
 * The severity of a log message.
 *
 * These map to syslog message severities, as specified in RFC-5424:
 * https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
 *
 * @since 4.0.0
 * @category logging
 */
export const LoggingLevel = /*#__PURE__*/Schema.Literals(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
/**
 * A request from the client to the server, to enable or adjust logging.
 *
 * @since 4.0.0
 * @category logging
 */
export class SetLevel extends /*#__PURE__*/Rpc.make("logging/setLevel", {
  payload: {
    ...RequestMeta.fields,
    /**
     * The level of logging that the client wants to receive from the server.
     * The server should send all logs at this level and higher (i.e., more
     * severe) to the client as notifications/message.
     */
    level: LoggingLevel
  },
  error: McpError
}) {}
/**
 * @since 4.0.0
 * @category logging
 */
export class LoggingMessageNotification extends /*#__PURE__*/Rpc.make("notifications/message", {
  payload: /*#__PURE__*/Schema.Struct({
    ...NotificationMeta.fields,
    /**
     * The severity of this log message.
     */
    level: LoggingLevel,
    /**
     * An optional name of the logger issuing this message.
     */
    logger: /*#__PURE__*/optional(Schema.String),
    /**
     * The data to be logged, such as a string message or an object. Any JSON
     * serializable type is allowed here.
     */
    data: Schema.Any
  })
}) {}
// =============================================================================
// Sampling
// =============================================================================
/**
 * Describes a message issued to or received from an LLM API.
 *
 * @since 4.0.0
 * @category sampling
 */
export class SamplingMessage extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  role: Role,
  content: /*#__PURE__*/Schema.Union([TextContent, ImageContent, AudioContent])
})) {}
/**
 * Hints to use for model selection.
 *
 * Keys not declared here are currently left unspecified by the spec and are up
 * to the client to interpret.
 *
 * @since 4.0.0
 * @category sampling
 */
export class ModelHint extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  /**
   * A hint for a model name.
   *
   * The client SHOULD treat this as a substring of a model name; for example:
   *  - `claude-3-5-sonnet` should match `claude-3-5-sonnet-20241022`
   *  - `sonnet` should match `claude-3-5-sonnet-20241022`, `claude-3-sonnet-20240229`, etc.
   *  - `claude` should match any Claude model
   *
   * The client MAY also map the string to a different provider's model name or
   * a different model family, as long as it fills a similar niche; for example:
   *  - `gemini-1.5-flash` could match `claude-3-haiku-20240307`
   */
  name: /*#__PURE__*/optional(Schema.String)
})) {}
/**
 * The server's preferences for model selection, requested of the client during sampling.
 *
 * Because LLMs can vary along multiple dimensions, choosing the "best" model is
 * rarely straightforward.  Different models excel in different areas—some are
 * faster but less capable, others are more capable but more expensive, and so
 * on. This interface allows servers to express their priorities across multiple
 * dimensions to help clients make an appropriate selection for their use case.
 *
 * These preferences are always advisory. The client MAY ignore them. It is also
 * up to the client to decide how to interpret these preferences and how to
 * balance them against other considerations.
 *
 * @since 4.0.0
 * @category sampling
 */
export class ModelPreferences extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ModelPreferences")({
  /**
   * Optional hints to use for model selection.
   *
   * If multiple hints are specified, the client MUST evaluate them in order
   * (such that the first match is taken).
   *
   * The client SHOULD prioritize these hints over the numeric priorities, but
   * MAY still use the priorities to select from ambiguous matches.
   */
  hints: /*#__PURE__*/optional(/*#__PURE__*/Schema.Array(ModelHint)),
  /**
   * How much to prioritize cost when selecting a model. A value of 0 means cost
   * is not important, while a value of 1 means cost is the most important
   * factor.
   */
  costPriority: /*#__PURE__*/optional(/*#__PURE__*/Schema.Number.check(/*#__PURE__*/Schema.isBetween({
    minimum: 0,
    maximum: 1
  }))),
  /**
   * How much to prioritize sampling speed (latency) when selecting a model. A
   * value of 0 means speed is not important, while a value of 1 means speed is
   * the most important factor.
   */
  speedPriority: /*#__PURE__*/optional(/*#__PURE__*/Schema.Number.check(/*#__PURE__*/Schema.isBetween({
    minimum: 0,
    maximum: 1
  }))),
  /**
   * How much to prioritize intelligence and capabilities when selecting a
   * model. A value of 0 means intelligence is not important, while a value of 1
   * means intelligence is the most important factor.
   */
  intelligencePriority: /*#__PURE__*/optional(/*#__PURE__*/Schema.Number.check(/*#__PURE__*/Schema.isBetween({
    minimum: 0,
    maximum: 1
  })))
}) {}
/**
 * The client's response to a sampling/create_message request from the server.
 * The client should inform the user before returning the sampled message, to
 * allow them to inspect the response (human in the loop) and decide whether to
 * allow the server to see it.
 *
 * @since 4.0.0
 * @category sampling
 */
export class CreateMessageResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/CreateMessageResult")({
  /**
   * The name of the model that generated the message.
   */
  model: Schema.String,
  /**
   * The reason why sampling stopped, if known.
   */
  stopReason: /*#__PURE__*/optional(Schema.String)
}) {}
/**
 * A request from the server to sample an LLM via the client. The client has
 * full discretion over which model to select. The client should also inform the
 * user before beginning sampling, to allow them to inspect the request (human
 * in the loop) and decide whether to approve it.
 *
 * @since 4.0.0
 * @category sampling
 */
export class CreateMessage extends /*#__PURE__*/Rpc.make("sampling/createMessage", {
  success: CreateMessageResult,
  error: McpError,
  payload: {
    messages: /*#__PURE__*/Schema.Array(SamplingMessage),
    /**
     * The server's preferences for which model to select. The client MAY ignore
     * these preferences.
     */
    modelPreferences: /*#__PURE__*/optional(ModelPreferences),
    /**
     * An optional system prompt the server wants to use for sampling. The
     * client MAY modify or omit this prompt.
     */
    systemPrompt: /*#__PURE__*/optional(Schema.String),
    /**
     * A request to include context from one or more MCP servers (including the
     * caller), to be attached to the prompt. The client MAY ignore this request.
     */
    includeContext: /*#__PURE__*/optional(/*#__PURE__*/Schema.Literals(["none", "thisServer", "allServers"])),
    temperature: /*#__PURE__*/optional(Schema.Number),
    /**
     * The maximum number of tokens to sample, as requested by the server. The
     * client MAY choose to sample fewer tokens than requested.
     */
    maxTokens: Schema.Number,
    stopSequences: /*#__PURE__*/optional(/*#__PURE__*/Schema.Array(Schema.String)),
    /**
     * Optional metadata to pass through to the LLM provider. The format of
     * this metadata is provider-specific.
     */
    metadata: Schema.Any
  }
}) {}
// =============================================================================
// Autocomplete
// =============================================================================
/**
 * A reference to a resource or resource template definition.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export class ResourceReference extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("ref/resource"),
  /**
   * The URI or URI template of the resource.
   */
  uri: Schema.String
})) {}
/**
 * Identifies a prompt.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export class PromptReference extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  type: /*#__PURE__*/Schema.tag("ref/prompt"),
  /**
   * The name of the prompt or prompt template
   */
  name: Schema.String,
  title: /*#__PURE__*/optional(Schema.String)
})) {}
/**
 * The server's response to a completion/complete request
 *
 * @since 4.0.0
 * @category autocomplete
 */
export class CompleteResult extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  completion: /*#__PURE__*/Schema.Struct({
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: /*#__PURE__*/Schema.Array(Schema.String),
    /**
     * The total number of completion options available. This can exceed the
     * number of values actually sent in the response.
     */
    total: /*#__PURE__*/optional(Schema.Number),
    /**
     * Indicates whether there are additional completion options beyond those
     * provided in the current response, even if the exact total is unknown.
     */
    hasMore: /*#__PURE__*/optional(Schema.Boolean)
  })
})) {
  /**
   * @since 4.0.0
   */
  static empty = /*#__PURE__*/CompleteResult.make({
    completion: {
      values: [],
      total: 0,
      hasMore: false
    }
  });
}
/**
 * A request from the client to the server, to ask for completion options.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export class Complete extends /*#__PURE__*/Rpc.make("completion/complete", {
  success: CompleteResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.Struct({
    ref: /*#__PURE__*/Schema.Union([PromptReference, ResourceReference]),
    /**
     * The argument's information
     */
    argument: /*#__PURE__*/Schema.Struct({
      /**
       * The name of the argument
       */
      name: Schema.String,
      /**
       * The value of the argument to use for completion matching.
       */
      value: Schema.String
    }),
    /**
     * Additional, optional context for completions
     */
    context: /*#__PURE__*/optionalWithDefault(/*#__PURE__*/Schema.Struct({
      /**
       * Previously-resolved variables in a URI template or prompt.
       */
      arguments: /*#__PURE__*/optionalWithDefault(/*#__PURE__*/Schema.Record(Schema.String, Schema.String), () => ({}))
    }), () => ({
      arguments: {}
    }))
  })
}) {}
// =============================================================================
// Roots
// =============================================================================
/**
 * Represents a root directory or file that the server can operate on.
 *
 * @since 4.0.0
 * @category roots
 */
export class Root extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/Root")({
  /**
   * The URI identifying the root. This *must* start with file:// for now.
   * This restriction may be relaxed in future versions of the protocol to allow
   * other URI schemes.
   */
  uri: Schema.String,
  /**
   * An optional name for the root. This can be used to provide a human-readable
   * identifier for the root, which may be useful for display purposes or for
   * referencing the root in other parts of the application.
   */
  name: /*#__PURE__*/optional(Schema.String)
}) {}
/**
 * The client's response to a roots/list request from the server. This result
 * contains an array of Root objects, each representing a root directory or file
 * that the server can operate on.
 *
 * @since 4.0.0
 * @category roots
 */
export class ListRootsResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ListRootsResult")({
  roots: /*#__PURE__*/Schema.Array(Root)
}) {}
/**
 * Sent from the server to request a list of root URIs from the client. Roots
 * allow servers to ask for specific directories or files to operate on. A
 * common example for roots is providing a set of repositories or directories a
 * server should operate
 * on.
 *
 * This request is typically used when the server needs to understand the file
 * system structure or access specific locations that the client has permission
 * to read from.
 *
 * @since 4.0.0
 * @category roots
 */
export class ListRoots extends /*#__PURE__*/Rpc.make("roots/list", {
  success: ListRootsResult,
  error: McpError,
  payload: /*#__PURE__*/Schema.UndefinedOr(RequestMeta)
}) {}
/**
 * A notification from the client to the server, informing it that the list of
 * roots has changed. This notification should be sent whenever the client adds,
 * removes, or modifies any root. The server should then request an updated list
 * of roots using the ListRootsRequest.
 *
 * @since 4.0.0
 * @category roots
 */
export class RootsListChangedNotification extends /*#__PURE__*/Rpc.make("notifications/roots/list_changed", {
  payload: /*#__PURE__*/Schema.UndefinedOr(NotificationMeta)
}) {}
// =============================================================================
// Elicitation
// =============================================================================
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export class ElicitAcceptResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ElicitAcceptResult")({
  ...ResultMeta.fields,
  /**
   * The user action in response to the elicitation.
   * - "accept": User submitted the form/confirmed the action
   * - "decline": User explicitly declined the action
   * - "cancel": User dismissed without making an explicit choice
   */
  action: /*#__PURE__*/Schema.Literal("accept"),
  /**
   * The submitted form data, only present when action is "accept".
   * Contains values matching the requested schema.
   */
  content: Schema.Any
}) {}
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export class ElicitDeclineResult extends /*#__PURE__*/Schema.Class("@effect/ai/McpSchema/ElicitDeclineResult")({
  ...ResultMeta.fields,
  /**
   * The user action in response to the elicitation.
   * - "accept": User submitted the form/confirmed the action
   * - "decline": User explicitly declined the action
   * - "cancel": User dismissed without making an explicit choice
   */
  action: /*#__PURE__*/Schema.Literals(["cancel", "decline"])
}) {}
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export const ElicitResult = /*#__PURE__*/Schema.Union([ElicitAcceptResult, ElicitDeclineResult]);
/**
 * @since 4.0.0
 * @category elicitation
 */
export class Elicit extends /*#__PURE__*/Rpc.make("elicitation/create", {
  success: ElicitResult,
  error: McpError,
  payload: {
    /**
     * A message to display to the user, explaining what they are being
     * elicited for.
     */
    message: Schema.String,
    /**
     * A restricted subset of JSON Schema.
     * Only top-level properties are allowed, without nesting.
     */
    requestedSchema: Schema.Any
  }
}) {}
/**
 * @since 4.0.0
 * @category elicitation
 */
export class ElicitationDeclined extends /*#__PURE__*/Schema.ErrorClass("@effect/ai/McpSchema/ElicitationDeclined")({
  _tag: /*#__PURE__*/Schema.tag("ElicitationDeclined"),
  request: Elicit.payloadSchema,
  cause: /*#__PURE__*/optional(Schema.Defect)
}) {}
// =============================================================================
// McpServerClient
// =============================================================================
/**
 * @since 4.0.0
 * @category client
 */
export class McpServerClient extends /*#__PURE__*/Context.Service()("effect/ai/McpSchema/McpServerClient") {}
/**
 * @since 4.0.0
 * @category middleware
 */
export class McpServerClientMiddleware extends /*#__PURE__*/RpcMiddleware.Service()("effect/ai/McpSchema/McpServerClientMiddleware") {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ClientRequestRpcs extends /*#__PURE__*/RpcGroup.make(Ping, Initialize, Complete, SetLevel, GetPrompt, ListPrompts, ListResources, ListResourceTemplates, ReadResource, Subscribe, Unsubscribe, CallTool, ListTools).middleware(McpServerClientMiddleware) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ClientNotificationRpcs extends /*#__PURE__*/RpcGroup.make(CancelledNotification, ProgressNotification, InitializedNotification, RootsListChangedNotification) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ClientRpcs extends /*#__PURE__*/ClientRequestRpcs.merge(ClientNotificationRpcs) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ServerRequestRpcs extends /*#__PURE__*/RpcGroup.make(Ping, CreateMessage, ListRoots, Elicit) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ServerNotificationRpcs extends /*#__PURE__*/RpcGroup.make(CancelledNotification, ProgressNotification, LoggingMessageNotification, ResourceUpdatedNotification, ResourceListChangedNotification, ToolListChangedNotification, PromptListChangedNotification) {}
const ParamSchemaTypeId = "~effect/ai/McpSchema/ParamSchema";
/**
 * @since 4.0.0
 * @category parameters
 */
export function isParam(schema) {
  return Predicate.hasProperty(schema, ParamSchemaTypeId);
}
/**
 * Helper to create a param for a resource URI template.
 *
 * @since 4.0.0
 * @category parameters
 */
export function param(name, schema) {
  return Schema.make(schema.ast, {
    [ParamSchemaTypeId]: ParamSchemaTypeId,
    name,
    schema
  });
}
/**
 * Annotation to conditionally enable or disable tools based on client
 * information.
 *
 * @since 4.0.0
 * @category annotations
 */
export class EnabledWhen extends /*#__PURE__*/Context.Service()("effect/unstable/ai/McpSchema/EnabledWhen") {}
//# sourceMappingURL=McpSchema.js.map