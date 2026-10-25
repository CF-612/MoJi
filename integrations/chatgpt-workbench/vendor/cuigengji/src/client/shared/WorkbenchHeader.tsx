import {workbenchMenuStyles} from './workbench-menu-style.ts';
import {DshConnectionContext,DshConnectionCard} from './dsh-connection.tsx';
import {ToolSheet} from './ToolSheet.tsx';
import moji from '../assets/moji.png';
import React,{useContext} from 'react';
import {useModules} from '../modules/context.tsx';
import {navigationModules} from '../modules/registry.mjs';
import {Icon} from './icons.tsx';

interface Props {
  home: boolean; novelTitle?: string; tab: string; busy: boolean; refreshing: boolean;
  onHome: () => void; onTab: (tab: string) => void; onRefresh: () => void; onSettings: () => void; onAbout: () => void; onSearch?: () => void; onImport?: () => void; onManage?: () => void; onTour?: () => void; tourMenuOpen?:boolean; onTourMenuOpen?:(open:boolean)=>void; tourMenuGuide?:React.ReactNode; tourEntry?:boolean;
}

export function WorkbenchHeader({home, novelTitle, tab, busy, refreshing, onHome, onTab, onRefresh, onSettings, onAbout, onSearch, onImport, onManage, onTour, tourMenuOpen, onTourMenuOpen, tourMenuGuide, tourEntry}: Props) {
  const modules=useModules(),dsh=useContext(DshConnectionContext);
  const menuItems=[
    dsh?<DshConnectionCard key="connection"/>:null,
    novelTitle&&!home&&onSearch&&<MenuRow key="search" icon="search" title="搜索作品" note="查找正文、资料与规划" disabled={busy} onClick={onSearch}/>,
    <MenuRow key="refresh" icon="refresh" navigation={false} title="刷新当前页面" note="获取最新内容，保留当前草稿" disabled={busy||refreshing} onClick={onRefresh}/>,
    novelTitle&&!home&&<MenuRow key="preset" icon="edit" title="写作要求" note="管理这部作品的写作预设" onClick={()=>onTab('preset')}/>,
    novelTitle&&!home&&<MenuRow key="manage" icon="book" title="作品与备份" note="管理作品、导入与导出" onClick={()=>onTab('manage')}/>,
    onImport&&<MenuRow key="empty-import" icon="download" title="导入 / 导出" note="导入已有作品或备份" disabled={busy} onClick={onImport}/>,
    onManage&&<MenuRow key="empty-manage" icon="book" title="作品与备份" note="管理作品与恢复备份" disabled={busy} onClick={onManage}/>,
    novelTitle&&!home&&onTour&&<MenuRow key="tour" icon="book" title="页面导览" note="只逛页面，随时结束" disabled={busy} onClick={onTour}/>,
    <MenuRow key="about" icon="about" title="关于与来源" label="关于墨叽" note="版本信息、交流与开源致谢" onClick={onAbout}/>,
  ].filter(Boolean);
  // A supplied connection capability belongs to native DSH; otherwise Settings is first.
  menuItems.splice(dsh?1:0,0,<MenuRow key="settings" icon="settings" title="设置" note="界面外观与工作台偏好" onClick={onSettings}/>);
  return <header className="workbench-header workbench-navigation">
    <div className="navigation-origin"><button className="navigation-home" aria-label="作品首页" aria-current={home ? 'page' : undefined} disabled={busy} onClick={onHome}><img src={moji} width={24} height={24} alt=""/><span>{home?'墨叽':'作品库'}</span></button>
    </div>
    {novelTitle && !home && <nav className="navigation-tabs" aria-label="小说功能">{[['detail','详情'],['chapters','正文'], ['plan','规划'], ['memory','资料'], ...navigationModules(modules).filter(([id])=>id!=='overview')].map(([id, name]) => <button key={id} disabled={busy} className={tab === id ? 'selected' : ''} aria-pressed={tab === id} onClick={() => onTab(id)}>{name}</button>)}</nav>}
    <div className={`navigation-actions${tourEntry?' tour-settings-entry':''}`}><style>{workbenchMenuStyles}</style><ToolSheet icon="more-horizontal" label="工作台更多功能" title="工作台" dismissOnAction controlledOpen={tourMenuOpen} onOpenChange={onTourMenuOpen} guide={tourMenuGuide}><div className="workbench-more-options">{menuItems}</div></ToolSheet></div>
  </header>;
}

function MenuRow({icon,title,note,label=title,disabled=false,navigation=true,onClick}:any){return <button type="button" aria-label={label} disabled={disabled} onClick={onClick}><span className="workbench-menu-icon" aria-hidden="true"><Icon name={icon}/></span><span className="workbench-menu-copy"><strong>{title}</strong><small>{note}</small></span>{navigation&&<span className="workbench-menu-arrow" aria-hidden="true">›</span>}</button>;}
