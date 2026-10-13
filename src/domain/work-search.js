import {createHash} from 'node:crypto';
export const searchKinds=Object.freeze({chapter:'正文',character:'角色',world:'世界',planning:'规划',event:'事件',foreshadow:'伏笔',requirements:'写作要求'});
const fail=message=>{throw Object.assign(new Error(message),{code:'INVALID_SEARCH'});};
const active=map=>Object.values(map||{}).filter(r=>!r.deleted);
const cut=(v,max=180)=>String(v??'').slice(0,max);
const signature=n=>createHash('sha256').update(JSON.stringify([n.revision,n.preset?.revision,n.planning?.sequence,...['chapters','nodes'].map(k=>Object.values(n[k]||{}).map(v=>[v.id,v.revision,v.deleted]).sort()),...['cards','events','foreshadows'].map(k=>Object.values(n.writing?.[k]||{}).map(v=>[v.id,v.revision,v.deleted]).sort())])).digest('hex');
function excerpt(text,match){
 let start=Math.max(0,match.index-50),end=Math.min(text.length,match.index+match[0].length+90);
 // The excerpt must not cut a UTF-16 surrogate pair in half.
 if(start>0&&/[\uDC00-\uDFFF]/u.test(text[start]))start--;
 if(end<text.length&&/[\uD800-\uDBFF]/u.test(text[end-1]))end++;
 const prefix=start?'…':'',suffix=end<text.length?'…':'';
 return {snippet:prefix+text.slice(start,end)+suffix,start:prefix.length+match.index-start,length:match[0].length};
}
function documents(n,fields,includeInactive){
 const rows=[],add=(kind,r,parts,extra={})=>rows.push({kind,id:r.id,revision:r.revision||0,title:cut(r.title||r.name),parts,...extra});
 for(const ch of active(n.chapters))add('chapter',ch,[['title','标题',ch.title,0],['content','正文',ch.content,4]],{location:cut(n.volumes?.[ch.volumeId]?.title||'未分卷')});
 for(const node of active(n.nodes)){
  const kind=node.type==='character_card'?'character':'world',profile=n.writing?.cards?.[node.id],typeFields=fields[kind==='character'?'character':'world'];
  const parts=[['name','名称',node.name,0],...((node.aliases||[]).map(v=>['aliases','别名',v,1])),['summary','摘要',node.summary,2],['content','详述',node.content,4]];
  for(const [id,value]of Object.entries(profile?.values||{})){const field=typeFields.find(f=>f.id===id);if(field?.archived||value===null||value==='')continue;const rendered=field?.type==='reference'?value.map(id=>n.nodes[id]?.name||id).join('、'):Array.isArray(value)?value.join('、'):String(value);parts.push([id,cut(field?.label||id,60),rendered,3]);}
  add(kind,node,parts,{profileRevision:profile?.revision||0});
 }
 for(const p of active(n.planning?.nodes||n.plan?.nodes))add('planning',p,[['title','标题',p.title,0],['summary','摘要',p.summary,2],['content','详述',p.content,4]],{status:p.status,location:cut(n.planning?.pages?.[p.pageId]?.name||'主线规划')});
 for(const e of active(n.writing?.events))add('event',e,[['title','名称',e.title,0],['storyTime','故事时间',e.storyTime,2],['storyDate','故事日期',e.storyDate,2],['content','说明',e.content,4]],{planned:!!e.planned,location:cut((e.chapterRefs||[]).map(r=>n.chapters[r.chapterId]).filter(c=>c&&!c.deleted).map(c=>c.title).join('、')||e.plannedChapter||'尚未关联正文')});
 for(const f of active(n.writing?.foreshadows))add('foreshadow',f,[['title','名称',f.title,0],['content','说明',f.content,4],...((f.evidence||[]).map(e=>['evidence','正文依据',e.evidence,3]))],{status:f.status});
 if(n.preset&&(includeInactive||n.preset.enabled))for(const b of n.preset.blocks||[])if(includeInactive||b.enabled)add('requirements',{...b,id:b.identifier,title:b.name,revision:n.preset.revision},[['name','条目名称',b.name,0],['content','写作要求',b.content,4]],{inactive:!n.preset.enabled||!b.enabled});
 return rows;
}
export function workSearch(n,args,fields,{includeInactive=false}={}){
 if(typeof args.query!=='string'||args.query.length>160)fail('搜索词需要不超过 160 字符的文字');
 const query=args.query.trim(),kinds=args.kinds??Object.keys(searchKinds);
 if(!Array.isArray(kinds)||!kinds.length||kinds.some(k=>!Object.hasOwn(searchKinds,k))||new Set(kinds).size!==kinds.length)fail('搜索范围无效');
 const offset=args.offset??0,limit=args.limit??30,maxChars=args.maxChars??12000;
 if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>50||!Number.isSafeInteger(maxChars)||maxChars<2000||maxChars>24000)fail('搜索分页或返回长度无效');
 const snapshot=signature(n);if(args.snapshot!==undefined&&args.snapshot!==snapshot)throw Object.assign(new Error('作品资料已变化，请重新搜索，避免混合不同版本的结果'),{code:'CONFLICT'});
 const counts=Object.fromEntries(Object.keys(searchKinds).map(k=>[k,0]));
 if(!query)return {query,kinds,counts,total:0,items:[],offset,limit,hasMore:false,nextOffset:null,snapshot};
 // User input is always escaped literal text, never a regular expression.
 const pattern=new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'iu'),results=[];
 for(const row of documents(n,fields,includeInactive)){
  let best=null;
  for(const [field,label,value,priority]of row.parts){if(typeof value!=='string'||!value)continue;const match=pattern.exec(value);if(!match)continue;const score=priority*10+(priority===0&&match[0].length===value.length?0:priority===0&&match.index===0?1:2);if(!best||score<best.score)best={field,label,score,...excerpt(value,match)};}
  if(!best)continue;const {parts,...meta}=row;counts[row.kind]++;results.push({...meta,match:best});
 }
 const order=new Map(Object.keys(searchKinds).map((k,i)=>[k,i]));results.sort((a,b)=>a.match.score-b.match.score||order.get(a.kind)-order.get(b.kind)||a.title.localeCompare(b.title,'zh-CN')||a.id.localeCompare(b.id));
 const filtered=results.filter(r=>kinds.includes(r.kind)),result={query,kinds,counts,total:filtered.length,items:filtered.slice(offset,offset+limit),offset,limit,hasMore:false,nextOffset:null,snapshot};
 while(JSON.stringify(result).length+64>maxChars&&result.items.length)result.items.pop();
 result.hasMore=offset+result.items.length<filtered.length;result.nextOffset=result.hasMore?offset+result.items.length:null;
 return result;
}
