# 墨叽单入口连接与高级打包

## 2026-10-24：内嵌云端应用定义的核对结论

当前公开格式中，`.app.json` 是已有应用的引用，每个条目必须有注册 ID；不是把服务器 URL 写进去就能创建应用的定义文件。不能以不存在或已删除的 ID 生成所谓可重新安装的全量包。

[官方引用校验规则](https://developers.openai.com/plugins/deploy/submission-errors)要求 `app_id_missing`、`app_id_format`、`app_not_eligible` 检查。[应用模板说明](https://help.openai.com/en/articles/20001247-chatgpt-app-templates)介绍平台提供的模板及其配置，不提供个人 ZIP 内定义任意新云端应用的格式。[开发者提交](https://developers.openai.com/plugins/deploy/submission)允许 ZIP 携带远程 MCP 配置进入发布草稿，但该流程不等于个人账号的“上传插件压缩包”，不得混淆。

因此，目前未找到并验证“个人上传一个 ZIP 即注册任意云端应用，同时保留单入口、图标、电脑和手机聊天支持”的实现。不得编造字段，不得声称平台所有渠道永远不支持，也不得再把 MCP 直连包作为这种方案交付。

本次手工包 `Moji-full-1.0.4.zip` 已在个人目录显示“仅限桌面端”，不符合跨端要求；它不是全端安装包，不应继续推荐。1.0.3 引用旧应用，旧应用删除后不能靠此包恢复。安装成功、图标显示和真实跨端可用必须分别记录。

直接创建自定义 MCP 应用的当前界面提供“选择图标”，可在配置时使用 `template/assets/icon.png`（256×256 PNG，9484 字节，小于 10 KB）。不要为了图标再添加 ZIP 外壳。现有应用是否支持原位改图标须按其界面核实，不能用此处的创建能力推断编辑能力。

## 推荐：一个应用入口

名称统一为 **墨叽 · 小说工作台**，不加“（云端）”。部署好个人实例后，直接使用已注册的远程应用，不再上传额外 ZIP 外壳。

1. 已注册过：复用现有应用、连接和授权，按需修改显示名称；不要重新创建。
2. 首次使用：在账号允许的 ChatGPT 自定义应用入口，填写上述名称、本人实例的公开 HTTPS `/mcp` 地址，认证选择 OAuth，完成授权。不是上传普通聊天附件。
3. 手机登录相同账号和工作区，刷新应用列表并查找墨叽。电脑 Chat、Work、Codex 与手机均须分别验证是否能发现应用、调用工具、打开工作台以及保存重开。权限和宿主支持不同，模板不能保证每端可见；某端不可见时先核对账号、工作区和应用权限，不要再建一份插件。
4. 已装旧外壳：卸载额外 ZIP 插件，保留已授权的远程应用。不要删除应用或云端数据库。

只填本人网址即可获得连接说明，不生成 ZIP，也不部署或创建应用：

```powershell
npm run package:plugin -- "https://你的实例.workers.dev"
```

地址填根地址或 `/mcp` 均可；不得填写密钥、OAuth token、Cloudflare 凭据。工作台密钥只在本人核对的授权页输入。连接模板为 `template/connection.json`。

## 为什么删除后又出现

旧版所谓“统一包”通过 `.app.json` 把注册应用设为必需依赖。连接 ZIP 时会安装该依赖，因此删除应用后再次连接外壳会恢复应用。一个后端不等于一个入口。此前把这条路线推荐为单入口是错误的。

## 高级外壳：明确接受额外入口才使用

只有需要组合技能等额外插件内容时才考虑。`--app-id` 单独使用会拒绝生成，必须明确添加参数：

```powershell
npm run package:plugin -- "https://你的实例.workers.dev" --app-id "asdk_app_0123456789abcdef0123456789abcdef" --allow-extra-entry
```

示例 ID 是虚构的，须替换为本人已注册应用的 ID（可带 `plugin_` 前缀），不是密钥或 ZIP 的 `Plugin_…` ID。输出 `moji-app-wrapper.zip`，会引用现有应用，可能显示外壳与应用两个入口；不能合并、隐藏该依赖。默认模板不再预挂应用依赖，生成器仅在明确选择外壳时加入。请勿发布个人连接包。

仅电脑 MCP 直连测试可使用 `URL --desktop-only`，输出 `moji-desktop-only.zip`；不承诺手机或聊天端兼容。所有 ZIP 都不包含小说、密钥或本地设置。

## 验收与范围

生成器测试只验证格式、参数和输出安全，不代表真实各端接入成功。发布源码修复不等于更新已上传的旧 ZIP 或 GitHub Release 附件。单入口用户无需再上传 ZIP。

参考：[官方插件格式](https://developers.openai.com/plugins/build/plugins)、[自定义 MCP 应用连接](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)、[ChatGPT 插件](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt)。
