/**
 * Composable, immutable accessors for reading and updating nested data
 * structures without mutation.
 *
 * **Mental model**
 *
 * - **Optic** — a first-class reference to a piece inside a larger structure.
 *   Compose optics to reach deeply nested values.
 * - **Iso** — lossless two-way conversion (`get`/`set`) between `S` and `A`.
 *   Extends both {@link Lens} and {@link Prism}.
 * - **Lens** — focuses on exactly one part of `S`. `get` always succeeds;
 *   `replace` needs the original `S` to produce the updated whole.
 * - **Prism** — focuses on a part that may not be present (e.g. a union
 *   variant). `getResult` can fail; `set` builds a new `S` from `A` alone.
 * - **Optional** — the most general optic: both reading and writing can fail.
 * - **Traversal** — focuses on zero or more elements of an array-like
 *   structure. Technically `Optional<S, ReadonlyArray<A>>`.
 * - **Hierarchy** (strongest → weakest):
 *   `Iso > Lens | Prism > Optional`. Composing a weaker optic with any other
 *   produces the weaker kind.
 *
 * **Common tasks**
 *
 * - Start a chain → {@link id} (identity iso)
 * - Drill into a struct key → `.key("name")` / `.optionalKey("name")`
 * - Drill into a key that may not exist → `.at("name")`
 * - Narrow a tagged union → `.tag("MyVariant")`
 * - Narrow by type guard → `.refine(guard)`
 * - Add validation → `.check(Schema.isGreaterThan(0))`
 * - Filter out `undefined` → `.notUndefined()`
 * - Pick/omit struct keys → `.pick(["a","b"])` / `.omit(["c"])`
 * - Traverse array elements → `.forEach(el => el.key("field"))`
 * - Build an iso → {@link makeIso}
 * - Build a lens → {@link makeLens}
 * - Build a prism → {@link makePrism}, {@link fromChecks}
 * - Build an optional → {@link makeOptional}
 * - Focus into `Option.Some` → {@link some}
 * - Focus into `Result.Success`/`Failure` → {@link success}, {@link failure}
 * - Convert record ↔ entries → {@link entries}
 * - Extract all traversal elements → {@link getAll}
 *
 * **Gotchas**
 *
 * - Updates are structurally persistent: only nodes on the path are cloned.
 *   Unrelated branches keep referential identity. However, **no-op updates
 *   may still allocate** a new root — do not rely on reference identity to
 *   detect no-ops.
 * - `replace` silently returns the original `S` when the optic cannot focus
 *   (e.g. wrong tag). Use `replaceResult` for explicit failure.
 * - `modify` also returns the original `S` on focus failure — it never throws.
 * - `.key()` and `.optionalKey()` do not work on union types (compile error).
 * - Only plain objects (`Object.prototype` or `null` prototype) and arrays can
 *   be cloned. Class instances cause a runtime error on `replace`/`modify`.
 *
 * **Quickstart**
 *
 * **Example** (reading and updating nested state)
 *
 * ```ts
 * import { Optic } from "effect"
 *
 * type State = { user: { name: string; age: number } }
 *
 * const _age = Optic.id<State>().key("user").key("age")
 *
 * const s1: State = { user: { name: "Alice", age: 30 } }
 *
 * // Read
 * console.log(_age.get(s1))
 * // Output: 30
 *
 * // Update immutably
 * const s2 = _age.replace(31, s1)
 * console.log(s2)
 * // Output: { user: { name: "Alice", age: 31 } }
 *
 * // Modify with a function
 * const s3 = _age.modify((n) => n + 1)(s1)
 * console.log(s3)
 * // Output: { user: { name: "Alice", age: 31 } }
 *
 * // Referential identity is preserved for unrelated branches
 * console.log(s2.user !== s1.user)
 * // Output: true (on the path)
 * ```
 *
 * **See also**
 *
 * - {@link id} — entry point for optic chains
 * - {@link Lens} / {@link Prism} / {@link Optional} — core optic types
 * - {@link Traversal} / {@link getAll} — multi-focus optics
 * - {@link some} / {@link success} / {@link failure} — built-in prisms
 *
 * @since 4.0.0
 * @module
 */
