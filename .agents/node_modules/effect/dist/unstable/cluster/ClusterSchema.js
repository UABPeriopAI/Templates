/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import { constFalse, constTrue, identity } from "../../Function.js";
/**
 * @since 4.0.0
 * @category Annotations
 */
export const Persisted = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/Persisted", {
  defaultValue: constFalse
});
/**
 * Whether to wrap the request with a storage transaction, so sql queries are
 * committed atomically.
 *
 * @since 4.0.0
 * @category Annotations
 */
export const WithTransaction = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/WithTransaction", {
  defaultValue: constFalse
});
/**
 * @since 4.0.0
 * @category Annotations
 */
export const Uninterruptible = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/Uninterruptible", {
  defaultValue: constFalse
});
/**
 * @since 4.0.0
 * @category Annotations
 */
export const isUninterruptibleForServer = context => {
  const value = Context.get(context, Uninterruptible);
  return value === true || value === "server";
};
/**
 * @since 4.0.0
 * @category Annotations
 */
export const isUninterruptibleForClient = context => {
  const value = Context.get(context, Uninterruptible);
  return value === true || value === "client";
};
/**
 * @since 4.0.0
 * @category Annotations
 */
export const ShardGroup = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/ShardGroup", {
  defaultValue: () => _ => "default"
});
/**
 * @since 4.0.0
 * @category Annotations
 */
export const ClientTracingEnabled = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/ClientTracingEnabled", {
  defaultValue: constTrue
});
/**
 * Dynamically transform the request annotations based on the request.
 * This only applies to the requests handled by the Entity, not the client.
 *
 * @since 4.0.0
 * @category Annotations
 */
export const Dynamic = /*#__PURE__*/Context.Reference("effect/cluster/ClusterSchema/Dynamic", {
  defaultValue: () => identity
});
//# sourceMappingURL=ClusterSchema.js.map