import * as Api from "../ExecutionPlan.js";
import { dual } from "../Function.js";
import * as Result from "../Result.js";
import * as Schedule from "../Schedule.js";
import * as effect from "./effect.js";
import * as internalLayer from "./layer.js";
import * as internalSchedule from "./schedule.js";
/** @internal */
export const withExecutionPlan = /*#__PURE__*/dual(2, (self, plan) => effect.suspend(() => {
  let i = 0;
  let meta = {
    attempt: 0,
    stepIndex: 0
  };
  const provideMeta = effect.provideServiceEffect(Api.CurrentMetadata, effect.sync(() => {
    meta = {
      attempt: meta.attempt + 1,
      stepIndex: i
    };
    return meta;
  }));
  let result;
  return effect.flatMap(effect.whileLoop({
    while: () => i < plan.steps.length && (result === undefined || Result.isFailure(result)),
    body() {
      const step = plan.steps[i];
      let nextEffect = provideMeta(internalLayer.provide(self, step.provide));
      if (result) {
        let attempted = false;
        const wrapped = nextEffect;
        // ensure the schedule is applied at least once
        nextEffect = effect.suspend(() => {
          if (attempted) return wrapped;
          attempted = true;
          return result.asEffect();
        });
        nextEffect = internalSchedule.retry(nextEffect, scheduleFromStep(step, false));
      } else {
        const schedule = scheduleFromStep(step, true);
        nextEffect = schedule ? internalSchedule.retry(nextEffect, schedule) : nextEffect;
      }
      return effect.result(nextEffect);
    },
    step(result_) {
      result = result_;
      i++;
    }
  }), () => result.asEffect());
}));
/** @internal */
export const scheduleFromStep = (step, first) => {
  if (!first) {
    return internalSchedule.buildFromOptions({
      schedule: step.schedule ? step.schedule : step.attempts ? undefined : scheduleOnce,
      times: step.attempts,
      while: step.while
    });
  } else if (step.attempts === 1 || !(step.schedule || step.attempts)) {
    return undefined;
  }
  return internalSchedule.buildFromOptions({
    schedule: step.schedule,
    while: step.while,
    times: step.attempts ? step.attempts - 1 : undefined
  });
};
const scheduleOnce = /*#__PURE__*/Schedule.recurs(1);
//# sourceMappingURL=executionPlan.js.map