import {App} from '@modelcontextprotocol/ext-apps';

const $ = id => document.getElementById(id);
const embedded = document.documentElement.dataset.mcpApp === 'true';
let app, current, draftRevision, dirty = false, saving = false, ready = false, conflict = false;
const draftKey = 'cuigengji-sidebar-demo-draft';
const backupKey = `${draftKey}-backup`;
function status(text, error = false) {$('status').textContent = text;$('status').className = error ? 'error' : '';}
function remember() {try {localStorage.setItem(draftKey, JSON.stringify({chapterId: current.chapter.id, revision: draftRevision ?? current.chapter.revision, content: $('content').value}));} catch {status('草稿缓存不可用，请及时保存', true);}}
function showBackup(backup) {
  if(backup?.chapterId!==current.chapter.id)return;
  $('draftBackup').hidden=false;$('backupContent').value=backup.content;
  $('backupLabel').textContent=`保留的草稿（基于第 ${backup.revision} 版）`;
}
function retainDraft() {
  if(!dirty)return;
  const backup={chapterId:current.chapter.id,revision:draftRevision ?? current.chapter.revision,content:$('content').value};
  // Stop before replacing the editor if persistent draft storage is unavailable.
  localStorage.setItem(backupKey,JSON.stringify(backup));showBackup(backup);
}
async function call(name, args = {}) {
  if (embedded) {
    const uiName = ['chapter_save','chapter_restore'].includes(name) ? `${name}_from_ui` : name;
    const response = await app.callServerTool({name:uiName, arguments: args});
    if (response.isError) throw new Error(response.content?.find(x=>x.type==='text')?.text || '保存失败');
    return response.structuredContent?.result ?? JSON.parse(response.content.find(x=>x.type==='text').text);
  }
  const response = await fetch('/api/tool', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,args})});
  const result = await response.json(); if(!response.ok) throw new Error(result.error);return result.result;
}
function accept(value, initial = false, force = false) {
  if (!value?.chapter) return;
  if (current && dirty && value.chapter.revision !== current.chapter.revision) {
    conflict = true;status('另一端已修改：草稿保留，请读取最新版本后合并', true);return;
  }
  if (current && dirty && !initial) return;
  // Unchanged polling results must preserve the author's cursor, selection and feedback.
  if (current && !initial && !force && value.chapter.revision === current.chapter.revision) return;
  current = value;draftRevision=value.chapter.revision; $('book').textContent = value.novel.title;$('title').textContent = value.chapter.title;
  $('revision').textContent = `第 ${value.chapter.revision} 版 · ${value.chapter.content.length} 字符`;
  $('content').value = value.chapter.content;$('content').disabled = false;$('save').disabled = false;
  conflict = false;status('已保存');
  if (initial) {
    try {showBackup(JSON.parse(localStorage.getItem(backupKey)));}catch{}
    try {const draft = JSON.parse(localStorage.getItem(draftKey));
      if(draft?.chapterId === current.chapter.id && draft.content !== current.chapter.content){
        $('content').value=draft.content;draftRevision=draft.revision;dirty=true;conflict=draft.revision!==current.chapter.revision;
        status(conflict?'已恢复草稿；服务端版本有变化，请读取最新版后合并':'已恢复未保存草稿', conflict);
      }
    }catch{}
  }
}
async function refresh(manual = false) {
  if(!ready || saving) return;
  try {const value = await call('chapter_read');if(manual){retainDraft();dirty=false;localStorage.removeItem(draftKey);}accept(value,false,manual);}
  catch(error){status(`连接失败，正文仍保留：${error.message}`,true);}
}
$('content').addEventListener('input',()=>{dirty=true;remember();status(conflict?'版本冲突，草稿已保留':'未保存 · 草稿已缓存',conflict);});
$('save').onclick = async()=>{
  if(!ready || saving || !current)return;
  if(conflict){status('请读取最新版本；草稿将保留供你合并',true);return;}
  saving=true;$('save').disabled=true;$('content').disabled=true;status('保存中…');
  try {const value=await call('chapter_save',{content:$('content').value,expectedRevision:current.chapter.revision,reason:'作者在侧栏修改',requestId:crypto.randomUUID()});dirty=false;localStorage.removeItem(draftKey);accept(value);}
  catch(error){remember();status(`保存失败，草稿已保留：${error.message}`,true);}
  finally{saving=false;$('save').disabled=false;$('content').disabled=false;}
};
$('refresh').onclick=()=>refresh(true);
$('reuseDraft').onclick=()=>{if(!current)return;$('content').value=$('backupContent').value;draftRevision=current.chapter.revision;dirty=true;remember();status('保留草稿已放回编辑框，请合并后保存');};
async function showHistory(){
  $('prose').hidden=true;$('history').hidden=false;$('proseTab').setAttribute('aria-selected','false');$('historyTab').setAttribute('aria-selected','true');
  const list=$('versions');list.replaceChildren();
  try{for(const version of (await call('chapter_history')).toReversed()){
    const li=document.createElement('li'),label=document.createElement('p'),pre=document.createElement('pre'),button=document.createElement('button');
    label.textContent=`第 ${version.revision} 版 · ${version.actor.kind==='human'?'作者':'AI'} · ${version.reason || '初始版本'}`;pre.textContent=version.content;button.textContent='恢复此版本';
    button.onclick=async()=>{try{retainDraft();const latest=await call('chapter_read');const value=await call('chapter_restore',{targetRevision:version.revision,expectedRevision:latest.chapter.revision});dirty=false;localStorage.removeItem(draftKey);accept(value);await showHistory();}catch(error){list.textContent=`恢复失败，正文与草稿保留：${error.message}`;}};
    li.append(label,pre,button);list.append(li);
  }}catch(error){list.textContent=error.message;}
}
$('historyTab').onclick=showHistory;
$('proseTab').onclick=()=>{$('prose').hidden=false;$('history').hidden=true;$('proseTab').setAttribute('aria-selected','true');$('historyTab').setAttribute('aria-selected','false');};
$('discuss').onclick=async()=>{
  if(!current)return;const element=$('content');const selection=element.value.slice(element.selectionStart,element.selectionEnd);
  const text=`请围绕作品「${current.novel.title}」的「${current.chapter.title}」讨论。章节 ID：${current.chapter.id}，读取版本：${current.chapter.revision}。${selection?'\n选中片段：\n'+selection:'请通过工具读取最新正文。'}${dirty?'\n编辑框还有未保存草稿，请勿将草稿视作已保存正文。':''}`;
  if(embedded){try{status('正在将引用交给当前聊天…');const result=await app.sendMessage({role:'user',content:[{type:'text',text}]});if(result.isError)throw new Error('客户端拒绝接收讨论引用');status('讨论引用已交给当前聊天');}catch(error){status(`发送失败：${error.message}`,true);}}
  else{try{await navigator.clipboard.writeText(text);status('讨论引用已复制，可粘贴到旁边的聊天');}catch{status('无法访问剪贴板，请手动复制正文',true);}}
};
async function start() { try {
  if(embedded){app=new App({name:'cuigengji-sidebar',version:'0.1.0'});app.ontoolresult=result=>{if(!saving)accept(result.structuredContent?.result);};await app.connect();}
  ready=true;accept(await call('chapter_read'),true);setInterval(()=>refresh(),2000);
}catch(error){status(`工作台连接失败：${error.message}`,true);} }
start();
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
