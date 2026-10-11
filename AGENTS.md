# 催更姬项目维护

源码在 `src/`；`runtime/`、`lib/client.js` 是提交到 Git 的构建产物，修改源码后运行 `npm run build`。真实小说和用户 DSH profile 不属于公开源码或测试样例。

用户要求“发布更新”“发新版”时，先读 [docs/release-process.md](docs/release-process.md)，使用 `npm run release -- plan/prepare/publish/verify/status`。需要首次 npm 授权时按 [docs/npm-publishing.md](docs/npm-publishing.md)处理。普通用户安装、更新和数据迁移用 `skills/cuigengji-maintenance/SKILL.md`，不走维护者发布流程。

发布流程保存进度在被 Git 忽略的 `releases/v<版本>/`。GitHub 与 npm 使用同一份验收归档，不能覆盖已公开版本。账号密码、OTP、恢复码和 token 不进入源码、Skill 或发布报告。

本机正式 DSH/profile 与小说工作库不用于发布测试。`scripts/check-release-install.mjs` 使用临时 profile、合成旧库和桌面自带运行时；不要为发布关闭或替换用户的正式 DSH，也不要启动模型连通性测试。用户自行试用界面，发布验收使用脚本。
