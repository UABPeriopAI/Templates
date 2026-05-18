/**
 * @since 4.0.0
 */
import { identity } from "./Function.js";
import * as Schema from "./Schema.js";
import * as Transformation from "./SchemaTransformation.js";
/**
 * @since 4.0.0
 * @experimental
 */
export function getNativeClassSchema(constructor, options) {
  const transformation = Transformation.transform({
    decode: props => new constructor(props),
    encode: identity
  });
  return Schema.instanceOf(constructor, {
    toCodec: () => Schema.link()(options.encoding, transformation),
    ...options.annotations
  }).pipe(Schema.encodeTo(options.encoding, transformation));
}
//# sourceMappingURL=SchemaUtils.js.map