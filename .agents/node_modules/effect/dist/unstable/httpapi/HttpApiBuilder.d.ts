import * as Effect from "../../Effect.ts";
import type { FileSystem } from "../../FileSystem.ts";
import * as Layer from "../../Layer.ts";
import type { Path } from "../../Path.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Redacted from "../../Redacted.ts";
import * as Scope from "../../Scope.ts";
import type { Covariant, NoInfer } from "../../Types.ts";
import type { Cookie } from "../http/Cookies.ts";
import type * as Etag from "../http/Etag.ts";
import type { HttpPlatform } from "../http/HttpPlatform.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
import * as Request from "../http/HttpServerRequest.ts";
import { HttpServerRequest } from "../http/HttpServerRequest.ts";
import type { HttpServerResponse } from "../http/HttpServerResponse.ts";
import type * as HttpApi from "./HttpApi.ts";
import * as HttpApiEndpoint from "./HttpApiEndpoint.ts";
import type * as HttpApiGroup from "./HttpApiGroup.ts";
import type * as HttpApiSecurity from "./HttpApiSecurity.ts";
/**
 * Register an `HttpApi` with a `HttpRouter`.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const layer: <Id extends string, Groups extends HttpApiGroup.Any>(api: HttpApi.HttpApi<Id, Groups>, options?: {
    readonly openapiPath?: `/${string}` | undefined;
}) => Layer.Layer<never, never, Etag.Generator | HttpRouter.HttpRouter | FileSystem | HttpPlatform | Path | HttpApiGroup.ToService<Id, Groups>>;
/**
 * Create a `Layer` that will implement all the endpoints in an `HttpApi`.
 *
 * An unimplemented `Handlers` instance is passed to the `build` function, which
 * you can use to add handlers to the group.
 *
 * You can implement endpoints using the `handlers.handle` api.
 *
 * @since 4.0.0
 * @category handlers
 */
export declare const group: <ApiId extends string, Groups extends HttpApiGroup.Any, const Name extends HttpApiGroup.Name<Groups>, Return>(api: HttpApi.HttpApi<ApiId, Groups>, groupName: Name, build: (handlers: Handlers.FromGroup<HttpApiGroup.WithName<Groups, Name>>) => Handlers.ValidateReturn<Return>) => Layer.Layer<HttpApiGroup.ApiGroup<ApiId, Name>, Handlers.Error<Return>, Exclude<Handlers.Context<Return>, Scope.Scope>>;
/**
 * @since 4.0.0
 * @category handlers
 */
export declare const HandlersTypeId: unique symbol;
/**
 * @since 4.0.0
 * @category handlers
 */
export type HandlersTypeId = typeof HandlersTypeId;
/**
 * Represents a handled `HttpApi`.
 *
 * @since 4.0.0
 * @category handlers
 */
export interface Handlers<R, Endpoints extends HttpApiEndpoint.Any = never> extends Pipeable {
    readonly [HandlersTypeId]: {
        _Endpoints: Covariant<Endpoints>;
    };
    readonly group: HttpApiGroup.AnyWithProps;
    readonly handlers: Set<Handlers.Item<R>>;
    /**
     * Add the implementation for an `HttpApiEndpoint` to a `Handlers` group.
     */
    handle<Name extends HttpApiEndpoint.Name<Endpoints>, R1>(name: Name, handler: HttpApiEndpoint.HandlerWithName<Endpoints, Name, HttpApiEndpoint.ErrorsWithName<Endpoints, Name>, R1>, options?: {
        readonly uninterruptible?: boolean | undefined;
    } | undefined): Handlers<R | HttpApiEndpoint.MiddlewareWithName<Endpoints, Name> | HttpApiEndpoint.MiddlewareServicesWithName<Endpoints, Name> | (HttpApiEndpoint.ExcludeProvidedWithName<Endpoints, Name, R1 | HttpApiEndpoint.ServerServicesWithName<Endpoints, Name>> extends infer _R ? _R extends never ? never : HttpRouter.Request<"Requires", _R> : never), HttpApiEndpoint.ExcludeName<Endpoints, Name>>;
    /**
     * Add the implementation for an `HttpApiEndpoint` to a `Handlers` group.
     * This version opts out of automatic payload decoding and provides the raw request.
     */
    handleRaw<Name extends HttpApiEndpoint.Name<Endpoints>, R1>(name: Name, handler: HttpApiEndpoint.HandlerRawWithName<Endpoints, Name, HttpApiEndpoint.ErrorsWithName<Endpoints, Name>, R1>, options?: {
        readonly uninterruptible?: boolean | undefined;
    } | undefined): Handlers<R | HttpApiEndpoint.MiddlewareWithName<Endpoints, Name> | HttpApiEndpoint.MiddlewareServicesWithName<Endpoints, Name> | (HttpApiEndpoint.ExcludeProvidedWithName<Endpoints, Name, R1 | HttpApiEndpoint.ServerServicesWithName<Endpoints, Name>> extends infer _R ? _R extends never ? never : HttpRouter.Request<"Requires", _R> : never), HttpApiEndpoint.ExcludeName<Endpoints, Name>>;
}
/**
 * @since 4.0.0
 * @category handlers
 */
