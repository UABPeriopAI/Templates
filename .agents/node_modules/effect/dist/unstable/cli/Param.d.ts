import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import * as Option from "../../Option.ts";
import type * as Path from "../../Path.ts";
import { type Pipeable } from "../../Pipeable.ts";
import type * as Terminal from "../../Terminal.ts";
import type { Covariant } from "../../Types.ts";
import type { ChildProcessSpawner } from "../process/ChildProcessSpawner.ts";
import * as CliError from "./CliError.ts";
import * as Primitive from "./Primitive.ts";
import * as Prompt from "./Prompt.ts";
declare const TypeId = "~effect/cli/Param";
/**
 * @since 4.0.0
 * @category models
 */
export interface Param<Kind extends ParamKind, out A> extends Param.Variance<A> {
    readonly _tag: "Single" | "Map" | "Transform" | "Optional" | "Variadic";
    readonly kind: Kind;
    readonly parse: Parse<A>;
}
/**
 * @since 4.0.0
 * @category models
 */
export type ParamKind = "argument" | "flag";
/**
 * @since 4.0.0
 * @category models
 */
export type Environment = FileSystem.FileSystem | Path.Path | Terminal.Terminal | ChildProcessSpawner;
/**
 * Kind discriminator for positional argument parameters.
 *
 * @since 4.0.0
 * @category constants
 */
export declare const argumentKind: "argument";
/**
 * Kind discriminator for flag parameters.
 *
 * @since 4.0.0
 * @category constants
 */
export declare const flagKind: "flag";
/**
 * Represents any parameter.
 *
 * @since 4.0.0
 * @category models
 */
export type Any = Param<ParamKind, unknown>;
/**
 * Represents any positional argument parameter.
 *
 * @since 4.0.0
 * @category models
 */
export type AnyArgument = Param<typeof argumentKind, unknown>;
/**
 * Represents any flag parameter.
 *
 * @since 4.0.0
 * @category models
 */
export type AnyFlag = Param<typeof flagKind, unknown>;
/**
 * @since 4.0.0
 * @category models
 */
export type Parse<A> = (args: ParsedArgs) => Effect.Effect<readonly [leftover: ReadonlyArray<string>, value: A], CliError.CliError, Environment>;
/**
 * @since 4.0.0
 */
export declare namespace Param {
    /**
     * @since 4.0.0
     * @category models
     */
    interface Variance<out A> extends Pipeable {
        readonly [TypeId]: {
            readonly _A: Covariant<A>;
        };
    }
}
/**
 * Map of flag names to their provided string values.
 * Multiple occurrences of a flag produce multiple values.
 *
 * @since 4.0.0
 * @category models
 */
export type Flags = Record<string, ReadonlyArray<string>>;
/**
 * Input context passed to `Param.parse` implementations.
 * - `flags`: already-collected flag values by canonical flag name
 * - `arguments`: remaining positional arguments to be consumed
 *
 * @since 4.0.0
 * @category models
 */
export interface ParsedArgs {
    readonly flags: Flags;
    readonly arguments: ReadonlyArray<string>;
}
/**
 * Represents a fallback prompt that can either be provided directly or
 * computed effectfully when the parameter is missing.
 *
 * @since 4.0.0
 * @category models
 */
export type FallbackPrompt<A> = Prompt.Prompt<A> | Effect.Effect<Prompt.Prompt<A>, CliError.CliError, Environment>;
/**
 * @since 4.0.0
 * @category models
 */
export interface Single<Kind extends ParamKind, out A> extends Param<Kind, A> {
    readonly _tag: "Single";
    readonly kind: Kind;
    readonly name: string;
    readonly description: Option.Option<string>;
    readonly aliases: ReadonlyArray<string>;
    readonly primitiveType: Primitive.Primitive<A>;
    readonly typeName?: string | undefined;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Map<Kind extends ParamKind, in out A, out B> extends Param<Kind, B> {
    readonly _tag: "Map";
    readonly kind: Kind;
    readonly param: Param<Kind, A>;
    readonly f: (value: A) => B;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Transform<Kind extends ParamKind, in out A, out B> extends Param<Kind, B> {
    readonly _tag: "Transform";
    readonly kind: Kind;
    readonly param: Param<Kind, A>;
    readonly f: (parse: Parse<A>) => Parse<B>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Optional<Kind extends ParamKind, A> extends Param<Kind, Option.Option<A>> {
    readonly _tag: "Optional";
    readonly kind: Kind;
    readonly param: Param<Kind, A>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Variadic<Kind extends ParamKind, A> extends Param<Kind, ReadonlyArray<A>> {
    readonly _tag: "Variadic";
    readonly kind: Kind;
    readonly param: Param<Kind, A>;
    readonly min: Option.Option<number>;
    readonly max: Option.Option<number>;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeSingle: <const Kind extends ParamKind, A>(params: {
    readonly kind: Kind;
    readonly name: string;
    readonly primitiveType: Primitive.Primitive<A>;
    readonly typeName?: string | undefined;
    readonly description?: Option.Option<string> | undefined;
    readonly aliases?: ReadonlyArray<string> | undefined;
}) => Single<Kind, A>;
/**
 * Creates an optional option that returns None when not provided.
 *
 * Optional options never fail with MissingOption errors. If the option is not
 * provided on the command line, Option.none() is returned instead.
 *
 * @example
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // Create an optional port option
 * // - When not provided: returns Option.none()
 * // - When provided: returns Option.some(parsedValue)
 * const port = Param.optional(Param.integer(Param.flagKind, "port"))
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const optional: <Kind extends ParamKind, A>(param: Param<Kind, A>) => Param<Kind, Option.Option<A>>;
/**
 * Adds a fallback config that is loaded when a required parameter is missing.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withFallbackConfig: {
    /**
     * Adds a fallback config that is loaded when a required parameter is missing.
     *
     * @since 4.0.0
     * @category combinators
     */
    <B>(config: Config.Config<B>): <Kind extends ParamKind, A>(self: Param<Kind, A>) => Param<Kind, A | B>;
    /**
     * Adds a fallback config that is loaded when a required parameter is missing.
     *
     * @since 4.0.0
     * @category combinators
     */
    <Kind extends ParamKind, A, B>(self: Param<Kind, A>, config: Config.Config<B>): Param<Kind, A | B>;
};
/**
 * Adds a fallback prompt that is shown when a required parameter is missing.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withFallbackPrompt: {
    /**
     * Adds a fallback prompt that is shown when a required parameter is missing.
     *
     * @since 4.0.0
     * @category combinators
     */
    <B>(prompt: FallbackPrompt<B>): <Kind extends ParamKind, A>(self: Param<Kind, A>) => Param<Kind, A | B>;
    /**
     * Adds a fallback prompt that is shown when a required parameter is missing.
     *
     * @since 4.0.0
     * @category combinators
     */
    <Kind extends ParamKind, A, B>(self: Param<Kind, A>, prompt: FallbackPrompt<B>): Param<Kind, A | B>;
};
/**
 * Represent options which can be used to configure variadic parameters.
 *
 * @since 4.0.0
 * @category models
 */
export type VariadicParamOptions = {
    /**
     * The minimum number of times the parameter can be specified.
     */
    readonly min?: number | undefined;
    /**
     * The maximum number of times the parameter can be specified.
     */
    readonly max?: number | undefined;
};
export {};
//# sourceMappingURL=Param.d.ts.map