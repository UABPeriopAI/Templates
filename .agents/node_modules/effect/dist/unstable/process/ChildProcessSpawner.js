/**
 * A module providing a generic service interface for spawning child processes.
 *
 * This module provides the `ChildProcessSpawner` service tag which can be
 * implemented by platform-specific packages (e.g., Node.js).
 *
 * @since 4.0.0
 */
import * as Brand from "../../Brand.js";
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Inspectable from "../../Inspectable.js";
import * as Stream from "../../Stream.js";
/**
 * @since 4.0.0
 * @category Constructors
 */
export const ExitCode = /*#__PURE__*/Brand.nominal();
/**
 * @since 4.0.0
 * @category Constructors
 */
export const ProcessId = /*#__PURE__*/Brand.nominal();
const HandleTypeId = "~effect/ChildProcessSpawner/ChildProcessHandle";
const HandleProto = {
  [HandleTypeId]: HandleTypeId,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: "ChildProcessHandle",
      pid: this.pid
    };
  }
};
/**
 * Constructs a new `ChildProcessHandle`.
 *
 * @since 4.0.0
 * @category Constructors
 */
export const makeHandle = params => Object.assign(Object.create(HandleProto), params);
/**
 * Create a new `ChildProcessSpawner` service from a `spawn` funciton
 *
 * @since 4.0.0
 * @category Models
 */
export const make = spawn => {
  const streamString = (command, options) => spawn(command).pipe(Effect.map(handle => Stream.decodeText(options?.includeStderr === true ? handle.all : handle.stdout)), Stream.unwrap);
  const streamLines = (command, options) => Stream.splitLines(streamString(command, options));
  return ChildProcessSpawner.of({
    spawn,
    exitCode: command => Effect.scoped(Effect.flatMap(spawn(command), handle => handle.exitCode)),
    streamString,
    streamLines,
    lines: (command, options) => Stream.runCollect(streamLines(command, options)),
    string: (command, options) => Stream.mkString(streamString(command, options))
  });
};
/**
 * Service tag for child process spawning.
 *
 * @since 4.0.0
 * @category Service
 */
export class ChildProcessSpawner extends /*#__PURE__*/Context.Service()("effect/process/ChildProcessSpawner") {}
//# sourceMappingURL=ChildProcessSpawner.js.map