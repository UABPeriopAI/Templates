/**
 * @since 4.0.0
 */
import * as Predicate from "../../Predicate.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
import * as Headers from "../http/Headers.js";
import { EntityAddress } from "./EntityAddress.js";
import { SnowflakeFromBigInt } from "./Snowflake.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/cluster/Envelope";
/**
 * @since 4.0.0
 * @category models
 */
export class PartialRequest extends /*#__PURE__*/Schema.Opaque()(/*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Request"),
  requestId: SnowflakeFromBigInt,
  address: EntityAddress,
  tag: Schema.String,
  payload: Schema.Any,
  headers: Headers.HeadersSchema,
  traceId: /*#__PURE__*/Schema.optional(Schema.String),
  spanId: /*#__PURE__*/Schema.optional(Schema.String),
  sampled: /*#__PURE__*/Schema.optional(Schema.Boolean)
})) {}
/**
 * @since 4.0.0
 * @category models
 */
export class AckChunk extends /*#__PURE__*/Schema.Class("effect/cluster/Envelope/AckChunk")({
  _tag: /*#__PURE__*/Schema.tag("AckChunk"),
  id: SnowflakeFromBigInt,
  address: EntityAddress,
  requestId: SnowflakeFromBigInt,
  replyId: SnowflakeFromBigInt
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  withRequestId(requestId) {
    return new AckChunk({
      ...this,
      requestId
    });
  }
}
/**
 * @since 4.0.0
 * @category models
 */
export class Interrupt extends /*#__PURE__*/Schema.Class("effect/cluster/Envelope/Interrupt")({
  _tag: /*#__PURE__*/Schema.tag("Interrupt"),
  id: SnowflakeFromBigInt,
  address: EntityAddress,
  requestId: SnowflakeFromBigInt
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  withRequestId(requestId) {
    return new Interrupt({
      ...this,
      requestId
    });
  }
}
/**
 * @since 4.0.0
 * @category schemas
 */
export const Partial = /*#__PURE__*/Schema.Union([PartialRequest, AckChunk, Interrupt]);
/**
 * @since 4.0.0
 * @category schemas
 */
export const PartialJson = /*#__PURE__*/Schema.toCodecJson(Partial);
/**
 * @since 4.0.0
 * @category schemas
 */
export const PartialArray = /*#__PURE__*/Schema.mutable(/*#__PURE__*/Schema.Array(PartialJson));
/**
 * @since 4.0.0
 * @category refinements
 */
export const isEnvelope = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeRequest = options => ({
  [TypeId]: TypeId,
  _tag: "Request",
  requestId: options.requestId,
  tag: options.tag,
  address: options.address,
  payload: options.payload,
  headers: options.headers,
  ...(options.traceId !== undefined ? {
    traceId: options.traceId,
    spanId: options.spanId,
    sampled: options.sampled
  } : {})
});
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const Envelope = /*#__PURE__*/Schema.declare(isEnvelope, {
  identifier: "Envelope"
});
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const Request = /*#__PURE__*/Schema.declare(u => isEnvelope(u) && u._tag === "Request", {
  identifier: "Request"
});
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const RequestTransform = /*#__PURE__*/Transformation.transform({
  decode: u => makeRequest(u),
  encode: u => u
});
/**
 * @since 4.0.0
 * @category primary key
 */
export const primaryKey = envelope => {
  if (envelope._tag !== "Request" || !PrimaryKey.isPrimaryKey(envelope.payload)) {
    return null;
  }
  return primaryKeyByAddress({
    address: envelope.address,
    tag: envelope.tag,
    id: PrimaryKey.value(envelope.payload)
  });
};
/**
 * @since 4.0.0
 * @category primary key
 */
export const primaryKeyByAddress = options =>
// hash the entity address to save space?
`${options.address.entityType}/${options.address.entityId}/${options.tag}/${options.id}`;
//# sourceMappingURL=Envelope.js.map