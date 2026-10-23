// Local display preference only; never prune against a temporarily unloaded tree.
export const outlineFoldKey = (scope, novelId) => `cuigengji:ui:outline-folds:v1:${JSON.stringify([scope, novelId])}`;
export function normalizeOutlineFolds(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && id.length > 0))] : [];
}
export function createOutlineFoldPreference(storage, scope, novelId) {
  const key = outlineFoldKey(scope, novelId);
  let value = [];
  try { value = normalizeOutlineFolds(JSON.parse(storage.getItem(key))); } catch {}
  return {
    get value() { return value; },
    update(next) {
      value = normalizeOutlineFolds(typeof next === 'function' ? next(value) : next);
      // Storage may be disabled in an embedded host. Keep the current UI usable.
      try { storage.setItem(key, JSON.stringify(value)); } catch {}
      return value;
    },
  };
}

// A stale/deleted or leaf ref must not make the visible “expand all” action lie.
export function outlineFoldControls(folded, placements, objects) {
  const targets = [...new Set(Object.values(placements).map(item => item.parent))].filter(ref => Object.hasOwn(objects, ref));
  return {targets, hasFolded: targets.some(ref => folded.includes(ref))};
}
