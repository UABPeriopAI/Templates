/**
 * @since 4.0.0
 */
import type { NonEmptyReadonlyArray } from "../../Array.ts";
import * as Context from "../../Context.ts";
import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Fiber from "../../Fiber.ts";
import * as Inspectable from "../../Inspectable.ts";
import * as Layer from "../../Layer.ts";
import { type Pipeable } from "../../Pipeable.ts";
import * as Predicate from "../../Predicate.ts";
import * as Ref from "../../Ref.ts";
import * as Schedule from "../../Schedule.ts";
import type * as Scope from "../../Scope.ts";
import type { EqualsWith, ExcludeTag, ExtractTag, NoExcessProperties, NoInfer, Tags } from "../../Types.ts";
import type * as RateLimiter from "../persistence/RateLimiter.ts";
import * as Cookies from "./Cookies.ts";
import * as Error from "./HttpClientError.ts";
import * as HttpClientRequest from "./HttpClientRequest.ts";
import * as HttpClientResponse from "./HttpClientResponse.ts";
declare const TypeId = "~effect/http/HttpClient";
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isHttpClient: (u: unknown) => u is HttpClient;
/**
 * @since 4.0.0
 * @category models
 */
export interface HttpClient extends HttpClient.With<Error.HttpClientError> {
}
/**
 * @since 4.0.0
 */
