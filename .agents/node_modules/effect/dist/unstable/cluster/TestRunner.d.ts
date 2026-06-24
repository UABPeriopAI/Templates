/**
 * @since 4.0.0
 */
import * as Layer from "../../Layer.ts";
import * as MessageStorage from "./MessageStorage.ts";
import * as Runners from "./Runners.ts";
import * as Sharding from "./Sharding.ts";
/**
 * An in-memory cluster that can be used for testing purposes.
 *
 * MessageStorage is backed by an in-memory driver, and RunnerStorage is backed
 * by an in-memory driver.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<Sharding.Sharding | Runners.Runners | MessageStorage.MessageStorage | MessageStorage.MemoryDriver>;
//# sourceMappingURL=TestRunner.d.ts.map