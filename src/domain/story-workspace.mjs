import {packOutline} from './compact-outline-layout.mjs';
import {validateTrackPreferences,reorderTracks,setStoryTrackSide} from './story-tracks.mjs';
import {editStoryAxis,validateStoryAxis,validateStoryPlacement} from './story-axis.mjs';
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
 if(state.storyAxis?.anchor?.cardId&&!state.cards[state.storyAxis.anchor.cardId]){delete state.storyAxis.anchor.cardId;changed=true;}
 const defaultParent=(ref)=>valid[ref]?.kind==='chapter'&&valid[ref].volumeId&&valid[refOf('volume',valid[ref].volumeId)]?refOf('volume',valid[ref].volumeId):ROOT;
 for(const ref of Object.keys(state.placements))if(!valid[ref]){delete state.placements[ref];changed=true;}
 const rescue=(parent,seen=new Set())=>{if(parent===ROOT||valid[parent])return parent;if(seen.has(parent))return ROOT;seen.add(parent);return rescue(old[parent]?.parent||ROOT,seen);};
 for(const [ref,obj] of Object.entries(valid)){
  const p=state.placements[ref];
  if(!p){state.placements[ref]={parent:defaultParent(ref),order:Number.isFinite(obj.order)?obj.order:Object.keys(state.placements).length,manual:obj.kind==='card'};changed=true;}
  else if(p.parent!==ROOT&&!valid[p.parent]){p.parent=rescue(p.parent);p.manual=true;changed=true;}
  else if(!p.manual){if(p.parent!==defaultParent(ref)){p.parent=defaultParent(ref);changed=true;}if(Number.isFinite(obj.order)&&p.order!==obj.order){p.order=obj.order;changed=true;}}
 }
 // Existing invalid ancestry is reported, never silently reparented. Authors can
 // repair it explicitly through the same validated move operation used by canvas.

 for(const p of Object.values(state.placements))if(p.attachment&&!valid[p.attachment.ref]){delete p.attachment;changed=true;}
 for(const page of state.pages){
  for(const ref of Object.keys(page.instances))if(!valid[ref]){delete page.instances[ref];changed=true;}
  if(page.outline){const refs=page.outline.refs.filter(ref=>valid[ref]&&page.instances[ref]);if(refs.length!==page.outline.refs.length){page.outline.refs=refs;changed=true;}}
 }
 state.precedence=state.precedence.filter(e=>{const ok=valid[e.from]&&valid[e.to];if(!ok)changed=true;return ok;});
 for(const card of Object.values(state.cards)){
  card.scope=(card.scope||[]).filter(id=>valid[refOf('chapter',id)]);
  if(card.time?.narration&&!['startChapterId','endChapterId'].every(k=>valid[refOf('chapter',card.time.narration[k])])){card.time.narration=null;changed=true;}
 }
 return changed;
}
export function hierarchyIssues(state,sources){
 const objects=objectIndex(state,sources);
 return Object.keys(objects).flatMap(ref=>{const message=treeError(state,objects,ref);return message?[{ref,message}]:[];});
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
export function descendants(state,ref,seen=new Set([ref])){const result=[];for(const [id,p] of Object.entries(state.placements))if(p.parent===ref&&!seen.has(id)){seen.add(id);result.push(id,...descendants(state,id,seen));}return result;}
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
 return {...(value.legacyStoryTime?{legacyStoryTime:clone(value.legacyStoryTime)}:{}),title:String(value.title).trim(),purpose:value.purpose||'情节',summary:String(value.summary||''),content:String(value.content||''),status:value.status||'idea',cast:clone(value.cast||[]),scope:clone(value.scope||[]),time:clone(value.time||{}),storyDateText:String(value.storyDateText||'').slice(0,200),points:clone(value.points||[]),foreshadowRefs:clone(value.foreshadowRefs||[]),evidence:clone(value.evidence||[])};
}
function validateCard(card,sources,state){
 const chapters=new Set(sources.chapters.map(c=>c.id));
 if(card.scope.some(id=>!chapters.has(id)))fail('跨度引用了不存在的章节。');
 if(!Array.isArray(card.points))fail('剧情发生点必须是列表。');
 validateRelationPoints(card.points,sources.chapters);
 for(const mode of ['narration','story']){
  const time=card.time[mode];if(!time)continue;
  if(time.row!==undefined&&(!Number.isInteger(time.row)||time.row<0||time.row>10000))fail('时间线行位置无效。');
  if(!(mode==='story'&&time.axisVersion===1)&&!state.tracks.some(t=>t.id===time.trackId))fail('时间轨道不存在。');
  if(mode==='narration'){
   const order=sources.chapters.map(c=>c.id),a=order.indexOf(time.startChapterId),b=order.indexOf(time.endChapterId);
   if(a<0||b<0||!Number.isFinite(time.startOffset)||!Number.isFinite(time.endOffset)||time.startOffset<0||time.startOffset>=1||time.endOffset<=0||time.endOffset>1||b+time.endOffset<=a+time.startOffset)fail('叙述跨度的起止位置无效。');
  }else if(time.axisVersion===1){validateStoryPlacement(time,state.storyAxis,state.tracks);}
  else if(!Number.isFinite(time.start)||!Number.isFinite(time.end)||Math.abs(time.start)>1000000||Math.abs(time.end)>1000000||time.end<=time.start)fail('故事时间终点必须晚于起点。');
 }
 // 采用进度不等于已确认正文事实。事实只由后续证据确认接口写入。
}
// Geometry matches the current canvas card (248 × 208), not the old export size.
// Layout is a containment forest: siblings branch horizontally, parents are centered
// above their descendant span. Precedence never participates in this projection.
export function treeLayout(state,sources,refs=Object.keys(objectIndex(state,sources)),{origin={x:60,y:60},width=248,height=208,gapX=64,gapY=100}={}){
 const objects=objectIndex(state,sources),included=new Set(refs.filter(ref=>objects[ref])),children=new Map(),roots=[];
 const ordered=[...included].sort((a,b)=>(state.placements[a]?.order??0)-(state.placements[b]?.order??0)||a.localeCompare(b));
 for(const ref of ordered){const parent=state.placements[ref]?.parent;if(included.has(parent)){if(!children.has(parent))children.set(parent,[]);children.get(parent).push(ref);}else roots.push(ref);}
 const spans=new Map(),visiting=new Set();
 const measure=ref=>{if(spans.has(ref))return spans.get(ref);if(visiting.has(ref))fail('不能为循环包含关系生成大纲，请先修复层级。');visiting.add(ref);const rows=children.get(ref)||[],span=Math.max(width,rows.reduce((n,child)=>n+measure(child),0)+Math.max(0,rows.length-1)*gapX);visiting.delete(ref);spans.set(ref,span);return span;};
 for(const ref of ordered)measure(ref);
 const points={},place=(ref,left,depth)=>{const span=spans.get(ref);points[ref]={x:left+(span-width)/2,y:origin.y+depth*(height+gapY)};let cursor=left;for(const child of children.get(ref)||[]){place(child,cursor,depth+1);cursor+=spans.get(child)+gapX;}};
 let cursor=origin.x;for(const ref of roots){place(ref,cursor,0);cursor+=spans.get(ref)+gapX;}
 return points;
}
/** Only structural sources and 篇章 cards (plus their linking ancestors) can be
 * explicitly adopted from a free canvas. Standalone plot ideas remain untouched. */
