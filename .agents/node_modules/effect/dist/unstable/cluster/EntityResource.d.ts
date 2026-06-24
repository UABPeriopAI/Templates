/**
 * @since 4.0.0
 */
import type * as v1 from "kubernetes-types/core/v1.d.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Scope from "../../Scope.ts";
import * as Entity from "./Entity.ts";
import * as K8sHttpClient from "./K8sHttpClient.ts";
import type { Sharding } from "./Sharding.ts";
/**
 * @since 4.0.0
 * @category Type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category Type ids
 */
export type TypeId = "~effect/cluster/EntityResource";
/**
 * @since 4.0.0
 * @category Models
 */
export interface EntityResource<out A, out E = never> {
    readonly [TypeId]: TypeId;
    readonly get: Effect.Effect<A, E, Scope.Scope>;
    readonly close: Effect.Effect<void>;
}
declare const CloseScope_base: Context.ServiceClass<CloseScope, "effect/cluster/EntityResource/CloseScope", Scope.Scope>;
/**
 * A `Scope` that is only closed when the resource is explicitly closed.
 *
 * It is not closed during restarts, due to shard movement or node shutdowns.
 *
 * @since 4.0.0
 * @category Scope
 */
export declare class CloseScope extends CloseScope_base {
}
/**
 * A `EntityResource` is a resource that can be acquired inside a cluster
 * entity, which will keep the entity alive even across restarts.
 *
 * The resource will only be fully released when the idle time to live is
 * reached, or when the `close` effect is called.
 *
 * By default, the `idleTimeToLive` is infinite, meaning the resource will only
 * be released when `close` is called.
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: <A, E, R>(options: {
    readonly acquire: Effect.Effect<A, E, R>;
    readonly idleTimeToLive?: Duration.Input | undefined;
}) => Effect.Effect<EntityResource<A, E>, E, Scope.Scope | Exclude<R, CloseScope> | Sharding | Entity.CurrentAddress>;
/**
 * @since 4.0.0
 * @category Kubernetes
 */
export declare const makeK8sPod: (spec: v1.Pod, options?: {
    readonly idleTimeToLive?: Duration.Input | undefined;
} | undefined) => Effect.Effect<EntityResource<K8sHttpClient.PodStatus>, never, Scope.Scope | Sharding | Entity.CurrentAddress | K8sHttpClient.K8sHttpClient>;
export {};
//# sourceMappingURL=EntityResource.d.ts.map