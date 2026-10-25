import {createHash} from 'node:crypto';

/** MoJi stores {revision,value}; upstream 0.5.0 stores flat snapshots.
 * Adapt only at the history-consumer boundary so portable restore keeps the
 * original record and unknown extension fields byte-for-byte in JSON values. */
export function memoryVersionValue(version, nodeId) {
  if(version?.value && typeof version.value==='object' && !Array.isArray(version.value))return version.value;
  if(!version || typeof version.content!=='string' || typeof version.name!=='string' ||
     !Number.isSafeInteger(version.revision) || version.revision<1 ||
     version.contentHash!==createHash('sha256').update(version.content).digest('hex')) {
    throw Object.assign(new Error('资料历史格式或正文校验无效，未恢复；请保留原始备份。'),{code:'INVALID_BACKUP'});
  }
  const {timestamp,actor,reason,...value}=version;
  return {...value,id:nodeId};
}
