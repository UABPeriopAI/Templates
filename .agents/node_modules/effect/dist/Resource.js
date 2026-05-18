/**
 * @since 2.0.0
 */
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import { identity } from "./Function.js";
import { PipeInspectableProto } from "./internal/core.js";
import { hasProperty } from "./Predicate.js";
import * as ScopedRef from "./ScopedRef.js";
const TypeId = "~effect/Resource";
/**
 * @since 2.0.0
 * @category guards
 */
export const isResource = u => hasProperty(u, TypeId);
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  toJSON() {
    return {
      _id: "Resource"
    };
  }
};
const makeUnsafe = (scopedRef, acquire) => {
  const self = Object.create(Proto);
  self.scopedRef = scopedRef;
  self.acquire = acquire;
  return self;
};
/**
 * Creates a `Resource` that must be refreshed manually.
 *
 * @since 2.0.0
 * @category constructors
 */
export const manual = acquire => Effect.contextWith(context => {
  const providedAcquire = Effect.updateContext(acquire, input => Context.merge(context, input));
  return Effect.map(ScopedRef.fromAcquire(Effect.exit(providedAcquire)), scopedRef => makeUnsafe(scopedRef, providedAcquire));
});
/**
 * Creates a `Resource` that refreshes automatically according to the supplied
 * schedule.
 *
 * @since 2.0.0
 * @category constructors
 */
export const auto = (acquire, policy) => Effect.tap(manual(acquire), self => Effect.forkScoped(Effect.repeat(refresh(self), policy)));
/**
 * Retrieves the current value stored in this resource.
 *
 * @since 2.0.0
 * @category getters
 */
export const get = self => Effect.flatMap(ScopedRef.get(self.scopedRef), identity);
/**
 * Refreshes this resource.
 *
 * @since 2.0.0
 * @category utils
 */
export const refresh = self => ScopedRef.set(self.scopedRef, Effect.map(self.acquire, Exit.succeed));
//# sourceMappingURL=Resource.js.map