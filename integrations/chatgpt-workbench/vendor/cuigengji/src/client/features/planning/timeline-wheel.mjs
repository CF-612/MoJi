// One wheel policy for both timelines: vertical wheel zooms at the pointer;
// horizontal trackpad / Shift-wheel pans, with DOM deltaMode normalization.
export function timelineWheelIntent(event,viewport={}){
 const unit=event.deltaMode===1?16:event.deltaMode===2?Math.max(1,viewport.clientHeight||1):1;
 const x=(Number(event.deltaX)||0)*unit,y=(Number(event.deltaY)||0)*unit;
 if(event.shiftKey||Math.abs(x)>Math.abs(y))return {kind:'pan',delta:event.shiftKey&&Math.abs(y)>Math.abs(x)?y:x};
 return {kind:'zoom',delta:y};
}
