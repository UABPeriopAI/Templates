import * as internal from "./internal/rcRef.js";
const TypeId = "~effect/RcRef";
/**
 * Create an `RcRef` from an acquire `Effect`.
 *
 * An RcRef wraps a reference counted resource that can be acquired and released
 * multiple times.
 *
 * The resource is lazily acquired on the first call to `get` and released when
 * the last reference is released.
 *
 * @since 3.5.0
 * @category constructors
 * @example
 * ```ts
 * import { Effect, RcRef } from "effect"
 *
 * Effect.gen(function*() {
 *   const ref = yield* RcRef.make({
 *     acquire: Effect.acquireRelease(
 *       Effect.succeed("foo"),
 *       () => Effect.log("release foo")
 *     )
 *   })
 *
 *   // will only acquire the resource once, and release it
 *   // when the scope is closed
 *   yield* RcRef.get(ref).pipe(
 *     Effect.andThen(RcRef.get(ref)),
 *     Effect.scoped
 *   )
 * })
 * ```
 */
export const make = internal.make;
/**
 * Get the value from an RcRef.
 *
 * This will acquire the resource if it hasn't been acquired yet, or increment
 * the reference count if it has. The resource will be automatically released
 * when the returned scope is closed.
 *
 * @since 3.5.0
 * @category combinators
 * @example
 * ```ts
 * import { Effect, RcRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create an RcRef with a resource
 *   const ref = yield* RcRef.make({
 *     acquire: Effect.acquireRelease(
 *       Effect.succeed("shared resource"),
 *       (resource) => Effect.log(`Releasing ${resource}`)
 *     )
 *   })
 *
 *   // Get the value from the RcRef
 *   const value1 = yield* RcRef.get(ref)
 *   const value2 = yield* RcRef.get(ref)
 *
 *   // Both values are the same instance
 *   console.log(value1 === value2) // true
 *
 *   return value1
 * })
 * ```
 */
export const get = internal.get;
/**
 * @since 3.19.6
 * @category combinators
 */
export const invalidate = internal.invalidate;
//# sourceMappingURL=RcRef.js.map