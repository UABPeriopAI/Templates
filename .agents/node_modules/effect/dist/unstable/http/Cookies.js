/**
 * @since 4.0.0
 */
import * as Data from "../../Data.js";
import * as Duration from "../../Duration.js";
import { dual } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Record from "../../Record.js";
import * as Result from "../../Result.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
const TypeId = "~effect/http/Cookies";
/**
 * @since 4.0.0
 * @category refinements
 */
export const isCookies = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category Schemas
 */
export const CookiesSchema = /*#__PURE__*/Schema.declare(isCookies, {
  typeConstructor: {
    _tag: "effect/http/Cookies"
  },
  generation: {
    runtime: `Cookies.CookiesSchema`,
    Type: `Cookies.Cookies`,
    Encoded: `typeof Cookies.CookiesSchema["Encoded"]`,
    importDeclaration: `import * as Cookies from "effect/unstable/http/Cookies"`
  },
  expected: "Cookies",
  toCodecJson: () => Schema.link()(Schema.Array(Schema.String), Transformation.transform({
    decode: input => fromSetCookie(input),
    encode: cookies => toSetCookieHeaders(cookies)
  })),
  toCodecIso: () => Schema.link()(Schema.Record(Schema.String, CookieSchema), Transformation.transform({
    decode: input => fromReadonlyRecord(input),
    encode: cookies => cookies.cookies
  }))
});
const CookieTypeId = "~effect/http/Cookies/Cookie";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isCookie = u => Predicate.hasProperty(u, CookieTypeId);
/**
 * @since 4.0.0
 * @category Schemas
 */
export const CookieSchema = /*#__PURE__*/Schema.declare(isCookie, {
  typeConstructor: {
    _tag: "effect/http/Cookie"
  },
  generation: {
    runtime: `Cookies.CookieSchema`,
    Type: `Cookies.Cookie`,
    importDeclaration: `import * as Cookie from "effect/unstable/http/Cookies"`
  },
  expected: "Cookie"
});
const CookieErrorTypeId = "~effect/http/Cookies/CookieError";
/**
 * @since 4.0.0
 * @category errors
 */
export class CookiesErrorReason extends Data.Error {}
/**
 * @since 4.0.0
 * @category errors
 */
export class CookiesError extends /*#__PURE__*/Data.TaggedError("CookieError") {
  /**
   * @since 4.0.0
   */
  static fromReason(reason, cause) {
    return new CookiesError({
      reason: new CookiesErrorReason({
        _tag: reason,
        cause
      })
    });
  }
  /**
   * @since 4.0.0
   */
  [CookieErrorTypeId] = CookieErrorTypeId;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.reason._tag;
  }
}
const Proto = {
  [TypeId]: TypeId,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: "effect/Cookies",
      cookies: Record.map(this.cookies, cookie => cookie.toJSON())
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Create a Cookies object from an Iterable
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromReadonlyRecord = cookies => {
  const self = Object.create(Proto);
  self.cookies = cookies;
  return self;
};
/**
 * Create a Cookies object from an Iterable
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromIterable = cookies => {
  const record = {};
  for (const cookie of cookies) {
    record[cookie.name] = cookie;
  }
  return fromReadonlyRecord(record);
};
/**
 * Create a Cookies object from a set of Set-Cookie headers
 *
 * @since 4.0.0
 * @category constructors
 */
export const fromSetCookie = headers => {
  const arrayHeaders = typeof headers === "string" ? [headers] : headers;
  const cookies = [];
  for (const header of arrayHeaders) {
    const cookie = parseSetCookie(header.trim());
    if (cookie) {
      cookies.push(cookie);
    }
  }
  return fromIterable(cookies);
};
function parseSetCookie(header) {
  const parts = header.split(";").map(_ => _.trim()).filter(_ => _ !== "");
  if (parts.length === 0) {
    return undefined;
  }
  const firstEqual = parts[0].indexOf("=");
  if (firstEqual === -1) {
    return undefined;
  }
  const name = parts[0].slice(0, firstEqual);
  if (!fieldContentRegExp.test(name)) {
    return undefined;
  }
  const valueEncoded = parts[0].slice(firstEqual + 1);
  const value = tryDecodeURIComponent(valueEncoded);
  if (parts.length === 1) {
    return Object.assign(Object.create(CookieProto), {
      name,
      value,
      valueEncoded
    });
  }
  const options = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const equalIndex = part.indexOf("=");
    const key = equalIndex === -1 ? part : part.slice(0, equalIndex).trim();
    const value = equalIndex === -1 ? undefined : part.slice(equalIndex + 1).trim();
    switch (key.toLowerCase()) {
      case "domain":
        {
          if (value === undefined) {
            break;
          }
          const domain = value.trim().replace(/^\./, "");
          if (domain) {
            options.domain = domain;
          }
          break;
        }
      case "expires":
        {
          if (value === undefined) {
            break;
          }
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            options.expires = date;
          }
          break;
        }
      case "max-age":
        {
          if (value === undefined) {
            break;
          }
          const maxAge = parseInt(value, 10);
          if (!isNaN(maxAge)) {
            options.maxAge = Duration.seconds(maxAge);
          }
          break;
        }
      case "path":
        {
          if (value === undefined) {
            break;
          }
          if (value[0] === "/") {
            options.path = value;
          }
          break;
        }
      case "priority":
        {
          if (value === undefined) {
            break;
          }
          switch (value.toLowerCase()) {
            case "low":
              options.priority = "low";
              break;
            case "medium":
              options.priority = "medium";
              break;
            case "high":
              options.priority = "high";
              break;
          }
          break;
        }
      case "httponly":
        {
          options.httpOnly = true;
          break;
        }
      case "secure":
        {
          options.secure = true;
          break;
        }
      case "partitioned":
        {
          options.partitioned = true;
          break;
        }
      case "samesite":
        {
          if (value === undefined) {
            break;
          }
          switch (value.toLowerCase()) {
            case "lax":
              options.sameSite = "lax";
              break;
            case "strict":
              options.sameSite = "strict";
              break;
            case "none":
              options.sameSite = "none";
              break;
          }
          break;
        }
    }
  }
  return Object.assign(Object.create(CookieProto), {
    name,
    value,
    valueEncoded,
    options: Object.keys(options).length > 0 ? options : undefined
  });
}
/**
 * An empty Cookies object
 *
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/fromIterable([]);
/**
 * @since 4.0.0
 * @category refinements
 */
