# 个人云端部署与跨端连接

## 先选对入口

**当前墨叽完整可视化插件在电脑 Codex、网页 GPT 和手机 GPT 都使用个人云端，不提供本地后端模式。** 请先部署自己的云端，再安装／连接插件。个人云端是前提，不等于本轮已完成所有宿主验收；仍需满足账号、工作区、读写权限及交互界面支持。

- **Codex／网页／手机**：连接同一云端作品库，使用同一套工作台界面。云端界面更新覆盖这些入口；不会出现 DSH 专用的本机／云端切换面板。
- **DSH 本机**：原生插件可直接使用本机作品，不需要 Cloudflare；安装见 [DSH 指南](agent-installation.md)。
- **DSH 个人云端**：连接自己的云端实例，才与连接同一实例的其他客户端共用已保存作品。
- **Windows 独立版／本机浏览器**：是另一个独立本地入口，不是 Codex 可视化插件的本地模式。
- **本机与云端是两份库，不自动同步。** 切换位置不上传、不合并、不删除原作品；搬迁必须另做备份、预览及导入。聊天记录也不会跨宿主合并。

### 单入口连接不需要额外 ZIP

个人云端部署后，直接注册一次远程应用，名称使用“墨叽 · 小说工作台”，填写本人公开 HTTPS `/mcp` 地址并完成 OAuth 授权。已有应用直接复用。手机使用相同账号和工作区，各端分别验收。

`npm run package:plugin -- "https://你的实例.workers.dev"` 现在只输出连接说明。生成器不会部署、注册或授权。旧版应用依赖 ZIP 会增加外壳入口，不再作为普通用户推荐路线；只想要一个入口时卸载外壳、保留应用。具体参数及高级用法见[连接与打包指南](plugin-package.md)。

服务器 URL 必须是使用者自己的实例；密钥和 token 不应放入共享包或聊天。GitHub 中的生成器 ZIP 是工具，不是可直接上传的插件。

**墨叽继续通过 GitHub 分发，已取消 OpenAI 官方插件目录上架路线。** 使用者自行部署个人云端、配置自己的实例并授权，不使用作者的公共共享后端。官方 ZIP／MCP 文档仅作为安装格式和连接技术参考，不表示要提交官方目录审核。手机使用仍需账号可用该远程应用和界面，不提供未经核验的手机设置菜单。

## 让当前 Agent 帮忙：已有部署提示词

DSH 工作台「更多功能 → 本地 / 云端 → 个人云端」内已有「发送部署提示词给当前 Agent」「复制部署提示词」和「查看提示词」。发送只把说明交给当前会话，不会自动部署、开新任务或授权收费；宿主没有发送通道或发送失败时，复制到当前聊天即可。

下面是界面实际使用的[提示词源码](../integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/cloud-deployment-prompt.mjs)原文，可直接复制。Agent 应继续按本文选择当前源码、确认操作并完成验收，不把收到提示词当成部署成功。

```text
请帮我部署我自己的 Moji（墨叽）个人云端实例，供 DSH / Codex 完整可视化插件工作台共用作品。目标必须能打开正文、资料与规划页面，不把 CLI 或仅列出 MCP 工具当作交付。
先阅读当前默认分支 moji-release 的官方部署指南：https://github.com/CF-612/MoJi/blob/moji-release/docs/cloud-agent-deployment.md ，并遵循该分支 README 的显式新建/更新流程；不要使用固定旧版本或直接部署根模板。
先确认我是新建实例还是更新已有实例，再核对我的 Cloudflare 账号、资源范围与可能费用。此消息仅请求部署协助，不授权自动创建收费资源、付款、删除或覆盖已有数据；实际资源变更前请让我明确确认。登录与密钥输入由我在官方授权/本地隐藏输入中完成，不在聊天里索要密码、令牌或工作台密钥。
已有实例应保留原清单、绑定、密钥与作品；不能同名接管、创建空替代库或在结果不明时盲目重试。分别报告部署、健康检查、完整可视化插件注册、真实客户端授权及工作台页面验收；失败如实说明。注册和授权步骤按当前宿主支持的官方流程操作。
部署完成后给我 HTTPS 实例根地址用于 DSH，及 /mcp 地址用于 MCP 客户端。本机作品不会自动上传或同步；需要迁移时先说明备份、预览导入与冲突方案，另征得我同意。
```

