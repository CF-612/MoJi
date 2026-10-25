import {readPlanningSnapshot,readDecorations} from './data.js';

/** Uses read RPCs only; all pages share the same board sequence. */
export async function readLegacyPlanning(call,novelId){
 const snapshot=await readPlanningSnapshot(call,novelId);
 const [pages,groups,decorations]=await Promise.all([call('planning.pages',{novelId}),call('planning.groups',{novelId}),readDecorations(call,novelId)]);
 const latest=await call('planning.list',{novelId,limit:1});
 if(latest.sequence!==snapshot.sequence)throw new Error('读取期间旧规划发生变化，请重新打开；未修改任何内容。');
 return {...snapshot,pages,groups,decorations};
}
