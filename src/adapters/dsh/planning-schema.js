// Public AI schema follows TOOL_ACTIONS.moji_plan (story.get/story.apply).
// Internal legacy readers are not a supported AI write protocol.
export const planningArgsSchema = {
  type:'object',additionalProperties:true,
  description:'使用本会话绑定的小说。story.get 读取 state、sources 和历史摘要。story.apply 每次提交单个 operation，最外层 expectedRevision 使用 state.revision；不是旧版 operations 批量事务。',
  properties:{
    requestId:{type:'string',description:'一次修改的唯一请求标识；结果不明时重试同一请求必须保留原参数与标识'},
    reason:{type:'string',description:'本次修改的原因'},
    expectedRevision:{type:'integer',description:'story.get 返回的工作区 state.revision；每次修改都需提供'},
    operation:{type:'object',additionalProperties:true,description:'单次剧情操作。返回完整 state；新对象 ID 从返回结果取得，不支持临时 ref/mapping。',properties:{
      type:{type:'string',description:'如 card.create/card.update/card.delete/move/precedence/page.create/instance.add/instance.remove/instance.layout；其他操作按当前工作区合同使用'},
      id:{type:'string',description:'card.update/delete 的真实卡片 ID'},
      expectedRevision:{type:'integer',description:'card.update 的卡片 revision，不是工作区 revision'},
      value:{type:'object',additionalProperties:true,description:'剧情卡字段，如 title/summary/content/status/cast/scope/evidence/time/points；更新只提交变更字段'},
      pageId:{type:'string',description:'读取到的真实页面 ID；不是 null 或临时 ref'},
      ref:{type:'string',description:'已有对象引用，形如 card:ID/chapter:ID/volume:ID'},
      refs:{type:'array',items:{type:'string'},description:'move 的已有对象引用列表'},
      parent:{type:'string',description:'包含目标对象引用，顶层为 root'},
      before:{type:'string',description:'同级前置锚点引用；与 after 二选一'},
      after:{type:'string',description:'同级后置锚点引用；与 before 二选一'},
      from:{type:'string',description:'precedence 起点对象引用'},
      to:{type:'string',description:'precedence 终点对象引用'},
      remove:{type:'boolean',description:'precedence 为 true 时移除该先后关系'},
      name:{type:'string',description:'新页面名称'},
      position:{type:'object',additionalProperties:false,properties:{x:{type:'number'},y:{type:'number'}},description:'新增展示坐标，不改变已有布局'},
    }},
  },
};
