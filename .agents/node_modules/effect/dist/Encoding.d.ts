import * as Result from "./Result.ts";
/**
 * @since 4.0.0
 * @category symbols
 */
export declare const EncodingErrorTypeId: "~effect/encoding/EncodingError";
/**
 * @since 4.0.0
 * @category symbols
 */
export type EncodingErrorTypeId = typeof EncodingErrorTypeId;
declare const EncodingError_base: new <A extends Record<string, any> = {}>(args: import("./Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("./Cause.ts").YieldableError & {
    readonly _tag: "EncodingError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare class EncodingError extends EncodingError_base<{
    kind: "Decode" | "Encode";
    module: string;
    input: unknown;
    message: string;
}> {
    /**
     * @since 4.0.0
     */
    readonly [EncodingErrorTypeId]: EncodingErrorTypeId;
}
/**
 * @since 4.0.0
 * @category guards
 */
export declare const isEncodingError: (u: unknown) => u is EncodingError;
/**
 * Encodes the given value into a base64 (RFC4648) `string`.
 *
 * @example
 * ```ts
 * import { Encoding } from "effect"
 *
 * // Encode a string
 * console.log(Encoding.encodeBase64("hello")) // "aGVsbG8="
 *
 * // Encode binary data
 * const bytes = new Uint8Array([72, 101, 108, 108, 111])
 * console.log(Encoding.encodeBase64(bytes)) // "SGVsbG8="
 * ```
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const encodeBase64: (input: Uint8Array | string) => string;
/**
 * Decodes a base64 (RFC4648) encoded `string` into a `Uint8Array`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeBase64("SGVsbG8=")
 * if (Result.isSuccess(result)) {
 *   console.log(Array.from(result.success)) // [72, 101, 108, 108, 111]
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeBase64: (str: string) => Result.Result<Uint8Array, EncodingError>;
/**
 * Decodes a base64 (RFC4648) encoded `string` into a UTF-8 `string`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeBase64String("aGVsbG8=")
 * if (Result.isSuccess(result)) {
 *   console.log(result.success) // "hello"
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeBase64String: (str: string) => Result.Result<string, EncodingError>;
/**
 * Encodes the given value into a base64 (URL) `string`.
 *
 * @example
 * ```ts
 * import { Encoding } from "effect"
 *
 * // URL-safe base64 encoding (uses - and _ instead of + and /)
 * console.log(Encoding.encodeBase64Url("hello?")) // "aGVsbG8_"
 *
 * const bytes = new Uint8Array([72, 101, 108, 108, 111, 63])
 * console.log(Encoding.encodeBase64Url(bytes)) // "SGVsbG8_"
 * ```
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const encodeBase64Url: (input: Uint8Array | string) => string;
/**
 * Decodes a base64 (URL) encoded `string` into a `Uint8Array`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeBase64Url("SGVsbG8_")
 * if (Result.isSuccess(result)) {
 *   console.log(Array.from(result.success)) // [72, 101, 108, 108, 111, 63]
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeBase64Url: (str: string) => Result.Result<Uint8Array, EncodingError>;
/**
 * Decodes a base64 (URL) encoded `string` into a UTF-8 `string`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeBase64UrlString("aGVsbG8_")
 * if (Result.isSuccess(result)) {
 *   console.log(result.success) // "hello?"
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeBase64UrlString: (str: string) => Result.Result<string, EncodingError>;
/**
 * Encodes the given value into a hex `string`.
 *
 * @example
 * ```ts
 * import { Encoding } from "effect"
 *
 * // Encode a string to hex
 * console.log(Encoding.encodeHex("hello")) // "68656c6c6f"
 *
 * // Encode binary data to hex
 * const bytes = new Uint8Array([72, 101, 108, 108, 111])
 * console.log(Encoding.encodeHex(bytes)) // "48656c6c6f"
 * ```
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const encodeHex: (input: Uint8Array | string) => string;
/**
 * Decodes a hex encoded `string` into a `Uint8Array`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeHex("48656c6c6f")
 * if (Result.isSuccess(result)) {
 *   console.log(Array.from(result.success)) // [72, 101, 108, 108, 111]
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeHex: (str: string) => Result.Result<Uint8Array, EncodingError>;
/**
 * Decodes a hex encoded `string` into a UTF-8 `string`.
 *
 * @example
 * ```ts
 * import { Encoding, Result } from "effect"
 *
 * const result = Encoding.decodeHexString("68656c6c6f")
 * if (Result.isSuccess(result)) {
 *   console.log(result.success) // "hello"
 * }
 * ```
 *
 * @since 4.0.0
 * @category decoding
 */
export declare const decodeHexString: (str: string) => Result.Result<string, EncodingError>;
export {};
//# sourceMappingURL=Encoding.d.ts.map