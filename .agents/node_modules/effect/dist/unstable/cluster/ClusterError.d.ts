/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.ts";
import * as Effect from "../../Effect.ts";
import * as Schema from "../../Schema.ts";
import { EntityAddress } from "./EntityAddress.ts";
import { RunnerAddress } from "./RunnerAddress.ts";
import { SnowflakeFromString } from "./Snowflake.ts";
declare const TypeId = "~effect/cluster/ClusterError";
declare const EntityNotAssignedToRunner_base: Schema.Class<EntityNotAssignedToRunner, Schema.Struct<{
    readonly _tag: Schema.tag<"EntityNotAssignedToRunner">;
    readonly address: typeof EntityAddress;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when a Runner receives a message for an entity
 * that it is not assigned to it.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class EntityNotAssignedToRunner extends EntityNotAssignedToRunner_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is EntityNotAssignedToRunner;
}
declare const MalformedMessage_base: Schema.Class<MalformedMessage, Schema.Struct<{
    readonly _tag: Schema.tag<"MalformedMessage">;
    readonly cause: Schema.Defect;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when a message fails to be properly
 * deserialized by an entity.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class MalformedMessage extends MalformedMessage_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is MalformedMessage;
    /**
     * @since 4.0.0
     */
    static refail: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, MalformedMessage, R>;
}
declare const PersistenceError_base: Schema.Class<PersistenceError, Schema.Struct<{
    readonly _tag: Schema.tag<"PersistenceError">;
    readonly cause: Schema.Defect;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when a message fails to be persisted into
 * cluster's mailbox storage.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class PersistenceError extends PersistenceError_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static refail<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, PersistenceError, R>;
}
declare const RunnerNotRegistered_base: Schema.Class<RunnerNotRegistered, Schema.Struct<{
    readonly _tag: Schema.tag<"RunnerNotRegistered">;
    readonly address: typeof RunnerAddress;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when a Runner is not registered with the shard
 * manager.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class RunnerNotRegistered extends RunnerNotRegistered_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
}
declare const RunnerUnavailable_base: Schema.Class<RunnerUnavailable, Schema.Struct<{
    readonly _tag: Schema.tag<"RunnerUnavailable">;
    readonly address: typeof RunnerAddress;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when a Runner is unresponsive.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class RunnerUnavailable extends RunnerUnavailable_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is RunnerUnavailable;
}
declare const MailboxFull_base: Schema.Class<MailboxFull, Schema.Struct<{
    readonly _tag: Schema.tag<"MailboxFull">;
    readonly address: typeof EntityAddress;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when the entities mailbox is full.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class MailboxFull extends MailboxFull_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is MailboxFull;
}
declare const AlreadyProcessingMessage_base: Schema.Class<AlreadyProcessingMessage, Schema.Struct<{
    readonly _tag: Schema.tag<"AlreadyProcessingMessage">;
    readonly envelopeId: SnowflakeFromString;
    readonly address: typeof EntityAddress;
}>, Cause.YieldableError>;
/**
 * Represents an error that occurs when the entity is already processing a
 * request.
 *
 * @since 4.0.0
 * @category errors
 */
export declare class AlreadyProcessingMessage extends AlreadyProcessingMessage_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/ClusterError";
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is AlreadyProcessingMessage;
}
export {};
//# sourceMappingURL=ClusterError.d.ts.map