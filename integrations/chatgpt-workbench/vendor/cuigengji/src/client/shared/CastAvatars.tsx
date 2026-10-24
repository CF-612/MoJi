import {avatarSource} from './avatar-presets.js';
import React from 'react';
export type CastKind = 'appearance' | 'mention';
export interface CastRef { nodeId: string; kind: CastKind }
export interface CastPerson { id: string; name: string; type: 'character_card' | 'world_entry' | 'world_book'; avatarImage?: string; summary?: string }
const toneCount = 8;
export function castTone(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 1000003;
  return hash % toneCount;
}
export function castGlyph(person: CastPerson): React.ReactNode {
  return avatarSource(person.avatarImage) ? <img src={avatarSource(person.avatarImage)} alt=""/> : person.name.trim().slice(0, 1) || '人';
}
function toneClass(person: CastPerson): string { return `cast-tone tone-${castTone(person.name)}`; }
export function CastFace({person, size = 'md'}: {person: CastPerson; size?: 'sm' | 'md'}) {
  return <span className={`cast-face ${toneClass(person)}${size === 'sm' ? ' is-sm' : ''}`} aria-hidden="true">{castGlyph(person)}</span>;
}
export function CastAvatars({cast, people, onOpen, onExpand, size = 'md'}: {
  cast: CastRef[]; people: CastPerson[];
  onOpen?: (nodeId: string) => void; onExpand?: () => void;
  size?: 'sm' | 'md';
}): React.ReactElement | null {
  const byId = new Map(people.map(person => [person.id, person]));
  const shown = cast.filter(ref => ref.kind === 'appearance').map(ref => byId.get(ref.nodeId)).filter((person): person is CastPerson => Boolean(person));
  if (!shown.length) return null;
  const visible = shown.slice(0, 3), hidden = shown.length - visible.length;
  const label = `出场人物：${visible.map(person => person.name).join('、')}${hidden > 0 ? ` 等 ${shown.length} 人` : ''}`;
  const stop = (event: React.SyntheticEvent) => event.stopPropagation();
  return <div className={`cast-avatars size-${size}`} role="group" aria-label={label}>
    {visible.map(person => <button type="button" key={person.id} className="cast-avatar" title={person.name} aria-label={person.name} onPointerDown={stop} onDoubleClick={stop} onClick={event => {stop(event); onOpen?.(person.id);}}><CastFace person={person}/></button>)}
    {hidden > 0 && <button type="button" className="cast-avatar cast-more" title={`还有 ${hidden} 位出场人物`} aria-label={`展开全部 ${shown.length} 位出场人物`} onPointerDown={stop} onDoubleClick={stop} onClick={event => {stop(event); onExpand?.();}}>+{hidden}</button>}
  </div>;
}
