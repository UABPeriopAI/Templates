import * as Context from "./Context.js";
import { constant } from "./Function.js";
import * as effect from "./internal/effect.js";
import * as Layer from "./Layer.js";
import { pipeArguments } from "./Pipeable.js";
import * as Predicate from "./Predicate.js";
/**
 * @since 3.16.0
 * @category Type IDs
 */
export const TypeId = "~effect/ExecutionPlan";
/**
 * @since 3.16.0
 * @category Guards
 */
export const isExecutionPlan = u => Predicate.hasProperty(u, TypeId);
/**
 * Create an `ExecutionPlan`, which can be used with `Effect.withExecutionPlan` or `Stream.withExecutionPlan`, allowing you to provide different resources for each step of execution until the effect succeeds or the plan is exhausted.
 *
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect, ExecutionPlan, Schedule } from "effect"
 * import type { LanguageModel } from "effect/unstable/ai"
 *
 * declare const layerBad: Layer.Layer<LanguageModel.LanguageModel>
 * declare const layerGood: Layer.Layer<LanguageModel.LanguageModel>
 *
 * const ThePlan = ExecutionPlan.make(
 *   {
 *     // First try with the bad layer 2 times with a 3 second delay between attempts
 *     provide: layerBad,
 *     attempts: 2,
 *     schedule: Schedule.spaced(3000)
 *   },
 *   // Then try with the bad layer 3 times with a 1 second delay between attempts
 *   {
 *     provide: layerBad,
 *     attempts: 3,
 *     schedule: Schedule.spaced(1000)
 *   },
 *   // Finally try with the good layer.
 *   //
 *   // If `attempts` is omitted, the plan will only attempt once, unless a schedule is provided.
 *   {
 *     provide: layerGood
 *   }
 * )
 *
 * declare const effect: Effect.Effect<
 *   void,
 *   never,
 *   LanguageModel.LanguageModel
 * >
 * const withPlan: Effect.Effect<void> = Effect.withExecutionPlan(effect, ThePlan)
 * ```
 *
 * @since 3.16.0
 * @category Constructors
 */
export const make = (...steps) => makeProto(steps.map((options, i) => {
  if (options.attempts && options.attempts < 1) {
    throw new Error(`ExecutionPlan.make: step[${i}].attempts must be greater than 0`);
  }
  return {
    schedule: options.schedule,
    attempts: options.attempts,
    while: options.while ? input => effect.suspend(() => {
      const result = options.while(input);
      return typeof result === "boolean" ? effect.succeed(result) : result;
    }) : undefined,
    provide: options.provide
  };
}));
const Proto = {
  [TypeId]: TypeId,
  get withRequirements() {
    const self = this;
    return effect.contextWith(context => effect.succeed(makeProto(self.steps.map(step => ({
      ...step,
      provide: Layer.isLayer(step.provide) ? Layer.provide(step.provide, Layer.succeedContext(context)) : step.provide
    })))));
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makeProto = steps => {
  const self = Object.create(Proto);
  self.steps = steps;
  return self;
};
/**
 * @since 3.16.0
 * @category Combining
 */
export const merge = (...plans) => makeProto(plans.flatMap(plan => plan.steps));
/**
 * @since 4.0.0
 * @category Metadata
 */
export const CurrentMetadata = /*#__PURE__*/Context.Reference("effect/ExecutionPlan/CurrentMetadata", {
  defaultValue: /*#__PURE__*/constant({
    attempt: 0,
    stepIndex: 0
  })
});
//# sourceMappingURL=ExecutionPlan.js.map