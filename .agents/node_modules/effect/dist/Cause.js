/**
 * Structured representation of how an Effect can fail.
 *
 * A `Cause<E>` holds a flat array of `Reason` values, where each reason is one of:
 *
 * - **Fail** — a typed, expected error `E` (created by `Effect.fail`)
 * - **Die** — an untyped defect (`unknown`) from `Effect.die` or uncaught throws
 * - **Interrupt** — a fiber interruption, optionally carrying the interrupting fiber's ID
 *
 * ## Mental model
 *
 * - A `Cause` is always flat: concurrent and sequential failures are stored together
 *   in `cause.reasons` (a `ReadonlyArray<Reason<E>>`).
 * - Each `Reason` carries an `annotations` map with tracing metadata (stack frames, spans).
 * - An empty `reasons` array means the computation succeeded or the cause was empty
 *   ({@link empty}).
 * - `Cause` implements `Equal`, so two causes with identical reasons compare as equal.
 *
 * ## Common tasks
 *
 * | Intent | API |
 * |--------|-----|
 * | Create a cause | {@link fail}, {@link die}, {@link interrupt}, {@link fromReasons} |
 * | Test for reason types | {@link hasFails}, {@link hasDies}, {@link hasInterrupts} |
 * | Extract the first error/defect | {@link findError}, {@link findDefect}, {@link findFail}, {@link findDie} |
 * | Iterate over reasons manually | `cause.reasons.filter(Cause.isFailReason)` |
 * | Combine two causes | {@link combine} |
 * | Transform errors | {@link map} |
 * | Collapse to a single thrown value | {@link squash} |
 * | Render for logging | {@link pretty}, {@link prettyErrors} |
 * | Attach/read tracing metadata | {@link annotate}, {@link annotations}, {@link reasonAnnotations} |
 *
 * ## Gotchas
 *
 * - `findError`/`findDefect` return `Filter.fail` (not `Option.none`) when no match is
 *   found. Use {@link findErrorOption} if you need an `Option`.
 * - `squash` picks the first `Fail` error, then the first `Die` defect, then falls back
 *   to a generic "interrupted" / "empty" error. It is lossy — use `prettyErrors` or
 *   iterate `reasons` directly when you need all failures.
 * - The module also exports several built-in error classes (`NoSuchElementError`,
 *   `TimeoutError`, `IllegalArgumentError`, `ExceededCapacityError`, `UnknownError`)
 *   and the `Done` completion signal. These all implement `YieldableError` and can be
 *   yielded directly inside `Effect.gen`.
 *
 * **Example** (inspecting a concurrent failure)
 *
 * ```ts
 * import { Cause, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const cause = yield* Effect.sandbox(
 *     Effect.all([
 *       Effect.fail("err1"),
 *       Effect.die("defect"),
 *       Effect.fail("err2")
 *     ], { concurrency: "unbounded" })
 *   ).pipe(Effect.flip)
 *
 *   const errors = cause.reasons
 *     .filter(Cause.isFailReason)
 *     .map((r) => r.error)
 *
 *   const defects = cause.reasons
 *     .filter(Cause.isDieReason)
 *     .map((r) => r.defect)
 *
 *   console.log(errors)  // ["err1", "err2"]  (order may vary)
 *   console.log(defects) // ["defect"]
 * })
 *
 * Effect.runPromise(program)
 * ```
 *
 * @see {@link Cause} — the core interface
 * @see {@link Reason} — the union of failure kinds
 * @see {@link pretty} — human-readable rendering
 *
 * @since 2.0.0
 */
import * as Context from "./Context.js";
import * as core from "./internal/core.js";
import * as effect from "./internal/effect.js";
/**
 * Unique brand for `Cause` values, used for runtime type checks via {@link isCause}.
 *
 * @since 2.0.0
 * @category symbols
 */
export const TypeId = core.CauseTypeId;
/**
 * Unique brand for `Reason` values, used for runtime type checks via {@link isReason}.
 *
 * @since 2.0.0
 * @category symbols
 */
