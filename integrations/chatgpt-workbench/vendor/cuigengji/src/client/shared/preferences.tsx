import {normalizeCardColors,defaultCardColors} from './card-colors.js';
import {CardColorFields} from './card-appearance.tsx';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import manifest from '../../../package.json' with { type: 'json' };
import aboutSticker from '../assets/haoye.png';

export interface Preferences {
  theme: 'system' | 'light' | 'dark';
  cardColors: Record<string,string>;
  fontSize: number; leading: number; directory: boolean;
  planningView: 'canvas' | 'list'; memoryView: 'canvas' | 'list'; motion: 'system' | 'reduce';
}
export const defaults: Preferences = { theme:'system', cardColors: {...defaultCardColors}, fontSize: 18, leading: 1.95, directory: true, planningView: 'canvas', memoryView: 'list', motion: 'system' };
const key = 'cuigengji:workbench:preferences:v1';
function read(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem(key) || '{}');
    return {theme:['light','dark'].includes(p.theme)?p.theme:'system',cardColors:normalizeCardColors(p.cardColors),fontSize: [16,18,20,22].includes(p.fontSize) ? p.fontSize : defaults.fontSize,
      leading: [1.7,1.95,2.2].includes(p.leading) ? p.leading : defaults.leading,
      directory: typeof p.directory === 'boolean' ? p.directory : defaults.directory,
      planningView: p.planningView === 'list' ? 'list' : 'canvas', memoryView: p.memoryView === 'canvas' ? 'canvas' : 'list',
      motion: p.motion === 'reduce' ? 'reduce' : 'system'};
  } catch { return defaults; }
}
const Context = createContext({ preferences: defaults, update: (_: Partial<Preferences>) => {}, error: '' });
export const useWorkbenchPreferences = () => useContext(Context);
export function PreferencesProvider({children}: {children: React.ReactNode}) {
  const [preferences, set] = useState(read), [error, setError] = useState('');
  useEffect(()=>{document.documentElement.dataset.themePreference=preferences.theme;},[preferences.theme]);
  const update = (next: Partial<Preferences>) => set(previous => {
    const value = {...previous, ...next};
    try {localStorage.setItem(key, JSON.stringify(value)); setError('');}
    catch {setError('当前浏览器无法保存偏好，本次会话仍然生效。');}
    return value;
  });
  useEffect(() => {const sync = (e: StorageEvent) => {if(e.key === key) set(read());}; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);}, []);
  return <Context.Provider value={{preferences, update, error}}>{children}</Context.Provider>;
}
export function Modal({title, close, children, className = ''}: {title: string; close: () => void; children: React.ReactNode; className?: string}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {const previous = document.activeElement as HTMLElement | null; ref.current?.showModal(); return () => {previous?.focus();};}, []);
  return <dialog className={`utility-modal ${className}`} ref={ref} aria-label={title} onCancel={e => {e.preventDefault();close();}}>
    <header className="utility-head"><h2>{title}</h2><button type="button" aria-label={`关闭${title}`} onClick={close}>×</button></header>
    <div className="utility-content">{children}</div>
  </dialog>;
}
export function PreferencesDialog({close, novelTitle, onPreset}: {close: () => void; novelTitle?: string; onPreset?: () => void}) {
  const {preferences:p, update, error} = useWorkbenchPreferences();
  return <Modal title="设置" close={close}>
    <section className="preference-section"><h3>外观</h3><label className="preference-row">夜间模式<select aria-label="夜间模式" value={p.theme} onChange={e=>update({theme:e.target.value as Preferences['theme']})}><option value="system">跟随环境</option><option value="light">浅色</option><option value="dark">深色</option></select></label><p className="muted">立即生效，按设备保存。跟随环境时优先使用聊天宿主主题。</p></section>
    {onPreset && <section className="preference-section"><div className="preference-work-heading"><h3>当前作品</h3><small title={novelTitle}>{novelTitle}</small></div><button className="preference-action" onClick={onPreset} aria-label="写作预设"><span><strong>写作预设</strong><small>叙述风格、表达习惯，以及希望 AI 遵守的写作要求</small></span><span aria-hidden="true">›</span></button></section>}
    <section className="preference-section"><h3>正文显示</h3><div className="split">
    <label>字号<select aria-label="默认正文字号" value={p.fontSize} onChange={e=>update({fontSize:Number(e.target.value)})}>{[16,18,20,22].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
    <label>行距<select aria-label="正文行距" value={p.leading} onChange={e=>update({leading:Number(e.target.value)})}><option value={1.7}>紧凑</option><option value={1.95}>适中</option><option value={2.2}>宽松</option></select></label></div>
    <div className="reading-preview"><small>阅读预览</small><p style={{fontSize:p.fontSize,lineHeight:p.leading}}>雨停以后，街道重新安静下来。窗边的灯仍亮着，故事还在继续。</p></div></section>
    <section className="preference-section"><h3>卡片颜色</h3><CardColorFields/></section>
    <section className="preference-section"><h3>打开工作台时</h3><label className="preference-row">默认展开目录<input type="checkbox" checked={p.directory} onChange={e=>update({directory:e.target.checked})}/></label>
      <label className="preference-row">规划默认视图<select value={p.planningView} onChange={e=>update({planningView:e.target.value as Preferences['planningView']})}><option value="canvas">流程图</option><option value="list">列表</option></select></label>
      <label className="preference-row">设定默认视图<select value={p.memoryView} onChange={e=>update({memoryView:e.target.value as Preferences['memoryView']})}><option value="list">列表</option><option value="canvas">关系图</option></select></label><p className="muted">下次进入对应页面时生效。</p></section>
    <section className="preference-section"><label className="preference-row">动画效果<select value={p.motion} onChange={e=>update({motion:e.target.value as Preferences['motion']})}><option value="system">跟随系统</option><option value="reduce">减少动态效果</option></select></label></section>
    <footer className="utility-footer"><button onClick={()=>update(defaults)}>恢复默认设置</button><small role="status">{error || '偏好自动保存在此浏览器'}</small></footer>
  </Modal>;
}
export function ProseDisplay() {
  const {preferences:p, update} = useWorkbenchPreferences();
  return <details className="menu prose-display"><summary aria-label="正文显示设置"><span aria-hidden="true">Aa</span>显示</summary><div className="menu-panel">
    <label>字号<select aria-label="正文字号" value={p.fontSize} onChange={event=>update({fontSize:Number(event.target.value)})}>{[16,18,20,22].map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    <label>行距<select aria-label="当前正文行距" value={p.leading} onChange={event=>update({leading:Number(event.target.value)})}><option value={1.7}>紧凑</option><option value={1.95}>适中</option><option value={2.2}>宽松</option></select></label>
  </div></details>;
}
export function AboutDialog({close}: {close: () => void}) {
  const [copyStatus, setCopyStatus] = useState('');
  const groupNumber = useRef<HTMLElement>(null);
  const copyGroup = async () => {
    try {
      await navigator.clipboard.writeText('1026457465');
      setCopyStatus('群号已复制');
    } catch {
      const selection = window.getSelection();
      if (groupNumber.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(groupNumber.current);
        selection.removeAllRanges(); selection.addRange(range);
      }
      setCopyStatus('可选中群号，按 Ctrl+C 复制。');
    }
  };
  return <Modal title="关于催更姬" close={close} className="about-modal">
    <section className="about-overview">
      <div>
        <div className="about-identity"><h2>催更姬</h2><span className="about-version">v{manifest.version}</span></div>
        <p className="about-tagline">让大肥鱼成为你的小说写作助手。</p>
      </div>
      <img className="about-sticker" src={aboutSticker} width={384} height={384} alt="好耶！紫发少女的欢呼贴纸"/>
      <p className="about-description">基于 mistnest 的开源催更姬迁移到原生聊天侧栏。把正文、情节规划、人物与世界设定放在同一个工作台，让你和 AI 一起讨论、整理并推进故事。</p>
    </section>
    <div className="about-contacts" aria-label="交流与支持">
      <button type="button" className="about-contact" onClick={copyGroup} aria-label="复制交流群号 1026457465" title="复制群号">
        <span className="about-contact-label">交流群</span><strong ref={groupNumber}>1026457465</strong><span className="about-contact-mark" aria-hidden="true">{copyStatus === '群号已复制' ? '✓' : '⧉'}</span>
      </button>
      <a className="about-contact" href="https://ifdian.net/a/cuigengji" target="_blank" rel="noopener noreferrer">
        <span className="about-contact-label">爱发电</span><strong>支持催更姬</strong><span className="about-contact-mark" aria-hidden="true">↗</span>
      </a>
      <a className="about-contact" href="https://github.com/mistnest/dsh-cuigengji-plugin" target="_blank" rel="noopener noreferrer">
        <span className="about-contact-label">GitHub</span><strong>查看开源项目</strong><span className="about-contact-mark" aria-hidden="true">↗</span>
      </a>
    </div>
    <p className="about-copy-status" role="status">{copyStatus}</p>
    <footer className="about-welcome"><p>欢迎交流、合作与投喂。</p><p>每一份支持都会化作开发所需的 Token，让催更姬更新得更快一点。</p></footer>
  </Modal>;
}
