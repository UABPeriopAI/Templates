import * as Context from "./Context.js";
import * as Deferred from "./Deferred.js";
import { constant, constTrue, constUndefined, dual, identity } from "./Function.js";
import * as core from "./internal/core.js";
import * as internalEffect from "./internal/effect.js";
import * as internalTracer from "./internal/tracer.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import { CurrentStackFrame } from "./References.js";
import * as Scope from "./Scope.js";
import * as Tracer from "./Tracer.js";
const TypeId = "~effect/Layer";
const MemoMapTypeId = "~effect/Layer/MemoMap";
/**
 * Returns `true` if the specified value is a `Layer`, `false` otherwise.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const dbLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 * })
 * const notALayer = { someProperty: "value" }
 *
 * console.log(Layer.isLayer(dbLayer)) // true
 * console.log(Layer.isLayer(notALayer)) // false
 * ```
 *
 * @since 2.0.0
 * @category getters
 */
export const isLayer = u => hasProperty(u, TypeId);
const LayerProto = {
  [TypeId]: {
    _ROut: identity,
    _E: identity,
    _RIn: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const fromBuildUnsafe = build => {
  const self = Object.create(LayerProto);
  self.build = build;
  return self;
};
/**
 * Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer.
 *
 * The function receives a `MemoMap` for memoization and a `Scope` for resource management.
 * A child scope is created, and if the build fails, the child scope is closed.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const databaseLayer = Layer.fromBuild(() =>
 *   Effect.sync(() =>
 *     Context.make(Database, {
 *       query: (sql: string) => Effect.succeed("result")
 *     })
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromBuild = build => fromBuildUnsafe((memoMap, scope) => {
  const layerScope = Scope.forkUnsafe(scope);
  return internalEffect.onExit(build(memoMap, layerScope), exit => exit._tag === "Failure" ? Scope.close(layerScope, exit) : internalEffect.void);
});
/**
 * Constructs a Layer from a function that uses a `MemoMap` and `Scope` to build the layer,
 * with automatic memoization.
 *
 * This is similar to `fromBuild` but provides automatic memoization of the layer construction.
 * The layer will be memoized based on the provided `MemoMap`.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const databaseLayer = Layer.fromBuildMemo(() =>
 *   Effect.sync(() =>
 *     Context.make(Database, {
 *       query: (sql: string) => Effect.succeed("result")
 *     })
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromBuildMemo = build => {
  const self = fromBuild((memoMap, scope) => memoMap.getOrElseMemoize(self, scope, build));
  return self;
};
class MemoMapImpl {
  get [MemoMapTypeId]() {
    return MemoMapTypeId;
  }
  map = /*#__PURE__*/new Map();
  getOrElseMemoize(layer, scope, build) {
    if (this.map.has(layer)) {
      const entry = this.map.get(layer);
      entry.observers++;
      return internalEffect.andThen(internalEffect.scopeAddFinalizerExit(scope, exit => entry.finalizer(exit)), entry.effect);
    }
    const layerScope = Scope.makeUnsafe();
    const deferred = Deferred.makeUnsafe();
    const entry = {
      observers: 1,
      effect: Deferred.await(deferred),
      finalizer: exit => internalEffect.suspend(() => {
        entry.observers--;
        if (entry.observers === 0) {
          this.map.delete(layer);
          return Scope.close(layerScope, exit);
        }
        return internalEffect.void;
      })
    };
    this.map.set(layer, entry);
    return internalEffect.scopeAddFinalizerExit(scope, entry.finalizer).pipe(internalEffect.flatMap(() => build(this, layerScope)), internalEffect.onExit(exit => {
      entry.effect = exit;
      return Deferred.done(deferred, exit);
    }));
  }
}
/**
 * Constructs a `MemoMap` that can be used to build additional layers.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a memo map for manual layer building
 * const program = Effect.gen(function*() {
 *   const memoMap = Layer.makeMemoMapUnsafe()
 *   const scope = yield* Effect.scope
 *
 *   const dbLayer = Layer.succeed(Database)({
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 *   })
 *   const context = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
 *
 *   return Context.get(context, Database)
 * })
 * ```
 *
 * @since 4.0.0
 * @category memo map
 */
export const makeMemoMapUnsafe = () => new MemoMapImpl();
/**
 * Constructs a `MemoMap` that can be used to build additional layers.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a memo map safely within an Effect
 * const program = Effect.gen(function*() {
 *   const memoMap = yield* Layer.makeMemoMap
 *   const scope = yield* Effect.scope
 *
 *   const dbLayer = Layer.succeed(Database)({
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 *   })
 *   const context = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
 *
 *   return Context.get(context, Database)
 * })
 * ```
 *
 * @since 2.0.0
 * @category memo map
 */
export const makeMemoMap = /*#__PURE__*/internalEffect.sync(makeMemoMapUnsafe);
/**
 * A service reference for the current `MemoMap` used in layer construction.
 *
 * This service provides access to the current memoization map during layer building,
 * allowing layers to share memoized results.
 *
 * @since 3.13.0
 * @category models
 */
export class CurrentMemoMap extends /*#__PURE__*/Context.Service()("effect/Layer/CurrentMemoMap") {
  static getOrCreate = /*#__PURE__*/Context.getOrElse(this, makeMemoMapUnsafe);
}
/**
 * Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize
 * the layer construction.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Build layers with explicit memoization control
 * const program = Effect.gen(function*() {
 *   const memoMap = yield* Layer.makeMemoMap
 *   const scope = yield* Effect.scope
 *
 *   // Build database layer with memoization
 *   const dbLayer = Layer.succeed(Database)({
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 *   })
 *   const dbContext = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
 *
 *   // Build logger layer with same memoization (reuses memo if same layer)
 *   const loggerLayer = Layer.succeed(Logger)({
 *     log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
 *   })
 *   const loggerContext = yield* Layer.buildWithMemoMap(
 *     loggerLayer,
 *     memoMap,
 *     scope
 *   )
 *
 *   return {
 *     database: Context.get(dbContext, Database),
 *     logger: Context.get(loggerContext, Logger)
 *   }
 * })
 * ```
 *
 * @since 2.0.0
 * @category memo map
 */
export const buildWithMemoMap = /*#__PURE__*/dual(3, (self, memoMap, scope) => internalEffect.provideService(internalEffect.map(self.build(memoMap, scope), Context.add(CurrentMemoMap, memoMap)), CurrentMemoMap, memoMap));
/**
 * Builds a layer into a scoped value.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Build a layer to get its services
 * const program = Effect.gen(function*() {
 *   const dbLayer = Layer.succeed(Database)({
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 *   })
 *
 *   // Build the layer into Context - automatically manages scope and memoization
 *   const context = yield* Layer.build(dbLayer)
 *
 *   // Extract the specific service from the built layer
 *   const database = Context.get(context, Database)
 *
 *   return yield* database.query("SELECT * FROM users")
 * })
 * ```
 *
 * @since 2.0.0
 * @category destructors
 */
export const build = self => core.withFiber(fiber => buildWithMemoMap(self, CurrentMemoMap.getOrCreate(fiber.context), Context.getUnsafe(fiber.context, Scope.Scope)));
/**
 * Builds a layer into an `Effect` value. Any resources associated with this
 * layer will be released when the specified scope is closed unless their scope
 * has been extended. This allows building layers where the lifetime of some of
 * the services output by the layer exceed the lifetime of the effect the
 * layer is provided to.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Scope, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Build a layer with explicit scope control
 * const program = Effect.gen(function*() {
 *   const scope = yield* Effect.scope
 *
 *   const dbLayer = Layer.effect(Database)(Effect.gen(function*() {
 *     console.log("Initializing database...")
 *     yield* Scope.addFinalizer(
 *       scope,
 *       Effect.sync(() => console.log("Database closed"))
 *     )
 *     return { query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Result: ${sql}`)) }
 *   }))
 *
 *   // Build with specific scope - resources tied to this scope
 *   const context = yield* Layer.buildWithScope(dbLayer, scope)
 *   const database = Context.get(context, Database)
 *
 *   return yield* database.query("SELECT * FROM users")
 *   // Database will be closed when scope is closed
 * })
 * ```
 *
 * @since 2.0.0
 * @category destructors
 */
export const buildWithScope = /*#__PURE__*/dual(2, (self, scope) => core.withFiber(fiber => buildWithMemoMap(self, CurrentMemoMap.getOrCreate(fiber.context), scope)));
/**
 * Constructs a layer from the specified value.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Create layers from concrete service implementations
 * const databaseLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Query result: ${sql}`))
 * })
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`)))
 * })
 *
 * // Use the layers in a program
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   yield* logger.log("Starting database query")
 *   const result = yield* database.query("SELECT * FROM users")
 *   yield* logger.log(`Query completed: ${result}`)
 *
 *   return result
 * }).pipe(
 *   Effect.provide(Layer.mergeAll(databaseLayer, loggerLayer))
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const succeed = function () {
  if (arguments.length === 1) {
    return resource => succeedContext(Context.make(arguments[0], resource));
  }
  return succeedContext(Context.make(arguments[0], arguments[1]));
};
/**
 * Constructs a layer from the specified value, which must return one or more
 * services.
 *
 * This is a more general version of `succeed` that allows you to provide multiple
 * services at once through a `Context`.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * const context = Context.make(Database, {
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 * }).pipe(
 *   Context.add(Logger, {
 *     log: (msg: string) => Effect.sync(() => console.log(msg))
 *   })
 * )
 *
 * const layer = Layer.succeedContext(context)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const succeedContext = context => fromBuildUnsafe(constant(internalEffect.succeed(context)));
/**
 * A Layer that constructs an empty Context.
 *
 * This layer provides no services and can be used as a neutral element
 * in layer composition or as a starting point for building layers.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 *
 * const emptyLayer = Layer.empty
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/succeedContext(/*#__PURE__*/Context.empty());
/**
 * Lazily constructs a layer from the specified value.
 *
 * This is a lazy version of `succeed` where the service value is computed
 * synchronously only when the layer is built.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const layer = Layer.sync(Database)(() => ({
 *   query: (sql: string) => Effect.succeed(`Query: ${sql}`)
 * }))
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const sync = function () {
  if (arguments.length === 1) {
    return evaluate => syncContext(() => Context.make(arguments[0], evaluate()));
  }
  return syncContext(() => Context.make(arguments[0], arguments[1]()));
};
/**
 * Lazily constructs a layer from the specified value, which must return one or more
 * services.
 *
 * This is a lazy version of `succeedContext` where the Context is computed
 * synchronously only when the layer is built.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const layer = Layer.syncContext(() =>
 *   Context.make(Database, {
 *     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
 *   })
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const syncContext = evaluate => fromBuildMemo(constant(internalEffect.sync(evaluate)));
/**
 * Constructs a layer from the specified scoped effect.
 *
 * This allows you to create a Layer from an Effect that produces a service.
 * The Effect is executed in the scope of the layer, allowing for proper
 * resource management.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Layer.scoped`
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const layer = Layer.effect(Database)(
 *   Effect.sync(() => ({
 *     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
 *   }))
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const effect = function () {
  if (arguments.length === 1) {
    return effect => effectImpl(arguments[0], effect);
  }
  return effectImpl(arguments[0], arguments[1]);
};
const effectImpl = (service, effect) => effectContext(internalEffect.map(effect, value => Context.make(service, value)));
/**
 * Constructs a layer from the specified scoped effect, which must return one
 * or more services.
 *
 * This allows you to create a Layer from an effectful computation that returns
 * multiple services. The Effect is executed in the scope of the layer.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<
 *   Database,
 *   { readonly query: (sql: string) => Effect.Effect<string> }
 * >()("Database") {}
 *
 * const layer = Layer.effectContext(
 *   Effect.succeed(Context.make(Database, {
 *     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
 *   }))
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const effectContext = effect => fromBuildMemo((_, scope) => Scope.provide(effect, scope));
/**
 * Constructs a layer from the specified scoped effect.
 *
 * This is useful when you want to run an Effect for its side effects during
 * layer construction, but don't need to provide any services.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Layer.scopedDiscard`
 *
 * @example
 * ```ts
 * import { Effect, Layer } from "effect"
 *
 * const initLayer = Layer.effectDiscard(
 *   Effect.sync(() => {
 *     console.log("Initializing application...")
 *   })
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const effectDiscard = effect => effectContext(internalEffect.as(effect, Context.empty()));
/**
 * Lazily constructs a layer using the specified factory.
 *
 * The factory is evaluated only when the suspended layer is first built, and
 * the result is memoized with normal layer sharing semantics.
 *
 * @example
 * ```ts
 * import { Layer, Context } from "effect"
 *
 * class Config extends Context.Service<Config, string>()("Config") {}
 *
 * const useProd = true
 *
 * const layer = Layer.suspend(() =>
 *   useProd
 *     ? Layer.succeed(Config)("https://api.example.com")
 *     : Layer.succeed(Config)("http://localhost:3000")
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const suspend = evaluate => fromBuildMemo((memoMap, scope) => internalEffect.suspend(() => evaluate().build(memoMap, scope)));
/**
 * Unwraps a Layer from an Effect, flattening the nested structure.
 *
 * This is useful when you have an Effect that produces a Layer, and you want to
 * use that Layer directly. The resulting Layer will have the combined error and
 * dependency types from both the outer Effect and the inner Layer.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * const layerEffect = Effect.succeed(
 *   Layer.succeed(Database)({ query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result")) })
 * )
 *
 * const unwrappedLayer = Layer.unwrap(layerEffect)
 * ```
 *
 * @since 4.0.0
 * @category utils
 */
