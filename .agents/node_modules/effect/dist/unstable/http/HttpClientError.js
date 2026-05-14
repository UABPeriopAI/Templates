/**
 * @since 4.0.0
 */
import * as Data from "../../Data.js";
import { hasProperty } from "../../Predicate.js";
import * as Schema from "../../Schema.js";
const TypeId = "~effect/http/HttpClientError";
/**
 * @since 4.0.0
 * @category guards
 */
export const isHttpClientError = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category error
 */
export class HttpClientError extends /*#__PURE__*/Data.TaggedError("HttpClientError") {
  constructor(props) {
    if ("cause" in props.reason) {
      super({
        ...props,
        cause: props.reason.cause
      });
    } else {
      super(props);
    }
  }
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  get request() {
    return this.reason.request;
  }
  /**
   * @since 4.0.0
   */
  get response() {
    return "response" in this.reason ? this.reason.response : undefined;
  }
  get message() {
    return this.reason.message;
  }
}
const formatReason = tag => tag.endsWith("Error") ? tag.slice(0, -5) : tag;
const formatMessage = (reason, description, info) => description ? `${reason}: ${description} (${info})` : `${reason} error (${info})`;
/**
 * @since 4.0.0
 * @category error
 */
export class TransportError extends /*#__PURE__*/Data.TaggedError("TransportError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    return formatMessage(formatReason(this._tag), this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class EncodeError extends /*#__PURE__*/Data.TaggedError("EncodeError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    return formatMessage(formatReason(this._tag), this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class InvalidUrlError extends /*#__PURE__*/Data.TaggedError("InvalidUrlError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    return formatMessage(formatReason(this._tag), this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class StatusCodeError extends /*#__PURE__*/Data.TaggedError("StatusCodeError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    const info = `${this.response.status} ${this.methodAndUrl}`;
    return formatMessage(formatReason(this._tag), this.description, info);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class DecodeError extends /*#__PURE__*/Data.TaggedError("DecodeError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    const info = `${this.response.status} ${this.methodAndUrl}`;
    return formatMessage(formatReason(this._tag), this.description, info);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class EmptyBodyError extends /*#__PURE__*/Data.TaggedError("EmptyBodyError") {
  /**
   * @since 4.0.0
   */
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  /**
   * @since 4.0.0
   */
  get message() {
    const info = `${this.response.status} ${this.methodAndUrl}`;
    return formatMessage(formatReason(this._tag), this.description, info);
  }
}
/**
 * @since 4.0.0
 * @category Schema
 */
export class HttpClientErrorSchema extends /*#__PURE__*/Schema.ErrorClass(TypeId)({
  _tag: /*#__PURE__*/Schema.tag("HttpError"),
  kind: /*#__PURE__*/Schema.Literals(["EncodeError", "DecodeError", "TransportError", "InvalidUrlError", "StatusCodeError", "EmptyBodyError"]),
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {
  /**
   * @since 4.0.0
   */
  static fromHttpClientError(error) {
    return new HttpClientErrorSchema({
      _tag: "HttpError",
      kind: error.reason._tag,
      cause: error.reason
    });
  }
}
//# sourceMappingURL=HttpClientError.js.map