/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import * as Schema from "../../Schema.js";
import { ShardId } from "./ShardId.js";
const TypeId = "~effect/cluster/SingletonAddress";
/**
 * Represents the unique address of an singleton within the cluster.
 *
 * @since 4.0.0
 * @category Address
 */
export class SingletonAddress extends /*#__PURE__*/Schema.Class(TypeId)({
  shardId: ShardId,
  name: Schema.String
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  [Hash.symbol]() {
    return Hash.string(`${this.name}:${this.shardId.toString()}`);
  }
  /**
   * @since 4.0.0
   */
  [Equal.symbol](that) {
    return this.name === that.name && Equal.equals(this.shardId, that.shardId);
  }
}
//# sourceMappingURL=SingletonAddress.js.map