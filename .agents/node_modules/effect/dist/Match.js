/**
 * The `effect/match` module provides a type-safe pattern matching system for
 * TypeScript. Inspired by functional programming, it simplifies conditional
 * logic by replacing verbose if/else or switch statements with a structured and
 * expressive API.
 *
 * This module supports matching against types, values, and discriminated unions
 * while enforcing exhaustiveness checking to ensure all cases are handled.
 *
 * Although pattern matching is not yet a native JavaScript feature,
 * `effect/match` offers a reliable implementation that is available today.
 *
 * **How Pattern Matching Works**
 *
 * Pattern matching follows a structured process:
 *
 * - **Creating a matcher**: Define a `Matcher` that operates on either a
 *   specific `Match.type` or `Match.value`.
 *
 * - **Defining patterns**: Use combinators such as `Match.when`, `Match.not`,
 *   and `Match.tag` to specify matching conditions.
 *
 * - **Completing the match**: Apply a finalizer such as `Match.exhaustive`,
 *   `Match.orElse`, or `Match.option` to determine how unmatched cases should
 *   be handled.
 *
 * @since 4.0.0
 */
import * as internal from "./internal/matcher.js";
import * as Predicate from "./Predicate.js";
const TypeId = internal.TypeId;
/**
 * Creates a matcher for a specific type.
 *
 * **Details**
 *
 * This function defines a `Matcher` that operates on a given type, allowing you
 * to specify conditions for handling different cases. Once the matcher is
 * created, you can use pattern-matching functions like {@link when} to define
 * how different values should be processed.
 *
 * @example (Matching Numbers and Strings)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for values that are either strings or numbers
 * //
 * //      ┌─── (u: string | number) => string
 * //      ▼
 * const match = Match.type<string | number>().pipe(
 *   // Match when the value is a number
 *   Match.when(Match.number, (n) => `number: ${n}`),
 *   // Match when the value is a string
 *   Match.when(Match.string, (s) => `string: ${s}`),
 *   // Ensure all possible cases are handled
 *   Match.exhaustive
 * )
 *
 * console.log(match(0))
 * // Output: "number: 0"
 *
 * console.log(match("hello"))
 * // Output: "string: hello"
 * ```
 *
 * @see {@link value} for creating a matcher from a specific value.
 *
 * @category Creating a matcher
 * @since 4.0.0
 */
export const type = internal.type;
/**
 * Creates a matcher from a specific value.
 *
 * **Details**
 *
 * This function allows you to define a `Matcher` directly from a given value,
 * rather than from a type. This is useful when working with known values,
 * enabling structured pattern matching on objects, primitives, or any data
 * structure.
 *
 * Once the matcher is created, you can use pattern-matching functions like
 * {@link when} to define how different cases should be handled.
 *
 * @example (Matching an Object by Property)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * const input = { name: "John", age: 30 }
 *
 * // Create a matcher for the specific object
 * const result = Match.value(input).pipe(
 *   // Match when the 'name' property is "John"
 *   Match.when(
 *     { name: "John" },
 *     (user) => `${user.name} is ${user.age} years old`
 *   ),
 *   // Provide a fallback if no match is found
 *   Match.orElse(() => "Oh, not John")
 * )
 *
 * console.log(result)
 * // Output: "John is 30 years old"
 * ```
 *
 * @see {@link type} for creating a matcher from a specific type.
 *
 * @category Creating a matcher
 * @since 4.0.0
 */
export const value = internal.value;
/**
 * Creates a match function for a specific value with discriminated union handling.
 *
 * This function provides a convenient way to pattern match on discriminated unions
 * by providing an object that maps each `_tag` value to its corresponding handler.
 * It's similar to a switch statement but with better type safety and exhaustiveness checking.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * type Status = { readonly _tag: "Success"; readonly data: string }
 *
 * const success: Status = { _tag: "Success", data: "Hello" }
 *
 * // Simple valueTags usage
 * const message = Match.valueTags(success, {
 *   Success: (result) => `Success: ${result.data}`
 * })
 *
 * console.log(message) // "Success: Hello"
 * ```
 *
 * @category Creating a matcher
 * @since 4.0.0
 */
