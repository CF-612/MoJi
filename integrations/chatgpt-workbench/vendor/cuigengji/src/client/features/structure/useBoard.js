import {useEffect,useState} from 'react';
import {useResource} from '../../shared/state.js';
export const boardKey=novelId=>`${novelId}:writing-board`;
export function useBoard(call,novelId,tick=0,includeDeleted=false){
 const [poll,setPoll]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>{if(!document.hidden)setPoll(n=>n+1);},10000);return()=>clearInterval(timer);},[]);
 return useResource(()=>call('writing.board.get',{novelId,...(includeDeleted?{includeDeleted:true}:{})}),[call,novelId,tick,poll,includeDeleted],`${boardKey(novelId)}${includeDeleted?':deleted':''}`);
}
