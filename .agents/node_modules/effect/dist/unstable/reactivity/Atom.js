/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import * as Channel from "../../Channel.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import { constant, constTrue, constVoid, dual, pipe } from "../../Function.js";
import { PipeInspectableProto } from "../../internal/core.js";
import * as Layer from "../../Layer.js";
import * as MutableHashMap from "../../MutableHashMap.js";
import * as Option from "../../Option.js";
import { hasProperty } from "../../Predicate.js";
import * as Pull from "../../Pull.js";
import * as Scheduler from "../../Scheduler.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as Stream from "../../Stream.js";
import * as SubscriptionRef from "../../SubscriptionRef.js";
import * as KeyValueStore from "../persistence/KeyValueStore.js";
import * as AsyncResult from "./AsyncResult.js";
import { AtomRegistry } from "./AtomRegistry.js";
import * as Registry from "./AtomRegistry.js";
import * as Reactivity from "./Reactivity.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/reactivity/Atom";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isAtom = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category type ids
 */
export const WritableTypeId = "~effect/reactivity/Atom/Writable";
/**
 * @since 4.0.0
 * @category combinators
 */
export const setIdleTTL = /*#__PURE__*/dual(2, (self, durationInput) => {
  const duration = Duration.fromInputUnsafe(durationInput);
  const isFinite = Duration.isFinite(duration);
  return Object.assign(Object.create(Object.getPrototypeOf(self)), {
    ...self,
    keepAlive: !isFinite,
    idleTTL: isFinite ? Duration.toMillis(duration) : undefined
  });
});
const removeTtl = /*#__PURE__*/setIdleTTL(0);
const AtomProto = {
  [TypeId]: TypeId,
  ...PipeInspectableProto,
  toJSON() {
    return {
      _id: "Atom",
      keepAlive: this.keepAlive,
      lazy: this.lazy,
      label: this.label
    };
  }
};
const RuntimeProto = {
  ...AtomProto,
  atom(arg, options) {
    const read = makeRead(arg, options);
    return readable(get => {
      const previous = get.self();
      const runtimeResult = get(this);
      if (runtimeResult._tag !== "Success") {
        return AsyncResult.replacePrevious(runtimeResult, previous);
      }
      return read(get, runtimeResult.value);
    });
  },
  fn(arg, options) {
    if (arguments.length === 0) {
      return (arg, options) => makeFnRuntime(this, arg, options);
    }
    return makeFnRuntime(this, arg, options);
  },
  pull(arg, options) {
    const pullSignal = removeTtl(state(0));
    const pullAtom = readable(get => {
      const previous = get.self();
      const runtimeResult = get(this);
      if (runtimeResult._tag !== "Success") {
        return AsyncResult.replacePrevious(runtimeResult, previous);
      }
      return makeEffect(get, makeStreamPullEffect(get, pullSignal, arg, options), AsyncResult.initial(true), runtimeResult.value);
    });
    return makeStreamPull(pullSignal, pullAtom);
  },
  subscriptionRef(ref) {
    return makeSubRef(removeTtl(readable(get => {
      const previous = get.self();
      const runtimeResult = get(this);
      if (runtimeResult._tag !== "Success") {
        return AsyncResult.replacePrevious(runtimeResult, previous);
      }
      const value = typeof ref === "function" ? ref(get) : ref;
      return SubscriptionRef.isSubscriptionRef(value) ? value : makeEffect(get, value, AsyncResult.initial(true), runtimeResult.value);
    })), (get, ref) => {
      const runtime = AsyncResult.getOrThrow(get(this));
      return readSubscriptionRef(get, ref, runtime);
    });
  }
};
const makeFnRuntime = (self, arg, options) => {
  const [read, write, argAtom] = makeResultFn(options?.reactivityKeys ? (a, get) => {
    const effect = arg(a, get);
    return Effect.isEffect(effect) ? Reactivity.mutation(effect, options.reactivityKeys) : Stream.ensuring(effect, Reactivity.invalidate(options.reactivityKeys));
  } : arg, options);
  return writable(get => {
    get.get(argAtom);
    const previous = get.self();
    const runtimeResult = get.get(self);
    if (runtimeResult._tag !== "Success") {
      return AsyncResult.replacePrevious(runtimeResult, previous);
    }
    return read(get, runtimeResult.value);
  }, write);
};
const WritableProto = {
  ...AtomProto,
  [WritableTypeId]: WritableTypeId
};
/**
 * @since 4.0.0
 * @category refinements
 */
export const isWritable = atom => WritableTypeId in atom;
/**
 * @since 4.0.0
 * @category constructors
 */
