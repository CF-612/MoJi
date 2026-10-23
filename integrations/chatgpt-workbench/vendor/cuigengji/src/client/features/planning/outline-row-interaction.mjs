// The row itself has role=button: closest() must not classify it as a nested action.
export function isOutlineActionTarget(e) {
 const action=e.target.closest?.('button,input,a,summary,select,textarea,[role="button"]');
 return !!action&&action!==e.currentTarget&&e.currentTarget.contains(action);
}
// Keep gestures independent of rendering so touch/desktop sequences are testable.
export function createOutlineGesture({toggle,edit,schedule=setTimeout,cancel=clearTimeout}) {
 let clickTimer=null,holdTimer=null,pointer=null,suppress=false,toggled=false;
 const clearClick=()=>{if(clickTimer!==null)cancel(clickTimer);clickTimer=null;};
 const clearHold=()=>{if(holdTimer!==null)cancel(holdTimer);holdTimer=null;};
 return {
  down(e){clearHold();suppress=false;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};if(e.pointerType==='touch'&&e.isPrimary!==false)holdTimer=schedule(()=>{holdTimer=null;suppress=true;pointer=null;clearClick();edit();},550);},
  move(e){if(pointer&&pointer.id===e.pointerId&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>8){clearHold();pointer=null;suppress=true;}},
  up(){clearHold();pointer=null;},
  cancel(){clearHold();clearClick();pointer=null;suppress=true;},
  click(e){if(suppress||e.detail>1)return;clearClick();toggled=false;clickTimer=schedule(()=>{clickTimer=null;toggled=true;toggle();},280);},
  double(){if(suppress)return;clearHold();clearClick();if(toggled)toggle();toggled=false;edit();},
  context(){clearHold();clearClick();if(!suppress)edit();suppress=true;},
  dispose(){clearClick();clearHold();},
 };
}
export function outlineChildSummary(state,objects,ref) {
 const counts={volume:0,chapter:0,card:0};
 for(const [key,p] of Object.entries(state.placements))if(p.parent===ref&&objects[key]?.kind in counts)counts[objects[key].kind]++;
 return [['volume','卷'],['chapter','章'],['card','段剧情']].filter(([kind])=>counts[kind]).map(([kind,label])=>`${counts[kind]} ${label}`).join(' · ')||'暂无内容';
}