export const valueTags = internal.valueTags;
/**
 * Creates a type-safe match function for discriminated unions based on `_tag` field.
 *
 * This function allows you to define exhaustive pattern matching for discriminated unions
 * by providing handlers for each possible `_tag` value. It ensures type safety and
 * can optionally enforce a specific return type across all branches.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * type Result =
 *   | { readonly _tag: "Success"; readonly data: string }
 *   | { readonly _tag: "Error"; readonly message: string }
 *   | { readonly _tag: "Loading" }
 *
 * // Create a matcher with specific return type
 * const formatResult = Match.typeTags<Result, string>()({
 *   Success: (result) => `Data: ${result.data}`,
 *   Error: (result) => `Error: ${result.message}`,
 *   Loading: () => "Loading..."
 * })
 *
 * console.log(formatResult({ _tag: "Success", data: "Hello World" }))
 * // Output: "Data: Hello World"
 *
 * console.log(formatResult({ _tag: "Error", message: "Network failed" }))
 * // Output: "Error: Network failed"
 *
 * // Create a matcher with inferred return type
 * const processResult = Match.typeTags<Result>()({
 *   Success: (result) => ({ type: "ok", value: result.data }),
 *   Error: (result) => ({ type: "error", error: result.message }),
 *   Loading: () => ({ type: "pending" })
 * })
 *
 * console.log(processResult({ _tag: "Loading" }))
 * // Output: { type: "pending" }
 * ```
 *
 * @category Creating a matcher
 * @since 4.0.0
 */
export const typeTags = internal.typeTags;
/**
 * Ensures that all branches of a matcher return a specific type.
 *
 * **Details**
 *
 * This function enforces a consistent return type across all pattern-matching
 * branches. By specifying a return type, TypeScript will check that every
 * matching condition produces a value of the expected type.
 *
 * **Important:** This function must be the first step in the matcher pipeline.
 * If used later, TypeScript will not enforce type consistency correctly.
 *
 * @example (Validating Return Type Consistency)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * const match = Match.type<{ a: number } | { b: string }>().pipe(
 *   // Ensure all branches return a string
 *   Match.withReturnType<string>(),
 *   // ❌ Type error: 'number' is not assignable to type 'string'
 *   // @ts-expect-error
 *   Match.when({ a: Match.number }, (_) => _.a),
 *   // ✅ Correct: returns a string
 *   Match.when({ b: Match.string }, (_) => _.b),
 *   Match.exhaustive
 * )
 * ```
 *
 * @category utils
 * @since 4.0.0
 */
