/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Context from "../../Context.ts";
import * as Data from "../../Data.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import { EntityNotAssignedToRunner, MalformedMessage, type PersistenceError } from "./ClusterError.ts";
import type { EntityAddress } from "./EntityAddress.ts";
import * as Envelope from "./Envelope.ts";
import * as Message from "./Message.ts";
import * as Reply from "./Reply.ts";
import * as ShardId from "./ShardId.ts";
import type { ShardingConfig } from "./ShardingConfig.ts";
import * as Snowflake from "./Snowflake.ts";
declare const MessageStorage_base: Context.ServiceClass<MessageStorage, "effect/cluster/MessageStorage", {
    /**
     * Save the provided message and its associated metadata.
     */
    readonly saveRequest: <R extends Rpc.Any>(envelope: Message.OutgoingRequest<R>) => Effect.Effect<SaveResult<R>, PersistenceError | MalformedMessage>;
    /**
     * Save the provided message and its associated metadata.
     */
    readonly saveEnvelope: (envelope: Message.OutgoingEnvelope) => Effect.Effect<void, PersistenceError | MalformedMessage>;
    /**
     * Save the provided `Reply` and its associated metadata.
     */
    readonly saveReply: <R extends Rpc.Any>(reply: Reply.ReplyWithContext<R>) => Effect.Effect<void, PersistenceError | MalformedMessage>;
    /**
     * Clear the `Reply`s for the given request id.
     */
    readonly clearReplies: (requestId: Snowflake.Snowflake) => Effect.Effect<void, PersistenceError>;
    /**
     * Retrieves the replies for the specified requests.
     *
     * - Un-acknowledged chunk replies
     * - WithExit replies
     */
    readonly repliesFor: <R extends Rpc.Any>(requests: Iterable<Message.OutgoingRequest<R>>) => Effect.Effect<Array<Reply.Reply<R>>, PersistenceError | MalformedMessage>;
    /**
     * Retrieves the encoded replies for the specified request ids.
     */
    readonly repliesForUnfiltered: (requestIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Reply.Encoded>, PersistenceError | MalformedMessage>;
    /**
     * Retrieves the request id for the specified primary key.
     */
    readonly requestIdForPrimaryKey: (options: {
        readonly address: EntityAddress;
        readonly tag: string;
        readonly id: string;
    }) => Effect.Effect<Option.Option<Snowflake.Snowflake>, PersistenceError>;
    /**
     * For locally sent messages, register a handler to process the replies.
     */
    readonly registerReplyHandler: <R extends Rpc.Any>(message: Message.OutgoingRequest<R> | Message.IncomingRequest<R>) => Effect.Effect<void, EntityNotAssignedToRunner>;
    /**
     * Unregister the reply handler for the specified message.
     */
    readonly unregisterReplyHandler: (requestId: Snowflake.Snowflake) => Effect.Effect<void>;
    /**
     * Unregister the reply handlers for the specified ShardId.
     */
    readonly unregisterShardReplyHandlers: (shardId: ShardId.ShardId) => Effect.Effect<void>;
    /**
     * Retrieves the unprocessed messages for the specified shards.
     *
     * A message is unprocessed when:
     *
     * - Requests that have no WithExit replies
     *   - Or they have no unacknowledged chunk replies
     * - The latest AckChunk envelope
     * - All Interrupt's for unprocessed requests
     */
    readonly unprocessedMessages: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<Array<Message.Incoming<any>>, PersistenceError>;
    /**
     * Retrieves the unprocessed messages by id.
     */
    readonly unprocessedMessagesById: <R extends Rpc.Any>(messageIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Message.Incoming<R>>, PersistenceError>;
    /**
     * Reset the mailbox state for the provided shards.
     */
    readonly resetShards: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<void, PersistenceError>;
    /**
     * Reset the mailbox state for the provided address.
     */
    readonly resetAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
    /**
     * Clear all messages and replies for the provided address.
     */
    readonly clearAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
    /**
     * Used to wrap requests with transactions.
     */
    readonly withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}>;
/**
 * @since 4.0.0
 * @category context
 */
export declare class MessageStorage extends MessageStorage_base {
}
/**
 * @since 4.0.0
 * @category SaveResult
 */
export type SaveResult<R extends Rpc.Any> = SaveResult.Success | SaveResult.Duplicate<R>;
/**
 * @since 4.0.0
 * @category SaveResult
 */
export declare const SaveResult: {
    readonly Success: <A>(args: void) => SaveResult.Success;
    readonly Duplicate: <A>(args: {
        readonly originalId: Snowflake.Snowflake;
        readonly lastReceivedReply: Option.Option<Reply.Reply<A extends Rpc.Any ? A : never>>;
    }) => SaveResult.Duplicate<A extends Rpc.Any ? A : never>;
    readonly $is: <Tag extends "Success" | "Duplicate">(tag: Tag) => {
        <T extends SaveResult<any>>(u: T): u is T & {
            readonly _tag: Tag;
        };
        (u: unknown): u is Extract<SaveResult.Success, {
            readonly _tag: Tag;
        }> | Extract<SaveResult.Duplicate<never>, {
            readonly _tag: Tag;
        }>;
    };
    readonly $match: {
        <A, B, C, D, Cases extends {
            readonly Success: (args: SaveResult.Success) => any;
            readonly Duplicate: (args: SaveResult.Duplicate<A extends Rpc.Any ? A : never>) => any;
        }>(cases: Cases): (self: SaveResult<A extends Rpc.Any ? A : never>) => import("../../Unify.ts").Unify<ReturnType<Cases["Success" | "Duplicate"]>>;
        <A, B, C, D, Cases extends {
            readonly Success: (args: SaveResult.Success) => any;
            readonly Duplicate: (args: SaveResult.Duplicate<A extends Rpc.Any ? A : never>) => any;
        }>(self: SaveResult<A extends Rpc.Any ? A : never>, cases: Cases): import("../../Unify.ts").Unify<ReturnType<Cases["Success" | "Duplicate"]>>;
    };
};
/**
 * @since 4.0.0
 * @category SaveResult
 */
export declare const SaveResultEncoded: {
    readonly Success: Data.TaggedEnum.ConstructorFrom<SaveResult.Success, "_tag">;
    readonly Duplicate: Data.TaggedEnum.ConstructorFrom<SaveResult.DuplicateEncoded, "_tag">;
    readonly $is: <Tag extends "Success" | "Duplicate">(tag: Tag) => (u: unknown) => u is Extract<SaveResult.Success, {
        readonly _tag: Tag;
    }> | Extract<SaveResult.DuplicateEncoded, {
        readonly _tag: Tag;
    }>;
    readonly $match: {
        <Cases extends {
            readonly Success: (args: SaveResult.Success) => any;
            readonly Duplicate: (args: SaveResult.DuplicateEncoded) => any;
        }>(cases: Cases): (value: SaveResult.Encoded) => import("../../Unify.ts").Unify<ReturnType<Cases["Success" | "Duplicate"]>>;
        <Cases extends {
            readonly Success: (args: SaveResult.Success) => any;
            readonly Duplicate: (args: SaveResult.DuplicateEncoded) => any;
        }>(value: SaveResult.Encoded, cases: Cases): import("../../Unify.ts").Unify<ReturnType<Cases["Success" | "Duplicate"]>>;
    };
};
/**
 * @since 4.0.0
 * @category SaveResult
 */
export declare namespace SaveResult {
    /**
     * @since 4.0.0
     * @category SaveResult
     */
    type Encoded = SaveResult.Success | SaveResult.DuplicateEncoded;
    /**
     * @since 4.0.0
     * @category SaveResult
     */
    interface Success {
        readonly _tag: "Success";
    }
    /**
     * @since 4.0.0
     * @category SaveResult
     */
    interface Duplicate<R extends Rpc.Any> {
        readonly _tag: "Duplicate";
        readonly originalId: Snowflake.Snowflake;
        readonly lastReceivedReply: Option.Option<Reply.Reply<R>>;
    }
    /**
     * @since 4.0.0
     * @category SaveResult
     */
    interface DuplicateEncoded {
        readonly _tag: "Duplicate";
        readonly originalId: Snowflake.Snowflake;
        readonly lastReceivedReply: Option.Option<Reply.Encoded>;
    }
    /**
     * @since 4.0.0
     * @category SaveResult
     */
    interface Constructor extends Data.TaggedEnum.WithGenerics<1> {
        readonly taggedEnum: SaveResult<this["A"] extends Rpc.Any ? this["A"] : never>;
    }
}
/**
 * @since 4.0.0
 * @category Encoded
 */
export type Encoded = {
    /**
     * Save the provided message and its associated metadata.
     */
    readonly saveEnvelope: (options: {
        readonly envelope: Envelope.Encoded;
        readonly primaryKey: string | null;
        readonly deliverAt: number | null;
    }) => Effect.Effect<SaveResult.Encoded, PersistenceError>;
    /**
     * Save the provided `Reply` and its associated metadata.
     */
    readonly saveReply: (reply: Reply.Encoded) => Effect.Effect<void, PersistenceError>;
    /**
     * Remove the replies for the specified request.
     */
    readonly clearReplies: (requestId: Snowflake.Snowflake) => Effect.Effect<void, PersistenceError>;
    /**
     * Retrieves the request id for the specified primary key.
     */
    readonly requestIdForPrimaryKey: (primaryKey: string) => Effect.Effect<Option.Option<Snowflake.Snowflake>, PersistenceError>;
    /**
     * Retrieves the replies for the specified requests.
     *
     * - Un-acknowledged chunk replies
     * - WithExit replies
     */
    readonly repliesFor: (requestIds: Arr.NonEmptyArray<string>) => Effect.Effect<Array<Reply.Encoded>, PersistenceError>;
    /**
     * Retrieves the replies for the specified request ids.
     */
    readonly repliesForUnfiltered: (requestIds: Arr.NonEmptyArray<string>) => Effect.Effect<Array<Reply.Encoded>, PersistenceError>;
    /**
     * Retrieves the unprocessed messages for the given shards.
     *
     * A message is unprocessed when:
     *
     * - Requests that have no WithExit replies
     *   - Or they have no unacknowledged chunk replies
     * - The latest AckChunk envelope
     * - All Interrupt's for unprocessed requests
     */
    readonly unprocessedMessages: (shardIds: Arr.NonEmptyArray<string>, now: number) => Effect.Effect<Array<{
        readonly envelope: Envelope.Encoded;
        readonly lastSentReply: Option.Option<Reply.Encoded>;
    }>, PersistenceError>;
    /**
     * Retrieves the unprocessed messages by id.
     */
    readonly unprocessedMessagesById: (messageIds: Arr.NonEmptyArray<Snowflake.Snowflake>, now: number) => Effect.Effect<Array<{
        readonly envelope: Envelope.Encoded;
        readonly lastSentReply: Option.Option<Reply.Encoded>;
    }>, PersistenceError>;
    /**
     * Reset the mailbox state for the provided address.
     */
    readonly resetAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
    /**
     * Clear all messages and replies for the provided address.
     */
    readonly clearAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
    /**
     * Reset the mailbox state for the provided shards.
     */
    readonly resetShards: (shardIds: Arr.NonEmptyArray<string>) => Effect.Effect<void, PersistenceError>;
    /**
     * Used to wrap requests with transactions.
     */
    readonly withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
};
/**
 * @since 4.0.0
 * @category Encoded
 */
export type EncodedUnprocessedOptions<A> = {
    readonly existingShards: Array<number>;
    readonly newShards: Array<number>;
    readonly cursor: Option.Option<A>;
};
/**
 * @since 4.0.0
 * @category Encoded
 */
export type EncodedRepliesOptions<A> = {
    readonly existingRequests: Array<string>;
    readonly newRequests: Array<string>;
    readonly cursor: Option.Option<A>;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (storage: Omit<MessageStorage["Service"], "registerReplyHandler" | "unregisterReplyHandler" | "unregisterShardReplyHandlers">) => Effect.Effect<MessageStorage["Service"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeEncoded: (encoded: Encoded) => Effect.Effect<MessageStorage["Service"], never, Snowflake.Generator>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const noop: MessageStorage["Service"];
/**
 * @since 4.0.0
 * @category Memory
 */
export type MemoryEntry = {
    readonly envelope: Envelope.Encoded;
    lastReceivedChunk: Reply.ChunkEncoded | undefined;
    replies: Array<Reply.Encoded>;
    deliverAt: number | null;
};
/**
 * Can be used in tests to simulate a transaction.
 *
 * @since 4.0.0
 * @category Memory
 */
export declare const MemoryTransaction: Context.Reference<boolean>;
declare const MemoryDriver_base: Context.ServiceClass<MemoryDriver, "effect/cluster/MessageStorage/MemoryDriver", {
    readonly storage: {
        /**
         * Save the provided message and its associated metadata.
         */
        readonly saveRequest: <R extends Rpc.Any>(envelope: Message.OutgoingRequest<R>) => Effect.Effect<SaveResult<R>, PersistenceError | MalformedMessage>;
        /**
         * Save the provided message and its associated metadata.
         */
        readonly saveEnvelope: (envelope: Message.OutgoingEnvelope) => Effect.Effect<void, PersistenceError | MalformedMessage>;
        /**
         * Save the provided `Reply` and its associated metadata.
         */
        readonly saveReply: <R extends Rpc.Any>(reply: Reply.ReplyWithContext<R>) => Effect.Effect<void, PersistenceError | MalformedMessage>;
        /**
         * Clear the `Reply`s for the given request id.
         */
        readonly clearReplies: (requestId: Snowflake.Snowflake) => Effect.Effect<void, PersistenceError>;
        /**
         * Retrieves the replies for the specified requests.
         *
         * - Un-acknowledged chunk replies
         * - WithExit replies
         */
        readonly repliesFor: <R extends Rpc.Any>(requests: Iterable<Message.OutgoingRequest<R>>) => Effect.Effect<Array<Reply.Reply<R>>, PersistenceError | MalformedMessage>;
        /**
         * Retrieves the encoded replies for the specified request ids.
         */
        readonly repliesForUnfiltered: (requestIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Reply.Encoded>, PersistenceError | MalformedMessage>;
        /**
         * Retrieves the request id for the specified primary key.
         */
        readonly requestIdForPrimaryKey: (options: {
            readonly address: EntityAddress;
            readonly tag: string;
            readonly id: string;
        }) => Effect.Effect<Option.Option<Snowflake.Snowflake>, PersistenceError>;
        /**
         * For locally sent messages, register a handler to process the replies.
         */
        readonly registerReplyHandler: <R extends Rpc.Any>(message: Message.OutgoingRequest<R> | Message.IncomingRequest<R>) => Effect.Effect<void, EntityNotAssignedToRunner>;
        /**
         * Unregister the reply handler for the specified message.
         */
        readonly unregisterReplyHandler: (requestId: Snowflake.Snowflake) => Effect.Effect<void>;
        /**
         * Unregister the reply handlers for the specified ShardId.
         */
        readonly unregisterShardReplyHandlers: (shardId: ShardId.ShardId) => Effect.Effect<void>;
        /**
         * Retrieves the unprocessed messages for the specified shards.
         *
         * A message is unprocessed when:
         *
         * - Requests that have no WithExit replies
         *   - Or they have no unacknowledged chunk replies
         * - The latest AckChunk envelope
         * - All Interrupt's for unprocessed requests
         */
        readonly unprocessedMessages: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<Array<Message.Incoming<any>>, PersistenceError>;
        /**
         * Retrieves the unprocessed messages by id.
         */
        readonly unprocessedMessagesById: <R extends Rpc.Any>(messageIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Message.Incoming<R>>, PersistenceError>;
        /**
         * Reset the mailbox state for the provided shards.
         */
        readonly resetShards: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<void, PersistenceError>;
        /**
         * Reset the mailbox state for the provided address.
         */
        readonly resetAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
        /**
         * Clear all messages and replies for the provided address.
         */
        readonly clearAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
        /**
         * Used to wrap requests with transactions.
         */
        readonly withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    };
    readonly encoded: Encoded;
    readonly requests: Map<string, MemoryEntry>;
    readonly requestsByPrimaryKey: Map<string, MemoryEntry>;
    readonly unprocessed: Set<Envelope.Encoded>;
    readonly replyIds: Set<string>;
    readonly journal: Envelope.Encoded[];
    readonly cursors: WeakMap<{}, number>;
}> & {
    readonly make: Effect.Effect<{
        readonly storage: {
            /**
             * Save the provided message and its associated metadata.
             */
            readonly saveRequest: <R extends Rpc.Any>(envelope: Message.OutgoingRequest<R>) => Effect.Effect<SaveResult<R>, PersistenceError | MalformedMessage>;
            /**
             * Save the provided message and its associated metadata.
             */
            readonly saveEnvelope: (envelope: Message.OutgoingEnvelope) => Effect.Effect<void, PersistenceError | MalformedMessage>;
            /**
             * Save the provided `Reply` and its associated metadata.
             */
            readonly saveReply: <R extends Rpc.Any>(reply: Reply.ReplyWithContext<R>) => Effect.Effect<void, PersistenceError | MalformedMessage>;
            /**
             * Clear the `Reply`s for the given request id.
             */
            readonly clearReplies: (requestId: Snowflake.Snowflake) => Effect.Effect<void, PersistenceError>;
            /**
             * Retrieves the replies for the specified requests.
             *
             * - Un-acknowledged chunk replies
             * - WithExit replies
             */
            readonly repliesFor: <R extends Rpc.Any>(requests: Iterable<Message.OutgoingRequest<R>>) => Effect.Effect<Array<Reply.Reply<R>>, PersistenceError | MalformedMessage>;
            /**
             * Retrieves the encoded replies for the specified request ids.
             */
            readonly repliesForUnfiltered: (requestIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Reply.Encoded>, PersistenceError | MalformedMessage>;
            /**
             * Retrieves the request id for the specified primary key.
             */
            readonly requestIdForPrimaryKey: (options: {
                readonly address: EntityAddress;
                readonly tag: string;
                readonly id: string;
            }) => Effect.Effect<Option.Option<Snowflake.Snowflake>, PersistenceError>;
            /**
             * For locally sent messages, register a handler to process the replies.
             */
            readonly registerReplyHandler: <R extends Rpc.Any>(message: Message.OutgoingRequest<R> | Message.IncomingRequest<R>) => Effect.Effect<void, EntityNotAssignedToRunner>;
            /**
             * Unregister the reply handler for the specified message.
             */
            readonly unregisterReplyHandler: (requestId: Snowflake.Snowflake) => Effect.Effect<void>;
            /**
             * Unregister the reply handlers for the specified ShardId.
             */
            readonly unregisterShardReplyHandlers: (shardId: ShardId.ShardId) => Effect.Effect<void>;
            /**
             * Retrieves the unprocessed messages for the specified shards.
             *
             * A message is unprocessed when:
             *
             * - Requests that have no WithExit replies
             *   - Or they have no unacknowledged chunk replies
             * - The latest AckChunk envelope
             * - All Interrupt's for unprocessed requests
             */
            readonly unprocessedMessages: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<Array<Message.Incoming<any>>, PersistenceError>;
            /**
             * Retrieves the unprocessed messages by id.
             */
            readonly unprocessedMessagesById: <R extends Rpc.Any>(messageIds: Iterable<Snowflake.Snowflake>) => Effect.Effect<Array<Message.Incoming<R>>, PersistenceError>;
            /**
             * Reset the mailbox state for the provided shards.
             */
            readonly resetShards: (shardIds: Iterable<ShardId.ShardId>) => Effect.Effect<void, PersistenceError>;
            /**
             * Reset the mailbox state for the provided address.
             */
            readonly resetAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
            /**
             * Clear all messages and replies for the provided address.
             */
            readonly clearAddress: (address: EntityAddress) => Effect.Effect<void, PersistenceError>;
            /**
             * Used to wrap requests with transactions.
             */
            readonly withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
        };
        readonly encoded: Encoded;
        readonly requests: Map<string, MemoryEntry>;
        readonly requestsByPrimaryKey: Map<string, MemoryEntry>;
        readonly unprocessed: Set<Envelope.Encoded>;
        readonly replyIds: Set<string>;
        readonly journal: Envelope.Encoded[];
        readonly cursors: WeakMap<{}, number>;
    }, never, Snowflake.Generator>;
};
/**
 * @since 4.0.0
 * @category Memory
 */
export declare class MemoryDriver extends MemoryDriver_base {
    /**
     * @since 4.0.0
     */
    static readonly layer: Layer.Layer<MemoryDriver>;
}
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerNoop: Layer.Layer<MessageStorage>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerMemory: Layer.Layer<MessageStorage | MemoryDriver, never, ShardingConfig>;
export {};
//# sourceMappingURL=MessageStorage.d.ts.map