/**
 * @since 2.0.0
 */
import * as Context from "./Context.ts";
import type * as Fiber from "./Fiber.ts";
/**
 * A scheduler manages the execution of Effects by controlling when and how tasks
 * are scheduled and executed. It determines the execution mode (synchronous or
 * asynchronous) and handles task prioritization and yielding behavior.
 *
 * The scheduler is responsible for:
 * - Scheduling tasks with different priorities
 * - Determining when fibers should yield control
 * - Managing the execution flow of Effects
 *
 * @since 2.0.0
 * @category models
 */
export interface Scheduler {
    readonly executionMode: "sync" | "async";
    shouldYield(fiber: Fiber.Fiber<unknown, unknown>): boolean;
    makeDispatcher(): SchedulerDispatcher;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface SchedulerDispatcher {
    scheduleTask(task: () => void, priority: number): void;
    flush(): void;
}
/**
 * @since 4.0.0
 * @category references
 */
export declare const Scheduler: Context.Reference<Scheduler>;
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
export declare class MixedScheduler implements Scheduler {
    readonly executionMode: "sync" | "async";
    readonly setImmediate: (f: () => void) => () => void;
    constructor(executionMode?: "sync" | "async", setImmediateFn?: (f: () => void) => () => void);
    /**
     * @since 2.0.0
     */
    shouldYield(fiber: Fiber.Fiber<unknown, unknown>): boolean;
    /**
     * @since 2.0.0
     */
    makeDispatcher(): MixedSchedulerDispatcher;
}
declare class MixedSchedulerDispatcher implements SchedulerDispatcher {
    private tasks;
    private running;
    readonly setImmediate: (f: () => void) => () => void;
    constructor(setImmediateFn?: (f: () => void) => () => void);
    /**
     * @since 2.0.0
     */
    scheduleTask(task: () => void, priority: number): void;
    /**
     * @since 2.0.0
     */
    afterScheduled: () => void;
    /**
     * @since 2.0.0
     */
    runTasks(): void;
    /**
     * @since 2.0.0
     */
    flush(): void;
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
export declare const MaxOpsBeforeYield: Context.Reference<number>;
/**
 * A service reference that controls whether the runtime should bypass scheduler
 * yield checks. When set to `true`, the fiber run loop won't call
 * `Scheduler.shouldYield`.
 *
 * @since 4.0.0
 * @category references
 */
export declare const PreventSchedulerYield: Context.Reference<boolean>;
export {};
//# sourceMappingURL=Scheduler.d.ts.map