/**
 * @since 2.0.0
 */
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import { dual } from "./Function.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as Scope from "./Scope.js";
import * as Synchronized from "./SynchronizedRef.js";
const TypeId = "~effect/ScopedRef";
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  toJSON() {
    return {
      _id: "ScopedRef",
      value: this.backing.backing.ref.current[1]
    };
  }
};
const makeUnsafe = (scope, value) => {
  const self = Object.create(Proto);
  self.backing = Synchronized.makeUnsafe([scope, value]);
  return self;
};
/**
 * Creates a new `ScopedRef` from an effect that resourcefully produces a
 * value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromAcquire = /*#__PURE__*/Effect.fnUntraced(function* (acquire) {
  const scope = Scope.makeUnsafe();
  const value = yield* acquire.pipe(Scope.provide(scope), Effect.tapCause(cause => Scope.close(scope, Exit.failCause(cause))));
  const self = makeUnsafe(scope, value);
  yield* Effect.addFinalizer(exit => Scope.close(self.backing.backing.ref.current[0], exit));
  return self;
}, Effect.uninterruptible);
/**
 * Retrieves the current value of the scoped reference.
 *
 * @since 4.0.0
 * @category getters
 */
export const getUnsafe = self => self.backing.backing.ref.current[1];
/**
 * Retrieves the current value of the scoped reference.
 *
 * @since 2.0.0
 * @category getters
 */
export const get = self => Effect.sync(() => getUnsafe(self));
/**
 * Creates a new `ScopedRef` from the specified value. This method should
 * not be used for values whose creation require the acquisition of resources.
 *
 * @since 2.0.0
 * @category constructors
 */
export const make = evaluate => Effect.suspend(() => {
  const scope = Scope.makeUnsafe();
  const value = evaluate();
  const self = makeUnsafe(scope, value);
  return Effect.as(Effect.addFinalizer(exit => Scope.close(self.backing.backing.ref.current[0], exit)), self);
});
/**
 * Sets the value of this reference to the specified resourcefully-created
 * value. Any resources associated with the old value will be released.
 *
 * This method will not return until either the reference is successfully
 * changed to the new value, with old resources released, or until the attempt
 * to acquire a new value fails.
 *
 * @since 2.0.0
 * @category getters
 */
export const set = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, acquire) {
  yield* Scope.close(self.backing.backing.ref.current[0], Exit.void);
  const scope = Scope.makeUnsafe();
  const value = yield* acquire.pipe(Scope.provide(scope), Effect.tapCause(cause => Scope.close(scope, Exit.failCause(cause))));
  self.backing.backing.ref.current = [scope, value];
}, Effect.uninterruptible, (effect, self) => self.backing.semaphore.withPermit(effect)));
//# sourceMappingURL=ScopedRef.js.map