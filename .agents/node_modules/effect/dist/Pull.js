/**
 * @since 4.0.0
 */
import * as Cause from "./Cause.js";
import * as Exit from "./Exit.js";
import * as Filter from "./Filter.js";
import { dual } from "./Function.js";
import * as internalEffect from "./internal/effect.js";
import * as Result from "./Result.js";
// -----------------------------------------------------------------------------
// Done
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category Done
 */
export const catchDone = /*#__PURE__*/dual(2, (effect, f) => internalEffect.catchCauseFilter(effect, filterDoneLeftover, l => f(l)));
/**
 * Checks if a Cause contains any done errors.
 *
 * @since 4.0.0
 * @category Done
 */
export const isDoneCause = cause => cause.reasons.some(isDoneFailure);
/**
 * Checks if a Cause failure is a done error.
 *
 * @since 4.0.0
 * @category Done
 */
export const isDoneFailure = failure => failure._tag === "Fail" && Cause.isDone(failure.error);
/**
 * Filters a Cause to extract only halt errors.
 *
 * @since 4.0.0
 * @category Done
 */
export const filterDone = /*#__PURE__*/Filter.composePassthrough(Cause.findError, e => Cause.isDone(e) ? Result.succeed(e) : Result.fail(e));
/**
 * Filters a Cause to extract only halt errors.
 *
 * @since 4.0.0
 * @category Done
 */
export const filterDoneVoid = /*#__PURE__*/Filter.composePassthrough(Cause.findError, e => Cause.isDone(e) ? Result.succeed(e) : Result.fail(e));
/**
 * @since 4.0.0
 * @category Done
 */
export const filterNoDone = /*#__PURE__*/Filter.fromPredicate(cause => cause.reasons.every(failure => !isDoneFailure(failure)));
/**
 * Filters a Cause to extract the leftover value from done errors.
 *
 * @since 4.0.0
 * @category Done
 */
export const filterDoneLeftover = /*#__PURE__*/Filter.composePassthrough(Cause.findError, e => Cause.isDone(e) ? Result.succeed(e.value) : Result.fail(e));
/**
 * Converts a Cause into an Exit, extracting halt leftovers as success values.
 *
 * @since 4.0.0
 * @category Done
 */
export const doneExitFromCause = cause => {
  const halt = filterDone(cause);
  return !Result.isFailure(halt) ? Exit.succeed(halt.success.value) : Exit.failCause(halt.failure);
};
/**
 * Pattern matches on a Pull, handling success, failure, and done cases.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Pull } from "effect"
 *
 * const pull = Cause.done("stream ended")
 *
 * const result = Pull.matchEffect(pull, {
 *   onSuccess: (value) => Effect.succeed(`Got value: ${value}`),
 *   onFailure: (cause) => Effect.succeed(`Got error: ${cause}`),
 *   onDone: (leftover) => Effect.succeed(`Stream halted with: ${leftover}`)
 * })
 * ```
 *
 * @since 4.0.0
 * @category pattern matching
 */
export const matchEffect = /*#__PURE__*/dual(2, (self, options) => internalEffect.matchCauseEffect(self, {
  onSuccess: options.onSuccess,
  onFailure: cause => {
    const halt = filterDone(cause);
    return !Result.isFailure(halt) ? options.onDone(halt.success.value) : options.onFailure(halt.failure);
  }
}));
//# sourceMappingURL=Pull.js.map