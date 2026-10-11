import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';

const Context = createContext({revision: 0, refresh: () => {}});

/** Refresh read models in place. Drafts, selections and cameras keep their owners. */
export function RefreshProvider({children}: {children: React.ReactNode}) {
  const [revision, setRevision] = useState(0);
  useEffect(()=>{const refresh=()=>setRevision(value=>value+1);window.addEventListener('cuigengji:remote-update',refresh);return()=>window.removeEventListener('cuigengji:remote-update',refresh);},[]);
  const value = useMemo(() => ({revision, refresh: () => setRevision(value => value + 1)}), [revision]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useWorkbenchRefresh = () => useContext(Context);
