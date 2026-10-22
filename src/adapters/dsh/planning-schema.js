import { PLANNING_OPERATIONS } from '../../contracts/planning.ts';

// Keep the canonical shape visible to the model. Extra fields remain allowed
// for read actions and the narrowly supported legacy operation spellings.
export const planningArgsSchema = {
  type:'object',additionalProperties:true,
  description:'使用本会话绑定的小说。读取/续接用 nodeId；apply 内用 operations:[{op,id,expectedRevision,value}]，id/版本与 op 同层。',
  properties:{
    operation:{type:'object',additionalProperties:true,description:'V3.1 story.apply 的单次操作；type 为 card.create/card.update/card.delete/move/relation.save 等。更新须对象 expectedRevision；最外层 expectedRevision 为 story.get 返回的工作区版本。'},
    requestId:{type:'string',description:'一次修改的唯一请求标识，重试同一请求保持不变'},
    nodeId:{type:'string',description:'planning.get/continue 的节点 ID'},
    expectedRevision:{type:'integer',description:'continue 或页面/分组更新所读取的版本'},
    operations:{type:'array',description:'planning.apply 的 1–200 条操作，整批一起成功或失败',items:{
      type:'object',additionalProperties:true,properties:{
        op:{type:'string',enum:PLANNING_OPERATIONS,description:'操作名'},
        id:{type:'string',description:'更新/删除对象的真实 ID，与 op 同层'},
        expectedRevision:{type:'integer',description:'更新/删除对象的已读取版本，与 op 同层'},
        ref:{type:'string',description:'新对象的临时名字，本次后续操作直接用此字符串引用'},
        value:{type:'object',additionalProperties:true,description:'要保存的字段；连线用 {from,to}，位置用 position:{x,y} 数值'},
        confirm:{type:'boolean',description:'删除操作须明确为 true'},
        childPolicy:{type:'string',enum:['detach','subtree'],description:'有下级节点时保留下级或删除子树'},
      },
    }},
  },
};
