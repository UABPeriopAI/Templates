/**
 * The `Channel` module provides a powerful abstraction for bi-directional communication
 * and streaming operations. A `Channel` is a nexus of I/O operations that supports both
 * reading and writing, forming the foundation for Effect's Stream and Sink abstractions.
 *
 * ## What is a Channel?
 *
 * A `Channel<OutElem, OutErr, OutDone, InElem, InErr, InDone, Env>` represents:
 * - **OutElem**: The type of elements the channel outputs
 * - **OutErr**: The type of errors the channel can produce
 * - **OutDone**: The type of the final value when the channel completes
 * - **InElem**: The type of elements the channel reads
 * - **InErr**: The type of errors the channel can receive
 * - **InDone**: The type of the final value from upstream
 * - **Env**: The environment/context required by the channel
 *
 * ## Key Features
 *
 * - **Bi-directional**: Channels can both read and write
 * - **Composable**: Channels can be piped, sequenced, and concatenated
 * - **Resource-safe**: Automatic cleanup and resource management
 * - **Error-handling**: Built-in error propagation and handling
 * - **Concurrent**: Support for concurrent operations
 *
 * ## Composition Patterns
 *
 * 1. **Piping**: Connect channels where output of one becomes input of another
 * 2. **Sequencing**: Use the result of one channel to create another
 * 3. **Concatenating**: Combine multiple channels into a single channel
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Simple channel that outputs numbers
 * const numberChannel = Channel.succeed(42)
 *
 * // Transform channel that doubles values
 * const doubleChannel = Channel.map(numberChannel, (n) => n * 2)
 *
 * // Running the channel would output: 84
 * ```
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Channel from an array of values
 * const arrayChannel = Channel.fromArray([1, 2, 3, 4, 5])
 *
 * // Transform the channel by mapping over values
 * const transformedChannel = Channel.map(arrayChannel, (n) => n * 2)
 *
 * // This channel will output: 2, 4, 6, 8, 10
 * ```
 *
 * @since 2.0.0
 */
// @effect-diagnostics returnEffectInGen:off
import * as Arr from "./Array.js";
import * as Cause from "./Cause.js";
import * as Chunk from "./Chunk.js";
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
import * as Fiber from "./Fiber.js";
import { constant, constTrue, constVoid, dual, identity as identity_ } from "./Function.js";
import { ClockRef, endSpan } from "./internal/effect.js";
import { addSpanStackTrace } from "./internal/tracer.js";
import * as Iterable from "./Iterable.js";
import * as Latch from "./Latch.js";
import * as Layer from "./Layer.js";
import * as Option from "./Option.js";
import { pipeArguments } from "./Pipeable.js";
import { hasProperty, isTagged } from "./Predicate.js";
import * as PubSub from "./PubSub.js";
import * as Pull from "./Pull.js";
import * as Queue from "./Queue.js";
import { TracerTimingEnabled } from "./References.js";
import * as Result from "./Result.js";
import * as Schedule from "./Schedule.js";
import * as Scope from "./Scope.js";
import * as Semaphore from "./Semaphore.js";
import * as String from "./String.js";
import * as Take from "./Take.js";
import { ParentSpan } from "./Tracer.js";
/**
 * @since 4.0.0
 * @category Type Identifiers
 */
export const TypeId = "~effect/Channel";
/**
 * Tests if a value is a `Channel`.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.succeed(42)
 * console.log(Channel.isChannel(channel)) // true
 * console.log(Channel.isChannel("not a channel")) // false
 * ```
 *
 * @category guards
 * @since 3.5.4
 */
