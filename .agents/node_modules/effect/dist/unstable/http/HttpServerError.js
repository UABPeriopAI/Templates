/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as ErrorReporter from "../../ErrorReporter.js";
import { constUndefined } from "../../Function.js";
import * as Option from "../../Option.js";
import { hasProperty } from "../../Predicate.js";
import * as Respondable from "./HttpServerRespondable.js";
import * as Response from "./HttpServerResponse.js";
const TypeId = "~effect/http/HttpServerError";
/**
 * @since 4.0.0
 * @category error
 */
export class HttpServerError extends /*#__PURE__*/Data.TaggedError("HttpServerError") {
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
  [TypeId] = TypeId;
  stack = `${this.name}: ${this.message}`;
  get request() {
    return this.reason.request;
  }
  get response() {
    return "response" in this.reason ? this.reason.response : undefined;
  }
  [Respondable.symbol]() {
    return this.reason[Respondable.symbol]();
  }
  get [ErrorReporter.ignore]() {
    return this.reason[ErrorReporter.ignore] ?? false;
  }
  get message() {
    return this.reason.message;
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class RequestParseError extends /*#__PURE__*/Data.TaggedError("RequestParseError") {
  /**
   * @since 4.0.0
   */
  [Respondable.symbol]() {
    return Effect.succeed(Response.empty({
      status: 400
    }));
  }
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  get message() {
    return formatRequestMessage(this._tag, this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class RouteNotFound extends /*#__PURE__*/Data.TaggedError("RouteNotFound") {
  [Respondable.symbol]() {
    return Effect.succeed(Response.empty({
      status: 404
    }));
  }
  [ErrorReporter.ignore] = true;
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  get message() {
    return formatRequestMessage(this._tag, this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class InternalError extends /*#__PURE__*/Data.TaggedError("InternalError") {
  /**
   * @since 4.0.0
   */
  [Respondable.symbol]() {
    return Effect.succeed(Response.empty({
      status: 500
    }));
  }
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  get message() {
    return formatRequestMessage(this._tag, this.description, this.methodAndUrl);
  }
}
/**
 * @since 4.0.0
 * @category predicates
 */
export const isHttpServerError = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category error
 */
export class ResponseError extends /*#__PURE__*/Data.TaggedError("ResponseError") {
  [Respondable.symbol]() {
    return Effect.succeed(Response.empty({
      status: 500
    }));
  }
  get methodAndUrl() {
    return `${this.request.method} ${this.request.url}`;
  }
  get message() {
    const info = `${this._tag} (${this.response.status} ${this.methodAndUrl})`;
    return this.description ? `${info}: ${this.description}` : info;
  }
}
/**
 * @since 4.0.0
 * @category error
 */
export class ServeError extends /*#__PURE__*/Data.TaggedError("ServeError") {}
/**
 * @since 4.0.0
 * @category Annotations
 */
export class ClientAbort extends /*#__PURE__*/Context.Service()("effect/http/HttpServerError/ClientAbort") {
  static annotation = /*#__PURE__*/this.context(true).pipe(/*#__PURE__*/Context.add(Cause.StackTrace, {
    name: "ClientAbort",
    stack: constUndefined,
    parent: undefined
  }));
}
const formatRequestMessage = (reason, description, info) => {
  const prefix = `${reason} (${info})`;
  return description ? `${prefix}: ${description}` : prefix;
};
/**
 * @since 4.0.0
 */
export const causeResponse = cause => {
  let response;
  let effect = succeedInternalServerError;
  const failures = [];
  let interrupts = [];
  let isClientInterrupt = false;
  for (let i = 0; i < cause.reasons.length; i++) {
    const reason = cause.reasons[i];
    switch (reason._tag) {
      case "Fail":
        {
          effect = Respondable.toResponseOrElse(reason.error, internalServerError);
          failures.push(reason);
          break;
        }
      case "Die":
        {
          if (Response.isHttpServerResponse(reason.defect)) {
            response = reason.defect;
          } else {
            effect = Respondable.toResponseOrElseDefect(reason.defect, internalServerError);
            failures.push(reason);
          }
          break;
        }
      case "Interrupt":
        {
          isClientInterrupt = reason.annotations.has(ClientAbort.key);
          if (failures.length > 0) break;
          interrupts.push(reason);
          break;
        }
    }
  }
  if (response) {
    return Effect.succeed([response, Cause.fromReasons(failures)]);
  } else if (interrupts.length > 0 && failures.length === 0) {
    failures.push(...interrupts);
    effect = isClientInterrupt ? clientAbortError : serverAbortError;
  }
  return Effect.mapEager(effect, response => {
    failures.push(Cause.makeDieReason(response));
    return [response, Cause.fromReasons(failures)];
  });
};
/**
 * @since 4.0.0
 */
export const causeResponseStripped = cause => {
  let response;
  const failures = cause.reasons.filter(f => {
    if (f._tag === "Die" && Response.isHttpServerResponse(f.defect)) {
      response = f.defect;
      return false;
    }
    return true;
  });
  return [response ?? internalServerError, failures.length > 0 ? Option.some(Cause.fromReasons(failures)) : Option.none()];
};
const internalServerError = /*#__PURE__*/Response.empty({
  status: 500
});
const succeedInternalServerError = /*#__PURE__*/Effect.succeed(internalServerError);
const clientAbortError = /*#__PURE__*/Effect.succeed(/*#__PURE__*/Response.empty({
  status: 499
}));
const serverAbortError = /*#__PURE__*/Effect.succeed(/*#__PURE__*/Response.empty({
  status: 503
}));
/**
 * @since 4.0.0
 */
export const exitResponse = exit => {
  if (exit._tag === "Success") {
    return exit.value;
  }
  return causeResponseStripped(exit.cause)[0];
};
//# sourceMappingURL=HttpServerError.js.map