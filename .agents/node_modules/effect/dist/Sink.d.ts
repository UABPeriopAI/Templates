/**
 * @since 2.0.0
 */
import type { NonEmptyReadonlyArray } from "./Array.ts";
import * as Arr from "./Array.ts";
import * as Cause from "./Cause.ts";
import * as Channel from "./Channel.ts";
import type * as Context from "./Context.ts";
import * as Duration from "./Duration.ts";
import * as Effect from "./Effect.ts";
import * as Exit from "./Exit.ts";
import type * as Filter from "./Filter.ts";
import type { LazyArg } from "./Function.ts";
import * as Option from "./Option.ts";
import { type Pipeable } from "./Pipeable.ts";
import type { Predicate, Refinement } from "./Predicate.ts";
import * as PubSub from "./PubSub.ts";
import * as Pull from "./Pull.ts";
import * as Queue from "./Queue.ts";
import * as Scope from "./Scope.ts";
import type { Stream } from "./Stream.ts";
import type * as Types from "./Types.ts";
import type * as Unify from "./Unify.ts";
declare const TypeId = "~effect/Sink";
/**
 * A `Sink<A, In, L, E, R>` is used to consume elements produced by a `Stream`.
 * You can think of a sink as a function that will consume a variable amount of
 * `In` elements (could be 0, 1, or many), might fail with an error of type `E`,
 * and will eventually yield a value of type `A` together with a remainder of
 * type `L` (i.e. any leftovers).
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as Sink from "effect/Sink"
 * import * as Stream from "effect/Stream"
 *
 * // Create a simple sink that always succeeds with a value
 * const sink: Sink.Sink<number> = Sink.succeed(42)
 *
 * // Use the sink to consume a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: 42
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface Sink<out A, in In = unknown, out L = never, out E = never, out R = never> extends Sink.Variance<A, In, L, E, R>, Pipeable {
    readonly transform: (upstream: Pull.Pull<NonEmptyReadonlyArray<In>, never, void>, scope: Scope.Scope) => Effect.Effect<End<A, L>, E, R>;
    [Unify.typeSymbol]?: unknown;
    [Unify.unifySymbol]?: SinkUnify<this>;
    [Unify.ignoreSymbol]?: SinkUnifyIgnore;
}
/**
 * @since 2.0.0
 * @category models
 */
