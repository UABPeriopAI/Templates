import * as Equal from "./Equal.js";
import { constant, dual } from "./Function.js";
import * as Hash from "./Hash.js";
import { exitSucceed, PipeInspectableProto, withFiber, YieldableProto } from "./internal/core.js";
import * as Option from "./Option.js";
import { hasProperty } from "./Predicate.js";
/**
 * @since 4.0.0
 * @category Type Identifiers
 */
export const ServiceTypeId = "~effect/Context/Service";
/**
 * @example
 * ```ts
 * import { Context } from "effect"
 *
 * // Create a simple service
 * const Database = Context.Service<{
 *   query: (sql: string) => string
 * }>("Database")
 *
 * // Create a service class
 * class Config extends Context.Service<Config, {
 *   port: number
 * }>()("Config") {}
 *
 * // Use the services to create contexts
 * const db = Context.make(Database, {
 *   query: (sql) => `Result: ${sql}`
 * })
 * const config = Context.make(Config, { port: 8080 })
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const Service = function () {
  const prevLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 2;
  const err = new Error();
  Error.stackTraceLimit = prevLimit;
  function KeyClass() {}
  const self = KeyClass;
  Object.setPrototypeOf(self, ServiceProto);
  Object.defineProperty(self, "stack", {
    get() {
      return err.stack;
    }
  });
  if (arguments.length > 0) {
    self.key = arguments[0];
    if (arguments[1]?.defaultValue) {
      self[ReferenceTypeId] = ReferenceTypeId;
      self.defaultValue = arguments[1].defaultValue;
    }
    return self;
  }
  return function (key, options) {
    self.key = key;
    if (options?.make) {
      ;
      self.make = options.make;
    }
    return self;
  };
};
const ServiceProto = {
  [ServiceTypeId]: ServiceTypeId,
  ...PipeInspectableProto,
  ...YieldableProto,
  toJSON() {
    return {
      _id: "Service",
      key: this.key,
      stack: this.stack
    };
  },
  asEffect() {
    const fn = this.asEffect = constant(withFiber(fiber => exitSucceed(get(fiber.context, this))));
    return fn();
  },
  of(self) {
    return self;
  },
  context(self) {
    return make(this, self);
  },
  use(f) {
    return withFiber(fiber => f(get(fiber.context, this)));
  },
  useSync(f) {
    return withFiber(fiber => exitSucceed(f(get(fiber.context, this))));
  }
};
const ReferenceTypeId = "~effect/Context/Reference";
const TypeId = "~effect/Context";
/**
 * @example
 * ```ts
 * import { Context } from "effect"
 *
 * // Create a context from a Map (unsafe)
 * const map = new Map([
 *   ["Logger", { log: (msg: string) => console.log(msg) }]
 * ])
 *
 * const context = Context.makeUnsafe(map)
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const makeUnsafe = mapUnsafe => {
  const self = Object.create(Proto);
  self.mapUnsafe = mapUnsafe;
  self.mutable = false;
  return self;
};
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: {
    _Services: _ => _
  },
  toJSON() {
    return {
      _id: "Context",
      services: Array.from(this.mapUnsafe).map(([key, value]) => ({
        key,
        value
      }))
    };
  },
  [Equal.symbol](that) {
    if (!isContext(that) || this.mapUnsafe.size !== that.mapUnsafe.size) return false;
    for (const k of this.mapUnsafe.keys()) {
      if (!that.mapUnsafe.has(k) || !Equal.equals(this.mapUnsafe.get(k), that.mapUnsafe.get(k))) {
        return false;
      }
    }
    return true;
  },
  [Hash.symbol]() {
    return Hash.number(this.mapUnsafe.size);
  }
};
/**
 * Checks if the provided argument is a `Context`.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.strictEqual(Context.isContext(Context.empty()), true)
 * ```
 *
 * @since 4.0.0
 * @category Guards
 */
export const isContext = u => hasProperty(u, TypeId);
/**
 * Checks if the provided argument is a `Key`.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.strictEqual(Context.isKey(Context.Service("Service")), true)
 * ```
 *
 * @since 4.0.0
 * @category Guards
 */
