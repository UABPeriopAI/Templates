import * as Effect from "../../Effect.js";
import { dual } from "../../Function.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Struct_ from "../../Struct.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/schema/VariantSchema";
const cacheSymbol = /*#__PURE__*/Symbol.for(`${TypeId}/cache`);
/**
 * @since 4.0.0
 * @category guards
 */
export const isStruct = u => Predicate.hasProperty(u, TypeId);
const FieldTypeId = "~effect/schema/VariantSchema/Field";
/**
 * @since 4.0.0
 * @category guards
 */
export const isField = u => Predicate.hasProperty(u, FieldTypeId);
const extract = /*#__PURE__*/dual(args => isStruct(args[0]), (self, variant, options) => {
  const cache = self[cacheSymbol] ?? (self[cacheSymbol] = {});
  const cacheKey = options?.isDefault === true ? "__default" : variant;
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }
  const fields = {};
  for (const key of Object.keys(self[TypeId])) {
    const value = self[TypeId][key];
    if (TypeId in value) {
      if (options?.isDefault === true && Schema.isSchema(value)) {
        fields[key] = value;
      } else {
        fields[key] = extract(value, variant);
      }
    } else if (FieldTypeId in value) {
      if (variant in value.schemas) {
        fields[key] = value.schemas[variant];
      }
    } else {
      fields[key] = value;
    }
  }
  return cache[cacheKey] = Schema.Struct(fields);
});
/**
 * @category accessors
 * @since 4.0.0
 */
export const fields = self => self[TypeId];
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => {
  function Class(identifier) {
    return function (fields, annotations) {
      const variantStruct = Struct(fields);
      const schema = extract(variantStruct, options.defaultVariant, {
        isDefault: true
      });
      const SClass = Schema.Class;
      class Base extends SClass(identifier)(schema.fields, annotations) {
        static [TypeId] = fields;
      }
      for (const variant of options.variants) {
        Object.defineProperty(Base, variant, {
          value: extract(variantStruct, variant).annotate({
            id: `${identifier}.${variant}`,
            title: `${identifier}.${variant}`
          })
        });
      }
      return Base;
    };
  }
  function FieldOnly(keys) {
    return function (schema) {
      const obj = {};
      for (const key of keys) {
        obj[key] = schema;
      }
      return Field(obj);
    };
  }
  function FieldExcept(keys) {
    return function (schema) {
      const obj = {};
      for (const variant of options.variants) {
        if (!keys.includes(variant)) {
          obj[variant] = schema;
        }
      }
      return Field(obj);
    };
  }
  function UnionVariants(members) {
    return Union(members, options.variants);
  }
  const fieldEvolve = dual(2, (self, f) => {
    const field = isField(self) ? self : Field(Object.fromEntries(options.variants.map(variant => [variant, self])));
    return Field(Struct_.evolve(field.schemas, f));
  });
  const extractVariants = dual(2, (self, variant) => extract(self, variant, {
    isDefault: variant === options.defaultVariant
  }));
  return {
    Struct,
    Field,
    FieldOnly,
    FieldExcept,
    Class,
    Union: UnionVariants,
    fieldEvolve,
    // fieldFromKey,
    extract: extractVariants
  };
};
/**
 * @since 4.0.0
 * @category overrideable
 */
export const Override = value => value;
/**
 * @since 4.0.0
 * @category overrideable
 */
export const Overrideable = (schema, options) => schema.pipe(Schema.decodeTo(Schema.brand("Override")(Schema.toType(schema))), Schema.withConstructorDefault(Effect.map(options.defaultValue, Override)));
const StructProto = {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const Struct = fields => {
  const self = Object.create(StructProto);
  self[TypeId] = fields;
  return self;
};
const FieldProto = {
  [FieldTypeId]: FieldTypeId,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
const Field = schemas => {
  const self = Object.create(FieldProto);
  self.schemas = schemas;
  return self;
};
const Union = (members, variants) => {
  const VariantUnion = Schema.Union(members.filter(member => Schema.isSchema(member)));
  for (const variant of variants) {
    Object.defineProperty(VariantUnion, variant, {
      value: Schema.Union(members.map(member => extract(member, variant)))
    });
  }
  return VariantUnion;
};
//# sourceMappingURL=VariantSchema.js.map