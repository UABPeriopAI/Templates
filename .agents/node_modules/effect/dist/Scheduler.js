/**
 * @since 2.0.0
 */
import * as Context from "./Context.js";
/**
 * @since 4.0.0
 * @category references
 */
export const Scheduler = /*#__PURE__*/Context.Reference("effect/Scheduler", {
  defaultValue: () => new MixedScheduler()
});
const setImmediate = "setImmediate" in globalThis ? f => {
  // @ts-ignore
  const timer = globalThis.setImmediate(f);
  // @ts-ignore
  return () => globalThis.clearImmediate(timer);
} : f => {
  const timer = setTimeout(f, 0);
  return () => clearTimeout(timer);
};
class PriorityBuckets {
  buckets = [];
  scheduleTask(task, priority) {
    const buckets = this.buckets;
    const len = buckets.length;
    let bucket;
    let index = 0;
    for (; index < len; index++) {
      if (buckets[index][0] > priority) break;
      bucket = buckets[index];
    }
    if (bucket && bucket[0] === priority) {
      bucket[1].push(task);
    } else if (index === len) {
      buckets.push([priority, [task]]);
    } else {
      buckets.splice(index, 0, [priority, [task]]);
    }
  }
  drain() {
    const buckets = this.buckets;
    this.buckets = [];
    return buckets;
  }
}
/**
 * A scheduler implementation that provides efficient task scheduling
 * with support for both synchronous and asynchronous execution modes.
 *
 * Features:
 * - Batches tasks for efficient execution
 * - Supports priority-based task scheduling
 * - Configurable execution mode (sync/async)
 * - Automatic yielding based on operation count
 * - Optimized for high-throughput scenarios
 *
 * @since 2.0.0
 * @category schedulers
 */
export class MixedScheduler {
  executionMode;
  setImmediate;
  constructor(executionMode = "async", setImmediateFn = setImmediate) {
    this.executionMode = executionMode;
    this.setImmediate = setImmediateFn;
  }
  /**
   * @since 2.0.0
   */
  shouldYield(fiber) {
    return fiber.currentOpCount >= fiber.maxOpsBeforeYield;
  }
  /**
   * @since 2.0.0
   */
  makeDispatcher() {
    return new MixedSchedulerDispatcher(this.setImmediate);
  }
}
class MixedSchedulerDispatcher {
  tasks = /*#__PURE__*/new PriorityBuckets();
  running = undefined;
  setImmediate;
  constructor(setImmediateFn = setImmediate) {
    this.setImmediate = setImmediateFn;
  }
  /**
   * @since 2.0.0
   */
  scheduleTask(task, priority) {
    this.tasks.scheduleTask(task, priority);
    if (this.running === undefined) {
      this.running = this.setImmediate(this.afterScheduled);
    }
  }
  /**
   * @since 2.0.0
   */
  afterScheduled = () => {
    this.running = undefined;
    this.runTasks();
  };
  /**
   * @since 2.0.0
   */
  runTasks() {
    const buckets = this.tasks.drain();
    for (let i = 0; i < buckets.length; i++) {
      const toRun = buckets[i][1];
      for (let j = 0; j < toRun.length; j++) {
        toRun[j]();
      }
    }
  }
  /**
   * @since 2.0.0
   */
  flush() {
    while (this.tasks.buckets.length > 0) {
      if (this.running !== undefined) {
        this.running();
        this.running = undefined;
      }
      this.runTasks();
    }
  }
}
/**
 * A service reference that controls the maximum number of operations a fiber
 * can perform before yielding control back to the scheduler. This helps
 * prevent long-running fibers from monopolizing the execution thread.
 *
 * The default value is 2048 operations, which provides a good balance between
 * performance and fairness in concurrent execution.
 *
 * @since 4.0.0
 * @category references
 */
export const MaxOpsBeforeYield = /*#__PURE__*/Context.Reference("effect/Scheduler/MaxOpsBeforeYield", {
  defaultValue: () => 2048
});
/**
 * A service reference that controls whether the runtime should bypass scheduler
 * yield checks. When set to `true`, the fiber run loop won't call
 * `Scheduler.shouldYield`.
 *
 * @since 4.0.0
 * @category references
 */
export const PreventSchedulerYield = /*#__PURE__*/Context.Reference("effect/Scheduler/PreventSchedulerYield", {
  defaultValue: () => false
});
//# sourceMappingURL=Scheduler.js.map