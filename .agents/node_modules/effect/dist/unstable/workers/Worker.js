/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as FiberSet from "../../FiberSet.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as Scope from "../../Scope.js";
import { WorkerError, WorkerSendError } from "./WorkerError.js";
/**
 * @since 4.0.0
 * @category models
 */
export class WorkerPlatform extends /*#__PURE__*/Context.Service()("effect/workers/Worker/WorkerPlatform") {}
/**
 * @since 4.0.0
 * @category models
 */
export const makeUnsafe = options => ({
  send: options.send,
  run(handler, options_) {
    const onSpawn = options_?.onSpawn ?? Effect.void;
    return options.run(msg => {
      if (msg[0] === 0) return onSpawn;
      return handler(msg[1]);
    });
  }
});
/**
 * @since 4.0.0
 * @category tags
 */
export const Spawner = /*#__PURE__*/Context.Service("effect/workers/Worker/Spawner");
/**
 * @since 4.0.0
 * @category layers
 */
export const layerSpawner = /*#__PURE__*/Layer.succeed(Spawner);
/**
 * @since 4.0.0
 */
export const makePlatform = () => options => WorkerPlatform.of({
  spawn(id) {
    return Effect.gen(function* () {
      const spawn = yield* Spawner;
      let currentPort;
      const buffer = [];
      const run = (handler, opts) => Effect.uninterruptibleMask(restore => Effect.scopedWith(Effect.fnUntraced(function* (scope) {
        const port = yield* options.setup({
          worker: spawn(id),
          scope
        });
        yield* Scope.addFinalizer(scope, Effect.sync(() => {
          currentPort = undefined;
        }));
        const fiberSet = yield* FiberSet.make().pipe(Scope.provide(scope));
        const run = yield* FiberSet.runtime(fiberSet)();
        const ready = Latch.makeUnsafe();
        yield* options.listen({
          port,
          scope,
          emit(data) {
            if (data[0] === 0) {
              if (opts?.onSpawn) {
                run(Effect.ensuring(opts.onSpawn, ready.open));
              } else {
                ready.openUnsafe();
              }
              return;
            }
            run(handler(data[1]));
          },
          deferred: fiberSet.deferred
        });
        yield* ready.await;
        currentPort = port;
        if (buffer.length > 0) {
          for (const [message, transfers] of buffer) {
            port.postMessage([0, message], transfers);
          }
          buffer.length = 0;
        }
        return yield* restore(FiberSet.join(fiberSet));
      })));
      const send = (message, transfers) => Effect.suspend(() => {
        if (currentPort === undefined) {
          buffer.push([message, transfers]);
          return Effect.void;
        }
        try {
          currentPort.postMessage([0, message], transfers);
          return Effect.void;
        } catch (cause) {
          return Effect.fail(new WorkerError({
            reason: new WorkerSendError({
              message: "Failed to send message to worker",
              cause
            })
          }));
        }
      });
      return {
        run,
        send
      };
    });
  }
});
//# sourceMappingURL=Worker.js.map