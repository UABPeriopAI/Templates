/**
 * Symbol used by Node.js for custom object inspection.
 *
 * This symbol is recognized by Node.js's `util.inspect()` function and the REPL
 * for custom object representation. When an object has a method with this symbol,
 * it will be called to determine how the object should be displayed.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 *
 * class CustomObject {
 *   constructor(private value: string) {}
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return `CustomObject(${this.value})`
 *   }
 * }
 *
 * const obj = new CustomObject("hello")
 * console.log(obj) // Displays: CustomObject(hello)
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
export declare const NodeInspectSymbol: unique symbol;
/**
 * The type of the Node.js inspection symbol used for custom object inspection.
 * This symbol type is used to implement custom inspection behavior in Node.js
 * environments.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 *
 * class CustomObject {
 *   constructor(private value: string) {}
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return `CustomObject(${this.value})`
 *   }
 * }
 *
 * const obj = new CustomObject("test")
 * console.log(obj) // CustomObject(test)
 * ```
 *
 * @since 2.0.0
 * @category symbols
 */
export type NodeInspectSymbol = typeof NodeInspectSymbol;
/**
 * Interface for objects that can be inspected and provide custom string representations.
 *
 * Objects implementing this interface can control how they appear in debugging contexts,
 * JSON serialization, and Node.js inspection. This is particularly useful for creating
 * custom data types that display meaningful information during development.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 * import { format } from "effect/Formatter"
 *
 * class Result implements Inspectable.Inspectable {
 *   constructor(
 *     private readonly tag: "Success" | "Failure",
 *     private readonly value: unknown
 *   ) {}
 *
 *   toString(): string {
 *     return format(this.toJSON())
 *   }
 *
 *   toJSON() {
 *     return { _tag: this.tag, value: this.value }
 *   }
 *
 *   [Inspectable.NodeInspectSymbol]() {
 *     return this.toJSON()
 *   }
 * }
 *
 * const success = new Result("Success", 42)
 * console.log(success.toString()) // Pretty formatted JSON
 * ```
 *
 * @since 2.0.0
 * @category models
 */
export interface Inspectable {
    toString(): string;
    toJSON(): unknown;
    [NodeInspectSymbol](): unknown;
}
/**
 * Safely converts a value to a JSON-serializable representation, useful for
 * implementing the `toJSON` method of the {@link Inspectable} interface.
 *
 * This function attempts to extract JSON data from objects that implement the
 * `toJSON` method, recursively processes arrays, and handles errors gracefully.
 * For objects that don't have a `toJSON` method, it applies redaction to
 * protect sensitive information.
 *
 * @since 2.0.0
 */
export declare const toJson: (input: unknown) => unknown;
/**
 * @since 2.0.0
 */
export declare const toStringUnknown: (u: unknown, whitespace?: number | string | undefined) => string;
/**
 * @since 2.0.0
 */
export declare const stringifyCircular: (obj: unknown, whitespace?: number | string | undefined) => string;
/**
 * A base prototype object that implements the {@link Inspectable} interface.
 *
 * This object provides default implementations for the {@link Inspectable} methods.
 * It can be used as a prototype for objects that want to be inspectable,
 * or as a mixin to add inspection capabilities to existing objects.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 *
 * // Use as prototype
 * const myObject = Object.create(Inspectable.BaseProto)
 * myObject.name = "example"
 * myObject.value = 42
 *
 * console.log(myObject.toString()) // Pretty printed representation
 *
 * // Or extend in a constructor
 * function MyClass(this: any, name: string) {
 *   this.name = name
 * }
 * MyClass.prototype = Object.create(Inspectable.BaseProto)
 * MyClass.prototype.constructor = MyClass
 * ```
 *
 * @since 2.0.0
 */
export declare const BaseProto: Inspectable;
/**
 * Abstract base class that implements the Inspectable interface.
 *
 * This class provides a convenient way to create inspectable objects by extending it.
 * Subclasses only need to implement the `toJSON()` method, and they automatically
 * get proper `toString()` and Node.js inspection support.
 *
 * @example
 * ```ts
 * import { Inspectable } from "effect"
 *
 * class User extends Inspectable.Class {
 *   constructor(
 *     public readonly id: number,
 *     public readonly name: string,
 *     public readonly email: string
 *   ) {
 *     super()
 *   }
 *
 *   toJSON() {
 *     return {
 *       _tag: "User",
 *       id: this.id,
 *       name: this.name,
 *       email: this.email
 *     }
 *   }
 * }
 *
 * const user = new User(1, "Alice", "alice@example.com")
 * console.log(user.toString()) // Pretty printed JSON with _tag, id, name, email
 * console.log(user) // In Node.js, shows the same formatted output
 * ```
 *
 * @since 2.0.0
 * @category classes
 */
export declare abstract class Class {
    /**
     * Returns a JSON representation of this object.
     *
     * Subclasses must implement this method to define how the object
     * should be serialized for debugging and inspection purposes.
     *
     * @since 2.0.0
     */
    abstract toJSON(): unknown;
    /**
     * Node.js custom inspection method.
     *
     * @since 2.0.0
     */
    [NodeInspectSymbol](): unknown;
    /**
     * Returns a formatted string representation of this object.
     *
     * @since 2.0.0
     */
    toString(): string;
}
//# sourceMappingURL=Inspectable.d.ts.map