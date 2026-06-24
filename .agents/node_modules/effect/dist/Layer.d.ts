/**
 * A `Layer<ROut, E, RIn>` describes how to build one or more services in your
 * application. Services can be injected into effects via
 * `Effect.provideService`. Effects can require services via `Effect.service`.
 *
 * Layer can be thought of as recipes for producing bundles of services, given
 * their dependencies (other services).
 *
 * Construction of services can be effectful and utilize resources that must be
 * acquired and safely released when the services are done being utilized.
 *
 * By default layers are shared, meaning that if the same layer is used twice
 * the layer will only be allocated a single time.
 *
 * Because of their excellent composition properties, layers are the idiomatic
 * way in Effect-TS to create services that depend on other services.
 *
 * @since 2.0.0
 */
import type { NonEmptyReadonlyArray } from "./Array.ts";
import type * as Cause from "./Cause.ts";
import type * as Channel from "./Channel.ts";
import * as Context from "./Context.ts";
import type { Effect } from "./Effect.ts";
import type * as Exit from "./Exit.ts";
import type { LazyArg } from "./Function.ts";
import { type Pipeable } from "./Pipeable.ts";
import * as Scope from "./Scope.ts";
import type * as Stream from "./Stream.ts";
import * as Tracer from "./Tracer.ts";
import type * as Types from "./Types.ts";
import type * as Unify from "./Unify.ts";
declare const TypeId = "~effect/Layer";
/**
 * A Layer describes how to build one or more services for dependency injection.
 *
 * A Layer<ROut, E, RIn> represents:
 * - ROut: The services this layer provides
 * - E: The possible errors during layer construction
 * - RIn: The services this layer requires as dependencies
 *
 * @since 2.0.0
 * @category models
 */