export const unwrap = self => {
  const service = Context.Service("effect/Layer/unwrap");
  return flatMap(effect(service)(self), Context.get(service));
};
const mergeAllEffect = (layers, memoMap, scope) => {
  const parentScope = Scope.forkUnsafe(scope, "parallel");
  return internalEffect.forEach(layers, layer => layer.build(memoMap, Scope.forkUnsafe(parentScope, "sequential")), {
    concurrency: layers.length
  }).pipe(internalEffect.map(context => Context.mergeAll(...context)));
};
/**
 * Combines all the provided layers concurrently, creating a new layer with merged input, error, and output types.
 *
 * All layers are built concurrently, and their outputs are merged into a single layer.
 * This is useful when you need to combine multiple independent layers.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * const dbLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 * })
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
 * })
 *
 * const mergedLayer = Layer.mergeAll(dbLayer, loggerLayer)
 * ```
 *
 * @since 2.0.0
 * @category zipping
 */
export const mergeAll = (...layers) => fromBuild((memoMap, scope) => mergeAllEffect(layers, memoMap, scope));
/**
 * Merges this layer with the specified layer concurrently, producing a new layer with combined input and output types.
 *
 * This is a binary version of `mergeAll` that merges exactly two layers or one layer with an array of layers.
 * The layers are built concurrently and their outputs are combined.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * const dbLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
 * })
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
 * })
 *
 * const mergedLayer = Layer.merge(dbLayer, loggerLayer)
 * ```
 *
 * @since 2.0.0
 * @category zipping
 */
