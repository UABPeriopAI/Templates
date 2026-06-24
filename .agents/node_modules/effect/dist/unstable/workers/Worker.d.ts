/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import type * as Deferred from "../../Deferred.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Scope from "../../Scope.ts";
import { WorkerError } from "./WorkerError.ts";
declare const WorkerPlatform_base: Context.ServiceClass<WorkerPlatform, "effect/workers/Worker/WorkerPlatform", {
    readonly spawn: <O = unknown, I = unknown>(id: number) => Effect.Effect<Worker<O, I>, WorkerError, Spawner>;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class WorkerPlatform extends WorkerPlatform_base {
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Worker<O = unknown, I = unknown> {
    readonly send: (message: I, transfers?: ReadonlyArray<unknown>) => Effect.Effect<void, WorkerError>;
    readonly run: <A, E, R>(handler: (message: O) => Effect.Effect<A, E, R>, options?: {
        readonly onSpawn?: Effect.Effect<void> | undefined;
    } | undefined) => Effect.Effect<never, E | WorkerError, R>;
}
/**
 * @since 4.0.0
 * @category models
 */
export declare const makeUnsafe: (options: {
    readonly send: (message: unknown, transfers?: ReadonlyArray<unknown>) => Effect.Effect<void, WorkerError>;
    readonly run: <A, E, R>(handler: (message: PlatformMessage) => Effect.Effect<A, E, R>) => Effect.Effect<never, E | WorkerError, R>;
}) => Worker<any, any>;
/**
 * @since 4.0.0
 * @category models
 */
export type PlatformMessage = readonly [ready: 0] | readonly [data: 1, unknown];
/**
 * @since 4.0.0
 * @category models
 */
export interface Spawner {
    readonly _: unique symbol;
}
/**
 * @since 4.0.0
 * @category tags
 */
export declare const Spawner: Context.Service<Spawner, SpawnerFn<unknown>>;
/**
 * @since 4.0.0
 * @category models
 */
export interface SpawnerFn<W = unknown> {
    (id: number): W;
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerSpawner: <W = unknown>(spawner: SpawnerFn<W>) => Layer.Layer<Spawner>;
/**
 * @since 4.0.0
 */
export declare const makePlatform: <W>() => <P extends {
    readonly postMessage: (message: any, transfers?: any | undefined) => void;
}>(options: {
    readonly setup: (options: {
        readonly worker: W;
        readonly scope: Scope.Scope;
    }) => Effect.Effect<P, WorkerError>;
    readonly listen: (options: {
        readonly port: P;
        readonly emit: (data: any) => void;
        readonly deferred: Deferred.Deferred<never, WorkerError>;
        readonly scope: Scope.Scope;
    }) => Effect.Effect<void>;
}) => WorkerPlatform["Service"];
export {};
//# sourceMappingURL=Worker.d.ts.map