# 插件市场展示与维护

催更姬的市场条目通过 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 目录提交，由 dsh-market 使用该目录展示。提交成功不代表已经收录，需要目录维护者审核并合并；收录规则以其 [contributing.md](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) 为准。

## 条目

提交 `data/plugins/mistnest__dsh-cuigengji-plugin.yml`，仅改这一个条目，不手工修改目录仓库的 README：

```yaml
url: https://github.com/mistnest/dsh-cuigengji-plugin
name: mistnest/dsh-cuigengji-plugin
category: ui
description:
  en: A fiction-writing workbench for DSH with chapter editing, shared plot canvases, grouped character and world settings, writing presets, and scoped import/export for author-agent collaboration.
  zh: 催更姬：DSH 小说写作工作台，支持章节编辑、共享剧情画布、人物与世界设定分组、写作预设和按范围导入导出，供作者与 AI 一起讨论和推进故事。
tarball: https://github.com/mistnest/dsh-cuigengji-plugin/releases/download/v0.4.0/dsh-cuigengji-0.4.0.tgz
```

仓库保留 `dsh-plugin`、`deepseek-harness` 等主题标签，供市场与 Agent 检索。实际宿主兼容范围以 `package.json` 和 Release 为准，不扩大声明。0.4.0 尚未发布 npm 包，条目使用已经验证的 GitHub Release 成品包，不让用户从源码构建。

## 展示图与介绍

根目录 `screenshots.json` 声明正文、规划、设定的展示顺序。图片位于 `docs/screenshots/`，README 使用同一组图片，B 站演示与作者联系方式也从 README 进入。

需要更新截图时运行：

```powershell
node scripts/capture-market-screenshots.mjs
```

脚本使用正式 Workbench 和临时 Store，生成专用虚构演示作品，不读取本机 DSH profile 或任何真实小说。图片中的蓝色标题与边框是展示排版，内部工作台使用正式组件；不伪造模型回复。替换截图后检查画布文字与连线是否完整、界面版本是否与截图一致，再提交本仓库。

视频制作的源素材与流程继续放在 `D:\up视频`，插件仓库只保存这组市场展示图和链接。

## 后续发版

1. 完成 Release 成品包、校验文件、Agent 安装指南与升级验证。
2. 向目录提交本条目 `tarball` 的新版本链接；带版本文件名使用固定标签，不写 `latest/download/旧版本文件名`。
3. 更新受影响的展示图，功能未变化的图片不必重新做。
4. 完整安装与迁移步骤仍链接 `agent-installation.md` 与 `upgrade.md`。评论用于具体使用问题，更新说明由 Release 和 `docs/CHANGELOG.md` 维护。

任何时候都不把私人小说、聊天、模型密钥或迁移备份作为宣传素材提交。
