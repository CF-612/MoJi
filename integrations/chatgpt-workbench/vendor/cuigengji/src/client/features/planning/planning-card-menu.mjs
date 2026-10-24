/** Single-card actions share CanvasMenu with the character graph. Never delete a page here. */
export function planningCardMenuItems(selection,{blocked=false,groupsEnabled=false,edit,organize,assign,group,remove,deleteCards}){
 if(selection.refs.length!==1)return [];
 const refs=selection.refs,ref=refs[0];
 return [
  {label:'编辑内容',disabled:blocked,action:()=>edit(ref)},
  {label:'整理包含关系',disabled:blocked,action:()=>organize(ref)},
  ...(groupsEnabled?[{label:'加入分组',disabled:blocked,action:()=>assign(refs)}]:[]),
  {label:'组合为篇章',disabled:blocked,action:()=>group(refs)},
  {label:'移除本页展示',disabled:blocked,action:()=>remove(refs)},
  {label:selection.cards.length?'删除剧情卡／篇章':'正文卷章受保护',danger:!!selection.cards.length,disabled:blocked||!selection.cards.length,action:()=>deleteCards(refs)},
 ];
}
