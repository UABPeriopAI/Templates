/**
 * @since 4.0.0
 */
import * as Data from "./Data.js";
const TypeId = "~effect/platform/PlatformError";
/**
 * @since 4.0.0
 * @category Models
 */
export class BadArgument extends /*#__PURE__*/Data.TaggedError("BadArgument") {
  /**
   * @since 4.0.0
   */
  get message() {
    return `${this.module}.${this.method}${this.description ? `: ${this.description}` : ""}`;
  }
}
/**
 * @since 4.0.0
 * @category models
 */
export class SystemError extends Data.Error {
  /**
   * @since 4.0.0
   */
  get message() {
    return `${this._tag}: ${this.module}.${this.method}${this.pathOrDescriptor !== undefined ? ` (${this.pathOrDescriptor})` : ""}${this.description ? `: ${this.description}` : ""}`;
  }
}
/**
 * @since 4.0.0
 * @category Models
 */
export class PlatformError extends /*#__PURE__*/Data.TaggedError("PlatformError") {
  constructor(reason) {
    if ("cause" in reason) {
      super({
        reason,
        cause: reason.cause
      });
    } else {
      super({
        reason
      });
    }
  }
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  get message() {
    return this.reason.message;
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const systemError = options => new PlatformError(new SystemError(options));
/**
 * @since 4.0.0
 * @category constructors
 */
export const badArgument = options => new PlatformError(new BadArgument(options));
//# sourceMappingURL=PlatformError.js.map