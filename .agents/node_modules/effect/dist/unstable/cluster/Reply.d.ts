/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Option from "../../Option.ts";
import * as Schema from "../../Schema.ts";
import * as Transformation from "../../SchemaTransformation.ts";
import * as Rpc from "../rpc/Rpc.ts";
import type * as RpcMessage from "../rpc/RpcMessage.ts";
import { MalformedMessage } from "./ClusterError.ts";
import type { OutgoingRequest } from "./Message.ts";
import { Snowflake } from "./Snowflake.ts";
declare const TypeId = "~effect/cluster/Reply";
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isReply: (u: unknown) => u is Reply<Rpc.Any>;
/**
 * @since 4.0.0
 * @category models
 */
export type Reply<R extends Rpc.Any> = WithExit<R> | Chunk<R>;
/**
 * @since 4.0.0
 * @category models
 */
export type Encoded = WithExitEncoded | ChunkEncoded;
/**
 * @since 4.0.0
 * @category models
 */
export declare const Encoded: Schema.Codec<Encoded>;
declare const ReplyWithContext_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "ReplyWithContext";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category models
 */
export declare class ReplyWithContext<R extends Rpc.Any> extends ReplyWithContext_base<{
    readonly reply: Reply<R>;
    readonly context: Context.Context<Rpc.Services<R>>;
    readonly rpc: R;
}> {
    /**
     * @since 4.0.0
     */
    static fromDefect(options: {
        readonly id: Snowflake;
        readonly requestId: Snowflake;
        readonly defect: unknown;
    }): ReplyWithContext<any>;
    /**
     * @since 4.0.0
     */
    static interrupt(options: {
        readonly id: Snowflake;
        readonly requestId: Snowflake;
    }): ReplyWithContext<any>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface WithExitEncoded<A = unknown, E = unknown> {
    readonly _tag: "WithExit";
    readonly requestId: string;
    readonly id: string;
    readonly exit: RpcMessage.ExitEncoded<A, E>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface ChunkEncoded {
    readonly _tag: "Chunk";
    readonly requestId: string;
    readonly id: string;
    readonly sequence: number;
    readonly values: NonEmptyReadonlyArray<unknown>;
}
declare const Chunk_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "Chunk";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Chunk<R extends Rpc.Any> extends Chunk_base<{
    readonly requestId: Snowflake;
    readonly id: Snowflake;
    readonly sequence: number;
    readonly values: NonEmptyReadonlyArray<Rpc.SuccessChunk<R>>;
}> {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/Reply";
    /**
     * @since 4.0.0
     */
    static emptyFrom(requestId: Snowflake): Chunk<Rpc.Any>;
    /**
     * @since 4.0.0
     */
    static readonly Any: Schema.declare<Chunk<never>, Chunk<never>>;
    /**
     * @since 4.0.0
     */
    static readonly transform: Transformation.Transformation<any, any>;
    /**
     * @since 4.0.0
     */
    static schema<R extends Rpc.Any>(rpc: R): Schema.declareConstructor<Chunk<R>, Chunk<R>, readonly [Rpc.SuccessExitSchema<R>]>;
    /**
     * @since 4.0.0
     */
    static schemaFrom<Success extends Schema.Top>(success: Success): Schema.declareConstructor<Chunk<Rpc.Any>, Chunk<Rpc.Any>, readonly [Success]>;
    /**
     * @since 4.0.0
     */
    withRequestId(requestId: Snowflake): Chunk<R>;
}
declare const WithExit_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "WithExit";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category models
 */
export declare class WithExit<R extends Rpc.Any> extends WithExit_base<{
    readonly requestId: Snowflake;
    readonly id: Snowflake;
    readonly exit: Rpc.Exit<R>;
}> {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/Reply";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is WithExit<any>;
    /**
     * @since 4.0.0
     */
    static schema<R extends Rpc.Any>(rpc: R): Schema.declareConstructor<WithExit<R>, WithExit<R>, readonly [Schema.Exit<Rpc.SuccessExitSchema<R>, Rpc.ErrorExitSchema<R>, Rpc.DefectSchema>]>;
    /**
     * @since 4.0.0
     */
    static schemaFrom<Success extends Schema.Top, Error extends Schema.Top, Defect extends Schema.Top>(exitSchema: Schema.Exit<Success, Error, Defect>): Schema.declareConstructor<WithExit<Rpc.Any>, WithExit<Rpc.Any>, readonly [Schema.Exit<Success, Error, Defect>]>;
    /**
     * @since 4.0.0
     */
    withRequestId(requestId: Snowflake): WithExit<R>;
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const Reply: <R extends Rpc.Any>(rpc: R) => Schema.Codec<WithExit<R> | Chunk<R>, Encoded, Rpc.ServicesServer<R>, Rpc.ServicesClient<R>>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const serialize: <R extends Rpc.Any>(self: ReplyWithContext<R>) => Effect.Effect<Encoded, MalformedMessage>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const serializeLastReceived: <R extends Rpc.Any>(self: OutgoingRequest<R>) => Effect.Effect<Option.Option<Encoded>, MalformedMessage>;
export {};
//# sourceMappingURL=Reply.d.ts.map