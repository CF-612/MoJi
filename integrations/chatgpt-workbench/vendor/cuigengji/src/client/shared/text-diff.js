const lines=text=>text.match(/[^\n]*\n|[^\n]+$/g)||[];
const characters=text=>{let n=0;for(const _ of text)n++;return n;};
function tokensDiff(a,b,maxCells){
 let start=0,endA=a.length,endB=b.length;
 while(start<endA&&start<endB&&a[start]===b[start])start++;
 while(endA>start&&endB>start&&a[endA-1]===b[endB-1]){endA--;endB--;}
 const chunks=[],push=(kind,text)=>{if(!text)return;const last=chunks.at(-1);if(last?.kind===kind)last.text+=text;else chunks.push({kind,text});};
 push('same',a.slice(0,start).join(''));
 const m=endA-start,n=endB-start,coarse=m>0&&n>0&&(m+1)*(n+1)>maxCells;
 if(coarse||!m||!n){push('remove',a.slice(start,endA).join(''));push('add',b.slice(start,endB).join(''));}
 else{
  const width=n+1,table=new Uint32Array((m+1)*width);
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)table[i*width+j]=a[start+i]===b[start+j]?table[(i+1)*width+j+1]+1:Math.max(table[(i+1)*width+j],table[i*width+j+1]);
  let i=0,j=0;while(i<m||j<n){if(i<m&&j<n&&a[start+i]===b[start+j]){push('same',a[start+i]);i++;j++;}else if(i<m&&(j===n||table[(i+1)*width+j]>=table[i*width+j+1]))push('remove',a[start+i++]);else push('add',b[start+j++]);}
 }
 push('same',a.slice(endA).join(''));return {chunks,coarse};
}
export function textDiff(before='',after='',{maxCells=1_000_000,inlineBudget=100_000}={}){
 const result=tokensDiff(lines(before),lines(after),maxCells);let oldLine=1,newLine=1;
 for(const chunk of result.chunks){chunk.oldLine=chunk.kind==='add'?null:oldLine;chunk.newLine=chunk.kind==='remove'?null:newLine;chunk.lineCount=lines(chunk.text).length;if(chunk.kind!=='add')oldLine+=chunk.lineCount;if(chunk.kind!=='remove')newLine+=chunk.lineCount;}
 result.blockStats=false;
 for(let i=0;i<result.chunks.length-1;i++){const a=result.chunks[i],b=result.chunks[i+1];if(a.kind!=='remove'||b.kind!=='add')continue;if(a.text.length+b.text.length>2400){result.blockStats=true;continue;}const old=Array.from(a.text),next=Array.from(b.text),cells=(old.length+1)*(next.length+1);if(cells>inlineBudget){result.blockStats=true;continue;}inlineBudget-=cells;const inline=tokensDiff(old,next,cells);a.inline=inline.chunks.filter(c=>c.kind!=='add');b.inline=inline.chunks.filter(c=>c.kind!=='remove');}
 const count=(chunks,kind)=>chunks.filter(c=>c.kind===kind).reduce((n,c)=>n+(c.inline?c.inline.filter(p=>p.kind===kind).reduce((sum,p)=>sum+characters(p.text),0):characters(c.text)),0);
 result.added=count(result.chunks,'add');result.removed=count(result.chunks,'remove');return result;
}
