import * as Channel from "./Channel.js";
import * as Effect from "./Effect.js";
import { dual } from "./Function.js";
import * as Schema from "./Schema.js";
/**
 * @since 4.0.0
 * @category constructors
 */
export const encode = schema => () => {
  const encode = Schema.encodeEffect(Schema.NonEmptyArray(schema));
  return Channel.fromTransform((upstream, _scope) => Effect.succeed(Effect.flatMap(upstream, chunk => encode(chunk))));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const encodeUnknown = encode;
/**
 * @since 4.0.0
 * @category constructors
 */
export const decode = schema => () => {
  const decode = Schema.decodeEffect(Schema.NonEmptyArray(schema));
  return Channel.fromTransform((upstream, _scope) => Effect.succeed(Effect.flatMap(upstream, chunk => decode(chunk))));
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const decodeUnknown = decode;
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplex = /*#__PURE__*/dual(2, (self, options) => encode(options.inputSchema)().pipe(Channel.pipeTo(self), Channel.pipeTo(decode(options.outputSchema)())));
/**
 * @since 4.0.0
 * @category combinators
 */
export const duplexUnknown = duplex;
//# sourceMappingURL=ChannelSchema.js.map