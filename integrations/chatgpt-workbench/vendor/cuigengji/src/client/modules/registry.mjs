// 内置模块的唯一目录。显示偏好不改变云端权限或作品数据。
export const modules=Object.freeze([
 {id:'pages',name:'多页画布',description:'创建和切换多个规划画布；关闭后显示基础画布',defaultEnabled:true,dependencies:[]},
 {id:'groups',name:'资料与规划分组',description:'按自定义分组整理资料和规划；关闭后显示全部',defaultEnabled:true,dependencies:[]},
 {id:'summary',name:'Summary 本章梗概',description:'在正文开头显示梗概；隐藏会保留已写内容',defaultEnabled:true,dependencies:[]},
 {id:'overview',name:'创作仪表盘',description:'字数图表、写作目标与进度概览',page:'overview',dependencies:[]},
 {id:'timeline',name:'时间线',description:'章节／故事时间轴、事件与时间线规划',page:'timeline',navigation:false,dependencies:[]},
 {id:'foreshadow',name:'伏笔辅助',description:'章节、时间线和仪表盘中的伏笔入口',dependencies:[]},
 {id:'evolution',name:'关系演变',description:'跟随事件查看关系阶段与变化',dependencies:['timeline']},
]);
export const moduleExtensions=Object.freeze({
 pages:{pages:['planning.canvas'],associations:['story.pages.instances'],actions:['story.apply']},
 timeline:{pages:['planning.timeline'],associations:['story.cards.time'],actions:['story.get','story.apply']},
 foreshadow:{pages:['planning.foreshadow'],cardMarkers:['foreshadow'],associations:['writing.foreshadows.plotNodes'],actions:['story.foreshadow.save']},
 evolution:{pages:['planning.timeline.relations'],cardMarkers:['relationship'],associations:['story.cards.points'],actions:['story.apply']},
});
export function enabledExtensions(value){const enabled=normalizeModules(value);return Object.entries(moduleExtensions).filter(([id])=>enabled[id]).map(([id,extension])=>({id,...extension}));}
export const profiles=Object.freeze({minimal:{name:'极简',enabled:[]},standard:{name:'标准',enabled:['overview','timeline','foreshadow']},complete:{name:'完整',enabled:modules.map(m=>m.id)}});
export function normalizeModules(value){
 const result=Object.fromEntries(modules.map(m=>[m.id,typeof value?.[m.id]==='boolean'?value[m.id]:(m.defaultEnabled??true)]));
 // Defaults must not undo an author's explicit opt-out when a dependent module is missing.
 // A deliberate enable goes through toggleModule, which enables its dependencies together.
 for(const m of modules)if(result[m.id])for(const dep of m.dependencies){
  if(value?.[dep]===false)result[m.id]=false;
  else result[dep]=true;
 }
 return result;
}
export function toggleModule(value,id,enabled){
 const next=normalizeModules(value);if(!modules.some(m=>m.id===id))return next;
 next[id]=enabled;if(enabled){for(const dep of modules.find(m=>m.id===id).dependencies)next[dep]=true;}
 else {for(const m of modules)if(m.dependencies.includes(id))next[m.id]=false;}
 return next;
}
export function profileModules(id){const p=profiles[id];return p?Object.fromEntries(modules.map(m=>[m.id,p.enabled.includes(m.id)])):normalizeModules();}
export function navigationModules(value){const enabled=normalizeModules(value);return modules.filter(m=>m.page&&m.navigation!==false&&enabled[m.id]).map(m=>[m.page,m.id==='overview'?'仪表盘':m.name]);}
export function pageAvailable(page,value){const module=modules.find(m=>m.page===page);return !module||normalizeModules(value)[module.id];}
