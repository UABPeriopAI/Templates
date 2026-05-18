/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import type * as Layer from "../../Layer.ts";
import * as HttpClient from "./HttpClient.ts";
/**
 * @since 4.0.0
 * @category tags
 */
export declare const Fetch: Context.Reference<typeof globalThis.fetch>;
declare const RequestInit_base: Context.ServiceClass<RequestInit, "effect/http/FetchHttpClient/RequestInit", globalThis.RequestInit>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class RequestInit extends RequestInit_base {
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<HttpClient.HttpClient>;
export {};
//# sourceMappingURL=FetchHttpClient.d.ts.map