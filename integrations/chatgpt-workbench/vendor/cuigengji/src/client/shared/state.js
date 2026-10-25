import { draftKey, restoreDraft, persistDraft, rebaseDraft } from './drafts.js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {useWorkbenchRefresh} from './refresh.tsx';
import {resourceCache,resourceKey} from './resource-cache.js';
const memoryDrafts = new Map();
function initialDraft(key, entityKey, initial) {
  if (memoryDrafts.has(key)) return memoryDrafts.get(key);
  if (typeof localStorage === 'undefined') return {base:initial,value:initial};
  // One-time recovery of the previous chapter-only draft format.
  const match = /^([^:]+):chapter:(.+)$/.exec(entityKey);
  try {
    if (match && localStorage.getItem(key) === null && !localStorage.getItem(`${key}:migrated`)) {
      const old = JSON.parse(localStorage.getItem(`cuigengji:draft:${match[1]}:${match[2]}`));
      if (old?.base && typeof old.content === 'string') {
        persistDraft(localStorage,key,{base:old.base,value:{...old.base,content:old.content,title:old.title??old.base.title,volumeId:old.volumeId??old.base.volumeId}});
      }
      localStorage.setItem(`${key}:migrated`,'true');
    }
  } catch {}
  return restoreDraft(localStorage,key,initial);
}
export const SessionScope = createContext('local');
// Tour previews use real pages, but never replace the author's saved view/selection.
export const TransientViewContext = createContext(false);
export const TourTransitionContext = createContext({current:false});
export function readLocal(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; }
}
export function usePreference(name, fallback) {
  const transient=useContext(TransientViewContext);
  const scope = useContext(SessionScope);
  const key = `cuigengji:ui:${scope}:${name}`;
  const [value, setValue] = useState(() => transient?fallback:readLocal(key, fallback));
  const update = next => setValue(previous => {
    const value = typeof next === 'function' ? next(previous) : next;
    if(!transient)try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    return value;
  });
  return [value, update];
}
// Components using this hook mount only after the server value is available.
// The server revision is retained in the draft; restoration never adopts a newer CAS base.
export function useDraft(entityKey, initial) {
  const scope = useContext(SessionScope);
  const key = draftKey(scope, entityKey);
  const [state, setState] = useState(() => initialDraft(key,entityKey,initial));
  const [cacheError, setCacheError] = useState('');
  const current = useRef(state); current.current = state;
  const dirty = JSON.stringify(state.value) !== JSON.stringify(state.base);
  const persist = next => {
    if (JSON.stringify(next.value) === JSON.stringify(next.base)) memoryDrafts.delete(key);
    else memoryDrafts.set(key, next);
    try {
      persistDraft(localStorage, key, next);
      setCacheError('');
    } catch { setCacheError('本地草稿缓存失败，请先保存再离开。'); }
  };
  const change = next => {
    const value = typeof next === 'function' ? next(current.current.value) : next;
    const updated = { ...current.current, value };
    current.current = updated; setState(updated); persist(updated);
  };
  const accept = value => { const next = { base: value, value }; current.current = next; setState(next); persist(next); };
  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const rebase = server => { const next = rebaseDraft(current.current, server); current.current = next; setState(next); persist(next); };
  return { value: state.value, base: state.base, change, accept, rebase, dirty, cacheError };
}
export function useResource(loader, deps, cacheName=null) {
  const scope=useContext(SessionScope),key=resourceKey(scope,cacheName);
  const refreshRevision = useWorkbenchRefresh().revision;
  const [state, setState] = useState(()=>({key,value:resourceCache.get(key)?.value??null,error:'',loading:true}));
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    const epoch=resourceCache.epoch();
    setState(s => ({key,value:s.key===key?s.value:resourceCache.get(key)?.value??null,loading:true,error:''}));
    Promise.resolve().then(loader).then(value => {resourceCache.put(key,value,epoch);if(live)setState({key,value,loading:false,error:''});}, error => {
      if(!live)return;
      if(['FORBIDDEN','UNAUTHORIZED'].includes(error.code)){resourceCache.remove(key);setState({key,value:null,loading:false,error:error.message});}
      else setState(s=>({...s,loading:false,error:error.message||String(error)}));
    });
    return () => { live = false; };
  }, [...deps, key, retry, refreshRevision]);
  const current=state.key===key?state:{key,value:resourceCache.get(key)?.value??null,loading:true,error:''};
  return { ...current, refreshing:current.loading&&current.value!==null, retry: () => setRetry(n => n + 1) };
}

export function useScrollPosition(name) {
  const tourTransition=useContext(TourTransitionContext);
  const transient=useContext(TransientViewContext);
  const scope = useContext(SessionScope);
  const ref = useRef(null);
  const key = `cuigengji:scroll:${scope}:${name}`;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.scrollTop = readLocal(key, 0);
    let timer;
    const save = () => { if(transient||tourTransition.current)return;try { localStorage.setItem(key, JSON.stringify(element.scrollTop)); } catch {} };
    const scroll = () => { clearTimeout(timer); timer = setTimeout(save, 150); };
    element.addEventListener('scroll', scroll);
    return () => { clearTimeout(timer); save(); element.removeEventListener('scroll', scroll); };
  }, [key,transient]);
  return ref;
}
