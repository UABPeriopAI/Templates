export * from "./gen/types.gen.js";
import { type Config } from "./gen/client/types.gen.js";
import { KiloClient } from "./gen/sdk.gen.js";
export { type Config as KiloClientConfig, KiloClient };
export declare function createKiloClient(config?: Config & {
    directory?: string;
}): KiloClient;