export const isEmpty = self => Record.isEmptyRecord(self.cookies);
// oxlint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
const CookieProto = {
  [CookieTypeId]: CookieTypeId,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: "effect/Cookies/Cookie",
      name: this.name,
      value: this.value,
      options: this.options
    };
  }
};
/**
 * Create a new cookie
 *
 * @since 4.0.0
 * @category constructors
 */
export function makeCookie(name, value, options) {
  if (!fieldContentRegExp.test(name)) {
    return Result.fail(CookiesError.fromReason("InvalidCookieName"));
  }
  const encodedValue = encodeURIComponent(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    return Result.fail(CookiesError.fromReason("InvalidCookieValue"));
  }
  if (options !== undefined) {
    if (options.domain !== undefined && !fieldContentRegExp.test(options.domain)) {
      return Result.fail(CookiesError.fromReason("InvalidCookieDomain"));
    }
    if (options.path !== undefined && !fieldContentRegExp.test(options.path)) {
      return Result.fail(CookiesError.fromReason("InvalidCookiePath"));
    }
    if (options.maxAge !== undefined && !Duration.isFinite(Duration.fromInputUnsafe(options.maxAge))) {
      return Result.fail(CookiesError.fromReason("CookieInfinityMaxAge"));
    }
  }
  return Result.succeed(Object.assign(Object.create(CookieProto), {
    name,
    value,
    valueEncoded: encodedValue,
    options
  }));
}
/**
 * Create a new cookie, throwing an error if invalid
 *
 * @since 4.0.0
 * @category constructors
 */
export const makeCookieUnsafe = (name, value, options) => Result.getOrThrow(makeCookie(name, value, options));
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const setCookie = /*#__PURE__*/dual(2, (self, cookie) => fromReadonlyRecord(Record.set(self.cookies, cookie.name, cookie)));
/**
 * Add multiple cookies to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const setAllCookie = /*#__PURE__*/dual(2, (self, cookies) => {
  const record = {
    ...self.cookies
  };
  for (const cookie of cookies) {
    record[cookie.name] = cookie;
  }
  return fromReadonlyRecord(record);
});
/**
 * Combine two Cookies objects, removing duplicates from the first
 *
 * @since 4.0.0
 * @category combinators
 */
export const merge = /*#__PURE__*/dual(2, (self, that) => fromReadonlyRecord({
  ...self.cookies,
  ...that.cookies
}));
/**
 * Remove a cookie by name
 *
 * @since 4.0.0
 * @category combinators
 */
export const remove = /*#__PURE__*/dual(2, (self, name) => fromReadonlyRecord(Record.remove(self.cookies, name)));
/**
 * Get a cookie from a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const get = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name) => Option.fromUndefinedOr(self.cookies[name]));
/**
 * Get a cookie from a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const getValue = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name) => Option.map(get(self, name), cookie => cookie.value));
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const set = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name, value, options) => Result.map(makeCookie(name, value, options), cookie => fromReadonlyRecord(Record.set(self.cookies, name, cookie))));
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const setUnsafe = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name, value, options) => fromReadonlyRecord(Record.set(self.cookies, name, makeCookieUnsafe(name, value, options))));
/**
 * Add an expired cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const expireCookie = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name, options) => set(self, name, "", {
  ...options,
  maxAge: 0,
  expires: new Date(0)
}));
/**
 * Add an expired cookie to a Cookies object, throwing an error if invalid
 *
 * @since 4.0.0
 * @category combinators
 */
