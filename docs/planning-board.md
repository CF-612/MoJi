# 统一剧情工作区（V3.1）

规划是作者与助手共用的情节推演工作台。剧情卡承载事件、冲突、选择、转折或阶段目标；不按章节数、字数或讨论轮次拆卡。正文记录已写内容，规划记录意图，两者不能互相替代。

## 当前模型

- `cards`：剧情卡内容、进展、参与人物、章节范围、证据、两条时间轴安排和固定发生点。
- `placements`：包含树与同级顺序，引用格式为 `card:ID`、`chapter:ID`、`volume:ID`，顶层为 `root`。正文卷章来自真实目录，不在规划创建替身。
- `pages[].instances`：对象在页面上的展示坐标与实例版本。同一对象可出现在多页；移除展示不删除内容，修改内容会影响所有展示。
- `precedence`：对象间先后关系，独立于包含树和展示坐标。不能只凭位置或章节相邻推断因果。
- `tracks` / `time`：时间安排。叙述时间与故事时间独立，固定发生点不随拖卡平移。

新提案保持 idea，作者采用才用 selected；written 是进展标签，不自动产生正文证据或人物关系事实。证据使用真实已保存章节版本和准确原文；有证据的正式人物关系变化必须由作者确认，AI 只能安排计划。

## Agent 调用

`moji_plan` 当前只公开 `story.get` 和 `story.apply`。完整字段说明及可执行示例见 [规划 Skill](../skills/moji-plan/SKILL.md)。

1. `story.get {}` 返回 `state`、目录 `sources`、历史摘要 `history` 和 `canRedo`。以实际页面 ID 定位，不猜作者当前选择，也不把 main/null 当作所有作品通用的隐式页面。
2. `story.apply {expectedRevision,requestId,reason?,operation:{type,...}}` 每次提交一个操作。最外层版本来自 `state.revision`；card.update 的 operation.expectedRevision 来自卡片本身。
3. 新对象 ID 从返回的新 state 取得。没有旧协议的临时 ref、mapping 或 transactionId；返回内容可直接用于核对和下一步修改。
4. 同一请求结果不明时保留原 requestId 和参数核对；冲突后重读并合并差异，不提升版本强行覆盖。多次调用不是原子批量事务。

| 操作 | 关键字段 |
| --- | --- |
| card.create | value；可选 pageId、position、parent |
| card.update | id、expectedRevision、value（仅变更字段） |
| card.delete | id；直接子项保留并移到原父级，不能当作删除子树 |
| move | refs、parent、before 或 after |
| precedence | from、to；remove:true 移除 |
| page.create | name |
| instance.add/remove | pageId、ref；新增可带 position |
| instance.layout | pageId、points、revisions（实例版本） |

作者界面的撤销、重做、备份/恢复不是此 AI 工具的可调用动作。不要用工作区历史摘要冒充完整变更审计。

## 讨论与布局

同一想法的补充优先更新原卡。独立事件或真正不同的走向才新建；多方并行分行展示，在真实交汇处汇入同一后果。保留作者已有坐标，新卡留出标题和箭头空间。待解问题放相关卡片正文；不为了画出网络而编造因果。

“在 A→B 中插入 X”需要显式创建卡、移除旧关系、分别创建两条新关系；每步核对返回版本，失败时说明已完成与未完成的部分，不能宣称整个多步操作原子完成。

## 旧版迁移边界

旧文档曾介绍 planning 节点/分组/便签/框、一次 1–200 操作的事务和事件单独写入接口。这些不是当前公共 AI 协议，不应继续照旧示例调用。现行允许列表没有恢复旧写入；保留的旧数据类型、解析器或导入兼容代码，也不表示旧 UI/API 功能仍受支持。

旧式便签/讨论框、分组、原子续接和事务回滚不能机械翻译成当前操作。当前测试验证的是统一卡片、共享展示、先后关系、真实证据、冲突与重试；旧功能无等价实现时必须记录差异，不通过放宽白名单或跳过断言制造通过结果。

实现依据：`src/domain/story-workspace.mjs`、`src/domain/story-v31.js`；AI 能力边界：`src/contracts/actions.js`；DSH 参数：`src/adapters/dsh/planning-schema.js`。
