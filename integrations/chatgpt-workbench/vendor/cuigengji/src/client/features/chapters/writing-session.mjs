export const WRITING_IDLE_MS=30000,WRITING_PAUSE_MS=20*60*1000;
const count=text=>Array.from(String(text)).filter(char=>!/^\s$/u.test(char)).length;
const snapshot=document=>({content:document.content,sources:document.sources});
function documentState(content){return {content:String(content),sources:'b'.repeat(String(content).length),baseline:count(content),history:[],future:[]};}
export function createWritingSession(){return {documents:{},activeMs:0,idleMs:0,lastInput:null,lastTick:null,suspended:false};}
export function reconcileWritingDocument(session,key,content){
  const previous=session.documents[key];
  if(previous?.content===content)return session;
  return {...session,documents:{...session.documents,[key]:documentState(content)}};
}
export function advanceWritingSession(session,now){
  if(session.lastInput===null||session.lastTick===null||session.suspended)return session;
  now=Math.max(session.lastTick,now);
  const from=session.lastTick,activeEnd=session.lastInput+WRITING_IDLE_MS,pauseAt=session.lastInput+WRITING_PAUSE_MS;
  return {...session,lastTick:now,activeMs:session.activeMs+Math.max(0,Math.min(now,activeEnd)-from),
    idleMs:session.idleMs+Math.max(0,Math.min(now,pauseAt)-Math.max(from,activeEnd))};
}
export function suspendWritingSession(session,now){return {...advanceWritingSession(session,now),suspended:true};}
function changedRange(before,after){
  let start=0,endBefore=before.length,endAfter=after.length;
  while(start<endBefore&&start<endAfter&&before[start]===after[start])start++;
  if(start>0&&/[\uD800-\uDBFF]/.test(before[start-1]))start--;
  while(endBefore>start&&endAfter>start&&before[endBefore-1]===after[endAfter-1]){endBefore--;endAfter--;}
  if(endBefore<before.length&&/[\uDC00-\uDFFF]/.test(before[endBefore])){endBefore++;endAfter++;}
  return {start,endBefore,endAfter};
}
function trimHistory(history){
  let size=0;return history.slice(-30).reverse().filter(item=>{size+=item.content.length;return size<=300000;}).reverse();
}
export function recordWritingEdit(session,{key,before,after,inputType='insertText',now=Date.now()}){
  before=String(before);after=String(after);if(before===after)return session;
  session=advanceWritingSession(reconcileWritingDocument(session,key,before),now);
  const previous=session.documents[key];let document;
  const history=inputType==='historyUndo'?previous.history:inputType==='historyRedo'?previous.future:null;
  const matched=history?.findLastIndex(item=>item.content===after)??-1;
  if(matched>=0){
    const restored=history[matched];
    if(inputType==='historyUndo')document={...previous,...restored,history:history.slice(0,matched),future:trimHistory([...previous.future,snapshot(previous),...history.slice(matched+1).reverse()])};
    else document={...previous,...restored,future:history.slice(0,matched),history:trimHistory([...previous.history,snapshot(previous),...history.slice(matched+1).reverse()])};
  }else{
    const {start,endBefore,endAfter}=changedRange(before,after);
    // Unknown undo/redo and drag/drop are conservatively treated like pasted text.
    const source=/^(insertFromPaste|insertFromDrop|insertReplacementText|history)/.test(inputType)?'p':'t';
    document={...previous,content:after,sources:previous.sources.slice(0,start)+source.repeat(endAfter-start)+previous.sources.slice(endBefore),history:trimHistory([...previous.history,snapshot(previous)]),future:[]};
  }
  return {...session,documents:{...session.documents,[key]:document},lastInput:now,lastTick:now,suspended:false};
}
export function writingMetrics(session,now=Date.now()){
  const advanced=advanceWritingSession(session,now);let net=0,typed=0,pasted=0;
  for(const document of Object.values(advanced.documents)){
    let total=0,paste=0,offset=0;
    for(const char of document.content){if(!/^\s$/u.test(char)){total++;if(document.sources[offset]==='p')paste++;}offset+=char.length;}
    net+=total-document.baseline;typed+=total-document.baseline-paste;pasted+=paste;
  }
  const status=advanced.lastInput===null?'未开始':advanced.suspended||now-advanced.lastInput>=WRITING_PAUSE_MS?'已暂停':now-advanced.lastInput>=WRITING_IDLE_MS?'空闲':'写作中';
  return {net:Math.max(0,net),typed:Math.max(0,typed),pasted,activeMs:advanced.activeMs,idleMs:advanced.idleMs,status,
    // A one-minute floor prevents absurd speed during the first few keystrokes.
    perMinute:Math.round(Math.max(0,typed)/Math.max(1,advanced.activeMs/60000))};
}
export function writingDuration(ms){const seconds=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