import { format } from "./Formatter.js";
import { identity, memoize } from "./Function.js";
import * as Option from "./Option.js";
import * as Predicate from "./Predicate.js";
import * as Result from "./Result.js";
import * as AST from "./SchemaAST.js";
import * as Struct from "./Struct.js";
/**
 * Creates an {@link Iso} from a pair of conversion functions.
 *
 * When to use:
 * - You have two pure functions that form a lossless round-trip between `S`
 *   and `A`.
 *
 * Behavior:
 * - Does not mutate inputs.
 * - The returned optic can be composed with any other optic.
 *
 * **Example** (wrapping/unwrapping a branded type)
 *
 * ```ts
 * import { Optic } from "effect"
 *
 * type Meters = { readonly value: number }
 * const meters = Optic.makeIso<Meters, number>(
 *   (m) => m.value,
 *   (n) => ({ value: n })
 * )
 *
 * console.log(meters.get({ value: 100 }))
 * // Output: 100
 *
 * console.log(meters.set(42))
 * // Output: { value: 42 }
 * ```
 *
 * @see {@link Iso} — the type this function returns
 * @see {@link id} — identity iso (no conversion)
 *
 * @category Constructors
 * @since 4.0.0
 */
export function makeIso(get, set) {
  return make(new IsoNode(get, set));
}
/**
 * Creates a {@link Lens} from a getter and a replacer.
 *
 * When to use:
 * - You can always extract `A` from `S` and produce a new `S` by
 *   substituting a new `A`.
 *
 * Behavior:
 * - Does not mutate inputs.
 * - `replace(a, s)` should return a structurally new `S` with `a` in place
 *   of the old focus.
 *
 * **Example** (lens into the first element of a pair)
 *
 * ```ts
 * import { Optic } from "effect"
 *
 * const _first = Optic.makeLens<readonly [string, number], string>(
 *   (pair) => pair[0],
 *   (s, pair) => [s, pair[1]]
 * )
 *
 * console.log(_first.get(["hello", 42]))
 * // Output: "hello"
 *
 * console.log(_first.replace("world", ["hello", 42]))
 * // Output: ["world", 42]
 * ```
 *
 * @see {@link Lens} — the type this function returns
 * @see {@link makeIso} — when no original `S` is needed for `set`
 *
 * @category Constructors
 * @since 4.0.0
 */
export function makeLens(get, replace) {
  return make(new LensNode(get, replace));
}
/**
 * Creates a {@link Prism} from a fallible getter and an infallible setter.
 *
 * When to use:
 * - Reading can fail (the part may not exist in `S`), but building `S`
 *   from `A` always succeeds.
 *
 * Behavior:
 * - Does not mutate inputs.
 * - `getResult` should return `Result.fail(message)` on mismatch.
 *
 * **Example** (parsing a string to a number)
 *
 * ```ts
 * import { Optic, Result } from "effect"
 *
 * const numeric = Optic.makePrism<string, number>(
 *   (s) => {
 *     const n = Number(s)
 *     return Number.isNaN(n) ? Result.fail("not a number") : Result.succeed(n)
 *   },
 *   String
 * )
 *
 * console.log(Result.isSuccess(numeric.getResult("42")))
 * // Output: true
 *
 * console.log(numeric.set(42))
 * // Output: "42"
 * ```
 *
 * @see {@link Prism} — the type this function returns
 * @see {@link fromChecks} — build from `Schema` checks instead
 *
 * @category Constructors
 * @since 4.0.0
 */
export function makePrism(getResult, set) {
  return make(new PrismNode(getResult, set));
}
/**
 * Creates a {@link Prism} from one or more `Schema` validation checks.
 *
 * When to use:
 * - You want to narrow `T` to the subset that passes certain validation
 *   rules (e.g. positive integer).
 * - You already have `Schema.isGreaterThan`, `Schema.isInt`, etc.
 *
 * Behavior:
 * - `getResult` runs all checks; fails with a combined error message when
 *   any check fails.
 * - `set` is identity — the value passes through unchanged.
 * - Does not mutate inputs.
 *
 * **Example** (positive integer prism)
 *
 * ```ts
 * import { Optic, Result, Schema } from "effect"
 *
 * const posInt = Optic.fromChecks<number>(
 *   Schema.isGreaterThan(0),
 *   Schema.isInt()
 * )
 *
 * console.log(Result.isSuccess(posInt.getResult(3)))
 * // Output: true
 *
 * console.log(Result.isFailure(posInt.getResult(-1)))
 * // Output: true
 * ```
 *
 * @see {@link makePrism} — constructor with custom getter/setter
 * @see {@link Prism} — the type this function returns
 *
 * @category Constructors
 * @since 4.0.0
 */
