import {useContext,useEffect,useMemo,useState} from 'react';
import {SessionScope,readLocal} from '../../shared/state.js';
import {sharedPlacementQueue} from './event-placement-queue.mjs';
export function useEventPlacement(call,novelId,refresh){
 const scope=useContext(SessionScope),key=`cuigengji:placement:${scope}:${novelId}`;
 const queue=useMemo(()=>sharedPlacementQueue(key,{send:args=>call('writing.event.place',{novelId,...args}),read:()=>readLocal(key,null),write:value=>{if(typeof localStorage!=='undefined')localStorage.setItem(key,JSON.stringify(value));},saved:refresh}),[key,call]);
 queue.setSaved(refresh);
 const [state,setState]=useState(queue.snapshot);
 useEffect(()=>queue.subscribe(setState),[queue]);
 return {...state,place:request=>queue.enqueue(request),retry:queue.retry,flush:queue.flush,discard:queue.discard,project:queue.project};
}
