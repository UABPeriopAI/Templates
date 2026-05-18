/**
 * The `EmbeddingModel` module provides provider-agnostic text embedding capabilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { EmbeddingModel } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const model = yield* EmbeddingModel.EmbeddingModel
 *   return yield* model.embed("hello world")
 * })
 * ```
 *
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Request from "../../Request.js";
import * as RequestResolver from "../../RequestResolver.js";
import * as Schema from "../../Schema.js";
import * as AiError from "./AiError.js";
/**
 * Service tag for embedding model operations.
 *
 * @since 4.0.0
 * @category services
 */
export class EmbeddingModel extends /*#__PURE__*/Context.Service()("effect/unstable/ai/EmbeddingModel") {}
/**
 * Service tag that provides the current embedding dimensions.
 *
 * @since 4.0.0
 * @category services
 */
export class Dimensions extends /*#__PURE__*/Context.Service()("effect/unstable/ai/EmbeddingModel/Dimensions") {}
/**
 * Token usage metadata for embedding operations.
 *
 * @since 4.0.0
 * @category models
 */
export class EmbeddingUsage extends /*#__PURE__*/Schema.Class("effect/ai/EmbeddingModel/EmbeddingUsage")({
  inputTokens: /*#__PURE__*/Schema.UndefinedOr(Schema.Finite)
}) {}
/**
 * Response for a single embedding request.
 *
 * @since 4.0.0
 * @category models
 */
export class EmbedResponse extends /*#__PURE__*/Schema.Class("effect/ai/EmbeddingModel/EmbedResponse")({
  vector: /*#__PURE__*/Schema.Array(Schema.Finite)
}) {}
/**
 * Response for multiple embeddings.
 *
 * @since 4.0.0
 * @category models
 */
export class EmbedManyResponse extends /*#__PURE__*/Schema.Class("effect/ai/EmbeddingModel/EmbedManyResponse")({
  embeddings: /*#__PURE__*/Schema.Array(EmbedResponse),
  usage: EmbeddingUsage
}) {}
/**
 * Tagged request used by request resolvers for embedding operations.
 *
 * @since 4.0.0
 * @category constructors
 */
export class EmbeddingRequest extends /*#__PURE__*/Request.TaggedClass("EmbeddingRequest") {}
const invalidProviderResponse = description => AiError.make({
  module: "EmbeddingModel",
  method: "embedMany",
  reason: new AiError.InvalidOutputError({
    description
  })
});
/**
 * Creates an EmbeddingModel service from a provider embedMany implementation.
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (params) {
  const resolver = RequestResolver.make(entries => Effect.flatMap(params.embedMany({
    inputs: entries.map(entry => entry.request.input)
  }), response => Effect.map(mapProviderResults(entries.length, response.results), embeddings => {
    for (let i = 0; i < entries.length; i++) {
      entries[i].completeUnsafe(Exit.succeed(embeddings[i]));
    }
  }))).pipe(RequestResolver.withSpan("EmbeddingModel.resolver"));
  return EmbeddingModel.of({
    resolver,
    embed: input => Effect.request(new EmbeddingRequest({
      input
    }), resolver).pipe(Effect.withSpan("EmbeddingModel.embed")),
    embedMany: input => (input.length === 0 ? Effect.succeed(new EmbedManyResponse({
      embeddings: [],
      usage: new EmbeddingUsage({
        inputTokens: undefined
      })
    })) : params.embedMany({
      inputs: input
    }).pipe(Effect.flatMap(response => mapProviderResults(input.length, response.results).pipe(Effect.map(embeddings => new EmbedManyResponse({
      embeddings,
      usage: new EmbeddingUsage({
        inputTokens: response.usage.inputTokens
      })
    })))))).pipe(Effect.withSpan("EmbeddingModel.embedMany"))
  });
});
const mapProviderResults = (inputLength, results) => {
  const embeddings = new Array(inputLength);
  if (results.length !== inputLength) {
    return Effect.fail(invalidProviderResponse(`Provider returned ${results.length} embeddings but expected ${inputLength}`));
  }
  for (let i = 0; i < results.length; i++) {
    const vector = results[i];
    embeddings[i] = new EmbedResponse({
      vector
    });
  }
  return Effect.succeed(embeddings);
};
//# sourceMappingURL=EmbeddingModel.js.map