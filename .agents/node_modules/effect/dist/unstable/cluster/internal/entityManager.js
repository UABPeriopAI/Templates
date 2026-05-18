import * as Arr from "../../../Array.js";
import * as Cause from "../../../Cause.js";
import { Clock } from "../../../Clock.js";
import * as Context from "../../../Context.js";
import * as Duration from "../../../Duration.js";
import * as Effect from "../../../Effect.js";
import * as Equal from "../../../Equal.js";
import * as Exit from "../../../Exit.js";
import * as Fiber from "../../../Fiber.js";
import { identity } from "../../../Function.js";
import * as Latch from "../../../Latch.js";
import * as Metric from "../../../Metric.js";
import * as Option from "../../../Option.js";
import { CurrentLogAnnotations } from "../../../References.js";
import * as Schedule from "../../../Schedule.js";
import * as Schema from "../../../Schema.js";
import * as Issue from "../../../SchemaIssue.js";
import * as Scope from "../../../Scope.js";
import { RequestId } from "../../rpc/RpcMessage.js";
import * as RpcServer from "../../rpc/RpcServer.js";
import { AlreadyProcessingMessage, EntityNotAssignedToRunner, MailboxFull, MalformedMessage } from "../ClusterError.js";
import * as ClusterMetrics from "../ClusterMetrics.js";
import { isUninterruptibleForServer, Persisted, WithTransaction } from "../ClusterSchema.js";
import * as ClusterSchema from "../ClusterSchema.js";
import { CurrentAddress, CurrentRunnerAddress, KeepAliveLatch, KeepAliveRpc, Request } from "../Entity.js";
import * as Message from "../Message.js";
import * as MessageStorage from "../MessageStorage.js";
import * as Reply from "../Reply.js";
import { ShardingConfig } from "../ShardingConfig.js";
import * as Snowflake from "../Snowflake.js";
import { EntityReaper } from "./entityReaper.js";
import { internalInterruptors } from "./interruptors.js";
import { ResourceMap } from "./resourceMap.js";
import { ResourceRef } from "./resourceRef.js";
/** @internal */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (entity, buildHandlers, options) {
  const config = yield* ShardingConfig;
  const snowflakeGen = yield* Snowflake.Generator;
  const managerScope = yield* Effect.scope;
  const storageEnabled = options.storage !== MessageStorage.noop;
  const mailboxCapacity = options.mailboxCapacity ?? config.entityMailboxCapacity;
  const clock = yield* Clock;
  const context = yield* Effect.context();
  const defectRetryPolicy = options.defectRetryPolicy ? Schedule.andThen(options.defectRetryPolicy, defaultRetryPolicy) : defaultRetryPolicy;
  const retryDriver = yield* Schedule.toStepWithSleep(defectRetryPolicy);
  const entityRpcs = new Map(entity.protocol.requests);
  // add internal rpcs
  entityRpcs.set(KeepAliveRpc._tag, KeepAliveRpc);
  const activeServers = new Map();
  const serverCloseLatches = new Map();
  const processedRequestIds = new Set();
  const entities = yield* ResourceMap.make(Effect.fnUntraced(function* (address) {
    if (!options.sharding.hasShardId(address.shardId)) {
      return yield* new EntityNotAssignedToRunner({
        address
      });
    }
    const scope = yield* Effect.scope;
    const endLatch = Latch.makeUnsafe();
    const keepAliveLatch = Latch.makeUnsafe();
    // on shutdown, reset the storage for the entity
    yield* Scope.addFinalizerExit(scope, () => {
      serverCloseLatches.get(address)?.openUnsafe();
      serverCloseLatches.delete(address);
      return Effect.void;
    });
    const activeRequests = new Map();
    let defectRequestIds = [];
    // the server is stored in a ref, so if there is a defect, we can
    // swap the server without losing the active requests
    const writeRef = yield* ResourceRef.from(scope, Effect.fnUntraced(function* (scope) {
      let isShuttingDown = false;
      // Initiate the behavior for the entity
      const handlers = yield* entity.protocol.toHandlers(buildHandlers).pipe(Effect.provideService(CurrentLogAnnotations, {}), Effect.provideContext(Context.mutate(context, context => context.pipe(Context.add(CurrentAddress, address), Context.add(CurrentRunnerAddress, options.runnerAddress), Context.add(KeepAliveLatch, keepAliveLatch), Context.add(Scope.Scope, scope)))), Effect.sandbox, Effect.tapError(cause => Effect.logError("Defect building entity handlers", cause)), Effect.retry(defectRetryPolicy));
      const server = yield* RpcServer.makeNoSerialization(entity.protocol, {
        spanPrefix: `${entity.type}(${address.entityId})`,
        spanAttributes: {
          ...options.spanAttributes,
          "entity.type": entity.type,
          "entity.id": address.entityId
        },
        concurrency: options.concurrency ?? 1,
        disableFatalDefects: options.disableFatalDefects,
        onFromServer(response) {
          switch (response._tag) {
            case "Exit":
              {
                const request = activeRequests.get(response.requestId);
                if (!request) return Effect.void;
                request.sentReply = true;
                // For durable messages, ignore interrupts during shutdown.
                // They will be retried when the entity is restarted.
                // Also, if the request is uninterruptible, we ignore the
                // interrupt.
                if (storageEnabled && Context.get(request.message.annotations, Persisted) && Exit.hasInterrupts(response.exit) && (isShuttingDown || isUninterruptibleForServer(request.message.annotations))) {
                  if (!isShuttingDown) {
                    return server.write(0, {
                      ...request.message.envelope,
                      id: RequestId(request.message.envelope.requestId),
                      tag: request.message.envelope.tag,
                      payload: new Request({
                        ...request.message.envelope,
                        lastSentChunk: request.lastSentChunk
                      })
                    }).pipe(Effect.forkIn(scope));
                  }
                  activeRequests.delete(response.requestId);
                  return options.storage.unregisterReplyHandler(request.message.envelope.requestId);
                }
                return retryRespond(4, Effect.suspend(() => request.message.respond(new Reply.WithExit({
                  requestId: Snowflake.Snowflake(response.requestId),
                  id: snowflakeGen.nextUnsafe(),
                  exit: response.exit
                })))).pipe(Effect.flatMap(() => {
                  processedRequestIds.add(request.message.envelope.requestId);
                  activeRequests.delete(response.requestId);
                  // ensure that the reaper does not remove the entity as we haven't
                  // been "idle" yet
                  if (activeRequests.size === 0) {
                    state.lastActiveCheck = clock.currentTimeMillisUnsafe();
                  }
                  return Effect.void;
                }), Effect.orDie);
              }
            case "Chunk":
              {
                const request = activeRequests.get(response.requestId);
                if (!request) return Effect.void;
                const sequence = request.sequence;
                request.sequence++;
                if (!request.sentReply) {
                  request.sentReply = true;
                }
                return Effect.orDie(retryRespond(4, Effect.suspend(() => {
                  const reply = new Reply.Chunk({
                    requestId: Snowflake.Snowflake(response.requestId),
                    id: snowflakeGen.nextUnsafe(),
                    sequence,
                    values: response.values
                  });
                  request.lastSentChunk = Option.some(reply);
                  return request.message.respond(reply);
                })));
              }
            case "Defect":
              {
                return Effect.forkIn(onDefect(Cause.die(response.defect)), managerScope);
              }
            case "ClientEnd":
              {
                return endLatch.open;
              }
          }
        }
      }).pipe(Scope.provide(scope), Effect.provideContext(handlers));
      yield* Scope.addFinalizer(scope, Effect.sync(() => {
        isShuttingDown = true;
      }));
      if (defectRequestIds.length > 0) {
        for (const id of defectRequestIds) {
          const {
            lastSentChunk,
            message
          } = activeRequests.get(id);
          yield* server.write(0, {
            ...message.envelope,
            id: RequestId(message.envelope.requestId),
            tag: message.envelope.tag,
            payload: new Request({
              ...message.envelope,
              lastSentChunk
            })
          });
        }
        defectRequestIds = [];
      }
      return server.write;
    }));
    function onDefect(cause) {
      if (!activeServers.has(address.entityId)) {
        return endLatch.open;
      }
      const effect = writeRef.rebuildUnsafe();
      defectRequestIds = Array.from(activeRequests.keys());
      return Effect.logError("Defect in entity, restarting", cause).pipe(Effect.andThen(Effect.ignore(retryDriver(void 0))), Effect.flatMap(() => activeServers.has(address.entityId) ? effect : endLatch.open), Effect.annotateLogs({
        module: "EntityManager",
        address,
        runner: options.runnerAddress
      }), Effect.catchCause(onDefect));
    }
    const state = {
      scope,
      address,
      write(clientId, message) {
        if (writeRef.state.current._tag !== "Acquired") {
          return Effect.flatMap(writeRef.await, write => write(clientId, message));
        }
        return writeRef.state.current.value(clientId, message);
      },
      activeRequests,
      lastActiveCheck: clock.currentTimeMillisUnsafe(),
      keepAliveLatch,
      keepAliveEnabled: false
    };
    // During shutdown, signal that no more messages will be processed
    // and wait for the fiber to complete.
    //
    // If the termination timeout is reached, let the server clean itself up
    yield* Scope.addFinalizer(scope, Effect.withFiber(fiber => {
      activeServers.delete(address.entityId);
      serverCloseLatches.set(address, Latch.makeUnsafe());
      internalInterruptors.add(fiber.id);
      return state.write(0, {
        _tag: "Eof"
      }).pipe(Effect.andThen(Effect.interruptible(endLatch.await)), Effect.timeoutOption(config.entityTerminationTimeout));
    }));
    activeServers.set(address.entityId, state);
    return state;
  }, Effect.provideService(CurrentLogAnnotations, {})));
  const reaper = yield* EntityReaper;
  const maxIdleTime = Duration.toMillis(Duration.fromInputUnsafe(options.maxIdleTime ?? config.entityMaxIdleTime));
  if (Number.isFinite(maxIdleTime)) {
    yield* reaper.register({
      maxIdleTime,
      servers: activeServers,
      entities
    });
  }
  // update metrics for active servers
  const typeAttributes = Metric.CurrentMetricAttributes.context({
    type: entity.type
  });
  yield* Effect.sync(() => {
    ClusterMetrics.entities.updateUnsafe(BigInt(activeServers.size), typeAttributes);
  }).pipe(Effect.andThen(Effect.sleep(1000)), Effect.forever, Effect.forkIn(managerScope));
  function sendLocal(message) {
    return Effect.provideService(Effect.flatMap(entities.get(message.envelope.address), server => {
      switch (message._tag) {
        case "IncomingRequestLocal":
          {
            // If the request is already running, then we might have more than
            // one sender for the same request. In this case, the other senders
            // should resume from storage only.
            let entry = server.activeRequests.get(message.envelope.requestId);
            if (entry || processedRequestIds.has(message.envelope.requestId)) {
              return Effect.fail(new AlreadyProcessingMessage({
                envelopeId: message.envelope.requestId,
                address: message.envelope.address
              }));
            }
            const rpc = entityRpcs.get(message.envelope.tag);
            if (!storageEnabled && Context.get(message.annotations, Persisted)) {
              return Effect.die("EntityManager.sendLocal: Cannot process a persisted message without MessageStorage");
            }
            // Cluster internal RPCs
            // keep-alive RPC
            if (rpc._tag === KeepAliveRpc._tag) {
              const msg = message;
              const reply = Effect.suspend(() => Effect.orDie(retryRespond(4, msg.respond(new Reply.WithExit({
                requestId: message.envelope.requestId,
                id: snowflakeGen.nextUnsafe(),
                exit: Exit.void
              })))));
              if (server.keepAliveEnabled) return reply;
              server.keepAliveEnabled = true;
              return server.keepAliveLatch.whenOpen(Effect.suspend(() => {
                server.keepAliveEnabled = false;
                return reply;
              })).pipe(Effect.forkIn(server.scope, {
                startImmediately: true
              }), Effect.asVoid);
            }
            if (mailboxCapacity !== "unbounded" && server.activeRequests.size >= mailboxCapacity) {
              return Effect.fail(new MailboxFull({
                address: message.envelope.address
              }));
            }
            entry = {
              rpc,
              message,
              sentReply: false,
              lastSentChunk: Option.filter(message.lastSentReply, reply => reply._tag === "Chunk"),
              sequence: Option.match(message.lastSentReply, {
                onNone: () => 0,
                onSome: reply => reply._tag === "Chunk" ? reply.sequence + 1 : 0
              })
            };
            server.activeRequests.set(message.envelope.requestId, entry);
            let write = server.write(0, {
              ...message.envelope,
              id: RequestId(message.envelope.requestId),
              payload: new Request({
                ...message.envelope,
                lastSentChunk: Option.filter(message.lastSentReply, reply => reply._tag === "Chunk")
              })
            });
            if (Context.get(message.annotations, WithTransaction)) {
              write = options.storage.withTransaction(write);
            }
            return write;
          }
        case "IncomingEnvelope":
          {
            const entry = server.activeRequests.get(message.envelope.requestId);
            if (!entry) {
              return Effect.void;
            } else if (message.envelope._tag === "AckChunk" && Option.isSome(entry.lastSentChunk) && message.envelope.replyId !== entry.lastSentChunk.value.id) {
              return Effect.void;
            }
            return server.write(0, message.envelope._tag === "AckChunk" ? {
              _tag: "Ack",
              requestId: RequestId(message.envelope.requestId)
            } : {
              _tag: "Interrupt",
              requestId: RequestId(message.envelope.requestId),
              interruptors: []
            });
          }
      }
    }), CurrentLogAnnotations, {});
  }
  const decodeMessage = makeMessageDecode(entity, entityRpcs);
  const runFork = Effect.runForkWith(context);
  return identity({
    interruptShard: shardId => Effect.suspend(function loop() {
      const fibers = Arr.empty();
      activeServers.forEach(state => {
        if (shardId[Equal.symbol](state.address.shardId)) {
          fibers.push(runFork(entities.removeIgnore(state.address)));
        }
      });
      serverCloseLatches.forEach((latch, address) => {
        if (shardId[Equal.symbol](address.shardId)) {
          fibers.push(runFork(latch.await));
        }
      });
      if (fibers.length === 0) return Effect.void;
      return Effect.flatMap(Fiber.joinAll(fibers), loop);
    }),
    isProcessingFor(message, options) {
      if (options?.excludeReplies !== true && processedRequestIds.has(message.envelope.requestId)) {
        return true;
      }
      const state = activeServers.get(message.envelope.address.entityId);
      if (!state) return false;
      const request = state.activeRequests.get(message.envelope.requestId);
      if (request === undefined) {
        return false;
      } else if (options?.excludeReplies && request.sentReply) {
        return false;
      }
      return true;
    },
    clearProcessed() {
      processedRequestIds.clear();
    },
    sendLocal,
    send: message => decodeMessage(message).pipe(Effect.matchEffect({
      onFailure: cause => {
        if (message._tag === "IncomingEnvelope") {
          return Effect.die(new MalformedMessage({
            cause
          }));
        }
        return Effect.orDie(message.respond(new Reply.ReplyWithContext({
          reply: new Reply.WithExit({
            id: snowflakeGen.nextUnsafe(),
            requestId: message.envelope.requestId,
            exit: Exit.die(new MalformedMessage({
              cause
            }))
          }),
          rpc: entityRpcs.get(message.envelope.tag),
          context: context
        })));
      },
      onSuccess: decoded => {
        if (decoded._tag === "IncomingEnvelope") {
          return sendLocal(new Message.IncomingEnvelope(decoded));
        }
        const request = message;
        const rpc = entityRpcs.get(decoded.envelope.tag);
        return sendLocal(new Message.IncomingRequestLocal({
          annotations: Context.get(rpc.annotations, ClusterSchema.Dynamic)(rpc.annotations, decoded.envelope),
          envelope: decoded.envelope,
          lastSentReply: decoded.lastSentReply,
          respond: reply => request.respond(new Reply.ReplyWithContext({
            reply,
            rpc,
            context: context
          }))
        }));
      }
    }), Effect.provideContext(context)),
    activeEntityCount: Effect.sync(() => activeServers.size)
  });
});
const defaultRetryPolicy = /*#__PURE__*/Schedule.exponential(500, 1.5).pipe(/*#__PURE__*/Schedule.either(/*#__PURE__*/Schedule.spaced("10 seconds")));
const makeMessageDecode = (entity, entityRpcs) => {
  const decodeRequest = Effect.fnUntracedEager(function* (message, rpc) {
    const payload = yield* Schema.decodeEffect(Schema.toCodecJson(rpc.payloadSchema))(message.envelope.payload);
    const lastSentReply = Option.isNone(message.lastSentReply) ? message.lastSentReply : Option.some(yield* Schema.decodeEffect(Reply.Reply(rpc))(message.lastSentReply.value));
    return {
      _tag: "IncomingRequest",
      envelope: {
        ...message.envelope,
        payload
      },
      lastSentReply
    };
  });
  return message => {
    if (message._tag === "IncomingEnvelope") {
      return Effect.succeed(message);
    }
    const rpc = entityRpcs.get(message.envelope.tag);
    if (!rpc) {
      return Effect.fail(new Schema.SchemaError(new Issue.InvalidValue(Option.some(message), {
        message: `Unknown tag ${message.envelope.tag} for entity type ${entity.type}`
      })));
    }
    return decodeRequest(message, rpc);
  };
};
const retryRespond = (times, effect) => times === 0 ? effect : Effect.catch(effect, () => Effect.delay(retryRespond(times - 1, effect), 200));
//# sourceMappingURL=entityManager.js.map