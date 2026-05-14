import * as Runtime from "../../Runtime.ts";
import * as Schema from "../../Schema.ts";
/**
 * @since 4.0.0
 * @category type id
 */
declare const TypeId = "~effect/cli/CliError";
/**
 * Type guard to check if a value is a CLI error.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const handleError = (error: unknown) => {
 *   if (CliError.isCliError(error)) {
 *     console.log("CLI Error:", error.message)
 *     return Effect.succeed("Handled CLI error")
 *   }
 *   return Effect.fail("Unknown error")
 * }
 *
 * // Example usage in error handling
 * const program = Effect.gen(function*() {
 *   const result = yield* Effect.try({
 *     try: () => ({ success: true }),
 *     catch: (error) => error
 *   })
 *   handleError(result)
 * })
 * ```
 *
 * @since 4.0.0
 * @category guards
 */
export declare const isCliError: (u: unknown) => u is CliError;
/**
 * Union type representing all possible CLI error conditions.
 *
 * @example
 * ```ts
 * import type { CliError } from "effect/unstable/cli"
 *
 * const handleCliError = (error: CliError.CliError): void => {
 *   switch (error._tag) {
 *     case "UnrecognizedOption":
 *       console.log(`Unknown flag: ${error.option}`)
 *       break
 *     case "MissingOption":
 *       console.log(`Required flag missing: ${error.option}`)
 *       break
 *     case "InvalidValue":
 *       console.log(`Invalid value: ${error.value} for ${error.option}`)
 *       break
 *     case "ShowHelp":
 *       // Display help for the command path
 *       console.log(`Help requested for: ${error.commandPath.join(" ")}`)
 *       break
 *     default:
 *       console.log(error.message)
 *   }
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type CliError = UnrecognizedOption | DuplicateOption | MissingOption | MissingArgument | InvalidValue | UnknownSubcommand | ShowHelp | UserError;
declare const UnrecognizedOption_base: Schema.Class<UnrecognizedOption, Schema.Struct<{
    readonly _tag: Schema.tag<"UnrecognizedOption">;
    readonly option: Schema.String;
    readonly command: Schema.optional<Schema.$Array<Schema.String>>;
    readonly suggestions: Schema.$Array<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when an unrecognized option is encountered.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * // Creating an unrecognized option error
 * const unrecognizedError = new CliError.UnrecognizedOption({
 *   option: "--unknown-flag",
 *   command: ["deploy", "production"],
 *   suggestions: ["--verbose", "--force"]
 * })
 *
 * console.log(unrecognizedError.message)
 * // "Unrecognized flag: --unknown-flag in command deploy production
 * //
 * //  Did you mean this?
 * //    --verbose
 * //    --force"
 *
 * // In CLI parsing context
 * const parseCommand = Effect.gen(function*() {
 *   // If parsing encounters unknown flag
 *   return yield* unrecognizedError
 * })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class UnrecognizedOption extends UnrecognizedOption_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const DuplicateOption_base: Schema.Class<DuplicateOption, Schema.Struct<{
    readonly _tag: Schema.tag<"DuplicateOption">;
    readonly option: Schema.String;
    readonly parentCommand: Schema.String;
    readonly childCommand: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when duplicate option names are detected between parent and child commands.
 *
 * @example
 * ```ts
 * import { CliError } from "effect/unstable/cli"
 *
 * const duplicateError = new CliError.DuplicateOption({
 *   option: "--verbose",
 *   parentCommand: "myapp",
 *   childCommand: "deploy"
 * })
 *
 * console.log(duplicateError.message)
 * // "Duplicate flag name "--verbose" in parent command "myapp" and subcommand "deploy".
 * // Parent will always claim this flag (Mode A semantics). Consider renaming one of them to avoid confusion."
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class DuplicateOption extends DuplicateOption_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const MissingOption_base: Schema.Class<MissingOption, Schema.Struct<{
    readonly _tag: Schema.tag<"MissingOption">;
    readonly option: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when a required option is missing.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const missingOptionError = new CliError.MissingOption({
 *   option: "api-key"
 * })
 *
 * console.log(missingOptionError.message)
 * // "Missing required flag: --api-key"
 *
 * // In validation context
 * const validateRequiredOptions = (options: Record<string, string | undefined>) =>
 *   Effect.gen(function*() {
 *     const apiKey = options["api-key"]
 *     if (!apiKey) {
 *       return yield* missingOptionError
 *     }
 *     return apiKey
 *   })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class MissingOption extends MissingOption_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const MissingArgument_base: Schema.Class<MissingArgument, Schema.Struct<{
    readonly _tag: Schema.tag<"MissingArgument">;
    readonly argument: Schema.String;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when a required positional argument is missing.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const missingArgError = new CliError.MissingArgument({
 *   argument: "target"
 * })
 *
 * console.log(missingArgError.message)
 * // "Missing required argument: target"
 *
 * // In argument parsing
 * const parseArguments = (args: Array<string>) =>
 *   Effect.gen(function*() {
 *     if (args.length === 0) {
 *       return yield* missingArgError
 *     }
 *     return args[0]
 *   })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class MissingArgument extends MissingArgument_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const InvalidValue_base: Schema.Class<InvalidValue, Schema.Struct<{
    readonly _tag: Schema.tag<"InvalidValue">;
    readonly option: Schema.String;
    readonly value: Schema.String;
    readonly expected: Schema.String;
    readonly kind: Schema.Union<readonly [Schema.Literal<"flag">, Schema.Literal<"argument">]>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when an option or argument value is invalid.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const invalidValueError = new CliError.InvalidValue({
 *   option: "port",
 *   value: "abc123",
 *   expected: "integer between 1 and 65535",
 *   kind: "flag"
 * })
 *
 * console.log(invalidValueError.message)
 * // "Invalid value for flag --port: "abc123". Expected: integer between 1 and 65535"
 *
 * // For positional arguments
 * const invalidArgError = new CliError.InvalidValue({
 *   option: "count",
 *   value: "abc",
 *   expected: "integer",
 *   kind: "argument"
 * })
 *
 * console.log(invalidArgError.message)
 * // "Invalid value for argument <count>: "abc". Expected: integer"
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class InvalidValue extends InvalidValue_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const UnknownSubcommand_base: Schema.Class<UnknownSubcommand, Schema.Struct<{
    readonly _tag: Schema.tag<"UnknownSubcommand">;
    readonly subcommand: Schema.String;
    readonly parent: Schema.optional<Schema.$Array<Schema.String>>;
    readonly suggestions: Schema.$Array<Schema.String>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Error thrown when an unknown subcommand is encountered.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * const unknownSubcommandError = new CliError.UnknownSubcommand({
 *   subcommand: "deplyo", // typo
 *   parent: ["myapp"],
 *   suggestions: ["deploy", "destroy"]
 * })
 *
 * console.log(unknownSubcommandError.message)
 * // "Unknown subcommand "deplyo" for "myapp"
 * //
 * //  Did you mean this?
 * //    deploy
 * //    destroy"
 *
 * // In subcommand parsing
 * const parseSubcommand = (subcommand: string) =>
 *   Effect.gen(function*() {
 *     const validCommands = ["deploy", "destroy", "status"]
 *     if (!validCommands.includes(subcommand)) {
 *       return yield* unknownSubcommandError
 *     }
 *     return subcommand
 *   })
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class UnknownSubcommand extends UnknownSubcommand_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
    /**
     * @since 4.0.0
     */
    get message(): string;
}
declare const UserError_base: Schema.Class<UserError, Schema.Struct<{
    readonly _tag: Schema.tag<"UserError">;
    readonly cause: Schema.Defect;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Wrapper for user (handler) errors to unify under CLI error channel when desired.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CliError } from "effect/unstable/cli"
 *
 * // Wrapping user errors
 * const userError = new CliError.UserError({
 *   cause: new Error("Database connection failed")
 * })
 *
 * // In command handler
 * const deployCommand = Effect.gen(function*() {
 *   const result = yield* Effect.try({
 *     try: () => ({ deployed: true }),
 *     catch: (error) => new CliError.UserError({ cause: error })
 *   })
 *   return result
 * })
 *
 * // In error handling
 * const handleError = (error: CliError.CliError): Effect.Effect<number> => {
 *   if (error._tag === "UserError") {
 *     console.log("Command failed:", error.cause)
 *     return Effect.succeed(1) // Exit code 1
 *   }
 *   return Effect.succeed(0)
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class UserError extends UserError_base {
    /**
     * @since 4.0.0
     */
    readonly [TypeId] = "~effect/cli/CliError";
}
/**
 * Represents errors that should not trigger the display of the CLI's help
 * documentation.
 *
 * @since 4.0.0
 * @category models
 */
export declare const NonShowHelpErrors: Schema.Union<readonly [
    typeof UnrecognizedOption,
    typeof DuplicateOption,
    typeof MissingOption,
    typeof MissingArgument,
    typeof InvalidValue,
    typeof UnknownSubcommand,
    typeof UserError
]>;
/**
 * @since 4.0.0
 * @category models
 */
export type NonShowHelpErrors = typeof NonShowHelpErrors.Type;
declare const ShowHelp_base: Schema.Class<ShowHelp, Schema.Struct<{
    readonly _tag: Schema.tag<"ShowHelp">;
    readonly commandPath: Schema.$Array<Schema.String>;
    readonly errors: Schema.$Array<Schema.Union<readonly [typeof UnrecognizedOption, typeof DuplicateOption, typeof MissingOption, typeof MissingArgument, typeof InvalidValue, typeof UnknownSubcommand, typeof UserError]>>;
}>, import("../../Cause.ts").YieldableError>;
/**
 * Control flow indicator when help is requested via --help flag.
 * This is not an error but uses the error channel for control flow.
 *
 * @since 4.0.0
 * @category models
 */
export declare class ShowHelp extends ShowHelp_base {
    readonly [TypeId] = "~effect/cli/CliError";
    readonly [Runtime.errorExitCode]: number;
    readonly [Runtime.errorReported] = false;
    get message(): string;
}
export {};
//# sourceMappingURL=CliError.d.ts.map