export const isChannel = u => hasProperty(u, TypeId);
const ChannelProto = {
  [TypeId]: {
    _Env: identity_,
    _InErr: identity_,
    _InElem: identity_,
    _OutErr: identity_,
    _OutElem: identity_
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------
/**
 * Creates a `Channel` from a transformation function that operates on upstream pulls.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * const channel = Channel.fromTransform((upstream, scope) =>
 *   Effect.succeed(upstream)
 * )
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const fromTransform = transform => {
  const self = Object.create(ChannelProto);
  self.transform = (upstream, scope) => Effect.catchCause(transform(upstream, scope), cause => Effect.succeed(Effect.failCause(cause)));
  return self;
};
/**
 * Transforms a Channel by applying a function to its Pull implementation.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * // Transform a channel by modifying its pull behavior
 * const originalChannel = Channel.fromIterable([1, 2, 3])
 *
 * const transformedChannel = Channel.transformPull(
 *   originalChannel,
 *   (pull, scope) =>
 *     Effect.succeed(
 *       Effect.map(pull, (value) => value * 2)
 *     )
 * )
 * // Outputs: 2, 4, 6
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const transformPull = (self, f) => fromTransform((upstream, scope) => Effect.flatMap(toTransform(self)(upstream, scope), pull => f(pull, scope)));
/**
 * Creates a `Channel` from an `Effect` that produces a `Pull`.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * const channel = Channel.fromPull(
 *   Effect.succeed(Effect.succeed(42))
 * )
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const fromPull = effect => fromTransform((_, __) => effect);
/**
 * Creates a `Channel` from a transformation function that operates on upstream
 * pulls, but also provides a forked scope that closes when the resulting
 * Channel completes.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromTransformBracket = f => fromTransform(Effect.fnUntraced(function* (upstream, scope) {
  const closableScope = Scope.forkUnsafe(scope);
  const onCause = cause => Scope.close(closableScope, Pull.doneExitFromCause(cause));
  const pull = yield* Effect.onError(f(upstream, scope, closableScope), onCause);
  return Effect.onError(pull, onCause);
}));
/**
 * Converts a `Channel` back to its underlying transformation function.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.succeed(42)
 * const transform = Channel.toTransform(channel)
 * // transform can now be used directly
 * ```
 *
 * @category destructors
 * @since 4.0.0
 */
export const toTransform = channel => channel.transform;
/**
 * The default chunk size used by channels for batching operations.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * console.log(Channel.DefaultChunkSize) // 4096
 * ```
 *
 * @category constants
 * @since 2.0.0
 */
export const DefaultChunkSize = 4096;
const asyncQueue = (scope, f, options) => Queue.make({
  capacity: options?.bufferSize,
  strategy: options?.strategy
}).pipe(Effect.tap(queue => Scope.addFinalizer(scope, Queue.shutdown(queue))), Effect.tap(queue => Effect.forkIn(Scope.provide(f(queue), scope), scope)));
/**
 * Creates a `Channel` that interacts with a callback function using a queue.
 *
 * @example
 * ```ts
 * import { Channel, Effect, Queue } from "effect"
 *
 * const channel = Channel.callback<number>((queue) =>
 *   Effect.gen(function*() {
 *     yield* Queue.offer(queue, 1)
 *     yield* Queue.offer(queue, 2)
 *     yield* Queue.offer(queue, 3)
 *   })
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const callback = (f, options) => fromTransform((_, scope) => Effect.map(asyncQueue(scope, f, options), Queue.take));
/**
 * Creates a `Channel` that interacts with a callback function using a queue, emitting arrays.
 *
 * @example
 * ```ts
 * import { Channel, Effect, Queue } from "effect"
 *
 * const channel = Channel.callbackArray<number>(Effect.fn(function*(queue) {
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 * }))
 * // Emits arrays of numbers instead of individual numbers
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const callbackArray = (f, options) => fromTransform((_, scope) => Effect.map(asyncQueue(scope, f, options), Queue.takeAll));
/**
 * Creates a `Channel` that lazily evaluates to another channel.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.suspend(() => Channel.succeed(42))
 * // The inner channel is not created until the suspended channel is run
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const suspend = evaluate => fromTransform((upstream, scope) => Effect.suspend(() => toTransform(evaluate())(upstream, scope)));
/**
 * Creates a `Channel` with resource management using acquire-use-release pattern.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * const channel = Channel.acquireUseRelease(
 *   Effect.succeed("resource"),
 *   (resource) => Channel.succeed(resource.toUpperCase()),
 *   (resource, exit) => Effect.log(`Released: ${resource}`)
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const acquireUseRelease = (acquire, use, release) => fromTransformBracket(Effect.fnUntraced(function* (upstream, scope, forkedScope) {
  let option = Option.none();
  yield* Scope.addFinalizerExit(forkedScope, exit => Option.isSome(option) ? release(option.value, exit) : Effect.void);
  const value = yield* Effect.uninterruptible(acquire);
  option = Option.some(value);
  return yield* toTransform(use(value))(upstream, scope);
}));
/**
 * Creates a `Channel` with resource management using acquire-release pattern.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * const channel = Channel.acquireRelease(
 *   Effect.succeed("resource"),
 *   (resource, exit) => Effect.log(`Released: ${resource}`)
 * )
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const acquireRelease = /*#__PURE__*/dual(2, (self, release) => unwrap(Effect.map(Effect.acquireRelease(self, release), succeed)));
/**
 * Creates a `Channel` from an iterator.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const numbers = [1, 2, 3, 4, 5]
 * const channel = Channel.fromIterator(() => numbers[Symbol.iterator]())
 * // Emits: 1, 2, 3, 4, 5
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromIterator = iterator => fromPull(Effect.sync(() => {
  const iter = iterator();
  return Effect.suspend(() => {
    const state = iter.next();
    return state.done ? Cause.done(state.value) : Effect.succeed(state.value);
  });
}));
/**
 * Creates a `Channel` that emits all elements from an array.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.fromArray([1, 2, 3, 4, 5])
 * // Emits: 1, 2, 3, 4, 5
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromArray = array => fromPull(Effect.sync(() => {
  let index = 0;
  return Effect.suspend(() => index >= array.length ? Cause.done() : Effect.succeed(array[index++]));
}));
/**
 * Creates a `Channel` that emits all elements from a chunk.
 *
 * @example
 * ```ts
 * import { Channel, Chunk } from "effect"
 *
 * const chunk = Chunk.make(1, 2, 3)
 * const channel = Channel.fromChunk(chunk)
 * // Emits: 1, 2, 3
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromChunk = chunk => fromArray(Chunk.toReadonlyArray(chunk));
/**
 * Creates a `Channel` from an iterator that emits arrays of elements.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel from a simple iterator
 * const numberIterator = (): Iterator<number, string> => {
 *   let count = 0
 *   return {
 *     next: () => {
 *       if (count < 3) {
 *         return { value: count++, done: false }
 *       }
 *       return { value: "finished", done: true }
 *     }
 *   }
 * }
 *
 * const channel = Channel.fromIteratorArray(() => numberIterator(), 2)
 * // This will emit arrays: [0, 1], [2], then complete with "finished"
 * ```
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create channel from a generator function
 * function* fibonacci(): Generator<number, void, unknown> {
 *   let a = 0, b = 1
 *   for (let i = 0; i < 5; i++) {
 *     yield a
 *     ;[a, b] = [b, a + b]
 *   }
 * }
 *
 * const fibChannel = Channel.fromIteratorArray(() => fibonacci(), 3)
 * // Emits: [0, 1, 1], [2, 3], then completes
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromIteratorArray = (iterator, chunkSize = DefaultChunkSize) => fromPull(Effect.sync(() => {
  const iter = iterator();
  let done = Option.none();
  return Effect.suspend(() => {
    if (done._tag === "Some") return Cause.done(done.value);
    const buffer = [];
    while (buffer.length < chunkSize) {
      const state = iter.next();
      if (state.done) {
        if (buffer.length === 0) {
          return Cause.done(state.value);
        }
        done = Option.some(state.value);
        break;
      }
      buffer.push(state.value);
    }
    return Effect.succeed(buffer);
  });
}));
/**
 * Creates a `Channel` that emits all elements from an iterable.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const set = new Set([1, 2, 3])
 * const channel = Channel.fromIterable(set)
 * // Emits: 1, 2, 3
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromIterable = iterable => fromIterator(() => iterable[Symbol.iterator]());
/**
 * Creates a `Channel` that emits arrays of elements from an iterable.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const numbers = [1, 2, 3, 4, 5]
 * const channel = Channel.fromIterableArray(numbers)
 * // Emits arrays like: [1, 2, 3, 4], [5] (based on chunk size)
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const fromIterableArray = (iterable, chunkSize = DefaultChunkSize) => fromIteratorArray(() => iterable[Symbol.iterator](), chunkSize);
/**
 * Creates a `Channel` that emits a single value and then ends.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.succeed(42)
 * // Emits: 42
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const succeed = value => fromEffect(Effect.succeed(value));
/**
 * Creates a `Channel` that immediately ends with the specified value.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.end("done")
 * // Ends immediately with "done", emits nothing
 * ```
 *
 * @category constructors
 * @since 4.0.0
 */
export const end = value => fromPull(Effect.succeed(Cause.done(value)));
/**
 * Creates a `Channel` that immediately ends with the lazily evaluated value.
 *
 * @category constructors
 * @since 4.0.0
 */
export const endSync = evaluate => fromPull(Effect.sync(() => Cause.done(evaluate())));
/**
 * Creates a `Channel` that emits a single value computed by a lazy evaluation.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * const channel = Channel.sync(() => Math.random())
 * // Emits a random number computed when the channel runs
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const sync = evaluate => fromEffect(Effect.sync(evaluate));
/**
 * Represents an Channel that emits no elements
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create an empty channel
 * const emptyChannel = Channel.empty
 *
 * // Use empty channel in composition
 * const combined = Channel.concatWith(emptyChannel, () => Channel.succeed(42))
 * // Will immediately provide the second channel's output
 *
 * // Empty channel can be used as a no-op in conditional logic
 * const conditionalChannel = (shouldEmit: boolean) =>
 *   shouldEmit ? Channel.succeed("data") : Channel.empty
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/fromPull(/*#__PURE__*/Effect.succeed(/*#__PURE__*/Cause.done()));
/**
 * Represents an Channel that never completes
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that never completes
 * const neverChannel = Channel.never
 *
 * // Use in conditional logic
 * const withFallback = Channel.concatWith(
 *   neverChannel,
 *   () => Channel.succeed("fallback")
 * )
 *
 * // Never channel is useful for testing or as a placeholder
 * const conditionalChannel = (shouldComplete: boolean) =>
 *   shouldComplete ? Channel.succeed("done") : Channel.never
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const never = /*#__PURE__*/fromPull(/*#__PURE__*/Effect.succeed(Effect.never));
/**
 * Constructs a channel that fails immediately with the specified error.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that fails with a string error
 * const failedChannel = Channel.fail("Something went wrong")
 *
 * // Create a channel that fails with a custom error
 * class CustomError extends Error {
 *   constructor(message: string) {
 *     super(message)
 *     this.name = "CustomError"
 *   }
 * }
 * const customErrorChannel = Channel.fail(new CustomError("Custom error"))
 *
 * // Use in error handling by piping to another channel
 * const channelWithFallback = Channel.concatWith(
 *   failedChannel,
 *   () => Channel.succeed("fallback value")
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fail = error => fromPull(Effect.succeed(Effect.fail(error)));
/**
 * Constructs a channel that fails immediately with the specified lazily
 * evaluated error.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that fails with a lazily computed error
 * const failedChannel = Channel.failSync(() => {
 *   console.log("Computing error...")
 *   return new Error("Computed at runtime")
 * })
 *
 * // The error computation is deferred until the channel runs
 * const conditionalError = Channel.failSync(() =>
 *   Math.random() > 0.5 ? "Error A" : "Error B"
 * )
 *
 * // Use with expensive error construction
 * const expensiveError = Channel.failSync(() => {
 *   const timestamp = Date.now()
 *   return new Error(`Failed at: ${timestamp}`)
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failSync = evaluate => fromPull(Effect.failSync(evaluate));
/**
 * Constructs a channel that fails immediately with the specified `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Channel } from "effect"
 *
 * // Create a channel that fails with a simple cause
 * const simpleCause = Cause.fail("Simple error")
 * const failedChannel = Channel.failCause(simpleCause)
 *
 * // Create a channel with a die cause
 * const dieCause = Cause.die(new Error("System error"))
 * const dieFailure = Channel.failCause(dieCause)
 *
 * // Create a channel with a simple fail cause
 * const failCause = Cause.fail("Simple error")
 * const simpleFail = Channel.failCause(failCause)
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failCause = cause => fromPull(Effect.failCause(cause));
/**
 * Constructs a channel that fails immediately with the specified lazily
 * evaluated `Cause`.
 *
 * @example
 * ```ts
 * import { Cause, Channel } from "effect"
 *
 * // Create a channel that fails with a lazily computed cause
 * const failedChannel = Channel.failCauseSync(() => {
 *   const errorType = Math.random() > 0.5 ? "A" : "B"
 *   return Cause.fail(`Runtime error ${errorType}`)
 * })
 *
 * // Create a channel with die cause computation
 * const dieCauseChannel = Channel.failCauseSync(() => {
 *   const timestamp = Date.now()
 *   return Cause.die(`Error at ${timestamp}`)
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const failCauseSync = evaluate => fromPull(Effect.failCauseSync(evaluate));
/**
 * Constructs a channel that fails immediately with the specified defect.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that dies with a string defect
 * const diedChannel = Channel.die("Unrecoverable error")
 *
 * // Create a channel that dies with an Error object
 * const errorDefect = Channel.die(new Error("System failure"))
 *
 * // Die with any value as a defect
 * const objectDefect = Channel.die({
 *   code: "SYSTEM_FAILURE",
 *   details: "Critical system component failed"
 * })
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const die = defect => failCause(Cause.die(defect));
/**
 * Use an effect to write a single value to the channel.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class DatabaseError extends Data.TaggedError("DatabaseError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a channel from a successful effect
 * const successChannel = Channel.fromEffect(
 *   Effect.succeed("Hello from effect!")
 * )
 *
 * // Create a channel from an effect that might fail
 * const fetchUserChannel = Channel.fromEffect(
 *   Effect.tryPromise({
 *     try: () => fetch("/api/user").then((res) => res.json()),
 *     catch: (error) => new DatabaseError({ message: String(error) })
 *   })
 * )
 *
 * // Channel from effect with async computation
 * const asyncChannel = Channel.fromEffect(
 *   Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     return "Async result"
 *   })
 * )
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const fromEffect = effect => fromPull(Effect.sync(() => {
  let done = false;
  return Effect.suspend(() => {
    if (done) return Cause.done();
    done = true;
    return effect;
  });
}));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromEffectDone = effect => fromPull(Effect.succeed(Effect.flatMap(effect, Cause.done)));
/**
 * Use an effect and discard its result.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromEffectDrain = effect => fromPull(Effect.flatMap(effect, () => Cause.done()));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromEffectTake = effect => fromPull(Effect.succeed(Effect.flatMap(effect, Take.toPull)));
/**
 * Create a channel from a queue
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, Queue } from "effect"
 *
 * class QueueError extends Data.TaggedError("QueueError")<{
 *   readonly reason: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a bounded queue
 *   const queue = yield* Queue.bounded<string, QueueError>(10)
 *
 *   // Add some items to the queue
 *   yield* Queue.offer(queue, "item1")
 *   yield* Queue.offer(queue, "item2")
 *   yield* Queue.offer(queue, "item3")
 *
 *   // Create a channel from the queue
 *   const channel = Channel.fromQueue(queue)
 *
 *   // The channel will read items from the queue one by one
 *   return channel
 * })
 *
 * // Sliding queue example
 * const slidingProgram = Effect.gen(function*() {
 *   const slidingQueue = yield* Queue.sliding<number, QueueError>(5)
 *   yield* Queue.offerAll(slidingQueue, [1, 2, 3, 4, 5, 6])
 *   return Channel.fromQueue(slidingQueue)
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromQueue = queue => fromPull(Effect.succeed(Queue.take(queue)));
/**
 * Create a channel from a queue that emits arrays of elements
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, Queue } from "effect"
 *
 * class ProcessingError extends Data.TaggedError("ProcessingError")<{
 *   readonly stage: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a queue for batch processing
 *   const queue = yield* Queue.bounded<number, ProcessingError>(100)
 *
 *   // Fill queue with data
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
 *
 *   // Create a channel that reads arrays from the queue
 *   const arrayChannel = Channel.fromQueueArray(queue)
 *
 *   // This will emit non-empty arrays of elements instead of individual items
 *   // Useful for batch processing scenarios
 *   return arrayChannel
 * })
 *
 * // High-throughput processing example
 * const batchProcessor = Effect.gen(function*() {
 *   const dataQueue = yield* Queue.dropping<string, ProcessingError>(1000)
 *   const batchChannel = Channel.fromQueueArray(dataQueue)
 *
 *   // Process data in batches for better performance
 *   return Channel.map(
 *     batchChannel,
 *     (batch) => batch.map((item) => item.toUpperCase())
 *   )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromQueueArray = queue => fromPull(Effect.succeed(Queue.takeAll(queue)));
/**
 * @since 2.0.0
 * @category Constructors
 */
export const identity = () => fromTransform((upstream, _scope) => Effect.succeed(upstream));
/**
 * Create a channel from a PubSub subscription
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class SubscriptionError extends Data.TaggedError("SubscriptionError")<{
 *   readonly reason: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   // Create a PubSub
 *   const pubsub = yield* PubSub.bounded<string>(32)
 *
 *   // Create a subscription
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *
 *   // Publish some messages
 *   yield* PubSub.publish(pubsub, "Hello")
 *   yield* PubSub.publish(pubsub, "World")
 *   yield* PubSub.publish(pubsub, "from")
 *   yield* PubSub.publish(pubsub, "PubSub")
 *
 *   // Create a channel from the subscription
 *   const channel = Channel.fromSubscription(subscription)
 *
 *   // The channel will receive all published messages
 *   return channel
 * })
 *
 * // Real-time notifications example
 * const notificationChannel = Effect.gen(function*() {
 *   const eventBus = yield* PubSub.unbounded<{ type: string; payload: any }>()
 *   const userSubscription = yield* PubSub.subscribe(eventBus)
 *
 *   return Channel.fromSubscription(userSubscription)
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromSubscription = subscription => fromPull(Effect.succeed(Effect.onInterrupt(PubSub.take(subscription), () => Cause.done())));
/**
 * Create a channel from a PubSub subscription that outputs arrays of values.
 *
 * This constructor creates a channel that reads from a PubSub subscription and outputs
 * arrays of values in chunks. It's useful when you want to process multiple values at once
 * for better performance.
 *
 * @param subscription - The PubSub subscription to read from
 * @param chunkSize - The maximum number of elements to read in each chunk (default: 4096)
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class StreamError extends Data.TaggedError("StreamError")<{
 *   readonly message: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<number>(16)
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *
 *   // Create a channel that reads arrays of values
 *   const channel = Channel.fromSubscriptionArray(subscription)
 *
 *   // Publish some values
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *   yield* PubSub.publish(pubsub, 4)
 *
 *   // The channel will output arrays like [1, 2, 3] and [4]
 *   return channel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class BatchProcessingError extends Data.TaggedError("BatchProcessingError")<{
 *   readonly reason: string
 * }> {}
 *
 * const batchProcessor = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<string>(32)
 *   const subscription = yield* PubSub.subscribe(pubsub)
 *
 *   // Create a channel that processes items in batches
 *   const batchChannel = Channel.fromSubscriptionArray(subscription)
 *
 *   // Transform to process each batch
 *   const processedChannel = Channel.map(batchChannel, (batch) => {
 *     console.log(`Processing batch of ${batch.length} items:`, batch)
 *     return batch.map((item) => item.toUpperCase())
 *   })
 *
 *   return processedChannel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class MetricsError extends Data.TaggedError("MetricsError")<{
 *   readonly cause: string
 * }> {}
 *
 * const metricsAggregator = Effect.gen(function*() {
 *   const metricsPubSub = yield* PubSub.bounded<
 *     { timestamp: number; value: number }
 *   >(100)
 *   const subscription = yield* PubSub.subscribe(metricsPubSub)
 *
 *   // Create a channel that collects metrics in chunks
 *   const metricsChannel = Channel.fromSubscriptionArray(subscription)
 *
 *   // Transform to calculate aggregate statistics
 *   const aggregatedChannel = Channel.map(metricsChannel, (metrics) => {
 *     const values = metrics.map((m) => m.value)
 *     const sum = values.reduce((a, b) => a + b, 0)
 *     const avg = sum / values.length
 *     const min = Math.min(...values)
 *     const max = Math.max(...values)
 *
 *     return {
 *       count: values.length,
 *       sum,
 *       average: avg,
 *       min,
 *       max,
 *       timestamp: Date.now()
 *     }
 *   })
 *
 *   return aggregatedChannel
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromSubscriptionArray = subscription => fromPull(Effect.succeed(Effect.onInterrupt(PubSub.takeAll(subscription), () => Cause.done())));
/**
 * Create a channel from a PubSub that outputs individual values.
 *
 * This constructor creates a channel that reads from a PubSub by automatically
 * subscribing to it. The channel outputs individual values as they are published
 * to the PubSub, making it ideal for real-time streaming scenarios.
 *
 * @param pubsub - The PubSub to read from
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class StreamError extends Data.TaggedError("StreamError")<{
 *   readonly message: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<number>(16)
 *
 *   // Create a channel that reads individual values
 *   const channel = Channel.fromPubSub(pubsub)
 *
 *   // Publish some values
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *
 *   // The channel will output: 1, 2, 3 (individual values)
 *   return channel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class NotificationError extends Data.TaggedError("NotificationError")<{
 *   readonly reason: string
 * }> {}
 *
 * const notificationService = Effect.gen(function*() {
 *   const notificationPubSub = yield* PubSub.bounded<string>(50)
 *
 *   // Create a channel for real-time notifications
 *   const notificationChannel = Channel.fromPubSub(notificationPubSub)
 *
 *   // Transform notifications to add timestamps
 *   const timestampedChannel = Channel.map(notificationChannel, (message) => ({
 *     message,
 *     timestamp: new Date().toISOString(),
 *     id: Math.random().toString(36).substr(2, 9)
 *   }))
 *
 *   return timestampedChannel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class EventProcessingError extends Data.TaggedError("EventProcessingError")<{
 *   readonly eventType: string
 *   readonly cause: string
 * }> {}
 *
 * interface DomainEvent {
 *   readonly type: string
 *   readonly payload: unknown
 *   readonly timestamp: number
 * }
 *
 * const eventProcessor = Effect.gen(function*() {
 *   const eventPubSub = yield* PubSub.bounded<DomainEvent>(100)
 *
 *   // Create a channel for processing domain events
 *   const eventChannel = Channel.fromPubSub(eventPubSub)
 *
 *   // Filter and transform events
 *   const processedChannel = Channel.map(eventChannel, (event) => {
 *     if (event.type === "user.created") {
 *       return {
 *         ...event,
 *         processed: true,
 *         processedAt: Date.now()
 *       }
 *     }
 *     return event
 *   })
 *
 *   return processedChannel
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromPubSub = pubsub => unwrap(Effect.map(PubSub.subscribe(pubsub), fromSubscription));
/**
 * Create a channel from a PubSub that outputs arrays of values.
 *
 * This constructor creates a channel that reads from a PubSub by automatically
 * subscribing to it and collecting values into arrays. The channel outputs
 * arrays of values in chunks, making it ideal for batch processing scenarios.
 *
 * @param pubsub - The PubSub to read from
 * @param chunkSize - The maximum number of elements to collect in each array (default: 4096)
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class BatchError extends Data.TaggedError("BatchError")<{
 *   readonly message: string
 * }> {}
 *
 * const program = Effect.gen(function*() {
 *   const pubsub = yield* PubSub.bounded<number>(16)
 *
 *   // Create a channel that reads arrays of values
 *   const channel = Channel.fromPubSubArray(pubsub)
 *
 *   // Publish some values
 *   yield* PubSub.publish(pubsub, 1)
 *   yield* PubSub.publish(pubsub, 2)
 *   yield* PubSub.publish(pubsub, 3)
 *   yield* PubSub.publish(pubsub, 4)
 *
 *   // The channel will output arrays like [1, 2, 3] and [4]
 *   return channel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class OrderProcessingError extends Data.TaggedError("OrderProcessingError")<{
 *   readonly orderId: string
 *   readonly reason: string
 * }> {}
 *
 * interface Order {
 *   readonly id: string
 *   readonly customerId: string
 *   readonly items: ReadonlyArray<string>
 *   readonly total: number
 * }
 *
 * const orderBatchProcessor = Effect.gen(function*() {
 *   const orderPubSub = yield* PubSub.bounded<Order>(100)
 *
 *   // Create a channel that processes orders in batches
 *   const orderChannel = Channel.fromPubSubArray(orderPubSub)
 *
 *   // Transform to process each batch of orders
 *   const processedChannel = Channel.map(orderChannel, (orderBatch) => {
 *     const totalRevenue = orderBatch.reduce((sum, order) => sum + order.total, 0)
 *     const customerCount = new Set(orderBatch.map((order) =>
 *       order.customerId
 *     )).size
 *
 *     return {
 *       batchSize: orderBatch.length,
 *       totalRevenue,
 *       uniqueCustomers: customerCount,
 *       processedAt: Date.now(),
 *       orders: orderBatch
 *     }
 *   })
 *
 *   return processedChannel
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, PubSub } from "effect"
 *
 * class LogProcessingError extends Data.TaggedError("LogProcessingError")<{
 *   readonly batchId: string
 *   readonly cause: string
 * }> {}
 *
 * interface LogEntry {
 *   readonly timestamp: number
 *   readonly level: "info" | "warn" | "error"
 *   readonly message: string
 *   readonly source: string
 * }
 *
 * const logAggregator = Effect.gen(function*() {
 *   const logPubSub = yield* PubSub.bounded<LogEntry>(500)
 *
 *   // Create a channel that collects logs in batches
 *   const logChannel = Channel.fromPubSubArray(logPubSub)
 *
 *   // Transform to analyze log batches
 *   const analysisChannel = Channel.map(logChannel, (logBatch) => {
 *     const errorCount = logBatch.filter((log) => log.level === "error").length
 *     const warnCount = logBatch.filter((log) => log.level === "warn").length
 *     const infoCount = logBatch.filter((log) => log.level === "info").length
 *
 *     const timeRange = {
 *       start: Math.min(...logBatch.map((log) => log.timestamp)),
 *       end: Math.max(...logBatch.map((log) => log.timestamp))
 *     }
 *
 *     return {
 *       batchId: Math.random().toString(36).substr(2, 9),
 *       totalEntries: logBatch.length,
 *       errorCount,
 *       warnCount,
 *       infoCount,
 *       timeRange,
 *       sources: [...new Set(logBatch.map((log) => log.source))]
 *     }
 *   })
 *
 *   return analysisChannel
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromPubSubArray = pubsub => unwrap(Effect.map(PubSub.subscribe(pubsub), fromSubscriptionArray));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromPubSubTake = pubsub => unwrap(Effect.map(PubSub.subscribe(pubsub), sub => fromEffectTake(PubSub.take(sub))));
/**
 * Creates a Channel from a Schedule.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromSchedule = schedule => fromPull(Effect.map(Schedule.toStepWithSleep(schedule), step => step(void 0)));
/**
 * Creates a Channel from a AsyncIterable.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromAsyncIterable = (iterable, onError) => fromTransform(Effect.fnUntraced(function* (_, scope) {
  const iter = iterable[Symbol.asyncIterator]();
  if (iter.return) {
    yield* Scope.addFinalizer(scope, Effect.promise(() => iter.return()));
  }
  return Effect.flatMap(Effect.tryPromise({
    try: () => iter.next(),
    catch: onError
  }), result => result.done ? Cause.done(result.value) : Effect.succeed(result.value));
}));
/**
 * Creates a Channel from a AsyncIterable that emits arrays of elements.
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromAsyncIterableArray = (iterable, onError) => map(fromAsyncIterable(iterable, onError), Arr.of);
/**
 * Maps the output of this channel using the specified function.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class TransformError extends Data.TaggedError("TransformError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Basic mapping of channel values
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * const doubledChannel = Channel.map(numbersChannel, (n) => n * 2)
 * // Outputs: 2, 4, 6, 8, 10
 *
 * // Transform string data
 * const wordsChannel = Channel.fromIterable(["hello", "world", "effect"])
 * const upperCaseChannel = Channel.map(wordsChannel, (word) => word.toUpperCase())
 * // Outputs: "HELLO", "WORLD", "EFFECT"
 *
 * // Complex object transformation
 * type User = { id: number; name: string }
 * type UserDisplay = { displayName: string; isActive: boolean }
 *
 * const usersChannel = Channel.fromIterable([
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" }
 * ])
 * const displayChannel = Channel.map(usersChannel, (user): UserDisplay => ({
 *   displayName: `User: ${user.name}`,
 *   isActive: true
 * }))
 * ```
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const map = /*#__PURE__*/dual(2, (self, f) => transformPull(self, pull => Effect.sync(() => {
  let i = 0;
  return Effect.map(pull, o => f(o, i++));
})));
/**
 * Maps the done value of this channel using the specified function.
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const mapDone = /*#__PURE__*/dual(2, (self, f) => mapDoneEffect(self, o => Effect.succeed(f(o))));
/**
 * Maps the done value of this channel using the specified effectful function.
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const mapDoneEffect = /*#__PURE__*/dual(2, (self, f) => transformPull(self, pull => Effect.succeed(Pull.catchDone(pull, done => Effect.flatMap(f(done), Cause.done)))));
const concurrencyIsSequential = concurrency => concurrency === undefined || concurrency !== "unbounded" && concurrency <= 1;
/**
 * Returns a new channel, which sequentially combines this channel, together
 * with the provided factory function, which creates a second channel based on
 * the output values of this channel. The result is a channel that will first
 * perform the functions of this channel, before performing the functions of
 * the created channel (including yielding its terminal value).
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   readonly url: string
 * }> {}
 *
 * // Transform values using effectful operations
 * const urlsChannel = Channel.fromIterable([
 *   "/api/users/1",
 *   "/api/users/2",
 *   "/api/users/3"
 * ])
 *
 * const fetchDataChannel = Channel.mapEffect(
 *   urlsChannel,
 *   (url) =>
 *     Effect.tryPromise({
 *       try: () => fetch(url).then((res) => res.json()),
 *       catch: () => new NetworkError({ url })
 *     })
 * )
 *
 * // Concurrent processing with options
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 * const processedChannel = Channel.mapEffect(
 *   numbersChannel,
 *   (n) =>
 *     Effect.gen(function*() {
 *       yield* Effect.sleep("100 millis") // Simulate async work
 *       return n * n
 *     }),
 *   { concurrency: 3, unordered: true }
 * )
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const mapEffect = /*#__PURE__*/dual(args => isChannel(args[0]), (self, f, options) => concurrencyIsSequential(options?.concurrency) ? mapEffectSequential(self, f) : mapEffectConcurrent(self, f, options));
const mapEffectSequential = (self, f) => fromTransform((upstream, scope) => {
  let i = 0;
  return Effect.map(toTransform(self)(upstream, scope), Effect.flatMap(o => f(o, i++)));
});
const mapEffectConcurrent = (self, f, options) => fromTransformBracket(Effect.fnUntraced(function* (upstream, scope, forkedScope) {
  let i = 0;
  const pull = yield* toTransform(self)(upstream, scope);
  const concurrencyN = options.concurrency === "unbounded" ? Number.MAX_SAFE_INTEGER : options.concurrency;
  const queue = yield* Queue.bounded(0);
  yield* Scope.addFinalizer(forkedScope, Queue.shutdown(queue));
  const runFork = Effect.runForkWith(yield* Effect.context());
  const trackFiber = Fiber.runIn(forkedScope);
  if (options.unordered) {
    const semaphore = Semaphore.makeUnsafe(concurrencyN);
    const release = constant(semaphore.release(1));
    const handle = Effect.matchCauseEffect({
      onFailure: cause => Effect.flatMap(Queue.failCause(queue, cause), release),
      onSuccess: value => Effect.flatMap(Queue.offer(queue, value), release)
    });
    yield* semaphore.take(1).pipe(Effect.flatMap(() => pull), Effect.flatMap(value => {
      trackFiber(runFork(handle(f(value, i++))));
      return Effect.void;
    }), Effect.forever({
      disableYield: true
    }), Effect.catchCause(cause => semaphore.withPermits(concurrencyN - 1)(Queue.failCause(queue, cause))), Effect.forkIn(forkedScope));
  } else {
    // capacity is n - 2 because
    // - 1 for the offer *after* starting a fiber
    // - 1 for the current processing fiber
    const effects = yield* Queue.bounded(concurrencyN - 2);
    yield* Scope.addFinalizer(forkedScope, Queue.shutdown(queue));
    yield* Queue.take(effects).pipe(Effect.flatten, Effect.flatMap(value => Queue.offer(queue, value)), Effect.forever({
      disableYield: true
    }), Effect.catchCause(cause => Queue.failCause(queue, cause)), Effect.forkIn(forkedScope));
    let errorCause;
    const onExit = exit => {
      if (exit._tag === "Success") return;
      errorCause = exit.cause;
      Queue.failCauseUnsafe(queue, exit.cause);
    };
    yield* pull.pipe(Effect.flatMap(value => {
      if (errorCause) return Effect.failCause(errorCause);
      const fiber = runFork(f(value, i++));
      trackFiber(fiber);
      fiber.addObserver(onExit);
      return Queue.offer(effects, Fiber.join(fiber));
    }), Effect.forever({
      disableYield: true
    }), Effect.catchCause(cause => Queue.offer(effects, Exit.failCause(cause)).pipe(Effect.andThen(Queue.failCause(effects, cause)))), Effect.forkIn(forkedScope));
  }
  return Queue.take(queue);
}));
/**
 * Returns a new channel which is the same as this one but applies the given
 * function to the input channel’s input elements.
 *
 * @since 2.0.0
 * @category sequencing
 */
export const mapInput = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => toTransform(self)(Effect.flatMap(upstream, el => f(el)), scope)));
/**
 * Returns a new channel which is the same as this one but applies the given
 * function to the input errors.
 *
 * @since 2.0.0
 * @category sequencing
 */
