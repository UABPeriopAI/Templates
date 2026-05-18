/**
 * @since 4.0.0
 */
import * as Config from "../../Config.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import { flow, identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Schema from "../../Schema.js";
import * as Redis from "./Redis.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/persistence/RateLimiter";
/**
 * @since 4.0.0
 * @category Tags
 */
export const RateLimiter = /*#__PURE__*/Context.Service(TypeId);
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = /*#__PURE__*/Effect.gen(function* () {
  const store = yield* RateLimiterStore;
  return identity({
    [TypeId]: TypeId,
    consume(options) {
      const tokens = options.tokens ?? 1;
      const onExceeded = options.onExceeded ?? "fail";
      const algorithm = options.algorithm ?? "fixed-window";
      const window = Duration.max(Duration.fromInputUnsafe(options.window), Duration.millis(1));
      const windowMillis = Duration.toMillis(window);
      const refillRate = Duration.divideUnsafe(window, options.limit);
      const refillRateMillis = Duration.toMillis(refillRate);
      if (tokens > options.limit) {
        return onExceeded === "fail" ? Effect.fail(new RateLimiterError({
          reason: new RateLimitExceeded({
            key: options.key,
            retryAfter: window,
            limit: options.limit,
            remaining: 0
          })
        })) : Effect.succeed({
          delay: window,
          limit: options.limit,
          remaining: 0,
          resetAfter: window
        });
      }
      if (algorithm === "fixed-window") {
        return Effect.flatMap(store.fixedWindow({
          key: options.key,
          tokens,
          refillRate,
          limit: onExceeded === "fail" ? options.limit : undefined
        }), ([count, ttl]) => {
          if (onExceeded === "fail") {
            const remaining = options.limit - count;
            if (remaining < 0) {
              return Effect.fail(new RateLimiterError({
                reason: new RateLimitExceeded({
                  key: options.key,
                  retryAfter: Duration.millis(ttl),
                  limit: options.limit,
                  remaining: 0
                })
              }));
            }
            return Effect.succeed({
              delay: Duration.zero,
              limit: options.limit,
              remaining,
              resetAfter: Duration.millis(ttl)
            });
          }
          const ttlTotal = count * refillRateMillis;
          const elapsed = ttlTotal - ttl;
          const windowNumber = Math.floor((count - 1) / options.limit);
          const remaining = windowNumber * windowMillis - elapsed;
          const delay = remaining <= 0 ? Duration.zero : Duration.millis(remaining);
          return Effect.succeed({
            delay,
            limit: options.limit,
            remaining: options.limit - count,
            resetAfter: Duration.times(window, Math.ceil(ttl / windowMillis))
          });
        });
      }
      return Effect.flatMap(store.tokenBucket({
        key: options.key,
        tokens,
        limit: options.limit,
        refillRate,
        allowOverflow: onExceeded === "delay"
      }), remaining => {
        if (onExceeded === "fail") {
          if (remaining < 0) {
            return Effect.fail(new RateLimiterError({
              reason: new RateLimitExceeded({
                key: options.key,
                retryAfter: Duration.times(refillRate, -remaining),
                limit: options.limit,
                remaining: 0
              })
            }));
          }
          return Effect.succeed({
            delay: Duration.zero,
            limit: options.limit,
            remaining,
            resetAfter: Duration.times(refillRate, options.limit - remaining)
          });
        }
        if (remaining >= 0) {
          return Effect.succeed({
            delay: Duration.zero,
            limit: options.limit,
            remaining,
            resetAfter: Duration.times(refillRate, options.limit - remaining)
          });
        }
        return Effect.succeed({
          delay: Duration.times(refillRate, -remaining),
          limit: options.limit,
          remaining,
          resetAfter: Duration.times(refillRate, options.limit - remaining)
        });
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/Layer.effect(RateLimiter, make);
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
export const makeWithRateLimiter = /*#__PURE__*/RateLimiter.use(limiter => Effect.succeed(options => effect => Effect.flatMap(limiter.consume(options), ({
  delay
}) => {
  if (Duration.isZero(delay)) return effect;
  return Effect.delay(effect, delay);
})));
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
export const makeSleep = /*#__PURE__*/RateLimiter.use(limiter => Effect.succeed(options => Effect.flatMap(limiter.consume({
  ...options,
  onExceeded: "delay"
}), result => {
  if (Duration.isZero(result.delay)) return Effect.succeed(result);
  return Effect.as(Effect.sleep(result.delay), result);
})));
/**
 * @since 4.0.0
 * @category Errors
 */
export const ErrorTypeId = "~@effect/experimental/RateLimiter/RateLimiterError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class RateLimitExceeded extends /*#__PURE__*/Schema.ErrorClass("effect/persistence/RateLimiter/RateLimitExceeded")({
  _tag: /*#__PURE__*/Schema.tag("RateLimitExceeded"),
  retryAfter: Schema.DurationFromMillis,
  key: Schema.String,
  limit: Schema.Number,
  remaining: Schema.Number
}) {
  /**
   * @since 4.0.0
   */
  get message() {
    return `Rate limit exceeded`;
  }
}
/**
 * @since 4.0.0
 * @category Errors
 */
export class RateLimitStoreError extends /*#__PURE__*/Schema.ErrorClass("effect/persistence/RateLimiter/RateLimitStoreError")({
  _tag: /*#__PURE__*/Schema.tag("RateLimitStoreError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {}
/**
 * @since 4.0.0
 * @category Errors
 */
export const RateLimiterErrorReason = /*#__PURE__*/Schema.Union([RateLimitExceeded, RateLimitStoreError]);
/**
 * @since 4.0.0
 * @category Errors
 */
export class RateLimiterError extends /*#__PURE__*/Schema.ErrorClass(ErrorTypeId)({
  _tag: /*#__PURE__*/Schema.tag("RateLimiterError"),
  reason: RateLimiterErrorReason
}) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(props) {
    if ("cause" in props.reason) {
      super({
        ...props,
        cause: props.reason.cause
      });
    } else {
      super(props);
    }
  }
  /**
   * @since 4.0.0
   */
  [ErrorTypeId] = ErrorTypeId;
  get message() {
    return this.reason.message;
  }
}
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export class RateLimiterStore extends /*#__PURE__*/Context.Service()("effect/persistence/RateLimiter/RateLimiterStore") {}
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export const layerStoreMemory = /*#__PURE__*/Layer.sync(RateLimiterStore, () => {
  const fixedCounters = new Map();
  const tokenBuckets = new Map();
  return RateLimiterStore.of({
    fixedWindow: options => Effect.clockWith(clock => Effect.sync(() => {
      const refillRateMillis = Duration.toMillis(options.refillRate);
      const now = clock.currentTimeMillisUnsafe();
      let counter = fixedCounters.get(options.key);
      if (!counter || counter.expiresAt <= now) {
        counter = {
          count: 0,
          expiresAt: now
        };
        fixedCounters.set(options.key, counter);
      }
      if (options.limit && counter.count + options.tokens > options.limit) {
        return [counter.count + options.tokens, counter.expiresAt - now];
      }
      counter.count += options.tokens;
      counter.expiresAt += refillRateMillis * options.tokens;
      return [counter.count, counter.expiresAt - now];
    })),
    tokenBucket: options => Effect.clockWith(clock => Effect.sync(() => {
      const refillRateMillis = Duration.toMillis(options.refillRate);
      const now = clock.currentTimeMillisUnsafe();
      let bucket = tokenBuckets.get(options.key);
      if (!bucket) {
        bucket = {
          tokens: options.limit,
          lastRefill: now
        };
        tokenBuckets.set(options.key, bucket);
      } else {
        const elapsed = now - bucket.lastRefill;
        const tokensToAdd = Math.floor(elapsed / refillRateMillis);
        if (tokensToAdd > 0) {
          bucket.tokens = Math.min(options.limit, bucket.tokens + tokensToAdd);
          bucket.lastRefill += tokensToAdd * refillRateMillis;
        }
      }
      const newTokenCount = bucket.tokens - options.tokens;
      if (options.allowOverflow || newTokenCount >= 0) {
        bucket.tokens = newTokenCount;
      }
      return newTokenCount;
    }))
  });
});
/**
 * @since 4.0.0
 * @category RateLimiterStore
 */
export const makeStoreRedis = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const prefix = options?.prefix ?? "ratelimiter:";
  const redis = yield* Redis.Redis;
  const fixedWindow = redis.eval(fixedWindowScript);
  const tokenBucket = redis.eval(tokenBucketScript);
  return RateLimiterStore.of({
    fixedWindow(options) {
      const key = `${prefix}${options.key}`;
      const refillMillis = Duration.toMillis(options.refillRate);
      return Effect.mapError(fixedWindow(key, options.tokens, refillMillis, options.limit), cause => new RateLimiterError({
        reason: new RateLimitStoreError({
          message: `Failed to execute fixedWindow rate limiting command`,
          cause: cause.cause
        })
      }));
    },
    tokenBucket(options) {
      const key = `${prefix}${options.key}`;
      const refillMillis = Duration.toMillis(options.refillRate);
      return Effect.clockWith(clock => Effect.mapError(tokenBucket(key, options.tokens, refillMillis, options.limit, clock.currentTimeMillisUnsafe(), options.allowOverflow ? 1 : 0), cause => new RateLimiterError({
        reason: new RateLimitStoreError({
          message: `Failed to execute tokenBucket rate limiting command`,
          cause
        })
      })));
    }
  });
});
const fixedWindowScript = /*#__PURE__*/Redis.script((key, tokens, refillMillis, limit) => [key, tokens, refillMillis, limit], {
  numberOfKeys: 1,
  lua: `
local key = KEYS[1]
local tokens = tonumber(ARGV[1])
local refillms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local current = tonumber(redis.call("GET", key))

if not current then
  local nextpttl = refillms * tokens
  redis.call("SET", key, tokens, "PX", nextpttl)
  return { tokens, nextpttl }
end

local currentpttl = tonumber(redis.call("PTTL", key) or "0")
local next = current + tokens
if limit and next > limit then
  return { next, currentpttl }
end

local nextpttl = currentpttl + (refillms * tokens)
redis.call("SET", key, next, "PX", nextpttl)
return { next, nextpttl }
`
}).withReturnType();
const tokenBucketScript = /*#__PURE__*/Redis.script((key, tokens, refillMillis, limit, now, overflow) => [key, tokens, refillMillis, limit, now, overflow], {
  numberOfKeys: 1,
  lua: `
local key = KEYS[1]
local last_refill_key = key .. ":refill"
local tokens = tonumber(ARGV[1])
local refill_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local overflow = ARGV[5] == "1"
local current = tonumber(redis.call("GET", key))
local last_refill = tonumber(redis.call("GET", last_refill_key))

if not current then
  current = limit
  last_refill = now
  redis.call("SET", key, current)
  redis.call("SET", last_refill_key, last_refill)
end

local elapsed = now - last_refill
local refill_amount = math.floor(elapsed / refill_ms)
if refill_amount > 0 then
  current = math.min(current + refill_amount, limit)
  last_refill = last_refill + (refill_amount * refill_ms)
  redis.call("SET", last_refill_key, last_refill)
end

local next = current - tokens
if next < 0 and not overflow then
  redis.call("SET", key, current)
  return next
end

redis.call("SET", key, next)
return next
`
}).withReturnType();
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerStoreRedis = /*#__PURE__*/flow(makeStoreRedis, /*#__PURE__*/Layer.effect(RateLimiterStore));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerStoreRedisConfig = options => Layer.effect(RateLimiterStore, Effect.flatMap(Config.unwrap(options).asEffect(), makeStoreRedis));
//# sourceMappingURL=RateLimiter.js.map