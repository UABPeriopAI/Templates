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
import * as MutableHashMap from "./MutableHashMap.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
const TypeId = "~effect/FiberMap";
/**
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   console.log(FiberMap.isFiberMap(map)) // true
 *   console.log(FiberMap.isFiberMap({})) // false
 *   console.log(FiberMap.isFiberMap(null)) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category refinements
 */
export const isFiberMap = u => Predicate.hasProperty(u, TypeId);
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
 * A FiberMap can be used to store a collection of fibers, indexed by some key.
 * When the associated Scope is closed, all fibers in the map will be interrupted.
 *
 * You can add fibers to the map using `FiberMap.set` or `FiberMap.run`, and the fibers will
 * be automatically removed from the FiberMap when they complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // run some effects and add the fibers to the map
 *   yield* FiberMap.run(map, "fiber a", Effect.never)
 *   yield* FiberMap.run(map, "fiber b", Effect.never)
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
export const make = () => Effect.acquireRelease(Effect.sync(() => makeUnsafe(MutableHashMap.empty(), Deferred.makeUnsafe())), map => Effect.suspend(() => {
  const state = map.state;
  if (state._tag === "Closed") return Effect.void;
  map.state = {
    _tag: "Closed"
  };
  return Fiber.interruptAll(MutableHashMap.values(state.backing)).pipe(Deferred.into(map.deferred));
}));
/**
 * Create an Effect run function that is backed by a FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const run = yield* FiberMap.makeRuntime<never, string>()
 *
 *   // Run effects and get back fibers
 *   const fiber1 = run("task1", Effect.succeed("Hello"))
 *   const fiber2 = run("task2", Effect.succeed("World"))
 *
 *   // Await the results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "Hello", "World"
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const makeRuntime = () => Effect.flatMap(make(), self => runtime(self)());
/**
 * Create an Effect run function that is backed by a FiberMap.
 * Returns a Promise instead of a Fiber for more convenient use with async/await.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const run = yield* FiberMap.makeRuntimePromise<never, string>()
 *
 *   // Run effects and get back promises
 *   const promise1 = run("task1", Effect.succeed("Hello"))
 *   const promise2 = run("task2", Effect.succeed("World"))
 *
 *   // Convert to Effect and await
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "Hello", "World"
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
 * Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap.
 * If the key already exists in the FiberMap, the previous fiber will be interrupted.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Create a fiber and add it to the map
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   FiberMap.setUnsafe(map, "greeting", fiber)
 *
 *   // The fiber will be automatically removed when it completes
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "Hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const setUnsafe = /*#__PURE__*/dual(args => isFiberMap(args[0]), (self, key, fiber, options) => {
  if (self.state._tag === "Closed") {
    fiber.interruptUnsafe(internalFiberId);
    return;
  }
  const previous = MutableHashMap.get(self.state.backing, key);
  if (previous._tag === "Some") {
    if (options?.onlyIfMissing === true) {
      fiber.interruptUnsafe(internalFiberId);
      return;
    } else if (previous.value === fiber) {
      return;
    }
    previous.value.interruptUnsafe(internalFiberId);
  }
  MutableHashMap.set(self.state.backing, key, fiber);
  fiber.addObserver(exit => {
    if (self.state._tag === "Closed") {
      return;
    }
    const current = MutableHashMap.get(self.state.backing, key);
    if (Option.isSome(current) && fiber === current.value) {
      MutableHashMap.remove(self.state.backing, key);
    }
    if (Exit.isFailure(exit) && (options?.propagateInterruption === true ? !isInternalInterruption(exit.cause) : !Cause.hasInterruptsOnly(exit.cause))) {
      Deferred.doneUnsafe(self.deferred, exit);
    }
  });
});
/**
 * Add a fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap.
 * If the key already exists in the FiberMap, the previous fiber will be interrupted.
 * This is the Effect-wrapped version of `setUnsafe`.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Create a fiber and add it to the map using Effect
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   yield* FiberMap.set(map, "greeting", fiber)
 *
 *   // The fiber will be automatically removed when it completes
 *   const result = yield* Fiber.await(fiber)
 *   console.log(result) // "Hello"
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const set = /*#__PURE__*/dual(args => isFiberMap(args[0]), (self, key, fiber, options) => Effect.sync(() => setUnsafe(self, key, fiber, options)));
/**
 * Retrieve a fiber from the FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add a fiber to the map
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   FiberMap.setUnsafe(map, "greeting", fiber)
 *
 *   // Retrieve the fiber
 *   const retrieved = FiberMap.getUnsafe(map, "greeting")
 *   if (retrieved._tag === "Some") {
 *     const result = yield* Fiber.await(retrieved.value)
 *     console.log(result) // "Hello"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const getUnsafe = /*#__PURE__*/dual(2, (self, key) => {
  return self.state._tag === "Closed" ? Option.none() : MutableHashMap.get(self.state.backing, key);
});
/**
 * Retrieve a fiber from the FiberMap.
 *
 * Returns an `Option` wrapped in `Effect`.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add a fiber to the map
 *   const fiber = yield* Effect.forkChild(Effect.succeed("Hello"))
 *   yield* FiberMap.set(map, "greeting", fiber)
 *
 *   // Retrieve the fiber with error handling
 *   const retrieved = yield* FiberMap.get(map, "greeting")
 *   if (retrieved._tag === "Some") {
 *     const result = yield* Fiber.await(retrieved.value)
 *     console.log(result) // "Hello"
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const get = /*#__PURE__*/dual(2, (self, key) => Effect.suspend(() => Effect.succeed(getUnsafe(self, key))));
/**
 * Check if a key exists in the FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add a fiber to the map
 *   yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 *
 *   // Check if keys exist
 *   console.log(FiberMap.hasUnsafe(map, "task1")) // true
 *   console.log(FiberMap.hasUnsafe(map, "task2")) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const hasUnsafe = /*#__PURE__*/dual(2, (self, key) => self.state._tag === "Closed" ? false : MutableHashMap.has(self.state.backing, key));
