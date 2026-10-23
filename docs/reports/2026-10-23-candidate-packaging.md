# 2026-10-23 候选包构建记录

> 历史记录：文中的旧产品名、工具名、路径、包名与校验值保留当时事实，不是当前安装指南。当前品牌为 **Moji**，入口与安装说明以根目录 README 为准。

## 状态与来源

仅制作候选包，未发布 Release、npm、私有云，也未连接或改动用户电脑。
应用源码基线：`8f17fef2b63ed471894906522500df673ac7b141`，版本 `0.11.0-v31.1`。
通过 `git archive` 在独立 staging 构建；依赖从现有工作区已安装的 `node_modules` 复制到 staging，未重新下载依赖。原工作区 `lib/client.js` 保持原字节（SHA256 校验通过）。

Windows 包额外包含本次最小包装修正：`scripts/package-moji.mjs` 复制已构建的 `dist/native-paused.html`。原因是本机 MCP 的两个资源入口均读取该文件；此前脚本只包含浏览器主页，可能导致 `resources/read` 报 ENOENT。没有更改应用功能或资源内容。
包装脚本单项补丁 SHA256：`2f72be01ae0bb63dd1f53de9fe13988532cb84a2505c054760f44b25a4cfea0f`。

## 构建和校验

1. `npm run build:workbench --prefix integrations/chatgpt-workbench`
2. `npm --cache <workspace-cache> pack --json --pack-destination <output>`；prepack 的 typecheck 和 build 均通过。
3. `node scripts/audit-release.mjs <pack-files.json>`：通过，311 文件，解包后 6,284,861 字节。
4. `npm run package:moji`；ZIP 含 15 文件。文件排序、时间戳固定为 2026-10-23、权限 0644，Deflate level 9。
5. `node --test tests/windows-package.test.js`：通过，锁定 MCP 资源复制规则。实际解包和 MCP 资源读取由独立验收覆盖，详见候选包外附审计报告。

## 官方 Node 来源

Windows x64 Node `v24.19.0`，与构建机 Node 版本一致。
- [官方 exe](https://nodejs.org/dist/v24.19.0/win-x64/node.exe)
- [官方 ZIP（提取 LICENSE）](https://nodejs.org/dist/v24.19.0/node-v24.19.0-win-x64.zip)
- [官方 SHA256 清单](https://nodejs.org/dist/v24.19.0/SHASUMS256.txt)

exe SHA256：`3602f2bb1a10f2cbab4c36886218a33c1ab3db87290e73b033c46c77147d0237`。
Node ZIP SHA256：`57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73`。
两者均匹配 HTTPS 下载的官方清单；没有另行验证清单签名。分发包保留 MIT、上游归属、Node 许可和第三方 notices。

## 冻结候选包

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| `MoJi-0.11.0-v31.1-windows-x64.zip` | 36,515,224 | `a1ebbdc9da1ba9cb781cc1947c5d4a158c8b72754b4f843562d5f9af08a68866` |
| `dsh-cuigengji-0.11.0-v31.1.tgz` | 2,887,253 | `6732b2021af5268c5b7d05475387a97faf50f12448af8ab3cbb4a99b7aa2c535` |

构建清单、依赖树、官方校验清单、逐文件 SHA256、打包日志和审计结果存于候选包输出目录的 `provenance/` 与 `reports/`；这些内部构建资料不加入安装包。
326 个包内文件的受限路径扫描没有发现私有配置、数据、备份或缓存目录；非运行时文件的已知凭据模式扫描没有发现命中。官方 `node.exe` 内置 PEM 标记字符串触发文本启发式，但其 SHA256 与官方文件完全一致，单独记录为运行时例外。启发式扫描不代表能证明任意秘密不存在。

## 验收边界

Linux 检查不能代替真实 Windows 双击启动、PowerShell 行为或完整 DSH 目标客户端 UI 验收。候选包不等于已批准公开发布。
Windows ZIP 超过 20 MB；交付通道须单独确认，未上传公共存储。

## 独立隔离验收结果

独立验收确认最终 ZIP SHA256 匹配；完整解包后的本机服务完成保存后重启、完整备份恢复到新目录，以及读取所有 MCP 资源的烟测。DSH tgz 的 311 文件通过独立清单检查，218 个非生成文件与基线一致，实际 runtime 加载与维护检查通过。测试使用 Linux Node v24.19.0，不替代上文真实 Windows / DSH 客户端验收。
