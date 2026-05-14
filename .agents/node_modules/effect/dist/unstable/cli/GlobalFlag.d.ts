/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type { LogLevel as LogLevelType } from "../../LogLevel.ts";
import * as Option from "../../Option.ts";
import type * as Command from "./Command.ts";
import * as Flag from "./Flag.ts";
/**
 * Context passed to action handlers.
 *
 * @since 4.0.0
 * @category models
 */
export interface HandlerContext {
    readonly command: Command.Command<any, unknown, any, unknown, unknown>;
    readonly commandPath: ReadonlyArray<string>;
    readonly version: string;
}
/**
 * Action flag: side effect + exit (--help, --version, --completions).
 *
 * @since 4.0.0
 * @category models
 */
export interface Action<A> {
    readonly _tag: "Action";
    readonly flag: Flag.Flag<A>;
    readonly run: (value: A, context: HandlerContext) => Effect.Effect<void>;
}
/**
 * Setting flag: configure command handler's environment (--log-level, --config).
 *
 * @since 4.0.0
 * @category models
 */
export interface Setting<Id extends string, A> extends Context.Service<Setting.Identifier<Id>, A> {
    readonly _tag: "Setting";
    readonly id: Id;
    readonly flag: Flag.Flag<A>;
}
/**
 * @since 4.0.0
 */
export declare namespace Setting {
    /**
     * @since 4.0.0
     * @category models
     */
    type Identifier<Id extends string> = `effect/unstable/cli/GlobalFlag/${Id}`;
}
/**
 * Global flag discriminated union.
 *
 * @since 4.0.0
 * @category models
 */
export type GlobalFlag<A> = Action<A> | Setting<any, A>;
/**
 * Creates an Action flag that performs a side effect and exits.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const action: <A>(options: {
    readonly flag: Flag.Flag<A>;
    readonly run: (value: A, context: HandlerContext) => Effect.Effect<void>;
}) => Action<A>;
/**
 * Creates a Setting flag that configures the command handler's environment.
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const setting: <const Id extends string>(id: Id) => <A>(options: {
    readonly flag: Flag.Flag<A>;
}) => Setting<Id, A>;
/**
 * The `--help` / `-h` global flag.
 * Shows help documentation for the command.
 *
 * @since 4.0.0
 * @category references
 */
export declare const Help: Action<boolean>;
/**
 * The `--version` global flag.
 * Shows version information for the command.
 *
 * @since 4.0.0
 * @category references
 */
export declare const Version: Action<boolean>;
/**
 * The `--completions` global flag.
 * Prints shell completion script for the given shell.
 *
 * @since 4.0.0
 * @category references
 */
export declare const Completions: Action<Option.Option<"bash" | "zsh" | "fish">>;
/**
 * The `--log-level` global flag.
 * Sets the minimum log level for the command.
 *
 * @since 4.0.0
 * @category references
 */
export declare const LogLevel: Setting<"log-level", Option.Option<LogLevelType>>;
/**
 * Built-in global flags in default precedence order.
 *
 * @since 4.0.0
 * @category references
 */
export declare const BuiltIns: ReadonlyArray<GlobalFlag<any>>;
/**
 * Built-in setting context identifiers.
 *
 * @since 4.0.0
 * @category models
 */
export type BuiltInSettingContext = Setting.Identifier<"log-level">;
//# sourceMappingURL=GlobalFlag.d.ts.map