export const readable = (read, refresh) => {
  const self = Object.create(AtomProto);
  self.keepAlive = false;
  self.lazy = true;
  self.read = read;
  self.refresh = refresh;
  return self;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const writable = (read, write, refresh) => {
  const self = Object.create(WritableProto);
  self.keepAlive = false;
  self.lazy = true;
  self.read = read;
  self.write = write;
  self.refresh = refresh;
  return self;
};
function constSetSelf(ctx, value) {
  ctx.setSelf(value);
}
// -----------------------------------------------------------------------------
// constructors
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = (arg, options) => {
  const readOrAtom = makeRead(arg, options);
  if (TypeId in readOrAtom) {
    return readOrAtom;
  }
  return readable(readOrAtom);
};
// -----------------------------------------------------------------------------
// constructors - effect
// -----------------------------------------------------------------------------
const makeRead = (arg, options) => {
  if (typeof arg === "function" && !Effect.isEffect(arg) && !Stream.isStream(arg)) {
    const create = arg;
    return function (get, providedServices) {
      const value = create(get);
      switch (typeof value) {
        case "function":
        case "object":
          {
            if (value === null) return value;else if (EffectTypeId in value) {
              return effect(get, value, options, providedServices);
            } else if (StreamTypeId in value) {
              return stream(get, value, options, providedServices);
            }
            return value;
          }
        default:
          return value;
      }
    };
  } else if (Effect.isEffect(arg)) {
    return function (get, providedServices) {
      return effect(get, arg, options, providedServices);
    };
  } else if (Stream.isStream(arg)) {
    return function (get, providedServices) {
      return stream(get, arg, options, providedServices);
    };
  }
  return state(arg);
};
const EffectTypeId = "~effect/Effect";
const StreamTypeId = "~effect/Stream";
const state = initialValue => writable(function (_get) {
  return initialValue;
}, constSetSelf);
const effect = (get, effect, options, services) => {
  const initialValue = options?.initialValue !== undefined ? AsyncResult.success(options.initialValue) : AsyncResult.initial();
  return makeEffect(get, effect, initialValue, services, options?.uninterruptible);
};
function makeEffect(ctx, effect, initialValue, services = Context.empty(), uninterruptible = false) {
  const previous = ctx.self();
  const scope = Scope.makeUnsafe();
  ctx.addFinalizer(() => {
    Effect.runForkWith(services)(Scope.close(scope, Exit.void));
  });
  const servicesMap = new Map(services.mapUnsafe);
  servicesMap.set(Scope.Scope.key, scope);
  servicesMap.set(AtomRegistry.key, ctx.registry);
  servicesMap.set(Scheduler.Scheduler.key, ctx.registry.scheduler);
  let syncResult;
  let isAsync = false;
  const cancel = runCallbackSync(Context.makeUnsafe(servicesMap), effect, function (exit) {
    syncResult = AsyncResult.fromExitWithPrevious(exit, previous);
    if (isAsync) {
      ctx.setSelf(syncResult);
    }
  }, uninterruptible);
  isAsync = true;
  if (cancel !== undefined) {
    ctx.addFinalizer(cancel);
  }
  if (syncResult !== undefined) {
    return syncResult;
  } else if (previous._tag === "Some") {
    return AsyncResult.waitingFrom(previous);
  }
  return AsyncResult.waiting(initialValue);
}
function runCallbackSync(services, effect, onExit, uninterruptible = false) {
  if (Exit.isExit(effect)) {
    onExit(effect);
    return undefined;
  }
  const runFork = Effect.runForkWith(services);
  const fiber = runFork(effect);
  fiber.currentDispatcher?.flush();
  const result = fiber.pollUnsafe();
  if (result) {
    onExit(result);
    return undefined;
  }
  const remove = fiber.addObserver(onExit);
  function cancel() {
    remove();
    if (!uninterruptible) {
      fiber.interruptUnsafe();
    }
  }
  return cancel;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const context = options => {
  let globalLayer = Reactivity.layer;
  function factory(create) {
    const self = Object.create(RuntimeProto);
    self.keepAlive = false;
    self.lazy = true;
    self.refresh = undefined;
    self.factory = factory;
    const layerAtom = keepAlive(typeof create === "function" ? readable(get => Layer.provideMerge(create(get), globalLayer)) : readable(() => Layer.provideMerge(create, globalLayer)));
    self.layer = layerAtom;
    self.read = function read(get) {
      const layer = get(layerAtom);
      const build = Effect.flatMap(Effect.scope, scope => Layer.buildWithMemoMap(layer, options.memoMap, scope));
      return effect(get, build, {
        uninterruptible: true
      });
    };
    return self;
  }
  factory.memoMap = options.memoMap;
  factory.addGlobalLayer = layer => {
    globalLayer = Layer.provideMerge(globalLayer, Layer.provide(layer, Reactivity.layer));
  };
  const reactivityAtom = removeTtl(make(Effect.contextWith(services => Layer.buildWithMemoMap(Reactivity.layer, options.memoMap, Context.get(services, Scope.Scope))).pipe(Effect.map(Context.get(Reactivity.Reactivity)))));
  factory.withReactivity = keys => atom => transform(atom, get => {
    const reactivity = AsyncResult.getOrThrow(get(reactivityAtom));
    get.addFinalizer(reactivity.registerUnsafe(keys, () => {
      get.refresh(atom);
    }));
    get.subscribe(atom, value => get.setSelf(value));
    return get.once(atom);
  }, {
    initialValueTarget: atom
  });
  return factory;
};
/**
 * @since 4.0.0
 * @category context
 */
export const defaultMemoMap = /*#__PURE__*/Layer.makeMemoMapUnsafe();
/**
 * @since 4.0.0
 * @category context
 */
export const runtime = /*#__PURE__*/context({
  memoMap: defaultMemoMap
});
/**
 * An alias to `Rx.runtime.withReactivity`, for refreshing an atom whenever the
 * keys change in the `Reactivity` service.
 *
 * @since 4.0.0
 * @category Reactivity
 */
export const withReactivity = runtime.withReactivity;
// -----------------------------------------------------------------------------
// constructors - stream
// -----------------------------------------------------------------------------
const stream = (get, stream, options, services) => {
  const initialValue = options?.initialValue !== undefined ? AsyncResult.success(options.initialValue) : AsyncResult.initial();
  return makeStream(get, stream, initialValue, services);
};
function makeStream(ctx, stream, initialValue, services = Context.empty()) {
  const previous = ctx.self();
  services = Context.add(services, AtomRegistry, ctx.registry);
  const run = Effect.scopedWith(scope => Effect.flatMap(Channel.toPullScoped(stream.channel, scope), pull => Effect.whileLoop({
    while: constTrue,
    body: () => pull,
    step(arr) {
      ctx.setSelf(AsyncResult.success(Arr.lastNonEmpty(arr), {
        waiting: true
      }));
    }
  }))).pipe(Effect.catchCause(cause => {
    if (Pull.isDoneCause(cause)) {
      pipe(ctx.self(), Option.flatMap(AsyncResult.value), Option.match({
        onNone: () => ctx.setSelf(AsyncResult.failWithPrevious(new Cause.NoSuchElementError(), {
          previous: ctx.self()
        })),
        onSome: a => ctx.setSelf(AsyncResult.success(a))
      }));
    } else {
      ctx.setSelf(AsyncResult.failureWithPrevious(cause, {
        previous: ctx.self()
      }));
    }
    return Effect.void;
  }));
  const servicesMap = new Map(services.mapUnsafe);
  servicesMap.set(AtomRegistry.key, ctx.registry);
  servicesMap.set(Scheduler.Scheduler.key, ctx.registry.scheduler);
  const cancel = runCallbackSync(Context.makeUnsafe(servicesMap), run, constVoid, false);
  if (cancel !== undefined) {
    ctx.addFinalizer(cancel);
  }
  if (previous._tag === "Some") {
    return AsyncResult.waitingFrom(previous);
  }
  return AsyncResult.waiting(initialValue);
}
// -----------------------------------------------------------------------------
// constructors - subscription ref
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category constructors
 */
export const subscriptionRef = ref => makeSubRef(readable(get => {
  const value = typeof ref === "function" ? ref(get) : ref;
  return SubscriptionRef.isSubscriptionRef(value) ? value : makeEffect(get, value, AsyncResult.initial(true));
}), readSubscriptionRef);
const readSubscriptionRef = (get, sub, services = Context.empty()) => {
  if (SubscriptionRef.isSubscriptionRef(sub)) {
    get.addFinalizer(SubscriptionRef.changes(sub).pipe(Stream.runForEachArray(arr => {
      for (let i = 0; i < arr.length; i++) {
        get.setSelf(arr[i]);
      }
      return Effect.void;
    }), Effect.runCallbackWith(services)));
    return Effect.runSyncWith(services)(SubscriptionRef.get(sub));
  } else if (sub._tag !== "Success") {
    return sub;
  }
  return makeStream(get, SubscriptionRef.changes(sub.value), AsyncResult.initial(true), services);
};
const makeSubRef = (refAtom, read) => {
  function write(ctx, value) {
    const ref = ctx.get(refAtom);
    if (SubscriptionRef.isSubscriptionRef(ref)) {
      Effect.runSync(SubscriptionRef.set(ref, value));
    } else if (AsyncResult.isSuccess(ref)) {
      Effect.runSync(SubscriptionRef.set(ref.value, value));
    }
  }
  return writable(get => {
    const ref = get(refAtom);
    if (SubscriptionRef.isSubscriptionRef(ref)) {
      return read(get, ref);
    } else if (AsyncResult.isSuccess(ref)) {
      return read(get, ref);
    }
    return ref;
  }, write);
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const fnSync = function (...args) {
  if (args.length === 0) {
    return makeFnSync;
  }
  return makeFnSync(...args);
};
const makeFnSync = (f, options) => {
  const argAtom = removeTtl(state([0, undefined]));
  const hasInitialValue = options?.initialValue !== undefined;
  return writable(function (get) {
    ;
    get.isFn = true;
    const [counter, arg] = get.get(argAtom);
    if (counter === 0) {
      return hasInitialValue ? options.initialValue : Option.none();
    }
    return hasInitialValue ? f(arg, get) : Option.some(f(arg, get));
  }, function (ctx, arg) {
    batch(() => {
      ctx.set(argAtom, [ctx.get(argAtom)[0] + 1, arg]);
      ctx.refreshSelf();
    });
  });
};
/**
 * @since 4.0.0
 * @category symbols
 */
export const Reset = /*#__PURE__*/Symbol.for("effect/reactivity/atom/Atom/Reset");
/**
 * @since 4.0.0
 * @category symbols
 */
export const Interrupt = /*#__PURE__*/Symbol.for("effect/reactivity/atom/Atom/Interrupt");
/**
 * @since 4.0.0
 * @category constructors
 */
export const fn = function (...args) {
  if (args.length === 0) {
    return makeFn;
  }
  return makeFn(...args);
};
const makeFn = (f, options) => {
  const [read, write] = makeResultFn(f, options);
  return writable(read, write);
};
function makeResultFn(f, options) {
  const argAtom = removeTtl(state([0, undefined]));
  const initialValue = options?.initialValue !== undefined ? AsyncResult.success(options.initialValue) : AsyncResult.initial();
  const fibersAtom = options?.concurrent ? removeTtl(readable(get => {
    const fibers = new Set();
    get.addFinalizer(() => fibers.forEach(f => f.interruptUnsafe()));
    return fibers;
  })) : undefined;
  function read(get, services) {
    const fibers = fibersAtom ? get(fibersAtom) : undefined;
    get.isFn = true;
    const [counter, arg] = get.get(argAtom);
    if (counter === 0) {
      return initialValue;
    } else if (arg === Interrupt) {
      return AsyncResult.failureWithPrevious(Cause.interrupt(), {
        previous: get.self()
      });
    }
    let value = f(arg, get);
    if (EffectTypeId in value) {
      if (fibers) {
        const eff = value;
        value = Effect.flatMap(Effect.forkDetach(eff, {
          startImmediately: true
        }), fiber => {
          fibers.add(fiber);
          fiber.addObserver(() => fibers.delete(fiber));
          return Effect.map(Fiber.joinAll(fibers), arr => arr[0]);
        });
      }
      return makeEffect(get, value, initialValue, services, false);
    }
    return makeStream(get, value, initialValue, services);
  }
  function write(ctx, arg) {
    batch(() => {
      if (arg === Reset) {
        ctx.set(argAtom, [0, undefined]);
      } else if (arg === Interrupt) {
        ctx.set(argAtom, [ctx.get(argAtom)[0] + 1, Interrupt]);
      } else {
        ctx.set(argAtom, [ctx.get(argAtom)[0] + 1, arg]);
      }
      ctx.refreshSelf();
    });
  }
  return [read, write, argAtom];
}
/**
 * @since 4.0.0
 * @category constructors
 */
export const pull = (create, options) => {
  const pullSignal = removeTtl(state(0));
  const pullAtom = readable(makeRead(function (get) {
    return makeStreamPullEffect(get, pullSignal, create, options);
  }));
  return makeStreamPull(pullSignal, pullAtom);
};
const makeStreamPullEffect = (get, pullSignal, create, options) => Effect.flatMap(Stream.toPull(typeof create === "function" ? create(get) : create), pullChunk => {
  const fiber = Fiber.getCurrent();
  const services = fiber.context;
  let acc = Arr.empty();
  const pull = Effect.matchCauseEffect(pullChunk, {
    onFailure(cause) {
      if (Pull.isDoneCause(cause)) {
        if (!Arr.isReadonlyArrayNonEmpty(acc)) {
          return Effect.fail(new Cause.NoSuchElementError(`Atom.pull: no items`));
        }
        return Effect.succeed({
          done: true,
          items: acc
        });
      }
      return Effect.failCause(cause);
    },
    onSuccess(chunk) {
      let items;
      if (options?.disableAccumulation) {
        items = chunk;
      } else {
        items = Arr.appendAll(acc, chunk);
        acc = items;
      }
      return Effect.succeed({
        done: false,
        items
      });
    }
  });
  const cancels = new Set();
  get.addFinalizer(() => {
    for (const cancel of cancels) cancel();
  });
  get.once(pullSignal);
  get.subscribe(pullSignal, () => {
    get.setSelf(AsyncResult.waitingFrom(get.self()));
    let cancel;
    // eslint-disable-next-line prefer-const
    cancel = runCallbackSync(services, pull, exit => {
      if (cancel) cancels.delete(cancel);
      const result = AsyncResult.fromExitWithPrevious(exit, get.self());
      const pending = cancels.size > 0;
      get.setSelf(pending ? AsyncResult.waiting(result) : result);
    });
    if (cancel) cancels.add(cancel);
  });
  return pull;
});
const makeStreamPull = (pullSignal, pullAtom) => writable(pullAtom.read, function (ctx, _) {
  ctx.set(pullSignal, ctx.get(pullSignal) + 1);
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const family = typeof WeakRef === "undefined" || typeof FinalizationRegistry === "undefined" ? f => {
  const atoms = MutableHashMap.empty();
  return function (arg) {
    const atomEntry = MutableHashMap.get(atoms, arg);
    if (atomEntry._tag === "Some") {
      return atomEntry.value;
    }
    const newAtom = f(arg);
    MutableHashMap.set(atoms, arg, newAtom);
    return newAtom;
  };
} : f => {
  const atoms = MutableHashMap.empty();
  const registry = new FinalizationRegistry(arg => {
    MutableHashMap.remove(atoms, arg);
  });
  return function (arg) {
    const atomEntry = MutableHashMap.get(atoms, arg).pipe(Option.flatMapNullishOr(ref => ref.deref()));
    if (atomEntry._tag === "Some") {
      return atomEntry.value;
    }
    const newAtom = f(arg);
    MutableHashMap.set(atoms, arg, new WeakRef(newAtom));
    registry.register(newAtom, arg);
    return newAtom;
  };
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const withFallback = /*#__PURE__*/dual(2, (self, fallback) => {
  function withFallback(get) {
    const result = get(self);
    if (result._tag === "Initial") {
      return AsyncResult.waiting(get(fallback));
    }
    return result;
  }
  return isWritable(self) ? writable(withFallback, self.write, self.refresh ?? function (refresh) {
    refresh(self);
  }) : readable(withFallback, self.refresh ?? function (refresh) {
    refresh(self);
  });
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const keepAlive = self => Object.assign(Object.create(Object.getPrototypeOf(self)), {
  ...self,
  keepAlive: true
});
/**
 * Reverts the `keepAlive` behavior of a reactive value, allowing it to be
 * disposed of when not in use.
 *
 * Note that Atom's have this behavior by default.
 *
 * @since 4.0.0
 * @category combinators
 */
export const autoDispose = self => Object.assign(Object.create(Object.getPrototypeOf(self)), {
  ...self,
  keepAlive: false
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const setLazy = /*#__PURE__*/dual(2, (self, lazy) => Object.assign(Object.create(Object.getPrototypeOf(self)), {
  ...self,
  lazy
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const withLabel = /*#__PURE__*/dual(2, (self, name) => Object.assign(Object.create(Object.getPrototypeOf(self)), {
  ...self,
  label: [name, new Error().stack?.split("\n")[5] ?? ""]
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const initialValue = /*#__PURE__*/dual(2, (self, initialValue) => [self, initialValue]);
/**
 * @since 4.0.0
 * @category combinators
 */
export const transform = /*#__PURE__*/dual(args => isAtom(args[0]), (self, f, options) => {
  const atom = removeTtl(isWritable(self) ? writable(get => f(get, self), function (ctx, value) {
    ctx.set(self, value);
  }, self.refresh ?? function (refresh) {
    refresh(self);
  }) : readable(get => f(get, self), self.refresh ?? function (refresh) {
    refresh(self);
  }));
  if (options?.initialValueTarget) {
    ;
    atom.initialValueTarget = getInitialValueTarget(options.initialValueTarget);
  }
  return atom;
});
const getInitialValueTarget = atom => {
  let target = atom;
  while (target.initialValueTarget) {
    target = target.initialValueTarget;
  }
  return target;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const map = /*#__PURE__*/dual(2, (self, f) => transform(self, get => f(get(self))));
/**
 * @since 4.0.0
 * @category combinators
 */
export const mapResult = /*#__PURE__*/dual(2, (self, f) => map(self, AsyncResult.map(f)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const debounce = /*#__PURE__*/dual(2, (self, duration) => {
  const millis = Duration.toMillis(Duration.fromInputUnsafe(duration));
  return transform(self, function (get) {
    let timeout;
    let value = get.once(self);
    function update() {
      timeout = undefined;
      get.setSelf(value);
    }
    get.addFinalizer(function () {
      if (timeout) clearTimeout(timeout);
    });
    get.subscribe(self, function (val) {
      value = val;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(update, millis);
    });
    return value;
  }, {
    initialValueTarget: self
  });
});
/**
 * Ensures that the value of the atom is refreshed at most once per specified
 * duration.
 *
 * @since 4.0.0
 * @category combinators
 */
export const withRefresh = /*#__PURE__*/dual(2, (self, duration) => {
  const millis = Duration.toMillis(Duration.fromInputUnsafe(duration));
  return transform(self, function (get) {
    const handle = setTimeout(() => get.refresh(self), millis);
    get.addFinalizer(() => clearTimeout(handle));
    return get(self);
  }, {
    initialValueTarget: self
  });
});
/**
 * Adds stale-while-revalidate refresh behavior to an async result atom.
 *
 * Automatic revalidation during reads is skipped while the current value is
 * fresh within `staleTime`. Manual `refresh` calls remain forceful and always
 * forward to the wrapped atom.
 *
 * Use `revalidateOnMount` to control whether stale data should trigger a
 * background refresh on first mount. Use `revalidateOnFocus` to control
 * focus behavior. `true` respects `staleTime` and `"always"` forces refetch.
 *
 * @since 4.0.0
 * @category combinators
 */
export const swr = /*#__PURE__*/dual(2, (self, options) => {
  const staleTime = Duration.toMillis(Duration.fromInputUnsafe(options.staleTime));
  return transform(self, get => {
    const current = get.once(self);
    get.subscribe(self, value => {
      get.setSelf(value);
    });
    if (options.revalidateOnFocus && options.focusSignal) {
      get.once(options.focusSignal);
      get.subscribe(options.focusSignal, options.revalidateOnFocus === "always" ? () => get.refresh(self) : () => {
        const current = get.once(self);
        if (shouldRevalidateSWR(current, staleTime)) {
          get.refresh(self);
        }
      });
    }
    const firstRead = Option.isNone(get.self());
    if (firstRead && options.revalidateOnMount === false) {
      return current;
    }
    if (shouldRevalidateSWR(current, staleTime)) {
      get.refresh(self);
    }
    return current;
  }, {
    initialValueTarget: self
  });
});
const swrTimestamp = result => {
  if (result._tag === "Success") {
    return Option.some(result.timestamp);
  }
  if (result._tag === "Failure") {
    return Option.map(result.previousSuccess, success => success.timestamp);
  }
  return Option.none();
};
const isFreshWithin = (timestamp, staleTime, now) => now - timestamp < staleTime;
const shouldRevalidateSWR = (result, staleTime) => {
  if (result.waiting) {
    return false;
  }
  const timestamp = Option.getOrUndefined(swrTimestamp(result));
  if (timestamp === undefined) {
    return result._tag !== "Initial";
  }
  return !isFreshWithin(timestamp, staleTime, Date.now());
};
/**
 * @since 4.0.0
 * @category Optimistic
 */
export const optimistic = self => {
  let counter = 0;
  const writeAtom = removeTtl(state([counter, undefined]));
  return writable(get => {
    let lastValue = get.once(self);
    let needsRefresh = false;
    get.subscribe(self, value => {
      lastValue = value;
      if (transitions.size > 0) {
        return;
      }
      needsRefresh = false;
      if (!AsyncResult.isAsyncResult(value)) {
        return get.setSelf(value);
      }
      const current = Option.getOrUndefined(get.self());
      switch (value._tag) {
        case "Initial":
          {
            if (AsyncResult.isInitial(current)) {
              get.setSelf(value);
            }
            return;
          }
        case "Success":
          {
            if (AsyncResult.isSuccess(current)) {
              if (!value.waiting && value.timestamp >= current.timestamp) {
                get.setSelf(value);
              }
            } else {
              get.setSelf(value);
            }
            return;
          }
        case "Failure":
          {
            return get.setSelf(value);
          }
      }
    });
    const transitions = new Set();
    const cancels = new Set();
    get.subscribe(writeAtom, ([, atom]) => {
      if (transitions.has(atom)) return;
      transitions.add(atom);
      let cancel;
      // eslint-disable-next-line prefer-const
      cancel = get.registry.subscribe(atom, result => {
        if (AsyncResult.isSuccess(result) && result.waiting) {
          return get.setSelf(result.value);
        }
        transitions.delete(atom);
        if (cancel) {
          cancels.delete(cancel);
          cancel();
        }
        if (!needsRefresh && !AsyncResult.isFailure(result)) {
          needsRefresh = true;
        }
        if (transitions.size === 0) {
          if (needsRefresh) {
            needsRefresh = false;
            get.refresh(self);
          } else {
            get.setSelf(lastValue);
          }
        }
      }, {
        immediate: true
      });
      if (transitions.has(atom)) {
        cancels.add(cancel);
      } else {
        cancel();
      }
    });
    get.addFinalizer(() => {
      for (const cancel of cancels) cancel();
      transitions.clear();
      cancels.clear();
    });
    return lastValue;
  }, (ctx, atom) => ctx.set(writeAtom, [++counter, atom]), refresh => refresh(self));
};
/**
 * @since 4.0.0
 * @category Optimistic
 */
export const optimisticFn = /*#__PURE__*/dual(2, (self, options) => {
  const transition = removeTtl(state(AsyncResult.initial()));
  return fn((arg, get) => {
    let value = options.reducer(get(self), arg);
    if (AsyncResult.isAsyncResult(value)) {
      value = AsyncResult.waiting(value, {
        touch: true
      });
    }
    get.set(transition, AsyncResult.success(value, {
      waiting: true
    }));
    get.set(self, transition);
    const fn = typeof options.fn === "function" ? autoDispose(options.fn(value => get.set(transition, AsyncResult.success(AsyncResult.isAsyncResult(value) ? AsyncResult.waiting(value) : value, {
      waiting: true
    })))) : options.fn;
    get.set(fn, arg);
    return Effect.callback(resume => {
      get.subscribe(fn, result => {
        if (result._tag === "Initial" || result.waiting) return;
        get.set(transition, AsyncResult.map(result, () => value));
        resume(AsyncResult.toExit(result));
      }, {
        immediate: true
      });
    });
  });
});
/**
 * @since 4.0.0
 * @category batching
 */
export const batch = Registry.batch;
// -----------------------------------------------------------------------------
// Focus
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category Focus
 */
export const windowFocusSignal = /*#__PURE__*/readable(get => {
  let count = 0;
  function update() {
    if (document.visibilityState === "visible") {
      get.setSelf(++count);
    }
  }
  window.addEventListener("visibilitychange", update);
  get.addFinalizer(() => {
    window.removeEventListener("visibilitychange", update);
  });
  return count;
});
/**
 * @since 4.0.0
 * @category Focus
 */
export const makeRefreshOnSignal = signal => self => transform(self, get => {
  get.once(signal);
  get.subscribe(signal, _ => get.refresh(self));
  get.subscribe(self, value => get.setSelf(value));
  return get.once(self);
}, {
  initialValueTarget: self
});
/**
 * @since 4.0.0
 * @category Focus
 */
export const refreshOnWindowFocus = /*#__PURE__*/makeRefreshOnSignal(windowFocusSignal);
// -----------------------------------------------------------------------------
// KeyValueStore
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category KeyValueStore
 */
export const kvs = options => {
  const setAtom = options.runtime.fn(value => KeyValueStore.KeyValueStore.use(store => KeyValueStore.toSchemaStore(store, options.schema).set(options.key, value)));
  const resultAtom = options.runtime.atom(KeyValueStore.KeyValueStore.use(store => KeyValueStore.toSchemaStore(store, options.schema).get(options.key)));
  return writable(options.mode === "async" ? get => {
    get.mount(setAtom);
    const mapper = AsyncResult.map(Option.getOrElse(() => {
      const value = options.defaultValue();
      get.set(setAtom, value);
      return value;
    }));
    get.subscribe(resultAtom, result => get.setSelf(mapper(result)));
    return mapper(get.once(resultAtom));
  } : get => {
    get.mount(setAtom);
    get.subscribe(resultAtom, result => {
      if (!AsyncResult.isSuccess(result)) return;
      if (Option.isSome(result.value)) {
        get.setSelf(result.value.value);
      } else {
        const value = Option.getOrElse(get.self(), options.defaultValue);
        get.setSelf(value);
        get.set(setAtom, value);
      }
    }, {
      immediate: true
    });
    return Option.getOrElse(get.self(), options.defaultValue);
  }, (ctx, value) => {
    ctx.set(setAtom, value);
    ctx.setSelf(value);
  });
};
// -----------------------------------------------------------------------------
// URL search params
// -----------------------------------------------------------------------------
/**
 * Create an Atom that reads and writes a URL search parameter.
 *
 * Note: If you pass a schema, it has to be synchronous and have no context.
 *
 * @since 4.0.0
 * @category URL search params
 */
export const searchParam = (name, options) => {
  const decode = options?.schema && Schema.decodeExit(options.schema);
  const encode = options?.schema && Schema.encodeExit(options.schema);
  return writable(get => {
    if (typeof window === "undefined") {
      return decode ? Option.none() : "";
    }
    const handleUpdate = () => {
      if (searchParamState.updating) return;
      const searchParams = new URLSearchParams(window.location.search);
      const newValue = searchParams.get(name) || "";
      if (decode) {
        get.setSelf(Exit.getSuccess(decode(newValue)));
      } else if (newValue !== Option.getOrUndefined(get.self())) {
        get.setSelf(newValue);
      }
    };
    window.addEventListener("popstate", handleUpdate);
    window.addEventListener("pushstate", handleUpdate);
    get.addFinalizer(() => {
      window.removeEventListener("popstate", handleUpdate);
      window.removeEventListener("pushstate", handleUpdate);
    });
    const value = new URLSearchParams(window.location.search).get(name) || "";
    return decode ? Exit.getSuccess(decode(value)) : value;
  }, (ctx, value) => {
    if (typeof window === "undefined") {
      ctx.setSelf(value);
      return;
    }
    if (encode) {
      const encoded = Option.flatMap(value, v => Exit.getSuccess(encode(v)));
      searchParamState.updates.set(name, Option.getOrElse(encoded, () => ""));
      value = Option.zipRight(encoded, value);
    } else {
      searchParamState.updates.set(name, value);
    }
    ctx.setSelf(value);
    if (searchParamState.timeout) {
      clearTimeout(searchParamState.timeout);
    }
    searchParamState.timeout = setTimeout(updateSearchParams, 500);
  });
};
const searchParamState = {
  timeout: undefined,
  updates: /*#__PURE__*/new Map(),
  updating: false
};
function updateSearchParams() {
  searchParamState.timeout = undefined;
  searchParamState.updating = true;
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParamState.updates.entries()) {
    if (value.length > 0) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }
  searchParamState.updates.clear();
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, "", newUrl);
  searchParamState.updating = false;
}
// -----------------------------------------------------------------------------
// conversions
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toStream = self => Stream.unwrap(AtomRegistry.use(r => Effect.succeed(Registry.toStream(r, self))));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toStreamResult = self => Stream.unwrap(AtomRegistry.use(r => Effect.succeed(Registry.toStreamResult(r, self))));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const get = self => AtomRegistry.use(r => Effect.succeed(r.get(self)));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const modify = /*#__PURE__*/dual(2, (self, f) => Effect.map(AtomRegistry.asEffect(), _ => _.modify(self, f)));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const set = /*#__PURE__*/dual(2, (self, value) => Effect.map(AtomRegistry.asEffect(), _ => _.set(self, value)));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const update = /*#__PURE__*/dual(2, (self, f) => Effect.map(AtomRegistry.asEffect(), _ => _.update(self, f)));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const getResult = (self, options) => AtomRegistry.use(Registry.getResult(self, options));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const refresh = self => Effect.map(AtomRegistry.asEffect(), _ => _.refresh(self));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const mount = self => AtomRegistry.use(r => Registry.mount(r, self));
// -----------------------------------------------------------------------------
// Serializable
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category Serializable
 */
export const SerializableTypeId = "~effect-atom/atom/Atom/Serializable";
/**
 * @since 4.0.0
 * @category Serializable
 */
export const isSerializable = self => SerializableTypeId in self;
/**
 * @since 4.0.0
 * @category combinators
 */
export const serializable = /*#__PURE__*/dual(2, (self, options) => {
  const codecJson = Schema.toCodecJson(options.schema);
  return Object.assign(Object.create(Object.getPrototypeOf(self)), {
    ...self,
    label: self.label ?? [options.key, new Error().stack?.split("\n")[5] ?? ""],
    [SerializableTypeId]: {
      key: options.key,
      encode: Schema.encodeSync(codecJson),
      decode: Schema.decodeSync(codecJson)
    }
  });
});
/**
 * @since 4.0.0
 * @category ServerValue
 */
export const ServerValueTypeId = "~effect-atom/atom/Atom/ServerValue";
/**
 * Overrides the value of an Atom when read on the server.
 *
 * @since 4.0.0
 * @category ServerValue
 */
export const withServerValue = /*#__PURE__*/dual(2, (self, read) => Object.assign(Object.create(Object.getPrototypeOf(self)), {
  ...self,
  [ServerValueTypeId]: read
}));
/**
 * Sets the Atom's server value to `Result.initial(true)`.
 *
 * @since 4.0.0
 * @category ServerValue
 */
export const withServerValueInitial = self => withServerValue(self, constant(AsyncResult.initial(true)));
/**
 * @since 4.0.0
 * @category ServerValue
 */
export const getServerValue = /*#__PURE__*/dual(2, (self, registry) => ServerValueTypeId in self ? self[ServerValueTypeId](atom => registry.get(atom)) : registry.get(self));
//# sourceMappingURL=Atom.js.map