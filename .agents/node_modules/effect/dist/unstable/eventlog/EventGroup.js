/**
 * @since 4.0.0
 */
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Record from "../../Record.js";
import * as Event from "./Event.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/eventlog/EventGroup";
/**
 * @since 4.0.0
 * @category guards
 */
export const isEventGroup = u => Predicate.hasProperty(u, TypeId);
const makeProto = options => {
  const EventGroupClass = _ => {};
  const group = Object.assign(EventGroupClass, {
    [TypeId]: TypeId,
    events: options.events,
    add(addOptions) {
      return makeProto({
        events: {
          ...this.events,
          [addOptions.tag]: Event.make(addOptions)
        }
      });
    },
    addError(error) {
      const events = Record.map(this.events, event => Event.addError(event, error));
      return makeProto({
        events
      });
    },
    pipe() {
      return pipeArguments(this, arguments);
    }
  });
  return group;
};
/**
 * An `EventGroup` is a collection of `Event`s. You can use an `EventGroup` to
 * represent a portion of your domain.
 *
 * The events can be implemented later using the `EventLog.group` api.
 *
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/makeProto({
  events: /*#__PURE__*/Record.empty()
});
//# sourceMappingURL=EventGroup.js.map