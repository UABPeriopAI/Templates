/**
 * @since 4.0.0
 */
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import * as MutableHashMap from "./MutableHashMap.js";
import * as Option from "./Option.js";
/**
 * @since 4.0.0
 * @category models
 */
export const PartitionedTypeId = "~effect/PartitionedSemaphore";
/**
 * Creates a `PartitionedSemaphore` unsafely.
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeUnsafe = options => {
  const maxPermits = Math.max(0, options.permits);
  if (!Number.isFinite(maxPermits)) {
    return {
      [PartitionedTypeId]: PartitionedTypeId,
      capacity: maxPermits,
      available: Effect.succeed(maxPermits),
      take: () => Effect.void,
      release: () => Effect.succeed(maxPermits),
      withPermits: () => effect => effect,
      withPermit: () => effect => effect,
      withPermitsIfAvailable: () => effect => Effect.asSome(effect)
    };
  }
  let totalPermits = maxPermits;
  let waitingPermits = 0;
  const partitions = MutableHashMap.empty();
  let iterator = partitions[Symbol.iterator]();
  const releaseUnsafe = permits => {
    while (permits > 0) {
      if (waitingPermits === 0) {
        totalPermits = Math.min(maxPermits, totalPermits + permits);
        return totalPermits;
      }
      let state = iterator.next();
      if (state.done) {
        iterator = partitions[Symbol.iterator]();
        state = iterator.next();
        if (state.done) {
          return totalPermits;
        }
      }
      const waiter = state.value[1].values().next().value;
      if (waiter === undefined) {
        continue;
      }
      waiter.permits -= 1;
      waitingPermits -= 1;
      if (waiter.permits === 0) {
        waiter.resume();
      }
      permits -= 1;
    }
    return totalPermits;
  };
  const take = (key, permits) => {
    if (permits <= 0) {
      return Effect.void;
    }
    return Effect.callback(resume => {
      if (maxPermits < permits) {
        resume(Effect.never);
        return;
      }
      if (totalPermits >= permits) {
        totalPermits -= permits;
        resume(Effect.void);
        return;
      }
      const needed = permits - totalPermits;
      const taken = permits - needed;
      if (totalPermits > 0) {
        totalPermits = 0;
      }
      waitingPermits += needed;
      const waiters = Option.getOrElse(MutableHashMap.get(partitions, key), () => {
        const set = new Set();
        MutableHashMap.set(partitions, key, set);
        return set;
      });
      const entry = {
        permits: needed,
        resume: () => {
          cleanup();
          resume(Effect.void);
        }
      };
      const cleanup = () => {
        waiters.delete(entry);
        if (waiters.size === 0) {
          MutableHashMap.remove(partitions, key);
        }
      };
      waiters.add(entry);
      return Effect.sync(() => {
        cleanup();
        waitingPermits -= entry.permits;
        if (taken > 0) {
          releaseUnsafe(taken);
        }
      });
    });
  };
  const withPermits = (key, permits) => effect => {
    if (permits <= 0) {
      return effect;
    }
    const takePermits = take(key, permits);
    return Effect.uninterruptibleMask(restore => Effect.flatMap(restore(takePermits), () => Effect.ensuring(restore(effect), Effect.sync(() => {
      releaseUnsafe(permits);
    }))));
  };
  const tryTake = permits => {
    if (permits <= 0) {
      return true;
    }
    if (maxPermits < permits || totalPermits < permits) {
      return false;
    }
    totalPermits -= permits;
    return true;
  };
  return {
    [PartitionedTypeId]: PartitionedTypeId,
    capacity: maxPermits,
    available: Effect.sync(() => totalPermits),
    take,
    release: permits => Effect.sync(() => releaseUnsafe(permits)),
    withPermits,
    withPermit: key => withPermits(key, 1),
    withPermitsIfAvailable: permits => effect => {
      if (permits <= 0) {
        return Effect.asSome(effect);
      }
      return Effect.suspend(() => {
        if (!tryTake(permits)) {
          return Effect.succeed(Option.none());
        }
        return Effect.ensuring(Effect.asSome(effect), Effect.sync(() => {
          releaseUnsafe(permits);
        }));
      });
    }
  };
};
/**
 * Creates a `PartitionedSemaphore`.
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = options => Effect.sync(() => makeUnsafe(options));
/**
 * Gets the current number of available permits.
 *
 * @since 4.0.0
 * @category combinators
 */
export const available = self => self.available;
/**
 * Gets the total capacity.
 *
 * @since 4.0.0
 * @category getters
 */
export const capacity = self => self.capacity;
/**
 * Acquires permits for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export const take = /*#__PURE__*/dual(3, (self, key, permits) => self.take(key, permits));
/**
 * Releases permits back to the shared pool.
 *
 * @since 4.0.0
 * @category combinators
 */
export const release = /*#__PURE__*/dual(2, (self, permits) => self.release(permits));
/**
 * Runs an effect with permits for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermits = (...args) => {
  if (args.length === 3) {
    const [self, key, permits] = args;
    return effect => self.withPermits(key, permits)(effect);
  }
  const [self, key, permits, effect] = args;
  return self.withPermits(key, permits)(effect);
};
/**
 * Runs an effect with a single permit for a partition.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermit = (...args) => {
  if (args.length === 2) {
    const [self, key] = args;
    return effect => self.withPermit(key)(effect);
  }
  const [self, key, effect] = args;
  return self.withPermit(key)(effect);
};
/**
 * Runs an effect only if the permits are immediately available.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withPermitsIfAvailable = (...args) => {
  if (args.length === 2) {
    const [self, permits] = args;
    return effect => self.withPermitsIfAvailable(permits)(effect);
  }
  const [self, permits, effect] = args;
  return self.withPermitsIfAvailable(permits)(effect);
};
//# sourceMappingURL=PartitionedSemaphore.js.map