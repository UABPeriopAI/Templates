/**
 * @since 4.0.0
 */
import * as Layer from "../../Layer.js";
import * as MessageStorage from "./MessageStorage.js";
import * as RunnerHealth from "./RunnerHealth.js";
import * as Runners from "./Runners.js";
import * as RunnerStorage from "./RunnerStorage.js";
import * as Sharding from "./Sharding.js";
import * as ShardingConfig from "./ShardingConfig.js";
/**
 * An in-memory cluster that can be used for testing purposes.
 *
 * MessageStorage is backed by an in-memory driver, and RunnerStorage is backed
 * by an in-memory driver.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/Sharding.layer.pipe(/*#__PURE__*/Layer.provideMerge(Runners.layerNoop), /*#__PURE__*/Layer.provideMerge(MessageStorage.layerMemory), /*#__PURE__*/Layer.provide([RunnerStorage.layerMemory, RunnerHealth.layerNoop]), /*#__PURE__*/Layer.provide(/*#__PURE__*/ShardingConfig.layer()));
//# sourceMappingURL=TestRunner.js.map