export const ReasonTypeId = core.CauseReasonTypeId;
/**
 * Tests if an arbitrary value is a {@link Cause}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isCause(Cause.fail("error"))) // true
 * console.log(Cause.isCause("not a cause")) // false
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const isCause = core.isCause;
/**
 * Tests if an arbitrary value is a {@link Reason} (`Fail`, `Die`, or `Interrupt`).
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.fail("error").reasons[0]
 * console.log(Cause.isReason(reason)) // true
 * console.log(Cause.isReason("not a reason")) // false
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const isReason = core.isCauseReason;
/**
 * Narrows a {@link Reason} to {@link Fail}.
 *
 * Useful as a predicate for `Array.filter` when iterating over `cause.reasons`.
 *
 * **Example** (filtering fail reasons)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("error")
 * const fails = cause.reasons.filter(Cause.isFailReason)
 * console.log(fails[0].error) // "error"
 * ```
 *
 * @see {@link isDieReason} — narrow to `Die`
 * @see {@link isInterruptReason} — narrow to `Interrupt`
 *
 * @category guards
 * @since 4.0.0
 */
export const isFailReason = core.isFailReason;
/**
 * Narrows a {@link Reason} to {@link Die}.
 *
 * Useful as a predicate for `Array.filter` when iterating over `cause.reasons`.
 *
 * **Example** (filtering die reasons)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.die("defect")
 * const dies = cause.reasons.filter(Cause.isDieReason)
 * console.log(dies[0].defect) // "defect"
 * ```
 *
 * @see {@link isFailReason} — narrow to `Fail`
 * @see {@link isInterruptReason} — narrow to `Interrupt`
 *
 * @category guards
 * @since 4.0.0
 */
export const isDieReason = core.isDieReason;
/**
 * Narrows a {@link Reason} to {@link Interrupt}.
 *
 * Useful as a predicate for `Array.filter` when iterating over `cause.reasons`.
 *
 * **Example** (filtering interrupt reasons)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.interrupt(123)
 * const interrupts = cause.reasons.filter(Cause.isInterruptReason)
 * console.log(interrupts[0].fiberId) // 123
 * ```
 *
 * @see {@link isFailReason} — narrow to `Fail`
 * @see {@link isDieReason} — narrow to `Die`
 *
 * @category guards
 * @since 4.0.0
 */
export const isInterruptReason = core.isInterruptReason;
/**
 * Creates a {@link Cause} from an array of {@link Reason} values.
 *
 * Use this when you already have individual reasons (e.g. from filtering or
 * transforming another cause's `reasons` array) and need to wrap them back
 * into a `Cause`.
 *
 * - Returns a new `Cause`; does not mutate the input array.
 * - An empty array produces a cause equivalent to {@link empty}.
 *
 * **Example** (building a cause from reasons)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const reasons = [
 *   Cause.makeFailReason("err1"),
 *   Cause.makeFailReason("err2")
 * ]
 * const cause = Cause.fromReasons(reasons)
 * console.log(cause.reasons.length) // 2
 * ```
 *
 * @see {@link combine} — merge two existing causes
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromReasons = core.causeFromReasons;
/**
 * A {@link Cause} with an empty `reasons` array.
 *
 * Represents the absence of failure. Combining any cause with `empty` via
 * {@link combine} returns the original cause unchanged.
 *
 * @see {@link combine}
 *
 * @category constructors
 * @since 2.0.0
 */
export const empty = core.causeEmpty;
/**
 * Creates a {@link Cause} containing a single {@link Fail} reason with the
 * given typed error.
 *
 * **Example** (creating a fail cause)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("Something went wrong")
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isFailReason(cause.reasons[0])) // true
 * ```
 *
 * @see {@link die} — for untyped defects
 * @see {@link interrupt} — for fiber interruptions
 *
 * @category constructors
 * @since 2.0.0
 */
export const fail = core.causeFail;
/**
 * Creates a {@link Cause} containing a single {@link Die} reason with the
 * given defect.
 *
 * **Example** (creating a die cause)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.die(new Error("Unexpected"))
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isDieReason(cause.reasons[0])) // true
 * ```
 *
 * @see {@link fail} — for typed errors
 * @see {@link interrupt} — for fiber interruptions
 *
 * @category constructors
 * @since 2.0.0
 */
export const die = core.causeDie;
/**
 * Creates a {@link Cause} containing a single {@link Interrupt} reason,
 * optionally carrying the interrupting fiber's ID.
 *
 * **Example** (creating an interrupt cause)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.interrupt(123)
 * console.log(cause.reasons.length) // 1
 * console.log(Cause.isInterruptReason(cause.reasons[0])) // true
 * ```
 *
 * @see {@link fail} — for typed errors
 * @see {@link die} — for untyped defects
 *
 * @category constructors
 * @since 2.0.0
 */
