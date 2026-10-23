import {build} from '../integrations/chatgpt-workbench/node_modules/esbuild/lib/main.js';
import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const version=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version;
const out=resolve(root,'releases',`Moji-${version}-windows-x64`);
const integration=resolve(root,'integrations/chatgpt-workbench');
const runtime=resolve(root,'.data/redistribution');
await access(resolve(runtime,'LICENSE'));await access(resolve(runtime,'node.exe'));
await mkdir(resolve(out,'server'),{recursive:true});await mkdir(resolve(out,'dist'),{recursive:true});
// Fully bundle the local adapter and command engine: no npm, source tree or user data.
const bundled=await build({entryPoints:[resolve(integration,'server/index.mjs')],outfile:resolve(out,'server/index.mjs'),bundle:true,metafile:true,platform:'node',format:'esm',target:'node24',external:['node:*'],banner:{js:"import {createRequire as mojiCreateRequire} from 'node:module';const require=mojiCreateRequire(import.meta.url);"}});
await copyFile(resolve(integration,'dist/workbench-dev.html'),resolve(out,'dist/workbench-dev.html'));
await copyFile(resolve(integration,'dist/native-paused.html'),resolve(out,'dist/native-paused.html'));
await copyFile(resolve(runtime,'node.exe'),resolve(out,'node.exe'));
await copyFile(resolve(runtime,'LICENSE'),resolve(out,'NODE-LICENSE.txt'));
await copyFile(resolve(runtime,'SOURCE.txt'),resolve(out,'NODE-SOURCE.txt'));
await copyFile(resolve(root,'LICENSE'),resolve(out,'LICENSE.txt'));
await copyFile(resolve(integration,'UPSTREAM.md'),resolve(out,'UPSTREAM.md'));
const uiInputs=JSON.parse(await readFile(resolve(integration,'dist/workbench-build.json'),'utf8')).inputs;
const packageRoots=new Set();
const resolvedUi=[];for(const input of uiInputs){let path=resolve(root,input);try{await access(path);}catch{path=resolve(integration,input);}resolvedUi.push(path);}
for(const path of [...Object.keys(bundled.metafile.inputs).map(p=>resolve(p)),...resolvedUi]){
  const marker=path.lastIndexOf('node_modules');if(marker<0)continue;
  const rest=path.slice(marker+'node_modules'.length+1).split(/[\\/]/);
  packageRoots.add(resolve(path.slice(0,marker),'node_modules',...rest.slice(0,rest[0].startsWith('@')?2:1)));
}
let licenses='Moji bundled third-party notices\n\n';
for(const directory of [...packageRoots].sort()){
  const pkg=JSON.parse(await readFile(resolve(directory,'package.json'),'utf8'));
  let license='';for(const file of ['LICENSE','LICENSE.txt','LICENSE.md','license','license.txt']){try{license=await readFile(resolve(directory,file),'utf8');break;}catch{}}
  licenses+=`${pkg.name} ${pkg.version} (${pkg.license||'see package'})\n${license}\n\n`;
}
await writeFile(resolve(out,'THIRD-PARTY-NOTICES.txt'),licenses,'utf8');
await copyFile(resolve(root,'src/client/assets/moji.png'),resolve(out,'moji.png'));
await writeFile(resolve(out,'启动墨叽.cmd'),'@echo off\r\npowershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher.ps1"\r\nif errorlevel 1 pause\r\n','utf8');
await writeFile(resolve(out,'launcher.ps1'),'\uFEFF'+String.raw`$ErrorActionPreference = 'Stop'
$port = 43127
$url = "http://127.0.0.1:$port/"
# Keep the established data directory; branding must not create an empty library.
$data = Join-Path $env:LOCALAPPDATA 'MoJi\workbench'
$healthy = $false
try { $health = Invoke-RestMethod ($url + 'health') -TimeoutSec 2; $healthy = $health.product -eq 'moji' } catch {}
if (-not $healthy) {
  New-Item -ItemType Directory -Path $data -Force | Out-Null
  $env:CUIGENGJI_DATA_ROOT = $data
  $env:PORT = "$port"
  Start-Process -FilePath (Join-Path $PSScriptRoot 'node.exe') -ArgumentList @(('"' + (Join-Path $PSScriptRoot 'server\index.mjs') + '"')) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $data 'launcher.log') -RedirectStandardError (Join-Path $data 'launcher-error.log') | Out-Null
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 300
    try { $health = Invoke-RestMethod ($url + 'health') -TimeoutSec 1; if ($health.product -eq 'moji') {$healthy = $true; break} } catch {}
  }
}
if (-not $healthy) { throw "墨叽未能启动。请检查端口 $port 是否被占用；日志在 $data。" }
Start-Process $url
`,'utf8');
await writeFile(resolve(out,'停止墨叽.cmd'),'@echo off\r\npowershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop.ps1"\r\n','utf8');
await writeFile(resolve(out,'stop.ps1'),'\uFEFF'+String.raw`$ErrorActionPreference = 'Stop'
Write-Host '请先在工作台确认保存完成，并关闭编辑页面。'
if ((Read-Host '输入 Y 停止墨叽后台') -ne 'Y') {exit}
$expected = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'node.exe'))
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.ExecutablePath -and [IO.Path]::GetFullPath($_.ExecutablePath) -eq $expected -and $_.CommandLine -like '*server*index.mjs*' } | ForEach-Object {Stop-Process -Id $_.ProcessId}
Write-Host '墨叽后台已停止；已保存的作品保留。'
`,'utf8');
await writeFile(resolve(out,'使用说明.txt'),`Moji · 墨叽小说工作台 ${version}\r\n\r\n解压到任意普通文件夹，双击“启动墨叽.cmd”。无需安装 Node、npm 或 Auth0。\r\n界面在默认浏览器打开；关闭网页不丢失已保存作品。\r\n作品保存在 %LOCALAPPDATA%\\MoJi\\workbench，与安装文件分开。换新版前请先在工作台导出完整备份；保留该数据目录。\r\n本机 MCP 地址：http://127.0.0.1:43127/mcp。仅支持可以连接本地 HTTP 的客户端；不是 ChatGPT 云端插件地址。\r\n仅监听本机，不应通过端口映射直接公开。\r\n电脑重启后重新双击启动即可。退出后台：任务管理器中结束本安装目录的 node.exe。\r\n云端版：请使用项目说明中的“部署到 Cloudflare”入口。\r\n源码：https://github.com/CF-612/MoJi\r\n上游：https://github.com/mistnest/dsh-cuigengji-plugin\r\n\r\n本软件遵循 MIT；Node.js 与第三方依赖许可见随附许可文件。\r\n`,'utf8');
console.log(JSON.stringify({directory:out,version}));
