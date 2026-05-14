/**
 * @since 2.0.0
 */
import * as Effect from "./Effect.ts";
import * as Option from "./Option.ts";
import * as Ref from "./Ref.ts";
import * as Semaphore from "./Semaphore.ts";
declare const TypeId = "~effect/SynchronizedRef";
/**
 * @since 2.0.0
 * @category models
 */
export interface SynchronizedRef<in out A> extends Ref.Ref<A> {
    readonly [TypeId]: typeof TypeId;
    readonly backing: Ref.Ref<A>;
    readonly semaphore: Semaphore.Semaphore;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeUnsafe: <A>(value: A) => SynchronizedRef<A>;
/**
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A>(value: A) => Effect.Effect<SynchronizedRef<A>>;
/**
 * @since 2.0.0
 * @category getters
 */
export declare const getUnsafe: <A>(self: SynchronizedRef<A>) => A;
/**
 * @since 2.0.0
 * @category getters
 */
export declare const get: <A>(self: SynchronizedRef<A>) => Effect.Effect<A>;
/**
 * @since 2.0.0
 * @category utils
 */
export declare const getAndSet: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(value: A): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, value: A): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const getAndUpdate: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(f: (a: A) => A): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, f: (a: A) => A): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const getAndUpdateEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(f: (a: A) => Effect.Effect<A, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<A, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, f: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const getAndUpdateSome: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(pf: (a: A) => Option.Option<A>): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, pf: (a: A) => Option.Option<A>): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const getAndUpdateSomeEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<A, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<A, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const modify: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B>(f: (a: A) => readonly [B, A]): (self: SynchronizedRef<A>) => Effect.Effect<B>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B>(self: SynchronizedRef<A>, f: (a: A) => readonly [B, A]): Effect.Effect<B>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const modifyEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B, E, R>(f: (a: A) => Effect.Effect<readonly [B, A], E, R>): (self: SynchronizedRef<A>) => Effect.Effect<B, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B, E, R>(self: SynchronizedRef<A>, f: (a: A) => Effect.Effect<readonly [B, A], E, R>): Effect.Effect<B, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const modifySome: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <B, A>(pf: (a: A) => readonly [B, Option.Option<A>]): (self: SynchronizedRef<A>) => Effect.Effect<B>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B>(self: SynchronizedRef<A>, pf: (a: A) => readonly [B, Option.Option<A>]): Effect.Effect<B>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const modifySomeEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B, R, E>(fallback: B, pf: (a: A) => Effect.Effect<readonly [B, Option.Option<A>], E, R>): (self: SynchronizedRef<A>) => Effect.Effect<B, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, B, R, E>(self: SynchronizedRef<A>, pf: (a: A) => Effect.Effect<readonly [B, Option.Option<A>], E, R>): Effect.Effect<B, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const set: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(value: A): (self: SynchronizedRef<A>) => Effect.Effect<void>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, value: A): Effect.Effect<void>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const setAndGet: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(value: A): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, value: A): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const update: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(f: (a: A) => A): (self: SynchronizedRef<A>) => Effect.Effect<void>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, f: (a: A) => A): Effect.Effect<void>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(f: (a: A) => Effect.Effect<A, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<void, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, f: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<void, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateAndGet: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(f: (a: A) => A): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, f: (a: A) => A): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateAndGetEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(f: (a: A) => Effect.Effect<A, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<A, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, f: (a: A) => Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateSome: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(f: (a: A) => Option.Option<A>): (self: SynchronizedRef<A>) => Effect.Effect<void>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, f: (a: A) => Option.Option<A>): Effect.Effect<void>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateSomeEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<void, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<void, E, R>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateSomeAndGet: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(pf: (a: A) => Option.Option<A>): (self: SynchronizedRef<A>) => Effect.Effect<A>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A>(self: SynchronizedRef<A>, pf: (a: A) => Option.Option<A>): Effect.Effect<A>;
};
/**
 * @since 2.0.0
 * @category utils
 */
export declare const updateSomeAndGetEffect: {
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): (self: SynchronizedRef<A>) => Effect.Effect<A, E, R>;
    /**
     * @since 2.0.0
     * @category utils
     */
    <A, R, E>(self: SynchronizedRef<A>, pf: (a: A) => Effect.Effect<Option.Option<A>, E, R>): Effect.Effect<A, E, R>;
};
export {};
//# sourceMappingURL=SynchronizedRef.d.ts.map