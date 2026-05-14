/**
 * @since 4.0.0
 */
import * as Cache from "../../Cache.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import { constant, identity } from "../../Function.js";
import * as Persistence from "./Persistence.js";
const TypeId = "~effect/persistence/PersistedCache";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (lookup, options) {
  const store = yield* (yield* Persistence.Persistence).make({
    storeId: options.storeId,
    timeToLive: options.timeToLive
  });
  const inMemory = yield* Cache.makeWith(Effect.fnUntraced(function* (key) {
    const exit = yield* store.get(key);
    if (exit) {
      return yield* exit;
    }
    const result = yield* Effect.exit(lookup(key));
    yield* store.set(key, result);
    return yield* result;
  }), {
    timeToLive: options.inMemoryTTL ?? constant(Duration.seconds(10)),
    capacity: options.inMemoryCapacity ?? 1024,
    requireServicesAt: options.requireServicesAt
  });
  return identity({
    [TypeId]: TypeId,
    inMemory,
    get: key => Cache.get(inMemory, key),
    invalidate: key => Effect.flatMap(store.remove(key), () => Cache.invalidate(inMemory, key))
  });
});
//# sourceMappingURL=PersistedCache.js.map