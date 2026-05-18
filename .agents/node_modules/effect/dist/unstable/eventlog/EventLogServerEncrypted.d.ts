import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as RpcServer from "../rpc/RpcServer.ts";
import * as Transferable from "../workers/Transferable.ts";
import { type RemoteId } from "./EventJournal.ts";
import type { EncryptedRemoteEntry } from "./EventLogEncryption.ts";
import { type StoreId } from "./EventLogMessage.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerRpcHandlers: Layer.Layer<import("./EventLogMessage.ts").EventLogAuthentication | import("../rpc/Rpc.ts").Handler<"EventLog.Hello"> | import("../rpc/Rpc.ts").Handler<"EventLog.Authenticate"> | import("../rpc/Rpc.ts").Handler<"EventLog.WriteChunked"> | import("../rpc/Rpc.ts").Handler<"EventLog.WriteSingle"> | import("../rpc/Rpc.ts").Handler<"EventLog.Changes">, never, Storage>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<never, never, RpcServer.Protocol | Storage>;
declare const PersistedEntry_base: Schema.Class<PersistedEntry, Schema.Struct<{
    readonly entryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
    readonly iv: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    readonly encryptedEntry: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>, {}>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare class PersistedEntry extends PersistedEntry_base {
    /**
     * @since 4.0.0
     */
    get entryIdString(): string;
}
declare const Storage_base: Context.ServiceClass<Storage, "effect/eventlog/EventLogServer/Storage", {
    readonly getId: Effect.Effect<RemoteId>;
    readonly getOrCreateSessionAuthBinding: (publicKey: string, signingPublicKey: Uint8Array<ArrayBuffer>) => Effect.Effect<Uint8Array<ArrayBuffer>>;
    readonly write: (publicKey: string, storeId: StoreId, entries: ReadonlyArray<PersistedEntry>) => Effect.Effect<ReadonlyArray<EncryptedRemoteEntry>>;
    readonly changes: (publicKey: string, storeId: StoreId, startSequence: number) => Stream.Stream<EncryptedRemoteEntry>;
}>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare class Storage extends Storage_base {
}
/**
 * @since 4.0.0
 * @category storage
 */
export declare const makeStorageMemory: Effect.Effect<Storage["Service"], never, Scope.Scope>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare const layerStorageMemory: Layer.Layer<Storage>;
export {};
//# sourceMappingURL=EventLogServerEncrypted.d.ts.map