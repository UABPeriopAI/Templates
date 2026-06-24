import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import * as FiberMap from "../../FiberMap.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as Workflow from "./Workflow.js";
/**
 * @since 4.0.0
 * @category Services
 */
export class WorkflowEngine extends /*#__PURE__*/Context.Service()("effect/workflow/WorkflowEngine") {}
/**
 * @since 4.0.0
 * @category Services
 */
export class WorkflowInstance extends /*#__PURE__*/Context.Service()("effect/workflow/WorkflowEngine/WorkflowInstance") {
  static initial(workflow, executionId) {
    return WorkflowInstance.of({
      executionId,
      workflow,
      scope: Scope.makeUnsafe(),
      suspended: false,
      interrupted: false,
      cause: undefined,
      activityState: {
        count: 0,
        latch: Latch.makeUnsafe()
      }
    });
  }
}
/**
 * @since 4.0.0
 * @category Constructors
 */
export const makeUnsafe = options => WorkflowEngine.of({
  register: Effect.fnUntraced(function* (workflow, execute) {
    const services = yield* Effect.context();
    yield* options.register(workflow, (payload, executionId) => Effect.suspend(() => execute(payload, executionId)).pipe(Effect.updateContext(input => Context.merge(services, input))));
  }),
  execute: Effect.fnUntraced(function* (self, opts) {
    const payload = opts.payload;
    const executionId = opts.executionId;
    const suspendedRetrySchedule = opts.suspendedRetrySchedule ?? defaultRetrySchedule;
    yield* Effect.annotateCurrentSpan({
      executionId
    });
    let result = Option.none();
    // link interruption with parent workflow
    const parentInstance = yield* Effect.serviceOption(WorkflowInstance);
    if (Option.isSome(parentInstance)) {
      const instance = parentInstance.value;
      yield* Effect.addFinalizer(() => {
        if (!instance.interrupted || Option.isSome(result) && result.value._tag === "Complete") {
          return Effect.void;
        }
        return options.interrupt(self, executionId);
      });
    }
    if (opts.discard) {
      yield* options.execute(self, {
        executionId,
        payload: payload,
        discard: true
      });
      return executionId;
    }
    const run = options.execute(self, {
      executionId,
      payload: payload,
      discard: false,
      parent: Option.getOrUndefined(parentInstance)
    });
    if (Option.isSome(parentInstance)) {
      const wrapped = yield* Workflow.wrapActivityResult(run, result => result._tag === "Suspended");
      result = Option.some(wrapped);
      if (wrapped._tag === "Suspended") {
        return yield* Workflow.suspend(parentInstance.value);
      }
      return yield* wrapped.exit;
    }
    let sleep;
    while (true) {
      const wrapped = yield* run;
      result = Option.some(wrapped);
      if (wrapped._tag === "Complete") {
        return yield* wrapped.exit;
      }
      sleep ??= (yield* Schedule.toStepWithSleep(suspendedRetrySchedule))(void 0).pipe(Effect.catch(() => Effect.die(`${self.name}.execute: suspendedRetrySchedule exhausted`)));
      yield* sleep;
    }
  }),
  poll: options.poll,
  interrupt: options.interrupt,
  interruptUnsafe: options.interruptUnsafe,
  resume: options.resume,
  activityExecute: Effect.fnUntraced(function* (activity, attempt) {
    const result = yield* options.activityExecute(activity, attempt);
    if (result._tag === "Suspended") {
      return result;
    }
    const exit = yield* Effect.orDie(Schema.decodeEffect(activity.exitSchema)(toJsonExit(result.exit)));
    return new Workflow.Complete({
      exit
    });
  }),
  deferredResult: Effect.fnUntraced(function* (deferred) {
    const instance = yield* WorkflowInstance;
    yield* Effect.annotateCurrentSpan({
      executionId: instance.executionId
    });
    const exit = yield* options.deferredResult(deferred);
    if (Option.isNone(exit)) {
      return Option.none();
    }
    return Option.some(yield* Effect.orDie(Schema.decodeEffect(deferred.exitSchema)(toJsonExit(exit.value))));
  }, Effect.withSpan("WorkflowEngine.deferredResult", deferred => ({
    attributes: {
      name: deferred.name
    }
  }), {
    captureStackTrace: false
  })),
  deferredDone: Effect.fnUntraced(function* (deferred, opts) {
    return yield* options.deferredDone({
      workflowName: opts.workflowName,
      executionId: opts.executionId,
      deferredName: opts.deferredName,
      exit: yield* Schema.encodeEffect(deferred.exitSchema)(opts.exit)
    });
  }, Effect.withSpan("WorkflowEngine.deferredDone", (_, {
    deferredName,
    executionId
  }) => ({
    attributes: {
      name: deferredName,
      executionId
    }
  }), {
    captureStackTrace: false
  })),
  scheduleClock: (workflow, opts) => options.scheduleClock(workflow, opts).pipe(Effect.withSpan("WorkflowEngine.scheduleClock", {
    attributes: {
      executionId: opts.executionId,
      name: opts.clock.name
    }
  }, {
    captureStackTrace: false
  }))
});
const defaultRetrySchedule = /*#__PURE__*/Schedule.exponential(200, 1.5).pipe(/*#__PURE__*/Schedule.either(/*#__PURE__*/Schedule.spaced(30000)));
/**
 * A in-memory implementation of the WorkflowEngine. This is useful for testing
 * and local development, but is not suitable for production use as it does not
 * provide durability guarantees.
 *
 * @since 4.0.0
 * @category Layers
 */
