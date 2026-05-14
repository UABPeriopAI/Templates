/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import { Scope } from "../../Scope.ts";
import type { unhandled } from "../../Types.ts";
import type { Headers } from "../http/Headers.ts";
import type * as Rpc from "./Rpc.ts";
import type { Request, RequestId } from "./RpcMessage.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export type TypeId = "~effect/rpc/RpcMiddleware";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category models
 */
export interface RpcMiddleware<Provides, E, Requires> {
    (effect: Effect.Effect<SuccessValue, E | unhandled, Provides>, options: {
        readonly client: Rpc.ServerClient;
        readonly requestId: RequestId;
        readonly rpc: Rpc.AnyWithProps;
        readonly payload: unknown;
        readonly headers: Headers;
    }): Effect.Effect<SuccessValue, unhandled | E, Requires | Scope>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface SuccessValue {
    readonly _: unique symbol;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface RpcMiddlewareClient<E, CE, R> {
    (options: {
        readonly rpc: Rpc.AnyWithProps;
        readonly request: Request<Rpc.Any>;
        readonly next: (request: Request<Rpc.Any>) => Effect.Effect<SuccessValue, unhandled | E>;
    }): Effect.Effect<SuccessValue, unhandled | E | CE, R>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface ForClient<Id> {
    readonly _: unique symbol;
    readonly id: Id;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Any {
    (effect: Effect.Effect<SuccessValue, any, any>, options: {
        readonly client: Rpc.ServerClient;
        readonly requestId: RequestId;
        readonly rpc: Rpc.AnyWithProps;
        readonly payload: unknown;
        readonly headers: Headers;
    }): Effect.Effect<SuccessValue, any, any>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface AnyId {
    readonly [TypeId]: {
        readonly provides: any;
        readonly requires: any;
        readonly error: Schema.Top;
        readonly clientError: any;
    };
}
/**
 * @since 4.0.0
 * @category models
 */
export interface ServiceClass<Self, Name extends string, Provides, E extends Schema.Top, ClientError, Requires, RequiredForClient extends boolean> extends Context.Service<Self, RpcMiddleware<Provides, E["Type"], Requires>> {
    new (_: never): Context.ServiceClass.Shape<Name, RpcMiddleware<Provides, E["Type"], Requires>> & {
        readonly [TypeId]: {
            readonly error: E;
            readonly provides: Provides;
            readonly requires: Requires;
            readonly clientError: ClientError;
        };
    };
    readonly [TypeId]: typeof TypeId;
    readonly error: E;
    readonly requiredForClient: RequiredForClient;
    readonly "~ClientError": ClientError;
}
/**
 * @since 4.0.0
 * @category models
 */
export type Provides<A> = A extends {
    readonly [TypeId]: {
        readonly provides: infer P;
    };
} ? P : never;
/**
 * @since 4.0.0
 * @category models
 */
export type Requires<A> = A extends {
    readonly [TypeId]: {
        readonly requires: infer R;
    };
} ? R : never;
/**
 * @since 4.0.0
 * @category models
 */
export type ApplyServices<A, R> = Exclude<R, Provides<A>> | Requires<A>;
/**
 * @since 4.0.0
 * @category models
 */
export type ErrorSchema<A> = A extends {
    readonly [TypeId]: {
        readonly error: infer E;
    };
} ? E extends Schema.Top ? E : never : never;
/**
 * @since 4.0.0
 * @category models
 */
export type Error<A> = ErrorSchema<A>["Type"];
/**
 * @since 4.0.0
 * @category models
 */
export type ErrorServicesEncode<A> = ErrorSchema<A>["EncodingServices"];
/**
 * @since 4.0.0
 * @category models
 */
export type ErrorServicesDecode<A> = ErrorSchema<A>["DecodingServices"];
/**
 * @since 4.0.0
 * @category models
 */
export interface AnyService extends Context.Key<any, any> {
    readonly [TypeId]: typeof TypeId;
    readonly error: Schema.Top;
    readonly requiredForClient: boolean;
    readonly "~ClientError": any;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface AnyServiceWithProps extends Context.Key<any, RpcMiddleware<any, any, any>> {
    readonly [TypeId]: typeof TypeId;
    readonly error: Schema.Top;
    readonly requiredForClient: boolean;
    readonly "~ClientError": any;
}
/**
 * @since 4.0.0
 * @category tags
 */
export declare const Service: <Self, Config extends {
    requires?: any;
    provides?: any;
    clientError?: any;
} = {
    requires: never;
    provides: never;
    clientError: never;
}>() => <const Name extends string, Error extends Schema.Top = Schema.Never, const RequiredForClient extends boolean = false>(id: Name, options?: {
    readonly error?: Error | undefined;
    readonly requiredForClient?: RequiredForClient | undefined;
} | undefined) => ServiceClass<Self, Name, "provides" extends keyof Config ? Config["provides"] : never, Error, "clientError" extends keyof Config ? Config["clientError"] : never, "requires" extends keyof Config ? Config["requires"] : never, RequiredForClient>;
/**
 * @since 4.0.0
 * @category client
 */
export declare const layerClient: <Id extends AnyId, S, R, EX = never, RX = never>(tag: Context.Key<Id, S>, service: RpcMiddlewareClient<Id[TypeId]["error"]["Type"], Id[TypeId]["clientError"], R> | Effect.Effect<RpcMiddlewareClient<Id[TypeId]["error"]["Type"], Id[TypeId]["clientError"], R>, EX, RX>) => Layer.Layer<ForClient<Id>, EX, R | Exclude<RX, Scope>>;
//# sourceMappingURL=RpcMiddleware.d.ts.map