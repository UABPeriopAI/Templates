import * as Effect from "../../Effect.ts";
import * as Exit from "../../Exit.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Schedule from "../../Schedule.ts";
import * as Schema from "../../Schema.ts";
import type * as Scope from "../../Scope.ts";
import * as Activity from "../workflow/Activity.ts";
import * as DurableClock from "../workflow/DurableClock.ts";
import * as DurableDeferred from "../workflow/DurableDeferred.ts";
import * as Workflow from "../workflow/Workflow.ts";
import * as WorkflowEngine from "../workflow/WorkflowEngine.ts";
import { MessageStorage } from "./MessageStorage.ts";
import * as Sharding from "./Sharding.ts";
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: Effect.Effect<{
    readonly register: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top, R>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, execute: (payload: Payload["Type"], executionId: string) => Effect.Effect<Success["Type"], Error["Type"], R>) => Effect.Effect<void, never, Scope.Scope | Exclude<R, WorkflowEngine.WorkflowEngine | WorkflowEngine.WorkflowInstance | Workflow.Execution<Name> | Scope.Scope> | Payload["DecodingServices"] | Payload["EncodingServices"] | Success["DecodingServices"] | Success["EncodingServices"] | Error["DecodingServices"] | Error["EncodingServices"]>;
    readonly execute: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top, const Discard extends boolean = false>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, options: {
        readonly executionId: string;
        readonly payload: Payload["Type"];
        readonly discard?: Discard | undefined;
        readonly suspendedRetrySchedule?: Schedule.Schedule<any, unknown> | undefined;
    }) => Effect.Effect<Discard extends true ? string : Success["Type"], Error["Type"], Payload["EncodingServices"] | Success["DecodingServices"] | Error["DecodingServices"]>;
    readonly poll: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, executionId: string) => Effect.Effect<Option.Option<Workflow.Result<Success["Type"], Error["Type"]>>, never, Success["DecodingServices"] | Error["DecodingServices"]>;
    readonly interrupt: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly interruptUnsafe: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly resume: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly activityExecute: <Success extends Schema.Top, Error extends Schema.Top, R>(activity: Activity.Activity<Success, Error, R>, attempt: number) => Effect.Effect<Workflow.Result<Success["Type"], Error["Type"]>, never, Success["DecodingServices"] | Error["DecodingServices"] | R | WorkflowEngine.WorkflowInstance>;
    readonly deferredResult: <Success extends Schema.Top, Error extends Schema.Top>(deferred: DurableDeferred.DurableDeferred<Success, Error>) => Effect.Effect<Option.Option<Exit.Exit<Success["Type"], Error["Type"]>>, never, WorkflowEngine.WorkflowInstance>;
    readonly deferredDone: <Success extends Schema.Top, Error extends Schema.Top>(deferred: DurableDeferred.DurableDeferred<Success, Error>, options: {
        readonly workflowName: string;
        readonly executionId: string;
        readonly deferredName: string;
        readonly exit: Exit.Exit<Success["Type"], Error["Type"]>;
    }) => Effect.Effect<void, never, Success["EncodingServices"] | Error["EncodingServices"]>;
    readonly scheduleClock: (workflow: Workflow.Any, options: {
        readonly executionId: string;
        readonly clock: DurableClock.DurableClock;
    }) => Effect.Effect<void>;
}, never, Scope.Scope | MessageStorage | Sharding.Sharding>;
/**
 * @since 4.0.0
 * @category Layers
 */
export declare const layer: Layer.Layer<WorkflowEngine.WorkflowEngine, never, Sharding.Sharding | MessageStorage>;
//# sourceMappingURL=ClusterWorkflowEngine.d.ts.map