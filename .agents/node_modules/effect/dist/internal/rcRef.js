import * as Context from "../Context.js";
import * as Duration from "../Duration.js";
import * as Effect from "../Effect.js";
import * as Exit from "../Exit.js";
import * as Fiber from "../Fiber.js";
import { identity } from "../Function.js";
import { pipeArguments } from "../Pipeable.js";
import * as Scope from "../Scope.js";
import * as Semaphore from "../Semaphore.js";
const TypeId = "~effect/RcRef";
const stateEmpty = {
  _tag: "Empty"
};
const stateClosed = {
  _tag: "Closed"
};
const variance = {
  _A: identity,
  _E: identity
};
class RcRefImpl {
  [TypeId] = variance;
  pipe() {
    return pipeArguments(this, arguments);
  }
  state = stateEmpty;
  semaphore = /*#__PURE__*/Semaphore.makeUnsafe(1);
  acquire;
  context;
  scope;
  idleTimeToLive;
  constructor(acquire, context, scope, idleTimeToLive) {
    this.acquire = acquire;
    this.context = context;
    this.scope = scope;
    this.idleTimeToLive = idleTimeToLive;
  }
}
/** @internal */
export const make = options => Effect.withFiber(fiber => {
  const context = fiber.context;
  const scope = Context.get(context, Scope.Scope);
  const ref = new RcRefImpl(options.acquire, context, scope, options.idleTimeToLive ? Duration.fromInputUnsafe(options.idleTimeToLive) : undefined);
  return Effect.as(Scope.addFinalizerExit(scope, () => {
    const close = ref.state._tag === "Acquired" ? Scope.close(ref.state.scope, Exit.void) : Effect.void;
    ref.state = stateClosed;
    return close;
  }), ref);
});
const getState = self => Effect.uninterruptibleMask(restore => {
  switch (self.state._tag) {
    case "Closed":
      {
        return Effect.interrupt;
      }
    case "Acquired":
      {
        self.state.refCount++;
        return self.state.fiber ? Effect.as(Fiber.interrupt(self.state.fiber), self.state) : Effect.succeed(self.state);
      }
    case "Empty":
      {
        const scope = Scope.makeUnsafe();
        return self.semaphore.withPermits(1)(restore(Effect.provideContext(self.acquire, Context.add(self.context, Scope.Scope, scope))).pipe(Effect.map(value => {
          const state = {
            _tag: "Acquired",
            value,
            scope,
            fiber: undefined,
            refCount: 1,
            invalidated: false
          };
          self.state = state;
          return state;
        })));
      }
  }
});
/** @internal */
export const get = /*#__PURE__*/Effect.fnUntraced(function* (self_) {
  const self = self_;
  const state = yield* getState(self);
  const scope = yield* Effect.scope;
  const isFinite = self.idleTimeToLive !== undefined && Duration.isFinite(self.idleTimeToLive);
  yield* Scope.addFinalizerExit(scope, () => {
    state.refCount--;
    if (state.refCount > 0) {
      return Effect.void;
    }
    if (self.idleTimeToLive === undefined) {
      self.state = stateEmpty;
      return Scope.close(state.scope, Exit.void);
    } else if (state.invalidated) {
      return Scope.close(state.scope, Exit.void);
    } else if (!isFinite) {
      return Effect.void;
    }
    state.fiber = Effect.sleep(self.idleTimeToLive).pipe(Effect.flatMap(() => {
      if (self.state._tag === "Acquired" && self.state.refCount === 0) {
        self.state = stateEmpty;
        return Scope.close(state.scope, Exit.void);
      }
      return Effect.void;
    }), Effect.ensuring(Effect.sync(() => {
      state.fiber = undefined;
    })), Effect.runForkWith(self.context), Fiber.runIn(self.scope));
    return Effect.void;
  });
  return state.value;
});
/** @internal */
export const invalidate = self_ => {
  const self = self_;
  return Effect.uninterruptible(Effect.suspend(() => {
    if (self.state._tag !== "Acquired") {
      return Effect.void;
    }
    const state = self.state;
    self.state = stateEmpty;
    state.invalidated = true;
    if (state.refCount > 0) {
      return Effect.void;
    }
    state.fiber?.interruptUnsafe();
    return Scope.close(state.scope, Exit.void);
  }));
};
//# sourceMappingURL=rcRef.js.map