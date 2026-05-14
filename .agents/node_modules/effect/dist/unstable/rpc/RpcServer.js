import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Deferred from "../../Deferred.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Fiber from "../../Fiber.js";
import { constant, constTrue, constVoid, identity } from "../../Function.js";
import { reportCauseUnsafe } from "../../internal/effect.js";
import * as Latch from "../../Latch.js";
import * as Layer from "../../Layer.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as Pull from "../../Pull.js";
import * as Queue from "../../Queue.js";
import * as Schedule from "../../Schedule.js";
import * as Schema from "../../Schema.js";
import * as Scope from "../../Scope.js";
import * as Semaphore from "../../Semaphore.js";
import { Stdio } from "../../Stdio.js";
import * as Stream from "../../Stream.js";
import * as Tracer from "../../Tracer.js";
import * as Headers from "../http/Headers.js";
import * as HttpRouter from "../http/HttpRouter.js";
import * as HttpServerRequest from "../http/HttpServerRequest.js";
import * as HttpServerResponse from "../http/HttpServerResponse.js";
import * as SocketServer from "../socket/SocketServer.js";
import * as Transferable from "../workers/Transferable.js";
import * as WorkerRunner from "../workers/WorkerRunner.js";
import * as Rpc from "./Rpc.js";
import { constEof, constPong, RequestId, ResponseDefectEncoded } from "./RpcMessage.js";
import * as RpcSchema from "./RpcSchema.js";
import * as RpcSerialization from "./RpcSerialization.js";
import { withRun } from "./Utils.js";
/**
 * @since 4.0.0
 * @category server
 */
