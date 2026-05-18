import * as Arr from "../../Array.ts";
import * as Channel from "../../Channel.ts";
import * as Schema from "../../Schema.ts";
import * as Transformation from "../../SchemaTransformation.ts";
declare const MsgPackErrorTypeId = "~effect/encoding/MsgPack/MsgPackError";
declare const MsgPackError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "MsgPackError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class MsgPackError extends MsgPackError_base<{
    readonly kind: "Pack" | "Unpack";
    readonly cause: unknown;
}> {
    /**
     * @since 4.0.0
     */
    readonly [MsgPackErrorTypeId] = "~effect/encoding/MsgPack/MsgPackError";
    /**
     * @since 4.0.0
     */
    get message(): "Pack" | "Unpack";
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encode: <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, IE | MsgPackError, Done, Arr.NonEmptyReadonlyArray<unknown>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeSchema: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, MsgPackError | Schema.SchemaError | IE, Done, Arr.NonEmptyReadonlyArray<S["Type"]>, IE, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decode: <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, IE | MsgPackError, Done, Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, IE, Done>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeSchema: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Type"]>, Schema.SchemaError | MsgPackError | IE, Done, Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, IE, Done, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplex: <R, IE, OE, OutDone, InDone>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, OE, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, IE | MsgPackError, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, MsgPackError | OE, OutDone, Arr.NonEmptyReadonlyArray<unknown>, IE, InDone, R>;
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
    }): <OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, MsgPackError | Schema.SchemaError | InErr, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, MsgPackError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <Out extends Schema.Top, In extends Schema.Top, OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<Uint8Array<ArrayBuffer>>, MsgPackError | Schema.SchemaError | InErr, InDone, R>, options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, MsgPackError | Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
};
/**
 * @since 4.0.0
 * @category schemas
 */
export interface schema<S extends Schema.Top> extends Schema.decodeTo<S, Schema.instanceOf<Uint8Array<ArrayBuffer>>> {
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const transformation: Transformation.Transformation<unknown, Uint8Array<ArrayBuffer>>;
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const schema: <S extends Schema.Top>(schema: S) => schema<S>;
export {};
//# sourceMappingURL=Msgpack.d.ts.map