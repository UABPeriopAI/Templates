import type * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Data from "../../Data.ts";
import type * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Equal from "../../Equal.ts";
import * as Exit from "../../Exit.ts";
import type * as Latch from "../../Latch.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Queue from "../../Queue.ts";
import type * as Schedule from "../../Schedule.ts";
import { Scope } from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as Rpc from "../rpc/Rpc.ts";
import * as RpcClient from "../rpc/RpcClient.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import type { AlreadyProcessingMessage, MailboxFull, PersistenceError } from "./ClusterError.ts";
import { EntityAddress } from "./EntityAddress.ts";
import type { EntityId } from "./EntityId.ts";
import { EntityType } from "./EntityType.ts";
import * as Envelope from "./Envelope.ts";
import type * as Reply from "./Reply.ts";
import { RunnerAddress } from "./RunnerAddress.ts";
import * as ShardId from "./ShardId.ts";
import type { Sharding } from "./Sharding.ts";
import { ShardingConfig } from "./ShardingConfig.ts";
declare const TypeId = "~effect/cluster/Entity";
/**
 * @since 4.0.0
 * @category models
 */
export interface Entity<in out Type extends string, in out Rpcs extends Rpc.Any> extends Equal.Equal {
    readonly [TypeId]: typeof TypeId;
    /**
     * The name of the entity type.
     */
    readonly type: EntityType;
    /**
     * A RpcGroup definition for messages which represents the messaging protocol
     * that the entity is capable of processing.
     */
    readonly protocol: RpcGroup.RpcGroup<Rpcs>;
    /**
     * Get the shard group for the given EntityId.
     */
    getShardGroup(entityId: EntityId): string;
    /**
     * Get the ShardId for the given EntityId.
     */
    getShardId(entityId: EntityId): Effect.Effect<ShardId.ShardId, never, Sharding>;
    /**
     * Annotate the entity with a value.
     */
    annotate<I, S>(key: Context.Key<I, S>, value: S): Entity<Type, Rpcs>;
    /**
     * Annotate the Rpc's above this point with a value.
     */
    annotateRpcs<I, S>(key: Context.Key<I, S>, value: S): Entity<Type, Rpcs>;
    /**
     * Annotate the entity with the given annotations.
     */
    annotateMerge<S>(annotation: Context.Context<S>): Entity<Type, Rpcs>;
    /**
     * Annotate the Rpc's above this point with a context object.
     */
    annotateRpcsMerge<S>(context: Context.Context<S>): Entity<Type, Rpcs>;
    /**
     * Create a client for this entity.
     */
    readonly client: Effect.Effect<(entityId: string) => RpcClient.RpcClient.From<Rpcs, MailboxFull | AlreadyProcessingMessage | PersistenceError>, never, Sharding>;
    /**
     * Create a Layer from an Entity.
     *
     * It will register the entity with the Sharding service.
     */
    toLayer<Handlers extends HandlersFrom<Rpcs>, RX = never>(build: Handlers | Effect.Effect<Handlers, never, RX>, options?: {
        readonly maxIdleTime?: Duration.Input | undefined;
        readonly concurrency?: number | "unbounded" | undefined;
        readonly mailboxCapacity?: number | "unbounded" | undefined;
        readonly disableFatalDefects?: boolean | undefined;
        readonly defectRetryPolicy?: Schedule.Schedule<any, unknown> | undefined;
        readonly spanAttributes?: Record<string, string> | undefined;
    }): Layer.Layer<never, never, Exclude<RX, Scope | CurrentAddress | CurrentRunnerAddress> | RpcGroup.HandlersServices<Rpcs, Handlers> | Rpc.ServicesClient<Rpcs> | Rpc.ServicesServer<Rpcs> | Rpc.Middleware<Rpcs> | Sharding>;
    of<Handlers extends HandlersFrom<Rpcs>>(handlers: Handlers): Handlers;
    /**
     * Create a Layer from an Entity.
     *
     * It will register the entity with the Sharding service.
     */
    toLayerQueue<R, RX = never>(build: ((queue: Queue.Dequeue<Envelope.Request<Rpcs>>, replier: Replier<Rpcs>) => Effect.Effect<never, never, R>) | Effect.Effect<(queue: Queue.Dequeue<Envelope.Request<Rpcs>>, replier: Replier<Rpcs>) => Effect.Effect<never, never, R>, never, RX>, options?: {
        readonly maxIdleTime?: Duration.Input | undefined;
        readonly mailboxCapacity?: number | "unbounded" | undefined;
        readonly disableFatalDefects?: boolean | undefined;
        readonly defectRetryPolicy?: Schedule.Schedule<any, unknown> | undefined;
        readonly spanAttributes?: Record<string, string> | undefined;
    }): Layer.Layer<never, never, Exclude<RX, Scope | CurrentAddress | CurrentRunnerAddress> | R | Rpc.ServicesClient<Rpcs> | Rpc.ServicesServer<Rpcs> | Rpc.Middleware<Rpcs> | Sharding>;
}
/**
 * @since 4.0.0
 * @category models
 */
