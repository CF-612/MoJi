import { PLANNING_OPERATIONS } from "../../contracts/planning.js";
const planningArgsSchema = {
  type: "object",
  additionalProperties: true,
  description: "\u4F7F\u7528\u672C\u4F1A\u8BDD\u7ED1\u5B9A\u7684\u5C0F\u8BF4\u3002\u8BFB\u53D6/\u7EED\u63A5\u7528 nodeId\uFF1Bapply \u5185\u7528 operations:[{op,id,expectedRevision,value}]\uFF0Cid/\u7248\u672C\u4E0E op \u540C\u5C42\u3002",
  properties: {
    requestId: { type: "string", description: "\u4E00\u6B21\u4FEE\u6539\u7684\u552F\u4E00\u8BF7\u6C42\u6807\u8BC6\uFF0C\u91CD\u8BD5\u540C\u4E00\u8BF7\u6C42\u4FDD\u6301\u4E0D\u53D8" },
    nodeId: { type: "string", description: "planning.get/continue \u7684\u8282\u70B9 ID" },
    expectedRevision: { type: "integer", description: "continue \u6216\u9875\u9762/\u5206\u7EC4\u66F4\u65B0\u6240\u8BFB\u53D6\u7684\u7248\u672C" },
    operations: { type: "array", description: "planning.apply \u7684 1\u2013200 \u6761\u64CD\u4F5C\uFF0C\u6574\u6279\u4E00\u8D77\u6210\u529F\u6216\u5931\u8D25", items: {
      type: "object",
      additionalProperties: true,
      properties: {
        op: { type: "string", enum: PLANNING_OPERATIONS, description: "\u64CD\u4F5C\u540D" },
        id: { type: "string", description: "\u66F4\u65B0/\u5220\u9664\u5BF9\u8C61\u7684\u771F\u5B9E ID\uFF0C\u4E0E op \u540C\u5C42" },
        expectedRevision: { type: "integer", description: "\u66F4\u65B0/\u5220\u9664\u5BF9\u8C61\u7684\u5DF2\u8BFB\u53D6\u7248\u672C\uFF0C\u4E0E op \u540C\u5C42" },
        ref: { type: "string", description: "\u65B0\u5BF9\u8C61\u7684\u4E34\u65F6\u540D\u5B57\uFF0C\u672C\u6B21\u540E\u7EED\u64CD\u4F5C\u76F4\u63A5\u7528\u6B64\u5B57\u7B26\u4E32\u5F15\u7528" },
        value: { type: "object", additionalProperties: true, description: "\u8981\u4FDD\u5B58\u7684\u5B57\u6BB5\uFF1B\u8FDE\u7EBF\u7528 {from,to}\uFF0C\u4F4D\u7F6E\u7528 position:{x,y} \u6570\u503C" },
        confirm: { type: "boolean", description: "\u5220\u9664\u64CD\u4F5C\u987B\u660E\u786E\u4E3A true" },
        childPolicy: { type: "string", enum: ["detach", "subtree"], description: "\u6709\u4E0B\u7EA7\u8282\u70B9\u65F6\u4FDD\u7559\u4E0B\u7EA7\u6216\u5220\u9664\u5B50\u6811" }
      }
    } }
  }
};
export {
  planningArgsSchema
};
