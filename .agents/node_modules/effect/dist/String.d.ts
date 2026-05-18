/**
 * This module provides utility functions and type class instances for working with the `string` type in TypeScript.
 * It includes functions for basic string manipulation.
 *
 * @since 2.0.0
 */
import type { NonEmptyArray } from "./Array.ts";
import * as Equ from "./Equivalence.ts";
import * as Option from "./Option.ts";
import * as order from "./Order.ts";
import type * as Ordering from "./Ordering.ts";
import type { Refinement } from "./Predicate.ts";
import * as Reducer from "./Reducer.ts";
/**
 * Reference to the global `String` constructor.
 *
 * @category constructors
 * @since 4.0.0
 */
export declare const String: StringConstructor;
/**
 * Tests if a value is a `string`.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.isString("a"), true)
 * assert.deepStrictEqual(String.isString(1), false)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isString: Refinement<unknown, string>;
/**
 * `Order` instance for comparing strings using lexicographic ordering.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.Order("apple", "banana")) // -1
 * console.log(String.Order("banana", "apple")) // 1
 * console.log(String.Order("apple", "apple")) // 0
 * ```
 *
 * @category instances
 * @since 2.0.0
 */
export declare const Order: order.Order<string>;
/**
 * An `Equivalence` instance for strings using strict equality (`===`).
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.Equivalence("hello", "hello")) // true
 * console.log(String.Equivalence("hello", "world")) // false
 * ```
 *
 * @category instances
 * @since 4.0.0
 */
export declare const Equivalence: Equ.Equivalence<string>;
/**
 * The empty string `""`.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.empty) // ""
 * console.log(String.isEmpty(String.empty)) // true
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export declare const empty: "";
/**
 * Concatenates two strings at the type level.
 *
 * @example
 * ```ts
 * import type { String } from "effect"
 *
 * // Type-level concatenation
 * type Result = String.Concat<"hello", "world"> // "helloworld"
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export type Concat<A extends string, B extends string> = `${A}${B}`;
/**
 * Concatenates two strings at runtime.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 *
 * const result1 = String.concat("hello", "world")
 * console.log(result1) // "helloworld"
 *
 * const result2 = pipe("hello", String.concat("world"))
 * console.log(result2) // "helloworld"
 * ```
 *
 * @category concatenating
 * @since 2.0.0
 */
export declare const concat: {
    /**
     * Concatenates two strings at runtime.
     *
     * @example
     * ```ts
     * import { pipe, String } from "effect"
     *
     * const result1 = String.concat("hello", "world")
     * console.log(result1) // "helloworld"
     *
     * const result2 = pipe("hello", String.concat("world"))
     * console.log(result2) // "helloworld"
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <B extends string>(that: B): <A extends string>(self: A) => Concat<A, B>;
    /**
     * Concatenates two strings at runtime.
     *
     * @example
     * ```ts
     * import { pipe, String } from "effect"
     *
     * const result1 = String.concat("hello", "world")
     * console.log(result1) // "helloworld"
     *
     * const result2 = pipe("hello", String.concat("world"))
     * console.log(result2) // "helloworld"
     * ```
     *
     * @category concatenating
     * @since 2.0.0
     */
    <A extends string, B extends string>(self: A, that: B): Concat<A, B>;
};
/**
 * Converts a string to uppercase.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("a", String.toUpperCase), "A")
 * assert.deepStrictEqual(String.toUpperCase("hello"), "HELLO")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const toUpperCase: <S extends string>(self: S) => Uppercase<S>;
/**
 * Converts a string to lowercase.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("A", String.toLowerCase), "a")
 * assert.deepStrictEqual(String.toLowerCase("HELLO"), "hello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const toLowerCase: <T extends string>(self: T) => Lowercase<T>;
/**
 * Capitalizes the first character of a string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("abc", String.capitalize), "Abc")
 * assert.deepStrictEqual(String.capitalize("hello"), "Hello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const capitalize: <T extends string>(self: T) => Capitalize<T>;
/**
 * Uncapitalizes the first character of a string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("ABC", String.uncapitalize), "aBC")
 * assert.deepStrictEqual(String.uncapitalize("Hello"), "hello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const uncapitalize: <T extends string>(self: T) => Uncapitalize<T>;
/**
 * Replaces the first occurrence of a substring or pattern in a string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("abc", String.replace("b", "d")), "adc")
 * assert.deepStrictEqual(
 *   pipe("hello world", String.replace("world", "Effect")),
 *   "hello Effect"
 * )
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const replace: (searchValue: string | RegExp, replaceValue: string) => (self: string) => string;
/**
 * Type-level representation of trimming whitespace from both ends of a string.
 *
 * @example
 * ```ts
 * import type { String } from "effect"
 *
 * type Result = String.Trim<"  hello  "> // "hello"
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export type Trim<A extends string> = TrimEnd<TrimStart<A>>;
/**
 * Removes whitespace from both ends of a string.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.trim(" a "), "a")
 * assert.deepStrictEqual(String.trim("  hello world  "), "hello world")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const trim: <A extends string>(self: A) => Trim<A>;
/**
 * Type-level representation of trimming whitespace from the start of a string.
 *
 * @example
 * ```ts
 * import type { String } from "effect"
 *
 * type Result = String.TrimStart<"  hello"> // "hello"
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export type TrimStart<A extends string> = A extends `${" " | "\n" | "\t" | "\r"}${infer B}` ? TrimStart<B> : A;
/**
 * Removes whitespace from the start of a string.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.trimStart(" a "), "a ")
 * assert.deepStrictEqual(String.trimStart("  hello world"), "hello world")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const trimStart: <A extends string>(self: A) => TrimStart<A>;
/**
 * Type-level representation of trimming whitespace from the end of a string.
 *
 * @example
 * ```ts
 * import type { String } from "effect"
 *
 * type Result = String.TrimEnd<"hello  "> // "hello"
 * ```
 *
 * @category models
 * @since 2.0.0
 */
