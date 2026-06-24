/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Context from "../../Context.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Predicate from "../../Predicate.ts";
import * as Record from "../../Record.ts";
import type * as Schema from "../../Schema.ts";
import type { PathInput } from "../http/HttpRouter.ts";
import * as HttpApiEndpoint from "./HttpApiEndpoint.ts";
import type * as HttpApiGroup from "./HttpApiGroup.ts";
import type * as HttpApiMiddleware from "./HttpApiMiddleware.ts";
declare const TypeId = "~effect/httpapi/HttpApi";
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isHttpApi: (u: unknown) => u is Any;
/**
 * An `HttpApi` is a collection of `HttpApiEndpoint`s. You can use an `HttpApi` to
 * represent a portion of your domain.
 *
 * The endpoints can be implemented later using the `HttpApiBuilder.make` api.
 *
 * @since 4.0.0
 * @category models
 */
export interface HttpApi<out Id extends string, out Groups extends HttpApiGroup.Any = never> extends Pipeable {
    new (_: never): {};
    readonly [TypeId]: typeof TypeId;
    readonly identifier: Id;
    readonly groups: Record.ReadonlyRecord<string, Groups>;
    readonly annotations: Context.Context<never>;
    /**
     * Add a `HttpApiGroup` to the `HttpApi`.
     */
    add<A extends NonEmptyReadonlyArray<HttpApiGroup.Any>>(...groups: A): HttpApi<Id, Groups | A[number]>;
    /**
     * Add another `HttpApi` to the `HttpApi`.
     */
    addHttpApi<Id2 extends string, Groups2 extends HttpApiGroup.Any>(api: HttpApi<Id2, Groups2>): HttpApi<Id, Groups | Groups2>;
    /**
     * Prefix all endpoints in the `HttpApi`.
     */
    prefix<const Prefix extends PathInput>(prefix: Prefix): HttpApi<Id, HttpApiGroup.AddPrefix<Groups, Prefix>>;
    /**
     * Add a middleware to a `HttpApi`. It will be applied to all endpoints in the
     * `HttpApi`.
     *
     * Note that this will only add the middleware to the endpoints **before** this
     * api is called.
     */
    middleware<I extends HttpApiMiddleware.AnyId, S>(middleware: Context.Key<I, S>): HttpApi<Id, HttpApiGroup.AddMiddleware<Groups, I>>;
    /**
     * Annotate the `HttpApi`.
     */
    annotate<I, S>(tag: Context.Key<I, S>, value: S): HttpApi<Id, Groups>;
    /**
     * Annotate the `HttpApi` with a Context.
     */
    annotateMerge<I>(context: Context.Context<I>): HttpApi<Id, Groups>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Any {
    readonly [TypeId]: typeof TypeId;
}
/**
 * @since 4.0.0
 * @category models
 */
export type AnyWithProps = HttpApi<string, HttpApiGroup.AnyWithProps>;
/**
 * An `HttpApi` is a collection of `HttpApiEndpoint`s. You can use an `HttpApi` to
 * represent a portion of your domain.
 *
 * You can then use `HttpApiBuilder.layer(api)` to implement the endpoints of the
 * `HttpApi`.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <const Id extends string>(identifier: Id) => HttpApi<Id, never>;
/**
 * @since 4.0.0
 * @category Reflection
 */
export declare const reflect: <Id extends string, Groups extends HttpApiGroup.Any>(self: HttpApi<Id, Groups>, options: {
    readonly predicate?: Predicate.Predicate<{
        readonly endpoint: HttpApiEndpoint.AnyWithProps;
        readonly group: HttpApiGroup.AnyWithProps;
    }> | undefined;
    readonly onGroup: (options: {
        readonly group: HttpApiGroup.AnyWithProps;
        readonly mergedAnnotations: Context.Context<never>;
    }) => void;
    readonly onEndpoint: (options: {
        readonly group: HttpApiGroup.AnyWithProps;
        readonly endpoint: HttpApiEndpoint.AnyWithProps;
        readonly mergedAnnotations: Context.Context<never>;
        readonly middleware: ReadonlySet<HttpApiMiddleware.AnyService>;
        readonly successes: ReadonlyMap<number, readonly [Schema.Top, ...Array<Schema.Top>]>;
        readonly errors: ReadonlyMap<number, readonly [Schema.Top, ...Array<Schema.Top>]>;
    }) => void;
}) => void;
declare const AdditionalSchemas_base: Context.ServiceClass<AdditionalSchemas, "effect/httpapi/HttpApi/AdditionalSchemas", readonly Schema.Top[]>;
/**
 * Adds additional schemas to components/schemas.
 * The provided schemas must have a `identifier` annotation.
 *
 * @since 4.0.0
 * @category tags
 */
export declare class AdditionalSchemas extends AdditionalSchemas_base {
}
export {};
//# sourceMappingURL=HttpApi.d.ts.map