/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
import * as Hash from "../../Hash.ts";
import { NodeInspectSymbol } from "../../Inspectable.ts";
import * as Schema from "../../Schema.ts";
import { RunnerAddress } from "./RunnerAddress.ts";
declare const TypeId = "~effect/cluster/Runner";
declare const Runner_base: Schema.Class<Runner, Schema.Struct<{
    readonly address: typeof RunnerAddress;
    readonly groups: Schema.$Array<Schema.String>;
    readonly weight: Schema.Number;
}>, {}>;
/**
 * A `Runner` represents a physical application server that is capable of running
 * entities.
 *
 * Because a Runner represents a physical application server, a Runner must have a
 * unique `address` which can be used to communicate with the server.
 *
 * The version of a Runner is used during rebalancing to give priority to newer
 * application servers and slowly decommission older ones.
 *
 * @since 4.0.0
 * @category models
 */
export declare class Runner extends Runner_base {
    /**
     * @since 4.0.0
     */
    static format: import("../../Formatter.ts").Formatter<Runner, string>;
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/Runner";
    /**
     * @since 4.0.0
     */
    static readonly decodeSync: (input: string, options?: import("../../SchemaAST.ts").ParseOptions) => Runner;
    /**
     * @since 4.0.0
     */
    static readonly encodeSync: (input: Runner, options?: import("../../SchemaAST.ts").ParseOptions) => string;
    /**
     * @since 4.0.0
     */
    toString(): string;
    /**
     * @since 4.0.0
     */
    [NodeInspectSymbol](): string;
    /**
     * @since 4.0.0
     */
    [Equal.symbol](that: Runner): boolean;
    /**
     * @since 4.0.0
     */
    [Hash.symbol](): number;
}
/**
 * A `Runner` represents a physical application server that is capable of running
 * entities.
 *
 * Because a Runner represents a physical application server, a Runner must have a
 * unique `address` which can be used to communicate with the server.
 *
 * The version of a Runner is used during rebalancing to give priority to newer
 * application servers and slowly decommission older ones.
 *
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (props: {
    readonly address: RunnerAddress;
    readonly groups: ReadonlyArray<string>;
    readonly weight: number;
}) => Runner;
export {};
//# sourceMappingURL=Runner.d.ts.map