import * as Effect from "../../Effect.ts";
/**
 * @since 4.0.0
 * @category constants
 */
export declare const AuthPayloadContext = "eventlog-auth-v1";
/**
 * @since 4.0.0
 * @category constants
 */
export declare const Ed25519PublicKeyLength = 32;
/**
 * @since 4.0.0
 * @category constants
 */
export declare const Ed25519SignatureLength = 64;
/**
 * @since 4.0.0
 * @category constants
 */
export declare const SessionAuthChallengeLength = 32;
/**
 * @since 4.0.0
 * @category constants
 */
export declare const SessionAuthChallengeTimeToLiveMillis = 30000;
/**
 * @since 4.0.0
 * @category model
 */
export interface SessionAuthPayload {
    readonly remoteId: string | Uint8Array;
    readonly challenge: Uint8Array;
    readonly publicKey: string;
    readonly signingPublicKey: Uint8Array;
}
declare const EventLogSessionAuthError_base: new <A extends Record<string, any> = {}>(args: import("../../Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("../../Cause.ts").YieldableError & {
    readonly _tag: "EventLogSessionAuthError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class EventLogSessionAuthError extends EventLogSessionAuthError_base<{
    readonly reason: "InvalidPayload" | "InvalidContext" | "InvalidAlgorithm" | "InvalidSigningPublicKeyLength" | "InvalidSignatureLength" | "InvalidSigningPrivateKey" | "CryptoUnavailable" | "CryptoFailure";
    readonly message: string;
    readonly cause?: unknown;
}> {
}
/**
 * Canonical payload format uses ordered big-endian length-prefixed fields:
 *
 * 1. context (fixed: eventlog-auth-v1)
 * 2. remoteId
 * 3. challenge bytes
 * 4. publicKey
 * 5. signingPublicKey bytes
 *
 * @since 4.0.0
 * @category encoding
 */
export declare const encodeSessionAuthPayload: (payload: SessionAuthPayload) => Effect.Effect<Uint8Array<ArrayBuffer>, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category encoding
 */
export declare const decodeSessionAuthPayload: (payload: Uint8Array<ArrayBufferLike>) => Effect.Effect<SessionAuthPayload, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category signing
 */
export declare const signSessionAuthPayloadBytes: (options: {
    readonly payload: Uint8Array;
    readonly signingPrivateKey: Uint8Array;
}) => Effect.Effect<Uint8Array<ArrayBuffer>, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category verification
 */
export declare const verifySessionAuthPayloadBytes: (options: {
    readonly payload: Uint8Array;
    readonly signingPublicKey: Uint8Array;
    readonly signature: Uint8Array;
}) => Effect.Effect<boolean, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category signing
 */
export declare const signSessionAuthPayload: (options: SessionAuthPayload & {
    readonly signingPrivateKey: Uint8Array;
}) => Effect.Effect<Uint8Array<ArrayBuffer>, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category verification
 */
export declare const verifySessionAuthPayload: (options: SessionAuthPayload & {
    readonly signature: Uint8Array;
}) => Effect.Effect<boolean, EventLogSessionAuthError, never>;
/**
 * @since 4.0.0
 * @category challenge
 */
export declare const makeSessionAuthChallenge: Effect.Effect<Uint8Array<ArrayBuffer>, EventLogSessionAuthError>;
/**
 * @since 4.0.0
 * @category verification
 */
export declare const verifySessionAuthenticateRequest: (options: {
    readonly remoteId: string | Uint8Array;
    readonly challenge: Uint8Array;
    readonly publicKey: string;
    readonly signingPublicKey: Uint8Array;
    readonly signature: Uint8Array;
    readonly algorithm: string;
}) => Effect.Effect<boolean, EventLogSessionAuthError, never>;
export {};
//# sourceMappingURL=EventLogSessionAuth.d.ts.map