export const makeNoSerialization = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const enableTracing = options.disableTracing !== true;
  const enableSpanPropagation = options.disableSpanPropagation !== true;
  const supportsAck = options.disableClientAcks !== true;
  const spanPrefix = options.spanPrefix ?? "RpcServer";
  const concurrency = options.concurrency ?? "unbounded";
  const disableFatalDefects = options.disableFatalDefects ?? false;
  const services = yield* Effect.context();
  const scope = Context.get(services, Scope.Scope);
  const trackFiber = Fiber.runIn(Scope.forkUnsafe(scope, "parallel"));
  const concurrencySemaphore = concurrency === "unbounded" ? undefined : yield* Semaphore.make(concurrency);
  const clients = new Map();
  let isShutdown = false;
  const shutdownLatch = Latch.makeUnsafe(false);
  yield* Scope.addFinalizer(scope, Effect.withFiber(parent => {
    isShutdown = true;
    for (const client of clients.values()) {
      client.ended = true;
      if (client.fibers.size === 0) {
        trackFiber(Effect.runForkWith(services)(endClient(client)));
        continue;
      }
      for (const fiber of client.fibers.values()) {
        fiber.interruptUnsafe(parent.id);
      }
    }
    if (clients.size === 0) {
      return Effect.void;
    }
    return shutdownLatch.await;
  }));
  const disconnect = clientId => Effect.withFiber(parent => {
    const client = clients.get(clientId);
    if (!client) return Effect.void;
    for (const fiber of client.fibers.values()) {
      fiber.interruptUnsafe(parent.id);
    }
    clients.delete(clientId);
    return Effect.void;
  });
  const write = (clientId, message) => Effect.catchDefect(Effect.withFiber(requestFiber => {
    if (isShutdown) return Effect.interrupt;
    let client = clients.get(clientId);
    if (!client) {
      client = {
        id: clientId,
        latches: new Map(),
        fibers: new Map(),
        ended: false,
        serverClient: new Rpc.ServerClient(clientId)
      };
      clients.set(clientId, client);
    } else if (client.ended) {
      return Effect.interrupt;
    }
    switch (message._tag) {
      case "Request":
        {
          return handleRequest(requestFiber, client, message);
        }
      case "Ack":
        {
          const latch = client.latches.get(message.requestId);
          return latch ? latch.open : Effect.void;
        }
      case "Interrupt":
        {
          const fiber = client.fibers.get(message.requestId);
          if (fiber) {
            fiber.interruptUnsafe(requestFiber.id, RpcSchema.ClientAbort.annotation);
            return Effect.void;
          }
          return options.onFromServer({
            _tag: "Exit",
            clientId,
            requestId: message.requestId,
            exit: Exit.interrupt()
          });
        }
      case "Eof":
        {
          client.ended = true;
          if (client.fibers.size > 0) return Effect.void;
          return endClient(client);
        }
      default:
        {
          return sendDefect(client, `Unknown request tag: ${message._tag}`);
        }
    }
  }), defect => sendDefect(clients.get(clientId), defect));
  const endClient = client => {
    clients.delete(client.id);
    const write = options.onFromServer({
      _tag: "ClientEnd",
      clientId: client.id
    });
    if (isShutdown && clients.size === 0) {
      return Effect.andThen(write, shutdownLatch.open);
    }
    return write;
  };
  const handleRequest = (requestFiber, client, request) => {
    if (client.fibers.has(request.id)) {
      return Effect.interrupt;
    }
    const rpc = group.requests.get(request.tag);
    const entry = services.mapUnsafe.get(rpc?.key);
    if (!rpc || !entry) {
      const write = Effect.catchDefect(options.onFromServer({
        _tag: "Exit",
        clientId: client.id,
        requestId: request.id,
        exit: Exit.die(`Unknown request tag: ${request.tag}`)
      }), defect => sendDefect(client, defect));
      if (!client.ended || client.fibers.size > 0) return write;
      return Effect.ensuring(write, endClient(client));
    }
    const isStream = RpcSchema.isStreamSchema(rpc.successSchema);
    const metadata = {
      rpc,
      client: client.serverClient,
      requestId: request.id,
      headers: request.headers,
      payload: request.payload
    };
    const result = entry.handler(request.payload, metadata);
    // if the handler requested forking, then we skip the concurrency control
    const isWrapper = Rpc.isWrapper(result);
    const isFork = isWrapper && result.fork;
    const isUninterruptible = isWrapper && result.uninterruptible;
    // unwrap the fork data type
    const streamOrEffect = isWrapper ? result.value : result;
    const handler = isStream ? streamEffect(client, request, streamOrEffect) : streamOrEffect;
    const withMiddleware = rpc.middlewares.size > 0 ? applyMiddleware(services, handler, metadata) : handler;
    let responded = false;
    const scope = Scope.makeUnsafe();
    let deferred = undefined;
    let effect = Effect.onExit(withMiddleware, exit => {
      responded = true;
      let write;
      if (exit._tag === "Success") {
        if (Deferred.isDeferred(exit.value)) {
          deferred = exit.value;
          write = Effect.void;
        } else {
          write = options.onFromServer({
            _tag: "Exit",
            clientId: client.id,
            requestId: request.id,
            exit: exit
          });
        }
      } else if (!disableFatalDefects && Cause.hasDies(exit.cause) && !Cause.hasInterrupts(exit.cause)) {
        write = sendDefect(client, Cause.squash(exit.cause));
      } else {
        write = options.onFromServer({
          _tag: "Exit",
          clientId: client.id,
          requestId: request.id,
          exit: exit
        });
      }
      const close = Scope.closeUnsafe(scope, exit);
      if (exit._tag === "Failure") {
        reportCauseUnsafe(Fiber.getCurrent(), exit.cause);
      }
      return close ? Effect.ensuring(write, close) : write;
    });
    if (enableTracing) {
      const parentSpan = requestFiber.context.mapUnsafe.get(Tracer.ParentSpan.key);
      effect = Effect.withSpan(effect, `${spanPrefix}.${request.tag}`, {
        captureStackTrace: false,
        attributes: options.spanAttributes,
        parent: enableSpanPropagation && request.spanId ? Tracer.externalSpan({
          traceId: request.traceId,
          spanId: request.spanId,
          sampled: request.sampled
        }) : undefined,
        links: enableSpanPropagation && parentSpan ? [{
          span: parentSpan,
          attributes: {}
        }] : undefined
      });
    }
    if (!isFork && concurrencySemaphore) {
      effect = concurrencySemaphore.withPermit(effect);
    }
    const context = new Map(entry.context.mapUnsafe);
    requestFiber.context.mapUnsafe.forEach((value, key) => context.set(key, value));
    context.set(Scope.Scope.key, scope);
    const runFork = Effect.runForkWith(Context.makeUnsafe(context));
    const fiber = trackFiber(runFork(effect, isUninterruptible ? {
      uninterruptible: true
    } : undefined));
    client.fibers.set(request.id, fiber);
    fiber.addObserver(function onExit(exit) {
      if (deferred) {
        const fiber = trackFiber(runFork(Effect.onExit(Deferred.await(deferred), exit => options.onFromServer({
          _tag: "Exit",
          clientId: client.id,
          requestId: request.id,
          exit: exit
        }))));
        client.fibers.set(request.id, fiber);
        deferred = undefined;
        fiber.addObserver(onExit);
        return;
      }
      if (!responded && exit._tag === "Failure") {
        trackFiber(runFork(options.onFromServer({
          _tag: "Exit",
          clientId: client.id,
          requestId: request.id,
          exit: Exit.interrupt()
        })));
      }
      client.fibers.delete(request.id);
      client.latches.delete(request.id);
      if (client.ended && client.fibers.size === 0) {
        trackFiber(runFork(endClient(client)));
      }
    });
    return Effect.void;
  };
  const streamEffect = (client, request, stream) => {
    let latch = client.latches.get(request.id);
    if (supportsAck && !latch) {
      latch = Latch.makeUnsafe(false);
      client.latches.set(request.id, latch);
    }
    if (Effect.isEffect(stream)) {
      return stream.pipe(Effect.flatMap(queue => Effect.whileLoop({
        while: constTrue,
        body: constant(Effect.flatMap(Queue.takeAll(queue), values => {
          const write = options.onFromServer({
            _tag: "Chunk",
            clientId: client.id,
            requestId: request.id,
            values
          });
          if (!latch) return write;
          latch.closeUnsafe();
          return Effect.flatMap(write, () => latch.await);
        })),
        step: constVoid
      })), Pull.catchDone(() => Effect.void), Effect.scoped);
    }
    return Stream.runForEachArray(stream, values => {
      const write = options.onFromServer({
        _tag: "Chunk",
        clientId: client.id,
        requestId: request.id,
        values
      });
      if (!latch) return write;
      latch.closeUnsafe();
      return Effect.andThen(write, latch.await);
    });
  };
  const sendDefect = (client, defect) => Effect.suspend(() => {
    const shouldEnd = client.ended && client.fibers.size === 0;
    const write = options.onFromServer({
      _tag: "Defect",
      clientId: client.id,
      defect
    });
    if (!shouldEnd) return write;
    return Effect.andThen(write, endClient(client));
  });
  return identity({
    write,
    disconnect
  });
});
const applyMiddleware = (context, handler, options) => {
  for (const service of options.rpc.middlewares) {
    const middleware = Context.getUnsafe(context, service);
    handler = middleware(handler, options);
  }
  return handler;
};
/**
 * @since 4.0.0
 * @category server
 */
