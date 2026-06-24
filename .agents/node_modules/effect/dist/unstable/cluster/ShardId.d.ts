/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
import * as Hash from "../../Hash.ts";
import * as PrimaryKey from "../../PrimaryKey.ts";
import * as S from "../../Schema.ts";
declare const TypeId = "~effect/cluster/ShardId";
/**
 * @since 4.0.0
 * @category Models
 */
export interface ShardId extends Equal.Equal, Hash.Hash, PrimaryKey.PrimaryKey {
    readonly [TypeId]: typeof TypeId;
    readonly group: string;
    readonly id: number;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isShardId: (u: unknown) => u is ShardId;
/**
 * @since 4.0.0
 * @category Schema
 */
export declare const ShardId: S.declare<ShardId, ShardId>;
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (group: string, id: number) => ShardId;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toString: (shardId: {
    readonly group: string;
    readonly id: number;
}) => string;
/**
 * @since 4.0.0
 */
export declare function fromStringEncoded(s: string): {
    readonly group: string;
    readonly id: number;
};
/**
 * @since 4.0.0
 */
export declare function fromString(s: string): ShardId;
export {};
//# sourceMappingURL=ShardId.d.ts.map