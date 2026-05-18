/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import * as Equ from "../../Equivalence.ts";
import * as Option from "../../Option.ts";
import * as Record from "../../Record.ts";
import * as Redactable from "../../Redactable.ts";
import * as Redacted from "../../Redacted.ts";
import * as Schema from "../../Schema.ts";
/**
 * This is a symbol to allow direct access of keys without conflicts.
 *
 * @since 4.0.0
 * @category type ids
 */
export declare const TypeId: unique symbol;
/**
 * @since 4.0.0
 * @category type ids
 */
export type TypeId = typeof TypeId;
/**
 * @since 4.0.0
 * @category refinements
 */
export declare const isHeaders: (u: unknown) => u is Headers;
/**
 * @since 4.0.0
 * @category models
 */
export interface Headers extends Redactable.Redactable {
    readonly [TypeId]: TypeId;
    readonly [key: string]: string;
}
/**
 * @since 4.0.0
 * @category Equivalence
 */
export declare const Equivalence: Equ.Equivalence<Headers>;
/**
 * @since 4.0.0
 * @category schemas
 */
export interface HeadersSchema extends Schema.declare<Headers, {
    readonly [x: string]: string;
}> {
}
/**
 * @since 4.0.0
 * @category schemas
 */
export declare const HeadersSchema: HeadersSchema;
/**
 * @since 4.0.0
 * @category models
 */
export type Input = Record.ReadonlyRecord<string, string | ReadonlyArray<string> | undefined> | Iterable<readonly [string, string]>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const empty: Headers;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromInput: (input?: Input) => Headers;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const fromRecordUnsafe: (input: Record.ReadonlyRecord<string, string>) => Headers;
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const has: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: Headers) => boolean;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, key: string): boolean;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const get: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: Headers) => Option.Option<string>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, key: string): Option.Option<string>;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const set: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string, value: string): (self: Headers) => Headers;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, key: string, value: string): Headers;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const setAll: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (headers: Input): (self: Headers) => Headers;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, headers: Input): Headers;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const merge: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (headers: Headers): (self: Headers) => Headers;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, headers: Headers): Headers;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const remove: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string): (self: Headers) => Headers;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, key: string): Headers;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const removeMany: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (keys: Iterable<string>): (self: Headers) => Headers;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, keys: Iterable<string>): Headers;
};
/**
 * @since 4.0.0
 * @category combinators
 */
export declare const redact: {
    /**
     * @since 4.0.0
     * @category combinators
     */
    (key: string | RegExp | ReadonlyArray<string | RegExp>): (self: Headers) => Record<string, string | Redacted.Redacted>;
    /**
     * @since 4.0.0
     * @category combinators
     */
    (self: Headers, key: string | RegExp | ReadonlyArray<string | RegExp>): Record<string, string | Redacted.Redacted>;
};
/**
 * @since 4.0.0
 * @category fiber refs
 */
export declare const CurrentRedactedNames: Context.Reference<readonly (string | RegExp)[]>;
//# sourceMappingURL=Headers.d.ts.map