/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import type * as Effect from "../../Effect.ts";
import type * as Socket from "./Socket.ts";
declare const SocketServer_base: Context.ServiceClass<SocketServer, "@effect/platform/SocketServer", {
    readonly address: Address;
    readonly run: <R, E, _>(handler: (socket: Socket.Socket) => Effect.Effect<_, E, R>) => Effect.Effect<never, SocketServerError, R>;
}>;
/**
 * @since 4.0.0
 * @category tags
 */
export declare class SocketServer extends SocketServer_base {
}
/**
 * @since 4.0.0
 * @category errors
 */
export declare const ErrorTypeId: ErrorTypeId;
/**
 * @since 4.0.0
 * @category errors
 */
export type ErrorTypeId = "@effect/platform/SocketServer/SocketServerError";
declare const SocketServerOpenError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "SocketServerOpenError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class SocketServerOpenError extends SocketServerOpenError_base<{
    readonly cause: unknown;
}> {
    get message(): string;
}
declare const SocketServerUnknownError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "SocketServerUnknownError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class SocketServerUnknownError extends SocketServerUnknownError_base<{
    readonly cause: unknown;
}> {
    get message(): string;
}
/**
 * @since 4.0.0
 * @category errors
 */
export type SocketServerErrorReason = SocketServerOpenError | SocketServerUnknownError;
declare const SocketServerError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "SocketServerError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class SocketServerError extends SocketServerError_base<{
    readonly reason: SocketServerErrorReason;
}> {
    constructor(props: {
        readonly reason: SocketServerErrorReason;
    });
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: ErrorTypeId;
    /**
     * @since 4.0.0
     */
    get message(): string;
}
/**
 * @since 4.0.0
 * @category models
 */
export type Address = UnixAddress | TcpAddress;
/**
 * @since 4.0.0
 * @category models
 */
export interface TcpAddress {
    readonly _tag: "TcpAddress";
    readonly hostname: string;
    readonly port: number;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface UnixAddress {
    readonly _tag: "UnixAddress";
    readonly path: string;
}
export {};
//# sourceMappingURL=SocketServer.d.ts.map