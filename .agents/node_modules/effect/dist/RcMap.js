/**
 * @since 3.5.0
 */
import * as Cause from "./Cause.js";
import { Clock } from "./Clock.js";
import * as Context from "./Context.js";
import * as Deferred from "./Deferred.js";
import * as Duration from "./Duration.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import * as Fiber from "./Fiber.js";
import { constant, dual, flow } from "./Function.js";
import * as MutableHashMap from "./MutableHashMap.js";
import { pipeArguments } from "./Pipeable.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/RcMap";
const makeUnsafe = options => ({
  [TypeId]: TypeId,
  lookup: options.lookup,
  context: options.context,
  scope: options.scope,
  idleTimeToLive: options.idleTimeToLive,
  capacity: options.capacity,
  state: {
    _tag: "Open",
    map: MutableHashMap.empty()
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
});
/**
 * An `RcMap` can contain multiple reference counted resources that can be indexed
 * by a key. The resources are lazily acquired on the first call to `get` and
 * released when the last reference is released.
 *
 * Complex keys can extend `Equal` and `Hash` to allow lookups by value.
 *
 * **Options**
 *
 * - `capacity`: The maximum number of resources that can be held in the map.
 * - `idleTimeToLive`: When the reference count reaches zero, the resource will be released after this duration.
 *
 * @since 3.5.0
 * @category models
 * @example
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`acquired ${key}`),
 *         () => Effect.log(`releasing ${key}`)
 *       )
 *   })
 *
 *   // Get "foo" from the map twice, which will only acquire it once.
 *   // It will then be released once the scope closes.
 *   yield* RcMap.get(map, "foo").pipe(
 *     Effect.andThen(RcMap.get(map, "foo")),
 *     Effect.scoped
 *   )
 * })
 * ```
 */
export const make = options => Effect.withFiber(fiber => {
  const context = fiber.context;
  const scope = Context.get(context, Scope.Scope);
  const self = makeUnsafe({
    lookup: options.lookup,
    context,
    scope,
    idleTimeToLive: typeof options.idleTimeToLive === "function" ? flow(options.idleTimeToLive, Duration.fromInputUnsafe) : constant(Duration.fromInputUnsafe(options.idleTimeToLive ?? Duration.zero)),
    capacity: Math.max(options.capacity ?? Number.POSITIVE_INFINITY, 0)
  });
  return Effect.as(Scope.addFinalizerExit(scope, () => {
    if (self.state._tag === "Closed") {
      return Effect.void;
    }
    const map = self.state.map;
    self.state = {
      _tag: "Closed"
    };
    return Effect.forEach(map, ([, entry]) => Effect.exit(Scope.close(entry.scope, Exit.void))).pipe(Effect.tap(() => Effect.sync(() => {
      MutableHashMap.clear(map);
    })));
  }), self);
});
/**
 * Retrieves a value from the RcMap by key. If the resource doesn't exist, it will be
 * acquired using the lookup function. The resource is reference counted and will be
 * released when the scope closes.
 *
 * @since 3.5.0
 * @category combinators
 * @example
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Resource: ${key}`),
 *         () => Effect.log(`Released ${key}`)
 *       )
 *   })
 *
 *   // Get a resource - it will be acquired on first access
 *   const resource = yield* RcMap.get(map, "database")
 *   console.log(resource) // "Resource: database"
 * }).pipe(Effect.scoped)
 * ```
 */
export const get = /*#__PURE__*/dual(2, (self, key) => Effect.uninterruptibleMask(restore => {
  if (self.state._tag === "Closed") {
    return Effect.interrupt;
  }
  const state = self.state;
  const parent = Fiber.getCurrent();
  const o = MutableHashMap.get(state.map, key);
  let entry;
  if (o._tag === "Some") {
    entry = o.value;
    entry.refCount++;
  } else if (Number.isFinite(self.capacity) && MutableHashMap.size(self.state.map) >= self.capacity) {
    return Effect.fail(new Cause.ExceededCapacityError(`RcMap attempted to exceed capacity of ${self.capacity}`));
  } else {
    entry = {
      deferred: Deferred.makeUnsafe(),
      scope: Scope.makeUnsafe(),
      idleTimeToLive: self.idleTimeToLive(key),
      finalizer: undefined,
      fiber: undefined,
      expiresAt: 0,
      refCount: 1
    };
    entry.finalizer = release(self, key, entry);
    MutableHashMap.set(state.map, key, entry);
    const context = new Map(self.context.mapUnsafe);
    parent.context.mapUnsafe.forEach((value, key) => {
      context.set(key, value);
    });
    context.set(Scope.Scope.key, entry.scope);
    self.lookup(key).pipe(Effect.runForkWith(Context.makeUnsafe(context)), Fiber.runIn(entry.scope)).addObserver(exit => Deferred.doneUnsafe(entry.deferred, exit));
  }
  const scope = Context.getUnsafe(parent.context, Scope.Scope);
  return Scope.addFinalizer(scope, entry.finalizer).pipe(Effect.andThen(restore(Deferred.await(entry.deferred))));
}));
const release = (self, key, entry) => Effect.withFiber(fiber => {
  entry.refCount--;
  if (entry.refCount > 0) {
    return Effect.void;
  } else if (self.state._tag === "Closed" || !MutableHashMap.has(self.state.map, key) || Duration.isZero(entry.idleTimeToLive)) {
    if (self.state._tag === "Open") {
      MutableHashMap.remove(self.state.map, key);
    }
    return Scope.close(entry.scope, Exit.void);
  } else if (!Duration.isFinite(entry.idleTimeToLive)) {
    return Effect.void;
  }
  const clock = fiber.getRef(Clock);
  entry.expiresAt = clock.currentTimeMillisUnsafe() + Duration.toMillis(entry.idleTimeToLive);
  if (entry.fiber) return Effect.void;
  entry.fiber = Effect.interruptibleMask(function loop(restore) {
    const now = clock.currentTimeMillisUnsafe();
    const remaining = entry.expiresAt - now;
    if (remaining <= 0) {
      if (self.state._tag === "Closed" || entry.refCount > 0) return Effect.void;
      MutableHashMap.remove(self.state.map, key);
      return restore(Scope.close(entry.scope, Exit.void));
    }
    return Effect.flatMap(clock.sleep(Duration.millis(remaining)), () => loop(restore));
  }).pipe(Effect.ensuring(Effect.sync(() => {
    entry.fiber = undefined;
  })), Effect.runForkWith(fiber.context), Fiber.runIn(self.scope));
  return Effect.void;
});
/**
 * Returns an array of all keys currently stored in the RcMap.
 *
 * @since 3.5.0
 * @category combinators
 * @example
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) => Effect.succeed(`value-${key}`)
 *   })
 *
 *   // Add some resources to the map
 *   yield* RcMap.get(map, "foo")
 *   yield* RcMap.get(map, "bar")
 *   yield* RcMap.get(map, "baz")
 *
 *   // Get all keys currently in the map
 *   const allKeys = yield* RcMap.keys(map)
 *   console.log(allKeys) // ["foo", "bar", "baz"]
 * }).pipe(Effect.scoped)
 * ```
 */
export const keys = self => {
  return Effect.suspend(() => self.state._tag === "Closed" ? Effect.interrupt : Effect.succeed(MutableHashMap.keys(self.state.map)));
};
/**
 * Invalidates and removes a specific key from the RcMap. If the resource is not
 * currently in use (reference count is 0), it will be immediately released.
 *
 * @since 3.5.0
 * @category combinators
 * @example
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Resource: ${key}`),
 *         () => Effect.log(`Released ${key}`)
 *       )
 *   })
 *
 *   // Get a resource
 *   yield* RcMap.get(map, "cache")
 *
 *   // Invalidate the resource - it will be removed from the map
 *   // and released if no longer in use
 *   yield* RcMap.invalidate(map, "cache")
 *
 *   // Next access will create a new resource
 *   yield* RcMap.get(map, "cache")
 * }).pipe(Effect.scoped)
 * ```
 */
export const invalidate = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, key) {
  if (self.state._tag === "Closed") return;
  const o = MutableHashMap.get(self.state.map, key);
  if (o._tag === "None") return;
  const entry = o.value;
  MutableHashMap.remove(self.state.map, key);
  if (entry.refCount > 0) return;
  if (entry.fiber) yield* Fiber.interrupt(entry.fiber);
  yield* Scope.close(entry.scope, Exit.void);
}, Effect.uninterruptible));
/**
 * @since 3.17.7
 * @category combinators
 */