export const make = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const {
    disconnects,
    end,
    run,
    send,
    supportsAck,
    supportsSpanPropagation,
    supportsTransferables
  } = yield* Protocol;
  const services = yield* Effect.context();
  const scope = yield* Scope.make();
  const server = yield* makeNoSerialization(group, {
    ...options,
    disableClientAcks: !supportsAck,
    disableSpanPropagation: !supportsSpanPropagation,
    onFromServer(response) {
      const client = clients.get(response.clientId);
      if (!client) return Effect.void;
      switch (response._tag) {
        case "Chunk":
          {
            const schemas = client.schemas.get(response.requestId);
            if (!schemas) return Effect.void;
            return handleEncode(client, response.requestId, schemas.encodeDefect, schemas.collector, Effect.provideContext(schemas.encodeChunk(response.values), schemas.context), values => ({
              _tag: "Chunk",
              requestId: String(response.requestId),
              values
            }));
          }
        case "Exit":
          {
            const schemas = client.schemas.get(response.requestId);
            if (!schemas) return Effect.void;
            client.schemas.delete(response.requestId);
            return handleEncode(client, response.requestId, schemas.encodeDefect, schemas.collector, Effect.provideContext(schemas.encodeExit(response.exit), schemas.context), exit => ({
              _tag: "Exit",
              requestId: String(response.requestId),
              exit
            }));
          }
        case "Defect":
          {
            return sendDefect(client, response.defect);
          }
        case "ClientEnd":
          {
            clients.delete(response.clientId);
            return end(response.clientId);
          }
      }
    }
  }).pipe(Scope.provide(scope));
  // handle disconnects
  yield* Effect.forkChild(Effect.whileLoop({
    while: constTrue,
    body: constant(Effect.flatMap(Queue.take(disconnects), clientId => {
      clients.delete(clientId);
      return server.disconnect(clientId);
    })),
    step: constVoid
  }));
  const schemasCache = new WeakMap();
  const getSchemas = rpc => {
    let schemas = schemasCache.get(rpc);
    if (!schemas) {
      const entry = services.mapUnsafe.get(rpc.key);
      const streamSchemas = RpcSchema.getStreamSchemas(rpc.successSchema);
      schemas = {
        decode: Schema.decodeUnknownEffect(Schema.toCodecJson(rpc.payloadSchema)),
        encodeChunk: Schema.encodeUnknownEffect(Schema.toCodecJson(Schema.Array(Option.isSome(streamSchemas) ? streamSchemas.value.success : Schema.Any))),
        encodeExit: Schema.encodeUnknownEffect(Schema.toCodecJson(Rpc.exitSchema(rpc))),
        encodeDefect: Schema.encodeUnknownEffect(Schema.toCodecJson(rpc.defectSchema)),
        context: entry.context
      };
      schemasCache.set(rpc, schemas);
    }
    return schemas;
  };
  const clients = new Map();
  const handleEncode = (client, requestId, encodeDefect, collector, effect, onSuccess) => (collector ? Effect.provideService(effect, Transferable.Collector, collector) : effect).pipe(Effect.flatMap(a => send(client.id, onSuccess(a), collector && collector.clearUnsafe())), Effect.catchCause(cause => {
    client.schemas.delete(requestId);
    const defect = Cause.squash(Cause.map(cause, e => e.issue.toString()));
    return Effect.andThen(sendRequestDefect(client, requestId, encodeDefect, defect), server.write(client.id, {
      _tag: "Interrupt",
      requestId,
      interruptors: []
    }));
  }));
  const sendRequestDefect = (client, requestId, encodeDefect, defect) => Effect.catchCause(Effect.flatMap(encodeDefect(defect), encodedDefect => send(client.id, {
    _tag: "Exit",
    requestId: String(requestId),
    exit: {
      _tag: "Failure",
      cause: [{
        _tag: "Die",
        defect: encodedDefect
      }]
    }
  })), cause => sendDefect(client, Cause.squash(cause)));
  const sendDefect = (client, defect) => Effect.catchCause(send(client.id, ResponseDefectEncoded(defect)), cause => Effect.annotateLogs(Effect.logDebug(cause), {
    module: "RpcServer",
    method: "sendDefect"
  }));
  // main server loop
  return yield* run((clientId, request) => {
    let client = clients.get(clientId);
    if (!client) {
      client = {
        id: clientId,
        schemas: new Map()
      };
      clients.set(clientId, client);
    }
    switch (request._tag) {
      case "Request":
        {
          const tag = Predicate.hasProperty(request, "tag") ? request.tag : "";
          const rpc = group.requests.get(tag);
          if (!rpc) {
            return sendDefect(client, `Unknown request tag: ${tag}`);
          }
          let requestId;
          switch (typeof request.id) {
            case "bigint":
            case "string":
              {
                requestId = RequestId(request.id);
                break;
              }
            default:
              {
                return sendDefect(client, `Invalid request id: ${request.id}`);
              }
          }
          const schemas = getSchemas(rpc);
          return Effect.matchEffect(Effect.provideContext(schemas.decode(request.payload), schemas.context), {
            onFailure: error => sendRequestDefect(client, requestId, schemas.encodeDefect, error.issue.toString()),
            onSuccess: payload => {
              client.schemas.set(requestId, supportsTransferables ? {
                ...schemas,
                collector: Transferable.makeCollectorUnsafe()
              } : schemas);
              return server.write(clientId, {
                ...request,
                id: requestId,
                payload,
                headers: Headers.fromInput(request.headers)
              });
            }
          });
        }
      case "Ping":
        {
          return Effect.catchCause(send(client.id, constPong), cause => sendDefect(client, Cause.squash(cause)));
        }
      case "Eof":
        {
          return server.write(clientId, request);
        }
      case "Ack":
        {
          return server.write(clientId, {
            ...request,
            requestId: RequestId(request.requestId)
          });
        }
      case "Interrupt":
        {
          return server.write(clientId, {
            ...request,
            requestId: RequestId(request.requestId),
            interruptors: []
          });
        }
      default:
        {
          return sendDefect(client, `Unknown request tag: ${request._tag}`);
        }
    }
  }).pipe(Effect.tapCause(cause => Effect.logFatal("BUG: RpcServer protocol crashed", cause)), Effect.onExit(exit => Scope.close(scope, exit)));
});
/**
 * @since 4.0.0
 * @category server
 */
