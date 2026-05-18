/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Cause from "../../Cause.ts";
import * as Channel from "../../Channel.ts";
import * as Context from "../../Context.ts";
import * as Data from "../../Data.ts";
import * as Effect from "../../Effect.ts";
import * as FileSystem from "../../FileSystem.ts";
import * as Inspectable from "../../Inspectable.ts";
import * as Path from "../../Path.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as MP from "./Multipasta.ts";
/**
 * @since 4.0.0
 */
export declare const TypeId = "~effect/http/Multipart";
/**
 * @since 4.0.0
 * @category models
 */
export type Part = Field | File;
/**
 * @since 4.0.0
 */
export declare namespace Part {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Proto extends Inspectable.Inspectable {
        readonly [TypeId]: typeof TypeId;
        readonly _tag: string;
    }
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Field extends Part.Proto {
    readonly _tag: "Field";
    readonly key: string;
    readonly contentType: string;
    readonly value: string;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isPart: (u: unknown) => u is Part;
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isField: (u: unknown) => u is Field;
/**
 * @since 4.0.0
 * @category models
 */
export interface File extends Part.Proto {
    readonly _tag: "File";
    readonly key: string;
    readonly name: string;
    readonly contentType: string;
    readonly content: Stream.Stream<Uint8Array, MultipartError>;
    readonly contentEffect: Effect.Effect<Uint8Array, MultipartError>;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isFile: (u: unknown) => u is File;
/**
 * @since 4.0.0
 * @category models
 */
export interface PersistedFile extends Part.Proto {
    readonly _tag: "PersistedFile";
    readonly key: string;
    readonly name: string;
    readonly contentType: string;
    readonly path: string;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isPersistedFile: (u: unknown) => u is PersistedFile;
/**
 * @since 4.0.0
 * @category models
 */
export interface Persisted {
    readonly [key: string]: ReadonlyArray<PersistedFile> | ReadonlyArray<string> | string;
}
declare const MultipartErrorTypeId = "~effect/http/Multipart/MultipartError";
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class MultipartErrorReason extends Data.Error<{
    readonly _tag: "FileTooLarge" | "FieldTooLarge" | "BodyTooLarge" | "TooManyParts" | "InternalError" | "Parse";
    readonly cause?: unknown;
}> {
}
declare const MultipartError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "MultipartError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class MultipartError extends MultipartError_base<{
    readonly reason: MultipartErrorReason;
}> {
    /**
     * @since 4.0.0
     */
    static fromReason(reason: MultipartErrorReason["_tag"], cause?: unknown): MultipartError;
    /**
     * @since 4.0.0
     */
    readonly [MultipartErrorTypeId] = "~effect/http/Multipart/MultipartError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface PersistedFileSchema extends Schema.declare<PersistedFile> {
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const PersistedFileSchema: PersistedFileSchema;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const FilesSchema: Schema.$Array<PersistedFileSchema>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const SingleFileSchema: Schema.decodeTo<PersistedFileSchema, Schema.$Array<PersistedFileSchema>>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const schemaPersisted: <A, I extends Partial<Persisted>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>) => (input: unknown, options?: ParseOptions) => Effect.Effect<A, Schema.SchemaError, RD>;
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const schemaJson: <A, I, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => {
    (field: string): (persisted: Persisted) => Effect.Effect<A, Schema.SchemaError, RD>;
    (persisted: Persisted, field: string): Effect.Effect<A, Schema.SchemaError, RD>;
};
/**
 * @since 4.0.0
 * @category Config
 */
export declare const makeConfig: (headers: Record<string, string>) => Effect.Effect<MP.BaseConfig>;
/**
 * @since 4.0.0
 * @category Parsers
 */
export declare const makeChannel: <IE>(headers: Record<string, string>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Part>, MultipartError | IE, void, Arr.NonEmptyReadonlyArray<Uint8Array>, IE, unknown>;
/**
 * @since 4.0.0
 */
export declare const collectUint8Array: <OE, OD, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, OE, OD, unknown, unknown, unknown, R>) => Effect.Effect<Uint8Array<ArrayBuffer>, OE, R>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toPersisted: (stream: Stream.Stream<Part, MultipartError>, writeFile?: (path: string, file: File) => Effect.Effect<void, MultipartError, FileSystem.FileSystem>) => Effect.Effect<Persisted, MultipartError, FileSystem.FileSystem | Path.Path | Scope.Scope>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const limitsServices: (options: {
    readonly maxParts?: number | undefined;
    readonly maxFieldSize?: FileSystem.SizeInput | undefined;
    readonly maxFileSize?: FileSystem.SizeInput | undefined;
    readonly maxTotalSize?: FileSystem.SizeInput | undefined;
    readonly fieldMimeTypes?: ReadonlyArray<string> | undefined;
}) => Context.Context<never>;
/**
 * @since 4.0.0
 * @category fiber refs
 */
export declare namespace withLimits {
    /**
     * @since 4.0.0
     * @category fiber refs
     */
    type Options = {
        readonly maxParts?: number | undefined;
        readonly maxFieldSize?: FileSystem.SizeInput | undefined;
        readonly maxFileSize?: FileSystem.SizeInput | undefined;
        readonly maxTotalSize?: FileSystem.SizeInput | undefined;
        readonly fieldMimeTypes?: ReadonlyArray<string> | undefined;
    };
}
/**
 * @since 4.0.0
 * @category References
 */
export declare const MaxParts: Context.Reference<number | undefined>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const MaxFieldSize: Context.Reference<FileSystem.SizeInput>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const MaxFileSize: Context.Reference<FileSystem.SizeInput | undefined>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const FieldMimeTypes: Context.Reference<readonly string[]>;
export {};
//# sourceMappingURL=Multipart.d.ts.map