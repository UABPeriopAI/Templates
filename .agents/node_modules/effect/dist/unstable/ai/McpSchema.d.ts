/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Predicate from "../../Predicate.ts";
import * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import * as Rpc from "../rpc/Rpc.ts";
import type * as RpcClient from "../rpc/RpcClient.ts";
import type { RpcClientError } from "../rpc/RpcClientError.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import * as RpcMiddleware from "../rpc/RpcMiddleware.ts";
/**
 * @since 4.0.0
 */
export interface optionalWithDefault<S extends Schema.Top & Schema.WithoutConstructorDefault> extends Schema.withConstructorDefault<Schema.decodeTo<Schema.toType<Schema.optionalKey<S>>, Schema.optionalKey<S>>> {
}
/**
 * @since 4.0.0
 */
export declare const optionalWithDefault: <S extends Schema.Top & Schema.WithoutConstructorDefault>(schema: S, defaultValue: () => Schema.optionalKey<S>["Type"]) => optionalWithDefault<S>;
/**
 * @since 4.0.0
 */
export declare const optional: <S extends Schema.Top>(schema: S) => Schema.decodeTo<Schema.optional<S>, Schema.optionalKey<S>>;
/**
 * A uniquely identifying ID for a request in JSON-RPC.
 *
 * @since 4.0.0
 * @category common
 */
export declare const RequestId: Schema.Union<[
    typeof Schema.String,
    typeof Schema.Number
]>;
/**
 * A uniquely identifying ID for a request in JSON-RPC.
 *
 * @since 4.0.0
 * @category common
 */
export type RequestId = typeof RequestId.Type;
/**
 * A progress token, used to associate progress notifications with the original
 * request.
 *
 * @since 4.0.0
 * @category common
 */
export declare const ProgressToken: Schema.Union<[
    typeof Schema.String,
    typeof Schema.Number
]>;
/**
 * A progress token, used to associate progress notifications with the original
 * request.
 *
 * @since 4.0.0
 * @category common
 */