export const layer = (group, options) => Layer.effectDiscard(Effect.forkScoped(make(group, options)));
/**
 * Create a RPC server that registers a HTTP route with a `HttpRouter`.
 *
 * It defaults to using websockets for communication, but can be configured to
 * use HTTP.
 *
 * @since 4.0.0
 * @category protocol
 */
export const layerHttp = options => layer(options.group, options).pipe(Layer.provide(options.protocol === "http" ? layerProtocolHttp(options) : layerProtocolWebsocket(options)));
/**
 * @since 4.0.0
 * @category protocol
 */
export class Protocol extends /*#__PURE__*/Context.Service()("effect/rpc/RpcServer/Protocol") {
  /**
   * @since 4.0.0
   */
  static make = /*#__PURE__*/withRun();
}
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolSocketServer = /*#__PURE__*/Effect.gen(function* () {
  const server = yield* SocketServer.SocketServer;
  const {
    onSocket,
    protocol
  } = yield* makeSocketProtocol;
  yield* Effect.forkScoped(server.run(Effect.fnUntraced(onSocket, Effect.scoped)));
  return protocol;
});
/**
 * A rpc protocol that uses `SocketServer` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolSocketServer = /*#__PURE__*/Layer.effect(Protocol)(makeProtocolSocketServer);
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolWithHttpEffectWebsocket = /*#__PURE__*/Effect.gen(function* () {
  const {
    onSocket,
    protocol
  } = yield* makeSocketProtocol;
  const httpEffect = Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const socket = yield* Effect.orDie(request.upgrade);
    yield* onSocket(socket, Object.entries(request.headers));
    return HttpServerResponse.empty();
  });
  return {
    protocol,
    httpEffect
  };
});
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolWebsocket = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const {
    httpEffect,
    protocol
  } = yield* makeProtocolWithHttpEffectWebsocket;
  const router = yield* HttpRouter.HttpRouter;
  yield* router.add("GET", options.path, httpEffect);
  return protocol;
});
/**
 * A rpc protocol that uses websockets for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolWebsocket = options => {
  return Layer.effect(Protocol)(makeProtocolWebsocket(options));
};
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolWithHttpEffect = /*#__PURE__*/Effect.gen(function* () {
  const serialization = yield* RpcSerialization.RpcSerialization;
  const includesFraming = serialization.includesFraming;
  const isBinary = !serialization.contentType.includes("json");
  const disconnects = yield* Queue.make();
  let writeRequest;
  let clientId = 0;
  const clients = new Map();
  const clientIds = new Set();
  const encoder = new TextEncoder();
  const httpEffect = Effect.gen(function* () {
    const fiber = Fiber.getCurrent();
    const request = Context.getUnsafe(fiber.context, HttpServerRequest.HttpServerRequest);
    const scope = Context.getUnsafe(fiber.context, Scope.Scope);
    const requestHeaders = Object.entries(request.headers);
    const data = yield* Effect.orDie(isBinary ? Effect.map(request.arrayBuffer, buf => new Uint8Array(buf)) : request.text);
    const id = clientId++;
    const queue = yield* Queue.make();
    const parser = serialization.makeUnsafe();
    const offer = data => typeof data === "string" ? Queue.offer(queue, encoder.encode(data)) : Queue.offer(queue, data);
    const client = {
      write: !includesFraming ? response => Queue.offer(queue, response) : response => {
        try {
          const encoded = parser.encode(response);
          if (encoded === undefined) return Effect.void;
          return offer(encoded);
        } catch (cause) {
          return offer(parser.encode(ResponseDefectEncoded(cause)));
        }
      },
      end: Queue.end(queue)
    };
    yield* Scope.addFinalizerExit(scope, () => {
      clients.delete(id);
      clientIds.delete(id);
      Queue.offerUnsafe(disconnects, id);
      if (queue.state._tag === "Done") return Effect.void;
      return Effect.forEach(requestIds, requestId => writeRequest(id, {
        _tag: "Interrupt",
        requestId: String(requestId)
      }), {
        discard: true
      });
    });
    clients.set(id, client);
    clientIds.add(id);
    const requestIds = [];
    // @effect-diagnostics-next-line tryCatchInEffectGen:off
    try {
      const decoded = parser.decode(data);
      for (let i = 0; i < decoded.length; i++) {
        const message = decoded[i];
        if (message._tag === "Request") {
          requestIds.push(RequestId(message.id));
          message.headers = requestHeaders.concat(message.headers);
        }
        yield* writeRequest(id, message);
      }
    } catch (cause) {
      yield* client.write(ResponseDefectEncoded(cause));
    }
    yield* writeRequest(id, constEof);
    if (!includesFraming) {
      const responses = yield* Queue.collect(queue);
      return HttpServerResponse.text(parser.encode(responses), {
        contentType: serialization.contentType
      });
    }
    const initialChunk = yield* Queue.takeAll(queue);
    if (queue.state._tag === "Done") {
      return HttpServerResponse.uint8Array(mergeUint8Arrays(initialChunk), {
        contentType: serialization.contentType
      });
    }
    return HttpServerResponse.stream(Stream.fromArray(initialChunk).pipe(Stream.concat(Stream.fromQueue(queue))), {
      contentType: serialization.contentType
    });
  });
  const protocol = yield* Protocol.make(writeRequest_ => {
    writeRequest = writeRequest_;
    return Effect.succeed({
      disconnects,
      send(clientId, response) {
        const client = clients.get(clientId);
        if (!client) return Effect.void;
        return client.write(response);
      },
      end(clientId) {
        const client = clients.get(clientId);
        if (!client) return Effect.void;
        return client.end;
      },
      clientIds: Effect.sync(() => clientIds),
      initialMessage: Effect.succeedNone,
      supportsAck: false,
      supportsTransferables: false,
      supportsSpanPropagation: false
    });
  });
  return {
    protocol,
    httpEffect
  };
});
const mergeUint8Arrays = arrays => {
  if (arrays.length === 0) return new Uint8Array(0);
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolHttp = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const {
    httpEffect,
    protocol
  } = yield* makeProtocolWithHttpEffect;
  const router = yield* HttpRouter.HttpRouter;
  yield* router.add("POST", options.path, httpEffect);
  return protocol;
});
/**
 * A rpc protocol that uses websockets for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolHttp = options => {
  return Layer.effect(Protocol)(makeProtocolHttp(options));
};
/**
 * @since 4.0.0
 * @category http app
 */
