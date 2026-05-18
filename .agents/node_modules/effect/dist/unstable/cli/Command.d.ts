/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Context from "../../Context.ts";
import * as Effect from "../../Effect.ts";
import type * as FileSystem from "../../FileSystem.ts";
import type * as Layer from "../../Layer.ts";
import * as Option from "../../Option.ts";
import type * as Path from "../../Path.ts";
import type { Pipeable } from "../../Pipeable.ts";
import * as Stdio from "../../Stdio.ts";
import * as Terminal from "../../Terminal.ts";
import type { NoInfer, Simplify } from "../../Types.ts";
import type { ChildProcessSpawner } from "../process/ChildProcessSpawner.ts";
import * as CliError from "./CliError.ts";
import * as GlobalFlag from "./GlobalFlag.ts";
import { TypeId } from "./internal/command.ts";
import * as Param from "./Param.ts";
/**
 * Represents a CLI command with its configuration, handler, and metadata.
 *
 * Commands are the core building blocks of CLI applications. They define:
 * - The command name and description
 * - Configuration including flags and arguments
 * - Handler function for execution
 * - Optional subcommands for hierarchical structures
 *
 * @example
 * ```ts
 * import { Console } from "effect"
 * import { Argument, Command, Flag } from "effect/unstable/cli"
 *
 * // Simple command with no configuration
 * const version: Command.Command<"version", {}, {}, never, never> = Command.make(
 *   "version"
 * )
 *
 * // Command with flags and arguments
 * const deploy: Command.Command<
 *   "deploy",
 *   {
 *     readonly env: string
 *     readonly force: boolean
 *     readonly files: ReadonlyArray<string>
 *   },
 *   {},
 *   never,
 *   never
 * > = Command.make("deploy", {
 *   env: Flag.string("env"),
 *   force: Flag.boolean("force"),
 *   files: Argument.string("files").pipe(Argument.variadic())
 * })
 *
 * // Command with handler
 * const greet = Command.make("greet", {
 *   name: Flag.string("name")
 * }, (config) => Console.log(`Hello, ${config.name}!`))
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface Command<Name extends string, Input, ContextInput = {}, E = never, R = never> extends Pipeable, Effect.Yieldable<Command<Name, Input, ContextInput, E, R>, ContextInput, never, CommandContext<Name>> {
    readonly [TypeId]: typeof TypeId;
    /**
     * The name of the command.
     */
    readonly name: Name;
    /**
     * An optional description of the command.
     */
    readonly description: string | undefined;
    /**
     * An optional short description used when listing subcommands.
     */
    readonly shortDescription: string | undefined;
    /**
     * An optional alias that can be used as a shorter command name.
     */
    readonly alias: string | undefined;
    /**
     * Optional usage examples for the command.
     */
    readonly examples: ReadonlyArray<Command.Example>;
    /**
     * The subcommands available under this command.
     */
    readonly subcommands: ReadonlyArray<{
        readonly group: string | undefined;
        readonly commands: NonEmptyReadonlyArray<Command.Any>;
    }>;
    /**
     * Custom annotations associated with this command.
     */
    readonly annotations: Context.Context<never>;
}
/**
 * @since 4.0.0
 */
