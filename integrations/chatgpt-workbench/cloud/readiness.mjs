import manifest from '../package.json' with {type:'json'};
import {authConfig} from './auth.mjs';

export function personalConfigurationReady(env){
  return typeof env.MOJI_OWNER_KEY==='string'&&env.MOJI_OWNER_KEY.length>=24&&env.MOJI_OWNER_KEY!=='replace-with-your-own-secret-key'&&Boolean(env.OAUTH_KV&&env.LOGIN_GUARD);
}
// Inspect schema metadata only: never read author identities, works or credentials.
const requiredColumns={
  workspaces:['owner','revision','state','event','updated_at'],
  workspace_history:['owner','revision','state','event','updated_at'],
  workspace_blobs:['owner','digest','state'],
};
export async function serviceReadiness(env){
  if(env.MOJI_AUTH==='builtin'){
    if(!personalConfigurationReady(env))return {ready:false,stage:'configuration'};
  }else{
    try{if(!authConfig(env).owner)return {ready:false,stage:'configuration'};}
    catch{return {ready:false,stage:'configuration'};}
  }
  if(!env.WORKBENCH_RUNTIME)return {ready:false,stage:'configuration'};
  if(!env.DB?.prepare)return {ready:false,stage:'database'};
  try{
    const schema=await env.DB.prepare("SELECT type,name FROM sqlite_schema WHERE name IN ('workspaces','workspace_history','workspace_blobs','preserve_workspace')").all();
    if(!schema.success||!Array.isArray(schema.results))return {ready:false,stage:'database'};
    if(!Object.keys(requiredColumns).every(name=>schema.results.some(row=>row.type==='table'&&row.name===name))||!schema.results.some(row=>row.type==='trigger'&&row.name==='preserve_workspace'))return {ready:false,stage:'migrations'};
    for(const [table,columns]of Object.entries(requiredColumns)){
      const info=await env.DB.prepare(`PRAGMA table_info(${table})`).all();
      if(!info.success||!Array.isArray(info.results))return {ready:false,stage:'database'};
      if(!columns.every(name=>info.results.some(row=>row.name===name)))return {ready:false,stage:'migrations'};
    }
    return {ready:true,stage:'ready'};
  }catch{return {ready:false,stage:'database'};}
}
export async function healthResponse(env){
  const state=await serviceReadiness(env);
  return Response.json({service:'moji-private-cloud',version:manifest.version,...state,...(!state.ready?{error:'Service is not ready.'}:{})},{status:state.ready?200:503,headers:{'Cache-Control':'no-store'}});
}
