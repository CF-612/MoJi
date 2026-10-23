# 个人插件 ZIP 模板阶段记录 · 2026-10-23

## 范围与决策

遵循用户决定：继续 GitHub 分发，取消 OpenAI 官方目录上架。只制作可公开的模板和离线个人化生成器，不部署、不创建账号/云资源、不注册 OAuth 客户端、不上传或安装插件。

沿用现有墨叽名称和简介；图标原样取自已有发布资源 `distribution/moji-plugin-icon.png`，256 × 256 PNG、9484 bytes，SHA-256：`ed19c170ed2c66cf2bee3f70bd715cdb6e2c0f3cf0c9407e668ee5593a16508d`。

图标来自本任务已保留的发布分支 `8d065e6` 资源记录，Git blob 为 `95352aedd63677df6fec8dfd076a7c78523060db`；开发 checkout 没有 `distribution/` 路径属预期。已从本地仓库镜像读取该 blob，并确认它与模板图标 SHA-256 完全一致。

## 官方资料核验

以下页面于本日实际打开核验：

- [Package your plugin](https://developers.openai.com/plugins/build/plugins)：新包采用根 `plugin.json` 和 `mcp.json`；OpenAI 展示字段放 `extensions.com.openai`。远程传输为 `streamable-http`，认证字段置于对应服务器的扩展中。DCR 允许 discovery 提供注册地址，不需要预填客户端 ID/secret。
- [Authentication](https://developers.openai.com/plugins/build/auth)：核对 protected-resource/OAuth discovery、DCR 与 PKCE 要求；与现有个人云端代码和集成测试对照。
- [Upload and submit your plugin](https://developers.openai.com/plugins/deploy/submission)：仅用于核对字段、图标和包格式要求，未执行投稿。`.app.json` 是注册应用映射，不是本模板所需的远程 URL 声明。
- [Plugins in ChatGPT](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt)：核对网页 ZIP 上传入口、权限和授权边界；未将账号可用性或跨端界面支持视为无条件保证。

## 实现

`npm run package:plugin -- "https://自己的实例.workers.dev"` 也接受同实例 `/mcp` 地址。纯 Node.js 24 内置模块，仅打包 `plugin.json`、`mcp.json`、`assets/icon.png`；无外层目录、递归收集、额外依赖、网络调用或本地执行服务。

生成物 `integrations/chatgpt-workbench/cloud/plugin/moji-personal.zip` 已被现有忽略规则覆盖。拒绝非 HTTPS、本机/IP、常见内部域名、凭据、查询串、片段、特殊端口及无关路径；不声称离线校验能证明 DNS 公网性或地址归属。不会读取环境密钥、个人配置或作品目录。

GUI 仍由现有 `workbench_open` 元数据及 `resources/read` 提供，不把 CLI 工具列表当作完整 UI。GitHub 更新不会自动部署私人实例；后端/界面升级仍须所有者用原部署清单更新。连接和包元数据不变时通常不需重制 ZIP。

## 验证记录

- `npm run test:plugin-package`：**6/6 通过**。覆盖文档字段契约、根目录结构、ZIP 目录与 CRC、品牌/图标、危险输入、确定性、秘密排除及 Git 忽略规则。独立复核提出输出符号链接风险后，增加拒绝链接/非普通文件、同目录临时写入后原子替换；回归验证不会截断无关目标文件。
- `npm run package:plugin -- https://my-moji.account.workers.dev`：合成地址离线试打包成功，未访问此地址；Python `zipfile.ZipFile` 的文件列表与 `testzip()` 独立验证通过。测试 ZIP 随后删除，未留下作者/用户个人连接包。
- `node --test integrations/chatgpt-workbench/cloud/tests/worker.test.mjs integrations/chatgpt-workbench/cloud/tests/personal-oauth.test.mjs`：**2/2 通过**。Miniflare 覆盖 MCP/UI resource、工具读写、DCR、PKCE、过期刷新、重启与撤销。CIMD 禁用提示不影响所选 DCR 路线；未为消除提示改动服务配置。
- `npm test`：**392/392 通过**。
- `npm run typecheck`、`node --check scripts/package-chatgpt-plugin.mjs`、`git diff --check`：通过。

## 尚未验证 / 未执行

没有使用真实账号上传 ZIP，没有完成真实 OAuth 连接或 Codex／网页 GPT／手机 GPT 的 GUI 验收。本地字段契约不是官方完整 schema 验证器或上传校验器。完整验收须核对自己的实例，实际打开编辑器并测试编辑、保存、关闭重开及跨端同作品访问。

本阶段未提交、推送、公开发布或部署；四个指定私有脏文件保持未触碰。操作说明见 [插件打包指南](plugin-package.md)。