export const interrupt = effect.causeInterrupt;
/**
 * Creates a standalone {@link Fail} reason (not wrapped in a {@link Cause}).
 *
 * Use this when you need to construct individual reasons for
 * {@link fromReasons} or for direct comparison.
 *
 * **Example** (creating a Fail reason)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeFailReason("error")
 * console.log(reason._tag) // "Fail"
 * console.log(reason.error) // "error"
 * ```
 *
 * @see {@link makeDieReason} — create a `Die` reason
 * @see {@link makeInterruptReason} — create an `Interrupt` reason
 *
 * @category constructors
 * @since 4.0.0
 */
export const makeFailReason = error => new core.Fail(error);
/**
 * Creates a standalone {@link Die} reason (not wrapped in a {@link Cause}).
 *
 * **Example** (creating a Die reason)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeDieReason(new Error("bug"))
 * console.log(reason._tag) // "Die"
 * ```
 *
 * @see {@link makeFailReason} — create a `Fail` reason
 * @see {@link makeInterruptReason} — create an `Interrupt` reason
 *
 * @category constructors
 * @since 4.0.0
 */
export const makeDieReason = defect => new core.Die(defect);
/**
 * Creates a standalone {@link Interrupt} reason (not wrapped in a {@link Cause}),
 * optionally carrying the interrupting fiber's ID.
 *
 * **Example** (creating an Interrupt reason)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.makeInterruptReason(42)
 * console.log(reason._tag) // "Interrupt"
 * console.log(reason.fiberId) // 42
 * ```
 *
 * @see {@link makeFailReason} — create a `Fail` reason
 * @see {@link makeDieReason} — create a `Die` reason
 *
 * @category constructors
 * @since 4.0.0
 */
export const makeInterruptReason = effect.makeInterruptReason;
/**
 * Returns `true` if every reason in the cause is an {@link Interrupt} (and
 * there is at least one reason).
 *
 * Useful for deciding whether a failure was entirely due to interruption and
 * can be silently discarded.
 *
 * **Example** (checking interrupt-only causes)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasInterruptsOnly(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterruptsOnly(Cause.fail("error")))  // false
 * console.log(Cause.hasInterruptsOnly(Cause.empty))          // false
 * ```
 *
 * @see {@link hasInterrupts} — `true` if the cause contains *any* interrupts
 *
 * @category predicates
 * @since 2.0.0
 */
export const hasInterruptsOnly = effect.hasInterruptsOnly;
/**
 * Transforms the typed error values inside a {@link Cause} using the
 * provided function. Only {@link Fail} reasons are affected; {@link Die}
 * and {@link Interrupt} reasons pass through unchanged.
 *
 * Returns a new `Cause`; does not mutate the original.
 *
 * **Example** (mapping errors to uppercase)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("error")
 * const mapped = Cause.map(cause, (e) => e.toUpperCase())
 * const reason = mapped.reasons[0]
 * if (Cause.isFailReason(reason)) {
 *   console.log(reason.error) // "ERROR"
 * }
 * ```
 *
 * @category mapping
 * @since 4.0.0
 */
export const map = effect.causeMap;
/**
 * Merges two causes into a single cause whose `reasons` array is the union
 * of both inputs (de-duplicated by value equality).
 *
 * - Combining with {@link empty} returns the other cause unchanged.
 * - If the result is structurally equal to `self`, `self` is returned
 *   (referential shortcut).
 *
 * **Example** (combining two causes)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause1 = Cause.fail("error1")
 * const cause2 = Cause.fail("error2")
 * const combined = Cause.combine(cause1, cause2)
 * console.log(combined.reasons.length) // 2
 * ```
 *
 * @see {@link fromReasons} — build a cause from an array of reasons
 *
 * @category combining
 * @since 4.0.0
 */
