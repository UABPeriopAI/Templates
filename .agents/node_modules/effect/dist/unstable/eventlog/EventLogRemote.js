/**
 * @since 4.0.0
 */
import * as Cache from "../../Cache.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Predicate from "../../Predicate.js";
import * as Queue from "../../Queue.js";
import * as Redacted from "../../Redacted.js";
import * as RpcClient from "../rpc/RpcClient.js";
import { Registry } from "./EventLog.js";
import { EventLogEncryption, layerSubtle } from "./EventLogEncryption.js";
import { Authenticate, ChangesRpc, ChunkedMessage, EventLogRemoteRpcs, WriteEntries, WriteEntriesUnencrypted } from "./EventLogMessage.js";
import { encodeSessionAuthPayload, signSessionAuthPayloadBytes } from "./EventLogSessionAuth.js";
import { makeGetIdentityRootSecretMaterial } from "./internal/identityRootSecretDerivation.js";
/**
 * @since 4.0.0
 * @category models
 */
export class EventLogRemote extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogRemote") {}
/**
 * @since 4.0.0
 * @category errors
 */
export class EventLogRemoteError extends /*#__PURE__*/Data.TaggedError("EventLogRemoteError") {}
const getIdentityRootSecretMaterial = /*#__PURE__*/makeGetIdentityRootSecretMaterial(globalThis.crypto);
const makeAuthenticate = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const rootSecretMaterial = yield* getIdentityRootSecretMaterial(options.identity);
  const payload = yield* encodeSessionAuthPayload({
    remoteId: options.hello.remoteId,
    challenge: options.hello.challenge,
    publicKey: options.identity.publicKey,
    signingPublicKey: rootSecretMaterial.signingPublicKey
  });
  const signature = yield* signSessionAuthPayloadBytes({
    payload,
    signingPrivateKey: Redacted.value(rootSecretMaterial.signingPrivateKey)
  });
  return new Authenticate({
    publicKey: options.identity.publicKey,
    signingPublicKey: rootSecretMaterial.signingPublicKey,
    signature,
    algorithm: "Ed25519"
  });
});
/**
 * @since 4.0.0
 * @category RpcClient
 */