export const merge = /*#__PURE__*/dual(2, (self, that) => mergeAll(self, ...(Array.isArray(that) ? that : [that])));
const provideWith = (self, that, f) => fromBuild((memoMap, scope) => internalEffect.flatMap(Array.isArray(that) ? mergeAllEffect(that, memoMap, scope) : that.build(memoMap, scope), context => self.build(memoMap, scope).pipe(internalEffect.provideContext(context), internalEffect.map(merged => f(merged, context)))));
/**
 * Feeds the output services of this builder into the input of the specified
 * builder, resulting in a new builder with the inputs of this builder as
 * well as any leftover inputs, and the outputs of the specified builder.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class UserService extends Context.Service<UserService, {
 *   readonly getUser: (id: string) => Effect.Effect<{
 *     id: string
 *     name: string
 *   }>
 * }>()("UserService") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Create dependency layers
 * const databaseLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
 * })
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`)))
 * })
 *
 * // UserService depends on Database and Logger
 * const userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   return {
 *     getUser: Effect.fn("UserService.getUser")(function*(id: string) {
 *         yield* logger.log(`Looking up user ${id}`)
 *         const result = yield* database.query(
 *           `SELECT * FROM users WHERE id = ${id}`
 *         )
 *         return { id, name: result }
 *       })
 *   }
 * }))
 *
 * // Provide dependencies to UserService layer
 * const userServiceWithDependencies = userServiceLayer.pipe(
 *   Layer.provide(Layer.mergeAll(databaseLayer, loggerLayer))
 * )
 *
 * // Now UserService layer has no dependencies
 * const program = Effect.gen(function*() {
 *   const userService = yield* UserService
 *   return yield* userService.getUser("123")
 * }).pipe(
 *   Effect.provide(userServiceWithDependencies)
 * )
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const provide = /*#__PURE__*/dual(2, (self, that) => provideWith(self, that, identity));
/**
 * Feeds the output services of this layer into the input of the specified
 * layer, resulting in a new layer with the inputs of this layer, and the
 * outputs of both layers.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * class UserService extends Context.Service<UserService, {
 *   readonly getUser: (id: string) => Effect.Effect<{
 *     id: string
 *     name: string
 *   }>
 * }>()("UserService") {}
 *
 * // Create dependency layers
 * const databaseLayer = Layer.succeed(Database)({
 *   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
 * })
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(`[LOG] ${msg}`)))
 * })
 *
 * // UserService depends on Database and Logger
 * const userServiceLayer = Layer.effect(UserService)(Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   return {
 *     getUser: Effect.fn("UserService.getUser")(function*(id: string) {
 *         yield* logger.log(`Looking up user ${id}`)
 *         const result = yield* database.query(
 *           `SELECT * FROM users WHERE id = ${id}`
 *         )
 *         return { id, name: result }
 *       })
 *   }
 * }))
 *
 * // Provide dependencies and merge all services together
 * const allServicesLayer = userServiceLayer.pipe(
 *   Layer.provideMerge(Layer.mergeAll(databaseLayer, loggerLayer))
 * )
 *
 * // Now the resulting layer provides UserService, Database, AND Logger
 * const program = Effect.gen(function*() {
 *   const userService = yield* UserService
 *   const logger = yield* Logger // Still available!
 *   const database = yield* Database // Still available!
 *
 *   const user = yield* userService.getUser("123")
 *   yield* logger.log(`Found user: ${user.name}`)
 *
 *   return user
 * }).pipe(
 *   Effect.provide(allServicesLayer)
 * )
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const provideMerge = /*#__PURE__*/dual(2, (self, that) => provideWith(self, that, (self, that) => Context.merge(that, self)));
/**
 * Constructs a layer dynamically based on the output of this layer.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Config extends Context.Service<Config, {
 *   readonly dbUrl: string
 *   readonly logLevel: string
 * }>()("Config") {}
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Base config layer
 * const configLayer = Layer.succeed(Config)({
 *   dbUrl: "postgres://localhost:5432/mydb",
 *   logLevel: "debug"
 * })
 *
 * // Dynamically create services based on config
 * const dynamicServiceLayer = configLayer.pipe(
 *   Layer.flatMap((context) => {
 *     const config = Context.get(context, Config)
 *
 *     // Create database layer based on config
 *     const dbLayer = Layer.succeed(Database)({
 *       query: Effect.fn("Database.query")((sql: string) =>
 *         Effect.succeed(
 *           `Querying ${config.dbUrl}: ${sql}`
 *         ))
 *     })
 *
 *     // Create logger layer based on config
 *     const loggerLayer = Layer.succeed(Logger)({
 *       log: Effect.fn("Logger.log")((msg: string) =>
 *         config.logLevel === "debug"
 *           ? Effect.sync(() => console.log(`[DEBUG] ${msg}`))
 *           : Effect.sync(() => console.log(msg))
 *       )
 *     })
 *
 *     // Return combined layer
 *     return Layer.mergeAll(dbLayer, loggerLayer)
 *   })
 * )
 *
 * // Use the dynamic services
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   yield* logger.log("Starting database query")
 *   const result = yield* database.query("SELECT * FROM users")
 *
 *   return result
 * }).pipe(
 *   Effect.provide(dynamicServiceLayer)
 * )
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const flatMap = /*#__PURE__*/dual(2, (self, f) => fromBuild((memoMap, scope) => internalEffect.flatMap(self.build(memoMap, scope), context => f(context).build(memoMap, scope))));
/**
 * Performs the specified effect if this layer succeeds.
 *
 * @since 4.0.0
 * @category sequencing
 */