export const combine = effect.causeCombine;
/**
 * Collapses a {@link Cause} into a single `unknown` value, picking the "most
 * important" failure in this order:
 *
 * 1. First {@link Fail} error (the `E` value)
 * 2. First {@link Die} defect
 * 3. A generic `Error("All fibers interrupted without error")` for interrupt-only causes
 * 4. A generic `Error("Empty cause")` for {@link empty}
 *
 * This is the function used by `Effect.runPromise` and `Effect.runSync` to
 * decide what to throw. It is lossy — use {@link prettyErrors} or iterate
 * `cause.reasons` when you need all failures.
 *
 * **Example** (squashing a cause)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.squash(Cause.fail("error")))    // "error"
 * console.log(Cause.squash(Cause.die("defect")))    // "defect"
 * ```
 *
 * @see {@link prettyErrors} — non-lossy conversion to `Array<Error>`
 * @see {@link pretty} — human-readable string rendering
 *
 * @category destructors
 * @since 2.0.0
 */
export const squash = effect.causeSquash;
/**
 * Returns `true` if the cause contains at least one {@link Fail} reason.
 *
 * **Example** (checking for typed errors)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasFails(Cause.fail("error"))) // true
 * console.log(Cause.hasFails(Cause.die("defect"))) // false
 * ```
 *
 * @see {@link hasDies} — check for defects
 * @see {@link hasInterrupts} — check for interruptions
 *
 * @category predicates
 * @since 2.0.0
 */
export const hasFails = effect.hasFails;
/**
 * Returns the first {@link Fail} reason from a cause, including its
 * annotations. Returns `Filter.fail` with the remaining cause when no
 * `Fail` is found.
 *
 * Use {@link findError} if you only need the unwrapped error value `E`.
 *
 * **Example** (extracting the first Fail reason)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findFail(Cause.fail("error"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.error) // "error"
 * }
 * ```
 *
 * @see {@link findError} — extract the unwrapped `E` value
 * @see {@link findDie} — extract the first `Die` reason
 *
 * @category filters
 * @since 4.0.0
 */
export const findFail = effect.findFail;
/**
 * Returns the first typed error value `E` from a cause.
 * Returns `Filter.fail` with the remaining cause when no `Fail` is found.
 *
 * Use {@link findFail} if you need the full {@link Fail} reason (including
 * annotations). Use {@link findErrorOption} if you prefer an `Option`.
 *
 * **Example** (extracting the first error value)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findError(Cause.fail("error"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // "error"
 * }
 * ```
 *
 * @see {@link findFail} — extract the full `Fail` reason
 * @see {@link findErrorOption} — `Option`-based variant
 *
 * @category filters
 * @since 4.0.0
 */
export const findError = effect.findError;
/**
 * Returns the first typed error value `E` from a cause wrapped in
 * `Option.some`, or `Option.none` if no {@link Fail} reason exists.
 *
 * This is a convenience wrapper around {@link findError} for code that
 * already works with `Option` instead of `Filter`.
 *
 * **Example** (extracting an error as Option)
 *
 * ```ts
 * import { Cause, Option } from "effect"
 *
 * const some = Cause.findErrorOption(Cause.fail("error"))
 * console.log(Option.isSome(some)) // true
 *
 * const none = Cause.findErrorOption(Cause.die("defect"))
 * console.log(Option.isNone(none)) // true
 * ```
 *
 * @see {@link findError} — `Filter`-based variant
 *
 * @category filters
 * @since 4.0.0
 */
export const findErrorOption = effect.findErrorOption;
/**
 * Returns `true` if the cause contains at least one {@link Die} reason.
 *
 * **Example** (checking for defects)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasDies(Cause.die("defect"))) // true
 * console.log(Cause.hasDies(Cause.fail("error"))) // false
 * ```
 *
 * @see {@link hasFails} — check for typed errors
 * @see {@link hasInterrupts} — check for interruptions
 *
 * @category predicates
 * @since 2.0.0
 */
export const hasDies = effect.hasDies;
/**
 * Returns the first {@link Die} reason from a cause, including its
 * annotations. Returns `Filter.fail` with the original cause when no
 * `Die` is found.
 *
 * Use {@link findDefect} if you only need the unwrapped defect value.
 *
 * **Example** (extracting the first Die reason)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findDie(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.defect) // "defect"
 * }
 * ```
 *
 * @see {@link findDefect} — extract the unwrapped defect value
 * @see {@link findFail} — extract the first `Fail` reason
 *
 * @category filters
 * @since 4.0.0
 */
