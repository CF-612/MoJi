# DSH 0.2.1-rc.3 兼容验收（0.11.5）

2026-10-25 使用 npm 官方注册表安装的 `@deepseek-ai/dsh@0.2.1-rc.3`，实际执行官方 `runProfile` 加载器验证，而不是伪造 `ctx` 或跳过兼容检查。

## 最小修复

`engines.dsh` 从 `0.2.0-rc.2 || 0.2.1-rc.2` 增加 `|| 0.2.1-rc.3`；锁文件根元数据同步。没有改宿主、用户数据、权限设置或 `compatibility.json`，没有使用 `allow-version`。

rc.3 的 `@deepseek-ai/dsh-app-boot` 实际代码先检查自身 `engines.dsh`，存在时不再用 DSH peers 决定兼容性；调用 semver 时使用 `includePrerelease: true`。范围表达式可以涵盖预发布版本，并非语法上必须逐个列举。本次只声明已验证的三个版本，不泛化承诺未测试的未来 rc。

## 实际宿主验收

- 安装：`npm install --prefix .test-runtime/rc3-host @deepseek-ai/dsh@0.2.1-rc.3 --ignore-scripts --no-audit --no-fund`。
- MoJi 类型检查和构建后，`npm pack --ignore-scripts --pack-destination .test-runtime/rc3-pack` 生成真实 `.tgz`。
- 在独立 HOME/DSH_HOME/profile/作品目录中解包该包，由官方 `runProfile` 加载真实 system-prompt、tools、skill、credentials-local、client-connection 服务和 MoJi。没有启动网络监听器，也没有载入用户的环境、凭据或作品。
- **负对照**：仅将隔离包的 engines 改回旧范围，真实宿主拒绝 MoJi，`tools=[]`、`skills=[]`，日志明确 exemption 不启用。
- **修复包**：真实宿主读取原 `.tgz`，六个工具和六个 skills 注册成功，维护状态 `ready`、插件版本 `0.11.5`。

工具：`moji_context`、`moji_maintenance`、`moji_memory`、`moji_plan`、`moji_project`、`moji_structure`。

Skills：`moji-maintenance`、`moji-memory`、`moji-plan`、`moji-project`、`moji-revise`、`moji-write`。

此结果覆盖 **Linux 中官方 rc.3 CLI 宿主真实加载**及包内运行代码，不冒称 Windows Desktop 安装器、窗口/UI 或用户原 profile 已验收。Windows 用户仍需正常安装新包并完整重启，核对实际版本与作品。测试未修改任何真实用户安装。
