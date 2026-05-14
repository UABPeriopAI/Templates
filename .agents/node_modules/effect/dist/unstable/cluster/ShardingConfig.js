/**
 * @since 4.0.0
 */
import * as Config from "../../Config.js";
import * as ConfigProvider from "../../ConfigProvider.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Schema from "../../Schema.js";
import { RunnerAddress } from "./RunnerAddress.js";
/**
 * Represents the configuration for the `Sharding` service on a given runner.
 *
 * @since 4.0.0
 * @category models
 */
export class ShardingConfig extends /*#__PURE__*/Context.Service()("effect/cluster/ShardingConfig") {}
const defaultRunnerAddress = /*#__PURE__*/RunnerAddress.make({
  host: "localhost",
  port: 34431
});
/**
 * @since 4.0.0
 * @category defaults
 */
export const defaults = {
  runnerAddress: /*#__PURE__*/Option.some(defaultRunnerAddress),
  runnerListenAddress: /*#__PURE__*/Option.none(),
  runnerShardWeight: 1,
  shardsPerGroup: 300,
  shardGroups: ["default"],
  preemptiveShutdown: true,
  shardLockRefreshInterval: /*#__PURE__*/Duration.seconds(10),
  shardLockExpiration: /*#__PURE__*/Duration.seconds(35),
  shardLockDisableAdvisory: false,
  entityMailboxCapacity: 4096,
  entityMaxIdleTime: /*#__PURE__*/Duration.minutes(1),
  entityRegistrationTimeout: /*#__PURE__*/Duration.minutes(1),
  entityTerminationTimeout: /*#__PURE__*/Duration.seconds(15),
  entityMessagePollInterval: /*#__PURE__*/Duration.seconds(10),
  entityReplyPollInterval: /*#__PURE__*/Duration.millis(200),
  sendRetryInterval: /*#__PURE__*/Duration.millis(100),
  refreshAssignmentsInterval: /*#__PURE__*/Duration.seconds(3),
  runnerHealthCheckInterval: /*#__PURE__*/Duration.minutes(1),
  simulateRemoteSerialization: true
};
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = options => Layer.succeed(ShardingConfig)({
  ...defaults,
  ...options
});
/**
 * @since 4.0.0
 * @category defaults
 */
export const layerDefaults = /*#__PURE__*/layer();
/**
 * @since 4.0.0
 * @category Config
 */
