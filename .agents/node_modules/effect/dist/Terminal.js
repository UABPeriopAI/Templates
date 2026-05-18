import * as Context from "./Context.js";
import * as Predicate from "./Predicate.js";
import * as Schema from "./Schema.js";
const TypeId = "~effect/platform/Terminal";
const QuitErrorTypeId = "effect/platform/Terminal/QuitError";
/**
 * A `QuitError` represents an error that occurs when a user attempts to
 * quit out of a `Terminal` prompt for input (usually by entering `ctrl`+`c`).
 *
 * @since 4.0.0
 * @category QuitError
 */
export class QuitError extends /*#__PURE__*/Schema.ErrorClass("QuitError")({
  _tag: /*#__PURE__*/Schema.tag("QuitError")
}) {
  /**
   * @since 4.0.0
   */
  [QuitErrorTypeId] = QuitErrorTypeId;
}
/**
 * @since 4.0.0
 * @category QuitError
 */
export const isQuitError = u => Predicate.hasProperty(u, QuitErrorTypeId);
/**
 * @since 4.0.0
 * @category Services
 */
export const Terminal = /*#__PURE__*/Context.Service("effect/platform/Terminal");
/**
 * Creates a Terminal implementation
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = impl => Terminal.of({
  ...impl,
  [TypeId]: TypeId
});
//# sourceMappingURL=Terminal.js.map