export type TrimEnd<A extends string> = A extends `${infer B}${" " | "\n" | "\t" | "\r"}` ? TrimEnd<B> : A;
/**
 * Removes whitespace from the end of a string.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.trimEnd(" a "), " a")
 * assert.deepStrictEqual(String.trimEnd("hello world  "), "hello world")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const trimEnd: <A extends string>(self: A) => TrimEnd<A>;
/**
 * Extracts a section of a string and returns it as a new string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("abcd", String.slice(1, 3)), "bc")
 * assert.deepStrictEqual(pipe("hello world", String.slice(0, 5)), "hello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const slice: (start?: number, end?: number) => (self: string) => string;
/**
 * Test whether a `string` is empty.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.isEmpty(""), true)
 * assert.deepStrictEqual(String.isEmpty("a"), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export declare const isEmpty: (self: string) => self is "";
/**
 * Test whether a `string` is non empty.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.isNonEmpty(""), false)
 * assert.deepStrictEqual(String.isNonEmpty("a"), true)
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export declare const isNonEmpty: (self: string) => boolean;
/**
 * Calculate the number of characters in a `string`.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.length("abc"), 3)
 * ```
 *
 * @category utilities
 * @since 2.0.0
 */
export declare const length: (self: string) => number;
/**
 * Splits a string into an array of substrings using a separator.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("abc", String.split("")), ["a", "b", "c"])
 * assert.deepStrictEqual(pipe("", String.split("")), [""])
 * assert.deepStrictEqual(String.split("hello,world", ","), ["hello", "world"])
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const split: {
    /**
     * Splits a string into an array of substrings using a separator.
     *
     * @example
     * ```ts
     * import { pipe, String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(pipe("abc", String.split("")), ["a", "b", "c"])
     * assert.deepStrictEqual(pipe("", String.split("")), [""])
     * assert.deepStrictEqual(String.split("hello,world", ","), ["hello", "world"])
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (separator: string | RegExp): (self: string) => NonEmptyArray<string>;
    /**
     * Splits a string into an array of substrings using a separator.
     *
     * @example
     * ```ts
     * import { pipe, String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(pipe("abc", String.split("")), ["a", "b", "c"])
     * assert.deepStrictEqual(pipe("", String.split("")), [""])
     * assert.deepStrictEqual(String.split("hello,world", ","), ["hello", "world"])
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (self: string, separator: string | RegExp): NonEmptyArray<string>;
};
/**
 * Returns `true` if `searchString` appears as a substring of `self`, at one or more positions that are
 * greater than or equal to `position`; otherwise, returns `false`.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("hello world", String.includes("world")), true)
 * assert.deepStrictEqual(pipe("hello world", String.includes("foo")), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export declare const includes: (searchString: string, position?: number) => (self: string) => boolean;
/**
 * Returns `true` if the string starts with the specified search string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("hello world", String.startsWith("hello")), true)
 * assert.deepStrictEqual(pipe("hello world", String.startsWith("world")), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export declare const startsWith: (searchString: string, position?: number) => (self: string) => boolean;
/**
 * Returns `true` if the string ends with the specified search string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("hello world", String.endsWith("world")), true)
 * assert.deepStrictEqual(pipe("hello world", String.endsWith("hello")), false)
 * ```
 *
 * @category predicates
 * @since 2.0.0
 */
