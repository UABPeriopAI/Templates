/**
 * @since 1.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Schema from "../../Schema.js";
import * as Getter from "../../SchemaGetter.js";
/**
 * @since 1.0.0
 * @category models
 */
export class Collector extends /*#__PURE__*/Context.Service()("effect/workers/Transferable/Collector") {}
/**
 * @since 1.0.0
 * @category constructors
 */
export const makeCollectorUnsafe = () => {
  let tranferables = [];
  const unsafeAddAll = transfers => {
    tranferables.push(...transfers);
  };
  const unsafeRead = () => tranferables;
  const unsafeClear = () => {
    const prev = tranferables;
    tranferables = [];
    return prev;
  };
  return Collector.of({
    addAllUnsafe: unsafeAddAll,
    addAll: transferables => Effect.sync(() => unsafeAddAll(transferables)),
    readUnsafe: unsafeRead,
    read: Effect.sync(unsafeRead),
    clearUnsafe: unsafeClear,
    clear: Effect.sync(unsafeClear)
  });
};
/**
 * @since 1.0.0
 * @category constructors
 */
export const makeCollector = /*#__PURE__*/Effect.sync(makeCollectorUnsafe);
/**
 * @since 1.0.0
 * @category accessors
 */
export const addAll = tranferables => Effect.contextWith(services => {
  const collector = Context.getOrUndefined(services, Collector);
  if (!collector) return Effect.void;
  collector.addAllUnsafe(tranferables);
  return Effect.void;
});
/**
 * @since 1.0.0
 * @category Getter
 */
export const getterAddAll = f => Getter.transformOrFail(e => Effect.contextWith(services => {
  const collector = Context.getOrUndefined(services, Collector);
  if (!collector) return Effect.succeed(e);
  collector.addAllUnsafe(f(e));
  return Effect.succeed(e);
}));
/**
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/dual(2, (self, f) => self.annotate({
  toCodecJson: () => passthroughLink
}).pipe(Schema.decode({
  decode: Getter.passthrough(),
  encode: getterAddAll(f)
})));
const passthroughLink = /*#__PURE__*/Schema.link()(Schema.Any, {
  decode: /*#__PURE__*/Getter.passthrough(),
  encode: /*#__PURE__*/Getter.passthrough()
});
/**
 * @since 1.0.0
 * @category schema
 */
export const ImageData = /*#__PURE__*/schema(Schema.Any, _ => [_.data.buffer]);
/**
 * @since 1.0.0
 * @category schema
 */
export const MessagePort = /*#__PURE__*/schema(Schema.Any, _ => [_]);
/**
 * @since 1.0.0
 * @category schema
 */
export const Uint8Array = /*#__PURE__*/schema(Schema.Uint8Array, _ => [_.buffer]);
//# sourceMappingURL=Transferable.js.map