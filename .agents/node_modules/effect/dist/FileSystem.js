/**
 * This module provides a comprehensive file system abstraction that supports both synchronous
 * and asynchronous file operations through Effect. It includes utilities for file I/O, directory
 * management, permissions, timestamps, and file watching with proper error handling.
 *
 * The `FileSystem` interface provides a cross-platform abstraction over file system operations,
 * allowing you to work with files and directories in a functional, composable way. All operations
 * return `Effect` values that can be composed, transformed, and executed safely.
 *
 * @example
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Create a directory
 *   yield* fs.makeDirectory("./temp", { recursive: true })
 *
 *   // Write a file
 *   yield* fs.writeFileString("./temp/hello.txt", "Hello, World!")
 *
 *   // Read the file back
 *   const content = yield* fs.readFileString("./temp/hello.txt")
 *   yield* Console.log("File content:", content)
 *
 *   // Get file information
 *   const stats = yield* fs.stat("./temp/hello.txt")
 *   yield* Console.log("File size:", stats.size)
 *
 *   // Clean up
 *   yield* fs.remove("./temp", { recursive: true })
 * })
 * ```
 *
 * @since 4.0.0
 */
import * as Arr from "./Array.js";
import * as Brand from "./Brand.js";
import * as Cause from "./Cause.js";
import * as Context from "./Context.js";
import * as Effect from "./Effect.js";
import { pipe } from "./Function.js";
import * as Layer from "./Layer.js";
import * as Option from "./Option.js";
import { badArgument, systemError } from "./PlatformError.js";
import { hasProperty } from "./Predicate.js";
import * as Sink from "./Sink.js";
import * as Stream from "./Stream.js";
const TypeId = "~effect/platform/FileSystem";
/**
 * Creates a `Size` from various numeric input types.
 *
 * Converts numbers, bigints, or existing Size values into a properly
 * branded Size type. This function handles the conversion and ensures
 * type safety for file size operations.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * // From number
 * const size1 = FileSystem.Size(1024)
 * console.log(typeof size1) // "bigint"
 *
 * // From bigint
 * const size2 = FileSystem.Size(BigInt(2048))
 *
 * // From existing Size (identity)
 * const size3 = FileSystem.Size(size1)
 *
 * // Use in file operations
 * const readChunk = (path: string, chunkSize: number) =>
 *   Effect.gen(function*() {
 *     const fs = yield* FileSystem.FileSystem
 *     return fs.stream(path, {
 *       chunkSize: FileSystem.Size(chunkSize)
 *     })
 *   })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const Size = bytes => typeof bytes === "bigint" ? bytes : BigInt(bytes);
/**
 * Creates a `Size` representing kilobytes (1024 bytes).
 *
 * Converts a number of kilobytes to the equivalent size in bytes.
 * Uses binary kilobytes (1024 bytes) rather than decimal (1000 bytes).
 *
 * @example
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Create a 64 KiB buffer size for streaming
 *   const bufferSize = FileSystem.KiB(64)
 *
 *   const stream = fs.stream("large-file.txt", {
 *     chunkSize: bufferSize
 *   })
 *
 *   // Truncate file to 100 KiB
 *   yield* fs.truncate("data.txt", FileSystem.KiB(100))
 * })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const KiB = n => Size(n * 1024);
/**
 * Creates a `Size` representing mebibytes (1024² bytes).
 *
 * Converts a number of mebibytes to the equivalent size in bytes.
 * Uses binary mebibytes (1,048,576 bytes) rather than decimal megabytes.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Set a 10 MiB chunk size for large file operations
 *   const largeChunkSize = FileSystem.MiB(10)
 *
 *   const stream = fs.stream("video.mp4", {
 *     chunkSize: largeChunkSize
 *   })
 *
 *   // Check if file is larger than 100 MiB
 *   const stats = yield* fs.stat("archive.zip")
 *   const maxSize = FileSystem.MiB(100)
 *   if (stats.size > maxSize) {
 *     yield* Effect.log("File is very large!")
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const MiB = n => Size(n * 1024 * 1024);
/**
 * Creates a `Size` representing gibibytes (1024³ bytes).
 *
 * Converts a number of gibibytes to the equivalent size in bytes.
 * Uses binary gibibytes (1,073,741,824 bytes) rather than decimal gigabytes.
 *
 * @example
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Check available space before creating large files
 *   const stats = yield* fs.stat(".")
 *   const requiredSpace = FileSystem.GiB(5)
 *
 *   // Create a large temporary file
 *   const tempFile = yield* fs.makeTempFile({ prefix: "large-" })
 *   yield* fs.truncate(tempFile, FileSystem.GiB(1)) // 1 GiB file
 *
 *   yield* Console.log(`Created ${tempFile} with 1 GiB size`)
 * })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const GiB = n => Size(n * 1024 * 1024 * 1024);
/**
 * Creates a `Size` representing tebibytes (1024⁴ bytes).
 *
 * Converts a number of tebibytes to the equivalent size in bytes.
 * Uses binary tebibytes (1,099,511,627,776 bytes) rather than decimal terabytes.
 *
 * @example
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // Check if we're dealing with very large files
 *   const stats = yield* fs.stat("database-backup.sql")
 *   const oneTiB = FileSystem.TiB(1)
 *
 *   if (stats.size > oneTiB) {
 *     yield* Console.log("This is a very large database backup!")
 *
 *     // Use larger chunk sizes for such files
 *     const stream = fs.stream("database-backup.sql", {
 *       chunkSize: FileSystem.MiB(100) // 100 MiB chunks
 *     })
 *   }
 * })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const TiB = n => Size(n * 1024 * 1024 * 1024 * 1024);
const bigint1024 = /*#__PURE__*/BigInt(1024);
const bigintPiB = bigint1024 * bigint1024 * bigint1024 * bigint1024 * bigint1024;
/**
 * Creates a `Size` representing pebibytes (1024⁵ bytes).
 *
 * Converts a number of pebibytes to the equivalent size in bytes.
 * Uses binary pebibytes (1,125,899,906,842,624 bytes) rather than decimal petabytes.
 * This function uses BigInt arithmetic to handle the very large numbers involved.
 *
 * @example
 * ```ts
 * import { Console, Effect, FileSystem } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // For extremely large data processing scenarios
 *   const massiveDataset = FileSystem.PiB(2) // 2 PiB
 *
 *   // This would typically be used in enterprise/cloud scenarios
 *   yield* Console.log(`Processing ${massiveDataset} bytes of data`)
 *
 *   // Such large files would require specialized streaming
 *   const stream = fs.stream("massive-dataset.bin", {
 *     chunkSize: FileSystem.GiB(1), // 1 GiB chunks
 *     offset: FileSystem.TiB(100) // Start from 100 TiB offset
 *   })
 * })
 * ```
 *
 * @since 4.0.0
 * @category sizes
 */
