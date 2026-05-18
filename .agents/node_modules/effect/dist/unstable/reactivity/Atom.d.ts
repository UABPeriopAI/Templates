/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import type { LazyArg } from "../../Function.ts";
import type * as Inspectable from "../../Inspectable.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import type { Pipeable } from "../../Pipeable.ts";
import type { ReadonlyRecord } from "../../Record.ts";
import * as Schema from "../../Schema.ts";
import * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as SubscriptionRef from "../../SubscriptionRef.ts";
import type { NoInfer } from "../../Types.ts";
import * as KeyValueStore from "../persistence/KeyValueStore.ts";
import * as AsyncResult from "./AsyncResult.ts";
import { AtomRegistry } from "./AtomRegistry.ts";
import * as Registry from "./AtomRegistry.ts";
import * as Reactivity from "./Reactivity.ts";
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = "~effect/reactivity/Atom";
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category models
 */
export interface Atom<A> extends Pipeable, Inspectable.Inspectable {
    readonly [TypeId]: TypeId;
    readonly keepAlive: boolean;
    readonly lazy: boolean;
    readonly read: (get: AtomContext) => A;
    readonly refresh?: (f: <A>(atom: Atom<A>) => void) => void;
    readonly label?: readonly [name: string, stack: string];
    readonly idleTTL?: number;
    readonly initialValueTarget?: Atom<A>;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isAtom: (u: unknown) => u is Atom<any>;
/**
 * @since 4.0.0
 */
export type Type<T extends Atom<any>> = T extends Atom<infer A> ? A : never;
/**
 * @since 4.0.0
 */
export type Success<T extends Atom<any>> = T extends Atom<AsyncResult.AsyncResult<infer A, infer _>> ? A : never;
/**
 * @since 4.0.0
 */
export type PullSuccess<T extends Atom<any>> = T extends Atom<PullResult<infer A, infer _>> ? A : never;
/**
 * @since 4.0.0
 */
export type Failure<T extends Atom<any>> = T extends Atom<AsyncResult.AsyncResult<infer _, infer E>> ? E : never;
/**
 * @since 4.0.0
 */
export type WithoutSerializable<T extends Atom<any>> = T extends Writable<infer R, infer W> ? Writable<R, W> : Atom<Type<T>>;
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const WritableTypeId: WritableTypeId;
/**
 * @since 4.0.0
 * @category type ids
 */
export type WritableTypeId = "~effect/reactivity/Atom/Writable";
/**
 * @since 4.0.0
 * @category models
 */
export interface Writable<R, W = R> extends Atom<R> {
    readonly [WritableTypeId]: WritableTypeId;
    readonly write: (ctx: WriteContext<R>, value: W) => void;
}
/**
 * @since 4.0.0
 * @category context
 */
export interface AtomContext {
    <A>(atom: Atom<A>): A;
    get<A>(this: AtomContext, atom: Atom<A>): A;
    result<A, E>(this: AtomContext, atom: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
        readonly suspendOnWaiting?: boolean | undefined;
    }): Effect.Effect<A, E>;
    resultOnce<A, E>(this: AtomContext, atom: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
        readonly suspendOnWaiting?: boolean | undefined;
    }): Effect.Effect<A, E>;
    once<A>(this: AtomContext, atom: Atom<A>): A;
    addFinalizer(this: AtomContext, f: () => void): void;
    mount<A>(this: AtomContext, atom: Atom<A>): void;
    refresh<A>(this: AtomContext, atom: Atom<A>): void;
    refreshSelf(this: AtomContext): void;
    self<A>(this: AtomContext): Option.Option<A>;
    setSelf<A>(this: AtomContext, a: A): void;
    set<R, W>(this: AtomContext, atom: Writable<R, W>, value: W): void;
    setResult<A, E, W>(this: AtomContext, atom: Writable<AsyncResult.AsyncResult<A, E>, W>, value: W): Effect.Effect<A, E>;
    some<A>(this: AtomContext, atom: Atom<Option.Option<A>>): Effect.Effect<A>;
    someOnce<A>(this: AtomContext, atom: Atom<Option.Option<A>>): Effect.Effect<A>;
    stream<A>(this: AtomContext, atom: Atom<A>, options?: {
        readonly withoutInitialValue?: boolean;
        readonly bufferSize?: number;
    }): Stream.Stream<A>;
    streamResult<A, E>(this: AtomContext, atom: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
        readonly withoutInitialValue?: boolean;
        readonly bufferSize?: number;
    }): Stream.Stream<A, E>;
    subscribe<A>(this: AtomContext, atom: Atom<A>, f: (_: A) => void, options?: {
        readonly immediate?: boolean;
    }): void;
    readonly registry: Registry.AtomRegistry;
}
/**
 * @since 4.0.0
 * @category context
 */
