/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Equal from "../../Equal.js";
import * as Equ from "../../Equivalence.js";
import { dual } from "../../Function.js";
import * as Hash from "../../Hash.js";
import { PipeInspectableProto } from "../../internal/core.js";
import * as Option from "../../Option.js";
import { hasProperty } from "../../Predicate.js";
import * as Result from "../../Result.js";
import * as Schema from "../../Schema.js";
import * as Issue from "../../SchemaIssue.js";
import * as Transformation from "../../SchemaTransformation.js";
import * as Tuple from "../../Tuple.js";
const TypeId = "~effect/http/UrlParams";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isUrlParams = u => hasProperty(u, TypeId);
const Proto = {
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  [Symbol.iterator]() {
    return this.params[Symbol.iterator]();
  },
  toJSON() {
    return {
      _id: "UrlParams",
      params: Object.fromEntries(this.params)
    };
  },
  [Equal.symbol](that) {
    return Equivalence(this, that);
  },
  [Hash.symbol]() {
    return Hash.array(this.params.flat());
  }
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = params => {
  const self = Object.create(Proto);
  self.params = params;
  return self;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const fromInput = input => {
  const parsed = fromInputNested(input);
  const out = [];
  for (let i = 0; i < parsed.length; i++) {
    if (Array.isArray(parsed[i][0])) {
      const [keys, value] = parsed[i];
      out.push([`${keys[0]}[${keys.slice(1).join("][")}]`, value]);
    } else {
      out.push(parsed[i]);
    }
  }
  return make(out);
};
const fromInputNested = input => {
  const entries = typeof input[Symbol.iterator] === "function" ? Arr.fromIterable(input) : Object.entries(input);
  const out = [];
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== undefined) {
          out.push([key, String(value[i])]);
        }
      }
    } else if (typeof value === "object") {
      const nested = fromInputNested(value);
      for (const [k, v] of nested) {
        out.push([[key, ...(typeof k === "string" ? [k] : k)], v]);
      }
    } else if (value !== undefined) {
      out.push([key, String(value)]);
    }
  }
  return out;
};
/**
 * @since 4.0.0
 * @category Equivalence
 */
export const Equivalence = /*#__PURE__*/Equ.make((a, b) => arrayEquivalence(a.params, b.params));
const arrayEquivalence = /*#__PURE__*/Arr.makeEquivalence(/*#__PURE__*/Tuple.makeEquivalence([/*#__PURE__*/Equ.strictEqual(), /*#__PURE__*/Equ.strictEqual()]));
/**
 * @since 4.0.0
 * @category schemas
 */
