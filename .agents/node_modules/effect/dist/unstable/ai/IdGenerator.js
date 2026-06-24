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
import * as Cause from "../../Cause.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Predicate from "../../Predicate.js";
import * as Random from "../../Random.js";
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
export class IdGenerator extends /*#__PURE__*/Context.Service()("@effect/ai/IdGenerator") {}
const DEFAULT_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_SEPARATOR = "_";
const DEFAULT_SIZE = 16;
const makeGenerator = ({
  alphabet = DEFAULT_ALPHABET,
  prefix,
  separator = DEFAULT_SEPARATOR,
  size = DEFAULT_SIZE
}) => {
  const alphabetLength = alphabet.length;
  return Effect.fnUntraced(function* () {
    const chars = new Array(size);
    for (let i = 0; i < size; i++) {
      const index = yield* Random.next;
      chars[i] = alphabet[index * alphabetLength | 0];
    }
    const identifier = chars.join("");
    if (Predicate.isUndefined(prefix)) {
      return identifier;
    }
    return `${prefix}${separator}${identifier}`;
  });
};
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
export const defaultIdGenerator = {
  generateId: /*#__PURE__*/makeGenerator({
    prefix: "id"
  })
};
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
export const make = /*#__PURE__*/Effect.fnUntraced(function* ({
  alphabet = DEFAULT_ALPHABET,
  prefix,
  separator = DEFAULT_SEPARATOR,
  size = DEFAULT_SIZE
}) {
  if (alphabet.includes(separator)) {
    const message = `The separator "${separator}" must not be part of the alphabet "${alphabet}".`;
    return yield* new Cause.IllegalArgumentError(message);
  }
  const generateId = makeGenerator({
    alphabet,
    prefix,
    separator,
    size
  });
  return {
    generateId
  };
});
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
export const layer = options => Layer.effect(IdGenerator)(make(options));
//# sourceMappingURL=IdGenerator.js.map