/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import { constVoid, dual } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import { hasProperty } from "../../Predicate.js";
import * as Queue from "../../Queue.js";
import { MixedScheduler } from "../../Scheduler.js";
import * as Scope from "../../Scope.js";
import * as Stream from "../../Stream.js";
import * as Result from "./AsyncResult.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/reactivity/AtomRegistry";
/**
 * @since 4.0.0
 * @category guards
 */
export const isAtomRegistry = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => new RegistryImpl(options?.initialValues, options?.scheduleTask, options?.timeoutResolution, options?.defaultIdleTTL);
/**
 * @since 4.0.0
 * @category Tags
 */
export const AtomRegistry = /*#__PURE__*/Context.Service(TypeId);
/**
 * @since 4.0.0
 * @category Layers
 */
export const layerOptions = options => Layer.effect(AtomRegistry, Effect.gen(function* () {
  const scope = yield* Effect.scope;
  const registry = make({
    ...options,
    scheduleTask: options?.scheduleTask
  });
  yield* Scope.addFinalizer(scope, Effect.sync(() => registry.dispose()));
  return registry;
}));
/**
 * @since 4.0.0
 * @category Layers
 */
export const layer = /*#__PURE__*/layerOptions();
// -----------------------------------------------------------------------------
// conversions
// -----------------------------------------------------------------------------
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toStream = /*#__PURE__*/dual(2, (self, atom) => Stream.callback(queue => Effect.suspend(() => {
  const fiber = Fiber.getCurrent();
  const scope = Context.getUnsafe(fiber.context, Scope.Scope);
  const cancel = self.subscribe(atom, value => Queue.offerUnsafe(queue, value), {
    immediate: true
  });
  return Scope.addFinalizer(scope, Effect.sync(cancel));
})));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toStreamResult = /*#__PURE__*/dual(2, (self, atom) => toStream(self, atom).pipe(Stream.filter(Result.isNotInitial), Stream.mapEffect(result => result._tag === "Success" ? Effect.succeed(result.value) : Effect.failCause(result.cause)), Stream.changes));
/**
 * @since 4.0.0
 * @category Conversions
 */
export const getResult = /*#__PURE__*/dual(args => isAtomRegistry(args[0]), (self, atom, options) => {
  const suspendOnWaiting = options?.suspendOnWaiting ?? false;
  return Effect.callback(resume => {
    const result = self.get(atom);
    if (result._tag !== "Initial" && !(suspendOnWaiting && result.waiting)) {
      return resume(Result.toExit(result));
    }
    const cancel = self.subscribe(atom, value => {
      if (value._tag !== "Initial" && !(suspendOnWaiting && value.waiting)) {
        resume(Result.toExit(value));
        cancel();
      }
    });
    return Effect.sync(cancel);
  });
});
/**
 * @since 4.0.0
 * @category Conversions
 */
