# 墨叽官方安装流程：先自定义 MCP，再用 ZIP 更新插件

目标是一个“墨叽 · 小说工作台”入口，保留原版章鱼图标、GitHub 官网和云端连接。先创建并授权自定义 MCP，再在**同一个插件**上上传 ZIP 新版本。不要把更新 ZIP 作为另一个新插件安装。

## 1. 创建自定义 MCP 并授权

在 ChatGPT 插件页选择“添加自定义 MCP 服务器”。填写：

| 字段 | 填写内容 |
| --- | --- |
| 名称 | 墨叽 · 小说工作台 |
| 服务器 URL | 本人的公开 HTTPS 实例地址加 `/mcp` |
| 身份验证 | OAuth |
| 图标 | 可选择 `integrations/chatgpt-workbench/cloud/plugin/template/assets/icon.png` |

完成连接和授权；已有可用自定义 MCP 直接复用，不删除、不重新创建。密钥只在核对过的本人授权页输入，不放进聊天或 ZIP。创建窗口出现文件名不代表图标已经生效，最终页面仍需核对。

## 2. 取得当前应用 ID，生成更新包

打开刚创建的插件“管理”，复制“应用 ID”中的 `asdk_app_…`。也可从详情网址复制 `plugin_asdk_app_…`，生成器会自动去掉 `plugin_` 前缀。不是 OAuth 密钥，也不是另一个 ZIP 插件的 `Plugin_…` ID。

在项目目录使用 Node.js 24 或更新版本执行：

```powershell
npm run package:plugin -- "https://你的实例.workers.dev" --app-id "asdk_app_0123456789abcdef0123456789abcdef"
```

上面的 ID 是虚构示例，请换成本人刚创建的应用 ID。URL 可填 HTTPS 根地址或 `/mcp` 地址；只填 URL 会输出步骤说明，不生成包。

输出为 `integrations/chatgpt-workbench/cloud/plugin/moji-cloud-update.zip`。包包含品牌资料、原图标和当前应用关联，不包含 `mcp.json`、密钥、小说或旧作者应用 ID。URL 用于提醒核对；实际连接由所选应用 ID 决定，生成器不在线验证二者对应关系。

生成器默认沿用本次实测自动创建的插件名 `dev-<应用ID后缀>`。为核对或兼容其他命名，可先在该插件详情“下载插件 ZIP”，查看 `plugin.json` 或 `.codex-plugin/plugin.json` 中的 `name`，然后显式传入：

```powershell
npm run package:plugin -- "https://你的实例.workers.dev" --app-id "asdk_app_0123456789abcdef0123456789abcdef" --plugin-name "导出配置中的name"
```

不要用显示名称代替 `name`。更新前核对应用 ID，保留导出备份。包版本是品牌包版本，不是云端软件本体版本。

## 3. 在同一插件上传新版本

打开**第一步创建的插件详情** → 更多操作 → **上传新版本**，选择 `moji-cloud-update.zip`。不要走插件目录的“上传插件压缩包”新建入口，也不要先卸载原应用。

更新保留应用 ID 与云端连接，补齐图标、名称、分类及网站 `https://github.com/CF-612/MoJi`。网站字段显示“不可用”意味着未配置官网，不等于云端服务或 GitHub 宕机。

“上传 ZIP”窗口旁的“添加自定义 MCP”不能当成已确认会合并 ZIP 的流程。本次操作最终创建了默认资料，故官方流程明确分两步：**先自定义 MCP，再原位更新 ZIP**。

## 4. 验收

- 已安装列表只有一个墨叽入口，名称没有“（云端）”。
- 详情能显示原版图标、Productivity 分类，网站指向本项目 GitHub。
- 设置中仍是同一个应用 ID、同一实例地址和已连接账户。
- 新聊天能选择墨叽并打开工作台；手机使用同一账号和工作区。
- 后续版本需分别检查电脑聊天、Work、Codex、手机的发现、打开与保存重开，不用打包测试代替宿主测试。

**2026-10-24 验收记录：用户确认上述“自定义 MCP → ZIP 更新同一插件”流程手机使用正常，并指定为官方流程。** 此记录是用户验收，不是代理对所有客户端、所有账号的自动测试结论。

## 更新与故障排查

后续品牌资料更新仍走原插件“上传新版本”，不删除连接。若旧应用已被删除，引用旧 ID 的 ZIP 无法恢复它；须恢复有效自定义 MCP 后，使用当前 ID 生成更新包。

以前的 `--allow-extra-entry` 和独立外壳流程已撤下。`Moji-full-1.0.4.zip` 是桌面 MCP 直连包，不适用于本流程，不再作为跨端包提供。仅开发测试可显式使用 `URL --desktop-only`；不得把它替换到正常的云端应用上。

推送源码不会自动替换 GitHub Release 中已有的生成器附件或用户已下载的旧包。发布生成器时应从当前源码重新打包，并附本说明。

参考：[官方打包格式](https://developers.openai.com/plugins/build/plugins)、[应用引用校验](https://developers.openai.com/plugins/deploy/submission-errors)。
