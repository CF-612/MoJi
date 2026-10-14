import {useDialog} from '../dialog.tsx';
import {sharedLayoutQueue} from './layout-queue.mjs';
import {useDialog} from '../dialog.tsx';
import {sharedLayoutQueue} from './layout-queue.mjs';
import React,{useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {SessionScope,readLocal} from './state.js';
import {CARD_WIDTH,CARD_HEIGHT,PORT_Y,contains,intersects,fitCamera,toWorld,zoomAt,curve} from './graph-geometry.ts';
import type {Camera,Rect} from './graph-geometry.ts';
import type {Point} from '../../contracts/planning.ts';
export {CARD_WIDTH,CARD_HEIGHT,PORT_Y,curve};
type Side='in'|'out';
interface Link {from:string;to:string;type?:string}
export interface GraphNode {id:string;revision:number;position?:Point|null;width?:number;height?:number;kind?:string;moveContents?:boolean}
export interface GraphHit {kind:'blank'|'node'|'decoration'|'edge'|'port';id?:string;side?:Side}
export interface GraphContext {x:number;y:number;point:Point;hit:GraphHit;selected:string[]}
interface Options {
  nodes:GraphNode[];edges:Link[];fallback:Record<string,Point>;busy:boolean;scopeKey:string;
  visibleIds?:string[];acyclic?:boolean;
  onLayout:(points:Record<string,Point>,revisions?:Record<string,number>,requestId?:string)=>Promise<boolean|undefined>;
  onConnect:(from:string,to:string)=>Promise<boolean|undefined>;
  onContext?:(context:GraphContext)=>void;
  onCreateConnected?:(id:string,side:Side,point:Point)=>void;
  onFrame?:(ids:string[])=>void;
}
interface Wire {id:string;side:Side;point:Point;target:string|null}
interface LayoutChange {before:Record<string,Point>;after:Record<string,Point>;revisions:Record<string,number>;requestId?:string}
type Gesture=
 | {kind:'card';pointer:number;start:Point;moved:boolean;ids:string[];before:Record<string,Point>;revisions:Record<string,number>;persist:Options['onLayout']}
 | {kind:'wire';pointer:number;start:Point;moved:boolean}
 | {kind:'pan';pointer:number;start:Point;moved:boolean;before:Camera;button:number;hit:GraphHit}
 | {kind:'lasso';pointer:number;start:Point;moved:boolean;append:string[]};

export function canJoin(edges:Link[],from:string,to:string,acyclic=false){
  if(from===to||edges.some(e=>e.from===from&&e.to===to))return false;
  if(!acyclic)return true;
  const seen=new Set<string>(),pending=[to];
  while(pending.length){const id=pending.pop()!;if(id===from)return false;if(seen.has(id))continue;seen.add(id);for(const e of edges)if(e.from===id&&e.type!=='requires')pending.push(e.to);}
  return true;
}
export function GraphStatus({graph,busy}:{graph:ReturnType<typeof useGraph>;busy:boolean}){
  if(graph.failed)return <span className="graph-save-error" role="alert">{graph.error||'布局未保存'}<button disabled={busy||graph.saving||graph.layoutSaving} onClick={graph.retry}>重试</button>{graph.layoutConflict&&<button disabled={busy||graph.saving||graph.layoutSaving} onClick={graph.rebase}>保留目标，核对后重存</button>}<button disabled={busy||graph.saving||graph.layoutSaving} onClick={graph.discard}>放弃位置草稿</button></span>;
  if(graph.error)return <small role="alert">{graph.error}</small>;
  if(graph.saving)return <small role="status">正在保存连线…</small>;
  if(graph.pending)return <small role="status" className="muted">{graph.layoutSaving?'布局后台保存中':'布局待保存 · 暂停拖动后自动保存'}</small>;
  if(graph.wire)return <small role="status">连接到另一张卡片，或拖到空白新建 · Esc 取消</small>;
  return null;
}
export function GraphControls({graph,busy}:{graph:ReturnType<typeof useGraph>;busy:boolean}){
  return <><div className="graph-view-controls"><button aria-label="适应视图" onClick={()=>graph.fit()}>适应</button><button className="touch-zoom" aria-label="缩小画布" onClick={()=>graph.zoomTo(graph.zoom/1.2)}>−</button><button aria-label="恢复百分之百缩放" onClick={()=>graph.zoomTo(1)}>{Math.round(graph.zoom*100)}%</button><button className="touch-zoom" aria-label="放大画布" onClick={()=>graph.zoomTo(graph.zoom*1.2)}>＋</button><span className="graph-control-divider" aria-hidden="true"/><button aria-label="撤销布局" title="撤销布局 · Ctrl+Z" disabled={busy||graph.saving||graph.failed||!graph.canUndo} onClick={()=>graph.undo()}>↶</button><button aria-label="重做布局" title="重做布局 · Ctrl+Y" disabled={busy||graph.saving||graph.failed||!graph.canRedo} onClick={()=>graph.redo()}>↷</button><button aria-label="整理布局" disabled={busy||graph.saving||graph.failed} onClick={()=>graph.arrange(graph.fallback)}>整理</button></div><details className="graph-help"><summary>操作</summary><div><p>触屏：单指平移 · 双指缩放 · 点卡片打开</p><p>右键拖动平移 · 滚轮缩放</p><p>单击选择 · 双击打开内容</p><p>拖动空白框选 · Shift 追加选择</p><p>拖动圆点连线 · 右键查看操作</p><p>C 创建讨论框 · Esc 取消</p><p>Home 适应 · Ctrl+Z / Ctrl+Y 撤销、重做布局</p></div></details><div className="graph-status"><GraphStatus graph={graph} busy={busy}/></div></>;
}

/** One world coordinate system. Viewport changes are local preferences, never novel edits. */
export function useGraph(options:Options){
  const {confirm}=useDialog();
  const opts=useRef(options);opts.current=options;
  const scope=useContext(SessionScope),storageKey=`cuigengji:camera:${scope}:${options.scopeKey}`;
  const saved=useRef(readLocal(storageKey,null));
  const validSaved=saved.current&&[saved.current.x,saved.current.y,saved.current.zoom].every(Number.isFinite)&&saved.current.zoom>=.35&&saved.current.zoom<=1.8;
  const [camera,setCamera]=useState<Camera>(validSaved?saved.current:{x:0,y:0,zoom:1});
  const cameraRef=useRef(camera);cameraRef.current=camera;
  const scroll=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null);
  const [local,setLocalState]=useState<Record<string,Point>>({}),localRef=useRef(local);localRef.current=local;
  const [selected,setSelectedState]=useState<string[]>([]),selection=useRef(selected);selection.current=selected;
  const [selectedEdge,setSelectedEdge]=useState<string|null>(null),[wire,setWire]=useState<Wire|null>(null),wireRef=useRef(wire);
  const [lasso,setLasso]=useState<Rect|null>(null),[dragging,setDragging]=useState(false),[saving,setSaving]=useState(false),[failed,setFailed]=useState(false),[error,setError]=useState('');
  const [awaitingLink,setAwaitingLink]=useState<Link|null>(null);
  const gesture=useRef<Gesture|null>(null),locked=useRef(false),suppress=useRef(false),rightEnd=useRef(0),space=useRef(false);
  const touches=useRef(new Map<number,Point>()),pinch=useRef<{before:Camera;center:Point;distance:number}|null>(null);
  const touchOpen=useRef(new Map<string,()=>void>());
  const editable=(target:EventTarget|null)=>target instanceof Element&&!!target.closest('input,textarea,select,[contenteditable=true],[data-graph-editor]');
  const touchPair=()=>{const [a,b]=[...touches.current.values()];return a&&b?{center:relative((a.x+b.x)/2,(a.y+b.y)/2),distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))}:null;};
  const layoutKey=storageKey+':draft';
  const queue=sharedLayoutQueue(layoutKey,{persist:options.onLayout,read:()=>readLocal(layoutKey,null),write:value=>{if(Object.keys(value.pending).length||value.flight)localStorage.setItem(layoutKey,JSON.stringify(value));else localStorage.removeItem(layoutKey);}});
  const [layoutStatus,setLayoutStatus]=useState(()=>queue.snapshot());
  useEffect(()=>queue.subscribe(next=>{setLayoutStatus(next);setFailed(!!next.error);setError(next.error);const overlay=queue.points();const g=gesture.current;if(g?.kind==='card'&&g.moved)for(const id of g.ids)overlay[id]=localRef.current[id];if(JSON.stringify(localRef.current)!==JSON.stringify(overlay))setLocal(overlay);}),[queue]);
  useEffect(()=>{queue.sync(options.nodes);const overlay=queue.points();const g=gesture.current;if(g?.kind==='card'&&g.moved)for(const id of g.ids)overlay[id]=localRef.current[id];if(JSON.stringify(localRef.current)!==JSON.stringify(overlay))setLocal(overlay);},[options.nodes,queue]);
  useEffect(()=>{const hidden=()=>{if(document.hidden)void queue.flush();},leave=(e:BeforeUnloadEvent)=>{if(queue.snapshot().dirty){e.preventDefault();e.returnValue='';}};document.addEventListener('visibilitychange',hidden);window.addEventListener('beforeunload',leave);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('beforeunload',leave);void queue.flush();};},[queue]);
  const undoStack=useRef<LayoutChange[]>([]),redoStack=useRef<LayoutChange[]>([]),[,historyTick]=useState(0);
  const points=Object.fromEntries(options.nodes.map(n=>[n.id,local[n.id]||n.position||options.fallback[n.id]||{x:40,y:60}]));
  const pointsRef=useRef(points);pointsRef.current=points;
  const setLocal=(next:Record<string,Point>)=>{localRef.current=next;setLocalState(next);};
  const select=(ids:string[])=>{selection.current=ids;setSelectedState(ids);setSelectedEdge(null);};
  const chooseEdge=(id:string|null)=>{selection.current=[];setSelectedState([]);setSelectedEdge(id);};
  const updateWire=(next:Wire|null)=>{wireRef.current=next;setWire(next);};
  const rememberCamera=(next=cameraRef.current)=>{try{localStorage.setItem(storageKey,JSON.stringify(next));}catch{}};
  const updateCamera=(next:Camera,persist=false)=>{cameraRef.current=next;setCamera(next);if(persist)rememberCamera(next);};
  const relative=(x:number,y:number):Point=>{const r=scroll.current!.getBoundingClientRect();return{x:x-r.left,y:y-r.top};};
  const clientPoint=(x:number,y:number)=>toWorld(relative(x,y),cameraRef.current);
  const centerPoint=()=>toWorld({x:(scroll.current?.clientWidth||800)/2,y:(scroll.current?.clientHeight||450)/2},cameraRef.current);
  const bounds=(id:string):Rect=>{const node=opts.current.nodes.find(n=>n.id===id)!;return {...pointsRef.current[id],width:node.width||CARD_WIDTH,height:node.height||CARD_HEIGHT};};
  const visible=()=>opts.current.visibleIds??opts.current.nodes.map(n=>n.id);
  const endpoint=(id:string,side:Side):Point=>({x:pointsRef.current[id].x+(side==='out'?CARD_WIDTH:0),y:pointsRef.current[id].y+PORT_Y});
  const valid=(id:string,side:Side)=>{const current=wireRef.current;if(!current||current.side===side)return false;const [from,to]=current.side==='out'?[current.id,id]:[id,current.id];return canJoin(opts.current.edges,from,to,opts.current.acyclic);};
  const targetAt=(x:number,y:number)=>{const port=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-graph-port]');if(!port||!surface.current?.contains(port))return null;return valid(port.dataset.nodeId!,port.dataset.graphPort as Side)?port.dataset.nodeId!:null;};
  const hitAt=(target:EventTarget|null):GraphHit=>{
    const element=target instanceof Element?target:null,port=element?.closest<HTMLElement>('[data-graph-port]');
    if(port)return {kind:'port',id:port.dataset.nodeId,side:port.dataset.graphPort as Side};
    const edge=element?.closest<HTMLElement>('[data-edge-id]');if(edge)return {kind:'edge',id:edge.dataset.edgeId};
    const decoration=element?.closest<HTMLElement>('[data-decoration-id]');if(decoration)return {kind:'decoration',id:decoration.dataset.decorationId};
    const node=element?.closest<HTMLElement>('[data-node-id]');return node?{kind:'node',id:node.dataset.nodeId}:{kind:'blank'};
  };
  const context=(x:number,y:number,hit:GraphHit)=>{if(opts.current.busy||locked.current)return;if((hit.kind==='node'||hit.kind==='decoration')&&!selection.current.includes(hit.id!))select([hit.id!]);if(hit.kind==='edge')chooseEdge(hit.id!);opts.current.onContext?.({x,y,point:clientPoint(x,y),hit,selected:selection.current});};
  const cancel=()=>{touches.current.clear();pinch.current=null;const g=gesture.current;if(g?.kind==='card'&&g.moved){const next={...localRef.current};for(const id of g.ids)next[id]=g.before[id];setLocal(next);suppress.current=true;}if(g?.kind==='pan')updateCamera(g.before);gesture.current=null;updateWire(null);setDragging(false);setLasso(null);};
  const fit=(persist=true)=>{const el=scroll.current;if(!el)return;const ids=visible().filter(id=>pointsRef.current[id]),chosen=ids.filter(id=>selection.current.includes(id));const next=fitCamera((chosen.length?chosen:ids).map(bounds),el.clientWidth,el.clientHeight);if(next)updateCamera(next,persist);};
  const zoomTo=(next:number,anchor?:Point)=>{const el=scroll.current;if(!el||gesture.current)return;updateCamera(zoomAt(cameraRef.current,next,anchor||{x:el.clientWidth/2,y:el.clientHeight/2}),true);};
  const fitted=useRef(Boolean(validSaved));
  const ensureVisible=(point:Point,width:number,height:number)=>{
    const el=scroll.current;if(!el)return;fitted.current=true;
    const c=cameraRef.current,left=point.x*c.zoom+c.x,top=point.y*c.zoom+c.y;
    const right=left+width*c.zoom,bottom=top+height*c.zoom,margin=16;
    const dx=left<margin?margin-left:right>el.clientWidth-margin?el.clientWidth-margin-right:0;
    const dy=top<margin?margin-top:bottom>el.clientHeight-margin?el.clientHeight-margin-bottom:0;
    if(dx||dy)updateCamera({...c,x:c.x+dx,y:c.y+dy},true);
  };
  useLayoutEffect(()=>{const el=scroll.current;if(!el)return;let size={width:0,height:0};const observer=new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;if(!fitted.current&&opts.current.nodes.length){fit();fitted.current=true;}else if(size.width&&size.height){const c=cameraRef.current;updateCamera({...c,x:c.x+(el.clientWidth-size.width)/2,y:c.y+(el.clientHeight-size.height)/2},true);}size={width:el.clientWidth,height:el.clientHeight};});observer.observe(el);return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!fitted.current&&options.nodes.length&&scroll.current?.clientWidth){fit();fitted.current=true;}const ids=new Set(options.nodes.map(n=>n.id)),kept=selection.current.filter(id=>ids.has(id));if(kept.length!==selection.current.length)select(kept);if(wireRef.current&&!ids.has(wireRef.current.id))updateWire(null);},[options.nodes]);
  useEffect(()=>()=>rememberCamera(),[]);
  useEffect(()=>{if(awaitingLink&&options.edges.some(e=>e.from===awaitingLink.from&&e.to===awaitingLink.to)){setAwaitingLink(null);locked.current=false;}},[options.edges,awaitingLink]);
  const save=async(change:LayoutChange,_persist=opts.current.onLayout)=>{
    queue.enqueue(change.after,change.revisions);undoStack.current.push(change);undoStack.current=undoStack.current.slice(-50);redoStack.current=[];historyTick(n=>n+1);return true;
  };
  const history=async(redo=false)=>{
    if(locked.current||opts.current.busy||failed)return;const source=redo?redoStack.current:undoStack.current,target=redo?undoStack.current:redoStack.current,entry=source.at(-1);if(!entry)return;
    const after=redo?entry.after:entry.before;queue.enqueue(after,Object.fromEntries(Object.keys(after).map(id=>[id,opts.current.nodes.find(n=>n.id===id)?.revision])));source.pop();target.push(entry);historyTick(n=>n+1);
  };
  const connect=async(target:string)=>{const current=wireRef.current;if(!current||locked.current||opts.current.busy)return;if(!await queue.flush())return;const [from,to]=current.side==='out'?[current.id,target]:[target,current.id];updateWire(null);locked.current=true;setSaving(true);let ok=false;try{ok=await opts.current.onConnect(from,to)===true;if(ok)setAwaitingLink({from,to});}catch{/* Parent reports the failed RPC. */}finally{if(!ok)locked.current=false;setSaving(false);}};
  const cardProps=(id:string,open:()=>void):React.HTMLAttributes<HTMLElement>=>(touchOpen.current.set(id,open),{
    onPointerDown:e=>{if(e.pointerType==='touch'||editable(e.target)||e.button!==0||opts.current.busy||locked.current||wireRef.current||space.current||(e.target as HTMLElement).closest('[data-graph-port],.decoration-resize'))return;const node=opts.current.nodes.find(n=>n.id===id);if(!node)return;suppress.current=false;let ids=selection.current.includes(id)?[...selection.current]:[id];if(node.kind==='frame'&&node.moveContents){const box=bounds(id);ids=[...new Set([...ids,...opts.current.nodes.filter(n=>n.id!==id&&n.kind!=='frame'&&contains(box,bounds(n.id))).map(n=>n.id)])];}gesture.current={kind:'card',pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},moved:false,ids,before:Object.fromEntries(ids.map(key=>[key,{...pointsRef.current[key]}])),revisions:Object.fromEntries(ids.map(key=>[key,opts.current.nodes.find(n=>n.id===key)!.revision])),persist:opts.current.onLayout};},
    onClickCapture:e=>{if(!editable(e.target)&&suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false;}},
    onClick:e=>{if((e.target as HTMLElement).closest('[data-graph-port],.decoration-resize')||opts.current.busy||locked.current)return;if(e.detail===0){void queue.flush().then(ok=>{if(ok)open();});return;}const append=e.shiftKey||e.ctrlKey||e.metaKey;select(append?(selection.current.includes(id)?selection.current.filter(v=>v!==id):[...selection.current,id]):[id]);},
    onDoubleClick:e=>{if(editable(e.target)||(e.target as HTMLElement).closest('[data-graph-port],.decoration-resize')||opts.current.busy||locked.current)return;e.preventDefault();void queue.flush().then(ok=>{if(ok)open();});},
  });
  const portProps=(id:string,side:Side,name:string):React.ButtonHTMLAttributes<HTMLButtonElement>&{'data-graph-port':Side;'data-node-id':string}=>({
    'data-graph-port':side,'data-node-id':id,type:'button','aria-label':`${name}：${side==='out'?'输出':'输入'}连接点`,disabled:options.busy||saving||awaitingLink!==null||failed,className:`graph-port port-${side} ${wire?(valid(id,side)?'port-valid':wire.id===id?'port-source':'port-unavailable'):''} ${wire?.target===id&&valid(id,side)?'port-target':''}`,
    onPointerDown:e=>{if(e.button!==0)return;e.stopPropagation();e.preventDefault();scroll.current?.focus({preventScroll:true});suppress.current=false;if(wireRef.current){if(valid(id,side))void connect(id);else updateWire(null);return;}setSelectedEdge(null);updateWire({id,side,point:endpoint(id,side),target:null});gesture.current={kind:'wire',pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},moved:false};e.currentTarget.setPointerCapture(e.pointerId);},
    onClick:e=>{e.stopPropagation();if(e.detail!==0)return;if(wireRef.current){if(valid(id,side))void connect(id);else updateWire(null);}else updateWire({id,side,point:endpoint(id,side),target:null});},
  });
  const down=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(editable(e.target)||(e.target as Element).closest('.graph-view-controls,.graph-help,.graph-status,.canvas-selection-tools')){suppress.current=false;return;}
    if(e.pointerType==='touch'&&!(e.target as Element).closest('[data-graph-port],.decoration-resize')){
      touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);
      const pair=touchPair();if(pair){gesture.current=null;updateWire(null);setLasso(null);suppress.current=true;pinch.current={...pair,before:{...cameraRef.current}};return;}
      gesture.current={kind:'pan',pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},before:{...cameraRef.current},button:0,hit:hitAt(e.target),moved:false};return;
    }
    if(e.button===2||e.button===1||(e.button===0&&space.current)){e.preventDefault();scroll.current?.focus({preventScroll:true});updateWire(null);suppress.current=false;gesture.current={kind:'pan',pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},before:{...cameraRef.current},button:e.button,hit:hitAt(e.target),moved:false};e.currentTarget.setPointerCapture(e.pointerId);return;}
    if(e.button!==0||gesture.current||(e.target as Element).closest('button,summary,.planning-card,[data-graph-drag],.relation-label,.edge-hit,.planning-decoration'))return;
    updateWire(null);setSelectedEdge(null);scroll.current?.focus({preventScroll:true});gesture.current={kind:'lasso',pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},moved:false,append:e.shiftKey?[...selection.current]:[]};e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move=(e:React.PointerEvent)=>{
    if(touches.current.has(e.pointerId))touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const pair=touchPair(),p=pinch.current;
    if(p&&pair){const next=zoomAt(p.before,p.before.zoom*pair.distance/p.distance,p.center);updateCamera({...next,x:next.x+pair.center.x-p.center.x,y:next.y+pair.center.y-p.center.y});setDragging(true);return;}
    const g=gesture.current;if(g&&g.pointer!==e.pointerId)return;
    if(g){const dx=e.clientX-g.start.x,dy=e.clientY-g.start.y;if(!g.moved&&Math.hypot(dx,dy)<5)return;g.moved=true;if(g.kind==='pan'){updateCamera({...g.before,x:g.before.x+dx,y:g.before.y+dy});setDragging(true);return;}
      if(g.kind==='card'){scroll.current?.setPointerCapture(e.pointerId);suppress.current=true;setDragging(true);const next={...localRef.current};for(const id of g.ids)next[id]={x:g.before[id].x+dx/cameraRef.current.zoom,y:g.before[id].y+dy/cameraRef.current.zoom};setLocal(next);return;}
      if(g.kind==='lasso'){const a=relative(g.start.x,g.start.y),b=relative(e.clientX,e.clientY);setLasso({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(b.x-a.x),height:Math.abs(b.y-a.y)});const wa=clientPoint(g.start.x,g.start.y),wb=clientPoint(e.clientX,e.clientY),box={x:Math.min(wa.x,wb.x),y:Math.min(wa.y,wb.y),width:Math.abs(wb.x-wa.x),height:Math.abs(wb.y-wa.y)};select([...new Set([...g.append,...visible().filter(id=>opts.current.nodes.find(n=>n.id===id)?.kind!=='frame'&&intersects(box,bounds(id)))])]);return;}}
    if(wireRef.current)updateWire({...wireRef.current,point:clientPoint(e.clientX,e.clientY),target:targetAt(e.clientX,e.clientY)});
  };
  const up=(e:React.PointerEvent)=>{touches.current.delete(e.pointerId);if(pinch.current){pinch.current=null;gesture.current=null;setDragging(false);rememberCamera();const [pointer,point]=[...touches.current.entries()][0]||[];if(point)gesture.current={kind:'pan',pointer,start:point,before:{...cameraRef.current},button:0,hit:{kind:'blank'},moved:false};return;}const g=gesture.current;if(!g||g.pointer!==e.pointerId)return;gesture.current=null;setDragging(false);setLasso(null);
    if(g.kind==='pan'){if(e.pointerType==='touch'&&!g.moved&&g.hit.id&&!opts.current.busy&&!locked.current){touchOpen.current.get(g.hit.id)?.();suppress.current=true;}if(g.button===2){rightEnd.current=Date.now();if(!g.moved)context(e.clientX,e.clientY,g.hit);}if(g.moved){suppress.current=g.button===0;rememberCamera();}return;}
    if(g.kind==='card'&&g.moved){select(selection.current.includes(g.ids[0])?selection.current:[g.ids[0]]);void save({before:g.before,after:Object.fromEntries(g.ids.map(id=>[id,localRef.current[id]])),revisions:g.revisions},g.persist);return;}
    if(g.kind==='lasso'&&!g.moved)select(g.append);
    if(g.kind==='wire'&&g.moved){const target=targetAt(e.clientX,e.clientY),current=wireRef.current;if(target)void connect(target);else{updateWire(null);if(current&&!hitAt(document.elementFromPoint(e.clientX,e.clientY)).id)opts.current.onCreateConnected?.(current.id,current.side,clientPoint(e.clientX,e.clientY));}}
  };
  const keyHandler=useRef<(event:KeyboardEvent)=>void>(()=>{});
  keyHandler.current=e=>{const el=scroll.current;if(!el?.offsetWidth||!(el.contains(document.activeElement)||el.contains(e.target as Node)))return;if((e.target as Element).closest('input,textarea,select,[contenteditable=true],[role=menu]'))return;if(e.key==='Escape'){e.preventDefault();cancel();}else if(e.key===' '&&!(e.target as Element).closest('button,summary')){e.preventDefault();space.current=true;}else if(e.key==='Home'){e.preventDefault();fit();}else if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();void history(e.key.toLowerCase()==='y'||e.shiftKey);}else if(e.key.toLowerCase()==='c'&&!e.ctrlKey&&!e.metaKey&&!opts.current.busy)opts.current.onFrame?.(selection.current);};
  useEffect(()=>{const key=(e:KeyboardEvent)=>keyHandler.current(e),release=(e:KeyboardEvent)=>{if(e.key===' ')space.current=false;},blur=()=>{space.current=false;cancel();};window.addEventListener('keydown',key);window.addEventListener('keyup',release);window.addEventListener('blur',blur);return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',release);window.removeEventListener('blur',blur);};},[]);
  useEffect(()=>{const el=scroll.current;if(!el)return;const wheel=(e:WheelEvent)=>{if(!e.deltaY||gesture.current||el.dataset.resizing)return;const target=e.target instanceof Element?e.target:null;if(target?.closest('input,textarea,select,[contenteditable=true],[role=menu],.menu-panel,.graph-help'))return;for(let node=target;node&&node!==el;node=node.parentElement)if(node.scrollHeight>node.clientHeight+1&&/^(auto|scroll)$/.test(getComputedStyle(node).overflowY))return;e.preventDefault();zoomTo(cameraRef.current.zoom*Math.exp(-e.deltaY*.0015),relative(e.clientX,e.clientY));};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);},[]);
  const preview=wire&&points[wire.id]?curve(wire.side==='out'?endpoint(wire.id,'out'):wire.target?endpoint(wire.target,'out'):wire.point,wire.side==='in'?endpoint(wire.id,'in'):wire.target?endpoint(wire.target,'in'):wire.point):null;
  return {scroll,surface,points,camera,zoom:camera.zoom,zoomTo,wire,preview,selected,select,selectedEdge,setSelectedEdge:chooseEdge,portProps,cardProps,saving:saving||awaitingLink!==null,pending:layoutStatus.dirty,layoutSaving:layoutStatus.saving,layoutConflict:layoutStatus.errorCode==='CONFLICT',failed,error,dragging,lasso,centerPoint,clientPoint,fit,fallback:options.fallback,
    ensureVisible,canUndo:undoStack.current.length>0,canRedo:redoStack.current.length>0,undo:()=>history(),redo:()=>history(true),
    worldStyle:{transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.zoom})`,transformOrigin:'0 0'} as React.CSSProperties,
    viewportStyle:{backgroundSize:`${24*camera.zoom}px ${24*camera.zoom}px`,backgroundPosition:`${camera.x}px ${camera.y}px`,'--graph-title-scale':Math.min(2,Math.max(1,.7/camera.zoom))} as React.CSSProperties,
    scrollProps:{onPointerDown:down,onPointerMove:move,onPointerUp:up,onPointerCancel:()=>{touches.current.clear();pinch.current=null;cancel();},onScroll:(e:React.UIEvent<HTMLDivElement>)=>{if(e.currentTarget.scrollLeft||e.currentTarget.scrollTop)e.currentTarget.scrollTo(0,0);},onClickCapture:(e:React.MouseEvent)=>{if(!editable(e.target)&&suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false;}},onContextMenu:(e:React.MouseEvent)=>{if(editable(e.target))return;e.preventDefault();if(gesture.current?.kind==='pan'||Date.now()-rightEnd.current<500)return;context(e.clientX,e.clientY,hitAt(e.target));},tabIndex:0,'aria-label':'画布：单指平移、双指缩放；鼠标右键平移、滚轮缩放'},
    cancel,rebase:async()=>{if(await confirm('保留本地目标坐标，以当前已读取版本重新保存？这会覆盖对应远端坐标，卡片文字保持不变。')){if(queue.rebase(opts.current.nodes))void queue.flush();else setError('相关卡片不存在或已删除，请先核对最新资料。');}},retry:()=>{void queue.retry();},discard:()=>{if(queue.discard()){setLocal({});setFailed(false);setError('');undoStack.current=[];redoStack.current=[];historyTick(n=>n+1);}},
    arrange:(positions:Record<string,Point>)=>{if(options.busy||locked.current||failed)return;const ids=Object.keys(positions).filter(id=>points[id]);if(!ids.length)return;const after=Object.fromEntries(ids.map(id=>[id,positions[id]]));setLocal({...localRef.current,...after});void save({before:Object.fromEntries(ids.map(id=>[id,points[id]])),after,revisions:Object.fromEntries(ids.map(id=>[id,options.nodes.find(n=>n.id===id)!.revision]))});},
  };
}
