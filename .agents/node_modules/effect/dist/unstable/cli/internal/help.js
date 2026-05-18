/**
 * Help Documentation
 * ================
 *
 * Internal helpers for generating help documentation.
 * Extracted from command.ts to avoid circular dependencies.
 */
import * as Effect from "../../../Effect.js";
import * as Param from "../Param.js";
import { toFlagDoc, toImpl } from "./command.js";
const dedupeGlobalFlags = flags => {
  const seen = new Set();
  const deduped = [];
  for (const flag of flags) {
    if (seen.has(flag)) {
      continue;
    }
    seen.add(flag);
    deduped.push(flag);
  }
  return deduped;
};
/**
 * Returns the resolved command lineage for the provided path.
 * Includes the root command as the first element.
 */
export const getCommandsForCommandPath = (command, commandPath) => {
  const commands = [command];
  let currentCommand = command;
  for (let i = 1; i < commandPath.length; i++) {
    const subcommandName = commandPath[i];
    let subcommand = undefined;
    for (const group of currentCommand.subcommands) {
      subcommand = group.commands.find(sub => sub.name === subcommandName);
      if (subcommand) {
        break;
      }
    }
    if (!subcommand) {
      break;
    }
    commands.push(subcommand);
    currentCommand = subcommand;
  }
  return commands;
};
/**
 * Returns active global flags for a command path.
 * Built-ins are prepended and declarations are collected root -> leaf.
 */
export const getGlobalFlagsForCommandPath = (command, commandPath, builtIns) => {
  const commands = getCommandsForCommandPath(command, commandPath);
  const declared = commands.flatMap(current => toImpl(current).globalFlags);
  return dedupeGlobalFlags([...builtIns, ...declared]);
};
const collectDeclaredGlobalFlags = command => {
  const collected = [];
  const visit = current => {
    const impl = toImpl(current);
    for (const flag of impl.globalFlags) {
      collected.push(flag);
    }
    for (const group of current.subcommands) {
      for (const subcommand of group.commands) {
        visit(subcommand);
      }
    }
  };
  visit(command);
  return dedupeGlobalFlags(collected);
};
const getSharedFlagsForCommandPath = (commands, currentFlags) => {
  if (commands.length <= 1) {
    return [];
  }
  const seen = new Set(currentFlags.map(flag => flag.name));
  const sharedFlags = [];
  for (const ancestor of commands.slice(0, -1)) {
    const ancestorImpl = toImpl(ancestor);
    for (const flag of ancestorImpl.contextConfig.flags) {
      const singles = Param.extractSingleParams(flag);
      for (const single of singles) {
        if (seen.has(single.name)) {
          continue;
        }
        seen.add(single.name);
        sharedFlags.push(toFlagDoc(single));
      }
    }
  }
  return sharedFlags;
};
/**
 * Returns all global flags declared in a command tree.
 * Built-ins are prepended and command declarations are deduplicated by identity.
 */
export const getGlobalFlagsForCommandTree = (command, builtIns) => dedupeGlobalFlags([...builtIns, ...collectDeclaredGlobalFlags(command)]);
/**
 * Helper function to get help documentation for a specific command path.
 * Navigates through the command hierarchy to find the right command.
 * Reads active global flags for the path and includes them in the help doc.
 */
export const getHelpForCommandPath = (command, commandPath, builtIns) => Effect.gen(function* () {
  const commands = getCommandsForCommandPath(command, commandPath);
  const currentCommand = commands.length > 0 ? commands[commands.length - 1] : command;
  const baseDoc = toImpl(currentCommand).buildHelpDoc(commandPath);
  const sharedFlags = getSharedFlagsForCommandPath(commands, baseDoc.flags);
  const flags = getGlobalFlagsForCommandPath(command, commandPath, builtIns);
  const globalFlagDocs = [];
  for (const flag of flags) {
    const singles = Param.extractSingleParams(flag.flag);
    for (const single of singles) {
      globalFlagDocs.push({
        ...toFlagDoc(single),
        required: false
      });
    }
  }
  return {
    ...baseDoc,
    flags: [...sharedFlags, ...baseDoc.flags],
    globalFlags: globalFlagDocs
  };
});
//# sourceMappingURL=help.js.map