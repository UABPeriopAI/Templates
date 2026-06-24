import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as Tracer from "../../Tracer.ts";
import * as Socket from "../socket/Socket.ts";
import * as DevToolsSchema from "./DevToolsSchema.ts";
declare const DevToolsClient_base: Context.ServiceClass<DevToolsClient, "effect/devtools/DevToolsClient", {
    readonly sendUnsafe: (_: DevToolsSchema.Span | DevToolsSchema.SpanEvent) => void;
}>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class DevToolsClient extends DevToolsClient_base {
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: Effect.Effect<DevToolsClient["Service"], never, Scope.Scope | Socket.Socket>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<DevToolsClient, never, Socket.Socket>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeTracer: Effect.Effect<Tracer.Tracer, never, DevToolsClient>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerTracer: Layer.Layer<never, never, Socket.Socket>;
export {};
//# sourceMappingURL=DevToolsClient.d.ts.map