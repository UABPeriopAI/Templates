import * as Combiner from "./Combiner.js";
import * as Equal from "./Equal.js";
import * as Equivalence from "./Equivalence.js";
import { constNull, constUndefined, dual, identity } from "./Function.js";
import * as doNotation from "./internal/doNotation.js";
import * as option from "./internal/option.js";
import * as result from "./internal/result.js";
import * as order from "./Order.js";
import { isFunction } from "./Predicate.js";
import * as Reducer from "./Reducer.js";
const TypeId = "~effect/data/Option";
/**
 * Creates an `Option` representing the absence of a value.
 *
 * **When to use**
 *
 * - Representing a missing or uninitialized value
 * - Returning "no result" from a function
 *
 * **Behavior**
 *
 * - Returns `Option<never>`, which is a subtype of `Option<A>` for any `A`
 * - Always returns the same singleton instance
 *
 * **Example** (Creating an empty Option)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * //      ┌─── Option<never>
 * //      ▼
 * const noValue = Option.none()
 *
 * console.log(noValue)
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link some} for the opposite operation.
 *
 * @category Constructors
 * @since 2.0.0
 */
export const none = () => option.none;
/**
 * Wraps the given value into an `Option` to represent its presence.
 *
 * **When to use**
 *
 * - Wrapping a known-present value as `Option`
 * - Returning a successful result from a partial function
 *
 * **Behavior**
 *
 * - Always returns `Some<A>`
 * - Does not filter `null` or `undefined`; use {@link fromNullishOr} for that
 *
 * **Example** (Wrapping a value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * //      ┌─── Option<number>
 * //      ▼
 * const value = Option.some(1)
 *
 * console.log(value)
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 * ```
 *
 * @see {@link none} for the opposite operation.
 *
 * @category Constructors
 * @since 2.0.0
 */
export const some = option.some;
/**
 * Determines whether the given value is an `Option`.
 *
 * **When to use**
 *
 * - Validating unknown values at runtime boundaries
 * - Type-narrowing in union types
 *
 * **Behavior**
 *
 * - Returns `true` for both `Some` and `None` instances
 * - Acts as a type guard, narrowing the input to `Option<unknown>`
 *
 * **Example** (Checking if a value is an Option)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isOption(Option.some(1)))
 * // Output: true
 *
 * console.log(Option.isOption(Option.none()))
 * // Output: true
 *
 * console.log(Option.isOption({}))
 * // Output: false
 * ```
 *
 * @see {@link isNone} to check for `None` specifically
 * @see {@link isSome} to check for `Some` specifically
 *
 * @category Guards
 * @since 2.0.0
 */
export const isOption = option.isOption;
/**
 * Checks whether an `Option` is `None` (absent).
 *
 * **When to use**
 *
 * - Branching on absence before accessing `.value`
 *
 * **Behavior**
 *
 * - Acts as a type guard, narrowing to `None<A>`
 *
 * **Example** (Checking for None)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isNone(Option.some(1)))
 * // Output: false
 *
 * console.log(Option.isNone(Option.none()))
 * // Output: true
 * ```
 *
 * @see {@link isSome} for the opposite check.
 *
 * @category Guards
 * @since 2.0.0
 */
export const isNone = option.isNone;
/**
 * Checks whether an `Option` contains a value (`Some`).
 *
 * **When to use**
 *
 * - Branching on presence before accessing `.value`
 *
 * **Behavior**
 *
 * - Acts as a type guard, narrowing to `Some<A>`
 *
 * **Example** (Checking for Some)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.isSome(Option.some(1)))
 * // Output: true
 *
 * console.log(Option.isSome(Option.none()))
 * // Output: false
 * ```
 *
 * @see {@link isNone} for the opposite check.
 *
 * @category Guards
 * @since 2.0.0
 */
export const isSome = option.isSome;
/**
 * Pattern-matches on an `Option`, handling both `None` and `Some` cases.
 *
 * **When to use**
 *
 * - Exhaustively handling both branches in one expression
 * - Transforming an `Option` into a plain value
 *
 * **Behavior**
 *
 * - If `None`, calls `onNone` and returns its result
 * - If `Some`, calls `onSome` with the value and returns its result
 * - Supports the `dual` API (data-last and data-first)
 *
 * **Example** (Matching on an Option)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const message = Option.match(Option.some(1), {
 *   onNone: () => "Option is empty",
 *   onSome: (value) => `Option has a value: ${value}`
 * })
 *
 * console.log(message)
 * // Output: "Option has a value: 1"
 * ```
 *
 * @see {@link getOrElse} for unwrapping with a default
 *
 * @category Pattern matching
 * @since 2.0.0
 */
export const match = /*#__PURE__*/dual(2, (self, {
  onNone,
  onSome
}) => isNone(self) ? onNone() : onSome(self.value));
/**
 * Converts an `Option`-returning function into a type guard (refinement).
 *
 * **When to use**
 *
 * - Turning a parsing function into a type-narrowing predicate
 * - Filtering arrays with `Array.prototype.filter`
 *
 * **Behavior**
 *
 * - Returns `true` when the original function returns `Some`
 * - Returns `false` when the original function returns `None`
 * - Narrows the input type to `B` on success
 *
 * **Example** (Converting a parser to a type guard)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * type MyData = string | number
 *
 * const parseString = (data: MyData): Option.Option<string> =>
 *   typeof data === "string" ? Option.some(data) : Option.none()
 *
 * //      ┌─── (a: MyData) => a is string
 * //      ▼
 * const isString = Option.toRefinement(parseString)
 *
 * console.log(isString("a"))
 * // Output: true
 *
 * console.log(isString(1))
 * // Output: false
 * ```
 *
 * @see {@link liftPredicate} for the reverse direction
 *
 * @category Conversions
 * @since 2.0.0
 */
export const toRefinement = f => a => isSome(f(a));
/**
 * Wraps the first element of an `Iterable` in a `Some`, or returns `None` if
 * the iterable is empty.
 *
 * **When to use**
 *
 * - Safely extracting the head of a collection
 * - Working with generators or lazy iterables
 *
 * **Behavior**
 *
 * - Only consumes the first element; does not iterate the rest
 * - Returns `None` for empty iterables
 *
 * **Example** (Getting the first element)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromIterable([1, 2, 3]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(Option.fromIterable([]))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link toArray} for the inverse direction
 *
 * @category Constructors
 * @since 2.0.0
 */
export const fromIterable = collection => {
  for (const a of collection) {
    return some(a);
  }
  return none();
};
/**
 * Converts a `Result` into an `Option`, keeping only the success value.
 *
 * **When to use**
 *
 * - Discarding the error channel when you only care about success
 *
 * **Behavior**
 *
 * - `Ok` → `Some` with the success value
 * - `Err` → `None` (error is discarded)
 *
 * **Example** (Extracting the success side)
 *
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Option.getSuccess(Result.succeed("ok")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'ok' }
 *
 * console.log(Option.getSuccess(Result.fail("err")))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link getFailure} for the opposite operation.
 *
 * @category Conversions
 * @since 2.0.0
 */