export declare namespace HttpClient {
    /**
     * @since 4.0.0
     * @category models
     */
    interface With<E, R = never> extends Pipeable, Inspectable.Inspectable {
        readonly [TypeId]: typeof TypeId;
        readonly preprocess: Preprocess<E, R>;
        readonly postprocess: Postprocess<E, R>;
        readonly execute: (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly get: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly head: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly post: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly patch: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly put: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly del: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
        readonly options: (url: string | URL, options?: HttpClientRequest.Options.NoUrl) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
    }
    /**
     * @since 4.0.0
     * @category models
     */
    type Preprocess<E, R> = (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientRequest.HttpClientRequest, E, R>;
    /**
     * @since 4.0.0
     * @category models
     */
    type Postprocess<E = never, R = never> = (request: Effect.Effect<HttpClientRequest.HttpClientRequest, E, R>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>;
}
/**
 * @since 4.0.0
 * @category tags
 */
export declare const HttpClient: Context.Service<HttpClient, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const execute: (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const get: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const head: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const post: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const patch: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const put: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const del: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category accessors
 */
export declare const options: (url: string | URL, options?: HttpClientRequest.Options.NoUrl | undefined) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError, HttpClient>;
/**
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const transform: {
    /**
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E1, R1>(f: (effect: Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>, request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): (self: HttpClient.With<E, R>) => HttpClient.With<E | E1, R | R1>;
    /**
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E1, R1>(self: HttpClient.With<E, R>, f: (effect: Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>, request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): HttpClient.With<E | E1, R | R1>;
};
/**
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const transformResponse: {
    /**
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E1, R1>(f: (effect: Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): (self: HttpClient.With<E, R>) => HttpClient.With<E1, R1>;
    /**
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E1, R1>(self: HttpClient.With<E, R>, f: (effect: Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): HttpClient.With<E1, R1>;
};
declare const catch_: {
    <E, E2, R2>(f: (e: E) => Effect.Effect<HttpClientResponse.HttpClientResponse, E2, R2>): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E2, R2 | R>;
    <E, R, A2, E2, R2>(self: HttpClient.With<E, R>, f: (e: E) => Effect.Effect<A2, E2, R2>): HttpClient.With<E2, R | R2>;
};
export { 
/**
 * @since 4.0.0
 * @category error handling
 */
catch_ as catch };
/**
 * @since 4.0.0
 * @category error handling
 */
export declare const catchTag: {
    /**
     * @since 4.0.0
     * @category error handling
     */
    <K extends Tags<E> | NonEmptyReadonlyArray<Tags<E>>, E, E1, R1>(tag: K, f: (e: ExtractTag<NoInfer<E>, K extends NonEmptyReadonlyArray<string> ? K[number] : K>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E1 | ExcludeTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>, R1 | R>;
    /**
     * @since 4.0.0
     * @category error handling
     */
    <R, E, K extends Tags<E> | NonEmptyReadonlyArray<Tags<E>>, R1, E1>(self: HttpClient.With<E, R>, tag: K, f: (e: ExtractTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E1, R1>): HttpClient.With<E1 | ExcludeTag<E, K extends NonEmptyReadonlyArray<string> ? K[number] : K>, R1 | R>;
};
/**
 * @since 4.0.0
 * @category error handling
 */
export declare const catchTags: {
    /**
     * @since 4.0.0
     * @category error handling
     */
    <E, Cases extends {
        [K in Extract<E, {
            _tag: string;
        }>["_tag"]]+?: (error: Extract<E, {
            _tag: K;
        }>) => Effect.Effect<HttpClientResponse.HttpClientResponse, any, any>;
    } & (unknown extends E ? {} : {
        [K in Exclude<keyof Cases, Extract<E, {
            _tag: string;
        }>["_tag"]>]: never;
    })>(cases: Cases): <R>(self: HttpClient.With<E, R>) => HttpClient.With<Exclude<E, {
        _tag: keyof Cases;
    }> | {
        [K in keyof Cases]: Cases[K] extends (...args: Array<any>) => Effect.Effect<any, infer E, any> ? E : never;
    }[keyof Cases], R | {
        [K in keyof Cases]: Cases[K] extends (...args: Array<any>) => Effect.Effect<any, any, infer R> ? R : never;
    }[keyof Cases]>;
    /**
     * @since 4.0.0
     * @category error handling
     */
    <E extends {
        _tag: string;
    }, R, Cases extends {
        [K in Extract<E, {
            _tag: string;
        }>["_tag"]]+?: (error: Extract<E, {
            _tag: K;
        }>) => Effect.Effect<HttpClientResponse.HttpClientResponse, any, any>;
    } & (unknown extends E ? {} : {
        [K in Exclude<keyof Cases, Extract<E, {
            _tag: string;
        }>["_tag"]>]: never;
    })>(self: HttpClient.With<E, R>, cases: Cases): HttpClient.With<Exclude<E, {
        _tag: keyof Cases;
    }> | {
        [K in keyof Cases]: Cases[K] extends (...args: Array<any>) => Effect.Effect<any, infer E, any> ? E : never;
    }[keyof Cases], R | {
        [K in keyof Cases]: Cases[K] extends (...args: Array<any>) => Effect.Effect<any, any, infer R> ? R : never;
    }[keyof Cases]>;
};
/**
 * Filters the result of a response, or runs an alternative effect if the predicate fails.
 *
 * @since 4.0.0
 * @category filters
 */
export declare const filterOrElse: {
    /**
     * Filters the result of a response, or runs an alternative effect if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <B extends HttpClientResponse.HttpClientResponse, E2, R2>(refinement: Predicate.Refinement<NoInfer<HttpClientResponse.HttpClientResponse>, B>, orElse: (response: EqualsWith<HttpClientResponse.HttpClientResponse, B, NoInfer<HttpClientResponse.HttpClientResponse>, Exclude<NoInfer<HttpClientResponse.HttpClientResponse>, B>>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E2 | E, R2 | R>;
    /**
     * Filters the result of a response, or runs an alternative effect if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E2, R2>(predicate: Predicate.Predicate<NoInfer<HttpClientResponse.HttpClientResponse>>, orElse: (response: NoInfer<HttpClientResponse.HttpClientResponse>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E2 | E, R2 | R>;
    /**
     * Filters the result of a response, or runs an alternative effect if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E, R, B extends HttpClientResponse.HttpClientResponse, E2, R2>(self: HttpClient.With<E, R>, refinement: Predicate.Refinement<HttpClientResponse.HttpClientResponse, B>, orElse: (response: EqualsWith<HttpClientResponse.HttpClientResponse, B, HttpClientResponse.HttpClientResponse, Exclude<HttpClientResponse.HttpClientResponse, B>>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E2, R2>): HttpClient.With<E2 | E, R2 | R>;
    /**
     * Filters the result of a response, or runs an alternative effect if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E, R, E2, R2>(self: HttpClient.With<E, R>, predicate: Predicate.Predicate<HttpClientResponse.HttpClientResponse>, orElse: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<HttpClientResponse.HttpClientResponse, E2, R2>): HttpClient.With<E2 | E, R2 | R>;
};
/**
 * Filters the result of a response, or throws an error if the predicate fails.
 *
 * @since 4.0.0
 * @category filters
 */
export declare const filterOrFail: {
    /**
     * Filters the result of a response, or throws an error if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <B extends HttpClientResponse.HttpClientResponse, E2>(refinement: Predicate.Refinement<NoInfer<HttpClientResponse.HttpClientResponse>, B>, orFailWith: (response: NoInfer<HttpClientResponse.HttpClientResponse>) => E2): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E2 | E, R>;
    /**
     * Filters the result of a response, or throws an error if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E2>(predicate: Predicate.Predicate<NoInfer<HttpClientResponse.HttpClientResponse>>, orFailWith: (response: NoInfer<HttpClientResponse.HttpClientResponse>) => E2): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E2 | E, R>;
    /**
     * Filters the result of a response, or throws an error if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E, R, B extends HttpClientResponse.HttpClientResponse, E2>(self: HttpClient.With<E, R>, refinement: Predicate.Refinement<NoInfer<HttpClientResponse.HttpClientResponse>, B>, orFailWith: (response: NoInfer<HttpClientResponse.HttpClientResponse>) => E2): HttpClient.With<E2 | E, R>;
    /**
     * Filters the result of a response, or throws an error if the predicate fails.
     *
     * @since 4.0.0
     * @category filters
     */
    <E, R, E2>(self: HttpClient.With<E, R>, predicate: Predicate.Predicate<NoInfer<HttpClientResponse.HttpClientResponse>>, orFailWith: (response: NoInfer<HttpClientResponse.HttpClientResponse>) => E2): HttpClient.With<E2 | E, R>;
};
/**
 * Filters responses by HTTP status code.
 *
 * @since 4.0.0
 * @category filters
 */
export declare const filterStatus: {
    /**
     * Filters responses by HTTP status code.
     *
     * @since 4.0.0
     * @category filters
     */
    (f: (status: number) => boolean): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | Error.HttpClientError, R>;
    /**
     * Filters responses by HTTP status code.
     *
     * @since 4.0.0
     * @category filters
     */
    <E, R>(self: HttpClient.With<E, R>, f: (status: number) => boolean): HttpClient.With<E | Error.HttpClientError, R>;
};
/**
 * Filters responses that return a 2xx status code.
 *
 * @since 4.0.0
 * @category filters
 */
export declare const filterStatusOk: <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | Error.HttpClientError, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const makeWith: <E2, R2, E, R>(postprocess: (request: Effect.Effect<HttpClientRequest.HttpClientRequest, E2, R2>) => Effect.Effect<HttpClientResponse.HttpClientResponse, E, R>, preprocess: HttpClient.Preprocess<E2, R2>) => HttpClient.With<E, R>;
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const make: (f: (request: HttpClientRequest.HttpClientRequest, url: URL, signal: AbortSignal, fiber: Fiber.Fiber<HttpClientResponse.HttpClientResponse, Error.HttpClientError>) => Effect.Effect<HttpClientResponse.HttpClientResponse, Error.HttpClientError>) => HttpClient;
/**
 * Appends a transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const mapRequest: {
    /**
     * Appends a transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    (f: (a: HttpClientRequest.HttpClientRequest) => HttpClientRequest.HttpClientRequest): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E, R>;
    /**
     * Appends a transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R>(self: HttpClient.With<E, R>, f: (a: HttpClientRequest.HttpClientRequest) => HttpClientRequest.HttpClientRequest): HttpClient.With<E, R>;
};
/**
 * Appends an effectful transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const mapRequestEffect: {
    /**
     * Appends an effectful transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E2, R2>(f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientRequest.HttpClientRequest, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | E2, R | R2>;
    /**
     * Appends an effectful transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E2, R2>(self: HttpClient.With<E, R>, f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientRequest.HttpClientRequest, E2, R2>): HttpClient.With<E | E2, R | R2>;
};
/**
 * Prepends a transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const mapRequestInput: {
    /**
     * Prepends a transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    (f: (a: HttpClientRequest.HttpClientRequest) => HttpClientRequest.HttpClientRequest): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E, R>;
    /**
     * Prepends a transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R>(self: HttpClient.With<E, R>, f: (a: HttpClientRequest.HttpClientRequest) => HttpClientRequest.HttpClientRequest): HttpClient.With<E, R>;
};
/**
 * Prepends an effectful transformation of the request object before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const mapRequestInputEffect: {
    /**
     * Prepends an effectful transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E2, R2>(f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientRequest.HttpClientRequest, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | E2, R | R2>;
    /**
     * Prepends an effectful transformation of the request object before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, E2, R2>(self: HttpClient.With<E, R>, f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientRequest.HttpClientRequest, E2, R2>): HttpClient.With<E | E2, R | R2>;
};
/**
 * @since 4.0.0
 * @category error handling
 */
export declare namespace Retry {
    /**
     * @since 4.0.0
     * @category error handling
     */
    type Return<R, E, O extends NoExcessProperties<Effect.Retry.Options<E>, O>> = HttpClient.With<(O extends {
        schedule: Schedule.Schedule<infer _O, infer _I, infer _E, infer _R>;
    } ? E | _E : O extends {
        times: number;
    } ? E : O extends {
        until: Predicate.Refinement<E, infer E2>;
    } ? E2 : E) | (O extends {
        while: (...args: Array<any>) => Effect.Effect<infer _A, infer E, infer _R>;
    } ? E : never) | (O extends {
        until: (...args: Array<any>) => Effect.Effect<infer _A, infer E, infer _R>;
    } ? E : never), R | (O extends {
        schedule: Schedule.Schedule<infer _O, infer _I, infer _E, infer R>;
    } ? R : never) | (O extends {
        while: (...args: Array<any>) => Effect.Effect<infer _A, infer _E, infer R>;
    } ? R : never) | (O extends {
        until: (...args: Array<any>) => Effect.Effect<infer _A, infer _E, infer R>;
    } ? R : never)> extends infer Z ? Z : never;
}
/**
 * Retries the request based on a provided schedule or policy.
 *
 * @since 4.0.0
 * @category error handling
 */
export declare const retry: {
    /**
     * Retries the request based on a provided schedule or policy.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, O extends NoExcessProperties<Effect.Retry.Options<E>, O>>(options: O): <R>(self: HttpClient.With<E, R>) => Retry.Return<R, E, O>;
    /**
     * Retries the request based on a provided schedule or policy.
     *
     * @since 4.0.0
     * @category error handling
     */
    <B, E, ES, R1>(policy: Schedule.Schedule<B, NoInfer<E>, ES, R1>): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E | ES, R1 | R>;
    /**
     * Retries the request based on a provided schedule or policy.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, R, O extends NoExcessProperties<Effect.Retry.Options<E>, O>>(self: HttpClient.With<E, R>, options: O): Retry.Return<R, E, O>;
    /**
     * Retries the request based on a provided schedule or policy.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, R, B, ES, R1>(self: HttpClient.With<E, R>, policy: Schedule.Schedule<B, E, ES, R1>): HttpClient.With<E | ES, R1 | R>;
};
/**
 * Retries common transient errors, such as rate limiting, timeouts or network issues.
 *
 * Use `retryOn` to focus on retrying errors, transient responses, or both.
 *
 * Specifying a `while` predicate allows you to consider other errors as
 * transient, and is ignored in "response-only" mode.
 *
 * @since 4.0.0
 * @category error handling
 */
export declare const retryTransient: {
    /**
     * Retries common transient errors, such as rate limiting, timeouts or network issues.
     *
     * Use `retryOn` to focus on retrying errors, transient responses, or both.
     *
     * Specifying a `while` predicate allows you to consider other errors as
     * transient, and is ignored in "response-only" mode.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, B = never, ES = never, R1 = never, const RetryOn extends "errors-only" | "response-only" | "errors-and-responses" = "errors-only" | "response-only" | "errors-and-responses", Input = RetryOn extends "errors-only" ? E : RetryOn extends "response-only" ? HttpClientResponse.HttpClientResponse : HttpClientResponse.HttpClientResponse | E>(options: {
        readonly retryOn?: RetryOn | undefined;
        readonly while?: Predicate.Predicate<NoInfer<E | ES>>;
        readonly schedule?: Schedule.Schedule<B, NoInfer<Input>, ES, R1>;
        readonly times?: number;
    }): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E | ES, R1 | R>;
    /**
     * Retries common transient errors, such as rate limiting, timeouts or network issues.
     *
     * Use `retryOn` to focus on retrying errors, transient responses, or both.
     *
     * Specifying a `while` predicate allows you to consider other errors as
     * transient, and is ignored in "response-only" mode.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, R, B = never, ES = never, R1 = never, const RetryOn extends "errors-only" | "response-only" | "errors-and-responses" = "errors-only" | "response-only" | "errors-and-responses", Input = RetryOn extends "errors-only" ? E : RetryOn extends "response-only" ? HttpClientResponse.HttpClientResponse : HttpClientResponse.HttpClientResponse | E>(self: HttpClient.With<E, R>, options: {
        readonly retryOn?: RetryOn | undefined;
        readonly while?: Predicate.Predicate<NoInfer<E | ES>>;
        readonly schedule?: Schedule.Schedule<B, NoInfer<Input>, ES, R1>;
        readonly times?: number;
    }): HttpClient.With<E | ES, R1 | R>;
    /**
     * Retries common transient errors, such as rate limiting, timeouts or network issues.
     *
     * Use `retryOn` to focus on retrying errors, transient responses, or both.
     *
     * Specifying a `while` predicate allows you to consider other errors as
     * transient, and is ignored in "response-only" mode.
     *
     * @since 4.0.0
     * @category error handling
     */
    <B, E, ES = never, R1 = never>(options: Schedule.Schedule<B, NoInfer<HttpClientResponse.HttpClientResponse | E>, ES, R1>): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E | ES, R1 | R>;
    /**
     * Retries common transient errors, such as rate limiting, timeouts or network issues.
     *
     * Use `retryOn` to focus on retrying errors, transient responses, or both.
     *
     * Specifying a `while` predicate allows you to consider other errors as
     * transient, and is ignored in "response-only" mode.
     *
     * @since 4.0.0
     * @category error handling
     */
    <E, R, B, ES = never, R1 = never>(self: HttpClient.With<E, R>, options: Schedule.Schedule<B, NoInfer<HttpClientResponse.HttpClientResponse | E>, ES, R1>): HttpClient.With<E | ES, R1 | R>;
};
/**
 * @since 4.0.0
 * @category rate limiting
 */
export declare namespace WithRateLimiter {
    /**
     * @since 4.0.0
     * @category rate limiting
     */
    interface Options {
        /**
         * The `RateLimiter` service to use for rate limiting.
         */
        readonly limiter: RateLimiter.RateLimiter;
        /**
         * The initial rate limit window duration.
         */
        readonly window: Duration.Input;
        /**
         * The initial maximum number of allowed requests in the window.
         */
        readonly limit: number;
        /**
         * The key to identify the rate limit. Requests with the same key will share
         * the same rate limit. This can be used to implement per-user or
         * per-endpoint rate limits.
         */
        readonly key: string | ((request: HttpClientRequest.HttpClientRequest) => string);
        /**
         * Defaults to `"fixed-window"`.
         */
        readonly algorithm?: "fixed-window" | "token-bucket" | undefined;
        /**
         * Defaults to `1`.
         */
        readonly tokens?: number | ((request: HttpClientRequest.HttpClientRequest) => number) | undefined;
        /**
         * Disable automatic limits updates from response headers.
         */
        readonly disableResponseInspection?: boolean | undefined;
    }
}
/**
 * Applies request rate limiting using the `RateLimiter` service.
 *
 * It can update limits by inspecting common rate limit response headers and
 * automatically retries HTTP `429` responses (or `HttpClientError` values
 * wrapping a `429` response) by forcing the retry back through the limiter.
 *
 * @since 4.0.0
 * @category rate limiting
 */
export declare const withRateLimiter: {
    /**
     * Applies request rate limiting using the `RateLimiter` service.
     *
     * It can update limits by inspecting common rate limit response headers and
     * automatically retries HTTP `429` responses (or `HttpClientError` values
     * wrapping a `429` response) by forcing the retry back through the limiter.
     *
     * @since 4.0.0
     * @category rate limiting
     */
    (options: WithRateLimiter.Options): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | RateLimiter.RateLimiterError, R>;
    /**
     * Applies request rate limiting using the `RateLimiter` service.
     *
     * It can update limits by inspecting common rate limit response headers and
     * automatically retries HTTP `429` responses (or `HttpClientError` values
     * wrapping a `429` response) by forcing the retry back through the limiter.
     *
     * @since 4.0.0
     * @category rate limiting
     */
    <E, R>(self: HttpClient.With<E, R>, options: WithRateLimiter.Options): HttpClient.With<E | RateLimiter.RateLimiterError, R>;
};
/**
 * Performs an additional effect after a successful request.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const tap: {
    /**
     * Performs an additional effect after a successful request.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <_, E2, R2>(f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<_, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | E2, R | R2>;
    /**
     * Performs an additional effect after a successful request.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, _, E2, R2>(self: HttpClient.With<E, R>, f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<_, E2, R2>): HttpClient.With<E | E2, R | R2>;
};
/**
 * Performs an additional effect after an unsuccessful request.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const tapError: {
    /**
     * Performs an additional effect after an unsuccessful request.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <_, E, E2, R2>(f: (e: NoInfer<E>) => Effect.Effect<_, E2, R2>): <R>(self: HttpClient.With<E, R>) => HttpClient.With<E | E2, R | R2>;
    /**
     * Performs an additional effect after an unsuccessful request.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, _, E2, R2>(self: HttpClient.With<E, R>, f: (e: NoInfer<E>) => Effect.Effect<_, E2, R2>): HttpClient.With<E | E2, R | R2>;
};
/**
 * Performs an additional effect on the request before sending it.
 *
 * @since 4.0.0
 * @category mapping & sequencing
 */
export declare const tapRequest: {
    /**
     * Performs an additional effect on the request before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <_, E2, R2>(f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<_, E2, R2>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E | E2, R | R2>;
    /**
     * Performs an additional effect on the request before sending it.
     *
     * @since 4.0.0
     * @category mapping & sequencing
     */
    <E, R, _, E2, R2>(self: HttpClient.With<E, R>, f: (a: HttpClientRequest.HttpClientRequest) => Effect.Effect<_, E2, R2>): HttpClient.With<E | E2, R | R2>;
};
/**
 * Associates a `Ref` of cookies with the client for handling cookies across requests.
 *
 * @since 4.0.0
 * @category cookies
 */
export declare const withCookiesRef: {
    /**
     * Associates a `Ref` of cookies with the client for handling cookies across requests.
     *
     * @since 4.0.0
     * @category cookies
     */
    (ref: Ref.Ref<Cookies.Cookies>): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E, R>;
    /**
     * Associates a `Ref` of cookies with the client for handling cookies across requests.
     *
     * @since 4.0.0
     * @category cookies
     */
    <E, R>(self: HttpClient.With<E, R>, ref: Ref.Ref<Cookies.Cookies>): HttpClient.With<E, R>;
};
/**
 * Ties the lifetime of the `HttpClientRequest` to a `Scope`.
 *
 * @since 4.0.0
 * @category Scope
 */
export declare const withScope: <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E, R | Scope.Scope>;
/**
 * Follows HTTP redirects up to a specified number of times.
 *
 * @since 4.0.0
 * @category redirects
 */
export declare const followRedirects: {
    /**
     * Follows HTTP redirects up to a specified number of times.
     *
     * @since 4.0.0
     * @category redirects
     */
    (maxRedirects?: number | undefined): <E, R>(self: HttpClient.With<E, R>) => HttpClient.With<E, R>;
    /**
     * Follows HTTP redirects up to a specified number of times.
     *
     * @since 4.0.0
     * @category redirects
     */
    <E, R>(self: HttpClient.With<E, R>, maxRedirects?: number | undefined): HttpClient.With<E, R>;
};
/**
 * @since 4.0.0
 * @category References
 */
export declare const TracerDisabledWhen: Context.Reference<Predicate.Predicate<HttpClientRequest.HttpClientRequest>>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const TracerPropagationEnabled: Context.Reference<boolean>;
/**
 * @since 4.0.0
 * @category References
 */
export declare const SpanNameGenerator: Context.Reference<(request: HttpClientRequest.HttpClientRequest) => string>;
/**
 * @since 4.0.0
 */
export declare const layerMergedContext: <E, R>(effect: Effect.Effect<HttpClient, E, R>) => Layer.Layer<HttpClient, E, R>;
//# sourceMappingURL=HttpClient.d.ts.map