export interface WriteContext<A> {
    get<T>(this: WriteContext<A>, atom: Atom<T>): T;
    refreshSelf(this: WriteContext<A>): void;
    setSelf(this: WriteContext<A>, a: A): void;
    set<R, W>(this: WriteContext<A>, atom: Writable<R, W>, value: W): void;
}
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setIdleTTL: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (duration: Duration.Input): <A extends Atom<any>>(self: A) => A;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A extends Atom<any>>(self: A, duration: Duration.Input): A;
};
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isWritable: <R, W>(atom: Atom<R>) => atom is Writable<R, W>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const readable: <A>(read: (get: AtomContext) => A, refresh?: (f: <A_1>(atom: Atom<A_1>) => void) => void) => Atom<A>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const writable: <R, W>(read: (get: AtomContext) => R, write: (ctx: WriteContext<R>, value: W) => void, refresh?: (f: <A>(atom: Atom<A>) => void) => void) => Writable<R, W>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, E>(create: (get: AtomContext) => Effect.Effect<A, E, Scope.Scope | AtomRegistry>, options?: {
        readonly initialValue?: A | undefined;
        readonly uninterruptible?: boolean | undefined;
    }): Atom<AsyncResult.AsyncResult<A, E>>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, E>(effect: Effect.Effect<A, E, Scope.Scope | AtomRegistry>, options?: {
        readonly initialValue?: A;
        readonly uninterruptible?: boolean | undefined;
    }): Atom<AsyncResult.AsyncResult<A, E>>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, E>(create: (get: AtomContext) => Stream.Stream<A, E, AtomRegistry>, options?: {
        readonly initialValue?: A;
    }): Atom<AsyncResult.AsyncResult<A, E | Cause.NoSuchElementError>>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, E>(stream: Stream.Stream<A, E, AtomRegistry>, options?: {
        readonly initialValue?: A;
    }): Atom<AsyncResult.AsyncResult<A, E | Cause.NoSuchElementError>>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A>(create: (get: AtomContext) => A): Atom<A>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A>(initialValue: A): Writable<A>;
};
/**
 * @since 4.0.0
 * @category models
 */
