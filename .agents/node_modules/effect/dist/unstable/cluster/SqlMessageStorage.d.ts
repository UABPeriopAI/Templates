import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import * as MessageStorage from "./MessageStorage.ts";
import type { ShardingConfig } from "./ShardingConfig.ts";
import * as Snowflake from "./Snowflake.ts";
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options?: {
    readonly prefix?: string | undefined;
}) => Effect.Effect<MessageStorage.MessageStorage["Service"], never, SqlClient.SqlClient | Snowflake.Generator>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<MessageStorage.MessageStorage, never, SqlClient.SqlClient | ShardingConfig>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWith: (options: {
    readonly prefix?: string | undefined;
}) => Layer.Layer<MessageStorage.MessageStorage, never, SqlClient.SqlClient | ShardingConfig>;
//# sourceMappingURL=SqlMessageStorage.d.ts.map