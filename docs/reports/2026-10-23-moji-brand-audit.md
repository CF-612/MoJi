# Moji 品牌一致性检查

## 当前对外名称

- 品牌英文拼写：**Moji**；中文名：墨叽。
- npm / DSH 包：`dsh-moji`；插件 id / provider：`moji`。
- DSH 工具：`moji_*`；技能目录与注册名：`moji-*`。
- 集成包：`moji-chatgpt-workbench`；MCP serverInfo：`Moji`，版本读取当前 package.json。
- MCP 当前资源 URI：`ui://moji/...`；旧 URI 不列出，但保留读取别名。
- Windows 构建目录：`Moji-${version}-windows-x64`；导出包文件后缀：`.moji.json`。
- 英文界面、关于页、当前安装文档和打包说明同步更新；真实仓库地址仍为 `CF-612/MoJi`，未擅自重命名远程仓库或更换 updater feed。

## 有意保留的旧标识（不是当前品牌）

| 分类 | 保留项 | 原因 |
| --- | --- | --- |
| 数据兼容 | `cuigengji` 数据目录、`CUIGENGJI_DATA_ROOT` 回退、Windows 既有 `MoJi\\workbench` 路径 | 不移动、不丢弃作者作品。DSH 新目录默认 `moji`，已有旧目录则继续原地使用；`MOJI_DATA_ROOT` 优先。 |
| 数据协议 | `cuigengji-*` JSON format、升级备份目录/记录、导入识别 | 保持旧备份可读及校验一致；文件名可更新，存储协议不是品牌字符串。 |
| 会话/凭据 | `dsh-cuigengji/connection`、cloud credential key、浏览器草稿/preferences key | 避免登录状态、草稿和偏好被改名隔离。 |
| 宿主内部 | `cuigengji/dispatch` RPC、旧 provider 别名、DSH 资源路由/locale key | 现有客户端和宿主内部连接兼容。新模块加载 id 已为 `dsh-moji`。 |
| UI 实现 | `.cuigengji` CSS class、`vendor/cuigengji` 路径、DOM 事件 | 不展示为产品名称；全局改动会无谓扩大样式、打包导入与交互风险。vendored 实际品牌内容已同步。 |
| 旧提示清理 | `cuigengji:writing/preset/...` | 仅用于从历史装配结果清除旧提示，避免重复注入。新提示使用 `moji:*`。 |
| 云资源 | 既有 worker/database 名和部署 URL | 绑定实际已有数据，改名不是品牌文案变更；本次没有云部署。 |
| 法律与史料 | 上游 mistnest / 催更姬 / `dsh-cuigengji-plugin`、MIT、历史报告包名和 hash | 必须保留署名与真实历史，不伪造旧交付记录。 |
| 测试 | legacy fixture、临时目录前缀、兼容性断言 | 验证旧数据、旧安装检测；不成为对外产品名称。 |

## 工具与安装切换

DSH 仅注册新 `moji_*` 工具，不通过隐藏旧工具绕过宿主权限，也不向模型重复展示旧名称。安装后重开会话刷新工具目录；不要重放历史 `cuigengji_*` 工具调用。MCP 已有 `workbench_*` 工具不含旧品牌，继续保持名称兼容。

旧插件和新包同时激活可能形成两个写入者。安装脚本检测到旧依赖、bundle 或 patch 时，在写 profile 前停止。请先备份作品和 profile，通过宿主插件管理停用并移除旧插件，**仅移除插件、保留数据目录**，再安装新包。本次没有运行用户机器的 DSH 安装。

## 本地验证

- 根 typecheck、build 通过；根单测 303/303。
- 安装/发布脚本语法检查及专项测试通过。
- MCP 集成验证覆盖新 serverInfo/version、新资源列表和旧 URI 读取兼容；完整最终候选包验收另记。
- 无 staging、commit、push、公开 release 或部署操作。

`lib/client.js` 是本轮有意更新的 tracked 构建产物：旧 bundle 本身仍带旧公开包 id / 品牌，必须随最终源码重建，不能为了缩小 diff 保留旧包。连续两次 `npm run build` 的 SHA-256 一致：`1450f2a71d3ea7d17e53a3eed91a3e746eb29523dc4cbda6281a7bd0fa894061`。较大 diff 来自重新构建当前共享界面依赖，不是全量替换兼容性 CSS 标识。其他 dist/cache/artifacts 不纳入本轮源码提交。

最终集成回归：251/251；云端模拟回归：11/11。真实 DSH 安装留给用户；独立候选包与真实 Codex 宿主验证在最终提交后重建再验，不拿旧包改文件名代替。
