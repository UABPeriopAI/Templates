/**
 * @since 3.8.0
 */
import * as Arr from "./Array.js";
import { constant, constTrue, dual, identity } from "./Function.js";
import * as core from "./internal/core.js";
import { PipeInspectableProto } from "./internal/core.js";
import * as internalEffect from "./internal/effect.js";
import * as MutableList from "./MutableList.js";
import * as Option from "./Option.js";
import { hasProperty } from "./Predicate.js";
import * as Pull from "./Pull.js";
const TypeId = "~effect/Queue";
const EnqueueTypeId = "~effect/Queue/Enqueue";
const DequeueTypeId = "~effect/Queue/Dequeue";
/**
 * Type guard to check if a value is a Queue.
 *
 * @since 3.8.0
 * @category Guards
 */
export const isQueue = u => hasProperty(u, TypeId);
/**
 * Type guard to check if a value is an Enqueue.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isEnqueue = u => hasProperty(u, EnqueueTypeId);
/**
 * Type guard to check if a value is a Dequeue.
 *
 * @since 4.0.0
 * @category Guards
 */
export const isDequeue = u => hasProperty(u, DequeueTypeId);
/**
 * Converts a Queue to an Enqueue (write-only interface).
 *
 * @since 4.0.0
 * @category Conversions
 */
export const asEnqueue = self => self;
/**
 * Convert a Queue to a Dequeue, allowing only read operations.
 *
 * @since 4.0.0
 * @category Conversions
 */
export const asDequeue = identity;
const variance = {
  _A: identity,
  _E: identity
};
const QueueProto = {
  [TypeId]: variance,
  [EnqueueTypeId]: variance,
  [DequeueTypeId]: variance,
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "effect/Queue",
      state: this.state._tag,
      size: sizeUnsafe(this)
    };
  }
};
/**
 * A `Queue` is an asynchronous queue that can be offered to and taken from.
 *
 * It also supports signaling that it is done or failed.
 *
 * **Previously Known As**
 *
 * This API replaces the following from Effect 3.x:
 *
 * - `Mailbox.make`
 *
 * @since 3.8.0
 * @category Constructors
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 * import * as assert from "node:assert"
 *
 * Effect.gen(function*() {
 *   const queue = yield* Queue.make<number, string | Cause.Done>()
 *
 *   // add messages to the queue
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *   yield* Queue.offerAll(queue, [3, 4, 5])
 *
 *   // take messages from the queue
 *   const messages = yield* Queue.takeAll(queue)
 *   assert.deepStrictEqual(messages, [1, 2, 3, 4, 5])
 *
 *   // signal that the queue is done
 *   yield* Queue.end(queue)
 *   const done = yield* Effect.flip(Queue.takeAll(queue))
 *   assert.deepStrictEqual(done, Cause.Done)
 *
 *   // signal that the queue has failed
 *   yield* Queue.fail(queue, "boom")
 * })
 * ```
 */