export const getSuccess = result.getSuccess;
/**
 * Converts a `Result` into an `Option`, keeping only the error value.
 *
 * **When to use**
 *
 * - Extracting the error when you don't need the success channel
 *
 * **Behavior**
 *
 * - `Err` → `Some` with the error value
 * - `Ok` → `None` (success value is discarded)
 *
 * **Example** (Extracting the failure side)
 *
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Option.getFailure(Result.succeed("ok")))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.getFailure(Result.fail("err")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'err' }
 * ```
 *
 * @see {@link getSuccess} for the opposite operation.
 *
 * @category Conversions
 * @since 2.0.0
 */
export const getFailure = result.getFailure;
/**
 * Extracts the value from a `Some`, or evaluates a fallback thunk on `None`.
 *
 * **When to use**
 *
 * - Providing a default value for an absent `Option`
 * - Unwrapping with lazy evaluation of the fallback
 *
 * **Behavior**
 *
 * - `Some` → returns the inner value
 * - `None` → calls `onNone()` and returns its result
 * - `onNone` is only called when needed (lazy)
 *
 * **Example** (Unwrapping with a fallback)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.some(1).pipe(Option.getOrElse(() => 0)))
 * // Output: 1
 *
 * console.log(Option.none().pipe(Option.getOrElse(() => 0)))
 * // Output: 0
 * ```
 *
 * @see {@link getOrNull} to fall back to `null`
 * @see {@link getOrUndefined} to fall back to `undefined`
 * @see {@link getOrThrow} to throw on `None`
 *
 * @category Getters
 * @since 2.0.0
 */
export const getOrElse = /*#__PURE__*/dual(2, (self, onNone) => isNone(self) ? onNone() : self.value);
/**
 * Returns the fallback `Option` if `self` is `None`; otherwise returns `self`.
 *
 * **When to use**
 *
 * - Chaining fallback `Option` computations
 * - Building priority chains of optional values
 *
 * **Behavior**
 *
 * - `Some` → returns `self` unchanged
 * - `None` → evaluates and returns `that()`
 * - `that` is lazily evaluated
 *
 * **Example** (Providing a fallback Option)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.none().pipe(Option.orElse(() => Option.some("b"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'b' }
 *
 * console.log(Option.some("a").pipe(Option.orElse(() => Option.some("b"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'a' }
 * ```
 *
 * @see {@link orElseSome} to wrap the fallback value in `Some` automatically
 * @see {@link firstSomeOf} to pick the first `Some` from a collection
 *
 * @category Error handling
 * @since 2.0.0
 */
export const orElse = /*#__PURE__*/dual(2, (self, that) => isNone(self) ? that() : self);
/**
 * Returns `Some` of the fallback value if `self` is `None`; otherwise returns
 * `self`.
 *
 * **When to use**
 *
 * - Providing a default plain value (not an `Option`) as fallback
 *
 * **Behavior**
 *
 * - `Some` → returns `self` unchanged
 * - `None` → calls `onNone()`, wraps result in `Some`, and returns it
 *
 * **Example** (Providing a fallback value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.none().pipe(Option.orElseSome(() => "b")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'b' }
 *
 * console.log(Option.some("a").pipe(Option.orElseSome(() => "b")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'a' }
 * ```
 *
 * @see {@link orElse} when the fallback is itself an `Option`
 *
 * @category Error handling
 * @since 2.0.0
 */
export const orElseSome = /*#__PURE__*/dual(2, (self, onNone) => isNone(self) ? some(onNone()) : self);
/**
 * Like {@link orElse}, but wraps the result in a `Result` to indicate the
 * source of the value.
 *
 * **When to use**
 *
 * - Distinguishing whether a value came from the primary or fallback `Option`
 *
 * **Behavior**
 *
 * - `self` is `Some` → `Some(Result.fail(value))` (value from primary)
 * - `self` is `None`, `that()` is `Some` → `Some(Result.succeed(value))` (value from fallback)
 * - Both `None` → `None`
 *
 * **Example** (Tracking value source)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.orElseResult(Option.some("primary"), () => Option.some("fallback")))
 * // Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Failure', value: 'primary' } }
 *
 * console.log(Option.orElseResult(Option.none(), () => Option.some("fallback")))
 * // Output: { _id: 'Option', _tag: 'Some', value: { _tag: 'Success', value: 'fallback' } }
 * ```
 *
 * @see {@link orElse} for the simpler variant without source tracking
 *
 * @category Error handling
 * @since 2.0.0
 */
export const orElseResult = /*#__PURE__*/dual(2, (self, that) => isNone(self) ? map(that(), result.succeed) : map(self, result.fail));
/**
 * Returns the first `Some` found in an iterable of `Option`s, or `None` if
 * all are `None`.
 *
 * **When to use**
 *
 * - Searching for the first available value in a priority list
 *
 * **Behavior**
 *
 * - Short-circuits on the first `Some`
 * - Returns `None` only when every element is `None`
 *
 * **Example** (Finding the first Some)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.firstSomeOf([
 *   Option.none(),
 *   Option.some(1),
 *   Option.some(2)
 * ]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 * ```
 *
 * @see {@link orElse} for a two-option fallback
 *
 * @category Error handling
 * @since 2.0.0
 */
export const firstSomeOf = collection => {
  let out = none();
  for (out of collection) {
    if (isSome(out)) {
      return out;
    }
  }
  return out;
};
/**
 * Converts a nullable value (`null` or `undefined`) into an `Option`.
 *
 * **When to use**
 *
 * - Bridging from nullable APIs to `Option`
 * - Wrapping values that may be `null` or `undefined`
 *
 * **Behavior**
 *
 * - `null` or `undefined` → `None`
 * - Any other value → `Some` (typed as `NonNullable<A>`)
 *
 * **Example** (From nullable values)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullishOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullishOr(1))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 * ```
 *
 * @see {@link fromNullOr} to only treat `null` as absent
 * @see {@link fromUndefinedOr} to only treat `undefined` as absent
 * @see {@link liftNullishOr} to lift a nullable-returning function
 *
 * @category Conversions
 * @since 2.0.0
 */
export const fromNullishOr = a => a == null ? none() : some(a);
/**
 * Converts a possibly `undefined` value into an `Option`, leaving `null`
 * as a valid `Some`.
 *
 * **When to use**
 *
 * - When `null` is a meaningful value but `undefined` means absent
 *
 * **Behavior**
 *
 * - `undefined` → `None`
 * - Any other value (including `null`) → `Some`
 *
 * **Example** (From possibly-undefined values)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromUndefinedOr(undefined))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromUndefinedOr(null))
 * // Output: { _id: 'Option', _tag: 'Some', value: null }
 *
 * console.log(Option.fromUndefinedOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
 * ```
 *
 * @see {@link fromNullishOr} to treat both `null` and `undefined` as absent
 * @see {@link fromNullOr} to only treat `null` as absent
 *
 * @category Conversions
 * @since 4.0.0
 */
