/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
import * as Hash from "../../Hash.ts";
import * as Schema from "../../Schema.ts";
import { ShardId } from "./ShardId.ts";
declare const TypeId = "~effect/cluster/SingletonAddress";
declare const SingletonAddress_base: Schema.Class<SingletonAddress, Schema.Struct<{
    readonly shardId: Schema.declare<ShardId, ShardId>;
    readonly name: Schema.String;
}>, {}>;
/**
 * Represents the unique address of an singleton within the cluster.
 *
 * @since 4.0.0
 * @category Address
 */
export declare class SingletonAddress extends SingletonAddress_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/SingletonAddress";
    /**
     * @since 4.0.0
     */
    [Hash.symbol](): number;
    /**
     * @since 4.0.0
     */
    [Equal.symbol](that: SingletonAddress): boolean;
}
export {};
//# sourceMappingURL=SingletonAddress.d.ts.map