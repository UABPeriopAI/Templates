/** @internal */
export const redactedRegistry = /*#__PURE__*/new WeakMap();
/** @internal */
export const value = self => {
  if (redactedRegistry.has(self)) {
    return redactedRegistry.get(self);
  } else {
    throw new Error("Unable to get redacted value" + (self.label ? ` with label: "${self.label}"` : ""));
  }
};
/** @internal */
export const stringOrRedacted = val => typeof val === "string" ? val : value(val);
//# sourceMappingURL=redacted.js.map