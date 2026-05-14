import * as Effect from "../../Effect.ts";
import type { HttpServerResponse } from "./HttpServerResponse.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const symbol = "~effect/http/HttpServerRespondable";
/**
 * @since 4.0.0
 * @category models
 */
export interface Respondable {
    [symbol](): Effect.Effect<HttpServerResponse, unknown>;
}
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isRespondable: (u: unknown) => u is Respondable;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const toResponse: (self: Respondable) => Effect.Effect<HttpServerResponse>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const toResponseOrElse: (u: unknown, orElse: HttpServerResponse) => Effect.Effect<HttpServerResponse>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const toResponseOrElseDefect: (u: unknown, orElse: HttpServerResponse) => Effect.Effect<HttpServerResponse>;
//# sourceMappingURL=HttpServerRespondable.d.ts.map