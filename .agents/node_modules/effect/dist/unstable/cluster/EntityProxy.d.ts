/**
 * @since 4.0.0
 */
import * as Schema from "../../Schema.ts";
import * as HttpApiEndpoint from "../httpapi/HttpApiEndpoint.ts";
import * as HttpApiGroup from "../httpapi/HttpApiGroup.ts";
import * as Rpc from "../rpc/Rpc.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import { AlreadyProcessingMessage, MailboxFull, PersistenceError } from "./ClusterError.ts";
import type * as Entity from "./Entity.ts";
import type { EntityId } from "./EntityId.ts";
/**
 * Derives an `RpcGroup` from an `Entity`.
 *
 * ```ts
 * import { Layer, Schema } from "effect"
 * import {
 *   ClusterSchema,
 *   Entity,
 *   EntityProxy,
 *   EntityProxyServer
 * } from "effect/unstable/cluster"
 * import { Rpc, RpcServer } from "effect/unstable/rpc"
 *
 * export const Counter = Entity.make("Counter", [
 *   Rpc.make("Increment", {
 *     payload: { id: Schema.String, amount: Schema.Number },
 *     primaryKey: ({ id }) => id,
 *     success: Schema.Number
 *   })
 * ]).annotateRpcs(ClusterSchema.Persisted, true)
 *
 * // Use EntityProxy.toRpcGroup to create a `RpcGroup` from the Counter entity
 * export class MyRpcs extends EntityProxy.toRpcGroup(Counter) {}
 *
 * // Use EntityProxyServer.layerRpcHandlers to create a layer that implements
 * // the rpc handlers
 * const RpcServerLayer = RpcServer.layer(MyRpcs).pipe(
 *   Layer.provide(EntityProxyServer.layerRpcHandlers(Counter))
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const toRpcGroup: <Type extends string, Rpcs extends Rpc.Any>(entity: Entity.Entity<Type, Rpcs>) => RpcGroup.RpcGroup<ConvertRpcs<Rpcs, Type>>;
/**
 * @since 4.0.0
 */
export type ConvertRpcs<Rpcs extends Rpc.Any, Prefix extends string> = Rpcs extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware, infer _Requires> ? Rpc.Rpc<`${Prefix}.${_Tag}`, Schema.Struct<{
    entityId: typeof Schema.String;
    payload: _Payload;
}>, _Success, Schema.Codec<_Error["Type"] | MailboxFull | AlreadyProcessingMessage | PersistenceError, _Error["Encoded"] | typeof MailboxFull["Encoded"] | typeof AlreadyProcessingMessage["Encoded"] | typeof PersistenceError["Encoded"], _Error["DecodingServices"], _Error["EncodingServices"]>> | Rpc.Rpc<`${Prefix}.${_Tag}Discard`, Schema.Struct<{
    entityId: typeof Schema.String;
    payload: _Payload;
}>, typeof Schema.Void, Schema.Union<[
    typeof MailboxFull,
    typeof AlreadyProcessingMessage,
    typeof PersistenceError
]>> : never;
/**
 * Derives an `HttpApiGroup` from an `Entity`.
 *
 * ```ts
 * import { Layer, Schema } from "effect"
 * import {
 *   ClusterSchema,
 *   Entity,
 *   EntityProxy,
 *   EntityProxyServer
 * } from "effect/unstable/cluster"
 * import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
 * import { Rpc } from "effect/unstable/rpc"
 *
 * export const Counter = Entity.make("Counter", [
 *   Rpc.make("Increment", {
 *     payload: { id: Schema.String, amount: Schema.Number },
 *     primaryKey: ({ id }) => id,
 *     success: Schema.Number
 *   })
 * ]).annotateRpcs(ClusterSchema.Persisted, true)
 *
 * // Use EntityProxy.toHttpApiGroup to create a `HttpApiGroup` from the
 * // Counter entity
 * export class MyApi extends HttpApi.make("api")
 *   .add(
 *     EntityProxy.toHttpApiGroup("counter", Counter)
 *       .prefix("/counter")
 *   )
 * {}
 *
 * // Use EntityProxyServer.layerHttpApi to create a layer that implements
 * // the handlers for the HttpApiGroup
 * const ApiLayer = HttpApiBuilder.layer(MyApi).pipe(
 *   Layer.provide(EntityProxyServer.layerHttpApi(MyApi, "counter", Counter))
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const toHttpApiGroup: <const Name extends string, Type extends string, Rpcs extends Rpc.Any>(name: Name, entity: Entity.Entity<Type, Rpcs>) => HttpApiGroup.HttpApiGroup<Name, ConvertHttpApi<Rpcs>>;
/**
 * @since 4.0.0
 */
export type ConvertHttpApi<Rpcs extends Rpc.Any> = Rpcs extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware, infer _Requires> ? HttpApiEndpoint.HttpApiEndpoint<_Tag, "POST", `/${Lowercase<_Tag>}/:entityId`, Schema.Struct<{
    entityId: typeof EntityId;
}>, never, _Payload, never, _Success, _Error | typeof MailboxFull | typeof AlreadyProcessingMessage | typeof PersistenceError> | HttpApiEndpoint.HttpApiEndpoint<`${_Tag}Discard`, "POST", `/${Lowercase<_Tag>}/:entityId/discard`, Schema.Struct<{
    entityId: typeof EntityId;
}>, never, _Payload, never, Schema.Void, typeof MailboxFull | typeof AlreadyProcessingMessage | typeof PersistenceError> : never;
//# sourceMappingURL=EntityProxy.d.ts.map