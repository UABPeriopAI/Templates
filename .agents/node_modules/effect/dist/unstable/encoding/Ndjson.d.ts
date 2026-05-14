/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Channel from "../../Channel.ts";
import type * as Schema from "../../Schema.ts";
declare const NdjsonErrorTypeId = "~effect/encoding/Ndjson/NdjsonError";
declare const NdjsonError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "NdjsonError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class NdjsonError extends NdjsonError_base<{
    readonly kind: "Pack" | "Unpack";
    readonly cause: unknown;
}> {
    /**
     * @since 4.0.0
     */
    readonly [NdjsonErrorTypeId] = "~effect/encoding/Ndjson/NdjsonError";
    /**
     * @since 4.0.0
     */
    get message(): "Pack" | "Unpack";
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeString: <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<string>, IE | NdjsonError, Done, Arr.NonEmptyReadonlyArray<unknown>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encode: <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, IE | NdjsonError, Done, Arr.NonEmptyReadonlyArray<unknown>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeSchema: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, NdjsonError | Schema.SchemaError | IE, Done, Arr.NonEmptyReadonlyArray<S["Type"]>, IE, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeSchemaString: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<string>, NdjsonError | Schema.SchemaError | IE, Done, Arr.NonEmptyReadonlyArray<S["Type"]>, IE, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeString: <IE = never, Done = unknown>(options?: {
    readonly ignoreEmptyLines?: boolean | undefined;
}) => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, IE | NdjsonError, Done, Arr.NonEmptyReadonlyArray<string>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decode: <IE = never, Done = unknown>(options?: {
    readonly ignoreEmptyLines?: boolean | undefined;
}) => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, IE | NdjsonError, Done, Arr.NonEmptyReadonlyArray<Uint8Array>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeSchema: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>(options?: {
    readonly ignoreEmptyLines?: boolean | undefined;
}) => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Type"]>, Schema.SchemaError | NdjsonError | IE, Done, Arr.NonEmptyReadonlyArray<Uint8Array>, IE, Done, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeSchemaString: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>(options?: {
    readonly ignoreEmptyLines?: boolean | undefined;
}) => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Type"]>, Schema.SchemaError | NdjsonError | IE, Done, Arr.NonEmptyReadonlyArray<string>, IE, Done, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplex: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (options?: {
        readonly ignoreEmptyLines?: boolean | undefined;
    }): <R, IE, OE, OutDone, InDone>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, OE, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array>, IE | NdjsonError, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, NdjsonError | OE, OutDone, Arr.NonEmptyReadonlyArray<unknown>, IE, InDone, R>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R, IE, OE, OutDone, InDone>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, OE, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array>, IE | NdjsonError, InDone, R>, options?: {
        readonly ignoreEmptyLines?: boolean | undefined;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, NdjsonError | OE, OutDone, Arr.NonEmptyReadonlyArray<unknown>, IE, InDone, R>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplexString: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (options?: {
        readonly ignoreEmptyLines?: boolean | undefined;
    }): <R, IE, OE, OutDone, InDone>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<string>, OE, OutDone, Arr.NonEmptyReadonlyArray<string>, IE | NdjsonError, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, NdjsonError | OE, OutDone, Arr.NonEmptyReadonlyArray<unknown>, IE, InDone, R>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <R, IE, OE, OutDone, InDone>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<string>, OE, OutDone, Arr.NonEmptyReadonlyArray<string>, IE | NdjsonError, InDone, R>, options?: {
        readonly ignoreEmptyLines?: boolean | undefined;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, NdjsonError | OE, OutDone, Arr.NonEmptyReadonlyArray<unknown>, IE, InDone, R>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplexSchema: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <In extends Schema.Top, Out extends Schema.Top>(options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
        readonly ignoreEmptyLines?: boolean | undefined;
    }): <OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array>, NdjsonError | Schema.SchemaError | InErr, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, NdjsonError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <Out extends Schema.Top, In extends Schema.Top, OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array>, NdjsonError | Schema.SchemaError | InErr, InDone, R>, options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
        readonly ignoreEmptyLines?: boolean | undefined;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, NdjsonError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplexSchemaString: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <In extends Schema.Top, Out extends Schema.Top>(options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
        readonly ignoreEmptyLines?: boolean | undefined;
    }): <OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<string>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<string>, NdjsonError | Schema.SchemaError | InErr, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, NdjsonError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <Out extends Schema.Top, In extends Schema.Top, OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<string>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<string>, NdjsonError | Schema.SchemaError | InErr, InDone, R>, options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
        readonly ignoreEmptyLines?: boolean | undefined;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, NdjsonError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
};
export {};
//# sourceMappingURL=Ndjson.d.ts.map