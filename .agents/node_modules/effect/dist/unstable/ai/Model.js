/**
 * The `Model` module provides a unified interface for AI service providers.
 *
 * This module enables creation of provider-specific AI models that can be used
 * interchangeably within the Effect AI ecosystem. It combines Layer
 * functionality with provider identification, allowing for seamless switching
 * between different AI service providers while maintaining type safety.
 *
 * @example
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect } from "effect"
 * import { LanguageModel, Model } from "effect/unstable/ai"
 *
 * declare const myAnthropicLayer: Layer.Layer<LanguageModel.LanguageModel>
 *
 * const anthropicModel = Model.make("anthropic", "claude-3-5-haiku", myAnthropicLayer)
 *
 * const program = Effect.gen(function*() {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Hello, world!"
 *   })
 *   return response.text
 * }).pipe(
 *   Effect.provide(anthropicModel)
 * )
 * ```
 *
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { identity } from "../../Function.js";
import { PipeInspectableProto, YieldableProto } from "../../internal/core.js";
import * as Layer from "../../Layer.js";
const TypeId = "~effect/ai/Model";
/**
 * Service tag that provides the current large language model provider name.
 *
 * This tag is automatically provided by Model instances and can be used to
 * access the name of the provider that is currently in use within a given
 * Effect program.
 *
 * @since 4.0.0
 * @category services
 */
export class ProviderName extends /*#__PURE__*/Context.Service()("effect/unstable/ai/Model/ProviderName") {}
/**
 * Service tag that provides the current large language model name.
 *
 * This tag is automatically provided by Model instances and can be used to
 * access the name of the model that is currently in use within a given Effect
 * program.
 *
 * @since 4.0.0
 * @category services
 */
export class ModelName extends /*#__PURE__*/Context.Service()("effect/unstable/ai/Model/ModelName") {}
const Proto = {
  ...YieldableProto,
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  ["~effect/Layer"]: {
    _ROut: identity,
    _E: identity,
    _RIn: identity
  },
  asEffect() {
    return Effect.contextWith(context => Effect.succeed(Layer.provide(this, Layer.succeedContext(context))));
  },
  toJSON() {
    return {
      _id: "effect/ai/Model",
      provider: this.provider
    };
  }
};
/**
 * Creates a Model from a provider name and a Layer that constructs AI services.
 *
 * @example
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect } from "effect"
 * import { LanguageModel, Model } from "effect/unstable/ai"
 *
 * declare const bedrockLayer: Layer.Layer<LanguageModel.LanguageModel>
 *
 * // Model automatically provides ProviderName and ModelName services
 * const checkProviderAndGenerate = Effect.gen(function*() {
 *   const provider = yield* Model.ProviderName
 *   const modelName = yield* Model.ModelName
 *
 *   console.log(`Generating with: ${provider}/${modelName}`)
 *
 *   return yield* LanguageModel.generateText({
 *     prompt: `Hello from ${provider}!`
 *   })
 * })
 *
 * const program = checkProviderAndGenerate.pipe(
 *   Effect.provide(Model.make("amazon-bedrock", "claude-3-5-haiku", bedrockLayer))
 * )
 * // Will log: "Generating with: amazon-bedrock/claude-3-5-haiku"
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = (
/**
 * Provider identifier (e.g., "openai", "anthropic", "amazon-bedrock").
 */
provider,
/**
 * Model identifier (e.g., "gpt-5", "claude-3-5-haiku").
 */
modelName,
/**
 * Layer that provides the AI services for this provider.
 */
layer) => Object.assign(Object.create(Proto), {
  provider
}, Layer.merge(layer, Layer.succeedContext(ProviderName.context(provider).pipe(Context.add(ModelName, modelName)))));
//# sourceMappingURL=Model.js.map