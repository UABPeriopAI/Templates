/**
 * @since 4.0.0
 */
import * as Cron from "../../Cron.js";
import * as DateTime from "../../DateTime.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as Rpc from "../rpc/Rpc.js";
import * as ClusterSchema from "./ClusterSchema.js";
import { Persisted, Uninterruptible } from "./ClusterSchema.js";
import * as DeliverAt from "./DeliverAt.js";
import * as Entity from "./Entity.js";
import * as Singleton from "./Singleton.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => {
  const CronEntity = Entity.make(`ClusterCron/${options.name}`, [Rpc.make("run", {
    payload: CronPayload
  }).annotate(Persisted, true).annotate(Uninterruptible, true)]).annotate(ClusterSchema.ShardGroup, () => options.shardGroup ?? "default").annotate(ClusterSchema.ClientTracingEnabled, false);
  const InitialRun = Singleton.make(`ClusterCron/${options.name}`, Effect.gen(function* () {
    const now = yield* DateTime.now;
    const next = DateTime.fromDateUnsafe(Cron.next(options.cron, now));
    const entityId = options.calculateNextRunFromPrevious ? "initial" : DateTime.formatIso(next);
    const client = (yield* CronEntity.client)(entityId);
    yield* client.run({
      dateTime: next
    }, {
      discard: true
    });
  }), {
    shardGroup: options.shardGroup
  });
  const skipIfOlderThan = Option.fromUndefinedOr(options.skipIfOlderThan).pipe(Option.map(Duration.fromInputUnsafe), Option.getOrElse(() => Duration.days(1)));
  const effect = Effect.fnUntraced(function* (dateTime) {
    const now = yield* DateTime.now;
    if (DateTime.isLessThan(dateTime, DateTime.subtractDuration(now, skipIfOlderThan))) {
      return;
    }
    return yield* options.execute;
  }, Effect.orDie);
  const EntityLayer = CronEntity.toLayer(Effect.gen(function* () {
    const makeClient = yield* CronEntity.client;
    return {
      run: request => Effect.onExitPrimitive(effect(request.payload.dateTime), Effect.fnUntraced(function* (exit) {
        if (Exit.isFailure(exit)) {
          yield* Effect.logWarning(exit.cause);
        }
        const now = yield* DateTime.now;
        const next = DateTime.fromDateUnsafe(Cron.next(options.cron, options.calculateNextRunFromPrevious ? request.payload.dateTime : now));
        const client = makeClient(DateTime.formatIso(next));
        return yield* client.run({
          dateTime: next
        }, {
          discard: true
        }).pipe(Effect.tapCause(cause => Effect.logWarning("Failed to schedule next run, retrying", cause)), Effect.sandbox, Effect.retry(retryPolicy), Effect.orDie);
      }), true).pipe(Effect.annotateLogs({
        module: "effect/cluster/ClusterCron",
        name: options.name,
        dateTime: request.payload.dateTime
      }))
    };
  }));
  return Layer.merge(InitialRun, EntityLayer);
};
const retryPolicy = /*#__PURE__*/Schedule.exponential(200, 1.5).pipe(/*#__PURE__*/Schedule.either(/*#__PURE__*/Schedule.spaced("1 minute")));
class CronPayload extends /*#__PURE__*/Schema.Class("effect/cluster/ClusterCron/CronPayload")({
  dateTime: Schema.DateTimeUtc
}) {
  [PrimaryKey.symbol]() {
    return "";
  }
  [DeliverAt.symbol]() {
    return this.dateTime;
  }
}
//# sourceMappingURL=ClusterCron.js.map