export const PiB = n => Size(BigInt(n) * bigintPiB);
/**
 * The service identifier for the FileSystem service.
 *
 * This key is used to provide and access the FileSystem service in the Effect context.
 * Use this to inject file system implementations or access file system operations.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * // Access the FileSystem service
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   const exists = yield* fs.exists("./data.txt")
 *   if (exists) {
 *     const content = yield* fs.readFileString("./data.txt")
 *     yield* Effect.log("File content:", content)
 *   }
 * })
 *
 * // Provide a custom FileSystem implementation
 * declare const platformImpl: Omit<
 *   FileSystem.FileSystem,
 *   "exists" | "readFileString" | "stream" | "sink" | "writeFileString"
 * >
 * const customFs = FileSystem.make(platformImpl)
 *
 * const withCustomFs = Effect.provideService(
 *   program,
 *   FileSystem.FileSystem,
 *   customFs
 * )
 * ```
 *
 * @since 4.0.0
 * @category tag
 */
export const FileSystem = /*#__PURE__*/Context.Service("effect/platform/FileSystem");
/**
 * Creates a FileSystem implementation from a partial implementation.
 *
 * This function takes a partial FileSystem implementation and automatically provides
 * default implementations for `exists`, `readFileString`, `stream`, `sink`, and
 * `writeFileString` methods based on the provided core methods.
 *
 * @since 4.0.0
 * @category constructor
 */