export declare const endsWith: (searchString: string, position?: number) => (self: string) => boolean;
/**
 * Returns the character code at the specified index, or `None` if the index is out of bounds.
 *
 * **Example**
 *
 * ```ts
 * import { String } from "effect"
 *
 * String.charCodeAt("abc", 1) // Option.some(98)
 * String.charCodeAt("abc", 4) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const charCodeAt: {
    /**
     * Returns the character code at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { String } from "effect"
     *
     * String.charCodeAt("abc", 1) // Option.some(98)
     * String.charCodeAt("abc", 4) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (index: number): (self: string) => Option.Option<number>;
    /**
     * Returns the character code at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { String } from "effect"
     *
     * String.charCodeAt("abc", 1) // Option.some(98)
     * String.charCodeAt("abc", 4) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (self: string, index: number): Option.Option<number>;
};
/**
 * Extracts characters from a string between two specified indices.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abcd", String.substring(1)) // "bcd"
 * pipe("abcd", String.substring(1, 3)) // "bc"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const substring: (start: number, end?: number) => (self: string) => string;
/**
 * Returns the character at the specified index, or `None` if the index is out of bounds.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abc", String.at(1)) // Option.some("b")
 * pipe("abc", String.at(4)) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const at: {
    /**
     * Returns the character at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.at(1)) // Option.some("b")
     * pipe("abc", String.at(4)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (index: number): (self: string) => Option.Option<string>;
    /**
     * Returns the character at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.at(1)) // Option.some("b")
     * pipe("abc", String.at(4)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (self: string, index: number): Option.Option<string>;
};
/**
 * Returns the character at the specified index, or `None` if the index is out of bounds.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abc", String.charAt(1)) // Option.some("b")
 * pipe("abc", String.charAt(4)) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const charAt: {
    /**
     * Returns the character at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.charAt(1)) // Option.some("b")
     * pipe("abc", String.charAt(4)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (index: number): (self: string) => Option.Option<string>;
    /**
     * Returns the character at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.charAt(1)) // Option.some("b")
     * pipe("abc", String.charAt(4)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (self: string, index: number): Option.Option<string>;
};
/**
 * Returns the Unicode code point at the specified index, or `None` if the index is out of bounds.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abc", String.codePointAt(1)) // Option.some(98)
 * pipe("abc", String.codePointAt(10)) // Option.none()
 * ```
 *
 * @category elements
 * @since 2.0.0
 */
export declare const codePointAt: {
    /**
     * Returns the Unicode code point at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.codePointAt(1)) // Option.some(98)
     * pipe("abc", String.codePointAt(10)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (index: number): (self: string) => Option.Option<number>;
    /**
     * Returns the Unicode code point at the specified index, or `None` if the index is out of bounds.
     *
     * **Example**
     *
     * ```ts
     * import { pipe, String } from "effect"
     *
     * pipe("abc", String.codePointAt(1)) // Option.some(98)
     * pipe("abc", String.codePointAt(10)) // Option.none()
     * ```
     *
     * @category elements
     * @since 2.0.0
     */
    (self: string, index: number): Option.Option<number>;
};
/**
 * Returns the index of the first occurrence of a substring, or `None` if not found.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abbbc", String.indexOf("b")) // Option.some(1)
 * pipe("abbbc", String.indexOf("z")) // Option.none()
 * ```
 *
 * @category searching
 * @since 2.0.0
 */
export declare const indexOf: (searchString: string) => (self: string) => Option.Option<number>;
/**
 * Returns the index of the last occurrence of a substring, or `None` if not found.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("abbbc", String.lastIndexOf("b")) // Option.some(3)
 * pipe("abbbc", String.lastIndexOf("d")) // Option.none()
 * ```
 *
 * @category searching
 * @since 2.0.0
 */
export declare const lastIndexOf: (searchString: string) => (self: string) => Option.Option<number>;
/**
 * Compares two strings according to the current locale.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("a", String.localeCompare("b")), -1)
 * assert.deepStrictEqual(pipe("b", String.localeCompare("a")), 1)
 * assert.deepStrictEqual(pipe("a", String.localeCompare("a")), 0)
 * ```
 *
 * @category comparing
 * @since 2.0.0
 */