export const layerMemory = /*#__PURE__*/Layer.effect(WorkflowEngine)(/*#__PURE__*/Effect.gen(function* () {
  const scope = yield* Effect.scope;
  const workflows = new Map();
  const executions = new Map();
  const activities = new Map();
  const resume = Effect.fnUntraced(function* (executionId) {
    const state = executions.get(executionId);
    if (!state) return;
    const exit = state.fiber?.pollUnsafe();
    if (exit && exit._tag === "Success" && exit.value._tag === "Complete") {
      return;
    } else if (state.fiber && !exit) {
      return;
    }
    const entry = workflows.get(state.instance.workflow.name);
    const instance = WorkflowInstance.initial(state.instance.workflow, state.instance.executionId);
    instance.interrupted = state.instance.interrupted;
    state.instance = instance;
    state.fiber = yield* state.execute(state.payload, state.instance.executionId).pipe(Effect.onExit(() => {
      if (!instance.interrupted) {
        return Effect.void;
      }
      instance.suspended = false;
      return Effect.withFiber(fiber => Effect.interruptible(Fiber.interrupt(fiber)));
    }), Workflow.intoResult, Effect.provideService(WorkflowInstance, instance), Effect.provideService(WorkflowEngine, engine), Effect.tap(result => {
      if (!state.parent || result._tag !== "Complete") {
        return Effect.void;
      }
      return Effect.forkIn(resume(state.parent), scope);
    }), Effect.forkIn(entry.scope));
  });
  const deferredResults = new Map();
  const clocks = yield* FiberMap.make();
  const engine = makeUnsafe({
    register: Effect.fnUntraced(function* (workflow, execute) {
      workflows.set(workflow.name, {
        workflow,
        execute,
        scope: yield* Effect.scope
      });
    }),
    execute: Effect.fnUntraced(function* (workflow, options) {
      const entry = workflows.get(workflow.name);
      if (!entry) {
        return yield* Effect.orDie(Effect.fail(`Workflow ${workflow.name} is not registered`));
      }
      let state = executions.get(options.executionId);
      if (!state) {
        state = {
          payload: options.payload,
          execute: entry.execute,
          instance: WorkflowInstance.initial(workflow, options.executionId),
          fiber: undefined,
          parent: options.parent?.executionId
        };
        executions.set(options.executionId, state);
        yield* resume(options.executionId);
      }
      if (options.discard) return;
      return yield* Fiber.join(state.fiber);
    }),
    interrupt: Effect.fnUntraced(function* (_workflow, executionId) {
      const state = executions.get(executionId);
      if (!state) return;
      state.instance.interrupted = true;
      yield* resume(executionId);
    }),
    interruptUnsafe: Effect.fnUntraced(function* (_workflow, executionId) {
      const state = executions.get(executionId);
      if (!state) return;
      state.instance.interrupted = true;
      if (state.fiber) {
        yield* Fiber.interrupt(state.fiber);
      }
    }),
    resume(_workflow, executionId) {
      return resume(executionId);
    },
    activityExecute: Effect.fnUntraced(function* (activity, attempt) {
      const instance = yield* WorkflowInstance;
      const activityId = `${instance.executionId}/${activity.name}/${attempt}`;
      let state = activities.get(activityId);
      if (state) {
        const exit = state.exit;
        if (exit && exit._tag === "Success" && exit.value._tag === "Suspended") {
          state.exit = undefined;
        } else if (exit) {
          return yield* exit;
        }
      } else {
        state = {
          exit: undefined
        };
        activities.set(activityId, state);
      }
      const activityInstance = WorkflowInstance.initial(instance.workflow, instance.executionId);
      activityInstance.interrupted = instance.interrupted;
      return yield* activity.executeEncoded.pipe(Workflow.intoResult, Effect.provideService(WorkflowInstance, activityInstance), Effect.onExit(exit => {
        state.exit = exit;
        return Effect.void;
      }));
    }),
    poll: (_workflow, executionId) => Effect.suspend(() => {
      const state = executions.get(executionId);
      if (!state) {
        return Effect.succeedNone;
      }
      const exit = state.fiber?.pollUnsafe();
      if (!exit) {
        return Effect.succeedNone;
      }
      return exit._tag === "Success" ? Effect.succeedSome(exit.value) : Effect.die(exit.cause);
    }),
    deferredResult: Effect.fnUntraced(function* (deferred) {
      const instance = yield* WorkflowInstance;
      const id = `${instance.executionId}/${deferred.name}`;
      return Option.fromNullishOr(deferredResults.get(id));
    }),
    deferredDone: options => Effect.suspend(() => {
      const id = `${options.executionId}/${options.deferredName}`;
      if (deferredResults.has(id)) return Effect.void;
      deferredResults.set(id, options.exit);
      return resume(options.executionId);
    }),
    scheduleClock: (workflow, options) => engine.deferredDone(options.clock.deferred, {
      workflowName: workflow.name,
      executionId: options.executionId,
      deferredName: options.clock.deferred.name,
      exit: Exit.void
    }).pipe(Effect.delay(options.clock.duration), FiberMap.run(clocks, `${options.executionId}/${options.clock.name}`, {
      onlyIfMissing: true
    }), Effect.asVoid)
  });
  return engine;
}));
const toJsonExit = /*#__PURE__*/Exit.map(value => value ?? null);
//# sourceMappingURL=WorkflowEngine.js.map