export type Any = Entity<string, Rpc.Any>;
/**
 * @since 4.0.0
 * @category models
 */
export type HandlersFrom<Rpc extends Rpc.Any> = {
    readonly [Current in Rpc as Current["_tag"]]: (envelope: Request<Current>) => Rpc.WrapperOr<Rpc.ResultFrom<Current, any>>;
};
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isEntity: (u: unknown) => u is Any;
/**
 * Creates a new `Entity` of the specified `type` which will accept messages
 * that adhere to the provided `RpcGroup`.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromRpcGroup: <const Type extends string, Rpcs extends Rpc.Any>(
/**
 * The entity type name.
 */
type: Type, 
/**
 * The schema definition for messages that the entity is capable of
 * processing.
 */
protocol: RpcGroup.RpcGroup<Rpcs>) => Entity<Type, Rpcs>;
/**
 * Creates a new `Entity` of the specified `type` which will accept messages
 * that adhere to the provided schemas.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <const Type extends string, Rpcs extends ReadonlyArray<Rpc.Any>>(
/**
 * The entity type name.
 */
type: Type, 
/**
 * The schema definition for messages that the entity is capable of
 * processing.
 */
protocol: Rpcs) => Entity<Type, Rpcs[number]>;
declare const CurrentAddress_base: Context.ServiceClass<CurrentAddress, "effect/cluster/Entity/EntityAddress", EntityAddress>;
/**
 * A Context.Tag to access the current entity address.
 *
 * @since 4.0.0
 * @category context
 */
export declare class CurrentAddress extends CurrentAddress_base {
}
declare const CurrentRunnerAddress_base: Context.ServiceClass<CurrentRunnerAddress, "effect/cluster/Entity/RunnerAddress", RunnerAddress>;
/**
 * A Context.Tag to access the current Runner address.
 *
 * @since 4.0.0
 * @category context
 */
export declare class CurrentRunnerAddress extends CurrentRunnerAddress_base {
}
/**
 * @since 4.0.0
 * @category Replier
 */
export interface Replier<Rpcs extends Rpc.Any> {
    readonly succeed: <R extends Rpcs>(request: Envelope.Request<R>, value: Replier.Success<R>) => Effect.Effect<void>;
    readonly fail: <R extends Rpcs>(request: Envelope.Request<R>, error: Rpc.Error<R>) => Effect.Effect<void>;
    readonly failCause: <R extends Rpcs>(request: Envelope.Request<R>, cause: Cause.Cause<Rpc.Error<R>>) => Effect.Effect<void>;
    readonly complete: <R extends Rpcs>(request: Envelope.Request<R>, exit: Exit.Exit<Replier.Success<R>, Rpc.Error<R>>) => Effect.Effect<void>;
}
/**
 * @since 4.0.0
 * @category Replier
 */
export declare namespace Replier {
    /**
     * @since 4.0.0
     * @category Replier
     */
    type Success<R extends Rpc.Any> = Rpc.Success<R> extends Stream.Stream<infer _A, infer _E, infer _R> ? Stream.Stream<_A, _E | Rpc.Error<R>, _R> | Queue.Dequeue<_A, _E | Rpc.Error<R> | Cause.Done> : Rpc.Success<R>;
}
/**
 * @since 4.0.0
 * @category Request
 */
export declare class Request<Rpc extends Rpc.Any> extends Data.Class<Envelope.Request<Rpc> & {
    readonly lastSentChunk: Option.Option<Reply.Chunk<Rpc>>;
}> {
    /**
     * @since 4.0.0
     */
    get lastSentChunkValue(): Option.Option<Rpc.SuccessChunk<Rpc>>;
    /**
     * @since 4.0.0
     */
    get nextSequence(): number;
}
/**
 * @since 4.0.0
 * @category Testing
 */
export declare const makeTestClient: <Type extends string, Rpcs extends Rpc.Any, LA, LE, LR>(entity: Entity<Type, Rpcs>, layer: Layer.Layer<LA, LE, LR>) => Effect.Effect<(entityId: string) => Effect.Effect<RpcClient.RpcClient<Rpcs>>, LE, Scope | ShardingConfig | Exclude<LR, Sharding> | Rpc.MiddlewareClient<Rpcs>>;
/**
 * @since 4.0.0
 * @category Keep alive
 */
export declare const keepAlive: (enabled: boolean) => Effect.Effect<void, never, Sharding | CurrentAddress>;
/**
 * @since 4.0.0
 * @category Keep alive
 */
export declare const KeepAliveRpc: Rpc.Rpc<"Cluster/Entity/keepAlive", import("../../Schema.ts").Void, import("../../Schema.ts").Void, import("../../Schema.ts").Never, never, never>;
declare const KeepAliveLatch_base: Context.ServiceClass<KeepAliveLatch, "effect/cluster/Entity/KeepAliveLatch", Latch.Latch>;
/**
 * @since 4.0.0
 * @category Keep alive
 */
export declare class KeepAliveLatch extends KeepAliveLatch_base {
}
export {};
//# sourceMappingURL=Entity.d.ts.map