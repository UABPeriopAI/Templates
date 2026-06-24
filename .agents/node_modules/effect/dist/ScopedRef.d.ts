/**
 * @since 2.0.0
 */
import * as Effect from "./Effect.ts";
import { type LazyArg } from "./Function.ts";
import type { Pipeable } from "./Pipeable.ts";
import * as Scope from "./Scope.ts";
import * as Synchronized from "./SynchronizedRef.ts";
declare const TypeId = "~effect/ScopedRef";
/**
 * A `ScopedRef` is a reference whose value is associated with resources,
 * which must be released properly. You can both get the current value of any
 * `ScopedRef`, as well as set it to a new value (which may require new
 * resources). The reference itself takes care of properly releasing resources
 * for the old value whenever a new value is obtained.
 *
 * @since 2.0.0
 * @category models
 */
export interface ScopedRef<in out A> extends Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly backing: Synchronized.SynchronizedRef<readonly [Scope.Closeable, A]>;
}
/**
 * Creates a new `ScopedRef` from an effect that resourcefully produces a
 * value.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromAcquire: <A, E, R>(acquire: Effect.Effect<A, E, R>) => Effect.Effect<ScopedRef<A>, E, Scope.Scope | R>;
/**
 * Retrieves the current value of the scoped reference.
 *
 * @since 4.0.0
 * @category getters
 */
export declare const getUnsafe: <A>(self: ScopedRef<A>) => A;
/**
 * Retrieves the current value of the scoped reference.
 *
 * @since 2.0.0
 * @category getters
 */
export declare const get: <A>(self: ScopedRef<A>) => Effect.Effect<A>;
/**
 * Creates a new `ScopedRef` from the specified value. This method should
 * not be used for values whose creation require the acquisition of resources.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A>(evaluate: LazyArg<A>) => Effect.Effect<ScopedRef<A>, never, Scope.Scope>;
/**
 * Sets the value of this reference to the specified resourcefully-created
 * value. Any resources associated with the old value will be released.
 *
 * This method will not return until either the reference is successfully
 * changed to the new value, with old resources released, or until the attempt
 * to acquire a new value fails.
 *
 * @since 2.0.0
 * @category getters
 */
export declare const set: {
    /**
     * Sets the value of this reference to the specified resourcefully-created
     * value. Any resources associated with the old value will be released.
     *
     * This method will not return until either the reference is successfully
     * changed to the new value, with old resources released, or until the attempt
     * to acquire a new value fails.
     *
     * @since 2.0.0
     * @category getters
     */
    <A, R, E>(acquire: Effect.Effect<A, E, R>): (self: ScopedRef<A>) => Effect.Effect<void, E, Exclude<R, Scope.Scope>>;
    /**
     * Sets the value of this reference to the specified resourcefully-created
     * value. Any resources associated with the old value will be released.
     *
     * This method will not return until either the reference is successfully
     * changed to the new value, with old resources released, or until the attempt
     * to acquire a new value fails.
     *
     * @since 2.0.0
     * @category getters
     */
    <A, R, E>(self: ScopedRef<A>, acquire: Effect.Effect<A, E, R>): Effect.Effect<void, E, Exclude<R, Scope.Scope>>;
};
export {};
//# sourceMappingURL=ScopedRef.d.ts.map