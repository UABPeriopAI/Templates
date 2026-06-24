/**
 * @since 4.0.0
 */
import * as Schema from "../../Schema.js";
import * as HttpApiEndpoint from "../httpapi/HttpApiEndpoint.js";
import * as HttpApiGroup from "../httpapi/HttpApiGroup.js";
import * as Rpc from "../rpc/Rpc.js";
import * as RpcGroup from "../rpc/RpcGroup.js";
import { AlreadyProcessingMessage, MailboxFull, PersistenceError } from "./ClusterError.js";
const clientErrors = [MailboxFull, AlreadyProcessingMessage, PersistenceError];
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
export const toRpcGroup = entity => {
  const rpcs = [];
  for (const parentRpc_ of entity.protocol.requests.values()) {
    const parentRpc = parentRpc_;
    const payloadSchema = Schema.Struct({
      entityId: Schema.String,
      payload: parentRpc.payloadSchema
    });
    const oldMake = payloadSchema.make;
    payloadSchema.make = (input, options) => {
      return oldMake({
        entityId: input.entityId,
        payload: parentRpc.payloadSchema.make(input.payload, options)
      }, options);
    };
    const rpc = Rpc.make(`${entity.type}.${parentRpc._tag}`, {
      payload: payloadSchema,
      error: Schema.Union([parentRpc.errorSchema, ...clientErrors]),
      success: parentRpc.successSchema
    }).annotateMerge(parentRpc.annotations);
    const rpcDiscard = Rpc.make(`${entity.type}.${parentRpc._tag}Discard`, {
      payload: payloadSchema,
      error: Schema.Union(clientErrors)
    }).annotateMerge(parentRpc.annotations);
    rpcs.push(rpc, rpcDiscard);
  }
  return RpcGroup.make(...rpcs);
};
const entityIdPath = {
  entityId: Schema.String
};
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
export const toHttpApiGroup = (name, entity) => {
  let group = HttpApiGroup.make(name);
  for (const parentRpc_ of entity.protocol.requests.values()) {
    const parentRpc = parentRpc_;
    const endpoint = HttpApiEndpoint.post(parentRpc._tag, `/${tagToPath(parentRpc._tag)}/:entityId`, {
      params: entityIdPath,
      payload: parentRpc.payloadSchema,
      success: parentRpc.successSchema,
      error: [parentRpc.errorSchema, ...clientErrors]
    }).annotateMerge(parentRpc.annotations);
    const endpointDiscard = HttpApiEndpoint.post(`${parentRpc._tag}Discard`, `/${tagToPath(parentRpc._tag)}/:entityId/discard`, {
      params: entityIdPath,
      payload: parentRpc.payloadSchema,
      error: clientErrors
    }).annotateMerge(parentRpc.annotations);
    group = group.add(endpoint).add(endpointDiscard);
  }
  return group;
};
// TODO: type level equivalent
const tagToPath = tag => tag
// .replace(/[^a-zA-Z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphen
// .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen before uppercase letters
.toLowerCase();
//# sourceMappingURL=EntityProxy.js.map