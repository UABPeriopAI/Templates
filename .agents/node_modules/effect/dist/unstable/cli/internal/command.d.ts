/**
 * Command Implementation
 * ======================
 *
 * Internal implementation details for CLI commands.
 * Public API is in ../Command.ts
 */
import * as Arr from "../../../Array.ts";
import * as Context from "../../../Context.ts";
import * as Effect from "../../../Effect.ts";
import * as CliError from "../CliError.ts";
import type * as GlobalFlag from "../GlobalFlag.ts";
import type { FlagDoc, HelpDoc } from "../HelpDoc.ts";
import * as Param from "../Param.ts";
import { type ConfigInternal } from "./config.ts";
import type { Command, CommandContext, Environment, ParsedTokens } from "../Command.ts";
interface SubcommandGroup {
    readonly group: string | undefined;
    readonly commands: Arr.NonEmptyReadonlyArray<Command<any, unknown, any, unknown, unknown>>;
}
/**
 * Internal implementation interface with all the machinery.
 * Use toImpl() to access from internal code.
 */
export interface CommandInternal<Name extends string, Input, E, R, ContextInput> extends Command<Name, Input, ContextInput, E, R> {
    readonly config: ConfigInternal;
    readonly contextConfig: ConfigInternal;
    readonly service: Context.Key<CommandContext<Name>, ContextInput>;
    readonly annotations: Context.Context<never>;
    readonly globalFlags: ReadonlyArray<GlobalFlag.GlobalFlag<any>>;
    readonly parse: (input: ParsedTokens) => Effect.Effect<Input, CliError.CliError, Environment>;
    readonly parseContext: (input: ParsedTokens) => Effect.Effect<ContextInput, CliError.CliError, Environment>;
    readonly handle: (input: Input, commandPath: ReadonlyArray<string>) => Effect.Effect<void, E | CliError.CliError, R | Environment>;
    readonly buildHelpDoc: (commandPath: ReadonlyArray<string>) => HelpDoc;
}
export declare const TypeId: "~effect/cli/Command";
/**
 * Casts a Command to its internal implementation.
 * For use by internal modules that need access to config, parse, handle, etc.
 */
export declare const toImpl: <Name extends string, Input, E, R, ContextInput = {}>(self: Command<Name, Input, ContextInput, E, R>) => CommandInternal<Name, Input, E, R, ContextInput>;
export declare const Proto: {
    pipe(): unknown;
    asEffect(this: Command<any, any, any, any, any>): Effect.Effect<any, never, CommandContext<any>>;
    [Symbol.iterator](): any;
};
/**
 * Internal command constructor. Only accepts already-parsed ConfigInternal.
 */
export declare const makeCommand: <const Name extends string, Input, E, R, ContextInput = {}>(options: {
    readonly name: Name;
    readonly config: ConfigInternal;
    readonly contextConfig?: ConfigInternal | undefined;
    readonly service?: Context.Key<CommandContext<Name>, ContextInput> | undefined;
    readonly annotations?: Context.Context<never> | undefined;
    readonly globalFlags?: ReadonlyArray<GlobalFlag.GlobalFlag<any>> | undefined;
    readonly description?: string | undefined;
    readonly shortDescription?: string | undefined;
    readonly alias?: string | undefined;
    readonly examples?: ReadonlyArray<Command.Example> | undefined;
    readonly subcommands?: ReadonlyArray<SubcommandGroup> | undefined;
    readonly parse?: ((input: ParsedTokens) => Effect.Effect<Input, CliError.CliError, Environment>) | undefined;
    readonly parseContext?: ((input: ParsedTokens) => Effect.Effect<ContextInput, CliError.CliError, Environment>) | undefined;
    readonly handle?: ((input: Input, commandPath: ReadonlyArray<string>) => Effect.Effect<void, E, R | Environment>) | undefined;
}) => Command<Name, Input, ContextInput, E, R>;
/**
 * Converts a single flag param into a FlagDoc for help display.
 */
export declare const toFlagDoc: (single: Param.Single<typeof Param.flagKind, unknown>) => FlagDoc;
/**
 * Creates a parser for a given config. Used as the default for both `parse`
 * and `parseContext`, and also by `withSharedFlags` to avoid constructing a
 * full throwaway command.
 */
export declare const makeParser: (cfg: ConfigInternal) => (input: ParsedTokens) => Effect.Effect<Record<string, any>, CliError.CliError, Environment>;
/**
 * Checks for duplicate flag names between parent and child commands.
 */
export declare const checkForDuplicateFlags: <Name extends string, Input, ContextInput>(parent: Command<Name, Input, ContextInput, unknown, unknown>, subcommands: ReadonlyArray<Command<any, unknown, any, unknown, unknown>>, options?: {
    readonly contextConfig?: ConfigInternal | undefined;
} | undefined) => void;
export {};
//# sourceMappingURL=command.d.ts.map