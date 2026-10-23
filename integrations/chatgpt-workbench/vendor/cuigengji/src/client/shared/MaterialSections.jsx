import React,{useRef} from 'react';
import {Icon} from './icons.tsx';
export function MaterialTabs({tabs,active,onChange,prefix,label,compact=false}){
 const refs=useRef([]);
 const move=(event,index)=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();onChange(tabs[next].id);refs.current[next]?.focus();}};
 return <div className={compact?'material-subnav':'material-nav'} role="tablist" aria-label={label}>{tabs.map((tab,index)=><button type="button" key={tab.id} id={prefix+'-tab-'+tab.id} role="tab" aria-label={tab.label} aria-description={tab.dirty?'有未保存草稿':undefined} aria-selected={active===tab.id} aria-controls={prefix+'-panel-'+tab.id} tabIndex={active===tab.id?0:-1} ref={el=>{refs.current[index]=el;}} onClick={()=>onChange(tab.id)} onKeyDown={e=>move(e,index)}>{tab.icon&&<Icon name={tab.icon}/>}<span>{tab.label}</span>{tab.dirty&&<i className="material-draft-dot" aria-hidden="true"/>}</button>)}</div>;
}
export function MaterialPanel({id,active,prefix,children,className=''}){
 return <section id={prefix+'-panel-'+id} aria-labelledby={prefix+'-tab-'+id} role="tabpanel" hidden={active!==id} className={'material-panel '+className} tabIndex={0}>{children}</section>;
}
