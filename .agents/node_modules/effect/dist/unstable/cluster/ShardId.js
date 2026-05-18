/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.js";
import * as Hash from "../../Hash.js";
import { hasProperty } from "../../Predicate.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as S from "../../Schema.js";
import * as Getter from "../../SchemaGetter.js";
const TypeId = "~effect/cluster/ShardId";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isShardId = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category Schema
 */
export const ShardId = /*#__PURE__*/S.declare(isShardId, {
  toCodecJson: () => S.link()(S.Struct({
    group: S.String,
    id: S.Number
  }), {
    decode: Getter.transform(({
      group,
      id
    }) => make(group, id)),
    encode: Getter.passthrough()
  })
});
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = (group, id) => {
  const key = `${group}:${id}`;
  let shardId = shardIdCache.get(key);
  if (!shardId) {
    shardId = makeProto(group, id);
    shardIdCache.set(key, shardId);
  }
  return shardId;
};
const shardIdCache = /*#__PURE__*/new Map();
const makeProto = (group, id) => {
  const self = Object.create(ShardIdProto);
  self.group = group;
  self.id = id;
  return self;
};
const ShardIdProto = {
  [TypeId]: TypeId,
  [Equal.symbol](that) {
    return this.group === that.group && this.id === that.id;
  },
  [Hash.symbol]() {
    return Hash.string(this.toString());
  },
  [PrimaryKey.symbol]() {
    return this.toString();
  },
  toString() {
    return `${this.group}:${this.id}`;
  }
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toString = shardId => {
  return `${shardId.group}:${shardId.id}`;
};
/**
 * @since 4.0.0
 */
export function fromStringEncoded(s) {
  const index = s.lastIndexOf(":");
  if (index === -1) {
    throw new Error(`Invalid ShardId format`);
  }
  const group = s.substring(0, index);
  const id = Number(s.substring(index + 1));
  if (isNaN(id)) {
    throw new Error(`ShardId id must be a number`);
  }
  return {
    group,
    id
  };
}
/**
 * @since 4.0.0
 */
export function fromString(s) {
  const encoded = fromStringEncoded(s);
  return make(encoded.group, encoded.id);
}
//# sourceMappingURL=ShardId.js.map