export const fromUndefinedOr = a => a === undefined ? none() : some(a);
/**
 * Converts a possibly `null` value into an `Option`, leaving `undefined`
 * as a valid `Some`.
 *
 * **When to use**
 *
 * - When `undefined` is a meaningful value but `null` means absent
 *
 * **Behavior**
 *
 * - `null` → `None`
 * - Any other value (including `undefined`) → `Some`
 *
 * **Example** (From possibly-null values)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.fromNullOr(null))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(Option.fromNullOr(undefined))
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 *
 * console.log(Option.fromNullOr(42))
 * // Output: { _id: 'Option', _tag: 'Some', value: 42 }
 * ```
 *
 * @see {@link fromNullishOr} to treat both `null` and `undefined` as absent
 * @see {@link fromUndefinedOr} to only treat `undefined` as absent
 *
 * @category Conversions
 * @since 4.0.0
 */
export const fromNullOr = a => a === null ? none() : some(a);
/**
 * Lifts a function that may return `null` or `undefined` into one that returns
 * an `Option`.
 *
 * **When to use**
 *
 * - Wrapping existing nullable-returning functions for use in `Option` pipelines
 *
 * **Behavior**
 *
 * - Calls the original function with the given arguments
 * - Wraps the result via {@link fromNullishOr}
 *
 * **Example** (Lifting a parser)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = (s: string): number | undefined => {
 *   const n = parseFloat(s)
 *   return isNaN(n) ? undefined : n
 * }
 *
 * const parseOption = Option.liftNullishOr(parse)
 *
 * console.log(parseOption("1"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(parseOption("not a number"))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link fromNullishOr} for converting a single value
 * @see {@link liftThrowable} for functions that throw instead
 *
 * @category Conversions
 * @since 2.0.0
 */
export const liftNullishOr = f => (...a) => fromNullishOr(f(...a));
/**
 * Extracts the value from a `Some`, or returns `null` for `None`.
 *
 * **When to use**
 *
 * - Interoping with APIs that use `null` for missing values
 *
 * **Behavior**
 *
 * - `Some` → the inner value
 * - `None` → `null`
 *
 * **Example** (Unwrapping to null)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrNull(Option.some(1)))
 * // Output: 1
 *
 * console.log(Option.getOrNull(Option.none()))
 * // Output: null
 * ```
 *
 * @see {@link getOrUndefined} to return `undefined` instead
 * @see {@link getOrElse} for a custom fallback
 *
 * @category Getters
 * @since 2.0.0
 */
export const getOrNull = /*#__PURE__*/getOrElse(constNull);
/**
 * Extracts the value from a `Some`, or returns `undefined` for `None`.
 *
 * **When to use**
 *
 * - Interoping with APIs that use `undefined` for missing values
 *
 * **Behavior**
 *
 * - `Some` → the inner value
 * - `None` → `undefined`
 *
 * **Example** (Unwrapping to undefined)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrUndefined(Option.some(1)))
 * // Output: 1
 *
 * console.log(Option.getOrUndefined(Option.none()))
 * // Output: undefined
 * ```
 *
 * @see {@link getOrNull} to return `null` instead
 * @see {@link getOrElse} for a custom fallback
 *
 * @category Getters
 * @since 2.0.0
 */
export const getOrUndefined = /*#__PURE__*/getOrElse(constUndefined);
/**
 * Lifts a function that may throw into one that returns an `Option`.
 *
 * **When to use**
 *
 * - Wrapping exception-throwing APIs (e.g. `JSON.parse`) for safe usage
 *
 * **Behavior**
 *
 * - If the function returns normally → `Some` with the result
 * - If the function throws → `None` (exception is swallowed)
 *
 * **Example** (Lifting JSON.parse)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = Option.liftThrowable(JSON.parse)
 *
 * console.log(parse("1"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(parse(""))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link liftNullishOr} for nullable-returning functions
 *
 * @category Conversions
 * @since 2.0.0
 */
export const liftThrowable = f => (...a) => {
  try {
    return some(f(...a));
  } catch {
    return none();
  }
};
/**
 * Extracts the value from a `Some`, or throws a custom error for `None`.
 *
 * **When to use**
 *
 * - Fail-fast unwrapping when absence is unexpected
 * - Providing a descriptive error for debugging
 *
 * **Behavior**
 *
 * - `Some` → returns the inner value
 * - `None` → throws the value returned by `onNone()`
 *
 * **Example** (Throwing a custom error)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrThrowWith(Option.some(1), () => new Error("missing")))
 * // Output: 1
 *
 * Option.getOrThrowWith(Option.none(), () => new Error("missing"))
 * // throws Error: missing
 * ```
 *
 * @see {@link getOrThrow} for a version with a default error
 * @see {@link getOrElse} for a non-throwing alternative
 *
 * @category Conversions
 * @since 2.0.0
 */
export const getOrThrowWith = /*#__PURE__*/dual(2, (self, onNone) => {
  if (isSome(self)) {
    return self.value;
  }
  throw onNone();
});
/**
 * Extracts the value from a `Some`, or throws a default `Error` for `None`.
 *
 * **When to use**
 *
 * - Quick fail-fast unwrapping when a generic error is acceptable
 *
 * **Behavior**
 *
 * - `Some` → returns the inner value
 * - `None` → throws `new Error("getOrThrow called on a None")`
 *
 * **Example** (Throwing a default error)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.getOrThrow(Option.some(1)))
 * // Output: 1
 *
 * Option.getOrThrow(Option.none())
 * // throws Error: getOrThrow called on a None
 * ```
 *
 * @see {@link getOrThrowWith} for a custom error
 * @see {@link getOrElse} for a non-throwing alternative
 *
 * @category Conversions
 * @since 2.0.0
 */
export const getOrThrow = /*#__PURE__*/getOrThrowWith(() => new Error("getOrThrow called on a None"));
/**
 * Transforms the value inside a `Some` using the provided function, leaving
 * `None` unchanged.
 *
 * **When to use**
 *
 * - Applying a pure transformation to an optional value
 * - Chaining transformations in a pipeline
 *
 * **Behavior**
 *
 * - `Some` → applies `f` and wraps the result in a new `Some`
 * - `None` → returns `None` unchanged
 * - Does not mutate the input
 *
 * **Example** (Mapping over an Option)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.map(Option.some(2), (n) => n * 2))
 * // Output: { _id: 'Option', _tag: 'Some', value: 4 }
 *
 * console.log(Option.map(Option.none(), (n: number) => n * 2))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link flatMap} when `f` returns an `Option`
 * @see {@link as} to replace the value with a constant
 *
 * @category Mapping
 * @since 2.0.0
 */
