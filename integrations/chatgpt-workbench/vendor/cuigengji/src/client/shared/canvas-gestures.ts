import type {Point} from '../../contracts/planning.ts';
import type {Rect} from './graph-geometry.ts';
import {intersects} from './graph-geometry.ts';
/** Desktop blank gestures; touch keeps the existing left-drag selection contract. */
export function canvasGestureKind(button:number,pointerType:string,blank:boolean,space=false):'pan'|'marquee'|null {
  if(button===1||(button===0&&space))return 'pan';
  if(!blank)return null;
  if(button===2&&pointerType!=='touch')return 'marquee';
  if(button===0)return pointerType==='touch'?'marquee':'pan';
  return null;
}
export const dragExceeded=(a:Point,b:Point,threshold=5)=>Math.hypot(b.x-a.x,b.y-a.y)>=threshold;
export const marqueeRect=(a:Point,b:Point):Rect=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)});
export const intersectingIds=(rect:Rect,items:{id:string;bounds:Rect}[])=>items.filter(item=>intersects(rect,item.bounds)).map(item=>item.id);
export const appendSelection=(ids:string[],append:string[])=>[...new Set([...append,...ids])];
export const isAdditiveSelection=(event:{shiftKey:boolean;ctrlKey:boolean;metaKey:boolean})=>event.shiftKey||event.ctrlKey||event.metaKey;
