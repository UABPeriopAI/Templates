import { pipeArguments } from "./Pipeable.js";
/**
 * Creates a function that can be used in a data-last (aka `pipe`able) or
 * data-first style.
 *
 * The first parameter to `dual` is either the arity of the uncurried function
 * or a predicate that determines if the function is being used in a data-first
 * or data-last style.
 *
 * Using the arity is the most common use case, but there are some cases where
 * you may want to use a predicate. For example, if you have a function that
 * takes an optional argument, you can use a predicate to determine if the
 * function is being used in a data-first or data-last style.
 *
 * You can pass either the arity of the uncurried function or a predicate
 * which determines if the function is being used in a data-first or
 * data-last style.
 *
 * @example
 * ```ts
 * import { dual, pipe } from "effect/Function"
 *
 * // Using arity to determine data-first or data-last style
 * const sum = dual<
 *   (that: number) => (self: number) => number,
 *   (self: number, that: number) => number
 * >(2, (self, that) => self + that)
 *
 * console.log(sum(2, 3)) // 5 (data-first)
 * console.log(pipe(2, sum(3))) // 5 (data-last)
 * ```
 *
 * **Example** (Using arity to determine data-first or data-last style)
 *
 * ```ts
 * import { dual, pipe } from "effect/Function"
 *
 * const sum = dual<
 *   (that: number) => (self: number) => number,
 *   (self: number, that: number) => number
 * >(2, (self, that) => self + that)
 *
 * console.log(sum(2, 3)) // 5
 * console.log(pipe(2, sum(3))) // 5
 * ```
 *
 * **Example** (Using call signatures to define the overloads)
 *
 * ```ts
 * import { dual, pipe } from "effect/Function"
 *
 * const sum: {
 *   (that: number): (self: number) => number
 *   (self: number, that: number): number
 * } = dual(2, (self: number, that: number): number => self + that)
 *
 * console.log(sum(2, 3)) // 5
 * console.log(pipe(2, sum(3))) // 5
 * ```
 *
 * **Example** (Using a predicate to determine data-first or data-last style)
 *
 * ```ts
 * import { dual, pipe } from "effect/Function"
 *
 * const sum = dual<
 *   (that: number) => (self: number) => number,
 *   (self: number, that: number) => number
 * >(
 *   (args) => args.length === 2,
 *   (self, that) => self + that
 * )
 *
 * console.log(sum(2, 3)) // 5
 * console.log(pipe(2, sum(3))) // 5
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const dual = function (arity, body) {
  if (typeof arity === "function") {
    return function () {
      return arity(arguments) ? body.apply(this, arguments) : self => body(self, ...arguments);
    };
  }
  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`);
    case 2:
      return function (a, b) {
        if (arguments.length >= 2) {
          return body(a, b);
        }
        return function (self) {
          return body(self, a);
        };
      };
    case 3:
      return function (a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c);
        }
        return function (self) {
          return body(self, a, b);
        };
      };
    default:
      return function () {
        if (arguments.length >= arity) {
          // @ts-expect-error
          return body.apply(this, arguments);
        }
        const args = arguments;
        return function (self) {
          return body(self, ...args);
        };
      };
  }
};
/**
 * Apply a function to a given value.
 *
 * @example
 * ```ts
 * import { apply, pipe } from "effect/Function"
 * import { length } from "effect/String"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe(length, apply("hello")), 5)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const apply = a => self => self(a);
/**
 * The identity function, i.e. A function that returns its input argument.
 *
 * @example
 * ```ts
 * import { identity } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(identity(5), 5)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const identity = a => a;
/**
 * A function that ensures that the type of an expression matches some type,
 * without changing the resulting type of that expression.
 *
 * @example
 * ```ts
 * import { satisfies } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const test1 = satisfies<number>()(5 as const)
 * // ^? const test: 5
 * // @ts-expect-error
 * const test2 = satisfies<string>()(5)
 * // ^? Argument of type 'number' is not assignable to parameter of type 'string'
 *
 * assert.deepStrictEqual(satisfies<number>()(5), 5)
 * ```
 *
 * @category type utils
 * @since 2.0.0
 */
export const satisfies = () => b => b;
/**
 * Casts the result to the specified type.
 *
 * @category type utils
 * @since 2.0.0
 */