export declare const localeCompare: (that: string, locales?: Array<string>, options?: Intl.CollatorOptions) => (self: string) => Ordering.Ordering;
/**
 * A `pipe`-able version of the native `match` method.
 *
 * **Example**
 *
 * ```ts
 * import { pipe, String } from "effect"
 *
 * pipe("hello", String.match(/l+/)) // Option.some(["ll"])
 * pipe("hello", String.match(/x/)) // Option.none()
 * ```
 *
 * @category searching
 * @since 2.0.0
 */
export declare const match: (regExp: RegExp | string) => (self: string) => Option.Option<RegExpMatchArray>;
/**
 * It is the `pipe`-able version of the native `matchAll` method.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 *
 * const matches = pipe("hello world", String.matchAll(/l/g))
 * console.log(Array.from(matches)) // [["l"], ["l"], ["l"]]
 * ```
 *
 * @category searching
 * @since 2.0.0
 */
export declare const matchAll: (regExp: RegExp) => (self: string) => IterableIterator<RegExpMatchArray>;
/**
 * Normalizes a string according to the specified Unicode normalization form.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * const str = "\u1E9B\u0323"
 * assert.deepStrictEqual(pipe(str, String.normalize()), "\u1E9B\u0323")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFC")), "\u1E9B\u0323")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFD")), "\u017F\u0323\u0307")
 * assert.deepStrictEqual(pipe(str, String.normalize("NFKC")), "\u1E69")
 * assert.deepStrictEqual(
 *   pipe(str, String.normalize("NFKD")),
 *   "\u0073\u0323\u0307"
 * )
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const normalize: (form?: "NFC" | "NFD" | "NFKC" | "NFKD") => (self: string) => string;
/**
 * Pads the string from the end with a given fill string to a specified length.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("a", String.padEnd(5)), "a    ")
 * assert.deepStrictEqual(pipe("a", String.padEnd(5, "_")), "a____")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const padEnd: (maxLength: number, fillString?: string) => (self: string) => string;
/**
 * Pads the string from the start with a given fill string to a specified length.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("a", String.padStart(5)), "    a")
 * assert.deepStrictEqual(pipe("a", String.padStart(5, "_")), "____a")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const padStart: (maxLength: number, fillString?: string) => (self: string) => string;
/**
 * Repeats the string the specified number of times.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("a", String.repeat(5)), "aaaaa")
 * assert.deepStrictEqual(pipe("hello", String.repeat(3)), "hellohellohello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const repeat: (count: number) => (self: string) => string;
/**
 * Replaces all occurrences of a substring or pattern in a string.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(pipe("ababb", String.replaceAll("b", "c")), "acacc")
 * assert.deepStrictEqual(pipe("ababb", String.replaceAll(/ba/g, "cc")), "accbb")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const replaceAll: (searchValue: string | RegExp, replaceValue: string) => (self: string) => string;
/**
 * Searches for a match between a regular expression and the string.
 *
 * **Example**
 *
 * ```ts
 * import { String } from "effect"
 *
 * String.search("ababb", "b") // Option.some(1)
 * String.search("ababb", /abb/) // Option.some(2)
 * String.search("ababb", "d") // Option.none()
 * ```
 *
 * @category searching
 * @since 2.0.0
 */