export const withReturnType = internal.withReturnType;
/**
 * Defines a condition for matching values.
 *
 * **Details**
 *
 * This function enables pattern matching by checking whether a given value
 * satisfies a condition. It supports both direct value comparisons and
 * predicate functions. If the condition is met, the associated function is
 * executed.
 *
 * This function is useful when defining matchers that need to check for
 * specific values or apply logical conditions to determine a match. It works
 * well with structured objects and primitive types.
 *
 * @example (Matching with Values and Predicates)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for objects with an "age" property
 * const match = Match.type<{ age: number }>().pipe(
 *   // Match when age is greater than 18
 *   Match.when(
 *     { age: (age: number) => age > 18 },
 *     (user: { age: number }) => `Age: ${user.age}`
 *   ),
 *   // Match when age is exactly 18
 *   Match.when({ age: 18 }, () => "You can vote"),
 *   // Fallback case for all other ages
 *   Match.orElse((user: { age: number }) => `${user.age} is too young`)
 * )
 *
 * console.log(match({ age: 20 }))
 * // Output: "Age: 20"
 *
 * console.log(match({ age: 18 }))
 * // Output: "You can vote"
 *
 * console.log(match({ age: 4 }))
 * // Output: "4 is too young"
 * ```
 *
 * @see {@link whenOr} Use this when multiple patterns should match in a single
 * condition.
 * @see {@link whenAnd} Use this when a value must match all provided patterns.
 * @see {@link orElse} Provides a fallback when no patterns match.
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const when = internal.when;
/**
 * Matches one of multiple patterns in a single condition.
 *
 * **Details**
 *
 * This function allows defining a condition where a value matches any of the
 * provided patterns. If a match is found, the associated function is executed.
 * It simplifies cases where multiple patterns share the same handling logic.
 *
 * Unlike {@link when}, which requires separate conditions for each pattern,
 * this function enables combining them into a single statement, making the
 * matcher more concise.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * type ErrorType =
 *   | { readonly _tag: "NetworkError"; readonly message: string }
 *   | { readonly _tag: "TimeoutError"; readonly duration: number }
 *   | { readonly _tag: "ValidationError"; readonly field: string }
 *
 * const handleError = Match.type<ErrorType>().pipe(
 *   Match.whenOr(
 *     { _tag: "NetworkError" },
 *     { _tag: "TimeoutError" },
 *     () => "Retry the request"
 *   ),
 *   Match.when({ _tag: "ValidationError" }, (_) => `Invalid field: ${_.field}`),
 *   Match.exhaustive
 * )
 *
 * console.log(handleError({ _tag: "NetworkError", message: "No connection" }))
 * // Output: "Retry the request"
 *
 * console.log(handleError({ _tag: "ValidationError", field: "email" }))
 * // Output: "Invalid field: email"
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const whenOr = internal.whenOr;
/**
 * Matches a value that satisfies all provided patterns.
 *
 * **Details**
 *
 * This function allows defining a condition where a value must match all the
 * given patterns simultaneously. If the value satisfies every pattern, the
 * associated function is executed.
 *
 * Unlike {@link when}, which matches a single pattern at a time, this function
 * ensures that multiple conditions are met before executing the callback. It is
 * useful when checking for values that need to fulfill multiple criteria at
 * once.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * type User = { readonly age: number; readonly role: "admin" | "user" }
 *
 * const checkUser = Match.type<User>().pipe(
 *   Match.whenAnd(
 *     { age: (n) => n >= 18 },
 *     { role: "admin" },
 *     () => "Admin access granted"
 *   ),
 *   Match.orElse(() => "Access denied")
 * )
 *
 * console.log(checkUser({ age: 20, role: "admin" }))
 * // Output: "Admin access granted"
 *
 * console.log(checkUser({ age: 20, role: "user" }))
 * // Output: "Access denied"
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const whenAnd = internal.whenAnd;
/**
 * Matches values based on a specified discriminant field.
 *
 * **Details**
 *
 * This function is used to define pattern matching on objects that follow a
 * **discriminated union** structure, where a specific field (e.g., `type`,
 * `kind`, `_tag`) determines the variant of the object. It allows matching
 * multiple values of the discriminant and provides a function to handle the
 * matched cases.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { type: "A"; a: string } | { type: "B"; b: number } | {
 *       type: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.discriminator("type")("A", "B", (_) => `A or B: ${_.type}`),
 *   Match.discriminator("type")("C", (_) => `C(${_.c})`),
 *   Match.exhaustive
 * )
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const discriminator = internal.discriminator;
/**
 * Matches values where a specified field starts with a given prefix.
 *
 * **Details**
 *
 * This function is useful for working with discriminated unions where the
 * discriminant field follows a hierarchical or namespaced structure. It allows
 * you to match values based on whether the specified field starts with a given
 * prefix, making it easier to handle grouped cases.
 *
 * Instead of checking for exact matches, this function lets you match values
 * that share a common prefix. For example, if your discriminant field contains
 * hierarchical names like `"A"`, `"A.A"`, and `"B"`, you can match all values
 * starting with `"A"` using a single rule.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<{ type: "A" } | { type: "B" } | { type: "A.A" } | {}>(),
 *   Match.discriminatorStartsWith("type")("A", (_) => 1 as const),
 *   Match.discriminatorStartsWith("type")("B", (_) => 2 as const),
 *   Match.orElse((_) => 3 as const)
 * )
 *
 * console.log(match({ type: "A" })) // 1
 * console.log(match({ type: "B" })) // 2
 * console.log(match({ type: "A.A" })) // 1
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const discriminatorStartsWith = internal.discriminatorStartsWith;
/**
 * Matches values based on a field that serves as a discriminator, mapping each
 * possible value to a corresponding handler.
 *
 * **Details**
 *
 * This function simplifies working with discriminated unions by letting you
 * define a set of handlers for each possible value of a given field. Instead of
 * chaining multiple calls to {@link discriminator}, this function allows
 * defining all possible cases at once using an object where the keys are the
 * possible values of the field, and the values are the corresponding handler
 * functions.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { type: "A"; a: string } | { type: "B"; b: number } | {
 *       type: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.discriminators("type")({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   }),
 *   Match.exhaustive
 * )
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const discriminators = internal.discriminators;
/**
 * Matches values based on a discriminator field and **ensures all cases are
 * handled**.
 *
 * **Details*+
 *
 * This function is similar to {@link discriminators}, but **requires that all
 * possible cases** are explicitly handled. It is useful when working with
 * discriminated unions, where a specific field (e.g., `"type"`) determines the
 * shape of an object. Each possible value of the field must have a
 * corresponding handler, ensuring **exhaustiveness checking** at compile time.
 *
 * This function **does not require** `Match.exhaustive` at the end of the
 * pipeline because it enforces exhaustiveness by design.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { type: "A"; a: string } | { type: "B"; b: number } | {
 *       type: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.discriminatorsExhaustive("type")({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   })
 * )
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const discriminatorsExhaustive = internal.discriminatorsExhaustive;
/**
 * The `Match.tag` function allows pattern matching based on the `_tag` field in
 * a [Discriminated Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions).
 * You can specify multiple tags to match within a single pattern.
 *
 * **Note**
 *
 * The `Match.tag` function relies on the convention within the Effect ecosystem
 * of naming the tag field as `"_tag"`. Ensure that your discriminated unions
 * follow this naming convention for proper functionality.
 *
 * @example (Matching a Discriminated Union by Tag)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * type Event =
 *   | { readonly _tag: "fetch" }
 *   | { readonly _tag: "success"; readonly data: string }
 *   | { readonly _tag: "error"; readonly error: Error }
 *   | { readonly _tag: "cancel" }
 *
 * const match = Match.type<Event>().pipe(
 *   // Match either "fetch" or "success"
 *   Match.tag("fetch", "success", () => `Ok!`),
 *   // Match "error" and extract the error message
 *   Match.tag("error", (event) => `Error: ${event.error.message}`),
 *   // Match "cancel"
 *   Match.tag("cancel", () => "Cancelled"),
 *   Match.exhaustive
 * )
 *
 * console.log(match({ _tag: "success", data: "Hello" }))
 * // Output: "Ok!"
 *
 * console.log(match({ _tag: "error", error: new Error("Oops!") }))
 * // Output: "Error: Oops!"
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const tag = internal.tag;
/**
 * Matches values where the `_tag` field starts with a given prefix.
 *
 * **Details**
 *
 * This function allows you to match on values in a **discriminated union**
 * based on whether the `_tag` field starts with a specified prefix. It is
 * useful for handling hierarchical or namespaced tags, where multiple related
 * cases share a common prefix.
 *
 * @example
  ```ts
 * import { pipe } from "effect"
 * import { Match } from "effect"
 *
 * const match = pipe(
 *   Match.type<{ _tag: "A" } | { _tag: "B" } | { _tag: "A.A" } | {}>(),
 *   Match.tagStartsWith("A", (_) => 1 as const),
 *   Match.tagStartsWith("B", (_) => 2 as const),
 *   Match.orElse((_) => 3 as const)
 * )
 *
 * console.log(match({ _tag: "A" })) // 1
 * console.log(match({ _tag: "B" })) // 2
 * console.log(match({ _tag: "A.A" })) // 1
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const tagStartsWith = internal.tagStartsWith;
/**
 * Matches values based on their `_tag` field, mapping each tag to a
 * corresponding handler.
 *
 * **Details**
 *
 * This function provides a way to handle discriminated unions by mapping `_tag`
 * values to specific functions. Each handler receives the matched value and
 * returns a transformed result. If all possible tags are handled, you can
 * enforce exhaustiveness using `Match.exhaustive` to ensure no case is missed.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { _tag: "A"; a: string } | { _tag: "B"; b: number } | {
 *       _tag: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.tags({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   }),
 *   Match.exhaustive
 * )
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const tags = internal.tags;
/**
 * Matches values based on their `_tag` field and requires handling of all
 * possible cases.
 *
 * **Details**
 *
 * This function is designed for **discriminated unions** where every possible
 * `_tag` value must have a corresponding handler. Unlike {@link tags}, this
 * function ensures **exhaustiveness**, meaning all cases must be explicitly
 * handled. If a `_tag` value is missing from the mapping, TypeScript will
 * report an error.
 *
 * @example
 * ```ts
 * import { Match, pipe } from "effect"
 *
 * const match = pipe(
 *   Match.type<
 *     { _tag: "A"; a: string } | { _tag: "B"; b: number } | {
 *       _tag: "C"
 *       c: boolean
 *     }
 *   >(),
 *   Match.tagsExhaustive({
 *     A: (a) => a.a,
 *     B: (b) => b.b,
 *     C: (c) => c.c
 *   })
 * )
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const tagsExhaustive = internal.tagsExhaustive;
/**
 * Excludes a specific value from matching while allowing all others.
 *
 * **Details**
 *
 * This function is useful when you need to **handle all values except one or
 * more specific cases**. Instead of listing all possible matches manually, this
 * function simplifies the logic by allowing you to specify values to exclude.
 * Any excluded value will bypass the provided function and continue matching
 * through other cases.
 *
 * @example (Ignoring a Specific Value)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for string or number values
 * const match = Match.type<string | number>().pipe(
 *   // Match any value except "hi", returning "ok"
 *   Match.not("hi", () => "ok"),
 *   // Fallback case for when the value is "hi"
 *   Match.orElse(() => "fallback")
 * )
 *
 * console.log(match("hello"))
 * // Output: "ok"
 *
 * console.log(match("hi"))
 * // Output: "fallback"
 * ```
 *
 * @category Defining patterns
 * @since 4.0.0
 */