export interface AtomRuntime<R, ER = never> extends Atom<AsyncResult.AsyncResult<Context.Context<R>, ER>> {
    readonly factory: RuntimeFactory;
    readonly layer: Atom<Layer.Layer<R, ER>>;
    readonly atom: {
        <A, E>(create: (get: AtomContext) => Effect.Effect<A, E, Scope.Scope | R | AtomRegistry | Reactivity.Reactivity>, options?: {
            readonly initialValue?: A;
            readonly uninterruptible?: boolean | undefined;
        }): Atom<AsyncResult.AsyncResult<A, E | ER>>;
        <A, E>(effect: Effect.Effect<A, E, Scope.Scope | R | AtomRegistry | Reactivity.Reactivity>, options?: {
            readonly initialValue?: A;
            readonly uninterruptible?: boolean | undefined;
        }): Atom<AsyncResult.AsyncResult<A, E | ER>>;
        <A, E>(create: (get: AtomContext) => Stream.Stream<A, E, AtomRegistry | Reactivity.Reactivity | R>, options?: {
            readonly initialValue?: A;
        }): Atom<AsyncResult.AsyncResult<A, E | ER | Cause.NoSuchElementError>>;
        <A, E>(stream: Stream.Stream<A, E, AtomRegistry | Reactivity.Reactivity | R>, options?: {
            readonly initialValue?: A;
        }): Atom<AsyncResult.AsyncResult<A, E | ER | Cause.NoSuchElementError>>;
    };
    readonly fn: {
        <Arg>(): {
            <E, A>(fn: (arg: Arg, get: FnContext) => Effect.Effect<A, E, Scope.Scope | AtomRegistry | Reactivity.Reactivity | R>, options?: {
                readonly initialValue?: A | undefined;
                readonly reactivityKeys?: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>> | undefined;
                readonly concurrent?: boolean | undefined;
            }): AtomResultFn<Arg, A, E | ER>;
            <E, A>(fn: (arg: Arg, get: FnContext) => Stream.Stream<A, E, AtomRegistry | Reactivity.Reactivity | R>, options?: {
                readonly initialValue?: A | undefined;
                readonly reactivityKeys?: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>> | undefined;
                readonly concurrent?: boolean | undefined;
            }): AtomResultFn<Arg, A, E | ER | Cause.NoSuchElementError>;
        };
        <E, A, Arg = void>(fn: (arg: Arg, get: FnContext) => Effect.Effect<A, E, Scope.Scope | AtomRegistry | Reactivity.Reactivity | R>, options?: {
            readonly initialValue?: A | undefined;
            readonly reactivityKeys?: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>> | undefined;
            readonly concurrent?: boolean | undefined;
        }): AtomResultFn<Arg, A, E | ER>;
        <E, A, Arg = void>(fn: (arg: Arg, get: FnContext) => Stream.Stream<A, E, AtomRegistry | Reactivity.Reactivity | R>, options?: {
            readonly initialValue?: A | undefined;
            readonly reactivityKeys?: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>> | undefined;
            readonly concurrent?: boolean | undefined;
        }): AtomResultFn<Arg, A, E | ER | Cause.NoSuchElementError>;
    };
    readonly pull: <A, E>(create: ((get: AtomContext) => Stream.Stream<A, E, R | AtomRegistry | Reactivity.Reactivity>) | Stream.Stream<A, E, R | AtomRegistry | Reactivity.Reactivity>, options?: {
        readonly disableAccumulation?: boolean;
        readonly initialValue?: ReadonlyArray<A>;
    }) => Writable<PullResult<A, E | ER>, void>;
    readonly subscriptionRef: <A, E>(create: Effect.Effect<SubscriptionRef.SubscriptionRef<A>, E, Scope.Scope | R | AtomRegistry | Reactivity.Reactivity> | ((get: AtomContext) => Effect.Effect<SubscriptionRef.SubscriptionRef<A>, E, Scope.Scope | R | AtomRegistry | Reactivity.Reactivity>)) => Writable<AsyncResult.AsyncResult<A, E>, A>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface RuntimeFactory {
    <R, E>(create: Layer.Layer<R, E, AtomRegistry | Reactivity.Reactivity> | ((get: AtomContext) => Layer.Layer<R, E, AtomRegistry | Reactivity.Reactivity>)): AtomRuntime<R, E>;
    readonly memoMap: Layer.MemoMap;
    readonly addGlobalLayer: <A, E>(layer: Layer.Layer<A, E, AtomRegistry | Reactivity.Reactivity>) => void;
    /**
     * Uses the `Reactivity` service from the runtime to refresh the atom whenever
     * the keys change.
     */
    readonly withReactivity: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => <A extends Atom<any>>(atom: A) => A;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const context: (options: {
    readonly memoMap: Layer.MemoMap;
}) => RuntimeFactory;
/**
 * @since 4.0.0
 * @category context
 */
export declare const defaultMemoMap: Layer.MemoMap;
/**
 * @since 4.0.0
 * @category context
 */
export declare const runtime: RuntimeFactory;
/**
 * An alias to `Rx.runtime.withReactivity`, for refreshing an atom whenever the
 * keys change in the `Reactivity` service.
 *
 * @since 4.0.0
 * @category Reactivity
 */
export declare const withReactivity: (keys: ReadonlyArray<unknown> | ReadonlyRecord<string, ReadonlyArray<unknown>>) => <A extends Atom<any>>(atom: A) => A;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const subscriptionRef: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A>(ref: SubscriptionRef.SubscriptionRef<A> | ((get: AtomContext) => SubscriptionRef.SubscriptionRef<A>)): Writable<A>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, E>(effect: Effect.Effect<SubscriptionRef.SubscriptionRef<A>, E, Scope.Scope | AtomRegistry> | ((get: AtomContext) => Effect.Effect<SubscriptionRef.SubscriptionRef<A>, E, Scope.Scope | AtomRegistry>)): Writable<AsyncResult.AsyncResult<A, E>, A>;
};
/**
 * @since 4.0.0
 * @category models
 */
export interface FnContext {
    <A>(atom: Atom<A>): A;
    result<A, E>(this: FnContext, atom: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
        readonly suspendOnWaiting?: boolean | undefined;
    }): Effect.Effect<A, E>;
    addFinalizer(this: FnContext, f: () => void): void;
    mount<A>(this: FnContext, atom: Atom<A>): void;
    refresh<A>(this: FnContext, atom: Atom<A>): void;
    self<A>(this: FnContext): Option.Option<A>;
    setSelf<A>(this: FnContext, a: A): void;
    set<R, W>(this: FnContext, atom: Writable<R, W>, value: W): void;
    setResult<A, E, W>(this: FnContext, atom: Writable<AsyncResult.AsyncResult<A, E>, W>, value: W): Effect.Effect<A, E>;
    some<A>(this: FnContext, atom: Atom<Option.Option<A>>): Effect.Effect<A>;
    stream<A>(this: FnContext, atom: Atom<A>, options?: {
        readonly withoutInitialValue?: boolean;
        readonly bufferSize?: number;
    }): Stream.Stream<A>;
    streamResult<A, E>(this: FnContext, atom: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
        readonly withoutInitialValue?: boolean;
        readonly bufferSize?: number;
    }): Stream.Stream<A, E>;
    subscribe<A>(this: FnContext, atom: Atom<A>, f: (_: A) => void, options?: {
        readonly immediate?: boolean;
    }): void;
    readonly registry: Registry.AtomRegistry;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fnSync: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <Arg>(): {
        /**
         * @since 4.0.0
         * @category constructors
         */
        <A>(f: (arg: Arg, get: FnContext) => A): Writable<Option.Option<A>, Arg>;
        /**
         * @since 4.0.0
         * @category constructors
         */
        <A>(f: (arg: Arg, get: FnContext) => A, options: {
            readonly initialValue: A;
        }): Writable<A, Arg>;
    };
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, Arg = void>(f: (arg: Arg, get: FnContext) => A): Writable<Option.Option<A>, Arg>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <A, Arg = void>(f: (arg: Arg, get: FnContext) => A, options: {
        readonly initialValue: A;
    }): Writable<A, Arg>;
};
/**
 * @since 4.0.0
 * @category models
 */
