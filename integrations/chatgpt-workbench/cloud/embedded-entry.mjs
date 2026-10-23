// Code-only updates retain the existing asset binding and all credentials.
// Bundle with esbuild's .html=text loader after build-workbench/build-cloud.
import worker from './entry.mjs';
import html from './public/index.html';
export {WorkbenchRuntime,LoginGuard} from './entry.mjs';
export default {
 fetch(request,env,ctx){
  const assets={fetch(input,init){
   const url=new URL(typeof input==='string'?input:input.url);
   if(url.pathname==='/index.html')return Promise.resolve(new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}));
   return env.ASSETS.fetch(input,init);
  }};
  return worker.fetch(request,{...env,ASSETS:assets},ctx);
 }
};
