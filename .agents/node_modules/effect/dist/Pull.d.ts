/**
 * @since 4.0.0
 */
import * as Cause from "./Cause.ts";
import type { Effect } from "./Effect.ts";
import * as Exit from "./Exit.ts";
import * as Result from "./Result.ts";
/**
 * @since 4.0.0
 * @category models
 */
export interface Pull<out A, out E = never, out Done = void, out R = never> extends Effect<A, E | Cause.Done<Done>, R> {
}
/**
 * Extracts the success type from a Pull type.
 *
 * @since 4.0.0
 * @category type extractors
 */
export type Success<P> = P extends Effect<infer _A, infer _E, infer _R> ? _A : never;
/**
 * Extracts the error type from a Pull type, excluding Done errors.
 *
 * @since 4.0.0
 * @category type extractors
 */
export type Error<P> = P extends Effect<infer _A, infer _E, infer _R> ? _E extends Cause.Done<infer _L> ? never : _E : never;
/**
 * Extracts the leftover type from a Pull type.
 *
 * @since 4.0.0
 * @category type extractors
 */
export type Leftover<P> = P extends Effect<infer _A, infer _E, infer _R> ? _E extends Cause.Done<infer _L> ? _L : never : never;
/**
 * Extracts the service requirements (context) type from a Pull type.
 *
 * @since 4.0.0
 * @category type extractors
 */
export type Services<P> = P extends Effect<infer _A, infer _E, infer _R> ? _R : never;
/**
 * Excludes done errors from an error type union.
 *
 * @since 4.0.0
 * @category type extractors
 */
export type ExcludeDone<E> = Exclude<E, Cause.Done<any>>;
/**
 * @since 4.0.0
 * @category Done
 */
export declare const catchDone: {
    /**
     * @since 4.0.0
     * @category Done
     */
    <E, A2, E2, R2>(f: (leftover: Cause.Done.Extract<E>) => Effect<A2, E2, R2>): <A, R>(self: Effect<A, E, R>) => Effect<A | A2, ExcludeDone<E> | E2, R | R2>;
    /**
     * @since 4.0.0
     * @category Done
     */
    <A, R, E, A2, E2, R2>(self: Effect<A, E, R>, f: (leftover: Cause.Done.Extract<E>) => Effect<A2, E2, R2>): Effect<A | A2, ExcludeDone<E> | E2, R | R2>;
};
/**
 * Checks if a Cause contains any done errors.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const isDoneCause: <E>(cause: Cause.Cause<E>) => boolean;
/**
 * Checks if a Cause failure is a done error.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const isDoneFailure: <E>(failure: Cause.Reason<E>) => failure is Cause.Fail<E & Cause.Done<any>>;
/**
 * Filters a Cause to extract only halt errors.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const filterDone: <E>(input: Cause.Cause<E>) => Result.Result<Cause.Done.Only<E>, Cause.Cause<ExcludeDone<E>>>;
/**
 * Filters a Cause to extract only halt errors.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const filterDoneVoid: <E extends Cause.Done>(input: Cause.Cause<E>) => Result.Result<Cause.Done, Cause.Cause<Exclude<E, Cause.Done>>>;
/**
 * @since 4.0.0
 * @category Done
 */
export declare const filterNoDone: <E>(input: Cause.Cause<E>) => Result.Result<Cause.Cause<ExcludeDone<E>>, Cause.Cause<E>>;
/**
 * Filters a Cause to extract the leftover value from done errors.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const filterDoneLeftover: <E>(cause: Cause.Cause<E>) => Result.Result<Cause.Done.Extract<E>, Cause.Cause<ExcludeDone<E>>>;
/**
 * Converts a Cause into an Exit, extracting halt leftovers as success values.
 *
 * @since 4.0.0
 * @category Done
 */
export declare const doneExitFromCause: <E>(cause: Cause.Cause<E>) => Exit.Exit<Cause.Done.Extract<E>, ExcludeDone<E>>;
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
export declare const matchEffect: {
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
    <A, E, L, AS, ES, RS, AF, EF, RF, AH, EH, RH>(options: {
        readonly onSuccess: (value: A) => Effect<AS, ES, RS>;
        readonly onFailure: (failure: Cause.Cause<E>) => Effect<AF, EF, RF>;
        readonly onDone: (leftover: L) => Effect<AH, EH, RH>;
    }): <R>(self: Pull<A, E, L, R>) => Effect<AS | AF | AH, ES | EF | EH, R | RS | RF | RH>;
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
    <A, E, L, R, AS, ES, RS, AF, EF, RF, AH, EH, RH>(self: Pull<A, E, L, R>, options: {
        readonly onSuccess: (value: A) => Effect<AS, ES, RS>;
        readonly onFailure: (failure: Cause.Cause<E>) => Effect<AF, EF, RF>;
        readonly onDone: (leftover: L) => Effect<AH, EH, RH>;
    }): Effect<AS | AF | AH, ES | EF | EH, R | RS | RF | RH>;
};
//# sourceMappingURL=Pull.d.ts.map