export const mapInputError = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => toTransform(self)(Effect.catch(upstream, err => {
  if (Cause.isDone(err)) return Effect.fail(err);
  return Effect.flatMap(f(err), Effect.fail);
}), scope)));
/**
 * Applies a side effect function to each output element of the channel,
 * returning a new channel that emits the same elements.
 *
 * The `tap` function allows you to perform side effects (like logging or
 * debugging) on each element emitted by a channel without modifying the
 * elements themselves.
 *
 * @example
 * ```ts
 * import { Channel, Console, Data } from "effect"
 *
 * class LogError extends Data.TaggedError("LogError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Tap into each output element to perform side effects
 * const tappedChannel = Channel.tap(
 *   numberChannel,
 *   (n) => Console.log(`Processing number: ${n}`)
 * )
 *
 * // The channel still outputs the same elements but logs each one
 * // Outputs: 1, 2, 3 (while logging each)
 * ```
 *
 * @since 4.0.0
 * @category sequencing
 */
export const tap = /*#__PURE__*/dual(args => isChannel(args[0]), (self, f, options) => mapEffect(self, a => Effect.as(f(a), a), options));
/**
 * Returns a new channel, which sequentially combines this channel, together
 * with the provided factory function, which creates a second channel based on
 * the output values of this channel. The result is a channel that will first
 * perform the functions of this channel, before performing the functions of
 * the created channel (including yielding its terminal value).
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ProcessError extends Data.TaggedError("ProcessError")<{
 *   readonly cause: string
 * }> {}
 *
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 *
 * // FlatMap each number to create new channels
 * const flatMappedChannel = Channel.flatMap(
 *   numberChannel,
 *   (n) =>
 *     Channel.fromIterable(Array.from({ length: n }, (_, i) => `item-${n}-${i}`))
 * )
 *
 * // Flattens nested channels into a single stream
 * // Outputs: "item-1-0", "item-2-0", "item-2-1", "item-3-0", "item-3-1", "item-3-2"
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const flatMap = /*#__PURE__*/dual(args => isChannel(args[0]), (self, f, options) => concurrencyIsSequential(options?.concurrency) ? flatMapSequential(self, f) : flatMapConcurrent(self, f, options));
const flatMapSequential = (self, f) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => {
  let childPull;
  let childScope;
  const makePull = Effect.flatMap(pull, value => {
    childScope ??= Scope.forkUnsafe(scope);
    return Effect.flatMapEager(toTransform(f(value))(upstream, childScope), pull => {
      childPull = catchHalt(pull);
      return childPull;
    });
  });
  const catchHalt = Pull.catchDone(_ => {
    childPull = undefined;
    // we can reuse the scope if the only finalizer is the "fork" one
    if (childScope.state._tag === "Open" && childScope.state.finalizers.size === 1) {
      return makePull;
    }
    const close = Scope.close(childScope, Exit.void);
    childScope = undefined;
    return Effect.flatMap(close, () => makePull);
  });
  return Effect.suspend(() => childPull ?? makePull);
}));
const flatMapConcurrent = (self, f, options) => self.pipe(map(f), mergeAll(options));
/**
 * Concatenates this channel with another channel created from the terminal value
 * of this channel. The new channel is created using the provided function.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ConcatError extends Data.TaggedError("ConcatError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel that outputs numbers and terminates with sum
 * const numberChannel = Channel.fromIterable([1, 2, 3]).pipe(
 *   Channel.concatWith((sum: void) => Channel.succeed(`Completed processing`))
 * )
 *
 * // Concatenates additional channel based on completion value
 * // Outputs: 1, 2, 3, then "Completed processing"
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const concatWith = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => Effect.sync(() => {
  let currentPull;
  const forkedScope = Scope.forkUnsafe(scope);
  const makePull = Effect.flatMap(toTransform(self)(upstream, forkedScope), pull => {
    currentPull = Pull.catchDone(pull, leftover => {
      return Scope.close(forkedScope, Exit.void).pipe(Effect.flatMap(() => toTransform(f(leftover))(upstream, scope)), Effect.flatMap(pull => {
        currentPull = pull;
        return pull;
      }));
    });
    return currentPull;
  });
  return Effect.suspend(() => currentPull ?? makePull);
})));
/**
 * Concatenates this channel with another channel, so that the second channel
 * starts emitting values after the first channel has completed.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ConcatError extends Data.TaggedError("ConcatError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create two channels
 * const firstChannel = Channel.fromIterable([1, 2, 3])
 * const secondChannel = Channel.fromIterable(["a", "b", "c"])
 *
 * // Concatenate them
 * const concatenatedChannel = Channel.concat(firstChannel, secondChannel)
 *
 * // Outputs: 1, 2, 3, "a", "b", "c"
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const concat = /*#__PURE__*/dual(2, (self, that) => concatWith(self, _ => that));
/**
 * Combines the elements from this channel and the specified channel by
 * repeatedly applying the function `f` to extract an element using both sides
 * and conceptually "offer" it to the destination channel. `f` can maintain
 * some internal state to control the combining process, with the initial
 * state being specified by `s`.
 *
 * @since 4.0.0
 * @category sequencing
 */
