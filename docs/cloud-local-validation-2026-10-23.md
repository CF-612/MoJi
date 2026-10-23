# 个人云端本地验证记录（2026-10-23 UTC）

## 基线与范围

- 源码基线：`136b19a48885cac96862d6a516d777b83ac4a43b` 加本轮未提交的 P0 部署/就绪检查与 P1 运行时/根模板测试修改；**不是已发布版本**。
- Debian GNU/Linux 13 (trixie)，x86_64；Node `v24.19.0`，npm `11.9.0`。
- Wrangler 精确 `4.151.3`，正常 npm 解析的 Miniflare `5.20261019.1-beta` / workerd `1.20261019.1`；没有手改传递依赖、使用 overrides 或降低日期。
- 根 `wrangler.jsonc` 保持不变：日期 `2026-10-20`，flags 为 `nodejs_compat`、`global_fetch_strictly_public`。SHA-256：`9206b2a9941f8ad5f30a19076caf7f32efbeedff23fa89f7e8a72175bd8b9e0f`。
- 一次性源码快照排除四份已识别的私有文件、个人配置、数据、凭据、产物及全部原有 `node_modules`；根与工作台均无依赖目录链接。两套安装使用各自全新 npm 缓存与 `https://registry.npmjs.org`。安装前检查项目 scripts；未执行发布、打包或远程操作。

## 实际结果

以下命令在干净安装快照运行；P0 最后修改已显式同步后重跑根测试。所有下列项目退出码为 0，无跳过用例。

| 项目 | 命令/方法 | 结果 |
| --- | --- | --- |
| 根依赖冷安装 | `npm ci --registry=https://registry.npmjs.org`（独立空缓存，禁用 audit/fund 请求） | 638 个包，17 秒 |
| 工作台依赖冷安装 | 同上，工作目录 `integrations/chatgpt-workbench` | 246 个包，9 秒 |
| 类型检查 | `npm run typecheck` | 通过 |
| 根构建 | `npm run build` | 通过 |
| 工作台/演示构建 | `npm run build --prefix integrations/chatgpt-workbench` | 通过 |
| 云端构建 | `npm run build:cloud --prefix integrations/chatgpt-workbench` | 通过 |
| 根测试 | `npm test` | 376/376 |
| 工作台测试 | `npm test --prefix integrations/chatgpt-workbench` | 293/293 |
| 云端测试 | `npm run test:cloud --prefix integrations/chatgpt-workbench` | 14/14；包含新增实际根模板测试 |
| P0 模拟部署测试 | `npm run test:deploy` | 31/31；已计入根测试，不重复计总数 |
| 根模板 dry-run | 本地锁定 Wrangler：`deploy --dry-run --config wrangler.jsonc --outdir <临时目录> --no-x-provision --no-x-auto-create` | 通过；明确输出 `--dry-run: exiting now.`，**没有上传** |

Dry-run 在无凭据的干净环境执行，遥测关闭，HOME/日志/输出均为任务临时目录；检查过锁定 CLI 的 dry-run 分支会跳过 `requireAuth` 并在上传前返回。未运行登录、真实资源查询/创建或远程部署。

## 根模板测试的证据边界

`cloud/tests/root-template.test.mjs` 读取实际根配置并打包实际 `entry.mjs`，直接使用原日期、flags、KV/D1/DO 绑定、SQLite DO migrations、D1 migrations 目录和 assets 配置；只使用临时持久化、本地资源标识与随机临时密钥。外部请求被测试服务拦截。

实际通过：缺密钥时关闭受保护入口；空库未就绪；真实 SQL 迁移及重复迁移；公开健康检查；OAuth 注册、PKCE、回调不匹配、跨源/opaque Origin 拒绝、授权页面及代码重放拒绝；默认作者 `moji-owner` 的正文保存和 runtime 重启后读取；默认访问令牌 3600 秒签发；刷新轮换和撤销后刷新/访问拒绝。

提供器 `1.2.3` 的实际行为：允许立即前一枚刷新令牌重试，拒绝更旧令牌；授权码重放会撤销该 grant，测试随后用新 grant 验证存储。不能把“所有旧刷新令牌立即拒绝”写成验收标准。

原有 `2026-10-10` harness 继续独立运行，部分缺少严格 public fetch flag 的旧 harness 会提示 CIMD 未启用；这不是根模板日期被修改，新增根模板测试保留两个真实 flags。短 TTL harness 的实际到期测试不代替默认一小时的真实客户端自动续期。

## 锁文件与 CLI 兼容性

- 根锁文件未改，SHA-256：`a3e5d065868e8016d365244b0a613c0be4b9c1d1573f9e7c9f4a89f4eca6e8da`。
- 工作台锁文件 SHA-256：`231b528f20b6dc7ce0d0cf9025f4b4bdf537f84e7ab9a47a89dcbc43c9ab3dfd`。
- 对安装的 Wrangler `4.151.3` CLI 源码进行只读兼容复核：身份/auth-token JSON、D1 create/update-config、D1 remote migrations、secret stdin/list 格式、禁用自动资源供应参数均保留；D1 和 KV 清单分页覆盖完整结果。31 个执行器测试仅使用模拟进程/API，不能证明真实账号 API 已验收。
- 本地留存命令日志、逐文件 SHA-256 源码快照清单与阶段摘要；不把含私人配置或凭据的原始工作区打包公开。

## 未执行／仍需独立授权验收

真实云账号/资源、上传部署、真实 Codex 和 DSH 登录回调与可视化创作、默认一小时自动续期、真实双端冲突/更新/备份恢复、费用/容量、公开发行入口与客户端安装均未在本轮执行。没有创建测试云资源，因此没有云资源清理动作。没有提交、推送、打包或发布；本地通过不等同真实服务或发行完成。

## 后续版本准备说明

上述冷安装、锁文件指纹和“未提交”状态描述的是原始本地验证快照，不追溯改写为发布结果。随后准备的 `0.11.0-v31.3` 更新了根和工作台版本元数据（因此根锁文件指纹随版本字段改变），并加入通用 DSH 安装文档及对应回归断言。其精确提交、重建与安装包身份以本次发行记录为准；旧快照的本地通过仍不能代替真实云部署或宿主聊天验收。
