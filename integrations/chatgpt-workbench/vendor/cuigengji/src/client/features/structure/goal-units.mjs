export const goalUnits={words:{label:'字',factor:1},k:{label:'千（k）',factor:1000},w:{label:'万（w）',factor:10000}};
// Decimal arithmetic keeps inputs such as 1.001k exactly equal to 1001 words.
export function goalWords(value,unit){
 if(value==='')return null;
 if(!goalUnits[unit]||value.length>30||!/^\d+(?:\.\d+)?$/.test(value))return undefined;
 const [whole,fraction='']=value.split('.'),scale=10n**BigInt(fraction.length),numerator=BigInt(whole+fraction)*BigInt(goalUnits[unit].factor);
 if(numerator%scale!==0n)return undefined;
 const words=numerator/scale;return words>0n&&words<=BigInt(Number.MAX_SAFE_INTEGER)?Number(words):undefined;
}
export function goalAmount(words,unit){
 if(!words)return '';
 const factor=BigInt(goalUnits[unit].factor),value=BigInt(words),remainder=value%factor;
 return String(value/factor)+(remainder?'.'+String(remainder).padStart(String(factor).length-1,'0').replace(/0+$/,''):'');
}
export function goalDisplay(words){const unit=words>=10000?'w':words>=1000?'k':'words';return {amount:goalAmount(words,unit),unit};}
