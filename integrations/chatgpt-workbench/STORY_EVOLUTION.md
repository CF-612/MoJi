# 时间线与关系演变

云端服务 `0.6.0-timeline`。旧作品读取时不自动创建事件或推断日期；作者或明确获准的 AI 保存记录后才出现时间线。

## 使用入口

- 顶部 **时间线**：默认纵向事件列表，手机与电脑均能编辑。切换“故事发生顺序／章节叙述顺序”。故事时间是自由文字，排序使用明确数字；同序号按稳定 ID 排列，不推断日期。留出排序间隔便于插入。
- 事件可选择顺叙、倒叙、插叙、背景事件。可关联多章的已保存版本，可选原文依据；原文必须存在于该版本。章节改写提示复核，删除章从叙述顺序排除，引用历史保留。
- 事件关联人物、世界、规划和伏笔，点击可打开对应资料。角色详情显示同一份事件历程；正文“本章资料”显示本章事件。关联人物不自动证明其实际出场，正式出场仍需确认正文依据。
- **时间线 → 关系变化**：先在设定建立基础关系，再明确选择一个事件记录变化。支持其他、亲属、伙伴、敌对、师生、归属六类颜色和实线／虚线／点线；关系也可标为结束。一个事件里同一基础关系只保留一条当前变化，调整时修改原记录。
- **设定 → 关系阶段**：基础、最新或指定事件。最新指故事排序中最后一条已记录变化；指定事件应用该事件及之前的变化。事件重排会重新计算关系阶段，删除事件暂不应用其变化。阶段图编辑连线仍修改基础关系；阶段变化从时间线编辑。已有变化历史的关系不能替换人物端点，请新建另一条关系。
- 已移除事件／关系变化可通过“显示已移除…”进入历史恢复。历史与来源保留，恢复检查当前版本，可能因同一事件已有另一条关系变化而拒绝恢复。
- 设置里的夜间模式继续提供跟随环境、浅色、深色，按设备保存。

## AI 接口

`workbench_query` / `workbench_edit` 使用同一业务服务，每次明确指定 `novelId`。

| 查询 | 写入 |
| --- | --- |
| `writing.event.list/get` | `writing.event.create/update/delete` |
| `writing.relationship.list` | — |
| `writing.relationshipChange.list` | `writing.relationshipChange.create/update/delete` |
| `writing.history` | `writing.restore` |
| `writing_context.get` | — |

事件查询：`{novelId, view:"story"|"narration", nodeId?, chapterId?, includeDeleted?}`；读取单条为 `{novelId,id}`。

事件创建／更新：`{novelId,id?,expectedRevision,confirmed:true,requestId,reason,value}`。新记录版本为 0；更新必须使用读到的版本。`value` 内容：

```json
{
  "title":"雨夜重逢",
  "storyTime":"来信后的第一夜",
  "order":20,
  "narrativeKind":"linear",
  "content":"事件说明",
  "chapterRefs":[{"chapterId":"章节ID","revision":2,"evidence":"已保存的原文，可留空"}],
  "memoryRefs":["资料ID"],
  "planningRefs":["规划节点ID"],
  "foreshadowRefs":["伏笔ID"]
}
```

关系变化创建／更新使用同样的版本与确认要求，`value` 为 `{edgeId,eventId,value:{name,content,category,style,active}}`。关系查询为 `{novelId,phase:"base"|"latest"|"event",eventId?,nodeId?}`。选择 `event` 时必须提供具体事件，不会默认猜测章节里的哪一个事件。

`writing_context.get` 新增可选 `eventId`，返回相关事件、资料和该阶段关系，保留 `maxChars` 容量限制；没有事件时返回相关人物的最新关系。事件关联伏笔也纳入上下文。候选发现与事实确认分开，不后台扫描整本小说。

## 备份与回退

作品可选扩展 `writing` 版本仍为 1，增加可选 `events`、`relationshipChanges`。旧结构数据可直接读取，旧自由详述不改动。完整 JSON 与工作库备份保留当前值、版本、修改来源、理由和全部引用。

复制作品会重新映射事件、关系、资料、章节、规划、伏笔以及历史中的 ID。局部导出仅保留引用完整的记录；省略量进入导出警告，避免悬空引用。事件历史的引用同样校验。

部署前保存本地 Git bundle、旧界面、云端 SQL，并解码验证备份。提供旧界面＋新版业务层的兼容回退版本；不能用旧业务引擎回退新数据，也不要恢复旧作品快照来回退界面。

## 验证边界

自动测试覆盖双顺序、多章呈现、倒叙背景、角色出场分离、正文复核、版本冲突、请求去重、删除恢复、关系阶段及事件重排、上下文容量、完整恢复、复制与历史引用重映射、局部导出，以及真实本地 D1／Worker 鉴权与 MCP。内置浏览器使用隔离虚构作品验证 390px 页面、编辑保存、章节与角色双向跳转、彩色线型、夜间模式。

安卓实机软键盘、弱网及宿主聊天区显示仍需作者验收后打发布标签。首版不推断模糊日期，不实现平行世界或认知差异。自由详述全文 Markdown 阅读，以及基础连线的独立分类样式编辑仍待完善。
