/**
 * @since 4.0.0
 */
/**
 * @since 4.0.0
 * @category models
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE";
/**
 * @since 4.0.0
 * @category models
 */
export declare namespace HttpMethod {
    /**
     * @since 4.0.0
     * @category models
     */
    type NoBody = "GET" | "HEAD" | "OPTIONS" | "TRACE";
    /**
     * @since 4.0.0
     * @category models
     */
    type WithBody = Exclude<HttpMethod, NoBody>;
}
/**
 * @since 4.0.0
 */
export declare const hasBody: (method: HttpMethod) => method is HttpMethod.WithBody;
/**
 * @since 4.0.0
 */
export declare const all: ReadonlySet<HttpMethod>;
/**
 * @since 4.0.0
 */
export declare const allShort: readonly [readonly ["GET", "get"], readonly ["POST", "post"], readonly ["PUT", "put"], readonly ["DELETE", "del"], readonly ["PATCH", "patch"], readonly ["HEAD", "head"], readonly ["OPTIONS", "options"], readonly ["TRACE", "trace"]];
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
export declare const isHttpMethod: (u: unknown) => u is HttpMethod;
//# sourceMappingURL=HttpMethod.d.ts.map