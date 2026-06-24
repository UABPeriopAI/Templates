import * as JsonSchema from "../../../JsonSchema.js";
import * as Schema from "../../../Schema.js";
/** @internal */
export const defaultCodecTransformer = codec => {
  const document = JsonSchema.resolveTopLevel$ref(Schema.toJsonSchemaDocument(codec));
  const jsonSchema = {
    ...document.schema
  };
  if (Object.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return {
    codec,
    jsonSchema
  };
};
//# sourceMappingURL=codec-transformer.js.map