export const not = internal.not;
/**
 * Matches non-empty strings.
 *
 * This predicate matches any string that contains at least one character,
 * effectively filtering out empty strings ("").
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const processInput = Match.type<string>()
 *   .pipe(
 *     Match.when(Match.nonEmptyString, (str) => `Valid input: ${str}`),
 *     Match.orElse(() => "Input cannot be empty")
 *   )
 *
 * console.log(processInput("hello"))
 * // Output: "Valid input: hello"
 *
 * console.log(processInput(""))
 * // Output: "Input cannot be empty"
 *
 * console.log(processInput("   "))
 * // Output: "Valid input:    " (whitespace-only strings are considered non-empty)
 * ```
 *
 * @category Predicates
 * @since 4.0.0
 */
export const nonEmptyString = internal.nonEmptyString;
/**
 * Matches a specific set of literal values (e.g., `Match.is("a", 42, true)`).
 *
 * This function creates a predicate that matches any of the provided literal values.
 * It's useful for matching against multiple specific values in a single pattern.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const handleStatus = Match.type<string | number>()
 *   .pipe(
 *     Match.when(Match.is("success", "ok", 200), () => "Operation successful"),
 *     Match.when(Match.is("error", "failed", 500), () => "Operation failed"),
 *     Match.when(Match.is(0, false, null), () => "Falsy value"),
 *     Match.orElse((value) => `Unknown status: ${value}`)
 *   )
 *
 * console.log(handleStatus("success"))
 * // Output: "Operation successful"
 *
 * console.log(handleStatus(200))
 * // Output: "Operation successful"
 *
 * console.log(handleStatus("failed"))
 * // Output: "Operation failed"
 *
 * console.log(handleStatus(0))
 * // Output: "Falsy value"
 *
 * console.log(handleStatus("pending"))
 * // Output: "Unknown status: pending"
 * ```
 *
 * @category Predicates
 * @since 4.0.0
 */
