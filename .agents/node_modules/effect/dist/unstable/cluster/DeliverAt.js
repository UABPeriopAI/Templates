import { hasProperty } from "../../Predicate.js";
/**
 * @since 4.0.0
 * @category symbols
 */
export const symbol = "~effect/cluster/DeliverAt";
/**
 * @since 4.0.0
 * @category guards
 */
export const isDeliverAt = self => hasProperty(self, symbol);
/**
 * @since 4.0.0
 * @category accessors
 */
export const toMillis = self => {
  if (isDeliverAt(self)) {
    return self[symbol]().epochMilliseconds;
  }
  return null;
};
//# sourceMappingURL=DeliverAt.js.map