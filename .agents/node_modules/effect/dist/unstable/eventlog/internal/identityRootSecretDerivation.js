import * as Effect from "../../../Effect.js";
import * as Redacted from "../../../Redacted.js";
const textEncoder = /*#__PURE__*/new TextEncoder();
const Ed25519PublicKeyLength = 32;
const Ed25519Pkcs8SeedPrefix = /*#__PURE__*/Uint8Array.from([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
/** @internal */
export const EncryptionDerivationLabelV1 = "effect/eventlog/identity/v1/encryption";
/** @internal */
export const SigningDerivationLabelV1 = "effect/eventlog/identity/v1/signing";
const toArrayBuffer = data => {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
};
const decodeBase64Url = value => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const remainder = normalized.length % 4;
  const padded = remainder === 0 ? normalized : `${normalized}${"=".repeat(4 - remainder)}`;
  const decoded = atob(padded);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
};
const makeEd25519Pkcs8FromSeed = seed => {
  const key = new Uint8Array(Ed25519Pkcs8SeedPrefix.byteLength + seed.byteLength);
  key.set(Ed25519Pkcs8SeedPrefix, 0);
  key.set(seed, Ed25519Pkcs8SeedPrefix.byteLength);
  return key;
};
const deriveSecretBytes = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const labelBytes = textEncoder.encode(options.label);
  const derivationInput = new Uint8Array(labelBytes.byteLength + 1 + options.rootSecret.byteLength);
  derivationInput.set(labelBytes, 0);
  derivationInput[labelBytes.byteLength] = 0;
  derivationInput.set(options.rootSecret, labelBytes.byteLength + 1);
  const digest = yield* Effect.promise(() => options.crypto.subtle.digest("SHA-256", toArrayBuffer(derivationInput)));
  return new Uint8Array(digest);
});
/** @internal */
export const deriveIdentityRootSecretMaterial = /*#__PURE__*/Effect.fnUntraced(function* (options) {
  const encryptionKeyMaterial = yield* deriveSecretBytes({
    crypto: options.crypto,
    rootSecret: options.rootSecret,
    label: EncryptionDerivationLabelV1
  });
  const signingSeed = yield* deriveSecretBytes({
    crypto: options.crypto,
    rootSecret: options.rootSecret,
    label: SigningDerivationLabelV1
  });
  const signingPrivateKeyBytes = makeEd25519Pkcs8FromSeed(signingSeed);
  const encryptionKey = yield* Effect.promise(() => options.crypto.subtle.importKey("raw", toArrayBuffer(encryptionKeyMaterial), "AES-GCM", true, ["encrypt", "decrypt"]));
  const signingPrivateKey = yield* Effect.promise(() => options.crypto.subtle.importKey("pkcs8", toArrayBuffer(signingPrivateKeyBytes), "Ed25519", true, ["sign"]));
  const signingJwk = yield* Effect.promise(() => options.crypto.subtle.exportKey("jwk", signingPrivateKey));
  if (typeof signingJwk.x !== "string") {
    return yield* Effect.die(new Error("Unable to export deterministic Ed25519 public key"));
  }
  const signingPublicKey = decodeBase64Url(signingJwk.x);
  if (signingPublicKey.byteLength !== Ed25519PublicKeyLength) {
    return yield* Effect.die(new Error(`Expected derived signing public key to be ${Ed25519PublicKeyLength} bytes`));
  }
  return {
    encryptionKeyMaterial,
    encryptionKey,
    signingPublicKey,
    signingPrivateKey: Redacted.make(signingPrivateKeyBytes)
  };
});
/** @internal */
export const makeGetIdentityRootSecretMaterial = crypto => {
  const cache = new WeakMap();
  return Effect.fnUntraced(function* (identity) {
    const cached = cache.get(identity);
    if (cached !== undefined) {
      return cached;
    }
    const derived = yield* deriveIdentityRootSecretMaterial({
      crypto,
      rootSecret: Redacted.value(identity.privateKey)
    });
    yield* Effect.sync(() => {
      cache.set(identity, derived);
    });
    return derived;
  });
};
//# sourceMappingURL=identityRootSecretDerivation.js.map