export const is = internal.is;
/**
 * Matches values of type `string`.
 *
 * This predicate refines unknown values to strings, allowing pattern matching
 * on string types. It's commonly used in type-based matchers to handle string cases.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const processValue = Match.type<string | number | boolean>().pipe(
 *   Match.when(Match.string, (str) => `String: ${str.toUpperCase()}`),
 *   Match.when(Match.number, (num) => `Number: ${num * 2}`),
 *   Match.when(Match.boolean, (bool) => `Boolean: ${bool ? "yes" : "no"}`),
 *   Match.exhaustive
 * )
 *
 * console.log(processValue("hello")) // "String: HELLO"
 * console.log(processValue(42)) // "Number: 84"
 * console.log(processValue(true)) // "Boolean: yes"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const string = Predicate.isString;
/**
 * Matches values of type `number`.
 *
 * This predicate refines unknown values to numbers, allowing pattern matching
 * on numeric types. It matches all number values including integers, floats,
 * `Infinity`, `-Infinity`, and `NaN`.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const categorizeNumber = Match.type<unknown>().pipe(
 *   Match.when(Match.number, (num) => {
 *     if (Number.isNaN(num)) return "Not a number"
 *     if (!Number.isFinite(num)) return "Infinite"
 *     if (Number.isInteger(num)) return `Integer: ${num}`
 *     return `Float: ${num.toFixed(2)}`
 *   }),
 *   Match.orElse(() => "Not a number type")
 * )
 *
 * console.log(categorizeNumber(42)) // "Integer: 42"
 * console.log(categorizeNumber(3.14)) // "Float: 3.14"
 * console.log(categorizeNumber(NaN)) // "Not a number"
 * console.log(categorizeNumber("hello")) // "Not a number type"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const number = Predicate.isNumber;
/**
 * Matches any value without restrictions.
 *
 * This predicate matches absolutely any value, including `undefined`, `null`,
 * objects, primitives, functions, etc. It's useful as a catch-all pattern
 * or when you need to match any remaining cases.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const describeValue = Match.type<unknown>()
 *   .pipe(
 *     Match.when(Match.string, (str) => `String: ${str}`),
 *     Match.when(Match.number, (num) => `Number: ${num}`),
 *     Match.when(Match.boolean, (bool) => `Boolean: ${bool}`),
 *     Match.when(Match.any, (value) => `Other: ${typeof value}`),
 *     Match.exhaustive
 *   )
 *
 * console.log(describeValue("hello"))
 * // Output: "String: hello"
 *
 * console.log(describeValue(42))
 * // Output: "Number: 42"
 *
 * console.log(describeValue([1, 2, 3]))
 * // Output: "Other: object"
 *
 * console.log(describeValue(null))
 * // Output: "Other: object"
 * ```
 *
 * @category Predicates
 * @since 4.0.0
 */
