/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Layer from "../../Layer.ts";
import type * as CliError from "./CliError.ts";
import type { HelpDoc } from "./HelpDoc.ts";
/**
 * Service interface for formatting CLI output including help, errors, and version info.
 * This allows customization of output formatting, including color support.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliOutput } from "effect/unstable/cli"
 *
 * // Create a custom formatter implementation
 * const customFormatter: CliOutput.Formatter = {
 *   formatHelpDoc: (doc) => `Custom Help: ${doc.usage}`,
 *   formatCliError: (error) => `Error: ${error.message}`,
 *   formatError: (error) => `[ERROR] ${error.message}`,
 *   formatVersion: (name, version) => `${name} (${version})`,
 *   formatErrors: (errors) => errors.map((error) => error.message).join("\\n")
 * }
 *
 * // Use the custom formatter in a program
 * const program = Effect.gen(function*() {
 *   const formatter = yield* CliOutput.Formatter
 *   const helpText = formatter.formatVersion("myapp", "1.0.0")
 *   console.log(helpText)
 * }).pipe(
 *   Effect.provide(CliOutput.layer(customFormatter))
 * )
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface Formatter {
    /**
     * Formats a HelpDoc structure into a readable string format.
     *
     * @example
     * ```ts
     * import { Option as O } from "effect"
     * import type { HelpDoc } from "effect/unstable/cli"
     * import { CliOutput } from "effect/unstable/cli"
     *
     * const helpDoc: HelpDoc = {
     *   usage: "myapp [options] <file>",
     *   description: "Process files with various options",
     *   flags: [
     *     {
     *       name: "verbose",
     *       aliases: ["-v"],
     *       type: "boolean",
     *       description: O.some("Enable verbose output"),
     *       required: false
     *     }
     *   ],
     *   args: [
     *     {
     *       name: "file",
     *       type: "string",
     *       description: O.some("Input file to process"),
     *       required: true,
     *       variadic: false
     *     }
     *   ]
     * }
     *
     * const formatter = CliOutput.defaultFormatter()
     * const helpText = formatter.formatHelpDoc(helpDoc)
     * console.log(helpText)
     * // Outputs formatted help with sections: DESCRIPTION, USAGE, ARGUMENTS, FLAGS
     * ```
     *
     * @since 4.0.0
     */
    readonly formatHelpDoc: (doc: HelpDoc) => string;
    /**
     * Formats a CLI error for display. Default implementation mirrors the error message.
     *
     * @example
     * ```ts
     * import * as Data from "effect/Data"
     * import { CliOutput } from "effect/unstable/cli"
     *
     * class InvalidOption extends Data.TaggedError("InvalidOption")<{
     *   readonly message: string
     * }> {}
     *
     * const formatter = CliOutput.defaultFormatter()
     * const error = new InvalidOption({ message: "Unknown flag '--invalid'" })
     * const errorMessage = formatter.formatCliError(error)
     * console.log(errorMessage) // "Unknown flag '--invalid'"
     * ```
     *
     * @since 4.0.0
     */
    readonly formatCliError: (error: CliError.CliError) => string;
    /**
     * Formats an error section with proper styling and color reset.
     *
     * @example
     * ```ts
     * import * as Data from "effect/Data"
     * import { CliOutput } from "effect/unstable/cli"
     *
     * class ValidationError extends Data.TaggedError("ValidationError")<{
     *   readonly message: string
     * }> {}
     *
     * const colorFormatter = CliOutput.defaultFormatter({ colors: true })
     * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
     *
     * const error = new ValidationError({ message: "Value must be positive" })
     *
     * const coloredError = colorFormatter.formatError(error)
     * console.log(coloredError) // "\n\x1b[1m\x1b[31mERROR\x1b[0m\n  Value must be positive\x1b[0m"
     *
     * const plainError = noColorFormatter.formatError(error)
     * console.log(plainError) // "\nERROR\n  Value must be positive"
     * ```
     *
     * @since 4.0.0
     */
    readonly formatError: (error: CliError.CliError) => string;
    /**
     * Formats version output for display.
     *
     * @example
     * ```ts
     * import { CliOutput } from "effect/unstable/cli"
     *
     * const colorFormatter = CliOutput.defaultFormatter({ colors: true })
     * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
     *
     * const appName = "my-awesome-tool"
     * const version = "1.2.3"
     *
     * const coloredVersion = colorFormatter.formatVersion(appName, version)
     * console.log(coloredVersion) // "\x1b[1mmy-awesome-tool\x1b[0m \x1b[2mv\x1b[0m\x1b[1m1.2.3\x1b[0m"
     *
     * const plainVersion = noColorFormatter.formatVersion(appName, version)
     * console.log(plainVersion) // "my-awesome-tool v1.2.3"
     * ```
     *
     * @since 4.0.0
     */
    readonly formatVersion: (name: string, version: string) => string;
    /**
     * Formats multiple CLI errors for display, grouping by error type.
     *
     * @example
     * ```ts
     * import { CliError, CliOutput } from "effect/unstable/cli"
     *
     * const formatter = CliOutput.defaultFormatter({ colors: false })
     *
     * const errors = [
     *   new CliError.UnrecognizedOption({
     *     option: "--foo",
     *     suggestions: ["--force"]
     *   }),
     *   new CliError.UnrecognizedOption({ option: "--bar", suggestions: [] }),
     *   new CliError.MissingOption({ option: "--required" })
     * ]
     *
     * const output = formatter.formatErrors(errors)
     * // Groups errors by type and displays all at once
     * ```
     *
     * @since 4.0.0
     */
    readonly formatErrors: (errors: ReadonlyArray<CliError.CliError>) => string;
}
/**
 * Service reference for the CLI output formatter. Provides a default implementation
 * that can be overridden for custom formatting or testing.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { CliOutput } from "effect/unstable/cli"
 *
 * // Access the formatter service
 * const program = Effect.gen(function*() {
 *   const formatter = yield* CliOutput.Formatter
 *
 *   // Format version information
 *   const versionText = formatter.formatVersion("my-cli", "2.1.0")
 *   console.log(versionText) // "my-cli v2.1.0" (with colors if supported)
 *
 *   return versionText
 * })
 *
 * // Run with default formatter
 * const result = Effect.runSync(program)
 * ```
 *
 * @since 4.0.0
 * @category services
 */
