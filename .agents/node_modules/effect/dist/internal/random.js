import * as Context from "../Context.js";
/** @internal */
export const Random = /*#__PURE__*/Context.Reference("effect/Random", {
  defaultValue: () => ({
    nextIntUnsafe() {
      return Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) + Number.MIN_SAFE_INTEGER;
    },
    nextDoubleUnsafe() {
      return Math.random();
    }
  })
});
//# sourceMappingURL=random.js.map