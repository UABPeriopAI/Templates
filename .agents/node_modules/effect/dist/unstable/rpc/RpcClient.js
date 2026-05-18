import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import { constVoid, dual, flow, identity } from "../../Function.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Pool from "../../Pool.js";
import * as Queue from "../../Queue.js";
import * as Result from "../../Result.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as Stream from "../../Stream.js";
import * as Headers from "../http/Headers.js";
import * as HttpBody from "../http/HttpBody.js";
import * as HttpClient from "../http/HttpClient.js";
import { HttpClientErrorSchema } from "../http/HttpClientError.js";
import * as HttpClientRequest from "../http/HttpClientRequest.js";
import * as Socket from "../socket/Socket.js";
import * as Transferable from "../workers/Transferable.js";
import * as Worker from "../workers/Worker.js";
import * as Rpc from "./Rpc.js";
import { RpcClientDefect, RpcClientError } from "./RpcClientError.js";
import { constPing, RequestId } from "./RpcMessage.js";
import * as RpcSchema from "./RpcSchema.js";
import * as RpcSerialization from "./RpcSerialization.js";
import * as RpcWorker from "./RpcWorker.js";
import { withRunClient } from "./Utils.js";
let requestIdCounter = /*#__PURE__*/BigInt(0);
/**
 * @since 4.0.0
 * @category client
 */
