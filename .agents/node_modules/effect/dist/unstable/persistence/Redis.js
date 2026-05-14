/**
 * @since 4.0.0
 */
import * as Cache from "../../Cache.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Equal from "../../Equal.js";
import { constant, identity } from "../../Function.js";
import * as Hash from "../../Hash.js";
import * as Schema from "../../Schema.js";
/**
 * @since 4.0.0
 * @category Service
 */
export class Redis extends /*#__PURE__*/Context.Service()("effect/persistence/Redis") {}
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const scriptCache = yield* Cache.make({
    lookup: script => options.send("SCRIPT", "LOAD", script.lua),
    capacity: Number.POSITIVE_INFINITY
  });
  const eval_ = script => (...params) => Effect.flatMap(Cache.get(scriptCache, script), sha => options.send("EVALSHA", sha, script.numberOfKeys(...params).toString(), ...script.params(...params).map(param => String(param))));
  return identity({
    send: options.send,
    eval: eval_
  });
});
const ErrorTypeId = "~effect/persistence/Redis/RedisError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class RedisError extends /*#__PURE__*/Schema.ErrorClass(ErrorTypeId)({
  _tag: /*#__PURE__*/Schema.tag("RedisError"),
  cause: Schema.Defect
}) {
  /**
   * @since 4.0.0
   */
  [ErrorTypeId] = ErrorTypeId;
}
const ScriptTypeId = "~effect/persistence/Redis/Script";
const ScriptProto = {
  [ScriptTypeId]: {
    params: identity,
    result: identity
  },
  withReturnType() {
    return this;
  },
  [Equal.symbol](that) {
    return this === that;
  },
  [Hash.symbol]() {
    return Hash.random(this);
  }
};
/**
 * @since 4.0.0
 * @category Scripting
 */
export const script = (f, options) => Object.assign(Object.create(ScriptProto), {
  ...options,
  params: f,
  numberOfKeys: typeof options.numberOfKeys === "number" ? constant(options.numberOfKeys) : options.numberOfKeys
});
//# sourceMappingURL=Redis.js.map