/**
 * @since 2.0.0
 */
import type { NonEmptyArray } from "./Array.ts";
import * as Cache from "./Cache.ts";
import type * as Duration from "./Duration.ts";
import * as Effect from "./Effect.ts";
import { type Pipeable } from "./Pipeable.ts";
import type * as Request from "./Request.ts";
import type * as Schema from "./Schema.ts";
import type { Scope } from "./Scope.ts";
import * as Tracer from "./Tracer.ts";
import type * as Types from "./Types.ts";
import type * as Persistable from "./unstable/persistence/Persistable.ts";
import * as Persistence from "./unstable/persistence/Persistence.ts";
declare const TypeId = "~effect/RequestResolver";
/**
 * The `RequestResolver<A, R>` interface requires an environment `R` and handles
 * the execution of requests of type `A`.
 *
 * Implementations must provide a `runAll` method, which processes a collection
 * of requests and produces an effect that fulfills these requests. Requests are
 * organized into a `Array<Array<A>>`, where the outer `Array` groups requests
 * into batches that are executed sequentially, and each inner `Array` contains
 * requests that can be executed in parallel. This structure allows
 * implementations to analyze all incoming requests collectively and optimize
 * query execution accordingly.
 *
 * Implementations are typically specialized for a subtype of `Request<A, E>`.
 * However, they are not strictly limited to these subtypes as long as they can
 * map any given request type to `Request<A, E>`. Implementations should inspect
 * the collection of requests to identify the needed information and execute the
 * corresponding queries. It is imperative that implementations resolve all the
 * requests they receive. Failing to do so will lead to a `QueryFailure` error
 * during query execution.
 *
 * @example
 * ```ts
 * import type { Request } from "effect"
 * import { Effect, Exit, RequestResolver } from "effect"
 *
 * interface GetUserRequest extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserRequest"
 *   readonly id: number
 * }
 *
 * // In practice, you would typically use RequestResolver.make() instead
 * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))
 *     }
 *   })
 * )
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface RequestResolver<in A extends Request.Any> extends RequestResolver.Variance<A>, Pipeable {
    readonly delay: Effect.Effect<void>;
    /**
     * Get a batch key for the given request.
     */
    batchKey(entry: Request.Entry<A>): unknown;
    /**
     * An optional pre-check function that can be used to filter requests before
     * they are added to a batch. If the function returns `false`, the request
     * will not be processed.
     */
    readonly preCheck: ((entry: Request.Entry<A>) => boolean) | undefined;
    /**
     * Should the resolver continue collecting requests? Otherwise, it will
     * immediately execute the collected requests cutting the delay short.
     */
    collectWhile(entries: ReadonlySet<Request.Entry<A>>): boolean;
    /**
     * Execute a collection of requests.
     */
    runAll(entries: NonEmptyArray<Request.Entry<A>>, key: unknown): Effect.Effect<void, Request.Error<A>>;
}
/**
 * @since 2.0.0
 * @category models
 */
export declare namespace RequestResolver {
    /**
     * @since 2.0.0
     * @category models
     */
    interface Variance<in A> {
        readonly [TypeId]: {
            readonly _A: Types.Contravariant<A>;
        };
    }
}
/**
 * Returns `true` if the specified value is a `RequestResolver`, `false` otherwise.
 *
 * @since 2.0.0
 * @category guards
 */
