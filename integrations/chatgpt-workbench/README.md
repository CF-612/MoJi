# Moji · ChatGPT/Codex 小说工作台

基于 mistnest 的 MIT 催更姬，保留聊天侧栏协作、正文、设定与规划。

内置模块显示设置、仪表盘圆环修复与白板合并保存见 [模块骨架说明](MODULE_FOUNDATION.md)。

结构资料与主题见 [结构资料说明](STRUCTURED_WRITING.md)，事件与阶段关系见 [时间线说明](STORY_EVOLUTION.md)。

图表联动、默认资料字段与切页改进见 [图表工作台说明](CONNECTED_CHARTS.md)。

日常写作统一使用一个远程「Moji · 小说工作台」插件，电脑与手机共用云端作品。旧本地演示入口与重复的远程连接应停用，资料备份后保留。入口合并及恢复边界见 [统一入口说明](UNIFIED_ENTRY.md)。

连续事件条、统一伏笔筛选和可编辑卷章编号见 [连续时间线说明](TIMELINE_TRACKS.md)。

直接拖动事件、首尾调整和位置草稿见 [时间线编辑说明](TIMELINE_EDITING.md)。

## 本地运行

需要 Node.js 24。执行 `npm ci`、`npm run build`、`npm run build:cloud`、`npm test`。`npm start` 打开仅监听本机的演示服务，数据保存在忽略的 `.data/`。

## 私有云端

当前个人部署入口以[根目录 README](../../README.md#部署自己的个人云端实例)为准，根模板使用内置 OAuth 与 `MOJI_OWNER_KEY`，无需 Auth0。历史私有实例的 `cloud/wrangler.local.jsonc` / Auth0 / `OWNER_SUB` 配置仍是旧部署的兼容边界，不直接覆盖或照搬；部署需要实例所有者授权。

批量导入、恢复预览、自动快照及兼容回退见 [导入与恢复说明](IMPORT_RECOVERY.md)。

源码源于仓库根目录 `src/`；适配界面位于 `vendor/cuigengji/`。该内部目录保留上游来源和现有导入路径，不是产品展示名称。个人作品、租户配置、日志、构建与备份不在 Git 中。