export const expireCookieUnsafe = /*#__PURE__*/dual(args => isCookies(args[0]), (self, name, options) => setUnsafe(self, name, "", {
  ...options,
  maxAge: 0,
  expires: new Date(0)
}));
/**
 * Add multiple cookies to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export const setAll = /*#__PURE__*/dual(2, (self, cookies) => {
  const record = {
    ...self.cookies
  };
  for (const [name, value, options] of cookies) {
    const result = makeCookie(name, value, options);
    if (Result.isFailure(result)) {
      return result;
    }
    record[name] = result.success;
  }
  return Result.succeed(fromReadonlyRecord(record));
});
/**
 * Add multiple cookies to a Cookies object, throwing an error if invalid
 *
 * @since 4.0.0
 * @category combinators
 */
export const setAllUnsafe = /*#__PURE__*/dual(2, (self, cookies) => Result.getOrThrow(setAll(self, cookies)));
/**
 * Serialize a cookie into a string
 *
 * Adapted from https://github.com/fastify/fastify-cookie under MIT License
 *
 * @since 4.0.0
 * @category encoding
 */
export function serializeCookie(self) {
  let str = self.name + "=" + self.valueEncoded;
  if (self.options === undefined) {
    return str;
  }
  const options = self.options;
  if (options.maxAge !== undefined) {
    const maxAge = Duration.toSeconds(Duration.fromInputUnsafe(options.maxAge));
    str += "; Max-Age=" + Math.trunc(maxAge);
  }
  if (options.domain !== undefined) {
    str += "; Domain=" + options.domain;
  }
  if (options.path !== undefined) {
    str += "; Path=" + options.path;
  }
  if (options.priority !== undefined) {
    switch (options.priority) {
      case "low":
        str += "; Priority=Low";
        break;
      case "medium":
        str += "; Priority=Medium";
        break;
      case "high":
        str += "; Priority=High";
        break;
    }
  }
  if (options.expires !== undefined) {
    str += "; Expires=" + options.expires.toUTCString();
  }
  if (options.httpOnly) {
    str += "; HttpOnly";
  }
  if (options.secure) {
    str += "; Secure";
  }
  // Draft implementation to support Chrome from 2024-Q1 forward.
  // See https://datatracker.ietf.org/doc/html/draft-cutler-httpbis-partitioned-cookies#section-2.1
  if (options.partitioned) {
    str += "; Partitioned";
  }
  if (options.sameSite !== undefined) {
    switch (options.sameSite) {
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "none":
        str += "; SameSite=None";
        break;
    }
  }
  return str;
}
/**
 * Serialize a Cookies object into a Cookie header
 *
 * @since 4.0.0
 * @category encoding
 */
export const toCookieHeader = self => Object.values(self.cookies).map(cookie => `${cookie.name}=${cookie.valueEncoded}`).join("; ");
/**
 * @since 4.0.0
 * @category encoding
 */
export const toRecord = self => {
  const record = {};
  const cookies = Object.values(self.cookies);
  for (let index = 0; index < cookies.length; index++) {
    const cookie = cookies[index];
    record[cookie.name] = cookie.value;
  }
  return record;
};
/**
 * @since 4.0.0
 * @category Schemas
 */
export const schemaRecord = /*#__PURE__*/CookiesSchema.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.Record(Schema.String, Schema.String), /*#__PURE__*/Transformation.transform({
  decode: toRecord,
  encode: self => fromIterable(Object.entries(self).map(([name, value]) => makeCookieUnsafe(name, value)))
})));
/**
 * Serialize a Cookies object into Headers object containing one or more Set-Cookie headers
 *
 * @since 4.0.0
 * @category encoding
 */
export const toSetCookieHeaders = self => Object.values(self.cookies).map(serializeCookie);
/**
 * Parse a cookie header into a record of key-value pairs
 *
 * Adapted from https://github.com/fastify/fastify-cookie under MIT License
 *
 * @since 4.0.0
 * @category decoding
 */
export function parseHeader(header) {
  const result = {};
  const strLen = header.length;
  let pos = 0;
  let terminatorPos = 0;
  while (true) {
    if (terminatorPos === strLen) break;
    terminatorPos = header.indexOf(";", pos);
    if (terminatorPos === -1) terminatorPos = strLen; // This is the last pair
    let eqIdx = header.indexOf("=", pos);
    if (eqIdx === -1) break; // No key-value pairs left
    if (eqIdx > terminatorPos) {
      // Malformed key-value pair
      pos = terminatorPos + 1;
      continue;
    }
    const key = header.substring(pos, eqIdx++).trim();
    if (result[key] === undefined) {
      const val = header.charCodeAt(eqIdx) === 0x22 ? header.substring(eqIdx + 1, terminatorPos - 1).trim() : header.substring(eqIdx, terminatorPos).trim();
      result[key] = !(val.indexOf("%") === -1) ? tryDecodeURIComponent(val) : val;
    }
    pos = terminatorPos + 1;
  }
  return result;
}
const tryDecodeURIComponent = str => {
  try {
    return decodeURIComponent(str);
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return str;
  }
};
//# sourceMappingURL=Cookies.js.map