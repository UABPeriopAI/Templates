/**
 * @since 4.0.0
 */
import * as Config from "../../Config.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import { RunnerAddress } from "./RunnerAddress.ts";
declare const ShardingConfig_base: Context.ServiceClass<ShardingConfig, "effect/cluster/ShardingConfig", {
    /**
     * The address for the current runner that other runners can use to
     * communicate with it.
     *
     * If `None`, the runner is not part of the cluster and will be in a client-only
     * mode.
     */
    readonly runnerAddress: Option.Option<RunnerAddress>;
    /**
     * The listen address for the current runner.
     *
     * Defaults to the `runnerAddress`.
     */
    readonly runnerListenAddress: Option.Option<RunnerAddress>;
    /**
     * A number that determines how many shards this runner will be assigned
     * relative to other runners.
     *
     * Defaults to `1`.
     *
     * A value of `2` means that this runner should be assigned twice as many
     * shards as a runner with a weight of `1`.
     */
    readonly runnerShardWeight: number;
    /**
     * The shard groups that are assigned to this runner.
     *
     * Defaults to `["default"]`.
     */
    readonly shardGroups: ReadonlyArray<string>;
    /**
     * The number of shards to allocate per shard group.
     *
     * **Note**: this value should be consistent across all runners.
     */
    readonly shardsPerGroup: number;
    /**
     * Shard lock refresh interval.
     */
    readonly shardLockRefreshInterval: Duration.Input;
    /**
     * Shard lock expiration duration.
     */
    readonly shardLockExpiration: Duration.Input;
    /**
     * Disable the use of advisory locks for shard locking.
     */
    readonly shardLockDisableAdvisory: boolean;
    /**
     * Start shutting down as soon as an Entity has started shutting down.
     *
     * Defaults to `true`.
     */
    readonly preemptiveShutdown: boolean;
    /**
     * The default capacity of the mailbox for entities.
     */
    readonly entityMailboxCapacity: number | "unbounded";
    /**
     * The maximum duration of inactivity (i.e. without receiving a message)
     * after which an entity will be interrupted.
     */
    readonly entityMaxIdleTime: Duration.Input;
    /**
     * If an entity does not register itself within this time after a message is
     * sent to it, the message will be marked as failed.
     *
     * Defaults to 1 minute.
     */
    readonly entityRegistrationTimeout: Duration.Input;
    /**
     * The maximum duration of time to wait for an entity to terminate.
     *
     * By default this is set to 15 seconds to stay within kubernetes defaults.
     */
    readonly entityTerminationTimeout: Duration.Input;
    /**
     * The interval at which to poll for unprocessed messages from storage.
     */
    readonly entityMessagePollInterval: Duration.Input;
    /**
     * The interval at which to poll for client replies from storage.
     */
    readonly entityReplyPollInterval: Duration.Input;
    /**
     * The interval at which to poll for new runners and refresh shard
     * assignments.
     */
    readonly refreshAssignmentsInterval: Duration.Input;
    /**
     * The interval to retry a send if EntityNotAssignedToRunner is returned.
     */
    readonly sendRetryInterval: Duration.Input;
    /**
     * The interval at which to check for unhealthy runners and report them
     */
    readonly runnerHealthCheckInterval: Duration.Input;
    /**
     * Simulate serialization and deserialization to remote runners for local
     * entities.
     */
    readonly simulateRemoteSerialization: boolean;
}>;
/**
 * Represents the configuration for the `Sharding` service on a given runner.
 *
 * @since 4.0.0
 * @category models
 */
export declare class ShardingConfig extends ShardingConfig_base {
}
/**
 * @since 4.0.0
 * @category defaults
 */
export declare const defaults: ShardingConfig["Service"];
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: (options?: Partial<ShardingConfig["Service"]>) => Layer.Layer<ShardingConfig>;
/**
 * @since 4.0.0
 * @category defaults
 */
export declare const layerDefaults: Layer.Layer<ShardingConfig>;
/**
 * @since 4.0.0
 * @category Config
 */
export declare const config: Config.Config<ShardingConfig["Service"]>;
/**
 * @since 4.0.0
 * @category Config
 */
export declare const configFromEnv: Effect.Effect<{
    /**
     * The address for the current runner that other runners can use to
     * communicate with it.
     *
     * If `None`, the runner is not part of the cluster and will be in a client-only
     * mode.
     */
    readonly runnerAddress: Option.Option<RunnerAddress>;
    /**
     * The listen address for the current runner.
     *
     * Defaults to the `runnerAddress`.
     */
    readonly runnerListenAddress: Option.Option<RunnerAddress>;
    /**
     * A number that determines how many shards this runner will be assigned
     * relative to other runners.
     *
     * Defaults to `1`.
     *
     * A value of `2` means that this runner should be assigned twice as many
     * shards as a runner with a weight of `1`.
     */
    readonly runnerShardWeight: number;
    /**
     * The shard groups that are assigned to this runner.
     *
     * Defaults to `["default"]`.
     */
    readonly shardGroups: ReadonlyArray<string>;
    /**
     * The number of shards to allocate per shard group.
     *
     * **Note**: this value should be consistent across all runners.
     */
    readonly shardsPerGroup: number;
    /**
     * Shard lock refresh interval.
     */
    readonly shardLockRefreshInterval: Duration.Input;
    /**
     * Shard lock expiration duration.
     */
    readonly shardLockExpiration: Duration.Input;
    /**
     * Disable the use of advisory locks for shard locking.
     */
    readonly shardLockDisableAdvisory: boolean;
    /**
     * Start shutting down as soon as an Entity has started shutting down.
     *
     * Defaults to `true`.
     */
    readonly preemptiveShutdown: boolean;
    /**
     * The default capacity of the mailbox for entities.
     */
    readonly entityMailboxCapacity: number | "unbounded";
    /**
     * The maximum duration of inactivity (i.e. without receiving a message)
     * after which an entity will be interrupted.
     */
    readonly entityMaxIdleTime: Duration.Input;
    /**
     * If an entity does not register itself within this time after a message is
     * sent to it, the message will be marked as failed.
     *
     * Defaults to 1 minute.
     */
    readonly entityRegistrationTimeout: Duration.Input;
    /**
     * The maximum duration of time to wait for an entity to terminate.
     *
     * By default this is set to 15 seconds to stay within kubernetes defaults.
     */
    readonly entityTerminationTimeout: Duration.Input;
    /**
     * The interval at which to poll for unprocessed messages from storage.
     */
    readonly entityMessagePollInterval: Duration.Input;
    /**
     * The interval at which to poll for client replies from storage.
     */
    readonly entityReplyPollInterval: Duration.Input;
    /**
     * The interval at which to poll for new runners and refresh shard
     * assignments.
     */
    readonly refreshAssignmentsInterval: Duration.Input;
    /**
     * The interval to retry a send if EntityNotAssignedToRunner is returned.
     */
    readonly sendRetryInterval: Duration.Input;
    /**
     * The interval at which to check for unhealthy runners and report them
     */
    readonly runnerHealthCheckInterval: Duration.Input;
    /**
     * Simulate serialization and deserialization to remote runners for local
     * entities.
     */
    readonly simulateRemoteSerialization: boolean;
}, Config.ConfigError, never>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerFromEnv: (options?: Partial<ShardingConfig["Service"]> | undefined) => Layer.Layer<ShardingConfig, Config.ConfigError>;
export {};
//# sourceMappingURL=ShardingConfig.d.ts.map