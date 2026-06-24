/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
import * as Hash from "../../Hash.ts";
import * as Schema from "../../Schema.ts";
import { EntityId } from "./EntityId.ts";
import { EntityType } from "./EntityType.ts";
import { ShardId } from "./ShardId.ts";
declare const TypeId = "~effect/cluster/EntityAddress";
declare const EntityAddress_base: Schema.Class<EntityAddress, Schema.Struct<{
    readonly shardId: Schema.declare<ShardId, ShardId>;
    readonly entityType: Schema.brand<Schema.String, "~effect/cluster/EntityType">;
    readonly entityId: Schema.brand<Schema.String, "~effect/cluster/EntityId">;
}>, {}>;
/**
 * Represents the unique address of an entity within the cluster.
 *
 * @since 4.0.0
 * @category models
 */
export declare class EntityAddress extends EntityAddress_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cluster/EntityAddress";
    /**
     * @since 4.0.0
     */
    toString(): string;
    /**
     * @since 4.0.0
     */
    [Equal.symbol](that: EntityAddress): boolean;
    /**
     * @since 4.0.0
     */
    [Hash.symbol](): number;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options: {
    readonly shardId: ShardId;
    readonly entityType: EntityType;
    readonly entityId: EntityId;
}) => EntityAddress;
export {};
//# sourceMappingURL=EntityAddress.d.ts.map