/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import { dual } from "../../Function.js";
import { pipeArguments } from "../../Pipeable.js";
const TypeId = "~effect/httpapi/HttpApiSecurity";
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * Create an Bearer token security scheme.
 *
 * You can implement some api middleware for this security scheme using
 * `HttpApiBuilder.middlewareSecurity`.
 *
 * @since 4.0.0
 * @category constructors
 */
export const bearer = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(Proto), {
  _tag: "Bearer",
  annotations: /*#__PURE__*/Context.empty()
});
/**
 * Create an API key security scheme.
 *
 * You can implement some api middleware for this security scheme using
 * `HttpApiBuilder.middlewareSecurity`.
 *
 * To set the correct cookie in a handler, you can use
 * `HttpApiBuilder.securitySetCookie`.
 *
 * The default value for `in` is "header".
 *
 * @since 4.0.0
 * @category constructors
 */
export const apiKey = options => Object.assign(Object.create(Proto), {
  _tag: "ApiKey",
  key: options.key,
  in: options.in ?? "header",
  annotations: Context.empty()
});
/**
 * @since 4.0.0
 * @category constructors
 */
export const basic = /*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(Proto), {
  _tag: "Basic",
  annotations: /*#__PURE__*/Context.empty()
});
/**
 * @since 4.0.0
 * @category annotations
 */
export const annotateMerge = /*#__PURE__*/dual(2, (self, annotations) => Object.assign(Object.create(Proto), {
  ...self,
  annotations: Context.merge(self.annotations, annotations)
}));
/**
 * @since 4.0.0
 * @category annotations
 */
export const annotate = /*#__PURE__*/dual(3, (self, service, value) => Object.assign(Object.create(Proto), {
  ...self,
  annotations: Context.add(self.annotations, service, value)
}));
//# sourceMappingURL=HttpApiSecurity.js.map