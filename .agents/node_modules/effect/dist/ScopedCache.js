/**
 * @since 4.0.0
 */
import * as Arr from "./Array.js";
import * as Context from "./Context.js";
import * as Deferred from "./Deferred.js";
import * as Duration from "./Duration.js";
import * as Fiber from "./Fiber.js";
import { dual, identity } from "./Function.js";
import * as core from "./internal/core.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as effect from "./internal/effect.js";
import * as MutableHashMap from "./MutableHashMap.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/ScopedCache";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const makeWith = options => effect.contextWith(context => {
  const scope = Context.get(context, Scope.Scope);
  const self = Object.create(Proto);
  self.lookup = key => effect.updateContext(options.lookup(key), input => Context.merge(context, input));
  const map = MutableHashMap.empty();
  self.state = {
    _tag: "Open",
    map
  };
  self.capacity = options.capacity;
  self.timeToLive = options.timeToLive ? (exit, key) => Duration.fromInputUnsafe(options.timeToLive(exit, key)) : defaultTimeToLive;
  return effect.as(Scope.addFinalizer(scope, core.withFiber(fiber => {
    self.state = {
      _tag: "Closed"
    };
    return invalidateAllImpl(fiber, map);
  })), self);
});
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => makeWith({
  ...options,
  timeToLive: options.timeToLive ? () => options.timeToLive : defaultTimeToLive
});
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  toJSON() {
    return {
      _id: "ScopedCache",
      capacity: this.capacity,
      state: this.state
    };
  }
};
const defaultTimeToLive = (_, _key) => Duration.infinity;
/**
 * @since 4.0.0
 * @category Combinators
 */
export const get = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptibleMask(restore => core.withFiber(fiber => {
  const state = self.state;
  if (state._tag === "Closed") {
    return effect.interrupt;
  }
  const oentry = MutableHashMap.get(state.map, key);
  if (Option.isSome(oentry) && !hasExpired(oentry.value, fiber)) {
    // Move the entry to the end of the map to keep it fresh
    MutableHashMap.remove(state.map, key);
    MutableHashMap.set(state.map, key, oentry.value);
    return restore(Deferred.await(oentry.value.deferred));
  }
  const scope = Scope.makeUnsafe();
  const deferred = Deferred.makeUnsafe();
  const entry = {
    expiresAt: undefined,
    deferred,
    scope
  };
  MutableHashMap.set(state.map, key, entry);
  return checkCapacity(fiber, state.map, self.capacity).pipe(Option.isSome(oentry) ? effect.flatMap(() => Scope.close(oentry.value.scope, effect.exitVoid)) : identity, effect.flatMap(() => Scope.provide(restore(self.lookup(key)), scope)), effect.onExit(exit => {
    Deferred.doneUnsafe(deferred, exit);
    const ttl = self.timeToLive(exit, key);
    if (Duration.isFinite(ttl)) {
      entry.expiresAt = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl);
    }
    return effect.void;
  }));
})));
const hasExpired = (entry, fiber) => {
  if (entry.expiresAt === undefined) {
    return false;
  }
  return fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() >= entry.expiresAt;
};
const checkCapacity = (parent, map, capacity) => {
  if (!Number.isFinite(capacity)) return effect.void;
  let diff = MutableHashMap.size(map) - capacity;
  if (diff <= 0) return effect.void;
  // MutableHashMap has insertion order, so we can remove the oldest entries
  const fibers = Arr.empty();
  for (const [key, entry] of map) {
    MutableHashMap.remove(map, key);
    fibers.push(effect.forkUnsafe(parent, Scope.close(entry.scope, effect.exitVoid), true));
    diff--;
    if (diff === 0) break;
  }
  return effect.fiberAwaitAll(fibers);
};
/**
 * @since 4.0.0
 * @category Combinators
 */
