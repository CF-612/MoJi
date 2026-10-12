import {WritingHistory} from './WritingHistory.jsx';
import React,{useEffect,useState} from 'react';
import {useDraft,useResource} from './state.js';
import {ResourceState,SaveBar} from './ui.jsx';
import {Modal} from './preferences.tsx';
import {useDialog} from '../dialog.tsx';
import {DocumentTextarea} from './workspace.tsx';
const types={short:'短文本',long:'长文本',number:'数字',tags:'标签',reference:'资料引用'};
const serialize=p=>({...p,aliasesText:p.aliases.join(', '),tagTexts:Object.fromEntries(p.fields.filter(f=>f.type==='tags').map(f=>[f.id,(p.values[f.id]||[]).join(', ')]))});
export function StructuredCard({call,novelId,nodeId,tick,busy,run,onChapter}){
 const [poll,setPoll]=useState(0),[manage,setManage]=useState(false);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},5000);return()=>clearInterval(timer);},[]);
 const resource=useResource(()=>Promise.all([call('writing.card.get',{novelId,nodeId}),call('graph.list',{novelId})]),[call,novelId,nodeId,tick,poll]);
 return <section className="section-fold"><h3>资料字段与章节关联</h3><ResourceState resource={resource}>{resource.value&&<CardFields key={nodeId} {...{call,novelId,nodeId,busy,run,onChapter}} profile={resource.value[0]} nodes={resource.value[1]} refresh={()=>setPoll(n=>n+1)} manage={()=>setManage(true)}/>}</ResourceState>{manage&&resource.value&&<FieldManager {...{call,novelId,busy,run}} profile={resource.value[0]} close={()=>{setManage(false);setPoll(n=>n+1);}}/>}</section>;
}
function CardFields({call,novelId,nodeId,busy,run,onChapter,profile,nodes,refresh,manage}){
 const {value,base,change,accept,dirty,cacheError}=useDraft(`${novelId}:structured-card:${nodeId}`,serialize(profile)),[editing,setEditing]=useState(dirty),[serverError,setServerError]=useState('');
 useEffect(()=>{if(!dirty&&(profile.revision!==base.revision||profile.nodeRevision!==base.nodeRevision))accept(serialize(profile));},[profile,dirty]);
 const fields=profile.fields.filter(f=>!f.archived),set=(id,v)=>change(old=>({...old,values:{...old.values,[id]:v}}));
 const show=v=>Array.isArray(v)?v.map(id=>nodes.find(n=>n.id===id)?.name||id).join('、'):String(v??'');
 const save=()=>run(async()=>{setServerError('');try{await call('writing.card.update',{novelId,nodeId,expectedRevision:base.revision,expectedNodeRevision:base.nodeRevision,values:value.values,aliases:value.aliasesText.split(/[,，\n]/).map(s=>s.trim()).filter(Boolean),reason:'作者保存资料可选字段'});accept(serialize(await call('writing.card.get',{novelId,nodeId})));setEditing(false);refresh();}catch(e){setServerError(e.message);throw e;}});
 return <><div className="row"><button onClick={()=>setEditing(!editing)}>{editing?'查看字段':'编辑可选字段'}</button><button onClick={manage}>管理字段模板</button><button disabled={busy} onClick={refresh}>检查最新</button></div>
 {(profile.revision!==base.revision||profile.nodeRevision!==base.nodeRevision)&&dirty&&<p className="notice">资料已有新版本，本地草稿保留，保存将检查冲突。</p>}
 {editing?<fieldset disabled={busy} className="structure-fields"><label>别名<input aria-label="资料别名" value={value.aliasesText} placeholder="多个别名用逗号分隔" onChange={e=>change(old=>({...old,aliasesText:e.target.value}))}/></label>{fields.map(f=><label key={f.id}>{f.label}{f.type==='long'?<DocumentTextarea aria-label={f.label} value={value.values[f.id]||''} onChange={e=>set(f.id,e.target.value)}/>:f.type==='reference'?<select aria-label={f.label} multiple value={value.values[f.id]||[]} onChange={e=>set(f.id,[...e.target.selectedOptions].map(o=>o.value))}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}</select>:<input aria-label={f.label} type={f.type==='number'?'number':'text'} value={f.type==='tags'?value.tagTexts[f.id]||'':value.values[f.id]??''} onChange={e=>{if(f.type==='tags')change(old=>({...old,tagTexts:{...old.tagTexts,[f.id]:e.target.value},values:{...old.values,[f.id]:e.target.value.split(/[,，]/).map(s=>s.trim()).filter(Boolean)}}));else set(f.id,e.target.value===''?null:f.type==='number'?Number(e.target.value):e.target.value);}}/>}</label>)}</fieldset>:<dl className="structured-values">{profile.aliases.length>0&&<><dt>别名</dt><dd>{profile.aliases.join('、')}</dd></>}{fields.filter(f=>profile.values[f.id]!==undefined&&profile.values[f.id]!==null&&profile.values[f.id]!=='').map(f=><React.Fragment key={f.id}><dt>{f.label}</dt><dd>{show(profile.values[f.id])}</dd></React.Fragment>)}</dl>}
 {(editing||dirty)&&<SaveBar {...{dirty,busy}} error={serverError||cacheError} onSave={save} label="保存资料字段"/>}
 {Object.keys(profile.values).some(id=>!fields.some(f=>f.id===id))&&<details><summary>已归档或其他类型的字段值</summary><dl className="structured-values">{Object.entries(profile.values).filter(([id])=>!fields.some(f=>f.id===id)).map(([id,v])=><React.Fragment key={id}><dt>{profile.fields.find(f=>f.id===id)?.label||id}</dt><dd>{show(v)}</dd></React.Fragment>)}</dl></details>}
 {profile.revision>0&&<WritingHistory {...{call,novelId,busy,run,dirty}} labels={Object.fromEntries(profile.fields.map(f=>[f.id,f.label]))} nodes={nodes} collection="cards" id={nodeId} revision={base.revision} nodeRevision={base.nodeRevision} restored={refresh}/>}
 <h4>章节记录</h4><p>首次实际出场：{profile.firstAppearance?<button onClick={()=>onChapter?.(profile.firstAppearance.chapterId)}>{profile.firstAppearance.chapterTitle}</button>:'尚未确认'}　首次提及：{profile.firstMention?<button onClick={()=>onChapter?.(profile.firstMention.chapterId)}>{profile.firstMention.chapterTitle}</button>:'尚未确认'}</p>
 {profile.links.map(l=><div className="structure-entry" key={l.id}><button onClick={()=>onChapter?.(l.chapterId)}>{l.chapterTitle}</button> · {{appearance:'实际出场',mention:'仅被提及',reference:'资料关联'}[l.kind]}<small> · 版本 {l.chapterRevision}{l.excluded?' · 已移出当前汇总':l.review?' · 正文已改写，需复核':''}</small><blockquote>{l.evidence}</blockquote></div>)}
 {profile.foreshadows.length>0&&<><h4>关联伏笔</h4>{profile.foreshadows.map(f=><p key={f.id}>{f.title} · {{planned:'计划',planted:'已埋设',developing:'推进中',recovered:'已回收',abandoned:'已放弃'}[f.status]}</p>)}</>}
 </>;
}
function FieldManager({call,novelId,busy,run,profile,close}){
 const {ask}=useDialog(),[label,setLabel]=useState(''),[type,setType]=useState('short'),[poll,setPoll]=useState(0);
 const resource=useResource(()=>call('writing.fields.list',{novelId}),[call,novelId,poll]);
 const update=(f,patch)=>run(async()=>{await call('writing.field.update',{novelId,id:f.id,kind:profile.kind,expectedRevision:f.revision,...patch,reason:'作者调整字段模板'});setPoll(n=>n+1);});
 return <Modal title="字段模板" close={close}><p>应用于本作品所有{profile.kind==='character'?'角色卡':'世界书'}。字段标签可修改，值按稳定 ID 保存；移除字段会归档，已有值不会删除。</p><ResourceState resource={resource}>{resource.value?.[profile.kind].map(f=><div key={f.id} className="field-definition"><strong>{f.label}{f.archived?'（已归档）':''}</strong><small>{types[f.type]}</small><button disabled={busy} onClick={async()=>{const label=await ask('字段名称',f.label);if(label?.trim())update(f,{label});}}>改名</button><button disabled={busy} onClick={()=>update(f,{archived:!f.archived})}>{f.archived?'恢复':'归档'}</button></div>)}</ResourceState><div className="structure-form"><h3>自定义字段</h3><label>字段名称<input aria-label="自定义字段名称" value={label} onChange={e=>setLabel(e.target.value)}/></label><label>字段类型<select value={type} onChange={e=>setType(e.target.value)}>{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button disabled={busy||!label.trim()} onClick={()=>run(async()=>{await call('writing.field.create',{novelId,kind:profile.kind,label,type,reason:'作者新建字段'});setLabel('');setPoll(n=>n+1);})}>添加字段</button></div></Modal>;
}
