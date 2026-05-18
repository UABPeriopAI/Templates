/**
 * The `Telemetry` module provides OpenTelemetry integration for operations
 * performed against a large language model provider by defining telemetry
 * attributes and utilities that follow the OpenTelemetry GenAI semantic
 * conventions.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Telemetry } from "effect/unstable/ai"
 *
 * // Add telemetry attributes to a span
 * const addTelemetry = Effect.gen(function*() {
 *   const span = yield* Effect.currentSpan
 *
 *   Telemetry.addGenAIAnnotations(span, {
 *     system: "openai",
 *     operation: { name: "chat" },
 *     request: {
 *       model: "gpt-4",
 *       temperature: 0.7,
 *       maxTokens: 1000
 *     },
 *     usage: {
 *       inputTokens: 100,
 *       outputTokens: 50
 *     }
 *   })
 * })
 * ```
 *
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import { dual } from "../../Function.js";
import * as Predicate from "../../Predicate.js";
import * as String from "../../String.js";
/**
 * Creates a function to add attributes to a span with a given prefix and key transformation.
 *
 * This utility function is used internally to create specialized functions for adding
 * different types of telemetry attributes to OpenTelemetry spans.
 *
 * @example
 * ```ts
 * import type { Tracer } from "effect"
 * import { String } from "effect"
 * import { Telemetry } from "effect/unstable/ai"
 *
 * const addCustomAttributes = Telemetry.addSpanAttributes(
 *   "custom.ai",
 *   String.camelToSnake
 * )
 *
 * // Usage with a span
 * declare const span: Tracer.Span
 * addCustomAttributes(span, {
 *   modelName: "gpt-4",
 *   maxTokens: 1000
 * })
 * // Results in attributes: "custom.ai.model_name" and "custom.ai.max_tokens"
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export const addSpanAttributes = (
/**
 * The prefix to add to all attribute keys.
 */
keyPrefix,
/**
 * Function to transform attribute keys (e.g., camelCase to snake_case).
 */
transformKey) => (
/**
 * The OpenTelemetry span to add attributes to.
 */
span,
/**
 * The attributes to add to the span.
 */
attributes) => {
  for (const [key, value] of Object.entries(attributes)) {
    if (Predicate.isNotNullish(value)) {
      span.attribute(`${keyPrefix}.${transformKey(key)}`, value);
    }
  }
};
const addSpanBaseAttributes = /*#__PURE__*/addSpanAttributes("gen_ai", String.camelToSnake);
const addSpanOperationAttributes = /*#__PURE__*/addSpanAttributes("gen_ai.operation", String.camelToSnake);
const addSpanRequestAttributes = /*#__PURE__*/addSpanAttributes("gen_ai.request", String.camelToSnake);
const addSpanResponseAttributes = /*#__PURE__*/addSpanAttributes("gen_ai.response", String.camelToSnake);
const addSpanTokenAttributes = /*#__PURE__*/addSpanAttributes("gen_ai.token", String.camelToSnake);
const addSpanUsageAttributes = /*#__PURE__*/addSpanAttributes("gen_ai.usage", String.camelToSnake);
/**
 * Applies GenAI telemetry attributes to an OpenTelemetry span.
 *
 * This function adds standardized GenAI attributes to a span following OpenTelemetry
 * semantic conventions. It supports both curried and direct application patterns.
 *
 * **Note**: This function mutates the provided span in-place.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Telemetry } from "effect/unstable/ai"
 *
 * const directUsage = Effect.gen(function*() {
 *   const span = yield* Effect.currentSpan
 *
 *   Telemetry.addGenAIAnnotations(span, {
 *     system: "openai",
 *     request: { model: "gpt-4", temperature: 0.7 },
 *     usage: { inputTokens: 100, outputTokens: 50 }
 *   })
 * })
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export const addGenAIAnnotations = /*#__PURE__*/dual(2, (span, options) => {
  addSpanBaseAttributes(span, {
    system: options.system
  });
  if (Predicate.isNotNullish(options.operation)) addSpanOperationAttributes(span, options.operation);
  if (Predicate.isNotNullish(options.request)) addSpanRequestAttributes(span, options.request);
  if (Predicate.isNotNullish(options.response)) addSpanResponseAttributes(span, options.response);
  if (Predicate.isNotNullish(options.token)) addSpanTokenAttributes(span, options.token);
  if (Predicate.isNotNullish(options.usage)) addSpanUsageAttributes(span, options.usage);
});
/**
 * Service key for providing a span transformer to large langauge model
 * operations.
 *
 * @since 4.0.0
 * @category services
 */
export class CurrentSpanTransformer extends /*#__PURE__*/Context.Service()("effect/ai/Telemetry/CurrentSpanTransformer") {}
//# sourceMappingURL=Telemetry.js.map