import React,{useContext,useEffect,useRef,useState} from 'react';
import {FilePicker,type Call,type Run} from '../../shared/management-page.tsx';
import type {Catalog,TransferFile,TransferPreview,ImportResult} from '../../../contracts/transfer.ts';
import {SessionScope} from '../../shared/state.js';
import {prepareTransferDrafts} from '../chapters/chapterSessions.ts';
import {readTransferFile} from './file.ts';

type Entry={file:TransferFile;kind:string};
type Preview=TransferPreview&{files:{name:string;kind:string;counts:{chapters:number;memory:number;beats:number;presets:number}}[]};
const message=(e:unknown)=>e instanceof Error?e.message:String(e);
const usage=[['auto','自动识别'],['chapters','正文'],['character','人物资料'],['world','世界设定'],['planning','规划资料'],['preset','写作要求']];
async function draft(key:string,value?:unknown){
  if(!globalThis.indexedDB)return null;
  return new Promise<any>((resolve,reject)=>{
    const open=indexedDB.open('cuigengji-transfer-drafts',1);open.onupgradeneeded=()=>open.result.createObjectStore('drafts');open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{const db=open.result,tx=db.transaction('drafts',value===undefined?'readonly':'readwrite'),store=tx.objectStore('drafts');const req=value===undefined?store.get(key):value===null?store.delete(key):store.put(value,key);req.onerror=()=>reject(req.error);tx.oncomplete=()=>{db.close();resolve(req.result);};tx.onerror=()=>{db.close();reject(tx.error);};};
  });
}
export function BatchImport({call,run,busy,library,novelId,onOpen,onDone}:{call:Call;run:Run;busy:boolean;library:Catalog;novelId?:string;onOpen?:(id:string)=>unknown;onDone:()=>Promise<unknown>}){
  const scope=useContext(SessionScope);
  const [entries,setEntries]=useState<Entry[]>([]),[targetId,setTargetId]=useState(novelId||''),[title,setTitle]=useState('导入作品');
  const [preview,setPreview]=useState<Preview|null>(null),[result,setResult]=useState<ImportResult|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const request=useRef(crypto.randomUUID()),version=useRef(0),loaded=useRef(false),storageKey='batch:'+ (novelId||'new');
  useEffect(()=>{let live=true;void draft(storageKey).then(saved=>{if(live&&saved?.entries?.length){setEntries(saved.entries);setTargetId(saved.targetId||'');setTitle(saved.title||'导入作品');setNotice('已找回本机未完成的导入；请重新预览后确认。');}}).catch(()=>{}).finally(()=>{loaded.current=true;});return()=>{live=false;};},[storageKey]);
  useEffect(()=>{if(loaded.current)void draft(storageKey,entries.length?{entries,targetId,title}:null).catch(()=>setNotice('本机暂时无法保留导入草稿，请保持此页面打开。'));},[entries,targetId,title,storageKey]);
  const reset=()=>{version.current++;setPreview(null);setResult(null);setError('');request.current=crypto.randomUUID();};
  const choose=(chosen:File[])=>{reset();void run(async()=>{
    if(entries.length+chosen.length>100)throw new Error('每批最多 100 个文件');
    if(chosen.reduce((n,f)=>n+f.size,0)>64*1024*1024)throw new Error('每批最多 64 MB，请拆分');
    const next:Entry[]=[];for(const file of chosen)next.push({file:await readTransferFile(file),kind:'auto'});
    setEntries(old=>[...old,...next]);
  });};
  const file=()=>({name:'批量导入.json',json:{format:'cuigengji-batch',version:1,files:entries}});
  const options=()=>({mode:'copy',targetId:targetId||null,title});
  const inspect=()=>{setError('');setPreview(null);const current=++version.current;void run(async()=>{try{const p=await call<Preview>('transfer.preview',{file:file(),options:options()});if(current===version.current)setPreview(p);}catch(e){if(current===version.current)setError(message(e));}});};
  const confirm=()=>{if(!preview?.valid)return;void run(async()=>{
    try{const protection=await prepareTransferDrafts({scope,novelIds:library.books.map(book=>book.id),call});const checked=await call<Preview>('transfer.preview',{file:file(),options:options()});if(!checked.valid||checked.proof!==preview.proof){setPreview(checked);throw new Error('草稿已检查保存，批量预览已更新，请核对后再次确认。');}protection.assertClean();const done=await call<ImportResult>('transfer.import',{file:file(),options:options(),proof:preview.proof,requestId:request.current});setResult(done);await protection.refresh();void draft(storageKey,null).catch(()=>{});await onDone();}
    catch(e){setError(message(e));}
  });};
  const move=(index:number,delta:number)=>{reset();setEntries(old=>{const next=[...old];[next[index],next[index+delta]]=[next[index+delta],next[index]];return next;});};
  return <section aria-label="批量导入"><p className="transfer-caption">把多份正文、设定与要求放进同一部作品。按下方顺序导入；先核对预览，再一次性保存。完整作品备份请使用“导入 / 恢复”。</p>
    {!result&&<><FilePicker label="添加多个文件" name="批量导入文件" accept=".json,.txt,.md,.png" multiple disabled={busy} onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value='';choose(files);}}/>
      <label className="management-field">目标作品<select aria-label="批量目标作品" disabled={busy} value={targetId} onChange={e=>{reset();setTargetId(e.target.value);}}><option value="">新建一部作品</option>{library.books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label>
      {!targetId&&<label className="management-field">新作品名称<input aria-label="批量新作品名称" disabled={busy} value={title} onChange={e=>{reset();setTitle(e.target.value);}}/></label>}
      <ol className="transfer-batch-list">{entries.map((entry,i)=><li key={i}><strong>{entry.file.name}</strong><div className="transfer-batch-controls"><select aria-label={entry.file.name+' 用途'} disabled={busy||! /\.(md|txt)$/i.test(entry.file.name)} value={entry.kind} onChange={e=>{reset();setEntries(old=>old.map((v,j)=>j===i?{...v,kind:e.target.value}:v));}}>{usage.map(([v,label])=><option key={v} value={v}>{label}</option>)}</select><button aria-label={'上移 '+entry.file.name} disabled={busy||i===0} onClick={()=>move(i,-1)}>↑</button><button aria-label={'下移 '+entry.file.name} disabled={busy||i===entries.length-1} onClick={()=>move(i,1)}>↓</button><button disabled={busy} onClick={()=>{reset();setEntries(old=>old.filter((_,j)=>j!==i));}}>移除</button></div></li>)}</ol>
      <div className="management-actions"><button disabled={busy||!entries.length||!targetId&&!title.trim()} onClick={inspect}>预览这批内容</button><button disabled={busy||!entries.length} onClick={()=>{reset();setEntries(old=>[...old].sort((a,b)=>a.file.name.localeCompare(b.file.name,'zh-CN',{numeric:true})));}}>按文件名排序</button></div>
      {preview&&<aside className="transfer-summary" aria-label="批量导入预览"><h3>准备放入《{preview.target}》</h3><p>{preview.counts.chapters} 章 · {preview.counts.memory} 条设定 · {preview.counts.beats} 个情节 · {preview.counts.presets} 套要求</p><ol>{preview.files.map((item,i)=><li key={i}>{item.name}：{item.counts.chapters} 章，{item.counts.memory} 条设定</li>)}</ol>{preview.capacity&&<p className="management-hint">已通过云端容量检查（保存约 {(preview.capacity.storedBytes/1024).toFixed(0)} KB）</p>}{preview.warnings.map(w=><p className="management-hint" key={w}>{w}</p>)}{preview.conflicts.map(w=><p role="alert" key={w}>{w}</p>)}<details><summary>查看正文与资料样例</summary>{preview.samples?.map((s,i)=><div key={i}><h4>{s.title}</h4><pre style={{whiteSpace:'pre-wrap'}}>{s.content}</pre></div>)}</details><button className="primary" disabled={busy||!preview.valid} onClick={confirm}>确认批量导入</button></aside>}
    </>}
    {error&&<p role="alert">{error}<br/>所选文件仍保留。连接失败时可再次确认；同一批内容不会重复创建。</p>}
    {notice&&<p role="status">{notice}</p>}
    {result&&<div className="transfer-complete" role="status"><h3>{result.repeated?'这批内容已经导入过':'批量导入完成'}</h3><p>{result.counts.chapters} 章 · {result.counts.memory} 条设定</p><p>导入前备份：{result.backupDir}</p>{result.novelIds[0]&&onOpen&&<button className="primary" onClick={()=>onOpen(result.novelIds[0])}>打开作品</button>}<button onClick={()=>{reset();setEntries([]);}}>继续导入</button></div>}
  </section>;
}