export type End<A, L = never> = readonly [value: A, leftover?: NonEmptyReadonlyArray<L> | undefined];
/**
 * Interface for Sink unification, used internally by the Effect type system
 * to provide proper type inference when using Sink with other Effect types.
 *
 * @example
 * ```ts
 * import type { Effect } from "effect"
 * import type * as Sink from "effect/Sink"
 * import type * as Unify from "effect/Unify"
 *
 * // SinkUnify helps unify Sink and Effect types
 * declare const sink: Sink.Sink<number>
 * declare const effect: Effect.Effect<string>
 *
 * // The unification system handles mixed operations
 * type Combined = Sink.SinkUnify<{ [Unify.typeSymbol]?: any }>
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface SinkUnify<A extends {
    [Unify.typeSymbol]?: any;
}> extends Effect.EffectUnify<A> {
    Sink?: () => A[Unify.typeSymbol] extends Sink<infer A, infer In, infer L, infer E, infer R> | infer _ ? Sink<A, In, L, E, R> : never;
}
/**
 * Interface used to ignore certain types during Sink unification.
 * Part of the internal type system machinery.
 *
 * @example
 * ```ts
 * import type * as Sink from "effect/Sink"
 *
 * // Used internally by the type system
 * type IgnoreConfig = Sink.SinkUnifyIgnore
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export interface SinkUnifyIgnore {
    Effect?: true;
}
/**
 * Namespace containing types and interfaces for Sink variance and type relationships.
 *
 * @example
 * ```ts
 * import type * as Sink from "effect/Sink"
 *
 * // The Sink namespace contains internal type definitions
 * // These are used internally for type safety and variance
 * type SinkType<A, In, L, E, R> = Sink.Sink<A, In, L, E, R>
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export declare namespace Sink {
    /**
     * Represents the variance annotations for a Sink type.
     * Used internally to track how type parameters flow through the Sink.
     *
     * @example
     * ```ts
     * import type * as Sink from "effect/Sink"
     *
     * // The variance interface is used internally
     * // It defines how type parameters behave in Sink
     * type SinkWithVariance = Sink.Sink<string> & { variance: "internal" }
     * ```
     *
     * @since 2.0.0
     * @category models
     */
    interface Variance<out A, in In, out L, out E, out R> {
        readonly [TypeId]: VarianceStruct<A, In, L, E, R>;
    }
    /**
     * The internal structure representing Sink variance annotations.
     * Contains the actual variance markers for each type parameter.
     *
     * @example
     * ```ts
     * import type * as Sink from "effect/Sink"
     *
     * // The variance structure is used internally by the type system
     * // It ensures proper type safety for Sink operations
     * type SinkInstance = Sink.Sink<number, string>
     * ```
     *
     * @since 2.0.0
     * @category models
     */
    interface VarianceStruct<out A, in In, out L, out E, out R> {
        _A: Types.Covariant<A>;
        _In: Types.Contravariant<In>;
        _L: Types.Covariant<L>;
        _E: Types.Covariant<E>;
        _R: Types.Covariant<R>;
    }
}
/**
 * Checks if a value is a Sink.
 *
 * @example
 * ```ts
 * import { Sink } from "effect"
 *
 * const sink = Sink.never
 * const notStream = { data: [1, 2, 3] }
 *
 * console.log(Sink.isSink(sink)) // true
 * console.log(Sink.isSink(notStream)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isSink: (u: unknown) => u is Sink<unknown, never, unknown, unknown, unknown>;
/**
 * Creates a sink from a `Channel`.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromChannel: <L, In, E, A, R>(channel: Channel.Channel<never, E, End<A, L>, NonEmptyReadonlyArray<In>, never, void, R>) => Sink<A, In, L, E, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromTransform: <In, A, E, R, L = never>(transform: (upstream: Pull.Pull<NonEmptyReadonlyArray<In>, never, void>, scope: Scope.Scope) => Effect.Effect<End<A, L>, E, R>) => Sink<A, In, L, E, R>;
/**
 * Creates a `Channel` from a Sink.
 *
 * @example
 * ```ts
 * import { Sink } from "effect"
 *
 * // Create a sink and extract its channel
 * const sink = Sink.succeed(42)
 * const channel = Sink.toChannel(sink)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const toChannel: <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Channel.Channel<never, E, End<A, L>, NonEmptyReadonlyArray<In>, never, void, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <In>() => make.Constructor<In>;
/**
 * @since 4.0.0
 */
export declare namespace make {
    /**
     * @since 4.0.0
     */
    interface Constructor<In> {
        <E, R, B = never>(ab: (_: Stream<In>) => Effect.Effect<B, E, R>): Sink<B, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never>(ab: (_: Stream<In>) => B, bc: (_: B) => Effect.Effect<C, E, R>): Sink<C, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => Effect.Effect<D, E, R>): Sink<D, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => Effect.Effect<F, E, R>): Sink<F, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => Effect.Effect<G, E, R>): Sink<G, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never, H = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => G, gh: (_: G) => Effect.Effect<H, E, R>): Sink<H, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never, H = never, I = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => Effect.Effect<I, E, R>): Sink<I, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never, H = never, I = never, J = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => Effect.Effect<J, E, R>): Sink<J, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never, H = never, I = never, J = never, K = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => Effect.Effect<K, E, R>): Sink<K, In, never, E, Exclude<R, Scope.Scope>>;
        <E, R, B = never, C = never, D = never, F = never, G = never, H = never, I = never, J = never, K = never, L = never>(ab: (_: Stream<In>) => B, bc: (_: B) => C, cd: (_: C) => D, df: (_: D) => F, fg: (_: F) => G, gh: (_: G) => H, hi: (_: H) => I, ij: (_: I) => J, jk: (_: J) => K, kl: (_: K) => Effect.Effect<L, E, R>): Sink<L, In, never, E, Exclude<R, Scope.Scope>>;
    }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromEffectEnd: <A, E, R, L = never>(effect: Effect.Effect<End<A, L>, E, R>) => Sink<A, unknown, L, E, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromEffect: <A, E, R>(effect: Effect.Effect<A, E, R>) => Sink<A, unknown, never, E, R>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const fromQueue: <A>(queue: Queue.Queue<A, Cause.Done>) => Sink<void, A>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const fromPubSub: <A>(pubsub: PubSub.PubSub<A>) => Sink<void, A>;
