/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Equal from "../../Equal.js";
import * as Exit from "../../Exit.js";
import { identity } from "../../Function.js";
import * as Hash from "../../Hash.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Queue from "../../Queue.js";
import { Scope } from "../../Scope.js";
import * as Stream from "../../Stream.js";
import * as Headers from "../http/Headers.js";
import * as Rpc from "../rpc/Rpc.js";
import * as RpcClient from "../rpc/RpcClient.js";
import * as RpcGroup from "../rpc/RpcGroup.js";
import * as RpcSchema from "../rpc/RpcSchema.js";
import * as RpcServer from "../rpc/RpcServer.js";
import { Persisted, ShardGroup, Uninterruptible } from "./ClusterSchema.js";
import { EntityAddress } from "./EntityAddress.js";
import { EntityType } from "./EntityType.js";
import * as Envelope from "./Envelope.js";
import { hashString } from "./internal/hash.js";
import { ResourceMap } from "./internal/resourceMap.js";
import * as Message from "./Message.js";
import { RunnerAddress } from "./RunnerAddress.js";
import * as ShardId from "./ShardId.js";
import { ShardingConfig } from "./ShardingConfig.js";
import * as Snowflake from "./Snowflake.js";
const TypeId = "~effect/cluster/Entity";
/**
 * @since 4.0.0
 * @category refinements
 */
export const isEntity = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  [Hash.symbol]() {
    return Hash.structure({
      type: this.type
    });
  },
  [Equal.symbol](that) {
    return isEntity(that) && this.type === that.type;
  },
  annotate(key, value) {
    return fromRpcGroup(this.type, this.protocol.annotate(key, value));
  },
  annotateRpcs(key, value) {
    return fromRpcGroup(this.type, this.protocol.annotateRpcs(key, value));
  },
  annotateMerge(annotations) {
    return fromRpcGroup(this.type, this.protocol.annotateMerge(annotations));
  },
  annotateRpcsMerge(annotations) {
    return fromRpcGroup(this.type, this.protocol.annotateRpcsMerge(annotations));
  },
  getShardId(entityId) {
    return Effect.map(shardingTag.asEffect(), sharding => sharding.getShardId(entityId, this.getShardGroup(entityId)));
  },
  get client() {
    return shardingTag.asEffect().pipe(Effect.flatMap(sharding => sharding.makeClient(this)));
  },
  toLayer(build, options) {
    return shardingTag.asEffect().pipe(Effect.flatMap(sharding => sharding.registerEntity(this, Effect.isEffect(build) ? build : Effect.succeed(build), options)), Layer.effectDiscard);
  },
  of: identity,
  toLayerQueue(build, options) {
    const buildHandlers = Effect.gen({
      self: this
    }, function* () {
      const behaviour = Effect.isEffect(build) ? yield* build : build;
      const queue = yield* Queue.make();
      // create the rpc handlers for the entity
      const handler = envelope => Effect.callback(resume => {
        Queue.offerUnsafe(queue, envelope);
        resumes.set(envelope, resume);
      });
      const streamHandler = envelope => Effect.callback(resume => {
        Queue.offerUnsafe(queue, envelope);
        resumes.set(envelope, resume);
      }).pipe(Effect.map(streamOrQueue => Stream.isStream(streamOrQueue) ? streamOrQueue : Stream.fromQueue(streamOrQueue)), Stream.unwrap);
      const handlers = {};
      for (const rpc_ of this.protocol.requests.values()) {
        const rpc = rpc_;
        handlers[rpc._tag] = RpcSchema.isStreamSchema(rpc.successSchema) ? streamHandler : handler;
      }
      // make the Replier for the behaviour
      const resumes = new Map();
      const complete = (request, exit) => Effect.sync(() => {
        const resume = resumes.get(request);
        if (resume) {
          resumes.delete(request);
          resume(exit);
        }
      });
      const replier = {
        succeed: (request, value) => complete(request, Exit.succeed(value)),
        fail: (request, error) => complete(request, Exit.fail(error)),
        failCause: (request, cause) => complete(request, Exit.failCause(cause)),
        complete
      };
      // fork the behaviour into the layer scope
      yield* behaviour(queue, replier).pipe(Effect.catchCause(cause => {
        const exit = Exit.failCause(cause);
        for (const resume of resumes.values()) {
          resume(exit);
        }
        return Effect.void;
      }), Effect.interruptible, Effect.forkScoped);
      return handlers;
    });
    return this.toLayer(buildHandlers, {
      ...options,
      concurrency: "unbounded"
    });
  }
};
/**
 * Creates a new `Entity` of the specified `type` which will accept messages
 * that adhere to the provided `RpcGroup`.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromRpcGroup = (
/**
 * The entity type name.
 */
type,
/**
 * The schema definition for messages that the entity is capable of
 * processing.
 */
protocol) => {
  const self = Object.create(Proto);
  self.type = EntityType.make(type);
  self.protocol = protocol;
  self.getShardGroup = Context.get(protocol.annotations, ShardGroup);
  return self;
};
/**
 * Creates a new `Entity` of the specified `type` which will accept messages
 * that adhere to the provided schemas.
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = (
/**
 * The entity type name.
 */
type,
/**
 * The schema definition for messages that the entity is capable of
 * processing.
 */
protocol) => fromRpcGroup(type, RpcGroup.make(...protocol));
/**
 * A Context.Tag to access the current entity address.
 *
 * @since 4.0.0
 * @category context
 */
