import * as Schema from "../../Schema.ts";
declare const TypeId: "~effect/sql/SqlError";
declare const ReasonTypeId: "~effect/sql/SqlError/Reason";
declare const ConnectionError_base: Schema.Class<ConnectionError, Schema.TaggedStruct<"ConnectionError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class ConnectionError extends ConnectionError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const AuthenticationError_base: Schema.Class<AuthenticationError, Schema.TaggedStruct<"AuthenticationError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class AuthenticationError extends AuthenticationError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const AuthorizationError_base: Schema.Class<AuthorizationError, Schema.TaggedStruct<"AuthorizationError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class AuthorizationError extends AuthorizationError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const SqlSyntaxError_base: Schema.Class<SqlSyntaxError, Schema.TaggedStruct<"SqlSyntaxError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class SqlSyntaxError extends SqlSyntaxError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const ConstraintError_base: Schema.Class<ConstraintError, Schema.TaggedStruct<"ConstraintError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class ConstraintError extends ConstraintError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const DeadlockError_base: Schema.Class<DeadlockError, Schema.TaggedStruct<"DeadlockError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class DeadlockError extends DeadlockError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const SerializationError_base: Schema.Class<SerializationError, Schema.TaggedStruct<"SerializationError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class SerializationError extends SerializationError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const LockTimeoutError_base: Schema.Class<LockTimeoutError, Schema.TaggedStruct<"LockTimeoutError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class LockTimeoutError extends LockTimeoutError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const StatementTimeoutError_base: Schema.Class<StatementTimeoutError, Schema.TaggedStruct<"StatementTimeoutError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class StatementTimeoutError extends StatementTimeoutError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
declare const UnknownError_base: Schema.Class<UnknownError, Schema.TaggedStruct<"UnknownError", {
    cause: Schema.Defect;
    message: Schema.optional<Schema.String>;
    operation: Schema.optional<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class UnknownError extends UnknownError_base {
    /**
     * @since 4.0.0
     */
    readonly [ReasonTypeId]: "~effect/sql/SqlError/Reason";
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
/**
 * @since 4.0.0
 */
export type SqlErrorReason = ConnectionError | AuthenticationError | AuthorizationError | SqlSyntaxError | ConstraintError | DeadlockError | SerializationError | LockTimeoutError | StatementTimeoutError | UnknownError;
/**
 * @since 4.0.0
 */
export declare const SqlErrorReason: Schema.Union<[
    typeof ConnectionError,
    typeof AuthenticationError,
    typeof AuthorizationError,
    typeof SqlSyntaxError,
    typeof ConstraintError,
    typeof DeadlockError,
    typeof SerializationError,
    typeof LockTimeoutError,
    typeof StatementTimeoutError,
    typeof UnknownError
]>;
declare const SqlError_base: Schema.Class<SqlError, Schema.TaggedStruct<"SqlError", {
    readonly reason: Schema.Union<[typeof ConnectionError, typeof AuthenticationError, typeof AuthorizationError, typeof SqlSyntaxError, typeof ConstraintError, typeof DeadlockError, typeof SerializationError, typeof LockTimeoutError, typeof StatementTimeoutError, typeof UnknownError]>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class SqlError extends SqlError_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId]: "~effect/sql/SqlError";
    /**
     * @since 4.0.0
     */
    readonly cause: ConnectionError | AuthenticationError | AuthorizationError | SqlSyntaxError | ConstraintError | DeadlockError | SerializationError | LockTimeoutError | StatementTimeoutError | UnknownError;
    /**
     * @since 4.0.0
     */
    get message(): string;
    /**
     * @since 4.0.0
     */
    get isRetryable(): boolean;
}
/**
 * @since 4.0.0
 */
export declare const isSqlError: (u: unknown) => u is SqlError;
/**
 * @since 4.0.0
 */
export declare const isSqlErrorReason: (u: unknown) => u is SqlErrorReason;
type SqliteClassifyOptions = {
    readonly message?: string | undefined;
    readonly operation?: string | undefined;
};
/**
 * @since 4.0.0
 */
export declare const classifySqliteError: (cause: unknown, { message, operation }?: SqliteClassifyOptions) => SqlErrorReason;
declare const ResultLengthMismatch_base: Schema.Class<ResultLengthMismatch, Schema.TaggedStruct<"ResultLengthMismatch", {
    readonly expected: Schema.Number;
    readonly actual: Schema.Number;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 */
export declare class ResultLengthMismatch extends ResultLengthMismatch_base {
    /**
     * @since 4.0.0
     */
    get message(): string;
}
export {};
//# sourceMappingURL=SqlError.d.ts.map