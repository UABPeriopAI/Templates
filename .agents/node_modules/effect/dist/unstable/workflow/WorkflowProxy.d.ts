/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Schema from "../../Schema.ts";
import * as HttpApiEndpoint from "../httpapi/HttpApiEndpoint.ts";
import * as HttpApiGroup from "../httpapi/HttpApiGroup.ts";
import * as Rpc from "../rpc/Rpc.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import type * as Workflow from "./Workflow.ts";
/**
 * Derives an `RpcGroup` from a list of workflows.
 *
 * ```ts
 * import { Layer, Schema } from "effect"
 * import { RpcServer } from "effect/unstable/rpc"
 * import {
 *   Workflow,
 *   WorkflowProxy,
 *   WorkflowProxyServer
 * } from "effect/unstable/workflow"
 *
 * const EmailWorkflow = Workflow.make({
 *   name: "EmailWorkflow",
 *   payload: {
 *     id: Schema.String,
 *     to: Schema.String
 *   },
 *   idempotencyKey: ({ id }) => id
 * })
 *
 * const myWorkflows = [EmailWorkflow] as const
 *
 * // Use WorkflowProxy.toRpcGroup to create a `RpcGroup` from the
 * // workflows
 * class MyRpcs extends WorkflowProxy.toRpcGroup(myWorkflows) {}
 *
 * // Use WorkflowProxyServer.layerRpcHandlers to create a layer that implements
 * // the rpc handlers
 * const ApiLayer = RpcServer.layer(MyRpcs).pipe(
 *   Layer.provide(WorkflowProxyServer.layerRpcHandlers(myWorkflows))
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const toRpcGroup: <const Workflows extends NonEmptyReadonlyArray<Workflow.Any>, const Prefix extends string = "">(workflows: Workflows, options?: {
    readonly prefix?: Prefix | undefined;
}) => RpcGroup.RpcGroup<ConvertRpcs<Workflows[number], Prefix>>;
/**
 * @since 4.0.0
 */
export type ConvertRpcs<Workflows extends Workflow.Any, Prefix extends string> = Workflows extends Workflow.Workflow<infer _Name, infer _Payload, infer _Success, infer _Error> ? Rpc.Rpc<`${Prefix}${_Name}`, _Payload, _Success, _Error> | Rpc.Rpc<`${Prefix}${_Name}Discard`, _Payload> | Rpc.Rpc<`${Prefix}${_Name}Resume`, typeof ResumePayload> : never;
/**
 * Derives an `HttpApiGroup` from a list of workflows.
 *
 * ```ts
 * import { Layer, Schema } from "effect"
 * import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
 * import {
 *   Workflow,
 *   WorkflowProxy,
 *   WorkflowProxyServer
 * } from "effect/unstable/workflow"
 *
 * const EmailWorkflow = Workflow.make({
 *   name: "EmailWorkflow",
 *   payload: {
 *     id: Schema.String,
 *     to: Schema.String
 *   },
 *   idempotencyKey: ({ id }) => id
 * })
 *
 * const myWorkflows = [EmailWorkflow] as const
 *
 * // Use WorkflowProxy.toHttpApiGroup to create a `HttpApiGroup` from the
 * // workflows
 * class MyApi extends HttpApi.make("api")
 *   .add(WorkflowProxy.toHttpApiGroup("workflows", myWorkflows))
 * {}
 *
 * // Use WorkflowProxyServer.layerHttpApi to create a layer that implements the
 * // workflows HttpApiGroup
 * const ApiLayer = HttpApiBuilder.layer(MyApi).pipe(
 *   Layer.provide(
 *     WorkflowProxyServer.layerHttpApi(MyApi, "workflows", myWorkflows)
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const toHttpApiGroup: <const Name extends string, const Workflows extends NonEmptyReadonlyArray<Workflow.Any>>(name: Name, workflows: Workflows) => HttpApiGroup.HttpApiGroup<Name, ConvertHttpApi<Workflows[number]>>;
/**
 * @since 4.0.0
 */
export type ConvertHttpApi<Workflows extends Workflow.Any> = Workflows extends Workflow.Workflow<infer _Name, infer _Payload, infer _Success, infer _Error> ? HttpApiEndpoint.HttpApiEndpoint<_Name, "POST", `/${Lowercase<_Name>}`, never, never, _Payload, never, _Success, _Error> | HttpApiEndpoint.HttpApiEndpoint<`${_Name}Discard`, "POST", `/${Lowercase<_Name>}/discard`, never, never, _Payload> | HttpApiEndpoint.HttpApiEndpoint<`${_Name}Resume`, "POST", `/${Lowercase<_Name>}/resume`, never, never, typeof ResumePayload> : never;
declare const ResumePayload: Schema.Struct<{
    readonly executionId: Schema.String;
}>;
export {};
//# sourceMappingURL=WorkflowProxy.d.ts.map