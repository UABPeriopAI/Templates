/**
 * The `Scope` module provides functionality for managing resource lifecycles
 * and cleanup operations in a functional and composable manner.
 *
 * A `Scope` represents a context where resources can be acquired and automatically
 * cleaned up when the scope is closed. This is essential for managing resources
 * like file handles, database connections, or any other resources that need
 * proper cleanup.
 *
 * Scopes support both sequential and parallel finalization strategies:
 * - Sequential: Finalizers run one after another in reverse order of registration
 * - Parallel: Finalizers run concurrently for better performance
 *
 * @since 2.0.0
 */
import * as effect from "./internal/effect.js";
const TypeId = effect.ScopeTypeId;
const CloseableTypeId = effect.ScopeCloseableTypeId;
/**
 * The service tag for `Scope`, used for dependency injection in the Effect system.
 *
 * @example
 * ```ts
 * import { Effect, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Access the scope from the context
 *   const scope = yield* Scope.Scope
 *
 *   // Use the scope for resource management
 *   yield* Scope.addFinalizer(scope, Effect.log("Cleanup"))
 * })
 *
 * // Provide a scope to the program
 * const scoped = Effect.scoped(program)
 * ```
 *
 * @since 2.0.0
 * @category tags
 */
export const Scope = effect.scopeTag;
/**
 * Creates a new `Scope` with the specified finalizer strategy.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Create a scope with sequential cleanup
 *   const scope = yield* Scope.make("sequential")
 *
 *   // Add finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup 1"))
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup 2"))
 *
 *   // Close the scope (finalizers run in reverse order)
 *   yield* Scope.close(scope, Exit.void)
 *   // Output: "Cleanup 2", then "Cleanup 1"
 * })
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const make = effect.scopeMake;
/**
 * Creates a new `Scope` synchronously without wrapping it in an `Effect`.
 * This is useful when you need a scope immediately but should be used with caution
 * as it doesn't provide the same safety guarantees as the `Effect`-wrapped version.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * // Create a scope immediately
 * const scope = Scope.makeUnsafe("sequential")
 *
 * // Use it in an Effect program
 * const program = Effect.gen(function*() {
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
 *   yield* Scope.close(scope, Exit.void)
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeUnsafe = effect.scopeMakeUnsafe;
/**
 * Provides a `Scope` to an `Effect`, removing the `Scope` requirement from its context.
 * This allows you to run effects that require a scope by explicitly providing one.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Scope.extend`
 *
 * @example
 * ```ts
 * import { Console, Effect, Scope } from "effect"
 *
 * // An effect that requires a Scope
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.Scope
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup"))
 *   yield* Console.log("Working...")
 * })
 *
 * // Provide a scope to the program
 * const withScope = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *   yield* Scope.provide(scope)(program)
 * })
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const provide = effect.provideScope;
/**
 * Adds a finalizer to a scope that will be executed when the scope is closed.
 * Finalizers are cleanup functions that receive the exit value of the scope.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const withResource = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *
 *   // Add a finalizer for cleanup
 *   yield* Scope.addFinalizerExit(
 *     scope,
 *     (exit) =>
 *       Console.log(
 *         `Cleaning up resource. Exit: ${
 *           Exit.isSuccess(exit) ? "Success" : "Failure"
 *         }`
 *       )
 *   )
 *
 *   // Use the resource
 *   yield* Console.log("Using resource")
 *
 *   // Close the scope
 *   yield* Scope.close(scope, Exit.void)
 * })
 * ```
 *
 * @category combinators
 * @since 4.0.0
 */
export const addFinalizerExit = effect.scopeAddFinalizerExit;
/**
 * Adds a finalizer to a scope. The finalizer is a simple `Effect` that will be
 * executed when the scope is closed, regardless of whether the scope closes
 * successfully or with an error.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *
 *   // Add simple finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup task 1"))
 *   yield* Scope.addFinalizer(scope, Console.log("Cleanup task 2"))
 *   yield* Scope.addFinalizer(scope, Effect.log("Cleanup task 3"))
 *
 *   // Do some work
 *   yield* Console.log("Doing work...")
 *
 *   // Close the scope
 *   yield* Scope.close(scope, Exit.void)
 * })
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const addFinalizer = effect.scopeAddFinalizer;
/**
 * Creates a child scope from a parent scope. The child scope inherits the
 * parent's finalization strategy unless overridden.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const nestedScopes = Effect.gen(function*() {
 *   const parentScope = yield* Scope.make("sequential")
 *
 *   // Add finalizer to parent
 *   yield* Scope.addFinalizer(parentScope, Console.log("Parent cleanup"))
 *
 *   // Create child scope
 *   const childScope = yield* Scope.fork(parentScope, "parallel")
 *
 *   // Add finalizer to child
 *   yield* Scope.addFinalizer(childScope, Console.log("Child cleanup"))
 *
 *   // Close child first, then parent
 *   yield* Scope.close(childScope, Exit.void)
 *   yield* Scope.close(parentScope, Exit.void)
 * })
 * ```
 *
 * @category combinators
 * @since 4.0.0
 */
export const fork = effect.scopeFork;
/**
 * Creates a child scope from a parent scope synchronously without wrapping it in an `Effect`.
 * The child scope inherits the parent's finalization strategy unless overridden.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const parentScope = Scope.makeUnsafe("sequential")
 *   const childScope = Scope.forkUnsafe(parentScope, "parallel")
 *
 *   // Add finalizers to both scopes
 *   yield* Scope.addFinalizer(parentScope, Console.log("Parent cleanup"))
 *   yield* Scope.addFinalizer(childScope, Console.log("Child cleanup"))
 *
 *   // Close child first, then parent
 *   yield* Scope.close(childScope, Exit.void)
 *   yield* Scope.close(parentScope, Exit.void)
 * })
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export const forkUnsafe = effect.scopeForkUnsafe;
/**
 * Closes a scope, running all registered finalizers in the appropriate order.
 * The exit value is passed to each finalizer.
 *
 * @example
 * ```ts
 * import { Console, Effect, Exit, Scope } from "effect"
 *
 * const resourceManagement = Effect.gen(function*() {
 *   const scope = yield* Scope.make("sequential")
 *
 *   // Add multiple finalizers
 *   yield* Scope.addFinalizer(scope, Console.log("Close database connection"))
 *   yield* Scope.addFinalizer(scope, Console.log("Close file handle"))
 *   yield* Scope.addFinalizer(scope, Console.log("Release memory"))
 *
 *   // Do some work...
 *   yield* Console.log("Performing operations...")
 *
 *   // Close scope - finalizers run in reverse order of registration
 *   yield* Scope.close(scope, Exit.succeed("Success!"))
 *   // Output: "Release memory", "Close file handle", "Close database connection"
 * })
 * ```
 *
 * @category combinators
 * @since 4.0.0
 */
export const close = effect.scopeClose;
/**
 * @since 4.0.0
 */
export const closeUnsafe = effect.scopeCloseUnsafe;
/**
 * @category combinators
 * @since 4.0.0
 */
export const use = effect.scopeUse;
//# sourceMappingURL=Scope.js.map