export const combine = /*#__PURE__*/dual(4, (self, that, s, f) => fromTransform(Effect.fnUntraced(function* (upstream, scope) {
  const leftPull = yield* toTransform(self)(upstream, scope);
  const rightPull = yield* toTransform(that)(upstream, scope);
  let state = s();
  return Effect.suspend(() => {
    const combinedPull = f(state, leftPull, rightPull);
    return Effect.map(combinedPull, ([a, s1]) => {
      state = s1;
      return a;
    });
  });
})));
/**
 * @since 2.0.0
 * @category sequencing
 */
export const orElseIfEmpty = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => Effect.sync(() => {
  let currentPull;
  const forkedScope = Scope.forkUnsafe(scope);
  const makePull = Effect.flatMap(toTransform(self)(upstream, forkedScope), pull => {
    const next = pull.pipe(Effect.tap(() => {
      currentPull = pull;
      return Effect.void;
    }), Pull.catchDone(leftover => Scope.close(forkedScope, Exit.succeed(leftover)).pipe(Effect.andThen(toTransform(f(leftover))(upstream, scope)), Effect.flatMap(pull => {
      currentPull = pull;
      return pull;
    }))));
    currentPull = next;
    return next;
  });
  return Effect.suspend(() => currentPull ?? makePull);
})));
/**
 * Flatten a channel of channels.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class FlattenError extends Data.TaggedError("FlattenError")<{
 *   readonly cause: string
 * }> {}
 *
 * // Create a channel that outputs channels
 * const nestedChannels = Channel.fromIterable([
 *   Channel.fromIterable([1, 2]),
 *   Channel.fromIterable([3, 4]),
 *   Channel.fromIterable([5, 6])
 * ])
 *
 * // Flatten the nested channels
 * const flattenedChannel = Channel.flatten(nestedChannels)
 *
 * // Outputs: 1, 2, 3, 4, 5, 6
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const flatten = channels => flatMap(channels, identity_);
/**
 * Flattens a channel that outputs arrays into a channel that outputs individual elements.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class FlattenError extends Data.TaggedError("FlattenError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a channel that outputs arrays
 * const arrayChannel = Channel.fromIterable([
 *   [1, 2, 3],
 *   [4, 5],
 *   [6, 7, 8, 9]
 * ])
 *
 * // Flatten the arrays into individual elements
 * const flattenedChannel = Channel.flattenArray(arrayChannel)
 *
 * // Outputs: 1, 2, 3, 4, 5, 6, 7, 8, 9
 * ```
 *
 * @since 4.0.0
 * @category utils
 */
export const flattenArray = self => transformPull(self, pull => {
  let array;
  let index = 0;
  const pump = Effect.suspend(function loop() {
    if (array === undefined) {
      return Effect.flatMap(pull, array_ => {
        switch (array_.length) {
          case 0:
            return loop();
          case 1:
            return Effect.succeed(array_[0]);
          default:
            {
              array = array_;
              return Effect.succeed(array_[index++]);
            }
        }
      });
    }
    const next = array[index++];
    if (index >= array.length) {
      array = undefined;
      index = 0;
    }
    return Effect.succeed(next);
  });
  return Effect.succeed(pump);
});
/**
 * @since 4.0.0
 * @category utils
 */
export const flattenTake = self => mapEffectSequential(self, Take.toPull);
/**
 * Creates a new channel that consumes all output from the source channel
 * but emits nothing, preserving only the completion value.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel that outputs values
 * const sourceChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Drain all output, keeping only the completion
 * const drainedChannel = Channel.drain(sourceChannel)
 *
 * // The channel completes but emits no values
 * // Useful for consuming side effects without collecting output
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const drain = self => transformPull(self, pull => Effect.succeed(Effect.forever(pull, {
  disableYield: true
})));
/**
 * Repeats this channel according to the provided schedule.
 *
 * @since 4.0.0
 * @category utils
 */
export const repeat = /*#__PURE__*/dual(2, (self, schedule) => Schedule.toStepWithMetadata(typeof schedule === "function" ? schedule(identity_) : schedule).pipe(Effect.map(step => {
  let meta = Schedule.CurrentMetadata.defaultValue();
  const loop = concatWith(provideServiceEffect(self, Schedule.CurrentMetadata, Effect.sync(() => meta)), done => step(done).pipe(Effect.map(meta_ => {
    meta = meta_;
    return loop;
  }), Pull.catchDone(() => Effect.succeed(end(done))), unwrap));
  return loop;
}), unwrap));
/**
 * Repeats this channel forever.
 *
 * @since 4.0.0
 * @category utils
 */
export const forever = self => concatWith(self, () => forever(self));
/**
 * @since 4.0.0
 * @category utils
 */
export const schedule = /*#__PURE__*/dual(2, (self, schedule) => transformPull(self, (pull, _scope) => Effect.map(Schedule.toStepWithSleep(schedule), step => {
  const pullWithStep = Effect.tap(pull, step);
  return pullWithStep;
})));
/**
 * Filters the output elements of a channel using a predicate function.
 * Elements that don't match the predicate are discarded.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel with mixed numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5, 6, 7, 8])
 *
 * // Filter to keep only even numbers
 * const evenChannel = Channel.filter(numbersChannel, (n) => n % 2 === 0)
 * // Outputs: 2, 4, 6, 8
 *
 * // Filter with type refinement
 * const mixedChannel = Channel.fromIterable([1, "hello", 2, "world", 3])
 * const numbersOnlyChannel = Channel.filter(
 *   mixedChannel,
 *   (value): value is number => typeof value === "number"
 * )
 * // Outputs: 1, 2, 3 (all typed as numbers)
 * ```
 *
 * @since 2.0.0
 * @category Filtering
 */
export const filter = /*#__PURE__*/dual(2, (self, predicate) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => Effect.flatMap(pull, function loop(elem) {
  return predicate(elem) ? Effect.succeed(elem) : Effect.flatMap(pull, loop);
}))));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterMap = /*#__PURE__*/dual(2, (self, filter) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => Effect.flatMap(pull, function loop(elem) {
  const result = filter(elem);
  return Result.isFailure(result) ? Effect.flatMap(pull, loop) : Effect.succeed(result.success);
}))));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterEffect = /*#__PURE__*/dual(2, (self, predicate) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => Effect.flatMap(pull, function loop(elem) {
  return Effect.flatMap(predicate(elem), passes => passes ? Effect.succeed(elem) : Effect.flatMap(pull, loop));
}))));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterMapEffect = /*#__PURE__*/dual(2, (self, filter) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => Effect.flatMap(pull, function loop(elem) {
  return Effect.flatMap(filter(elem), result => Result.isFailure(result) ? Effect.flatMap(pull, loop) : Effect.succeed(result.success));
}))));
/**
 * Filters arrays of elements emitted by a channel, applying the filter
 * to each element within the arrays and only emitting non-empty filtered arrays.
 *
 * @example
 * ```ts
 * import { Array, Channel } from "effect"
 *
 * const nonEmptyArrayPredicate = Array.isReadonlyArrayNonEmpty
 *
 * // Create a channel that outputs arrays of mixed data
 * const arrayChannel = Channel.fromIterable([
 *   Array.make(1, 2, 3, 4, 5),
 *   Array.make(6, 7, 8, 9, 10),
 *   Array.make(11, 12, 13, 14, 15)
 * ]).pipe(Channel.filter(nonEmptyArrayPredicate))
 *
 * // Filter arrays to keep only even numbers
 * const evenArraysChannel = Channel.filterArray(arrayChannel, (n) => n % 2 === 0)
 * // Outputs: [2, 4], [6, 8, 10], [12, 14]
 * // Note: Only non-empty filtered arrays are emitted
 *
 * // Arrays that would become empty after filtering are discarded entirely
 * const oddChannel = Channel.fromIterable([
 *   Array.make(1, 3, 5),
 *   Array.make(2, 4),
 *   Array.make(7, 9)
 * ]).pipe(Channel.filter(nonEmptyArrayPredicate))
 * const filteredOddChannel = Channel.filterArray(oddChannel, (n) => n % 2 === 0)
 * // Outputs: [2, 4] (the arrays [1,3,5] and [7,9] are discarded)
 * ```
 *
 * @since 4.0.0
 * @category Filtering
 */
