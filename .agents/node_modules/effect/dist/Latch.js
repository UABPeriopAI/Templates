import * as internal from "./internal/effect.js";
/**
 * Creates a new Latch unsafely.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeLatchUnsafe`
 *
 * @example
 * ```ts
 * import { Effect, Latch } from "effect"
 *
 * const latch = Latch.makeUnsafe(false)
 *
 * const waiter = Effect.gen(function*() {
 *   yield* Effect.log("Waiting for latch to open...")
 *   yield* latch.await
 *   yield* Effect.log("Latch opened! Continuing...")
 * })
 *
 * const opener = Effect.gen(function*() {
 *   yield* Effect.sleep("2 seconds")
 *   yield* Effect.log("Opening latch...")
 *   yield* latch.open
 * })
 *
 * const program = Effect.all([waiter, opener])
 * ```
 *
 * @category constructors
 * @since 3.8.0
 */
export const makeUnsafe = internal.makeLatchUnsafe;
/**
 * Creates a new Latch.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeLatch`
 *
 * @example
 * ```ts
 * import { Effect, Latch } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const latch = yield* Latch.make(false)
 *
 *   const waiter = Effect.gen(function*() {
 *     yield* Effect.log("Waiting for latch to open...")
 *     yield* latch.await
 *     yield* Effect.log("Latch opened! Continuing...")
 *   })
 *
 *   const opener = Effect.gen(function*() {
 *     yield* Effect.sleep("2 seconds")
 *     yield* Effect.log("Opening latch...")
 *     yield* latch.open
 *   })
 *
 *   yield* Effect.all([waiter, opener])
 * })
 * ```
 *
 * @category constructors
 * @since 3.8.0
 */
export const make = internal.makeLatch;
/**
 * Opens the latch, releasing all fibers waiting on it.
 *
 * @category combinators
 * @since 4.0.0
 */
export const open = self => self.open;
/**
 * Opens the latch, releasing all fibers waiting on it.
 *
 * @category unsafe
 * @since 4.0.0
 */
export const openUnsafe = self => self.openUnsafe();
/**
 * Releases all fibers waiting on the latch, without opening it.
 *
 * @category combinators
 * @since 4.0.0
 */
export const release = self => self.release;
const _await = self => self.await;
export {
/**
 * Waits for the latch to be opened.
 *
 * @category getters
 * @since 4.0.0
 */
_await as await };
/**
 * Closes the latch.
 *
 * @category combinators
 * @since 4.0.0
 */
export const close = self => self.close;
/**
 * Closes the latch.
 *
 * @category unsafe
 * @since 4.0.0
 */
export const closeUnsafe = self => self.closeUnsafe();
/**
 * Runs the given effect only when the latch is open.
 *
 * @category combinators
 * @since 4.0.0
 */
export const whenOpen = (...args) => {
  if (args.length === 1) {
    const [self] = args;
    return effect => self.whenOpen(effect);
  }
  const [self, effect] = args;
  return self.whenOpen(effect);
};
//# sourceMappingURL=Latch.js.map