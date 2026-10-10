import React from 'react';
import {useDialog} from '../../dialog.tsx';
import {ManagementPage, ManagementSection, type Call, type Run, type BackProps} from '../../shared/management-page.tsx';
import type {TransferShortcut} from '../../../contracts/transfer.ts';

type Props = BackProps & {call: Call; novelId?: string; novel?: {title: string}; run: Run; busy: boolean; onTransfer: (value: TransferShortcut) => void};
export function Manage({call, novelId, novel, run, busy, onTransfer, onBack, backLabel}: Props) {
  const {ask} = useDialog();
  return <ManagementPage title="作品与备份" description="管理作品，或前往导入 / 导出带走数据。" {...{onBack, backLabel}}>
    {novelId && <ManagementSection title="当前作品">
      <div className="management-action-row management-current-work"><div><h3>{novel?.title}</h3><p className="management-hint">正文、设定、规划和写作预设保存在这部作品里。</p></div><button className="quiet" disabled={busy} onClick={async () => {const title = await ask('作品名称', novel?.title || ''); if (title?.trim()) void run(async () => {const current = await call<{revision: number}>('novel.get', {novelId}); await call('novel.update', {novelId, title, expectedRevision: current.revision});});}}>重命名</button></div>
      <button className="primary" disabled={busy} onClick={() => onTransfer({mode: 'export', selection: {kind: 'works', novelIds: [novelId]}})}>导出这部作品</button>
    </ManagementSection>}
    <ManagementSection title="导入与迁移">
      <button className="management-action-link" aria-label="恢复或导入作品" disabled={busy} onClick={() => onTransfer({mode: 'import'})}><span><strong>恢复或导入作品</strong><small>催更姬备份、旧项目和写作内容，统一识别并预览</small></span><span aria-hidden="true">›</span></button>
      <button className="management-action-link" aria-label="备份整个工作库" disabled={busy} onClick={() => onTransfer({mode: 'export', selection: {kind: 'workspace'}})}><span><strong>备份整个工作库</strong><small>保留所有作品、历史和会话绑定，适合迁移到新电脑</small></span><span aria-hidden="true">›</span></button>
    </ManagementSection>
  </ManagementPage>;
}