export class CurrentAddress extends /*#__PURE__*/Context.Service()("effect/cluster/Entity/EntityAddress") {}
/**
 * A Context.Tag to access the current Runner address.
 *
 * @since 4.0.0
 * @category context
 */
export class CurrentRunnerAddress extends /*#__PURE__*/Context.Service()("effect/cluster/Entity/RunnerAddress") {}
/**
 * @since 4.0.0
 * @category Request
 */
export class Request extends Data.Class {
  /**
   * @since 4.0.0
   */
  get lastSentChunkValue() {
    return Option.map(this.lastSentChunk, chunk => Arr.lastNonEmpty(chunk.values));
  }
  /**
   * @since 4.0.0
   */
  get nextSequence() {
    if (Option.isNone(this.lastSentChunk)) {
      return 0;
    }
    return this.lastSentChunk.value.sequence + 1;
  }
}
const shardingTag = /*#__PURE__*/Context.Service("effect/cluster/Sharding");
/**
 * @since 4.0.0
 * @category Testing
 */
export const makeTestClient = /*#__PURE__*/Effect.fnUntraced(function* (entity, layer) {
  const config = yield* ShardingConfig;
  const makeShardId = entityId => ShardId.make(entity.getShardGroup(entityId), Math.abs(hashString(entityId) % config.shardsPerGroup) + 1);
  const snowflakeGen = yield* Snowflake.makeGenerator;
  const runnerAddress = new RunnerAddress({
    host: "localhost",
    port: 3000
  });
  const entityMap = new Map();
  const sharding = shardingTag.of({
    ...{},
    registerEntity: (entity, handlers, options) => Effect.contextWith(context => {
      entityMap.set(entity.type, {
        context: context,
        concurrency: options?.concurrency ?? 1,
        build: entity.protocol.toHandlers(handlers).pipe(Effect.provideContext(Context.mutate(context, context => context.pipe(Context.add(CurrentRunnerAddress, runnerAddress), Context.omit(Scope)))))
      });
      return Effect.void;
    })
  });
  yield* Layer.build(Layer.provide(layer, Layer.succeed(shardingTag)(sharding)));
  const entityEntry = entityMap.get(entity.type);
  if (!entityEntry) {
    return yield* Effect.die(`Entity.makeTestClient: ${entity.type} was not registered by layer`);
  }
  const map = yield* ResourceMap.make(Effect.fnUntraced(function* (entityId) {
    const address = new EntityAddress({
      entityType: entity.type,
      entityId: entityId,
      shardId: makeShardId(entityId)
    });
    const handlers = yield* entityEntry.build.pipe(Effect.provideService(CurrentAddress, address));
    // oxlint-disable-next-line prefer-const
    let client;
    const server = yield* RpcServer.makeNoSerialization(entity.protocol, {
      concurrency: entityEntry.concurrency,
      onFromServer(response) {
        return client.write(response);
      }
    }).pipe(Effect.provide(handlers));
    client = yield* RpcClient.makeNoSerialization(entity.protocol, {
      supportsAck: true,
      generateRequestId: () => snowflakeGen.nextUnsafe(),
      onFromClient({
        message
      }) {
        if (message._tag === "Request") {
          return server.write(0, {
            ...message,
            payload: new Request({
              ...message,
              [Envelope.TypeId]: Envelope.TypeId,
              address,
              requestId: Snowflake.Snowflake(message.id),
              lastSentChunk: Option.none()
            })
          });
        }
        return server.write(0, message);
      }
    });
    return client.client;
  }));
  return entityId => map.get(entityId);
});
/**
 * @since 4.0.0
 * @category Keep alive
 */
export const keepAlive = /*#__PURE__*/Effect.fnUntraced(function* (enabled) {
  const olatch = yield* Effect.serviceOption(KeepAliveLatch);
  if (olatch._tag === "None") return;
  if (!enabled) {
    yield* olatch.value.open;
    return;
  }
  const sharding = yield* shardingTag;
  const address = yield* CurrentAddress;
  const requestId = yield* sharding.getSnowflake;
  const span = yield* Effect.orDie(Effect.currentSpan);
  olatch.value.closeUnsafe();
  yield* Effect.orDie(sharding.sendOutgoing(new Message.OutgoingRequest({
    annotations: KeepAliveRpc.annotations,
    rpc: KeepAliveRpc,
    context: Context.empty(),
    envelope: Envelope.makeRequest({
      requestId,
      address,
      tag: KeepAliveRpc._tag,
      payload: void 0,
      headers: Headers.empty,
      traceId: span.traceId,
      spanId: span.spanId,
      sampled: span.sampled
    }),
    lastReceivedReply: Option.none(),
    respond: () => Effect.void
  }), true));
}, (effect, enabled) => Effect.withSpan(effect, "Entity/keepAlive", {
  attributes: {
    enabled
  },
  captureStackTrace: false
}));
/**
 * @since 4.0.0
 * @category Keep alive
 */
export const KeepAliveRpc = /*#__PURE__*/Rpc.make("Cluster/Entity/keepAlive").annotate(Persisted, true).annotate(Uninterruptible, true);
/**
 * @since 4.0.0
 * @category Keep alive
 */
export class KeepAliveLatch extends /*#__PURE__*/Context.Service()("effect/cluster/Entity/KeepAliveLatch") {}
//# sourceMappingURL=Entity.js.map