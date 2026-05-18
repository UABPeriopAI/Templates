/**
 * @since 4.0.0
 */
import * as Uuid from "uuid";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as DateTime from "../../DateTime.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Order from "../../Order.js";
import * as PubSub from "../../PubSub.js";
import * as Schema from "../../Schema.js";
import * as Semaphore from "../../Semaphore.js";
import * as Msgpack from "../encoding/Msgpack.js";
/**
 * @since 4.0.0
 * @category context
 */
export class EventJournal extends /*#__PURE__*/Context.Service()("effect/eventlog/EventJournal") {}
const TypeId = "effect/eventlog/EventJournal/EventJournalError";
/**
 * @since 4.0.0
 * @category errors
 */
export class EventJournalError extends /*#__PURE__*/Data.TaggedError("EventJournalError") {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
}
/**
 * @since 4.0.0
 * @category remote
 */
export const RemoteIdTypeId = "effect/eventlog/EventJournal/RemoteId";
/**
 * @since 4.0.0
 * @category remote
 */
export const RemoteId = /*#__PURE__*/Schema.Uint8Array.pipe(/*#__PURE__*/Schema.brand(RemoteIdTypeId));
/**
 * @since 4.0.0
 * @category remote
 */
export const makeRemoteIdUnsafe = () => Uuid.v4({}, new globalThis.Uint8Array(16));
/**
 * @since 4.0.0
 * @category entry
 */
export const EntryIdTypeId = "effect/eventlog/EventJournal/EntryId";
/**
 * @since 4.0.0
 * @category entry
 */
export const EntryId = /*#__PURE__*/Schema.Uint8Array.pipe(/*#__PURE__*/Schema.brand(EntryIdTypeId));
/**
 * @since 4.0.0
 * @category entry
 */
export const EntryIdOrder = /*#__PURE__*/Order.make((a, b) => {
  for (let i = 0; i < 16; i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i] < 0 ? -1 : 1;
    }
  }
  return 0;
});
/**
 * @since 4.0.0
 * @category entry
 */
export const makeEntryIdUnsafe = (options = {}) => Uuid.v7(options, new globalThis.Uint8Array(16));
/**
 * @since 4.0.0
 * @category entry
 */
export const entryIdMillis = entryId => {
  const bytes = new Uint8Array(8);
  bytes.set(entryId.subarray(0, 6), 2);
  return Number(new DataView(bytes.buffer).getBigUint64(0));
};
/**
 * @since 4.0.0
 * @category entry
 */
export class Entry extends /*#__PURE__*/Schema.Class("effect/eventlog/EventJournal/Entry")({
  id: EntryId,
  event: Schema.String,
  primaryKey: Schema.String,
  payload: Schema.Uint8Array
}) {
  /**
   * @since 4.0.0
   */
  static arrayMsgpack = /*#__PURE__*/Schema.Array(/*#__PURE__*/Msgpack.schema(Entry));
  /**
   * @since 4.0.0
   */
  static encodeArray = /*#__PURE__*/Schema.encodeUnknownEffect(Entry.arrayMsgpack);
  /**
   * @since 4.0.0
   */
  static decodeArray = /*#__PURE__*/Schema.decodeUnknownEffect(Entry.arrayMsgpack);
  /**
   * @since 4.0.0
   */
  static Order = /*#__PURE__*/Order.make((a, b) => EntryIdOrder(a.id, b.id));
  /**
   * @since 4.0.0
   */
  get idString() {
    return Uuid.stringify(this.id);
  }
  /**
   * @since 4.0.0
   */
  get createdAtMillis() {
    return entryIdMillis(this.id);
  }
  /**
   * @since 4.0.0
   */
  get createdAt() {
    return DateTime.makeUnsafe(this.createdAtMillis);
  }
}
/**
 * @since 4.0.0
 * @category entry
 */
export class RemoteEntry extends /*#__PURE__*/Schema.Class("effect/eventlog/EventJournal/RemoteEntry")({
  remoteSequence: Schema.Number,
  entry: Entry
}) {}
/**
 * @since 4.0.0
 * @category memory
 */
