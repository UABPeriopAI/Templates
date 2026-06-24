import * as Arr from "./Array.js";
import * as Cause from "./Cause.js";
import * as Channel from "./Channel.js";
import * as Clock from "./Clock.js";
import * as Duration from "./Duration.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import { constant, constFalse, constTrue, constVoid, dual, identity, pipe } from "./Function.js";
import * as internalStream from "./internal/stream.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
import * as PubSub from "./PubSub.js";
import * as Pull from "./Pull.js";
import * as Queue from "./Queue.js";
import * as Result from "./Result.js";
import * as Scope from "./Scope.js";
const TypeId = "~effect/Sink";
const endVoid = /*#__PURE__*/Effect.succeed([void 0]);
const sinkVariance = {
  _A: identity,
  _In: identity,
  _L: identity,
  _E: identity,
  _R: identity
};
const SinkProto = {
  [TypeId]: sinkVariance,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Checks if a value is a Sink.
 *
 * @example
 * ```ts
 * import { Sink } from "effect"
 *
 * const sink = Sink.never
 * const notStream = { data: [1, 2, 3] }
 *
 * console.log(Sink.isSink(sink)) // true
 * console.log(Sink.isSink(notStream)) // false
 * ```
 *
 * @since 2.0.0
 * @category guards
 */
export const isSink = u => hasProperty(u, TypeId);
/**
 * Creates a sink from a `Channel`.
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromChannel = channel => fromTransform((upstream, scope) => Channel.toTransform(channel)(upstream, scope).pipe(Effect.flatMap(Effect.forever({
  disableYield: true
})), Pull.catchDone(Effect.succeed)));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromTransform = transform => {
  const self = Object.create(SinkProto);
  self.transform = transform;
  return self;
};
/**
 * Creates a `Channel` from a Sink.
 *
 * @example
 * ```ts
 * import { Sink } from "effect"
 *
 * // Create a sink and extract its channel
 * const sink = Sink.succeed(42)
 * const channel = Sink.toChannel(sink)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const toChannel = self => Channel.fromTransform((upstream, scope) => Effect.succeed(Effect.flatMap(self.transform(upstream, scope), Cause.done)));
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = () => (...fns) => fromTransform((upstream, scope) => pipe(internalStream.fromChannel(Channel.fromPull(Effect.succeed(upstream))), ...fns, Effect.flatMap(a => Cause.done([a])), Scope.provide(scope)));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromEffectEnd = effect => fromTransform(() => effect);
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromEffect = effect => fromEffectEnd(Effect.map(effect, a => [a]));
/**
 * @since 2.0.0
 * @category constructors
 */
export const fromQueue = queue => fromTransform(upstream => upstream.pipe(Effect.flatMap(arr => Queue.offerAll(queue, arr)), Effect.forever({
  disableYield: true
}), Pull.catchDone(_ => {
  Queue.endUnsafe(queue);
  return endVoid;
})));
/**
 * @since 2.0.0
 * @category constructors
 */
export const fromPubSub = pubsub => forEachArray(arr => PubSub.publishAll(pubsub, arr));
/**
 * A sink that immediately ends with the specified value.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that always yields the same value
 * const sink = Sink.succeed(42)
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: 42
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const succeed = (a, leftovers) => fromEffectEnd(Effect.succeed([a, leftovers]));
/**
 * A sink that immediately ends with the specified lazily evaluated value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const sync = a => fromEffect(Effect.sync(a));
/**
 * A sink that is created from a lazily evaluated sink.
 *
 * @since 2.0.0
 * @category constructors
 */
export const suspend = evaluate => fromTransform((upstream, scope) => evaluate().transform(upstream, scope));
/**
 * A sink that always fails with the specified error.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that always fails
 * const sink = Sink.fail(new Error("Sink failed"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Sink failed
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fail = e => fromEffectEnd(Effect.fail(e));
/**
 * A sink that always fails with the specified lazily evaluated error.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a lazy error
 * const sink = Sink.failSync(() => new Error("Lazy error"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy error
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failSync = evaluate => fromEffectEnd(Effect.failSync(evaluate));
/**
 * Creates a sink halting with a specified `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a specific cause
 * const sink = Sink.failCause(Cause.fail(new Error("Custom cause")))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Custom cause
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failCause = cause => fromEffectEnd(Effect.failCause(cause));
/**
 * Creates a sink halting with a specified lazily evaluated `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that fails with a lazy cause
 * const sink = Sink.failCauseSync(() => Cause.fail(new Error("Lazy cause")))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Lazy cause
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failCauseSync = evaluate => fromEffectEnd(Effect.failCauseSync(evaluate));
/**
 * Creates a sink halting with a specified defect.
 *
 * @example
 * ```ts
 * import { Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that dies with a defect
 * const sink = Sink.die(new Error("Defect error"))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program).catch(console.log)
 * // Output: Error: Defect error
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const die = defect => fromEffectEnd(Effect.die(defect));
/**
 * A sink that never completes.
 *
 * @since 2.0.0
 * @category constructors
 */
export const never = /*#__PURE__*/fromEffectEnd(Effect.never);
/**
 * Drains the remaining elements from the stream after the sink finishes
 *
 * @since 2.0.0
 * @category utils
 */
export const ignoreLeftover = self => mapEnd(self, ([a]) => [a]);
/**
 * Drains elements from the stream by ignoring all inputs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const drain = /*#__PURE__*/fromTransform(upstream => Pull.catchDone(Effect.forever(upstream, {
  disableYield: true
}), () => endVoid));
/**
 * A sink that folds its inputs with the provided function, termination
 * predicate and initial state.
 *
 * @since 2.0.0
 * @category folding
 */
export const fold = (s, contFn, f) => fromTransform(upstream => {
  let state = s();
  return Effect.gen(function* () {
    while (true) {
      const arr = yield* upstream;
      for (let i = 0; i < arr.length; i++) {
        state = yield* f(state, arr[i]);
        if (contFn(state)) continue;
        return [state, i + 1 < arr.length ? arr.slice(i + 1) : undefined];
      }
    }
  }).pipe(Pull.catchDone(() => Effect.succeed([state])));
});
/**
 * @since 2.0.0
 * @category folding
 */
export const foldArray = (s, contFn, f) => fromTransform(upstream => {
  let state = s();
  return Effect.gen(function* () {
    while (true) {
      const arr = yield* upstream;
      state = yield* f(state, arr);
      if (contFn(state)) continue;
      return [state];
    }
  }).pipe(Pull.catchDone(() => Effect.succeed([state])));
});
/**
 * @since 2.0.0
 * @category folding
 */
export const foldUntil = (s, max, f) => fold(() => [s(), 0], tuple => tuple[1] < max, ([output, count], input) => Effect.map(f(output, input), s => [s, count + 1])).pipe(map(tuple => tuple[0]));
/**
 * A sink that returns whether all elements satisfy the specified predicate.
 *
 * @since 2.0.0
 * @category constructors
 */
export const every = predicate => fold(constTrue, identity, (_, a) => Effect.succeed(predicate(a)));
/**
 * A sink that returns whether an element satisfies the specified predicate.
 *
 * @since 2.0.0
 * @category constructors
 */
export const some = predicate => fold(constFalse, b => !b, (_, a) => Effect.succeed(predicate(a)));
/**
 * Transforms this sink's result.
 *
 * @since 2.0.0
 * @category mapping
 */
export const map = /*#__PURE__*/dual(2, (self, f) => mapEnd(self, ([a, l]) => [f(a), l]));
/**
 * Set the sink's result to a constant value.
 *
 * @since 2.0.0
 * @category mapping
 */
export const as = /*#__PURE__*/dual(2, (self, a2) => map(self, () => a2));
/**
 * Transforms this sink's input elements.
 *
 * @since 2.0.0
 * @category mapping
 */
export const mapInput = /*#__PURE__*/dual(2, (self, f) => mapInputArray(self, Arr.map(f)));
/**
 * Effectfully transforms this sink's input elements.
 *
 * @since 2.0.0
 * @category mapping
 */
export const mapInputEffect = /*#__PURE__*/dual(2, (self, f) => mapInputArrayEffect(self, Effect.forEach(f)));
/**
 * Transforms this sink's input elements.
 *
 * @since 4.0.0
 * @category mapping
 */
export const mapInputArray = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => self.transform(Effect.map(upstream, f), scope)));
/**
 * Effectfully transforms this sink's input elements.
 *
 * @since 4.0.0
 * @category mapping
 */
