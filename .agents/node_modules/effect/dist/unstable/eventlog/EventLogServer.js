import * as Arr from "../../Array.js";
import * as Cache from "../../Cache.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Redacted from "../../Redacted.js";
import * as Stream from "../../Stream.js";
import * as EventLog from "./EventLog.js";
import { ChunkedMessage, EventLogAuthentication, EventLogProtocolError, EventLogRemoteRpcs, HelloResponse, SingleMessage } from "./EventLogMessage.js";
import * as EventLogSessionAuth from "./EventLogSessionAuth.js";
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerAuthMiddleware = /*#__PURE__*/Layer.succeed(EventLogAuthentication, (effect, {
  client,
  rpc
}) => {
  const identity = Context.getOrUndefined(client.annotations, EventLog.Identity);
  if (identity) return Effect.provideService(effect, EventLog.Identity, identity);
  return Effect.fail(new EventLogProtocolError({
    requestTag: rpc._tag,
    publicKey: undefined,
    code: "Forbidden",
    message: "Unauthenticated request"
  }));
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerRpcHandlers = options => EventLogRemoteRpcs.toLayer(Effect.gen(function* () {
  const clientChallenges = yield* Cache.make({
    lookup: _clientId => Effect.orDie(EventLogSessionAuth.makeSessionAuthChallenge),
    capacity: Number.MAX_SAFE_INTEGER,
    timeToLive: EventLogSessionAuth.SessionAuthChallengeTimeToLiveMillis
  });
  let chunkedIdCounter = 0;
  const persistedSigningPublicKeys = yield* Cache.make({
    lookup: key => options.getOrCreateSessionAuthBinding(key.publicKey, key.signingPublicKey).pipe(Effect.catchCause(_ => Effect.fail(new EventLogProtocolError({
      requestTag: "Authenticate",
      publicKey: key.publicKey,
      code: "Forbidden",
      message: "Session auth binding lookup failed"
    })))),
    capacity: 4096
  });
  return EventLogRemoteRpcs.of({
    "EventLog.Hello": Effect.fnUntraced(function* (_, {
      client
    }) {
      const challenge = yield* Cache.get(clientChallenges, client.id);
      return new HelloResponse({
        remoteId: options.remoteId,
        challenge
      });
    }),
    "EventLog.Authenticate": Effect.fnUntraced(function* (request, {
      client
    }) {
      const challenge = Option.getOrNull(yield* Cache.getOption(clientChallenges, client.id));
      if (!challenge) {
        return yield* new EventLogProtocolError({
          requestTag: "Authenticate",
          publicKey: request.publicKey,
          code: "Forbidden",
          message: "Session auth challenge has expired"
        });
      }
      yield* Cache.invalidate(clientChallenges, client.id);
      const signingPublicKey = yield* Cache.get(persistedSigningPublicKeys, new SessionAuthCacheKey({
        publicKey: request.publicKey,
        signingPublicKey: request.signingPublicKey
      }));
      const verified = yield* EventLogSessionAuth.verifySessionAuthenticateRequest({
        remoteId: options.remoteId,
        challenge,
        publicKey: request.publicKey,
        signingPublicKey,
        signature: request.signature,
        algorithm: request.algorithm
      }).pipe(Effect.catch(() => Effect.succeed(false)));
      if (!verified) {
        return yield* new EventLogProtocolError({
          requestTag: "Authenticate",
          publicKey: request.publicKey,
          code: "Forbidden",
          message: "Session auth signature verification failed"
        });
      }
      void client.annotate(EventLog.Identity, {
        publicKey: request.publicKey,
        privateKey: constEmptyPrivateKey
      }).annotate(ChunkedMessageState, new Map());
    }),
    "EventLog.WriteSingle": Effect.fnUntraced(function* (request) {
      yield* options.onWrite(request.data);
    }),
    "EventLog.WriteChunked": Effect.fnUntraced(function* (request, {
      client
    }) {
      const state = Context.get(client.annotations, ChunkedMessageState);
      const data = ChunkedMessage.join(state, request);
      if (!data) return;
      yield* options.onWrite(data);
    }),
    "EventLog.Changes": request => options.changes({
      publicKey: request.publicKey,
      storeId: request.storeId,
      startSequence: request.startSequence
    }).pipe(Stream.mapArray(Arr.flatMap(data => {
      if (data.byteLength <= ChunkedMessage.chunkSize) {
        return [new SingleMessage({
          data
        })];
      }
      return ChunkedMessage.split(chunkedIdCounter++, data);
    })), Stream.catchCause(_ => Stream.fail(new EventLogProtocolError({
      requestTag: "Changes",
      publicKey: request.publicKey,
      code: "InternalServerError",
      message: "Decoding failure"
    }))))
  });
})).pipe(Layer.merge(layerAuthMiddleware));
/**
 * @since 4.0.0
 * @category ChunkedMessage state
 */
export class ChunkedMessageState extends /*#__PURE__*/Context.Reference("effect/eventlog/EventLogServer/ChunkedMessageState", {
  defaultValue: () => new Map()
}) {}
class SessionAuthCacheKey extends Data.Class {
  [Equal.symbol](that) {
    return this.publicKey === that.publicKey;
  }
  [Hash.symbol]() {
    return Hash.string(this.publicKey);
  }
}
const constEmptyPrivateKey = /*#__PURE__*/Redacted.make(/*#__PURE__*/new Uint8Array(32));
//# sourceMappingURL=EventLogServer.js.map