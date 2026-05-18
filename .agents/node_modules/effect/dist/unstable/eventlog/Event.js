/**
 * @since 4.0.0
 */
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Msgpack from "../encoding/Msgpack.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/eventlog/Event";
/**
 * @since 4.0.0
 * @category guards
 */
export const isEvent = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
export function make(options) {
  const payload = options.payload ?? Schema.Void;
  const success = options.success ?? Schema.Void;
  const error = options.error ?? Schema.Never;
  return Object.assign(Object.create(Proto), {
    tag: options.tag,
    primaryKey: options.primaryKey,
    payload,
    payloadMsgPack: Msgpack.schema(payload),
    success,
    error
  });
}
export function addError(event, error) {
  return make({
    tag: event.tag,
    primaryKey: event.primaryKey,
    payload: event.payload,
    success: event.success,
    error: Schema.Union([event.error, error])
  });
}
//# sourceMappingURL=Event.js.map