export const cast = identity;
/**
 * Creates a constant value that never changes.
 *
 * This is useful when you want to pass a value to a higher-order function (a function that takes another function as its argument)
 * and want that inner function to always use the same value, no matter how many times it is called.
 *
 * @example
 * ```ts
 * import { constant } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const constNull = constant(null)
 *
 * assert.deepStrictEqual(constNull(), null)
 * assert.deepStrictEqual(constNull(), null)
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const constant = value => () => value;
/**
 * A thunk that returns always `true`.
 *
 * @example
 * ```ts
 * import { constTrue } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(constTrue(), true)
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const constTrue = /*#__PURE__*/constant(true);
/**
 * A thunk that returns always `false`.
 *
 * @example
 * ```ts
 * import { constFalse } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(constFalse(), false)
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const constFalse = /*#__PURE__*/constant(false);
/**
 * A thunk that returns always `null`.
 *
 * @example
 * ```ts
 * import { constNull } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(constNull(), null)
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const constNull = /*#__PURE__*/constant(null);
/**
 * A thunk that returns always `undefined`.
 *
 * @example
 * ```ts
 * import { constUndefined } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(constUndefined(), undefined)
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const constUndefined = /*#__PURE__*/constant(undefined);
/**
 * A thunk that returns always `void`.
 *
 * @example
 * ```ts
 * import { constVoid } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(constVoid(), undefined)
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const constVoid = constUndefined;
/**
 * Reverses the order of arguments for a curried function.
 *
 * @example
 * ```ts
 * import { flip } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const f = (a: number) => (b: string) => a - b.length
 *
 * assert.deepStrictEqual(flip(f)("aaa")(2), -1)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const flip = f => (...b) => (...a) => f(...a)(...b);
/**
 * Composes two functions, `ab` and `bc` into a single function that takes in an argument `a` of type `A` and returns a result of type `C`.
 * The result is obtained by first applying the `ab` function to `a` and then applying the `bc` function to the result of `ab`.
 *
 * @example
 * ```ts
 * import { compose } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const increment = (n: number) => n + 1
 * const square = (n: number) => n * n
 *
 * assert.strictEqual(compose(increment, square)(2), 9)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const compose = /*#__PURE__*/dual(2, (ab, bc) => a => bc(ab(a)));
/**
 * The `absurd` function is a stub for cases where a value of type `never` is encountered in your code,
 * meaning that it should be impossible for this code to be executed.
 *
 * This function is particularly useful when it's necessary to specify that certain cases are impossible.
 *
 * @example
 * ```ts
 * import { absurd } from "effect/Function"
 *
 * const handleNever = (value: never) => {
 *   return absurd(value) // This will throw an error if called
 * }
 * ```
 *
 * @category utilities
 * @since 2.0.0
 */
export const absurd = _ => {
  throw new Error("Called `absurd` function which should be uncallable");
};
/**
 * Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument.
 *
 * @example
 * ```ts
 * import { tupled } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const sumTupled = tupled((x: number, y: number): number => x + y)
 *
 * assert.deepStrictEqual(sumTupled([1, 2]), 3)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const tupled = f => a => f(...a);
/**
 * Inverse function of `tupled`
 *
 * @example
 * ```ts
 * import { untupled } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * const getFirst = untupled(<A, B>(tuple: [A, B]): A => tuple[0])
 *
 * assert.deepStrictEqual(getFirst(1, 2), 1)
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const untupled = f => (...a) => f(a);
export function pipe(a, ...args) {
  return pipeArguments(a, args);
}
export function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
  switch (arguments.length) {
    case 1:
      return ab;
    case 2:
      return function () {
        return bc(ab.apply(this, arguments));
      };
    case 3:
      return function () {
        return cd(bc(ab.apply(this, arguments)));
      };
    case 4:
      return function () {
        return de(cd(bc(ab.apply(this, arguments))));
      };
    case 5:
      return function () {
        return ef(de(cd(bc(ab.apply(this, arguments)))));
      };
    case 6:
      return function () {
        return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
      };
    case 7:
      return function () {
        return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
      };
    case 8:
      return function () {
        return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
      };
    case 9:
      return function () {
        return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
      };
  }
  return;
}
/**
 * Type hole simulation. Creates a placeholder for any type, primarily used during development.
 *
 * @example
 * ```ts
 * import { hole } from "effect/Function"
 *
 * // Use during development as a placeholder
 * const placeholder: string = hole<string>()
 * ```
 *
 * @category utilities
 * @since 2.0.0
 */
export const hole = /*#__PURE__*/cast(absurd);
/**
 * The SK combinator, also known as the "S-K combinator" or "S-combinator", is a fundamental combinator in the
 * lambda calculus and the SKI combinator calculus.
 *
 * This function is useful for discarding the first argument passed to it and returning the second argument.
 *
 * @example
 * ```ts
 * import { SK } from "effect/Function"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(SK(0, "hello"), "hello")
 * ```
 *
 * @category combinators
 * @since 2.0.0
 */
export const SK = (_, b) => b;
/**
 * @since 4.0.0
 */
export function memoize(f) {
  const cache = new WeakMap();
  return a => {
    if (cache.has(a)) {
      return cache.get(a);
    }
    const result = f(a);
    cache.set(a, result);
    return result;
  };
}
//# sourceMappingURL=Function.js.map