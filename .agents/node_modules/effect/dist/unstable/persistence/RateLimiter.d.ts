/**
 * @since 4.0.0
 */
import * as Config from "../../Config.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import * as Redis from "./Redis.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category Type IDs
 */
export type TypeId = "~effect/persistence/RateLimiter";
/**
 * @since 4.0.0
 * @category Models
 */
export interface RateLimiter {
    readonly [TypeId]: TypeId;
    readonly consume: (options: {
        readonly algorithm?: "fixed-window" | "token-bucket" | undefined;
        readonly onExceeded?: "delay" | "fail" | undefined;
        readonly window: Duration.Input;
        readonly limit: number;
        readonly key: string;
        readonly tokens?: number | undefined;
    }) => Effect.Effect<ConsumeResult, RateLimiterError>;
}
/**
 * @since 4.0.0
 * @category Tags
 */
export declare const RateLimiter: Context.Service<RateLimiter, RateLimiter>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: Effect.Effect<RateLimiter, never, RateLimiterStore>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<RateLimiter, never, RateLimiterStore>;
/**
 * Access a function that applies rate limiting to an effect.
 *
 * ```ts
 * import { Effect } from "effect"
 * import { RateLimiter } from "effect/unstable/persistence"
 *
 * Effect.gen(function*() {
 *   // Access the `withLimiter` function from the RateLimiter module
 *   const withLimiter = yield* RateLimiter.makeWithRateLimiter
 *
 *   // Apply a rate limiter to an effect
 *   yield* Effect.log("Making a request with rate limiting").pipe(
 *     withLimiter({
 *       key: "some-key",
 *       limit: 10,
 *       onExceeded: "delay",
 *       window: "5 seconds",
 *       algorithm: "fixed-window"
 *     })
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category Accessors
 */
export declare const makeWithRateLimiter: Effect.Effect<((options: {
    readonly algorithm?: "fixed-window" | "token-bucket" | undefined;
    readonly onExceeded?: "delay" | "fail" | undefined;
    readonly window: Duration.Input;
    readonly limit: number;
    readonly key: string;
    readonly tokens?: number | undefined;
}) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | RateLimiterError, R>), never, RateLimiter>;
/**
 * Access a function that sleeps when the rate limit is exceeded.
 *
 * ```ts
 * import { Effect } from "effect"
 * import { RateLimiter } from "effect/unstable/persistence"
 *
 * Effect.gen(function*() {
 *   // Access the `sleep` function from the RateLimiter module
 *   const sleep = yield* RateLimiter.makeSleep
 *
 *   // Use the `sleep` function with specific rate limiting parameters.
 *   // This will only sleep if the rate limit has been exceeded.
 *   yield* sleep({
 *     key: "some-key",
 *     limit: 10,
 *     window: "5 seconds",
 *     algorithm: "fixed-window"
 *   })
 * })
 * ```
 *
 * @since 4.0.0
 * @category Accessors
 */
export declare const makeSleep: Effect.Effect<((options: {
    readonly algorithm?: "fixed-window" | "token-bucket" | undefined;
    readonly window: Duration.Input;
    readonly limit: number;
    readonly key: string;
    readonly tokens?: number | undefined;
}) => Effect.Effect<ConsumeResult, RateLimiterError>), never, RateLimiter>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare const ErrorTypeId: ErrorTypeId;
/**
 * @since 4.0.0
 * @category Errors
 */
