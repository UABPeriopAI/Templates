import * as Effect from "../../../Effect.js";
import * as Exit from "../../../Exit.js";
import * as Latch from "../../../Latch.js";
import * as MutableRef from "../../../MutableRef.js";
import * as Option from "../../../Option.js";
import * as Scope from "../../../Scope.js";
import { internalInterruptors } from "./interruptors.js";
/** @internal */
export class ResourceRef {
  static from = /*#__PURE__*/Effect.fnUntraced(function* (parentScope, acquire) {
    const state = MutableRef.make({
      _tag: "Closed"
    });
    yield* Scope.addFinalizerExit(parentScope, exit => {
      const s = MutableRef.get(state);
      if (s._tag === "Closed") {
        return Effect.void;
      }
      const scope = s.scope;
      MutableRef.set(state, {
        _tag: "Closed"
      });
      return Scope.close(scope, exit);
    });
    const scope = yield* Scope.make();
    MutableRef.set(state, {
      _tag: "Acquiring",
      scope
    });
    const value = yield* acquire(scope);
    MutableRef.set(state, {
      _tag: "Acquired",
      scope,
      value
    });
    return new ResourceRef(state, acquire);
  });
  state;
  acquire;
  constructor(state, acquire) {
    this.state = state;
    this.acquire = acquire;
  }
  latch = /*#__PURE__*/Latch.makeUnsafe(true);
  getUnsafe() {
    if (this.state.current._tag === "Acquired") {
      return Option.some(this.state.current.value);
    }
    return Option.none();
  }
  rebuildUnsafe() {
    const s = this.state.current;
    if (s._tag === "Closed") {
      return Effect.interrupt;
    }
    const prevScope = s.scope;
    const scope = Scope.makeUnsafe();
    this.latch.closeUnsafe();
    MutableRef.set(this.state, {
      _tag: "Acquiring",
      scope
    });
    return Effect.withFiber(fiber => {
      internalInterruptors.add(fiber.id);
      return Scope.close(prevScope, Exit.void);
    }).pipe(Effect.andThen(this.acquire(scope)), Effect.flatMap(value => {
      if (this.state.current._tag === "Closed") {
        return Effect.interrupt;
      }
      MutableRef.set(this.state, {
        _tag: "Acquired",
        scope,
        value
      });
      return this.latch.open;
    }));
  }
  await = /*#__PURE__*/Effect.suspend(() => {
    const s = this.state.current;
    if (s._tag === "Closed") {
      return Effect.interrupt;
    } else if (s._tag === "Acquired") {
      return Effect.succeed(s.value);
    }
    return Effect.flatMap(this.latch.await, () => this.await);
  });
}
//# sourceMappingURL=resourceRef.js.map