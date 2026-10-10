import { randomUUID } from "node:crypto";
const fail = (code, message) => {
  throw Object.assign(new Error(message), { code });
};
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value, empty = false) => typeof value === "string" && (empty || !!value.trim()) ? value : fail("INVALID_INPUT", "\u5206\u7EC4\u540D\u79F0\u4E0E\u63CF\u8FF0\u5FC5\u987B\u662F\u6587\u672C\uFF0C\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
const touch = (value) => {
  value.revision++;
  value.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
};
const check = (value, revision) => {
  if (!Number.isSafeInteger(revision)) fail("REVISION_REQUIRED", "\u8BF7\u63D0\u4F9B\u8BFB\u53D6\u5230\u7684 expectedRevision");
  if (value.revision !== revision) fail("CONFLICT", "\u8D44\u6599\u6216\u5206\u7EC4\u5DF2\u7ECF\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6");
};
function groupId(novel, value) {
  if (value === null || value === void 0) return null;
  if (typeof value !== "string" || !Object.hasOwn(novel.memoryGroups || {}, value)) return fail("INVALID_INPUT", "\u8D44\u6599\u5206\u7EC4\u4E0D\u5B58\u5728");
  return value;
}
function validateMemoryGroups(novel) {
  if (novel.memoryGroups !== void 0 && !isRecord(novel.memoryGroups)) fail("INVALID_BACKUP", "\u8D44\u6599\u5206\u7EC4\u683C\u5F0F\u65E0\u6548");
  for (const [id, value] of Object.entries(novel.memoryGroups || {})) {
    if (!isRecord(value) || id !== value.id || !Number.isSafeInteger(value.revision) || value.revision < 1 || typeof value.name !== "string" || !value.name.trim() || typeof value.summary !== "string") fail("INVALID_BACKUP", "\u8D44\u6599\u5206\u7EC4\u65E0\u6548");
  }
  for (const member of Object.values(novel.nodes)) groupId(novel, member.groupId);
}
function memoryGroupAction(novel, action, args) {
  const groups = novel.memoryGroups || {};
  if (action === "graph.groups") return Object.values(groups);
  if (action === "graph.move") {
    const target = groupId(novel, args.groupId);
    if (!Array.isArray(args.members) || !args.members.length || args.members.length > 200) return fail("INVALID_INPUT", "\u8BF7\u9009\u62E9 1\u2013200 \u6761\u8D44\u6599");
    const members = args.members.map((input) => {
      if (!isRecord(input) || typeof input.id !== "string" || !Object.hasOwn(novel.nodes, input.id)) return fail("NOT_FOUND", "\u8D44\u6599\u4E0D\u5B58\u5728");
      const member = novel.nodes[input.id];
      if (member.deleted) fail("DELETED", "\u8D44\u6599\u5DF2\u5220\u9664");
      check(member, input.expectedRevision);
      return member;
    });
    if (new Set(members.map((m) => m.id)).size !== members.length) fail("INVALID_INPUT", "\u79FB\u52A8\u5217\u8868\u4E2D\u6709\u91CD\u590D\u8D44\u6599");
    for (const member of members) {
      member.groupId = target;
      touch(member);
    }
    touch(novel);
    return members.map(({ id, revision, updatedAt, groupId: groupId2 }) => ({ id, revision, updatedAt, groupId: groupId2 }));
  }
  if (action === "graph.group.create") {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const group2 = { id: randomUUID(), revision: 1, name: text(args.name), summary: text(args.summary ?? "", true), createdAt: timestamp, updatedAt: timestamp };
    novel.memoryGroups = groups;
    groups[group2.id] = group2;
    touch(novel);
    return group2;
  }
  if (typeof args.groupId !== "string" || !Object.hasOwn(groups, args.groupId)) return fail("NOT_FOUND", "\u5206\u7EC4\u4E0D\u5B58\u5728");
  const group = groups[args.groupId];
  check(group, args.expectedRevision);
  if (action === "graph.group.update") {
    const name = args.name === void 0 ? group.name : text(args.name);
    const summary = args.summary === void 0 ? group.summary : text(args.summary, true);
    Object.assign(group, { name, summary });
    touch(group);
    touch(novel);
    return group;
  }
  if (action === "graph.group.delete") {
    if (args.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u5206\u7EC4\u9700\u8981\u786E\u8BA4\uFF1B\u8D44\u6599\u5C06\u4FDD\u7559\u5728\u672A\u5206\u7EC4");
    for (const member of Object.values(novel.nodes)) if (member.groupId === group.id) {
      member.groupId = null;
      touch(member);
    }
    delete groups[group.id];
    touch(novel);
    return group;
  }
  return fail("UNKNOWN_ACTION", action);
}
export {
  groupId,
  memoryGroupAction,
  validateMemoryGroups
};
