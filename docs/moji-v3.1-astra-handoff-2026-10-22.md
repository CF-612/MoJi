# 墨叽 V3.1 · Astra 接手续作交接

更新日期：2026-10-22（Asia/Shanghai）。本文记录代码与测试的实际状态，包含最后一轮尚未交付验收的工作。

> 后续进度已更新至 [预览总清单](../.data/v31-preview/V31-PROGRESS-2026-10-22.md)：前序 UI 与 B1 已获准继续，B2 完成预览待验收，B3—B7 加上游选择性吸收共 6 组待完善；正文选区创建／关联与自动引用需求已细化，桌宠由用户明确排除。下文保留最初交接时的状态；服务、功能及验收的新状态以总清单和对应阶段记录为准。

## 1. 接手先看这里

**继续在现有隔离副本里施工，先给作者看预览，作者明确同意后才实装。当前没有提交、推送、部署、覆盖正式环境或重置正式数据的授权。**

作者现在要新开对话交给 Astra；当前对话在“最新时间线拖拽与关系页”的手机检查过程中中断，随后只整理本交接，没有继续改 UI。

最重要的现场信息：

- 正式仓库：`D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex`
- **真正包含本轮成果的工作目录**：`D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex\.data\v31-preview`
- `.data/v31-preview` 被 Git 忽略；本轮成果大部分不会出现在根仓库 `git diff` 中。新建干净克隆／工作树不会自动带上这些成果。接手先直接读这个目录，保留源码和测试库。
- 根仓库分支 `codex/main`，本次核对 HEAD 为 `c5d4e723a8de9dbb1f8a647b01ea36471cf027d4`。这不是 V3.1 的新提交。
- 交接时实测 `http://127.0.0.1:4192/web` 连接被拒绝，4192 无监听。**预览服务当前已停止，需要重启**。浏览器可能仍显示缓存页面，不代表服务仍在运行。
- 最新响应式 CSS 的“宽屏隐藏手机双页切换条”补丁只写入了源码，补丁后尚未重启和复查。
- `P1-PREVIEW-REPORT.md`、`MODEL-REVIEW.md` 是较早阶段记录，部分“关系演变未接入”的描述已过时；最新进度以本文和现场源码为准。
- 仓库已有其他未提交 README、交接／发布文档、未跟踪目录。保留这些既有改动，不混入本轮正式提交。

建议接手顺序：读本文与 V3.1 规格 → 启动现有副本 → 验证最后一轮拖拽和手机关系页 → 做必要修正 → 给作者页面／交互预览。完成这个验收点后再继续剩余功能，避免直接宣布整轮完成。

## 2. 需求依据与固定边界

完整方案：

`D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex\docs\moji-planning-v3.1-integrated-spec-2026-10-22.md`

作者后续澄清优先于旧设计：

1. 正文目录是正式卷、具体章节的唯一创建来源。目录自动纳入大纲；规划页只能创建剧情卡。
2. 总纲、卷纲、时期、篇章是剧情卡的用途，不是另造正式卷章。大纲只显示一棵统一包含树。
3. 卷、章、剧情卡共用创作包含关系。卡可以挂到卷上、包括章节，也可以被章节包括。一个节点只出现一次，主要父级唯一，禁止循环。
4. 正式章节所属卷及目录排序由正文目录决定。跨卷大纲包含不自动改变正式归属；章节常显“正文所属：某卷”，移动后明确提示。
5. 大纲包含、画布上下包含线是一套关系；左右线是剧情先后；时间位置与跨度另存。画布实例按页存坐标，同一对象多页展示不复制内容。
6. 卷 Summary 是整卷描述；卷纲用途剧情卡负责更细的组织。独立使用，不强制同时创建，不自动复制或拼接。
7. 本次不开发旧规划／旧事件迁移、合并、旧 ID 映射和长期兼容层。允许采用简洁的新模型，但目前只在隔离库测试，尚未获准清正式库。
8. 保留新系统自己的稳定 ID、版本检查、保存、编辑、删除、关联、历史和备份恢复。
9. 模块开关集中到设置“功能模块”。正文编号归“正文与目录”；设置分类问题已提前处理。
10. 完整第三方自定义模块编写、安装、权限、管理和分发平台属于后续目标，本轮只补内置模块及伏笔等功能需要的接口。

