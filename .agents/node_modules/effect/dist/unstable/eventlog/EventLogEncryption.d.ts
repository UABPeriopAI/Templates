/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import * as Transferable from "../workers/Transferable.ts";
import { Entry, RemoteEntry } from "./EventJournal.ts";
import type { Identity } from "./EventLog.ts";
/**
 * @since 4.0.0
 * @category models
 */
export declare const EncryptedEntry: Schema.Struct<{
    readonly entryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
    readonly encryptedEntry: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export interface EncryptedRemoteEntry extends Schema.Schema.Type<typeof EncryptedRemoteEntry> {
}
/**
 * @since 4.0.0
 * @category models
 */
export declare const EncryptedRemoteEntry: Schema.Struct<{
    readonly sequence: Schema.Number;
    readonly iv: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    readonly entryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
    readonly encryptedEntry: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>;
declare const EventLogEncryption_base: Context.ServiceClass<EventLogEncryption, "effect/eventlog/EventLogEncryption", {
    readonly encrypt: (identity: Identity["Service"], entries: ReadonlyArray<Entry>) => Effect.Effect<{
        readonly iv: Uint8Array<ArrayBuffer>;
        readonly encryptedEntries: ReadonlyArray<Uint8Array<ArrayBuffer>>;
    }>;
    readonly decrypt: (identity: Identity["Service"], entries: ReadonlyArray<EncryptedRemoteEntry>) => Effect.Effect<Array<RemoteEntry>>;
    readonly sha256String: (data: Uint8Array) => Effect.Effect<string>;
    readonly sha256: (data: Uint8Array) => Effect.Effect<Uint8Array>;
    readonly generateIdentity: Effect.Effect<Identity["Service"]>;
}>;
/**
 * @since 4.0.0
 * @category services
 */
export declare class EventLogEncryption extends EventLogEncryption_base {
}
/**
 * @since 4.0.0
 * @category encryption
 */
export declare const makeEncryptionSubtle: (crypto: Crypto) => Effect.Effect<EventLogEncryption["Service"]>;
/**
 * @since 4.0.0
 * @category encryption
 */
export declare const layerSubtle: Layer.Layer<EventLogEncryption>;
export {};
//# sourceMappingURL=EventLogEncryption.d.ts.map