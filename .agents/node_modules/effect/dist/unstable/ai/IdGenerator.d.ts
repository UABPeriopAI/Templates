/**
 * The `IdGenerator` module provides a pluggable system for generating unique identifiers
 * for tool calls and other items in the Effect AI SDKs.
 *
 * This module offers a flexible and configurable approach to ID generation, supporting
 * custom alphabets, prefixes, separators, and sizes.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * // Using the default ID generator
 * const program = Effect.gen(function*() {
 *   const idGen = yield* IdGenerator.IdGenerator
 *   const toolCallId = yield* idGen.generateId()
 *   console.log(toolCallId) // "id_A7xK9mP2qR5tY8uV"
 *   return toolCallId
 * }).pipe(Effect.provideService(
 *   IdGenerator.IdGenerator,
 *   IdGenerator.defaultIdGenerator
 * ))
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * // Creating a custom ID generator for AI tool calls
 * const customLayer = IdGenerator.layer({
 *   alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
 *   prefix: "tool_call",
 *   separator: "-",
 *   size: 12
 * })
 *
 * const program = Effect.gen(function*() {
 *   const idGen = yield* IdGenerator.IdGenerator
 *   const id = yield* idGen.generateId()
 *   console.log(id) // "tool_call-A7XK9MP2QR5T"
 *   return id
 * }).pipe(Effect.provide(customLayer))
 * ```
 *
 * @since 4.0.0
 */
import * as Cause from "../../Cause.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Layer from "../../Layer.ts";
declare const IdGenerator_base: Context.ServiceClass<IdGenerator, "@effect/ai/IdGenerator", Service>;
/**
 * The `IdGenerator` service tag for dependency injection.
 *
 * This tag is used to provide and access ID generation functionality throughout
 * the application. It follows Effect's standard service pattern for type-safe
 * dependency injection.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * const useIdGenerator = Effect.gen(function*() {
 *   const idGenerator = yield* IdGenerator.IdGenerator
 *   const newId = yield* idGenerator.generateId()
 *   return newId
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class IdGenerator extends IdGenerator_base {
}
/**
 * The service interface for ID generation.
 *
 * Defines the contract that all ID generator implementations must fulfill.
 * The service provides a single method for generating unique identifiers
 * in an effectful context.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import type { IdGenerator } from "effect/unstable/ai"
 *
 * // Custom implementation
 * const customService: IdGenerator.Service = {
 *   generateId: () => Effect.succeed(`custom_${Date.now()}`)
 * }
 *
 * const program = Effect.gen(function*() {
 *   const id = yield* customService.generateId()
 *   console.log(id) // "custom_1234567890"
 *   return id
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface Service {
    readonly generateId: () => Effect.Effect<string>;
}
/**
 * Configuration options for creating custom ID generators.
 *
 * @example
 * ```ts
 * import type { IdGenerator } from "effect/unstable/ai"
 *
 * // Configuration for tool call IDs
 * const toolCallOptions: IdGenerator.MakeOptions = {
 *   alphabet: "0123456789ABCDEF",
 *   prefix: "tool",
 *   separator: "_",
 *   size: 8
 * }
 *
 * // This will generate IDs like: "tool_A1B2C3D4"
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface MakeOptions {
    /**
     * The character set to use for generating the random portion of IDs.
     */
    readonly alphabet: string;
    /**
     * Optional prefix to prepend to generated IDs.
     */
    readonly prefix?: string | undefined;
    /**
     * Character used to separate the prefix from the random portion.
     */
    readonly separator: string;
    /**
     * Length of the random portion of the generated ID.
     */
    readonly size: number;
}
/**
 * Default ID generator service implementation.
 *
 * Uses the standard configuration with "id" prefix and generates IDs in the
 * format "id_XXXXXXXXXXXXXXXX" where X represents random alphanumeric
 * characters.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   const id = yield* IdGenerator.defaultIdGenerator.generateId()
 *   console.log(id) // "id_A7xK9mP2qR5tY8uV"
 *   return id
 * })
 *
 * // Or provide it as a service
 * const withDefault = program.pipe(
 *   Effect.provideService(
 *     IdGenerator.IdGenerator,
 *     IdGenerator.defaultIdGenerator
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const defaultIdGenerator: Service;
/**
 * Creates a custom ID generator service with the specified options.
 *
 * Validates the configuration to ensure the separator is not part of the
 * alphabet, which would cause ambiguity in parsing generated IDs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * const program = Effect.gen(function*() {
 *   // Create a generator for AI assistant message IDs
 *   const messageIdGen = yield* IdGenerator.make({
 *     alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
 *     prefix: "msg",
 *     separator: "-",
 *     size: 10
 *   })
 *
 *   const messageId = yield* messageIdGen.generateId()
 *   console.log(messageId) // "msg-A7X9K2M5P8"
 *   return messageId
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * // This will fail with IllegalArgumentError
 * const invalidConfig = IdGenerator.make({
 *   alphabet: "ABC123",
 *   prefix: "test",
 *   separator: "A", // Error: separator is part of alphabet
 *   size: 8
 * })
 *
 * const program = Effect.gen(function*() {
 *   const generator = yield* invalidConfig
 *   return generator
 * }).pipe(
 *   Effect.catch((error) =>
 *     Effect.succeed(`Configuration error: ${error.message}`)
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (args_0: MakeOptions) => Effect.Effect<{
    readonly generateId: () => Effect.Effect<string, never, never>;
}, Cause.IllegalArgumentError, never>;
/**
 * Creates a Layer that provides the IdGenerator service with custom
 * configuration.
 *
 * This is the recommended way to provide ID generation capabilities to your
 * application. The layer will fail during construction if the configuration is
 * invalid.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { IdGenerator } from "effect/unstable/ai"
 *
 * // Create a layer for generating AI tool call IDs
 * const toolCallIdLayer = IdGenerator.layer({
 *   alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
 *   prefix: "tool_call",
 *   separator: "_",
 *   size: 12
 * })
 *
 * const program = Effect.gen(function*() {
 *   const idGen = yield* IdGenerator.IdGenerator
 *   const toolCallId = yield* idGen.generateId()
 *   console.log(toolCallId) // "tool_call_A7XK9MP2QR5T"
 *   return toolCallId
 * }).pipe(Effect.provide(toolCallIdLayer))
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const layer: (options: MakeOptions) => Layer.Layer<IdGenerator, Cause.IllegalArgumentError>;
export {};
//# sourceMappingURL=IdGenerator.d.ts.map