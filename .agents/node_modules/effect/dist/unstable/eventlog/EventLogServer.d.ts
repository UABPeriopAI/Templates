import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Stream from "../../Stream.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import type * as RpcGroup from "../rpc/RpcGroup.ts";
import type { RemoteId } from "./EventJournal.ts";
import { EventLogAuthentication, EventLogProtocolError, EventLogRemoteRpcs, type StoreId } from "./EventLogMessage.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerAuthMiddleware: Layer.Layer<EventLogAuthentication>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerRpcHandlers: (options: {
    readonly remoteId: RemoteId;
    readonly getOrCreateSessionAuthBinding: (publicKey: string, signingPublicKey: Uint8Array<ArrayBuffer>) => Effect.Effect<Uint8Array<ArrayBuffer>>;
    readonly onWrite: (data: Uint8Array<ArrayBuffer>) => Effect.Effect<void, EventLogProtocolError>;
    readonly changes: (options: {
        readonly publicKey: string;
        readonly storeId: StoreId;
        readonly startSequence: number;
    }) => Stream.Stream<Uint8Array<ArrayBuffer>, unknown>;
}) => Layer.Layer<Rpc.ToHandler<RpcGroup.Rpcs<typeof EventLogRemoteRpcs>> | EventLogAuthentication>;
declare const ChunkedMessageState_base: Context.Reference<Map<number, {
    readonly parts: Array<Uint8Array>;
    count: number;
    bytes: number;
}>>;
/**
 * @since 4.0.0
 * @category ChunkedMessage state
 */
export declare class ChunkedMessageState extends ChunkedMessageState_base {
}
export {};
//# sourceMappingURL=EventLogServer.d.ts.map