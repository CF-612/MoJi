import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {storyEventDraft} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/story-event-draft.mjs';
import {coordinateToDate} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-axis.mjs';
import {emptyWorkspace,applyStory} from '../integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-workspace.mjs';
const root=resolve(import.meta.dirname,'..'),base=resolve(root,'integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning');
const axis={schemaVersion:1,calendar:{kind:'gregorian',name:'公历',era:'公元',visibility:{year:true,month:true,day:true}},anchor:{coordinate:739617,label:'故事起点'},coordinateUnit:'day',primaryTick:{unit:'year',step:1},legacyMode:'unmapped',tracks:[{id:'a',name:'轨道',color:'#778899',side:'below'}],markers:[]},state={...emptyWorkspace(),storyAxis:axis},sources={chapters:[],volumes:[]};
axis.anchor.date=coordinateToDate(axis.anchor.coordinate,axis.calendar);
test('explicit story event draft uses selected date and remains local until normal save',()=>{
 const before=structuredClone(state),time=storyEventDraft(state,739630);assert.equal(time.start,739630);assert.equal(time.end,739631);assert.equal(time.side,'above');assert.deepEqual(state,before);
 assert.equal(storyEventDraft(state,undefined),null);assert.equal(storyEventDraft({...state,storyAxis:null},739630),null);
 const result=applyStory(state,sources,{type:'card.create',value:{title:'第一件事',time:{story:time}}},()=> 'first');assert.equal(result.cards.first.time.story.start,739630);assert.equal(Object.keys(state.cards).length,0);assert.equal(result.pages[0].instances['card:first'],undefined);
});
test('actual CardEditor shows prechecked story position before prose only for explicit story creation',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'moji-story-editor-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const source=await readFile(join(base,'UnifiedPlanning.jsx'),'utf8');
 await build({plugins:[{name:'server-dialog-context',setup(b){b.onLoad({filter:/[\\/]dialog\.tsx$/},()=>({loader:'js',contents:'export const useDialog=()=>({confirm:async()=>true,ask:async()=>null});export const DialogProvider=({children})=>children;'}));}}],stdin:{resolveDir:base,loader:'jsx',contents:source+`\nimport {renderToStaticMarkup} from 'react-dom/server';import {DialogProvider} from '../../dialog.tsx';export function renderFixture(props){return renderToStaticMarkup(<DialogProvider><CardEditor {...props}/></DialogProvider>);}`},alias:{react:resolve(root,'node_modules/react'),'react-dom':resolve(root,'node_modules/react-dom')},bundle:true,platform:'node',format:'cjs',outfile:join(dir,'fixture.cjs'),loader:{'.png':'dataurl'}});
 const {renderFixture}=createRequire(import.meta.url)(join(dir,'fixture.cjs')),baseCard={title:'',summary:'',content:'',status:'idea',purpose:'情节',cast:[],scope:[],time:{}},props={embedded:false,initial:baseCard,sources,state,people:[],save:()=>{throw Error('must not save during render');},close:()=>{},call:()=>{},novelId:'synthetic'};
 const html=renderFixture({...props,storyCreation:true,initial:{...baseCard,time:{story:storyEventDraft(state,739630)}}});
 assert.match(html,/<details open=""><summary>故事时间位置/);assert.match(html,/type="checkbox" checked=""/);assert.ok(html.indexOf('故事时间位置')<html.indexOf('摘要'));assert.match(html,/保存前可修改，取消不会安排时间/);
 const normal=renderFixture(props);assert.doesNotMatch(normal,/<details open=""><summary>故事时间位置/);assert.ok(normal.indexOf('故事时间位置')>normal.indexOf('摘要'));
 const existing={...baseCard,id:'old',time:{story:storyEventDraft(state,739620)}},before=structuredClone(existing);renderFixture({...props,initial:existing});assert.deepEqual(existing,before);
});
test('story entry passes cursor while ordinary creation does not auto-arrange',async()=>{
 const source=await readFile(join(base,'UnifiedPlanning.jsx'),'utf8'),axisSource=await readFile(join(base,'StoryTimeAxis.jsx'),'utf8');
 assert.match(axisSource,/onCreate\(\{storyCoordinate:cursor\}\)/);assert.match(source,/storyOnly\?storyEventDraft\(state,intent\?\.storyCoordinate\):null/);assert.match(source,/storyCreation=\{editing.storyCreation===true\}/);assert.match(source,/storyOnly:!pendingCreate.operation.pageId,storyCreation:!pendingCreate.operation.pageId&&value.time\?\.story\?\.axisVersion===1/);
});
