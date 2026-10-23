import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createService} from '../../server/service.mjs';
export async function storyFixture(prefix='story-protocol'){
 const directory=await mkdtemp(join(tmpdir(),prefix+'-')),service=await createService(directory),novelId=service.novelId;
 const call=(action,args={})=>service.rpc(action,{novelId,...args},prefix,'human');
 let chapter=await call('chapter.get',{chapterId:service.chapterId});await call('chapter.update',{chapterId:chapter.id,expectedRevision:chapter.revision,content:'林照找到钥匙。江遥接过钥匙。'});chapter=await call('chapter.get',{chapterId:chapter.id});
 const chapters=[chapter];for(let i=2;i<=5;i++){const c=await call('chapter.create',{title:`第${i}章`,content:`原文${i}`});chapters.push(await call('chapter.get',{chapterId:c.id}));}
 const read=()=>call('story.get');
 const apply=async operation=>{const story=await read();return call('story.apply',{requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation});};
 const create=async value=>{const before=await read(),after=await apply({type:'card.create',pageId:'main',value});return Object.values(after.state.cards).find(c=>!before.state.cards[c.id]);};
 const request=async(id,value,extra={})=>{const story=await read();return {requestId:crypto.randomUUID(),expectedRevision:story.state.revision,operation:{type:'card.update',id,expectedRevision:story.state.cards[id].revision,value,...extra}};};
 return {directory,service,novelId,call,read,apply,create,request,chapters};
}
export const narration=(start,end=start,startOffset=0,endOffset=1)=>({trackId:'main',startChapterId:start.id,startOffset,endChapterId:end.id,endOffset});
