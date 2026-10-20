import {resolve} from 'node:path';
import {createService} from '../server/service.mjs';
const root=resolve(import.meta.dirname,'../.data/studio-preview'),s=await createService(root),call=(action,args={})=>s.rpc(action,{novelId:s.novelId,...args},'studio-preview','human');
const novel=await call('novel.get');
if(!novel.description){
 await call('novel.update',{expectedRevision:novel.revision,title:'雾港来信',description:'一封未寄出的信，牵起一座城的旧事。岑予回到雾港，在旧信中发现父亲失踪的线索。',genre:'长篇小说'});
 const volume=await call('volume.create',{title:'第一卷 · 来信'}),first=await call('chapter.get',{chapterId:s.chapterId});
 await call('chapter.update',{chapterId:first.id,expectedRevision:first.revision,volumeId:volume.id,title:'第1章 来信',summary:'岑予在故乡的旧居里发现一封没有署名的信。'});
 for(const [i,title]of ['回城','灯塔','约定','离港'].entries())await call('chapter.create',{volumeId:volume.id,title:`第${i+2}章 ${title}`,content:'故事的下一页，从这里继续。'});
 const chapters=await call('chapter.list'),people=[];
 for(const [name,summary]of [['岑予','回乡调查旧信的青年'],['林照','沉默的灯塔看守人']])people.push(await call('graph.create',{type:'character_card',name,summary,content:summary}));
 await call('graph.create',{type:'world_entry',name:'雾港',summary:'被海雾环绕的港口。',content:'故事从这里开始。'});
 await call('edge.create',{from:people[0].id,to:people[1].id,name:'儿时好友',content:''});
 for(const [index,p]of people.entries())await call('writing.link.create',{chapterId:chapters[index?2:0].id,expectedChapterRevision:chapters[index?2:0].revision,chapterRevision:chapters[index?2:0].revision,nodeId:p.id,kind:'appearance',evidence:chapters[index?2:0].content||'故事',confirmed:true}).catch(()=>{});
 for(const [title,start,end]of [['调查旧信',0,2],['灯塔重逢',2,2],['潮汐警报',1,2],['失踪的船员',2,3],['码头来客',2,2]])await call('writing.event.create',{confirmed:true,value:{title,order:(start+1)*10,narrativeKind:'linear',storyDate:'1938-09-'+String(start+1).padStart(2,'0'),content:'仅供本地界面检查的示例事件。',chapterRefs:chapters.slice(start,end+1).map(c=>({chapterId:c.id,revision:c.revision,evidence:''})),memoryRefs:people.map(p=>p.id)}});
 await call('writing.foreshadow.create',{confirmed:true,value:{title:'灯塔的第二束光',status:'planned',content:'仅供本地界面检查。',targetChapterId:chapters[4].id,memoryRefs:[],evidence:[]}});
 await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'one',value:{title:'离港的约定',status:'idea',summary:'岑予和林照约定离开雾港。',content:'自由画布中的情节卡片。',position:{x:80,y:80},chapterRefs:[{chapterId:chapters[3].id,revision:chapters[3].revision,evidence:''}]}}]});
 await call('writing.goal.set',{expectedRevision:0,target:50000});
 await s.rpc('novel.create',{title:'山海拾遗',genre:'奇幻小说'},'studio-preview','human');
}
if(!(await call('planning.list')).items.length)await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'one',value:{title:'离港的约定',summary:'岑予和林照约定离开雾港。',content:'自由画布中的情节卡片。',status:'idea',position:{x:80,y:80}}}]});
const stats=await call('writing.stats.get');if(!stats.goal.target)await call('writing.goal.set',{expectedRevision:stats.goal.revision,target:50000});
if((await call('novel.list')).length===1)await s.rpc('novel.create',{title:'山海拾遗',genre:'奇幻小说'},'studio-preview','human');
const plans=await call('planning.list');if(plans.items.length===1)await call('planning.apply',{requestId:crypto.randomUUID(),operations:[{op:'node.create',ref:'next',value:{title:'海上的夜',summary:'他们终于离开雾港。',status:'selected',position:{x:420,y:180}}},{op:'edge.create',value:{from:plans.items[0].id,to:'next',type:'next',label:'下一步'}}]});
console.log(JSON.stringify({root,novelId:s.novelId}));
