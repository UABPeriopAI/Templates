/**
 * The `Tool` module provides functionality for defining and managing tools
 * that language models can call to augment their capabilities.
 *
 * This module enables creation of both user-defined and provider-defined tools,
 * with full schema validation, type safety, and handler support. Tools allow
 * AI models to perform actions like searching databases, calling APIs, or
 * executing code within your application context.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Define a simple calculator tool
 * const Calculator = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 * ```
 *
 * @since 1.0.0
 */
import * as Context from "../../Context.js";
import { constFalse, constTrue, identity } from "../../Function.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as AST from "../../SchemaAST.js";
// =============================================================================
// Type Ids
// =============================================================================
/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId = "~effect/ai/Tool";
/**
 * @since 1.0.0
 * @category type ids
 */
export const ProviderDefinedTypeId = "~effect/ai/Tool/ProviderDefined";
/**
 * @since 1.0.0
 * @category type ids
 */
export const DynamicTypeId = "~effect/ai/Tool/Dynamic";
// =============================================================================
// Type Guards
// =============================================================================
/**
 * Type guard to check if a value is a user-defined tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * const ProviderDefinedTool = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 *
 * console.log(Tool.isUserDefined(UserDefinedTool)) // true
 * console.log(Tool.isUserDefined(ProviderDefinedTool)) // false
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export const isUserDefined = u => Predicate.hasProperty(u, TypeId) && !isProviderDefined(u) && !isDynamic(u);
/**
 * Type guard to check if a value is a provider-defined tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * const ProviderDefinedTool = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 *
 * console.log(Tool.isUserDefined(UserDefinedTool)) // false
 * console.log(Tool.isUserDefined(ProviderDefinedTool)) // true
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export const isProviderDefined = u => Predicate.hasProperty(u, ProviderDefinedTypeId);
/**
 * Type guard to check if a value is a dynamic tool.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const DynamicTool = Tool.dynamic("DynamicTool", {
 *   parameters: { type: "object", properties: {} }
 * })
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   parameters: Schema.Struct({ a: Schema.Number, b: Schema.Number }),
 *   success: Schema.Number
 * })
 *
 * console.log(Tool.isDynamic(DynamicTool)) // true
 * console.log(Tool.isDynamic(UserDefinedTool)) // false
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export const isDynamic = u => Predicate.hasProperty(u, DynamicTypeId);
// =============================================================================
// Constructors
// =============================================================================
const Proto = {
  [TypeId]: {
    _Requirements: identity
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
  addDependency() {
    return userDefinedProto({
      ...this
    });
  },
  setParameters(parametersSchema) {
    return userDefinedProto({
      ...this,
      parametersSchema
    });
  },
  setSuccess(successSchema) {
    return userDefinedProto({
      ...this,
      successSchema
    });
  },
  setFailure(failureSchema) {
    return userDefinedProto({
      ...this,
      failureSchema
    });
  },
  annotate(tag, value) {
    return userDefinedProto({
      ...this,
      annotations: Context.add(this.annotations, tag, value)
    });
  },
  annotateMerge(context) {
    return userDefinedProto({
      ...this,
      annotations: Context.merge(this.annotations, context)
    });
  }
};
const ProviderDefinedProto = {
  ...Proto,
  [ProviderDefinedTypeId]: ProviderDefinedTypeId
};
const DynamicProto = {
  ...Proto,
  [DynamicTypeId]: DynamicTypeId
};
const userDefinedProto = options => {
  const self = Object.assign(Object.create(Proto), options);
  self.id = `effect/ai/Tool/${options.name}`;
  return self;
};
const providerDefinedProto = options => Object.assign(Object.create(ProviderDefinedProto), {
  ...options
});
const dynamicProto = options => {
  const self = Object.assign(Object.create(DynamicProto), options);
  self.id = `effect/ai/Tool/${options.name}`;
  return self;
};
/**
 * Creates a user-defined tool with the specified name and configuration.
 *
 * This is the primary constructor for creating custom tools that AI models
 * can call. The tool definition includes parameter validation, success/failure
 * schemas, and optional service dependencies.
 *
 * If a tool accepts no parameters but still needs an explicit empty object
 * schema, use {@link EmptyParams}.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Simple tool with no parameters
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Returns the current timestamp",
 *   success: Schema.Number
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = (name, options) => {
  const successSchema = options?.success ?? Schema.Void;
  const failureSchema = options?.failure ?? Schema.Never;
  return userDefinedProto({
    name,
    description: options?.description,
    parametersSchema: options?.parameters ?? EmptyParams,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: Context.empty(),
    needsApproval: options?.needsApproval
  });
};
/**
 * Creates a dynamic tool that can accept either an Effect Schema or a raw
 * JSON Schema for its parameters.
 *
 * This is useful for tools where the schema isn't known at compile time,
 * such as MCP tools discovered at runtime or tools from external configurations.
 *
 * - When `parameters` is an Effect Schema: full type safety with validation
 * - When `parameters` is a JSON Schema: handler receives `unknown`, no validation
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // With Effect Schema (typed parameters)
 * const Calculator = Tool.dynamic("Calculator", {
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * // With JSON Schema (untyped parameters)
 * const McpTool = Tool.dynamic("McpTool", {
 *   description: "Tool from MCP server",
 *   parameters: {
 *     type: "object",
 *     properties: { query: { type: "string" } },
 *     required: ["query"]
 *   }
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const dynamic = (name, options) => {
  const successSchema = options?.success ?? Schema.Unknown;
  const failureSchema = options?.failure ?? Schema.Never;
  const rawParameters = options?.parameters ?? Schema.Unknown;
  const isEffectSchema = Schema.isSchema(rawParameters);
  const parametersSchema = isEffectSchema ? rawParameters : Schema.Unknown;
  const jsonSchema = isEffectSchema ? undefined : rawParameters;
  return dynamicProto({
    name,
    description: options?.description,
    parametersSchema,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: Context.empty(),
    needsApproval: options?.needsApproval,
    jsonSchema
  });
};
/**
 * Creates a provider-defined tool which leverages functionality built into a
 * large language model provider (e.g. web search, code execution).
 *
 * These tools are executed by the large language model provider rather than
 * by your application. However, they can optionally require custom handlers
 * implemented in your application to process provider generated results.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Web search tool provided by OpenAI
 * const WebSearch = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       content: Schema.String
 *     }))
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const providerDefined = options => args => {
  const failureMode = Predicate.isNotUndefined(args) && "failureMode" in args ? args.failureMode : undefined;
  const successSchema = options?.success ?? Schema.Void;
  const failureSchema = options?.failure ?? Schema.Never;
  return providerDefinedProto({
    id: options.id,
    name: options.customName,
    providerName: options.providerName,
    args: args,
    argsSchema: options?.args ?? Schema.Void,
    requiresHandler: options.requiresHandler ?? false,
    parametersSchema: options?.parameters ?? Schema.Void,
    successSchema,
    failureSchema,
    failureMode: failureMode ?? "error"
  });
};
// =============================================================================
// Utilities
// =============================================================================
/**
 * A utility which allows mapping between a provider-defined name for a tool
 * and the name given to the tool by the Effect AI SDK.
 *
 * The custom names used by the Effect AI SDK are to allow for toolkits which
 * contain tools from multiple different providers that would otherwise have
 * naming conflicts (i.e. `"web_search"`) to instead use custom names (i.e.
 * `"OpenAiWebSearch"`).
 *
 * @since 1.0.0
 * @category utilities
 */
