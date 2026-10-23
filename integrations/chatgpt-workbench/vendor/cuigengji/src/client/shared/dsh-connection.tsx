import {Icon} from './icons.tsx';
import React,{createContext,useContext} from 'react';

/** Only native DSH supplies this capability; web/MCP hosts have no connection UI. */
export const DshConnectionContext=createContext<null|{status:string;open:()=>void}>(null);
export function DshConnectionCard(){
 const connection=useContext(DshConnectionContext);
 if(!connection)return null;
 return <button type="button" className="moji-connection-card" aria-label="本地 / 云端" onClick={connection.open}>
   <span className="workbench-menu-icon" aria-hidden="true"><Icon name="folder"/></span><span className="mn-card-copy"><strong>本地 / 云端</strong><span className="mn-card-status">{connection.status}</span></span><span className="mn-card-arrow" aria-hidden="true">›</span>
 </button>;
}
