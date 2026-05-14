import * as Schema from "../../Schema.js";
import * as HttpApiEndpoint from "../httpapi/HttpApiEndpoint.js";
import * as HttpApiGroup from "../httpapi/HttpApiGroup.js";
import * as Rpc from "../rpc/Rpc.js";
import * as RpcGroup from "../rpc/RpcGroup.js";
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
export const toRpcGroup = (workflows, options) => {
  const prefix = options?.prefix ?? "";
  const rpcs = [];
  for (const workflow_ of workflows) {
    const workflow = workflow_;
    rpcs.push(Rpc.make(`${prefix}${workflow.name}`, {
      payload: workflow.payloadSchema,
      error: workflow.errorSchema,
      success: workflow.successSchema
    }).annotateMerge(workflow.annotations), Rpc.make(`${prefix}${workflow.name}Discard`, {
      payload: workflow.payloadSchema
    }).annotateMerge(workflow.annotations), Rpc.make(`${prefix}${workflow.name}Resume`, {
      payload: ResumePayload
    }).annotateMerge(workflow.annotations));
  }
  return RpcGroup.make(...rpcs);
};
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
export const toHttpApiGroup = (name, workflows) => {
  let group = HttpApiGroup.make(name);
  for (const workflow_ of workflows) {
    const workflow = workflow_;
    const path = `/${tagToPath(workflow.name)}`;
    group = group.add(HttpApiEndpoint.post(workflow.name, path, {
      payload: workflow.payloadSchema,
      success: workflow.successSchema,
      error: workflow.errorSchema
    }).annotateMerge(workflow.annotations), HttpApiEndpoint.post(workflow.name + "Discard", `${path}/discard`, {
      payload: workflow.payloadSchema
    }).annotateMerge(workflow.annotations), HttpApiEndpoint.post(workflow.name + "Resume", `${path}/resume`, {
      payload: ResumePayload
    }).annotateMerge(workflow.annotations));
  }
  return group;
};
const tagToPath = tag => tag
// .replace(/[^a-zA-Z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphen
// .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen before uppercase letters
.toLowerCase();
const ResumePayload = /*#__PURE__*/Schema.Struct({
  executionId: Schema.String
});
//# sourceMappingURL=WorkflowProxy.js.map