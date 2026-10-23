const rows=state=>Object.values(state.cards).flatMap(c=>(c.points||[]).flatMap(p=>(p.relationships||[]).map((r,i)=>({card:c,point:p,change:r,identity:r.id||`${p.id}:${i}`}))));
const signature=r=>JSON.stringify([r.from,r.to,r.name,r.reason||'',r.evidence?.chapterId,r.evidence?.revision,r.evidence?.evidence]);
export async function validateRelationshipProofs(before,next,sources,rpc,{confirmed=false,restore=false}={}){
 const previous=rows(before),old=new Set(previous.map(x=>x.identity+signature(x.change))),history=new Map();
 const changed=rows(next).filter(x=>!old.has(x.identity+signature(x.change)));
 if(changed.length){const people=await rpc('graph.list',{}),characters=new Set(people.filter(p=>p.type==='character_card'&&!p.deleted).map(p=>p.id));for(const {change:r} of changed)if(!characters.has(r.from)||!characters.has(r.to))throw new Error('请选择两名仍存在的人物。');}
 for(const {point,change:r,identity} of rows(next)){
  const prior=previous.find(x=>x.identity===identity&&signature(x.change)===signature(r));
  if(point.location?.narration&&!sources.chapters.some(c=>c.id===point.location.narration.chapterId)&&!previous.some(x=>JSON.stringify(x.point.location)===JSON.stringify(point.location)))throw new Error('发生位置引用了不存在的章节。');
  if(!r.evidence)continue;
  const e=r.evidence;
  if(prior&&!restore){r.evidence=structuredClone(prior.change.evidence);continue;}
  if(!restore&&!confirmed)throw new Error('确认或修改正文事实需要作者明确确认正文依据。');
  if(!history.has(e.chapterId))history.set(e.chapterId,await rpc('chapter.history',{chapterId:e.chapterId,includeContent:true}));
  const version=history.get(e.chapterId).find(v=>v.revision===e.revision);
  if(!version||!e.evidence?.trim()||!version.content.includes(e.evidence))throw new Error('引用依据不在指定的已保存正文版本中。');
  const chapter=sources.chapters.find(c=>c.id===e.chapterId);
  if(!restore&&chapter?.revision!==e.revision)throw Object.assign(new Error('依据正文已有更新，请读取最新正文后重新确认。'),{code:'CONFLICT'});
  r.evidence={chapterId:e.chapterId,revision:e.revision,evidence:e.evidence,contentHash:version.contentHash};
 }
}