export const make = options => core.withFiber(fiber => {
  const self = Object.create(QueueProto);
  self.dispatcher = fiber.currentDispatcher;
  self.capacity = options?.capacity ?? Number.POSITIVE_INFINITY;
  self.strategy = options?.strategy ?? "suspend";
  self.messages = MutableList.make();
  self.scheduleRunning = false;
  self.state = {
    _tag: "Open",
    takers: new Set(),
    offers: new Set(),
    awaiters: new Set()
  };
  return internalEffect.succeed(self);
});
/**
 * Creates a bounded queue with the specified capacity that uses backpressure strategy.
 *
 * When the queue reaches capacity, producers will be suspended until space becomes available.
 * This ensures all messages are processed but may slow down producers.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<string>(5)
 *
 *   // This will succeed as queue has capacity
 *   yield* Queue.offer(queue, "first")
 *   yield* Queue.offer(queue, "second")
 *
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 2
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const bounded = capacity => make({
  capacity
});
/**
 * Creates a bounded queue with sliding strategy. When the queue reaches capacity,
 * new elements are added and the oldest elements are dropped.
 *
 * This strategy prevents producers from being blocked but may result in message loss.
 * Useful when you want to maintain a rolling window of the most recent messages.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.sliding<number>(3)
 *
 *   // Fill the queue to capacity
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *   yield* Queue.offer(queue, 3)
 *
 *   // This will succeed, dropping the oldest element (1)
 *   yield* Queue.offer(queue, 4)
 *
 *   const all = yield* Queue.takeAll(queue)
 *   console.log(all) // [2, 3, 4] - oldest element (1) was dropped
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const sliding = capacity => make({
  capacity,
  strategy: "sliding"
});
/**
 * Creates a bounded queue with dropping strategy. When the queue reaches capacity,
 * new elements are dropped and the offer operation returns false.
 *
 * This strategy prevents producers from being blocked and preserves existing messages,
 * but new messages may be lost when the queue is full.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.dropping<number>(2)
 *
 *   // Fill the queue to capacity
 *   const success1 = yield* Queue.offer(queue, 1)
 *   const success2 = yield* Queue.offer(queue, 2)
 *   console.log(success1, success2) // true, true
 *
 *   // This will be dropped
 *   const success3 = yield* Queue.offer(queue, 3)
 *   console.log(success3) // false
 *
 *   const all = yield* Queue.takeAll(queue)
 *   console.log(all) // [1, 2] - element 3 was dropped
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const dropping = capacity => make({
  capacity,
  strategy: "dropping"
});
/**
 * Creates an unbounded queue that can grow to any size without blocking producers.
 *
 * Unlike bounded queues, unbounded queues never apply backpressure - producers
 * can always add messages successfully. This is useful when you want to prioritize
 * producer throughput over memory usage control.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.unbounded<string>()
 *
 *   // Producers can always add messages without blocking
 *   yield* Queue.offer(queue, "message1")
 *   yield* Queue.offer(queue, "message2")
 *   yield* Queue.offerAll(queue, ["message3", "message4", "message5"])
 *
 *   // Check current size
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // Some(5)
 *
 *   // Take all messages
 *   const messages = yield* Queue.takeAll(queue)
 *   console.log(messages) // ["message1", "message2", "message3", "message4", "message5"]
 * })
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const unbounded = () => make();
/**
 * Add a message to the queue. Returns `false` if the queue is done.
 *
 * For bounded queues, this operation may suspend if the queue is at capacity,
 * depending on the backpressure strategy. For dropping/sliding queues, it may
 * return false or succeed immediately by dropping/sliding existing messages.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Successfully add messages to queue
 *   const success1 = yield* Queue.offer(queue, 1)
 *   const success2 = yield* Queue.offer(queue, 2)
 *   console.log(success1, success2) // true, true
 *
 *   // Queue state
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 2
 * })
 * ```
 *
 * @category Offering
 * @since 4.0.0
 */
export const offer = (self, message) => internalEffect.suspend(() => {
  if (self.state._tag !== "Open") {
    return exitFalse;
  } else if (self.messages.length >= self.capacity) {
    switch (self.strategy) {
      case "dropping":
        return exitFalse;
      case "suspend":
        if (self.capacity <= 0 && self.state.takers.size > 0) {
          MutableList.append(self.messages, message);
          releaseTakers(self);
          return exitTrue;
        }
        return offerRemainingSingle(self, message);
      case "sliding":
        MutableList.take(self.messages);
        MutableList.append(self.messages, message);
        return exitTrue;
    }
  }
  MutableList.append(self.messages, message);
  scheduleReleaseTaker(self);
  return exitTrue;
});
/**
 * Add a message to the queue synchronously. Returns `false` if the queue is done.
 *
 * This is an unsafe operation that directly modifies the queue without Effect wrapping.
 * Use this only when you're certain about the synchronous nature of the operation.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a queue effect and extract the queue for unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Add messages synchronously using unsafe API
 *   const success1 = Queue.offerUnsafe(queue, 1)
 *   const success2 = Queue.offerUnsafe(queue, 2)
 *   console.log(success1, success2) // true, true
 *
 *   // Check current size
 *   const size = Queue.sizeUnsafe(queue)
 *   console.log(size) // 2
 * })
 * ```
 *
 * @category Offering
 * @since 4.0.0
 */