export const isKey = u => hasProperty(u, ServiceTypeId);
/**
 * Checks if the provided argument is a `Reference`.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const LoggerRef = Context.Reference("Logger", {
 *   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
 * })
 *
 * assert.strictEqual(Context.isReference(LoggerRef), true)
 * assert.strictEqual(Context.isReference(Context.Service("Key")), false)
 * ```
 *
 * @since 4.0.0
 * @category Guards
 */
export const isReference = u => hasProperty(u, ReferenceTypeId);
/**
 * Returns an empty `Context`.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.strictEqual(Context.isContext(Context.empty()), true)
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const empty = () => emptyContext;
const emptyContext = /*#__PURE__*/makeUnsafe(/*#__PURE__*/new Map());
/**
 * Creates a new `Context` with a single service associated to the key.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 *
 * const context = Context.make(Port, { PORT: 8080 })
 *
 * assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
 * ```
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = (key, service) => makeUnsafe(new Map([[key.key, service]]));
/**
 * Adds a service to a given `Context`.
 *
 * @example
 * ```ts
 * import { pipe, Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const someContext = Context.make(Port, { PORT: 8080 })
 *
 * const context = pipe(
 *   someContext,
 *   Context.add(Timeout, { TIMEOUT: 5000 })
 * )
 *
 * assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
 * assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
 * ```
 *
 * @since 4.0.0
 * @category Adders
 */
export const add = /*#__PURE__*/dual(3, (self, key, service) => withMapUnsafe(self, map => {
  map.set(key.key, service);
}));
/**
 * @since 4.0.0
 * @category Adders
 */
export const addOrOmit = /*#__PURE__*/dual(3, (self, key, service) => withMapUnsafe(self, map => {
  if (service._tag === "None") {
    map.delete(key.key);
  } else {
    map.set(key.key, service.value);
  }
}));
/**
 * Get a service from the context that corresponds to the given key, or
 * use the fallback value.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Logger = Context.Service<{ log: (msg: string) => void }>("Logger")
 * const Database = Context.Service<{ query: (sql: string) => string }>(
 *   "Database"
 * )
 *
 * const context = Context.make(Logger, {
 *   log: (msg: string) => console.log(msg)
 * })
 *
 * const logger = Context.getOrElse(context, Logger, () => ({ log: () => {} }))
 * const database = Context.getOrElse(
 *   context,
 *   Database,
 *   () => ({ query: () => "fallback" })
 * )
 *
 * assert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })
 * assert.deepStrictEqual(database, { query: () => "fallback" })
 * ```
 *
 * @since 4.0.0
 * @category Getters
 */
export const getOrElse = /*#__PURE__*/dual(3, (self, key, orElse) => {
  if (self.mapUnsafe.has(key.key)) {
    return self.mapUnsafe.get(key.key);
  }
  return isReference(key) ? getDefaultValue(key) : orElse();
});
/**
 * @since 4.0.0
 * @category Getters
 */
export const getOrUndefined = /*#__PURE__*/dual(2, (self, key) => self.mapUnsafe.get(key.key));
/**
 * Get a service from the context that corresponds to the given key.
 *
 * This function is unsafe because if the key is not present in the context, a
 * runtime error will be thrown.
 *
 * For a safer version see {@link getOption}.
 *
 * @param self - The `Context` to search for the service.
 * @param service - The `Service` of the service to retrieve.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const context = Context.make(Port, { PORT: 8080 })
 *
 * assert.deepStrictEqual(Context.getUnsafe(context, Port), { PORT: 8080 })
 * assert.throws(() => Context.getUnsafe(context, Timeout))
 * ```
 *
 * @since 4.0.0
 * @category unsafe
 */