export interface AtomResultFn<Arg, A, E = never> extends Writable<AsyncResult.AsyncResult<A, E>, Arg | Reset | Interrupt> {
}
/**
 * @since 4.0.0
 * @category symbols
 */
export declare const Reset: unique symbol;
/**
 * @since 4.0.0
 * @category symbols
 */
export type Reset = typeof Reset;
/**
 * @since 4.0.0
 * @category symbols
 */
export declare const Interrupt: unique symbol;
/**
 * @since 4.0.0
 * @category symbols
 */
export type Interrupt = typeof Interrupt;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fn: {
    /**
     * @since 4.0.0
     * @category constructors
     */
    <Arg>(): <E, A>(fn: (arg: Arg, get: FnContext) => Effect.Effect<A, E, Scope.Scope | AtomRegistry>, options?: {
        readonly initialValue?: A | undefined;
        readonly concurrent?: boolean | undefined;
    }) => AtomResultFn<Arg, A, E>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <E, A, Arg = void>(fn: (arg: Arg, get: FnContext) => Effect.Effect<A, E, Scope.Scope | AtomRegistry>, options?: {
        readonly initialValue?: A | undefined;
        readonly concurrent?: boolean | undefined;
    }): AtomResultFn<Arg, A, E>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <Arg>(): <E, A>(fn: (arg: Arg, get: FnContext) => Stream.Stream<A, E, AtomRegistry>, options?: {
        readonly initialValue?: A | undefined;
        readonly concurrent?: boolean | undefined;
    }) => AtomResultFn<Arg, A, E | Cause.NoSuchElementError>;
    /**
     * @since 4.0.0
     * @category constructors
     */
    <E, A, Arg = void>(fn: (arg: Arg, get: FnContext) => Stream.Stream<A, E, AtomRegistry>, options?: {
        readonly initialValue?: A | undefined;
        readonly concurrent?: boolean | undefined;
    }): AtomResultFn<Arg, A, E | Cause.NoSuchElementError>;
};
/**
 * @since 4.0.0
 * @category models
 */
