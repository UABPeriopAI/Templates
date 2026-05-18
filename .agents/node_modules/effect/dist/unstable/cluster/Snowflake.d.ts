/**
 * @since 4.0.0
 */
import type * as Brand from "../../Brand.ts";
import * as Context from "../../Context.ts";
import * as DateTime from "../../DateTime.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import * as Schema from "../../Schema.ts";
import type { MachineId } from "./MachineId.ts";
/**
 * @since 4.0.0
 */
export declare const TypeId = "~effect/cluster/Snowflake";
/**
 * @since 4.0.0
 */
export type TypeId = typeof TypeId;
/**
 * @since 4.0.0
 * @category Models
 */
export type Snowflake = Brand.Branded<bigint, TypeId>;
/**
 * @since 4.0.0
 * @category Models
 */
export declare const Snowflake: (input: string | bigint) => Snowflake;
/**
 * @since 4.0.0
 * @category Models
 */
export declare namespace Snowflake {
    /**
     * @since 4.0.0
     * @category Models
     */
    interface Parts {
        readonly timestamp: number;
        readonly machineId: MachineId;
        readonly sequence: number;
    }
    /**
     * @since 4.0.0
     * @category Models
     */
    interface Generator {
        readonly nextUnsafe: () => Snowflake;
        readonly setMachineId: (machineId: MachineId) => Effect.Effect<void>;
    }
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface SnowflakeFromBigInt extends Schema.brand<Schema.BigInt, TypeId> {
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const SnowflakeFromBigInt: SnowflakeFromBigInt;
/**
 * @since 4.0.0
 * @category Schemas
 */
export interface SnowflakeFromString extends Schema.decodeTo<SnowflakeFromBigInt, Schema.String> {
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export declare const SnowflakeFromString: SnowflakeFromString;
/**
 * @since 4.0.0
 * @category Epoch
 */
export declare const constEpochMillis: number;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options: {
    readonly machineId: MachineId;
    readonly sequence: number;
    readonly timestamp: number;
}) => Snowflake;
/**
 * @since 4.0.0
 * @category Parts
 */
export declare const timestamp: (snowflake: Snowflake) => number;
/**
 * @since 4.0.0
 * @category Parts
 */
export declare const dateTime: (snowflake: Snowflake) => DateTime.Utc;
/**
 * @since 4.0.0
 * @category Parts
 */
export declare const machineId: (snowflake: Snowflake) => MachineId;
/**
 * @since 4.0.0
 * @category Parts
 */
export declare const sequence: (snowflake: Snowflake) => number;
/**
 * @since 4.0.0
 * @category Parts
 */
export declare const toParts: (snowflake: Snowflake) => Snowflake.Parts;
/**
 * @since 4.0.0
 * @category Generator
 */
export declare const makeGenerator: Effect.Effect<Snowflake.Generator>;
declare const Generator_base: Context.ServiceClass<Generator, "effect/cluster/Snowflake/Generator", Snowflake.Generator>;
/**
 * @since 4.0.0
 * @category Generator
 */
export declare class Generator extends Generator_base {
}
/**
 * @since 4.0.0
 * @category Generator
 */
export declare const layerGenerator: Layer.Layer<Generator>;
export {};
//# sourceMappingURL=Snowflake.d.ts.map