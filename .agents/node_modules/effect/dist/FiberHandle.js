/**
 * @since 2.0.0
 */
import * as Cause from "./Cause.js";
import * as Deferred from "./Deferred.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import * as Fiber from "./Fiber.js";
import * as Filter from "./Filter.js";
import { dual } from "./Function.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
const TypeId = "~effect/FiberHandle";
/**
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   console.log(FiberHandle.isFiberHandle(handle)) // true
 *   console.log(FiberHandle.isFiberHandle("not a handle")) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category refinements
 */
export const isFiberHandle = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "FiberHandle",
      state: this.state
    };
  }
};
const makeUnsafe = () => {
  const self = Object.create(Proto);
  self.state = {
    _tag: "Open",
    fiber: undefined
  };
  self.deferred = Deferred.makeUnsafe();
  return self;
};
/**
 * A FiberHandle can be used to store a single fiber.
 * When the associated Scope is closed, the contained fiber will be interrupted.
 *
 * You can add a fiber to the handle using `FiberHandle.run`, and the fiber will
 * be automatically removed from the FiberHandle when it completes.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // run some effects
 *   yield* FiberHandle.run(handle, Effect.never)
 *   // this will interrupt the previous fiber
 *   yield* FiberHandle.run(handle, Effect.never)
 *
 *   yield* Effect.sleep(1000)
 * }).pipe(
 *   Effect.scoped // The fiber will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = () => Effect.acquireRelease(Effect.sync(() => makeUnsafe()), handle => {
  const state = handle.state;
  if (state._tag === "Closed") return Effect.void;
  handle.state = {
    _tag: "Closed"
  };
  return state.fiber ? Deferred.into(Effect.asVoid(Fiber.interruptAs(state.fiber, internalFiberId)), handle.deferred) : Deferred.done(handle.deferred, Exit.void);
});
/**
 * Create an Effect run function that is backed by a FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const run = yield* FiberHandle.makeRuntime<never>()
 *
 *   // Run effects and get fibers back
 *   const fiberA = run(Effect.succeed("first"))
 *   const fiberB = run(Effect.succeed("second"))
 *
 *   // The second fiber will interrupt the first
 *   const resultA = yield* Fiber.await(fiberA)
 *   const resultB = yield* Fiber.await(fiberB)
 * }).pipe(Effect.scoped)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeRuntime = () => Effect.flatMap(make(), self => runtime(self)());
/**
 * Create an Effect run function that is backed by a FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const run = yield* FiberHandle.makeRuntimePromise()
 *
 *   // Run effects and get promises back
 *   const promise = run(Effect.succeed("hello"))
 *   const result = yield* Effect.promise(() => promise)
 *   console.log(result) // "hello"
 * }).pipe(Effect.scoped)
 * ```
 *
 * @since 3.13.0
 * @category constructors
 */