export const tap = /*#__PURE__*/dual(2, (self, f) => fromBuild((memoMap, scope) => internalEffect.flatMap(self.build(memoMap, scope), context => Scope.provide(internalEffect.as(f(context), context), scope))));
/**
 * Performs the specified effect if this layer fails.
 *
 * @since 4.0.0
 * @category sequencing
 */
export const tapError = /*#__PURE__*/dual(2, (self, f) => fromBuild((memoMap, scope) => internalEffect.catch_(self.build(memoMap, scope), error => Scope.provide(internalEffect.andThen(f(error), internalEffect.fail(error)), scope))));
/**
 * Performs the specified effect if this layer fails.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Layer.tapErrorCause`
 *
 * @since 4.0.0
 * @category sequencing
 */
export const tapCause = /*#__PURE__*/dual(2, (self, f) => fromBuild((memoMap, scope) => internalEffect.catchCause(self.build(memoMap, scope), cause => Scope.provide(internalEffect.andThen(f(cause), internalEffect.failCause(cause)), scope))));
/**
 * Translates effect failure into death of the fiber, making all failures
 * unchecked and not a part of the type of the layer.
 *
 * @example
 * ```ts
 * import { Data, Effect, Layer, Context } from "effect"
 *
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   message: string
 * }> {}
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Layer that can fail during construction
 * const flakyDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {
 *   // Simulate a database connection that might fail
 *   const shouldFail = Math.random() > 0.5
 *   if (shouldFail) {
 *     return yield* new DatabaseError({ message: "Connection failed" })
 *   }
 *
 *   return { query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Result: ${sql}`)) }
 * }))
 *
 * // Convert failures to fiber death - removes error from type
 * const reliableDatabaseLayer = flakyDatabaseLayer.pipe(Layer.orDie)
 *
 * // Now the layer type is Layer<Database, never, never> - no error in type
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(
 *   Effect.provide(reliableDatabaseLayer)
 * )
 *
 * // If the database layer fails, the entire fiber will die
 * // instead of the effect failing with DatabaseError
 * ```
 *
 * @since 2.0.0
 * @category error handling
 */
