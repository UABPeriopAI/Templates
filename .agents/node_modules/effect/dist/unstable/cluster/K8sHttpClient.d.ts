/**
 * @since 4.0.0
 */
import type * as v1 from "kubernetes-types/core/v1.d.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import * as HttpClient from "../http/HttpClient.ts";
import * as HttpClientError from "../http/HttpClientError.ts";
declare const K8sHttpClient_base: Context.ServiceClass<K8sHttpClient, "effect/cluster/K8sHttpClient", HttpClient.HttpClient>;
/**
 * @since 4.0.0
 * @category Tags
 */
export declare class K8sHttpClient extends K8sHttpClient_base {
}
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<K8sHttpClient, never, HttpClient.HttpClient | FileSystem.FileSystem>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makeGetPods: (options?: {
    readonly namespace?: string | undefined;
    readonly labelSelector?: string | undefined;
} | undefined) => Effect.Effect<Effect.Effect<Map<string, Pod>, HttpClientError.HttpClientError | Schema.SchemaError, never>, never, K8sHttpClient>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makeCreatePod: Effect.Effect<(spec: v1.Pod) => Effect.Effect<PodStatus, never, import("../../Scope.ts").Scope>, never, K8sHttpClient>;
declare const PodStatus_base: Schema.Class<PodStatus, Schema.Struct<{
    readonly phase: Schema.String;
    readonly conditions: Schema.$Array<Schema.Struct<{
        readonly type: Schema.String;
        readonly status: Schema.String;
        readonly lastTransitionTime: Schema.String;
    }>>;
    readonly podIP: Schema.String;
    readonly hostIP: Schema.String;
}>, {}>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare class PodStatus extends PodStatus_base {
}
declare const Pod_base: Schema.Class<Pod, Schema.Struct<{
    readonly status: typeof PodStatus;
}>, {}>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare class Pod extends Pod_base {
    get isReady(): boolean;
    get isReadyOrInitializing(): boolean;
}
export {};
//# sourceMappingURL=K8sHttpClient.d.ts.map