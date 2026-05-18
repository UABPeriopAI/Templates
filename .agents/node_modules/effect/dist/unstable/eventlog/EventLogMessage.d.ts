/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import type { Brand } from "../../Brand.ts";
import * as Schema from "../../Schema.ts";
import * as Msgpack from "../encoding/Msgpack.ts";
import * as Rpc from "../rpc/Rpc.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import * as RpcMiddleware from "../rpc/RpcMiddleware.ts";
import * as Transferable from "../workers/Transferable.ts";
import { Entry, RemoteEntry } from "./EventJournal.ts";
import type { Identity } from "./EventLog.ts";
/**
 * @since 4.0.0
 * @category StoreId
 */
export type StoreIdTypeId = "effect/eventlog/EventLog/StoreId";
/**
 * @since 4.0.0
 * @category StoreId
 */
export declare const StoreIdTypeId: StoreIdTypeId;
/**
 * @since 4.0.0
 * @category StoreId
 */
export type StoreId = string & Brand<StoreIdTypeId>;
/**
 * @since 4.0.0
 * @category StoreId
 */
export declare const StoreId: Schema.brand<Schema.String, "effect/eventlog/EventLog/StoreId">;
declare const EventLogProtocolError_base: Schema.Class<EventLogProtocolError, Schema.TaggedStruct<"EventLogProtocolError", {
    readonly requestTag: Schema.String;
    readonly publicKey: Schema.optional<Schema.String>;
    readonly storeId: Schema.optional<Schema.brand<Schema.String, "effect/eventlog/EventLog/StoreId">>;
    readonly code: Schema.Literals<readonly ["Unauthorized", "Forbidden", "NotFound", "InvalidRequest", "InternalServerError"]>;
    readonly message: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class EventLogProtocolError extends EventLogProtocolError_base {
}
declare const EventLogAuthentication_base: RpcMiddleware.ServiceClass<EventLogAuthentication, "effect/eventlog/EventLogMessage/EventLogAuthentication", Identity, typeof EventLogProtocolError, never, never, false>;
/**
 * @since 4.0.0
 * @category Middleware
 */
export declare class EventLogAuthentication extends EventLogAuthentication_base {
}
declare const HelloResponse_base: Schema.Class<HelloResponse, Schema.Struct<{
    readonly remoteId: Schema.brand<Schema.Uint8Array, "effect/eventlog/EventJournal/RemoteId">;
    readonly challenge: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class HelloResponse extends HelloResponse_base {
}
declare const HelloRpc_base: Rpc.Rpc<"EventLog.Hello", Schema.Void, typeof HelloResponse, Schema.Never, never, never>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class HelloRpc extends HelloRpc_base {
}
declare const Authenticate_base: Schema.Class<Authenticate, Schema.Struct<{
    readonly publicKey: Schema.String;
    readonly signingPublicKey: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    readonly signature: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    readonly algorithm: Schema.Literal<"Ed25519">;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class Authenticate extends Authenticate_base {
}
declare const AuthenticateRpc_base: Rpc.Rpc<"EventLog.Authenticate", typeof Authenticate, Schema.Void, typeof EventLogProtocolError, never, never>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class AuthenticateRpc extends AuthenticateRpc_base {
}
declare const SingleMessage_base: Schema.Class<SingleMessage, Schema.TaggedStruct<"Single", {
    readonly data: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class SingleMessage extends SingleMessage_base {
}
declare const ChunkedMessage_base: Schema.Class<ChunkedMessage, Schema.TaggedStruct<"Chunked", {
    readonly id: Schema.Number;
    readonly part: Schema.Tuple<readonly [Schema.Number, Schema.Number]>;
    readonly data: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ChunkedMessage extends ChunkedMessage_base {
    static chunkSize: number;
    static initialJoinState(): Map<number, {
        readonly parts: Array<Uint8Array>;
        count: number;
        bytes: number;
    }>;
    /**
     * @since 4.0.0
     */
    static split(id: number, data: Uint8Array): NonEmptyReadonlyArray<ChunkedMessage>;
    /**
     * @since 4.0.0
     */
    static join(map: Map<number, {
        readonly parts: Array<Uint8Array>;
        count: number;
        bytes: number;
    }>, part: ChunkedMessage): Uint8Array<ArrayBuffer> | undefined;
}
declare const WriteChunkedRpc_base: Rpc.Rpc<"EventLog.WriteChunked", typeof ChunkedMessage, Schema.Void, typeof EventLogProtocolError, typeof EventLogAuthentication, never>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class WriteChunkedRpc extends WriteChunkedRpc_base {
}
declare const WriteEntries_base: Schema.Class<WriteEntries, Schema.Struct<{
    readonly publicKey: Schema.String;
    readonly storeId: Schema.brand<Schema.String, "effect/eventlog/EventLog/StoreId">;
    readonly iv: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    readonly encryptedEntries: Schema.$Array<Schema.Struct<{
        readonly entryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    }>>;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class WriteEntries extends WriteEntries_base {
    static FromMsgpack: Msgpack.schema<typeof WriteEntries>;
    static encode: (input: WriteEntries, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
    static decode: (input: Uint8Array<ArrayBuffer>, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<WriteEntries, Schema.SchemaError, never>;
    get encoded(): import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
}
declare const WriteEntriesUnencrypted_base: Schema.Class<WriteEntriesUnencrypted, Schema.Struct<{
    readonly publicKey: Schema.String;
    readonly storeId: Schema.brand<Schema.String, "effect/eventlog/EventLog/StoreId">;
    readonly entries: Schema.$Array<typeof Entry>;
}>, {}>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class WriteEntriesUnencrypted extends WriteEntriesUnencrypted_base {
    static FromMsgpack: Msgpack.schema<typeof WriteEntriesUnencrypted>;
    static encode: (input: WriteEntriesUnencrypted, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
    static decode: (input: Uint8Array<ArrayBuffer>, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<WriteEntriesUnencrypted, Schema.SchemaError, never>;
    get encoded(): import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
}
declare const WriteSingleRpc_base: Rpc.Rpc<"EventLog.WriteSingle", Schema.Struct<{
    data: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
}>, Schema.Void, typeof EventLogProtocolError, typeof EventLogAuthentication, never>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class WriteSingleRpc extends WriteSingleRpc_base {
}
declare const ChangesRpc_base: Rpc.Rpc<"EventLog.Changes", Schema.Struct<{
    publicKey: Schema.String;
    storeId: Schema.brand<Schema.String, "effect/eventlog/EventLog/StoreId">;
    startSequence: Schema.Number;
}>, import("../rpc/RpcSchema.ts").Stream<Schema.Union<readonly [typeof SingleMessage, typeof ChunkedMessage]>, typeof EventLogProtocolError>, Schema.Never, typeof EventLogAuthentication, never>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class ChangesRpc extends ChangesRpc_base {
    static EncryptedFromMsgpack: Msgpack.schema<Schema.NonEmptyArray<Schema.Struct<{
        readonly sequence: Schema.Number;
        readonly iv: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
        readonly entryId: Schema.brand<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>, "effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Transferable.Transferable<Schema.instanceOf<Uint8Array<ArrayBuffer>, Uint8Array<ArrayBuffer>>>;
    }>>>;
    static UnencryptedFromMsgpack: Msgpack.schema<Schema.NonEmptyArray<typeof RemoteEntry>>;
    static encodeEncrypted: (input: readonly [{
        readonly sequence: number;
        readonly entryId: Uint8Array<ArrayBuffer> & Brand<"effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Uint8Array<ArrayBuffer>;
        readonly iv: Uint8Array<ArrayBuffer>;
    }, ...{
        readonly sequence: number;
        readonly entryId: Uint8Array<ArrayBuffer> & Brand<"effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Uint8Array<ArrayBuffer>;
        readonly iv: Uint8Array<ArrayBuffer>;
    }[]], options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
    static decodeEncrypted: (input: Uint8Array<ArrayBuffer>, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<readonly [{
        readonly sequence: number;
        readonly entryId: Uint8Array<ArrayBuffer> & Brand<"effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Uint8Array<ArrayBuffer>;
        readonly iv: Uint8Array<ArrayBuffer>;
    }, ...{
        readonly sequence: number;
        readonly entryId: Uint8Array<ArrayBuffer> & Brand<"effect/eventlog/EventJournal/EntryId">;
        readonly encryptedEntry: Uint8Array<ArrayBuffer>;
        readonly iv: Uint8Array<ArrayBuffer>;
    }[]], Schema.SchemaError, never>;
    static encodeUnencrypted: (input: readonly [RemoteEntry, ...RemoteEntry[]], options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<Uint8Array<ArrayBuffer>, Schema.SchemaError, never>;
    static decodeUnencrypted: (input: Uint8Array<ArrayBuffer>, options?: import("../../SchemaAST.ts").ParseOptions) => import("../../Effect.ts").Effect<readonly [RemoteEntry, ...RemoteEntry[]], Schema.SchemaError, never>;
}
declare const EventLogRemoteRpcs_base: RpcGroup.RpcGroup<typeof HelloRpc | typeof AuthenticateRpc | typeof WriteChunkedRpc | typeof WriteSingleRpc | typeof ChangesRpc>;
/**
 * @since 4.0.0
 * @category protocol
 */
export declare class EventLogRemoteRpcs extends EventLogRemoteRpcs_base {
}
export {};
//# sourceMappingURL=EventLogMessage.d.ts.map