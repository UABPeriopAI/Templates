import type { Brand } from "../../Brand.ts";
import * as Context from "../../Context.ts";
import * as DateTime from "../../DateTime.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Order from "../../Order.ts";
import * as PubSub from "../../PubSub.ts";
import * as Schema from "../../Schema.ts";
import type { Scope } from "../../Scope.ts";
import * as Msgpack from "../encoding/Msgpack.ts";
import type { StoreId } from "./EventLogMessage.ts";
declare const EventJournal_base: Context.ServiceClass<EventJournal, "effect/eventlog/EventJournal", {
    /**
     * Read all the entries in the journal.
     */
    readonly entries: Effect.Effect<ReadonlyArray<Entry>, EventJournalError>;
    /**
     * Write an event to the journal, performing an effect before committing the
     * event.
     */
    readonly write: <A, E, R>(options: {
        readonly event: string;
        readonly primaryKey: string;
        readonly payload: Uint8Array;
        readonly effect: (entry: Entry) => Effect.Effect<A, E, R>;
    }) => Effect.Effect<A, EventJournalError | E, R>;
    /**
     * Write events from a remote source to the journal.
     *
     * Effects run sequentially in compaction bracket order.
     */
    readonly writeFromRemote: (options: {
        readonly remoteId: RemoteId;
        readonly entries: ReadonlyArray<RemoteEntry>;
        readonly compact?: ((uncommitted: ReadonlyArray<RemoteEntry>) => Effect.Effect<ReadonlyArray<Entry>, EventJournalError>) | undefined;
        readonly effect: (options: {
            readonly entry: Entry;
            readonly conflicts: ReadonlyArray<Entry>;
        }) => Effect.Effect<void, EventJournalError>;
    }) => Effect.Effect<{
        readonly duplicateEntries: ReadonlyArray<Entry>;
    }, EventJournalError>;
    /**
     * Return the uncommitted entries for a remote source.
     */
    readonly withRemoteUncommited: <A, E, R>(remoteId: RemoteId, f: (entries: ReadonlyArray<Entry>) => Effect.Effect<A, E, R>) => Effect.Effect<A, EventJournalError | E, R>;
    /**
     * Retrieve the last known sequence number for a remote source.
     */
    readonly nextRemoteSequence: (remoteId: RemoteId) => Effect.Effect<number, EventJournalError>;
    /**
     * The entries added to the local journal.
     */
    readonly changes: Effect.Effect<PubSub.Subscription<Entry>, never, Scope>;
    /**
     * Remove all data
     */
    readonly destroy: Effect.Effect<void, EventJournalError>;
    /**
     * Run an effect with a lock on the journal.
     */
    readonly withLock: (storeId: StoreId) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}>;
/**
 * @since 4.0.0
 * @category context
 */
export declare class EventJournal extends EventJournal_base {
}
declare const TypeId: "effect/eventlog/EventJournal/EventJournalError";
declare const EventJournalError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EventJournalError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class EventJournalError extends EventJournalError_base<{
    readonly method: string;
    readonly cause: unknown;
}> {
    /**
     * @since 4.0.0
     */
    readonly [TypeId]: "effect/eventlog/EventJournal/EventJournalError";
}
/**
 * @since 4.0.0
 * @category remote
 */
export type RemoteIdTypeId = "effect/eventlog/EventJournal/RemoteId";
/**
 * @since 4.0.0
 * @category remote
 */
export declare const RemoteIdTypeId: RemoteIdTypeId;
/**
 * @since 4.0.0
 * @category remote
 */
export type RemoteId = Uint8Array & Brand<RemoteIdTypeId>;
/**
 * @since 4.0.0
 * @category remote
 */
export declare const RemoteId: Schema.brand<Schema.Uint8Array, "effect/eventlog/EventJournal/RemoteId">;
/**
 * @since 4.0.0
 * @category remote
 */
export declare const makeRemoteIdUnsafe: () => RemoteId;
/**
 * @since 4.0.0
 * @category entry
 */
export declare const EntryIdTypeId: EntryIdTypeId;
/**
 * @since 4.0.0
 * @category entry
 */
export type EntryIdTypeId = "effect/eventlog/EventJournal/EntryId";
/**
 * @since 4.0.0
 * @category entry
 */
export type EntryId = Uint8Array<ArrayBuffer> & Brand<EntryIdTypeId>;
/**
 * @since 4.0.0
 * @category entry
 */
export declare const EntryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
/**
 * @since 4.0.0
 * @category entry
 */
export declare const EntryIdOrder: Order.Order<EntryId>;
/**
 * @since 4.0.0
 * @category entry
 */
export declare const makeEntryIdUnsafe: (options?: {
    msecs?: number;
}) => EntryId;
/**
 * @since 4.0.0
 * @category entry
 */
export declare const entryIdMillis: (entryId: EntryId) => number;
declare const Entry_base: Schema.Class<Entry, Schema.Struct<{
    readonly id: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
    readonly event: Schema.String;
    readonly primaryKey: Schema.String;
    readonly payload: Schema.Uint8Array;
}>, {}>;
/**
 * @since 4.0.0
 * @category entry
 */
export declare class Entry extends Entry_base {
    /**
     * @since 4.0.0
     */
    static arrayMsgpack: Schema.$Array<Msgpack.schema<typeof Entry>>;
    /**
     * @since 4.0.0
     */
    static encodeArray: (input: unknown, options?: import("../../SchemaAST.ts").ParseOptions) => Effect.Effect<readonly Uint8Array<ArrayBuffer>[], Schema.SchemaError, never>;
    /**
     * @since 4.0.0
     */
    static decodeArray: (input: unknown, options?: import("../../SchemaAST.ts").ParseOptions) => Effect.Effect<readonly Entry[], Schema.SchemaError, never>;
    /**
     * @since 4.0.0
     */
    static Order: Order.Order<Entry>;
    /**
     * @since 4.0.0
     */
    get idString(): string;
    /**
     * @since 4.0.0
     */
    get createdAtMillis(): number;
    /**
     * @since 4.0.0
     */
    get createdAt(): DateTime.Utc;
}
declare const RemoteEntry_base: Schema.Class<RemoteEntry, Schema.Struct<{
    readonly remoteSequence: Schema.Number;
    readonly entry: typeof Entry;
}>, {}>;
/**
 * @since 4.0.0
 * @category entry
 */
export declare class RemoteEntry extends RemoteEntry_base {
}
/**
 * @since 4.0.0
 * @category memory
 */
export declare const makeMemory: Effect.Effect<EventJournal["Service"]>;
/**
 * @since 4.0.0
 * @category memory
 */
export declare const layerMemory: Layer.Layer<EventJournal>;
/**
 * @since 4.0.0
 * @category indexed db
 */
export declare const makeIndexedDb: (options?: {
    readonly database?: string;
}) => Effect.Effect<EventJournal["Service"], EventJournalError, Scope>;
/**
 * @since 4.0.0
 * @category indexed db
 */
export declare const layerIndexedDb: (options?: {
    readonly database?: string;
}) => Layer.Layer<EventJournal, EventJournalError>;
export {};
//# sourceMappingURL=EventJournal.d.ts.map