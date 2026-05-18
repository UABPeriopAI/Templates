import * as Equal from "./Equal.js";
import { dual } from "./Function.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
import * as Result from "./Result.js";
// -------------------------------------------------------------------------------------
// Constructors
// -------------------------------------------------------------------------------------
/**
 * Creates a Filter from a function that returns either a `pass` or `fail` value.
 *
 * This is the primary constructor for creating custom filters. The function
 * should return either `Result.succeed(value)` or `Result.fail(value)`.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * // Create a filter for positive numbers
 * const positiveFilter = Filter.make((n: number) => n > 0 ? Result.succeed(n) : Result.fail(n))
 *
 * // Create a filter that transforms strings to uppercase
 * const uppercaseFilter = Filter.make((s: string) =>
 *   s.length > 0 ? Result.succeed(s.toUpperCase()) : Result.fail(s)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = f => f;
/**
 * Creates an effectful Filter from a function that returns an Effect.
 *
 * This constructor is used when the filtering operation needs to perform
 * effectful computations, such as async operations, error handling, or
 * accessing services from the environment.
 *
 * @example
 * ```ts
 * import { Effect, Filter, Result } from "effect"
 *
 * // Create an effectful filter that validates async
 * const asyncValidate = Filter.makeEffect((id: string) =>
 *   Effect.gen(function*() {
 *     const isValid = yield* Effect.succeed(id.length > 0)
 *     return isValid ? Result.succeed(id) : Result.fail(id)
 *   })
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const makeEffect = f => f;
/**
 * @since 4.0.0
 * @category Mapping
 */
export const mapFail = /*#__PURE__*/dual(2, (self, f) => input => Result.mapError(self(input), f));
const try_ = f => input => {
  try {
    return Result.succeed(f(input));
  } catch {
    return Result.fail(input);
  }
};
export {
/**
 * Creates a Filter that tries to apply a function and returns `fail` on
 * error.
 *
 * @since 4.0.0
 * @category Constructors
 */
try_ as try };
/**
 * Creates a Filter from a predicate or refinement function.
 *
 * This is a convenient way to create filters from boolean-returning functions.
 * When the predicate returns true, the input value is passed through unchanged.
 * When it returns false, the `fail` type is returned.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * // Create filter from predicate
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const nonEmptyStrings = Filter.fromPredicate((s: string) => s.length > 0)
 *
 * // Type refinement
 * const isString = Filter.fromPredicate((x: unknown): x is string =>
 *   typeof x === "string"
 * )
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const fromPredicate = predicate => input => predicate(input) ? Result.succeed(input) : Result.fail(input);
/**
 * Creates a Filter from a function that returns an Option.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const fromPredicateOption = predicate => input => {
  const o = predicate(input);
  return o._tag === "None" ? Result.fail(input) : Result.succeed(o.value);
};
/**
 * Converts a Filter into a predicate function.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const toPredicate = self => input => !Result.isFailure(self(input));
/**
 * A predefined filter that only passes through string values.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * console.log(Filter.string("hello")) // Result.succeed("hello")
 * console.log(Filter.string(42)) // fail
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const string = /*#__PURE__*/fromPredicate(Predicate.isString);
/**
 * @since 4.0.0
 * @category Constructors
 */
export const equalsStrict = value => u => u === value ? Result.succeed(value) : Result.fail(u);
/**
 * @since 4.0.0
 * @category Constructors
 */
export const has = key => input => input.has(key) ? Result.succeed(input) : Result.fail(input);
/**
 * Creates a filter that only passes instances of the given constructor.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const instanceOf = constructor => u => u instanceof constructor ? Result.succeed(u) : Result.fail(u);
/**
 * A predefined filter that only passes through number values.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * console.log(Filter.number(42)) // Result.succeed(42)
 * console.log(Filter.number("42")) // fail
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const number = /*#__PURE__*/fromPredicate(Predicate.isNumber);
/**
 * A predefined filter that only passes through boolean values.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const boolean = /*#__PURE__*/fromPredicate(Predicate.isBoolean);
/**
 * A predefined filter that only passes through BigInt values.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const bigint = /*#__PURE__*/fromPredicate(Predicate.isBigInt);
/**
 * A predefined filter that only passes through Symbol values.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const symbol = /*#__PURE__*/fromPredicate(Predicate.isSymbol);
/**
 * A predefined filter that only passes through Date objects.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const date = /*#__PURE__*/fromPredicate(Predicate.isDate);