## 1. 准备账号、电脑与源码

部署到**你自己的 Cloudflare 账号**，是一人使用的单作者实例，不是公共共享作品库，不开放用户注册。实例所有者承担资源用量与费用，不承诺永久免费。

准备：

1. 一台能运行终端、打开登录浏览器的电脑或经你授权的开发环境；Git、Node.js 24+、npm。手机是使用入口，不是在手机聊天里执行部署命令。
2. 你可管理的 Cloudflare 账号及 Workers、D1、KV、Durable Objects 所需权限。确认目标账号、资源范围与费用边界后再部署；登录由本人完成，不把账号密码或令牌发给 AI。
3. 账号 ID（不是 Zone ID）。可在 Cloudflare 控制台搜索 `Copy account ID`，或从 Workers & Pages 的账号详情取得，见 [Cloudflare 官方说明](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)。
4. 已配置的 `workers.dev` 账号子域名；在 Workers & Pages 确认。当前脚本不会代为注册账号级子域名，也不要求购买自定义域名，见 [workers.dev 官方说明](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)。
5. 为墨叽准备至少 24 字符的随机工作台密钥，保存在自己的密码管理器。它不是 Cloudflare API token，也不是 ChatGPT 密码。

从 [项目仓库](https://github.com/CF-612/MoJi) 选择你要用的源码分支／标签／提交。部署提示词指向持续维护的 `moji-release` 分支；默认发布分支和开发分支可能不同，不要混用旧文档、旧包和新脚本。需要当前候选版功能时，在 [Releases](https://github.com/CF-612/MoJi/releases) 核对当前候选版（预发布）及其源码标签，并明确接受试用性质；更新清单中的 `latestStable` 与当前候选版不是同一概念，不能只取稳定版而误以为包含候选版新功能。下面 `YOUR_REF` 要换成你已核对存在且决定采用的分支或标签；需要精确复现时再 checkout 已核实的提交。不要把占位符原样执行。

```sh
git clone --branch YOUR_REF --single-branch https://github.com/CF-612/MoJi.git Moji
cd Moji
git rev-parse HEAD
node --version
npm --version
npm ci
npm ci --prefix integrations/chatgpt-workbench
```

当前最低 Node 版本以 [package.json](../package.json) 为准；两套依赖各用自己的锁文件。部署使用项目锁定的 Wrangler，不另外安装全局最新版。先确认所选源码确有 `deploy:new` / `deploy:update`，不要在旧版本找不到命令时改用裸 Wrangler 部署根模板。已有源码目录先检查未提交修改，勿用重置或重新克隆覆盖日常数据。

## 2. 本人登录 Cloudflare

以下及下一节会访问真实账号；新建／更新会改变真实云资源，不是本地模拟测试。在仓库根目录运行：

```sh
node integrations/chatgpt-workbench/node_modules/wrangler/bin/wrangler.js login
node integrations/chatgpt-workbench/node_modules/wrangler/bin/wrangler.js whoami
```

在浏览器核对登录账号并完成授权；检查 `whoami` 中的账号与准备使用的账号 ID 相符。若没有浏览器、登录失败、权限不足或未配置子域名，先解决该项，不绕过检查或索要用户 token。命令依据项目锁定 CLI 和 [Wrangler 官方文档](https://developers.cloudflare.com/workers/wrangler/commands/)。

## 3. 首次新建个人实例

将 `YOUR_ACCOUNT_ID` 换为自己的 32 位账号 ID；`my-writing` 是可自选实例名（2–31 位，小写字母开头，其余为小写字母、数字、连字符）。首次新建选未使用的清单路径：

```sh
npm run deploy:new -- --account YOUR_ACCOUNT_ID --instance my-writing --manifest .moji-cloud/my-writing.json
```

脚本检查账号和资源，生成带随机后缀的独立 Worker、D1、KV，执行已审核数据库迁移、构建上传、设置密钥并检查服务。Durable Objects 绑定与迁移随 Worker 部署。遇同名冲突停止，不复用他人的库；**不要直接部署根 `wrangler.jsonc` 模板或开启自动资源供应**。

提示 `Workbench key (hidden; 24+ characters)` 时，由本人输入准备好的随机密钥。不要放进命令参数、聊天、截图、源码或普通文件。非交互环境会停在密钥阶段，不能当作成功；此时资源和服务可能已创建。请本人在可交互终端按脚本输出的同模式 `--resume` 命令继续，不重新新建，也不要让 Agent 通过聊天或明文文件收集密钥。

保存部署输出的 HTTPS 根地址，并妥善备份 `.moji-cloud/` 清单和生成配置。它们记录账号、资源 ID、源码提交及阶段，不含密钥，但也不要公开提交。清单绑定原绝对路径；换电脑或目录时不要伪造新清单继续更新，应先核实迁移方式。**清单不是作品备份。**

## 4. 检查服务，再连接客户端

脚本只有在下列三项通过后才报告服务就绪。也可用浏览器打开输出的根地址，并分别追加路径检查（不发送密钥）：

| 地址 | 应看到什么 |
| --- | --- |
| `https://你的实例.workers.dev/` | MCP 连接说明页；**不是独立网页版编辑器** |
| `https://你的实例.workers.dev/.well-known/oauth-authorization-server` | OAuth discovery JSON |
| `https://你的实例.workers.dev/health` | 成功响应且 JSON 中 `ready` 为 `true`；检查密钥配置及数据库就绪 |

只看到根页不代表数据库或登录正常；`ready: true` 也不代表真实宿主验收完成。失败时先按下一节处理，不反复新建实例。

### MCP／ChatGPT／Codex 客户端

1. 先确认当前插件的连接方式。已通过 ZIP 安装时，核对其 MCP／应用映射是否指向自己的云端；同一地址、OAuth 配置及包内品牌元数据不变时，通常无需重做 ZIP；包内容变动时按宿主支持的版本更新流程处理，见[插件升级说明](plugin-package.md#后续升级github个人云端与-zip-分开)，勿盲目重建插件。若使用自定义远程 MCP 连接，在对应入口填写 **HTTPS 根地址加 `/mcp`**，例如 `https://你的实例.workers.dev/mcp`，选择 OAuth。不要把这条创建流程当作 ZIP 安装流程。
2. 在你自己的实例授权页核对域名、客户端和回调地址，再由本人输入工作台密钥。使用内置 OAuth，无需 Auth0；不要把密钥手填成 Bearer token，也不要发给聊天中的 AI。
3. 完成授权后，在新会话中选择墨叽，先读取测试作品，再打开可视化工作台。工具扫描／初始化成功与完整 GUI 可用应分别检查。
4. 手机端仅在账号确实可用该远程插件及其视图时继续；若没有入口、没有写权限或无法显示界面，记录宿主与限制，不把“部署成功”说成“手机验收通过”。

### DSH 原生插件

1. 保存当前草稿，在工作台“更多功能”中打开“本地 / 云端”。
2. 选择“个人云端”，填写 **HTTPS 根地址，不加 `/mcp`**，再“保存并切换”。此处只连接已有服务，不新建／部署云端。
3. 点击“登录个人云端”，在浏览器完成 OAuth 授权；核对实例后由本人输入密钥。回到 DSH 确认“已连接”。
4. 若切回“本机”，应看到原本机库而非云端新增作品；这是两份独立库的正常表现，不是同步故障。

## 5. 备份、试导入与实际创作验收

连接成功后先用测试作品，不直接搬全部重要小说：

1. 在原本机库等待保存完成，导出作品或完整工作库；保留原件与独立备份。聊天记录、账号配置、未保存草稿不在小说备份中。
2. 经本人确认要迁移后，在目标云端导入预览中核对来源、目标及冲突。首次可用“复用内容”创建独立测试作品；需要保留原 ID／历史时选“恢复备份”。同 ID 同内容跳过，同 ID 不同内容拒绝直接覆盖，不能强行改版本或用旧备份盖掉新正文。详细规则见[导入与导出](import-export.md)。
3. 在测试作品中写一小段正文、添加一张设定卡和一张规划卡，等待保存；关闭并重新打开工作台，确认内容仍在。
4. 让第二个已授权客户端连接**同一云端地址**，重新读取同一作品，确认已保存修改可见。未保存草稿和宿主聊天不属于这项验证。
5. 切回 DSH 本机，确认原作品仍在且未被云端测试修改；切回云端，再确认测试作品。另一个云端实例也应是独立库，不应自动出现此作品。
6. 分别记录 OAuth、读写工具、可视化编辑、保存重开、跨端读取和库隔离的结果。完成前不要宣称“所有客户端可用”。

## 6. 以后更新／失败恢复（不是再次新建）

更新前导出作品备份，记录当前源码提交及原清单；选择并核对新源码，重新执行两次 `npm ci`。使用**原账号、原清单、原资源**：

```sh
npm run deploy:update -- --account YOUR_ACCOUNT_ID --manifest .moji-cloud/my-writing.json
```

更新会核对账号、D1/KV ID 与 Worker 绑定，保留原作品及密钥，不创建空替代库、不自动轮换密钥。缺少清单的旧私人部署不自动导入，不能伪造清单或运行新建覆盖它。

- 失败会记录阶段、非零退出，并给出同模式 `--resume` 命令。先核对失败原因，再按输出恢复；不要把 `update` 失败改成 `new`。
- 创建请求超时、结果不明确时，先核实精确资源 ID、创建记录和所有权。同名不足以证明所有权，不盲目重建、认领或删除。
- 数据库迁移先于上传；新增／修改 SQL 必须经过兼容性审查，脚本对未审核迁移会停止。失败不自动删除资源，也不自动回滚数据库。
- 裸 `npm run deploy` 只给用法；不要改用裸 Wrangler 绕过边界。
- 更新后重新执行服务检查及测试作品保存重开。若宿主需要刷新工具定义，按其权限和官方说明处理，不默认自动刷新。

## 本地验收与仍待人工确认的部分

以下待办是部署及实际功能验收，不是等待官方插件目录审核。

本地冷安装、构建、测试及根模板 dry-run 已有通过记录，见[本地云端验证记录](cloud-local-validation-2026-10-23.md)。这些不登录 Cloudflare、不创建真实云资源；**真实 Cloudflare 首次部署，以及真实 ChatGPT／Codex／DSH（含手机）首次授权和完整创作界面验收仍待完成**。

开发者在两套依赖安装完成后可运行：

```sh
npm run typecheck
npm run build
npm run build --prefix integrations/chatgpt-workbench
npm run build:cloud --prefix integrations/chatgpt-workbench
npm test
npm test --prefix integrations/chatgpt-workbench
npm run test:cloud --prefix integrations/chatgpt-workbench
npm run test:deploy
```

保持两份锁文件，不单独覆盖 Miniflare/workerd 或降低根 `compatibility_date`。`test:deploy` 使用模拟执行器；云端测试使用临时本地存储及测试密钥，包含实际根模板认证与重启读取，不代替真实一小时续期和宿主验收。

执行依据：[部署编排](../scripts/deploy-personal-cloud.mjs)、[Wrangler 适配器](../scripts/cloud-wrangler-adapter.mjs)、[根模板](../wrangler.jsonc)、[DSH 连接界面](../src/client/native-connection.tsx)。Agent 应分开报告资源、迁移、上传、密钥、服务健康和客户端验收；真实登录、资源变更、作品迁移都需在用户授权范围内执行。