export function fromChecks(...checks) {
  return make(new CheckNode(checks));
}
class IdentityNode {
  _tag = "IdentityNode";
}
const identityNode = /*#__PURE__*/new IdentityNode();
class CompositionNode {
  _tag = "CompositionNode";
  nodes;
  constructor(nodes) {
    this.nodes = nodes;
  }
}
class IsoNode {
  _tag = "IsoNode";
  get;
  set;
  constructor(get, set) {
    this.get = get;
    this.set = set;
  }
}
class LensNode {
  _tag = "LensNode";
  get;
  set;
  constructor(get, set) {
    this.get = get;
    this.set = set;
  }
}
class PrismNode {
  _tag = "PrismNode";
  get;
  set;
  constructor(get, set) {
    this.get = get;
    this.set = set;
  }
}
class OptionalNode {
  _tag = "OptionalNode";
  get;
  set;
  constructor(get, set) {
    this.get = get;
    this.set = set;
  }
}
class PathNode {
  _tag = "PathNode";
  path;
  constructor(path) {
    this.path = path;
  }
}
class CheckNode {
  _tag = "CheckNode";
  checks;
  constructor(checks) {
    this.checks = checks;
  }
}
// Fuse with tail when possible, else push.
function pushNormalized(acc, node) {
  const last = acc[acc.length - 1];
  if (last) {
    if (last._tag === "PathNode" && node._tag === "PathNode") {
      // fuse Path
      acc[acc.length - 1] = new PathNode([...last.path, ...node.path]);
      return;
    }
    if (last._tag === "CheckNode" && node._tag === "CheckNode") {
      // fuse Checks
      acc[acc.length - 1] = new CheckNode([...last.checks, ...node.checks]);
      return;
    }
  }
  acc.push(node);
}
// Collect nodes from a node into `acc`, flattening & normalizing on the fly.
function collect(node, acc) {
  if (node._tag === "IdentityNode") return;
  if (node._tag === "CompositionNode") {
    // flatten without extra arrays
    for (let i = 0; i < node.nodes.length; i++) collect(node.nodes[i], acc);
    return;
  }
  // primitive node
  pushNormalized(acc, node);
}
function compose(a, b) {
  const nodes = [];
  collect(a, nodes);
  collect(b, nodes);
  switch (nodes.length) {
    case 0:
      return identityNode;
    case 1:
      return nodes[0];
    default:
      return new CompositionNode(nodes);
  }
}
/**
 * Creates an {@link Optional} from a fallible getter and a fallible setter.
 *
 * When to use:
 * - Both reading and writing can fail.
 *
 * Behavior:
 * - Does not mutate inputs.
 * - `getResult` should return `Result.fail(message)` on mismatch.
 * - `set` should return `Result.fail(message)` when the update cannot be
 *   applied.
 *
 * **Example** (safe record key access)
 *
 * ```ts
 * import { Optic, Result } from "effect"
 *
 * const atKey = (key: string) =>
 *   Optic.makeOptional<Record<string, number>, number>(
 *     (s) =>
 *       Object.hasOwn(s, key)
 *         ? Result.succeed(s[key])
 *         : Result.fail(`Key "${key}" not found`),
 *     (a, s) =>
 *       Object.hasOwn(s, key)
 *         ? Result.succeed({ ...s, [key]: a })
 *         : Result.fail(`Key "${key}" not found`)
 *   )
 *
 * console.log(Result.isSuccess(atKey("x").getResult({ x: 1 })))
 * // Output: true
 * ```
 *
 * @see {@link Optional} — the type this function returns
 * @see {@link makeLens} — when reading always succeeds
 * @see {@link makePrism} — when writing always succeeds
 *
 * @category Constructors
 * @since 4.0.0
 */
