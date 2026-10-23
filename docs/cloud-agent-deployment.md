# 个人云端部署：Agent 执行边界与本地验收

本文独立于 [DSH 原生插件安装与更新](agent-installation.md)。云端部署入口见 [README](../README.md#部署自己的个人云端实例)；下文保留云端执行和本地测试说明，不是 DSH 插件安装的前置步骤。

源码本地验收所需的两套依赖，在仓库根目录按各自锁文件安装：

```sh
npm ci
npm ci --prefix integrations/chatgpt-workbench
```

## 个人云端的 AI 执行边界

本机插件安装与个人云端部署是不同任务，本机库和云端库不自动同步。云端操作统一按 [README 的显式新建/更新流程](../README.md#部署自己的个人云端实例)；不要直接部署根 `wrangler.jsonc` 模板，也不要通过自动资源供应复用同名库。

- 本地代码检查和 `npm run test:deploy` 仅使用注入的模拟执行器，不登录或访问 Cloudflare。
- 创建/更新真实资源前确认账号 ID、资源范围、费用边界；登录和隐藏密钥输入由用户本人完成，不在聊天中索要密钥或令牌。
- `deploy:new` 派生独立名称；`deploy:update` 必须使用原 `.moji-cloud/` 清单并核对绑定。不迁移作者身份、不自动轮换密钥、不创建空替代库。
- 失败记录阶段且非零退出。只按提示 `--resume`；结果不明的创建须先查证所有权，不能仅凭同名接管或重新创建。脚本无自动删除或数据库回滚。
- 分开报告：资源准备、迁移、上传、密钥、健康检查、真实 Codex/DSH 授权及可视化创作验收。健康检查、构建或 MCP 初始化不能代替真实宿主验收。
- 当前执行器要求已经存在的 workers.dev 子域名；首次账号级注册、旧私有部署清单导入及结果不明的人工资源认领尚不是自动化向导功能。

### 云端源码的本地验收（不创建云资源）

使用两份锁文件执行上文两次 `npm ci`，不要单独覆盖 Miniflare/workerd 或降低根 `compatibility_date`。工作台精确锁定 Wrangler `4.151.3`，配套 Miniflare `5.20261019.1-beta` / workerd `1.20261019.1`。构建后可运行：

```sh
npm run typecheck
npm run build
npm run build --prefix integrations/chatgpt-workbench
npm run build:cloud --prefix integrations/chatgpt-workbench
npm test
npm test --prefix integrations/chatgpt-workbench
npm run test:cloud --prefix integrations/chatgpt-workbench
npm run test:deploy
```

云端测试包含直接读取根 `wrangler.jsonc` 的 `root-template.test.mjs`，保留实际入口、日期、flags、绑定与迁移，用临时本地存储和随机测试密钥验证认证及重启读取；不会部署。现有缩短 TTL 的测试仍是独立 harness，不代替默认一小时续期或真实宿主验收。已验证环境与边界见[本地云端验证记录](cloud-local-validation-2026-10-23.md)。
