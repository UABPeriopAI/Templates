import * as Context from "../Context.js";
import { dual } from "../Function.js";
import { makeEntry } from "../Request.js";
import { Scheduler } from "../Scheduler.js";
import { exitDie, isEffect } from "./core.js";
import * as effect from "./effect.js";
/** @internal */
export const request = /*#__PURE__*/dual(2, (self, resolver) => {
  const withResolver = resolver => effect.callback(resume => {
    const entry = addEntry(resolver, self, resume, effect.getCurrentFiber());
    return maybeRemoveEntry(resolver, entry);
  });
  return isEffect(resolver) ? effect.flatMap(resolver, withResolver) : withResolver(resolver);
});
/** @internal */
export const requestUnsafe = (self, options) => {
  const entry = addEntry(options.resolver, self, options.onExit, {
    context: options.context,
    currentScheduler: Context.get(options.context, Scheduler)
  });
  return () => removeEntryUnsafe(options.resolver, entry);
};
const batchPool = [];
const pendingBatches = /*#__PURE__*/new Map();
const addEntry = (resolver, request, resume, fiber) => {
  let batchMap = pendingBatches.get(resolver);
  if (!batchMap) {
    batchMap = new Map();
    pendingBatches.set(resolver, batchMap);
  }
  let batch;
  let completed = false;
  const entry = makeEntry({
    request,
    context: fiber.context,
    uninterruptible: false,
    completeUnsafe(effect) {
      if (completed) return;
      completed = true;
      resume(effect);
      batch?.entrySet.delete(entry);
    }
  });
  if (resolver.preCheck !== undefined && !resolver.preCheck(entry)) {
    return entry;
  }
  const key = resolver.batchKey(entry);
  batch = batchMap.get(key);
  if (!batch) {
    if (batchPool.length > 0) {
      batch = batchPool.pop();
      batch.key = key;
      batch.resolver = resolver;
      batch.map = batchMap;
    } else {
      const newBatch = {
        key,
        resolver,
        map: batchMap,
        entrySet: new Set(),
        entries: new Set(),
        delayEffect: effect.flatMap(effect.suspend(() => newBatch.resolver.delay), _ => runBatch(newBatch)),
        run: effect.onExit(effect.suspend(() => newBatch.resolver.runAll(Array.from(newBatch.entries), newBatch.key)), exit => {
          for (const entry of newBatch.entrySet) {
            entry.completeUnsafe(exit._tag === "Success" ? exitDie(new Error("Effect.request: RequestResolver did not complete request", {
              cause: entry.request
            })) : exit);
          }
          newBatch.entries.clear();
          if (batchPool.length < 128) {
            newBatch.entrySet.clear();
            newBatch.key = undefined;
            newBatch.fiber = undefined;
            batchPool.push(newBatch);
          }
          return effect.void;
        })
      };
      batch = newBatch;
    }
    batchMap.set(key, batch);
    batch.fiber = effect.runForkWith(fiber.context)(batch.delayEffect, {
      scheduler: fiber.currentScheduler
    });
  }
  batch.entrySet.add(entry);
  batch.entries.add(entry);
  if (batch.resolver.collectWhile(batch.entries)) return entry;
  batch.fiber.interruptUnsafe(fiber.id);
  batch.fiber = effect.runForkWith(fiber.context)(runBatch(batch), {
    scheduler: fiber.currentScheduler
  });
  return entry;
};
const removeEntryUnsafe = (resolver, entry) => {
  if (entry.uninterruptible) return;
  const batchMap = pendingBatches.get(resolver);
  if (!batchMap) return;
  const key = resolver.batchKey(entry.request);
  const batch = batchMap.get(key);
  if (!batch) return;
  batch.entries.delete(entry);
  batch.entrySet.delete(entry);
  if (batch.entries.size === 0) {
    batchMap.delete(key);
    batch.fiber?.interruptUnsafe();
  }
};
const maybeRemoveEntry = (resolver, entry) => effect.sync(() => removeEntryUnsafe(resolver, entry));
function runBatch(batch) {
  if (!batch.map.has(batch.key)) return effect.void;
  batch.map.delete(batch.key);
  return batch.run;
}
//# sourceMappingURL=request.js.map