/**
 * The Random module provides a service for generating random numbers in Effect
 * programs. It offers a testable and composable way to work with randomness,
 * supporting integers, floating-point numbers, and range-based generation.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const randomFloat = yield* Random.next
 *   console.log("Random float:", randomFloat)
 *
 *   const randomInt = yield* Random.nextInt
 *   console.log("Random integer:", randomInt)
 *
 *   const diceRoll = yield* Random.nextIntBetween(1, 6)
 *   console.log("Dice roll:", diceRoll)
 * })
 * ```
 *
 * @since 4.0.0
 */
import type * as Context from "./Context.ts";
import * as Effect from "./Effect.ts";
/**
 * Represents a service for generating random numbers.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const float = yield* Random.next
 *   const integer = yield* Random.nextInt
 *   const inRange = yield* Random.nextIntBetween(1, 100)
 *   const uuid = yield* Random.nextUUIDv4
 *
 *   console.log("Float:", float)
 *   console.log("Integer:", integer)
 *   console.log("In range:", inRange)
 *   console.log("UUID:", uuid)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const Random: Context.Reference<{
    nextIntUnsafe(): number;
    nextDoubleUnsafe(): number;
}>;
/**
 * Generates a random number between 0 (inclusive) and 1 (inclusive).
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const randomDouble = yield* Random.next
 *   console.log("Random double:", randomDouble)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const next: Effect.Effect<number>;
/**
 * Generates a random boolean value.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const value = yield* Random.nextBoolean
 *   console.log("Random boolean:", value)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const nextBoolean: Effect.Effect<boolean>;
/**
 * Generates a random integer between `Number.MIN_SAFE_INTEGER` (inclusive)
 * and `Number.MAX_SAFE_INTEGER` (inclusive).
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const randomInt = yield* Random.nextInt
 *   console.log("Random integer:", randomInt)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const nextInt: Effect.Effect<number>;
/**
 * Generates a random number between `min` (inclusive) and `max` (inclusive).
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const randomDouble = yield* Random.nextBetween(0, 1)
 *   console.log("Random double: ", randomDouble)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const nextBetween: (min: number, max: number) => Effect.Effect<number>;
/**
 * Generates a random number between `min` (inclusive) and `max` (inclusive).
 *
 * Set `options.halfOpen: true` to generate in the half-open range
 * `[min, max)`.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const diceRoll1 = yield* Random.nextIntBetween(1, 6)
 *   const diceRoll2 = yield* Random.nextIntBetween(1, 6, {
 *     halfOpen: true
 *   })
 *   const diceRoll3 = yield* Random.nextIntBetween(0, 10)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const nextIntBetween: (min: number, max: number, options?: {
    readonly halfOpen?: boolean;
}) => Effect.Effect<number>;
/**
 * Uses the pseudo-random number generator to shuffle the specified iterable.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const values = yield* Random.shuffle([1, 2, 3, 4, 5])
 *   console.log(values)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const shuffle: <A>(elements: Iterable<A>) => Effect.Effect<Array<A>>;
/**
 * Generates a random UUID (v4) string.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const uuid = yield* Random.nextUUIDv4
 *   console.log("UUID:", uuid)
 * })
 * ```
 *
 * @since 4.0.0
 * @category Random Number Generators
 */
export declare const nextUUIDv4: Effect.Effect<string>;
/**
 * Seeds the pseudorandom number generator with the specified value.
 *
 * Take care to select a seed wit hhigh entropy to avoid issues with the
 * quality of random number generation.
 *
 * @example
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const value1 = yield* Random.next
 *   const value2 = yield* Random.next
 *   console.log(value1, value2)
 * })
 *
 * // Same seed produces same sequence
 * const seeded1 = program.pipe(Random.withSeed("my-seed"))
 * const seeded2 = program.pipe(Random.withSeed("my-seed"))
 *
 * // Both will output identical values
 * Effect.runPromise(seeded1)
 * Effect.runPromise(seeded2)
 * ```
 *
 * @since 4.0.0
 * @category Seeding
 */
export declare const withSeed: {
    /**
     * Seeds the pseudorandom number generator with the specified value.
     *
     * Take care to select a seed wit hhigh entropy to avoid issues with the
     * quality of random number generation.
     *
     * @example
     * ```ts
     * import { Effect, Random } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const value1 = yield* Random.next
     *   const value2 = yield* Random.next
     *   console.log(value1, value2)
     * })
     *
     * // Same seed produces same sequence
     * const seeded1 = program.pipe(Random.withSeed("my-seed"))
     * const seeded2 = program.pipe(Random.withSeed("my-seed"))
     *
     * // Both will output identical values
     * Effect.runPromise(seeded1)
     * Effect.runPromise(seeded2)
     * ```
     *
     * @since 4.0.0
     * @category Seeding
     */
    (seed: string | number): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    /**
     * Seeds the pseudorandom number generator with the specified value.
     *
     * Take care to select a seed wit hhigh entropy to avoid issues with the
     * quality of random number generation.
     *
     * @example
     * ```ts
     * import { Effect, Random } from "effect"
     *
     * const program = Effect.gen(function*() {
     *   const value1 = yield* Random.next
     *   const value2 = yield* Random.next
     *   console.log(value1, value2)
     * })
     *
     * // Same seed produces same sequence
     * const seeded1 = program.pipe(Random.withSeed("my-seed"))
     * const seeded2 = program.pipe(Random.withSeed("my-seed"))
     *
     * // Both will output identical values
     * Effect.runPromise(seeded1)
     * Effect.runPromise(seeded2)
     * ```
     *
     * @since 4.0.0
     * @category Seeding
     */
    <A, E, R>(self: Effect.Effect<A, E, R>, seed: string | number): Effect.Effect<A, E, R>;
};
//# sourceMappingURL=Random.d.ts.map