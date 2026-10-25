import React,{useEffect,useRef} from 'react';

// Dragged/imported offsets are continuous coordinates, not hundredth steps.
// Keep the domain's half-open chapter boundaries without rounding stored data.
export function NarrationOffsetInput({edge,value,onChange,percent=false,disabled=false,label}){
 const input=useRef(null),start=edge==='start',limit=percent?100:1;
 useEffect(()=>{
  const valid=typeof value==='number'&&Number.isFinite(value)&&(start?value>=0&&value<1:value>0&&value<=1);
  input.current.setCustomValidity(valid?'':start?`章内位置须大于等于 0 且小于 ${limit}。`:`章内位置须大于 0 且小于等于 ${limit}。`);
 },[value,start,limit]);
 return <input ref={input} aria-label={label||(percent?'章内位置（%）':start?'起点章内位置':'终点章内位置')} disabled={disabled} type="number" required step="any" min="0" max={limit} value={value===''?'':value*limit} onChange={e=>onChange(e.target.value===''?'':e.target.valueAsNumber/limit)} onInvalid={e=>{for(let parent=e.currentTarget.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;}}/>;
}