export const toHttpEffect = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const {
    httpEffect,
    protocol
  } = yield* makeProtocolWithHttpEffect;
  yield* make(group, options).pipe(Effect.provideService(Protocol, protocol), Effect.forkScoped);
  // @effect-diagnostics-next-line returnEffectInGen:off
  return httpEffect;
});
/**
 * @since 4.0.0
 * @category http app
 */
export const toHttpEffectWebsocket = /*#__PURE__*/Effect.fnUntraced(function* (group, options) {
  const {
    httpEffect,
    protocol
  } = yield* makeProtocolWithHttpEffectWebsocket;
  yield* make(group, options).pipe(Effect.provideService(Protocol, protocol), Effect.forkScoped);
  // @effect-diagnostics-next-line returnEffectInGen:off
  return httpEffect;
});
/**
 * Create a protocol that uses the provided `Stream` and `Sink` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolStdio = /*#__PURE__*/Effect.gen(function* () {
  const stdio = yield* Stdio;
  const fiber = Fiber.getCurrent();
  const serialization = yield* RpcSerialization.RpcSerialization;
  return yield* Protocol.make(Effect.fnUntraced(function* (writeRequest) {
    const queue = yield* Queue.make();
    const parser = serialization.makeUnsafe();
    yield* stdio.stdin.pipe(Stream.runForEach(data => {
      const decoded = parser.decode(data);
      if (decoded.length === 0) return Effect.void;
      let i = 0;
      return Effect.whileLoop({
        while: () => i < decoded.length,
        body: () => writeRequest(0, decoded[i++]),
        step: constVoid
      });
    }), Effect.sandbox, Effect.tapError(Effect.logError), Effect.retry(Schedule.spaced(500)), Effect.ensuring(Effect.forkDetach(Fiber.interrupt(fiber), {
      startImmediately: true
    })), Effect.forkScoped);
    yield* Stream.fromQueue(queue).pipe(Stream.run(stdio.stdout()), Effect.retry(Schedule.spaced(500)), Effect.forkScoped);
    return {
      disconnects: yield* Queue.make(),
      send(_clientId, response) {
        const responseEncoded = parser.encode(response);
        if (responseEncoded === undefined) {
          return Effect.void;
        }
        return Queue.offer(queue, responseEncoded);
      },
      end(_clientId) {
        return Queue.end(queue);
      },
      clientIds: Effect.succeed(new Set([0])),
      initialMessage: Effect.succeedNone,
      supportsAck: true,
      supportsTransferables: false,
      supportsSpanPropagation: true
    };
  }));
});
/**
 * Create a protocol that uses the provided `Stream` and `Sink` for communication.
 *
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolStdio = /*#__PURE__*/Layer.effect(Protocol, makeProtocolStdio);
/**
 * @since 4.0.0
 * @category protocol
 */
