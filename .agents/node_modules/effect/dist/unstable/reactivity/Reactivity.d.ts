/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Queue from "../../Queue.ts";
import type { ReadonlyRecord } from "../../Record.ts";
import * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
declare const Reactivity_base: Context.ServiceClass<Reactivity, "effect/reactivity/Reactivity", {
    readonly invalidateUnsafe: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => void;
    readonly registerUnsafe: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, handler: () => void) => () => void;
    readonly invalidate: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => Effect.Effect<void>;
    readonly mutation: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    readonly query: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Effect.Effect<Queue.Dequeue<A, E>, never, R | Scope.Scope>;
    readonly stream: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Stream.Stream<A, E, Exclude<R, Scope.Scope>>;
    readonly withBatch: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class Reactivity extends Reactivity_base {
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: Effect.Effect<{
    readonly invalidateUnsafe: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => void;
    readonly registerUnsafe: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, handler: () => void) => () => void;
    readonly invalidate: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => Effect.Effect<void>;
    readonly mutation: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    readonly query: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Effect.Effect<Queue.Dequeue<A, E>, never, R | Scope.Scope>;
    readonly stream: <A, E, R>(keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>, effect: Effect.Effect<A, E, R>) => Stream.Stream<A, E, Exclude<R, Scope.Scope>>;
    readonly withBatch: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}, never, never>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const mutation: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R | Reactivity>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>, keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): Effect.Effect<A, E, R | Reactivity>;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const query: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Queue.Dequeue<A, E>, never, R | Scope.Scope | Reactivity>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>, keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): Effect.Effect<Queue.Dequeue<A, E>, never, R | Scope.Scope | Reactivity>;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const stream: {
    /**
     * @since 4.0.0
     * @category accessors
     */
    (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Stream.Stream<A, E, Exclude<R, Scope.Scope> | Reactivity>;
    /**
     * @since 4.0.0
     * @category accessors
     */
    <A, E, R>(effect: Effect.Effect<A, E, R>, keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>): Stream.Stream<A, E, Exclude<R, Scope.Scope> | Reactivity>;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const invalidate: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => Effect.Effect<void, never, Reactivity>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<Reactivity>;
export {};
//# sourceMappingURL=Reactivity.d.ts.map