import * as Layer from "../../Layer.ts";
import * as RpcServer from "../rpc/RpcServer.ts";
import * as MessageStorage from "./MessageStorage.ts";
import * as RunnerHealth from "./RunnerHealth.ts";
import * as Runners from "./Runners.ts";
import type * as RunnerStorage from "./RunnerStorage.ts";
import * as Sharding from "./Sharding.ts";
import { ShardingConfig } from "./ShardingConfig.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerHandlers: Layer.Layer<import("../rpc/Rpc.ts").Handler<"Ping"> | import("../rpc/Rpc.ts").Handler<"Notify"> | import("../rpc/Rpc.ts").Handler<"Effect"> | import("../rpc/Rpc.ts").Handler<"Stream"> | import("../rpc/Rpc.ts").Handler<"Envelope">, never, MessageStorage.MessageStorage | Sharding.Sharding>;
/**
 * The `RunnerServer` recieves messages from other Runners and forwards them to the
 * `Sharding` layer.
 *
 * It also responds to `Ping` requests.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<never, never, RpcServer.Protocol | Sharding.Sharding | MessageStorage.MessageStorage>;
/**
 * A `RunnerServer` layer that includes the `Runners` & `Sharding` clients.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWithClients: Layer.Layer<Sharding.Sharding | Runners.Runners, never, RpcServer.Protocol | ShardingConfig | Runners.RpcClientProtocol | MessageStorage.MessageStorage | RunnerStorage.RunnerStorage | RunnerHealth.RunnerHealth>;
/**
 * A `Runners` layer that is client only.
 *
 * It will not register with the ShardManager and recieve shard assignments,
 * so this layer can be used to embed a cluster client inside another effect
 * application.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientOnly: Layer.Layer<Sharding.Sharding | Runners.Runners, never, ShardingConfig | Runners.RpcClientProtocol | MessageStorage.MessageStorage | RunnerStorage.RunnerStorage>;
//# sourceMappingURL=RunnerServer.d.ts.map