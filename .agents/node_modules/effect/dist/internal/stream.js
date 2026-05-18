import { identity } from "../Function.js";
import { pipeArguments } from "../Pipeable.js";
const TypeId = "~effect/Stream";
const streamVariance = {
  _R: identity,
  _E: identity,
  _A: identity
};
const StreamProto = {
  [TypeId]: streamVariance,
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/** @internal */
export const fromChannel = channel => {
  const self = Object.create(StreamProto);
  self.channel = channel;
  return self;
};
//# sourceMappingURL=stream.js.map