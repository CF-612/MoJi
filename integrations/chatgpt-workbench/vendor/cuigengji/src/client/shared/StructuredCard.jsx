import {MaterialHistory} from './MaterialHistory.jsx';
import {MaterialStoryLinks} from './MaterialStoryLinks.jsx';
import {AppearancePlan} from './AppearancePlan.jsx';
import {MaterialTabs,MaterialPanel} from './MaterialSections.jsx';
import {profileHistoryStyles} from './profile-history-style.ts';
import {Icon} from './icons.tsx';
import {MarkdownText,MarkdownField} from './MarkdownText.jsx';
import {CardRelations} from './CardRelations.jsx';
import {useWritingRequest} from './writing-request.js';
import {WritingHistory} from './WritingHistory.jsx';
import {useModules} from '../modules/context.tsx';
import React,{useEffect,useState} from 'react';
import {useDraft,useResource} from './state.js';
import {ResourceState,SaveBar,saveShortcut} from './ui.jsx';
import {Modal} from './preferences.tsx';
import {useDialog} from '../dialog.tsx';
const types={short:'短文本',long:'长文本',number:'数字',tags:'标签',reference:'资料引用'};
const serialize=p=>({...p,aliasesText:p.aliases.join(', '),tagTexts:Object.fromEntries(p.fields.filter(f=>f.type==='tags').map(f=>[f.id,(p.values[f.id]||[]).join(', ')]))});
export function StructuredCard({section,prefix,relatedContent,onMemory,onRelation,onDirty,onRelationsDirty,call,novelId,nodeId,tick,busy,run,onChapter,onEvent}){
 const [poll,setPoll]=useState(0),[manage,setManage]=useState(false);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},5000);return()=>clearInterval(timer);},[]);
 const resource=useResource(()=>Promise.all([call('writing.card.get',{novelId,nodeId}),call('graph.list',{novelId}),call('writing.cardRelations.get',{novelId,nodeId})]),[call,novelId,nodeId,tick,poll],`${novelId}:card-profile:${nodeId}`);
 return <section className="section-fold profile-records" hidden={!isProfileSection(section)}><style>{profileHistoryStyles}</style><ResourceState resource={resource}>{resource.value&&<CardFields key={nodeId} {...{call,novelId,nodeId,busy,run,onChapter,onEvent,section,prefix,relatedContent,onMemory,onRelation,onDirty,onRelationsDirty}} profile={resource.value[0]} nodes={resource.value[1]} relations={resource.value[2]} refresh={()=>setPoll(n=>n+1)} manage={()=>setManage(true)}/>}</ResourceState>{manage&&resource.value&&<FieldManager {...{call,novelId,busy,run}} profile={resource.value[0]} close={()=>{setManage(false);setPoll(n=>n+1);}}/>}</section>;
}
const isProfileSection=section=>['fields','relations','history'].includes(section);
function CardFields({section,prefix,relatedContent,onMemory,onRelation,onDirty,onRelationsDirty,call,novelId,nodeId,busy,run,onChapter,onEvent,profile,nodes,relations,refresh,manage}){
 const modules=useModules(),[fieldGroup,setFieldGroup]=useState('basic');
 const write=useWritingRequest(call);
 const {value,base,change,accept,dirty,cacheError}=useDraft(`${novelId}:structured-card:${nodeId}`,serialize(profile)),[editing,setEditing]=useState(dirty),[serverError,setServerError]=useState('');
 useEffect(()=>{onDirty?.(dirty);},[dirty,onDirty]);
 useEffect(()=>{if(!dirty&&(profile.revision!==base.revision||profile.nodeRevision!==base.nodeRevision))accept(serialize(profile));},[profile,dirty]);
 const fields=profile.fields.filter(f=>!f.archived&&(f.id!=='character:organization'||profile.values[f.id])).map(f=>f.id==='character:organization'?{...f,label:'原所属组织文字（保留）'}:f),noRegion=profile.kind==='world'&&['区域','组织'].includes(String(value.values['world:category']||'').trim()),set=(id,v)=>change(old=>({...old,values:{...old.values,[id]:v}}));
 const show=v=>Array.isArray(v)?v.map(id=>nodes.find(n=>n.id===id)?.name||id).join('、'):String(v??'');
 const save=()=>run(async()=>{setServerError('');try{await write('writing.card.update',{novelId,nodeId,expectedRevision:base.revision,expectedNodeRevision:base.nodeRevision,values:value.values,aliases:value.aliasesText.split(/[,，\n]/).map(s=>s.trim()).filter(Boolean),reason:'作者保存资料可选字段'});accept(serialize(await call('writing.card.get',{novelId,nodeId})));setEditing(false);refresh();}catch(e){setServerError(e.message);throw e;}});
 const fieldPrefix=prefix+'-fields';
 const filled=f=>value.values[f.id]!==undefined&&value.values[f.id]!==null&&value.values[f.id]!==''&&(!Array.isArray(value.values[f.id])||value.values[f.id].length>0),aliases=value.aliasesText.split(/[,，\n]/).map(s=>s.trim()).filter(Boolean);
 return <><MaterialPanel id="fields" active={section} prefix={prefix}><div className="profile-fields-panel" onKeyDown={e=>{saveShortcut(e,()=>{if(editing&&!busy&&dirty)save();});}}><header className="profile-block-heading"><h3><Icon name="book"/>资料字段</h3><div className="profile-actions"><button className="profile-action primary-soft" aria-pressed={editing} onClick={()=>setEditing(!editing)}><Icon name={editing?'list':'edit'}/>{editing?'查看字段':'编辑字段'}</button><button className="profile-action" onClick={manage}><Icon name="settings"/>管理模板</button><button className="profile-action" aria-label="检查最新资料字段" title="检查最新资料字段" disabled={busy} onClick={refresh}><Icon name="refresh"/></button></div></header><p className="profile-caption">{editing?'按需要补充人物与世界的细节，未填写的项目可以留空。':'按需记录与整理设定，字段模板可自行调整。'}</p>
 <MaterialTabs compact prefix={fieldPrefix} label="设定字段分类" active={fieldGroup} onChange={setFieldGroup} tabs={[{id:'basic',label:'基础信息'},{id:'details',label:'详细设定'},{id:'archive',label:'字段历史'}]}/>
 {(profile.revision!==base.revision||profile.nodeRevision!==base.nodeRevision)&&dirty&&<p className="notice">资料已有新版本，本地草稿保留，保存将检查冲突。</p>}
 {['basic','details'].map(group=>{const groupFields=fields.filter(f=>group==='details'?f.type==='long':f.type!=='long');return <MaterialPanel key={group} id={group} active={fieldGroup} prefix={fieldPrefix}>{editing?<fieldset disabled={busy} className="structure-fields" aria-label="编辑资料字段">{group==='basic'&&<label>别名<input aria-label="资料别名" value={value.aliasesText} placeholder="多个别名用逗号分隔" onChange={e=>change(old=>({...old,aliasesText:e.target.value}))}/></label>}{groupFields.map(f=><div key={f.id} className={f.type==='long'?'profile-field-long':'profile-field-short'}>{f.type==='long'?<details className="profile-field-fold"><summary>{f.label}<small>{value.values[f.id]?'已填写':'未填写'}</small></summary><MarkdownField label={f.label} disabled={f.id==='world:region'&&noRegion} value={value.values[f.id]||''} onChange={e=>set(f.id,e.target.value)}/></details>:<label>{f.label}{f.type==='reference'?<select aria-label={f.label} disabled={f.id==='world:region'&&noRegion} multiple value={value.values[f.id]||[]} onChange={e=>set(f.id,[...e.target.selectedOptions].map(o=>o.value))}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name}</option>)}</select>:<input aria-label={f.label} disabled={f.id==='world:region'&&noRegion} type={f.type==='number'?'number':'text'} value={f.type==='tags'?value.tagTexts[f.id]||'':value.values[f.id]??''} onChange={e=>{if(f.type==='tags')change(old=>({...old,tagTexts:{...old.tagTexts,[f.id]:e.target.value},values:{...old.values,[f.id]:e.target.value.split(/[,，]/).map(s=>s.trim()).filter(Boolean)}}));else set(f.id,e.target.value===''?null:f.type==='number'?Number(e.target.value):e.target.value);}}/>}</label>}</div>)}</fieldset>:<dl className="structured-values">{group==='basic'&&aliases.length>0&&<><dt>别名</dt><dd>{aliases.join('、')}</dd></>}{groupFields.filter(filled).map(f=><React.Fragment key={f.id}><dt>{f.label}</dt><dd>{f.type==='long'?<details className="profile-field-fold"><summary>查看内容</summary><MarkdownText text={show(value.values[f.id])}/></details>:show(value.values[f.id])}</dd></React.Fragment>)}</dl>}
 {!editing&&!(group==='basic'&&aliases.length)&&!groupFields.some(filled)&&<p className="profile-empty">{group==='basic'?'还没有基础信息':'还没有详细设定'}，点击“编辑字段”补充。</p>}</MaterialPanel>;})}
 {(editing||dirty)&&<SaveBar {...{dirty,busy}} error={serverError||cacheError} onSave={save} label="保存资料字段"/>}
 <MaterialPanel id="archive" active={fieldGroup} prefix={fieldPrefix}> {Object.keys(profile.values).some(id=>!fields.some(f=>f.id===id))&&<details><summary>已归档或其他类型的字段值</summary><dl className="structured-values">{Object.entries(profile.values).filter(([id])=>!fields.some(f=>f.id===id)).map(([id,v])=><React.Fragment key={id}><dt>{profile.fields.find(f=>f.id===id)?.label||id}</dt><dd>{show(v)}</dd></React.Fragment>)}</dl></details>}
 {profile.revision>0&&<WritingHistory current={{values:value.values,aliases:value.aliasesText.split(/[,，\n]/).map(s=>s.trim()).filter(Boolean)}} {...{call,novelId,busy,run,dirty}} labels={Object.fromEntries(profile.fields.map(f=>[f.id,f.label]))} nodes={nodes} collection="cards" id={nodeId} revision={base.revision} nodeRevision={base.nodeRevision} restored={refresh}/>}
 {!profile.revision&&!Object.keys(profile.values).some(id=>!fields.some(f=>f.id===id))&&<p className="profile-empty">保存资料字段后，可在这里查看修改历史与归档字段。</p>}</MaterialPanel></div></MaterialPanel>
 <MaterialPanel id="relations" active={section} prefix={prefix}>
 {profile.kind==='character'&&<CardRelations {...{call,novelId,nodeId,busy,run,refresh,onEvent,onRelation}} onDirty={onRelationsDirty} onMemory={onMemory} data={{...relations,nodes:relations.nodes.map(n=>({...n,avatarImage:nodes.find(p=>p.id===n.id)?.avatarImage||n.avatarImage}))}}/>}
 {relatedContent}</MaterialPanel>
 <MaterialPanel id="history" active={section} prefix={prefix}><MaterialHistory {...{call,novelId,nodeId,dirty,refresh}}/>
 <MaterialStoryLinks {...{call,novelId,nodeId}} tick={profile.revision} onStoryCard={onEvent}/>
 {profile.kind==='character'&&<AppearancePlan {...{call,novelId,nodeId,onChapter,refresh}}/>}<section className="profile-chapters"><header className="profile-block-heading"><h4><Icon name="book"/>章节记录 <span className="profile-count">{profile.links.length}</span></h4></header><p>正文确认出场：{profile.firstAppearance?<button onClick={()=>onChapter?.(profile.firstAppearance.chapterId)}>{profile.firstAppearance.chapterTitle}</button>:'尚未确认'}　正文确认提及：{profile.firstMention?<button onClick={()=>onChapter?.(profile.firstMention.chapterId)}>{profile.firstMention.chapterTitle}</button>:'尚未确认'}</p>
 {profile.links.map(l=><div className="structure-entry" key={l.id}><button onClick={()=>onChapter?.(l.chapterId,l.selection||{chapterId:l.chapterId,revision:l.chapterRevision,evidence:l.evidence})}>{l.chapterTitle}</button> · {{appearance:'实际出场',mention:'仅被提及',reference:'资料关联'}[l.kind]}<small> · 版本 {l.chapterRevision}{l.excluded?' · 已移出当前汇总':l.review?' · 正文已改写，需复核':''}</small><blockquote>{l.evidence}</blockquote><button disabled={busy} onClick={()=>run(async()=>{await call('writing.link.delete',{novelId,id:l.id,expectedRevision:l.revision,reason:'作者移除资料关联'});refresh();})}>移除关联</button></div>)}
 {!profile.links.length&&<p className="profile-empty">尚未记录章节关联。出场、提及与正文依据会归档在这里。</p>}</section>
 {modules.foreshadow&&profile.foreshadows.length>0&&<><h4>关联伏笔</h4>{profile.foreshadows.map(f=><p key={f.id}>{f.title} · {{planned:'计划',planted:'已埋设',developing:'推进中',recovered:'已回收',abandoned:'已放弃'}[f.status]}</p>)}</>}
 </MaterialPanel></>;
}
function FieldManager({call,novelId,busy,run,profile,close}){
 const write=useWritingRequest(call);
 const {ask}=useDialog(),[label,setLabel]=useState(''),[type,setType]=useState('short'),[poll,setPoll]=useState(0);
 const resource=useResource(()=>call('writing.fields.list',{novelId}),[call,novelId,poll]);
 const update=(f,patch)=>run(async()=>{await write('writing.field.update',{novelId,id:f.id,kind:profile.kind,expectedRevision:f.revision,...patch,reason:'作者调整字段模板'});setPoll(n=>n+1);});
 return <Modal title="字段模板" close={close}><p>应用于本作品所有{profile.kind==='character'?'角色卡':'世界书'}。字段标签可修改，值按稳定 ID 保存；移除字段会归档，已有值不会删除。</p><ResourceState resource={resource}>{resource.value?.[profile.kind].map(f=><div key={f.id} className="field-definition"><strong>{f.label}{f.archived?'（已归档）':''}</strong><small>{types[f.type]}</small><button disabled={busy} onClick={async()=>{const label=await ask('字段名称',f.label);if(label?.trim())update(f,{label});}}>改名</button><button disabled={busy} onClick={()=>update(f,{archived:!f.archived})}>{f.archived?'恢复':'归档'}</button></div>)}</ResourceState><div className="structure-form"><h3>自定义字段</h3><label>字段名称<input aria-label="自定义字段名称" value={label} onChange={e=>setLabel(e.target.value)}/></label><label>字段类型<select value={type} onChange={e=>setType(e.target.value)}>{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button disabled={busy||!label.trim()} onClick={()=>run(async()=>{await write('writing.field.create',{novelId,kind:profile.kind,label,type,reason:'作者新建字段'});setLabel('');setPoll(n=>n+1);})}>添加字段</button></div></Modal>;
}