export const map = /*#__PURE__*/dual(2, (self, f) => isNone(self) ? none() : some(f(self.value)));
/**
 * Replaces the value inside a `Some` with a constant, leaving `None` unchanged.
 *
 * **When to use**
 *
 * - Preserving presence/absence while discarding the original value
 *
 * **Behavior**
 *
 * - `Some` → `Some(b)`
 * - `None` → `None`
 *
 * **Example** (Replacing a value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.as(Option.some(42), "new value"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'new value' }
 *
 * console.log(Option.as(Option.none(), "new value"))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link asVoid} to replace with `undefined`
 * @see {@link map} for a general transformation
 *
 * @category Mapping
 * @since 2.0.0
 */
export const as = /*#__PURE__*/dual(2, (self, b) => map(self, () => b));
/**
 * Replaces the value inside a `Some` with `void` (`undefined`), leaving `None`
 * unchanged.
 *
 * **When to use**
 *
 * - Discarding the value while preserving presence/absence
 *
 * **Behavior**
 *
 * - `Some` → `Some(undefined)`
 * - `None` → `None`
 *
 * **Example** (Voiding the value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.asVoid(Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 *
 * console.log(Option.asVoid(Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link as} to replace with a specific constant
 *
 * @category Mapping
 * @since 2.0.0
 */
export const asVoid = /*#__PURE__*/as(undefined);
const void_ = /*#__PURE__*/some(undefined);
export {
/**
 * A pre-built `Some(undefined)` constant.
 *
 * **When to use**
 *
 * - Returning a "success with no meaningful value" from an `Option`-returning function
 *
 * **Example** (Using Option.void)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.void)
 * // Output: { _id: 'Option', _tag: 'Some', value: undefined }
 * ```
 *
 * @see {@link asVoid} to convert an existing `Option` to `Option<void>`
 *
 * @category Constructors
 * @since 2.0.0
 */
void_ as void };
/**
 * Applies a function that returns an `Option` to the value of a `Some`,
 * flattening the result. Returns `None` if the input is `None`.
 *
 * **When to use**
 *
 * - Chaining computations that each may fail (return `None`)
 * - Sequencing dependent optional operations
 *
 * **Behavior**
 *
 * - `Some` → applies `f` to the value and returns its `Option` result
 * - `None` → returns `None` without calling `f`
 * - Equivalent to `map` followed by {@link flatten}
 *
 * **Example** (Chaining optional lookups)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * interface User {
 *   readonly name: string
 *   readonly address: Option.Option<{ readonly street: Option.Option<string> }>
 * }
 *
 * const user: User = {
 *   name: "John",
 *   address: Option.some({ street: Option.some("123 Main St") })
 * }
 *
 * const street = user.address.pipe(
 *   Option.flatMap((addr) => addr.street)
 * )
 *
 * console.log(street)
 * // Output: { _id: 'Option', _tag: 'Some', value: '123 Main St' }
 * ```
 *
 * @see {@link map} when `f` returns a plain value
 * @see {@link andThen} for a more flexible variant
 * @see {@link flatten} to unwrap a nested `Option<Option<A>>`
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const flatMap = /*#__PURE__*/dual(2, (self, f) => isNone(self) ? none() : f(self.value));
/**
 * Chains a second computation onto an `Option`. The second value can be a
 * plain value, an `Option`, or a function returning either.
 *
 * **When to use**
 *
 * - Flexible chaining where the next step may return `Option`, a plain value,
 *   or a function
 *
 * **Behavior**
 *
 * - If `self` is `None`, returns `None` immediately
 * - If `f` is a function, calls it with the `Some` value
 * - If `f` returns an `Option`, returns it as-is; if a plain value, wraps in `Some`
 * - If `f` is not a function, uses it directly (same wrapping rules)
 *
 * **Example** (Chaining with andThen)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * // Chain with a function returning Option
 * console.log(Option.andThen(Option.some(5), (x) => Option.some(x * 2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 10 }
 *
 * // Chain with a static value
 * console.log(Option.andThen(Option.some(5), "hello"))
 * // Output: { _id: 'Option', _tag: 'Some', value: "hello" }
 *
 * // Chain with None - skips
 * console.log(Option.andThen(Option.none(), (x) => Option.some(x * 2)))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link flatMap} for the standard monadic bind
 * @see {@link map} when you always return a plain value
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const andThen = /*#__PURE__*/dual(2, (self, f) => flatMap(self, a => {
  const b = isFunction(f) ? f(a) : f;
  return isOption(b) ? b : some(b);
}));
/**
 * Combines {@link flatMap} with {@link fromNullishOr}: applies a function that
 * may return `null`/`undefined` to the value of a `Some`.
 *
 * **When to use**
 *
 * - Chaining with functions that use `null`/`undefined` instead of `Option`
 * - Navigating deeply nested optional properties
 *
 * **Behavior**
 *
 * - `None` → `None`
 * - `Some` → applies `f`, then wraps via {@link fromNullishOr}
 *
 * **Example** (Navigating optional properties)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * interface Employee {
 *   company?: { address?: { street?: { name?: string } } }
 * }
 *
 * const emp: Employee = {
 *   company: { address: { street: { name: "high street" } } }
 * }
 *
 * console.log(
 *   Option.some(emp).pipe(
 *     Option.flatMapNullishOr((e) => e.company?.address?.street?.name)
 *   )
 * )
 * // Output: { _id: 'Option', _tag: 'Some', value: 'high street' }
 * ```
 *
 * @see {@link flatMap} when the function already returns `Option`
 * @see {@link fromNullishOr} for single-value conversion
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const flatMapNullishOr = /*#__PURE__*/dual(2, (self, f) => isNone(self) ? none() : fromNullishOr(f(self.value)));
/**
 * Flattens a nested `Option<Option<A>>` into `Option<A>`.
 *
 * **When to use**
 *
 * - Removing one layer of `Option` nesting
 *
 * **Behavior**
 *
 * - `Some(Some(value))` → `Some(value)`
 * - `Some(None)` → `None`
 * - `None` → `None`
 *
 * **Example** (Flattening nested Options)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.flatten(Option.some(Option.some("value"))))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'value' }
 *
 * console.log(Option.flatten(Option.some(Option.none())))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link flatMap} which is `map` + `flatten`
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const flatten = /*#__PURE__*/flatMap(identity);
/**
 * Sequences two `Option`s, keeping the value from the second if both are `Some`.
 *
 * **When to use**
 *
 * - Running a side-condition that must succeed, then using the second value
 *
 * **Behavior**
 *
 * - Both `Some` → returns `that`
 * - Either `None` → returns `None`
 *
 * **Example** (Keeping the second value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.zipRight(Option.some(1), Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(Option.zipRight(Option.none(), Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link zipLeft} to keep the first value instead
 * @see {@link zipWith} to combine both values
 *
 * @category Zipping
 * @since 2.0.0
 */
