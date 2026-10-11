# npm 发布与按包名安装

整体渠道分工与发布验收顺序见[渠道维护与发布流程](release-process.md)。本文负责 npm 首次发布、可信发布配置和按包名安装验收。

npm 包、GitHub 仓库和市场显示名统一为 **`dsh-cuigengji-plugin`**。首次发布成功后，用户可在 DSH「插件 → 添加插件 → 包名或地址」中填写 `dsh-cuigengji-plugin`，固定版本填写 `dsh-cuigengji-plugin@0.4.2`。「安装源」选择默认、npm 官方源或大陆镜像，不填写 GitHub 地址。这条路线不需要 Git。旧包名安装的用户按[名称迁移指南](package-name-migration.md)更新。

首次发布需要维护者自己的 npm 账号。npm 发布与 dsh-market 收录互相独立：npm 包可用不代表市场已收录，市场收录状态仍以[收录申请](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/7064)和公开目录为准。

## 首次发布

首次 npm 发布使用已验收的 GitHub Release `.tgz`，保持两处安装包完全相同。不要将源码目录重新打成另一份相同版本的包，也不要上传小说、聊天、配置或迁移备份。

1. 在 [npm](https://www.npmjs.com/signup) 注册维护者账号，完成邮箱验证及 npm 要求的发布身份验证。公开包可以免费发布。邮箱登录验证码不等于发布用的双重验证；首次直接发布前，按 [npm 官方说明](https://docs.npmjs.com/configuring-two-factor-authentication/)在账号设置中启用 2FA，并由账号持有人使用 Windows Hello 或自己的安全密钥完成验证。未完成时保留已验收的 Release 入口，不宣称 npm 已可用。
2. 使用 `npm login --registry=https://registry.npmjs.org` 登录，再用 `npm whoami --registry=https://registry.npmjs.org` 核对发布身份。密码、验证码和登录 token 不写进仓库或聊天。
3. 切换到对应的公开版本源码，下载 GitHub Release 中的 `dsh-cuigengji-plugin-<版本>.tgz` 和 `SHA256SUMS`，用 SHA-256 核对 `.tgz`，再审计实际归档文件清单。首次发布目标为 `v0.4.2`；旧 `v0.4.1` 资产的包名不同，保留原样，不改名上传。

```powershell
gh release download v0.4.2 --repo mistnest/dsh-cuigengji-plugin --pattern dsh-cuigengji-plugin-0.4.2.tgz --pattern SHA256SUMS --dir "$env:TEMP\cuigengji-npm-0.4.2"
Get-FileHash -Algorithm SHA256 "$env:TEMP\cuigengji-npm-0.4.2\dsh-cuigengji-plugin-0.4.2.tgz"
npm pack "$env:TEMP\cuigengji-npm-0.4.2\dsh-cuigengji-plugin-0.4.2.tgz" --ignore-scripts --dry-run --json > "$env:TEMP\cuigengji-npm-0.4.2\pack-files.json"
node scripts/audit-release.mjs "$env:TEMP\cuigengji-npm-0.4.2\pack-files.json"
```

确认哈希与 `SHA256SUMS` 相同、文件审计通过，再发布已经核对过的归档：

```powershell
npm publish "$env:TEMP\cuigengji-npm-0.4.2\dsh-cuigengji-plugin-0.4.2.tgz" --access public --ignore-scripts --registry=https://registry.npmjs.org --tag latest
npm view dsh-cuigengji-plugin@0.4.2 version repository.url dist.integrity --registry=https://registry.npmjs.org
```

首次发布包含的 README 是对应 GitHub Release 的历史快照，安装说明以公开仓库当前文档为准。发布后下载 npm 的 `dist.tarball`，再次核对其 SHA-256 与 GitHub 资产相同。npm 同一版本不可替换；内容不符时停止发布，按新版本处理。

## 后续自动发布

首次包已经发布后，在 npm 的 `dsh-cuigengji-plugin` 包设置中添加 GitHub Actions trusted publisher：

- Organization or user：`mistnest`
- Repository：`dsh-cuigengji-plugin`
- Workflow filename：`publish-npm.yml`
- Environment name：留空（本工作流不声明 environment）
- Allowed actions：启用直接 `npm publish`。只允许 staging 不能完成本工作流的正式发布。

配置位置和字段以 [npm 官方可信发布说明](https://docs.npmjs.com/trusted-publishers/) 为准。此连接只给指定仓库的指定工作流发布该包的权限，不需要把长期 npm token 放进 GitHub Secrets。

确认 npm 配置完成后，在公开仓库 Settings → Secrets and variables → Actions → Variables 新建仓库变量 `NPM_TRUSTED_PUBLISHING_ENABLED=true`，启用自动发布。未启用时工作流跳过，不将首次账号验证尚未完成误报成插件安装失败。

之后照常完成测试，提交编译产物，建立与 `package.json` 版本一致的 `v<版本>` 标签，并发布带 `.tgz` 和 `SHA256SUMS` 的 GitHub Release。`.github/workflows/publish-npm.yml` 会自动：

1. 检出版本标签，验证包名、版本与公开仓库身份，运行测试、类型检查及编译产物核对。
2. 下载 GitHub 已发布成品包，核对 SHA-256，并审计归档，保证 npm 与 GitHub 使用同一份包。
3. 使用 npm trusted publishing 发布。稳定版使用 `latest`，预发布版使用 `next`。
4. 从 npm 重新下载对应版本，核对包身份与 SHA-256。已有版本只有在归档完全一致时才跳过上传；任何不一致都会失败。

旧 Release 或工作流中断可以在 GitHub Actions 的「Publish npm package」中手动运行，填写已有的 Release 标签。没有 trusted publisher 或权限不符时停止处理，不改用不明来源的凭据。

## 按包名安装验收

首次发布后，在没有 Git 的隔离 Windows profile 中运行 DSH 原生安装及迁移验收：

```powershell
node scripts/check-release-install.mjs --desktop-exe "C:\你的DSH安装目录\DeepSeek Harness.exe" --npm-package dsh-cuigengji-plugin@0.4.2 --report "C:\验收目录\npm-install.json"
```

添加 `--old-package <公开旧版.tgz>` 可验证旧版升级到 npm 包，核对正文、回收站、规划、设定、预设、绑定及正文历史保留。脚本使用临时 profile 和合成库，不操作真实小说。

另外使用真实 DSH 界面，在「包名或地址」填写 `dsh-cuigengji-plugin` 完成安装，核对实际加载版本与维护状态。大陆镜像在首次发布后可能尚未同步；此时可在安装源选择 npm 官方源，或继续使用 GitHub Release `.tgz`。不通过更改供应链保护或构建白名单解决同步问题。