export interface Layer<in ROut, out E = never, out RIn = never> extends Variance<ROut, E, RIn>, Pipeable {
    [Unify.typeSymbol]?: unknown;
    [Unify.unifySymbol]?: LayerUnify<this>;
    [Unify.ignoreSymbol]?: LayerUnifyIgnore;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface LayerUnify<A extends {
    [Unify.typeSymbol]?: any;
}> {
    Layer?: () => A[Unify.typeSymbol] extends Layer<any, any, any> | infer _ ? Layer<Success<Extract<A[Unify.typeSymbol], Any>>, Error<Extract<A[Unify.typeSymbol], Any>>, Services<Extract<A[Unify.typeSymbol], Any>>> : never;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface LayerUnifyIgnore {
}
/**
 * The variance interface for Layer type parameters.
 *
 * @since 2.0.0
 * @category models
 */
export interface Variance<in ROut, out E, out RIn> {
    readonly [TypeId]: {
        readonly _ROut: Types.Contravariant<ROut>;
        readonly _E: Types.Covariant<E>;
        readonly _RIn: Types.Covariant<RIn>;
    };
}
/**
 * A constraint interface for working with any Layer type.
 *
 * This interface is used to constrain generic types to Layer types
 * without specifying exact type parameters.
 *
 * @since 3.9.0
 * @category type-level
 */
export interface Any {
    readonly [TypeId]: {
        readonly _ROut: any;
        readonly _E: any;
        readonly _RIn: any;
    };
}
/**
 * Extracts the service dependencies (RIn) from a Layer type.
 *
 * @since 2.0.0
 * @category type-level
 */
export type Services<T extends Any> = T extends infer L ? L extends Layer<infer _ROut, infer _E, infer _RIn> ? _RIn : never : never;
/**
 * Extracts the error type (E) from a Layer type.
 *
 * @since 2.0.0
 * @category type-level
 */
export type Error<T extends Any> = T extends Layer<infer _ROut, infer _E, infer _RIn> ? _E : never;
/**
 * Extracts the service output type (ROut) from a Layer type.
 *
 * @since 2.0.0
 * @category type-level
 */
export type Success<T extends Any> = T extends Layer<infer _ROut, infer _E, infer _RIn> ? _ROut : never;
declare const MemoMapTypeId = "~effect/Layer/MemoMap";
/**
 * A MemoMap is used to memoize layer construction and ensure sharing of layers.
 *
 * The MemoMap prevents duplicate construction of the same layer instance,
 * enabling efficient resource sharing across layer dependencies.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Context } from "effect"
 *
 * class Database extends Context.Service<Database, {
 *   readonly query: (sql: string) => Effect.Effect<string>
 * }>()("Database") {}
 *
 * // Create a custom MemoMap for manual layer building
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
 * @category models
 */
export interface MemoMap {
    readonly [MemoMapTypeId]: typeof MemoMapTypeId;
    readonly getOrElseMemoize: <RIn, E, ROut>(layer: Layer<ROut, E, RIn>, scope: Scope.Scope, build: (memoMap: MemoMap, scope: Scope.Scope) => Effect<Context.Context<ROut>, E, RIn>) => Effect<Context.Context<ROut>, E, RIn>;
}
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
export declare const isLayer: (u: unknown) => u is Layer<unknown, unknown, unknown>;
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
export declare const fromBuild: <ROut, E, RIn>(build: (memoMap: MemoMap, scope: Scope.Scope) => Effect<Context.Context<ROut>, E, RIn>) => Layer<ROut, E, RIn>;
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
export declare const fromBuildMemo: <ROut, E, RIn>(build: (memoMap: MemoMap, scope: Scope.Scope) => Effect<Context.Context<ROut>, E, RIn>) => Layer<ROut, E, RIn>;
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
export declare const makeMemoMapUnsafe: () => MemoMap;
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
export declare const makeMemoMap: Effect<MemoMap>;
declare const CurrentMemoMap_base: Context.ServiceClass<CurrentMemoMap, "effect/Layer/CurrentMemoMap", MemoMap>;
/**
 * A service reference for the current `MemoMap` used in layer construction.
 *
 * This service provides access to the current memoization map during layer building,
 * allowing layers to share memoized results.
 *
 * @since 3.13.0
 * @category models
 */
export declare class CurrentMemoMap extends CurrentMemoMap_base {
    static getOrCreate: <Services>(self: Context.Context<Services>) => MemoMap;
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
export declare const buildWithMemoMap: {
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
    (memoMap: MemoMap, scope: Scope.Scope): <RIn, E, ROut>(self: Layer<ROut, E, RIn>) => Effect<Context.Context<ROut>, E, RIn>;
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
    <RIn, E, ROut>(self: Layer<ROut, E, RIn>, memoMap: MemoMap, scope: Scope.Scope): Effect<Context.Context<ROut>, E, RIn>;
};
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
export declare const build: <RIn, E, ROut>(self: Layer<ROut, E, RIn>) => Effect<Context.Context<ROut>, E, RIn | Scope.Scope>;
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
export declare const buildWithScope: {
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
    (scope: Scope.Scope): <RIn, E, ROut>(self: Layer<ROut, E, RIn>) => Effect<Context.Context<ROut>, E, RIn>;
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
    <RIn, E, ROut>(self: Layer<ROut, E, RIn>, scope: Scope.Scope): Effect<Context.Context<ROut>, E, RIn>;
};
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
export declare const succeed: {
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
    <I, S>(service: Context.Key<I, S>): (resource: S) => Layer<I>;
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
    <I, S>(service: Context.Key<I, S>, resource: Types.NoInfer<S>): Layer<I>;
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
export declare const succeedContext: <A>(context: Context.Context<A>) => Layer<A>;
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
export declare const empty: Layer<never>;
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
export declare const sync: {
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
    <I, S>(service: Context.Key<I, S>): (evaluate: LazyArg<S>) => Layer<I>;
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
    <I, S>(service: Context.Key<I, S>, evaluate: LazyArg<Types.NoInfer<S>>): Layer<I>;
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
export declare const syncContext: <A>(evaluate: LazyArg<Context.Context<A>>) => Layer<A>;
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
export declare const effect: {
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
    <I, S>(service: Context.Key<I, S>): <E, R>(effect: Effect<S, E, R>) => Layer<I, E, Exclude<R, Scope.Scope>>;
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
    <I, S, E, R>(service: Context.Key<I, S>, effect: Effect<Types.NoInfer<S>, E, R>): Layer<I, E, Exclude<R, Scope.Scope>>;
};
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
export declare const effectContext: <A, E, R>(effect: Effect<Context.Context<A>, E, R>) => Layer<A, E, Exclude<R, Scope.Scope>>;
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
export declare const effectDiscard: <X, E, R>(effect: Effect<X, E, R>) => Layer<never, E, Exclude<R, Scope.Scope>>;
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
export declare const suspend: <A, E, R>(evaluate: LazyArg<Layer<A, E, R>>) => Layer<A, E, R>;
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
export declare const unwrap: <A, E1, R1, E, R>(self: Effect<Layer<A, E1, R1>, E, R>) => Layer<A, E | E1, R1 | Exclude<R, Scope.Scope>>;
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
export declare const mergeAll: <Layers extends [Layer<never, any, any>, ...Array<Layer<never, any, any>>]>(...layers: Layers) => Layer<Success<Layers[number]>, Error<Layers[number]>, Services<Layers[number]>>;
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
export declare const merge: {
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
    <RIn, E, ROut>(that: Layer<ROut, E, RIn>): <RIn2, E2, ROut2>(self: Layer<ROut2, E2, RIn2>) => Layer<ROut | ROut2, E | E2, RIn | RIn2>;
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
    <const Layers extends [Any, ...Array<Any>]>(that: Layers): <A, E, R>(self: Layer<A, E, R>) => Layer<A | Success<Layers[number]>, E | Error<Layers[number]>, Services<Layers[number]> | R>;
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
    <RIn2, E2, ROut2, RIn, E, ROut>(self: Layer<ROut2, E2, RIn2>, that: Layer<ROut, E, RIn>): Layer<ROut | ROut2, E | E2, RIn | RIn2>;
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
    <A, E, R, const Layers extends [Any, ...Array<Any>]>(self: Layer<A, E, R>, that: Layers): Layer<A | Success<Layers[number]>, E | Error<Layers[number]>, Services<Layers[number]> | R>;
};
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
export declare const provide: {
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
    <RIn, E, ROut>(that: Layer<ROut, E, RIn>): <RIn2, E2, ROut2>(self: Layer<ROut2, E2, RIn2>) => Layer<ROut2, E | E2, RIn | Exclude<RIn2, ROut>>;
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
    <const Layers extends [Any, ...Array<Any>]>(that: Layers): <A, E, R>(self: Layer<A, E, R>) => Layer<A, E | Error<Layers[number]>, Services<Layers[number]> | Exclude<R, Success<Layers[number]>>>;
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
    <RIn2, E2, ROut2, RIn, E, ROut>(self: Layer<ROut2, E2, RIn2>, that: Layer<ROut, E, RIn>): Layer<ROut2, E | E2, RIn | Exclude<RIn2, ROut>>;
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
    <A, E, R, const Layers extends [Any, ...Array<Any>]>(self: Layer<A, E, R>, that: Layers): Layer<A, E | Error<Layers[number]>, Services<Layers[number]> | Exclude<R, Success<Layers[number]>>>;
};
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
export declare const provideMerge: {
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
    <RIn, E, ROut>(that: Layer<ROut, E, RIn>): <RIn2, E2, ROut2>(self: Layer<ROut2, E2, RIn2>) => Layer<ROut | ROut2, E | E2, RIn | Exclude<RIn2, ROut>>;
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
    <const Layers extends [Any, ...Array<Any>]>(that: Layers): <A, E, R>(self: Layer<A, E, R>) => Layer<A | Success<Layers[number]>, E | Error<Layers[number]>, Services<Layers[number]> | Exclude<R, Success<Layers[number]>>>;
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
    <RIn2, E2, ROut2, RIn, E, ROut>(self: Layer<ROut2, E2, RIn2>, that: Layer<ROut, E, RIn>): Layer<ROut | ROut2, E | E2, RIn | Exclude<RIn2, ROut>>;
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
    <A, E, R, const Layers extends [Any, ...Array<Any>]>(self: Layer<A, E, R>, that: Layers): Layer<A | Success<Layers[number]>, E | Error<Layers[number]>, Services<Layers[number]> | Exclude<R, Success<Layers[number]>>>;
};
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
export declare const flatMap: {
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
    <A, A2, E2, R2>(f: (context: Context.Context<A>) => Layer<A2, E2, R2>): <E, R>(self: Layer<A, E, R>) => Layer<A2, E2 | E, R2 | R>;
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
    <A, E, R, A2, E2, R2>(self: Layer<A, E, R>, f: (context: Context.Context<A>) => Layer<A2, E2, R2>): Layer<A2, E | E2, R | R2>;
};
/**
 * Performs the specified effect if this layer succeeds.
 *
 * @since 4.0.0
 * @category sequencing
 */
export declare const tap: {
    /**
     * Performs the specified effect if this layer succeeds.
     *
     * @since 4.0.0
     * @category sequencing
     */
    <ROut, XR extends ROut, RIn2, E2, X>(f: (context: Context.Context<XR>) => Effect<X, E2, RIn2>): <RIn, E>(self: Layer<ROut, E, RIn>) => Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
    /**
     * Performs the specified effect if this layer succeeds.
     *
     * @since 4.0.0
     * @category sequencing
     */
    <RIn, E, ROut, XR extends ROut, RIn2, E2, X>(self: Layer<ROut, E, RIn>, f: (context: Context.Context<XR>) => Effect<X, E2, RIn2>): Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
};
/**
 * Performs the specified effect if this layer fails.
 *
 * @since 4.0.0
 * @category sequencing
 */
export declare const tapError: {
    /**
     * Performs the specified effect if this layer fails.
     *
     * @since 4.0.0
     * @category sequencing
     */
    <E, XE extends E, RIn2, E2, X>(f: (e: XE) => Effect<X, E2, RIn2>): <RIn, ROut>(self: Layer<ROut, E, RIn>) => Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
    /**
     * Performs the specified effect if this layer fails.
     *
     * @since 4.0.0
     * @category sequencing
     */
    <RIn, E, XE extends E, ROut, RIn2, E2, X>(self: Layer<ROut, E, RIn>, f: (e: XE) => Effect<X, E2, RIn2>): Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
};
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
export declare const tapCause: {
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
    <E, XE extends E, RIn2, E2, X>(f: (cause: Cause.Cause<XE>) => Effect<X, E2, RIn2>): <RIn, ROut>(self: Layer<ROut, E, RIn>) => Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
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
    <RIn, E, XE extends E, ROut, RIn2, E2, X>(self: Layer<ROut, E, RIn>, f: (cause: Cause.Cause<XE>) => Effect<X, E2, RIn2>): Layer<ROut, E | E2, RIn | Exclude<RIn2, Scope.Scope>>;
};
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
export declare const orDie: <A, E, R>(self: Layer<A, E, R>) => Layer<A, never, R>;
declare const catch_: {
    <E, RIn2, E2, ROut2>(onError: (error: E) => Layer<ROut2, E2, RIn2>): <RIn, ROut>(self: Layer<ROut, E, RIn>) => Layer<ROut & ROut2, E2, RIn2 | RIn>;
    <RIn, E, ROut, RIn2, E2, ROut2>(self: Layer<ROut, E, RIn>, onError: (error: E) => Layer<ROut2, E2, RIn2>): Layer<ROut & ROut2, E2, RIn | RIn2>;
};
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
export declare const catchTag: {
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
    <const K extends Types.Tags<E> | NonEmptyReadonlyArray<Types.Tags<E>>, E, RIn2, E2, ROut2>(k: K, f: (e: Types.ExtractTag<Types.NoInfer<E>, K extends NonEmptyReadonlyArray<string> ? K[number] : K>) => Layer<ROut2, E2, RIn2>): <RIn, ROut>(self: Layer<ROut, E, RIn>) => Layer<ROut & ROut2, E2 | Types.ExcludeTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>, RIn2 | RIn>;
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
    <RIn, E, ROut, const K extends Types.Tags<E> | NonEmptyReadonlyArray<Types.Tags<E>>, RIn2, E2, ROut2>(self: Layer<ROut, E, RIn>, k: K, f: (e: Types.ExtractTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>) => Layer<ROut2, E2, RIn2>): Layer<ROut & ROut2, E2 | Types.ExcludeTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>, RIn | RIn2>;
};
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
export declare const catchCause: {
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
    <E, RIn2, E2, ROut2>(onError: (cause: Cause.Cause<E>) => Layer<ROut2, E2, RIn2>): <RIn, ROut>(self: Layer<ROut, E, RIn>) => Layer<ROut & ROut2, E2, RIn2 | RIn>;
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
    <RIn, E, ROut, RIn2, E2, ROut22>(self: Layer<ROut, E, RIn>, onError: (cause: Cause.Cause<E>) => Layer<ROut22, E2, RIn2>): Layer<ROut & ROut22, E2, RIn | RIn2>;
};
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
export declare const updateService: {
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
    <I, A>(service: Context.Key<I, A>, f: (a: Types.NoInfer<A>) => A): <A1, E1, R1>(layer: Layer<A1, E1, R1>) => Layer<A1, E1, I | R1>;
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
    <A1, E1, R1, I, A>(layer: Layer<A1, E1, R1>, service: Context.Key<I, A>, f: (a: Types.NoInfer<A>) => A): Layer<A1, E1, I | R1>;
};
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
export declare const fresh: <A, E, R>(self: Layer<A, E, R>) => Layer<A, E, R>;
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
export declare const launch: <RIn, E, ROut>(self: Layer<ROut, E, RIn>) => Effect<never, E, RIn>;
/**
 * A utility type for creating partial mocks of services in testing.
 *
 * This type makes Effect methods and Effect-returning functions optional,
 * while keeping non-Effect properties required. This allows you to provide
 * only the methods you need to test while leaving others unimplemented.
 *
 * @since 4.0.0
 * @category Testing
 */
export type PartialEffectful<A extends object> = Types.Simplify<{
    [K in keyof A as A[K] extends AnyEffectOrStream ? K : never]?: A[K];
} & {
    [K in keyof A as A[K] extends AnyEffectOrStream ? never : K]: A[K];
}>;
type AnyEffectOrStream = Effect<any, any, any> | Stream.Stream<any, any, any> | Channel.Channel<any, any, any, any, any, any, any> | ((...args: any) => Effect<any, any, any>) | ((...args: any) => Stream.Stream<any, any, any>) | ((...args: any) => Channel.Channel<any, any, any, any, any, any, any>);
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
export declare const mock: {
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
    <I, S extends object>(service: Context.Key<I, S>): (implementation: PartialEffectful<S>) => Layer<I>;
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
    <I, S extends object>(service: Context.Key<I, S>, implementation: Types.NoInfer<PartialEffectful<S>>): Layer<I>;
};
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
export declare const satisfiesSuccessType: <ROut>() => <ROut2 extends ROut, E, RIn>(layer: Layer<ROut2, E, RIn>) => Layer<ROut2, E, RIn>;
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
export declare const satisfiesErrorType: <E>() => <ROut, E2 extends E, RIn>(layer: Layer<ROut, E2, RIn>) => Layer<ROut, E2, RIn>;
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
export declare const satisfiesServicesType: <RIn>() => <ROut, E, RIn2 extends RIn>(layer: Layer<ROut, E, RIn2>) => Layer<ROut, E, RIn2>;
/**
 * Represents options that can be used to control the behavior of spans created
 * for layers.
 *
 * @since 4.0.0
 * @category Models
 */
export interface SpanOptions extends Tracer.SpanOptions {
    /**
     * A function that will be called when the span associated with the layer is
     * ending (i.e. when the `Scope` that the span is associated with is closed).
     */
    readonly onEnd?: ((span: Tracer.Span, exit: Exit.Exit<unknown, unknown>) => Effect<void>) | undefined;
}
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
export declare const span: (name: string, options?: SpanOptions) => Layer<Tracer.ParentSpan>;
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
export declare const parentSpan: (span: Tracer.AnySpan) => Layer<Tracer.ParentSpan>;
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
export declare const withSpan: {
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
    (name: string, options?: SpanOptions): <A, E, R>(self: Layer<A, E, R>) => Layer<A, E, Exclude<R, Tracer.ParentSpan>>;
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
    <A, E, R>(self: Layer<A, E, R>, name: string, options?: SpanOptions): Layer<A, E, Exclude<R, Tracer.ParentSpan>>;
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
export declare const withParentSpan: {
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
    (span: Tracer.AnySpan, options?: Tracer.TraceOptions): <A, E, R>(self: Layer<A, E, R>) => Layer<A, E, Exclude<R, Tracer.ParentSpan>>;
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
    <A, E, R>(self: Layer<A, E, R>, span: Tracer.AnySpan, options?: Tracer.TraceOptions): Layer<A, E, Exclude<R, Tracer.ParentSpan>>;
};
//# sourceMappingURL=Layer.d.ts.map