export type ErrorTypeId = "~@effect/experimental/RateLimiter/RateLimiterError";
declare const RateLimitExceeded_base: Schema.Class<RateLimitExceeded, Schema.Struct<{
    readonly _tag: Schema.tag<"RateLimitExceeded">;
    readonly retryAfter: Schema.DurationFromMillis;
    readonly key: Schema.String;
    readonly limit: Schema.Number;
    readonly remaining: Schema.Number;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class RateLimitExceeded extends RateLimitExceeded_base {
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const RateLimitStoreError_base: Schema.Class<RateLimitStoreError, Schema.Struct<{
    readonly _tag: Schema.tag<"RateLimitStoreError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class RateLimitStoreError extends RateLimitStoreError_base {
}
/**
 * @since 4.0.0
 * @category Errors
 */
export type RateLimiterErrorReason = RateLimitExceeded | RateLimitStoreError;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare const RateLimiterErrorReason: Schema.Union<[
    typeof RateLimitExceeded,
    typeof RateLimitStoreError
]>;
declare const RateLimiterError_base: Schema.Class<RateLimiterError, Schema.Struct<{
    readonly _tag: Schema.tag<"RateLimiterError">;
    readonly reason: Schema.Union<[typeof RateLimitExceeded, typeof RateLimitStoreError]>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class RateLimiterError extends RateLimiterError_base {
    constructor(props: {
        readonly reason: RateLimiterErrorReason;
    });
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: ErrorTypeId;
    get message(): string;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface ConsumeResult {
    /**
     * The amount of delay to wait before making the next request, when the rate
     * limiter is using the "delay" `onExceeded` strategy.
     *
     * It will be Duration.zero if the request is allowed immediately.
     */
    readonly delay: Duration.Duration;
    /**
     * The maximum number of requests allowed in the current window.
     */
    readonly limit: number;
    /**
     * The number of remaining requests in the current window.
     */
    readonly remaining: number;
    /**
     * The time until the rate limit fully resets.
     */
    readonly resetAfter: Duration.Duration;
}
declare const RateLimiterStore_base: Context.ServiceClass<RateLimiterStore, "effect/persistence/RateLimiter/RateLimiterStore", {
    /**
     * Returns the token count *after* taking the specified `tokens` and time to
     * live for the `key`.
     *
     * If `limit` is provided, the number of taken tokens will be capped at the
     * limit.
     *
     * In the case the limit is exceeded, the returned count will be greater
     * than the limit, but the TTL will not be updated.
     */
    readonly fixedWindow: (options: {
        readonly key: string;
        readonly tokens: number;
        readonly refillRate: Duration.Duration;
        readonly limit: number | undefined;
    }) => Effect.Effect<readonly [count: number, ttl: number], RateLimiterError>;
    /**
     * Returns the current remaining tokens for the `key` after consuming the
     * specified amount of tokens.
     *
     * If `allowOverflow` is true, the number of tokens can drop below zero.
     *
     * In the case of no overflow, the returned token count will only be
     * negative if the requested tokens exceed the available tokens, but the
     * real token count will not be persisted below zero.
     */
    readonly tokenBucket: (options: {
        readonly key: string;
        readonly tokens: number;
        readonly limit: number;
        readonly refillRate: Duration.Duration;
        readonly allowOverflow: boolean;
    }) => Effect.Effect<number, RateLimiterError>;
}>;
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export declare class RateLimiterStore extends RateLimiterStore_base {
}
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export declare const layerStoreMemory: Layer.Layer<RateLimiterStore>;
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export declare const makeStoreRedis: (options?: {
    readonly prefix?: string | undefined;
} | undefined) => Effect.Effect<{
    /**
     * Returns the token count *after* taking the specified `tokens` and time to
     * live for the `key`.
     *
     * If `limit` is provided, the number of taken tokens will be capped at the
     * limit.
     *
     * In the case the limit is exceeded, the returned count will be greater
     * than the limit, but the TTL will not be updated.
     */
    readonly fixedWindow: (options: {
        readonly key: string;
        readonly tokens: number;
        readonly refillRate: Duration.Duration;
        readonly limit: number | undefined;
    }) => Effect.Effect<readonly [count: number, ttl: number], RateLimiterError>;
    /**
     * Returns the current remaining tokens for the `key` after consuming the
     * specified amount of tokens.
     *
     * If `allowOverflow` is true, the number of tokens can drop below zero.
     *
     * In the case of no overflow, the returned token count will only be
     * negative if the requested tokens exceed the available tokens, but the
     * real token count will not be persisted below zero.
     */
    readonly tokenBucket: (options: {
        readonly key: string;
        readonly tokens: number;
        readonly limit: number;
        readonly refillRate: Duration.Duration;
        readonly allowOverflow: boolean;
    }) => Effect.Effect<number, RateLimiterError>;
}, never, Redis.Redis>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerStoreRedis: (options?: {
    readonly prefix?: string | undefined;
}) => Layer.Layer<RateLimiterStore, never, Redis.Redis>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerStoreRedisConfig: (options: Config.Wrap<{
    readonly prefix?: string | undefined;
}>) => Layer.Layer<RateLimiterStore, Config.ConfigError, Redis.Redis>;
export {};
//# sourceMappingURL=RateLimiter.d.ts.map