export const filterArray = /*#__PURE__*/dual(2, (self, predicate) => transformPull(self, pull => Effect.succeed(Effect.flatMap(pull, function loop(arr) {
  const passes = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      passes.push(arr[i]);
    }
  }
  return Arr.isReadonlyArrayNonEmpty(passes) ? Effect.succeed(passes) : Effect.flatMap(pull, loop);
}))));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterMapArray = /*#__PURE__*/dual(2, (self, filter) => transformPull(self, pull => Effect.succeed(Effect.flatMap(pull, function loop(arr) {
  const passes = [];
  for (let i = 0; i < arr.length; i++) {
    const result = filter(arr[i]);
    if (Result.isSuccess(result)) {
      passes.push(result.success);
    }
  }
  return Arr.isReadonlyArrayNonEmpty(passes) ? Effect.succeed(passes) : Effect.flatMap(pull, loop);
}))));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterArrayEffect = /*#__PURE__*/dual(2, (self, predicate) => transformPull(self, pull => {
  const f = Effect.flatMap(pull, arr => Effect.filter(arr, predicate));
  return Effect.succeed(Effect.flatMap(f, function loop(arr) {
    return Arr.isReadonlyArrayNonEmpty(arr) ? Effect.succeed(arr) : Effect.flatMap(f, loop);
  }));
}));
/**
 * @since 4.0.0
 * @category Filtering
 */
export const filterMapArrayEffect = /*#__PURE__*/dual(2, (self, filter) => transformPull(self, pull => Effect.succeed(Effect.flatMap(pull, function loop(arr) {
  return Effect.flatMap(Effect.filterMapEffect(arr, filter), passes => Arr.isReadonlyArrayNonEmpty(passes) ? Effect.succeed(passes) : Effect.flatMap(pull, loop));
}))));
/**
 * Statefully maps over a channel with an accumulator, where each element can produce multiple output values.
 *
 * @example
 * ```ts
 * import { Channel, Effect } from "effect"
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4])
 *
 * // Use mapAccum to create running sums and emit both current and sum
 * const runningSum = Channel.mapAccum(
 *   numbersChannel,
 *   () => 0, // initial accumulator state
 *   (sum, current) => {
 *     const newSum = sum + current
 *     // Return [newState, outputValues]
 *     return [newSum, [current, newSum]] as const
 *   }
 * )
 * // Outputs: 1, 1, 2, 3, 3, 6, 4, 10
 *
 * // Using with Effect for async processing
 * const asyncMapAccum = Channel.mapAccum(
 *   numbersChannel,
 *   () => "",
 *   (acc, value) =>
 *     Effect.gen(function*() {
 *       const newAcc = acc + value.toString()
 *       return [newAcc, [`${value}-processed`, newAcc]] as const
 *     })
 * )
 * ```
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const mapAccum = /*#__PURE__*/dual(args => isChannel(args[0]), (self, initial, f, options) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => {
  let state = initial();
  let current;
  let index = 0;
  let cause;
  const pullNext = Effect.matchCauseEffect(pull, {
    onFailure(cause_) {
      cause = cause_;
      const b = options?.onHalt && options.onHalt(state);
      return b && b.length > 0 ? Effect.succeed([state, b]) : Effect.failCause(cause_);
    },
    onSuccess(a) {
      const b = f(state, a);
      return Arr.isArray(b) ? Effect.succeed(b) : b;
    }
  });
  const pump = Effect.suspend(function loop() {
    if (current === undefined) {
      if (cause) return Effect.failCause(cause);
      return Effect.flatMap(pullNext, ([newState, values]) => {
        state = newState;
        if (values.length === 0) {
          return loop();
        } else if (values.length === 1) {
          return Effect.succeed(values[0]);
        }
        current = values;
        return loop();
      });
    }
    const next = current[index++];
    if (index >= current.length) {
      current = undefined;
      index = 0;
    }
    return Effect.succeed(next);
  });
  return pump;
})));
/**
 * Statefully transforms a channel by scanning over its output with an accumulator function.
 * Emits the intermediate results of the scan operation.
 *
 * @example
 * ```ts
 * import { Channel } from "effect"
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Scan to create running sum
 * const runningSumChannel = Channel.scan(numbersChannel, 0, (sum, n) => sum + n)
 * // Outputs: 0, 1, 3, 6, 10, 15
 * // Note: emits the initial value and each intermediate result
 *
 * // Scan with string concatenation
 * const wordsChannel = Channel.fromIterable(["hello", "world", "from", "effect"])
 * const sentenceChannel = Channel.scan(
 *   wordsChannel,
 *   "",
 *   (sentence, word) => sentence === "" ? word : `${sentence} ${word}`
 * )
 * // Outputs: "", "hello", "hello world", "hello world from", "hello world from effect"
 * ```
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const scan = /*#__PURE__*/dual(3, (self, initial, f) => scanEffect(self, initial, (s, a) => Effect.succeed(f(s, a))));
/**
 * Statefully transforms a channel by scanning over its output with an effectful accumulator function.
 * Emits the intermediate results of the scan operation.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class ScanError extends Data.TaggedError("ScanError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4])
 *
 * // Effectful scan with async operations
 * const asyncScanChannel = Channel.scanEffect(
 *   numbersChannel,
 *   "",
 *   (acc, value) =>
 *     Effect.gen(function*() {
 *       // Simulate async work
 *       yield* Effect.sleep("10 millis")
 *       return acc + value.toString()
 *     })
 * )
 * // Outputs: "", "1", "12", "123", "1234"
 *
 * // Scan with error handling
 * const errorHandlingScan = Channel.scanEffect(
 *   numbersChannel,
 *   0,
 *   (sum, n) => {
 *     if (n < 0) {
 *       return Effect.fail(new ScanError({ reason: "negative number" }))
 *     }
 *     return Effect.succeed(sum + n)
 *   }
 * )
 * ```
 *
 * @since 2.0.0
 * @category Sequencing
 */
export const scanEffect = /*#__PURE__*/dual(3, (self, initial, f) => fromTransform((upstream, scope) => Effect.map(toTransform(self)(upstream, scope), pull => {
  let state = initial;
  let isFirst = true;
  return Effect.suspend(() => {
    if (isFirst) {
      isFirst = false;
      return Effect.succeed(state);
    }
    return Effect.map(Effect.flatMap(pull, a => f(state, a)), newState => {
      state = newState;
      return state;
    });
  });
})));
/**
 * Catches any cause of failure from the channel and allows recovery by
 * creating a new channel based on the caught cause.
 *
 * @example
 * ```ts
 * import { Cause, Channel, Data } from "effect"
 *
 * class ProcessError extends Data.TaggedError("ProcessError")<{
 *   readonly reason: string
 * }> {}
 *
 * class RecoveryError extends Data.TaggedError("RecoveryError")<{
 *   readonly message: string
 * }> {}
 *
 * // Create a failing channel
 * const failingChannel = Channel.fail(
 *   new ProcessError({ reason: "network error" })
 * )
 *
 * // Catch the cause and provide recovery
 * const recoveredChannel = Channel.catchCause(failingChannel, (cause) => {
 *   if (Cause.hasFails(cause)) {
 *     return Channel.succeed("Recovered from failure")
 *   }
 *   return Channel.succeed("Recovered from interruption")
 * })
 *
 * // The channel recovers gracefully from errors
 * ```
 *
 * @since 4.0.0
 * @category Error handling
 */
export const catchCause = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => {
  let forkedScope = Scope.forkUnsafe(scope);
  return Effect.map(toTransform(self)(upstream, forkedScope), pull => {
    let currentPull = pull.pipe(Effect.catchCause(cause => {
      if (Pull.isDoneCause(cause)) {
        return Effect.failCause(cause);
      }
      const toClose = forkedScope;
      forkedScope = Scope.forkUnsafe(scope);
      return Scope.close(toClose, Exit.failCause(cause)).pipe(Effect.andThen(toTransform(f(cause))(upstream, forkedScope)), Effect.flatMap(childPull => {
        currentPull = childPull;
        return childPull;
      }));
    }));
    return Effect.suspend(() => currentPull);
  });
}));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const tapCause = /*#__PURE__*/dual(2, (self, f) => catchCause(self, cause => fromEffectDrain(Effect.flatMap(f(cause), _ => Effect.failCause(cause)))));
/**
 * Catches causes of failure that match a specific filter, allowing
 * conditional error recovery based on the type of failure.
 *
 * @since 4.0.0
 * @category Error handling
 */
export const catchCauseIf = /*#__PURE__*/dual(3, (self, predicate, f) => catchCause(self, cause => {
  return predicate(cause) ? f(cause) : failCause(cause);
}));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const catchCauseFilter = /*#__PURE__*/dual(3, (self, filter, f) => catchCause(self, cause => {
  const result = filter(cause);
  return Result.isFailure(result) ? failCause(result.failure) : f(result.success, cause);
}));
const catch_ = /*#__PURE__*/dual(2, (self, f) => catchCauseFilter(self, Cause.findError, e => f(e)));
export {
/**
 * @since 4.0.0
 * @category Error handling
 */
catch_ as catch };
/**
 * @since 4.0.0
 * @category Error handling
 */
export const tapError = /*#__PURE__*/dual(2, (self, f) => transformPull(self, pull => Effect.succeed(Effect.tapError(pull, err => Cause.isDone(err) ? Effect.void : Effect.asVoid(f(err))))));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const catchIf = /*#__PURE__*/dual(args => isChannel(args[0]), (self, predicate, f, orElse) => catch_(self, err => {
  return predicate(err) ? f(err) : orElse ? orElse(err) : fail(err);
}));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const catchFilter = /*#__PURE__*/dual(args => isChannel(args[0]), (self, filter, f, orElse) => catch_(self, err => {
  const result = filter(err);
  return Result.isFailure(result) ? orElse ? orElse(result.failure) : fail(result.failure) : f(result.success);
}));
/**
 * @since 4.0.0
 * @category Error handling
 */
export const catchTag = /*#__PURE__*/dual(args => isChannel(args[0]), (self, k, f, orElse) => {
  const pred = Array.isArray(k) ? e => hasProperty(e, "_tag") && k.includes(e._tag) : isTagged(k);
  return catchIf(self, pred, f, orElse);
});
/**
 * Catches a specific reason within a tagged error.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class RateLimitError extends Data.TaggedError("RateLimitError")<{
 *   retryAfter: number
 * }> {}
 *
 * class QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{
 *   limit: number
 * }> {}
 *
 * class AiError extends Data.TaggedError("AiError")<{
 *   reason: RateLimitError | QuotaExceededError
 * }> {}
 *
 * const channel = Channel.fail(
 *   new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })
 * )
 *
 * const recovered = channel.pipe(
 *   Channel.catchReason("AiError", "RateLimitError", (reason) =>
 *     Channel.succeed(`retry: ${reason.retryAfter}`)
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category Error handling
 */
export const catchReason = /*#__PURE__*/dual(args => isChannel(args[0]), (self, errorTag, reasonTag, f, orElse) => catch_(self, error => {
  if (isTagged(error, errorTag) && hasProperty(error, "reason")) {
    const reason = error.reason;
    if (isTagged(reason, reasonTag)) {
      return f(reason, error);
    }
    return orElse ? orElse(reason, error) : fail(error);
  }
  return fail(error);
}));
/**
 * Catches multiple reasons within a tagged error using an object of handlers.
 *
 * @since 4.0.0
 * @category Error handling
 */
export const catchReasons = /*#__PURE__*/dual(args => isChannel(args[0]), (self, errorTag, cases, orElse) => {
  let keys;
  return catch_(self, error => {
    if (isTagged(error, errorTag) && hasProperty(error, "reason") && hasProperty(error.reason, "_tag") && String.isString(error.reason._tag)) {
      const reason = error.reason;
      keys ??= new Set(Object.keys(cases));
      if (keys.has(reason._tag)) {
        return cases[reason._tag](reason, error);
      }
      return orElse ? orElse(reason, error) : fail(error);
    }
    return fail(error);
  });
});
/**
 * Promotes nested reason errors into the channel error, replacing the parent error.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class RateLimitError extends Data.TaggedError("RateLimitError")<{
 *   retryAfter: number
 * }> {}
 *
 * class QuotaExceededError extends Data.TaggedError("QuotaExceededError")<{
 *   limit: number
 * }> {}
 *
 * class AiError extends Data.TaggedError("AiError")<{
 *   reason: RateLimitError | QuotaExceededError
 * }> {}
 *
 * const channel = Channel.fail(
 *   new AiError({ reason: new RateLimitError({ retryAfter: 60 }) })
 * )
 *
 * const unwrapped = channel.pipe(Channel.unwrapReason("AiError"))
 * ```
 *
 * @since 4.0.0
 * @category Error handling
 */
export const unwrapReason = /*#__PURE__*/dual(2, (self, errorTag) => catchFilter(self, error => isTagged(error, errorTag) && hasProperty(error, "reason") ? Result.succeed(error.reason) : Result.fail(error), fail));
/**
 * Returns a new channel, which is the same as this one, except the failure
 * value of the returned channel is created by applying the specified function
 * to the failure value of this channel.
 *
 * @since 2.0.0
 * @category Error handling
 */