export const mapInputArrayEffect = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => self.transform(Effect.flatMap(upstream, f), scope)));
/**
 * Transforms this sink's result.
 *
 * @since 4.0.0
 * @category mapping
 */
export const mapEnd = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => Effect.map(self.transform(upstream, scope), f)));
const transformEffect = (self, f) => fromTransform((upstream, scope) => f(self.transform(upstream, scope)));
/**
 * Effectfully transforms this sink's result.
 *
 * @since 4.0.0
 * @category mapping
 */
export const mapEffectEnd = /*#__PURE__*/dual(2, (self, f) => transformEffect(self, Effect.flatMap(f)));
/**
 * Effectfully transforms this sink's result.
 *
 * @since 2.0.0
 * @category mapping
 */
export const mapEffect = /*#__PURE__*/dual(2, (self, f) => mapEffectEnd(self, ([a, l]) => Effect.map(f(a), a2 => [a2, l])));
/**
 * Transforms the errors emitted by this sink using `f`.
 *
 * @since 2.0.0
 * @category mapping
 */
export const mapError = /*#__PURE__*/dual(2, (self, f) => transformEffect(self, Effect.mapError(f)));
/**
 * Transforms the leftovers emitted by this sink using `f`.
 *
 * @since 2.0.0
 * @category mapping
 */