export class EventLogRemoteClient extends /*#__PURE__*/Context.Service()("effect/unstable/eventlog/EventLogRemote/EventLogRemoteClient") {
  static layer = /*#__PURE__*/Layer.effect(EventLogRemoteClient, /*#__PURE__*/RpcClient.make(EventLogRemoteRpcs, {
    disableTracing: true
  }));
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeWith = /*#__PURE__*/Effect.fnUntraced(function* ({
  encodeWrite,
  decodeChanges
}) {
  const client = yield* EventLogRemoteClient;
  const registry = yield* Registry;
  let hello = yield* client["EventLog.Hello"]().pipe(Effect.mapError(cause => new EventLogRemoteError({
    method: "hello",
    cause
  })));
  const identities = new Map();
  const ensureIdentity = identity => {
    let entry = identities.get(identity.publicKey);
    if (!entry) {
      entry = identity;
      identities.set(identity.publicKey, entry);
    }
    return entry;
  };
  const authCache = yield* Cache.make({
    lookup: Effect.fnUntraced(function* (publicKey) {
      const identity = identities.get(publicKey);
      hello ??= yield* client["EventLog.Hello"]().pipe(Effect.mapError(cause => new EventLogRemoteError({
        method: "hello",
        cause
      })));
      const authenticate = yield* makeAuthenticate({
        identity,
        hello
      });
      yield* client["EventLog.Authenticate"](authenticate);
    }, Effect.mapError(cause => new EventLogRemoteError({
      method: "authenticate",
      cause
    }))),
    capacity: Number.MAX_SAFE_INTEGER
  });
  const ensureAuthenticated = identity => {
    ensureIdentity(identity);
    return Cache.get(authCache, identity.publicKey);
  };
  const retryForbidden = (effect, options) => Effect.retry(effect, {
    while(e) {
      hello = null;
      const isForbidden = Predicate.isTagged(e, "EventLogProtocolError") && e.code === "Forbidden";
      return Cache.invalidate(authCache, options.identity.publicKey).pipe(Effect.as(isForbidden));
    },
    times: 5
  });
  let chunkedIdCounter = 0;
  const remote = EventLogRemote.of({
    id: hello.remoteId,
    write: Effect.fnUntraced(function* (options) {
      yield* ensureAuthenticated(options.identity);
      const encoded = yield* encodeWrite(options);
      if (encoded.byteLength <= ChunkedMessage.chunkSize) {
        return yield* client["EventLog.WriteSingle"]({
          data: encoded
        });
      }
      for (const part of ChunkedMessage.split(chunkedIdCounter++, encoded)) {
        yield* client["EventLog.WriteChunked"](part);
      }
    }, retryForbidden, Effect.mapError(cause => new EventLogRemoteError({
      method: "write",
      cause
    }))),
    changes: Effect.fnUntraced(function* (options) {
      const outgoing = yield* Queue.make();
      yield* Effect.gen(function* () {
        yield* ensureAuthenticated(options.identity);
        const chunkedState = ChunkedMessage.initialJoinState();
        const incoming = yield* client["EventLog.Changes"]({
          publicKey: options.identity.publicKey,
          storeId: options.storeId,
          startSequence: options.startSequence
        }, {
          asQueue: true
        });
        while (true) {
          const parts = yield* Queue.takeAll(incoming);
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part._tag === "Single") {
              yield* Queue.offerAll(outgoing, yield* decodeChanges(options.identity, part.data));
              continue;
            }
            const data = ChunkedMessage.join(chunkedState, part);
            if (!data) continue;
            yield* Queue.offerAll(outgoing, yield* decodeChanges(options.identity, data));
          }
        }
      }).pipe(effect => retryForbidden(effect, options), Effect.mapError(cause => {
        if (cause._tag === "EventLogRemoteError") {
          return cause;
        }
        return new EventLogRemoteError({
          method: "changes",
          cause
        });
      }), Effect.catchCause(cause => Queue.failCause(outgoing, cause)), Effect.forkScoped);
      return outgoing;
    }),
    whenAuthenticated: effect => IdentityService.use(identity => Effect.flatMap(ensureAuthenticated(identity), () => effect))
  });
  yield* registry.registerRemote(remote);
  return remote;
});
/** @effect-diagnostics-next-line classSelfMismatch:off */
class IdentityService extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLog/Identity") {}
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeEncrypted = /*#__PURE__*/Effect.gen(function* () {
  const encryption = yield* EventLogEncryption;
  return yield* makeWith({
    encodeWrite: options => encryption.encrypt(options.identity, options.entries).pipe(Effect.flatMap(msg => new WriteEntries({
      publicKey: options.identity.publicKey,
      storeId: options.storeId,
      iv: msg.iv,
      encryptedEntries: msg.encryptedEntries.map((entry, i) => ({
        entryId: options.entries[i].id,
        encryptedEntry: entry
      }))
    }).encoded)),
    decodeChanges: (identity, data) => ChangesRpc.decodeEncrypted(data).pipe(Effect.flatMap(entries => encryption.decrypt(identity, entries)))
  });
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeUnencrypted = /*#__PURE__*/makeWith({
  encodeWrite: options => new WriteEntriesUnencrypted({
    publicKey: options.identity.publicKey,
    storeId: options.storeId,
    entries: options.entries
  }).encoded,
  decodeChanges: (_identity, data) => ChangesRpc.decodeUnencrypted(data)
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerEncrypted = /*#__PURE__*/Layer.effect(EventLogRemote, makeEncrypted).pipe(/*#__PURE__*/Layer.provide(EventLogRemoteClient.layer), /*#__PURE__*/Layer.provide(layerSubtle));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerUnencrypted = /*#__PURE__*/Layer.effect(EventLogRemote, makeUnencrypted).pipe(/*#__PURE__*/Layer.provide(EventLogRemoteClient.layer));
//# sourceMappingURL=EventLogRemote.js.map