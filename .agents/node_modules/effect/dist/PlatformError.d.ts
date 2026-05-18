/**
 * @since 4.0.0
 */
import * as Data from "./Data.ts";
declare const TypeId = "~effect/platform/PlatformError";
declare const BadArgument_base: new <A extends Record<string, any> = {}>(args: import("./Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("./Cause.ts").YieldableError & {
    readonly _tag: "BadArgument";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class BadArgument extends BadArgument_base<{
    module: string;
    method: string;
    description?: string | undefined;
    cause?: unknown;
}> {
    /**
     * @since 4.0.0
     */
    get message(): string;
}
/**
 * @since 4.0.0
 * @category Model
 */
export type SystemErrorTag = "AlreadyExists" | "BadResource" | "Busy" | "InvalidData" | "NotFound" | "PermissionDenied" | "TimedOut" | "UnexpectedEof" | "Unknown" | "WouldBlock" | "WriteZero";
/**
 * @since 4.0.0
 * @category models
 */
export declare class SystemError extends Data.Error<{
    _tag: SystemErrorTag;
    module: string;
    method: string;
    description?: string | undefined;
    syscall?: string | undefined;
    pathOrDescriptor?: string | number | undefined;
    cause?: unknown;
}> {
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const PlatformError_base: new <A extends Record<string, any> = {}>(args: import("./Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("./Cause.ts").YieldableError & {
    readonly _tag: "PlatformError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class PlatformError extends PlatformError_base<{
    reason: BadArgument | SystemError;
}> {
    constructor(reason: BadArgument | SystemError);
    /**
     * @since 4.0.0
     */
    readonly [TypeId]: typeof TypeId;
    get message(): string;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const systemError: (options: {
    readonly _tag: SystemErrorTag;
    readonly module: string;
    readonly method: string;
    readonly description?: string | undefined;
    readonly syscall?: string | undefined;
    readonly pathOrDescriptor?: string | number | undefined;
    readonly cause?: unknown;
}) => PlatformError;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const badArgument: (options: {
    readonly module: string;
    readonly method: string;
    readonly description?: string | undefined;
    readonly cause?: unknown;
}) => PlatformError;
export {};
//# sourceMappingURL=PlatformError.d.ts.map