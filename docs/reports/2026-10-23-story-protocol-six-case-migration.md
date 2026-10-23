# 第二轮：六项旧剧情协议测试迁移

基线：`0cf0361`。范围仅为 `story-evolution.test.mjs`、`story-workspace.test.mjs`、`card-relations.test.mjs`；没有恢复旧写接口、扩大白名单、跳过测试或改动产品功能。

## 逐项处置

| 原失败用例 | 当前协议下实际验证 | 明确不再宣称的旧语义 |
| --- | --- | --- |
| story-evolution：双顺序、多章、背景、复核与恢复 | `story.apply` 创建幂等；两条时间轴独立；一张卡多章引用；参与不产生正式出场；伪造依据原子拒绝；卡片 CAS；正文重排与改写后的复核；删除后作者 undo | 不再调用 event.list 的重复章节投影，也不把新计划创建视为必须确认的正文事实 |
| story-evolution：关系阶段、结束恢复、重排与上下文 | 明确发生点的关系快照；基础关系不改；计划可过滤；AI 不能确认真实关系证据；陈旧版本原子拒绝；移动卡片不平移固定关系点；关系删除与 undo；卡片删除不留下有效变化；上下文容量 | 旧 per-edge `active:false` 结束事件不是当前关系点字段；不把“分开计划”当成已结束事实，也不声称已覆盖旧事件顺序自动移动关系点 |
| story-evolution：备份、复制、范围导出 | 全量工作区恢复精确保留 state/history；副本重映射卡片、人物、正文证据、关系点、页面及伏笔节点；局部资料导出无剧情悬空引用；当前及历史坏证据均被校验拒绝 | 复制使用目标作品自己的历史，不声称迁入旧 source event.versions 账本；完整备份仍验证原历史无损 |
| story-workspace：倒叙、年龄、资料进入与计划隔离 | 双轴倒叙位置；出生日期年龄计算及原手写资料；appearancePlan 在关系投影中出现但不是正文证据；计划开关；基础关系不改；副本出场计划章节和关系端点重映射 | 当前统一模型允许不同剧情卡安排同一人物，旧 enteringRefs 全局唯一约束不恢复；旧 event.storyDate 改为卡片日期说明，年龄计算单独核验，不宣称 UI 自动年龄投影 |
| story-workspace：规划原子保存、复用、冲突及取消关联 | 一张卡跨两页共享实例；重复创建返回同一回执；工作区冲突不留孤儿；移除展示不删除卡；卡内容修改可见于 board；实例版本冲突不改布局，正确版本可保存 | 不再维护 event 与 planning 两套实体及 timelinePlan.move；跨页展示不是复制或旧式事件规划关联 |
| card-relations：基础、事件起点、未定、计划与复制 | 基础亲属关系独立保留；有日期及未定关系点；按人物对的当前关系投影；计划过滤；幂等、原子 CAS；组织连线与副本人物端点、剧情点引用完整 | 当前快照按人物对投影，不声称同一对同时显示多条旧 per-edge 历史；未定关系保留在 undated 而非伪造发生时间 |

每组都明确断言对应退役动作仍返回 `NOT_ALLOWED`。`card-relations` 原有两项组织稳定 ID、原子创建测试未改，随本组共同执行。

## 证据

命令：

```sh
node --test integrations/chatgpt-workbench/tests/story-evolution.test.mjs integrations/chatgpt-workbench/tests/story-workspace.test.mjs integrations/chatgpt-workbench/tests/card-relations.test.mjs
```

结果：8/8 通过，0 失败、0 跳过；六项迁移加两项未改组织测试。日志：`artifacts/moji-protocol-cleanup-round2-20261023/six-protocol.log`（仓库外同级 artifacts）。这是聚焦验证，不代替父任务的全套验证。

迁移过程中没有发现新的产品缺陷；第一次试跑的无效依据来自测试把 chapter.create 元数据当成正文，已改为从 chapter.get 获取真实保存内容。未提交或推送。
