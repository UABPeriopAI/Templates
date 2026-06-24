/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import { Sharding } from "./Sharding.js";
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = (name, run, options) => Layer.effectDiscard(Effect.gen(function* () {
  const sharding = yield* Sharding;
  yield* sharding.registerSingleton(name, run, options);
}));
//# sourceMappingURL=Singleton.js.map