/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Schema from "../../Schema.ts";
import type * as AST from "../../SchemaAST.ts";
import * as Stream_ from "../../Stream.ts";
declare const StreamSchemaTypeId = "~effect/rpc/RpcSchema/StreamSchema";
/**
 * @since 4.0.0
 * @category Stream
 */
export declare function isStreamSchema(schema: Schema.Top): schema is Stream<Schema.Top, Schema.Top>;
/**
 * @since 4.0.0
 * @category Stream
 */
export interface Stream<A extends Schema.Top, E extends Schema.Top> extends Schema.Bottom<Stream_.Stream<A["Type"], E["Type"]>, Stream_.Stream<A["Encoded"], E["Encoded"]>, A["DecodingServices"] | E["DecodingServices"], A["EncodingServices"] | E["EncodingServices"], AST.Declaration, Stream<A, E>> {
    readonly "Rebuild": Stream<A, E>;
    readonly [StreamSchemaTypeId]: typeof StreamSchemaTypeId;
    readonly success: A;
    readonly error: E;
}
/**
 * @since 4.0.0
 * @category Stream
 */
export declare function Stream<A extends Schema.Top, E extends Schema.Top>(success: A, error: E): Stream<A, E>;
declare const ClientAbort_base: Context.ServiceClass<ClientAbort, "effect/rpc/RpcSchema/ClientAbort", true>;
/**
 * @since 4.0.0
 * @category Cause annotations
 */
export declare class ClientAbort extends ClientAbort_base {
    static annotation: Context.Context<Cause.StackTrace | ClientAbort>;
}
export {};
//# sourceMappingURL=RpcSchema.d.ts.map