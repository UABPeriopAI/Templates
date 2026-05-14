/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Encoding from "../../Encoding.js";
import * as FileSystem from "../../FileSystem.js";
import { dual, identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Path from "../../Path.js";
import * as Predicate from "../../Predicate.js";
import * as Result from "../../Result.js";
import * as Schema from "../../Schema.js";
import * as UndefinedOr from "../../UndefinedOr.js";
import * as SqlClient from "../sql/SqlClient.js";
const TypeId = "~effect/persistence/KeyValueStore";
const ErrorTypeId = "~effect/persistence/KeyValueStore/KeyValueStoreError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class KeyValueStoreError extends /*#__PURE__*/Data.TaggedError("KeyValueStoreError") {
  /**
   * @since 4.0.0
   */
  [ErrorTypeId] = ErrorTypeId;
}
/**
 * @since 4.0.0
 * @category tags
 */
export const KeyValueStore = /*#__PURE__*/Context.Service("effect/persistence/KeyValueStore");
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => KeyValueStore.of({
  [TypeId]: TypeId,
  has: key => Effect.map(options.get(key), Predicate.isNotUndefined),
  isEmpty: Effect.map(options.size, size => size === 0),
  modify: (key, f) => Effect.flatMap(options.get(key), o => {
    if (o === undefined) {
      return Effect.undefined;
    }
    const newValue = f(o);
    return Effect.as(options.set(key, newValue), newValue);
  }),
  modifyUint8Array: (key, f) => Effect.flatMap(options.getUint8Array(key), o => {
    if (o === undefined) {
      return Effect.undefined;
    }
    const newValue = f(o);
    return Effect.as(options.set(key, newValue), newValue);
  }),
  ...options
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeStringOnly = options => {
  const encoder = new TextEncoder();
  return make({
    ...options,
    getUint8Array: key => options.get(key).pipe(Effect.map(UndefinedOr.map(value => Result.match(Encoding.decodeBase64(value), {
      onFailure: () => encoder.encode(value),
      onSuccess: identity
    })))),
    set: (key, value) => typeof value === "string" ? options.set(key, value) : Effect.suspend(() => options.set(key, Encoding.encodeBase64(value)))
  });
};
/**
 * @since 4.0.0
 * @category combinators
 */
export const prefix = /*#__PURE__*/dual(2, (self, prefix) => ({
  ...self,
  get: key => self.get(`${prefix}${key}`),
  getUint8Array: key => self.getUint8Array(`${prefix}${key}`),
  set: (key, value) => self.set(`${prefix}${key}`, value),
  remove: key => self.remove(`${prefix}${key}`),
  has: key => self.has(`${prefix}${key}`),
  modify: (key, f) => self.modify(`${prefix}${key}`, f),
  modifyUint8Array: (key, f) => self.modifyUint8Array(`${prefix}${key}`, f)
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerMemory = /*#__PURE__*/Layer.sync(KeyValueStore)(() => {
  const store = new Map();
  const encoder = new TextEncoder();
  return make({
    get: key => Effect.sync(() => {
      const value = store.get(key);
      return value === undefined ? undefined : typeof value === "string" ? value : Encoding.encodeBase64(value);
    }),
    getUint8Array: key => Effect.sync(() => {
      const value = store.get(key);
      return value === undefined ? undefined : typeof value === "string" ? encoder.encode(value) : value;
    }),
    set: (key, value) => Effect.sync(() => store.set(key, value)),
    remove: key => Effect.sync(() => store.delete(key)),
    clear: Effect.sync(() => store.clear()),
    size: Effect.sync(() => store.size)
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerFileSystem = directory => Layer.effect(KeyValueStore)(Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const keyPath = key => path.join(directory, encodeURIComponent(key));
  if (!(yield* fs.exists(directory))) {
    yield* fs.makeDirectory(directory, {
      recursive: true
    });
  }
  return make({
    get: key => Effect.catchTag(fs.readFileString(keyPath(key)), "PlatformError", cause => cause.reason._tag === "NotFound" ? Effect.undefined : Effect.fail(new KeyValueStoreError({
      method: "get",
      key,
      message: `Unable to get item with key ${key}`,
      cause
    }))),
    getUint8Array: key => Effect.catchTag(fs.readFile(keyPath(key)), "PlatformError", cause => cause.reason._tag === "NotFound" ? Effect.undefined : Effect.fail(new KeyValueStoreError({
      method: "getUint8Array",
      key,
      message: `Unable to get item with key ${key}`,
      cause
    }))),
    set: (key, value) => Effect.mapError(typeof value === "string" ? fs.writeFileString(keyPath(key), value) : fs.writeFile(keyPath(key), value), cause => new KeyValueStoreError({
      method: "set",
      key,
      message: `Unable to set item with key ${key}`,
      cause
    })),
    remove: key => Effect.mapError(fs.remove(keyPath(key)), cause => new KeyValueStoreError({
      method: "remove",
      key,
      message: `Unable to remove item with key ${key}`,
      cause
    })),
    has: key => Effect.mapError(fs.exists(keyPath(key)), cause => new KeyValueStoreError({
      method: "has",
      key,
      message: `Unable to check existence of item with key ${key}`,
      cause
    })),
    clear: Effect.mapError(Effect.andThen(fs.remove(directory, {
      recursive: true
    }), fs.makeDirectory(directory, {
      recursive: true
    })), cause => new KeyValueStoreError({
      method: "clear",
      message: `Unable to clear storage`,
      cause
    })),
    size: Effect.matchEffect(fs.readDirectory(directory), {
      onSuccess: files => Effect.succeed(files.length),
      onFailure: cause => Effect.fail(new KeyValueStoreError({
        method: "size",
        message: `Unable to get size`,
        cause
      }))
    })
  });
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerSql = (options = {}) => Layer.effect(KeyValueStore)(Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const table = sql(options.table ?? "effect_key_value_store");
  yield* sql.onDialectOrElse({
    mysql: () => sql`
          CREATE TABLE IF NOT EXISTS ${table} (
            id VARCHAR(191) PRIMARY KEY,
            value BLOB NOT NULL,
            value_type SMALLINT NOT NULL
          )
        `,
    pg: () => sql`
          CREATE TABLE IF NOT EXISTS ${table} (
            id TEXT PRIMARY KEY,
            value BYTEA NOT NULL,
            value_type SMALLINT NOT NULL
          )
        `,
    mssql: () => sql`
          IF NOT EXISTS (SELECT * FROM sysobjects WHERE name=${table} AND xtype='U')
          CREATE TABLE ${table} (
            id NVARCHAR(450) PRIMARY KEY,
            value VARBINARY(MAX) NOT NULL,
            value_type SMALLINT NOT NULL
          )
        `,
    // sqlite
    orElse: () => sql`
          CREATE TABLE IF NOT EXISTS ${table} (
            id TEXT PRIMARY KEY,
            value BLOB NOT NULL,
            value_type INTEGER NOT NULL
          )
        `
  }).pipe(Effect.orDie);
  const upsert = sql.onDialectOrElse({
    pg: () => entry => sql`
          INSERT INTO ${table} (id, value, value_type) VALUES (${entry.id}, ${entry.value}, ${entry.value_type})
          ON CONFLICT (id) DO UPDATE SET value=EXCLUDED.value, value_type=EXCLUDED.value_type
        `.unprepared,
    mysql: () => entry => sql`
          INSERT INTO ${table} (id, value, value_type) VALUES (${entry.id}, ${entry.value}, ${entry.value_type})
          ON DUPLICATE KEY UPDATE value=VALUES(value), value_type=VALUES(value_type)
        `,
    mssql: () => entry => sql`
          MERGE ${table} AS target
          USING (SELECT ${entry.id} AS id, ${entry.value} AS value, ${entry.value_type} AS value_type) AS source
          ON target.id = source.id
          WHEN MATCHED THEN UPDATE SET value = source.value, value_type = source.value_type
          WHEN NOT MATCHED THEN INSERT (id, value, value_type)
          VALUES (source.id, source.value, source.value_type);
        `,
    // sqlite
    orElse: () => entry => sql`
          INSERT INTO ${table} (id, value, value_type) VALUES (${entry.id}, ${entry.value}, ${entry.value_type})
          ON CONFLICT(id) DO UPDATE SET value=excluded.value, value_type=excluded.value_type
        `.unprepared
  });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const ValueTypeString = 0;
  const ValueTypeUint8Array = 1;
  return make({
    get: key => sql`SELECT value, value_type FROM ${table} WHERE id = ${key}`.pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "get",
      key,
      message: `Unable to get item with key ${key}`,
      cause
    })), Effect.flatMap(rows => {
      if (rows.length === 0) {
        return Effect.undefined;
      }
      const row = rows[0];
      switch (row.value_type) {
        case ValueTypeString:
          return Effect.succeed(decoder.decode(row.value));
        case ValueTypeUint8Array:
          return Effect.succeed(Encoding.encodeBase64(row.value));
        default:
          return Effect.fail(new KeyValueStoreError({
            method: "get",
            key,
            message: `Invalid stored value type for key ${key}: ${row.value_type}`
          }));
      }
    })),
    getUint8Array: key => sql`SELECT value, value_type FROM ${table} WHERE id = ${key}`.pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "getUint8Array",
      key,
      message: `Unable to get item with key ${key}`,
      cause
    })), Effect.flatMap(rows => {
      if (rows.length === 0) {
        return Effect.undefined;
      }
      const row = rows[0];
      switch (row.value_type) {
        case ValueTypeString:
          return Effect.succeed(row.value);
        case ValueTypeUint8Array:
          return Effect.succeed(row.value);
        default:
          return Effect.fail(new KeyValueStoreError({
            method: "getUint8Array",
            key,
            message: `Invalid stored value type for key ${key}: ${row.value_type}`
          }));
      }
    })),
    set: (key, value) => upsert({
      id: key,
      value: typeof value === "string" ? encoder.encode(value) : value,
      value_type: typeof value === "string" ? ValueTypeString : ValueTypeUint8Array
    }).pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "set",
      key,
      message: `Unable to set item with key ${key}`,
      cause
    })), Effect.asVoid),
    remove: key => sql`DELETE FROM ${table} WHERE id = ${key}`.pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "remove",
      key,
      message: `Unable to remove item with key ${key}`,
      cause
    })), Effect.asVoid),
    clear: sql`DELETE FROM ${table}`.pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "clear",
      message: `Unable to clear storage`,
      cause
    })), Effect.asVoid),
    size: sql`SELECT COUNT(*) as count FROM ${table}`.pipe(Effect.mapError(cause => new KeyValueStoreError({
      method: "size",
      message: `Unable to get size`,
      cause
    })), Effect.map(rows => rows.length === 0 ? 0 : Number(rows[0].count)))
  });
}));
const SchemaStoreTypeId = "~effect/persistence/KeyValueStore/SchemaStore";
/**
 * @since 4.0.0
 * @category SchemaStore
 */
