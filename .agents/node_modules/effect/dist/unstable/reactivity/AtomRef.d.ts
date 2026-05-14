/**
 * @since 4.0.0
 */
import * as Equal from "../../Equal.ts";
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = "~effect/reactivity/AtomRef";
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category models
 */
export interface ReadonlyRef<A> extends Equal.Equal {
    readonly [TypeId]: TypeId;
    readonly key: string;
    readonly value: A;
    readonly subscribe: (f: (a: A) => void) => () => void;
    readonly map: <B>(f: (a: A) => B) => ReadonlyRef<B>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface AtomRef<A> extends ReadonlyRef<A> {
    readonly prop: <K extends keyof A>(prop: K) => AtomRef<A[K]>;
    readonly set: (value: A) => AtomRef<A>;
    readonly update: (f: (value: A) => A) => AtomRef<A>;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Collection<A> extends ReadonlyRef<ReadonlyArray<AtomRef<A>>> {
    readonly push: (item: A) => Collection<A>;
    readonly insertAt: (index: number, item: A) => Collection<A>;
    readonly remove: (ref: AtomRef<A>) => Collection<A>;
    readonly toArray: () => Array<A>;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: <A>(value: A) => AtomRef<A>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const collection: <A>(items: Iterable<A>) => Collection<A>;
//# sourceMappingURL=AtomRef.d.ts.map