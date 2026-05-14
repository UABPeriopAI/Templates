import { formatPath } from "../Formatter.js";
/** @internal */
export function errorWithPath(message, path) {
  if (path.length > 0) {
    message += `\n  at ${formatPath(path)}`;
  }
  return new Error(message);
}
//# sourceMappingURL=errors.js.map