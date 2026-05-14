/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as K8s from "./K8sHttpClient.ts";
import type { RunnerAddress } from "./RunnerAddress.ts";
import * as Runners from "./Runners.ts";
declare const RunnerHealth_base: Context.ServiceClass<RunnerHealth, "effect/cluster/RunnerHealth", {
    readonly isAlive: (address: RunnerAddress) => Effect.Effect<boolean>;
}>;
/**
 * Represents the service used to check if a Runner is healthy.
 *
 * If a Runner is responsive, shards will not be re-assigned because the Runner may
 * still be processing messages. If a Runner is not responsive, then its
 * associated shards can and will be re-assigned to a different Runner.
 *
 * @since 4.0.0
 * @category models
 */
export declare class RunnerHealth extends RunnerHealth_base {
}
/**
 * A layer which will **always** consider a Runner healthy.
 *
 * This is useful for testing.
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerNoop: Layer.Layer<RunnerHealth, never, never>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makePing: Effect.Effect<RunnerHealth["Service"], never, Runners.Runners | Scope.Scope>;
/**
 * A layer which will ping a Runner directly to check if it is healthy.
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerPing: Layer.Layer<RunnerHealth, never, Runners.Runners>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makeK8s: (options?: {
    readonly namespace?: string | undefined;
    readonly labelSelector?: string | undefined;
} | undefined) => Effect.Effect<{
    readonly isAlive: (address: RunnerAddress) => Effect.Effect<boolean>;
}, never, K8s.K8sHttpClient>;
/**
 * A layer which will check the Kubernetes API to see if a Runner is healthy.
 *
 * The provided HttpClient will need to add the pod's CA certificate to its
 * trusted root certificates in order to communicate with the Kubernetes API.
 *
 * The pod service account will also need to have permissions to list pods in
 * order to use this layer.
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layerK8s: (options?: {
    readonly namespace?: string | undefined;
    readonly labelSelector?: string | undefined;
} | undefined) => Layer.Layer<RunnerHealth, never, K8s.K8sHttpClient>;
export {};
//# sourceMappingURL=RunnerHealth.d.ts.map