/**
 * A sink that immediately ends with the specified value.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that always yields the same value
 * const sink = Sink.succeed(42)
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: 42
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const succeed: <A, L = never>(a: A, leftovers?: NonEmptyReadonlyArray<L> | undefined) => Sink<A, unknown, L>;
/**
 * A sink that immediately ends with the specified lazily evaluated value.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const sync: <A>(a: LazyArg<A>) => Sink<A>;
/**
 * A sink that is created from a lazily evaluated sink.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const suspend: <A, In, L, E, R>(evaluate: LazyArg<Sink<A, In, L, E, R>>) => Sink<A, In, L, E, R>;
/**
 * A sink that always fails with the specified error.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that always fails
 * const sink = Sink.fail(new Error("Sink failed"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Sink failed
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fail: <E>(e: E) => Sink<never, unknown, never, E>;
/**
 * A sink that always fails with the specified lazily evaluated error.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a lazy error
 * const sink = Sink.failSync(() => new Error("Lazy error"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy error
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const failSync: <E>(evaluate: LazyArg<E>) => Sink<never, unknown, never, E>;
/**
 * Creates a sink halting with a specified `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a specific cause
 * const sink = Sink.failCause(Cause.fail(new Error("Custom cause")))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Custom cause
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const failCause: <E>(cause: Cause.Cause<E>) => Sink<never, unknown, never, E>;
/**
 * Creates a sink halting with a specified lazily evaluated `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a lazy cause
 * const sink = Sink.failCauseSync(() => Cause.fail(new Error("Lazy cause")))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy cause
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const failCauseSync: <E>(evaluate: LazyArg<Cause.Cause<E>>) => Sink<never, unknown, never, E>;
/**
 * Creates a sink halting with a specified defect.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that dies with a defect
 * const sink = Sink.die(new Error("Defect error"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Defect error
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const die: (defect: unknown) => Sink<never>;
/**
 * A sink that never completes.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const never: Sink<unknown>;
/**
 * Drains the remaining elements from the stream after the sink finishes
 *
 * @since 2.0.0
 * @category utils
 */
export declare const ignoreLeftover: <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, never, E, R>;
/**
 * Drains elements from the stream by ignoring all inputs.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const drain: Sink<void, unknown>;
/**
 * A sink that folds its inputs with the provided function, termination
 * predicate and initial state.
 *
 * @since 2.0.0
 * @category folding
 */
export declare const fold: <S, In, E = never, R = never>(s: LazyArg<S>, contFn: Predicate<S>, f: (s: S, input: In) => Effect.Effect<S, E, R>) => Sink<S, In, In, E, R>;
/**
 * @since 2.0.0
 * @category folding
 */
export declare const foldArray: <S, In, E = never, R = never>(s: LazyArg<S>, contFn: Predicate<S>, f: (s: S, input: Arr.NonEmptyReadonlyArray<In>) => Effect.Effect<S, E, R>) => Sink<S, In, never, E, R>;
/**
 * @since 2.0.0
 * @category folding
 */