export const make = impl => FileSystem.of({
  ...impl,
  [TypeId]: TypeId,
  exists: path => pipe(impl.access(path), Effect.as(true), Effect.catchTag("PlatformError", e => e.reason._tag === "NotFound" ? Effect.succeed(false) : Effect.fail(e))),
  readFileString: (path, encoding) => Effect.flatMap(impl.readFile(path), _ => Effect.try({
    try: () => new TextDecoder(encoding).decode(_),
    catch: cause => badArgument({
      module: "FileSystem",
      method: "readFileString",
      description: "invalid encoding",
      cause
    })
  })),
  stream: Effect.fnUntraced(function* (path, options) {
    const file = yield* impl.open(path, {
      flag: "r"
    });
    if (options?.offset) {
      yield* file.seek(options.offset, "start");
    }
    const bytesToRead = options?.bytesToRead !== undefined ? Size(options.bytesToRead) : undefined;
    let totalBytesRead = BigInt(0);
    const chunkSize = Size(options?.chunkSize ?? 64 * 1024);
    const readChunk = file.readAlloc(chunkSize);
    return Stream.fromPull(Effect.succeed(Effect.flatMap(Effect.suspend(() => {
      if (bytesToRead !== undefined && bytesToRead <= totalBytesRead) {
        return Cause.done();
      }
      return bytesToRead !== undefined && bytesToRead - totalBytesRead < chunkSize ? file.readAlloc(bytesToRead - totalBytesRead) : readChunk;
    }), Option.match({
      onNone: () => Cause.done(),
      onSome: buf => {
        totalBytesRead += BigInt(buf.length);
        return Effect.succeed(Arr.of(buf));
      }
    }))));
  }, Stream.unwrap),
  sink: (path, options) => pipe(impl.open(path, {
    flag: "w",
    ...options
  }), Effect.map(file => Sink.forEach(_ => file.writeAll(_))), Sink.unwrap),
  writeFileString: (path, data, options) => Effect.flatMap(Effect.try({
    try: () => new TextEncoder().encode(data),
    catch: cause => badArgument({
      module: "FileSystem",
      method: "writeFileString",
      description: "could not encode string",
      cause
    })
  }), _ => impl.writeFile(path, _, options))
});
const notFound = (method, path) => systemError({
  module: "FileSystem",
  method,
  _tag: "NotFound",
  description: "No such file or directory",
  pathOrDescriptor: path
});
/**
 * Creates a no-op FileSystem implementation for testing purposes.
 *
 * This function creates a FileSystem where most operations fail with "NotFound" errors,
 * except for operations that can be safely stubbed. You can override specific methods
 * by providing them in the `fileSystem` parameter.
 *
 * This is useful for testing scenarios where you want to control specific file system
 * behaviors without affecting the actual file system.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem, PlatformError } from "effect"
 *
 * // Create a test filesystem that only allows reading specific files
 * const testFs = FileSystem.makeNoop({
 *   readFileString: (path) => {
 *     if (path === "test-config.json") {
 *       return Effect.succeed("{\"test\": true}")
 *     }
 *     return Effect.fail(
 *       PlatformError.systemError({
 *         _tag: "NotFound",
 *         module: "FileSystem",
 *         method: "readFileString",
 *         description: "File not found",
 *         pathOrDescriptor: path
 *       })
 *     )
 *   },
 *   exists: (path) => Effect.succeed(path === "test-config.json")
 * })
 *
 * // Use in tests
 * const program = Effect.gen(function*() {
 *   const content = yield* testFs.readFileString("test-config.json")
 *   // Will succeed with mocked content
 * })
 *
 * // Test with the no-op filesystem
 * const testProgram = Effect.provideService(
 *   program,
 *   FileSystem.FileSystem,
 *   testFs
 * )
 * ```
 *
 * @since 4.0.0
 * @category constructor
 */
