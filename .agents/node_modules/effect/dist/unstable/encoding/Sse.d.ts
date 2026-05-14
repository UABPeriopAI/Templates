/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Channel from "../../Channel.ts";
import * as Duration from "../../Duration.ts";
import * as Result from "../../Result.ts";
import * as Schema from "../../Schema.ts";
import * as Transformation from "../../SchemaTransformation.ts";
/**
 * @since 4.0.0
 * @category Decoding
 */
export declare const decode: <IE, Done>() => Channel.Channel<NonEmptyReadonlyArray<Event>, IE | Retry, Done, NonEmptyReadonlyArray<string>, IE, Done>;
/**
 * @since 4.0.0
 * @category Decoding
 */
export declare const decodeSchema: <Type extends {
    readonly id?: string | undefined;
    readonly event: string;
    readonly data: string;
}, DecodingServices, IE, Done>(schema: Schema.Decoder<Type, DecodingServices>) => Channel.Channel<NonEmptyReadonlyArray<Type>, IE | Retry | Schema.SchemaError, Done, NonEmptyReadonlyArray<string>, IE, Done, DecodingServices>;
/**
 * @since 4.0.0
 * @category Decoding
 */
export declare const decodeDataSchema: <Type, DecodingServices, IE, Done>(schema: Schema.Decoder<Type, DecodingServices>) => Channel.Channel<NonEmptyReadonlyArray<{
    readonly event: string;
    readonly id: string | undefined;
    readonly data: Type;
}>, IE | Retry | Schema.SchemaError, Done, NonEmptyReadonlyArray<string>, IE, Done, DecodingServices>;
/**
 * Create a SSE parser.
 *
 * Adapted from https://github.com/rexxars/eventsource-parser under MIT license.
 *
 * @since 4.0.0
 * @category Decoding
 */
export declare function makeParser(onParse: (event: AnyEvent) => void): Parser;
/**
 * @since 4.0.0
 * @category Decoding
 */
export interface Parser {
    feed(chunk: string): void;
    reset(): void;
}
/**
 * @since 4.0.0
 * @category Encoding
 */
export declare const encode: <IE, Done>() => Channel.Channel<NonEmptyReadonlyArray<string>, IE, void, NonEmptyReadonlyArray<Event>, IE | Retry, Done>;
/**
 * @since 4.0.0
 * @category Encoding
 */
export declare const encodeSchema: <S extends Schema.Encoder<{
    readonly id?: string | undefined;
    readonly event: string;
    readonly data: string;
}, unknown>, IE, Done>(schema: S) => Channel.Channel<NonEmptyReadonlyArray<string>, IE | Schema.SchemaError, void, NonEmptyReadonlyArray<S["Type"]>, IE | Retry, Done, S["EncodingServices"]>;
/**
 * @since 4.0.0
 * @category Encoding
 */
export interface Encoder {
    write(event: AnyEvent): string;
}
/**
 * @since 4.0.0
 * @category Models
 */
export interface Event {
    readonly _tag: "Event";
    readonly event: string;
    readonly id: string | undefined;
    readonly data: string;
}
/**
 * @since 4.0.0
 * @category Models
 */
export declare const EventEncoded: Schema.Struct<{
    readonly id: Schema.UndefinedOr<Schema.String>;
    readonly event: Schema.String;
    readonly data: Schema.String;
}>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare const Event: Schema.Struct<{
    readonly _tag: Schema.tag<"Event">;
    readonly id: Schema.UndefinedOr<Schema.String>;
    readonly event: Schema.String;
    readonly data: Schema.String;
}>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare const transformEvent: Transformation.Transformation<{
    readonly id?: string | undefined;
    readonly event: string;
    readonly data: string;
}, {
    readonly _tag: "Event";
    readonly id: string | undefined;
    readonly event: string;
    readonly data: string;
}, never, never>;
/**
 * @since 4.0.0
 * @category Models
 */
export interface EventEncoded {
    readonly event: string;
    readonly id: string | undefined;
    readonly data: string;
}
declare const RetryTypeId: "~effect/encoding/Sse/Retry";
declare const Retry_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Readonly<A> & {
    readonly _tag: "Retry";
} & import("../../Pipeable.ts").Pipeable;
/**
 * @since 4.0.0
 * @category Models
 */
export declare class Retry extends Retry_base<{
    readonly duration: Duration.Duration;
    readonly lastEventId: string | undefined;
}> {
    /**
     * @since 4.0.0
     */
    readonly [RetryTypeId]: typeof RetryTypeId;
    /**
     * @since 4.0.0
     */
    static is(u: unknown): u is Retry;
    /**
     * @since 4.0.0
     */
    static filter<A>(u: A): Result.Result<Retry, Exclude<A, Retry>>;
}
/**
 * @since 4.0.0
 * @category Models
 */
export type AnyEvent = Event | Retry;
/**
 * @since 4.0.0
 * @category Encoding
 */
export declare const encoder: Encoder;
export {};
//# sourceMappingURL=Sse.d.ts.map