export const getOption = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptibleMask(restore => core.withFiber(fiber => effect.flatMap(getImpl(self, key, fiber), entry => entry ? effect.asSome(restore(Deferred.await(entry.deferred))) : effect.succeedNone))));
const getImpl = (self, key, fiber, isRead = true) => {
  if (self.state._tag === "Closed") {
    return effect.interrupt;
  }
  const state = self.state;
  const oentry = MutableHashMap.get(state.map, key);
  if (Option.isNone(oentry)) {
    return effect.undefined;
  } else if (hasExpired(oentry.value, fiber)) {
    MutableHashMap.remove(state.map, key);
    return effect.as(Scope.close(oentry.value.scope, effect.exitVoid), undefined);
  } else if (isRead) {
    MutableHashMap.remove(state.map, key);
    MutableHashMap.set(state.map, key, oentry.value);
  }
  return effect.succeed(oentry.value);
};
/**
 * Retrieves the value associated with the specified key from the cache, only if
 * it contains a resolved successful value.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const getSuccess = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptible(core.withFiber(fiber => effect.map(getImpl(self, key, fiber), entry => {
  const exit = entry?.deferred.effect;
  if (exit && effect.exitIsSuccess(exit)) {
    return Option.some(exit.value);
  }
  return Option.none();
}))));
/**
 * Sets the value associated with the specified key in the cache. This will
 * overwrite any existing value for that key, skipping the lookup function.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => effect.uninterruptible(core.withFiber(fiber => {
  if (self.state._tag === "Closed") {
    return effect.interrupt;
  }
  const oentry = MutableHashMap.get(self.state.map, key);
  const state = self.state;
  const exit = core.exitSucceed(value);
  const deferred = Deferred.makeUnsafe();
  Deferred.doneUnsafe(deferred, exit);
  const ttl = self.timeToLive(exit, key);
  MutableHashMap.set(state.map, key, {
    scope: Scope.makeUnsafe(),
    deferred,
    expiresAt: Duration.isFinite(ttl) ? fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl) : undefined
  });
  const check = checkCapacity(fiber, state.map, self.capacity);
  return Option.isSome(oentry) ? effect.flatMap(Scope.close(oentry.value.scope, effect.exitVoid), () => check) : check;
})));
/**
 * Checks if the cache contains an entry for the specified key.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const has = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptible(core.withFiber(fiber => effect.map(getImpl(self, key, fiber, false), Predicate.isNotUndefined))));
/**
 * Invalidates the entry associated with the specified key in the cache.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidate = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptible(effect.suspend(() => {
  if (self.state._tag === "Closed") {
    return effect.interrupt;
  }
  const oentry = MutableHashMap.get(self.state.map, key);
  if (Option.isNone(oentry)) {
    return effect.void;
  }
  MutableHashMap.remove(self.state.map, key);
  return Scope.close(oentry.value.scope, effect.exitVoid);
})));
/**
 * Conditionally invalidates the entry associated with the specified key in the cache
 * if the predicate returns true for the cached value.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidateWhen = /*#__PURE__*/dual(3, (self, key, f) => effect.uninterruptibleMask(restore => core.withFiber(fiber => effect.flatMap(getImpl(self, key, fiber, false), entry => {
  if (entry === undefined) {
    return effect.succeed(false);
  }
  return restore(Deferred.await(entry.deferred)).pipe(effect.flatMap(value => {
    if (self.state._tag === "Closed") {
      return effect.succeed(false);
    } else if (f(value)) {
      MutableHashMap.remove(self.state.map, key);
      return effect.as(Scope.close(entry.scope, effect.exitVoid), true);
    }
    return effect.succeed(false);
  }), effect.catch_(() => effect.succeed(false)));
}))));
/**
 * Forces a refresh of the value associated with the specified key in the cache.
 *
 * It will always invoke the lookup function to construct a new value,
 * overwriting any existing value for that key.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const refresh = /*#__PURE__*/dual(2, (self, key) => effect.uninterruptibleMask(effect.fnUntraced(function* (restore) {
  if (self.state._tag === "Closed") return yield* effect.interrupt;
  const fiber = Fiber.getCurrent();
  const scope = Scope.makeUnsafe();
  const deferred = Deferred.makeUnsafe();
  const entry = {
    scope,
    expiresAt: undefined,
    deferred
  };
  const newEntry = !MutableHashMap.has(self.state.map, key);
  if (newEntry) {
    MutableHashMap.set(self.state.map, key, entry);
    yield* checkCapacity(fiber, self.state.map, self.capacity);
  }
  const exit = yield* effect.exit(restore(Scope.provide(self.lookup(key), scope)));
  Deferred.doneUnsafe(deferred, exit);
  // @ts-ignore async gap
  if (self.state._tag === "Closed") {
    if (!newEntry) {
      yield* Scope.close(scope, effect.exitVoid);
    }
    return yield* effect.interrupt;
  }
  const ttl = self.timeToLive(exit, key);
  entry.expiresAt = Duration.isFinite(ttl) ? fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe() + Duration.toMillis(ttl) : undefined;
  if (!newEntry) {
    const oentry = MutableHashMap.get(self.state.map, key);
    MutableHashMap.set(self.state.map, key, entry);
    if (Option.isSome(oentry)) {
      yield* Scope.close(oentry.value.scope, effect.exitVoid);
    }
  }
  return yield* exit;
})));
/**
 * Invalidates all entries in the cache.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const invalidateAll = self => core.withFiber(parent => {
  if (self.state._tag === "Closed") {
    return effect.interrupt;
  }
  return invalidateAllImpl(parent, self.state.map);
});
const invalidateAllImpl = (parent, map) => {
  const fibers = Arr.empty();
  for (const [, entry] of map) {
    fibers.push(effect.forkUnsafe(parent, Scope.close(entry.scope, effect.exitVoid), true, true));
  }
  MutableHashMap.clear(map);
  return effect.fiberAwaitAll(fibers);
};
/**
 * Retrieves the approximate number of entries in the cache.
 *
 * Note that expired entries are counted until they are accessed and removed.
 * The size reflects the current number of entries stored, not the number
 * of valid entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const size = self => effect.sync(() => self.state._tag === "Closed" ? 0 : MutableHashMap.size(self.state.map));
/**
 * Retrieves all active keys from the cache, automatically filtering out expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const keys = self => core.withFiber(fiber => {
  if (self.state._tag === "Closed") return effect.succeed([]);
  const state = self.state;
  const now = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe();
  const fibers = Arr.empty();
  const keys = [];
  for (const [key, entry] of state.map) {
    if (entry.expiresAt === undefined || entry.expiresAt > now) {
      keys.push(key);
    } else {
      MutableHashMap.remove(state.map, key);
      fibers.push(effect.forkUnsafe(fiber, Scope.close(entry.scope, effect.exitVoid), true, true));
    }
  }
  return fibers.length === 0 ? effect.succeed(keys) : effect.as(effect.fiberAwaitAll(fibers), keys);
});
/**
 * Retrieves all successfully cached values from the cache, excluding failed
 * lookups and expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const values = self => effect.map(entries(self), Arr.map(([, value]) => value));
/**
 * Retrieves all key-value pairs from the cache as an iterable. This function
 * only returns entries with successfully resolved values, filtering out any
 * failed lookups or expired entries.
 *
 * @since 4.0.0
 * @category Combinators
 */
export const entries = self => core.withFiber(fiber => {
  if (self.state._tag === "Closed") return effect.succeed([]);
  const state = self.state;
  const now = fiber.getRef(effect.ClockRef).currentTimeMillisUnsafe();
  const fibers = Arr.empty();
  const arr = [];
  for (const [key, entry] of state.map) {
    if (entry.expiresAt === undefined || entry.expiresAt > now) {
      const exit = entry.deferred.effect;
      if (core.isExit(exit) && !effect.exitIsFailure(exit)) {
        arr.push([key, exit.value]);
      }
    } else {
      MutableHashMap.remove(state.map, key);
      fibers.push(effect.forkUnsafe(fiber, Scope.close(entry.scope, effect.exitVoid), true, true));
    }
  }
  return fibers.length === 0 ? effect.succeed(arr) : effect.as(effect.fiberAwaitAll(fibers), arr);
});
//# sourceMappingURL=ScopedCache.js.map