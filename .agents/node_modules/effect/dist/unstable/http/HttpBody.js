/**
 * @since 4.0.0
 */
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as FileSystem from "../../FileSystem.js";
import { format } from "../../Formatter.js";
import * as Inspectable from "../../Inspectable.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Parser from "../../SchemaParser.js";
import * as UrlParams from "./UrlParams.js";
const TypeId = "~effect/http/HttpBody";
/**
 * @since 4.0.0
 * @category refinements
 */
export const isHttpBody = u => Predicate.hasProperty(u, TypeId);
const HttpBodyErrorTypeId = "~effect/http/HttpBody/HttpBodyError";
/**
 * @since 4.0.0
 * @category errors
 */
export class HttpBodyError extends /*#__PURE__*/Data.TaggedError("HttpBodyError") {
  /**
   * @since 4.0.0
   */
  [HttpBodyErrorTypeId] = HttpBodyErrorTypeId;
}
class Proto {
  [TypeId];
  constructor() {
    this[TypeId] = TypeId;
  }
  [Inspectable.NodeInspectSymbol]() {
    return this.toJSON();
  }
  toString() {
    return format(this, {
      ignoreToString: true
    });
  }
}
/**
 * @since 4.0.0
 * @category models
 */
export class Empty extends Proto {
  _tag = "Empty";
  toJSON() {
    return {
      _id: "effect/HttpBody",
      _tag: "Empty"
    };
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/new Empty();
/**
 * @since 4.0.0
 * @category models
 */
export class Raw extends Proto {
  _tag = "Raw";
  body;
  contentType;
  contentLength;
  constructor(body, contentType, contentLength) {
    super();
    this.body = body;
    this.contentType = contentType;
    this.contentLength = contentLength;
  }
  toJSON() {
    return {
      _id: "effect/HttpBody",
      _tag: "Raw",
      body: this.body,
      contentType: this.contentType,
      contentLength: this.contentLength
    };
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const raw = (body, options) => new Raw(body, options?.contentType, options?.contentLength);
/**
 * @since 4.0.0
 * @category models
 */
export class Uint8Array extends Proto {
  _tag = "Uint8Array";
  body;
  contentType;
  contentLength;
  constructor(body, contentType, contentLength) {
    super();
    this.body = body;
    this.contentType = contentType;
    this.contentLength = contentLength;
  }
  toJSON() {
    const toString = this.contentType.startsWith("text/") || this.contentType.endsWith("json");
    return {
      _id: "effect/HttpBody",
      _tag: "Uint8Array",
      body: toString ? new TextDecoder().decode(this.body) : `Uint8Array(${this.body.length})`,
      contentType: this.contentType,
      contentLength: this.contentLength
    };
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const uint8Array = (body, contentType) => new Uint8Array(body, contentType ?? "application/octet-stream", body.length);
const encoder = /*#__PURE__*/new TextEncoder();
/**
 * @since 4.0.0
 * @category constructors
 */
export const text = (body, contentType) => uint8Array(encoder.encode(body), contentType ?? "text/plain");
/**
 * @since 4.0.0
 * @category constructors
 */
export const jsonUnsafe = (body, contentType) => text(JSON.stringify(body), contentType ?? "application/json");
/**
 * @since 4.0.0
 * @category constructors
 */
export const json = (body, contentType) => Effect.try({
  try: () => text(JSON.stringify(body), contentType ?? "application/json"),
  catch: cause => new HttpBodyError({
    reason: {
      _tag: "JsonError"
    },
    cause
  })
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const jsonSchema = (schema, options) => {
  const encode = Parser.encodeUnknownEffect(Schema.toCodecJson(schema));
  return (body, contentType) => encode(body, options).pipe(Effect.mapError(issue => new HttpBodyError({
    reason: {
      _tag: "SchemaError",
      issue
    },
    cause: issue
  })), Effect.flatMap(body => json(body, contentType)));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const urlParams = (urlParams, contentType) => text(UrlParams.toString(urlParams), contentType ?? "application/x-www-form-urlencoded");
/**
 * @since 4.0.0
 * @category models
 */
export class FormData extends Proto {
  _tag = "FormData";
  contentType = undefined;
  contentLength = undefined;
  formData;
  constructor(formData) {
    super();
    this.formData = formData;
  }
  toJSON() {
    return {
      _id: "effect/HttpBody",
      _tag: "FormData",
      formData: this.formData
    };
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const formData = body => new FormData(body);
const appendFormDataValue = (formData, key, value) => {
  if (value == null) {
    return;
  }
  if (typeof value === "object") {
    formData.append(key, value);
    return;
  }
  formData.append(key, String(value));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const formDataRecord = entries => {
  const data = new globalThis.FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        appendFormDataValue(data, key, item);
      }
    } else {
      appendFormDataValue(data, key, value);
    }
  }
  return formData(data);
};
/**
 * @since 4.0.0
 * @category models
 */
export class Stream extends Proto {
  _tag = "Stream";
  stream;
  contentType;
  contentLength;
  constructor(stream, contentType, contentLength) {
    super();
    this.stream = stream;
    this.contentType = contentType;
    this.contentLength = contentLength;
  }
  toJSON() {
    return {
      _id: "effect/HttpBody",
      _tag: "Stream",
      contentType: this.contentType,
      contentLength: this.contentLength
    };
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const stream = (body, contentType, contentLength) => new Stream(body, contentType ?? "application/octet-stream", contentLength);
/**
 * @since 4.0.0
 * @category constructors
 */
export const file = (path, options) => Effect.flatMap(FileSystem.FileSystem.asEffect(), fs => Effect.map(fs.stat(path), info => stream(fs.stream(path, options), options?.contentType, Number(info.size))));
/**
 * @since 4.0.0
 * @category constructors
 */
export const fileFromInfo = (path, info, options) => Effect.map(FileSystem.FileSystem.asEffect(), fs => stream(fs.stream(path, options), options?.contentType, Number(info.size)));
//# sourceMappingURL=HttpBody.js.map