export const any = internal.any;
/**
 * Matches any defined (non-null and non-undefined) value.
 *
 * This predicate matches values that are neither `null` nor `undefined`,
 * effectively filtering out nullish values while preserving all other types.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const processValue = Match.type<string | number | null | undefined>()
 *   .pipe(
 *     Match.when(Match.defined, (value) => `Defined value: ${value}`),
 *     Match.orElse(() => "Value is null or undefined")
 *   )
 *
 * console.log(processValue("hello"))
 * // Output: "Defined value: hello"
 *
 * console.log(processValue(42))
 * // Output: "Defined value: 42"
 *
 * console.log(processValue(0))
 * // Output: "Defined value: 0"
 *
 * console.log(processValue(""))
 * // Output: "Defined value: "
 *
 * console.log(processValue(null))
 * // Output: "Value is null or undefined"
 *
 * console.log(processValue(undefined))
 * // Output: "Value is null or undefined"
 * ```
 *
 * @category Predicates
 * @since 4.0.0
 */
export const defined = internal.defined;
/**
 * Matches values of type `boolean`.
 *
 * This predicate refines unknown values to booleans, allowing pattern matching
 * on boolean types. It only matches the primitive boolean values `true` and `false`.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const describeTruthiness = Match.type<unknown>().pipe(
 *   Match.when(
 *     Match.boolean,
 *     (bool) => bool ? "Definitely true" : "Definitely false"
 *   ),
 *   Match.when(0, () => "Falsy number"),
 *   Match.when("", () => "Empty string"),
 *   Match.when(Match.null, () => "Null value"),
 *   Match.orElse(() => "Some other truthy value")
 * )
 *
 * console.log(describeTruthiness(true)) // "Definitely true"
 * console.log(describeTruthiness(false)) // "Definitely false"
 * console.log(describeTruthiness(0)) // "Falsy number"
 * console.log(describeTruthiness(1)) // "Some other truthy value"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const boolean = Predicate.isBoolean;
const _undefined = Predicate.isUndefined;
export {
/**
 * Matches the value `undefined`.
 *
 * @category Predicates
 * @since 4.0.0
 */
