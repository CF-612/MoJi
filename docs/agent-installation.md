# 交给 Agent 安装或更新 Moji（源码构建包）

当前版本以仓库 `package.json` 为准。**暂无当前版本的 Windows 成品安装包**；旧上游催更姬的 0.4.0 Release 不是当前墨叽安装源，不要把旧包当成升级包。打包脚本存在也不表示对应资产已经发布。

## 当前支持的来源

使用 [墨叽开发分支 codex/main](https://github.com/CF-612/MoJi/tree/codex/main)，不要混用默认 moji-release 分支的旧说明。环境需要 Git、Node.js 24+ 与 npm。详细工作台与 DSH 入口见 [README](../README.md)。

```sh
git clone --branch codex/main https://github.com/CF-612/MoJi.git Moji
cd Moji
npm ci
npm ci --prefix integrations/chatgpt-workbench
npm pack
```

`npm pack` 会运行类型检查与构建，生成本地 `dsh-moji-<package.json版本>.tgz`。必须检查命令真实成功和输出包版本；构建不是宿主验收，也不是已经安装。通过 DSH 原生插件安装入口选择这个本地包。没有获得用户授权时不替用户安装依赖、改宿主或创建云资源。

## 用户可交给 Agent 的要求

请从墨叽当前开发分支构建并核对本地包，通过我的 DSH 原生插件管理安装；保留已有配置和小说数据。安装前记录 package.json 的目标版本和现有数据目录；重启后确认实际加载版本及迁移校验结果。没有对应发布资产时不要下载旧上游包，也不要声称免源码安装。

## 1. 查明当前环境

确认用户实际运行的 DSH 版本、当前桌面 profile 和已有 Moji 或旧版插件状态，以该环境为目标，不套用维护者电脑的路径。

DSH 中的 Agent 可使用原生 `plugin_manager`。已验证宿主在 Creator 模式提供此工具；其他预设可能需要切换到具备管理能力的模式。权限和宿主审批遵循 DSH 的既有机制。

```json
{"action":"list_bundles","offset":0,"limit":100}
```

包名现为 `dsh-moji`。如果已有 `dsh-cuigengji`，先导出作品备份并保存 profile 配置，记录原数据根；通过 DSH 原生插件管理停用／移除**旧插件本身**，保留作品目录，再安装新包。不要只改文件名或并行启用新旧实例。安装脚本检测到旧依赖、bundle 或 patch 会停止，不自动改写旧安装；`install-dsh-native.mjs` 仅用于更新已经安装的 `dsh-moji`，不是旧包迁移入口。

已有插件更新时，先记录原有 `dataRoot`、插件配置、启用状态和作品清单；旧版若没有维护工具，用 `settings.get` 和只读作品清单核对。保留原数据根、DSH Home、聊天、附件和桌面偏好，更新包不改它们。

## 2. 取得并核对包

使用上面的源码构建结果。记录本地包绝对路径、源码版本、构建日志和 SHA-256（Windows 可用 `Get-FileHash -Algorithm SHA256`）。只有官方实际发布对应版本资产时才使用发布 URL，并核对该资产附带的哈希；本文不提供或猜测不存在的下载链接。

## 3. 由宿主安装和启用

通过 DSH 原生插件管理的 `install_bundle` 选择已核实的本地 `.tgz` 绝对路径；不要把本文占位符作为路径调用。没有管理工具权限时由用户在原生插件页选择该包。

读取安装返回的 `application`、`error`、`packageResult`。`restart-required` 表示磁盘包已更新，当前进程仍可能使用旧代码，需要完整重启。失败时保留诊断，不把下载或构建成功当成安装成功。

desktop profile 由宿主管理，不创建同名 profile、不手工修改 bundles，也不在用户 profile 直接运行 `pnpm add`。开发者脚本不替代普通用户安装路径。

## 4. 完整重启与自动迁移

请用户先保存编辑中的内容，然后从 DSH 菜单正常退出，包括托盘进程，再从原快捷方式启动。具备相应权限的安装 Agent 可以完成重启；否则说明唯一剩余步骤并在重启后继续验收。

插件加载阶段完成升级前的完整原始快照、挂起事务恢复、物理布局迁移和完整逻辑校验。用户不需要单独运行迁移命令，也不会看到迁移向导。**负责更新的 Agent 必须完成这一步的验证，才能说更新结束。**

## 5. 验收实际加载结果

重启后调用不要求绑定小说的 `moji_maintenance`：

```json
{"action":"status","args":{}}
```

再核对版本、原数据根和原作品 ID；下面的 PACKAGE_JSON_VERSION 和数据目录是占位符，必须替换成构建时实际版本与之前查明的目录：

```json
{"action":"verify","args":{"expectedVersion":"PACKAGE_JSON_VERSION","expectedDataRoot":"C:\\Users\\用户名\\AppData\\Local\\cuigengji","expectedNovelIds":[]}}
```

`expectedNovelIds` 可填升级前作品的真实 ID，不用新 ID 替代。确认：

- `status.status=ready`，实际加载版本与构建时 package.json 版本一致，数据根与更新前一致。
- `verify.verified=true`，各作品、正文版本、回收站、设定、规划页和绑定数量符合原数据。
- 原有作品仍能通过只读工具访问。初次安装应是可用空库，不会附带作者小说。

维护结果可通过同一 DSH 连接的 `cuigengji/dispatch` RPC 查询 `maintenance.status` / `maintenance.verify`；该内部 RPC 名称为兼容旧连接保留，不是展示品牌；这是外部 Agent 的替代查询入口，需要正常宿主认证。不要打印连接凭据。

报告给用户的内容保持简短：已加载版本、迁移完成与否、原作品是否保留。上述校验不需要调用任何模型连通性测试。

## 失败时怎样处理

- **找不到 Git / `git ls-remote`**：核对是否误用了仓库地址，源码构建需先安装 Git；已有本地包时改选已核实的 `.tgz`。
- **不兼容或构建批准提示**：保留宿主的具体结果，按相应发布说明处理，不绕过宿主检查。
- **安装完仍是旧版本**：核对完整退出和重新加载结果，不因磁盘包版本更新就宣称已生效。
- **迁移 `failed`**：查询维护结果中的 `failedStage`、错误代码、原数据根与 `backupPath`，保留现场。重新加载会恢复挂起事务并继续同一次升级；反复失败时把元数据交给维护者。
- **缺失作品**：先比对原数据根和作品 ID。不要创建空库或用旧备份覆盖升级后新写入的正文。

完整恢复边界、快照位置和回滚流程见[更新与数据迁移](upgrade.md)。分享日志前移除凭据和私人内容。历史独立版的模型连通性日志不属于本次插件安装证据。
