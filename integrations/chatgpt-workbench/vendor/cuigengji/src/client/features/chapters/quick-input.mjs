/** Pure quick-input operations. Offsets use the textarea's UTF-16 convention. */
export const QUICK_PUNCTUATION = [
  {text:'，'}, {text:'。'}, {text:'？'}, {text:'！'}, {text:'：'},
  {text:'“',close:'”'}, {text:'‘',close:'’'}, {text:'（',close:'）'},
  {text:'《',close:'》'}, {text:'……'}, {text:'——'},
];
export function quickInsertion(content,start,end,text,close='') {
  content=String(content);text=String(text);close=String(close);
  start=Math.max(0,Math.min(content.length,Number(start)||0));
  end=Math.max(start,Math.min(content.length,Number(end)||0));
  const selected=content.slice(start,end),insert=text+(close?selected+close:'');
  return {content:content.slice(0,start)+insert+content.slice(end),insert,
    start:start+text.length,end:close?start+text.length+selected.length:start+text.length};
}
export function normalizeQuickPhrases(value) {
  if(!Array.isArray(value))return [];
  const seen=new Set();
  return value.filter(item=>item&&typeof item.id==='string'&&typeof item.text==='string')
    .filter(item=>{if(seen.has(item.id)||!item.text.trim())return false;seen.add(item.id);return true;})
    .slice(0,80).map(({id,text})=>({id,text:text.slice(0,500)}));
}
export function moveQuickPhrase(phrases,from,to) {
  const result=[...phrases];
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=result.length||to>=result.length)return result;
  const [item]=result.splice(from,1);result.splice(to,0,item);return result;
}
export function quickPhrasesKey(scope,novelId){return `cuigengji:ui:${scope}:${novelId}:quick-phrases:v1`;}