export const makeProtocolWorkerRunner = /*#__PURE__*/Protocol.make(/*#__PURE__*/Effect.fnUntraced(function* (writeRequest) {
  const fiber = Fiber.getCurrent();
  const runner = yield* WorkerRunner.WorkerRunnerPlatform;
  const backing = yield* runner.start();
  const initialMessage = yield* Deferred.make();
  const clientIds = new Set();
  const disconnects = yield* Queue.make();
  yield* backing.run((clientId, message) => {
    clientIds.add(clientId);
    if (message._tag === "InitialMessage") {
      return Deferred.succeed(initialMessage, message.value);
    }
    return writeRequest(clientId, message);
  }).pipe(Effect.tapCause(Effect.logError), Effect.onExit(() => Effect.sync(() => {
    fiber.currentDispatcher.scheduleTask(() => fiber.interruptUnsafe(fiber.id), 0);
  })), Effect.forkScoped);
  if (backing.disconnects) {
    yield* Queue.take(backing.disconnects).pipe(Effect.tap(clientId => {
      clientIds.delete(clientId);
      return Queue.offer(disconnects, clientId);
    }), Effect.forkScoped);
  }
  return {
    disconnects,
    send: backing.send,
    end(_clientId) {
      return Effect.void;
    },
    clientIds: Effect.sync(() => clientIds),
    initialMessage: Effect.asSome(Deferred.await(initialMessage)),
    supportsAck: true,
    supportsTransferables: true,
    supportsSpanPropagation: true
  };
}));
/**
 * @since 4.0.0
 * @category protocol
 */
