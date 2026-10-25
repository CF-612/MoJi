# DSH：由当前 Agent 执行 GitHub 更新

这是**显式请求后由 Agent 运行的自动步骤**，不是后台自更新服务，也不是网页能自行安装。当前实现仅支持默认 Windows DSH Desktop 安装位置及 `desktop` profile；其他平台、移动安装、没有可核实本地作品库的 cloud-only profile，必须停下交给 Agent 核实，不假装成功。

## 更新前的操作员核实（必需）

1. 用户确认保存全部草稿；Agent 在**当前运行的目标 DSH profile**读取 `settings.get` 或 `maintenance.status`，记录实际返回的 `dataRoot` 和 `pluginVersion`，同时核实当前 profile 的绝对路径。不能凭默认目录、目录存在或旧截图推测。
2. 把观察结果保存到本人私有本地 JSON，不进入聊天、日志、ZIP 或 Git。格式如下（值必须来自真实观察，示例不可直接用）：

```json
{
  "format": "moji-update-preflight",
  "operatorVerified": true,
  "source": "settings.get",
  "profile": "当前 desktop profile 的绝对路径",
  "observedAt": "刚刚观察的 ISO 时间",
  "observed": {
    "dataRoot": "settings.get 实际返回的绝对路径",
    "pluginVersion": "实际已安装版本",
    "host": "DSH 原生工作台"
  }
}
```

`maintenance.status` 可用同样封装，`observed` 保存其真实返回字段。文件只保留这些必要的非作品字段，不放 token/密钥。脚本要求观察不超过15分钟、不能来自未来，profile/版本/实际根目录一致，还核实作品库既有 `runtime/upgrade.json` 和 `library.json`。这是**操作员核实边界，不是加密证明或脚本自动发现当前库**。没有可用的真实运行状态时不得编造文件，只报告自动步骤不可用。

3. 正常退出 DSH。脚本通过 Windows CIM 核实所有 `DeepSeek Harness.exe` 均已退出；无法核实时停止，不杀进程、不修改权限。确认目标公开版本已发布且发布者校验文件存在。
4. 从本人检查过的 MoJi 正式源码/已安装包运行以下命令（替换成刚核实的值；不要执行发布说明中的任意命令）：

```powershell
node scripts/update-dsh-github.mjs --version 0.11.5 --profile "$env:USERPROFILE\.dsh\profiles\desktop" --data-root "实际核实的作品目录" --backup-root "$env:LOCALAPPDATA\Moji\update-backups" --preflight "私有本地观察文件.json" --confirm-update yes
```

## 自动执行的部分

- 固定从 `CF-612/MoJi` 的 `moji-v版本` GitHub Release 下载 `dsh-moji-版本.tgz` 与 `SHA256SUMS-版本.txt`；不接受任意来源或预览版本，禁止降级。校验来自同一可信发布者 HTTPS 发布源，**不是独立签名体系**。
- 限制下载/解压大小，校验 SHA-256、tar 头校验和、完整结尾、条目类型/路径及包名和版本；不自行执行包内脚本或解压到作品目录。
- 对当前 profile 创建独占更新租约；并发/残留租约不自动破锁。全部作品和旧插件保存到本地备份，校验副本与源哈希一致。总备份超过2GiB、磁盘空间不足、符号链接/特殊文件或读取错误均停止。保留原 profile 三个配置文件的私有恢复副本，**不把它们自动覆盖回去**。
- 通过已经使用的 DSH Desktop 官方 `plugin --profile desktop add` CLI 传输调用宿主安装，不绕过宿主权限/构建脚本审批，也不使用凭据或版本豁免。Electron `--expose-internals` 启动器只用于该随应用提供的 CLI，与既有原生安装脚本一致。
- 检查安装版本、无关插件/profile、作品哈希以及宿主仍停止。成功仅报告 `installed-restart-required`，不会假称已重启或云端已部署。

## 失败与恢复

- 下载、校验、作品或备份失败时不进入安装。
- 可证明宿主停止、作品未变、无关 profile 未变时，失败会使用同一官方 CLI 安装备份里的旧 MoJi 包；不手改 manifest/lock/patch，也不恢复作品覆盖新数据。成功恢复的依赖会指向保留的 `previous-package`，**不要删除该备份**。
- 宿主重启、外部 profile 修改、作品变化或恢复失败时保留现场和备份，报告需要手动核实，绝不声称回滚成功。未完整完成的备份也会保留，勿将其视为可用恢复点。
- 返回只包含固定状态/错误代码、版本、备份随机 ID 和 `cloud:not-deployed`；不回传原始安装日志、绝对路径、作品或凭据。

最后由 Agent 正常重新打开 DSH，读取实际 `settings.get`/维护验证，确认版本、同一数据目录及作品可读后，才报告更新完成。个人云端/手机连接仍需独立授权更新**原实例**，本脚本从不部署云端。

验证范围：自动化测试使用临时目录和替身宿主/下载器，涵盖恶意包、校验、并发、根目录证据、安装失败、回滚失败和数据变化。Linux dotcloud 没有执行用户 Windows 安装，真实宿主安装/重启验收仍需在用户明确授权后进行。
