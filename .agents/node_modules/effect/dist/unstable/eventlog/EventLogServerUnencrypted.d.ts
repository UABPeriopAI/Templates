import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import type * as RpcGroup from "../rpc/RpcGroup.ts";
import * as RpcServer from "../rpc/RpcServer.ts";
import type * as Event from "./Event.ts";
import type * as EventGroup from "./EventGroup.ts";
import * as EventJournal from "./EventJournal.ts";
import { Entry, RemoteEntry, type RemoteId } from "./EventJournal.ts";
import * as EventLog from "./EventLog.ts";
import { type EventLogAuthentication, EventLogRemoteRpcs, type StoreId } from "./EventLogMessage.ts";
declare const EventLogServerUnencrypted_base: Context.ServiceClass<EventLogServerUnencrypted, "effect/eventlog/EventLogServerUnencrypted", {
    readonly makeWrite: <Groups extends EventGroup.Any>(schema: EventLog.EventLogSchema<Groups>) => <Tag extends EventGroup.Events<Groups>["tag"], Event extends Event.Any = Event.WithTag<EventGroup.Events<Groups>, Tag>>(options: {
        readonly storeId: StoreId;
        readonly event: Tag;
        readonly payload: Event.Payload<Event>;
    }) => Effect.Effect<Event.Success<Event>, EventLogServerStoreError | Event.Error<Event>>;
}>;
/**
 * @since 4.0.0
 * @category EventLogServerUnencrypted
 */
export declare class EventLogServerUnencrypted extends EventLogServerUnencrypted_base {
}
/**
 * @since 4.0.0
 * @category EventLogServerUnencrypted
 */
export declare const makeWrite: <Groups extends EventGroup.Any>(schema: EventLog.EventLogSchema<Groups>) => Effect.Effect<(<Tag extends EventGroup.Events<Groups>["tag"], Event extends Event.Any = Event.WithTag<EventGroup.Events<Groups>, Tag>>(options: {
    readonly storeId: StoreId;
    readonly event: Tag;
    readonly payload: Event.Payload<Event>;
}) => Effect.Effect<Event.Success<Event>, EventLogServerStoreError | Event.Error<Event>>), never, EventLogServerUnencrypted>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerRpcHandlers: Layer.Layer<Rpc.ToHandler<RpcGroup.Rpcs<typeof EventLogRemoteRpcs>> | EventLogAuthentication, never, Storage | StoreMapping | EventLogServerAuthorization | EventLog.Registry>;
declare const EventLogServerStoreError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EventLogServerStoreError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class EventLogServerStoreError extends EventLogServerStoreError_base<{
    readonly reason: "NotFound" | "PersistenceFailure";
    readonly publicKey?: string | undefined;
    readonly storeId?: StoreId | undefined;
    readonly message?: string | undefined;
}> {
}
declare const EventLogServerAuthError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EventLogServerAuthError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class EventLogServerAuthError extends EventLogServerAuthError_base<{
    readonly reason: "Unauthorized" | "Forbidden";
    readonly publicKey: string;
    readonly storeId?: StoreId | undefined;
    readonly message?: string | undefined;
}> {
}
declare const EventLogServerAuthorization_base: Context.ServiceClass<EventLogServerAuthorization, "effect/eventlog/EventLogServerUnencrypted/EventLogServerAuthorization", {
    readonly authorizeWrite: (options: {
        readonly publicKey: string;
        readonly storeId: StoreId;
        readonly entries: ReadonlyArray<Entry>;
    }) => Effect.Effect<void, EventLogServerAuthError>;
    readonly authorizeRead: (options: {
        readonly publicKey: string;
        readonly storeId: StoreId;
    }) => Effect.Effect<void, EventLogServerAuthError>;
    readonly authorizeIdentity: (options: {
        readonly publicKey: string;
    }) => Effect.Effect<void, EventLogServerAuthError>;
}>;
/**
 * @since 4.0.0
 * @category context
 */
