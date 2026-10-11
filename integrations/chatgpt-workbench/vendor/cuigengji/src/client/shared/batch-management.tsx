import React, {useEffect, useRef, useState} from 'react';
import type {GroupItem} from './groups.tsx';

interface Item {id: string; title: string; summary?: string; meta?: string}
interface Selection {items: Item[]; selected: string[]; change: (ids: string[]) => void; busy: boolean}
interface Props extends Selection {
  groups: GroupItem[]; done: () => void;
  onMove: (ids: string[], groupId: string | null) => unknown;
  pages?: {id: string | null; name: string}[]; currentPage?: string;
  onPage?: (ids: string[], pageId: string) => unknown;
}

export function BatchManager({items, selected, change, groups, busy, done, onMove, pages, currentPage, onPage}: Props) {
  const [target, setTarget] = useState('');
  const all = useRef<HTMLInputElement>(null);
  const ids = items.map(item => item.id), checked = selected.filter(id => ids.includes(id));
  const visibleKey = ids.join('|');
  const every = !!ids.length && checked.length === ids.length;
  useEffect(() => {if (all.current) all.current.indeterminate = checked.length > 0 && !every;}, [checked.length, every]);
  useEffect(() => {if (checked.length !== selected.length) change(checked);}, [visibleKey, selected, change]);
  const destinations = pages?.filter(page => (page.id || '') !== currentPage) || [];
  const valid = target.startsWith('group:') ? target === 'group:' || groups.some(group => `group:${group.id}` === target) : destinations.some(page => `page:${page.id || ''}` === target);
  const move = () => {
    if (busy || !checked.length || !valid) return;
    if (target.startsWith('page:')) onPage?.(checked, target.slice(5));
    else onMove(checked, target.slice(6) || null);
  };
  return <section className="batch-manager" aria-label="批量管理">
    <header className="batch-heading"><div><h2>批量管理</h2><span className="batch-count" role="status">已选 {checked.length} 项</span></div><button className="batch-done" disabled={busy} onClick={done}>完成</button></header>
    <div className="batch-controls"><label className="batch-select-all"><input ref={all} type="checkbox" aria-label="全选当前列表" checked={every} disabled={busy || !items.length} onChange={event => change(event.target.checked ? ids : [])}/>全选当前列表</label>
      {!!checked.length && <button className="batch-clear" disabled={busy} onClick={() => change([])}>清空选择</button>}
      <div className="batch-destination"><label>移动到<select aria-label="批量移动目标" value={valid ? target : ''} disabled={busy} onChange={event => setTarget(event.target.value)}><option value="">选择{onPage ? '分组或页面' : '目标分组'}</option><optgroup label="分组"><option value="group:">未分组</option>{groups.map(group => <option key={group.id} value={`group:${group.id}`}>{group.name}</option>)}</optgroup>{onPage && destinations.length > 0 && <optgroup label="规划页面">{destinations.map(page => <option key={page.id || 'main'} value={`page:${page.id || ''}`}>{page.name}</option>)}</optgroup>}</select></label><button className="primary" disabled={busy || !checked.length || !valid} onClick={move}>移动</button></div>
    </div>
  </section>;
}

export function BatchList({items, selected, change, busy}: Selection) {
  return <div className="batch-list" aria-label="批量选择列表">{items.map(item => <label className={`batch-entry ${selected.includes(item.id) ? 'is-checked' : ''}`} key={item.id}>
    <input type="checkbox" aria-label={`选择 ${item.title}`} checked={selected.includes(item.id)} disabled={busy} onChange={event => change(event.target.checked ? [...new Set([...selected, item.id])] : selected.filter(id => id !== item.id))}/>
    <span className="batch-entry-body"><span className="batch-entry-heading"><strong>{item.title}</strong>{item.meta && <small>{item.meta}</small>}</span>{item.summary && <span className="batch-entry-summary">{item.summary}</span>}</span>
  </label>)}{!items.length && <p className="batch-empty">当前列表没有可选择的内容，试试调整筛选。</p>}</div>;
}