_undefined as undefined };
const _null = Predicate.isNull;
export {
/**
 * Matches the value `null`.
 *
 * @category Predicates
 * @since 4.0.0
 */
_null as null };
/**
 * Matches values of type `bigint`.
 *
 * This predicate refines unknown values to bigints, allowing pattern matching
 * on bigint types. BigInts are used for representing integers with arbitrary precision.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const processLargeNumber = Match.type<unknown>().pipe(
 *   Match.when(Match.bigint, (big) => {
 *     if (big > 9007199254740991n) {
 *       return `Large integer: ${big.toString()}`
 *     }
 *     return `BigInt: ${big.toString()}`
 *   }),
 *   Match.when(Match.number, (num) => `Regular number: ${num}`),
 *   Match.orElse(() => "Not a numeric type")
 * )
 *
 * console.log(processLargeNumber(123n)) // "BigInt: 123"
 * console.log(processLargeNumber(9007199254740992n)) // "Large integer: 9007199254740992"
 * console.log(processLargeNumber(123)) // "Regular number: 123"
 * console.log(processLargeNumber("123")) // "Not a numeric type"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const bigint = Predicate.isBigInt;
/**
 * Matches values of type `symbol`.
 *
 * This predicate refines unknown values to symbols, allowing pattern matching
 * on symbol types. Symbols are unique identifiers that are often used as
 * object keys or for creating private properties.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const mySymbol = Symbol("my-symbol")
 * const globalSymbol = Symbol.for("global-symbol")
 *
 * const handleSymbol = Match.type<unknown>().pipe(
 *   Match.when(Match.symbol, (sym) => {
 *     const description = sym.description
 *     if (description) {
 *       return `Symbol with description: ${description}`
 *     }
 *     return "Symbol without description"
 *   }),
 *   Match.orElse(() => "Not a symbol")
 * )
 *
 * console.log(handleSymbol(mySymbol)) // "Symbol with description: my-symbol"
 * console.log(handleSymbol(Symbol())) // "Symbol without description"
 * console.log(handleSymbol("string")) // "Not a symbol"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const symbol = Predicate.isSymbol;
/**
 * Matches values that are instances of `Date`.
 *
 * This predicate refines unknown values to Date instances, allowing pattern
 * matching on Date objects. It only matches actual Date instances, not
 * date strings or timestamps.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const processDateValue = Match.type<unknown>().pipe(
 *   Match.when(Match.date, (date) => {
 *     if (isNaN(date.getTime())) {
 *       return "Invalid date"
 *     }
 *     return `Date: ${date.toISOString().split("T")[0]}`
 *   }),
 *   Match.when(Match.string, (str) => `Date string: ${str}`),
 *   Match.when(
 *     Match.number,
 *     (num) => `Timestamp: ${new Date(num).toISOString()}`
 *   ),
 *   Match.orElse(() => "Not a date-related value")
 * )
 *
 * console.log(processDateValue(new Date("2024-01-01"))) // "Date: 2024-01-01"
 * console.log(processDateValue(new Date("invalid"))) // "Invalid date"
 * console.log(processDateValue("2024-01-01")) // "Date string: 2024-01-01"
 * console.log(processDateValue(1704067200000)) // "Timestamp: 2024-01-01T00:00:00.000Z"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const date = Predicate.isDate;
/**
 * Matches objects where keys are `string` or `symbol` and values are `unknown`.
 *
 * This predicate refines unknown values to record objects, allowing pattern
 * matching on plain objects. It excludes arrays, functions, dates, and other
 * special object types, matching only plain objects and object literals.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const analyzeValue = Match.type<unknown>().pipe(
 *   Match.when(Match.record, (obj) => {
 *     const keys = Object.keys(obj)
 *     const valueCount = keys.length
 *     return `Object with ${valueCount} properties: [${keys.join(", ")}]`
 *   }),
 *   Match.when(
 *     Match.instanceOf(Array),
 *     (arr) => `Array with ${arr.length} items`
 *   ),
 *   Match.when(Match.date, () => "Date object"),
 *   Match.orElse(() => "Not an object")
 * )
 *
 * console.log(analyzeValue({ name: "Alice", age: 30 }))
 * // "Object with 2 properties: [name, age]"
 * console.log(analyzeValue([1, 2, 3]))
 * // "Array with 3 items"
 * console.log(analyzeValue(new Date()))
 * // "Date object"
 * console.log(analyzeValue("hello"))
 * // "Not an object"
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const record = Predicate.isObject;
/**
 * Matches instances of a given class.
 *
 * This predicate checks if a value is an instance of the specified constructor,
 * providing type-safe matching for class instances and built-in objects.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * class CustomError extends Error {
 *   constructor(message: string, public code: number) {
 *     super(message)
 *   }
 * }
 *
 * const handleValue = Match.type<unknown>()
 *   .pipe(
 *     Match.when(
 *       Match.instanceOf(CustomError),
 *       (err) => `Custom error: ${err.message} (code: ${err.code})`
 *     ),
 *     Match.when(
 *       Match.instanceOf(Error),
 *       (err) => `Standard error: ${err.message}`
 *     ),
 *     Match.when(Match.instanceOf(Date), (date) => `Date: ${date.toISOString()}`),
 *     Match.when(
 *       Match.instanceOf(Array),
 *       (arr) => `Array with ${arr.length} items`
 *     ),
 *     Match.orElse((value) => `Other: ${typeof value}`)
 *   )
 *
 * console.log(handleValue(new CustomError("Failed", 404)))
 * // Output: "Custom error: Failed (code: 404)"
 *
 * console.log(handleValue(new Error("Generic error")))
 * // Output: "Standard error: Generic error"
 *
 * console.log(handleValue(new Date()))
 * // Output: "Date: 2024-01-01T00:00:00.000Z"
 *
 * console.log(handleValue([1, 2, 3]))
 * // Output: "Array with 3 items"
 * ```
 *
 * @category Predicates
 * @since 4.0.0
 */
export const instanceOf = internal.instanceOf;
/**
 * Unsafe variant of `instanceOf` that allows matching without type narrowing.
 *
 * This predicate checks if a value is an instance of the specified constructor
 * but doesn't provide the same type safety guarantees as the regular `instanceOf`.
 * Use this when you need more flexibility but understand the type safety implications.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * class CustomError extends Error {
 *   constructor(message: string, public code: number) {
 *     super(message)
 *   }
 * }
 *
 * // When you need to match instances but handle type narrowing manually
 * const handleError = Match.type<unknown>().pipe(
 *   Match.when(Match.instanceOfUnsafe(CustomError), (err: any) => {
 *     // Manual type assertion needed
 *     const customErr = err as CustomError
 *     return `Custom error ${customErr.code}: ${customErr.message}`
 *   }),
 *   Match.orElse(() => "Not a CustomError")
 * )
 * ```
 *
 * @category predicates
 * @since 4.0.0
 */