export const mapLeftover = /*#__PURE__*/dual(2, (self, f) => mapEnd(self, ([a, l]) => [a, l && Arr.map(l, f)]));
/**
 * @since 2.0.0
 * @category collecting
 */
export const take = n => fromTransform(upstream => {
  const taken = [];
  if (n <= 0) {
    return Effect.succeed([taken]);
  }
  let leftover = undefined;
  return upstream.pipe(Effect.flatMap(arr => {
    if (taken.length + arr.length <= n) {
      taken.push(...arr);
      if (taken.length === n) {
        return Cause.done();
      }
      return Effect.void;
    }
    for (let i = 0; i < arr.length; i++) {
      taken.push(arr[i]);
      if (taken.length === n) {
        if (i + 1 < arr.length) {
          leftover = arr.slice(i + 1);
        }
        return Cause.done();
      }
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([taken, leftover])));
});
/**
 * Runs this sink until it yields a result, then uses that result to create
 * another sink from the provided function which will continue to run until it
 * yields a result.
 *
 * This function essentially runs sinks in sequence.
 *
 * @since 2.0.0
 * @category sequencing
 */
export const flatMap = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => {
  let upstreamDone = false;
  const pull = Effect.catchCause(upstream, cause => {
    upstreamDone = true;
    return Effect.failCause(cause);
  });
  return Effect.flatMap(self.transform(pull, scope), ([a, leftover]) => f(a).transform(Effect.suspend(() => {
    if (leftover) {
      const arr = leftover;
      leftover = undefined;
      return Effect.succeed(arr);
    } else if (upstreamDone) {
      return Cause.done();
    }
    return upstream;
  }), scope));
}));
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state while the specified `predicate` returns `true`.
 *
 * @since 2.0.0
 * @category reducing
 */
