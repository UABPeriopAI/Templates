/**
 * @since 4.0.0
 */
import * as Layer from "effect/Layer";
import type { ConfigError } from "../../Config.ts";
import type * as SqlClient from "../sql/SqlClient.ts";
import type * as MessageStorage from "./MessageStorage.ts";
import * as Runners from "./Runners.ts";
import * as Sharding from "./Sharding.ts";
import * as ShardingConfig from "./ShardingConfig.ts";
/**
 * A sql backed single-node cluster, that can be used for running durable
 * entities and workflows.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: (options?: {
    readonly shardingConfig?: Partial<ShardingConfig.ShardingConfig["Service"]> | undefined;
    readonly runnerStorage?: "memory" | "sql" | undefined;
}) => Layer.Layer<Sharding.Sharding | Runners.Runners | MessageStorage.MessageStorage, ConfigError, SqlClient.SqlClient>;
//# sourceMappingURL=SingleRunner.d.ts.map