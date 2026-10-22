import {editRelation,validateRelationPoints} from './story-relation-edit.mjs';
// V3.1 新模型。目录仅提供源对象；创作包含、展示实例、时间位置各自独立。
import {trackPalette} from './story-presentation.mjs';
import {timelineItems,timelineBounds,projectTimeline} from './story-timeline.mjs';
export const ROOT='root';
export const refOf=(type,id)=>`${type}:${id}`;
export const clone=value=>structuredClone(value);
const fail=message=>{throw Object.assign(new Error(message),{code:'STORY_INVALID'});};
export function emptyWorkspace(){return {format:'moji-story-v1',revision:0,cards:{},placements:{},pages:[{id:'main',name:'自由构思',instances:{}}],precedence:[],tracks:[{id:'main',name:'主线',color:'#5182cc'}]};}
export function sourceIndex(sources){return Object.fromEntries([...sources.volumes.map(v=>[refOf('volume',v.id),{...v,kind:'volume'}]),...sources.chapters.map(c=>[refOf('chapter',c.id),{...c,kind:'chapter'}])]);}
export function objectIndex(state,sources){return {...sourceIndex(sources),...Object.fromEntries(Object.values(state.cards).map(c=>[refOf('card',c.id),{...c,kind:'card'}]))};}
export function reconcile(state,sources){
 const valid=objectIndex(state,sources),old=clone(state.placements);let changed=false;
 const defaultParent=(ref)=>valid[ref]?.kind==='chapter'&&valid[ref].volumeId&&valid[refOf('volume',valid[ref].volumeId)]?refOf('volume',valid[ref].volumeId):ROOT;
 for(const ref of Object.keys(state.placements))if(!valid[ref]){delete state.placements[ref];changed=true;}
 const rescue=(parent,seen=new Set())=>{if(parent===ROOT||valid[parent])return parent;if(seen.has(parent))return ROOT;seen.add(parent);return rescue(old[parent]?.parent||ROOT,seen);};
 for(const [ref,obj] of Object.entries(valid)){
  const p=state.placements[ref];
  if(!p){state.placements[ref]={parent:defaultParent(ref),order:Number.isFinite(obj.order)?obj.order:Object.keys(state.placements).length,manual:obj.kind==='card'};changed=true;}
  else if(p.parent!==ROOT&&!valid[p.parent]){p.parent=rescue(p.parent);p.manual=true;changed=true;}
  else if(!p.manual){if(p.parent!==defaultParent(ref)){p.parent=defaultParent(ref);changed=true;}if(Number.isFinite(obj.order)&&p.order!==obj.order){p.order=obj.order;changed=true;}}
 }
 // Repair only invalid source ancestry. Card content and valid manual arrangements stay intact.
 for(const ref of Object.keys(valid))if(treeError(state,valid,ref)){
  const p=state.placements[ref];p.parent=defaultParent(ref);p.manual=true;
  if(treeError(state,valid,ref))p.parent=ROOT;changed=true;
 }
 for(const p of Object.values(state.placements))if(p.attachment&&!valid[p.attachment.ref]){delete p.attachment;changed=true;}
 for(const page of state.pages)for(const ref of Object.keys(page.instances))if(!valid[ref]){delete page.instances[ref];changed=true;}
 state.precedence=state.precedence.filter(e=>{const ok=valid[e.from]&&valid[e.to];if(!ok)changed=true;return ok;});
 for(const card of Object.values(state.cards)){
  card.scope=(card.scope||[]).filter(id=>valid[refOf('chapter',id)]);
  if(card.time?.narration&&!['startChapterId','endChapterId'].every(k=>valid[refOf('chapter',card.time.narration[k])])){card.time.narration=null;changed=true;}
 }
 return changed;
}
export function assertTree(state,sources){
 const objects=objectIndex(state,sources);
 for(const ref of Object.keys(objects)){const error=treeError(state,objects,ref);if(error)fail(error);}
}
function treeError(state,objects,ref){
 let cursor=ref;const seen=new Set(),kind=objects[ref]?.kind;
 while(cursor!==ROOT){
  if(seen.has(cursor))return '不能循环包含；剧情卡也不能包住自己。';
  seen.add(cursor);if(!objects[cursor]||!state.placements[cursor])return '包含关系引用了不存在的对象。';
  if(cursor!==ref&&objects[cursor].kind!=='card'){
   if(kind==='volume')return '正文卷不能放在正文卷或正文章节里面，即使中间隔着剧情卡。';
   if(kind==='chapter'&&objects[cursor].kind==='chapter')return '正文章节不能包含另一正文章节，即使中间隔着剧情卡。';
  }
  cursor=state.placements[cursor].parent;
 }
 return '';
}
export function moveError(state,sources,refs,parent=ROOT){
 const next=clone(state),objects=objectIndex(next,sources);
 try{for(const ref of refs)move(next,ref,parent,objects);assertTree(next,sources);return '';}catch(e){return e.message;}
}
export function descendants(state,ref){const result=[];for(const [id,p] of Object.entries(state.placements))if(p.parent===ref)result.push(id,...descendants(state,id));return result;}
function move(state,ref,parent,objects){
 if(!objects[ref]||parent!==ROOT&&!objects[parent])fail('移动对象或目标已不存在。');
 if(ref===parent)fail('不能把对象放到自己里面。');
 const nextOrder=Math.max(0,...Object.values(state.placements).filter(p=>p.parent===parent).map(p=>p.order))+1;
 state.placements[ref]={parent,order:nextOrder,manual:true};
}
function cleanAttachments(state){
 for(const p of Object.values(state.placements)){
  const a=p.attachment,target=state.placements[a?.ref];if(!a)continue;
  if(!target||p.parent!==target.parent||(a.position==='before'?p.order>=target.order:p.order<=target.order))delete p.attachment;
 }
}
function cardValue(value={}){
 if(!String(value.title||'').trim())fail('请填写剧情卡标题。');
 if(!['idea','selected','written','dropped'].includes(value.status||'idea'))fail('规划状态无效。');
 return {title:String(value.title).trim(),purpose:value.purpose||'情节',summary:String(value.summary||''),content:String(value.content||''),status:value.status||'idea',cast:clone(value.cast||[]),scope:clone(value.scope||[]),time:clone(value.time||{}),storyDateText:String(value.storyDateText||'').slice(0,200),points:clone(value.points||[]),foreshadowRefs:clone(value.foreshadowRefs||[]),evidence:clone(value.evidence||[])};
}
function validateCard(card,sources,state){
 const chapters=new Set(sources.chapters.map(c=>c.id));
 if(card.scope.some(id=>!chapters.has(id)))fail('跨度引用了不存在的章节。');
 if(!Array.isArray(card.points))fail('剧情发生点必须是列表。');
 validateRelationPoints(card.points,sources.chapters);
 for(const mode of ['narration','story']){
  const time=card.time[mode];if(!time)continue;
  if(time.row!==undefined&&(!Number.isInteger(time.row)||time.row<0||time.row>10000))fail('时间线行位置无效。');
  if(!state.tracks.some(t=>t.id===time.trackId))fail('时间轨道不存在。');
  if(mode==='narration'){
   const order=sources.chapters.map(c=>c.id),a=order.indexOf(time.startChapterId),b=order.indexOf(time.endChapterId);
   if(a<0||b<0||!Number.isFinite(time.startOffset)||!Number.isFinite(time.endOffset)||time.startOffset<0||time.startOffset>=1||time.endOffset<=0||time.endOffset>1||b+time.endOffset<=a+time.startOffset)fail('叙述跨度的起止位置无效。');
  }else if(!Number.isFinite(time.start)||!Number.isFinite(time.end)||Math.abs(time.start)>1000000||Math.abs(time.end)>1000000||time.end<=time.start)fail('故事时间终点必须晚于起点。');
 }
 // 采用进度不等于已确认正文事实。事实只由后续证据确认接口写入。
}
export function applyStory(input,sources,operation,newId){
 const state=clone(input),objects=objectIndex(state,sources),op=operation;
 switch(op.type){
  case 'relation.save': case 'relation.delete': case 'relation.order':{
   editRelation(state,op,newId);for(const card of Object.values(state.cards))validateRelationPoints(card.points,sources.chapters);break;
  }
  case 'card.create':{
   const id=newId(),card={id,revision:1,...cardValue(op.value)};validateCard(card,sources,state);state.cards[id]=card;
   move(state,refOf('card',id),op.parent||ROOT,objectIndex(state,sources));
   if(op.pageId){const page=state.pages.find(p=>p.id===op.pageId);if(!page)fail('画布页面不存在。');page.instances[refOf('card',id)]={x:op.position?.x??60,y:op.position?.y??60,revision:1};}
   break;
  }
  case 'card.update':{
   const card=state.cards[op.id];if(!card)fail('剧情卡不存在。');if(card.revision!==op.expectedRevision)throw Object.assign(new Error('剧情卡已有更新，草稿保留，请重新读取后核对。'),{code:'CONFLICT'});
   const next={id:card.id,revision:card.revision+1,...cardValue({...card,...op.value})};validateCard(next,sources,state);
   if(op.placement){
    const {mode,row}=op.placement;if(!['narration','story'].includes(mode)||!Number.isInteger(row)||row<0||!next.time[mode])fail('请指定有效的轨道行位置。');
    const items=timelineItems(state.cards,sources.chapters,mode),candidate=timelineBounds(next,sources.chapters,mode),layout=projectTimeline(items,candidate,row);
    const affected=new Set([candidate.trackId,card.time?.[mode]?.trackId]);
    for(const track of state.tracks)if(affected.has(track.id)){
     const count=list=>Math.max(1,...list.filter(p=>p.trackId===track.id).map(p=>p.row+1));
     track.rowCounts={...track.rowCounts,[mode]:Math.max(track.rowCounts?.[mode]||1,count(items),count(layout))};
    }
    state.cards[card.id]=next;
    for(const item of layout)if(affected.has(item.trackId)){
     const value=state.cards[item.id],time=value.time[mode];
     if(time.row!==item.row){value.time[mode]={...time,row:item.row};if(value.id!==card.id)value.revision++;}
    }
   }else state.cards[card.id]=next;
   break;
  }
  case 'move':{
   const refs=[...new Set(op.refs||[])],parent=op.parent||ROOT;
   if(!refs.length)fail('请选择移动对象。');
   const anchor=op.before||op.after;
   if(anchor&&(!objects[anchor]||state.placements[anchor].parent!==parent||refs.includes(anchor)))fail('同级插入位置无效。');
   const roots=refs.filter(ref=>!refs.some(other=>other!==ref&&descendants(state,other).includes(ref)));
   for(const ref of roots){
    move(state,ref,parent,objects);
    if(objects[ref].kind==='card'&&anchor&&objects[anchor].kind!=='card')state.placements[ref].attachment={ref:anchor,position:op.before?'before':'after'};
   }
   const siblings=Object.keys(state.placements).filter(ref=>state.placements[ref].parent===parent&&!roots.includes(ref)).sort((a,b)=>state.placements[a].order-state.placements[b].order);
   const index=anchor?siblings.indexOf(anchor)+(op.after?1:0):siblings.length;siblings.splice(index,0,...roots);
   siblings.forEach((ref,order)=>{state.placements[ref].order=order;state.placements[ref].manual=true;});
   break;
  }
  case 'order':{
   const item=state.placements[op.ref];if(!item)fail('对象不存在。');
   const siblings=Object.keys(state.placements).filter(ref=>state.placements[ref].parent===item.parent).sort((a,b)=>state.placements[a].order-state.placements[b].order),index=siblings.indexOf(op.ref),target=index+(op.direction==='up'?-1:1);
   if(target>=0&&target<siblings.length){[siblings[index],siblings[target]]=[siblings[target],siblings[index]];siblings.forEach((ref,i)=>{state.placements[ref].order=i;state.placements[ref].manual=true;});}break;
  }
  case 'group':{
   const refs=[...new Set(op.refs||[])];if(!refs.length)fail('请先选择章节或卡片。');
   const id=newId(),ref=refOf('card',id);state.cards[id]={id,revision:1,...cardValue({title:op.title,purpose:'篇章'})};
   const parents=new Set(refs.map(r=>state.placements[r]?.parent));
   state.placements[ref]={parent:parents.size===1?[...parents][0]:ROOT,order:Math.min(...refs.map(r=>state.placements[r]?.order||0)),manual:true};
   for(const child of refs)move(state,child,ref,objectIndex(state,sources));break;
  }
  case 'card.delete':{
   const ref=refOf('card',op.id);if(!state.cards[op.id])fail('剧情卡不存在。');const parent=state.placements[ref].parent;
   for(const child of Object.keys(state.placements))if(state.placements[child].parent===ref)move(state,child,parent,objects);
   delete state.cards[op.id];delete state.placements[ref];
   for(const page of state.pages)delete page.instances[ref];state.precedence=state.precedence.filter(e=>e.from!==ref&&e.to!==ref);break;
  }
  case 'precedence':{
   if(!objects[op.from]||!objects[op.to]||op.from===op.to)fail('先后关系需要两个不同对象。');
   const exists=state.precedence.find(e=>e.from===op.from&&e.to===op.to);
   if(op.remove)state.precedence=state.precedence.filter(e=>e!==exists);else if(!exists)state.precedence.push({id:newId(),from:op.from,to:op.to});break;
  }
  case 'page.create':if(!String(op.name||'').trim())fail('请填写页面名称。');else state.pages.push({id:newId(),name:op.name.trim(),instances:{}});break;
  case 'page.generate':{
   // 独立的展示页，反复生成更新原页；不移动自由构思中的任何实例。
   let page=state.pages.find(p=>p.generated);if(!page){page={id:newId(),name:'大纲可视化',generated:true,instances:{}};state.pages.push(page);}
   const previous=page.instances;let row=0;const visit=(parent,depth)=>{for(const ref of Object.keys(state.placements).filter(r=>state.placements[r].parent===parent).sort((a,b)=>state.placements[a].order-state.placements[b].order)) {page.instances[ref]={x:depth*340+60,y:row++*220+60,revision:(previous[ref]?.revision||0)+1};visit(ref,depth+1);}};
   page.instances={};visit(ROOT,0);break;
  }
  case 'instance.add':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page||!objects[op.ref])fail('页面或内容对象不存在。');
   if(!page.instances[op.ref])page.instances[op.ref]={x:op.position?.x??60,y:op.position?.y??60,revision:1};break;
  }
  case 'instance.remove':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page)fail('页面不存在。');delete page.instances[op.ref];break;
  }
  case 'instance.layout':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page)fail('页面不存在。');
   for(const [ref,point] of Object.entries(op.points||{})){
    const item=page.instances[ref];if(!item)fail('展示实例已被移除。');
    if(op.revisions?.[ref]!==item.revision)throw Object.assign(new Error('实例布局已有更新，请核对后重试。'),{code:'CONFLICT'});
    if(!Number.isFinite(point.x)||!Number.isFinite(point.y))fail('坐标无效。');page.instances[ref]={x:point.x,y:point.y,revision:item.revision+1};
   }break;
  }
  case 'track.create':if(!String(op.name||'').trim())fail('请填写轨道名称。');else {if(op.color&&!/^#[0-9a-f]{6}$/i.test(op.color))fail('轨道颜色无效。');state.tracks.push({id:newId(),name:op.name.trim(),color:op.color||trackPalette[state.tracks.length%trackPalette.length]});}break;
  case 'track.update':{const track=state.tracks.find(t=>t.id===op.id);if(!track)fail('轨道不存在。');if(!String(op.name||'').trim()||!/^#[0-9a-f]{6}$/i.test(op.color))fail('请填写轨道名称并选择颜色。');track.name=op.name.trim();track.color=op.color;break;}
  case 'track.compact':{
   const track=state.tracks.find(t=>t.id===op.id);if(!track||!['narration','story'].includes(op.mode))fail('轨道或时间视图不存在。');
   const items=timelineItems(state.cards,sources.chapters,op.mode).filter(i=>i.trackId===track.id),rows=[...new Set(items.map(i=>i.row))].sort((a,b)=>a-b);
   for(const item of items){const card=state.cards[item.id],row=rows.indexOf(item.row);if(card.time[op.mode].row!==row){card.time[op.mode].row=row;card.revision++;}}
   track.rowCounts={...track.rowCounts,[op.mode]:Math.max(1,rows.length)};break;
  }
  default:fail('不支持的剧情操作。');
 }
 assertTree(state,sources);cleanAttachments(state);state.revision=input.revision+1;return state;
}
export function validateRestore(value,sources){
 if(value?.format!=='moji-story-v1'||!value.cards||!value.placements||!Array.isArray(value.pages)||!value.pages.length||!Array.isArray(value.tracks)||!value.tracks.length||!Array.isArray(value.precedence))fail('不是本轮新结构的规划备份。');
 const safe=id=>typeof id==='string'&&id.length>0&&id.length<=200&&!['__proto__','constructor','prototype'].includes(id);if(!Number.isSafeInteger(value.revision)||value.revision<0)fail('工作区版本无效');
 for(const [id,card]of Object.entries(value.cards))if(!safe(id)||card.id!==id||!Number.isSafeInteger(card.revision)||card.revision<1||!card.title?.trim()||!Array.isArray(card.cast)||!Array.isArray(card.scope)||!Array.isArray(card.evidence))fail('剧情卡标识、版本或字段无效');
 for(const rows of [value.pages,value.tracks])if(rows.some(r=>!safe(r.id))||new Set(rows.map(r=>r.id)).size!==rows.length)fail('页面或轨道标识无效');
 const objects=objectIndex(value,sources);
 for(const ref of Object.keys(value.placements))if(!objects[ref])fail('备份包含当前目录中不存在的卷章；请使用配套测试作品。');
 assertTree(value,sources);
 for(const card of Object.values(value.cards))validateCard(card,sources,value);
 for(const page of value.pages)for(const [ref,p] of Object.entries(page.instances))if(!objects[ref]||!Number.isFinite(p.x)||!Number.isFinite(p.y))fail('备份中的展示实例无效。');
 return clone(value);
}
