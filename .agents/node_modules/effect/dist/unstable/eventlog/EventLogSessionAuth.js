/**
 * @since 4.0.0
 */
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
const textEncoder = /*#__PURE__*/new TextEncoder();
const textDecoder = /*#__PURE__*/new TextDecoder("utf-8", {
  fatal: true
});
const constLengthPrefixBytes = 4;
/**
 * @since 4.0.0
 * @category constants
 */
export const AuthPayloadContext = "eventlog-auth-v1";
/**
 * @since 4.0.0
 * @category constants
 */
export const Ed25519PublicKeyLength = 32;
/**
 * @since 4.0.0
 * @category constants
 */
export const Ed25519SignatureLength = 64;
/**
 * @since 4.0.0
 * @category constants
 */
export const SessionAuthChallengeLength = 32;
/**
 * @since 4.0.0
 * @category constants
 */
export const SessionAuthChallengeTimeToLiveMillis = 30_000;
/**
 * @since 4.0.0
 * @category errors
 */
export class EventLogSessionAuthError extends /*#__PURE__*/Data.TaggedError("EventLogSessionAuthError") {}
const toArrayBuffer = data => {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
};
const decodeUtf8 = bytes => Effect.try({
  try: () => textDecoder.decode(bytes),
  catch: cause => new EventLogSessionAuthError({
    reason: "InvalidPayload",
    message: "Session auth payload contains invalid UTF-8 bytes",
    cause
  })
});
const assertSigningPublicKeyLength = signingPublicKey => {
  if (signingPublicKey.byteLength === Ed25519PublicKeyLength) return Effect.void;
  return Effect.fail(new EventLogSessionAuthError({
    reason: "InvalidSigningPublicKeyLength",
    message: `Expected signingPublicKey length to be ${Ed25519PublicKeyLength} bytes, received ${signingPublicKey.byteLength}`
  }));
};
const assertSignatureLength = signature => {
  if (signature.byteLength === Ed25519SignatureLength) return Effect.void;
  return Effect.fail(new EventLogSessionAuthError({
    reason: "InvalidSignatureLength",
    message: `Expected signature length to be ${Ed25519SignatureLength} bytes, received ${signature.byteLength}`
  }));
};
const getSubtle = /*#__PURE__*/Effect.suspend(() => {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === undefined) {
    return Effect.fail(new EventLogSessionAuthError({
      reason: "CryptoUnavailable",
      message: "globalThis.crypto.subtle is not available"
    }));
  }
  return Effect.succeed(subtle);
});
const getCrypto = /*#__PURE__*/Effect.suspend(() => {
  const crypto = globalThis.crypto;
  if (crypto === undefined) {
    return Effect.fail(new EventLogSessionAuthError({
      reason: "CryptoUnavailable",
      message: "globalThis.crypto is not available"
    }));
  }
  return Effect.succeed(crypto);
});
const writeLength = (target, offset, length) => {
  if (length < 0 || length > 0xffff_ffff) {
    return Effect.fail(new EventLogSessionAuthError({
      reason: "InvalidPayload",
      message: `Invalid canonical field length: ${length}`
    }));
  }
  target[offset] = length >>> 24 & 0xff;
  target[offset + 1] = length >>> 16 & 0xff;
  target[offset + 2] = length >>> 8 & 0xff;
  target[offset + 3] = length & 0xff;
  return Effect.succeed(offset + constLengthPrefixBytes);
};
const readLength = (source, offset) => (source[offset] << 24 | source[offset + 1] << 16 | source[offset + 2] << 8 | source[offset + 3]) >>> 0;
const readField = (payload, state) => {
  if (state.offset + constLengthPrefixBytes > payload.byteLength) {
    return Effect.fail(new EventLogSessionAuthError({
      reason: "InvalidPayload",
      message: "Session auth payload is truncated before field length"
    }));
  }
  const length = readLength(payload, state.offset);
  state.offset += constLengthPrefixBytes;
  if (state.offset + length > payload.byteLength) {
    return Effect.fail(new EventLogSessionAuthError({
      reason: "InvalidPayload",
      message: "Session auth payload is truncated inside a field"
    }));
  }
  const field = payload.slice(state.offset, state.offset + length);
  state.offset += length;
  return Effect.succeed(field);
};
const bytesToHex = bytes => {
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
};
const encodeRemoteIdField = remoteId => typeof remoteId === "string" ? textEncoder.encode(remoteId) : textEncoder.encode(bytesToHex(remoteId));
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
export const encodeSessionAuthPayload = /*#__PURE__*/Effect.fnUntraced(function* (payload) {
  yield* assertSigningPublicKeyLength(payload.signingPublicKey);
  const fields = [textEncoder.encode(AuthPayloadContext), encodeRemoteIdField(payload.remoteId), payload.challenge, textEncoder.encode(payload.publicKey), payload.signingPublicKey];
  const totalLength = fields.reduce((total, field) => total + constLengthPrefixBytes + field.byteLength, 0);
  const encoded = new Uint8Array(totalLength);
  let offset = 0;
  for (const field of fields) {
    offset = yield* writeLength(encoded, offset, field.byteLength);
    encoded.set(field, offset);
    offset += field.byteLength;
  }
  return encoded;
});
/**
 * @since 4.0.0
 * @category encoding
 */
