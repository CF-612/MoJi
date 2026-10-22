/** UTF-16 offsets deliberately match textarea selectionStart/End. Non-overlapping exact matches. */
export function proseMatches(content, query) {
 const matches=[];if(!query)return matches;
 for(let start=content.indexOf(query);start!==-1;start=content.indexOf(query,start+query.length))matches.push({start,end:start+query.length});
 return matches;
}
export function replaceMatch(content,match,query,replacement){
 if(!match||content.slice(match.start,match.end)!==query)throw new Error('这一处原文已变化，请重新查找。');
 return content.slice(0,match.start)+replacement+content.slice(match.end);
}
export function chapterCopy(title,content,mode){
 if(mode==='title')return title;
 if(mode==='body')return content;
 if(mode==='compact')return content.split(/\r\n|\r|\n/).filter(line=>line.trim().length>0).join('\n');
 return title+(content?'\n\n'+content:'');
}
export function manuscriptCount(content,includePunctuation=true){return Array.from(content.replace(includePunctuation?/\s/gu:/[\s\p{P}\p{S}]/gu,'')).length;}
/** Explicit, opt-in manuscript transformation. Never invoked as a side effect of a setting. */
export function formatManuscript(content,{indent=2,blankLines=1,trimSpaces=true}={}){
 const lines=content.replace(/\r\n?/g,'\n').split('\n');
 return lines.filter(line=>line.trim()).map(line=>{
  const body=trimSpaces?line.trim().replace(/[ \t]{2,}/g,' '):line;
  return indent==='preserve'?body:'　'.repeat(Number(indent)||0)+body.replace(/^[ \t　]+/,'');
 }).join('\n'.repeat(Number(blankLines)+1));
}
export function canUndoTransform(undo,content){return Boolean(undo&&undo.after===content);}