export const mount = /*#__PURE__*/dual(2, (self, atom) => Effect.acquireRelease(Effect.sync(() => self.mount(atom)), release => Effect.sync(release)));
// -----------------------------------------------------------------------------
// internal
// -----------------------------------------------------------------------------
const constImmediate = {
  immediate: true
};
const notifyListener = listener => {
  listener();
};
const SerializableTypeId = "~effect-atom/atom/Atom/Serializable";
const atomKey = atom => SerializableTypeId in atom ? atom[SerializableTypeId].key : atom;
class RegistryImpl {
  [TypeId];
  timeoutResolution;
  defaultIdleTTL;
  scheduler;
  schedulerAsync;
  dispatcher;
  onNodeAdded;
  onNodeRemoved;
  constructor(initialValues, scheduleTask, timeoutResolution, defaultIdleTTL) {
    this[TypeId] = TypeId;
    this.scheduler = new MixedScheduler("sync", scheduleTask);
    this.schedulerAsync = new MixedScheduler("async", scheduleTask);
    this.dispatcher = this.schedulerAsync.makeDispatcher();
    this.defaultIdleTTL = defaultIdleTTL;
    if (timeoutResolution === undefined && defaultIdleTTL !== undefined) {
      this.timeoutResolution = Math.round(defaultIdleTTL / 2);
    } else {
      this.timeoutResolution = timeoutResolution ?? 1000;
    }
    if (initialValues !== undefined) {
      for (const [atom, value] of initialValues) {
        let target = atom;
        while (target.initialValueTarget) {
          target = target.initialValueTarget;
        }
        this.ensureNode(target).setInitialValue(value);
      }
    }
  }
  nodes = /*#__PURE__*/new Map();
  preloadedSerializable = /*#__PURE__*/new Map();
  timeoutBuckets = /*#__PURE__*/new Map();
  nodeTimeoutBucket = /*#__PURE__*/new Map();
  disposed = false;
  getNodes() {
    return this.nodes;
  }
  get(atom) {
    return this.ensureNode(atom).value();
  }
  set(atom, value) {
    atom.write(this.ensureNode(atom).writeContext, value);
  }
  setSerializable(key, encoded) {
    this.preloadedSerializable.set(key, encoded);
  }
  modify(atom, f) {
    const node = this.ensureNode(atom);
    const result = f(node.value());
    atom.write(node.writeContext, result[1]);
    return result[0];
  }
  update(atom, f) {
    const node = this.ensureNode(atom);
    atom.write(node.writeContext, f(node.value()));
  }
  refresh = atom => {
    if (atom.refresh !== undefined) {
      atom.refresh(this.refresh);
    } else {
      this.invalidateAtom(atom);
    }
  };
  subscribe(atom, f, options) {
    const node = this.ensureNode(atom);
    if (options?.immediate) {
      f(node.value());
    }
    const remove = node.subscribe(function () {
      f(node._value);
    });
    return () => {
      remove();
      if (node.canBeRemoved) {
        this.scheduleNodeRemoval(node);
      }
    };
  }
  mount(atom) {
    return this.subscribe(atom, constVoid, constImmediate);
  }
  atomHasTtl(atom) {
    return !atom.keepAlive && atom.idleTTL !== 0 && (atom.idleTTL !== undefined || this.defaultIdleTTL !== undefined);
  }
  ensureNode(atom) {
    const key = atomKey(atom);
    let node = this.nodes.get(key);
    if (node === undefined) {
      node = this.createNode(atom);
      this.nodes.set(key, node);
      this.onNodeAdded?.(node);
    } else if (this.atomHasTtl(atom)) {
      this.removeNodeTimeout(node);
    }
    if (typeof key === "string" && this.preloadedSerializable.has(key)) {
      const encoded = this.preloadedSerializable.get(key);
      this.preloadedSerializable.delete(key);
      const decoded = atom[SerializableTypeId].decode(encoded);
      node.setValue(decoded);
    }
    return node;
  }
  createNode(atom) {
    if (this.disposed) {
      throw new Error(`Cannot access Atom ${atom}: registry is disposed`);
    }
    if (!atom.keepAlive) {
      this.scheduleAtomRemoval(atom);
    }
    return new NodeImpl(this, atom);
  }
  invalidateAtom = atom => {
    this.ensureNode(atom).invalidate();
  };
  scheduleAtomRemoval(atom) {
    this.dispatcher.scheduleTask(() => {
      const node = this.nodes.get(atomKey(atom));
      if (node !== undefined && node.canBeRemoved) {
        this.removeNode(node);
      }
    }, 0);
  }
  scheduleNodeRemoval(node) {
    this.dispatcher.scheduleTask(() => {
      if (node.canBeRemoved) {
        this.removeNode(node);
      }
    }, 0);
  }
  removeNode(node) {
    if (this.atomHasTtl(node.atom)) {
      this.setNodeTimeout(node);
    } else {
      this.nodes.delete(atomKey(node.atom));
      node.remove();
      this.onNodeRemoved?.(node);
    }
  }
  setNodeTimeout(node) {
    if (this.nodeTimeoutBucket.has(node)) {
      return;
    }
    let idleTTL = node.atom.idleTTL ?? this.defaultIdleTTL;
    if (this.#currentSweepTTL !== null) {
      idleTTL -= this.#currentSweepTTL;
      if (idleTTL <= 0) {
        this.nodes.delete(atomKey(node.atom));
        node.remove();
        this.onNodeRemoved?.(node);
        return;
      }
    }
    const ttl = Math.ceil(idleTTL / this.timeoutResolution) * this.timeoutResolution;
    const timestamp = Date.now() + ttl;
    const bucket = timestamp - timestamp % this.timeoutResolution + this.timeoutResolution;
    let entry = this.timeoutBuckets.get(bucket);
    if (entry === undefined) {
      entry = [new Set(), setTimeout(() => this.sweepBucket(bucket), bucket - Date.now())];
      this.timeoutBuckets.set(bucket, entry);
    }
    entry[0].add(node);
    this.nodeTimeoutBucket.set(node, bucket);
  }
  removeNodeTimeout(node) {
    const bucket = this.nodeTimeoutBucket.get(node);
    if (bucket === undefined) return;
    this.nodeTimeoutBucket.delete(node);
    this.scheduleNodeRemoval(node);
    const [nodes, handle] = this.timeoutBuckets.get(bucket);
    nodes.delete(node);
    if (nodes.size === 0) {
      clearTimeout(handle);
      this.timeoutBuckets.delete(bucket);
    }
  }
  #currentSweepTTL = null;
  sweepBucket(bucket) {
    const nodes = this.timeoutBuckets.get(bucket)[0];
    this.timeoutBuckets.delete(bucket);
    nodes.forEach(node => {
      this.nodeTimeoutBucket.delete(node);
      if (!node.canBeRemoved) return;
      this.nodes.delete(atomKey(node.atom));
      this.onNodeRemoved?.(node);
      this.#currentSweepTTL = node.atom.idleTTL ?? this.defaultIdleTTL;
      node.remove();
      this.#currentSweepTTL = null;
    });
  }
  reset() {
    this.timeoutBuckets.forEach(([, handle]) => clearTimeout(handle));
    this.timeoutBuckets.clear();
    this.nodeTimeoutBucket.clear();
    this.nodes.forEach(node => {
      node.remove();
      this.onNodeRemoved?.(node);
    });
    this.nodes.clear();
  }
  dispose() {
    this.disposed = true;
    this.reset();
  }
}
const NodeFlags = {
  alive: 1,
  // 1 << 0
  initialized: 2,
  // 1 << 1,
  waitingForValue: 4 // 1 << 2
};
const NodeState = {
  uninitialized: NodeFlags.alive | NodeFlags.waitingForValue,
  stale: NodeFlags.alive | NodeFlags.initialized | NodeFlags.waitingForValue,
  valid: NodeFlags.alive | NodeFlags.initialized,
  removed: 0
};
class NodeImpl {
  constructor(registry, atom) {
    this.registry = registry;
    this.atom = atom;
    this.writeContext = new WriteContextImpl(registry, this);
  }
  registry;
  atom;
  state = NodeState.uninitialized;
  lifetime;
  writeContext;
  preserveInitialValueOnBuild = false;
  parents = [];
  previousParents;
  children = [];
  listeners = /*#__PURE__*/new Set();
  skipInvalidation = false;
  currentState() {
    switch (this.state) {
      case NodeState.uninitialized:
        return "uninitialized";
      case NodeState.stale:
        return "stale";
      case NodeState.valid:
        return "valid";
      default:
        return "removed";
    }
  }
  get canBeRemoved() {
    return !this.atom.keepAlive && this.listeners.size === 0 && this.children.length === 0 && this.state !== 0;
  }
  _value = undefined;
  value() {
    if ((this.state & NodeFlags.waitingForValue) !== 0) {
      this.lifetime = makeLifetime(this);
      const value = this.atom.read(this.lifetime);
      if ((this.state & NodeFlags.waitingForValue) !== 0) {
        if (this.preserveInitialValueOnBuild) {
          this.preserveInitialValueOnBuild = false;
          this.state = NodeState.valid;
        } else {
          this.setValue(value);
        }
      }
      if (this.previousParents) {
        const parents = this.previousParents;
        this.previousParents = undefined;
        for (let i = 0; i < parents.length; i++) {
          parents[i].removeChild(this);
          if (parents[i].canBeRemoved) {
            this.registry.scheduleNodeRemoval(parents[i]);
          }
        }
      }
    }
    return this._value;
  }
  valueOption() {
    if ((this.state & NodeFlags.initialized) === 0) {
      return Option.none();
    }
    return Option.some(this._value);
  }
  setInitialValue(value) {
    if ((this.state & NodeFlags.initialized) === 0) {
      this.preserveInitialValueOnBuild = true;
      this.state = NodeState.stale;
      this._value = value;
      if (batchState.phase === BatchPhase.collect) {
        batchState.notify.add(this);
      } else {
        this.notify();
      }
      return;
    }
    this.setValue(value);
  }
  setValue(value) {
    if ((this.state & NodeFlags.initialized) === 0) {
      this.state = NodeState.valid;
      this._value = value;
      if (batchState.phase === BatchPhase.collect) {
        batchState.notify.add(this);
      } else {
        this.notify();
      }
      return;
    }
    this.state = NodeState.valid;
    if (Object.is(this._value, value)) {
      return;
    }
    this._value = value;
    if (this.skipInvalidation) {
      this.skipInvalidation = false;
    } else {
      this.invalidateChildren();
    }
    if (this.listeners.size > 0) {
      if (batchState.phase === BatchPhase.collect) {
        batchState.notify.add(this);
      } else {
        this.notify();
      }
    }
  }
  addParent(parent) {
    this.parents.push(parent);
    if (this.previousParents !== undefined) {
      const index = this.previousParents.indexOf(parent);
      if (index !== -1) {
        this.previousParents[index] = this.previousParents[this.previousParents.length - 1];
        if (this.previousParents.pop() === undefined) {
          this.previousParents = undefined;
        }
      }
    }
    if (parent.children.indexOf(this) === -1) {
      parent.children.push(this);
      if (parent.skipInvalidation) {
        parent.skipInvalidation = false;
      }
    }
  }
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children[index] = this.children[this.children.length - 1];
      this.children.pop();
    }
  }
  invalidate() {
    if (this.state === NodeState.valid) {
      this.state = NodeState.stale;
      this.disposeLifetime();
    }
    if (batchState.phase === BatchPhase.collect) {
      batchState.stale.push(this);
    } else if (this.atom.lazy && this.listeners.size === 0 && !childrenAreActive(this.children)) {
      this.invalidateChildren();
      this.skipInvalidation = true;
    } else {
      this.value();
    }
  }
  invalidateChildren() {
    if (this.children.length === 0) {
      return;
    }
    const children = this.children;
    this.children = [];
    for (let i = 0; i < children.length; i++) {
      children[i].invalidate();
    }
  }
  notify() {
    this.listeners.forEach(notifyListener);
    if (batchState.phase === BatchPhase.commit) {
      batchState.notify.delete(this);
    }
  }
  disposeLifetime() {
    if (this.lifetime !== undefined) {
      this.lifetime.dispose();
      this.lifetime = undefined;
    }
    if (this.parents.length !== 0) {
      this.previousParents = this.parents;
      this.parents = [];
    }
  }
  remove() {
    this.state = NodeState.removed;
    this.listeners.clear();
    if (this.lifetime === undefined) {
      return;
    }
    this.disposeLifetime();
    if (this.previousParents === undefined) {
      return;
    }
    const parents = this.previousParents;
    this.previousParents = undefined;
    for (let i = 0; i < parents.length; i++) {
      parents[i].removeChild(this);
      if (parents[i].canBeRemoved) {
        this.registry.removeNode(parents[i]);
      }
    }
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
function childrenAreActive(children) {
  if (children.length === 0) {
    return false;
  }
  let current = children;
  let stack;
  let stackIndex = 0;
  while (current !== undefined) {
    for (let i = 0, len = current.length; i < len; i++) {
      const child = current[i];
      if (!child.atom.lazy || child.listeners.size > 0) {
        return true;
      } else if (child.children.length > 0) {
        if (stack === undefined) {
          stack = [child.children];
        } else {
          stack.push(child.children);
        }
      }
    }
    current = stack?.[stackIndex++];
  }
  return false;
}
const LifetimeProto = {
  get registry() {
    return this.node.registry;
  },
  addFinalizer(f) {
    if (this.disposed) return f();
    this.finalizers ??= [];
    this.finalizers.push(f);
  },
  get(atom) {
    if (this.disposed) {
      return this.node.registry.get(atom);
    }
    const parent = this.node.registry.ensureNode(atom);
    this.node.addParent(parent);
    return parent.value();
  },
  result(atom, options) {
    if (this.disposed || this.isFn) {
      return this.resultOnce(atom, options);
    }
    const result = this.get(atom);
    if (options?.suspendOnWaiting && result.waiting) {
      return Effect.never;
    }
    switch (result._tag) {
      case "Initial":
        {
          return Effect.never;
        }
      case "Failure":
        {
          return Exit.failCause(result.cause);
        }
      case "Success":
        {
          return Effect.succeed(result.value);
        }
    }
  },
  resultOnce(atom, options) {
    return Effect.callback(resume => {
      const result = this.once(atom);
      if (result._tag !== "Initial" && !(options?.suspendOnWaiting && result.waiting)) {
        return resume(Result.toExit(result));
      }
      const cancel = this.node.registry.subscribe(atom, result => {
        if (result._tag === "Initial" || options?.suspendOnWaiting && result.waiting) return;
        cancel();
        resume(Result.toExit(result));
      }, {
        immediate: false
      });
      return Effect.sync(cancel);
    });
  },
  setResult(atom, value) {
    if (this.disposed) return Effect.never;
    this.node.registry.set(atom, value);
    return this.resultOnce(atom, {
      suspendOnWaiting: true
    });
  },
  some(atom) {
    if (this.disposed || this.isFn) {
      return this.someOnce(atom);
    }
    const result = this.get(atom);
    return result._tag === "None" ? Effect.never : Effect.succeed(result.value);
  },
  someOnce(atom) {
    return Effect.callback(resume => {
      const result = this.once(atom);
      if (Option.isSome(result)) {
        return resume(Effect.succeed(result.value));
      }
      const cancel = this.node.registry.subscribe(atom, result => {
        if (Option.isNone(result)) return;
        cancel();
        resume(Effect.succeed(result.value));
      }, {
        immediate: false
      });
      return Effect.sync(cancel);
    });
  },
  once(atom) {
    return this.node.registry.get(atom);
  },
  self() {
    if (this.disposed) return Option.none();
    return this.node.valueOption();
  },
  refresh(atom) {
    if (this.disposed) return;
    this.node.registry.refresh(atom);
  },
  refreshSelf() {
    if (this.disposed) return;
    this.node.invalidate();
  },
  mount(atom) {
    if (this.disposed) return;
    this.addFinalizer(this.node.registry.mount(atom));
  },
  subscribe(atom, f, options) {
    if (this.disposed) return;
    this.addFinalizer(this.node.registry.subscribe(atom, f, options));
  },
  setSelf(a) {
    if (this.disposed) return;
    this.node.setValue(a);
  },
  set(atom, value) {
    if (this.disposed) return;
    this.node.registry.set(atom, value);
  },
  stream(atom, options) {
    if (this.disposed) return Stream.empty;
    return Stream.callback(queue => Effect.sync(() => {
      this.subscribe(atom, value => Queue.offerUnsafe(queue, value), {
        immediate: !options?.withoutInitialValue
      });
    }));
  },
  streamResult(atom, options) {
    return this.stream(atom, options).pipe(Stream.filter(Result.isNotInitial), Stream.mapEffect(result => result._tag === "Success" ? Effect.succeed(result.value) : Effect.failCause(result.cause)));
  },
  dispose() {
    this.disposed = true;
    if (this.finalizers === undefined) {
      return;
    }
    const finalizers = this.finalizers;
    this.finalizers = undefined;
    for (let i = finalizers.length - 1; i >= 0; i--) {
      finalizers[i]();
    }
  }
};
const makeLifetime = node => {
  function get(atom) {
    if (get.disposed) {
      return node.registry.get(atom);
    } else if (get.isFn) {
      return node.registry.get(atom);
    }
    const parent = node.registry.ensureNode(atom);
    const value = parent.value();
    node.addParent(parent);
    return value;
  }
  Object.setPrototypeOf(get, LifetimeProto);
  get.isFn = false;
  get.disposed = false;
  get.finalizers = undefined;
  get.node = node;
  return get;
};
class WriteContextImpl {
  constructor(registry, node) {
    this.registry = registry;
    this.node = node;
  }
  registry;
  node;
  get(atom) {
    return this.registry.get(atom);
  }
  set(atom, value) {
    return this.registry.set(atom, value);
  }
  setSelf(value) {
    return this.node.setValue(value);
  }
  refreshSelf() {
    return this.node.invalidate();
  }
}
// -----------------------------------------------------------------------------
// batching
// -----------------------------------------------------------------------------
/** @internal */
export const BatchPhase = {
  disabled: 0,
  collect: 1,
  commit: 2
};
/** @internal */
export const batchState = {
  phase: BatchPhase.disabled,
  depth: 0,
  stale: [],
  notify: /*#__PURE__*/new Set()
};
/** @internal */
export function batch(f) {
  batchState.phase = BatchPhase.collect;
  batchState.depth++;
  try {
    f();
    if (batchState.depth === 1) {
      for (let i = 0; i < batchState.stale.length; i++) {
        batchRebuildNode(batchState.stale[i]);
      }
      batchState.phase = BatchPhase.commit;
      for (const node of batchState.notify) {
        node.notify();
      }
      batchState.notify.clear();
    }
  } finally {
    batchState.depth--;
    if (batchState.depth === 0) {
      batchState.phase = BatchPhase.disabled;
      batchState.stale = [];
    }
  }
}
function batchRebuildNode(node) {
  if (node.state === NodeState.valid) {
    return;
  }
  for (let i = 0; i < node.parents.length; i++) {
    const parent = node.parents[i];
    if (parent.state !== NodeState.valid) {
      batchRebuildNode(parent);
    }
  }
  // @ts-ignore
  if (node.state !== NodeState.valid) {
    node.value();
  }
}
//# sourceMappingURL=AtomRegistry.js.map