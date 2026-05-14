import * as Schema from "./Schema.ts";
/**
 * @since 4.0.0
 * @experimental
 */
export declare function getNativeClassSchema<C extends new (...args: any) => any, S extends Schema.Struct<Schema.Struct.Fields>>(constructor: C, options: {
    readonly encoding: S;
    readonly annotations?: Schema.Annotations.Declaration<InstanceType<C>>;
}): Schema.decodeTo<Schema.instanceOf<InstanceType<C>, S["Iso"]>, S>;
//# sourceMappingURL=SchemaUtils.d.ts.map