/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as PubSub from "../../PubSub.js";
import * as RcMap from "../../RcMap.js";
import * as Redacted from "../../Redacted.js";
import * as Schema from "../../Schema.js";
import * as Semaphore from "../../Semaphore.js";
import * as Stream from "../../Stream.js";
import * as RpcServer from "../rpc/RpcServer.js";
import * as EventJournal from "./EventJournal.js";
import { Entry, makeEntryIdUnsafe, makeRemoteIdUnsafe, RemoteEntry } from "./EventJournal.js";
import * as EventLog from "./EventLog.js";
import { ChangesRpc, EventLogProtocolError, EventLogRemoteRpcs, WriteEntriesUnencrypted } from "./EventLogMessage.js";
import * as EventLogServer from "./EventLogServer.js";
/**
 * @since 4.0.0
 * @category EventLogServerUnencrypted
 */
export class EventLogServerUnencrypted extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogServerUnencrypted") {}
/**
 * @since 4.0.0
 * @category EventLogServerUnencrypted
 */
export const makeWrite = schema => EventLogServerUnencrypted.useSync(_ => _.makeWrite(schema));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerRpcHandlers = /*#__PURE__*/Layer.unwrap(/*#__PURE__*/Effect.gen(function* () {
  const storage = yield* Storage;
  const mapping = yield* StoreMapping;
  const auth = yield* EventLogServerAuthorization;
  const registry = yield* EventLog.Registry;
  const handler = yield* makeServerHandler;
  const remoteId = yield* storage.getId;
  const processEntries = Effect.fnUntraced(function* (options) {
    const entries = Arr.sort(options.entries, Entry.Order);
    let history = yield* storage.entriesAfter(options.storeId, entries[0]);
    const persistedEntries = Arr.empty();
    for (const entry of entries) {
      const [duplicate, conflicts, newHistory] = toConflicts(history, entry);
      if (duplicate) continue;
      history = newHistory;
      yield* handler({
        publicKey: options.publicKey,
        storeId: options.storeId,
        entry,
        conflicts
      });
      persistedEntries.push(entry);
    }
    yield* storage.write(options.storeId, persistedEntries);
  }, storage.withTransaction);
  return EventLogServer.layerRpcHandlers({
    remoteId,
    getOrCreateSessionAuthBinding: (publicKey, signingPublicKey) => storage.getOrCreateSessionAuthBinding(publicKey, signingPublicKey),
    onWrite: Effect.fnUntraced(function* (data) {
      const request = yield* WriteEntriesUnencrypted.decode(data).pipe(Effect.mapError(_ => new EventLogProtocolError({
        requestTag: "WriteEntries",
        publicKey: undefined,
        code: "InternalServerError",
        message: "Decoding failure"
      })));
      if (!Arr.isReadonlyArrayNonEmpty(request.entries)) return;
      const resolvedStoreId = yield* mapping.resolve({
        publicKey: request.publicKey,
        storeId: request.storeId
      }).pipe(Effect.mapError(_ => new EventLogProtocolError({
        requestTag: "WriteEntries",
        publicKey: request.publicKey,
        storeId: request.storeId,
        code: "Unauthorized",
        message: _.message
      })));
      yield* auth.authorizeWrite({
        publicKey: request.publicKey,
        storeId: resolvedStoreId,
        entries: request.entries
      }).pipe(Effect.mapError(_ => new EventLogProtocolError({
        requestTag: "WriteEntries",
        publicKey: request.publicKey,
        storeId: request.storeId,
        code: "Unauthorized",
        message: _.message
      })));
      yield* processEntries({
        publicKey: request.publicKey,
        storeId: resolvedStoreId,
        entries: request.entries
      }).pipe(Effect.catchCause(_ => Effect.fail(new EventLogProtocolError({
        requestTag: "WriteEntries",
        publicKey: request.publicKey,
        code: "InternalServerError",
        message: "Persistence failure"
      }))), Effect.provideService(EventLog.Identity, makeClientIdentity(request.publicKey)));
    }),
    changes: Effect.fnUntraced(function* (request) {
      const storeId = yield* mapping.resolve({
        publicKey: request.publicKey,
        storeId: request.storeId
      });
      yield* auth.authorizeRead({
        publicKey: request.publicKey,
        storeId
      });
      return storage.changes({
        storeId,
        startSequence: request.startSequence,
        compactors: registry.compactors
      }).pipe(Stream.mapArrayEffect(entries => Effect.map(ChangesRpc.encodeUnencrypted(entries), Arr.of)));
    }, Stream.unwrap)
  });
}));
/**
 * @since 4.0.0
 * @category errors
 */
