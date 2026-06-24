/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import { NodeInspectSymbol } from "../../Inspectable.js";
import * as Schema from "../../Schema.js";
import { RunnerAddress } from "./RunnerAddress.js";
const TypeId = "~effect/cluster/Runner";
/**
 * A `Runner` represents a physical application server that is capable of running
 * entities.
 *
 * Because a Runner represents a physical application server, a Runner must have a
 * unique `address` which can be used to communicate with the server.
 *
 * The version of a Runner is used during rebalancing to give priority to newer
 * application servers and slowly decommission older ones.
 *
 * @since 4.0.0
 * @category models
 */
export class Runner extends /*#__PURE__*/Schema.Class(TypeId)({
  address: RunnerAddress,
  groups: /*#__PURE__*/Schema.Array(Schema.String),
  weight: Schema.Number
}) {
  /**
   * @since 4.0.0
   */
  static format = /*#__PURE__*/Schema.toFormatter(this);
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static decodeSync = /*#__PURE__*/Schema.decodeSync(/*#__PURE__*/Schema.fromJsonString(Runner));
  /**
   * @since 4.0.0
   */
  static encodeSync = /*#__PURE__*/Schema.encodeSync(/*#__PURE__*/Schema.fromJsonString(Runner));
  /**
   * @since 4.0.0
   */
  toString() {
    return Runner.format(this);
  }
  /**
   * @since 4.0.0
   */
  [NodeInspectSymbol]() {
    return this.toString();
  }
  /**
   * @since 4.0.0
   */
  [Equal.symbol](that) {
    return this.address[Equal.symbol](that.address) && this.weight === that.weight;
  }
  /**
   * @since 4.0.0
   */
  [Hash.symbol]() {
    return Hash.string(`${this.address.toString()}:${this.weight}`);
  }
}
/**
 * A `Runner` represents a physical application server that is capable of running
 * entities.
 *
 * Because a Runner represents a physical application server, a Runner must have a
 * unique `address` which can be used to communicate with the server.
 *
 * The version of a Runner is used during rebalancing to give priority to newer
 * application servers and slowly decommission older ones.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const make = props => new Runner(props, {
  disableChecks: true
});
//# sourceMappingURL=Runner.js.map