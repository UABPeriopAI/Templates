/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Clock from "../../Clock.js";
import * as Context from "../../Context.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import { identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as Schema from "../../Schema.js";
import * as SqlClient from "../sql/SqlClient.js";
import * as KeyValueStore from "./KeyValueStore.js";
import * as Persistable from "./Persistable.js";
import * as Redis from "./Redis.js";
const ErrorTypeId = "~effect/persistence/Persistence/PersistenceError";
/**
 * @since 4.0.0
 * @category errors
 */
export class PersistenceError extends /*#__PURE__*/Schema.ErrorClass(ErrorTypeId)({
  _tag: /*#__PURE__*/Schema.tag("PersistenceError"),
  message: Schema.String,
  cause: /*#__PURE__*/Schema.optional(Schema.Defect)
}) {
  /**
   * @since 4.0.0
   */
  [ErrorTypeId] = ErrorTypeId;
}
/**
 * @since 4.0.0
 * @category Models
 */
export class Persistence extends /*#__PURE__*/Context.Service()("effect/persistence/Persistence") {}
/**
 * @since 4.0.0
 * @category BackingPersistence
 */
export class BackingPersistence extends /*#__PURE__*/Context.Service()("effect/persistence/BackingPersistence") {}
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = /*#__PURE__*/Layer.effect(Persistence)(/*#__PURE__*/Effect.gen(function* () {
  const backing = yield* BackingPersistence;
  const scope = yield* Effect.scope;
  return Persistence.of({
    make: Effect.fnUntraced(function* (options) {
      const storage = yield* backing.make(options.storeId);
      const timeToLive = options.timeToLive ?? (() => Duration.infinity);
      return identity({
        get: key => Effect.flatMap(storage.get(PrimaryKey.value(key)), result => result ? Persistable.deserializeExit(key, result) : Effect.undefined),
        getMany: Effect.fnUntraced(function* (keys) {
          const primaryKeys = Arr.empty();
          const persistables = Arr.empty();
          for (const key of keys) {
            primaryKeys.push(PrimaryKey.value(key));
            persistables.push(key);
          }
          if (!Arr.isArrayNonEmpty(primaryKeys)) return [];
          const results = yield* storage.getMany(primaryKeys);
          if (results.length !== primaryKeys.length) {
            return yield* new PersistenceError({
              message: `Expected ${primaryKeys.length} results but got ${results.length} from backing store`
            });
          }
          const out = new Array(primaryKeys.length);
          let toRemove;
          for (let i = 0; i < results.length; i++) {
            const key = persistables[i];
            const result = results[i];
            if (result === undefined) {
              out[i] = undefined;
              continue;
            }
            const eff = Persistable.deserializeExit(key, result);
            const exit = Exit.isExit(eff) ? eff : yield* Effect.exit(eff);
            if (Exit.isFailure(exit)) {
              toRemove ??= [];
              toRemove.push(PrimaryKey.value(key));
              out[i] = undefined;
              continue;
            }
            out[i] = exit.value;
          }
          if (toRemove) {
            for (let i = 0; i < toRemove.length; i++) {
              yield* Effect.forkIn(storage.remove(toRemove[i]), scope);
            }
          }
          return out;
        }),
        set(key, value) {
          const ttl = Duration.fromInputUnsafe(timeToLive(value, key));
          if (Duration.isZero(ttl) || Duration.isNegative(ttl)) return Effect.void;
          return Persistable.serializeExit(key, value).pipe(Effect.flatMap(encoded => storage.set(PrimaryKey.value(key), encoded, Duration.isFinite(ttl) ? ttl : undefined)));
        },
        setMany: Effect.fnUntraced(function* (entries) {
          const encodedEntries = Arr.empty();
          for (const [key, value] of entries) {
            const ttl = Duration.fromInputUnsafe(timeToLive(value, key));
            if (Duration.isZero(ttl) || Duration.isNegative(ttl)) continue;
            const encoded = Persistable.serializeExit(key, value);
            const exit = Exit.isExit(encoded) ? encoded : yield* Effect.exit(encoded);
            if (Exit.isFailure(exit)) {
              return yield* exit;
            }
            encodedEntries.push([PrimaryKey.value(key), exit.value, Duration.isFinite(ttl) ? ttl : undefined]);
          }
          if (!Arr.isArrayNonEmpty(encodedEntries)) return;
          return yield* storage.setMany(encodedEntries);
        }),
        remove: key => storage.remove(PrimaryKey.value(key)),
        clear: storage.clear
      });
    })
  });
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerBackingMemory = /*#__PURE__*/Layer.sync(BackingPersistence)(() => {
  const stores = new Map();
  const getStore = storeId => {
    let store = stores.get(storeId);
    if (store === undefined) {
      store = new Map();
      stores.set(storeId, store);
    }
    return store;
  };
  return BackingPersistence.of({
    make: storeId => Effect.clockWith(clock => {
      const map = getStore(storeId);
      const unsafeGet = key => {
        const value = map.get(key);
        if (value === undefined) {
          return undefined;
        } else if (value[1] !== null && value[1] <= clock.currentTimeMillisUnsafe()) {
          map.delete(key);
          return undefined;
        }
        return value[0];
      };
      return Effect.succeed({
        get: key => Effect.sync(() => unsafeGet(key)),
        getMany: keys => Effect.sync(() => Arr.map(keys, unsafeGet)),
        set: (key, value, ttl) => Effect.sync(() => map.set(key, [value, unsafeTtlToExpires(clock, ttl)])),
        setMany: entries => Effect.sync(() => {
          for (const [key, value, ttl] of entries) {
            map.set(key, [value, unsafeTtlToExpires(clock, ttl)]);
          }
        }),
        remove: key => Effect.sync(() => map.delete(key)),
        clear: Effect.sync(() => map.clear())
      });
    })
  });
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerBackingSqlMultiTable = /*#__PURE__*/Layer.effect(BackingPersistence)(/*#__PURE__*/Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  return BackingPersistence.of({
    make: Effect.fnUntraced(function* (storeId) {
      const clock = yield* Clock.Clock;
      const table = sql(`effect_persistence_${storeId}`);
      yield* sql.onDialectOrElse({
        mysql: () => sql`
            CREATE TABLE IF NOT EXISTS ${table} (
              id VARCHAR(191) PRIMARY KEY,
              value TEXT NOT NULL,
              expires BIGINT
            )
          `,
        pg: () => sql`
            CREATE TABLE IF NOT EXISTS ${table} (
              id TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              expires BIGINT
            )
          `,
        mssql: () => sql`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name=${table} AND xtype='U')
            CREATE TABLE ${table} (
              id NVARCHAR(450) PRIMARY KEY,
              value NVARCHAR(MAX) NOT NULL,
              expires BIGINT
            )
          `,
        // sqlite
        orElse: () => sql`
            CREATE TABLE IF NOT EXISTS ${table} (
              id TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              expires INTEGER
            )
          `
      }).pipe(Effect.orDie);
      // Cleanup expired entries on startup
      yield* Effect.ignore(sql`DELETE FROM ${table} WHERE expires IS NOT NULL AND expires <= ${clock.currentTimeMillisUnsafe()}`);
      const upsert = sql.onDialectOrElse({
        pg: () => entries => sql`
            INSERT INTO ${table} ${sql.insert(entries)}
            ON CONFLICT (id) DO UPDATE SET value=EXCLUDED.value, expires=EXCLUDED.expires
          `.unprepared,
        mysql: () => entries => sql`
            INSERT INTO ${table} ${sql.insert(entries)}
            ON DUPLICATE KEY UPDATE value=VALUES(value), expires=VALUES(expires)
          `.unprepared,
        // sqlite
        orElse: () => entries => sql`
            INSERT INTO ${table} ${sql.insert(entries)}
            ON CONFLICT(id) DO UPDATE SET value=excluded.value, expires=excluded.expires
          `.unprepared
      });
      const wrapString = sql.onDialectOrElse({
        mssql: () => s => `N'${s}'`,
        orElse: () => s => `'${s}'`
      });
      return identity({
        get: key => sql`SELECT value FROM ${table} WHERE id = ${key} AND (expires IS NULL OR expires > ${clock.currentTimeMillisUnsafe()})`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to get key ${key} from backing store`,
          cause
        })), Effect.flatMap(rows => {
          if (rows.length === 0) {
            return Effect.undefined;
          }
          try {
            return Effect.succeed(JSON.parse(rows[0].value));
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to parse value for key ${key} from backing store`,
              cause
            }));
          }
        })),
        getMany: keys => sql`SELECT id, value FROM ${table} WHERE id IN (${sql.literal(keys.map(wrapString).join(", "))}) AND (expires IS NULL OR expires > ${clock.currentTimeMillisUnsafe()})`.unprepared.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to getMany from backing store`,
          cause
        })), Effect.flatMap(rows => {
          const out = new Array(keys.length);
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const index = keys.indexOf(row.id);
            if (index === -1) continue;
            try {
              out[index] = JSON.parse(row.value);
            } catch {
              // ignore
            }
          }
          return Effect.succeed(out);
        })),
        set: (key, value, ttl) => Effect.suspend(() => {
          try {
            return upsert([{
              id: key,
              value: JSON.stringify(value),
              expires: unsafeTtlToExpires(clock, ttl)
            }]).pipe(Effect.mapError(cause => new PersistenceError({
              message: `Failed to set key ${key} in backing store`,
              cause
            })), Effect.asVoid);
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to serialize value for key ${key} to backing store`,
              cause
            }));
          }
        }),
        setMany: entries => Effect.suspend(() => {
          try {
            const encoded = entries.map(([key, value, ttl]) => ({
              id: key,
              value: JSON.stringify(value),
              expires: unsafeTtlToExpires(clock, ttl)
            }));
            return upsert(encoded).pipe(Effect.mapError(cause => new PersistenceError({
              message: `Failed to setMany in backing store`,
              cause
            })), Effect.asVoid);
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to serialize values into backing store`,
              cause
            }));
          }
        }),
        remove: key => sql`DELETE FROM ${table} WHERE id = ${key}`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to remove key ${key} from backing store`,
          cause
        })), Effect.asVoid),
        clear: sql`DELETE FROM ${table}`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to clear backing store`,
          cause
        })), Effect.asVoid)
      });
    })
  });
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerBackingSql = /*#__PURE__*/Layer.effect(BackingPersistence)(/*#__PURE__*/Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const table = sql("effect_persistence");
  yield* sql.onDialectOrElse({
    mysql: () => sql`
        CREATE TABLE IF NOT EXISTS ${table} (
          store_id VARCHAR(191) NOT NULL,
          id VARCHAR(191) NOT NULL,
          value TEXT NOT NULL,
          expires BIGINT,
          PRIMARY KEY (store_id, id)
        )
      `,
    pg: () => sql`
        CREATE TABLE IF NOT EXISTS ${table} (
          store_id TEXT NOT NULL,
          id TEXT NOT NULL,
          value TEXT NOT NULL,
          expires BIGINT,
          PRIMARY KEY (store_id, id)
        )
      `,
    mssql: () => sql`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name=${table} AND xtype='U')
        CREATE TABLE ${table} (
          store_id NVARCHAR(191) NOT NULL,
          id NVARCHAR(191) NOT NULL,
          value NVARCHAR(MAX) NOT NULL,
          expires BIGINT,
          PRIMARY KEY (store_id, id)
        )
      `,
    // sqlite
    orElse: () => sql`
        CREATE TABLE IF NOT EXISTS ${table} (
          store_id TEXT NOT NULL,
          id TEXT NOT NULL,
          value TEXT NOT NULL,
          expires INTEGER,
          PRIMARY KEY (store_id, id)
        )
      `
  }).pipe(Effect.orDie);
  const upsert = sql.onDialectOrElse({
    pg: () => entries => sql`
        INSERT INTO ${table} ${sql.insert(entries)}
        ON CONFLICT (store_id, id) DO UPDATE SET value=EXCLUDED.value, expires=EXCLUDED.expires
      `.unprepared,
    mysql: () => entries => sql`
        INSERT INTO ${table} ${sql.insert(entries)}
        ON DUPLICATE KEY UPDATE value=VALUES(value), expires=VALUES(expires)
      `.unprepared,
    mssql: () => entries => Effect.forEach(entries, entry => sql`
            MERGE ${table} AS target
            USING (SELECT ${entry.store_id} AS store_id, ${entry.id} AS id, ${entry.value} AS value, ${entry.expires} AS expires) AS source
            ON target.store_id = source.store_id AND target.id = source.id
            WHEN MATCHED THEN UPDATE SET value = source.value, expires = source.expires
            WHEN NOT MATCHED THEN INSERT (store_id, id, value, expires)
            VALUES (source.store_id, source.id, source.value, source.expires);
          `, {
      discard: true
    }),
    // sqlite
    orElse: () => entries => sql`
        INSERT INTO ${table} ${sql.insert(entries)}
        ON CONFLICT(store_id, id) DO UPDATE SET value=excluded.value, expires=excluded.expires
      `.unprepared
  });
  const wrapString = sql.onDialectOrElse({
    mssql: () => s => `N'${s}'`,
    orElse: () => s => `'${s}'`
  });
  return BackingPersistence.of({
    make: Effect.fnUntraced(function* (storeId) {
      const clock = yield* Clock.Clock;
      // Cleanup expired entries on startup
      yield* Effect.ignore(sql`DELETE FROM ${table} WHERE store_id = ${storeId} AND expires IS NOT NULL AND expires <= ${clock.currentTimeMillisUnsafe()}`);
      return identity({
        get: key => sql`SELECT value FROM ${table} WHERE store_id = ${storeId} AND id = ${key} AND (expires IS NULL OR expires > ${clock.currentTimeMillisUnsafe()})`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to get key ${key} from backing store`,
          cause
        })), Effect.flatMap(rows => {
          if (rows.length === 0) {
            return Effect.undefined;
          }
          try {
            return Effect.succeed(JSON.parse(rows[0].value));
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to parse value for key ${key} from backing store`,
              cause
            }));
          }
        })),
        getMany: keys => sql`SELECT id, value FROM ${table} WHERE store_id = ${storeId} AND id IN (${sql.literal(keys.map(wrapString).join(", "))}) AND (expires IS NULL OR expires > ${clock.currentTimeMillisUnsafe()})`.unprepared.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to getMany from backing store`,
          cause
        })), Effect.flatMap(rows => {
          const out = new Array(keys.length);
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const index = keys.indexOf(row.id);
            if (index === -1) continue;
            try {
              out[index] = JSON.parse(row.value);
            } catch {
              // ignore
            }
          }
          return Effect.succeed(out);
        })),
        set: (key, value, ttl) => Effect.suspend(() => {
          try {
            return upsert([{
              store_id: storeId,
              id: key,
              value: JSON.stringify(value),
              expires: unsafeTtlToExpires(clock, ttl)
            }]).pipe(Effect.mapError(cause => new PersistenceError({
              message: `Failed to set key ${key} in backing store`,
              cause
            })), Effect.asVoid);
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to serialize value for key ${key} to backing store`,
              cause
            }));
          }
        }),
        setMany: entries => Effect.suspend(() => {
          try {
            const encoded = entries.map(([key, value, ttl]) => ({
              store_id: storeId,
              id: key,
              value: JSON.stringify(value),
              expires: unsafeTtlToExpires(clock, ttl)
            }));
            return upsert(encoded).pipe(Effect.mapError(cause => new PersistenceError({
              message: `Failed to setMany in backing store`,
              cause
            })), Effect.asVoid);
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to serialize values into backing store`,
              cause
            }));
          }
        }),
        remove: key => sql`DELETE FROM ${table} WHERE store_id = ${storeId} AND id = ${key}`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to remove key ${key} from backing store`,
          cause
        })), Effect.asVoid),
        clear: sql`DELETE FROM ${table} WHERE store_id = ${storeId}`.pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to clear backing store`,
          cause
        })), Effect.asVoid)
      });
    })
  });
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerBackingRedis = /*#__PURE__*/Layer.effect(BackingPersistence)(/*#__PURE__*/Effect.gen(function* () {
  const redis = yield* Redis.Redis;
  const setMany = redis.eval(setManyRedis);
  return BackingPersistence.of({
    make: prefix => Effect.sync(() => {
      const prefixed = key => `${prefix}:${key}`;
      const parse = str => {
        if (str === null) {
          return Effect.undefined;
        }
        try {
          return Effect.succeed(JSON.parse(str));
        } catch (cause) {
          return Effect.fail(new PersistenceError({
            message: `Failed to parse value from Redis`,
            cause
          }));
        }
      };
      return identity({
        get: key => Effect.flatMap(Effect.mapError(redis.send("GET", prefixed(key)), ({
          cause
        }) => new PersistenceError({
          message: `Failed to get key ${key} from Redis`,
          cause
        })), parse),
        getMany: keys => Effect.flatMap(Effect.mapError(redis.send("mget", ...keys.map(prefixed)), ({
          cause
        }) => new PersistenceError({
          message: `Failed to getMany from Redis`,
          cause
        })), values => {
          const out = new Array(keys.length);
          for (let i = 0; i < keys.length; i++) {
            const value = values[i];
            try {
              out[i] = value === null ? undefined : JSON.parse(value);
            } catch {
              // TODO: remove bad entries?
              out[i] = undefined;
            }
          }
          return Effect.succeed(out);
        }),
        set: (key, value, ttl) => Effect.mapError(ttl === undefined ? redis.send("SET", prefixed(key), JSON.stringify(value)) : redis.send("SET", prefixed(key), JSON.stringify(value), "PX", String(Duration.toMillis(ttl))), ({
          cause
        }) => new PersistenceError({
          message: `Failed to set key ${key} in Redis`,
          cause
        })),
        setMany: entries => Effect.suspend(() => {
          const sets = new Map();
          const expires = new Map();
          for (const [key, value, ttl] of entries) {
            const pkey = prefixed(key);
            sets.set(pkey, JSON.stringify(value));
            if (ttl) {
              expires.set(pkey, Duration.toMillis(ttl));
            }
          }
          return Effect.mapError(setMany({
            sets,
            expires
          }), ({
            cause
          }) => new PersistenceError({
            message: `Failed to setMany in Redis`,
            cause
          }));
        }),
        remove: key => Effect.mapError(redis.send("DEL", prefixed(key)), ({
          cause
        }) => new PersistenceError({
          message: `Failed to remove key ${key} from Redis`,
          cause
        })),
        clear: redis.send("KEYS", `${prefix}:*`).pipe(Effect.flatMap(keys => redis.send("DEL", ...keys)), Effect.mapError(({
          cause
        }) => new PersistenceError({
          message: `Failed to clear keys from Redis`,
          cause
        })))
      });
    })
  });
}));
const setManyRedis = /*#__PURE__*/Redis.script(options => [...options.sets.keys(), ...options.expires.keys(), options.sets.size, options.expires.size, ...options.sets.values(), ...options.expires.values()], {
  numberOfKeys: options => options.sets.size + options.expires.size,
  lua: `
local num_sets = tonumber(ARGV[1])
local num_expires = tonumber(ARGV[2])
local index = 3

for i = 1, num_sets do
  local key = KEYS[i]
  local value = ARGV[index]
  redis.call("SET", key, value)
  index = index + 1
end

for i = 1, num_expires do
  local key = KEYS[num_sets + i]
  local expire = tonumber(ARGV[index])
  redis.call("PEXPIRE", key, expire)
  index = index + 1
end
`
});
/**
 * @since 4.0.0
 * @category layers
 */
