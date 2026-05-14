import * as Context from "../../../Context.js";
import * as Deferred from "../../../Deferred.js";
import * as Effect from "../../../Effect.js";
import * as Exit from "../../../Exit.js";
import * as MutableHashMap from "../../../MutableHashMap.js";
import * as MutableRef from "../../../MutableRef.js";
import * as Option from "../../../Option.js";
import * as Scope from "../../../Scope.js";
/** @internal */
export class ResourceMap {
  lookup;
  entries;
  isClosed;
  constructor(lookup, entries, isClosed) {
    this.lookup = lookup;
    this.entries = entries;
    this.isClosed = isClosed;
  }
  static make = /*#__PURE__*/Effect.fnUntraced(function* (lookup) {
    const scope = yield* Effect.scope;
    const services = yield* Effect.context();
    const isClosed = MutableRef.make(false);
    const entries = MutableHashMap.empty();
    yield* Scope.addFinalizerExit(scope, exit => {
      MutableRef.set(isClosed, true);
      return Effect.forEach(entries, ([key, {
        scope
      }]) => {
        MutableHashMap.remove(entries, key);
        return Effect.exit(Scope.close(scope, exit));
      }, {
        concurrency: "unbounded",
        discard: true
      });
    });
    return new ResourceMap((key, scope) => Effect.provide(lookup(key), Context.add(services, Scope.Scope, scope)), entries, isClosed);
  });
  get(key) {
    return Effect.suspend(() => {
      if (MutableRef.get(this.isClosed)) {
        return Effect.interrupt;
      }
      const existing = MutableHashMap.get(this.entries, key);
      if (Option.isSome(existing)) {
        return Deferred.await(existing.value.deferred);
      }
      const scope = Effect.runSync(Scope.make());
      const deferred = Deferred.makeUnsafe();
      MutableHashMap.set(this.entries, key, {
        scope,
        deferred
      });
      return Effect.onExit(this.lookup(key, scope), exit => {
        if (exit._tag === "Success") {
          return Deferred.done(deferred, exit);
        }
        MutableHashMap.remove(this.entries, key);
        return Deferred.done(deferred, exit);
      });
    });
  }
  remove(key) {
    return Effect.suspend(() => {
      const entry = MutableHashMap.get(this.entries, key);
      if (Option.isNone(entry)) {
        return Effect.void;
      }
      MutableHashMap.remove(this.entries, key);
      return Scope.close(entry.value.scope, Exit.void);
    });
  }
  removeIgnore(key) {
    return Effect.catchCause(this.remove(key), cause => Effect.annotateLogs(Effect.logDebug(cause), {
      module: "ResourceMap",
      method: "removeIgnore",
      key
    }));
  }
}
//# sourceMappingURL=resourceMap.js.map