export const has = /*#__PURE__*/dual(2, (self, key) => Effect.sync(() => {
  if (self.state._tag === "Closed") return false;
  return MutableHashMap.has(self.state.map, key);
}));
/**
 * Extends the idle time for a resource in the RcMap. If the RcMap has an
 * `idleTimeToLive` configured, calling `touch` will reset the expiration
 * timer for the specified key.
 *
 * @since 3.5.0
 * @category combinators
 * @example
 * ```ts
 * import { Effect, RcMap } from "effect"
 *
 * Effect.gen(function*() {
 *   const map = yield* RcMap.make({
 *     lookup: (key: string) =>
 *       Effect.acquireRelease(
 *         Effect.succeed(`Resource: ${key}`),
 *         () => Effect.log(`Released ${key}`)
 *       ),
 *     idleTimeToLive: "10 seconds"
 *   })
 *
 *   // Get a resource
 *   yield* RcMap.get(map, "session")
 *
 *   // Touch the resource to extend its idle time
 *   // This resets the 10-second expiration timer
 *   yield* RcMap.touch(map, "session")
 *
 *   // The resource will now live for another 10 seconds
 *   // from the time it was touched
 * }).pipe(Effect.scoped)
 * ```
 */
export const touch = /*#__PURE__*/dual(2, (self, key) => Effect.clockWith(clock => {
  if (self.state._tag === "Closed") {
    return Effect.void;
  }
  const o = MutableHashMap.get(self.state.map, key);
  if (o._tag === "None" || Duration.isZero(o.value.idleTimeToLive)) {
    return Effect.void;
  }
  const entry = o.value;
  entry.expiresAt = clock.currentTimeMillisUnsafe() + Duration.toMillis(entry.idleTimeToLive);
  return Effect.void;
}));
//# sourceMappingURL=RcMap.js.map