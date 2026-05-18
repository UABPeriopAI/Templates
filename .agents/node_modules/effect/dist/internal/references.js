import * as Context from "../Context.js";
import { constTrue, constUndefined } from "../Function.js";
/** @internal */
export const CurrentConcurrency = /*#__PURE__*/Context.Reference("effect/References/CurrentConcurrency", {
  defaultValue: () => "unbounded"
});
/** @internal */
export const CurrentErrorReporters = /*#__PURE__*/Context.Reference("effect/ErrorReporter/CurrentErrorReporters", {
  defaultValue: () => new Set()
});
/** @internal */
export const CurrentStackFrame = /*#__PURE__*/Context.Reference("effect/References/CurrentStackFrame", {
  defaultValue: constUndefined
});
/** @internal */
export const TracerEnabled = /*#__PURE__*/Context.Reference("effect/References/TracerEnabled", {
  defaultValue: constTrue
});
/** @internal */
export const TracerTimingEnabled = /*#__PURE__*/Context.Reference("effect/References/TracerTimingEnabled", {
  defaultValue: constTrue
});
/** @internal */
export const TracerSpanAnnotations = /*#__PURE__*/Context.Reference("effect/References/TracerSpanAnnotations", {
  defaultValue: () => ({})
});
/** @internal */
export const TracerSpanLinks = /*#__PURE__*/Context.Reference("effect/References/TracerSpanLinks", {
  defaultValue: () => []
});
/** @internal */
export const CurrentLogAnnotations = /*#__PURE__*/Context.Reference("effect/References/CurrentLogAnnotations", {
  defaultValue: () => ({})
});
/** @internal */
export const CurrentLogLevel = /*#__PURE__*/Context.Reference("effect/References/CurrentLogLevel", {
  defaultValue: () => "Info"
});
/** @internal */
export const MinimumLogLevel = /*#__PURE__*/Context.Reference("effect/References/MinimumLogLevel", {
  defaultValue: () => "Info"
});
/** @internal */
export const UnhandledLogLevel = /*#__PURE__*/Context.Reference("effect/References/UnhandledLogLevel", {
  defaultValue: () => "Error"
});
/** @internal */
export const CurrentLogSpans = /*#__PURE__*/Context.Reference("effect/References/CurrentLogSpans", {
  defaultValue: () => []
});
//# sourceMappingURL=references.js.map