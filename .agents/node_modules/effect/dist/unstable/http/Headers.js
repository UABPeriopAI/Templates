/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Equal from "../../Equal.js";
import * as Equ from "../../Equivalence.js";
import { dual } from "../../Function.js";
import * as Hash from "../../Hash.js";
import * as Inspectable from "../../Inspectable.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Record from "../../Record.js";
import * as Redactable from "../../Redactable.js";
import * as Redacted from "../../Redacted.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
/**
 * This is a symbol to allow direct access of keys without conflicts.
 *
 * @since 4.0.0
 * @category type ids
 */
export const TypeId = /*#__PURE__*/Symbol.for("~effect/http/Headers");
/**
 * @since 4.0.0
 * @category refinements
 */
export const isHeaders = u => Predicate.hasProperty(u, TypeId);
const Proto = /*#__PURE__*/Object.create(null);
Object.defineProperties(Proto, {
  [TypeId]: {
    value: TypeId
  },
  [Redactable.symbolRedactable]: {
    value(context) {
      return redact(this, Context.get(context, CurrentRedactedNames));
    }
  },
  toJSON: {
    value() {
      return Redactable.redact(this);
    }
  },
  [Equal.symbol]: {
    value(that) {
      return Equivalence(this, that);
    }
  },
  [Hash.symbol]: {
    value() {
      return Hash.structure(this);
    }
  },
  toString: {
    value: Inspectable.BaseProto.toString
  },
  [Inspectable.NodeInspectSymbol]: {
    value: Inspectable.BaseProto[Inspectable.NodeInspectSymbol]
  }
});
const make = input => Object.assign(Object.create(Proto), input);
/**
 * @since 4.0.0
 * @category Equivalence
 */
export const Equivalence = /*#__PURE__*/Record.makeEquivalence(/*#__PURE__*/Equ.strictEqual());
/**
 * @since 4.0.0
 * @category schemas
 */
export const HeadersSchema = /*#__PURE__*/Schema.declare(isHeaders, {
  typeConstructor: {
    _tag: "effect/http/Headers"
  },
  generation: {
    runtime: `Headers.HeadersSchema`,
    Type: `Headers.Headers`,
    Encoded: `typeof Headers.HeadersSchema["Encoded"]`,
    importDeclaration: `import * as Headers from "effect/unstable/http/Headers"`
  },
  expected: "Headers",
  toEquivalence: () => Equivalence,
  toCodec: () => Schema.link()(Schema.Record(Schema.String, Schema.String), Transformation.transform({
    decode: input => fromInput(input),
    encode: headers => ({
      ...headers
    })
  }))
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/Object.create(Proto);
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromInput = input => {
  if (input === undefined) {
    return empty;
  } else if (Symbol.iterator in input) {
    const out = Object.create(Proto);
    for (const [k, v] of input) {
      out[k.toLowerCase()] = v;
    }
    return out;
  }
  const out = Object.create(Proto);
  for (const [k, v] of Object.entries(input)) {
    if (Array.isArray(v)) {
      out[k.toLowerCase()] = v.join(", ");
    } else if (v !== undefined) {
      out[k.toLowerCase()] = v;
    }
  }
  return out;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromRecordUnsafe = input => Object.setPrototypeOf(input, Proto);
/**
 * @since 4.0.0
 * @category combinators
 */
export const has = /*#__PURE__*/dual(2, (self, key) => key.toLowerCase() in self);
/**
 * @since 4.0.0
 * @category combinators
 */
export const get = /*#__PURE__*/dual(2, (self, key) => Option.fromUndefinedOr(self[key.toLowerCase()]));
/**
 * @since 4.0.0
 * @category combinators
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => {
  const out = make(self);
  out[key.toLowerCase()] = value;
  return out;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const setAll = /*#__PURE__*/dual(2, (self, headers) => make({
  ...self,
  ...fromInput(headers)
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const merge = /*#__PURE__*/dual(2, (self, headers) => {
  const out = make(self);
  Object.assign(out, headers);
  return out;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const remove = /*#__PURE__*/dual(2, (self, key) => {
  const out = make(self);
  delete out[key.toLowerCase()];
  return out;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const removeMany = /*#__PURE__*/dual(2, (self, keys) => {
  const out = make(self);
  for (const key of keys) {
    delete out[key.toLowerCase()];
  }
  return out;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const redact = /*#__PURE__*/dual(2, (self, key) => {
  const out = {
    ...self
  };
  const modify = key => {
    if (typeof key === "string") {
      const k = key.toLowerCase();
      if (k in self) {
        out[k] = Redacted.make(self[k]);
      }
    } else {
      for (const name in self) {
        if (key.test(name)) {
          out[name] = Redacted.make(self[name]);
        }
      }
    }
  };
  if (Array.isArray(key)) {
    for (let i = 0; i < key.length; i++) {
      modify(key[i]);
    }
  } else {
    modify(key);
  }
  return out;
});
/**
 * @since 4.0.0
 * @category fiber refs
 */
export const CurrentRedactedNames = /*#__PURE__*/Context.Reference("effect/Headers/CurrentRedactedNames", {
  defaultValue: () => ["authorization", "cookie", "set-cookie", "x-api-key"]
});
//# sourceMappingURL=Headers.js.map