export const offerUnsafe = (self, message) => {
  if (self.state._tag !== "Open") {
    return false;
  } else if (self.messages.length >= self.capacity) {
    if (self.strategy === "sliding") {
      MutableList.take(self.messages);
      MutableList.append(self.messages, message);
      return true;
    } else if (self.capacity <= 0 && self.state.takers.size > 0) {
      MutableList.append(self.messages, message);
      releaseTakers(self);
      return true;
    }
    return false;
  }
  MutableList.append(self.messages, message);
  scheduleReleaseTaker(self);
  return true;
};
/**
 * Add multiple messages to the queue. Returns the remaining messages that
 * were not added.
 *
 * For bounded queues, this operation may suspend if the queue doesn't have
 * enough capacity. The operation returns an array of messages that couldn't
 * be added (empty array means all messages were successfully added).
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Try to add more messages than capacity
 *   const remaining1 = yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *   console.log(remaining1) // [4, 5] - couldn't fit the last 2
 * })
 * ```
 *
 * @category Offering
 * @since 4.0.0
 */
export const offerAll = (self, messages) => internalEffect.suspend(() => {
  if (self.state._tag !== "Open") {
    return internalEffect.succeed(Arr.fromIterable(messages));
  }
  const remaining = offerAllUnsafe(self, messages);
  if (remaining.length === 0) {
    return core.exitSucceed([]);
  } else if (self.strategy === "dropping") {
    return internalEffect.succeed(remaining);
  }
  return offerRemainingArray(self, remaining);
});
/**
 * Add multiple messages to the queue synchronously. Returns the remaining messages that
 * were not added.
 *
 * This is an unsafe operation that directly modifies the queue without Effect wrapping.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a bounded queue and use unsafe API
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(3)
 *
 *   // Try to add 5 messages to capacity-3 queue using unsafe API
 *   const remaining = Queue.offerAllUnsafe(queue, [1, 2, 3, 4, 5])
 *   console.log(remaining) // [4, 5] - couldn't fit the last 2
 *
 *   // Check what's in the queue
 *   const size = Queue.sizeUnsafe(queue)
 *   console.log(size) // 3
 * })
 * ```
 *
 * @category Offering
 * @since 4.0.0
 */
