/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type { Pipeable } from "../../Pipeable.ts";
import type * as Record from "../../Record.ts";
import * as Redacted from "../../Redacted.ts";
import * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import type { Covariant } from "../../Types.ts";
import { Reactivity } from "../reactivity/Reactivity.ts";
import type * as Event from "./Event.ts";
import type * as EventGroup from "./EventGroup.ts";
import { Entry, EventJournal, type EventJournalError } from "./EventJournal.ts";
import * as EventLogEncryption from "./EventLogEncryption.ts";
import { StoreId } from "./EventLogMessage.ts";
import type { EventLogRemote } from "./EventLogRemote.ts";
declare const EventLog_base: Context.ServiceClass<EventLog, "effect/eventlog/EventLog", {
    readonly write: <Groups extends EventGroup.Any, Tag extends Event.Tag<EventGroup.Events<Groups>>>(options: {
        readonly schema: EventLogSchema<Groups>;
        readonly event: Tag;
        readonly payload: Event.PayloadWithTag<EventGroup.Events<Groups>, Tag>;
    }) => Effect.Effect<Event.SuccessWithTag<EventGroup.Events<Groups>, Tag>, Event.ErrorWithTag<EventGroup.Events<Groups>, Tag> | EventJournalError>;
    readonly entries: Effect.Effect<ReadonlyArray<Entry>, EventJournalError>;
    readonly destroy: Effect.Effect<void, EventJournalError>;
}>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class EventLog extends EventLog_base {
}
declare const Registry_base: Context.ServiceClass<Registry, "effect/unstable/eventlog/EventLog/Registry", {
    readonly registerHandlerUnsafe: (options: {
        readonly event: string;
        readonly handler: Handlers.Item<any>;
    }) => void;
    readonly handlers: ReadonlyMap<string, Handlers.Item<any>>;
    readonly registerCompaction: (options: {
        readonly events: ReadonlyArray<string>;
        readonly effect: (options: {
            readonly entries: ReadonlyArray<Entry>;
            readonly write: (entry: Entry) => Effect.Effect<void>;
        }) => Effect.Effect<void>;
    }) => Effect.Effect<void, never, Scope.Scope>;
    readonly compactors: ReadonlyMap<string, {
        readonly events: ReadonlySet<string>;
        readonly effect: (options: {
            readonly entries: ReadonlyArray<Entry>;
            readonly write: (entry: Entry) => Effect.Effect<void>;
        }) => Effect.Effect<void>;
    }>;
    readonly registerRemote: (remote: EventLogRemote["Service"]) => Effect.Effect<void, never, Scope.Scope>;
    readonly handleRemote: (handler: (remote: EventLogRemote["Service"]) => Effect.Effect<void>) => Effect.Effect<void>;
    readonly registerReactivity: (keys: Record<string, ReadonlyArray<string>>) => Effect.Effect<void, never, Scope.Scope>;
    readonly reactivityKeys: Record<string, ReadonlyArray<string>>;
}>;
/**
 * @since 4.0.0
 * @category Registry
 */
export declare class Registry extends Registry_base {
}
/**
 * @since 4.0.0
 * @category Registry
 */
export declare const layerRegistry: Layer.Layer<Registry, never, never>;
declare const Identity_base: Context.ServiceClass<Identity, "effect/eventlog/EventLog/Identity", {
    readonly publicKey: string;
    readonly privateKey: Redacted.Redacted<Uint8Array<ArrayBuffer>>;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Identity extends Identity_base {
}
/**
 * @since 4.0.0
 * @category schema
 */
export type SchemaTypeId = "~effect/eventlog/EventLog/Schema";
/**
 * @since 4.0.0
 * @category schema
 */
export declare const SchemaTypeId: SchemaTypeId;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const isEventLogSchema: (u: unknown) => u is EventLogSchema<EventGroup.Any>;
/**
 * @since 4.0.0
 * @category schema
 */
export interface EventLogSchema<Groups extends EventGroup.Any> {
    readonly [SchemaTypeId]: SchemaTypeId;
    readonly groups: ReadonlyArray<Groups>;
}
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schema: <Groups extends ReadonlyArray<EventGroup.Any>>(...groups: Groups) => EventLogSchema<Groups[number]>;
/**
 * @since 4.0.0
 * @category handlers
 */
export type HandlersTypeId = "~effect/eventlog/EventLog/Handlers";
/**
 * @since 4.0.0
 * @category handlers
 */
export declare const HandlersTypeId: HandlersTypeId;
/**
 * Represents a handled `EventGroup`.
 *
 * @since 4.0.0
 * @category handlers
 */
export interface Handlers<R, Events extends Event.Any = never> extends Pipeable {
    readonly [HandlersTypeId]: {
        _Events: Covariant<Events>;
    };
    readonly group: EventGroup.AnyWithProps;
    readonly handlers: Record.ReadonlyRecord<string, Handlers.Item<R>>;
    readonly context: Context.Context<R>;
    /**
     * Add the implementation for an `Event` to a `Handlers` group.
     */
    handle<Tag extends Event.Tag<Events>, R1>(name: Tag, handler: (options: {
        readonly storeId: StoreId;
        readonly payload: Event.PayloadWithTag<Events, Tag>;
        readonly entry: Entry;
        readonly conflicts: ReadonlyArray<{
            readonly entry: Entry;
            readonly payload: Event.PayloadWithTag<Events, Tag>;
        }>;
    }) => Effect.Effect<Event.SuccessWithTag<Events, Tag>, Event.ErrorWithTag<Events, Tag>, R1>): Handlers<R | R1, Event.ExcludeTag<Events, Tag>>;
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
        readonly [HandlersTypeId]: unknown;
    }
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Item<R> = {
        readonly event: Event.AnyWithProps;
        readonly context: Context.Context<R>;
        readonly handler: (options: {
            readonly storeId: StoreId;
            readonly payload: unknown;
            readonly entry: Entry;
            readonly conflicts: ReadonlyArray<{
                readonly entry: Entry;
                readonly payload: unknown;
            }>;
        }) => Effect.Effect<unknown, unknown, R>;
    };
    /**
     * @since 4.0.0
     * @category handlers
     */
    type ValidateReturn<A> = A extends (Handlers<infer _R, infer _Events> | Effect.Effect<Handlers<infer _R, infer _Events>, infer _EX, infer _RX>) ? [_Events] extends [never] ? A : `Event not handled: ${Event.Tag<_Events>}` : `Must return the implemented handlers`;
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Error<A> = A extends Effect.Effect<Handlers<infer _R, infer _Events>, infer _EX, infer _RX> ? _EX : never;
    /**
     * @since 4.0.0
     * @category handlers
     */
    type Services<A> = A extends Handlers<infer _R, infer _Events> ? _R | Event.Services<_Events> : A extends Effect.Effect<Handlers<infer _R, infer _Events>, infer _EX, infer _RX> ? _R | _RX | Event.Services<_Events> : never;
}
declare const CurrentStoreId_base: Context.Reference<StoreId>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class CurrentStoreId extends CurrentStoreId_base {
}
/**
 * @since 4.0.0
 * @category schema
 */
