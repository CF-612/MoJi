export function timelineMetrics(zoom){const scale=Math.max(.15,Math.min(2,zoom/100));return {unit:320*scale,cardWidth:Math.max(64,220*scale),cardHeight:scale<.5?52:80,compact:scale<.5};}
export function timelinePoint(clientX,bodyLeft,unit,count){return Math.max(0,Math.min(count-.001,(clientX-bodyLeft)/unit));}