export const makeNoSerialization = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const spanPrefix = options?.spanPrefix ?? "RpcClient";
  const supportsAck = options?.supportsAck ?? true;
  const disableTracing = options?.disableTracing ?? false;
  const generateRequestId = options?.generateRequestId ?? (() => requestIdCounter++);
  const services = yield* Effect.context();
  const scope = Context.get(services, Scope.Scope);
  const entries = new Map();
  let isShutdown = false;
  yield* Scope.addFinalizer(scope, Effect.withFiber(parent => {
    isShutdown = true;
    return clearEntries(Exit.interrupt(parent.id));
  }));
  const clearEntries = Effect.fnUntraced(function* (exit) {
    for (const [id, entry] of entries) {
      entries.delete(id);
      if (entry._tag === "Queue") {
        yield* exit._tag === "Success" ? Queue.end(entry.queue) : Queue.failCause(entry.queue, exit.cause);
      } else {
        entry.resume(exit);
      }
    }
  });
  const onRequest = rpc => {
    const isStream = RpcSchema.isStreamSchema(rpc.successSchema);
    const middleware = getRpcClientMiddleware(rpc);
    return (payload, opts) => {
      const headers = opts?.headers ? Headers.fromInput(opts.headers) : Headers.empty;
      const context = opts?.context ?? Context.empty();
      if (!isStream) {
        const onRequest = span => onEffectRequest(rpc, middleware, span, rpc.payloadSchema.make(payload), headers, context, opts?.discard ?? false);
        return disableTracing ? onRequest(undefined) : Effect.useSpan(`${spanPrefix}.${rpc._tag}`, {
          attributes: options.spanAttributes
        }, onRequest);
      }
      const queue = onStreamRequest(rpc, middleware, rpc.payloadSchema.make(payload), headers, opts?.streamBufferSize ?? 16, context);
      if (opts?.asQueue) return queue;
      return Stream.unwrap(Effect.map(queue, Stream.fromQueue));
    };
  };
  const onEffectRequest = (rpc, middleware, span, payload, headers, context, discard) => Effect.withFiber(parentFiber => {
    if (isShutdown) {
      return Effect.interrupt;
    }
    const id = generateRequestId();
    const send = middleware(message => options.onFromClient({
      message,
      context,
      discard
    }), {
      _tag: "Request",
      id,
      tag: rpc._tag,
      payload,
      ...(span ? {
        traceId: span.traceId,
        spanId: span.spanId,
        sampled: span.sampled
      } : {}),
      headers: Headers.merge(parentFiber.getRef(CurrentHeaders), headers)
    });
    if (discard) {
      return send;
    }
    let fiber;
    return Effect.onInterrupt(Effect.callback(resume => {
      const entry = {
        _tag: "Effect",
        rpc,
        context,
        resume(exit) {
          resume(exit);
          if (fiber && !fiber.pollUnsafe()) {
            parentFiber.currentDispatcher.scheduleTask(() => {
              fiber.interruptUnsafe(parentFiber.id);
            }, 0);
          }
        }
      };
      entries.set(id, entry);
      fiber = send.pipe(span ? Effect.withParentSpan(span, {
        captureStackTrace: false
      }) : identity, Effect.runForkWith(parentFiber.context));
      fiber.addObserver(exit => {
        if (exit._tag === "Failure") {
          return resume(exit);
        }
      });
    }), interruptors => {
      entries.delete(id);
      return Effect.andThen(Fiber.interrupt(fiber), sendInterrupt(id, Array.from(interruptors), context));
    });
  });
  const onStreamRequest = Effect.fnUntraced(function* (rpc, middleware, payload, headers, streamBufferSize, context) {
    if (isShutdown) {
      return yield* Effect.interrupt;
    }
    const span = disableTracing ? undefined : yield* Effect.makeSpanScoped(`${spanPrefix}.${rpc._tag}`, {
      attributes: options.spanAttributes
    });
    const fiber = Fiber.getCurrent();
    const id = generateRequestId();
    const scope = Context.getUnsafe(fiber.context, Scope.Scope);
    yield* Scope.addFinalizerExit(scope, exit => {
      if (!entries.has(id)) return Effect.void;
      entries.delete(id);
      return sendInterrupt(id, Exit.isFailure(exit) ? Array.from(Cause.interruptors(exit.cause)) : [], context);
    });
    const queue = yield* Queue.bounded(streamBufferSize);
    entries.set(id, {
      _tag: "Queue",
      rpc,
      queue,
      scope,
      context
    });
    yield* middleware(message => options.onFromClient({
      message,
      context,
      discard: false
    }), {
      _tag: "Request",
      id,
      tag: rpc._tag,
      payload,
      ...(span ? {
        traceId: span.traceId,
        spanId: span.spanId,
        sampled: span.sampled
      } : {}),
      headers: Headers.merge(fiber.getRef(CurrentHeaders), headers)
    }).pipe(span ? Effect.withParentSpan(span, {
      captureStackTrace: false
    }) : identity, Effect.catchCause(error => Queue.failCause(queue, error)), Effect.interruptible, Effect.forkIn(scope, {
      startImmediately: true
    }));
    return queue;
  });
  const getRpcClientMiddleware = rpc => {
    const middlewares = [];
    for (const tag of rpc.middlewares.values()) {
      const middleware = services.mapUnsafe.get(`${tag.key}/Client`);
      if (!middleware) continue;
      middlewares.push(middleware);
    }
    if (middlewares.length === 0) {
      return (send, request) => send(request);
    }
    return function loop(send, request, index = middlewares.length - 1) {
      if (index === -1) {
        return send(request);
      }
      return middlewares[index]({
        rpc,
        request,
        next(request) {
          return loop(send, request, index - 1);
        }
      });
    };
  };
  const sendInterrupt = (requestId, interruptors, context) => Effect.callback(resume => {
    const parentFiber = Fiber.getCurrent();
    const fiber = options.onFromClient({
      message: {
        _tag: "Interrupt",
        requestId,
        interruptors
      },
      context,
      discard: false
    }).pipe(Effect.timeout(1000), Effect.runForkWith(parentFiber.context));
    fiber.addObserver(() => {
      resume(Effect.void);
    });
  });
  const write = message => {
    switch (message._tag) {
      case "Chunk":
        {
          const requestId = message.requestId;
          const entry = entries.get(requestId);
          if (!entry || entry._tag !== "Queue") return Effect.void;
          return Queue.offerAll(entry.queue, message.values).pipe(supportsAck ? Effect.flatMap(() => options.onFromClient({
            message: {
              _tag: "Ack",
              requestId: message.requestId
            },
            context: entry.context,
            discard: false
          })) : identity, Effect.catchCause(cause => Queue.failCause(entry.queue, cause)));
        }
      case "Exit":
        {
          const requestId = message.requestId;
          const entry = entries.get(requestId);
          if (!entry) return Effect.void;
          entries.delete(requestId);
          if (entry._tag === "Effect") {
            entry.resume(message.exit);
            return Effect.void;
          }
          return message.exit._tag === "Success" ? Queue.end(entry.queue) : Queue.failCause(entry.queue, message.exit.cause);
        }
      case "Defect":
        {
          return clearEntries(Exit.die(message.defect));
        }
      case "ClientEnd":
        {
          return Effect.void;
        }
    }
  };
  let client;
  if (options.flatten) {
    const fns = new Map();
    client = function client(tag, payload, options) {
      let fn = fns.get(tag);
      if (!fn) {
        fn = onRequest(group.requests.get(tag));
        fns.set(tag, fn);
      }
      return fn(payload, options);
    };
  } else {
    client = {};
    group.requests.forEach(rpc => {
      client[rpc._tag] = onRequest(rpc);
    });
  }
  return {
    client,
    write
  };
});
let clientIdCounter = 0;
/**
 * @since 4.0.0
 * @category client
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const clientId = clientIdCounter++;
  const {
    run,
    send,
    supportsAck,
    supportsTransferables
  } = yield* Protocol;
  const entries = new Map();
  const {
    client,
    write
  } = yield* makeNoSerialization(group, {
    ...options,
    supportsAck,
    onFromClient({
      message
    }) {
      switch (message._tag) {
        case "Request":
          {
            const rpc = group.requests.get(message.tag);
            const collector = supportsTransferables ? Transferable.makeCollectorUnsafe() : undefined;
            const fiber = Fiber.getCurrent();
            const entry = {
              rpc,
              context: collector ? Context.add(fiber.context, Transferable.Collector, collector) : fiber.context,
              schemas: rpcSchemas(rpc)
            };
            entries.set(message.id, entry);
            return entry.schemas.encodePayload(message.payload).pipe(Effect.provideContext(entry.context), Effect.orDie, Effect.flatMap(payload => send(clientId, {
              ...message,
              id: String(message.id),
              payload,
              headers: Object.entries(message.headers)
            }, collector && collector.readUnsafe())));
          }
        case "Ack":
          {
            const entry = entries.get(message.requestId);
            if (!entry) return Effect.void;
            return send(clientId, {
              _tag: "Ack",
              requestId: String(message.requestId)
            });
          }
        case "Interrupt":
          {
            const entry = entries.get(message.requestId);
            if (!entry) return Effect.void;
            entries.delete(message.requestId);
            return send(clientId, {
              _tag: "Interrupt",
              requestId: String(message.requestId)
            });
          }
        case "Eof":
          {
            return Effect.void;
          }
      }
    }
  });
  yield* run(clientId, message => {
    switch (message._tag) {
      case "Chunk":
        {
          const requestId = RequestId(message.requestId);
          const entry = entries.get(requestId);
          if (!entry || Option.isNone(entry.schemas.decodeChunk)) return Effect.void;
          return entry.schemas.decodeChunk.value(message.values).pipe(Effect.provideContext(entry.context), Effect.orDie, Effect.flatMap(chunk => write({
            _tag: "Chunk",
            clientId: 0,
            requestId: RequestId(message.requestId),
            values: chunk
          })), Effect.onError(cause => write({
            _tag: "Exit",
            clientId: 0,
            requestId: RequestId(message.requestId),
            exit: Exit.failCause(cause)
          })));
        }
      case "Exit":
        {
          const requestId = RequestId(message.requestId);
          const entry = entries.get(requestId);
          if (!entry) return Effect.void;
          entries.delete(requestId);
          return entry.schemas.decodeExit(message.exit).pipe(Effect.provideContext(entry.context), Effect.orDie, Effect.matchCauseEffect({
            onSuccess: exit => write({
              _tag: "Exit",
              clientId: 0,
              requestId,
              exit
            }),
            onFailure: cause => write({
              _tag: "Exit",
              clientId: 0,
              requestId,
              exit: Exit.failCause(cause)
            })
          }));
        }
      case "Defect":
        {
          return write({
            _tag: "Defect",
            clientId: 0,
            defect: decodeDefect(message.defect)
          });
        }
      case "ClientProtocolError":
        {
          const exit = Exit.fail(message.error);
          return Effect.forEach(entries.keys(), requestId => write({
            _tag: "Exit",
            clientId: 0,
            requestId,
            exit: exit
          }));
        }
      default:
        {
          return Effect.void;
        }
    }
  }).pipe(Effect.catchCause(Effect.logError), Effect.interruptible, Effect.forkScoped);
  return client;
});
const rpcSchemasCache = /*#__PURE__*/new WeakMap();
const rpcSchemas = rpc => {
  let entry = rpcSchemasCache.get(rpc);
  if (entry !== undefined) {
    return entry;
  }
  const streamSchemas = RpcSchema.getStreamSchemas(rpc.successSchema);
  entry = {
    decodeChunk: Option.map(streamSchemas, streamSchemas => Schema.decodeUnknownEffect(Schema.toCodecJson(Schema.NonEmptyArray(streamSchemas.success)))),
    encodePayload: Schema.encodeEffect(Schema.toCodecJson(rpc.payloadSchema)),
    decodeExit: Schema.decodeUnknownEffect(Schema.toCodecJson(Rpc.exitSchema(rpc)))
  };
  rpcSchemasCache.set(rpc, entry);
  return entry;
};
/**
 * @since 4.0.0
 * @category headers
 */
