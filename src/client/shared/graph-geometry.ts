import type {Point} from '../../contracts/planning.ts';
export interface Camera extends Point {zoom:number}
export interface Rect extends Point {width:number;height:number}
export const CARD_WIDTH=248, CARD_HEIGHT=168, PORT_Y=36;
// Manual zoom normally stops at 10%; large outlines may go lower to fit.
// The absolute floor protects transforms/hit targets from corrupt saved cameras.
// Below 60%, a 248×168 card is smaller than 149×101 screen px: prioritize moving it.
export const CONNECTION_MIN_ZOOM=.6;
export const connectionPortsEnabled=(zoom:number)=>Number.isFinite(zoom)&&zoom>=CONNECTION_MIN_ZOOM;
export const connectionHitScale=(zoom:number)=>1/Math.max(CONNECTION_MIN_ZOOM,Number.isFinite(zoom)?zoom:1);
export const MIN_ZOOM=.0001, DEFAULT_MIN_ZOOM=.1, MAX_ZOOM=1.8;
export const clampZoom=(zoom:number,minZoom=DEFAULT_MIN_ZOOM)=>Math.max(Math.max(MIN_ZOOM,Math.min(DEFAULT_MIN_ZOOM,minZoom)),Math.min(MAX_ZOOM,Number.isNaN(zoom)?1:zoom));
export const validCamera=(value:any):value is Camera=>!!value&&[value.x,value.y,value.zoom].every(Number.isFinite)&&value.zoom>=MIN_ZOOM&&value.zoom<=MAX_ZOOM;
export const zoomLabel=(zoom:number)=>zoom<.01?Number((zoom*100).toFixed(2)):Math.round(zoom*100);
export const toWorld=(point:Point,camera:Camera):Point=>({x:(point.x-camera.x)/camera.zoom,y:(point.y-camera.y)/camera.zoom});
export const toScreen=(point:Point,camera:Camera):Point=>({x:point.x*camera.zoom+camera.x,y:point.y*camera.zoom+camera.y});
export function zoomAt(camera:Camera,zoom:number,anchor:Point,minZoom=DEFAULT_MIN_ZOOM):Camera {const world=toWorld(anchor,camera),next=clampZoom(zoom,minZoom);return {x:anchor.x-world.x*next,y:anchor.y-world.y*next,zoom:next};}
export const contains=(outer:Rect,inner:Rect)=>inner.x>=outer.x&&inner.y>=outer.y&&inner.x+inner.width<=outer.x+outer.width&&inner.y+inner.height<=outer.y+outer.height;
export const intersects=(a:Rect,b:Rect)=>a.x<=b.x+b.width&&a.x+a.width>=b.x&&a.y<=b.y+b.height&&a.y+a.height>=b.y;
export function fitCamera(rects:Rect[],width:number,height:number):Camera|null {
  if(!rects.length||width<=0||height<=0)return null;
  const left=Math.min(...rects.map(r=>r.x)),top=Math.min(...rects.map(r=>r.y));
  const right=Math.max(...rects.map(r=>r.x+r.width)),bottom=Math.max(...rects.map(r=>r.y+r.height));
  const zoom=clampZoom(Math.min(1,Math.max(1,width-64)/Math.max(1,right-left),Math.max(1,height-80)/Math.max(1,bottom-top)),MIN_ZOOM);
  return {zoom,x:width<600?Math.min(24,width/4)-left*zoom:(width-(right-left)*zoom)/2-left*zoom,y:(height-(bottom-top)*zoom)/2-top*zoom};
}
export function minimumZoom(rects:Rect[],width:number,height:number):number {
  return Math.min(DEFAULT_MIN_ZOOM,fitCamera(rects,width,height)?.zoom??DEFAULT_MIN_ZOOM);
}
export function curve(from:Point,to:Point){const reach=Math.max(50,Math.abs(to.x-from.x)*.42);return `M${from.x},${from.y} C${from.x+reach},${from.y} ${to.x-reach},${to.y} ${to.x},${to.y}`;}
