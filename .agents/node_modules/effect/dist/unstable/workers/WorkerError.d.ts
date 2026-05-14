import * as Schema from "../../Schema.ts";
declare const TypeId: "~effect/workers/WorkerError";
/**
 * @since 4.0.0
 * @category Symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isWorkerError: (u: unknown) => u is WorkerError;
declare const WorkerSpawnError_base: Schema.Class<WorkerSpawnError, Schema.Struct<{
    readonly _tag: Schema.tag<"WorkerSpawnError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class WorkerSpawnError extends WorkerSpawnError_base {
}
declare const WorkerSendError_base: Schema.Class<WorkerSendError, Schema.Struct<{
    readonly _tag: Schema.tag<"WorkerSendError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class WorkerSendError extends WorkerSendError_base {
}
declare const WorkerReceiveError_base: Schema.Class<WorkerReceiveError, Schema.Struct<{
    readonly _tag: Schema.tag<"WorkerReceiveError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class WorkerReceiveError extends WorkerReceiveError_base {
}
declare const WorkerUnknownError_base: Schema.Class<WorkerUnknownError, Schema.Struct<{
    readonly _tag: Schema.tag<"WorkerUnknownError">;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class WorkerUnknownError extends WorkerUnknownError_base {
}
/**
 * @since 4.0.0
 * @category Models
 */
export type WorkerErrorReason = WorkerSpawnError | WorkerSendError | WorkerReceiveError | WorkerUnknownError;
/**
 * @since 4.0.0
 * @category Models
 */
export declare const WorkerErrorReason: Schema.Union<[
    typeof WorkerSpawnError,
    typeof WorkerSendError,
    typeof WorkerReceiveError,
    typeof WorkerUnknownError
]>;
declare const WorkerError_base: Schema.Class<WorkerError, Schema.Struct<{
    readonly _tag: Schema.tag<"WorkerError">;
    readonly reason: Schema.Union<[typeof WorkerSpawnError, typeof WorkerSendError, typeof WorkerReceiveError, typeof WorkerUnknownError]>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class WorkerError extends WorkerError_base {
    constructor(props: {
        readonly reason: WorkerErrorReason;
    });
    /**
     * @since 4.0.0
     */
    readonly [TypeId]: TypeId;
    get message(): string;
}
export {};
//# sourceMappingURL=WorkerError.d.ts.map