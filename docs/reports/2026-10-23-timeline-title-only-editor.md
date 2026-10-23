# 时间线标题卡片与原位编辑（二次反馈修订）

## 要求与边界
2026-10-23 用户再次明确：时间线卡片只显示标题，不常驻详情、头像或编辑按钮；电脑空间够时右侧编辑，手机/窄屏进入二级页；右上工具不堆砌；上下仅为空间位置，不强制解释为主线/暗线。状态色与伏笔色由同阶段另一工作项恢复。

本阶段只在云端源码/合成测试作品操作，**未提交、未推送、未部署**。菜单预览认可不等于整轮发布许可。

## 改动与数据流
- 故事轴与叙述时间线中的剧情卡均只保留标题。日期/采用进度/伏笔关联保留在工具提示或可访问标签，内部数据没有删除。
- 正常点击、右键、Enter 打开原有 CardEditor；拖动状态由既有 dragged/pointerDragged 防误触，调整跨度和内部关键点按钮保留。待安排卡片不再常驻摘要与“详情/内容”编辑按钮，点卡片本身编辑；“安排/放在当前点”功能保留。
- CardEditor 没有复制一套保存逻辑：仍调用 UnifiedPlanning.editSave、原 card.update.expectedRevision 和冲突处理。仅用 TimelineCardEditorShell 替换弹窗外壳。
- 实际内容容器≥900px：360px编辑侧栏替代关系栏；小于900px：原位二级内容页、左上返回。关系图保持挂载但不可见，因此关闭编辑恢复其状态与滚动位置，不挤出第三列。
- 未保存确认保留，并覆盖切换其他卡片、规划视图和新建卡片。编辑中禁用时间轴模式切换和卡片拖动，避免同时操作旧编辑副本。Escape/返回走同一放弃确认，恢复焦点。
- 原完整编辑器增加“故事时间位置”折叠项，复用 PositionFields，日期与轨道跟随当前表单一次保存，不另发隐式更新；服务端仍校验跨度/轨道。这样移除常驻编辑按钮不会使精确日期编辑失去入口。
- 故事卡高度42px，行距64px，标题密集但不展示摘要。对应投影/拖放使用同一行距常量。上下空白区域可投放至同侧最近现有轨道，不创造主线/暗线语义，不修改已有轨道命名或强制重排数据。
- 故事工具区收为“新建”和更多；新建内包含新卡、引用已有卡、时间标记；更多提供轨道、坐标设置、备份历史。使用现有图标语言，不复制工具。
- 与状态色工作项接线：按真实 writing.foreshadow.list.plotNodes 生成关联集合，各时间线、待安排、画布与大纲共用属性。查询失败明确显示“伏笔关联标记暂未加载”及重试，不把读取失败暗示成没有关联。

## 文件
- 新：`TimelineCardEditorShell.jsx`、`timeline-editor-style.mjs`、`tests/timeline-card-editor.test.mjs`（工作台目录）。
- 改：`UnifiedPlanning.jsx`（与状态色项分别修改局部）、`StoryTimeAxis.jsx`、`UnifiedTimeline.jsx`、`story-axis-style.mjs`、`timeline-interaction-style.mjs`、`story-axis-view.mjs`。
- 根测试 `tests/story-axis-view.test.js` 更新紧凑行距契约并新增同侧空白投放用例。

## 验证
已通过：
- `npm run typecheck`
- `npm --prefix integrations/chatgpt-workbench run build`
- 针对性32/32：timeline-card-editor（4）、relation-sidebar-layout（4）、story-relations-containment（2）、story-axis-view（10）、story-axis-binding（12）。
- `git diff --check`

SSR 测试的 locale hook 仅在测试 bundle 提供静态 server snapshot，以便渲染 DialogProvider；没有更改生产 locale，也没有用 SSR 替代浏览器交互验收。

主任务实际云端 CUA 已确认（02:34–02:36消息）：
- 标题卡片显示；宽屏编辑替代关系面板。
- 合成作品剧情卡修改 idea→selected 保存成功，关闭编辑后恢复关系图与焦点。
- 后续3次状态保存确认四种状态颜色，真实关联卡独有伏笔边缘。

尚未由本工作项宣称通过：安卓真实宿主/输入法；完整长时间编辑；全套最终回归。主任务继续窄屏浏览器预览、最终全套核验及用户确认。

## 02:41 全套测试 fixture 适配
全套编译发现 `planning-ui-regressions.test.mjs` 的隔离上下文 fixture 未声明本阶段新增的 PositionFields / TimelineCardEditorShell，且误把真实纯函数 planning-card-presentation 也当成上下文 stub。修正测试装配：两项不执行的 UI 外壳补齐占位导出，presentation 模块加入真实模块白名单；所有原断言保留。该文件10/10通过，涵盖真实创建请求幂等、失败重试、生成目标与旧节点隔离。此修订只影响测试，不修改生产实现。