export type PullResult<A, E = never> = AsyncResult.AsyncResult<{
    readonly done: boolean;
    readonly items: Arr.NonEmptyArray<A>;
}, E | Cause.NoSuchElementError>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const pull: <A, E>(create: ((get: AtomContext) => Stream.Stream<A, E, AtomRegistry>) | Stream.Stream<A, E, AtomRegistry>, options?: {
    readonly disableAccumulation?: boolean | undefined;
}) => Writable<PullResult<A, E>, void>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const family: <Arg, T extends object>(f: (arg: Arg) => T) => (arg: Arg) => T;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const withFallback: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <E2, A2>(fallback: Atom<AsyncResult.AsyncResult<A2, E2>>): <R extends Atom<AsyncResult.AsyncResult<any, any>>>(self: R) => [R] extends [Writable<infer _, infer RW>] ? Writable<AsyncResult.AsyncResult<AsyncResult.AsyncResult.Success<Type<R>> | A2, AsyncResult.AsyncResult.Failure<Type<R>> | E2>, RW> : Atom<AsyncResult.AsyncResult<AsyncResult.AsyncResult.Success<Type<R>> | A2, AsyncResult.AsyncResult.Failure<Type<R>> | E2>>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<AsyncResult.AsyncResult<any, any>>, A2, E2>(self: R, fallback: Atom<AsyncResult.AsyncResult<A2, E2>>): [R] extends [Writable<infer _, infer RW>] ? Writable<AsyncResult.AsyncResult<AsyncResult.AsyncResult.Success<Type<R>> | A2, AsyncResult.AsyncResult.Failure<Type<R>> | E2>, RW> : Atom<AsyncResult.AsyncResult<AsyncResult.AsyncResult.Success<Type<R>> | A2, AsyncResult.AsyncResult.Failure<Type<R>> | E2>>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const keepAlive: <A extends Atom<any>>(self: A) => A;
/**
 * Reverts the `keepAlive` behavior of a reactive value, allowing it to be
 * disposed of when not in use.
 *
 * Note that Atom's have this behavior by default.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const autoDispose: <A extends Atom<any>>(self: A) => A;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setLazy: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (lazy: boolean): <A extends Atom<any>>(self: A) => A;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A extends Atom<any>>(self: A, lazy: boolean): A;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const withLabel: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (name: string): <A extends Atom<any>>(self: A) => A;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A extends Atom<any>>(self: A, name: string): A;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const initialValue: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A>(initialValue: A): (self: Atom<A>) => readonly [Atom<A>, A];
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A>(self: Atom<A>, initialValue: A): readonly [Atom<A>, A];
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const transform: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, B>(f: (get: AtomContext, atom: R) => B, options?: {
        readonly initialValueTarget?: Atom<B> | undefined;
    }): (self: R) => [R] extends [Writable<infer _, infer RW>] ? Writable<B, RW> : Atom<B>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, B>(self: R, f: (get: AtomContext, atom: R) => B, options?: {
        readonly initialValueTarget?: Atom<B> | undefined;
    }): [R] extends [Writable<infer _, infer RW>] ? Writable<B, RW> : Atom<B>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const map: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, B>(f: (_: Type<R>) => B): (self: R) => [R] extends [Writable<infer _, infer RW>] ? Writable<B, RW> : Atom<B>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, B>(self: R, f: (_: Type<R>) => B): [R] extends [Writable<infer _, infer RW>] ? Writable<B, RW> : Atom<B>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const mapResult: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<AsyncResult.AsyncResult<any, any>>, B>(f: (_: AsyncResult.AsyncResult.Success<Type<R>>) => B): (self: R) => [R] extends [Writable<infer _, infer RW>] ? Writable<AsyncResult.AsyncResult<B, AsyncResult.AsyncResult.Failure<Type<R>>>, RW> : Atom<AsyncResult.AsyncResult<B, AsyncResult.AsyncResult.Failure<Type<R>>>>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<AsyncResult.AsyncResult<any, any>>, B>(self: R, f: (_: AsyncResult.AsyncResult.Success<Type<R>>) => B): [R] extends [Writable<infer _, infer RW>] ? Writable<AsyncResult.AsyncResult<B, AsyncResult.AsyncResult.Failure<Type<R>>>, RW> : Atom<AsyncResult.AsyncResult<B, AsyncResult.AsyncResult.Failure<Type<R>>>>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const debounce: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (duration: Duration.Input): <A extends Atom<any>>(self: A) => WithoutSerializable<A>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <A extends Atom<any>>(self: A, duration: Duration.Input): WithoutSerializable<A>;
};
/**
 * Ensures that the value of the atom is refreshed at most once per specified
 * duration.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withRefresh: {
    /**
     * Ensures that the value of the atom is refreshed at most once per specified
     * duration.
     *
     * @since 4.0.0
     * @category combinators
     */
    (duration: Duration.Input): <A extends Atom<any>>(self: A) => WithoutSerializable<A>;
    /**
     * Ensures that the value of the atom is refreshed at most once per specified
     * duration.
     *
     * @since 4.0.0
     * @category combinators
     */
    <A extends Atom<any>>(self: A, duration: Duration.Input): WithoutSerializable<A>;
};
/**
 * Adds stale-while-revalidate refresh behavior to an async result atom.
 *
 * Automatic revalidation during reads is skipped while the current value is
 * fresh within `staleTime`. Manual `refresh` calls remain forceful and always
 * forward to the wrapped atom.
 *
 * Use `revalidateOnMount` to control whether stale data should trigger a
 * background refresh on first mount. Use `revalidateOnFocus` to control
 * focus behavior. `true` respects `staleTime` and `"always"` forces refetch.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const swr: {
    /**
     * Adds stale-while-revalidate refresh behavior to an async result atom.
     *
     * Automatic revalidation during reads is skipped while the current value is
     * fresh within `staleTime`. Manual `refresh` calls remain forceful and always
     * forward to the wrapped atom.
     *
     * Use `revalidateOnMount` to control whether stale data should trigger a
     * background refresh on first mount. Use `revalidateOnFocus` to control
     * focus behavior. `true` respects `staleTime` and `"always"` forces refetch.
     *
     * @since 4.0.0
     * @category combinators
     */
    (options: {
        readonly staleTime: Duration.Input;
        readonly revalidateOnMount?: boolean | undefined;
        readonly revalidateOnFocus?: boolean | "always" | undefined;
        readonly focusSignal?: Atom<any> | undefined;
    }): <R extends Atom<AsyncResult.AsyncResult<any, any>>>(self: R) => WithoutSerializable<R>;
    /**
     * Adds stale-while-revalidate refresh behavior to an async result atom.
     *
     * Automatic revalidation during reads is skipped while the current value is
     * fresh within `staleTime`. Manual `refresh` calls remain forceful and always
     * forward to the wrapped atom.
     *
     * Use `revalidateOnMount` to control whether stale data should trigger a
     * background refresh on first mount. Use `revalidateOnFocus` to control
     * focus behavior. `true` respects `staleTime` and `"always"` forces refetch.
     *
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<AsyncResult.AsyncResult<any, any>>>(self: R, options: {
        readonly staleTime: Duration.Input;
        readonly revalidateOnMount?: boolean | undefined;
        readonly revalidateOnFocus?: boolean | "always" | undefined;
        readonly focusSignal?: Atom<any> | undefined;
    }): WithoutSerializable<R>;
};
/**
 * @since 4.0.0
 * @category Optimistic
 */
