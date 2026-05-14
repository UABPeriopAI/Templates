/**
 * @since 4.0.0
 */
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import * as Layer from "./Layer.js";
import * as Sink from "./Sink.js";
import * as Stream from "./Stream.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/Stdio";
/**
 * @since 4.0.0
 * @category Services
 */
export const Stdio = /*#__PURE__*/Context.Service(TypeId);
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => ({
  [TypeId]: TypeId,
  ...options
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerTest = impl => Layer.succeed(Stdio, make({
  args: Effect.succeed([]),
  stdout: () => Sink.drain,
  stderr: () => Sink.drain,
  stdin: Stream.empty,
  ...impl
}));
//# sourceMappingURL=Stdio.js.map