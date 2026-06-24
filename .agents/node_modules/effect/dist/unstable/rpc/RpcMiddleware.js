/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Schema from "../../Schema.js";
import { Scope } from "../../Scope.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/rpc/RpcMiddleware";
/**
 * @since 4.0.0
 * @category tags
 */
export const Service = () => (id, options) => {
  const Err = globalThis.Error;
  const limit = Err.stackTraceLimit;
  Err.stackTraceLimit = 2;
  const creationError = new Err();
  Err.stackTraceLimit = limit;
  function ServiceClass() {}
  const ServiceClass_ = ServiceClass;
  Object.setPrototypeOf(ServiceClass, Object.getPrototypeOf(Context.Service(id)));
  ServiceClass.key = id;
  Object.defineProperty(ServiceClass, "stack", {
    get() {
      return creationError.stack;
    }
  });
  ServiceClass_[TypeId] = TypeId;
  ServiceClass_.error = options?.error ?? Schema.Never;
  ServiceClass_.requiredForClient = options?.requiredForClient ?? false;
  return ServiceClass;
};
/**
 * @since 4.0.0
 * @category client
 */
export const layerClient = (tag, service) => Layer.effectContext(Effect.gen(function* () {
  const services = (yield* Effect.context()).pipe(Context.omit(Scope));
  const middleware = Effect.isEffect(service) ? yield* service : service;
  return Context.makeUnsafe(new Map([[`${tag.key}/Client`, options => Effect.updateContext(middleware(options), requestContext => Context.merge(services, requestContext))]]));
}));
//# sourceMappingURL=RpcMiddleware.js.map