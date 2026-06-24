/**
 * @since 4.0.0
 */
import type { NoSuchElementError } from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import type { Protocol } from "./RpcServer.ts";
declare const InitialMessage_base: Context.ServiceClass<InitialMessage, "effect/rpc/RpcWorker/InitialMessage", Effect.Effect<readonly [data: unknown, transfers: readonly Transferable[]], never, never>>;
/**
 * @since 4.0.0
 * @category initial message
 */
export declare class InitialMessage extends InitialMessage_base {
}
/**
 * @since 4.0.0
 * @category initial message
 */
export declare namespace InitialMessage {
    /**
     * @since 4.0.0
     * @category initial message
     */
    interface Encoded {
        readonly _tag: "InitialMessage";
        readonly value: unknown;
    }
}
/**
 * @since 4.0.0
 * @category initial message
 */
export declare const makeInitialMessage: <S extends Schema.Top, E, R2>(schema: S, effect: Effect.Effect<S["Type"], E, R2>) => Effect.Effect<readonly [data: unknown, transferables: ReadonlyArray<globalThis.Transferable>], E | Schema.SchemaError, S["EncodingServices"] | R2>;
/**
 * @since 4.0.0
 * @category initial message
 */
export declare const layerInitialMessage: <S extends Schema.Top, R2>(schema: S, build: Effect.Effect<S["Type"], never, R2>) => Layer.Layer<InitialMessage, never, S["EncodingServices"] | R2>;
/**
 * @since 4.0.0
 * @category initial message
 */
export declare const initialMessage: <S extends Schema.Top>(schema: S) => Effect.Effect<S["Type"], NoSuchElementError | Schema.SchemaError, Protocol | S["DecodingServices"]>;
export {};
//# sourceMappingURL=RpcWorker.d.ts.map