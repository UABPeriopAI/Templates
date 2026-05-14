import * as Effect from "../../Effect.ts";
import type { Protocol } from "./RpcClient.ts";
import type { FromServerEncoded } from "./RpcMessage.ts";
/**
 * @since 4.0.0
 */
export declare const withRun: <A extends {
    readonly run: (f: (...args: Array<any>) => Effect.Effect<void>) => Effect.Effect<never>;
}>() => <EX, RX>(f: (write: Parameters<A["run"]>[0]) => Effect.Effect<Omit<A, "run">, EX, RX>) => Effect.Effect<A, EX, RX>;
/**
 * @since 4.0.0
 */
export declare const withRunClient: <EX, RX>(f: (write: (clientId: number, response: FromServerEncoded) => Effect.Effect<void>, clientIds: ReadonlySet<number>) => Effect.Effect<Omit<Protocol["Service"], "run">, EX, RX>) => Effect.Effect<Protocol["Service"], EX, RX>;
//# sourceMappingURL=Utils.d.ts.map