export const decodeSessionAuthPayload = /*#__PURE__*/Effect.fnUntraced(function* (payload) {
  const state = {
    offset: 0
  };
  const context = yield* decodeUtf8(yield* readField(payload, state));
  if (context !== AuthPayloadContext) {
    return yield* new EventLogSessionAuthError({
      reason: "InvalidContext",
      message: `Invalid session auth payload context: ${context}`
    });
  }
  const remoteId = yield* decodeUtf8(yield* readField(payload, state));
  const challenge = yield* readField(payload, state);
  const publicKey = yield* decodeUtf8(yield* readField(payload, state));
  const signingPublicKey = yield* readField(payload, state);
  yield* assertSigningPublicKeyLength(signingPublicKey);
  if (state.offset !== payload.byteLength) {
    return yield* new EventLogSessionAuthError({
      reason: "InvalidPayload",
      message: "Session auth payload contains trailing bytes"
    });
  }
  return {
    remoteId,
    challenge,
    publicKey,
    signingPublicKey
  };
});
/**
 * @since 4.0.0
 * @category signing
 */
export const signSessionAuthPayloadBytes = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  yield* decodeSessionAuthPayload(options.payload);
  const subtle = yield* getSubtle;
  let privateKey = yield* Effect.tryPromise({
    try: () => subtle.importKey("pkcs8", toArrayBuffer(options.signingPrivateKey), "Ed25519", false, ["sign"]),
    catch: cause => new EventLogSessionAuthError({
      reason: "InvalidSigningPrivateKey",
      message: "Failed to import Ed25519 signing private key (expected PKCS#8 bytes)",
      cause
    })
  });
  const signature = yield* Effect.tryPromise({
    try: () => subtle.sign("Ed25519", privateKey, toArrayBuffer(options.payload)),
    catch: cause => new EventLogSessionAuthError({
      reason: "CryptoFailure",
      message: "Failed to sign canonical session auth payload",
      cause
    })
  });
  return new Uint8Array(signature);
});
/**
 * @since 4.0.0
 * @category verification
 */
export const verifySessionAuthPayloadBytes = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  yield* decodeSessionAuthPayload(options.payload);
  yield* assertSigningPublicKeyLength(options.signingPublicKey);
  yield* assertSignatureLength(options.signature);
  const subtle = yield* getSubtle;
  const publicKey = yield* Effect.tryPromise({
    try: () => subtle.importKey("raw", toArrayBuffer(options.signingPublicKey), "Ed25519", false, ["verify"]),
    catch: cause => new EventLogSessionAuthError({
      reason: "InvalidSigningPublicKeyLength",
      message: "Failed to import Ed25519 signing public key",
      cause
    })
  });
  return yield* Effect.tryPromise({
    try: () => subtle.verify("Ed25519", publicKey, toArrayBuffer(options.signature), toArrayBuffer(options.payload)),
    catch: cause => new EventLogSessionAuthError({
      reason: "CryptoFailure",
      message: "Failed to verify canonical session auth payload signature",
      cause
    })
  });
});
/**
 * @since 4.0.0
 * @category signing
 */
export const signSessionAuthPayload = options => encodeSessionAuthPayload(options).pipe(Effect.flatMap(payload => signSessionAuthPayloadBytes({
  payload,
  signingPrivateKey: options.signingPrivateKey
})));
/**
 * @since 4.0.0
 * @category verification
 */
export const verifySessionAuthPayload = options => encodeSessionAuthPayload(options).pipe(Effect.flatMap(payload => verifySessionAuthPayloadBytes({
  payload,
  signingPublicKey: options.signingPublicKey,
  signature: options.signature
})));
/**
 * @since 4.0.0
 * @category challenge
 */
export const makeSessionAuthChallenge = /*#__PURE__*/Effect.gen(function* () {
  const crypto = yield* getCrypto;
  const challenge = new Uint8Array(SessionAuthChallengeLength);
  crypto.getRandomValues(challenge);
  return challenge;
});
/**
 * @since 4.0.0
 * @category verification
 */
export const verifySessionAuthenticateRequest = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  if (options.algorithm !== "Ed25519") {
    return yield* new EventLogSessionAuthError({
      reason: "InvalidAlgorithm",
      message: `Unsupported session auth algorithm: ${options.algorithm}`
    });
  }
  return yield* verifySessionAuthPayload({
    remoteId: options.remoteId,
    challenge: options.challenge,
    publicKey: options.publicKey,
    signingPublicKey: options.signingPublicKey,
    signature: options.signature
  });
});
//# sourceMappingURL=EventLogSessionAuth.js.map