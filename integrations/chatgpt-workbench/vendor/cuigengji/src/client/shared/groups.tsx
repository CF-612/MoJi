import {useModules} from '../modules/context.tsx';
import React from 'react';
import { useDialog } from '../dialog.tsx';
import type { Group } from '../../domain/memory/groups.ts';
import {FilterControl} from './workspace.tsx';

export type GroupItem = Pick<Group, 'id' | 'name' | 'summary' | 'revision'>;
interface Props {
  groups: GroupItem[];
  value: string;
  onChange: (value: string) => void;
  prefix: 'planning' | 'graph';
  novelId: string;
  busy: boolean;
  call: (action: string, args: Record<string, unknown>) => Promise<unknown>;
  run: (task: () => Promise<unknown>) => unknown;
}
export const filterGroup = (value: string): string | null | undefined => value === '__ungrouped' ? null : value || undefined;
export function GroupSelect({ groups, value, onChange }: { groups: GroupItem[]; value?: string | null; onChange: (id: string | null) => void }) {
  const modules=useModules();if(!modules.groups)return null;
  return <label>分组<select value={value || ''} onChange={e => onChange(e.target.value || null)}><option value="">未分组</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>;
}
export function Groups({ groups, value, onChange, prefix, novelId, busy, call, run }: Props) {
  const { ask, confirm } = useDialog();const modules=useModules();if(!modules.groups)return null;
  const selected = groups.find(g => g.id === value);
  const mutate = (action: string, args: Record<string, unknown>) => call(`${prefix}.group.${action}`, { novelId, requestId: crypto.randomUUID(), ...args });
  return <fieldset className="group-manager"><legend>{prefix==='planning'?'规划分组':'资料分组'}</legend>
    <label>筛选分组<select aria-label={prefix==='planning'?'规划分组':'设定分组'} value={value} onChange={e=>onChange(e.target.value)}><option value="">全部分组</option><option value="__ungrouped">未分组</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
    <div className="group-manager-actions"><button type="button" disabled={busy} onClick={async()=>{const name=await ask('新建分组名称');if(name?.trim())run(async()=>{const group=await mutate('create',{name}) as GroupItem;onChange(group.id);});}}>＋ 新建分组</button>
    {selected&&<><button type="button" disabled={busy} onClick={async()=>{const name=await ask('分组名称',selected.name);if(name?.trim())run(()=>mutate('update',{groupId:selected.id,expectedRevision:selected.revision,name}));}}>重命名</button><button type="button" disabled={busy} onClick={async()=>{const summary=await ask('分组描述',selected.summary);if(summary!==null)run(()=>mutate('update',{groupId:selected.id,expectedRevision:selected.revision,summary}));}}>描述</button><button type="button" className="danger" disabled={busy} onClick={async()=>{if(await confirm(`删除分组“${selected.name}”？内容将保留在未分组中。`))run(async()=>{await mutate('delete',{groupId:selected.id,expectedRevision:selected.revision,confirm:true});onChange('__ungrouped');});}}>删除</button></>}
    </div>
  </fieldset>;
}