export const orDie = self => fromBuildUnsafe((memoMap, scope) => internalEffect.orDie(self.build(memoMap, scope)));
const catch_ = /*#__PURE__*/dual(2, (self, onError) => fromBuildUnsafe((memoMap, scope) => internalEffect.catch_(self.build(memoMap, scope), e => onError(e).build(memoMap, scope))));
export {
/**
 * Recovers from all errors.
 *
 * @since 4.0.0
 * @category error handling
 */
catch_ as catch };
/**
 * Recovers from specific tagged errors.
 *
 * @example
 * ```ts
 * import { Data, Effect, Layer, Context } from "effect"
 *
 * class ConfigError extends Data.TaggedError("ConfigError") {}
 *
 * class Config extends Context.Service<Config, {
 *   readonly apiUrl: string
 * }>()("Config") {}
 *
 * const configLayer = Layer.effect(Config)(Effect.fail(new ConfigError()))
 *
 * const fallbackLayer = Layer.succeed(Config)({ apiUrl: "http://localhost" })
 *
 * const recovered = configLayer.pipe(
 *   Layer.catchTag("ConfigError", () => fallbackLayer)
 * )
 * ```
 *
 * @since 4.0.0
 * @category error handling
 */
export const catchTag = /*#__PURE__*/dual(3, (self, k, f) => fromBuildUnsafe((memoMap, scope) => internalEffect.catchTag(self.build(memoMap, scope), k, error => f(error).build(memoMap, scope))));
/**
 * Recovers from all errors.
 *
 * @example
 * ```ts
 * import { Data, Effect, Layer, Context } from "effect"
 *
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   message: string
 * }> {}
 *
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   reason: string
 * }> {}
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Primary database layer that might fail
 * const primaryDatabaseLayer = Layer.effect(Database)(Effect.gen(function*() {
 *   return yield* new DatabaseError({ message: "Primary DB unreachable" })
 *   return { query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Primary: ${sql}`)) }
 * }))
 *
 * // Fallback layers for different error causes
 * const databaseWithFallback = primaryDatabaseLayer.pipe(
 *   Layer.catchCause(() => {
 *     // For any cause/error, fallback to in-memory database
 *     return Layer.mergeAll(
 *       Layer.succeed(Database)({
 *         query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Memory: ${sql}`))
 *       }),
 *       Layer.succeed(Logger)({
 *         log: Effect.fn("Logger.log")((msg: string) =>
 *           Effect.sync(() => console.log(`[FALLBACK] ${msg}`))
 *         )
 *       })
 *     )
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(
 *   Effect.provide(databaseWithFallback)
 * )
 * ```
 *
 * @since 2.0.0
 * @category error handling
 */
export const catchCause = /*#__PURE__*/dual(2, (self, onError) => fromBuildUnsafe((memoMap, scope) => internalEffect.catchCause(self.build(memoMap, scope), cause => onError(cause).build(memoMap, scope))));
/**
 * Updates a service in the context with a new implementation.
 *
 * **Details**
 *
 * This function modifies the existing implementation of a service in the
 * context. It retrieves the current service, applies the provided
 * transformation function `f`, and replaces the old service with the
 * transformed one.
 *
 * **When to Use**
 *
 * This is useful for adapting or extending a service's behavior during the
 * creation of a layer.
 *
 * @since 3.13.0
 * @category utils
 */
