/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import * as Queue from "../../Queue.js";
import * as Stream from "../../Stream.js";
/**
 * @since 4.0.0
 */
export const asyncPauseResume = (register, bufferSize = 128) => Stream.callback(queue => Effect.suspend(() => {
  let cbs;
  let paused = false;
  const offer = arr => {
    if (arr.length === 0) return;
    const isFull = Queue.isFullUnsafe(queue);
    if (!isFull || isFull && paused) {
      return Effect.runFork(Queue.offerAll(queue, arr));
    }
    paused = true;
    cbs.onPause();
    return Queue.offerAll(queue, arr).pipe(Effect.tap(() => Effect.sync(() => {
      cbs.onResume();
      paused = false;
    })), Effect.runFork);
  };
  return Effect.map(register({
    single: item => offer([item]),
    array: chunk => offer(chunk),
    fail: error => Queue.failCauseUnsafe(queue, Cause.fail(error)),
    end: () => Queue.endUnsafe(queue)
  }), _ => {
    cbs = _;
  });
}), {
  bufferSize
});
//# sourceMappingURL=SqlStream.js.map