export function makeOptional(getResult, set) {
  return make(new OptionalNode(getResult, set));
}
class OptionalImpl {
  node;
  getResult;
  replaceResult;
  constructor(node, getResult, replaceResult) {
    this.node = node;
    this.getResult = getResult;
    this.replaceResult = replaceResult;
  }
  replace(a, s) {
    return Result.getOrElse(this.replaceResult(a, s), () => s);
  }
  modify(f) {
    return s => Result.getOrElse(Result.flatMap(this.getResult(s), a => this.replaceResult(f(a), s)), () => s);
  }
  compose(that) {
    return make(compose(this.node, that.node));
  }
  key(key) {
    return make(compose(this.node, new PathNode([key])));
  }
  optionalKey(key) {
    return make(compose(this.node, new LensNode(s => s[key], (a, s) => {
      const copy = cloneShallow(s);
      if (a === undefined) {
        if (Array.isArray(copy) && typeof key === "number") {
          copy.splice(key, 1);
        } else {
          delete copy[key];
        }
      } else {
        copy[key] = a;
      }
      return copy;
    })));
  }
  check(...checks) {
    return make(compose(this.node, new CheckNode(checks)));
  }
  refine(refinement, annotations) {
    return make(compose(this.node, new CheckNode([AST.makeFilterByGuard(refinement, annotations)])));
  }
  tag(tag) {
    return make(compose(this.node, new PrismNode(s => s._tag === tag ? Result.succeed(s) : Result.fail(`Expected ${format(tag)} tag, got ${format(s._tag)}`), identity)));
  }
  at(key, ..._rest) {
    const err = Result.fail(`Key ${format(key)} not found`);
    return make(compose(this.node, new OptionalNode(s => Object.hasOwn(s, key) ? Result.succeed(s[key]) : err, (a, s) => {
      if (Object.hasOwn(s, key)) {
        const copy = cloneShallow(s);
        copy[key] = a;
        return Result.succeed(copy);
      } else {
        return err;
      }
    })));
  }
  pick(keys) {
    return this.compose(makeLens(Struct.pick(keys), (p, a) => ({
      ...a,
      ...p
    })));
  }
  omit(keys) {
    return this.compose(makeLens(Struct.omit(keys), (o, a) => ({
      ...a,
      ...o
    })));
  }
  notUndefined() {
    return this.refine(Predicate.isNotUndefined, {
      expected: "a value other than `undefined`"
    });
  }
  forEach(f) {
    const inner = f(id());
    return makeOptional(
    // GET: collect focused Bs
    s => Result.map(this.getResult(s), as => {
      const bs = [];
      for (let i = 0; i < as.length; i++) {
        const r = inner.getResult(as[i]);
        if (Result.isSuccess(r)) bs.push(r.success);
      }
      return bs;
    }),
    // SET: bs must match the number of focusable elements
    (bs, s) => Result.flatMap(this.getResult(s), as => {
      // 1) collect focusable indices
      const idxs = [];
      for (let i = 0; i < as.length; i++) {
        if (Result.isSuccess(inner.getResult(as[i]))) idxs.push(i);
      }
      // 2) arity check
      if (bs.length !== idxs.length) {
        return Result.fail(`each: replacement length mismatch: ${bs.length} !== ${idxs.length}`);
      }
      // 3) update those indices
      const out = as.slice();
      for (let k = 0; k < idxs.length; k++) {
        const i = idxs[k];
        const r = inner.replaceResult(bs[k], as[i]);
        if (Result.isFailure(r)) {
          return Result.fail(`each: could not set element ${i}`);
        }
        out[i] = r.success;
      }
      return this.replaceResult(out, s);
    }));
  }
  modifyAll(f) {
    return s => Result.getOrElse(Result.flatMap(this.getResult(s), as => this.replaceResult(as.map(f), s)), () => s);
  }
}
class IsoImpl extends OptionalImpl {
  get;
  set;
  constructor(node, get, set) {
    super(node, s => Result.succeed(get(s)), a => Result.succeed(set(a)));
    this.get = get;
    this.set = set;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return s => this.set(f(this.get(s)));
  }
}
class LensImpl extends OptionalImpl {
  get;
  constructor(node, get, replace) {
    super(node, s => Result.succeed(get(s)), (a, s) => Result.succeed(replace(a, s)));
    this.get = get;
    this.replace = replace;
  }
  modify(f) {
    return s => this.replace(f(this.get(s)), s);
  }
}
class PrismImpl extends OptionalImpl {
  set;
  constructor(node, getResult, set) {
    super(node, getResult, (a, _) => Result.succeed(set(a)));
    this.set = set;
  }
  replace(a, _) {
    return this.set(a);
  }
  modify(f) {
    return s => Result.getOrElse(Result.map(this.getResult(s), a => this.set(f(a))), () => s);
  }
}
function make(node) {
  const op = recur(node);
  switch (op._tag) {
    case "IsoNode":
      return new IsoImpl(node, op.get, op.set);
    case "LensNode":
      return new LensImpl(node, op.get, op.set);
    case "PrismNode":
      return new PrismImpl(node, op.get, op.set);
    case "OptionalNode":
      return new OptionalImpl(node, op.get, op.set);
  }
}
function cloneShallow(pojo) {
  if (Array.isArray(pojo)) return pojo.slice();
  if (typeof pojo === "object" && pojo !== null) {
    const proto = Object.getPrototypeOf(pojo);
    if (proto !== Object.prototype && proto !== null) {
      throw new Error("Cannot clone object with non-Object constructor or null prototype");
    }
    return {
      ...pojo
    };
  }
  return pojo;
}
const recur = /*#__PURE__*/memoize(node => {
  switch (node._tag) {
    case "IdentityNode":
      return {
        _tag: "IsoNode",
        get: identity,
        set: identity
      };
    case "IsoNode":
    case "LensNode":
    case "PrismNode":
    case "OptionalNode":
      return {
        _tag: node._tag,
        get: node.get,
        set: node.set
      };
    case "PathNode":
      {
        return {
          _tag: "LensNode",
          get: s => {
            const path = node.path;
            let out = s;
            for (let i = 0, n = path.length; i < n; i++) {
              out = out[path[i]];
            }
            return out;
          },
          set: (a, s) => {
            const path = node.path;
            const out = cloneShallow(s);
            let current = out;
            let i = 0;
            for (; i < path.length - 1; i++) {
              const key = path[i];
              current[key] = cloneShallow(current[key]);
              current = current[key];
            }
            const finalKey = path[i];
            current[finalKey] = a;
            return out;
          }
        };
      }
    case "CheckNode":
      return {
        _tag: "PrismNode",
        get: s => Result.mapError(AST.runChecks(node.checks, s), String),
        set: identity
      };
    case "CompositionNode":
      {
        const ops = node.nodes.map(recur);
        const _tag = ops.reduce((tag, op) => getCompositionTag(tag, op._tag), "IsoNode");
        return {
          _tag,
          get: s => {
            for (let i = 0; i < ops.length; i++) {
              const op = ops[i];
              const result = op.get(s);
              if (hasFailingGet(op._tag)) {
                if (Result.isFailure(result)) {
                  return result;
                }
                s = result.success;
              } else {
                s = result;
              }
            }
            return hasFailingGet(_tag) ? Result.succeed(s) : s;
          },
          set: (a, s) => {
            const source = s;
            const len = ops.length;
            const ss = new Array(len + 1);
            ss[0] = s;
            for (let i = 0; i < len; i++) {
              const op = ops[i];
              if (hasFailingGet(op._tag)) {
                const result = op.get(s);
                if (Result.isFailure(result)) {
                  return _tag === "OptionalNode" ? result : source;
                }
                s = result.success;
              } else {
                s = op.get(s);
              }
              ss[i + 1] = s;
            }
            for (let i = len - 1; i >= 0; i--) {
              const op = ops[i];
              if (hasSet(op._tag)) {
                a = op.set(a);
              } else if (op._tag === "LensNode") {
                a = op.set(a, ss[i]);
              } else {
                const result = op.set(a, ss[i]);
                if (Result.isFailure(result)) {
                  return result;
                }
                a = result.success;
              }
            }
            return _tag === "OptionalNode" ? Result.succeed(a) : a;
          }
        };
      }
  }
});
function hasFailingGet(tag) {
  return tag === "PrismNode" || tag === "OptionalNode";
}
function hasSet(tag) {
  return tag === "IsoNode" || tag === "PrismNode";
}
function getCompositionTag(a, b) {
  switch (a) {
    case "IsoNode":
      return b;
    case "LensNode":
      return hasFailingGet(b) ? "OptionalNode" : "LensNode";
    case "PrismNode":
      return hasSet(b) ? "PrismNode" : "OptionalNode";
    case "OptionalNode":
      return "OptionalNode";
  }
}
// ---------------------------------------------
// Derived APIs
// ---------------------------------------------
/**
 * Returns a function that extracts all elements focused by a
 * {@link Traversal} as a plain mutable array.
 *
 * When to use:
 * - You need the focused values as a simple `Array<A>` for further
 *   processing.
 *
 * Behavior:
 * - Returns an empty array when the traversal cannot focus.
 * - Always returns a fresh array (safe to mutate).
 * - Does not mutate the source.
 *
 * **Example** (collecting positive numbers)
 *
 * ```ts
 * import { Optic, Schema } from "effect"
 *
 * type S = { readonly values: ReadonlyArray<number> }
 *
 * const _pos = Optic.id<S>()
 *   .key("values")
 *   .forEach((n) => n.check(Schema.isGreaterThan(0)))
 *
 * const getPositive = Optic.getAll(_pos)
 *
 * console.log(getPositive({ values: [3, -1, 5] }))
 * // Output: [3, 5]
 *
 * console.log(getPositive({ values: [-1, -2] }))
 * // Output: []
 * ```
 *
 * @see {@link Traversal} — the optic type this operates on
 *
 * @category Traversal
 * @since 4.0.0
 */
