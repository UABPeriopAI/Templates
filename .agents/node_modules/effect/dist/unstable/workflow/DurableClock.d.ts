import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import type * as Schema from "../../Schema.ts";
import * as DurableDeferred from "./DurableDeferred.ts";
import type { WorkflowEngine, WorkflowInstance } from "./WorkflowEngine.ts";
declare const TypeId = "~effect/workflow/DurableClock";
/**
 * @since 4.0.0
 * @category Models
 */
export interface DurableClock {
    readonly [TypeId]: typeof TypeId;
    readonly name: string;
    readonly duration: Duration.Duration;
    readonly deferred: DurableDeferred.DurableDeferred<typeof Schema.Void>;
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly name: string;
    readonly duration: Duration.Input;
}) => DurableClock;
/**
 * @since 1.0.0
 * @category Sleeping
 */
export declare const sleep: (options: {
    readonly name: string;
    readonly duration: Duration.Input;
    /**
     * If the duration is less than or equal to this threshold, the clock will
     * be executed in memory.
     *
     * Defaults to 60 seconds.
     */
    readonly inMemoryThreshold?: Duration.Input | undefined;
}) => Effect.Effect<void, never, WorkflowEngine | WorkflowInstance>;
export {};
//# sourceMappingURL=DurableClock.d.ts.map