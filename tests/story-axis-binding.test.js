import test from 'node:test';
import assert from 'node:assert/strict';
import {relationPoint,relationSnapshot,relationRange} from '../src/domain/story-relations.mjs';
import {editRelation,validateRelationPoints} from '../src/domain/story-relation-edit.mjs';
import {copyStory,storyAxisCompatible} from '../src/domain/story-copy.js';
import {emptyWorkspace} from '../src/domain/story-workspace.mjs';
const chapters=[{id:'ch',contentHash:'proof'}];
const proof={chapterId:'ch',revision:1,contentHash:'proof',evidence:'原文'};
const point=(id,offset,evidence=null)=>({id,location:{story:{binding:{kind:'card',offset}},narration:{chapterId:'ch',offset:id==='p1'?.1:.2}},relationships:[{id:'r',from:'a',to:'b',name:id,evidence}]});
const card=(id,start,p)=>({id,title:id,revision:1,status:'selected',time:{story:{start,end:start+2,axisVersion:1}},points:[p],cast:[],scope:[],evidence:[],foreshadowRefs:[]});
const axis=()=>({schemaVersion:1,calendar:{kind:'gregorian',name:'公历'},anchor:{date:{year:0,month:1,day:1},coordinate:0,label:'第一章'},coordinateUnit:'day',primaryTick:{unit:'year',step:1},legacyMode:'unmapped',tracks:[{id:'st',name:'故事',color:'#123456',side:'above'}],markers:[{id:'m',label:'远古',coordinate:-2191455000000}]});
test('bound relationship chronology follows only story card; narrator and evidence unchanged',()=>{
 const cards={one:card('one',20,point('p1',0,proof)),two:card('two',10,point('p2',1))};
 const narrator=relationSnapshot(cards,[],chapters,'narration',10),before=structuredClone(cards.one.points);
 assert.deepEqual(relationSnapshot(cards,[],chapters,'story',100).changes.map(r=>r.cardId),['two','one']);
 cards.one.time.story={start:-2191455000000,end:-2191454999998,axisVersion:1};
 assert.deepEqual(relationSnapshot(cards,[],chapters,'story',100).changes.map(r=>r.cardId),['one','two']);
 assert.deepEqual(relationSnapshot(cards,[],chapters,'narration',10),narrator);
 assert.deepEqual(cards.one.points,before);
 assert.equal(relationPoint(cards.one.points[0],'story',chapters,cards.one),-2191455000000);
 assert.equal(relationSnapshot(cards,[],chapters,'story',100,false).changes.length,1);
});
test('legacy absolute remains fixed, missing placement pending, non-integral ratio never rounded',()=>{
 const c=card('c',8,point('p',0));
 assert.equal(relationPoint({location:{story:123}},'story',[],c),123);
 assert.equal(relationPoint(c.points[0],'story',[],{time:{story:{start:8,end:9}}}),null);
 assert.equal(relationPoint(c.points[0],'story',[],{}),null);
 c.time.story.end=9;c.points[0].location.story.binding.ratio=.5;
 assert.equal(relationPoint(c.points[0],'story',[],c),null);
 c.points[0].location.story.binding.ratio=1;
 assert.equal(relationPoint(c.points[0],'story',[],c),9);
});
test('new configured-axis changes default to bound points without modifying legacy locations',()=>{
 let id=0;const state={storyAxis:axis(),cards:{c:card('c',100,point('old',0))}};state.cards.c.points=[];
 editRelation(state,{type:'relation.save',cardId:'c',expectedRevision:1,value:{from:'a',to:'b',name:'友人'}},()=>String(++id));
 assert.deepEqual(state.cards.c.points[0].location.story,{binding:{kind:'card',offset:0}});
 validateRelationPoints(state.cards.c.points,[]);
 state.cards.c.points[0].location.story=27;
 editRelation(state,{type:'relation.save',source:{cardId:'c',revision:2,pointId:'2',changeId:'1'},cardId:'c',pointId:'2',expectedRevision:2,value:{from:'a',to:'b',name:'旧友'}},()=>String(++id));
 assert.equal(state.cards.c.points[0].location.story,27);
});
test('dropped and unplaced binding points are excluded or pending, proof review survives',()=>{
 const cards={c:card('c',10,point('p',0,{...proof,contentHash:'old'}))};
 assert.equal(relationSnapshot(cards,[],chapters,'story',100).relations.length,0);
 delete cards.c.time.story;
 assert.equal(relationSnapshot(cards,[],chapters,'story',100).undated.length,1);
 cards.c.status='dropped';assert.equal(relationSnapshot(cards,[],chapters,'story',100).undated.length,0);
});
const project=state=>({title:'作品',volumes:{},chapters:{},story:{state,history:[],redo:[]}});
const maps=()=>({story:new Map([['c','new-c']]),volumes:new Map(),chapters:new Map(),nodes:new Map(),foreshadows:new Map()});
test('copy retains axis calendar, markers, independent track identities and bound point data',()=>{
 const s=emptyWorkspace();s.storyAxis=axis();s.cards.c=card('c',7,point('p',1));s.cards.c.time.story.trackId='st';
 const target=project(emptyWorkspace());copyStory(project(s),target,maps());const out=target.story.state;
 assert.deepEqual(out.storyAxis.calendar,s.storyAxis.calendar);
 assert.equal(out.storyAxis.markers[0].coordinate,-2191455000000);
 assert.notEqual(out.storyAxis.markers[0].id,'m');
 assert.equal(out.cards['new-c'].time.story.trackId,out.storyAxis.tracks[0].id);
 assert.deepEqual(out.cards['new-c'].points[0].location.story,{binding:{kind:'card',offset:1}});
 assert.equal(target.story.history.length,1);
 assert.equal(target.story.history[0].state.storyAxis,undefined);
});
test('incompatible axis merge rejects before mutation; display tick does not change domain',()=>{
 const a=axis(),b=axis();b.primaryTick={unit:'day',step:1};assert.equal(storyAxisCompatible(a,b),true);
 b.calendar={kind:'custom',name:'星历',monthLengths:[30]};assert.equal(storyAxisCompatible(a,b),false);
 const s=emptyWorkspace();s.storyAxis=a;const t=emptyWorkspace();t.storyAxis=b;
 const target=project(t),before=structuredClone(target);
 assert.throws(()=>copyStory(project(s),target,maps()),{code:'STORY_AXIS_INCOMPATIBLE'});
 assert.deepEqual(target,before);
});
test('partial package retains story axis settings, free markers and track IDs exactly',async()=>{
 const {selectStoryPackage}=await import('../src/domain/story-package.js');
 const state=emptyWorkspace();state.storyAxis=axis();state.cards.c=card('c',2,point('p',0));
 state.cards.c.time.story.trackId='st';state.pages[0].instances['card:c']={x:0,y:0};
 const original={...project(state),nodes:{},edges:{},memoryGroups:{}};
 const before=structuredClone(original);
 const {projects}=selectStoryPackage(original,{pageIds:['main'],includeDependencies:false});
 assert.deepEqual(projects[0].story.state.storyAxis,before.story.state.storyAxis);
 assert.equal(projects[0].story.state.cards.c.time.story.trackId,'st');
 assert.deepEqual(original,before);
});
test('card bound chronology stable at ties, tracks and ranges resolve card offsets',()=>{
 const a=card('a',-100,point('p1',1)),b=card('b',-100,point('p2',1));
 assert.deepEqual(relationSnapshot({b,a},[],chapters,'story',0).changes.map(c=>c.cardId),['a','b']);
 assert.deepEqual(relationSnapshot({a,b},[],chapters,'story',0).changes.map(c=>c.cardId),['a','b']);
 assert.deepEqual(relationRange({a,b},chapters,'story'),{origin:-100,count:8});
});
test('configured-axis snapshots never reinterpret legacy coordinates as dates',()=>{
 const c=card('c',5,point('p',0));c.points.push({id:'legacy',location:{story:2},relationships:[{id:'old',from:'a',to:'b',name:'旧坐标'}]});
 const current=relationSnapshot({c},[],chapters,'story',10,true,{storyAxis:axis()});
 assert.equal(current.changes.length,1);assert.equal(current.undated.length,1);
 assert.equal(current.undated[0].pointId,'legacy');
 assert.equal(relationSnapshot({c},[],chapters,'story',10).changes.length,2);
});
test('copyInto rejects incompatible axes before copying unrelated chapter or graph content',async()=>{
 const {copyInto}=await import('../src/application/transfer/copy.ts');
 const s=emptyWorkspace(),t=emptyWorkspace();s.storyAxis=axis();t.storyAxis={...axis(),calendar:{kind:'custom',name:'星历',monthLengths:[30]}};
 const source={...project(s),chapters:{secret:{id:'secret',title:'不应复制'}},nodes:{},edges:{}},target={...project(t),nodes:{},edges:{}};
 const before=structuredClone(target);
 assert.throws(()=>copyInto(source,target,{}),{code:'STORY_AXIS_INCOMPATIBLE'});
 assert.deepEqual(target,before);
});
test('calendar display labels, era, visibility and anchor labels are not time-domain changes',()=>{
 const a=axis(),b=axis();b.calendar.name='另一种显示名';b.calendar.era='元纪';b.calendar.visibility={year:true,month:false,day:false};b.anchor.label='开篇';b.anchor.chapterId='new';
 assert.equal(storyAxisCompatible(a,b),true);
 b.anchor.coordinate=1;assert.equal(storyAxisCompatible(a,b),false);
 a.calendar={kind:'custom',name:'A',monthLengths:[20,30]};b.calendar={kind:'custom',name:'B',monthLengths:[25,25]};b.anchor.coordinate=0;
 assert.equal(storyAxisCompatible(a,b),false);
});
test('Partial exports and copies detach excluded anchor chapter but preserve conceptual date',async()=>{
 const {selectStoryPackage}=await import('../src/domain/story-package.js');const state=emptyWorkspace();state.storyAxis=axis();state.storyAxis.anchor.chapterId='omitted';const original={...project(state),chapters:{omitted:{id:'omitted',title:'第一章',versions:[]}},nodes:{},edges:{},memoryGroups:{}};
 const selected=selectStoryPackage(original,{pageIds:['main'],includeDependencies:false}).projects[0];const expected=structuredClone(state.storyAxis.anchor);delete expected.chapterId;assert.deepEqual(selected.story.state.storyAxis.anchor,expected);assert.equal(original.story.state.storyAxis.anchor.chapterId,'omitted');
 const target=project(emptyWorkspace());copyStory(original,target,maps());assert.deepEqual(target.story.state.storyAxis.anchor,expected);
 const mappedTarget=project(emptyWorkspace()),mapping=maps();mapping.chapters.set('omitted','new-chapter');copyStory(original,mappedTarget,mapping);assert.equal(mappedTarget.story.state.storyAxis.anchor.chapterId,'new-chapter');
});
test('Plot-card anchor copy remaps identity; partial export detaches excluded card without changing date or label',async()=>{
 const {selectStoryPackage}=await import('../src/domain/story-package.js');const state=emptyWorkspace();state.storyAxis=axis();state.storyAxis.anchor.cardId='c';state.cards.c=card('c',7,point('p',1));state.cards.c.time.story.trackId='st';
 const original={...project(state),nodes:{},edges:{},memoryGroups:{}};const target=project(emptyWorkspace());copyStory(original,target,maps());assert.equal(target.story.state.storyAxis.anchor.cardId,'new-c');assert.deepEqual(target.story.state.storyAxis.anchor.date,state.storyAxis.anchor.date);assert.equal(target.story.state.storyAxis.anchor.label,state.storyAxis.anchor.label);
 const excluded=selectStoryPackage(original,{pageIds:['main'],includeDependencies:false}).projects[0];assert.equal(excluded.story.state.storyAxis.anchor.cardId,undefined);assert.deepEqual(excluded.story.state.storyAxis.anchor.date,state.storyAxis.anchor.date);
 const whole=selectStoryPackage(original,{includeDependencies:false}).projects[0];assert.equal(whole.story.state.storyAxis.anchor.cardId,'c');assert.equal(original.story.state.storyAxis.anchor.cardId,'c');
});
