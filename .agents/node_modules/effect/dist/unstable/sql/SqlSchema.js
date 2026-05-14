/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import * as Schema from "../../Schema.js";
/**
 * Run a sql query with a request schema and a result schema.
 *
 * @since 4.0.0
 * @category constructor
 */
export const findAll = options => {
  const encodeRequest = Schema.encodeEffect(options.Request);
  const decode = Schema.decodeUnknownEffect(Schema.mutable(Schema.Array(options.Result)));
  return request => Effect.flatMap(Effect.flatMap(encodeRequest(request), options.execute), decode);
};
/**
 * Run a sql query with a request schema and a result schema.
 *
 * @since 4.0.0
 * @category constructor
 */
export const findNonEmpty = options => {
  const find = findAll(options);
  return request => Effect.flatMap(find(request), results => Arr.isArrayNonEmpty(results) ? Effect.succeed(results) : Effect.fail(new Cause.NoSuchElementError()));
};
const void_ = options => {
  const encode = Schema.encodeEffect(options.Request);
  return request => Effect.asVoid(Effect.flatMap(encode(request), options.execute));
};
export {
/**
 * Run a sql query with a request schema and discard the result.
 *
 * @since 4.0.0
 * @category constructor
 */
void_ as void };
/**
 * Run a sql query with a request schema and a result schema and return the first result.
 *
 * @since 4.0.0
 * @category constructor
 */
export const findOne = options => {
  const encodeRequest = Schema.encodeEffect(options.Request);
  const decode = Schema.decodeUnknownEffect(options.Result);
  return request => Effect.flatMap(Effect.flatMap(encodeRequest(request), options.execute), arr => Arr.isReadonlyArrayNonEmpty(arr) ? decode(arr[0]) : Effect.fail(new Cause.NoSuchElementError()));
};
/**
 * Run a sql query with a request schema and a result schema and return the first result.
 *
 * @since 4.0.0
 * @category constructor
 */
export const findOneOption = options => {
  const encodeRequest = Schema.encodeEffect(options.Request);
  const decode = Schema.decodeUnknownEffect(options.Result);
  return request => Effect.flatMap(Effect.flatMap(encodeRequest(request), options.execute), arr => Arr.isReadonlyArrayNonEmpty(arr) ? Effect.asSome(decode(arr[0])) : Effect.succeedNone);
};
//# sourceMappingURL=SqlSchema.js.map