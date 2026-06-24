import * as Effect from "../../Effect.ts";
import { FileSystem } from "../../FileSystem.ts";
import * as Client from "./SqlClient.ts";
import type { SqlError } from "./SqlError.ts";
/**
 * @category model
 * @since 4.0.0
 */
export interface MigratorOptions<R = never> {
    readonly loader: Loader<R>;
    readonly schemaDirectory?: string;
    readonly table?: string;
}
/**
 * @category model
 * @since 4.0.0
 */
export type Loader<R = never> = Effect.Effect<ReadonlyArray<ResolvedMigration>, MigrationError, R>;
/**
 * @category model
 * @since 4.0.0
 */
export type ResolvedMigration = readonly [
    id: number,
    name: string,
    load: Effect.Effect<any, any, Client.SqlClient>
];
/**
 * @category model
 * @since 4.0.0
 */
export interface Migration {
    readonly id: number;
    readonly name: string;
    readonly createdAt: Date;
}
declare const MigrationError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "MigrationError";
} & Readonly<A>;
/**
 * @category errors
 * @since 4.0.0
 */
export declare class MigrationError extends MigrationError_base<{
    readonly _tag: "MigrationError";
    readonly cause?: unknown;
    readonly kind: "BadState" | "ImportError" | "Failed" | "Duplicates" | "Locked";
    readonly message: string;
}> {
}
/**
 * @category constructor
 * @since 4.0.0
 */
export declare const make: <RD = never>({ dumpSchema }: {
    dumpSchema?: (path: string, migrationsTable: string) => Effect.Effect<void, MigrationError, RD>;
}) => <R2 = never>({ loader, schemaDirectory, table }: MigratorOptions<R2>) => Effect.Effect<ReadonlyArray<readonly [id: number, name: string]>, MigrationError | SqlError, Client.SqlClient | RD | R2>;
/**
 * @since 4.0.0
 * @category loaders
 */
export declare const fromGlob: (migrations: Record<string, () => Promise<any>>) => Loader;
/**
 * @since 4.0.0
 * @category loaders
 */
export declare const fromBabelGlob: (migrations: Record<string, any>) => Loader;
/**
 * @since 4.0.0
 * @category loaders
 */
export declare const fromRecord: (migrations: Record<string, Effect.Effect<void, unknown, Client.SqlClient>>) => Loader;
/**
 * @since 4.0.0
 * @category loaders
 */
export declare const fromFileSystem: (directory: string) => Loader<FileSystem>;
export {};
//# sourceMappingURL=Migrator.d.ts.map