export const makeNoop = fileSystem => FileSystem.of({
  [TypeId]: TypeId,
  access(path) {
    return Effect.fail(notFound("access", path));
  },
  chmod(path) {
    return Effect.fail(notFound("chmod", path));
  },
  chown(path) {
    return Effect.fail(notFound("chown", path));
  },
  copy(path) {
    return Effect.fail(notFound("copy", path));
  },
  copyFile(path) {
    return Effect.fail(notFound("copyFile", path));
  },
  exists() {
    return Effect.succeed(false);
  },
  link(path) {
    return Effect.fail(notFound("link", path));
  },
  makeDirectory() {
    return Effect.die("not implemented");
  },
  makeTempDirectory() {
    return Effect.die("not implemented");
  },
  makeTempDirectoryScoped() {
    return Effect.die("not implemented");
  },
  makeTempFile() {
    return Effect.die("not implemented");
  },
  makeTempFileScoped() {
    return Effect.die("not implemented");
  },
  open(path) {
    return Effect.fail(notFound("open", path));
  },
  readDirectory(path) {
    return Effect.fail(notFound("readDirectory", path));
  },
  readFile(path) {
    return Effect.fail(notFound("readFile", path));
  },
  readFileString(path) {
    return Effect.fail(notFound("readFileString", path));
  },
  readLink(path) {
    return Effect.fail(notFound("readLink", path));
  },
  realPath(path) {
    return Effect.fail(notFound("realPath", path));
  },
  remove() {
    return Effect.void;
  },
  rename(oldPath) {
    return Effect.fail(notFound("rename", oldPath));
  },
  sink(path) {
    return Sink.fail(notFound("sink", path));
  },
  stat(path) {
    return Effect.fail(notFound("stat", path));
  },
  stream(path) {
    return Stream.fail(notFound("stream", path));
  },
  symlink(fromPath) {
    return Effect.fail(notFound("symlink", fromPath));
  },
  truncate(path) {
    return Effect.fail(notFound("truncate", path));
  },
  utimes(path) {
    return Effect.fail(notFound("utimes", path));
  },
  watch(path) {
    return Stream.fail(notFound("watch", path));
  },
  writeFile(path) {
    return Effect.fail(notFound("writeFile", path));
  },
  writeFileString(path) {
    return Effect.fail(notFound("writeFileString", path));
  },
  ...fileSystem
});
/**
 * Creates a Layer that provides a no-op FileSystem implementation for testing.
 *
 * This is a convenience function that wraps `makeNoop` in a Layer, making it easy
 * to provide the test filesystem to your Effect programs.
 *
 * @example
 * ```ts
 * import { Effect, FileSystem } from "effect"
 *
 * // Create a test layer with specific behaviors
 * const testLayer = FileSystem.layerNoop({
 *   readFileString: (path) => Effect.succeed("mocked content"),
 *   exists: () => Effect.succeed(true)
 * })
 *
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *   const content = yield* fs.readFileString("any-file.txt")
 *   return content
 * })
 *
 * // Provide the test layer
 * const testProgram = Effect.provide(program, testLayer)
 * ```
 *
 * @since 4.0.0
 * @category layers
 */
export const layerNoop = fileSystem => Layer.succeed(FileSystem)(makeNoop(fileSystem));
/**
 * @since 4.0.0
 * @category File
 */
export const FileTypeId = "~effect/platform/FileSystem/File";
/**
 * Type guard to check if a value is a File instance.
 *
 * This function determines whether the provided value is a valid File
 * instance by checking for the presence of the File type identifier.
 *
 * @since 4.0.0
 * @category File
 */
export const isFile = u => hasProperty(u, FileTypeId);
/**
 * Creates a branded file descriptor.
 *
 * File descriptors are integer handles that the operating system uses to identify
 * open files. This branded type ensures type safety when working with file descriptors.
 *
 * @since 4.0.0
 * @category constructor
 */
export const FileDescriptor = /*#__PURE__*/Brand.nominal();
/**
 * Service key for file system watch backend implementations.
 *
 * This service provides the low-level file watching capabilities that can be
 * implemented differently on various platforms (e.g., inotify on Linux,
 * FSEvents on macOS, etc.).
 *
 * @example
 * ```ts
 * import { Effect, FileSystem, Option, Stream } from "effect"
 *
 * // Custom watch backend implementation
 * const customWatchBackend = {
 *   register: (path: string, stat: FileSystem.File.Info) => {
 *     // Implementation would depend on platform
 *     return Option.some(Stream.empty) // Placeholder implementation
 *   }
 * }
 *
 * // Provide custom watch backend
 * const program = Effect.gen(function*() {
 *   const fs = yield* FileSystem.FileSystem
 *
 *   // File watching will use the custom backend
 *   const watcher = fs.watch("./directory")
 * })
 *
 * const withCustomBackend = Effect.provideService(
 *   program,
 *   FileSystem.WatchBackend,
 *   customWatchBackend
 * )
 * ```
 *
 * @since 4.0.0
 * @category file watcher
 */
export class WatchBackend extends /*#__PURE__*/Context.Service()("effect/platform/FileSystem/WatchBackend") {}
//# sourceMappingURL=FileSystem.js.map