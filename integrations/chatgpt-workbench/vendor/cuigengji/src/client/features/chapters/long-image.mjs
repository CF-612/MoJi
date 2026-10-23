/** Break without dropping any character, including explicit blank lines. */
const graphemes=text=>typeof Intl.Segmenter==='function'?Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text),item=>item.segment):Array.from(text);
export function wrapShareText(text,maxWidth,measure){
  if(!(maxWidth>0))throw new Error('图片正文宽度无效。');
  const result=[];
  for(const paragraph of String(text).replace(/\r\n?/g,'\n').split('\n')){
    let line='';
    for(const char of graphemes(paragraph)){if(line&&measure(line+char)>maxWidth){result.push(line);line='';}line+=char;}
    result.push(line);
  }
  return result;
}
export function paginateShareLines(lines,{width=1080,maxHeight=3600,padding=80,fontSize=40,lineHeight=1.85,titleLines=[]}={}){
  const linePixels=Math.ceil(fontSize*lineHeight),titlePixels=titleLines.length?titleLines.length*Math.ceil(fontSize*1.3*1.5)+linePixels:0;
  const footer=48,bodyHeight=maxHeight-padding*2-titlePixels-footer;
  const perPage=Math.floor(bodyHeight/linePixels);
  if(perPage<1)throw new Error('图片尺寸过小，请减小字号。');
  const pages=[];
  for(let start=0;start<lines.length;start+=perPage){
    const body=lines.slice(start,start+perPage);
    pages.push({width,height:Math.min(maxHeight,padding*2+titlePixels+body.length*linePixels+footer),lines:body,titleLines,linePixels,titlePixels,padding,fontSize});
  }
  return pages;
}
export function shareFilename(title,page,total){const safe=String(title||'正文分享').replace(/[<>:"/\\|?*\u0000-\u001F]/g,'_').slice(0,80);return `${safe}${total>1?`-${page+1}-${total}`:''}.png`;}
export function paintSharePage(canvas,page,index,total,{fontFamily='serif'}={}){
  canvas.width=page.width;canvas.height=page.height;
  const context=canvas.getContext('2d');if(!context)throw new Error('当前宿主无法绘制分享图片。');
  context.fillStyle='#fffdf7';context.fillRect(0,0,canvas.width,canvas.height);context.fillStyle='#282623';context.textBaseline='top';
  let y=page.padding;context.font=`600 ${Math.ceil(page.fontSize*1.3)}px ${fontFamily}`;
  for(const title of page.titleLines){context.fillText(title,page.padding,y);y+=Math.ceil(page.fontSize*1.3*1.5);}
  if(page.titleLines.length)y+=page.linePixels;
  context.font=`${page.fontSize}px ${fontFamily}`;
  for(const line of page.lines){context.fillText(line,page.padding,y);y+=page.linePixels;}
  context.font='24px sans-serif';context.fillStyle='#75716a';context.fillText(`墨叽 · ${index+1} / ${total}`,page.padding,page.height-page.padding+12);
  return canvas;
}
