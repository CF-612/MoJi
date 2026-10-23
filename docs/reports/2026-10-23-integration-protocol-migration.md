# 工作台协议测试迁移与未解决范围

日期：2026-10-23。

更正（第二轮开始前）：独立聚合为 227 通过 / **19** 个旧接口失败；本报告原清单漏列 `timeline-tracks.test.mjs:12` 的 1 项旧事件创建，因此下文 18 是原分组清单数，不是全套剩余数。第二轮处置另见新报告。
只修改测试，不恢复旧写入白名单、不跳过或删除失败用例。

## 已迁移并执行到最终断言

命令：

```sh
node --test integrations/chatgpt-workbench/tests/{markdown,work-search,unified-planning,timeline-context,card-properties,connected-charts}.test.mjs
```

结果：16/16 通过。对应原先 8 个 NOT_ALLOWED 失败叶子，其他既有用例保留通过；不是全工作台测试通过。

- `markdown`：资料、关系、剧情卡、预设原文保真，完整导出及复制仍保留换行与空白。
- `work-search`：两个旧规划/事件记录改为两张统一卡，搜索仍命中 7 条记录；分类数为 6，不再重复归入旧 planning 分类。历史、候选、他书和未启用预设隔离断言保留。
- `unified-planning`：真实页面实例与剧情卡在两轴已安排/未安排集合中不丢失；更新同一 ID 不增加卡片。旧分页规划读取器不再作为现行入口。
- `timeline-context`：重复请求不重建，过期正文证据不留下半张卡；伏笔节点与卡片引用原子保存，计划不能成为埋设或回收事实；人物参与不成为正式出场，AI 不能确认关系正文证据，作者确认后正文变化会标记复核。旧 chapterPlan 写入明确验证 NOT_ALLOWED。
- `card-properties`：资料类型/分组与剧情用途/进展修改保留内容、人物/章节引用及页面位置；过期卡片版本拒绝覆盖。旧规划分组未恢复，明确验证拒绝。
- `connected-charts`：统一卡片参与与正式出场区分，卡片/伏笔/章节投影一致，正文变更保留复核保护。工作区可读取卡片正文，但章节列表依然不泄漏正文。

`git diff --check` 对这些文件通过。测试输出保留于 `artifacts/ai-protocol-repair/integration-migrated.log`。

## 未迁移、未宣称修复的旧协议用例

以下 6 个文件本次原样重跑：18 项中 1 通过、17 个 NOT_ALLOWED；均在旧入口准备数据时停止，下游行为未被验证。日志：`artifacts/ai-protocol-repair/integration-retired-inventory.log`。

| 文件 | 失败数 | 仍依赖的旧语义 |
| --- | ---: | --- |
| event-direct-edit.test.mjs | 4 | writing.event.place 队列、旧事件 revision/chapterRefs/chapterOrders，旧事件删除历史 |
| event-placement.test.mjs | 3 | 原子事件位移、逐事件目录快照、旧故事轴改序 |
| story-evolution.test.mjs | 3 | 独立事件与规划台账、旧 relationshipChanges 阶段投影及其备份重映射 |
| story-workspace.test.mjs | 2 | 旧事件出生/入场阶段投影、timelinePlan 原子创建与取消关联 |
| timeline-order.test.mjs | 3 | 逐章节事件 chapterOrders、事件顺序快照、旧叙述冻结行为 |
| timeline-overview.test.mjs | 2 | 旧事件阶段变化及事件级伏笔关联的投影 |

另 `card-relations.test.mjs:31` 原基线有 1 个 NOT_ALLOWED：多条同人物关系依赖 `timing:event`、独立事件及旧关系变化台账。该文件本次未修改；未把此旧事件语义冒充新卡片发生点合同，也未以 direct Store 绕过服务白名单。

这些共 18 项仍需单独决定哪些属于保留的历史数据迁移合同、哪些应迁到新发生点/时间轴模型。不能只重命名 action：新协议没有旧 chapterOrders 或旧原子 timelinePlan 操作。未恢复旧 UI、未扩大功能范围、未以 skip 或降低安全断言制造绿色。

`ai-review`、`studio-data`、`timeline-tracks`、`workbench` 与云端用例由其他负责人处理；本报告不替代其最终结果或全套汇总。