export class EventLogServerStoreError extends /*#__PURE__*/Data.TaggedError("EventLogServerStoreError") {}
/**
 * @since 4.0.0
 * @category errors
 */
export class EventLogServerAuthError extends /*#__PURE__*/Data.TaggedError("EventLogServerAuthError") {}
/**
 * @since 4.0.0
 * @category context
 */
export class EventLogServerAuthorization extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogServerUnencrypted/EventLogServerAuthorization") {}
/**
 * @since 4.0.0
 * @category context
 */
export class StoreMapping extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogServerUnencrypted/StoreMapping") {}
const toStoreNotFoundError = options => new EventLogServerStoreError({
  reason: "NotFound",
  publicKey: options.publicKey,
  storeId: options.storeId,
  message: options.publicKey === undefined ? `No provisioned store found for store id: ${options.storeId}` : `No provisioned store found for public key: ${options.publicKey} and store id: ${options.storeId}`
});
/**
 * @since 4.0.0
 * @category store
 */
export const layerStoreMappingStatic = options => Layer.succeed(StoreMapping, {
  resolve(request) {
    if (request.storeId === options.storeId) {
      return Effect.succeed(options.storeId);
    }
    return Effect.fail(toStoreNotFoundError(request));
  },
  hasStore: ({
    storeId
  }) => Effect.succeed(storeId === options.storeId)
});
/**
 * @since 4.0.0
 * @category storage
 */
export class Storage extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogServerUnencrypted/Storage") {}
const makeClientIdentity = publicKey => ({
  publicKey,
  privateKey: constEmptyPrivateKey
});
const constEmptyPrivateKey = /*#__PURE__*/Redacted.make(/*#__PURE__*/new Uint8Array(32));
const makeServerWriteIdentityPublicKey = storeId => `effect-eventlog-server-write:${storeId}`;
const entriesAfter = (journal, startSequence) => journal.filter(entry => entry.remoteSequence >= startSequence);
const toConflicts = (history, originEntry) => {
  let duplicate = false;
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (entry.createdAtMillis < originEntry.createdAtMillis) {
      continue;
    } else if (entry.idString === originEntry.idString) {
      duplicate = true;
      continue;
    }
    const newHistory = history.slice(i);
    let conflicts = [];
    for (let j = 0; j < newHistory.length; j++) {
      const scannedEntry = history[j];
      if (scannedEntry.event === originEntry.event && scannedEntry.primaryKey === originEntry.primaryKey) {
        conflicts.push(scannedEntry);
      }
    }
    return [duplicate, conflicts, newHistory];
  }
  return [duplicate, [], []];
};
const representativeSequences = options => {
  if (options.compactedCount === 0) {
    return [];
  }
  if (options.compactedCount > options.remoteEntries.length) {
    return undefined;
  }
  const maxSequence = options.remoteEntries[options.remoteEntries.length - 1].remoteSequence;
  if (options.compactedCount === 1) {
    return [maxSequence];
  }
  const selected = options.remoteEntries.slice(0, options.compactedCount - 1).map(entry => entry.remoteSequence);
  selected.push(maxSequence);
  for (let i = 1; i < selected.length; i++) {
    if (selected[i] <= selected[i - 1]) {
      return undefined;
    }
  }
  return selected;
};
const toCompactedRemoteEntries = options => {
  const sequences = representativeSequences({
    remoteEntries: options.remoteEntries,
    compactedCount: options.compacted.length
  });
  if (sequences === undefined) {
    return undefined;
  }
  return options.compacted.map((entry, index) => new RemoteEntry({
    remoteSequence: sequences[index],
    entry
  }, {
    disableChecks: true
  }));
};
/**
 * @since 4.0.0
 * @category compaction
 */
