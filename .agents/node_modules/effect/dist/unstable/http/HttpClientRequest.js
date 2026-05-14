/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import { stringOrRedacted } from "../../internal/redacted.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import { hasProperty } from "../../Predicate.js";
import { redact } from "../../Redactable.js";
import * as Result from "../../Result.js";
import * as Stream from "../../Stream.js";
import * as Headers from "./Headers.js";
import * as HttpBody from "./HttpBody.js";
import { hasBody } from "./HttpMethod.js";
import * as UrlParams from "./UrlParams.js";
const TypeId = "~effect/http/HttpClientRequest";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isHttpClientRequest = u => hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: "HttpClientRequest",
      method: this.method,
      url: this.url,
      urlParams: this.urlParams,
      hash: this.hash,
      headers: redact(this.headers),
      body: this.body.toJSON()
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * @since 4.0.0
 * @category constructors
 */
export function makeWith(method, url, urlParams, hash, headers, body) {
  const self = Object.create(Proto);
  self.method = method;
  self.url = url;
  self.urlParams = urlParams;
  self.hash = hash;
  self.headers = headers;
  self.body = body;
  return self;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/makeWith("GET", "", UrlParams.empty, /*#__PURE__*/Option.none(), Headers.empty, HttpBody.empty);
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = method => (url, options) => modify(empty, {
  method,
  url,
  ...(options ?? undefined)
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const get = /*#__PURE__*/make("GET");
/**
 * @since 4.0.0
 * @category constructors
 */
export const post = /*#__PURE__*/make("POST");
/**
 * @since 4.0.0
 * @category constructors
 */
export const patch = /*#__PURE__*/make("PATCH");
/**
 * @since 4.0.0
 * @category constructors
 */
export const put = /*#__PURE__*/make("PUT");
const del = /*#__PURE__*/make("DELETE");
export {
/**
 * @since 4.0.0
 * @category constructors
 */
del as delete };
/**
 * @since 4.0.0
 * @category constructors
 */
export const head = /*#__PURE__*/make("HEAD");
/**
 * @since 4.0.0
 * @category constructors
 */
export const options = /*#__PURE__*/make("OPTIONS");
/**
 * @since 4.0.0
 * @category constructors
 */
export const trace = /*#__PURE__*/make("TRACE");
/**
 * @since 4.0.0
 * @category combinators
 */
export const modify = /*#__PURE__*/dual(2, (self, options) => {
  let result = self;
  if (options.method) {
    result = setMethod(result, options.method);
  }
  if (options.url) {
    result = setUrl(result, options.url);
  }
  if (options.headers) {
    result = setHeaders(result, options.headers);
  }
  if (options.urlParams) {
    result = setUrlParams(result, options.urlParams);
  }
  if (options.hash) {
    result = setHash(result, options.hash);
  }
  if (options.body) {
    result = setBody(result, options.body);
  }
  if (options.accept) {
    result = accept(result, options.accept);
  }
  if (options.acceptJson) {
    result = acceptJson(result);
  }
  return result;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const setMethod = /*#__PURE__*/dual(2, (self, method) => makeWith(method, self.url, self.urlParams, self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setHeader = /*#__PURE__*/dual(3, (self, key, value) => makeWith(self.method, self.url, self.urlParams, self.hash, Headers.set(self.headers, key, value), self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setHeaders = /*#__PURE__*/dual(2, (self, input) => makeWith(self.method, self.url, self.urlParams, self.hash, Headers.setAll(self.headers, input), self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const basicAuth = /*#__PURE__*/dual(3, (self, username, password) => setHeader(self, "Authorization", `Basic ${btoa(`${stringOrRedacted(username)}:${stringOrRedacted(password)}`)}`));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bearerToken = /*#__PURE__*/dual(2, (self, token) => setHeader(self, "Authorization", `Bearer ${stringOrRedacted(token)}`));
/**
 * @since 4.0.0
 * @category combinators
 */
export const accept = /*#__PURE__*/dual(2, (self, mediaType) => setHeader(self, "Accept", mediaType));
/**
 * @since 4.0.0
 * @category combinators
 */
export const acceptJson = /*#__PURE__*/accept("application/json");
/**
 * @since 4.0.0
 * @category combinators
 */
export const setUrl = /*#__PURE__*/dual(2, (self, url) => {
  if (typeof url === "string") {
    return makeWith(self.method, url, self.urlParams, self.hash, self.headers, self.body);
  }
  const clone = new URL(url.toString());
  const urlParams = UrlParams.fromInput(clone.searchParams);
  const hash = Option.fromNullishOr(clone.hash === "" ? undefined : clone.hash.slice(1));
  clone.search = "";
  clone.hash = "";
  return makeWith(self.method, clone.toString(), urlParams, hash, self.headers, self.body);
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const prependUrl = /*#__PURE__*/dual(2, (self, path) => {
  if (path === "") return self;
  return makeWith(self.method, joinSegments(path, self.url), self.urlParams, self.hash, self.headers, self.body);
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const appendUrl = /*#__PURE__*/dual(2, (self, path) => {
  if (path === "") return self;
  return makeWith(self.method, joinSegments(self.url, path), self.urlParams, self.hash, self.headers, self.body);
});
const joinSegments = (first, second) => {
  const endsWithSlash = first.endsWith("/");
  const startsWithSlash = second.startsWith("/");
  const needsTrim = endsWithSlash && startsWithSlash;
  const needsSlash = !endsWithSlash && !startsWithSlash;
  return needsTrim ? first + second.slice(1) : needsSlash ? first + "/" + second : first + second;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const updateUrl = /*#__PURE__*/dual(2, (self, f) => makeWith(self.method, f(self.url), self.urlParams, self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setUrlParam = /*#__PURE__*/dual(3, (self, key, value) => makeWith(self.method, self.url, UrlParams.set(self.urlParams, key, value), self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setUrlParams = /*#__PURE__*/dual(2, (self, input) => makeWith(self.method, self.url, UrlParams.setAll(self.urlParams, input), self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const appendUrlParam = /*#__PURE__*/dual(3, (self, key, value) => makeWith(self.method, self.url, UrlParams.append(self.urlParams, key, value), self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const appendUrlParams = /*#__PURE__*/dual(2, (self, input) => makeWith(self.method, self.url, UrlParams.appendAll(self.urlParams, input), self.hash, self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setHash = /*#__PURE__*/dual(2, (self, hash) => makeWith(self.method, self.url, self.urlParams, Option.some(hash), self.headers, self.body));
/**
 * @since 4.0.0
 * @category combinators
 */
export const removeHash = self => makeWith(self.method, self.url, self.urlParams, Option.none(), self.headers, self.body);
/**
 * @since 4.0.0
 * @category combinators
 */
export const setBody = /*#__PURE__*/dual(2, (self, body) => {
  let headers = self.headers;
  if (body._tag === "Empty" || body._tag === "FormData") {
    headers = Headers.remove(Headers.remove(headers, "Content-Type"), "Content-length");
  } else {
    if (body.contentType) {
      headers = Headers.set(headers, "content-type", body.contentType);
    }
    if (body.contentLength !== undefined) {
      headers = Headers.set(headers, "content-length", body.contentLength.toString());
    }
  }
  return makeWith(self.method, self.url, self.urlParams, self.hash, headers, body);
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyUint8Array = /*#__PURE__*/dual(args => isHttpClientRequest(args[0]), (self, body, contentType) => setBody(self, HttpBody.uint8Array(body, contentType)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyText = /*#__PURE__*/dual(args => isHttpClientRequest(args[0]), (self, body, contentType) => setBody(self, HttpBody.text(body, contentType)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyJson = /*#__PURE__*/dual(2, (self, body) => Effect.map(HttpBody.json(body), body => setBody(self, body)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyJsonUnsafe = /*#__PURE__*/dual(2, (self, body) => setBody(self, HttpBody.jsonUnsafe(body)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const schemaBodyJson = (schema, options) => {
  const encode = HttpBody.jsonSchema(schema, options);
  return dual(2, (self, body) => Effect.map(encode(body), body => setBody(self, body)));
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyUrlParams = /*#__PURE__*/dual(2, (self, input) => setBody(self, HttpBody.urlParams(UrlParams.fromInput(input))));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyFormData = /*#__PURE__*/dual(2, (self, body) => setBody(self, HttpBody.formData(body)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyFormDataRecord = /*#__PURE__*/dual(2, (self, entries) => setBody(self, HttpBody.formDataRecord(entries)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyStream = /*#__PURE__*/dual(args => isHttpClientRequest(args[0]), (self, body, options) => setBody(self, HttpBody.stream(body, options?.contentType, options?.contentLength)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const bodyFile = /*#__PURE__*/dual(args => isHttpClientRequest(args[0]), (self, path, options) => Effect.map(HttpBody.file(path, options), body => setBody(self, body)));
/**
 * @since 4.0.0
 * @category combinators
 */
export function toUrl(self) {
  const r = UrlParams.makeUrl(self.url, self.urlParams, Option.getOrUndefined(self.hash));
  if (Result.isSuccess(r)) {
    return Option.some(r.success);
  }
  return Option.none();
}
/**
 * @since 4.0.0
 * @category conversions
 */
export const fromWeb = request => {
  const method = request.method.toUpperCase();
  return modify(empty, {
    method,
    url: new URL(request.url),
    headers: request.headers,
    body: fromWebBody(request, method)
  });
};
const fromWebBody = (request, method) => {
  if (!hasBody(method) || request.body === null) {
    return HttpBody.empty;
  }
  return HttpBody.raw(request.body, {
    contentType: request.headers.get("content-type") ?? undefined,
    contentLength: parseContentLength(request.headers.get("content-length"))
  });
};
const parseContentLength = contentLength => {
  if (contentLength === null) {
    return undefined;
  }
  const parsed = Number.parseInt(contentLength, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWebResult = (self, options) => {
  const url = UrlParams.makeUrl(self.url, self.urlParams, Option.getOrUndefined(self.hash));
  if (Result.isFailure(url)) {
    return Result.fail(url.failure);
  }
  const requestInit = {
    method: self.method,
    headers: self.headers
  };
  if (options?.signal) {
    requestInit.signal = options.signal;
  }
  if (hasBody(self.method)) {
    switch (self.body._tag) {
      case "Empty":
        {
          break;
        }
      case "Raw":
        {
          requestInit.body = self.body.body;
          if (isReadableStream(self.body.body)) {
            ;
            requestInit.duplex = "half";
          }
          break;
        }
      case "Uint8Array":
        {
          requestInit.body = self.body.body;
          break;
        }
      case "FormData":
        {
          requestInit.body = self.body.formData;
          break;
        }
      case "Stream":
        {
          requestInit.body = Stream.toReadableStreamWith(self.body.stream, options?.context ?? Context.empty());
          requestInit.duplex = "half";
          break;
        }
    }
  }
  return Result.try({
    try: () => new Request(url.success, requestInit),
    catch: cause => new UrlParams.UrlParamsError({
      cause
    })
  });
};
const isReadableStream = u => typeof ReadableStream !== "undefined" && u instanceof ReadableStream;
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWeb = (self, options) => Effect.contextWith(context => toWebResult(self, {
  context: context,
  signal: options?.signal
}).asEffect());
//# sourceMappingURL=HttpClientRequest.js.map