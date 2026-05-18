/**
 * @since 2.0.0
 */
import * as Cause from "./Cause.js";
import * as Deferred from "./Deferred.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import * as Fiber from "./Fiber.js";
import * as Filter from "./Filter.js";
import { constVoid, dual } from "./Function.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as Iterable from "./Iterable.js";
import * as Predicate from "./Predicate.js";
const TypeId = "~effect/FiberSet";
/**
 * Checks if a value is a FiberSet.
 *
 * @since 2.0.0
 * @category refinements
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   console.log(FiberSet.isFiberSet(set)) // true
 *   console.log(FiberSet.isFiberSet({})) // false
 * })
 * ```
 */
export const isFiberSet = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  [Symbol.iterator]() {
    if (this.state._tag === "Closed") {
      return Iterable.empty();
    }
    return this.state.backing[Symbol.iterator]();
  },
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "FiberMap",
      state: this.state
    };
  }
};
const makeUnsafe = (backing, deferred) => {
  const self = Object.create(Proto);
  self.state = {
    _tag: "Open",
    backing
  };
  self.deferred = deferred;
  return self;
};
/**
 * A FiberSet can be used to store a collection of fibers.
 * When the associated Scope is closed, all fibers in the set will be interrupted.
 *
 * You can add fibers to the set using `FiberSet.add` or `FiberSet.run`, and the fibers will
 * be automatically removed from the FiberSet when they complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // run some effects and add the fibers to the set
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   yield* Effect.sleep(1000)
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = () => Effect.acquireRelease(Effect.sync(() => makeUnsafe(new Set(), Deferred.makeUnsafe())), set => Effect.suspend(() => {
  const state = set.state;
  if (state._tag === "Closed") return Effect.void;
  set.state = {
    _tag: "Closed"
  };
  const fibers = state.backing;
  return Fiber.interruptAll(fibers).pipe(Deferred.into(set.deferred));
}));
/**
 * Create an Effect run function that is backed by a FiberSet.
 *
 * @since 2.0.0
 * @category constructors
 * @example
 * ```ts
 * import { Effect, Fiber, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const runFork = yield* FiberSet.makeRuntime()
 *
 *   // Fork effects using the runtime
 *   const fiber1 = runFork(Effect.succeed("hello"))
 *   const fiber2 = runFork(Effect.succeed("world"))
 *
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 */
export const makeRuntime = () => Effect.flatMap(make(), self => runtime(self)());
/**
 * Create an Effect run function that is backed by a FiberSet.
 * The returned run function will return Promise's.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const runPromise = yield* FiberSet.makeRuntimePromise()
 *
 *   // Run effects as promises
 *   const promise1 = runPromise(Effect.succeed("hello"))
 *   const promise2 = runPromise(Effect.succeed("world"))
 *
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 *
 * @since 3.13.0
 * @category constructors
 */
