import { memoize } from "../../Function.js";
/** @internal */
export function resolve(ast) {
  return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
/** @internal */
export function resolveAt(key) {
  return ast => resolve(ast)?.[key];
}
/** @internal */
export const resolveIdentifier = /*#__PURE__*/resolveAt("identifier");
/** @internal */
export const resolveTitle = /*#__PURE__*/resolveAt("title");
/** @internal */
export const resolveDescription = /*#__PURE__*/resolveAt("description");
/** @internal */
export const resolveBrands = /*#__PURE__*/resolveAt("brands");
/** @internal */
export const getExpected = /*#__PURE__*/memoize(ast => {
  const identifier = resolveIdentifier(ast);
  if (typeof identifier === "string") return identifier;
  return ast.getExpected(getExpected);
});
/** @internal */
export function collectBrands(annotations) {
  return annotations !== undefined && Array.isArray(annotations.brands) ? annotations.brands : [];
}
//# sourceMappingURL=annotations.js.map