export const makeMemory = /*#__PURE__*/Effect.gen(function* () {
  const journal = [];
  const byId = new Map();
  const remotes = new Map();
  const pubsub = yield* PubSub.unbounded();
  const storeSemaphores = new Map();
  const withLock = storeId => {
    let semaphore = storeSemaphores.get(storeId);
    if (!semaphore) {
      semaphore = Semaphore.makeUnsafe(1);
      storeSemaphores.set(storeId, semaphore);
    }
    return semaphore.withPermit;
  };
  const ensureRemote = remoteId => {
    const remoteIdString = Uuid.stringify(remoteId);
    const remote = remotes.get(remoteIdString);
    if (remote) return remote;
    const created = {
      sequence: 0,
      missing: journal.slice()
    };
    remotes.set(remoteIdString, created);
    return created;
  };
  return EventJournal.of({
    entries: Effect.sync(() => journal.slice()),
    write({
      effect,
      event,
      payload,
      primaryKey
    }) {
      return Effect.acquireUseRelease(Effect.sync(() => new Entry({
        id: makeEntryIdUnsafe(),
        event,
        primaryKey,
        payload
      }, {
        disableChecks: true
      })), effect, (entry, exit) => Effect.suspend(() => {
        if (exit._tag === "Failure" || byId.has(entry.idString)) return Effect.void;
        journal.push(entry);
        byId.set(entry.idString, entry);
        remotes.forEach(remote => {
          remote.missing.push(entry);
        });
        return PubSub.publish(pubsub, entry);
      }));
    },
    writeFromRemote: Effect.fnUntraced(function* (options) {
      const remote = ensureRemote(options.remoteId);
      const uncommittedRemotes = [];
      const uncommitted = [];
      const duplicateEntries = [];
      for (const remoteEntry of options.entries) {
        if (byId.has(remoteEntry.entry.idString)) {
          duplicateEntries.push(remoteEntry.entry);
          if (remoteEntry.remoteSequence > remote.sequence) {
            remote.sequence = remoteEntry.remoteSequence;
          }
          continue;
        }
        uncommittedRemotes.push(remoteEntry);
        uncommitted.push(remoteEntry.entry);
      }
      const compacted = options.compact ? yield* options.compact(uncommittedRemotes) : uncommitted;
      for (const originEntry of compacted) {
        const entryMillis = entryIdMillis(originEntry.id);
        const conflicts = [];
        for (let i = journal.length - 1; i >= -1; i--) {
          const entry = journal[i];
          if (entry !== undefined && entry.createdAtMillis > entryMillis) {
            continue;
          }
          for (let j = i + 2; j < journal.length; j++) {
            const scannedEntry = journal[j];
            if (scannedEntry.event === originEntry.event && scannedEntry.primaryKey === originEntry.primaryKey) {
              conflicts.push(scannedEntry);
            }
          }
          yield* options.effect({
            entry: originEntry,
            conflicts
          });
          break;
        }
      }
      for (const remoteEntry of uncommittedRemotes) {
        journal.push(remoteEntry.entry);
        byId.set(remoteEntry.entry.idString, remoteEntry.entry);
        if (remoteEntry.remoteSequence > remote.sequence) {
          remote.sequence = remoteEntry.remoteSequence;
        }
      }
      journal.sort((a, b) => a.createdAtMillis - b.createdAtMillis);
      return {
        duplicateEntries
      };
    }),
    withRemoteUncommited: (remoteId, f) => Effect.acquireUseRelease(Effect.sync(() => ensureRemote(remoteId).missing.slice()), f, (entries, exit) => Effect.sync(() => {
      if (exit._tag === "Failure") return;
      const last = entries[entries.length - 1];
      if (!last) return;
      const remote = ensureRemote(remoteId);
      for (let i = remote.missing.length - 1; i >= 0; i--) {
        if (remote.missing[i].id === last.id) {
          remote.missing = remote.missing.slice(i + 1);
          break;
        }
      }
    })),
    nextRemoteSequence: remoteId => Effect.sync(() => ensureRemote(remoteId).sequence),
    changes: PubSub.subscribe(pubsub),
    destroy: Effect.sync(() => {
      journal.length = 0;
      byId.clear();
      remotes.clear();
    }),
    withLock
  });
});
/**
 * @since 4.0.0
 * @category memory
 */
export const layerMemory = /*#__PURE__*/Layer.effect(EventJournal, makeMemory);
/**
 * @since 4.0.0
 * @category indexed db
 */
