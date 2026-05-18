/**
 * Config Internal
 * ================
 *
 * The processed internal representation of a Command.Config declaration.
 * Separates the user's declared config shape from the flat parsing representation.
 *
 * Key concepts:
 * - ConfigInternal: The full processed form (flags, arguments, tree)
 * - ConfigInternal.Tree: Maps declaration keys to nodes
 * - ConfigInternal.Node: Param reference, Array, or Nested subtree
 *
 * Example transformation from Command.Config to Command.Config.Internal:
 *
 * ```ts
 * // User declares:
 * const config = {
 *   verbose: Flag.boolean("verbose"),
 *   server: {
 *     host: Flag.string("host"),
 *     port: Flag.integer("port")
 *   },
 *   files: Argument.string("files").pipe(Argument.variadic)
 * }
 *
 * // Becomes Config.Internal:
 * {
 *   arguments: [filesParam],           // Flat array of arguments
 *   flags: [verboseParam, hostParam, portParam],  // Flat array of flags
 *   orderedParams: [verboseParam, hostParam, portParam, filesParam],
 *   tree: {                            // Preserves nested structure
 *     verbose: { _tag: "Param", index: 0 },
 *     server: {
 *       _tag: "Nested",
 *       tree: {
 *         host: { _tag: "Param", index: 1 },
 *         port: { _tag: "Param", index: 2 }
 *       }
 *     },
 *     files: { _tag: "Param", index: 3 }
 *   }
 * }
 * ```
 *
 * This separation allows:
 * 1. Flat iteration over all params for parsing/validation
 * 2. Reconstruction of original nested shape for handler input
 */
import * as Predicate from "../../../Predicate.js";
import * as Param from "../Param.js";
/* ========================================================================== */
/* Type ID                                                                    */
/* ========================================================================== */
const ConfigInternalTypeId = "~effect/cli/Command/Config/Internal";
/* ========================================================================== */
/* Guards                                                                     */
/* ========================================================================== */
/** @internal */
export const isConfigInternal = u => Predicate.hasProperty(u, ConfigInternalTypeId);
/**
 * Parses a Command.Config into a ConfigInternal.
 *
 * Walks the config structure and:
 * 1. Extracts all Params into flat arrays (flags, arguments, orderedParams)
 * 2. Builds a tree that remembers the original nested structure
 * 3. Assigns each Param an index to link parsed values back
 *
 * @internal
 */
export const parseConfig = config => {
  const orderedParams = [];
  const flags = [];
  const args = [];
  function parse(config) {
    const tree = {};
    for (const key in config) {
      tree[key] = parseValue(config[key]);
    }
    return tree;
  }
  function parseValue(value) {
    if (Array.isArray(value)) {
      return {
        _tag: "Array",
        children: value.map(v => parseValue(v))
      };
    } else if (Param.isParam(value)) {
      const index = orderedParams.length;
      orderedParams.push(value);
      if (value.kind === "argument") {
        args.push(value);
      } else {
        flags.push(value);
      }
      return {
        _tag: "Param",
        index
      };
    } else {
      return {
        _tag: "Nested",
        tree: parse(value)
      };
    }
  }
  return {
    [ConfigInternalTypeId]: ConfigInternalTypeId,
    flags,
    arguments: args,
    orderedParams,
    tree: parse(config)
  };
};
/** @internal */
export const emptyConfig = /*#__PURE__*/parseConfig({});
const shiftNodeIndexes = (node, offset) => {
  switch (node._tag) {
    case "Param":
      return {
        _tag: "Param",
        index: node.index + offset
      };
    case "Array":
      return {
        _tag: "Array",
        children: node.children.map(child => shiftNodeIndexes(child, offset))
      };
    case "Nested":
      return {
        _tag: "Nested",
        tree: shiftTreeIndexes(node.tree, offset)
      };
  }
};
const shiftTreeIndexes = (tree, offset) => {
  const output = {};
  for (const key in tree) {
    output[key] = shiftNodeIndexes(tree[key], offset);
  }
  return output;
};
/** @internal */
export const mergeConfig = (left, right) => {
  const offset = left.orderedParams.length;
  return {
    [ConfigInternalTypeId]: ConfigInternalTypeId,
    flags: [...left.flags, ...right.flags],
    arguments: [...left.arguments, ...right.arguments],
    orderedParams: [...left.orderedParams, ...right.orderedParams],
    tree: {
      ...left.tree,
      ...shiftTreeIndexes(right.tree, offset)
    }
  };
};
/* ========================================================================== */
/* Reconstruction                                                             */
/* ========================================================================== */
/**
 * Reconstructs the original nested config shape from parsed values.
 *
 * Uses the tree as a blueprint to place each parsed value back into
 * its original position in the nested structure.
 *
 * @internal
 */
export const reconstructTree = (tree, results) => {
  const output = {};
  for (const key in tree) {
    output[key] = nodeValue(tree[key]);
  }
  return output;
  function nodeValue(node) {
    switch (node._tag) {
      case "Param":
        return results[node.index];
      case "Array":
        return node.children.map(child => nodeValue(child));
      case "Nested":
        return reconstructTree(node.tree, results);
    }
  }
};
//# sourceMappingURL=config.js.map