export function getAll(traversal) {
  return s => Result.match(traversal.getResult(s), {
    onFailure: () => [],
    onSuccess: as => [...as]
  });
}
// ---------------------------------------------
// Built-in Optics
// ---------------------------------------------
const identityIso = /*#__PURE__*/make(identityNode);
/**
 * The identity {@link Iso}. Focuses on the whole value unchanged.
 *
 * When to use:
 * - As the starting point of an optic chain: `Optic.id<S>().key("x")...`
 * - Anywhere an `Iso<S, S>` is needed.
 *
 * Behavior:
 * - `get(s)` returns `s`.
 * - `set(a)` returns `a`.
 * - Singleton — every call returns the same instance.
 *
 * **Example** (starting an optic chain)
 *
 * ```ts
 * import { Optic } from "effect"
 *
 * type S = { readonly x: number }
 *
 * const _x = Optic.id<S>().key("x")
 *
 * console.log(_x.get({ x: 42 }))
 * // Output: 42
 * ```
 *
 * @see {@link Iso} — the type this function returns
 *
 * @category Iso
 * @since 4.0.0
 */
export function id() {
  return identityIso;
}
/**
 * An {@link Iso} that converts a `Record<string, A>` to an array of
 * `[key, value]` entries and back.
 *
 * When to use:
 * - You want to traverse or manipulate record entries as an array (e.g.
 *   with `.forEach()`).
 *
 * Behavior:
 * - `get` uses `Object.entries`.
 * - `set` uses `Object.fromEntries`.
 * - Round-trip is lossless for `Record<string, A>`.
 *
 * **Example** (traversing record values)
 *
 * ```ts
 * import { Optic, Schema } from "effect"
 *
 * const _positiveValues = Optic.entries<number>()
 *   .forEach((entry) => entry.key(1).check(Schema.isGreaterThan(0)))
 *
 * const inc = _positiveValues.modifyAll((n) => n + 1)
 *
 * console.log(inc({ a: 0, b: 3, c: -1 }))
 * // Output: { a: 0, b: 4, c: -1 }
 * ```
 *
 * @see {@link Iso} — the type this function returns
 * @see {@link id} — identity iso
 *
 * @category Iso
 * @since 4.0.0
 */