export type ProgressToken = typeof ProgressToken.Type;
declare const RequestMeta_base: Schema.Opaque<RequestMeta, Schema.Struct<{
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category common
 */
export declare class RequestMeta extends RequestMeta_base {
}
declare const ResultMeta_base: Schema.Opaque<ResultMeta, Schema.Struct<{
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category common
 */
export declare class ResultMeta extends ResultMeta_base {
}
declare const NotificationMeta_base: Schema.Opaque<NotificationMeta, Schema.Struct<{
    /**
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to their notifications.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to their notifications.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category common
 */
export declare class NotificationMeta extends NotificationMeta_base {
}
/**
 * An opaque token used to represent a cursor for pagination.
 *
 * @since 4.0.0
 * @category common
 */
export declare const Cursor: typeof Schema.String;
/**
 * @since 4.0.0
 * @category common
 */
export type Cursor = typeof Cursor.Type;
declare const PaginatedRequestMeta_base: Schema.Opaque<PaginatedRequestMeta, Schema.Struct<{
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */
    readonly cursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */
    readonly cursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category common
 */
export declare class PaginatedRequestMeta extends PaginatedRequestMeta_base {
}
declare const PaginatedResultMeta_base: Schema.Opaque<PaginatedResultMeta, Schema.Struct<{
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * @since 4.0.0
 * @category common
 */
export declare class PaginatedResultMeta extends PaginatedResultMeta_base {
}
/**
 * The sender or recipient of messages and data in a conversation.
 * @since 4.0.0
 * @category common
 */
export declare const Role: Schema.Literals<["user", "assistant"]>;
/**
 * @since 4.0.0
 * @category common
 */
export type Role = typeof Role.Type;
declare const Annotations_base: Schema.Opaque<Annotations, Schema.Struct<{
    /**
     * Describes who the intended customer of this object or data is.
     *
     * It can include multiple entries to indicate content useful for multiple
     * audiences (e.g., `["user", "assistant"]`).
     */
    readonly audience: Schema.decodeTo<Schema.optional<Schema.$Array<Schema.Literals<["user", "assistant"]>>>, Schema.optionalKey<Schema.$Array<Schema.Literals<["user", "assistant"]>>>, never, never>;
    /**
     * Describes how important this data is for operating the server.
     *
     * A value of 1 means "most important," and indicates that the data is
     * effectively required, while 0 means "least important," and indicates that
     * the data is entirely optional.
     */
    readonly priority: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * Describes who the intended customer of this object or data is.
     *
     * It can include multiple entries to indicate content useful for multiple
     * audiences (e.g., `["user", "assistant"]`).
     */
    readonly audience: Schema.decodeTo<Schema.optional<Schema.$Array<Schema.Literals<["user", "assistant"]>>>, Schema.optionalKey<Schema.$Array<Schema.Literals<["user", "assistant"]>>>, never, never>;
    /**
     * Describes how important this data is for operating the server.
     *
     * A value of 1 means "most important," and indicates that the data is
     * effectively required, while 0 means "least important," and indicates that
     * the data is entirely optional.
     */
    readonly priority: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
}>, keyof Schema.Top>;
/**
 * Optional annotations for the client. The client can use annotations to
 * inform how objects are used or displayed
 *
 * @since 4.0.0
 * @category common
 */
export declare class Annotations extends Annotations_base {
}
declare const Implementation_base: Schema.Opaque<Implementation, Schema.Struct<{
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    readonly version: Schema.String;
}>, {}> & Omit<Schema.Struct<{
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    readonly version: Schema.String;
}>, keyof Schema.Top>;
/**
 * Describes the name and version of an MCP implementation.
 *
 * @since 4.0.0
 * @category common
 */
export declare class Implementation extends Implementation_base {
}
declare const ClientCapabilities_base: Schema.Class<ClientCapabilities, Schema.Struct<{
    /**
     * Experimental, non-standard capabilities that the client supports.
     */
    readonly experimental: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{}>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Struct<{}>>>, never, never>;
    /**
     * Optional extensions capabilities advertised by the client.
     * Keys are extension identifiers following <vendor-prefix>/<extension-name> (e.g. "io.modelcontextprotocol/ui").
     */
    readonly extensions: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
    /**
     * Present if the client supports listing roots.
     */
    readonly roots: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether the client supports notifications for changes to the roots list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether the client supports notifications for changes to the roots list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
    /**
     * Present if the client supports sampling from an LLM.
     */
    readonly sampling: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
    /**
     * Present if the client supports elicitation from the server.
     */
    readonly elicitation: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
}>, {}>;
/**
 * Capabilities a client may support. Known capabilities are defined here, in
 * this schema, but this is not a closed set: any client can define its own,
 * additional capabilities.
 *
 * @since 4.0.0
 * @category common
 */
export declare class ClientCapabilities extends ClientCapabilities_base {
}
declare const ServerCapabilities_base: Schema.Opaque<ServerCapabilities, Schema.Struct<{
    /**
     * Experimental, non-standard capabilities that the server supports.
     */
    readonly experimental: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{}>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Struct<{}>>>, never, never>;
    /**
     * Optional extensions capabilities advertised by the server.
     * Keys are extension identifiers following <vendor-prefix>/<extension-name> (e.g. "io.modelcontextprotocol/ui").
     */
    readonly extensions: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
    /**
     * Present if the server supports sending log messages to the client.
     */
    readonly logging: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
    /**
     * Present if the server supports argument autocompletion suggestions.
     */
    readonly completions: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
    /**
     * Present if the server offers any prompt templates.
     */
    readonly prompts: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the prompt list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the prompt list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
    /**
     * Present if the server offers any resources to read.
     */
    readonly resources: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports subscribing to resource updates.
         */
        readonly subscribe: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
        /**
         * Whether this server supports notifications for changes to the resource list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports subscribing to resource updates.
         */
        readonly subscribe: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
        /**
         * Whether this server supports notifications for changes to the resource list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
    /**
     * Present if the server offers any tools to call.
     */
    readonly tools: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the tool list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the tool list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * Experimental, non-standard capabilities that the server supports.
     */
    readonly experimental: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{}>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Struct<{}>>>, never, never>;
    /**
     * Optional extensions capabilities advertised by the server.
     * Keys are extension identifiers following <vendor-prefix>/<extension-name> (e.g. "io.modelcontextprotocol/ui").
     */
    readonly extensions: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.TemplateLiteral<readonly [Schema.String, "/", Schema.String]>, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
    /**
     * Present if the server supports sending log messages to the client.
     */
    readonly logging: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
    /**
     * Present if the server supports argument autocompletion suggestions.
     */
    readonly completions: Schema.decodeTo<Schema.optional<Schema.Struct<{}>>, Schema.optionalKey<Schema.Struct<{}>>, never, never>;
    /**
     * Present if the server offers any prompt templates.
     */
    readonly prompts: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the prompt list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the prompt list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
    /**
     * Present if the server offers any resources to read.
     */
    readonly resources: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports subscribing to resource updates.
         */
        readonly subscribe: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
        /**
         * Whether this server supports notifications for changes to the resource list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports subscribing to resource updates.
         */
        readonly subscribe: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
        /**
         * Whether this server supports notifications for changes to the resource list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
    /**
     * Present if the server offers any tools to call.
     */
    readonly tools: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the tool list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * Whether this server supports notifications for changes to the tool list.
         */
        readonly listChanged: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>>, never, never>;
}>, keyof Schema.Top>;
/**
 * Capabilities that a server may support. Known capabilities are defined
 * here, in this schema, but this is not a closed set: any server can define
 * its own, additional capabilities.
 *
 * @since 4.0.0
 * @category common
 */
export declare class ServerCapabilities extends ServerCapabilities_base {
}
declare const McpErrorBase_base: Schema.Class<McpErrorBase, Schema.Struct<{
    /**
     * The error type that occurred.
     */
    readonly code: Schema.Number;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, {}>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class McpErrorBase extends McpErrorBase_base {
}
/**
 * @since 4.0.0
 * @category errors
 */
export declare const INVALID_REQUEST_ERROR_CODE: -32600;
/**
 * @since 4.0.0
 * @category errors
 */
export declare const METHOD_NOT_FOUND_ERROR_CODE: -32601;
/**
 * @since 4.0.0
 * @category errors
 */
export declare const INVALID_PARAMS_ERROR_CODE: -32602;
/**
 * @since 4.0.0
 * @category errors
 */
export declare const INTERNAL_ERROR_CODE: -32603;
/**
 * @since 4.0.0
 * @category errors
 */
export declare const PARSE_ERROR_CODE: -32700;
declare const ParseError_base: Schema.Class<ParseError, Schema.Struct<{
    readonly _tag: Schema.tag<"ParseError">;
    readonly code: Schema.tag<-32700>;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class ParseError extends ParseError_base {
}
declare const InvalidRequest_base: Schema.Class<InvalidRequest, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidRequest">;
    readonly code: Schema.tag<-32600>;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class InvalidRequest extends InvalidRequest_base {
}
declare const MethodNotFound_base: Schema.Class<MethodNotFound, Schema.Struct<{
    readonly _tag: Schema.tag<"MethodNotFound">;
    readonly code: Schema.tag<-32601>;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class MethodNotFound extends MethodNotFound_base {
}
declare const InvalidParams_base: Schema.Class<InvalidParams, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidParams">;
    readonly code: Schema.tag<-32602>;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class InvalidParams extends InvalidParams_base {
}
declare const InternalError_base: Schema.Class<InternalError, Schema.Struct<{
    readonly _tag: Schema.tag<"InternalError">;
    readonly code: Schema.tag<-32603>;
    /**
     * A short description of the error. The message SHOULD be limited to a
     * concise single sentence.
     */
    readonly message: Schema.String;
    /**
     * Additional information about the error. The value of this member is
     * defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    readonly data: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class InternalError extends InternalError_base {
    static readonly notImplemented: InternalError;
}
/**
 * @since 4.0.0
 * @category errors
 */
export declare const McpError: Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>;
declare const Ping_base: Rpc.Rpc<"ping", Schema.UndefinedOr<typeof RequestMeta>, Schema.Struct<{}>, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * A ping, issued by either the server or the client, to check that the other
 * party is still alive. The receiver must promptly respond, or else may be
 * disconnected.
 *
 * @since 4.0.0
 * @category ping
 */
export declare class Ping extends Ping_base {
}
declare const InitializeResult_base: Schema.Opaque<InitializeResult, Schema.Struct<{
    /**
     * The version of the Model Context Protocol that the server wants to use.
     * This may not match the version that the client requested. If the client
     * cannot support this version, it MUST disconnect.
     */
    readonly protocolVersion: Schema.String;
    readonly capabilities: typeof ServerCapabilities;
    readonly serverInfo: typeof Implementation;
    /**
     * Instructions describing how to use the server and its features.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * tools, resources, etc. It can be thought of like a "hint" to the model.
     * For example, this information MAY be added to the system prompt.
     */
    readonly instructions: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * The version of the Model Context Protocol that the server wants to use.
     * This may not match the version that the client requested. If the client
     * cannot support this version, it MUST disconnect.
     */
    readonly protocolVersion: Schema.String;
    readonly capabilities: typeof ServerCapabilities;
    readonly serverInfo: typeof Implementation;
    /**
     * Instructions describing how to use the server and its features.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * tools, resources, etc. It can be thought of like a "hint" to the model.
     * For example, this information MAY be added to the system prompt.
     */
    readonly instructions: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * After receiving an initialize request from the client, the server sends this
 * response.
 *
 * @since 4.0.0
 * @category initialization
 */
export declare class InitializeResult extends InitializeResult_base {
}
declare const Initialize_base: Rpc.Rpc<"initialize", Schema.Struct<{
    /**
     * The latest version of the Model Context Protocol that the client
     * supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: Schema.String;
    /**
     * Capabilities a client may support. Known capabilities are defined here,
     * in this schema, but this is not a closed set: any client can define its
     * own, additional capabilities.
     */
    capabilities: typeof ClientCapabilities;
    /**
     * Describes the name and version of an MCP implementation.
     */
    clientInfo: typeof Implementation;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof InitializeResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * This request is sent from the client to the server when it first connects,
 * asking it to begin initialization.
 *
 * @since 4.0.0
 * @category initialization
 */
export declare class Initialize extends Initialize_base {
}
declare const InitializedNotification_base: Rpc.Rpc<"notifications/initialized", Schema.UndefinedOr<typeof NotificationMeta>, Schema.Void, Schema.Never, never, never>;
/**
 * This notification is sent from the client to the server after initialization
 * has finished.
 *
 * @since 4.0.0
 * @category initialization
 */
export declare class InitializedNotification extends InitializedNotification_base {
}
declare const CancelledNotification_base: Rpc.Rpc<"notifications/cancelled", Schema.Struct<{
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the
     * same direction.
     */
    requestId: Schema.Union<[Schema.String, Schema.Number]>;
    /**
     * An optional string describing the reason for the cancellation. This MAY
     * be logged or presented to the user.
     */
    reason: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, Schema.Void, Schema.Never, never, never>;
/**
 * @since 4.0.0
 * @category cancellation
 */
export declare class CancelledNotification extends CancelledNotification_base {
}
declare const ProgressNotification_base: Rpc.Rpc<"notifications/progress", Schema.Struct<{
    /**
     * The progress token which was given in the initial request, used to
     * associate this notification with the request that is proceeding.
     */
    progressToken: Schema.Union<[Schema.String, Schema.Number]>;
    /**
     * The progress thus far. This should increase every time progress is made,
     * even if the total is unknown.
     */
    progress: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * Total number of items to process (or total progress required), if known.
     */
    total: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * An optional message describing the current progress.
     */
    message: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, Schema.Void, Schema.Never, never, never>;
/**
 * An out-of-band notification used to inform the receiver of a progress update
 * for a long-running request.
 *
 * @since 4.0.0
 * @category progress
 */
export declare class ProgressNotification extends ProgressNotification_base {
}
declare const Resource_base: Schema.Class<Resource, Schema.Struct<{
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * A human-readable name for this resource.
     *
     * This can be used by clients to populate UI elements.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * resources. It can be thought of like a "hint" to the model.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
    /**
     * The size of the raw resource content, in bytes (i.e., before base64
     * encoding or any tokenization), if known.
     *
     * This can be used by Hosts to display file sizes and estimate context
     * window usage.
     */
    readonly size: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * Optional additional metadata for the client.
     *
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to resources.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * A known resource that the server is capable of reading.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class Resource extends Resource_base {
}
declare const ResourceTemplate_base: Schema.Class<ResourceTemplate, Schema.Struct<{
    /**
     * A URI template (according to RFC 6570) that can be used to construct
     * resource URIs.
     */
    readonly uriTemplate: Schema.String;
    /**
     * A human-readable name for the type of resource this template refers to.
     *
     * This can be used by clients to populate UI elements.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A description of what this template is for.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * resources. It can be thought of like a "hint" to the model.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * The MIME type for all resources that match this template. This should only
     * be included if all resources matching this template have the same type.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * A template description for resources available on the server.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ResourceTemplate extends ResourceTemplate_base {
}
declare const ResourceContents_base: Schema.Opaque<ResourceContents, Schema.Struct<{
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * The contents of a specific resource or sub-resource.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ResourceContents extends ResourceContents_base {
}
declare const TextResourceContents_base: Schema.Opaque<TextResourceContents, Schema.Struct<{
    /**
     * The text of the item. This must only be set if the item can actually be
     * represented as text (not binary data).
     */
    readonly text: Schema.String;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * The text of the item. This must only be set if the item can actually be
     * represented as text (not binary data).
     */
    readonly text: Schema.String;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * The contents of a text resource, which can be represented as a string.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class TextResourceContents extends TextResourceContents_base {
}
declare const BlobResourceContents_base: Schema.Opaque<BlobResourceContents, Schema.Struct<{
    /**
     * The binary data of the item decoded from a base64-encoded string.
     */
    readonly blob: Schema.Uint8Array;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * The binary data of the item decoded from a base64-encoded string.
     */
    readonly blob: Schema.Uint8Array;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional additional metadata for the client.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * The contents of a binary resource, which can be represented as an Uint8Array
 *
 * @since 4.0.0
 * @category resources
 */
export declare class BlobResourceContents extends BlobResourceContents_base {
}
declare const ListResourcesResult_base: Schema.Class<ListResourcesResult, Schema.Struct<{
    readonly resources: Schema.$Array<typeof Resource>;
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The server's response to a resources/list request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ListResourcesResult extends ListResourcesResult_base {
}
declare const ListResources_base: Rpc.Rpc<"resources/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourcesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request a list of resources the server has.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ListResources extends ListResources_base {
}
declare const ListResourceTemplatesResult_base: Schema.Class<ListResourceTemplatesResult, Schema.Struct<{
    readonly resourceTemplates: Schema.$Array<typeof ResourceTemplate>;
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The server's response to a resources/templates/list request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ListResourceTemplatesResult extends ListResourceTemplatesResult_base {
}
declare const ListResourceTemplates_base: Rpc.Rpc<"resources/templates/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourceTemplatesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request a list of resource templates the server has.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ListResourceTemplates extends ListResourceTemplates_base {
}
declare const ReadResourceResult_base: Schema.Opaque<ReadResourceResult, Schema.Struct<{
    readonly contents: Schema.$Array<Schema.Union<readonly [typeof TextResourceContents, typeof BlobResourceContents]>>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly contents: Schema.$Array<Schema.Union<readonly [typeof TextResourceContents, typeof BlobResourceContents]>>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * The server's response to a resources/read request from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ReadResourceResult extends ReadResourceResult_base {
}
declare const ReadResource_base: Rpc.Rpc<"resources/read", Schema.Struct<{
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up
     * to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof ReadResourceResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to the server, to read a specific resource URI.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ReadResource extends ReadResource_base {
}
declare const ResourceListChangedNotification_base: Rpc.Rpc<"notifications/resources/list_changed", Schema.UndefinedOr<typeof NotificationMeta>, Schema.Void, Schema.Never, never, never>;
/**
 * An optional notification from the server to the client, informing it that the
 * list of resources it can read from has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class ResourceListChangedNotification extends ResourceListChangedNotification_base {
}
declare const Subscribe_base: Rpc.Rpc<"resources/subscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request resources/updated notifications from the
 * server whenever a particular resource changes.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class Subscribe extends Subscribe_base {
}
declare const Unsubscribe_base: Rpc.Rpc<"resources/unsubscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request cancellation of resources/updated
 * notifications from the server. This should follow a previous
 * resources/subscribe request.
 *
 * @since 4.0.0
 * @category resources
 */
export declare class Unsubscribe extends Unsubscribe_base {
}
declare const ResourceUpdatedNotification_base: Rpc.Rpc<"notifications/resources/updated", Schema.Struct<{
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, Schema.Void, Schema.Never, never, never>;
/**
 * @since 4.0.0
 * @category resources
 */
export declare class ResourceUpdatedNotification extends ResourceUpdatedNotification_base {
}
declare const PromptArgument_base: Schema.Opaque<PromptArgument, Schema.Struct<{
    /**
     * The name of the argument.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A human-readable description of the argument.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Whether this argument must be provided.
     */
    readonly required: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * The name of the argument.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A human-readable description of the argument.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Whether this argument must be provided.
     */
    readonly required: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
}>, keyof Schema.Top>;
/**
 * Describes an argument that a prompt can accept.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class PromptArgument extends PromptArgument_base {
}
declare const Prompt_base: Schema.Class<Prompt, Schema.Struct<{
    /**
     * The name of the prompt or prompt template.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * An optional description of what this prompt provides
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A list of arguments to use for templating the prompt.
     */
    readonly arguments: Schema.decodeTo<Schema.optional<Schema.$Array<typeof PromptArgument>>, Schema.optionalKey<Schema.$Array<typeof PromptArgument>>, never, never>;
}>, {}>;
/**
 * A prompt or prompt template that the server offers.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class Prompt extends Prompt_base {
}
declare const TextContent_base: Schema.Opaque<TextContent, Schema.Struct<{
    readonly type: Schema.tag<"text">;
    /**
     * The text content of the message.
     */
    readonly text: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"text">;
    /**
     * The text content of the message.
     */
    readonly text: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, keyof Schema.Top>;
/**
 * Text provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class TextContent extends TextContent_base {
}
declare const ImageContent_base: Schema.Opaque<ImageContent, Schema.Struct<{
    readonly type: Schema.tag<"image">;
    /**
     * The image data.
     */
    readonly data: Schema.Uint8Array;
    /**
     * The MIME type of the image. Different providers may support different
     * image types.
     */
    readonly mimeType: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"image">;
    /**
     * The image data.
     */
    readonly data: Schema.Uint8Array;
    /**
     * The MIME type of the image. Different providers may support different
     * image types.
     */
    readonly mimeType: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, keyof Schema.Top>;
/**
 * An image provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class ImageContent extends ImageContent_base {
}
declare const AudioContent_base: Schema.Opaque<AudioContent, Schema.Struct<{
    readonly type: Schema.tag<"audio">;
    /**
     * The audio data.
     */
    readonly data: Schema.Uint8Array;
    /**
     * The MIME type of the audio. Different providers may support different
     * audio types.
     */
    readonly mimeType: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"audio">;
    /**
     * The audio data.
     */
    readonly data: Schema.Uint8Array;
    /**
     * The MIME type of the audio. Different providers may support different
     * audio types.
     */
    readonly mimeType: Schema.String;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, keyof Schema.Top>;
/**
 * Audio provided to or from an LLM.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class AudioContent extends AudioContent_base {
}
declare const EmbeddedResource_base: Schema.Opaque<EmbeddedResource, Schema.Struct<{
    readonly type: Schema.tag<"resource">;
    readonly resource: Schema.Union<readonly [typeof TextResourceContents, typeof BlobResourceContents]>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"resource">;
    readonly resource: Schema.Union<readonly [typeof TextResourceContents, typeof BlobResourceContents]>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
}>, keyof Schema.Top>;
/**
 * The contents of a resource, embedded into a prompt or tool call result.
 *
 * It is up to the client how best to render embedded resources for the benefit
 * of the LLM and/or the user.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class EmbeddedResource extends EmbeddedResource_base {
}
declare const ResourceLink_base: Schema.Opaque<ResourceLink, Schema.Struct<{
    readonly type: Schema.tag<"resource_link">;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * A human-readable name for this resource.
     *
     * This can be used by clients to populate UI elements.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * resources. It can be thought of like a "hint" to the model.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
    /**
     * The size of the raw resource content, in bytes (i.e., before base64
     * encoding or any tokenization), if known.
     *
     * This can be used by Hosts to display file sizes and estimate context
     * window usage.
     */
    readonly size: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * Optional additional metadata for the client.
     *
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to resources.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"resource_link">;
    /**
     * The URI of this resource.
     */
    readonly uri: Schema.String;
    /**
     * A human-readable name for this resource.
     *
     * This can be used by clients to populate UI elements.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available
     * resources. It can be thought of like a "hint" to the model.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * The MIME type of this resource, if known.
     */
    readonly mimeType: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Optional annotations for the client.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof Annotations>, Schema.optionalKey<typeof Annotations>, never, never>;
    /**
     * The size of the raw resource content, in bytes (i.e., before base64
     * encoding or any tokenization), if known.
     *
     * This can be used by Hosts to display file sizes and estimate context
     * window usage.
     */
    readonly size: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * Optional additional metadata for the client.
     *
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to resources.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, keyof Schema.Top>;
/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 *
 * Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class ResourceLink extends ResourceLink_base {
}
/**
 * @since 4.0.0
 * @category prompts
 */
export declare const ContentBlock: Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent, typeof EmbeddedResource, typeof ResourceLink]>;
declare const PromptMessage_base: Schema.Opaque<PromptMessage, Schema.Struct<{
    readonly role: Schema.Literals<["user", "assistant"]>;
    readonly content: Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent, typeof EmbeddedResource, typeof ResourceLink]>;
}>, {}> & Omit<Schema.Struct<{
    readonly role: Schema.Literals<["user", "assistant"]>;
    readonly content: Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent, typeof EmbeddedResource, typeof ResourceLink]>;
}>, keyof Schema.Top>;
/**
 * Describes a message returned as part of a prompt.
 *
 * This is similar to `SamplingMessage`, but also supports the embedding of
 * resources from the MCP server.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class PromptMessage extends PromptMessage_base {
}
declare const ListPromptsResult_base: Schema.Class<ListPromptsResult, Schema.Struct<{
    readonly prompts: Schema.$Array<typeof Prompt>;
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The server's response to a prompts/list request from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class ListPromptsResult extends ListPromptsResult_base {
}
declare const ListPrompts_base: Rpc.Rpc<"prompts/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListPromptsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request a list of prompts and prompt templates the
 * server has.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class ListPrompts extends ListPrompts_base {
}
declare const GetPromptResult_base: Schema.Class<GetPromptResult, Schema.Struct<{
    readonly messages: Schema.$Array<typeof PromptMessage>;
    /**
     * An optional description for the prompt.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The server's response to a prompts/get request from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class GetPromptResult extends GetPromptResult_base {
}
declare const GetPrompt_base: Rpc.Rpc<"prompts/get", Schema.Struct<{
    /**
     * The name of the prompt or prompt template.
     */
    name: Schema.String;
    title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.String>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.String>>, never, never>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof GetPromptResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Used by the client to get a prompt provided by the server.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class GetPrompt extends GetPrompt_base {
}
declare const PromptListChangedNotification_base: Rpc.Rpc<"notifications/prompts/list_changed", Schema.UndefinedOr<typeof NotificationMeta>, Schema.Void, Schema.Never, never, never>;
/**
 * An optional notification from the server to the client, informing it that
 * the list of prompts it offers has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category prompts
 */
export declare class PromptListChangedNotification extends PromptListChangedNotification_base {
}
declare const ToolAnnotations_base: Schema.Opaque<ToolAnnotations, Schema.Struct<{
    /**
     * A human-readable title for the tool.
     */
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * If true, the tool does not modify its environment.
     *
     * Default: `false`
     */
    readonly readOnlyHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: `true`
     */
    readonly destructiveHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: `false`
     */
    readonly idempotentHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: `true`
     */
    readonly openWorldHint: optionalWithDefault<Schema.Boolean>;
}>, {}> & Omit<Schema.Struct<{
    /**
     * A human-readable title for the tool.
     */
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * If true, the tool does not modify its environment.
     *
     * Default: `false`
     */
    readonly readOnlyHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: `true`
     */
    readonly destructiveHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: `false`
     */
    readonly idempotentHint: optionalWithDefault<Schema.Boolean>;
    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: `true`
     */
    readonly openWorldHint: optionalWithDefault<Schema.Boolean>;
}>, keyof Schema.Top>;
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
export declare class ToolAnnotations extends ToolAnnotations_base {
}
declare const Tool_base: Schema.Class<Tool, Schema.Struct<{
    /**
     * The name of the tool.
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A human-readable description of the tool.
     *
     * This can be used by clients to improve the LLM's understanding of available tools. It can be thought of like a "hint" to the model.
     */
    readonly description: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A JSON Schema object defining the expected parameters for the tool.
     */
    readonly inputSchema: Schema.Any;
    /**
     * Optional additional tool information.
     */
    readonly annotations: Schema.decodeTo<Schema.optional<typeof ToolAnnotations>, Schema.optionalKey<typeof ToolAnnotations>, never, never>;
    /**
     * Optional additional metadata for the client.
     *
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to resources.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * Definition for a tool the client can call.
 *
 * @since 4.0.0
 * @category tools
 */
export declare class Tool extends Tool_base {
}
declare const ListToolsResult_base: Schema.Class<ListToolsResult, Schema.Struct<{
    readonly tools: Schema.$Array<typeof Tool>;
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    readonly nextCursor: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The server's response to a tools/list request from the client.
 *
 * @since 4.0.0
 * @category tools
 */
export declare class ListToolsResult extends ListToolsResult_base {
}
declare const ListTools_base: Rpc.Rpc<"tools/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListToolsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Sent from the client to request a list of tools the server has.
 *
 * @since 4.0.0
 * @category tools
 */
export declare class ListTools extends ListTools_base {
}
declare const CallToolResult_base: Schema.Class<CallToolResult, Schema.Struct<{
    readonly content: Schema.$Array<Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent, typeof EmbeddedResource, typeof ResourceLink]>>;
    readonly structuredContent: Schema.decodeTo<Schema.optional<Schema.Any>, Schema.optionalKey<Schema.Any>, never, never>;
    /**
     * Whether the tool call ended in an error.
     *
     * If not set, this is assumed to be false (the call was successful).
     */
    readonly isError: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
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
export declare class CallToolResult extends CallToolResult_base {
}
declare const CallTool_base: Rpc.Rpc<"tools/call", Schema.Struct<{
    name: Schema.String;
    arguments: Schema.$Record<Schema.String, Schema.Any>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof CallToolResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * Used by the client to invoke a tool provided by the server.
 *
 * @since 4.0.0
 * @category tools
 */
export declare class CallTool extends CallTool_base {
}
declare const ToolListChangedNotification_base: Rpc.Rpc<"notifications/tools/list_changed", Schema.UndefinedOr<typeof NotificationMeta>, Schema.Void, Schema.Never, never, never>;
/**
 * An optional notification from the server to the client, informing it that
 * the list of tools it offers has changed. This may be issued by servers
 * without any previous subscription from the client.
 *
 * @since 4.0.0
 * @category tools
 */
export declare class ToolListChangedNotification extends ToolListChangedNotification_base {
}
/**
 * The severity of a log message.
 *
 * These map to syslog message severities, as specified in RFC-5424:
 * https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
 *
 * @since 4.0.0
 * @category logging
 */
export declare const LoggingLevel: Schema.Literals<[
    "debug",
    "info",
    "notice",
    "warning",
    "error",
    "critical",
    "alert",
    "emergency"
]>;
/**
 * The severity of a log message.
 *
 * These map to syslog message severities, as specified in RFC-5424:
 * https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
 *
 * @since 4.0.0
 * @category logging
 */
export type LoggingLevel = typeof LoggingLevel.Type;
declare const SetLevel_base: Rpc.Rpc<"logging/setLevel", Schema.Struct<{
    /**
     * The level of logging that the client wants to receive from the server.
     * The server should send all logs at this level and higher (i.e., more
     * severe) to the client as notifications/message.
     */
    level: Schema.Literals<["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * A request from the client to the server, to enable or adjust logging.
 *
 * @since 4.0.0
 * @category logging
 */
export declare class SetLevel extends SetLevel_base {
}
declare const LoggingMessageNotification_base: Rpc.Rpc<"notifications/message", Schema.Struct<{
    /**
     * The severity of this log message.
     */
    readonly level: Schema.Literals<["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]>;
    /**
     * An optional name of the logger issuing this message.
     */
    readonly logger: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * The data to be logged, such as a string message or an object. Any JSON
     * serializable type is allowed here.
     */
    readonly data: Schema.Any;
    /**
     * This parameter name is reserved by MCP to allow clients and servers to
     * attach additional metadata to their notifications.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, Schema.Void, Schema.Never, never, never>;
/**
 * @since 4.0.0
 * @category logging
 */
export declare class LoggingMessageNotification extends LoggingMessageNotification_base {
}
declare const SamplingMessage_base: Schema.Opaque<SamplingMessage, Schema.Struct<{
    readonly role: Schema.Literals<["user", "assistant"]>;
    readonly content: Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent]>;
}>, {}> & Omit<Schema.Struct<{
    readonly role: Schema.Literals<["user", "assistant"]>;
    readonly content: Schema.Union<readonly [typeof TextContent, typeof ImageContent, typeof AudioContent]>;
}>, keyof Schema.Top>;
/**
 * Describes a message issued to or received from an LLM API.
 *
 * @since 4.0.0
 * @category sampling
 */
export declare class SamplingMessage extends SamplingMessage_base {
}
declare const ModelHint_base: Schema.Opaque<ModelHint, Schema.Struct<{
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
    readonly name: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, {}> & Omit<Schema.Struct<{
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
    readonly name: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, keyof Schema.Top>;
/**
 * Hints to use for model selection.
 *
 * Keys not declared here are currently left unspecified by the spec and are up
 * to the client to interpret.
 *
 * @since 4.0.0
 * @category sampling
 */
export declare class ModelHint extends ModelHint_base {
}
declare const ModelPreferences_base: Schema.Class<ModelPreferences, Schema.Struct<{
    /**
     * Optional hints to use for model selection.
     *
     * If multiple hints are specified, the client MUST evaluate them in order
     * (such that the first match is taken).
     *
     * The client SHOULD prioritize these hints over the numeric priorities, but
     * MAY still use the priorities to select from ambiguous matches.
     */
    readonly hints: Schema.decodeTo<Schema.optional<Schema.$Array<typeof ModelHint>>, Schema.optionalKey<Schema.$Array<typeof ModelHint>>, never, never>;
    /**
     * How much to prioritize cost when selecting a model. A value of 0 means cost
     * is not important, while a value of 1 means cost is the most important
     * factor.
     */
    readonly costPriority: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * How much to prioritize sampling speed (latency) when selecting a model. A
     * value of 0 means speed is not important, while a value of 1 means speed is
     * the most important factor.
     */
    readonly speedPriority: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * How much to prioritize intelligence and capabilities when selecting a
     * model. A value of 0 means intelligence is not important, while a value of 1
     * means intelligence is the most important factor.
     */
    readonly intelligencePriority: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
}>, {}>;
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
export declare class ModelPreferences extends ModelPreferences_base {
}
declare const CreateMessageResult_base: Schema.Class<CreateMessageResult, Schema.Struct<{
    /**
     * The name of the model that generated the message.
     */
    readonly model: Schema.String;
    /**
     * The reason why sampling stopped, if known.
     */
    readonly stopReason: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, {}>;
/**
 * The client's response to a sampling/create_message request from the server.
 * The client should inform the user before returning the sampled message, to
 * allow them to inspect the response (human in the loop) and decide whether to
 * allow the server to see it.
 *
 * @since 4.0.0
 * @category sampling
 */
export declare class CreateMessageResult extends CreateMessageResult_base {
}
declare const CreateMessage_base: Rpc.Rpc<"sampling/createMessage", Schema.Struct<{
    messages: Schema.$Array<typeof SamplingMessage>;
    /**
     * The server's preferences for which model to select. The client MAY ignore
     * these preferences.
     */
    modelPreferences: Schema.decodeTo<Schema.optional<typeof ModelPreferences>, Schema.optionalKey<typeof ModelPreferences>, never, never>;
    /**
     * An optional system prompt the server wants to use for sampling. The
     * client MAY modify or omit this prompt.
     */
    systemPrompt: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * A request to include context from one or more MCP servers (including the
     * caller), to be attached to the prompt. The client MAY ignore this request.
     */
    includeContext: Schema.decodeTo<Schema.optional<Schema.Literals<readonly ["none", "thisServer", "allServers"]>>, Schema.optionalKey<Schema.Literals<readonly ["none", "thisServer", "allServers"]>>, never, never>;
    temperature: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
    /**
     * The maximum number of tokens to sample, as requested by the server. The
     * client MAY choose to sample fewer tokens than requested.
     */
    maxTokens: Schema.Number;
    stopSequences: Schema.decodeTo<Schema.optional<Schema.$Array<Schema.String>>, Schema.optionalKey<Schema.$Array<Schema.String>>, never, never>;
    /**
     * Optional metadata to pass through to the LLM provider. The format of
     * this metadata is provider-specific.
     */
    metadata: Schema.Any;
}>, typeof CreateMessageResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * A request from the server to sample an LLM via the client. The client has
 * full discretion over which model to select. The client should also inform the
 * user before beginning sampling, to allow them to inspect the request (human
 * in the loop) and decide whether to approve it.
 *
 * @since 4.0.0
 * @category sampling
 */
export declare class CreateMessage extends CreateMessage_base {
}
declare const ResourceReference_base: Schema.Opaque<ResourceReference, Schema.Struct<{
    readonly type: Schema.tag<"ref/resource">;
    /**
     * The URI or URI template of the resource.
     */
    readonly uri: Schema.String;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"ref/resource">;
    /**
     * The URI or URI template of the resource.
     */
    readonly uri: Schema.String;
}>, keyof Schema.Top>;
/**
 * A reference to a resource or resource template definition.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export declare class ResourceReference extends ResourceReference_base {
}
declare const PromptReference_base: Schema.Opaque<PromptReference, Schema.Struct<{
    readonly type: Schema.tag<"ref/prompt">;
    /**
     * The name of the prompt or prompt template
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, {}> & Omit<Schema.Struct<{
    readonly type: Schema.tag<"ref/prompt">;
    /**
     * The name of the prompt or prompt template
     */
    readonly name: Schema.String;
    readonly title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, keyof Schema.Top>;
/**
 * Identifies a prompt.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export declare class PromptReference extends PromptReference_base {
}
declare const CompleteResult_base: Schema.Opaque<CompleteResult, Schema.Struct<{
    readonly completion: Schema.Struct<{
        /**
         * An array of completion values. Must not exceed 100 items.
         */
        readonly values: Schema.$Array<Schema.String>;
        /**
         * The total number of completion options available. This can exceed the
         * number of values actually sent in the response.
         */
        readonly total: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
        /**
         * Indicates whether there are additional completion options beyond those
         * provided in the current response, even if the exact total is unknown.
         */
        readonly hasMore: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>;
}>, {}> & Omit<Schema.Struct<{
    readonly completion: Schema.Struct<{
        /**
         * An array of completion values. Must not exceed 100 items.
         */
        readonly values: Schema.$Array<Schema.String>;
        /**
         * The total number of completion options available. This can exceed the
         * number of values actually sent in the response.
         */
        readonly total: Schema.decodeTo<Schema.optional<Schema.Number>, Schema.optionalKey<Schema.Number>, never, never>;
        /**
         * Indicates whether there are additional completion options beyond those
         * provided in the current response, even if the exact total is unknown.
         */
        readonly hasMore: Schema.decodeTo<Schema.optional<Schema.Boolean>, Schema.optionalKey<Schema.Boolean>, never, never>;
    }>;
}>, keyof Schema.Top>;
/**
 * The server's response to a completion/complete request
 *
 * @since 4.0.0
 * @category autocomplete
 */
export declare class CompleteResult extends CompleteResult_base {
    /**
     * @since 4.0.0
     */
    static readonly empty: CompleteResult;
}
declare const Complete_base: Rpc.Rpc<"completion/complete", Schema.Struct<{
    readonly ref: Schema.Union<readonly [typeof PromptReference, typeof ResourceReference]>;
    /**
     * The argument's information
     */
    readonly argument: Schema.Struct<{
        /**
         * The name of the argument
         */
        readonly name: Schema.String;
        /**
         * The value of the argument to use for completion matching.
         */
        readonly value: Schema.String;
    }>;
    /**
     * Additional, optional context for completions
     */
    readonly context: optionalWithDefault<Schema.Struct<{
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        readonly arguments: optionalWithDefault<Schema.$Record<Schema.String, Schema.String>>;
    }>>;
}>, typeof CompleteResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * A request from the client to the server, to ask for completion options.
 *
 * @since 4.0.0
 * @category autocomplete
 */
export declare class Complete extends Complete_base {
}
declare const Root_base: Schema.Class<Root, Schema.Struct<{
    /**
     * The URI identifying the root. This *must* start with file:// for now.
     * This restriction may be relaxed in future versions of the protocol to allow
     * other URI schemes.
     */
    readonly uri: Schema.String;
    /**
     * An optional name for the root. This can be used to provide a human-readable
     * identifier for the root, which may be useful for display purposes or for
     * referencing the root in other parts of the application.
     */
    readonly name: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
}>, {}>;
/**
 * Represents a root directory or file that the server can operate on.
 *
 * @since 4.0.0
 * @category roots
 */
export declare class Root extends Root_base {
}
declare const ListRootsResult_base: Schema.Class<ListRootsResult, Schema.Struct<{
    readonly roots: Schema.$Array<typeof Root>;
}>, {}>;
/**
 * The client's response to a roots/list request from the server. This result
 * contains an array of Root objects, each representing a root directory or file
 * that the server can operate on.
 *
 * @since 4.0.0
 * @category roots
 */
export declare class ListRootsResult extends ListRootsResult_base {
}
declare const ListRoots_base: Rpc.Rpc<"roots/list", Schema.UndefinedOr<typeof RequestMeta>, typeof ListRootsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
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
export declare class ListRoots extends ListRoots_base {
}
declare const RootsListChangedNotification_base: Rpc.Rpc<"notifications/roots/list_changed", Schema.UndefinedOr<typeof NotificationMeta>, Schema.Void, Schema.Never, never, never>;
/**
 * A notification from the client to the server, informing it that the list of
 * roots has changed. This notification should be sent whenever the client adds,
 * removes, or modifies any root. The server should then request an updated list
 * of roots using the ListRootsRequest.
 *
 * @since 4.0.0
 * @category roots
 */
export declare class RootsListChangedNotification extends RootsListChangedNotification_base {
}
declare const ElicitAcceptResult_base: Schema.Class<ElicitAcceptResult, Schema.Struct<{
    /**
     * The user action in response to the elicitation.
     * - "accept": User submitted the form/confirmed the action
     * - "decline": User explicitly declined the action
     * - "cancel": User dismissed without making an explicit choice
     */
    readonly action: Schema.Literal<"accept">;
    /**
     * The submitted form data, only present when action is "accept".
     * Contains values matching the requested schema.
     */
    readonly content: Schema.Any;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export declare class ElicitAcceptResult extends ElicitAcceptResult_base {
}
declare const ElicitDeclineResult_base: Schema.Class<ElicitDeclineResult, Schema.Struct<{
    /**
     * The user action in response to the elicitation.
     * - "accept": User submitted the form/confirmed the action
     * - "decline": User explicitly declined the action
     * - "cancel": User dismissed without making an explicit choice
     */
    readonly action: Schema.Literals<readonly ["cancel", "decline"]>;
    /**
     * This result property is reserved by the protocol to allow clients and
     * servers to attach additional metadata to their responses.
     */
    readonly _meta: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.Codec<Schema.Json, Schema.Json, never, never>>>, never, never>;
}>, {}>;
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export declare class ElicitDeclineResult extends ElicitDeclineResult_base {
}
/**
 * The client's response to an elicitation request
 *
 * @since 4.0.0
 * @category elicitation
 */
export declare const ElicitResult: Schema.Union<readonly [typeof ElicitAcceptResult, typeof ElicitDeclineResult]>;
declare const Elicit_base: Rpc.Rpc<"elicitation/create", Schema.Struct<{
    /**
     * A message to display to the user, explaining what they are being
     * elicited for.
     */
    message: Schema.String;
    /**
     * A restricted subset of JSON Schema.
     * Only top-level properties are allowed, without nesting.
     */
    requestedSchema: Schema.Any;
}>, Schema.Union<readonly [typeof ElicitAcceptResult, typeof ElicitDeclineResult]>, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, never, never>;
/**
 * @since 4.0.0
 * @category elicitation
 */
export declare class Elicit extends Elicit_base {
}
declare const ElicitationDeclined_base: Schema.Class<ElicitationDeclined, Schema.Struct<{
    readonly _tag: Schema.tag<"ElicitationDeclined">;
    readonly request: Schema.Struct<{
        /**
         * A message to display to the user, explaining what they are being
         * elicited for.
         */
        message: Schema.String;
        /**
         * A restricted subset of JSON Schema.
         * Only top-level properties are allowed, without nesting.
         */
        requestedSchema: Schema.Any;
    }>;
    readonly cause: Schema.decodeTo<Schema.optional<Schema.Defect>, Schema.optionalKey<Schema.Defect>, never, never>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category elicitation
 */
export declare class ElicitationDeclined extends ElicitationDeclined_base {
}
declare const McpServerClient_base: Context.ServiceClass<McpServerClient, "effect/ai/McpSchema/McpServerClient", {
    readonly clientId: number;
    readonly initializePayload: (typeof Initialize.payloadSchema)["Type"];
    readonly getClient: Effect.Effect<RpcClient.RpcClient<RpcGroup.Rpcs<typeof ServerRequestRpcs>, RpcClientError>, never, Scope.Scope>;
}>;
/**
 * @since 4.0.0
 * @category client
 */
export declare class McpServerClient extends McpServerClient_base {
}
declare const McpServerClientMiddleware_base: RpcMiddleware.ServiceClass<McpServerClientMiddleware, "effect/ai/McpSchema/McpServerClientMiddleware", McpServerClient, Schema.Never, never, never, false>;
/**
 * @since 4.0.0
 * @category middleware
 */
export declare class McpServerClientMiddleware extends McpServerClientMiddleware_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type RequestEncoded<Group extends RpcGroup.Any> = RpcGroup.Rpcs<Group> extends infer Rpc ? Rpc extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? {
    readonly _tag: "Request";
    readonly id: string | number;
    readonly method: _Tag;
    readonly payload: _Payload["Encoded"];
} : never : never;
/**
 * @since 4.0.0
 * @category protocol
 */
export type NotificationEncoded<Group extends RpcGroup.Any> = RpcGroup.Rpcs<Group> extends infer Rpc ? Rpc extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? {
    readonly _tag: "Notification";
    readonly method: _Tag;
    readonly payload: _Payload["Encoded"];
} : never : never;
/**
 * @since 4.0.0
 * @category protocol
 */
export type SuccessEncoded<Group extends RpcGroup.Any> = RpcGroup.Rpcs<Group> extends infer Rpc ? Rpc extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? {
    readonly _tag: "Success";
    readonly id: string | number;
    readonly result: _Success["Encoded"];
} : never : never;
/**
 * @since 4.0.0
 * @category protocol
 */
export type FailureEncoded<Group extends RpcGroup.Any> = RpcGroup.Rpcs<Group> extends infer Rpc ? Rpc extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? {
    readonly _tag: "Failure";
    readonly id: string | number;
    readonly error: _Error["Encoded"];
} : never : never;
declare const ClientRequestRpcs_base: RpcGroup.RpcGroup<Rpc.Rpc<"ping", Schema.UndefinedOr<typeof RequestMeta>, Schema.Struct<{}>, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"initialize", Schema.Struct<{
    /**
     * The latest version of the Model Context Protocol that the client
     * supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: Schema.String;
    /**
     * Capabilities a client may support. Known capabilities are defined here,
     * in this schema, but this is not a closed set: any client can define its
     * own, additional capabilities.
     */
    capabilities: typeof ClientCapabilities;
    /**
     * Describes the name and version of an MCP implementation.
     */
    clientInfo: typeof Implementation;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof InitializeResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourcesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/templates/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourceTemplatesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/read", Schema.Struct<{
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up
     * to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof ReadResourceResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/subscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/unsubscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"prompts/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListPromptsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"prompts/get", Schema.Struct<{
    /**
     * The name of the prompt or prompt template.
     */
    name: Schema.String;
    title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.String>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.String>>, never, never>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof GetPromptResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"tools/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListToolsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"tools/call", Schema.Struct<{
    name: Schema.String;
    arguments: Schema.$Record<Schema.String, Schema.Any>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof CallToolResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"logging/setLevel", Schema.Struct<{
    /**
     * The level of logging that the client wants to receive from the server.
     * The server should send all logs at this level and higher (i.e., more
     * severe) to the client as notifications/message.
     */
    level: Schema.Literals<["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"completion/complete", Schema.Struct<{
    readonly ref: Schema.Union<readonly [typeof PromptReference, typeof ResourceReference]>;
    /**
     * The argument's information
     */
    readonly argument: Schema.Struct<{
        /**
         * The name of the argument
         */
        readonly name: Schema.String;
        /**
         * The value of the argument to use for completion matching.
         */
        readonly value: Schema.String;
    }>;
    /**
     * Additional, optional context for completions
     */
    readonly context: optionalWithDefault<Schema.Struct<{
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        readonly arguments: optionalWithDefault<Schema.$Record<Schema.String, Schema.String>>;
    }>>;
}>, typeof CompleteResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never>>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ClientRequestRpcs extends ClientRequestRpcs_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type ClientRequestEncoded = RequestEncoded<typeof ClientRequestRpcs>;
declare const ClientNotificationRpcs_base: RpcGroup.RpcGroup<typeof InitializedNotification | typeof CancelledNotification | typeof ProgressNotification | typeof RootsListChangedNotification>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ClientNotificationRpcs extends ClientNotificationRpcs_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type ClientNotificationEncoded = NotificationEncoded<typeof ClientNotificationRpcs>;
declare const ClientRpcs_base: RpcGroup.RpcGroup<typeof InitializedNotification | typeof CancelledNotification | typeof ProgressNotification | typeof RootsListChangedNotification | Rpc.Rpc<"ping", Schema.UndefinedOr<typeof RequestMeta>, Schema.Struct<{}>, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"initialize", Schema.Struct<{
    /**
     * The latest version of the Model Context Protocol that the client
     * supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: Schema.String;
    /**
     * Capabilities a client may support. Known capabilities are defined here,
     * in this schema, but this is not a closed set: any client can define its
     * own, additional capabilities.
     */
    capabilities: typeof ClientCapabilities;
    /**
     * Describes the name and version of an MCP implementation.
     */
    clientInfo: typeof Implementation;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof InitializeResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourcesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/templates/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListResourceTemplatesResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/read", Schema.Struct<{
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up
     * to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof ReadResourceResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/subscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"resources/unsubscribe", Schema.Struct<{
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol;
     * it is up to the server how to interpret it.
     */
    uri: Schema.String;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"prompts/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListPromptsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"prompts/get", Schema.Struct<{
    /**
     * The name of the prompt or prompt template.
     */
    name: Schema.String;
    title: Schema.decodeTo<Schema.optional<Schema.String>, Schema.optionalKey<Schema.String>, never, never>;
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: Schema.decodeTo<Schema.optional<Schema.$Record<Schema.String, Schema.String>>, Schema.optionalKey<Schema.$Record<Schema.String, Schema.String>>, never, never>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof GetPromptResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"tools/list", Schema.UndefinedOr<typeof PaginatedRequestMeta>, typeof ListToolsResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"tools/call", Schema.Struct<{
    name: Schema.String;
    arguments: Schema.$Record<Schema.String, Schema.Any>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, typeof CallToolResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"logging/setLevel", Schema.Struct<{
    /**
     * The level of logging that the client wants to receive from the server.
     * The server should send all logs at this level and higher (i.e., more
     * severe) to the client as notifications/message.
     */
    level: Schema.Literals<["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]>;
    _meta: Schema.decodeTo<Schema.optional<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, Schema.optionalKey<Schema.Struct<{
        /**
         * If specified, the caller is requesting out-of-band progress notifications
         * for this request (as represented by notifications/progress). The value of
         * this parameter is an opaque token that will be attached to any subsequent
         * notifications. The receiver is not obligated to provide these
         * notifications.
         */
        readonly progressToken: Schema.decodeTo<Schema.optional<Schema.Union<[Schema.String, Schema.Number]>>, Schema.optionalKey<Schema.Union<[Schema.String, Schema.Number]>>, never, never>;
    }>>, never, never>;
}>, Schema.Void, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never> | Rpc.Rpc<"completion/complete", Schema.Struct<{
    readonly ref: Schema.Union<readonly [typeof PromptReference, typeof ResourceReference]>;
    /**
     * The argument's information
     */
    readonly argument: Schema.Struct<{
        /**
         * The name of the argument
         */
        readonly name: Schema.String;
        /**
         * The value of the argument to use for completion matching.
         */
        readonly value: Schema.String;
    }>;
    /**
     * Additional, optional context for completions
     */
    readonly context: optionalWithDefault<Schema.Struct<{
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        readonly arguments: optionalWithDefault<Schema.$Record<Schema.String, Schema.String>>;
    }>>;
}>, typeof CompleteResult, Schema.Union<readonly [typeof ParseError, typeof InvalidRequest, typeof MethodNotFound, typeof InvalidParams, typeof InternalError, typeof McpErrorBase]>, typeof McpServerClientMiddleware, never>>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ClientRpcs extends ClientRpcs_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type ClientSuccessEncoded = SuccessEncoded<typeof ServerRequestRpcs>;
/**
 * @since 4.0.0
 * @category protocol
 */
export type ClientFailureEncoded = FailureEncoded<typeof ServerRequestRpcs>;
declare const ServerRequestRpcs_base: RpcGroup.RpcGroup<typeof Ping | typeof CreateMessage | typeof ListRoots | typeof Elicit>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ServerRequestRpcs extends ServerRequestRpcs_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type ServerRequestEncoded = RequestEncoded<typeof ServerRequestRpcs>;
declare const ServerNotificationRpcs_base: RpcGroup.RpcGroup<typeof CancelledNotification | typeof ProgressNotification | typeof ResourceListChangedNotification | typeof ResourceUpdatedNotification | typeof PromptListChangedNotification | typeof ToolListChangedNotification | typeof LoggingMessageNotification>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ServerNotificationRpcs extends ServerNotificationRpcs_base {
}
/**
 * @since 4.0.0
 * @category protocol
 */
export type ServerNotificationEncoded = NotificationEncoded<typeof ServerNotificationRpcs>;
/**
 * @since 4.0.0
 * @category protocol
 */
export type ServerSuccessEncoded = SuccessEncoded<typeof ClientRequestRpcs>;
/**
 * @since 4.0.0
 * @category protocol
 */
export type ServerFailureEncoded = FailureEncoded<typeof ClientRequestRpcs>;
/**
 * @since 4.0.0
 * @category protocol
 */
export type ServerResultEncoded = ServerSuccessEncoded | ServerFailureEncoded;
/**
 * @since 4.0.0
 * @category protocol
 */
export type FromClientEncoded = ClientRequestEncoded | ClientNotificationEncoded;
/**
 * @since 4.0.0
 * @category protocol
 */
export type FromServerEncoded = ServerResultEncoded | ServerNotificationEncoded;
declare const ParamSchemaTypeId = "~effect/ai/McpSchema/ParamSchema";
/**
 * @since 4.0.0
 * @category parameters
 */
export declare function isParam(schema: Schema.Top): schema is Param<string, Schema.Top>;
/**
 * @since 4.0.0
 * @category parameters
 */
export interface Param<Name extends string, S extends Schema.Top> extends Schema.Bottom<S["Type"], S["Encoded"], S["DecodingServices"], S["EncodingServices"], S["ast"], Param<Name, S>, S["~type.make.in"], S["Iso"], S["~type.parameters"], S["~type.make"], S["~type.mutability"], S["~type.optionality"], S["~type.constructor.default"], S["~encoded.mutability"], S["~encoded.optionality"]> {
    readonly "Rebuild": Param<Name, S>;
    readonly [ParamSchemaTypeId]: typeof ParamSchemaTypeId;
    readonly name: Name;
    readonly schema: S;
}
/**
 * Helper to create a param for a resource URI template.
 *
 * @since 4.0.0
 * @category parameters
 */
export declare function param<const Name extends string, S extends Schema.Top>(name: Name, schema: S): Param<Name, S>;
declare const EnabledWhen_base: Context.ServiceClass<EnabledWhen, "effect/unstable/ai/McpSchema/EnabledWhen", Predicate.Predicate<{
    readonly protocolVersion: string;
    readonly capabilities: ClientCapabilities;
    readonly clientInfo: Implementation;
    readonly _meta?: {
        readonly progressToken?: string | number | undefined;
    } | undefined;
}>>;
/**
 * Annotation to conditionally enable or disable tools based on client
 * information.
 *
 * @since 4.0.0
 * @category annotations
 */
export declare class EnabledWhen extends EnabledWhen_base {
}
export {};
//# sourceMappingURL=McpSchema.d.ts.map