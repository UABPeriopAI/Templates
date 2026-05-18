/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import type * as SqlError from "../sql/SqlError.ts";
import * as EventLogEncryption from "./EventLogEncryption.ts";
import * as EventLogServerEncrypted from "./EventLogServerEncrypted.ts";
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeStorage: (options?: {
    readonly entryTablePrefix?: string;
    readonly remoteIdTable?: string;
    readonly insertBatchSize?: number;
}) => Effect.Effect<EventLogServerEncrypted.Storage["Service"], SqlError.SqlError, SqlClient.SqlClient | EventLogEncryption.EventLogEncryption | Scope.Scope>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerStorage: (options?: {
    readonly entryTablePrefix?: string;
    readonly remoteIdTable?: string;
    readonly insertBatchSize?: number;
}) => Layer.Layer<EventLogServerEncrypted.Storage, SqlError.SqlError, SqlClient.SqlClient | EventLogEncryption.EventLogEncryption>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerStorageSubtle: (options?: {
    readonly entryTablePrefix?: string;
    readonly remoteIdTable?: string;
    readonly insertBatchSize?: number;
}) => Layer.Layer<EventLogServerEncrypted.Storage, SqlError.SqlError, SqlClient.SqlClient>;
//# sourceMappingURL=SqlEventLogServerEncrypted.d.ts.map