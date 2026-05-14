import * as Effect from "./Effect.ts";
import * as Exit from "./Exit.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Schedule from "./Schedule.ts";
import type * as Scope from "./Scope.ts";
import * as ScopedRef from "./ScopedRef.ts";
declare const TypeId: "~effect/Resource";
/**
 * A `Resource` is a value loaded into memory that can be refreshed manually or
 * automatically according to a schedule.
 *
 * @since 2.0.0
 * @category models
 */
export interface Resource<in out A, in out E = never> extends Pipeable {
    readonly [TypeId]: typeof TypeId;
    readonly scopedRef: ScopedRef.ScopedRef<Exit.Exit<A, E>>;
    readonly acquire: Effect.Effect<A, E>;
}
/**
 * @since 2.0.0
 * @category guards
 */
export declare const isResource: (u: unknown) => u is Resource<unknown, unknown>;
/**
 * Creates a `Resource` that must be refreshed manually.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const manual: <A, E, R>(acquire: Effect.Effect<A, E, R>) => Effect.Effect<Resource<A, E>, never, Scope.Scope | R>;
/**
 * Creates a `Resource` that refreshes automatically according to the supplied
 * schedule.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const auto: <A, E, R, Out, E2, R2>(acquire: Effect.Effect<A, E, R>, policy: Schedule.Schedule<Out, unknown, E2, R2>) => Effect.Effect<Resource<A, E>, never, R | R2 | Scope.Scope>;
/**
 * Retrieves the current value stored in this resource.
 *
 * @since 2.0.0
 * @category getters
 */
export declare const get: <A, E>(self: Resource<A, E>) => Effect.Effect<A, E>;
/**
 * Refreshes this resource.
 *
 * @since 2.0.0
 * @category utils
 */
export declare const refresh: <A, E>(self: Resource<A, E>) => Effect.Effect<void, E>;
export {};
//# sourceMappingURL=Resource.d.ts.map