export function entries() {
  return make(new IsoNode(Object.entries, Object.fromEntries));
}
/**
 * A {@link Prism} that focuses on the value inside `Option.Some`.
 *
 * When to use:
 * - You have an `Option<A>` and want to read/update the inner value only
 *   when it is `Some`.
 *
 * Behavior:
 * - `getResult` fails with an error message when the option is `None`.
 * - `set(a)` wraps `a` in `Option.some(a)`.
 *
 * **Example** (accessing Some value)
 *
 * ```ts
 * import { Optic, Option, Result } from "effect"
 *
 * const _some = Optic.id<Option.Option<number>>().compose(Optic.some())
 *
 * console.log(Result.isSuccess(_some.getResult(Option.some(42))))
 * // Output: true
 *
 * console.log(Result.isFailure(_some.getResult(Option.none())))
 * // Output: true
 *
 * console.log(_some.set(10))
 * // Output: { _tag: "Some", value: 10 }
 * ```
 *
 * @see {@link none} — focuses on `None` instead
 * @see {@link Prism} — the type this function returns
 *
 * @category Prism
 * @since 4.0.0
 */
export function some() {
  const run = runRefinement(Option.isSome, {
    expected: "a Some value"
  });
  return makePrism(s => Result.mapBoth(run(s), {
    onFailure: String,
    onSuccess: s => s.value
  }), Option.some);
}
/**
 * A {@link Prism} that focuses on `Option.None`, exposing `undefined`.
 *
 * When to use:
 * - You want to match or construct `None` values within an optic chain.
 *
 * Behavior:
 * - `getResult` succeeds with `undefined` when the option is `None`.
 * - `getResult` fails when the option is `Some`.
 * - `set(undefined)` produces `Option.none()`.
 *
 * **Example** (matching None)
 *
 * ```ts
 * import { Optic, Option, Result } from "effect"
 *
 * const _none = Optic.id<Option.Option<number>>().compose(Optic.none())
 *
 * console.log(Result.isSuccess(_none.getResult(Option.none())))
 * // Output: true
 *
 * console.log(Result.isFailure(_none.getResult(Option.some(1))))
 * // Output: true
 * ```
 *
 * @see {@link some} — focuses on `Some` instead
 * @see {@link Prism} — the type this function returns
 *
 * @category Prism
 * @since 4.0.0
 */
