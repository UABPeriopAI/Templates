/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as FileSystem from "../../FileSystem.js";
import { identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Stream from "../../Stream.js";
import * as Etag from "./Etag.js";
import * as Headers from "./Headers.js";
import * as Response from "./HttpServerResponse.js";
/**
 * @since 4.0.0
 * @category tags
 */
export class HttpPlatform extends /*#__PURE__*/Context.Service()("effect/http/HttpPlatform") {}
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (impl) {
  const fs = yield* FileSystem.FileSystem;
  const etagGen = yield* Etag.Generator;
  return HttpPlatform.of({
    fileResponse: Effect.fnUntraced(function* (path, options) {
      const info = yield* fs.stat(path);
      const etag = yield* etagGen.fromFileInfo(info);
      const start = Number(options?.offset ?? 0);
      const end = options?.bytesToRead !== undefined ? start + Number(options.bytesToRead) : undefined;
      const headers = Headers.set(options?.headers ? Headers.fromInput(options.headers) : Headers.empty, "etag", Etag.toString(etag));
      if (Option.isSome(info.mtime)) {
        ;
        headers["last-modified"] = info.mtime.value.toUTCString();
      }
      const contentLength = end !== undefined ? end - start : Number(info.size) - start;
      return impl.fileResponse(path, options?.status ?? 200, options?.statusText, headers, start, end, contentLength);
    }),
    fileWebResponse(file, options) {
      return Effect.map(etagGen.fromFileWeb(file), etag => {
        const headers = Headers.merge(options?.headers ? Headers.fromInput(options.headers) : Headers.empty, Headers.fromRecordUnsafe({
          etag: Etag.toString(etag),
          "last-modified": new Date(file.lastModified).toUTCString()
        }));
        return impl.fileWebResponse(file, options?.status ?? 200, options?.statusText, headers, options);
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = /*#__PURE__*/Layer.effect(HttpPlatform)(Effect.flatMap(FileSystem.FileSystem.asEffect(), fs => make({
  fileResponse(path, status, statusText, headers, start, end, contentLength) {
    return Response.stream(fs.stream(path, {
      offset: start,
      bytesToRead: end !== undefined ? end - start : undefined
    }), {
      contentLength,
      headers,
      status,
      statusText
    });
  },
  fileWebResponse(file, status, statusText, headers, _options) {
    return Response.stream(Stream.fromReadableStream({
      evaluate: () => file.stream(),
      onError: identity
    }), {
      headers,
      status,
      statusText
    });
  }
}))).pipe(/*#__PURE__*/Layer.provide(Etag.layerWeak));
//# sourceMappingURL=HttpPlatform.js.map