/**
 * @since 4.0.0
 */
import type * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Exit from "../../Exit.ts";
import * as Latch from "../../Latch.ts";
import * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import * as Schedule from "../../Schedule.ts";
import * as Schema from "../../Schema.ts";
import * as Scope from "../../Scope.ts";
import type * as Activity from "./Activity.ts";
import type { DurableClock } from "./DurableClock.ts";
import type * as DurableDeferred from "./DurableDeferred.ts";
import * as Workflow from "./Workflow.ts";
declare const WorkflowEngine_base: Context.ServiceClass<WorkflowEngine, "effect/workflow/WorkflowEngine", {
    /**
     * Register a workflow with the engine.
     */
    readonly register: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top, R>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, execute: (payload: Payload["Type"], executionId: string) => Effect.Effect<Success["Type"], Error["Type"], R>) => Effect.Effect<void, never, Scope.Scope | Exclude<R, WorkflowEngine | WorkflowInstance | Workflow.Execution<Name> | Scope.Scope> | Payload["DecodingServices"] | Payload["EncodingServices"] | Success["DecodingServices"] | Success["EncodingServices"] | Error["DecodingServices"] | Error["EncodingServices"]>;
    /**
     * Execute a registered workflow.
     */
    readonly execute: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top, const Discard extends boolean = false>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, options: {
        readonly executionId: string;
        readonly payload: Payload["Type"];
        readonly discard?: Discard | undefined;
        readonly suspendedRetrySchedule?: Schedule.Schedule<any, unknown> | undefined;
    }) => Effect.Effect<Discard extends true ? string : Success["Type"], Error["Type"], Payload["EncodingServices"] | Success["DecodingServices"] | Error["DecodingServices"]>;
    /**
     * Execute a registered workflow.
     */
    readonly poll: <Name extends string, Payload extends Workflow.AnyStructSchema, Success extends Schema.Top, Error extends Schema.Top>(workflow: Workflow.Workflow<Name, Payload, Success, Error>, executionId: string) => Effect.Effect<Option.Option<Workflow.Result<Success["Type"], Error["Type"]>>, never, Success["DecodingServices"] | Error["DecodingServices"]>;
    /**
     * Interrupt a registered workflow.
     */
    readonly interrupt: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    /**
     * Unsafely interrupt a registered workflow, potentially ignoring
     * compensation finalizers and orphaning child workflows.
     */
    readonly interruptUnsafe: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    /**
     * Resume a registered workflow.
     */
    readonly resume: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    /**
     * Execute an activity from a workflow.
     */
    readonly activityExecute: <Success extends Schema.Top, Error extends Schema.Top, R>(activity: Activity.Activity<Success, Error, R>, attempt: number) => Effect.Effect<Workflow.Result<Success["Type"], Error["Type"]>, never, Success["DecodingServices"] | Error["DecodingServices"] | R | WorkflowInstance>;
    /**
     * Try to retrieve the result of an DurableDeferred
     */
    readonly deferredResult: <Success extends Schema.Top, Error extends Schema.Top>(deferred: DurableDeferred.DurableDeferred<Success, Error>) => Effect.Effect<Option.Option<Exit.Exit<Success["Type"], Error["Type"]>>, never, WorkflowInstance>;
    /**
     * Set the result of a DurableDeferred, and then resume any waiting
     * workflows.
     */
    readonly deferredDone: <Success extends Schema.Top, Error extends Schema.Top>(deferred: DurableDeferred.DurableDeferred<Success, Error>, options: {
        readonly workflowName: string;
        readonly executionId: string;
        readonly deferredName: string;
        readonly exit: Exit.Exit<Success["Type"], Error["Type"]>;
    }) => Effect.Effect<void, never, Success["EncodingServices"] | Error["EncodingServices"]>;
    /**
     * Schedule a wake up for a DurableClock
     */
    readonly scheduleClock: (workflow: Workflow.Any, options: {
        readonly executionId: string;
        readonly clock: DurableClock;
    }) => Effect.Effect<void>;
}>;
/**
 * @since 4.0.0
 * @category Services
 */
export declare class WorkflowEngine extends WorkflowEngine_base {
}
declare const WorkflowInstance_base: Context.ServiceClass<WorkflowInstance, "effect/workflow/WorkflowEngine/WorkflowInstance", {
    /**
     * The workflow execution ID.
     */
    readonly executionId: string;
    /**
     * The workflow definition.
     */
    readonly workflow: Workflow.Any;
    /**
     * A scope that represents the lifetime of the workflow.
     *
     * It is only closed when the workflow is completed.
     */
    readonly scope: Scope.Closeable;
    /**
     * Whether the workflow has requested to be suspended.
     */
    suspended: boolean;
    /**
     * Whether the workflow has requested to be interrupted.
     */
    interrupted: boolean;
    /**
     * When SuspendOnFailure is triggered, the cause of the failure is stored
     * here.
     */
    cause: Cause.Cause<never> | undefined;
    readonly activityState: {
        count: number;
        readonly latch: Latch.Latch;
    };
}>;
/**
 * @since 4.0.0
 * @category Services
 */
export declare class WorkflowInstance extends WorkflowInstance_base {
    static initial(workflow: Workflow.Any, executionId: string): WorkflowInstance["Service"];
}
/**
 * @since 4.0.0
 * @category Encoded
 */
export interface Encoded {
    readonly register: (workflow: Workflow.Any, execute: (payload: object, executionId: string) => Effect.Effect<unknown, unknown, WorkflowInstance | WorkflowEngine>) => Effect.Effect<void, never, Scope.Scope>;
    readonly execute: <const Discard extends boolean>(workflow: Workflow.Any, options: {
        readonly executionId: string;
        readonly payload: object;
        readonly discard: Discard;
        readonly parent?: WorkflowInstance["Service"] | undefined;
    }) => Effect.Effect<Discard extends true ? void : Workflow.Result<unknown, unknown>>;
    readonly poll: (workflow: Workflow.Any, executionId: string) => Effect.Effect<Option.Option<Workflow.Result<unknown, unknown>>>;
    readonly interrupt: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly interruptUnsafe: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly resume: (workflow: Workflow.Any, executionId: string) => Effect.Effect<void>;
    readonly activityExecute: (activity: Activity.Any, attempt: number) => Effect.Effect<Workflow.Result<unknown, unknown>, never, WorkflowInstance>;
    readonly deferredResult: (deferred: DurableDeferred.Any) => Effect.Effect<Option.Option<Exit.Exit<unknown, unknown>>, never, WorkflowInstance>;
    readonly deferredDone: (options: {
        readonly workflowName: string;
        readonly executionId: string;
        readonly deferredName: string;
        readonly exit: Exit.Exit<unknown, unknown>;
    }) => Effect.Effect<void>;
    readonly scheduleClock: (workflow: Workflow.Any, options: {
        readonly executionId: string;
        readonly clock: DurableClock;
    }) => Effect.Effect<void>;
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const makeUnsafe: (options: Encoded) => WorkflowEngine["Service"];
/**
 * A in-memory implementation of the WorkflowEngine. This is useful for testing
 * and local development, but is not suitable for production use as it does not
 * provide durability guarantees.
 *
 * @since 4.0.0
 * @category Layers
 */
export declare const layerMemory: Layer.Layer<WorkflowEngine>;
export {};
//# sourceMappingURL=WorkflowEngine.d.ts.map