/**
 * @since 4.0.0
 */
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
const TypeId = "~effect/sql/SqlError";
const ReasonTypeId = "~effect/sql/SqlError/Reason";
const ReasonFields = {
  cause: Schema.Defect,
  message: /*#__PURE__*/Schema.optional(Schema.String),
  operation: /*#__PURE__*/Schema.optional(Schema.String)
};
/**
 * @since 4.0.0
 */
export class ConnectionError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/ConnectionError")("ConnectionError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return true;
  }
}
/**
 * @since 4.0.0
 */
export class AuthenticationError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/AuthenticationError")("AuthenticationError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return false;
  }
}
/**
 * @since 4.0.0
 */
export class AuthorizationError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/AuthorizationError")("AuthorizationError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return false;
  }
}
/**
 * @since 4.0.0
 */
export class SqlSyntaxError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/SqlSyntaxError")("SqlSyntaxError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return false;
  }
}
/**
 * @since 4.0.0
 */
export class ConstraintError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/ConstraintError")("ConstraintError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return false;
  }
}
/**
 * @since 4.0.0
 */
export class DeadlockError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/DeadlockError")("DeadlockError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return true;
  }
}
/**
 * @since 4.0.0
 */
export class SerializationError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/SerializationError")("SerializationError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return true;
  }
}
/**
 * @since 4.0.0
 */
export class LockTimeoutError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/LockTimeoutError")("LockTimeoutError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return true;
  }
}
/**
 * @since 4.0.0
 */
export class StatementTimeoutError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/StatementTimeoutError")("StatementTimeoutError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return true;
  }
}
/**
 * @since 4.0.0
 */
export class UnknownError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError/UnknownError")("UnknownError", ReasonFields) {
  /**
   * @since 4.0.0
   */
  [ReasonTypeId] = ReasonTypeId;
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return false;
  }
}
/**
 * @since 4.0.0
 */
export const SqlErrorReason = /*#__PURE__*/Schema.Union([ConnectionError, AuthenticationError, AuthorizationError, SqlSyntaxError, ConstraintError, DeadlockError, SerializationError, LockTimeoutError, StatementTimeoutError, UnknownError]);
/**
 * @since 4.0.0
 */
export class SqlError extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/SqlError")("SqlError", {
  reason: SqlErrorReason
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  cause = this.reason;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.reason.message || this.reason._tag;
  }
  /**
   * @since 4.0.0
   */
  get isRetryable() {
    return this.reason.isRetryable;
  }
}
/**
 * @since 4.0.0
 */
export const isSqlError = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 */
export const isSqlErrorReason = u => Predicate.hasProperty(u, ReasonTypeId);
const sqliteCodeFromCause = cause => {
  if (!Predicate.hasProperty(cause, "code")) {
    return undefined;
  }
  const code = cause.code;
  return typeof code === "string" || typeof code === "number" ? code : undefined;
};
const sqliteNumericCodeFromCause = cause => {
  const code = sqliteCodeFromCause(cause);
  if (typeof code === "number") {
    return code;
  }
  if (!Predicate.hasProperty(cause, "errno")) {
    return undefined;
  }
  const errno = cause.errno;
  return typeof errno === "number" ? errno : undefined;
};
const matchesSqliteCode = (code, expected) => code === expected || code.startsWith(expected + "_");
/**
 * @since 4.0.0
 */
export const classifySqliteError = (cause, {
  message,
  operation
} = {}) => {
  const props = {
    cause,
    message,
    operation
  };
  const code = sqliteCodeFromCause(cause);
  if (typeof code === "string") {
    if (matchesSqliteCode(code, "SQLITE_AUTH")) {
      return new AuthenticationError(props);
    }
    if (matchesSqliteCode(code, "SQLITE_PERM")) {
      return new AuthorizationError(props);
    }
    if (matchesSqliteCode(code, "SQLITE_CONSTRAINT")) {
      return new ConstraintError(props);
    }
    if (matchesSqliteCode(code, "SQLITE_BUSY") || matchesSqliteCode(code, "SQLITE_LOCKED")) {
      return new LockTimeoutError(props);
    }
    if (matchesSqliteCode(code, "SQLITE_CANTOPEN")) {
      return new ConnectionError(props);
    }
  }
  const numericCode = sqliteNumericCodeFromCause(cause);
  if (typeof numericCode === "number") {
    const code = numericCode & 0xff;
    switch (code) {
      case 23:
        return new AuthenticationError(props);
      case 3:
        return new AuthorizationError(props);
      case 19:
        return new ConstraintError(props);
      case 5:
      case 6:
        return new LockTimeoutError(props);
      case 14:
        return new ConnectionError(props);
      default:
        return new UnknownError(props);
    }
  }
  return new UnknownError(props);
};
/**
 * @since 4.0.0
 */
export class ResultLengthMismatch extends /*#__PURE__*/Schema.TaggedErrorClass("effect/sql/ResultLengthMismatch")("ResultLengthMismatch", {
  expected: Schema.Number,
  actual: Schema.Number
}) {
  /**
   * @since 4.0.0
   */
  get message() {
    return `Expected ${this.expected} results but got ${this.actual}`;
  }
}
//# sourceMappingURL=SqlError.js.map