export declare const optimistic: <A>(self: Atom<A>) => Writable<A, Atom<AsyncResult.AsyncResult<A, unknown>>>;
/**
 * @since 4.0.0
 * @category Optimistic
 */
export declare const optimisticFn: {
    /**
     * @since 4.0.0
     * @category Optimistic
     */
    <A, W, XA, XE, OW = void>(options: {
        readonly reducer: (current: NoInfer<A>, update: OW) => NoInfer<W>;
        readonly fn: AtomResultFn<OW, XA, XE> | ((set: (result: NoInfer<W>) => void) => AtomResultFn<OW, XA, XE>);
    }): (self: Writable<A, Atom<AsyncResult.AsyncResult<W, unknown>>>) => AtomResultFn<OW, XA, XE>;
    /**
     * @since 4.0.0
     * @category Optimistic
     */
    <A, W, XA, XE, OW = void>(self: Writable<A, Atom<AsyncResult.AsyncResult<W, unknown>>>, options: {
        readonly reducer: (current: NoInfer<A>, update: OW) => NoInfer<W>;
        readonly fn: AtomResultFn<OW, XA, XE> | ((set: (result: NoInfer<W>) => void) => AtomResultFn<OW, XA, XE>);
    }): AtomResultFn<OW, XA, XE>;
};
/**
 * @since 4.0.0
 * @category batching
 */
