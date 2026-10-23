# 生成大纲紧凑排布：阶段验收（2026-10-23）

## 用户问题与根因

已查看用户提供的 `libfile_c7ade0e46ac8819199c4d99d4cd50f20` 实际截图：多个卷的章节全部铺在同一横排，适应视图后几乎成为一条线。原 `generatedOutline` 调用的 `treeLayout` 将每个子树的横向宽度相加，因此章节越多，画布越宽。

## 本次修改

- 新增纯布局函数 `packOutline`，通过 `compactOutlineLayout` 供生成大纲调用；运行时与工作台 vendor 副本保持一致。
- 卷及其完整包含子树作为独立纵向区段排列，卷标题水平居中对齐。
- 章与剧情子树按照原顺序分行；按完整子树包围盒留白，不让卡片重叠。
- 在一组确定性的候选宽度中选择较接近正方形的结果，不缩小卡片、不改变包含关系、不为了正方形强行拆散树。
- 未分卷章节和独立剧情卡也采用分行排布，避免变成另一条长线。
- 保留旧 `treeLayout`，避免改变其他调用方；现有自然曲线路由未修改。

深层单链、很多空卷等结构仍以清晰层级和卷的纵向顺序为先；并非承诺任意树都能成为完美正方形。

## 数据与手工位置保护

本次只改变显式生成操作的布局投影。原有生成范围所有权、手工位置保护和明确选择重排机制不变；普通编辑、增加先后连线或切换模块不会自动重排手工画布。包含关系、章节所属卷、源对象、剧情内容和先后关系均不因排布修改。

## 已通过验证

命令：

```sh
node --test tests/compact-outline-layout.test.js \
  integrations/chatgpt-workbench/tests/story-outline-generation.test.mjs \
  integrations/chatgpt-workbench/tests/story-outline-fanout.test.mjs
```

结果：**38 / 38 通过**。覆盖：

- 1 卷 80 章、4 卷 160 章、12 卷 240 章、80 章未分卷；宽高长短边比均小于 2.5。
- 多层剧情包含与最大 800 × 660 的子卡片尺寸；卡片无交叠。
- 输入枚举顺序变化时，输出仍确定；跨时期或循环先后连线不影响包含布局。
- 手工位置、源数据、包含关系保护；显式生成范围及其他页面隔离。
- 空大纲、循环包含报错；已有持久化服务的生成撤销/重做、备份复制回归。
- 运行时和 vendor 新 helper 文件逐字一致；`git diff --check` 通过。

### 合成案例尺寸对比

4 卷、每卷 40 章，采用实际 248 × 208 卡片尺寸：

| 布局 | 宽 × 高 | 长短边比 |
| --- | --- | --- |
| 原横向展开 | 49,856 × 516 | 96.62 |
| 新紧凑生成 | 5,864 × 4,828 | 1.21 |

## GUI 验证状态

已准备 `artifacts/compact-outline/index.html`：使用实际新布局坐标及现有自然曲线路由的 4 卷 / 160 章合成可视化。已在独立云端 CUA 标签 44 完成合成案例目视验收：4 个卷区段竖排、章卡分行、卡片不交叠、整体接近方形，自然曲线保留。截图：`artifacts/compact-outline/cua-compact-outline.png`。首次 data URL 因浏览器仅支持 HTTP/HTTPS 而失败，随后经主任务许可使用独立云端 Terminal 新标签启动只服务合成 fixture 的 localhost:43145 HTTP 服务；未触及用户电脑或其他运行中的应用终端。此项验证覆盖合成坐标/曲线渲染，不代替完整应用里的生成按钮、缩放和触摸交互端到端验收。

窗口/时间轴工作者已完成 `UnifiedPlanning.jsx` 接线并报告构建通过；本工作者也实际核对了 import 及生成页面“整理大纲”fallback，均已使用 `compactOutlineLayout`。本工作者没有并发修改该 UI 文件。

## 修改范围与发布状态

- `src/domain/compact-outline-layout.mjs`
- `src/domain/story-workspace.mjs`
- 对应 `integrations/chatgpt-workbench/vendor/cuigengji/src/domain/` 两份文件
- `tests/compact-outline-layout.test.js`

本阶段没有提交、推送、部署或操作用户电脑。上述通过项是聚焦验收，不代表整批修改的全量测试或 GUI 验收已经完成。
