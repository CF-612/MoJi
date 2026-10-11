import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script,createContext} from 'node:vm';

test('隔离页完成真实 SDK 握手且不启动尺寸观察或资料请求',async()=>{
  const root=new URL('../',import.meta.url);
  const html=await readFile(new URL('dist/native-paused-template.html',root),'utf8');
  assert.match(html,/小说工作台已暂停/);
  assert.match(html,/height:160px/);
  const {mode}=JSON.parse(await readFile(new URL('.data/native-mode.json',root),'utf8'));
  const active=mode==='paused'?html:await readFile(new URL('dist/workbench-dev.html',root),'utf8');
  for(const name of ['native-paused.html','demo.html','workbench.html'])assert.equal(await readFile(new URL(`dist/${name}`,root),'utf8'),active);
  const messages=[],listeners=new Set();
  let observations=0;
  const parent={postMessage(message){
    messages.push(message);
    if(message.method==='ui/initialize'){
      queueMicrotask(()=>{
        const response={jsonrpc:'2.0',id:message.id,result:{protocolVersion:message.params.protocolVersion,hostInfo:{name:'containment-test',version:'1.0.0'},hostCapabilities:{},hostContext:{displayMode:'inline'}}};
        for(const listener of listeners)listener({source:parent,data:response});
      });
    }
  }};
  const window={parent,addEventListener(type,listener){if(type==='message')listeners.add(listener);},removeEventListener(type,listener){listeners.delete(listener);}};
  const context=createContext({window,console:{debug(){},log(){},warn(){},error(){}},setTimeout,clearTimeout,setInterval,clearInterval,queueMicrotask,AbortController,AbortSignal,URL,TextEncoder,TextDecoder,crypto:globalThis.crypto,
    ResizeObserver:class{constructor(){observations++;throw new Error('隔离页禁止观察尺寸');}},
    requestAnimationFrame(){observations++;throw new Error('隔离页禁止尺寸测量');}
  });
  new Script(html.match(/<script>([\s\S]*)<\/script>/)[1]).runInContext(context);
  for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(messages.map(x=>x.method),['ui/initialize','ui/notifications/initialized']);
  assert.equal(observations,0);
});
