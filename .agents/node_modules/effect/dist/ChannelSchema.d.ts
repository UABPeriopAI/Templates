/**
 * @since 4.0.0
 */
import type * as Arr from "./Array.ts";
import * as Channel from "./Channel.ts";
import * as Schema from "./Schema.ts";
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encode: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Encoded"]>, IE | Schema.SchemaError, Done, Arr.NonEmptyReadonlyArray<S["Type"]>, IE, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const encodeUnknown: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, IE | Schema.SchemaError, Done, Arr.NonEmptyReadonlyArray<S["Type"]>, IE, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decode: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Type"]>, IE | Schema.SchemaError, Done, Arr.NonEmptyReadonlyArray<S["Encoded"]>, IE, Done, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const decodeUnknown: <S extends Schema.Top>(schema: S) => <IE = never, Done = unknown>() => Channel.Channel<Arr.NonEmptyReadonlyArray<S["Type"]>, IE | Schema.SchemaError, Done, Arr.NonEmptyReadonlyArray<S["Encoded"]>, IE, Done, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplex: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <In extends Schema.Top, Out extends Schema.Top>(options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
    }): <OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Encoded"]>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Encoded"]>, Schema.SchemaError | InErr, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <Out extends Schema.Top, OutErr, OutDone, In extends Schema.Top, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Encoded"]>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Encoded"]>, Schema.SchemaError | InErr, InDone, R>, options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const duplexUnknown: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    <In extends Schema.Top, Out extends Schema.Top>(options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
    }): <OutErr, OutDone, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<any>, Schema.SchemaError | InErr, InDone, R>) => Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    <Out extends Schema.Top, OutErr, OutDone, In extends Schema.Top, InErr, InDone, R>(self: Channel.Channel<Arr.NonEmptyReadonlyArray<unknown>, OutErr, OutDone, Arr.NonEmptyReadonlyArray<any>, Schema.SchemaError | InErr, InDone, R>, options: {
        readonly inputSchema: In;
        readonly outputSchema: Out;
    }): Channel.Channel<Arr.NonEmptyReadonlyArray<Out["Type"]>, Schema.SchemaError | OutErr, OutDone, Arr.NonEmptyReadonlyArray<In["Type"]>, InErr, InDone, R | In["EncodingServices"] | Out["DecodingServices"]>;
};
//# sourceMappingURL=ChannelSchema.d.ts.map