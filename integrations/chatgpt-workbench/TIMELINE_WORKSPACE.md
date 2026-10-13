# 故事演变工作区 0.8.1

正文仍在最前。原网格规划完整保留，和时间线规划是并列的两种使用方式，编辑同一份规划记录。Markdown 阅读在 0.8.4 完成，见 [阅读与编辑](MARKDOWN_READING.md)。

## 使用

- “时间线”、规划的“时间线规划”、设定的“故事演变”进入同一工作区，共用设备内的顺序与游标。
- 一次只显示正文卷章轴或故事发生轴。切换保持选中事件；一章多事件逐个选，倒叙按该事件的故事排序显示关系。
- 事件可填写明确日期、自由故事时间、待写卷章、计划叙述排序；没有正文时不创建空白章。待写节点列在现有章节之后，按计划叙述排序排列。
- 时间线竖向排列，点击节点或使用上／下节点按钮投影已读取资料，不发写入请求。电脑左侧时间线、右侧关系与规划；手机选中节点就地展开内容，关系图按需展开。移除横向滑杆和横向卡片。关系图保留触屏平移、双指缩放及关系标签编辑，历史保留。
- 在事件的“在此首次进入故事的资料”指定人物或世界的进入位置；未指定时保持可见。完整资料开关显示未来节点但淡化。进入位置不等于正式出场、出生或死亡。
- “此处规划”可新建、直接编辑、追加关联、移到此处、取消时间关联。取消不删卡片，未安排的卡片仍在网格与待安排区。已写入正文仍需实际章节版本引用。
- 计划情境明确标注；计划关系仅进入计划情境投影，不覆盖已确认事件或默认最新关系。
- 角色出生日期和选中事件的明确日期均有效时计算年龄；旧 `character:age` 稳定 ID 保留文字，显示名改为“年龄段／描述”，不反推生日。旧的非日期出生说明也不丢失，暂不计算。
- 本节点显示相关伏笔、章节依据与回收提醒。伏笔仍按章节证据汇总，同章多事件不猜其埋设／回收先后。

## 共用 AI 接口

既有 workbench_query/workbench_edit 承载以下操作，无新模型调用或后台扫描：

| 操作 | 参数与行为 |
|---|---|
| `writing.board.get` | `novelId`，返回章节、事件、规划、资料及关系变化投影；不返回整本正文 |
| `writing.stage.get` | `novelId,eventId,complete?,chapterId?`，返回阶段关系、可见资料、当时年龄、规划与伏笔 |
| `writing.event.create/update` | `value.storyDate` 可选 YYYY-MM-DD；`plannedChapter,narrationOrder,planned,enteringRefs`；update 需要 `id,expectedRevision` |
| `writing.timelinePlan.create` | `eventId,expectedEventRevision,value,confirmed:true,requestId`，原子创建规划并关联事件 |
| `writing.timelinePlan.move` | `nodeId,expectedRevision,eventId,eventRevisions,confirmed:true,requestId`；eventRevisions 包含目标与全部当前关联事件版本，冲突停止整个移动 |
| `planning.apply` | 继续编辑同一规划；不复制时间线大纲 |

新增字段参与历史、完整备份、复制 ID 重映射及范围导出校验。AI 候选仍需确认，参与事件不证明实际出场。

## 验证与回退

核心与集成测试覆盖倒叙、多事件、生日、任意年龄描述、计划／正文隔离、进入位置重复、完整复制、共享规划、请求去重、版本冲突与原子移动。原有 178 项业务测试与 38 项集成／云端测试通过。内置浏览器检查了 390px 窄屏、单轴、实际规划新建与修改、原网格保留、关系编辑、游标变化；安卓实机键盘／长按仍待用户实测。

发布前保留源码 bundle、稳定 HTML、Cloudflare SQL 备份，备份完整性及 3 作品／9 正文章读取通过。界面回退使用新业务层配旧界面的兼容构建，避免旧引擎覆盖新事件字段；不恢复或覆盖最新作品。

组织选择器、角色卡关系行、时间未定关系在 0.8.2 完成。节点改排序在 0.8.5 增加上移／下移入口，两轴独立，见 [时间节点排序](TIMELINE_ORDER.md)；尚未提供触屏拖拽改序。Markdown 阅读在 0.8.4 完成，见 [阅读与编辑](MARKDOWN_READING.md)。


## 0.8.3 节点联动

- 无事件的章节节点可直接「＋本章规划」，不制造空白事件或章节。新卡在原网格中仍使用同一 ID，关联指定已保存章节版本，默认保持讨论中，不自动改成已写入正文。
- 当前节点可搜索勾选人物、世界和已有伏笔。事件参与、首次进入故事、已确认实际出场、仅被提及分开显示；正文改写的依据提示待复核。
- 事件旁可就地创建伏笔，与事件关联一次原子保存；已有伏笔在时间线上编辑相同台账记录。回收仍需要已保存原文，不因事件关联而自动发生。
- 无生效事件的关系列入折叠的「待安排关系」，选择具体事件后通过原关系变化编辑器安排「在此生效」。计划情境规则保持。
- 新建草稿记录开始填写时的事件／章节版本。遇到冲突保留内容，作者可明确核对最新节点版本再创建；已存在的卡片仍校验自身版本。

新增共用接口（带 novelId、confirmed:true、requestId）：

| 操作 | 必需参数／返回 |
| --- | --- |
| writing.chapterPlan.create | chapterId、expectedChapterRevision、value；返回 nodeId、chapterRevision |
| writing.timelineForeshadow.create | eventId、expectedEventRevision、value（沿用伏笔规格）；返回 foreshadowId、eventRevision |
| writing.foreshadow.get（只读） | id；返回当前伏笔及依据复核信息，历史按 writing.history 读取 |

writing.stage.get 增加 materials（participating/entering/prose）及 unplacedRelationships。writing.board.get 的 chapters.references 增加正式正文关联的稳定 ID、角色 ID、kind、版本和复核信息，不包含正文全文。全部继续使用已有记录结构和完整备份／复制映射。

手机编辑修复：文字工具栏隐藏时保留占位，避免文本框失焦后按钮移动、第一次点击保存落空。390px 预览中已验证鼠标第一次点击保存、章节规划创建、带正文依据的伏笔创建、联合资料选择、未定关系安排及深色显示。安卓实机仍需作者使用确认。

## 0.8.5 时间节点排序

通过 [时间节点排序](TIMELINE_ORDER.md) 在当前轴就地上移／下移。章节轴只调整本章事件；同一事件在多章的显示顺序独立。故事轴重算阶段关系，不改日期、正文或引用。原有切换查看节点按钮保持只读。