export const getUnsafe = /*#__PURE__*/dual(2, (self, service) => {
  if (!self.mapUnsafe.has(service.key)) {
    if (ReferenceTypeId in service) return getDefaultValue(service);
    throw serviceNotFoundError(service);
  }
  return self.mapUnsafe.get(service.key);
});
/**
 * Get a service from the context that corresponds to the given key.
 *
 * @param self - The `Context` to search for the service.
 * @param service - The `Service` of the service to retrieve.
 *
 * @example
 * ```ts
 * import { pipe, Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const context = pipe(
 *   Context.make(Port, { PORT: 8080 }),
 *   Context.add(Timeout, { TIMEOUT: 5000 })
 * )
 *
 * assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
 * ```
 *
 * @since 4.0.0
 * @category Getters
 */
export const get = getUnsafe;
/**
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const LoggerRef = Context.Reference("Logger", {
 *   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
 * })
 *
 * const context = Context.empty()
 * const logger = Context.getReferenceUnsafe(context, LoggerRef)
 *
 * assert.deepStrictEqual(logger, { log: (msg: string) => console.log(msg) })
 * ```
 *
 * @since 4.0.0
 * @category unsafe
 */
export const getReferenceUnsafe = (self, service) => {
  if (!self.mapUnsafe.has(service.key)) {
    return getDefaultValue(service);
  }
  return self.mapUnsafe.get(service.key);
};
const defaultValueCacheKey = "~effect/Context/defaultValue";
const getDefaultValue = ref => {
  if (defaultValueCacheKey in ref) {
    return ref[defaultValueCacheKey];
  }
  return ref[defaultValueCacheKey] = ref.defaultValue();
};
const serviceNotFoundError = service => {
  const error = new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
  if (service.stack) {
    const lines = service.stack.split("\n");
    if (lines.length > 2) {
      const afterAt = lines[2].match(/at (.*)/);
      if (afterAt) {
        error.message = error.message + ` (defined at ${afterAt[1]})`;
      }
    }
  }
  if (error.stack) {
    const lines = error.stack.split("\n");
    lines.splice(1, 3);
    error.stack = lines.join("\n");
  }
  return error;
};
/**
 * Get the value associated with the specified key from the context wrapped in
 * an `Option` object. If the key is not found, the `Option` object will be
 * `None`.
 *
 * @param self - The `Context` to search for the service.
 * @param service - The `Service` of the service to retrieve.
 *
 * @example
 * ```ts
 * import { Option, Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const context = Context.make(Port, { PORT: 8080 })
 *
 * assert.deepStrictEqual(
 *   Context.getOption(context, Port),
 *   Option.some({ PORT: 8080 })
 * )
 * assert.deepStrictEqual(Context.getOption(context, Timeout), Option.none())
 * ```
 *
 * @since 4.0.0
 * @category Getters
 */
export const getOption = /*#__PURE__*/dual(2, (self, service) => {
  if (self.mapUnsafe.has(service.key)) {
    return Option.some(self.mapUnsafe.get(service.key));
  }
  return isReference(service) ? Option.some(getDefaultValue(service)) : Option.none();
});
/**
 * Merges two `Context`s, returning a new `Context` containing the services of both.
 *
 * @param self - The first `Context` to merge.
 * @param that - The second `Context` to merge.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const firstContext = Context.make(Port, { PORT: 8080 })
 * const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
 *
 * const context = Context.merge(firstContext, secondContext)
 *
 * assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
 * assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
 * ```
 *
 * @since 4.0.0
 * @category Utils
 */
export const merge = /*#__PURE__*/dual(2, (self, that) => {
  if (self.mapUnsafe.size === 0) return that;
  if (that.mapUnsafe.size === 0) return self;
  return withMapUnsafe(self, map => {
    that.mapUnsafe.forEach((value, key) => map.set(key, value));
  });
});
/**
 * Merges any number of `Context`s, returning a new `Context` containing the services of all.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 * const Host = Context.Service<{ HOST: string }>("Host")
 *
 * const firstContext = Context.make(Port, { PORT: 8080 })
 * const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
 * const thirdContext = Context.make(Host, { HOST: "localhost" })
 *
 * const context = Context.mergeAll(
 *   firstContext,
 *   secondContext,
 *   thirdContext
 * )
 *
 * assert.deepStrictEqual(Context.get(context, Port), { PORT: 8080 })
 * assert.deepStrictEqual(Context.get(context, Timeout), { TIMEOUT: 5000 })
 * assert.deepStrictEqual(Context.get(context, Host), { HOST: "localhost" })
 * ```
 *
 * @since 3.12.0
 */
