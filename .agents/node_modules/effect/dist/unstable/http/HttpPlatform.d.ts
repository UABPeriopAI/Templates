/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Layer from "../../Layer.ts";
import type { PlatformError } from "../../PlatformError.ts";
import * as Etag from "./Etag.ts";
import * as Headers from "./Headers.ts";
import type * as Body from "./HttpBody.ts";
import * as Response from "./HttpServerResponse.ts";
declare const HttpPlatform_base: Context.ServiceClass<HttpPlatform, "effect/http/HttpPlatform", {
    readonly fileResponse: (path: string, options?: Response.Options.WithContent & {
        readonly bytesToRead?: FileSystem.SizeInput | undefined;
        readonly chunkSize?: FileSystem.SizeInput | undefined;
        readonly offset?: FileSystem.SizeInput | undefined;
    }) => Effect.Effect<Response.HttpServerResponse, PlatformError>;
    readonly fileWebResponse: (file: Body.HttpBody.FileLike, options?: Response.Options.WithContent & {
        readonly bytesToRead?: FileSystem.SizeInput | undefined;
        readonly chunkSize?: FileSystem.SizeInput | undefined;
        readonly offset?: FileSystem.SizeInput | undefined;
    }) => Effect.Effect<Response.HttpServerResponse>;
}>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class HttpPlatform extends HttpPlatform_base {
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (impl: {
    readonly fileResponse: (path: string, status: number, statusText: string | undefined, headers: Headers.Headers, start: number, end: number | undefined, contentLength: number) => Response.HttpServerResponse;
    readonly fileWebResponse: (file: Body.HttpBody.FileLike, status: number, statusText: string | undefined, headers: Headers.Headers, options?: {
        readonly bytesToRead?: FileSystem.SizeInput | undefined;
        readonly chunkSize?: FileSystem.SizeInput | undefined;
        readonly offset?: FileSystem.SizeInput | undefined;
    }) => Response.HttpServerResponse;
}) => Effect.Effect<HttpPlatform["Service"], never, Etag.Generator | FileSystem.FileSystem>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: Layer.Layer<HttpPlatform, never, FileSystem.FileSystem>;
export {};
//# sourceMappingURL=HttpPlatform.d.ts.map