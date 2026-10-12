# 催更姬 · ChatGPT/Codex 小说工作台

基于 mistnest 的 MIT 催更姬，保留聊天侧栏协作、正文、设定与规划。

结构资料与主题见 [结构资料说明](STRUCTURED_WRITING.md)，事件与阶段关系见 [时间线说明](STORY_EVOLUTION.md)。

图表联动、默认资料字段与切页改进见 [图表工作台说明](CONNECTED_CHARTS.md)。

日常写作统一使用一个远程「催更姬 · 小说工作台」插件，电脑与手机共用云端作品。旧本地演示入口与重复的远程连接应停用，资料备份后保留。入口合并及恢复边界见 [统一入口说明](UNIFIED_ENTRY.md)。

## 本地运行

需要 Node.js 24。执行 `npm ci`、`npm run build`、`npm run build:cloud`、`npm test`。`npm start` 打开仅监听本机的演示服务，数据保存在忽略的 `.data/`。

## 私有云端

复制 `cloud/wrangler.jsonc` 为忽略的 `cloud/wrangler.local.jsonc`，填写自己的 Workers、D1、Auth0 issuer 和 MCP resource。通过 Wrangler secret 设置 `OWNER_SUB`；不要写入源码。先用 `wrangler d1 migrations apply` 应用 `cloud/migrations/` 下全部迁移，再构建并手动部署。绑定只允许指定作者，保留 OAuth 与读写 scope 校验。

批量导入、恢复预览、自动快照及兼容回退见 [导入与恢复说明](IMPORT_RECOVERY.md)。

源码源于仓库根目录 `src/`；适配界面位于 `vendor/cuigengji/`。个人作品、租户配置、日志、构建与备份不在 Git 中。