export declare const Formatter: Context.Reference<Formatter>;
/**
 * Creates a Layer that provides a custom Formatter implementation.
 *
 * @example
 * ```ts
 * import * as Console from "effect/Console"
 * import * as Effect from "effect/Effect"
 * import { CliOutput } from "effect/unstable/cli"
 *
 * // Create a custom formatter without colors
 * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
 * const NoColorLayer = CliOutput.layer(noColorFormatter)
 *
 * // Create a program that uses the custom formatter
 * const program = Effect.gen(function*() {
 *   const formatter = yield* CliOutput.Formatter
 *   const versionText = formatter.formatVersion("my-cli", "1.0.0")
 *   yield* Console.log(`Using custom formatter: ${versionText}`)
 * }).pipe(
 *   Effect.provide(NoColorLayer)
 * )
 *
 * // You can also create completely custom formatters
 * const jsonFormatter: CliOutput.Formatter = {
 *   formatHelpDoc: (doc) => JSON.stringify(doc, null, 2),
 *   formatCliError: (error) => JSON.stringify({ error: error.message }),
 *   formatError: (error) =>
 *     JSON.stringify({ type: "error", message: error.message }),
 *   formatVersion: (name, version) => JSON.stringify({ name, version }),
 *   formatErrors: (errors) => JSON.stringify(errors.map((error) => error.message))
 * }
 * const JsonLayer = CliOutput.layer(jsonFormatter)
 * ```
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layer: (formatter: Formatter) => Layer.Layer<never>;
/**
 * Creates a default formatter with configurable options.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError, CliOutput } from "effect/unstable/cli"
 *
 * // Create a formatter without colors for tests or CI environments
 * const noColorFormatter = CliOutput.defaultFormatter({ colors: false })
 *
 * // Create a formatter with colors forced on
 * const colorFormatter = CliOutput.defaultFormatter({ colors: true })
 *
 * // Auto-detect colors based on terminal support (default behavior)
 * const autoFormatter = CliOutput.defaultFormatter()
 *
 * const program = Effect.gen(function*() {
 *   const formatter = colorFormatter
 *
 *   // Format an error with proper styling
 *   const error = new CliError.InvalidValue({
 *     option: "foo",
 *     value: "bar",
 *     expected: "baz",
 *     kind: "flag"
 *   })
 *   const errorText = formatter.formatError(error)
 *   console.log(errorText)
 *
 *   // Format version information
 *   const versionText = formatter.formatVersion("my-tool", "1.2.3")
 *   console.log(versionText)
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const defaultFormatter: (options?: {
    colors?: boolean;
}) => Formatter;
//# sourceMappingURL=CliOutput.d.ts.map