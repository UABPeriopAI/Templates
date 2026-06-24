import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Schema from "../../Schema.ts";
declare const Redis_base: Context.ServiceClass<Redis, "effect/persistence/Redis", {
    readonly send: <A = unknown>(command: string, ...args: ReadonlyArray<string>) => Effect.Effect<A, RedisError>;
    readonly eval: <Config extends {
        readonly params: ReadonlyArray<unknown>;
        readonly result: unknown;
    }>(script: Script<Config>) => (...params: Config["params"]) => Effect.Effect<Config["result"], RedisError>;
}>;
/**
 * @since 4.0.0
 * @category Service
 */
export declare class Redis extends Redis_base {
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly send: <A = unknown>(command: string, ...args: ReadonlyArray<string>) => Effect.Effect<A, RedisError>;
}) => Effect.Effect<{
    readonly send: <A = unknown>(command: string, ...args: ReadonlyArray<string>) => Effect.Effect<A, RedisError>;
    readonly eval: <Config extends {
        readonly params: ReadonlyArray<unknown>;
        readonly result: unknown;
    }>(script: Script<Config>) => (...params: Config["params"]) => Effect.Effect<Config["result"], RedisError>;
}, never, never>;
type ErrorTypeId = "~effect/persistence/Redis/RedisError";
declare const ErrorTypeId: ErrorTypeId;
declare const RedisError_base: Schema.Class<RedisError, Schema.Struct<{
    readonly _tag: Schema.tag<"RedisError">;
    readonly cause: Schema.Defect;
}>, import("../../Cause.ts").YieldableError>;
/**
 * @since 4.0.0
 * @category Errors
 */
export declare class RedisError extends RedisError_base {
    /**
     * @since 4.0.0
     */
    readonly [ErrorTypeId]: ErrorTypeId;
}
type ScriptTypeId = "~effect/persistence/Redis/Script";
declare const ScriptTypeId: ScriptTypeId;
/**
 * @since 4.0.0
 * @category Scripting
 */
export interface Script<Config extends {
    readonly params: ReadonlyArray<unknown>;
    readonly result: unknown;
}> {
    readonly [ScriptTypeId]: {
        readonly params: Config["params"];
        readonly result: Config["result"];
    };
    readonly lua: string;
    readonly params: (...params: Config["params"]) => ReadonlyArray<unknown>;
    readonly numberOfKeys: (...params: Config["params"]) => number;
    /**
     * Set the return type of the script.
     */
    withReturnType<Result>(): Script<{
        params: Config["params"];
        result: Result;
    }>;
}
/**
 * @since 4.0.0
 * @category Scripting
 */
export declare const script: <Params extends ReadonlyArray<any>>(f: (...params: Params) => ReadonlyArray<unknown>, options: {
    readonly lua: string;
    readonly numberOfKeys: number | ((...params: Params) => number);
}) => Script<{
    params: Params;
    result: void;
}>;
export {};
//# sourceMappingURL=Redis.d.ts.map