export const mergeAll = (...ctxs) => {
  const map = new Map();
  for (let i = 0; i < ctxs.length; i++) {
    ctxs[i].mapUnsafe.forEach((value, key) => {
      map.set(key, value);
    });
  }
  return makeUnsafe(map);
};
/**
 * Returns a new `Context` that contains only the specified services.
 *
 * @param self - The `Context` to prune services from.
 * @param services - The list of `Service`s to be included in the new `Context`.
 *
 * @example
 * ```ts
 * import { Option, pipe, Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const someContext = pipe(
 *   Context.make(Port, { PORT: 8080 }),
 *   Context.add(Timeout, { TIMEOUT: 5000 })
 * )
 *
 * const context = pipe(someContext, Context.pick(Port))
 *
 * assert.deepStrictEqual(
 *   Context.getOption(context, Port),
 *   Option.some({ PORT: 8080 })
 * )
 * assert.deepStrictEqual(Context.getOption(context, Timeout), Option.none())
 * ```
 *
 * @since 4.0.0
 * @category Utils
 */
export const pick = (...services) => self => withMapUnsafe(self, map => {
  const keySet = new Set(services.map(key => key.key));
  map.forEach((_, key) => {
    if (keySet.has(key)) return;
    map.delete(key);
  });
});
/**
 * @example
 * ```ts
 * import { Option, pipe, Context } from "effect"
 * import * as assert from "node:assert"
 *
 * const Port = Context.Service<{ PORT: number }>("Port")
 * const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
 *
 * const someContext = pipe(
 *   Context.make(Port, { PORT: 8080 }),
 *   Context.add(Timeout, { TIMEOUT: 5000 })
 * )
 *
 * const context = pipe(someContext, Context.omit(Timeout))
 *
 * assert.deepStrictEqual(
 *   Context.getOption(context, Port),
 *   Option.some({ PORT: 8080 })
 * )
 * assert.deepStrictEqual(Context.getOption(context, Timeout), Option.none())
 * ```
 *
 * @since 4.0.0
 * @category Utils
 */
export const omit = (...keys) => self => withMapUnsafe(self, map => {
  for (let i = 0; i < keys.length; i++) {
    map.delete(keys[i].key);
  }
});
/**
 * Perform a series of mutations on a `Context`. Prevents unnecessary copying
 * of the underlying map when multiple mutations are needed.
 *
 * @since 4.0.0
 * @category Utils
 */
export const mutate = /*#__PURE__*/dual(2, (self, f) => {
  const next = makeUnsafe(new Map(self.mapUnsafe));
  next.mutable = true;
  const result = f(next);
  result.mutable = false;
  return result;
});
const withMapUnsafe = (self, f) => {
  if (self.mutable) {
    f(self.mapUnsafe);
    return self;
  }
  const map = new Map(self.mapUnsafe);
  f(map);
  return makeUnsafe(map);
};
/**
 * Creates a context key with a default value.
 *
 * **Details**
 *
 * `Context.Reference` allows you to create a key that can hold a value. You
 * can provide a default value for the service, which will automatically be used
 * when the context is accessed, or override it with a custom implementation
 * when needed.
 *
 * @example
 * ```ts
 * import { Context } from "effect"
 *
 * // Create a reference with a default value
 * const LoggerRef = Context.Reference("Logger", {
 *   defaultValue: () => ({ log: (msg: string) => console.log(msg) })
 * })
 *
 * // The reference provides the default value when accessed from an empty context
 * const context = Context.empty()
 * const logger = Context.get(context, LoggerRef)
 *
 * // You can also override the default value
 * const customContext = Context.make(LoggerRef, {
 *   log: (msg: string) => `Custom: ${msg}`
 * })
 * const customLogger = Context.get(customContext, LoggerRef)
 * ```
 *
 * @since 4.0.0
 * @category References
 */
export const Reference = Service;
//# sourceMappingURL=Context.js.map