export declare namespace Command {
    /**
     * Represents a concrete usage example for a command.
     *
     * @since 4.0.0
     * @category models
     */
    interface Example {
        readonly command: string;
        readonly description?: string | undefined;
    }
    /**
     * Configuration object for defining command flags, arguments, and nested structures.
     *
     * Command.Config allows you to specify:
     * - Individual flags and arguments using Param types
     * - Nested configuration objects for organization
     * - Arrays of parameters for repeated elements
     *
     * @example
     * ```ts
     * import { Argument, Flag } from "effect/unstable/cli"
     * import type * as CliCommand from "effect/unstable/cli/Command"
     *
     * // Simple flat configuration
     * const simpleConfig: CliCommand.Command.Config = {
     *   name: Flag.string("name"),
     *   age: Flag.integer("age"),
     *   file: Argument.string("file")
     * }
     *
     * // Nested configuration for organization
     * const nestedConfig: CliCommand.Command.Config = {
     *   user: {
     *     name: Flag.string("name"),
     *     email: Flag.string("email")
     *   },
     *   server: {
     *     host: Flag.string("host"),
     *     port: Flag.integer("port")
     *   }
     * }
     * ```
     *
     * @since 4.0.0
     * @category models
     */
    interface Config {
        readonly [key: string]: Param.Param<Param.ParamKind, any> | ReadonlyArray<Param.Param<Param.ParamKind, any> | Config> | Config;
    }
    /**
     * Configuration shape accepted by `Command.withSharedFlags`.
     *
     * Only flags are allowed here; arguments are intentionally excluded.
     *
     * @since 4.0.0
     * @category models
     */
    interface FlagConfig {
        readonly [key: string]: Param.Param<typeof Param.flagKind, any> | ReadonlyArray<Param.Param<typeof Param.flagKind, any> | FlagConfig> | FlagConfig;
    }
    /**
     * Utilities for working with command configurations.
     *
     * @since 4.0.0
     * @category models
     */
    namespace Config {
        /**
         * Infers the TypeScript type from a Command.Config structure.
         *
         * This type utility extracts the final configuration type that handlers will receive,
         * preserving the nested structure while converting Param types to their values.
         *
         * @example
         * ```ts
         * import { Flag } from "effect/unstable/cli"
         * import type * as CliCommand from "effect/unstable/cli/Command"
         *
         * const config = {
         *   name: Flag.string("name"),
         *   server: {
         *     host: Flag.string("host"),
         *     port: Flag.integer("port")
         *   }
         * } as const
         *
         * type Result = CliCommand.Command.Config.Infer<typeof config>
         * // {
         * //   readonly name: string
         * //   readonly server: {
         * //     readonly host: string
         * //     readonly port: number
         * //   }
         * // }
         * ```
         *
         * @since 4.0.0
         * @category models
         */
        type Infer<A extends Config> = Simplify<{
            readonly [Key in keyof A]: InferValue<A[Key]>;
        }>;
        /**
         * Helper type utility for recursively inferring types from Config values.
         *
         * @since 4.0.0
         * @category models
         */
        type InferValue<A> = A extends ReadonlyArray<any> ? {
            readonly [Key in keyof A]: InferValue<A[Key]>;
        } : A extends Param.Param<infer _Kind, infer _Value> ? _Value : A extends Config ? Infer<A> : never;
    }
    /**
     * Represents any Command regardless of its type parameters.
     *
     * @since 4.0.0
     * @category models
     */
    type Any = Command<string, unknown, unknown, unknown, unknown>;
    /**
     * A grouped set of subcommands used by `Command.withSubcommands`.
     *
     * @since 4.0.0
     * @category models
     */
    interface SubcommandGroup<Commands extends ReadonlyArray<Any> = ReadonlyArray<Any>> {
        readonly group: string;
        readonly commands: Commands;
    }
    /**
     * Entry type accepted by `Command.withSubcommands`.
     *
     * @since 4.0.0
     * @category models
     */
    type SubcommandEntry = Any | SubcommandGroup<ReadonlyArray<Any>>;
}
/**
 * The environment required by CLI commands, including file system and path operations.
 *
 * @since 4.0.0
 * @category utility types
 */
export type Environment = FileSystem.FileSystem | Path.Path | Terminal.Terminal | ChildProcessSpawner | Stdio.Stdio;
/**
 * A utility type to extract the error type from a `Command`.
 *
 * @since 4.0.0
 * @category utility types
 */
export type Error<C> = C extends Command<infer _Name, infer _Input, infer _ContextInput, infer _Error, infer _Requirements> ? _Error : never;
/**
 * Service context for a specific command, enabling subcommands to access their parent's parsed configuration.
 *
 * When a subcommand handler needs access to flags or arguments from a parent command,
 * it can yield the parent command directly to retrieve its config. This is powered by
 * Effect's service system - each command automatically creates a service that provides
 * its parsed input to child commands.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const parent = Command.make("app").pipe(
 *   Command.withSharedFlags({
 *     verbose: Flag.boolean("verbose"),
 *     config: Flag.string("config")
 *   })
 * )
 *
 * const child = Command.make("deploy", {
 *   target: Flag.string("target")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     // Access parent's config by yielding the parent command
 *     const parentConfig = yield* parent
 *     yield* Console.log(`Verbose: ${parentConfig.verbose}`)
 *     yield* Console.log(`Config: ${parentConfig.config}`)
 *     yield* Console.log(`Target: ${config.target}`)
 *   }))
 *
 * const app = parent.pipe(Command.withSubcommands([child]))
 * // Usage: app --verbose --config prod.json deploy --target staging
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface CommandContext<Name extends string> {
    readonly _: unique symbol;
    readonly name: Name;
}
/**
 * Represents the parsed tokens from command-line input before validation.
 *
 * @since 4.0.0
 * @category models
 */
