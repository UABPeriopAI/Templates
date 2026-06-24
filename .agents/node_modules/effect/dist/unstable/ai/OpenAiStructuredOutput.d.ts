import * as JsonSchema from "../../JsonSchema.ts";
import * as Schema from "../../Schema.ts";
/**
 * Transforms a `Schema.Codec` into a form compatible with OpenAI's
 * structured output constraints.
 *
 * The transformation walks the schema AST and rewrites constructs that
 * OpenAI does not support natively:
 *
 * - **Tuples** are converted to objects with numeric string keys (e.g.
 *   `"0"`, `"1"`) since OpenAI does not support tuple schemas. Rest
 *   elements are placed under a `"__rest__"` key.
 * - **Optional properties** are replaced with `T | null` unions, because
 *   OpenAI requires all properties to be present.
 * - **Records** (index signatures) are converted to arrays of `[key, value]`
 *   pairs.
 * - **`oneOf` unions** are rewritten as `anyOf` unions.
 * - **Regex patterns** from multiple filters are merged into a single
 *   `pattern` using lookaheads, since OpenAI does not support `allOf`.
 * - **Filters and annotations** are preserved where compatible (e.g.
 *   `description`, supported `format` values like `"date-time"`, `"email"`,
 *   `"uuid"`, etc.), and stripped otherwise.
 *
 * If the schema is already compatible, the original codec is returned
 * unchanged.
 *
 * @since 1.0.0
 * @category Codec Transformation
 */
export declare function toCodecOpenAI<T, E, RD, RE>(schema: Schema.Codec<T, E, RD, RE>): {
    codec: Schema.Codec<T, unknown, RD, RE>;
    jsonSchema: JsonSchema.JsonSchema;
};
//# sourceMappingURL=OpenAiStructuredOutput.d.ts.map