export const zipRight = /*#__PURE__*/dual(2, (self, that) => flatMap(self, () => that));
/**
 * Sequences two `Option`s, keeping the value from the first if both are `Some`.
 *
 * **When to use**
 *
 * - Running a validation that must succeed, but keeping the original value
 *
 * **Behavior**
 *
 * - Both `Some` → returns `self`
 * - Either `None` → returns `None`
 *
 * **Example** (Keeping the first value)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.zipLeft(Option.some("hello"), Option.some(1)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(Option.zipLeft(Option.some("hello"), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link zipRight} to keep the second value instead
 * @see {@link zipWith} to combine both values
 *
 * @category Zipping
 * @since 2.0.0
 */
export const zipLeft = /*#__PURE__*/dual(2, (self, that) => tap(self, () => that));
/**
 * Composes two `Option`-returning functions into a single function that chains
 * them together.
 *
 * **When to use**
 *
 * - Building pipelines of partial functions (Kleisli composition)
 *
 * **Behavior**
 *
 * - Calls `afb(a)`, then if `Some`, calls `bfc` with its value
 * - Short-circuits to `None` if either function returns `None`
 *
 * **Example** (Composing parsers)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const parse = (s: string): Option.Option<number> =>
 *   isNaN(Number(s)) ? Option.none() : Option.some(Number(s))
 *
 * const double = (n: number): Option.Option<number> =>
 *   n > 0 ? Option.some(n * 2) : Option.none()
 *
 * const parseAndDouble = Option.composeK(parse, double)
 *
 * console.log(parseAndDouble("42"))
 * // Output: { _id: 'Option', _tag: 'Some', value: 84 }
 *
 * console.log(parseAndDouble("not a number"))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link flatMap} for single-step chaining
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const composeK = /*#__PURE__*/dual(2, (afb, bfc) => a => flatMap(afb(a), bfc));
/**
 * Runs a side-effecting `Option`-returning function on the value of a `Some`,
 * returning the original `Option` if the function returns `Some`, or `None`
 * if it returns `None`.
 *
 * **When to use**
 *
 * - Validating a value without transforming it
 * - Adding a side-condition check in a pipeline
 *
 * **Behavior**
 *
 * - `None` → `None`
 * - `Some` → calls `f(value)`; if result is `Some`, returns original `self`; if `None`, returns `None`
 *
 * **Example** (Validating without transforming)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const getInteger = (n: number) =>
 *   Number.isInteger(n) ? Option.some(n) : Option.none()
 *
 * console.log(Option.tap(Option.some(1), getInteger))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(Option.tap(Option.some(1.14), getInteger))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link flatMap} when you want to transform the value
 * @see {@link filter} for predicate-based filtering
 *
 * @category Sequencing
 * @since 2.0.0
 */
export const tap = /*#__PURE__*/dual(2, (self, f) => flatMap(self, a => map(f(a), () => a)));
/**
 * Combines two `Option`s into a `Some` containing a tuple `[A, B]` if both
 * are `Some`.
 *
 * **When to use**
 *
 * - Pairing two optional values together
 *
 * **Behavior**
 *
 * - Both `Some` → `Some([a, b])`
 * - Either `None` → `None`
 *
 * **Example** (Pairing two Options)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.product(Option.some("hello"), Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'Some', value: ['hello', 42] }
 *
 * console.log(Option.product(Option.none(), Option.some(42)))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link zipWith} to combine with a function instead of a tuple
 * @see {@link all} to combine many `Option`s
 *
 * @category Combining
 * @since 2.0.0
 */
export const product = (self, that) => isSome(self) && isSome(that) ? some([self.value, that.value]) : none();
/**
 * Combines a primary `Option` with an iterable of `Option`s into a tuple if
 * all are `Some`.
 *
 * **When to use**
 *
 * - Collecting several `Option`s of the same type into a non-empty tuple
 *
 * **Behavior**
 *
 * - All `Some` → `Some([self.value, ...rest])`
 * - Any `None` → `None`
 *
 * **Example** (Combining many Options)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const first = Option.some(1)
 * const rest = [Option.some(2), Option.some(3)]
 *
 * console.log(Option.productMany(first, rest))
 * // Output: { _id: 'Option', _tag: 'Some', value: [1, 2, 3] }
 *
 * console.log(Option.productMany(first, [Option.some(2), Option.none()]))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link product} for combining exactly two
 * @see {@link all} for tuples, structs, and iterables
 *
 * @category Combining
 * @since 2.0.0
 */
export const productMany = (self, collection) => {
  if (isNone(self)) {
    return none();
  }
  const out = [self.value];
  for (const o of collection) {
    if (isNone(o)) {
      return none();
    }
    out.push(o.value);
  }
  return some(out);
};
/**
 * Combines a structure of `Option`s (tuple, struct, or iterable) into a single
 * `Option` containing the unwrapped structure.
 *
 * **When to use**
 *
 * - Collecting multiple `Option`s into one, preserving the input shape
 * - "All or nothing" combination — any `None` makes the result `None`
 *
 * **Behavior**
 *
 * - Tuple input → `Option` of a tuple with the same length
 * - Struct input → `Option` of a struct with the same keys
 * - Iterable input → `Option` of an `Array`
 * - Any `None` in the input → entire result is `None`
 *
 * **Example** (Combining a tuple and a struct)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const maybeName: Option.Option<string> = Option.some("John")
 * const maybeAge: Option.Option<number> = Option.some(25)
 *
 * //      ┌─── Option<[string, number]>
 * //      ▼
 * const tuple = Option.all([maybeName, maybeAge])
 * console.log(tuple)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: [ 'John', 25 ] }
 *
 * //      ┌─── Option<{ name: string; age: number; }>
 * //      ▼
 * const struct = Option.all({ name: maybeName, age: maybeAge })
 * console.log(struct)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'John', age: 25 } }
 * ```
 *
 * @see {@link product} for combining exactly two
 * @see {@link productMany} for a homogeneous collection
 *
 * @category Combining
 * @since 2.0.0
 */
// @ts-expect-error
export const all = input => {
  if (Symbol.iterator in input) {
    const out = [];
    for (const o of input) {
      if (isNone(o)) {
        return none();
      }
      out.push(o.value);
    }
    return some(out);
  }
  const out = {};
  for (const key of Object.keys(input)) {
    const o = input[key];
    if (isNone(o)) {
      return none();
    }
    out[key] = o.value;
  }
  return some(out);
};
/**
 * Combines two `Option`s using a provided function.
 *
 * **When to use**
 *
 * - Merging two optional values into a computed result
 *
 * **Behavior**
 *
 * - Both `Some` → applies `f(a, b)` and wraps in `Some`
 * - Either `None` → `None`
 *
 * **Example** (Combining with a function)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const person = Option.zipWith(
 *   Option.some("John"),
 *   Option.some(25),
 *   (name, age) => ({ name: name.toUpperCase(), age })
 * )
 *
 * console.log(person)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }
 * ```
 *
 * @see {@link product} to combine into a tuple instead
 * @see {@link lift2} to lift a binary function
 *
 * @category Zipping
 * @since 2.0.0
 */
