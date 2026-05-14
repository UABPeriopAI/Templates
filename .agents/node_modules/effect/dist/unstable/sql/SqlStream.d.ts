import * as Effect from "../../Effect.ts";
import type * as Scope from "../../Scope.ts";
import * as Stream from "../../Stream.ts";
/**
 * @since 4.0.0
 */
export declare const asyncPauseResume: <A, E = never, R = never>(register: (emit: {
    readonly single: (item: A) => void;
    readonly array: (arr: ReadonlyArray<A>) => void;
    readonly fail: (error: E) => void;
    readonly end: () => void;
}) => Effect.Effect<{
    onPause(): void;
    onResume(): void;
}, E, R | Scope.Scope>, bufferSize?: number) => Stream.Stream<A, E, R>;
//# sourceMappingURL=SqlStream.d.ts.map