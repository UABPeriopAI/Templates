/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.ts";
import * as Cause from "../../Cause.ts";
import * as Effect from "../../Effect.ts";
import * as Request from "../../Request.ts";
import * as RequestResolver from "../../RequestResolver.ts";
import * as Schema from "../../Schema.ts";
import type * as Types from "../../Types.ts";
import { ResultLengthMismatch } from "./SqlError.ts";
/**
 * @since 4.0.0
 * @category requests
 */
export interface SqlRequest<In, A, E, R> extends Request.Request<A, E | Schema.SchemaError, R> {
    readonly payload: In;
}
/**
 * @since 4.0.0
 * @category requests
 */
export declare const request: {
    /**
     * @since 4.0.0
     * @category requests
     */
    <In, A, E, R>(resolver: RequestResolver.RequestResolver<SqlRequest<In, A, E, R>>): (payload: In) => Effect.Effect<A, E | Schema.SchemaError, R>;
    /**
     * @since 4.0.0
     * @category requests
     */
    <In, A, E, R>(payload: In, resolver: RequestResolver.RequestResolver<SqlRequest<In, A, E, R>>): Effect.Effect<A, E | Schema.SchemaError, R>;
};
/**
 * @since 4.0.0
 * @category requests
 */
export declare const SqlRequest: <In, A, E, R>(payload: In) => SqlRequest<In, A, E, R>;
/**
 * Create a resolver for a sql query with a request schema and a result schema.
 *
 * The request schema is used to validate the input of the query.
 * The result schema is used to validate the output of the query.
 *
 * Results are mapped to the requests in order, so the length of the results must match the length of the requests.
 *
 * @since 4.0.0
 * @category resolvers
 */
export declare const ordered: <Req extends Schema.Top, Res extends Schema.Top, _, E, R>(options: {
    readonly Request: Req;
    readonly Result: Res;
    readonly execute: (requests: Arr.NonEmptyArray<Req["Encoded"]>) => Effect.Effect<ReadonlyArray<_>, E, R>;
}) => RequestResolver.RequestResolver<SqlRequest<Req["Type"], Res["Type"], E | ResultLengthMismatch, Req["EncodingServices"] | Res["DecodingServices"] | R>>;
/**
 * Create a resolver the can return multiple results for a single request.
 *
 * Results are grouped by a common key extracted from the request and result.
 *
 * @since 4.0.0
 * @category resolvers
 */
export declare const grouped: <Req extends Schema.Top, Res extends Schema.Top, K, Row, E, R>(options: {
    readonly Request: Req;
    readonly RequestGroupKey: (request: Req["Type"]) => K;
    readonly Result: Res;
    readonly ResultGroupKey: (result: Res["Type"], row: Types.NoInfer<Row>) => K;
    readonly execute: (requests: Arr.NonEmptyArray<Req["Encoded"]>) => Effect.Effect<ReadonlyArray<Row>, E, R>;
}) => RequestResolver.RequestResolver<SqlRequest<Req["Type"], Arr.NonEmptyArray<Res["Type"]>, E | Schema.SchemaError | Cause.NoSuchElementError, Req["EncodingServices"] | Res["DecodingServices"] | R>>;
/**
 * Create a resolver that resolves results by id.
 *
 * @since 4.0.0
 * @category resolvers
 */
export declare const findById: <Id extends Schema.Top, Res extends Schema.Top, Row, E, R>(options: {
    readonly Id: Id;
    readonly Result: Res;
    readonly ResultId: (result: Res["Type"], row: Types.NoInfer<Row>) => Id["Type"];
    readonly execute: (requests: Arr.NonEmptyArray<Id["Encoded"]>) => Effect.Effect<ReadonlyArray<Row>, E, R>;
}) => RequestResolver.RequestResolver<SqlRequest<Id["Type"], Res["Type"], E | Schema.SchemaError | Cause.NoSuchElementError, Id["EncodingServices"] | Res["DecodingServices"] | R>>;
declare const void_: <Req extends Schema.Top, _, E, R>(options: {
    readonly Request: Req;
    readonly execute: (requests: Arr.NonEmptyArray<Req["Encoded"]>) => Effect.Effect<ReadonlyArray<_>, E, R>;
}) => RequestResolver.RequestResolver<SqlRequest<Req["Type"], void, E | Schema.SchemaError, Req["EncodingServices"] | R>>;
export { 
/**
 * Create a resolver that performs side effects.
 *
 * @since 4.0.0
 * @category resolvers
 */
void_ as void };
//# sourceMappingURL=SqlResolver.d.ts.map