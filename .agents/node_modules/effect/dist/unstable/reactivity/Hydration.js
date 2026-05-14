/**
 * @since 4.0.0
 */
import * as AsyncResult from "./AsyncResult.js";
import * as Atom from "./Atom.js";
/**
 * @since 4.0.0
 * @category dehydration
 */
export const dehydrate = (registry, options) => {
  const encodeInitialResultMode = options?.encodeInitialAs ?? "ignore";
  const arr = [];
  const now = Date.now();
  registry.getNodes().forEach((node, key) => {
    if (!Atom.isSerializable(node.atom)) return;
    const atom = node.atom;
    const value = node.value();
    const isInitial = AsyncResult.isAsyncResult(value) && AsyncResult.isInitial(value);
    if (encodeInitialResultMode === "ignore" && isInitial) return;
    const encodedValue = atom[Atom.SerializableTypeId].encode(value);
    // Create a promise that resolves when the atom moves out of Initial state
    let resultPromise;
    if (encodeInitialResultMode === "promise" && isInitial) {
      resultPromise = new Promise(resolve => {
        const unsubscribe = registry.subscribe(atom, newValue => {
          if (AsyncResult.isAsyncResult(newValue) && !AsyncResult.isInitial(newValue)) {
            resolve(atom[Atom.SerializableTypeId].encode(newValue));
            unsubscribe();
          }
        });
      });
    }
    arr.push({
      "~effect/reactivity/DehydratedAtom": true,
      key: key,
      value: encodedValue,
      dehydratedAt: now,
      resultPromise
    });
  });
  return arr;
};
/**
 * @since 4.0.0
 * @category dehydration
 */
export const toValues = state => state;
/**
 * @since 4.0.0
 * @category hydration
 */
export const hydrate = (registry, dehydratedState) => {
  for (const datom of dehydratedState) {
    registry.setSerializable(datom.key, datom.value);
    // If there's a resultPromise, it means this was in Initial state when dehydrated
    // and we should wait for it to resolve to a non-Initial state, then update the registry
    if (!datom.resultPromise) continue;
    datom.resultPromise.then(resolvedValue => {
      // Try to update the existing node directly instead of using setSerializable
      const nodes = registry.getNodes();
      const node = nodes.get(datom.key);
      if (node) {
        // Decode the resolved value using the node's atom serializable decoder
        const atom = node.atom;
        if (atom[Atom.SerializableTypeId]) {
          const decoded = atom[Atom.SerializableTypeId].decode(resolvedValue);
          node.setValue(decoded);
        }
      } else {
        // Fallback to setSerializable if node doesn't exist yet
        registry.setSerializable(datom.key, resolvedValue);
      }
    });
  }
};
//# sourceMappingURL=Hydration.js.map