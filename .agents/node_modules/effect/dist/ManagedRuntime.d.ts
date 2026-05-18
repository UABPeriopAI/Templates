/**
 * @since 2.0.0
 */
import type * as Context from "./Context.ts";
import * as Effect from "./Effect.ts";
import * as Exit from "./Exit.ts";
import * as Fiber from "./Fiber.ts";
import * as Layer from "./Layer.ts";
import * as Scope from "./Scope.ts";
declare const TypeId = "~effect/ManagedRuntime";
/**
 * Checks if the provided argument is a `ManagedRuntime`.
 *
 * @since 3.9.0
 * @category guards
 */
export declare const isManagedRuntime: (input: unknown) => input is ManagedRuntime<unknown, unknown>;
/**
 * @since 3.4.0
 */
export declare namespace ManagedRuntime {
    /**
     * @category type-level
     * @since 4.0.0
     */
    type Services<T extends ManagedRuntime<never, any>> = [T] extends [ManagedRuntime<infer R, infer _E>] ? R : never;
    /**
     * @category type-level
     * @since 3.4.0
     */
    type Error<T extends ManagedRuntime<never, any>> = [T] extends [ManagedRuntime<infer _R, infer E>] ? E : never;
}
/**
 * @since 2.0.0
 * @category models
 */
export interface ManagedRuntime<in R, out ER> {
    readonly [TypeId]: typeof TypeId;
    readonly memoMap: Layer.MemoMap;
    readonly contextEffect: Effect.Effect<Context.Context<R>, ER>;
    readonly context: () => Promise<Context.Context<R>>;
    readonly scope: Scope.Closeable;
    cachedContext: Context.Context<R> | undefined;
    /**
     * Executes the effect using the provided Scheduler or using the global
     * Scheduler if not provided
     */
    readonly runFork: <A, E>(self: Effect.Effect<A, E, R>, options?: Effect.RunOptions) => Fiber.Fiber<A, E | ER>;
    /**
     * Executes the effect synchronously returning the exit.
     *
     * This method is effectful and should only be invoked at the edges of your
     * program.
     */
    readonly runSyncExit: <A, E>(effect: Effect.Effect<A, E, R>) => Exit.Exit<A, ER | E>;
    /**
     * Executes the effect synchronously throwing in case of errors or async boundaries.
     *
     * This method is effectful and should only be invoked at the edges of your
     * program.
     */
    readonly runSync: <A, E>(effect: Effect.Effect<A, E, R>) => A;
    /**
     * Executes the effect asynchronously, eventually passing the exit value to
     * the specified callback.
     *
     * This method is effectful and should only be invoked at the edges of your
     * program.
     */
    readonly runCallback: <A, E>(effect: Effect.Effect<A, E, R>, options?: (Effect.RunOptions & {
        readonly onExit: (exit: Exit.Exit<A, E | ER>) => void;
    }) | undefined) => (interruptor?: number | undefined) => void;
    /**
     * Runs the `Effect`, returning a JavaScript `Promise` that will be resolved
     * with the value of the effect once the effect has been executed, or will be
     * rejected with the first error or exception throw by the effect.
     *
     * This method is effectful and should only be used at the edges of your
     * program.
     */
    readonly runPromise: <A, E>(effect: Effect.Effect<A, E, R>, options?: Effect.RunOptions) => Promise<A>;
    /**
     * Runs the `Effect`, returning a JavaScript `Promise` that will be resolved
     * with the `Exit` state of the effect once the effect has been executed.
     *
     * This method is effectful and should only be used at the edges of your
     * program.
     */
    readonly runPromiseExit: <A, E>(effect: Effect.Effect<A, E, R>, options?: Effect.RunOptions) => Promise<Exit.Exit<A, ER | E>>;
    /**
     * Dispose of the resources associated with the runtime.
     */
    readonly dispose: () => Promise<void>;
    /**
     * Dispose of the resources associated with the runtime.
     */
    readonly disposeEffect: Effect.Effect<void, never, never>;
}
/**
 * Convert a Layer into an ManagedRuntime, that can be used to run Effect's using
 * your services.
 *
 * @since 2.0.0
 * @category runtime class
 * @example
 * ```ts
 * import { Console, Effect, Layer, ManagedRuntime, Context } from "effect"
 *
 * class Notifications extends Context.Service<Notifications, {
 *   readonly notify: (message: string) => Effect.Effect<void>
 * }>()("Notifications") {
 *   static readonly layer = Layer.succeed(this)({
 *     notify: Effect.fn("Notifications.notify")((message) => Console.log(message))
 *   })
 * }
 *
 * async function main() {
 *   const runtime = ManagedRuntime.make(Notifications.layer)
 *   await runtime.runPromise(Effect.flatMap(
 *     Notifications.asEffect(),
 *     (_) => _.notify("Hello, world!")
 *   ))
 *   await runtime.dispose()
 * }
 *
 * main()
 * ```
 */
export declare const make: <R, ER>(layer: Layer.Layer<R, ER, never>, options?: {
    readonly memoMap?: Layer.MemoMap | undefined;
} | undefined) => ManagedRuntime<R, ER>;
export {};
//# sourceMappingURL=ManagedRuntime.d.ts.map