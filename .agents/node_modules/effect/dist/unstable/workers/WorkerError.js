/**
 * @since 4.0.0
 */
import { hasProperty } from "../../Predicate.js";
import * as Schema from "../../Schema.js";
const TypeId = "~effect/workers/WorkerError";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isWorkerError = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category Models
 */
export class WorkerSpawnError extends /*#__PURE__*/Schema.ErrorClass("effect/workers/WorkerError/WorkerSpawnError")({
  _tag: /*#__PURE__*/Schema.tag("WorkerSpawnError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {}
/**
 * @since 4.0.0
 * @category Models
 */
export class WorkerSendError extends /*#__PURE__*/Schema.ErrorClass("effect/workers/WorkerError/WorkerSendError")({
  _tag: /*#__PURE__*/Schema.tag("WorkerSendError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {}
/**
 * @since 4.0.0
 * @category Models
 */
export class WorkerReceiveError extends /*#__PURE__*/Schema.ErrorClass("effect/workers/WorkerError/WorkerReceiveError")({
  _tag: /*#__PURE__*/Schema.tag("WorkerReceiveError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {}
/**
 * @since 4.0.0
 * @category Models
 */
export class WorkerUnknownError extends /*#__PURE__*/Schema.ErrorClass("effect/workers/WorkerError/WorkerUnknownError")({
  _tag: /*#__PURE__*/Schema.tag("WorkerUnknownError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {}
/**
 * @since 4.0.0
 * @category Models
 */
export const WorkerErrorReason = /*#__PURE__*/Schema.Union([WorkerSpawnError, WorkerSendError, WorkerReceiveError, WorkerUnknownError]);
/**
 * @since 4.0.0
 * @category Models
 */
export class WorkerError extends /*#__PURE__*/Schema.ErrorClass(TypeId)({
  _tag: /*#__PURE__*/Schema.tag("WorkerError"),
  reason: WorkerErrorReason
}) {
  // @effect-diagnostics-next-line overriddenSchemaConstructor:off
  constructor(props) {
    super({
      ...props,
      cause: props.reason.cause
    });
  }
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  get message() {
    return this.reason.message;
  }
}
//# sourceMappingURL=WorkerError.js.map