export declare const foldUntil: <S, In, E = never, R = never>(s: LazyArg<S>, max: number, f: (s: S, input: In) => Effect.Effect<S, E, R>) => Sink<S, In, In, E, R>;
/**
 * A sink that returns whether all elements satisfy the specified predicate.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const every: <In>(predicate: Predicate<In>) => Sink<boolean, In, In>;
/**
 * A sink that returns whether an element satisfies the specified predicate.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const some: <In>(predicate: Predicate<In>) => Sink<boolean, In, In>;
/**
 * Transforms this sink's result.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const map: {
    /**
     * Transforms this sink's result.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, A2>(f: (a: A) => A2): <In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A2, In, L, E, R>;
    /**
     * Transforms this sink's result.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, A2>(self: Sink<A, In, L, E, R>, f: (a: A) => A2): Sink<A2, In, L, E, R>;
};
/**
 * Set the sink's result to a constant value.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const as: {
    /**
     * Set the sink's result to a constant value.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A2>(a2: A2): <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A2, In, L, E, R>;
    /**
     * Set the sink's result to a constant value.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, A2>(self: Sink<A, In, L, E, R>, a2: A2): Sink<A2, In, L, E, R>;
};
/**
 * Transforms this sink's input elements.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const mapInput: {
    /**
     * Transforms this sink's input elements.
     *
     * @since 2.0.0
     * @category mapping
     */
    <In0, In>(f: (input: In0) => In): <A, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In0, L, E, R>;
    /**
     * Transforms this sink's input elements.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, In0>(self: Sink<A, In, L, E, R>, f: (input: In0) => In): Sink<A, In0, L, E, R>;
};
/**
 * Effectfully transforms this sink's input elements.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const mapInputEffect: {
    /**
     * Effectfully transforms this sink's input elements.
     *
     * @since 2.0.0
     * @category mapping
     */
    <In0, In, E2, R2>(f: (input: In0) => Effect.Effect<In, E2, R2>): <A, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In0, L, E2 | E, R2 | R>;
    /**
     * Effectfully transforms this sink's input elements.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, In0, E2, R2>(self: Sink<A, In, L, E, R>, f: (input: In0) => Effect.Effect<In, E2, R2>): Sink<A, In0, L, E | E2, R | R2>;
};
/**
 * Transforms this sink's input elements.
 *
 * @since 4.0.0
 * @category mapping
 */
