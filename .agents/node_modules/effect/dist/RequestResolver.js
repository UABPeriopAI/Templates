import * as Arr from "./Array.js";
import * as Cache from "./Cache.js";
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import { constTrue, dual, identity } from "./Function.js";
import { exitFail, exitSucceed } from "./internal/core.js";
import * as effect from "./internal/effect.js";
import * as internal from "./internal/request.js";
import * as Iterable from "./Iterable.js";
import * as MutableHashMap from "./MutableHashMap.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as Tracer from "./Tracer.js";
import * as Persistence from "./unstable/persistence/Persistence.js";
const TypeId = "~effect/RequestResolver";
const RequestResolverProto = {
  [TypeId]: {
    _A: identity,
    _R: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Returns `true` if the specified value is a `RequestResolver`, `false` otherwise.
 *
 * @since 2.0.0
 * @category guards
 */
export const isRequestResolver = u => hasProperty(u, TypeId);
/**
 * Low-level constructor for creating a request resolver with fine-grained
 * control over its behavior.
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeWith = options => {
  const self = Object.create(RequestResolverProto);
  self.batchKey = options.batchKey;
  self.preCheck = options.preCheck;
  self.delay = options.delay;
  self.collectWhile = options.collectWhile;
  self.runAll = options.runAll;
  return self;
};
const defaultKeyObject = {};
const defaultKey = _request => defaultKeyObject;
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
export const make = runAll => makeWith({
  batchKey: defaultKey,
  delay: Effect.yieldNow,
  collectWhile: constTrue,
  runAll
});
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
export const makeGrouped = options => makeWith({
  batchKey: hashGroupKey(options.key),
  delay: Effect.yieldNow,
  collectWhile: constTrue,
  runAll: options.resolver
});
const hashGroupKey = get => {
  const groupKeys = MutableHashMap.empty();
  return entry => {
    const key = get(entry);
    const okey = MutableHashMap.get(groupKeys, key);
    if (okey._tag === "Some") {
      return okey.value;
    }
    MutableHashMap.set(groupKeys, key, key);
    return key;
  };
};
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
export const fromFunction = f => make(entries => Effect.sync(() => {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    entry.completeUnsafe(exitSucceed(f(entry)));
  }
}));
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
export const fromFunctionBatched = f => make(entries => Effect.sync(() => {
  let i = 0;
  for (const result of f(entries)) {
    const entry = entries[i++];
    entry.completeUnsafe(exitSucceed(result));
  }
}));
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
export const fromEffect = f => {
  effect.interruptChildrenPatch(); // ensure middleware is registered
  return make(entries => Effect.callback(resume => {
    const parent = effect.getCurrentFiber();
    let done = 0;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const fiber = effect.forkUnsafe(parent, f(entry), true);
      fiber.addObserver(exit => {
        entry.completeUnsafe(exit);
        done++;
        if (done === entries.length) {
          resume(effect.void);
        }
      });
    }
  }));
};
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
export const fromEffectTagged = () => fns => make(entries => {
  const grouped = new Map();
  for (let i = 0, len = entries.length; i < len; i++) {
    const group = grouped.get(entries[i].request._tag);
    if (group) {
      group.push(entries[i]);
    } else {
      grouped.set(entries[i].request._tag, [entries[i]]);
    }
  }
  return Effect.forEach(grouped, ([tag, requests]) => Effect.matchCause(fns[tag](requests), {
    onFailure: cause => {
      for (let i = 0; i < requests.length; i++) {
        const entry = requests[i];
        entry.completeUnsafe(exitFail(cause));
      }
    },
    onSuccess: res => {
      for (let i = 0; i < res.length; i++) {
        const entry = requests[i];
        entry.completeUnsafe(exitSucceed(res[i]));
      }
    }
  }), {
    concurrency: "unbounded",
    discard: true
  });
});
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
export const setDelayEffect = /*#__PURE__*/dual(2, (self, delay) => makeWith({
  ...self,
  delay
}));
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
export const setDelay = /*#__PURE__*/dual(2, (self, duration) => makeWith({
  ...self,
  delay: Effect.sleep(duration)
}));
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
export const around = /*#__PURE__*/dual(3, (self, before, after) => makeWith({
  ...self,
  runAll: (entries, key) => Effect.acquireUseRelease(before(entries), () => self.runAll(entries, key), a => after(entries, a))
}));
/**
 * A request resolver that never executes requests.
 *
 * @since 2.0.0
 * @category constructors
 */
export const never = /*#__PURE__*/make(() => Effect.never);
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
export const batchN = /*#__PURE__*/dual(2, (self, n) => makeWith({
  ...self,
  collectWhile: requests => requests.size < n
}));
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
export const grouped = /*#__PURE__*/dual(2, (self, f) => makeWith({
  ...self,
  batchKey: hashGroupKey(f)
}));
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
export const race = /*#__PURE__*/dual(2, (self, that) => make((requests, key) => effect.race(self.runAll(requests, key), that.runAll(requests, key))));
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
export const withSpan = /*#__PURE__*/dual(args => isRequestResolver(args[0]), (self, name, options) => makeWith({
  ...self,
  runAll: (entries, key) => Effect.suspend(() => {
    const opts = typeof options === "function" ? options(entries) : options;
    const links = opts?.links ? opts.links.slice() : [];
    const seen = new Set();
    for (const entry of entries) {
      const span = Context.getOption(entry.context, Tracer.ParentSpan);
      if (span._tag === "None" || seen.has(span.value)) continue;
      seen.add(span.value);
      links.push({
        span: span.value,
        attributes: {}
      });
    }
    return Effect.withSpan(self.runAll(entries, key), name, {
      ...options,
      links,
      attributes: {
        batchSize: entries.length,
        ...opts?.attributes
      }
    });
  })
}));
/**
 * Wraps a request resolver in a cache, allowing it to cache results up to a
 * specified capacity and optional time-to-live.
 *
 * @since 4.0.0
 * @category Caching
 */
export const asCache = /*#__PURE__*/dual(2, (self, options) => Cache.makeWith(req => internal.request(req, self), {
  capacity: options.capacity,
  timeToLive: options.timeToLive,
  requireServicesAt: options.requireServicesAt ?? "lookup"
}));
/**
 * Adds caching capabilities to a request resolver, allowing it to cache
 * results up to a specified capacity.
 *
 * @since 4.0.0
 * @category Caching
 */
export const withCache = /*#__PURE__*/dual(2, (self, options) => Effect.sync(() => {
  const strategy = options.strategy ?? "lru";
  const cache = MutableHashMap.empty();
  return makeWith({
    ...self,
    runAll(entries, key) {
      return Effect.onExit(self.runAll(entries, key), () => {
        let toRemove = MutableHashMap.size(cache) - options.capacity;
        if (toRemove <= 0) return Effect.void;
        for (const k of MutableHashMap.keys(cache)) {
          MutableHashMap.remove(cache, k);
          toRemove--;
          if (toRemove <= 0) break;
        }
        return Effect.void;
      });
    },
    preCheck(entry) {
      const ocached = MutableHashMap.get(cache, entry.request);
      if (ocached._tag === "None") {
        const cached = {
          entry,
          exit: undefined
        };
        MutableHashMap.set(cache, entry.request, cached);
        const prevComplete = entry.completeUnsafe;
        entry.completeUnsafe = function (exit) {
          cached.exit = exit;
          prevComplete(exit);
        };
        return true;
      }
      const cached = ocached.value;
      if (cached.exit) {
        if (strategy === "lru") {
          MutableHashMap.remove(cache, cached.entry.request);
          MutableHashMap.set(cache, cached.entry.request, cached);
        }
        entry.completeUnsafe(cached.exit);
      } else {
        cached.entry.uninterruptible = true;
        const prevComplete = cached.entry.completeUnsafe;
        cached.entry.completeUnsafe = function (exit) {
          prevComplete(exit);
          entry.completeUnsafe(exit);
        };
      }
      return false;
    }
  });
}));
/**
 * @since 4.0.0
 * @category Persistence
 */
export const persisted = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const store = yield* (yield* Persistence.Persistence).make(options);
  return makeWith({
    ...self,
    runAll: Effect.fnUntraced(function* (entries, key) {
      const results = yield* store.getMany(Iterable.map(entries, _ => _.request)).pipe(Effect.provideContext(entries[0].context));
      const leftover = [];
      const toPersist = new Map();
      for (let i = 0; i < results.length; i++) {
        const entry = entries[i];
        const exit = results[i];
        if (exit === undefined || options.staleWhileRevalidate && options.staleWhileRevalidate(exit, entry.request)) {
          const prevComplete = entry.completeUnsafe;
          entry.completeUnsafe = function (exit) {
            toPersist.set(entry.request, exit);
            prevComplete(exit);
          };
          leftover.push(entry);
          if (exit === undefined) continue;
        }
        entry.completeUnsafe(exit);
      }
      if (!Arr.isArrayNonEmpty(leftover)) {
        return;
      }
      yield* Effect.catchCause(self.runAll(leftover, key), cause => {
        for (let i = 0; i < leftover.length; i++) {
          const entry = leftover[i];
          if (!toPersist.has(entry.request)) continue;
          entry.completeUnsafe(Exit.failCause(cause));
        }
        return Effect.void;
      });
      yield* store.setMany(toPersist).pipe(Effect.provideContext(entries[0].context));
    })
  });
}));
//# sourceMappingURL=RequestResolver.js.map