export const layerBackingKvs = /*#__PURE__*/Layer.effect(BackingPersistence)(/*#__PURE__*/Effect.gen(function* () {
  const backing = yield* KeyValueStore.KeyValueStore;
  const clock = yield* Clock.Clock;
  return BackingPersistence.of({
    make: storeId => Effect.sync(() => {
      const store = KeyValueStore.prefix(backing, storeId);
      const get = key => Effect.flatMap(Effect.mapError(store.get(key), error => new PersistenceError({
        message: `Failed to get key ${key} from backing store`,
        cause: error
      })), str => {
        if (str === undefined) {
          return Effect.undefined;
        }
        try {
          const parsed = JSON.parse(str);
          if (!Array.isArray(parsed)) return Effect.undefined;
          const [value, expires] = parsed;
          if (expires !== null && expires <= clock.currentTimeMillisUnsafe()) {
            return Effect.as(Effect.ignore(store.remove(key)), undefined);
          }
          return Effect.succeed(value);
        } catch (cause) {
          return Effect.fail(new PersistenceError({
            message: `Failed to parse value for key ${key} from backing store`,
            cause
          }));
        }
      });
      return identity({
        get,
        getMany: keys => Effect.forEach(keys, get, {
          concurrency: "unbounded"
        }),
        set: (key, value, ttl) => Effect.suspend(() => {
          try {
            return Effect.mapError(store.set(key, JSON.stringify([value, unsafeTtlToExpires(clock, ttl)])), cause => new PersistenceError({
              message: `Failed to set key ${key} in backing store`,
              cause
            }));
          } catch (cause) {
            return Effect.fail(new PersistenceError({
              message: `Failed to serialize value for key ${key} to backing store`,
              cause
            }));
          }
        }),
        setMany: entries => Effect.forEach(entries, ([key, value, ttl]) => {
          const expires = unsafeTtlToExpires(clock, ttl);
          if (expires === null) return Effect.void;
          const encoded = JSON.stringify([value, expires]);
          return store.set(key, encoded);
        }, {
          concurrency: "unbounded",
          discard: true
        }).pipe(Effect.mapError(cause => new PersistenceError({
          message: `Failed to setMany in backing store`,
          cause
        }))),
        remove: key => Effect.mapError(store.remove(key), cause => new PersistenceError({
          message: `Failed to remove key ${key} from backing store`,
          cause
        })),
        clear: Effect.mapError(store.clear, cause => new PersistenceError({
          message: `Failed to clear backing store`,
          cause
        }))
      });
    })
  });
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerKvs = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provide(layerBackingKvs));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerMemory = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provide(layerBackingMemory));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerRedis = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provide(layerBackingRedis));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerSqlMultiTable = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provide(layerBackingSqlMultiTable));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerSql = /*#__PURE__*/layer.pipe(/*#__PURE__*/Layer.provide(layerBackingSql));
/**
 * @since 4.0.0
 */
export const unsafeTtlToExpires = (clock, ttl) => ttl ? clock.currentTimeMillisUnsafe() + Duration.toMillis(ttl) : null;
//# sourceMappingURL=Persistence.js.map