/**
 * @since 4.0.0
 */
import { isArrayNonEmpty } from "../../Array.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as MutableHashMap from "../../MutableHashMap.js";
import * as MachineId from "./MachineId.js";
import { Runner } from "./Runner.js";
import * as ShardId from "./ShardId.js";
/**
 * Represents a generic interface to the persistent storage required by the
 * cluster.
 *
 * @since 4.0.0
 * @category models
 */
export class RunnerStorage extends /*#__PURE__*/Context.Service()("effect/cluster/RunnerStorage") {}
/**
 * @since 4.0.0
 * @category layers
 */
export const makeEncoded = encoded => RunnerStorage.of({
  getRunners: Effect.gen(function* () {
    const runners = yield* encoded.getRunners;
    const results = [];
    for (let i = 0; i < runners.length; i++) {
      const [runner, healthy] = runners[i];
      // @effect-diagnostics-next-line tryCatchInEffectGen:off
      try {
        results.push([Runner.decodeSync(runner), healthy]);
      } catch {
        //
      }
    }
    return results;
  }),
  register: (runner, healthy) => Effect.map(encoded.register(encodeRunnerAddress(runner.address), Runner.encodeSync(runner), healthy), MachineId.make),
  unregister: address => encoded.unregister(encodeRunnerAddress(address)),
  setRunnerHealth: (address, healthy) => encoded.setRunnerHealth(encodeRunnerAddress(address), healthy),
  acquire: (address, shardIds) => {
    const arr = Array.from(shardIds, id => id.toString());
    if (!isArrayNonEmpty(arr)) return Effect.succeed([]);
    return encoded.acquire(encodeRunnerAddress(address), arr).pipe(Effect.map(shards => shards.map(ShardId.fromString)));
  },
  refresh: (address, shardIds) => encoded.refresh(encodeRunnerAddress(address), Array.from(shardIds, id => id.toString())).pipe(Effect.map(shards => shards.map(ShardId.fromString))),
  release(address, shardId) {
    return encoded.release(encodeRunnerAddress(address), shardId.toString());
  },
  releaseAll(address) {
    return encoded.releaseAll(encodeRunnerAddress(address));
  }
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeMemory = /*#__PURE__*/Effect.gen(function* () {
  const runners = MutableHashMap.empty();
  let acquired = [];
  let id = 0;
  return RunnerStorage.of({
    getRunners: Effect.sync(() => Array.from(MutableHashMap.values(runners), runner => [runner, true])),
    register: runner => Effect.sync(() => {
      MutableHashMap.set(runners, runner.address, runner);
      return MachineId.make(id++);
    }),
    unregister: address => Effect.sync(() => {
      MutableHashMap.remove(runners, address);
    }),
    setRunnerHealth: () => Effect.void,
    acquire: (_address, shardIds) => {
      acquired = Array.from(shardIds);
      return Effect.succeed(Array.from(shardIds));
    },
    refresh: () => Effect.sync(() => acquired),
    release: () => Effect.void,
    releaseAll: () => Effect.void
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerMemory = /*#__PURE__*/Layer.effect(RunnerStorage)(makeMemory);
// -------------------------------------------------------------------------------------
// internal
// -------------------------------------------------------------------------------------
const encodeRunnerAddress = runnerAddress => `${runnerAddress.host}:${runnerAddress.port}`;
//# sourceMappingURL=RunnerStorage.js.map