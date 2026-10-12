import React,{useState} from 'react';
import {Modal} from './preferences.tsx';
import {CardColorFields} from './card-appearance.tsx';
import {cardLabels} from './card-colors.js';
import {useResource} from './state.js';
import {ResourceState} from './ui.jsx';
import {GroupSelect} from './groups.tsx';

export function CardQuickSettings({kind,id,call,novelId,groups,run,busy,close,updated,openDetail}) {
  const resource=useResource(async()=>{const value=await call(kind==='planning'?'planning.get':'graph.get',{novelId,nodeId:id});return kind==='planning'?value.node:value;},[call,novelId,id,kind]);
  return <Modal title="卡片快捷设置" close={close} className="card-quick-modal"><ResourceState resource={resource}>{resource.value&&<QuickForm key={id} {...{kind,call,novelId,groups,run,busy,close,updated,openDetail}} initial={resource.value}/>}</ResourceState></Modal>;
}
function QuickForm({kind,call,novelId,groups,run,busy,close,updated,openDetail,initial}) {
  const planning=kind==='planning';
  const [value,setValue]=useState({status:initial.status,type:initial.type,groupId:initial.groupId||null});
  const [error,setError]=useState('');
  const [chapterId,setChapterId]=useState('');
  const needsEvidence=planning&&value.status==='written'&&!initial.chapterRefs?.length;
  const chapters=useResource(()=>needsEvidence?call('chapter.list',{novelId}):Promise.resolve([]),[call,novelId,needsEvidence]);
  const evidence=(chapters.value||[]).find(chapter=>chapter.id===chapterId);
  const dirty=value.groupId!==(initial.groupId||null)||(planning?value.status!==initial.status:value.type!==initial.type);
  const save=()=>run(async()=>{
    setError('');
    try {
      // Patch only quick properties; body, references and positions must remain untouched.
      if(planning)await call('planning.apply',{novelId,requestId:crypto.randomUUID(),reason:`快捷设置 ${initial.title}`,operations:[{op:'node.update',id:initial.id,expectedRevision:initial.revision,value:{status:value.status,groupId:value.groupId,...(needsEvidence&&evidence?{chapterRefs:[{chapterId:evidence.id,revision:evidence.revision}]}:{})}}]});
      else await call('graph.update',{novelId,nodeId:initial.id,expectedRevision:initial.revision,type:value.type,groupId:value.groupId,requestId:crypto.randomUUID(),reason:`快捷设置 ${initial.name}`});
      close();await updated();
    }catch(e){setError(`${e.message}。你的选择仍保留；若版本已变化，请关闭后重开以读取最新属性。`);throw e;}
  });
  return <><h3>{initial.title||initial.name}</h3><fieldset className="editor-fields" disabled={busy}>
    {planning?<label>讨论进展<select aria-label="快捷讨论进展" value={value.status} onChange={e=>setValue({...value,status:e.target.value})}>{['idea','selected','written','dropped'].map(key=><option key={key} value={key}>{cardLabels[key]}</option>)}</select></label>:<label>卡片类型<select aria-label="快捷卡片类型" value={value.type==='character_card'?'character_card':'world_entry'} onChange={e=>setValue({...value,type:e.target.value})}><option value="character_card">角色卡</option><option value="world_entry">世界书</option></select></label>}
    <GroupSelect groups={groups} value={value.groupId} onChange={groupId=>setValue({...value,groupId})}/>
    {needsEvidence&&<ResourceState resource={chapters}><label>已写入的章节<select aria-label="正文依据章节" value={chapterId} onChange={e=>setChapterId(e.target.value)}><option value="">请选择正文依据</option>{(chapters.value||[]).map(chapter=><option key={chapter.id} value={chapter.id}>{chapter.title} · 版本 {chapter.revision}</option>)}</select></label></ResourceState>}
  </fieldset><p className="muted">只修改这些属性，正文与连线保留。{needsEvidence?'请选择实际写入的章节，保存后关联该正文版本。':'现有引用保持不变。'}</p>
  {error&&<p className="notice error" role="alert">{error}</p>}<div className="row"><button className="primary" disabled={busy||!dirty||(needsEvidence&&!evidence)} onClick={save}>保存属性</button><button disabled={busy} onClick={()=>{close();openDetail();}}>打开完整详情</button></div>
  <details className="section-fold"><summary>显示颜色（本机）</summary><CardColorFields keys={planning?['idea','selected','written','dropped']:['character','world']}/></details></>;
}
