// Product-local UI preference only. Never stored in a novel, session binding or host settings.
export const PAGE_TOUR_KEY='moji:workbench:page-tour:v1';
const states=new Set(['offered','skipped','completed']);
export function createTourPreference(getStorage=()=>globalThis.localStorage){
 let remembered=null;
 const read=()=>{try{const value=JSON.parse(getStorage()?.getItem(PAGE_TOUR_KEY)||'null');if(states.has(value?.status))remembered=value.status;}catch{}return remembered;};
 const save=status=>{if(!states.has(status))return;remembered=status;try{getStorage()?.setItem(PAGE_TOUR_KEY,JSON.stringify({version:1,status}));}catch{}};
 return {read,save,claim(){if(read())return false;save('offered');return true;}};
}
export const tourPreference=createTourPreference();
export function pageTourSteps(modules={}){
 return [
  {id:'detail',page:'detail',title:'详情 · 故事的封面页',body:'在这里查看作品简介、写作进度，回到最近的正文与规划。'},
  {id:'chapters',page:'chapters',title:'正文 · 安心写下去',body:'章节与分卷在这里整理，正文会自动保存。现在先看看，不用新建章节。'},
  {id:'plan-canvas',page:'plan',area:'canvas',title:'规划 · 画布',body:'自由摆放剧情卡、卷和章节，连起故事的思路。同一份内容可以在不同视图里整理。'},
  {id:'plan-outline',page:'plan',area:'outline',title:'规划 · 大纲',body:'用层级和先后顺序梳理全书结构。卷、章节与剧情卡放在一起看，不会改动正文目录。'},
  ...(modules.timeline?[{id:'plan-timeline',page:'plan',area:'timeline',title:'规划 · 时间线',body:'叙述顺序按章节安排情节如何呈现；故事时间按故事里实际发生的先后查看。'}]:[]),
  ...(modules.foreshadow?[{id:'plan-foreshadow',page:'plan',area:'foreshadow',title:'规划 · 伏笔',body:'集中查看伏笔的埋设、推进与回收，让前面的细节在后面有回应。'}]:[]),
  {id:'memory',page:'memory',title:'资料 · 记住人物与世界',body:'把角色、地点和世界设定放在一起；列表方便查找，关系图展示彼此的联系。'},
  {id:'settings-entry',page:'memory',title:'点击顶部「⋯」。',body:''},
  {id:'settings-menu',page:'memory',title:'点击「设置」。',body:''},
  {id:'settings',page:'memory',title:'设置 · 留下你需要的功能',body:'不需要的功能，可以在这里关闭。没有你想要的功能？也可以让 AI 帮你开发扩展。'},
 ];
}