export const updateService = /*#__PURE__*/dual(3, (layer, service, f) => provide(layer, effect(service, internalEffect.map(service.asEffect(), f))));
/**
 * Creates a fresh version of this layer that will not be shared.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref, Context } from "effect"
 *
 * class Counter extends Context.Service<Counter, {
 *   readonly count: number
 *   readonly increment: () => Effect.Effect<number>
 * }>()("Counter") {}
 *
 * // Layer that creates a counter with shared state
 * const counterLayer = Layer.effect(Counter)(Effect.gen(function*() {
 *   const ref = yield* Ref.make(0)
 *   return {
 *     count: 0,
 *     increment: Effect.fn("Counter.increment")(() =>
 *       Ref.update(ref, (n) => n + 1).pipe(
 *         Effect.flatMap(() => Ref.get(ref))
 *       )
 *     )
 *   }
 * }))
 *
 * // By default, layers are shared - same instance used everywhere
 * const sharedProgram = Effect.gen(function*() {
 *   const counter1 = yield* Counter
 *   const counter2 = yield* Counter
 *
 *   // Both counter1 and counter2 refer to the same instance
 *   console.log("Shared layer - same instance")
 * }).pipe(
 *   Effect.provide(counterLayer)
 * )
 *
 * // Fresh layer creates a new instance each time
 * const freshProgram = Effect.gen(function*() {
 *   const counter1 = yield* Counter
 *   const counter2 = yield* Counter
 *
 *   // counter1 and counter2 are different instances
 *   console.log("Fresh layer - different instances")
 * }).pipe(
 *   Effect.provide(Layer.fresh(counterLayer))
 * )
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const fresh = self => fromBuildUnsafe((_, scope) => self.build(makeMemoMapUnsafe(), scope));
/**
 * Builds this layer and uses it until it is interrupted. This is useful when
 * your entire application is a layer, such as an HTTP server.
 *
 * @example
 * ```ts
 * import { Console, Effect, Layer, Context } from "effect"
 *
 * class HttpServer extends Context.Service<HttpServer, {
 *   readonly start: () => Effect.Effect<string>
 *   readonly stop: () => Effect.Effect<string>
 * }>()("HttpServer") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Server layer that starts an HTTP server
 * const serverLayer = Layer.effect(HttpServer)(Effect.gen(function*() {
 *   yield* Console.log("Starting HTTP server...")
 *
 *   return {
 *     start: Effect.fn("HttpServer.start")(function*() {
 *         yield* Console.log("Server listening on port 3000")
 *         return "Server started"
 *       }),
 *     stop: Effect.fn("HttpServer.stop")(function*() {
 *         yield* Console.log("Server stopped gracefully")
 *         return "Server stopped"
 *       })
 *   }
 * }))
 *
 * const loggerLayer = Layer.succeed(Logger)({
 *   log: Effect.fn("Logger.log")((msg: string) => Console.log(`[LOG] ${msg}`))
 * })
 *
 * // Application layer combining all services
 * const appLayer = Layer.mergeAll(serverLayer, loggerLayer)
 *
 * // Launch the application - runs until interrupted
 * const application = appLayer.pipe(
 *   Layer.launch,
 *   Effect.tapError((error) => Console.log(`Application failed: ${error}`)),
 *   Effect.tap(() => Console.log("Application completed"))
 * )
 *
 * // This will run forever until externally interrupted
 * // Effect.runFork(application)
 * ```
 *
 * @since 2.0.0
 * @category conversions
 */
export const launch = self => internalEffect.scoped(internalEffect.andThen(build(self), internalEffect.never));
/**
 * Creates a mock layer for testing purposes. You can provide a partial
 * implementation of the service, and any methods not provided will
 * throw an unimplemented defect when called.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class UserService extends Context.Service<UserService, {
 *   readonly config: { apiUrl: string }
 *   readonly getUser: (
 *     id: string
 *   ) => Effect.Effect<{ id: string; name: string }, Error>
 *   readonly deleteUser: (id: string) => Effect.Effect<void, Error>
 *   readonly updateUser: (
 *     id: string,
 *     data: object
 *   ) => Effect.Effect<{ id: string; name: string }, Error>
 * }>()("UserService") {}
 *
 * // Create a partial mock - only implement what you need for testing
 * const testUserLayer = Layer.mock(UserService, {
 *   config: { apiUrl: "https://test-api.com" }, // Required - non-Effect property
 *   getUser: (id: string) => Effect.succeed({ id, name: "Test User" }) // Mock implementation
 *   // deleteUser and updateUser are omitted - will throw UnimplementedError if called
 * })
 *
 * // Use in tests
 * const testProgram = Effect.gen(function*() {
 *   const userService = yield* UserService
 *
 *   // This works - we provided an implementation
 *   const user = yield* userService.getUser("123")
 *   console.log(user.name) // "Test User"
 *
 *   // This would throw - we didn't implement deleteUser
 *   // yield* userService.deleteUser("123") // UnimplementedError
 * }).pipe(
 *   Effect.provide(testUserLayer)
 * )
 * ```
 *
 * @since 4.0.0
 * @category Testing
 */
export const mock = function () {
  if (arguments.length === 1) {
    return implementation => mockImpl(arguments[0], implementation);
  }
  return mockImpl(arguments[0], arguments[1]);
};
const mockImpl = (service, implementation) => succeed(service)(new Proxy({
  ...implementation
}, {
  get(target, prop, _receiver) {
    if (prop in target) {
      return target[prop];
    }
    const prevLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = 2;
    const error = new Error(`${service.key}: Unimplemented method "${prop.toString()}"`);
    Error.stackTraceLimit = prevLimit;
    error.name = "UnimplementedError";
    return makeUnimplemented(error);
  },
  has: constTrue
}));
const makeUnimplemented = error => {
  const dead = Object.assign(internalEffect.die(error), {
    [StreamTypeId]: StreamTypeId,
    channel: {
      [ChannelTypeId]: ChannelTypeId,
      transform: () => internalEffect.succeed(dead),
      pipe() {
        return pipeArguments(this, arguments);
      }
    },
    [ChannelTypeId]: ChannelTypeId,
    transform: () => internalEffect.succeed(dead)
  });
  function unimplemented() {
    return dead;
  }
  // @effect-diagnostics-next-line floatingEffect:off
  Object.assign(unimplemented, dead);
  Object.setPrototypeOf(unimplemented, Object.getPrototypeOf(dead));
  return unimplemented;
};
const StreamTypeId = "~effect/Stream";
const ChannelTypeId = "~effect/Channel";
// -----------------------------------------------------------------------------
// Type constraints
// -----------------------------------------------------------------------------
/**
 * Ensures that an layer's success type extends a given type `ROut`.
 *
 * This function provides compile-time type checking to ensure that the success
 * value of an layer conforms to a specific type constraint.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 *
 * declare const FortyTwoLayer: Layer.Layer<42, never, never>
 * declare const StringLayer: Layer.Layer<string, never, never>
 *
 * // Define a constraint that the success type must be a number
 * const satisfiesNumber = Layer.satisfiesSuccessType<number>()
 *
 * // This works - Layer<42, never, never> extends Layer<number, never, never>
 * const validLayer = satisfiesNumber(FortyTwoLayer)
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidLayer = satisfiesNumber(StringLayer)
 * //                                     ^^^^^^^^^^^
 * // Type 'number' is not assignable to type 'string'
 * ```
 *
 * @since 4.0.0
 * @category Type constraints
 */
