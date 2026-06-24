/**
 * @since 4.0.0
 */
import * as Config from "../../Config.js";
import * as Effect from "../../Effect.js";
import { format } from "../../Formatter.js";
import * as Schema from "../../Schema.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const make = options => {
  const resourceAttributes = options.attributes ? entriesToAttributes(Object.entries(options.attributes)) : [];
  resourceAttributes.push({
    key: "service.name",
    value: {
      stringValue: options.serviceName
    }
  });
  if (options.serviceVersion) {
    resourceAttributes.push({
      key: "service.version",
      value: {
        stringValue: options.serviceVersion
      }
    });
  }
  return {
    attributes: resourceAttributes,
    droppedAttributesCount: 0
  };
};
/**
 * @since 4.0.0
 * @category Constructors
 */
export const fromConfig = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const attributes = {
    ...(yield* Config.schema(Schema.UndefinedOr(Config.Record(Schema.String, Schema.String)), "OTEL_RESOURCE_ATTRIBUTES")),
    ...options?.attributes
  };
  const serviceName = options?.serviceName ?? attributes["service.name"] ?? (yield* Config.schema(Schema.String, "OTEL_SERVICE_NAME"));
  delete attributes["service.name"];
  const serviceVersion = options?.serviceVersion ?? attributes["service.version"] ?? (yield* Config.schema(Schema.UndefinedOr(Schema.String), "OTEL_SERVICE_VERSION"));
  delete attributes["service.version"];
  return make({
    serviceName,
    serviceVersion,
    attributes
  });
}, Effect.orDie);
/**
 * @since 4.0.0
 * @category Attributes
 */
export const serviceNameUnsafe = resource => {
  const serviceNameAttribute = resource.attributes.find(attr => attr.key === "service.name");
  if (!serviceNameAttribute || !serviceNameAttribute.value.stringValue) {
    throw new Error("Resource does not contain a service name");
  }
  return serviceNameAttribute.value.stringValue;
};
/**
 * @since 4.0.0
 * @category Attributes
 */
export const entriesToAttributes = entries => {
  const attributes = [];
  for (const [key, value] of entries) {
    attributes.push({
      key,
      value: unknownToAttributeValue(value)
    });
  }
  return attributes;
};
/**
 * @since 4.0.0
 * @category Attributes
 */
export const unknownToAttributeValue = value => {
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(unknownToAttributeValue)
      }
    };
  }
  switch (typeof value) {
    case "string":
      return {
        stringValue: value
      };
    case "bigint":
      return {
        intValue: Number(value)
      };
    case "number":
      return Number.isInteger(value) ? {
        intValue: value
      } : {
        doubleValue: value
      };
    case "boolean":
      return {
        boolValue: value
      };
    default:
      return {
        stringValue: format(value)
      };
  }
};
//# sourceMappingURL=OtlpResource.js.map