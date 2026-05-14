import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import { flow } from "../../Function.js";
import * as Iterable from "../../Iterable.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as MutableRef from "../../MutableRef.js";
import * as Queue from "../../Queue.js";
import * as RcMap from "../../RcMap.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as SqlClient from "../sql/SqlClient.js";
import * as Redis from "./Redis.js";
/**
 * @since 4.0.0
 * @category Type IDs
 */
export const TypeId = "~effect/persistence/PersistedQueue";
/**
 * @since 4.0.0
 * @category Factory
 */
export class PersistedQueueFactory extends /*#__PURE__*/Context.Service()("effect/persistence/PersistedQueue/PersistedQueueFactory") {}
/**
 * @since 4.0.0
 * @category Accessors
 */
export const make = options => PersistedQueueFactory.use(factory => factory.make(options));
/**
 * @since 4.0.0
 * @category Factory
 */
export const makeFactory = /*#__PURE__*/Effect.gen(function* () {
  const store = yield* PersistedQueueStore;
  return PersistedQueueFactory.of({
    make(options) {
      const jsonSchema = Schema.toCodecJson(options.schema);
      const encodeUnknown = Schema.encodeUnknownEffect(jsonSchema);
      const decodeUnknown = Schema.decodeUnknownEffect(jsonSchema);
      return Effect.succeed({
        [TypeId]: TypeId,
        offer: (value, opts) => Effect.flatMap(encodeUnknown(value), element => {
          const id = opts?.id ?? crypto.randomUUID();
          return Effect.as(store.offer({
            name: options.name,
            id,
            element,
            isCustomId: opts?.id !== undefined
          }), id);
        }),
        take: (f, opts) => Effect.uninterruptibleMask(Effect.fnUntraced(function* (restore) {
          const scope = yield* Scope.make();
          const item = yield* store.take({
            name: options.name,
            maxAttempts: opts?.maxAttempts ?? 10
          }).pipe(Scope.provide(scope), restore);
          const decoded = yield* decodeUnknown(item.element);
          const exit = yield* Effect.exit(restore(f(decoded, {
            id: item.id,
            attempts: item.attempts
          })));
          yield* Scope.close(scope, exit);
          return yield* exit;
        }))
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category Factory
 */
export const layer = /*#__PURE__*/Layer.effect(PersistedQueueFactory, makeFactory);
/**
 * @since 4.0.0
 * @category Errors
 */
export const ErrorTypeId = "~@effect/experimental/PersistedQueue/PersistedQueueError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class PersistedQueueError extends /*#__PURE__*/Schema.ErrorClass("effect/persistence/PersistedQueue/PersistedQueueError")({
  _tag: /*#__PURE__*/Schema.tag("PersistedQueueError"),
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
 * @category Store
 */
export class PersistedQueueStore extends /*#__PURE__*/Context.Service()("effect/persistence/PersistedQueue/PersistedQueueStore") {}
/**
 * @since 4.0.0
 * @category Store
 */
export const layerStoreMemory = /*#__PURE__*/Layer.sync(PersistedQueueStore, () => {
  const ids = new Set();
  const queues = new Map();
  const getOrCreateQueue = name => {
    let queue = queues.get(name);
    if (!queue) {
      queue = {
        latch: Latch.makeUnsafe(false),
        items: new Set()
      };
      queues.set(name, queue);
    }
    return queue;
  };
  return PersistedQueueStore.of({
    offer: options => Effect.sync(() => {
      if (ids.has(options.id)) return;
      ids.add(options.id);
      const queue = getOrCreateQueue(options.name);
      queue.items.add({
        id: options.id,
        attempts: 0,
        element: options.element
      });
      queue.latch.openUnsafe();
    }),
    take: Effect.fnUntraced(function* (options) {
      const queue = getOrCreateQueue(options.name);
      while (true) {
        yield* queue.latch.await;
        const item = Iterable.headUnsafe(queue.items);
        queue.items.delete(item);
        if (queue.items.size === 0) {
          queue.latch.closeUnsafe();
        }
        yield* Effect.addFinalizer(exit => {
          if (exit._tag === "Success") {
            return Effect.void;
          } else if (!Exit.hasInterrupts(exit)) {
            item.attempts += 1;
          }
          if (item.attempts >= options.maxAttempts) {
            return Effect.void;
          }
          queue.items.add(item);
          queue.latch.openUnsafe();
          return Effect.void;
        });
        return item;
      }
    })
  });
});
/**
 * @since 4.0.0
 * @category Store
 */
export const makeStoreRedis = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const redis = yield* Redis.Redis;
  const pollInterval = Duration.max(options?.pollInterval ? Duration.fromInputUnsafe(options.pollInterval) : Duration.seconds(1), Duration.millis(1));
  const lockRefreshMillis = Math.max(options?.lockRefreshInterval ? Duration.toMillis(Duration.fromInputUnsafe(options.lockRefreshInterval)) : 30_000, 1);
  const lockExpirationMillis = Math.max(options?.lockExpiration ? Duration.toMillis(Duration.fromInputUnsafe(options.lockExpiration)) : 90_000, 1);
  const prefix = options?.prefix ?? "effectq:";
  const keyQueue = name => `${prefix}${name}`;
  const keyLock = id => `${prefix}${id}:lock`;
  const keyPending = name => `${prefix}${name}:pending`;
  const keyFailed = name => `${prefix}${name}:failed`;
  const workerId = crypto.randomUUID();
  const requeue = redis.eval(requeueRedis);
  const complete = redis.eval(completeRedis);
  const failed = redis.eval(failedRedis);
  const resetQueue = redis.eval(resetQueueRedis);
  const offer = redis.eval(offerRedis);
  const take = redis.eval(takeRedis);
  const expireAll = redis.eval(expireAllRedis);
  const queues = yield* RcMap.make({
    lookup: Effect.fnUntraced(function* (name) {
      const queueKey = keyQueue(name);
      const pendingKey = keyPending(name);
      const queue = yield* Queue.make();
      const takers = MutableRef.make(0);
      const pollLatch = Latch.makeUnsafe();
      const takenLatch = Latch.makeUnsafe();
      yield* Effect.addFinalizer(() => Effect.orDie(Effect.flatMap(Queue.clear(queue), elements => Effect.forEach(elements, element => requeue(queueKey, pendingKey, keyLock(element.id), element.id, JSON.stringify(element)), {
        concurrency: "unbounded",
        discard: true
      }))));
      yield* resetQueue(queueKey, pendingKey, prefix).pipe(Effect.andThen(Effect.sleep(lockRefreshMillis)), Effect.forever, Effect.forkScoped);
      const poll = size => take(queueKey, pendingKey, prefix, workerId, size, lockExpirationMillis);
      yield* Effect.gen(function* () {
        while (true) {
          yield* pollLatch.await;
          yield* Effect.yieldNow;
          const results = takers.current === 0 ? null : yield* poll(takers.current);
          if (results === null) {
            yield* Effect.sleep(pollInterval);
            continue;
          }
          takenLatch.closeUnsafe();
          yield* Queue.offerAll(queue, results.map(json => JSON.parse(json)));
          yield* takenLatch.await;
          yield* Effect.yieldNow;
        }
      }).pipe(Effect.sandbox, Effect.retry(Schedule.spaced(500)), Effect.forkScoped, Effect.interruptible);
      return {
        queue,
        takers,
        pollLatch,
        takenLatch
      };
    }),
    idleTimeToLive: Duration.seconds(30)
  });
  const activeLockKeys = new Set();
  yield* Effect.gen(function* () {
    while (true) {
      yield* Effect.sleep(lockRefreshMillis);
      yield* Effect.ignore(expireAll(Array.from(activeLockKeys), lockExpirationMillis));
    }
  }).pipe(Effect.forkScoped, Effect.interruptible, Effect.annotateLogs({
    module: "effect/persistence/PersistedQueue",
    fiber: "refreshLocks"
  }));
  return PersistedQueueStore.of({
    offer: ({
      element,
      id,
      isCustomId,
      name
    }) => Effect.mapError(isCustomId ? offer(`${prefix}${name}`, `${prefix}${name}:ids`, id, JSON.stringify({
      id,
      element,
      attempts: 0
    })) : redis.send("LPUSH", `${prefix}${name}`, JSON.stringify({
      id,
      element,
      attempts: 0
    })), ({
      cause
    }) => new PersistedQueueError({
      message: "Failed to offer element to persisted queue",
      cause
    })),
    take: options => Effect.uninterruptibleMask(restore => RcMap.get(queues, options.name).pipe(Effect.flatMap(({
      pollLatch,
      queue,
      takenLatch,
      takers
    }) => {
      takers.current++;
      if (takers.current === 1) {
        pollLatch.openUnsafe();
      }
      return Effect.tap(restore(Queue.take(queue)), () => Effect.sync(() => {
        takers.current--;
        if (takers.current === 0) {
          pollLatch.closeUnsafe();
          takenLatch.openUnsafe();
        } else if (Queue.sizeUnsafe(queue) === 0) {
          takenLatch.openUnsafe();
        }
      }));
    }), Effect.scoped, Effect.tap(element => {
      const lock = keyLock(element.id);
      activeLockKeys.add(lock);
      return Effect.addFinalizer(Exit.match({
        onFailure: cause => {
          activeLockKeys.delete(lock);
          const nextAttempts = element.attempts + 1;
          if (nextAttempts >= options.maxAttempts) {
            return Effect.orDie(failed(keyPending(options.name), lock, keyFailed(options.name), element.id, JSON.stringify({
              ...element,
              lastFailure: Cause.pretty(cause),
              attempts: nextAttempts
            })));
          }
          return Effect.orDie(requeue(keyQueue(options.name), keyPending(options.name), lock, element.id, JSON.stringify(Cause.hasInterruptsOnly(cause) ? element : {
            ...element,
            lastFailure: Cause.pretty(cause),
            attempts: nextAttempts
          })));
        },
        onSuccess: () => {
          activeLockKeys.delete(lock);
          return Effect.orDie(complete(keyPending(options.name), lock, element.id));
        }
      }));
    })))
  });
});
const offerRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_queue = KEYS[1]
local key_ids = KEYS[2]
local id = ARGV[1]
local payload = ARGV[2]

local result = redis.call("SADD", key_ids, id)
if result == 1 then
  redis.call("RPUSH", key_queue, payload)
end
`,
  numberOfKeys: 2
});
const resetQueueRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_queue = KEYS[1]
local key_pending = KEYS[2]
local prefix = ARGV[1]

local entries = redis.call("HGETALL", key_pending)
for id, payload in pairs(entries) do
  local lock_key = prefix .. id .. ":lock"
  local exists = redis.call("EXISTS", lock_key)
  if exists == 0 then
    redis.call("RPUSH", key_queue, payload)
    redis.call("HDEL", key_pending, id)
  end
end
`,
  numberOfKeys: 2
});
const requeueRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_queue = KEYS[1]
local key_pending = KEYS[2]
local key_lock = KEYS[3]
local id = ARGV[1]
local payload = ARGV[2]

redis.call("DEL", key_lock)
redis.call("HDEL", key_pending, id)
redis.call("RPUSH", key_queue, payload)
`,
  numberOfKeys: 3
});
const completeRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_pending = KEYS[1]
local key_lock = KEYS[2]
local id = ARGV[1]

redis.call("DEL", key_lock)
redis.call("HDEL", key_pending, id)
`,
  numberOfKeys: 2
});
const failedRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_pending = KEYS[1]
local key_lock = KEYS[2]
local key_failed = KEYS[3]
local id = ARGV[1]
local payload = ARGV[2]

redis.call("DEL", key_lock)
redis.call("HDEL", key_pending, id)
redis.call("RPUSH", key_failed, payload)
`,
  numberOfKeys: 2
});
const takeRedis = /*#__PURE__*/Redis.script((...args) => args, {
  lua: `
local key_queue = KEYS[1]
local key_pending = KEYS[2]
local prefix = ARGV[1]
local worker_id = ARGV[2]
local batch_size = tonumber(ARGV[3])
local pttl = ARGV[4]

local payloads = redis.call("LPOP", key_queue, batch_size)
if not payloads then
  return nil
end

for i, payload in ipairs(payloads) do
  local id = cjson.decode(payload).id
  local key_lock = prefix .. id .. ":lock"
  redis.call("SET", key_lock, worker_id, "PX", pttl)
  redis.call("HSET", key_pending, id, payload)
end

return payloads
`,
  numberOfKeys: 2
}).withReturnType();
const expireAllRedis = /*#__PURE__*/Redis.script((keys, ttl) => [...keys, ttl], {
  numberOfKeys: keys => keys.length,
  lua: `
local ttl = ARGV[1]
for i, key in ipairs(KEYS) do
  redis.call("PEXPIRE", key, ttl)
end
`
});
/**
 * @since 4.0.0
 * @category Store
 */
export const layerStoreRedis = /*#__PURE__*/flow(makeStoreRedis, /*#__PURE__*/Layer.effect(PersistedQueueStore));
/**
 * @since 4.0.0
 * @category Store
 */
export const makeStoreSql = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const tableName = options?.tableName ?? "effect_queue";
  const tableNameSql = sql(tableName);
  const pollInterval = Duration.max(options?.pollInterval ? Duration.fromInputUnsafe(options.pollInterval) : Duration.millis(1000), Duration.millis(1));
  const lockRefreshInterval = Duration.max(options?.lockRefreshInterval ? Duration.fromInputUnsafe(options.lockRefreshInterval) : Duration.seconds(30), Duration.millis(1));
  const lockExpiration = Duration.max(options?.lockExpiration ? Duration.fromInputUnsafe(options.lockExpiration) : Duration.minutes(2), Duration.millis(1));
  const lockExpirationSql = sql.literal(Math.ceil(Duration.toSeconds(lockExpiration)).toString());
  const workerId = crypto.randomUUID();
  const sqlNow = sql.onDialectOrElse({
    mssql: () => sql.literal("GETDATE()"),
    mysql: () => sql.literal("NOW()"),
    pg: () => sql.literal("NOW()"),
    // sqlite
    orElse: () => sql.literal("CURRENT_TIMESTAMP")
  });
  const expiresAt = sql.onDialectOrElse({
    pg: () => sql`${sqlNow} - INTERVAL '${lockExpirationSql} seconds'`,
    mysql: () => sql`DATE_SUB(${sqlNow}, INTERVAL ${lockExpirationSql} SECOND)`,
    mssql: () => sql`DATEADD(SECOND, -${lockExpirationSql}, ${sqlNow})`,
    orElse: () => sql`datetime(${sqlNow}, '-${lockExpirationSql} seconds')`
  });
  yield* sql.onDialectOrElse({
    mysql: () => sql`CREATE TABLE IF NOT EXISTS ${tableNameSql} (
        sequence BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        id VARCHAR(36) NOT NULL,
        queue_name VARCHAR(100) NOT NULL,
        element TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        last_failure TEXT NULL,
        acquired_at DATETIME NULL,
        acquired_by VARCHAR(36) NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`,
    pg: () => sql`CREATE TABLE IF NOT EXISTS ${tableNameSql} (
        sequence SERIAL PRIMARY KEY,
        id VARCHAR(36) NOT NULL,
        queue_name VARCHAR(100) NOT NULL,
        element TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_failure TEXT NULL,
        acquired_at TIMESTAMP NULL,
        acquired_by UUID NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,
    mssql: () => sql`IF NOT EXISTS (SELECT * FROM sysobjects WHERE name=${tableNameSql} AND xtype='U')
      CREATE TABLE ${tableNameSql} (
        sequence INT IDENTITY(1,1) PRIMARY KEY,
        id NVARCHAR(36) NOT NULL,
        queue_name NVARCHAR(100) NOT NULL,
        element NVARCHAR(MAX) NOT NULL,
        completed BIT NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        last_failure NVARCHAR(MAX) NULL,
        acquired_at DATETIME2 NULL,
        acquired_by UNIQUEIDENTIFIER NULL,
        created_at DATETIME2 NOT NULL,
        updated_at DATETIME2 NOT NULL
      )`,
    // sqlite
    orElse: () => sql`CREATE TABLE IF NOT EXISTS ${tableNameSql} (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL,
        queue_name TEXT NOT NULL,
        element TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_failure TEXT NULL,
        acquired_at DATETIME NULL,
        acquired_by TEXT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  });
  yield* sql.onDialectOrElse({
    mssql: () => sql`IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'idx_${tableName}_id')
        CREATE UNIQUE INDEX idx_${tableNameSql}_id ON ${tableNameSql} (id)`,
    mysql: () => sql`CREATE UNIQUE INDEX ${sql(`idx_${tableName}_id`)} ON ${tableNameSql} (id)`.pipe(Effect.ignore),
    orElse: () => sql`CREATE UNIQUE INDEX IF NOT EXISTS ${sql(`idx_${tableName}_id`)} ON ${tableNameSql} (id)`
  });
  yield* sql.onDialectOrElse({
    mssql: () => sql`IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'idx_${tableName}_take')
        CREATE INDEX idx_${tableNameSql}_take ON ${tableNameSql} (queue_name, completed, attempts, acquired_at)`,
    mysql: () => sql`CREATE INDEX ${sql(`idx_${tableName}_take`)} ON ${tableNameSql} (queue_name, completed, attempts, acquired_at)`.pipe(Effect.ignore),
    orElse: () => sql`CREATE INDEX IF NOT EXISTS ${sql(`idx_${tableName}_take`)} ON ${tableNameSql} (queue_name, completed, attempts, acquired_at)`
  });
  yield* sql.onDialectOrElse({
    mssql: () => sql`IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'idx_${tableName}_update')
        CREATE INDEX ${sql(`idx_${tableName}_update`)} ON ${tableNameSql} (sequence, acquired_by)`,
    mysql: () => sql`CREATE INDEX ${sql(`idx_${tableName}_update`)} ON ${tableNameSql} (sequence, acquired_by)`.pipe(Effect.ignore),
    orElse: () => sql`CREATE INDEX IF NOT EXISTS ${sql(`idx_${tableName}_update`)} ON ${tableNameSql} (sequence, acquired_by)`
  });
  const offer = sql.onDialectOrElse({
    pg: () => (id, name, element) => sql`
        INSERT INTO ${tableNameSql} (id, queue_name, element, completed, attempts, created_at, updated_at)
        VALUES (${id}, ${name}, ${element}, FALSE, 0, ${sqlNow}, ${sqlNow})
        ON CONFLICT (id) DO NOTHING
      `,
    mysql: () => (id, name, element) => sql`
        INSERT IGNORE INTO ${tableNameSql} (id, queue_name, element, completed, attempts, created_at, updated_at)
        VALUES (${id}, ${name}, ${element}, FALSE, 0, ${sqlNow}, ${sqlNow})
      `,
    mssql: () => (id, name, element) => sql`
        IF NOT EXISTS (SELECT 1 FROM ${tableNameSql} WHERE id = ${id})
        BEGIN
          INSERT INTO ${tableNameSql} (id, queue_name, element, completed, attempts, created_at, updated_at)
          VALUES (${id}, ${name}, ${element}, 0, 0, ${sqlNow}, ${sqlNow})
        END
      `,
    // sqlite
    orElse: () => (id, name, element) => sql`
        INSERT OR IGNORE INTO ${tableNameSql} (id, queue_name, element, completed, attempts, created_at, updated_at)
        VALUES (${id}, ${name}, ${element}, FALSE, 0, ${sqlNow}, ${sqlNow})
      `
  });
  const wrapString = sql.onDialectOrElse({
    mssql: () => s => `N'${s}'`,
    orElse: () => s => `'${s}'`
  });
  const stringLiteral = s => sql.literal(wrapString(s));
  const sqlTrue = sql.onDialectOrElse({
    sqlite: () => sql.literal("1"),
    orElse: () => sql.literal("TRUE")
  });
  const workerIdSql = stringLiteral(workerId);
  const elementIds = new Set();
  const refreshLocks = Effect.suspend(() => {
    if (elementIds.size === 0) return Effect.void;
    return sql`
      UPDATE ${tableNameSql}
      SET acquired_at = ${sqlNow}
      WHERE acquired_by = ${workerIdSql}
    `;
  });
  const complete = (sequence, attempts) => {
    elementIds.delete(sequence);
    return sql`
      UPDATE ${tableNameSql}
      SET acquired_at = NULL, acquired_by = NULL, updated_at = ${sqlNow}, completed = ${sqlTrue}, attempts = ${attempts}
      WHERE sequence = ${sequence}
      AND acquired_by = ${workerIdSql}
    `.pipe(Effect.retry({
      times: 5,
      schedule: Schedule.exponential(100, 1.5)
    }), Effect.orDie);
  };
  const retry = (sequence, attempts, cause) => {
    elementIds.delete(sequence);
    return sql`
      UPDATE ${tableNameSql}
      SET acquired_at = NULL, acquired_by = NULL, updated_at = ${sqlNow}, attempts = ${attempts}, last_failure = ${Cause.pretty(cause)}
      WHERE sequence = ${sequence}
      AND acquired_by = ${workerIdSql}
    `.pipe(Effect.retry({
      times: 5,
      schedule: Schedule.exponential(100, 1.5)
    }), Effect.orDie);
  };
  const interrupt = ids => {
    for (const id of ids) {
      elementIds.delete(id);
    }
    return sql`
      UPDATE ${tableNameSql}
      SET acquired_at = NULL, acquired_by = NULL
      WHERE sequence IN (${sql.literal(ids.join(","))})
      AND acquired_by = ${workerIdSql}
    `.pipe(Effect.retry({
      times: 5,
      schedule: Schedule.exponential(100, 1.5)
    }), Effect.orDie);
  };
  yield* refreshLocks.pipe(Effect.tapCause(Effect.logWarning), Effect.retry(Schedule.spaced(500)), Effect.schedule(Schedule.fixed(lockRefreshInterval)), Effect.annotateLogs({
    package: "@effect/sql",
    module: "SqlPersistedQueue",
    fiber: "refreshLocks"
  }), Effect.forkScoped);
  const mailboxes = yield* RcMap.make({
    lookup: Effect.fnUntraced(function* ({
      maxAttempts,
      name
    }) {
      const queue = yield* Queue.make();
      const takers = MutableRef.make(0);
      const pollLatch = Latch.makeUnsafe();
      const takenLatch = Latch.makeUnsafe();
      yield* Effect.addFinalizer(() => Effect.flatMap(Queue.clear(queue), elements => {
        if (elements.length === 0) return Effect.void;
        return interrupt(Array.from(elements, e => e.sequence));
      }));
      const poll = sql.onDialectOrElse({
        pg: () => size => sql`
            WITH cte AS (
              UPDATE ${tableNameSql}
              SET acquired_at = ${sqlNow}, acquired_by = ${workerIdSql}
              WHERE sequence IN (
                SELECT sequence FROM ${tableNameSql}
                WHERE queue_name = ${name}
                AND completed = FALSE
                AND attempts < ${maxAttempts}
                AND (acquired_at IS NULL OR acquired_at < ${expiresAt})
                ORDER BY updated_at ASC, sequence ASC
                FOR UPDATE SKIP LOCKED
                LIMIT ${sql.literal(size.toString())}
              )
              RETURNING sequence, id, queue_name, element, attempts, updated_at
            )
            SELECT sequence, id, queue_name, element, attempts FROM cte
            ORDER BY updated_at ASC, sequence ASC
          `,
        mysql: () => size => sql`
            SELECT sequence, id, queue_name, element, attempts FROM ${tableNameSql} q
            WHERE queue_name = ${name}
            AND completed = FALSE
            AND attempts < ${maxAttempts}
            AND (acquired_at IS NULL OR acquired_at < ${expiresAt})
            ORDER BY updated_at ASC, sequence ASC
            LIMIT ${sql.literal(size.toString())}
            FOR UPDATE SKIP LOCKED
          `.pipe(Effect.tap(rows => {
          if (rows.length === 0) return Effect.void;
          return sql`
                UPDATE ${tableNameSql}
                SET acquired_at = ${sqlNow}, acquired_by = ${workerIdSql}
                WHERE sequence IN (${sql.literal(rows.map(r => r.sequence).join(","))})
              `.unprepared;
        }), sql.withTransaction),
        mssql: () => size => sql`
            WITH cte AS (
              SELECT TOP ${sql.literal(size.toString())} sequence FROM ${tableNameSql}
              WHERE queue_name = ${name}
              AND completed = 0
              AND attempts < ${maxAttempts}
              AND (acquired_at IS NULL OR acquired_at < ${expiresAt})
              ORDER BY updated_at ASC, sequence ASC
            )
            UPDATE q
            SET acquired_at = ${sqlNow}, acquired_by = ${workerIdSql}
            OUTPUT inserted.sequence, inserted.id, inserted.queue_name, inserted.element, inserted.attempts
            FROM ${tableNameSql} AS q
            INNER JOIN cte ON q.sequence = cte.sequence
          `,
        // sqlite
        orElse: () => size => sql`
            UPDATE ${tableNameSql}
            SET acquired_at = ${sqlNow}, acquired_by = ${workerIdSql}
            WHERE queue_name = ${name}
            AND completed = FALSE
            AND attempts < ${maxAttempts}
            AND (acquired_at IS NULL OR acquired_at < ${expiresAt})
            RETURNING sequence, id, queue_name, element, attempts
            ORDER BY updated_at ASC, sequence ASC
            LIMIT ${sql.literal(size.toString())}
          `
      });
      yield* Effect.gen(function* () {
        while (true) {
          yield* pollLatch.await;
          yield* Effect.yieldNow;
          const results = takers.current === 0 ? [] : yield* poll(takers.current);
          if (results.length === 0) {
            yield* Effect.sleep(pollInterval);
            continue;
          }
          takenLatch.closeUnsafe();
          for (let i = 0; i < results.length; i++) {
            const element = results[i];
            element.element = JSON.parse(element.element);
          }
          yield* Queue.offerAll(queue, results);
          yield* takenLatch.await;
          yield* Effect.yieldNow;
        }
      }).pipe(Effect.sandbox, Effect.retry(Schedule.spaced(500)), Effect.forkScoped);
      return {
        queue,
        takers,
        pollLatch,
        takenLatch
      };
    }),
    idleTimeToLive: Duration.seconds(30)
  });
  return PersistedQueueStore.of({
    offer: ({
      element,
      id,
      name
    }) => Effect.catchCause(Effect.suspend(() => offer(id, name, JSON.stringify(element))), cause => Effect.fail(new PersistedQueueError({
      message: "Failed to offer element to persisted queue",
      cause
    }))),
    take: ({
      maxAttempts,
      name
    }) => Effect.uninterruptibleMask(restore => RcMap.get(mailboxes, new QueueKey({
      name,
      maxAttempts
    })).pipe(Effect.flatMap(({
      pollLatch,
      queue,
      takenLatch,
      takers
    }) => {
      takers.current++;
      if (takers.current === 1) {
        pollLatch.openUnsafe();
      }
      return Effect.tap(restore(Queue.take(queue)), () => Effect.sync(() => {
        takers.current--;
        if (takers.current === 0) {
          pollLatch.closeUnsafe();
          takenLatch.openUnsafe();
        } else if (Queue.sizeUnsafe(queue) === 0) {
          takenLatch.openUnsafe();
        }
      }));
    }), Effect.scoped, restore, Effect.tap(element => Effect.addFinalizer(Exit.match({
      onFailure: cause => Cause.hasInterruptsOnly(cause) ? interrupt([element.sequence]) : retry(element.sequence, element.attempts + 1, cause),
      onSuccess: () => complete(element.sequence, element.attempts + 1)
    })))))
  });
});
class QueueKey extends Data.Class {}
/**
 * @since 4.0.0
 * @category Store
 */
export const layerStoreSql = /*#__PURE__*/flow(makeStoreSql, /*#__PURE__*/Layer.effect(PersistedQueueStore));
//# sourceMappingURL=PersistedQueue.js.map