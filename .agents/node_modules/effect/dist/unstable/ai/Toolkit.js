import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Fiber from "../../Fiber.js";
import { identity } from "../../Function.js";
import { PipeInspectableProto, YieldableProto } from "../../internal/core.js";
import * as Layer from "../../Layer.js";
import * as Predicate from "../../Predicate.js";
import * as Queue from "../../Queue.js";
import * as Schema from "../../Schema.js";
import * as Stream from "../../Stream.js";
import * as AiError from "./AiError.js";
const TypeId = "~effect/ai/Toolkit";
const Proto = {
  ...YieldableProto,
  ...PipeInspectableProto,
  [TypeId]: TypeId,
  of: identity,
  toHandlers(build) {
    return Effect.gen({
      self: this
    }, function* () {
      const services = yield* Effect.context();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const context = new Map();
      for (const [name, handler] of Object.entries(handlers)) {
        const tool = this.tools[name];
        context.set(tool.id, {
          name,
          handler,
          context: services
        });
      }
      return Context.makeUnsafe(context);
    });
  },
  toLayer(build) {
    return Layer.effectContext(this.toHandlers(build));
  },
  asEffect() {
    return Effect.gen({
      self: this
    }, function* () {
      const tools = this.tools;
      const services = yield* Effect.context();
      const schemasCache = new WeakMap();
      const getSchemas = tool => {
        let schemas = schemasCache.get(tool);
        if (Predicate.isUndefined(schemas)) {
          const handler = services.mapUnsafe.get(tool.id);
          const resultSchema = tool.failureMode === "return" ? Schema.Union([tool.successSchema, tool.failureSchema, AiError.AiError]) : tool.successSchema;
          const decodeParameters = Schema.isSchema(tool.parametersSchema) ? Schema.decodeUnknownEffect(tool.parametersSchema) : u => Effect.succeed(u);
          const decodeResult = Schema.decodeUnknownEffect(resultSchema);
          const encodeResult = Schema.encodeUnknownEffect(resultSchema);
          schemas = {
            context: handler.context,
            handler: handler.handler,
            decodeParameters,
            decodeResult,
            encodeResult
          };
          schemasCache.set(tool, schemas);
        }
        return schemas;
      };
      const handle = Effect.fnUntraced(function* (name, params) {
        const tool = tools[name];
        yield* Effect.annotateCurrentSpan({
          tool: name,
          parameters: params
        });
        // If the tool is not found, return an error
        if (Predicate.isUndefined(tool)) {
          return yield* AiError.make({
            module: "Toolkit",
            method: `${name}.handle`,
            reason: new AiError.ToolNotFoundError({
              toolName: name,
              availableTools: Object.keys(tools)
            })
          });
        }
        // Fetch cached schemas / handlers for the tool
        const schemas = getSchemas(tool);
        // Decode the tool call parameters which will be passed to the handler
        const decodedParams = yield* schemas.decodeParameters(params).pipe(Effect.mapError(cause => AiError.make({
          module: "Toolkit",
          method: `${name}.handle`,
          reason: new AiError.ToolParameterValidationError({
            toolName: name,
            toolParams: params,
            description: cause.message
          })
        })));
        // Setup the handler context
        const queue = yield* Queue.make();
        const context = {
          preliminary: result => Effect.asVoid(Queue.offer(queue, {
            result,
            isFailure: false,
            preliminary: true
          }))
        };
        const fiber = yield* schemas.handler(decodedParams, context).pipe(Effect.flatMap(result => Queue.offer(queue, {
          result,
          isFailure: false,
          preliminary: false
        })), Effect.updateContext(input => Context.merge(schemas.context, input)), Effect.matchCauseEffect({
          onFailure: cause => Queue.failCause(queue, cause),
          onSuccess: () => Queue.end(queue)
        }), Effect.forkChild);
        const encodeResult = result => schemas.encodeResult(result).pipe(Effect.mapError(cause => AiError.make({
          module: "Toolkit",
          method: `${name}.handle`,
          reason: new AiError.ToolResultEncodingError({
            toolName: name,
            toolResult: result,
            description: cause.message
          })
        })));
        const normalizeError = error => {
          // Schema errors indicate handler returned invalid data
          const normalizedError = Schema.isSchemaError(error) ? AiError.make({
            module: "Toolkit",
            method: `${name}.handle`,
            reason: new AiError.InvalidToolResultError({
              toolName: name,
              description: `Tool handler returned invalid result: ${error.message}`
            })
          }) : AiError.isAiErrorReason(error) ? AiError.make({
            module: "Toolkit",
            method: `${name}.handle`,
            reason: error
          }) : error;
          return normalizedError;
        };
        return Stream.fromQueue(queue).pipe(
        // If the tool handler failed, check the tool's failure mode to
        // determine how the result should be returned to the end user
        Stream.catch(error => {
          const normalizedError = normalizeError(error);
          return tool.failureMode === "error" ? Stream.fail(normalizedError) : Stream.succeed({
            result: normalizedError,
            isFailure: true,
            preliminary: false
          });
        }), Stream.mapEffect(Effect.fnUntraced(function* (output) {
          const encodedResult = yield* encodeResult(output.result);
          return {
            ...output,
            encodedResult
          };
        })), Stream.onEnd(Fiber.interrupt(fiber)));
      });
      return {
        tools,
        handle: handle
      };
    });
  },
  toJSON() {
    return {
      _id: "effect/ai/Toolkit",
      tools: Array.from(Object.values(this.tools)).map(tool => tool.name)
    };
  }
};
const makeProto = tools => Object.assign(function () {}, Proto, {
  tools
});
const resolveInput = (...tools) => {
  const output = {};
  for (const tool of tools) {
    output[tool.name] = tool;
  }
  return output;
};
/**
 * An empty toolkit with no tools.
 *
 * Useful as a starting point for building toolkits or as a default value. Can
 * be extended using the merge function to add tools.
 *
 * @since 1.0.0
 * @category constructors
 */
export const empty = /*#__PURE__*/makeProto({});
/**
 * Creates a new toolkit from the specified tools.
 *
 * This is the primary constructor for creating toolkits. It accepts multiple
 * tools and organizes them into a toolkit that can be provided to AI language
 * models.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: Schema.Number
 * })
 *
 * const GetWeather = Tool.make("get_weather", {
 *   description: "Get weather information",
 *   parameters: Schema.Struct({ location: Schema.String }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String
 *   })
 * })
 *
 * const toolkit = Toolkit.make(GetCurrentTime, GetWeather)
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = (...tools) => makeProto(resolveInput(...tools));
/**
 * Merges multiple toolkits into a single toolkit.
 *
 * Combines all tools from the provided toolkits into one unified toolkit.
 * If there are naming conflicts, tools from later toolkits will override
 * tools from earlier ones.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const mathToolkit = Toolkit.make(
 *   Tool.make("add", { success: Schema.Number }),
 *   Tool.make("subtract", { success: Schema.Number })
 * )
 *
 * const utilityToolkit = Toolkit.make(
 *   Tool.make("get_time", { success: Schema.Number }),
 *   Tool.make("get_weather", { success: Schema.String })
 * )
 *
 * const combined = Toolkit.merge(mathToolkit, utilityToolkit)
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const merge = (
/**
 * The toolkits to merge together.
 */
...toolkits) => {
  const tools = {};
  for (const toolkit of toolkits) {
    for (const [name, tool] of Object.entries(toolkit.tools)) {
      tools[name] = tool;
    }
  }
  return makeProto(tools);
};
//# sourceMappingURL=Toolkit.js.map