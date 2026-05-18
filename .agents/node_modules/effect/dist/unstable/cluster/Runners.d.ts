/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Schema from "../../Schema.ts";
import type { Scope } from "../../Scope.ts";
import * as Rpc from "../rpc/Rpc.ts";
import * as RpcClient_ from "../rpc/RpcClient.ts";
import type { RpcClientError } from "../rpc/RpcClientError.ts";
import * as RpcGroup from "../rpc/RpcGroup.ts";
import * as RpcSchema from "../rpc/RpcSchema.ts";
import type { PersistenceError } from "./ClusterError.ts";
import { AlreadyProcessingMessage, EntityNotAssignedToRunner, MailboxFull, RunnerUnavailable } from "./ClusterError.ts";
import * as Envelope from "./Envelope.ts";
import * as Message from "./Message.ts";
import * as MessageStorage from "./MessageStorage.ts";
import * as Reply from "./Reply.ts";
import type { RunnerAddress } from "./RunnerAddress.ts";
import { ShardingConfig } from "./ShardingConfig.ts";
import * as Snowflake from "./Snowflake.ts";
declare const Runners_base: Context.ServiceClass<Runners, "effect/cluster/Runners", {
    /**
     * Checks if a Runner is responsive.
     */
    readonly ping: (address: RunnerAddress) => Effect.Effect<void, RunnerUnavailable>;
    /**
     * Send a message locally.
     *
     * This ensures that the message hits storage before being sent to the local
     * entity.
     */
    readonly sendLocal: <R extends Rpc.Any>(options: {
        readonly message: Message.Outgoing<R>;
        readonly send: <Rpc extends Rpc.Any>(message: Message.IncomingLocal<Rpc>) => Effect.Effect<void, EntityNotAssignedToRunner | MailboxFull | AlreadyProcessingMessage>;
        readonly simulateRemoteSerialization: boolean;
    }) => Effect.Effect<void, EntityNotAssignedToRunner | MailboxFull | AlreadyProcessingMessage | PersistenceError>;
    /**
     * Send a message to a Runner.
     */
    readonly send: <R extends Rpc.Any>(options: {
        readonly address: RunnerAddress;
        readonly message: Message.Outgoing<R>;
    }) => Effect.Effect<void, EntityNotAssignedToRunner | RunnerUnavailable | MailboxFull | AlreadyProcessingMessage | PersistenceError>;
    /**
     * Notify a Runner that a message is available, then read replies from storage.
     */
    readonly notify: <R extends Rpc.Any>(options: {
        readonly address: Option.Option<RunnerAddress>;
        readonly message: Message.Outgoing<R>;
        readonly discard: boolean;
    }) => Effect.Effect<void, PersistenceError>;
    /**
     * Notify the current Runner that a message is available, then read replies from
     * storage.
     *
     * This ensures that the message hits storage before being sent to the local
     * entity.
     */
    readonly notifyLocal: <R extends Rpc.Any>(options: {
        readonly message: Message.Outgoing<R>;
        readonly notify: (options: Message.IncomingLocal<any>) => Effect.Effect<void, EntityNotAssignedToRunner>;
        readonly discard: boolean;
        readonly storageOnly?: boolean | undefined;
    }) => Effect.Effect<void, PersistenceError>;
    /**
     * Mark a Runner as unavailable.
     */
    readonly onRunnerUnavailable: (address: RunnerAddress) => Effect.Effect<void>;
}>;
/**
 * @since 1.0.0
 * @category context
 */
export declare class Runners extends Runners_base {
}
/**
 * @since 1.0.0
 * @category Constructors
 */
export declare const make: (options: Omit<Runners["Service"], "sendLocal" | "notifyLocal">) => Effect.Effect<Runners["Service"], never, MessageStorage.MessageStorage | Snowflake.Generator | ShardingConfig | Scope>;
/**
 * @since 1.0.0
 * @category No-op
 */
export declare const makeNoop: Effect.Effect<Runners["Service"], never, MessageStorage.MessageStorage | Snowflake.Generator | ShardingConfig | Scope>;
/**
 * @since 1.0.0
 * @category Layers
 */
export declare const layerNoop: Layer.Layer<Runners, never, ShardingConfig | MessageStorage.MessageStorage>;
declare const Rpcs_base: RpcGroup.RpcGroup<Rpc.Rpc<"Ping", Schema.Void, Schema.Void, Schema.Never, never, never> | Rpc.Rpc<"Notify", Schema.Struct<{
    envelope: Schema.Union<readonly [typeof Envelope.PartialRequest, typeof Envelope.AckChunk, typeof Envelope.Interrupt]>;
}>, Schema.Void, Schema.Union<readonly [typeof EntityNotAssignedToRunner, typeof AlreadyProcessingMessage]>, never, never> | Rpc.Rpc<"Effect", Schema.Struct<{
    request: typeof Envelope.PartialRequest;
    persisted: Schema.Boolean;
}>, Schema.Codec<Reply.Encoded, Reply.Encoded, never, never>, Schema.Union<[typeof EntityNotAssignedToRunner, typeof MailboxFull, typeof AlreadyProcessingMessage]>, never, never> | Rpc.Rpc<"Stream", Schema.Struct<{
    request: typeof Envelope.PartialRequest;
    persisted: Schema.Boolean;
}>, RpcSchema.Stream<Schema.Codec<Reply.Encoded, Reply.Encoded, never, never>, Schema.Union<[typeof EntityNotAssignedToRunner, typeof MailboxFull, typeof AlreadyProcessingMessage]>>, Schema.Never, never, never> | Rpc.Rpc<"Envelope", Schema.Struct<{
    envelope: Schema.Union<readonly [typeof Envelope.AckChunk, typeof Envelope.Interrupt]>;
    persisted: Schema.Boolean;
}>, Schema.Void, Schema.Union<[typeof EntityNotAssignedToRunner, typeof MailboxFull, typeof AlreadyProcessingMessage]>, never, never>>;
/**
 * @since 1.0.0
 * @category Rpcs
 */
export declare class Rpcs extends Rpcs_base {
}
/**
 * @since 1.0.0
 * @category Rpcs
 */
export interface RpcClient extends RpcClient_.FromGroup<typeof Rpcs, RpcClientError> {
}
/**
 * @since 1.0.0
 * @category Rpcs
 */
export declare const makeRpcClient: Effect.Effect<RpcClient, never, RpcClient_.Protocol | Scope>;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const makeRpc: Effect.Effect<Runners["Service"], never, Scope | RpcClientProtocol | MessageStorage.MessageStorage | Snowflake.Generator | ShardingConfig>;
/**
 * @since 1.0.0
 * @category Layers
 */
export declare const layerRpc: Layer.Layer<Runners, never, MessageStorage.MessageStorage | RpcClientProtocol | ShardingConfig>;
declare const RpcClientProtocol_base: Context.ServiceClass<RpcClientProtocol, "effect/cluster/Runners/RpcClientProtocol", (address: RunnerAddress) => Effect.Effect<RpcClient_.Protocol["Service"], never, Scope>>;
/**
 * @since 1.0.0
 * @category Client
 */
export declare class RpcClientProtocol extends RpcClientProtocol_base {
}
export {};
//# sourceMappingURL=Runners.d.ts.map