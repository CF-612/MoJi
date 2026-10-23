# 墨叽 · 安装说明入口

从[最新正式版](https://github.com/CF-612/MoJi/releases/latest)选择适合自己的包；文件名中的版本以实际发布条目为准。需要试用预发布版时，另看[全部 Releases](https://github.com/CF-612/MoJi/releases)及对应说明。不要下载草稿、旧上游包或猜测的附件地址。

## 按使用入口选择

| 使用方式 | 取得什么 | 下一步 |
| --- | --- | --- |
| DSH 原生插件 | `dsh-moji-<版本>.tgz` | 通过 DSH 原生插件管理安装，按[安装与更新指南](agent-installation.md)重启并核对作品。支持本机或自己的个人云端。 |
| Windows 独立本机工作台 | `Moji-<版本>-windows-x64.zip` | 解压并按包内说明启动；这是独立本地入口，不是 Codex 可视化插件的本地模式。 |
| Codex／网页 GPT／手机 GPT 可视化插件 | `Moji-<版本>-plugin-generator.zip` | 先[部署个人云端](cloud-agent-deployment.md)，再按[插件打包指南](plugin-package.md)生成指向自己实例的插件 ZIP 并上传。生成器包不能直接当成品插件上传。 |

下载后对照同一 Release 的 `SHA256SUMS-<版本>.txt` 核验文件。源码 ZIP/TAR 供源码构建使用，不替代 DSH 原生包或 Windows 成品包。

## 完整步骤

- [安装与开始使用](getting-started.md)：选择入口、试用与数据目录。
- [DSH 安装与更新](agent-installation.md)：原生插件安装、升级与旧包迁移。
- [个人云端部署与更新](cloud-agent-deployment.md)：首次部署、以后更新、授权与验证范围。
- [插件打包指南](plugin-package.md)：使用自己的实例生成可视化插件包。
- [更新与备份说明](upgrade.md)：升级前备份及数据安全。
- [发布入口](../distribution/RELEASE.md)：当前正式版资产与更新渠道。

桌面、本机工作台与个人云端可能使用不同作品库，**不会自动同步**。升级或迁移前导出并确认完整备份，核对真实数据目录；不要因品牌或版本名称推断作品已自动迁移。

已有个人云端时，更新软件包或 Git 源码不等于更新云端。按部署文档使用原实例清单更新同一个实例，保留原资源、作品和密钥；不要把更新失败改成重新新建。