export const offerAllUnsafe = (self, messages) => {
  if (self.state._tag !== "Open") {
    return Arr.fromIterable(messages);
  } else if (self.capacity === Number.POSITIVE_INFINITY || self.strategy === "sliding") {
    MutableList.appendAll(self.messages, messages);
    if (self.strategy === "sliding") {
      MutableList.takeN(self.messages, self.messages.length - self.capacity);
    }
    scheduleReleaseTaker(self);
    return [];
  }
  const free = self.capacity <= 0 ? self.state.takers.size : self.capacity - self.messages.length;
  if (free === 0) {
    return Arr.fromIterable(messages);
  }
  const remaining = [];
  let i = 0;
  for (const message of messages) {
    if (i < free) {
      MutableList.append(self.messages, message);
    } else {
      remaining.push(message);
    }
    i++;
  }
  scheduleReleaseTaker(self);
  return remaining;
};
/**
 * Fail the queue with an error. If the queue is already done, `false` is
 * returned.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, string>(10)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Fail the queue with an error
 *   const failed = yield* Queue.fail(queue, "Something went wrong")
 *   console.log(failed) // true
 *
 *   // Subsequent operations will reflect the failure
 *   // Taking from failed queue will fail with the error
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const fail = (self, error) => failCause(self, core.causeFail(error));
/**
 * Fail the queue with a cause. If the queue is already done, `false` is
 * returned.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, string>(10)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *
 *   // Create a cause and fail the queue
 *   const cause = Cause.fail("Queue processing failed")
 *   const failed = yield* Queue.failCause(queue, cause)
 *   console.log(failed) // true
 *
 *   // The queue is now in failed state with the specified cause
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const failCause = /*#__PURE__*/dual(2, (self, cause) => internalEffect.sync(() => failCauseUnsafe(self, cause)));
/**
 * Fail the queue with a cause synchronously. If the queue is already done, `false` is
 * returned.
 *
 * This is an unsafe operation that directly modifies the queue without Effect wrapping.
 *
 * @example
 * ```ts
 * import { Effect, Cause } from "effect"
 * import { Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, string>(10)
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *
 *   // Create a cause and fail the queue synchronously
 *   const cause = Cause.fail("Processing error")
 *   const failed = Queue.failCauseUnsafe(queue, cause)
 *   console.log(failed) // true
 *
 *   // The queue is now in failed state
 *   console.log(queue.state._tag) // "Done"
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const failCauseUnsafe = (self, cause) => {
  if (self.state._tag !== "Open") {
    return false;
  }
  const exit = core.exitFailCause(cause);
  const fail = internalEffect.exitZipRight(exit, exitFailDone);
  if (self.state.offers.size === 0 && self.messages.length === 0) {
    finalize(self, fail);
    return true;
  }
  self.state = {
    ...self.state,
    _tag: "Closing",
    exit: fail
  };
  return true;
};
/**
 * Signal that the queue is complete. If the queue is already done, `false` is
 * returned.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Signal completion - no more messages will be accepted
 *   const ended = yield* Queue.end(queue)
 *   console.log(ended) // true
 *
 *   // Trying to offer more messages will return false
 *   const offerResult = yield* Queue.offer(queue, 3)
 *   console.log(offerResult) // false
 *
 *   // But we can still take existing messages
 *   const message = yield* Queue.take(queue)
 *   console.log(message) // 1
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const end = self => failCause(self, core.causeFail(core.Done()));
/**
 * Signal that the queue is complete synchronously. If the queue is already done, `false` is
 * returned.
 *
 * This is an unsafe operation that directly modifies the queue without Effect wrapping.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * // Create a queue and use unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *
 *   // End the queue synchronously
 *   const ended = Queue.endUnsafe(queue)
 *   console.log(ended) // true
 *
 *   // The queue is now done
 *   console.log(queue.state._tag) // "Done"
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const endUnsafe = self => failCauseUnsafe(self, core.causeFail(core.Done()));
/**
 * Interrupts the queue gracefully, transitioning it to a closing state.
 *
 * This operation stops accepting new offers but allows existing messages to be consumed.
 * Once all messages are drained, the queue transitions to the Done state with an interrupt cause.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Interrupt gracefully - no more offers accepted, but messages can be consumed
 *   const interrupted = yield* Queue.interrupt(queue)
 *   console.log(interrupted) // true
 *
 *   // Trying to offer more messages will return false
 *   const offerResult = yield* Queue.offer(queue, 3)
 *   console.log(offerResult) // false
 *
 *   // But we can still take existing messages
 *   const message1 = yield* Queue.take(queue)
 *   console.log(message1) // 1
 *
 *   const message2 = yield* Queue.take(queue)
 *   console.log(message2) // 2
 *
 *   // After all messages are consumed, queue is done
 *   const isDone = queue.state._tag === "Done"
 *   console.log(isDone) // true
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const interrupt = self => core.withFiber(fiber => failCause(self, internalEffect.causeInterrupt(fiber.id)));
/**
 * Shutdown the queue, canceling any pending operations.
 * If the queue is already done, `false` is returned.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(2)
 *
 *   // Add messages
 *   yield* Queue.offer(queue, 1)
 *   yield* Queue.offer(queue, 2)
 *
 *   // Try to add more than capacity (will be pending)
 *   const pendingOffer = Queue.offer(queue, 3)
 *
 *   // Shutdown cancels pending operations and clears the queue
 *   const wasShutdown = yield* Queue.shutdown(queue)
 *   console.log(wasShutdown) // true
 *
 *   // Queue is now done and cleared
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 0
 * })
 * ```
 *
 * @category Completion
 * @since 4.0.0
 */
