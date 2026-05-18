/**
 * CommandDescriptor — pure-data representation of a command tree for
 * shell completion generation.
 *
 * @internal
 */
import * as Option from "../../../../Option.js";
import * as Param from "../../Param.js";
import * as Primitive from "../../Primitive.js";
import { toImpl } from "../command.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toFlagType = single => {
  const tag = single.primitiveType._tag;
  switch (tag) {
    case "Boolean":
      return {
        _tag: "Boolean"
      };
    case "Integer":
      return {
        _tag: "Integer"
      };
    case "Float":
      return {
        _tag: "Float"
      };
    case "Date":
      return {
        _tag: "Date"
      };
    case "Choice":
      {
        const keys = Primitive.getChoiceKeys(single.primitiveType);
        return {
          _tag: "Choice",
          values: keys ?? []
        };
      }
    case "Path":
      {
        const typeName = single.typeName;
        const pathType = typeName === "file" ? "file" : typeName === "directory" ? "directory" : "either";
        return {
          _tag: "Path",
          pathType
        };
      }
    default:
      return {
        _tag: "String"
      };
  }
};
const toArgumentType = single => {
  const tag = single.primitiveType._tag;
  switch (tag) {
    case "Integer":
      return {
        _tag: "Integer"
      };
    case "Float":
      return {
        _tag: "Float"
      };
    case "Date":
      return {
        _tag: "Date"
      };
    case "Choice":
      {
        const keys = Primitive.getChoiceKeys(single.primitiveType);
        return {
          _tag: "Choice",
          values: keys ?? []
        };
      }
    case "Path":
      {
        const typeName = single.typeName;
        const pathType = typeName === "file" ? "file" : typeName === "directory" ? "directory" : "either";
        return {
          _tag: "Path",
          pathType
        };
      }
    default:
      return {
        _tag: "String"
      };
  }
};
// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------
/** @internal */
export const fromCommand = cmd => {
  const impl = toImpl(cmd);
  const config = impl.config;
  const flags = [];
  for (const flag of config.flags) {
    const singles = Param.extractSingleParams(flag);
    for (const single of singles) {
      if (single.kind !== "flag") continue;
      flags.push({
        name: single.name,
        aliases: single.aliases,
        description: Option.getOrUndefined(single.description),
        type: toFlagType(single)
      });
    }
  }
  const args = [];
  for (const arg of config.arguments) {
    const singles = Param.extractSingleParams(arg);
    const metadata = Param.getParamMetadata(arg);
    for (const single of singles) {
      if (single.kind !== "argument") continue;
      args.push({
        name: single.name,
        description: Option.getOrUndefined(single.description),
        required: !metadata.isOptional,
        variadic: metadata.isVariadic,
        type: toArgumentType(single)
      });
    }
  }
  const subcommands = [];
  for (const group of cmd.subcommands) {
    for (const subcommand of group.commands) {
      subcommands.push(fromCommand(subcommand));
    }
  }
  return {
    name: cmd.name,
    description: cmd.shortDescription ?? cmd.description,
    flags,
    arguments: args,
    subcommands
  };
};
//# sourceMappingURL=descriptor.js.map