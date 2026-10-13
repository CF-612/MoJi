# 角色卡的组织与人物关系

0.8.2 在角色卡上增加所属组织选择器和人物关系编辑。仍使用已有的图连线、事件和关系变化记录，不存储另一份关系台账。竖向时间线保持不变。

## 作者入口

- 新建角色时可选择已有组织，角色与归属连线一并保存。可搜索或新建类别为「组织」的世界书。
- 已有角色详情中的「所属组织」选择基础归属，保存后自动建立连线。直接编辑或删除图里的这条连线，选择器会同步读取结果。旧 `character:organization` 字符串标为原文字保留，不进行同名猜测或自动迁移。
- 人物关系选择已有角色、关系名、类别和线型。生效位置可选基础、具体事件、时间未定。同一对人物可记录不同关系。
- 具体事件关系在此前不存在。时间未定的关系保存但不进入阶段图，之后用「事件变化」安排位置。计划事件只在计划情境中应用。
- 从角色卡编辑基础关系或事件变化，与图和时间线编辑的是相同 ID。只有类别为归属、角色指向组织、基础已存在的边计入组织选择器；有事件变化的归属不由选择器自动删除，需要在关系编辑处处理。

## AI / 共用接口

所有接口使用现有 `workbench_query` / `workbench_edit` 的 `action` 和 `args`。模型必须明确传 `novelId`。事实候选先提议，得到作者确认或明确记录指令后写入。

| 操作 | 参数和结果 |
| --- | --- |
| `writing.organizations.list` | 返回组织的稳定 ID、名称、节点版本；同名记录分开显示 |
| `writing.cardRelations.get` | `nodeId`；返回节点版本、组织选项、角色选项、基础归属边、全部相关边、变化记录和事件 |
| `writing.affiliation.set` | `nodeId`、`expectedNodeRevision`、`organizationIds`、`organizationRevisions`、`edgeRevisions`、`confirmed:true`、`requestId`；其中边版本表必须精确覆盖上次读取的全部基础归属边，组织版本表覆盖所选组织 |
| `writing.relationship.create` | `nodeId`、`targetId`、双方的 `expectedNodeRevision` / `expectedTargetRevision`、`name`、`content`、`category`、`style`、`timing`（base/event/undated）、`confirmed:true`、`requestId`；event 还需 `eventId` / `expectedEventRevision`。原子返回 edge 和可选 change |
| `writing.card.create` | 现有字段之外可传 `organizationIds` / `organizationRevisions`，原子创建角色和归属边 |
| `edge.update` | 继续使用 `edgeId` / `expectedRevision`，支持 category、style、baseActive、timing；基础调整不清除事件历史 |
| `writing.relationshipChange.create/update` | 继续使用已有版本接口记录后续变化 |

边增加向后兼容的可选属性 category、style、baseActive、timing。缺省仍是 other / solid / true / base。事件 ID 在现有关系变化中存储，完整备份与复制沿用已有映射。组织关联只引用边的 from/to，改名不影响联系。

冲突停止整个操作并保留草稿。调用方不要用新版本自动重试旧意图；先重新读取核对。请求 ID 去重沿用已有业务层。

## 发布与恢复

发布前在忽略目录保存源码 bundle、上一稳定 UI 和云端 SQL。验证 SQL 能还原并完整读取。云端手动部署，不迁移作品、不写入真实小说。

旧 0.8.1 界面尚不知道 baseActive，不能拿它显示新建的有时点关系。回退应使用本批保留的「旧布局＋新投影」兼容构建及本批业务引擎，不回退作品数据。完整作品恢复仍走带预览的恢复入口。
