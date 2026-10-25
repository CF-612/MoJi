# 墨叽更新与个人云端

0.11.5 提供实际更新工具，由当前 Agent 执行自动步骤：

- **DSH：GitHub 更新（Agent 执行）**。使用正式发布源码中的 `scripts/update-dsh-github.mjs`，按工具说明下载官方发布资产、核对校验和、备份与暂存，然后通过官方 DSH CLI 安装。停止前，Agent 必须从当前 profile 的实时服务读取实际数据根与版本，记录带观察时间的本地 preflight 证据；工具拒绝缺失、过期或不匹配的证据。此为明确的操作者核实边界，不是密码学证明或无人值守自动发现。宿主必须安全停止；不会由正在运行的插件卸载自己。重启并验证前，不能声称已运行新版本。详见 `dsh-github-update.md`。
- **Codex / ChatGPT：压缩包更新（Agent 执行）**。提供已有插件导出的 ZIP，运行 `npm run package:plugin -- --update-from <现有插件.zip>`，复用原插件名称、应用 ID 与连接配置生成实际更新包。OAuth 仍由原宿主连接管理，不创建新应用、实例或密钥。**生成后可由 Agent 使用可用且已授权的内置浏览器，在同一插件选择“上传新版本”并完成上传；也可由用户手动上传。** 无公开安装 API 不妨碍已授权浏览器操作。仅在实际登录、权限或确认阻塞时交接给用户，不强制用户手动操作；上传后核对原应用 ID、OAuth、单一入口与界面。
- **Windows 独立 ZIP**：先保存、导出完整备份并保留旧程序；停止对应旧后台后换新版，保留 `%LOCALAPPDATA%/MoJi/workbench`，重启确认版本。此发行形式尚非一键自动更新。
- **手机连接个人云端**：本地升级、插件 ZIP 或 Git push 都不会部署云端。点击「更新已有个人云端」准备独立请求。Agent 必须核实既有授权与 manifest，复用原 Worker/D1/KV/认证，走 `deploy:update`；不得新建替代实例、重置密钥或删除作品。部署后验证服务及手机连接。

自动版本检查不发送聊天、不下载或安装程序。只有点击按钮才将任务交给当前 Agent；没有消息能力的入口提供可复制请求。DSH 通过当前会话公开 SessionFace prompt 并检查接受结果；MCP 仅宿主声明文本消息能力时直接发送。请求已发送不等于已安装。

诊断仅含固定代码、界面版本、入口类型和已执行步骤；不传原始错误、发布说明、作品或凭据。发送未确认时先检查聊天避免重复；复制失败可手动选取。浏览器入口不猜测本机/云端安装位置。工具运行失败时由 Agent 汇报脱敏错误和恢复状态，不自动将本地日志发送给其他 Agent。

能力依据：锁定 DSH 0.2.0-rc.2 的官方 `@deepseek-ai/dsh-client-ui-plugin-manager/README.md` 明确指出已安装插件不后台自动更新。官方 [plugin-manager 文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/boot/plugin-manager/README.md) 区分安装文件恢复与启用失败；直接在活动插件中调用安装不足以保证备份及回滚，所以使用宿主停止后的显式 CLI 工具，而不是未公开 RPC。旧 `update-moji-local.ps1` 依赖开发机 `.data`，不是通用分发更新器。