export const zipWith = /*#__PURE__*/dual(3, (self, that, f) => map(product(self, that), ([a, b]) => f(a, b)));
/**
 * Reduces an iterable of `Option`s to a single value, skipping `None` entries.
 *
 * **When to use**
 *
 * - Aggregating values from a collection where some may be absent
 *
 * **Behavior**
 *
 * - Iterates through the collection, applying `f` only to `Some` values
 * - `None` values are skipped entirely
 * - Returns the accumulated result
 *
 * **Example** (Summing present values)
 *
 * ```ts
 * import { Option, pipe } from "effect"
 *
 * const items = [Option.some(1), Option.none(), Option.some(2), Option.none()]
 *
 * console.log(pipe(items, Option.reduceCompact(0, (b, a) => b + a)))
 * // Output: 3
 * ```
 *
 * @category Reducing
 * @since 2.0.0
 */
export const reduceCompact = /*#__PURE__*/dual(3, (self, b, f) => {
  let out = b;
  for (const oa of self) {
    if (isSome(oa)) {
      out = f(out, oa.value);
    }
  }
  return out;
});
/**
 * Converts an `Option` into an `Array`.
 *
 * **When to use**
 *
 * - Interfacing with array-based APIs
 * - Spreading optional values into collections
 *
 * **Behavior**
 *
 * - `Some` → single-element array `[value]`
 * - `None` → empty array `[]`
 *
 * **Example** (Converting to an array)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.toArray(Option.some(1)))
 * // Output: [1]
 *
 * console.log(Option.toArray(Option.none()))
 * // Output: []
 * ```
 *
 * @see {@link fromIterable} for the inverse direction
 *
 * @category Conversions
 * @since 2.0.0
 */
export const toArray = self => isNone(self) ? [] : [self.value];
/**
 * Splits an `Option` into two `Option`s using a function that returns a `Result`.
 *
 * **When to use**
 *
 * - Categorizing an optional value into "left" (failure) and "right" (success) channels
 *
 * **Behavior**
 *
 * - `None` → `[None, None]`
 * - `Some` where `f` returns `Err` → `[Some(error), None]`
 * - `Some` where `f` returns `Ok` → `[None, Some(value)]`
 *
 * **Example** (Partitioning by Result)
 *
 * ```ts
 * import { Option, Result } from "effect"
 *
 * const parseNumber = (s: string): Result.Result<number, string> => {
 *   const n = Number(s)
 *   return isNaN(n) ? Result.fail("Not a number") : Result.succeed(n)
 * }
 *
 * console.log(Option.partitionMap(Option.some("42"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'Some', value: 42 }]
 *
 * console.log(Option.partitionMap(Option.some("abc"), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'Some', value: 'Not a number' }, { _id: 'Option', _tag: 'None' }]
 *
 * console.log(Option.partitionMap(Option.none(), parseNumber))
 * // Output: [{ _id: 'Option', _tag: 'None' }, { _id: 'Option', _tag: 'None' }]
 * ```
 *
 * @see {@link filter} for simple predicate-based filtering
 *
 * @category Filtering
 * @since 2.0.0
 */
export const partitionMap = /*#__PURE__*/dual(2, (self, f) => {
  if (isNone(self)) {
    return [none(), none()];
  }
  const e = f(self.value);
  return result.isFailure(e) ? [some(e.failure), none()] : [none(), some(e.success)];
});
/**
 * Transforms and filters an `Option` using a `Filter` callback.
 *
 * The callback returns a `Result`: `Result.succeed` keeps and transforms the
 * value, while `Result.fail` discards it.
 *
 * **Example** (Filtering and transforming)
 *
 * ```ts
 * import { Option } from "effect"
 * import * as Result from "effect/Result"
 *
 * console.log(Option.filterMap(
 *   Option.some(2),
 *   (n) => (n % 2 === 0 ? Result.succeed(`Even: ${n}`) : Result.failVoid)
 * ))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'Even: 2' }
 * ```
 *
 * @see {@link filter} for predicate-based filtering
 *
 * @category Filtering
 * @since 2.0.0
 */
export const filterMap = /*#__PURE__*/dual(2, (self, f) => {
  if (isNone(self)) {
    return none();
  }
  const next = f(self.value);
  return result.isSuccess(next) ? some(next.success) : none();
});
/**
 * Filters an `Option` using a predicate. Returns `None` if the predicate is
 * not satisfied or the input is `None`.
 *
 * **When to use**
 *
 * - Discarding values that don't meet a condition
 * - Narrowing the type via a refinement predicate
 *
 * **Behavior**
 *
 * - `None` → `None`
 * - `Some` where `predicate(value)` is `true` → `Some(value)`
 * - `Some` where `predicate(value)` is `false` → `None`
 * - Supports refinements for type narrowing
 *
 * **Example** (Filtering with a predicate)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const removeEmpty = (input: Option.Option<string>) =>
 *   Option.filter(input, (value) => value !== "")
 *
 * console.log(removeEmpty(Option.some("hello")))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'hello' }
 *
 * console.log(removeEmpty(Option.some("")))
 * // Output: { _id: 'Option', _tag: 'None' }
 *
 * console.log(removeEmpty(Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link filterMap} to transform and filter simultaneously
 * @see {@link exists} to test without filtering
 *
 * @category Filtering
 * @since 2.0.0
 */
export const filter = /*#__PURE__*/dual(2, (self, predicate) => isNone(self) ? none() : predicate(self.value) ? some(self.value) : none());
/**
 * Creates an `Equivalence` for `Option<A>` from an `Equivalence` for `A`.
 *
 * **When to use**
 *
 * - Comparing two `Option` values for structural equality
 *
 * **Behavior**
 *
 * - `None` vs `None` → `true`
 * - `Some` vs `None` (or vice versa) → `false`
 * - `Some(a)` vs `Some(b)` → delegates to the provided `Equivalence`
 *
 * **Example** (Comparing Options)
 *
 * ```ts
 * import { Equivalence, Option } from "effect"
 *
 * const eq = Option.makeEquivalence(Equivalence.strictEqual<number>())
 *
 * console.log(eq(Option.some(1), Option.some(1)))
 * // Output: true
 *
 * console.log(eq(Option.some(1), Option.some(2)))
 * // Output: false
 *
 * console.log(eq(Option.none(), Option.none()))
 * // Output: true
 * ```
 *
 * @category Equivalence
 * @since 2.0.0
 */