export function none() {
  const run = runRefinement(Option.isNone, {
    expected: "a None value"
  });
  return makePrism(s => Result.mapBoth(run(s), {
    onFailure: String,
    onSuccess: () => undefined
  }), () => Option.none());
}
/**
 * A {@link Prism} that focuses on the success value of a `Result`.
 *
 * When to use:
 * - You have a `Result<A, E>` and want to read/update `A` only when it
 *   is a `Success`.
 *
 * Behavior:
 * - `getResult` fails when the result is a `Failure`.
 * - `set(a)` produces `Result.succeed(a)`.
 *
 * **Example** (accessing success)
 *
 * ```ts
 * import { Optic, Result } from "effect"
 *
 * const _ok = Optic.id<Result.Result<number, string>>().compose(Optic.success())
 *
 * console.log(Result.isSuccess(_ok.getResult(Result.succeed(42))))
 * // Output: true
 *
 * console.log(Result.isFailure(_ok.getResult(Result.fail("err"))))
 * // Output: true
 * ```
 *
 * @see {@link failure} — focuses on the failure side
 * @see {@link Prism} — the type this function returns
 *
 * @category Prism
 * @since 4.0.0
 */
export function success() {
  const run = runRefinement(Result.isSuccess, {
    expected: "a Result.Success value"
  });
  return makePrism(s => Result.mapBoth(run(s), {
    onFailure: String,
    onSuccess: s => s.success
  }), Result.succeed);
}
/**
 * A {@link Prism} that focuses on the failure value of a `Result`.
 *
 * When to use:
 * - You have a `Result<A, E>` and want to read/update `E` only when it
 *   is a `Failure`.
 *
 * Behavior:
 * - `getResult` fails when the result is a `Success`.
 * - `set(e)` produces `Result.fail(e)`.
 *
 * **Example** (accessing failure)
 *
 * ```ts
 * import { Optic, Result } from "effect"
 *
 * const _err = Optic.id<Result.Result<number, string>>().compose(Optic.failure())
 *
 * console.log(Result.isSuccess(_err.getResult(Result.fail("oops"))))
 * // Output: true
 *
 * console.log(Result.isFailure(_err.getResult(Result.succeed(42))))
 * // Output: true
 * ```
 *
 * @see {@link success} — focuses on the success side
 * @see {@link Prism} — the type this function returns
 *
 * @category Prism
 * @since 4.0.0
 */
export function failure() {
  const run = runRefinement(Result.isFailure, {
    expected: "a Result.Failure value"
  });
  return makePrism(s => Result.mapBoth(run(s), {
    onFailure: String,
    onSuccess: s => s.failure
  }), Result.fail);
}
function runRefinement(refinement, annotations) {
  return e => AST.runChecks([AST.makeFilterByGuard(refinement, annotations)], e);
}
//# sourceMappingURL=Optic.js.map