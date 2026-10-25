import {useContext,useEffect,useRef,useState} from 'react';
import {SessionScope,readLocal,TransientViewContext} from './state.js';
const eventName='moji:relation-view-time';
// View preference only: never writes story or material data.
export function useRelationClock(novelId){
 const transient=useContext(TransientViewContext);
 const scope=useContext(SessionScope),key='cuigengji:ui:'+scope+':'+novelId+':v31-view-time';
 const read=()=>{const saved=readLocal(key,{});return {mode:saved.mode==='story'?'story':'narration',cursor:Number.isFinite(saved.cursor)?Math.max(0,saved.cursor):0};};
 const [value,setValue]=useState(read),current=useRef(value);current.current=value;
 useEffect(()=>{setValue(read());const receive=e=>{if(e.type==='storage'?e.key===key:e.detail===key)setValue(read());};window.addEventListener(eventName,receive);window.addEventListener('storage',receive);return()=>{window.removeEventListener(eventName,receive);window.removeEventListener('storage',receive);};},[key]);
 const update=patch=>{const next={...current.current,...patch};current.current=next;setValue(next);if(transient)return;try{localStorage.setItem(key,JSON.stringify(next));window.dispatchEvent(new CustomEvent(eventName,{detail:key}));}catch{}};
 return {...value,setMode:mode=>update({mode,cursor:0}),setCursor:cursor=>update({cursor:typeof cursor==='function'?cursor(current.current.cursor):cursor})};
}
