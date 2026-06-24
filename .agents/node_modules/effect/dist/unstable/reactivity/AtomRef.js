/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
/**
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = "~effect/reactivity/AtomRef";
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = value => new AtomRefImpl(value);
/**
 * @since 4.0.0
 * @category constructors
 */
export const collection = items => new CollectionImpl(items);
const keyState = {
  count: 0,
  generate() {
    return `AtomRef-${this.count++}`;
  }
};
class ReadonlyRefImpl {
  [TypeId];
  key = /*#__PURE__*/keyState.generate();
  value;
  constructor(value) {
    this[TypeId] = TypeId;
    this.value = value;
  }
  [Equal.symbol](that) {
    return Equal.equals(this.value, that.value);
  }
  [Hash.symbol]() {
    return Hash.hash(this.value);
  }
  listeners = [];
  listenerCount = 0;
  notify(a) {
    for (let i = 0; i < this.listenerCount; i++) {
      this.listeners[i](a);
    }
  }
  subscribe(f) {
    this.listeners.push(f);
    this.listenerCount++;
    return () => {
      const index = this.listeners.indexOf(f);
      if (index !== -1) {
        this.listeners[index] = this.listeners[this.listenerCount - 1];
        this.listeners.pop();
        this.listenerCount--;
      }
    };
  }
  map(f) {
    return new MapRefImpl(this, f);
  }
}
class AtomRefImpl extends ReadonlyRefImpl {
  prop(prop) {
    return new PropRefImpl(this, prop);
  }
  set(value) {
    if (Equal.equals(value, this.value)) {
      return this;
    }
    this.value = value;
    this.notify(value);
    return this;
  }
  update(f) {
    return this.set(f(this.value));
  }
}
class MapRefImpl {
  [TypeId];
  key = /*#__PURE__*/keyState.generate();
  parent;
  transform;
  constructor(parent, transform) {
    this[TypeId] = TypeId;
    this.parent = parent;
    this.transform = transform;
  }
  [Equal.symbol](that) {
    return Equal.equals(this.value, that.value);
  }
  [Hash.symbol]() {
    return Hash.hash(this.value);
  }
  get value() {
    return this.transform(this.parent.value);
  }
  subscribe(f) {
    let previous = this.transform(this.parent.value);
    return this.parent.subscribe(a => {
      const next = this.transform(a);
      if (Equal.equals(next, previous)) {
        return;
      }
      previous = next;
      f(next);
    });
  }
  map(f) {
    return new MapRefImpl(this, f);
  }
}
class PropRefImpl {
  [TypeId];
  key = /*#__PURE__*/keyState.generate();
  previous;
  parent;
  _prop;
  constructor(parent, _prop) {
    this[TypeId] = TypeId;
    this.parent = parent;
    this._prop = _prop;
    this.previous = parent.value[_prop];
  }
  [Equal.symbol](that) {
    return Equal.equals(this.value, that.value);
  }
  [Hash.symbol]() {
    return Hash.hash(this.value);
  }
  get value() {
    if (this.parent.value && this._prop in this.parent.value) {
      this.previous = this.parent.value[this._prop];
    }
    return this.previous;
  }
  subscribe(f) {
    let previous = this.value;
    return this.parent.subscribe(a => {
      if (!a || !(this._prop in a)) {
        return;
      }
      const next = a[this._prop];
      if (Equal.equals(next, previous)) {
        return;
      }
      previous = next;
      f(next);
    });
  }
  map(f) {
    return new MapRefImpl(this, f);
  }
  prop(prop) {
    return new PropRefImpl(this, prop);
  }
  set(value) {
    if (Array.isArray(this.parent.value)) {
      const newArray = this.parent.value.slice();
      newArray[this._prop] = value;
      this.parent.set(newArray);
    } else {
      this.parent.set({
        ...this.parent.value,
        [this._prop]: value
      });
    }
    return this;
  }
  update(f) {
    if (Array.isArray(this.parent.value)) {
      const newArray = this.parent.value.slice();
      newArray[this._prop] = f(this.parent.value[this._prop]);
      this.parent.set(newArray);
    } else {
      this.parent.set({
        ...this.parent.value,
        [this._prop]: f(this.parent.value[this._prop])
      });
    }
    return this;
  }
}
class CollectionImpl extends ReadonlyRefImpl {
  constructor(items) {
    super([]);
    for (const item of items) {
      this.value.push(this.makeRef(item));
    }
  }
  makeRef(value) {
    const ref = new AtomRefImpl(value);
    const notify = value => {
      ref.notify(value);
      this.notify(this.value);
    };
    return new Proxy(ref, {
      get(target, p, _receiver) {
        if (p === "notify") {
          return notify;
        }
        return target[p];
      }
    });
  }
  push(item) {
    const ref = this.makeRef(item);
    this.value.push(ref);
    this.notify(this.value);
    return this;
  }
  insertAt(index, item) {
    const ref = this.makeRef(item);
    this.value.splice(index, 0, ref);
    this.notify(this.value);
    return this;
  }
  remove(ref) {
    const index = this.value.indexOf(ref);
    if (index !== -1) {
      this.value.splice(index, 1);
      this.notify(this.value);
    }
    return this;
  }
  toArray() {
    return this.value.map(ref => ref.value);
  }
}
//# sourceMappingURL=AtomRef.js.map