export const makeIndexedDb = options => Effect.gen(function* () {
  const database = options?.database ?? "effect_event_journal";
  const openRequest = indexedDB.open(database, 1);
  openRequest.onupgradeneeded = () => {
    const db = openRequest.result;
    const entries = db.createObjectStore("entries", {
      keyPath: "id"
    });
    entries.createIndex("id", "id", {
      unique: true
    });
    entries.createIndex("event", "event");
    const remotes = db.createObjectStore("remotes", {
      keyPath: ["remoteId", "entryId"]
    });
    remotes.createIndex("id", ["remoteId", "entryId"], {
      unique: true
    });
    remotes.createIndex("sequence", ["remoteId", "sequence"], {
      unique: true
    });
    const remoteEntryId = db.createObjectStore("remoteEntryId", {
      keyPath: ["remoteId"]
    });
    remoteEntryId.createIndex("id", "remoteId", {
      unique: true
    });
  };
  const db = yield* Effect.acquireRelease(idbReq("open", () => openRequest), db => Effect.sync(() => db.close()));
  const pubsub = yield* PubSub.unbounded();
  return EventJournal.of({
    entries: idbReq("entries", () => db.transaction("entries", "readonly").objectStore("entries").index("id").getAll()).pipe(Effect.flatMap(_ => decodeEntryIdbArray(_).pipe(Effect.mapError(cause => new EventJournalError({
      method: "entries",
      cause
    }))))),
    write: ({
      effect,
      event,
      payload,
      primaryKey
    }) => Effect.uninterruptibleMask(restore => {
      const entry = new Entry({
        id: makeEntryIdUnsafe(),
        event,
        primaryKey,
        payload
      }, {
        disableChecks: true
      });
      return restore(effect(entry)).pipe(Effect.tap(idbReq("write", () => db.transaction("entries", "readwrite").objectStore("entries").put(encodeEntryIdb(entry)))), Effect.tap(PubSub.publish(pubsub, entry)));
    }),
    writeFromRemote: Effect.fnUntraced(function* (options) {
      const uncommitted = [];
      const uncommittedRemotes = [];
      const duplicateEntries = [];
      yield* Effect.callback(resume => {
        const tx = db.transaction(["entries", "remotes"], "readwrite");
        const entries = tx.objectStore("entries");
        const remotes = tx.objectStore("remotes");
        const iterator = options.entries[Symbol.iterator]();
        const handleNext = state => {
          if (state.done) return;
          const remoteEntry = state.value;
          const entry = remoteEntry.entry;
          const entryIdKey = entry.id;
          entries.get(entryIdKey).onsuccess = event => {
            if (event.target && "result" in event.target && event.target.result) {
              duplicateEntries.push(entry);
              remotes.put({
                remoteId: options.remoteId,
                entryId: entry.id,
                sequence: remoteEntry.remoteSequence
              });
              handleNext(iterator.next());
              return;
            }
            uncommitted.push(entry);
            uncommittedRemotes.push(remoteEntry);
            handleNext(iterator.next());
          };
        };
        handleNext(iterator.next());
        tx.oncomplete = () => resume(Effect.void);
        tx.onerror = () => resume(Effect.fail(new EventJournalError({
          method: "writeFromRemote",
          cause: tx.error
        })));
        return Effect.sync(() => tx.abort());
      });
      const compacted = options.compact ? yield* options.compact(uncommittedRemotes) : uncommitted;
      for (const originEntry of compacted) {
        const conflicts = [];
        yield* Effect.callback(resume => {
          const tx = db.transaction("entries", "readonly");
          const entries = tx.objectStore("entries");
          const cursorRequest = entries.index("id").openCursor(IDBKeyRange.lowerBound(originEntry.id, true), "next");
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) return;
            const decodedEntry = decodeEntryIdb(cursor.value);
            if (decodedEntry.event === originEntry.event && decodedEntry.primaryKey === originEntry.primaryKey) {
              conflicts.push(decodedEntry);
            }
            cursor.continue();
          };
          tx.oncomplete = () => resume(Effect.void);
          tx.onerror = () => resume(Effect.fail(new EventJournalError({
            method: "writeFromRemote",
            cause: tx.error
          })));
          return Effect.sync(() => tx.abort());
        });
        yield* options.effect({
          entry: originEntry,
          conflicts
        });
      }
      yield* Effect.callback(resume => {
        const tx = db.transaction(["entries", "remotes"], "readwrite");
        const entries = tx.objectStore("entries");
        const remotes = tx.objectStore("remotes");
        for (const remoteEntry of uncommittedRemotes) {
          entries.add(encodeEntryIdb(remoteEntry.entry));
          remotes.put({
            remoteId: options.remoteId,
            entryId: remoteEntry.entry.id,
            sequence: remoteEntry.remoteSequence
          });
        }
        tx.oncomplete = () => resume(Effect.void);
        tx.onerror = () => resume(Effect.fail(new EventJournalError({
          method: "writeFromRemote",
          cause: tx.error
        })));
        return Effect.sync(() => tx.abort());
      });
      return {
        duplicateEntries
      };
    }),
    withRemoteUncommited: (remoteId, f) => Effect.callback(resume => {
      const entries = [];
      const tx = db.transaction(["entries", "remotes", "remoteEntryId"], "readwrite");
      const entriesStore = tx.objectStore("entries");
      const remotesStore = tx.objectStore("remotes");
      const remoteEntryIdStore = tx.objectStore("remoteEntryId");
      const remoteIdKey = remoteId;
      const request = remoteEntryIdStore.get(remoteIdKey);
      request.onsuccess = () => {
        const startEntryId = request.result?.entryId;
        const entryCursor = entriesStore.index("id").openCursor(startEntryId ? IDBKeyRange.lowerBound(startEntryId, true) : null, "next");
        entryCursor.onsuccess = () => {
          const cursor = entryCursor.result;
          if (!cursor) return;
          const entry = decodeEntryIdb(cursor.value);
          remotesStore.get([remoteIdKey, entry.id]).onsuccess = event => {
            if (!(event.target && "result" in event.target && event.target.result)) entries.push(entry);
            cursor.continue();
          };
        };
      };
      tx.oncomplete = () => resume(Effect.succeed(entries));
      tx.onerror = () => resume(Effect.fail(new EventJournalError({
        method: "withRemoteUncommited",
        cause: tx.error
      })));
      return Effect.sync(() => tx.abort());
    }).pipe(Effect.flatMap(entries => {
      if (entries.length === 0) return f(entries);
      const entryId = entries[entries.length - 1].id;
      return Effect.uninterruptibleMask(restore => restore(f(entries)).pipe(Effect.tap(idbReq("withRemoteUncommited", () => db.transaction("remoteEntryId", "readwrite").objectStore("remoteEntryId").put({
        remoteId,
        entryId
      })))));
    })),
    nextRemoteSequence: remoteId => Effect.callback(resume => {
      const tx = db.transaction("remotes", "readonly");
      let sequence = 0;
      const remoteIdKey = remoteId;
      const cursorRequest = tx.objectStore("remotes").index("sequence").openCursor(IDBKeyRange.bound([remoteIdKey, 0], [remoteIdKey, Infinity]), "prev");
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        sequence = cursor.value.sequence + 1;
      };
      tx.oncomplete = () => resume(Effect.succeed(sequence));
      tx.onerror = () => resume(Effect.fail(new EventJournalError({
        method: "nextRemoteSequence",
        cause: tx.error
      })));
      return Effect.sync(() => tx.abort());
    }),
    changes: PubSub.subscribe(pubsub),
    destroy: Effect.sync(() => {
      indexedDB.deleteDatabase(database);
    }),
    withLock: yield* makeBrowserWithLock(database)
  });
});
const makeBrowserWithLock = /*#__PURE__*/Effect.fnUntraced(function* (key) {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return storeId => self => Effect.callback((resume, signal) => {
      navigator.locks.request(`${key}/${storeId}`, {
        signal
      }, () => new Promise(resolve => {
        resume(Effect.onExit(self, () => {
          resolve();
          return Effect.void;
        }));
      })).catch(defect => resume(Effect.die(defect)));
    });
  }
  const semaphores = new Map();
  return storeId => {
    let semaphore = semaphores.get(storeId);
    if (!semaphore) {
      semaphore = Semaphore.makeUnsafe(1);
      semaphores.set(storeId, semaphore);
    }
    return semaphore.withPermit;
  };
});
const decodeEntryIdb = /*#__PURE__*/Schema.decodeSync(Entry);
const encodeEntryIdb = /*#__PURE__*/Schema.encodeSync(Entry);
const EntryIdbArray = /*#__PURE__*/Schema.Array(Entry);
const decodeEntryIdbArray = /*#__PURE__*/Schema.decodeUnknownEffect(EntryIdbArray);
/**
 * @since 4.0.0
 * @category indexed db
 */
export const layerIndexedDb = options => Layer.effect(EventJournal, makeIndexedDb(options));
const idbReq = (method, evaluate) => Effect.callback(resume => {
  const request = evaluate();
  if (request.readyState === "done") {
    resume(Effect.succeed(request.result));
    return;
  }
  request.onsuccess = () => resume(Effect.succeed(request.result));
  request.onerror = () => resume(Effect.fail(new EventJournalError({
    method,
    cause: request.error
  })));
});
//# sourceMappingURL=EventJournal.js.map