/**
 * Creates a filter that checks if an input is tagged with a specific tag.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const tagged = function () {
  return arguments.length === 0 ? taggedImpl : taggedImpl(arguments[0]);
};
const taggedImpl = tag => input => Predicate.isTagged(input, tag) ? Result.succeed(input) : Result.fail(input);
/**
 * Creates a filter that extracts a reason from a tagged error.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const reason = function () {
  return arguments.length === 0 ? reasonImpl : reasonImpl(arguments[0], arguments[1]);
};
const reasonImpl = (tag, reasonTag) => input => {
  if (Predicate.isTagged(input, tag) && Predicate.hasProperty(input, "reason") && Predicate.isTagged(input.reason, reasonTag)) {
    return Result.succeed(input.reason);
  }
  return Result.fail(input);
};
/**
 * Creates a filter that only passes values equal to the specified value using structural equality.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const equals = value => u => Equal.equals(u, value) ? Result.succeed(value) : Result.fail(u);
/**
 * Combines two filters with logical OR semantics.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const or = /*#__PURE__*/dual(2, (self, that) => input => {
  const selfResult = self(input);
  return Result.isSuccess(selfResult) ? selfResult : that(input);
});
/**
 * Combines two filters and applies a function to their results.
 *
 * Both filters must succeed (not return `fail`) for the combination to succeed.
 * If both filters pass, their outputs are combined using the provided function.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const zipWith = /*#__PURE__*/dual(3, (left, right, f) => input => {
  const leftResult = left(input);
  if (Result.isFailure(leftResult)) return leftResult;
  const rightResult = right(input);
  if (Result.isFailure(rightResult)) return rightResult;
  return Result.succeed(f(leftResult.success, rightResult.success));
});
/**
 * Combines two filters into a tuple of their results.
 *
 * Both filters must succeed for the combination to succeed. If both pass,
 * their outputs are combined into a tuple.
 *
 * @example
 * ```ts
 * import { Filter } from "effect"
 *
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const evenNumbers = Filter.fromPredicate((n: number) => n % 2 === 0)
 *
 * const positiveAndEven = Filter.zip(positiveNumbers, evenNumbers)
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const zip = /*#__PURE__*/dual(2, (left, right) => zipWith(left, right, (leftResult, rightResult) => [leftResult, rightResult]));
/**
 * Combines two filters but only returns the result of the left filter.
 *
 * @example
 * ```ts
 * import { Filter } from "effect"
 *
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const evenNumbers = Filter.fromPredicate((n: number) => n % 2 === 0)
 *
 * const positiveEven = Filter.andLeft(positiveNumbers, evenNumbers)
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const andLeft = /*#__PURE__*/dual(2, (left, right) => zipWith(left, right, leftResult => leftResult));
/**
 * Combines two filters but only returns the result of the right filter.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const doubleNumbers = Filter.make((n: number) =>
 *   n > 0 ? Result.succeed(n * 2) : Result.fail(n)
 * )
 *
 * const positiveDoubled = Filter.andRight(positiveNumbers, doubleNumbers)
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const andRight = /*#__PURE__*/dual(2, (left, right) => zipWith(left, right, (_, rightResult) => rightResult));
/**
 * Composes two filters sequentially, feeding the output of the first into the second.
 *
 * @example
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * const stringFilter = Filter.string
 * const nonEmptyUpper = Filter.make((s: string) =>
 *   s.length > 0 ? Result.succeed(s.toUpperCase()) : Result.fail(s)
 * )
 *
 * const stringToUpper = Filter.compose(stringFilter, nonEmptyUpper)
 * ```
 *
 * @since 4.0.0
 * @category Combinators
 */
export const compose = /*#__PURE__*/dual(2, (left, right) => input => {
  const leftOut = left(input);
  if (Result.isFailure(leftOut)) return leftOut;
  return right(leftOut.success);
});
/**
 * Composes two filters sequentially, allowing the output of the first to be
 * passed to the second.
 *
 * This is similar to `compose`, but it will always fail with the original
 * input.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const composePassthrough = /*#__PURE__*/dual(2, (left, right) => input => {
  const leftOut = left(input);
  if (Result.isFailure(leftOut)) return Result.fail(input);
  const rightOut = right(leftOut.success);
  if (Result.isFailure(rightOut)) return Result.fail(input);
  return rightOut;
});
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toOption = self => input => {
  const result = self(input);
  return Result.isFailure(result) ? Option.none() : Option.some(result.success);
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toResult = self => input => {
  const result = self(input);
  return Result.isFailure(result) ? Result.fail(result.failure) : Result.succeed(result.success);
};
//# sourceMappingURL=Filter.js.map