export const findDie = effect.findDie;
/**
 * Returns the first defect value (`unknown`) from a cause.
 * Returns `Filter.fail` with the original cause when no {@link Die} reason
 * is found.
 *
 * Use {@link findDie} if you need the full `Die` reason (including
 * annotations).
 *
 * **Example** (extracting the first defect)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findDefect(Cause.die("defect"))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // "defect"
 * }
 * ```
 *
 * @see {@link findDie} — extract the full `Die` reason
 * @see {@link findError} — extract the first typed error
 *
 * @category filters
 * @since 4.0.0
 */
export const findDefect = effect.findDefect;
/**
 * Returns `true` if the cause contains at least one {@link Interrupt} reason.
 *
 * **Example** (checking for interruptions)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.hasInterrupts(Cause.interrupt(123))) // true
 * console.log(Cause.hasInterrupts(Cause.fail("error")))  // false
 * ```
 *
 * @see {@link hasInterruptsOnly} — `true` only when *all* reasons are interrupts
 * @see {@link hasFails} — check for typed errors
 * @see {@link hasDies} — check for defects
 *
 * @category predicates
 * @since 2.0.0
 */
export const hasInterrupts = effect.hasInterrupts;
/**
 * Returns the first {@link Interrupt} reason from a cause, including its
 * annotations. Returns `Filter.fail` with the original cause when no
 * `Interrupt` is found.
 *
 * **Example** (extracting the first interrupt)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.findInterrupt(Cause.interrupt(42))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success.fiberId) // 42
 * }
 * ```
 *
 * @see {@link interruptors} — collect all interrupting fiber IDs as a `Set`
 *
 * @category filters
 * @since 4.0.0
 */
export const findInterrupt = effect.findInterrupt;
/**
 * Collects the fiber IDs of all {@link Interrupt} reasons in the cause into
 * a `ReadonlySet`. Returns an empty set when the cause has no interrupts.
 *
 * This always succeeds (no `Filter.fail`). Use {@link filterInterruptors}
 * for the `Filter`-based variant.
 *
 * **Example** (collecting interruptors)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.combine(
 *   Cause.interrupt(1),
 *   Cause.interrupt(2)
 * )
 * console.log(Cause.interruptors(cause)) // Set { 1, 2 }
 * ```
 *
 * @see {@link filterInterruptors} — `Filter`-based variant
 *
 * @category accessors
 * @since 4.0.0
 */
export const interruptors = effect.causeInterruptors;
/**
 * Extracts the set of interrupting fiber IDs from a cause.
 * Returns `Filter.fail` with the original cause when no {@link Interrupt}
 * reason is found.
 *
 * Use {@link interruptors} if you always want a `Set` (possibly empty)
 * without `Filter` wrapping.
 *
 * **Example** (extracting interruptors with Filter)
 *
 * ```ts
 * import { Cause, Result } from "effect"
 *
 * const result = Cause.filterInterruptors(Cause.interrupt(1))
 * if (!Result.isFailure(result)) {
 *   console.log(result.success) // Set { 1 }
 * }
 * ```
 *
 * @see {@link interruptors} — always-succeeding variant
 *
 * @category filters
 * @since 4.0.0
 */
export const filterInterruptors = effect.causeFilterInterruptors;
/**
 * Converts a {@link Cause} into an `Array<Error>` suitable for logging or
 * rethrowing.
 *
 * Each {@link Fail} and {@link Die} reason is converted into a standard
 * `Error`:
 *
 * - **Objects / Error instances** — `message`, `name`, `stack`, and `cause`
 *   are preserved. Extra enumerable properties are copied. Stack traces are
 *   cleaned up and enriched with span annotations when available.
 * - **Strings** — used directly as the `Error` message.
 * - **Other primitives** (`null`, `undefined`, numbers, …) — wrapped in an
 *   `Error` with message `"Unknown error: <value>"`.
 *
 * {@link Interrupt} reasons are collected separately. If the cause contains
 * **only** interrupts (no `Fail` or `Die`), a single `InterruptError` is
 * returned whose `cause` lists the interrupting fiber IDs.
 *
 * **Example** (converting a cause to errors)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail(new Error("boom"))
 * const errors = Cause.prettyErrors(cause)
 * console.log(errors[0].message) // "boom"
 * ```
 *
 * @see {@link pretty} — renders the cause as a single string
 * @see {@link squash} — lossy collapse to a single thrown value
 *
 * @since 4.0.0
 * @category rendering
 */
