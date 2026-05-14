import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import * as Fiber from "./Fiber.js";
import * as Layer from "./Layer.js";
import { hasProperty } from "./Predicate.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/ManagedRuntime";
/**
 * Checks if the provided argument is a `ManagedRuntime`.
 *
 * @since 3.9.0
 * @category guards
 */
export const isManagedRuntime = input => hasProperty(input, TypeId);
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
export const make = (layer, options) => {
  const memoMap = options?.memoMap ?? Layer.makeMemoMapUnsafe();
  const scope = Scope.makeUnsafe("parallel");
  const layerScope = Scope.forkUnsafe(scope, "sequential");
  const defaultRunOptions = {
    onFiberStart: Fiber.runIn(scope)
  };
  const mergeRunOptions = options => options ? {
    ...options,
    onFiberStart: options.onFiberStart ? fiber => {
      defaultRunOptions.onFiberStart(fiber);
      options.onFiberStart(fiber);
    } : defaultRunOptions.onFiberStart
  } : defaultRunOptions;
  let buildFiber;
  const contextEffect = Effect.withFiber(fiber => {
    if (!buildFiber) {
      buildFiber = Effect.runFork(Effect.tap(Layer.buildWithMemoMap(layer, memoMap, layerScope), context => Effect.sync(() => {
        self.cachedContext = context;
      })), {
        ...defaultRunOptions,
        scheduler: fiber.currentScheduler
      });
    }
    return Effect.flatten(Fiber.await(buildFiber));
  });
  const self = {
    [TypeId]: TypeId,
    memoMap,
    scope,
    contextEffect: contextEffect,
    cachedContext: undefined,
    context() {
      return self.cachedContext === undefined ? Effect.runPromise(self.contextEffect) : Promise.resolve(self.cachedContext);
    },
    dispose() {
      return Effect.runPromise(self.disposeEffect);
    },
    disposeEffect: Effect.suspend(() => {
      ;
      self.contextEffect = Effect.die("ManagedRuntime disposed");
      self.cachedContext = undefined;
      return Scope.close(self.scope, Exit.void);
    }),
    runFork(effect, options) {
      return self.cachedContext === undefined ? Effect.runFork(provide(self, effect), mergeRunOptions(options)) : Effect.runForkWith(self.cachedContext)(effect, mergeRunOptions(options));
    },
    runCallback(effect, options) {
      return self.cachedContext === undefined ? Effect.runCallback(provide(self, effect), mergeRunOptions(options)) : Effect.runCallbackWith(self.cachedContext)(effect, mergeRunOptions(options));
    },
    runSyncExit(effect) {
      return self.cachedContext === undefined ? Effect.runSyncExit(provide(self, effect)) : Effect.runSyncExitWith(self.cachedContext)(effect);
    },
    runSync(effect) {
      return self.cachedContext === undefined ? Effect.runSync(provide(self, effect)) : Effect.runSyncWith(self.cachedContext)(effect);
    },
    runPromiseExit(effect, options) {
      return self.cachedContext === undefined ? Effect.runPromiseExit(provide(self, effect), mergeRunOptions(options)) : Effect.runPromiseExitWith(self.cachedContext)(effect, mergeRunOptions(options));
    },
    runPromise(effect, options) {
      return self.cachedContext === undefined ? Effect.runPromise(provide(self, effect), mergeRunOptions(options)) : Effect.runPromiseWith(self.cachedContext)(effect, mergeRunOptions(options));
    }
  };
  return self;
};
function provide(managed, effect) {
  return Effect.flatMap(managed.contextEffect, context => Effect.provideContext(effect, context));
}
//# sourceMappingURL=ManagedRuntime.js.map