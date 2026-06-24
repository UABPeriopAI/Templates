/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.ts";
import * as Exit from "../../Exit.ts";
import type { LazyArg } from "../../Function.ts";
import * as Option from "../../Option.ts";
import { type Pipeable } from "../../Pipeable.ts";
import type { Predicate, Refinement } from "../../Predicate.ts";
import * as Schema_ from "../../Schema.ts";
import type * as Types from "../../Types.ts";
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = "~effect/reactivity/AsyncResult";
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category models
 */
export type AsyncResult<A, E = never> = Initial<A, E> | Success<A, E> | Failure<A, E>;
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isAsyncResult: (u: unknown) => u is AsyncResult<unknown, unknown>;
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace AsyncResult {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Proto<A, E> extends Pipeable {
        readonly [TypeId]: {
            readonly E: (_: never) => E;
            readonly A: (_: never) => A;
        };
        readonly waiting: boolean;
    }
    /**
     * @since 4.0.0
     */
    type Success<R> = R extends AsyncResult<infer A, infer _> ? A : never;
    /**
     * @since 4.0.0
     */
    type Failure<R> = R extends AsyncResult<infer _, infer E> ? E : never;
}
/**
 * @since 4.0.0
 */
export type With<R extends AsyncResult<any, any>, A, E> = R extends Initial<infer _A, infer _E> ? Initial<A, E> : R extends Success<infer _A, infer _E> ? Success<A, E> : R extends Failure<infer _A, infer _E> ? Failure<A, E> : never;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isWaiting: <A, E>(result: AsyncResult<A, E>) => boolean;
/**
 * @since 4.0.0
 * @category models
 */