export const prettyErrors = effect.causePrettyErrors;
/**
 * Renders a {@link Cause} as a human-readable string for logging or
 * debugging.
 *
 * Delegates to {@link prettyErrors} to convert each reason to an `Error`,
 * then joins their stack traces with newlines. Nested `Error.cause` chains
 * are rendered inline with indentation:
 *
 * ```text
 * ErrorName: message
 *     at ...
 *     at ... {
 *   [cause]: NestedError: message
 *       at ...
 * }
 * ```
 *
 * Span annotations are appended to the relevant stack frames when available.
 *
 * **Example** (rendering a cause)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const cause = Cause.fail("something went wrong")
 * console.log(Cause.pretty(cause))
 * // Error: something went wrong
 * //     at ...
 * ```
 *
 * @see {@link prettyErrors} — get the individual `Error` instances
 *
 * @since 4.0.0
 * @category rendering
 */
export const pretty = effect.causePretty;
/**
 * Tests if an arbitrary value is a {@link NoSuchElementError}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isNoSuchElementError(new Cause.NoSuchElementError())) // true
 * console.log(Cause.isNoSuchElementError("nope")) // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isNoSuchElementError = core.isNoSuchElementError;
/**
 * Unique brand for {@link NoSuchElementError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const NoSuchElementErrorTypeId = core.NoSuchElementErrorTypeId;
/**
 * Constructs a {@link NoSuchElementError} with an optional message.
 *
 * **Example** (creating a NoSuchElementError)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.NoSuchElementError("Element not found")
 * console.log(error.message) // "Element not found"
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const NoSuchElementError = core.NoSuchElementError;
/**
 * Tests if an arbitrary value is a {@link Done} signal.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isDone(Cause.Done())) // true
 * console.log(Cause.isDone("not done"))   // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isDone = core.isDone;
/**
 * Unique brand for {@link Done} values.
 *
 * @since 4.0.0
 * @category symbols
 */
export const DoneTypeId = core.DoneTypeId;
/**
 * Creates a {@link Done} signal with an optional value.
 *
 * @see {@link done} — create a failing `Effect` with `Done`
 *
 * @category constructors
 * @since 4.0.0
 */
export const Done = core.Done;
/**
 * Creates an Effect that fails with a {@link Done} error. Shorthand for
 * `Effect.fail(Cause.Done(value))`.
 *
 * @see {@link Done:var | Done} — create the signal value without an Effect
 *
 * @category constructors
 * @since 4.0.0
 */
export const done = core.done;
/**
 * Unique brand for {@link TimeoutError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const TimeoutErrorTypeId = effect.TimeoutErrorTypeId;
/**
 * Tests if an arbitrary value is a {@link TimeoutError}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isTimeoutError(new Cause.TimeoutError())) // true
 * console.log(Cause.isTimeoutError("nope")) // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isTimeoutError = effect.isTimeoutError;
/**
 * Constructs a {@link TimeoutError} with an optional message.
 *
 * **Example** (creating a TimeoutError)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.TimeoutError("Operation timed out")
 * console.log(error.message) // "Operation timed out"
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const TimeoutError = effect.TimeoutError;
/**
 * Unique brand for {@link IllegalArgumentError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const IllegalArgumentErrorTypeId = effect.IllegalArgumentErrorTypeId;
/**
 * Tests if an arbitrary value is an {@link IllegalArgumentError}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isIllegalArgumentError(new Cause.IllegalArgumentError())) // true
 * console.log(Cause.isIllegalArgumentError("nope")) // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isIllegalArgumentError = effect.isIllegalArgumentError;
/**
 * Constructs an {@link IllegalArgumentError} with an optional message.
 *
 * **Example** (creating an IllegalArgumentError)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.IllegalArgumentError("Invalid argument")
 * console.log(error.message) // "Invalid argument"
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const IllegalArgumentError = effect.IllegalArgumentError;
/**
 * Tests if an arbitrary value is an {@link ExceededCapacityError}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isExceededCapacityError(new Cause.ExceededCapacityError())) // true
 * console.log(Cause.isExceededCapacityError("nope")) // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isExceededCapacityError = effect.isExceededCapacityError;
/**
 * Unique brand for {@link ExceededCapacityError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const ExceededCapacityErrorTypeId = effect.ExceededCapacityErrorTypeId;
/**
 * Constructs an {@link ExceededCapacityError} with an optional message.
 *
 * **Example** (creating an ExceededCapacityError)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.ExceededCapacityError("Queue full")
 * console.log(error.message) // "Queue full"
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const ExceededCapacityError = effect.ExceededCapacityError;
/**
 * Unique brand for {@link AsyncFiberError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const AsyncFiberErrorTypeId = effect.AsyncFiberErrorTypeId;
/**
 * @category guards
 * @since 4.0.0
 */
