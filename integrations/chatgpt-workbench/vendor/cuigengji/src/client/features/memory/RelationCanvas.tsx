import {CanvasExport} from '../../shared/CanvasExport.jsx';
import {relationColors} from '../structure/Timeline.jsx';
import {CardQuickButton} from '../../shared/card-appearance.tsx';
import React,{useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {useGraph,curve,CARD_WIDTH,CARD_HEIGHT,PORT_Y,GraphControls} from '../../shared/graph.tsx';
import type {GraphContext} from '../../shared/graph.tsx';
import {CanvasMenu} from '../planning/CanvasMenu.tsx';
import type {MenuItem} from '../planning/CanvasMenu.tsx';
import type {Point,PlanningGroup} from '../../../contracts/planning.ts';
import {CanvasSelectionTools} from '../../shared/CanvasSelectionTools.tsx';
import {Icon} from '../../shared/icons.tsx';
interface Node {id:string;revision:number;name:string;summary:string;type:string;cardTags?:string[];groupId?:string|null;position?:Point|null;appearanceLabel?:string}
interface Edge {id:string;from:string;to:string;name?:string;content?:string;revision:number;category?:string;style?:string}
interface Props {
  nodes:Node[];allNodes:Node[];edges:Edge[];groups:PlanningGroup[];scopeKey:string;busy:boolean;readOnly?:boolean;
  onQuick:(id:string)=>void;onSelect:(id:string)=>void;onNew:(point:Point,connection?:{id:string;side:'in'|'out'},type?:'character_card'|'world_entry')=>void;
  onConnect:(from:string,to:string)=>Promise<boolean|undefined>;
  onLayout:(points:Record<string,Point>,revisions?:Record<string,number>,requestId?:string)=>Promise<boolean|undefined>;
  onRelation?:(from:string,to:string)=>void;
  onEdit:(edge:Edge)=>void;onDelete:(edges:Edge[])=>Promise<boolean|undefined>;
  onRemove:(ids:string[])=>void;onDuplicate:(ids:string[],points?:Record<string,Point>)=>void;onMove:(ids:string[],groupId:string|null)=>void;
  onReady:(center:()=>Point)=>void;
}
function EdgeLabel({edge,x,y,width,choose,edit,openLabel}:{edge:Edge;x:number;y:number;width:number;choose:()=>void;edit:()=>void;openLabel?:string}){
  const text=useRef<HTMLSpanElement>(null),[expanded,setExpanded]=useState(false),[truncated,setTruncated]=useState(false);
  useLayoutEffect(()=>{const el=text.current;if(el&&!expanded)setTruncated(el.scrollHeight>el.clientHeight+1);},[edge.content,expanded]);
  return <div data-edge-id={edge.id} data-graph-editor={openLabel?true:undefined} className={`relation-label ${openLabel?'has-evolution':''} ${expanded?'expanded':''}`} style={{left:expanded?x-(240-width)/2:x,top:y,width:expanded?240:width}}><button className="edge-label-content" aria-label={openLabel||`选择关系 ${edge.name||edge.content}`} title={openLabel} onClick={choose} onDoubleClick={openLabel?undefined:edit}>{edge.name&&<strong>{edge.name}</strong>}{edge.content&&<span ref={text}>{edge.content}</span>}</button>{openLabel&&<button className="relation-edit-button" aria-label={`编辑关系 ${edge.name||'连线'}`} title="编辑完整关系设定" onClick={edit}><Icon name="edit"/></button>}{(truncated||expanded)&&<button className="expand-edge" onClick={()=>setExpanded(!expanded)}>{expanded?'收起':'展开'}</button>}</div>;
}
export function RelationCanvas(props:Props){
  const {nodes,allNodes,edges,groups,busy,readOnly=false,onSelect,onConnect,onLayout,onEdit,onDelete,onRelation}=props;
  const canEvolve=(edge:Edge)=>!!onRelation&&[edge.from,edge.to].every(id=>allNodes.find(n=>n.id===id)?.type==='character_card');
  const relationLabel=(edge:Edge)=>`查看 ${allNodes.find(n=>n.id===edge.from)?.name}与${allNodes.find(n=>n.id===edge.to)?.name} 的关系演变`;
  const activate=(edge:Edge)=>canEvolve(edge)?onRelation!(edge.from,edge.to):readOnly?onEdit(edge):graph.setSelectedEdge(edge.id);
  const marker=useId(),[menu,setMenu]=useState<(GraphContext&{connection?:{id:string;side:'in'|'out'}})|null>(null);
  const ordered=[...allNodes].sort((a,b)=>(a.groupId||'').localeCompare(b.groupId||'')||a.name.localeCompare(b.name));
  const fallback=Object.fromEntries(ordered.map((n,i)=>[n.id,{x:40+(i%3)*332,y:64+Math.floor(i/3)*230}]));
  const graph=useGraph({nodes:allNodes,edges,fallback,busy:busy||readOnly,scopeKey:props.scopeKey,onLayout,onConnect,visibleIds:nodes.map(n=>n.id),onContext:setMenu,onEdgeOpen:id=>{const edge=edges.find(e=>e.id===id);if(edge)activate(edge);},onCreateConnected:(id,side,point)=>{const rect=graph.scroll.current!.getBoundingClientRect();setMenu({x:rect.left+point.x*graph.zoom+graph.camera.x,y:rect.top+point.y*graph.zoom+graph.camera.y,point,hit:{kind:'blank'},selected:[],connection:{id,side}});}});
  useEffect(()=>{props.onReady(graph.centerPoint);});
  const {points,zoom}=graph,ids=new Set(nodes.map(n=>n.id));
  const visible=edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
  const occupied=nodes.map(n=>({...points[n.id],width:CARD_WIDTH,height:CARD_HEIGHT}));
  const routes=visible.map(edge=>{
    const a=points[edge.from],b=points[edge.to],start={x:a.x+CARD_WIDTH,y:a.y+PORT_Y},end={x:b.x,y:b.y+PORT_Y};
    const width=(edge.content?144:Math.max(60,Math.min(128,(edge.name?.length||0)*12+16)))+(canEvolve(edge)?28:0),height=edge.content?58:24;
    let x=(start.x+end.x)/2-width/2,y=(start.y+end.y)/2-height/2,path=curve(start,end);
    if(edge.name||edge.content){let offset=0;while(offset<6&&occupied.some(r=>x<r.x+r.width+8&&x+width>r.x-8&&y<r.y+r.height+8&&y+height>r.y-8)){offset++;y=(start.y+end.y)/2-height/2-offset*64;}occupied.push({x,y,width,height});if(offset){const mx=x+width/2,my=y+height/2;path=`M${start.x},${start.y} C${start.x+50},${start.y} ${mx-50},${my} ${mx},${my} C${mx+50},${my} ${end.x-50},${end.y} ${end.x},${end.y}`;}}
    return {edge,path,x,y,width};
  });
  const left=Math.min(-200,...occupied.map(r=>r.x-180)),top=Math.min(-200,...occupied.map(r=>r.y-180)),right=Math.max(800,...occupied.map(r=>r.x+r.width+180)),bottom=Math.max(600,...occupied.map(r=>r.y+r.height+180));
  const currentIds=menu?.selected.filter(id=>allNodes.some(n=>n.id===id))||[];
  const edge=menu?.hit.kind==='edge'?edges.find(e=>e.id===menu.hit.id):null;
  const ports=menu?.hit.kind==='port'?edges.filter(e=>menu.hit.side==='out'?e.from===menu.hit.id:e.to===menu.hit.id):[];
  const moveItem:MenuItem={label:'移入分组',children:[{label:'未分组',action:()=>props.onMove(currentIds,null)},...groups.map(g=>({label:g.name,action:()=>props.onMove(currentIds,g.id)}))]};
  const items:MenuItem[]=edge?[...(canEvolve(edge)?[{label:'查看两人演变',action:()=>activate(edge)}]:[]),{label:'编辑关系',action:()=>onEdit(edge)},{label:'断开连线',action:()=>{void onDelete([edge]);},danger:true}]:menu?.hit.kind==='port'?[{label:'断开此连接点的连线',disabled:!ports.length,action:()=>{void onDelete(ports);},danger:true}]:menu?.hit.kind==='node'?[...(currentIds.length===1?[{label:'快捷设置',action:()=>props.onQuick(menu!.hit.id!)},{label:'打开内容',action:()=>onSelect(menu.hit.id!)}]:[]),moveItem,{label:'复制卡片',action:()=>props.onDuplicate(currentIds,points)},{label:currentIds.length>1?`删除 ${currentIds.length} 张卡片`:'删除卡片',action:()=>props.onRemove(currentIds),danger:true}]:[{label:`新建角色卡${menu?.connection?'并连接':''}`,action:()=>props.onNew(menu!.point,menu!.connection,'character_card')},{label:`新建世界书${menu?.connection?'并连接':''}`,action:()=>props.onNew(menu!.point,menu!.connection,'world_entry')}];
  return <><div className="u-subbar"><CanvasExport nodes={nodes} edges={visible} points={points} name="资料关系图"/></div><div ref={graph.scroll} className={`planning-canvas-scroll ${graph.dragging?'graph-dragging':''} ${zoom<.6?'graph-overview':''}`} style={{...graph.viewportStyle,'--relation-control-scale':Math.max(1,1/zoom)} as React.CSSProperties} {...graph.scrollProps} aria-label={readOnly?'剧情资料画布：空白平移、滚轮或双指缩放；点击关系查看历程':'完整资料关系图：点人物连线查看演变；拖卡、连线、空白平移'} onKeyDown={e=>{if(['Delete','Backspace'].includes(e.key)&&!readOnly&&!busy&&!graph.saving&&!graph.failed&&!graph.wire&&!(e.target as HTMLElement).closest('input,textarea,select,[contenteditable=true],summary,.graph-view-controls,.graph-help,.graph-status,[role=menu]')){e.preventDefault();const active=edges.find(v=>v.id===graph.selectedEdge);if(active)void onDelete([active]);else if(graph.selected.length)props.onRemove(graph.selected);}}}>
    <div ref={graph.surface} className="planning-canvas relation-canvas" style={graph.worldStyle}>
      <svg className="planning-lines" style={{left,top,width:right-left,height:bottom-top}} width={right-left} height={bottom-top} viewBox={`${left} ${top} ${right-left} ${bottom-top}`} aria-label="设定关系"><defs><marker id={marker} viewBox="0 0 8 8" markerWidth="6" markerHeight="6" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="currentColor"/></marker></defs>
        {routes.map(({edge,path})=><g key={edge.id} style={{color:relationColors[edge.category||'other']}} className={graph.selectedEdge===edge.id?'edge-selected':''}><path className="graph-line" style={{stroke:relationColors[edge.category||'other'],strokeDasharray:edge.style==='dashed'?'8 5':edge.style==='dotted'?'2 5':undefined}} d={path} markerEnd={`url(#${marker})`}/><path data-edge-id={edge.id} className="edge-hit" style={{strokeWidth:Math.max(16,28/zoom)}} d={path} tabIndex={0} role="button" aria-label={canEvolve(edge)?relationLabel(edge):`关系：${nodes.find(n=>n.id===edge.from)?.name} → ${nodes.find(n=>n.id===edge.to)?.name}`} aria-pressed={graph.selectedEdge===edge.id} onClick={()=>activate(edge)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(edge);}}}/></g>)}
        {graph.preview&&<path className="graph-preview" d={graph.preview}/>}
      </svg>
      {routes.filter(r=>r.edge.name||r.edge.content).map(({edge,x,y,width})=><EdgeLabel key={edge.id} {...{edge,x,y,width}} choose={()=>activate(edge)} openLabel={canEvolve(edge)?relationLabel(edge):undefined} edit={()=>onEdit(edge)}/>)}
      {nodes.map(n=><section key={n.id} data-node-id={n.id} aria-label={n.name} {...(readOnly?{tabIndex:0,onDoubleClick:()=>onSelect(n.id),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'){e.stopPropagation();onSelect(n.id);}}}:graph.cardProps(n.id,()=>onSelect(n.id)))} className={`planning-card setting-card kind-${n.type==='character_card'?'character':'world'} ${graph.selected.includes(n.id)?'selected':''}`} style={{left:points[n.id].x,top:points[n.id].y}}><>{!readOnly&&<><CardQuickButton title={n.name} open={()=>props.onQuick(n.id)} disabled={busy||graph.saving||graph.failed}/><button {...graph.portProps(n.id,'in',n.name)}/><button {...graph.portProps(n.id,'out',n.name)}/></>}</><small className="graph-card-kind"><Icon name={n.type==='character_card'?'person':'world'}/>{n.type==='character_card'?'角色':'世界'}{n.cardTags?.length?' · '+n.cardTags.join(' / '):''}</small><button className="planning-title" title={n.name} onClick={readOnly?()=>onSelect(n.id):undefined}>{n.name}</button><p title={n.summary}>{n.summary||'双击查看设定'}</p>{n.appearanceLabel&&<small className="material-appearance" title={n.appearanceLabel}>{n.appearanceLabel}</small>}</section>)}
    </div>
    {!nodes.length&&<p className="canvas-empty">{readOnly?'此刻还没有资料出场，向后拖动时间查看。':'右键新建角色卡或世界书'}</p>}
    {graph.lasso&&<div className="graph-lasso" style={{left:graph.lasso.x,top:graph.lasso.y,width:graph.lasso.width,height:graph.lasso.height}}/>}
    <>{readOnly?<div className="graph-view-controls"><button aria-label="适应视图" onClick={()=>graph.fit()}>适应</button><button aria-label="缩小画布" onClick={()=>graph.zoomTo(graph.zoom/1.2)}>−</button><button aria-label="恢复百分之百缩放" onClick={()=>graph.zoomTo(1)}>{Math.round(zoom*100)}%</button><button aria-label="放大画布" onClick={()=>graph.zoomTo(graph.zoom*1.2)}>＋</button></div>:<GraphControls graph={graph} busy={busy}/>}</>
    {!readOnly&&!graph.selectedEdge&&!graph.wire&&<CanvasSelectionTools selected={graph.selected.filter(id=>ids.has(id))} nodeIds={graph.selected.filter(id=>ids.has(id))} groups={groups} busy={busy||graph.saving||graph.failed} clear={()=>graph.select([])} move={groupId=>props.onMove(graph.selected.filter(id=>ids.has(id)),groupId)} duplicate={()=>props.onDuplicate(graph.selected.filter(id=>ids.has(id)),points)} remove={()=>props.onRemove(graph.selected.filter(id=>ids.has(id)))}/>}
  </div>{!readOnly&&menu&&<CanvasMenu {...menu} items={items} close={()=>{setMenu(null);graph.scroll.current?.focus({preventScroll:true});}}/>}</>;
}
