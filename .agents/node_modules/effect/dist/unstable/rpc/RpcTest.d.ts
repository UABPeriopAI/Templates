/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.ts";
import type * as Scope from "../../Scope.ts";
import type * as Rpc from "./Rpc.ts";
import * as RpcClient from "./RpcClient.ts";
import type * as RpcGroup from "./RpcGroup.ts";
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeClient: <Rpcs extends Rpc.Any, const Flatten extends boolean = false>(group: RpcGroup.RpcGroup<Rpcs>, options?: {
    readonly flatten?: Flatten | undefined;
}) => Effect.Effect<Flatten extends true ? RpcClient.RpcClient.Flat<Rpcs> : RpcClient.RpcClient<Rpcs>, never, Scope.Scope | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.MiddlewareClient<Rpcs>>;
//# sourceMappingURL=RpcTest.d.ts.map