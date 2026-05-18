import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Schema from "../../Schema.js";
import * as Transferable from "../workers/Transferable.js";
/**
 * @since 4.0.0
 * @category initial message
 */
export class InitialMessage extends /*#__PURE__*/Context.Service()("effect/rpc/RpcWorker/InitialMessage") {}
const ProtocolTag = /*#__PURE__*/Context.Service("@effect/rpc/RpcServer/Protocol");
/**
 * @since 4.0.0
 * @category initial message
 */
export const makeInitialMessage = (schema, effect) => {
  const schemaJson = Schema.toCodecJson(schema);
  return Effect.flatMap(effect, value => {
    const collector = Transferable.makeCollectorUnsafe();
    return Schema.encodeEffect(schemaJson)(value).pipe(Effect.provideService(Transferable.Collector, collector), Effect.map(encoded => [encoded, collector.clearUnsafe()]));
  });
};
/**
 * @since 4.0.0
 * @category initial message
 */
export const layerInitialMessage = (schema, build) => Layer.effect(InitialMessage)(Effect.contextWith(context => Effect.succeed(Effect.provideContext(Effect.orDie(makeInitialMessage(schema, build)), context))));
/**
 * @since 4.0.0
 * @category initial message
 */
export const initialMessage = schema => ProtocolTag.asEffect().pipe(Effect.flatMap(protocol => protocol.initialMessage), Effect.flatMap(o => o.asEffect()), Effect.flatMap(Schema.decodeUnknownEffect(Schema.toCodecJson(schema))));
//# sourceMappingURL=RpcWorker.js.map