export interface ParsedTokens {
    readonly flags: Record<string, ReadonlyArray<string>>;
    readonly arguments: ReadonlyArray<string>;
    readonly errors?: ReadonlyArray<CliError.NonShowHelpErrors>;
    readonly subcommand: Option.Option<{
        readonly name: string;
        readonly parsedInput: ParsedTokens;
    }>;
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isCommand: (u: unknown) => u is Command.Any;
/**
 * Creates a Command from a name, optional config, optional handler function, and optional description.
 *
 * The make function is the primary constructor for CLI commands. It provides multiple overloads
 * to support different patterns of command creation, from simple commands with no configuration
 * to complex commands with nested configurations and error handling.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Argument, Command, Flag } from "effect/unstable/cli"
 *
 * // Simple command with no configuration
 * const version = Command.make("version")
 *
 * // Command with simple flags
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * })
 *
 * // Command with nested configuration
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env").pipe(
 *     Flag.withDescription("Target environment")
 *   ),
 *   server: {
 *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
 *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
 *   },
 *   files: Argument.string("files").pipe(Argument.variadic),
 *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
 * })
 *
 * // Command with handler
 * const deployWithHandler = Command.make("deploy", {
 *   environment: Flag.string("env"),
 *   force: Flag.boolean("force")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Starting deployment to ${config.environment}`)
 *
 *     if (!config.force && config.environment === "production") {
 *       return yield* Effect.fail("Production deployments require --force flag")
 *     }
 *
 *     yield* Console.log("Deployment completed successfully")
 *   }))
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const make: {
    /**
     * Creates a Command from a name, optional config, optional handler function, and optional description.
     *
     * The make function is the primary constructor for CLI commands. It provides multiple overloads
     * to support different patterns of command creation, from simple commands with no configuration
     * to complex commands with nested configurations and error handling.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Argument, Command, Flag } from "effect/unstable/cli"
     *
     * // Simple command with no configuration
     * const version = Command.make("version")
     *
     * // Command with simple flags
     * const greet = Command.make("greet", {
     *   name: Flag.string("name"),
     *   count: Flag.integer("count").pipe(Flag.withDefault(1))
     * })
     *
     * // Command with nested configuration
     * const deploy = Command.make("deploy", {
     *   environment: Flag.string("env").pipe(
     *     Flag.withDescription("Target environment")
     *   ),
     *   server: {
     *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
     *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
     *   },
     *   files: Argument.string("files").pipe(Argument.variadic),
     *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
     * })
     *
     * // Command with handler
     * const deployWithHandler = Command.make("deploy", {
     *   environment: Flag.string("env"),
     *   force: Flag.boolean("force")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Starting deployment to ${config.environment}`)
     *
     *     if (!config.force && config.environment === "production") {
     *       return yield* Effect.fail("Production deployments require --force flag")
     *     }
     *
     *     yield* Console.log("Deployment completed successfully")
     *   }))
     * ```
     *
     * @since 4.0.0
     * @category constructors
     */
    <Name extends string>(name: Name): Command<Name, {}, {}, never, never>;
    /**
     * Creates a Command from a name, optional config, optional handler function, and optional description.
     *
     * The make function is the primary constructor for CLI commands. It provides multiple overloads
     * to support different patterns of command creation, from simple commands with no configuration
     * to complex commands with nested configurations and error handling.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Argument, Command, Flag } from "effect/unstable/cli"
     *
     * // Simple command with no configuration
     * const version = Command.make("version")
     *
     * // Command with simple flags
     * const greet = Command.make("greet", {
     *   name: Flag.string("name"),
     *   count: Flag.integer("count").pipe(Flag.withDefault(1))
     * })
     *
     * // Command with nested configuration
     * const deploy = Command.make("deploy", {
     *   environment: Flag.string("env").pipe(
     *     Flag.withDescription("Target environment")
     *   ),
     *   server: {
     *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
     *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
     *   },
     *   files: Argument.string("files").pipe(Argument.variadic),
     *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
     * })
     *
     * // Command with handler
     * const deployWithHandler = Command.make("deploy", {
     *   environment: Flag.string("env"),
     *   force: Flag.boolean("force")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Starting deployment to ${config.environment}`)
     *
     *     if (!config.force && config.environment === "production") {
     *       return yield* Effect.fail("Production deployments require --force flag")
     *     }
     *
     *     yield* Console.log("Deployment completed successfully")
     *   }))
     * ```
     *
     * @since 4.0.0
     * @category constructors
     */
    <Name extends string, const Config extends Command.Config>(name: Name, config: Config): Command<Name, Command.Config.Infer<Config>, {}, never, never>;
    /**
     * Creates a Command from a name, optional config, optional handler function, and optional description.
     *
     * The make function is the primary constructor for CLI commands. It provides multiple overloads
     * to support different patterns of command creation, from simple commands with no configuration
     * to complex commands with nested configurations and error handling.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Argument, Command, Flag } from "effect/unstable/cli"
     *
     * // Simple command with no configuration
     * const version = Command.make("version")
     *
     * // Command with simple flags
     * const greet = Command.make("greet", {
     *   name: Flag.string("name"),
     *   count: Flag.integer("count").pipe(Flag.withDefault(1))
     * })
     *
     * // Command with nested configuration
     * const deploy = Command.make("deploy", {
     *   environment: Flag.string("env").pipe(
     *     Flag.withDescription("Target environment")
     *   ),
     *   server: {
     *     host: Flag.string("host").pipe(Flag.withDefault("localhost")),
     *     port: Flag.integer("port").pipe(Flag.withDefault(3000))
     *   },
     *   files: Argument.string("files").pipe(Argument.variadic),
     *   force: Flag.boolean("force").pipe(Flag.withDescription("Force deployment"))
     * })
     *
     * // Command with handler
     * const deployWithHandler = Command.make("deploy", {
     *   environment: Flag.string("env"),
     *   force: Flag.boolean("force")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Starting deployment to ${config.environment}`)
     *
     *     if (!config.force && config.environment === "production") {
     *       return yield* Effect.fail("Production deployments require --force flag")
     *     }
     *
     *     yield* Console.log("Deployment completed successfully")
     *   }))
     * ```
     *
     * @since 4.0.0
     * @category constructors
     */
    <Name extends string, const Config extends Command.Config, R, E>(name: Name, config: Config, handler: (config: Command.Config.Infer<Config>) => Effect.Effect<void, E, R>): Command<Name, Command.Config.Infer<Config>, {}, E, Exclude<R, GlobalFlag.BuiltInSettingContext>>;
};
/**
 * Adds or replaces the handler for a command.
 *
 * @example
 * ```ts
 * import { Console } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Command without initial handler
 * const greet = Command.make("greet", {
 *   name: Flag.string("name")
 * })
 *
 * // Add handler later
 * const greetWithHandler = greet.pipe(
 *   Command.withHandler((config: { readonly name: string }) =>
 *     Console.log(`Hello, ${config.name}!`)
 *   )
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withHandler: {
    /**
     * Adds or replaces the handler for a command.
     *
     * @example
     * ```ts
     * import { Console } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * // Command without initial handler
     * const greet = Command.make("greet", {
     *   name: Flag.string("name")
     * })
     *
     * // Add handler later
     * const greetWithHandler = greet.pipe(
     *   Command.withHandler((config: { readonly name: string }) =>
     *     Console.log(`Hello, ${config.name}!`)
     *   )
     * )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <A, R, E>(handler: (value: A) => Effect.Effect<void, E, R>): <Name extends string, XR, XE, ContextInput>(self: Command<Name, A, ContextInput, XE, XR>) => Command<Name, A, ContextInput, E, Exclude<R, GlobalFlag.BuiltInSettingContext>>;
    /**
     * Adds or replaces the handler for a command.
     *
     * @example
     * ```ts
     * import { Console } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * // Command without initial handler
     * const greet = Command.make("greet", {
     *   name: Flag.string("name")
     * })
     *
     * // Add handler later
     * const greetWithHandler = greet.pipe(
     *   Command.withHandler((config: { readonly name: string }) =>
     *     Console.log(`Hello, ${config.name}!`)
     *   )
     * )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, A, XR, XE, R, E, ContextInput>(self: Command<Name, A, ContextInput, XE, XR>, handler: (value: A) => Effect.Effect<void, E, R>): Command<Name, A, ContextInput, E, Exclude<R, GlobalFlag.BuiltInSettingContext>>;
};
/**
 * Adds subcommands to a command, creating a hierarchical command structure.
 *
 * Subcommands can access their parent's parsed configuration by yielding the parent
 * command within their handler. This enables shared parent flags that affect
 * all subcommands.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * // Parent command with shared flags
 * const git = Command.make("git").pipe(
 *   Command.withSharedFlags({
 *     verbose: Flag.boolean("verbose")
 *   })
 * )
 *
 * // Subcommand that accesses parent config
 * const clone = Command.make("clone", {
 *   repository: Flag.string("repo")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const parent = yield* git // Access parent's parsed config
 *     if (parent.verbose) {
 *       yield* Console.log("Verbose mode enabled")
 *     }
 *     yield* Console.log(`Cloning ${config.repository}`)
 *   }))
 *
 * const app = git.pipe(Command.withSubcommands([clone]))
 * // Usage: git --verbose clone --repo github.com/foo/bar
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withSubcommands: {
    /**
     * Adds subcommands to a command, creating a hierarchical command structure.
     *
     * Subcommands can access their parent's parsed configuration by yielding the parent
     * command within their handler. This enables shared parent flags that affect
     * all subcommands.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * // Parent command with shared flags
     * const git = Command.make("git").pipe(
     *   Command.withSharedFlags({
     *     verbose: Flag.boolean("verbose")
     *   })
     * )
     *
     * // Subcommand that accesses parent config
     * const clone = Command.make("clone", {
     *   repository: Flag.string("repo")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     const parent = yield* git // Access parent's parsed config
     *     if (parent.verbose) {
     *       yield* Console.log("Verbose mode enabled")
     *     }
     *     yield* Console.log(`Cloning ${config.repository}`)
     *   }))
     *
     * const app = git.pipe(Command.withSubcommands([clone]))
     * // Usage: git --verbose clone --repo github.com/foo/bar
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <const Subcommands extends ReadonlyArray<Command.SubcommandEntry>>(subcommands: Subcommands): <Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Simplify<Input | ContextInput>, ContextInput, E | ExtractSubcommandErrors<Subcommands>, R | Exclude<ExtractSubcommandContext<Subcommands>, CommandContext<Name>>>;
    /**
     * Adds subcommands to a command, creating a hierarchical command structure.
     *
     * Subcommands can access their parent's parsed configuration by yielding the parent
     * command within their handler. This enables shared parent flags that affect
     * all subcommands.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * // Parent command with shared flags
     * const git = Command.make("git").pipe(
     *   Command.withSharedFlags({
     *     verbose: Flag.boolean("verbose")
     *   })
     * )
     *
     * // Subcommand that accesses parent config
     * const clone = Command.make("clone", {
     *   repository: Flag.string("repo")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     const parent = yield* git // Access parent's parsed config
     *     if (parent.verbose) {
     *       yield* Console.log("Verbose mode enabled")
     *     }
     *     yield* Console.log(`Cloning ${config.repository}`)
     *   }))
     *
     * const app = git.pipe(Command.withSubcommands([clone]))
     * // Usage: git --verbose clone --repo github.com/foo/bar
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, Input, E, R, ContextInput, const Subcommands extends ReadonlyArray<Command.SubcommandEntry>>(self: Command<Name, Input, ContextInput, E, R>, subcommands: Subcommands): Command<Name, Simplify<Input | ContextInput>, ContextInput, E | ExtractSubcommandErrors<Subcommands>, R | Exclude<ExtractSubcommandContext<Subcommands>, CommandContext<Name>>>;
};
/**
 * Adds flags that are inherited by subcommands.
 *
 * Shared flags are available to this command's handler and to descendant
 * handlers via `yield* parentCommand`. Shared flags are accepted both before
 * and after a selected subcommand name (npm-style).
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withSharedFlags: {
    /**
     * Adds flags that are inherited by subcommands.
     *
     * Shared flags are available to this command's handler and to descendant
     * handlers via `yield* parentCommand`. Shared flags are accepted both before
     * and after a selected subcommand name (npm-style).
     *
     * @since 4.0.0
     * @category combinators
     */
    <const SharedFlags extends Command.FlagConfig>(sharedFlags: SharedFlags): <Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Simplify<Input & Command.Config.Infer<SharedFlags>>, Simplify<ContextInput & Command.Config.Infer<SharedFlags>>, E, R>;
    /**
     * Adds flags that are inherited by subcommands.
     *
     * Shared flags are available to this command's handler and to descendant
     * handlers via `yield* parentCommand`. Shared flags are accepted both before
     * and after a selected subcommand name (npm-style).
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, Input, E, R, ContextInput, const SharedFlags extends Command.FlagConfig>(self: Command<Name, Input, ContextInput, E, R>, sharedFlags: SharedFlags): Command<Name, Simplify<Input & Command.Config.Infer<SharedFlags>>, Simplify<ContextInput & Command.Config.Infer<SharedFlags>>, E, R>;
};
/**
 * Declares global flags for a command scope.
 *
 * Declared global flags apply to the command and all of its descendants.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withGlobalFlags: {
    /**
     * Declares global flags for a command scope.
     *
     * Declared global flags apply to the command and all of its descendants.
     *
     * @since 4.0.0
     * @category combinators
     */
    <const GlobalFlags extends ReadonlyArray<GlobalFlag.GlobalFlag<any>>>(globalFlags: GlobalFlags): <Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, Exclude<R, ExtractGlobalFlagContext<GlobalFlags>>>;
    /**
     * Declares global flags for a command scope.
     *
     * Declared global flags apply to the command and all of its descendants.
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, Input, E, R, ContextInput, const GlobalFlags extends ReadonlyArray<GlobalFlag.GlobalFlag<any>>>(self: Command<Name, Input, ContextInput, E, R>, globalFlags: GlobalFlags): Command<Name, Input, ContextInput, E, Exclude<R, ExtractGlobalFlagContext<GlobalFlags>>>;
};
type ExtractGlobalFlagContext<T extends ReadonlyArray<GlobalFlag.GlobalFlag<any>>> = T[number] extends infer F ? F extends GlobalFlag.Setting<infer Id, infer _A> ? GlobalFlag.Setting.Identifier<Id> : never : never;
type ExtractSubcommand<T> = T extends Command<infer _Name, infer _Input, infer _CI, infer _E, infer _R> ? T : T extends Command.SubcommandGroup<infer Commands> ? Commands[number] : never;
type ExtractSubcommandErrors<T extends ReadonlyArray<Command.SubcommandEntry>> = Error<ExtractSubcommand<T[number]>>;
type ExtractSubcommandContext<T extends ReadonlyArray<Command.SubcommandEntry>> = ExtractSubcommand<T[number]> extends Command<infer _Name, infer _Input, infer _CI, infer _E, infer _R> ? _R : never;
/**
 * Sets the description for a command.
 *
 * Descriptions provide users with information about what the command does
 * when they view help documentation.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const deploy = Command.make("deploy", {
 *   environment: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Deploying to ${config.environment}`)
 *   })).pipe(
 *     Command.withDescription("Deploy the application to a specified environment")
 *   )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withDescription: {
    /**
     * Sets the description for a command.
     *
     * Descriptions provide users with information about what the command does
     * when they view help documentation.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const deploy = Command.make("deploy", {
     *   environment: Flag.string("env")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Deploying to ${config.environment}`)
     *   })).pipe(
     *     Command.withDescription("Deploy the application to a specified environment")
     *   )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    (description: string): <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Sets the description for a command.
     *
     * Descriptions provide users with information about what the command does
     * when they view help documentation.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const deploy = Command.make("deploy", {
     *   environment: Flag.string("env")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Deploying to ${config.environment}`)
     *   })).pipe(
     *     Command.withDescription("Deploy the application to a specified environment")
     *   )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>, description: string): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Sets a short description for a command.
 *
 * Short descriptions are used when listing subcommands in help output and
 * shell completions. If no short description is provided, the full
 * `description` is used as a fallback.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withShortDescription: {
    /**
     * Sets a short description for a command.
     *
     * Short descriptions are used when listing subcommands in help output and
     * shell completions. If no short description is provided, the full
     * `description` is used as a fallback.
     *
     * @since 4.0.0
     * @category combinators
     */
    (shortDescription: string): <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Sets a short description for a command.
     *
     * Short descriptions are used when listing subcommands in help output and
     * shell completions. If no short description is provided, the full
     * `description` is used as a fallback.
     *
     * @since 4.0.0
     * @category combinators
     */
    <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>, shortDescription: string): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Sets an alias for a command.
 *
 * Aliases are accepted as alternate subcommand names during parsing and are
 * shown in help output as `name, alias`.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withAlias: {
    /**
     * Sets an alias for a command.
     *
     * Aliases are accepted as alternate subcommand names during parsing and are
     * shown in help output as `name, alias`.
     *
     * @since 4.0.0
     * @category combinators
     */
    (alias: string): <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Sets an alias for a command.
     *
     * Aliases are accepted as alternate subcommand names during parsing and are
     * shown in help output as `name, alias`.
     *
     * @since 4.0.0
     * @category combinators
     */
    <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>, alias: string): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Adds a custom annotation to a command.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const annotate: {
    /**
     * Adds a custom annotation to a command.
     *
     * @since 4.0.0
     * @category combinators
     */
    <I, S>(service: Context.Key<I, S>, value: NoInfer<S>): <Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Adds a custom annotation to a command.
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, Input, E, R, ContextInput, I, S>(self: Command<Name, Input, ContextInput, E, R>, service: Context.Key<I, S>, value: NoInfer<S>): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Merges a Context of annotations into a command.
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const annotateMerge: {
    /**
     * Merges a Context of annotations into a command.
     *
     * @since 4.0.0
     * @category combinators
     */
    <I>(annotations: Context.Context<I>): <Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Merges a Context of annotations into a command.
     *
     * @since 4.0.0
     * @category combinators
     */
    <Name extends string, Input, E, R, ContextInput, I>(self: Command<Name, Input, ContextInput, E, R>, annotations: Context.Context<I>): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Sets usage examples for a command.
 *
 * Examples are exposed in structured `HelpDoc` data and rendered by the
 * default formatter in an `EXAMPLES` section.
 *
 * @example
 * ```ts
 * import { Command } from "effect/unstable/cli"
 *
 * const login = Command.make("login").pipe(
 *   Command.withExamples([
 *     { command: "myapp login", description: "Log in with browser OAuth" },
 *     { command: "myapp login --token sbp_abc123", description: "Log in with a token" }
 *   ])
 * )
 * ```
 *
 * @since 4.0.0
 * @category combinators
 */
export declare const withExamples: {
    /**
     * Sets usage examples for a command.
     *
     * Examples are exposed in structured `HelpDoc` data and rendered by the
     * default formatter in an `EXAMPLES` section.
     *
     * @example
     * ```ts
     * import { Command } from "effect/unstable/cli"
     *
     * const login = Command.make("login").pipe(
     *   Command.withExamples([
     *     { command: "myapp login", description: "Log in with browser OAuth" },
     *     { command: "myapp login --token sbp_abc123", description: "Log in with a token" }
     *   ])
     * )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    (examples: ReadonlyArray<Command.Example>): <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, R>;
    /**
     * Sets usage examples for a command.
     *
     * Examples are exposed in structured `HelpDoc` data and rendered by the
     * default formatter in an `EXAMPLES` section.
     *
     * @example
     * ```ts
     * import { Command } from "effect/unstable/cli"
     *
     * const login = Command.make("login").pipe(
     *   Command.withExamples([
     *     { command: "myapp login", description: "Log in with browser OAuth" },
     *     { command: "myapp login --token sbp_abc123", description: "Log in with a token" }
     *   ])
     * )
     * ```
     *
     * @since 4.0.0
     * @category combinators
     */
    <const Name extends string, Input, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>, examples: ReadonlyArray<Command.Example>): Command<Name, Input, ContextInput, E, R>;
};
/**
 * Provides the handler of a command with the services produced by a layer
 * that optionally depends on the command-line input to be created.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem, PlatformError } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const deploy = Command.make("deploy", {
 *   env: Flag.string("env")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     const fs = yield* FileSystem.FileSystem
 *     // Use fs...
 *   })).pipe(
 *     // Provide FileSystem based on the --env flag
 *     Command.provide((config) =>
 *       config.env === "local"
 *         ? FileSystem.layerNoop({})
 *         : FileSystem.layerNoop({
 *           access: () =>
 *             Effect.fail(
 *               PlatformError.badArgument({
 *                 module: "FileSystem",
 *                 method: "access"
 *               })
 *             )
 *         })
 *     )
 *   )
 * ```
 *
 * @since 4.0.0
 * @category providing services
 */
export declare const provide: {
    /**
     * Provides the handler of a command with the services produced by a layer
     * that optionally depends on the command-line input to be created.
     *
     * @example
     * ```ts
     * import { Effect, FileSystem, PlatformError } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const deploy = Command.make("deploy", {
     *   env: Flag.string("env")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     const fs = yield* FileSystem.FileSystem
     *     // Use fs...
     *   })).pipe(
     *     // Provide FileSystem based on the --env flag
     *     Command.provide((config) =>
     *       config.env === "local"
     *         ? FileSystem.layerNoop({})
     *         : FileSystem.layerNoop({
     *           access: () =>
     *             Effect.fail(
     *               PlatformError.badArgument({
     *                 module: "FileSystem",
     *                 method: "access"
     *               })
     *             )
     *         })
     *     )
     *   )
     * ```
     *
     * @since 4.0.0
     * @category providing services
     */
    <Input, LR, LE, LA>(layer: Layer.Layer<LA, LE, LR> | ((input: Input) => Layer.Layer<LA, LE, LR>), options?: {
        readonly local?: boolean | undefined;
    } | undefined): <const Name extends string, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E | LE, Exclude<R, LA> | LR>;
    /**
     * Provides the handler of a command with the services produced by a layer
     * that optionally depends on the command-line input to be created.
     *
     * @example
     * ```ts
     * import { Effect, FileSystem, PlatformError } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const deploy = Command.make("deploy", {
     *   env: Flag.string("env")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     const fs = yield* FileSystem.FileSystem
     *     // Use fs...
     *   })).pipe(
     *     // Provide FileSystem based on the --env flag
     *     Command.provide((config) =>
     *       config.env === "local"
     *         ? FileSystem.layerNoop({})
     *         : FileSystem.layerNoop({
     *           access: () =>
     *             Effect.fail(
     *               PlatformError.badArgument({
     *                 module: "FileSystem",
     *                 method: "access"
     *               })
     *             )
     *         })
     *     )
     *   )
     * ```
     *
     * @since 4.0.0
     * @category providing services
     */
    <const Name extends string, Input, E, R, ContextInput, LA, LE, LR>(self: Command<Name, Input, ContextInput, E, R>, layer: Layer.Layer<LA, LE, LR> | ((input: Input) => Layer.Layer<LA, LE, LR>), options?: {
        readonly local?: boolean | undefined;
    } | undefined): Command<Name, Input, ContextInput, E | LE, Exclude<R, LA> | LR>;
};
/**
 * Provides the handler of a command with the implementation of a service that
 * optionally depends on the command-line input to be constructed.
 *
 * @since 4.0.0
 * @category providing services
 */
export declare const provideSync: {
    /**
     * Provides the handler of a command with the implementation of a service that
     * optionally depends on the command-line input to be constructed.
     *
     * @since 4.0.0
     * @category providing services
     */
    <I, S, Input>(service: Context.Key<I, S>, implementation: S | ((input: Input) => S)): <const Name extends string, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E, Exclude<R, I>>;
    /**
     * Provides the handler of a command with the implementation of a service that
     * optionally depends on the command-line input to be constructed.
     *
     * @since 4.0.0
     * @category providing services
     */
    <const Name extends string, Input, E, R, ContextInput, I, S>(self: Command<Name, Input, ContextInput, E, R>, service: Context.Key<I, S>, implementation: S | ((input: Input) => S)): Command<Name, Input, ContextInput, E, Exclude<R, I>>;
};
/**
 * Provides the handler of a command with the service produced by an effect
 * that optionally depends on the command-line input to be created.
 *
 * @since 4.0.0
 * @category providing services
 */
export declare const provideEffect: {
    /**
     * Provides the handler of a command with the service produced by an effect
     * that optionally depends on the command-line input to be created.
     *
     * @since 4.0.0
     * @category providing services
     */
    <I, S, Input, R2, E2>(service: Context.Key<I, S>, effect: Effect.Effect<S, E2, R2> | ((input: Input) => Effect.Effect<S, E2, R2>)): <const Name extends string, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E | E2, Exclude<R, I> | R2>;
    /**
     * Provides the handler of a command with the service produced by an effect
     * that optionally depends on the command-line input to be created.
     *
     * @since 4.0.0
     * @category providing services
     */
    <const Name extends string, Input, E, R, ContextInput, I, S, R2, E2>(self: Command<Name, Input, ContextInput, E, R>, service: Context.Key<I, S>, effect: Effect.Effect<S, E2, R2> | ((input: Input) => Effect.Effect<S, E2, R2>)): Command<Name, Input, ContextInput, E | E2, Exclude<R, I> | R2>;
};
/**
 * Allows for execution of an effect, which optionally depends on command-line
 * input to be created, prior to executing the handler of a command.
 *
 * @since 4.0.0
 * @category providing services
 */
export declare const provideEffectDiscard: {
    /**
     * Allows for execution of an effect, which optionally depends on command-line
     * input to be created, prior to executing the handler of a command.
     *
     * @since 4.0.0
     * @category providing services
     */
    <_, Input, E2, R2>(effect: Effect.Effect<_, E2, R2> | ((input: Input) => Effect.Effect<_, E2, R2>)): <const Name extends string, E, R, ContextInput>(self: Command<Name, Input, ContextInput, E, R>) => Command<Name, Input, ContextInput, E | E2, R | R2>;
    /**
     * Allows for execution of an effect, which optionally depends on command-line
     * input to be created, prior to executing the handler of a command.
     *
     * @since 4.0.0
     * @category providing services
     */
    <const Name extends string, Input, E, R, ContextInput, _, E2, R2>(self: Command<Name, Input, ContextInput, E, R>, effect: Effect.Effect<_, E2, R2> | ((input: Input) => Effect.Effect<_, E2, R2>)): Command<Name, Input, ContextInput, E | E2, R | R2>;
};
/**
 * Runs a command with the provided input arguments.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greetCommand = Command.make("greet", {
 *   name: Flag.string("name")
 * }, (config) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Hello, ${config.name}!`)
 *   }))
 *
 * // Automatically gets args from the Stdio service
 * const program = Command.run(greetCommand, {
 *   version: "1.0.0"
 * })
 * ```
 *
 * @since 4.0.0
 * @category command execution
 */
export declare const run: {
    /**
     * Runs a command with the provided input arguments.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const greetCommand = Command.make("greet", {
     *   name: Flag.string("name")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Hello, ${config.name}!`)
     *   }))
     *
     * // Automatically gets args from the Stdio service
     * const program = Command.run(greetCommand, {
     *   version: "1.0.0"
     * })
     * ```
     *
     * @since 4.0.0
     * @category command execution
     */
    (config: {
        readonly version: string;
    }): <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>) => Effect.Effect<void, E | CliError.CliError, R | Environment>;
    /**
     * Runs a command with the provided input arguments.
     *
     * @example
     * ```ts
     * import { Console, Effect } from "effect"
     * import { Command, Flag } from "effect/unstable/cli"
     *
     * const greetCommand = Command.make("greet", {
     *   name: Flag.string("name")
     * }, (config) =>
     *   Effect.gen(function*() {
     *     yield* Console.log(`Hello, ${config.name}!`)
     *   }))
     *
     * // Automatically gets args from the Stdio service
     * const program = Command.run(greetCommand, {
     *   version: "1.0.0"
     * })
     * ```
     *
     * @since 4.0.0
     * @category command execution
     */
    <Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, config: {
        readonly version: string;
    }): Effect.Effect<void, E | CliError.CliError, R | Environment>;
};
/**
 * Runs a command with explicitly provided arguments instead of using process.argv.
 *
 * This function is useful for testing CLI applications or when you want to
 * programmatically execute commands with specific arguments.
 *
 * @example
 * ```ts
 * import { Console, Effect } from "effect"
 * import { Command, Flag } from "effect/unstable/cli"
 *
 * const greet = Command.make("greet", {
 *   name: Flag.string("name"),
 *   count: Flag.integer("count").pipe(Flag.withDefault(1))
 * }, (config) =>
 *   Effect.gen(function*() {
 *     for (let i = 0; i < config.count; i++) {
 *       yield* Console.log(`Hello, ${config.name}!`)
 *     }
 *   }))
 *
 * // Test with specific arguments
 * const testProgram = Effect.gen(function*() {
 *   const runCommand = Command.runWith(greet, { version: "1.0.0" })
 *
 *   // Test normal execution
 *   yield* runCommand(["--name", "Alice", "--count", "2"])
 *
 *   // Test help display
 *   yield* runCommand(["--help"])
 *
 *   // Test version display
 *   yield* runCommand(["--version"])
 * })
 * ```
 *
 * @since 4.0.0
 * @category command execution
 */
export declare const runWith: <const Name extends string, Input, E, R, ContextInput>(command: Command<Name, Input, ContextInput, E, R>, config: {
    readonly version: string;
}) => (input: ReadonlyArray<string>) => Effect.Effect<void, Exclude<E, Terminal.QuitError> | CliError.CliError, R | Environment>;
export {};
//# sourceMappingURL=Command.d.ts.map