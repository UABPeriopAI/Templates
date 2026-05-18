/**
 * @since 4.0.0
 */
import type * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type { Pipeable } from "../../Pipeable.ts";
import type * as Queue from "../../Queue.ts";
import type { Scope } from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import type { Headers } from "../http/Headers.ts";
import * as Rpc from "./Rpc.ts";
import type { RequestId } from "./RpcMessage.ts";
import type * as RpcMiddleware from "./RpcMiddleware.ts";
declare const TypeId = "~effect/rpc/RpcGroup";
/**
 * @since 4.0.0
 * @category groups
 */
export interface RpcGroup<in out R extends Rpc.Any> extends Pipeable {
    new (_: never): {};
    readonly [TypeId]: typeof TypeId;
    readonly requests: ReadonlyMap<string, R>;
    readonly annotations: Context.Context<never>;
    /**
     * Add one or more procedures to the group.
     */
    add<const Rpcs2 extends ReadonlyArray<Rpc.Any>>(...rpcs: Rpcs2): RpcGroup<R | Rpcs2[number]>;
    /**
     * Merge this group with one or more other groups.
     */
    merge<const Groups extends ReadonlyArray<Any>>(...groups: Groups): RpcGroup<R | Rpcs<Groups[number]>>;
    /**
     * Omit one or more procedures from the group.
     */
    omit<const Tags extends ReadonlyArray<R["_tag"]>>(...tags: Tags): RpcGroup<Exclude<R, {
        readonly _tag: Tags[number];
    }>>;
    /**
     * Add middleware to all the procedures added to the group until this point.
     */
    middleware<M extends RpcMiddleware.AnyService>(middleware: M): RpcGroup<Rpc.AddMiddleware<R, M>>;
    /**
     * Add a prefix to the procedures in this group, returning a new group
     */
    prefix<const Prefix extends string>(prefix: Prefix): RpcGroup<Rpc.Prefixed<R, Prefix>>;
    /**
     * Implement the handlers for the procedures in this group, returning a
     * context object.
     */
    toHandlers<Handlers extends HandlersFrom<R>, EX = never, RX = never>(build: Handlers | Effect.Effect<Handlers, EX, RX>): Effect.Effect<Context.Context<Rpc.ToHandler<R>>, EX, RX | HandlersServices<R, Handlers>>;
    /**
     * Implement the handlers for the procedures in this group.
     */
    toLayer<Handlers extends HandlersFrom<R>, EX = never, RX = never>(build: Handlers | Effect.Effect<Handlers, EX, RX>): Layer.Layer<Rpc.ToHandler<R>, EX, Exclude<RX, Scope> | HandlersServices<R, Handlers>>;
    of<const Handlers extends HandlersFrom<R>>(handlers: Handlers): Handlers;
    /**
     * Implement a single handler from the group.
     */
    toLayerHandler<const Tag extends R["_tag"], Handler extends HandlerFrom<R, Tag>, EX = never, RX = never>(tag: Tag, build: Handler | Effect.Effect<Handler, EX, RX>): Layer.Layer<Rpc.Handler<Tag>, EX, Exclude<RX, Scope> | HandlerServices<R, Tag, Handler>>;
    /**
     * Retrieve a handler for a specific procedure in the group.
     */
    accessHandler<const Tag extends R["_tag"]>(tag: Tag): Effect.Effect<(payload: Rpc.Payload<Extract<R, {
        readonly _tag: Tag;
    }>>, options: {
        readonly client: Rpc.ServerClient;
        readonly requestId: RequestId;
        readonly headers: Headers;
    }) => Rpc.ResultFrom<Extract<R, {
        readonly _tag: Tag;
    }>, never>, never, Rpc.Handler<Tag>>;
    /**
     * Annotate the group with a value.
     */
    annotate<I, S>(service: Context.Key<I, S>, value: S): RpcGroup<R>;
    /**
     * Annotate the Rpc's above this point with a value.
     */
    annotateRpcs<I, S>(service: Context.Key<I, S>, value: S): RpcGroup<R>;
    /**
     * Annotate the group with the provided annotations.
     */
    annotateMerge<S>(annotations: Context.Context<S>): RpcGroup<R>;
    /**
     * Annotate the Rpc's above this point with the provided annotations.
     */
    annotateRpcsMerge<S>(annotations: Context.Context<S>): RpcGroup<R>;
}
/**
 * @since 4.0.0
 * @category groups
 */
export interface Any {
    readonly [TypeId]: typeof TypeId;
}
/**
 * @since 4.0.0
 * @category groups
 */
export type HandlersFrom<Rpc extends Rpc.Any> = {
    readonly [Current in Rpc as Current["_tag"]]: Rpc.ToHandlerFn<Current>;
};
/**
 * @since 4.0.0
 * @category groups
 */
export type HandlerFrom<Rpc extends Rpc.Any, Tag extends Rpc["_tag"]> = Extract<Rpc, {
    readonly _tag: Tag;
}> extends infer Current ? Current extends Rpc.Any ? Rpc.ToHandlerFn<Current> : never : never;
/**
 * @since 4.0.0
 * @category groups
 */
export type HandlersServices<Rpcs extends Rpc.Any, Handlers> = keyof Handlers extends infer K ? K extends keyof Handlers & string ? HandlerServices<Rpcs, K, Handlers[K]> : never : never;
/**
 * @since 4.0.0
 * @category groups
 */
export type HandlerServices<Rpcs extends Rpc.Any, K extends Rpcs["_tag"], Handler> = true extends Rpc.IsStream<Rpcs, K> ? Handler extends (...args: any) => Stream.Stream<infer _A, infer _E, infer _R> | Rpc.Wrapper<Stream.Stream<infer _A, infer _E, infer _R>> | Effect.Effect<Queue.Dequeue<infer _A, infer _E | Cause.Done>, infer _EX, infer _R> | Rpc.Wrapper<Effect.Effect<Queue.Dequeue<infer _A, infer _E | Cause.Done>, infer _EX, infer _R>> ? Exclude<Rpc.ExcludeProvides<_R, Rpcs, K>, Scope> | Rpc.ExtractRequires<Rpcs, K> : never : Handler extends (...args: any) => Effect.Effect<infer _A, infer _E, infer _R> | Rpc.Wrapper<Effect.Effect<infer _A, infer _E, infer _R>> ? Exclude<Rpc.ExcludeProvides<_R, Rpcs, K>, Scope> | Rpc.ExtractRequires<Rpcs, K> : never;
/**
 * @since 4.0.0
 * @category groups
 */
export type Rpcs<Group> = Group extends RpcGroup<infer R> ? string extends R["_tag"] ? never : R : never;
/**
 * @since 4.0.0
 * @category groups
 */
export declare const make: <const Rpcs extends ReadonlyArray<Rpc.Any>>(...rpcs: Rpcs) => RpcGroup<Rpcs[number]>;
export {};
//# sourceMappingURL=RpcGroup.d.ts.map