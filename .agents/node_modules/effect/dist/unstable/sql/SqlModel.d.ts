/**
 * @since 4.0.0
 * @category models
 */
import type * as Cause from "../../Cause.ts";
import * as Effect from "../../Effect.ts";
import * as RequestResolver from "../../RequestResolver.ts";
import type * as Schema from "../../Schema.ts";
import type { Scope } from "../../Scope.ts";
import type * as Model from "../schema/Model.ts";
import { SqlClient } from "./SqlClient.ts";
import type { ResultLengthMismatch, SqlError } from "./SqlError.ts";
import * as SqlResolver from "./SqlResolver.ts";
/**
 * Create a simple CRUD repository from a model.
 *
 * @since 4.0.0
 * @category repository
 */
export declare const makeRepository: <S extends Model.Any, Id extends (keyof S["Type"]) & (keyof S["update"]["Type"]) & (keyof S["fields"])>(Model: S, options: {
    readonly tableName: string;
    readonly spanPrefix: string;
    readonly idColumn: Id;
}) => Effect.Effect<{
    readonly insert: (insert: S["insert"]["Type"]) => Effect.Effect<S["Type"], Schema.SchemaError | SqlError, S["DecodingServices"] | S["insert"]["EncodingServices"]>;
    readonly insertVoid: (insert: S["insert"]["Type"]) => Effect.Effect<void, Schema.SchemaError | SqlError, S["insert"]["EncodingServices"]>;
    readonly update: (update: S["update"]["Type"]) => Effect.Effect<S["Type"], Schema.SchemaError | SqlError, S["DecodingServices"] | S["update"]["EncodingServices"]>;
    readonly updateVoid: (update: S["update"]["Type"]) => Effect.Effect<void, Schema.SchemaError | SqlError, S["update"]["EncodingServices"]>;
    readonly findById: (id: S["fields"][Id]["Type"]) => Effect.Effect<S["Type"], Cause.NoSuchElementError | Schema.SchemaError | SqlError, S["DecodingServices"] | S["fields"][Id]["EncodingServices"]>;
    readonly delete: (id: S["fields"][Id]["Type"]) => Effect.Effect<void, Schema.SchemaError | SqlError, S["fields"][Id]["EncodingServices"]>;
}, never, SqlClient>;
/**
 * Create some simple data loaders from a model.
 *
 * @since 4.0.0
 * @category repository
 */
export declare const makeResolvers: <S extends Model.Any, Id extends (keyof S["Type"]) & (keyof S["update"]["Type"]) & (keyof S["fields"])>(Model: S, options: {
    readonly tableName: string;
    readonly spanPrefix: string;
    readonly idColumn: Id;
}) => Effect.Effect<{
    readonly insert: RequestResolver.RequestResolver<SqlResolver.SqlRequest<S["insert"]["Type"], S["Type"], ResultLengthMismatch | SqlError, S["insert"]["EncodingServices"]>>;
    readonly insertVoid: RequestResolver.RequestResolver<SqlResolver.SqlRequest<S["insert"]["Type"], void, SqlError, S["insert"]["EncodingServices"]>>;
    readonly findById: RequestResolver.RequestResolver<SqlResolver.SqlRequest<S["fields"][Id]["Type"], S["Type"], Cause.NoSuchElementError | SqlError, S["DecodingServices"] | S["fields"][Id]["EncodingServices"]>>;
    readonly delete: RequestResolver.RequestResolver<SqlResolver.SqlRequest<S["fields"][Id]["Type"], void, SqlError, S["fields"][Id]["EncodingServices"]>>;
}, never, SqlClient | Scope>;
//# sourceMappingURL=SqlModel.d.ts.map