export const makeRuntimePromise = () => Effect.flatMap(make(), self => runtimePromise(self)());
const internalFiberId = -1;
const isInternalInterruption = /*#__PURE__*/Filter.toPredicate(/*#__PURE__*/Filter.compose(Cause.filterInterruptors, /*#__PURE__*/Filter.has(internalFiberId)));
/**
 * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
 * This is the unsafe version that doesn't return an Effect.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
 *
 *   // Unsafe add - doesn't return an Effect
 *   FiberSet.addUnsafe(set, fiber)
 *
 *   // The fiber is now managed by the set
 *   console.log(yield* FiberSet.size(set)) // 1
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const addUnsafe = /*#__PURE__*/dual(args => isFiberSet(args[0]), (self, fiber, options) => {
  if (self.state._tag === "Closed") {
    fiber.interruptUnsafe(internalFiberId);
    return;
  } else if (self.state.backing.has(fiber)) {
    return;
  }
  self.state.backing.add(fiber);
  fiber.addObserver(exit => {
    if (self.state._tag === "Closed") {
      return;
    }
    self.state.backing.delete(fiber);
    if (Exit.isFailure(exit) && (options?.propagateInterruption === true ? !isInternalInterruption(exit.cause) : !Cause.hasInterruptsOnly(exit.cause))) {
      Deferred.doneUnsafe(self.deferred, exit);
    }
  });
});
/**
 * Add a fiber to the FiberSet. When the fiber completes, it will be removed.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const fiber = yield* Effect.forkChild(Effect.succeed("hello"))
 *
 *   // Add the fiber to the set
 *   yield* FiberSet.add(set, fiber)
 *
 *   // The fiber is now managed by the set
 *   console.log(yield* FiberSet.size(set)) // 1
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const add = /*#__PURE__*/dual(args => isFiberSet(args[0]), (self, fiber, options) => Effect.sync(() => addUnsafe(self, fiber, options)));
/**
 * Interrupt all fibers in the FiberSet and clear the set.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Add some fibers
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   console.log(yield* FiberSet.size(set)) // 2
 *
 *   // Clear all fibers
 *   yield* FiberSet.clear(set)
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const clear = self => Effect.suspend(() => {
  if (self.state._tag === "Closed") {
    return Effect.void;
  }
  return Fiber.interruptAllAs(self.state.backing, internalFiberId);
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
 * Fork an Effect and add the forked fiber to the FiberSet.
 * When the fiber completes, it will be removed from the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Fork and add to set
 *   const fiber1 = yield* FiberSet.run(set, Effect.succeed("hello"))
 *   const fiber2 = yield* FiberSet.run(set, Effect.succeed("world"))
 *
 *   // Get results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "hello" "world"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const run = function () {
  const self = arguments[0];
  if (!Effect.isEffect(arguments[1])) {
    const options = arguments[1];
    return effect => runImpl(self, effect, options);
  }
  return runImpl(self, arguments[1], arguments[2]);
};
const runImpl = (self, effect, options) => Effect.withFiber(parent => {
  if (self.state._tag === "Closed") {
    return Effect.sync(constInterruptedFiber);
  }
  const fiber = Effect.runForkWith(parent.context)(effect);
  addUnsafe(self, fiber, options);
  return Effect.succeed(fiber);
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet, Context } from "effect"
 *
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = Context.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const run = yield* FiberSet.runtime(set)<Users>()
 *
 *   // run some effects and add the fibers to the set
 *   run(Effect.andThen(Users.asEffect(), (_) => _.getAll))
 * }).pipe(
 *   Effect.scoped // The fibers will be interrupted when the scope is closed
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
    }
    const fiber = runFork(effect, options);
    addUnsafe(self, fiber);
    return fiber;
  };
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.
 *
 * The returned run function will return Promise's.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const runPromise = yield* FiberSet.runtimePromise(set)()
 *
 *   // Run effects as promises
 *   const promise1 = runPromise(Effect.succeed("hello"))
 *   const promise2 = runPromise(Effect.succeed("world"))
 *
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "hello" "world"
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
 * Get the number of fibers currently in the FiberSet.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 *
 *   // Add some fibers
 *   yield* FiberSet.run(set, Effect.never)
 *   yield* FiberSet.run(set, Effect.never)
 *
 *   console.log(yield* FiberSet.size(set)) // 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const size = self => Effect.sync(() => self.state._tag === "Closed" ? 0 : self.state.backing.size);
/**
 * Join all fibers in the FiberSet. If any of the Fiber's in the set terminate with a failure,
 * the returned Effect will terminate with the first failure that occurred.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   yield* FiberSet.add(set, Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberSet.join(set)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const join = self => Deferred.await(self.deferred);
/**
 * Wait until the fiber set is empty.
 *
 * @example
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *
 *   // Add some fibers that will complete
 *   yield* FiberSet.run(set, Effect.sleep(100))
 *   yield* FiberSet.run(set, Effect.sleep(200))
 *
 *   // Wait for all fibers to complete
 *   yield* FiberSet.awaitEmpty(set)
 *
 *   console.log(yield* FiberSet.size(set)) // 0
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export const awaitEmpty = self => Effect.whileLoop({
  while: () => self.state._tag === "Open" && self.state.backing.size > 0,
  body: () => Fiber.await(Iterable.headUnsafe(self)),
  step: constVoid
});
//# sourceMappingURL=FiberSet.js.map