/**
 * @since 4.0.0
 */
/**
 * @since 4.0.0
 */
export const hasBody = method => method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && method !== "TRACE";
/**
 * @since 4.0.0
 */
export const all = /*#__PURE__*/new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"]);
/**
 * @since 4.0.0
 */
export const allShort = [["GET", "get"], ["POST", "post"], ["PUT", "put"], ["DELETE", "del"], ["PATCH", "patch"], ["HEAD", "head"], ["OPTIONS", "options"], ["TRACE", "trace"]];
/**
 * Tests if a value is a `HttpMethod`.
 *
 * **Example**
 *
 * ```ts
 * import { HttpMethod } from "effect/unstable/http"
 *
 * console.log(HttpMethod.isHttpMethod("GET"))
 * // true
 * console.log(HttpMethod.isHttpMethod("get"))
 * // false
 * console.log(HttpMethod.isHttpMethod(1))
 * // false
 * ```
 *
 * @since 4.0.0
 * @category refinements
 */
export const isHttpMethod = u => all.has(u);
//# sourceMappingURL=HttpMethod.js.map