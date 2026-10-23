import {editorDefaults,normalizeEditorPreferences,proseAppearance} from './editor-preferences.mjs';
import {normalizeModules,modules,profiles,profileModules,toggleModule} from '../modules/registry.mjs';
import {normalizeCardColors,defaultCardColors} from './card-colors.js';
import {CardColorFields,CardLegend} from './card-appearance.tsx';
import {settingsStyles} from './settings-style.ts';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import manifest from '../../../package.json' with { type: 'json' };
import aboutSticker from '../assets/moji.png';
import {brand} from '../../domain/brand.js';
import {UpdatePanel} from './UpdateNotice.tsx';

export interface Preferences {
  modules: Record<string,boolean>;
  theme: 'system' | 'light' | 'dark';
  cardColors: Record<string,string>;
  numbering: 'chinese'|'arabic';
  fontSize: number; leading: number; directory: boolean;
  fontFamily:string; fontColor:string; fontWeight:number; fontItalic:boolean; fontUnderline:boolean; letterSpacing:number; titleAlign:string; pageMargin:number; mobilePageMargin:number; bottomSpace:number; showInfoBar:boolean; transparentTitle:boolean; countPunctuation:boolean; wordCountPosition:string; backdropBlur:boolean; openAtEnd:boolean; quickInput:boolean; pairedPunctuation:boolean; writingSpeed:boolean; writingSpeedCompact:boolean;
  planningView: 'canvas' | 'outline' | 'timeline'; memoryView: 'canvas' | 'list'; motion: 'system' | 'reduce';
}
export const defaults: Preferences = { ...editorDefaults, modules:normalizeModules(), numbering:'chinese', theme:'system', cardColors: {...defaultCardColors}, fontSize: 18, leading: 1.95, directory: true, planningView: 'timeline', memoryView: 'list', motion: 'system' };
const key = 'cuigengji:workbench:preferences:v1';
function read(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem(key) || '{}');
    return {modules:normalizeModules(p.modules),numbering:p.numbering==='arabic'?'arabic':'chinese',theme:['light','dark'].includes(p.theme)?p.theme:'system',cardColors:normalizeCardColors(p.cardColors),...normalizeEditorPreferences(p),
      directory: typeof p.directory === 'boolean' ? p.directory : defaults.directory,
      planningView: ['list','timeline'].includes(p.planningView) ? 'timeline' : ['canvas','outline'].includes(p.planningView) ? p.planningView : defaults.planningView, memoryView: p.memoryView === 'canvas' ? 'canvas' : 'list',
      motion: p.motion === 'reduce' ? 'reduce' : 'system'};
  } catch { return defaults; }
}
const Context = createContext({ preferences: defaults, update: (_: Partial<Preferences>) => {}, error: '' });
export const useWorkbenchPreferences = () => useContext(Context);
export function PreferencesProvider({children}: {children: React.ReactNode}) {
  const [preferences, set] = useState(read), [error, setError] = useState('');
  useEffect(()=>{document.documentElement.dataset.themePreference=preferences.theme;document.documentElement.dataset.backdropBlur=String(preferences.backdropBlur);},[preferences.theme,preferences.backdropBlur]);
  const update = (next: Partial<Preferences>) => set(previous => {
    const value = {...previous, ...next,modules:normalizeModules(next.modules??previous.modules)};
    try {localStorage.setItem(key, JSON.stringify(value)); setError('');}
    catch {setError('当前浏览器无法保存偏好，本次会话仍然生效。');}
    return value;
  });
  useEffect(() => {const sync = (e: StorageEvent) => {if(e.key === key) set(read());}; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);}, []);
  return <Context.Provider value={{preferences, update, error}}><style>{`html:not([data-backdrop-blur=true]) dialog::backdrop{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}html[data-backdrop-blur=true] dialog::backdrop{backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}`}</style>{children}</Context.Provider>;
}
export function Modal({title, close, children, className = ''}: {title: string; close: () => void; children: React.ReactNode; className?: string}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {const previous = document.activeElement as HTMLElement | null; ref.current?.showModal(); return () => {previous?.focus();};}, []);
  return <dialog className={`utility-modal ${className}`} ref={ref} aria-label={title} onCancel={e => {e.preventDefault();close();}}>
    <header className="utility-head"><button className="utility-back" type="button" aria-label={`关闭${title}`} onClick={close}>‹</button><h2>{title}</h2></header>
    <div className="utility-content">{children}</div>
  </dialog>;
}
type SettingsTab='appearance'|'typography'|'planning'|'colors'|'modules'|'other';
const settingsTabs:[SettingsTab,string][]=[['appearance','界面与视图'],['typography','正文与目录'],['modules','功能模块'],['other','其他']];
const themeChoices=[{id:'light',label:'浅色'},{id:'dark',label:'深色'},{id:'system',label:'跟随系统'}] as const;
const themeGlyphs:Record<Preferences['theme'],React.ReactNode>={
  light:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></>,
  dark:<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>,
  system:<><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8.5 20h7M12 16v4"/></>,
};
const leadingName=(value:number)=>value===1.7?'紧凑':value===2.2?'宽松':'适中';
function SettingCard({title,note,children}:{title:string;note?:string;children:React.ReactNode}) {
  return <div className="settings-card"><header className="settings-card-head"><h3>{title}</h3>{note&&<p>{note}</p>}</header>{children}</div>;
}
/** 模块开关的一行：名称、说明与开关；aria-label 沿用「显示模块名」，既有测试依赖它。 */
function ModuleToggle({id}:{id:string}) {
  const {preferences:p,update}=useWorkbenchPreferences();
  const module=modules.find(item=>item.id===id);
  if(!module)return null;
  return <label className="settings-row settings-switch-row"><span className="settings-row-text"><strong>{module.name}</strong><small>{id==='foreshadow'?'在规划和仪表盘显示伏笔；关闭仅隐藏入口，不删除数据。':module.description}{module.dependencies.length?' · 需要时间线':''}</small></span><input type="checkbox" className="settings-switch" aria-label={`显示${module.name}`} checked={p.modules[module.id]} onChange={event=>update({modules:toggleModule(p.modules,module.id,event.target.checked)})}/></label>;
}
export function PreferencesDialog({close, novelTitle, onPreset}: {close: () => void; novelTitle?: string; onPreset?: () => void}) {
  const {preferences:p, update, error} = useWorkbenchPreferences();
  const [tab, setTab] = useState<SettingsTab>('appearance');
  const [search,setSearch]=useState('');
  const searchRows:[SettingsTab,string][]=[['appearance','主题 深色 浅色 跟随系统 动效 画布 视图 卡片颜色'],['typography','正文 字号 行距 编号 目录'],['modules','功能模块 伏笔 关系演变 时间线 分页 分组 梗概 仪表盘'],['other','更新 关于 写作要求 预设 背景 模糊']];
  const themeKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key==='ArrowRight'||event.key==='ArrowDown' ? 1 : event.key==='ArrowLeft'||event.key==='ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = themeChoices.findIndex(choice=>choice.id===p.theme);
    const next = themeChoices[(index+step+themeChoices.length)%themeChoices.length];
    update({theme:next.id});
    (event.currentTarget.querySelector(`[data-theme-choice="${next.id}"]`) as HTMLElement|null)?.focus();
  };
  return <Modal title="设置" close={close} className="settings-modal">
    <style>{settingsStyles}</style>
    <label className="settings-search">搜索设置<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="例如：字号、伏笔、深色"/></label>{search.trim()&&<div className="row" aria-label="设置搜索结果">{searchRows.filter(([,text])=>text.includes(search.trim())).map(([id,text])=><button key={id} title={text} onClick={()=>{setTab(id);setSearch('');}}>{settingsTabs.find(t=>t[0]===id)?.[1]} →</button>)}{!searchRows.some(([,text])=>text.includes(search.trim()))&&<small>没有匹配设置</small>}</div>}<div className="settings-layout">
      <nav className="settings-nav" aria-label="设置分类">
        {settingsTabs.map(([id,label])=><button key={id} type="button" aria-current={tab===id?'true':undefined} onClick={()=>setTab(id)}>{label}</button>)}
      </nav>
      <div className="settings-main">
        <div className="settings-panels">
          <section className="settings-panel" aria-label="界面外观" hidden={tab!=='appearance'}>
            <SettingCard title="主题外观" note="立即生效，按设备保存。跟随系统时优先使用聊天宿主主题。">
              <div className="settings-themes" role="radiogroup" aria-label="主题外观" onKeyDown={themeKey}>
                {themeChoices.map(choice=><button key={choice.id} type="button" role="radio" aria-checked={p.theme===choice.id} aria-label={choice.label} tabIndex={p.theme===choice.id?0:-1} data-theme-choice={choice.id} className="settings-theme" onClick={()=>update({theme:choice.id})}>
                  <span className="settings-theme-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{themeGlyphs[choice.id]}</svg></span>
                  <span className="settings-theme-name">{choice.label}</span>
                </button>)}
              </div>
            </SettingCard>
            <SettingCard title="动效">
              <label className="settings-row"><span className="settings-row-text">动画效果<small>跟随系统时按系统的减少动态效果设置。</small></span><select value={p.motion} onChange={event=>update({motion:event.target.value as Preferences['motion']})}><option value="system">跟随系统</option><option value="reduce">减少动态效果</option></select></label>
            </SettingCard>
            <SettingCard title="正文排版" note="正文显示偏好统一在编辑器“更多”中调整。">
              <button type="button" className="settings-link-row" onClick={()=>setTab('typography')}><span className="settings-row-text"><strong>正文显示设置说明</strong><small>当前 {p.fontSize}px 字号 · {leadingName(p.leading)}行距</small></span><span className="settings-link-mark" aria-hidden="true">›</span></button>
            </SettingCard>
          </section>
          <section className="settings-panel" aria-label="正文与目录" hidden={tab!=='typography'}>
            <SettingCard title="正文显示" note="字号、字体与行距统一在正文编辑器中设置，避免重复入口。">
              <p className="muted">打开任意章节 → 更多 → 字体字号 / 页面布局。字数显示位置和统计口径在“编辑偏好”中设置。</p>
              <p className="muted">当前 {p.fontSize}px 字号 · {leadingName(p.leading)}行距。原有偏好继续保留。</p>
            </SettingCard>
            <SettingCard title="章节编号" note="统一显示已有编号和新建默认标题；保留自定义标题及已保存的原始名称。">
              <label className="settings-row"><span className="settings-row-text">章节与分卷编号<small>中文章节名或阿拉伯数字</small></span><select aria-label="章节编号格式" value={p.numbering} onChange={event=>update({numbering:event.target.value as Preferences['numbering']})}><option value="chinese">中文数字 · 第一章</option><option value="arabic">阿拉伯数字 · 第1章</option></select></label>
            </SettingCard><SettingCard title="目录显示"><label className="settings-row settings-switch-row"><span className="settings-row-text">默认展开目录<small>打开工作台时自动展开章节目录</small></span><input type="checkbox" className="settings-switch" checked={p.directory} onChange={event=>update({directory:event.target.checked})}/></label></SettingCard><SettingCard title="阅读预览">
              <div className="reading-preview"><small>阅读预览</small><p style={proseAppearance(p)}>雨停以后，街道重新安静下来。窗边的灯仍亮着，故事还在继续。</p></div>
            </SettingCard>
          </section>
          <section className="settings-panel" aria-label="界面与视图" hidden={tab!=='appearance'}>
            <SettingCard title="默认视图" note="下次进入对应页面时生效。">
              <label className="settings-row"><span className="settings-row-text">规划默认视图<small>作品尚未记录规划视图时使用；已有作品优先恢复上次视图</small></span><select value={p.planningView} onChange={event=>update({planningView:event.target.value as Preferences['planningView']})}><option value="timeline">时间线</option><option value="canvas">画布</option><option value="outline">大纲</option></select></label>
              <label className="settings-row"><span className="settings-row-text">设定默认视图<small>打开设定页时先显示列表或关系图</small></span><select value={p.memoryView} onChange={event=>update({memoryView:event.target.value as Preferences['memoryView']})}><option value="list">列表</option><option value="canvas">关系图</option></select></label>
              
            </SettingCard>
            
            
          </section>
          <section className="settings-panel" aria-label="卡片颜色" hidden={tab!=='appearance'}>
            <SettingCard title="卡片颜色" note="点色块取色，「重置」恢复默认值。">
              <CardColorFields/>
              <div className="settings-legends">
                <div className="settings-legend"><span className="settings-group-label">设定类型</span><CardLegend/></div>
                <div className="settings-legend"><span className="settings-group-label">规划进展</span><CardLegend planning/></div>
              </div>
            </SettingCard>
          </section>
          <section className="settings-panel" aria-label="功能模块" hidden={tab!=='modules'}>
            <SettingCard title="模块预设" note="一键切换常用组合；单独开关会立即覆盖当前预设。">
              <div className="settings-presets" role="group" aria-label="模块预设">{Object.entries(profiles).map(([id,preset])=><button key={id} type="button" className="settings-preset" onClick={()=>update({modules:profileModules(id)})}>{preset.name}</button>)}</div>
            </SettingCard>
            <SettingCard title="页面与导航" note="按设备保存显示偏好。隐藏不删除资料，AI 工具仍可读写已有数据。">
              <ModuleToggle id="pages"/><ModuleToggle id="groups"/><ModuleToggle id="overview"/><ModuleToggle id="timeline"/><ModuleToggle id="summary"/>
            </SettingCard>
            <SettingCard title="内容辅助">
              <ModuleToggle id="foreshadow"/><ModuleToggle id="evolution"/>
              <p className="settings-hint">本页集中管理所有模块开关。关闭仅隐藏界面，不删除数据。完整自定义模块编写、安装和管理属于后续目标，本次未交付。</p>
            </SettingCard>
          </section>
          <section className="settings-panel" aria-label="其他" hidden={tab!=='other'}>
            {onPreset && <SettingCard title="当前作品" note={novelTitle?`作品：${novelTitle}`:'还没有选定作品'}>
              <button type="button" className="settings-link-row" onClick={onPreset} aria-label="写作预设"><span className="settings-row-text"><strong>写作预设</strong><small>叙述风格、表达习惯，以及希望 AI 遵守的写作要求</small></span><span className="settings-link-mark" aria-hidden="true">›</span></button>
            </SettingCard>}
            <SettingCard title="背景效果" note="默认关闭，保留弹窗背景遮罩。只影响此设备显示。"><label className="settings-row settings-switch-row"><span className="settings-row-text">背景模糊<small>弹窗后方背景轻微模糊；关闭时仍保留遮罩。</small></span><input type="checkbox" className="settings-switch" checked={p.backdropBlur} onChange={event=>update({backdropBlur:event.target.checked})}/></label></SettingCard><SettingCard title="版本与数据">
              <div className="settings-facts"><div className="settings-fact"><span>版本</span><strong>v{brand.version}</strong></div><div className="settings-fact"><span>偏好存储</span><strong>仅此浏览器</strong></div></div>
              <p className="settings-hint">墨叽基于 mistnest 的开源催更姬开发，遵循 MIT 许可；设置项按设备保存，不随作品同步。</p>
            </SettingCard>
          </section>
        </div>
        <footer className="settings-footer"><button type="button" onClick={()=>update(defaults)}>恢复默认设置</button><small role="status">{error || '偏好自动保存在此浏览器'}</small></footer>
      </div>
    </div>
  </Modal>;
}
export function ProseDisplay({inline=false}: {inline?:boolean}={}) {
  const {preferences:p, update} = useWorkbenchPreferences();
  const fields=<>
    <label>字号<select aria-label="正文字号" value={p.fontSize} onChange={event=>update({fontSize:Number(event.target.value)})}>{Array.from({length:19},(_,i)=>i+14).map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    <label>行距<select aria-label="当前正文行距" value={p.leading} onChange={event=>update({leading:Number(event.target.value)})}>{![1.7,1.95,2.2].includes(p.leading)&&<option value={p.leading}>{p.leading.toFixed(2)} 倍</option>}<option value={1.7}>紧凑</option><option value={1.95}>适中</option><option value={2.2}>宽松</option></select></label>
  </>;
  return inline?<fieldset className="prose-display-fields"><legend>正文显示</legend>{fields}</fieldset>:<details className="menu prose-display"><summary aria-label="正文显示设置"><span aria-hidden="true">Aa</span>显示</summary><div className="menu-panel">{fields}</div></details>;
}
export function AboutDialog({close}: {close: () => void}) {
  return <Modal title="关于墨叽" close={close} className="about-modal">
    <section className="about-overview">
      <div>
        <div className="about-identity"><h2>墨叽</h2><span className="about-version">v{brand.version}</span></div>
        <p className="about-tagline">一只陪你写故事的烟灰蛸。</p>
      </div>
      <img className="about-sticker" src={aboutSticker} width={384} height={384} alt="墨叽的烟灰蛸形象"/>
      <p className="about-description">把正文、情节规划、人物与世界放在同一张书桌上，和 AI 一起把故事写下去。墨叽基于 mistnest 的开源催更姬开发，保留上游 MIT 许可与署名。</p>
    </section>
    <UpdatePanel/><div className="about-contacts" aria-label="项目源码">
      <a className="about-contact" href="https://github.com/mistnest/dsh-cuigengji-plugin" target="_blank" rel="noopener noreferrer"><span className="about-contact-label">GitHub · 原版</span><strong>催更姬 / mistnest</strong><span className="about-contact-mark" aria-hidden="true">↗</span></a>
      <a className="about-contact" href="https://github.com/CF-612/MoJi" target="_blank" rel="noopener noreferrer"><span className="about-contact-label">GitHub · 现版</span><strong>墨叽 / Moji</strong><span className="about-contact-mark" aria-hidden="true">↗</span></a>
    </div>
    <footer className="about-welcome"><p>墨叽 · 小说工作台</p><p>基于 mistnest 的开源催更姬开发，遵循 MIT 许可。</p></footer>
  </Modal>;
}