export declare const isRequestResolver: (u: unknown) => u is RequestResolver<any>;
/**
 * Low-level constructor for creating a request resolver with fine-grained
 * control over its behavior.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeWith: <A extends Request.Any>(options: {
    readonly batchKey: (request: Request.Entry<A>) => unknown;
    readonly preCheck?: ((entry: Request.Entry<A>) => boolean) | undefined;
    readonly delay: Effect.Effect<void>;
    readonly collectWhile: (requests: ReadonlySet<Request.Entry<A>>) => boolean;
    readonly runAll: (entries: NonEmptyArray<Request.Entry<A>>, key: unknown) => Effect.Effect<void, Request.Error<A>>;
}) => RequestResolver<A>;
/**
 * Constructs a request resolver with the specified method to run requests.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * // Define a request type
 * interface GetUserRequest extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserRequest"
 *   readonly id: number
 * }
 * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
 *
 * // Create a resolver that handles the requests
 * const UserResolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       // Complete each request with a result
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Use the resolver to handle requests
 * const getUserEffect = Effect.request(GetUserRequest({ id: 123 }), UserResolver)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const make: <A extends Request.Any>(runAll: (entries: NonEmptyArray<Request.Entry<A>>, key: unknown) => Effect.Effect<void, Request.Error<A>>) => RequestResolver<A>;
/**
 * Constructs a request resolver with the requests grouped by a calculated key.
 *
 * The key can use the Equal trait to determine if two keys are equal.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetUserByRole extends Request.Request<string, Error> {
 *   readonly _tag: "GetUserByRole"
 *   readonly role: string
 *   readonly id: number
 * }
 * const GetUserByRole = Request.tagged<GetUserByRole>("GetUserByRole")
 *
 * // Group requests by role for efficient batch processing
 * const UserByRoleResolver = RequestResolver.makeGrouped<GetUserByRole, string>({
 *   key: ({ request }) => request.role,
 *   resolver: (entries, role) =>
 *     Effect.sync(() => {
 *       console.log(`Processing ${entries.length} requests for role: ${role}`)
 *       for (const entry of entries) {
 *         entry.completeUnsafe(
 *           Exit.succeed(`User ${entry.request.id} with role ${role}`)
 *         )
 *       }
 *     })
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeGrouped: <A extends Request.Any, K>(options: {
    readonly key: (entry: Request.Entry<A>) => K;
    readonly resolver: (entries: NonEmptyArray<Request.Entry<A>>, key: K) => Effect.Effect<void, Request.Error<A>>;
}) => RequestResolver<A>;
/**
 * Constructs a request resolver from a pure function.
 *
 * @example
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 *
 * interface GetSquareRequest extends Request.Request<number> {
 *   readonly _tag: "GetSquareRequest"
 *   readonly value: number
 * }
 * const GetSquareRequest = Request.tagged<GetSquareRequest>("GetSquareRequest")
 *
 * // Create a resolver from a pure function
 * const SquareResolver = RequestResolver.fromFunction<GetSquareRequest>(
 *   (entry) => entry.request.value * entry.request.value
 * )
 *
 * // Usage
 * const getSquareEffect = Effect.request(
 *   GetSquareRequest({ value: 5 }),
 *   SquareResolver
 * )
 * // Will resolve to 25
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromFunction: <A extends Request.Any>(f: (entry: Request.Entry<A>) => Request.Success<A>) => RequestResolver<A>;
/**
 * Constructs a request resolver from a pure function that takes a list of requests
 * and returns a list of results of the same size. Each item in the result
 * list must correspond to the item at the same index in the request list.
 *
 * @example
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 *
 * interface GetDoubleRequest extends Request.Request<number> {
 *   readonly _tag: "GetDoubleRequest"
 *   readonly value: number
 * }
 * const GetDoubleRequest = Request.tagged<GetDoubleRequest>("GetDoubleRequest")
 *
 * // Create a resolver that processes multiple requests in a batch
 * const DoubleResolver = RequestResolver.fromFunctionBatched<GetDoubleRequest>(
 *   (entries) => entries.map((entry) => entry.request.value * 2)
 * )
 *
 * // Usage with multiple requests
 * const effects = [1, 2, 3].map((value) =>
 *   Effect.request(GetDoubleRequest({ value }), DoubleResolver)
 * )
 * const batchedEffect = Effect.all(effects) // [2, 4, 6]
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromFunctionBatched: <A extends Request.Any>(f: (entries: NonEmptyArray<Request.Entry<A>>) => Iterable<Request.Success<A>>) => RequestResolver<A>;
/**
 * Constructs a request resolver from an effectual function.
 *
 * @example
 * ```ts
 * import { Effect, Request, RequestResolver } from "effect"
 *
 * interface GetUserFromAPIRequest extends Request.Request<string> {
 *   readonly _tag: "GetUserFromAPIRequest"
 *   readonly id: number
 * }
 * const GetUserFromAPIRequest = Request.tagged<GetUserFromAPIRequest>(
 *   "GetUserFromAPIRequest"
 * )
 *
 * // Create a resolver that uses effects (like HTTP calls)
 * const UserAPIResolver = RequestResolver.fromEffect<GetUserFromAPIRequest>(
 *   (entry) =>
 *     Effect.gen(function*() {
 *       // Simulate an API call
 *       yield* Effect.sleep("100 millis")
 *       // Just return the result without error handling for simplicity
 *       return `User ${entry.request.id} from API`
 *     })
 * )
 *
 * // Usage
 * const getUserEffect = Effect.request(
 *   GetUserFromAPIRequest({ id: 123 }),
 *   UserAPIResolver
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromEffect: <A extends Request.Any>(f: (entry: Request.Entry<A>) => Effect.Effect<Request.Success<A>, Request.Error<A>>) => RequestResolver<A>;
/**
 * Constructs a request resolver from a list of tags paired to functions, that takes
 * a list of requests and returns a list of results of the same size. Each item
 * in the result list must correspond to the item at the same index in the
 * request list.
 *
 * @example
 * ```ts
 * import type { Request } from "effect"
 * import { Effect, RequestResolver } from "effect"
 *
 * interface GetUser extends Request.Request<string, Error> {
 *   readonly _tag: "GetUser"
 *   readonly id: number
 * }
 *
 * interface GetPost extends Request.Request<string, Error> {
 *   readonly _tag: "GetPost"
 *   readonly id: number
 * }
 *
 * type MyRequest = GetUser | GetPost
 *
 * // Create a resolver that handles different request types
 * const MyResolver = RequestResolver.fromEffectTagged<MyRequest>()({
 *   GetUser: (requests) =>
 *     Effect.succeed(requests.map((req) => `User ${req.request.id}`)),
 *   GetPost: (requests) =>
 *     Effect.succeed(requests.map((req) => `Post ${req.request.id}`))
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const fromEffectTagged: <A extends Request.Any & {
    readonly _tag: string;
}>() => <Fns extends { readonly [Tag in A["_tag"]]: [Extract<A, {
    readonly _tag: Tag;
}>] extends [infer Req] ? Req extends Request.Request<infer ReqA, infer ReqE, infer _ReqR> ? (requests: Array<Request.Entry<Req>>) => Effect.Effect<Iterable<ReqA>, ReqE> : never : never; }>(fns: Fns) => RequestResolver<A>;
/**
 * Sets the batch delay effect for this request resolver.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed("data"))
 *     }
 *   })
 * )
 *
 * // Set a custom delay effect (e.g., with logging)
 * const resolverWithCustomDelay = RequestResolver.setDelayEffect(
 *   resolver,
 *   Effect.gen(function*() {
 *     yield* Effect.log("Waiting before processing batch...")
 *     yield* Effect.sleep("50 millis")
 *   })
 * )
 * ```
 *
 * @since 4.0.0
 * @category delay
 */
