/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Stream from "../../Stream.js";
import * as Headers from "./Headers.js";
import * as HttpClient from "./HttpClient.js";
import * as HttpClientError from "./HttpClientError.js";
import * as HttpClientResponse from "./HttpClientResponse.js";
/**
 * @since 4.0.0
 * @category tags
 */
export const Fetch = /*#__PURE__*/Context.Reference("effect/http/FetchHttpClient/Fetch", {
  defaultValue: () => globalThis.fetch
});
/**
 * @since 4.0.0
 * @category tags
 */
export class RequestInit extends /*#__PURE__*/Context.Service()("effect/http/FetchHttpClient/RequestInit") {}
const fetch = /*#__PURE__*/HttpClient.make((request, url, signal, fiber) => {
  const fetch = fiber.getRef(Fetch);
  const options = fiber.context.mapUnsafe.get(RequestInit.key) ?? {};
  const headers = options.headers ? Headers.merge(Headers.fromInput(options.headers), request.headers) : request.headers;
  const send = body => Effect.map(Effect.tryPromise({
    try: () => fetch(url, {
      ...options,
      method: request.method,
      headers,
      body,
      duplex: request.body._tag === "Stream" ? "half" : undefined,
      signal
    }),
    catch: cause => new HttpClientError.HttpClientError({
      reason: new HttpClientError.TransportError({
        request,
        cause
      })
    })
  }), response => HttpClientResponse.fromWeb(request, response));
  switch (request.body._tag) {
    case "Raw":
    case "Uint8Array":
      return send(request.body.body);
    case "FormData":
      return send(request.body.formData);
    case "Stream":
      return Effect.flatMap(Stream.toReadableStreamEffect(request.body.stream), send);
  }
  return send(undefined);
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = /*#__PURE__*/HttpClient.layerMergedContext(/*#__PURE__*/Effect.succeed(fetch));
//# sourceMappingURL=FetchHttpClient.js.map