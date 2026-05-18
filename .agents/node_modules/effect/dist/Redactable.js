import { pipeArguments } from "./Pipeable.js";
import { hasProperty } from "./Predicate.js";
/**
 * Symbol used to identify objects that implement the {@link Redactable}
 * protocol.
 *
 * Add a method under this key to make an object redactable. The method
 * receives the current `Context` and must return the replacement value.
 *
 * - Use this symbol as the property key when implementing {@link Redactable}.
 * - Registered globally via `Symbol.for("~effect/Redactable")`,
 *   so it is identical across multiple copies of the library at runtime.
 *
 * **Example** (Masking an API key)
 *
 * ```ts
 * import { Context, Redactable } from "effect"
 *
 * class ApiKey {
 *   constructor(readonly raw: string) {}
 *
 *   [Redactable.symbolRedactable](_ctx: Context.Context<never>) {
 *     return this.raw.slice(0, 4) + "..."
 *   }
 * }
 * ```
 *
 * See also:
 * - {@link Redactable} - the interface this symbol belongs to
 * - {@link isRedactable} - check whether a value has this symbol
 *
 * @since 4.0.0
 * @category symbol
 */
export const symbolRedactable = /*#__PURE__*/Symbol.for("~effect/Redactable");
/**
 * Type guard that checks whether a value implements the {@link Redactable}
 * interface.
 *
 * See also:
 * - {@link Redactable} - the interface being checked
 * - {@link redact} - applies redaction if the value is redactable
 *
 * @since 4.0.0
 * @category guards
 */
export const isRedactable = u => hasProperty(u, symbolRedactable);
/**
 * Redacts a value if it implements {@link Redactable}, otherwise returns it
 * unchanged.
 *
 * - Use this as the general-purpose entry point for redaction: it is safe to
 *   call on any value.
 * - Internally calls {@link isRedactable} and, if `true`, delegates to
 *   {@link getRedacted}.
 * - Not recursive: nested redactable values inside the returned object are not
 *   automatically redacted.
 * - Pure with respect to its argument (does not mutate the input).
 *
 * See also:
 * - {@link isRedactable} - check before redacting
 * - {@link getRedacted} - lower-level variant for known redactables
 *
 * @since 4.0.0
 */
export function redact(u) {
  if (isRedactable(u)) return getRedacted(u);
  return u;
}
/**
 * Calls `[symbolRedactable]` on a value that is already known to be
 * {@link Redactable} and returns the result.
 *
 * - Use this when you have already verified the value is `Redactable` (e.g.,
 *   via {@link isRedactable}) and want to avoid a second check.
 * - Reads the current fiber's `Context` from the global fiber reference. If
 *   no fiber is active, an empty `Context` is passed to the redaction
 *   method.
 * - Does not mutate the input.
 *
 * See also:
 * - {@link redact} - higher-level variant that handles non-redactable values
 * - {@link isRedactable} - type guard to verify before calling this
 *
 * @since 4.0.0
 */
export function getRedacted(redactable) {
  return redactable[symbolRedactable](globalThis[currentFiberTypeId]?.context ?? emptyContext);
}
/** @internal */
export const currentFiberTypeId = "~effect/Fiber/currentFiber";
const emptyContext = {
  "~effect/Context": {},
  mapUnsafe: /*#__PURE__*/new Map(),
  pipe() {
    return pipeArguments(this, arguments);
  }
};
//# sourceMappingURL=Redactable.js.map