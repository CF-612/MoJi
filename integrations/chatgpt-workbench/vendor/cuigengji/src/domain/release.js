const version=v=>typeof v==='string'&&/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(v)?v.split('-'):null;
export function compareVersions(a,b){
 const x=version(a),y=version(b);if(!x||!y)throw new Error('版本号格式无效');
 const xn=x[0].split('.').map(Number),yn=y[0].split('.').map(Number);
 for(let i=0;i<3;i++)if(xn[i]!==yn[i])return xn[i]>yn[i]?1:-1;
 const xp=x.slice(1).join('-'),yp=y.slice(1).join('-');if(xp===yp)return 0;if(!xp||!yp)return xp?-1:1;
 const xx=xp.split('.'),yy=yp.split('.');for(let i=0;i<Math.max(xx.length,yy.length);i++){
  if(xx[i]===undefined||yy[i]===undefined)return xx[i]===undefined?-1:1;
  if(xx[i]===yy[i])continue;const n=/^\d+$/.test(xx[i]),m=/^\d+$/.test(yy[i]);
  if(n&&m)return Number(xx[i])>Number(yy[i])?1:-1;if(n!==m)return n?-1:1;return xx[i]>yy[i]?1:-1;
 }return 0;
}
export function validateRelease(value){
 if(!value||value.product!=='moji'||!version(value.version)||value.prerelease===true)throw new Error('更新信息无效或不是正式版本');
 if(value.version.includes('-'))throw new Error('预览版本不进入正式更新提醒');
 const url=new URL(value.downloadUrl);if(url.protocol!=='https:'||url.username||url.password)throw new Error('更新地址无效');
 return {version:value.version,downloadUrl:url.href,notes:typeof value.notes==='string'?value.notes.slice(0,12000):''};
}