/**
 * Check if a key exists in the FiberMap.
 * This is the Effect-wrapped version of `hasUnsafe`.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add a fiber to the map
 *   yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 *
 *   // Check if keys exist using Effect
 *   const exists1 = yield* FiberMap.has(map, "task1")
 *   const exists2 = yield* FiberMap.has(map, "task2")
 *
 *   console.log(exists1) // true
 *   console.log(exists2) // false
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const has = /*#__PURE__*/dual(2, (self, key) => Effect.sync(() => hasUnsafe(self, key)));
/**
 * Remove a fiber from the FiberMap, interrupting it if it exists.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add some fibers to the map
 *   yield* FiberMap.run(map, "task1", Effect.never)
 *   yield* FiberMap.run(map, "task2", Effect.never)
 *
 *   console.log(yield* FiberMap.size(map)) // 2
 *
 *   // Remove a specific fiber (this will interrupt it)
 *   yield* FiberMap.remove(map, "task1")
 *
 *   console.log(yield* FiberMap.size(map)) // 1
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const remove = /*#__PURE__*/dual(2, (self, key) => Effect.suspend(() => {
  if (self.state._tag === "Closed") {
    return Effect.void;
  }
  const fiber = MutableHashMap.get(self.state.backing, key);
  if (fiber._tag === "None") {
    return Effect.void;
  }
  return Fiber.interruptAs(fiber.value, internalFiberId);
}));
/**
 * Remove all fibers from the FiberMap, interrupting them.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add some fibers to the map
 *   yield* FiberMap.run(map, "task1", Effect.never)
 *   yield* FiberMap.run(map, "task2", Effect.never)
 *   yield* FiberMap.run(map, "task3", Effect.never)
 *
 *   console.log(yield* FiberMap.size(map)) // 3
 *
 *   // Clear all fibers (this will interrupt all of them)
 *   yield* FiberMap.clear(map)
 *
 *   console.log(yield* FiberMap.size(map)) // 0
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
  return Fiber.interruptAllAs(MutableHashMap.values(self.state.backing), internalFiberId);
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
 * Run an Effect and add the forked fiber to the FiberMap.
 * When the fiber completes, it will be removed from the FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Run effects and add the fibers to the map
 *   const fiber1 = yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 *   const fiber2 = yield* FiberMap.run(map, "task2", Effect.succeed("World"))
 *
 *   // Wait for the results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "Hello", "World"
 *   console.log(yield* FiberMap.size(map)) // 0 (fibers are removed after completion)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const run = function () {
  const self = arguments[0];
  if (Effect.isEffect(arguments[2])) {
    return runImpl(self, arguments[1], arguments[2], arguments[3]);
  }
  const key = arguments[1];
  const options = arguments[2];
  return effect => runImpl(self, key, effect, options);
};
const runImpl = (self, key, effect, options) => Effect.withFiber(parent => {
  if (self.state._tag === "Closed") {
    return Effect.interrupt;
  } else if (options?.onlyIfMissing === true && hasUnsafe(self, key)) {
    return Effect.sync(constInterruptedFiber);
  }
  const fiber = Effect.runForkWith(parent.context)(effect);
  setUnsafe(self, key, fiber, options);
  return Effect.succeed(fiber);
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap, Context } from "effect"
 *
 * interface Users {
 *   readonly _: unique symbol
 * }
 * const Users = Context.Service<Users, {
 *   getAll: Effect.Effect<Array<unknown>>
 * }>("Users")
 *
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *   const run = yield* FiberMap.runtime(map)<Users>()
 *
 *   // run some effects and add the fibers to the map
 *   run("effect-a", Effect.andThen(Users.asEffect(), (_) => _.getAll))
 *   run("effect-b", Effect.andThen(Users.asEffect(), (_) => _.getAll))
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
  return (key, effect, options) => {
    if (self.state._tag === "Closed") {
      return constInterruptedFiber();
    } else if (options?.onlyIfMissing === true && hasUnsafe(self, key)) {
      return constInterruptedFiber();
    }
    const fiber = runFork(effect, options);
    setUnsafe(self, key, fiber, options);
    return fiber;
  };
});
/**
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap.
 * Returns a Promise instead of a Fiber for convenience.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *   const runPromise = yield* FiberMap.runtimePromise(map)<never>()
 *
 *   // Create promises that will be backed by fibers in the map
 *   const promise1 = runPromise("task1", Effect.succeed("Hello"))
 *   const promise2 = runPromise("task2", Effect.succeed("World"))
 *
 *   // Convert promises back to Effects and await
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "Hello", "World"
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export const runtimePromise = self => () => Effect.map(runtime(self)(), runFork => (key, effect, options) => new Promise((resolve, reject) => runFork(key, effect, options).addObserver(exit => {
  if (Exit.isSuccess(exit)) {
    resolve(exit.value);
  } else {
    reject(Cause.squash(exit.cause));
  }
})));
/**
 * Get the number of fibers currently in the FiberMap.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   console.log(yield* FiberMap.size(map)) // 0
 *
 *   // Add some fibers
 *   yield* FiberMap.run(map, "task1", Effect.never)
 *   yield* FiberMap.run(map, "task2", Effect.never)
 *
 *   console.log(yield* FiberMap.size(map)) // 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const size = self => Effect.sync(() => self.state._tag === "Closed" ? 0 : MutableHashMap.size(self.state.backing));
/**
 * Join all fibers in the FiberMap. If any of the Fiber's in the map terminate with a failure,
 * the returned Effect will terminate with the first failure that occurred.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* FiberMap.make()
 *   yield* FiberMap.set(map, "a", Effect.runFork(Effect.fail("error")))
 *
 *   // parent fiber will fail with "error"
 *   yield* FiberMap.join(map)
 * })
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export const join = self => Deferred.await(self.deferred);
/**
 * Wait for the FiberMap to be empty.
 * This will wait for all currently running fibers to complete.
 *
 * @example
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add some fibers that will complete after a delay
 *   yield* FiberMap.run(map, "task1", Effect.sleep(1000))
 *   yield* FiberMap.run(map, "task2", Effect.sleep(2000))
 *
 *   console.log("Waiting for all fibers to complete...")
 *
 *   // Wait for the map to be empty
 *   yield* FiberMap.awaitEmpty(map)
 *
 *   console.log("All fibers completed!")
 *   console.log(yield* FiberMap.size(map)) // 0
 * })
 * ```
 *
 * @since 3.13.0
 * @category combinators
 */
export const awaitEmpty = self => Effect.whileLoop({
  while: () => self.state._tag === "Open" && MutableHashMap.size(self.state.backing) > 0,
  body: () => Fiber.await(Iterable.headUnsafe(self)[1]),
  step: constVoid
});
//# sourceMappingURL=FiberMap.js.map