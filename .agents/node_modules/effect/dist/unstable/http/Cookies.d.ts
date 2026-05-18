/**
 * @since 4.0.0
 */
import * as Data from "../../Data.ts";
import * as Duration from "../../Duration.ts";
import * as Inspectable from "../../Inspectable.ts";
import * as Option from "../../Option.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Record from "../../Record.ts";
import * as Result from "../../Result.ts";
import * as Schema from "../../Schema.ts";
import type * as Types from "../../Types.ts";
declare const TypeId = "~effect/http/Cookies";
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isCookies: (u: unknown) => u is Cookies;
/**
 * @since 4.0.0
 * @category models
 */
export interface Cookies extends Pipeable, Inspectable.Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly cookies: Record.ReadonlyRecord<string, Cookie>;
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface CookiesSchema extends Schema.declare<Cookies, Record.ReadonlyRecord<string, Cookie>> {
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const CookiesSchema: CookiesSchema;
declare const CookieTypeId = "~effect/http/Cookies/Cookie";
/**
 * @since 4.0.0
 * @category cookie
 */
export interface Cookie extends Inspectable.Inspectable {
    readonly [CookieTypeId]: typeof CookieTypeId;
    readonly name: string;
    readonly value: string;
    readonly valueEncoded: string;
    readonly options?: {
        readonly domain?: string | undefined;
        readonly expires?: Date | undefined;
        readonly maxAge?: Duration.Input | undefined;
        readonly path?: string | undefined;
        readonly priority?: "low" | "medium" | "high" | undefined;
        readonly httpOnly?: boolean | undefined;
        readonly secure?: boolean | undefined;
        readonly partitioned?: boolean | undefined;
        readonly sameSite?: "lax" | "strict" | "none" | undefined;
    } | undefined;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isCookie: (u: unknown) => u is Cookie;
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface CookieSchema extends Schema.declare<Cookie> {
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const CookieSchema: CookieSchema;
declare const CookieErrorTypeId = "~effect/http/Cookies/CookieError";
/**
 * @since 4.0.0
 * @category errors
 */
export declare class CookiesErrorReason extends Data.Error<{
    readonly _tag: "InvalidCookieName" | "InvalidCookieValue" | "InvalidCookieDomain" | "InvalidCookiePath" | "CookieInfinityMaxAge";
    readonly cause?: unknown;
}> {
}
declare const CookiesError_base: new <A extends Record<string, any> = {}>(args: Types.VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "CookieError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class CookiesError extends CookiesError_base<{
    readonly reason: CookiesErrorReason;
}> {
    /**
     * @since 4.0.0
     */
    static fromReason(reason: CookiesError["reason"]["_tag"], cause?: unknown): CookiesError;
    /**
     * @since 4.0.0
     */
    readonly [CookieErrorTypeId] = "~effect/http/Cookies/CookieError";
    /**
     * @since 4.0.0
     */
    get message(): "InvalidCookieName" | "InvalidCookieValue" | "InvalidCookieDomain" | "InvalidCookiePath" | "CookieInfinityMaxAge";
}
/**
 * Create a Cookies object from an Iterable
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromReadonlyRecord: (cookies: Record.ReadonlyRecord<string, Cookie>) => Cookies;
/**
 * Create a Cookies object from an Iterable
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromIterable: (cookies: Iterable<Cookie>) => Cookies;
/**
 * Create a Cookies object from a set of Set-Cookie headers
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const fromSetCookie: (headers: Iterable<string> | string) => Cookies;
/**
 * An empty Cookies object
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: Cookies;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isEmpty: (self: Cookies) => boolean;
/**
 * Create a new cookie
 *
 * @since 4.0.0
 * @category constructors
 */
export declare function makeCookie(name: string, value: string, options?: Cookie["options"] | undefined): Result.Result<Cookie, CookiesError>;
/**
 * Create a new cookie, throwing an error if invalid
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const makeCookieUnsafe: (name: string, value: string, options?: Cookie["options"] | undefined) => Cookie;
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const setCookie: {
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (cookie: Cookie): (self: Cookies) => Cookies;
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, cookie: Cookie): Cookies;
};
/**
 * Add multiple cookies to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const setAllCookie: {
    /**
     * Add multiple cookies to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Iterable<Cookie>): (self: Cookies) => Cookies;
    /**
     * Add multiple cookies to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, cookies: Iterable<Cookie>): Cookies;
};
/**
 * Combine two Cookies objects, removing duplicates from the first
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const merge: {
    /**
     * Combine two Cookies objects, removing duplicates from the first
     *
     * @since 4.0.0
     * @category combinators
     */
    (that: Cookies): (self: Cookies) => Cookies;
    /**
     * Combine two Cookies objects, removing duplicates from the first
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, that: Cookies): Cookies;
};
/**
 * Remove a cookie by name
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const remove: {
    /**
     * Remove a cookie by name
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string): (self: Cookies) => Cookies;
    /**
     * Remove a cookie by name
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string): Cookies;
};
/**
 * Get a cookie from a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const get: {
    /**
     * Get a cookie from a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string): (self: Cookies) => Option.Option<Cookie>;
    /**
     * Get a cookie from a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string): Option.Option<Cookie>;
};
/**
 * Get a cookie from a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const getValue: {
    /**
     * Get a cookie from a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string): (self: Cookies) => Option.Option<string>;
    /**
     * Get a cookie from a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string): Option.Option<string>;
};
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const set: {
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string, value: string, options?: Cookie["options"]): (self: Cookies) => Result.Result<Cookies, CookiesError>;
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string, value: string, options?: Cookie["options"]): Result.Result<Cookies, CookiesError>;
};
/**
 * Add a cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const setUnsafe: {
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string, value: string, options?: Cookie["options"]): (self: Cookies) => Cookies;
    /**
     * Add a cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string, value: string, options?: Cookie["options"]): Cookies;
};
/**
 * Add an expired cookie to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const expireCookie: {
    /**
     * Add an expired cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string, options?: Omit<NonNullable<Cookie["options"]>, "expires" | "maxAge">): (self: Cookies) => Result.Result<Cookies, CookiesError>;
    /**
     * Add an expired cookie to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string, options?: Omit<NonNullable<Cookie["options"]>, "expires" | "maxAge">): Result.Result<Cookies, CookiesError>;
};
/**
 * Add an expired cookie to a Cookies object, throwing an error if invalid
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const expireCookieUnsafe: {
    /**
     * Add an expired cookie to a Cookies object, throwing an error if invalid
     *
     * @since 4.0.0
     * @category combinators
     */
    (name: string, options?: Omit<NonNullable<Cookie["options"]>, "expires" | "maxAge">): (self: Cookies) => Cookies;
    /**
     * Add an expired cookie to a Cookies object, throwing an error if invalid
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, name: string, options?: Omit<NonNullable<Cookie["options"]>, "expires" | "maxAge">): Cookies;
};
/**
 * Add multiple cookies to a Cookies object
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const setAll: {
    /**
     * Add multiple cookies to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Iterable<readonly [name: string, value: string, options?: Cookie["options"]]>): (self: Cookies) => Result.Result<Cookies, CookiesError>;
    /**
     * Add multiple cookies to a Cookies object
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, cookies: Iterable<readonly [name: string, value: string, options?: Cookie["options"]]>): Result.Result<Cookies, CookiesError>;
};
/**
 * Add multiple cookies to a Cookies object, throwing an error if invalid
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const setAllUnsafe: {
    /**
     * Add multiple cookies to a Cookies object, throwing an error if invalid
     *
     * @since 4.0.0
     * @category combinators
     */
    (cookies: Iterable<readonly [name: string, value: string, options?: Cookie["options"]]>): (self: Cookies) => Cookies;
    /**
     * Add multiple cookies to a Cookies object, throwing an error if invalid
     *
     * @since 4.0.0
     * @category combinators
     */
    (self: Cookies, cookies: Iterable<readonly [name: string, value: string, options?: Cookie["options"]]>): Cookies;
};
/**
 * Serialize a cookie into a string
 *
 * Adapted from https://github.com/fastify/fastify-cookie under MIT License
 *
 * @since 4.0.0
 * @category encoding
 */
export declare function serializeCookie(self: Cookie): string;
/**
 * Serialize a Cookies object into a Cookie header
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const toCookieHeader: (self: Cookies) => string;
/**
 * @since 4.0.0
 * @category encoding
 */
export declare const toRecord: (self: Cookies) => Record<string, string>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const schemaRecord: Schema.decodeTo<Schema.$Record<Schema.String, Schema.String>, CookiesSchema, never, never>;
/**
 * Serialize a Cookies object into Headers object containing one or more Set-Cookie headers
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const toSetCookieHeaders: (self: Cookies) => Array<string>;
/**
 * Parse a cookie header into a record of key-value pairs
 *
 * Adapted from https://github.com/fastify/fastify-cookie under MIT License
 *
 * @since 4.0.0
 * @category decoding
 */
export declare function parseHeader(header: string): Record<string, string>;
export {};
//# sourceMappingURL=Cookies.d.ts.map