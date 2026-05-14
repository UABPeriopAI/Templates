/**
 * @since 2.0.0
 */
/**
 * @since 2.0.0
 * @category utilities
 * @example
 * ```ts
 * import { Pipeable } from "effect"
 *
 * // pipeArguments is used internally to implement efficient piping
 * function customPipe<A>(self: A, ...fns: Array<(a: any) => any>): unknown {
 *   return Pipeable.pipeArguments(self, arguments as any)
 * }
 *
 * // Example usage
 * const add = (x: number) => (y: number) => x + y
 * const multiply = (x: number) => (y: number) => x * y
 *
 * const result = customPipe(5, add(2), multiply(3))
 * console.log(result) // 21
 * ```
 */
export const pipeArguments = (self, args) => {
  switch (args.length) {
    case 0:
      return self;
    case 1:
      return args[0](self);
    case 2:
      return args[1](args[0](self));
    case 3:
      return args[2](args[1](args[0](self)));
    case 4:
      return args[3](args[2](args[1](args[0](self))));
    case 5:
      return args[4](args[3](args[2](args[1](args[0](self)))));
    case 6:
      return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
    case 7:
      return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
    case 8:
      return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
    case 9:
      return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
    default:
      {
        let ret = self;
        for (let i = 0, len = args.length; i < len; i++) {
          ret = args[i](ret);
        }
        return ret;
      }
  }
};
/**
 * @since 4.0.0
 */
export const Prototype = {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const Class = /*#__PURE__*/function () {
  function PipeableBase() {}
  PipeableBase.prototype = Prototype;
  return PipeableBase;
}();
/**
 * @since 4.0.0
 * @category constructors
 */
export const Mixin = klass => class extends klass {
  pipe() {
    return pipeArguments(this, arguments);
  }
};
//# sourceMappingURL=Pipeable.js.map