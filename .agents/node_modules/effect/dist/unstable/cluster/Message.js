/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Option from "../../Option.js";
import * as Schema from "../../Schema.js";
import * as Rpc from "../rpc/Rpc.js";
import { MalformedMessage } from "./ClusterError.js";
import * as ClusterSchema from "./ClusterSchema.js";
import * as Envelope from "./Envelope.js";
/**
 * @since 4.0.0
 * @category incoming
 */
export const incomingLocalFromOutgoing = self => {
  if (self._tag === "OutgoingEnvelope") {
    return new IncomingEnvelope({
      envelope: self.envelope
    });
  }
  return new IncomingRequestLocal({
    annotations: Context.get(self.rpc.annotations, ClusterSchema.Dynamic)(self.rpc.annotations, self.envelope),
    envelope: self.envelope,
    respond: self.respond,
    lastSentReply: Option.none()
  });
};
/**
 * @since 4.0.0
 * @category incoming
 */
export class IncomingRequest extends /*#__PURE__*/Data.TaggedClass("IncomingRequest") {}
/**
 * @since 4.0.0
 * @category outgoing
 */
export class IncomingRequestLocal extends /*#__PURE__*/Data.TaggedClass("IncomingRequestLocal") {}
/**
 * @since 4.0.0
 * @category incoming
 */
export class IncomingEnvelope extends /*#__PURE__*/Data.TaggedClass("IncomingEnvelope") {}
/**
 * @since 4.0.0
 * @category outgoing
 */
export class OutgoingRequest extends /*#__PURE__*/Data.TaggedClass("OutgoingRequest") {
  /**
   * @since 4.0.0
   */
  encodedCache;
}
/**
 * @since 4.0.0
 * @category outgoing
 */
export class OutgoingEnvelope extends /*#__PURE__*/Data.TaggedClass("OutgoingEnvelope") {
  /**
   * @since 4.0.0
   */
  static interrupt(options) {
    return new OutgoingEnvelope({
      envelope: new Envelope.Interrupt(options),
      rpc: neverRpc
    });
  }
}
const neverRpc = /*#__PURE__*/Rpc.make("Never", {
  success: Schema.Never,
  error: Schema.Never,
  payload: {}
});
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const serialize = message => {
  if (message._tag !== "OutgoingRequest") {
    return Effect.succeed(message.envelope);
  }
  return Effect.suspend(() => message.encodedCache ? Effect.succeed(message.encodedCache) : serializeRequest(message));
};
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const serializeEnvelope = message => Effect.flatMap(serialize(message), envelope => MalformedMessage.refail(Schema.encodeEffect(Envelope.PartialJson)(envelope)));
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const serializeRequest = self => {
  const rpc = self.rpc;
  return Schema.encodeEffect(Schema.toCodecJson(rpc.payloadSchema))(self.envelope.payload).pipe(Effect.provideContext(self.context), MalformedMessage.refail, Effect.map(payload => ({
    ...self.envelope,
    payload
  })));
};
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const deserializeLocal = (self, encoded) => {
  if (encoded._tag !== "Request") {
    return Effect.succeed(new IncomingEnvelope({
      envelope: encoded
    }));
  } else if (self._tag !== "OutgoingRequest") {
    return Effect.fail(new MalformedMessage({
      cause: new Error("Can only deserialize a Request with an OutgoingRequest message")
    }));
  }
  const rpc = self.rpc;
  return Schema.decodeEffect(Schema.toCodecJson(rpc.payloadSchema))(encoded.payload).pipe(Effect.provideContext(self.context), MalformedMessage.refail, Effect.map(payload => {
    const envelope = Envelope.makeRequest({
      ...encoded,
      payload
    });
    return new IncomingRequestLocal({
      envelope,
      lastSentReply: Option.none(),
      respond: self.respond,
      annotations: Context.get(rpc.annotations, ClusterSchema.Dynamic)(rpc.annotations, envelope)
    });
  }));
};
//# sourceMappingURL=Message.js.map