export const makeEquivalence = isEquivalent => Equivalence.make((x, y) => isNone(x) ? isNone(y) : isNone(y) ? false : isEquivalent(x.value, y.value));
/**
 * Creates an `Order` for `Option<A>` from an `Order` for `A`.
 *
 * **When to use**
 *
 * - Sorting collections of `Option` values
 *
 * **Behavior**
 *
 * - `None` is considered less than any `Some`
 * - Two `Some` values are compared using the provided `Order`
 * - Two `None` values are equal (returns `0`)
 *
 * **Example** (Ordering Options)
 *
 * ```ts
 * import { Option } from "effect"
 * import * as N from "effect/Number"
 *
 * const ord = Option.makeOrder(N.Order)
 *
 * console.log(ord(Option.none(), Option.some(1)))
 * // Output: -1
 *
 * console.log(ord(Option.some(1), Option.none()))
 * // Output: 1
 *
 * console.log(ord(Option.some(1), Option.some(2)))
 * // Output: -1
 * ```
 *
 * @category Sorting
 * @since 2.0.0
 */
export const makeOrder = O => order.make((self, that) => isSome(self) ? isSome(that) ? O(self.value, that.value) : 1 : -1);
/**
 * Lifts a binary function to operate on two `Option` values.
 *
 * **When to use**
 *
 * - Reusing an existing binary function in an `Option` context
 *
 * **Behavior**
 *
 * - Both `Some` → applies `f` and wraps in `Some`
 * - Either `None` → `None`
 *
 * **Example** (Lifting addition)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const addOptions = Option.lift2((a: number, b: number) => a + b)
 *
 * console.log(addOptions(Option.some(2), Option.some(3)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 5 }
 *
 * console.log(addOptions(Option.some(2), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link zipWith} for a non-lifted variant
 *
 * @category Lifting
 * @since 2.0.0
 */
export const lift2 = f => dual(2, (self, that) => zipWith(self, that, f));
/**
 * Lifts a `Predicate` or `Refinement` into the `Option` context: returns
 * `Some(value)` when the predicate holds, `None` otherwise.
 *
 * **When to use**
 *
 * - Converting a boolean check into an `Option`-returning function
 * - Validating input and wrapping it in `Option`
 *
 * **Behavior**
 *
 * - `predicate(value)` is `true` → `Some(value)`
 * - `predicate(value)` is `false` → `None`
 * - Supports refinements for type narrowing
 *
 * **Example** (Validating positive numbers)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const parsePositive = Option.liftPredicate((n: number) => n > 0)
 *
 * console.log(parsePositive(1))
 * // Output: { _id: 'Option', _tag: 'Some', value: 1 }
 *
 * console.log(parsePositive(-1))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link filter} to apply a predicate to an existing `Option`
 * @see {@link toRefinement} for the inverse direction
 *
 * @category Lifting
 * @since 2.0.0
 */
export const liftPredicate = /*#__PURE__*/dual(2, (b, predicate) => predicate(b) ? some(b) : none());
/**
 * Checks if an `Option` contains a value equivalent to the given one, using a
 * custom `Equivalence`.
 *
 * **When to use**
 *
 * - Testing membership with a custom equality check
 *
 * **Behavior**
 *
 * - `Some` where `isEquivalent(value, a)` is `true` → `true`
 * - `Some` where not equivalent, or `None` → `false`
 *
 * **Example** (Custom equivalence check)
 *
 * ```ts
 * import { Equivalence, Option } from "effect"
 *
 * const check = Option.containsWith(Equivalence.strictEqual<number>())
 *
 * console.log(Option.some(2).pipe(check(2)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(check(2)))
 * // Output: false
 *
 * console.log(Option.none().pipe(check(2)))
 * // Output: false
 * ```
 *
 * @see {@link contains} for a version using default equality
 *
 * @category Elements
 * @since 2.0.0
 */
export const containsWith = isEquivalent => dual(2, (self, a) => isNone(self) ? false : isEquivalent(self.value, a));
/**
 * Checks if an `Option` contains a value equal to the given one, using default
 * structural equality.
 *
 * **When to use**
 *
 * - Quick membership test with standard equality
 *
 * **Behavior**
 *
 * - `Some` where `Equal.equals(value, a)` is `true` → `true`
 * - `Some` where not equal, or `None` → `false`
 *
 * **Example** (Checking containment)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * console.log(Option.some(2).pipe(Option.contains(2)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(Option.contains(2)))
 * // Output: false
 *
 * console.log(Option.none().pipe(Option.contains(2)))
 * // Output: false
 * ```
 *
 * @see {@link containsWith} for custom equality
 * @see {@link exists} to test with a predicate
 *
 * @category Elements
 * @since 2.0.0
 */
export const contains = /*#__PURE__*/containsWith(/*#__PURE__*/Equal.asEquivalence());
/**
 * Tests if the value in a `Some` satisfies a predicate or refinement.
 *
 * **When to use**
 *
 * - Checking a condition on an optional value without unwrapping
 *
 * **Behavior**
 *
 * - `None` → `false`
 * - `Some` where `predicate(value)` is `true` → `true`
 * - `Some` where `predicate(value)` is `false` → `false`
 * - With a refinement, narrows the `Option` type on `true`
 *
 * **Example** (Testing a condition)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const isEven = (n: number) => n % 2 === 0
 *
 * console.log(Option.some(2).pipe(Option.exists(isEven)))
 * // Output: true
 *
 * console.log(Option.some(1).pipe(Option.exists(isEven)))
 * // Output: false
 *
 * console.log(Option.none().pipe(Option.exists(isEven)))
 * // Output: false
 * ```
 *
 * @see {@link filter} to keep or discard based on a predicate
 * @see {@link contains} to test for a specific value
 *
 * @category Elements
 * @since 2.0.0
 */
export const exists = /*#__PURE__*/dual(2, (self, refinement) => isNone(self) ? false : refinement(self.value));
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * Gives a name to the value of an `Option`, creating a single-key record
 * inside `Some`. Starting point for the do notation pipeline.
 *
 * **When to use**
 *
 * - Beginning a do notation chain by naming the first value
 *
 * **Example** (Starting do notation)
 *
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.some(2),
 *   Option.bindTo("x"),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
 * ```
 *
 * @see {@link Do} for starting with an empty record
 * @see {@link bind} to add `Option` values
 * @see {@link let_ let} to add plain values
 *
 * @category Do notation
 * @since 2.0.0
 */
export const bindTo = /*#__PURE__*/doNotation.bindTo(map);
const let_ = /*#__PURE__*/doNotation.let_(map);
export {
/**
 * Adds a computed plain value to the do notation record.
 *
 * **When to use**
 *
 * - Binding a derived (non-`Option`) value in a do notation pipeline
 *
 * **Example** (Adding a computed value)
 *
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.Do,
 *   Option.bind("x", () => Option.some(2)),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
 * ```
 *
 * @see {@link Do} for starting the chain
 * @see {@link bind} to add `Option` values
 * @see {@link bindTo} to start by naming an existing `Option`
 *
 * @category Do notation
 * @since 2.0.0
 */
