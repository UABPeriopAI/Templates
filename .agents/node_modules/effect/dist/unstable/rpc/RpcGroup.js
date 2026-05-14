import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import { identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Stream from "../../Stream.js";
import * as Rpc from "./Rpc.js";
const TypeId = "~effect/rpc/RpcGroup";
const RpcGroupProto = {
  add(...rpcs) {
    const requests = new Map(this.requests);
    for (const rpc of rpcs) {
      requests.set(rpc._tag, rpc);
    }
    return makeProto({
      requests,
      annotations: this.annotations
    });
  },
  merge(...groups) {
    const requests = new Map(this.requests);
    const annotations = new Map(this.annotations.mapUnsafe);
    for (const group of groups) {
      for (const [tag, rpc] of group.requests) {
        requests.set(tag, rpc);
      }
      for (const [key, value] of group.annotations.mapUnsafe) {
        annotations.set(key, value);
      }
    }
    return makeProto({
      requests,
      annotations: Context.makeUnsafe(annotations)
    });
  },
  omit(...tags) {
    const requests = new Map(this.requests);
    for (const tag of tags) {
      requests.delete(tag);
    }
    return makeProto({
      requests,
      annotations: this.annotations
    });
  },
  middleware(middleware) {
    const requests = new Map();
    for (const [tag, rpc] of this.requests) {
      requests.set(tag, rpc.middleware(middleware));
    }
    return makeProto({
      requests,
      annotations: this.annotations
    });
  },
  toHandlers(build) {
    // oxlint-disable-next-line no-this-alias
    const self = this;
    return Effect.gen(function* () {
      const services = yield* Effect.context();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map();
      for (const [tag, handler] of Object.entries(handlers)) {
        const rpc = self.requests.get(tag);
        contextMap.set(rpc.key, {
          tag: rpc._tag,
          handler,
          context: services
        });
      }
      return Context.makeUnsafe(contextMap);
    });
  },
  prefix(prefix) {
    const requests = new Map();
    for (const rpc of this.requests.values()) {
      const newRpc = rpc.prefix(prefix);
      requests.set(newRpc._tag, newRpc);
    }
    return makeProto({
      requests,
      annotations: this.annotations
    });
  },
  toLayer(build) {
    return Layer.effectContext(this.toHandlers(build));
  },
  of: identity,
  toLayerHandler(service, build) {
    // oxlint-disable-next-line no-this-alias
    const self = this;
    return Layer.effectContext(Effect.gen(function* () {
      const services = yield* Effect.context();
      const handler = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map();
      const rpc = self.requests.get(service);
      contextMap.set(rpc.key, {
        handler,
        context: services
      });
      return Context.makeUnsafe(contextMap);
    }));
  },
  accessHandler(service) {
    return Effect.contextWith(parentContext => {
      const rpc = this.requests.get(service);
      const {
        handler,
        context
      } = parentContext.mapUnsafe.get(rpc.key);
      return Effect.succeed((payload, options) => {
        options.rpc = rpc;
        const result = handler(payload, options);
        const effectOrStream = Rpc.isWrapper(result) ? result.value : result;
        return Effect.isEffect(effectOrStream) ? Effect.provide(effectOrStream, context) : Stream.provideContext(effectOrStream, context);
      });
    });
  },
  annotate(service, value) {
    return makeProto({
      requests: this.requests,
      annotations: Context.add(this.annotations, service, value)
    });
  },
  annotateRpcs(service, value) {
    return this.annotateRpcsMerge(Context.make(service, value));
  },
  annotateMerge(context) {
    return makeProto({
      requests: this.requests,
      annotations: Context.merge(this.annotations, context)
    });
  },
  annotateRpcsMerge(context) {
    const requests = new Map();
    for (const [tag, rpc] of this.requests) {
      requests.set(tag, rpc.annotateMerge(Context.merge(context, rpc.annotations)));
    }
    return makeProto({
      requests,
      annotations: this.annotations
    });
  }
};
const makeProto = options => Object.assign(function () {}, RpcGroupProto, {
  requests: options.requests,
  annotations: options.annotations
});
/**
 * @since 4.0.0
 * @category groups
 */
export const make = (...rpcs) => makeProto({
  requests: new Map(rpcs.map(rpc => [rpc._tag, rpc])),
  annotations: Context.empty()
});
//# sourceMappingURL=RpcGroup.js.map