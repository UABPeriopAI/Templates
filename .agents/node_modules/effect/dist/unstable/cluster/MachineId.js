/**
 * @since 4.0.0
 */
import * as Schema from "../../Schema.js";
/**
 * @since 4.0.0
 * @category constructors
 */
export const MachineId = /*#__PURE__*/Schema.Int.pipe(/*#__PURE__*/Schema.brand("~effect/cluster/MachineId"), /*#__PURE__*/Schema.annotate({
  toFormatter: () => machineId => `MachineId(${machineId})`
}));
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = id => id;
//# sourceMappingURL=MachineId.js.map