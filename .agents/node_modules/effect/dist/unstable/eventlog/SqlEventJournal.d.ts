import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as SqlClient from "../sql/SqlClient.ts";
import * as SqlError from "../sql/SqlError.ts";
import * as EventJournal from "./EventJournal.ts";
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options?: {
    readonly entryTable?: string;
    readonly remotesTable?: string;
}) => Effect.Effect<EventJournal.EventJournal["Service"], SqlError.SqlError, SqlClient.SqlClient>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: (options?: {
    readonly entryTable?: string;
    readonly remotesTable?: string;
}) => Layer.Layer<EventJournal.EventJournal, SqlError.SqlError, SqlClient.SqlClient>;
//# sourceMappingURL=SqlEventJournal.d.ts.map