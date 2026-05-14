import * as Layer from "../../Layer.ts";
import type * as HttpApi from "../httpapi/HttpApi.ts";
import type * as HttpApiGroup from "../httpapi/HttpApiGroup.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import type * as Entity from "./Entity.ts";
import type { Sharding } from "./Sharding.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHttpApi: <ApiId extends string, Groups extends HttpApiGroup.Any, Name extends HttpApiGroup.Name<Groups>, Type extends string, Rpcs extends Rpc.Any>(api: HttpApi.HttpApi<ApiId, Groups>, name: Name, entity: Entity.Entity<Type, Rpcs>) => Layer.Layer<HttpApiGroup.ApiGroup<ApiId, Name>, never, Sharding | Rpc.ServicesServer<Rpcs>>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerRpcHandlers: <const Type extends string, Rpcs extends Rpc.Any>(entity: Entity.Entity<Type, Rpcs>) => Layer.Layer<RpcHandlers<Rpcs, Type>, never, Sharding | Rpc.ServicesServer<Rpcs>>;
/**
 * @since 4.0.0
 */
export type RpcHandlers<Rpcs extends Rpc.Any, Prefix extends string> = Rpcs extends Rpc.Rpc<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware, infer _Requires> ? Rpc.Handler<`${Prefix}.${_Tag}`> | Rpc.Handler<`${Prefix}.${_Tag}Discard`> : never;
//# sourceMappingURL=EntityProxyServer.d.ts.map