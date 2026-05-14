import * as Effect from "../../Effect.js";
import * as Semaphore from "../../Semaphore.js";
/**
 * @since 4.0.0
 */
export const withRun = () => f => Effect.suspend(() => {
  const semaphore = Semaphore.makeUnsafe(1);
  let buffer = [];
  let write = (...args) => Effect.contextWith(context => {
    buffer.push([args, context]);
    return Effect.void;
  });
  return Effect.map(f((...args) => write(...args)), a => ({
    ...a,
    run(f) {
      return semaphore.withPermits(1)(Effect.gen(function* () {
        const prev = write;
        write = f;
        for (const [args, context] of buffer) {
          yield* Effect.provideContext(Effect.suspend(() => f(...args)), context);
        }
        buffer = [];
        return yield* Effect.onExit(Effect.never, () => {
          write = prev;
          return Effect.void;
        });
      }));
    }
  }));
});
/**
 * @since 4.0.0
 */
export const withRunClient = f => Effect.suspend(() => {
  const clientIds = new Set();
  const clientBuffers = new Map();
  const clientWrites = new Map();
  let write = (clientId, data) => Effect.contextWith(context => {
    let buffer = clientBuffers.get(clientId);
    if (!buffer) {
      buffer = [];
      clientBuffers.set(clientId, buffer);
    }
    buffer.push([data, context]);
    return Effect.void;
  });
  return Effect.map(f((clientId, data) => {
    const clientWrite = clientWrites.get(clientId);
    if (clientWrite) {
      return clientWrite(data);
    }
    return write(clientId, data);
  }, clientIds), a => ({
    ...a,
    run(clientId, f) {
      return Effect.gen(function* () {
        clientIds.add(clientId);
        clientWrites.set(clientId, f);
        const buffer = clientBuffers.get(clientId);
        if (buffer) {
          clientBuffers.delete(clientId);
          for (const [args, context] of buffer) {
            yield* Effect.provideContext(Effect.suspend(() => f(args)), context);
          }
        }
        return yield* Effect.onExit(Effect.never, () => {
          clientIds.delete(clientId);
          clientWrites.delete(clientId);
          return Effect.void;
        });
      });
    }
  }));
});
//# sourceMappingURL=Utils.js.map