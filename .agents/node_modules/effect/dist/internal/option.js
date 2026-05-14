/**
 * @since 2.0.0
 */
import * as Equal from "../Equal.js";
import { format } from "../Formatter.js";
import * as Hash from "../Hash.js";
import { toJson } from "../Inspectable.js";
import { hasProperty } from "../Predicate.js";
import { exitFail, exitSucceed, NoSuchElementError, PipeInspectableProto, YieldableProto } from "./core.js";
const TypeId = "~effect/data/Option";
const CommonProto = {
  [TypeId]: {
    _A: _ => _
  },
  ...PipeInspectableProto,
  ...YieldableProto
};
const SomeProto = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(CommonProto), {
  _tag: "Some",
  _op: "Some",
  [Equal.symbol](that) {
    return isOption(that) && isSome(that) && Equal.equals(this.value, that.value);
  },
  [Hash.symbol]() {
    return Hash.combine(Hash.hash(this._tag))(Hash.hash(this.value));
  },
  toString() {
    return `some(${format(this.value)})`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag,
      value: toJson(this.value)
    };
  },
  asEffect() {
    return exitSucceed(this.value);
  }
});
Object.defineProperty(SomeProto, "valueOrUndefined", {
  get() {
    return this.value;
  }
});
const NoneHash = /*#__PURE__*/Hash.hash("None");
const NoneProto = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(CommonProto), {
  _tag: "None",
  _op: "None",
  valueOrUndefined: undefined,
  [Equal.symbol](that) {
    return isOption(that) && isNone(that);
  },
  [Hash.symbol]() {
    return NoneHash;
  },
  toString() {
    return `none()`;
  },
  toJSON() {
    return {
      _id: "Option",
      _tag: this._tag
    };
  },
  asEffect() {
    return exitFail(new NoSuchElementError());
  }
});
/** @internal */
export const isOption = input => hasProperty(input, TypeId);
/** @internal */
export const isNone = fa => fa._tag === "None";
/** @internal */
export const isSome = fa => fa._tag === "Some";
/** @internal */
export const none = /*#__PURE__*/Object.create(NoneProto);
/** @internal */
export const some = value => {
  const a = Object.create(SomeProto);
  a.value = value;
  return a;
};
//# sourceMappingURL=option.js.map