export const makeRuntimePromise = () => Effect.flatMap(make(), self => runtimePromise(self)());
const internalFiberId = -1;
const isInternalInterruption = /*#__PURE__*/Filter.toPredicate(/*#__PURE__*/Filter.compose(Cause.filterInterruptors, /*#__PURE__*/Filter.has(internalFiberId)));
/**
 * Set the fiber in a FiberHandle. When the fiber completes, it will be removed from the FiberHandle.
 * If a fiber is already running, it will be interrupted unless `options.onlyIfMissing` is set.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const fiber = Effect.runFork(Effect.succeed("hello"))
 *
 *   // Set the fiber directly (unsafe)
 *   FiberHandle.setUnsafe(handle, fiber)
 *
 *   // The fiber is now managed by the handle
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const setUnsafe = /*#__PURE__*/dual(args => isFiberHandle(args[0]), (self, fiber, options) => {
  if (self.state._tag === "Closed") {
    fiber.interruptUnsafe(internalFiberId);
    return;
  } else if (self.state.fiber !== undefined) {
    if (options?.onlyIfMissing === true) {
      fiber.interruptUnsafe(internalFiberId);
      return;
    } else if (self.state.fiber === fiber) {
      return;
    }
    self.state.fiber.interruptUnsafe(internalFiberId);
    self.state.fiber = undefined;
  }
  self.state.fiber = fiber;
  fiber.addObserver(exit => {
    if (self.state._tag === "Open" && fiber === self.state.fiber) {
      self.state.fiber = undefined;
    }
    if (Exit.isFailure(exit) && (options?.propagateInterruption === true ? !isInternalInterruption(exit.cause) : !Cause.hasInterruptsOnly(exit.cause))) {
      Deferred.doneUnsafe(self.deferred, exit);
    }
  });
});
/**
 * Set the fiber in the `FiberHandle`. When the fiber completes, it will be
 * removed from the `FiberHandle`.
 *
 * If a fiber already exists in the `FiberHandle`, it will be interrupted
 * unless `options.onlyIfMissing` is set.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const fiber = Effect.runFork(Effect.succeed("hello"))
 *
 *   // Set the fiber safely
 *   yield* FiberHandle.set(handle, fiber)
 *
 *   // The fiber is now managed by the handle
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const set = /*#__PURE__*/dual(args => isFiberHandle(args[0]), (self, fiber, options) => Effect.sync(() => setUnsafe(self, fiber, {
  onlyIfMissing: options?.onlyIfMissing,
  propagateInterruption: options?.propagateInterruption
})));
/**
 * Retrieve the fiber from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // No fiber initially
 *   const emptyFiber = FiberHandle.getUnsafe(handle)
 *   console.log(emptyFiber._tag === "None") // true
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber._tag === "Some") // true
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export function getUnsafe(self) {
  return self.state._tag === "Closed" ? Option.none() : Option.fromUndefinedOr(self.state.fiber);
}
/**
 * Retrieve the fiber from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *
 *   // Get the current fiber if present
 *   const fiber = yield* FiberHandle.get(handle)
 *   if (fiber._tag === "Some") {
 *     const result = yield* Fiber.await(fiber.value)
 *     console.log(result) // "hello"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export function get(self) {
  return Effect.suspend(() => Effect.succeed(getUnsafe(self)));
}
/**
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Add a fiber
 *   yield* FiberHandle.run(handle, Effect.never)
 *
 *   // Clear the handle, interrupting the fiber
 *   yield* FiberHandle.clear(handle)
 *
 *   // The handle is now empty
 *   const fiber = FiberHandle.getUnsafe(handle)
 *   console.log(fiber) // Option.none()
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const clear = self => Effect.uninterruptibleMask(restore => {
  if (self.state._tag === "Closed" || self.state.fiber === undefined) {
    return Effect.void;
  }
  return Effect.andThen(restore(Fiber.interruptAs(self.state.fiber, internalFiberId)), Effect.sync(() => {
    if (self.state._tag === "Open") {
      self.state.fiber = undefined;
    }
  }));
});
const constInterruptedFiber = /*#__PURE__*/function () {
  let fiber = undefined;
  return () => {
    if (fiber === undefined) {
      fiber = Effect.runFork(Effect.interrupt);
    }
    return fiber;
  };
}();
/**
 * Run an Effect and add the forked fiber to the FiberHandle.
 * When the fiber completes, it will be removed from the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Run an effect and get the fiber
 *   const fiber = yield* FiberHandle.run(handle, Effect.succeed("hello"))
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "hello"
 *
 *   // Running another effect will interrupt the previous one
 *   const fiber2 = yield* FiberHandle.run(handle, Effect.succeed("world"))
 *   const result2 = yield* Fiber.await(fiber2)
 *   console.log(result2) // "world"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const run = function () {
  const self = arguments[0];
  if (Effect.isEffect(arguments[1])) {
    return runImpl(self, arguments[1], arguments[2]);
  }
  const options = arguments[1];
  return effect => runImpl(self, effect, options);
};
const runImpl = (self, effect, options) => Effect.withFiber(parent => {
  if (self.state._tag === "Closed") {
    return Effect.interrupt;
  } else if (self.state.fiber !== undefined && options?.onlyIfMissing === true) {
    return Effect.sync(constInterruptedFiber);
  }
  const fiber = Effect.runForkWith(parent.context)(effect);
  setUnsafe(self, fiber, options);
  return Effect.succeed(fiber);
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle, Context } from "effect"
 *
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = Context.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const run = yield* FiberHandle.runtime(handle)<Users>()
 *
 *   // run an effect and set the fiber in the handle
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 *
 *   // this will interrupt the previous fiber
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fiber will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const runtime = self => () => Effect.map(Effect.context(), services => {
  const runFork = Effect.runForkWith(services);
  return (effect, options) => {
    if (self.state._tag === "Closed") {
      return constInterruptedFiber();
    } else if (self.state.fiber !== undefined && options?.onlyIfMissing === true) {
      return constInterruptedFiber();
    }
    const fiber = runFork(effect, options);
    setUnsafe(self, fiber, options);
    return fiber;
  };
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberHandle.
 *
 * The returned run function will return Promise's that will resolve when the
 * fiber completes.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   const runPromise = yield* FiberHandle.runtimePromise(handle)<never>()
 *
 *   // Run an effect and get a promise
 *   const promise = runPromise(Effect.succeed("hello"))
 *   const result = yield* Effect.promise(() => promise)
 *   console.log(result) // "hello"
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export const runtimePromise = self => () => Effect.map(runtime(self)(), runFork => (effect, options) => new Promise((resolve, reject) => runFork(effect, options).addObserver(exit => {
  if (Exit.isSuccess(exit)) {
    resolve(exit.value);
  } else {
    reject(Cause.squash(exit.cause));
  }
})));
/**
 * If any of the Fiber's in the handle terminate with a failure,
 * the returned Effect will terminate with the first failure that occurred.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *   yield* FiberHandle.set(handle, Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberHandle.join(handle)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const join = self => Deferred.await(self.deferred);
/**
 * Wait for the fiber in the FiberHandle to complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const handle = yield* FiberHandle.make()
 *
 *   // Start a long-running effect
 *   yield* FiberHandle.run(handle, Effect.sleep(1000))
 *
 *   // Wait for the fiber to complete
 *   yield* FiberHandle.awaitEmpty(handle)
 *
 *   console.log("Fiber completed")
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export const awaitEmpty = self => Effect.suspend(() => {
  if (self.state._tag === "Closed" || self.state.fiber === undefined) {
    return Effect.void;
  }
  return Fiber.await(self.state.fiber);
});
//# sourceMappingURL=FiberHandle.js.map