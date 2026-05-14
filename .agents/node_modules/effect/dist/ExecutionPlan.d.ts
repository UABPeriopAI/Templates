/**
 * @since 3.16.0
 */
import type { NonEmptyReadonlyArray } from "./Array.ts";
import * as Context from "./Context.ts";
import type * as Effect from "./Effect.ts";
import * as Layer from "./Layer.ts";
import type { Pipeable } from "./Pipeable.ts";
import type * as Schedule from "./Schedule.ts";
/**
 * @since 3.16.0
 * @category Type IDs
 */
export type TypeId = "~effect/ExecutionPlan";
/**
 * @since 3.16.0
 * @category Type IDs
 */
export declare const TypeId: TypeId;
/**
 * @since 3.16.0
 * @category Guards
 */
export declare const isExecutionPlan: (u: unknown) => u is ExecutionPlan<any>;
/**
 * A `ExecutionPlan` can be used with `Effect.withExecutionPlan` or `Stream.withExecutionPlan`, allowing you to provide different resources for each step of execution until the effect succeeds or the plan is exhausted.
 *
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect, ExecutionPlan, Schedule } from "effect"
 * import type { LanguageModel } from "effect/unstable/ai"
 *
 * declare const layerBad: Layer.Layer<LanguageModel.LanguageModel>
 * declare const layerGood: Layer.Layer<LanguageModel.LanguageModel>
 *
 * const ThePlan = ExecutionPlan.make(
 *   {
 *     // First try with the bad layer 2 times with a 3 second delay between attempts
 *     provide: layerBad,
 *     attempts: 2,
 *     schedule: Schedule.spaced(3000)
 *   },
 *   // Then try with the bad layer 3 times with a 1 second delay between attempts
 *   {
 *     provide: layerBad,
 *     attempts: 3,
 *     schedule: Schedule.spaced(1000)
 *   },
 *   // Finally try with the good layer.
 *   //
 *   // If `attempts` is omitted, the plan will only attempt once, unless a schedule is provided.
 *   {
 *     provide: layerGood
 *   }
 * )
 *
 * declare const effect: Effect.Effect<
 *   void,
 *   never,
 *   LanguageModel.LanguageModel
 * >
 * const withPlan: Effect.Effect<void> = Effect.withExecutionPlan(effect, ThePlan)
 * ```
 *
 * @since 3.16.0
 * @category Models
 */
export interface ExecutionPlan<Config extends {
    provides: any;
    input: any;
    error: any;
    requirements: any;
}> extends Pipeable {
    readonly [TypeId]: TypeId;
    readonly steps: NonEmptyReadonlyArray<{
        readonly provide: Context.Context<Config["provides"]> | Layer.Layer<Config["provides"], Config["error"], Config["requirements"]>;
        readonly attempts?: number | undefined;
        readonly while?: ((input: Config["input"]) => Effect.Effect<boolean, Config["error"], Config["requirements"]>) | undefined;
        readonly schedule?: Schedule.Schedule<any, Config["input"], Config["requirements"]> | undefined;
    }>;
    /**
     * Returns an equivalent `ExecutionPlan` with the requirements satisfied,
     * using the current context.
     */
    readonly withRequirements: Effect.Effect<ExecutionPlan<{
        provides: Config["provides"];
        input: Config["input"];
        error: Config["error"];
        requirements: never;
    }>, never, Config["requirements"]>;
}
/**
 * @since 3.16.0
 * @category Models
 */
export type ConfigBase = {
    provides: any;
    input: any;
    error: any;
    requirements: any;
};
/**
 * Create an `ExecutionPlan`, which can be used with `Effect.withExecutionPlan` or `Stream.withExecutionPlan`, allowing you to provide different resources for each step of execution until the effect succeeds or the plan is exhausted.
 *
 * ```ts
 * import type { Layer } from "effect"
 * import { Effect, ExecutionPlan, Schedule } from "effect"
 * import type { LanguageModel } from "effect/unstable/ai"
 *
 * declare const layerBad: Layer.Layer<LanguageModel.LanguageModel>
 * declare const layerGood: Layer.Layer<LanguageModel.LanguageModel>
 *
 * const ThePlan = ExecutionPlan.make(
 *   {
 *     // First try with the bad layer 2 times with a 3 second delay between attempts
 *     provide: layerBad,
 *     attempts: 2,
 *     schedule: Schedule.spaced(3000)
 *   },
 *   // Then try with the bad layer 3 times with a 1 second delay between attempts
 *   {
 *     provide: layerBad,
 *     attempts: 3,
 *     schedule: Schedule.spaced(1000)
 *   },
 *   // Finally try with the good layer.
 *   //
 *   // If `attempts` is omitted, the plan will only attempt once, unless a schedule is provided.
 *   {
 *     provide: layerGood
 *   }
 * )
 *
 * declare const effect: Effect.Effect<
 *   void,
 *   never,
 *   LanguageModel.LanguageModel
 * >
 * const withPlan: Effect.Effect<void> = Effect.withExecutionPlan(effect, ThePlan)
 * ```
 *
 * @since 3.16.0
 * @category Constructors
 */
