/**
 * The `Tokenizer` module provides tokenization and text truncation capabilities
 * for large language model text processing workflows.
 *
 * This module offers services for converting text into tokens and truncating
 * prompts based on token limits, essential for managing context length
 * constraints in large language models.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 *
 * const tokenizeText = Effect.gen(function*() {
 *   const tokenizer = yield* Tokenizer.Tokenizer
 *   const tokens = yield* tokenizer.tokenize("Hello, world!")
 *   console.log(`Token count: ${tokens.length}`)
 *   return tokens
 * })
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 *
 * // Truncate a prompt to fit within token limits
 * const truncatePrompt = Effect.gen(function*() {
 *   const tokenizer = yield* Tokenizer.Tokenizer
 *   const longPrompt = "This is a very long prompt..."
 *   const truncated = yield* tokenizer.truncate(longPrompt, 100)
 *   return truncated
 * })
 * ```
 *
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Predicate from "../../Predicate.js";
import * as Prompt from "./Prompt.js";
/**
 * The `Tokenizer` service tag for dependency injection.
 *
 * This tag provides access to tokenization functionality throughout your
 * application, enabling token counting and prompt truncation capabilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 *
 * const useTokenizer = Effect.gen(function*() {
 *   const tokenizer = yield* Tokenizer.Tokenizer
 *   const tokens = yield* tokenizer.tokenize("Hello, world!")
 *   return tokens.length
 * })
 * ```
 *
 * @since 4.0.0
 * @category services
 */
export class Tokenizer extends /*#__PURE__*/Context.Service()("effect/ai/Tokenizer") {}
/**
 * Creates a Tokenizer service implementation from tokenization options.
 *
 * This function constructs a complete Tokenizer service by providing a
 * tokenization function. The service handles both tokenization and
 * truncation operations using the provided tokenizer.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenizer } from "effect/unstable/ai"
 *
 * // Simple word-based tokenizer
 * const wordTokenizer = Tokenizer.make({
 *   tokenize: (prompt) =>
 *     Effect.succeed(
 *       prompt.content
 *         .flatMap((msg) =>
 *           typeof msg.content === "string"
 *             ? msg.content.split(" ")
 *             : msg.content.flatMap((part) =>
 *               part.type === "text" ? part.text.split(" ") : []
 *             )
 *         )
 *         .map((_, index) => index)
 *     )
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = options => Tokenizer.of({
  tokenize(input) {
    return options.tokenize(Prompt.make(input));
  },
  truncate(input, tokens) {
    return truncate(Prompt.make(input), options.tokenize, tokens);
  }
});
const truncate = (self, tokenize, maxTokens) => Effect.suspend(() => {
  let count = 0;
  let inputMessages = self.content;
  let outputMessages = [];
  const loop = Effect.suspend(() => {
    const message = inputMessages[inputMessages.length - 1];
    if (Predicate.isUndefined(message)) {
      return Effect.succeed(Prompt.fromMessages(outputMessages));
    }
    inputMessages = inputMessages.slice(0, inputMessages.length - 1);
    return Effect.flatMap(tokenize(Prompt.fromMessages([message])), tokens => {
      count += tokens.length;
      if (count > maxTokens) {
        return Effect.succeed(Prompt.fromMessages(outputMessages));
      }
      outputMessages = [message, ...outputMessages];
      return loop;
    });
  });
  return loop;
});
//# sourceMappingURL=Tokenizer.js.map