export declare const search: {
    /**
     * Searches for a match between a regular expression and the string.
     *
     * **Example**
     *
     * ```ts
     * import { String } from "effect"
     *
     * String.search("ababb", "b") // Option.some(1)
     * String.search("ababb", /abb/) // Option.some(2)
     * String.search("ababb", "d") // Option.none()
     * ```
     *
     * @category searching
     * @since 2.0.0
     */
    (regExp: RegExp | string): (self: string) => Option.Option<number>;
    /**
     * Searches for a match between a regular expression and the string.
     *
     * **Example**
     *
     * ```ts
     * import { String } from "effect"
     *
     * String.search("ababb", "b") // Option.some(1)
     * String.search("ababb", /abb/) // Option.some(2)
     * String.search("ababb", "d") // Option.none()
     * ```
     *
     * @category searching
     * @since 2.0.0
     */
    (self: string, regExp: RegExp | string): Option.Option<number>;
};
/**
 * Converts the string to lowercase according to the specified locale.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * const str = "\u0130"
 * assert.deepStrictEqual(pipe(str, String.toLocaleLowerCase("tr")), "i")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const toLocaleLowerCase: (locale?: string | Array<string>) => (self: string) => string;
/**
 * Converts the string to uppercase according to the specified locale.
 *
 * @example
 * ```ts
 * import { pipe, String } from "effect"
 * import * as assert from "node:assert"
 *
 * const str = "i\u0307"
 * assert.deepStrictEqual(pipe(str, String.toLocaleUpperCase("lt-LT")), "I")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const toLocaleUpperCase: (locale?: string | Array<string>) => (self: string) => string;
/**
 * Keep the specified number of characters from the start of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.takeLeft("Hello World", 5), "Hello")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const takeLeft: {
    /**
     * Keep the specified number of characters from the start of a string.
     *
     * If `n` is larger than the available number of characters, the string will
     * be returned whole.
     *
     * If `n` is not a positive number, an empty string will be returned.
     *
     * If `n` is a float, it will be rounded down to the nearest integer.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(String.takeLeft("Hello World", 5), "Hello")
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (n: number): (self: string) => string;
    /**
     * Keep the specified number of characters from the start of a string.
     *
     * If `n` is larger than the available number of characters, the string will
     * be returned whole.
     *
     * If `n` is not a positive number, an empty string will be returned.
     *
     * If `n` is a float, it will be rounded down to the nearest integer.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(String.takeLeft("Hello World", 5), "Hello")
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (self: string, n: number): string;
};
/**
 * Keep the specified number of characters from the end of a string.
 *
 * If `n` is larger than the available number of characters, the string will
 * be returned whole.
 *
 * If `n` is not a positive number, an empty string will be returned.
 *
 * If `n` is a float, it will be rounded down to the nearest integer.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(String.takeRight("Hello World", 5), "World")
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const takeRight: {
    /**
     * Keep the specified number of characters from the end of a string.
     *
     * If `n` is larger than the available number of characters, the string will
     * be returned whole.
     *
     * If `n` is not a positive number, an empty string will be returned.
     *
     * If `n` is a float, it will be rounded down to the nearest integer.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(String.takeRight("Hello World", 5), "World")
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (n: number): (self: string) => string;
    /**
     * Keep the specified number of characters from the end of a string.
     *
     * If `n` is larger than the available number of characters, the string will
     * be returned whole.
     *
     * If `n` is not a positive number, an empty string will be returned.
     *
     * If `n` is a float, it will be rounded down to the nearest integer.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     * import * as assert from "node:assert"
     *
     * assert.deepStrictEqual(String.takeRight("Hello World", 5), "World")
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (self: string, n: number): string;
};
/**
 * Returns an `IterableIterator` which yields each line contained within the
 * string, trimming off the trailing newline character.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * const lines = String.linesIterator("hello\nworld\n")
 * console.log(Array.from(lines)) // ["hello", "world"]
 * ```
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const linesIterator: (self: string) => LinesIterator;
/**
 * Returns an `IterableIterator` which yields each line contained within the
 * string as well as the trailing newline character.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * const lines = String.linesWithSeparators("hello\nworld\n")
 * console.log(Array.from(lines)) // ["hello\n", "world\n"]
 * ```
 *
 * @category splitting
 * @since 2.0.0
 */
