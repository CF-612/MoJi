# 墨叽 · Moji

**陪你写故事的烟灰蛸小说工作台。**

墨叽把正文、人物与世界设定、剧情卡、画布和时间线放在同一本作品里，让你和 AI 围绕已有资料讨论、续写和修改。故事由作者决定，AI 按需查阅资料，修改留下记录。

本项目以 **Codex 工作台体验为主**，兼容 **DeepSeek Harness（DSH）**，也可通过 **MCP** 让 Gemini 等客户端访问作品。源码基于 [mistnest 的催更姬](https://github.com/mistnest/dsh-cuigengji-plugin) 继续开发，现以独立名称维护。

> 当前开发分支是 [`codex/main`](https://github.com/CF-612/MoJi/tree/codex/main)，源码版本为 `0.11.0-v31.5`。这是持续打磨中的版本，不代表所有新功能已通过真实宿主验收。仓库默认分支 `moji-release` 用于公开发行，`codex/main` 用于开发；请按下面的命令选择分支，并核对源码与安装包版本。

本轮实现、实际检查及未覆盖边界见[界面修订验收记录](docs/ui-batch-acceptance-2026-10-23.md)。

## 可以做什么

- **写正文**：按卷、章管理作品，编辑与自动保存，查看字数、版本历史，比较或恢复旧内容，查找与替换正文。
- **整理人物和世界**：角色卡、世界书、分组、搜索、关系图与资料历史；把正文片段关联到资料，保留原文依据。
- **安排剧情**：同一套剧情卡在画布、大纲和时间线中查看；用层级、连线、时间安排与伏笔节点组织故事，区分计划和已经写下的事实。
- **带着资料讨论**：将正文或卡片引用交给当前聊天，让 AI 按需读取相关章节、设定、规划和已启用的写作要求。
- **保留创作过程**：规划撤销／重做、版本冲突检查、导入预览、导出与备份。跨端修改仍需留意保存状态，不能用旧版本强行覆盖新内容。
- **按习惯使用**：调整主题和内置模块显示，导入酒馆角色卡、世界书及提示词预设。导入保留内容，不等同于运行酒馆的全部规则。

V3.1 新功能的实现与待验收范围见[交付进度](docs/moji-v3.1-progress-2026-10-22.md)。重要作品请先备份，再用副本试用新版本。

## 选择入口

**分发方式：继续通过 [GitHub 项目仓库](https://github.com/CF-612/MoJi) 分发，不推进 OpenAI 官方插件目录上架。** 使用完整云端插件时，每位使用者自行部署个人云端并配置自己的实例连接；不提供共用公共后端。

| 入口 | 用途与边界 |
| --- | --- |
| **Codex／ChatGPT 可视化插件** | 当前完整插件在电脑 Codex、网页和手机 GPT 都连接个人云端，不提供本地后端模式。可通过网页“上传插件压缩包”安装；连接各自实例后使用同一套云端工作台界面。 |
| **DSH 原生插件** | 保留原生侧栏、会话绑定及工具接入，可选择本机作品或个人云端。兼容声明为 `0.2.0-rc.2` / `0.2.1-rc.2`，不代表当前版本已在所有宿主完成回归。 |
| **Gemini 等 MCP 客户端** | 可连接个人实例读写工具；Gemini 配置 MCP 后已有读取成功的使用反馈。不以此承诺所有客户端都能显示内嵌工作台。 |
| **本机浏览器** | 启动下方本地服务后直接编辑，服务仅监听 `127.0.0.1`。无需配置模型也能使用工作台，AI 协作需要另行连接客户端。 |

多个客户端只有在连接**同一实例**时才共用已保存作品。各宿主的聊天历史不会自动合并，本机库和云端库也不会自动同步。

## 从源码在本机运行

需要 **Git、Node.js 24+ 和 npm**。以下命令从仓库根目录执行：

```sh
git clone --branch codex/main --single-branch https://github.com/CF-612/MoJi.git Moji
cd Moji
npm ci
npm ci --prefix integrations/chatgpt-workbench
npm run build:workbench --prefix integrations/chatgpt-workbench
npm start --prefix integrations/chatgpt-workbench
```

打开终端输出的地址，默认是 `http://127.0.0.1:43127/`。首次启动会创建一份演示作品，可以另建自己的作品。

- 默认数据目录：`integrations/chatgpt-workbench/.data/demo/`。这是**持久化目录**，不是退出即清空的临时预览。
- 正式写作前，建议通过环境变量 `MOJI_DATA_ROOT` 指定仓库外的绝对路径；`PORT` 可更改监听端口。启动日志会显示实际数据目录。切换目录不会自动搬运旧作品。
- 这是独立本机浏览器工作台，不是在网页 GPT 安装完整可视化插件的流程；网页注册的远程插件不能直接连接本机回环地址。
- 本地服务没有公网登录保护，不要通过端口映射直接公开。

已发布的安装包见 [GitHub Releases](https://github.com/CF-612/MoJi/releases)；仅下载公开附件，若无对应版本请按源码流程运行。仓库中的打包脚本不代表对应版本已经发布。

## 部署自己的个人云端实例

**当前墨叽完整可视化插件在电脑 Codex、网页 GPT 和手机 GPT 都使用个人云端，不提供本地后端模式。** 三个入口使用同一套云端工作台，界面美化更新应一并覆盖。DSH 才提供本机／云端切换面板；Windows 独立版／本机浏览器是另一条独立本地入口，不是 Codex 插件的本地模式。个人云端部署成功仍需账号权限和真实宿主验收。

云端是部署到你自己 Cloudflare 账号的单作者实例，费用与用量由你承担。**插件 ZIP 可在网页插件上传入口安装，但上传插件与部署云端是两件事。** 普通聊天附件、DSH `.tgz`、Windows 独立程序 ZIP 不能当作插件 ZIP；也不要把“添加自定义 MCP”当成唯一安装方式。

部署完成后，只需自己的实例地址即可离线生成个人插件 ZIP：`npm run package:plugin -- "https://你的实例.workers.dev"`。图标、名称、简介沿用墨叽；模板、上传步骤及真实宿主验收边界见[插件打包指南](docs/plugin-package.md)。

完整步骤统一见 **[个人云端部署与跨端连接](docs/cloud-agent-deployment.md)**：准备账号与源码 → 安装两套依赖 → 本人登录 Cloudflare → `deploy:new` 新建 → 隐藏输入密钥 → 根页／OAuth／健康检查 → 宿主连接 → 备份试导入及保存重开验收；已有实例用原清单 `deploy:update`，失败按原模式恢复，不重复新建。

- **DSH 填 HTTPS 根地址；MCP 客户端填根地址加 `/mcp`。** 在实例 OAuth 授权页输入密钥，不发进聊天。
- 云端根页是 MCP 连接说明页，不是独立网页版编辑器；完整界面取决于宿主。
- 本机库与云端库不自动同步，只连接同一云端实例的客户端共用已保存作品；迁移需另做备份与导入。
- 本地冷安装／云端模拟测试已有通过记录；真实 Cloudflare 首次部署及真实宿主（含手机）完整使用验收仍待完成。账号与手机入口的限制见上述指南，不提供未经验证的手机设置菜单。

## DSH 兼容与开发

产品品牌统一为 **Moji**（中文名：墨叽）；npm 包为 `dsh-moji`，AI 工具和 Skill 使用 `moji_*` / `moji-*`。已有作品目录、备份格式、内部 RPC 与凭据键保留兼容，不因改名移动或删除数据。上游名称与版权署名按原样保留。

从旧 `dsh-cuigengji` 安装升级时，先导出作品备份并保存 profile 配置，记录原数据根。通过 DSH 原生插件管理停用／移除**旧插件本身**，保留作品目录，再安装 `dsh-moji` 并核对原数据根。安装脚本检测到旧依赖、bundle 或 patch 会停止，不自动改写旧安装。不能并行启用新旧实例，也不能只把旧压缩包重命名当成升级。

普通安装或更新优先使用已核实的 `dsh-moji-<版本>.tgz`，通过 DSH 原生插件管理安装；完整步骤、备份和重启验收见 [DSH 安装与更新指南](docs/agent-installation.md)。Windows 独立版 ZIP 不是 DSH 插件包。

仅需源码构建时，安装好根目录与工作台依赖，再从根目录构建 DSH 插件包：

```sh
npm pack
```

`npm pack` 会先运行类型检查与构建，再生成 `dsh-moji-<版本>.tgz`。通过 DSH 原生插件安装入口安装该本地包，保留原有 profile 配置；升级前先备份作品并完全退出宿主。工作台的“更多 → 本地 / 云端”可选择本机或个人云端，切换位置不自动迁移作品。

常用开发命令：

```sh
# 业务核心与 DSH 构建
npm test
npm run typecheck
npm run build

# Codex／MCP 工作台与云端构建
npm run build --prefix integrations/chatgpt-workbench
npm run build:cloud --prefix integrations/chatgpt-workbench
npm test --prefix integrations/chatgpt-workbench
npm run test:cloud --prefix integrations/chatgpt-workbench
```

根目录 `npm run build` 生成 DSH 前端 `lib/client.js` 和服务端 `runtime/`；工作台构建生成 `integrations/chatgpt-workbench/dist/`，云端构建生成 `integrations/chatgpt-workbench/cloud/generated/` 与 `integrations/chatgpt-workbench/cloud/public/`。**构建不等于部署，也不等于功能验收。**

## 数据、文档与反馈

- 作品、凭据、日志和个人备份不要提交到源码仓库。导出备份后，确认能在隔离环境中重新读取；宿主聊天记录、账号配置和未保存草稿需另行处理。
- 更新前保留完整备份。V3.1 不承诺自动转换全部旧规划／事件数据，迁移边界以[交付进度](docs/moji-v3.1-progress-2026-10-22.md)为准。
- [导入与导出](docs/import-export.md) · [角色卡与世界书](docs/tavern-import.md) · [写作预设](docs/presets.md) · [源码结构](docs/architecture.md)
- [项目仓库](https://github.com/CF-612/MoJi)尚未开启 Issues。反馈问题时，请附版本、宿主、复现步骤和预期结果；截图与日志先移除正文、私人设定和密钥。

部分历史文档仍保留催更姬名称、上游版本号或旧部署流程；当前入口和命令以本 README 及对应源码为准，规划文档不代表功能已经上线。

## 来源与许可

墨叽基于 [mistnest/dsh-cuigengji-plugin](https://github.com/mistnest/dsh-cuigengji-plugin) 的催更姬继续开发。保留上游作者 **mistnest** 的版权声明与 [MIT 许可证](LICENSE)；来源基线及后续采用记录见 [UPSTREAM.md](integrations/chatgpt-workbench/UPSTREAM.md)。感谢上游提供的小说工作台基础。

MIT 许可适用于本仓库源码；小说、导入资料及第三方素材的权利归各自权利人，不因存放或导入本项目而改变。