UI 偏好：

- 顶部工作台更多仍为**横向三个点**，给宿主右上角退出 X 留空间。内部更多可用竖三点，内部弹窗用左侧返回。
- 这是聊天侧边栏内的工作台，不加常驻工具导航侧栏。**作者最新明确允许宽屏时间线右侧放人物关系内容**，这与常驻导航侧栏不同。
- 正文工具靠右：自动排版、无框撤销／重做、竖三点；目录使用图标。
- 目录行通过手机长按、电脑右键打开操作菜单，避免多个小按钮挤在行内；选中章节的三角序号标记必须保留。
- 卡片精简只改变展示，标题、摘要、完整内容、人物等信息要保存在同一对象中，不能为了布局丢字段。
- 时间线是横向坐标轴与轨道区间条，不做 Excel 式大表格。主轴不铺完整说明。
- 时间线缩放只用**电脑普通滚轮／手机双指**；不放缩放滑条、不要求 Ctrl。关系页的查看时间条是时间导航，不是缩放控件。

## 3. 最新这一轮做到哪里

### 已写入隔离源码，部分完成浏览器检查

作者最后反馈：跨轨拖拽没有卡片抬起跟手感；待安排拖入闪动；页脚关系演变看不到；希望宽屏侧边显示，手机另想清晰方案。

当前实现：

- 时间线卡片和待安排卡统一使用 Pointer Events，移除了待安排区的原生 HTML draggable。
- 拖动超过阈值显示 `createPortal` 固定定位浮层，带阴影、轻微抬起／倾斜；原卡保留淡影。
- 目标轨道高亮并显示虚线落点；源卡行布局和轨道高度不随临时拖拽预览重排；松手才保存。
- 未放入有效轨道则取消；第二根手指接管缩放会清除拖拽预览，不提交暂存坐标。
- 待安排卡在保存前保持原位，保存成功后才从待安排区消失。
- 支持纯竖向跨轨、两端调整跨度、空白区域平移、普通滚轮缩放；缩放与拖动互相避免抢占。
- 宽屏（工作区容器宽度至少 1040px）：时间线＋待安排在左，310px 人物关系面板在右。
- 窄屏／手机：“情节时间线／人物关系演变”两个子页，共享同一 `cursor`。关系页有紧凑时间导航，圆点只代表关键关系变化。
- 关系面板读取真实 `edge.list` 基础关系；统一剧情卡 `points` 中可添加**计划关系变化**。时间指针移动后，应用此前最近的计划变化。能切换基础关系／规划预览。
- 这只是基础关系＋计划快照，**不是完整的正文已确认关系历史系统**。

实际浏览器已完成：

1. 新建隔离卡“预览测试：站台上的抉择”，从待安排区拖到“人物支线”，服务器保存成功且卡片只落位一次。
2. 再纯竖向拖回主线，起止时间保持约 1.421875～2.171875。
3. 给该卡添加“海因 ↔ 林晚：试探中的合作”计划点，位置为第二章约 42%。
4. 关系时间条移到起点显示“陌生”，移到后面显示“试探中的合作”；主时间线指针与关系页同步。
5. 390px 模拟手机切换到关系页，关系区域约 y=186.6～728；内部内容滚动区高度约 274px，底部位于模拟回复栏起点 736px 之上。

尚未完成：

- 作者对新排版和拖拽观感的验收。
- 连续拖动过程的真实视觉验收（浏览器拖动完成后的保存已验证，处理函数浮层检查已通过，但不能据此宣称闪动已在所有设备彻底消失）。
- 最新宽屏隐藏手机切换条 CSS 的重启后验证。
- 手机真实多指／键盘／横屏／宿主环境验收。
- 最新宽屏和手机关系页截图尚未保存到 `evidence`；那里现存截图多数为上一阶段，不能当作当前新排版证据。

## 4. 更早阶段已完成的隔离工作