let_ as let };
/**
 * Adds an `Option` value to the do notation record under a given name. If the
 * `Option` is `None`, the whole pipeline short-circuits to `None`.
 *
 * **When to use**
 *
 * - Sequencing `Option` computations in do notation
 *
 * **Example** (Binding Option values)
 *
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.Do,
 *   Option.bind("x", () => Option.some(2)),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y),
 *   Option.filter(({ x, y }) => x * y > 5)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
 * ```
 *
 * @see {@link Do} for starting the chain
 * @see {@link let_ let} to add plain values
 * @see {@link bindTo} to start by naming an existing `Option`
 *
 * @category Do notation
 * @since 2.0.0
 */
export const bind = /*#__PURE__*/doNotation.bind(map, flatMap);
/**
 * An `Option` containing an empty record `{}`, used as the starting point for
 * do notation chains.
 *
 * **When to use**
 *
 * - Starting a do notation pipeline before adding bindings
 *
 * **Example** (Do notation pipeline)
 *
 * ```ts
 * import { Option, pipe } from "effect"
 * import * as assert from "node:assert"
 *
 * const result = pipe(
 *   Option.Do,
 *   Option.bind("x", () => Option.some(2)),
 *   Option.bind("y", () => Option.some(3)),
 *   Option.let("sum", ({ x, y }) => x + y),
 *   Option.filter(({ x, y }) => x * y > 5)
 * )
 * assert.deepStrictEqual(result, Option.some({ x: 2, y: 3, sum: 5 }))
 * ```
 *
 * @see {@link bind} to add `Option` values
 * @see {@link let_ let} to add plain values
 * @see {@link bindTo} to start by naming an existing `Option`
 *
 * @category Do notation
 * @since 2.0.0
 */
export const Do = /*#__PURE__*/some({});
/**
 * Generator-based syntax for `Option`, similar to `async`/`await` but for
 * optional values. Yielding a `None` short-circuits the generator to `None`.
 *
 * **When to use**
 *
 * - Writing imperative-style code that chains multiple `Option`s
 * - Readability when many sequential optional steps are involved
 *
 * **Behavior**
 *
 * - Each `yield*` unwraps a `Some` value or short-circuits to `None`
 * - The return value is wrapped in `Some`
 * - No `Effect` runtime is needed
 *
 * **Example** (Generator syntax)
 *
 * ```ts
 * import { Option } from "effect"
 *
 * const maybeName: Option.Option<string> = Option.some("John")
 * const maybeAge: Option.Option<number> = Option.some(25)
 *
 * const person = Option.gen(function*() {
 *   const name = (yield* maybeName).toUpperCase()
 *   const age = yield* maybeAge
 *   return { name, age }
 * })
 *
 * console.log(person)
 * // Output:
 * // { _id: 'Option', _tag: 'Some', value: { name: 'JOHN', age: 25 } }
 * ```
 *
 * @see {@link Do} / {@link bind} for the do notation alternative
 *
 * @category Generators
 * @since 2.0.0
 */
export const gen = (...args) => {
  const f = args.length === 1 ? args[0] : args[1].bind(args[0]);
  const iterator = f();
  let state = iterator.next();
  while (!state.done) {
    const current = state.value;
    if (isNone(current)) {
      return current;
    }
    state = iterator.next(current.value);
  }
  return some(state.value);
};
/**
 * Creates a `Reducer` for `Option<A>` that prioritizes the first non-`None`
 * value and combines values when both are `Some`.
 *
 * **When to use**
 *
 * - Building a reducer that falls back to the first available value
 * - Combining optional values where either side may be absent
 *
 * **Behavior**
 *
 * - `None` + `None` → `None`
 * - `Some(a)` + `None` → `Some(a)`
 * - `None` + `Some(b)` → `Some(b)`
 * - `Some(a)` + `Some(b)` → `Some(combine(a, b))`
 * - Initial value is `None`
 *
 * **Example** (Reducing with first-wins semantics)
 *
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const reducer = Option.makeReducer(Number.ReducerSum)
 * console.log(reducer.combineAll([Option.some(1), Option.none(), Option.some(2)]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 * ```
 *
 * @see {@link makeReducerFailFast} for fail-fast semantics
 *
 * @since 4.0.0
 */
export function makeReducer(combiner) {
  return Reducer.make((self, that) => {
    if (isNone(self)) return that;
    if (isNone(that)) return self;
    return some(combiner.combine(self.value, that.value));
  }, none());
}
/**
 * Creates a `Combiner` for `Option<A>` with fail-fast semantics: returns `None`
 * if either operand is `None`.
 *
 * **When to use**
 *
 * - Operations that require both values to be present
 *
 * **Behavior**
 *
 * - `None` + anything → `None`
 * - anything + `None` → `None`
 * - `Some(a)` + `Some(b)` → `Some(combine(a, b))`
 *
 * **Example** (Fail-fast combining)
 *
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const combiner = Option.makeCombinerFailFast(Number.ReducerSum)
 * console.log(combiner.combine(Option.some(1), Option.some(2)))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 *
 * console.log(combiner.combine(Option.some(1), Option.none()))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link makeReducerFailFast} to get a full `Reducer`
 *
 * @since 4.0.0
 */
export function makeCombinerFailFast(combiner) {
  return Combiner.make((self, that) => {
    if (isNone(self) || isNone(that)) return none();
    return some(combiner.combine(self.value, that.value));
  });
}
/**
 * Creates a `Reducer` for `Option<A>` by lifting an existing `Reducer` with
 * fail-fast semantics.
 *
 * **When to use**
 *
 * - Wrapping an existing `Reducer` to work with `Option` values
 * - Reductions where any `None` should abort the entire result
 *
 * **Behavior**
 *
 * - Initial value is `Some(reducer.initialValue)`
 * - Combines only when both operands are `Some`
 * - Any `None` causes the result to become `None` immediately
 *
 * **Example** (Fail-fast reducing)
 *
 * ```ts
 * import { Number, Option } from "effect"
 *
 * const reducer = Option.makeReducerFailFast(Number.ReducerSum)
 * console.log(reducer.combineAll([Option.some(1), Option.some(2)]))
 * // Output: { _id: 'Option', _tag: 'Some', value: 3 }
 *
 * console.log(reducer.combineAll([Option.some(1), Option.none()]))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @see {@link makeCombinerFailFast} for just the combiner
 * @see {@link makeReducer} for non-fail-fast semantics
 *
 * @since 4.0.0
 */
export function makeReducerFailFast(reducer) {
  const combine = makeCombinerFailFast(reducer).combine;
  const initialValue = some(reducer.initialValue);
  return Reducer.make(combine, initialValue, collection => {
    let out = initialValue;
    for (const value of collection) {
      out = combine(out, value);
      if (isNone(out)) return out;
    }
    return out;
  });
}
//# sourceMappingURL=Option.js.map