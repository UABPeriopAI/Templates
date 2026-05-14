/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Schedule from "../../Schedule.js";
import * as K8s from "./K8sHttpClient.js";
import * as Runners from "./Runners.js";
/**
 * Represents the service used to check if a Runner is healthy.
 *
 * If a Runner is responsive, shards will not be re-assigned because the Runner may
 * still be processing messages. If a Runner is not responsive, then its
 * associated shards can and will be re-assigned to a different Runner.
 *
 * @since 4.0.0
 * @category models
 */
export class RunnerHealth extends /*#__PURE__*/Context.Service()("effect/cluster/RunnerHealth") {}
/**
 * A layer which will **always** consider a Runner healthy.
 *
 * This is useful for testing.
 *
 * @since 4.0.0
 * @category layers
 */
export const layerNoop = /*#__PURE__*/Layer.succeed(RunnerHealth, {
  isAlive: () => Effect.succeed(true)
});
/**
 * @since 4.0.0
 * @category Constructors
 */
export const makePing = /*#__PURE__*/Effect.gen(function* () {
  const runners = yield* Runners.Runners;
  const schedule = Schedule.spaced(500);
  function isAlive(address) {
    return runners.ping(address).pipe(Effect.timeout(10_000), Effect.retry({
      times: 5,
      schedule
    }), Effect.isSuccess);
  }
  return RunnerHealth.of({
    isAlive
  });
});
/**
 * A layer which will ping a Runner directly to check if it is healthy.
 *
 * @since 4.0.0
 * @category layers
 */
export const layerPing = /*#__PURE__*/Layer.effect(RunnerHealth, makePing);
/**
 * @since 4.0.0
 * @category Constructors
 */
export const makeK8s = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const allPods = yield* K8s.makeGetPods(options);
  return RunnerHealth.of({
    isAlive: address => allPods.pipe(Effect.map(pods => pods.get(address.host)?.isReadyOrInitializing ?? false), Effect.catchCause(() => Effect.succeed(true)))
  });
});
/**
 * A layer which will check the Kubernetes API to see if a Runner is healthy.
 *
 * The provided HttpClient will need to add the pod's CA certificate to its
 * trusted root certificates in order to communicate with the Kubernetes API.
 *
 * The pod service account will also need to have permissions to list pods in
 * order to use this layer.
 *
 * @since 4.0.0
 * @category layers
 */
export const layerK8s = options => Layer.effect(RunnerHealth, makeK8s(options));
//# sourceMappingURL=RunnerHealth.js.map