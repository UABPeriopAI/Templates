/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import * as Option from "../../Option.ts";
import * as Prompt from "./Prompt.ts";
/**
 * @since 4.0.0
 * @category models
 */
export interface PrepareResult {
    readonly previousResponseId: string;
    readonly prompt: Prompt.Prompt;
}
/**
 * @since 4.0.0
 * @category models
 */
export interface Service {
    clearUnsafe(): void;
    markParts(parts: ReadonlyArray<object>, responseId: string): void;
    prepareUnsafe(prompt: Prompt.Prompt): Option.Option<PrepareResult>;
}
declare const ResponseIdTracker_base: Context.ServiceClass<ResponseIdTracker, "effect/ai/ResponseIdTracker", Service>;
/**
 * @since 4.0.0
 * @category Services
 */
export declare class ResponseIdTracker extends ResponseIdTracker_base {
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: Effect.Effect<Service>;
export {};
//# sourceMappingURL=ResponseIdTracker.d.ts.map