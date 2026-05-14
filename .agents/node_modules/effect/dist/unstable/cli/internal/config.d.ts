import * as Param from "../Param.ts";
declare const ConfigInternalTypeId: "~effect/cli/Command/Config/Internal";
/**
 * The processed internal representation of a Command.Config declaration.
 *
 * Created by parsing the user's config. Separates parameters by type
 * while preserving the original nested structure via the tree.
 */
export interface ConfigInternal {
    readonly [ConfigInternalTypeId]: typeof ConfigInternalTypeId;
    /** The command's positional argument parameters. */
    readonly arguments: ReadonlyArray<Param.AnyArgument>;
    /** The command's flag parameters. */
    readonly flags: ReadonlyArray<Param.AnyFlag>;
    /** All parameters in declaration order. */
    readonly orderedParams: ReadonlyArray<Param.Any>;
    /** Tree structure for reconstructing nested config. */
    readonly tree: ConfigInternal.Tree;
}
/**
 * @since 4.0.0
 */
export declare namespace ConfigInternal {
    /**
     * Maps declaration keys to their node representations.
     * Preserves the shape of the user's config object.
     */
    interface Tree {
        [key: string]: Node;
    }
    /**
     * A node in the config tree.
     *
     * - Param: References a parameter by index in orderedParams
     * - Array: Contains child nodes for tuple/array declarations
     * - Nested: Contains a subtree for nested config objects
     */
    type Node = {
        readonly _tag: "Param";
        readonly index: number;
    } | {
        readonly _tag: "Array";
        readonly children: ReadonlyArray<Node>;
    } | {
        readonly _tag: "Nested";
        readonly tree: Tree;
    };
}
export {};
//# sourceMappingURL=config.d.ts.map