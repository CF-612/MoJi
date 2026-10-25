import React,{useState} from 'react';
import {useResource} from '../../shared/state.js';
import {ResourceState} from '../../shared/ui.jsx';
import {Modal} from '../../shared/preferences.tsx';
import {MarkdownText} from '../../shared/MarkdownText.jsx';
import {readLegacyPlanning} from './legacy-planning-reader.mjs';

/** Read-only access to retained upstream planning. Never silently converts,
 * overwrites or merges it with MoJi's independent unified story workspace. */
export function LegacyPlanningArchive({call,novelId,tick,onTransfer}){
 const [opened,setOpened]=useState(false),[page,setPage]=useState('all');
 const resource=useResource(()=>readLegacyPlanning(call,novelId),[call,novelId,tick]);
 const data=resource.value,exists=data&&(data.items.length||data.decorations.length||data.pages.length>1);
 if(!exists&&!resource.error)return null;
 const inPage=item=>page==='all'||(item.pageId??'main')===page;
 return <section className="notice" aria-label="导入的旧规划">
  {resource.error?<ResourceState resource={resource}/>:<><strong>导入的旧规划仍完整保留：{data.pages.length} 张画布 · {data.items.length} 个情节 · {data.decorations.length} 个框与便签</strong>
  <p>下方是墨叽的新剧情工作区，不会自动显示旧规划。可在只读档案查看原内容、连线和批注；没有自动转换或删除。</p>
  <button type="button" onClick={()=>setOpened(true)}>查看导入的旧规划</button>
  {onTransfer&&<button type="button" onClick={()=>onTransfer({mode:'export',selection:{kind:'works',novelIds:[novelId]}})}>导出包含旧规划的完整作品</button>}
  {opened&&<Modal title="导入的旧规划 · 只读档案" close={()=>setOpened(false)} className="chapter-materials-modal">
   <p>保留原画布分组、位置、正文引用、连线、框和便签。不在此重排或转换；需要编辑原画布时请保留并使用原应用。墨叽完整作品导出包含这份档案。</p>
   <label>原画布<select aria-label="旧规划画布" value={page} onChange={e=>setPage(e.target.value)}><option value="all">全部画布</option>{data.pages.map(p=><option key={p.id??'main'} value={p.id??'main'}>{p.name} · {p.nodeCount} 情节 · {p.decorationCount} 批注</option>)}</select></label>
   <h3>情节正文</h3>{data.items.filter(inPage).map(node=><LegacyNode key={node.id} {...{call,novelId,node}} page={data.pages.find(p=>p.id===(node.pageId??null))} group={data.groups.find(g=>g.id===node.groupId)}/>)}
   {!data.items.filter(inPage).length&&<p>这张原画布没有情节。</p>}
   <h3>原连线</h3><ul>{data.edges.filter(edge=>data.items.some(n=>n.id===edge.from&&inPage(n))).map(edge=><li key={edge.id}>{data.items.find(n=>n.id===edge.from)?.title||edge.from} → {data.items.find(n=>n.id===edge.to)?.title||edge.to} · {edge.type}{edge.label?' · '+edge.label:''}</li>)}</ul>
   <h3>框与便签</h3>{data.decorations.filter(inPage).map(item=><article key={item.id}><h4>{item.title||'便签'} · {item.kind==='frame'?'讨论框':'便签'}</h4><MarkdownText text={item.content}/><small>原位置 {item.position.x}, {item.position.y} · 尺寸 {item.width} × {item.height}</small></article>)}
   <h3>原分组</h3><ul>{data.groups.filter(inPage).map(group=><li key={group.id}>{group.name}{group.parentId?' · 上级：'+(data.groups.find(g=>g.id===group.parentId)?.name||group.parentId):''}</li>)}</ul>
  </Modal>}</>}
 </section>;
}
function LegacyNode({call,novelId,node,page,group}){
 const [opened,setOpened]=useState(false),resource=useResource(()=>opened?call('planning.get',{novelId,nodeId:node.id}):Promise.resolve(null),[call,novelId,node.id,opened]);
 return <details onToggle={e=>setOpened(e.currentTarget.open)}><summary>{node.title} · {page?.name||'主线规划'}{group?' · '+group.name:''}</summary><p>{node.summary}</p><small>原状态：{node.status}{node.position?` · 原位置 ${node.position.x}, ${node.position.y}`:''}</small><ResourceState resource={resource}>{resource.value&&<><MarkdownText text={resource.value.node.content}/><p>正文引用 {resource.value.node.chapterRefs.length} 项 · 资料引用 {resource.value.node.memoryRefs.length} 项</p></>}</ResourceState></details>;
}
