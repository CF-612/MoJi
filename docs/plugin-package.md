# 墨叽个人云端插件 ZIP

墨叽继续通过 GitHub 分发，不走 OpenAI 官方目录上架。这里提供**公共源码模板 + 本地个人化打包工具**，不是作者实例的共享连接，也不是已上传验证的安装包。

## 先分清下载的 ZIP

- `Moji-<版本>-plugin-generator.zip`：发布时提供的生成器工具包，**不是可直接上传的插件 ZIP**。解压后先阅读包内说明；只有含下述项目结构的源码根目录才使用本文的 npm 命令，不猜测工具包内部路径。
- `moji-personal.zip`：填入你自己的云端实例地址后生成的个人插件包，才用于下方上传步骤。
- 源码 ZIP、DSH `.tgz` 和 Windows 独立版 ZIP：不是这里的个人插件上传包。

只使用已核实的发布资产，不猜测下载地址；生成器不会替你部署 Cloudflare。

## 只填自己的实例地址

先按[个人云端部署指南](cloud-agent-deployment.md)部署自己的实例，确认健康检查和 OAuth discovery 正常。需要 Node.js 24+；打包命令仅使用 Node 内置模块，**无需 npm install、联网、登录或创建资源**。

在项目根目录运行（把示例地址替换成自己的实际地址）：

```sh
npm run package:plugin -- "https://你的实例.workers.dev"
# 也接受同一实例的 https://你的实例.workers.dev/mcp
```

输出：`integrations/chatgpt-workbench/cloud/plugin/moji-personal.zip`。重复执行会原子替换此普通文件；若输出路径是符号链接或目录等非普通文件则拒绝写入。ZIP 含个人实例地址，应由本人保管；它已被 Git 忽略，不要强制加入公共仓库。公开分享的是 `cloud/plugin/template/` 和生成器源码，不是替别人填好作者地址的 ZIP。

命令只做离线打包，不测试 DNS、地址归属或线上服务；请自己核对实例归属。拒绝 HTTP、IP/本机地址、常见内部域名、用户名密码、查询串、片段、非默认端口及非根页／`/mcp` 路径。不要把密钥塞进 URL。样例 `your-instance.example` 是不可直接使用的占位符。

## 包内内容与品牌

```text
plugin.json
mcp.json
assets/icon.png
```

没有外层套目录。根 `plugin.json` 使用 portable 格式，`mcp.json` 只声明远程 `streamable-http` 和实例 URL，OAuth 由服务器发现流程处理；`.codex-plugin/plugin.json` 是另一套兼容入口，本模板不混用。`.app.json` 只用于已注册的应用映射，本模板不需要、也不伪造 `plugin_asdk_app…` ID。依据：[官方打包说明](https://developers.openai.com/plugins/build/plugins)。

### 桌面端兼容修复（2026-10-24）

桌面端内置的 `0.164.0-alpha.11.1` 解析器不接受 MCP 服务器条目中的 `extensions.com.openai.auth`，会报 `unknown field extensions, expected url or headers` 并跳过该服务器。因此可能出现插件名称和图标正常、能 @ 选中，但会话没有工具且未进入授权流程的现象。这不是安装了旧版本，也不能根据网页详情的“仅限桌面端”推断用户在网页端使用。

模板和生成器均已移除这个不兼容字段；保留 `plugin.json` 中的展示信息扩展。此改动不关闭服务器 OAuth，不把服务改成匿名访问，也不把密钥写入 ZIP。已用同一桌面端解析器在隔离配置中复现原错误，并确认修正后不再出现该解析错误；完整授权、工具调用和工作台打开仍须在目标宿主验收，不能由解析通过代替。

已上传旧包的用户可重新生成后使用“上传新版本”；若宿主不刷新工具，检查插件连接状态及授权提示。不要以清空作品数据或创建多个同名连接作为默认修复步骤。

名称和完整简介沿用现有 `package.json` 的「墨叽 · 小说工作台」；短简介沿用现有简介中的「陪你写故事的烟灰蛸小说工作台」。图标原样复用已有发布资源 `distribution/moji-plugin-icon.png`（256 × 256 PNG，9484 bytes），不重新设计。模板版本与项目版本同步维护。

OAuth 使用当前个人云端的 discovery 和动态客户端注册，省去手填客户端 ID/secret。包里没有工作台密钥、Cloudflare token、OAuth token、客户端 secret 或小说内容。工作台密钥**只在本人核对过的实例授权页输入**，不要发进聊天。旧 Auth0/自定义 OAuth 部署不在此单地址模板的保证范围内；先确认支持 DCR。依据：[官方认证说明](https://developers.openai.com/plugins/build/auth)。

## 上传与验收

1. 打开网页 ChatGPT 的插件上传入口；官方帮助列出的管理员路径是 **Admin console → 选择工作区 → Plugins → Add → Upload plugin**。只有具备对应权限且入口可见时才可用，不是普通聊天附件。没有权限时请核对账号/工作区设置，不要改走官方目录投稿。
2. 选择生成的 `moji-personal.zip`，核对名称、图标、简介和**自己的** MCP 地址。按宿主提示连接并完成 OAuth。上传不会部署服务器，也不会代替授权。
3. 如果已有墨叽插件，先检查其连接地址；适用时用详情中的 **Upload new version**，不要盲目创建重复连接。
4. 授权后请求“打开墨叽小说工作台”。必须实际看到可视化编辑器，不能只以工具列表出现为通过；用测试作品完成编辑、保存、关闭重开。再在自己的 Codex、网页 GPT、手机 GPT 分别检查同一作品与界面。各端可用能力仍受账号、工作区和宿主支持限制。

上传步骤和权限依据：[官方插件 ZIP 帮助](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt)。这是私人/工作区安装，不是 [OpenAI 官方目录提交](https://developers.openai.com/plugins/deploy/submission)。

## 后续升级：GitHub、个人云端与 ZIP 分开

GitHub 源码更新不会自动更新任何人的个人实例。界面、工具或后端升级后，实例所有者仍须按[部署指南](cloud-agent-deployment.md)使用原部署清单执行 `npm run deploy:update`，保留原资源和数据，并重新验收保存/重开。**同一 MCP URL、OAuth 配置及包内品牌元数据不变时，通常不用重做 ZIP**；服务器继续返回更新后的 UI。名称、图标、简介、连接配置等包内容变动时，再生成 ZIP 并按宿主支持的版本更新流程处理。更换实例 URL 不等同于原插件的普通升级，应先核对宿主支持的连接变更流程，不能承诺直接上传覆盖即可换址。

## GUI 来自服务器，不是 ZIP 静态页面

当前 `cloud/worker.mjs` 的 `workbench_open` 返回 UI resource 元数据，`resources/read` 提供 `text/html;profile=mcp-app` 工作台。ZIP 不复制 HTML、构建产物或本机可执行文件，不使用 stdio/local command；部署后的服务器继续提供完整 GUI。根网址本身仍是连接说明页，不是独立浏览器编辑器。

**验证边界：** 本地测试覆盖文档所用字段契约、ZIP 结构/CRC、原图标、URL 拒绝项、秘密排除及生成物忽略；它不是官方上传校验器。真实账号 ZIP 导入、OAuth 和三个宿主 GUI 的最终验收仍须按上面步骤完成，不能因本地测试通过就宣称跨端安装通过。

```sh
npm run test:plugin-package
```

官方来源核验日期：2026-10-23。格式可能演进；若宿主报字段/权限错误，保存去除个人地址和凭据后的原始错误，先核对文档，不要改成未验证的旧格式或填入他人的应用 ID。
