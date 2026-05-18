/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import type * as Inspectable from "../../Inspectable.ts";
import type * as Option from "../../Option.ts";
import * as Schema from "../../Schema.ts";
import type { ParseOptions } from "../../SchemaAST.ts";
import type * as Stream from "../../Stream.ts";
import type * as Headers from "./Headers.ts";
import * as UrlParams from "./UrlParams.ts";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export declare const TypeId = "~effect/http/HttpIncomingMessage";
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isHttpIncomingMessage: (u: unknown) => u is HttpIncomingMessage;
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpIncomingMessage<E = unknown> extends Inspectable.Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly headers: Headers.Headers;
    readonly remoteAddress: Option.Option<string>;
    readonly json: Effect.Effect<Schema.Json, E>;
    readonly text: Effect.Effect<string, E>;
    readonly urlParamsBody: Effect.Effect<UrlParams.UrlParams, E>;
    readonly arrayBuffer: Effect.Effect<ArrayBuffer, E>;
    readonly stream: Stream.Stream<Uint8Array, E>;
}
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyJson: <S extends Schema.Top>(schema: S, options?: ParseOptions | undefined) => <E>(self: HttpIncomingMessage<E>) => Effect.Effect<S["Type"], E | Schema.SchemaError, S["DecodingServices"]>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaBodyUrlParams: <A, I extends Readonly<Record<string, string | ReadonlyArray<string> | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => <E>(self: HttpIncomingMessage<E>) => Effect.Effect<A, E | Schema.SchemaError, RD>;
/**
 * @since 4.0.0
 * @category schema
 */
export declare const schemaHeaders: <A, I extends Readonly<Record<string, string | undefined>>, RD, RE>(schema: Schema.Codec<A, I, RD, RE>, options?: ParseOptions | undefined) => <E>(self: HttpIncomingMessage<E>) => Effect.Effect<A, Schema.SchemaError, RD>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const MaxBodySize: Context.Reference<FileSystem.Size | undefined>;
/**
 * @since 4.0.0
 */
export declare const inspect: <E>(self: HttpIncomingMessage<E>, that: object) => object;
//# sourceMappingURL=HttpIncomingMessage.d.ts.map