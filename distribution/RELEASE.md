# 墨叽 · 发布入口

当前正式版为 **[0.11.3](https://github.com/CF-612/MoJi/releases/tag/moji-v0.11.3)**。`moji-release` 是默认发布分支，`codex/main` 是开发分支；日常安装优先使用正式 Release，不以开发分支代替发布包。

## 选择安装包

| 用途 | 正式版文件 |
| --- | --- |
| DSH 原生插件 | [dsh-moji-0.11.3.tgz](https://github.com/CF-612/MoJi/releases/download/moji-v0.11.3/dsh-moji-0.11.3.tgz) |
| Windows 独立本机版 | [Moji-0.11.3-windows-x64.zip](https://github.com/CF-612/MoJi/releases/download/moji-v0.11.3/Moji-0.11.3-windows-x64.zip) |
| 个人云端插件包生成器 | [Moji-0.11.3-plugin-generator.zip](https://github.com/CF-612/MoJi/releases/download/moji-v0.11.3/Moji-0.11.3-plugin-generator.zip) |
| SHA-256 校验文件 | [SHA256SUMS-0.11.3.txt](https://github.com/CF-612/MoJi/releases/download/moji-v0.11.3/SHA256SUMS-0.11.3.txt) |

- **DSH**：安装 `.tgz` 原生插件，可使用本机作品库或连接自己的个人云端。
- **Windows 独立版**：解压后按包内说明启动本机工作台，不是 Codex 插件的本地模式。
- **Codex／网页 GPT／手机 GPT 可视化插件**：先部署自己的个人云端，创建自定义 MCP 并授权；再使用本人应用 ID 生成更新 ZIP，在同一插件上传新版本，保留一个入口。生成器 ZIP 本身不是可直接上传的成品插件，也不包含作者的私有实例配置。
- 校验文件用于比对下载文件的 SHA-256；源代码 ZIP/TAR 不替代上面的成品包。

`distribution/latest.json` 仅提供正式版更新信息，不把预发布版或未公开草稿列入正式更新。后续版本请查看[最新正式版](https://github.com/CF-612/MoJi/releases/latest)；各版变更及验证边界以对应发布说明为准。

安装见[开始使用](../docs/getting-started.md)、[DSH 安装与更新](../docs/agent-installation.md)、[个人云端部署与更新](../docs/cloud-agent-deployment.md)和[插件打包指南](../docs/plugin-package.md)。升级前阅读[更新与备份说明](../docs/upgrade.md)，备份作品并核对实际数据目录。

**更新源码或安装包，不代表个人云端已经更新。** 已有云端必须按部署文档使用原账号、原实例清单和原资源执行更新；不重新新建替代实例。本机和云端作品库不会自动同步，迁移需使用备份导出与导入。

源码保留 MIT 许可和上游署名。本页不额外承诺代码签名、平台兼容或真实宿主／云端验收结果。

Gemini 目前仅网页端 MCP 内容读写，不提供工作台界面，手机端暂不支持。个人云端根地址是连接说明，不是独立网页编辑器；云端可视化界面由支持的宿主客户端承载。