export const mapError = /*#__PURE__*/dual(2, (self, f) => catch_(self, err => fail(f(err))));
/**
 * Converts all errors in the channel to defects (unrecoverable failures).
 * This is useful when you want to treat errors as programming errors.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class ValidationError extends Data.TaggedError("ValidationError")<{
 *   readonly field: string
 * }> {}
 *
 * // Create a channel that might fail
 * const failingChannel = Channel.fail(new ValidationError({ field: "email" }))
 *
 * // Convert failures to defects
 * const fatalChannel = Channel.orDie(failingChannel)
 *
 * // Any failure will now become a defect (uncaught exception)
 * ```
 *
 * @since 4.0.0
 * @category Error handling
 */
export const orDie = self => catch_(self, die);
/**
 * Ignores all errors in the channel, converting them to an empty channel.
 *
 * Use the `log` option to emit the full {@link Cause} when the channel fails.
 *
 * @since 4.0.0
 * @category Error handling
 */
export const ignore = /*#__PURE__*/dual(args => isChannel(args[0]), (self, options) => {
  if (!options?.log) {
    return catch_(self, () => empty);
  }
  const logEffect = Effect.logWithLevel(options.log === true ? undefined : options.log);
  return catch_(tapCause(self, cause => Cause.hasFails(cause) ? logEffect(cause) : Effect.void), () => empty);
});
const ignoreCause_ = self => catchCause(self, () => empty);
/**
 * Ignores all errors in the channel including defects, converting them to an empty channel.
 *
 * Use the `log` option to emit the full {@link Cause} when the channel fails.
 *
 * @since 4.0.0
 * @category Error handling
 */
export const ignoreCause = /*#__PURE__*/dual(args => isChannel(args[0]), (self, options) => {
  if (!options?.log) return ignoreCause_(self);
  const logEffect = Effect.logWithLevel(options.log === true ? undefined : options.log);
  return ignoreCause_(tapCause(self, cause => logEffect(cause)));
});
/**
 * Returns a new channel that retries this channel according to the specified
 * schedule whenever it fails.
 *
 * @since 4.0.0
 * @category utils
 */
export const retry = /*#__PURE__*/dual(2, (self, schedule) => suspend(() => {
  let step = undefined;
  let meta = Schedule.CurrentMetadata.defaultValue();
  const selfWithMeta = provideServiceEffect(self, Schedule.CurrentMetadata, Effect.sync(() => meta));
  const withReset = onFirst(selfWithMeta, () => {
    step = undefined;
    return Effect.void;
  });
  const resolvedSchedule = typeof schedule === "function" ? schedule(identity_) : schedule;
  const loop = catch_(withReset, Effect.fnUntraced(function* (error) {
    if (!step) {
      step = yield* Schedule.toStepWithMetadata(resolvedSchedule);
    }
    meta = yield* step(error);
    return loop;
  }, (effect, error) => Pull.catchDone(effect, () => Effect.succeed(fail(error))), unwrap));
  return loop;
}));
/**
 * Returns a new channel, which sequentially combines this channel, together
 * with the provided factory function, which creates a second channel based on
 * the output values of this channel. The result is a channel that will first
 * perform the functions of this channel, before performing the functions of
 * the created channel (including yielding its terminal value).
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class SwitchError extends Data.TaggedError("SwitchError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel that outputs numbers
 * const numberChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Switch to new channels based on each value
 * const switchedChannel = Channel.switchMap(
 *   numberChannel,
 *   (n) => Channel.fromIterable([`value-${n}`])
 * )
 *
 * // Outputs: "value-1", "value-2", "value-3"
 * ```
 *
 * @since 2.0.0
 * @category sequencing
 */
export const switchMap = /*#__PURE__*/dual(args => isChannel(args[0]), (self, f, options) => self.pipe(map(f), mergeAll({
  ...options,
  concurrency: options?.concurrency ?? 1,
  switch: true
})));
/**
 * Merges multiple channels with specified concurrency and buffering options.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class MergeAllError extends Data.TaggedError("MergeAllError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create channels that output other channels
 * const nestedChannels = Channel.fromIterable([
 *   Channel.fromIterable([1, 2]),
 *   Channel.fromIterable([3, 4]),
 *   Channel.fromIterable([5, 6])
 * ])
 *
 * // Merge all channels with bounded concurrency
 * const mergedChannel = Channel.mergeAll({
 *   concurrency: 2,
 *   bufferSize: 16
 * })(nestedChannels)
 *
 * // Outputs: 1, 2, 3, 4, 5, 6 (order may vary due to concurrency)
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const mergeAll = /*#__PURE__*/dual(2, (channels, {
  bufferSize = 16,
  concurrency,
  switch: switch_ = false
}) => fromTransformBracket(Effect.fnUntraced(function* (upstream, scope, forkedScope) {
  const concurrencyN = concurrency === "unbounded" ? Number.MAX_SAFE_INTEGER : Math.max(1, concurrency);
  const semaphore = switch_ ? undefined : Semaphore.makeUnsafe(concurrencyN);
  const doneLatch = yield* Latch.make(true);
  const fibers = new Set();
  const queue = yield* Queue.bounded(bufferSize);
  yield* Scope.addFinalizer(forkedScope, Queue.shutdown(queue));
  const pull = yield* toTransform(channels)(upstream, scope);
  yield* Effect.gen(function* () {
    while (true) {
      if (semaphore) yield* semaphore.take(1);
      const channel = yield* pull;
      const childScope = Scope.forkUnsafe(forkedScope);
      const childPull = yield* toTransform(channel)(upstream, childScope);
      while (fibers.size >= concurrencyN) {
        const fiber = Iterable.headUnsafe(fibers);
        fibers.delete(fiber);
        if (fibers.size === 0) yield* doneLatch.open;
        yield* Fiber.interrupt(fiber);
      }
      const fiber = yield* childPull.pipe(Effect.tap(() => Effect.yieldNow), Effect.flatMap(value => Queue.offer(queue, value)), Effect.forever({
        disableYield: true
      }), Effect.onError(Effect.fnUntraced(function* (cause) {
        const halt = Pull.filterDone(cause);
        yield* Effect.exit(Scope.close(childScope, !Result.isFailure(halt) ? Exit.succeed(halt.success.value) : Exit.failCause(halt.failure)));
        if (!fibers.has(fiber)) return;
        fibers.delete(fiber);
        if (semaphore) yield* semaphore.release(1);
        if (fibers.size === 0) yield* doneLatch.open;
        if (Result.isSuccess(halt)) return;
        return yield* Queue.failCause(queue, cause);
      })), Effect.forkChild);
      doneLatch.closeUnsafe();
      fibers.add(fiber);
    }
  }).pipe(Effect.catchCause(cause => doneLatch.whenOpen(Queue.failCause(queue, cause))), Effect.forkIn(forkedScope));
  return Queue.take(queue);
})));
/**
 * Returns a new channel, which is the merge of this channel and the specified
 * channel.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class MergeError extends Data.TaggedError("MergeError")<{
 *   readonly source: string
 * }> {}
 *
 * // Create two channels
 * const leftChannel = Channel.fromIterable([1, 2, 3])
 * const rightChannel = Channel.fromIterable(["a", "b", "c"])
 *
 * // Merge them with "either" halt strategy
 * const mergedChannel = Channel.merge(leftChannel, rightChannel, {
 *   haltStrategy: "either"
 * })
 *
 * // Outputs elements from both channels concurrently
 * // Order may vary: 1, "a", 2, "b", 3, "c"
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const merge = /*#__PURE__*/dual(args => isChannel(args[0]) && isChannel(args[1]), (left, right, options) => fromTransformBracket(Effect.fnUntraced(function* (upstream, _scope, forkedScope) {
  const strategy = options?.haltStrategy ?? "both";
  const queue = yield* Queue.bounded(0);
  yield* Scope.addFinalizer(forkedScope, Queue.shutdown(queue));
  let done = 0;
  function onExit(side, cause) {
    done++;
    if (!Pull.isDoneCause(cause)) {
      return Queue.failCause(queue, cause);
    }
    switch (strategy) {
      case "both":
        {
          return done === 2 ? Queue.failCause(queue, cause) : Effect.void;
        }
      case "left":
      case "right":
        {
          return side === strategy ? Queue.failCause(queue, cause) : Effect.void;
        }
      case "either":
        {
          return Queue.failCause(queue, cause);
        }
    }
  }
  const runSide = (side, channel, scope) => toTransform(channel)(upstream, scope).pipe(Effect.flatMap(pull => pull.pipe(Effect.flatMap(value => Queue.offer(queue, value)), Effect.forever)), Effect.onError(cause => Effect.andThen(Scope.close(scope, Pull.doneExitFromCause(cause)), onExit(side, cause))), Effect.forkIn(forkedScope));
  yield* runSide("left", left, Scope.forkUnsafe(forkedScope));
  yield* runSide("right", right, Scope.forkUnsafe(forkedScope));
  return Queue.take(queue);
})));
/**
 * @since 4.0.0
 * @category utils
 */
export const mergeEffect = /*#__PURE__*/dual(2, (self, effect) => merge(self, fromEffectDrain(effect), {
  haltStrategy: "left"
}));
/**
 * Splits upstream string chunks into lines, recognizing `\n`, `\r\n`, and
 * standalone `\r` as line terminators. The behavior matches
 * `String.linesIterator` regardless of how the input is chunked.
 *
 * A line terminator at the very end of the stream does **not** produce a
 * trailing empty line (consistent with `String.linesIterator`). Conversely,
 * if the stream ends without a terminator the final partial line is still
 * emitted.
 *
 * **Example**
 *
 * ```ts
 * import { Effect, Stream } from "effect"
 *
 * Effect.runPromise(Effect.gen(function*() {
 *   const result = yield* Stream.runCollect(
 *     Stream.splitLines(Stream.make("hel", "lo\r\nwor", "ld\n"))
 *   )
 *   console.log(result)
 *   // [ 'hello', 'world' ]
 * }))
 * ```
 *
 * @since 2.0.0
 * @category String manipulation
 */
export const splitLines = () => fromTransform((upstream, _scope) => Effect.sync(() => {
  // Accumulates text that has not yet been terminated by a line break.
  // Content is carried across chunks until a terminator is found.
  let stringBuilder = "";
  // Set when a chunk ends with \r so the next chunk can check whether
  // the following character is \n (completing a \r\n pair) or not
  // (standalone \r, which is itself a line terminator).
  let midCRLF = false;
  // Remembers the upstream Done value after the first time the upstream
  // signals completion, so subsequent pulls return Done immediately
  // without pulling upstream again.
  let done = Option.none();
  function splitLinesArray(chunk) {
    const chunkBuilder = [];
    function pushLine(segment) {
      if (stringBuilder.length === 0) {
        chunkBuilder.push(segment);
      } else {
        chunkBuilder.push(stringBuilder + segment);
        stringBuilder = "";
      }
    }
    for (let i = 0; i < chunk.length; i++) {
      const str = chunk[i];
      if (str.length !== 0) {
        let from = 0;
        let indexOfCR = str.indexOf("\r");
        let indexOfLF = str.indexOf("\n");
        if (midCRLF) {
          if (indexOfLF === 0) {
            pushLine("");
            from = 1;
            indexOfLF = str.indexOf("\n", from);
          } else {
            pushLine("");
          }
          midCRLF = false;
        }
        while (indexOfCR !== -1 || indexOfLF !== -1) {
          if (indexOfCR === -1 || indexOfLF !== -1 && indexOfLF < indexOfCR) {
            pushLine(str.substring(from, indexOfLF));
            from = indexOfLF + 1;
            indexOfLF = str.indexOf("\n", from);
          } else {
            if (str.length === indexOfCR + 1) {
              midCRLF = true;
              indexOfCR = -1;
            } else {
              pushLine(str.substring(from, indexOfCR));
              from = indexOfCR + (indexOfLF === indexOfCR + 1 ? 2 : 1);
              indexOfCR = str.indexOf("\r", from);
              indexOfLF = str.indexOf("\n", from);
            }
          }
        }
        stringBuilder = stringBuilder + str.substring(from, str.length - (midCRLF ? 1 : 0));
      }
    }
    return Arr.isReadonlyArrayNonEmpty(chunkBuilder) ? chunkBuilder : null;
  }
  const pullOrFlush = Effect.suspend(() => {
    if (done._tag === "Some") {
      return Cause.done(done.value);
    }
    return Pull.matchEffect(upstream, {
      onSuccess: loop,
      onFailure: Effect.failCause,
      onDone: leftover => {
        done = Option.some(leftover);
        if (stringBuilder.length > 0 || midCRLF) {
          const last = stringBuilder;
          stringBuilder = "";
          midCRLF = false;
          return Effect.succeed([last]);
        }
        return Cause.done(leftover);
      }
    });
  });
  function loop(chunk) {
    const lines = splitLinesArray(chunk);
    return lines !== null ? Effect.succeed(lines) : pullOrFlush;
  }
  return pullOrFlush;
}));
/**
 * @since 4.0.0
 * @category String manipulation
 */
export const decodeText = (encoding, options) => fromTransform((upstream, _scope) => Effect.sync(() => {
  const decoder = new TextDecoder(encoding, options);
  return Effect.map(upstream, Arr.map(line => decoder.decode(line)));
}));
/**
 * @since 4.0.0
 * @category String manipulation
 */
