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
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Request from "../../Request.ts";
import * as RequestResolver from "../../RequestResolver.ts";
import * as Schema from "../../Schema.ts";
import * as AiError from "./AiError.ts";
declare const EmbeddingModel_base: Context.ServiceClass<EmbeddingModel, "effect/unstable/ai/EmbeddingModel", Service>;
/**
 * Service tag for embedding model operations.
 *
 * @since 4.0.0
 * @category services
 */
export declare class EmbeddingModel extends EmbeddingModel_base {
}
declare const Dimensions_base: Context.ServiceClass<Dimensions, "effect/unstable/ai/EmbeddingModel/Dimensions", number>;
/**
 * Service tag that provides the current embedding dimensions.
 *
 * @since 4.0.0
 * @category services
 */
export declare class Dimensions extends Dimensions_base {
}
declare const EmbeddingUsage_base: Schema.Class<EmbeddingUsage, Schema.Struct<{
    readonly inputTokens: Schema.UndefinedOr<Schema.Finite>;
}>, {}>;
/**
 * Token usage metadata for embedding operations.
 *
 * @since 4.0.0
 * @category models
 */
export declare class EmbeddingUsage extends EmbeddingUsage_base {
}
declare const EmbedResponse_base: Schema.Class<EmbedResponse, Schema.Struct<{
    readonly vector: Schema.$Array<Schema.Finite>;
}>, {}>;
/**
 * Response for a single embedding request.
 *
 * @since 4.0.0
 * @category models
 */
export declare class EmbedResponse extends EmbedResponse_base {
}
declare const EmbedManyResponse_base: Schema.Class<EmbedManyResponse, Schema.Struct<{
    readonly embeddings: Schema.$Array<typeof EmbedResponse>;
    readonly usage: typeof EmbeddingUsage;
}>, {}>;
/**
 * Response for multiple embeddings.
 *
 * @since 4.0.0
 * @category models
 */
export declare class EmbedManyResponse extends EmbedManyResponse_base {
}
/**
 * Provider input options for embedding requests.
 *
 * @since 4.0.0
 * @category models
 */
export interface ProviderOptions {
    readonly inputs: ReadonlyArray<string>;
}
/**
 * Provider response for batch embedding requests.
 *
 * @since 4.0.0
 * @category models
 */
export interface ProviderResponse {
    readonly results: Array<Array<number>>;
    readonly usage: {
        readonly inputTokens: number | undefined;
    };
}
declare const EmbeddingRequest_base: new <A extends Record<string, any>, Success, Error = never, Services = never>(args: import("../../Types.ts").Equals<Omit<A, "~effect/Request">, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" | "~effect/Request" ? never : P]: A[P]; }) => Request.Request<Success, Error, Services> & Readonly<A> & {
    readonly _tag: "EmbeddingRequest";
};
/**
 * Tagged request used by request resolvers for embedding operations.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare class EmbeddingRequest extends EmbeddingRequest_base<{
    readonly input: string;
}, EmbedResponse, AiError.AiError> {
}
/**
 * Service interface for embedding operations.
 *
 * @since 4.0.0
 * @category models
 */
export interface Service {
    readonly resolver: RequestResolver.RequestResolver<EmbeddingRequest>;
    readonly embed: (input: string) => Effect.Effect<EmbedResponse, AiError.AiError>;
    readonly embedMany: (input: ReadonlyArray<string>) => Effect.Effect<EmbedManyResponse, AiError.AiError>;
}
/**
 * Creates an EmbeddingModel service from a provider embedMany implementation.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (params: {
    readonly embedMany: (options: ProviderOptions) => Effect.Effect<ProviderResponse, AiError.AiError>;
}) => Effect.Effect<Service>;
export {};
//# sourceMappingURL=EmbeddingModel.d.ts.map