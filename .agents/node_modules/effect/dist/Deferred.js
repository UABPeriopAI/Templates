import { dual, identity } from "./Function.js";
import * as core from "./internal/core.js";
import * as internalEffect from "./internal/effect.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
const TypeId = "~effect/Deferred";
/**
 * @since 2.0.0
 * @category Guards
 */
export const isDeferred = u => hasProperty(u, TypeId);
const DeferredProto = {
  [TypeId]: {
    _A: identity,
    _E: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Unsafely creates a new `Deferred`
 *
 * @example
 * ```ts
 * import { Deferred } from "effect"
 *
 * const deferred = Deferred.makeUnsafe<number>()
 * console.log(deferred)
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export const makeUnsafe = () => {
  const self = Object.create(DeferredProto);
  self.resumes = undefined;
  self.effect = undefined;
  return self;
};
/**
 * Creates a new `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = () => internalEffect.sync(() => makeUnsafe());
const _await = self => internalEffect.callback(resume => {
  if (self.effect) return resume(self.effect);
  self.resumes ??= [];
  self.resumes.push(resume);
  return internalEffect.sync(() => {
    const index = self.resumes.indexOf(resume);
    self.resumes.splice(index, 1);
  });
});
export {
/**
 * Retrieves the value of the `Deferred`, suspending the fiber running the
 * workflow until the result is available.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
_await as await };
/**
 * Completes the deferred with the result of the specified effect. If the
 * deferred has already been completed, the method will produce false.
 *
 * Note that `Deferred.completeWith` will be much faster, so consider using
 * that if you do not need to memoize the result of the specified effect.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const completed = yield* Deferred.complete(deferred, Effect.succeed(42))
 *   console.log(completed) // true
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const complete = /*#__PURE__*/dual(2, (self, effect) => internalEffect.suspend(() => self.effect ? internalEffect.succeed(false) : into(effect, self)));
/**
 * Completes the deferred with the result of the specified effect. If the
 * deferred has already been completed, the method will produce false.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const completed = yield* Deferred.completeWith(deferred, Effect.succeed(42))
 *   console.log(completed) // true
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const completeWith = /*#__PURE__*/dual(2, (self, effect) => internalEffect.sync(() => doneUnsafe(self, effect)));
/**
 * Exits the `Deferred` with the specified `Exit` value, which will be
 * propagated to all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect, Exit } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.done(deferred, Exit.succeed(42))
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const done = completeWith;
/**
 * Fails the `Deferred` with the specified error, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.fail(deferred, "Operation failed")
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const fail = /*#__PURE__*/dual(2, (self, error) => done(self, core.exitFail(error)));
/**
 * Fails the `Deferred` with the specified error, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failSync(deferred, () => "Lazy error")
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const failSync = /*#__PURE__*/dual(2, (self, evaluate) => internalEffect.suspend(() => fail(self, evaluate())));
/**
 * Fails the `Deferred` with the specified `Cause`, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Cause, Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failCause(
 *     deferred,
 *     Cause.fail("Operation failed")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const failCause = /*#__PURE__*/dual(2, (self, cause) => done(self, core.exitFailCause(cause)));
/**
 * Fails the `Deferred` with the specified `Cause`, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Cause, Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number, string>()
 *   const success = yield* Deferred.failCauseSync(
 *     deferred,
 *     () => Cause.fail("Lazy error")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const failCauseSync = /*#__PURE__*/dual(2, (self, evaluate) => internalEffect.suspend(() => failCause(self, evaluate())));
/**
 * Kills the `Deferred` with the specified defect, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.die(
 *     deferred,
 *     new Error("Something went wrong")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const die = /*#__PURE__*/dual(2, (self, defect) => done(self, core.exitDie(defect)));
/**
 * Kills the `Deferred` with the specified defect, which will be propagated to
 * all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.dieSync(
 *     deferred,
 *     () => new Error("Lazy error")
 *   )
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const dieSync = /*#__PURE__*/dual(2, (self, evaluate) => internalEffect.suspend(() => die(self, evaluate())));
/**
 * Completes the `Deferred` with interruption. This will interrupt all fibers
 * waiting on the value of the `Deferred` with the `FiberId` of the fiber
 * calling this method.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.interrupt(deferred)
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const interrupt = self => core.withFiber(fiber => interruptWith(self, fiber.id));
/**
 * Completes the `Deferred` with interruption. This will interrupt all fibers
 * waiting on the value of the `Deferred` with the specified `FiberId`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const success = yield* Deferred.interruptWith(deferred, 42)
 *   console.log(success) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const interruptWith = /*#__PURE__*/dual(2, (self, fiberId) => failCause(self, internalEffect.causeInterrupt(fiberId)));
/**
 * Returns `true` if this `Deferred` has already been completed with a value or
 * an error, `false` otherwise.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const beforeCompletion = yield* Deferred.isDone(deferred)
 *   console.log(beforeCompletion) // false
 *
 *   yield* Deferred.succeed(deferred, 42)
 *   const afterCompletion = yield* Deferred.isDone(deferred)
 *   console.log(afterCompletion) // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const isDone = self => internalEffect.sync(() => isDoneUnsafe(self));
/**
 * Returns `true` if this `Deferred` has already been completed with a value or
 * an error, `false` otherwise.
 *
 * @since 2.0.0
 * @category getters
 */
export const isDoneUnsafe = self => self.effect !== undefined;
/**
 * Returns the current completion effect as an `Option`. This returns
 * `Option.some(effect)` when the `Deferred` is completed, `Option.none()`
 * otherwise.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   const beforeCompletion = yield* Deferred.poll(deferred)
 *   console.log(beforeCompletion._tag === "None") // true
 *
 *   yield* Deferred.succeed(deferred, 42)
 *   const afterCompletion = yield* Deferred.poll(deferred)
 *   console.log(afterCompletion._tag === "Some") // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export function poll(self) {
  return internalEffect.sync(() => Option.fromUndefinedOr(self.effect));
}
/**
 * Completes the `Deferred` with the specified value.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.succeed(deferred, 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const succeed = /*#__PURE__*/dual(2, (self, value) => done(self, core.exitSucceed(value)));
/**
 * Completes the `Deferred` with the specified lazily evaluated value.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const deferred = yield* Deferred.make<number>()
 *   yield* Deferred.sync(deferred, () => 42)
 *
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value) // 42
 * })
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const sync = /*#__PURE__*/dual(2, (self, evaluate) => internalEffect.suspend(() => succeed(self, evaluate())));
/**
 * Unsafely exits the `Deferred` with the specified `Exit` value, which will be
 * propagated to all fibers waiting on the value of the `Deferred`.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * const deferred = Deferred.makeUnsafe<number>()
 * const success = Deferred.doneUnsafe(deferred, Effect.succeed(42))
 * console.log(success) // true
 * ```
 *
 * @since 2.0.0
 * @category unsafe
 */
export const doneUnsafe = (self, effect) => {
  if (self.effect) return false;
  self.effect = effect;
  if (self.resumes) {
    for (let i = 0; i < self.resumes.length; i++) {
      self.resumes[i](effect);
    }
    self.resumes = undefined;
  }
  return true;
};
/**
 * Converts an `Effect` into an operation that completes a `Deferred` with its result.
 *
 * **Details**
 *
 * The `into` function takes an effect and a `Deferred` and ensures that the `Deferred`
 * is completed based on the outcome of the effect. If the effect succeeds, the `Deferred` is
 * completed with the success value. If the effect fails, the `Deferred` is completed with the
 * failure. Additionally, if the effect is interrupted, the `Deferred` will also be interrupted.
 *
 * @example
 * ```ts
 * import { Deferred, Effect } from "effect"
 *
 * // Define an effect that succeeds
 * const successEffect = Effect.succeed(42)
 *
 * const program = Effect.gen(function*() {
 *   // Create a deferred
 *   const deferred = yield* Deferred.make<number, string>()
 *
 *   // Complete the deferred using the successEffect
 *   const isCompleted = yield* Deferred.into(successEffect, deferred)
 *
 *   // Access the value of the deferred
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value)
 *
 *   return isCompleted
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // 42
 * // true
 * ```
 *
 * @since 2.0.0
 * @category Synchronization Utilities
 */
export const into = /*#__PURE__*/dual(2, (self, deferred) => internalEffect.uninterruptibleMask(restore => internalEffect.flatMap(internalEffect.exit(restore(self)), exit => done(deferred, exit))));
//# sourceMappingURL=Deferred.js.map