export const CurrentHeaders = /*#__PURE__*/Context.Reference("effect/rpc/RpcClient/CurrentHeaders", {
  defaultValue: () => Headers.empty
});
/**
 * @since 4.0.0
 * @category headers
 */
export const withHeaders = /*#__PURE__*/dual(2, (effect, headers) => Effect.updateService(effect, CurrentHeaders, Headers.merge(Headers.fromInput(headers))));
/**
 * @since 4.0.0
 * @category protocol
 */
export class Protocol extends /*#__PURE__*/Context.Service()("effect/rpc/RpcClient/Protocol") {
  /**
   * @since 4.0.0
   */
  static make = withRunClient;
}
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolHttp = client => Protocol.make(Effect.fnUntraced(function* (writeResponse) {
  const serialization = yield* RpcSerialization.RpcSerialization;
  const isFramed = serialization.includesFraming;
  const httpClientError = cause => new RpcClientError({
    reason: HttpClientErrorSchema.fromHttpClientError(cause)
  });
  const protocolDefect = (message, cause) => new RpcClientError({
    reason: new RpcClientDefect({
      message,
      cause
    })
  });
  const emptyResponseError = request => protocolDefect("Received empty HTTP response from RPC server", request);
  const send = Effect.fnUntraced(function* (clientId, request) {
    if (request._tag !== "Request") {
      return;
    }
    const parser = serialization.makeUnsafe();
    const encoded = parser.encode(request);
    const body = typeof encoded === "string" ? HttpBody.text(encoded, serialization.contentType) : HttpBody.uint8Array(encoded, serialization.contentType);
    const response = yield* client.post("", {
      body
    }).pipe(Effect.mapError(httpClientError));
    if (!isFramed) {
      const text = yield* response.text.pipe(Effect.mapError(httpClientError));
      const responses = yield* Effect.try({
        try: () => parser.decode(text),
        catch: cause => protocolDefect("Error decoding HTTP response", cause)
      });
      if (!Array.isArray(responses)) {
        return yield* protocolDefect("Expected an array of responses", responses);
      }
      if (responses.length === 0) {
        return yield* emptyResponseError(request);
      }
      let i = 0;
      return yield* Effect.whileLoop({
        while: () => i < responses.length,
        body: () => writeResponse(clientId, responses[i++]),
        step: constVoid
      });
    }
    let hasResponse = false;
    yield* Stream.runForEachArray(response.stream, chunk => Effect.try({
      try: () => chunk.flatMap(parser.decode),
      catch: cause => protocolDefect("Error decoding HTTP response", cause)
    }).pipe(Effect.flatMap(responses => {
      if (responses.length === 0) return Effect.void;
      hasResponse = true;
      let i = 0;
      return Effect.whileLoop({
        while: () => i < responses.length,
        body: () => writeResponse(clientId, responses[i++]),
        step: constVoid
      });
    }))).pipe(Effect.mapError(cause => cause instanceof RpcClientError ? cause : httpClientError(cause)));
    if (!hasResponse) {
      return yield* emptyResponseError(request);
    }
  });
  return {
    send,
    supportsAck: false,
    supportsTransferables: false
  };
}));
/**
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolHttp = options => Layer.effect(Protocol)(Effect.flatMap(HttpClient.HttpClient.asEffect(), client => {
  client = HttpClient.mapRequest(client, HttpClientRequest.prependUrl(options.url));
  return makeProtocolHttp(options.transformClient ? options.transformClient(client) : client);
}));
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolSocket = options => Protocol.make(Effect.fnUntraced(function* (writeResponse, clientIds) {
  const socket = yield* Socket.Socket;
  const serialization = yield* RpcSerialization.RpcSerialization;
  const hooks = yield* Effect.serviceOption(ConnectionHooks);
  const requestClientMap = new Map();
  const write = yield* socket.writer;
  let parser = serialization.makeUnsafe();
  const pinger = yield* makePinger(write(parser.encode(constPing)));
  let currentError;
  const onOpen = Effect.suspend(() => {
    currentError = undefined;
    return Option.isSome(hooks) ? hooks.value.onConnect : Effect.void;
  });
  const broadcast = response => Effect.forEach(clientIds, clientId => writeResponse(clientId, response));
  yield* Effect.suspend(() => {
    parser = serialization.makeUnsafe();
    pinger.reset();
    return socket.runRaw(message => {
      try {
        const responses = parser.decode(message);
        if (responses.length === 0) return;
        let i = 0;
        return Effect.whileLoop({
          while: () => i < responses.length,
          body: () => {
            const response = responses[i++];
            if (response._tag === "Pong") {
              pinger.onPong();
              return Effect.void;
            }
            if ("requestId" in response) {
              const clientId = requestClientMap.get(response.requestId);
              if (clientId !== undefined) {
                if (response._tag === "Exit") {
                  requestClientMap.delete(response.requestId);
                }
                return writeResponse(clientId, response);
              }
            }
            return broadcast(response);
          },
          step: constVoid
        });
      } catch (defect) {
        return broadcast({
          _tag: "ClientProtocolError",
          error: new RpcClientError({
            reason: new RpcClientDefect({
              message: "Error decoding message",
              cause: defect
            })
          })
        });
      }
    }, {
      onOpen
    }).pipe(Effect.raceFirst(Effect.flatMap(pinger.timeout, () => Effect.fail(new Socket.SocketError({
      reason: new Socket.SocketOpenError({
        kind: "Timeout",
        cause: new Error("ping timeout")
      })
    })))));
  }).pipe(Effect.flatMap(() => Effect.fail(new Socket.SocketError({
    reason: new Socket.SocketCloseError({
      code: 1000
    })
  }))), Option.isSome(hooks) ? Effect.ensuring(hooks.value.onDisconnect) : identity, Effect.tapCause(cause => {
    const error = Cause.findError(cause);
    const hasError = Result.isSuccess(error);
    if (options?.retryTransientErrors && hasError && error.success.reason._tag === "SocketOpenError") {
      return Effect.void;
    }
    currentError = new RpcClientError({
      reason: hasError ? error.success.reason : new RpcClientDefect({
        message: "Unknown socket error",
        cause: Cause.squash(cause)
      })
    });
    return broadcast({
      _tag: "ClientProtocolError",
      error: currentError
    });
  }), Effect.retry(options?.retryPolicy ?? defaultRetryPolicy), Effect.annotateLogs({
    module: "RpcClient",
    method: "makeProtocolSocket"
  }), Effect.forkScoped);
  return {
    send(clientId, request) {
      if (currentError) {
        return Effect.fail(currentError);
      }
      if (request._tag === "Request") {
        requestClientMap.set(request.id, clientId);
      }
      const encoded = parser.encode(request);
      if (encoded === undefined) return Effect.void;
      return Effect.orDie(write(encoded));
    },
    supportsAck: true,
    supportsTransferables: false
  };
}));
const defaultRetryPolicy = /*#__PURE__*/Schedule.exponential(500, 1.5).pipe(/*#__PURE__*/Schedule.either(/*#__PURE__*/Schedule.spaced(5000)));
const makePinger = /*#__PURE__*/Effect.fnUntraced(function* (writePing) {
  let recievedPong = true;
  const latch = Latch.makeUnsafe();
  const reset = () => {
    recievedPong = true;
    latch.closeUnsafe();
  };
  const onPong = () => {
    recievedPong = true;
  };
  yield* Effect.suspend(() => {
    if (!recievedPong) return latch.open;
    recievedPong = false;
    return writePing;
  }).pipe(Effect.delay("5 seconds"), Effect.ignore, Effect.forever, Effect.interruptible, Effect.forkScoped);
  return {
    timeout: latch.await,
    reset,
    onPong
  };
});
/**
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolSocket = options => Layer.effect(Protocol)(makeProtocolSocket(options));
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolWorker = options => Protocol.make(Effect.fnUntraced(function* (writeResponse, clientIds) {
  const worker = yield* Worker.WorkerPlatform;
  const scope = yield* Effect.scope;
  let workerId = 0;
  const initialMessage = yield* Effect.serviceOption(RpcWorker.InitialMessage);
  const hooks = yield* Effect.serviceOption(ConnectionHooks);
  const entries = new Map();
  const broadcast = response => Effect.forEach(clientIds, clientId => writeResponse(clientId, response));
  const acquire = Effect.gen(function* () {
    const id = workerId++;
    const backing = yield* worker.spawn(id);
    yield* backing.run(response => {
      if (response._tag === "Exit") {
        const entry = entries.get(response.requestId);
        if (entry) {
          entries.delete(response.requestId);
          entry.latch.openUnsafe();
          return writeResponse(entry.clientId, response);
        }
      } else if (response._tag === "Defect") {
        for (const [requestId, entry] of entries) {
          entries.delete(requestId);
          entry.latch.openUnsafe();
        }
        return broadcast(response);
      } else if ("requestId" in response) {
        const entry = entries.get(response.requestId);
        if (entry) {
          return writeResponse(entry.clientId, response);
        }
      }
      return broadcast(response);
    }, {
      onSpawn: Option.isSome(initialMessage) ? Effect.flatMap(initialMessage.value, ([value, transfers]) => Effect.orDie(backing.send({
        _tag: "InitialMessage",
        value
      }, transfers))) : undefined
    }).pipe(Effect.tapCause(cause => {
      const error = Cause.findError(cause);
      return broadcast({
        _tag: "ClientProtocolError",
        error: new RpcClientError({
          reason: Result.isSuccess(error) ? error.success.reason : new RpcClientDefect({
            message: "Error in worker",
            cause: Cause.squash(cause)
          })
        })
      });
    }), Effect.retry(Schedule.spaced(1000)), Effect.annotateLogs({
      module: "RpcClient",
      method: "makeProtocolWorker"
    }), Effect.interruptible, Effect.forkScoped);
    return backing;
  });
  const pool = "minSize" in options ? yield* Pool.makeWithTTL({
    acquire,
    min: options.minSize,
    max: options.maxSize,
    concurrency: options.concurrency,
    targetUtilization: options.targetUtilization,
    timeToLive: options.timeToLive
  }) : yield* Pool.make({
    acquire,
    size: options.size,
    concurrency: options.concurrency,
    targetUtilization: options.targetUtilization
  });
  yield* Scope.addFinalizer(scope, Effect.sync(() => {
    for (const entry of entries.values()) {
      entry.latch.openUnsafe();
    }
    entries.clear();
  }));
  const send = (clientId, request, transferables) => {
    switch (request._tag) {
      case "Request":
        {
          return Pool.get(pool).pipe(Effect.flatMap(worker => {
            const latch = Latch.makeUnsafe(false);
            entries.set(request.id, {
              clientId,
              worker,
              latch
            });
            return Effect.flatMap(worker.send(request, transferables), () => latch.await);
          }), Effect.scoped, Effect.orDie);
        }
      case "Interrupt":
        {
          const entry = entries.get(request.requestId);
          if (!entry) return Effect.void;
          entries.delete(request.requestId);
          entry.latch.openUnsafe();
          return Effect.orDie(entry.worker.send(request));
        }
      case "Ack":
        {
          const entry = entries.get(request.requestId);
          if (!entry) return Effect.void;
          return Effect.orDie(entry.worker.send(request));
        }
    }
    return Effect.void;
  };
  yield* Effect.scoped(Pool.get(pool));
  if (Option.isSome(hooks)) yield* hooks.value.onConnect;
  return {
    send,
    supportsAck: true,
    supportsTransferables: true
  };
}));
/**
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolWorker = /*#__PURE__*/flow(makeProtocolWorker, /*#__PURE__*/Layer.effect(Protocol));
/**
 * @since 4.0.0
 * @category ConnectionHooks
 */
export class ConnectionHooks extends /*#__PURE__*/Context.Service()("effect/rpc/RpcClient/ConnectionHooks") {}
// internal
const decodeDefect = /*#__PURE__*/Schema.decodeSync(Schema.Defect);
//# sourceMappingURL=RpcClient.js.map