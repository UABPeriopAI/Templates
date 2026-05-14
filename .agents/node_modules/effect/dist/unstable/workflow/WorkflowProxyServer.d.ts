/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Layer from "../../Layer.ts";
import type * as HttpApi from "../httpapi/HttpApi.ts";
import type * as HttpApiGroup from "../httpapi/HttpApiGroup.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import type * as Workflow from "./Workflow.ts";
import type { WorkflowEngine } from "./WorkflowEngine.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHttpApi: <ApiId extends string, Groups extends HttpApiGroup.Any, Name extends HttpApiGroup.Name<Groups>, const Workflows extends NonEmptyReadonlyArray<Workflow.Any>>(api: HttpApi.HttpApi<ApiId, Groups>, name: Name, workflows: Workflows) => Layer.Layer<HttpApiGroup.ApiGroup<ApiId, Name>, never, WorkflowEngine | Workflow.RequirementsHandler<Workflows[number]>>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerRpcHandlers: <const Workflows extends NonEmptyReadonlyArray<Workflow.Any>, const Prefix extends string = "">(workflows: Workflows, options?: {
    readonly prefix?: Prefix;
}) => Layer.Layer<RpcHandlers<Workflows[number], Prefix>, never, WorkflowEngine | Workflow.RequirementsHandler<Workflows[number]>>;
/**
 * @since 4.0.0
 */
export type RpcHandlers<Workflows extends Workflow.Any, Prefix extends string> = Workflows extends Workflow.Workflow<infer _Name, infer _Payload, infer _Success, infer _Error> ? Rpc.Handler<`${Prefix}${_Name}`> | Rpc.Handler<`${Prefix}${_Name}Discard`> | Rpc.Handler<`${Prefix}${_Name}Resume`> : never;
//# sourceMappingURL=WorkflowProxyServer.d.ts.map