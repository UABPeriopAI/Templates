/**
 * @since 4.0.0
 */
import { Packr, Unpackr } from "msgpackr";
import * as Msgpackr from "msgpackr";
import * as Arr from "../../Array.js";
import * as Channel from "../../Channel.js";
import * as ChannelSchema from "../../ChannelSchema.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Issue from "../../SchemaIssue.js";
import * as Transformation from "../../SchemaTransformation.js";
const MsgPackErrorTypeId = "~effect/encoding/MsgPack/MsgPackError";
/**
 * @since 4.0.0
 * @category errors
 */
export class MsgPackError extends /*#__PURE__*/Data.TaggedError("MsgPackError") {
  /**
   * @since 4.0.0
   */
  [MsgPackErrorTypeId] = MsgPackErrorTypeId;
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
export const encode = () => Channel.fromTransform((upstream, _scope) => Effect.sync(() => {
  const packr = new Packr();
  return Effect.flatMap(upstream, chunk => {
    try {
      return Effect.succeed(Arr.map(chunk, item => packr.pack(item)));
    } catch (cause) {
      return Effect.fail(new MsgPackError({
        kind: "Pack",
        cause
      }));
    }
  });
}));
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeSchema = schema => () => Channel.pipeTo(ChannelSchema.encode(schema)(), encode());
/**
 * @since 4.0.0
 * @category constructors
 */
export const decode = () => Channel.fromTransform((upstream, _scope) => Effect.sync(() => {
  const unpackr = new Unpackr();
  let incomplete = undefined;
  return Effect.flatMap(upstream, function loop(chunk) {
    const out = Arr.empty();
    for (let i = 0; i < chunk.length; i++) {
      let buf = chunk[i];
      if (incomplete !== undefined) {
        const prev = buf;
        buf = new Uint8Array(incomplete.length + buf.length);
        buf.set(incomplete);
        buf.set(prev, incomplete.length);
        incomplete = undefined;
      }
      try {
        out.push(...unpackr.unpackMultiple(buf));
      } catch (cause) {
        const error = cause;
        if (error.incomplete) {
          incomplete = buf.subarray(error.lastPosition);
          if (error.values) {
            out.push(...error.values);
          }
        } else {
          return Effect.fail(new MsgPackError({
            kind: "Unpack",
            cause
          }));
        }
      }
    }
    return Arr.isReadonlyArrayNonEmpty(out) ? Effect.succeed(out) : Effect.flatMap(upstream, loop);
  });
}));
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeSchema = schema => () => Channel.pipeTo(decode(), ChannelSchema.decodeUnknown(schema)());
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplex = self => encode().pipe(Channel.pipeTo(self), Channel.pipeTo(decode()));
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplexSchema = /*#__PURE__*/dual(2, (self, options) => ChannelSchema.duplexUnknown(duplex(self), options));
/**
 * @since 4.0.0
 * @category schemas
 */
export const transformation = /*#__PURE__*/Transformation.transformOrFail({
  decode(e, _options) {
    try {
      return Effect.succeed(Msgpackr.decode(e));
    } catch (cause) {
      return Effect.fail(new Issue.InvalidValue(Option.some(e), {
        message: Predicate.hasProperty(cause, "message") ? String(cause.message) : String(cause)
      }));
    }
  },
  encode(t, _options) {
    try {
      return Effect.succeed(Msgpackr.encode(t));
    } catch (cause) {
      return Effect.fail(new Issue.InvalidValue(Option.some(t), {
        message: Predicate.hasProperty(cause, "message") ? String(cause.message) : String(cause)
      }));
    }
  }
});
/**
 * @since 4.0.0
 * @category schemas
 */
export const schema = schema => Schema.Uint8Array.pipe(Schema.decodeTo(schema, transformation));
//# sourceMappingURL=Msgpack.js.map