export const isAsyncFiberError = effect.isAsyncFiberError;
/**
 * An error that occurs when trying to run an async fiber with Effect.runSync.
 *
 * @category constructors
 * @since 4.0.0
 */
export const AsyncFiberError = effect.AsyncFiberError;
/**
 * Unique brand for {@link UnknownError}.
 *
 * @since 4.0.0
 * @category symbols
 */
export const UnknownErrorTypeId = effect.UnknownErrorTypeId;
/**
 * Tests if an arbitrary value is an {@link UnknownError}.
 *
 * **Example** (runtime type check)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * console.log(Cause.isUnknownError(new Cause.UnknownError("x"))) // true
 * console.log(Cause.isUnknownError("nope")) // false
 * ```
 *
 * @category guards
 * @since 4.0.0
 */
export const isUnknownError = effect.isUnknownError;
/**
 * Constructs an {@link UnknownError}. The first argument is the original
 * cause (stored in `Error.cause`); the second is an optional human-readable
 * message.
 *
 * **Example** (creating an UnknownError)
 *
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.UnknownError({ raw: true }, "Unexpected value")
 * console.log(error.message) // "Unexpected value"
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const UnknownError = effect.UnknownError;
/**
 * Attaches metadata to every reason in a {@link Cause}.
 *
 * Annotations are stored as a `Context` on each reason and can be
 * retrieved later via {@link reasonAnnotations} or {@link annotations}.
 * The runtime uses this to attach stack traces and spans.
 *
 * - Returns a new `Cause`; does not mutate the input.
 * - By default, existing keys are preserved. Pass `{ overwrite: true }` to
 *   replace them.
 *
 * **Example** (annotating a cause)
 *
 * ```ts
 * import { Cause, Context } from "effect"
 *
 * const cause = Cause.fail("error")
 * const annotated = Cause.annotate(cause, Context.empty())
 * ```
 *
 * @see {@link annotations} — read merged annotations from a cause
 * @see {@link reasonAnnotations} — read annotations from a single reason
 *
 * @category annotations
 * @since 4.0.0
 */
export const annotate = core.causeAnnotate;
/**
 * Reads the annotations from a single {@link Reason} as a `Context`.
 *
 * Use this when you need tracing metadata (e.g. {@link StackTrace}) from
 * a specific reason rather than the whole cause.
 *
 * @see {@link annotations} — merged annotations from all reasons in a cause
 * @see {@link annotate} — attach annotations
 *
 * @category annotations
 * @since 4.0.0
 */
export const reasonAnnotations = effect.reasonAnnotations;
/**
 * Reads the merged annotations from all reasons in a {@link Cause}.
 *
 * Annotations from later reasons overwrite earlier ones when keys collide.
 *
 * @see {@link reasonAnnotations} — annotations from a single reason
 * @see {@link annotate} — attach annotations
 *
 * @category annotations
 * @since 4.0.0
 */
export const annotations = effect.causeAnnotations;
/**
 * `Context` key for the stack frame captured at the point of failure.
 *
 * The runtime annotates every reason with this when a stack frame is
 * available. Retrieve it via
 * `Context.get(Cause.reasonAnnotations(reason), Cause.StackTrace)`.
 *
 * @category annotations
 * @since 4.0.0
 */
export class StackTrace extends /*#__PURE__*/Context.Service()("effect/Cause/StackTrace") {}
/**
 * `Context` key for the stack frame captured at the point of
 * interruption.
 *
 * Similar to {@link StackTrace} but specific to {@link Interrupt} reasons.
 *
 * @category annotations
 * @since 4.0.0
 */
export class InterruptorStackTrace extends /*#__PURE__*/Context.Service()("effect/Cause/InterruptorStackTrace") {}
//# sourceMappingURL=Cause.js.map