export declare const mapInputArray: {
    /**
     * Transforms this sink's input elements.
     *
     * @since 4.0.0
     * @category mapping
     */
    <In0, In>(f: (input: Arr.NonEmptyReadonlyArray<In0>) => Arr.NonEmptyReadonlyArray<In>): <A, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In0, L, E, R>;
    /**
     * Transforms this sink's input elements.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, In, L, E, R, In0>(self: Sink<A, In, L, E, R>, f: (input: Arr.NonEmptyReadonlyArray<In0>) => Arr.NonEmptyReadonlyArray<In>): Sink<A, In0, L, E, R>;
};
/**
 * Effectfully transforms this sink's input elements.
 *
 * @since 4.0.0
 * @category mapping
 */
export declare const mapInputArrayEffect: {
    /**
     * Effectfully transforms this sink's input elements.
     *
     * @since 4.0.0
     * @category mapping
     */
    <In0, In, E2, R2>(f: (input: Arr.NonEmptyReadonlyArray<In0>) => Effect.Effect<Arr.NonEmptyReadonlyArray<In>, E2, R2>): <A, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In0, L, E2 | E, R2 | R>;
    /**
     * Effectfully transforms this sink's input elements.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, In, L, E, R, In0, E2, R2>(self: Sink<A, In, L, E, R>, f: (input: Arr.NonEmptyReadonlyArray<In0>) => Effect.Effect<Arr.NonEmptyReadonlyArray<In>, E2, R2>): Sink<A, In0, L, E | E2, R | R2>;
};
/**
 * Transforms this sink's result.
 *
 * @since 4.0.0
 * @category mapping
 */
export declare const mapEnd: {
    /**
     * Transforms this sink's result.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, L, A2, L2 = never>(f: (a: End<A, L>) => End<A2, L2>): <In, E, R>(self: Sink<A, In, L, E, R>) => Sink<A2, In, L2, E, R>;
    /**
     * Transforms this sink's result.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, In, L, E, R, A2, L2 = never>(self: Sink<A, In, L, E, R>, f: (a: End<A, L>) => End<A2, L2>): Sink<A2, In, L2, E, R>;
};
/**
 * Effectfully transforms this sink's result.
 *
 * @since 4.0.0
 * @category mapping
 */
export declare const mapEffectEnd: {
    /**
     * Effectfully transforms this sink's result.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, L, A2, E2, R2, L2 = never>(f: (end: End<A, L>) => Effect.Effect<End<A2, L2>, E2, R2>): <In, E, R>(self: Sink<A, In, L, E, R>) => Sink<A2, In, L2, E2 | E, R2 | R>;
    /**
     * Effectfully transforms this sink's result.
     *
     * @since 4.0.0
     * @category mapping
     */
    <A, In, L, E, R, A2, E2, R2, L2 = never>(self: Sink<A, In, L, E, R>, f: (end: End<A, L>) => Effect.Effect<End<A2, L2>, E2, R2>): Sink<A2, In, L2, E | E2, R | R2>;
};
/**
 * Effectfully transforms this sink's result.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const mapEffect: {
    /**
     * Effectfully transforms this sink's result.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, A2, E2, R2>(f: (a: A) => Effect.Effect<A2, E2, R2>): <In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A2, In, L, E2 | E, R2 | R>;
    /**
     * Effectfully transforms this sink's result.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, A2, E2, R2>(self: Sink<A, In, L, E, R>, f: (a: A) => Effect.Effect<A2, E2, R2>): Sink<A2, In, L, E | E2, R | R2>;
};
/**
 * Transforms the errors emitted by this sink using `f`.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const mapError: {
    /**
     * Transforms the errors emitted by this sink using `f`.
     *
     * @since 2.0.0
     * @category mapping
     */
    <E, E2>(f: (error: E) => E2): <A, In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L, E2, R>;
    /**
     * Transforms the errors emitted by this sink using `f`.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, E2>(self: Sink<A, In, L, E, R>, f: (error: E) => E2): Sink<A, In, L, E2, R>;
};
/**
 * Transforms the leftovers emitted by this sink using `f`.
 *
 * @since 2.0.0
 * @category mapping
 */
export declare const mapLeftover: {
    /**
     * Transforms the leftovers emitted by this sink using `f`.
     *
     * @since 2.0.0
     * @category mapping
     */
    <L, L2>(f: (leftover: L) => L2): <A, In, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L2, E, R>;
    /**
     * Transforms the leftovers emitted by this sink using `f`.
     *
     * @since 2.0.0
     * @category mapping
     */
    <A, In, L, E, R, L2>(self: Sink<A, In, L, E, R>, f: (leftover: L) => L2): Sink<A, In, L2, E, R>;
};
/**
 * @since 2.0.0
 * @category collecting
 */
export declare const take: <In>(n: number) => Sink<Array<In>, In, In>;
/**
 * Runs this sink until it yields a result, then uses that result to create
 * another sink from the provided function which will continue to run until it
 * yields a result.
 *
 * This function essentially runs sinks in sequence.
 *
 * @since 2.0.0
 * @category sequencing
 */
export declare const flatMap: {
    /**
     * Runs this sink until it yields a result, then uses that result to create
     * another sink from the provided function which will continue to run until it
     * yields a result.
     *
     * This function essentially runs sinks in sequence.
     *
     * @since 2.0.0
     * @category sequencing
     */
    <A, A1, L, In1 extends L, L1, E1, R1>(f: (a: A) => Sink<A1, In1, L1, E1, R1>): <In, E, R>(self: Sink<A, In, L, E, R>) => Sink<A1, In & In1, L1 | L, E1 | E, R1 | R>;
    /**
     * Runs this sink until it yields a result, then uses that result to create
     * another sink from the provided function which will continue to run until it
     * yields a result.
     *
     * This function essentially runs sinks in sequence.
     *
     * @since 2.0.0
     * @category sequencing
     */
    <A, In, L, E, R, A1, In1 extends L, L1, E1, R1>(self: Sink<A, In, L, E, R>, f: (a: A) => Sink<A1, In1, L1, E1, R1>): Sink<A1, In & In1, L | L1, E | E1, R | R1>;
};
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state while the specified `predicate` returns `true`.
 *
 * @since 2.0.0
 * @category reducing
 */
export declare const reduceWhile: <S, In>(initial: LazyArg<S>, predicate: Predicate<S>, f: (s: S, input: In) => S) => Sink<S, In, In>;
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the provided `initial` state while the specified `predicate`
 * returns `true`.
 *
 * @since 2.0.0
 * @category reducing
 */
export declare const reduceWhileEffect: <S, In, E, R>(initial: LazyArg<S>, predicate: Predicate<S>, f: (s: S, input: In) => Effect.Effect<S, E, R>) => Sink<S, In, In, E, R>;
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state while the specified `predicate` returns `true`.
 *
 * @since 4.0.0
 * @category reducing
 */
export declare const reduceWhileArray: <S, In>(initial: LazyArg<S>, contFn: Predicate<S>, f: (s: S, input: NonEmptyReadonlyArray<In>) => S) => Sink<S, In>;
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the provided `initial` state while the specified `predicate`
 * returns `true`.
 *
 * @since 4.0.0
 * @category reducing
 */
export declare const reduceWhileArrayEffect: <S, In, E, R>(initial: LazyArg<S>, predicate: Predicate<S>, f: (s: S, input: NonEmptyReadonlyArray<In>) => Effect.Effect<S, E, R>) => Sink<S, In, never, E, R>;
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export declare const reduce: <S, In>(initial: LazyArg<S>, f: (s: S, input: In) => S) => Sink<S, In>;
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the specified `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export declare const reduceArray: <S, In>(initial: LazyArg<S>, f: (s: S, input: NonEmptyReadonlyArray<In>) => S) => Sink<S, In>;
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the specified `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export declare const reduceEffect: <S, In, E, R>(initial: LazyArg<S>, f: (s: S, input: In) => Effect.Effect<S, E, R>) => Sink<S, In, never, E, R>;
/**
 * Creates a sink containing the first value.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const head: <In>() => Sink<Option.Option<In>, In, In>;
/**
 * Creates a sink containing the last value.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const last: <In>() => Sink<Option.Option<In>, In>;
/**
 * Creates a sink containing the first matching value.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const find: {
    /**
     * Creates a sink containing the first matching value.
     *
     * @since 4.0.0
     * @category constructors
     */
    <In, Out extends In>(refinement: Refinement<In, Out>): Sink<Option.Option<Out>, In, In>;
    /**
     * Creates a sink containing the first matching value.
     *
     * @since 4.0.0
     * @category constructors
     */
    <In>(predicate: Predicate<In>): Sink<Option.Option<In>, In, In>;
};
/**
 * Creates a sink containing the first matching value.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const findEffect: <In, E, R>(predicate: (input: In) => Effect.Effect<boolean, E, R>) => Sink<Option.Option<In>, In, In, E, R>;
/**
 * Creates a sink which sums up its inputs.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const sum: Sink<number, number>;
/**
 * A sink that counts the number of elements fed to it.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const count: Sink<number, unknown>;
/**
 * Accumulates incoming elements into an array.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const collect: <In>() => Sink<Array<In>, In>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeWhile: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <In, Out extends In>(refinement: Refinement<In, Out>): Sink<Array<Out>, In, In>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <In>(predicate: Predicate<In>): Sink<Array<In>, In, In>;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeWhileFilter: <In, Out, X>(filter: Filter.Filter<In, Out, X>) => Sink<Array<Out>, In, In>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeWhileEffect: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <In, E, R>(predicate: (input: In) => Effect.Effect<boolean, E, R>): Sink<Array<In>, In, In, E, R>;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeWhileFilterEffect: <In, Out, X, E, R>(filter: Filter.FilterEffect<In, Out, X, E, R>) => Sink<Array<Out>, In, In, E, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeUntil: <In>(predicate: Predicate<In>) => Sink<Array<In>, In, In>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const takeUntilEffect: <In, E, R>(predicate: (input: In) => Effect.Effect<boolean, E, R>) => Sink<Array<In>, In, In, E, R>;
/**
 * A sink that executes the provided effectful function for every item fed
 * to it.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that logs each item
 * const sink = Sink.forEach((item: number) => Console.log(`Processing: ${item}`))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output:
 * // Processing: 1
 * // Processing: 2
 * // Processing: 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const forEach: <In, X, E, R>(f: (input: In) => Effect.Effect<X, E, R>) => Sink<void, In, never, E, R>;
/**
 * A sink that executes the provided effectful function for every Chunk fed
 * to it.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that processes chunks
 * const sink = Sink.forEachArray((chunk: ReadonlyArray<number>) =>
 *   Console.log(
 *     `Processing chunk of ${chunk.length} items: [${chunk.join(", ")}]`
 *   )
 * )
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3, 4, 5)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output: Processing chunk of 5 items: [1, 2, 3, 4, 5]
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const forEachArray: <In, X, E, R>(f: (input: NonEmptyReadonlyArray<In>) => Effect.Effect<X, E, R>) => Sink<void, In, never, E, R>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const forEachWhile: <In, E, R>(f: (input: In) => Effect.Effect<boolean, E, R>) => Sink<void, In, never, E, R>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const forEachWhileArray: <In, E, R>(f: (input: NonEmptyReadonlyArray<In>) => Effect.Effect<boolean, E, R>) => Sink<void, In, never, E, R>;
/**
 * Creates a sink produced from a scoped effect.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink from an effect that produces a sink
 * const sinkEffect = Effect.succeed(
 *   Sink.forEach((item: number) => Console.log(`Item: ${item}`))
 * )
 * const sink = Sink.unwrap(sinkEffect)
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output:
 * // Item: 1
 * // Item: 2
 * // Item: 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const unwrap: <A, In, L, E, R, R2>(effect: Effect.Effect<Sink<A, In, L, E, R2>, E, R>) => Sink<A, In, L, E, Exclude<R, Scope.Scope> | R2>;
/**
 * Summarize a sink by running an effect when the sink starts and again when
 * it completes.
 *
 * @since 2.0.0
 * @category utils
 */
export declare const summarized: {
    /**
     * Summarize a sink by running an effect when the sink starts and again when
     * it completes.
     *
     * @since 2.0.0
     * @category utils
     */
    <A2, E2, R2, A3>(summary: Effect.Effect<A2, E2, R2>, f: (start: A2, end: A2) => A3): <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<[A, A3], In, L, E2 | E, R2 | R>;
    /**
     * Summarize a sink by running an effect when the sink starts and again when
     * it completes.
     *
     * @since 2.0.0
     * @category utils
     */
    <A, In, L, E, R, A2, E2, R2, A3>(self: Sink<A, In, L, E, R>, summary: Effect.Effect<A2, E2, R2>, f: (start: A2, end: A2) => A3): Sink<[A, A3], In, L, E | E2, R | R2>;
};
/**
 * Returns the sink that executes this one and times its execution.
 *
 * @since 2.0.0
 * @category utils
 */
export declare const withDuration: <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<[A, Duration.Duration], In, L, E, R>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const timed: Sink<Duration.Duration, unknown>;
/**
 * @since 4.0.0
 * @category Services
 */
export declare const provideContext: {
    /**
     * @since 4.0.0
     * @category Services
     */
    <Provided>(context: Context.Context<Provided>): <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L, E, Exclude<R, Provided>>;
    /**
     * @since 4.0.0
     * @category Services
     */
    <A, In, L, E, R, Provided>(self: Sink<A, In, L, E, R>, context: Context.Context<Provided>): Sink<A, In, L, E, Exclude<R, Provided>>;
};
/**
 * @since 4.0.0
 * @category Services
 */
export declare const provideService: {
    /**
     * @since 4.0.0
     * @category Services
     */
    <I, S>(key: Context.Key<I, S>, value: Types.NoInfer<S>): <A, In, L, E, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L, E, Exclude<R, I>>;
    /**
     * @since 4.0.0
     * @category Services
     */
    <A, In, L, E, R, I, S>(self: Sink<A, In, L, E, R>, key: Context.Key<I, S>, value: Types.NoInfer<S>): Sink<A, In, L, E, Exclude<R, I>>;
};
/**
 * @since 2.0.0
 * @category Error handling
 */
export declare const orElse: {
    /**
     * @since 2.0.0
     * @category Error handling
     */
    <E, A2, In2, L2, E2, R2>(f: (error: Types.NoInfer<E>) => Sink<A2, In2, L2, E2, R2>): <A, In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A2 | A, In & In2, L2 | L, E2 | E, R2 | R>;
    /**
     * @since 2.0.0
     * @category Error handling
     */
    <A, In, L, E, R, A2, In2, L2, E2, R2>(self: Sink<A, In, L, E, R>, f: (error: E) => Sink<A2, In2, L2, E2, R2>): Sink<A | A2, In & In2, L | L2, E | E2, R | R2>;
};
/**
 * @since 4.0.0
 * @category Error handling
 */
export declare const catchCause: {
    /**
     * @since 4.0.0
     * @category Error handling
     */
    <E, A2, E2, R2>(f: (error: Cause.Cause<Types.NoInfer<E>>) => Effect.Effect<A2, E2, R2>): <A, In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A2 | A, In, L, E, R2 | R>;
    /**
     * @since 4.0.0
     * @category Error handling
     */
    <A, In, L, E, R, A2, E2, R2>(self: Sink<A, In, L, E, R>, f: (error: Cause.Cause<E>) => Effect.Effect<A2, E2, R2>): Sink<A | A2, In, L, E2, R | R2>;
};
declare const catch_: {
    <E, A2, E2, R2>(f: (error: Types.NoInfer<E>) => Effect.Effect<A2, E2, R2>): <A, In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A2 | A, In, L, E, R2 | R>;
    <A, In, L, E, R, A2, E2, R2>(self: Sink<A, In, L, E, R>, f: (error: E) => Effect.Effect<A2, E2, R2>): Sink<A | A2, In, L, E2, R | R2>;
};
export { 
/**
 * @since 4.0.0
 * @category Error handling
 */
catch_ as catch };
/**
 * @since 4.0.0
 * @category Finalization
 */
export declare const onExit: {
    /**
     * @since 4.0.0
     * @category Finalization
     */
    <A, E, X, E2, R2>(f: (exit: Exit.Exit<A, E>) => Effect.Effect<X, E2, R2>): <In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L, E | E2, R2 | R>;
    /**
     * @since 4.0.0
     * @category Finalization
     */
    <A, In, L, E, R, X, E2, R2>(self: Sink<A, In, L, E, R>, f: (exit: Exit.Exit<A, E>) => Effect.Effect<X, E2, R2>): Sink<A, In, L, E | E2, R | R2>;
};
/**
 * @since 4.0.0
 * @category Finalization
 */
export declare const ensuring: {
    /**
     * @since 4.0.0
     * @category Finalization
     */
    <X, E2, R2>(effect: Effect.Effect<X, E2, R2>): <A, E, In, L, R>(self: Sink<A, In, L, E, R>) => Sink<A, In, L, E | E2, R2 | R>;
    /**
     * @since 4.0.0
     * @category Finalization
     */
    <A, In, L, E, R, X, E2, R2>(self: Sink<A, In, L, E, R>, effect: Effect.Effect<X, E2, R2>): Sink<A, In, L, E | E2, R | R2>;
};
//# sourceMappingURL=Sink.d.ts.map