| 范围 | 实际状态 |
|---|---|
| 目录三角 | 已恢复带序号的选中三角；第一／第二章切换唯一标记，模拟手机显示正常 |
| 浅色文字 | 已复现旧 hover 白字覆盖问题；选中／悬停／键盘聚焦改跟主题正文色，字数用 muted 色 |
| 大纲多选 | 正常浏览无复选框；进入多选出现，退出清空 |
| 设置 | 顶部分为界面与视图、正文与目录、功能模块、其他；修了桌面旧 grid 冲突与面板固定 300px 导致的右侧空白 |
| 弹窗 | 公共 Modal 左侧返回、紧凑表单、滚动内容、预留宿主底部区域 |
| 画布触控 | 实际 useGraph 处理函数区分单指拖卡、空白平移、双指平移缩放；缩放后坐标测试通过 |
| 统一模型 | cards／placements／page instances／precedence／tracks／独立双时间位置已接入三视图 |
| 包含树 | 自动读取正式卷章 ID，保留人工父级，跨卷唯一显示、不改正文归属；自包含／循环拒绝；删除卡上提子项 |
| 画布实例 | 内容与实例坐标分离；单页移除不删源对象；上下包含线同步大纲，左右先后另存 |
| 卷 Summary | 隔离 core 源对象新增字段；正文卷菜单与大纲编辑同一字段 |
| 人物选择器 | 搜索、分类、已选标签、出场／提及区分、卡面头像 |
| 新结构可靠性 | 工作区／卡片／实例版本检查，最近 30 次规划历史、撤销、独立规划备份恢复 |

全量 V3.1 尚未完成，以上不是正式版交付。

## 5. 代码入口与数据结构

下表路径均相对隔离目录 `.data\v31-preview`。**正式根目录还有另一份 `src/client`，本轮没有同步改它。**

| 路径 | 用途 |
|---|---|
| `integrations/chatgpt-workbench/scripts/preview-dev.mjs` | localhost 预览服务，启动时 esbuild；拦截 `story.*` 交本地适配器 |
| `integrations/chatgpt-workbench/server/story-preview.mjs` | 本地新模型 JSON、串行写入、工作区 CAS、历史／备份，未接入线上 Store |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-workspace.mjs` | 统一剧情卡、目录纳入、包含、实例、时间、数据校验 |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/domain/story-relations.mjs` | 计划点位置解析与只读关系快照 |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/planning/index.jsx` | 仅导出 UnifiedPlanning，已移除入口中的 LegacyPlanning 实现 |
| 同目录 `UnifiedPlanning.jsx` | 三视图、卡编辑器、包含移动、资料选择、备份菜单；传入 graph.list／edge.list |
| 同目录 `UnifiedTimeline.jsx` | 最新时间线、根指针捕获、浮层／占位、轨道、待安排、共享指针 |
| 同目录 `TimelineRelations.jsx` | 响应式关系面板、查看时间条、计划变化表单 |
| 同目录 `timeline-interaction-style.mjs` | 最新布局、容器查询、浮层、轨道和关系面板样式 |
| 同目录 `unified-story-style.mjs` | 上一阶段统一视图样式，部分时间线样式由新文件覆盖 |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/client/preview-polish.mjs` | 三角、浅色选中文字、公共 Modal 和设置修补 |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/client/shared/graph.tsx` | 画布触控及 horizontal／vertical 连线端点 |
| `integrations/chatgpt-workbench/vendor/cuigengji/src/client/features/chapters/DirectoryRow.tsx` | 选中三角、长按／右键菜单 |
| 同目录 `index.jsx` | 正文目录卷 Summary 编辑入口 |
| `src/application/store.js` | 隔离服务所用核心 Store，新增卷 Summary 保存 |

新规划状态的核心字段：

```text
format: moji-story-v1
revision
cards[id]: title, purpose, summary, content, status, cast, scope,
           time.narration, time.story, points, foreshadowRefs, evidence
