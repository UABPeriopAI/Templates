/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import * as Equal from "../../Equal.js";
import * as Exit from "../../Exit.js";
import { constTrue, dual, identity } from "../../Function.js";
import * as Hash from "../../Hash.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import { hasProperty, isIterable } from "../../Predicate.js";
import * as Result from "../../Result.js";
import * as Schema_ from "../../Schema.js";
import * as SchemaIssue from "../../SchemaIssue.js";
import * as SchemaParser from "../../SchemaParser.js";
import * as SchemaTransformation from "../../SchemaTransformation.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/reactivity/AsyncResult";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isAsyncResult = u => hasProperty(u, TypeId);
const ResultProto = {
  [TypeId]: {
    E: identity,
    A: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
  [Equal.symbol](that) {
    if (this._tag !== that._tag || this.waiting !== that.waiting) {
      return false;
    }
    switch (this._tag) {
      case "Initial":
        return true;
      case "Success":
        return Equal.equals(this.value, that.value);
      case "Failure":
        return Equal.equals(this.cause, that.cause);
    }
  },
  [Hash.symbol]() {
    const tagHash = Hash.string(`${this._tag}:${this.waiting}`);
    if (this._tag === "Initial") {
      return tagHash;
    }
    return Hash.combine(tagHash)(this._tag === "Success" ? Hash.hash(this.value) : Hash.hash(this.cause));
  }
};
/**
 * @since 4.0.0
 * @category refinements
 */
export const isWaiting = result => result.waiting;
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromExit = exit => exit._tag === "Success" ? success(exit.value) : failure(exit.cause);
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromExitWithPrevious = (exit, previous) => exit._tag === "Success" ? success(exit.value) : failureWithPrevious(exit.cause, {
  previous
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const waitingFrom = previous => {
  if (previous._tag === "None") {
    return initial(true);
  }
  return waiting(previous.value);
};
/**
 * @since 4.0.0
 * @category refinements
 */
export const isInitial = result => result._tag === "Initial";
/**
 * @since 4.0.0
 * @category refinements
 */
export const isNotInitial = result => result._tag !== "Initial";
/**
 * @since 4.0.0
 * @category constructors
 */
export const initial = (waiting = false) => {
  const result = Object.create(ResultProto);
  result._tag = "Initial";
  result.waiting = waiting;
  return result;
};
/**
 * @since 4.0.0
 * @category refinements
 */
export const isSuccess = result => result._tag === "Success";
/**
 * @since 4.0.0
 * @category constructors
 */
export const success = (value, options) => {
  const result = Object.create(ResultProto);
  result._tag = "Success";
  result.value = value;
  result.waiting = options?.waiting ?? false;
  result.timestamp = options?.timestamp ?? Date.now();
  return result;
};
/**
 * @since 4.0.0
 * @category refinements
 */
export const isFailure = result => result._tag === "Failure";
/**
 * @since 4.0.0
 * @category refinements
 */
export const isInterrupted = result => result._tag === "Failure" && Cause.hasInterruptsOnly(result.cause);
/**
 * @since 4.0.0
 * @category constructors
 */
export const failure = (cause, options) => {
  const result = Object.create(ResultProto);
  result._tag = "Failure";
  result.cause = cause;
  result.previousSuccess = options?.previousSuccess ?? Option.none();
  result.waiting = options?.waiting ?? false;
  return result;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const failureWithPrevious = (cause, options) => failure(cause, {
  previousSuccess: Option.flatMap(options.previous, result => isSuccess(result) ? Option.some(result) : isFailure(result) ? result.previousSuccess : Option.none()),
  waiting: options.waiting
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const fail = (error, options) => failure(Cause.fail(error), options);
/**
 * @since 4.0.0
 * @category constructors
 */
export const failWithPrevious = (error, options) => failureWithPrevious(Cause.fail(error), options);
/**
 * @since 4.0.0
 * @category constructors
 */
export const waiting = (self, options) => {
  if (self.waiting) {
    return options?.touch ? touch(self) : self;
  }
  const result = Object.assign(Object.create(ResultProto), self);
  result.waiting = true;
  if (options?.touch && isSuccess(result)) {
    ;
    result.timestamp = Date.now();
  }
  return result;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const touch = result => {
  if (isSuccess(result)) {
    return success(result.value, {
      waiting: result.waiting
    });
  }
  return result;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const replacePrevious = (self, previous) => {
  if (self._tag === "Failure") {
    return failureWithPrevious(self.cause, {
      previous,
      waiting: self.waiting
    });
  }
  return self;
};
/**
 * @since 4.0.0
 * @category accessors
 */
export const value = self => {
  if (self._tag === "Success") {
    return Option.some(self.value);
  } else if (self._tag === "Failure") {
    return Option.map(self.previousSuccess, s => s.value);
  }
  return Option.none();
};
/**
 * @since 4.0.0
 * @category accessors
 */
export const getOrElse = /*#__PURE__*/dual(2, (self, orElse) => Option.getOrElse(value(self), orElse));
/**
 * @since 4.0.0
 * @category accessors
 */
export const getOrThrow = self => Option.getOrThrowWith(value(self), () => new Cause.NoSuchElementError("AsyncResult.getOrThrow: no value found"));
/**
 * @since 4.0.0
 * @category accessors
 */
export const cause = self => self._tag === "Failure" ? Option.some(self.cause) : Option.none();
/**
 * @since 4.0.0
 * @category accessors
 */
export const error = self => self._tag === "Failure" ? Cause.findErrorOption(self.cause) : Option.none();
/**
 * @since 4.0.0
 * @category combinators
 */
export const toExit = self => {
  switch (self._tag) {
    case "Success":
      {
        return Exit.succeed(self.value);
      }
    case "Failure":
      {
        return Exit.failCause(self.cause);
      }
    default:
      {
        return Exit.fail(new Cause.NoSuchElementError());
      }
  }
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const map = /*#__PURE__*/dual(2, (self, f) => {
  switch (self._tag) {
    case "Initial":
      return self;
    case "Failure":
      return failure(self.cause, {
        previousSuccess: Option.map(self.previousSuccess, s => success(f(s.value), s)),
        waiting: self.waiting
      });
    case "Success":
      return success(f(self.value), self);
  }
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const flatMap = /*#__PURE__*/dual(2, (self, f) => {
  switch (self._tag) {
    case "Initial":
      return self;
    case "Failure":
      return failure(self.cause, {
        previousSuccess: Option.flatMap(self.previousSuccess, s => {
          const next = f(s.value, s);
          return isSuccess(next) ? Option.some(next) : Option.none();
        }),
        waiting: self.waiting
      });
    case "Success":
      return f(self.value, self);
  }
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const match = /*#__PURE__*/dual(2, (self, options) => {
  switch (self._tag) {
    case "Initial":
      return options.onInitial(self);
    case "Failure":
      return options.onFailure(self);
    case "Success":
      return options.onSuccess(self);
  }
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const matchWithError = /*#__PURE__*/dual(2, (self, options) => {
  switch (self._tag) {
    case "Initial":
      return options.onInitial(self);
    case "Failure":
      {
        const result = Cause.findError(self.cause);
        if (Result.isFailure(result)) {
          return options.onDefect(Cause.squash(result.failure), self);
        }
        return options.onError(result.success, self);
      }
    case "Success":
      return options.onSuccess(self);
  }
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const matchWithWaiting = /*#__PURE__*/dual(2, (self, options) => {
  if (self.waiting) {
    return options.onWaiting(self);
  }
  switch (self._tag) {
    case "Initial":
      return options.onWaiting(self);
    case "Failure":
      {
        const e = Cause.findError(self.cause);
        if (Result.isFailure(e)) {
          return options.onDefect(Cause.squash(e.failure), self);
        }
        return options.onError(e.success, self);
      }
    case "Success":
      return options.onSuccess(self);
  }
});
/**
 * Combines multiple results into a single result. Also works with non-result
 * values.
 *
 * @since 4.0.0
 * @category combinators
 */
export const all = results => {
  const isIter = isIterable(results);
  const entries = isIter ? Array.from(results, (result, i) => [i, result]) : Object.entries(results);
  const successes = isIter ? [] : {};
  let waiting = false;
  for (let i = 0; i < entries.length; i++) {
    const [key, result] = entries[i];
    if (!isAsyncResult(result)) {
      successes[key] = result;
      continue;
    } else if (!isSuccess(result)) {
      return result;
    }
    successes[key] = result.value;
    if (result.waiting) {
      waiting = true;
    }
  }
  return success(successes, {
    waiting
  });
};
/**
 * @since 4.0.0
 * @category Builder
 */
export const builder = self => new BuilderImpl(self);
class BuilderImpl {
  constructor(result) {
    this.result = result;
  }
  result;
  output = /*#__PURE__*/Option.none();
  when(refinement, f) {
    if (Option.isNone(this.output) && refinement(this.result)) {
      const b = f(this.result);
      if (Option.isSome(b)) {
        ;
        this.output = b;
      }
    }
    return this;
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
  onWaiting(f) {
    return this.when(r => r.waiting, r => Option.some(f(r)));
  }
  onInitialOrWaiting(f) {
    return this.when(r => isInitial(r) || r.waiting, r => Option.some(f(r)));
  }
  onInitial(f) {
    return this.when(isInitial, r => Option.some(f(r)));
  }
  onSuccess(f) {
    return this.when(isSuccess, r => Option.some(f(r.value, r)));
  }
  onFailure(f) {
    return this.when(isFailure, r => Option.some(f(r.cause, r)));
  }
  onError(f) {
    return this.onErrorIf(constTrue, f);
  }
  onErrorIf(refinement, f) {
    return this.when(isFailure, result => Cause.findErrorOption(result.cause).pipe(Option.filter(refinement), Option.map(error => f(error, result))));
  }
  onErrorTag(tag, f) {
    return this.onErrorIf(e => hasProperty(e, "_tag") && (Array.isArray(tag) ? tag.includes(e._tag) : e._tag === tag), f);
  }
  onDefect(f) {
    return this.when(isFailure, result => {
      const defect = Cause.findDefect(result.cause);
      return Result.isFailure(defect) ? Option.none() : Option.some(f(defect.success, result));
    });
  }
  orElse(orElse) {
    return Option.getOrElse(this.output, orElse);
  }
  orNull() {
    return Option.getOrNull(this.output);
  }
  render() {
    if (Option.isSome(this.output)) {
      return this.output.value;
    } else if (isFailure(this.result)) {
      throw Cause.squash(this.result.cause);
    }
    return null;
  }
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export const Schema = options => {
  const success_ = options.success ?? Schema_.Never;
  const error = options.error ?? Schema_.Never;
  const schema = Schema_.declareConstructor()([success_, Schema_.Cause(error, Schema_.Defect)], ([value, cause]) => (input, ast, options) => {
    if (!isAsyncResult(input)) {
      return Effect.fail(new SchemaIssue.InvalidType(ast, Option.some(input)));
    }
    switch (input._tag) {
      case "Initial":
        return Effect.succeed(input);
      case "Success":
        return Effect.mapBothEager(SchemaParser.decodeUnknownEffect(value)(input.value, options), {
          onSuccess: value => success(value, input),
          onFailure: issue => new SchemaIssue.Composite(ast, Option.some(input), [new SchemaIssue.Pointer(["value"], issue)])
        });
      case "Failure":
        {
          const prevSuccessEffect = input.previousSuccess.pipe(Option.map(ps => Effect.mapBothEager(SchemaParser.decodeUnknownEffect(value)(ps.value, options), {
            onSuccess: value => Option.some(success(value, ps)),
            onFailure: issue => new SchemaIssue.Composite(ast, Option.some(input), [new SchemaIssue.Pointer(["previousSuccess", "value"], issue)])
          })), Option.getOrElse(() => Effect.succeedNone));
          const causeEffect = Effect.mapErrorEager(SchemaParser.decodeUnknownEffect(cause)(input.cause, options), issue => new SchemaIssue.Composite(ast, Option.some(input), [new SchemaIssue.Pointer(["cause"], issue)]));
          return Effect.flatMapEager(prevSuccessEffect, previousSuccess => Effect.mapEager(causeEffect, cause => failure(cause, {
            previousSuccess,
            waiting: input.waiting
          })));
        }
    }
  }, {
    expected: "AsyncResult",
    toCodec([value, cause]) {
      const Success = Schema_.TaggedStruct("Success", {
        value,
        waiting: Schema_.Boolean,
        timestamp: Schema_.Number
      });
      return Schema_.link()(Schema_.Union([Schema_.TaggedStruct("Initial", {
        waiting: Schema_.Boolean
      }), Success, Schema_.TaggedStruct("Failure", {
        cause,
        previousSuccess: Schema_.Option(Success),
        waiting: Schema_.Boolean
      })]), SchemaTransformation.transform({
        decode: encoded => {
          switch (encoded._tag) {
            case "Initial":
              return initial(encoded.waiting);
            case "Success":
              return success(encoded.value, {
                waiting: encoded.waiting,
                timestamp: encoded.timestamp
              });
            case "Failure":
              {
                return failure(encoded.cause, {
                  previousSuccess: Option.map(encoded.previousSuccess, ps => success(ps.value, ps)),
                  waiting: encoded.waiting
                });
              }
          }
        },
        encode(result) {
          switch (result._tag) {
            case "Initial":
              return {
                _tag: "Initial",
                waiting: result.waiting
              };
            case "Success":
              return {
                _tag: "Success",
                value: result.value,
                waiting: result.waiting,
                timestamp: result.timestamp
              };
            case "Failure":
              return {
                _tag: "Failure",
                cause: result.cause,
                previousSuccess: result.previousSuccess,
                waiting: result.waiting
              };
          }
        }
      }));
    },
    toEquivalence: Equal.asEquivalence,
    toFormatter: ([value, cause]) => t => {
      switch (t._tag) {
        case "Success":
          return `AsyncResult.Success(${value(t.value)}, ${t.waiting}, ${t.timestamp})`;
        case "Failure":
          return `AsyncResult.Failure(${cause(t.cause)}, ${t.waiting})`;
        case "Initial":
          return `AsyncResult.Initial(${t.waiting}, ${t.waiting})`;
      }
    }
  });
  return Object.assign(schema, {
    success: success_,
    error
  });
};
//# sourceMappingURL=AsyncResult.js.map