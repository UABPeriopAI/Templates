/**
 * This module provides utilities for creating and composing schedules for retrying operations,
 * repeating effects, and implementing various timing strategies.
 *
 * A Schedule is a function that takes an input and returns a decision whether to continue or halt,
 * along with a delay duration. Schedules can be combined, transformed, and used to implement
 * sophisticated retry and repetition logic.
 *
 * @example
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // Retry with exponential backoff
 * const retryPolicy = Schedule.exponential("100 millis", 2.0)
 *   .pipe(Schedule.both(Schedule.recurs(3)))
 *
 * const program = Effect.gen(function*() {
 *   // This will retry up to 3 times with exponential backoff
 *   const result = yield* Effect.retry(
 *     Effect.fail("Network error"),
 *     retryPolicy
 *   )
 * })
 *
 * // Repeat on a fixed schedule
 * const heartbeat = Effect.log("heartbeat")
 *   .pipe(Effect.repeat(Schedule.spaced("30 seconds")))
 * ```
 *
 * @since 2.0.0
 */
import * as Cause from "./Cause.js";
import * as Context from "./Context.js";
import * as Cron from "./Cron.js";
import * as Duration from "./Duration.js";
import { constant, dual, identity } from "./Function.js";
import { isEffect } from "./internal/core.js";
import * as effect from "./internal/effect.js";
import * as random from "./internal/random.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as Pull from "./Pull.js";
import * as Result from "./Result.js";
const TypeId = "~effect/Schedule";
const randomNext = /*#__PURE__*/random.Random.useSync(random => random.nextDoubleUnsafe());
/**
 * @since 4.0.0
 * @category Metadata
 */
