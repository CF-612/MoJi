import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),version=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version;
const pack=process.argv[2]?resolve(process.argv[2]):resolve(root,'releases',`Moji-${version}-windows-x64`);
await mkdir(resolve(root,'.data/package-tests'),{recursive:true});const data=await mkdtemp(resolve(root,'.data/package-tests/clean-'));
const port=43159,origin=`http://127.0.0.1:${port}`;
async function start(){
  const child=spawn(resolve(pack,'node.exe'),[resolve(pack,'server/index.mjs')],{cwd:pack,windowsHide:true,env:{...process.env,PATH:process.env.SystemRoot+'/System32',NODE_PATH:'',PORT:String(port),CUIGENGJI_DATA_ROOT:data},stdio:['ignore','pipe','pipe']});
  await new Promise((ok,bad)=>{const timer=setTimeout(()=>bad(new Error('startup timeout')),15000);child.once('error',bad);child.once('exit',code=>{clearTimeout(timer);bad(new Error('exited '+code));});child.stdout.once('data',()=>{clearTimeout(timer);ok();});child.stderr.on('data',line=>process.stderr.write(line));});return child;
}
async function stop(child){await new Promise(done=>{child.once('exit',done);child.kill();});}
const post=async(path,value)=>{const response=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});assert.equal(response.status,200,await response.clone().text());return (await response.json()).result;};
const rpc=(action,args)=>post('/api/dispatch',{action,args,sessionId:'package-test'});
let child=await start();
try{
  assert.equal((await (await fetch(origin+'/health')).json()).product,'moji');
  const html=await(await fetch(origin+'/')).text();assert.match(html,/<title>墨叽/);assert.ok(html.includes('https://github.com/CF-612/MoJi'));assert.ok(!html.includes('1026457465'));assert.ok(!html.includes('https://ifdian.net/a/cuigengji'));
  assert.equal((await fetch(origin+'/api/bootstrap',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'})).status,403);
  const initial=await post('/api/bootstrap',{sessionId:'package-test'});const novelId=initial.books[0].id;
  const chapters=await rpc('chapter.list',{novelId});const chapter=await rpc('chapter.get',{novelId,chapterId:chapters[0].id});
  await rpc('chapter.update',{novelId,chapterId:chapter.id,expectedRevision:chapter.revision,content:'独立安装包保存验证。',summary:'本章梗概仍与正文分开保存。'});
  await stop(child);child=await start();
  const saved=await rpc('chapter.get',{novelId,chapterId:chapter.id});assert.equal(saved.content,'独立安装包保存验证。');assert.equal(saved.summary,'本章梗概仍与正文分开保存。');
  console.log('免安装包验收通过：无外部 Node/npm、页面、双 GitHub、跨站隔离、正文/Summary 保存及重启恢复。');
}finally{await stop(child);}
