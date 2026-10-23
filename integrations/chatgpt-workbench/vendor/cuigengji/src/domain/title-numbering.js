const digits='零一二三四五六七八九';
export function chineseNumber(n){if(!Number.isSafeInteger(n)||n<1||n>9999)return String(n);const units=['','十','百','千'];let result='',zero=false;for(let p=3;p>=0;p--){const d=Math.floor(n/10**p)%10;if(d){if(zero)result+='零';result+=digits[d]+units[p];zero=false;}else if(result&&n%10**p)zero=true;}return result.startsWith('一十')?result.slice(1):result;}
function number(value){if(/^\d+$/.test(value))return Number(value);let total=0,current=0;for(const char of value){const d=digits.indexOf(char==='〇'?'零':char==='两'?'二':char);if(d>=0)current=d;else {const unit={十:10,百:100,千:1000}[char];if(!unit)return 0;total+=(current||1)*unit;current=0;}}return total+current;}
export function nextNumberedTitle(records,kind){const values=Array.isArray(records)?records:Object.values(records||{}),pattern=new RegExp(`^\\s*第([\\d零〇一二两三四五六七八九十百千]+)${kind}`),highest=Math.max(values.length,...values.map(r=>number(pattern.exec(r.title||r.name||'')?.[1]||'')));return `第${chineseNumber(highest+1)}${kind}`;}
export function nextChapterTitle(chapters,volumeId=null){return nextNumberedTitle((Array.isArray(chapters)?chapters:Object.values(chapters||{})).filter(c=>(c.volumeId||null)===(volumeId||null)),'章');}
export function numberedTitle(title,prefix,autoNumber=false){if(title===undefined||title==='')return prefix;if(typeof title!=='string')return title;if(!autoNumber||/^\s*第[\d零〇一二两三四五六七八九十百千]+[卷章]/.test(title))return title;return `${prefix} ${title}`;}

// Display preference: custom text and persisted titles are not rewritten.
export function displayNumberedTitle(title,style='chinese'){
 if(typeof title!=='string')return title;
 return title.replace(/(^|·)(\s*第)([\d零〇一二两三四五六七八九十百千]+)([卷章])/g,(_,separator,prefix,value,kind)=>`${separator}${prefix}${style==='arabic'?number(value):chineseNumber(number(value))}${kind}`);
}
