/**
 * This module provides types and utility functions to create and work with
 * branded types, which are TypeScript types with an added type tag to prevent
 * accidental usage of a value in the wrong context.
 *
 * @since 2.0.0
 */
import * as Arr from "./Array.js";
import * as Option from "./Option.js";
import * as Result from "./Result.js";
import * as AST from "./SchemaAST.js";
const TypeId = "~effect/Brand";
/**
 * A `BrandError` is returned when a branded type is constructed from an invalid
 * value.
 *
 * @category models
 * @since 4.0.0
 */
export class BrandError {
  constructor(issue) {
    this.issue = issue;
  }
  /**
   * @since 4.0.0
   */
  _tag = "BrandError";
  /**
   * @since 4.0.0
   */
  name = "BrandError";
  /**
   * @since 4.0.0
   */
  issue;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.issue.toString();
  }
  /**
   * @since 4.0.0
   */
  toString() {
    return `BrandError(${this.message})`;
  }
}
/**
 * This function returns a `Constructor` that **does not apply any runtime
 * checks**, it just returns the provided value. It can be used to create
 * nominal types that allow distinguishing between two values of the same type
 * but with different meanings.
 *
 * If you also want to perform some validation, see {@link make} or
 * {@link check} or {@link refine}.
 *
 * @category constructors
 * @since 2.0.0
 */
export function nominal() {
  return Object.assign(input => input, {
    option: input => Option.some(input),
    result: input => Result.succeed(input),
    is: _ => true
  });
}
/**
 * Returns a `Constructor` that can construct a branded type from an
 * unbranded value using the provided `filter` predicate as validation of
 * the input data.
 *
 * If you don't want to perform any validation but only distinguish between two
 * values of the same type but with different meanings, see {@link nominal}.
 *
 * @category constructors
 * @since 2.0.0
 */
export function make(filter) {
  return check(AST.makeFilter(filter));
}
/**
 * @since 4.0.0
 */
export function check(...checks) {
  const result = input => {
    return Result.mapError(AST.runChecks(checks, input), issue => new BrandError(issue));
  };
  return Object.assign(input => Result.getOrThrow(result(input)), {
    option: input => Option.getSuccess(result(input)),
    result,
    is: input => Result.isSuccess(result(input)),
    checks
  });
}
/**
 * Combines two or more brands together to form a single branded type. This API
 * is useful when you want to validate that the input data passes multiple brand
 * validators.
 *
 * @category combining
 * @since 2.0.0
 */
export function all(...brands) {
  const checks = brands.flatMap(brand => brand.checks ?? []);
  return Arr.isArrayNonEmpty(checks) ? check(...checks) : nominal();
}
//# sourceMappingURL=Brand.js.map