import * as Layer from "../../Layer.ts";
import type * as RpcSerialization from "../rpc/RpcSerialization.ts";
import { SocketServer } from "../socket/SocketServer.ts";
import type { MessageStorage } from "./MessageStorage.ts";
import type { RunnerHealth } from "./RunnerHealth.ts";
import type * as Runners from "./Runners.ts";
import type * as RunnerStorage from "./RunnerStorage.ts";
import type * as Sharding from "./Sharding.ts";
import type { ShardingConfig } from "./ShardingConfig.ts";
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<Sharding.Sharding | Runners.Runners, never, Runners.RpcClientProtocol | ShardingConfig | RpcSerialization.RpcSerialization | SocketServer | MessageStorage | RunnerStorage.RunnerStorage | RunnerHealth>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerClientOnly: Layer.Layer<Sharding.Sharding | Runners.Runners, never, Runners.RpcClientProtocol | ShardingConfig | MessageStorage | RunnerStorage.RunnerStorage>;
//# sourceMappingURL=SocketRunner.d.ts.map