export declare namespace Handlers {
    /**
     * @since 4.0.0
     * @category handlers
     */
    interface Any {
        readonly [HandlersTypeId]: any;
    }
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Item<R> = {
        readonly endpoint: HttpApiEndpoint.AnyWithProps;
        readonly handler: HttpApiEndpoint.Handler<any, any, R>;
        readonly isRaw: boolean;
        readonly uninterruptible: boolean;
    };
    /**
     * @since 4.0.0
     * @category handlers
     */
    type FromGroup<Group extends HttpApiGroup.Any> = Handlers<never, HttpApiGroup.Endpoints<Group>>;
    /**
     * @since 4.0.0
     * @category handlers
     */
    type ValidateReturn<A> = A extends (Handlers<infer _R, infer _Endpoints> | Effect.Effect<Handlers<infer _R, infer _Endpoints>, infer _EX, infer _RX>) ? [_Endpoints] extends [never] ? A : `Endpoint not handled: ${HttpApiEndpoint.Name<_Endpoints>}` : `Must return the implemented handlers`;
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Error<A> = A extends Effect.Effect<Handlers<infer _R, infer _Endpoints>, infer _EX, infer _RX> ? _EX : never;
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Context<A> = A extends Handlers<infer _R, infer _Endpoints> ? _R : A extends Effect.Effect<Handlers<infer _R, infer _Endpoints>, infer _EX, infer _RX> ? _R | _RX : never;
}
/**
 * @since 4.0.0
 * @category handlers
 */
export declare const endpoint: <ApiId extends string, Groups extends HttpApiGroup.Any, const GroupName extends HttpApiGroup.Name<Groups>, const EndpointName extends HttpApiEndpoint.Name<HttpApiGroup.Endpoints<HttpApiGroup.WithName<Groups, GroupName>>>, R, Group extends HttpApiGroup.Any = HttpApiGroup.WithName<Groups, GroupName>, Endpoint extends HttpApiEndpoint.Any = HttpApiEndpoint.WithName<HttpApiGroup.Endpoints<Group>, EndpointName>>(api: HttpApi.HttpApi<ApiId, Groups>, groupName: GroupName, endpointName: EndpointName, handler: NoInfer<HttpApiEndpoint.HandlerWithName<HttpApiGroup.Endpoints<HttpApiGroup.WithName<Groups, GroupName>>, EndpointName, never, R>>) => Effect.Effect<Effect.Effect<HttpServerResponse, never, HttpServerRequest | HttpRouter.RouteContext | Request.ParsedSearchParams | Exclude<R, HttpApiEndpoint.MiddlewareProvides<Endpoint>>>, never, HttpApiEndpoint.ServerServices<Endpoint> | HttpApiEndpoint.Middleware<Endpoint> | HttpApiEndpoint.MiddlewareServices<Endpoint> | Etag.Generator | FileSystem | HttpPlatform | Path>;
/**
 * @since 4.0.0
 * @category security
 */
export declare const securityDecode: <Security extends HttpApiSecurity.HttpApiSecurity>(self: Security) => Effect.Effect<HttpApiSecurity.HttpApiSecurity.Type<Security>, never, HttpServerRequest | Request.ParsedSearchParams>;
/**
 * @since 4.0.0
 * @category security
 */
export declare const securitySetCookie: (self: HttpApiSecurity.ApiKey, value: string | Redacted.Redacted, options?: Cookie["options"]) => Effect.Effect<void, never, HttpServerRequest>;
//# sourceMappingURL=HttpApiBuilder.d.ts.map