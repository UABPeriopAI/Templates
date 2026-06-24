/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as Fiber from "../../Fiber.js";
import { constant } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Queue from "../../Queue.js";
import * as RpcServer from "../rpc/RpcServer.js";
import * as Message from "./Message.js";
import * as MessageStorage from "./MessageStorage.js";
import * as Reply from "./Reply.js";
import * as RunnerHealth from "./RunnerHealth.js";
import * as Runners from "./Runners.js";
import * as Sharding from "./Sharding.js";
import { ShardingConfig } from "./ShardingConfig.js";
const constVoid = /*#__PURE__*/constant(Effect.void);
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerHandlers = /*#__PURE__*/Runners.Rpcs.toLayer(/*#__PURE__*/Effect.gen(function* () {
  const sharding = yield* Sharding.Sharding;
  const storage = yield* MessageStorage.MessageStorage;
  return {
    Ping: () => Effect.void,
    Notify: ({
      envelope
    }) => sharding.notify(envelope._tag === "Request" ? new Message.IncomingRequest({
      envelope,
      respond: constVoid,
      lastSentReply: Option.none()
    }) : new Message.IncomingEnvelope({
      envelope
    })),
    Effect: ({
      persisted,
      request
    }) => {
      let replyEncoded = Option.none();
      let resume = reply => {
        replyEncoded = Option.some(reply);
      };
      const message = new Message.IncomingRequest({
        envelope: request,
        lastSentReply: Option.none(),
        respond(reply) {
          resume(Effect.orDie(Reply.serialize(reply)));
          return Effect.void;
        }
      });
      if (persisted) {
        return Effect.callback(resume_ => {
          resume = resume_;
          const parent = Fiber.getCurrent();
          const onExit = exit => {
            if (exit._tag === "Failure") {
              resume(exit);
            }
          };
          const runFork = Effect.runForkWith(parent.context);
          const fiber = runFork(storage.registerReplyHandler(message));
          fiber.addObserver(onExit);
          runFork(Effect.catchTag(sharding.notify(message, constWaitUntilRead), "AlreadyProcessingMessage", () => Effect.void)).addObserver(onExit);
          return Fiber.interrupt(fiber);
        });
      }
      return Effect.andThen(sharding.send(message), Effect.callback(resume_ => {
        if (Option.isSome(replyEncoded)) {
          resume_(replyEncoded.value);
        } else {
          resume = resume_;
        }
      }));
    },
    Stream: ({
      persisted,
      request
    }) => Effect.flatMap(Queue.make(), queue => {
      const message = new Message.IncomingRequest({
        envelope: request,
        lastSentReply: Option.none(),
        respond(reply) {
          return Effect.flatMap(Reply.serialize(reply), reply => {
            Queue.offerUnsafe(queue, reply);
            return Effect.void;
          });
        }
      });
      return Effect.as(persisted ? Effect.andThen(storage.registerReplyHandler(message).pipe(Effect.onError(cause => Queue.failCause(queue, cause)), Effect.forkScoped), sharding.notify(message, constWaitUntilRead)) : sharding.send(message), queue);
    }),
    Envelope: ({
      envelope
    }) => sharding.send(new Message.IncomingEnvelope({
      envelope
    }))
  };
}));
const constWaitUntilRead = {
  waitUntilRead: true
};
/**
 * The `RunnerServer` recieves messages from other Runners and forwards them to the
 * `Sharding` layer.
 *
 * It also responds to `Ping` requests.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/RpcServer.layer(Runners.Rpcs, {
  spanPrefix: "RunnerServer",
  disableTracing: true
}).pipe(/*#__PURE__*/Layer.provide(layerHandlers));
/**
 * A `RunnerServer` layer that includes the `Runners` & `Sharding` clients.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layerWithClients = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provideMerge(Sharding.layer), /*#__PURE__*/Layer.provideMerge(Runners.layerRpc));
/**
 * A `Runners` layer that is client only.
 *
 * It will not register with the ShardManager and recieve shard assignments,
 * so this layer can be used to embed a cluster client inside another effect
 * application.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layerClientOnly = /*#__PURE__*/Sharding.layer.pipe(/*#__PURE__*/Layer.provideMerge(Runners.layerRpc), /*#__PURE__*/Layer.provide(RunnerHealth.layerNoop), /*#__PURE__*/Layer.updateService(ShardingConfig, config => ({
  ...config,
  runnerAddress: Option.none()
})));
//# sourceMappingURL=RunnerServer.js.map