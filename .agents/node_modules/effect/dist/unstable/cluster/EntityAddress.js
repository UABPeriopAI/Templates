/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import * as Schema from "../../Schema.js";
import { EntityId } from "./EntityId.js";
import { EntityType } from "./EntityType.js";
import { ShardId } from "./ShardId.js";
const TypeId = "~effect/cluster/EntityAddress";
/**
 * Represents the unique address of an entity within the cluster.
 *
 * @since 4.0.0
 * @category models
 */
export class EntityAddress extends /*#__PURE__*/Schema.Class(TypeId)({
  shardId: ShardId,
  entityType: EntityType,
  entityId: EntityId
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  toString() {
    return `EntityAddress(${this.entityType.toString()}, ${this.entityId.toString()}, ${this.shardId.toString()})`;
  }
  /**
   * @since 4.0.0
   */
  [Equal.symbol](that) {
    return this.entityType === that.entityType && this.entityId === that.entityId && Equal.equals(this.shardId, that.shardId);
  }
  /**
   * @since 4.0.0
   */
  [Hash.symbol]() {
    return Hash.string(`${this.entityType}:${this.entityId}:${this.shardId.toString()}`);
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => new EntityAddress(options, {
  disableChecks: true
});
//# sourceMappingURL=EntityAddress.js.map