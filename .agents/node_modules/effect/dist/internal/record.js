/**
 * @since 4.0.0
 */
/** @internal */
export function set(self, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(self, key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  } else {
    self[key] = value;
  }
  return self;
}
//# sourceMappingURL=record.js.map