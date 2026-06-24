import * as Effect from "../../Effect.js";
import * as RequestResolver from "../../RequestResolver.js";
import { SqlClient } from "./SqlClient.js";
import * as SqlResolver from "./SqlResolver.js";
import * as SqlSchema from "./SqlSchema.js";
/**
 * Create a simple CRUD repository from a model.
 *
 * @since 4.0.0
 * @category repository
 */
export const makeRepository = (Model, options) => Effect.gen(function* () {
  const sql = yield* SqlClient;
  const idSchema = Model.fields[options.idColumn];
  const idColumn = options.idColumn;
  const insertSchema = SqlSchema.findOne({
    Request: Model.insert,
    Result: Model,
    execute: request => sql.onDialectOrElse({
      mysql: () => sql`insert into ${sql(options.tableName)} ${sql.insert(request)};
select * from ${sql(options.tableName)} where ${sql(idColumn)} = LAST_INSERT_ID();`.unprepared.pipe(Effect.map(([, results]) => results)),
      orElse: () => sql`insert into ${sql(options.tableName)} ${sql.insert(request).returning("*")}`
    })
  });
  const insert = insert => insertSchema(insert).pipe(Effect.catchTag("NoSuchElementError", Effect.die), Effect.withSpan(`${options.spanPrefix}.insert`, {}, {
    captureStackTrace: false
  }));
  const insertVoidSchema = SqlSchema.void({
    Request: Model.insert,
    execute: request => sql`insert into ${sql(options.tableName)} ${sql.insert(request)}`
  });
  const insertVoid = insert => insertVoidSchema(insert).pipe(Effect.withSpan(`${options.spanPrefix}.insertVoid`, {}, {
    captureStackTrace: false
  }));
  const updateSchema = SqlSchema.findOne({
    Request: Model.update,
    Result: Model,
    execute: request => sql.onDialectOrElse({
      mysql: () => sql`update ${sql(options.tableName)} set ${sql.update(request, [idColumn])} where ${sql(idColumn)} = ${request[idColumn]};
select * from ${sql(options.tableName)} where ${sql(idColumn)} = ${request[idColumn]};`.unprepared.pipe(Effect.map(([, results]) => results)),
      orElse: () => sql`update ${sql(options.tableName)} set ${sql.update(request, [idColumn])} where ${sql(idColumn)} = ${request[idColumn]} returning *`
    })
  });
  const update = update => updateSchema(update).pipe(Effect.catchTag("NoSuchElementError", Effect.die), Effect.withSpan(`${options.spanPrefix}.update`, {
    attributes: {
      id: update[idColumn]
    }
  }, {
    captureStackTrace: false
  }));
  const updateVoidSchema = SqlSchema.void({
    Request: Model.update,
    execute: request => sql`update ${sql(options.tableName)} set ${sql.update(request, [idColumn])} where ${sql(idColumn)} = ${request[idColumn]}`
  });
  const updateVoid = update => updateVoidSchema(update).pipe(Effect.withSpan(`${options.spanPrefix}.updateVoid`, {
    attributes: {
      id: update[idColumn]
    }
  }, {
    captureStackTrace: false
  }));
  const findByIdSchema = SqlSchema.findOne({
    Request: idSchema,
    Result: Model,
    execute: id => sql`select * from ${sql(options.tableName)} where ${sql(idColumn)} = ${id}`
  });
  const findById = id => findByIdSchema(id).pipe(Effect.withSpan(`${options.spanPrefix}.findById`, {
    attributes: {
      id
    }
  }, {
    captureStackTrace: false
  }));
  const deleteSchema = SqlSchema.void({
    Request: idSchema,
    execute: id => sql`delete from ${sql(options.tableName)} where ${sql(idColumn)} = ${id}`
  });
  const delete_ = id => deleteSchema(id).pipe(Effect.withSpan(`${options.spanPrefix}.delete`, {
    attributes: {
      id
    }
  }, {
    captureStackTrace: false
  }));
  return {
    insert,
    insertVoid,
    update,
    updateVoid,
    findById,
    delete: delete_
  };
});
/**
 * Create some simple data loaders from a model.
 *
 * @since 4.0.0
 * @category repository
 */
export const makeResolvers = (Model, options) => Effect.gen(function* () {
  const sql = yield* SqlClient;
  const idSchema = Model.fields[options.idColumn];
  const idColumn = options.idColumn;
  const insert = SqlResolver.ordered({
    Request: Model.insert,
    Result: Model,
    execute: request => sql.onDialectOrElse({
      mysql: () => Effect.forEach(request, request => sql`insert into ${sql(options.tableName)} ${sql.insert(request)};
select * from ${sql(options.tableName)} where ${sql(idColumn)} = LAST_INSERT_ID();`.unprepared.pipe(Effect.map(([, results]) => results[0])), {
        concurrency: 10
      }),
      orElse: () => sql`insert into ${sql(options.tableName)} ${sql.insert(request).returning("*")}`
    })
  }).pipe(RequestResolver.withSpan(`${options.spanPrefix}.insertResolver`));
  const insertVoid = SqlResolver.void({
    Request: Model.insert,
    execute: request => sql`insert into ${sql(options.tableName)} ${sql.insert(request)}`
  }).pipe(RequestResolver.withSpan(`${options.spanPrefix}.insertVoidResolver`));
  const findById = SqlResolver.findById({
    Id: idSchema,
    Result: Model,
    ResultId(request) {
      return request[idColumn];
    },
    execute: ids => sql`select * from ${sql(options.tableName)} where ${sql.in(idColumn, ids)}`
  }).pipe(RequestResolver.withSpan(`${options.spanPrefix}.findByIdResolver`));
  const delete_ = SqlResolver.void({
    Request: idSchema,
    execute: ids => sql`delete from ${sql(options.tableName)} where ${sql.in(idColumn, ids)}`
  }).pipe(RequestResolver.withSpan(`${options.spanPrefix}.deleteResolver`));
  return {
    insert,
    insertVoid,
    findById,
    delete: delete_
  };
});
//# sourceMappingURL=SqlModel.js.map