import type * as AtomRegistry from "./AtomRegistry.ts";
/**
 * @since 4.0.0
 * @category models
 */
export interface DehydratedAtom {
    readonly "~effect/reactivity/DehydratedAtom": true;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface DehydratedAtomValue extends DehydratedAtom {
    readonly key: string;
    readonly value: unknown;
    readonly dehydratedAt: number;
    readonly resultPromise?: Promise<unknown> | undefined;
}
/**
 * @since 4.0.0
 * @category dehydration
 */
export declare const dehydrate: (registry: AtomRegistry.AtomRegistry, options?: {
    /**
     * How to encode `AsyncResult.Initial` values. Default is "ignore".
     */
    readonly encodeInitialAs?: "ignore" | "promise" | "value-only" | undefined;
}) => Array<DehydratedAtom>;
/**
 * @since 4.0.0
 * @category dehydration
 */
export declare const toValues: (state: ReadonlyArray<DehydratedAtom>) => Array<DehydratedAtomValue>;
/**
 * @since 4.0.0
 * @category hydration
 */
export declare const hydrate: (registry: AtomRegistry.AtomRegistry, dehydratedState: Iterable<DehydratedAtom>) => void;
//# sourceMappingURL=Hydration.d.ts.map