export interface Initial<A, E = never> extends AsyncResult.Proto<A, E> {
    readonly _tag: "Initial";
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromExit: <A, E>(exit: Exit.Exit<A, E>) => Success<A, E> | Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromExitWithPrevious: <A, E>(exit: Exit.Exit<A, E>, previous: Option.Option<AsyncResult<A, E>>) => Success<A, E> | Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const waitingFrom: <A, E>(previous: Option.Option<AsyncResult<A, E>>) => AsyncResult<A, E>;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isInitial: <A, E>(result: AsyncResult<A, E>) => result is Initial<A, E>;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isNotInitial: <A, E>(result: AsyncResult<A, E>) => result is Success<A, E> | Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const initial: <A = never, E = never>(waiting?: boolean) => Initial<A, E>;
/**
 * @since 4.0.0
 * @category models
 */
export interface Success<A, E = never> extends AsyncResult.Proto<A, E> {
    readonly _tag: "Success";
    readonly value: A;
    readonly timestamp: number;
}
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isSuccess: <A, E>(result: AsyncResult<A, E>) => result is Success<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const success: <A, E = never>(value: A, options?: {
    readonly waiting?: boolean | undefined;
    readonly timestamp?: number | undefined;
}) => Success<A, E>;
/**
 * @since 4.0.0
 * @category models
 */
export interface Failure<A, E = never> extends AsyncResult.Proto<A, E> {
    readonly _tag: "Failure";
    readonly cause: Cause.Cause<E>;
    readonly previousSuccess: Option.Option<Success<A, E>>;
}
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isFailure: <A, E>(result: AsyncResult<A, E>) => result is Failure<A, E>;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isInterrupted: <A, E>(result: AsyncResult<A, E>) => result is Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const failure: <A, E = never>(cause: Cause.Cause<E>, options?: {
    readonly previousSuccess?: Option.Option<Success<A, E>> | undefined;
    readonly waiting?: boolean | undefined;
}) => Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const failureWithPrevious: <A, E>(cause: Cause.Cause<E>, options: {
    readonly previous: Option.Option<AsyncResult<A, E>>;
    readonly waiting?: boolean | undefined;
}) => Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fail: <E, A = never>(error: E, options?: {
    readonly previousSuccess?: Option.Option<Success<A, E>> | undefined;
    readonly waiting?: boolean | undefined;
}) => Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const failWithPrevious: <A, E>(error: E, options: {
    readonly previous: Option.Option<AsyncResult<A, E>>;
    readonly waiting?: boolean | undefined;
}) => Failure<A, E>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const waiting: <R extends AsyncResult<any, any>>(self: R, options?: {
    readonly touch?: boolean | undefined;
}) => R;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const touch: <A extends AsyncResult<any, any>>(result: A) => A;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const replacePrevious: <R extends AsyncResult<any, any>, XE, A>(self: R, previous: Option.Option<AsyncResult<A, XE>>) => With<R, A, AsyncResult.Failure<R>>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const value: <A, E>(self: AsyncResult<A, E>) => Option.Option<A>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const getOrElse: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    <B>(orElse: LazyArg<B>): <A, E>(self: AsyncResult<A, E>) => A | B;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <A, E, B>(self: AsyncResult<A, E>, orElse: LazyArg<B>): A | B;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const getOrThrow: <A, E>(self: AsyncResult<A, E>) => A;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const cause: <A, E>(self: AsyncResult<A, E>) => Option.Option<Cause.Cause<E>>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const error: <A, E>(self: AsyncResult<A, E>) => Option.Option<E>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const toExit: <A, E>(self: AsyncResult<A, E>) => Exit.Exit<A, E | Cause.NoSuchElementError>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const map: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, B>(f: (a: A) => B): <E>(self: AsyncResult<A, E>) => AsyncResult<B, E>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <E, A, B>(self: AsyncResult<A, E>, f: (a: A) => B): AsyncResult<B, E>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const flatMap: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, B, E2>(f: (a: A, prev: Success<A, E>) => AsyncResult<A, E2>): (self: AsyncResult<A, E>) => AsyncResult<B, E | E2>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <E, A, B, E2>(self: AsyncResult<A, E>, f: (a: A, prev: Success<A, E>) => AsyncResult<B, E2>): AsyncResult<B, E | E2>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const match: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, X, Y, Z>(options: {
        readonly onInitial: (_: Initial<A, E>) => X;
        readonly onFailure: (_: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): (self: AsyncResult<A, E>) => X | Y | Z;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, X, Y, Z>(self: AsyncResult<A, E>, options: {
        readonly onInitial: (_: Initial<A, E>) => X;
        readonly onFailure: (_: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): X | Y | Z;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const matchWithError: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, W, X, Y, Z>(options: {
        readonly onInitial: (_: Initial<A, E>) => W;
        readonly onError: (error: E, _: Failure<A, E>) => X;
        readonly onDefect: (defect: unknown, _: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): (self: AsyncResult<A, E>) => W | X | Y | Z;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, W, X, Y, Z>(self: AsyncResult<A, E>, options: {
        readonly onInitial: (_: Initial<A, E>) => W;
        readonly onError: (error: E, _: Failure<A, E>) => X;
        readonly onDefect: (defect: unknown, _: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): W | X | Y | Z;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const matchWithWaiting: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, W, X, Y, Z>(options: {
        readonly onWaiting: (_: AsyncResult<A, E>) => W;
        readonly onError: (error: E, _: Failure<A, E>) => X;
        readonly onDefect: (defect: unknown, _: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): (self: AsyncResult<A, E>) => W | X | Y | Z;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A, E, W, X, Y, Z>(self: AsyncResult<A, E>, options: {
        readonly onWaiting: (_: AsyncResult<A, E>) => W;
        readonly onError: (error: E, _: Failure<A, E>) => X;
        readonly onDefect: (defect: unknown, _: Failure<A, E>) => Y;
        readonly onSuccess: (_: Success<A, E>) => Z;
    }): W | X | Y | Z;
};
/**
 * Combines multiple results into a single result. Also works with non-result
 * values.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const all: <const Arg extends Iterable<any> | Record<string, any>>(results: Arg) => AsyncResult<[Arg] extends [ReadonlyArray<any>] ? { -readonly [K in keyof Arg]: [Arg[K]] extends [AsyncResult<infer _A, infer _E>] ? _A : Arg[K]; } : [Arg] extends [Iterable<infer _A>] ? _A extends AsyncResult<infer _AA, infer _E_1> ? _AA : _A : [Arg] extends [Record<string, any>] ? { -readonly [K in keyof Arg]: [Arg[K]] extends [AsyncResult<infer _A, infer _E_2>] ? _A : Arg[K]; } : never, [Arg] extends [ReadonlyArray<any>] ? AsyncResult.Failure<Arg[number]> : [Arg] extends [Iterable<infer _A>] ? AsyncResult.Failure<_A> : [Arg] extends [Record<string, any>] ? AsyncResult.Failure<Arg[keyof Arg]> : never>;
/**
 * @since 4.0.0
 * @category Builder
 */
export declare const builder: <A extends AsyncResult<any, any>>(self: A) => Builder<never, A extends Success<infer _A, infer _E> ? _A : never, A extends Failure<infer _A, infer _E_1> ? _E_1 : never, A extends Initial<infer _A, infer _E_2> ? true : never>;
/**
 * @since 4.0.0
 * @category Builder
 */
export type Builder<Out, A, E, I> = Pipeable & {
    onWaiting<B>(f: (result: AsyncResult<A, E>) => B): Builder<Out | B, A, E, I>;
    onDefect<B>(f: (defect: unknown, result: Failure<A, E>) => B): Builder<Out | B, A, E, I>;
    orElse<B>(orElse: LazyArg<B>): Out | B;
    orNull(): Out | null;
    render(): [A | I] extends [never] ? Out : Out | null;
} & ([I] extends [never] ? {} : {
    onInitial<B>(f: (result: Initial<A, E>) => B): Builder<Out | B, A, E, never>;
    onInitialOrWaiting<B>(f: (result: AsyncResult<A, E>) => B): Builder<Out | B, A, E, never>;
}) & ([A] extends [never] ? {} : {
    onSuccess<B>(f: (value: A, result: Success<A, E>) => B): Builder<Out | B, never, E, I>;
}) & ([E] extends [never] ? {} : {
    onFailure<B>(f: (cause: Cause.Cause<E>, result: Failure<A, E>) => B): Builder<Out | B, A, never, I>;
    onError<B>(f: (error: E, result: Failure<A, E>) => B): Builder<Out | B, A, never, I>;
    onErrorIf<B extends E, C>(refinement: Refinement<E, B>, f: (error: B, result: Failure<A, E>) => C): Builder<Out | C, A, Types.EqualsWith<E, B, E, Exclude<E, B>>, I>;
    onErrorIf<C>(predicate: Predicate<E>, f: (error: E, result: Failure<A, E>) => C): Builder<Out | C, A, E, I>;
    onErrorTag<const Tags extends ReadonlyArray<Types.Tags<E>>, B>(tags: Tags, f: (error: Types.ExtractTag<E, Tags[number]>, result: Failure<A, E>) => B): Builder<Out | B, A, Types.ExcludeTag<E, Tags[number]>, I>;
    onErrorTag<const Tag extends Types.Tags<E>, B>(tag: Tag, f: (error: Types.ExtractTag<E, Tag>, result: Failure<A, E>) => B): Builder<Out | B, A, Types.ExcludeTag<E, Tag>, I>;
});
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface Schema<Success extends Schema_.Top, Error extends Schema_.Top> extends Schema_.declareConstructor<AsyncResult<Success["Type"], Error["Type"]>, AsyncResult<Success["Encoded"], Error["Encoded"]>, readonly [Success, Schema_.Cause<Error, Schema_.Defect>]> {
    readonly success: Success;
    readonly error: Error;
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const Schema: <A extends Schema_.Top = Schema_.Never, E extends Schema_.Top = Schema_.Never>(options: {
    readonly success?: A | undefined;
    readonly error?: E | undefined;
}) => Schema<A, E>;
//# sourceMappingURL=AsyncResult.d.ts.map