export const shutdown = self => internalEffect.sync(() => {
  if (self.state._tag === "Done") {
    return true;
  }
  MutableList.clear(self.messages);
  const offers = self.state.offers;
  finalize(self, self.state._tag === "Open" ? exitInterrupt : self.state.exit);
  if (offers.size > 0) {
    for (const entry of offers) {
      if (entry._tag === "Single") {
        entry.resume(exitFalse);
      } else {
        entry.resume(core.exitSucceed(entry.remaining.slice(entry.offset)));
      }
    }
    offers.clear();
  }
  return true;
});
/**
 * Take all messages from the queue, returning an empty array if the queue
 * is empty or done.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Clear all messages from the queue
 *   const messages = yield* Queue.clear(queue)
 *   console.log(messages) // [1, 2, 3, 4, 5]
 *
 *   // Queue is now empty
 *   const size = yield* Queue.size(queue)
 *   console.log(size) // 0
 *
 *   // Clearing empty queue returns empty array
 *   const empty = yield* Queue.clear(queue)
 *   console.log(empty) // []
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const clear = self => internalEffect.suspend(() => {
  if (self.state._tag === "Done") {
    if (Pull.isDoneCause(self.state.exit.cause)) {
      return internalEffect.succeed([]);
    }
    return self.state.exit;
  }
  const messages = takeAllUnsafe(self);
  releaseCapacity(self);
  return internalEffect.succeed(messages);
});
/**
 * Take all messages from the queue, or wait for messages to be available.
 *
 * If the queue is done, the `done` flag will be `true`. If the queue
 * fails, the Effect will fail with the error.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(5)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Take all available messages
 *   const messages1 = yield* Queue.takeAll(queue)
 *   console.log(messages1) // [1, 2, 3, 4, 5]
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const takeAll = self => takeBetween(self, 1, Number.POSITIVE_INFINITY);
/**
 * Take all messages from the queue, until the queue has errored or is done.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(5)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *   // Some time later, end the queue
 *   yield* Effect.forkChild(Queue.end(queue))
 *
 *   // Collect all available messages
 *   const messages = yield* Queue.collect(queue)
 *   console.log(messages) // [1, 2, 3, 4, 5]
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const collect = self => internalEffect.suspend(() => {
  const out = Arr.empty();
  return internalEffect.as(Pull.catchDone(internalEffect.whileLoop({
    while: constTrue,
    body: constant(takeAll(self)),
    step(items) {
      for (let i = 0; i < items.length; i++) {
        out.push(items[i]);
      }
    }
  }), () => internalEffect.void), out);
});
/**
 * Take a specified number of messages from the queue. It will only take
 * up to the capacity of the queue.
 *
 * If the queue is done, the `done` flag will be `true`. If the queue
 * fails, the Effect will fail with the error.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7])
 *
 *   // Take exactly 3 messages
 *   const first3 = yield* Queue.takeN(queue, 3)
 *   console.log(first3) // [1, 2, 3]
 *
 *   // Take exactly 2 more messages
 *   const next2 = yield* Queue.takeN(queue, 2)
 *   console.log(next2) // [4, 5]
 *
 *   // End the queue before taking; now it can return fewer than requested
 *   yield* Queue.end(queue)
 *
 *   // Take remaining messages (takes 2, even though we asked for 5)
 *   const remaining = yield* Queue.takeN(queue, 5)
 *   console.log(remaining) // [6, 7]
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const takeN = (self, n) => takeBetween(self, n, n);
/**
 * Take a variable number of messages from the queue, between specified min and max.
 * It will only take up to the capacity of the queue.
 *
 * If the queue is done, the `done` flag will be `true`. If the queue
 * fails, the Effect will fail with the error.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add several messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8])
 *
 *   // Take between 2 and 5 messages
 *   const batch1 = yield* Queue.takeBetween(queue, 2, 5)
 *   console.log(batch1) // [1, 2, 3, 4, 5] - took 5 (up to max)
 *
 *   // Take between 1 and 10 messages (but only 3 remain)
 *   const batch2 = yield* Queue.takeBetween(queue, 1, 10)
 *   console.log(batch2) // [6, 7, 8] - took 3 (all remaining)
 *
 *   // No more messages available, will wait or return done
 *   // const batch3 = yield* Queue.takeBetween(queue, 1, 3)
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const takeBetween = (self, min, max) => internalEffect.suspend(() => takeBetweenUnsafe(self, min, max) ?? internalEffect.andThen(awaitTake(self), takeBetween(self, 1, max)));
/**
 * Take a single message from the queue, or wait for a message to be
 * available.
 *
 * If the queue is done, it will fail with `Done`. If the
 * queue fails, the Effect will fail with the error.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<string, Cause.Done>(3)
 *
 *   // Add some messages
 *   yield* Queue.offer(queue, "first")
 *   yield* Queue.offer(queue, "second")
 *
 *   // Take messages one by one
 *   const msg1 = yield* Queue.take(queue)
 *   const msg2 = yield* Queue.take(queue)
 *   console.log(msg1, msg2) // "first", "second"
 *
 *   // End the queue
 *   yield* Queue.end(queue)
 *
 *   // Taking from ended queue fails with None
 *   const result = yield* Effect.match(Queue.take(queue), {
 *     onFailure: (error: Cause.Done) => true,
 *     onSuccess: (value: string) => false
 *   })
 *   console.log("Queue ended:", result) // true
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const take = self => internalEffect.suspend(() => takeUnsafe(self) ?? internalEffect.andThen(awaitTake(self), take(self)));
/**
 * Tries to take an item from the queue without blocking.
 *
 * Returns `Option.some` with the item if available, or `Option.none` if the queue is empty or done.
 *
 * @example
 * ```ts
 * import { Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Poll returns Option.none if empty
 *   const maybe1 = yield* Queue.poll(queue)
 *   console.log(Option.isNone(maybe1)) // true
 *
 *   // Add an item
 *   yield* Queue.offer(queue, 42)
 *
 *   // Poll returns Option.some with the item
 *   const maybe2 = yield* Queue.poll(queue)
 *   console.log(Option.getOrNull(maybe2)) // 42
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const poll = self => internalEffect.suspend(() => {
  const result = takeUnsafe(self);
  if (result === undefined) {
    return internalEffect.succeed(Option.none());
  }
  if (result._tag === "Success") {
    return internalEffect.succeed(Option.some(result.value));
  }
  return internalEffect.succeed(Option.none());
});
/**
 * Views the next item without removing it.
 *
 * Blocks until an item is available. If the queue is done or fails, the error is propagated.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *   yield* Queue.offer(queue, 42)
 *
 *   // Peek at the next item without removing it
 *   const item = yield* Queue.peek(queue)
 *   console.log(item) // 42
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const peek = self => internalEffect.suspend(() => {
  if (self.state._tag === "Done") {
    return self.state.exit;
  }
  if (self.messages.length > 0 && self.messages.head) {
    return internalEffect.succeed(self.messages.head.array[self.messages.head.offset]);
  }
  return internalEffect.andThen(awaitTake(self), peek(self));
});
/**
 * Take a single message from the queue synchronously, or wait for a message to be
 * available.
 *
 * If the queue is done, it will fail with `Done`. If the
 * queue fails, the Effect will fail with the error.
 * Returns `undefined` if no message is immediately available.
 *
 * This is an unsafe operation that directly accesses the queue without Effect wrapping.
 *
 * @example
 * ```ts
 * import { Effect, Queue } from "effect"
 *
 * // Create a queue and use unsafe operations
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number>(10)
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *
 *   // Take a message synchronously
 *   const result1 = Queue.takeUnsafe(queue)
 *   console.log(result1) // Success(1) or Exit containing value 1
 *
 *   const result2 = Queue.takeUnsafe(queue)
 *   console.log(result2) // Success(2)
 *
 *   // No more messages - returns undefined
 *   const result3 = Queue.takeUnsafe(queue)
 *   console.log(result3) // undefined
 * })
 * ```
 *
 * @category Taking
 * @since 4.0.0
 */
