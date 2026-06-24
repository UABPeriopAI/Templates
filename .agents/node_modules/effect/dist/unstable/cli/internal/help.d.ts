/**
 * Help Documentation
 * ================
 *
 * Internal helpers for generating help documentation.
 * Extracted from command.ts to avoid circular dependencies.
 */
import * as Effect from "../../../Effect.ts";
import type { Command } from "../Command.ts";
import type * as GlobalFlag from "../GlobalFlag.ts";
import type { HelpDoc } from "../HelpDoc.ts";
/**
 * Returns the resolved command lineage for the provided path.
 * Includes the root command as the first element.
 */
export declare const getCommandsForCommandPath: <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, commandPath: ReadonlyArray<string>) => ReadonlyArray<Command.Any>;
/**
 * Returns active global flags for a command path.
 * Built-ins are prepended and declarations are collected root -> leaf.
 */
export declare const getGlobalFlagsForCommandPath: <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, commandPath: ReadonlyArray<string>, builtIns: ReadonlyArray<GlobalFlag.GlobalFlag<any>>) => ReadonlyArray<GlobalFlag.GlobalFlag<any>>;
/**
 * Returns all global flags declared in a command tree.
 * Built-ins are prepended and command declarations are deduplicated by identity.
 */
export declare const getGlobalFlagsForCommandTree: <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, builtIns: ReadonlyArray<GlobalFlag.GlobalFlag<any>>) => ReadonlyArray<GlobalFlag.GlobalFlag<any>>;
/**
 * Helper function to get help documentation for a specific command path.
 * Navigates through the command hierarchy to find the right command.
 * Reads active global flags for the path and includes them in the help doc.
 */
export declare const getHelpForCommandPath: <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, commandPath: ReadonlyArray<string>, builtIns: ReadonlyArray<GlobalFlag.GlobalFlag<any>>) => Effect.Effect<HelpDoc, never, never>;
//# sourceMappingURL=help.d.ts.map