export const compactBacklog = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  if (options.compactors.size === 0 || options.remoteEntries.length === 0) {
    return options.remoteEntries;
  }
  const compactedRemoteEntries = [];
  let index = 0;
  while (index < options.remoteEntries.length) {
    const remoteEntry = options.remoteEntries[index];
    const compactor = options.compactors.get(remoteEntry.entry.event);
    if (compactor === undefined) {
      compactedRemoteEntries.push(remoteEntry);
      index++;
      continue;
    }
    const entries = [remoteEntry.entry];
    const remoteGroup = [remoteEntry];
    const compacted = [];
    index++;
    while (index < options.remoteEntries.length) {
      const nextRemoteEntry = options.remoteEntries[index];
      const nextCompactor = options.compactors.get(nextRemoteEntry.entry.event);
      if (nextCompactor !== compactor) {
        break;
      }
      entries.push(nextRemoteEntry.entry);
      remoteGroup.push(nextRemoteEntry);
      index++;
    }
    yield* compactor.effect({
      entries,
      write(entry) {
        return Effect.sync(() => {
          compacted.push(entry);
        });
      }
    }).pipe(Effect.orDie);
    const projected = toCompactedRemoteEntries({
      compacted,
      remoteEntries: remoteGroup
    });
    if (projected === undefined) {
      compactedRemoteEntries.push(...remoteGroup);
      continue;
    }
    compactedRemoteEntries.push(...projected);
  }
  return compactedRemoteEntries;
});
/**
 * @since 4.0.0
 * @category storage
 */
export const makeStorageMemory = /*#__PURE__*/Effect.gen(function* () {
  const knownIds = new Map();
  const journals = new Map();
  const sessionAuthBindings = new Map();
  const remoteId = makeRemoteIdUnsafe();
  const ensureKnownIds = storeId => {
    let storeKnownIds = knownIds.get(storeId);
    if (storeKnownIds) return storeKnownIds;
    storeKnownIds = new Map();
    knownIds.set(storeId, storeKnownIds);
    return storeKnownIds;
  };
  const ensureJournal = storeId => {
    let journal = journals.get(storeId);
    if (journal) return journal;
    journal = [];
    journals.set(storeId, journal);
    return journal;
  };
  const pubsubs = yield* RcMap.make({
    lookup: _storeId => Effect.acquireRelease(PubSub.unbounded(), PubSub.shutdown),
    idleTimeToLive: 60000
  });
  const write = Effect.fnUntraced(function* (storeId, entries) {
    const sequenceNumbers = [];
    const committed = [];
    const storeKnownIds = ensureKnownIds(storeId);
    const journal = ensureJournal(storeId);
    let lastSequenceNumber = Arr.last(journal).pipe(Option.map(entry => entry.remoteSequence), Option.getOrElse(() => 0));
    if (entries.some(entry => storeKnownIds.has(entry.idString))) {
      return yield* Effect.die("Duplicate entries");
    }
    for (const entry of entries) {
      const remoteEntry = new RemoteEntry({
        remoteSequence: ++lastSequenceNumber,
        entry
      }, {
        disableChecks: true
      });
      sequenceNumbers.push(remoteEntry.remoteSequence);
      committed.push(remoteEntry);
      journal.push(remoteEntry);
      storeKnownIds.set(entry.idString, remoteEntry.remoteSequence);
    }
    const pubsub = yield* RcMap.get(pubsubs, storeId);
    yield* PubSub.publishAll(pubsub, committed);
    return committed;
  }, Effect.scoped);
  const transactionSemaphore = yield* Semaphore.make(1);
  return Storage.of({
    getId: Effect.succeed(remoteId),
    getOrCreateSessionAuthBinding: (publicKey, signingPublicKey) => Effect.sync(() => {
      const existing = sessionAuthBindings.get(publicKey);
      if (existing) return existing;
      sessionAuthBindings.set(publicKey, signingPublicKey);
      return signingPublicKey;
    }),
    entriesAfter: (storeId, entry) => Effect.sync(() => {
      const journal = ensureJournal(storeId);
      return journal.filter(e => Entry.Order(e.entry, entry) >= 0).map(e => e.entry);
    }),
    write,
    changes: Effect.fnUntraced(function* ({
      storeId,
      startSequence,
      compactors
    }) {
      const pubsub = yield* RcMap.get(pubsubs, storeId);
      const subscription = yield* PubSub.subscribe(pubsub);
      const backlog = yield* compactBacklog({
        remoteEntries: entriesAfter(ensureJournal(storeId), startSequence),
        compactors
      });
      const replayedUpTo = backlog.length > 0 ? backlog[backlog.length - 1].remoteSequence : startSequence - 1;
      return Stream.fromArray(backlog).pipe(Stream.concat(Stream.fromSubscription(subscription).pipe(Stream.filter(entry => entry.remoteSequence > replayedUpTo))));
    }, Stream.unwrap),
    withTransaction: transactionSemaphore.withPermits(1)
  });
});
/**
 * @since 4.0.0
 * @category storage
 */
