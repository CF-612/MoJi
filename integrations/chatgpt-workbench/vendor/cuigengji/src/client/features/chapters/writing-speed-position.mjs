const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
/** Intersect the editor's content viewport with this frame's visible viewport. */
export function writingSpeedBounds(editor,viewport,panel={width:216,height:92},position={x:1,y:0}){
 const left=Math.max(editor.left,viewport.left)+8,top=Math.max(editor.top,viewport.top)+8;
 const width=Math.max(0,Math.min(editor.right,viewport.right)-left-8),height=Math.max(0,Math.min(editor.bottom,viewport.bottom)-top-8);
 const travelX=Math.max(0,width-panel.width),travelY=Math.max(0,height-panel.height);
 return {left:left+clamp(position.x,0,1)*travelX,top:top+clamp(position.y,0,1)*travelY,width,height,travelX,travelY,visible:width>=120&&height>=64};
}
export function moveWritingSpeed(position,delta,bounds){return {x:bounds.travelX?clamp(position.x+delta.x/bounds.travelX,0,1):0,y:bounds.travelY?clamp(position.y+delta.y/bounds.travelY,0,1):0};}
