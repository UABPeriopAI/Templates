/**
 * Command Implementation
 * ======================
 *
 * Internal implementation details for CLI commands.
 * Public API is in ../Command.ts
 */
import * as Arr from "../../../Array.js";
import * as Context from "../../../Context.js";
import * as Effect from "../../../Effect.js";
import { YieldableProto } from "../../../internal/core.js";
import * as Option from "../../../Option.js";
import { pipeArguments } from "../../../Pipeable.js";
import * as Predicate from "../../../Predicate.js";
import * as CliError from "../CliError.js";
import * as Param from "../Param.js";
import * as Primitive from "../Primitive.js";
import { emptyConfig, reconstructTree } from "./config.js";
/* ========================================================================== */
/* Type ID                                                                    */
/* ========================================================================== */
export const TypeId = "~effect/cli/Command";
/* ========================================================================== */
/* Casting                                                                    */
/* ========================================================================== */
/**
 * Casts a Command to its internal implementation.
 * For use by internal modules that need access to config, parse, handle, etc.
 */
export const toImpl = self => self;
/* ========================================================================== */
/* Proto                                                                      */
/* ========================================================================== */
export const Proto = {
  ...YieldableProto,
  pipe() {
    return pipeArguments(this, arguments);
  },
  asEffect() {
    return toImpl(this).service.asEffect();
  }
};
/* ========================================================================== */
/* Constructor                                                                */
/* ========================================================================== */
/**
 * Internal command constructor. Only accepts already-parsed ConfigInternal.
 */
export const makeCommand = options => {
  const config = options.config;
  const contextConfig = options.contextConfig ?? emptyConfig;
  const service = options.service ?? Context.Service(`${TypeId}/${options.name}`);
  const annotations = options.annotations ?? Context.empty();
  const globalFlags = options.globalFlags ?? [];
  const subcommands = options.subcommands ?? [];
  const handle = (input, commandPath) => Predicate.isNotUndefined(options.handle) ? options.handle(input, commandPath) : Effect.fail(new CliError.ShowHelp({
    commandPath,
    errors: []
  }));
  const parse = options.parse ?? makeParser(config);
  const parseContext = options.parseContext ?? makeParser(contextConfig);
  const buildHelpDoc = commandPath => {
    const args = [];
    const flags = [];
    for (const arg of config.arguments) {
      const singles = Param.extractSingleParams(arg);
      const metadata = Param.getParamMetadata(arg);
      for (const single of singles) {
        args.push({
          name: single.name,
          type: single.typeName ?? Primitive.getTypeName(single.primitiveType),
          description: single.description,
          required: !metadata.isOptional,
          variadic: metadata.isVariadic
        });
      }
    }
    let usage = commandPath.length > 0 ? commandPath.join(" ") : options.name;
    if (subcommands.some(group => group.commands.length > 0)) {
      usage += " <subcommand>";
    }
    usage += " [flags]";
    for (const arg of args) {
      const argName = arg.variadic ? `<${arg.name}...>` : `<${arg.name}>`;
      usage += ` ${arg.required ? argName : `[${argName}]`}`;
    }
    for (const option of config.flags) {
      const singles = Param.extractSingleParams(option);
      for (const single of singles) {
        flags.push(toFlagDoc(single));
      }
    }
    const subcommandDocs = [];
    for (const group of subcommands) {
      subcommandDocs.push({
        group: group.group,
        commands: Arr.map(group.commands, subcommand => ({
          name: subcommand.name,
          alias: subcommand.alias,
          shortDescription: subcommand.shortDescription,
          description: subcommand.description ?? ""
        }))
      });
    }
    const examples = options.examples ?? [];
    return {
      description: options.description ?? "",
      usage,
      flags,
      annotations,
      ...(args.length > 0 && {
        args
      }),
      ...(subcommandDocs.length > 0 && {
        subcommands: subcommandDocs
      }),
      ...(examples.length > 0 && {
        examples
      })
    };
  };
  return Object.assign(Object.create(Proto), {
    [TypeId]: TypeId,
    name: options.name,
    examples: options.examples ?? [],
    annotations,
    globalFlags,
    subcommands,
    config,
    contextConfig,
    service,
    parse,
    parseContext,
    handle,
    buildHelpDoc,
    ...(Predicate.isNotUndefined(options.description) ? {
      description: options.description
    } : {}),
    ...(Predicate.isNotUndefined(options.shortDescription) ? {
      shortDescription: options.shortDescription
    } : {}),
    ...(Predicate.isNotUndefined(options.alias) ? {
      alias: options.alias
    } : {})
  });
};
/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */
/**
 * Converts a single flag param into a FlagDoc for help display.
 */
export const toFlagDoc = single => {
  const formattedAliases = single.aliases.map(alias => alias.length === 1 ? `-${alias}` : `--${alias}`);
  return {
    name: single.name,
    aliases: formattedAliases,
    type: single.typeName ?? Primitive.getTypeName(single.primitiveType),
    description: appendChoiceKeys(single.description, Primitive.getChoiceKeys(single.primitiveType)),
    required: single.primitiveType._tag !== "Boolean"
  };
};
const appendChoiceKeys = (description, choiceKeys) => {
  if (choiceKeys === undefined || choiceKeys.length === 0) {
    return description;
  }
  const choiceSuffix = `(choices: ${choiceKeys.join(", ")})`;
  return Option.match(description, {
    onNone: () => Option.some(choiceSuffix),
    onSome: value => Option.some(`${value} ${choiceSuffix}`)
  });
};
/**
 * Creates a parser for a given config. Used as the default for both `parse`
 * and `parseContext`, and also by `withSharedFlags` to avoid constructing a
 * full throwaway command.
 */
export const makeParser = cfg => Effect.fnUntraced(function* (input) {
  const parsedArgs = {
    flags: input.flags,
    arguments: input.arguments
  };
  const values = yield* parseParams(parsedArgs, cfg.orderedParams);
  return reconstructTree(cfg.tree, values);
});
/**
 * Parses param values from parsed command arguments into their typed
 * representations.
 */
const parseParams = /*#__PURE__*/Effect.fnUntraced(function* (parsedArgs, params) {
  const results = [];
  let currentArguments = parsedArgs.arguments;
  for (const option of params) {
    const [remainingArguments, parsed] = yield* option.parse({
      flags: parsedArgs.flags,
      arguments: currentArguments
    });
    results.push(parsed);
    currentArguments = remainingArguments;
  }
  return results;
});
/**
 * Checks for duplicate flag names between parent and child commands.
 */
export const checkForDuplicateFlags = (parent, subcommands, options) => {
  const parentImpl = toImpl(parent);
  const parentOptionNames = new Set();
  const extractNames = flags => {
    for (const option of flags) {
      const singles = Param.extractSingleParams(option);
      for (const single of singles) {
        parentOptionNames.add(single.name);
      }
    }
  };
  extractNames((options?.contextConfig ?? parentImpl.contextConfig).flags);
  for (const subcommand of subcommands) {
    const subImpl = toImpl(subcommand);
    for (const option of subImpl.config.flags) {
      const singles = Param.extractSingleParams(option);
      for (const single of singles) {
        if (parentOptionNames.has(single.name)) {
          throw new CliError.DuplicateOption({
            option: single.name,
            parentCommand: parent.name,
            childCommand: subcommand.name
          });
        }
      }
    }
  }
};
//# sourceMappingURL=command.js.map