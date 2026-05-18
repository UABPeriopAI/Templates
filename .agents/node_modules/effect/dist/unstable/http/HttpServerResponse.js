/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as ErrorReporter from "../../ErrorReporter.js";
import { dual } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import { PipeInspectableProto } from "../../internal/core.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import { hasProperty } from "../../Predicate.js";
import { redact } from "../../Redactable.js";
import * as Stream from "../../Stream.js";
import * as Cookies from "./Cookies.js";
import * as Headers from "./Headers.js";
import * as Body from "./HttpBody.js";
import * as HttpClientError from "./HttpClientError.js";
import * as HttpClientRequest from "./HttpClientRequest.js";
import * as HttpClientResponse from "./HttpClientResponse.js";
import * as HttpIncomingMessage from "./HttpIncomingMessage.js";
import * as Template from "./Template.js";
import * as UrlParams from "./UrlParams.js";
const TypeId = "~effect/http/HttpServerResponse";
/**
 * @since 4.0.0
 */
export const isHttpServerResponse = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category constructors
 */
export const empty = options => makeResponse({
  status: options?.status ?? 204,
  statusText: options?.statusText,
  headers: options?.headers ? Headers.fromInput(options.headers) : undefined,
  cookies: options?.cookies
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const redirect = (location, options) => {
  const headers = Headers.fromRecordUnsafe({
    location: location.toString()
  });
  return makeResponse({
    status: options?.status ?? 302,
    statusText: options?.statusText,
    headers: options?.headers ? Headers.merge(headers, Headers.fromInput(options.headers)) : headers,
    cookies: options?.cookies ?? Cookies.empty
  });
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const uint8Array = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies ?? Cookies.empty,
    body: Body.uint8Array(body, getContentType(options, headers))
  });
};
const getContentType = (options, headers) => {
  if (options?.contentType) {
    return options.contentType;
  } else if (options?.headers) {
    return headers["content-type"];
  }
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const text = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies ?? Cookies.empty,
    body: Body.text(body, getContentType(options, headers))
  });
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const html = (strings, ...args) => {
  if (typeof strings === "string") {
    return text(strings, {
      contentType: "text/html"
    });
  }
  return Effect.map(Template.make(strings, ...args), _ => text(_, {
    contentType: "text/html"
  }));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const htmlStream = (strings, ...args) => Effect.map(Effect.context(), context => stream(Stream.provideContext(Stream.encodeText(Template.stream(strings, ...args)), context), {
  contentType: "text/html"
}));
/**
 * @since 4.0.0
 * @category constructors
 */
export const json = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return Effect.map(Body.json(body, getContentType(options, headers)), body => makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies,
    body
  }));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const schemaJson = (schema, options) => {
  const encode = Body.jsonSchema(schema, options);
  return (body, options) => {
    const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
    return Effect.map(encode(body, getContentType(options, headers)), body => makeResponse({
      status: options?.status ?? 200,
      statusText: options?.statusText,
      headers,
      cookies: options?.cookies,
      body
    }));
  };
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const jsonUnsafe = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies,
    body: Body.jsonUnsafe(body, getContentType(options, headers))
  });
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const urlParams = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies,
    body: Body.text(UrlParams.toString(UrlParams.fromInput(body)), getContentType(options, headers) ?? "application/x-www-form-urlencoded")
  });
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const raw = (body, options) => makeResponse({
  status: options?.status ?? 200,
  statusText: options?.statusText,
  headers: options?.headers && Headers.fromInput(options.headers),
  cookies: options?.cookies,
  body: Body.raw(body, {
    contentType: options?.contentType,
    contentLength: options?.contentLength
  })
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const formData = (body, options) => makeResponse({
  status: options?.status ?? 200,
  statusText: options?.statusText,
  headers: options?.headers && Headers.fromInput(options.headers),
  cookies: options?.cookies,
  body: Body.formData(body)
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const stream = (body, options) => {
  const headers = options?.headers ? Headers.fromInput(options.headers) : Headers.empty;
  return makeResponse({
    status: options?.status ?? 200,
    statusText: options?.statusText,
    headers,
    cookies: options?.cookies,
    body: Body.stream(body, getContentType(options, headers), options?.contentLength)
  });
};
const HttpPlatformKey = /*#__PURE__*/Context.Service("effect/http/HttpPlatform");
/**
 * @since 4.0.0
 * @category constructors
 */
export const file = (path, options) => Effect.flatMap(HttpPlatformKey.asEffect(), platform => platform.fileResponse(path, options));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fileWeb = (file, options) => Effect.flatMap(HttpPlatformKey.asEffect(), platform => platform.fileWebResponse(file, options));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setHeader = /*#__PURE__*/dual(3, (self, key, value) => makeResponse({
  ...self,
  headers: Headers.set(self.headers, key, value)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setHeaders = /*#__PURE__*/dual(2, (self, input) => makeResponse({
  ...self,
  headers: Headers.setAll(self.headers, input)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const removeCookie = /*#__PURE__*/dual(2, (self, name) => makeResponse({
  ...self,
  cookies: Cookies.remove(self.cookies, name)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const replaceCookies = /*#__PURE__*/dual(2, (self, cookies) => makeResponse({
  ...self,
  cookies
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setCookie = /*#__PURE__*/dual(args => isHttpServerResponse(args[0]), (self, name, value, options) => Effect.map(Cookies.set(self.cookies, name, value, options).asEffect(), cookies => makeResponse({
  ...self,
  cookies
})));
/**
 * @since 4.0.0
 * @category combinators
 */
export const expireCookie = /*#__PURE__*/dual(args => isHttpServerResponse(args[0]), (self, name, options) => Effect.map(Cookies.expireCookie(self.cookies, name, options).asEffect(), cookies => makeResponse({
  ...self,
  cookies
})));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setCookieUnsafe = /*#__PURE__*/dual(args => isHttpServerResponse(args[0]), (self, name, value, options) => makeResponse({
  ...self,
  cookies: Cookies.setUnsafe(self.cookies, name, value, options)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const expireCookieUnsafe = /*#__PURE__*/dual(args => isHttpServerResponse(args[0]), (self, name, options) => makeResponse({
  ...self,
  cookies: Cookies.expireCookieUnsafe(self.cookies, name, options)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const updateCookies = /*#__PURE__*/dual(2, (self, f) => makeResponse({
  ...self,
  cookies: f(self.cookies)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const mergeCookies = /*#__PURE__*/dual(2, (self, cookies) => makeResponse({
  ...self,
  cookies: Cookies.merge(self.cookies, cookies)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setCookies = /*#__PURE__*/dual(2, (self, cookies) => Effect.map(Cookies.setAll(self.cookies, cookies).asEffect(), cookies => makeResponse({
  ...self,
  cookies
})));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setCookiesUnsafe = /*#__PURE__*/dual(2, (self, cookies) => makeResponse({
  ...self,
  cookies: Cookies.setAllUnsafe(self.cookies, cookies)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setBody = /*#__PURE__*/dual(2, (self, body) => makeResponse({
  ...self,
  body
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setStatus = /*#__PURE__*/dual(args => isHttpServerResponse(args[0]), (self, status, statusText) => makeResponse({
  ...self,
  status,
  statusText: statusText ?? self.statusText
}));
/**
 * @since 4.0.0
 * @category conversions
 */
export const toWeb = (response, options) => {
  const headers = new globalThis.Headers(response.headers);
  if (!Cookies.isEmpty(response.cookies)) {
    const toAdd = Cookies.toSetCookieHeaders(response.cookies);
    for (const header of toAdd) {
      headers.append("set-cookie", header);
    }
  }
  if (options?.withoutBody) {
    return new Response(undefined, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  const body = response.body;
  switch (body._tag) {
    case "Empty":
      {
        return new Response(undefined, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
    case "Uint8Array":
    case "Raw":
      {
        if (body.body instanceof Response) {
          for (const [key, value] of headers) {
            body.body.headers.set(key, value);
          }
          return body.body;
        }
        return new Response(body.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
    case "FormData":
      {
        return new Response(body.formData, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
    case "Stream":
      {
        return new Response(Stream.toReadableStreamWith(body.stream, options?.context ?? Context.empty()), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
  }
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toClientResponse = (response, options) => new ServerHttpClientResponse(options?.request ?? HttpClientRequest.empty, response);
class ServerHttpClientResponse extends Inspectable.Class {
  [HttpIncomingMessage.TypeId];
  [HttpClientResponse.TypeId];
  request;
  response;
  constructor(request, response) {
    super();
    this.request = request;
    this.response = response;
    this[HttpIncomingMessage.TypeId] = HttpIncomingMessage.TypeId;
    this[HttpClientResponse.TypeId] = HttpClientResponse.TypeId;
  }
  toJSON() {
    return HttpIncomingMessage.inspect(this, {
      _id: "HttpClientResponse",
      request: this.request.toJSON(),
      status: this.status
    });
  }
  get status() {
    return this.response.status;
  }
  cachedHeaders;
  get headers() {
    return this.cachedHeaders ??= this.response.body._tag === "FormData" ? Headers.merge(this.response.headers, Headers.fromInput(this.getFormDataResponse().headers)) : this.response.headers;
  }
  get cookies() {
    return this.response.cookies;
  }
  get remoteAddress() {
    return Option.none();
  }
  get stream() {
    const body = this.response.body;
    switch (body._tag) {
      case "Empty":
        {
          return Stream.empty;
        }
      case "Stream":
        {
          return Stream.mapError(body.stream, cause => this.decodeError(cause));
        }
      case "Uint8Array":
        {
          return Stream.succeed(body.body);
        }
      case "Raw":
        {
          const rawBody = body.body;
          if (rawBody instanceof Response) {
            return rawBody.body ? Stream.fromReadableStream({
              evaluate: () => rawBody.body,
              onError: cause => this.decodeError(cause)
            }) : Stream.empty;
          }
          if (isReadableStream(rawBody)) {
            return Stream.fromReadableStream({
              evaluate: () => rawBody,
              onError: cause => this.decodeError(cause)
            });
          }
          if (rawBody instanceof Blob) {
            return Stream.fromReadableStream({
              evaluate: () => rawBody.stream(),
              onError: cause => this.decodeError(cause)
            });
          }
          return Stream.unwrap(Effect.map(this.bytes, Stream.succeed));
        }
      case "FormData":
        {
          const response = this.getFormDataResponse();
          return Stream.fromReadableStream({
            evaluate: () => response.body,
            onError: cause => this.decodeError(cause)
          });
        }
    }
  }
  get json() {
    return Effect.flatMap(this.text, text => Effect.try({
      try: () => text === "" ? null : JSON.parse(text),
      catch: cause => new HttpClientError.HttpClientError({
        reason: new HttpClientError.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }));
  }
  get bytes() {
    const body = this.response.body;
    switch (body._tag) {
      case "Empty":
        {
          return Effect.succeed(new Uint8Array(0));
        }
      case "Uint8Array":
        {
          return Effect.succeed(body.body);
        }
      case "Stream":
        {
          return Stream.mkUint8Array(this.stream);
        }
      case "Raw":
        {
          const rawBody = body.body;
          if (rawBody instanceof Response) {
            return Effect.tryPromise({
              try: () => rawBody.arrayBuffer().then(buffer => new Uint8Array(buffer)),
              catch: cause => this.decodeError(cause)
            });
          }
          return Effect.tryPromise({
            try: () => new Response(rawBody).arrayBuffer().then(buffer => new Uint8Array(buffer)),
            catch: cause => this.decodeError(cause)
          });
        }
      case "FormData":
        {
          return Effect.tryPromise({
            try: () => new Response(body.formData).arrayBuffer().then(buffer => new Uint8Array(buffer)),
            catch: cause => this.decodeError(cause)
          });
        }
    }
  }
  get text() {
    return Effect.map(this.bytes, bytes => textDecoder.decode(bytes));
  }
  get urlParamsBody() {
    return Effect.flatMap(this.text, _ => Effect.try({
      try: () => UrlParams.fromInput(new URLSearchParams(_)),
      catch: cause => new HttpClientError.HttpClientError({
        reason: new HttpClientError.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }));
  }
  get formData() {
    const body = this.response.body;
    if (body._tag === "FormData") {
      return Effect.succeed(body.formData);
    }
    return Effect.contextWith(context => {
      const readableStream = Stream.toReadableStreamWith(this.stream, context);
      return Effect.tryPromise({
        try: () => new Response(readableStream, {
          headers: this.headers
        }).formData(),
        catch: cause => this.decodeError(cause)
      });
    });
  }
  get arrayBuffer() {
    return Effect.map(this.bytes, bytes => bytes.slice().buffer);
  }
  decodeError(cause) {
    return new HttpClientError.HttpClientError({
      reason: new HttpClientError.DecodeError({
        request: this.request,
        response: this,
        cause
      })
    });
  }
  formDataResponse;
  getFormDataResponse() {
    return this.formDataResponse ??= new Response(this.response.body.formData);
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
const textDecoder = /*#__PURE__*/new TextDecoder();
/**
 * @since 4.0.0
 * @category conversions
 */
export const fromClientResponse = response => {
  const headers = Headers.remove(response.headers, "set-cookie");
  return makeResponse({
    status: response.status,
    headers,
    cookies: response.cookies,
    body: Body.stream(Stream.catchIf(response.stream, isEmptyBodyError, () => Stream.empty), Option.getOrUndefined(Headers.get(headers, "content-type")), getContentLength(headers))
  });
};
const isReadableStream = u => typeof ReadableStream !== "undefined" && u instanceof ReadableStream;
const isEmptyBodyError = error => HttpClientError.isHttpClientError(error) && error.reason._tag === "EmptyBodyError";
const getContentLength = headers => {
  const contentLength = Option.getOrUndefined(Headers.get(headers, "content-length"));
  if (contentLength === undefined) {
    return undefined;
  }
  const parsed = Number(contentLength);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  [ErrorReporter.ignore]: true,
  toJSON() {
    return {
      _id: "HttpServerResponse",
      status: this.status,
      statusText: this.statusText,
      headers: redact(this.headers),
      cookies: this.cookies.toJSON(),
      body: this.body.toJSON()
    };
  }
};
const makeResponse = options => {
  const self = Object.create(Proto);
  self.status = options.status;
  self.statusText = options.statusText;
  self.cookies = options.cookies ?? Cookies.empty;
  self.body = options.body ?? Body.empty;
  if (self.body._tag !== "Empty" && (self.body.contentType || self.body.contentLength)) {
    const newHeaders = Headers.fromRecordUnsafe({
      ...options.headers
    });
    if (self.body.contentType) {
      newHeaders["content-type"] = self.body.contentType;
    }
    if (self.body.contentLength) {
      newHeaders["content-length"] = self.body.contentLength.toString();
    }
    self.headers = newHeaders;
  } else {
    self.headers = options.headers ?? Headers.empty;
  }
  return self;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const fromWeb = response => {
  const headers = new globalThis.Headers(response.headers);
  const setCookieHeaders = headers.getSetCookie();
  headers.delete("set-cookie");
  let self = empty({
    status: response.status,
    statusText: response.statusText,
    headers: headers,
    cookies: Cookies.fromSetCookie(setCookieHeaders)
  });
  if (response.body) {
    const contentType = response.headers.get("content-type");
    self = setBody(self, Body.stream(Stream.fromReadableStream({
      evaluate: () => response.body,
      onError: e => e
    }), contentType ?? undefined));
  }
  return self;
};
//# sourceMappingURL=HttpServerResponse.js.map