export const layerStorageMemory = /*#__PURE__*/Layer.effect(Storage)(makeStorageMemory);
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Effect.gen(function* () {
  const storage = yield* Storage;
  const handler = yield* makeServerHandler;
  return EventLogServerUnencrypted.of({
    makeWrite(schema) {
      const events = new Map();
      for (const group of schema.groups) {
        for (const [tag, event] of Object.entries(group.events)) {
          events.set(tag, event);
        }
      }
      return Effect.fnUntraced(function* (options) {
        const publicKey = makeServerWriteIdentityPublicKey(options.storeId);
        const schemaEvent = events.get(options.event);
        if (schemaEvent === undefined) {
          return yield* Effect.die(`Event schema not found for: "${options.event}"`);
        }
        const entry = new EventJournal.Entry({
          id: makeEntryIdUnsafe(),
          event: options.event,
          primaryKey: schemaEvent.primaryKey(options.payload),
          payload: yield* Schema.encodeUnknownEffect(schemaEvent.payloadMsgPack)(options.payload).pipe(Effect.mapError(_ => new EventLogServerStoreError({
            reason: "PersistenceFailure",
            publicKey: publicKey,
            storeId: options.storeId,
            message: "Failed to encode event"
          })))
        }, {
          disableChecks: true
        });
        const result = yield* handler({
          publicKey,
          storeId: options.storeId,
          entry,
          conflicts: []
        }).pipe(Effect.provideService(EventLog.Identity, makeClientIdentity(publicKey)));
        yield* storage.write(options.storeId, [entry]);
        return result;
      }, storage.withTransaction);
    }
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerServer = /*#__PURE__*/Layer.effect(EventLogServerUnencrypted, make).pipe(/*#__PURE__*/Layer.provideMerge(EventLog.layerRegistry));
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = (_schema, layer) => RpcServer.layer(EventLogRemoteRpcs).pipe(Layer.provide(layerRpcHandlers), Layer.provide(layer), Layer.provide(layerServer));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerNoRpcServer = (_schema, layer) => layerRpcHandlers.pipe(Layer.merge(layer), Layer.provide(layerServer));
const makeServerHandler = /*#__PURE__*/Effect.gen(function* () {
  const registry = yield* EventLog.Registry;
  return Effect.fnUntraced(function* (options) {
    const handler = registry.handlers.get(options.entry.event);
    if (handler === undefined) {
      return yield* Effect.logDebug(`Event handler not found for: "${options.entry.event}"`);
    }
    const decodePayload = Schema.decodeUnknownEffect(handler.event.payloadMsgPack);
    const decodedConflicts = [];
    for (const conflict of options.conflicts) {
      decodedConflicts.push({
        entry: conflict,
        payload: yield* decodePayload(conflict.payload).pipe(Effect.updateContext(input => Context.merge(handler.context, input)))
      });
    }
    const payloadEffect = "payload" in options ? Effect.succeed(options.payload) : decodePayload(options.entry.payload);
    return yield* payloadEffect.pipe(Effect.mapError(_ => new EventLogServerStoreError({
      reason: "PersistenceFailure",
      publicKey: options.publicKey,
      storeId: options.storeId,
      message: "Failed to decode event"
    })), Effect.flatMap(payload => handler.handler({
      storeId: options.storeId,
      payload,
      entry: options.entry,
      conflicts: decodedConflicts
    })), Effect.updateContext(input => Context.merge(handler.context, input)));
  });
});
//# sourceMappingURL=EventLogServerUnencrypted.js.map