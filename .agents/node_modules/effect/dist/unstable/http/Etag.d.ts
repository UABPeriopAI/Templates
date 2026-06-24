/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import * as Layer from "../../Layer.ts";
import type * as Body from "./HttpBody.ts";
/**
 * @since 4.0.0
 * @category models
 */
export type Etag = Weak | Strong;
/**
 * @since 4.0.0
 * @category models
 */
export interface Weak {
    readonly _tag: "Weak";
    readonly value: string;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Strong {
    readonly _tag: "Strong";
    readonly value: string;
}
/**
 * @since 4.0.0
 * @category convertions
 */
export declare const toString: (self: Etag) => string;
declare const Generator_base: Context.ServiceClass<Generator, "effect/http/Etag/Generator", {
    readonly fromFileInfo: (info: FileSystem.File.Info) => Effect.Effect<Etag>;
    readonly fromFileWeb: (file: Body.HttpBody.FileLike) => Effect.Effect<Etag>;
}>;
/**
 * @since 4.0.0
 * @category models
 */
export declare class Generator extends Generator_base {
}
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<Generator>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerWeak: Layer.Layer<Generator>;
export {};
//# sourceMappingURL=Etag.d.ts.map