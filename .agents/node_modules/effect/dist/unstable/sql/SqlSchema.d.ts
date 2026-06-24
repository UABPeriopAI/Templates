/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Cause from "../../Cause.ts";
import * as Effect from "../../Effect.ts";
import type * as Option from "../../Option.ts";
import * as Schema from "../../Schema.ts";
/**
 * Run a sql query with a request schema and a result schema.
 *
 * @since 4.0.0
 * @category constructor
 */
export declare const findAll: <Req extends Schema.Top, Res extends Schema.Top, E, R>(options: {
    readonly Request: Req;
    readonly Result: Res;
    readonly execute: (request: Req["Encoded"]) => Effect.Effect<ReadonlyArray<unknown>, E, R>;
}) => (request: Req["Type"]) => Effect.Effect<Array<Res["Type"]>, E | Schema.SchemaError, Req["EncodingServices"] | Res["DecodingServices"] | R>;
/**
 * Run a sql query with a request schema and a result schema.
 *
 * @since 4.0.0
 * @category constructor
 */
export declare const findNonEmpty: <Req extends Schema.Top, Res extends Schema.Top, E, R>(options: {
    readonly Request: Req;
    readonly Result: Res;
    readonly execute: (request: Req["Encoded"]) => Effect.Effect<ReadonlyArray<unknown>, E, R>;
}) => (request: Req["Type"]) => Effect.Effect<Arr.NonEmptyArray<Res["Type"]>, E | Schema.SchemaError | Cause.NoSuchElementError, Req["EncodingServices"] | Res["DecodingServices"] | R>;
declare const void_: <Req extends Schema.Top, E, R>(options: {
    readonly Request: Req;
    readonly execute: (request: Req["Encoded"]) => Effect.Effect<unknown, E, R>;
}) => (request: Req["Type"]) => Effect.Effect<void, E | Schema.SchemaError, R | Req["EncodingServices"]>;
export { 
/**
 * Run a sql query with a request schema and discard the result.
 *
 * @since 4.0.0
 * @category constructor
 */
void_ as void };
/**
 * Run a sql query with a request schema and a result schema and return the first result.
 *
 * @since 4.0.0
 * @category constructor
 */
export declare const findOne: <Req extends Schema.Top, Res extends Schema.Top, E, R>(options: {
    readonly Request: Req;
    readonly Result: Res;
    readonly execute: (request: Req["Encoded"]) => Effect.Effect<ReadonlyArray<unknown>, E, R>;
}) => (request: Req["Type"]) => Effect.Effect<Res["Type"], E | Schema.SchemaError | Cause.NoSuchElementError, R | Req["EncodingServices"] | Res["DecodingServices"]>;
/**
 * Run a sql query with a request schema and a result schema and return the first result.
 *
 * @since 4.0.0
 * @category constructor
 */
export declare const findOneOption: <Req extends Schema.Top, Res extends Schema.Top, E, R>(options: {
    readonly Request: Req;
    readonly Result: Res;
    readonly execute: (request: Req["Encoded"]) => Effect.Effect<ReadonlyArray<unknown>, E, R>;
}) => (request: Req["Type"]) => Effect.Effect<Option.Option<Res["Type"]>, E | Schema.SchemaError, R | Req["EncodingServices"] | Res["DecodingServices"]>;
//# sourceMappingURL=SqlSchema.d.ts.map