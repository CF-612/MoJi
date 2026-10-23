export const draftKey = (scope, entity) => `cuigengji:draft:v2:${scope}:${entity}`;
export const changed = state => JSON.stringify(state.value) !== JSON.stringify(state.base);
export function restoreDraft(storage, key, initial) {
  try {
    const cached = JSON.parse(storage.getItem(key));
    if (cached && cached.base && cached.value && typeof cached.base === 'object' && typeof cached.value === 'object'
        && Number.isSafeInteger(cached.base.revision ?? 0)) return cached;
  } catch {}
  return { base: initial, value: initial };
}
export function persistDraft(storage, key, state) {
  if (changed(state)) storage.setItem(key, JSON.stringify(state));
  else storage.removeItem(key);
}
export function rebaseDraft(state, server) {
  return { base: server, value: { ...server, ...state.value, revision: server.revision, contentHash: server.contentHash } };
}

/** Access localStorage lazily: embedded hosts may throw on the property itself. */
export const browserDraftStorage = {
  getItem: key => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: key => globalThis.localStorage.removeItem(key),
  key: index => globalThis.localStorage.key(index),
  get length() { return globalThis.localStorage.length; },
};
export function probeDraftStorage(storage) {
  const key = `cuigengji:draft-probe:${globalThis.crypto.randomUUID()}`;
  try { storage.setItem(key, '1'); const ok = storage.getItem(key) === '1'; storage.removeItem(key); return ok; }
  catch { return false; }
}