export declare const batch: (f: () => void) => void;
/**
 * @since 4.0.0
 * @category Focus
 */
export declare const windowFocusSignal: Atom<number>;
/**
 * @since 4.0.0
 * @category Focus
 */
export declare const makeRefreshOnSignal: <_>(signal: Atom<_>) => <A extends Atom<any>>(self: A) => WithoutSerializable<A>;
/**
 * @since 4.0.0
 * @category Focus
 */
export declare const refreshOnWindowFocus: <A extends Atom<any>>(self: A) => WithoutSerializable<A>;
/**
 * @since 4.0.0
 * @category KeyValueStore
 */
export declare const kvs: <S extends Schema.Codec<any, any>, const Mode extends "sync" | "async" = never>(options: {
    readonly runtime: AtomRuntime<KeyValueStore.KeyValueStore, any>;
    readonly key: string;
    readonly schema: S;
    readonly defaultValue: LazyArg<S["Type"]>;
    readonly mode?: Mode | undefined;
}) => Writable<"async" extends Mode ? AsyncResult.AsyncResult<S["Type"]> : S["Type"], S["Type"]>;
/**
 * Create an Atom that reads and writes a URL search parameter.
 *
 * Note: If you pass a schema, it has to be synchronous and have no context.
 *
 * @since 4.0.0
 * @category URL search params
 */
