/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as FiberMap from "../../FiberMap.js";
import { constant, identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as PubSub from "../../PubSub.js";
import * as Queue from "../../Queue.js";
import * as Redacted from "../../Redacted.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as SchemaGetter from "../../SchemaGetter.js";
import { Reactivity } from "../reactivity/Reactivity.js";
import * as ReactivityLayer from "../reactivity/Reactivity.js";
import { Entry, EventJournal, makeEntryIdUnsafe } from "./EventJournal.js";
import * as EventLogEncryption from "./EventLogEncryption.js";
import { StoreId } from "./EventLogMessage.js";
/**
 * @since 4.0.0
 * @category tags
 */
export class EventLog extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLog") {}
/**
 * @since 4.0.0
 * @category Registry
 */
export class Registry extends /*#__PURE__*/Context.Service()("effect/unstable/eventlog/EventLog/Registry") {}
/**
 * @since 4.0.0
 * @category Registry
 */
export const layerRegistry = /*#__PURE__*/Layer.effect(Registry, /*#__PURE__*/Effect.gen(function* () {
  const handlers = new Map();
  const compactors = new Map();
  const remoteFiberMap = yield* FiberMap.make();
  const remotes = new Map();
  let remoteHandler = _ => Effect.void;
  const reactivityKeys = {};
  return Registry.of({
    registerHandlerUnsafe(options) {
      handlers.set(options.event, options.handler);
    },
    handlers,
    registerCompaction: options => Effect.sync(() => {
      const events = new Set(options.events);
      const compactor = {
        events,
        effect: options.effect
      };
      for (const event of options.events) {
        compactors.set(event, compactor);
      }
    }),
    compactors,
    registerRemote: remote => Effect.acquireRelease(Effect.suspend(() => {
      remotes.set(remote.id, remote);
      return Effect.asVoid(FiberMap.run(remoteFiberMap, remote.id, remoteHandler(remote)));
    }), () => {
      remotes.delete(remote.id);
      return FiberMap.remove(remoteFiberMap, remote.id);
    }),
    handleRemote(handler) {
      remoteHandler = handler;
      return Effect.forEach(remotes, ([id, remote]) => FiberMap.run(remoteFiberMap, id, handler(remote)), {
        discard: true
      });
    },
    registerReactivity: keys => Effect.sync(() => {
      Object.assign(reactivityKeys, keys);
    }),
    reactivityKeys
  });
}));
/**
 * @since 4.0.0
 * @category models
 */
export class Identity extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLog/Identity") {}
/**
 * @since 4.0.0
 * @category schema
 */
export const SchemaTypeId = "~effect/eventlog/EventLog/Schema";
/**
 * @since 4.0.0
 * @category schema
 */
export const isEventLogSchema = u => Predicate.hasProperty(u, SchemaTypeId);
/**
 * @since 4.0.0
 * @category schema
 */
export const schema = (...groups) => {
  const EventLog = Object.assign(function EventLog() {}, {
    [SchemaTypeId]: SchemaTypeId,
    groups
  });
  return EventLog;
};
/**
 * @since 4.0.0
 * @category handlers
 */
export const HandlersTypeId = "~effect/eventlog/EventLog/Handlers";
/**
 * @since 4.0.0
 * @category models
 */
export class CurrentStoreId extends /*#__PURE__*/Context.Reference("effect/eventlog/EventLog/CurrentStoreId", {
  defaultValue: /*#__PURE__*/constant(/*#__PURE__*/StoreId.make("default"))
}) {}
const RedactedUint8Array = /*#__PURE__*/Schema.Uint8ArrayFromBase64.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.Redacted(Schema.Uint8Array), {
  decode: /*#__PURE__*/SchemaGetter.transform(value => Redacted.make(value)),
  encode: /*#__PURE__*/SchemaGetter.transform(value => Redacted.value(value))
}));
/**
 * @since 4.0.0
 * @category schema
 */