export const satisfiesSuccessType = () => layer => layer;
/**
 * Ensures that an layer's error type extends a given type `E`.
 *
 * This function provides compile-time type checking to ensure that the error
 * type of an layer conforms to a specific type constraint.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 *
 * declare const ErrorLayer: Layer.Layer<never, Error, never>
 * declare const TypeErrorLayer: Layer.Layer<never, TypeError, never>
 * declare const StringLayer: Layer.Layer<never, string, never>
 *
 * // Define a constraint that the error type must be an Error
 * const satisfiesError = Layer.satisfiesErrorType<Error>()
 *
 * // This works - Layer<never, TypeError, never> extends Layer<never, Error, never>
 * const validLayer = satisfiesError(TypeErrorLayer)
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidLayer = satisfiesError(StringLayer)
 * //                                     ^^^^^^^^^^^
 * // Type 'string' is not assignable to type 'Error'
 * ```
 *
 * @since 4.0.0
 * @category Type constraints
 */
export const satisfiesErrorType = () => layer => layer;
/**
 * Ensures that an layer's requirements type extends a given type `R`.
 *
 * This function provides compile-time type checking to ensure that the
 * requirements (context) type of an layer conforms to a specific type constraint.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 *
 * declare const FortyTwoLayer: Layer.Layer<never, never, 42>
 * declare const StringLayer: Layer.Layer<never, never, string>
 *
 * // Define a constraint that the success type must be a number
 * const satisfiesNumber = Layer.satisfiesServicesType<number>()
 *
 * // This works - Layer<never, never, 42> extends Layer<never, never, number>
 * const validLayer = satisfiesNumber(FortyTwoLayer)
 *
 * // This would cause a TypeScript compilation error:
 * // const invalidLayer = satisfiesNumber(StringLayer)
 * //                                     ^^^^^^^^^^^
 * // Type 'string' is not assignable to type 'number'
 * ```
 *
 * @since 4.0.0
 * @category Type constraints
 */
export const satisfiesServicesType = () => layer => layer;
/**
 * Constructs a new `Layer` which creates a span and registers it as the current
 * parent span.
 *
 * This allows you to create a traced scope for layer construction, making all
 * operations within the layer constructor part of the same trace span. The span
 * is automatically closed when the layer's scope is closed.
 *
 * @example
 * ```ts
 * import { Console, Effect, Layer, Context, type Tracer } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a traced layer - all operations performed during construction of
 * // the `Database` service are part of the "database-init" span
 * const databaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   // These operations are traced under "database-init" span
 *   yield* Effect.log("Connecting to database")
 *   yield* Effect.sleep("100 millis")
 *   yield* Effect.log("Database connected")
 *
 *   const parentSpan = yield* Effect.currentParentSpan
 *   yield* Console.log((parentSpan as Tracer.Span).name) // "database-init"
 *
 *   return {
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Result: ${sql}`))
 *   }
 * })).pipe(Layer.provide(Layer.span("database-init")))
 *
 * // Can also use the `onEnd` callback to execute logic when the span ends
 * const tracedLayer = Layer.span("service-initialization", {
 *   attributes: { version: "1.0.0" },
 *   onEnd: (span, exit) =>
 *     Effect.sync(() => {
 *       console.log(`Span ${span.name} ended with:`, exit._tag)
 *     })
 * })
 * ```
 *
 * @since 4.0.0
 * @category tracing
 */
export const span = (name, options) => {
  options = internalTracer.addSpanStackTrace(options);
  return effect(Tracer.ParentSpan, options?.onEnd ? internalEffect.tap(internalEffect.makeSpanScoped(name, options), span => internalEffect.addFinalizer(exit => options.onEnd(span, exit))) : internalEffect.makeSpanScoped(name, options));
};
/**
 * Constructs a new `Layer` which takes an existing span and registers it as the
 * current parent span.
 *
 * This allows you to create a traced scope for layer construction, making all
 * operations within the layer constructor part of the same trace span. The span
 * is automatically closed when the layer's scope is closed.
 *
 * @example
 * ```ts
 * import { Console, Effect, Layer, Context, Tracer } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a layer that uses an existing span as parent
 * const databaseLayer = Layer.effect(
 *   Database,
 *   Effect.gen(function*() {
 *     yield* Effect.log("Initializing database")
 *
 *     const parentSpan = yield* Effect.currentParentSpan
 *     yield* Console.log(parentSpan.spanId) // "42"
 *
 *     return {
 *       query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Result: ${sql}`))
 *     }
 *   })
 * ).pipe(Layer.provide(Layer.parentSpan(Tracer.externalSpan({
 *   spanId: "42",
 *   traceId: "000"
 * }))))
 * ```
 *
 * @since 4.0.0
 * @category tracing
 */
