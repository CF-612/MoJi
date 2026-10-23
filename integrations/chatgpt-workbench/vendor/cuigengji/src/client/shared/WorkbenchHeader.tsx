import {workbenchMenuStyles} from './workbench-menu-style.ts';
import {CloudDeploymentGuide,DeploymentAgentContext} from './CloudDeploymentGuide.tsx';
import {DshConnectionContext,DshConnectionCard} from './dsh-connection.tsx';
import {ToolSheet} from './ToolSheet.tsx';
import moji from '../assets/moji.png';
import React,{useContext} from 'react';
import {useModules} from '../modules/context.tsx';
import {navigationModules} from '../modules/registry.mjs';
import {Icon} from './icons.tsx';

interface Props {
  home: boolean; novelTitle?: string; tab: string; busy: boolean; refreshing: boolean;
  onHome: () => void; onTab: (tab: string) => void; onRefresh: () => void; onSettings: () => void; onAbout: () => void; onSearch?: () => void;
}

export function WorkbenchHeader({home, novelTitle, tab, busy, refreshing, onHome, onTab, onRefresh, onSettings, onAbout, onSearch}: Props) {
  const modules=useModules(),dsh=useContext(DshConnectionContext),deploymentAgent=useContext(DeploymentAgentContext);
  const menuItems=[
    dsh?<DshConnectionCard key="connection"/>:deploymentAgent?<section key="connection" aria-label="连接与云端"><strong>连接与云端</strong><p>当前实例由所用插件及宿主配置管理。更换实例请按所用插件的配置入口接入；这里没有本机 / 云端切换开关，作品不会自动迁移。</p><CloudDeploymentGuide/></section>:null,
    novelTitle&&!home&&onSearch&&<MenuRow key="search" icon="search" title="搜索作品" note="查找正文、资料与规划" disabled={busy} onClick={onSearch}/>,
    <MenuRow key="refresh" icon="refresh" navigation={false} title="刷新当前页面" note="获取最新内容，保留当前草稿" disabled={busy||refreshing} onClick={onRefresh}/>,
    novelTitle&&!home&&<MenuRow key="preset" icon="edit" title="写作要求" note="管理这部作品的写作预设" onClick={()=>onTab('preset')}/>,
    novelTitle&&!home&&<MenuRow key="manage" icon="book" title="作品与备份" note="管理作品、导入与导出" onClick={()=>onTab('manage')}/>,
    <MenuRow key="about" icon="about" title="关于与来源" label="关于墨叽" note="版本信息、交流与开源致谢" onClick={onAbout}/>,
  ].filter(Boolean);
  // Keep Settings second even when a host has no connection card or search action.
  menuItems.splice(1,0,<MenuRow key="settings" icon="settings" title="设置" note="界面外观与工作台偏好" onClick={onSettings}/>);
  return <header className="workbench-header workbench-navigation">
    <div className="navigation-origin"><button className="navigation-home" aria-label="作品首页" aria-current={home ? 'page' : undefined} disabled={busy} onClick={onHome}><img src={moji} width={24} height={24} alt=""/><span>{home?'墨叽':'作品库'}</span></button>
    </div>
    {novelTitle && !home && <nav className="navigation-tabs" aria-label="小说功能">{[['detail','详情'],['chapters','正文'], ['plan','规划'], ['memory','资料'], ...navigationModules(modules).filter(([id])=>id!=='overview')].map(([id, name]) => <button key={id} disabled={busy} className={tab === id ? 'selected' : ''} aria-pressed={tab === id} onClick={() => onTab(id)}>{name}</button>)}</nav>}
    <div className="navigation-actions"><style>{workbenchMenuStyles}</style><ToolSheet icon="more-horizontal" label="工作台更多功能" title="工作台" dismissOnAction><div className="workbench-more-options">{menuItems}</div></ToolSheet></div>
  </header>;
}

function MenuRow({icon,title,note,label=title,disabled=false,navigation=true,onClick}:any){return <button type="button" aria-label={label} disabled={disabled} onClick={onClick}><span className="workbench-menu-icon" aria-hidden="true"><Icon name={icon}/></span><span className="workbench-menu-copy"><strong>{title}</strong><small>{note}</small></span>{navigation&&<span className="workbench-menu-arrow" aria-hidden="true">›</span>}</button>;}
