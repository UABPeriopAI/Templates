import * as effect from "./internal/effect.js";
import { version } from "./internal/version.js";
import { hasProperty } from "./Predicate.js";
const TypeId = `~effect/Fiber/${version}`;
const await_ = effect.fiberAwait;
export {
/**
 * Waits for a fiber to complete and returns its exit value.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* Effect.forkChild(Effect.succeed(42))
 *   const exit = yield* Fiber.await(fiber)
 *   console.log(exit) // Exit.succeed(42)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
await_ as await };
/**
 * Waits for all fibers in the provided iterable to complete and returns
 * an array of their exit values.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber1 = yield* Effect.forkChild(Effect.succeed(1))
 *   const fiber2 = yield* Effect.forkChild(Effect.succeed(2))
 *   const exits = yield* Fiber.awaitAll([fiber1, fiber2])
 *   console.log(exits) // [Exit.succeed(1), Exit.succeed(2)]
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const awaitAll = effect.fiberAwaitAll;
/**
 * Joins a fiber, blocking until it completes. If the fiber succeeds,
 * returns its value. If it fails, the error is propagated.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* Effect.forkChild(Effect.succeed(42))
 *   const result = yield* Fiber.join(fiber)
 *   console.log(result) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const join = effect.fiberJoin;
/**
 * @since 2.0.0
 * @category combinators
 */
export const joinAll = effect.fiberJoinAll;
/**
 * Interrupts a fiber, causing it to stop executing and clean up any
 * acquired resources.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* Effect.forkChild(
 *     Effect.delay("1 second")(Effect.succeed(42))
 *   )
 *   yield* Fiber.interrupt(fiber)
 *   console.log("Fiber interrupted")
 * })
 * ```
 *
 * @since 2.0.0
 * @category interruption
 */
export const interrupt = effect.fiberInterrupt;
/**
 * Interrupts a fiber with a specific fiber ID as the interruptor. This allows
 * tracking which fiber initiated the interruption.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const targetFiber = yield* Effect.forkChild(
 *     Effect.delay("5 seconds")(Effect.succeed("task completed"))
 *   )
 *
 *   // Interrupt the fiber, specifying fiber ID 123 as the interruptor
 *   yield* Fiber.interruptAs(targetFiber, 123)
 *   console.log("Fiber interrupted by fiber #123")
 * })
 * ```
 *
 * @since 2.0.0
 * @category interruption
 */
export const interruptAs = effect.fiberInterruptAs;
/**
 * Interrupts all fibers in the provided iterable, causing them to stop executing
 * and clean up any acquired resources.
 *
 * @example
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create multiple long-running fibers
 *   const fiber1 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("5 seconds")
 *       yield* Console.log("Task 1 completed")
 *       return "result1"
 *     })
 *   )
 *
 *   const fiber2 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("3 seconds")
 *       yield* Console.log("Task 2 completed")
 *       return "result2"
 *     })
 *   )
 *
 *   const fiber3 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("4 seconds")
 *       yield* Console.log("Task 3 completed")
 *       return "result3"
 *     })
 *   )
 *
 *   // Wait a bit, then interrupt all fibers
 *   yield* Effect.sleep("1 second")
 *   yield* Console.log("Interrupting all fibers...")
 *   yield* Fiber.interruptAll([fiber1, fiber2, fiber3])
 *   yield* Console.log("All fibers have been interrupted")
 * })
 * ```
 *
 * @since 2.0.0
 * @category interruption
 */
export const interruptAll = effect.fiberInterruptAll;
/**
 * Interrupts all fibers in the provided iterable using the specified fiber ID as the
 * interrupting fiber. This allows you to control which fiber is considered the source
 * of the interruption, which can be useful for debugging and tracing.
 *
 * @example
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a controlling fiber
 *   const controllerFiber = yield* Effect.forkChild(Effect.succeed("controller"))
 *
 *   // Create multiple worker fibers
 *   const worker1 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("5 seconds")
 *       yield* Console.log("Worker 1 completed")
 *       return "worker1"
 *     })
 *   )
 *
 *   const worker2 = yield* Effect.forkChild(
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("3 seconds")
 *       yield* Console.log("Worker 2 completed")
 *       return "worker2"
 *     })
 *   )
 *
 *   // Interrupt all workers using the controller fiber's ID
 *   yield* Effect.sleep("1 second")
 *   yield* Console.log("Interrupting workers from controller...")
 *   yield* Fiber.interruptAllAs([worker1, worker2], controllerFiber.id)
 *   yield* Console.log("All workers interrupted by controller")
 * })
 * ```
 *
 * @since 2.0.0
 * @category interruption
 */
export const interruptAllAs = effect.fiberInterruptAllAs;
/**
 * Tests if a value is a Fiber. This is a type guard that can be used to
 * determine if an unknown value is a Fiber instance.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a fiber
 *   const fiber = yield* Effect.forkChild(Effect.succeed(42))
 *
 *   // Test if values are fibers
 *   console.log(Fiber.isFiber(fiber)) // true
 *   console.log(Fiber.isFiber("hello")) // false
 *   console.log(Fiber.isFiber(42)) // false
 *   console.log(Fiber.isFiber(null)) // false
 *
 *   // Use as a type guard
 *   const maybeValue: unknown = fiber
 *   if (Fiber.isFiber(maybeValue)) {
 *     // TypeScript knows maybeValue is a Fiber here
 *     console.log(`Fiber ID: ${maybeValue.id}`)
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export const isFiber = u => hasProperty(u, effect.FiberTypeId);
/**
 * Returns the current fiber if called from within a fiber context,
 * otherwise returns `undefined`.
 *
 * @example
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const current = Fiber.getCurrent()
 *   if (current) {
 *     console.log(`Current fiber ID: ${current.id}`)
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category accessors
 */
export const getCurrent = effect.getCurrentFiber;
/**
 * Links the lifetime of a fiber to the provided scope.
 *
 * @since 4.0.0
 * @category Scope
 */
export const runIn = effect.fiberRunIn;
//# sourceMappingURL=Fiber.js.map