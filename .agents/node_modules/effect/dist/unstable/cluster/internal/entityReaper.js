import { Clock } from "../../../Clock.js";
import * as Context from "../../../Context.js";
import * as Effect from "../../../Effect.js";
import * as Latch from "../../../Latch.js";
import * as Layer from "../../../Layer.js";
/** @internal */
export class EntityReaper extends /*#__PURE__*/Context.Service()("effect/cluster/EntityReaper", {
  make: /*#__PURE__*/Effect.gen(function* () {
    let currentResolution = 30_000;
    const registered = [];
    const latch = yield* Latch.make();
    const register = options => Effect.suspend(() => {
      currentResolution = Math.max(Math.min(currentResolution, options.maxIdleTime), 5000);
      registered.push(options);
      return latch.open;
    });
    const clock = yield* Clock;
    yield* Effect.gen(function* () {
      while (true) {
        yield* Effect.sleep(currentResolution);
        const now = clock.currentTimeMillisUnsafe();
        for (const {
          entities,
          maxIdleTime,
          servers
        } of registered) {
          for (const state of servers.values()) {
            const duration = now - state.lastActiveCheck;
            if (state.keepAliveEnabled || state.activeRequests.size > 0 || duration < maxIdleTime) {
              continue;
            }
            yield* Effect.forkChild(entities.removeIgnore(state.address));
          }
        }
      }
    }).pipe(latch.whenOpen, Effect.forkScoped);
    return {
      register
    };
  })
}) {
  static layer = /*#__PURE__*/Layer.effect(this)(this.make);
}
//# sourceMappingURL=entityReaper.js.map