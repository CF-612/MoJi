# 第二轮：旧接口清理、真实入口修复与测试处置

基线：`0cf0361`；2026-10-23。用户继续授权清理旧接口和修复 Bug。第一轮独立聚合剩余 **19** 个旧接口失败（227 通过），不是原局部清单的 18 个：漏项为 timeline-tracks。

## 真实入口修复

1. `server/mcp.mjs` 的真实 `workbench_edit` 工具说明仍教 AI 使用 planning.apply，改为 story.apply 单操作与双版本。真实 MCP listTools 回归检查说明，不只静态替换。
2. 导入的无 story 旧作品，搜索仍可返回旧 planning/event ID；原 shell 把它们送到被禁用的 planning.get，或误当新版卡片 ID。现搜索标为“旧版只读摘要”，点击保留摘要并明确：不是完整内容，可从“作品与备份”导出完整作品备份；不猜 ID、不隐式创建工作区、不自动迁移或重写旧数据。新版 unified 卡片仍正常打开。当前可用的读取只有搜索摘要，因此没有伪称打开旧全文编辑器。
3. 发布核查脚本硬编码 0.4.0，改为从当前 package.json 核对 name/version；私密路径、缺失必需文件仍被拒绝。
4. 安装指南错误指向旧上游 0.4.0 成品包，改为实际支持的 codex/main 源码构建、本地 npm pack 包与原生宿主安装。明确无当前 Windows 成品安装包；目标版本来自实际构建，不编造 Release 资产。未改更新渠道、默认分支或执行部署。

## 19 项测试逐组处置

- event-direct-edit 4、event-placement 3、timeline-order 3、timeline-overview 2：共 12 个旧失败，迁到当前公共卡片时间安排、冲突/原子性、证据不随拖动、撤销、固定关系点与备份复制引用等断言；额外保留旧排序只读兼容。四文件合并 14/14 通过。
- story-evolution 3、story-workspace 2、card-relations 1：6 个旧失败迁到当前卡片、关系发生点、人物参与计划/正式证据边界、页面共享、备份历史及复制重映射。三文件 8/8 通过，含两个原有组织测试。
- timeline-tracks 1：旧组件已不是应用入口，改为真实 UnifiedTimeline 静态渲染；核对跨章仅一条长条、准确范围、独立章节卡、待安排、没有凭跨度捏造中间章节证据，以及旧写入拒绝且状态不变。1/1 通过。

每项详细映射见：
- `2026-10-23-placement-order-protocol-cleanup.md`
- `2026-10-23-story-protocol-six-case-migration.md`

没有 skip、恢复旧写白名单或把公共测试整体改用内部 Store 绕过边界。**这不表示恢复了旧功能**：每章可相反排序的 chapterOrders、进入故事唯一性、关系 active:false/结束台账、双台账 timelinePlan 等没有当前一对一合同。它们作为退役语义明确记录；有支持意义的旧数据读取/导入保护独立保留，不把新卡片投影假称完全等价。

## 可达性核查与刻意保留

实际 DSH 使用 `dsh-entry.tsx -> #moji-shared-ui`，工作台使用 vendor 统一 UI；根 src/client 旧 planning 文件不是当前 DSH 页面入口。旧 Timeline/StoryStage/EventPlacement 文件以及 module lazy 映射仍在仓库，但 shell 实际 timeline 导航进入统一规划，ModulePage 仅挂 overview；Memory 的 Timeline 导入没有实际渲染调用。没有盲删这些兼容代码，也没有把内部旧备份字段批量改成新卡片字段。规划模块注册中的 planning.timeline 是页面标识，不是 RPC。

## 验证边界

聚焦验证记录于工作区 artifacts：两个子组 14/14、8/8；搜索/当前渲染 4/4；真实 MCP 1/1；发布审计 2/2。最终合并 **29/29 通过，无跳过**；`npm run typecheck` 通过。日志位于工作区 `artifacts/moji-legacy-cleanup-round2-20261023/round2-combined.log` 与 `round2-typecheck-final.log`。全套聚合由冻结后的独立验证流程记录；静态渲染不是浏览器拖拽验收，构建、提交也不是上线部署证明。
