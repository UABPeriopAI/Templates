import * as effect from "./internal/effect.js";
/**
 * A reference to the current Clock service in the environment.
 *
 * @example
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const clock = yield* Clock.Clock
 *   return clock.currentTimeMillisUnsafe()
 * })
 * ```
 *
 * @category references
 * @since 4.0.0
 */
export const Clock = effect.ClockRef;
/**
 * Accesses the current Clock service and uses it to run the provided function.
 *
 * @example
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const program = Clock.clockWith((clock) =>
 *   Effect.sync(() => {
 *     const currentTime = clock.currentTimeMillisUnsafe()
 *     console.log(`Current time: ${currentTime}`)
 *     return currentTime
 *   })
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const clockWith = effect.clockWith;
/**
 * Returns an Effect that succeeds with the current time in milliseconds.
 *
 * @example
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const currentTime = yield* Clock.currentTimeMillis
 *   console.log(`Current time: ${currentTime}ms`)
 *   return currentTime
 * })
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const currentTimeMillis = effect.currentTimeMillis;
/**
 * Returns an Effect that succeeds with the current time in nanoseconds.
 *
 * @example
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const currentTime = yield* Clock.currentTimeNanos
 *   console.log(`Current time: ${currentTime}ns`)
 *   return currentTime
 * })
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const currentTimeNanos = effect.currentTimeNanos;
//# sourceMappingURL=Clock.js.map