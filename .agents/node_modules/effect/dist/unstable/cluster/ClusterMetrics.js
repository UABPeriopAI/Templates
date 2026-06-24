/**
 * @since 4.0.0
 */
import * as Metric from "../../Metric.js";
/**
 * @since 4.0.0
 * @category metrics
 */
export const entities = /*#__PURE__*/Metric.gauge("effect_cluster_entities", {
  bigint: true
});
/**
 * @since 4.0.0
 * @category metrics
 */
export const singletons = /*#__PURE__*/Metric.gauge("effect_cluster_singletons", {
  bigint: true
});
/**
 * @since 4.0.0
 * @category metrics
 */
export const runners = /*#__PURE__*/Metric.gauge("effect_cluster_runners", {
  bigint: true
});
/**
 * @since 4.0.0
 * @category metrics
 */
export const runnersHealthy = /*#__PURE__*/Metric.gauge("effect_cluster_runners_healthy", {
  bigint: true
});
/**
 * @since 4.0.0
 * @category metrics
 */
export const shards = /*#__PURE__*/Metric.gauge("effect_cluster_shards", {
  bigint: true
});
//# sourceMappingURL=ClusterMetrics.js.map