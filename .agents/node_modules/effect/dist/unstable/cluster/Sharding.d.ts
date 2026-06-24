import * as Context from "../../Context.ts";
import type { Input } from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schedule from "../../Schedule.ts";
import * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import * as RpcClient from "../rpc/RpcClient.ts";
import type { MailboxFull, PersistenceError } from "./ClusterError.ts";
import { AlreadyProcessingMessage, EntityNotAssignedToRunner } from "./ClusterError.ts";
import type { CurrentAddress, CurrentRunnerAddress, Entity, HandlersFrom } from "./Entity.ts";
import type { EntityId } from "./EntityId.ts";
import * as Message from "./Message.ts";
import * as MessageStorage from "./MessageStorage.ts";
import * as RunnerHealth from "./RunnerHealth.ts";
import { Runners } from "./Runners.ts";
import { RunnerStorage } from "./RunnerStorage.ts";
import type { ShardId } from "./ShardId.ts";
import { ShardingConfig } from "./ShardingConfig.ts";
import { type ShardingRegistrationEvent } from "./ShardingRegistrationEvent.ts";
import * as Snowflake from "./Snowflake.ts";
declare const Sharding_base: Context.ServiceClass<Sharding, "effect/cluster/Sharding", {
    /**
     * Returns a stream of events that occur when the runner registers entities or
     * singletons.
     */
    readonly getRegistrationEvents: Stream.Stream<ShardingRegistrationEvent>;
    /**
     * Returns the `ShardId` of the shard to which the entity at the specified
     * `address` is assigned.
     */
    readonly getShardId: (entityId: EntityId, group: string) => ShardId;
    /**
     * Returns `true` if the specified `shardId` is assigned to this runner.
     */
    readonly hasShardId: (shardId: ShardId) => boolean;
    /**
     * Generate a Snowflake ID that is unique to this runner.
     */
    readonly getSnowflake: Effect.Effect<Snowflake.Snowflake>;
    /**
     * Returns `true` if sharding is shutting down, `false` otherwise.
     */
    readonly isShutdown: Effect.Effect<boolean>;
    /**
     * Constructs a `RpcClient` which can be used to send messages to the
     * specified `Entity`.
     */
    readonly makeClient: <Type extends string, Rpcs extends Rpc.Any>(entity: Entity<Type, Rpcs>) => Effect.Effect<(entityId: string) => RpcClient.RpcClient.From<Rpcs, MailboxFull | AlreadyProcessingMessage | PersistenceError>>;
    /**
     * Registers a new entity with the runner.
     */
    readonly registerEntity: <Type extends string, Rpcs extends Rpc.Any, Handlers extends HandlersFrom<Rpcs>, RX>(entity: Entity<Type, Rpcs>, handlers: Effect.Effect<Handlers, never, RX>, options?: {
        readonly maxIdleTime?: Input | undefined;
        readonly concurrency?: number | "unbounded" | undefined;
        readonly mailboxCapacity?: number | "unbounded" | undefined;
        readonly disableFatalDefects?: boolean | undefined;
        readonly defectRetryPolicy?: Schedule.Schedule<any, unknown> | undefined;
        readonly spanAttributes?: Record<string, string> | undefined;
    }) => Effect.Effect<void, never, Scope.Scope | Rpc.ServicesServer<Rpcs> | Rpc.Middleware<Rpcs> | Exclude<RX, Scope.Scope | CurrentAddress | CurrentRunnerAddress>>;
    /**
     * Registers a new singleton with the runner.
     */
    readonly registerSingleton: <E, R>(name: string, run: Effect.Effect<void, E, R>, options?: {
        readonly shardGroup?: string | undefined;
    }) => Effect.Effect<void, never, R | Scope.Scope>;
    /**
     * Sends a message to the specified entity.
     */
    readonly send: (message: Message.Incoming<any>) => Effect.Effect<void, EntityNotAssignedToRunner | MailboxFull | AlreadyProcessingMessage>;
    /**
     * Sends an outgoing message
     */
    readonly sendOutgoing: (message: Message.Outgoing<any>, discard: boolean) => Effect.Effect<void, MailboxFull | AlreadyProcessingMessage | PersistenceError>;
    /**
     * Notify sharding that a message has been persisted to storage.
     */
    readonly notify: (message: Message.Incoming<any>, options?: {
        readonly waitUntilRead?: boolean | undefined;
    }) => Effect.Effect<void, EntityNotAssignedToRunner | AlreadyProcessingMessage>;
    /**
     * Reset the state of a message
     */
    readonly reset: (requestId: Snowflake.Snowflake) => Effect.Effect<boolean>;
    /**
     * Trigger a storage read, which will read all unprocessed messages.
     */
    readonly pollStorage: Effect.Effect<void>;
    /**
     * Retrieves the active entity count for the current runner.
     */
    readonly activeEntityCount: Effect.Effect<number>;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Sharding extends Sharding_base {
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<Sharding, never, ShardingConfig | Runners | MessageStorage.MessageStorage | RunnerStorage | RunnerHealth.RunnerHealth>;
export {};
//# sourceMappingURL=Sharding.d.ts.map