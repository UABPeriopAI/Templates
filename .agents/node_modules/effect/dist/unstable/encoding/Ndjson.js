/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Channel from "../../Channel.js";
import * as ChannelSchema from "../../ChannelSchema.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import { dual, identity } from "../../Function.js";
const NdjsonErrorTypeId = "~effect/encoding/Ndjson/NdjsonError";
const encoder = /*#__PURE__*/new TextEncoder();
/**
 * @since 4.0.0
 * @category errors
 */
export class NdjsonError extends /*#__PURE__*/Data.TaggedError("NdjsonError") {
  /**
   * @since 4.0.0
   */
  [NdjsonErrorTypeId] = NdjsonErrorTypeId;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.kind;
  }
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeString = () => Channel.fromTransform((upstream, _scope) => Effect.succeed(Effect.flatMap(upstream, input => {
  try {
    return Effect.succeed(Arr.of(input.map(item => JSON.stringify(item)).join("\n") + "\n"));
  } catch (cause) {
    return Effect.fail(new NdjsonError({
      kind: "Pack",
      cause
    }));
  }
})));
/**
 * @since 4.0.0
 * @category constructors
 */
export const encode = () => Channel.map(encodeString(), Arr.map(_ => encoder.encode(_)));
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeSchema = schema => () => Channel.pipeTo(ChannelSchema.encode(schema)(), encode());
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeSchemaString = schema => () => Channel.pipeTo(ChannelSchema.encode(schema)(), encodeString());
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeString = options => {
  const lines = Channel.splitLines().pipe(options?.ignoreEmptyLines === true ? Channel.filterArray(line => line.length > 0) : identity);
  return Channel.mapEffect(lines, chunk => {
    try {
      return Effect.succeed(Arr.map(chunk, line => JSON.parse(line)));
    } catch (cause) {
      return Effect.fail(new NdjsonError({
        kind: "Unpack",
        cause
      }));
    }
  });
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const decode = options => {
  return Channel.pipeTo(Channel.decodeText(), decodeString(options));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeSchema = schema => options => Channel.pipeTo(decode(options), ChannelSchema.decodeUnknown(schema)());
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeSchemaString = schema => options => Channel.pipeTo(decodeString(options), ChannelSchema.decodeUnknown(schema)());
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplex = /*#__PURE__*/dual(args => Channel.isChannel(args[0]), (self, options) => Channel.pipeTo(Channel.pipeTo(encode(), self), decode(options)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplexString = /*#__PURE__*/dual(args => Channel.isChannel(args[0]), (self, options) => Channel.pipeTo(Channel.pipeTo(encodeString(), self), decodeString(options)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplexSchema = /*#__PURE__*/dual(2, (self, options) => ChannelSchema.duplexUnknown(duplex(self, options), options));
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplexSchemaString = /*#__PURE__*/dual(2, (self, options) => ChannelSchema.duplexUnknown(duplexString(self, options), options));
//# sourceMappingURL=Ndjson.js.map