export const toSchemaStore = (self, schema) => {
  const serializer = Schema.toCodecJson(schema);
  const jsonSchema = Schema.fromJsonString(serializer);
  const decode = Schema.decodeEffect(jsonSchema);
  const encode = Schema.encodeEffect(jsonSchema);
  const get = key => Effect.flatMap(self.get(key), UndefinedOr.match({
    onUndefined: () => Effect.succeedNone,
    onDefined: value => Effect.asSome(decode(value))
  }));
  const set = (key, value) => Effect.flatMap(encode(value), json => self.set(key, json));
  const modify = (key, f) => Effect.flatMap(get(key), o => {
    if (Option.isNone(o)) {
      return Effect.succeedNone;
    }
    const newValue = f(o.value);
    return Effect.as(set(key, newValue), Option.some(newValue));
  });
  return {
    [SchemaStoreTypeId]: SchemaStoreTypeId,
    get,
    set,
    modify,
    remove: self.remove,
    clear: self.clear,
    size: self.size,
    has: self.has,
    isEmpty: self.isEmpty
  };
};
/**
 * Creates an KeyValueStorage from an instance of the `Storage` api.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 *
 * @since 4.0.0
 * @category layers
 */
export const layerStorage = evaluate => Layer.sync(KeyValueStore)(() => {
  const storage = evaluate();
  return makeStringOnly({
    get: key => Effect.try({
      try: () => storage.getItem(key) ?? undefined,
      catch: () => new KeyValueStoreError({
        key,
        method: "get",
        message: `Unable to get item with key ${key}`
      })
    }),
    set: (key, value) => Effect.try({
      try: () => storage.setItem(key, value),
      catch: () => new KeyValueStoreError({
        key,
        method: "set",
        message: `Unable to set item with key ${key}`
      })
    }),
    remove: key => Effect.try({
      try: () => storage.removeItem(key),
      catch: () => new KeyValueStoreError({
        key,
        method: "remove",
        message: `Unable to remove item with key ${key}`
      })
    }),
    clear: Effect.try({
      try: () => storage.clear(),
      catch: () => new KeyValueStoreError({
        method: "clear",
        message: `Unable to clear storage`
      })
    }),
    size: Effect.try({
      try: () => storage.length,
      catch: () => new KeyValueStoreError({
        method: "size",
        message: `Unable to get size`
      })
    })
  });
});
//# sourceMappingURL=KeyValueStore.js.map