export const takeUnsafe = self => {
  if (self.state._tag === "Done") {
    return self.state.exit;
  }
  if (self.messages.length > 0) {
    const message = MutableList.take(self.messages);
    releaseCapacity(self);
    return core.exitSucceed(message);
  } else if (self.capacity <= 0 && self.state.offers.size > 0) {
    self.capacity = 1;
    releaseCapacity(self);
    self.capacity = 0;
    const message = MutableList.take(self.messages);
    releaseCapacity(self);
    return core.exitSucceed(message);
  }
  return undefined;
};
const await_ = self => internalEffect.callback(resume => {
  if (self.state._tag === "Done") {
    if (Pull.isDoneCause(self.state.exit.cause)) {
      return resume(internalEffect.exitVoid);
    }
    return resume(self.state.exit);
  }
  self.state.awaiters.add(resume);
  return internalEffect.sync(() => {
    if (self.state._tag !== "Done") {
      self.state.awaiters.delete(resume);
    }
  });
});
export {
/**
 * Wait for the queue to be done.
 *
 * @category Completion
 * @since 4.0.0
 */
await_ as await };
/**
 * Check the size of the queue.
 *
 * If the queue is complete, it will return `None`.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Check size of empty queue
 *   const size1 = yield* Queue.size(queue)
 *   console.log(size1) // 0
 *
 *   // Add some messages
 *   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
 *
 *   // Check size after adding messages
 *   const size2 = yield* Queue.size(queue)
 *   console.log(size2) // 5
 *
 *   // End the queue
 *   yield* Queue.end(queue)
 *
 *   // Size of ended queue is 0
 *   const size3 = yield* Queue.size(queue)
 *   console.log(size3) // 0
 * })
 * ```
 *
 * @category Size
 * @since 4.0.0
 */
