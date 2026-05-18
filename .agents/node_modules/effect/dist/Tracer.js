/**
 * @since 2.0.0
 */
import * as Context from "./Context.js";
import { constFalse } from "./Function.js";
import * as Option from "./Option.js";
const evaluate = "~effect/Effect/evaluate";
/**
 * @since 2.0.0
 * @category tags
 * @example
 * ```ts
 * import { Tracer } from "effect"
 *
 * // The key used to identify parent spans in the context
 * console.log(Tracer.ParentSpanKey) // "effect/Tracer/ParentSpan"
 * ```
 */
export const ParentSpanKey = "effect/Tracer/ParentSpan";
/**
 * @since 2.0.0
 * @category tags
 * @example
 * ```ts
 * import { Effect, Tracer } from "effect"
 *
 * // Access the parent span from the context
 * const program = Effect.gen(function*() {
 *   const parentSpan = yield* Effect.service(Tracer.ParentSpan)
 *   console.log(`Parent span: ${parentSpan.spanId}`)
 * })
 * ```
 */
export class ParentSpan extends /*#__PURE__*/Context.Service()(ParentSpanKey) {}
/**
 * @since 2.0.0
 * @category constructors
 */
export const make = options => options;
/**
 * @since 2.0.0
 * @category constructors
 * @example
 * ```ts
 * import { Effect, Tracer } from "effect"
 *
 * // Create an external span from another tracing system
 * const span = Tracer.externalSpan({
 *   spanId: "span-abc-123",
 *   traceId: "trace-xyz-789",
 *   sampled: true
 * })
 *
 * // Use the external span as a parent
 * const program = Effect.succeed("Hello").pipe(
 *   Effect.withSpan("child-operation", { parent: span })
 * )
 * ```
 */
export const externalSpan = options => ({
  _tag: "ExternalSpan",
  spanId: options.spanId,
  traceId: options.traceId,
  sampled: options.sampled ?? true,
  annotations: options.annotations ?? Context.empty()
});
/**
 * @since 3.12.0
 * @category references
 * @example
 * ```ts
 * import { Effect, Tracer } from "effect"
 *
 * // Disable span propagation for a specific effect
 * const program = Effect.gen(function*() {
 *   yield* Effect.log("This will not propagate parent span")
 * }).pipe(
 *   Effect.provideService(Tracer.DisablePropagation, true)
 * )
 * ```
 */
export const DisablePropagation = /*#__PURE__*/Context.Reference("effect/Tracer/DisablePropagation", {
  defaultValue: constFalse
});
/**
 * Reference for controlling the current trace level for dynamic filtering.
 *
 * @category references
 * @since 4.0.0
 */
export const CurrentTraceLevel = /*#__PURE__*/Context.Reference("effect/Tracer/CurrentTraceLevel", {
  defaultValue: () => "Info"
});
/**
 * Reference for setting the minimum trace level threshold. Spans and their
 * descendants below this level will have their sampling decision forced to
 * false, preventing them from being exported.
 *
 * @category references
 * @since 4.0.0
 */
export const MinimumTraceLevel = /*#__PURE__*/Context.Reference("effect/Tracer/MinimumTraceLevel", {
  defaultValue: () => "All"
});
/**
 * @since 4.0.0
 * @category references
 */
export const TracerKey = "effect/Tracer";
/**
 * @since 4.0.0
 * @category references
 * @example
 * ```ts
 * import { Effect, Tracer } from "effect"
 *
 * // Access the current tracer from the context
 * const program = Effect.gen(function*() {
 *   const tracer = yield* Effect.service(Tracer.Tracer)
 *   console.log("Using current tracer")
 * })
 *
 * // Or use the built-in tracer effect
 * const tracerEffect = Effect.gen(function*() {
 *   const tracer = yield* Effect.tracer
 *   console.log("Current tracer obtained")
 * })
 * ```
 */
export const Tracer = /*#__PURE__*/Context.Reference(TracerKey, {
  defaultValue: () => make({
    span: options => new NativeSpan(options)
  })
});
/**
 * @since 4.0.0
 * @category native tracer
 */
export class NativeSpan {
  _tag = "Span";
  spanId;
  traceId = "native";
  sampled;
  name;
  parent;
  annotations;
  links;
  startTime;
  kind;
  status;
  attributes;
  events = [];
  constructor(options) {
    this.name = options.name;
    this.parent = options.parent;
    this.annotations = options.annotations;
    this.links = options.links;
    this.startTime = options.startTime;
    this.kind = options.kind;
    this.sampled = options.sampled;
    this.status = {
      _tag: "Started",
      startTime: options.startTime
    };
    this.attributes = new Map();
    this.traceId = Option.getOrUndefined(options.parent)?.traceId ?? randomHexString(32);
    this.spanId = randomHexString(16);
  }
  end(endTime, exit) {
    this.status = {
      _tag: "Ended",
      endTime,
      exit,
      startTime: this.status.startTime
    };
  }
  attribute(key, value) {
    this.attributes.set(key, value);
  }
  event(name, startTime, attributes) {
    this.events.push([name, startTime, attributes ?? {}]);
  }
  addLinks(links) {
    // oxlint-disable-next-line no-restricted-syntax
    this.links.push(...links);
  }
}
const randomHexString = /*#__PURE__*/function () {
  const characters = "abcdef0123456789";
  const charactersLength = characters.length;
  return function (length) {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
}();
//# sourceMappingURL=Tracer.js.map