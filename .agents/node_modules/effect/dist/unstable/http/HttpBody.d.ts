import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Inspectable from "../../Inspectable.ts";
import type * as PlatformError from "../../PlatformError.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import type { Issue } from "../../SchemaIssue.ts";
import type * as Stream_ from "../../Stream.ts";
import * as UrlParams from "./UrlParams.ts";
declare const TypeId = "~effect/http/HttpBody";
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isHttpBody: (u: unknown) => u is HttpBody;
/**
 * @since 4.0.0
 * @category models
 */
export type HttpBody = Empty | Raw | Uint8Array | FormData | Stream;
/**
 * @since 4.0.0
 */
export declare namespace HttpBody {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Proto extends Inspectable.Inspectable {
        readonly [TypeId]: typeof TypeId;
        readonly _tag: string;
        readonly contentType?: string | undefined;
        readonly contentLength?: number | undefined;
    }
    /**
     * @since 4.0.0
     * @category models
     */
    interface FileLike {
        readonly name: string;
        readonly lastModified: number;
        readonly size: number;
        readonly stream: () => unknown;
        readonly type: string;
    }
}
declare const HttpBodyErrorTypeId = "~effect/http/HttpBody/HttpBodyError";
declare const HttpBodyError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "HttpBodyError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class HttpBodyError extends HttpBodyError_base<{
    readonly reason: ErrorReason;
    readonly cause?: unknown;
}> {
    /**
     * @since 4.0.0
     */
    readonly [HttpBodyErrorTypeId] = "~effect/http/HttpBody/HttpBodyError";
}
/**
 * @since 4.0.0
 * @category errors
 */
export type ErrorReason = {
    readonly _tag: "JsonError";
} | {
    readonly _tag: "SchemaError";
    readonly issue: Issue;
};
declare abstract class Proto implements HttpBody.Proto {
    readonly [TypeId]: typeof TypeId;
    abstract readonly _tag: string;
    constructor();
    abstract toJSON(): unknown;
    [Inspectable.NodeInspectSymbol](): unknown;
    toString(): string;
}
/**
 * @since 4.0.0
 * @category models
 */
export declare class Empty extends Proto {
    readonly _tag = "Empty";
    toJSON(): unknown;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: Empty;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Raw extends Proto {
    readonly _tag = "Raw";
    readonly body: unknown;
    readonly contentType: string | undefined;
    readonly contentLength: number | undefined;
    constructor(body: unknown, contentType: string | undefined, contentLength: number | undefined);
    toJSON(): unknown;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const raw: (body: unknown, options?: {
    readonly contentType?: string | undefined;
    readonly contentLength?: number | undefined;
} | undefined) => Raw;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Uint8Array extends Proto {
    readonly _tag = "Uint8Array";
    readonly body: globalThis.Uint8Array;
    readonly contentType: string;
    readonly contentLength: number;
    constructor(body: globalThis.Uint8Array, contentType: string, contentLength: number);
    toJSON(): unknown;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const uint8Array: (body: globalThis.Uint8Array, contentType?: string) => Uint8Array;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const text: (body: string, contentType?: string) => Uint8Array;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const jsonUnsafe: (body: unknown, contentType?: string) => Uint8Array;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const json: (body: unknown, contentType?: string) => Effect.Effect<Uint8Array, HttpBodyError>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const jsonSchema: <S extends Schema.Top>(schema: S, options?: ParseOptions | undefined) => (body: S["Type"], contentType?: string) => Effect.Effect<Uint8Array, HttpBodyError, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const urlParams: (urlParams: UrlParams.UrlParams, contentType?: string) => Uint8Array;
/**
 * @since 4.0.0
 * @category models
 */
export declare class FormData extends Proto {
    readonly _tag = "FormData";
    readonly contentType: undefined;
    readonly contentLength: undefined;
    readonly formData: globalThis.FormData;
    constructor(formData: globalThis.FormData);
    toJSON(): unknown;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const formData: (body: globalThis.FormData) => FormData;
/**
 * @since 4.0.0
 * @category models
 */
export type FormDataInput = Record<string, FormDataCoercible | ReadonlyArray<FormDataCoercible>>;
/**
 * @since 4.0.0
 * @category models
 */
export type FormDataCoercible = string | number | boolean | globalThis.File | globalThis.Blob | null | undefined;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const formDataRecord: (entries: FormDataInput) => FormData;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Stream extends Proto {
    readonly _tag = "Stream";
    readonly stream: Stream_.Stream<globalThis.Uint8Array, unknown>;
    readonly contentType: string;
    readonly contentLength: number | undefined;
    constructor(stream: Stream_.Stream<globalThis.Uint8Array, unknown>, contentType: string, contentLength: number | undefined);
    toJSON(): unknown;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const stream: (body: Stream_.Stream<globalThis.Uint8Array, unknown>, contentType?: string, contentLength?: number) => Stream;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const file: (path: string, options?: {
    readonly bytesToRead?: FileSystem.SizeInput | undefined;
    readonly chunkSize?: FileSystem.SizeInput | undefined;
    readonly offset?: FileSystem.SizeInput | undefined;
    readonly contentType?: string | undefined;
}) => Effect.Effect<Stream, PlatformError.PlatformError, FileSystem.FileSystem>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fileFromInfo: (path: string, info: FileSystem.File.Info, options?: {
    readonly bytesToRead?: FileSystem.SizeInput | undefined;
    readonly chunkSize?: FileSystem.SizeInput | undefined;
    readonly offset?: FileSystem.SizeInput | undefined;
    readonly contentType?: string | undefined;
}) => Effect.Effect<Stream, PlatformError.PlatformError, FileSystem.FileSystem>;
export {};
//# sourceMappingURL=HttpBody.d.ts.map