# MoJi 0.12.1 — 仅 DSH 兼容更新

本次仅发布 **DSH 原生插件** `dsh-moji-0.12.1.tgz`，基于0.12.0，业务功能、界面、作品格式与个人云端逻辑不变。Windows独立工作台、网页／个人云端无需因本次补丁更新；不重新发布它们的安装包。

- 精确增加 DSH `0.2.1-rc.5` 兼容声明，保留此前允许的版本，不放行所有未来版本。DSH rc5自身仍是官方预发布版。
- 新增让本机DSH助手自行修正过旧兼容声明的指南：确认实际包与宿主版本、备份、精确追加`engines.dsh`、重载验证；实际API／服务／数据不兼容停止回滚，交维护方适配。
- 不改宿主版本，不伪造插件版本，不关闭兼容检查，不修改真实作品或profile。

## 安装

先保存作品并备份真实数据目录；下载本页的`.tgz`并核对`SHA256SUMS`，通过当前DSH原生插件管理器原位更新`dsh-moji`，保持原dataRoot和配置。完整退出再启动，确认实际MoJi版本为0.12.1、维护状态ready、原作品完整。不要安装Source code ZIP，不必先卸载或新建空库。

[本机助手版本声明修复指南](https://github.com/CF-612/MoJi/blob/moji-v0.12.1/docs/dsh-update-troubleshooting.md) · [安装与数据保护](https://github.com/CF-612/MoJi/blob/moji-v0.12.1/docs/agent-installation.md)

## 验证与边界

已运行类型检查、构建、根测试，以及官方rc5真实`runProfile`最小服务集合加载，核对6工具、6Skills及维护ready。使用隔离的合成数据；没有对用户真实profile／作品执行升级，也未在Windows桌面完成GUI验收。DSH兼容验证不等于所有其他插件组合都已测试。