export declare const setDelayEffect: {
    /**
     * Sets the batch delay effect for this request resolver.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Set a custom delay effect (e.g., with logging)
     * const resolverWithCustomDelay = RequestResolver.setDelayEffect(
     *   resolver,
     *   Effect.gen(function*() {
     *     yield* Effect.log("Waiting before processing batch...")
     *     yield* Effect.sleep("50 millis")
     *   })
     * )
     * ```
     *
     * @since 4.0.0
     * @category delay
     */
    (delay: Effect.Effect<void>): <A extends Request.Any>(self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * Sets the batch delay effect for this request resolver.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Set a custom delay effect (e.g., with logging)
     * const resolverWithCustomDelay = RequestResolver.setDelayEffect(
     *   resolver,
     *   Effect.gen(function*() {
     *     yield* Effect.log("Waiting before processing batch...")
     *     yield* Effect.sleep("50 millis")
     *   })
     * )
     * ```
     *
     * @since 4.0.0
     * @category delay
     */
    <A extends Request.Any>(self: RequestResolver<A>, delay: Effect.Effect<void>): RequestResolver<A>;
};
/**
 * Sets the batch delay window for this request resolver to the specified duration.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed("data"))
 *     }
 *   })
 * )
 *
 * // Add a 100ms delay to batch requests together
 * const delayedResolver = RequestResolver.setDelay(resolver, "100 millis")
 *
 * // Can also use number for milliseconds
 * const delayedResolver2 = RequestResolver.setDelay(resolver, 100)
 * ```
 *
 * @since 4.0.0
 * @category delay
 */
export declare const setDelay: {
    /**
     * Sets the batch delay window for this request resolver to the specified duration.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Add a 100ms delay to batch requests together
     * const delayedResolver = RequestResolver.setDelay(resolver, "100 millis")
     *
     * // Can also use number for milliseconds
     * const delayedResolver2 = RequestResolver.setDelay(resolver, 100)
     * ```
     *
     * @since 4.0.0
     * @category delay
     */
    (duration: Duration.Input): <A extends Request.Any>(self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * Sets the batch delay window for this request resolver to the specified duration.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Add a 100ms delay to batch requests together
     * const delayedResolver = RequestResolver.setDelay(resolver, "100 millis")
     *
     * // Can also use number for milliseconds
     * const delayedResolver2 = RequestResolver.setDelay(resolver, 100)
     * ```
     *
     * @since 4.0.0
     * @category delay
     */
    <A extends Request.Any>(self: RequestResolver<A>, duration: Duration.Input): RequestResolver<A>;
};
/**
 * A request resolver aspect that executes requests between two effects, `before`
 * and `after`, where the result of `before` can be used by `after`.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed("data"))
 *     }
 *   })
 * )
 *
 * // Add setup and cleanup around request execution
 * const resolverWithAround = RequestResolver.around(
 *   resolver,
 *   (entries) =>
 *     Effect.gen(function*() {
 *       yield* Effect.log(`Starting batch of ${entries.length} requests`)
 *       return Date.now()
 *     }),
 *   (entries, startTime) =>
 *     Effect.gen(function*() {
 *       const duration = Date.now() - startTime
 *       yield* Effect.log(`Batch completed in ${duration}ms`)
 *     })
 * )
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const around: {
    /**
     * A request resolver aspect that executes requests between two effects, `before`
     * and `after`, where the result of `before` can be used by `after`.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Add setup and cleanup around request execution
     * const resolverWithAround = RequestResolver.around(
     *   resolver,
     *   (entries) =>
     *     Effect.gen(function*() {
     *       yield* Effect.log(`Starting batch of ${entries.length} requests`)
     *       return Date.now()
     *     }),
     *   (entries, startTime) =>
     *     Effect.gen(function*() {
     *       const duration = Date.now() - startTime
     *       yield* Effect.log(`Batch completed in ${duration}ms`)
     *     })
     * )
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A extends Request.Any, A2, X>(before: (entries: NonEmptyArray<Request.Entry<NoInfer<A>>>) => Effect.Effect<A2, Request.Error<A>>, after: (entries: NonEmptyArray<Request.Entry<NoInfer<A>>>, a: A2) => Effect.Effect<X, Request.Error<A>>): (self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * A request resolver aspect that executes requests between two effects, `before`
     * and `after`, where the result of `before` can be used by `after`.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed("data"))
     *     }
     *   })
     * )
     *
     * // Add setup and cleanup around request execution
     * const resolverWithAround = RequestResolver.around(
     *   resolver,
     *   (entries) =>
     *     Effect.gen(function*() {
     *       yield* Effect.log(`Starting batch of ${entries.length} requests`)
     *       return Date.now()
     *     }),
     *   (entries, startTime) =>
     *     Effect.gen(function*() {
     *       const duration = Date.now() - startTime
     *       yield* Effect.log(`Batch completed in ${duration}ms`)
     *     })
     * )
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A extends Request.Any, A2, X>(self: RequestResolver<A>, before: (entries: NonEmptyArray<Request.Entry<NoInfer<A>>>) => Effect.Effect<A2, Request.Error<A>>, after: (entries: NonEmptyArray<Request.Entry<NoInfer<A>>>, a: A2) => Effect.Effect<X, Request.Error<A>>): RequestResolver<A>;
};
/**
 * A request resolver that never executes requests.
 *
 * @since 2.0.0
 * @category constructors
 */
export declare const never: RequestResolver<never>;
/**
 * Returns a request resolver that executes at most `n` requests in parallel.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 *   readonly id: number
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     console.log(`Processing batch of ${entries.length} requests`)
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Limit batches to maximum 5 requests
 * const limitedResolver = RequestResolver.batchN(resolver, 5)
 *
 * // When more than 5 requests are made, they'll be split into multiple batches
 * const requests = Array.from(
 *   { length: 12 },
 *   (_, i) => Effect.request(GetDataRequest({ id: i }), limitedResolver)
 * )
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const batchN: {
    /**
     * Returns a request resolver that executes at most `n` requests in parallel.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     console.log(`Processing batch of ${entries.length} requests`)
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Limit batches to maximum 5 requests
     * const limitedResolver = RequestResolver.batchN(resolver, 5)
     *
     * // When more than 5 requests are made, they'll be split into multiple batches
     * const requests = Array.from(
     *   { length: 12 },
     *   (_, i) => Effect.request(GetDataRequest({ id: i }), limitedResolver)
     * )
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    (n: number): <A extends Request.Any>(self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * Returns a request resolver that executes at most `n` requests in parallel.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     console.log(`Processing batch of ${entries.length} requests`)
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Limit batches to maximum 5 requests
     * const limitedResolver = RequestResolver.batchN(resolver, 5)
     *
     * // When more than 5 requests are made, they'll be split into multiple batches
     * const requests = Array.from(
     *   { length: 12 },
     *   (_, i) => Effect.request(GetDataRequest({ id: i }), limitedResolver)
     * )
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A extends Request.Any>(self: RequestResolver<A>, n: number): RequestResolver<A>;
};
/**
 * Transform a request resolver by grouping requests using the specified key
 * function.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetUserRequest extends Request.Request<string> {
 *   readonly _tag: "GetUserRequest"
 *   readonly userId: number
 *   readonly department: string
 * }
 * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
 *
 * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
 *   Effect.sync(() => {
 *     console.log(`Processing ${entries.length} users`)
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.userId}`))
 *     }
 *   })
 * )
 *
 * // Group requests by department for more efficient processing
 * const groupedResolver = RequestResolver.grouped(
 *   resolver,
 *   ({ request }) => request.department
 * )
 *
 * // Requests for the same department will be batched together
 * const requests = [
 *   Effect.request(
 *     GetUserRequest({ userId: 1, department: "Engineering" }),
 *     groupedResolver
 *   ),
 *   Effect.request(
 *     GetUserRequest({ userId: 2, department: "Engineering" }),
 *     groupedResolver
 *   ),
 *   Effect.request(
 *     GetUserRequest({ userId: 3, department: "Marketing" }),
 *     groupedResolver
 *   )
 * ]
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const grouped: {
    /**
     * Transform a request resolver by grouping requests using the specified key
     * function.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetUserRequest extends Request.Request<string> {
     *   readonly _tag: "GetUserRequest"
     *   readonly userId: number
     *   readonly department: string
     * }
     * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
     *
     * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
     *   Effect.sync(() => {
     *     console.log(`Processing ${entries.length} users`)
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.userId}`))
     *     }
     *   })
     * )
     *
     * // Group requests by department for more efficient processing
     * const groupedResolver = RequestResolver.grouped(
     *   resolver,
     *   ({ request }) => request.department
     * )
     *
     * // Requests for the same department will be batched together
     * const requests = [
     *   Effect.request(
     *     GetUserRequest({ userId: 1, department: "Engineering" }),
     *     groupedResolver
     *   ),
     *   Effect.request(
     *     GetUserRequest({ userId: 2, department: "Engineering" }),
     *     groupedResolver
     *   ),
     *   Effect.request(
     *     GetUserRequest({ userId: 3, department: "Marketing" }),
     *     groupedResolver
     *   )
     * ]
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <A extends Request.Any, K>(f: (entry: Request.Entry<A>) => K): (self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * Transform a request resolver by grouping requests using the specified key
     * function.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetUserRequest extends Request.Request<string> {
     *   readonly _tag: "GetUserRequest"
     *   readonly userId: number
     *   readonly department: string
     * }
     * const GetUserRequest = Request.tagged<GetUserRequest>("GetUserRequest")
     *
     * const resolver = RequestResolver.make<GetUserRequest>((entries) =>
     *   Effect.sync(() => {
     *     console.log(`Processing ${entries.length} users`)
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`User ${entry.request.userId}`))
     *     }
     *   })
     * )
     *
     * // Group requests by department for more efficient processing
     * const groupedResolver = RequestResolver.grouped(
     *   resolver,
     *   ({ request }) => request.department
     * )
     *
     * // Requests for the same department will be batched together
     * const requests = [
     *   Effect.request(
     *     GetUserRequest({ userId: 1, department: "Engineering" }),
     *     groupedResolver
     *   ),
     *   Effect.request(
     *     GetUserRequest({ userId: 2, department: "Engineering" }),
     *     groupedResolver
     *   ),
     *   Effect.request(
     *     GetUserRequest({ userId: 3, department: "Marketing" }),
     *     groupedResolver
     *   )
     * ]
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <A extends Request.Any, K>(self: RequestResolver<A>, f: (entry: Request.Entry<A>) => K): RequestResolver<A>;
};
/**
 * Returns a new request resolver that executes requests by sending them to this
 * request resolver and that request resolver, returning the results from the first data
 * source to complete and safely interrupting the loser.
 *
 * The batch delay is determined by the first request resolver.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 *   readonly id: number
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * // Fast resolver (simulating cache)
 * const fastResolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("10 millis")
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`fast-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Slow resolver (simulating database)
 * const slowResolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`slow-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Race resolvers - will use whichever completes first
 * const racingResolver = RequestResolver.race(fastResolver, slowResolver)
 * ```
 *
 * @since 2.0.0
 * @category combinators
 */
export declare const race: {
    /**
     * Returns a new request resolver that executes requests by sending them to this
     * request resolver and that request resolver, returning the results from the first data
     * source to complete and safely interrupting the loser.
     *
     * The batch delay is determined by the first request resolver.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * // Fast resolver (simulating cache)
     * const fastResolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.gen(function*() {
     *     yield* Effect.sleep("10 millis")
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`fast-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Slow resolver (simulating database)
     * const slowResolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.gen(function*() {
     *     yield* Effect.sleep("100 millis")
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`slow-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Race resolvers - will use whichever completes first
     * const racingResolver = RequestResolver.race(fastResolver, slowResolver)
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A2 extends Request.Any>(that: RequestResolver<A2>): <A extends Request.Any>(self: RequestResolver<A>) => RequestResolver<A2 & A>;
    /**
     * Returns a new request resolver that executes requests by sending them to this
     * request resolver and that request resolver, returning the results from the first data
     * source to complete and safely interrupting the loser.
     *
     * The batch delay is determined by the first request resolver.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * // Fast resolver (simulating cache)
     * const fastResolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.gen(function*() {
     *     yield* Effect.sleep("10 millis")
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`fast-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Slow resolver (simulating database)
     * const slowResolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.gen(function*() {
     *     yield* Effect.sleep("100 millis")
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`slow-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Race resolvers - will use whichever completes first
     * const racingResolver = RequestResolver.race(fastResolver, slowResolver)
     * ```
     *
     * @since 2.0.0
     * @category combinators
     */
    <A extends Request.Any, A2 extends Request.Any>(self: RequestResolver<A>, that: RequestResolver<A2>): RequestResolver<A & A2>;
};
/**
 * Add a tracing span to the request resolver, which will also add any span
 * links from the request's.
 *
 * @example
 * ```ts
 * import { Effect, Exit, Request, RequestResolver } from "effect"
 *
 * interface GetDataRequest extends Request.Request<string> {
 *   readonly _tag: "GetDataRequest"
 *   readonly id: number
 * }
 * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
 *
 * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
 *   Effect.sync(() => {
 *     for (const entry of entries) {
 *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
 *     }
 *   })
 * )
 *
 * // Add tracing span with custom name and attributes
 * const tracedResolver = RequestResolver.withSpan(
 *   resolver,
 *   "user-data-resolver",
 *   {
 *     attributes: {
 *       "resolver.type": "user-data",
 *       "resolver.version": "1.0"
 *     }
 *   }
 * )
 *
 * // Spans will automatically include batch size and request links
 * const effect = Effect.request(GetDataRequest({ id: 123 }), tracedResolver)
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withSpan: {
    /**
     * Add a tracing span to the request resolver, which will also add any span
     * links from the request's.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Add tracing span with custom name and attributes
     * const tracedResolver = RequestResolver.withSpan(
     *   resolver,
     *   "user-data-resolver",
     *   {
     *     attributes: {
     *       "resolver.type": "user-data",
     *       "resolver.version": "1.0"
     *     }
     *   }
     * )
     *
     * // Spans will automatically include batch size and request links
     * const effect = Effect.request(GetDataRequest({ id: 123 }), tracedResolver)
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <A extends Request.Any>(name: string, options?: Tracer.SpanOptions | ((entries: NonEmptyArray<Request.Entry<A>>) => Tracer.SpanOptions) | undefined): (self: RequestResolver<A>) => RequestResolver<A>;
    /**
     * Add a tracing span to the request resolver, which will also add any span
     * links from the request's.
     *
     * @example
     * ```ts
     * import { Effect, Exit, Request, RequestResolver } from "effect"
     *
     * interface GetDataRequest extends Request.Request<string> {
     *   readonly _tag: "GetDataRequest"
     *   readonly id: number
     * }
     * const GetDataRequest = Request.tagged<GetDataRequest>("GetDataRequest")
     *
     * const resolver = RequestResolver.make<GetDataRequest>((entries) =>
     *   Effect.sync(() => {
     *     for (const entry of entries) {
     *       entry.completeUnsafe(Exit.succeed(`data-${entry.request.id}`))
     *     }
     *   })
     * )
     *
     * // Add tracing span with custom name and attributes
     * const tracedResolver = RequestResolver.withSpan(
     *   resolver,
     *   "user-data-resolver",
     *   {
     *     attributes: {
     *       "resolver.type": "user-data",
     *       "resolver.version": "1.0"
     *     }
     *   }
     * )
     *
     * // Spans will automatically include batch size and request links
     * const effect = Effect.request(GetDataRequest({ id: 123 }), tracedResolver)
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <A extends Request.Any>(self: RequestResolver<A>, name: string, options?: Tracer.SpanOptions | ((entries: NonEmptyArray<Request.Entry<A>>) => Tracer.SpanOptions) | undefined): RequestResolver<A>;
};
/**
 * Wraps a request resolver in a cache, allowing it to cache results up to a
 * specified capacity and optional time-to-live.
 *
 * @since 4.0.0
 * @category Caching
 */
export declare const asCache: {
    /**
     * Wraps a request resolver in a cache, allowing it to cache results up to a
     * specified capacity and optional time-to-live.
     *
     * @since 4.0.0
     * @category Caching
     */
    <A extends Request.Any, ServiceMode extends "lookup" | "construction" = never>(options: {
        readonly capacity: number;
        readonly timeToLive?: ((exit: Request.Result<A>, request: A) => Duration.Input) | undefined;
        readonly requireServicesAt?: ServiceMode | undefined;
    }): (self: RequestResolver<A>) => Effect.Effect<Cache.Cache<A, Request.Success<A>, Request.Error<A>, "construction" extends ServiceMode ? never : Request.Services<A>>, never, "construction" extends ServiceMode ? Request.Services<A> : never>;
    /**
     * Wraps a request resolver in a cache, allowing it to cache results up to a
     * specified capacity and optional time-to-live.
     *
     * @since 4.0.0
     * @category Caching
     */
    <A extends Request.Any, ServiceMode extends "lookup" | "construction" = never>(self: RequestResolver<A>, options: {
        readonly capacity: number;
        readonly timeToLive?: ((exit: Request.Result<A>, request: A) => Duration.Input) | undefined;
        readonly requireServicesAt?: ServiceMode | undefined;
    }): Effect.Effect<Cache.Cache<A, Request.Success<A>, Request.Error<A>, "construction" extends ServiceMode ? never : Request.Services<A>>, never, "construction" extends ServiceMode ? Request.Services<A> : never>;
};
/**
 * Adds caching capabilities to a request resolver, allowing it to cache
 * results up to a specified capacity.
 *
 * @since 4.0.0
 * @category Caching
 */
export declare const withCache: {
    /**
     * Adds caching capabilities to a request resolver, allowing it to cache
     * results up to a specified capacity.
     *
     * @since 4.0.0
     * @category Caching
     */
    <A extends Request.Any>(options: {
        readonly capacity: number;
        readonly strategy?: "lru" | "fifo" | undefined;
    }): (self: RequestResolver<A>) => Effect.Effect<RequestResolver<A>>;
    /**
     * Adds caching capabilities to a request resolver, allowing it to cache
     * results up to a specified capacity.
     *
     * @since 4.0.0
     * @category Caching
     */
    <A extends Request.Any>(self: RequestResolver<A>, options: {
        readonly capacity: number;
        readonly strategy?: "lru" | "fifo" | undefined;
    }): Effect.Effect<RequestResolver<A>>;
};
/**
 * @since 4.0.0
 * @category Persistence
 */
export declare const persisted: {
    /**
     * @since 4.0.0
     * @category Persistence
     */
    <A extends Request.Request<any, Persistence.PersistenceError | Schema.SchemaError, any> & Persistable.Any>(options: {
        readonly storeId: string;
        readonly timeToLive?: ((exit: Request.Result<A>, request: A) => Duration.Input) | undefined;
        readonly staleWhileRevalidate?: ((exit: Request.Result<A>, request: A) => boolean) | undefined;
    }): (self: RequestResolver<A>) => Effect.Effect<RequestResolver<A>, never, Persistence.Persistence | Scope>;
    /**
     * @since 4.0.0
     * @category Persistence
     */
    <A extends Request.Request<any, Persistence.PersistenceError | Schema.SchemaError, any> & Persistable.Any>(self: RequestResolver<A>, options: {
        readonly storeId: string;
        readonly timeToLive?: ((exit: Request.Result<A>, request: A) => Duration.Input) | undefined;
        readonly staleWhileRevalidate?: ((exit: Request.Result<A>, request: A) => boolean) | undefined;
    }): Effect.Effect<RequestResolver<A>, never, Persistence.Persistence | Scope>;
};
export {};
//# sourceMappingURL=RequestResolver.d.ts.map