export declare const IdentitySchema: Schema.Struct<{
    readonly publicKey: Schema.String;
    readonly privateKey: Schema.decodeTo<Schema.Redacted<Schema.Uint8Array>, Schema.Uint8ArrayFromBase64, never, never>;
}>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeIdentityString: (value: string) => Identity["Service"];
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeIdentityString: (identity: Identity["Service"]) => string;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeIdentity: Effect.Effect<Identity["Service"], never, EventLogEncryption.EventLogEncryption>;
/**
 * @since 4.0.0
 * @category handlers
 */
export declare const group: <Events extends Event.Any, Return>(group: EventGroup.EventGroup<Events>, f: (handlers: Handlers<never, Events>) => Handlers.ValidateReturn<Return>) => Layer.Layer<Event.ToService<Events>, Handlers.Error<Return>, Exclude<Handlers.Services<Return>, Scope.Scope | Identity> | Registry>;
/**
 * @since 4.0.0
 * @category compaction
 */
export declare const groupCompaction: <Events extends Event.Any, R>(group: EventGroup.EventGroup<Events>, effect: (options: {
    readonly primaryKey: string;
    readonly entries: ReadonlyArray<Entry>;
    readonly events: ReadonlyArray<Event.TaggedPayload<Events>>;
    readonly write: <Tag extends Event.Tag<Events>>(tag: Tag, payload: Event.PayloadWithTag<Events, Tag>) => Effect.Effect<void, never, Event.PayloadSchemaWithTag<Events, Tag>["EncodingServices"]>;
}) => Effect.Effect<void, never, R>) => Layer.Layer<never, never, R | Event.PayloadSchema<Events>["DecodingServices"] | Registry>;
/**
 * @since 4.0.0
 * @category reactivity
 */
export declare const groupReactivity: <Events extends Event.Any>(group: EventGroup.EventGroup<Events>, keys: { readonly [Tag in Event.Tag<Events>]?: ReadonlyArray<string>; } | ReadonlyArray<string>) => Layer.Layer<never, never, Registry>;
/**
 * @since 4.0.0
 * @category handlers
 */
export declare const makeReplayFromRemote: (options: {
    readonly handlers: ReadonlyMap<string, Handlers.Item<any>>;
    readonly storeId: StoreId;
    readonly identity: Identity["Service"];
    readonly reactivity: Reactivity["Service"];
    readonly reactivityKeys: Record<string, ReadonlyArray<string>>;
    readonly logAnnotations: {
        readonly service: string;
        readonly effect: string;
    };
}) => (args_0: {
    readonly entry: Entry;
    readonly conflicts: ReadonlyArray<Entry>;
}) => Effect.Effect<void, never, never>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerEventLog: Layer.Layer<EventLog | Registry, never, EventJournal | Identity>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: <Groups extends EventGroup.Any, E, R>(_schema: EventLogSchema<Groups>, layer: Layer.Layer<EventGroup.ToService<Groups>, E, R>) => Layer.Layer<EventLog | Registry, E, Exclude<R, EventLog | Registry> | EventJournal | Identity>;
/**
 * @since 4.0.0
 * @category client
 */
export declare const makeClient: <Groups extends EventGroup.Any>(schema: EventLogSchema<Groups>) => Effect.Effect<(<Tag extends Event.Tag<EventGroup.Events<Groups>>>(event: Tag, payload: Event.PayloadWithTag<EventGroup.Events<Groups>, Tag>) => Effect.Effect<Event.SuccessWithTag<EventGroup.Events<Groups>, Tag>, Event.ErrorWithTag<EventGroup.Events<Groups>, Tag> | EventJournalError>), never, EventLog>;
export {};
//# sourceMappingURL=EventLog.d.ts.map