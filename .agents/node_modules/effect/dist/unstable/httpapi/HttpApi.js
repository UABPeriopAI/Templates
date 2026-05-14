import * as Context from "../../Context.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as Record from "../../Record.js";
import * as HttpApiEndpoint from "./HttpApiEndpoint.js";
import * as HttpApiSchema from "./HttpApiSchema.js";
const TypeId = "~effect/httpapi/HttpApi";
/**
 * @since 4.0.0
 * @category guards
 */
export const isHttpApi = u => Predicate.hasProperty(u, TypeId);
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  add(...toAdd) {
    const groups = {
      ...this.groups
    };
    for (const group of toAdd) {
      groups[group.identifier] = group;
    }
    return makeProto({
      identifier: this.identifier,
      groups,
      annotations: this.annotations
    });
  },
  addHttpApi(api) {
    const newGroups = {
      ...this.groups
    };
    for (const key in api.groups) {
      const newGroup = api.groups[key];
      newGroup.annotations = Context.merge(api.annotations, newGroup.annotations);
      newGroups[key] = newGroup;
    }
    return makeProto({
      identifier: this.identifier,
      groups: newGroups,
      annotations: this.annotations
    });
  },
  prefix(prefix) {
    return makeProto({
      identifier: this.identifier,
      groups: Record.map(this.groups, group => group.prefix(prefix)),
      annotations: this.annotations
    });
  },
  middleware(tag) {
    return makeProto({
      identifier: this.identifier,
      groups: Record.map(this.groups, group => group.middleware(tag)),
      annotations: this.annotations
    });
  },
  annotate(key, value) {
    return makeProto({
      identifier: this.identifier,
      groups: this.groups,
      annotations: Context.add(this.annotations, key, value)
    });
  },
  annotateMerge(annotations) {
    return makeProto({
      identifier: this.identifier,
      groups: this.groups,
      annotations: Context.merge(this.annotations, annotations)
    });
  }
};
const makeProto = options => {
  function HttpApi() {}
  Object.setPrototypeOf(HttpApi, Proto);
  HttpApi.groups = options.groups;
  HttpApi.annotations = options.annotations;
  return HttpApi;
};
/**
 * An `HttpApi` is a collection of `HttpApiEndpoint`s. You can use an `HttpApi` to
 * represent a portion of your domain.
 *
 * You can then use `HttpApiBuilder.layer(api)` to implement the endpoints of the
 * `HttpApi`.
 *
 * @since 4.0.0
 * @category constructors
 */
export const make = identifier => makeProto({
  identifier,
  groups: new Map(),
  annotations: Context.empty()
});
/**
 * @since 4.0.0
 * @category Reflection
 */
export const reflect = (self, options) => {
  const groups = Object.values(self.groups);
  for (const group of groups) {
    const groupAnnotations = Context.merge(self.annotations, group.annotations);
    options.onGroup({
      group,
      mergedAnnotations: groupAnnotations
    });
    const endpoints = Object.values(group.endpoints);
    for (const endpoint of endpoints) {
      if (options.predicate && !options.predicate({
        endpoint,
        group
      })) continue;
      options.onEndpoint({
        group,
        endpoint,
        middleware: endpoint.middlewares,
        mergedAnnotations: Context.merge(groupAnnotations, endpoint.annotations),
        successes: extractResponseContent(HttpApiEndpoint.getSuccessSchemas(endpoint), HttpApiSchema.getStatusSuccess),
        errors: extractResponseContent(HttpApiEndpoint.getErrorSchemas(endpoint), HttpApiSchema.getStatusError)
      });
    }
  }
};
// -------------------------------------------------------------------------------------
const extractResponseContent = (schemas, getStatus) => {
  const map = new Map();
  schemas.forEach(add);
  return map;
  function add(schema) {
    const ast = schema.ast;
    const status = getStatus(ast);
    const schemas = map.get(status);
    if (schemas === undefined) {
      map.set(status, [schema]);
    } else {
      schemas.push(schema);
    }
  }
};
/**
 * Adds additional schemas to components/schemas.
 * The provided schemas must have a `identifier` annotation.
 *
 * @since 4.0.0
 * @category tags
 */
export class AdditionalSchemas extends /*#__PURE__*/Context.Service()("effect/httpapi/HttpApi/AdditionalSchemas") {}
//# sourceMappingURL=HttpApi.js.map