export declare const linesWithSeparators: (s: string) => LinesIterator;
/**
 * For every line in this string, strip a leading prefix consisting of blanks
 * or control characters followed by the character specified by `marginChar`
 * from the line.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * const text = "  |hello\n  |world"
 * const result = String.stripMarginWith(text, "|")
 * console.log(result) // "hello\nworld"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const stripMarginWith: {
    /**
     * For every line in this string, strip a leading prefix consisting of blanks
     * or control characters followed by the character specified by `marginChar`
     * from the line.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     *
     * const text = "  |hello\n  |world"
     * const result = String.stripMarginWith(text, "|")
     * console.log(result) // "hello\nworld"
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (marginChar: string): (self: string) => string;
    /**
     * For every line in this string, strip a leading prefix consisting of blanks
     * or control characters followed by the character specified by `marginChar`
     * from the line.
     *
     * @example
     * ```ts
     * import { String } from "effect"
     *
     * const text = "  |hello\n  |world"
     * const result = String.stripMarginWith(text, "|")
     * console.log(result) // "hello\nworld"
     * ```
     *
     * @category transforming
     * @since 2.0.0
     */
    (self: string, marginChar: string): string;
};
/**
 * For every line in this string, strip a leading prefix consisting of blanks
 * or control characters followed by the `"|"` character from the line.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * const text = "  |hello\n  |world"
 * const result = String.stripMargin(text)
 * console.log(result) // "hello\nworld"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const stripMargin: (self: string) => string;
/**
 * Converts a snake_case string to camelCase.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.snakeToCamel("hello_world")) // "helloWorld"
 * console.log(String.snakeToCamel("foo_bar_baz")) // "fooBarBaz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const snakeToCamel: (self: string) => string;
/**
 * Converts a snake_case string to PascalCase.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.snakeToPascal("hello_world")) // "HelloWorld"
 * console.log(String.snakeToPascal("foo_bar_baz")) // "FooBarBaz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const snakeToPascal: (self: string) => string;
/**
 * Converts a snake_case string to kebab-case.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.snakeToKebab("hello_world")) // "hello-world"
 * console.log(String.snakeToKebab("foo_bar_baz")) // "foo-bar-baz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const snakeToKebab: (self: string) => string;
/**
 * Converts a camelCase string to snake_case.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.camelToSnake("helloWorld")) // "hello_world"
 * console.log(String.camelToSnake("fooBarBaz")) // "foo_bar_baz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const camelToSnake: (self: string) => string;
/**
 * Converts a PascalCase string to snake_case.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.pascalToSnake("HelloWorld")) // "hello_world"
 * console.log(String.pascalToSnake("FooBarBaz")) // "foo_bar_baz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const pascalToSnake: (self: string) => string;
/**
 * Converts a kebab-case string to snake_case.
 *
 * @example
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.kebabToSnake("hello-world")) // "hello_world"
 * console.log(String.kebabToSnake("foo-bar-baz")) // "foo_bar_baz"
 * ```
 *
 * @category transforming
 * @since 2.0.0
 */
export declare const kebabToSnake: (self: string) => string;
declare class LinesIterator implements IterableIterator<string> {
    private index;
    private readonly length;
    readonly s: string;
    readonly stripped: boolean;
    constructor(s: string, stripped?: boolean);
    next(): IteratorResult<string>;
    [Symbol.iterator](): IterableIterator<string>;
    private get done();
}
/**
 * Normalize a string to a specific case format
 *
 * @category transforming
 * @since 4.0.0
 */
export declare const noCase: {
    /**
     * Normalize a string to a specific case format
     *
     * @category transforming
     * @since 4.0.0
     */
    (options?: {
        readonly splitRegExp?: RegExp | ReadonlyArray<RegExp> | undefined;
        readonly stripRegExp?: RegExp | ReadonlyArray<RegExp> | undefined;
        readonly delimiter?: string | undefined;
        readonly transform?: (part: string, index: number, parts: ReadonlyArray<string>) => string;
    }): (self: string) => string;
    /**
     * Normalize a string to a specific case format
     *
     * @category transforming
     * @since 4.0.0
     */
    (self: string, options?: {
        readonly splitRegExp?: RegExp | ReadonlyArray<RegExp> | undefined;
        readonly stripRegExp?: RegExp | ReadonlyArray<RegExp> | undefined;
        readonly delimiter?: string | undefined;
        readonly transform?: (part: string, index: number, parts: ReadonlyArray<string>) => string;
    }): string;
};
/**
 * Converts a string to PascalCase.
 *
 * @since 4.0.0
 * @category transforming
 */
export declare const pascalCase: (self: string) => string;
/**
 * Converts a string to camelCase.
 *
 * @since 4.0.0
 * @category transforming
 */
export declare const camelCase: (self: string) => string;
/**
 * Converts a string to CONSTANT_CASE (uppercase with underscores).
 *
 * @since 4.0.0
 * @category transforming
 */
export declare const constantCase: (self: string) => string;
/**
 * Converts a string to kebab-case (lowercase with hyphens).
 *
 * @since 4.0.0
 * @category transforming
 */
export declare const kebabCase: (self: string) => string;
/**
 * Converts a string to snake_case (lowercase with underscores).
 *
 * @since 4.0.0
 * @category transforming
 */
export declare const snakeCase: (self: string) => string;
/**
 * A `Reducer` for concatenating `string`s.
 *
 * @since 4.0.0
 */
export declare const ReducerConcat: Reducer.Reducer<string>;
export {};
//# sourceMappingURL=String.d.ts.map