export const size = self => internalEffect.sync(() => sizeUnsafe(self));
/**
 * Check if the queue is full.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(3)
 *
 *   console.log(yield* Queue.isFull(queue)) // false
 *
 *   // Add some messages
 *   yield* Queue.offerAll(queue, [1, 2, 3])
 *
 *   console.log(yield* Queue.isFull(queue)) // true
 * })
 * ```
 *
 * @category Size
 * @since 4.0.0
 */
export const isFull = self => internalEffect.sync(() => isFullUnsafe(self));
/**
 * Check the size of the queue synchronously.
 *
 * If the queue is complete, it will return `None`.
 * This is an unsafe operation that directly accesses the queue without Effect wrapping.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Check size of empty queue
 *   const size1 = Queue.sizeUnsafe(queue)
 *   console.log(size1) // 0
 *
 *   // Add some messages
 *   Queue.offerUnsafe(queue, 1)
 *   Queue.offerUnsafe(queue, 2)
 *   Queue.offerUnsafe(queue, 3)
 *
 *   // Check size after adding messages
 *   const size2 = Queue.sizeUnsafe(queue)
 *   console.log(size2) // 3
 *
 *   // End the queue
 *   Queue.endUnsafe(queue)
 *
 *   // Size of ended queue is 0
 *   const size3 = Queue.sizeUnsafe(queue)
 *   console.log(size3) // 0
 * })
 * ```
 *
 * @category Size
 * @since 4.0.0
 */
export const sizeUnsafe = self => self.state._tag === "Done" ? 0 : self.messages.length;
/**
 * Check if the queue is full synchronously.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Option, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(3)
 *
 *   console.log(Queue.isFullUnsafe(queue)) // false
 *
 *   // Add some messages
 *   yield* Queue.offerAll(queue, [1, 2, 3])
 *
 *   console.log(Queue.isFullUnsafe(queue)) // true
 * })
 * ```
 *
 * @category Size
 * @since 4.0.0
 */
export const isFullUnsafe = self => sizeUnsafe(self) === self.capacity;
/**
 * Run an `Effect` into a `Queue`, where success ends the queue and failure
 * fails the queue.
 *
 * @example
 * ```ts
 * import { Cause, Effect, Queue } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const queue = yield* Queue.bounded<number, Cause.Done>(10)
 *
 *   // Create an effect that succeeds
 *   const dataProcessing = Effect.gen(function*() {
 *     yield* Effect.sleep("100 millis")
 *     return "Processing completed successfully"
 *   })
 *
 *   // Pipe the effect into the queue
 *   // If dataProcessing succeeds, queue ends successfully
 *   // If dataProcessing fails, queue fails with the error
 *   const effectIntoQueue = Queue.into(queue)(dataProcessing)
 *
 *   const wasCompleted = yield* effectIntoQueue
 *   console.log("Queue operation completed:", wasCompleted) // true
 *
 *   // Queue state now reflects the effect's outcome
 *   console.log("Queue state:", queue.state._tag) // "Done"
 * })
 * ```
 *
 * @since 3.8.0
 * @category Completion
 */
