/**
 * @since 1.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Schema from "../../Schema.ts";
import * as Getter from "../../SchemaGetter.ts";
declare const Collector_base: Context.ServiceClass<Collector, "effect/workers/Transferable/Collector", {
    readonly addAll: (_: Iterable<globalThis.Transferable>) => Effect.Effect<void>;
    readonly addAllUnsafe: (_: Iterable<globalThis.Transferable>) => void;
    readonly read: Effect.Effect<Array<globalThis.Transferable>>;
    readonly readUnsafe: () => Array<globalThis.Transferable>;
    readonly clearUnsafe: () => Array<globalThis.Transferable>;
    readonly clear: Effect.Effect<Array<globalThis.Transferable>>;
}>;
/**
 * @since 1.0.0
 * @category models
 */
export declare class Collector extends Collector_base {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const makeCollectorUnsafe: () => Collector["Service"];
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const makeCollector: Effect.Effect<Collector["Service"]>;
/**
 * @since 1.0.0
 * @category accessors
 */
export declare const addAll: (tranferables: Iterable<globalThis.Transferable>) => Effect.Effect<void>;
/**
 * @since 1.0.0
 * @category Getter
 */
export declare const getterAddAll: <A>(f: (_: A) => Iterable<globalThis.Transferable>) => Getter.Getter<A, A>;
/**
 * @since 1.0.0
 * @category schema
 */
export interface Transferable<S extends Schema.Top> extends Schema.decodeTo<Schema.toType<S["Rebuild"]>, S["Rebuild"]> {
}
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: {
    /**
     * @since 1.0.0
     * @category schema
     */
    <S extends Schema.Top>(f: (_: S["Encoded"]) => Iterable<globalThis.Transferable>): (self: S) => Transferable<S>;
    /**
     * @since 1.0.0
     * @category schema
     */
    <S extends Schema.Top>(self: S, f: (_: S["Encoded"]) => Iterable<globalThis.Transferable>): Transferable<S>;
};
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ImageData: Transferable<Schema.declare<ImageData>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const MessagePort: Transferable<Schema.declare<MessagePort>>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const Uint8Array: Transferable<Schema.instanceOf<globalThis.Uint8Array<ArrayBuffer>>>;
export {};
//# sourceMappingURL=Transferable.d.ts.map