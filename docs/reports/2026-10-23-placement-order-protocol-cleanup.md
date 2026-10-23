# 旧位置与排序测试清理：逐项处置

基线：`0cf0361`。本轮仅改四个测试文件及共用测试夹具；未恢复旧写入白名单，未实现已移除产品能力，未跳过失败用例。所有写入通过真实工作台公共 `story.get/story.apply` 服务；没有改用 Store 绕过服务入口。

## 旧失败用例逐项对应

| 原文件／用例 | 当前验收与处置 |
| --- | --- |
| event-direct-edit：连续排队 | 连续保存接续已确认版本；同一工作区版本竞争的第二次位置保存失败且不覆盖。旧专用事件队列不再假冒当前 UI；不宣称保留旧后台连续拖拽队列。 |
| event-direct-edit：丢失回复／外端修改 | 提交后重启服务，再发生其他端修改；原 requestId 返回原回执、不重复移动，新 requestId 的过期草稿被拒绝。 |
| event-direct-edit：占位／删除历史 | 同一卡片补内容、删除、工作区 undo 恢复内容及页面实例；替代已移除的事件独立版本恢复接口。 |
| event-direct-edit：故事连续拖动 | 两次当前卡片故事位置修改保持叙述、日期说明和固定发生点不变。 |
| event-placement：叙述范围与证据 | 连续章范围移动、扩展与两次 undo；正文、出场记录、原卡片 scope/evidence 和另一张规划卡完全不变。 |
| event-placement：版本冲突 | 工作区 CAS 与卡片 CAS 分别阻止过期覆盖；章节删除使位置草稿失效；纯正文修改不禁止无证据位置调整，新增正文证据仍严格校验当前章节版本。 |
| event-placement：故事排序 | 故事位置重排不改变叙述顺序；固定关系发生点不随卡片平移；非法时间范围原子失败，旧 event.place 明确拒绝。 |
| timeline-order：双轴与关系／伏笔 | 双轴可独立调整，原证据、日期说明、发生点、其他卡片和伏笔引用保留；幂等重试与历史增长均验证。 |
| timeline-order：跨章／复制 | 当前跨章区间、未安排卡、复制后的双轴顺序与当前/历史卡片 ID、章节引用重映射均验证。新增历史只读用例保留旧章内独立 chapterOrders 及无键回退。 |
| timeline-order：增删改冲突 | 其他卡片新增、删除、修改都使工作区快照失效，失败后 state 完全不变；不存在章节、逆向区间、越界区间拒绝；旧 event.move/update 明确拒绝。 |
| timeline-overview：关系变化 | 明确发生点时序、已确认与计划筛选、dropped 排除、删除变化、只读不改状态及不制造人物出场。旧 relationshipChange.create 明确拒绝。 |
| timeline-overview：伏笔范围 | 同章多卡仍只产生章节级埋设/回收依据；无证据节点只作为计划，其他章节不沾染依据；读取不改变导出数据。 |

## 明确不等价的旧能力

- 旧 `chapterOrders` 可让同一跨章事件在两章里相对顺序相反；当前一张卡只有一个叙述区间，不能伪称逐章独立排序。旧只读投影及回退回归保留，公共旧写入依旧拒绝。
- 旧关系 `active:false`／“结束”差量并不是当前 relation.save 的字段；当前关系发生点用名称、原因和证据，删除变化不是“关系结束”的同义替换。本轮不宣称恢复旧结束语义。
- 当前故事卡位置变化与固定发生点独立；旧事件改序连带重算其关系阶段的行为不再作为新模型预期。
- 当前位置写入不以正文内容版本作无条件锁；仅证据声明需要正文版本校验。纯正文改写后安排位置成功是合同差异，不是取消证据安全断言。
- 旧 `confirmed`、`changed:false` 无操作结果、旧 event queue/chapterPlan 原子操作没有照搬到新接口。本轮测试名称与报告明确当前合同；没有扩大公共接口。

## 检查

```sh
node --test integrations/chatgpt-workbench/tests/{event-direct-edit,event-placement,timeline-order,timeline-overview}.test.mjs
```

14/14 通过（12 项旧失败迁移、1 项原有历史导航、1 项新增历史排序只读）。日志：`artifacts/ai-protocol-cleanup-round2/placement-order-overview.log`。四文件及夹具 `git diff --check` 通过。未修改正文应用、轨道 UI、导入/备份实现，未提交或推送。

附带只读引用调查：旧 event.place/move 仍出现在 `features/structure/{useEventPlacement,EventPlacementEditor,StoryStage}`；其父 Timeline 被 modules/index 的 timeline 懒加载与 memory/index 导入。已交主负责人核查实际可达性；本代理未擅改应用代码。