export const CurrentMetadata = /*#__PURE__*/Context.Reference("effect/Schedule/CurrentMetadata", {
  defaultValue: /*#__PURE__*/constant({
    input: undefined,
    output: undefined,
    duration: Duration.zero,
    attempt: 0,
    start: 0,
    now: 0,
    elapsed: 0,
    elapsedSincePrevious: 0
  })
});
const ScheduleProto = {
  [TypeId]: {
    _Out: identity,
    _In: identity,
    _Env: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Type guard that checks if a value is a Schedule.
 *
 * @example
 * ```ts
 * import { Schedule } from "effect"
 *
 * const schedule = Schedule.exponential("100 millis")
 * const notSchedule = { foo: "bar" }
 *
 * console.log(Schedule.isSchedule(schedule)) // true
 * console.log(Schedule.isSchedule(notSchedule)) // false
 * console.log(Schedule.isSchedule(null)) // false
 * console.log(Schedule.isSchedule(undefined)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export const isSchedule = u => hasProperty(u, TypeId);
/**
 * Creates a Schedule from a step function that returns a Pull.
 *
 * @example
 * ```ts
 * import { Schedule } from "effect"
 *
 * // fromStep is an advanced function for creating custom schedules
 * // It requires a step function that returns a Pull value
 *
 * // Most users should use simpler schedule constructors like:
 * const simpleSchedule = Schedule.exponential("100 millis")
 * const spacedSchedule = Schedule.spaced("1 second")
 * const recurringSchedule = Schedule.recurs(5)
 *
 * // These can be combined and transformed as needed
 * const complexSchedule = simpleSchedule.pipe(
 *   Schedule.both(Schedule.recurs(3))
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromStep = step => {
  const self = Object.create(ScheduleProto);
  self.step = step;
  return self;
};
const metadataFn = () => {
  let n = 0;
  let previous;
  let start;
  return (now, input) => {
    if (start === undefined) start = now;
    const elapsed = now - start;
    const elapsedSincePrevious = previous === undefined ? 0 : now - previous;
    previous = now;
    return {
      input,
      attempt: ++n,
      start,
      now,
      elapsed,
      elapsedSincePrevious
    };
  };
};
/**
 * Creates a Schedule from a step function that receives metadata about the schedule's execution.
 *
 * @example
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // fromStepWithMetadata is an advanced function for creating schedules
 * // that need access to execution metadata like timing and recurrence count
 *
 * // Most users should use simpler metadata-aware functions like:
 * const metadataSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.collectWhile((metadata) => Effect.succeed(metadata.attempt <= 5))
 * )
 *
 * // Or use existing schedules with metadata transformations:
 * const conditionalSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.tapOutput((output) => Effect.log(`Output: ${output}`))
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromStepWithMetadata = step => fromStep(effect.map(step, f => {
  const meta = metadataFn();
  return (now, input) => f(meta(now, input));
}));
/**
 * Extracts the step function from a Schedule.
 *
 * @example
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // Extract step function from an existing schedule
 * const schedule = Schedule.exponential("100 millis").pipe(Schedule.take(3))
 *
 * const program = Effect.gen(function*() {
 *   const stepFn = yield* Schedule.toStep(schedule)
 *
 *   // Use the step function directly for custom logic
 *   const now = Date.now()
 *   const result = yield* stepFn(now, "input")
 *
 *   console.log(`Step result: ${result}`)
 * })
 * ```
 *
 * @since 4.0.0
 * @category destructors
 */
export const toStep = schedule => effect.catchCause(schedule.step, cause => effect.succeed(() => effect.failCause(cause)));
/**
 * Extracts a step function from a Schedule that provides metadata about each
 * execution. It will also handle sleeping for the computed delay.
 *
 * @since 4.0.0
 * @category destructors
 */
export const toStepWithMetadata = schedule => effect.clockWith(clock => effect.map(toStep(schedule), step => {
  const metaFn = metadataFn();
  return input => effect.suspend(() => {
    const now = clock.currentTimeMillisUnsafe();
    return effect.flatMap(step(now, input), ([output, duration]) => {
      const meta = metaFn(now, input);
      meta.output = output;
      meta.duration = duration;
      return effect.as(effect.sleep(duration), meta);
    });
  });
}));
/**
 * Extracts a step function from a Schedule that automatically handles sleep delays.
 *
 * @example
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // Convert schedule to step function with automatic sleeping
 * const schedule = Schedule.spaced("1 second").pipe(Schedule.take(3))
 *
 * const program = Effect.gen(function*() {
 *   const stepWithSleep = yield* Schedule.toStepWithSleep(schedule)
 *
 *   // Each call will automatically sleep for the scheduled delay
 *   console.log("Starting...")
 *   const result1 = yield* stepWithSleep("first")
 *   console.log(`First result: ${result1}`)
 *
 *   const result2 = yield* stepWithSleep("second")
 *   console.log(`Second result: ${result2}`)
 *
 *   const result3 = yield* stepWithSleep("third")
 *   console.log(`Third result: ${result3}`)
 * })
 * ```
 *
 * @since 4.0.0
 * @category destructors
 */
export const toStepWithSleep = schedule => effect.map(toStepWithMetadata(schedule), step => input => effect.map(step(input), meta => meta.output));
/**
 * Returns a new `Schedule` that adds the delay computed by the specified
 * effectful function to the the next recurrence of the schedule.
 *
 * @example
 * ```ts
 * import { Console, Data, Duration, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Add random jitter to schedule delays
 * const jitteredSchedule = Schedule.addDelay(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(5)),
 *   (output) =>
 *     // Add random jitter between 0-50ms
 *     Effect.succeed(Duration.millis(Math.random() * 50))
 * )
 *
 * const jitterProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "jittered task"
 *     }),
 *     jitteredSchedule.pipe(
 *       Schedule.tapOutput((delay) =>
 *         Console.log(`Base delay with jitter applied`)
 *       )
 *     )
 *   )
 * })
 *
 * // Add adaptive delay based on execution count
 * const adaptiveSchedule = Schedule.addDelay(
 *   Schedule.recurs(6),
 *   (executionCount) =>
 *     // Increase delay as execution count grows
 *     Effect.succeed(Duration.millis(executionCount * 200))
 * )
 *
 * const adaptiveProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Adaptive delay task")
 *       return "adaptive"
 *     }),
 *     adaptiveSchedule.pipe(
 *       Schedule.tapOutput((count) =>
 *         Console.log(`Execution ${count + 1} with adaptive delay`)
 *       )
 *     )
 *   )
 * })
 *
 * // Add effectful delay computation
 * const dynamicSchedule = Schedule.addDelay(
 *   Schedule.spaced("1 second").pipe(Schedule.take(4)),
 *   (executionNumber) =>
 *     // Simulate checking system load and return additional delay
 *     Effect.succeed(Duration.millis(Math.random() > 0.7 ? 2000 : 500))
 * )
 *
 * const dynamicProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Dynamic delay task")
 *       return "dynamic"
 *     }),
 *     dynamicSchedule
 *   )
 * })
 *
 * // Add delay based on previous execution results (30% extra)
 * const resultBasedSchedule = Schedule.addDelay(
 *   Schedule.fibonacci("200 millis").pipe(Schedule.take(5)),
 *   (fibonacciDelay) =>
 *     Effect.succeed(Duration.millis(Duration.toMillis(fibonacciDelay) * 0.3))
 * )
 *
 * const resultProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Result-based delay task")
 *       return Math.random()
 *     }),
 *     resultBasedSchedule.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))
 *     )
 *   )
 * })
 *
 * // Combine with retry for progressive backoff
 * const progressiveRetrySchedule = Schedule.addDelay(
 *   Schedule.exponential("50 millis").pipe(Schedule.take(4)),
 *   () => Effect.succeed(Duration.millis(100)) // Fixed additional delay
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 5) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     progressiveRetrySchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const addDelay = /*#__PURE__*/dual(2, (self, f) => modifyDelay(self, (output, delay) => effect.map(f(output), d => Duration.sum(Duration.fromInputUnsafe(d), Duration.fromInputUnsafe(delay)))));
/**
 * Returns a new `Schedule` that will first execute the left (i.e. `self`)
 * schedule to completion. Once the left schedule is complete, the right (i.e.
 * `other`) schedule will be executed to completion.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // First retry 3 times quickly, then switch to slower retries
 * const quickRetries = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3)
 * )
 * const slowRetries = Schedule.exponential("1 second").pipe(
 *   Schedule.take(2)
 * )
 *
 * const combinedRetries = Schedule.andThen(quickRetries, slowRetries)
 *
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 *   yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *       if (attempt < 6) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Failure ${attempt}` }))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     combinedRetries
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const andThen = /*#__PURE__*/dual(2, (self, other) => map(andThenResult(self, other), result => effect.succeed(Result.merge(result))));
/**
 * Returns a new `Schedule` that will first execute the left (i.e. `self`)
 * schedule to completion. Once the left schedule is complete, the right (i.e.
 * `other`) schedule will be executed to completion.
 *
 * The output of the resulting schedule is a `Result` where outputs of the
 * left schedule are emitted as `Result.Err<Output>` and outputs of the right
 * schedule are emitted as `Result.Ok<Output>`.
 *
 * @example
 * ```ts
 * import { Console, Effect, Result, Schedule } from "effect"
 *
 * // Track which phase of the schedule we're in
 * const phaseTracker = Schedule.andThenResult(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(2)),
 *   Schedule.spaced("500 millis").pipe(Schedule.take(2))
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
 *     }),
 *     phaseTracker.pipe(
 *       Schedule.tapOutput((result) =>
 *         Result.match(result, {
 *           onFailure: (phase1Output) => Console.log(`Phase 1: ${phase1Output}`),
 *           onSuccess: (phase2Output) => Console.log(`Phase 2: ${phase2Output}`)
 *         })
 *       )
 *     )
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const andThenResult = /*#__PURE__*/dual(2, (self, other) => fromStep(effect.sync(() => {
  let currentSide = 0;
  let currentStep;
  const left = map(self, Result.succeed);
  const right = map(other, Result.fail);
  return function recur(now, input) {
    if (currentStep) return currentStep(now, input);
    return toStep(currentSide === 0 ? left : right).pipe(effect.flatMap(step => {
      currentSide++;
      if (currentSide === 1) {
        currentStep = (now, input) => Pull.catchDone(step(now, input), _ => {
          currentStep = undefined;
          return recur(now, input);
        });
        return currentStep(now, input);
      }
      currentStep = step;
      return currentStep(now, input);
    }));
  };
})));
/**
 * Combines two `Schedule`s by recurring if both of the two schedules want
 * to recur, using the maximum of the two durations between recurrences and
 * outputting a tuple of the outputs of both schedules.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Both schedules must want to continue for the combined schedule to continue
 * const timeLimit = Schedule.spaced("1 second").pipe(Schedule.take(5)) // max 5 times
 * const attemptLimit = Schedule.recurs(3) // max 3 attempts
 *
 * // Continues only while BOTH schedules want to continue (intersection/AND logic)
 * const bothSchedule = Schedule.both(timeLimit, attemptLimit)
 * // Outputs: [time_result, attempt_count] tuple
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "task completed"
 *     }),
 *     bothSchedule.pipe(
 *       Schedule.tapOutput(([timeResult, attemptResult]) =>
 *         Console.log(`Time: ${timeResult}, Attempts: ${attemptResult}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log("Completed all executions")
 * })
 *
 * // Both with different delay strategies - uses maximum delay
 * const fastSchedule = Schedule.fixed("500 millis").pipe(Schedule.take(4))
 * const slowSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(6))
 *
 * // Will use the slower (maximum) delay and stop when first schedule exhausts
 * const conservativeSchedule = Schedule.both(fastSchedule, slowSchedule)
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (attempt < 3) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     conservativeSchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Both provides intersection semantics (AND logic)
 * // Compare with either which provides union semantics (OR logic)
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const both = /*#__PURE__*/dual(2, (self, other) => bothWith(self, other, (left, right) => [left, right]));
/**
 * Combines two `Schedule`s by recurring if both of the two schedules want
 * to recur, using the maximum of the two durations between recurrences and
 * outputting the result of the left schedule (i.e. `self`).
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine two schedules, keeping left output
 * const leftSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("left-result"))
 * )
 * const rightSchedule = Schedule.spaced("50 millis")
 *
 * const combined = Schedule.bothLeft(leftSchedule, rightSchedule)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(3))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const bothLeft = /*#__PURE__*/dual(2, (self, other) => bothWith(self, other, output => output));
/**
 * Combines two `Schedule`s by recurring if both of the two schedules want
 * to recur, using the maximum of the two durations between recurrences and
 * outputting the result of the right schedule (i.e. `other`).
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine two schedules, keeping right output
 * const leftSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("left-result"))
 * )
 * const rightSchedule = Schedule.spaced("50 millis").pipe(
 *   Schedule.map(() => Effect.succeed("right-result"))
 * )
 *
 * const combined = Schedule.bothRight(leftSchedule, rightSchedule)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(3))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const bothRight = /*#__PURE__*/dual(2, (self, other) => bothWith(self, other, (_, output) => output));
/**
 * Combines two `Schedule`s by recurring if both of the two schedules want
 * to recur, using the maximum of the two durations between recurrences and
 * outputting the result of the combination of both schedule outputs using the
 * specified `combine` function.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine two schedules with custom output combination
 * const leftSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("left"))
 * )
 * const rightSchedule = Schedule.spaced("50 millis").pipe(
 *   Schedule.map(() => Effect.succeed("right"))
 * )
 *
 * const combined = Schedule.bothWith(
 *   leftSchedule,
 *   rightSchedule,
 *   (left, right) => `${left}-${right}`
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
 *     }),
 *     combined.pipe(Schedule.take(3))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const bothWith = /*#__PURE__*/dual(3, (self, other, combine) => fromStep(effect.map(effect.zip(toStep(self), toStep(other)), ([stepLeft, stepRight]) => (now, input) => Pull.matchEffect(stepLeft(now, input), {
  onSuccess: leftResult => stepRight(now, input).pipe(effect.map(rightResult => [combine(leftResult[0], rightResult[0]), Duration.max(leftResult[1], rightResult[1])]), Pull.catchDone(rightDone => Cause.done(combine(leftResult[0], rightDone)))),
  onDone: leftDone => stepRight(now, input).pipe(effect.flatMap(rightResult => Cause.done(combine(leftDone, rightResult[0]))), Pull.catchDone(rightDone => Cause.done(combine(leftDone, rightDone)))),
  onFailure: effect.failCause
}))));
/**
 * Returns a new `Schedule` that always recurs, collecting all inputs of the
 * schedule into an array.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Collect all inputs passed to the schedule
 * const inputCollector = Schedule.collectInputs(
 *   Schedule.spaced("100 millis")
 * )
 *
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       counter++
 *       yield* Console.log(`Iteration ${counter}`)
 *       return `result-${counter}`
 *     }),
 *     inputCollector.pipe(Schedule.take(4))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const collectInputs = self => collectWhile(passthrough(self), () => effect.succeed(true));
/**
 * Returns a new `Schedule` that always recurs, collecting all outputs of the
 * schedule into an array.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Collect all outputs from the schedule
 * const outputCollector = Schedule.collectOutputs(
 *   Schedule.recurs(4)
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
 *     }),
 *     outputCollector.pipe(Schedule.take(4))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const collectOutputs = self => collectWhile(self, () => effect.succeed(true));
/**
 * Returns a new `Schedule` that recurs as long as the specified `predicate`
 * returns `true`, collecting all outputs of the schedule into an array.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Collect outputs while under time limit
 * const collectForTime = Schedule.collectWhile(
 *   Schedule.spaced("500 millis"),
 *   (metadata) => Effect.succeed(metadata.elapsed < 3000) // Stop after 3 seconds
 * )
 *
 * const timeBasedProgram = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const value = Math.floor(Math.random() * 100)
 *       yield* Console.log(`Generated value: ${value}`)
 *       return value
 *     }),
 *     collectForTime
 *   )
 *
 *   yield* Console.log(
 *     `Collected ${results.length} values: [${results.join(", ")}]`
 *   )
 * })
 *
 * // Collect outputs while condition is met
 * const collectWhileSmall = Schedule.collectWhile(
 *   Schedule.exponential("100 millis"),
 *   (metadata) =>
 *     Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)
 * )
 *
 * const conditionalProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const delays = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *       return `${Date.now()}`
 *     }),
 *     collectWhileSmall
 *   )
 *
 *   yield* Console.log(`Collected attempts: [${delays.join(", ")}]`)
 * })
 *
 * // Collect with effectful predicate
 * const collectWithCheck = Schedule.collectWhile(
 *   Schedule.fixed("1 second"),
 *   (metadata) =>
 *     Effect.gen(function*() {
 *       const shouldContinue = metadata.attempt < 5
 *       yield* Console.log(
 *         `Check ${metadata.attempt}: continue = ${shouldContinue}`
 *       )
 *       return shouldContinue
 *     })
 * )
 *
 * const effectfulProgram = Effect.gen(function*() {
 *   const timestamps = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const now = new Date().toISOString()
 *       yield* Console.log(`Task at ${now}`)
 *       return now
 *     }),
 *     collectWithCheck
 *   )
 *
 *   yield* Console.log(`Final collection: ${timestamps.length} items`)
 * })
 *
 * // Collect samples with condition
 * const collectSamples = Schedule.collectWhile(
 *   Schedule.spaced("200 millis"),
 *   (metadata) =>
 *     Effect.succeed(metadata.attempt <= 5 && metadata.elapsed < 2000)
 * )
 *
 * const samplingProgram = Effect.gen(function*() {
 *   const samples = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const sample = Math.random() * 100
 *       yield* Console.log(`Sample: ${sample.toFixed(1)}`)
 *       return sample
 *     }),
 *     collectSamples
 *   )
 *
 *   const average = samples.reduce((sum, s) => sum + s, 0) / samples.length
 *   yield* Console.log(
 *     `Collected ${samples.length} samples, average: ${average.toFixed(1)}`
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const collectWhile = /*#__PURE__*/dual(2, (self, predicate) => reduce(while_(self, predicate), () => [], (outputs, output) => {
  outputs.push(output);
  return outputs;
}));
/**
 * Returns a new `Schedule` that recurs on the specified `Cron` schedule and
 * outputs the duration between recurrences.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class ScheduledTaskError extends Data.TaggedError("ScheduledTaskError")<{ readonly message: string }> {}
 *
 * // Run every minute
 * const everyMinute = Schedule.cron("* * * * *")
 *
 * const minutelyProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Minutely task at ${new Date().toISOString()}`)
 *       return "minute"
 *     }),
 *     everyMinute.pipe(
 *       Schedule.take(3), // Run only 3 times for demo
 *       Schedule.tapOutput((duration) =>
 *         Console.log(`Next execution in: ${duration}`)
 *       )
 *     )
 *   )
 * })
 *
 * // Run every day at 2:30 AM
 * const dailyBackup = Schedule.cron("30 2 * * *")
 *
 * const backupProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Running daily backup...")
 *       // Simulate backup process
 *       yield* Effect.sleep("2 seconds")
 *       yield* Console.log("Backup completed")
 *       return "backup-done"
 *     }),
 *     dailyBackup.pipe(
 *       Schedule.take(2) // Run 2 times for demo
 *     )
 *   )
 * })
 *
 * // Run every Monday at 9:00 AM with timezone
 * const weeklyReport = Schedule.cron("0 9 * * 1", "America/New_York")
 *
 * const reportProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Generating weekly report...")
 *       const report = {
 *         week: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),
 *         timestamp: new Date().toISOString()
 *       }
 *       yield* Console.log(`Report generated: ${JSON.stringify(report)}`)
 *       return report
 *     }),
 *     weeklyReport.pipe(Schedule.take(1))
 *   )
 * })
 *
 * // Run every 15 minutes during business hours (9 AM - 5 PM)
 * const businessHoursCheck = Schedule.cron("0,15,30,45 9-17 * * 1-5")
 *
 * const businessProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Business hours health check...")
 *       const status = Math.random() > 0.1 ? "healthy" : "degraded"
 *       yield* Console.log(`System status: ${status}`)
 *       return status
 *     }),
 *     businessHoursCheck.pipe(
 *       Schedule.take(4) // Demo with 4 checks
 *     )
 *   )
 * })
 *
 * // Run on specific days of the month
 * const monthlyInvoice = Schedule.cron("0 10 1,15 * *") // 1st and 15th at 10 AM
 *
 * const invoiceProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Processing monthly invoices...")
 *       const invoiceCount = Math.floor(Math.random() * 100) + 50
 *       yield* Console.log(`Processed ${invoiceCount} invoices`)
 *       return { count: invoiceCount, date: new Date().toISOString() }
 *     }),
 *     monthlyInvoice.pipe(Schedule.take(1))
 *   )
 * })
 *
 * // Complex cron with error handling
 * const complexCron = Schedule.cron("0 2,4,6 * * *").pipe(
 *   Schedule.tapOutput((duration) =>
 *     Console.log(`Scheduled to run again in ${duration}`)
 *   )
 * )
 *
 * const robustProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Complex scheduled task...")
 *       // Simulate occasional failures
 *       if (Math.random() < 0.3) {
 *         return yield* Effect.fail(new ScheduledTaskError({ message: "Scheduled task failed" }))
 *       }
 *       return "success"
 *     }),
 *     complexCron.pipe(Schedule.take(3))
 *   ).pipe(
 *     Effect.catch((error: unknown) =>
 *       Console.log(`Cron task error: ${String(error)}`)
 *     )
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const cron = (expression, tz) => {
  const parsed = Cron.isCron(expression) ? Result.succeed(expression) : Cron.parse(expression, tz);
  return fromStep(effect.map(parsed.asEffect(), cron => (now, _) => effect.sync(() => {
    const next = Cron.next(cron, now).getTime();
    const duration = Duration.millis(next - now);
    return [duration, duration];
  })));
};
/**
 * Returns a new schedule that outputs the delay between each occurence.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Extract delays from an exponential backoff schedule
 * const exponentialDelays = Schedule.delays(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(5))
 * )
 *
 * const delayProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task result"
 *     }),
 *     exponentialDelays.pipe(
 *       Schedule.tapOutput((delay) =>
 *         Console.log(`Waiting ${delay} before next execution`)
 *       )
 *     )
 *   )
 * })
 *
 * // Monitor delays from a fibonacci schedule
 * const fibonacciDelays = Schedule.delays(
 *   Schedule.fibonacci("200 millis").pipe(Schedule.take(8))
 * )
 *
 * const fibDelayProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Fibonacci task"),
 *     fibonacciDelays.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Fibonacci delay: ${delay}`))
 *     )
 *   )
 * })
 *
 * // Extract delays for analysis or logging
 * const analyzeDelays = Schedule.delays(
 *   Schedule.spaced("1 second").pipe(Schedule.take(3))
 * ).pipe(
 *   Schedule.tapOutput((delay) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Recorded delay: ${delay}`)
 *       // In real applications, might send to metrics system
 *     })
 *   )
 * )
 *
 * // Combine delays with other schedules for complex timing
 * const adaptiveSchedule = Schedule.unfold(100, (delay) => Effect.succeed(delay * 1.5)).pipe(
 *   Schedule.take(6)
 * )
 *
 * const adaptiveDelays = Schedule.delays(adaptiveSchedule)
 *
 * const adaptiveProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Adaptive task execution")
 *       return Date.now()
 *     }),
 *     adaptiveDelays.pipe(
 *       Schedule.tapOutput((delay) => Console.log(`Adaptive delay: ${delay}`))
 *     )
 *   )
 * })
 *
 * // Use delays to implement custom timing logic
 * const customTimingSchedule = Schedule.delays(
 *   Schedule.exponential("50 millis").pipe(Schedule.take(4))
 * ).pipe(
 *   Schedule.map((delay) => Effect.succeed(`Next execution in ${delay}`)),
 *   Schedule.tapOutput((message) => Console.log(message))
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const delays = self => fromStep(effect.map(toStep(self), step => (now, input) => Pull.catchDone(effect.map(step(now, input), ([_, duration]) => [duration, duration]), _ => Cause.done(Duration.zero))));
/**
 * Returns a schedule that recurs once after the specified duration.
 *
 * The schedule outputs the configured duration for its first recurrence and
 * then completes.
 *
 * @since 2.0.0
 * @category constructors
 */
export const duration = durationInput => {
  const duration = Duration.fromInputUnsafe(durationInput);
  return fromStepWithMetadata(effect.succeed(meta => meta.attempt === 1 ? effect.succeed([duration, duration]) : Cause.done(Duration.zero)));
};
/**
 * Returns a new `Schedule` that will always recur, but only during the
 * specified `duration` of time.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Run a task for exactly 5 seconds, regardless of how many iterations
 * const fiveSecondSchedule = Schedule.during("5 seconds")
 *
 * const timedProgram = Effect.gen(function*() {
 *   const startTime = Date.now()
 *
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const elapsed = Date.now() - startTime
 *       yield* Console.log(`Task executed after ${elapsed}ms`)
 *       yield* Effect.sleep("500 millis") // Each task takes 500ms
 *       return "task done"
 *     }),
 *     fiveSecondSchedule.pipe(
 *       Schedule.tapOutput((elapsedDuration) =>
 *         Console.log(`Total elapsed: ${elapsedDuration}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log("Time limit reached!")
 * })
 *
 * // Combine with other schedules for time-bounded execution
 * const timeAndCountLimited = Schedule.spaced("1 second").pipe(
 *   Schedule.both(Schedule.during("10 seconds")), // Stop after 10 seconds OR
 *   Schedule.both(Schedule.recurs(15)) // 15 attempts, whichever comes first
 * )
 *
 * // Burst execution within time window
 * const burstWindow = Schedule.during("3 seconds")
 *
 * const burstProgram = Effect.gen(function*() {
 *   yield* Console.log("Starting burst execution...")
 *
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Burst task at ${new Date().toISOString()}`)
 *       return Math.random()
 *     }),
 *     burstWindow
 *   )
 *
 *   yield* Console.log("Burst window completed")
 * })
 *
 * // Timed retry window - retry for up to 30 seconds
 * const timedRetry = Schedule.exponential("200 millis").pipe(
 *   Schedule.both(Schedule.during("30 seconds"))
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (Math.random() < 0.8) { // 80% failure rate
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     timedRetry
 *   )
 *
 *   yield* Console.log(`Result: ${result}`)
 * }).pipe(
 *   Effect.catch((error: unknown) => Console.log(`Timed out: ${String(error)}`))
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const during = duration => while_(elapsed, ({
  output
}) => effect.succeed(Duration.isLessThanOrEqualTo(output, Duration.fromInputUnsafe(duration))));
/**
 * Combines two `Schedule`s by recurring if either of the two schedules wants
 * to recur, using the minimum of the two durations between recurrences and
 * outputting a tuple of the outputs of both schedules.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Either continues as long as at least one schedule wants to continue
 * const timeBasedSchedule = Schedule.spaced("2 seconds").pipe(Schedule.take(3))
 * const countBasedSchedule = Schedule.recurs(5)
 *
 * // Continues until both schedules are exhausted (either still wants to recur)
 * const eitherSchedule = Schedule.either(timeBasedSchedule, countBasedSchedule)
 * // Outputs: [time_result, count_result] tuple
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Task executed at ${new Date().toISOString()}`)
 *       return "task completed"
 *     }),
 *     eitherSchedule.pipe(
 *       Schedule.tapOutput(([timeResult, countResult]) =>
 *         Console.log(`Time: ${timeResult}, Count: ${countResult}`)
 *       )
 *     )
 *   )
 *
 *   yield* Console.log(`Total executions: ${results.length}`)
 * })
 *
 * // Either with different delay strategies
 * const aggressiveRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3)
 * )
 * const fallbackRetry = Schedule.fixed("5 seconds").pipe(Schedule.take(2))
 *
 * // Will use the more aggressive retry until it's exhausted, then fallback
 * const combinedRetry = Schedule.either(aggressiveRetry, fallbackRetry)
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Retry attempt ${attempt}`)
 *
 *       if (attempt < 6) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     combinedRetry
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Either provides union semantics (OR logic)
 * // Compare with intersect which provides intersection semantics (AND logic)
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const either = /*#__PURE__*/dual(2, (self, other) => eitherWith(self, other, (left, right) => [left, right]));
/**
 * Combines two `Schedule`s by recurring if either of the two schedules wants
 * to recur, using the minimum of the two durations between recurrences and
 * outputting the result of the left schedule (i.e. `self`).
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine two schedules with either semantics, keeping left output
 * const primarySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("primary-result")),
 *   Schedule.take(2)
 * )
 * const backupSchedule = Schedule.spaced("500 millis").pipe(
 *   Schedule.map(() => Effect.succeed("backup-result"))
 * )
 *
 * const combined = Schedule.eitherLeft(primarySchedule, backupSchedule)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(5))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const eitherLeft = /*#__PURE__*/dual(2, (self, other) => eitherWith(self, other, output => output));
/**
 * Combines two `Schedule`s by recurring if either of the two schedules wants
 * to recur, using the minimum of the two durations between recurrences and
 * outputting the result of the right schedule (i.e. `other`).
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine two schedules with either semantics, keeping right output
 * const primarySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("primary-result")),
 *   Schedule.take(2)
 * )
 * const backupSchedule = Schedule.spaced("500 millis").pipe(
 *   Schedule.map(() => Effect.succeed("backup-result"))
 * )
 *
 * const combined = Schedule.eitherRight(primarySchedule, backupSchedule)
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-done"
 *     }),
 *     combined.pipe(Schedule.take(5))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const eitherRight = /*#__PURE__*/dual(2, (self, other) => eitherWith(self, other, (_, output) => output));
/**
 * Combines two `Schedule`s by recurring if either of the two schedules wants
 * to recur, using the minimum of the two durations between recurrences and
 * outputting the result of the combination of both schedule outputs using the
 * specified `combine` function.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Combine schedules with either semantics and custom combination
 * const primarySchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("primary")),
 *   Schedule.take(2)
 * )
 * const fallbackSchedule = Schedule.spaced("500 millis").pipe(
 *   Schedule.map(() => Effect.succeed("fallback"))
 * )
 *
 * const combined = Schedule.eitherWith(
 *   primarySchedule,
 *   fallbackSchedule,
 *   (primary, fallback) => `${primary}+${fallback}`
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task-result"
 *     }),
 *     combined.pipe(Schedule.take(5))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const eitherWith = /*#__PURE__*/dual(3, (self, other, combine) => fromStep(effect.map(effect.zip(toStep(self), toStep(other)), ([stepLeft, stepRight]) => (now, input) => Pull.matchEffect(stepLeft(now, input), {
  onSuccess: leftResult => stepRight(now, input).pipe(effect.map(rightResult => [combine(leftResult[0], rightResult[0]), Duration.min(leftResult[1], rightResult[1])]), Pull.catchDone(rightDone => effect.succeed([combine(leftResult[0], rightDone), leftResult[1]]))),
  onFailure: effect.failCause,
  onDone: leftDone => stepRight(now, input).pipe(effect.map(rightResult => [combine(leftDone, rightResult[0]), rightResult[1]]), Pull.catchDone(rightDone => Cause.done(combine(leftDone, rightDone))))
}))));
/**
 * A schedule that always recurs and returns the total elapsed duration since the first recurrence.
 *
 * This schedule never stops and outputs the cumulative time that has passed since the schedule
 * started executing. Useful for tracking execution time or implementing time-based logic.
 *
 * @returns A schedule that outputs the elapsed duration and never stops
 *
 * @example
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Running task..."),
 *     Schedule.spaced("1 second").pipe(
 *       Schedule.both(Schedule.elapsed),
 *       Schedule.tapOutput(([count, duration]) =>
 *         Console.log(`Run ${count}, elapsed: ${Duration.toMillis(duration)}ms`)
 *       ),
 *       Schedule.take(5)
 *     )
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const elapsed = /*#__PURE__*/fromStepWithMetadata(/*#__PURE__*/effect.succeed(meta => effect.succeed([Duration.millis(meta.elapsed), Duration.zero])));
/**
 * A schedule that always recurs, but will wait a certain amount between
 * repetitions, given by `base * factor.pow(n)`, where `n` is the number of
 * repetitions so far. Returns the current duration between recurrences.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryFailure extends Data.TaggedError("RetryFailure")<{ readonly message: string }> {}
 *
 * // Basic exponential backoff with default factor of 2
 * const basicExponential = Schedule.exponential("100 millis")
 * // Delays: 100ms, 200ms, 400ms, 800ms, 1600ms, ...
 *
 * // Custom exponential backoff with factor 1.5
 * const gentleExponential = Schedule.exponential("200 millis", 1.5)
 * // Delays: 200ms, 300ms, 450ms, 675ms, 1012ms, ...
 *
 * // Retry with exponential backoff (limited to 5 attempts)
 * const retryPolicy = Schedule.exponential("50 millis").pipe(
 *   Schedule.both(Schedule.recurs(5))
 * )
 *
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         yield* Console.log(`Attempt ${attempt} failed, retrying...`)
 *         return yield* Effect.fail(new RetryFailure({ message: `Failure ${attempt}` }))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     retryPolicy
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Will retry with delays: 50ms, 100ms, 200ms before success
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const exponential = (base, factor = 2) => {
  const baseMillis = Duration.toMillis(Duration.fromInputUnsafe(base));
  return fromStepWithMetadata(effect.succeed(meta => {
    const duration = Duration.millis(baseMillis * Math.pow(factor, meta.attempt - 1));
    return effect.succeed([duration, duration]);
  }));
};
/**
 * A schedule that always recurs, increasing delays by summing the preceding
 * two delays (similar to the fibonacci sequence). Returns the current
 * duration between recurrences.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Basic fibonacci schedule starting with 100ms
 * const fibSchedule = Schedule.fibonacci("100 millis")
 * // Delays: 100ms, 100ms, 200ms, 300ms, 500ms, 800ms, 1300ms, ...
 *
 * // Retry with fibonacci backoff for gradual increase
 * const retryWithFib = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *
 *       if (attempt < 5) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     Schedule.fibonacci("50 millis").pipe(
 *       Schedule.both(Schedule.recurs(6)), // Maximum 6 retries
 *       Schedule.tapOutput((delay) => Console.log(`Next retry in ${delay}`))
 *     )
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Heartbeat with fibonacci intervals (starts fast, gets slower)
 * const adaptiveHeartbeat = Effect.gen(function*() {
 *   yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 *   return "pulse"
 * }).pipe(
 *   Effect.repeat(
 *     Schedule.fibonacci("200 millis").pipe(
 *       Schedule.take(8) // First 8 heartbeats
 *     )
 *   )
 * )
 *
 * // Fibonacci vs exponential comparison
 * const compareSchedules = Effect.gen(function*() {
 *   yield* Console.log("=== Fibonacci Delays ===")
 *   // 100ms, 100ms, 200ms, 300ms, 500ms, 800ms
 *
 *   yield* Console.log("=== Exponential Delays ===")
 *   // 100ms, 200ms, 400ms, 800ms, 1600ms, 3200ms
 *
 *   // Fibonacci grows more slowly than exponential
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fibonacci = one => {
  const oneMillis = Duration.toMillis(Duration.fromInputUnsafe(one));
  return fromStep(effect.sync(() => {
    let a = 0;
    let b = oneMillis;
    return constant(effect.sync(() => {
      const next = a + b;
      a = b;
      b = next;
      const duration = Duration.millis(next);
      return [duration, duration];
    }));
  }));
};
/**
 * Returns a `Schedule` that recurs on the specified fixed `interval` and
 * outputs the number of repetitions of the schedule so far.
 *
 * If the action run between updates takes longer than the interval, then the
 * action will be run immediately, but re-runs will not "pile up".
 *
 * ```
 * |-----interval-----|-----interval-----|-----interval-----|
 * |---------action--------||action|-----|action|-----------|
 * ```
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Fixed interval schedule - runs exactly every 1 second
 * const everySecond = Schedule.fixed("1 second")
 *
 * // Health check that runs at fixed intervals
 * const healthCheck = Effect.gen(function*() {
 *   yield* Console.log(`Health check at ${new Date().toISOString()}`)
 *   yield* Effect.sleep("200 millis") // simulate health check work
 *   return "healthy"
 * }).pipe(
 *   Effect.repeat(Schedule.fixed("2 seconds").pipe(Schedule.take(5)))
 * )
 *
 * // Difference between fixed and spaced:
 * // - fixed: maintains constant rate regardless of action duration
 * // - spaced: waits for the duration AFTER each action completes
 *
 * const longRunningTask = Effect.gen(function*() {
 *   yield* Console.log("Task started")
 *   yield* Effect.sleep("1.5 seconds") // Longer than interval
 *   yield* Console.log("Task completed")
 *   return "done"
 * })
 *
 * // Fixed schedule: if task takes 1.5s but interval is 1s,
 * // next execution happens immediately (no pile-up)
 * const fixedSchedule = longRunningTask.pipe(
 *   Effect.repeat(Schedule.fixed("1 second").pipe(Schedule.take(3)))
 * )
 *
 * // Comparing with spaced (waits 1s AFTER each task)
 * const spacedSchedule = longRunningTask.pipe(
 *   Effect.repeat(Schedule.spaced("1 second").pipe(Schedule.take(3)))
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("=== Fixed Schedule Demo ===")
 *   yield* fixedSchedule
 *
 *   yield* Console.log("=== Spaced Schedule Demo ===")
 *   yield* spacedSchedule
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fixed = interval => {
  const window = Duration.toMillis(Duration.fromInputUnsafe(interval));
  return fromStepWithMetadata(effect.sync(() => {
    let start = 0;
    let lastRun = 0;
    return meta => effect.sync(() => {
      if (window === 0) {
        return [meta.attempt - 1, Duration.zero];
      }
      if (meta.attempt === 1) {
        start = meta.now;
        lastRun = meta.now + window;
        return [0, Duration.millis(window)];
      }
      const runningBehind = meta.now > lastRun + window;
      const boundary = window - (meta.now - start) % window;
      const delay = runningBehind ? 0 : boundary === 0 ? window : boundary;
      lastRun = runningBehind ? meta.now : meta.now + delay;
      return [meta.attempt - 1, Duration.millis(delay)];
    });
  }));
};
/**
 * Returns a new `Schedule` that maps the output of this schedule using the
 * specified function.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Transform schedule output from number to string
 * const countSchedule = Schedule.recurs(5).pipe(
 *   Schedule.map((count) => Effect.succeed(`Execution #${count + 1}`))
 * )
 *
 * // Map schedule delays to human-readable format
 * const readableDelays = Schedule.exponential("100 millis").pipe(
 *   Schedule.map((duration) => Effect.succeed(`Next retry in ${duration}`))
 * )
 *
 * // Transform numeric output to structured data
 * const structuredSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.map((recurrence) => Effect.succeed({
 *     iteration: recurrence + 1,
 *     timestamp: new Date().toISOString(),
 *     phase: recurrence < 5 ? "warmup" as const : "steady" as const
 *   }))
 * )
 *
 * const program = Effect.gen(function*() {
 *   const results = yield* Effect.repeat(
 *     Effect.succeed("task completed"),
 *     structuredSchedule.pipe(
 *       Schedule.take(8),
 *       Schedule.tapOutput((info) =>
 *         Console.log(
 *           `${info.phase} phase - iteration ${info.iteration} at ${info.timestamp}`
 *         )
 *       )
 *     )
 *   )
 *
 *   yield* Console.log(`Completed iterations`)
 * })
 *
 * // Map with effectful transformation
 * const effectfulMap = Schedule.fixed("2 seconds").pipe(
 *   Schedule.map((count) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Processing count: ${count}`)
 *       return count * 10
 *     })
 *   )
 * )
 *
 * // Combine mapping with other schedule operations
 * const complexSchedule = Schedule.fibonacci("100 millis").pipe(
 *   Schedule.map((delay) => Effect.succeed(`Delay: ${delay}`))
 * )
 * ```
 *
 * @since 2.0.0
 * @category mapping
 */
export const map = /*#__PURE__*/dual(2, (self, f) => {
  const handle = Pull.matchEffect({
    onSuccess: ([output, duration]) => {
      const result = f(output);
      if (!isEffect(result)) return effect.succeed([result, duration]);
      return effect.map(result, output => [output, duration]);
    },
    onFailure: effect.failCause,
    onDone: output => {
      const result = f(output);
      if (!isEffect(result)) return Cause.done(result);
      return effect.flatMap(result, Cause.done);
    }
  });
  return fromStep(effect.map(toStep(self), step => (now, input) => handle(step(now, input))));
});
/**
 * Returns a new `Schedule` that modifies the delay of the next recurrence
 * of the schedule using the specified effectual function.
 *
 * @example
 * ```ts
 * import { Console, Duration, Effect, Schedule } from "effect"
 *
 * // Modify delays based on output - increase delay on high iteration counts
 * const adaptiveDelay = Schedule.recurs(10).pipe(
 *   Schedule.modifyDelay((output, delay) => {
 *     // Double the delay if we're seeing high iteration counts
 *     return Effect.succeed(output > 5 ? Duration.times(delay, 2) : delay)
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       counter++
 *       yield* Console.log(`Attempt ${counter}`)
 *       return counter
 *     }),
 *     adaptiveDelay.pipe(Schedule.take(8))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const modifyDelay = /*#__PURE__*/dual(2, (self, f) => fromStep(effect.map(toStep(self), step => (now, input) => effect.flatMap(step(now, input), ([output, delay]) => effect.map(f(output, delay), delay => [output, Duration.fromInputUnsafe(delay)])))));
/**
 * Returns a new `Schedule` that randomly adjusts each recurrence delay.
 *
 * Delays are jittered between `80%` and `120%` of the original delay.
 *
 * @since 2.0.0
 * @category utilities
 */
export const jittered = self => modifyDelay(self, (_, delay) => effect.map(randomNext, random => {
  const millis = Duration.toMillis(Duration.fromInputUnsafe(delay));
  return Duration.millis(millis * 0.8 * (1 - random) + millis * 1.2 * random);
}));
/**
 * Returns a new `Schedule` that outputs the inputs of the specified schedule.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Create a schedule that outputs the inputs instead of original outputs
 * const inputSchedule = Schedule.passthrough(
 *   Schedule.exponential("100 millis").pipe(Schedule.take(3))
 * )
 *
 * const program = Effect.gen(function*() {
 *   let counter = 0
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       counter++
 *       yield* Console.log(`Task ${counter} executed`)
 *       return `result-${counter}`
 *     }),
 *     inputSchedule
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const passthrough = self => fromStep(effect.map(toStep(self), step => (now, input) => Pull.matchEffect(step(now, input), {
  onSuccess: result => effect.succeed([input, result[1]]),
  onFailure: effect.failCause,
  onDone: () => Cause.done(input)
})));
/**
 * Returns a `Schedule` which can only be stepped the specified number of
 * `times` before it terminates.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Basic recurs - retry at most 3 times
 * const maxThreeAttempts = Schedule.recurs(3)
 *
 * // Retry a failing operation at most 5 times
 * const program = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *
 *       if (attempt < 4) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     Schedule.recurs(5) // Will retry up to 5 times
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Combining recurs with other schedules for sophisticated retry logic
 * const complexRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.both(Schedule.recurs(3)) // At most 3 attempts
 * )
 *
 * // Repeat an effect exactly 10 times
 * const exactlyTenTimes = Effect.gen(function*() {
 *   yield* Console.log("Executing task...")
 *   return Math.random()
 * }).pipe(
 *   Effect.repeat(Schedule.recurs(10))
 * )
 *
 * // The schedule outputs the current recurrence count (0-based)
 * const countingSchedule = Schedule.recurs(3).pipe(
 *   Schedule.tapOutput((count) => Console.log(`Execution #${count + 1}`))
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const recurs = times => while_(forever, ({
  attempt
}) => effect.succeed(attempt <= times));
/**
 * Returns a new `Schedule` that combines the outputs of the provided schedule
 * using the specified effectful `combine` function and starting from the
 * specified `initial` state.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Sum up execution counts from a counter schedule
 * const sumSchedule = Schedule.reduce(
 *   Schedule.recurs(5),
 *   () => 0, // Initial sum
 *   (sum, count) => Effect.succeed(sum + count) // Add each count to the sum
 * )
 *
 * const sumProgram = Effect.gen(function*() {
 *   const finalSum = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "task"
 *     }),
 *     sumSchedule.pipe(
 *       Schedule.tapOutput((sum) => Console.log(`Running sum: ${sum}`))
 *     )
 *   )
 *
 *   yield* Console.log(`Final sum: ${finalSum}`)
 * })
 *
 * // Build a history of execution times
 * const historySchedule = Schedule.reduce(
 *   Schedule.spaced("1 second").pipe(Schedule.take(4)),
 *   () => [] as Array<number>, // Initial empty array
 *   (history, executionNumber) => Effect.succeed([...history, Date.now()])
 * )
 *
 * const historyProgram = Effect.gen(function*() {
 *   const timeline = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Recording timestamp...")
 *       return "recorded"
 *     }),
 *     historySchedule
 *   )
 *
 *   yield* Console.log(
 *     `Execution timeline: ${timeline.length} timestamps recorded`
 *   )
 * })
 *
 * // Accumulate metrics with effectful combination
 * const metricsAccumulator = Schedule.reduce(
 *   Schedule.recurs(6),
 *   () => ({ total: 0, count: 0, max: 0 }),
 *   (metrics, executionCount) => Effect.succeed({
 *     total: metrics.total + executionCount + 1,
 *     count: metrics.count + 1,
 *     max: Math.max(metrics.max, executionCount + 1)
 *   })
 * )
 *
 * const metricsProgram = Effect.gen(function*() {
 *   const finalMetrics = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Processing...")
 *       return "processed"
 *     }),
 *     metricsAccumulator
 *   )
 *
 *   const average = finalMetrics.total / finalMetrics.count
 *   yield* Console.log(`Final metrics: ${finalMetrics.count} executions`)
 *   yield* Console.log(
 *     `Average delay: ${average.toFixed(1)}ms, Max delay: ${finalMetrics.max}ms`
 *   )
 * })
 *
 * // Build configuration state over time
 * const configBuilder = Schedule.reduce(
 *   Schedule.fixed("500 millis").pipe(Schedule.take(3)),
 *   () => ({ retries: 1, timeout: 1000, backoff: 100 }),
 *   (config, executionNumber) => Effect.succeed({
 *     retries: config.retries + 1,
 *     timeout: config.timeout * 1.5,
 *     backoff: Math.min(config.backoff * 2, 5000)
 *   })
 * )
 *
 * const configProgram = Effect.gen(function*() {
 *   const finalConfig = yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Updating configuration...")
 *       return "updated"
 *     }),
 *     configBuilder.pipe(
 *       Schedule.tapOutput((config) =>
 *         Console.log(
 *           `Config: retries=${config.retries}, timeout=${config.timeout}ms`
 *         )
 *       )
 *     )
 *   )
 *
 *   yield* Console.log(`Final config: ${JSON.stringify(finalConfig)}`)
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const reduce = /*#__PURE__*/dual(3, (self, initial, combine) => fromStep(effect.map(toStep(self), step => {
  let state = initial();
  return (now, input) => Pull.matchEffect(step(now, input), {
    onSuccess([output, delay]) {
      const next = combine(state, output);
      if (!isEffect(next)) {
        state = next;
        return effect.succeed([next, delay]);
      }
      return effect.map(next, nextState => {
        state = nextState;
        return [nextState, delay];
      });
    },
    onFailure: effect.failCause,
    onDone(output) {
      const next = combine(state, output);
      return isEffect(next) ? effect.flatMap(next, Cause.done) : Cause.done(next);
    }
  });
})));
/**
 * Returns a schedule that recurs continuously, each repetition spaced the
 * specified duration from the last run.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Basic spaced schedule - runs every 2 seconds
 * const everyTwoSeconds = Schedule.spaced("2 seconds")
 *
 * // Heartbeat that runs indefinitely with fixed spacing
 * const heartbeat = Effect.gen(function*() {
 *   yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 * }).pipe(
 *   Effect.repeat(everyTwoSeconds)
 * )
 *
 * // Limited repeat - run only 5 times with 1-second spacing
 * const limitedTask = Effect.gen(function*() {
 *   yield* Console.log("Executing scheduled task...")
 *   yield* Effect.sleep("500 millis") // simulate work
 *   return "Task completed"
 * }).pipe(
 *   Effect.repeat(
 *     Schedule.spaced("1 second").pipe(Schedule.take(5))
 *   )
 * )
 *
 * // Simple spaced schedule with limited repetitions
 * const limitedSpaced = Schedule.spaced("100 millis").pipe(
 *   Schedule.both(Schedule.recurs(5)) // at most 5 times
 * )
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("Starting spaced execution...")
 *
 *   yield* Effect.repeat(
 *     Effect.succeed("work item"),
 *     limitedSpaced
 *   )
 *
 *   yield* Console.log("Completed executions")
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const spaced = duration => {
  const decoded = Duration.fromInputUnsafe(duration);
  return fromStepWithMetadata(effect.succeed(meta => effect.succeed([meta.attempt - 1, decoded])));
};
/**
 * Returns a new `Schedule` that allows execution of an effectful function for
 * every input to the schedule, but does not alter the inputs and outputs of
 * the schedule.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryError extends Data.TaggedError("RetryError")<{ readonly message: string }> {}
 *
 * // Log retry errors for debugging
 * const errorLoggingSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3),
 *   Schedule.tapInput((error: RetryError) =>
 *     Console.log(`Retry triggered by error: ${String(error)}`)
 *   )
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         return yield* Effect.fail(new RetryError({ message: `Network timeout on attempt ${attempt}` }))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     errorLoggingSchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Monitor input frequency for metrics
 * const inputMonitoringSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.take(5),
 *   Schedule.tapInput((input: unknown) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Processing input at ${new Date().toISOString()}`)
 *       yield* Console.log(`Input type: ${typeof input}`)
 *       // In real applications, might send metrics to monitoring system
 *     })
 *   )
 * )
 *
 * // Input validation with side effects
 * const validatingSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(4),
 *   Schedule.tapInput((input: any) =>
 *     Effect.gen(function*() {
 *       if (typeof input === "object" && input !== null) {
 *         yield* Console.log(`Valid object input: ${JSON.stringify(input)}`)
 *       } else {
 *         yield* Console.log(`Warning: Non-object input received: ${input}`)
 *       }
 *     })
 *   )
 * )
 *
 * const validationProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task with validation")
 *       return { data: Math.random(), timestamp: Date.now() }
 *     }),
 *     validatingSchedule
 *   )
 * })
 *
 * // Conditional alerting based on input
 * const alertingSchedule = Schedule.exponential("200 millis").pipe(
 *   Schedule.take(6),
 *   Schedule.tapInput((error: RetryError) =>
 *     Effect.gen(function*() {
 *       if (String(error).includes("critical")) {
 *         yield* Console.log(`🚨 CRITICAL ERROR: ${String(error)}`)
 *         // In real applications, might trigger alerts or notifications
 *       } else {
 *         yield* Console.log(`ℹ️ Regular error: ${String(error)}`)
 *       }
 *     })
 *   )
 * )
 *
 * const alertProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       const isCritical = attempt === 3
 *       const errorType = isCritical
 *         ? "critical database failure"
 *         : "temporary network issue"
 *       return yield* Effect.fail(new RetryError({ message: errorType }))
 *     }),
 *     alertingSchedule
 *   ).pipe(
 *     Effect.catch((error: unknown) =>
 *       Console.log(`All retries exhausted: ${String(error)}`)
 *     )
 *   )
 * })
 *
 * // Chain multiple input taps for different purposes
 * const comprehensiveSchedule = Schedule.fibonacci("100 millis").pipe(
 *   Schedule.take(5),
 *   Schedule.tapInput((error: RetryError) =>
 *     Console.log(`Error occurred: ${error._tag}`)
 *   ),
 *   Schedule.tapInput((error: RetryError) =>
 *     String(error).length > 20
 *       ? Console.log("📝 Long error message detected")
 *       : Effect.void
 *   )
 * )
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const tapInput = /*#__PURE__*/dual(2, (self, f) => fromStep(effect.map(toStep(self), step => (now, input) => effect.andThen(f(input), step(now, input)))));
/**
 * Returns a new `Schedule` that allows execution of an effectful function for
 * every output of the schedule, but does not alter the inputs and outputs of
 * the schedule.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Log schedule outputs for debugging/monitoring
 * const monitoredSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(5),
 *   Schedule.tapOutput((delay) => Console.log(`Next delay will be: ${delay}`))
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       if (attempt < 4) {
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *       return `Success on attempt ${attempt}`
 *     }),
 *     monitoredSchedule
 *   )
 *
 *   yield* Console.log(`Final result: ${result}`)
 * })
 *
 * // Tap output for metrics collection
 * const metricsSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.take(10),
 *   Schedule.tapOutput((executionCount) =>
 *     Effect.gen(function*() {
 *       // Simulate metrics collection
 *       yield* Console.log(`Recording metric: execution_count=${executionCount}`)
 *       // In real code, this might send to monitoring system
 *     })
 *   )
 * )
 *
 * // Tap output with conditional side effects
 * const alertingSchedule = Schedule.fibonacci("200 millis").pipe(
 *   Schedule.take(8),
 *   Schedule.tapOutput((delay) =>
 *     Effect.gen(function*() {
 *       const delayMs = delay.toString()
 *       if (delayMs.includes("1000")) { // Alert on delays >= 1 second
 *         yield* Console.log(`🚨 High delay detected: ${delay}`)
 *       }
 *     })
 *   )
 * )
 *
 * const healthCheckProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Performing health check...")
 *       // Simulate health check
 *       return Math.random() > 0.7 ? "healthy" : "degraded"
 *     }),
 *     alertingSchedule
 *   )
 * })
 *
 * // Chain multiple taps for different purposes
 * const comprehensiveSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(6),
 *   Schedule.tapOutput((count) => Console.log(`Execution ${count + 1}`)),
 *   Schedule.tapOutput((count) =>
 *     count % 3 === 0
 *       ? Console.log("🎯 Checkpoint reached!")
 *       : Effect.void
 *   )
 * )
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const tapOutput = /*#__PURE__*/dual(2, (self, f) => fromStep(effect.map(toStep(self), step => (now, input) => effect.tap(step(now, input), ([output]) => f(output)))));
/**
 * Returns a new `Schedule` that takes at most the specified number of outputs
 * from the schedule. Once the specified number of outputs is reached, the
 * schedule will stop.
 *
 * @example
 * ```ts
 * import { Console, Data, Effect, Schedule } from "effect"
 *
 * class RetryAttemptError extends Data.TaggedError("RetryAttemptError")<{ readonly message: string }> {}
 *
 * // Limit an infinite schedule to run only 5 times
 * const limitedHeartbeat = Schedule.spaced("1 second").pipe(
 *   Schedule.take(5) // Will stop after 5 executions
 * )
 *
 * const heartbeatProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Heartbeat at ${new Date().toISOString()}`)
 *       return "pulse"
 *     }),
 *     limitedHeartbeat
 *   )
 *
 *   yield* Console.log("Heartbeat sequence completed")
 * })
 *
 * // Limit retry attempts to a specific number
 * const limitedRetry = Schedule.exponential("100 millis").pipe(
 *   Schedule.take(3) // At most 3 retry attempts
 * )
 *
 * const retryProgram = Effect.gen(function*() {
 *   let attempt = 0
 *
 *   const result = yield* Effect.retry(
 *     Effect.gen(function*() {
 *       attempt++
 *       yield* Console.log(`Attempt ${attempt}`)
 *
 *       if (attempt < 5) { // Will fail more than 3 times
 *         return yield* Effect.fail(new RetryAttemptError({ message: `Attempt ${attempt} failed` }))
 *       }
 *
 *       return `Success on attempt ${attempt}`
 *     }),
 *     limitedRetry
 *   )
 *
 *   yield* Console.log(`Result: ${result}`)
 * }).pipe(
 *   Effect.catch((error: unknown) =>
 *     Console.log(`Failed after limited retries: ${String(error)}`)
 *   )
 * )
 *
 * // Combine take with other schedule operations
 * const samplingSchedule = Schedule.fixed("500 millis").pipe(
 *   Schedule.take(10), // Sample exactly 10 times
 *   Schedule.map((count) => Effect.succeed(`Sample #${count + 1}`))
 * )
 *
 * const samplingProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const value = Math.random()
 *       yield* Console.log(`Sampled value: ${value.toFixed(3)}`)
 *       return value
 *     }),
 *     samplingSchedule.pipe(
 *       Schedule.tapOutput((label) => Console.log(`Completed: ${label}`))
 *     )
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category utilities
 */
export const take = /*#__PURE__*/dual(2, (self, n) => while_(self, ({
  attempt
}) => effect.succeed(attempt <= n)));
/**
 * Creates a schedule that unfolds a state by repeatedly applying a function,
 * outputting the current state and computing the next state.
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Counter schedule that increments by 1 each time
 * const counterSchedule = Schedule.unfold(0, (n) => Effect.succeed(n + 1))
 * // Outputs: 0, 1, 2, 3, 4, 5, ...
 *
 * const countingProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Task executed")
 *       return "done"
 *     }),
 *     counterSchedule.pipe(
 *       Schedule.take(5),
 *       Schedule.tapOutput((count) => Console.log(`Count: ${count}`))
 *     )
 *   )
 * })
 *
 * // Fibonacci sequence schedule
 * const fibonacciSchedule = Schedule.unfold(
 *   [0, 1] as [number, number],
 *   ([a, b]) => Effect.succeed([b, a + b] as [number, number])
 * )
 * // Outputs: [0,1], [1,1], [1,2], [2,3], [3,5], [5,8], ...
 *
 * const fibProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Console.log("Fibonacci step"),
 *     fibonacciSchedule.pipe(
 *       Schedule.take(8),
 *       Schedule.tapOutput(([a, b]) => Console.log(`Fib: ${a}, next: ${b}`))
 *     )
 *   )
 * })
 *
 * // Effectful unfold - exponential backoff with state
 * const exponentialState = Schedule.unfold(
 *   100,
 *   (delayMs) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Current delay: ${delayMs}ms`)
 *       return Math.min(delayMs * 2, 5000) // Cap at 5 seconds
 *     })
 * )
 *
 * // Random jitter schedule
 * const jitteredSchedule = Schedule.unfold(
 *   1000,
 *   (baseDelay) =>
 *     Effect.gen(function*() {
 *       const jitter = Math.random() * 200 - 100 // ±100ms jitter
 *       const nextDelay = Math.max(100, baseDelay + jitter)
 *       yield* Console.log(`Jittered delay: ${nextDelay.toFixed(0)}ms`)
 *       return nextDelay
 *     })
 * )
 *
 * // State machine schedule
 * type State = "init" | "warming" | "active" | "cooling"
 * const stateMachineSchedule = Schedule.unfold("init" as State, (state) => {
 *   switch (state) {
 *     case "init":
 *       return Effect.succeed("warming" as State)
 *     case "warming":
 *       return Effect.succeed("active" as State)
 *     case "active":
 *       return Effect.succeed("cooling" as State)
 *     case "cooling":
 *       return Effect.succeed("active" as State)
 *   }
 * })
 *
 * const stateMachineProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("State machine step")
 *       return "step"
 *     }),
 *     stateMachineSchedule.pipe(
 *       Schedule.take(10),
 *       Schedule.tapOutput((state) => Console.log(`State: ${state}`))
 *     )
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const unfold = (initial, next) => fromStep(effect.sync(() => {
  let state = initial;
  return constant(effect.map(effect.suspend(() => next(state)), nextState => {
    const prev = state;
    state = nextState;
    return [prev, Duration.zero];
  }));
}));
const while_ = /*#__PURE__*/dual(2, (self, predicate) => fromStep(effect.map(toStep(self), step => {
  const meta = metadataFn();
  return (now, input) => effect.flatMap(step(now, input), result => {
    const [output, duration] = result;
    const eff = predicate({
      ...meta(now, input),
      output,
      duration
    });
    return effect.flatMap(isEffect(eff) ? eff : effect.succeed(eff), check => check ? effect.succeed(result) : Cause.done(output));
  });
})));
export {
/**
 * Returns a new schedule that passes each input and output of the specified
 * schedule to the provided `predicate`.
 *
 * If the `predicate` returns `true`, the schedule will continue, otherwise
 * the schedule will stop.
 *
 * @since 2.0.0
 * @category utilities
 */
while_ as while };
/**
 * A schedule that divides the timeline to `interval`-long windows, and sleeps
 * until the nearest window boundary every time it recurs.
 *
 * For example, `Schedule.windowed("10 seconds")` would produce a schedule as
 * follows:
 *
 * ```
 *      10s        10s        10s       10s
 * |----------|----------|----------|----------|
 * |action------|sleep---|act|-sleep|action----|
 * ```
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // Execute tasks at regular intervals aligned to window boundaries
 * const windowSchedule = Schedule.windowed("5 seconds")
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       const now = new Date().toISOString()
 *       yield* Console.log(`Window task executed at: ${now}`)
 *       return "window-task"
 *     }),
 *     windowSchedule.pipe(Schedule.take(4))
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const windowed = interval => {
  const window = Duration.toMillis(Duration.fromInputUnsafe(interval));
  return fromStepWithMetadata(effect.succeed(meta => effect.sync(() => [meta.attempt - 1, window === 0 ? Duration.zero : Duration.millis(window - meta.elapsed % window)])));
};
/**
 * Returns a new `Schedule` that will recur forever.
 *
 * The output of the schedule is the current count of its repetitions thus far
 * (i.e. `0, 1, 2, ...`).
 *
 * @example
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * // A schedule that runs forever with no delay
 * const infiniteSchedule = Schedule.forever
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Running forever...")
 *       return "continuous-task"
 *     }),
 *     infiniteSchedule.pipe(Schedule.take(5)) // Limit for demo
 *   )
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const forever = /*#__PURE__*/spaced(Duration.zero);
const constIdentity = /*#__PURE__*/fromStep(/*#__PURE__*/effect.succeed((_now, input) => effect.succeed([input, Duration.zero])));
const identity_ = () => constIdentity;
export {
/**
 * Creates a schedule that always recurs, passing inputs directly as outputs.
 *
 * **Details**
 *
 * This schedule runs indefinitely, returning each input value as its output
 * without modification. It effectively acts as a pass-through that simply
 * echoes its input values at each step.
 *
 * @since 2.0.0
 * @category Constructors
 */
identity_ as identity };
/**
 * Ensures that the provided schedule respects a specified input type.
 *
 * @example
 * ```ts
 * import { Schedule } from "effect"
 *
 * // Ensure schedule accepts string inputs
 * const stringSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesInputType<string>()
 * )
 *
 * // Ensure schedule accepts number inputs
 * const numberSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesInputType<number>()
 * )
 *
 * // Type-level constraint - this would be a compile error:
 * // Schedule.recurs(3).pipe(Schedule.satisfiesInputType<CustomType>())
 * // where CustomType doesn't match the schedule's input type
 * ```
 *
 * @since 2.0.0
 * @category ensuring types
 */
export const satisfiesInputType = () => self => self;
/**
 * Sets the input type of the provided schedule to a specified type, without
 * altering the schedule's behavior.
 *
 * @since 2.0.0
 * @category ensuring types
 */
export const setInputType = () => self => self;
/**
 * Ensures that the provided schedule respects a specified output type.
 *
 * @example
 * ```ts
 * import { Effect, Schedule } from "effect"
 *
 * // satisfiesOutputType is a type-level function for compile-time constraints
 * // It ensures that a schedule's output type matches the specified type
 *
 * // Example with string output
 * const stringSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.map(() => Effect.succeed("hello")),
 *   Schedule.satisfiesOutputType<string>()
 * )
 * ```
 *
 * @since 2.0.0
 * @category ensuring types
 */
export const satisfiesOutputType = () => self => self;
/**
 * Ensures that the provided schedule respects a specified error type.
 *
 * @example
 * ```ts
 * import { Data, Schedule } from "effect"
 *
 * // Create a custom error using Data.TaggedError
 * class CustomError extends Data.TaggedError("CustomError")<{
 *   message: string
 * }> {}
 *
 * // Ensure schedule handles CustomError types
 * const errorSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesErrorType<CustomError>()
 * )
 *
 * // Ensure schedule handles never errors (no errors)
 * const safeSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesErrorType<never>()
 * )
 * ```
 *
 * @since 2.0.0
 * @category ensuring types
 */
export const satisfiesErrorType = () => self => self;
/**
 * Ensures that the provided schedule respects a specified context type.
 *
 * @example
 * ```ts
 * import { Schedule } from "effect"
 *
 * // Define service interfaces (type-level only)
 * interface Logger {
 *   readonly log: (message: string) => void
 * }
 *
 * interface Database {
 *   readonly query: (sql: string) => Promise<unknown>
 * }
 *
 * // Ensure schedule requires Logger service
 * const loggerSchedule = Schedule.spaced("1 second").pipe(
 *   Schedule.satisfiesServicesType<Logger>()
 * )
 *
 * // Ensure schedule requires both Logger and Database services
 * const multiServiceSchedule = Schedule.exponential("100 millis").pipe(
 *   Schedule.satisfiesServicesType<Logger | Database>()
 * )
 * ```
 *
 * @since 2.0.0
 * @category ensuring types
 */
export const satisfiesServicesType = () => self => self;
//# sourceMappingURL=Schedule.js.map