placements["volume:id" | "chapter:id" | "card:id"]: parent, order, manual
pages[]: id, name, generated?, instances[ref]: x, y, revision
precedence[]: from, to
tracks[]: id, name, color
```

采用状态沿用核对到的 `idea / selected / written / dropped`；关联章节／移动卡片／改采用进度不自动创建正文事实。

叙述安排使用稳定起止章节 ID＋章节内 offset；故事位置是独立数值坐标，当前还不是完善的日期文本系统。

最新计划关系点示例（保存在卡片 points 内）：

```json
{
  "id": "稳定节点ID",
  "order": 0,
  "location": {"narration": {"chapterId": "实际章节ID", "offset": 0.42}},
  "relationships": [{"from": "人物ID", "to": "另一人物ID", "name": "试探中的合作", "reason": "原因"}]
}
```

故事视图使用 `location.story` 数值。没有当前视图位置的点不会被推断成已发生变化。当前所有此类变化明确按 planned 预览处理；切换查看时间不写入关系。

## 6. 本地启动、测试库和检查命令

PowerShell，在当前机器的现有目录运行：

```powershell
Set-Location -LiteralPath 'D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex\.data\v31-preview'
$env:MOJI_PREVIEW_PORT='4192'
$env:MOJI_PREVIEW_DATA=Join-Path (Get-Location) 'preview-data'
& '..\redistribution\node.exe' integrations/chatgpt-workbench/scripts/preview-dev.mjs
```

本机 Node 24 在 `.data\redistribution\node.exe`，不必新增依赖。预览 node_modules 是到现有依赖的联接。

访问：

- 桌面：`http://127.0.0.1:4192/web`
- 模拟聊天宿主：`http://127.0.0.1:4192/live`
- 模拟手机：`http://127.0.0.1:4192/mobile`
- 模拟横屏：`http://127.0.0.1:4192/mobile?landscape=1`

仅绑定 127.0.0.1。手机模拟页是 iframe，不是真机联网入口。该脚本启动时打包一次，改源码后需重启，再刷新页面。若默认沙箱进程启动后浏览器连接不到，而程序打印监听成功，先核对本机端口权限；本会话用正常审批的提升权限启动 localhost 服务，不改网络／浏览器安全配置。

隔离新结构数据：

`D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex\.data\v31-preview\preview-data\story-v31\389d7dd9-694a-4adb-82f9-56772e92854b.json`

交接时读到 revision=30、5 张剧情卡、2 条轨道（主线／人物支线）、1 个画布页。新增测试卡上有一个计划关系点；均为隔离演示资料。原测试库旧计划和旧事件没有清空，也没有做合并迁移。当前待安排可能为 0，需要检查拖入时可创建一张有摘要与完整内容的新测试卡。

检查命令（在隔离目录）：

```powershell
# 最新时间线：构建并执行真实组件处理函数的测试环境
& '..\redistribution\node.exe' checks-timeline-lift.mjs
& '..\redistribution\node.exe' checks/timeline-lift.mjs
# 关系快照：实际领域函数
& '..\redistribution\node.exe' checks-relations.mjs
# 模型／Store 场景，另建 checks/p1-store-* 测试目录
& '..\redistribution\node.exe' checks-story.mjs
# 画布触控处理函数
& '..\redistribution\node.exe' checks-touch-build.mjs
& '..\redistribution\node.exe' checks/touch-handlers.cjs
& '..\redistribution\node.exe' node_modules/typescript/bin/tsc --noEmit
```

本会话已通过：最新拖拽处理函数 7 组、关系快照领域检查、模型／Store 13 组、画布触控回归、根 TypeScript 检查。预览 esbuild 打包成功，浏览器完成了前述端到端操作。

测试边界：处理函数测试使用 React／DOM 测试环境，不能代替真机触控与连续帧观感。根 tsc include 主要覆盖根 `src/**/*.ts(x)`，不覆盖所有 vendor JS；新增 JS 仍需实际打包与 UI 检查。

`checks-timeline-gestures.mjs` 是旧版测试；最新组件把移动／松手处理移到根容器，旧入口尚未更新，**不要拿它的旧通过记录证明新实现**。使用 `checks-timeline-lift.mjs`，之后可整理旧测试入口。`checks-build.mjs` 只验证旧 Outline 组件的多选，不足以证明当前 UnifiedPlanning 的大纲。

## 7. 接下来优先做什么

### A. 先完成最后一轮 UI 与拖拽验收

