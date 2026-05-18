/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Deferred from "../../Deferred.js";
import * as Effect from "../../Effect.js";
import * as Fiber from "../../Fiber.js";
import * as Layer from "../../Layer.js";
import * as Metric from "../../Metric.js";
import * as Queue from "../../Queue.js";
import * as Schema from "../../Schema.js";
import * as Stream from "../../Stream.js";
import * as Tracer from "../../Tracer.js";
import * as Ndjson from "../encoding/Ndjson.js";
import * as Socket from "../socket/Socket.js";
import * as DevToolsSchema from "./DevToolsSchema.js";
const RequestSchema = /*#__PURE__*/Schema.toCodecJson(DevToolsSchema.Request);
const ResponseSchema = /*#__PURE__*/Schema.toCodecJson(DevToolsSchema.Response);
/**
 * @since 4.0.0
 * @category tags
 */
export class DevToolsClient extends /*#__PURE__*/Context.Service()("effect/devtools/DevToolsClient") {}
const makeEffect = /*#__PURE__*/Effect.gen(function* () {
  const socket = yield* Socket.Socket;
  const services = yield* Effect.context();
  const requests = yield* Queue.unbounded();
  const connected = yield* Deferred.make();
  const offerMetricsSnapshot = Effect.sync(() => {
    Queue.offerUnsafe(requests, toMetricsSnapshot(services));
  });
  const handleResponse = response => {
    switch (response._tag) {
      case "MetricsRequest":
        {
          return offerMetricsSnapshot;
        }
      case "Pong":
        {
          return Effect.void;
        }
    }
  };
  const fiber = yield* Stream.fromQueue(requests).pipe(Stream.pipeThroughChannel(Ndjson.duplexSchemaString(Socket.toChannelString(socket), {
    inputSchema: RequestSchema,
    outputSchema: ResponseSchema
  })), Stream.onFirst(() => Deferred.completeWith(connected, Effect.void)), Stream.runForEach(handleResponse), Effect.forkDetach);
  yield* Effect.addFinalizer(() => offerMetricsSnapshot.pipe(Effect.andThen(Effect.flatMap(Effect.fiberId, id => Queue.failCause(requests, Cause.interrupt(id)))), Effect.andThen(Fiber.await(fiber))));
  yield* Effect.suspend(() => Queue.offer(requests, {
    _tag: "Ping"
  })).pipe(Effect.delay("3 seconds"), Effect.forever, Effect.forkScoped);
  yield* Deferred.await(connected).pipe(Effect.timeoutOption("1 second"), Effect.asVoid);
  return DevToolsClient.of({
    sendUnsafe(request) {
      Queue.offerUnsafe(requests, request);
    }
  });
});
const toMetricsSnapshot = context => ({
  _tag: "MetricsSnapshot",
  metrics: Metric.snapshotUnsafe(context)
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/makeEffect.pipe(/*#__PURE__*/Effect.annotateLogs({
  module: "DevTools",
  service: "Client"
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = /*#__PURE__*/Layer.effect(DevToolsClient, make);
const makeTracerEffect = /*#__PURE__*/Effect.gen(function* () {
  const client = yield* DevToolsClient;
  const currentTracer = yield* Effect.tracer;
  return Tracer.make({
    span(options) {
      const span = currentTracer.span(options);
      client.sendUnsafe(span);
      const oldEvent = span.event;
      span.event = function (name, startTime, attributes) {
        client.sendUnsafe({
          _tag: "SpanEvent",
          traceId: span.traceId,
          spanId: span.spanId,
          name,
          startTime,
          attributes
        });
        return oldEvent.call(this, name, startTime, attributes);
      };
      const oldEnd = span.end;
      span.end = function (endTime, exit) {
        oldEnd.call(this, endTime, exit);
        client.sendUnsafe(span);
      };
      return span;
    },
    context: currentTracer.context
  });
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const makeTracer = /*#__PURE__*/makeTracerEffect.pipe(/*#__PURE__*/Effect.annotateLogs({
  module: "DevTools",
  service: "Tracer"
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerTracer = /*#__PURE__*/Layer.effect(Tracer.Tracer, makeTracer).pipe(/*#__PURE__*/Layer.provide(layer));
//# sourceMappingURL=DevToolsClient.js.map