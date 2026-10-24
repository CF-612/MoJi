// Material names come from the author's selection; evidence itself stays untouched.
export function selectionCreateNames(selection){const name=String(selection?.evidence||'').trim();return {character:name,world:name,card:'',foreshadow:''};}
export function selectionMaterialLink(kind,mode,firstAppearance,existingLink='reference'){
 if(!['character','world'].includes(kind))return {};
 return {linkKind:firstAppearance?'appearance':mode==='existing'&&kind==='character'?existingLink:'reference'};
}
