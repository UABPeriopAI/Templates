/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Schema from "../../Schema.js";
import * as Stream from "../../Stream.js";
import * as Cookies from "./Cookies.js";
import * as Headers from "./Headers.js";
import * as Error from "./HttpClientError.js";
import * as HttpIncomingMessage from "./HttpIncomingMessage.js";
import * as UrlParams from "./UrlParams.js";
export {
/**
 * @since 4.0.0
 * @category schema
 */
schemaBodyJson,
/**
 * @since 4.0.0
 * @category schema
 */
schemaBodyUrlParams,
/**
 * @since 4.0.0
 * @category schema
 */
schemaHeaders } from "./HttpIncomingMessage.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/http/HttpClientResponse";
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromWeb = (request, source) => new WebHttpClientResponse(request, source);
/**
 * @since 4.0.0
 * @category schema
 */
export const schemaJson = (schema, options) => {
  const decode = Schema.decodeEffect(Schema.toCodecJson(schema).annotate({
    options
  }));
  return self => Effect.flatMap(self.json, body => decode({
    status: self.status,
    headers: self.headers,
    body
  }));
};
/**
 * @since 4.0.0
 * @category schema
 */
export const schemaNoBody = (schema, options) => {
  const decode = Schema.decodeEffect(schema.annotate({
    options
  }));
  return self => decode({
    status: self.status,
    headers: self.headers
  });
};
/**
 * @since 4.0.0
 * @category accessors
 */
export const stream = effect => Stream.unwrap(Effect.map(effect, self => self.stream));
/**
 * @since 4.0.0
 * @category pattern matching
 */
export const matchStatus = /*#__PURE__*/dual(2, (self, cases) => {
  const status = self.status;
  if (cases[status]) {
    return cases[status](self);
  } else if (status >= 200 && status < 300 && cases["2xx"]) {
    return cases["2xx"](self);
  } else if (status >= 300 && status < 400 && cases["3xx"]) {
    return cases["3xx"](self);
  } else if (status >= 400 && status < 500 && cases["4xx"]) {
    return cases["4xx"](self);
  } else if (status >= 500 && status < 600 && cases["5xx"]) {
    return cases["5xx"](self);
  }
  return cases.orElse(self);
});
/**
 * @since 4.0.0
 * @category filters
 */
export const filterStatus = /*#__PURE__*/dual(2, (self, f) => Effect.suspend(() => f(self.status) ? Effect.succeed(self) : Effect.fail(new Error.HttpClientError({
  reason: new Error.StatusCodeError({
    response: self,
    request: self.request,
    description: "invalid status code"
  })
}))));
/**
 * @since 4.0.0
 * @category filters
 */
export const filterStatusOk = self => self.status >= 200 && self.status < 300 ? Effect.succeed(self) : Effect.fail(new Error.HttpClientError({
  reason: new Error.StatusCodeError({
    response: self,
    request: self.request,
    description: "non 2xx status code"
  })
}));
// -----------------------------------------------------------------------------
// internal
// -----------------------------------------------------------------------------
class WebHttpClientResponse extends Inspectable.Class {
  [HttpIncomingMessage.TypeId];
  [TypeId];
  request;
  source;
  constructor(request, source) {
    super();
    this.request = request;
    this.source = source;
    this[HttpIncomingMessage.TypeId] = HttpIncomingMessage.TypeId;
    this[TypeId] = TypeId;
  }
  toJSON() {
    return HttpIncomingMessage.inspect(this, {
      _id: "HttpClientResponse",
      request: this.request.toJSON(),
      status: this.status
    });
  }
  get status() {
    return this.source.status;
  }
  get headers() {
    return Headers.fromInput(this.source.headers);
  }
  cachedCookies;
  get cookies() {
    if (this.cachedCookies) {
      return this.cachedCookies;
    }
    return this.cachedCookies = Cookies.fromSetCookie(this.source.headers.getSetCookie());
  }
  get remoteAddress() {
    return Option.none();
  }
  get stream() {
    return this.source.body ? Stream.fromReadableStream({
      evaluate: () => this.source.body,
      onError: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }) : Stream.fail(new Error.HttpClientError({
      reason: new Error.EmptyBodyError({
        request: this.request,
        response: this,
        description: "can not create stream from empty body"
      })
    }));
  }
  get json() {
    return Effect.flatMap(this.text, text => Effect.try({
      try: () => text === "" ? null : JSON.parse(text),
      catch: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }));
  }
  textBody;
  get text() {
    return this.textBody ??= Effect.tryPromise({
      try: () => this.source.text(),
      catch: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }).pipe(Effect.cached, Effect.runSync);
  }
  get urlParamsBody() {
    return Effect.flatMap(this.text, _ => Effect.try({
      try: () => UrlParams.fromInput(new URLSearchParams(_)),
      catch: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }));
  }
  formDataBody;
  get formData() {
    return this.formDataBody ??= Effect.tryPromise({
      try: () => this.source.formData(),
      catch: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }).pipe(Effect.cached, Effect.runSync);
  }
  arrayBufferBody;
  get arrayBuffer() {
    return this.arrayBufferBody ??= Effect.tryPromise({
      try: () => this.source.arrayBuffer(),
      catch: cause => new Error.HttpClientError({
        reason: new Error.DecodeError({
          request: this.request,
          response: this,
          cause
        })
      })
    }).pipe(Effect.cached, Effect.runSync);
  }
  pipe() {
    return pipeArguments(this, arguments);
  }
}
//# sourceMappingURL=HttpClientResponse.js.map