export const reduceWhile = (initial, predicate, f) => fromTransform(upstream => {
  let state = initial();
  let leftover = undefined;
  if (!predicate(state)) {
    return Effect.succeed([state]);
  }
  return upstream.pipe(Effect.flatMap(arr => {
    for (let i = 0; i < arr.length; i++) {
      state = f(state, arr[i]);
      if (!predicate(state)) {
        if (i + 1 < arr.length) {
          leftover = arr.slice(i + 1);
        }
        return Cause.done();
      }
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([state, leftover])));
});
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the provided `initial` state while the specified `predicate`
 * returns `true`.
 *
 * @since 2.0.0
 * @category reducing
 */
export const reduceWhileEffect = (initial, predicate, f) => fromTransform(upstream => {
  let state = initial();
  let leftover = undefined;
  if (!predicate(state)) {
    return Effect.succeed([state]);
  }
  return upstream.pipe(Effect.flatMap(arr => {
    let i = 0;
    return Effect.whileLoop({
      while: () => i < arr.length,
      body: constant(Effect.flatMap(Effect.suspend(() => f(state, arr[i++])), s => {
        state = s;
        if (!predicate(state)) {
          if (i < arr.length) {
            leftover = arr.slice(i);
          }
          return Cause.done();
        }
        return Effect.void;
      })),
      step: constVoid
    });
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([state, leftover])));
});
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state while the specified `predicate` returns `true`.
 *
 * @since 4.0.0
 * @category reducing
 */
export const reduceWhileArray = (initial, contFn, f) => fromTransform(upstream => {
  let state = initial();
  if (!contFn(state)) {
    return Effect.succeed([state]);
  }
  return upstream.pipe(Effect.flatMap(arr => {
    for (let i = 0; i < arr.length; i++) {
      state = f(state, arr);
      if (!contFn(state)) {
        return Cause.done();
      }
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([state])));
});
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the provided `initial` state while the specified `predicate`
 * returns `true`.
 *
 * @since 4.0.0
 * @category reducing
 */
export const reduceWhileArrayEffect = (initial, predicate, f) => fromTransform(upstream => {
  let state = initial();
  if (!predicate(state)) {
    return Effect.succeed([state]);
  }
  return upstream.pipe(Effect.flatMap(arr => f(state, arr)), Effect.flatMap(s => {
    state = s;
    if (!predicate(state)) {
      return Cause.done();
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([state])));
});
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the provided `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export const reduce = (initial, f) => reduceArray(initial, (s, arr) => {
  for (let i = 0; i < arr.length; i++) {
    s = f(s, arr[i]);
  }
  return s;
});
/**
 * A sink that reduces its inputs using the provided function `f` starting from
 * the specified `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export const reduceArray = (initial, f) => fromTransform(upstream => {
  let state = initial();
  return upstream.pipe(Effect.flatMap(arr => {
    state = f(state, arr);
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([state])));
});
/**
 * A sink that reduces its inputs using the provided effectful function `f`
 * starting from the specified `initial` state.
 *
 * @since 2.0.0
 * @category reducing
 */
export const reduceEffect = (initial, f) => reduceWhileEffect(initial, constTrue, f);
const head_ = /*#__PURE__*/reduceWhile(Option.none, Option.isNone, (_, in_) => Option.some(in_));
/**
 * Creates a sink containing the first value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const head = () => head_;
const last_ = /*#__PURE__*/reduceArray(Option.none, (_, arr) => Arr.last(arr));
/**
 * Creates a sink containing the last value.
 *
 * @since 2.0.0
 * @category constructors
 */
export const last = () => last_;
/**
 * Creates a sink containing the first matching value.
 *
 * @since 4.0.0
 * @category constructors
 */
export const find = predicate => reduceWhile(Option.none, Option.isNone, (acc, in_) => predicate(in_) ? Option.some(in_) : acc);
/**
 * Creates a sink containing the first matching value.
 *
 * @since 4.0.0
 * @category constructors
 */
export const findEffect = predicate => reduceWhileEffect(Option.none, Option.isNone, (acc, in_) => Effect.map(predicate(in_), b => b ? Option.some(in_) : acc));
/**
 * Creates a sink which sums up its inputs.
 *
 * @since 2.0.0
 * @category constructors
 */
export const sum = /*#__PURE__*/reduceArray(() => 0, (s, arr) => {
  for (let i = 0; i < arr.length; i++) {
    s += arr[i];
  }
  return s;
});
/**
 * A sink that counts the number of elements fed to it.
 *
 * @since 2.0.0
 * @category constructors
 */
export const count = /*#__PURE__*/reduceArray(() => 0, (s, arr) => s + arr.length);
/**
 * Accumulates incoming elements into an array.
 *
 * @since 2.0.0
 * @category constructors
 */
export const collect = () => reduceArray(Arr.empty, (s, arr) => {
  s.push(...arr);
  return s;
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeWhile = predicate => fromTransform(upstream => {
  const out = Arr.empty();
  return upstream.pipe(Effect.flatMap(arr => {
    for (let i = 0; i < arr.length; i++) {
      if (!predicate(arr[i])) {
        const leftover = i + 1 < arr.length ? arr.slice(i + 1) : undefined;
        return Cause.done([out, leftover]);
      }
      out.push(arr[i]);
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(end => Effect.succeed(end ?? [out])));
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeWhileFilter = filter => fromTransform(upstream => {
  const out = Arr.empty();
  return upstream.pipe(Effect.flatMap(arr => {
    for (let i = 0; i < arr.length; i++) {
      const result = filter(arr[i]);
      if (Result.isFailure(result)) {
        const leftover = i + 1 < arr.length ? arr.slice(i + 1) : undefined;
        return Cause.done([out, leftover]);
      }
      out.push(result.success);
    }
    return Effect.void;
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(end => Effect.succeed(end ?? [out])));
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeWhileEffect = predicate => fromTransform(upstream => {
  const out = Arr.empty();
  let leftover = undefined;
  return upstream.pipe(Effect.flatMap(arr => {
    let i = 0;
    return Effect.whileLoop({
      while: () => i < arr.length,
      body: constant(Effect.flatMap(Effect.suspend(() => {
        const input = arr[i++];
        return Effect.map(predicate(input), passes => [input, passes]);
      }), ([input, passes]) => {
        if (!passes) {
          if (i < arr.length) {
            leftover = arr.slice(i);
          }
          return Cause.done();
        }
        out.push(input);
        return Effect.void;
      })),
      step: constVoid
    });
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([out, leftover])));
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeWhileFilterEffect = filter => fromTransform(upstream => {
  const out = Arr.empty();
  let leftover = undefined;
  return upstream.pipe(Effect.flatMap(arr => {
    let i = 0;
    return Effect.whileLoop({
      while: () => i < arr.length,
      body: constant(Effect.flatMap(Effect.suspend(() => filter(arr[i++])), result => {
        if (Result.isFailure(result)) {
          if (i < arr.length) {
            leftover = arr.slice(i);
          }
          return Cause.done();
        }
        out.push(result.success);
        return Effect.void;
      })),
      step: constVoid
    });
  }), Effect.forever({
    disableYield: true
  }), Pull.catchDone(() => Effect.succeed([out, leftover])));
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeUntil = predicate => suspend(() => {
  let done = false;
  return takeWhile(i => {
    if (done) return false;
    done = predicate(i);
    return true;
  });
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const takeUntilEffect = predicate => suspend(() => {
  let done = false;
  return takeWhileEffect(input => {
    if (done) {
      return Effect.succeed(false);
    }
    return Effect.map(predicate(input), b => {
      done = b;
      return true;
    });
  });
});
/**
 * A sink that executes the provided effectful function for every item fed
 * to it.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that logs each item
 * const sink = Sink.forEach((item: number) => Console.log(`Processing: ${item}`))
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output:
 * // Processing: 1
 * // Processing: 2
 * // Processing: 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const forEach = f => forEachArray(Effect.forEach(_ => f(_), {
  discard: true
}));
/**
 * A sink that executes the provided effectful function for every Chunk fed
 * to it.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink that processes chunks
 * const sink = Sink.forEachArray((chunk: ReadonlyArray<number>) =>
 *   Console.log(
 *     `Processing chunk of ${chunk.length} items: [${chunk.join(", ")}]`
 *   )
 * )
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3, 4, 5)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output: Processing chunk of 5 items: [1, 2, 3, 4, 5]
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const forEachArray = f => fromTransform(upstream => upstream.pipe(Effect.flatMap(f), Effect.forever({
  disableYield: true
}), Pull.catchDone(() => endVoid)));
/**
 * @since 2.0.0
 * @category constructors
 */
export const forEachWhile = f => forEachWhileArray(Effect.fnUntraced(function* (input) {
  for (let i = 0; i < input.length; i++) {
    const cont = yield* f(input[i]);
    if (!cont) return false;
  }
  return true;
}));
/**
 * @since 2.0.0
 * @category constructors
 */
export const forEachWhileArray = f => fromTransform(upstream => upstream.pipe(Effect.flatMap(f), Effect.flatMap(cont => cont ? Effect.void : Cause.done()), Effect.forever({
  disableYield: true
}), Pull.catchDone(() => endVoid)));
/**
 * Creates a sink produced from a scoped effect.
 *
 * @example
 * ```ts
 * import { Console, Effect, Sink, Stream } from "effect"
 *
 * // Create a sink from an effect that produces a sink
 * const sinkEffect = Effect.succeed(
 *   Sink.forEach((item: number) => Console.log(`Item: ${item}`))
 * )
 * const sink = Sink.unwrap(sinkEffect)
 *
 * // Use it with a stream
 * const stream = Stream.make(1, 2, 3)
 * const program = Stream.run(stream, sink)
 *
 * Effect.runPromise(program)
 * // Output:
 * // Item: 1
 * // Item: 2
 * // Item: 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const unwrap = effect => fromChannel(Channel.unwrap(Effect.map(effect, toChannel)));
/**
 * Summarize a sink by running an effect when the sink starts and again when
 * it completes.
 *
 * @since 2.0.0
 * @category utils
 */
export const summarized = /*#__PURE__*/dual(3, (self, summary, f) => fromTransform(Effect.fnUntraced(function* (upstream, scope) {
  const start = yield* summary;
  const [done, leftover] = yield* self.transform(upstream, scope);
  const end = yield* summary;
  return [[done, f(start, end)], leftover];
})));
/**
 * Returns the sink that executes this one and times its execution.
 *
 * @since 2.0.0
 * @category utils
 */
export const withDuration = self => summarized(self, Clock.currentTimeNanos, (start, end) => Duration.nanos(end - start));
/**
 * @since 2.0.0
 * @category constructors
 */
export const timed = /*#__PURE__*/map(/*#__PURE__*/withDuration(drain), ([, duration]) => duration);
/**
 * @since 4.0.0
 * @category Services
 */
export const provideContext = /*#__PURE__*/dual(2, (self, context) => fromTransform((upstream, scope) => self.transform(upstream, scope).pipe(Effect.provideContext(context))));
/**
 * @since 4.0.0
 * @category Services
 */
export const provideService = /*#__PURE__*/dual(3, (self, key, value) => fromTransform((upstream, scope) => self.transform(upstream, scope).pipe(Effect.provideService(key, value))));
/**
 * @since 2.0.0
 * @category Error handling
 */
export const orElse = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => {
  let upstreamDone = false;
  const pull = Effect.catchCause(upstream, cause => {
    upstreamDone = true;
    return Effect.failCause(cause);
  });
  return Effect.catch(self.transform(pull, scope), error => f(error).transform(Effect.suspend(() => {
    if (upstreamDone) {
      return Cause.done();
    }
    return upstream;
  }), scope));
}));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const catchCause = /*#__PURE__*/dual(2, (self, f) => transformEffect(self, Effect.catchCause(cause => Effect.map(f(cause), a2 => [a2]))));
const catch_ = /*#__PURE__*/dual(2, (self, f) => transformEffect(self, Effect.catch(error => Effect.map(f(error), a2 => [a2]))));
export {
/**
 * @since 4.0.0
 * @category Error handling
 */
catch_ as catch };
/**
 * @since 4.0.0
 * @category Finalization
 */
export const onExit = /*#__PURE__*/dual(2, (self, f) => transformEffect(self, Effect.onExit(exit => f(Exit.map(exit, ([a]) => a)))));
/**
 * @since 4.0.0
 * @category Finalization
 */
export const ensuring = /*#__PURE__*/dual(2, (self, effect) => onExit(self, () => effect));
//# sourceMappingURL=Sink.js.map