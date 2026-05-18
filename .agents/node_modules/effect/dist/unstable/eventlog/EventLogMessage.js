import * as Schema from "../../Schema.js";
import * as Msgpack from "../encoding/Msgpack.js";
import * as Rpc from "../rpc/Rpc.js";
import * as RpcGroup from "../rpc/RpcGroup.js";
import * as RpcMiddleware from "../rpc/RpcMiddleware.js";
import * as Transferable from "../workers/Transferable.js";
import { Entry, RemoteEntry, RemoteId } from "./EventJournal.js";
import { EncryptedEntry, EncryptedRemoteEntry } from "./EventLogEncryption.js";
/**
 * @since 4.0.0
 * @category StoreId
 */
export const StoreIdTypeId = "effect/eventlog/EventLog/StoreId";
/**
 * @since 4.0.0
 * @category StoreId
 */
export const StoreId = /*#__PURE__*/Schema.String.pipe(/*#__PURE__*/Schema.brand(StoreIdTypeId));
/**
 * @since 4.0.0
 * @category protocol
 */
export class EventLogProtocolError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/eventlog/EventLogRemote/ProtocolError")("EventLogProtocolError", {
  requestTag: Schema.String,
  publicKey: /*#__PURE__*/Schema.optional(Schema.String),
  storeId: /*#__PURE__*/Schema.optional(StoreId),
  code: /*#__PURE__*/Schema.Literals(["Unauthorized", "Forbidden", "NotFound", "InvalidRequest", "InternalServerError"]),
  message: Schema.String
}) {}
/**
 * @since 4.0.0
 * @category Middleware
 */