- 重启当前副本，验证宽屏只保留时间线＋右侧关系面板；检查 1040px 容器断点，不用整机宽度误判聊天窄侧栏。
- 检查 390px 手机关系页：目前有模式工具栏、双页切换、关系标题、当前点、时间条、预览切换，顶部层数仍偏多。可精简关系页不适用的“定位／轨道／缩放”工具，给图与历程更多空间；先做预览供作者判断。
- 真实拖动过程检查：源卡淡影、浮层颜色与阴影、跟手延迟、跨轨落点、不闪动、松手反馈；浅色／深色都看。
- 待安排拖入、跨轨、缩放后拖动、双指中途接管、取消／拖出边界、保存失败都要检查。
- 当前 `up()` 使用最后一次 move 得出的 `g.valid`；建议补查“最后有效落点后在外部松手但未触发末次 move”的边界，避免把取消当提交。
- 卡内关系点是稳定的绝对章节／故事位置。当前 `schedule()` 只修改卡片 time，关系点位置不会自动随整张卡平移。根据规格明确这一规则及反馈，避免作者以为关系节点已跟随挪动。
- 手机真机、横屏、键盘、宿主顶部 X／底部回复栏仍需验收。模拟通过不能写成真机通过。
- 保存新排版截图，给作者看本阶段预览，再继续后续大项。

### B. 按 V3.1 继续缺失功能

1. 伏笔轻量本体只需名称／描述；埋设、推进、回收作为关联剧情卡的节点。计划与正文确认分开，部分回收不自动完成。
2. 完善关系变化编辑、删除、排序、重新定位、卡内点管理，以及**正文已确认事实／证据校验**。目前只有添加计划点与快照，没有完整历史管理。
3. 正文选区创建角色、世界资料、剧情卡、伏笔或关联已有对象；携带真实保存版本。未保存文本只能先保存或作为待确认引用。
4. 人物首次出场、正式出场与提及区分、相关证据失效检查。
5. 正文旧“本章事件／伏笔”材料区、资料关系页与新模型联动。不要恢复双实体长期并行。
6. 双时间域、日期文本、内部关键节点、跨度边界及缩放时的信息密度继续完善。
7. 模块开关关闭保留数据、重开恢复；补本轮内置模块更新／关联接口。完整自定义模块平台仍留后续。

### C. 正式实装前的独立门槛

- 当前 `story.*` 仅接在本地 preview-dev，存独立 JSON，**不能把这个预览直接打包上线**。
- 接入正式 Store 事务、授权动作表、远程 AI 工具、同步和整书导入导出／备份。现有整书导出尚不包含预览独立 JSON；独立规划备份不能冒充完整作品备份。
- 若正式目标包括 DSH 原生端，还需核对根 `src/client` 与集成 vendor 前端的适配差异；本轮只改了共享集成前端及隔离服务核心。
- 保留 CAS、正常历史和恢复；检查生成大纲页重建实例时的 revision 行为、并发拖动、源卷章删改后的关联处理。
- 不做旧规划／旧事件兼容工程；如要重置指定正式测试实例，先列清目标并取得作者明确同意，保留账号、授权与其他应用配置。
- 作者最终确认后，才安排目标明确的正式修改、测试、提交、推送、包更新和部署。本交接不授权上述动作。

## 8. 证据与现状边界

上一阶段截图目录：

`D:\方的世界\黑魔王心理治疗档案（新版）\tools\cuigengji-codex\.data\v31-preview\evidence`

可参考 `chapter-light-text-fixed.png`、`chapter-triangle-desktop.png`、`chapter-triangle-mobile.png`、`settings-final.png`；`settings-fixed.png` 是较早未完成修复的截图。`p1-timeline.png`／`p1-mobile-timeline.png`／`timeline-wheel-drag.png` 都早于最新跟手浮层与关系新排版。

`source-baseline.json` 记录 505 个正式源文件基线；此前检查 `isolation-check.json` 为 `formalFilesChanged: []`。本次交接只新增此文档；没有提交、推送、部署、安装或操作正式数据。

本次没有重新检查云端 OAuth 或插件安装状态；若后续任务需要处理，先现场核对，旧聊天的连接／发布记录不能当成现在的事实。作者目前的重点是软件本体 UI 和交互。

## 可直接发给新对话的开场

> 请先阅读本交接文档和其中的 V3.1 规格。在现有 `.data/v31-preview` 继续，不另从干净仓库重做。先启动预览、检查最新时间线跟手拖拽／待安排拖入／宽屏关系侧栏／手机关系子页，把未完成验收的地方修到可审阅。之后按清单分阶段推进；每阶段给我看页面和交互，我同意后再继续，正式实装和发布另等我明确批准。
