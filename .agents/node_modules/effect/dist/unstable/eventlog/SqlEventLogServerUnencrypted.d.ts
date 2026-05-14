import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import * as SqlError from "../sql/SqlError.ts";
import * as EventLogServerUnencrypted from "./EventLogServerUnencrypted.ts";
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeStorage: (options?: {
    readonly entryTablePrefix?: string;
    readonly remoteIdTable?: string;
    readonly insertBatchSize?: number;
}) => Effect.Effect<EventLogServerUnencrypted.Storage["Service"], SqlError.SqlError, SqlClient.SqlClient | Scope.Scope>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerStorage: (options?: {
    readonly entryTablePrefix?: string;
    readonly remoteIdTable?: string;
    readonly insertBatchSize?: number;
}) => Layer.Layer<EventLogServerUnencrypted.Storage, SqlError.SqlError, SqlClient.SqlClient>;
//# sourceMappingURL=SqlEventLogServerUnencrypted.d.ts.map