export class EventLogAuthentication extends /*#__PURE__*/RpcMiddleware.Service()("effect/eventlog/EventLogMessage/EventLogAuthentication", {
  error: EventLogProtocolError
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class HelloResponse extends /*#__PURE__*/Schema.Class("effect/eventlog/EventLogRemote/HelloResponse")({
  remoteId: RemoteId,
  challenge: Transferable.Uint8Array
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class HelloRpc extends /*#__PURE__*/Rpc.make("EventLog.Hello", {
  success: HelloResponse
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class Authenticate extends /*#__PURE__*/Schema.Class("effect/eventlog/EventLogRemote/Authenticate")({
  publicKey: Schema.String,
  signingPublicKey: Transferable.Uint8Array,
  signature: Transferable.Uint8Array,
  algorithm: /*#__PURE__*/Schema.Literal("Ed25519")
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class AuthenticateRpc extends /*#__PURE__*/Rpc.make("EventLog.Authenticate", {
  payload: Authenticate,
  error: EventLogProtocolError
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class SingleMessage extends /*#__PURE__*/Schema.TaggedClass("effect/eventlog/EventLogRemote/SingleMessage")("Single", {
  data: Transferable.Uint8Array
}) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ChunkedMessage extends /*#__PURE__*/Schema.TaggedClass("effect/eventlog/EventLogRemote/ChunkedMessage")("Chunked", {
  id: Schema.Number,
  part: /*#__PURE__*/Schema.Tuple([Schema.Number, Schema.Number]),
  data: Transferable.Uint8Array
}) {
  static chunkSize = 512_000;
  static initialJoinState() {
    return new Map();
  }
  /**
   * @since 4.0.0
   */
  static split(id, data) {
    const parts = Math.ceil(data.byteLength / ChunkedMessage.chunkSize);
    const result = new Array(parts);
    for (let i = 0; i < parts; i++) {
      const start = i * ChunkedMessage.chunkSize;
      const end = Math.min((i + 1) * ChunkedMessage.chunkSize, data.byteLength);
      result[i] = new ChunkedMessage({
        id,
        part: [i, parts],
        data: data.subarray(start, end)
      });
    }
    return result;
  }
  /**
   * @since 4.0.0
   */
  static join(map, part) {
    const [index, total] = part.part;
    let entry = map.get(part.id);
    if (!entry) {
      entry = {
        parts: new Array(total),
        count: 0,
        bytes: 0
      };
      map.set(part.id, entry);
    }
    entry.parts[index] = part.data;
    entry.count++;
    entry.bytes += part.data.byteLength;
    if (entry.count !== total) {
      return;
    }
    const data = new Uint8Array(entry.bytes);
    let offset = 0;
    for (const part of entry.parts) {
      data.set(part, offset);
      offset += part.byteLength;
    }
    map.delete(part.id);
    return data;
  }
}
/**
 * @since 4.0.0
 * @category protocol
 */
export class WriteChunkedRpc extends /*#__PURE__*/Rpc.make("EventLog.WriteChunked", {
  payload: ChunkedMessage,
  error: EventLogProtocolError
}).middleware(EventLogAuthentication) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class WriteEntries extends /*#__PURE__*/Schema.Class("effect/eventlog/EventLogRemote/WriteEntries")({
  publicKey: Schema.String,
  storeId: StoreId,
  iv: Transferable.Uint8Array,
  encryptedEntries: /*#__PURE__*/Schema.Array(EncryptedEntry)
}) {
  static FromMsgpack = /*#__PURE__*/Msgpack.schema(WriteEntries);
  static encode = /*#__PURE__*/Schema.encodeEffect(this.FromMsgpack);
  static decode = /*#__PURE__*/Schema.decodeEffect(this.FromMsgpack);
  get encoded() {
    return WriteEntries.encode(this);
  }
}
/**
 * @since 4.0.0
 * @category protocol
 */
export class WriteEntriesUnencrypted extends /*#__PURE__*/Schema.Class("effect/eventlog/EventLogRemote/WriteEntriesUnencrypted")({
  publicKey: Schema.String,
  storeId: StoreId,
  entries: /*#__PURE__*/Schema.Array(Entry)
}) {
  static FromMsgpack = /*#__PURE__*/Msgpack.schema(WriteEntriesUnencrypted);
  static encode = /*#__PURE__*/Schema.encodeEffect(this.FromMsgpack);
  static decode = /*#__PURE__*/Schema.decodeEffect(this.FromMsgpack);
  get encoded() {
    return WriteEntriesUnencrypted.encode(this);
  }
}
/**
 * @since 4.0.0
 * @category protocol
 */
export class WriteSingleRpc extends /*#__PURE__*/Rpc.make("EventLog.WriteSingle", {
  payload: {
    data: Transferable.Uint8Array
  },
  error: EventLogProtocolError
}).middleware(EventLogAuthentication) {}
/**
 * @since 4.0.0
 * @category protocol
 */
export class ChangesRpc extends /*#__PURE__*/Rpc.make("EventLog.Changes", {
  payload: {
    publicKey: Schema.String,
    storeId: StoreId,
    startSequence: Schema.Number
  },
  success: Schema.Union([SingleMessage, ChunkedMessage]),
  error: EventLogProtocolError,
  stream: true
}).middleware(EventLogAuthentication) {
  static EncryptedFromMsgpack = /*#__PURE__*/Msgpack.schema(/*#__PURE__*/Schema.NonEmptyArray(EncryptedRemoteEntry));
  static UnencryptedFromMsgpack = /*#__PURE__*/Msgpack.schema(/*#__PURE__*/Schema.NonEmptyArray(RemoteEntry));
  static encodeEncrypted = /*#__PURE__*/Schema.encodeEffect(ChangesRpc.EncryptedFromMsgpack);
  static decodeEncrypted = /*#__PURE__*/Schema.decodeEffect(ChangesRpc.EncryptedFromMsgpack);
  static encodeUnencrypted = /*#__PURE__*/Schema.encodeEffect(ChangesRpc.UnencryptedFromMsgpack);
  static decodeUnencrypted = /*#__PURE__*/Schema.decodeEffect(ChangesRpc.UnencryptedFromMsgpack);
}
/**
 * @since 4.0.0
 * @category protocol
 */
export class EventLogRemoteRpcs extends /*#__PURE__*/RpcGroup.make(HelloRpc, AuthenticateRpc, WriteChunkedRpc, WriteSingleRpc, ChangesRpc) {}
//# sourceMappingURL=EventLogMessage.js.map