import * as PrimaryKey from "../../PrimaryKey.js";
import * as Request from "../../Request.js";
import * as Schema from "../../Schema.js";
/**
 * @since 4.0.0
 * @category Symbols
 */
export const symbol = "~effect/persistence/Persistable";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const Class = () => (tag, options) => {
  function Persistable(props) {
    this._tag = tag;
    if (props) {
      Object.assign(this, props);
    }
  }
  Persistable.prototype = {
    ...Request.RequestPrototype,
    [PrimaryKey.symbol]() {
      return options.primaryKey(this);
    },
    [symbol]: {
      success: options.success ?? Schema.Void,
      error: options.error ?? Schema.Never
    }
  };
  return Persistable;
};
/**
 * @since 4.0.0
 * @category Accessors
 */
export const exitSchema = self => {
  let schema = exitSchemaCache.get(self);
  if (schema) return schema;
  schema = Schema.Exit(self[symbol].success, self[symbol].error, Schema.Defect);
  exitSchemaCache.set(self, schema);
  return schema;
};
const exitSchemaCache = /*#__PURE__*/new WeakMap();
/**
 * @since 4.0.0
 * @category Serialization
 */
export const serializeExit = (self, exit) => {
  const schema = Schema.toCodecJson(exitSchema(self));
  return Schema.encodeEffect(schema)(exit);
};
/**
 * @since 4.0.0
 * @category Serialization
 */
export const deserializeExit = (self, encoded) => {
  const schema = Schema.toCodecJson(exitSchema(self));
  return Schema.decodeUnknownEffect(schema)(encoded);
};
//# sourceMappingURL=Persistable.js.map