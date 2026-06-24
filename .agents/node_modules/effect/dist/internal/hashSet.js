/**
 * @since 2.0.0
 */
import * as Equal from "../Equal.js";
import { format } from "../Formatter.js";
import * as Hash from "../Hash.js";
import { NodeInspectSymbol, toJson } from "../Inspectable.js";
import { pipeArguments } from "../Pipeable.js";
import { hasProperty } from "../Predicate.js";
import * as HashMap from "./hashMap.js";
/** @internal */
export const HashSetTypeId = "~effect/collections/HashSet";
const HashSetProto = {
  [Hash.symbol]() {
    return Hash.hash(HashSetTypeId);
  },
  [Equal.symbol](that) {
    return isHashSet(that) && size(this) === size(that) && every(this, value => has(that, value));
  },
  [Symbol.iterator]() {
    return HashMap.keys(keyMap(this));
  },
  toString() {
    return `HashSet(${format(Array.from(this))})`;
  },
  toJSON() {
    return {
      _id: "HashSet",
      values: toJson(Array.from(this))
    };
  },
  [NodeInspectSymbol]() {
    return this.toJSON();
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const makeImpl = keyMap => {
  const set = Object.create(HashSetProto);
  set[HashSetTypeId] = HashSetTypeId;
  set.keyMap = keyMap;
  return set;
};
/** @internal */
export const isHashSet = u => hasProperty(u, HashSetTypeId);
/** @internal */
export const keyMap = self => self.keyMap;
/** @internal */
export const empty = () => makeImpl(HashMap.empty());
/** @internal */
export const make = (...values) => fromIterable(values);
/** @internal */
export const fromIterable = values => {
  let map = HashMap.empty();
  for (const value of values) {
    map = HashMap.set(map, value, true);
  }
  return makeImpl(map);
};
/** @internal */
export const has = (self, value) => HashMap.has(keyMap(self), value);
/** @internal */
export const add = (self, value) => {
  const map = keyMap(self);
  return HashMap.has(map, value) ? self : makeImpl(HashMap.set(map, value, true));
};
/** @internal */
export const remove = (self, value) => {
  const map = keyMap(self);
  return HashMap.has(map, value) ? makeImpl(HashMap.remove(map, value)) : self;
};
/** @internal */
export const size = self => HashMap.size(keyMap(self));
/** @internal */
export const isEmpty = self => HashMap.isEmpty(keyMap(self));
// Helper function for building new HashSets from iteration
const fromPredicate = (self, predicate) => {
  let result = HashMap.empty();
  for (const value of self) {
    if (predicate(value)) {
      result = HashMap.set(result, value, true);
    }
  }
  return makeImpl(result);
};
/** @internal */
export const union = (self, that) => {
  const map = keyMap(self);
  let result = map;
  for (const value of that) {
    result = HashMap.set(result, value, true);
  }
  return makeImpl(result);
};
/** @internal */
export const intersection = (self, that) => {
  let result = HashMap.empty();
  for (const value of self) {
    if (has(that, value)) {
      result = HashMap.set(result, value, true);
    }
  }
  return makeImpl(result);
};
/** @internal */
export const difference = (self, that) => fromPredicate(self, value => !has(that, value));
/** @internal */
export const isSubset = (self, that) => {
  for (const value of self) {
    if (!has(that, value)) {
      return false;
    }
  }
  return true;
};
/** @internal */
export const map = (self, f) => {
  let result = HashMap.empty();
  for (const value of self) {
    result = HashMap.set(result, f(value), true);
  }
  return makeImpl(result);
};
/** @internal */
export const filter = (self, predicate) => fromPredicate(self, predicate);
/** @internal */
export const some = (self, predicate) => {
  for (const value of self) {
    if (predicate(value)) {
      return true;
    }
  }
  return false;
};
/** @internal */
export const every = (self, predicate) => {
  for (const value of self) {
    if (!predicate(value)) {
      return false;
    }
  }
  return true;
};
/** @internal */
export const reduce = (self, zero, f) => {
  let result = zero;
  for (const value of self) {
    result = f(result, value);
  }
  return result;
};
//# sourceMappingURL=hashSet.js.map