import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Scope from "../../Scope.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import type { SqlError } from "../sql/SqlError.ts";
import { PersistenceError } from "./ClusterError.ts";
import * as RunnerStorage from "./RunnerStorage.ts";
import * as ShardId from "./ShardId.ts";
import * as ShardingConfig from "./ShardingConfig.ts";
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly prefix?: string | undefined;
}) => Effect.Effect<{
    readonly register: (runner: import("./Runner.ts").Runner, healthy: boolean) => Effect.Effect<import("./MachineId.ts").MachineId, PersistenceError>;
    readonly unregister: (address: import("./RunnerAddress.ts").RunnerAddress) => Effect.Effect<void, PersistenceError>;
    readonly getRunners: Effect.Effect<Array<readonly [runner: import("./Runner.ts").Runner, healthy: boolean]>, PersistenceError>;
    readonly setRunnerHealth: (address: import("./RunnerAddress.ts").RunnerAddress, healthy: boolean) => Effect.Effect<void, PersistenceError>;
    readonly acquire: (address: import("./RunnerAddress.ts").RunnerAddress, shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<Array<ShardId.ShardId>, PersistenceError>;
    readonly refresh: (address: import("./RunnerAddress.ts").RunnerAddress, shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<Array<ShardId.ShardId>, PersistenceError>;
    readonly release: (address: import("./RunnerAddress.ts").RunnerAddress, shardId: ShardId.ShardId) => Effect.Effect<void, PersistenceError>;
    readonly releaseAll: (address: import("./RunnerAddress.ts").RunnerAddress) => Effect.Effect<void, PersistenceError>;
}, SqlError, Scope.Scope | SqlClient.SqlClient | ShardingConfig.ShardingConfig>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<RunnerStorage.RunnerStorage, SqlError, SqlClient.SqlClient | ShardingConfig.ShardingConfig>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWith: (options: {
    readonly prefix?: string | undefined;
}) => Layer.Layer<RunnerStorage.RunnerStorage, SqlError, SqlClient.SqlClient | ShardingConfig.ShardingConfig>;
//# sourceMappingURL=SqlRunnerStorage.d.ts.map