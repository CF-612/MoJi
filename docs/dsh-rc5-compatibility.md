# DSH 0.2.1-rc.5 兼容验证

日期：2026-10-31。源码基线：MoJi 0.12.0，`a2b229a09bec55dc69321f5ad3f1bdf447dc2944`。

## 范围

仅在 `package.json` 和锁文件根元数据的 `engines.dsh` 增加精确值 `0.2.1-rc.5`，更新元数据回归测试与用户指南。保留此前允许值，不放行未测试的 rc4、未来版本或 alpha。未改业务、UI、存储格式、数据迁移、权限、个人云或用户 profile。

官方 npm `latest`／`next` 核对为 rc5；该版本在 [官方发布页](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.5) 仍标记 Pre-release，不称为稳定正式版。

官方 rc5 `@deepseek-ai/dsh-app-boot` 的 `evaluatePluginCompatibility` 明确优先检查插件自己的 `engines.dsh`（`includePrerelease:true`），有该字段时不以 DSH peer 范围决定宿主兼容。因此没有为消除提示而无差别升级 MoJi 的构建依赖、修改版本豁免或更改宿主代码。既有开发依赖仍是原来的构建基线，**不表示用旧宿主代替了 rc5 验证**。

## 真实加载器检查

使用 npm 官方包组成隔离的最小 rc5 宿主服务集合，不安装完整桌面应用：

- `@deepseek-ai/dsh@0.2.1-rc.5` 官方 tarball 内的 `lib/profile-boot.js` / `runProfile`；
- app-boot、home-paths、launch-environment、system-prompt、tools、skill、credentials-local、client-connection、http-proxy、cmdline 均为 `0.2.1-rc.5` 官方包；其声明的依赖由 npm 安装；
- 官方 Cordis／loader／group／schemastery；真实 `runProfile` 加载真实服务，不伪造 ctx；
- 从本次源码 typecheck、build、pack 得到 MoJi tarball，解包到隔离宿主；非宿主 SDK／zod 复用现有相同依赖；
- 独立 HOME、DSH_HOME、profile 和合成空作品库，无网络监听器、无用户 profile、环境文件或凭据。安装锚点为最小服务集合清单，不是包含未安装完整宿主组件的 CLI 清单。

对照结果：

1. **负对照**：把隔离包的兼容范围恢复为旧值，官方 `loadProfileDirectory` 拒绝 bundle，报 `incompatible with dsh 0.2.1-rc.5`，没有授予任何豁免。
2. **正对照**：只追加 rc5，再由官方 `runProfile` 启动；`moji` 服务激活，维护状态 `ready`、插件版本 `0.12.0`。
3. 6 工具全部存在：`moji_context`、`moji_maintenance`、`moji_memory`、`moji_plan`、`moji_project`、`moji_structure`。
4. 6 Skills 全部存在：maintenance、memory、plan、project、revise、write（均为 `moji-` 前缀）。正常关闭宿主服务。

针对性测试：`node --test tests/dsh-engine-range.test.js tests/dsh-runtime.test.js tests/dsh-request-header.test.js tests/dsh-connection-guidance.test.js tests/dsh-cloud-client.test.js tests/dsh-github-update.test.js tests/host-tools.test.js`：52/52 通过；完整根测试 `node --test tests/*.test.js` 为 662/662 通过。`npm run typecheck`、`npm run build` 通过。

这证明 Linux 上 rc5 官方最小服务加载和 MoJi 注册可用；**不等于 Windows 桌面 UI、作者真实 profile、所有第三方插件或完整官方桌面应用已验收**。打包成功不等于发布或部署；旧 0.12.0 发行资产不会因修改源码而自动变化。未来版本需重跑兼容与实际宿主检查后逐个放行。

用户操作见 [DSH 更新报错自助指南](dsh-update-troubleshooting.md)。