export const UrlParamsSchema = /*#__PURE__*/Schema.declare(isUrlParams, {
  typeConstructor: {
    _tag: "effect/http/UrlParams"
  },
  generation: {
    runtime: `UrlParams.UrlParamsSchema`,
    Type: `UrlParams.UrlParams`,
    Encoded: `typeof UrlParams.UrlParamsSchema["Encoded"]`,
    importDeclaration: `import * as UrlParams from "effect/unstable/http/UrlParams"`
  },
  expected: "UrlParams",
  toEquivalence: () => Equivalence,
  toCodec: () => Schema.link()(Schema.Array(Schema.Tuple([Schema.String, Schema.String])), Transformation.transform({
    decode: make,
    encode: self => self.params
  }))
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/make([]);
/**
 * @since 4.0.0
 * @category combinators
 */
export const getAll = /*#__PURE__*/dual(2, (self, key) => Arr.reduce(self.params, [], (acc, [k, value]) => {
  if (k === key) {
    acc.push(value);
  }
  return acc;
}));
/**
 * @since 4.0.0
 * @category combinators
 */
export const getFirst = /*#__PURE__*/dual(2, (self, key) => Arr.findFirst(self.params, ([k]) => k === key).pipe(Option.map(([, value]) => value)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const getLast = /*#__PURE__*/dual(2, (self, key) => Arr.findLast(self.params, ([k]) => k === key).pipe(Option.map(([, value]) => value)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const set = /*#__PURE__*/dual(3, (self, key, value) => make(Arr.append(Arr.filter(self.params, ([k]) => k !== key), [key, String(value)])));
/**
 * @since 4.0.0
 * @category combinators
 */
export const transform = /*#__PURE__*/dual(2, (self, f) => make(f(self.params)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const setAll = /*#__PURE__*/dual(2, (self, input) => {
  const out = fromInput(input);
  const params = out.params;
  const keys = new Set();
  for (let i = 0; i < params.length; i++) {
    keys.add(params[i][0]);
  }
  for (let i = 0; i < self.params.length; i++) {
    if (keys.has(self.params[i][0])) continue;
    params.push(self.params[i]);
  }
  return out;
});
/**
 * @since 4.0.0
 * @category combinators
 */
export const append = /*#__PURE__*/dual(3, (self, key, value) => make(Arr.append(self.params, [key, String(value)])));
/**
 * @since 4.0.0
 * @category combinators
 */
export const appendAll = /*#__PURE__*/dual(2, (self, input) => transform(self, Arr.appendAll(fromInput(input).params)));
/**
 * @since 4.0.0
 * @category combinators
 */
export const remove = /*#__PURE__*/dual(2, (self, key) => transform(self, Arr.filter(([k]) => k !== key)));
/**
 * @since 4.0.0
 * @category Errors
 */
export class UrlParamsError extends /*#__PURE__*/Data.TaggedError("UrlParamsError") {}
/**
 * @since 4.0.0
 * @category conversions
 */
export const makeUrl = (url, params, hash) => {
  try {
    const urlInstance = new URL(url, baseUrl());
    for (let i = 0; i < params.params.length; i++) {
      const [key, value] = params.params[i];
      if (value !== undefined) {
        urlInstance.searchParams.append(key, value);
      }
    }
    if (hash !== undefined) {
      urlInstance.hash = hash;
    }
    return Result.succeed(urlInstance);
  } catch (e) {
    return Result.fail(new UrlParamsError({
      cause: e
    }));
  }
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toString = self => new URLSearchParams(self.params).toString();
const baseUrl = () => {
  if ("location" in globalThis && globalThis.location !== undefined && globalThis.location.origin !== undefined && globalThis.location.pathname !== undefined) {
    return location.origin + location.pathname;
  }
  return undefined;
};
/**
 * Builds a `Record` containing all the key-value pairs in the given `UrlParams`
 * as `string` (if only one value for a key) or a `NonEmptyArray<string>`
 * (when more than one value for a key)
 *
 * **Example**
 *
 * ```ts
 * import { UrlParams } from "effect/unstable/http"
 * import * as assert from "node:assert"
 *
 * const urlParams = UrlParams.fromInput({
 *   a: 1,
 *   b: true,
 *   c: "string",
 *   e: [1, 2, 3]
 * })
 * const result = UrlParams.toRecord(urlParams)
 *
 * assert.deepStrictEqual(
 *   result,
 *   { "a": "1", "b": "true", "c": "string", "e": ["1", "2", "3"] }
 * )
 * ```
 *
 * @since 4.0.0
 * @category conversions
 */
export const toRecord = self => {
  const out = {};
  for (const [k, value] of self.params) {
    const curr = out[k];
    if (curr === undefined) {
      out[k] = value;
    } else if (typeof curr === "string") {
      out[k] = [curr, value];
    } else {
      curr.push(value);
    }
  }
  return out;
};
/**
 * @since 4.0.0
 * @category conversions
 */
export const toReadonlyRecord = toRecord;
/**
 * Extract a JSON value from the first occurrence of the given `field` in the
 * `UrlParams`.
 *
 * ```ts
 * import { Schema } from "effect"
 * import { UrlParams } from "effect/unstable/http"
 *
 * const extractFoo = UrlParams.schemaJsonField("foo").pipe(
 *   Schema.decodeTo(Schema.Struct({
 *     some: Schema.String,
 *     number: Schema.Number
 *   }))
 * )
 *
 * console.log(
 *   Schema.decodeSync(extractFoo)(UrlParams.fromInput({
 *     foo: JSON.stringify({ some: "bar", number: 42 }),
 *     baz: "qux"
 *   }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category Schemas
 */
export const schemaJsonField = field => UrlParamsSchema.pipe(Schema.decodeTo(Schema.UnknownFromJsonString, Transformation.transformOrFail({
  decode: params => Option.match(getFirst(params, field), {
    onNone: () => Effect.fail(new Issue.Pointer([field], new Issue.MissingKey(undefined))),
    onSome: Effect.succeed
  }),
  encode: value => Effect.succeed(make([[field, value]]))
})));
/**
 * Extract schema from all key-value pairs in the given `UrlParams`.
 *
 * **Example**
 *
 * ```ts
 * import { Schema } from "effect"
 * import { UrlParams } from "effect/unstable/http"
 *
 * const toStruct = UrlParams.schemaRecord.pipe(
 *   Schema.decodeTo(Schema.Struct({
 *     some: Schema.String,
 *     number: Schema.FiniteFromString
 *   }))
 * )
 *
 * console.log(
 *   Schema.decodeSync(toStruct)(UrlParams.fromInput({
 *     some: "value",
 *     number: 42
 *   }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category schema
 */
export const schemaRecord = /*#__PURE__*/UrlParamsSchema.pipe(/*#__PURE__*/Schema.decodeTo(/*#__PURE__*/Schema.Record(Schema.String, /*#__PURE__*/Schema.Union([Schema.String, /*#__PURE__*/Schema.NonEmptyArray(Schema.String)])), /*#__PURE__*/Transformation.transform({
  decode: toReadonlyRecord,
  encode: fromInput
})));
//# sourceMappingURL=UrlParams.js.map