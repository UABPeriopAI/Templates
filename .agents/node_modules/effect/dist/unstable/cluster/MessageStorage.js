/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import { Clock } from "../../Clock.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import { constFalse, identity } from "../../Function.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Schema from "../../Schema.js";
import { EntityNotAssignedToRunner, MalformedMessage } from "./ClusterError.js";
import * as DeliverAt from "./DeliverAt.js";
import * as Envelope from "./Envelope.js";
import * as Message from "./Message.js";
import * as Reply from "./Reply.js";
import * as ShardId from "./ShardId.js";
import * as Snowflake from "./Snowflake.js";
/**
 * @since 4.0.0
 * @category context
 */
export class MessageStorage extends /*#__PURE__*/Context.Service()("effect/cluster/MessageStorage") {}
/**
 * @since 4.0.0
 * @category SaveResult
 */
export const SaveResult = /*#__PURE__*/Data.taggedEnum();
/**
 * @since 4.0.0
 * @category SaveResult
 */
export const SaveResultEncoded = /*#__PURE__*/Data.taggedEnum();
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = storage => Effect.sync(() => {
  const replyHandlers = new Map();
  const replyHandlersShard = new Map();
  return MessageStorage.of({
    ...storage,
    registerReplyHandler: message => {
      const requestId = message.envelope.requestId;
      return Effect.callback(resume => {
        const shardId = message.envelope.address.shardId.toString();
        let handlers = replyHandlers.get(requestId);
        if (handlers === undefined) {
          handlers = [];
          replyHandlers.set(requestId, handlers);
        }
        let shardSet = replyHandlersShard.get(shardId);
        if (!shardSet) {
          shardSet = new Set();
          replyHandlersShard.set(shardId, shardSet);
        }
        const entry = {
          message,
          shardSet,
          respond: message._tag === "IncomingRequest" ? message.respond : reply => message.respond(reply.reply),
          resume
        };
        handlers.push(entry);
        shardSet.add(entry);
        return Effect.sync(() => {
          const index = handlers.indexOf(entry);
          handlers.splice(index, 1);
          shardSet.delete(entry);
        });
      });
    },
    unregisterReplyHandler: requestId => Effect.sync(() => {
      const handlers = replyHandlers.get(requestId);
      if (!handlers) return;
      replyHandlers.delete(requestId);
      for (let i = 0; i < handlers.length; i++) {
        const handler = handlers[i];
        handler.shardSet.delete(handler);
        handler.resume(Effect.fail(new EntityNotAssignedToRunner({
          address: handler.message.envelope.address
        })));
      }
    }),
    unregisterShardReplyHandlers: shardId => Effect.sync(() => {
      const id = shardId.toString();
      const shardSet = replyHandlersShard.get(id);
      if (!shardSet) return;
      replyHandlersShard.delete(id);
      shardSet.forEach(handler => {
        replyHandlers.delete(handler.message.envelope.requestId);
        handler.resume(Effect.fail(new EntityNotAssignedToRunner({
          address: handler.message.envelope.address
        })));
      });
    }),
    saveReply(reply) {
      const requestId = reply.reply.requestId;
      return Effect.flatMap(storage.saveReply(reply), () => {
        const handlers = replyHandlers.get(requestId);
        if (!handlers) {
          return Effect.void;
        } else if (reply.reply._tag === "WithExit") {
          replyHandlers.delete(requestId);
          for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            handler.shardSet.delete(handler);
            handler.resume(Effect.void);
          }
        }
        return handlers.length === 1 ? handlers[0].respond(reply) : Effect.forEach(handlers, handler => handler.respond(reply));
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeEncoded = /*#__PURE__*/Effect.fnUntraced(function* (encoded) {
  const snowflakeGen = yield* Snowflake.Generator;
  const clock = yield* Clock;
  const storage = yield* make({
    saveRequest: message => Message.serializeEnvelope(message).pipe(Effect.flatMap(envelope => encoded.saveEnvelope({
      envelope,
      primaryKey: Envelope.primaryKey(message.envelope),
      deliverAt: DeliverAt.toMillis(message.envelope.payload)
    })), Effect.flatMap(result => {
      if (result._tag === "Success" || Option.isNone(result.lastReceivedReply)) {
        return Effect.succeed(result);
      }
      const duplicate = result;
      const schema = Reply.Reply(message.rpc);
      return Schema.decodeEffect(schema)(result.lastReceivedReply.value).pipe(Effect.provideContext(message.context), MalformedMessage.refail, Effect.map(reply => SaveResult.Duplicate({
        originalId: duplicate.originalId,
        lastReceivedReply: Option.some(reply)
      })));
    })),
    saveEnvelope: message => Message.serializeEnvelope(message).pipe(Effect.flatMap(envelope => encoded.saveEnvelope({
      envelope,
      primaryKey: null,
      deliverAt: null
    })), Effect.asVoid),
    saveReply: reply => Effect.flatMap(Reply.serialize(reply), encoded.saveReply),
    clearReplies: encoded.clearReplies,
    repliesFor: Effect.fnUntraced(function* (messages) {
      const requestIds = Arr.empty();
      const map = new Map();
      for (const message of messages) {
        const id = String(message.envelope.requestId);
        requestIds.push(id);
        map.set(id, message);
      }
      if (!Arr.isArrayNonEmpty(requestIds)) return [];
      const encodedReplies = yield* encoded.repliesFor(requestIds);
      return yield* decodeReplies(map, encodedReplies);
    }),
    repliesForUnfiltered: ids => {
      const arr = Array.from(ids, String);
      if (!Arr.isArrayNonEmpty(arr)) return Effect.succeed([]);
      return encoded.repliesForUnfiltered(arr);
    },
    requestIdForPrimaryKey(options) {
      const primaryKey = Envelope.primaryKeyByAddress(options);
      return encoded.requestIdForPrimaryKey(primaryKey);
    },
    unprocessedMessages(shardIds) {
      const storage = this;
      const shards = Array.from(shardIds, id => id.toString());
      if (!Arr.isArrayNonEmpty(shards)) return Effect.succeed([]);
      return Effect.flatMap(Effect.suspend(() => encoded.unprocessedMessages(shards, clock.currentTimeMillisUnsafe())), messages => decodeMessages(storage, messages));
    },
    unprocessedMessagesById(messageIds) {
      const storage = this;
      const ids = Array.from(messageIds);
      if (!Arr.isArrayNonEmpty(ids)) return Effect.succeed([]);
      return Effect.flatMap(Effect.suspend(() => encoded.unprocessedMessagesById(ids, clock.currentTimeMillisUnsafe())), messages => decodeMessages(storage, messages));
    },
    resetAddress: encoded.resetAddress,
    clearAddress: encoded.clearAddress,
    resetShards: shardIds => {
      const shards = Array.from(shardIds, id => id.toString());
      if (!Arr.isArrayNonEmpty(shards)) return Effect.void;
      return encoded.resetShards(shards);
    },
    withTransaction: encoded.withTransaction
  });
  const decodeMessages = (storage, envelopes) => {
    const messages = [];
    let index = 0;
    // if we have a malformed message, we should not return it and update
    // the storage with a defect
    const decodeMessage = Effect.catch(Effect.suspend(() => {
      const envelope = envelopes[index];
      if (!envelope) return Effect.undefined;
      return decodeEnvelopeWithReply(envelope);
    }), error => {
      const envelope = envelopes[index];
      return storage.saveReply(Reply.ReplyWithContext.fromDefect({
        id: snowflakeGen.nextUnsafe(),
        requestId: Snowflake.Snowflake(envelope.envelope.requestId),
        defect: error.toString()
      })).pipe(Effect.forkDetach, Effect.asVoid);
    });
    return Effect.as(Effect.whileLoop({
      while: () => index < envelopes.length,
      body: () => decodeMessage,
      step: message => {
        const envelope = envelopes[index++];
        if (!message) return;
        messages.push(message.envelope._tag === "Request" ? new Message.IncomingRequest({
          envelope: message.envelope,
          lastSentReply: envelope.lastSentReply,
          respond: storage.saveReply
        }) : new Message.IncomingEnvelope({
          envelope: message.envelope
        }));
      }
    }), messages);
  };
  const decodeReplies = (messages, encodedReplies) => {
    const replies = [];
    const ignoredRequests = new Set();
    let index = 0;
    const decodeReply = Effect.catch(Effect.suspend(() => {
      const reply = encodedReplies[index];
      if (ignoredRequests.has(reply.requestId)) return Effect.void;
      const message = messages.get(reply.requestId);
      if (!message) return Effect.void;
      const schema = Reply.Reply(message.rpc);
      return Schema.decodeEffect(schema)(reply).pipe(Effect.provideContext(message.context));
    }), error => {
      const reply = encodedReplies[index];
      ignoredRequests.add(reply.requestId);
      return Effect.succeed(new Reply.WithExit({
        id: snowflakeGen.nextUnsafe(),
        requestId: Snowflake.Snowflake(reply.requestId),
        exit: Exit.die(error)
      }));
    });
    return Effect.as(Effect.whileLoop({
      while: () => index < encodedReplies.length,
      body: () => decodeReply,
      step: reply => {
        index++;
        if (reply) replies.push(reply);
      }
    }), replies);
  };
  return storage;
});
/**
 * @since 4.0.0
 * @category Constructors
 */
export const noop = /*#__PURE__*/Effect.runSync(/*#__PURE__*/make({
  saveRequest: () => Effect.succeed(SaveResult.Success()),
  saveEnvelope: () => Effect.void,
  saveReply: () => Effect.void,
  clearReplies: () => Effect.void,
  repliesFor: () => Effect.succeed([]),
  repliesForUnfiltered: () => Effect.succeed([]),
  requestIdForPrimaryKey: () => Effect.succeedNone,
  unprocessedMessages: () => Effect.succeed([]),
  unprocessedMessagesById: () => Effect.succeed([]),
  resetAddress: () => Effect.void,
  clearAddress: () => Effect.void,
  resetShards: () => Effect.void,
  withTransaction: identity
}));
/**
 * Can be used in tests to simulate a transaction.
 *
 * @since 4.0.0
 * @category Memory
 */
export const MemoryTransaction = /*#__PURE__*/Context.Reference("effect/cluster/MessageStorage/MemoryTransaction", {
  defaultValue: constFalse
});
/**
 * @since 4.0.0
 * @category Memory
 */
export class MemoryDriver extends /*#__PURE__*/Context.Service()("effect/cluster/MessageStorage/MemoryDriver", {
  make: /*#__PURE__*/Effect.gen(function* () {
    const clock = yield* Clock;
    const requests = new Map();
    const requestsByPrimaryKey = new Map();
    const unprocessed = new Set();
    const replyIds = new Set();
    const journal = [];
    const cursors = new WeakMap();
    const unprocessedWith = predicate => {
      const messages = [];
      const now = clock.currentTimeMillisUnsafe();
      for (const envelope of unprocessed) {
        if (!predicate(envelope)) {
          continue;
        }
        if (envelope._tag === "Request") {
          const entry = requests.get(envelope.requestId);
          if (entry?.deliverAt && entry.deliverAt > now) {
            continue;
          }
          messages.push({
            envelope,
            lastSentReply: Option.fromNullishOr(entry?.replies[entry.replies.length - 1])
          });
        } else {
          messages.push({
            envelope,
            lastSentReply: Option.none()
          });
        }
      }
      return messages;
    };
    const replyLatch = yield* Latch.make();
    function repliesFor(requestIds) {
      const replies = Arr.empty();
      for (const requestId of requestIds) {
        const request = requests.get(requestId);
        if (!request) continue;else if (request.lastReceivedChunk === undefined) {
          replies.push(...request.replies);
          continue;
        }
        const sequence = request.lastReceivedChunk.sequence;
        for (const reply of request.replies) {
          if (reply._tag === "Chunk" && reply.sequence <= sequence) {
            continue;
          }
          replies.push(reply);
        }
      }
      return replies;
    }
    const encoded = {
      saveEnvelope: ({
        deliverAt,
        envelope: envelope_,
        primaryKey
      }) => Effect.sync(() => {
        const envelope = JSON.parse(JSON.stringify(envelope_));
        const existing = primaryKey ? requestsByPrimaryKey.get(primaryKey) : envelope._tag === "Request" && requests.get(envelope.requestId);
        if (existing) {
          return SaveResultEncoded.Duplicate({
            originalId: Snowflake.Snowflake(existing.envelope.requestId),
            lastReceivedReply: Option.fromNullishOr(existing.replies.length === 1 && existing.replies[0]._tag === "WithExit" ? existing.replies[0] : existing.lastReceivedChunk)
          });
        }
        if (envelope._tag === "Request") {
          const entry = {
            envelope,
            replies: [],
            lastReceivedChunk: undefined,
            deliverAt
          };
          requests.set(envelope.requestId, entry);
          if (primaryKey) {
            requestsByPrimaryKey.set(primaryKey, entry);
          }
        } else if (envelope._tag === "AckChunk") {
          const entry = requests.get(envelope.requestId);
          if (entry) {
            entry.lastReceivedChunk = entry.replies.find(r => r._tag === "Chunk" && r.id === envelope.replyId) ?? entry.lastReceivedChunk;
          }
        }
        unprocessed.add(envelope);
        journal.push(envelope);
        return SaveResultEncoded.Success();
      }),
      saveReply: reply_ => Effect.sync(() => {
        const reply = JSON.parse(JSON.stringify(reply_));
        const entry = requests.get(reply.requestId);
        if (!entry || replyIds.has(reply.id)) return;
        if (reply._tag === "WithExit") {
          unprocessed.delete(entry.envelope);
        }
        entry.replies.push(reply);
        replyIds.add(reply.id);
        replyLatch.openUnsafe();
      }),
      clearReplies: id => Effect.sync(() => {
        const entry = requests.get(String(id));
        if (!entry) return;
        entry.replies = [];
        entry.lastReceivedChunk = undefined;
        unprocessed.add(entry.envelope);
      }),
      requestIdForPrimaryKey: primaryKey => Effect.sync(() => {
        const entry = requestsByPrimaryKey.get(primaryKey);
        return Option.map(Option.fromNullishOr(entry?.envelope.requestId), Snowflake.Snowflake);
      }),
      repliesFor: requestIds => Effect.sync(() => repliesFor(requestIds)),
      repliesForUnfiltered: requestIds => Effect.sync(() => requestIds.flatMap(id => requests.get(String(id))?.replies ?? [])),
      unprocessedMessages: shardIds => Effect.sync(() => {
        if (unprocessed.size === 0) return [];
        const now = clock.currentTimeMillisUnsafe();
        const messages = Arr.empty();
        for (let index = 0; index < journal.length; index++) {
          const envelope = journal[index];
          const shardId = ShardId.make(envelope.address.shardId.group, envelope.address.shardId.id);
          if (!unprocessed.has(envelope) || !shardIds.includes(shardId.toString())) {
            continue;
          }
          if (envelope._tag === "Request") {
            const entry = requests.get(envelope.requestId);
            if (entry.deliverAt && entry.deliverAt > now) {
              continue;
            }
            messages.push({
              envelope,
              lastSentReply: Option.fromNullishOr(entry.replies[entry.replies.length - 1])
            });
          } else {
            messages.push({
              envelope,
              lastSentReply: Option.none()
            });
            unprocessed.delete(envelope);
          }
        }
        return messages;
      }),
      unprocessedMessagesById: ids => Effect.sync(() => {
        const envelopeIds = new Set();
        for (const id of ids) {
          envelopeIds.add(String(id));
        }
        return unprocessedWith(envelope => envelopeIds.has(envelope.requestId));
      }),
      resetAddress: () => Effect.void,
      clearAddress: address => Effect.sync(() => {
        for (let i = journal.length - 1; i >= 0; i--) {
          const envelope = journal[i];
          const sameAddress = address.entityType === envelope.address.entityType && address.entityId === envelope.address.entityId;
          if (!sameAddress || envelope._tag !== "Request") {
            continue;
          }
          unprocessed.delete(envelope);
          requests.delete(envelope.requestId);
          journal.splice(i, 1);
        }
      }),
      resetShards: () => Effect.void,
      withTransaction: Effect.provideService(MemoryTransaction, true)
    };
    const storage = yield* makeEncoded(encoded);
    return {
      storage,
      encoded,
      requests,
      requestsByPrimaryKey,
      unprocessed,
      replyIds,
      journal,
      cursors
    };
  })
}) {
  /**
   * @since 4.0.0
   */
  static layer = /*#__PURE__*/Layer.effect(this)(this.make).pipe(/*#__PURE__*/Layer.provide(Snowflake.layerGenerator));
}
/**
 * @since 4.0.0
 * @category layers
 */
export const layerNoop = /*#__PURE__*/Layer.succeed(MessageStorage, noop);
/**
 * @since 4.0.0
 * @category layers
 */
export const layerMemory = /*#__PURE__*/Layer.effect(MessageStorage, Effect.map(MemoryDriver.asEffect(), _ => _.storage)).pipe(/*#__PURE__*/Layer.provideMerge(MemoryDriver.layer));
// --- internal ---
const EnvelopeWithReply = /*#__PURE__*/Schema.Struct({
  envelope: /*#__PURE__*/Schema.toCodecJson(Envelope.Partial),
  lastSentReply: /*#__PURE__*/Schema.Option(Reply.Encoded)
});
const decodeEnvelopeWithReply = /*#__PURE__*/Schema.decodeEffect(EnvelopeWithReply);
//# sourceMappingURL=MessageStorage.js.map