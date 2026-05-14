/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import { NodeInspectSymbol } from "../../Inspectable.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as Schema from "../../Schema.js";
const TypeId = "~effect/cluster/RunnerAddress";
/**
 * @since 4.0.0
 * @category models
 */
export class RunnerAddress extends /*#__PURE__*/Schema.Class(TypeId)({
  host: Schema.String,
  port: Schema.Number
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  [Equal.symbol](that) {
    return this.host === that.host && this.port === that.port;
  }
  /**
   * @since 4.0.0
   */
  [Hash.symbol]() {
    return Hash.string(`${this.host}:${this.port}`);
  }
  /**
   * @since 4.0.0
   */
  [PrimaryKey.symbol]() {
    return `${this.host}:${this.port}`;
  }
  /**
   * @since 4.0.0
   */
  toString() {
    return `RunnerAddress(${this.host}:${this.port})`;
  }
  /**
   * @since 4.0.0
   */
  [NodeInspectSymbol]() {
    return this.toString();
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = (host, port) => new RunnerAddress({
  host,
  port
}, {
  disableChecks: true
});
//# sourceMappingURL=RunnerAddress.js.map