export const instanceOfUnsafe = internal.instanceOf;
/**
 * Provides a fallback value when no patterns match.
 *
 * **Details**
 *
 * This function ensures that a matcher always returns a valid result, even if
 * no defined patterns match. It acts as a default case, similar to the
 * `default` clause in a `switch` statement or the final `else` in an `if-else`
 * chain.
 *
 * @example (Providing a Default Value When No Patterns Match)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for string or number values
 * const match = Match.type<string | number>().pipe(
 *   // Match when the value is "a"
 *   Match.when("a", () => "ok"),
 *   // Fallback when no patterns match
 *   Match.orElse(() => "fallback")
 * )
 *
 * console.log(match("a"))
 * // Output: "ok"
 *
 * console.log(match("b"))
 * // Output: "fallback"
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const orElse = internal.orElse;
// TODO(4.0): Rename to "orThrow"? Like Result.getOrThrow
/**
 * Throws an error if no pattern matches.
 *
 * **Details**
 *
 * This function finalizes a matcher by ensuring that if no patterns match, an
 * error is thrown. It is useful when all cases should be covered, and any
 * unexpected input should trigger an error instead of returning a default
 * value.
 *
 * When used, this function removes the need for an explicit fallback case and
 * ensures that an unmatched value is never silently ignored.
 *
 * @example
 * ```ts
 * import { Match } from "effect"
 *
 * const strictMatcher = Match.type<"a" | "b">().pipe(
 *   Match.when("a", () => "Found A"),
 *   Match.when("b", () => "Found B"),
 *   // Will throw if input is neither "a" nor "b"
 *   Match.orElseAbsurd
 * )
 *
 * console.log(strictMatcher("a")) // "Found A"
 * console.log(strictMatcher("b")) // "Found B"
 *
 * // This would throw an error at runtime:
 * // strictMatcher("c" as any) // throws
 * ```
 *
 * @category completion
 * @since 4.0.0
 */
export const orElseAbsurd = internal.orElseAbsurd;
/**
 * Wraps the match result in a `Result`, distinguishing matched and unmatched
 * cases.
 *
 * **Details**
 *
 * This function ensures that the result of a matcher is always wrapped in an
 * `Result`, allowing clear differentiation between successful matches
 * (`Ok(value)`) and cases where no pattern matched (`Err(unmatched
 * value)`).
 *
 * This approach is particularly useful when handling optional values or when an
 * unmatched case should be explicitly handled rather than returning a default
 * value or throwing an error.
 *
 * @example (Extracting a User Role with `Match.result`)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * type User = { readonly role: "admin" | "editor" | "viewer" }
 *
 * // Create a matcher to extract user roles
 * const getRole = Match.type<User>().pipe(
 *   Match.when({ role: "admin" }, () => "Has full access"),
 *   Match.when({ role: "editor" }, () => "Can edit content"),
 *   Match.result // Wrap the result in an Result
 * )
 *
 * console.log(getRole({ role: "admin" }))
 * // Output: { _id: 'Result', _tag: 'Ok', ok: 'Has full access' }
 *
 * console.log(getRole({ role: "viewer" }))
 * // Output: { _id: 'Result', _tag: 'Err', err: { role: 'viewer' } }
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const result = internal.result;
/**
 * Wraps the match result in an `Option`, representing an optional match.
 *
 * **Details**
 *
 * This function ensures that the result of a matcher is wrapped in an `Option`,
 * making it easy to handle cases where no pattern matches. If a match is found,
 * it returns `Some(value)`, otherwise, it returns `None`.
 *
 * This is useful in cases where a missing match is expected and should be
 * handled explicitly rather than throwing an error or returning a default
 * value.
 *
 * @example (Extracting a User Role with `Match.option`)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * type User = { readonly role: "admin" | "editor" | "viewer" }
 *
 * // Create a matcher to extract user roles
 * const getRole = Match.type<User>().pipe(
 *   Match.when({ role: "admin" }, () => "Has full access"),
 *   Match.when({ role: "editor" }, () => "Can edit content"),
 *   Match.option // Wrap the result in an Option
 * )
 *
 * console.log(getRole({ role: "admin" }))
 * // Output: { _id: 'Option', _tag: 'Some', value: 'Has full access' }
 *
 * console.log(getRole({ role: "viewer" }))
 * // Output: { _id: 'Option', _tag: 'None' }
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const option = internal.option;
/**
 * The `Match.exhaustive` method finalizes the pattern matching process by
 * ensuring that all possible cases are accounted for. If any case is missing,
 * TypeScript will produce a type error. This is particularly useful when
 * working with unions, as it helps prevent unintended gaps in pattern matching.
 *
 * @example (Ensuring All Cases Are Covered)
 *
 * ```ts
 * import { Match } from "effect"
 *
 * // Create a matcher for string or number values
 * const match = Match.type<string | number>().pipe(
 *   // Match when the value is a number
 *   Match.when(Match.number, (n) => `number: ${n}`),
 *   // Mark the match as exhaustive, ensuring all cases are handled
 *   // TypeScript will throw an error if any case is missing
 *   // @ts-expect-error Type 'string' is not assignable to type 'never'
 *   Match.exhaustive
 * )
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const exhaustive = internal.exhaustive;
const SafeRefinementId = "~effect/match/Match/SafeRefinement";
const Fail = /*#__PURE__*/Symbol.for("effect/Fail");
//# sourceMappingURL=Match.js.map