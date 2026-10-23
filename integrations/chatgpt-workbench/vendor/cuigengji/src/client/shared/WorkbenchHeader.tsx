import {ToolSheet} from './ToolSheet.tsx';
import moji from '../assets/moji.png';
import React from 'react';
import {useModules} from '../modules/context.tsx';
import {navigationModules} from '../modules/registry.mjs';
import {Icon} from './icons.tsx';

interface Props {
  home: boolean; novelTitle?: string; tab: string; busy: boolean; refreshing: boolean;
  onHome: () => void; onTab: (tab: string) => void; onRefresh: () => void; onSettings: () => void; onAbout: () => void; onSearch?: () => void;
}

export function WorkbenchHeader({home, novelTitle, tab, busy, refreshing, onHome, onTab, onRefresh, onSettings, onAbout, onSearch}: Props) {
  const modules=useModules();
  return <header className="workbench-header workbench-navigation">
    <div className="navigation-origin"><button className="navigation-home" aria-label="作品首页" aria-current={home ? 'page' : undefined} disabled={busy} onClick={onHome}><img src={moji} width={24} height={24} alt=""/><span>{home?'墨叽':'作品库'}</span></button>
    </div>
    {novelTitle && !home && <nav className="navigation-tabs" aria-label="小说功能">{[['detail','详情'],['chapters','正文'], ['plan','规划'], ['memory','资料'], ...navigationModules(modules).filter(([id])=>id!=='overview')].map(([id, name]) => <button key={id} disabled={busy} className={tab === id ? 'selected' : ''} aria-pressed={tab === id} onClick={() => onTab(id)}>{name}</button>)}</nav>}
    <div className="navigation-actions"><ToolSheet icon="more-horizontal" label="工作台更多功能" title="工作台" dismissOnAction>{novelTitle&&!home&&onSearch&&<button aria-label="搜索作品" disabled={busy} onClick={onSearch}><Icon name="search"/>搜索作品</button>}<button aria-label="刷新当前页面" disabled={busy||refreshing} onClick={onRefresh}><Icon name="refresh"/>刷新当前页面</button>{novelTitle&&!home&&<><button onClick={()=>onTab('preset')}>写作要求</button><button onClick={()=>onTab('manage')}>作品与备份</button></>}<button aria-label="设置" onClick={onSettings}><Icon name="settings"/>设置</button><button aria-label="关于墨叽" onClick={onAbout}><Icon name="about"/>关于与来源</button></ToolSheet>
    </div>
  </header>;
}