export const IdentitySchema = /*#__PURE__*/Schema.Struct({
  publicKey: Schema.String,
  privateKey: RedactedUint8Array
});
const IdentityEncodedSchema = /*#__PURE__*/Schema.Struct({
  publicKey: Schema.String,
  privateKey: Schema.Uint8ArrayFromBase64
});
const IdentityStringSchema = /*#__PURE__*/Schema.StringFromBase64Url.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.fromJsonString(IdentityEncodedSchema)));
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeIdentityString = value => {
  const decoded = Schema.decodeUnknownSync(IdentityStringSchema)(value);
  return {
    publicKey: decoded.publicKey,
    privateKey: Redacted.make(decoded.privateKey)
  };
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeIdentityString = identity => Schema.encodeSync(IdentityStringSchema)({
  publicKey: identity.publicKey,
  privateKey: Redacted.value(identity.privateKey)
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeIdentity = /*#__PURE__*/EventLogEncryption.EventLogEncryption.use(_ => _.generateIdentity);
const handlersProto = {
  [HandlersTypeId]: {
    _Events: identity
  },
  handle(tag, handler) {
    return makeHandlers({
      group: this.group,
      context: this.context,
      handlers: {
        ...this.handlers,
        [tag]: {
          event: this.group.events[tag],
          context: this.context,
          handler
        }
      }
    });
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makeHandlers = options => Object.assign(Object.create(handlersProto), options);
/**
 * @since 4.0.0
 * @category handlers
 */
export const group = (group, f) => Layer.effectDiscard(Effect.gen(function* () {
  const registry = yield* Registry;
  const context = yield* Effect.context();
  const result = f(makeHandlers({
    group: group,
    handlers: {},
    context
  }));
  const handlers = Effect.isEffect(result) ? yield* result : result;
  for (const tag in handlers.handlers) {
    registry.registerHandlerUnsafe({
      event: tag,
      handler: handlers.handlers[tag]
    });
  }
}));
/**
 * @since 4.0.0
 * @category compaction
 */
export const groupCompaction = (group, effect) => Layer.effectDiscard(Effect.gen(function* () {
  const registry = yield* Registry;
  const services = yield* Effect.context();
  yield* registry.registerCompaction({
    events: Object.keys(group.events),
    effect: Effect.fnUntraced(function* ({
      entries,
      write
    }) {
      const isEventTag = tag => tag in group.events;
      const decodePayload = (tag, payload) => Schema.decodeUnknownEffect(group.events[tag].payloadMsgPack)(payload).pipe(Effect.updateContext(input => Context.merge(services, input)), Effect.orDie);
      const writePayload = Effect.fnUntraced(function* (timestamp, tag, payload) {
        const event = group.events[tag];
        const entry = new Entry({
          id: makeEntryIdUnsafe({
            msecs: timestamp
          }),
          event: tag,
          payload: yield* Schema.encodeUnknownEffect(event.payloadMsgPack)(payload).pipe(Effect.orDie),
          primaryKey: event.primaryKey(payload)
        }, {
          disableChecks: true
        });
        yield* write(entry);
      });
      const byPrimaryKey = new Map();
      for (const entry of entries) {
        if (!isEventTag(entry.event)) {
          continue;
        }
        const payload = yield* decodePayload(entry.event, entry.payload);
        const record = byPrimaryKey.get(entry.primaryKey);
        const taggedPayload = {
          _tag: entry.event,
          payload
        };
        if (record) {
          record.entries.push(entry);
          record.taggedPayloads.push(taggedPayload);
        } else {
          byPrimaryKey.set(entry.primaryKey, {
            entries: [entry],
            taggedPayloads: [taggedPayload]
          });
        }
      }
      for (const [primaryKey, {
        entries,
        taggedPayloads
      }] of byPrimaryKey) {
        yield* Effect.orDie(effect({
          primaryKey,
          entries,
          events: taggedPayloads,
          write(tag, payload) {
            return Effect.orDie(writePayload(entries[0].createdAtMillis, tag, payload));
          }
        }).pipe(Effect.updateContext(input => Context.merge(services, input))));
      }
    })
  });
}));
/**
 * @since 4.0.0
 * @category reactivity
 */
export const groupReactivity = (group, keys) => Effect.gen(function* () {
  const registry = yield* Registry;
  if (!Array.isArray(keys)) {
    yield* registry.registerReactivity(keys);
    return;
  }
  const obj = {};
  for (const tag in group.events) {
    obj[tag] = keys;
  }
  yield* registry.registerReactivity(obj);
}).pipe(Layer.effectDiscard);
/**
 * @since 4.0.0
 * @category handlers
 */
export const makeReplayFromRemote = options => Effect.fnUntraced(function* ({
  conflicts,
  entry
}) {
  const handler = options.handlers.get(entry.event);
  if (!handler) {
    return yield* Effect.logDebug(`Event handler not found for: "${entry.event}"`);
  }
  const decodePayload = Schema.decodeUnknownEffect(handler.event.payloadMsgPack);
  const decodedConflicts = new Array(conflicts.length);
  for (let i = 0; i < conflicts.length; i++) {
    decodedConflicts[i] = {
      entry: conflicts[i],
      payload: yield* decodePayload(conflicts[i].payload).pipe(Effect.updateContext(input => Context.merge(handler.context, input)))
    };
  }
  yield* decodePayload(entry.payload).pipe(Effect.flatMap(payload => handler.handler({
    storeId: options.storeId,
    payload,
    entry,
    conflicts: decodedConflicts
  })), Effect.provideService(Identity, options.identity), Effect.updateContext(input => Context.merge(handler.context, input)), Effect.asVoid);
  const keys = options.reactivityKeys[entry.event];
  if (keys) {
    for (const key of keys) {
      options.reactivity.invalidateUnsafe({
        [key]: [entry.primaryKey]
      });
    }
  }
}, Effect.catchCause(Effect.logError), (effect, {
  entry
}) => Effect.annotateLogs(effect, {
  ...options.logAnnotations,
  entryId: entry.idString
}));
const make = /*#__PURE__*/Effect.gen(function* () {
  const storeId = yield* CurrentStoreId;
  const identity = yield* Identity;
  const journal = yield* EventJournal;
  const registry = yield* Registry;
  const reactivity = yield* Reactivity;
  const replayFromRemote = makeReplayFromRemote({
    handlers: registry.handlers,
    storeId,
    identity,
    reactivity,
    reactivityKeys: registry.reactivityKeys,
    logAnnotations: {
      service: "EventLog",
      effect: "writeFromRemote"
    }
  });
  const invalidateReactivityEntries = entries => Effect.sync(() => {
    for (const entry of entries) {
      const keys = registry.reactivityKeys[entry.event];
      if (!keys) {
        continue;
      }
      for (const key of keys) {
        reactivity.invalidateUnsafe({
          [key]: [entry.primaryKey]
        });
      }
    }
  });
  const runRemote = Effect.fnUntraced(function* (remote) {
    const startSequence = yield* journal.nextRemoteSequence(remote.id);
    yield* Effect.gen(function* () {
      const changes = yield* remote.changes({
        identity,
        startSequence,
        storeId
      });
      while (true) {
        const entries = yield* Queue.takeAll(changes);
        yield* journal.writeFromRemote({
          remoteId: remote.id,
          entries: entries.flat(),
          compact: registry.compactors.size > 0 ? Effect.fnUntraced(function* (remoteEntries) {
            const finalEntries = [];
            const compactable = new Map();
            for (let i = 0; i < remoteEntries.length; i++) {
              const remoteEntry = remoteEntries[i];
              const entry = remoteEntry.entry;
              const compactor = registry.compactors.get(entry.event);
              if (!compactor) {
                finalEntries.push(entry);
                continue;
              }
              let arr = compactable.get(compactor.effect);
              if (!arr) {
                arr = [];
                compactable.set(compactor.effect, arr);
              }
              arr.push(entry);
            }
            for (const [compact, entries] of compactable) {
              yield* compact({
                entries,
                write(entry) {
                  return Effect.sync(() => {
                    finalEntries.push(entry);
                  });
                }
              });
            }
            return finalEntries.sort(Entry.Order);
          }) : undefined,
          effect: replayFromRemote
        }).pipe(Effect.tap(({
          duplicateEntries
        }) => invalidateReactivityEntries(duplicateEntries)), journal.withLock(storeId));
      }
    }).pipe(Effect.scoped, Effect.catchCause(Effect.logError), Effect.repeat(Schedule.exponential(200, 1.5).pipe(Schedule.either(Schedule.spaced({
      seconds: 10
    })))), Effect.annotateLogs({
      service: "EventLog",
      effect: "runRemote consume"
    }), Effect.forkScoped);
    const write = journal.withRemoteUncommited(remote.id, entries => remote.write({
      identity,
      entries,
      storeId
    }));
    yield* Effect.addFinalizer(() => Effect.ignore(write));
    yield* write;
    const changesSub = yield* journal.changes;
    return yield* PubSub.takeAll(changesSub).pipe(Effect.andThen(write), Effect.catchCause(Effect.logError), Effect.forever);
  }, Effect.scoped, Effect.provideService(Identity, identity), Effect.orDie);
  const writeHandler = Effect.fnUntraced(function* (handler, options) {
    const payload = yield* Schema.encodeUnknownEffect(handler.event.payloadMsgPack)(options.payload).pipe(Effect.orDie);
    return yield* journal.withLock(storeId)(journal.write({
      event: options.event,
      primaryKey: handler.event.primaryKey(options.payload),
      payload,
      effect: entry => handler.handler({
        storeId,
        payload: options.payload,
        entry,
        conflicts: []
      }).pipe(Effect.updateContext(input => Context.merge(handler.context, input)), Effect.provideService(Identity, identity), Effect.tap(() => {
        if (registry.reactivityKeys[entry.event]) {
          for (const key of registry.reactivityKeys[entry.event]) {
            reactivity.invalidateUnsafe({
              [key]: [entry.primaryKey]
            });
          }
        }
        return Effect.void;
      }))
    }));
  });
  const eventLogWrite = options => {
    const handler = registry.handlers.get(options.event);
    if (handler === undefined) {
      return Effect.die(`Event handler not found for: "${options.event}"`);
    }
    return writeHandler(handler, options);
  };
  yield* registry.handleRemote(runRemote);
  return EventLog.of({
    write: eventLogWrite,
    entries: journal.entries,
    destroy: journal.destroy
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerEventLog = /*#__PURE__*/Layer.effect(EventLog, make).pipe(/*#__PURE__*/Layer.provide(ReactivityLayer.layer), /*#__PURE__*/Layer.provideMerge(layerRegistry));
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = (_schema, layer) => layer.pipe(Layer.provideMerge(layerEventLog));
/**
 * @since 4.0.0
 * @category client
 */
export const makeClient = schema => Effect.gen(function* () {
  const log = yield* EventLog;
  return (event, payload) => log.write({
    schema,
    event,
    payload
  });
});
//# sourceMappingURL=EventLog.js.map