export declare const make: <const Steps extends NonEmptyReadonlyArray<make.Step>>(...steps: Steps & { [K in keyof Steps]: make.Step; }) => ExecutionPlan<{
    provides: make.StepProvides<Steps>;
    input: make.StepInput<Steps>;
    error: (Steps[number]["provide"] extends Context.Context<infer _P> | Layer.Layer<infer _P, infer E, infer _R> ? E : never) | (Steps[number]["while"] extends (input: infer _I) => Effect.Effect<infer _A, infer _E, infer _R_1> ? _E : never);
    requirements: (Steps[number]["provide"] extends Layer.Layer<infer _A_1, infer _E_1, infer R> ? R : never) | (Steps[number]["while"] extends (input: infer _I) => Effect.Effect<infer _A_1, infer _E_2, infer R_1> ? R_1 : never) | (Steps[number]["schedule"] extends Schedule.Schedule<infer _O, infer _I, infer R_2> ? R_2 : never);
}>;
/**
 * @since 3.16.0
 */
export declare namespace make {
    /**
     * @since 3.16.0
     */
    type Step = {
        readonly provide: Context.Context<any> | Context.Context<never> | Layer.Any;
        readonly attempts?: number | undefined;
        readonly while?: ((input: any) => boolean | Effect.Effect<boolean, any, any>) | undefined;
        readonly schedule?: Schedule.Schedule<any, any, any> | undefined;
    };
    /**
     * @since 3.16.1
     */
    type StepProvides<Steps extends ReadonlyArray<any>, Out = unknown> = Steps extends readonly [infer Step, ...infer Rest] ? StepProvides<Rest, Out & ((Step extends {
        readonly provide: Context.Context<infer P> | Layer.Layer<infer P, infer _E, infer _R>;
    } ? P : unknown))> : Out;
    /**
     * @since 3.16.1
     */
    type PlanProvides<Plans extends ReadonlyArray<any>, Out = unknown> = Plans extends readonly [infer Plan, ...infer Rest] ? PlanProvides<Rest, Out & (Plan extends ExecutionPlan<infer T> ? T["provides"] : unknown)> : Out;
    /**
     * @since 3.16.0
     */
    type StepInput<Steps extends ReadonlyArray<any>, Out = unknown> = Steps extends readonly [infer Step, ...infer Rest] ? StepInput<Rest, Out & ((Step extends {
        readonly while: (input: infer I) => infer _;
    } ? I : unknown) & (Step extends {
        readonly schedule: Schedule.Schedule<infer _O, infer I, infer _R>;
    } ? I : unknown))> : Out;
    /**
     * @since 3.16.0
     */
    type PlanInput<Plans extends ReadonlyArray<any>, Out = unknown> = Plans extends readonly [infer Plan, ...infer Rest] ? PlanInput<Rest, Out & (Plan extends ExecutionPlan<infer T> ? T["input"] : unknown)> : Out;
}
/**
 * @since 3.16.0
 * @category Combining
 */
export declare const merge: <const Plans extends NonEmptyReadonlyArray<ExecutionPlan<any>>>(...plans: Plans) => ExecutionPlan<{
    provides: make.PlanProvides<Plans>;
    input: make.PlanInput<Plans>;
    error: Plans[number] extends ExecutionPlan<infer T> ? T["error"] : never;
    requirements: Plans[number] extends ExecutionPlan<infer T> ? T["requirements"] : never;
}>;
/**
 * @since 4.0.0
 * @category Metadata
 */
export interface Metadata {
    readonly attempt: number;
    readonly stepIndex: number;
}
/**
 * @since 4.0.0
 * @category Metadata
 */
export declare const CurrentMetadata: Context.Reference<Metadata>;
//# sourceMappingURL=ExecutionPlan.d.ts.map