export function outlineHierarchyRefs(state,sources){
 const objects=objectIndex(state,sources),refs=new Set(Object.keys(objects).filter(ref=>objects[ref].kind!=='card'||objects[ref].purpose==='篇章'));
 for(const ref of [...refs]){let parent=state.placements[ref]?.parent;const seen=new Set([ref]);while(parent&&parent!==ROOT&&objects[parent]&&!seen.has(parent)){seen.add(parent);refs.add(parent);parent=state.placements[parent]?.parent;}}
 return [...refs];
}
export function compactOutlineLayout(state,sources,refs=Object.keys(objectIndex(state,sources)),options={}){
 return packOutline(objectIndex(state,sources),state.placements,refs,options);
}
export function generatedOutline(state,sources,page,{relayoutExisting=false,adoptHierarchy=false}={}){
 const objects=objectIndex(state,sources),refs=Object.keys(objects),instances=page?.instances||{};
 // Old generated pages have no ownership marker: preserve their positions on the
 // first update, rather than guessing which cards the author has arranged.
 if(relayoutExisting&&!page?.generated)fail('只有独立大纲页可以确认重排已有展示；自由画布的手工位置保持不变。');
 const adopted=adoptHierarchy?outlineHierarchyRefs(state,sources):[];
 const previous=new Set([...(relayoutExisting?Object.keys(instances):page?.outline?.refs||[]),...adopted].filter(ref=>objects[ref]&&instances[ref]));
 const added=refs.filter(ref=>!instances[ref]),updated=refs.filter(ref=>previous.has(ref)),preserved=refs.filter(ref=>instances[ref]&&!previous.has(ref));
 const ownedRefs=[...new Set([...updated,...added])];
 const manual=Object.entries(instances).filter(([ref])=>!previous.has(ref));
 const origin=page?.outline?.origin||{x:manual.length?Math.max(...manual.map(([,p])=>p.x+248))+100:60,y:manual.length?Math.min(...manual.map(([,p])=>p.y)):60};
 // Preserve one instance per source reference. An already visible manual card is
 // not duplicated; only explicit hierarchy adoption can change its coordinates.
 const points=compactOutlineLayout(state,sources,ownedRefs,{origin});
 return {points,added,updated,preserved,ownedRefs,origin};
}
export function applyStory(input,sources,operation,newId){
 const state=clone(input),objects=objectIndex(state,sources),op=operation;
 switch(op.type){
  case 'storyAxis.configure':case 'storyAxis.place':case 'storyAxis.unplace':case 'storyAxis.marker.create':case 'storyAxis.marker.update':case 'storyAxis.marker.delete':case 'storyAxis.track.create':case 'storyAxis.track.update':case 'storyAxis.track.delete':editStoryAxis(state,op,newId);break;
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
   const next={id:card.id,revision:card.revision+1,...cardValue({...card,...op.value})};
   if(state.storyAxis&&(op.placement?.mode==='story'||(JSON.stringify(next.time?.story)!==JSON.stringify(card.time?.story)&&op.storyPlacement!==true)))fail('请在独立故事时间线中安排故事日期。');
   if(op.storyPlacement===true&&next.time?.story?.axisVersion===1&&card.time?.story&&card.time.story.axisVersion!==1&&!next.legacyStoryTime)next.legacyStoryTime=clone(card.time.story);
   validateCard(next,sources,state);
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
   if(state.storyAxis?.anchor?.cardId===op.id)delete state.storyAxis.anchor.cardId;
   for(const page of state.pages){delete page.instances[ref];if(page.outline)page.outline.refs=page.outline.refs.filter(id=>id!==ref);}state.precedence=state.precedence.filter(e=>e.from!==ref&&e.to!==ref);break;
  }
  case 'precedence':{
   if(!objects[op.from]||!objects[op.to]||op.from===op.to)fail('先后关系需要两个不同对象。');
   const exists=state.precedence.find(e=>e.from===op.from&&e.to===op.to);
   if(op.remove)state.precedence=state.precedence.filter(e=>e!==exists);else if(!exists)state.precedence.push({id:newId(),from:op.from,to:op.to});break;
  }
  case 'page.create':if(!String(op.name||'').trim())fail('请填写页面名称。');else state.pages.push({id:newId(),name:op.name.trim(),instances:{}});break;
  case 'page.generate':{
   // A request chooses its target explicitly; switching the module never migrates.
   let page=op.pageId?state.pages.find(p=>p.id===op.pageId):state.pages.find(p=>p.generated);
   if(op.pageId&&!page)fail('画布页面不存在。');
   if(!page){page={id:newId(),name:'大纲可视化',generated:true,instances:{}};state.pages.push(page);}
   const layout=generatedOutline(state,sources,page,{relayoutExisting:op.relayoutExisting===true,adoptHierarchy:op.adoptHierarchy===true});
   for(const [ref,point] of Object.entries(layout.points))page.instances[ref]={...point,revision:(page.instances[ref]?.revision||0)+1};
   page.outline={refs:layout.ownedRefs,origin:layout.origin};
   break;
  }
  case 'instance.add':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page||!objects[op.ref])fail('页面或内容对象不存在。');
   if(!page.instances[op.ref])page.instances[op.ref]={x:op.position?.x??60,y:op.position?.y??60,revision:1};break;
  }
  case 'instance.remove':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page)fail('页面不存在。');delete page.instances[op.ref];if(page.outline)page.outline.refs=page.outline.refs.filter(ref=>ref!==op.ref);break;
  }
  case 'instance.layout':{
   const page=state.pages.find(p=>p.id===op.pageId);if(!page)fail('页面不存在。');
   for(const [ref,point] of Object.entries(op.points||{})){
    const item=page.instances[ref];if(!item)fail('展示实例已被移除。');
    if(op.revisions?.[ref]!==item.revision)throw Object.assign(new Error('实例布局已有更新，请核对后重试。'),{code:'CONFLICT'});
    if(!Number.isFinite(point.x)||!Number.isFinite(point.y))fail('坐标无效。');page.instances[ref]={x:point.x,y:point.y,revision:item.revision+1};
   }break;
  }
  case 'track.reorder':reorderTracks(state,op);break;
  case 'storyAxis.track.side':setStoryTrackSide(state,op);break;
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
 validateTrackPreferences(state);assertTree(state,sources);cleanAttachments(state);state.revision=input.revision+1;return state;
}
export function validateRestore(value,sources){
 if(value?.format!=='moji-story-v1'||!value.cards||!value.placements||!Array.isArray(value.pages)||!value.pages.length||!Array.isArray(value.tracks)||!value.tracks.length||!Array.isArray(value.precedence))fail('不是本轮新结构的规划备份。');
 const safe=id=>typeof id==='string'&&id.length>0&&id.length<=200&&!['__proto__','constructor','prototype'].includes(id);if(!Number.isSafeInteger(value.revision)||value.revision<0)fail('工作区版本无效');
 for(const [id,card]of Object.entries(value.cards))if(!safe(id)||card.id!==id||!Number.isSafeInteger(card.revision)||card.revision<1||!card.title?.trim()||!Array.isArray(card.cast)||!Array.isArray(card.scope)||!Array.isArray(card.evidence))fail('剧情卡标识、版本或字段无效');
 for(const rows of [value.pages,value.tracks])if(rows.some(r=>!safe(r.id))||new Set(rows.map(r=>r.id)).size!==rows.length)fail('页面或轨道标识无效');
 if(value.storyAxis)validateStoryAxis(value.storyAxis);
 validateTrackPreferences(value);
 const objects=objectIndex(value,sources);
 for(const ref of Object.keys(value.placements))if(!objects[ref])fail('备份包含当前目录中不存在的卷章；请使用配套测试作品。');
 assertTree(value,sources);
 for(const card of Object.values(value.cards))validateCard(card,sources,value);
 for(const page of value.pages){
  for(const [ref,p] of Object.entries(page.instances))if(!objects[ref]||!Number.isFinite(p.x)||!Number.isFinite(p.y))fail('备份中的展示实例无效。');
  if(page.outline&&(!Array.isArray(page.outline.refs)||new Set(page.outline.refs).size!==page.outline.refs.length||page.outline.refs.some(ref=>!page.instances[ref])||!Number.isFinite(page.outline.origin?.x)||!Number.isFinite(page.outline.origin?.y)))fail('备份中的大纲布局范围无效。');
 }
 return clone(value);
}
