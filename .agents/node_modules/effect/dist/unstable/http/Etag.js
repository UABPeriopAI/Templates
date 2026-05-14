/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
/**
 * @since 4.0.0
 * @category convertions
 */
export const toString = self => {
  switch (self._tag) {
    case "Weak":
      return `W/"${self.value}"`;
    case "Strong":
      return `"${self.value}"`;
  }
};
/**
 * @since 4.0.0
 * @category models
 */
export class Generator extends /*#__PURE__*/Context.Service()("effect/http/Etag/Generator") {}
const fromFileInfo = info => {
  const mtime = Option.match(info.mtime, {
    onNone: () => "0",
    onSome: mtime => mtime.getTime().toString(16)
  });
  return `${info.size.toString(16)}-${mtime}`;
};
const fromFileWeb = file => {
  return `${file.size.toString(16)}-${file.lastModified.toString(16)}`;
};
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/Layer.succeed(Generator)({
  fromFileInfo(info) {
    return Effect.sync(() => ({
      _tag: "Strong",
      value: fromFileInfo(info)
    }));
  },
  fromFileWeb(file) {
    return Effect.sync(() => ({
      _tag: "Strong",
      value: fromFileWeb(file)
    }));
  }
});
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerWeak = /*#__PURE__*/Layer.succeed(Generator)({
  fromFileInfo(info) {
    return Effect.sync(() => ({
      _tag: "Weak",
      value: fromFileInfo(info)
    }));
  },
  fromFileWeb(file) {
    return Effect.sync(() => ({
      _tag: "Weak",
      value: fromFileWeb(file)
    }));
  }
});
//# sourceMappingURL=Etag.js.map