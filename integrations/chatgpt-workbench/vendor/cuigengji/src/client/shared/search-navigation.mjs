// Legacy IDs are not unified card IDs. Search excerpts remain readable without
// silently creating a workspace, converting data, or calling removed RPCs.
export const isLegacySearchHit=hit=>hit?.kind==='planning'||hit?.kind==='event'&&hit.unified!==true;
export const legacySearchNotice='这是旧版资料的只读搜索摘要，不是完整正文，也不能直接作为新版剧情卡打开。完整旧数据可在“作品与备份”中导出作品备份查看；本次不会转换或改写数据。';
export function openSearchHit(hit,{onOpen,onLegacy}){
 if(isLegacySearchHit(hit)){onLegacy(legacySearchNotice);return false;}
 onOpen(hit);return true;
}