export declare const searchParam: <S extends Schema.Codec<any, string> = never>(name: string, options?: {
    readonly schema?: S | undefined;
}) => Writable<[S] extends [never] ? string : Option.Option<S["Type"]>>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toStream: <A>(self: Atom<A>) => Stream.Stream<A, never, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toStreamResult: <A, E>(self: Atom<AsyncResult.AsyncResult<A, E>>) => Stream.Stream<A, E, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const get: <A>(self: Atom<A>) => Effect.Effect<A, never, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const modify: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <R, W, A>(f: (_: R) => [returnValue: A, nextValue: W]): (self: Writable<R, W>) => Effect.Effect<A, never, AtomRegistry>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <R, W, A>(self: Writable<R, W>, f: (_: R) => [returnValue: A, nextValue: W]): Effect.Effect<A, never, AtomRegistry>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const set: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <W>(value: W): <R>(self: Writable<R, W>) => Effect.Effect<void, never, AtomRegistry>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <R, W>(self: Writable<R, W>, value: W): Effect.Effect<void, never, AtomRegistry>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const update: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <R, W>(f: (_: R) => W): (self: Writable<R, W>) => Effect.Effect<void, never, AtomRegistry>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <R, W>(self: Writable<R, W>, f: (_: R) => W): Effect.Effect<void, never, AtomRegistry>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const getResult: <A, E>(self: Atom<AsyncResult.AsyncResult<A, E>>, options?: {
    readonly suspendOnWaiting?: boolean | undefined;
}) => Effect.Effect<A, E, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const refresh: <A>(self: Atom<A>) => Effect.Effect<void, never, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const mount: <A>(self: Atom<A>) => Effect.Effect<void, never, AtomRegistry | Scope.Scope>;
/**
 * @since 4.0.0
 * @category Serializable
 */
export declare const SerializableTypeId: SerializableTypeId;
/**
 * @since 4.0.0
 * @category Serializable
 */
export type SerializableTypeId = "~effect-atom/atom/Atom/Serializable";
/**
 * @since 4.0.0
 * @category Serializable
 */
export interface Serializable<S extends Schema.Top> {
    readonly [SerializableTypeId]: {
        readonly key: string;
        readonly encode: (value: S["Type"]) => S["Encoded"];
        readonly decode: (value: S["Encoded"]) => S["Type"];
    };
}
/**
 * @since 4.0.0
 * @category Serializable
 */
export declare const isSerializable: (self: Atom<any>) => self is Atom<any> & Serializable<any>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const serializable: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, S extends Schema.Codec<Type<R>, any>>(options: {
        readonly key: string;
        readonly schema: S;
    }): (self: R) => R & Serializable<S>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R extends Atom<any>, S extends Schema.Codec<Type<R>, any>>(self: R, options: {
        readonly key: string;
        readonly schema: S;
    }): R & Serializable<S>;
};
/**
 * @since 4.0.0
 * @category ServerValue
 */
export declare const ServerValueTypeId: "~effect-atom/atom/Atom/ServerValue";
/**
 * Overrides the value of an Atom when read on the server.
 *
 * @since 4.0.0
 * @category ServerValue
 */
export declare const withServerValue: {
    /**
     * Overrides the value of an Atom when read on the server.
     *
     * @since 4.0.0
     * @category ServerValue
     */
    <A extends Atom<any>>(read: (get: <A>(atom: Atom<A>) => A) => Type<A>): (self: A) => A;
    /**
     * Overrides the value of an Atom when read on the server.
     *
     * @since 4.0.0
     * @category ServerValue
     */
    <A extends Atom<any>>(self: A, read: (get: <A>(atom: Atom<A>) => A) => Type<A>): A;
};
/**
 * Sets the Atom's server value to `Result.initial(true)`.
 *
 * @since 4.0.0
 * @category ServerValue
 */
export declare const withServerValueInitial: <A extends Atom<AsyncResult.AsyncResult<any, any>>>(self: A) => A;
/**
 * @since 4.0.0
 * @category ServerValue
 */
export declare const getServerValue: {
    /**
     * @since 4.0.0
     * @category ServerValue
     */
    (registry: Registry.AtomRegistry): <A>(self: Atom<A>) => A;
    /**
     * @since 4.0.0
     * @category ServerValue
     */
    <A>(self: Atom<A>, registry: Registry.AtomRegistry): A;
};
//# sourceMappingURL=Atom.d.ts.map