export class NameMapper {
  #customToProvider = /*#__PURE__*/new Map();
  #providerToCustom = /*#__PURE__*/new Map();
  constructor(tools) {
    for (const tool of tools) {
      if (isProviderDefined(tool)) {
        this.#customToProvider.set(tool.name, tool.providerName);
        this.#providerToCustom.set(tool.providerName, tool.name);
      }
    }
  }
  /**
   * Returns a list of the user-specified tool names in the name mapper.
   */
  get customNames() {
    return Array.from(this.#customToProvider.keys());
  }
  /**
   * Returns a list of the provider-specified tool names in the name mapper.
   */
  get providerNames() {
    return Array.from(this.#providerToCustom.keys());
  }
  /**
   * Returns the user-specified tool name that corresponds with the provided
   * provider-specified tool name.
   *
   * If the provider-specified tool name was not registered with the name mapper,
   * then the provider-specified tool name is returned.
   */
  getCustomName(providerName) {
    return this.#providerToCustom.get(providerName) ?? providerName;
  }
  /**
   * Returns the provider-specified tool name that corresponds with the provided
   * user-specified tool name.
   *
   * If the user-specified tool name was not registered with the name mapper,
   * then the user-specified tool name is returned.
   */
  getProviderName(customName) {
    return this.#customToProvider.get(customName) ?? customName;
  }
}
/**
 * Extracts the description from a tool's metadata.
 *
 * Returns the tool's description if explicitly set, otherwise attempts to
 * extract it from the parameter schema's AST annotations.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myTool = Tool.make("example", {
 *   description: "This is an example tool"
 * })
 *
 * const description = Tool.getDescription(myTool)
 * console.log(description) // "This is an example tool"
 * ```
 *
 * @since 1.0.0
 * @category utilities
 */
export const getDescription = tool => {
  if (tool.description !== undefined) {
    return tool.description;
  }
  if (Schema.isSchema(tool.parametersSchema)) {
    return AST.resolveDescription(tool.parametersSchema.ast);
  }
  return undefined;
};
/**
 * Generates a JSON Schema for a tool.
 *
 * This function creates a JSON Schema representation that can be used by
 * large language models to indicate the structure and type of the parameters
 * that a given tool call should receive.
 *
 * May accept an optional `CodecTransformer` which can be used to transform the
 * tool parameter schema so that the resultant JSON schema for the tool call
 * parameters are in a format that conforms to any provider-specific constraints.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const weatherTool = Tool.make("get_weather", {
 *   parameters: Schema.Struct({
 *     location: Schema.String,
 *     units: Schema.Literals(["celsius", "fahrenheit"])
 *   })
 * })
 *
 * const jsonSchema = Tool.getJsonSchema(weatherTool)
 * console.log(jsonSchema)
 * // {
 * //   type: "object",
 * //   properties: {
 * //     location: { type: "string" },
 * //     units: { type: "string", enum: ["celsius", "fahrenheit"] }
 * //   },
 * //   required: ["location", "units"]
 * // }
 * ```
 *
 * @since 1.0.0
 * @category utilities
 */
export const getJsonSchema = (tool, options) => {
  if (isDynamic(tool) && tool.jsonSchema !== undefined) {
    return tool.jsonSchema;
  }
  return getJsonSchemaFromSchema(tool.parametersSchema, options);
};
/**
 * @since 1.0.0
 * @category utilities
 */
export const getJsonSchemaFromSchema = (schema, options) => {
  if (Predicate.isNotUndefined(options?.transformer)) {
    return options.transformer(schema).jsonSchema;
  }
  const document = Schema.toJsonSchemaDocument(schema);
  if (Object.keys(document.definitions).length > 0) {
    document.schema.$defs = document.definitions;
  }
  return document.schema;
};
// =============================================================================
// Annotations
// =============================================================================
/**
 * Annotation for providing a human-readable title for tools.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myTool = Tool.make("calculate_tip")
 *   .annotate(Tool.Title, "Tip Calculator")
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export class Title extends /*#__PURE__*/Context.Service()("effect/ai/Tool/Title") {}
/**
 * Annotation for providing tool metadata for MCP.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const myCalculatorUi = Tool.make("calculator_ui", {})
 *   .annotate(Tool.Meta, { ui: { resourceUri: "ui://example/calculator-ui" } })
 * ```
 * @since 1.0.0
 * @category annotations
 */
export class Meta extends /*#__PURE__*/Context.Service()("effect/ai/Tool/Meta") {}
/**
 * Annotation indicating whether a tool only reads data without making changes.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const readOnlyTool = Tool.make("get_user_info")
 *   .annotate(Tool.Readonly, true)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export const Readonly = /*#__PURE__*/Context.Reference("effect/ai/Tool/Readonly", {
  defaultValue: constFalse
});
/**
 * Annotation indicating whether a tool performs destructive operations.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const safeTool = Tool.make("search_database")
 *   .annotate(Tool.Destructive, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export const Destructive = /*#__PURE__*/Context.Reference("effect/ai/Tool/Destructive", {
  defaultValue: constTrue
});
/**
 * Annotation indicating whether a tool can be called multiple times safely.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const idempotentTool = Tool.make("get_current_time")
 *   .annotate(Tool.Idempotent, true)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export const Idempotent = /*#__PURE__*/Context.Reference("effect/ai/Tool/Idempotent", {
  defaultValue: constFalse
});
/**
 * Annotation indicating whether a tool can handle arbitrary external data.
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const restrictedTool = Tool.make("internal_operation")
 *   .annotate(Tool.OpenWorld, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export const OpenWorld = /*#__PURE__*/Context.Reference("effect/ai/Tool/OpenWorld", {
  defaultValue: constTrue
});
/**
 * Annotation controlling whether strict JSON schema mode is enabled for a tool.
 *
 * When `true`, providers that support strict mode will send `strict: true` to
 * the model API (e.g. OpenAI's Structured Outputs).
 *
 * When `false`, strict mode is disabled and `strict: false` is sent.
 *
 * When `undefined` (default), the provider's global configuration determines
 * the behavior (e.g. `Config.strictJsonSchema` for OpenAI).
 *
 * @example
 * ```ts
 * import { Tool } from "effect/unstable/ai"
 *
 * const flexibleTool = Tool.make("search")
 *   .annotate(Tool.Strict, false)
 * ```
 *
 * @since 1.0.0
 * @category annotations
 */
export const Strict = /*#__PURE__*/Context.Reference("effect/ai/Tool/Strict", {
  defaultValue: () => undefined
});
/**
 * Returns the strict mode setting for a tool, or `undefined` if not set.
 *
 * @since 1.0.0
 * @category utilities
 */
export const getStrictMode = tool => Context.get(tool.annotations, Strict);
// Licensed under BSD-3-Clause (below code only)
// Code adapted from https://github.com/fastify/secure-json-parse/blob/783fcb1b5434709466759847cec974381939673a/index.js
//
// Copyright (c) Effectful Technologies, Inc (https://effectful.co)
// Copyright (c) 2019 The Fastify Team
// Copyright (c) 2019, Sideway Inc, and project contributors
// All rights reserved.
//
// The complete list of contributors can be found at:
// - https://github.com/hapijs/bourne/graphs/contributors
// - https://github.com/fastify/secure-json-parse/graphs/contributors
// - https://github.com/Effect-TS/effect/commits/main/packages/ai/ai/src/Tool.ts
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
const suspectProtoRx = /"__proto__"\s*:/;
const suspectConstructorRx = /"constructor"\s*:/;
function _parse(text) {
  // Parse normally
  const obj = JSON.parse(text);
  // Ignore null and non-objects
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
    return obj;
  }
  // Scan result for proto keys
  return filter(obj);
}
function filter(obj) {
  let next = [obj];
  while (next.length) {
    const nodes = next;
    next = [];
    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      if (Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}
/**
 * **Unsafe**: This function will throw an error if an insecure property is
 * found in the parsed JSON or if the provided JSON text is not parseable.
 *
 * @since 1.0.0
 * @category utilities
 */
export const unsafeSecureJsonParse = text => {
  // Performance optimization, see https://github.com/fastify/secure-json-parse/pull/90
  const {
    stackTraceLimit
  } = Error;
  Error.stackTraceLimit = 0;
  try {
    return _parse(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
};
/**
 * A schema for tools that accept no parameters.
 *
 * @since 4.0.0
 */
export const EmptyParams = /*#__PURE__*/Schema.Record(Schema.String, Schema.Never);
/** @internal */
export function isEmptyParamsRecord(indexSignature) {
  return indexSignature.parameter === AST.string && AST.isNever(indexSignature.type);
}
//# sourceMappingURL=Tool.js.map