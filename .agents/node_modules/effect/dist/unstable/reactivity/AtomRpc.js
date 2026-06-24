/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Schema from "../../Schema.js";
import * as Stream from "../../Stream.js";
import * as Headers from "../http/Headers.js";
import * as RpcClient from "../rpc/RpcClient.js";
import { RpcClientError } from "../rpc/RpcClientError.js";
import * as RpcSchema from "../rpc/RpcSchema.js";
import * as AsyncResult from "./AsyncResult.js";
import * as Atom from "./Atom.js";
import * as Reactivity from "./Reactivity.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const Service = () => (id, options) => {
  const self = Context.Service()(id);
  const layer = Layer.effect(self, options.makeEffect ?? RpcClient.make(options.group, {
    ...options,
    flatten: true
  }));
  const runtimeFactory = options.runtime ?? Atom.runtime;
  self.runtime = runtimeFactory(typeof options.protocol === "function" ? get => Layer.provide(layer, Layer.orDie(options.protocol(get))) : Layer.provide(layer, Layer.orDie(options.protocol)));
  self.mutation = Atom.family(tag => {
    const rpc = options.group.requests.get(tag);
    return self.runtime.fn()(Effect.fnUntraced(function* ({
      headers,
      payload,
      reactivityKeys
    }) {
      const client = yield* self;
      const effect = client(tag, payload, {
        headers
      });
      return yield* reactivityKeys ? Reactivity.mutation(effect, reactivityKeys) : effect;
    })).pipe(Atom.serializable({
      key: `AtomRpc:mutation:${tag}`,
      schema: AsyncResult.Schema({
        success: rpc.successSchema,
        error: makeErrorSchema(rpc)
      })
    }));
  });
  const queryFamily = Atom.family(key => {
    const {
      headers,
      payload,
      reactivityKeys,
      tag,
      timeToLive
    } = key;
    const rpc = options.group.requests.get(tag);
    const isStream = RpcSchema.isStreamSchema(rpc.successSchema);
    let atom = isStream ? self.runtime.pull(Stream.unwrap(self.use(client => Effect.succeed(client(tag, payload, {
      headers
    }))))) : self.runtime.atom(self.use(client => client(tag, payload, {
      headers
    })));
    if (!isStream && key.serializationKey) {
      atom = Atom.serializable(atom, {
        key: `AtomRpc:${key.tag}:${key.serializationKey}`,
        schema: AsyncResult.Schema({
          success: rpc.successSchema,
          error: makeErrorSchema(rpc)
        })
      });
    }
    if (timeToLive) {
      atom = Duration.isFinite(timeToLive) ? Atom.setIdleTTL(atom, timeToLive) : Atom.keepAlive(atom);
    }
    return reactivityKeys ? self.runtime.factory.withReactivity(reactivityKeys)(atom) : atom;
  });
  self.query = (tag, payload, options) => {
    const key = {
      tag,
      payload,
      headers: options?.headers ? Headers.fromInput(options.headers) : undefined,
      reactivityKeys: options?.reactivityKeys,
      timeToLive: options?.timeToLive ? Duration.fromInputUnsafe(options.timeToLive) : undefined,
      serializationKey: options?.serializationKey
    };
    return queryFamily(key);
  };
  return self;
};
const makeErrorSchema = rpc => Schema.Union([rpc.errorSchema, ...Array.from(rpc.middlewares, middleware => middleware.error), RpcClientError]);
//# sourceMappingURL=AtomRpc.js.map