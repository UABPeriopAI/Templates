/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import { type Pipeable } from "../../Pipeable.ts";
import type { Redacted } from "../../Redacted.ts";
import type { Covariant } from "../../Types.ts";
declare const TypeId = "~effect/httpapi/HttpApiSecurity";
/**
 * @since 4.0.0
 * @category models
 */
export type HttpApiSecurity = Bearer | ApiKey | Basic;
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace HttpApiSecurity {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Proto<out A> extends Pipeable {
        readonly [TypeId]: {
            readonly _A: Covariant<A>;
        };
        readonly annotations: Context.Context<never>;
    }
    /**
     * @since 4.0.0
     * @category models
     */
    type Type<A extends HttpApiSecurity> = A extends Proto<infer Out> ? Out : never;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Bearer extends HttpApiSecurity.Proto<Redacted> {
    readonly _tag: "Bearer";
}
/**
 * @since 4.0.0
 * @category models
 */
export interface ApiKey extends HttpApiSecurity.Proto<Redacted> {
    readonly _tag: "ApiKey";
    readonly in: "header" | "query" | "cookie";
    readonly key: string;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Basic extends HttpApiSecurity.Proto<Credentials> {
    readonly _tag: "Basic";
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Credentials {
    readonly username: string;
    readonly password: Redacted;
}
/**
 * Create an Bearer token security scheme.
 *
 * You can implement some api middleware for this security scheme using
 * `HttpApiBuilder.middlewareSecurity`.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const bearer: Bearer;
/**
 * Create an API key security scheme.
 *
 * You can implement some api middleware for this security scheme using
 * `HttpApiBuilder.middlewareSecurity`.
 *
 * To set the correct cookie in a handler, you can use
 * `HttpApiBuilder.securitySetCookie`.
 *
 * The default value for `in` is "header".
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const apiKey: (options: {
    readonly key: string;
    readonly in?: "header" | "query" | "cookie" | undefined;
}) => ApiKey;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const basic: Basic;
/**
 * @since 4.0.0
 * @category annotations
 */
export declare const annotateMerge: {
    /**
     * @since 4.0.0
     * @category annotations
     */
    <I>(annotations: Context.Context<I>): <A extends HttpApiSecurity>(self: A) => A;
    /**
     * @since 4.0.0
     * @category annotations
     */
    <A extends HttpApiSecurity, I>(self: A, annotations: Context.Context<I>): A;
};
/**
 * @since 4.0.0
 * @category annotations
 */
export declare const annotate: {
    /**
     * @since 4.0.0
     * @category annotations
     */
    <I, S>(service: Context.Key<I, S>, value: S): <A extends HttpApiSecurity>(self: A) => A;
    /**
     * @since 4.0.0
     * @category annotations
     */
    <A extends HttpApiSecurity, I, S>(self: A, service: Context.Key<I, S>, value: S): A;
};
export {};
//# sourceMappingURL=HttpApiSecurity.d.ts.map