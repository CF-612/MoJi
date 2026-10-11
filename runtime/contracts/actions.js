const isReadAction = (action) => /\.(get|read|list|groups|pages|decorations|history|search|changes|handoff)$/.test(action);
const changesProse = (action, args) => ["chapter.restore", "chapter.delete"].includes(action) || action === "volume.delete" && args.chapterPolicy === "delete" || ["chapter.create", "chapter.update"].includes(action) && ["content", "append", "patch"].some((key) => args[key] !== void 0);
const TOOL_ACTIONS = Object.freeze({
  cuigengji_project: Object.freeze(["novel.get", "novel.handoff", "volume.list", "volume.create", "volume.update", "volume.delete", "chapter.list", "chapter.search", "chapter.create", "chapter.get", "chapter.update", "chapter.delete", "chapter.history", "chapter.restore"]),
  cuigengji_memory: Object.freeze(["graph.list", "graph.get", "graph.groups", "graph.group.create", "graph.group.update", "graph.group.delete", "graph.move", "graph.layout", "graph.continue", "graph.duplicate", "graph.remove", "graph.create", "graph.update", "graph.delete", "edge.list", "edge.get", "edge.create", "edge.update", "edge.delete", "edge.disconnect"]),
  cuigengji_plan: Object.freeze(["planning.pages", "planning.page.create", "planning.page.update", "planning.page.delete", "planning.decorations", "planning.list", "planning.search", "planning.get", "planning.continue", "planning.groups", "planning.group.create", "planning.group.update", "planning.group.delete", "planning.changes", "planning.history", "planning.apply", "planning.revert"]),
  cuigengji_context: Object.freeze(["context.get", "binding.get", "preset.read"])
});
const MEMORY_ACTIONS = Object.freeze([...TOOL_ACTIONS.cuigengji_memory, "context.get"]);
const HUMAN_ACTIONS = Object.freeze([.../* @__PURE__ */ new Set([
  ...Object.values(TOOL_ACTIONS).flat(),
  "novel.list",
  "novel.create",
  "novel.import",
  "novel.export",
  "novel.update",
  "novel.archive",
  "novel.restore",
  "novel.purge",
  "binding.set",
  "settings.get",
  "legacy.preview",
  "tavern.preview",
  "tavern.import",
  "preset.get",
  "preset.preview",
  "preset.set",
  "chapter.move",
  "workspace.status",
  "workspace.export",
  "workspace.preview",
  "workspace.import",
  "transfer.catalog",
  "transfer.inspect",
  "transfer.preview",
  "transfer.import",
  "transfer.exportPreview",
  "transfer.export",
  "maintenance.status",
  "maintenance.verify"
])]);
export {
  HUMAN_ACTIONS,
  MEMORY_ACTIONS,
  TOOL_ACTIONS,
  changesProse,
  isReadAction
};