export const config = /*#__PURE__*/Config.all({
  runnerAddress: /*#__PURE__*/Config.all({
    host: Config.string("host").pipe(Config.withDefault(defaultRunnerAddress.host)
    // Config.withDescription("The hostname or IP address of the runner.")
    ),
    port: Config.int("port").pipe(Config.withDefault(defaultRunnerAddress.port)
    // Config.withDescription("The port used for inter-runner communication.")
    )
  }).pipe(/*#__PURE__*/Config.map(options => RunnerAddress.make(options)), Config.option),
  runnerListenAddress: /*#__PURE__*/Config.all({
    host: Config.string("listenHost"),
    // Config.withDescription("The host to listen on.")
    port: Config.int("listenPort").pipe(Config.withDefault(defaultRunnerAddress.port)
    // Config.withDescription("The port to listen on.")
    )
  }).pipe(/*#__PURE__*/Config.map(options => RunnerAddress.make(options)), Config.option),
  runnerShardWeight: /*#__PURE__*/Config.int("runnerShardWeight").pipe(/*#__PURE__*/Config.withDefault(defaults.runnerShardWeight)
  // Config.withDescription("A number that determines how many shards this runner will be assigned relative to other runners.")
  ),
  shardGroups: /*#__PURE__*/Config.schema(Schema.Array(Schema.String), "shardGroups").pipe(/*#__PURE__*/Config.withDefault(["default"])
  // Config.withDescription("The shard groups that are assigned to this runner.")
  ),
  shardsPerGroup: /*#__PURE__*/Config.int("shardsPerGroup").pipe(/*#__PURE__*/Config.withDefault(defaults.shardsPerGroup)
  // Config.withDescription("The number of shards to allocate per shard group.")
  ),
  shardLockRefreshInterval: /*#__PURE__*/Config.duration("shardLockRefreshInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.shardLockRefreshInterval)
  // Config.withDescription("Shard lock refresh interval.")
  ),
  shardLockExpiration: /*#__PURE__*/Config.duration("shardLockExpiration").pipe(/*#__PURE__*/Config.withDefault(defaults.shardLockExpiration)
  // Config.withDescription("Shard lock expiration duration.")
  ),
  shardLockDisableAdvisory: /*#__PURE__*/Config.boolean("shardLockDisableAdvisory").pipe(/*#__PURE__*/Config.withDefault(defaults.shardLockDisableAdvisory)
  // Config.withDescription("Disable the use of advisory locks for shard locking.")
  ),
  preemptiveShutdown: /*#__PURE__*/Config.boolean("preemptiveShutdown").pipe(/*#__PURE__*/Config.withDefault(defaults.preemptiveShutdown)
  // Config.withDescription("Start shutting down as soon as an Entity has started shutting down.")
  ),
  entityMailboxCapacity: /*#__PURE__*/Config.int("entityMailboxCapacity").pipe(/*#__PURE__*/Config.withDefault(defaults.entityMailboxCapacity)
  // Config.withDescription("The default capacity of the mailbox for entities.")
  ),
  entityMaxIdleTime: /*#__PURE__*/Config.duration("entityMaxIdleTime").pipe(/*#__PURE__*/Config.withDefault(defaults.entityMaxIdleTime)
  // Config.withDescription(
  //   "The maximum duration of inactivity (i.e. without receiving a message) after which an entity will be interrupted."
  // )
  ),
  entityRegistrationTimeout: /*#__PURE__*/Config.duration("entityRegistrationTimeout").pipe(/*#__PURE__*/Config.withDefault(defaults.entityRegistrationTimeout)
  // Config.withDescription("If an entity does not register itself within this time after a message is sent to it, the message will be marked as failed.")
  ),
  entityTerminationTimeout: /*#__PURE__*/Config.duration("entityTerminationTimeout").pipe(/*#__PURE__*/Config.withDefault(defaults.entityTerminationTimeout)
  // Config.withDescription("The maximum duration of time to wait for an entity to terminate.")
  ),
  entityMessagePollInterval: /*#__PURE__*/Config.duration("entityMessagePollInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.entityMessagePollInterval)
  // Config.withDescription("The interval at which to poll for unprocessed messages from storage.")
  ),
  entityReplyPollInterval: /*#__PURE__*/Config.duration("entityReplyPollInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.entityReplyPollInterval)
  // Config.withDescription("The interval at which to poll for client replies from storage.")
  ),
  sendRetryInterval: /*#__PURE__*/Config.duration("sendRetryInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.sendRetryInterval)
  // Config.withDescription("The interval to retry a send if EntityNotManagedByRunner is returned.")
  ),
  refreshAssignmentsInterval: /*#__PURE__*/Config.duration("refreshAssignmentsInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.refreshAssignmentsInterval)
  // Config.withDescription("The interval at which to refresh shard assignments.")
  ),
  runnerHealthCheckInterval: /*#__PURE__*/Config.duration("runnerHealthCheckInterval").pipe(/*#__PURE__*/Config.withDefault(defaults.runnerHealthCheckInterval)
  // Config.withDescription("The interval at which to check for unhealthy runners and report them.")
  ),
  // unhealthyRunnerReportInterval: Config.duration("unhealthyRunnerReportInterval").pipe(
  simulateRemoteSerialization: /*#__PURE__*/Config.boolean("simulateRemoteSerialization").pipe(/*#__PURE__*/Config.withDefault(defaults.simulateRemoteSerialization)
  // Config.withDescription("Simulate serialization and deserialization to remote runners for local entities.")
  )
});
/**
 * @since 4.0.0
 * @category Config
 */
export const configFromEnv = /*#__PURE__*/config.asEffect().pipe(/*#__PURE__*/Effect.provideService(ConfigProvider.ConfigProvider, /*#__PURE__*/ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase)));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerFromEnv = options => Layer.effect(ShardingConfig)(options ? Effect.map(configFromEnv, config => ({
  ...config,
  ...options
})) : configFromEnv);
//# sourceMappingURL=ShardingConfig.js.map