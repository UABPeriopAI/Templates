/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import { identity } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as AST from "../../SchemaAST.js";
import * as Issue from "../../SchemaIssue.js";
import * as Transformation from "../../SchemaTransformation.js";
import * as UndefinedOr from "../../UndefinedOr.js";
import * as HttpBody from "../http/HttpBody.js";
import * as HttpClient from "../http/HttpClient.js";
import * as HttpClientError from "../http/HttpClientError.js";
import * as HttpClientRequest from "../http/HttpClientRequest.js";
import * as HttpClientResponse from "../http/HttpClientResponse.js";
import * as HttpMethod from "../http/HttpMethod.js";
import * as UrlParams from "../http/UrlParams.js";
import * as HttpApi from "./HttpApi.js";
import * as HttpApiEndpoint from "./HttpApiEndpoint.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
const makeClient = (api, options) => Effect.gen(function* () {
  const services = yield* Effect.context();
  const httpClient = options.httpClient.pipe(options?.baseUrl === undefined ? identity : HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseUrl.toString())));
  function executeMiddleware(group, endpoint, request, middlewareKeys, index) {
    if (index === -1) {
      return httpClient.execute(request);
    }
    const middleware = services.mapUnsafe.get(middlewareKeys[index]);
    if (middleware === undefined) {
      return executeMiddleware(group, endpoint, request, middlewareKeys, index - 1);
    }
    return middleware({
      endpoint,
      group,
      request,
      next(request) {
        return executeMiddleware(group, endpoint, request, middlewareKeys, index - 1);
      }
    });
  }
  HttpApi.reflect(api, {
    predicate: options?.predicate,
    onGroup(onGroupOptions) {
      options.onGroup?.(onGroupOptions);
    },
    onEndpoint(onEndpointOptions) {
      const {
        group,
        endpoint,
        errors,
        successes
      } = onEndpointOptions;
      const makeUrl = compilePath(endpoint.path);
      const decodeMap = {
        orElse: statusOrElse
      };
      const decodeResponse = HttpClientResponse.matchStatus(decodeMap);
      errors.forEach((schemas, status) => {
        // decoders
        const decode = schemasToResponse(schemas);
        decodeMap[status] = response => Effect.flatMap(Effect.catchCause(decode(response), cause => Effect.failCause(Cause.combine(Cause.fail(new HttpClientError.HttpClientError({
          reason: new HttpClientError.StatusCodeError({
            request: response.request,
            response
          })
        })), cause))), Effect.fail);
      });
      successes.forEach((schemas, status) => {
        decodeMap[status] = schemasToResponse(schemas);
      });
      // encoders
      const encodeParams = UndefinedOr.map(endpoint.params, Schema.encodeUnknownEffect);
      const payloadSchemas = HttpApiEndpoint.getPayloadSchemas(endpoint);
      const encodePayload = Arr.isArrayNonEmpty(payloadSchemas) ? HttpMethod.hasBody(endpoint.method) ? Schema.encodeUnknownEffect(getEncodePayloadSchema(payloadSchemas, endpoint.method)) : Schema.encodeUnknownEffect(Schema.Union(payloadSchemas)) : undefined;
      const encodeHeaders = UndefinedOr.map(endpoint.headers, Schema.encodeUnknownEffect);
      const encodeQuery = UndefinedOr.map(endpoint.query, Schema.encodeUnknownEffect);
      const middlewareKeys = Array.from(onEndpointOptions.middleware, tag => `${tag.key}/Client`);
      const endpointFn = Effect.fnUntraced(function* (request) {
        let httpRequest = HttpClientRequest.make(endpoint.method)(endpoint.path);
        if (request !== undefined) {
          // params
          if (encodeParams !== undefined) {
            const params = yield* encodeParams(request.params);
            httpRequest = HttpClientRequest.setUrl(httpRequest, makeUrl(params));
          }
          // payload
          if (encodePayload !== undefined) {
            if (HttpMethod.hasBody(endpoint.method)) {
              if (request.payload instanceof FormData) {
                httpRequest = HttpClientRequest.bodyFormData(httpRequest, request.payload);
              } else {
                const body = yield* encodePayload(request.payload);
                httpRequest = HttpClientRequest.setBody(httpRequest, body);
              }
            } else {
              const urlParams = yield* encodePayload(request.payload);
              httpRequest = HttpClientRequest.appendUrlParams(httpRequest, urlParams);
            }
          }
          // headers
          if (encodeHeaders !== undefined) {
            const headers = yield* encodeHeaders(request.headers);
            httpRequest = HttpClientRequest.setHeaders(httpRequest, headers);
          }
          // query
          if (encodeQuery !== undefined) {
            const query = yield* encodeQuery(request.query);
            httpRequest = HttpClientRequest.appendUrlParams(httpRequest, query);
          }
        }
        const response = yield* executeMiddleware(group, endpoint, httpRequest, middlewareKeys, middlewareKeys.length - 1);
        if (request?.responseMode === "response-only") {
          return response;
        }
        const value = yield* options.transformResponse === undefined ? decodeResponse(response) : options.transformResponse(decodeResponse(response));
        return request?.responseMode === "decoded-and-response" ? [value, response] : value;
      });
      options.onEndpoint({
        ...onEndpointOptions,
        endpointFn
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = (api, options) => Effect.flatMap(HttpClient.HttpClient.asEffect(), httpClient => makeWith(api, {
  ...options,
  httpClient: options?.transformClient ? options.transformClient(httpClient) : httpClient
}));
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeWith = (api, options) => {
  const client = {};
  return makeClient(api, {
    ...options,
    onGroup({
      group
    }) {
      if (group.topLevel) return;
      client[group.identifier] = {};
    },
    onEndpoint({
      endpoint,
      endpointFn,
      group
    }) {
      ;
      (group.topLevel ? client : client[group.identifier])[endpoint.name] = endpointFn;
    }
  }).pipe(Effect.as(client));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const group = (api, options) => {
  const client = {};
  return makeClient(api, {
    ...options,
    predicate: ({
      group
    }) => group.identifier === options.group,
    onEndpoint({
      endpoint,
      endpointFn
    }) {
      client[endpoint.name] = endpointFn;
    }
  }).pipe(Effect.map(() => client));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const endpoint = (api, options) => {
  let client = undefined;
  return makeClient(api, {
    ...options,
    predicate: ({
      endpoint,
      group
    }) => group.identifier === options.group && endpoint.name === options.endpoint,
    onEndpoint({
      endpointFn
    }) {
      client = endpointFn;
    }
  }).pipe(Effect.map(() => client));
};
/**
 * Creates a type-safe URL builder that mirrors `HttpApiClient.make`.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { HttpApi, HttpApiClient, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi"
 *
 * const Api = HttpApi.make("Api").add(
 *   HttpApiGroup.make("users").add(
 *     HttpApiEndpoint.get("getUser", "/users/:id", {
 *       params: { id: Schema.String }
 *     })
 *   )
 * )
 *
 * const buildUrl = HttpApiClient.urlBuilder(Api, {
 *   baseUrl: "https://api.example.com"
 * })
 *
 * buildUrl.users.getUser({
 *   params: { id: "123" }
 * })
 * //=> "https://api.example.com/users/123"
 * ```
 * @since 4.0.0
 * @category constructors
 */
export const urlBuilder = (api, options) => {
  const builder = {};
  HttpApi.reflect(api, {
    onGroup({
      group
    }) {
      if (group.topLevel) return;
      builder[group.identifier] = {};
    },
    onEndpoint({
      group,
      endpoint
    }) {
      const makeUrl = compilePath(endpoint.path);
      const encodeParams = endpoint.params === undefined ? undefined : Schema.encodeSync(endpoint.params);
      const encodeQuery = endpoint.query === undefined ? undefined : Schema.encodeSync(endpoint.query);
      const endpointBuilder = request => {
        const params = request?.params;
        const path = params === undefined ? endpoint.path : makeUrl(encodeParams === undefined ? params : encodeParams(params));
        const queryInput = request?.query === undefined ? undefined : encodeQuery === undefined ? request.query : encodeQuery(request.query);
        const query = queryInput === undefined ? "" : UrlParams.toString(UrlParams.fromInput(queryInput));
        const url = query === "" ? path : `${path}?${query}`;
        return options?.baseUrl === undefined ? url : new URL(url, options.baseUrl.toString()).toString();
      };
      (group.topLevel ? builder : builder[group.identifier])[endpoint.name] = endpointBuilder;
    }
  });
  return builder;
};
// ----------------------------------------------------------------------------
const paramsRegExp = /:(\w+)\??/g;
const compilePath = path => {
  const segments = path.split(paramsRegExp);
  const len = segments.length;
  if (len === 1) {
    return _ => path;
  }
  return params => {
    let url = segments[0];
    for (let i = 1; i < len; i++) {
      if (i % 2 === 0) {
        url += segments[i];
      } else {
        url += params[segments[i]];
      }
    }
    return url;
  };
};
function schemasToResponse(schemas) {
  const codec = toCodecArrayBuffer(schemas);
  const decode = Schema.decodeEffect(codec);
  return response => Effect.flatMap(response.arrayBuffer, decode);
}
const ArrayBuffer = /*#__PURE__*/Schema.instanceOf(globalThis.ArrayBuffer, {
  expected: "ArrayBuffer"
});
// _tag: Uint8Array
const Uint8ArrayFromArrayBuffer = /*#__PURE__*/ArrayBuffer.pipe(/*#__PURE__*/Schema.decodeTo(Schema.Uint8Array, /*#__PURE__*/Transformation.transform({
  decode(fromA) {
    return new Uint8Array(fromA);
  },
  encode(arr) {
    return arr.byteLength === arr.buffer.byteLength ? arr.buffer : arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
  }
})));
// _tag: Text
const StringFromArrayBuffer = /*#__PURE__*/ArrayBuffer.pipe(/*#__PURE__*/Schema.decodeTo(Schema.String, /*#__PURE__*/Transformation.transform({
  decode(fromA) {
    return new TextDecoder().decode(fromA);
  },
  encode(toI) {
    const arr = new TextEncoder().encode(toI);
    return arr.byteLength === arr.buffer.byteLength ? arr.buffer : arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
  }
})));
// _tag: Json
const UnknownFromArrayBuffer = /*#__PURE__*/StringFromArrayBuffer.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.Union([
/*#__PURE__*/
// Handle No Content
Schema.Literal("").pipe(/*#__PURE__*/Schema.decodeTo(Schema.Undefined, /*#__PURE__*/Transformation.transform({
  decode: () => undefined,
  encode: () => ""
}))), Schema.UnknownFromJsonString])));
function toCodecArrayBuffer(schemas) {
  return Schema.Union(schemas.map(onSchema));
  function onSchema(schema) {
    const encoding = HttpApiSchema.getResponseEncoding(schema.ast);
    switch (encoding._tag) {
      case "Json":
        {
          // handle json codecs that transform void schemas to null
          const encodedIsNull = AST.isNull(AST.toEncoded(schema.ast));
          return UnknownFromArrayBuffer.pipe(Schema.decodeTo(schema, encodedIsNull ? Transformation.transform({
            decode: a => a === undefined ? null : a,
            encode: a => a === null ? undefined : a
          }) : undefined));
        }
      case "FormUrlEncoded":
        return StringFromArrayBuffer.pipe(Schema.decodeTo(UrlParams.schemaRecord), Schema.decodeTo(schema));
      case "Uint8Array":
        return Uint8ArrayFromArrayBuffer.pipe(Schema.decodeTo(schema));
      case "Text":
        return StringFromArrayBuffer.pipe(Schema.decodeTo(schema));
    }
  }
}
const statusOrElse = response => Effect.fail(new HttpClientError.HttpClientError({
  reason: new HttpClientError.DecodeError({
    request: response.request,
    response
  })
}));
const $HttpBody = /*#__PURE__*/Schema.declare(HttpBody.isHttpBody);
function getEncodePayloadSchema(schemas, method) {
  return Schema.Union(schemas.map(s => getEncodePayloadSchemaFromBody(s, method)));
}
const bodyFromPayloadCache = /*#__PURE__*/new WeakMap();
function getEncodePayloadSchemaFromBody(schema, method) {
  const ast = schema.ast;
  const cached = bodyFromPayloadCache.get(ast);
  if (cached !== undefined) {
    return cached;
  }
  const encoding = HttpApiSchema.getPayloadEncoding(ast, method);
  const out = $HttpBody.pipe(Schema.decodeTo(schema, Transformation.transformOrFail({
    decode(httpBody) {
      return Effect.fail(new Issue.Forbidden(Option.some(httpBody), {
        message: "Encode only schema"
      }));
    },
    encode(t) {
      switch (encoding._tag) {
        case "Multipart":
          return Effect.fail(new Issue.Forbidden(Option.some(t), {
            message: "Payload must be a FormData"
          }));
        case "Json":
          {
            try {
              const body = JSON.stringify(t);
              return Effect.succeed(HttpBody.text(body, encoding.contentType));
            } catch (error) {
              return Effect.fail(new Issue.InvalidValue(Option.some(t), {
                message: globalThis.String(error)
              }));
            }
          }
        case "Text":
          {
            if (typeof t !== "string") {
              return Effect.fail(new Issue.InvalidValue(Option.some(t), {
                message: "Expected a string"
              }));
            }
            return Effect.succeed(HttpBody.text(t, encoding.contentType));
          }
        case "FormUrlEncoded":
          {
            if (!Predicate.isObject(t)) {
              return Effect.fail(new Issue.InvalidValue(Option.some(t), {
                message: "Expected a record"
              }));
            }
            return Effect.succeed(HttpBody.urlParams(UrlParams.fromInput(t)));
          }
        case "Uint8Array":
          {
            if (!(t instanceof Uint8Array)) {
              return Effect.fail(new Issue.InvalidValue(Option.some(t), {
                message: "Expected a Uint8Array"
              }));
            }
            return Effect.succeed(HttpBody.uint8Array(t, encoding.contentType));
          }
      }
    }
  })));
  bodyFromPayloadCache.set(ast, out);
  return out;
}
//# sourceMappingURL=HttpApiClient.js.map