/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Option from "../../Option.ts";
import * as Rpc from "../rpc/Rpc.ts";
import type { PersistenceError } from "./ClusterError.ts";
import { MalformedMessage } from "./ClusterError.ts";
import type { EntityAddress } from "./EntityAddress.ts";
import * as Envelope from "./Envelope.ts";
import type * as Reply from "./Reply.ts";
import type { Snowflake } from "./Snowflake.ts";
/**
 * @since 4.0.0
 * @category incoming
 */
export type Incoming<R extends Rpc.Any> = IncomingRequest<R> | IncomingEnvelope;
/**
 * @since 4.0.0
 * @category incoming
 */
export type IncomingLocal<R extends Rpc.Any> = IncomingRequestLocal<R> | IncomingEnvelope;
/**
 * @since 4.0.0
 * @category incoming
 */
export declare const incomingLocalFromOutgoing: <R extends Rpc.Any>(self: Outgoing<R>) => IncomingLocal<R>;
declare const IncomingRequest_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "IncomingRequest";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category incoming
 */
export declare class IncomingRequest<R extends Rpc.Any> extends IncomingRequest_base<{
    readonly envelope: Envelope.PartialRequest;
    readonly lastSentReply: Option.Option<Reply.Encoded>;
    readonly respond: (reply: Reply.ReplyWithContext<R>) => Effect.Effect<void, MalformedMessage | PersistenceError>;
}> {
}
declare const IncomingRequestLocal_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "IncomingRequestLocal";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category outgoing
 */
export declare class IncomingRequestLocal<R extends Rpc.Any> extends IncomingRequestLocal_base<{
    readonly envelope: Envelope.Request<R>;
    readonly lastSentReply: Option.Option<Reply.Reply<R>>;
    readonly respond: (reply: Reply.Reply<R>) => Effect.Effect<void, MalformedMessage | PersistenceError>;
    readonly annotations: Context.Context<never>;
}> {
}
declare const IncomingEnvelope_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "IncomingEnvelope";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category incoming
 */
export declare class IncomingEnvelope extends IncomingEnvelope_base<{
    readonly _tag: "IncomingEnvelope";
    readonly envelope: Envelope.AckChunk | Envelope.Interrupt;
}> {
}
/**
 * @since 4.0.0
 * @category outgoing
 */
export type Outgoing<R extends Rpc.Any> = OutgoingRequest<R> | OutgoingEnvelope;
declare const OutgoingRequest_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "OutgoingRequest";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category outgoing
 */
export declare class OutgoingRequest<R extends Rpc.Any> extends OutgoingRequest_base<{
    readonly envelope: Envelope.Request<R>;
    readonly context: Context.Context<Rpc.Services<R>>;
    readonly lastReceivedReply: Option.Option<Reply.Reply<R>>;
    readonly rpc: R;
    readonly respond: (reply: Reply.Reply<R>) => Effect.Effect<void>;
    readonly annotations: Context.Context<never>;
}> {
    /**
     * @since 4.0.0
     */
    encodedCache?: Envelope.PartialRequest;
}
declare const OutgoingEnvelope_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "OutgoingEnvelope";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category outgoing
 */
export declare class OutgoingEnvelope extends OutgoingEnvelope_base<{
    readonly envelope: Envelope.AckChunk | Envelope.Interrupt;
    readonly rpc: Rpc.AnyWithProps;
}> {
    /**
     * @since 4.0.0
     */
    static interrupt(options: {
        readonly address: EntityAddress;
        readonly id: Snowflake;
        readonly requestId: Snowflake;
    }): OutgoingEnvelope;
}
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const serialize: <Rpc extends Rpc.Any>(message: Outgoing<Rpc>) => Effect.Effect<Envelope.Partial, MalformedMessage>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const serializeEnvelope: <Rpc extends Rpc.Any>(message: Outgoing<Rpc>) => Effect.Effect<Envelope.Encoded, MalformedMessage, never>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const serializeRequest: <Rpc extends Rpc.Any>(self: OutgoingRequest<Rpc>) => Effect.Effect<Envelope.PartialRequest, MalformedMessage>;
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export declare const deserializeLocal: <Rpc extends Rpc.Any>(self: Outgoing<Rpc>, encoded: Envelope.Partial) => Effect.Effect<IncomingLocal<Rpc>, MalformedMessage>;
export {};
//# sourceMappingURL=Message.d.ts.map