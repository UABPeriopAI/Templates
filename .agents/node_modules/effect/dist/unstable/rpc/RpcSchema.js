/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import { constUndefined } from "../../Function.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Stream_ from "../../Stream.js";
const StreamSchemaTypeId = "~effect/rpc/RpcSchema/StreamSchema";
/**
 * @since 4.0.0
 * @category Stream
 */
export function isStreamSchema(schema) {
  return Predicate.hasProperty(schema, StreamSchemaTypeId);
}
/** @internal */
export function getStreamSchemas(schema) {
  return isStreamSchema(schema) ? Option.some({
    success: schema.success,
    error: schema.error
  }) : Option.none();
}
const schema = /*#__PURE__*/Schema.declare(Stream_.isStream);
/**
 * @since 4.0.0
 * @category Stream
 */
export function Stream(success, error) {
  return Schema.make(schema.ast, {
    [StreamSchemaTypeId]: StreamSchemaTypeId,
    success,
    error
  });
}
/**
 * @since 4.0.0
 * @category Cause annotations
 */
export class ClientAbort extends /*#__PURE__*/Context.Service()("effect/rpc/RpcSchema/ClientAbort") {
  static annotation = /*#__PURE__*/this.context(true).pipe(/*#__PURE__*/Context.add(Cause.StackTrace, {
    name: "ClientAbort",
    stack: constUndefined,
    parent: undefined
  }));
}
//# sourceMappingURL=RpcSchema.js.map