export const encodeText = () => fromTransform((upstream, _scope) => Effect.sync(() => {
  const encoder = new TextEncoder();
  return Effect.map(upstream, Arr.map(line => encoder.encode(line)));
}));
/**
 * Returns a new channel that pipes the output of this channel into the
 * specified channel. The returned channel has the input type of this channel,
 * and the output type of the specified channel, terminating with the value of
 * the specified channel.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class PipeError extends Data.TaggedError("PipeError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create source and transform channels
 * const sourceChannel = Channel.fromIterable([1, 2, 3])
 * const transformChannel = Channel.map(sourceChannel, (n: number) => n * 2)
 *
 * // Pipe the source into the transform
 * const pipedChannel = Channel.pipeTo(sourceChannel, transformChannel)
 *
 * // Outputs: 2, 4, 6
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const pipeTo = /*#__PURE__*/dual(2, (self, that) => fromTransform((upstream, scope) => Effect.flatMap(toTransform(self)(upstream, scope), upstream => toTransform(that)(upstream, scope))));
/**
 * Returns a new channel that pipes the output of this channel into the
 * specified channel and preserves this channel's failures without providing
 * them to the other channel for observation.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class SourceError extends Data.TaggedError("SourceError")<{
 *   readonly code: number
 * }> {}
 *
 * // Create a failing source channel
 * const failingSource = Channel.fail(new SourceError({ code: 404 }))
 * const safeTransform = Channel.succeed("transformed")
 *
 * // Pipe while preserving source failures
 * const safePipedChannel = Channel.pipeToOrFail(failingSource, safeTransform)
 *
 * // Source errors are preserved and not sent to transform channel
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const pipeToOrFail = /*#__PURE__*/dual(2, (self, that) => fromTransform((upstream, scope) => Effect.flatMap(toTransform(self)(upstream, scope), upstream => {
  const upstreamPull = Effect.catchCause(upstream, cause => Pull.isDoneCause(cause) ? Effect.failCause(cause) : Effect.die(Cause.Done(cause)));
  return Effect.map(toTransform(that)(upstreamPull, scope), pull => Effect.catchDefect(pull, defect => Cause.isDone(defect) ? Effect.failCause(defect.value) : Effect.die(defect)));
})));
/**
 * Constructs a `Channel` from a scoped effect that will result in a
 * `Channel` if successful.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class UnwrapError extends Data.TaggedError("UnwrapError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create an effect that produces a channel
 * const channelEffect = Effect.succeed(
 *   Channel.fromIterable([1, 2, 3])
 * )
 *
 * // Unwrap the effect to get the channel
 * const unwrappedChannel = Channel.unwrap(channelEffect)
 *
 * // The resulting channel outputs: 1, 2, 3
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const unwrap = channel => fromTransform((upstream, scope) => {
  let pull;
  return Effect.succeed(Effect.suspend(() => {
    if (pull) return pull;
    return channel.pipe(Scope.provide(scope), Effect.flatMap(channel => toTransform(channel)(upstream, scope)), Effect.flatMap(pull_ => pull = pull_));
  }));
});
/**
 * @since 2.0.0
 * @category utils
 */
export const scoped = self => fromTransformBracket((upstream, scope, forkedScope) => Scope.provide(toTransform(self)(upstream, scope), forkedScope));
/**
 * Returns a new channel which embeds the given input handler into a Channel.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class EmbedError extends Data.TaggedError("EmbedError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create a base channel
 * const baseChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Embed input handling - simplified example
 * const embeddedChannel = Channel.embedInput(
 *   baseChannel,
 *   (_upstream) => Effect.void
 * )
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const embedInput = /*#__PURE__*/dual(2, (self, input) => fromTransformBracket((upstream, scope, forkedScope) => Effect.andThen(Effect.forkIn(input(upstream), forkedScope), toTransform(self)(Cause.done(), scope))));
/**
 * Allows a faster producer to progress independently of a slower consumer by
 * buffering up to `capacity` elements in a queue.
 *
 * @since 2.0.0
 * @category Buffering
 */
export const buffer = /*#__PURE__*/dual(2, (self, options) => fromTransform(Effect.fnUntraced(function* (upstream, scope) {
  const pull = yield* toTransform(self)(upstream, scope);
  const queue = yield* Queue.make({
    capacity: options.capacity === "unbounded" ? undefined : options.capacity,
    strategy: options.capacity === "unbounded" ? undefined : options.strategy
  });
  yield* Scope.addFinalizer(scope, Queue.shutdown(queue));
  yield* pull.pipe(Effect.flatMap(value => Queue.offer(queue, value)), Effect.forever({
    disableYield: true
  }), Effect.onError(cause => Queue.failCause(queue, cause)), Effect.forkIn(scope));
  return Queue.take(queue);
})));
/**
 * Allows a faster producer to progress independently of a slower consumer by
 * buffering up to `capacity` elements in a queue.
 *
 * @since 2.0.0
 * @category Buffering
 */
export const bufferArray = /*#__PURE__*/dual(2, (self, options) => fromTransform(Effect.fnUntraced(function* (upstream, scope) {
  const pull = yield* toTransform(self)(upstream, scope);
  const queue = yield* Queue.make({
    capacity: options.capacity === "unbounded" ? undefined : options.capacity,
    strategy: options.capacity === "unbounded" ? undefined : options.strategy
  });
  yield* Scope.addFinalizer(scope, Queue.shutdown(queue));
  yield* pull.pipe(Effect.flatMap(value => Queue.offerAll(queue, value)), Effect.forever({
    disableYield: true
  }), Effect.onError(cause => Queue.failCause(queue, cause)), Effect.forkIn(scope));
  return Queue.takeAll(queue);
})));
/**
 * Returns a new channel, which is the same as this one, except it will be
 * interrupted when the specified effect completes. If the effect completes
 * successfully before the underlying channel is done, then the returned
 * channel will yield the success value of the effect as its terminal value.
 * On the other hand, if the underlying channel finishes first, then the
 * returned channel will yield the success value of the underlying channel as
 * its terminal value.
 *
 * @since 2.0.0
 * @category utils
 */
export const interruptWhen = /*#__PURE__*/dual(2, (self, effect) => merge(self, fromPull(Effect.succeed(Effect.flatMap(effect, Cause.done))), {
  haltStrategy: "either"
}));
/**
 * @since 4.0.0
 * @category utils
 */
export const haltWhen = /*#__PURE__*/dual(2, (self, effect) => fromTransformBracket(Effect.fnUntraced(function* (upstream, scope, forkedScope) {
  const pull = yield* toTransform(self)(upstream, scope);
  let haltCause = undefined;
  yield* effect.pipe(Effect.catchCause(cause => {
    haltCause = cause;
    return Effect.void;
  }), Effect.forkIn(forkedScope));
  return Effect.suspend(() => haltCause ? Effect.failCause(haltCause) : pull);
})));
/**
 * @since 4.0.0
 * @category utils
 */
export const onError = /*#__PURE__*/dual(2, (self, finalizer) => onExit(self, exit => Exit.isFailure(exit) ? finalizer(exit.cause) : Effect.void));
/**
 * Returns a new channel with an attached finalizer. The finalizer is
 * guaranteed to be executed so long as the channel begins execution (and
 * regardless of whether or not it completes).
 *
 * @example
 * ```ts
 * import { Channel, Console, Data, Exit } from "effect"
 *
 * class ExitError extends Data.TaggedError("ExitError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create a channel
 * const dataChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Attach exit handler
 * const channelWithExit = Channel.onExit(dataChannel, (exit) => {
 *   if (Exit.isSuccess(exit)) {
 *     return Console.log(`Channel completed successfully with: ${exit.value}`)
 *   } else {
 *     return Console.log(`Channel failed with: ${exit.cause}`)
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category utils
 */
export const onExit = /*#__PURE__*/dual(2, (self, finalizer) => fromTransformBracket((upstream, scope, forkedScope) => Scope.addFinalizerExit(forkedScope, finalizer).pipe(Effect.andThen(toTransform(self)(upstream, scope)))));
/**
 * @since 4.0.0
 * @category utils
 */
export const onStart = /*#__PURE__*/dual(2, (self, onStart) => unwrap(Effect.as(onStart, self)));
/**
 * @since 4.0.0
 * @category utils
 */
export const onFirst = /*#__PURE__*/dual(2, (self, onFirst) => transformPull(self, pull => Effect.sync(() => {
  let isFirst = true;
  const pullFirst = Effect.tap(pull, element => {
    isFirst = false;
    return onFirst(element);
  });
  return Effect.suspend(() => isFirst ? pullFirst : pull);
})));
/**
 * @since 4.0.0
 * @category utils
 */
export const onEnd = /*#__PURE__*/dual(2, (self, onEnd) => transformPull(self, pull => Effect.succeed(Pull.catchDone(pull, leftover => Effect.flatMap(onEnd, () => Cause.done(leftover))))));
/**
 * Returns a new channel with an attached finalizer. The finalizer is
 * guaranteed to be executed so long as the channel begins execution (and
 * regardless of whether or not it completes).
 *
 * @example
 * ```ts
 * import { Channel, Console, Data } from "effect"
 *
 * class EnsureError extends Data.TaggedError("EnsureError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a channel
 * const dataChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Ensure cleanup always runs
 * const channelWithCleanup = Channel.ensuring(
 *   dataChannel,
 *   Console.log("Cleanup executed regardless of success or failure")
 * )
 * ```
 *
 * @since 2.0.0
 * @category utils
 */
export const ensuring = /*#__PURE__*/dual(2, (self, finalizer) => onExit(self, _ => finalizer));
const runWith = (self, f, onHalt) => Effect.suspend(() => {
  const scope = Scope.makeUnsafe();
  const makePull = toTransform(self)(Cause.done(), scope);
  return Pull.catchDone(Effect.flatMap(makePull, f), onHalt ? onHalt : Effect.succeed).pipe(Effect.onExit(exit => Scope.close(scope, exit)));
});
/**
 * Create a channel from the specified services.
 *
 * @since 2.0.0
 * @category Services
 */
export const contextWith = f => fromTransform((upstream, scope) => Effect.contextWith(context => toTransform(f(context))(upstream, scope)));
/**
 * Provides a layer or context to the channel, removing the corresponding
 * service requirements. Use `options.local` to build the layer every time; by
 * default, layers are shared between provide calls.
 *
 * @since 4.0.0
 * @category Services
 */
export const provideContext = /*#__PURE__*/dual(2, (self, context) => fromTransform((upstream, scope) => Effect.map(Effect.provideContext(toTransform(self)(upstream, scope), context), Effect.provideContext(context))));
/**
 * @since 4.0.0
 * @category Services
 */
export const provideService = /*#__PURE__*/dual(3, (self, key, service) => fromTransform((upstream, scope) => Effect.map(Effect.provideService(toTransform(self)(upstream, scope), key, service), Effect.provideService(key, service))));
/**
 * @since 4.0.0
 * @category Services
 */
export const provideServiceEffect = /*#__PURE__*/dual(3, (self, key, service) => fromTransform((upstream, scope) => Effect.flatMap(service, s => toTransform(provideService(self, key, s))(upstream, scope))));
/**
 * @since 4.0.0
 * @category Services
 */
export const provide = /*#__PURE__*/dual(args => isChannel(args[0]), (self, layer, options) => Context.isContext(layer) ? provideContext(self, layer) : fromTransform((upstream, scope) => Effect.flatMap(options?.local ? Layer.buildWithMemoMap(layer, Layer.makeMemoMapUnsafe(), scope) : Layer.buildWithScope(layer, scope), context => Effect.map(Effect.provideContext(toTransform(self)(upstream, scope), context), Effect.provideContext(context)))));
/**
 * @since 2.0.0
 * @category Services
 */
export const updateContext = /*#__PURE__*/dual(2, (self, f) => fromTransform((upstream, scope) => Effect.contextWith(context => {
  const toProvide = f(context);
  return toTransform(provideContext(self, toProvide))(upstream, scope);
})));
/**
 * @since 2.0.0
 * @category Services
 */
export const updateService = /*#__PURE__*/dual(3, (self, service, f) => updateContext(self, context => Context.add(context, service, f(Context.get(context, service)))));
/**
 * @since 4.0.0
 * @category Tracing
 */
export const withSpan = function () {
  const dataFirst = isChannel(arguments[0]);
  const name = dataFirst ? arguments[1] : arguments[0];
  const options = addSpanStackTrace(dataFirst ? arguments[2] : arguments[1]);
  if (dataFirst) {
    const self = arguments[0];
    return withSpanImpl(self, name, options);
  }
  return self => withSpanImpl(self, name, options);
};
const withSpanImpl = (self, name, options) => acquireUseRelease(Effect.makeSpan(name, options), span => provideService(self, ParentSpan, span), (span, exit) => Effect.withFiber(fiber => {
  const clock = fiber.getRef(ClockRef);
  const timingEnabled = fiber.getRef(TracerTimingEnabled);
  return endSpan(span, exit, clock, timingEnabled);
}));
/**
 * @since 4.0.0
 * @category Do notation
 */
