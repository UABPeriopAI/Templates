import * as Effect from "./Effect.ts";
import * as Exit from "./Exit.ts";
import * as Option from "./Option.ts";
import * as Result from "./Result.ts";
import type * as Schema from "./Schema.ts";
import * as AST from "./SchemaAST.ts";
import * as Issue from "./SchemaIssue.ts";
/**
 * @category Constructing
 * @since 4.0.0
 */
export declare function makeEffect<S extends Schema.Top>(schema: S): (input: S["~type.make.in"], options?: Schema.MakeOptions) => Effect.Effect<S["Type"], Issue.Issue>;
/**
 * @category Constructing
 * @since 4.0.0
 */
export declare function makeOption<S extends Schema.Top>(schema: S): (input: S["~type.make.in"], options?: Schema.MakeOptions) => Option.Option<S["Type"]>;
/**
 * @category Constructing
 * @since 4.0.0
 */
export declare function makeUnsafe<S extends Schema.Top>(schema: S): (input: S["~type.make.in"], options?: Schema.MakeOptions) => S["Type"];
/**
 * @category Asserting
 * @since 4.0.0
 */
export declare function is<T>(schema: Schema.Schema<T>): <I>(input: I) => input is I & T;
/**
 * @category Asserting
 * @since 4.0.0
 */
export declare function asserts<T>(schema: Schema.Schema<T>): <I>(input: I) => asserts input is I & T;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownEffect<S extends Schema.Top>(schema: S): (input: unknown, options?: AST.ParseOptions) => Effect.Effect<S["Type"], Issue.Issue, S["DecodingServices"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare const decodeEffect: <S extends Schema.Top>(schema: S) => (input: S["Encoded"], options?: AST.ParseOptions) => Effect.Effect<S["Type"], Issue.Issue, S["DecodingServices"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownPromise<S extends Schema.Decoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Promise<S["Type"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodePromise<S extends Schema.Decoder<unknown>>(schema: S): (input: S["Encoded"], options?: AST.ParseOptions) => Promise<S["Type"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownExit<S extends Schema.Decoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Exit.Exit<S["Type"], Issue.Issue>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare const decodeExit: <S extends Schema.Decoder<unknown>>(schema: S) => (input: S["Encoded"], options?: AST.ParseOptions) => Exit.Exit<S["Type"], Issue.Issue>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownOption<S extends Schema.Decoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Option.Option<S["Type"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare const decodeOption: <S extends Schema.Decoder<unknown>>(schema: S) => (input: S["Encoded"], options?: AST.ParseOptions) => Option.Option<S["Type"]>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownResult<S extends Schema.Decoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Result.Result<S["Type"], Issue.Issue>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare const decodeResult: <S extends Schema.Decoder<unknown>>(schema: S) => (input: S["Encoded"], options?: AST.ParseOptions) => Result.Result<S["Type"], Issue.Issue>;
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare function decodeUnknownSync<S extends Schema.Decoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => S["Type"];
/**
 * @category Decoding
 * @since 4.0.0
 */
export declare const decodeSync: <S extends Schema.Decoder<unknown>>(schema: S) => (input: S["Encoded"], options?: AST.ParseOptions) => S["Type"];
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare function encodeUnknownEffect<S extends Schema.Top>(schema: S): (input: unknown, options?: AST.ParseOptions) => Effect.Effect<S["Encoded"], Issue.Issue, S["EncodingServices"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeEffect: <S extends Schema.Top>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => Effect.Effect<S["Encoded"], Issue.Issue, S["EncodingServices"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeUnknownPromise: <S extends Schema.Encoder<unknown>>(schema: S) => (input: unknown, options?: AST.ParseOptions) => Promise<S["Encoded"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodePromise: <S extends Schema.Encoder<unknown>>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => Promise<S["Encoded"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare function encodeUnknownExit<S extends Schema.Encoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Exit.Exit<S["Encoded"], Issue.Issue>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeExit: <S extends Schema.Encoder<unknown>>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => Exit.Exit<S["Encoded"], Issue.Issue>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare function encodeUnknownOption<S extends Schema.Encoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Option.Option<S["Encoded"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeOption: <S extends Schema.Encoder<unknown>>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => Option.Option<S["Encoded"]>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare function encodeUnknownResult<S extends Schema.Encoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => Result.Result<S["Encoded"], Issue.Issue>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeResult: <S extends Schema.Encoder<unknown>>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => Result.Result<S["Encoded"], Issue.Issue>;
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare function encodeUnknownSync<S extends Schema.Encoder<unknown>>(schema: S): (input: unknown, options?: AST.ParseOptions) => S["Encoded"];
/**
 * @category Encoding
 * @since 4.0.0
 */
export declare const encodeSync: <S extends Schema.Encoder<unknown>>(schema: S) => (input: S["Type"], options?: AST.ParseOptions) => S["Encoded"];
//# sourceMappingURL=SchemaParser.d.ts.map