export declare class EventLogServerAuthorization extends EventLogServerAuthorization_base {
}
declare const StoreMapping_base: Context.ServiceClass<StoreMapping, "effect/eventlog/EventLogServerUnencrypted/StoreMapping", {
    readonly resolve: (options: {
        readonly publicKey: string;
        readonly storeId: StoreId;
    }) => Effect.Effect<StoreId, EventLogServerStoreError>;
    readonly hasStore: (options: {
        readonly publicKey: string;
        readonly storeId: StoreId;
    }) => Effect.Effect<boolean, EventLogServerStoreError>;
}>;
/**
 * @since 4.0.0
 * @category context
 */
export declare class StoreMapping extends StoreMapping_base {
}
/**
 * @since 4.0.0
 * @category store
 */
export declare const layerStoreMappingStatic: (options: {
    readonly storeId: StoreId;
}) => Layer.Layer<StoreMapping>;
declare const Storage_base: Context.ServiceClass<Storage, "effect/eventlog/EventLogServerUnencrypted/Storage", {
    readonly getId: Effect.Effect<RemoteId>;
    readonly getOrCreateSessionAuthBinding: (publicKey: string, signingPublicKey: Uint8Array<ArrayBuffer>) => Effect.Effect<Uint8Array<ArrayBuffer>>;
    readonly entriesAfter: (storeId: StoreId, entry: Entry) => Effect.Effect<Array<Entry>>;
    readonly write: (storeId: StoreId, entries: ReadonlyArray<Entry>) => Effect.Effect<ReadonlyArray<RemoteEntry>>;
    readonly changes: (options: {
        readonly storeId: StoreId;
        readonly startSequence: number;
        readonly compactors: ReadonlyMap<string, RegisteredCompactor>;
    }) => Stream.Stream<RemoteEntry>;
    readonly withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare class Storage extends Storage_base {
}
type RegisteredCompactor = {
    readonly events: ReadonlySet<string>;
    readonly effect: (options: {
        readonly entries: ReadonlyArray<Entry>;
        readonly write: (entry: Entry) => Effect.Effect<void>;
    }) => Effect.Effect<void>;
};
/**
 * @since 4.0.0
 * @category compaction
 */
export declare const compactBacklog: (options: {
    readonly remoteEntries: ReadonlyArray<RemoteEntry>;
    readonly compactors: ReadonlyMap<string, RegisteredCompactor>;
}) => Effect.Effect<readonly EventJournal.RemoteEntry[], never, never>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare const makeStorageMemory: Effect.Effect<Storage["Service"], never, Scope.Scope>;
/**
 * @since 4.0.0
 * @category storage
 */
export declare const layerStorageMemory: Layer.Layer<Storage>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: Effect.Effect<{
    readonly makeWrite: <Groups extends EventGroup.Any>(schema: EventLog.EventLogSchema<Groups>) => <Tag extends EventGroup.Events<Groups>["tag"], Event extends Event.Any = Event.WithTag<EventGroup.Events<Groups>, Tag>>(options: {
        readonly storeId: StoreId;
        readonly event: Tag;
        readonly payload: Event.Payload<Event>;
    }) => Effect.Effect<Event.Success<Event>, EventLogServerStoreError | Event.Error<Event>>;
}, never, EventLog.Registry | Storage>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerServer: Layer.Layer<EventLogServerUnencrypted | EventLog.Registry, never, Storage>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: <Groups extends EventGroup.Any, E, R>(_schema: EventLog.EventLogSchema<Groups>, layer: Layer.Layer<EventGroup.ToService<Groups>, E, R>) => Layer.Layer<never, E, Exclude<R, EventLogServerUnencrypted | EventLog.Registry> | EventLogServerAuthorization | RpcServer.Protocol | Storage | StoreMapping>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerNoRpcServer: <Groups extends EventGroup.Any, E, R>(_schema: EventLog.EventLogSchema<Groups>, layer: Layer.Layer<EventGroup.ToService<Groups>, E, R>) => Layer.Layer<Rpc.ToHandler<RpcGroup.Rpcs<typeof EventLogRemoteRpcs>> | EventLogAuthentication, E, Exclude<R, EventLogServerUnencrypted | EventLog.Registry> | EventLogServerAuthorization | Storage | StoreMapping>;
export {};
//# sourceMappingURL=EventLogServerUnencrypted.d.ts.map