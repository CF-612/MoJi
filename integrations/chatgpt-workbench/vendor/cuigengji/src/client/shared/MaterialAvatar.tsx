import React,{useState} from 'react';
/** Read the character's existing image; decorative and non-interactive so card dragging stays intact. */
export function MaterialAvatar({name,src}:{name:string;src?:string}){
 const [failed,setFailed]=useState<string>();
 const showImage=!!src&&failed!==src;
 return <span className="material-card-avatar" aria-hidden="true">{showImage?<img src={src} alt="" draggable={false} onError={()=>setFailed(src)}/>:Array.from(name.trim())[0]||'人'}</span>;
}
