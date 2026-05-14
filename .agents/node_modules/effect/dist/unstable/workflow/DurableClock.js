/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Activity from "./Activity.js";
import * as DurableDeferred from "./DurableDeferred.js";
const TypeId = "~effect/workflow/DurableClock";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => ({
  [TypeId]: TypeId,
  name: options.name,
  duration: Duration.fromInputUnsafe(options.duration),
  deferred: DurableDeferred.make(`DurableClock/${options.name}`)
});
const EngineTag = /*#__PURE__*/Context.Service("effect/workflow/WorkflowEngine");
const InstanceTag = /*#__PURE__*/Context.Service("effect/workflow/WorkflowEngine/WorkflowInstance");
/**
 * @since 1.0.0
 * @category Sleeping
 */
export const sleep = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const duration = Duration.fromInputUnsafe(options.duration);
  if (Duration.isZero(duration)) {
    return;
  }
  const inMemoryThreshold = options.inMemoryThreshold ? Duration.fromInputUnsafe(options.inMemoryThreshold) : defaultInMemoryThreshold;
  if (Duration.isLessThanOrEqualTo(duration, inMemoryThreshold)) {
    return yield* Activity.make({
      name: `DurableClock/${options.name}`,
      execute: Effect.sleep(duration)
    });
  }
  const engine = yield* EngineTag;
  const instance = yield* InstanceTag;
  const clock = make(options);
  yield* engine.scheduleClock(instance.workflow, {
    executionId: instance.executionId,
    clock
  });
  return yield* DurableDeferred.await(clock.deferred);
});
const defaultInMemoryThreshold = /*#__PURE__*/Duration.seconds(60);
//# sourceMappingURL=DurableClock.js.map