export const Do = /*#__PURE__*/succeed({});
const let_ = /*#__PURE__*/dual(3, (self, name, f) => map(self, elem => ({
  ...elem,
  [name]: f(elem)
})));
export {
/**
 * @since 4.0.0
 * @category Do notation
 */
let_ as let };
/**
 * @since 4.0.0
 * @category Do notation
 */
export const bind = /*#__PURE__*/dual(args => isChannel(args[0]), (self, name, f, options) => flatMap(self, elem => map(f(elem), b => ({
  ...elem,
  [name]: b
})), options));
/**
 * @since 4.0.0
 * @category Do notation
 */
export const bindTo = /*#__PURE__*/dual(2, (self, name) => map(self, elem => ({
  [name]: elem
})));
/**
 * Runs a channel and counts the number of elements it outputs.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class CountError extends Data.TaggedError("CountError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel with multiple elements
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Count the elements
 * const countEffect = Channel.runCount(numbersChannel)
 *
 * // Effect.runSync(countEffect) // Returns: 5
 * ```
 *
 * @since 2.0.0
 * @category execution
 */
export const runCount = self => runFold(self, () => 0, acc => acc + 1);
/**
 * Runs a channel and discards all output elements, returning only the final result.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class DrainError extends Data.TaggedError("DrainError")<{
 *   readonly stage: string
 * }> {}
 *
 * // Create a channel that outputs elements and completes with a result
 * const resultChannel = Channel.fromIterable([1, 2, 3])
 * const completedChannel = Channel.concatWith(
 *   resultChannel,
 *   () => Channel.succeed("completed")
 * )
 *
 * // Drain all elements and get only the final result
 * const drainEffect = Channel.runDrain(completedChannel)
 *
 * // Effect.runSync(drainEffect) // Returns: "completed"
 * ```
 *
 * @since 2.0.0
 * @category execution
 */
export const runDrain = self => runWith(self, pull => Effect.forever(pull, {
  disableYield: true
}));
/**
 * Runs a channel and applies an effect to each output element.
 *
 * @example
 * ```ts
 * import { Channel, Console, Data } from "effect"
 *
 * class ForEachError extends Data.TaggedError("ForEachError")<{
 *   readonly element: unknown
 * }> {}
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Run forEach to log each element
 * const forEachEffect = Channel.runForEach(
 *   numbersChannel,
 *   (n) => Console.log(`Processing: ${n}`)
 * )
 *
 * // Logs: "Processing: 1", "Processing: 2", "Processing: 3"
 * ```
 *
 * @since 2.0.0
 * @category execution
 */
export const runForEach = /*#__PURE__*/dual(2, (self, f) => runWith(self, pull => Effect.forever(Effect.flatMap(pull, f), {
  disableYield: true
})));
/**
 * @since 2.0.0
 * @category execution
 */
export const runForEachWhile = /*#__PURE__*/dual(2, (self, f) => runWith(self, pull => pull.pipe(Effect.flatMap(f), Effect.flatMap(cont => cont ? Effect.void : Cause.done()), Effect.forever({
  disableYield: true
}))));
/**
 * Runs a channel and collects all output elements into an array.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class CollectError extends Data.TaggedError("CollectError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel with elements
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Collect all elements into an array
 * const collectEffect = Channel.runCollect(numbersChannel)
 *
 * // Effect.runSync(collectEffect) // Returns: [1, 2, 3, 4, 5]
 * ```
 *
 * @since 2.0.0
 * @category execution
 */
export const runCollect = self => runFold(self, () => [], (acc, o) => {
  acc.push(o);
  return acc;
});
/**
 * Runs a channel and outputs the done value.
 *
 * @since 4.0.0
 * @category execution
 */
export const runDone = self => runWith(self, identity_, Effect.succeed);
/**
 * @since 2.0.0
 * @category execution
 */
export const runHead = self => Effect.suspend(() => {
  let head = Option.none();
  return runWith(self, pull => pull.pipe(Effect.asSome, Effect.flatMap(head_ => {
    head = head_;
    return Cause.done();
  })), () => Effect.succeed(head));
});
/**
 * @since 2.0.0
 * @category execution
 */
export const runLast = self => Effect.suspend(() => {
  const absent = Symbol(); // Prevent boxing
  let last = absent;
  return runWith(self, pull => Effect.forever(Effect.flatMap(pull, item => {
    last = item;
    return Effect.void;
  }), {
    disableYield: true
  }), () => last === absent ? Effect.succeedNone : Effect.succeedSome(last));
});
/**
 * Runs a channel and folds over all output elements with an accumulator.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class FoldError extends Data.TaggedError("FoldError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a channel with numbers
 * const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Fold to calculate sum
 * const sumEffect = Channel.runFold(numbersChannel, () => 0, (acc, n) => acc + n)
 *
 * // Effect.runSync(sumEffect) // Returns: 15
 * ```
 *
 * @since 2.0.0
 * @category execution
 */
export const runFold = /*#__PURE__*/dual(3, (self, initial, f) => Effect.suspend(() => {
  let state = initial();
  return runWith(self, pull => Effect.whileLoop({
    while: constTrue,
    body: () => pull,
    step: value => {
      state = f(state, value);
    }
  }), () => Effect.succeed(state));
}));
/**
 * @since 2.0.0
 * @category execution
 */
export const runFoldEffect = /*#__PURE__*/dual(3, (self, initial, f) => Effect.suspend(() => {
  let state = initial();
  return runWith(self, pull => Effect.whileLoop({
    while: constTrue,
    body: constant(pull.pipe(Effect.flatMap(o => f(state, o)), Effect.map(s => {
      state = s;
    }))),
    step: constVoid
  }), () => Effect.succeed(state));
}));
/**
 * Converts a channel to a Pull data structure for low-level consumption.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect } from "effect"
 *
 * class PullError extends Data.TaggedError("PullError")<{
 *   readonly step: string
 * }> {}
 *
 * // Create a channel
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Convert to Pull within a scope
 * const pullEffect = Effect.scoped(
 *   Channel.toPull(numbersChannel)
 * )
 *
 * // Use the Pull to manually consume elements
 * ```
 *
 * @since 2.0.0
 * @category Destructors
 */
export const toPull = /*#__PURE__*/Effect.fnUntraced(function* (self) {
  const semaphore = Semaphore.makeUnsafe(1);
  const context = yield* Effect.context();
  const scope = Context.get(context, Scope.Scope);
  const pull = yield* toTransform(self)(Cause.done(), scope);
  return pull.pipe(Effect.provideContext(context), semaphore.withPermits(1));
},
/*#__PURE__*/
// ensure errors are redirected to the pull effect
Effect.catchCause(cause => Effect.succeed(Effect.failCause(cause))));
/**
 * Converts a channel to a Pull within an existing scope.
 *
 * @example
 * ```ts
 * import { Channel, Data, Effect, Scope } from "effect"
 *
 * class ScopedPullError extends Data.TaggedError("ScopedPullError")<{
 *   readonly reason: string
 * }> {}
 *
 * // Create a channel
 * const numbersChannel = Channel.fromIterable([1, 2, 3])
 *
 * // Convert to Pull with explicit scope
 * const scopedPullEffect = Effect.gen(function*() {
 *   const scope = yield* Scope.make()
 *   const pull = yield* Channel.toPullScoped(numbersChannel, scope)
 *   return pull
 * })
 * ```
 *
 * @since 4.0.0
 * @category Destructors
 */
export const toPullScoped = (self, scope) => toTransform(self)(Cause.done(), scope);
/**
 * @since 4.0.0
 * @category Destructors
 */
export const runIntoQueue = /*#__PURE__*/dual(args => isChannel(args[0]), (self, queue) => Effect.uninterruptibleMask(restore => runForEach(self, value => Queue.offer(queue, value)).pipe(restore, Effect.exit, Effect.flatMap(exit => {
  if (Exit.isSuccess(exit)) {
    Queue.endUnsafe(queue);
  } else {
    Queue.failCauseUnsafe(queue, exit.cause);
  }
  return Effect.void;
}))));
/**
 * @since 4.0.0
 * @category Destructors
 */
export const runIntoQueueArray = /*#__PURE__*/dual(args => isChannel(args[0]), (self, queue) => Effect.uninterruptibleMask(restore => runForEach(self, value => Queue.offerAll(queue, value)).pipe(restore, Effect.exit, Effect.flatMap(exit => {
  if (Exit.isSuccess(exit)) {
    Queue.endUnsafe(queue);
  } else {
    Queue.failCauseUnsafe(queue, exit.cause);
  }
  return Effect.void;
}))));
/**
 * Converts a channel to a queue for concurrent consumption.
 *
 * @example
 * ```ts
 * import { Channel, Data } from "effect"
 *
 * class QueueError extends Data.TaggedError("QueueError")<{
 *   readonly operation: string
 * }> {}
 *
 * // Create a channel with data
 * const dataChannel = Channel.fromIterable([1, 2, 3, 4, 5])
 *
 * // Convert to queue for concurrent processing
 * const queueEffect = Channel.toQueue(dataChannel, { capacity: 32 })
 *
 * // The queue can be used for concurrent consumption
 * // Multiple consumers can read from the queue
 * ```
 *
 * @since 4.0.0
 * @category Destructors
 */
export const toQueue = /*#__PURE__*/dual(args => isChannel(args[0]), /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const scope = yield* Effect.scope;
  const queue = yield* Queue.make({
    capacity: typeof options.capacity === "number" ? options.capacity : undefined,
    strategy: typeof options.capacity === "number" ? options.strategy : undefined
  });
  yield* Scope.addFinalizer(scope, Queue.shutdown(queue));
  yield* Effect.forkIn(runIntoQueue(self, queue), scope);
  return queue;
}));
/**
 * @since 4.0.0
 * @category Destructors
 */
export const toQueueArray = /*#__PURE__*/dual(args => isChannel(args[0]), /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const scope = yield* Effect.scope;
  const queue = yield* Queue.make({
    capacity: typeof options.capacity === "number" ? options.capacity : undefined,
    strategy: typeof options.capacity === "number" ? options.strategy : undefined
  });
  yield* Scope.addFinalizer(scope, Queue.shutdown(queue));
  yield* Effect.forkIn(runIntoQueueArray(self, queue), scope);
  return queue;
}));
/**
 * Converts a channel to a PubSub for concurrent consumption.
 *
 * `shutdownOnEnd` indicates whether the PubSub should be shut down when the
 * channel ends. By default this is `true`.
 *
 * @since 4.0.0
 * @category Destructors
 */
export const toPubSub = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const pubsub = yield* makePubSub(options);
  yield* Effect.forkScoped(runIntoPubSub(self, pubsub, {
    shutdownOnEnd: options.shutdownOnEnd !== false
  }));
  return pubsub;
}));
/**
 * @since 4.0.0
 * @category Destructors
 */
export const runIntoPubSub = /*#__PURE__*/dual(args => isChannel(args[0]), (self, pubsub, options) => runForEach(self, value => PubSub.publish(pubsub, value)).pipe(options?.shutdownOnEnd === true ? Effect.ensuring(PubSub.shutdown(pubsub)) : identity_));
const makePubSub = options => Effect.acquireRelease(options.capacity === "unbounded" ? PubSub.unbounded(options) : options.strategy === "dropping" ? PubSub.dropping(options) : options.strategy === "sliding" ? PubSub.sliding(options) : PubSub.bounded(options), PubSub.shutdown);
/**
 * Converts a channel to a PubSub for concurrent consumption.
 *
 * `shutdownOnEnd` indicates whether the PubSub should be shut down when the
 * channel ends. By default this is `true`.
 *
 * @since 4.0.0
 * @category Destructors
 */
export const toPubSubArray = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const pubsub = yield* makePubSub(options);
  yield* Effect.forkScoped(runIntoPubSubArray(self, pubsub, {
    shutdownOnEnd: options.shutdownOnEnd !== false
  }));
  return pubsub;
}));
/**
 * @since 4.0.0
 * @category Destructors
 */
export const runIntoPubSubArray = /*#__PURE__*/dual(args => isChannel(args[0]), (self, pubsub, options) => runForEach(self, value => PubSub.publishAll(pubsub, value)).pipe(options?.shutdownOnEnd === true ? Effect.ensuring(PubSub.shutdown(pubsub)) : identity_));
/**
 * Converts a channel to a PubSub for concurrent consumption.
 *
 * @since 4.0.0
 * @category Destructors
 */
export const toPubSubTake = /*#__PURE__*/dual(2, /*#__PURE__*/Effect.fnUntraced(function* (self, options) {
  const pubsub = yield* makePubSub(options);
  yield* runForEach(self, value => PubSub.publish(pubsub, value)).pipe(Effect.onExit(exit => PubSub.publish(pubsub, exit)), Effect.forkScoped);
  return pubsub;
}));
//# sourceMappingURL=Channel.js.map