/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
import type { Scheduler } from "../../Scheduler.ts";
import * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
import * as Result from "./AsyncResult.ts";
import type * as Atom from "./Atom.ts";
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = "~effect/reactivity/AtomRegistry";
/**
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: TypeId;
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isAtomRegistry: (u: unknown) => u is AtomRegistry;
/**
 * @since 4.0.0
 * @category models
 */
export interface AtomRegistry {
    readonly [TypeId]: TypeId;
    readonly scheduler: Scheduler;
    readonly schedulerAsync: Scheduler;
    readonly getNodes: () => ReadonlyMap<Atom.Atom<any> | string, Node<any>>;
    readonly get: <A>(atom: Atom.Atom<A>) => A;
    readonly mount: <A>(atom: Atom.Atom<A>) => () => void;
    readonly refresh: <A>(atom: Atom.Atom<A>) => void;
    readonly set: <R, W>(atom: Atom.Writable<R, W>, value: W) => void;
    readonly setSerializable: (key: string, encoded: unknown) => void;
    readonly modify: <R, W, A>(atom: Atom.Writable<R, W>, f: (_: R) => [returnValue: A, nextValue: W]) => A;
    readonly update: <R, W>(atom: Atom.Writable<R, W>, f: (_: R) => W) => void;
    readonly subscribe: <A>(atom: Atom.Atom<A>, f: (_: A) => void, options?: {
        readonly immediate?: boolean;
    }) => () => void;
    readonly reset: () => void;
    readonly dispose: () => void;
    onNodeAdded?: ((node: Node<any>) => void) | undefined;
    onNodeRemoved?: ((node: Node<any>) => void) | undefined;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Node<A> {
    readonly atom: Atom.Atom<A>;
    readonly value: () => A;
    parents: Array<Node<any>>;
    children: Array<Node<any>>;
    listeners: Set<() => void>;
    currentState(): "uninitialized" | "stale" | "valid" | "removed";
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (options?: {
    readonly initialValues?: Iterable<readonly [Atom.Atom<any>, any]> | undefined;
    readonly scheduleTask?: ((f: () => void) => () => void) | undefined;
    readonly timeoutResolution?: number | undefined;
    readonly defaultIdleTTL?: number | undefined;
} | undefined) => AtomRegistry;
/**
 * @since 4.0.0
 * @category Tags
 */
export declare const AtomRegistry: Context.Service<AtomRegistry, AtomRegistry>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layerOptions: (options?: {
    readonly initialValues?: Iterable<readonly [Atom.Atom<any>, any]> | undefined;
    readonly scheduleTask?: ((f: () => void) => () => void) | undefined;
    readonly timeoutResolution?: number | undefined;
    readonly defaultIdleTTL?: number | undefined;
}) => Layer.Layer<AtomRegistry>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<AtomRegistry>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toStream: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A>(atom: Atom.Atom<A>): (self: AtomRegistry) => Stream.Stream<A>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A>(self: AtomRegistry, atom: Atom.Atom<A>): Stream.Stream<A>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toStreamResult: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A, E>(atom: Atom.Atom<Result.AsyncResult<A, E>>): (self: AtomRegistry) => Stream.Stream<A, E>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A, E>(self: AtomRegistry, atom: Atom.Atom<Result.AsyncResult<A, E>>): Stream.Stream<A, E>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const getResult: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A, E>(atom: Atom.Atom<Result.AsyncResult<A, E>>, options?: {
        readonly suspendOnWaiting?: boolean | undefined;
    }): (self: AtomRegistry) => Effect.Effect<A, E>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A, E>(self: AtomRegistry, atom: Atom.Atom<Result.AsyncResult<A, E>>, options?: {
        readonly suspendOnWaiting?: boolean | undefined;
    }): Effect.Effect<A, E>;
};
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const mount: {
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A>(atom: Atom.Atom<A>): (self: AtomRegistry) => Effect.Effect<void, never, Scope.Scope>;
    /**
     * @since 4.0.0
     * @category Conversions
     */
    <A>(self: AtomRegistry, atom: Atom.Atom<A>): Effect.Effect<void, never, Scope.Scope>;
};
//# sourceMappingURL=AtomRegistry.d.ts.map