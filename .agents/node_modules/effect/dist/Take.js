import * as Cause from "./Cause.js";
import * as Effect from "./Effect.js";
import * as Exit from "./Exit.js";
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toPull = take => Exit.isExit(take) ? Exit.isSuccess(take) ? Cause.done(take.value) : take : Effect.succeed(take);
//# sourceMappingURL=Take.js.map