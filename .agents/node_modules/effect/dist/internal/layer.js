import * as Context from "../Context.js";
import { dual } from "../Function.js";
import * as Layer from "../Layer.js";
import { isEffect } from "./core.js";
import * as effect from "./effect.js";
const provideLayer = (self, layer, options) => effect.scopedWith(scope => effect.flatMap(options?.local ? Layer.buildWithMemoMap(layer, Layer.makeMemoMapUnsafe(), scope) : Layer.buildWithScope(layer, scope), context => effect.provideContext(self, context)));
/** @internal */
export const provide = /*#__PURE__*/dual(args => isEffect(args[0]), (self, source, options) => Context.isContext(source) ? effect.provideContext(self, source) : provideLayer(self, Array.isArray(source) ? Layer.mergeAll(...source) : source, options));
//# sourceMappingURL=layer.js.map