export const into = /*#__PURE__*/dual(2, (effect, self) => internalEffect.uninterruptibleMask(restore => internalEffect.matchCauseEffect(restore(effect), {
  onFailure: cause => failCause(self, cause),
  onSuccess: _ => end(self)
})));
// -----------------------------------------------------------------------------
// internals
// -----------------------------------------------------------------------------
//
const exitFalse = /*#__PURE__*/core.exitSucceed(false);
const exitTrue = /*#__PURE__*/core.exitSucceed(true);
const exitFailDone = /*#__PURE__*/core.exitFail(/*#__PURE__*/core.Done());
const exitInterrupt = /*#__PURE__*/internalEffect.exitInterrupt();
const releaseTakers = self => {
  self.scheduleRunning = false;
  if (self.state._tag === "Done" || self.state.takers.size === 0) {
    return;
  }
  for (const taker of self.state.takers) {
    self.state.takers.delete(taker);
    taker(internalEffect.exitVoid);
    if (self.messages.length === 0) {
      break;
    }
  }
};
const scheduleReleaseTaker = self => {
  if (self.scheduleRunning || self.state._tag === "Done" || self.state.takers.size === 0) {
    return;
  }
  self.scheduleRunning = true;
  self.dispatcher.scheduleTask(() => releaseTakers(self), 0);
};
const takeBetweenUnsafe = (self, min, max) => {
  if (self.state._tag === "Done") {
    return self.state.exit;
  } else if (max <= 0 || min <= 0) {
    return core.exitSucceed([]);
  } else if (self.capacity <= 0 && self.state.offers.size > 0) {
    self.capacity = 1;
    releaseCapacity(self);
    self.capacity = 0;
    const messages = [MutableList.take(self.messages)];
    releaseCapacity(self);
    return core.exitSucceed(messages);
  }
  min = Math.min(min, self.capacity || 1);
  if (min <= self.messages.length) {
    const messages = MutableList.takeN(self.messages, max);
    releaseCapacity(self);
    return core.exitSucceed(messages);
  }
};
const offerRemainingSingle = (self, message) => {
  return internalEffect.callback(resume => {
    if (self.state._tag !== "Open") {
      return resume(exitFalse);
    }
    const entry = {
      _tag: "Single",
      message,
      resume
    };
    self.state.offers.add(entry);
    return internalEffect.sync(() => {
      if (self.state._tag === "Open") {
        self.state.offers.delete(entry);
      }
    });
  });
};
const offerRemainingArray = (self, remaining) => {
  return internalEffect.callback(resume => {
    if (self.state._tag !== "Open") {
      return resume(core.exitSucceed(remaining));
    }
    const entry = {
      _tag: "Array",
      remaining,
      offset: 0,
      resume
    };
    self.state.offers.add(entry);
    return internalEffect.sync(() => {
      if (self.state._tag === "Open") {
        self.state.offers.delete(entry);
      }
    });
  });
};
const releaseCapacity = self => {
  if (self.state._tag === "Done") {
    return Pull.isDoneCause(self.state.exit.cause);
  } else if (self.state.offers.size === 0) {
    if (self.state._tag === "Closing" && self.messages.length === 0) {
      finalize(self, self.state.exit);
      return Pull.isDoneCause(self.state.exit.cause);
    }
    return false;
  }
  let n = self.capacity - self.messages.length;
  for (const entry of self.state.offers) {
    if (n === 0) break;else if (entry._tag === "Single") {
      MutableList.append(self.messages, entry.message);
      n--;
      entry.resume(exitTrue);
      self.state.offers.delete(entry);
    } else {
      for (; entry.offset < entry.remaining.length; entry.offset++) {
        if (n === 0) return false;
        MutableList.append(self.messages, entry.remaining[entry.offset]);
        n--;
      }
      entry.resume(core.exitSucceed([]));
      self.state.offers.delete(entry);
    }
  }
  return false;
};
const awaitTake = self => internalEffect.callback(resume => {
  if (self.state._tag === "Done") {
    return resume(self.state.exit);
  }
  self.state.takers.add(resume);
  return internalEffect.sync(() => {
    if (self.state._tag !== "Done") {
      self.state.takers.delete(resume);
    }
  });
});
const takeAllUnsafe = self => {
  if (self.messages.length > 0) {
    const messages = MutableList.takeAll(self.messages);
    releaseCapacity(self);
    return messages;
  } else if (self.state._tag !== "Done" && self.state.offers.size > 0) {
    self.capacity = 1;
    releaseCapacity(self);
    self.capacity = 0;
    const messages = [MutableList.take(self.messages)];
    releaseCapacity(self);
    return messages;
  }
  return [];
};
const finalize = (self, exit) => {
  if (self.state._tag === "Done") {
    return;
  }
  const openState = self.state;
  self.state = {
    _tag: "Done",
    exit
  };
  for (const taker of openState.takers) {
    taker(exit);
  }
  openState.takers.clear();
  for (const awaiter of openState.awaiters) {
    awaiter(exit);
  }
  openState.awaiters.clear();
};
//# sourceMappingURL=Queue.js.map