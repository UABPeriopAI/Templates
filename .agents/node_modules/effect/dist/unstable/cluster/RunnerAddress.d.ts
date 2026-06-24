/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
import * as Hash from "../../Hash.ts";
import { NodeInspectSymbol } from "../../Inspectable.ts";
import * as PrimaryKey from "../../PrimaryKey.ts";
import * as Schema from "../../Schema.ts";
declare const TypeId = "~effect/cluster/RunnerAddress";
declare const RunnerAddress_base: Schema.Class<RunnerAddress, Schema.Struct<{
    readonly host: Schema.String;
    readonly port: Schema.Number;
}>, {}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class RunnerAddress extends RunnerAddress_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/RunnerAddress";
    /**
     * @since 4.0.0
     */
    [Equal.symbol](that: RunnerAddress): boolean;
    /**
     * @since 4.0.0
     */
    [Hash.symbol](): number;
    /**
     * @since 4.0.0
     */
    [PrimaryKey.symbol](): string;
    /**
     * @since 4.0.0
     */
    toString(): string;
    /**
     * @since 4.0.0
     */
    [NodeInspectSymbol](): string;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (host: string, port: number) => RunnerAddress;
export {};
//# sourceMappingURL=RunnerAddress.d.ts.map