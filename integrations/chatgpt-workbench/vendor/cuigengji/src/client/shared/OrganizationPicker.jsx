import React,{useState} from 'react';
export function OrganizationPicker({options,ids,change,busy,onCreate}){
 const [query,setQuery]=useState('');
 const selected=new Set(ids),filtered=options.filter(o=>o.name.toLowerCase().includes(query.trim().toLowerCase())||selected.has(o.id));
 return <div className="organization-picker"><input aria-label="搜索组织" placeholder="搜索已有组织世界书" value={query} onChange={e=>setQuery(e.target.value)}/><div className="organization-options">{filtered.map(o=><label key={o.id}><input type="checkbox" disabled={busy} checked={selected.has(o.id)} onChange={e=>change(e.target.checked?[...ids,o.id]:ids.filter(id=>id!==o.id))}/><span>{o.name}{options.filter(x=>x.name===o.name).length>1&&<small> · {o.id.slice(0,6)}</small>}</span></label>)}</div>{!filtered.length&&<p className="muted">没有匹配的组织。</p>}<button type="button" disabled={busy} onClick={()=>onCreate(query.trim())}>＋ 新建组织世界书</button></div>;
}
