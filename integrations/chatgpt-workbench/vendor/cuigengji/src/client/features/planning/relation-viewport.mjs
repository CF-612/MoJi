export const clampRelationZoom=z=>Math.max(.35,Math.min(5,z));
// SVG uses xMidYMid meet, so account for both scale and letterboxing.
export function relationPoint(rect,x,y){const scale=Math.min(rect.width/460,rect.height/340)||1;return {x:(x-rect.left-(rect.width-460*scale)/2)/scale,y:(y-rect.top-(rect.height-340*scale)/2)/scale};}
export function zoomRelation(view,next,point={x:230,y:170}){const zoom=clampRelationZoom(next),ratio=zoom/view.zoom;return {zoom,offset:{x:point.x-230-(point.x-230-view.offset.x)*ratio,y:point.y-170-(point.y-170-view.offset.y)*ratio}};}
export function relationSidebarWidth(width,ratio=1/3){return Math.max(280,Math.min(Math.max(280,width-440),width*Math.max(.2,Math.min(.6,ratio))));}
export function relationSidebarKey(novelId,mode){return `moji:relation-sidebar:${novelId}:${mode}`;}
