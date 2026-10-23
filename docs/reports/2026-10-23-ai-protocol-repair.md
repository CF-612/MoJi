# AI 规划协议迁移修复与验证

## 已修复的真实入口问题

四份发布技能（plan/project/write/revise）、DSH planning 参数 schema 和 `docs/planning-board.md` 原先仍教 AI 调用已退出允许列表的旧规划接口。现统一为 `story.get` / `story.apply`，明确单操作、工作区与卡片双版本、真实 ID、完整 state 返回、重试边界、共享页面实例和正文证据。

没有恢复旧写接口或扩大 allowlist。DSH schema 不再展示已弃用的 operations/nodeId；真实 host 工具注册及执行通过。当前单操作不是旧批量事务，不能承诺跨调用原子回滚；作者撤销不对 AI 开放。旧便签/讨论框没有假装成新能力，待解问题放卡片正文，并增加旧框写入失败且状态不变断言。

## 保留和补充的行为覆盖

- 直接读取技能 JSON，通过真实注册 DSH/MCP 工具执行；同一 requestId 重试不重复创建。
- 工作区冲突、卡片冲突、字段保留、作者既有布局不被改动。
- 三条动线、七张卡片、六条先后关系、共同后果唯一、布局不重叠、未决问题保留。
- 独立页展示归属、共享对象不复制；插入情节逐步完成，作者逐步撤销恢复原内容及关系。
- 正文补丁保留周围文本；真实保存版本证据；伪造引用拒绝且状态不变。
- 图谱旧有来源/失效证据/原子移动断言保留。
- 工作台跨实例、备份恢复、权限、审计、正文保真检查保留。preset 修改改由作者执行（不再让 AI 调作者专用动作）。
- 云端迁移保留 D1 跨端保存、CAS、重启、OAuth MCP、备份/快照恢复；增加旧写拒绝、计划不等于正式出场、AI 不得确认关系事实。快照恢复验证内容/证据不变且版本递增，避免将预期的防旧草稿版本提升误判为内容变化。

## 验证结果

- `node --test tests/host-tools.test.js tests/skill-examples.test.js integrations/chatgpt-workbench/tests/workbench.test.mjs`：16/16，通过，无跳过。
- `npm run typecheck`：通过。
- 云端全套：11/11；最终补充快照断言后 Worker 单项复测：1/1，通过。
- 当前模型 integration：markdown、work-search、unified-planning、timeline-context、card-properties、connected-charts，分组共 16/16，通过。
- `git diff --check`：通过。

日志在工作区 `/workspace/scratch/cafaf4c3ba47/artifacts/moji-protocol-repair-20261023/`。以上是聚焦验证，不代替最终聚合回归结果。

## 没有宣称修好的项目

原工作台 29 个 NOT_ALLOWED 并不都是换 action 名即可解决。一部分测试依赖已退役的独立事件队列、事件顺序、阶段视图或旧规划 UI 模型；这轮不恢复旧公共写入口，也不把它们全部改成内部 Store 调用绕过权限。未有现行等价语义的测试保留待报告，不删除、跳过或降低断言来制造全绿。

尤其旧框/便签、规划批量事务/临时 ref、原子续接不是当前公开协议。文档与测试明确记录迁移差异，不能把新模型覆盖误报成旧功能完全恢复。剩余逐项清单由 integration 协议核查记录补充；最终聚合结果以本轮完整自动验证报告为准。
