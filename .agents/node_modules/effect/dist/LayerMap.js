/**
 * @since 3.14.0
 */
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import { identity } from "./Function.js";
import * as Layer from "./Layer.js";
import * as RcMap from "./RcMap.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/LayerMap";
/**
 * @since 3.14.0
 * @category Constructors
 *
 * A `LayerMap` allows you to create a map of Layer's that can be used to
 * dynamically access resources based on a key.
 *
 * @example
 * ```ts
 * import { Effect, Layer, LayerMap, Context } from "effect"
 *
 * // Define a service key
 * const DatabaseService = Context.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("Database")
 *
 * // Create a LayerMap that provides different database configurations
 * const program = Effect.gen(function*() {
 *   const layerMap = yield* LayerMap.make(
 *     (env: string) =>
 *       Layer.succeed(DatabaseService)({
 *         query: Effect.fn("DatabaseService.query")((sql) => Effect.succeed(`${env}: ${sql}`))
 *       }),
 *     { idleTimeToLive: "5 seconds" }
 *   )
 *
 *   // Get a layer for a specific environment
 *   const devLayer = layerMap.get("development")
 *
 *   // Use the layer to provide the service
 *   const result = yield* Effect.provide(
 *     Effect.gen(function*() {
 *       const db = yield* DatabaseService
 *       return yield* db.query("SELECT * FROM users")
 *     }),
 *     devLayer
 *   )
 *
 *   console.log(result) // "development: SELECT * FROM users"
 * })
 * ```
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (lookup, options) {
  const context = yield* Effect.context();
  const memoMap = Layer.CurrentMemoMap.getOrCreate(context);
  const rcMap = yield* RcMap.make({
    lookup: key => Effect.contextWith(_ => Layer.buildWithMemoMap(lookup(key), memoMap, Context.get(_, Scope.Scope))),
    idleTimeToLive: options?.idleTimeToLive
  });
  return identity({
    [TypeId]: TypeId,
    rcMap,
    get: key => Layer.effectContext(RcMap.get(rcMap, key)),
    contextEffect: key => RcMap.get(rcMap, key),
    invalidate: key => RcMap.invalidate(rcMap, key)
  });
});
/**
 * @since 3.14.0
 * @category Constructors
 * @example
 * ```ts
 * import { Effect, Layer, LayerMap, Context } from "effect"
 *
 * // Define service keys
 * const DevDatabase = Context.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("DevDatabase")
 *
 * const ProdDatabase = Context.Service<{
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>("ProdDatabase")
 *
 * // Create predefined layers
 * const layers = {
 *   development: Layer.succeed(DevDatabase)({
 *     query: Effect.fn("DevDatabase.query")((sql) => Effect.succeed(`DEV: ${sql}`))
 *   }),
 *   production: Layer.succeed(ProdDatabase)({
 *     query: Effect.fn("ProdDatabase.query")((sql) => Effect.succeed(`PROD: ${sql}`))
 *   })
 * } as const
 *
 * // Create a LayerMap from the record
 * const program = Effect.gen(function*() {
 *   const layerMap = yield* LayerMap.fromRecord(layers, {
 *     idleTimeToLive: "10 seconds"
 *   })
 *
 *   // Get layers by key
 *   const devLayer = layerMap.get("development")
 *   const prodLayer = layerMap.get("production")
 *
 *   console.log("LayerMap created from record")
 * })
 * ```
 */
export const fromRecord = (layers, options) => make(key => layers[key], {
  ...options,
  preloadKeys: options?.preload ? Object.keys(layers) : undefined
});
/**
 * @since 3.14.0
 * @category Service
 *
 * Create a `LayerMap` service that provides a dynamic set of resources based on
 * a key.
 *
 * @example
 * ```ts
 * import { Console, Effect, Layer, LayerMap, Context } from "effect"
 *
 * // Define a service key
 * const Greeter = Context.Service<{
 *   readonly greet: Effect.Effect<string>
 * }>("Greeter")
 *
 * // Create a service that wraps a LayerMap
 * class GreeterMap extends LayerMap.Service<GreeterMap>()("GreeterMap", {
 *   // Define the lookup function for the layer map
 *   lookup: (name: string) =>
 *     Layer.succeed(Greeter)({
 *       greet: Effect.succeed(`Hello, ${name}!`)
 *     }),
 *
 *   // If a layer is not used for a certain amount of time, it can be removed
 *   idleTimeToLive: "5 seconds"
 * }) {}
 *
 * // Usage
 * const program = Effect.gen(function*() {
 *   // Access and use the Greeter service
 *   const greeter = yield* Greeter
 *   yield* Console.log(yield* greeter.greet)
 * }).pipe(
 *   // Use the GreeterMap service to provide a variant of the Greeter service
 *   Effect.provide(GreeterMap.get("John"))
 * ).pipe(
 *   // Provide the GreeterMap layer
 *   Effect.provide(GreeterMap.layer)
 * )
 * ```
 */
export const Service = () => (id, options) => {
  const Err = globalThis.Error;
  const limit = Err.stackTraceLimit;
  Err.stackTraceLimit = 2;
  const creationError = new Err();
  Err.stackTraceLimit = limit;
  function TagClass() {}
  const TagClass_ = TagClass;
  Object.setPrototypeOf(TagClass, Object.getPrototypeOf(Context.Service(id)));
  TagClass.key = id;
  Object.defineProperty(TagClass, "stack", {
    get() {
      return creationError.stack;
    }
  });
  TagClass_.layerNoDeps = Layer.effect(TagClass_)("lookup" in options ? make(options.lookup, options) : fromRecord(options.layers, options));
  TagClass_.layer = options.dependencies && options.dependencies.length > 0 ? Layer.provide(TagClass_.layerNoDeps, options.dependencies) : TagClass_.layerNoDeps;
  TagClass_.get = key => Layer.unwrap(Effect.map(TagClass_.asEffect(), layerMap => layerMap.get(key)));
  TagClass_.contextEffect = key => Effect.flatMap(TagClass_.asEffect(), layerMap => layerMap.contextEffect(key));
  TagClass_.invalidate = key => Effect.flatMap(TagClass_.asEffect(), layerMap => layerMap.invalidate(key));
  return TagClass;
};
//# sourceMappingURL=LayerMap.js.map