export const parentSpan = span => succeedContext(Tracer.ParentSpan.context(span));
/**
 * Wraps a Layer with a new tracing span, making all operations in the layer
 * constructor part of the named trace span.
 *
 * This creates a new span for the layer's construction and execution. The span
 * is automatically ended when the layer's scope is closed. This is useful for
 * tracking the lifecycle and performance of layer initialization.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Logger extends Context.Service<Logger, {
 *   readonly log: (msg: string) => Effect.Effect<void>
 * }>()("Logger") {}
 *
 * // Create layers with tracing
 * const databaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to database")
 *   yield* Effect.sleep("100 millis")
 *   return {
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Result: ${sql}`))
 *   }
 * })).pipe(Layer.withSpan("database-initialization", {
 *   attributes: { dbType: "postgres" }
 * }))
 *
 * const loggerLayer = Layer.succeed(Logger, {
 *   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => console.log(msg)))
 * }).pipe(Layer.withSpan("logger-initialization"))
 *
 * // Combine traced layers
 * const appLayer = Layer.mergeAll(databaseLayer, loggerLayer).pipe(
 *   Layer.withSpan("app-initialization", {
 *     onEnd: (span, exit) =>
 *       Effect.sync(() => {
 *         console.log(`Application initialization completed: ${exit._tag}`)
 *       })
 *   })
 * )
 *
 * const program = Effect.gen(function*() {
 *   const database = yield* Database
 *   const logger = yield* Logger
 *
 *   yield* logger.log("Application ready")
 *   return yield* database.query("SELECT * FROM users")
 * }).pipe(Effect.provide(appLayer)
 * )
 * ```
 *
 * @since 4.0.0
 * @category tracing
 */
export const withSpan = function () {
  const dataFirst = typeof arguments[0] !== "string";
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = internalTracer.addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return unwrap(internalEffect.map(options?.onEnd !== undefined ? internalEffect.tap(internalEffect.makeSpanScoped(name, options), span => internalEffect.addFinalizer(exit => options.onEnd(span, exit))) : internalEffect.makeSpanScoped(name, options), span => withParentSpan(self, span)));
  }
  return self => unwrap(internalEffect.map(options?.onEnd !== undefined ? internalEffect.tap(internalEffect.makeSpanScoped(name, options), span => internalEffect.addFinalizer(exit => options.onEnd(span, exit))) : internalEffect.makeSpanScoped(name, options), span => withParentSpan(self, span)));
};
/**
 * Wraps a `Layer` with a new tracing span and sets the span as the parent span.
 *
 * This attaches a layer to an existing trace span, making all operations within
 * the layer children of the provided parent span. This is useful for integrating
 * layer construction into an existing trace hierarchy.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context, Tracer } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * class Cache extends Context.Service<Cache, {
 *   readonly get: (key: string) => Effect.Effect<string | null>
 * }>()("Cache") {}
 *
 * // Create layers
 * const DatabaseLayer = Layer.effect(Database, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to database")
 *   return {
 *     query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
 *   }
 * }))
 *
 * const CacheLayer = Layer.effect(Cache, Effect.gen(function*() {
 *   yield* Effect.log("Connecting to cache")
 *   return {
 *     get: Effect.fn("Cache.get")((key: string) => Effect.succeed(`Cache: ${key}`))
 *   }
 * }))
 *
 * // Use with an existing parent span from Effect.withSpan
 * const program = Effect.withSpan("application-startup")(
 *   Effect.gen(function*() {
 *     const parentSpan = yield* Tracer.ParentSpan
 *
 *     // Both layers will be children of "application-startup" span
 *     const AppLayer = Layer.mergeAll(DatabaseLayer, CacheLayer).pipe(
 *       Layer.withParentSpan(parentSpan)
 *     )
 *
 *     const context = yield* Layer.build(AppLayer)
 *     const database = Context.get(context, Database)
 *     const cache = Context.get(context, Cache)
 *
 *     const dbResult = yield* database.query("SELECT * FROM users")
 *     const cacheResult = yield* cache.get("user:123")
 *
 *     return { dbResult, cacheResult }
 *   })
 * )
 * ```
 *
 * @since 4.0.0
 * @category tracing
 */
export const withParentSpan = function () {
  const dataFirst = isLayer(arguments[0]);
  const span = dataFirst ? arguments[1] : arguments[0];
  let options = dataFirst ? arguments[2] : arguments[1];
  let provideStackFrame = identity;
  if (span._tag === "Span") {
    options = internalTracer.addSpanStackTrace(options);
    provideStackFrame = provideSpanStackFrame(span.name, options?.captureStackTrace);
  }
  const parentSpanLayer = parentSpan(span);
  if (dataFirst) {
    return provide(provideStackFrame(arguments[0]), parentSpanLayer);
  }
  return self => provide(provideStackFrame(self), parentSpanLayer);
};
const provideSpanStackFrame = (name, stack) => {
  stack = typeof stack === "function" ? stack : constUndefined;
  return updateService(CurrentStackFrame, parent => ({
    name,
    stack,
    parent
  }));
};
//# sourceMappingURL=Layer.js.map