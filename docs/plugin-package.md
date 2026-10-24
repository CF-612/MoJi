# 墨叽统一插件包

## 统一入口与电脑直连

统一包版本为 **0.11.2**，独立于工作台服务版本。它通过 `.app.json` 关联本人已经注册、授权的 ChatGPT 云端应用，供 Chat、Work、Codex 和手机端使用同一连接。包内不再同时放置直连 `mcp.json`，避免工具重复和仅电脑可用的接入分歧。具体可用性仍受宿主、账号和工作区权限限制，必须逐端验收。

旧的 0.11.0／0.11.1 包只有 MCP 直连配置：电脑 Work／Codex 可以加载，不等于聊天和手机能发现它。0.11.0 还有桌面解析器拒绝 MCP `extensions` 的兼容问题。0.11.1 只修复解析，不是跨端修复。

## 生成自己的包

需要 Node.js 24+。无需 npm install，生成器离线运行，不部署、不注册应用、不读取密钥或小说。

1. 先部署自己的云端实例。
2. 在 ChatGPT 中找到本人已有的自定义 MCP 应用，确认其 URL 指向该实例，并完成授权。已经有连接时直接复用，不再新建。仅首次完全没有连接时，通过“插件 → 添加自定义 MCP 服务器”注册一次。
3. 从应用详情 URL 复制 `plugin_asdk_app_…` ID；也接受 `asdk_app_…`。上传 ZIP 产生的 `Plugin_…` 是另一种 ID，不能用来代替应用 ID。
4. 在源码根目录运行：

```sh
npm run package:plugin -- "https://你的实例.workers.dev" --app-id "plugin_asdk_app_你的32位应用ID"
```

示例 ID 是占位符，必须换成实际应用 ID。生成器会校验格式，但不能离线证明应用归属、访问权限、应用是否指向给定 URL，须在应用管理页核对。网址仅用于输入校验和提示；实际连接及 OAuth 由所关联的应用管理。不要输入工作台密钥、Cloudflare token 或 OAuth secret。

输出：`integrations/chatgpt-workbench/cloud/plugin/moji-personal.zip`。

```text
plugin.json
.app.json
assets/icon.png
```

名称沿用 `moji`，显示名和图标保持“墨叽 · 小说工作台”。manifest 的 `extensions.com.openai.apps` 指向 `./.app.json`，应用以 `required: true` 声明。公共模板只有占位符，个人应用 ID 由参数传入，不写进公共仓库。个人 ZIP 已被 Git 忽略，不应上传为公共 Release。

依据：[官方应用关联和打包说明](https://developers.openai.com/plugins/build/plugins)。`plugin.json` 中的展示信息扩展与曾导致错误的 MCP 条目 `extensions` 不是同一个字段。

## 更新现有插件与验收

打开现有 ZIP 插件详情，选择 **上传新版本**，上传生成包；不要另点“添加插件”重复创建。应用本身是这个插件的依赖，不要删除或撤销它的授权。原来的独立应用入口是否仍显示由宿主决定，ZIP 无法自动合并、隐藏或删除账号里的条目。

上传成功、包解析成功、完成 OAuth、真实打开界面是四个不同结果。验收时使用同一个测试作品，分别检查：

| 场景 | 验收标准 |
| --- | --- |
| 电脑 Chat | 能 @ 同一插件、调用 workbench_open 并打开界面 |
| 电脑 Work | 能找到同一插件、没有两套重复工具 |
| Codex | 解析应用关联且能调用同一云端服务 |
| 手机 Chat／Work | 能找到入口、打开工作台；布局与交互正常 |
| 数据一致性 | 测试作品编辑保存后，关闭重开及换端能读到相同结果 |

失败时记录“找不到入口／未授权／工具调用失败／界面失败”，不要清空作品库，也不要用关闭 OAuth 或重复创建连接来绕过。没有手机实机验收时，不得标记手机已通过。

## 仅电脑直连的开发选项

```sh
npm run package:plugin -- "https://你的实例.workers.dev" --desktop-only
```

输出 `moji-desktop-only.zip`，只含 `plugin.json`、`mcp.json`、图标；不会覆盖统一包，也不宣称支持聊天和手机。其 MCP 条目只含 transport 和 URL，兼容会拒绝 `extensions` 的桌面解析器，服务器仍保留 OAuth 保护。两种模式互斥，未指定模式会报错，不再默默生成电脑专用包。

## 发布与验证范围

GitHub 源码推送不会更新用户已下载的生成器 Release 资产，也不会部署云端服务。部署、发布生成器资产、上传个人插件包分别操作；本次为模板和生成器修复。下载的 `Moji-<版本>-plugin-generator.zip` 是生成工具，不是可以直接上传的个人包。

```sh
npm run test:plugin-package
```

测试覆盖 ZIP 完整性、应用 ID 验证、两种模式互斥、原品牌保留、私密信息排除及输出文件保护。这些测试不是 ChatGPT 上传校验器，也不能代替上述各端真实使用验收。
