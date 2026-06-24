/**
 * This module provides utility functions and type class instances for working with the `string` type in TypeScript.
 * It includes functions for basic string manipulation.
 *
 * @since 2.0.0
 */
import * as Equ from "./Equivalence.js";
import { dual } from "./Function.js";
import * as readonlyArray from "./internal/array.js";
import * as number from "./Number.js";
import * as Option from "./Option.js";
import * as order from "./Order.js";
import * as predicate from "./Predicate.js";
import * as Reducer from "./Reducer.js";
/**
 * Reference to the global `String` constructor.
 *
 * @category constructors
 * @since 4.0.0
 */
export const String = globalThis.String;
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
export const isString = predicate.isString;
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
export const Order = order.String;
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
export const Equivalence = Equ.String;
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
export const empty = "";
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
export const concat = /*#__PURE__*/dual(2, (self, that) => self + that);
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
export const toUpperCase = self => self.toUpperCase();
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
export const toLowerCase = self => self.toLowerCase();
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
export const capitalize = self => {
  if (self.length === 0) return self;
  return toUpperCase(self[0]) + self.slice(1);
};
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
export const uncapitalize = self => {
  if (self.length === 0) return self;
  return toLowerCase(self[0]) + self.slice(1);
};
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
export const replace = (searchValue, replaceValue) => self => self.replace(searchValue, replaceValue);
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
export const trim = self => self.trim();
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
export const trimStart = self => self.trimStart();
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
export const trimEnd = self => self.trimEnd();
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
export const slice = (start, end) => self => self.slice(start, end);
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
export const isEmpty = self => self.length === 0;
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
export const isNonEmpty = self => self.length > 0;
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
export const length = self => self.length;
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
export const split = /*#__PURE__*/dual(2, (self, separator) => {
  const out = self.split(separator);
  return readonlyArray.isArrayNonEmpty(out) ? out : [self];
});
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
export const includes = (searchString, position) => self => self.includes(searchString, position);
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
export const startsWith = (searchString, position) => self => self.startsWith(searchString, position);
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
export const endsWith = (searchString, position) => self => self.endsWith(searchString, position);
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
export const charCodeAt = /*#__PURE__*/dual(2, (self, index) => Option.filter(Option.some(self.charCodeAt(index)), charCode => !isNaN(charCode)));
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
export const substring = (start, end) => self => self.substring(start, end);
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
export const at = /*#__PURE__*/dual(2, (self, index) => Option.fromUndefinedOr(self.at(index)));
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
export const charAt = /*#__PURE__*/dual(2, (self, index) => Option.filter(Option.some(self.charAt(index)), isNonEmpty));
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
export const codePointAt = /*#__PURE__*/dual(2, (self, index) => Option.fromUndefinedOr(self.codePointAt(index)));
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
export const indexOf = searchString => self => Option.filter(Option.some(self.indexOf(searchString)), number.isGreaterThanOrEqualTo(0));
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
export const lastIndexOf = searchString => self => Option.filter(Option.some(self.lastIndexOf(searchString)), number.isGreaterThanOrEqualTo(0));
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
export const localeCompare = (that, locales, options) => self => number.sign(self.localeCompare(that, locales, options));
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
export const match = regExp => self => Option.fromNullOr(self.match(regExp));
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
export const matchAll = regExp => self => self.matchAll(regExp);
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
export const normalize = form => self => self.normalize(form);
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
export const padEnd = (maxLength, fillString) => self => self.padEnd(maxLength, fillString);
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
export const padStart = (maxLength, fillString) => self => self.padStart(maxLength, fillString);
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
export const repeat = count => self => self.repeat(count);
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
export const replaceAll = (searchValue, replaceValue) => self => self.replaceAll(searchValue, replaceValue);
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
export const search = /*#__PURE__*/dual(2, (self, regExp) => Option.filter(Option.some(self.search(regExp)), number.isGreaterThanOrEqualTo(0)));
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
export const toLocaleLowerCase = locale => self => self.toLocaleLowerCase(locale);
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
export const toLocaleUpperCase = locale => self => self.toLocaleUpperCase(locale);
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
export const takeLeft = /*#__PURE__*/dual(2, (self, n) => self.slice(0, Math.max(n, 0)));
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
export const takeRight = /*#__PURE__*/dual(2, (self, n) => self.slice(Math.max(0, self.length - Math.floor(n)), Infinity));
const CR = 0x0d;
const LF = 0x0a;
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
export const linesIterator = self => linesSeparated(self, true);
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
export const linesWithSeparators = s => linesSeparated(s, false);
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
export const stripMarginWith = /*#__PURE__*/dual(2, (self, marginChar) => {
  let out = "";
  for (const line of linesWithSeparators(self)) {
    let index = 0;
    while (index < line.length && line.charAt(index) <= " ") {
      index = index + 1;
    }
    const stripped = index < line.length && line.charAt(index) === marginChar ? line.substring(index + 1) : line;
    out = out + stripped;
  }
  return out;
});
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
export const stripMargin = self => stripMarginWith(self, "|");
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
export const snakeToCamel = self => {
  let str = self[0];
  for (let i = 1; i < self.length; i++) {
    str += self[i] === "_" ? self[++i].toUpperCase() : self[i];
  }
  return str;
};
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
export const snakeToPascal = self => {
  let str = self[0].toUpperCase();
  for (let i = 1; i < self.length; i++) {
    str += self[i] === "_" ? self[++i].toUpperCase() : self[i];
  }
  return str;
};
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
export const snakeToKebab = self => self.replace(/_/g, "-");
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
export const camelToSnake = self => self.replace(/([A-Z])/g, "_$1").toLowerCase();
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
export const pascalToSnake = self => (self.slice(0, 1) + self.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
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
export const kebabToSnake = self => self.replace(/-/g, "_");
class LinesIterator {
  index;
  length;
  s;
  stripped;
  constructor(s, stripped = false) {
    this.s = s;
    this.stripped = stripped;
    this.index = 0;
    this.length = s.length;
  }
  next() {
    if (this.done) {
      return {
        done: true,
        value: undefined
      };
    }
    const start = this.index;
    while (!this.done && !isLineBreak(this.s[this.index])) {
      this.index = this.index + 1;
    }
    let end = this.index;
    if (!this.done) {
      const char = this.s[this.index];
      this.index = this.index + 1;
      if (!this.done && isLineBreak2(char, this.s[this.index])) {
        this.index = this.index + 1;
      }
      if (!this.stripped) {
        end = this.index;
      }
    }
    return {
      done: false,
      value: this.s.substring(start, end)
    };
  }
  [Symbol.iterator]() {
    return new LinesIterator(this.s, this.stripped);
  }
  get done() {
    return this.index >= this.length;
  }
}
/**
 * Test if the provided character is a line break character (i.e. either `"\r"`
 * or `"\n"`).
 */
const isLineBreak = char => {
  const code = char.charCodeAt(0);
  return code === CR || code === LF;
};
/**
 * Test if the provided characters combine to form a carriage return/line-feed
 * (i.e. `"\r\n"`).
 */
const isLineBreak2 = (char0, char1) => char0.charCodeAt(0) === CR && char1.charCodeAt(0) === LF;
const linesSeparated = (self, stripped) => new LinesIterator(self, stripped);
/**
 * Normalize a string to a specific case format
 *
 * @category transforming
 * @since 4.0.0
 */
export const noCase = /*#__PURE__*/dual(args => typeof args[0] === "string", (input, options) => {
  const delimiter = options?.delimiter ?? " ";
  const transform = options?.transform ?? toLowerCase;
  const result = input.replace(SPLIT_REGEXP[0], "$1\0$2").replace(SPLIT_REGEXP[1], "$1\0$2").replace(STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  // Trim the delimiter from around the output string.
  while (result.charAt(start) === "\0") {
    start++;
  }
  while (result.charAt(end - 1) === "\0") {
    end--;
  }
  // Transform each token independently.
  return result.slice(start, end).split("\0").map(transform).join(delimiter);
});
// Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
const SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
// Remove all non-word characters.
const STRIP_REGEXP = /[^A-Z0-9]+/gi;
const pascalCaseTransform = (input, index) => {
  const firstChar = input.charAt(0);
  const lowerChars = input.substring(1).toLowerCase();
  if (index > 0 && firstChar >= "0" && firstChar <= "9") {
    return `_${firstChar}${lowerChars}`;
  }
  return `${firstChar.toUpperCase()}${lowerChars}`;
};
/**
 * Converts a string to PascalCase.
 *
 * @since 4.0.0
 * @category transforming
 */
export const pascalCase = /*#__PURE__*/noCase({
  delimiter: "",
  transform: pascalCaseTransform
});
const camelCaseTransform = (input, index) => index === 0 ? input.toLowerCase() : pascalCaseTransform(input, index);
/**
 * Converts a string to camelCase.
 *
 * @since 4.0.0
 * @category transforming
 */
export const camelCase = /*#__PURE__*/noCase({
  delimiter: "",
  transform: camelCaseTransform
});
/**
 * Converts a string to CONSTANT_CASE (uppercase with underscores).
 *
 * @since 4.0.0
 * @category transforming
 */
export const constantCase = /*#__PURE__*/noCase({
  delimiter: "_",
  transform: toUpperCase
});
/**
 * Converts a string to kebab-case (lowercase with hyphens).
 *
 * @since 4.0.0
 * @category transforming
 */
export const kebabCase = /*#__PURE__*/noCase({
  delimiter: "-"
});
/**
 * Converts a string to snake_case (lowercase with underscores).
 *
 * @since 4.0.0
 * @category transforming
 */
export const snakeCase = /*#__PURE__*/noCase({
  delimiter: "_"
});
/**
 * A `Reducer` for concatenating `string`s.
 *
 * @since 4.0.0
 */
export const ReducerConcat = /*#__PURE__*/Reducer.make((a, b) => a + b, "");
//# sourceMappingURL=String.js.map