/**
 * @since 4.0.0
 */
import { type Pipeable } from "../../Pipeable.ts";
import * as Record from "../../Record.ts";
import type * as Schema from "../../Schema.ts";
import * as Event from "./Event.ts";
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = "~effect/eventlog/EventGroup";
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isEventGroup: (u: unknown) => u is Any;
/**
 * An `EventGroup` is a collection of `Event`s. You can use an `EventGroup` to
 * represent a portion of your domain.
 *
 * The events can be implemented later using the `EventLogBuilder.group` api.
 *
 * @since 4.0.0
 * @category models
 */
export interface EventGroup<out Events extends Event.Any = Event.Any> extends Pipeable {
    readonly [TypeId]: TypeId;
    readonly events: Record.ReadonlyRecord<string, Events>;
    /**
     * Add an `Event` to the `EventGroup`.
     */
    add<Tag extends string, Payload extends Schema.Top = typeof Schema.Void, Success extends Schema.Top = typeof Schema.Void, Error extends Schema.Top = typeof Schema.Never>(options: {
        readonly tag: Tag;
        readonly primaryKey: (payload: Schema.Schema.Type<Payload>) => string;
        readonly payload?: Payload;
        readonly success?: Success;
        readonly error?: Error;
    }): EventGroup<Events | Event.Event<Tag, Payload, Success, Error>>;
    /**
     * Add an error schema to all the events in the `EventGroup`.
     */
    addError<Error extends Schema.Top>(error: Error): EventGroup<Event.AddError<Events, Error>>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Any {
    readonly [TypeId]: TypeId;
}
/**
 * @since 4.0.0
 * @category models
 */
export type AnyWithProps = EventGroup<Event.Any>;
/**
 * @since 4.0.0
 * @category models
 */
export type ToService<A> = A extends EventGroup<infer _Events> ? Event.ToService<_Events> : never;
/**
 * @since 4.0.0
 * @category models
 */
export type Events<Group> = Group extends EventGroup<infer _Events> ? _Events : never;
/**
 * @since 4.0.0
 * @category models
 */
export type ServicesClient<Group> = Event.ServicesClient<Events<Group>>;
/**
 * @since 4.0.0
 * @category models
 */
export type ServicesServer<Group> = Event.ServicesServer<Events<Group>>;
/**
 * An `EventGroup` is a collection of `Event`s. You can use an `EventGroup` to
 * represent a portion of your domain.
 *
 * The events can be implemented later using the `EventLog.group` api.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: EventGroup<never>;
//# sourceMappingURL=EventGroup.d.ts.map