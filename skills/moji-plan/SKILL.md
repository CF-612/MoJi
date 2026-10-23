---
name: moji-plan
description: 讨论剧情走向、人物行动、因果或备选方案时使用；通过统一剧情卡、包含树、页面实例与时间安排维护共同思考的工作台。
---

# 共同讨论与维护剧情

规划展示“当前处境 → 选择/行动 → 后果/新问题”，不是章节目录。讨论具体剧情结构时，把实质推演维护到相关剧情卡；明确只聊不改、不保存或只读审阅时只读取。只更新真正变化的部分，不逐句归档聊天，不自动改正文或确定人物事实。

## 唯一工具协议

调用 `moji_plan`，使用 `{action,args}` 包装。当前仅支持 `story.get` 和 `story.apply`；旧规划、事件写入接口已经退出允许列表，不能重试或绕道调用。

1. `story.get {}` 返回 `state`、`sources`、`history` 和 `canRedo`。`state.cards` 是按 ID 索引的剧情卡；`placements` 是包含与同级顺序；`pages` 的 `instances` 是页面展示坐标；`precedence` 是先后关系；`tracks` 是轨道。`sources` 提供真实正文卷章元数据，不包含正文。
2. 根据作者提到的标题、内容和页面定位。页面的 `instances` 键形如 `card:ID`、`chapter:ID`、`volume:ID`，不是卡片 ID。UI 当前选页不是 Agent 隐式上下文。只在需要核对正文时用 `chapter.get`，不为调整连线读取全书。
3. `story.apply` 使用 `args.expectedRevision = state.revision` 和单个 `operation:{type,...}`。更新卡片还要在 operation 中传卡片自己的 `expectedRevision`。两种 revision 不可混用。
4. apply 返回完整的新工作区响应，不返回旧协议的 mapping/transactionId。新建对象的真实 ID 从返回 state 与创建前的差异取得；后续引用必须用真实 ID，不能用临时 ref。

每次写入使用唯一 requestId；同一请求网络结果不明时，保留原参数和 requestId 核对或重试，不能另建一份。遇到 CONFLICT 重新读取、保留作者修改并合并实际差异，不只换 revision 强行覆盖旧草稿。一次 apply 是一个操作；多个独立调用不是原子事务，不能承诺全部回滚。

## 卡片、页面、包含与先后关系

| 任务 | operation |
| --- | --- |
| 新建剧情卡 | `{type:"card.create",value:{title,summary,content,status:"idea"},pageId,position:{x,y}}` |
| 修改同一情节 | `{type:"card.update",id,expectedRevision,value:{summary,content}}`；省略字段保留 |
| 独立讨论页 | `{type:"page.create",name}`；读取返回的新页面 ID，再创建卡片 |
| 将现有对象展示到另一页 | `{type:"instance.add",pageId,ref:"card:ID",position:{x,y}}`；共享同一内容，不复制卡片 |
| 从页面移除展示 | `{type:"instance.remove",pageId,ref:"card:ID"}`；不删除卡片 |
| 调整包含与同级顺序 | `{type:"move",refs:["card:ID"],parent:"root",before:"card:OTHER_ID"}`；before/after 选一个 |
| 新增先后关系 | `{type:"precedence",from:"card:A_ID",to:"card:B_ID"}`；先核对是否已有 |
| 移除先后关系 | 同上增加 `remove:true`；不删除两张卡 |
| 删除卡片 | `{type:"card.delete",id}`；先核对范围和引用，直接子项会移到原父级，不是删除子树 |

包含、先后关系和页面展示是不同维度。不要根据卡片位置推断因果，不把“章节编号相邻”等同于剧情因果。包含关系不得循环；正文卷章只来自正文目录，不在规划伪造。一个章节可以实现多个情节，一张卡也可跨章；不按字数或聊天轮次机械拆卡。

多方行动可分行展示，共同后果只创建一张卡，多条先后关系指向它。两种未定走向保留两张 idea 卡，用摘要写清各自代价。当前协议不提供旧式便签、讨论框、分组及批量节点事务；待解问题写在相关卡片正文中，不虚构这些操作。缺少原子插入或批量能力时说明限制，避免把部分完成说成整个操作已完成。

页面没有默认 null ID：默认自由构思页通常为 main，但仍以读取结果为准。一个对象可在多页展示；修改卡片内容会更新所有展示。已有布局保持不动，新增卡片安排清楚位置。确需调整位置时用 `{type:"instance.layout",pageId,points:{"card:ID":{x,y}},revisions:{"card:ID":INSTANCE_REVISION}}`；坐标必须有限，实例版本取该页 instances。视口、缩放与选择不是作品事实。

## 内容、时间与正文证据

- 标题写事件或选择；摘要写触发与变化；正文承载动机、细节、伏笔与未决问题。
- idea：讨论；selected：作者采用；written：已实现的进展标签；dropped：暂不采用。不能自行采用方案；written 本身不是正文证据或已确认人物事实。
- `cast` 放相关人物 ID，`scope` 放真实章节 ID，`evidence` 放已保存版本的 `{chapterId,revision,evidence:"准确原文片段"}`。增补数组保留已有内容；先读取正文，不能编造引文或版本。部分实现时保留剩余问题，不机械把全部卡片标 written。
- `time.narration` 与 `time.story` 独立，不能拿正文顺序推断故事日期。固定发生点 `points` 不随拖卡平移。故事时间轴配置存在时，用独立 storyAxis 操作安排日期，不直接覆盖 time.story；操作字段不确定时不猜。
- AI 可以维护计划，但不能确认正式人物关系变化；有正文证据的关系事实必须由作者确认。不要因规划更新连锁改人物事实或重写后续正文。

## 可执行调用示例

以下示例按顺序执行。大写字符串是占位符，调用前替换成刚读取/返回的真实值；示例 revision 为 0/1 仅用于展示，必须替换为当前工作区/卡片版本。每次新操作换唯一 requestId。

```json
{"action":"story.get","args":{}}
```

创建一张仍在讨论的卡片（pageId 使用查询所得页面）：

```json
{"action":"story.apply","args":{"requestId":"create-scene-unique","expectedRevision":0,"reason":"讨论暂不揭穿假账的动机","operation":{"type":"card.create","pageId":"PAGE_ID","position":{"x":100,"y":120},"value":{"title":"发现假账，暂时隐瞒","summary":"主角留存账册，准备追查送账人的去向。","content":"尚未采用：当场质问可能惊动幕后人，先讨论追查的代价。","status":"idea"}}}}
```

补充原卡，不创建重复备忘录：

```json
{"action":"story.apply","args":{"requestId":"update-scene-unique","expectedRevision":1,"reason":"补充人物动机","operation":{"type":"card.update","id":"CARD_ID","expectedRevision":1,"value":{"summary":"主角压下质问冲动，准备沿送账人的去向追查。","content":"保留可疑账册，先核对送账人的去向，避免惊动幕后人。"}}}}
```

新建后续卡需再执行 card.create，取得真实 ID 后再连线。每步使用上一响应的 state.revision：

```json
{"action":"story.apply","args":{"requestId":"link-scenes-unique","expectedRevision":3,"operation":{"type":"precedence","from":"card:CARD_ID","to":"card:NEXT_CARD_ID"}}}
```

保存后用返回 state 或再次 story.get 核对内容、包含和关系。history 仅是工作区历史摘要；撤销/重做是作者界面能力，不在此 AI 工具允许列表中。
