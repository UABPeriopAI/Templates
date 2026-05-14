/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Option from "../../Option.js";
import * as Prompt from "./Prompt.js";
/**
 * @since 4.0.0
 * @category Services
 */
export class ResponseIdTracker extends /*#__PURE__*/Context.Service()("effect/ai/ResponseIdTracker") {}
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = /*#__PURE__*/Effect.sync(() => {
  const sentParts = new Map();
  const none = () => {
    sentParts.clear();
    return Option.none();
  };
  return {
    clearUnsafe() {
      sentParts.clear();
    },
    markParts(parts, responseId) {
      for (let i = 0; i < parts.length; i++) {
        sentParts.set(parts[i], responseId);
      }
    },
    prepareUnsafe(prompt) {
      const messages = prompt.content;
      let anyTracked = false;
      for (let i = 0; i < messages.length; i++) {
        if (sentParts.has(messages[i])) {
          anyTracked = true;
          break;
        }
      }
      if (!anyTracked) return none();
      let lastAssistantIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant") {
          lastAssistantIndex = i;
          break;
        }
      }
      if (lastAssistantIndex === -1) return none();
      let responseId;
      for (let i = 0; i < lastAssistantIndex; i++) {
        const id = sentParts.get(messages[i]);
        if (id === undefined) return none();
        responseId = id;
      }
      if (responseId === undefined) return none();
      const partsAfterLastAssistant = messages.slice(lastAssistantIndex + 1);
      if (partsAfterLastAssistant.length === 0) {
        return none();
      }
      return Option.some({
        previousResponseId: responseId,
        prompt: Prompt.fromMessages(partsAfterLastAssistant)
      });
    }
  };
});
//# sourceMappingURL=ResponseIdTracker.js.map