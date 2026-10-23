/** Explicit selections only: selecting a parent never implies deleting descendants. */
export function planningSelection(objects,refs=[]){
 const valid=[...new Set(refs)].filter(ref=>typeof ref==='string'&&Object.hasOwn(objects,ref));
 return {refs:valid,cards:valid.filter(ref=>objects[ref].kind==='card'),protected:valid.filter(ref=>objects[ref].kind!=='card')};
}
export function isPlanningDeleteKey(event,{blocked=false,selected=[]}={}){
 if(blocked||!selected.length||event.key!=='Delete'||event.repeat||event.isComposing||event.nativeEvent?.isComposing||event.ctrlKey||event.metaKey||event.altKey)return false;
 const target=event.target;
 if(target?.isContentEditable||target?.closest?.('input:not([data-planning-selection="true"]),textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="dialog"],[aria-modal="true"],[role="menu"]'))return false;
 return true;
}
export function planningGroupFilter(groups=[],value='',enabled=true){
 return enabled&&(value==='__ungrouped'||groups.some(group=>group.id===value))?value:'';
}
export function planningGroupMatches(groups=[],filter='',ref){
 if(!filter)return true;
 if(filter==='__ungrouped')return !groups.some(group=>group.refs.includes(ref));
 return !!groups.find(group=>group.id===filter)?.refs.includes(ref);
}
