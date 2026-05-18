/**
 * @since 4.0.0
 */
import * as Context from "../../Context.js";
import * as Effect from "../../Effect.js";
import * as Layer from "../../Layer.js";
import * as Redacted from "../../Redacted.js";
import * as Schema from "../../Schema.js";
import * as Transferable from "../workers/Transferable.js";
import { Entry, EntryId, RemoteEntry } from "./EventJournal.js";
import { makeGetIdentityRootSecretMaterial } from "./internal/identityRootSecretDerivation.js";
/**
 * @since 4.0.0
 * @category models
 */
export const EncryptedEntry = /*#__PURE__*/Schema.Struct({
  entryId: EntryId,
  encryptedEntry: Transferable.Uint8Array
});
/**
 * @since 4.0.0
 * @category models
 */
export const EncryptedRemoteEntry = /*#__PURE__*/Schema.Struct({
  sequence: Schema.Number,
  iv: Transferable.Uint8Array,
  entryId: EntryId,
  encryptedEntry: Transferable.Uint8Array
});
const toArrayBuffer = data => {
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  return buffer;
};
const toBufferSource = data => new Uint8Array(toArrayBuffer(data));
/**
 * @since 4.0.0
 * @category services
 */
export class EventLogEncryption extends /*#__PURE__*/Context.Service()("effect/eventlog/EventLogEncryption") {}
/**
 * @since 4.0.0
 * @category encryption
 */
export const makeEncryptionSubtle = crypto => Effect.sync(() => {
  const getIdentityRootSecretMaterial = makeGetIdentityRootSecretMaterial(crypto);
  return EventLogEncryption.of({
    encrypt: Effect.fnUntraced(function* (identity, entries) {
      const data = yield* Effect.orDie(Entry.encodeArray(entries));
      const key = (yield* getIdentityRootSecretMaterial(identity)).encryptionKey;
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedEntries = yield* Effect.promise(() => Promise.all(data.map(entry => crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: toBufferSource(iv),
        tagLength: 128
      }, key, toBufferSource(entry)))));
      return {
        iv,
        encryptedEntries: encryptedEntries.map(entry => new Uint8Array(entry))
      };
    }),
    decrypt: Effect.fnUntraced(function* (identity, entries) {
      const key = (yield* getIdentityRootSecretMaterial(identity)).encryptionKey;
      const decryptedData = (yield* Effect.promise(() => Promise.all(entries.map(data => crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: toBufferSource(data.iv),
        tagLength: 128
      }, key, toBufferSource(data.encryptedEntry)))))).map(buffer => new Uint8Array(buffer));
      const decoded = yield* Effect.orDie(Entry.decodeArray(decryptedData));
      return decoded.map((entry, index) => new RemoteEntry({
        remoteSequence: entries[index].sequence,
        entry
      }));
    }),
    sha256: data => Effect.promise(() => crypto.subtle.digest("SHA-256", toArrayBuffer(data))).pipe(Effect.map(hash => new Uint8Array(hash))),
    sha256String: data => Effect.map(Effect.promise(() => crypto.subtle.digest("SHA-256", toArrayBuffer(data))), hash => {
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(bytes => bytes.toString(16).padStart(2, "0")).join("");
      return hashHex;
    }),
    generateIdentity: Effect.sync(() => ({
      publicKey: crypto.randomUUID(),
      privateKey: Redacted.make(crypto.getRandomValues(new Uint8Array(32)))
    }))
  });
});
/**
 * @since 4.0.0
 * @category encryption
 */
export const layerSubtle = /*#__PURE__*/Layer.effect(EventLogEncryption, /*#__PURE__*/makeEncryptionSubtle(globalThis.crypto));
//# sourceMappingURL=EventLogEncryption.js.map