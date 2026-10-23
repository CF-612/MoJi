import React, {useState} from 'react';
import {CastFace} from './CastAvatars.tsx';
import type {CastKind, CastPerson, CastRef} from './CastAvatars.tsx';
const typeLabels: Record<CastPerson['type'], string> = {character_card: '角色卡', world_entry: '世界书', world_book: '世界书'};
const kindLabels: Record<CastKind, string> = {appearance: '出场', mention: '仅提及'};
const candidateLimit = 12;
export function CastPicker({cast, people, onChange, busy = false, onOpenPerson}: {
  cast: CastRef[]; people: CastPerson[];
  onChange: (next: CastRef[]) => void;
  busy?: boolean;
  onOpenPerson?: (nodeId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const byId = new Map(people.map(person => [person.id, person]));
  const selected = cast.map(ref => ({ref, person: byId.get(ref.nodeId)})).filter((item): item is {ref: CastRef; person: CastPerson} => Boolean(item.person));
  const selectedIds = new Set(cast.map(ref => ref.nodeId));
  const term = query.trim().toLowerCase();
  const matched = people.filter(person => !selectedIds.has(person.id) && (!term || person.name.toLowerCase().includes(term) || (person.summary || '').toLowerCase().includes(term)));
  const candidates = matched.slice(0, candidateLimit), remaining = matched.length - candidates.length;
  const flip = (nodeId: string) => onChange(cast.map(ref => ref.nodeId === nodeId ? {...ref, kind: ref.kind === 'appearance' ? 'mention' : 'appearance'} : ref));
  const drop = (nodeId: string) => onChange(cast.filter(ref => ref.nodeId !== nodeId));
  const add = (nodeId: string) => onChange([...cast, {nodeId, kind: 'appearance'}]);
  return <div className="cast-picker">
    <input className="cast-search" aria-label="搜索要出场的人物" placeholder="搜索人物姓名" value={query} disabled={busy} onChange={event => setQuery(event.target.value)}/>
    <div className="cast-selected" role="group" aria-label="已选出场人物">{selected.length === 0 ? <p className="cast-empty">还没有关联出场人物</p> : selected.map(({ref, person}) => <span className="cast-pill" key={person.id}>
      <CastFace person={person} size="sm"/>
      {onOpenPerson ? <button type="button" className="cast-pill-name" title={`打开 ${person.name}`} aria-label={`打开 ${person.name}`} disabled={busy} onClick={() => onOpenPerson(person.id)}>{person.name}</button> : <strong className="cast-pill-name" title={person.name}>{person.name}</strong>}
      <button type="button" className={`cast-kind${ref.kind === 'mention' ? ' kind-mention' : ''}`} title={`切换为${kindLabels[ref.kind === 'appearance' ? 'mention' : 'appearance']}`} aria-label={`${person.name}：切换为${kindLabels[ref.kind === 'appearance' ? 'mention' : 'appearance']}`} disabled={busy} onClick={() => flip(person.id)}>{kindLabels[ref.kind]}</button>
      <button type="button" className="cast-remove" aria-label={`移除 ${person.name}`} disabled={busy} onClick={() => drop(person.id)}>×</button>
    </span>)}</div>
    <div className={`cast-candidates${candidates.length ? '' : ' is-empty'}`}>{candidates.map(person => <button type="button" className="cast-candidate" key={person.id} disabled={busy} onClick={() => add(person.id)}><CastFace person={person} size="sm"/><span className="cast-candidate-name">{person.name}</span><small>{typeLabels[person.type]}</small></button>)}{candidates.length === 0 && <p className="cast-empty">没有匹配的人物卡</p>}</div>
    {remaining > 0 && <p className="cast-empty">还有 {remaining} 人，继续输入缩小范围</p>}
  </div>;
}
