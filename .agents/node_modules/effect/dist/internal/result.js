import * as Equal from "../Equal.js";
import { format } from "../Formatter.js";
import { dual } from "../Function.js";
import * as Hash from "../Hash.js";
import { toJson } from "../Inspectable.js";
import { hasProperty } from "../Predicate.js";
import { exitFail, exitSucceed, PipeInspectableProto, YieldableProto } from "./core.js";
import * as option from "./option.js";
const TypeId = "~effect/data/Result";
const CommonProto = {
  [TypeId]: {
    /* v8 ignore next 2 */
    _A: _ => _,
    _E: _ => _
  },
  ...PipeInspectableProto,
  ...YieldableProto
};
const SuccessProto = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(CommonProto), {
  _tag: "Success",
  _op: "Success",
  [Equal.symbol](that) {
    return isResult(that) && isSuccess(that) && Equal.equals(this.success, that.success);
  },
  [Hash.symbol]() {
    return Hash.combine(Hash.hash(this._tag))(Hash.hash(this.success));
  },
  toString() {
    return `success(${format(this.success)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      value: toJson(this.success)
    };
  },
  asEffect() {
    return exitSucceed(this.success);
  }
});
const FailureProto = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(CommonProto), {
  _tag: "Failure",
  _op: "Failure",
  [Equal.symbol](that) {
    return isResult(that) && isFailure(that) && Equal.equals(this.failure, that.failure);
  },
  [Hash.symbol]() {
    return Hash.combine(Hash.hash(this._tag))(Hash.hash(this.failure));
  },
  toString() {
    return `failure(${format(this.failure)})`;
  },
  toJSON() {
    return {
      _id: "Result",
      _tag: this._tag,
      failure: toJson(this.failure)
    };
  },
  asEffect() {
    return exitFail(this.failure);
  }
});
/** @internal */
export const isResult = input => hasProperty(input, TypeId);
/** @internal */
export const isFailure = result => result._tag === "Failure";
/** @internal */
export const isSuccess = result => result._tag === "Success";
/** @internal */
export const fail = failure => {
  const a = Object.create(FailureProto);
  a.failure = failure;
  return a;
};
/** @internal */
export const succeed = success => {
  const a = Object.create(SuccessProto);
  a.success = success;
  return a;
};
/** @internal */
export const getFailure = self => isSuccess(self) ? option.none : option.some(self.failure);
/** @internal */
export const getSuccess = self => isFailure(self) ? option.none : option.some(self.success);
/** @internal */
export const fromOption = /*#__PURE__*/dual(2, (self, onNone) => option.isNone(self) ? fail(onNone()) : succeed(self.value));
//# sourceMappingURL=result.js.map