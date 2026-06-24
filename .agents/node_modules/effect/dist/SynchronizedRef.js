/**
 * @since 2.0.0
 */
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as Option from "./Option.js";
import * as Ref from "./Ref.js";
import * as Semaphore from "./Semaphore.js";
const TypeId = "~effect/SynchronizedRef";
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  toJSON() {
    return {
      _id: "SynchronizedRef",
      value: this.backing.ref.current
    };
  }
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeUnsafe = value => {
  const self = Object.create(Proto);
  self.semaphore = Semaphore.makeUnsafe(1);
  self.backing = Ref.makeUnsafe(value);
  return self;
};
/**
 * @since 2.0.0
 * @category constructors
 */
export const make = value => Effect.sync(() => makeUnsafe(value));
/**
 * @since 2.0.0
 * @category getters
 */
export const getUnsafe = self => self.backing.ref.current;
/**
 * @since 2.0.0
 * @category getters
 */
export const get = self => Effect.sync(() => getUnsafe(self));
/**
 * @since 2.0.0
 * @category utils
 */
export const getAndSet = /*#__PURE__*/dual(2, (self, value) => self.semaphore.withPermit(Ref.getAndSet(self.backing, value)));
/**
 * @since 2.0.0
 * @category utils
 */
export const getAndUpdate = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Ref.getAndUpdate(self.backing, f)));
/**
 * @since 2.0.0
 * @category utils
 */
export const getAndUpdateEffect = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.map(f(value), newValue => {
    self.backing.ref.current = newValue;
    return value;
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const getAndUpdateSome = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Ref.getAndUpdateSome(self, pf)));
/**
 * @since 2.0.0
 * @category utils
 */
export const getAndUpdateSomeEffect = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.flatMap(pf(value), option => {
    if (Option.isNone(option)) {
      return Effect.succeed(value);
    }
    self.backing.ref.current = option.value;
    return Effect.succeed(value);
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const modify = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Ref.modify(self.backing, f)));
/**
 * @since 2.0.0
 * @category utils
 */
export const modifyEffect = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.map(f(value), ([b, a]) => {
    self.backing.ref.current = a;
    return b;
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const modifySome = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Ref.modifySome(self.backing, pf)));
/**
 * @since 2.0.0
 * @category utils
 */
export const modifySomeEffect = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.flatMap(pf(value), ([b, maybeA]) => {
    if (Option.isNone(maybeA)) {
      return Effect.succeed(b);
    }
    self.backing.ref.current = maybeA.value;
    return Effect.succeed(b);
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const set = /*#__PURE__*/dual(2, (self, value) => self.semaphore.withPermit(Ref.set(self.backing, value)));
/**
 * @since 2.0.0
 * @category utils
 */
export const setAndGet = /*#__PURE__*/dual(2, (self, value) => self.semaphore.withPermit(Ref.setAndGet(self.backing, value)));
/**
 * @since 2.0.0
 * @category utils
 */
export const update = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Ref.update(self.backing, f)));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateEffect = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.map(f(value), newValue => {
    self.backing.ref.current = newValue;
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateAndGet = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Ref.updateAndGet(self.backing, f)));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateAndGetEffect = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.map(f(value), newValue => {
    self.backing.ref.current = newValue;
    return newValue;
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateSome = /*#__PURE__*/dual(2, (self, f) => self.semaphore.withPermit(Ref.updateSome(self.backing, f)));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateSomeEffect = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.map(pf(value), option => {
    if (Option.isNone(option)) {
      return;
    }
    self.backing.ref.current = option.value;
  });
})));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateSomeAndGet = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Ref.updateSomeAndGet(self.backing, pf)));
/**
 * @since 2.0.0
 * @category utils
 */
export const updateSomeAndGetEffect = /*#__PURE__*/dual(2, (self, pf) => self.semaphore.withPermit(Effect.suspend(() => {
  const value = getUnsafe(self);
  return Effect.flatMap(pf(value), option => {
    if (Option.isNone(option)) {
      return Effect.succeed(value);
    }
    self.backing.ref.current = option.value;
    return Effect.succeed(option.value);
  });
})));
//# sourceMappingURL=SynchronizedRef.js.map