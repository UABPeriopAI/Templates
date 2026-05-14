import { dual, identity } from "../Function.js";
import * as Option from "../Option.js";
import { pipeArguments } from "../Pipeable.js";
import * as Result from "../Result.js";
/** @internal */
export const TypeId = "~effect/match/Match/Matcher";
const TypeMatcherProto = {
  [TypeId]: {
    _input: identity,
    _filters: identity,
    _remaining: identity,
    _result: identity,
    _return: identity
  },
  _tag: "TypeMatcher",
  add(_case) {
    return makeTypeMatcher([...this.cases, _case]);
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
function makeTypeMatcher(cases) {
  const matcher = Object.create(TypeMatcherProto);
  matcher.cases = cases;
  return matcher;
}
const ValueMatcherProto = {
  [TypeId]: {
    _input: identity,
    _filters: identity,
    _result: identity,
    _return: identity
  },
  _tag: "ValueMatcher",
  add(_case) {
    if (Result.isSuccess(this.value)) {
      return this;
    }
    if (_case._tag === "When" && _case.guard(this.provided) === true) {
      return makeValueMatcher(this.provided, Result.succeed(_case.evaluate(this.provided)));
    } else if (_case._tag === "Not" && _case.guard(this.provided) === false) {
      return makeValueMatcher(this.provided, Result.succeed(_case.evaluate(this.provided)));
    }
    return this;
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
function makeValueMatcher(provided, value) {
  const matcher = Object.create(ValueMatcherProto);
  matcher.provided = provided;
  matcher.value = value;
  return matcher;
}
const makeWhen = (guard, evaluate) => ({
  _tag: "When",
  guard,
  evaluate
});
const makeNot = (guard, evaluate) => ({
  _tag: "Not",
  guard,
  evaluate
});
const makePredicate = pattern => {
  if (typeof pattern === "function") {
    return pattern;
  } else if (Array.isArray(pattern)) {
    const predicates = pattern.map(makePredicate);
    const len = predicates.length;
    return u => {
      if (!Array.isArray(u)) {
        return false;
      }
      for (let i = 0; i < len; i++) {
        if (predicates[i](u[i]) === false) {
          return false;
        }
      }
      return true;
    };
  } else if (pattern !== null && typeof pattern === "object") {
    const keysAndPredicates = Object.entries(pattern).map(([k, p]) => [k, makePredicate(p)]);
    const len = keysAndPredicates.length;
    return u => {
      if (typeof u !== "object" || u === null) {
        return false;
      }
      for (let i = 0; i < len; i++) {
        const [key, predicate] = keysAndPredicates[i];
        if (!(key in u) || predicate(u[key]) === false) {
          return false;
        }
      }
      return true;
    };
  }
  return u => u === pattern;
};
const makeOrPredicate = patterns => {
  const predicates = patterns.map(makePredicate);
  const len = predicates.length;
  return u => {
    for (let i = 0; i < len; i++) {
      if (predicates[i](u) === true) {
        return true;
      }
    }
    return false;
  };
};
const makeAndPredicate = patterns => {
  const predicates = patterns.map(makePredicate);
  const len = predicates.length;
  return u => {
    for (let i = 0; i < len; i++) {
      if (predicates[i](u) === false) {
        return false;
      }
    }
    return true;
  };
};
/** @internal */
export const type = () => makeTypeMatcher([]);
/** @internal */
export const value = i => makeValueMatcher(i, Result.fail(i));
/** @internal */
export const valueTags = /*#__PURE__*/dual(2, (input, fields) => {
  const match = tagsExhaustive(fields)(makeTypeMatcher([]));
  return match(input);
});
/** @internal */
export const typeTags = () => fields => {
  const match = tagsExhaustive(fields)(makeTypeMatcher([]));
  return input => match(input);
};
/** @internal */
export const withReturnType = () => self => self;
/** @internal */
export const when = (pattern, f) => self => self.add(makeWhen(makePredicate(pattern), f));
/** @internal */
export const whenOr = (...args) => self => {
  const onMatch = args[args.length - 1];
  const patterns = args.slice(0, -1);
  return self.add(makeWhen(makeOrPredicate(patterns), onMatch));
};
/** @internal */
export const whenAnd = (...args) => self => {
  const onMatch = args[args.length - 1];
  const patterns = args.slice(0, -1);
  return self.add(makeWhen(makeAndPredicate(patterns), onMatch));
};
/** @internal */
export const discriminator = field => (...pattern) => {
  const f = pattern[pattern.length - 1];
  const values = pattern.slice(0, -1);
  const pred = values.length === 1 ? _ => _ != null && _[field] === values[0] : _ => _ != null && values.includes(_[field]);
  return self => self.add(makeWhen(pred, f));
};
/** @internal */
export const discriminatorStartsWith = field => (pattern, f) => {
  const pred = _ => _ != null && typeof _[field] === "string" && _[field].startsWith(pattern);
  return self => self.add(makeWhen(pred, f));
};
/** @internal */
export const discriminators = field => fields => {
  const predicate = makeWhen(arg => arg != null && arg[field] in fields, data => fields[data[field]](data));
  return self => self.add(predicate);
};
/** @internal */
export const discriminatorsExhaustive = field => fields => {
  const addCases = discriminators(field)(fields);
  return matcher => exhaustive(addCases(matcher));
};
/** @internal */
export const tag = /*#__PURE__*/discriminator("_tag");
/** @internal */
export const tagStartsWith = /*#__PURE__*/discriminatorStartsWith("_tag");
/** @internal */
export const tags = /*#__PURE__*/discriminators("_tag");
/** @internal */
export const tagsExhaustive = /*#__PURE__*/discriminatorsExhaustive("_tag");
/** @internal */
export const not = (pattern, f) => self => self.add(makeNot(makePredicate(pattern), f));
/** @internal */
export const nonEmptyString = u => typeof u === "string" && u.length > 0;
/** @internal */
export const is = (...literals) => {
  const len = literals.length;
  return u => {
    for (let i = 0; i < len; i++) {
      if (u === literals[i]) {
        return true;
      }
    }
    return false;
  };
};
/** @internal */
export const any = () => true;
/** @internal */
export const defined = u => u !== undefined && u !== null;
/** @internal */
export const instanceOf = constructor => u => u instanceof constructor;
/** @internal */
export const instanceOfUnsafe = instanceOf;
/** @internal */
export const orElse = f => self => {
  const toResult = result(self);
  if (Result.isResult(toResult)) {
    return toResult._tag === "Success" ? toResult.success : f(toResult.failure);
  }
  // @ts-expect-error
  return input => {
    const a = toResult(input);
    return Result.isSuccess(a) ? a.success : f(a.failure);
  };
};
/** @internal */
export const orElseAbsurd = self => orElse(() => {
  throw new Error("effect/Match/orElseAbsurd: absurd");
})(self);
/** @internal */
export const result = self => {
  if (self._tag === "ValueMatcher") {
    return self.value;
  }
  const len = self.cases.length;
  if (len === 1) {
    const _case = self.cases[0];
    return input => {
      if (_case._tag === "When" && _case.guard(input) === true) {
        return Result.succeed(_case.evaluate(input));
      } else if (_case._tag === "Not" && _case.guard(input) === false) {
        return Result.succeed(_case.evaluate(input));
      }
      return Result.fail(input);
    };
  }
  return input => {
    for (let i = 0; i < len; i++) {
      const _case = self.cases[i];
      if (_case._tag === "When" && _case.guard(input) === true) {
        return Result.succeed(_case.evaluate(input));
      } else if (_case._tag === "Not" && _case.guard(input) === false) {
        return Result.succeed(_case.evaluate(input));
      }
    }
    return Result.fail(input);
  };
};
/** @internal */
export const option = self => {
  const toResult = result(self);
  if (Result.isResult(toResult)) {
    return Result.match(toResult, {
      onFailure: () => Option.none(),
      onSuccess: Option.some
    });
  }
  return input => Result.match(toResult(input), {
    onFailure: () => Option.none(),
    onSuccess: Option.some
  });
};
const getExhaustiveAbsurdErrorMessage = "effect/match/Match/exhaustive: absurd";
/** @internal */
export const exhaustive = self => {
  const toResult = result(self);
  if (Result.isResult(toResult)) {
    if (Result.isSuccess(toResult)) {
      return toResult.success;
    }
    throw new Error(getExhaustiveAbsurdErrorMessage);
  }
  return u => {
    // @ts-expect-error
    const result = toResult(u);
    if (Result.isSuccess(result)) {
      return result.success;
    }
    throw new Error(getExhaustiveAbsurdErrorMessage);
  };
};
//# sourceMappingURL=matcher.js.map