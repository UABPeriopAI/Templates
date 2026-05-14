import { dual } from "./Function.js";
import * as core from "./internal/core.js";
import * as internal from "./internal/effect.js";
/**
 * Unsafely creates a new Semaphore.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeSemaphoreUnsafe`
 *
 * @example
 * ```ts
 * import { Effect, Semaphore } from "effect"
 *
 * const semaphore = Semaphore.makeUnsafe(3)
 *
 * const task = (id: number) =>
 *   semaphore.withPermits(1)(
 *     Effect.gen(function*() {
 *       yield* Effect.log(`Task ${id} started`)
 *       yield* Effect.sleep("1 second")
 *       yield* Effect.log(`Task ${id} completed`)
 *     })
 *   )
 *
 * // Only 3 tasks can run concurrently
 * const program = Effect.all([
 *   task(1),
 *   task(2),
 *   task(3),
 *   task(4),
 *   task(5)
 * ], { concurrency: "unbounded" })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeUnsafe = permits => new SemaphoreImpl(permits);
class SemaphoreImpl {
  waiters = /*#__PURE__*/new Set();
  taken = 0;
  permits;
  constructor(permits) {
    this.permits = permits;
  }
  get free() {
    return this.permits - this.taken;
  }
  take(n) {
    const take = internal.suspend(() => {
      if (this.free < n) {
        return internal.callback(resume => {
          if (this.free >= n) return resume(take);
          const observer = () => {
            if (this.free < n) return;
            this.waiters.delete(observer);
            resume(take);
          };
          this.waiters.add(observer);
          return internal.sync(() => {
            this.waiters.delete(observer);
          });
        });
      }
      this.taken += n;
      return internal.succeed(n);
    });
    return take;
  }
  updateTakenUnsafe(fiber, f) {
    this.taken = f(this.taken);
    if (this.waiters.size > 0) {
      fiber.currentDispatcher.scheduleTask(() => {
        const iter = this.waiters.values();
        let item = iter.next();
        while (item.done === false && this.free > 0) {
          item.value();
          item = iter.next();
        }
      }, 0);
    }
    return this.free;
  }
  updateTaken(f) {
    return core.withFiber(fiber => internal.succeed(this.updateTakenUnsafe(fiber, f)));
  }
  resize(permits) {
    return core.withFiber(fiber => {
      this.permits = permits;
      if (this.free < 0) return internal.void;
      this.updateTakenUnsafe(fiber, taken => taken);
      return internal.void;
    });
  }
  release(n) {
    return this.updateTaken(taken => taken - n);
  }
  get releaseAll() {
    return this.updateTaken(_ => 0);
  }
  withPermits(n) {
    return self => internal.uninterruptibleMask(restore => internal.flatMap(restore(this.take(n)), permits => internal.onExitPrimitive(restore(self), () => {
      this.updateTakenUnsafe(internal.getCurrentFiber(), taken => taken - permits);
      return undefined;
    }, true)));
  }
  withPermit = /*#__PURE__*/this.withPermits(1);
  withPermitsIfAvailable(n) {
    return self => internal.uninterruptibleMask(restore => {
      if (this.free < n) return internal.succeedNone;
      this.taken += n;
      return internal.onExitPrimitive(restore(internal.asSome(self)), () => {
        this.updateTakenUnsafe(internal.getCurrentFiber(), taken => taken - n);
        return undefined;
      }, true);
    });
  }
}
/**
 * Creates a new Semaphore.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Effect.makeSemaphore`
 *
 * @example
 * ```ts
 * import { Effect, Semaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* Semaphore.make(2)
 *
 *   const task = (id: number) =>
 *     semaphore.withPermits(1)(
 *       Effect.gen(function*() {
 *         yield* Effect.log(`Task ${id} acquired permit`)
 *         yield* Effect.sleep("1 second")
 *         yield* Effect.log(`Task ${id} releasing permit`)
 *       })
 *     )
 *
 *   // Run 4 tasks, but only 2 can run concurrently
 *   yield* Effect.all([task(1), task(2), task(3), task(4)])
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = permits => internal.sync(() => new SemaphoreImpl(permits));
/**
 * Adjusts the number of permits available in the semaphore.
 *
 * @since 4.0.0
 * @category combinators
 */
export const resize = /*#__PURE__*/dual(2, (self, permits) => self.resize(permits));
/**
 * Runs an effect with the given number of permits and releases the permits when
 * the effect completes.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermits = (self, permits, effect) => {
  const withPermits = self.withPermits(permits);
  return effect ? withPermits(effect) : withPermits;
};
/**
 * Runs an effect with a single permit and releases the permit when the effect
 * completes.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermit = (self, effect) => {
  if (!effect) return self.withPermit;
  return self.withPermit(effect);
};
/**
 * Runs an effect only if the specified number of permits are immediately
 * available.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermitsIfAvailable = (self, permits, effect) => {
  const withPermits = self.withPermitsIfAvailable(permits);
  return effect ? withPermits(effect) : withPermits;
};
/**
 * Acquires the specified number of permits and returns the resulting available
 * permits, suspending the task if they are not yet available.
 *
 * @since 4.0.0
 * @category combinators
 */
export const take = /*#__PURE__*/dual(2, (self, permits) => self.take(permits));
/**
 * Releases the specified number of permits and returns the resulting available
 * permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export const release = /*#__PURE__*/dual(2, (self, permits) => self.release(permits));
/**
 * Releases all permits held by this semaphore and returns the resulting
 * available permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export const releaseAll = self => self.releaseAll;
//# sourceMappingURL=Semaphore.js.map