export const layerProtocolWorkerRunner = /*#__PURE__*/Layer.effect(Protocol)(makeProtocolWorkerRunner);
// internal
const makeSocketProtocol = /*#__PURE__*/Effect.gen(function* () {
  const serialization = yield* RpcSerialization.RpcSerialization;
  const disconnects = yield* Queue.make();
  let clientId = 0;
  const clients = new Map();
  const clientIds = new Set();
  let writeRequest;
  const onSocket = function* (socket, headers) {
    const scope = yield* Effect.scope;
    const parser = serialization.makeUnsafe();
    const id = clientId++;
    yield* Scope.addFinalizerExit(scope, () => {
      clients.delete(id);
      clientIds.delete(id);
      return Queue.offer(disconnects, id);
    });
    const writeRaw = yield* socket.writer;
    const write = response => {
      try {
        const encoded = parser.encode(response);
        if (encoded === undefined) {
          return Effect.void;
        }
        return Effect.orDie(writeRaw(encoded));
      } catch (cause) {
        return Effect.orDie(writeRaw(parser.encode(ResponseDefectEncoded(cause))));
      }
    };
    clients.set(id, {
      write
    });
    clientIds.add(id);
    yield* socket.runRaw(data => {
      try {
        const decoded = parser.decode(data);
        if (decoded.length === 0) return Effect.void;
        let i = 0;
        return Effect.whileLoop({
          while: () => i < decoded.length,
          body() {
            const message = decoded[i++];
            if (message._tag === "Request" && headers) {
              ;
              message.headers = headers.concat(message.headers);
            }
            return writeRequest(id, message);
          },
          step: constVoid
        });
      } catch (cause) {
        return writeRaw(parser.encode(ResponseDefectEncoded(cause)));
      }
    }).pipe(Effect.catchReason("SocketError", "SocketCloseError", _ => Effect.void), Effect.orDie);
  };
  const protocol = yield* Protocol.make(writeRequest_ => {
    writeRequest = writeRequest_;
    return Effect.succeed({
      disconnects,
      send: (clientId, response) => {
        const client = clients.get(clientId);
        if (!client) return Effect.void;
        return Effect.orDie(client.write(response));
      },
      end(_clientId) {
        return Effect.void;
      },
      clientIds: Effect.sync(() => clientIds),
      initialMessage: Effect.succeedNone,
      supportsAck: true,
      supportsTransferables: false,
      supportsSpanPropagation: true
    });
  });
  return {
    protocol,
    onSocket
  };
});
//# sourceMappingURL=RpcServer.js.map